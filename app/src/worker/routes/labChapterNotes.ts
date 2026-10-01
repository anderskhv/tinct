/**
 * POST /api/lab-chapter-notes — the short "beats" card behind Summarize, the
 * chapter-end summary and Primer (they used to stream a chat answer).
 *
 * The client names only the book, edition, chapter, kind and (for "so far")
 * the reader's paragraph. The Worker fetches the text itself, asks the fast
 * recap model for 2–4 titled beats as JSON, and caches the result: it depends
 * only on the text, so every reader at the same place shares it. Generation
 * alone is rate-limited and reserved against the signed-out daily AI ceiling,
 * exactly as `/api/lab-catch-up`.
 */
import { RECAP_FAST_MODEL } from '../../companionModel'
import { recapCoverageThrough } from '../../recapSummary'
import {
  CHAPTER_NOTES_CACHE_TTL_SECONDS,
  CHAPTER_NOTES_ROUTE,
  chapterNotesCacheKey,
  parseChapterNotesBeats,
  type ChapterNotesKind,
  type ChapterNotesResponse,
} from '../../chapterNotes'
import { createBookRetrieval, parseBookRef, type AssetsBinding, type BookRetrieval, type ChapterText } from '../lib/bookRetrieval'
import { aiRestingBody, estimateAiCostMicros, type ReserveGuestSpend } from '../lib/aiSpend'
import { jsonResponse } from '../lib/responses'
import { createAiMeter, requestGuestKey, type LedgerEnv } from '../lib/aiUsage'
import type { RecapCache } from './labRecap'

export type LabChapterNotesEnv = LedgerEnv & {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  ASSETS?: AssetsBinding
}

type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export interface LabChapterNotesDeps {
  cache?: RecapCache | null
  fetchAnthropic?: (payload: Record<string, unknown>, apiKey: string) => Promise<Response>
  createRetrieval?: typeof createBookRetrieval
  reserveGuestSpend?: ReserveGuestSpend
  resolveUser?: (request: Request) => Promise<string | null>
}

export const CHAPTER_NOTES_MAX_TOKENS = 400
export const CHAPTER_NOTES_MAX_PASSAGE_CHARS = 28_000
export const CHAPTER_NOTES_LOOKUP_RATE_LIMIT_PER_MINUTE = 60
export const CHAPTER_NOTES_GENERATE_RATE_LIMIT_PER_MINUTE = 10
const MAX_BODY_BYTES = 2_048
const MAX_TITLE_CHARS = 120
const MAX_PARAGRAPH_INDEX = 100_000

const SHARED_RULES = [
  'Answer with JSON only, no prose around it: {"beats":[{"title":"…","text":"…"}]}.',
  'Each title is two to five words. Each text is one or two plain declarative sentences in the present tense, at most 30 words.',
  'Use only the text given. No praise, no interpretation, no advice, no quotation marks inside titles.',
  'For non-narrative text (proverbs, letters, essays, laws, poems) give the main points instead of events.',
]

export const CHAPTER_NOTES_SYSTEM: Record<ChapterNotesKind, string> = {
  sofar: [
    'You write a short "so far" card for a reader part-way through a chapter.',
    'Give two to four beats, in order, covering the passage below. It ends exactly where the reader stopped: nothing beyond it, no outcomes, no foreshadowing, nothing you know about this book from elsewhere.',
    ...SHARED_RULES,
  ].join('\n'),
  end: [
    'You write a short card summing up a chapter the reader has just finished.',
    'Give three or four beats, in order, covering the whole chapter below. Nothing beyond this chapter and nothing you know about the book from elsewhere.',
    ...SHARED_RULES,
  ].join('\n'),
  primer: [
    'You write a spoiler-free primer a reader sees before starting a chapter.',
    'Give exactly two or three beats. The first is titled "Where we are" and says, from the PREVIOUS chapter only, where the story stands. The next are titled "Watch for" and, if there is one, "And": what to notice in the coming chapter — themes, people introduced, questions raised — without revealing any event, outcome or turn from it.',
    ...SHARED_RULES,
  ].join('\n'),
}

export interface ParsedChapterNotesRequest {
  bookId: string
  editionKey: string
  chapterNumber: number
  kind: ChapterNotesKind
  paragraphIndex: number
  bookTitle: string | null
}

export function parseChapterNotesRequest(raw: unknown): ParsedChapterNotesRequest | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const book = parseBookRef({ bookId: value.bookId, editionKey: value.editionKey, chapterNumber: value.chapterNumber })
  if (!book || book.chapterNumber === undefined) return null
  const kind = value.kind
  if (kind !== 'sofar' && kind !== 'end' && kind !== 'primer') return null
  const paragraph = value.paragraphIndex
  const paragraphIndex = kind === 'sofar'
    ? (typeof paragraph === 'number' && Number.isInteger(paragraph) && paragraph >= 0 && paragraph <= MAX_PARAGRAPH_INDEX ? paragraph : -1)
    : 0
  if (paragraphIndex < 0) return null
  const bookTitle = typeof value.bookTitle === 'string' && value.bookTitle.trim() ? value.bookTitle.trim().slice(0, MAX_TITLE_CHARS) : null
  return { bookId: book.bookId, editionKey: book.editionKey, chapterNumber: book.chapterNumber, kind, paragraphIndex, bookTitle }
}

function cleanParagraph(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sample(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const marker = ' […] '
  const head = Math.floor((maxChars - marker.length) * 0.5)
  return `${text.slice(0, head).trimEnd()}${marker}${text.slice(text.length - (maxChars - marker.length - head)).trimStart()}`
}

function chapterBody(chapter: ChapterText, through?: number, maxChars = CHAPTER_NOTES_MAX_PASSAGE_CHARS): string {
  const paragraphs = through === undefined ? chapter.paragraphs : chapter.paragraphs.slice(0, through + 1)
  return `${chapter.title}\n\n${sample(paragraphs.map(cleanParagraph).filter(Boolean).join('\n\n'), maxChars)}`
}

async function defaultFetchAnthropic(payload: Record<string, unknown>, apiKey: string): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(payload),
  })
}

function defaultCache(): RecapCache | null {
  return (globalThis as { caches?: { default?: RecapCache } }).caches?.default ?? null
}

function labGuestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'lab-guest'
}

type AnthropicMessage = { content?: Array<{ type?: string; text?: string }>; stop_reason?: string; usage?: { input_tokens?: number; output_tokens?: number } }

export async function handleLabChapterNotes(
  request: Request,
  env: LabChapterNotesEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
  deps: LabChapterNotesDeps = {},
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey || !env.ASSETS) return jsonResponse({ error: 'Service unavailable' }, 503, request)
  if (parseInt(request.headers.get('content-length') || '0', 10) > MAX_BODY_BYTES) return jsonResponse({ error: 'Request too large' }, 413, request)
  let parsed: ParsedChapterNotesRequest | null
  try { parsed = parseChapterNotesRequest(await request.json()) } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  if (!parsed) return jsonResponse({ error: 'Invalid chapter notes request' }, 400, request)

  const ip = labGuestIp(request)
  if (!await checkRateLimit(`lab-chapter-notes:${ip}`, env.RATE_LIMIT, CHAPTER_NOTES_LOOKUP_RATE_LIMIT_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  const origin = new URL(request.url).origin
  const retrieval: BookRetrieval = (deps.createRetrieval ?? createBookRetrieval)({
    assets: env.ASSETS, origin, book: { bookId: parsed.bookId, editionKey: parsed.editionKey, chapterNumber: parsed.chapterNumber },
  })
  const chapter = await retrieval.chapterText(parsed.chapterNumber)
  if (!chapter || chapter.paragraphs.length === 0) return jsonResponse({ error: 'Chapter not available' }, 404, request)
  // "So far" positions that cover the same text share one entry.
  const through = parsed.kind === 'sofar'
    ? recapCoverageThrough({ paragraphIndex: parsed.paragraphIndex, paragraphCount: chapter.paragraphs.length, completed: false })
    : null
  const respond = (beats: ChapterNotesResponse['beats'], source: ChapterNotesResponse['source']) => jsonResponse({
    beats, kind: parsed!.kind, chapterNumber: parsed!.chapterNumber, through, source,
  } satisfies ChapterNotesResponse, 200, request)

  const cache = deps.cache === undefined ? defaultCache() : deps.cache
  const cacheKey = new Request(`${origin}/__lab-chapter-notes/${chapterNotesCacheKey({ ...parsed, through })}`)
  if (cache) {
    try {
      const hit = await cache.match(cacheKey)
      if (hit) {
        const beats = parseChapterNotesBeats(await hit.json())
        if (beats) return respond(beats, 'cache')
      }
    } catch { /* a cache failure is never a user-facing failure */ }
  }

  if (!await checkRateLimit(`lab-chapter-notes-model:${ip}`, env.RATE_LIMIT, CHAPTER_NOTES_GENERATE_RATE_LIMIT_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }
  let passage: string
  if (parsed.kind === 'primer') {
    const previous = parsed.chapterNumber > 1 ? await retrieval.chapterText(parsed.chapterNumber - 1) : null
    passage = [
      previous ? `PREVIOUS CHAPTER (what the reader has read):\n\n${chapterBody(previous, undefined, 12_000)}` : 'PREVIOUS CHAPTER: none — this is the opening.',
      `COMING CHAPTER (not yet read — never reveal its events):\n\n${chapterBody(chapter, undefined, 14_000)}`,
    ].join('\n\n')
  } else {
    passage = chapterBody(chapter, through ?? undefined)
  }
  const where = parsed.bookTitle ? `${parsed.bookTitle}, ${chapter.title}` : chapter.title
  const content = `Location: ${where}.\n\n${passage}\n\nWrite the card as JSON.`
  const system = CHAPTER_NOTES_SYSTEM[parsed.kind]
  const estimate = estimateAiCostMicros({ inputChars: system.length + content.length, maxTokens: CHAPTER_NOTES_MAX_TOKENS })
  if (!deps.reserveGuestSpend || !await deps.reserveGuestSpend(estimate)) return jsonResponse(aiRestingBody(), 503, request)
  const meter = createAiMeter(env, ctx, {
    guest: requestGuestKey(request),
    resolveUser: deps.resolveUser ? () => deps.resolveUser!(request) : undefined,
  }, { feature: 'recap', bookId: parsed.bookId, model: RECAP_FAST_MODEL })
  try {
    const response = await (deps.fetchAnthropic ?? defaultFetchAnthropic)({
      model: RECAP_FAST_MODEL,
      max_tokens: CHAPTER_NOTES_MAX_TOKENS,
      system,
      messages: [{ role: 'user', content }],
    }, apiKey)
    if (!response.ok) {
      if (response.status === 402 || response.status === 429) return jsonResponse(aiRestingBody(), 503, request)
      return jsonResponse({ error: 'Notes unavailable' }, 502, request)
    }
    const message = await response.json() as AnthropicMessage
    meter.anthropic(message.usage)
    const text = message.stop_reason === 'refusal' ? '' : (message.content ?? []).filter(block => block?.type === 'text').map(block => block.text ?? '').join('')
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    let beats: ChapterNotesResponse['beats'] | null = null
    try { beats = parseChapterNotesBeats(JSON.parse(json)) } catch { beats = null }
    if (!beats) return jsonResponse({ error: 'Notes unavailable' }, 502, request)
    if (cache) {
      const stored = new Response(JSON.stringify({ beats }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CHAPTER_NOTES_CACHE_TTL_SECONDS}` } })
      ctx.waitUntil(cache.put(cacheKey, stored).catch(() => {}))
    }
    return respond(beats, 'model')
  } catch {
    return jsonResponse({ error: 'Notes unavailable' }, 502, request)
  }
}

export { CHAPTER_NOTES_ROUTE }
