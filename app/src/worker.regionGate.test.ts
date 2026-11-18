import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import { MASTER_AND_MARGARITA, ODYSSEY } from './data/bookRegistry'
import { isBookRestrictedIn, normalizeCountry, restrictedBookIdsIn, restrictionsFrom } from './data/regionRestrictions'
import { contentBookIdForPath, regionGate, requestCountry, withRegionCacheHeaders } from './worker/lib/regionGate'
import { handleSharePage, type ShareEnv } from './worker/routes/share'
import { shareRegion } from './worker/lib/regionGate'

const BOOK = 'master-and-margarita'
const BLOB = 'narration/grok/blob/' + 'a'.repeat(64) + '.mp3'
const BLOCKED = ['US', 'RU']
/** Allowed: Denmark, Britain, Cloudflare's "unknown" (XX), Tor (T1), lower case junk, and no country at all. */
const ALLOWED: Array<string | null> = ['DK', 'GB', 'XX', 'T1', null]

type Spies = { kvGet: ReturnType<typeof vi.fn>; kvPut: ReturnType<typeof vi.fn>; assets: ReturnType<typeof vi.fn>; r2Get: ReturnType<typeof vi.fn> }

function makeEnv(): { env: Record<string, unknown>; spies: Spies } {
  const assets = vi.fn(async (request: Request) => {
    const url = new URL(request.url)
    if (url.pathname.endsWith('.json')) return new Response(JSON.stringify({ text: 'book text' }), { headers: { 'Content-Type': 'application/json' } })
    if (url.pathname.startsWith('/read/') || url.pathname === '/app.html' || url.pathname === '/lab/library_2/') {
      return new Response('<!doctype html><html><head><title>t</title></head><body>book text<div id="shelves"></div></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }
    return new Response('Not found', { status: 404 })
  })
  const kvGet = vi.fn(async () => null)
  const kvPut = vi.fn(async () => undefined)
  const r2Get = vi.fn(async (key: string) => key.endsWith('.json')
    ? { json: async () => ({ bookId: BOOK }), body: null }
    : { body: new Uint8Array([1, 2, 3]), size: 3, httpMetadata: {}, writeHttpMetadata() {} })
  return {
    spies: { kvGet, kvPut, assets, r2Get },
    env: {
      ASSETS: { fetch: assets },
      RATE_LIMIT: { get: kvGet, put: kvPut, delete: vi.fn(), list: vi.fn() },
      AUDIO_BUCKET: { get: r2Get, head: vi.fn(async () => null), put: vi.fn(), list: vi.fn(async () => ({ objects: [] })) },
    },
  }
}

const ctx = { waitUntil: vi.fn(), passThroughOnException() {} } as unknown as ExecutionContext

function request(path: string, country: string | null, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers)
  if (country) headers.set('CF-IPCountry', country)
  return new Request('https://tinct.app' + path, { ...init, headers })
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })

/** Every path class that serves the book's text, narration or derived data. */
const PATHS: Array<{ name: string; path: string; init?: RequestInit; page?: boolean }> = [
  { name: 'Modern English edition', path: `/data/editions/${BOOK}-modern-en.json?v=1` },
  { name: 'Moderne Dansk edition', path: `/data/editions/${BOOK}-modern-da.json?v=1` },
  { name: 'Russian original', path: `/data/editions/${BOOK}-original-ru.json?v=1` },
  { name: 'chapter shard', path: `/data/editions-chapters/${BOOK}-modern-en/ch0001.json?v=1` },
  { name: 'shard manifest', path: `/data/editions-chapters/${BOOK}-original-ru/manifest.json` },
  { name: 'threads', path: `/data/editions/${BOOK}-threads.json` },
  { name: 'character cards', path: `/data/characters/${BOOK}.v1.json` },
  { name: 'onboarding', path: `/data/onboarding/${BOOK}.json?v=2` },
  { name: 'Danish onboarding', path: `/data/onboarding/${BOOK}.da.json?v=2` },
  { name: 'catch-up index', path: `/data/catch-up/${BOOK}-modern-en.json` },
  { name: 'introduction', path: `/lab/library_2/intro-data/${BOOK}.json?v=x` },
  { name: 'primer', path: `/lab/library_2/primer-data/${BOOK}.en.json` },
  { name: 'preface', path: `/lab/prefaces/${BOOK}.json` },
  { name: 'book page', path: `/read/${BOOK}`, page: true },
  { name: 'generated book page', path: `/read/${BOOK}/book`, page: true },
  { name: 'old chapter page', path: `/read/${BOOK}/chapter-3`, page: true },
  { name: 'reader direct link', path: `/reader?book=${BOOK}&chapter=2`, page: true },
  { name: 'SEO chapter page (16 Nov)', path: `/read/${BOOK}/chapter-12`, page: true },
  { name: 'SEO chapter pack slice', path: `/seo/chapter-packs/${BOOK}/0.txt` },
  { name: 'library book link', path: `/library?book=${BOOK}`, page: true },
  { name: 'library book introduction link', path: `/library?book=${BOOK}&view=book-detail`, page: true },
  { name: 'home book link', path: `/?book=${BOOK}`, page: true },
  { name: 'old app book link', path: `/app?book=${BOOK}`, page: true },
  { name: 'recorded audio manifest', path: `/api/audio-manifest?path=${BOOK}/modern-en/ch1/manifest.json` },
  { name: 'narration recording', path: `/api/audio-file?path=${BLOB}` },
  { name: 'narration chapter map', path: `/api/narration/chapter?bookId=${BOOK}&editionKey=modern-en&chapter=1&voice=f` },
  { name: 'narration ensure', path: '/api/narration/ensure', init: post({ bookId: BOOK, editionKey: 'modern-en', chapter: 1, paragraphs: [0] }) },
  { name: 'Explain (margin companion)', path: '/api/lab-chat', init: post({ messages: [{ role: 'user', content: 'Explain' }], companion: { intent: 'explain', context: { bookId: BOOK, editionKey: 'modern-en', chapterNumber: 1 } } }) },
  { name: 'Ask (signed-in chat)', path: '/api/chat', init: post({ messages: [{ role: 'user', content: 'Who is Woland?' }], book: { bookId: BOOK, editionKey: 'modern-en' } }) },
  { name: 'recap', path: '/api/lab-recap', init: post({ bookId: BOOK, editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, completed: true }) },
  { name: 'catch me up', path: '/api/lab-catch-up', init: post({ bookId: BOOK, editionKey: 'modern-en', unitId: 'u1' }) },
  { name: 'chapter notes (primer/summary)', path: '/api/lab-chapter-notes', init: post({ bookId: BOOK, editionKey: 'modern-en', chapterNumber: 2, kind: 'primer' }) },
  { name: 'issue report', path: '/api/report-issue', init: post({ bookId: BOOK, editionKey: 'modern-en', chapterNumber: 1, paragraphIndex: 0 }) },
  { name: 'edition patches', path: `/api/edition-patches?bookId=${BOOK}&editionKey=modern-en` },
  { name: 'new share', path: '/api/share', init: post({ bookId: BOOK, editionKey: 'modern-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, look: 'paper', format: 'square' }) },
  { name: 'share preview image', path: `/api/share/preview?bookId=${BOOK}&editionKey=modern-en&chapterNumber=1&paragraphIndex=0&fromWord=0&endParagraphIndex=0&toWord=3&look=paper&format=square` },
]

let consoleSpies: Array<ReturnType<typeof vi.spyOn>>
let outbound: ReturnType<typeof vi.fn>

beforeEach(() => {
  consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map(name => vi.spyOn(console, name).mockImplementation(() => {}))
  outbound = vi.fn(async () => new Response('{}', { status: 503 }))
  vi.stubGlobal('fetch', outbound)
  vi.stubGlobal('caches', { default: { match: async () => undefined, put: async () => undefined } })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('the registry field', () => {
  it('restricts The Master and Margarita in the US and Russia only, from the registry', () => {
    expect(MASTER_AND_MARGARITA.restrictedCountries).toEqual(['US', 'RU'])
    expect(isBookRestrictedIn(BOOK, 'US')).toBe(true)
    expect(isBookRestrictedIn(BOOK, 'RU')).toBe(true)
    for (const country of ['DK', 'GB', 'DE', null]) expect(isBookRestrictedIn(BOOK, country)).toBe(false)
    expect(isBookRestrictedIn('odyssey', 'US')).toBe(false)
    expect(restrictedBookIdsIn('US')).toEqual([BOOK])
    expect(restrictedBookIdsIn(null)).toEqual([])
  })
  it('is data-driven: any book with restrictedCountries is covered', () => {
    const map = restrictionsFrom([{ ...ODYSSEY, restrictedCountries: ['fr', 'bad', 'DE'] }])
    expect([...map.get('odyssey')!]).toEqual(['FR', 'DE'])
    expect(isBookRestrictedIn('odyssey', 'FR', map)).toBe(true)
  })
  it('treats missing, unknown (XX) and Tor (T1) countries as unknown', () => {
    for (const raw of [undefined, null, '', 'XX', 'T1', 'usa', 'u', 42]) expect(normalizeCountry(raw)).toBeNull()
    expect(normalizeCountry(' us ')).toBe('US')
  })
})

describe('the request country', () => {
  it('prefers Cloudflare request.cf over the header and falls back to CF-IPCountry', () => {
    const req = request('/', 'DK')
    Object.defineProperty(req, 'cf', { value: { country: 'US' } })
    expect(requestCountry(req)).toBe('US')
    expect(requestCountry(request('/', 'RU'))).toBe('RU')
    expect(requestCountry(request('/', null))).toBeNull()
    const unknown = request('/', 'US')
    Object.defineProperty(unknown, 'cf', { value: { country: 'XX' } })
    expect(requestCountry(unknown)).toBeNull()
  })
})

describe('content paths', () => {
  it('maps every content path class to the book, and leaves other books and shared files alone', () => {
    for (const { path } of PATHS.filter(item => !item.path.startsWith('/api/') && !item.path.includes('?book='))) {
      expect(contentBookIdForPath(new URL('https://tinct.app' + path).pathname), path).toBe(BOOK)
    }
    expect(contentBookIdForPath('/data/editions/odyssey-modern-en.json')).toBe('odyssey')
    expect(contentBookIdForPath('/data/dict/m.json')).toBeNull()
    expect(contentBookIdForPath('/lab/catalogue.json')).toBeNull()
    expect(contentBookIdForPath(`/covers/v2/${BOOK}.webp`)).toBeNull()
    expect(contentBookIdForPath('/data/editions/pd-12345-original-en.json')).toBeNull()
  })
})

describe('the gate', () => {
  for (const country of BLOCKED) {
    for (const item of PATHS) {
      it(`${country}: refuses ${item.name} with 451, no-store, without touching storage or logs`, async () => {
        const { env, spies } = makeEnv()
        const response = await worker.fetch(request(item.path, country, item.init), env as never, ctx)
        expect(response.status).toBe(451)
        expect(response.headers.get('Cache-Control')).toBe('no-store')
        expect(response.headers.get('Vary')).toContain('CF-IPCountry')
        const body = await response.text()
        if (item.page) expect(body).toContain('This book isn’t available in your country.')
        else expect(JSON.parse(body)).toEqual({ error: 'not_available_in_your_country' })
        expect(body).not.toContain('book text')
        expect(body).not.toMatch(/\bUS\b|\bRU\b/)
        // Nothing served, nothing stored, nothing logged, nothing sent.
        expect(spies.assets).not.toHaveBeenCalled()
        expect(spies.kvGet).not.toHaveBeenCalled()
        expect(spies.kvPut).not.toHaveBeenCalled()
        expect(outbound).not.toHaveBeenCalled()
        for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
        // The only storage read is the narration recording's own meta, to learn its book.
        if (item.name === 'narration recording') expect(spies.r2Get.mock.calls.map(call => call[0])).toEqual([BLOB.replace(/\.mp3$/, '.json')])
        else expect(spies.r2Get).not.toHaveBeenCalled()
      })
    }
    it(`${country}: also refuses through request.cf without the header`, async () => {
      const { env } = makeEnv()
      const req = request(`/data/editions/${BOOK}-modern-en.json`, null)
      Object.defineProperty(req, 'cf', { value: { country } })
      expect((await worker.fetch(req, env as never, ctx)).status).toBe(451)
    })
    it(`${country}: serves other books as before`, async () => {
      const { env } = makeEnv()
      const response = await worker.fetch(request('/data/editions/odyssey-modern-en.json?v=1', country), env as never, ctx)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=2592000, immutable')
      expect(response.headers.get('Vary')).toBeNull()
    })
    it(`${country}: never blocks reading-position sync`, async () => {
      const { env } = makeEnv()
      const response = await worker.fetch(request('/api/lab-position', country, post({ books: { [BOOK]: { bookId: BOOK, chapterNumber: 3 } } })), env as never, ctx)
      expect(response.status).not.toBe(451)
    })
  }

  for (const country of ALLOWED) {
    for (const item of PATHS) {
      it(`${country ?? 'missing'}: lets ${item.name} through`, async () => {
        const { env } = makeEnv()
        const response = await worker.fetch(request(item.path, country, item.init), env as never, ctx)
        expect(response.status).not.toBe(451)
      })
    }
    it(`${country ?? 'missing'}: serves the edition text, private to the request and varying by country`, async () => {
      const { env, spies } = makeEnv()
      const response = await worker.fetch(request(`/data/editions/${BOOK}-modern-en.json?v=1`, country), env as never, ctx)
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ text: 'book text' })
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=2592000, immutable')
      expect(response.headers.get('Vary')).toContain('CF-IPCountry')
      expect(spies.kvPut).not.toHaveBeenCalled()
      for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
    })
  }

  it('reads no body and no storage for a request from an unrestricted country', async () => {
    const req = request('/api/lab-chat', 'DK', post({ companion: { context: { bookId: BOOK } } }))
    const clone = vi.spyOn(req, 'clone')
    const { env, spies } = makeEnv()
    expect(await regionGate(req, env as never)).toBeNull()
    expect(clone).not.toHaveBeenCalled()
    expect(spies.r2Get).not.toHaveBeenCalled()
  })

  it('narrows a recap-preparation shelf to the books served here', async () => {
    const shelf = { kind: 'shelf', candidates: [
      { request: { bookId: BOOK, editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, completed: true }, lastActiveAt: 1 },
      { request: { bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 2, paragraphIndex: 0, completed: true }, lastActiveAt: 2 },
    ] }
    const narrowed = await regionGate(request('/api/recap-preparation', 'US', post(shelf)), {})
    expect(narrowed).toBeInstanceOf(Request)
    expect((await (narrowed as Request).json()).candidates.map((item: { request: { bookId: string } }) => item.request.bookId)).toEqual(['odyssey'])
    expect(await regionGate(request('/api/recap-preparation', 'DK', post(shelf)), {})).toBeNull()
    const presence = { kind: 'presence', clientId: 'c', sequence: 1, active: true, request: shelf.candidates[0].request }
    expect(((await regionGate(request('/api/recap-preparation', 'RU', post(presence)), {})) as Response).status).toBe(451)
  })

  it('serves a narration recording of another book to a restricted country', async () => {
    const { env, spies } = makeEnv()
    spies.r2Get.mockImplementation(async (key: string) => key.endsWith('.json') ? { json: async () => ({ bookId: 'odyssey' }) } : null)
    expect(await regionGate(request(`/api/audio-file?path=${BLOB}`, 'US'), env as never)).toBeNull()
  })
})

describe('the client signal', () => {
  for (const [country, ids] of [['US', [BOOK]], ['RU', [BOOK]], ['DK', []], ['GB', []], ['XX', []], [null, []]] as const) {
    it(`${country ?? 'missing'}: lists only the book ids not served, never the country`, async () => {
      const { env, spies } = makeEnv()
      const response = await worker.fetch(request('/api/restricted-books', country), env as never, ctx)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('private, no-store')
      expect(response.headers.get('Vary')).toContain('CF-IPCountry')
      const text = await response.text()
      expect(JSON.parse(text)).toEqual({ restrictedBookIds: ids })
      if (country) expect(text).not.toContain(country)
      expect(spies.kvGet).not.toHaveBeenCalled()
      expect(spies.kvPut).not.toHaveBeenCalled()
      expect(outbound).not.toHaveBeenCalled()
      for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
    })
  }
})

describe('cache headers', () => {
  it('keeps a restricted book out of shared caches and leaves other books untouched', () => {
    const odyssey = new Response('{}', { headers: { 'Cache-Control': 'public, max-age=2592000, immutable' } })
    expect(withRegionCacheHeaders(request('/data/editions/odyssey-modern-en.json', 'DK'), odyssey)).toBe(odyssey)
    const page = withRegionCacheHeaders(request(`/read/${BOOK}`, 'DK'), new Response('x', { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', Vary: 'Cookie' } }))
    expect(page.headers.get('Cache-Control')).toBe('private, max-age=300, stale-while-revalidate=86400')
    expect(page.headers.get('Vary')).toBe('Cookie, CF-IPCountry')
    const audio = withRegionCacheHeaders(request(`/api/audio-manifest?path=${BOOK}/modern-en/m.json`, 'DK'), new Response('x', { headers: { 'Cache-Control': 'public, max-age=86400' } }))
    expect(audio.headers.get('Cache-Control')).toBe('private, max-age=86400')
    const stored = withRegionCacheHeaders(request(`/data/editions/${BOOK}-modern-en.json`, 'DK'), new Response('x', { headers: { 'Cache-Control': 'no-store' } }))
    expect(stored.headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('share links', () => {
  const record = { id: 'abc23de', bookId: BOOK, editionKey: 'modern-en', chapterNumber: 1, paragraphIndex: 0, fromWord: 0, endParagraphIndex: 0, toWord: 3, look: 'paper', format: 'square' }
  const shareEnv = (): ShareEnv => ({
    ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
    SHARE_STORE: { getByName: () => ({ get: async () => record }) },
  } as unknown as ShareEnv)

  for (const country of BLOCKED) {
    it(`${country}: refuses the /q/ page and its images before the image cache`, async () => {
      const cacheMatch = vi.fn(async () => undefined)
      vi.stubGlobal('caches', { default: { match: cacheMatch, put: vi.fn() } })
      for (const path of [`/q/${record.id}`, `/q/${record.id}/image.png`, `/q/${record.id}/og.png`]) {
        const req = request(path, country)
        const response = await handleSharePage(req, shareEnv(), ctx, shareRegion(req))
        expect(response?.status, path).toBe(451)
        expect(response?.headers.get('Cache-Control')).toBe('no-store')
      }
      expect(cacheMatch).not.toHaveBeenCalled()
    })
  }
  it('DK: the /q/ page is not refused', async () => {
    const req = request(`/q/${record.id}`, 'DK')
    const response = await handleSharePage(req, shareEnv(), ctx, shareRegion(req))
    expect(response?.status).not.toBe(451)
  })
})
