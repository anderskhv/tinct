/**
 * /api/user-books/ocr/* (routes/userBooks.ts): recognising the text of a
 * scanned own PDF, shipped dark behind OWN_PDF_OCR. Owner only, Premium to
 * start, JPEG pages only, rate limited, everything under the owner's private
 * prefix, nothing logged. The job runs in a real OwnOcrCoordinator over
 * in-memory SQLite with a fake recognizer: the provider is never called.
 */
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { NarrationCoordinator } from './worker/narrationCoordinator'
import { OwnOcrCoordinator, type OcrDeps } from './worker/ownOcrCoordinator'
import { durableNamespace } from './worker/fakeDurableStorage'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import { handleUserBooks, looksLikeJpeg, type UserBook, type UserBooksEnv } from './worker/routes/userBooks'
import { OCR_MAX_IMAGE_BYTES, OCR_UPLOADS_PER_MINUTE, ocrCoordinatorName, ocrEditionKey, ocrImageKey, ocrJobKey, type OwnOcrEnv } from './worker/lib/ownOcr'
import type { PremiumTier } from './worker/lib/aiAllowance'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const USERS: Record<string, string> = { 'Bearer token-a': A, 'Bearer token-b': B }
const pdfBytes = (extra = '') => new TextEncoder().encode(`%PDF-1.7\n1 0 obj << >> endobj\n${extra}\n%%EOF\n`)
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0xff, 0xd9])
const SECRET_TEXT = 'The secret text of the scanned page'

function limiter() {
  const counts = new Map<string, number>()
  return async (key: string, _kv?: KVNamespace, max = 10) => {
    const n = (counts.get(key) ?? 0) + 1
    counts.set(key, n)
    return n <= max
  }
}

function setup(options: { vars?: Record<string, string | undefined>; tier?: (id: string) => PremiumTier | null } = {}) {
  const r2 = fakeUserBooksBucket()
  const spend = durableNamespace(state => new NarrationCoordinator(state, {}))
  const usage = { getByName: () => ({ hit: async () => true }) }
  const env = {
    USER_BOOKS: r2.bucket, NARRATION_COORDINATOR: spend.namespace, USAGE_COORDINATOR: usage, XAI_API_KEY: 'test-key', OWN_PDF_OCR: '1', ...options.vars,
  } as unknown as UserBooksEnv & OwnOcrEnv
  const calls: number[] = []
  class TestCoordinator extends OwnOcrCoordinator {
    protected deps(): OcrDeps {
      return {
        recognizer: async input => { calls.push(input.page); return { reply: { printed_page: null, blocks: [{ t: 'p', x: `${SECRET_TEXT} ${input.page}.` }] }, usage: { input: 2000, output: 500 } } },
        now: () => Date.UTC(2026, 9, 9, 12),
        loadTier: async id => (options.tier ? options.tier(id) : 'premium'),
      }
    }
  }
  const ocr = durableNamespace(state => new TestCoordinator(state, env))
  ;(env as { OWN_OCR?: unknown }).OWN_OCR = ocr.namespace
  const checkRateLimit = limiter()
  const verifyUser = async (request: Request) => {
    const id = USERS[request.headers.get('authorization') ?? '']
    return id ? { id, email: `${id}@example.com` } : null
  }
  const premiumTier = async (id: string) => (options.tier ? options.tier(id) : 'premium')
  // Adding the file itself is tested in worker.userBooks.test.ts; here every account may add one.
  const premiumAccess = async () => true
  const call = (path: string, init: RequestInit & { token?: string } = {}) => {
    const headers = new Headers(init.headers)
    if (init.token) headers.set('Authorization', `Bearer ${init.token}`)
    return handleUserBooks(new Request(`https://tinct.app${path}`, { ...init, headers }), env, { verifyUser, checkRateLimit, premiumAccess, premiumTier })
  }
  const addBook = async (token: string, bytes: Uint8Array = pdfBytes()) => {
    const res = await call('/api/user-books', { method: 'POST', token, body: bytes, headers: { 'X-Book-Name': 'Scan.pdf', 'X-Book-Title': 'A Scan' } })
    const { book } = await res.json() as { book: UserBook }
    return { book, hex: book.sha256.slice(0, 24) }
  }
  const start = (hex: string, body: unknown = { pages: 2 }, token = 'token-a') =>
    call(`/api/user-books/ocr/${hex}`, { method: 'POST', token, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
  const put = (hex: string, n: number | string, bytes: BodyInit = JPEG, token = 'token-a', type = 'image/jpeg') =>
    call(`/api/user-books/ocr/${hex}/pages/${n}`, { method: 'PUT', token, body: bytes, headers: { 'Content-Type': type } })
  const runJob = async (userId: string, hex: string) => {
    const name = await ocrCoordinatorName(userId, hex)
    const job = ocr.getByName(name) as OwnOcrCoordinator
    await ocr.instances.get(name)!.fake.storage.deleteAlarm()
    await job.alarm()
  }
  return { r2, env, ocr, spend, call, addBook, start, put, runJob, calls }
}

afterEach(() => { vi.restoreAllMocks() })

describe('/api/user-books/ocr with the switch off', () => {
  it('ships dark: wrangler.jsonc has OWN_PDF_OCR "0", its limits, the coordinator binding and migration', () => {
    const config = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
    for (const [name, value] of [['OWN_PDF_OCR', '0'], ['OWN_PDF_OCR_MONTHLY_PAGES', '1500'], ['OWN_PDF_OCR_TRIAL_MONTHLY_PAGES', '300'], ['OWN_PDF_OCR_MONTHLY_USD', '2'], ['OWN_PDF_OCR_GLOBAL_MONTHLY_USD', '75'], ['OCR_MAX_PAGES', '1000']]) {
      expect(config).toContain(`"${name}": "${value}"`)
    }
    expect(config).toContain('{ "name": "OWN_OCR", "class_name": "OwnOcrCoordinator" }')
    expect(config).toContain('{ "tag": "own-ocr-v1", "new_sqlite_classes": ["OwnOcrCoordinator"] }')
  })

  it('answers 404 on every OCR route and method, signed in or not, and starts nothing', async () => {
    for (const value of ['0', undefined, 'true']) {
      const s = setup({ vars: { OWN_PDF_OCR: value } })
      const { hex } = await s.addBook('token-a')
      for (const [path, method] of [[`/api/user-books/ocr/${hex}`, 'POST'], [`/api/user-books/ocr/${hex}`, 'GET'], [`/api/user-books/ocr/${hex}`, 'DELETE'], [`/api/user-books/ocr/${hex}/pages/1`, 'PUT'], [`/api/user-books/ocr/${hex}/edition`, 'GET'], ['/api/user-books/ocr', 'GET']]) {
        for (const token of ['token-a', undefined]) {
          const res = await s.call(path, { method, token, body: method === 'POST' ? JSON.stringify({ pages: 2 }) : method === 'PUT' ? JPEG : undefined, headers: method === 'PUT' ? { 'Content-Type': 'image/jpeg' } : {} })
          expect(res.status, `${value} ${method} ${path}`).toBe(404)
        }
      }
      expect(s.ocr.instances.size).toBe(0)
      expect([...s.r2.objects.keys()].filter(key => key.includes('/ocr/'))).toEqual([])
    }
  })
})

describe('/api/user-books/ocr', () => {
  it('requires a signed-in user', async () => {
    const s = setup()
    const { hex } = await s.addBook('token-a')
    expect((await s.call(`/api/user-books/ocr/${hex}`)).status).toBe(401)
    expect((await s.call(`/api/user-books/ocr/${hex}`, { token: 'nope' })).status).toBe(401)
  })

  it('answers 404 for a book the account does not own, an EPUB, or a malformed id', async () => {
    const s = setup()
    const theirs = await s.addBook('token-b', pdfBytes('theirs'))
    expect((await s.start(theirs.hex)).status).toBe(404)
    expect((await s.call(`/api/user-books/ocr/${theirs.hex}`, { token: 'token-a' })).status).toBe(404)
    expect((await s.put(theirs.hex, 1)).status).toBe(404)
    expect((await s.call(`/api/user-books/ocr/${theirs.hex}/edition`, { token: 'token-a' })).status).toBe(404)
    expect((await s.call(`/api/user-books/ocr/${theirs.hex}`, { method: 'DELETE', token: 'token-a' })).status).toBe(404)
    expect((await s.start('zz'.repeat(12))).status).toBe(404)
    expect((await s.start(theirs.book.sha256)).status).toBe(404)
    expect((await s.call(`/api/user-books/ocr/${theirs.hex}/other`, { token: 'token-a' })).status).toBe(404)
    // Nothing was started for anyone.
    expect(s.ocr.instances.size).toBe(0)
  })

  it('starts only with Premium: 402 premium_required for a free account, 503 when unknown or unconfigured', async () => {
    const free = setup({ tier: id => (id === A ? 'none' : 'premium') })
    const { hex } = await free.addBook('token-b')
    const mine = await free.addBook('token-a', pdfBytes('mine'))
    expect((await free.start(hex, { pages: 2 }, 'token-b')).status).toBe(202)
    const refused = await free.start(mine.hex)
    expect(refused.status).toBe(402)
    expect(await refused.json()).toEqual({ error: 'premium_required' })

    const unknown = setup({ tier: () => null })
    const added = await unknown.addBook('token-a')
    expect((await unknown.start(added.hex)).status).toBe(503)

    const noKey = setup({ vars: { XAI_API_KEY: undefined } })
    const noKeyBook = await noKey.addBook('token-a')
    expect((await noKey.start(noKeyBook.hex)).status).toBe(503)
    expect(noKey.r2.objects.has(ocrJobKey(A, noKeyBook.hex))).toBe(false)
    expect(free.r2.objects.has(ocrJobKey(A, mine.hex))).toBe(false)
  })

  it('caps pages per book at OCR_MAX_PAGES (1000 by default) and checks the body', async () => {
    const s = setup()
    const { hex } = await s.addBook('token-a')
    const over = await s.start(hex, { pages: 1001 })
    expect(over.status).toBe(413)
    expect(await over.json()).toEqual({ error: 'too_many_pages', maxPages: 1000 })
    for (const body of [{ pages: 0 }, { pages: 2.5 }, { pages: '2' }, { pages: 2, blank: [3] }, { pages: 2, rerun: 'some' }, {}]) {
      expect((await s.start(hex, body)).status, JSON.stringify(body)).toBe(400)
    }
    expect((await s.start(hex, { pages: 1000 })).status).toBe(202)
    const small = setup({ vars: { OCR_MAX_PAGES: '10' } })
    const book = await small.addBook('token-a')
    expect((await small.start(book.hex, { pages: 11 })).status).toBe(413)
    expect((await small.put(book.hex, 11)).status).toBe(404)
  })

  it('runs a job end to end: pages in, status, Tinct text out, all under the owner\'s private prefix, nothing logged', async () => {
    const logs = [vi.spyOn(console, 'log'), vi.spyOn(console, 'warn'), vi.spyOn(console, 'error'), vi.spyOn(console, 'info')]
    const s = setup()
    const { hex } = await s.addBook('token-a')
    const started = await s.start(hex, { pages: 3, blank: [2] })
    expect(started.status).toBe(202)
    expect(await started.json()).toMatchObject({ state: 'uploading', pages: 3, blank: 1, month: { used: 0, limit: 1500 } })
    // Uploading the same start again changes nothing.
    expect(await (await s.start(hex, { pages: 3 })).json()).toMatchObject({ state: 'uploading', pages: 3, blank: 1 })
    expect((await s.put(hex, 1)).status).toBe(200)
    expect((await s.put(hex, 2)).status).toBe(409)
    expect((await s.put(hex, 3)).status).toBe(200)
    expect(await (await s.call(`/api/user-books/ocr/${hex}`, { token: 'token-a' })).json()).toMatchObject({ state: 'running', uploaded: 2 })
    await s.runJob(A, hex)
    const status = await (await s.call(`/api/user-books/ocr/${hex}`, { token: 'token-a' })).json()
    expect(status).toMatchObject({ state: 'done', pages: 3, done: 2, blank: 1, failed: 0, month: { used: 2, limit: 1500 } })
    const edition = await s.call(`/api/user-books/ocr/${hex}/edition`, { token: 'token-a' })
    expect(edition.status).toBe(200)
    expect(edition.headers.get('Cache-Control')).toBe('no-store')
    const body = await edition.json() as { source: string; title: string; chapters: Array<{ paragraphs: string[]; pages: number[] }> }
    expect(body).toMatchObject({ source: 'ocr', title: 'A Scan' })
    expect(body.chapters[0].paragraphs).toEqual([`${SECRET_TEXT} 1.`, `${SECRET_TEXT} 3.`])
    expect(body.chapters[0].pages).toEqual([1, 3])
    // Another account cannot read it.
    expect((await s.call(`/api/user-books/ocr/${hex}/edition`, { token: 'token-b' })).status).toBe(404)
    // A finished page takes no new image.
    expect((await s.put(hex, 1)).status).toBe(409)
    expect(s.r2.objects.has(ocrImageKey(A, hex, 1))).toBe(false)

    const ocrKeys = [...s.r2.objects.keys()].filter(key => key.includes('/ocr/'))
    expect(ocrKeys.length).toBeGreaterThan(0)
    for (const key of ocrKeys) expect(key.startsWith(`u/${A}/ocr/${hex}/`)).toBe(true)
    for (const spy of logs) expect(spy).not.toHaveBeenCalled()
  })

  it('shows a trial account the trial ceiling', async () => {
    const s = setup({ tier: () => 'trial' })
    const { hex } = await s.addBook('token-a')
    expect(await (await s.start(hex)).json()).toMatchObject({ month: { used: 0, limit: 300 } })
  })

  it('takes only whole JPEGs of at most 1.5 MB, for pages it expects', async () => {
    const s = setup()
    const { hex } = await s.addBook('token-a')
    // Before the job starts no page is expected.
    expect((await s.put(hex, 1)).status).toBe(409)
    await s.start(hex, { pages: 2 })
    expect((await s.put(hex, 1, JPEG, 'token-a', 'image/png')).status).toBe(415)
    expect((await s.put(hex, 1, pdfBytes())).status).toBe(415)
    expect((await s.put(hex, 1, JPEG.slice(0, -2))).status).toBe(415)
    const big = new Uint8Array(OCR_MAX_IMAGE_BYTES + 1)
    big.set([0xff, 0xd8, 0xff])
    big.set([0xff, 0xd9], big.length - 2)
    expect((await s.put(hex, 1, big)).status).toBe(413)
    // Without a declared length the body is still cut off at the cap.
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(big); controller.close() } })
    const streamed = await s.call(`/api/user-books/ocr/${hex}/pages/1`, { method: 'PUT', token: 'token-a', body: stream, headers: { 'Content-Type': 'image/jpeg' }, duplex: 'half' } as RequestInit)
    expect(streamed.status).toBe(413)
    for (const n of ['0', '3', '01', 'x']) expect((await s.put(hex, n)).status, n).toBe(n === '3' ? 409 : 404)
    expect([...s.r2.objects.keys()].filter(key => key.includes('/img/'))).toEqual([])
    expect((await s.put(hex, 1)).status).toBe(200)
    expect(s.r2.objects.get(ocrImageKey(A, hex, 1))?.httpMetadata?.contentType).toBe('image/jpeg')
    expect(looksLikeJpeg(JPEG)).toBe(true)
  })

  it(`rate limits page uploads at ${OCR_UPLOADS_PER_MINUTE} a minute per account`, async () => {
    const s = setup()
    const { hex } = await s.addBook('token-a')
    await s.start(hex, { pages: 1 })
    for (let i = 0; i < OCR_UPLOADS_PER_MINUTE; i++) expect((await s.put(hex, 1)).status).not.toBe(429)
    expect((await s.put(hex, 1)).status).toBe(429)
  })

  it('cancel gives back page reservations and deletes everything the job kept', async () => {
    const s = setup()
    const { hex } = await s.addBook('token-a')
    await s.start(hex, { pages: 2 })
    await s.put(hex, 1)
    await s.runJob(A, hex)
    const res = await s.call(`/api/user-books/ocr/${hex}`, { method: 'DELETE', token: 'token-a' })
    expect(res.status).toBe(200)
    expect([...s.r2.objects.keys()].filter(key => key.includes('/ocr/'))).toEqual([])
    expect(await (await s.call(`/api/user-books/ocr/${hex}`, { token: 'token-a' })).json()).toMatchObject({ state: 'none' })
  })

  it('deleting the book deletes its OCR job, images, pages and Tinct text', async () => {
    const s = setup()
    const { book, hex } = await s.addBook('token-a')
    await s.start(hex, { pages: 2 })
    await s.put(hex, 1)
    await s.put(hex, 2)
    await s.runJob(A, hex)
    expect(s.r2.objects.has(ocrEditionKey(A, hex))).toBe(true)
    expect((await s.call(`/api/user-books/${book.id}`, { method: 'DELETE', token: 'token-a' })).status).toBe(200)
    expect([...s.r2.objects.keys()].filter(key => key.startsWith(`u/${A}/`))).toEqual([])
    expect(s.r2.objects.has(ocrJobKey(A, hex))).toBe(false)
    const name = await ocrCoordinatorName(A, hex)
    expect(await (s.ocr.getByName(name) as OwnOcrCoordinator).status()).toMatchObject({ state: 'none' })
  })
})
