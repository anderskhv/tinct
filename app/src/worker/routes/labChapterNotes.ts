/**
 * POST /api/lab-chapter-notes — the short "beats" card behind Summarize, the
 * chapter-end summary and Primer (they used to stream a chat answer).
 *
 * The client names only the book, edition, chapter, kind and (for "so far")
 * the reader's paragraph. The Worker fetches the text itself, asks the model
 * for that kind (CHAPTER_NOTES_MODEL) for 2–4 titled beats as JSON, and caches the result: it depends
 * only on the text, so every reader at the same place shares it. Generation
 * alone is rate-limited and reserved against the signed-out daily AI ceiling,
 * exactly as `/api/lab-catch-up`.
 */
import { COMPANION_MODEL, RECAP_FAST_MODEL } from '../../companionModel'
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
import { allowanceUsedBody } from '../lib/aiAllowance'
import { jsonResponse } from '../lib/responses'
import { createAiMeter, ledgerGuestKey, type LedgerEnv } from '../lib/aiUsage'
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
  /** The AI allowance (lib/aiAllowance.ts): false refuses generation for a signed-in reader whose allowance is used up. */
  allowsAi?: (request: Request) => Promise<boolean>
}

/**
 * In brief and Primer are written once per book, edition and chapter and then
 * served from the cache to every reader, so they use the companion's Sonnet
 * model (Anders, 2026-10-07). "So far" depends on the reader's paragraph, is
 * generated far more often and stays on the fast model.
 */
export const CHAPTER_NOTES_MODEL: Readonly<Record<ChapterNotesKind, string>> = Object.freeze({
  sofar: RECAP_FAST_MODEL,
  end: COMPANION_MODEL,
  primer: COMPANION_MODEL,
})

// Four two-sentence beats run to ~320 output tokens; the margin keeps the JSON
// whole, a little more for Sonnet, whose wording runs slightly longer.
export const CHAPTER_NOTES_MAX_TOKENS: Readonly<Record<ChapterNotesKind, number>> = Object.freeze({
  sofar: 480,
  end: 600,
  primer: 600,
})
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
  // "<chapter> in brief". A list of "X is recorded" beats is accurate and
  // dull (Anders on Nehemiah 12, 2026-10-07): each beat says what happens and
  // then points to one thing in the text worth seeing. Prompt v3 was tested on
  // Haiku and Sonnet; its example comes from no real book so it cannot leak
  // into a card. Same JSON shape as the other kinds. Changing this text means
  // bumping CHAPTER_NOTES_PROMPT_VERSIONS.end.
  end: [
    'You write a short card summing up a whole chapter for a reader, who may be anywhere in it.',
    'Give three or four beats, in order, covering the whole chapter below. Nothing from later chapters. Mention an earlier part of the book only when you are certain of it.',
    'Never more than four beats.',
    SHARED_RULES[0],
    'Each title is two to five words naming what is particular to that beat: a person, place, act or object from the text. Never a generic label such as "Priests Listed", "Records Kept" or "Dedication Prepared". No quotation marks inside titles.',
    'Each text is two plain sentences in the present tense, at most 40 words together. The first says what happens. The second points out one specific thing in the text a reader would not get from a table of contents: a telling detail, a surprising number or name, a tension, an irony, something left out, an unusual order, or an echo of something earlier.',
    'Ground every observation in this chapter\'s own words, names, numbers or sequence. Do not invent facts, motives or symbolism.',
    'State only facts the text gives; when unsure of a name or number, leave it out.',
    'Never use the verbs list, record, document, establish or detail to describe the text; say what the text actually shows.',
    'For genealogies, rolls and other lists, the interesting thing is in the specifics: whose line runs longest, who is singled out, what the list\'s order or endpoint reveals, a name that recurs.',
    'Write declaratively. No praise, no advice, no morals or aphorisms, no "we" or "us", no rhetorical questions, no balanced flourishes such as "not X but Y".',
    'Example beat (from a different book, for tone only): {"title":"The Letter in the Drawer","text":"Anna finds her husband\'s unsent letter while looking for string. It is dated the morning of their wedding, and the only word crossed out is her name."}',
  ].join('\n'),
  // Two beats since 2026-10-07 (the "And" beat is gone): where the story
  // stands, then one or two concrete things to watch for, in the In brief
  // voice and strictly spoiler-free. Bump CHAPTER_NOTES_PROMPT_VERSIONS.primer
  // when this changes.
  primer: [
    'You write a spoiler-free primer a reader sees before starting a chapter.',
    'Give exactly two beats, in this order. Never more than two beats.',
    'The first is titled "Where we are" and says, from the PREVIOUS chapter only, where the story stands. If there is no previous chapter, it says where the book opens, from the coming chapter\'s first lines only.',
    'The second is titled "Watch for" and gives one or two concrete pointers for the coming chapter: a person, object, place or question to keep an eye on, named specifically.',
    'Strictly spoiler-free: never state or hint at any event, outcome, turn or discovery in the coming chapter. Point at what to notice, never at what happens to it. For example (from a different book, for tone only), write "Watch the borrowed umbrella Anna leaves by the door", never "The umbrella\'s importance is revealed".',
    'Answer with JSON only, no prose around it: {"beats":[{"title":"Where we are","text":"…"},{"title":"Watch for","text":"…"}]}.',
    'Each text is one or two plain sentences in the present tense, at most 40 words.',
    'Ground both beats in the text given. Do not invent meaning, motives or symbolism.',
    'State only facts the text gives; when unsure of a name or number, leave it out.',
    'Never use the verbs list, record, document, establish, detail, reveal or examine to describe the text; say what the text actually shows.',
    'Write declaratively. No praise, no advice, no morals or aphorisms, no "we" or "us" in the text, no rhetorical questions, no balanced flourishes such as "not X but Y".',
    'For non-narrative text (proverbs, letters, essays, laws, poems) say where the argument or sequence stands, and what in the coming chapter to keep an eye on.',
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
  const model = CHAPTER_NOTES_MODEL[parsed.kind]
  const maxTokens = CHAPTER_NOTES_MAX_TOKENS[parsed.kind]
  const estimate = estimateAiCostMicros({ inputChars: system.length + content.length, maxTokens })
  // Cached and prepared entries above cost nothing and are always served.
  if (deps.allowsAi && !await deps.allowsAi(request)) return jsonResponse(allowanceUsedBody(), 402, request)
  if (!deps.reserveGuestSpend || !await deps.reserveGuestSpend(estimate)) return jsonResponse(aiRestingBody(), 503, request)
  const meter = createAiMeter(env, ctx, {
    guest: ledgerGuestKey(request),
    resolveUser: deps.resolveUser ? () => deps.resolveUser!(request) : undefined,
  }, { feature: 'chapter_notes', bookId: parsed.bookId, model })
  try {
    const response = await (deps.fetchAnthropic ?? defaultFetchAnthropic)({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content }],
      // Sonnet takes its depth from effort (as labRecap's summaries); Haiku takes none.
      ...(model === RECAP_FAST_MODEL ? {} : { output_config: { effort: 'low' as const } }),
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
