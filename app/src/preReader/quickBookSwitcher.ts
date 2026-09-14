import type { ReadingMemoryState } from '../readingMemory'
import type { LabPositionState } from '../lab/labPosition'
import { completedLibraryBookId } from './libraryCompletion'
import { productionPlaces, withProductionPlaces } from './productionPositions'
import { readingList, type ContinueTarget, type LibraryBookInfo } from './libraryRecap'

export interface QuickBookCatalogueEntry {
  id: string
  title: string
  art?: { src: string; srcSet?: string } | null
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

export function quickBookRows(input: {
  catalogue: readonly QuickBookCatalogueEntry[]
  positions: LabPositionState
  memory: ReadingMemoryState
  viewer: string | null
  completedBookIds?: ReadonlySet<string>
}): QuickBookRow[] {
  const catalogue = new Map(input.catalogue.map(book => [book.id, book]))
  const bookInfos = new Map<string, LibraryBookInfo>(input.catalogue.map(book => [book.id, {
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
  }).readingNow.map(row => {
    const book = catalogue.get(row.bookId)
    return {
      bookId: row.bookId,
      title: book?.title ?? row.bookId,
      chapterLabel: row.target.chapterLabel,
      coverSrc: book?.art?.src ?? null,
      coverSrcSet: book?.art?.srcSet ?? null,
      target: row.target,
      lastActiveAt: row.lastActiveAt,
    }
  })
}
