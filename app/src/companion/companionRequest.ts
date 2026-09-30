/**
 * Structured companion requests. The reader sends what it is looking at
 * (book, edition, chapter, paragraph, selection, chapter action) and the
 * Worker builds the system prompt, the output bound and the effort from it
 * with the shared builders. The client never sends a system prompt.
 * Pure: no browser or Worker APIs.
 */
import { CONTEXTUAL_LOOKUP_PROMPT } from '../components/reader/contextualLookup'
import { COMPANION_EFFORT_TYPED, COMPANION_EFFORT_VOICE, type CompanionEffort } from '../companionModel'
import { libraryAssistantSystem, type LibraryCatalogue } from '../lab/libraryLibrarian'
import type { ChapterChatAction } from '../types'
import { buildChapterChatInstructions, parseChapterChatAction } from './chapterChatPrompt'
import { buildLabAskInstructions, type LabAskContext } from './labAskPrompt'

export type CompanionIntent = 'ask' | 'explain' | 'define' | 'chapter' | 'library'

export interface CompanionRequest {
  intent: CompanionIntent
  /** Reader context for ask / explain / define / chapter. */
  context?: LabAskContext
  /** The selected passage (explain) or word (define). */
  selection?: string
  /** Chapter action; `target` carries the next chapter's paragraphs for `prepare`. */
  chapter?: {
    action: ChapterChatAction
    target?: string[]
    activity?: { questions: string[]; highlights: string[] }
  }
  /** Library librarian: the book whose preparation pages are open, if any. */
  library?: { contextBookId?: string | null }
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

/** Output bound per intent. The Worker never uses a caller-supplied value. */
export const COMPANION_MAX_TOKENS: Readonly<Record<CompanionIntent, number>> = Object.freeze({
  ask: 1024,
  explain: 450,
  define: 450,
  chapter: 1024,
  library: 900,
})

export const COMPANION_INTENT_EFFORT: Readonly<Record<CompanionIntent, CompanionEffort>> = Object.freeze({
  ask: COMPANION_EFFORT_TYPED,
  explain: COMPANION_EFFORT_VOICE,
  define: COMPANION_EFFORT_VOICE,
  chapter: COMPANION_EFFORT_TYPED,
  library: COMPANION_EFFORT_TYPED,
})

const INTENTS = new Set<CompanionIntent>(['ask', 'explain', 'define', 'chapter', 'library'])
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

function parseContext(raw: unknown): LabAskContext | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const paragraphs = paragraphList(c.paragraphs)
  const bookTitle = text(c.bookTitle, LABEL_CHARS)
  const chapterLabel = text(c.chapterLabel, LABEL_CHARS)
  if (!paragraphs || !bookTitle || !chapterLabel) return null
  const bookId = typeof c.bookId === 'string' && ID_RE.test(c.bookId) ? c.bookId : undefined
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
  return {
    bookTitle,
    bookAuthor: text(c.bookAuthor, LABEL_CHARS) ?? '',
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
}

function stringItems(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(-ACTIVITY_ITEMS) : []
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
    return { intent, library: { contextBookId } }
  }
  const context = parseContext(r.context)
  if (!context) return null
  if (intent === 'explain' || intent === 'define') {
    const selection = text(r.selection, SELECTION_CHARS)
    if (!selection) return null
    return { intent, context: { ...context, lookups: false }, selection }
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
  return { intent, context }
}

/** The system prompt for a parsed request. `catalogue` is required for `library`. */
export function buildCompanionSystem(request: CompanionRequest, extras: { catalogue?: LibraryCatalogue | null } = {}): string {
  switch (request.intent) {
    case 'library':
      return libraryAssistantSystem(extras.catalogue ?? null, request.library?.contextBookId ?? null)
    case 'chapter': {
      const chapter = request.chapter!
      const context = request.context!
      const target = chapter.action.kind === 'prepare' ? chapter.target ?? [] : context.paragraphs
      return buildChapterChatInstructions({ action: chapter.action, context, activity: chapter.activity }, target)
    }
    default:
      return buildLabAskInstructions(request.context!)
  }
}

/** Explain and define carry no conversation: the one user turn is built here. */
export function companionSelectionMessage(request: CompanionRequest): string | null {
  if (request.intent === 'define') return `${CONTEXTUAL_LOOKUP_PROMPT}\n<word>${request.selection}</word>`
  if (request.intent === 'explain') return `${LAB_EXPLAIN_PROMPT}\n\n<selected_passage>\n${request.selection}\n</selected_passage>`
  return null
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
