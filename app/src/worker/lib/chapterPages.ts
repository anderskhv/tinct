/**
 * The chapter pages and shelf hubs the build wrote (scripts/seo/build-chapter-pages.mjs; manifest committed beside
 * the book data). The Worker serves /read/{bookId}/chapter-N only for a book and chapter in this list, and reads the
 * page out of its pack: the pages of a book are written a few hundred kilobytes to a file, so five thousand pages
 * stay a few hundred files under Cloudflare's asset limit.
 */
import manifest from '../../data/chapterPages.generated.json'

type BookEntry = { chapters: number; bookPage?: boolean; packs: number[]; indexable: boolean; original: string | null }
const BOOKS = (manifest as { books: Record<string, BookEntry> }).books
const HUBS = (manifest as { hubs: Record<string, boolean> }).hubs

/** Where the packs are served from inside the Worker (never to a visitor: the route answers 404 there). */
export const CHAPTER_PACK_PREFIX = '/seo/chapter-packs/'

export function hasChapterPages(bookId: string): boolean {
  return Object.prototype.hasOwnProperty.call(BOOKS, bookId)
}

/** The book's chapter page `chapter`, or null when the book has none or the chapter does not exist. */
export function chapterPageEntry(bookId: string, chapter: number): { pack: string; indexable: boolean } | null {
  const book = hasChapterPages(bookId) ? BOOKS[bookId] : null
  if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) return null
  let pack = 0
  for (let index = 0; index < book.packs.length; index += 1) if (book.packs[index] <= chapter) pack = index
  return { pack: `${CHAPTER_PACK_PREFIX}${bookId}/${pack}.txt`, indexable: book.indexable }
}

/**
 * The book page (/read/{bookId}): the first chapter under the book's header, page 0 of the book's first pack
 * (Anders, 19 Nov 2026, docs/seo-brief-2026-11-19.md §1). Null when the book has none.
 */
export function bookPageEntry(bookId: string): { pack: string; indexable: boolean } | null {
  const book = hasChapterPages(bookId) ? BOOKS[bookId] : null
  if (!book?.bookPage) return null
  return { pack: `${CHAPTER_PACK_PREFIX}${bookId}/0.txt`, indexable: book.indexable }
}

/** One page out of a pack (each page follows its `<!--tinct:chapter-page N-->` marker), or null. */
export function chapterPageFromPack(pack: string, chapter: number): string | null {
  const marker = `<!--tinct:chapter-page ${chapter}-->\n`
  const start = pack.indexOf(marker)
  if (start < 0) return null
  const end = pack.indexOf('<!--tinct:chapter-page ', start + marker.length)
  return pack.slice(start + marker.length, end < 0 ? undefined : end)
}

/** Whether the shelf hub exists, and whether it may be indexed (null: no such hub). */
export function shelfHubIndexable(shelfId: string): boolean | null {
  return Object.prototype.hasOwnProperty.call(HUBS, shelfId) ? HUBS[shelfId] : null
}
