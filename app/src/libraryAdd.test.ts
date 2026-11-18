import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const session = { current: null as null | { access_token: string } }
vi.mock('./services/supabase', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: session.current } }) } } }))
const converted = { chapters: [{ number: 1, title: 'One', paragraphs: ['Text.'] }] }
vi.mock('./lab/userBook/epubEdition', () => ({ epubToEdition: vi.fn(async () => converted) }))

const USER = '11111111-1111-4111-8111-111111111111'
function memoryStorage(values: Record<string, string> = {}) {
  const map = new Map(Object.entries(values))
  return {
    get length() { return map.size },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
  }
}

beforeEach(() => {
  vi.stubGlobal('window', globalThis)
  vi.stubGlobal('localStorage', memoryStorage({ 'sb-x-auth-token': JSON.stringify({ user: { id: USER, email: 'a@example.com' } }) }))
})
afterEach(() => { vi.unstubAllGlobals(); session.current = null })

describe('canAdd (adding books is Premium or the trial)', () => {
  it('bounds a stalled access request without inventing an entitlement', async () => {
    vi.useFakeTimers()
    try {
      session.current = { access_token: 'tok' }
      const { canAdd } = await import('./libraryAdd')
      let signal: AbortSignal | undefined
      const stalled = vi.fn((_url: unknown, init?: RequestInit) => {
        signal = init?.signal as AbortSignal | undefined
        return new Promise<Response>((_resolve, reject) => signal?.addEventListener('abort', () => reject(new Error('aborted'))))
      })
      let settled = false
      const result = canAdd(stalled as typeof fetch).then(value => { settled = true; return value })
      await vi.advanceTimersByTimeAsync(15_000)
      expect(settled).toBe(true)
      expect(await result).toBeNull()
      expect(signal?.aborted).toBe(true)
    } finally { vi.useRealTimers() }
  })
  it('denies only a confirmed free entitlement, not a cold or expired session', async () => {
    const { canAdd } = await import('./libraryAdd')
    const never = vi.fn()
    expect(await canAdd(never as unknown as typeof fetch)).toBeNull()
    expect(never).not.toHaveBeenCalled()
    session.current = { access_token: 'tok' }
    const seen: string[] = []
    const reply = (status: number, body: unknown) => (async (url: string) => { seen.push(url); return Response.json(body, { status }) }) as unknown as typeof fetch
    expect(await canAdd(reply(200, { canAdd: true }))).toBe(true)
    expect(await canAdd(reply(200, { canAdd: false }))).toBe(false)
    expect(await canAdd(reply(503, { error: 'unavailable' }))).toBeNull()
    expect(await canAdd(reply(401, { error: 'expired' }))).toBeNull()
    expect(seen[0]).toBe('/api/public-books/import/access')
  })
})

describe('importWork (the browser half of Add)', () => {
  it('is signed out without a session and never calls the Worker', async () => {
    const { importWork } = await import('./libraryAdd')
    const fetchImpl = vi.fn()
    expect(await importWork('pg:1', { fetchImpl: fetchImpl as unknown as typeof fetch })).toEqual({ ok: false, reason: 'signed_out' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('prepares, converts the downloaded EPUB with the reader converter, and commits only the chapters', async () => {
    session.current = { access_token: 'tok' }
    const { importWork } = await import('./libraryAdd')
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (url === '/api/public-books/import') return Response.json({ status: 'convert', bookId: 'pd-pg-1', source: '/api/public-books/import/pd-pg-1/source' })
      if (url.endsWith('/source')) return new Response(new Uint8Array([1, 2, 3]))
      return Response.json({ status: 'imported', bookId: 'pd-pg-1', entry: { id: 'pd-pg-1' } }, { status: 201 })
    }) as unknown as typeof fetch
    const stages: string[] = []
    const result = await importWork('pg:1', { fetchImpl, onStage: stage => stages.push(stage) })
    expect(result).toEqual({ ok: true, bookId: 'pd-pg-1', entry: { id: 'pd-pg-1' }, existed: false })
    expect(stages).toEqual(['download', 'convert', 'publish'])
    expect(calls.map(c => c.url)).toEqual(['/api/public-books/import', '/api/public-books/import/pd-pg-1/source', '/api/public-books/import/pd-pg-1/commit'])
    expect(new Headers(calls[0].init?.headers).get('Authorization')).toBe('Bearer tok')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ workId: 'pg:1' })
    expect(JSON.parse(String(calls[2].init?.body))).toEqual({ chapters: converted.chapters })
  })

  it('returns an existing book at once and maps Worker refusals to reasons', async () => {
    session.current = { access_token: 'tok' }
    const { importWork } = await import('./libraryAdd')
    const reply = (status: number, body: unknown) => (async () => Response.json(body, { status })) as unknown as typeof fetch
    expect(await importWork('pg:1', { fetchImpl: reply(200, { status: 'exists', bookId: 'pd-pg-1', entry: { id: 'pd-pg-1' } }) })).toMatchObject({ ok: true, existed: true })
    expect(await importWork('pg:1', { fetchImpl: reply(429, { error: 'daily_limit' }) })).toEqual({ ok: false, reason: 'daily_limit' })
    expect(await importWork('pg:1', { fetchImpl: reply(402, { error: 'premium_required' }) })).toEqual({ ok: false, reason: 'premium_required' })
    expect(await importWork('pg:1', { fetchImpl: reply(409, { error: 'in_progress' }) })).toEqual({ ok: false, reason: 'in_progress' })
    expect(await importWork('pg:1', { fetchImpl: reply(422, { error: 'not_importable' }) })).toEqual({ ok: false, reason: 'not_importable' })
    expect(await importWork('pg:1', { fetchImpl: reply(401, { error: 'Unauthorized' }) })).toEqual({ ok: false, reason: 'signed_out' })
    // QA 2026-10-08: a file too large (even without pictures) is "cannot be added", never the generic "try again";
    // a library's bot check instead of the book is "could not be read from its library".
    expect(await importWork('pg:1', { fetchImpl: reply(413, { error: 'source_too_large' }) })).toEqual({ ok: false, reason: 'not_importable' })
    expect(await importWork('pg:1', { fetchImpl: reply(503, { error: 'source_blocked' }) })).toEqual({ ok: false, reason: 'unreadable' })
    expect(await importWork('pg:1', { fetchImpl: (async () => { throw new Error('offline') }) as unknown as typeof fetch })).toEqual({ ok: false, reason: 'failed' })
  })
})

describe('ownBooks (My shelf: Your own books)', () => {
  it('lists the account copies (this device has no IndexedDB here), newest first, each opening by its own key (the one reader address for both since 22 Oct 2026; never the old start page)', async () => {
    session.current = { access_token: 'tok' }
    const { ownBooks } = await import('./libraryAdd')
    const fetchImpl = (async () => Response.json({ books: [
      { type: 'pdf', sha256: 'a'.repeat(64), title: 'Lecture notes', createdAt: '2026-10-01T00:00:00Z' },
      { type: 'epub', sha256: 'b'.repeat(64), title: 'My novel', author: 'Me', createdAt: '2026-10-05T00:00:00Z' },
      { type: 'epub', title: 'No hash' },
    ] })) as unknown as typeof fetch
    const list = await ownBooks(fetchImpl)
    expect(list.map(b => [b.title, b.kind, b.href, b.readingAt])).toEqual([
      // An EPUB on the desktop opens in Add a book's margin reader (19 Oct 2026, epubView.ts), which downloads it; a phone's goes to the reader (epubView.test.ts).
      ['My novel', 'epub', '/reader?userBook=' + 'b'.repeat(24), null],
      ['Lecture notes', 'pdf', '/reader?userBook=' + 'a'.repeat(24), null],
    ])
  })

  it('is empty when nobody is signed in on this device', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    const { ownBooks } = await import('./libraryAdd')
    const fetchImpl = vi.fn()
    expect(await ownBooks(fetchImpl as unknown as typeof fetch)).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('Modern English after an add (the reader’s status and checkout)', () => {
  it('asks the reader’s status endpoint', async () => {
    const { modernStatus } = await import('./libraryAdd')
    const fetchImpl = vi.fn(async () => Response.json({ state: 'none', chapters: {}, offer: { tier: 2, cents: 499 } }))
    expect(await modernStatus('pd-pg-158', fetchImpl as unknown as typeof fetch)).toEqual({ state: 'none', chapters: {}, offer: { tier: 2, cents: 499 } })
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe('/api/public-books/pd-pg-158/modern-en')
    expect(await modernStatus('pd-pg-158', (async () => new Response('', { status: 503 })) as unknown as typeof fetch)).toBeNull()
  })

  it('starts the reader’s checkout signed in and marks the purchase for the reader’s return; never signed out', async () => {
    const { buyModern } = await import('./libraryAdd')
    const tab = memoryStorage()
    vi.stubGlobal('sessionStorage', tab)
    const fetchImpl = vi.fn(async () => Response.json({ url: 'https://checkout.stripe.com/c/pay/cs_1' }))
    await expect(buyModern('pd-pg-158', 1, fetchImpl as unknown as typeof fetch)).rejects.toThrow('signed_out')
    expect(fetchImpl).not.toHaveBeenCalled()
    session.current = { access_token: 'tok' }
    expect(await buyModern('pd-pg-158', 1, fetchImpl as unknown as typeof fetch)).toBe('https://checkout.stripe.com/c/pay/cs_1')
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/public-books/pd-pg-158/modern-en/checkout')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(JSON.parse(String(init.body))).toEqual({ chapter: 1 })
    expect(tab.getItem('tinct:modern-purchase')).toBe('pd-pg-158')
    // Someone else is buying it (409): no checkout, no pending mark.
    tab.removeItem('tinct:modern-purchase')
    await expect(buyModern('pd-pg-158', 1, (async () => Response.json({ error: 'in_progress' }, { status: 409 })) as unknown as typeof fetch)).rejects.toThrow()
    expect(tab.getItem('tinct:modern-purchase')).toBeNull()
  })
})
