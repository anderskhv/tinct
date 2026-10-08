/**
 * A reader's own books as the library and the reader's book switcher list
 * them: this account's records in Add a book's IndexedDB (`tinct-addbook`,
 * store `books`), each with its title, author, cover and, for an EPUB the
 * reader has opened, the saved place (`tinct-addbook:place:<hex>`) with the
 * chapter, how far through the book it is and how many words it has.
 *
 * Read on this device only; nothing here is sent anywhere. Sign-out deletes
 * the database and every `tinct-addbook:` key (`clearLocalUserData`).
 */
import { ADD_BOOK_IDB_NAME } from '../../services/storage'
import { chapterProgress, positionLine } from '../../preReader/recapPosition'
import { userBookId, userBookReaderUrl, USER_BOOKS_SHELF_URL } from './userBookId'
import type { UserBookChapter } from './userEdition'

/** A cover is kept up to this many pixels wide (the reading table draws it up to ~530 px at 2x). */
export const OWN_COVER_MAX_WIDTH = 900
/** Covers kept before this version were 180 px thumbnails; such a book's cover is drawn again from its file. */
export const OWN_COVER_VERSION = 2
/** Removed from the library's reading table at this time (the place is kept); reading on brings it back. */
export const OWN_TABLE_HIDDEN_PREFIX = 'tinct-addbook:table-hidden:'
const PLACE_PREFIX = 'tinct-addbook:place:'
const COVER_RE = /^data:image\/(jpeg|png|webp);base64,/

export interface OwnShelfReading {
  /** `userbook-<hex>`: never a registry id. */
  bookId: string
  chapterNumber: number
  /** The chapter's own title, as the reader's header shows it. */
  chapterLabel: string
  /** "You’re in the middle of Letter 4", as for Tinct's books. */
  headline: string
  /** Whole-book progress, 0–100, or null when the book's text is not on this device. */
  percent: number | null
  wordCount: number | null
  lastActiveAt: number
}

export interface OwnShelfBook {
  key: string
  kind: 'pdf' | 'epub'
  hex: string
  title: string
  author: string
  /** The book's own cover (a data: URL kept on this device), or null. */
  cover: string | null
  /** Last opened (or added) on this device. */
  at: number
  /** Where the reader opens it: the Tinct reader for an EPUB, Add a book for a PDF. */
  href: string
  /** The saved place, for an EPUB being read (and not removed from the reading table since). */
  reading: OwnShelfReading | null
}

interface StoredRecord {
  key?: unknown
  kind?: unknown
  name?: unknown
  title?: unknown
  author?: unknown
  owner?: unknown
  addedAt?: unknown
  openedAt?: unknown
  cover?: unknown
  edition?: { title?: unknown; author?: unknown; chapters?: unknown } | null
}

interface RawPlace { chapterNumber?: unknown; paragraphIndex?: unknown; wordIndex?: unknown; updatedAt?: unknown }

function readJson<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null } catch { return null }
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

/** The place, chapter and progress of an EPUB with a saved place; null when it has none. */
export function ownReading(hex: string, chapters: UserBookChapter[] | null, openedAt: number, read: (key: string) => unknown = readJson): OwnShelfReading | null {
  const raw = read(PLACE_PREFIX + hex) as RawPlace | null
  if (!raw || typeof raw !== 'object') return null
  const updatedAt = typeof raw.updatedAt === 'number' && raw.updatedAt > 0 ? raw.updatedAt : openedAt
  const hiddenAt = Number(read(OWN_TABLE_HIDDEN_PREFIX + hex))
  if (Number.isFinite(hiddenAt) && hiddenAt > 0 && hiddenAt >= updatedAt) return null
  const bookId = userBookId(hex)
  const list = Array.isArray(chapters) ? chapters.filter(chapter => chapter && Array.isArray(chapter.paragraphs)) : []
  const at = list.findIndex(chapter => chapter.number === raw.chapterNumber)
  if (at < 0) {
    // The text is not on this device (or the place is outside it): the book opens at its start.
    const first = list[0]
    const label = first?.title || ''
    return { bookId, chapterNumber: first?.number ?? 1, chapterLabel: label, headline: label ? positionLine('start', label) : '', percent: list.length ? 0 : null, wordCount: list.length ? list.reduce((sum, chapter) => sum + chapter.paragraphs.reduce((n, p) => n + words(p), 0), 0) : null, lastActiveAt: updatedAt }
  }
  const chapter = list[at]
  const paragraphIndex = Number.isInteger(raw.paragraphIndex) ? Math.max(0, Math.min(chapter.paragraphs.length - 1, raw.paragraphIndex as number)) : 0
  const wordIndex = Number.isInteger(raw.wordIndex) ? Math.max(0, raw.wordIndex as number) : 0
  let total = 0
  let before = 0
  list.forEach((item, index) => {
    item.paragraphs.forEach((paragraph, p) => {
      const count = words(paragraph)
      total += count
      if (index < at || (index === at && p < paragraphIndex)) before += count
      else if (index === at && p === paragraphIndex) before += Math.min(wordIndex, count)
    })
  })
  const label = chapter.title || ''
  const progress = chapterProgress({ paragraphIndex, paragraphCount: chapter.paragraphs.length, finished: false })
  return {
    bookId,
    chapterNumber: chapter.number,
    chapterLabel: label,
    headline: label ? positionLine(progress, label) : '',
    percent: total > 0 ? Math.max(0, Math.min(100, (before / total) * 100)) : null,
    wordCount: total > 0 ? total : null,
    lastActiveAt: updatedAt,
  }
}

/** Hide an own book from the library's reading table (on this device); its place is kept. */
export function hideOwnFromReadingTable(hex: string, at = Date.now()): void {
  try { localStorage.setItem(OWN_TABLE_HIDDEN_PREFIX + hex, String(at)) } catch { /* full or private */ }
}

function summarize(record: StoredRecord): OwnShelfBook | null {
  const key = typeof record.key === 'string' ? record.key : ''
  const kind = record.kind === 'pdf' || record.kind === 'epub' ? record.kind : null
  if (!kind || !key.startsWith(kind + ':')) return null
  const hex = key.slice(kind.length + 1)
  const name = typeof record.name === 'string' ? record.name : ''
  const title = (typeof record.title === 'string' && record.title.trim()) || name.replace(/\.(pdf|epub)$/i, '') || 'Untitled'
  const author = typeof record.author === 'string' ? record.author : ''
  const at = Number(record.openedAt) || Number(record.addedAt) || 0
  const chapters = Array.isArray(record.edition?.chapters) ? record.edition!.chapters as UserBookChapter[] : null
  return {
    key, kind, hex, title, author,
    cover: typeof record.cover === 'string' && COVER_RE.test(record.cover) ? record.cover : null,
    at,
    href: kind === 'epub' ? userBookReaderUrl(hex) : USER_BOOKS_SHELF_URL,
    reading: kind === 'epub' ? ownReading(hex, chapters, at) : null,
  }
}

/**
 * This account's own books on this device, latest opened first. Never creates
 * Add a book's database just to look in it; an unreadable database lists none.
 */
export async function readOwnShelf(owner: string | null | undefined): Promise<OwnShelfBook[]> {
  if (!owner || typeof indexedDB === 'undefined') return []
  try {
    const list = await (indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> }).databases?.()
    if (list && !list.some(db => db.name === ADD_BOOK_IDB_NAME)) return []
  } catch { /* older browsers: open below */ }
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(ADD_BOOK_IDB_NAME, 1)
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('books')) request.result.createObjectStore('books', { keyPath: 'key' }) }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      const out = await new Promise<OwnShelfBook[]>((resolve, reject) => {
        const books: OwnShelfBook[] = []
        const request = db.transaction('books', 'readonly').objectStore('books').openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) { resolve(books); return }
          const record = cursor.value as StoredRecord
          // Summarized here, so the file's bytes are not held for the whole list.
          if (record && record.owner === owner) { const book = summarize(record); if (book) books.push(book) }
          cursor.continue()
        }
        request.onerror = () => reject(request.error)
      })
      return out.sort((a, b) => b.at - a.at)
    } finally { db.close() }
  } catch {
    return []
  }
}

/** Own EPUBs being read, most recently read first. */
export function ownReadingNow(books: readonly OwnShelfBook[]): Array<OwnShelfBook & { reading: OwnShelfReading }> {
  return books.filter((book): book is OwnShelfBook & { reading: OwnShelfReading } => book.reading !== null)
    .sort((a, b) => b.reading.lastActiveAt - a.reading.lastActiveAt)
}
