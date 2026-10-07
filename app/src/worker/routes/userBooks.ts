/**
 * "Bring your own book", release 2: private cloud copies of a signed-in
 * reader's own PDF and EPUB files, so a book follows them across devices.
 *
 *   GET    /api/user-books            list the caller's books (metadata only)
 *   POST   /api/user-books            upload one file (raw body; metadata in headers);
 *                                     Premium or the 30-day trial only (402 otherwise)
 *   GET    /api/user-books/{fileId}   the file's bytes, to its owner only
 *   DELETE /api/user-books/{fileId}   delete it
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
 */
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'

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

export type UserBooksEnv = { USER_BOOKS?: R2Bucket }
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
  }
}

/** Every book under one account, following R2's pagination. */
export async function listUserBooks(bucket: R2Bucket, userId: string): Promise<UserBook[]> {
  const books: UserBook[] = []
  let cursor: string | undefined
  do {
    // Files sit directly under the prefix; the delimiter keeps narration
    // (u/{userId}/narration/…) out of the listing and the storage total.
    const page = await bucket.list({ prefix: userBooksPrefix(userId), cursor, limit: 1000, include: ['customMetadata'], delimiter: '/' })
    for (const object of page.objects) {
      const book = bookFromObject(object)
      if (book) books.push(book)
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  return books.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Deletes everything under `u/{userId}/` (files and their narration), page by page. Returns how many objects went. */
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

/** The file's type from its bytes alone; the client's Content-Type and name are not trusted. */
export function sniffBookType(bytes: Uint8Array): UserBookType | null {
  if (PDF_MAGIC.every((byte, i) => bytes[i] === byte)) return 'pdf'
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
  if (same) return reply({ book: same, existing: true }, 200, request)
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

async function remove(request: Request, bucket: R2Bucket, userId: string, fileId: string): Promise<Response> {
  const key = `${userBooksPrefix(userId)}${fileId}`
  const head = await bucket.head(key)
  if (!head) return notFound(request)
  await bucket.delete(key)
  // Its narration goes with it (the same file is stored once per account).
  const sha256 = head.customMetadata?.sha256 ?? ''
  if (/^[0-9a-f]{64}$/.test(sha256)) await purgePrefix(bucket, ownNarrationPrefix(userId, sha256.slice(0, USER_BOOK_HEX_LENGTH)))
  return reply({ ok: true }, 200, request)
}

export async function handleUserBooks(
  request: Request,
  env: UserBooksEnv,
  deps: {
    verifyUser: (request: Request) => Promise<VerifiedUser | null>
    checkRateLimit: CheckRateLimit
    /** Premium or in the 30-day trial (lib/aiAllowance.ts loadPremiumAccess); null when unknown. Uploading is Premium only. */
    premiumAccess: (userId: string) => Promise<boolean | null>
  },
): Promise<Response> {
  const url = new URL(request.url)
  const rest = url.pathname.slice('/api/user-books'.length)
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
    const books = await listUserBooks(bucket, user.id)
    return reply({
      books,
      limits: { maxFileBytes: MAX_FILE_BYTES, maxAccountBytes: MAX_ACCOUNT_BYTES, maxAccountFiles: MAX_ACCOUNT_FILES },
    }, 200, request)
  }
  if (request.method === 'DELETE') return remove(request, bucket, user.id, fileId)
  return download(request, bucket, user.id, fileId)
}
