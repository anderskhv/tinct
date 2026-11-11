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
  chapterNotesLengthDefault,
  chapterNotesMaxBeats,
  parseChapterNotesBeats,
  type ChapterNotesKind,
  type ChapterNotesResponse,
} from '../../chapterNotes'
import { AI_LANGUAGE_LINES, aiPrefsMaxTokens, aiPrefsPromptLines, parseAiRequestPrefs, type AiLength, type AiRequestPrefs } from '../../aiSettings'
import { createBookRetrieval, parseBookRef, type AssetsBinding, type BookRetrieval, type ChapterEntry, type ChapterText, type SectionNode } from '../lib/bookRetrieval'
import { AI_RESTING_TYPE, aiRestingBody, estimateAiCostMicros, type ReserveGuestSpend } from '../lib/aiSpend'
import { allowanceUsedBody } from '../lib/aiAllowance'
import { jsonResponse } from '../lib/responses'
import { fetchChatUpstream } from '../lib/chatUpstream'
import { createAiMeter, ledgerGuestKey, type LedgerEnv } from '../lib/aiUsage'
import type { RecapCache } from './labRecap'
import { bookAssets } from './publicBooks'

export type LabChapterNotesEnv = LedgerEnv & {
  ANTHROPIC_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  ASSETS?: AssetsBinding
  /** Added (`pd-`) books' editions live here (publicBooks.ts bookAssets). */
  PUBLIC_BOOKS?: R2Bucket
  AUDIO_BUCKET?: R2Bucket
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
  primer: 700,
})
export const CHAPTER_NOTES_MAX_PASSAGE_CHARS = 28_000
export const CHAPTER_NOTES_LOOKUP_RATE_LIMIT_PER_MINUTE = 60
export const CHAPTER_NOTES_GENERATE_RATE_LIMIT_PER_MINUTE = 10
// Room for the reader's AI settings: two instruction boxes of 400 characters.
const MAX_BODY_BYTES = 4_096
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
  // Prompt v4 (Anders, 2026-11-11: "what is Luke 14 doing for the Book of
  // Luke", and the structure of the chapter). Three beats: the chapter's role
  // in its book (for the Bible, the biblical book it belongs to,
  // named in WHERE THIS CHAPTER SITS), how the chapter is built, and "Watch
  // for". v3 was two beats: why the chapter is interesting, and "Watch for".
  // Spoilers: a story's coming chapter is still never given away (its role
  // and parts are described by kind, never by outcome); scripture and
  // non-fiction have no surprise to protect, so their content is named.
  // Bump CHAPTER_NOTES_PROMPT_VERSIONS.primer when this changes.
  primer: [
    'You write a primer a reader sees just before starting a chapter. Its job is to orient them: what this chapter does for the book it belongs to, how the chapter is built, and what to watch for. It is not a recap.',
    'Give exactly three beats, in this order. Never more than three beats.',
    'The first beat is the chapter\'s role in its book. "The book" is the work named under WHERE THIS CHAPTER SITS: for a collection such as the Bible it is the single book the chapter belongs to (Luke, not the whole Bible). Its title is "In" followed by that book\'s short name, for example "In Luke" or "In Frankenstein". Its text says where the chapter stands in the book (opening, turn, middle of a journey, a new part, the close) and what it does for the whole: what it takes up from the chapters before, what it adds, sets up or answers. It may open with at most one short sentence, at most 15 words, on where things stand, taken from the PREVIOUS chapter.',
    'Ground the first beat in what you are given: the chapter list under WHERE THIS CHAPTER SITS, the previous chapter and the coming chapter. For a widely known work you may also use what is generally known of its overall shape. Never guess at chapters you have not been given: when the list and the text do not show the chapter\'s place, say only where it comes in the order and what it takes up, and claim nothing about later chapters.',
    'The second beat is titled "How it\'s built" and lays the chapter out as two to four parts, in order. Name each part by its kind and subject, and give its range when the text carries numbers (verses, sections, numbered paragraphs), for example "Verses 1–6", "Verses 7–14". Write it as running sentences, one part after another.',
    'The third beat is titled "Watch for" and gives one or two concrete things to notice while reading: a person, object, place, phrase, contrast or question, named specifically.',
    'Spoilers. For a story (a novel, a play, a narrative poem) stay strictly spoiler-free: never state or hint at any event, outcome, turn, decision or discovery in the coming chapter or later ones. Say what kind of chapter it is and what kind of parts it has (a letter, a journey, a night scene, a long dialogue, a change of narrator or place), never what happens in them. Point at what to notice, never at what happens to it. For example (from a different book, for tone only), write "Watch the borrowed umbrella Anna leaves by the door", never "The umbrella\'s importance is revealed".',
    'Scripture, history, philosophy, essays, laws, letters, proverbs, poems and other non-fiction have no surprise to protect: name the chapter\'s actual content, its claims, episodes and parts, plainly.',
    'Answer with JSON only, no prose around it: {"beats":[{"title":"In …","text":"…"},{"title":"How it\'s built","text":"…"},{"title":"Watch for","text":"…"}]}.',
    'The first text is two or three plain sentences in the present tense, at most 50 words. The second is two to four plain sentences, at most 60 words. The third is one or two plain sentences, at most 35 words.',
    'Do not invent meaning, motives or symbolism. State only facts the text gives or that are generally known of the work; when unsure of a name or number, leave it out.',
    'Never use the verbs list, record, document, establish, detail, reveal or examine to describe the text; say what the text actually shows.',
    'Write declaratively. No praise, no selling, no advice, no morals or aphorisms, no "we" or "us" in the text, no rhetorical questions, no balanced flourishes such as "not X but Y".',
  ].join('\n'),
}

/**
 * A card's length in the reader's AI settings, as beats. Replaces the kind's
 * own count and length; the JSON shape stays.
 */
export const CHAPTER_NOTES_LENGTH_LINES: Readonly<Record<AiLength, string>> = Object.freeze({
  brief: 'Length, as the reader set it: brief. Two or three beats, each text one sentence of at most 20 words. This replaces any other beat count or length above; keep the JSON shape.',
  standard: 'Length, as the reader set it: standard. Three or four beats, each text two or three sentences, at most 60 words. This replaces any other beat count or length above; keep the JSON shape.',
  detailed: 'Length, as the reader set it: detailed. Five to eight beats, each text two to four sentences with context, at most 90 words. This replaces any other beat count or length above; keep the JSON shape.',
})
const PRIMER_LAST_BEAT = 'The card keeps the primer\'s order: the first beat is still the chapter\'s role in its book, then how it is built (over more than one beat when the card is longer), and the last beat is still titled "Watch for". The spoiler rule above still holds.'

/** The kind's system prompt with the reader's settings after it (unchanged without any). */
export function chapterNotesSystem(kind: ChapterNotesKind, ai: AiRequestPrefs | undefined): string {
  const base = CHAPTER_NOTES_SYSTEM[kind]
  if (!ai) return base
  const length = ai.length && ai.length !== chapterNotesLengthDefault(kind) ? ai.length : null
  const lines = [
    ...(length ? [CHAPTER_NOTES_LENGTH_LINES[length], ...(kind === 'primer' ? [PRIMER_LAST_BEAT] : [])] : []),
    // The cards are English; the language line asks for the reader's language in the JSON's values.
    ...aiPrefsPromptLines(ai, { length: false }).map(line => line === AI_LANGUAGE_LINES.da || line === AI_LANGUAGE_LINES.en ? `${line} Write the titles and texts in that language.` : line),
  ]
  return lines.length ? `${base}\n${lines.join('\n')}` : base
}

export interface ParsedChapterNotesRequest {
  bookId: string
  editionKey: string
  chapterNumber: number
  kind: ChapterNotesKind
  paragraphIndex: number
  bookTitle: string | null
  ai?: AiRequestPrefs
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
  const ai = parseAiRequestPrefs(value.ai)
  return { bookId: book.bookId, editionKey: book.editionKey, chapterNumber: book.chapterNumber, kind, paragraphIndex, bookTitle, ...(ai ? { ai } : {}) }
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

/** At most this many chapter titles in a primer's WHERE THIS CHAPTER SITS: the ones nearest the chapter. */
export const CHAPTER_PLACE_MAX_TITLES = 60

/** The innermost section holding the chapter, and the sections above it (outermost first). */
function sectionPath(sections: SectionNode[] | undefined, chapterNumber: number, above: string[] = []): { titles: string[]; chapters: number[] } | null {
  for (const section of sections ?? []) {
    const titles = section.title ? [...above, section.title] : above
    const inner = sectionPath(section.sections, chapterNumber, titles)
    if (inner) return inner
    if (Array.isArray(section.chapters) && section.chapters.includes(chapterNumber)) return { titles, chapters: section.chapters }
  }
  return null
}

/** Collections whose innermost section is itself a book: the Bible's Luke is "the book" of Luke 14, never the whole Bible. */
const COLLECTION_BOOK_IDS: ReadonlySet<string> = new Set(['bible'])

/**
 * Where a chapter sits, for a primer's first beat: the book it belongs to and
 * that book's chapter titles in order. A collection's chapter (the Bible's
 * Luke 14) is placed in its own book (Luke, 24 chapters), never the whole
 * edition; any other book is its whole chapter list, with the chapter's part
 * named ("Volume 1 › Part 2"). Titles only: nothing of the chapters' text, so
 * nothing later is given away.
 */
export function chapterPlace(index: { chapters: ChapterEntry[]; sections?: SectionNode[] }, chapterNumber: number, bookTitle: string | null, bookId = ''): string {
  const path = sectionPath(index.sections, chapterNumber)
  const unit = path && path.titles.length > 0 && COLLECTION_BOOK_IDS.has(bookId) ? path.titles[path.titles.length - 1] : null
  const numbers = unit && path ? path.chapters : index.chapters.map(chapter => chapter.number)
  const titleOf = new Map(index.chapters.map(chapter => [chapter.number, chapter.title]))
  const at = Math.max(0, numbers.indexOf(chapterNumber))
  const book = unit ? `${unit}${bookTitle ? ` (a book of ${bookTitle})` : ''}` : bookTitle ?? 'this book'
  const part = path && !unit && path.titles.length > 0 ? ` It is in the part "${path.titles.join(' › ')}".` : ''
  const from = Math.max(0, Math.min(at - Math.floor(CHAPTER_PLACE_MAX_TITLES / 2), numbers.length - CHAPTER_PLACE_MAX_TITLES))
  const shown = numbers.slice(from, from + CHAPTER_PLACE_MAX_TITLES)
  const lines = shown.map(number => `${number === chapterNumber ? '> ' : '  '}${titleOf.get(number) ?? `Chapter ${number}`}${number === chapterNumber ? '  (the coming chapter)' : ''}`)
  return [
    `WHERE THIS CHAPTER SITS: the book is ${book}. The coming chapter is number ${at + 1} of ${numbers.length} in it.${part}`,
    `Its chapters in order${shown.length < numbers.length ? ` (${shown.length} of ${numbers.length} shown)` : ''}:`,
    ...lines,
  ].join('\n')
}

/**
 * Through the chat upstream: one retry on a transient provider error
 * (429/5xx/529 with a short Retry-After), bounded header waits, and a
 * metadata-only log line on every failure. A bare fetch here turned one
 * passing provider blip into a silent 502 for Summarize (QA, 15 Oct 2026,
 * 02:04Z: 502 in 0.5 s, nothing logged; the reader's retry worked).
 */
async function defaultFetchAnthropic(payload: Record<string, unknown>, apiKey: string): Promise<Response> {
  return fetchChatUpstream(apiKey, payload)
}

/** Why a card was not written; no prompt, text or reader data. */
function logChapterNotesFailure(reason: 'upstream' | 'unparseable' | 'exception', kind: ChapterNotesKind, status?: number): void {
  console.warn(JSON.stringify({ event: 'chapter_notes_failed', reason, kind, status: status ?? null }))
}

async function isRestingResponse(response: Response): Promise<boolean> {
  if (response.status === 402 || response.status === 429) return true
  if (response.status !== 503) return false
  const body = await response.clone().json().catch(() => null) as { error?: { type?: unknown } } | null
  return body?.error?.type === AI_RESTING_TYPE
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
    assets: bookAssets(env), origin, book: { bookId: parsed.bookId, editionKey: parsed.editionKey, chapterNumber: parsed.chapterNumber },
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
        const beats = parseChapterNotesBeats(await hit.json(), chapterNotesMaxBeats(parsed.ai))
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
    const index = await retrieval.editionIndex().catch(() => null)
    passage = [
      ...(index ? [chapterPlace(index, parsed.chapterNumber, parsed.bookTitle, parsed.bookId)] : []),
      previous ? `PREVIOUS CHAPTER (what the reader has read):\n\n${chapterBody(previous, undefined, 12_000)}` : 'PREVIOUS CHAPTER: none — this is the opening.',
      `COMING CHAPTER (not yet read — never reveal its events):\n\n${chapterBody(chapter, undefined, 14_000)}`,
    ].join('\n\n')
  } else {
    passage = chapterBody(chapter, through ?? undefined)
  }
  const where = parsed.bookTitle ? `${parsed.bookTitle}, ${chapter.title}` : chapter.title
  const content = `Location: ${where}.\n\n${passage}\n\nWrite the card as JSON.`
  const system = chapterNotesSystem(parsed.kind, parsed.ai)
  const model = CHAPTER_NOTES_MODEL[parsed.kind]
  const maxTokens = aiPrefsMaxTokens(CHAPTER_NOTES_MAX_TOKENS[parsed.kind], parsed.ai, chapterNotesLengthDefault(parsed.kind))
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
      if (await isRestingResponse(response)) return jsonResponse(aiRestingBody(), 503, request)
      logChapterNotesFailure('upstream', parsed.kind, response.status)
      return jsonResponse({ error: 'Notes unavailable' }, 502, request)
    }
    const message = await response.json() as AnthropicMessage
    meter.anthropic(message.usage)
    const text = message.stop_reason === 'refusal' ? '' : (message.content ?? []).filter(block => block?.type === 'text').map(block => block.text ?? '').join('')
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    let beats: ChapterNotesResponse['beats'] | null = null
    try { beats = parseChapterNotesBeats(JSON.parse(json), chapterNotesMaxBeats(parsed.ai)) } catch { beats = null }
    if (!beats) {
      logChapterNotesFailure('unparseable', parsed.kind)
      return jsonResponse({ error: 'Notes unavailable' }, 502, request)
    }
    if (cache) {
      const stored = new Response(JSON.stringify({ beats }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CHAPTER_NOTES_CACHE_TTL_SECONDS}` } })
      ctx.waitUntil(cache.put(cacheKey, stored).catch(() => {}))
    }
    return respond(beats, 'model')
  } catch {
    logChapterNotesFailure('exception', parsed.kind)
    return jsonResponse({ error: 'Notes unavailable' }, 502, request)
  }
}

export { CHAPTER_NOTES_ROUTE }
