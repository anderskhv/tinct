import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import { handleSocial, runLeaderboardCron, serveProfilePage, withAddedBooks, type SocialDeps } from './worker/routes/social'
import { handleProfiles } from './worker/routes/profiles'
import type { AccountRow, ProfileStore, PublicCardRow, ReaderProfileRow } from './worker/lib/profileStore'
import type { AdminProfileRow, LedgerDayRow, ReportRow, SocialStore } from './worker/lib/socialStore'
import { effectiveVisibility } from './social/profileRules'
import { leaderboardWindow, rankRows, windowSeconds, type BoardCard } from './social/socialRules'
import type { LedgerRow } from './readingTime/model'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const C = '33333333-3333-4333-8333-333333333333'
const D = '44444444-4444-4444-8444-444444444444'
const E = '55555555-5555-4555-8555-555555555555'
const NAMES: Record<string, string> = { [A]: 'Anders', [B]: 'Bea', [C]: 'Carl', [D]: 'Dora', [E]: 'Erik' }

const NOW = Date.parse('2026-10-14T12:00:00Z')
const on = { SOCIAL_PROFILES: '1', SOCIAL_FRIENDS: '1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }

function day(offset: number): string {
  return new Date(NOW + offset * 86_400_000).toISOString().slice(0, 10)
}

/** reader_profiles, profiles, follows, blocks, reading_time, the 7-day cache and reports, in memory, as the SQL defines them. */
class World implements ProfileStore, SocialStore {
  profiles = new Map<string, ReaderProfileRow & { hidden_at: string | null }>()
  accounts = new Map<string, AccountRow>()
  follows: [string, string][] = []
  blocks: [string, string][] = []
  ledger: LedgerDayRow[] = []
  board = new Map<string, number>()
  refreshedAt: string | null = null
  refreshes = 0
  reports: ReportRow[] = []
  now = NOW

  add(id: string, over: Partial<ReaderProfileRow> = {}, confirmed = true) {
    this.profiles.set(id, {
      id, display_name: NAMES[id], handle: NAMES[id].toLowerCase(), picture_kind: 'initial', picture_value: null, picture_review: 'none',
      background_kind: 'library', background_value: null, background_review: 'none', visibility: 'everyone', show_reading: true, show_time: true,
      on_leaderboard: true, new_books_open_in: 'modern', auto_created: false, set_up_at: '2026-10-01T00:00:00Z', prompted_at: null, hidden_at: null, ...over,
    })
    this.accounts.set(id, { email_opt_in: false, email_confirmed_at: confirmed ? '2026-10-01T00:00:00Z' : null, email_consent_version: null })
  }
  read(id: string, offset: number, minutes: number, bookId = 'frankenstein') {
    this.ledger.push({ user_id: id, day: day(offset), book_id: bookId, read_seconds: minutes * 60, listen_seconds: 0 })
  }
  befriend(x: string, y: string) { this.follows.push([x, y], [y, x]) }

  /** public_profile_cards */
  card(row: ReaderProfileRow & { hidden_at: string | null }): PublicCardRow | null {
    if (row.visibility === 'only_me' || row.hidden_at) return null
    const stored = (row.picture_kind === 'upload' || row.picture_kind === 'google') && row.picture_review !== 'approved'
    const bg = row.background_kind === 'upload' && row.background_review !== 'approved'
    return {
      id: row.id, handle: row.handle, display_name: row.display_name,
      picture_kind: stored ? 'initial' : row.picture_kind, picture_value: stored ? null : row.picture_value,
      background_kind: bg ? 'library' : row.background_kind, background_value: bg ? null : row.background_value,
      visibility: effectiveVisibility(row.visibility, Boolean(this.accounts.get(row.id)?.email_confirmed_at)),
      show_reading: row.show_reading, show_time: row.show_time, on_leaderboard: row.on_leaderboard,
    }
  }
  cards(): PublicCardRow[] { return [...this.profiles.values()].map(row => this.card(row)).filter(Boolean) as PublicCardRow[] }

  // ProfileStore
  async getOwn(id: string) { const row = this.profiles.get(id); if (!row) return null; const { hidden_at: _hidden, ...own } = row; return own }
  async getAccount(id: string) { return this.accounts.get(id) ?? null }
  async takenHandles(candidates: string[]) { return new Set([...this.profiles.values()].map(row => row.handle).filter(handle => candidates.includes(handle))) }
  async create(row: ReaderProfileRow) { this.profiles.set(row.id, { ...row, hidden_at: null }); return 'ok' as const }
  async update(id: string, patch: Partial<ReaderProfileRow>) { this.profiles.set(id, { ...this.profiles.get(id)!, ...patch }); return 'ok' as const }
  async updateAccount(id: string, patch: Partial<AccountRow>) { this.accounts.set(id, { ...this.accounts.get(id)!, ...patch }) }
  async getCardByHandle(handle: string) { const row = [...this.profiles.values()].find(item => item.handle === handle); return row ? this.card(row) : null }
  async getCardById(id: string) { const row = this.profiles.get(id); return row ? this.card(row) : null }
  async relation(viewer: string, owner: string) {
    return {
      viewerFollowsOwner: this.follows.some(([f, t]) => f === viewer && t === owner),
      ownerFollowsViewer: this.follows.some(([f, t]) => f === owner && t === viewer),
      blocked: this.blocks.some(([x, y]) => (x === viewer && y === owner) || (x === owner && y === viewer)),
    }
  }

  // SocialStore
  async following(id: string) { return this.follows.filter(([f]) => f === id).map(([, t]) => t) }
  async followers(id: string) { return this.follows.filter(([, t]) => t === id).map(([f]) => f) }
  async blockedEitherWay(id: string) { return new Set(this.blocks.filter(([x, y]) => x === id || y === id).map(([x, y]) => (x === id ? y : x))) }
  async blockedByMe(id: string) { return this.blocks.filter(([x]) => x === id).map(([, y]) => y) }
  async follow(f: string, t: string) { if (!this.follows.some(([x, y]) => x === f && y === t)) this.follows.push([f, t]) }
  async unfollow(f: string, t: string) { this.follows = this.follows.filter(([x, y]) => !(x === f && y === t)) }
  async block(x: string, y: string) {
    if (!this.blocks.some(([a, b]) => a === x && b === y)) this.blocks.push([x, y])
    this.follows = this.follows.filter(([f, t]) => !((f === x && t === y) || (f === y && t === x)))
  }
  async unblock(x: string, y: string) { this.blocks = this.blocks.filter(([a, b]) => !(a === x && b === y)) }
  async cardsByIds(ids: string[]) { return this.cards().filter(card => ids.includes(card.id)) as BoardCard[] }
  async searchEveryone(query: { kind: 'handle'; handle: string } | { kind: 'name'; text: string }) {
    return this.cards().filter(card => card.visibility === 'everyone' && (query.kind === 'handle'
      ? card.handle === query.handle
      : card.display_name.toLowerCase().includes(query.text.toLowerCase()) || card.handle.includes(query.text.toLowerCase()))) as BoardCard[]
  }
  async everyoneBoardCards() { return this.cards().filter(card => card.visibility === 'everyone' && card.on_leaderboard && card.show_time) as BoardCard[] }
  async boardSeconds(ids: string[]) { return new Map([...this.board].filter(([id]) => ids.includes(id))) }
  async boardRefreshedAt() { return this.refreshedAt }
  async refreshBoard() { this.refreshes++; this.board = windowSeconds(this.ledger, this.now); this.refreshedAt = new Date(this.now).toISOString() }
  async ledgerSince(ids: string[] | null, since: string, bookIds?: string[]) {
    return this.ledger.filter(row => (!ids || ids.includes(row.user_id)) && row.day >= since && (!bookIds || bookIds.includes(row.book_id)))
  }
  async report(row: { reporter: string; reported: string; handle: string; reason: ReportRow['reason'] }) {
    if (this.reports.some(r => r.reporter === row.reporter && r.reported === row.reported && !r.resolved_at)) return 'duplicate' as const
    this.reports.push({ id: this.reports.length + 1, ...row, created_at: new Date(this.now).toISOString(), resolved_at: null, resolution: null })
    return 'ok' as const
  }
  async openReports() { return this.reports.filter(r => !r.resolved_at) }
  async resolveReport(id: number, resolution: string) { const r = this.reports.find(item => item.id === id); if (r) { r.resolved_at = 'now'; r.resolution = resolution } }
  async pendingReviews() { return [...this.profiles.values()].filter(row => row.picture_review === 'pending' || row.background_review === 'pending') as AdminProfileRow[] }
  async adminProfiles(q: string) { return [...this.profiles.values()].filter(row => row.display_name.toLowerCase().includes(q.toLowerCase())) as AdminProfileRow[] }
  async adminProfile(id: string) { return (this.profiles.get(id) ?? null) as AdminProfileRow | null }
  async adminUpdate(id: string, patch: Record<string, unknown>) { this.profiles.set(id, { ...this.profiles.get(id)!, ...patch } as never); return 'ok' as const }
}

const CATALOGUE = new Map([
  ['frankenstein', { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', wordCount: 75000, art: { src: '/lab/library_2/assets/frankenstein.jpg' }, readingStructure: { chapters: Array.from({ length: 24 }, (_, i) => ({ number: i + 1, title: `Chapter ${i + 1}` })) } }],
  ['meditations', { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', wordCount: 60000, art: { src: '/lab/library_2/assets/meditations.jpg' }, readingStructure: { chapters: Array.from({ length: 12 }, (_, i) => ({ number: i + 1, title: `Book ${i + 1}` })) } }],
])

function deps(world: World, extra: Partial<SocialDeps> = {}): SocialDeps {
  return {
    profiles: world, social: world, now: () => world.now,
    verifyUser: async request => {
      const token = request.headers.get('authorization')?.slice(7)
      return token ? { id: token, email: `${token}@example.com` } : null
    },
    verifySiteAdmin: async request => request.headers.get('authorization') === `Bearer ${A}`,
    catalogue: async () => CATALOGUE as never,
    position: async () => null,
    ledger: async id => world.ledger.filter(row => row.user_id === id).map(row => ({ day: row.day, bookId: row.book_id, read: row.read_seconds, listen: row.listen_seconds }) as LedgerRow),
    ...extra,
  }
}

async function api(world: World, path: string, as: string | null, init: RequestInit = {}, extra: Partial<SocialDeps> = {}, env: Record<string, unknown> = on) {
  const headers = new Headers(init.headers)
  if (as) headers.set('authorization', `Bearer ${as}`)
  if (init.body) headers.set('content-type', 'application/json')
  return handleSocial(new Request(`https://tinct.app${path}`, { ...init, headers }), env as never, deps(world, extra))
}

const json = async (response: Response) => response.json() as Promise<Record<string, any>>
const board = async (world: World, as: string, tab: 'friends' | 'everyone') => json(await api(world, `/api/social/board?tab=${tab}`, as))
const names = (data: Record<string, any>) => (data.entries as Array<{ name: string }>).map(entry => entry.name)

function everyoneWorld(): World {
  const world = new World()
  for (const id of [A, B, C, D, E]) world.add(id)
  return world
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('switch off', () => {
  it('every social route is a 404 and nothing is read', async () => {
    const world = everyoneWorld()
    const spy = vi.spyOn(world, 'following')
    for (const env of [{ ...on, SOCIAL_FRIENDS: '0' }, { ...on, SOCIAL_PROFILES: '0' }, { ...on, SOCIAL_FRIENDS: undefined }]) {
      for (const path of ['/api/social/board', '/api/social/find', '/api/social/profile/bea', '/api/admin/social']) {
        expect((await api(world, path, A, {}, {}, env)).status).toBe(404)
      }
    }
    expect(spy).not.toHaveBeenCalled()
  })

  it('the Worker router leaves /@handle, /friends, /admin/social, their assets and the pages exactly as before', async () => {
    const assets = vi.fn(async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.startsWith('/lab/library_2/') || path === '/lab/sign-in/' || path === '/reader') return new Response('<html><head><title>x</title></head><body></body></html>', { headers: { 'content-type': 'text/html' } })
      if (path === '/lab/friends/' || path === '/lab/admin-social/' || path === '/lab/you/') return new Response('<html><head></head><body>page</body></html>', { headers: { 'content-type': 'text/html' } })
      return new Response('Not found', { status: 404 })
    })
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]')))
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const base = { ASSETS: { fetch: assets }, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' }
    for (const vars of [{}, { SOCIAL_FRIENDS: '1' }, { SOCIAL_PROFILES: '1' }, { SOCIAL_FRIENDS: '1', SOCIAL_PROFILES: '0' }]) {
      const env = { ...base, ...vars } as never
      for (const path of ['/@anders', '/friends', '/admin/social', '/lab/friends/', '/lab/admin-social/index.html', '/api/social/board', '/api/admin/social']) {
        const response = await worker.fetch(new Request(`https://tinct.app${path}`), env, ctx)
        expect(response.status, `${path} ${JSON.stringify(vars)}`).toBe(404)
      }
      const library = await worker.fetch(new Request('https://tinct.app/library'), env, ctx)
      expect(await library.text()).not.toContain('tinct-friends')
    }
  })
})

describe('the 7-day window', () => {
  it('counts today and the six days before (plus a reader already in tomorrow), never older days or time from before the ledger', () => {
    const rows = [
      { user_id: A, day: day(0), book_id: 'frankenstein', read_seconds: 600, listen_seconds: 60 },
      { user_id: A, day: day(-6), book_id: 'frankenstein', read_seconds: 600, listen_seconds: 0 },
      { user_id: A, day: day(-7), book_id: 'frankenstein', read_seconds: 9000, listen_seconds: 0 },
      { user_id: A, day: day(1), book_id: 'odyssey', read_seconds: 300, listen_seconds: 0 },
      { user_id: A, day: day(-1), book_id: '_earlier', read_seconds: 99999, listen_seconds: 0 },
      { user_id: B, day: day(-8), book_id: 'odyssey', read_seconds: 600, listen_seconds: 0 },
    ]
    const seconds = windowSeconds(rows, NOW)
    expect(seconds.get(A)).toBe(600 + 60 + 600 + 300)
    expect(seconds.has(B)).toBe(false)
    expect(leaderboardWindow(NOW)).toEqual({ start: day(-6), end: day(1), today: day(0) })
  })

  it('ranks by time in the window; equal times share a rank', () => {
    const ranked = rankRows([{ n: 'b', s: 10 }, { n: 'a', s: 30 }, { n: 'c', s: 10 }, { n: 'd', s: 5 }], r => r.s, r => r.n)
    expect(ranked.map(r => [r.row.n, r.rank])).toEqual([['a', 1], ['b', 2], ['c', 2], ['d', 4]])
  })

  it('a week later the old reading has left the board', async () => {
    const world = everyoneWorld()
    world.read(B, 0, 120); world.read(C, -3, 60); world.read(D, -9, 600); world.read(A, 0, 30)
    const first = await board(world, A, 'everyone')
    expect(names(first)).toEqual(['Bea', 'Carl', 'You'])
    expect(first.me).toMatchObject({ rank: 3, duration: '30 m' })
    world.now = NOW + 4 * 86_400_000
    world.refreshedAt = new Date(NOW).toISOString()
    const later = await board(world, A, 'everyone')
    expect(world.refreshes).toBe(2)
    expect(names(later)).toEqual(['Bea', 'You'])
  })

  it('the board is rebuilt at least hourly: the cron rebuilds in the first run of each hour, a stale board on read', async () => {
    const world = everyoneWorld()
    expect(await runLeaderboardCron(on as never, Date.parse('2026-10-14T13:04:00Z'), world)).toBe(true)
    expect(await runLeaderboardCron(on as never, Date.parse('2026-10-14T13:24:00Z'), world)).toBe(false)
    expect(await runLeaderboardCron({ ...on, SOCIAL_FRIENDS: '0' } as never, Date.parse('2026-10-14T14:04:00Z'), world)).toBe(false)
    expect(world.refreshes).toBe(1)
    world.refreshedAt = new Date(NOW - 30 * 60_000).toISOString()
    await board(world, A, 'friends')
    expect(world.refreshes).toBe(1)
    world.refreshedAt = new Date(NOW - 70 * 60_000).toISOString()
    await board(world, A, 'friends')
    expect(world.refreshes).toBe(2)
  })
})

describe('friends and the Friends board', () => {
  it('friends are mutual follows; a one-way follow is not on the Friends board; your own row always shows', async () => {
    const world = everyoneWorld()
    world.befriend(A, B)
    world.follows.push([A, C])
    world.follows.push([D, A])
    world.read(B, 0, 60); world.read(C, 0, 90); world.read(D, 0, 100)
    const data = await board(world, A, 'friends')
    expect(names(data)).toEqual(['Bea', 'You'])
    expect(data.me).toMatchObject({ rank: 2, self: true, duration: '0 m' })
    const rank = await json(await api(world, '/api/social/rank', A))
    expect(rank).toEqual({ rank: 2, total: 2, seconds: 0 })
  })

  it('shows the book each reader spent most time in, only for readers who show what they read', async () => {
    const world = everyoneWorld()
    world.befriend(A, B); world.befriend(A, C)
    world.profiles.get(C)!.show_reading = false
    world.read(B, 0, 60, 'meditations'); world.read(B, -1, 10, 'frankenstein'); world.read(C, 0, 30, 'frankenstein')
    const data = await board(world, A, 'friends')
    expect(data.entries.map((e: { name: string; book: string | null }) => [e.name, e.book])).toEqual([['Bea', 'Meditations'], ['Carl', null], ['You', null]])
  })
})

describe('the leaderboard is opt-in', () => {
  it('a reader appears only with "appear on the leaderboard" and "show my reading time" on', async () => {
    const world = everyoneWorld()
    world.befriend(A, B); world.befriend(A, C); world.befriend(A, D)
    world.profiles.get(B)!.on_leaderboard = false
    world.profiles.get(C)!.show_time = false
    for (const id of [B, C, D]) world.read(id, 0, 60)
    expect(names(await board(world, A, 'friends'))).toEqual(['Dora', 'You'])
    expect(names(await board(world, A, 'everyone'))).toEqual(['Dora', 'You'])
  })

  it('switching "appear on the leaderboard" off removes you at once (well within the hour)', async () => {
    const world = everyoneWorld()
    world.befriend(A, B)
    world.read(B, 0, 60)
    expect(names(await board(world, A, 'friends'))).toContain('Bea')
    expect(names(await board(world, C, 'everyone'))).toContain('Bea')
    const off = await handleProfiles(new Request('https://tinct.app/api/profile', { method: 'POST', headers: { authorization: `Bearer ${B}`, 'content-type': 'application/json' }, body: JSON.stringify({ onLeaderboard: false }) }), on as never, {
      store: world, verifyUser: async () => ({ id: B, email: 'b@example.com' }),
    })
    expect(off.status).toBe(200)
    // The cache still holds Bea's seconds (it is rebuilt hourly); the board leaves her out now.
    expect(world.board.get(B)).toBe(3600)
    expect(names(await board(world, A, 'friends'))).not.toContain('Bea')
    expect(names(await board(world, C, 'everyone'))).not.toContain('Bea')
  })

  it('the Everyone board lists only Everyone readers with a confirmed email', async () => {
    const world = new World()
    world.add(A); world.add(B); world.add(C, { visibility: 'friends' }); world.add(D, {}, false)
    for (const id of [B, C, D]) world.read(id, 0, 60)
    expect(names(await board(world, A, 'everyone'))).toEqual(['Bea', 'You'])
  })
})

describe('private readers never appear', () => {
  it('Only me and hidden profiles: on no board, in no search, no profile, no follow', async () => {
    const world = everyoneWorld()
    world.profiles.get(B)!.visibility = 'only_me'
    world.profiles.get(C)!.hidden_at = '2026-10-10T00:00:00Z'
    world.befriend(A, B); world.befriend(A, C)
    world.read(B, 0, 60); world.read(C, 0, 60); world.read(A, 0, 60)
    for (const tab of ['friends', 'everyone'] as const) expect(names(await board(world, A, tab))).toEqual(['You'])
    for (const q of ['bea', 'carl', 'tinct.app/@bea', '@carl']) expect((await json(await api(world, `/api/social/find?q=${encodeURIComponent(q)}`, A))).results).toEqual([])
    for (const handle of ['bea', 'carl']) {
      expect((await api(world, `/api/social/profile/${handle}`, A)).status).toBe(404)
      expect((await api(world, `/api/social/profile/${handle}`, null)).status).toBe(404)
      expect((await api(world, '/api/social/follow', D, { method: 'POST', body: JSON.stringify({ handle }) })).status).toBe(404)
    }
    // The owner still sees their own profile.
    expect((await api(world, '/api/social/profile/bea', B)).status).toBe(200)
  })

  it('a Friends profile shows only its card to a stranger, everything to a friend', async () => {
    const world = everyoneWorld()
    world.profiles.get(B)!.visibility = 'friends'
    world.read(B, 0, 60)
    const stranger = (await json(await api(world, '/api/social/profile/bea', C))).profile
    expect(stranger).toMatchObject({ limited: true, time: null, readingNow: null, relation: 'stranger' })
    world.befriend(B, C)
    const friend = (await json(await api(world, '/api/social/profile/bea', C))).profile
    expect(friend).toMatchObject({ limited: false, relation: 'friend', time: { last7: '1 h' } })
  })
})

describe('blocked readers never see each other', () => {
  it('in either direction: no profile, no board, no search, no follow; blocking ends follows both ways', async () => {
    const world = everyoneWorld()
    world.befriend(A, B)
    world.read(A, 0, 60); world.read(B, 0, 60)
    const blocked = await api(world, '/api/social/block', A, { method: 'POST', body: JSON.stringify({ handle: 'bea' }) })
    expect(blocked.status).toBe(200)
    expect(world.follows).toEqual([])
    for (const [viewer, other, handle] of [[A, B, 'bea'], [B, A, 'anders']] as const) {
      expect((await api(world, `/api/social/profile/${handle}`, viewer)).status).toBe(404)
      for (const tab of ['friends', 'everyone'] as const) expect(names(await board(world, viewer, tab))).not.toContain(NAMES[other])
      expect((await json(await api(world, `/api/social/find?q=${handle}`, viewer))).results).toEqual([])
      expect((await api(world, '/api/social/follow', viewer, { method: 'POST', body: JSON.stringify({ handle }) })).status).toBe(404)
    }
    // Others still see both.
    expect(names(await board(world, C, 'everyone'))).toEqual(expect.arrayContaining(['Anders', 'Bea']))
    const list = await json(await api(world, '/api/social/blocked', A))
    expect(list.blocked).toEqual([{ id: B, name: 'Bea', handle: 'bea' }])
    await api(world, '/api/social/unblock', A, { method: 'POST', body: JSON.stringify({ id: B }) })
    expect((await api(world, '/api/social/profile/bea', A)).status).toBe(200)
  })

  it('also in Also reading your books and Following you', async () => {
    const world = everyoneWorld()
    world.read(A, -1, 30, 'frankenstein'); world.read(B, -2, 30, 'frankenstein'); world.read(C, -2, 30, 'frankenstein')
    world.follows.push([C, A])
    world.blocks.push([B, A])
    const find = await json(await api(world, '/api/social/find', A))
    expect(find.alsoReading.map((row: { name: string }) => row.name)).toEqual(['Carl'])
    expect(find.followingYou.map((row: { name: string }) => row.name)).toEqual(['Carl'])
  })
})

describe('follows', () => {
  it('follow, follow back = friends, unfollow, remove follower; events recorded', async () => {
    const world = everyoneWorld()
    const track = vi.fn()
    const follow = await json(await api(world, '/api/social/follow', A, { method: 'POST', body: JSON.stringify({ handle: 'bea' }) }, { track }))
    expect(follow).toMatchObject({ relation: 'follower' })
    const back = await json(await api(world, '/api/social/follow', B, { method: 'POST', body: JSON.stringify({ handle: 'tinct.app/@anders'.replace('tinct.app/@', '') }) }, { track }))
    expect(back).toMatchObject({ relation: 'friend' })
    const removed = await json(await api(world, '/api/social/remove-follower', A, { method: 'POST', body: JSON.stringify({ handle: 'bea' }) }, { track }))
    expect(removed).toMatchObject({ relation: 'follower', followsYou: false })
    const unfollow = await json(await api(world, '/api/social/unfollow', A, { method: 'POST', body: JSON.stringify({ handle: 'bea' }) }, { track }))
    expect(unfollow).toMatchObject({ relation: 'stranger' })
    expect(track.mock.calls.map(call => call[0])).toEqual(['follow', 'follow', 'unfollow'])
  })

  it('Find searches Everyone readers by name or link, never Friends-only readers or yourself', async () => {
    const world = everyoneWorld()
    world.profiles.get(C)!.visibility = 'friends'
    expect((await json(await api(world, '/api/social/find?q=be', A))).results.map((r: { handle: string }) => r.handle)).toEqual(['bea'])
    expect((await json(await api(world, `/api/social/find?q=${encodeURIComponent('https://tinct.app/@dora')}`, A))).results.map((r: { handle: string }) => r.handle)).toEqual(['dora'])
    expect((await json(await api(world, '/api/social/find?q=carl', A))).results).toEqual([])
    expect((await json(await api(world, '/api/social/find?q=anders', A))).results).toEqual([])
  })

  it('Also reading your books: Everyone readers who show what they read, with the book', async () => {
    const world = everyoneWorld()
    world.profiles.get(C)!.show_reading = false
    world.profiles.get(D)!.visibility = 'friends'
    world.read(A, -1, 30, 'frankenstein')
    for (const id of [B, C, D]) world.read(id, -2, 30, 'frankenstein')
    world.read(E, -2, 30, 'meditations')
    const find = await json(await api(world, '/api/social/find', A))
    expect(find.alsoReading).toEqual([expect.objectContaining({ name: 'Bea', book: 'Frankenstein', relation: 'stranger' })])
    expect(find.link).toBe('tinct.app/@anders')
  })
})

describe('a reader’s own books are private', () => {
  const OWN = 'userbook-0123456789abcdef01234567'
  const PD = { id: 'pd-en-walden', title: 'Walden', author: 'Henry David Thoreau', wordCount: 110000, art: null, readingStructure: { chapters: [{ number: 1, title: 'Economy' }, { number: 2, title: 'Where I Lived' }] } }
  const withPd = () => new Map<string, unknown>([...CATALOGUE, [PD.id, PD]]) as never

  it('the leaderboard counts their time and shows "a private book", never an id or title', async () => {
    const world = everyoneWorld()
    world.befriend(A, B); world.befriend(A, C)
    world.read(B, 0, 90, 'private'); world.read(B, -1, 10, 'frankenstein')
    // A row from before the bucket existed is treated the same way.
    world.read(C, 0, 50, OWN); world.read(C, 0, 5, 'meditations')
    const data = await board(world, A, 'friends')
    expect(data.entries.map((e: { name: string; book: string | null; seconds: number }) => [e.name, e.book, e.seconds])).toEqual([
      ['Bea', 'a private book', 100 * 60], ['Carl', 'a private book', 55 * 60], ['You', null, 0],
    ])
    expect(JSON.stringify(data)).not.toMatch(/userbook-|"book":"private"/)
  })

  it('a profile shows "a private book" with no cover and no link; its time counts; the payload has no own-book id', async () => {
    const world = everyoneWorld()
    world.read(B, 0, 70, 'private'); world.read(B, -2, 20, OWN); world.read(B, -1, 30, 'frankenstein')
    const data = await json(await api(world, '/api/social/profile/bea', A))
    const books = data.profile.readingNow as Array<{ bookId: string; title: string; cover: string | null }>
    expect(books.map(book => book.title)).toEqual(['a private book', 'Frankenstein'])
    expect(books[0]).toMatchObject({ bookId: 'private', cover: null, progress: null })
    expect(data.profile.time.last7).toBe('2 h')
    expect(JSON.stringify(data)).not.toContain('userbook-')
    const page = await serveProfilePage(new Request('https://tinct.app/@bea'), on as never, deps(world), 'bea')
    const html = await page.text()
    expect(html).toContain('a private book')
    expect(html).not.toContain('/read/private')
    expect(html).not.toContain('userbook-')
    expect(html).toContain('href="/read/frankenstein"')
  })

  it('never matched for "Also reading your books"; added public-domain books are shown normally', async () => {
    const world = everyoneWorld()
    world.read(A, -1, 30, 'private'); world.read(A, -1, 30, OWN)
    world.read(B, -2, 30, 'private'); world.read(C, -2, 30, OWN)
    const none = await json(await api(world, '/api/social/find', A, {}, { catalogue: async () => withPd() }))
    expect(none.alsoReading).toEqual([])
    expect(JSON.stringify(none)).not.toMatch(/userbook-|private book/)
    world.read(A, -1, 30, PD.id); world.read(D, -2, 30, PD.id)
    const find = await json(await api(world, '/api/social/find', A, {}, { catalogue: async () => withPd() }))
    expect(find.alsoReading).toEqual([expect.objectContaining({ name: 'Dora', book: 'Walden' })])
    world.befriend(A, D)
    const friends = await json(await api(world, '/api/social/board?tab=friends', A, {}, { catalogue: async () => withPd() }))
    expect(friends.entries.find((e: { name: string }) => e.name === 'Dora')?.book).toBe('Walden')
  })

  it('the catalogue includes added public-domain books, never anything else', () => {
    const map = withAddedBooks(CATALOGUE as never, [PD, { id: OWN, title: 'My diary' }, { id: 'frankenstein', title: 'Not this' }, null])
    expect(map.get(PD.id)?.title).toBe('Walden')
    expect(map.has(OWN)).toBe(false)
    expect(map.get('frankenstein')?.title).toBe('Frankenstein')
    expect(withAddedBooks(CATALOGUE as never, undefined).size).toBe(CATALOGUE.size)
  })
})

describe('reports and the admin view', () => {
  it('a report is stored once; the admin view lists it; only site admins get in', async () => {
    const world = everyoneWorld()
    const first = await json(await api(world, '/api/social/report', B, { method: 'POST', body: JSON.stringify({ handle: 'carl', reason: 'name' }) }))
    expect(first).toEqual({ ok: true, duplicate: false })
    expect((await json(await api(world, '/api/social/report', B, { method: 'POST', body: JSON.stringify({ handle: 'carl', reason: 'name' }) }))).duplicate).toBe(true)
    expect((await api(world, '/api/social/report', B, { method: 'POST', body: JSON.stringify({ handle: 'carl', reason: 'rude' }) })).status).toBe(422)
    expect((await api(world, '/api/admin/social', B)).status).toBe(403)
    const admin = await json(await api(world, '/api/admin/social', A))
    expect(admin.reports).toEqual([expect.objectContaining({ reason: 'name', handle: 'carl', profile: expect.objectContaining({ name: 'Carl' }) })])
    await api(world, '/api/admin/social/report', A, { method: 'POST', body: JSON.stringify({ id: 1, resolution: 'renamed' }) })
    expect((await json(await api(world, '/api/admin/social', A))).reports).toEqual([])
  })

  it('approving an uploaded picture shows it to others; declining keeps the initial; rename and hide', async () => {
    const world = everyoneWorld()
    Object.assign(world.profiles.get(B)!, { picture_kind: 'upload', picture_value: 'abcdef0123', picture_review: 'pending' })
    const before = (await json(await api(world, '/api/social/profile/bea', C))).profile
    expect(before.picture.src).toBeNull()
    const queue = await json(await api(world, '/api/admin/social', A))
    expect(queue.pending.map((row: { handle: string }) => row.handle)).toEqual(['bea'])
    expect(queue.pending[0].picture.url).toBe(`/api/admin/social/image?user=${B}&slot=picture&v=abcdef0123`)
    await api(world, '/api/admin/social/review', A, { method: 'POST', body: JSON.stringify({ userId: B, slot: 'picture', decision: 'approve' }) })
    const after = (await json(await api(world, '/api/social/profile/bea', C))).profile
    expect(after.picture.src).toBe(`/api/profile/image?user=${B}&slot=picture&v=abcdef0123`)
    await api(world, '/api/admin/social/review', A, { method: 'POST', body: JSON.stringify({ userId: B, slot: 'picture', decision: 'decline' }) })
    expect((await json(await api(world, '/api/social/profile/bea', C))).profile.picture.src).toBeNull()
    const renamed = await api(world, '/api/admin/social/profile', A, { method: 'POST', body: JSON.stringify({ userId: B, name: 'B. Reader', handle: 'breader' }) })
    expect(renamed.status).toBe(200)
    expect((await api(world, '/api/social/profile/breader', C)).status).toBe(200)
    expect((await api(world, '/api/admin/social/profile', A, { method: 'POST', body: JSON.stringify({ userId: B, handle: 'admin' }) })).status).toBe(422)
    await api(world, '/api/admin/social/profile', A, { method: 'POST', body: JSON.stringify({ userId: B, hidden: true }) })
    expect((await api(world, '/api/social/profile/breader', C)).status).toBe(404)
    world.read(B, 0, 60)
    expect(names(await board(world, C, 'everyone'))).not.toContain('B. Reader')
  })
})

describe('the public profile page', () => {
  it('is Worker-rendered, noindex, with the banner; a signed-in visitor gets a page their script fills in', async () => {
    const world = everyoneWorld()
    Object.assign(world.profiles.get(B)!, { picture_kind: 'set', picture_value: 'stoic', background_kind: 'set', background_value: 'stoic' })
    world.read(B, 0, 70, 'frankenstein')
    const page = await serveProfilePage(new Request('https://tinct.app/@bea'), on as never, deps(world), 'bea')
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toContain('noindex')
    const html = await page.text()
    expect(html).toContain('<meta name="robots" content="noindex, nofollow, noarchive">')
    expect(html).toContain('scene-meditations-phone.jpg')
    expect(html).toContain('Bea')
    expect(html).toContain('tinct.app/@bea')
    expect(html).toContain('1 h 10 m')
    expect(html).toContain('Report')
    expect(html).not.toContain('@example.com')
    const signedIn = await serveProfilePage(new Request('https://tinct.app/@bea', { headers: { cookie: 'tinct_auth=1' } }), on as never, deps(world), 'bea')
    const shell = await signedIn.text()
    expect(shell).toContain('data-state="loading"')
    expect(shell).not.toContain('1 h 10 m')
    world.profiles.get(B)!.visibility = 'only_me'
    const hidden = await serveProfilePage(new Request('https://tinct.app/@bea'), on as never, deps(world), 'bea')
    expect(hidden.status).toBe(404)
    expect(await hidden.text()).not.toContain('Bea')
  })
})

describe('the reading card', () => {
  it('"Finished {book} · {hours}" links to the public profile, else to the book', async () => {
    const world = everyoneWorld()
    world.read(A, -3, 200, 'frankenstein'); world.read(A, -1, 180, 'frankenstein')
    const renderCard = vi.fn(async () => new Uint8Array([137, 80, 78, 71]))
    const card = await api(world, '/api/social/card', A, { method: 'POST', body: JSON.stringify({ bookId: 'frankenstein' }) }, { renderCard })
    expect(card.headers.get('Content-Type')).toBe('image/png')
    expect(card.headers.get('X-Card-Link')).toBe('https://tinct.app/@anders')
    expect(decodeURIComponent(card.headers.get('X-Card-Line')!)).toBe('Finished Frankenstein · 6 h 20 m')
    expect(renderCard).toHaveBeenCalledWith(expect.objectContaining({ title: 'Frankenstein', duration: '6 h 20 m', link: 'https://tinct.app/@anders' }))
    world.profiles.get(A)!.visibility = 'only_me'
    const book = await api(world, '/api/social/card', A, { method: 'POST', body: JSON.stringify({ bookId: 'frankenstein' }) }, { renderCard })
    expect(book.headers.get('X-Card-Link')).toBe('https://tinct.app/read/frankenstein')
  })
})
