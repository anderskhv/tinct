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
    return handleUserBooks(new Request(`https://tinct.app${path}`, { ...init, headers }), env, { verifyUser, checkRateLimit })
  }
  const upload = (token: string, body: BodyInit, meta: Record<string, string> = {}) => call('/api/user-books', {
    method: 'POST', token, body,
    headers: Object.fromEntries(Object.entries(meta).map(([k, v]) => [`X-Book-${k}`, encodeURIComponent(v)])),
  })
  return { r2, env, call, upload }
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
    const res = await handleUserBooks(new Request('https://tinct.app/api/user-books', { headers: { Authorization: 'Bearer token-a' } }), {}, { verifyUser: async () => ({ id: A }), checkRateLimit: async () => true })
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
