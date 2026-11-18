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
import { epubViewHere } from './epubView'
import { pdfEditionChoice } from './pdfEditions'
import type { UserBookChapter } from './userEdition'

/** A cover is kept up to this many pixels wide (the reading table draws it up to ~530 px at 2x). */
export const OWN_COVER_MAX_WIDTH = 900
/** Covers kept before this version were 180 px thumbnails; such a book's cover is drawn again from its file. */
export const OWN_COVER_VERSION = 2
/** Removed from the library's reading table at this time (the place is kept); reading on brings it back. */
export const OWN_TABLE_HIDDEN_PREFIX = 'tinct-addbook:table-hidden:'
/**
 * Taken off Currently reading without Read later (Anders, 2026-10-21: "Remove from Currently
 * reading"), at this time: not listed under Saved for later. Read later clears it. This device only.
 */
export const OWN_SHELF_UNSAVED_PREFIX = 'tinct-addbook:table-unsaved:'
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
  /**
   * The place is at the end of the book (ownFinished): its last chapter or page, at least
   * OWN_FINISHED_PERCENT through. Read from the place the account already keeps (chapter or
   * page, and how far through), so finishing adds nothing stored.
   */
  finished?: boolean
}

/** How far through (percent) an own book's place must be, in its last chapter or on its last page, to be finished. */
export const OWN_FINISHED_PERCENT = 95

/** Whether a place is the end of an own book: in its last chapter (or on its last page) and far enough through. */
export function ownFinished(input: { last: boolean | null; percent: number | null }): boolean {
  return input.last !== false && typeof input.percent === 'number' && Number.isFinite(input.percent) && input.percent >= OWN_FINISHED_PERCENT
}

export interface OwnShelfBook {
  key: string
  kind: 'pdf' | 'epub'
  hex: string
  title: string
  author: string
  /** The book's own cover (a data: URL kept on this device), or null. */
  cover: string | null
  /**
   * The small copy of its cover kept with the account copy (a data: URL, read
   * once and kept on this device; ownCovers.ts), set only when `cover` is null.
   */
  storedCover?: string | null
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
  /** A PDF's page count and its scan (public/lab/addbook/js/pdf-scan.js): the chapters with their pages. */
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
/**
 * When an own book was taken off Currently reading (its place kept), or null: My shelf lists it
 * under Saved for later, as it does Tinct's books (Anders, 2026-10-12). This device's record.
 */
export function ownSavedAt(hex: string, read: (key: string) => unknown = readJson): number | null {
  const at = Number(read(OWN_TABLE_HIDDEN_PREFIX + hex))
  return Number.isFinite(at) && at > 0 ? at : null
}

/**
 * When an own book went to Saved for later (Read later, or the desk's ×), or null: off Currently
 * reading with "Remove from Currently reading" since then, it is not saved. Continue still uses
 * ownSavedAt: either way the book was taken off what the reader is reading.
 */
export function ownShelfSavedAt(hex: string, read: (key: string) => unknown = readJson): number | null {
  const at = ownSavedAt(hex, read)
  if (at === null) return null
  const unsaved = Number(read(OWN_SHELF_UNSAVED_PREFIX + hex))
  return Number.isFinite(unsaved) && unsaved > 0 && unsaved >= at ? null : at
}

/** Where the margin reader keeps an EPUB's place on this device (reader.js `pos:epub:<hex>`; epubView.ts). */
export const EPUB_MARGIN_PLACE_PREFIX = 'tinct-addbook:pos:epub:'

export function ownReading(hex: string, chapters: UserBookChapter[] | null, openedAt: number, read: (key: string) => unknown = readJson): OwnShelfReading | null {
  const place = read(PLACE_PREFIX + hex) as RawPlace | null
  // An EPUB read only in Margin view (the desktop's default) has no Tinct reader place: the margin reader's own
  // place still makes it a book being read, last read when the margin reader kept it (D's matrix, 22 Oct 2026:
  // such a book was missing from Reading now). Its chapter is then the one the Tinct reader's place names, if any.
  const margin = read(EPUB_MARGIN_PLACE_PREFIX + hex) as { at?: unknown } | null
  const marginAt = margin && typeof margin === 'object' && typeof margin.at === 'number' && margin.at > 0 ? margin.at : 0
  const raw: RawPlace | null = place && typeof place === 'object' ? place : marginAt ? {} : null
  if (!raw) return null
  const updatedAt = Math.max(typeof raw.updatedAt === 'number' && raw.updatedAt > 0 ? raw.updatedAt : openedAt, marginAt)
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
    // Without the text here (an account copy), the place's own percent decides: its chapters are unknown.
    return { bookId, chapterNumber: first?.number ?? (Number.isInteger(raw.chapterNumber) ? raw.chapterNumber as number : 1), chapterLabel: label, headline: label ? positionLine('start', conciseChapterLabel(label)) : '', percent: list.length ? 0 : kept, wordCount: list.length ? list.reduce((sum, chapter) => sum + chapter.paragraphs.reduce((n, p) => n + words(p), 0), 0) : null, lastActiveAt: updatedAt, finished: !list.length && ownFinished({ last: null, percent: kept }) }
  }
  const chapter = list[at]
  const paragraphIndex = Number.isInteger(raw.paragraphIndex) ? Math.max(0, Math.min(chapter.paragraphs.length - 1, raw.paragraphIndex as number)) : 0
  const wordIndex = Number.isInteger(raw.wordIndex) ? Math.max(0, raw.wordIndex as number) : 0
  const total = list.reduce((sum, item) => sum + item.paragraphs.reduce((n, p) => n + words(p), 0), 0)
  const label = chapter.title || ''
  const progress = chapterProgress({ paragraphIndex, paragraphCount: chapter.paragraphs.length, finished: false })
  const percent = placePercent(list, { chapterNumber: chapter.number, paragraphIndex, wordIndex })
  return {
    bookId,
    chapterNumber: chapter.number,
    chapterLabel: label,
    headline: label ? positionLine(progress, conciseChapterLabel(label)) : '',
    percent,
    wordCount: total > 0 ? total : null,
    lastActiveAt: updatedAt,
    finished: ownFinished({ last: at === list.length - 1, percent }),
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
    // The last page, far enough down it; a PDF whose page count is not known here is never finished.
    finished: !!count && ownFinished({ last: page >= count, percent: Math.max(0, Math.min(100, ((page - 1 + frac) / count) * 100)) }),
  }
}

/**
 * Hide an own book from the library's reading table (on this device); its place, highlights and
 * notes are kept. `saved` (the default, Read later): it is listed under Saved for later; false
 * (Remove from Currently reading): only under My private uploads.
 */
export function hideOwnFromReadingTable(hex: string, at = Date.now(), { saved = true }: { saved?: boolean } = {}): void {
  try {
    localStorage.setItem(OWN_TABLE_HIDDEN_PREFIX + hex, String(at))
    if (saved) localStorage.removeItem(OWN_SHELF_UNSAVED_PREFIX + hex)
    else localStorage.setItem(OWN_SHELF_UNSAVED_PREFIX + hex, String(at))
  } catch { /* full or private */ }
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
    // A PDF opens in the edition it is read in (pdfEditions.ts): its Tinct text or its pages; an EPUB in its view on this device (epubView.ts).
    href: ownBookHref(hex, kind, kind === 'pdf' ? pdfEditionChoice(hex, String(record.layout?.default ?? record.scan?.layout?.default ?? '') || null) : epubViewHere(hex)),
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
    forgetOwnedReaderLocalState(owner, hex)
  }
  return gone
}

/** Remote deletion removes this owner's annotation generation, never another account's same-hash backup. */
export function forgetOwnedReaderLocalState(owner: string, hex: string): void {
  if (!owner || !/^[0-9a-f]{24}$/.test(hex)) return
  // Older readers wrote hash-only projections. Clear them only when the
  // deleted owner's saved copy proves their exact contents. A surviving
  // projection keeps its owner marker, so the next account cannot claim it.
  const prefix = 'tinct-addbook:', bookId = userBookId(hex)
  const get = (key: string): unknown => { try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null } }
  const exact = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
  const legacyKey = prefix + 'legacy-epub-owner:' + hex
  if (localStorage.getItem(legacyKey) === owner) {
    const backup = get(prefix + 'legacy-epub-annotations:' + owner + ':' + hex) as { marks?: unknown[]; cards?: unknown[] } | null
    for (const [name, field] of [['hl:epub:', 'marks'], ['cards:epub:', 'cards']] as const) {
      const rawKey = prefix + name + hex, raw = get(rawKey)
      if (Array.isArray(raw) && Array.isArray(backup?.[field]) && exact(raw, backup[field])) {
        try { localStorage.removeItem(rawKey) } catch { /* retain the marker below */ }
      }
    }
  }
  const marksMarker = prefix + 'text-marks-owner:' + hex
  if (localStorage.getItem(marksMarker) === owner) {
    const raw = get('tinct-lab-highlights')
    if (Array.isArray(raw)) {
      const scoped = raw.filter(row => row?.bookId === bookId)
      const backed = get(prefix + 'text-marks-local:' + owner + ':' + hex)
      if (scoped.length && Array.isArray(backed) && exact(scoped, backed)) {
        try { localStorage.setItem('tinct-lab-highlights', JSON.stringify(raw.filter(row => row?.bookId !== bookId))) } catch { /* retain marker */ }
      }
    }
  }
  const chatMarker = prefix + 'text-cards-owner:' + hex, chatKey = 'tinct:chat-history:' + bookId
  if (localStorage.getItem(chatMarker) === owner) {
    const raw = get(chatKey)
    if (Array.isArray(raw) && raw.length) {
      let proven = false
      try {
        const stem = prefix + 'text-cards-canonical:' + owner + ':' + hex
        for (let i = 0; i < localStorage.length && !proven; i++) {
          const key = localStorage.key(i)
          if (key !== stem && !key?.startsWith(stem + ':')) continue
          const candidate = get(key) as { conversations?: unknown[] } | null
          if (Array.isArray(candidate?.conversations)) {
            const known = new Set(candidate.conversations.map(row => JSON.stringify(row)))
            proven = raw.every(row => known.has(JSON.stringify(row)))
          }
        }
      } catch { /* no exact owner proof */ }
      if (proven) try { localStorage.removeItem(chatKey) } catch { /* retain marker */ }
    }
  }
  const legacyStillClaimed = localStorage.getItem(legacyKey) === owner
    && ['hl:epub:', 'cards:epub:'].some(name => localStorage.getItem(prefix + name + hex) !== null)
  const marksStillClaimed = localStorage.getItem(marksMarker) === owner && (() => {
    const raw = localStorage.getItem('tinct-lab-highlights'), rows = get('tinct-lab-highlights')
    return raw !== null && (!Array.isArray(rows) || rows.some(row => row?.bookId === bookId))
  })()
  const chatStillClaimed = localStorage.getItem(chatMarker) === owner && localStorage.getItem(chatKey) !== null
  const prefixes = [
    'text-marks-sync:', 'text-marks-local:', 'text-marks-previous:', 'text-marks-adopted:', 'text-marks-quarantine:',
    'text-marks-canonical:', 'text-cards-canonical:', 'text-cards-adopted:',
    'legacy-epub-annotations:', 'legacy-epub-migrated:', 'legacy-epub-backup-quarantine:', 'static-epub-marks:', 'static-epub-cards:',
  ]
  for (const prefix of prefixes) {
    if (legacyStillClaimed && (prefix === 'legacy-epub-annotations:' || prefix === 'legacy-epub-migrated:')) continue
    if (marksStillClaimed && (prefix === 'text-marks-local:' || prefix === 'text-marks-previous:')) continue
    if (chatStillClaimed && (prefix === 'text-cards-canonical:' || prefix === 'text-cards-adopted:')) continue
    try { localStorage.removeItem(`tinct-addbook:${prefix}${owner}:${hex}`) } catch { /* keep the file deletion even if storage is blocked */ }
  }
  for (const [marker, stillPresent] of [
    [legacyKey, () => ['hl:epub:', 'cards:epub:'].some(name => localStorage.getItem(prefix + name + hex) !== null)],
    [marksMarker, () => { const raw = localStorage.getItem('tinct-lab-highlights'), rows = get('tinct-lab-highlights'); return raw !== null && (!Array.isArray(rows) || rows.some(row => row?.bookId === bookId)) }],
    [chatMarker, () => localStorage.getItem(chatKey) !== null],
  ] as const) {
    try { if (localStorage.getItem(marker) === owner && !stillPresent()) localStorage.removeItem(marker) } catch { /* retain ownership boundary */ }
  }
  try {
    for (const kind of ['text-marks-canonical:', 'text-cards-canonical:']) {
      if (kind === 'text-cards-canonical:' && chatStillClaimed) continue
      const stem = `tinct-addbook:${kind}${owner}:${hex}:`
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const item = localStorage.key(i)
        if (item?.startsWith(stem) && /^[0-9a-f]{32}$/.test(item.slice(stem.length))) localStorage.removeItem(item)
      }
    }
  } catch { /* keep the file deletion even if storage is blocked */ }
  try {
    for (const kind of ['pdf-original-marks:', 'pdf-original-cards:']) {
      const stem = `tinct-addbook:${kind}${owner}:`
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const item = localStorage.key(i)
        if (item?.startsWith(stem) && item.endsWith(':' + hex) && /^[0-9a-f]{32}$/.test(item.slice(stem.length, -hex.length - 1))) localStorage.removeItem(item)
      }
    }
  } catch { /* keep the file deletion even if storage is blocked */ }
}

/** Own books being read (EPUBs and PDFs), most recently read first. */
export function ownReadingNow(books: readonly OwnShelfBook[]): Array<OwnShelfBook & { reading: OwnShelfReading }> {
  return books.filter((book): book is OwnShelfBook & { reading: OwnShelfReading } => book.reading !== null)
    .sort((a, b) => b.reading.lastActiveAt - a.reading.lastActiveAt)
}
