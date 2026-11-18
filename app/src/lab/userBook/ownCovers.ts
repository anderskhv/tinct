/**
 * Own books' covers across the reader's devices. The device that has the
 * file draws the cover (userBookCover.ts, Add a book's epub.js / reader.js)
 * and keeps it on the book's record; a small copy of that picture (JPEG or
 * WebP, ACCOUNT_COVER_SIDE px on its long side, under ACCOUNT_COVER_BYTES) is
 * kept with the account copy (`PUT /api/user-books/covers/<hex>`, private,
 * the owner only), so another device of the account shows the real cover
 * before the book is opened there.
 *
 * Which cover a book wears (book-cover.js): this device's own picture, else the
 * account's stored one, else the paper cover. A stored cover is read once and
 * kept on this device (IndexedDB `tinct-addbook-covers`, tagged with the
 * account), so it is not downloaded on every open; it is read again only when
 * the account's copy changes (the list's `?v=`). Sign-out deletes that
 * database with Add a book's (`clearLocalUserData`).
 *
 * Existing account copies have no cover until a device that has one (drawn
 * at add, on a later open, or by healCover) lists or opens the book: it is
 * sent then. Nothing is extracted on the server.
 */
import { ADD_BOOK_COVERS_IDB_NAME } from '../../services/storage'
import { ACCOUNT_COVER_MAX_BYTES, fetchAccountCover, listAccountBooks, ownBookToken, putAccountCover, type AccountBook, type FetchLike } from './ownAccount'

/** The stored cover's long side, in pixels. */
export const ACCOUNT_COVER_SIDE = 400
/** The browser aims under this many bytes (the account takes up to ACCOUNT_COVER_MAX_BYTES). */
export const ACCOUNT_COVER_BYTES = 60 * 1024
const COVER_RE = /^data:image\/(jpeg|png|webp);base64,/
const STORE = 'covers'

/** Draws a kept cover as the account's small copy; injectable for tests (no canvas there). */
export type CoverShrinker = (dataUrl: string) => Promise<Blob | null>

function dataUrlBlob(url: string): Blob {
  const comma = url.indexOf(',')
  const binary = atob(url.slice(comma + 1))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: url.slice(5, url.indexOf(';')) })
}

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>(resolve => { try { canvas.toBlob(blob => resolve(blob), type, quality) } catch { resolve(null) } })

/**
 * The small copy of a cover: at most ACCOUNT_COVER_SIDE px on its long side,
 * WebP (else JPEG) at quality 0.8, stepped down until it is under
 * ACCOUNT_COVER_BYTES. Null where this browser cannot draw it.
 */
export const shrinkCover: CoverShrinker = async dataUrl => {
  if (!COVER_RE.test(dataUrl) || typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null
  let bitmap: ImageBitmap
  // Decoded here: the page's connect-src does not allow fetching a data: URL.
  try { bitmap = await createImageBitmap(dataUrlBlob(dataUrl)) } catch { return null }
  try {
    if (!bitmap.width || !bitmap.height) return null
    let scale = Math.min(1, ACCOUNT_COVER_SIDE / Math.max(bitmap.width, bitmap.height))
    for (let round = 0; round < 4; round++, scale *= 0.8) {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) return null
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      for (const [type, quality] of [['image/webp', 0.8], ['image/jpeg', 0.8], ['image/jpeg', 0.65]] as const) {
        const blob = await canvasBlob(canvas, type, quality)
        // A browser without WebP output hands back PNG: the next try is JPEG.
        if (blob && blob.type === type && blob.size <= ACCOUNT_COVER_BYTES) return blob
      }
    }
    return null
  } finally {
    bitmap.close?.()
  }
}

// ===== This device's copy of stored covers =====

export interface CachedCover { hex: string; owner: string; v: string; url: string }

const versionOf = (url: string) => /\?v=([0-9a-z]+)$/.exec(url)?.[1] ?? ''

function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ADD_BOOK_COVERS_IDB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'hex' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest | void): Promise<T | undefined> {
  const db = await openCache()
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = work(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request ? request.result as T : undefined)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
}

/** This device's kept copies of stored covers; injectable for tests (no IndexedDB there). */
export interface CoverCache {
  /** Every kept cover of the account, by book hex. */
  read(owner: string): Promise<Map<string, CachedCover>>
  keep(item: CachedCover): Promise<void>
  drop(hexes: readonly string[]): Promise<void>
}

/** The kept copies in IndexedDB (`tinct-addbook-covers`, deleted on sign-out). */
export const deviceCoverCache: CoverCache = {
  async read(owner) {
    const out = new Map<string, CachedCover>()
    if (typeof indexedDB === 'undefined') return out
    try {
      const all = await withStore<CachedCover[]>('readonly', store => store.getAll())
      for (const item of all ?? []) if (item && item.owner === owner && typeof item.url === 'string' && COVER_RE.test(item.url)) out.set(item.hex, item)
    } catch { /* unreadable: covers are read from the account again */ }
    return out
  },
  async keep(item) {
    if (typeof indexedDB === 'undefined') return
    try { await withStore('readwrite', store => { store.put(item) }) } catch { /* read again next time */ }
  },
  async drop(hexes) {
    if (!hexes.length || typeof indexedDB === 'undefined') return
    try { await withStore('readwrite', store => { for (const hex of hexes) store.delete(hex) }) } catch { /* next time */ }
  },
}

/** Every stored cover this device keeps for the account, by book hex. */
export async function readCachedCovers(owner: string | null | undefined, cache: CoverCache = deviceCoverCache): Promise<Map<string, CachedCover>> {
  return owner ? cache.read(owner) : new Map()
}

/** The cached stored cover of one book, for the reader opening it (null without one). */
export async function cachedStoredCover(owner: string | null | undefined, hex: string): Promise<string | null> {
  return (await readCachedCovers(owner)).get(hex)?.url ?? null
}

/**
 * The account's stored covers for the books that have no picture on this
 * device (`wanted`, book hexes): this device's kept copy when it is current,
 * else read from the account and kept. With no account list (offline), the
 * kept copies as they are.
 */
export async function storedCovers(
  owner: string | null | undefined,
  account: readonly AccountBook[] | null,
  wanted: ReadonlySet<string>,
  options: { token?: string | null; fetchImpl?: FetchLike; cache?: CoverCache } = {},
): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (!owner) return out
  const cache = options.cache ?? deviceCoverCache
  const cached = await readCachedCovers(owner, cache)
  if (!account) {
    for (const hex of wanted) { const kept = cached.get(hex); if (kept) out.set(hex, kept.url) }
    return out
  }
  // Kept covers of books no longer in the account (removed here or on another device) go.
  const inAccount = new Set(account.map(book => book.sha256.slice(0, 24)))
  void cache.drop([...cached.keys()].filter(hex => !inAccount.has(hex))).catch(() => {})
  const token = options.token !== undefined ? options.token : await ownBookToken()
  await Promise.all(account.map(async book => {
    const hex = book.sha256.slice(0, 24)
    if (!wanted.has(hex) || !book.cover) return
    const kept = cached.get(hex)
    if (kept && kept.v === versionOf(book.cover)) { out.set(hex, kept.url); return }
    const url = await fetchAccountCover(book.cover, token ?? null, options.fetchImpl)
    if (!url) { if (kept) out.set(hex, kept.url); return }
    out.set(hex, url)
    await cache.keep({ hex, owner, v: versionOf(book.cover), url }).catch(() => {})
  }))
  return out
}

// ===== Sending this device's covers to the account =====

const sending = new Set<string>()
/** At most this many covers are sent per listing (the rest on the next). */
const SENDS_PER_PASS = 3

/**
 * Send the covers this device has for books whose account copy has none:
 * `local` are this device's books (book hex and its kept picture). Returns the
 * hexes sent. Quiet: a cover not sent is sent on a later listing or open.
 */
export async function sendMissingCovers(
  local: ReadonlyArray<{ hex: string; cover: string | null }>,
  account: readonly AccountBook[],
  options: { token?: string | null; fetchImpl?: FetchLike; shrink?: CoverShrinker } = {},
): Promise<string[]> {
  const bare = new Set(account.filter(book => !book.cover && book.sha256).map(book => book.sha256.slice(0, 24)))
  const todo = local.filter(book => book.cover && COVER_RE.test(book.cover) && bare.has(book.hex) && !sending.has(book.hex)).slice(0, SENDS_PER_PASS)
  if (!todo.length) return []
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token) return []
  const shrink = options.shrink ?? shrinkCover
  const sent: string[] = []
  for (const book of todo) {
    sending.add(book.hex)
    try {
      const image = await shrink(book.cover!).catch(() => null)
      if (!image || image.size > ACCOUNT_COVER_MAX_BYTES) continue
      if (await putAccountCover(book.hex, image, token, options.fetchImpl)) sent.push(book.hex)
    } finally { sending.delete(book.hex) }
  }
  return sent
}

/**
 * One book's freshly drawn cover (healCover, or a cover this device has on
 * open), sent when the account copy of it has none.
 */
export async function offerCoverToAccount(hex: string, cover: string, options: { token?: string | null; fetchImpl?: FetchLike; shrink?: CoverShrinker } = {}): Promise<boolean> {
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token) return false
  const account = await listAccountBooks(token, options.fetchImpl)
  if (!account) return false
  return (await sendMissingCovers([{ hex, cover }], account, { ...options, token })).length > 0
}
