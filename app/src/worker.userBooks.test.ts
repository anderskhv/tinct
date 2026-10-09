import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { makeEpub, zip } from '../../addbooks/web/test/make-epub.mjs'
import worker from './worker'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import {
  MAX_ACCOUNT_BYTES,
  MAX_ACCOUNT_FILES,
  MAX_FILE_BYTES,
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

  it('deletes a PDF\'s page place with the book', async () => {
    const { r2, call, book, hex } = await withPdf()
    await put(call, 'token-a', hex, { place: page(12), rev: 0 })
    expect((await call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect(r2.objects.has(`u/${A}/places/${hex}`)).toBe(false)
  })
})
