import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleAdminDeleteUser, handleAdminExportUser, type AdminAccountsEnv } from './worker/routes/adminAccounts'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'

const userId = '11111111-1111-4111-8111-111111111111'
const email = 'reader@example.com'
const device = 'device-abc12345'
const otherUser = '22222222-2222-4222-8222-222222222222'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/**
 * In-memory stand-in for Supabase REST + Auth admin, Stripe, KV, both
 * Durable Objects and the USER_BOOKS bucket (2 objects per list page, so
 * purging the reader's 3 files takes more than one page). Every mutating call is appended to `log` so tests can
 * assert ordering.
 */
function world(options: { stripeCustomer?: boolean; failIssueDelete?: boolean } = {}) {
  const log: string[] = []
  const state = {
    authUser: { id: userId, email: 'Reader@Example.com', created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-09-01T00:00:00Z', user_metadata: { name: 'R' }, app_metadata: { provider: 'email' }, identities: [{ provider: 'email', created_at: '2026-01-01T00:00:00Z' }] } as Record<string, unknown> | null,
    tables: {
      profiles: [{ id: userId, email, stripe_customer_id: options.stripeCustomer ? 'cus_Test1' : null }],
      user_data: [{ user_id: userId, key: 'tinct:highlights', value: { a: 1 } }],
      user_data_audit: [{ id: 'a1', user_id: userId, key: 'k' }],
      token_usage: [{ id: 't1', user_id: userId }],
      payments: [{ id: 'p1', user_id: userId }],
      reading_memory_sessions: [{ user_id: userId, session_id: 's1' }],
      analytics_events: [
        { id: 'e1', user_id: userId, payload: { device_id: device } },
        { id: 'e2', user_id: null, payload: { device_id: device } },
        { id: 'e3', user_id: null, payload: { device_id: 'someone-else-device' } },
        { id: 'e4', user_id: userId, payload: { device_id: `server-${userId}` } },
      ],
      issue_reports: [{ id: 'i1', user_id: userId }],
      ai_usage_events: [{ id: 1, user_id: userId }],
      site_admins: [] as Record<string, unknown>[],
    } as Record<string, Record<string, unknown>[]>,
    customerDeleted: false,
    subscriptions: [{ id: 'sub_Live1', status: 'active' }, { id: 'sub_Old1', status: 'canceled' }],
  }

  const cascade = () => {
    for (const table of ['profiles', 'user_data', 'user_data_audit', 'token_usage', 'payments', 'reading_memory_sessions', 'site_admins']) {
      state.tables[table] = state.tables[table].filter(row => row.user_id !== userId && row.id !== userId)
    }
    for (const table of ['analytics_events', 'issue_reports', 'ai_usage_events']) {
      state.tables[table] = state.tables[table].map(row => row.user_id === userId ? { ...row, user_id: null } : row)
    }
  }

  const matches = (row: Record<string, unknown>, params: URLSearchParams) => {
    for (const [key, raw] of params) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue
      const value = key === 'payload->>device_id' ? (row.payload as Record<string, unknown>)?.device_id : row[key]
      if (raw.startsWith('eq.') && String(value).toLowerCase() !== raw.slice(3).toLowerCase()) return false
      if (raw === 'is.null' && value !== null) return false
      if (raw.startsWith('in.(') && !raw.slice(4, -1).split(',').includes(String(value))) return false
    }
    return true
  }

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    const method = init?.method ?? 'GET'
    if (url.hostname === 'example.supabase.co' && url.pathname.startsWith('/auth/v1/admin/users/')) {
      if (method === 'DELETE') {
        log.push('auth:delete')
        if (!state.authUser) return json({ msg: 'User not found' }, 404)
        state.authUser = null
        cascade()
        return json({})
      }
      return state.authUser ? json(state.authUser) : json({ msg: 'User not found' }, 404)
    }
    if (url.hostname === 'example.supabase.co' && url.pathname.startsWith('/rest/v1/')) {
      const table = url.pathname.slice('/rest/v1/'.length)
      const rows = state.tables[table] ?? []
      if (method === 'DELETE') {
        log.push(`rest:delete:${table}${url.searchParams.get('user_id') === 'is.null' ? ':device' : ''}`)
        if (table === 'issue_reports' && options.failIssueDelete) return json({ message: 'boom' }, 500)
        state.tables[table] = rows.filter(row => !matches(row, url.searchParams))
        return new Response(null, { status: 204 })
      }
      const select = url.searchParams.get('select')
      const found = rows.filter(row => matches(row, url.searchParams))
      if (Number(url.searchParams.get('offset') ?? 0) > 0) return json([])
      if (select === 'device_id:payload->>device_id') return json(found.map(row => ({ device_id: (row.payload as Record<string, unknown>)?.device_id })))
      return json(found)
    }
    if (url.hostname === 'api.stripe.com') {
      const path = url.pathname.replace('/v1/', '')
      if (path === 'customers/search') {
        return json({ data: options.stripeCustomer && !state.customerDeleted ? [{ id: 'cus_Test1' }] : [] })
      }
      if (path === 'subscriptions' && method === 'GET') return json({ data: state.subscriptions })
      if (path.startsWith('subscriptions/') && method === 'DELETE') {
        log.push(`stripe:cancel:${path.split('/')[1]}`)
        state.subscriptions = state.subscriptions.map(sub => sub.id === path.split('/')[1] ? { ...sub, status: 'canceled' } : sub)
        return json({})
      }
      if (path === 'customers/cus_Test1' && method === 'DELETE') {
        log.push('stripe:delete-customer')
        if (state.customerDeleted) return json({ error: { code: 'resource_missing' } }, 404)
        state.customerDeleted = true
        return json({ id: 'cus_Test1', deleted: true })
      }
      if (path === 'customers/cus_Test1') return json(state.customerDeleted ? { id: 'cus_Test1', deleted: true } : { id: 'cus_Test1', email, created: 1 })
      if (path === 'invoices') return json({ data: [{ id: 'in_1', number: 'A-1', status: 'paid', created: 2, amount_paid: 300, currency: 'usd' }] })
    }
    throw new Error(`unexpected fetch ${method} ${url}`)
  })

  const kvStore = new Map<string, string>([
    [`lab-chat-history:${userId}`, JSON.stringify({ threads: ['hello'] })],
    [`lab-position:${userId}`, JSON.stringify({ owner: userId })],
  ])
  const kv = {
    get: vi.fn(async (key: string) => kvStore.has(key) ? JSON.parse(kvStore.get(key)!) : null),
    delete: vi.fn(async (key: string) => { log.push(`kv:delete:${key.split(':')[0]}`); kvStore.delete(key) }),
  }
  const doState = { position: { position: { owner: userId } } as Record<string, unknown>, recap: { queue: { entries: {} }, owner: userId } as Record<string, unknown> }
  const namespace = (name: 'position' | 'recap') => ({
    getByName: vi.fn((id: string) => {
      expect(id).toBe(userId)
      return {
        exportState: vi.fn(async () => doState[name]),
        purge: vi.fn(async () => { log.push(`do:purge:${name}`); doState[name] = {} }),
      }
    }),
  })
  const userBooks = fakeUserBooksBucket({ pageSize: 2, log })
  const book = (owner: string, n: number, name: string, size: number) => {
    const id = n.toString(16).padStart(32, '0')
    userBooks.objects.set(`u/${owner}/${id}`, {
      key: `u/${owner}/${id}`, bytes: new Uint8Array(size), uploaded: new Date('2026-10-05T00:00:00Z'),
      customMetadata: { name: encodeURIComponent(name), title: encodeURIComponent(name.replace(/\.\w+$/, '')), author: '', type: name.endsWith('.epub') ? 'epub' : 'pdf', sha256: id.repeat(2), createdAt: `2026-10-0${n}T00:00:00.000Z` },
    })
  }
  book(userId, 1, 'Notes.pdf', 10)
  book(userId, 2, 'Kapitel ø.epub', 20)
  book(userId, 3, 'Slides.pdf', 30)
  book(otherUser, 4, 'Theirs.pdf', 40)
  // Own-book narration: recordings beside the files, and one spend object per account.
  const ownNarration = { spend: [{ day: '2026-10-07', bytes: 1200 }] as { day: string; bytes: number }[], purged: [] as string[] }
  const narrationObject = (owner: string, name: string, size: number) => userBooks.objects.set(`u/${owner}/narration/${'ab'.repeat(12)}/${name}`, {
    key: `u/${owner}/narration/${'ab'.repeat(12)}/${name}`, bytes: new Uint8Array(size), uploaded: new Date('2026-10-07T00:00:00Z'), customMetadata: {},
  })
  const env = {
    USER_BOOKS: userBooks.bucket,
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    STRIPE_SECRET_KEY: 'stripe-test',
    RATE_LIMIT: kv,
    READER_POSITION: namespace('position'),
    RECAP_PREPARATION: namespace('recap'),
    NARRATION_COORDINATOR: {
      getByName: vi.fn((name: string) => {
        expect(name).toBe(`own-user:${userId}`)
        return {
          usage: vi.fn(async () => ownNarration.spend),
          purge: vi.fn(async () => { ownNarration.purged.push(name); ownNarration.spend = [] }),
        }
      }),
    },
    SHARE_STORE: {
      getByName: vi.fn((name: string) => {
        expect(name).toBe('shares')
        return { forgetCreator: vi.fn(async (id: string) => { expect(id).toBe(userId); log.push('do:share-forget'); return 0 }) }
      }),
    },
  } as unknown as AdminAccountsEnv
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  return { env, log, state, kvStore, doState, fetchMock, options, userBooks, ownNarration, narrationObject }
}

function post(path: string, body: unknown): Request {
  return new Request(`https://tinct.app${path}`, { method: 'POST', body: JSON.stringify(body), headers: { Authorization: 'Bearer admin' } })
}
const admin = async () => true

describe('admin account routes', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

  it('refuses non-admins and non-POST before touching any data', async () => {
    const w = world()
    for (const handler of [handleAdminExportUser, handleAdminDeleteUser]) {
      const forbidden = await handler(post('/api/admin/x', { userId, confirmEmail: email }), w.env, async () => false)
      expect(forbidden.status).toBe(403)
      const get = await handler(new Request('https://tinct.app/api/admin/x'), w.env, admin)
      expect(get.status).toBe(405)
      const unconfigured = await handler(post('/api/admin/x', { userId }), {} as AdminAccountsEnv, admin)
      expect(unconfigured.status).toBe(500)
    }
    expect(w.fetchMock).not.toHaveBeenCalled()
    expect(w.log).toEqual([])
  })

  it('refuses deletion unless confirmEmail matches the account email', async () => {
    const w = world()
    const missing = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId }), w.env, admin)
    expect(missing.status).toBe(400)
    const wrong = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: 'someone@example.com' }), w.env, admin)
    expect(wrong.status).toBe(400)
    expect(await wrong.json()).toEqual({ error: 'confirmEmail does not match the account' })
    const byEmailOnly = await handleAdminDeleteUser(post('/api/admin/delete-user', { email, confirmEmail: email }), w.env, admin)
    expect(byEmailOnly.status).toBe(400)
    expect(w.log).toEqual([])
    expect(w.state.authUser).not.toBeNull()
  })

  it('deletes in order: Durable Objects, KV, orphan-prone rows, Stripe, then the auth user', async () => {
    const w = world({ stripeCustomer: true })
    const res = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: '  READER@example.com ' }), w.env, admin)
    const body = await res.json() as { ok: boolean; steps: { step: string; status: string }[] }
    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.steps.filter(s => s.status === 'failed')).toEqual([])
    const auth = w.log.indexOf('auth:delete')
    expect(w.log.slice(0, auth + 1)).toEqual([
      'do:purge:recap',
      'do:purge:position',
      'do:share-forget',
      'kv:delete:lab-chat-history',
      'kv:delete:lab-position',
      'r2:delete:user-books',
      'r2:delete:user-books',
      'rest:delete:analytics_events:device',
      'rest:delete:analytics_events',
      'rest:delete:issue_reports',
      'rest:delete:ai_usage_events',
      'stripe:cancel:sub_Live1',
      'stripe:delete-customer',
      'auth:delete',
    ])
    // Post-delete sweep (nothing left under the reader's prefix, so no R2 delete), then the cascade check.
    expect(w.log.slice(auth + 1)).toEqual(['do:purge:recap', 'do:purge:position', 'do:share-forget', 'kv:delete:lab-chat-history', 'kv:delete:lab-position'])
    expect(body.steps.filter(s => s.step.endsWith('r2:user-books')).map(s => [s.step, s.status])).toEqual([['r2:user-books', 'ok'], ['sweep:r2:user-books', 'ok']])
    // Every file under u/{userId}/ is gone, across list pages; another reader's file stays.
    expect([...w.userBooks.objects.keys()]).toEqual([`u/${otherUser}/${'4'.padStart(32, '0')}`])
    expect(body.steps[body.steps.length - 1]).toEqual({ step: 'verify:cascade', status: 'ok' })
    // No SET NULL orphans; another device's anonymous rows are untouched.
    expect(w.state.tables.analytics_events.map(row => row.id)).toEqual(['e3'])
    expect(w.state.tables.issue_reports).toEqual([])
    expect(w.state.tables.ai_usage_events).toEqual([])
    expect(w.state.tables.user_data).toEqual([])
    expect(w.kvStore.size).toBe(0)
  })

  it('keeps the auth user when an earlier step fails, and a re-run finishes the job', async () => {
    const w = world({ failIssueDelete: true })
    const first = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    const firstBody = await first.json() as { ok: boolean; steps: { step: string; status: string }[] }
    expect(first.status).toBe(500)
    expect(firstBody.steps.find(s => s.step === 'supabase:issue_reports')?.status).toBe('failed')
    expect(firstBody.steps.find(s => s.step === 'auth:delete-user')?.status).toBe('skipped')
    expect(w.log).not.toContain('auth:delete')
    expect(w.state.authUser).not.toBeNull()

    w.options.failIssueDelete = false // the outage clears
    const second = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    expect(second.status).toBe(200)
    expect((await second.json() as { ok: boolean }).ok).toBe(true)
    expect(w.state.authUser).toBeNull()

    // A third run after full deletion is harmless: it only re-clears leftovers.
    const third = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    const thirdBody = await third.json() as { ok: boolean; accountAlreadyDeleted: boolean; steps: { step: string; status: string; detail?: string }[] }
    expect(third.status).toBe(200)
    expect(thirdBody.ok).toBe(true)
    expect(thirdBody.accountAlreadyDeleted).toBe(true)
    expect(thirdBody.steps.find(s => s.step === 'auth:delete-user')).toEqual({ step: 'auth:delete-user', status: 'skipped', detail: 'auth user already deleted' })
  })

  it('keeps the auth user when the USER_BOOKS bucket is not bound, so the files are never orphaned', async () => {
    const w = world()
    delete (w.env as { USER_BOOKS?: unknown }).USER_BOOKS
    const res = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    const body = await res.json() as { ok: boolean; steps: { step: string; status: string; detail?: string }[] }
    expect(res.status).toBe(500)
    expect(body.steps.find(s => s.step === 'r2:user-books')).toEqual({ step: 'r2:user-books', status: 'failed', detail: 'USER_BOOKS binding missing' })
    expect(body.steps.find(s => s.step === 'auth:delete-user')?.status).toBe('skipped')
    expect(w.state.authUser).not.toBeNull()
    const exported = await (await handleAdminExportUser(post('/api/admin/export-user', { userId }), w.env, admin)).json() as Record<string, any>
    expect(exported.complete).toBe(false)
    expect(exported.errors).toContain('r2: USER_BOOKS binding missing')
  })

  it('treats an already-deleted Stripe customer as done', async () => {
    const w = world({ stripeCustomer: true })
    w.state.customerDeleted = true
    const res = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    const body = await res.json() as { ok: boolean; steps: { step: string; status: string }[] }
    expect(body.ok).toBe(true)
    expect(body.steps.find(s => s.step === 'stripe:cus_Test1')?.status).toBe('ok')
  })

  it('exports every store for the account, looked up by email, without changing anything', async () => {
    const w = world({ stripeCustomer: true })
    const res = await handleAdminExportUser(post('/api/admin/export-user', { email: 'Reader@Example.com' }), w.env, admin)
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const body = await res.json() as Record<string, any>
    expect(body.complete).toBe(true)
    expect(body.errors).toEqual([])
    expect(body.userId).toBe(userId)
    expect(body.auth).toMatchObject({ id: userId, created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-09-01T00:00:00Z', user_metadata: { name: 'R' } })
    expect(Object.keys(body.supabase).sort()).toEqual([
      'ai_usage_events', 'analytics_events', 'analytics_events_device_anonymous', 'issue_reports', 'payments', 'profiles',
      'reading_memory_sessions', 'site_admins', 'token_usage', 'user_data', 'user_data_audit',
    ])
    expect(body.supabase.user_data).toEqual([{ user_id: userId, key: 'tinct:highlights', value: { a: 1 } }])
    expect(body.supabase.analytics_events.map((row: { id: string }) => row.id)).toEqual(['e1', 'e4'])
    expect(body.supabase.analytics_events_device_anonymous.map((row: { id: string }) => row.id)).toEqual(['e2'])
    expect(body.kv).toEqual({ labChatHistory: { threads: ['hello'] }, labPosition: { owner: userId } })
    expect(body.durableObjects).toEqual({ readerPosition: { position: { owner: userId } }, recapPreparation: { queue: { entries: {} }, owner: userId } })
    // Own uploaded books are listed (name, size, dates) across list pages, never their bytes or another reader's.
    expect(body.r2.userBooks).toEqual([
      { id: '3'.padStart(32, '0'), name: 'Slides.pdf', title: 'Slides', author: '', type: 'pdf', size: 30, createdAt: '2026-10-03T00:00:00.000Z' },
      { id: '2'.padStart(32, '0'), name: 'Kapitel ø.epub', title: 'Kapitel ø', author: '', type: 'epub', size: 20, createdAt: '2026-10-02T00:00:00.000Z' },
      { id: '1'.padStart(32, '0'), name: 'Notes.pdf', title: 'Notes', author: '', type: 'pdf', size: 10, createdAt: '2026-10-01T00:00:00.000Z' },
    ])
    expect(w.userBooks.objects.size).toBe(4)
    expect(body.stripe.customers[0]).toMatchObject({ id: 'cus_Test1', subscriptions: [{ id: 'sub_Live1', status: 'active' }, { id: 'sub_Old1', status: 'canceled' }], invoices: [{ id: 'in_1' }] })
    // Read-only: no deletes anywhere.
    expect(w.log).toEqual([])
    expect(w.fetchMock.mock.calls.every(([, init]) => (init?.method ?? 'GET') === 'GET')).toBe(true)
  })

  it('covers the reader\'s synced highlight rows (user_data lab-highlights:{bookId}) in export and deletion', async () => {
    const highlightsRow = { user_id: userId, key: 'lab-highlights:emma', value: { v: 1, highlights: [{ id: 'hl-1', bookId: 'emma', note: 'mine' }], deleted: [{ id: 'hl-0', bookId: 'emma', deletedAt: 1 }] } }
    const someoneElse = { user_id: '22222222-2222-4222-8222-222222222222', key: 'lab-highlights:emma', value: { v: 1, highlights: [], deleted: [] } }
    const w = world()
    w.state.tables.user_data.push(highlightsRow, someoneElse)
    const exported = await (await handleAdminExportUser(post('/api/admin/export-user', { userId }), w.env, admin)).json() as Record<string, any>
    expect(exported.supabase.user_data).toContainEqual(highlightsRow)
    expect(exported.supabase.user_data).not.toContainEqual(someoneElse)
    const deleted = await (await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)).json() as { ok: boolean }
    expect(deleted.ok).toBe(true)
    expect(w.state.tables.user_data).toEqual([someoneElse])
  })

  it('exports and deletes own-book narration: the recordings under u/{userId}/narration/ and the spend object', async () => {
    const w = world()
    w.narrationObject(userId, `${'c'.repeat(64)}.mp3`, 900)
    w.narrationObject(userId, `${'c'.repeat(64)}.json`, 100)
    w.narrationObject(otherUser, `${'d'.repeat(64)}.mp3`, 900)
    const exported = await (await handleAdminExportUser(post('/api/admin/export-user', { userId }), w.env, admin)).json() as Record<string, any>
    expect(exported.complete).toBe(true)
    expect(exported.r2.ownBookNarration).toEqual({ objects: 2, bytes: 1000 })
    expect(exported.ownBookNarrationSpend).toEqual([{ day: '2026-10-07', bytes: 1200 }])
    // Recordings are not books: the file listing is unchanged.
    expect(exported.r2.userBooks).toHaveLength(3)
    const deleted = await (await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)).json() as { ok: boolean; steps: { step: string; status: string }[] }
    expect(deleted.ok).toBe(true)
    expect(deleted.steps.find(s => s.step === 'do:own-book-narration')?.status).toBe('ok')
    expect(w.ownNarration.purged).toContain(`own-user:${userId}`)
    expect([...w.userBooks.objects.keys()].filter(key => key.startsWith(`u/${userId}/`))).toEqual([])
    // Another reader's recordings stay.
    expect([...w.userBooks.objects.keys()].filter(key => key.startsWith(`u/${otherUser}/narration/`))).toHaveLength(1)
  })

  it('exports a count of own-book Catch me up recaps (never their text) and deletes them with the account', async () => {
    const w = world()
    const recap = (owner: string, name: string, size: number) => w.userBooks.objects.set(`u/${owner}/recaps/${'ab'.repeat(12)}/own-catch-up-v1/${name}`, {
      key: `u/${owner}/recaps/${'ab'.repeat(12)}/own-catch-up-v1/${name}`, bytes: new Uint8Array(size), uploaded: new Date('2026-10-07T00:00:00Z'), customMetadata: {},
    })
    recap(userId, 'c1.json', 300)
    recap(userId, 'current.json', 200)
    recap(otherUser, 'c1.json', 300)
    const exported = await (await handleAdminExportUser(post('/api/admin/export-user', { userId }), w.env, admin)).json() as Record<string, any>
    expect(exported.complete).toBe(true)
    expect(exported.r2.ownBookRecaps).toEqual({ objects: 2, bytes: 500 })
    expect(exported.r2.userBooks).toHaveLength(3)
    const deleted = await (await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)).json() as { ok: boolean }
    expect(deleted.ok).toBe(true)
    expect([...w.userBooks.objects.keys()].filter(key => key.startsWith(`u/${userId}/`))).toEqual([])
    expect([...w.userBooks.objects.keys()].filter(key => key.startsWith(`u/${otherUser}/recaps/`))).toHaveLength(1)
  })

  it('keeps the auth user when the narration coordinator is not bound, so the spend record is never orphaned', async () => {
    const w = world()
    delete (w.env as { NARRATION_COORDINATOR?: unknown }).NARRATION_COORDINATOR
    const res = await handleAdminDeleteUser(post('/api/admin/delete-user', { userId, confirmEmail: email }), w.env, admin)
    const body = await res.json() as { ok: boolean; steps: { step: string; status: string; detail?: string }[] }
    expect(body.ok).toBe(false)
    expect(body.steps.find(s => s.step === 'do:own-book-narration')).toEqual({ step: 'do:own-book-narration', status: 'failed', detail: 'NARRATION_COORDINATOR binding missing' })
    expect(w.state.authUser).not.toBeNull()
  })

  it('reports an unknown account as 404', async () => {
    const w = world()
    w.state.authUser = null
    w.state.tables.profiles = []
    const res = await handleAdminExportUser(post('/api/admin/export-user', { email: 'nobody@example.com' }), w.env, admin)
    expect(res.status).toBe(404)
  })
})
