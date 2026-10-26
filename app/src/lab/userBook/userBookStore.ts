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
import { readUserBookPlace, storedPlaceConverter, type UserBookPlace } from './userBookPlace'
import { CURRENT_CONVERTER, EDITION_CONVERTERS, LEGACY_EDITION_CONVERTER, USER_EDITION_FORMAT, editionSource, usableUserEdition, type UserBookEdition, type UserEditionSource } from './userEdition'
import { adoptOcrEditionChoice, applyPhoneOpenRule, keptPdfPrimerKind, pdfEditionChoice, pdfEditionUntold, phoneNow, readPdfTextPlace } from './pdfEditions'
import type { EpubView } from './epubView'
import { ocrDefaultEdition } from './ocrEdition'
import type { ConvertedPdf, PdfScan, PdfConversionProgress } from './pdfEdition'
import { healUserEdition } from './chapterAuthors'
import { OWN_COVER_VERSION } from './ownShelf'
import { canDrawCover, drawCover } from './userBookCover'
import type { UserBookImage } from './epubEdition'
import { fetchAccountCopy, fetchOcrEdition, listAccountBooks, ownBookToken, type AccountCopy, type FetchLike } from './ownAccount'
import { cachedStoredCover, offerCoverToAccount } from './ownCovers'

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
  /** The file it was added as (absent: an EPUB). A PDF reads here as its Tinct text. */
  kind?: 'epub' | 'pdf'
  /** A PDF's page count. */
  pdfPages?: number
  edition: UserBookEdition
  /** The book's pictures, by figure id, read from this device only. */
  images: Map<string, Blob>
  /** Saved place, already checked against the edition; null opens the first chapter. */
  place: UserBookPlace | null
  /** The book's own cover (a data: URL kept on this device), or null. */
  cover?: string | null
  /** Without one here: the account's stored copy of it, as this device kept it (ownCovers.ts), or null. */
  storedCover?: string | null
  /** An optional cover cache lookup; the converted text opens without waiting for this other database. */
  storedCoverPending?: Promise<string | null>
}

export type UserBookOpenResult =
  | { ok: true; book: LoadedUserBook }
  /**
   * 'pages_only': a PDF without text to reflow (a scan), read in its pages;
   * 'pages': a PDF the reader reads in Original pages. Both go on to the viewer.
   */
  | { ok: false; reason: 'signed_out' | 'missing' | 'unreadable' | 'storage' | 'pages_only' | 'pages' | 'margin'; message: string }

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

/** Only the current file owner can inspect bytes to verify legacy static EPUB annotations. */
export async function readOwnedEpubBytes(hex: string, owner: string): Promise<ArrayBuffer | null> {
  if (userBookOwner() !== owner) return null
  const record = await readRecord('epub:' + hex, owner).catch(() => null)
  return record?.kind === 'epub' && record.bytes instanceof ArrayBuffer ? record.bytes : null
}

/** Display-only locally edited labels, always read through the account-bound file record. */
export async function readOwnedBookMetadata(hex: string, owner: string): Promise<{ type: 'pdf' | 'epub'; id: string; name: string; title: string; author: string; metadataRev: number } | null> {
  if (userBookOwner() !== owner) return null
  for (const type of ['epub', 'pdf'] as const) {
    const record = await readRecord(type + ':' + hex, owner).catch(() => null)
    if (record?.kind === type && userBookOwner() === owner) return {
      type, id: typeof record.cloudId === 'string' ? record.cloudId : '', name: record.name ?? '', title: record.title ?? '', author: record.author ?? '', metadataRev: typeof record.metadataRev === 'number' ? record.metadataRev : 0,
    }
  }
  return null
}

/** Finish the private upload skipped by the retired PDF viewer. Never recreate a deleted generation. */
const pendingPdfUploads = new Map<string, Promise<string | null>>()
export function savePendingOwnedPdf(hex: string, owner: string, token: string, fetchImpl: FetchLike = fetch): Promise<string | null> {
  const key = owner + ':' + hex
  const pending = pendingPdfUploads.get(key)
  if (pending) return pending
  const task = uploadPendingOwnedPdf(hex, owner, token, fetchImpl).finally(() => {
    if (pendingPdfUploads.get(key) === task) pendingPdfUploads.delete(key)
  })
  pendingPdfUploads.set(key, task)
  return task
}
async function uploadPendingOwnedPdf(hex: string, owner: string, token: string, fetchImpl: FetchLike): Promise<string | null> {
  if (userBookOwner() !== owner || !/^[0-9a-f]{24}$/.test(hex)) return null
  const record = await readRecord('pdf:' + hex, owner).catch(() => null)
  if (!record || record.kind !== 'pdf' || record.cloudId || !(record.bytes instanceof ArrayBuffer)) return null
  if (record.bytes.byteLength > 50 * 1024 * 1024) throw new Error('This PDF is over 50 MB. Its original pages are available, but account highlights and AI require a smaller file.')
  const digest = await crypto.subtle.digest('SHA-256', record.bytes)
  const sha = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('')
  if (!sha.startsWith(hex) || userBookOwner() !== owner) return null
  const scan = record.scan as { title?: string; author?: string } | undefined
  const enc = (value: unknown) => encodeURIComponent(String(value || '').slice(0, 300))
  let rights: { v?: string; at?: string } = {}
  try { rights = JSON.parse(localStorage.getItem('tinct-addbook:rights:' + owner) || '{}') } catch { /* no invented attestation */ }
  const response = await fetchImpl('/api/user-books', { method: 'POST', credentials: 'same-origin', cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf', 'X-Book-Name': enc(record.name),
      'X-Book-Title': enc(scan?.title || record.title), 'X-Book-Author': enc(scan?.author || record.author),
      ...(rights.v ? { 'X-Rights-Version': enc(rights.v), 'X-Rights-At': enc(rights.at) } : {}) }, body: record.bytes.slice(0) })
  if (!response.ok) throw new Error('This PDF could not be saved to your account. Your original file is safe. Try again to enable highlights and AI.')
  const { book } = await response.json() as { book?: { id?: string; sha256?: string; type?: string } }
  if (!book || book.type !== 'pdf' || book.sha256 !== sha || !/^[0-9a-f]{32}$/.test(book.id || '') || userBookOwner() !== owner) return null
  await keepFields('pdf:' + hex, owner, { cloudId: book.id })
  return book.id!
}

/** The account file generation, verified against the owner-qualified cached record. */
export async function readOwnedBookFileId(hex: string, owner: string): Promise<string | null> {
  if (userBookOwner() !== owner) return null
  for (const type of ['epub', 'pdf'] as const) {
    const record = await readRecord(type + ':' + hex, owner).catch(() => null)
    if (record?.kind === type && typeof record.cloudId === 'string' && record.cloudId && userBookOwner() === owner) return record.cloudId
  }
  return null
}

/** The existing PDF scan's verified heading provenance for Original-page navigation. */
export async function readOwnedPdfScanEntries(hex: string, owner: string): Promise<{ entries: Array<{ id: string; label: string; page: number; kind?: string; parent?: string | null }>; nav: string; pages: number } | null> {
  if (userBookOwner() !== owner) return null
  const record = await readRecord('pdf:' + hex, owner).catch(() => null)
  if (record?.kind !== 'pdf' || userBookOwner() !== owner) return null
  const scan = record.scan as { pages?: unknown; nav?: unknown; entries?: unknown } | null | undefined
  const pages = Number.isInteger(scan?.pages) && (scan!.pages as number) > 0 ? scan!.pages as number
    : Number.isInteger(record.pages) && (record.pages as number) > 0 ? record.pages as number : 0
  if (!pages || pages > 1_000_000 || !scan || !Array.isArray(scan.entries)) return null
  const entries: Array<{ id: string; label: string; page: number; kind?: string; parent?: string | null }> = []
  for (const raw of scan.entries) {
    if (!raw || typeof raw !== 'object') return null
    const entry = raw as Record<string, unknown>
    if (typeof entry.id !== 'string' || !entry.id || entry.id.length > 120
      || typeof entry.label !== 'string' || !entry.label.trim() || entry.label.length > 240
      || !Number.isInteger(entry.page) || (entry.page as number) < 1 || (entry.page as number) > pages
      || entry.kind !== undefined && (typeof entry.kind !== 'string' || entry.kind.length > 80)
      || entry.parent !== undefined && entry.parent !== null && (typeof entry.parent !== 'string' || entry.parent.length > 120)) return null
    entries.push({ id: entry.id, label: entry.label, page: entry.page as number,
      ...(typeof entry.kind === 'string' ? { kind: entry.kind } : {}),
      ...(entry.parent !== undefined ? { parent: entry.parent as string | null } : {}) })
  }
  return { entries, nav: ['outline', 'contents', 'headings'].includes(String(scan.nav)) ? String(scan.nav) : 'pages', pages }
}

/** Cache discovered navigation only for the same owned source generation. */
export async function cacheOwnedPdfScan(hex: string, owner: string, scan: PdfScan, expectedFileId: string | null): Promise<void> {
  if (userBookOwner() !== owner) return
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE)
      const request = store.get('pdf:' + hex)
      request.onsuccess = () => {
        const record = request.result as UserBookRecord | undefined
        if (userBookOwner() !== owner || record?.kind !== 'pdf' || record.owner !== owner || (record.cloudId || null) !== expectedFileId) return
        store.put({ ...record, scan, pages: scan.pages })
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally { db.close() }
}

/** Only a real converted PDF/OCR edition enables the Original→Tinct text switch. */
export async function hasOwnedPdfText(hex: string, owner: string): Promise<boolean> {
  if (userBookOwner() !== owner) return false
  const record = await readRecord('pdf:' + hex, owner).catch(() => null)
  return record?.kind === 'pdf' && usableUserEdition(record.edition, 'pdf') && userBookOwner() === owner
}

/** PDF page source in the shared shell: owned local file, or a verified account copy cached on this device. */
export async function loadOwnedPdfBytes(hex: string, owner: string, options: { token?: string | null; fetchImpl?: FetchLike } = {}): Promise<ArrayBuffer | null> {
  if (userBookOwner() !== owner) return null
  const local = await readRecord('pdf:' + hex, owner).catch(() => null)
  if (local?.kind === 'pdf' && local.bytes instanceof ArrayBuffer) return local.bytes.slice(0)
  const token = options.token !== undefined ? options.token : await ownBookToken()
  if (!token || userBookOwner() !== owner) return null
  const fetchImpl = options.fetchImpl ?? fetch
  const account = await listAccountBooks(token, fetchImpl)
  const book = account?.find(item => item.type === 'pdf' && item.sha256.slice(0, 24) === hex)
  if (!book || userBookOwner() !== owner) return null
  try {
    const response = await fetchImpl(`/api/user-books/${encodeURIComponent(book.id)}`, { credentials: 'same-origin', cache: 'no-store', headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) return null
    const bytes = await response.arrayBuffer()
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    const prefix = [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('').slice(0, 24)
    if (prefix !== hex || userBookOwner() !== owner) return null
    await putRecord({ key: 'pdf:' + hex, kind: 'pdf', owner, cloudId: book.id, name: book.name, title: book.title, author: book.author,
      ...(book.metadataRev ? { metadataRev: book.metadataRev } : {}), bytes }).catch(() => {})
    return bytes.slice(0)
  } catch { return null }
}

/** Keep the conversion and its pictures on the book's own record (read and written in one transaction). */
async function keepEdition(key: string, owner: string, edition: UserBookEdition, images: Map<string, UserBookImage>): Promise<void> {
  return keepFields(key, owner, { edition, figureData: Object.fromEntries(images) }, ['figureImages'])
}

/** Write fields onto the book's own record (and drop `drop`), read and written in one transaction. */
async function keepFields(key: string, owner: string, fields: Record<string, unknown>, drop: string[] = []): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      const request = store.get(key)
      request.onsuccess = () => {
        const record = request.result as UserBookRecord | undefined
        if (!record || record.owner !== owner) return
        const rest: Record<string, unknown> = { ...record }
        for (const field of drop) delete rest[field]
        store.put({ ...rest, ...fields })
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
const loadAccountCopy: AccountCopyLoader = async hex => fetchAccountCopy(hex, await ownBookToken(), fetch,
  () => { void import('./epubEdition').catch(() => {}) })

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

async function convertRecord(record: UserBookRecord, rules: number): Promise<Converted> {
  try {
    // The converter loads only for a book not converted on this device yet.
    const { convertEpub } = await import('./epubEdition')
    const converted = await convertEpub(new Uint8Array(record.bytes!), { fallbackTitle: String(record.title || record.name || '').replace(/\.epub$/i, ''), rules })
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
export async function openUserBook(hex: string, options: { onProgress?: (progress: PdfConversionProgress) => void; owner?: string | null; account?: AccountCopyLoader; convert?: PdfConverter; ocr?: OcrEditionLoader; page?: number | null; epubView?: EpubView; desktop?: boolean; sharedReader?: boolean } = {}): Promise<UserBookOpenResult> {
  const owner = options.owner !== undefined ? options.owner : userBookOwner()
  if (!owner) return { ok: false, reason: 'signed_out', message: MISSING_MESSAGE }
  if (typeof indexedDB === 'undefined') return { ok: false, reason: 'storage', message: STORAGE_MESSAGE }
  const account = options.account ?? loadAccountCopy
  const key = 'epub:' + hex
  let record: UserBookRecord | null
  try { record = await readRecord(key, owner) } catch { return { ok: false, reason: 'storage', message: STORAGE_MESSAGE } }
  // A PDF this device keeps: its Tinct text.
  if (!record) {
    let pdf: UserBookRecord | null
    try { pdf = await readRecord('pdf:' + hex, owner) } catch { return { ok: false, reason: 'storage', message: STORAGE_MESSAGE } }
    if (pdf && pdf.kind === 'pdf') return openPdfBook(hex, owner, pdf, options)
  }
  // An EPUB read in Margin view on this device (epubView.ts; the desktop's default): on to Add a book's
  // margin reader before any conversion. A book not on this device yet is fetched there too.
  if (!options.sharedReader && options.epubView === 'margin' && (!record || record.kind === 'epub')) return { ok: false, reason: 'margin', message: '' }
  if (record && record.kind !== 'epub') return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
  let fromAccount = false
  // Under the rules it was first converted with: a book already read keeps its chapters, paragraphs and places.
  const rules = conversionRules(record?.edition, storedPlaceConverter(hex))
  let edition = record && usableUserEdition(record.edition, 'epub') ? record.edition : null
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
    let converted = await convertRecord(record, rules)
    // The copy on this device is damaged (no longer an EPUB): the account's copy replaces it.
    // A file refused for what it is (DRM, an unsupported kind) is the same file in the account.
    if ('error' in converted && !fromAccount && !['drm', 'unsupported'].includes(refusalCode(converted) ?? '')) {
      const downloaded = await recordFromAccount(key, owner, hex, record, account)
      if (downloaded && downloaded !== 'pdf') {
        record = downloaded
        converted = await convertRecord(record, rules)
      }
    }
    if ('error' in converted) {
      const code = refusalCode(converted)
      const message = code && ['drm', 'unsupported', 'bad_epub', 'not_zip'].includes(code) && converted.error instanceof Error ? converted.error.message : CONVERT_FAILED
      return { ok: false, reason: 'unreadable', message }
    }
    edition = converted.edition
    data = converted.images
    options.onProgress?.({ stage: 'saving' })
    // A browser that cannot keep it converts again next time; reading goes on.
    await keepEdition(key, owner, edition, data).catch(() => {})
  }
  // What an earlier conversion lacks that changes no chapter or paragraph (bylines, the
  // author's name, a one-chapter book's title), from the stored text, in memory only.
  edition = healUserEdition(edition)
  // Blobs made now, in memory, from the kept bytes: each reader load draws from fresh object URLs.
  const images = new Map<string, Blob>([...data].map(([id, image]) => [id, new Blob([image.data], { type: image.type })]))
  // A cover kept before full-size covers (a 180 px thumbnail, or none drawn) is drawn
  // again from the file, after the book has opened.
  const heal = shouldHealCover(record)
  if (heal) {
    const bytes = record.bytes!
    setTimeout(() => { void healCover(key, owner, bytes).catch(() => {}) }, COVER_HEAL_DELAY_MS)
  }
  const cover = typeof record.cover === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(record.cover) ? record.cover : null
  // A cover this device has goes to an account copy that has none (once per book per page
  // load); a cover being drawn again goes when healCover has drawn it.
  if (cover && !heal && !offered.has(hex)) {
    offered.add(hex)
    setTimeout(() => { void offerCoverToAccount(hex, cover).catch(() => false) }, COVER_HEAL_DELAY_MS)
  }
  const storedCoverPending = cover ? undefined : cachedStoredCover(owner, hex).catch(() => null)
  return { ok: true, book: { hex, bookId: userBookId(hex), edition, images, place: readUserBookPlace(hex, edition), cover,
    storedCover: null, ...(storedCoverPending ? { storedCoverPending } : {}) } }
}

/**
 * The rules a book is converted again with (userEdition.ts): those of its
 * stored conversion, when it has one (kept, but missing a picture); else
 * those its saved place was read under, a place saved before the place
 * recorded them being a place in a conversion made before
 * USER_EDITION_CONVERTER; else the current rules, for a book never read here.
 */
export function conversionRules(stored: unknown, placeConverter: number | null | undefined, source: UserEditionSource = 'epub'): number {
  const edition = stored as Partial<UserBookEdition> | null | undefined
  const known = EDITION_CONVERTERS[source]
  if (edition && edition.format === USER_EDITION_FORMAT && editionSource(edition) === source && typeof edition.converter === 'number' && known.includes(edition.converter)) return edition.converter
  if (placeConverter === undefined) return CURRENT_CONVERTER[source]
  if (placeConverter !== null && known.includes(placeConverter)) return placeConverter
  // A place saved before places recorded their rules: an EPUB's was read in the legacy conversion; a PDF's text has had one set of rules.
  return source === 'epub' ? LEGACY_EDITION_CONVERTER : CURRENT_CONVERTER[source]
}

/** Never shown: the reader forwards these to the viewer. */
const PAGES_ONLY_MESSAGE = ''

/** The account's recognised (OCR) Tinct text of a scanned PDF (ownAccount.ts fetchOcrEdition); injectable for tests. */
export type OcrEditionLoader = (hex: string) => Promise<UserBookEdition | null>
const loadOcrEdition: OcrEditionLoader = async hex => fetchOcrEdition(hex, await ownBookToken())
export type PdfConverter = (bytes: ArrayBuffer, options: { onProgress?: (progress: PdfConversionProgress) => void; fileName?: string; stored?: unknown; phoneKind?: { primer: (kinds: readonly string[]) => string | null } }) => Promise<ConvertedPdf>
const convertPdfBytes: PdfConverter = async (bytes, options) => (await import('./pdfEdition')).convertPdf(bytes, options)

/**
 * A PDF this device keeps, as its Tinct text: the stored conversion when it is
 * of these rules (or the recognised text kept here); else, for a scan, the
 * account's recognised text (OCR), fetched and kept on the record; else
 * converted from the file here (kept on the record with the scan's default
 * edition). A scan with no text recognised is 'pages_only'; a PDF the reader
 * reads in Original pages is 'pages' (unless `text`: the reader just chose
 * Tinct text); a PDF kept without its file is 'missing' (the viewer downloads it).
 *
 * Recognised text reaching this device sets the edition the book opens in
 * from now on (adoptOcrEditionChoice): Tinct text, unless the job found a
 * paper (ocrDefaultEdition).
 */
async function openPdfBook(hex: string, owner: string, record: UserBookRecord, options: { onProgress?: (progress: PdfConversionProgress) => void; convert?: PdfConverter; ocr?: OcrEditionLoader; page?: number | null; desktop?: boolean; sharedReader?: boolean } = {}): Promise<UserBookOpenResult> {
  const key = 'pdf:' + hex
  const scan = record.scan as { v?: unknown; layout?: { default?: string }; textPages?: unknown; pages?: unknown } | null | undefined
  let layout = (record.layout as { default?: string } | undefined)?.default ?? scan?.layout?.default ?? null
  // The desktop reads every PDF in the margin reader (its pages, or its Tinct text beside the margin, made there when
  // the reader picks it): on to it at once, nothing converted here (D's trace, 22 Oct 2026: the whole PDF was
  // converted first, then the margin reader loaded pdf.js again). A scan without text keeps its pages.
  if (options.desktop && !options.sharedReader) return scan?.textPages === 0 || layout === 'pages-only' ? { ok: false, reason: 'pages_only', message: PAGES_ONLY_MESSAGE } : { ok: false, reason: 'pages', message: PAGES_ONLY_MESSAGE }
  const phone = options.desktop === undefined ? phoneNow() : !options.desktop
  const sourceOptions = { phone, desktopPages: true }
  // Original pages is the desktop first-open default, even when reflowed text is cached.
  // Resolve it before conversion; an explicit Tinct-text choice still wins.
  if (options.sharedReader && !phone && pdfEditionChoice(hex, layout, undefined, sourceOptions) === 'pages') {
    return { ok: false, reason: scan?.textPages === 0 || layout === 'pages-only' ? 'pages_only' : 'pages', message: PAGES_ONLY_MESSAGE }
  }
  let edition = usableUserEdition(record.edition, 'pdf') ? record.edition : null
  let figureData = storedImages(record.figureData)
  // A conversion kept under earlier rules: converted again below; the place read in it moves by its page.
  const previous = !edition && record.edition && typeof record.edition === 'object' && Array.isArray(record.edition.chapters) ? record.edition : null
  let pageCount: unknown = [record.pages, scan?.pages].find(n => Number.isInteger(n) && (n as number) > 0)
  const ocr = options.ocr ?? loadOcrEdition
  const recognised = async (): Promise<UserBookEdition | null> => {
    const found = await ocr(hex).catch(() => null)
    if (found) adoptOcrEditionChoice(hex, ocrDefaultEdition(found))
    return found
  }
  // A scan: its text, if the account has recognised it.
  if (!edition && (scan?.textPages === 0 || layout === 'pages-only')) {
    edition = await recognised()
    if (!edition) return { ok: false, reason: 'pages_only', message: PAGES_ONLY_MESSAGE }
    await keepFields(key, owner, { edition }).catch(() => {})
  }
  // Read in Original pages: on to the viewer at once (its Tinct text is made when the reader picks it).
  // The shared desktop default was resolved above; conversion here requires its selected Tinct text.
  const beforeOpen = { phone, desktopPages: false }
  // Not told yet on a phone: converted here, and the phone's rule told with it (below), rather than in the viewer.
  if (!edition && (pdfEditionChoice(hex, layout, undefined, beforeOpen) === 'pages' || (!phone && pdfEditionUntold(hex, layout, undefined, beforeOpen)))) return { ok: false, reason: 'pages', message: PAGES_ONLY_MESSAGE }
  if (!edition) {
    if (!record.bytes) return { ok: false, reason: 'missing', message: MISSING_MESSAGE }
    let made: ConvertedPdf | null = null
    // On a phone with nothing told yet, the converter tells the document's kind too (the viewer's rule), so the
    // phone's open rule is applied below without a trip to the viewer and back.
    const tell = phone && pdfEditionUntold(hex, layout ?? 'text', undefined, sourceOptions) ? { phoneKind: { primer: (kinds: readonly string[]) => keptPdfPrimerKind(hex, kinds) } } : {}
    try { made = await (options.convert ?? convertPdfBytes)(record.bytes, { fileName: record.name, stored: record.scan, ...tell, ...(options.onProgress ? { onProgress: options.onProgress } : {}) }) } catch { made = null }
    // Its pages still open in the viewer, which says what it can of a damaged file.
    if (!made) return { ok: false, reason: 'pages_only', message: PAGES_ONLY_MESSAGE }
    layout = made.scan.layout?.default ?? layout
    pageCount ??= made.scan.pages
    edition = made.edition ?? (made.scan.textPages === 0 ? await recognised() : null)
    if (!edition) {
      if (made.fresh) await keepFields(key, owner, { scan: made.scan, layout: made.scan.layout, pages: made.scan.pages }).catch(() => {})
      return { ok: false, reason: 'pages_only', message: PAGES_ONLY_MESSAGE }
    }
    options.onProgress?.({ stage: 'saving' })
    // A browser that cannot keep it converts again next time; reading goes on.
    // Its crops (formulas, figures, tables drawn from its pages) are kept beside it, as an EPUB's pictures are: on this device, for this owner.
    figureData = made.images ?? new Map()
    await keepFields(key, owner, { edition, layout: made.scan.layout, figureData: Object.fromEntries(figureData), ...(made.fresh ? { scan: made.scan, pages: made.scan.pages } : {}) }).catch(() => {})
    // The phone's open rule, as the viewer applies it (reader.js phoneKind, openKind): its pages go on to the viewer.
    if (made.phone && editionSource(edition) !== 'ocr' && phone && pdfEditionUntold(hex, layout, undefined, sourceOptions)) applyPhoneOpenRule(hex, made.phone)
  }
  // Recognised text opens by its own default (the scan's is its pages only).
  if (editionSource(edition) === 'ocr') layout = ocrDefaultEdition(edition)
  // Not yet told on this device under the current open rule (pdfEditions.ts): the viewer decides, and forwards back when it is Tinct text.
  if (pdfEditionChoice(hex, layout, undefined, sourceOptions) === 'pages' || pdfEditionUntold(hex, layout, undefined, sourceOptions)) return { ok: false, reason: 'pages', message: PAGES_ONLY_MESSAGE }
  edition = healUserEdition(edition)
  const pages = Number.isInteger(pageCount) && (pageCount as number) > 0 ? pageCount as number : undefined
  const cover = typeof record.cover === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(record.cover) ? record.cover : null
  const images = new Map<string, Blob>([...figureData].map(([id, image]) => [id, new Blob([image.data], { type: image.type })]))
  return { ok: true, book: { hex, bookId: userBookId(hex), kind: 'pdf', ...(pages ? { pdfPages: pages } : {}), edition, images, place: readPdfTextPlace(hex, edition, { page: options.page, previous }), cover } }
}

const COVER_HEAL_DELAY_MS = 1500
/** Books whose cover this page load has offered to the account already. */
const offered = new Set<string>()

function shouldHealCover(record: UserBookRecord): boolean {
  return record.kind === 'epub' && !!record.bytes && !(Number(record.coverV) >= OWN_COVER_VERSION) && canDrawCover()
}

/** The cover drawn by healCover goes to the account copy when it has none; injectable for tests. */
export type CoverOffer = (hex: string, cover: string) => Promise<boolean>

/**
 * Draw the book's cover from its file at full size and keep it on the record
 * (one transaction); then send its small copy to the account copy, when that has none.
 */
export async function healCover(key: string, owner: string, bytes: ArrayBuffer, offer: CoverOffer = offerCoverToAccount): Promise<boolean> {
  if (!canDrawCover()) return false
  const { readEpubCover } = await import('./epubEdition')
  const picture = await readEpubCover(new Uint8Array(bytes)).catch(() => null)
  const drawn = picture ? await drawCover(new Blob([picture.data], { type: picture.type })).catch(() => null) : null
  // A picture this browser could not draw is tried again on the next open.
  if (picture && !drawn) return false
  const db = await openDb()
  let kept = false
  try {
    kept = await new Promise<boolean>((resolve, reject) => {
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
  if (kept && drawn) {
    const hex = key.slice(key.indexOf(':') + 1)
    offered.add(hex)
    void offer(hex, drawn.url).catch(() => false)
  }
  return kept
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
