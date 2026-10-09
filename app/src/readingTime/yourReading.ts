/**
 * The Your reading page's figures (social ship 1), from the ledger stats, the
 * reader's position record and the library catalogue. Pure, so the page and
 * its tests agree.
 */
import type { LabPositionState } from '../lab/labPosition'
import { finishedBookIdsFor, positionPlacesByBook, type LibraryBookInfo } from '../preReader/libraryRecap'
import { emptyReadingMemory, type ReadingMemoryState } from '../readingMemory'
import { booksComparison, formatDuration, type ReadingTimeStats } from './model'
import { PRIVATE_BOOK_ID, PRIVATE_BOOK_LABEL, isPrivateBucket } from './privateBook'

export interface CatalogueEntry {
  id: string
  title: string
  author?: string
  wordCount?: number | null
  art?: { src?: string | null } | null
  readingStructure?: { chapters?: Array<{ number: number; title: string; paragraphCount?: number }> } | null
}

export interface ShelfBook {
  bookId: string
  title: string
  author: string
  cover: string | null
  /** "Ch. 14 of 24" for a book in progress. */
  progress: string | null
  hours: string | null
}

export interface YourReadingView {
  finishedCount: number
  chaptersCount: number
  comparison: string | null
  readingNow: ShelfBook[]
  finished: ShelfBook[]
}

/** Default reading speed of the library's estimates (library-model.js). */
const WORDS_PER_MINUTE = 250

/** The book's chapter numbers per the catalogue; empty when its structure is unknown. */
export function chapterNumbersOf(book: CatalogueEntry | undefined): number[] {
  return (book?.readingStructure?.chapters ?? []).map(chapter => chapter.number)
}

export function yourReadingView(input: {
  stats: ReadingTimeStats
  positions: LabPositionState | null
  catalogue: Map<string, CatalogueEntry>
  /**
   * Books the classic reader recorded as finished (`book-completed:*`,
   * completed `progress:*`), as the library's Finished shelf counts them.
   * The lab record's finished chapters only exist since September 2026.
   */
  completedBookIds?: ReadonlySet<string>
  /** Books the reader explicitly marked read. */
  markedReadBookIds?: ReadonlySet<string>
  /** Reading-memory sessions (device mirror): completed ones count as finished chapters, as in the library. */
  memory?: ReadingMemoryState
  viewer?: string | null
}): YourReadingView {
  const { stats, positions, catalogue } = input
  const infos = new Map<string, LibraryBookInfo>([...catalogue.values()].map(book => [book.id, {
    id: book.id,
    title: book.title,
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({ number: chapter.number, title: chapter.title, paragraphCount: chapter.paragraphCount ?? 0 })),
  }]))
  // The library's own rule and evidence (libraryRecap.finishedBookIdsFor), so the two views agree.
  // An own book is never finished or placed by its id here; its time shows as the private bucket.
  const finishedIds = [...finishedBookIdsFor({
    memory: input.memory ?? emptyReadingMemory(),
    viewer: input.viewer ?? null,
    positions,
    books: infos,
    completedBookIds: input.completedBookIds,
    markedReadBookIds: input.markedReadBookIds,
  })].sort().filter(id => !isPrivateBucket(id))
  const finishedSet = new Set(finishedIds)
  const chaptersCount = Object.values(positions?.finished ?? {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0)
  const secondsBy = new Map(stats.books.map(book => [book.bookId, book]))
  const hoursOf = (bookId: string) => {
    const seconds = secondsBy.get(bookId)?.seconds ?? 0
    return seconds >= 60 ? formatDuration(seconds) : null
  }
  const shelfBook = (bookId: string, progress: string | null): ShelfBook | null => {
    // The reader's own books: one "a private book", no cover, never an id or title.
    if (bookId === PRIVATE_BOOK_ID) return { bookId: PRIVATE_BOOK_ID, title: PRIVATE_BOOK_LABEL, author: '', cover: null, progress: null, hours: hoursOf(PRIVATE_BOOK_ID) }
    if (isPrivateBucket(bookId)) return null
    const book = catalogue.get(bookId)
    if (!book) return null
    return { bookId, title: book.title, author: book.author ?? '', cover: book.art?.src ?? null, progress, hours: hoursOf(bookId) }
  }

  const places = positionPlacesByBook(positions, infos, infos.get('bible')?.chapters ?? [])
  const reading: Array<{ book: ShelfBook; at: number }> = []
  for (const [bookId, place] of places) {
    if (finishedSet.has(bookId) || isPrivateBucket(bookId)) continue
    const hiddenAt = positions?.hidden?.[bookId] ?? 0
    if (hiddenAt > 0 && hiddenAt >= place.updatedAt) continue
    const chapters = infos.get(bookId)?.chapters ?? []
    const index = chapters.findIndex(chapter => chapter.number === place.sequentialChapter)
    const progress = index >= 0 && chapters.length > 1 ? `Ch. ${index + 1} of ${chapters.length}` : null
    const book = shelfBook(bookId, progress)
    if (book) reading.push({ book, at: place.updatedAt })
  }
  // Books with ledger time but no place on this device's record still count as being read.
  for (const entry of stats.books) {
    if (finishedSet.has(entry.bookId) || places.has(entry.bookId)) continue
    const book = shelfBook(entry.bookId, null)
    if (book && entry.lastDay) reading.push({ book, at: Date.parse(entry.lastDay) })
  }
  reading.sort((a, b) => b.at - a.at)

  const finished = finishedIds
    .flatMap(bookId => { const book = shelfBook(bookId, null); return book ? [book] : [] })
    .sort((a, b) => (secondsBy.get(b.bookId)?.lastDay ?? '').localeCompare(secondsBy.get(a.bookId)?.lastDay ?? '') || a.title.localeCompare(b.title))

  // The comparison uses the book the reader has spent most time in.
  const top = [...stats.books].sort((a, b) => b.seconds - a.seconds).find(book => (catalogue.get(book.bookId)?.wordCount ?? 0) > 0)
  const topBook = top ? catalogue.get(top.bookId) : null
  const comparison = topBook ? booksComparison(stats.totalSeconds, { title: topBook.title, minutes: Math.max(1, Math.round((topBook.wordCount ?? 0) / WORDS_PER_MINUTE)) }) : null

  return { finishedCount: finishedIds.length, chaptersCount, comparison, readingNow: reading.map(item => item.book), finished }
}
