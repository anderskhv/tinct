/**
 * A reader's own books as the library and the reader's book switcher list
 * them: this account's records in Add a book's IndexedDB (`tinct-addbook`,
 * store `books`), each with its title, author, cover and, for an EPUB the
 * reader has opened, the saved place (`tinct-addbook:place:<hex>`) with the
 * chapter, how far through the book it is and how many words it has; for a
 * PDF, the page kept by Add a book's viewer (`tinct-addbook:pos:pdf:<hex>`).
 *
 * Read on this device only; nothing here is sent anywhere. Sign-out deletes
 * the database and every `tinct-addbook:` key (`clearLocalUserData`).
 */
import { ADD_BOOK_IDB_NAME } from '../../services/storage'
import { chapterProgress, conciseChapterLabel, positionLine } from '../../preReader/recapPosition'
import { ownBookHref, userBookId } from './userBookId'
import { pdfEditionChoice } from './pdfEditions'
import type { UserBookChapter } from './userEdition'

/** A cover is kept up to this many pixels wide (the reading table draws it up to ~530 px at 2x). */
export const OWN_COVER_MAX_WIDTH = 900
/** Covers kept before this version were 180 px thumbnails; such a book's cover is drawn again from its file. */
export const OWN_COVER_VERSION = 2
/** Removed from the library's reading table at this time (the place is kept); reading on brings it back. */
export const OWN_TABLE_HIDDEN_PREFIX = 'tinct-addbook:table-hidden:'
const PLACE_PREFIX = 'tinct-addbook:place:'
/** Add a book's PDF viewer keeps its place here: `{ page, frac, zoom, pages?, at? }`. */
export const PDF_PLACE_PREFIX = 'tinct-addbook:pos:pdf:'
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
  /** Where the reader opens it: the Tinct reader for an EPUB and a PDF read as Tinct text, Add a book's viewer for a PDF read in its pages. */
  href: string
  /** The saved place, for an EPUB being read (and not removed from the reading table since). */
  reading: OwnShelfReading | null
  /** A scanned PDF (no text layer) whose recognised text is not on this device: its text may be being recognised. */
  scan?: true
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
  /** A PDF's page count and its scan (addbooks/web/src/js/pdf-scan.js): the chapters with their pages. */
  pages?: unknown
  scan?: { entries?: unknown; textPages?: unknown; layout?: { default?: unknown } | null } | null
  /** A PDF's default edition (pdf-scan.js layout), kept with its Tinct text. */
  layout?: { default?: unknown } | null
  edition?: { title?: unknown; author?: unknown; chapters?: unknown; source?: unknown } | null
}

interface RawPlace { chapterNumber?: unknown; paragraphIndex?: unknown; wordIndex?: unknown; updatedAt?: unknown; percent?: unknown }

function readJson<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null } catch { return null }
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

/** Whole-book progress (0–100) at a place, by words; null when the chapters have no words. */
export function placePercent(chapters: readonly UserBookChapter[], place: { chapterNumber: number; paragraphIndex: number; wordIndex: number }): number | null {
  const list = chapters.filter(chapter => chapter && Array.isArray(chapter.paragraphs))
  const at = list.findIndex(chapter => chapter.number === place.chapterNumber)
  let total = 0
  let before = 0
  list.forEach((item, index) => {
    item.paragraphs.forEach((paragraph, p) => {
      const count = words(paragraph)
      total += count
      if (at < 0) return
      if (index < at || (index === at && p < place.paragraphIndex)) before += count
      else if (index === at && p === place.paragraphIndex) before += Math.min(place.wordIndex, count)
    })
  })
  return total > 0 && at >= 0 ? Math.max(0, Math.min(100, (before / total) * 100)) : null
}

/**
 * The place, chapter and progress of an EPUB with a saved place; null when it
 * has none. Without the text on this device (a book read on another device of
 * the account), the progress is the percent that device kept with the place.
 */
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
    const kept = !list.length && typeof raw.percent === 'number' && Number.isFinite(raw.percent) ? Math.max(0, Math.min(100, raw.percent)) : null
    return { bookId, chapterNumber: first?.number ?? (Number.isInteger(raw.chapterNumber) ? raw.chapterNumber as number : 1), chapterLabel: label, headline: label ? positionLine('start', conciseChapterLabel(label)) : '', percent: list.length ? 0 : kept, wordCount: list.length ? list.reduce((sum, chapter) => sum + chapter.paragraphs.reduce((n, p) => n + words(p), 0), 0) : null, lastActiveAt: updatedAt }
  }
  const chapter = list[at]
  const paragraphIndex = Number.isInteger(raw.paragraphIndex) ? Math.max(0, Math.min(chapter.paragraphs.length - 1, raw.paragraphIndex as number)) : 0
  const wordIndex = Number.isInteger(raw.wordIndex) ? Math.max(0, raw.wordIndex as number) : 0
  const total = list.reduce((sum, item) => sum + item.paragraphs.reduce((n, p) => n + words(p), 0), 0)
  const label = chapter.title || ''
  const progress = chapterProgress({ paragraphIndex, paragraphCount: chapter.paragraphs.length, finished: false })
  return {
    bookId,
    chapterNumber: chapter.number,
    chapterLabel: label,
    headline: label ? positionLine(progress, conciseChapterLabel(label)) : '',
    percent: placePercent(list, { chapterNumber: chapter.number, paragraphIndex, wordIndex }),
    wordCount: total > 0 ? total : null,
    lastActiveAt: updatedAt,
  }
}

interface PdfEntry { label: string; page: number; kind?: string; parent?: string | null; id?: string }

/**
 * The place in a PDF being read: the page the viewer kept, as "p. 3 of 8" in
 * place of a chapter (with the scan's chapter, when it found real ones, for
 * the "Where you left off" line). No word count, so no time left is claimed.
 */
export function pdfReading(hex: string, record: { pages?: unknown; scan?: { entries?: unknown } | null }, openedAt: number, read: (key: string) => unknown = readJson): OwnShelfReading | null {
  const raw = read(PDF_PLACE_PREFIX + hex) as { page?: unknown; frac?: unknown; pages?: unknown; at?: unknown } | null
  if (!raw || typeof raw !== 'object' || !Number.isInteger(raw.page) || (raw.page as number) < 1) return null
  const updatedAt = typeof raw.at === 'number' && raw.at > 0 ? raw.at : openedAt
  const hiddenAt = Number(read(OWN_TABLE_HIDDEN_PREFIX + hex))
  if (Number.isFinite(hiddenAt) && hiddenAt > 0 && hiddenAt >= updatedAt) return null
  const count = [raw.pages, record.pages].find(n => Number.isInteger(n) && (n as number) > 0) as number | undefined
  const page = count ? Math.min(count, raw.page as number) : raw.page as number
  const frac = typeof raw.frac === 'number' && Number.isFinite(raw.frac) ? Math.max(0, Math.min(1, raw.frac)) : 0
  const entries = (Array.isArray(record.scan?.entries) ? record.scan!.entries as PdfEntry[] : [])
    .filter(e => e && typeof e.label === 'string' && Number.isInteger(e.page))
  const leaves = entries.filter(e => e.kind !== 'part' || !entries.some(c => c.parent === e.id)).sort((a, b) => a.page - b.page)
  const at = leaves.reduce<number>((found, e, i) => (e.page <= page ? i : found), -1)
  const chapter = at >= 0 ? leaves[at] : null
  let headline = ''
  if (chapter) {
    const to = (leaves.slice(at + 1).find(e => e.page > chapter.page)?.page ?? (count ? count + 1 : page + 1)) - 1
    const progress = chapterProgress({ paragraphIndex: page - chapter.page, paragraphCount: Math.max(1, to - chapter.page + 1), finished: false })
    headline = positionLine(progress, conciseChapterLabel(chapter.label))
  }
  return {
    bookId: userBookId(hex),
    chapterNumber: 1,
    chapterLabel: count ? `p. ${page} of ${count}` : `p. ${page}`,
    headline,
    percent: count ? Math.max(0, Math.min(100, ((page - 1 + frac) / count) * 100)) : null,
    wordCount: null,
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
    // A PDF opens in the edition it is read in (pdfEditions.ts): its Tinct text or its pages.
    href: ownBookHref(hex, kind, kind === 'pdf' ? pdfEditionChoice(hex, String(record.layout?.default ?? record.scan?.layout?.default ?? '') || null) : null),
    reading: kind === 'epub' ? ownReading(hex, chapters, at) : pdfReading(hex, record, at),
    ...(kind === 'pdf' && record.scan?.textPages === 0 && record.edition?.source !== 'ocr' ? { scan: true as const } : {}),
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

/**
 * Forget, on this device, this account's books that were saved to the account
 * (a record with a `cloudId`) and are no longer in it: removed on another
 * device. `inAccount` holds the keys (`epub:<hex>`, `pdf:<hex>`) of the
 * account's list, read just now. A record never saved to the account (kept
 * here only, or its copy still being sent) is kept. The kept file, its
 * conversion, its place and its reading-table mark go. Returns the keys forgotten.
 */
export async function forgetRemovedOwnBooks(owner: string | null | undefined, inAccount: ReadonlySet<string>): Promise<string[]> {
  if (!owner || typeof indexedDB === 'undefined') return []
  try {
    const list = await (indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> }).databases?.()
    if (list && !list.some(db => db.name === ADD_BOOK_IDB_NAME)) return []
  } catch { /* older browsers: open below */ }
  let gone: string[] = []
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(ADD_BOOK_IDB_NAME, 1)
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('books')) request.result.createObjectStore('books', { keyPath: 'key' }) }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      gone = await new Promise<string[]>((resolve, reject) => {
        const removed: string[] = []
        const tx = db.transaction('books', 'readwrite')
        const request = tx.objectStore('books').openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return
          const record = cursor.value as StoredRecord & { cloudId?: unknown }
          const key = typeof record?.key === 'string' ? record.key : ''
          if (record && record.owner === owner && typeof record.cloudId === 'string' && record.cloudId && /^(epub|pdf):/.test(key) && !inAccount.has(key)) {
            cursor.delete()
            removed.push(key)
          }
          cursor.continue()
        }
        tx.oncomplete = () => resolve(removed)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      })
    } finally { db.close() }
  } catch {
    return []
  }
  for (const key of gone) {
    const hex = key.slice(key.indexOf(':') + 1)
    for (const item of [PLACE_PREFIX + hex, PDF_PLACE_PREFIX + hex, OWN_TABLE_HIDDEN_PREFIX + hex]) {
      try { localStorage.removeItem(item) } catch { /* private */ }
    }
  }
  return gone
}

/** Own books being read (EPUBs and PDFs), most recently read first. */
export function ownReadingNow(books: readonly OwnShelfBook[]): Array<OwnShelfBook & { reading: OwnShelfReading }> {
  return books.filter((book): book is OwnShelfBook & { reading: OwnShelfReading } => book.reading !== null)
    .sort((a, b) => b.reading.lastActiveAt - a.reading.lastActiveAt)
}
