/**
 * Returning-reader helpers for the locked /lab library.
 *
 * Pure functions over the reading-memory public API and the reader's own
 * position store: which books are being read (and which are finished), where
 * "Continue" must land for each of them, and what the hero says. Nothing here
 * fabricates: chapter labels are the ones the reader recorded, the headline
 * is the stored summary or the exact excerpt, and "finished" is only ever the
 * session's own completed state on the final chapter or the app's own
 * `book-completed` mark.
 *
 * Two stores, one target. Reading memory records sessions for the recap; the
 * reader's position store (`tinct-lab-position`, per-book records plus
 * `lastSettledBookId`) is the reader's own truth about where it last was —
 * it is written on every page turn, dwell and hide, while a memory session
 * only advances when the rendered page changes. Continue therefore resumes at
 * whichever record is newer, and the recap text is shown only when it
 * describes that place.
 */
import { summaryMatchesSession, visibleToViewer, type ReadingMemoryState, type ReadingSession, type RecapCard } from '../readingMemory'
import type { LabBookPlace, LabPositionState } from '../lab/labPosition'

export type LibraryMode = 'new' | 'returning'

export const RECAP_HEADLINE_MAX_CHARS = 180

export interface LibraryChapterRef {
  number: number
  title: string
}

/** What the library knows about a catalogue book for resolving places. */
export interface LibraryBookInfo {
  id: string
  title: string
  /** Sequential chapters of the visible reading edition (may be empty). */
  chapters: LibraryChapterRef[]
}

export interface ContinueTarget {
  bookId: string
  /** Edition the place was recorded in; null when neither store recorded one. */
  editionKey: string | null
  /** Edition-sequential chapter number (Genesis 1 = 1, Daniel 7 = 857). */
  chapterNumber: number
  chapterLabel: string
  /** 0-based rendered page for the reader handoff. */
  pageIndex: number
  paragraphIndex: number
  source: 'position' | 'memory'
  /** Clock value of the winning record. */
  at: number
}

export interface ReadingListRow {
  bookId: string
  target: ContinueTarget
  /** Newer of the two stores' timestamps; drives the ordering. */
  lastActiveAt: number
  /** Newest visible reading-memory session for the book, if any. */
  session: ReadingSession | null
  /** Stored automatic summary, only when it describes the chapter Continue resumes in. */
  recap: string | null
}

export interface FinishedRow {
  bookId: string
  /** Completion clock value when a session recorded one; null for an app mark without a session. */
  finishedAt: number | null
  session: ReadingSession | null
}

export interface ReadingList {
  readingNow: ReadingListRow[]
  finished: FinishedRow[]
}

export interface ReadingListInput {
  memory: ReadingMemoryState
  viewer: string | null
  /** The reader's position store (local, or local merged with the cloud copy); null when unreadable. */
  positions: LabPositionState | null
  books: ReadonlyMap<string, LibraryBookInfo>
  /** Books the app marked `book-completed:*`. */
  completedBookIds?: ReadonlySet<string>
}

export function libraryModeFor(list: Pick<ReadingList, 'readingNow' | 'finished'> | null | undefined): LibraryMode {
  return list && (list.readingNow.length > 0 || list.finished.length > 0) ? 'returning' : 'new'
}

/** "Last time you read · Genesis 1" — the chapter label of the place Continue resumes in. */
export function recapEyebrow(chapterLabel: string): string {
  return `Last time you read · ${chapterLabel}`
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

/** "Chapter 1 — Loomings" → "Chapter 1"; labels the reader already shows, unchanged otherwise. */
export function compactChapterTitle(title: string | null | undefined, fallback: string): string {
  return String(title || fallback).split(/\s+[—–-]\s+/)[0].trim() || fallback
}

function newer(a: ReadingSession, b: ReadingSession): boolean {
  return a.lastActiveAt > b.lastActiveAt || (a.lastActiveAt === b.lastActiveAt && a.seq > b.seq)
}

/** Newest visible session per book. */
export function newestSessionsByBook(state: ReadingMemoryState, viewer: string | null): Map<string, ReadingSession> {
  const visible = visibleToViewer(viewer)
  const latest = new Map<string, ReadingSession>()
  for (const session of Object.values(state.sessions)) {
    if (!visible(session)) continue
    const current = latest.get(session.anchor.bookId)
    if (!current || newer(session, current)) latest.set(session.anchor.bookId, session)
  }
  return latest
}

/**
 * Which catalogue book a position record belongs to. The Bible is one
 * catalogue book but the reader pins it per biblical book (genesis, daniel…),
 * so a record whose id is not a catalogue book counts for `bible` when the
 * catalogue has it.
 */
export function catalogueBookIdForPlace(place: Pick<LabBookPlace, 'bookId'>, books: ReadonlyMap<string, unknown>): string | null {
  if (books.has(place.bookId)) return place.bookId
  return books.has('bible') ? 'bible' : null
}

/**
 * One position record per catalogue book. For the Bible the reader's own
 * resume rule applies: the settled book wins over a newer unsettled peek;
 * without a settled Bible book the newest record wins.
 */
export function positionPlacesByBook(positions: LabPositionState | null | undefined, books: ReadonlyMap<string, unknown>): Map<string, LabBookPlace> {
  const result = new Map<string, LabBookPlace>()
  if (!positions) return result
  const settledId = positions.lastSettledBookId && positions.books[positions.lastSettledBookId] ? positions.lastSettledBookId : null
  for (const place of Object.values(positions.books)) {
    const bookId = catalogueBookIdForPlace(place, books)
    if (!bookId) continue
    const current = result.get(bookId)
    if (!current) { result.set(bookId, place); continue }
    if (current.bookId === settledId) continue
    if (place.bookId === settledId || place.updatedAt > current.updatedAt) result.set(bookId, place)
  }
  return result
}

function placeLabel(book: LibraryBookInfo | undefined, place: LabBookPlace): string {
  const bibleScoped = book?.id === 'bible' && place.bookId !== 'bible'
  if (bibleScoped) return `${place.headerBook} ${place.chapterNumber}`
  const chapter = book?.chapters.find(item => item.number === place.sequentialChapter)
  return compactChapterTitle(chapter?.title, `Chapter ${place.sequentialChapter}`)
}

/**
 * Where Continue lands for one book: the position store when its record is
 * newer than the newest memory session (or there is no session), else the
 * memory anchor. Null when neither store knows the book.
 */
export function continueTargetFor(input: {
  book: LibraryBookInfo | undefined
  session: ReadingSession | null
  place: LabBookPlace | null
}): ContinueTarget | null {
  const { book, session, place } = input
  const bookId = book?.id ?? session?.anchor.bookId ?? null
  if (!bookId) return null
  const positionWins = place !== null && (session === null || place.updatedAt > session.lastActiveAt)
  if (positionWins && place) {
    return {
      bookId,
      editionKey: place.primaryEditionKey ?? session?.anchor.editionKey ?? null,
      chapterNumber: place.sequentialChapter,
      chapterLabel: placeLabel(book, place),
      pageIndex: Math.max(0, place.pageIndex ?? 0),
      paragraphIndex: Math.max(0, place.paragraphIndex),
      source: 'position',
      at: place.updatedAt,
    }
  }
  if (!session) return null
  return {
    bookId,
    editionKey: session.anchor.editionKey,
    chapterNumber: session.anchor.chapterNumber,
    chapterLabel: compactChapterTitle(session.anchor.chapterLabel, `Chapter ${session.anchor.chapterNumber}`),
    pageIndex: Math.max(0, session.anchor.page - 1),
    paragraphIndex: session.anchor.paragraphIndex,
    source: 'memory',
    at: session.lastActiveAt,
  }
}

function lastChapterNumber(book: LibraryBookInfo | undefined): number | null {
  if (!book || book.chapters.length === 0) return null
  return book.chapters.reduce((max, chapter) => Math.max(max, chapter.number), 0) || null
}

/** The stored summary, only when it describes the chapter Continue resumes in. */
export function recapForTarget(session: ReadingSession | null, target: ContinueTarget): string | null {
  if (!session) return null
  if (session.anchor.bookId !== target.bookId || session.anchor.chapterNumber !== target.chapterNumber) return null
  return summaryMatchesSession(session)?.text ?? null
}

/**
 * Reading now (every in-progress book, newest first by the newer of the two
 * stores) and Finished (newest session completed on the book's final chapter,
 * or an app `book-completed` mark). A book whose position record is newer
 * than its completed session is being read again and stays in Reading now.
 */
export function readingList(input: ReadingListInput): ReadingList {
  const sessions = newestSessionsByBook(input.memory, input.viewer)
  const places = positionPlacesByBook(input.positions, input.books)
  const completedMarks = input.completedBookIds ?? new Set<string>()
  const bookIds = new Set<string>([...sessions.keys(), ...places.keys()])
  const readingNow: ReadingListRow[] = []
  const finished: FinishedRow[] = []
  for (const bookId of bookIds) {
    const book = input.books.get(bookId)
    const session = sessions.get(bookId) ?? null
    const place = places.get(bookId) ?? null
    const target = continueTargetFor({ book, session, place })
    if (!target) continue
    const finishedBySession = session !== null && session.state === 'completed' && lastChapterNumber(book) === session.anchor.chapterNumber
    const readingAgain = finishedBySession && place !== null && place.updatedAt > session.lastActiveAt
    if (completedMarks.has(bookId) || (finishedBySession && !readingAgain)) {
      finished.push({ bookId, finishedAt: session?.completedAt ?? session?.lastActiveAt ?? null, session })
      continue
    }
    readingNow.push({
      bookId,
      target,
      lastActiveAt: Math.max(session?.lastActiveAt ?? 0, place?.updatedAt ?? 0),
      session,
      recap: recapForTarget(session, target),
    })
  }
  readingNow.sort((a, b) => b.lastActiveAt - a.lastActiveAt)
  finished.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  return { readingNow, finished }
}

/**
 * The hero headline. The recap card is used only when it was built from the
 * hero's own session, carries text (summary or excerpt) and Continue resumes
 * in that session's chapter; otherwise the stored summary (same condition),
 * else the truthful location line for the place Continue resumes in.
 */
export function heroHeadline(row: Pick<ReadingListRow, 'session' | 'target' | 'recap'>, card: Pick<RecapCard, 'body' | 'bodyKind' | 'headline' | 'provenance'> | null): string {
  const { session, target } = row
  const sameChapter = session !== null && session.anchor.bookId === target.bookId && session.anchor.chapterNumber === target.chapterNumber
  if (sameChapter && card && card.provenance.sessionId === session.id && card.bodyKind !== 'location-only' && card.body.trim()) return recapHeadline(card)
  if (sameChapter && row.recap) return row.recap
  if (sameChapter && session.state === 'completed') return `You finished ${target.chapterLabel}`
  return `You stopped in ${target.chapterLabel}`
}

/** Label under an in-progress row: "Last time · Book 1". */
export function inProgressLabel(row: { target: Pick<ContinueTarget, 'chapterLabel'> }): string {
  return `Last time · ${row.target.chapterLabel}`
}
