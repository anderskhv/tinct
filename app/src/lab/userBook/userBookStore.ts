/**
 * A reader's own EPUB on this device: the file Add a book keeps in IndexedDB
 * (`tinct-addbook`, store `books`, record `epub:<hex>`, tagged with the
 * account that opened it), the edition converted from it (kept on the same
 * record, so removing the book or signing out removes it too), and the
 * reader's place in it (localStorage `tinct-addbook:place:<hex>`).
 *
 * Nothing here leaves the device. Sign-out deletes the database and every
 * `tinct-addbook:` key (`clearLocalUserData`).
 */
import { ADD_BOOK_IDB_NAME } from '../../services/storage'
import { readCachedSupabaseUser } from '../labLibraryBoot'
import { userBookId } from './userBookId'
import { readUserBookPlace, type UserBookPlace } from './userBookPlace'
import { usableUserEdition, type UserBookEdition } from './userEdition'
import type { UserBookImage } from './epubEdition'

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

/**
 * The book for `/reader?userBook=<hex>`: this account's file on this device,
 * converted once (and again only when the conversion changes).
 */
export async function openUserBook(hex: string, options: { owner?: string | null } = {}): Promise<UserBookOpenResult> {
  const owner = options.owner !== undefined ? options.owner : userBookOwner()
  if (!owner) return { ok: false, reason: 'signed_out', message: MISSING_MESSAGE }
  if (typeof indexedDB === 'undefined') return { ok: false, reason: 'storage', message: STORAGE_MESSAGE }
  const key = 'epub:' + hex
  let record: UserBookRecord | null
  try { record = await readRecord(key, owner) } catch { return { ok: false, reason: 'storage', message: STORAGE_MESSAGE } }
  if (!record || record.kind !== 'epub') return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
  let edition = usableUserEdition(record.edition) ? record.edition : null
  let data = storedImages(record.figureData)
  // Every picture the edition shows must be on the record; one missing converts the book again.
  if (edition && !edition.chapters.every(chapter => (chapter.figures ?? []).every(figure => !figure.src.startsWith('asset:') || data.has(figure.src.slice('asset:'.length))))) edition = null
  if (!edition) {
    if (!record.bytes) return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
    try {
      // The converter loads only for a book not converted on this device yet.
      const { convertEpub } = await import('./epubEdition')
      const converted = await convertEpub(new Uint8Array(record.bytes), { fallbackTitle: String(record.title || record.name || '').replace(/\.epub$/i, '') })
      edition = converted.edition
      data = converted.images
    } catch (error) {
      const code = (error as { code?: string } | null)?.code
      const message = code && ['drm', 'unsupported', 'bad_epub', 'not_zip'].includes(code) && error instanceof Error
        ? error.message
        : 'This file could not be opened as an EPUB. Choose another file.'
      return { ok: false, reason: 'unreadable', message }
    }
    // A browser that cannot keep it converts again next time; reading goes on.
    await keepEdition(key, owner, edition, data).catch(() => {})
  }
  // Blobs made now, in memory, from the kept bytes: each reader load draws from fresh object URLs.
  const images = new Map<string, Blob>([...data].map(([id, image]) => [id, new Blob([image.data], { type: image.type })]))
  return { ok: true, book: { hex, bookId: userBookId(hex), edition, images, place: readUserBookPlace(hex, edition) } }
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
