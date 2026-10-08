import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleReadingTime, type ReadingTimeDeps } from './worker/routes/readingTime'
import { BEAT_MIN_GAP_MS, DAILY_CAP_SECONDS, EARLIER_BOOK_ID } from './readingTime/model'

const userId = '11111111-1111-4111-8111-111111111111'
const NOW = Date.UTC(2026, 9, 7, 12, 0, 0)
const on = { SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'service-role', SOCIAL_READING_TIME: '1' }
const off = { SUPABASE_URL: 'https://db.example', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }

type Row = { user_id: string; day: string; book_id: string; read_seconds: number; listen_seconds: number }

/**
 * An in-memory PostgREST for the calls the route makes: reading_time reads
 * with eq/neq filters, the ignore-duplicates insert, add_reading_time() (with
 * the SQL function's daily cap) and the user_data reading-year row.
 */
function fakeSupabase(options: { missing?: boolean; yearly?: Record<number, unknown> } = {}) {
  const table: Row[] = []
  const calls: string[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? 'GET'
    calls.push(`${method} ${url.pathname}${url.search}`)
    const params = url.searchParams
    if (url.pathname === '/rest/v1/user_data') {
      const year = Number(params.get('key')?.replace('eq.reading-year-', ''))
      return Response.json(options.yearly?.[year] ? [{ value: options.yearly[year] }] : [])
    }
    if (options.missing) return Response.json({ code: 'PGRST205', message: 'Could not find the table' }, { status: 404 })
    if (url.pathname === '/rest/v1/reading_time' && method === 'GET') {
      const filters = [...params.entries()].filter(([key]) => !['select', 'order', 'limit', 'offset'].includes(key))
      const match = (row: Row) => filters.every(([key, value]) => {
        const [op, expected] = [value.slice(0, value.indexOf('.')), value.slice(value.indexOf('.') + 1)]
        const actual = String(row[key as keyof Row])
        return op === 'eq' ? actual === expected : op === 'neq' ? actual !== expected : true
      })
      return Response.json(table.filter(match).map(row => ({ ...row })))
    }
    if (url.pathname === '/rest/v1/reading_time' && method === 'POST') {
      const body = JSON.parse(String(init?.body)) as Row
      if (!table.some(row => row.user_id === body.user_id && row.day === body.day && row.book_id === body.book_id)) table.push({ ...body })
      return new Response(null, { status: 201 })
    }
    if (url.pathname === '/rest/v1/rpc/add_reading_time') {
      const p = JSON.parse(String(init?.body)) as { p_user_id: string; p_day: string; p_book_id: string; p_read: number; p_listen: number; p_daily_cap: number }
      let read = p.p_read, listen = p.p_listen
      if (p.p_book_id !== EARLIER_BOOK_ID) {
        const used = table.filter(row => row.user_id === p.p_user_id && row.day === p.p_day && row.book_id !== EARLIER_BOOK_ID).reduce((sum, row) => sum + row.read_seconds + row.listen_seconds, 0)
        const room = Math.max(p.p_daily_cap - used, 0)
        listen = Math.min(listen, room)
        read = Math.min(read, room - listen)
      }
      const existing = table.find(row => row.user_id === p.p_user_id && row.day === p.p_day && row.book_id === p.p_book_id)
      if (existing) { existing.read_seconds += read; existing.listen_seconds += listen }
      else if (read + listen > 0) table.push({ user_id: p.p_user_id, day: p.p_day, book_id: p.p_book_id, read_seconds: read, listen_seconds: listen })
      return Response.json([{ read_credited: read, listen_credited: listen }])
    }
    return Response.json({ message: 'unexpected' }, { status: 500 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { table, calls, fetchMock }
}

/** The usage coordinator's fixed window, on a test clock: one beat per BEAT_MIN_GAP_MS. */
function deps(clock: { now: number }, overrides: Partial<ReadingTimeDeps> = {}): ReadingTimeDeps {
  const windows = new Map<string, number>()
  const seen = new Set<string>()
  return {
    verifyUser: async () => ({ id: userId }),
    beatGate: async id => {
      const resetAt = windows.get(id)
      if (resetAt !== undefined && clock.now < resetAt) return false
      windows.set(id, clock.now + BEAT_MIN_GAP_MS)
      return true
    },
    flushOnce: async (id, flushId) => { const key = `${id}:${flushId}`; if (seen.has(key)) return false; seen.add(key); return true },
    checkRateLimit: async () => true,
    now: () => clock.now,
    ...overrides,
  }
}

const post = (path: string, body: unknown) => new Request(`https://tinct.app${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', authorization: 'Bearer token' } })
const get = (path: string) => new Request(`https://tinct.app${path}`, { headers: { authorization: 'Bearer token' } })
const beat = (body: Record<string, unknown> = {}) => post('/api/reading-time/beat', { day: '2026-10-07', bookId: 'frankenstein', read: 60, listen: 0, playing: false, ...body })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the switch', () => {
  it('off: every route is a no-op that reads nothing and asks no one who they are', async () => {
    const { fetchMock } = fakeSupabase()
    const verifyUser = vi.fn(async () => ({ id: userId }))
    const clock = { now: NOW }
    for (const request of [beat(), get('/api/reading-time'), post('/api/reading-time/flush', { flushId: 'abcdefgh12', entries: [] }), post('/api/reading-time/card', { today: '2026-10-07' })]) {
      const response = await handleReadingTime(request, off, deps(clock, { verifyUser }))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ enabled: false })
    }
    const status = await handleReadingTime(new Request('https://tinct.app/api/reading-time/status'), off, deps(clock))
    expect(await status.json()).toEqual({ enabled: false })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(verifyUser).not.toHaveBeenCalled()
  })

  it('on: the status says so, without sign-in', async () => {
    fakeSupabase()
    const response = await handleReadingTime(new Request('https://tinct.app/api/reading-time/status'), on, deps({ now: NOW }, { verifyUser: async () => null }))
    expect(await response.json()).toEqual({ enabled: true })
  })

  it('needs a signed-in reader for everything else', async () => {
    fakeSupabase()
    const response = await handleReadingTime(beat(), on, deps({ now: NOW }, { verifyUser: async () => null }))
    expect(response.status).toBe(401)
  })
})

describe('heartbeats', () => {
  it('takes one beat per ~50 seconds per reader', async () => {
    const { table } = fakeSupabase()
    const clock = { now: NOW }
    const d = deps(clock)
    expect((await handleReadingTime(beat(), on, d)).status).toBe(200)
    clock.now += 20_000
    const early = await handleReadingTime(beat(), on, d)
    expect(early.status).toBe(429)
    clock.now += BEAT_MIN_GAP_MS - 20_000
    expect((await handleReadingTime(beat(), on, d)).status).toBe(200)
    expect(table.find(row => row.book_id === 'frankenstein')?.read_seconds).toBe(120)
  })

  it('credits at most 60 seconds a beat, and listening only while narration plays', async () => {
    const { table } = fakeSupabase()
    const clock = { now: NOW }
    const d = deps(clock)
    const first = await handleReadingTime(beat({ read: 3600 }), on, d)
    expect(await first.json()).toEqual({ enabled: true, credited: { read: 60, listen: 0 } })
    clock.now += BEAT_MIN_GAP_MS
    const silent = await handleReadingTime(beat({ read: 0, listen: 60, playing: false }), on, d)
    expect(await silent.json()).toEqual({ enabled: true, credited: { read: 0, listen: 0 } })
    clock.now += BEAT_MIN_GAP_MS
    const playing = await handleReadingTime(beat({ read: 0, listen: 60, playing: true }), on, d)
    expect(await playing.json()).toEqual({ enabled: true, credited: { read: 0, listen: 60 } })
    expect(table.find(row => row.book_id === 'frankenstein')).toMatchObject({ read_seconds: 60, listen_seconds: 60 })
  })

  it('stops at 16 hours in a reader-local day', async () => {
    const { table } = fakeSupabase()
    table.push({ user_id: userId, day: '2026-10-07', book_id: 'odyssey', read_seconds: DAILY_CAP_SECONDS - 20, listen_seconds: 0 })
    const clock = { now: NOW }
    const d = deps(clock)
    const near = await handleReadingTime(beat(), on, d)
    expect(await near.json()).toEqual({ enabled: true, credited: { read: 20, listen: 0 } })
    clock.now += BEAT_MIN_GAP_MS
    const full = await handleReadingTime(beat(), on, d)
    expect(await full.json()).toEqual({ enabled: true, credited: { read: 0, listen: 0 } })
    // The next local day starts afresh.
    clock.now += BEAT_MIN_GAP_MS
    const tomorrow = await handleReadingTime(beat({ day: '2026-10-08' }), on, d)
    expect(await tomorrow.json()).toEqual({ enabled: true, credited: { read: 60, listen: 0 } })
  })

  it('refuses a day that is not the reader’s today', async () => {
    fakeSupabase()
    expect((await handleReadingTime(beat({ day: '2026-09-01' }), on, deps({ now: NOW }))).status).toBe(400)
  })
})

describe('the one-time merge of yearly totals', () => {
  const yearly = { 2026: { v: 1, year: 2026, devices: { phone: { seconds: 3600, pages: 10, books: ['odyssey'] }, desk: { seconds: 1800, pages: 2, books: [] } } } }

  it('adds the reading-year total once, however often and however concurrently it is asked', async () => {
    const { table } = fakeSupabase({ yearly })
    const clock = { now: NOW }
    const d = deps(clock)
    await Promise.all([handleReadingTime(get('/api/reading-time'), on, d), handleReadingTime(get('/api/reading-time'), on, d), handleReadingTime(beat(), on, d)])
    clock.now += BEAT_MIN_GAP_MS
    await handleReadingTime(beat(), on, d)
    const response = await handleReadingTime(get('/api/reading-time'), on, d)
    const { rows } = await response.json() as { rows: Array<{ day: string; bookId: string; read: number; listen: number }> }
    const earlier = rows.filter(row => row.bookId === EARLIER_BOOK_ID)
    expect(earlier).toEqual([{ day: '2026-09-30', bookId: EARLIER_BOOK_ID, read: 5400, listen: 0 }])
    expect(rows.reduce((sum, row) => sum + row.read + row.listen, 0)).toBe(5400 + 120)
    expect(table.filter(row => row.book_id === EARLIER_BOOK_ID)).toHaveLength(1)
  })

  it('records an empty tally as merged, so a later tally write is never added on top', async () => {
    const { table } = fakeSupabase()
    await handleReadingTime(get('/api/reading-time'), on, deps({ now: NOW }))
    expect(table).toEqual([{ user_id: userId, day: '2026-09-30', book_id: EARLIER_BOOK_ID, read_seconds: 0, listen_seconds: 0 }])
  })

  it('flushes signed-out and offline time once per flush id', async () => {
    const { table } = fakeSupabase({ yearly })
    const d = deps({ now: NOW })
    const body = { flushId: 'flush-0001', entries: [{ day: '2026-10-06', bookId: 'odyssey', read: 600, listen: 0 }], earlier: 900 }
    const first = await handleReadingTime(post('/api/reading-time/flush', body), on, d)
    expect(await first.json()).toEqual({ enabled: true, credited: 1500 })
    const again = await handleReadingTime(post('/api/reading-time/flush', body), on, d)
    expect(await again.json()).toEqual({ enabled: true, credited: 0, repeat: true })
    expect(table.find(row => row.book_id === 'odyssey')?.read_seconds).toBe(600)
    // The signed-out tally joins the merged yearly total, after it, never instead of it.
    expect(table.find(row => row.book_id === EARLIER_BOOK_ID)?.read_seconds).toBe(5400 + 900)
  })
})

describe('a reader’s own books', () => {
  it('a beat or flush naming an own book (userbook-<hex>) is recorded under the private bucket, never the id', async () => {
    const { table, calls } = fakeSupabase()
    const clock = { now: NOW }
    const d = deps(clock)
    expect((await handleReadingTime(beat({ bookId: 'private' }), on, d)).status).toBe(200)
    clock.now += BEAT_MIN_GAP_MS
    expect((await handleReadingTime(beat({ bookId: 'userbook-0123456789abcdef01234567' }), on, d)).status).toBe(200)
    const flush = { flushId: 'flush-own-1', entries: [
      { day: '2026-10-06', bookId: 'userbook-0123456789abcdef01234567', read: 300, listen: 0 },
      { day: '2026-10-06', bookId: 'userbook-fedcba9876543210fedcba98', read: 0, listen: 200 },
      { day: '2026-10-06', bookId: 'pd-en-abc', read: 100, listen: 0 },
    ], earlier: 0 }
    expect((await handleReadingTime(post('/api/reading-time/flush', flush), on, d)).status).toBe(200)
    expect(table.find(row => row.day === '2026-10-07' && row.book_id === 'private')?.read_seconds).toBe(120)
    expect(table.find(row => row.day === '2026-10-06' && row.book_id === 'private')).toMatchObject({ read_seconds: 300, listen_seconds: 200 })
    // Added public-domain books keep their own id.
    expect(table.find(row => row.book_id === 'pd-en-abc')?.read_seconds).toBe(100)
    expect(JSON.stringify(table)).not.toContain('userbook-')
    expect(calls.join('\n')).not.toContain('userbook-')
    // The reader's own summary carries the bucket, not the id.
    const summary = await (await handleReadingTime(get('/api/reading-time'), on, d)).json() as { rows: Array<{ bookId: string }> }
    expect(summary.rows.map(row => row.bookId)).toContain('private')
  })
})

describe('before the migration has run', () => {
  it('answers 503 on every ledger route and never throws', async () => {
    fakeSupabase({ missing: true })
    const clock = { now: NOW }
    for (const request of [beat(), get('/api/reading-time'), post('/api/reading-time/flush', { flushId: 'abcdefgh12', entries: [] }), post('/api/reading-time/card', { today: '2026-10-07' })]) {
      const response = await handleReadingTime(request, { ...on, ASSETS: { fetch: async () => new Response('') } }, deps(clock))
      expect(response.status).toBe(503)
      expect(await response.json()).toEqual({ enabled: true, error: 'unavailable' })
      clock.now += BEAT_MIN_GAP_MS
    }
  })
})
