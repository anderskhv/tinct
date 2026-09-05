/**
 * Returning-reader helpers for the locked /lab library.
 *
 * Pure functions over the reading-memory public API: which mode the library
 * is in, what the recap headline says, and which other books are in
 * progress. Nothing here fabricates: the headline is the stored summary or
 * the exact excerpt, chapter labels are the ones the reader recorded, and
 * "completed" is only ever the session's own state.
 */
import { visibleToViewer, type ReadingMemoryState, type ReadingSession, type RecapCard } from '../readingMemory'

export type LibraryMode = 'new' | 'returning'

export const RECAP_HEADLINE_MAX_CHARS = 180

export interface InProgressRow {
  bookId: string
  editionKey: string
  chapterNumber: number
  chapterLabel: string
  /** 0-based rendered page for the reader handoff. */
  pageIndex: number
  paragraphIndex: number
  lastActiveAt: number
  completed: boolean
}

export function libraryModeFor(recap: { card: RecapCard } | null | undefined): LibraryMode {
  return recap?.card ? 'returning' : 'new'
}

/** "Last time you read · Genesis 1" — the chapter label the reader recorded. */
export function recapEyebrow(card: Pick<RecapCard, 'provenance'>): string {
  return `Last time you read · ${card.provenance.anchor.chapterLabel}`
}

function trimToWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const cut = text.slice(0, maxChars)
  const atWord = cut.lastIndexOf(' ')
  return `${(atWord > maxChars * 0.6 ? cut.slice(0, atWord) : cut).replace(/[\s,;:—–-]+$/, '')}…`
}

/**
 * The recap headline: the stored summary when present, else the exact
 * excerpt (quoted, trimmed at a word boundary and marked with an ellipsis so
 * a cut is never passed off as the whole passage), else the truthful
 * location line from the card ("You stopped in …" / "You finished …").
 */
export function recapHeadline(card: Pick<RecapCard, 'body' | 'bodyKind' | 'headline'>, maxChars = RECAP_HEADLINE_MAX_CHARS): string {
  const body = card.body.trim()
  if (card.bodyKind === 'summary' && body) return body
  if (card.bodyKind === 'excerpt' && body) return `“${trimToWord(body, maxChars)}”`
  return card.headline
}

function newer(a: ReadingSession, b: ReadingSession): boolean {
  return a.lastActiveAt > b.lastActiveAt || (a.lastActiveAt === b.lastActiveAt && a.seq > b.seq)
}

/**
 * Other books in progress: the newest visible session per book, excluding
 * the hero book, newest first, at most `max`.
 */
export function otherBooksInProgress(
  state: ReadingMemoryState,
  viewer: string | null,
  excludeBookId: string | null,
  max = 4,
): InProgressRow[] {
  const visible = visibleToViewer(viewer)
  const latestByBook = new Map<string, ReadingSession>()
  for (const session of Object.values(state.sessions)) {
    if (!visible(session)) continue
    if (session.anchor.bookId === excludeBookId) continue
    const current = latestByBook.get(session.anchor.bookId)
    if (!current || newer(session, current)) latestByBook.set(session.anchor.bookId, session)
  }
  return [...latestByBook.values()]
    .sort((a, b) => (newer(a, b) ? -1 : newer(b, a) ? 1 : 0))
    .slice(0, Math.max(0, max))
    .map(session => ({
      bookId: session.anchor.bookId,
      editionKey: session.anchor.editionKey,
      chapterNumber: session.anchor.chapterNumber,
      chapterLabel: session.anchor.chapterLabel,
      pageIndex: Math.max(0, session.anchor.page - 1),
      paragraphIndex: session.anchor.paragraphIndex,
      lastActiveAt: session.lastActiveAt,
      completed: session.state === 'completed',
    }))
}

/** Label under an in-progress row: "Last time · Book 1". */
export function inProgressLabel(row: Pick<InProgressRow, 'chapterLabel'>): string {
  return `Last time · ${row.chapterLabel}`
}
