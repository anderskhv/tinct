/**
 * Structured companion requests. The reader sends what it is looking at
 * (book, edition, chapter, paragraph, selection, chapter action) and the
 * Worker builds the system prompt, the output bound and the effort from it
 * with the shared builders. The client never sends a system prompt.
 * Pure: no browser or Worker APIs.
 */
import { CONTEXTUAL_LOOKUP_PROMPT } from '../components/reader/contextualLookup'
import { COMPANION_EFFORT_TYPED, COMPANION_EFFORT_VOICE, COMPANION_MODEL, type CompanionEffort } from '../companionModel'
import { libraryAssistantSystem, type LibraryCatalogue, type LibraryShelf } from '../lab/libraryLibrarian'
import type { ChapterChatAction } from '../types'
import { parseAuthorship } from './authorship'
import { buildChapterChatInstructions, parseChapterChatAction, type PrimerChapterAction } from './chapterChatPrompt'
import { buildLabAskInstructionParts, type LabAskContext, type LabAskInstructionOptions, type LabAskInstructionParts, type ShownExplanation } from './labAskPrompt'
import {
  ASK_DOCUMENT_LINE,
  COUNTERPOINT_PROMPT,
  DEFINE_SENSE_PROMPT,
  FACTCHECK_NO_SEARCH_NOTE,
  PASSAGE_IMAGE_LINE,
  PDF_CITATION_RULE,
  PDF_CONTEXTUAL_LOOKUP_PROMPT,
  MARGIN_LAB_ASK_POLICY,
  MARGIN_ANSWER_RULES,
  PDF_COUNTERPOINT_PROMPT,
  PDF_DOCUMENT_WORDING,
  PDF_EXPLAIN_PROMPT,
  QUIZ_CHECK_PROMPT,
  RELATED_PROMPT,
  SIMPLIFY_PROMPT,
  WHOLE_PDF_PROMPT,
  factcheckPrompt,
  quizPrompt,
  ASK_SOURCE_SEARCH_LINE,
  quizAskedBlock,
  type QuizAsked,
} from './marginPrompts'
import { PRIMER_MAX_TOKENS, buildPrimerInstructions, buildPrimerTask, primerPages, primerUserTurn } from './primerPrompt'
import { buildMarginPrefixParts, buildMarginVolatile, parseMarginDocument, parseMarginPassages, type MarginDocument, type MarginPassage } from './marginContext'
import { MARGIN_ROUTES, marginRouteKey, type MarginRoute } from './marginRoutes'

/**
 * `simplify` … `related` are the margin reader's actions (docs/margin/PROMPTS.md),
 * sent by the PDF reader only for now; the book reader never calls them.
 */
export type CompanionIntent =
  | 'ask' | 'explain' | 'define' | 'chapter' | 'library'
  | 'simplify' | 'define_sense' | 'factcheck' | 'counterpoint' | 'quiz' | 'quiz_check' | 'related'

/** Actions on a selected passage: they take the passage image and, for a PDF, the citation rule. */
export type PassageIntent = 'simplify' | 'factcheck' | 'counterpoint' | 'quiz' | 'related'
export const PASSAGE_INTENTS: ReadonlySet<CompanionIntent> = new Set<CompanionIntent>(['simplify', 'factcheck', 'counterpoint', 'quiz', 'related'])

/** Answered by COMPANION_LOOKUP_MODEL (which takes no effort setting); everything else by COMPANION_MODEL. */
// quiz_check left the lookup model on 20 Oct 2026 (Anders): marked on the companion model, with thinking.
export const COMPANION_LOOKUP_INTENTS: ReadonlySet<CompanionIntent> = new Set<CompanionIntent>(['explain', 'define', 'simplify', 'define_sense'])

export interface QuizCheck {
  question: string
  expected: string
  why?: string
  /** What the reader typed or dictated. */
  answer: string
  /** The quiz's line on the author's own position, and its key ideas: the grader's context (Anders, 20 Oct 2026). */
  thesis?: string
  ideas?: string[]
  /** The key idea this question tests, and the passage quizzed (a passage quiz): what the grader marks against. */
  idea?: string
  passage?: string
  /**
   * A reply under the marking (Anders, 20 Oct 2026): the earlier turns on this question, oldest first, the reader's first
   * answer, then the grader's marking and the reader's reply in turn, ending with a marking; `answer` is then the reader's
   * newest reply. At most QUIZ_CHECK_FOLLOW_UPS replies per question.
   */
  turns?: QuizTurn[]
}

export interface QuizTurn {
  role: 'reader' | 'grader'
  text: string
  /** A marking's verdict. */
  verdict?: 'right' | 'nearly' | 'not_yet'
}

export interface CompanionRequest {
  intent: CompanionIntent
  /** Reader context for ask / explain / define / chapter. */
  context?: LabAskContext
  /** The selected passage (explain) or word (define). */
  selection?: string
  /**
   * Fetched ahead of a tap (the reader may never ask): Explain, Define, or Before you start made as a PDF opens.
   * Metered as `explain_speculative`, never against an allowance.
   */
  speculative?: boolean
  /**
   * Chapter action; `target` carries the next chapter's paragraphs for `prepare`.
   * `primer` (Before you start) is a user's own PDF only: see parsePrimerRequest.
   */
  chapter?: {
    action: ChapterChatAction | PrimerChapterAction
    target?: string[]
    activity?: { questions: string[]; highlights: string[] }
  }
  /** Library librarian: the book whose preparation pages are open, if any. */
  library?: { contextBookId?: string | null; shelf?: LibraryShelf | null }
  /** Ask only: quick-model explanations the reader was shown, framed as unverified context. */
  shownExplanations?: ShownExplanation[]
  /**
   * The context is a user's own file in the PDF reader (context.kind 'pdf'
   * or 'epub', no registry bookId): the margin's routes, rules and, for a
   * PDF, the citation rule. Never set for a registered book.
   */
  pdf?: true
  /** With `pdf`: the file is an EPUB (chapters, no page numbers, never a passage image). */
  epub?: true
  /** Ask on a user's PDF about the whole file (the margin's Chat): adds WHOLE_PDF_PROMPT. Never set for a registered book. */
  whole?: true
  /** define_sense: the dictionary's senses, in dictionary order (numbered from 1 in the prompt). */
  senses?: string[]
  /** quiz_check: the question, its expected answer and the reader's answer. */
  quizCheck?: QuizCheck
  /** quiz: the questions asked before on the same text ("Try new questions"), each with its key idea and whether it was missed. */
  asked?: QuizAsked[]
  /**
   * The PDF reader's margin only (`pdf`): the reader's whole file as text,
   * the cached prefix of every margin prompt (marginContext.ts). Never set
   * for a registered book.
   */
  document?: MarginDocument
  /**
   * A question on a long document (`document.part`): the passages the reader's
   * device found by searching the whole book for it, after the cached prefix
   * (FIXES-2026-10-15, long books, item 8). Never set otherwise.
   */
  passages?: MarginPassage[]
}

/** The card shows the first paragraph whole, then "More". The opener's word
 *  cap is what keeps it to two or three lines on a phone; the rest is capped
 *  at three short paragraphs so the expanded card stays a glance, not a read. */
export const LAB_EXPLAIN_PROMPT = [
  'Explain this selected passage for a reader at this point in the book.',
  'First paragraph: the answer itself, one sentence, at most 25 words. It must stand alone. If the passage is a name or place, say what it is and why it is here, nothing more. Then a blank line.',
  'Then at most three short paragraphs of useful detail, most important first. Skip any paragraph that only adds background.',
  'Do not repeat the full selected passage. Discuss its meaning and significance without using knowledge from later in the work.',
].join('\n\n')

/** A quiz retry sends at most this many earlier questions, each at most this long. */
export const QUIZ_ASKED_MAX = 24
export const QUIZ_ASKED_CHARS = 300
/** The passage a quiz answer is marked against, at most this long. */
export const QUIZ_CHECK_PASSAGE_CHARS = 4000
/** A reader may reply under a marking this many times per question; each earlier turn is kept to QUIZ_TURN_CHARS. */
export const QUIZ_CHECK_FOLLOW_UPS = 3
export const QUIZ_TURN_CHARS = 600
const QUIZ_VERDICT_NAMES: ReadonlySet<string> = new Set(['right', 'nearly', 'not_yet'])
/**
 * The earlier turns of a reply under the marking: reader, grader, reader, …, grader (an even number, at most two per
 * reply allowed before this one). -> [] for none, or null when they are malformed (the request is refused).
 */
function quizTurns(raw: unknown): QuizTurn[] | null {
  if (raw == null) return []
  if (!Array.isArray(raw) || raw.length % 2 !== 0 || raw.length > 2 * QUIZ_CHECK_FOLLOW_UPS) return null
  const turns: QuizTurn[] = []
  for (const [i, item] of raw.entries()) {
    const t = item && typeof item === 'object' ? item as Record<string, unknown> : null
    const role = i % 2 === 0 ? 'reader' : 'grader'
    const said = t ? text(t.text, QUIZ_TURN_CHARS) : undefined
    if (!t || t.role !== role || !said) return null
    const verdict = role === 'grader' && typeof t.verdict === 'string' && QUIZ_VERDICT_NAMES.has(t.verdict) ? t.verdict as QuizTurn['verdict'] : undefined
    turns.push({ role, text: said, ...(verdict ? { verdict } : {}) })
  }
  return turns
}

/** Output bound per intent. The Worker never uses a caller-supplied value. */
export const COMPANION_MAX_TOKENS: Readonly<Record<CompanionIntent, number>> = Object.freeze({
  // A chat answer is as long as its question needs: 1024 cut a long answer off mid-word (iPhone, 29 Oct 2026,
  // "Paul goes on in chap"). Only the words written are paid for.
  ask: 4096,
  explain: 450,
  define: 450,
  chapter: 4096,
  library: 900,
  simplify: 450,
  define_sense: 60,
  factcheck: 900,
  counterpoint: 600,
  // Up to eight questions, each with its idea, answer and reason (Anders, 20 Oct 2026: one question per key idea), and
  // room for the companion model's thinking, which counts toward the bound.
  quiz: 6000,
  // Two or three short sentences of feedback, on the companion model with thinking (Anders, 20 Oct 2026).
  quiz_check: 2000,
  related: 500,
})

/** Before you start: the request is a primer on a user's own PDF. */
export function isPrimerRequest(request: CompanionRequest): request is CompanionRequest & { chapter: { action: PrimerChapterAction } } {
  return request.intent === 'chapter' && request.chapter?.action.kind === 'primer'
}

/** The output bound for a parsed request: a primer has its own (PROMPTS.md), every other request its intent's. */
export function companionMaxTokens(request: CompanionRequest): number {
  return isPrimerRequest(request) ? PRIMER_MAX_TOKENS : COMPANION_MAX_TOKENS[request.intent]
}

/** Paragraphs on each side of the reader's place sent with Explain and Define. */
export const COMPANION_NEARBY_PARAGRAPHS = 3

/** Explain and Define are short, single-turn answers: the smaller model serves them. */
export const COMPANION_LOOKUP_MODEL = 'claude-haiku-4-5'

export const COMPANION_INTENT_EFFORT: Readonly<Record<CompanionIntent, CompanionEffort>> = Object.freeze({
  ask: COMPANION_EFFORT_TYPED,
  explain: COMPANION_EFFORT_VOICE,
  define: COMPANION_EFFORT_VOICE,
  chapter: COMPANION_EFFORT_TYPED,
  // Short recommendations from a supplied list: start answering sooner.
  library: COMPANION_EFFORT_VOICE,
  // The lookup-model intents send no effort (Haiku takes none); listed for completeness.
  simplify: COMPANION_EFFORT_VOICE,
  define_sense: COMPANION_EFFORT_VOICE,
  quiz_check: COMPANION_EFFORT_VOICE,
  factcheck: COMPANION_EFFORT_TYPED,
  counterpoint: COMPANION_EFFORT_TYPED,
  quiz: COMPANION_EFFORT_TYPED,
  related: COMPANION_EFFORT_TYPED,
})

export function companionModelFor(intent: CompanionIntent): string {
  return COMPANION_LOOKUP_INTENTS.has(intent) ? COMPANION_LOOKUP_MODEL : COMPANION_MODEL
}

/**
 * How a request counts against the reader's AI allowance (worker/routes/chat.ts
 * maps it to an AiFeature): `explain` is never blocked but counts toward the
 * bar; `free` is never charged (metered as explain_speculative); `chat` is
 * charged like Ask; `librarian` is its own feature.
 */
export type CompanionAllowance = 'explain' | 'free' | 'chat' | 'librarian'
export function companionAllowance(request: CompanionRequest): CompanionAllowance {
  switch (request.intent) {
    case 'explain':
    case 'define':
    case 'simplify':
      return request.speculative ? 'free' : 'explain'
    case 'define_sense':
    case 'quiz_check':
      return 'free'
    case 'chapter':
      // Before you start made ahead, as the PDF opens (Anders, 19 Oct 2026): Tinct's cost, like a speculative
      // Explain. Made when the reader opens it, it counts like Ask.
      return request.speculative && isPrimerRequest(request) ? 'free' : 'chat'
    case 'library':
      return 'librarian'
    default:
      // ask, factcheck, counterpoint, related, and quiz (one request writes the whole quiz).
      return 'chat'
  }
}

const INTENTS = new Set<CompanionIntent>(['ask', 'explain', 'define', 'chapter', 'library', 'simplify', 'define_sense', 'factcheck', 'counterpoint', 'quiz', 'quiz_check', 'related'])
const ID_RE = /^[a-z0-9][a-z0-9-]{0,99}$/i
const LABEL_CHARS = 300
const ANGLE_CHARS = 1_000
const PERSONAL_HISTORY_CHARS = 8_000
const SELECTION_CHARS = 6_000
const PARAGRAPH_CHARS = 20_000
const MAX_PARAGRAPHS = 5_000
/** Only ~30K characters of a chapter reach the prompt; the rest is never read. */
const CHAPTER_CHARS = 200_000
const MAX_TRAIL = 20
const ACTIVITY_ITEMS = 10
const WORD_CHARS = 200
const MAX_SENSES = 5
const SENSE_CHARS = 500
const QUIZ_FIELD_CHARS = 1_000
const QUIZ_ANSWER_CHARS = 2_000
/**
 * define_sense and quiz_check: the cached document plus at most this much of
 * their own input (FIXES-2026-10-15 PR C, cost). Enforced here, whatever the
 * client sends: the word and its senses, or the question, expected answer,
 * reason and the reader's answer, together.
 */
export const OWN_INPUT_CHARS = 2_000
const QUIZ_CHECK_BUDGET = { question: 500, expected: 400, why: 300 } as const

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : undefined
}

function int(value: unknown, min: number, max: number): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : undefined
}

function paragraphList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const out: string[] = []
  let total = 0
  for (const item of value.slice(0, MAX_PARAGRAPHS)) {
    if (typeof item !== 'string') return null
    if (total >= CHAPTER_CHARS) break
    const clipped = item.slice(0, Math.min(PARAGRAPH_CHARS, CHAPTER_CHARS - total))
    total += clipped.length
    out.push(clipped)
  }
  return out
}

/** A page of a user's PDF in the excerpt: its printed label when the PDF has one, else its page index. */
export interface PdfExcerptPage {
  /** Printed page label ("xii", "12", "A-3") or the 1-based page index. */
  n: string | number
  text: string
}

/** Printed labels are short words of letters, digits, dots and dashes; anything else is not trusted into the prompt. */
const PAGE_LABEL_RE = /^[\p{L}\p{N}](?:[\p{L}\p{N}.\-\u2013]{0,14}[\p{L}\p{N}])?$/u

/** A safe page label, or null. */
export function pdfPageLabel(value: unknown): string | null {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 1 && value <= 100_000 ? String(value) : null
  if (typeof value !== 'string') return null
  const label = value.trim()
  return PAGE_LABEL_RE.test(label) ? label : null
}

/** One page of the excerpt with its boundary marked, as the PDF citation rule expects. */
export function formatPdfPage(label: string, pageText: string): string {
  return `<page n="${label}">\n${pageText.trim()}\n</page>`
}

/**
 * The excerpt with `<page n="…">` boundaries, one entry per page, in order.
 * A page with an unusable label takes its place in the excerpt (1-based) as
 * its label. Bounded like chapter paragraphs. Null when malformed.
 */
export function pdfPageParagraphs(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const out: string[] = []
  let total = 0
  for (const [index, item] of value.slice(0, MAX_PARAGRAPHS).entries()) {
    if (!item || typeof item !== 'object') return null
    const page = item as Record<string, unknown>
    if (typeof page.text !== 'string') return null
    if (total >= CHAPTER_CHARS) break
    const clipped = page.text.slice(0, Math.min(PARAGRAPH_CHARS, CHAPTER_CHARS - total))
    total += clipped.length
    out.push(formatPdfPage(pdfPageLabel(page.n) ?? String(index + 1), clipped))
  }
  return out
}

/** The same excerpt as one text, for a client that wants to show or log what is sent. */
export function formatPdfExcerpt(pages: readonly PdfExcerptPage[]): string {
  return (pdfPageParagraphs(pages) ?? []).join('\n\n')
}

interface ParsedContext { context: LabAskContext; pdf: boolean; epub: boolean }

function parseContext(raw: unknown): ParsedContext | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const bookId = typeof c.bookId === 'string' && ID_RE.test(c.bookId) ? c.bookId : undefined
  // A user's own file in the PDF reader, never a registered book: kind 'pdf' (or 'epub') and no bookId.
  const epub = c.kind === 'epub' && !bookId
  const pdf = (c.kind === 'pdf' || epub) && !bookId
  const paragraphs = pdf && c.pages !== undefined ? pdfPageParagraphs(c.pages) : paragraphList(c.paragraphs)
  const bookTitle = text(c.bookTitle, LABEL_CHARS)
  const chapterLabel = text(c.chapterLabel, LABEL_CHARS)
  if (!paragraphs || !bookTitle || !chapterLabel) return null
  const authorship = parseAuthorship(c.authorship)
  const editionKey = typeof c.editionKey === 'string' && ID_RE.test(c.editionKey) ? c.editionKey : undefined
  const trail = Array.isArray(c.readingTrail)
    ? c.readingTrail.slice(-MAX_TRAIL).flatMap(entry => {
        if (!entry || typeof entry !== 'object') return []
        const e = entry as Record<string, unknown>
        const chapterNumber = int(e.chapterNumber, 1, 5_000)
        const label = text(e.label, LABEL_CHARS)
        if (chapterNumber === undefined || !label) return []
        return [{ chapterNumber, label, openingLine: text(e.openingLine, LABEL_CHARS), recap: text(e.recap, ANGLE_CHARS) }]
      })
    : undefined
  const context: LabAskContext = {
    bookTitle,
    bookAuthor: text(c.bookAuthor, LABEL_CHARS) ?? '',
    ...(authorship ? { authorship } : {}),
    chapterLabel,
    chapterNumber: int(c.chapterNumber, 1, 5_000),
    editionLabel: text(c.editionLabel, LABEL_CHARS),
    paragraphs,
    paragraphIndex: int(c.paragraphIndex, 0, MAX_PARAGRAPHS) ?? 0,
    readingAngle: text(c.readingAngle, ANGLE_CHARS),
    bookId,
    editionKey,
    lookups: c.lookups === false ? false : undefined,
    chapterCount: int(c.chapterCount, 1, 5_000),
    pageNumber: int(c.pageNumber, 1, 100_000),
    totalPages: int(c.totalPages, 1, 100_000),
    readingTrail: trail && trail.length ? trail : undefined,
    personalHistory: text(c.personalHistory, PERSONAL_HISTORY_CHARS),
  }
  return { context, pdf, epub }
}

const SHOWN_EXPLANATIONS = 3
const SHOWN_PASSAGE_CHARS = 1_200
const SHOWN_TEXT_CHARS = 4_000

/** The newest few, bounded; malformed entries are dropped, never an error. */
function parseShownExplanations(value: unknown): ShownExplanation[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value.flatMap(entry => {
    if (!entry || typeof entry !== 'object') return []
    const e = entry as Record<string, unknown>
    const body = text(e.text, SHOWN_TEXT_CHARS)
    if (!body) return []
    const passage = text(e.passage, SHOWN_PASSAGE_CHARS)
    return [{ ...(passage ? { passage } : {}), text: body }]
  }).slice(-SHOWN_EXPLANATIONS)
  return items.length ? items : undefined
}

function stringItems(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(-ACTIVITY_ITEMS) : []
}

/** Shelf ids from the library, bounded; anything malformed is dropped, never an error. */
export const SHELF_MAX_PER_GROUP = 30
function parseShelf(raw: unknown): LibraryShelf | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const ids = (value: unknown) => Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && ID_RE.test(id)))].slice(0, SHELF_MAX_PER_GROUP)
    : []
  return { reading: ids(r.reading), saved: ids(r.saved), finished: ids(r.finished) }
}

/**
 * Before you start on a user's own PDF: the context says `kind: 'pdf'` and
 * carries no bookId at all (a registered book never asks for a primer, so
 * one that does is refused), and the unit's text comes as
 * `pages: [{ n, text }]`, marked page by page for citations. The unit title
 * stands in for the chapter label when none is sent.
 */
function parsePrimerRequest(r: Record<string, unknown>, chapter: Record<string, unknown>): CompanionRequest | null {
  const c = r.context && typeof r.context === 'object' ? r.context as Record<string, unknown> : null
  // A reader's own PDF, or since 20 Oct 2026 their own EPUB (its units are chapters; Before you start for each essay).
  if (!c || (c.kind !== 'pdf' && c.kind !== 'epub') || c.bookId !== undefined || !Array.isArray(c.pages)) return null
  const action = parseChapterChatAction(chapter.action, null)
  if (!action) return null
  const parsed = parseContext({ ...c, chapterLabel: c.chapterLabel ?? action.unitTitle, pages: primerPages(c.pages), paragraphs: undefined })
  if (!parsed?.pdf || !parsed.context.paragraphs.some(page => /^<page n="[^"]*">\n\S/.test(page))) return null
  const document = parseMarginDocument(r.document)
  // Made ahead of the reader opening it (the PDF reader's primerPrefetch): never charged (companionAllowance).
  return { intent: 'chapter', context: { ...parsed.context, lookups: false }, chapter: { action }, pdf: true, ...(parsed.epub ? { epub: true as const } : {}), ...(document ? { document } : {}), ...(r.speculative === true ? { speculative: true } : {}) }
}

/** Validates and bounds a structured request. `null` = not a valid companion request. */
export function parseCompanionRequest(raw: unknown): CompanionRequest | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const intent = r.intent as CompanionIntent
  if (!INTENTS.has(intent)) return null
  if (intent === 'library') {
    const lib = r.library && typeof r.library === 'object' ? r.library as Record<string, unknown> : {}
    const contextBookId = typeof lib.contextBookId === 'string' && ID_RE.test(lib.contextBookId) ? lib.contextBookId : null
    return { intent, library: { contextBookId, shelf: parseShelf(lib.shelf) } }
  }
  if (intent === 'chapter' && r.chapter && typeof r.chapter === 'object' && (r.chapter as { action?: { kind?: unknown } }).action?.kind === 'primer') {
    return parsePrimerRequest(r, r.chapter as Record<string, unknown>)
  }
  const parsed = parseContext(r.context)
  if (!parsed) return null
  const { context } = parsed
  // The margin's whole document rides only on a user's own file, never on a registered book.
  // An EPUB's document is its chapters; a PDF's, its pages.
  const document = parsed.pdf ? parseMarginDocument(r.document) : null
  const epub = parsed.epub || document?.kind === 'epub'
  // A long document's search results: only with a part of a document, and only for a question.
  const passages = document?.part && intent === 'ask' ? parseMarginPassages(r.passages) : null
  const pdf = parsed.pdf ? { pdf: true as const, ...(epub ? { epub: true as const } : {}), ...(document ? { document } : {}), ...(passages ? { passages } : {}) } : {}
  // Related is the PDF reader's margin only.
  if (intent === 'related' && !parsed.pdf) return null
  // Simplify is never fetched ahead of a tap (FIXES-2026-10-15 PR C, cost).
  if (intent === 'simplify' && r.speculative === true) return null
  if (intent === 'explain' || intent === 'define' || intent === 'simplify') {
    const selection = text(r.selection, SELECTION_CHARS)
    if (!selection) return null
    return { intent, context: { ...context, lookups: false }, selection, ...(r.speculative === true ? { speculative: true } : {}), ...pdf }
  }
  if (intent === 'factcheck' || intent === 'counterpoint' || intent === 'related') {
    const selection = text(r.selection, SELECTION_CHARS)
    if (!selection) return null
    return { intent, context: { ...context, lookups: false }, selection, ...pdf }
  }
  if (intent === 'quiz') {
    // No selection: a quiz on the whole supplied chapter (or PDF unit).
    const selection = text(r.selection, SELECTION_CHARS)
    // A retry: the questions asked before (Anders, 20 Oct 2026: "Try new questions" gave the same ones).
    const asked = Array.isArray(r.asked) ? r.asked.slice(0, QUIZ_ASKED_MAX).flatMap((raw): QuizAsked[] => {
      const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null
      const q = item ? text(item.q, QUIZ_ASKED_CHARS) : undefined
      if (!q) return []
      const idea = text(item!.idea, QUIZ_ASKED_CHARS)
      return [{ q, ...(idea ? { idea } : {}), ...(item!.missed === true ? { missed: true } : {}) }]
    }) : []
    return { intent, context: { ...context, lookups: false }, ...(selection ? { selection } : {}), ...(asked.length ? { asked } : {}), ...pdf }
  }
  if (intent === 'define_sense') {
    const selection = text(r.selection, WORD_CHARS)
    const all = Array.isArray(r.senses)
      ? r.senses.slice(0, 20).map(item => text(item, SENSE_CHARS)).filter((item): item is string => Boolean(item)).slice(0, MAX_SENSES)
      : []
    if (!selection || all.length === 0) return null
    // The word and its senses together stay within OWN_INPUT_CHARS: later senses are cut, then dropped.
    const senses: string[] = []
    let room = OWN_INPUT_CHARS - selection.length
    for (const sense of all) {
      if (room <= 0) break
      senses.push(sense.slice(0, room))
      room -= senses[senses.length - 1].length
    }
    if (senses.length === 0) return null
    return { intent, context: { ...context, lookups: false }, selection, senses, ...pdf }
  }
  if (intent === 'quiz_check') {
    const q = r.quiz && typeof r.quiz === 'object' ? r.quiz as Record<string, unknown> : null
    // Within OWN_INPUT_CHARS in all: the question, expected answer and reason in their budgets, the reader's answer the rest.
    const question = q ? text(q.question, QUIZ_CHECK_BUDGET.question) : undefined
    const expected = q ? text(q.expected, QUIZ_CHECK_BUDGET.expected) : undefined
    if (!question || !expected) return null
    const why = text(q!.why, QUIZ_CHECK_BUDGET.why)
    const answer = text(q!.answer, Math.min(QUIZ_ANSWER_CHARS, OWN_INPUT_CHARS - question.length - expected.length - (why?.length ?? 0)))
    if (!answer) return null
    // What the grader needs to know the author's position (Anders, 20 Oct 2026): the quiz's thesis line and key ideas.
    const thesis = text(q!.thesis, QUIZ_ASKED_CHARS)
    const idea = text(q!.idea, QUIZ_ASKED_CHARS)
    const passage = text(q!.passage, QUIZ_CHECK_PASSAGE_CHARS)
    const ideas = Array.isArray(q!.ideas) ? (q!.ideas as unknown[]).slice(0, 8).map(item => text(item, 200)).filter((item): item is string => Boolean(item)) : []
    // A reply under the marking carries the earlier turns on this question (at most QUIZ_CHECK_FOLLOW_UPS replies).
    const turns = quizTurns(q!.turns)
    if (!turns) return null
    return { intent, context: { ...context, lookups: false }, quizCheck: { question, expected, ...(why ? { why } : {}), answer, ...(thesis ? { thesis } : {}), ...(ideas.length ? { ideas } : {}), ...(idea ? { idea } : {}), ...(passage ? { passage } : {}), ...(turns.length ? { turns } : {}) }, ...pdf }
  }
  if (intent === 'chapter') {
    const chapter = r.chapter && typeof r.chapter === 'object' ? r.chapter as Record<string, unknown> : null
    if (!chapter || !context.bookId) return null
    const action = parseChapterChatAction(chapter.action, context.bookId)
    if (!action) return null
    let target: string[] | undefined
    if (action.kind === 'prepare') {
      const list = paragraphList(chapter.target)
      if (!list || !list.some(item => item.trim())) return null
      target = list
    }
    const rawActivity = chapter.activity && typeof chapter.activity === 'object' ? chapter.activity as Record<string, unknown> : null
    const activity = rawActivity ? { questions: stringItems(rawActivity.questions), highlights: stringItems(rawActivity.highlights) } : undefined
    return { intent, context, chapter: { action, ...(target ? { target } : {}), ...(activity ? { activity } : {}) } }
  }
  const shownExplanations = parseShownExplanations(r.shownExplanations)
  const whole = intent === 'ask' && parsed.pdf && r.scope === 'whole' ? { whole: true as const } : {}
  return { intent, context, ...(shownExplanations ? { shownExplanations } : {}), ...pdf, ...whole }
}

/**
 * What the Worker knows about a request beyond its body: whether the latest
 * user turn carries the passage image, whether a source search can run
 * (factcheck), and today's date (factcheck; ISO, filled server-side).
 */
export interface CompanionBuildExtras {
  catalogue?: LibraryCatalogue | null
  image?: boolean
  sourceSearch?: boolean
  today?: string
}

/** Today's date as the Worker states it to Fact-check: YYYY-MM-DD, UTC. */
export function companionToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** A user's own PDF (not an EPUB, not a registered book). */
const isPdfFile = (request: CompanionRequest) => Boolean(request.pdf && !request.epub)

/** The action text, last in the prompt, for the margin reader's intents. */
function marginTask(request: CompanionRequest, extras: CompanionBuildExtras): string[] {
  const image = extras.image ? [PASSAGE_IMAGE_LINE] : []
  switch (request.intent) {
    case 'simplify': return [SIMPLIFY_PROMPT, ...image]
    // A PDF is a document, never a chapter (FIXES-2026-10-15, second paper); an EPUB keeps its chapters.
    case 'counterpoint': return [isPdfFile(request) ? PDF_COUNTERPOINT_PROMPT : COUNTERPOINT_PROMPT, ...image]
    case 'related': return [RELATED_PROMPT, ...image]
    case 'quiz': return [quizPrompt(request.selection ? 'passage' : 'chapter', { pdf: isPdfFile(request) }), ...image]
    case 'factcheck': return [
      factcheckPrompt(extras.today || companionToday()),
      ...(extras.sourceSearch ? [] : [FACTCHECK_NO_SEARCH_NOTE]),
      ...image,
    ]
    case 'define_sense': return [DEFINE_SENSE_PROMPT]
    case 'quiz_check': return [QUIZ_CHECK_PROMPT]
    // A question in the PDF reader's margin: the document before our own explanation; on a PDF passage, the image line, as Explain has it.
    // About the whole PDF: its own rules too (WHOLE_PDF_PROMPT).
    case 'ask': return request.pdf ? [...(request.whole ? [WHOLE_PDF_PROMPT] : []), ASK_DOCUMENT_LINE, ...(extras.sourceSearch ? [ASK_SOURCE_SEARCH_LINE] : []), ...(extras.image ? [PASSAGE_IMAGE_LINE] : [])] : []
    default: return []
  }
}

/** Options for the shared builder: the passage window, the PDF citation rule, the action text. */
function instructionOptions(request: CompanionRequest, extras: CompanionBuildExtras): LabAskInstructionOptions {
  // The PDF reader's rules: the shared answer rules for every margin intent, a PDF's wording, and the page
  // citation rule for a PDF (an EPUB has no page numbers).
  const plain = request.pdf ? [...MARGIN_ANSWER_RULES, ...(isPdfFile(request) ? [PDF_DOCUMENT_WORDING] : [])] : []
  const citations = [...(isPdfFile(request) && (request.intent === 'ask' || PASSAGE_INTENTS.has(request.intent)) ? [PDF_CITATION_RULE] : []), ...plain]
  switch (request.intent) {
    case 'explain':
    case 'define':
      return { nearby: COMPANION_NEARBY_PARAGRAPHS, ...(plain.length ? { rules: plain } : {}) }
    case 'ask':
      return { shownExplanations: request.shownExplanations, rules: citations, task: marginTask(request, extras) }
    case 'quiz':
      // A chapter quiz needs the whole chapter; a passage quiz, the passage's neighbourhood.
      return { ...(request.selection ? { nearby: COMPANION_NEARBY_PARAGRAPHS } : {}), rules: citations, task: marginTask(request, extras) }
    default:
      return { nearby: COMPANION_NEARBY_PARAGRAPHS, rules: citations, task: marginTask(request, extras) }
  }
}

/** The system prompt for a parsed request. `catalogue` is required for `library`. */
export function buildCompanionSystem(request: CompanionRequest, extras: CompanionBuildExtras = {}): string {
  switch (request.intent) {
    case 'library':
      return libraryAssistantSystem(extras.catalogue ?? null, request.library?.contextBookId ?? null, request.library?.shelf ?? null)
    case 'chapter': {
      const chapter = request.chapter!
      const context = request.context!
      // Before you start (a user's PDF only): its own builder, so a book's chapter actions are untouched.
      if (chapter.action.kind === 'primer') return buildPrimerInstructions(chapter.action, context)
      const target = chapter.action.kind === 'prepare' ? chapter.target ?? [] : context.paragraphs
      return buildChapterChatInstructions({ action: chapter.action, context, activity: chapter.activity }, target)
    }
    default: {
      const parts = buildCompanionSystemParts(request, extras)!
      return [parts.stable, parts.volatile].filter(Boolean).join('\n\n')
    }
  }
}

/**
 * Ask, Explain, Define and the margin actions split into a part that is the
 * same for every question in the chapter (cached by the Worker) and the part
 * that moves with the reader (labAskPrompt.buildLabAskInstructionParts); the
 * action text goes last, in the moving part. `null` for intents built in one
 * piece (library, chapter actions). Joined, the parts are exactly
 * buildCompanionSystem.
 */
export function buildCompanionSystemParts(request: CompanionRequest, extras: CompanionBuildExtras = {}): LabAskInstructionParts | null {
  if (request.intent === 'library' || request.intent === 'chapter') return null
  // The PDF reader's margin opens with its own wording of the policy (no "supplied"); the book reader's is unchanged.
  const options = instructionOptions(request, extras)
  return buildLabAskInstructionParts(request.context!, request.pdf ? { ...options, policy: MARGIN_LAB_ASK_POLICY } : options)
}

/** The reader's data inside our own wrapper tags cannot close or open one of them. */
function tagData(value: string): string {
  return value.replace(/<\/?(?:selected_passage|word|senses|question|expected|why|reader_answer|reader_reply|your_marking)(?:\s[^<>]*)?\s*>/gi, '')
}

/** Explain, Define and the margin actions carry no conversation: the one user turn is built here. */
export function companionSelectionMessage(request: CompanionRequest): string | null {
  if (isPrimerRequest(request)) return primerUserTurn(request.chapter.action)
  switch (request.intent) {
    case 'define':
      return `${request.pdf ? PDF_CONTEXTUAL_LOOKUP_PROMPT : CONTEXTUAL_LOOKUP_PROMPT}\n<word>${request.selection}</word>`
    case 'explain':
      // The PDF reader's Explain (FIXES-2026-10-15 A2); the book reader's is unchanged.
      return request.pdf
        ? `${PDF_EXPLAIN_PROMPT}\n\n<selected_passage>\n${tagData(request.selection!)}\n</selected_passage>`
        : `${LAB_EXPLAIN_PROMPT}\n\n<selected_passage>\n${request.selection}\n</selected_passage>`
    case 'simplify':
    case 'factcheck':
    case 'counterpoint':
    case 'related':
      return `<selected_passage>\n${tagData(request.selection!)}\n</selected_passage>`
    case 'quiz': {
      const asked = request.asked?.length ? `\n\n${quizAskedBlock(request.asked.map(item => ({ q: tagData(item.q), ...(item.idea ? { idea: tagData(item.idea) } : {}), ...(item.missed ? { missed: true } : {}) })))}` : ''
      return request.selection
        ? `<selected_passage>\n${tagData(request.selection)}\n</selected_passage>${asked}`
        : `Quiz me on ${request.context!.chapterLabel}.${asked}`
    }
    case 'define_sense': {
      const senses = (request.senses ?? []).map((sense, index) => `${index + 1}. ${tagData(sense).replace(/\s+/g, ' ').trim()}`).join('\n')
      return `<word>${tagData(request.selection!)}</word>\n<senses>\n${senses}\n</senses>`
    }
    case 'quiz_check': {
      const q = request.quizCheck!
      const position = q.thesis ? `<author_position>${tagData(q.thesis)}</author_position>\n` : ''
      const ideas = q.ideas?.length ? `<key_ideas>\n${q.ideas.map((idea, i) => `${i + 1}. ${tagData(idea)}`).join('\n')}\n</key_ideas>\n` : ''
      // Marked against the key idea and the passage, the expected answer only a hint (Anders, 20 Oct 2026).
      const passage = q.passage ? `<passage>\n${tagData(q.passage)}\n</passage>\n` : ''
      const idea = q.idea ? `<key_idea>${tagData(q.idea)}</key_idea>\n` : ''
      // A reply under the marking: the first answer, each marking and reply in turn, then the newest reply.
      const thread = q.turns?.length
        ? `<reader_answer>${tagData(q.turns[0].text)}</reader_answer>\n${q.turns.slice(1).map(t => (t.role === 'grader' ? `<your_marking${t.verdict ? ` verdict="${t.verdict}"` : ''}>${tagData(t.text)}</your_marking>` : `<reader_reply>${tagData(t.text)}</reader_reply>`)).join('\n')}\n<reader_reply>${tagData(q.answer)}</reader_reply>`
        : `<reader_answer>${tagData(q.answer)}</reader_answer>`
      return `${position}${ideas}${passage}${idea}<question>${tagData(q.question)}</question>\n<one_acceptable_answer>${tagData(q.expected)}</one_acceptable_answer>\n<why>${tagData(q.why ?? '')}</why>\n${thread}`
    }
    default:
      return null
  }
}

/**
 * Passage actions take the passage image in their one user turn; on a PDF so
 * do Explain and Define on a phrase (FIXES-2026-10-15 A4). An EPUB sends none.
 */
export function companionTakesPassageImage(request: CompanionRequest): boolean {
  if (request.epub || request.document?.kind === 'epub') return false
  if (PASSAGE_INTENTS.has(request.intent)) return true
  return Boolean(request.pdf) && (request.intent === 'explain' || (request.intent === 'define' && /\s/.test(request.selection ?? '')))
}

/** The PDF reader's model, effort and output bound (marginRoutes.ts); null for every other request. */
export function marginRequestRoute(request: CompanionRequest): MarginRoute | null {
  if (!request.pdf) return null
  const key = marginRouteKey(request.intent, request.chapter?.action.kind)
  return key ? MARGIN_ROUTES[key] : null
}

/** The page label a PDF context's place is on: the marker of the page at paragraphIndex. */
function contextPlace(context: LabAskContext): string | null {
  const page = context.paragraphs[Math.max(0, Math.min(context.paragraphs.length - 1, context.paragraphIndex))] ?? ''
  return /^<page n="([^"]*)">/.exec(page)?.[1] ?? null
}

/** The margin's system prompt: `stable` and (a long document's part) `part` each end at a cache breakpoint; `volatile` follows. */
export interface MarginSystemParts extends LabAskInstructionParts {
  part?: string
}

/**
 * A margin request with its whole document (marginContext.ts): the cached
 * prefix (rules and the document, nothing per request) and the part after the
 * breakpoint (the reader's place, the action). Null without a document.
 */
export function buildMarginSystemParts(request: CompanionRequest, extras: CompanionBuildExtras = {}): MarginSystemParts | null {
  const doc = request.document
  const context = request.context
  if (!doc || !context || !request.pdf) return null
  const prefix = buildMarginPrefixParts(doc, { title: context.bookTitle, author: context.bookAuthor })
  const primer = isPrimerRequest(request)
  const image = extras.image && (request.intent === 'explain' || request.intent === 'define') ? [PASSAGE_IMAGE_LINE] : []
  const task = primer ? [buildPrimerTask(request.chapter.action, context, doc)] : [...marginTask(request, extras), ...image]
  task.push('If the edition or the reader’s question is Danish, answer in Danish unless they request another language. This includes Simplify; keep structured response keys unchanged.')
  const volatile = buildMarginVolatile({
    kind: doc.kind,
    place: primer ? null : contextPlace(context),
    total: context.totalPages,
    shown: request.intent === 'ask' ? request.shownExplanations : undefined,
    passages: request.passages,
    task,
  })
  return { stable: prefix.stable, ...(prefix.part ? { part: prefix.part } : {}), volatile }
}

/**
 * Fact-check always searches; Ask in the margin reader (a passage question, a follow-up, the whole file: `ask` on a
 * reader's own PDF or EPUB) has the same search as a tool the model may call when the question needs current or outside
 * facts (Anders, 20 Oct 2026: no "Web" toggle, the model decides). Never prefetched for Ask (factcheckSourceQuery is
 * Fact-check's alone), so a question the document answers costs no search.
 */
export function companionUsesSourceSearch(request: CompanionRequest): boolean {
  return request.intent === 'factcheck' || (request.intent === 'ask' && Boolean(request.pdf))
}
/** Whether the search runs before the model answers (Fact-check) or only when the model calls it (Ask). */
export function companionPrefetchesSources(request: CompanionRequest): boolean {
  return request.intent === 'factcheck'
}

const SOURCE_QUERY_CHARS = 1_000

/** The prefetched source search for Fact-check: the passage, with the document it comes from. */
export function factcheckSourceQuery(request: CompanionRequest): string {
  const context = request.context!
  const from = `From "${context.bookTitle}"${context.bookAuthor ? ` by ${context.bookAuthor}` : ''}.`
  const head = 'Check the factual claims in this passage against reliable current sources: '
  const room = SOURCE_QUERY_CHARS - head.length - from.length - 1
  const passage = (request.selection ?? '').replace(/\s+/g, ' ').trim().slice(0, Math.max(0, room))
  return `${head}${passage}\n${from}`
}

/** Book lookups (read_chapter / find_in_book) are offered to typed chat and chapter actions only. */
export function companionBookRef(request: CompanionRequest): { bookId: string; editionKey: string; chapterNumber?: number } | null {
  if (request.intent !== 'ask' && request.intent !== 'chapter') return null
  const context = request.context
  if (!context?.bookId || !context.editionKey) return null
  return {
    bookId: context.bookId,
    editionKey: context.editionKey,
    ...(typeof context.chapterNumber === 'number' ? { chapterNumber: context.chapterNumber } : {}),
  }
}

export function companionTrailChapters(request: CompanionRequest): number[] {
  if (request.intent !== 'ask') return []
  return (request.context?.readingTrail ?? []).map(entry => entry.chapterNumber)
}
