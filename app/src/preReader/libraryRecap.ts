/**
 * Returning-reader helpers for the locked /lab library.
 *
 * Pure functions over the reading-memory public API and the reader's own
 * position store: which books are being read (and which are finished), where
 * "Continue" must land for each of them, and what the hero says. Nothing here
 * fabricates: chapter labels are the ones the reader recorded, the headline
 * says where in the chapter the reader is from the recorded paragraph and the
 * chapter's length ("You’re in the middle of Proverbs 17"), and "finished" is
 * only ever the session's own completed state, the reader's finished-chapter
 * record, or the app's own `book-completed` mark.
 *
 * Two stores, one target. Reading memory records sessions for the recap; the
 * reader's position store (`tinct-lab-position`, per-book records plus
 * `lastSettledBookId`) is the reader's own truth about where it last was —
 * it is written on every page turn, dwell and hide, while a memory session
 * only advances when the rendered page changes. Continue therefore resumes at
 * whichever record is newer, and the recap text is shown only when it
 * describes that place.
 */
import { summaryMatchesSession, visibleToViewer, type ReadingMemoryState, type ReadingSession } from '../readingMemory'
import { READING_SESSION_GAP_MS } from '../readingMemory/recorder'
import { isHiddenFromReadingNow } from '../lab/labPosition'
import type { LabBookPlace, LabPositionState } from '../lab/labPosition'
import { chapterProgress, includesPreviousChapter, positionLine, type ChapterProgress } from './recapPosition'

export type LibraryMode = 'new' | 'returning'

export interface LibraryChapterRef {
  number: number
  title: string
  /** Paragraphs in the visible reading edition; missing when the catalogue did not say. */
  paragraphCount?: number
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
  /** Paragraphs in the chapter per the catalogue; null when unknown. */
  paragraphCount: number | null
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
  /** Where in the chapter Continue resumes: drives the hero headline. */
  progress: ChapterProgress
  /** The "so far" summary should cover the previous chapter too (finished, same sitting or barely into this one). */
  includePreviousChapter: boolean
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
      paragraphCount: chapterParagraphCount(book, place.sequentialChapter),
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
    paragraphCount: chapterParagraphCount(book, session.anchor.chapterNumber),
    source: 'memory',
    at: session.lastActiveAt,
  }
}

/** Paragraphs in a chapter per the catalogue's reading structure; null when it did not say. */
export function chapterParagraphCount(book: LibraryBookInfo | undefined, chapterNumber: number): number | null {
  const count = book?.chapters.find(item => item.number === chapterNumber)?.paragraphCount
  return typeof count === 'number' && Number.isFinite(count) && count > 0 ? Math.floor(count) : null
}

/**
 * Whether the reader finished the chapter Continue resumes in. A memory
 * anchor says so itself (`completed`); a position record says so only when
 * the reader's finished-chapter record lists the chapter AND the record
 * still sits in its last paragraph — a reader who turned back into a
 * finished chapter is in the middle of it again.
 */
export function chapterFinishedAt(input: {
  target: Pick<ContinueTarget, 'bookId' | 'chapterNumber' | 'paragraphIndex' | 'paragraphCount' | 'source'>
  session: ReadingSession | null
  finishedChapters: ReadonlySet<number>
}): boolean {
  const { target, session } = input
  const sameChapter = session !== null && session.anchor.bookId === target.bookId && session.anchor.chapterNumber === target.chapterNumber
  const sessionCompleted = sameChapter && session.state === 'completed'
  if (target.source === 'memory') return sessionCompleted
  const atLastParagraph = target.paragraphCount !== null && target.paragraphIndex >= target.paragraphCount - 1
  if (input.finishedChapters.has(target.chapterNumber) && atLastParagraph) return true
  return sessionCompleted && session !== null && target.paragraphIndex >= session.anchor.paragraphIndex
}

/**
 * The previous chapter was read in the same sitting: a visible session for
 * it ended within the session gap of when this chapter's session began (or,
 * without one, of the resume record itself).
 */
export function previousChapterSameSitting(input: {
  memory: ReadingMemoryState
  viewer: string | null
  target: Pick<ContinueTarget, 'bookId' | 'chapterNumber' | 'at'>
  session: ReadingSession | null
}): boolean {
  const { target, session } = input
  const visible = visibleToViewer(input.viewer)
  const sameChapter = session !== null && session.anchor.bookId === target.bookId && session.anchor.chapterNumber === target.chapterNumber
  const startedAt = sameChapter ? session.startedAt : target.at
  return Object.values(input.memory.sessions).some(candidate =>
    visible(candidate)
    && candidate.anchor.bookId === target.bookId
    && candidate.anchor.chapterNumber === target.chapterNumber - 1
    && candidate.lastActiveAt <= startedAt
    && startedAt - candidate.lastActiveAt <= READING_SESSION_GAP_MS)
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
 * The reader has moved back into a finished book: the position pin sits in
 * an earlier chapter, or on an earlier page of the final chapter than the
 * completed session reached. A pin written at that same final page — the
 * reader leaving the page writes one on hide/pagehide — is not re-reading,
 * so it must not demote the book. A pin older than the completion is stale.
 */
export function movedBackIntoBook(input: {
  place: LabBookPlace
  lastChapter: number
  /** The completed final-chapter session, when there is one. */
  session: ReadingSession | null
}): boolean {
  const { place, lastChapter, session } = input
  if (session && place.updatedAt <= session.lastActiveAt) return false
  if (place.sequentialChapter < lastChapter) return true
  if (!session || place.sequentialChapter !== lastChapter) return false
  return (place.pageIndex ?? 0) + 1 < session.anchor.page
}

/**
 * Reading now (every in-progress book the reader has not taken off the list,
 * newest first by the newer of the two stores) and Finished (newest session completed on the book's final chapter,
 * the position record's finished mark on that chapter, or an app
 * `book-completed` mark). A finished book returns to Reading now only when
 * the reader has since moved back into it (`movedBackIntoBook`).
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
    const lastChapter = lastChapterNumber(book)
    const finishedBySession = session !== null && session.state === 'completed' && lastChapter !== null && lastChapter === session.anchor.chapterNumber
    const finishedByMark = lastChapter !== null && (input.positions?.finished?.[bookId] ?? []).includes(lastChapter)
    const readingAgain = place !== null && lastChapter !== null
      && movedBackIntoBook({ place, lastChapter, session: finishedBySession ? session : null })
    if (completedMarks.has(bookId) || ((finishedBySession || finishedByMark) && !readingAgain)) {
      finished.push({ bookId, finishedAt: session?.completedAt ?? session?.lastActiveAt ?? null, session })
      continue
    }
    // Taken off the list by the reader. Nothing about the book was deleted —
    // the place, the notes, the highlights and the chat are all still there,
    // and reading it again writes a newer place, which lists it once more.
    if (input.positions && isHiddenFromReadingNow(input.positions, bookId)) continue
    const finishedChapters = new Set<number>(input.positions?.finished?.[bookId] ?? [])
    const progress = chapterProgress({
      paragraphIndex: target.paragraphIndex,
      paragraphCount: target.paragraphCount,
      finished: chapterFinishedAt({ target, session, finishedChapters }),
    })
    const previousFinished = finishedChapters.has(target.chapterNumber - 1)
      || Object.values(input.memory.sessions).some(candidate => visibleToViewer(input.viewer)(candidate)
        && candidate.anchor.bookId === bookId && candidate.anchor.chapterNumber === target.chapterNumber - 1 && candidate.state === 'completed')
    readingNow.push({
      bookId,
      target,
      lastActiveAt: Math.max(session?.lastActiveAt ?? 0, place?.updatedAt ?? 0),
      session,
      recap: recapForTarget(session, target),
      progress,
      includePreviousChapter: includesPreviousChapter({
        chapterNumber: target.chapterNumber,
        progress,
        previousChapterFinished: previousFinished,
        sameSitting: previousChapterSameSitting({ memory: input.memory, viewer: input.viewer, target, session }),
      }),
    })
  }
  readingNow.sort((a, b) => b.lastActiveAt - a.lastActiveAt)
  finished.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
  return { readingNow, finished }
}

/**
 * The hero headline: where in the chapter the place Continue resumes in is —
 * "You’re at the start of / in the middle of / near the end of Proverbs 17",
 * or "You finished Proverbs 17" when that is what the records say. The "so
 * far" summary is a separate line the client fills in under it.
 */
export function heroHeadline(row: Pick<ReadingListRow, 'target' | 'progress'>): string {
  return positionLine(row.progress, row.target.chapterLabel)
}

/** Label under an in-progress row: "Last time · Book 1". */
export function inProgressLabel(row: { target: Pick<ContinueTarget, 'chapterLabel'> }): string {
  return `Last time · ${row.target.chapterLabel}`
}
