/**
 * POST /api/lab-catch-up — one entry of the reader's "Catch me up" timeline.
 *
 * Modelled on `/api/lab-recap`. The client names only the book, the edition,
 * the unit (a biblical book, a part, a chapter; see `catchUp.ts`) and, for
 * the unit the reader is still in, the last chapter to cover. The Worker
 * derives the units from the edition's own manifest, fetches the text itself
 * through the static asset binding — the client never sends text — and asks
 * the companion model for one sentence (a chapter) or two (a group), held to
 * that limit by `enforceCatchUpLength`.
 *
 * A passed unit's recap is the same for every reader, so the lookup is:
 *   1. a pre-written static file for the edition (`catchUpStaticPath`), when
 *      one ships — none does yet; a missing file is a quiet miss;
 *   2. the Cloudflare Cache API, keyed by book/edition/unit/through/prompt
 *      version, for 30 days;
 *   3. generation, which alone is rate-limited per IP and reserved against
 *      the signed-out daily AI ceiling, exactly as `/api/lab-recap`.
 */
import { RECAP_FAST_MODEL } from '../../companionModel'
import {
  CATCH_UP_BLOCK_LIMIT,
  CATCH_UP_CACHE_TTL_SECONDS,
  CATCH_UP_CHAPTER_LIMIT,
  CATCH_UP_PROMPT_VERSION,
  CATCH_UP_ROUTE,
  CATCH_UP_UNIT_ID_PATTERN,
  catchUpCacheKey,
  catchUpCrossesParts,
  catchUpStaticKey,
  catchUpStaticPath,
  catchUpFindUnit,
  catchUpUnits,
  type CatchUpResponse,
  type CatchUpUnit,
} from '../../catchUp'
import type { Section } from '../../types'
import { createBookRetrieval, parseBookRef, type AssetsBinding, type BookRetrieval, type ChapterText } from '../lib/bookRetrieval'
import { aiRestingBody, estimateAiCostMicros, type ReserveGuestSpend } from '../lib/aiSpend'
import { allowanceUsedBody } from '../lib/aiAllowance'
import { jsonResponse } from '../lib/responses'
import { createAiMeter, ledgerGuestKey, type LedgerEnv } from '../lib/aiUsage'
import { LAB_ASK_CHECKED_SPECIFICS_RULE, LAB_RECAP_GROUNDING_RULE } from '../../companion/labAskPrompt'
import { RECAP_ENTRY_INSTRUCTION, RECAP_ENTRY_TOOL_PAYLOAD, readRecapEntry } from '../lib/recapEntry'
import { isUsableRecapSummary } from '../../recapSummary'
import { describeEntryLimit, entryFits, entrySentences, entryWordCount, trimEntryToLimit, type EntryLimit } from '../lib/entryLength'
import { sampleCatchUpText } from '../../ownCatchUp'
import type { RecapCache } from './labRecap'
import { bookAssets } from './publicBooks'

export { CATCH_UP_BLOCK_LIMIT, CATCH_UP_CHAPTER_LIMIT }

export type LabCatchUpEnv = LedgerEnv & {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  ASSETS?: AssetsBinding
  /** Added (`pd-`) books' editions live here (publicBooks.ts bookAssets). */
  PUBLIC_BOOKS?: R2Bucket
  AUDIO_BUCKET?: R2Bucket
}

type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export interface LabCatchUpDeps {
  cache?: RecapCache | null
  /** Anthropic transport; defaults to fetch. */
  fetchAnthropic?: (payload: Record<string, unknown>, apiKey: string) => Promise<Response>
  createRetrieval?: typeof createBookRetrieval
  /** Daily ceiling for signed-out AI. Absent = refused (fail closed). */
  reserveGuestSpend?: ReserveGuestSpend
  /** Who to bill in the cost ledger when the request carries a session. Runs in the background write. */
  resolveUser?: (request: Request) => Promise<string | null>
  /** The AI allowance (lib/aiAllowance.ts): false refuses generation for a signed-in reader whose allowance is used up. */
  allowsAi?: (request: Request) => Promise<boolean>
}

/**
 * Room for the entry, not its length (the limits: CATCH_UP_CHAPTER_LIMIT, CATCH_UP_BLOCK_LIMIT). A cut-off call is no entry at all: 160 and 240 cut off every try of
 * 2 Maccabees 8 and of 2 Maccabees 1–6, so Catch me up showed only Retry, which cut off again (Anders's ledger,
 * 2 Nov 2026: 160/160 and 240/240 output tokens). So an overlong answer must still arrive whole, to be shortened
 * (`enforceCatchUpLength`); these leave room for about 200 and 280 words, several times the limit, plus the tool call.
 */
export const CATCH_UP_MAX_TOKENS = 300
export const CATCH_UP_BLOCK_MAX_TOKENS = 400
/** The corrective call rewrites a draft of at most CATCH_UP_BLOCK_MAX_TOKENS into the limit: room for that, and the tool call. */
export const CATCH_UP_SHORTEN_MAX_TOKENS = 200
/**
 * How long the corrective call may hold an entry back. Past this the reader gets the draft cut at a sentence end
 * now, and the rewrite, when it arrives, replaces it in the cache for the next reader (Anders, 4 Nov 2026: the first
 * entry must not come last).
 */
export const CATCH_UP_SHORTEN_BUDGET_MS = 2_000
/** About 8K tokens of source per entry; long units are sampled evenly across their chapters. */
export const CATCH_UP_MAX_PASSAGE_CHARS = 32_000
/** Every request, cached or not: a long timeline is many cheap lookups. */
export const CATCH_UP_LOOKUP_RATE_LIMIT_PER_MINUTE = 120
/** Requests that reach the model, per IP per minute. */
export const CATCH_UP_GENERATE_RATE_LIMIT_PER_MINUTE = 12
const MAX_BODY_BYTES = 4_096
const MAX_TITLE_CHARS = 120
const MAX_CHAPTER_NUMBER = 10_000

const CATCH_UP_RULES = [
  // The chat's grounding (#520), for a recap: what the span shows, never an outcome it does not.
  LAB_RECAP_GROUNDING_RULE,
  LAB_ASK_CHECKED_SPECIFICS_RULE,
  'Use only the passage. Do not go beyond it: no later events, no outcomes, no foreshadowing, and nothing you know about this book from elsewhere. The passage ends where the reader has read to.',
  'A long passage is sampled: parts of each chapter are left out. Cover the whole span evenly, not only its opening.',
  'For non-narrative text (proverbs, letters, essays, laws, poems) state the main points instead of events.',
  'No praise, no interpretation, no advice, no preamble, no headings, no bullet points, and no quotation marks around the answer.',
  RECAP_ENTRY_INSTRUCTION,
]

/**
 * A group of several chapters (`catchUpPlan`): a part, or a run of chapters
 * inside one, in one entry.
 */
export const CATCH_UP_BLOCK_SYSTEM_PROMPT = [
  'You write one entry in a "catch me up" timeline that a returning reader scrolls before they continue a book: one compact recap of a group of consecutive chapters. The chapters before and after these get entries of their own.',
  `Summarise the passage below in ${describeEntryLimit(CATCH_UP_BLOCK_LIMIT)}, short plain declarative sentences in the present tense: the main people and the one or two turns that matter for what follows. Do not go chapter by chapter and do not list episodes; leave out everything else.`,
  ...CATCH_UP_RULES,
].join('\n')

export const CATCH_UP_SYSTEM_PROMPT = [
  'You write one entry in a "catch me up" timeline that a returning reader scrolls before they continue a book.',
  `Summarise the passage below in ${describeEntryLimit(CATCH_UP_CHAPTER_LIMIT)}, a short plain declarative sentence in the present tense: who does what, and the turn that matters.`,
  ...CATCH_UP_RULES,
].join('\n')

/** The corrective call: the overlong draft only (never the passage again), so it is cheap and adds nothing new. */
export const CATCH_UP_SHORTEN_SYSTEM_PROMPT = [
  'You shorten one entry in a "catch me up" timeline that a returning reader scrolls before they continue a book. The entry is over its length limit.',
  'Rewrite it within the limit you are given: keep the main people and the one or two turns that matter most, and drop everything else. Plain declarative sentences in the present tense.',
  'Use only the entry. Add nothing that is not in it: no new events, names or outcomes.',
  'No praise, no interpretation, no advice, no preamble, no headings, no bullet points, and no quotation marks around the answer.',
  RECAP_ENTRY_INSTRUCTION,
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
  /** The reader's chapter: no coverage at or after it is ever served. Null from an older client. */
  placeChapter: number | null
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
  const place = value.placeChapter
  if (place !== undefined && place !== null
    && (typeof place !== 'number' || !Number.isInteger(place) || place < 1 || place > MAX_CHAPTER_NUMBER)) return null
  const bookTitle = typeof value.bookTitle === 'string' && value.bookTitle.trim() ? value.bookTitle.trim().slice(0, MAX_TITLE_CHARS) : null
  return {
    bookId: book.bookId, editionKey: book.editionKey, unitId: value.unitId, throughChapter: typeof through === 'number' ? through : null, bookTitle,
    placeChapter: typeof place === 'number' ? place : null,
  }
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

/**
 * Whether every covered chapter comes before the reader's chapter, in the
 * edition's reading order. No place (an older client) is not refused; an
 * unknown place is.
 */
export function catchUpWithinPlace(chapters: ReadonlyArray<{ number: number }>, covered: readonly number[], placeChapter: number | null): boolean {
  if (placeChapter === null) return true
  const order = new Map(chapters.map((chapter, index) => [chapter.number, index]))
  const place = order.get(placeChapter)
  if (place === undefined) return false
  return covered.every(n => { const at = order.get(n); return at !== undefined && at < place })
}

function cleanParagraph(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** The text the model sees: every covered chapter, each given an even share of the budget. */
export function buildCatchUpPassage(chapters: ChapterText[], maxChars = CATCH_UP_MAX_PASSAGE_CHARS): string {
  if (!chapters.length) return ''
  const share = Math.max(200, Math.floor(maxChars / chapters.length) - 40)
  return chapters
    .map(chapter => `${chapter.title}\n\n${sampleCatchUpText(chapter.paragraphs.map(cleanParagraph).filter(Boolean).join('\n\n'), share)}`)
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
  content?: Array<{ type?: string; text?: string; name?: string; input?: unknown }>
  stop_reason?: string
  model?: string
  usage?: { input_tokens?: number; output_tokens?: number }
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
    return isUsableRecapSummary(summary) ? summary.trim() : null
  } catch {
    return null
  }
}

export interface EnforcedEntry {
  /** What this reader is shown now. */
  summary: string
  /** What is cached for the next reader: the same, or a rewrite that arrived after CATCH_UP_SHORTEN_BUDGET_MS. */
  settled: Promise<string>
  /** `fits`: untouched. `rewritten`: the corrective call's answer. `trimmed`: whole sentences of the draft. `late`: trimmed now, the rewrite cached. */
  outcome: 'fits' | 'rewritten' | 'trimmed' | 'late'
}

/**
 * Hold an entry to its limit. Within it, the answer is untouched (no extra call: the common case costs nothing).
 * Over it, ONE corrective call gets the draft (not the passage) with its length and the limit; an answer still over
 * is cut to whole sentences (`trimEntryToLimit`), as is the draft when that call fails, is refused by the spend
 * ceiling, or takes longer than the budget (its answer then only updates the cache).
 */
export async function enforceCatchUpLength(input: {
  summary: string
  limit: EntryLimit
  /** "2 Maccabees, 2 Maccabees 1 – 2 Maccabees 8": context for the rewrite. */
  where: string
  send: (payload: Record<string, unknown>) => Promise<Response>
  meter?: (usage: AnthropicMessage['usage']) => void
  reserve?: ReserveGuestSpend
  budgetMs?: number
}): Promise<EnforcedEntry> {
  const { summary, limit } = input
  if (entryFits(summary, limit)) return { summary, settled: Promise.resolve(summary), outcome: 'fits' }
  const trimmed = trimEntryToLimit(summary, limit)
  const content = `Location: ${input.where}.\n\nThe entry below is ${entryWordCount(summary)} words in ${entrySentences(summary).length} sentences. `
    + `The limit is ${describeEntryLimit(limit)}. Rewrite it within the limit.\n\nEntry:\n\n${summary}`
  const estimate = estimateAiCostMicros({ inputChars: CATCH_UP_SHORTEN_SYSTEM_PROMPT.length + content.length, maxTokens: CATCH_UP_SHORTEN_MAX_TOKENS })
  if (!input.reserve || !await input.reserve(estimate)) return { summary: trimmed, settled: Promise.resolve(trimmed), outcome: 'trimmed' }
  const rewrite = (async (): Promise<{ summary: string; rewritten: boolean }> => {
    try {
      const response = await input.send({
        model: RECAP_FAST_MODEL,
        max_tokens: CATCH_UP_SHORTEN_MAX_TOKENS,
        system: CATCH_UP_SHORTEN_SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
        ...RECAP_ENTRY_TOOL_PAYLOAD,
      })
      if (!response.ok) return { summary: trimmed, rewritten: false }
      const message = await response.json() as AnthropicMessage
      input.meter?.(message.usage)
      const entry = readRecapEntry(message)
      if (entry.kind !== 'summary') return { summary: trimmed, rewritten: false }
      return entryFits(entry.summary, limit) ? { summary: entry.summary, rewritten: true } : { summary: trimEntryToLimit(entry.summary, limit), rewritten: false }
    } catch {
      return { summary: trimmed, rewritten: false }
    }
  })()
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), input.budgetMs ?? CATCH_UP_SHORTEN_BUDGET_MS) })
  const first = await Promise.race([rewrite, late])
  clearTimeout(timer)
  if (first) return { summary: first.summary, settled: Promise.resolve(first.summary), outcome: first.rewritten ? 'rewritten' : 'trimmed' }
  return { summary: trimmed, settled: rewrite.then(result => result.summary), outcome: 'late' }
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
    assets: bookAssets(env),
    origin,
    book: { bookId: parsed.bookId, editionKey: parsed.editionKey },
  })
  const index = await retrieval.editionIndex()
  if (!index || index.chapters.length === 0) return jsonResponse({ error: 'Edition not available' }, 404, request)
  const units = catchUpUnits({ title: parsed.bookTitle ?? parsed.bookId, chapters: index.chapters, sections: index.sections as Section[] | undefined, bible: parsed.bookId === 'bible' })
  // A biblical book, a part, a chapter unit, or one chapter inside a part (`ch-<n>`).
  const unit = catchUpFindUnit(units, index.chapters, parsed.unitId)
  if (!unit) return jsonResponse({ error: 'Unknown unit' }, 400, request)
  const coverage = catchUpCoverage(unit, parsed.throughChapter)
  if (!coverage) return jsonResponse({ error: 'Chapter not in unit' }, 400, request)
  // A group never crosses a part, book or volume (catchUpPlan): every part has its own entry.
  if (unit.kind === 'range' && catchUpCrossesParts(units, unit.chapters)) return jsonResponse({ error: 'Range crosses a part' }, 400, request)
  // Hard guard: nothing at or after the reader's chapter, from the model, the cache or a prepared file.
  if (!catchUpWithinPlace(index.chapters, coverage.chapters, parsed.placeChapter)) return jsonResponse({ error: 'Beyond the reader\'s place' }, 400, request)
  // A through chapter that ends the unit is the whole unit: one entry, one cache key.
  const throughChapter = coverage.complete ? null : parsed.throughChapter
  const respond = (summary: string, source: CatchUpResponse['source'], empty = false) => jsonResponse({
    summary, unitId: unit.id, title: unit.title, chapters: coverage.chapters, complete: coverage.complete, version: CATCH_UP_PROMPT_VERSION, source,
    ...(empty ? { empty: true } : {}),
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
        // An entry that is not a summary is skipped and replaced below.
        if (isUsableRecapSummary(stored?.summary)) return respond(stored.summary, 'cache')
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
  const block = coverage.chapters.length > 1
  const system = block ? CATCH_UP_BLOCK_SYSTEM_PROMPT : CATCH_UP_SYSTEM_PROMPT
  const maxTokens = block ? CATCH_UP_BLOCK_MAX_TOKENS : CATCH_UP_MAX_TOKENS
  const estimate = estimateAiCostMicros({ inputChars: system.length + content.length, maxTokens })
  // Cached and prepared entries above cost nothing and are always served.
  if (deps.allowsAi && !await deps.allowsAi(request)) return jsonResponse(allowanceUsedBody(), 402, request)
  if (!deps.reserveGuestSpend || !await deps.reserveGuestSpend(estimate)) return jsonResponse(aiRestingBody(), 503, request)
  const meter = createAiMeter(env, ctx, {
    guest: ledgerGuestKey(request),
    resolveUser: deps.resolveUser ? () => deps.resolveUser!(request) : undefined,
  }, { feature: 'catch_up', bookId: parsed.bookId, model: RECAP_FAST_MODEL })
  try {
    const response = await (deps.fetchAnthropic ?? defaultFetchAnthropic)({
      model: RECAP_FAST_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content }],
      ...RECAP_ENTRY_TOOL_PAYLOAD,
    }, apiKey)
    if (!response.ok) {
      if (response.status === 402 || response.status === 429) return jsonResponse(aiRestingBody(), 503, request)
      return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    }
    const message = await response.json() as AnthropicMessage
    meter.anthropic(message.usage)
    const entry = readRecapEntry(message)
    if (entry.kind === 'none') return jsonResponse({ error: 'Summary unavailable' }, 502, request)
    console.log(JSON.stringify({
      event: 'lab_catch_up_usage',
      route: CATCH_UP_ROUTE,
      input_tokens: message.usage?.input_tokens ?? 0,
      output_tokens: message.usage?.output_tokens ?? 0,
    }))
    // Nothing to summarise: no entry, and nothing cached that could keep reappearing.
    if (entry.kind === 'empty') return respond('', 'model', true)
    const send = (payload: Record<string, unknown>) => (deps.fetchAnthropic ?? defaultFetchAnthropic)(payload, apiKey)
    const enforced = await enforceCatchUpLength({
      summary: entry.summary,
      limit: block ? CATCH_UP_BLOCK_LIMIT : CATCH_UP_CHAPTER_LIMIT,
      where,
      send,
      meter: usage => meter.anthropic(usage),
      reserve: deps.reserveGuestSpend,
    })
    if (enforced.outcome !== 'fits') {
      // Lengths only, never the text.
      console.log(JSON.stringify({ event: 'lab_catch_up_shortened', route: CATCH_UP_ROUTE, outcome: enforced.outcome, words: entryWordCount(entry.summary) }))
    }
    const summary = enforced.summary
    if (cache) {
      ctx.waitUntil(enforced.settled.then(settled => cache.put(cacheKey, new Response(JSON.stringify({ summary: settled }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CATCH_UP_CACHE_TTL_SECONDS}` },
      }))).catch(() => {}))
    }
    return respond(summary, 'model')
  } catch {
    return jsonResponse({ error: 'Summary unavailable' }, 502, request)
  }
}
