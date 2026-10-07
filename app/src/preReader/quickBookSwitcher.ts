import type { ReadingMemoryState } from '../readingMemory'
import type { LabPositionState } from '../lab/labPosition'
import { completedLibraryBookId } from './libraryCompletion'
import { productionPlaces, withProductionPlaces } from './productionPositions'
import { readingList, type ContinueTarget, type LibraryBookInfo } from './libraryRecap'
import { isPublicBookId } from '../../public/lab/public-books.js'

export interface QuickBookCatalogueEntry {
  id: string
  title: string
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
  target: ContinueTarget
  lastActiveAt: number
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

export function quickBookCompletedIds(storage: Pick<Storage, 'getItem' | 'key' | 'length'>): Set<string> {
  const ids = new Set<string>()
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (!key || (!key.startsWith('tinct:book-completed:') && !key.startsWith('tinct:progress:'))) continue
    try {
      const id = completedLibraryBookId(key, JSON.parse(storage.getItem(key) ?? 'null'))
      if (id) ids.add(id)
    } catch { /* one malformed legacy record must not hide other rows */ }
  }
  return ids
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
  return readingList({
    memory: input.memory,
    viewer: input.viewer,
    positions: input.positions,
    books: bookInfos,
    completedBookIds: input.completedBookIds,
  }).readingNow.flatMap(row => {
    const book = catalogue.get(row.bookId)
    // A raw `pd-…` id is never a title. An added book nothing names any more
    // (gone from the index, or unknown to this device with no recorded title)
    // cannot be opened from here either, so it leaves the list.
    if (!book && isPublicBookId(row.bookId)) return []
    return [{
      bookId: row.bookId,
      title: book?.title ?? row.bookId,
      chapterLabel: row.target.chapterLabel,
      coverSrc: book?.art?.src ?? null,
      coverSrcSet: book?.art?.srcSet ?? null,
      coverTone: book?.cover?.background ?? null,
      target: row.target,
      lastActiveAt: row.lastActiveAt,
    }]
  })
}
