/**
 * "Bring your own book", release 2: private cloud copies of a signed-in
 * reader's own PDF and EPUB files, so a book follows them across devices.
 *
 *   GET    /api/user-books            list the caller's books (metadata only)
 *   POST   /api/user-books            upload one file (raw body; metadata in headers);
 *                                     Premium or the 30-day trial only (402 otherwise)
 *   GET    /api/user-books/{fileId}   the file's bytes, to its owner only
 *   DELETE /api/user-books/{fileId}   delete it (with its place, narration and recap)
 *   GET    /api/user-books/places     the reader's place in each own book
 *   PUT    /api/user-books/places/{bookHex}
 *                                     save one place: versioned (`rev`), a stale
 *                                     write gets 409 and the stored place back
 *
 * Storage is the private R2 bucket USER_BOOKS (never AUDIO_BUCKET, which is
 * public). Every key is `u/{userId}/{fileId}`: the user id comes from the
 * verified session only, and fileId is 16 random bytes, never derived from the
 * file or its name. Another account's file is therefore unreachable, and every
 * miss answers 404, never 403, so existence is not confirmed.
 *
 * Metadata (name, title, author, type, sha256, createdAt, and the rights
 * confirmation's wording version and time) lives in each
 * object's R2 customMetadata rather than in a per-user index object: it is
 * written and deleted atomically with the bytes, and R2 listing is strongly
 * consistent, so there is no read-modify-write index to race or drift.
 *
 * Files are never shared, indexed, searched or deduplicated across accounts.
 * The same file uploaded twice by one account is stored once.
 * Account export lists these files and account deletion removes the whole
 * `u/{userId}/` prefix (routes/adminAccounts.ts).
 *
 * Narration of an own book (routes/ownBookNarration.ts) is stored beside the
 * files, under `u/{userId}/narration/{bookHex}/`, where bookHex is the first 24
 * hex digits of the file's SHA-256 (the reader's `userbook-` id). Deleting a
 * book deletes that prefix too; account deletion takes it with the rest.
 *
 * The reader's place in an own book (so it opens where they left it on their
 * other devices) is one empty object per book, `u/{userId}/places/{bookHex}`,
 * its place in customMetadata (an EPUB's chapter, paragraph and word, or a
 * PDF's page and how far down it; when, whole-book percent and a revision):
 * never the book's title or text, never in the
 * shared position stores. One listing reads every place. A write names the
 * revision it read; an older one is refused with the stored place (and the
 * put itself is conditional on the object's etag), so devices never
 * overwrite a newer place blindly. Deleting the book deletes its place.
 *
 * Catch me up on an own book (routes/ownCatchUp.ts) keeps its cumulative
 * recap the same way, under `u/{userId}/recaps/{bookHex}/`: deleted with the
 * book and with the account, never shared between accounts.
 *
 * A small image of the book's own cover (drawn on the device that has the
 * file: JPEG or WebP, about 400 px on its long side, at most MAX_COVER_BYTES)
 * is kept beside the file at `u/{userId}/covers/{bookHex}`, so the reader's
 * other devices show the real cover before the book is opened there:
 *
 *   PUT    /api/user-books/covers/{bookHex}   store it (an owned book only)
 *   GET    /api/user-books/covers/{bookHex}   the image, to its owner only (private caching)
 *
 * The list names it as each book's `cover` (that URL with a version, or null).
 * Deleting the book deletes its cover; account deletion takes it with the
 * whole `u/{userId}/` prefix, and account export lists it.
 *
 * Before you start (the margin reader's primer on an own PDF: a gist, key
 * claims, cautions and a map of one unit, made by the companion's `primer`
 * chapter action) is stored with the file once made, so reopening never
 * makes it again; Redo stores a new one over it. One small JSON object per
 * unit, `u/{userId}/primers/{bookHex}/{unitKey}`:
 *
 *   GET    /api/user-books/primers/{bookHex}?unit={unitKey}   the stored primer, to its owner only (404 when none)
 *   PUT    /api/user-books/primers/{bookHex}?unit={unitKey}   store `{ primer: { gist, claims, keepInMind, map } }`
 *                                                            (an owned PDF only; at most MAX_PRIMER_BYTES)
 *
 * The Worker validates the shape (companion/primerParse.ts) and stamps
 * `madeAt` and `unitKey` itself. Deleting the book deletes its primers;
 * account deletion takes them with the whole `u/{userId}/` prefix, and
 * account export counts them.
 *
 * Recognising the text of a scanned own PDF (Premium; dark until the Worker
 * var OWN_PDF_OCR is "1", and every route below answers 404 while it is not):
 *
 *   POST   /api/user-books/ocr/{bookHex}           start `{ pages, blank?, rerun?: 'failed'|'all' }`
 *   GET    /api/user-books/ocr/{bookHex}           the job's status, pages still to upload, the reader's tier and month
 *   PUT    /api/user-books/ocr/{bookHex}/pages/{n} one page image (image/jpeg, at most 1.5 MB)
 *   GET    /api/user-books/ocr/{bookHex}/edition   the recognised Tinct text
 *   DELETE /api/user-books/ocr/{bookHex}           cancel: unused page reservations back, everything deleted
 *
 * Owner only (a PDF under the caller's own prefix whose SHA-256 starts with
 * the hex; 404 otherwise). Starting needs Premium or the trial (402
 * `premium_required`, 503 when it cannot be read). Everything is kept under
 * `u/{userId}/ocr/{bookHex}/` (lib/ownOcr.ts); the job runs in
 * ownOcrCoordinator.ts. Deleting the book deletes it, and so does deleting the account.
 */
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'
import type { PremiumTier } from '../lib/aiAllowance'
import {
  OCR_MAX_IMAGE_BYTES,
  OCR_READS_PER_MINUTE,
  OCR_STARTS_PER_MINUTE,
  OCR_UPLOADS_PER_MINUTE,
  ocrCoordinatorName,
  ocrEditionKey,
  ocrImageKey,
  ownOcrLimits,
  ownOcrPrefix,
  ownPdfOcrOn,
  type OwnOcrEnv,
} from '../lib/ownOcr'
import type { OwnOcrCoordinator } from '../ownOcrCoordinator'
import { PRIMER_UNIT_KEY_RE, normalizePrimer, normalizeStoredPrimer, type StoredPrimer } from '../../companion/primerParse'

export const MAX_FILE_BYTES = 50 * 1024 * 1024
export const MAX_ACCOUNT_BYTES = 2 * 1024 * 1024 * 1024
export const MAX_ACCOUNT_FILES = 200
/** Uploads per account per rate-limit window (60 s, lib/rateLimit.ts). */
export const UPLOADS_PER_MINUTE = 10

/** Encoded (ASCII) caps keep customMetadata well under R2's 2 KB limit. */
const META_CAPS = { name: 600, title: 600, author: 400 } as const
const FILE_ID = /^[0-9a-f]{32}$/
const TYPES = { pdf: 'application/pdf', epub: 'application/epub+zip' } as const
export type UserBookType = keyof typeof TYPES

export type UserBooksEnv = { USER_BOOKS?: R2Bucket; OWN_OCR?: DurableObjectNamespace<OwnOcrCoordinator> }
  & Pick<OwnOcrEnv, 'OWN_PDF_OCR' | 'OCR_MAX_PAGES' | 'XAI_API_KEY'>
export { ownOcrPrefix }
/** A stored cover is at most this many bytes (the browser aims under 60 KB). */
export const MAX_COVER_BYTES = 64 * 1024
/** Cover writes per account per rate-limit window. */
export const COVER_WRITES_PER_MINUTE = 30
type VerifiedUser = { id: string; email?: string }

export type UserBook = {
  id: string
  name: string
  title: string
  author: string
  type: UserBookType
  size: number
  sha256: string
  createdAt: string
  /** Its stored cover (`/api/user-books/covers/{bookHex}?v=…`, the owner only), or null. */
  cover: string | null
}

export function userBooksPrefix(userId: string): string {
  return `u/${userId}/`
}

/** Hex digits of a file's SHA-256 that name it in the reader (`userbook-{hex}`). */
export const USER_BOOK_HEX_LENGTH = 24

/** Where one own book's narration lives: inside the owner's private prefix only. */
export function ownNarrationPrefix(userId: string, bookHex: string): string {
  return `${userBooksPrefix(userId)}narration/${bookHex}/`
}

/** Where one own book's Catch me up recap lives: inside the owner's private prefix only. */
export function ownRecapPrefix(userId: string, bookHex: string): string {
  return `${userBooksPrefix(userId)}recaps/${bookHex}/`
}

/** Where the reader's place in one own book lives: inside the owner's private prefix only. */
export function ownPlaceKey(userId: string, bookHex: string): string {
  return `${userBooksPrefix(userId)}places/${bookHex}`
}

/** Where the small image of one own book's cover lives: inside the owner's private prefix only. */
export function ownCoverKey(userId: string, bookHex: string): string {
  return `${userBooksPrefix(userId)}covers/${bookHex}`
}

/** Where one own book's Before you start primers live, one object per unit: inside the owner's private prefix only. */
export function ownPrimerPrefix(userId: string, bookHex: string): string {
  return `${userBooksPrefix(userId)}primers/${bookHex}/`
}

/** Every object under `prefix`, deleted page by page. Returns how many went. */
export async function purgePrefix(bucket: R2Bucket, prefix: string): Promise<number> {
  let removed = 0
  for (let round = 0; round < 1000; round++) {
    // Always re-list from the start: deleting shifts the listing under a cursor.
    const page = await bucket.list({ prefix, limit: 1000 })
    const keys = page.objects.map(object => object.key).filter(key => key.startsWith(prefix))
    if (!keys.length) return removed
    await bucket.delete(keys)
    removed += keys.length
  }
  throw new Error('prefix purge did not finish')
}

function headers(request: Request, extra: Record<string, string> = {}): Record<string, string> {
  return { ...corsHeaders(request), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }
}

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: headers(request) })
}

const notFound = (request: Request) => reply({ error: 'Not found' }, 404, request)

// ===== Metadata =====

/**
 * Percent-encoded so R2 metadata stays ASCII, cut at a whole character once the
 * encoded form reaches `cap`. Control characters and lone surrogates are dropped.
 */
export function encodeMeta(value: string, cap: number): string {
  let out = ''
  // eslint-disable-next-line no-control-regex
  for (const ch of value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim()) {
    let encoded: string
    try { encoded = encodeURIComponent(ch) } catch { continue }
    if (out.length + encoded.length > cap) break
    out += encoded
  }
  return out
}

function decodeMeta(value: string | undefined): string {
  if (!value) return ''
  try { return decodeURIComponent(value) } catch { return '' }
}

/** A header the client percent-encoded; anything undecodable is dropped. */
function headerText(request: Request, name: string): string {
  const value = request.headers.get(name)
  if (!value) return ''
  try { return decodeURIComponent(value) } catch { return '' }
}

/**
 * The rights confirmation the reader gave before adding the file (the Add a
 * book checkbox): which wording (X-Rights-Version) and when (X-Rights-At),
 * kept with the file as a record. Omitted when absent or malformed.
 */
export function rightsAttestation(request: Request): { rightsVersion?: string; rightsAt?: string } {
  const version = headerText(request, 'x-rights-version')
  if (!/^[0-9A-Za-z.-]{1,40}$/.test(version)) return {}
  const at = Date.parse(headerText(request, 'x-rights-at'))
  return { rightsVersion: version, ...(Number.isFinite(at) ? { rightsAt: new Date(at).toISOString() } : {}) }
}

export function bookFromObject(object: { key: string; size: number; uploaded: Date; customMetadata?: Record<string, string> }): UserBook | null {
  const id = object.key.split('/').pop() ?? ''
  const meta = object.customMetadata ?? {}
  const type = meta.type === 'pdf' || meta.type === 'epub' ? meta.type : null
  if (!FILE_ID.test(id) || !type) return null
  return {
    id,
    name: decodeMeta(meta.name),
    title: decodeMeta(meta.title),
    author: decodeMeta(meta.author),
    type,
    size: object.size,
    sha256: /^[0-9a-f]{64}$/.test(meta.sha256 ?? '') ? meta.sha256 : '',
    createdAt: meta.createdAt || object.uploaded.toISOString(),
    cover: null,
  }
}

/** Every book under one account, following R2's pagination. */
export async function listUserBooks(bucket: R2Bucket, userId: string): Promise<UserBook[]> {
  const books: UserBook[] = []
  let cursor: string | undefined
  do {
    // Files sit directly under the prefix; the delimiter keeps narration
    // (u/{userId}/narration/…) and recaps (u/{userId}/recaps/…) out of the listing and the storage total.
    const page = await bucket.list({ prefix: userBooksPrefix(userId), cursor, limit: 1000, include: ['customMetadata'], delimiter: '/' })
    for (const object of page.objects) {
      const book = bookFromObject(object)
      if (book) books.push(book)
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return books.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Deletes everything under `u/{userId}/` (files, their narration and recaps), page by page. Returns how many objects went. */
export async function purgeUserBooks(bucket: R2Bucket, userId: string): Promise<number> {
  return purgePrefix(bucket, userBooksPrefix(userId))
}

/**
 * The canonical narration key of a book this account owns, or null. `hex` is
 * the reader's `userbook-` hex; it must match the start of the SHA-256 of a
 * file stored under the caller's own prefix (the same file uploaded by two
 * accounts is two private copies, each found only by its owner).
 */
export async function ownedBookHex(bucket: R2Bucket, userId: string, hex: string): Promise<string | null> {
  if (!/^[0-9a-f]{24,64}$/.test(hex)) return null
  const books = await listUserBooks(bucket, userId)
  const book = books.find(item => item.sha256 && item.sha256.startsWith(hex))
  return book ? book.sha256.slice(0, USER_BOOK_HEX_LENGTH) : null
}

// ===== File checks =====

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d] // %PDF-
const ZIP_LOCAL = 0x04034b50
const ZIP_CENTRAL = 0x02014b50
const ZIP_END = 0x06054b50
const EPUB_MIME = 'application/epub+zip'

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  start < 0 || start + length > bytes.length ? '' : String.fromCharCode(...bytes.subarray(start, start + length))

/** The stored (uncompressed) `mimetype` entry whose local header sits at `offset`. */
function storedMimetypeAt(bytes: Uint8Array, view: DataView, offset: number): boolean {
  if (offset < 0 || offset + 30 > bytes.length || view.getUint32(offset, true) !== ZIP_LOCAL) return false
  const method = view.getUint16(offset + 8, true)
  const nameLength = view.getUint16(offset + 26, true)
  const extraLength = view.getUint16(offset + 28, true)
  if (method !== 0 || ascii(bytes, offset + 30, nameLength) !== 'mimetype') return false
  return ascii(bytes, offset + 30 + nameLength + extraLength, EPUB_MIME.length) === EPUB_MIME
}

/** EPUB: a ZIP whose `mimetype` entry is stored and reads application/epub+zip (OCF). */
function isEpub(bytes: Uint8Array): boolean {
  if (bytes.length < 30) return false
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(0, true) !== ZIP_LOCAL) return false
  // OCF puts mimetype first; tolerate files that do not, via the central directory.
  if (storedMimetypeAt(bytes, view, 0)) return true
  const floor = Math.max(0, bytes.length - 22 - 65535)
  for (let end = bytes.length - 22; end >= floor; end--) {
    if (view.getUint32(end, true) !== ZIP_END) continue
    const entries = view.getUint16(end + 10, true)
    let at = view.getUint32(end + 16, true)
    for (let i = 0; i < entries && at + 46 <= bytes.length; i++) {
      if (view.getUint32(at, true) !== ZIP_CENTRAL) return false
      const nameLength = view.getUint16(at + 28, true)
      const skip = 46 + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
      if (ascii(bytes, at + 46, nameLength) === 'mimetype') return storedMimetypeAt(bytes, view, view.getUint32(at + 42, true))
      at += skip
    }
    return false
  }
  return false
}

/** A PDF ends with its end-of-file marker (allowing trailing bytes); a file cut short has none. */
const PDF_EOF_WINDOW = 4096
function endsLikePdf(bytes: Uint8Array): boolean {
  const from = Math.max(0, bytes.length - PDF_EOF_WINDOW)
  return ascii(bytes, from, bytes.length - from).includes('%%EOF')
}

/** The file's type from its bytes alone; the client's Content-Type and name are not trusted. */
export function sniffBookType(bytes: Uint8Array): UserBookType | null {
  if (PDF_MAGIC.every((byte, i) => bytes[i] === byte)) return endsLikePdf(bytes) ? 'pdf' : null
  if (isEpub(bytes)) return 'epub'
  return null
}

/**
 * Reads the body up to `limit` bytes; null as soon as it would exceed it. With a
 * declared Content-Length the bytes go straight into one buffer of that size, so a
 * 50 MB upload holds one copy in memory (Workers allow 128 MB), not two.
 */
async function readCapped(body: ReadableStream<Uint8Array> | null, limit: number, declared: number | null): Promise<Uint8Array | null> {
  if (!body) return new Uint8Array()
  const reader = body.getReader()
  const fixed = declared !== null && declared <= limit ? new Uint8Array(declared) : null
  const parts: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (total + value.byteLength > (fixed ? fixed.byteLength : limit)) {
      await reader.cancel().catch(() => {})
      return null
    }
    if (fixed) fixed.set(value, total)
    else parts.push(value)
    total += value.byteLength
  }
  if (fixed) return total === fixed.byteLength ? fixed : fixed.subarray(0, total)
  const out = new Uint8Array(total)
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.byteLength }
  return out
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// ===== Handlers =====

async function upload(request: Request, bucket: R2Bucket, userId: string, checkRateLimit: CheckRateLimit): Promise<Response> {
  const lengthHeader = request.headers.get('content-length')
  const declared = lengthHeader !== null && /^\d+$/.test(lengthHeader.trim()) ? Number(lengthHeader) : null
  if (declared !== null && declared > MAX_FILE_BYTES) return reply({ error: 'file_too_large', maxBytes: MAX_FILE_BYTES }, 413, request)
  if (!await checkRateLimit(`user-books-upload:${userId}`, undefined, UPLOADS_PER_MINUTE)) {
    return reply({ error: 'rate_limited' }, 429, request)
  }

  const bytes = await readCapped(request.body, MAX_FILE_BYTES, declared)
  if (!bytes) return reply({ error: 'file_too_large', maxBytes: MAX_FILE_BYTES }, 413, request)
  const type = sniffBookType(bytes)
  if (!type) return reply({ error: 'unsupported_type' }, 415, request)
  const sha256 = await sha256Hex(bytes)

  const existing = await listUserBooks(bucket, userId)
  const same = existing.find(book => book.sha256 === sha256 && book.size === bytes.byteLength)
  if (same) return reply({ book: (await withCovers(bucket, userId, [same]))[0], existing: true }, 200, request)
  const used = existing.reduce((sum, book) => sum + book.size, 0)
  if (existing.length >= MAX_ACCOUNT_FILES || used + bytes.byteLength > MAX_ACCOUNT_BYTES) {
    return reply({ error: 'account_full', maxFiles: MAX_ACCOUNT_FILES, maxBytes: MAX_ACCOUNT_BYTES }, 413, request)
  }

  const id = randomId()
  const name = headerText(request, 'x-book-name')
  const customMetadata = {
    name: encodeMeta(name, META_CAPS.name),
    title: encodeMeta(headerText(request, 'x-book-title') || name.replace(/\.(pdf|epub)$/i, ''), META_CAPS.title),
    author: encodeMeta(headerText(request, 'x-book-author'), META_CAPS.author),
    type,
    sha256,
    createdAt: new Date().toISOString(),
    ...rightsAttestation(request),
  }
  const stored = await bucket.put(`${userBooksPrefix(userId)}${id}`, bytes, {
    httpMetadata: { contentType: TYPES[type] },
    customMetadata,
  })
  const book = bookFromObject({ key: stored.key, size: stored.size, uploaded: stored.uploaded, customMetadata })
  return reply({ book }, 201, request)
}

async function download(request: Request, bucket: R2Bucket, userId: string, fileId: string): Promise<Response> {
  const object = await bucket.get(`${userBooksPrefix(userId)}${fileId}`)
  if (!object) return notFound(request)
  const book = bookFromObject(object)
  if (!book) return notFound(request)
  return new Response(object.body, {
    status: 200,
    headers: headers(request, {
      'Content-Type': TYPES[book.type],
      'Content-Length': String(object.size),
      'Content-Disposition': 'attachment',
    }),
  })
}

async function remove(request: Request, env: UserBooksEnv, bucket: R2Bucket, userId: string, fileId: string): Promise<Response> {
  const key = `${userBooksPrefix(userId)}${fileId}`
  const head = await bucket.head(key)
  if (!head) return notFound(request)
  await bucket.delete(key)
  // Its narration, Catch me up recap, primers and recognised text go with it (the same file is stored once per account).
  const sha256 = head.customMetadata?.sha256 ?? ''
  if (/^[0-9a-f]{64}$/.test(sha256)) {
    const bookHex = sha256.slice(0, USER_BOOK_HEX_LENGTH)
    await purgePrefix(bucket, ownNarrationPrefix(userId, bookHex))
    await purgePrefix(bucket, ownRecapPrefix(userId, bookHex))
    await purgePrefix(bucket, ownPrimerPrefix(userId, bookHex))
    await bucket.delete([ownPlaceKey(userId, bookHex), ownCoverKey(userId, bookHex)])
    // An OCR job stops and gives back what it held (with job.json gone it would stop on its own too).
    if (env.OWN_OCR) await env.OWN_OCR.getByName(await ocrCoordinatorName(userId, bookHex)).cancel().catch(() => null)
    await purgePrefix(bucket, ownOcrPrefix(userId, bookHex))
  }
  return reply({ ok: true }, 200, request)
}

// ===== OCR of scanned PDFs =====

const JPEG_SOI = [0xff, 0xd8, 0xff]

/** A whole JPEG: its start-of-image marker first and its end-of-image marker last. */
export function looksLikeJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 4 && JPEG_SOI.every((byte, i) => bytes[i] === byte) && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9
}

type OcrRouteDeps = {
  verifyUser: (request: Request) => Promise<VerifiedUser | null>
  checkRateLimit: CheckRateLimit
  premiumAccess: (userId: string) => Promise<boolean | null>
  premiumTier?: (userId: string) => Promise<PremiumTier | null>
}

/** Paid Premium, the trial, or neither; null when unknown. Without a tier source, any Premium access counts as paid. */
async function tierOf(deps: OcrRouteDeps, userId: string): Promise<PremiumTier | null> {
  if (deps.premiumTier) return deps.premiumTier(userId).catch(() => null)
  const access = await deps.premiumAccess(userId).catch(() => null)
  return access === null ? null : access ? 'premium' : 'none'
}

const declaredLength = (request: Request): number | null => {
  const value = request.headers.get('content-length')
  return value !== null && /^\d+$/.test(value.trim()) ? Number(value) : null
}

/** `/api/user-books/ocr/…`; `rest` is what follows `/ocr/`. */
async function handleOcr(request: Request, env: UserBooksEnv, deps: OcrRouteDeps, rest: string): Promise<Response> {
  // Dark: nothing here exists until the switch is on.
  if (!ownPdfOcrOn(env)) return notFound(request)
  const [bookHex = '', part, pageText, ...extra] = rest.split('/')
  const route = part === undefined ? 'job'
    : part === 'edition' && pageText === undefined ? 'edition'
      : part === 'pages' && pageText !== undefined && !extra.length ? 'page' : null
  if (!route) return notFound(request)
  const allowed = route === 'job' ? ['GET', 'POST', 'DELETE'] : route === 'edition' ? ['GET'] : ['PUT']
  if (!allowed.includes(request.method)) return reply({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!BOOK_HEX.test(bookHex)) return notFound(request)
  const bucket = env.USER_BOOKS
  const namespace = env.OWN_OCR
  if (!bucket || !namespace) return reply({ error: 'Not configured' }, 503, request)
  const limits = ownOcrLimits(env)

  let n = 0
  if (route === 'page') {
    if (!/^[1-9]\d{0,5}$/.test(pageText!) || Number(pageText) > limits.maxPages) return notFound(request)
    n = Number(pageText)
    const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (type !== 'image/jpeg') return reply({ error: 'unsupported_type' }, 415, request)
    if ((declaredLength(request) ?? 0) > OCR_MAX_IMAGE_BYTES) return reply({ error: 'image_too_large', maxBytes: OCR_MAX_IMAGE_BYTES }, 413, request)
  }
  const [limitKey, perMinute] = route === 'page' ? ['user-books-ocr-page', OCR_UPLOADS_PER_MINUTE] as const
    : request.method === 'GET' ? ['user-books-ocr-read', OCR_READS_PER_MINUTE] as const
      : ['user-books-ocr-start', OCR_STARTS_PER_MINUTE] as const
  if (!await deps.checkRateLimit(`${limitKey}:${user.id}`, undefined, perMinute)) return reply({ error: 'rate_limited' }, 429, request)

  // Owner only: a PDF stored under the caller's own prefix.
  const book = (await listUserBooks(bucket, user.id)).find(item => item.type === 'pdf' && item.sha256.slice(0, USER_BOOK_HEX_LENGTH) === bookHex)
  if (!book) return notFound(request)
  const job = namespace.getByName(await ocrCoordinatorName(user.id, bookHex))

  if (route === 'edition') {
    const object = await bucket.get(ocrEditionKey(user.id, bookHex))
    if (!object) return notFound(request)
    return new Response(object.body, { status: 200, headers: headers(request, { 'Content-Type': 'application/json' }) })
  }
  if (route === 'page') {
    if (!await job.canUpload(n)) return reply({ error: 'not_expected' }, 409, request)
    const bytes = await readCapped(request.body, OCR_MAX_IMAGE_BYTES, declaredLength(request))
    if (!bytes) return reply({ error: 'image_too_large', maxBytes: OCR_MAX_IMAGE_BYTES }, 413, request)
    if (!looksLikeJpeg(bytes)) return reply({ error: 'unsupported_type' }, 415, request)
    const imageKey = ocrImageKey(user.id, bookHex, n)
    await bucket.put(imageKey, bytes, { httpMetadata: { contentType: 'image/jpeg' } })
    if (!await job.pageUploaded(n)) {
      await bucket.delete(imageKey)
      return reply({ error: 'not_expected' }, 409, request)
    }
    return reply({ ok: true }, 200, request)
  }
  // The reader's tier and month come too: the reader offers recognition from them.
  if (request.method === 'GET') {
    const tier = await tierOf(deps, user.id)
    return reply({ ...await job.status({ userId: user.id, tier }), tier }, 200, request)
  }
  if (request.method === 'DELETE') {
    const { refunded } = await job.cancel()
    await purgePrefix(bucket, ownOcrPrefix(user.id, bookHex))
    return reply({ ok: true, refunded }, 200, request)
  }

  // POST: start, or re-run.
  let body: { pages?: unknown; blank?: unknown; rerun?: unknown } | null
  try { body = await request.json() as typeof body } catch { return reply({ error: 'bad_request' }, 400, request) }
  const pages = body?.pages
  if (typeof pages !== 'number' || !Number.isInteger(pages) || pages < 1) return reply({ error: 'bad_request' }, 400, request)
  if (pages > limits.maxPages) return reply({ error: 'too_many_pages', maxPages: limits.maxPages }, 413, request)
  const blank = body?.blank ?? []
  if (!Array.isArray(blank) || blank.length > pages || !blank.every(item => Number.isInteger(item) && item >= 1 && item <= pages)) {
    return reply({ error: 'bad_request' }, 400, request)
  }
  const rerun = body?.rerun === 'failed' || body?.rerun === 'all' ? body.rerun : undefined
  if (body?.rerun !== undefined && !rerun) return reply({ error: 'bad_request' }, 400, request)
  const tier = await tierOf(deps, user.id)
  if (tier === null) return reply({ error: 'unavailable' }, 503, request)
  if (tier === 'none') return reply({ error: 'premium_required' }, 402, request)
  if (!env.XAI_API_KEY) return reply({ error: 'unavailable' }, 503, request)
  const status = await job.start({ userId: user.id, hex: bookHex, pages, title: book.title, author: book.author, blank: blank as number[], rerun, tier })
  return reply(status, 202, request)
}

// ===== Places =====

/** A reader's place in an EPUB they added (the Tinct reader): chapter, paragraph and word. */
export type OwnTextPlace = { chapterNumber: number; paragraphIndex: number; wordIndex: number; updatedAt: number; percent?: number; converter?: number; rev: number }
/**
 * A reader's place in a PDF they added: the page and how far down it (0-1)
 * and, whichever of its editions they read it in, the same spot in its Tinct
 * text (chapter, paragraph, word, the rules it was converted under) and the
 * edition read ('t' Tinct text, 'p' Original pages).
 */
export type OwnPagePlace = {
  page: number; frac?: number; updatedAt: number; percent?: number
  chapterNumber?: number; paragraphIndex?: number; wordIndex?: number; converter?: number; edition?: 't' | 'p'
  rev: number
}
/** A reader's place in an own book, as stored and served. */
export type OwnPlace = OwnTextPlace | OwnPagePlace
type PlaceBody = Omit<OwnTextPlace, 'rev'> | Omit<OwnPagePlace, 'rev'>
/** Place writes per account per rate-limit window (the reader sends one every few seconds at most). */
export const PLACE_WRITES_PER_MINUTE = 60
const BOOK_HEX = /^[0-9a-f]{24}$/
const MAX_PLACE_INDEX = 1_000_000

const wholeNumber = (value: unknown, max = MAX_PLACE_INDEX): value is number => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max

/**
 * A place from a request body or from stored metadata (strings); null when any
 * field is out of shape. A place with a `page` is a PDF's (the page and how far
 * down it, and the spot in its Tinct text when it carries one: all three of
 * chapter, paragraph and word, or none); any other is an EPUB's (chapter,
 * paragraph, word).
 */
export function readPlace(value: unknown): PlaceBody | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const number = (field: unknown) => typeof field === 'string' && field !== '' ? Number(field) : field
  const updatedAt = number(raw.updatedAt)
  const percent = number(raw.percent)
  if (!wholeNumber(updatedAt, Number.MAX_SAFE_INTEGER) || updatedAt <= 0) return null
  const keepPercent = (place: PlaceBody) => {
    if (typeof percent === 'number' && Number.isFinite(percent) && percent >= 0 && percent <= 100) place.percent = Math.round(percent * 10) / 10
  }
  if (raw.page !== undefined) {
    const page = number(raw.page)
    const frac = number(raw.frac)
    if (!wholeNumber(page) || page < 1) return null
    if (frac !== undefined && (typeof frac !== 'number' || !Number.isFinite(frac) || frac < 0 || frac > 1)) return null
    const pagePlace: Omit<OwnPagePlace, 'rev'> = { page, ...(typeof frac === 'number' ? { frac: Math.round(frac * 10_000) / 10_000 } : {}), updatedAt }
    keepPercent(pagePlace)
    const chapterNumber = number(raw.chapterNumber), paragraphIndex = number(raw.paragraphIndex), wordIndex = number(raw.wordIndex)
    const anyText = [chapterNumber, paragraphIndex, wordIndex].some(field => field !== undefined)
    if (anyText) {
      if (!wholeNumber(chapterNumber) || chapterNumber < 1 || !wholeNumber(paragraphIndex) || !wholeNumber(wordIndex)) return null
      Object.assign(pagePlace, { chapterNumber, paragraphIndex, wordIndex })
      const converter = number(raw.converter)
      if (wholeNumber(converter, 1000) && converter >= 1) pagePlace.converter = converter
    }
    if (raw.edition !== undefined) {
      if (raw.edition !== 't' && raw.edition !== 'p') return null
      pagePlace.edition = raw.edition
    }
    return pagePlace
  }
  const chapterNumber = number(raw.chapterNumber)
  const paragraphIndex = number(raw.paragraphIndex)
  const wordIndex = number(raw.wordIndex)
  const converter = number(raw.converter)
  if (!wholeNumber(chapterNumber) || chapterNumber < 1 || !wholeNumber(paragraphIndex) || !wholeNumber(wordIndex)) return null
  const place: Omit<OwnTextPlace, 'rev'> = { chapterNumber, paragraphIndex, wordIndex, updatedAt }
  keepPercent(place)
  // The conversion rules the place was read under (userEdition.ts), so another device converts the book the same way.
  if (wholeNumber(converter, 1000) && converter >= 1) place.converter = converter
  return place
}

function storedPlace(meta: Record<string, string> | undefined): OwnPlace | null {
  const place = readPlace(meta)
  const rev = Number(meta?.rev)
  return place && Number.isInteger(rev) && rev > 0 ? { ...place, rev } : null
}

const placeMetadata = (place: OwnPlace): Record<string, string> => Object.fromEntries(Object.entries(place).map(([key, value]) => [key, String(value)]))

/** Every place this account keeps, by book hex. */
export async function listOwnPlaces(bucket: R2Bucket, userId: string): Promise<Record<string, OwnPlace>> {
  const prefix = ownPlaceKey(userId, '')
  const places: Record<string, OwnPlace> = {}
  let cursor: string | undefined
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000, include: ['customMetadata'] })
    for (const object of page.objects) {
      const hex = object.key.slice(prefix.length)
      const place = BOOK_HEX.test(hex) ? storedPlace(object.customMetadata) : null
      if (place) places[hex] = place
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return places
}

/**
 * Save one place. The body is `{ place, rev }`: `rev` is the revision the
 * device last read (0 for none). Only a book this account owns has a place.
 */
async function savePlace(request: Request, bucket: R2Bucket, userId: string, bookHex: string, checkRateLimit: CheckRateLimit): Promise<Response> {
  if (!await checkRateLimit(`user-books-place:${userId}`, undefined, PLACE_WRITES_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  let body: { place?: unknown; rev?: unknown } | null
  try { body = await request.json() as typeof body } catch { return reply({ error: 'bad_request' }, 400, request) }
  const place = readPlace(body?.place)
  const expected = body?.rev
  if (!place || !Number.isInteger(expected) || (expected as number) < 0) return reply({ error: 'bad_request' }, 400, request)
  const book = (await listUserBooks(bucket, userId)).find(item => item.sha256.slice(0, USER_BOOK_HEX_LENGTH) === bookHex)
  if (!book) return notFound(request)
  // A page place is a PDF's only.
  if ('page' in place && book.type !== 'pdf') return reply({ error: 'bad_request' }, 400, request)
  const key = ownPlaceKey(userId, bookHex)
  const head = await bucket.head(key)
  const current = head ? storedPlace(head.customMetadata) : null
  if ((current?.rev ?? 0) !== expected) return reply({ error: 'conflict', place: current }, 409, request)
  const next: OwnPlace = { ...place, rev: (current?.rev ?? 0) + 1 }
  // Conditional on the object read above: a write that landed in between wins, and this one is told.
  const stored = await bucket.put(key, '', { customMetadata: placeMetadata(next), ...(head ? { onlyIf: { etagMatches: head.etag } } : {}) })
  if (!stored) {
    const latest = await bucket.head(key)
    return reply({ error: 'conflict', place: latest ? storedPlace(latest.customMetadata) : null }, 409, request)
  }
  return reply({ place: next }, 200, request)
}

/** `/api/user-books/places` (GET) and `/api/user-books/places/{bookHex}` (PUT). */
async function handlePlaces(
  request: Request,
  env: UserBooksEnv,
  deps: { verifyUser: (request: Request) => Promise<VerifiedUser | null>; checkRateLimit: CheckRateLimit },
  bookHex: string,
): Promise<Response> {
  const allowed = bookHex === '' ? ['GET'] : ['PUT']
  if (!allowed.includes(request.method)) return reply({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (bookHex !== '' && !BOOK_HEX.test(bookHex)) return notFound(request)
  const bucket = env.USER_BOOKS
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  if (bookHex === '') return reply({ places: await listOwnPlaces(bucket, user.id) }, 200, request)
  return savePlace(request, bucket, user.id, bookHex, deps.checkRateLimit)
}

// ===== Covers =====

/** The stored image's type from its bytes alone: JPEG or WebP (what the browser draws), else null. */
export function sniffCoverType(bytes: Uint8Array): 'image/jpeg' | 'image/webp' | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length > 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp'
  return null
}

const coverUrl = (bookHex: string, uploaded: Date) => `/api/user-books/covers/${bookHex}?v=${uploaded.getTime().toString(36)}`

/** Every stored cover of one account: book hex, size and when it was stored (account export lists these). */
export async function listOwnCovers(bucket: R2Bucket, userId: string): Promise<Array<{ bookHex: string; size: number; uploaded: string }>> {
  const prefix = ownCoverKey(userId, '')
  const out: Array<{ bookHex: string; size: number; uploaded: Date }> = []
  let cursor: string | undefined
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 })
    for (const object of page.objects) {
      const bookHex = object.key.slice(prefix.length)
      if (BOOK_HEX.test(bookHex)) out.push({ bookHex, size: object.size, uploaded: object.uploaded })
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return out.map(item => ({ ...item, uploaded: item.uploaded.toISOString() }))
}

/** The books with their stored cover's URL (one listing of the covers prefix). */
async function withCovers(bucket: R2Bucket, userId: string, books: UserBook[]): Promise<UserBook[]> {
  if (!books.length) return books
  const covers = new Map((await listOwnCovers(bucket, userId)).map(item => [item.bookHex, item]))
  return books.map(book => {
    const bookHex = book.sha256.slice(0, USER_BOOK_HEX_LENGTH)
    const cover = book.sha256 ? covers.get(bookHex) : undefined
    return { ...book, cover: cover ? coverUrl(bookHex, new Date(cover.uploaded)) : null }
  })
}

/** `/api/user-books/covers/{bookHex}`: PUT stores the image of an owned book's cover, GET serves it to its owner. */
async function handleCover(
  request: Request,
  env: UserBooksEnv,
  deps: { verifyUser: (request: Request) => Promise<VerifiedUser | null>; checkRateLimit: CheckRateLimit },
  bookHex: string,
): Promise<Response> {
  if (!['GET', 'PUT'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!BOOK_HEX.test(bookHex)) return notFound(request)
  const bucket = env.USER_BOOKS
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const key = ownCoverKey(user.id, bookHex)

  if (request.method === 'GET') {
    const object = await bucket.get(key)
    if (!object) return notFound(request)
    const type = object.httpMetadata?.contentType === 'image/webp' ? 'image/webp' : 'image/jpeg'
    return new Response(object.body, {
      status: 200,
      // Private: the browser may keep it, no shared cache may. The URL the list gives carries a version.
      headers: headers(request, { 'Content-Type': type, 'Content-Length': String(object.size), 'Cache-Control': 'private, max-age=86400', Vary: 'Authorization' }),
    })
  }

  const lengthHeader = request.headers.get('content-length')
  const declared = lengthHeader !== null && /^\d+$/.test(lengthHeader.trim()) ? Number(lengthHeader) : null
  if (declared !== null && declared > MAX_COVER_BYTES) return reply({ error: 'cover_too_large', maxBytes: MAX_COVER_BYTES }, 413, request)
  if (!await deps.checkRateLimit(`user-books-cover:${user.id}`, undefined, COVER_WRITES_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  const bytes = await readCapped(request.body, MAX_COVER_BYTES, declared)
  if (!bytes) return reply({ error: 'cover_too_large', maxBytes: MAX_COVER_BYTES }, 413, request)
  const type = sniffCoverType(bytes)
  if (!type) return reply({ error: 'unsupported_type' }, 415, request)
  // Only a book this account keeps has a cover here (the same rule as its place).
  const book = (await listUserBooks(bucket, user.id)).find(item => item.sha256.slice(0, USER_BOOK_HEX_LENGTH) === bookHex)
  if (!book) return notFound(request)
  const stored = await bucket.put(key, bytes, { httpMetadata: { contentType: type } })
  return reply({ cover: coverUrl(bookHex, stored.uploaded) }, 200, request)
}

// ===== Before you start (primers) =====

/** A stored primer is at most this many bytes of JSON (a full one is about 5 KB). */
export const MAX_PRIMER_BYTES = 32 * 1024
/** Primers kept per book: one per top-level outline entry, and a PDF has rarely more than a few dozen. */
export const MAX_PRIMERS_PER_BOOK = 200
/** Primer writes per account per rate-limit window (one per unit the reader opens, or a Redo). */
export const PRIMER_WRITES_PER_MINUTE = 30

async function countPrimers(bucket: R2Bucket, prefix: string): Promise<number> {
  let count = 0
  let cursor: string | undefined
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 })
    count += page.objects.length
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return count
}

/** `/api/user-books/primers/{bookHex}?unit={unitKey}`: GET serves the stored primer to its owner, PUT stores one for an owned PDF. */
async function handlePrimer(
  request: Request,
  env: UserBooksEnv,
  deps: { verifyUser: (request: Request) => Promise<VerifiedUser | null>; checkRateLimit: CheckRateLimit },
  bookHex: string,
): Promise<Response> {
  if (!['GET', 'PUT'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!BOOK_HEX.test(bookHex)) return notFound(request)
  const unitKey = new URL(request.url).searchParams.get('unit') ?? ''
  if (!PRIMER_UNIT_KEY_RE.test(unitKey)) return reply({ error: 'bad_unit' }, 400, request)
  const bucket = env.USER_BOOKS
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)
  const prefix = ownPrimerPrefix(user.id, bookHex)
  const key = `${prefix}${unitKey}`

  if (request.method === 'GET') {
    // Under the caller's own prefix, so only its owner can reach it; it goes with the book.
    const object = await bucket.get(key)
    if (!object) return notFound(request)
    let primer: StoredPrimer | null = null
    try { primer = normalizeStoredPrimer(await object.json()) } catch { primer = null }
    return primer ? reply({ primer }, 200, request) : notFound(request)
  }

  const lengthHeader = request.headers.get('content-length')
  const declared = lengthHeader !== null && /^\d+$/.test(lengthHeader.trim()) ? Number(lengthHeader) : null
  if (declared !== null && declared > MAX_PRIMER_BYTES) return reply({ error: 'primer_too_large', maxBytes: MAX_PRIMER_BYTES }, 413, request)
  if (!await deps.checkRateLimit(`user-books-primer:${user.id}`, undefined, PRIMER_WRITES_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)
  const bytes = await readCapped(request.body, MAX_PRIMER_BYTES, declared)
  if (!bytes) return reply({ error: 'primer_too_large', maxBytes: MAX_PRIMER_BYTES }, 413, request)
  let body: unknown = null
  try { body = JSON.parse(new TextDecoder().decode(bytes)) } catch { body = null }
  const content = body && typeof body === 'object' ? normalizePrimer((body as { primer?: unknown }).primer) : null
  if (!content) return reply({ error: 'invalid_primer' }, 400, request)
  // Only a PDF this account keeps has primers (the same rule as its place and cover).
  const book = (await listUserBooks(bucket, user.id)).find(item => item.sha256.slice(0, USER_BOOK_HEX_LENGTH) === bookHex)
  if (!book) return notFound(request)
  if (book.type !== 'pdf') return reply({ error: 'pdf_only' }, 400, request)
  if (!await bucket.head(key) && await countPrimers(bucket, prefix) >= MAX_PRIMERS_PER_BOOK) {
    return reply({ error: 'too_many_primers', max: MAX_PRIMERS_PER_BOOK }, 409, request)
  }
  const primer: StoredPrimer = { ...content, madeAt: new Date().toISOString(), unitKey }
  const json = JSON.stringify(primer)
  if (new TextEncoder().encode(json).byteLength > MAX_PRIMER_BYTES) return reply({ error: 'primer_too_large', maxBytes: MAX_PRIMER_BYTES }, 413, request)
  await bucket.put(key, json, { httpMetadata: { contentType: 'application/json' } })
  return reply({ primer }, 200, request)
}

/** Every stored primer of one account, counted by book (account export lists these, never the text). */
export async function listOwnPrimers(bucket: R2Bucket, userId: string): Promise<Array<{ bookHex: string; units: number; bytes: number }>> {
  const prefix = `${userBooksPrefix(userId)}primers/`
  const byBook = new Map<string, { units: number; bytes: number }>()
  let cursor: string | undefined
  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 })
    for (const object of page.objects) {
      const bookHex = object.key.slice(prefix.length).split('/')[0]
      if (!BOOK_HEX.test(bookHex)) continue
      const entry = byBook.get(bookHex) ?? { units: 0, bytes: 0 }
      entry.units += 1
      entry.bytes += object.size
      byBook.set(bookHex, entry)
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return [...byBook].map(([bookHex, entry]) => ({ bookHex, ...entry }))
}

export async function handleUserBooks(
  request: Request,
  env: UserBooksEnv,
  deps: {
    verifyUser: (request: Request) => Promise<VerifiedUser | null>
    checkRateLimit: CheckRateLimit
    /** Premium or in the 30-day trial (lib/aiAllowance.ts loadPremiumAccess); null when unknown. Uploading is Premium only. */
    premiumAccess: (userId: string) => Promise<boolean | null>
    /** Paid Premium, the trial or neither (lib/aiAllowance.ts loadPremiumTier): OCR has a smaller trial ceiling. */
    premiumTier?: (userId: string) => Promise<PremiumTier | null>
  },
): Promise<Response> {
  const url = new URL(request.url)
  const rest = url.pathname.slice('/api/user-books'.length)
  if (rest === '/ocr' || rest.startsWith('/ocr/')) return handleOcr(request, env, deps, rest.slice('/ocr/'.length))
  const placeHex = rest === '/places' ? '' : rest.startsWith('/places/') ? rest.slice('/places/'.length) : null
  if (placeHex !== null) return handlePlaces(request, env, deps, placeHex)
  if (rest === '/covers' || rest.startsWith('/covers/')) return handleCover(request, env, deps, rest.slice('/covers/'.length))
  if (rest === '/primers' || rest.startsWith('/primers/')) return handlePrimer(request, env, deps, rest.slice('/primers/'.length))
  const fileId = rest === '' || rest === '/' ? null : rest.slice(1)
  const allowed = fileId === null ? ['GET', 'POST'] : ['GET', 'DELETE']
  if (!allowed.includes(request.method)) return reply({ error: 'Method not allowed' }, 405, request)

  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (fileId !== null && !FILE_ID.test(fileId)) return notFound(request)
  const bucket = env.USER_BOOKS
  if (!bucket) return reply({ error: 'Not configured' }, 503, request)

  if (fileId === null) {
    if (request.method === 'POST') {
      // Adding a book is Premium (or the trial); listing, opening and deleting books already added never are.
      const premium = await deps.premiumAccess(user.id).catch(() => null)
      if (premium === null) return reply({ error: 'unavailable' }, 503, request)
      if (!premium) return reply({ error: 'premium_required' }, 402, request)
      return upload(request, bucket, user.id, deps.checkRateLimit)
    }
    const books = await withCovers(bucket, user.id, await listUserBooks(bucket, user.id))
    return reply({
      books,
      limits: { maxFileBytes: MAX_FILE_BYTES, maxAccountBytes: MAX_ACCOUNT_BYTES, maxAccountFiles: MAX_ACCOUNT_FILES },
    }, 200, request)
  }
  if (request.method === 'DELETE') return remove(request, env, bucket, user.id, fileId)
  return download(request, bucket, user.id, fileId)
}
