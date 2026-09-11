/**
 * POST /api/lab-recap — the "so far" summary under the library recap.
 *
 * The client names the reader's exact place (book, edition, chapter,
 * paragraph, finished or not, and optionally the previous chapter when it
 * belongs to the same sitting). The Worker fetches the chapter text itself
 * through the static asset binding — the client never sends text — cuts it
 * at the reader's paragraph, and asks the companion model for ~90 plain
 * declarative words that never go beyond that point.
 *
 * Summaries are cached in the Cloudflare Cache API for 30 days, keyed by
 * book/edition/chapter/scope/paragraph-bucket (see `recapSummary.ts`), so
 * nearby positions and repeat visits cost nothing. No account is required —
 * the lab's anonymous free-action rule is enforced by the client, as for
 * `/api/lab-chat` — and each IP is rate-limited like the lab chat.
 */
import { COMPANION_MODEL } from '../../companionModel'
import {
  LAB_RECAP_ROUTE,
  RECAP_CACHE_TTL_SECONDS,
  RECAP_MAX_PARAGRAPH_INDEX,
  RECAP_PROMPT_VERSION,
  recapCacheKey,
  recapCoverageThrough,
  type LabRecapCoverage,
  type LabRecapRequest,
  type LabRecapResponse,
} from '../../recapSummary'
import { createBookRetrieval, parseBookRef, type AssetsBinding, type BookRetrieval, type ChapterText } from '../lib/bookRetrieval'
import { jsonResponse } from '../lib/responses'

export type LabRecapEnv = {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  ASSETS?: AssetsBinding
}

type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

/** The subset of the Cache API the route uses; injectable for tests. */
export interface RecapCache {
  match(request: Request): Promise<Response | undefined>
  put(request: Request, response: Response): Promise<void>
}

export interface LabRecapDeps {
  cache?: RecapCache | null
  /** Anthropic transport; defaults to fetch. */
  fetchAnthropic?: (payload: Record<string, unknown>, apiKey: string) => Promise<Response>
  createRetrieval?: typeof createBookRetrieval
}

export const RECAP_MAX_TOKENS = 300
/** Roughly 4K tokens: two long chapters at most reach it, and then the middle is elided. */
export const RECAP_MAX_PASSAGE_CHARS = 16_000
const MAX_BODY_BYTES = 4_096
const MAX_TITLE_CHARS = 120
/** Requests per minute per IP; the summary is one call per library visit, so this is generous. */
export const RECAP_RATE_LIMIT_PER_MINUTE = 6

export const RECAP_SYSTEM_PROMPT = [
  'You write the short "so far" line a returning reader sees before they continue a book.',
  'Summarise what has happened in the passage below in about 90 words, never more than 110, as one paragraph of plain declarative English in the present tense.',
  'Use only the passage. Do not go beyond it: no later events, no outcomes, no foreshadowing, and nothing you know about this book from elsewhere. The passage ends exactly where the reader stopped.',
  'For non-narrative text (proverbs, letters, essays, laws) state the main points made so far instead of events.',
  'No praise, no interpretation, no advice, no preamble, no headings, no bullet points, and no quotation marks around the answer.',
].join('\n')

function labGuestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}

export type ParsedRecapRequest = Required<Pick<LabRecapRequest, 'bookId' | 'editionKey' | 'chapterNumber' | 'paragraphIndex' | 'completed'>> & {
  previousChapterNumber: number | null
  bookTitle: string | null
}

/** Validate the body; malformed input is a 400, never a model call. */
export function parseRecapRequest(raw: unknown): ParsedRecapRequest | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const book = parseBookRef({ bookId: value.bookId, editionKey: value.editionKey, chapterNumber: value.chapterNumber })
  if (!book || book.chapterNumber === undefined) return null
  const paragraphIndex = value.paragraphIndex
  if (typeof paragraphIndex !== 'number' || !Number.isInteger(paragraphIndex) || paragraphIndex < 0 || paragraphIndex > RECAP_MAX_PARAGRAPH_INDEX) return null
  const completed = value.completed === true
  const previous = value.previousChapterNumber
  const previousChapterNumber = typeof previous === 'number' && Number.isInteger(previous) && previous >= 1 && previous === book.chapterNumber - 1 ? previous : null
  const bookTitle = typeof value.bookTitle === 'string' && value.bookTitle.trim() ? value.bookTitle.trim().slice(0, MAX_TITLE_CHARS) : null
  return { bookId: book.bookId, editionKey: book.editionKey, chapterNumber: book.chapterNumber, paragraphIndex, completed, previousChapterNumber, bookTitle }
}

function cleanParagraph(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Keep the opening and the most recent part when a passage is too long; the model is told the middle is missing. */
export function elidePassage(text: string, maxChars = RECAP_MAX_PASSAGE_CHARS): string {
  if (text.length <= maxChars) return text
  const marker = '\n\n[… a middle part of the passage is left out …]\n\n'
  const headChars = Math.floor((maxChars - marker.length) * 0.4)
  const tailChars = maxChars - marker.length - headChars
  return `${text.slice(0, headChars).trimEnd()}${marker}${text.slice(text.length - tailChars).trimStart()}`
}

/** The text the model sees: the previous chapter whole (when in scope), then this chapter through the reader's paragraph. */
export function buildRecapPassage(input: {
  chapter: ChapterText
  throughParagraph: number
  previous: ChapterText | null
}): string {
  const parts: string[] = []
  if (input.previous) {
    parts.push(`${input.previous.title}\n\n${input.previous.paragraphs.map(cleanParagraph).filter(Boolean).join('\n\n')}`)
  }
  const current = input.chapter.paragraphs.slice(0, input.throughParagraph + 1).map(cleanParagraph).filter(Boolean).join('\n\n')
  parts.push(`${input.chapter.title}\n\n${current}`)
  return elidePassage(parts.join('\n\n'))
}

function userMessage(input: { parsed: ParsedRecapRequest; chapter: ChapterText; coverage: LabRecapCoverage; passage: string }): string {
  const { parsed, chapter, coverage, passage } = input
  const where = parsed.bookTitle ? `${parsed.bookTitle}, ${chapter.title}` : chapter.title
  const status = coverage.complete
    ? `The reader finished ${chapter.title}.`
    : `The reader stopped part-way through ${chapter.title}; the passage ends where they stopped.`
  const scope = coverage.fromChapterNumber !== null ? ' The passage also includes the chapter before it, which the reader finished in the same sitting.' : ''
  return `Location: ${where}. ${status}${scope}\n\nPassage:\n\n${passage}\n\nWrite the "so far" summary.`
}

async function defaultFetchAnthropic(payload: Record<string, unknown>, apiKey: string): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  })
}

function defaultCache(): RecapCache | null {
  const store = (globalThis as { caches?: { default?: RecapCache } }).caches?.default
  return store ?? null
}

function cacheRequest(origin: string, key: string): Request {
  return new Request(`${origin}/__lab-recap/${key}`)
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

export async function handleLabRecap(
  request: Request,
  env: LabRecapEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
  deps: LabRecapDeps = {},
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey || !env.ASSETS) return jsonResponse({ error: 'Service unavailable' }, 503, request)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_BODY_BYTES) return jsonResponse({ error: 'Request too large' }, 413, request)

  let parsed: ParsedRecapRequest | null
  try {
    parsed = parseRecapRequest(await request.json())
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request)
  }
  if (!parsed) return jsonResponse({ error: 'Invalid recap request' }, 400, request)

  const allowed = await checkRateLimit(`lab-recap:${labGuestIp(request)}`, env.RATE_LIMIT, RECAP_RATE_LIMIT_PER_MINUTE)
  if (!allowed) return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)

  const origin = new URL(request.url).origin
  const retrieval: BookRetrieval = (deps.createRetrieval ?? createBookRetrieval)({
    assets: env.ASSETS,
    origin,
    book: { bookId: parsed.bookId, editionKey: parsed.editionKey, chapterNumber: parsed.chapterNumber },
  })
  const chapter = await retrieval.chapterText(parsed.chapterNumber)
  if (!chapter || chapter.paragraphs.length === 0) return jsonResponse({ error: 'Chapter not available' }, 404, request)
  const previous = parsed.previousChapterNumber !== null ? await retrieval.chapterText(parsed.previousChapterNumber) : null

  const paragraphCount = chapter.paragraphs.length
  const throughParagraph = recapCoverageThrough({ paragraphIndex: parsed.paragraphIndex, paragraphCount, completed: parsed.completed })
  const coverage: LabRecapCoverage = {
    chapterNumber: parsed.chapterNumber,
    throughParagraph,
    paragraphCount,
    complete: throughParagraph >= paragraphCount - 1,
    fromChapterNumber: previous ? previous.number : null,
  }
  const key = recapCacheKey({
    bookId: parsed.bookId,
    editionKey: parsed.editionKey,
    chapterNumber: parsed.chapterNumber,
    paragraphIndex: parsed.paragraphIndex,
    paragraphCount,
    completed: coverage.complete,
    previousChapterNumber: coverage.fromChapterNumber,
  })
  const cache = deps.cache === undefined ? defaultCache() : deps.cache
  const cacheKey = cacheRequest(origin, key)
  if (cache) {
    try {
      const hit = await cache.match(cacheKey)
      if (hit) {
        const stored = await hit.json() as LabRecapResponse
        return jsonResponse({ ...stored, cached: true }, 200, request)
      }
    } catch { /* a cache failure is never a user-facing failure */ }
  }

  const passage = buildRecapPassage({ chapter, throughParagraph, previous })
  try {
    const response = await (deps.fetchAnthropic ?? defaultFetchAnthropic)({
      model: COMPANION_MODEL,
      max_tokens: RECAP_MAX_TOKENS,
      system: RECAP_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage({ parsed, chapter, coverage, passage }) }],
      output_config: { effort: 'low' },
    }, apiKey)
    if (!response.ok) return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    const message = await response.json() as AnthropicMessage
    const summary = message.stop_reason === 'refusal' ? '' : textOf(message)
    if (!summary) return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    console.log(JSON.stringify({
      event: 'lab_recap_usage',
      route: LAB_RECAP_ROUTE,
      input_tokens: message.usage?.input_tokens ?? 0,
      output_tokens: message.usage?.output_tokens ?? 0,
    }))
    const payload: LabRecapResponse = {
      summary,
      coverage,
      model: typeof message.model === 'string' && message.model ? message.model : COMPANION_MODEL,
      version: RECAP_PROMPT_VERSION,
      cached: false,
    }
    if (cache) {
      const stored = new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${RECAP_CACHE_TTL_SECONDS}` },
      })
      ctx.waitUntil(cache.put(cacheKey, stored).catch(() => {}))
    }
    return jsonResponse(payload, 200, request)
  } catch {
    return jsonResponse({ error: 'Summary unavailable' }, 502, request)
  }
}
