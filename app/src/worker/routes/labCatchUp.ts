/**
 * POST /api/lab-catch-up — one entry of the reader's "Catch me up" timeline.
 *
 * Modelled on `/api/lab-recap`. The client names only the book, the edition,
 * the unit (a biblical book, a part, a chapter; see `catchUp.ts`) and, for
 * the unit the reader is still in, the last chapter to cover. The Worker
 * derives the units from the edition's own manifest, fetches the text itself
 * through the static asset binding — the client never sends text — and asks
 * the companion model for two or three plain sentences.
 *
 * A passed unit's recap is the same for every reader, so the lookup is:
 *   1. a pre-written static file for the edition (`catchUpStaticPath`), when
 *      one ships — none does yet; a missing file is a quiet miss;
 *   2. the Cloudflare Cache API, keyed by book/edition/unit/through/prompt
 *      version, for 30 days;
 *   3. generation, which alone is rate-limited per IP and reserved against
 *      the signed-out daily AI ceiling, exactly as `/api/lab-recap`.
 */
import { COMPANION_MODEL } from '../../companionModel'
import {
  CATCH_UP_CACHE_TTL_SECONDS,
  CATCH_UP_PROMPT_VERSION,
  CATCH_UP_ROUTE,
  CATCH_UP_UNIT_ID_PATTERN,
  catchUpCacheKey,
  catchUpStaticKey,
  catchUpStaticPath,
  catchUpUnits,
  type CatchUpResponse,
  type CatchUpUnit,
} from '../../catchUp'
import type { Section } from '../../types'
import { createBookRetrieval, parseBookRef, type AssetsBinding, type BookRetrieval, type ChapterText } from '../lib/bookRetrieval'
import { aiRestingBody, estimateAiCostMicros, type ReserveGuestSpend } from '../lib/aiSpend'
import { jsonResponse } from '../lib/responses'
import type { RecapCache } from './labRecap'

export type LabCatchUpEnv = {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  ASSETS?: AssetsBinding
}

type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export interface LabCatchUpDeps {
  cache?: RecapCache | null
  /** Anthropic transport; defaults to fetch. */
  fetchAnthropic?: (payload: Record<string, unknown>, apiKey: string) => Promise<Response>
  createRetrieval?: typeof createBookRetrieval
  /** Daily ceiling for signed-out AI. Absent = refused (fail closed). */
  reserveGuestSpend?: ReserveGuestSpend
}

export const CATCH_UP_MAX_TOKENS = 220
/** About 8K tokens of source per entry; long units are sampled evenly across their chapters. */
export const CATCH_UP_MAX_PASSAGE_CHARS = 32_000
/** Every request, cached or not: a long timeline is many cheap lookups. */
export const CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE = 120
/** Requests that reach the model, per IP per minute. */
export const CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE = 12
const MAX_BODY_BYTES = 4_096
const MAX_TITLE_CHARS = 120
const MAX_CHAPTER_NUMBER = 10_000

export const CATCH_UP_SYSTEM_PROMPT = [
  'You write one entry in a "catch me up" timeline that a returning reader scrolls before they continue a book.',
  'Summarise the passage below in two or three plain declarative sentences in the present tense, at most 70 words in all.',
  'Use only the passage. Do not go beyond it: no later events, no outcomes, no foreshadowing, and nothing you know about this book from elsewhere. The passage ends where the reader has read to.',
  'A long passage is sampled: parts of each chapter are left out. Cover the whole span evenly, not only its opening.',
  'For non-narrative text (proverbs, letters, essays, laws, poems) state the main points instead of events.',
  'No praise, no interpretation, no advice, no preamble, no headings, no bullet points, and no quotation marks around the answer.',
].join('\n')

function labGuestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}

export interface ParsedCatchUpRequest {
  bookId: string
  editionKey: string
  unitId: string
  throughChapter: number | null
  bookTitle: string | null
}

/** Validate the body; malformed input is a 400, never a fetch or a model call. */
export function parseCatchUpRequest(raw: unknown): ParsedCatchUpRequest | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const book = parseBookRef({ bookId: value.bookId, editionKey: value.editionKey })
  if (!book) return null
  if (typeof value.unitId !== 'string' || !CATCH_UP_UNIT_ID_PATTERN.test(value.unitId)) return null
  const through = value.throughChapter
  if (through !== undefined && through !== null
    && (typeof through !== 'number' || !Number.isInteger(through) || through < 1 || through > MAX_CHAPTER_NUMBER)) return null
  const bookTitle = typeof value.bookTitle === 'string' && value.bookTitle.trim() ? value.bookTitle.trim().slice(0, MAX_TITLE_CHARS) : null
  return { bookId: book.bookId, editionKey: book.editionKey, unitId: value.unitId, throughChapter: typeof through === 'number' ? through : null, bookTitle }
}

/**
 * The chapters an entry covers: the whole unit, or — for the unit the reader
 * is in — its chapters up to and including `throughChapter`. Null when the
 * through chapter is not in the unit.
 */
export function catchUpCoverage(unit: CatchUpUnit, throughChapter: number | null): { chapters: number[]; complete: boolean } | null {
  if (throughChapter === null) return { chapters: unit.chapters, complete: true }
  const at = unit.chapters.indexOf(throughChapter)
  if (at < 0) return null
  return { chapters: unit.chapters.slice(0, at + 1), complete: at === unit.chapters.length - 1 }
}

function cleanParagraph(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Opening and closing of a text within `maxChars`, the middle marked as left out. */
function sample(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const marker = ' […] '
  const head = Math.max(0, Math.floor((maxChars - marker.length) * 0.6))
  const tail = Math.max(0, maxChars - marker.length - head)
  return `${text.slice(0, head).trimEnd()}${marker}${text.slice(text.length - tail).trimStart()}`
}

/** The text the model sees: every covered chapter, each given an even share of the budget. */
export function buildCatchUpPassage(chapters: ChapterText[], maxChars = CATCH_UP_MAX_PASSAGE_CHARS): string {
  if (!chapters.length) return ''
  const share = Math.max(200, Math.floor(maxChars / chapters.length) - 40)
  return chapters
    .map(chapter => `${chapter.title}\n\n${sample(chapter.paragraphs.map(cleanParagraph).filter(Boolean).join('\n\n'), share)}`)
    .join('\n\n')
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

type AnthropicMessage = {
  content?: Array<{ type?: string; text?: string }>
  stop_reason?: string
  model?: string
  usage?: { input_tokens?: number; output_tokens?: number }
}

function textOf(message: AnthropicMessage): string {
  return Array.isArray(message.content)
    ? message.content.filter(block => block?.type === 'text' && typeof block.text === 'string').map(block => block.text!.trim()).filter(Boolean).join('\n').trim()
    : ''
}

/**
 * A pre-written recap, when the edition ships a static file:
 * `{ "version": 1, "units": { "<unitId>" | "<unitId>@<chapter>": { "summary": "…" } } }`.
 * Any failure is a miss.
 */
async function staticSummary(assets: AssetsBinding, origin: string, parsed: ParsedCatchUpRequest): Promise<string | null> {
  try {
    const response = await assets.fetch(new Request(new URL(catchUpStaticPath(parsed.bookId, parsed.editionKey), origin)))
    if (!response.ok) return null
    const data = await response.json() as { units?: Record<string, { summary?: unknown }> } | null
    const summary = data?.units?.[catchUpStaticKey(parsed)]?.summary
    return typeof summary === 'string' && summary.trim() ? summary.trim() : null
  } catch {
    return null
  }
}

export async function handleLabCatchUp(
  request: Request,
  env: LabCatchUpEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
  deps: LabCatchUpDeps = {},
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey || !env.ASSETS) return jsonResponse({ error: 'Service unavailable' }, 503, request)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_BODY_BYTES) return jsonResponse({ error: 'Request too large' }, 413, request)

  let parsed: ParsedCatchUpRequest | null
  try {
    parsed = parseCatchUpRequest(await request.json())
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request)
  }
  if (!parsed) return jsonResponse({ error: 'Invalid catch-up request' }, 400, request)

  const ip = labGuestIp(request)
  if (!await checkRateLimit(`lab-catch-up:${ip}`, env.RATE_LIMIT, CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  const origin = new URL(request.url).origin
  const retrieval: BookRetrieval = (deps.createRetrieval ?? createBookRetrieval)({
    assets: env.ASSETS,
    origin,
    book: { bookId: parsed.bookId, editionKey: parsed.editionKey },
  })
  const index = await retrieval.editionIndex()
  if (!index || index.chapters.length === 0) return jsonResponse({ error: 'Edition not available' }, 404, request)
  const units = catchUpUnits({ title: parsed.bookTitle ?? parsed.bookId, chapters: index.chapters, sections: index.sections as Section[] | undefined, bible: parsed.bookId === 'bible' })
  const unit = units.find(item => item.id === parsed!.unitId)
  if (!unit) return jsonResponse({ error: 'Unknown unit' }, 400, request)
  const coverage = catchUpCoverage(unit, parsed.throughChapter)
  if (!coverage) return jsonResponse({ error: 'Chapter not in unit' }, 400, request)
  // A through chapter that ends the unit is the whole unit: one entry, one cache key.
  const throughChapter = coverage.complete ? null : parsed.throughChapter
  const respond = (summary: string, source: CatchUpResponse['source']) => jsonResponse({
    summary, unitId: unit.id, title: unit.title, chapters: coverage.chapters, complete: coverage.complete, version: CATCH_UP_PROMPT_VERSION, source,
  } satisfies CatchUpResponse, 200, request)

  const prewritten = await staticSummary(env.ASSETS, origin, { ...parsed, throughChapter })
  if (prewritten) return respond(prewritten, 'static')

  const cache = deps.cache === undefined ? defaultCache() : deps.cache
  const cacheKey = new Request(`${origin}/__lab-catch-up/${catchUpCacheKey({ ...parsed, throughChapter })}`)
  if (cache) {
    try {
      const hit = await cache.match(cacheKey)
      if (hit) {
        const stored = await hit.json() as { summary?: unknown }
        if (typeof stored.summary === 'string' && stored.summary) return respond(stored.summary, 'cache')
      }
    } catch { /* a cache failure is never a user-facing failure */ }
  }

  if (!await checkRateLimit(`lab-catch-up-model:${ip}`, env.RATE_LIMIT, CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }
  const texts = (await retrieval.chaptersText(coverage.chapters)).filter((chapter): chapter is ChapterText => !!chapter && chapter.paragraphs.length > 0)
  if (!texts.length) return jsonResponse({ error: 'Chapter not available' }, 404, request)
  const passage = buildCatchUpPassage(texts)
  const where = parsed.bookTitle ? `${parsed.bookTitle}, ${unit.title}` : unit.title
  const status = coverage.complete
    ? `The reader has read all of ${unit.title}.`
    : `The reader is part-way through ${unit.title}; the passage ends with the last chapter they finished.`
  const content = `Location: ${where}. ${status}\n\nPassage:\n\n${passage}\n\nWrite the catch-up entry.`
  const estimate = estimateAiCostMicros({ inputChars: CATCH_UP_SYSTEM_PROMPT.length + content.length, maxTokens: CATCH_UP_MAX_TOKENS })
  if (!deps.reserveGuestSpend || !await deps.reserveGuestSpend(estimate)) return jsonResponse(aiRestingBody(), 503, request)
  try {
    const response = await (deps.fetchAnthropic ?? defaultFetchAnthropic)({
      model: COMPANION_MODEL,
      max_tokens: CATCH_UP_MAX_TOKENS,
      system: CATCH_UP_SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      output_config: { effort: 'low' },
    }, apiKey)
    if (!response.ok) {
      if (response.status === 402 || response.status === 429) return jsonResponse(aiRestingBody(), 503, request)
      return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    }
    const message = await response.json() as AnthropicMessage
    const summary = message.stop_reason === 'refusal' ? '' : textOf(message)
    if (!summary) return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    console.log(JSON.stringify({
      event: 'lab_catch_up_usage',
      route: CATCH_UP_ROUTE,
      input_tokens: message.usage?.input_tokens ?? 0,
      output_tokens: message.usage?.output_tokens ?? 0,
    }))
    if (cache) {
      const stored = new Response(JSON.stringify({ summary }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CATCH_UP_CACHE_TTL_SECONDS}` },
      })
      ctx.waitUntil(cache.put(cacheKey, stored).catch(() => {}))
    }
    return respond(summary, 'model')
  } catch {
    return jsonResponse({ error: 'Summary unavailable' }, 502, request)
  }
}
