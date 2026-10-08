/**
 * A reader's own EPUB on this device: the file Add a book keeps in IndexedDB
 * (`tinct-addbook`, store `books`, record `epub:<hex>`, tagged with the
 * account that opened it), the edition converted from it (kept on the same
 * record, so removing the book or signing out removes it too), and the
 * reader's place in it (localStorage `tinct-addbook:place:<hex>`).
 *
 * The file is read from this device; when it is not here (another device of
 * the account added it) or the copy here is damaged, the account's private
 * copy (`/api/user-books`, ownAccount.ts) is downloaded and kept here instead.
 * Sign-out deletes the database and every `tinct-addbook:` key (`clearLocalUserData`).
 */
import { ADD_BOOK_IDB_NAME } from '../../services/storage'
import { readCachedSupabaseUser } from '../labLibraryBoot'
import { userBookId } from './userBookId'
import { readUserBookPlace, type UserBookPlace } from './userBookPlace'
import { usableUserEdition, type UserBookEdition } from './userEdition'
import { healChapterAuthors } from './chapterAuthors'
import { OWN_COVER_VERSION } from './ownShelf'
import { canDrawCover, drawCover } from './userBookCover'
import type { UserBookImage } from './epubEdition'
import { fetchAccountCopy, ownBookToken, type AccountCopy } from './ownAccount'

const STORE = 'books'

interface UserBookRecord {
  key: string
  kind: string
  name?: string
  title?: string
  author?: string
  owner: string
  bytes?: ArrayBuffer
  edition?: UserBookEdition
  /**
   * The book's pictures (figure id -> type and bytes), converted with the
   * edition and kept beside it. Bytes, never Blobs: a Blob kept in IndexedDB
   * can come back unreadable on iOS Safari, drawing as a broken image.
   */
  figureData?: Record<string, UserBookImage>
  /** Converter 4 and earlier kept Blobs here; such a record converts again. */
  figureImages?: unknown
  /** The book's cover as a JPEG data: URL (Add a book or the reader draws it from the file). */
  cover?: unknown
  /** Below OWN_COVER_VERSION the cover was a 180 px thumbnail (or never drawn): it is drawn again. */
  coverV?: unknown
  [field: string]: unknown
}

export type { UserBookPlace }

export interface LoadedUserBook {
  hex: string
  bookId: string
  edition: UserBookEdition
  /** The book's pictures, by figure id, read from this device only. */
  images: Map<string, Blob>
  /** Saved place, already checked against the edition; null opens the first chapter. */
  place: UserBookPlace | null
  /** The book's own cover (a data: URL kept on this device), or null. */
  cover?: string | null
}

export type UserBookOpenResult =
  | { ok: true; book: LoadedUserBook }
  | { ok: false; reason: 'signed_out' | 'missing' | 'unreadable' | 'storage'; message: string }

/** The account the files on this device are tagged with, as Add a book reads it. */
export function userBookOwner(): string | null {
  return readCachedSupabaseUser()?.id ?? null
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ADD_BOOK_IDB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readRecord(key: string, owner: string): Promise<UserBookRecord | null> {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      request.onsuccess = () => {
        const record = request.result as UserBookRecord | undefined
        resolve(record && record.owner === owner ? record : null)
      }
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

/** Keep the conversion and its pictures on the book's own record (read and written in one transaction). */
async function keepEdition(key: string, owner: string, edition: UserBookEdition, images: Map<string, UserBookImage>): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      const request = store.get(key)
      request.onsuccess = () => {
        const record = request.result as UserBookRecord | undefined
        if (!record || record.owner !== owner) return
        const { figureImages: _legacy, ...rest } = record
        store.put({ ...rest, edition, figureData: Object.fromEntries(images) })
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
}

const STORAGE_MESSAGE = 'This browser could not open its saved books. Open the file again from Add a book.'
const MISSING_MESSAGE = 'That book is no longer on this device. Open the file again.'

/** Keep a record (the account copy downloaded to this device), replacing what was there. */
async function putRecord(record: UserBookRecord): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
}

/** The account copy of one EPUB (ownAccount.ts); injectable for tests. */
export type AccountCopyLoader = (hex: string) => Promise<AccountCopy>
const loadAccountCopy: AccountCopyLoader = async hex => fetchAccountCopy(hex, await ownBookToken())

/**
 * The account's copy as this device's record: downloaded, checked against the
 * book's hex, and kept here (as Add a book keeps a file it downloads) so the
 * next open needs no network. What this device knew of the book (its name,
 * cover, when it was added) is kept; its conversion, made from other bytes, is not.
 */
async function recordFromAccount(key: string, owner: string, hex: string, previous: UserBookRecord | null, load: AccountCopyLoader): Promise<UserBookRecord | 'pdf' | null> {
  const copy = await load(hex).catch((): AccountCopy => ({ status: 'unavailable' }))
  if (copy.status === 'pdf') return 'pdf'
  if (copy.status !== 'found') return null
  const now = Date.now()
  const { edition: _edition, figureData: _figures, figureImages: _legacy, ...kept } = previous ?? ({} as Partial<UserBookRecord>)
  const record: UserBookRecord = {
    ...kept,
    key,
    kind: 'epub',
    name: (typeof kept.name === 'string' && kept.name) || copy.book.name || copy.book.title,
    size: copy.bytes.byteLength,
    title: (typeof kept.title === 'string' && kept.title) || copy.book.title || copy.book.name,
    author: (typeof kept.author === 'string' && kept.author) || copy.book.author || '',
    owner,
    addedAt: Number(kept.addedAt) || Date.parse(copy.book.createdAt) || now,
    openedAt: now,
    cloudId: copy.book.id,
    bytes: copy.bytes,
  }
  // A browser that cannot keep it downloads it again next time; reading goes on.
  await putRecord(record).catch(() => {})
  return record
}

const CONVERT_FAILED = 'This file could not be opened as an EPUB. Choose another file.'
type Converted = { edition: UserBookEdition; images: Map<string, UserBookImage> } | { error: unknown }

async function convertRecord(record: UserBookRecord): Promise<Converted> {
  try {
    // The converter loads only for a book not converted on this device yet.
    const { convertEpub } = await import('./epubEdition')
    const converted = await convertEpub(new Uint8Array(record.bytes!), { fallbackTitle: String(record.title || record.name || '').replace(/\.epub$/i, '') })
    return { edition: converted.edition, images: converted.images }
  } catch (error) {
    return { error }
  }
}

const refusalCode = (result: Converted): string | undefined => 'error' in result ? (result.error as { code?: string } | null)?.code : undefined

/**
 * The book for `/reader?userBook=<hex>`: this account's file on this device,
 * converted once (and again only when the conversion changes). When the file
 * is not on this device, or the copy here cannot be read as an EPUB, the
 * account's private copy is downloaded and kept here instead; only a book in
 * neither place (or a PDF, which Add a book's viewer opens) is 'missing'.
 */
export async function openUserBook(hex: string, options: { owner?: string | null; account?: AccountCopyLoader } = {}): Promise<UserBookOpenResult> {
  const owner = options.owner !== undefined ? options.owner : userBookOwner()
  if (!owner) return { ok: false, reason: 'signed_out', message: MISSING_MESSAGE }
  if (typeof indexedDB === 'undefined') return { ok: false, reason: 'storage', message: STORAGE_MESSAGE }
  const account = options.account ?? loadAccountCopy
  const key = 'epub:' + hex
  let record: UserBookRecord | null
  try { record = await readRecord(key, owner) } catch { return { ok: false, reason: 'storage', message: STORAGE_MESSAGE } }
  if (record && record.kind !== 'epub') return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
  let fromAccount = false
  let edition = record && usableUserEdition(record.edition) ? record.edition : null
  let data = storedImages(record?.figureData)
  // Every picture the edition shows must be on the record; one missing converts the book again.
  if (edition && !edition.chapters.every(chapter => (chapter.figures ?? []).every(figure => !figure.src.startsWith('asset:') || data.has(figure.src.slice('asset:'.length))))) edition = null
  if (!record || (!edition && !record.bytes)) {
    // Not on this device (added on another device of the account), or kept without its file.
    const downloaded = await recordFromAccount(key, owner, hex, record, account)
    if (!downloaded || downloaded === 'pdf') return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
    record = downloaded
    fromAccount = true
    edition = null
  }
  if (!edition) {
    let converted = await convertRecord(record)
    // The copy on this device is damaged (no longer an EPUB): the account's copy replaces it.
    // A file refused for what it is (DRM, an unsupported kind) is the same file in the account.
    if ('error' in converted && !fromAccount && !['drm', 'unsupported'].includes(refusalCode(converted) ?? '')) {
      const downloaded = await recordFromAccount(key, owner, hex, record, account)
      if (downloaded && downloaded !== 'pdf') {
        record = downloaded
        converted = await convertRecord(record)
      }
    }
    if ('error' in converted) {
      const code = refusalCode(converted)
      const message = code && ['drm', 'unsupported', 'bad_epub', 'not_zip'].includes(code) && converted.error instanceof Error ? converted.error.message : CONVERT_FAILED
      return { ok: false, reason: 'unreadable', message }
    }
    edition = converted.edition
    data = converted.images
    // A browser that cannot keep it converts again next time; reading goes on.
    await keepEdition(key, owner, edition, data).catch(() => {})
  } else {
    // Converted before bylines were read: who wrote each chapter, from the stored
    // text, in memory only. Its chapters and every reading place stay as they are.
    edition = healChapterAuthors(edition)
  }
  // Blobs made now, in memory, from the kept bytes: each reader load draws from fresh object URLs.
  const images = new Map<string, Blob>([...data].map(([id, image]) => [id, new Blob([image.data], { type: image.type })]))
  // A cover kept before full-size covers (a 180 px thumbnail, or none drawn) is drawn
  // again from the file, after the book has opened.
  if (shouldHealCover(record)) {
    const bytes = record.bytes!
    setTimeout(() => { void healCover(key, owner, bytes).catch(() => {}) }, COVER_HEAL_DELAY_MS)
  }
  const cover = typeof record.cover === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(record.cover) ? record.cover : null
  return { ok: true, book: { hex, bookId: userBookId(hex), edition, images, place: readUserBookPlace(hex, edition), cover } }
}

const COVER_HEAL_DELAY_MS = 1500

function shouldHealCover(record: UserBookRecord): boolean {
  return record.kind === 'epub' && !!record.bytes && !(Number(record.coverV) >= OWN_COVER_VERSION) && canDrawCover()
}

/** Draw the book's cover from its file at full size and keep it on the record (one transaction). */
export async function healCover(key: string, owner: string, bytes: ArrayBuffer): Promise<boolean> {
  if (!canDrawCover()) return false
  const { readEpubCover } = await import('./epubEdition')
  const picture = await readEpubCover(new Uint8Array(bytes)).catch(() => null)
  const drawn = picture ? await drawCover(new Blob([picture.data], { type: picture.type })).catch(() => null) : null
  // A picture this browser could not draw is tried again on the next open.
  if (picture && !drawn) return false
  const db = await openDb()
  try {
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      let kept = false
      const request = store.get(key)
      request.onsuccess = () => {
        const record = request.result as UserBookRecord | undefined
        if (!record || record.owner !== owner || Number(record.coverV) >= OWN_COVER_VERSION) return
        store.put({ ...record, coverV: OWN_COVER_VERSION, ...(drawn ? { cover: drawn.url, coverW: drawn.width } : {}) })
        kept = true
      }
      tx.oncomplete = () => resolve(kept)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
}

function storedImages(value: unknown): Map<string, UserBookImage> {
  const out = new Map<string, UserBookImage>()
  if (!value || typeof value !== 'object') return out
  for (const [id, image] of Object.entries(value as Record<string, unknown>)) {
    const item = image as UserBookImage | null
    if (item && typeof item.type === 'string' && Object.prototype.toString.call(item.data) === '[object ArrayBuffer]' && item.data.byteLength > 0) out.set(id, item)
  }
  return out
}
