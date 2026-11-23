/**
 * Prepared "story so far" for Talk: one short summary per chapter, written
 * from the book's text and served as static JSON
 * (`/data/story-so-far/<bookId>.json`; source copy in
 * `books/wip/<bookId>/story-so-far/`). Talk's reference carries the entries
 * for the chapters strictly before the reader's chapter, never the current
 * chapter or a later one (the same line as Catch me up, `catchUp.ts`).
 *
 * A trial on Sense and Sensibility only (Anders, 20 Nov 2026). A book that is
 * not listed here is never fetched, and its Talk prompt is unchanged.
 */
export const STORY_SO_FAR_BOOK_IDS: ReadonlySet<string> = new Set(['sense-and-sensibility'])

/** In the URL because `/data/*.json` is served immutable for 30 days: bump it when a story file changes. */
export const STORY_SO_FAR_VERSION = 1

export interface StorySoFarChapter {
  number: number
  summary: string
}

export interface StorySoFarFile {
  schemaVersion: 1
  bookId: string
  chapters: StorySoFarChapter[]
}

export function hasStorySoFar(bookId: string | null | undefined): boolean {
  return !!bookId && STORY_SO_FAR_BOOK_IDS.has(bookId)
}

/** The chapters of a story file, or null when it is not one for this book. */
export function parseStorySoFar(bookId: string, raw: unknown): StorySoFarChapter[] | null {
  if (!raw || typeof raw !== 'object') return null
  const file = raw as Partial<StorySoFarFile>
  if (file.schemaVersion !== 1 || file.bookId !== bookId || !Array.isArray(file.chapters)) return null
  const chapters = file.chapters.filter((entry): entry is StorySoFarChapter =>
    !!entry && Number.isInteger(entry.number) && entry.number >= 1 && typeof entry.summary === 'string' && !!entry.summary.trim())
  return chapters.length ? chapters : null
}

const cache = new Map<string, Promise<StorySoFarChapter[] | null>>()

/**
 * The book's story file, fetched once and kept in memory. Null for a book
 * without one and for a missing or unreadable file; a failure is not cached,
 * so the next reader of the book tries again. Never rejects.
 */
export function loadStorySoFar(bookId: string | null | undefined): Promise<StorySoFarChapter[] | null> {
  if (!bookId || !hasStorySoFar(bookId)) return Promise.resolve(null)
  const cached = cache.get(bookId)
  if (cached) return cached
  const request = (async () => {
    try {
      const response = await fetch(`/data/story-so-far/${encodeURIComponent(bookId)}.json?v=${STORY_SO_FAR_VERSION}`)
      if (!response.ok) return null
      return parseStorySoFar(bookId, await response.json())
    } catch {
      return null
    }
  })()
  cache.set(bookId, request)
  void request.then(chapters => { if (!chapters && cache.get(bookId) === request) cache.delete(bookId) })
  return request
}

/** Entries for the chapters strictly before the reader's chapter, in reading order. */
export function storySoFarBefore(chapters: readonly StorySoFarChapter[] | null | undefined, chapterNumber: number | undefined): StorySoFarChapter[] {
  if (!chapters || typeof chapterNumber !== 'number' || !Number.isFinite(chapterNumber)) return []
  return chapters
    .filter(entry => entry.number < chapterNumber)
    .sort((a, b) => a.number - b.number)
    .map(entry => ({ number: entry.number, summary: entry.summary }))
}

/** Tests only. */
export function resetStorySoFarCache(): void {
  cache.clear()
}
