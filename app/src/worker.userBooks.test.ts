import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { makeEpub, zip } from '../../addbooks/web/test/make-epub.mjs'
import worker from './worker'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import {
  COVER_WRITES_PER_MINUTE,
  MAX_COVER_BYTES,
  MAX_ACCOUNT_BYTES,
  MAX_ACCOUNT_FILES,
  MAX_FILE_BYTES,
  MAX_PRIMER_BYTES,
  MAX_PRIMERS_PER_BOOK,
  PRIMER_WRITES_PER_MINUTE,
  UPLOADS_PER_MINUTE,
  encodeMeta,
  handleUserBooks,
  sniffBookType,
  type UserBook,
} from './worker/routes/userBooks'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const USERS: Record<string, string> = { 'Bearer token-a': A, 'Bearer token-b': B }

const pdfBytes = (extra = '') => new TextEncoder().encode(`%PDF-1.7\n1 0 obj << >> endobj\n${extra}\n%%EOF\n`)
const epubBytes = () => new Uint8Array(makeEpub({ title: 'Mine' }))

/** A fixed-window counter like the usage coordinator's, per key. */
function limiter() {
  const counts = new Map<string, number>()
  return async (key: string, _kv?: KVNamespace, max = 10) => {
    const n = (counts.get(key) ?? 0) + 1
    counts.set(key, n)
    return n <= max
  }
}

function setup(options: { pageSize?: number } = {}) {
  /** Premium or in trial per account (default true); false = free past trial, null = cannot be read. */
  const access = new Map<string, boolean | null>()
  const premiumAccess = async (id: string) => (access.has(id) ? access.get(id)! : true)
  const r2 = fakeUserBooksBucket(options)
  const checkRateLimit = limiter()
  const env = { USER_BOOKS: r2.bucket }
  const verifyUser = async (request: Request) => {
    const id = USERS[request.headers.get('authorization') ?? '']
    return id ? { id, email: `${id}@example.com` } : null
  }
  const call = (path: string, init: RequestInit & { token?: string } = {}) => {
    const headers = new Headers(init.headers)
    if (init.token) headers.set('Authorization', `Bearer ${init.token}`)
    return handleUserBooks(new Request(`https://tinct.app${path}`, { ...init, headers }), env, { verifyUser, checkRateLimit, premiumAccess })
  }
  const upload = (token: string, body: BodyInit, meta: Record<string, string> = {}) => call('/api/user-books', {
    method: 'POST', token, body,
    headers: Object.fromEntries(Object.entries(meta).map(([k, v]) => [`X-Book-${k}`, encodeURIComponent(v)])),
  })
  return { r2, env, call, upload, access }
}

describe('/api/user-books', () => {
  it('requires a signed-in user for every method, and the router sends the path here', async () => {
    const { call } = setup()
    for (const [path, method] of [['/api/user-books', 'GET'], ['/api/user-books', 'POST'], [`/api/user-books/${'a'.repeat(32)}`, 'GET'], [`/api/user-books/${'a'.repeat(32)}`, 'DELETE']]) {
      const res = await call(path, { method, body: method === 'POST' ? pdfBytes() : undefined })
      expect(res.status, `${method} ${path}`).toBe(401)
      expect(res.headers.get('Cache-Control')).toBe('no-store')
    }
    const wrongToken = await call('/api/user-books', { token: 'nope' })
    expect(wrongToken.status).toBe(401)

    // Through the Worker router: no Supabase config means no verified user.
    const routed = await worker.fetch(new Request('https://tinct.app/api/user-books', { headers: { Authorization: 'Bearer token-a' } }), { ASSETS: { fetch: async () => new Response('asset') } } as never, { waitUntil: () => undefined } as unknown as ExecutionContext)
    expect(routed.status).toBe(401)
  })

  it('round-trips upload, list, download and delete for the owner', async () => {
    const { r2, call, upload } = setup()
    const bytes = pdfBytes('round trip')
    const res = await upload('token-a', bytes, { Name: 'Lecture notes – week 1.pdf', Title: 'Lecture notes – week 1', Author: 'Åse Ørsted' })
    expect(res.status).toBe(201)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const { book } = await res.json() as { book: UserBook }
    expect(book).toMatchObject({ name: 'Lecture notes – week 1.pdf', title: 'Lecture notes – week 1', author: 'Åse Ørsted', type: 'pdf', size: bytes.byteLength })
    expect(book.id).toMatch(/^[0-9a-f]{32}$/)
    expect(book.sha256).toMatch(/^[0-9a-f]{64}$/)

    // Stored privately under the owner's prefix, with a random id and ASCII metadata.
    const [key] = [...r2.objects.keys()]
    expect(key).toBe(`u/${A}/${book.id}`)
    expect(key).not.toContain('Lecture')
    for (const value of Object.values(r2.objects.get(key)!.customMetadata)) expect(value).toMatch(/^[\x20-\x7e]*$/)

    const list = await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[]; limits: Record<string, number> }
    expect(list.books).toEqual([book])
    expect(list.limits).toEqual({ maxFileBytes: MAX_FILE_BYTES, maxAccountBytes: MAX_ACCOUNT_BYTES, maxAccountFiles: MAX_ACCOUNT_FILES })

    const file = await call(`/api/user-books/${book.id}`, { token: 'token-a' })
    expect(file.status).toBe(200)
    expect(file.headers.get('Content-Type')).toBe('application/pdf')
    expect(file.headers.get('Cache-Control')).toBe('no-store')
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(bytes)

    const del = await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })
    expect(del.status).toBe(200)
    expect(r2.objects.size).toBe(0)
    expect((await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[] }).books).toEqual([])
    expect((await call(`/api/user-books/${book.id}`, { token: 'token-a' })).status).toBe(404)
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(404)
  })

  it('keeps the rights confirmation (wording version and time) with the file, and drops a malformed one', async () => {
    const { r2, call } = setup()
    const post = (body: Uint8Array, headers: Record<string, string>) => call('/api/user-books', { method: 'POST', token: 'token-a', body, headers })
    expect((await post(pdfBytes('attested'), { 'X-Rights-Version': '2026-10-08', 'X-Rights-At': encodeURIComponent('2026-10-08T09:30:00.000Z') })).status).toBe(201)
    expect((await post(pdfBytes('bad version'), { 'X-Rights-Version': 'x y<z>', 'X-Rights-At': '2026-10-08T09:30:00.000Z' })).status).toBe(201)
    expect((await post(pdfBytes('none'), {})).status).toBe(201)
    const metas = [...r2.objects.values()].map(object => object.customMetadata)
    expect(metas.filter(meta => meta.rightsVersion === '2026-10-08' && meta.rightsAt === '2026-10-08T09:30:00.000Z')).toHaveLength(1)
    expect(metas.filter(meta => 'rightsVersion' in meta || 'rightsAt' in meta)).toHaveLength(1)
  })

  it('is Premium only to upload (trial counts); a free account past trial gets 402 and keeps the books it already added', async () => {
    const { r2, call, upload, access } = setup()
    // In trial or subscribed (the Worker's hasPremiumAccess): uploads.
    const res = await upload('token-a', pdfBytes('mine'))
    expect(res.status).toBe(201)
    const { book } = await res.json() as { book: UserBook }
    // The trial ends without a subscription: no new uploads, nothing stored.
    access.set(A, false)
    const refused = await upload('token-a', pdfBytes('another'))
    expect(refused.status).toBe(402)
    expect(await refused.json()).toEqual({ error: 'premium_required' })
    expect(r2.objects.size).toBe(1)
    // Never locked out of what is already there: list, open and delete still work.
    expect((await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[] }).books.map(b => b.id)).toEqual([book.id])
    expect((await call(`/api/user-books/${book.id}`, { token: 'token-a' })).status).toBe(200)
    // Unknown account state: 503, not an upload.
    access.set(B, null)
    expect((await upload('token-b', pdfBytes('b'))).status).toBe(503)
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
  })

  it('keeps each account to its own files: another account gets 404 and an empty list', async () => {
    const { r2, call, upload } = setup()
    const { book } = await (await upload('token-a', epubBytes(), { Name: 'mine.epub' })).json() as { book: UserBook }
    expect(book.type).toBe('epub')

    const listB = await (await call('/api/user-books', { token: 'token-b' })).json() as { books: UserBook[] }
    expect(listB.books).toEqual([])
    const getB = await call(`/api/user-books/${book.id}`, { token: 'token-b' })
    expect(getB.status).toBe(404) // never 403: existence is not confirmed
    expect(await getB.json()).toEqual({ error: 'Not found' })
    const delB = await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-b' })
    expect(delB.status).toBe(404)
    expect(r2.objects.has(`u/${A}/${book.id}`)).toBe(true)

    // The same bytes from B are B's own copy: never deduplicated across accounts.
    const fromB = await (await upload('token-b', epubBytes(), { Name: 'mine.epub' })).json() as { book: UserBook }
    expect(fromB.book.id).not.toBe(book.id)
    expect([...r2.objects.keys()].sort()).toEqual([`u/${A}/${book.id}`, `u/${B}/${fromB.book.id}`].sort())

    // Path tricks never leave the caller's prefix.
    for (const path of ['/api/user-books/..%2F' + A, `/api/user-books/${book.id}/x`, '/api/user-books/ABC', `/api/user-books/${A}`]) {
      expect((await call(path, { token: 'token-b' })).status, path).toBe(404)
    }
  })

  it('reads a body with a declared length into one buffer, and refuses one longer than declared', async () => {
    const { r2, call } = setup()
    const bytes = pdfBytes('declared')
    const ok = await call('/api/user-books', { method: 'POST', token: 'token-a', body: bytes, headers: { 'Content-Length': String(bytes.byteLength) } })
    expect(ok.status).toBe(201)
    expect(r2.objects.size).toBe(1)
    expect([...r2.objects.values()][0].bytes).toEqual(bytes)
    const longer = await call('/api/user-books', { method: 'POST', token: 'token-a', body: pdfBytes('longer than it says'), headers: { 'Content-Length': '8' } })
    expect(longer.status).toBe(413)
    expect(r2.objects.size).toBe(1)
  })

  it('stores one copy when the same account uploads the same file again', async () => {
    const { r2, upload } = setup()
    const first = await (await upload('token-a', pdfBytes('same'))).json() as { book: UserBook }
    const again = await upload('token-a', pdfBytes('same'))
    expect(again.status).toBe(200)
    expect(await again.json()).toEqual({ book: first.book, existing: true })
    expect(r2.objects.size).toBe(1)
  })

  it('accepts only PDF and EPUB by their bytes', async () => {
    const { r2, upload } = setup()
    const reject = async (body: Uint8Array, label: string) => {
      const res = await upload('token-a', body, { Name: 'book.pdf' })
      expect(res.status, label).toBe(415)
      expect(await res.json()).toEqual({ error: 'unsupported_type' })
    }
    await reject(new TextEncoder().encode('<html>not a pdf</html>'), 'html named .pdf')
    await reject(new Uint8Array(), 'empty')
    await reject(new Uint8Array(zip([['hello.txt', 'just a zip']])), 'plain zip')
    await reject(new Uint8Array(zip([['mimetype', 'application/zip'], ['a.txt', 'x']])), 'zip with another mimetype')
    // A PDF cut short (a broken download, a truncated copy) has no end-of-file marker.
    const whole = pdfBytes('cut short')
    await reject(whole.subarray(0, whole.length - 8), 'truncated pdf')
    await reject(new TextEncoder().encode('%PDF-1.4'), 'pdf header only')
    expect(r2.objects.size).toBe(0)

    expect(sniffBookType(pdfBytes())).toBe('pdf')
    expect(sniffBookType(epubBytes())).toBe('epub')
    // mimetype not first: found through the central directory.
    expect(sniffBookType(new Uint8Array(zip([['META-INF/container.xml', '<container/>'], ['mimetype', 'application/epub+zip']])))).toBe('epub')
  })

  it('refuses files over 50 MB with 413, whether declared or streamed', async () => {
    const { r2, call } = setup()
    const declared = await call('/api/user-books', { method: 'POST', token: 'token-a', body: pdfBytes(), headers: { 'Content-Length': String(MAX_FILE_BYTES + 1) } })
    expect(declared.status).toBe(413)
    const big = new Uint8Array(MAX_FILE_BYTES + 1)
    big.set(pdfBytes())
    const streamed = new ReadableStream<Uint8Array>({
      pull(controller) {
        for (let at = 0; at < big.length; at += 4 * 1024 * 1024) controller.enqueue(big.subarray(at, at + 4 * 1024 * 1024))
        controller.close()
      },
    })
    const res = await call('/api/user-books', { method: 'POST', token: 'token-a', body: streamed, duplex: 'half' } as RequestInit)
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ error: 'file_too_large', maxBytes: MAX_FILE_BYTES })
    expect(r2.objects.size).toBe(0)
  })

  it('enforces the per-account file count and byte totals', async () => {
    const { r2, upload } = setup()
    const meta = (size: number, n: number) => ({ key: `u/${A}/${n.toString(16).padStart(32, '0')}`, bytes: new Uint8Array(0), uploaded: new Date(), customMetadata: { type: 'pdf', sha256: n.toString(16).padStart(64, '0'), createdAt: '2026-10-01T00:00:00.000Z' }, size })
    // Count: MAX_ACCOUNT_FILES tiny files already stored.
    for (let n = 1; n <= MAX_ACCOUNT_FILES; n++) {
      const m = meta(1, n)
      r2.objects.set(m.key, { ...m, bytes: new Uint8Array(1) })
    }
    const full = await upload('token-b', pdfBytes())
    expect(full.status).toBe(201) // another account is unaffected
    const tooMany = await upload('token-a', pdfBytes('one more'))
    expect(tooMany.status).toBe(413)
    expect(await tooMany.json()).toMatchObject({ error: 'account_full', maxFiles: MAX_ACCOUNT_FILES })

    // Bytes: one stored file that leaves less room than the upload needs.
    r2.objects.clear()
    const nearlyFull = meta(0, 1)
    r2.objects.set(nearlyFull.key, { ...nearlyFull, bytes: { byteLength: MAX_ACCOUNT_BYTES - 10 } as Uint8Array })
    const over = await upload('token-a', pdfBytes('needs more than ten bytes'))
    expect(over.status).toBe(413)
    expect(await over.json()).toMatchObject({ error: 'account_full', maxBytes: MAX_ACCOUNT_BYTES })
    expect(r2.objects.size).toBe(1)
  })

  it('rate-limits uploads per account with 429', async () => {
    const { upload } = setup()
    for (let i = 0; i < UPLOADS_PER_MINUTE; i++) expect((await upload('token-a', pdfBytes(`file ${i}`))).status).toBe(201)
    const limited = await upload('token-a', pdfBytes('one too many'))
    expect(limited.status).toBe(429)
    expect(await limited.json()).toEqual({ error: 'rate_limited' })
    expect((await upload('token-b', pdfBytes('b is separate'))).status).toBe(201)
  })

  it('answers 405 for other methods and 503 without the bucket binding', async () => {
    const { call } = setup()
    expect((await call('/api/user-books', { method: 'DELETE', token: 'token-a' })).status).toBe(405)
    expect((await call(`/api/user-books/${'a'.repeat(32)}`, { method: 'POST', token: 'token-a' })).status).toBe(405)
    const res = await handleUserBooks(new Request('https://tinct.app/api/user-books', { headers: { Authorization: 'Bearer token-a' } }), {}, { verifyUser: async () => ({ id: A }), checkRateLimit: async () => true, premiumAccess: async () => true })
    expect(res.status).toBe(503)
  })

  it('keeps metadata ASCII and within R2 limits, cut at whole characters', () => {
    expect(encodeMeta('Ærø – “quotes”', 600)).toBe(encodeURIComponent('Ærø – “quotes”'))
    const long = encodeMeta('😀'.repeat(500), 600)
    expect(long.length).toBeLessThanOrEqual(600)
    expect(decodeURIComponent(long)).toBe('😀'.repeat(long.length / 12))
    expect(encodeMeta('a\u0000b\nc', 50)).toBe('a%20b%20c')
  })
})

describe('/api/user-books/places', () => {
  const put = (call: ReturnType<typeof setup>['call'], token: string, hex: string, body: unknown) =>
    call(`/api/user-books/places/${hex}`, { method: 'PUT', token, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
  const place = (chapterNumber: number, updatedAt = 1_000) => ({ chapterNumber, paragraphIndex: 4, wordIndex: 2, updatedAt, percent: 13.27 })

  async function withBook() {
    const env = setup()
    const { book } = await (await env.upload('token-a', epubBytes(), { Title: 'Private title' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }

  it('keeps one versioned place per owned book, in the owner\'s prefix, without the title', async () => {
    const { r2, call, hex } = await withBook()
    const first = await put(call, 'token-a', hex, { place: place(3), rev: 0 })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ place: { ...place(3), percent: 13.3, rev: 1 } })
    const second = await put(call, 'token-a', hex, { place: place(4, 2_000), rev: 1 })
    expect((await second.json() as { place: { rev: number } }).place.rev).toBe(2)
    const listed = await (await call('/api/user-books/places', { token: 'token-a' })).json()
    expect(listed).toEqual({ places: { [hex]: { ...place(4, 2_000), percent: 13.3, rev: 2 } } })
    const key = `u/${A}/places/${hex}`
    expect(r2.objects.get(key)?.bytes.byteLength).toBe(0)
    expect(JSON.stringify(r2.objects.get(key)?.customMetadata)).not.toContain('Private')
    // The book list is unchanged by places beside it.
    const books = await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[] }
    expect(books.books).toHaveLength(1)
  })

  it('keeps the conversion rules a place was read under, and drops a malformed one', async () => {
    const { call, hex } = await withBook()
    await put(call, 'token-a', hex, { place: { ...place(3), converter: 6 }, rev: 0 })
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: { [hex]: { ...place(3), percent: 13.3, converter: 6, rev: 1 } } })
    await put(call, 'token-a', hex, { place: { ...place(4, 2_000), converter: 'six' }, rev: 1 })
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: { [hex]: { ...place(4, 2_000), percent: 13.3, rev: 2 } } })
  })

  it('refuses a stale revision with the stored place, and a lost conditional put the same way', async () => {
    const { r2, call, hex } = await withBook()
    await put(call, 'token-a', hex, { place: place(3), rev: 0 })
    const stale = await put(call, 'token-a', hex, { place: place(1, 5_000), rev: 0 })
    expect(stale.status).toBe(409)
    expect(await stale.json()).toEqual({ error: 'conflict', place: { ...place(3), percent: 13.3, rev: 1 } })
    // Another write landing between the read and the put: the etag no longer matches.
    const original = r2.bucket.head.bind(r2.bucket)
    let raced = false
    ;(r2.bucket as unknown as { head: typeof original }).head = async key => {
      const head = await original(key)
      if (!raced && key.includes('/places/')) { raced = true; await r2.bucket.put(key, '', { customMetadata: { ...head!.customMetadata, chapterNumber: '9', rev: '2' } }) }
      return head
    }
    const lost = await put(call, 'token-a', hex, { place: place(5, 6_000), rev: 1 })
    expect(lost.status).toBe(409)
    expect((await lost.json() as { place: { chapterNumber: number; rev: number } }).place).toMatchObject({ chapterNumber: 9, rev: 2 })
  })

  it('has no place for a book the account does not own, another account\'s, or a malformed one', async () => {
    const { call, hex } = await withBook()
    expect((await put(call, 'token-b', hex, { place: place(3), rev: 0 })).status).toBe(404)
    expect((await put(call, 'token-a', 'f'.repeat(24), { place: place(3), rev: 0 })).status).toBe(404)
    expect((await put(call, 'token-a', 'nothex', { place: place(3), rev: 0 })).status).toBe(404)
    expect((await put(call, 'token-a', hex, { place: { ...place(3), chapterNumber: 0 }, rev: 0 })).status).toBe(400)
    expect((await put(call, 'token-a', hex, { place: place(3) })).status).toBe(400)
    expect((await call(`/api/user-books/places/${hex}`, { method: 'PUT', token: 'token-a', body: 'nope' })).status).toBe(400)
    expect((await call(`/api/user-books/places/${hex}`, { method: 'PUT', body: '{}' })).status).toBe(401)
    expect((await call('/api/user-books/places', { method: 'POST', token: 'token-a' })).status).toBe(405)
    expect(await (await call('/api/user-books/places', { token: 'token-b' })).json()).toEqual({ places: {} })
  })

  it('deletes the place with the book', async () => {
    const { r2, call, book, hex } = await withBook()
    await put(call, 'token-a', hex, { place: place(3), rev: 0 })
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/places/${hex}`)).toBe(false)
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: {} })
  })

  // A PDF's place (Add a book's viewer): the page and how far down it, in the same per-book object.
  async function withPdf() {
    const env = setup()
    const { book } = await (await env.upload('token-a', pdfBytes(), { Title: 'Private PDF' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }
  const page = (n: number, updatedAt = 1_000) => ({ page: n, frac: 0.25, updatedAt, percent: 29.37 })

  it('round-trips a PDF\'s page place, versioned like an EPUB\'s, in the owner\'s prefix without the title', async () => {
    const { r2, call, hex } = await withPdf()
    const first = await put(call, 'token-a', hex, { place: page(12), rev: 0 })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ place: { ...page(12), percent: 29.4, rev: 1 } })
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: { [hex]: { ...page(12), percent: 29.4, rev: 1 } } })
    const key = `u/${A}/places/${hex}`
    expect(r2.objects.get(key)?.bytes.byteLength).toBe(0)
    expect(JSON.stringify(r2.objects.get(key)?.customMetadata)).not.toContain('Private')
    // The newer place, read on another device, names the revision it saw.
    const second = await put(call, 'token-a', hex, { place: { page: 20, updatedAt: 2_000 }, rev: 1 })
    expect(await second.json()).toEqual({ place: { page: 20, updatedAt: 2_000, rev: 2 } })
    // A device still on revision 1 is refused with the stored place.
    const stale = await put(call, 'token-a', hex, { place: page(12, 1_500), rev: 1 })
    expect(stale.status).toBe(409)
    expect(await stale.json()).toEqual({ error: 'conflict', place: { page: 20, updatedAt: 2_000, rev: 2 } })
  })

  it('refuses a page place out of shape, or on an EPUB', async () => {
    const { call, hex } = await withPdf()
    expect((await put(call, 'token-a', hex, { place: { ...page(12), page: 0 }, rev: 0 })).status).toBe(400)
    expect((await put(call, 'token-a', hex, { place: { ...page(12), page: 1.5 }, rev: 0 })).status).toBe(400)
    expect((await put(call, 'token-a', hex, { place: { ...page(12), frac: 2 }, rev: 0 })).status).toBe(400)
    expect((await put(call, 'token-a', hex, { place: { ...page(12), updatedAt: 0 }, rev: 0 })).status).toBe(400)
    const epub = await withBook()
    expect((await put(epub.call, 'token-a', epub.hex, { place: page(12), rev: 0 })).status).toBe(400)
    expect((await put(call, 'token-b', hex, { place: page(12), rev: 0 })).status).toBe(404)
  })

  it('keeps both coordinates of a PDF read in either edition: the page and the same spot in its Tinct text', async () => {
    const { call, hex } = await withPdf()
    const both = { ...page(12), chapterNumber: 3, paragraphIndex: 14, wordIndex: 7, converter: 1, edition: 't' }
    const saved = await put(call, 'token-a', hex, { place: both, rev: 0 })
    expect(saved.status).toBe(200)
    expect(await saved.json()).toEqual({ place: { ...both, percent: 29.4, rev: 1 } })
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: { [hex]: { ...both, percent: 29.4, rev: 1 } } })
    // Read on in Original pages: the page alone and the edition, the old spot in the text gone.
    const pages = await put(call, 'token-a', hex, { place: { page: 13, updatedAt: 2_000, edition: 'p' }, rev: 1 })
    expect(await pages.json()).toEqual({ place: { page: 13, updatedAt: 2_000, edition: 'p', rev: 2 } })
    expect(await (await call('/api/user-books/places', { token: 'token-a' })).json()).toEqual({ places: { [hex]: { page: 13, updatedAt: 2_000, edition: 'p', rev: 2 } } })
  })

  it('refuses a PDF place whose spot in the text is out of shape or partial, or names another edition', async () => {
    const { call, hex } = await withPdf()
    for (const bad of [
      { ...page(12), chapterNumber: 0, paragraphIndex: 1, wordIndex: 1 },
      { ...page(12), chapterNumber: 2, paragraphIndex: 1.5, wordIndex: 1 },
      { ...page(12), chapterNumber: 2, paragraphIndex: 1 },
      { ...page(12), edition: 'x' },
    ]) expect((await put(call, 'token-a', hex, { place: bad, rev: 0 })).status).toBe(400)
  })

  it('deletes a PDF\'s page place with the book', async () => {
    const { r2, call, book, hex } = await withPdf()
    await put(call, 'token-a', hex, { place: page(12), rev: 0 })
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/places/${hex}`)).toBe(false)
  })
})

describe('/api/user-books/covers', () => {
  // A JPEG and a WebP by their first bytes (the Worker sniffs; it never decodes).
  const jpeg = (size = 2000) => { const b = new Uint8Array(size); b.set([0xff, 0xd8, 0xff, 0xe0]); return b }
  const webp = (size = 2000) => { const b = new Uint8Array(size); b.set(new TextEncoder().encode('RIFF')); b.set(new TextEncoder().encode('WEBPVP8 '), 8); return b }
  const putCover = (call: ReturnType<typeof setup>['call'], token: string | undefined, hex: string, body: BodyInit) =>
    call(`/api/user-books/covers/${hex}`, { method: 'PUT', token, body, headers: { 'Content-Type': 'image/jpeg' } })

  async function withBook() {
    const env = setup()
    const { book } = await (await env.upload('token-a', epubBytes(), { Title: 'Private title' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }

  it('stores an owned book\'s cover in the owner\'s prefix, lists it with the book and serves it to the owner with private caching', async () => {
    const { r2, call, book, hex } = await withBook()
    expect(book.cover).toBeNull()
    const res = await putCover(call, 'token-a', hex, jpeg())
    expect(res.status).toBe(200)
    const { cover } = await res.json() as { cover: string }
    expect(cover).toMatch(new RegExp(`^/api/user-books/covers/${hex}\\?v=[0-9a-z]+$`))
    expect(r2.objects.has(`u/${A}/covers/${hex}`)).toBe(true)
    expect(r2.objects.get(`u/${A}/covers/${hex}`)!.httpMetadata?.contentType).toBe('image/jpeg')
    // The list names it; the cover is not a book and is not counted as one.
    const list = await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[] }
    expect(list.books).toHaveLength(1)
    expect(list.books[0].cover).toBe(cover)
    const image = await call(cover, { token: 'token-a' })
    expect(image.status).toBe(200)
    expect(image.headers.get('Content-Type')).toBe('image/jpeg')
    expect(image.headers.get('Cache-Control')).toBe('private, max-age=86400')
    expect(image.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(jpeg())
    // A WebP replaces it, served as WebP.
    expect((await putCover(call, 'token-a', hex, webp())).status).toBe(200)
    expect((await call(`/api/user-books/covers/${hex}`, { token: 'token-a' })).headers.get('Content-Type')).toBe('image/webp')
  })

  it('needs a signed-in owner: signed out is 401, another account and a book not kept are 404', async () => {
    const { r2, call, hex } = await withBook()
    expect((await putCover(call, undefined, hex, jpeg())).status).toBe(401)
    expect((await call(`/api/user-books/covers/${hex}`)).status).toBe(401)
    // Account B does not own the book: it can neither store nor read A's cover.
    expect((await putCover(call, 'token-b', hex, jpeg())).status).toBe(404)
    expect((await putCover(call, 'token-a', hex, jpeg())).status).toBe(200)
    const other = await call(`/api/user-books/covers/${hex}`, { token: 'token-b' })
    expect(other.status).toBe(404)
    expect(other.headers.get('Cache-Control')).toBe('no-store')
    expect(r2.objects.has(`u/${B}/covers/${hex}`)).toBe(false)
    // A book this account does not keep, or a malformed hex, has no cover.
    expect((await putCover(call, 'token-a', 'f'.repeat(24), jpeg())).status).toBe(404)
    expect((await putCover(call, 'token-a', 'nope', jpeg())).status).toBe(404)
    expect((await call('/api/user-books/covers/', { token: 'token-a' })).status).toBe(404)
    expect((await call(`/api/user-books/covers/${hex}`, { method: 'DELETE', token: 'token-a' })).status).toBe(405)
  })

  it('caps the size (declared or streamed), takes only JPEG or WebP, and rate-limits writes', async () => {
    const { call, hex } = await withBook()
    expect((await putCover(call, 'token-a', hex, jpeg(MAX_COVER_BYTES))).status).toBe(200)
    expect((await putCover(call, 'token-a', hex, jpeg(MAX_COVER_BYTES + 1))).status).toBe(413)
    const streamed = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(jpeg(40_000)); c.enqueue(new Uint8Array(40_000)); c.close() } })
    const res = await call(`/api/user-books/covers/${hex}`, { method: 'PUT', token: 'token-a', body: streamed, duplex: 'half' } as RequestInit)
    expect(res.status).toBe(413)
    expect((await putCover(call, 'token-a', hex, new TextEncoder().encode('<svg onload=alert(1)>'))).status).toBe(415)
    expect((await putCover(call, 'token-a', hex, pdfBytes())).status).toBe(415)
    let last = 200
    for (let i = 0; i < COVER_WRITES_PER_MINUTE + 1; i++) last = (await putCover(call, 'token-a', hex, jpeg())).status
    expect(last).toBe(429)
  })

  it('deletes the cover with the book, and only that book\'s', async () => {
    const { r2, call, upload, book, hex } = await withBook()
    const { book: other } = await (await upload('token-a', pdfBytes('other'), { Title: 'Other' })).json() as { book: UserBook }
    const otherHex = other.sha256.slice(0, 24)
    await putCover(call, 'token-a', hex, jpeg())
    await putCover(call, 'token-a', otherHex, jpeg())
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/covers/${hex}`)).toBe(false)
    expect(r2.objects.has(`u/${A}/covers/${otherHex}`)).toBe(true)
    expect((await call(`/api/user-books/covers/${hex}`, { token: 'token-a' })).status).toBe(404)
  })
})

describe('/api/user-books/primers', () => {
  const primer = {
    gist: 'The chapter sets up rate laws. Everything after uses them.',
    claims: [{ text: 'Rates depend on concentration.', cite: '{p. 12}' }, { text: 'Order is measured.', cite: '{p. 13}' }, { text: 'Half-life is constant.', cite: '{eq. 1.2}' }],
    keepInMind: ['Units of k change with order.'],
    map: [{ title: '1.1 Rates', pages: 'pp. 9–10' }, { title: '1.2 Order', pages: 'pp. 11–14' }, { title: '1.3 Half-life', pages: 'p. 15' }],
  }
  const path = (hex: string, unit = 'outline-0') => `/api/user-books/primers/${hex}?unit=${encodeURIComponent(unit)}`
  const putPrimer = (call: ReturnType<typeof setup>['call'], token: string | undefined, hex: string, body: unknown, unit?: string) =>
    call(path(hex, unit), { method: 'PUT', token, body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })

  async function withPdf() {
    const env = setup()
    const { book } = await (await env.upload('token-a', pdfBytes('primer'), { Title: 'Kinetics' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }

  it('stores a primer per unit of an owned PDF, stamps when and which unit, and serves it back to the owner', async () => {
    const { r2, call, hex } = await withPdf()
    expect((await call(path(hex), { token: 'token-a' })).status).toBe(404)
    const before = Date.now()
    const res = await putPrimer(call, 'token-a', hex, { primer: { ...primer, madeAt: '1999-01-01T00:00:00Z', unitKey: 'forged', extra: 'dropped' } })
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const { primer: stored } = await res.json() as { primer: Record<string, unknown> }
    expect(stored).toEqual({ ...primer, madeAt: stored.madeAt, unitKey: 'outline-0' })
    expect(Date.parse(String(stored.madeAt))).toBeGreaterThanOrEqual(before - 1000)
    const key = `u/${A}/primers/${hex}/outline-0`
    expect(r2.objects.has(key)).toBe(true)
    expect(r2.objects.get(key)!.httpMetadata?.contentType).toBe('application/json')
    expect(new TextDecoder().decode(r2.objects.get(key)!.bytes)).not.toContain('Kinetics')
    const got = await call(path(hex), { token: 'token-a' })
    expect(got.status).toBe(200)
    expect(await got.json()).toEqual({ primer: stored })
    // Each unit is its own; the whole file is "all". A primer is not a book.
    expect((await call(path(hex, 'all'), { token: 'token-a' })).status).toBe(404)
    expect((await putPrimer(call, 'token-a', hex, { primer }, 'all')).status).toBe(200)
    const list = await (await call('/api/user-books', { token: 'token-a' })).json() as { books: UserBook[] }
    expect(list.books).toHaveLength(1)
  })

  it('Redo replaces the stored primer for that unit', async () => {
    const { call, hex } = await withPdf()
    await putPrimer(call, 'token-a', hex, { primer })
    const redo = { ...primer, gist: 'A different gist.' }
    expect((await putPrimer(call, 'token-a', hex, { primer: redo })).status).toBe(200)
    const { primer: got } = await (await call(path(hex), { token: 'token-a' })).json() as { primer: { gist: string } }
    expect(got.gist).toBe('A different gist.')
  })

  it('is owner-only: signed out is 401, another account and a book not kept are 404, an EPUB has none', async () => {
    const { r2, call, upload, hex } = await withPdf()
    expect((await putPrimer(call, undefined, hex, { primer })).status).toBe(401)
    expect((await call(path(hex))).status).toBe(401)
    expect((await putPrimer(call, 'token-b', hex, { primer })).status).toBe(404)
    expect((await putPrimer(call, 'token-a', hex, { primer })).status).toBe(200)
    const other = await call(path(hex), { token: 'token-b' })
    expect(other.status).toBe(404)
    expect(other.headers.get('Cache-Control')).toBe('no-store')
    expect([...r2.objects.keys()].some(key => key.startsWith(`u/${B}/`))).toBe(false)
    expect((await putPrimer(call, 'token-a', 'f'.repeat(24), { primer })).status).toBe(404)
    expect((await putPrimer(call, 'token-a', 'nope', { primer })).status).toBe(404)
    const { book: epub } = await (await upload('token-a', epubBytes(), { Title: 'Novel' })).json() as { book: UserBook }
    const epubPut = await putPrimer(call, 'token-a', epub.sha256.slice(0, 24), { primer })
    expect(epubPut.status).toBe(400)
    expect(await epubPut.json()).toEqual({ error: 'pdf_only' })
    expect((await call(path(hex), { method: 'DELETE', token: 'token-a' })).status).toBe(405)
  })

  it('needs a valid unit key and a primer in shape', async () => {
    const { r2, call, hex } = await withPdf()
    for (const unit of ['', '../x', 'a/b', 'a'.repeat(65)]) {
      const res = await putPrimer(call, 'token-a', hex, { primer }, unit)
      expect(res.status, unit).toBe(400)
      expect(await res.json()).toEqual({ error: 'bad_unit' })
    }
    expect((await call(`/api/user-books/primers/${hex}`, { token: 'token-a' })).status).toBe(400)
    for (const body of ['not json', [], {}, { primer: null }, { primer: { ...primer, claims: primer.claims.slice(0, 2) } }, { primer: { ...primer, keepInMind: [] } }, { primer: { ...primer, map: primer.map.slice(0, 2) } }, { primer: { ...primer, gist: '' } }]) {
      const res = await putPrimer(call, 'token-a', hex, body)
      expect(res.status, JSON.stringify(body)).toBe(400)
      expect(await res.json()).toEqual({ error: 'invalid_primer' })
    }
    // Too many items are trimmed to the counts, not refused.
    const trimmed = await putPrimer(call, 'token-a', hex, { primer: { ...primer, claims: [...primer.claims, ...primer.claims, ...primer.claims], map: Array(12).fill(primer.map[0]) } })
    const { primer: kept } = await trimmed.json() as { primer: { claims: unknown[]; map: unknown[] } }
    expect(kept.claims).toHaveLength(5)
    expect(kept.map).toHaveLength(8)
    // A stored object out of shape is not served.
    r2.objects.get(`u/${A}/primers/${hex}/outline-0`)!.bytes = new TextEncoder().encode('{"gist":1}')
    expect((await call(path(hex), { token: 'token-a' })).status).toBe(404)
  })

  it('caps the body (declared or streamed), rate-limits writes and the number of units per book', async () => {
    const { r2, call, hex } = await withPdf()
    const big = JSON.stringify({ primer, pad: 'x'.repeat(MAX_PRIMER_BYTES) })
    const declared = await putPrimer(call, 'token-a', hex, big)
    expect(declared.status).toBe(413)
    expect(await declared.json()).toEqual({ error: 'primer_too_large', maxBytes: 32 * 1024 })
    const bytes = new TextEncoder().encode(big)
    const streamed = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(bytes.subarray(0, 20_000)); c.enqueue(bytes.subarray(20_000)); c.close() } })
    expect((await call(path(hex), { method: 'PUT', token: 'token-a', body: streamed, duplex: 'half' } as RequestInit)).status).toBe(413)

    // Units per book: a new unit past the cap is refused; an existing one can still be redone.
    for (let i = 0; i < MAX_PRIMERS_PER_BOOK; i++) r2.objects.set(`u/${A}/primers/${hex}/u${i}`, { key: `u/${A}/primers/${hex}/u${i}`, bytes: new Uint8Array(2), uploaded: new Date(), customMetadata: {} })
    const full = await putPrimer(call, 'token-a', hex, { primer }, 'one-more')
    expect(full.status).toBe(409)
    expect(await full.json()).toEqual({ error: 'too_many_primers', max: MAX_PRIMERS_PER_BOOK })
    expect((await putPrimer(call, 'token-a', hex, { primer }, 'u0')).status).toBe(200)

    let last = 200
    for (let i = 0; i < PRIMER_WRITES_PER_MINUTE + 1; i++) last = (await putPrimer(call, 'token-a', hex, { primer }, 'u1')).status
    expect(last).toBe(429)
  })

  it('deletes every primer with the book, and only that book\'s', async () => {
    const { r2, call, upload, book, hex } = await withPdf()
    const { book: other } = await (await upload('token-a', pdfBytes('other'), { Title: 'Other' })).json() as { book: UserBook }
    const otherHex = other.sha256.slice(0, 24)
    await putPrimer(call, 'token-a', hex, { primer }, 'outline-0')
    await putPrimer(call, 'token-a', hex, { primer }, 'outline-1')
    await putPrimer(call, 'token-a', otherHex, { primer }, 'all')
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect([...r2.objects.keys()].filter(key => key.startsWith(`u/${A}/primers/${hex}/`))).toEqual([])
    expect(r2.objects.has(`u/${A}/primers/${otherHex}/all`)).toBe(true)
    expect((await call(path(hex), { token: 'token-a' })).status).toBe(404)
  })
})

// A PDF's highlights and notes (Add a book's PDF reader, margin PR 1a): one versioned set per owned PDF.
describe('/api/user-books/marks', () => {
  const put = (call: ReturnType<typeof setup>['call'], token: string, hex: string, body: unknown) =>
    call(`/api/user-books/marks/${hex}`, { method: 'PUT', token, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
  const mark = (id: string, extra: Record<string, unknown> = {}) => ({ id, page: 3, rects: [[0.1, 0.2, 0.5, 0.02]], text: 'the passage', color: 'gold', at: 1_000, u: 1_000, ...extra })
  async function withPdf() {
    const env = setup()
    const { book } = await (await env.upload('token-a', pdfBytes('marks'), { Title: 'Private title' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }

  it('keeps one versioned set per owned PDF in the owner\'s prefix; a stale write gets 409 and the stored set', async () => {
    const { r2, call, hex } = await withPdf()
    expect(await (await call(`/api/user-books/marks/${hex}`, { token: 'token-a' })).json()).toEqual({ marks: [], rev: 0 })
    const first = await put(call, 'token-a', hex, { marks: [mark('abcd1', { note: 'Try it with x = 10.' })], rev: 0 })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ rev: 1 })
    // Another device, still at revision 0: refused with what is stored, to merge.
    const stale = await put(call, 'token-a', hex, { marks: [mark('efgh2')], rev: 0 })
    expect(stale.status).toBe(409)
    expect(await stale.json()).toEqual({ error: 'conflict', marks: [mark('abcd1', { note: 'Try it with x = 10.' })], rev: 1 })
    const merged = await put(call, 'token-a', hex, { marks: [mark('abcd1', { note: 'Try it with x = 10.' }), mark('efgh2'), { id: 'gone3', gone: true, u: 2_000 }], rev: 1 })
    expect(await merged.json()).toEqual({ rev: 2 })
    expect(await (await call(`/api/user-books/marks/${hex}`, { token: 'token-a' })).json()).toEqual({ marks: [mark('abcd1', { note: 'Try it with x = 10.' }), mark('efgh2'), { id: 'gone3', gone: true, u: 2_000 }], rev: 2 })
    const stored = r2.objects.get(`u/${A}/marks/${hex}`)!
    expect(stored.customMetadata.rev).toBe('2')
    expect(new TextDecoder().decode(stored.bytes)).not.toContain('Private title')
    // Another account sees nothing of it, and cannot write it.
    expect((await call(`/api/user-books/marks/${hex}`, { token: 'token-b' })).status).toBe(404)
    expect((await put(call, 'token-b', hex, { marks: [], rev: 0 })).status).toBe(404)
    expect((await call(`/api/user-books/marks/${hex}`)).status).toBe(401)
  })

  it('refuses marks out of shape, an EPUB, and an unknown book', async () => {
    const { call, upload, hex } = await withPdf()
    for (const bad of [
      [mark('ab')], [mark('abcd1'), mark('abcd1')], [mark('abcd1', { color: 'teal' })], [mark('abcd1', { rects: [[0, 0, 1]] })],
      [mark('abcd1', { note: 'x'.repeat(4001) })], [mark('abcd1', { page: 0 })], [{ id: 'abcd1', gone: true }], 'nope',
    ]) expect((await put(call, 'token-a', hex, { marks: bad, rev: 0 })).status, JSON.stringify(bad).slice(0, 60)).toBe(400)
    expect((await put(call, 'token-a', hex, { marks: [mark('abcd1')] })).status).toBe(400)
    expect((await call(`/api/user-books/marks/${hex}`, { method: 'PUT', token: 'token-a', body: '{' })).status).toBe(400)
    expect((await call(`/api/user-books/marks/${hex}`, { method: 'POST', token: 'token-a' })).status).toBe(405)
    expect((await call(`/api/user-books/marks/${'0'.repeat(24)}`, { token: 'token-a' })).status).toBe(404)
    expect((await call('/api/user-books/marks/not-hex', { token: 'token-a' })).status).toBe(404)
    const { book } = await (await upload('token-a', epubBytes(), { Title: 'An EPUB' })).json() as { book: UserBook }
    expect((await call(`/api/user-books/marks/${book.sha256.slice(0, 24)}`, { token: 'token-a' })).status).toBe(404)
  })

  it('deletes the marks with the book', async () => {
    const { r2, call, book, hex } = await withPdf()
    await put(call, 'token-a', hex, { marks: [mark('abcd1')], rev: 0 })
    expect(r2.objects.has(`u/${A}/marks/${hex}`)).toBe(true)
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/marks/${hex}`)).toBe(false)
  })
})

// The margin's cards in a PDF (Add a book's PDF reader, margin PR 2): a sibling set of the marks, the same versioning.
describe('/api/user-books/cards', () => {
  const put = (call: ReturnType<typeof setup>['call'], token: string, hex: string, body: unknown) =>
    call(`/api/user-books/cards/${hex}`, { method: 'PUT', token, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
  const card = (id: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'explain', page: 3, rects: [[3, 0.1, 0.2, 0.5, 0.02]], text: 'the passage', turns: [{ role: 'assistant', content: 'The bottom line. Then more.', at: 1_000 }], at: 1_000, u: 1_000, ...extra })
  async function withPdf() {
    const env = setup()
    const { book } = await (await env.upload('token-a', pdfBytes('cards'), { Title: 'Private title' })).json() as { book: UserBook }
    return { ...env, book, hex: book.sha256.slice(0, 24) }
  }

  it('keeps one versioned set of cards per owned PDF; a stale write gets 409 and the stored set', async () => {
    const { r2, call, hex } = await withPdf()
    expect(await (await call(`/api/user-books/cards/${hex}`, { token: 'token-a' })).json()).toEqual({ cards: [], rev: 0 })
    const quiz = card('quiz2', { kind: 'quiz', turns: [], data: { questions: [{ q: 'Why?', answer: 'Because.', why: '', cite: '{p. 3}' }], i: 0, results: [{ answer: 'Because', verdict: 'right', feedback: 'Yes.' }] } })
    expect((await put(call, 'token-a', hex, { cards: [card('abcd1'), quiz], rev: 0 })).status).toBe(200)
    const stale = await put(call, 'token-a', hex, { cards: [card('efgh3', { kind: 'ask', turns: [{ role: 'user', content: 'Why?' }] })], rev: 0 })
    expect(stale.status).toBe(409)
    expect(await stale.json()).toEqual({ error: 'conflict', cards: [card('abcd1'), quiz], rev: 1 })
    expect(await (await put(call, 'token-a', hex, { cards: [card('abcd1'), quiz, { id: 'gone4', gone: true, u: 2_000 }], rev: 1 })).json()).toEqual({ rev: 2 })
    expect(await (await call(`/api/user-books/cards/${hex}`, { token: 'token-a' })).json()).toEqual({ cards: [card('abcd1'), quiz, { id: 'gone4', gone: true, u: 2_000 }], rev: 2 })
    expect(r2.objects.get(`u/${A}/cards/${hex}`)!.customMetadata.rev).toBe('2')
    // The marks are a separate set.
    expect(await (await call(`/api/user-books/marks/${hex}`, { token: 'token-a' })).json()).toEqual({ marks: [], rev: 0 })
    expect((await call(`/api/user-books/cards/${hex}`, { token: 'token-b' })).status).toBe(404)
    expect((await call(`/api/user-books/cards/${hex}`)).status).toBe(401)
  })

  it('refuses cards out of shape', async () => {
    const { call, hex } = await withPdf()
    for (const bad of [
      [card('ab')], [card('abcd1'), card('abcd1')], [card('abcd1', { kind: 'chat' })], [card('abcd1', { rects: [[0.1, 0.2, 0.5, 0.02]] })],
      [card('abcd1', { rects: [] })], [card('abcd1', { page: 0 })], [card('abcd1', { text: 'x'.repeat(2001) })],
      [card('abcd1', { turns: [{ role: 'system', content: 'x' }] })], [card('abcd1', { turns: [{ role: 'user', content: 'x'.repeat(12_001) }] })],
      [card('abcd1', { data: 'x' })], [card('abcd1', { data: { big: 'x'.repeat(16_001) } })], [{ id: 'abcd1', gone: true }], 'nope',
    ]) expect((await put(call, 'token-a', hex, { cards: bad, rev: 0 })).status, JSON.stringify(bad).slice(0, 60)).toBe(400)
    expect((await put(call, 'token-a', hex, { marks: [card('abcd1')], rev: 0 })).status).toBe(400)
  })

  it('deletes the cards with the book', async () => {
    const { r2, call, book, hex } = await withPdf()
    await put(call, 'token-a', hex, { cards: [card('abcd1')], rev: 0 })
    expect(r2.objects.has(`u/${A}/cards/${hex}`)).toBe(true)
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/cards/${hex}`)).toBe(false)
  })
})
