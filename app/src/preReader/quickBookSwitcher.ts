import type { ReadingMemoryState } from '../readingMemory'
import type { LabPositionState } from '../lab/labPosition'
import { completedBookIdsIn } from './libraryCompletion'
import { productionPlaces, withProductionPlaces } from './productionPositions'
import type { ContinueTarget, LibraryBookInfo } from './libraryRecap'
import { mergeReadingNow, readingNowList, type ShelfMembership } from './readingNow'
import { isPublicBookId } from '../../public/lab/public-books.js'
import { resolveBookCover } from '../../public/lab/book-cover.js'
import type { OwnShelfBook, OwnShelfReading } from '../lab/userBook/ownShelf'

export interface QuickBookCatalogueEntry {
  id: string
  title: string
  author?: string | null
  art?: { src: string; srcSet?: string } | null
  /** Generated-cover palette; its background is the book's tone when there is no art. */
  cover?: { background?: string } | null
  readingStructure?: {
    chapters?: Array<{ number: number; title: string; paragraphCount?: number }>
  } | null
}

export interface QuickBookRow {
  bookId: string
  title: string
  chapterLabel: string
  coverSrc: string | null
  coverSrcSet: string | null
  /** The generated cover's ground, for the fallback cover when there is no art. */
  coverTone: string | null
  /** For the paper cover, when there is no cover image (book-cover.js paperCover). */
  author?: string
  /** An own book's kind (`epub`, `pdf`), printed on its paper cover as My shelf prints it. */
  kind?: 'pdf' | 'epub'
  target: ContinueTarget
  lastActiveAt: number
  /**
   * Where the row opens, when it is not a Tinct book: a reader's own book opens
   * at its own URL (`/reader?userBook=<hex>`), at the place kept on this device.
   */
  href?: string
}

/** The reader's own books being read (userBook/ownShelf.ts), as switcher rows: same row, own cover. */
export function ownQuickBookRows(books: ReadonlyArray<OwnShelfBook & { reading: OwnShelfReading }>): QuickBookRow[] {
  return books.map(book => ({
    bookId: book.reading.bookId,
    title: book.title,
    chapterLabel: book.reading.chapterLabel,
    coverSrc: resolveBookCover({ bookId: book.reading.bookId, ownCover: book.cover, storedCover: book.storedCover })?.src ?? null,
    coverSrcSet: null,
    coverTone: null,
    author: book.author,
    kind: book.kind,
    target: {
      bookId: book.reading.bookId, editionKey: null, chapterNumber: book.reading.chapterNumber, chapterLabel: book.reading.chapterLabel,
      pageIndex: 0, paragraphIndex: 0, wordIndex: 0, paragraphCount: null, source: 'position', at: book.reading.lastActiveAt,
    },
    lastActiveAt: book.reading.lastActiveAt,
    href: book.href,
  }))
}

/** Tinct's rows and the reader's own books in one list, most recently read first (readingNow.ts, as the library). */
export function withOwnBookRows(rows: readonly QuickBookRow[], own: readonly QuickBookRow[]): QuickBookRow[] {
  return mergeReadingNow(rows, own, row => row.bookId, row => row.lastActiveAt)
}

export function quickBookPositions(
  positions: LabPositionState,
  catalogue: readonly QuickBookCatalogueEntry[],
  read: (key: string) => string | null,
): LabPositionState {
  return withProductionPlaces(positions, productionPlaces({
    bookIds: catalogue.map(book => book.id),
    read,
  }))
}

/** The library's completion rule over this device's records (libraryCompletion.ts). */
export function quickBookCompletedIds(storage: Pick<Storage, 'getItem' | 'key' | 'length'>): Set<string> {
  return completedBookIdsIn(storage)
}

/**
 * Books readers added from the public catalogue (`pd-…`), which the built
 * catalogue (`/lab/catalogue.json`) never lists: the entries this device knows
 * (registered books, the public-books index). `complete` is true when the
 * entries are the whole index, so a `pd-` book missing from them no longer
 * exists and cannot be opened.
 */
export interface QuickAddedBooks {
  entries: readonly QuickBookCatalogueEntry[]
  complete: boolean
}

/** The catalogue plus the added books it does not list; registry books are never replaced. */
export function withAddedBooks(
  catalogue: readonly QuickBookCatalogueEntry[],
  added: readonly QuickBookCatalogueEntry[],
): QuickBookCatalogueEntry[] {
  const known = new Set(catalogue.map(book => book.id))
  const extra: QuickBookCatalogueEntry[] = []
  for (const entry of added) {
    if (!isPublicBookId(entry?.id) || known.has(entry.id) || typeof entry.title !== 'string' || !entry.title.trim()) continue
    known.add(entry.id)
    extra.push(entry)
  }
  return [...catalogue, ...extra]
}

/**
 * The title the reader recorded for an added book (its position record's
 * `headerBook`, written from the registry title), when it is a title and not
 * the id itself.
 */
function storedTitle(positions: LabPositionState, bookId: string): string | null {
  const title = positions.books[bookId]?.headerBook?.trim()
  return title && title !== bookId ? title : null
}

export function quickBookRows(input: {
  catalogue: readonly QuickBookCatalogueEntry[]
  positions: LabPositionState
  memory: ReadingMemoryState
  viewer: string | null
  completedBookIds?: ReadonlySet<string>
  /** Added books the built catalogue does not list (see QuickAddedBooks). */
  added?: QuickAddedBooks
  /** The library's shelf membership on this device (libraryTwoSaved.ts readShelfMembership). */
  membership?: ShelfMembership | null
}): QuickBookRow[] {
  const books = withAddedBooks(input.catalogue, input.added?.entries ?? [])
  // An added book this device has no metadata for keeps the title its position
  // record carries — unless the whole index was read and the book is not in it.
  if (!input.added?.complete) {
    const known = new Set(books.map(book => book.id))
    for (const bookId of Object.keys(input.positions.books)) {
      if (!isPublicBookId(bookId) || known.has(bookId)) continue
      const title = storedTitle(input.positions, bookId)
      if (title) books.push({ id: bookId, title, art: null, readingStructure: null })
    }
  }
  const catalogue = new Map(books.map(book => [book.id, book]))
  const bookInfos = new Map<string, LibraryBookInfo>(books.map(book => [book.id, {
    id: book.id,
    title: book.title,
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({
      number: chapter.number,
      title: chapter.title,
      paragraphCount: chapter.paragraphCount,
    })),
  }]))
  // The library's own list (readingNow.ts): the same books, removals and order.
  return readingNowList({
    memory: input.memory,
    viewer: input.viewer,
    positions: input.positions,
    books: bookInfos,
    completedBookIds: input.completedBookIds,
    membership: input.membership,
  }).readingNow.flatMap(row => {
    const book = catalogue.get(row.bookId)
    // A raw `pd-…` id is never a title. An added book nothing names any more
    // (gone from the index, or unknown to this device with no recorded title)
    // cannot be opened from here either, so it leaves the list.
    if (!book && isPublicBookId(row.bookId)) return []
    // The library's cover for the book (book-cover.js): its painting first.
    const cover = resolveBookCover({ bookId: row.bookId, art: book?.art })
    return [{
      bookId: row.bookId,
      title: book?.title ?? row.bookId,
      chapterLabel: row.target.chapterLabel,
      coverSrc: cover?.src ?? null,
      coverSrcSet: cover?.srcSet ?? null,
      coverTone: book?.cover?.background ?? null,
      author: book?.author ?? '',
      target: row.target,
      lastActiveAt: row.lastActiveAt,
    }]
  })
}
