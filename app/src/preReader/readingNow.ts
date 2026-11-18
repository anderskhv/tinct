/**
 * "What am I reading": one list for every surface that shows it — the library's
 * reading table, My shelf's Currently reading and the reader's book switcher
 * ("Reading now"), on the reader's pages and on Add a book's viewer.
 *
 * Membership and order come from here only:
 * - Tinct's books: the reading list (libraryRecap.readingList: in progress, not
 *   finished by the shared rule in bookFinished.ts), less every book the reader
 *   took off the list since last reading it (`removedSince`): My shelf's ×, the
 *   desk's × (Saved for later) and the position record's hide stamp.
 * - The reader's own books (PDF, EPUB): those with a saved place not taken off
 *   since (userBook/ownShelf.ts `ownReadingNow`), from this device and the
 *   account's private copies (userBook/ownSync.ts `ownShelfWithAccount`).
 * - One order: most recently read first (`mergeReadingNow`).
 *
 * Nothing here reads or writes storage; callers pass what they read.
 */
import { readingList, type ReadingList, type ReadingListInput, type ReadingListRow } from './libraryRecap'

/** The library's explicit shelf membership (libraryTwoSaved.ts): removals, with their times (0 = unknown). */
export interface ShelfMembership {
  removed: readonly string[]
  tableHidden: readonly string[]
  removedAt?: Readonly<Record<string, number>>
  tableHiddenAt?: Readonly<Record<string, number>>
}

/**
 * One rule for every removal of a book being read: it hides the book only while
 * it is at least as new as the book's latest reading, so reading the book again
 * brings it back. An unknown removal time (0) stays hidden.
 */
export function removedSince(at: Readonly<Record<string, number>> | undefined, ids: readonly string[], bookId: string, readAt: number | null | undefined): boolean {
  if (!ids.includes(bookId)) return false
  const removedAt = at?.[bookId] ?? 0
  return removedAt <= 0 || removedAt >= (readAt ?? 0)
}

/** Whether the reader took this book off "Reading now" since last reading it (any of the three removals). */
export function takenOffReadingNow(
  row: Pick<ReadingListRow, 'bookId' | 'lastActiveAt'>,
  membership: ShelfMembership | null | undefined,
  hidden: Readonly<Record<string, number>> | null | undefined,
): boolean {
  if (membership && removedSince(membership.removedAt, membership.removed, row.bookId, row.lastActiveAt)) return true
  if (membership && removedSince(membership.tableHiddenAt, membership.tableHidden, row.bookId, row.lastActiveAt)) return true
  const hiddenAt = hidden?.[row.bookId] ?? 0
  return hiddenAt > 0 && hiddenAt >= row.lastActiveAt
}

export interface ReadingNowList extends ReadingList {
  /** Every book in progress, removed ones included: their resume targets are still the reader's place. */
  inProgress: ReadingListRow[]
  /** Every finished book, removed ones included: finishing a book stays a fact (spoilers, profiles). */
  allFinished: ReadingList['finished']
}

/**
 * From this time on a removal ("Remove from my books", Anders 2026-10-20) also
 * takes a finished book off the Finished shelf. Earlier removals are ignored
 * there, as the 2026-10-07 rule did ("finished books stay"), so no book
 * finished and removed back then disappears now.
 */
export const FINISHED_REMOVAL_SINCE = Date.UTC(2026, 9, 20)

/** Whether the reader removed this finished book from their books after finishing it. */
export function removedFromFinished(
  row: { bookId: string; finishedAt: number | null },
  membership: ShelfMembership | null | undefined,
): boolean {
  if (!membership?.removed.includes(row.bookId)) return false
  const removedAt = membership.removedAt?.[row.bookId] ?? 0
  return removedAt >= FINISHED_REMOVAL_SINCE && removedAt >= (row.finishedAt ?? 0)
}

/**
 * Tinct's books being read, as every surface lists them: `readingNow` is the
 * list shown (newest first), `finished` the Finished shelf, `inProgress` every
 * in-progress row (for resuming a removed book at its place).
 */
export function readingNowList(input: ReadingListInput & { membership?: ShelfMembership | null }): ReadingNowList {
  const { membership, ...rest } = input
  const hidden = input.positions?.hidden ?? null
  // The hide stamp is applied below with the other removals, so the in-progress
  // rows still carry removed books' places.
  const list = readingList({ ...rest, positions: input.positions ? { ...input.positions, hidden: {} } : null })
  return {
    readingNow: list.readingNow.filter(row => !takenOffReadingNow(row, membership, hidden)),
    finished: list.finished.filter(row => !removedFromFinished(row, membership)),
    inProgress: list.readingNow,
    allFinished: list.finished,
  }
}

/**
 * Tinct's books and the reader's own in one list, most recently read first.
 * `id` names a row; an own row replaces a Tinct row of the same id. Equal times
 * keep Tinct's order, then the own books' order.
 */
export function mergeReadingNow<T>(tinct: readonly T[], own: readonly T[], id: (row: T) => string, lastActiveAt: (row: T) => number | null | undefined): T[] {
  if (own.length === 0) return [...tinct]
  const ownIds = new Set(own.map(id))
  return [...tinct.filter(row => !ownIds.has(id(row))), ...own].sort((a, b) => (lastActiveAt(b) ?? 0) - (lastActiveAt(a) ?? 0))
}
