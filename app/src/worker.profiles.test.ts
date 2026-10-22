import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import {
  handleProfiles,
  isProfileApiPath,
  stripJpegMetadata,
  type ProfileAuthUser,
} from './worker/routes/profiles'
import { ProfilesUnavailable, type AccountRow, type ProfileStore, type PublicCardRow, type ReaderProfileRow } from './worker/lib/profileStore'
import { SOCIAL_META, withSocialMarkers } from './worker/routes/socialPages'
import { EMAIL_CONSENT_VERSION, effectiveVisibility } from './social/profileRules'
import { confirmUrl, verifyLink } from './worker/lifecycle/links'
import { confirmLinkEmail, confirmLinkLimiter, confirmLinkSender, CONFIRM_LINK_SUBJECT } from './worker/routes/confirmLink'
import { LIFECYCLE_TEST_GATE, isLifecycleTestRecipient } from './worker/routes/emails'
import { handleEmailLink } from './worker/routes/emailLinks'
import { PHOTO_COPY } from './social/photoFile'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const C = '33333333-3333-4333-8333-333333333333'
const D = '44444444-4444-4444-8444-444444444444'

const on = { SOCIAL_PROFILES: '1', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }

/** An in-memory stand-in for reader_profiles, profiles, the public card view, follows and blocks. */
class MemoryStore implements ProfileStore {
  profiles = new Map<string, ReaderProfileRow>()
  accounts = new Map<string, AccountRow & { email_opt_in_at?: string }>()
  follows: [string, string][] = []
  blocks: [string, string][] = []
  calls = 0
  async getOwn(id: string) { this.calls++; return this.profiles.get(id) ?? null }
  async getAccount(id: string) { this.calls++; return this.accounts.get(id) ?? null }
  async takenHandles(candidates: string[]) { return new Set([...this.profiles.values()].map(row => row.handle).filter(handle => candidates.includes(handle))) }
  async create(row: ReaderProfileRow) {
    if ([...this.profiles.values()].some(other => other.handle === row.handle) || this.profiles.has(row.id)) return 'taken' as const
    this.profiles.set(row.id, { ...row }); return 'ok' as const
  }
  async update(id: string, patch: Partial<ReaderProfileRow>) {
    if (patch.handle && [...this.profiles.values()].some(other => other.handle === patch.handle && other.id !== id)) return 'taken' as const
    this.profiles.set(id, { ...this.profiles.get(id)!, ...patch }); return 'ok' as const
  }
  async updateAccount(id: string, patch: Partial<AccountRow>) { this.accounts.set(id, { ...this.accounts.get(id)!, ...patch }) }
  /** public_profile_cards, as the SQL view defines it. */
  private card(row: ReaderProfileRow): PublicCardRow | null {
    if (row.visibility === 'only_me') return null
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
  async getCardByHandle(handle: string) { const row = [...this.profiles.values()].find(item => item.handle === handle); return row ? this.card(row) : null }
  async getCardById(id: string) { const row = this.profiles.get(id); return row ? this.card(row) : null }
  async relation(viewer: string, owner: string) {
    return {
      viewerFollowsOwner: this.follows.some(([f, t]) => f === viewer && t === owner),
      ownerFollowsViewer: this.follows.some(([f, t]) => f === owner && t === viewer),
      blocked: this.blocks.some(([x, y]) => (x === viewer && y === owner) || (x === owner && y === viewer)),
    }
  }
}

class MissingTables implements ProfileStore {
  private fail(): never { throw new ProfilesUnavailable('reader_profiles 404', 404) }
  getOwn = async () => this.fail()
  getAccount = async () => this.fail()
  takenHandles = async () => this.fail()
  create = async () => this.fail()
  update = async () => this.fail()
  updateAccount = async () => this.fail()
  getCardByHandle = async () => this.fail()
  getCardById = async () => this.fail()
  relation = async () => this.fail()
}

const users: Record<string, ProfileAuthUser> = {
  [A]: { id: A, email: 'anders.h@example.com', app_metadata: { provider: 'email' } },
  [B]: { id: B, email: 'b@example.com', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: { full_name: 'Bea Reader', avatar_url: 'https://lh3.googleusercontent.com/a/abc=s96-c' } },
  [C]: { id: C, email: 'c@example.com', app_metadata: { provider: 'email' } },
  [D]: { id: D, email: 'd@example.com', app_metadata: { provider: 'email' } },
}

function seed(store: MemoryStore) {
  for (const id of [A, B, C, D]) store.accounts.set(id, { email_opt_in: false, email_confirmed_at: null, email_consent_version: null })
}

function call(store: ProfileStore, path: string, init: RequestInit & { as?: string } = {}, env: Record<string, unknown> = on) {
  const headers = new Headers(init.headers)
  if (init.as) headers.set('authorization', `Bearer ${init.as}`)
  const request = new Request(`https://tinct.app${path}`, { ...init, headers })
  return handleProfiles(request, env as never, {
    store,
    verifyUser: async req => {
      const token = req.headers.get('authorization')?.slice(7)
      return token ? users[token] ?? null : null
    },
    now: () => new Date('2026-10-08T10:00:00Z'),
    random: () => 0.42,
  })
}

const post = (store: ProfileStore, as: string, body: unknown, env?: Record<string, unknown>) =>
  call(store, '/api/profile', { method: 'POST', as, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }, env)

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('switch off', () => {
  it('every profile route is a 404 and nothing is read', async () => {
    const store = new MemoryStore()
    for (const path of ['/api/profile', '/api/profile/handle?h=anders', '/api/profiles/anders']) {
      const response = await call(store, path, { as: A }, { ...on, SOCIAL_PROFILES: '0' })
      expect(response.status).toBe(404)
    }
    expect(store.calls).toBe(0)
  })

  it('the Worker router leaves /api/profile and every page exactly as before; /you opens the You card', async () => {
    const assets = vi.fn(async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.startsWith('/lab/library_2/') || path === '/lab/sign-in/') return new Response('<html><head><title>x</title></head><body></body></html>', { headers: { 'content-type': 'text/html' } })
      return new Response('Not found', { status: 404 })
    })
    const env = { ASSETS: { fetch: assets }, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' }
    const fetchSpy = vi.fn(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetchSpy)
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    for (const off of [undefined, '0']) {
      const library = await worker.fetch(new Request('https://tinct.app/library'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(await library.text()).not.toContain('tinct-social')
      const signIn = await worker.fetch(new Request('https://tinct.app/sign-in'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(await signIn.text()).not.toContain('tinct-social')
      // The old You page is the You card over the library (src/cards/cardRoutes.ts), switch or not.
      const you = await worker.fetch(new Request('https://tinct.app/you'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(you.status).toBe(302)
      expect(you.headers.get('Location')).toBe('/library?card=you')
      const api = await worker.fetch(new Request('https://tinct.app/api/profile'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(api.status).toBe(404)
    }
    // No Supabase call was made for any of it.
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('reader_profiles'))).toBe(false)
  })

  it('switch on marks the library, reader and sign-in pages, and only those', async () => {
    const page = (path: string) => withSocialMarkers(new Response('<html><head></head><body></body></html>', { headers: { 'content-type': 'text/html' } }), new Request(`https://tinct.app${path}`))
    expect(await (await page('/library')).text()).toContain(SOCIAL_META)
    expect(await (await page('/reader')).text()).toContain(SOCIAL_META)
    // The library loads the account cards itself (public/lab/library_2/index.html); nothing is injected.
    expect(await (await page('/library')).text()).not.toContain('<script')
    expect(await (await page('/sign-in')).text()).toContain(SOCIAL_META)
    expect(await (await page('/privacy')).text()).not.toContain(SOCIAL_META)
  })
})

describe('missing tables (SQL not run yet)', () => {
  it('says unavailable and never throws', async () => {
    const store = new MissingTables()
    const get = await call(store, '/api/profile', { as: A })
    expect(get.status).toBe(200)
    expect(await get.json()).toEqual({ enabled: true, available: false })
    expect((await post(store, A, { name: 'Anders' })).status).toBe(503)
    expect((await call(store, '/api/profiles/anders')).status).toBe(503)
    expect((await call(store, '/api/profile/handle?h=anders', { as: A })).status).toBe(503)
  })

  it('a real Supabase 404 becomes unavailable, not a crash', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"code":"PGRST205"}', { status: 404 })))
    const request = new Request('https://tinct.app/api/profile', { headers: { authorization: 'Bearer x' } })
    const response = await handleProfiles(request, on, { verifyUser: async () => users[A] })
    expect(await response.json()).toEqual({ enabled: true, available: false })
  })
})

describe('existing accounts get a private profile', () => {
  it('created on first read: Only me, the neutral name and link (never the email), the book they are reading', async () => {
    const store = new MemoryStore(); seed(store)
    const response = await call(store, '/api/profile?book=odyssey', { as: A })
    const { profile } = await response.json() as { profile: Record<string, unknown> }
    expect(profile).toMatchObject({
      handle: 'reader4780', link: 'tinct.app/@reader4780', name: 'Reader',
      picture: { kind: 'set', value: 'at-sea' }, background: { kind: 'set', value: 'at-sea' },
      visibility: 'only_me', effectiveVisibility: 'only_me', onLeaderboard: false,
      needsSetup: true, shouldPrompt: true, emailConfirmed: false,
    })
    // Nobody else can see it.
    expect((await call(store, '/api/profiles/reader4780', { as: C })).status).toBe(404)
    expect((await call(store, '/api/profiles/reader4780')).status).toBe(404)
    expect(JSON.stringify(profile)).not.toContain('@example.com')
  })

  it('a Google account: name from Google, unique link, counted as confirmed, initial picture without a book', async () => {
    const store = new MemoryStore(); seed(store)
    store.profiles.set(D, { ...(await (async () => { await call(store, '/api/profile', { as: D }); return store.profiles.get(D)! })()), handle: 'bea.reader' })
    const { profile } = await (await call(store, '/api/profile', { as: B })).json() as { profile: Record<string, unknown> }
    expect(profile).toMatchObject({ name: 'Bea Reader', handle: 'bea.reader2', emailConfirmed: true, googlePhoto: true, picture: { kind: 'initial' }, visibility: 'only_me' })
    expect(store.accounts.get(B)!.email_confirmed_at).toBe('2026-10-08T10:00:00.000Z')
  })

  it('the gentle prompt is offered once', async () => {
    const store = new MemoryStore(); seed(store)
    await call(store, '/api/profile', { as: A })
    const { profile } = await (await post(store, A, { prompted: true })).json() as { profile: { shouldPrompt: boolean; needsSetup: boolean } }
    expect(profile.shouldPrompt).toBe(false)
    expect(profile.needsSetup).toBe(true)
  })
})

describe('names and links never come from the email (Anders, 9 Oct 2026)', () => {
  const E = '55555555-5555-4555-8555-555555555555'
  const G = '66666666-6666-4666-8666-666666666666'
  const emailUser: ProfileAuthUser = { id: E, email: 'qa-ux-desk+a9cs927@example.com', app_metadata: { provider: 'email' } }
  const googleUser: ProfileAuthUser = { id: G, email: 'anders.h@gmail.com', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: { full_name: 'Anders Hvelplund' } }
  const extra: Record<string, ProfileAuthUser> = { [E]: emailUser, [G]: googleUser }
  const callAs = (store: ProfileStore, path: string, as: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    headers.set('authorization', `Bearer ${as}`)
    return handleProfiles(new Request(`https://tinct.app${path}`, { ...init, headers }), on as never, {
      store,
      verifyUser: async req => extra[req.headers.get('authorization')!.slice(7)] ?? null,
      now: () => new Date('2026-10-08T10:00:00Z'),
      random: () => 0.42,
    })
  }
  const get = async (store: ProfileStore, as: string) => (await (await callAs(store, '/api/profile', as)).json() as { profile: { name: string; handle: string; link: string } }).profile
  const save = async (store: ProfileStore, as: string, body: unknown) => {
    const response = await callAs(store, '/api/profile', as, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })
    return { status: response.status, profile: (await response.json() as { profile: { name: string; handle: string } }).profile }
  }
  /** Any four letters or digits in a row from the email's local part. */
  const emailText = (value: string, email: string) => {
    const local = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const plain = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    for (let i = 0; i + 4 <= local.length; i++) if (plain.includes(local.slice(i, i + 4))) return local.slice(i, i + 4)
    return null
  }
  const legacyRow = (over: Partial<ReaderProfileRow> = {}): ReaderProfileRow => ({
    id: E, display_name: 'Qa Ux Desk A Cs', handle: 'qauxdeska9cs927',
    picture_kind: 'initial', picture_value: null, picture_review: 'none',
    background_kind: 'library', background_value: null, background_review: 'none',
    visibility: 'only_me', show_reading: true, show_time: true, on_leaderboard: false, new_books_open_in: 'modern',
    auto_created: true, set_up_at: null, prompted_at: null, updated_at: '2026-10-08T09:00:00Z', ...over,
  })
  const seeded = () => {
    const store = new MemoryStore()
    for (const id of [E, G]) store.accounts.set(id, { email_opt_in: false, email_confirmed_at: null, email_consent_version: null })
    return store
  }

  it('an email sign-up gets a neutral name and a reader link with a short random part, nothing from the email', async () => {
    const store = seeded()
    const profile = await get(store, E)
    expect(profile.name).toBe('Reader')
    expect(profile.handle).toMatch(/^reader\d{3,}$/)
    expect(emailText(profile.name, emailUser.email!)).toBeNull()
    expect(emailText(profile.handle, emailUser.email!)).toBeNull()
    expect(store.profiles.get(E)).toMatchObject({ display_name: 'Reader', handle: profile.handle })
    // The set-up name field is filled from profile.name: it shows the neutral name, never email text.
    expect(JSON.stringify(profile)).not.toMatch(/qaux|desk|a9cs|927/i)
  })

  it('a Google sign-up keeps its name for both name and link', async () => {
    const store = seeded()
    expect(await get(store, G)).toMatchObject({ name: 'Anders Hvelplund', handle: 'anders.hvelplund' })
  })

  it('setting a name re-derives the link while it is still the automatic one', async () => {
    const store = seeded()
    await get(store, E)
    // Sign-up step 2 sends the name with setUp.
    const { profile } = await save(store, E, { name: 'Quinn Adler', visibility: 'friends', setUp: true })
    expect(profile).toMatchObject({ name: 'Quinn Adler', handle: 'quinn.adler' })
    // Once set up, the link may be shared: a later name change leaves it alone.
    expect((await save(store, E, { name: 'Quinn A' })).profile).toMatchObject({ name: 'Quinn A', handle: 'quinn.adler' })
  })

  it('a name set from the You page before set-up also re-derives the automatic link, uniquely', async () => {
    const store = seeded()
    store.profiles.set(G, { ...legacyRow({ id: G, display_name: 'Someone', handle: 'quinn.adler' }), set_up_at: '2026-10-08T08:00:00Z' })
    await get(store, E)
    expect((await save(store, E, { name: 'Quinn Adler' })).profile).toMatchObject({ name: 'Quinn Adler', handle: 'quinn.adler2' })
  })

  it('a link the reader typed is never changed', async () => {
    const store = seeded()
    await get(store, E)
    expect((await save(store, E, { handle: 'q.reads' })).profile.handle).toBe('q.reads')
    expect((await save(store, E, { name: 'Quinn Adler' })).profile).toMatchObject({ name: 'Quinn Adler', handle: 'q.reads' })
    expect((await save(store, E, { name: 'Quinn B', setUp: true })).profile.handle).toBe('q.reads')
    // A name and a typed link in the same save: the typed link wins.
    const other = seeded()
    await get(other, E)
    expect((await save(other, E, { name: 'Quinn Adler', handle: 'quinny', setUp: true })).profile.handle).toBe('quinny')
  })

  it('an existing profile not yet set up, made from the email, is repaired on its next read', async () => {
    const store = seeded()
    store.profiles.set(E, legacyRow())
    const profile = await get(store, E)
    expect(profile.name).toBe('Reader')
    expect(profile.handle).toMatch(/^reader\d{3,}$/)
    expect(store.profiles.get(E)).toMatchObject({ display_name: 'Reader', handle: profile.handle, set_up_at: null, visibility: 'only_me' })
    // Re-reading changes nothing more.
    expect(await get(store, E)).toMatchObject({ name: 'Reader', handle: profile.handle })
  })

  it('a legacy profile is repaired on its next save too, and a name the reader chose is kept', async () => {
    const store = seeded()
    store.profiles.set(E, legacyRow({ handle: 'qauxdeska9cs9272' }))
    expect((await save(store, E, { prompted: true })).profile).toMatchObject({ name: 'Reader', handle: expect.stringMatching(/^reader\d{3,}$/) })
    // A name the reader typed (not the email's) stays; only the email link is re-derived from it.
    const typed = seeded()
    typed.profiles.set(E, legacyRow({ display_name: 'Quinn Adler' }))
    expect(await get(typed, E)).toMatchObject({ name: 'Quinn Adler', handle: 'quinn.adler' })
  })

  it('a legacy Google profile whose link came from the email gets its link from the Google name', async () => {
    const store = seeded()
    store.profiles.set(G, legacyRow({ id: G, display_name: 'Anders Hvelplund', handle: 'anders.h' }))
    expect(await get(store, G)).toMatchObject({ name: 'Anders Hvelplund', handle: 'anders.hvelplund' })
  })

  it('a profile that is set up is never touched, even if it came from the email', async () => {
    const store = seeded()
    const row = legacyRow({ set_up_at: '2026-10-08T08:00:00Z', visibility: 'everyone' })
    store.profiles.set(E, row)
    expect(await get(store, E)).toMatchObject({ name: 'Qa Ux Desk A Cs', handle: 'qauxdeska9cs927' })
    await save(store, E, { showTime: false })
    expect(store.profiles.get(E)).toMatchObject({ display_name: 'Qa Ux Desk A Cs', handle: 'qauxdeska9cs927', show_time: false })
  })

  it('setUpBeforeFindable (Anders, 21 Oct 2026): set up before findable profiles (#488), not after, never when not set up', async () => {
    const store = seeded()
    store.profiles.set(E, legacyRow({ set_up_at: '2026-10-12T08:00:00Z', visibility: 'friends' }))
    expect(await get(store, E)).toMatchObject({ setUpBeforeFindable: true })
    store.profiles.set(E, legacyRow({ set_up_at: '2026-10-20T08:00:00Z', visibility: 'friends' }))
    expect(await get(store, E)).toMatchObject({ setUpBeforeFindable: false })
    store.profiles.set(E, legacyRow({ set_up_at: null }))
    expect(await get(store, E)).toMatchObject({ setUpBeforeFindable: false })
  })
})

describe('sign-up step 2', () => {
  it('Skip = Only me, and records the consent with its wording version', async () => {
    const store = new MemoryStore(); seed(store)
    await call(store, '/api/profile', { as: C })
    await post(store, C, { visibility: 'friends' })
    const { profile } = await (await post(store, C, { skip: true, consent: { optIn: true, version: EMAIL_CONSENT_VERSION } })).json() as { profile: Record<string, unknown> }
    expect(profile).toMatchObject({ visibility: 'only_me', setUp: true, needsSetup: false, emailOptIn: true })
    expect(store.accounts.get(C)).toMatchObject({ email_opt_in: true, email_consent_version: EMAIL_CONSENT_VERSION })
  })

  it('an old wording version is not recorded as consent', async () => {
    const store = new MemoryStore(); seed(store)
    await post(store, C, { skip: true, consent: { optIn: true, version: '1999-01-01' } })
    expect(store.accounts.get(C)!.email_opt_in).toBe(false)
  })

  it('Continue saves picture, name and Friends', async () => {
    const store = new MemoryStore(); seed(store)
    const { profile } = await (await post(store, C, { name: 'Cee', picture: { kind: 'set', value: 'florence' }, background: { kind: 'set', value: 'florence' }, visibility: 'friends', setUp: true })).json() as { profile: Record<string, unknown> }
    expect(profile).toMatchObject({ name: 'Cee', picture: { kind: 'set', value: 'florence' }, visibility: 'friends', setUp: true })
  })

  it('rejects a filtered name, a reserved or taken link, and a bad visibility', async () => {
    const store = new MemoryStore(); seed(store)
    await call(store, '/api/profile', { as: A })
    await call(store, '/api/profile', { as: C })
    expect((await post(store, C, { name: 'shithead' })).status).toBe(422)
    expect((await post(store, C, { handle: 'library' })).status).toBe(422)
    expect((await post(store, C, { handle: 'odyssey' })).status).toBe(422)
    expect((await post(store, C, { handle: 'reader4780' })).status).toBe(409)
    expect((await post(store, C, { handle: 'READER4780' })).status).toBe(409)
    expect((await post(store, C, { visibility: 'public' })).status).toBe(422)
    expect((await post(store, C, { handle: 'cee.reads' })).status).toBe(200)
    expect(store.profiles.get(C)!.handle).toBe('cee.reads')
    const check = await (await call(store, '/api/profile/handle?h=Cee.Reads', { as: A })).json()
    expect(check).toMatchObject({ ok: false, reason: 'unavailable' })
    // Cee is Only me: the check must not say a profile is there. Taken and reserved read the same.
    expect(store.profiles.get(C)!.visibility).toBe('only_me')
    const reserved = await (await call(store, '/api/profile/handle?h=library', { as: A })).json()
    expect(check).toEqual(reserved)
    expect(check.message).not.toMatch(/taken|reserved/i)
  })
})

describe('visibility seen by a stranger, a one-way follower and a friend', () => {
  async function world() {
    const store = new MemoryStore(); seed(store)
    for (const id of [A, B, C, D]) await call(store, '/api/profile', { as: id })
    // B follows A (one-way). C and A follow each other (friends). D is a stranger.
    store.follows.push([B, A], [C, A], [A, C])
    return store
  }
  const look = async (store: MemoryStore, viewer: string | null) => {
    const response = await call(store, '/api/profiles/reader4780', viewer ? { as: viewer } : {})
    return response.status === 200 ? (await response.json() as { profile: { limited: boolean; shows: Record<string, boolean>; background: unknown } }).profile : null
  }

  it('Only me', async () => {
    const store = await world()
    for (const viewer of [null, D, B, C]) expect(await look(store, viewer)).toBeNull()
    expect((await look(store, A))!.limited).toBe(false)
  })

  it('Friends', async () => {
    const store = await world()
    await post(store, A, { visibility: 'friends' })
    // Changed on request (Anders, 19 Oct 2026): a Friends profile is findable by name and picture.
    // A signed-in stranger and a one-way follower (a request not yet accepted) get the header only:
    // no reading, time, board place or banner. Signed out it is Not found. Only friends see more.
    const headerOnly = { limited: true, shows: { reading: false, time: false, leaderboard: false }, background: null }
    expect(await look(store, D)).toMatchObject(headerOnly)
    expect(await look(store, B)).toMatchObject(headerOnly)
    expect(await look(store, null)).toBeNull()
    expect((await look(store, C))!.limited).toBe(false)
    await post(store, A, { showReading: false, onLeaderboard: true })
    expect((await look(store, C))!.shows).toEqual({ reading: false, time: true, leaderboard: true })
  })

  it('Everyone is blocked until the email is confirmed', async () => {
    const store = await world()
    const saved = await (await post(store, A, { visibility: 'everyone' })).json() as { profile: { visibility: string; effectiveVisibility: string } }
    expect(saved.profile).toMatchObject({ visibility: 'everyone', effectiveVisibility: 'friends' })
    // Held at Friends: findable by name and picture only (19 Oct 2026), Not found signed out.
    expect((await look(store, D))!.limited).toBe(true)
    expect((await look(store, B))!.limited).toBe(true)
    expect(await look(store, null)).toBeNull()
    expect((await look(store, C))!.limited).toBe(false)
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T11:00:00Z'
    for (const viewer of [null, D, B, C]) expect((await look(store, viewer))!.limited).toBe(false)
    await post(store, A, { showTime: false })
    expect((await look(store, D))!.shows.time).toBe(false)
  })

  it('a block hides both ways, whatever the visibility', async () => {
    const store = await world()
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T11:00:00Z'
    await post(store, A, { visibility: 'everyone' })
    store.blocks.push([A, D])
    expect(await look(store, D)).toBeNull()
    expect((await look(store, B))!.limited).toBe(false)
  })

  it('never returns email, highlights, notes or chats', async () => {
    const store = await world()
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T11:00:00Z'
    await post(store, A, { visibility: 'everyone' })
    const body = await (await call(store, '/api/profiles/reader4780', { as: D })).text()
    expect(body).not.toMatch(/@example\.com|highlight|note|chat|talk/i)
  })
})

describe('uploads', () => {
  function jpegWithExif(): Uint8Array {
    const app0 = [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]
    const exifPayload = [...new TextEncoder().encode('Exif\0\0GPS 55.6761N 12.5683E')]
    const app1 = [0xff, 0xe1, 0x00, exifPayload.length + 2, ...exifPayload]
    const sof = [0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x00, 0x02, 0x00, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01]
    const sos = [0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x12, 0x34, 0xff, 0xd9]
    return new Uint8Array([0xff, 0xd8, ...app0, ...app1, ...sof, ...sos])
  }

  it('location data is stripped; anything that is not a JPEG is refused', () => {
    const stripped = stripJpegMetadata(jpegWithExif())!
    expect(stripped.width).toBe(512)
    expect(stripped.height).toBe(512)
    expect(new TextDecoder().decode(stripped.bytes)).not.toContain('GPS')
    expect(stripJpegMetadata(new TextEncoder().encode('<svg></svg>'))).toBeNull()
  })

  // Changed on request (Anders, 19 Oct 2026): uploads show to others at once, with no review.
  it('visible to the owner and to others at once; a row still pending from before stays hidden until approved', async () => {
    const store = new MemoryStore(); seed(store)
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T11:00:00Z'
    const objects = new Map<string, Uint8Array>()
    const bucket = {
      put: async (key: string, value: Uint8Array) => { objects.set(key, value) },
      get: async (key: string) => objects.has(key) ? { body: objects.get(key), httpMetadata: { contentType: 'image/jpeg' } } : null,
      delete: async (key: string) => { objects.delete(key) },
    }
    const env = { ...on, SOCIAL_PHOTO_UPLOADS: '1', USER_BOOKS: bucket }
    await post(store, A, { visibility: 'everyone' }, env)
    const upload = await call(store, '/api/profile/image?slot=picture', { method: 'POST', as: A, body: jpegWithExif() as BodyInit }, env)
    const { profile } = await upload.json() as { profile: { picture: { kind: string; url: string; review: string }; uploads: boolean } }
    expect(profile.picture).toMatchObject({ kind: 'upload', review: 'approved' })
    // The profile tells the cards that uploads are on.
    expect(profile.uploads).toBe(true)
    expect((await (await call(store, '/api/profile', { as: A }, env)).json() as { profile: { uploads: boolean } }).profile.uploads).toBe(true)
    expect([...objects.values()][0].length).toBeLessThan(jpegWithExif().length)
    const own = await call(store, profile.picture.url, { as: A }, env)
    expect(own.status).toBe(200)
    // The address names this upload, so the owner's browser keeps it; others' copies last five minutes.
    expect(own.headers.get('Cache-Control')).toBe('private, max-age=31536000, immutable')
    // Others see it straight away (an Everyone profile: signed in or out).
    const theirs = await call(store, profile.picture.url, { as: D }, env)
    expect(theirs.status).toBe(200)
    expect(theirs.headers.get('Cache-Control')).toBe('private, max-age=300')
    expect((await call(store, profile.picture.url, {}, env)).status).toBe(200)
    const seen = await (await call(store, '/api/profiles/reader4780', { as: D }, env)).json() as { profile: { picture: { kind: string } } }
    expect(seen.profile.picture.kind).toBe('upload')
    // A photo still marked pending from before 19 Oct shows to others only once approved.
    store.profiles.get(A)!.picture_review = 'pending'
    expect((await call(store, profile.picture.url, { as: D }, env)).status).toBe(404)
    expect((await (await call(store, '/api/profiles/reader4780', { as: D }, env)).json() as { profile: { picture: { kind: string } } }).profile.picture.kind).toBe('initial')
    store.profiles.get(A)!.picture_review = 'approved'
    expect((await call(store, profile.picture.url, { as: D }, env)).status).toBe(200)
    // Choosing a set removes the stored photo.
    await post(store, A, { picture: { kind: 'set', value: 'stoic' } }, env)
    expect(objects.size).toBe(0)
  })

  it('a photo the Worker cannot process: a 415 in its own words, not the client’s not-a-photo line (19 Oct 2026)', async () => {
    const store = new MemoryStore(); seed(store)
    const bucket = { put: async () => {}, get: async () => null, delete: async () => {} }
    const env = { ...on, SOCIAL_PHOTO_UPLOADS: '1', USER_BOOKS: bucket }
    const res = await call(store, '/api/profile/image?slot=picture', { method: 'POST', as: A, body: new TextEncoder().encode('<svg></svg>') as BodyInit }, env)
    expect(res.status).toBe(415)
    expect(await res.json()).toEqual({ error: 'This photo could not be processed. Try a screenshot of it.' })
    expect(PHOTO_COPY.unprocessed).not.toBe(PHOTO_COPY.notAPhoto)
  })
})

describe('photo uploads at launch (SOCIAL_PHOTO_UPLOADS not "1")', () => {
  function bucket() {
    const objects = new Map<string, Uint8Array>()
    return {
      objects,
      put: async (key: string, value: Uint8Array) => { objects.set(key, value) },
      get: async (key: string) => objects.has(key) ? { body: objects.get(key), httpMetadata: { contentType: 'image/jpeg' } } : null,
      delete: async (key: string) => { objects.delete(key) },
    }
  }
  const jpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x00, 0x02, 0x00, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x12, 0x34, 0xff, 0xd9])

  it.each([undefined, '0', 'true'])('refuses a picture or background upload with a 404 (var %s), stores nothing and reads nothing', async value => {
    const store = new MemoryStore(); seed(store)
    const r2 = bucket()
    const env: Record<string, unknown> = { ...on, USER_BOOKS: r2 }
    if (value !== undefined) env.SOCIAL_PHOTO_UPLOADS = value
    await post(store, A, { visibility: 'everyone' }, env)
    // The profile says uploads are off, so the cards offer none.
    expect((await (await call(store, '/api/profile', { as: A }, env)).json() as { profile: { uploads: boolean } }).profile.uploads).toBe(false)
    const before = store.calls
    for (const slot of ['picture', 'background']) {
      const res = await call(store, `/api/profile/image?slot=${slot}`, { method: 'POST', as: A, body: jpeg() as BodyInit }, env)
      expect(res.status).toBe(404)
    }
    expect(store.calls).toBe(before)
    expect(r2.objects.size).toBe(0)
    expect(store.profiles.get(A)!.picture_kind).not.toBe('upload')
    expect(store.profiles.get(A)!.background_kind).not.toBe('upload')
    // A picture or background of kind upload cannot be chosen through the profile either.
    expect((await post(store, A, { picture: { kind: 'upload', value: 'abc' } }, env)).status).toBe(422)
    expect((await post(store, A, { background: { kind: 'upload', value: 'abc' } }, env)).status).toBe(422)
  })

  it('the Google photo still works', async () => {
    const store = new MemoryStore(); seed(store)
    const r2 = bucket()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(jpeg() as BodyInit, { headers: { 'content-type': 'image/jpeg' } })))
    const res = await call(store, '/api/profile/google-photo', { method: 'POST', as: B }, { ...on, USER_BOOKS: r2 })
    expect(res.status).toBe(200)
    const { profile } = await res.json() as { profile: { picture: { kind: string } } }
    expect(profile.picture.kind).toBe('google')
    expect(r2.objects.size).toBe(1)
  })
})

describe('email confirmation (one route: ship 4\'s signed /confirm)', () => {
  const secret = 'test-secret'
  it('profiles have no confirm route of their own', async () => {
    expect(isProfileApiPath('/api/confirm-email')).toBe(false)
  })

  it('the welcome link confirms the address and profiles read the same email_confirmed_at', async () => {
    const store = new MemoryStore(); seed(store)
    const url = await confirmUrl(secret, A, 'anders.h@example.com', Date.parse('2026-10-08T09:00:00Z'))
    expect(url).toMatch(/^https:\/\/tinct\.app\/confirm\?t=/)
    // The Worker's /confirm writes profiles.email_confirmed_at; route its PostgREST calls into the store.
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const target = new URL(String(input))
      if (!init?.method || init.method === 'GET') return Response.json([{ id: A, email: 'anders.h@example.com', ...store.accounts.get(A) }])
      Object.assign(store.accounts.get(A)!, JSON.parse(String(init.body)))
      expect(target.searchParams.get('email_confirmed_at')).toBe('is.null')
      return Response.json([{ id: A }])
    }))
    const env = { ...on, EMAIL_LINK_SECRET: secret }
    const page = await handleEmailLink(new Request(url), env)
    expect(await page.text()).toContain("document.getElementById('confirm').submit()")
    expect(store.accounts.get(A)!.email_confirmed_at).toBeNull()
    const ok = await handleEmailLink(new Request(url, { method: 'POST' }), env)
    expect(ok.status).toBe(200)
    expect(store.accounts.get(A)!.email_confirmed_at).toEqual(expect.any(String))
    vi.unstubAllGlobals()
    const profile = await (await call(store, '/api/profile', { as: A })).json() as { profile: { emailConfirmed: boolean } }
    expect(profile.profile.emailConfirmed).toBe(true)
  })
})

describe('"Send confirmation link" (POST /api/profile/confirm-link)', () => {
  const secret = 'test-secret'
  const NOW = Date.parse('2026-10-08T10:00:00Z')

  /** The usage coordinator's windows (usageCoordinator.ts hit), in memory. */
  function memoryWindows() {
    const windows = new Map<string, { resetAt: number; count: number }>()
    let clock = NOW
    const namespace = {
      getByName: (name: string) => ({
        hit: async (limit: number, windowMs: number) => {
          const row = windows.get(name)
          if (!row || clock >= row.resetAt) { windows.set(name, { resetAt: clock + windowMs, count: 1 }); return true }
          if (row.count >= limit) return false
          row.count++
          return true
        },
      }),
    }
    return { env: { USAGE_COORDINATOR: namespace as never }, advance: (ms: number) => { clock += ms } }
  }

  function setup(options: { sender?: boolean } = {}) {
    const store = new MemoryStore(); seed(store)
    for (const id of [A, B, C, D]) store.accounts.get(id)!.email = users[id].email
    const sent: { to: string; userId: string }[] = []
    const windows = memoryWindows()
    const send = (as?: string) => {
      const headers = new Headers()
      if (as) headers.set('authorization', `Bearer ${as}`)
      return handleProfiles(new Request('https://tinct.app/api/profile/confirm-link', { method: 'POST', headers }), on as never, {
        store,
        verifyUser: async req => users[req.headers.get('authorization')?.slice(7) ?? ''] ?? null,
        now: () => new Date(NOW),
        sendConfirmLink: options.sender === false ? null : async (to, userId) => { sent.push({ to, userId }); return true },
        confirmLinkAllowed: confirmLinkLimiter(windows.env),
      })
    }
    return { store, sent, send, windows }
  }

  it('is a profile route, signed-in only, and off with the profiles switch', async () => {
    expect(isProfileApiPath('/api/profile/confirm-link')).toBe(true)
    const { send, sent } = setup()
    expect((await send()).status).toBe(401)
    expect((await send('nobody')).status).toBe(401)
    const store = new MemoryStore()
    const off = await handleProfiles(new Request('https://tinct.app/api/profile/confirm-link', { method: 'POST', headers: { authorization: `Bearer ${A}` } }), { ...on, SOCIAL_PROFILES: '0' } as never, {
      store, verifyUser: async () => users[A], sendConfirmLink: async () => true, confirmLinkAllowed: async () => true,
    })
    expect(off.status).toBe(404)
    expect(store.calls).toBe(0)
    expect(sent).toEqual([])
  })

  it('sends one email to the reader\'s own address, then refuses for 5 minutes and after 5 a day', async () => {
    const { send, sent, windows } = setup()
    const first = await send(A)
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ ok: true })
    expect(sent).toEqual([{ to: 'anders.h@example.com', userId: A }])
    expect((await send(A)).status).toBe(429)
    expect(sent).toHaveLength(1)
    windows.advance(5 * 60_000)
    for (let i = 0; i < 4; i++) {
      expect((await send(A)).status).toBe(200)
      windows.advance(5 * 60_000)
    }
    expect(sent).toHaveLength(5)
    expect((await send(A)).status).toBe(429)
    expect(sent).toHaveLength(5)
    // Per account: another reader is not held up.
    expect((await send(C)).status).toBe(200)
    expect(sent).toHaveLength(6)
  })

  it('sends nothing when the email is already confirmed (Google counts as confirmed)', async () => {
    const { store, send, sent } = setup()
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T09:00:00Z'
    expect(await (await send(A)).json()).toEqual({ ok: true, confirmed: true })
    expect(await (await send(B)).json()).toEqual({ ok: true, confirmed: true })
    expect(sent).toEqual([])
  })

  it('says nothing about an address: no stored or a different stored address answers like a send, and sends nothing', async () => {
    const { store, send, sent } = setup()
    store.accounts.get(A)!.email = 'someone.else@example.com'
    store.accounts.get(C)!.email = null
    for (const id of [A, C]) {
      const response = await send(id)
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ ok: true })
    }
    expect(sent).toEqual([])
  })

  it('without a sender (no EMAIL_LINK_SECRET or BREVO_API_KEY) or a limiter it is a 503 and sends nothing', async () => {
    const { send } = setup({ sender: false })
    expect((await send(A)).status).toBe(503)
    expect(confirmLinkSender({ BREVO_API_KEY: 'k' })).toBeNull()
    expect(confirmLinkSender({ EMAIL_LINK_SECRET: secret })).toBeNull()
    expect(await confirmLinkLimiter({})(A)).toBe(false)
  })

  it('the email: welcome-email wording and the signed link /confirm accepts, sent to a real account past the lifecycle test gate', async () => {
    expect(LIFECYCLE_TEST_GATE).toBe(true)
    expect(isLifecycleTestRecipient('reader@gmail.com')).toBe(false)
    const brevo = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ messageId: 'x' }))
    vi.stubGlobal('fetch', brevo)
    const sender = confirmLinkSender({ EMAIL_LINK_SECRET: secret, BREVO_API_KEY: 'k', LIFECYCLE_EMAILS: '0' }, () => NOW)!
    expect(await sender('reader@gmail.com', A)).toBe(true)
    expect(brevo).toHaveBeenCalledTimes(1)
    const [target, init] = brevo.mock.calls[0]
    expect(String(target)).toBe('https://api.brevo.com/v3/smtp/email')
    const body = JSON.parse(String(init!.body)) as { to: { email: string }[]; subject: string; htmlContent: string; textContent: string; headers?: unknown }
    expect(body.to).toEqual([{ email: 'reader@gmail.com' }])
    expect(body.subject).toBe(CONFIRM_LINK_SUBJECT)
    expect(body.headers).toBeUndefined()
    expect(body.htmlContent).toContain('One click confirms this is your address:')
    expect(body.htmlContent).toContain('>Confirm my email</a>')
    const link = body.textContent.match(/Confirm my email: (\S+)/)![1]
    expect(link).toMatch(/^https:\/\/tinct\.app\/confirm\?t=/)
    expect(await verifyLink(secret, new URL(link).searchParams.get('t'), 'c', NOW)).toMatchObject({ u: A })
    expect(body.htmlContent).toContain(`href="${link}"`)
    expect(confirmLinkEmail('https://tinct.app/confirm?t=a"b').html).toContain('t=a&quot;b')
  })
})

describe('the confirmation email at sign-up (Anders, 9 Oct 2026)', () => {
  const NOW = Date.parse('2026-10-08T10:00:00Z')
  const fresh = new Date(NOW - 60_000).toISOString()

  /** MemoryStore plus public.email_log's unique (user_id, dedupe_key) reservation. */
  class LoggedStore extends MemoryStore {
    log: { user_id: string; template: string; dedupe_key: string }[] = []
    async reserveEmail(id: string, template: string, dedupeKey: string) {
      if (this.log.some(row => row.user_id === id && row.dedupe_key === dedupeKey)) return false
      this.log.push({ user_id: id, template, dedupe_key: dedupeKey }); return true
    }
    async releaseEmail(id: string, dedupeKey: string) { this.log = this.log.filter(row => !(row.user_id === id && row.dedupe_key === dedupeKey)) }
  }

  function setup(options: { sender?: (to: string, userId: string) => Promise<boolean>; env?: Record<string, unknown>; defer?: boolean } = {}) {
    const store = new LoggedStore(); seed(store)
    for (const id of [A, B, C, D]) store.accounts.get(id)!.email = users[id].email
    const signedUp: Record<string, ProfileAuthUser> = {
      [A]: { ...users[A], created_at: fresh },
      [B]: { ...users[B], created_at: fresh },
      [C]: { ...users[C], created_at: '2026-10-01T10:00:00Z' },
      [D]: { ...users[D] },
    }
    const sent: { to: string; userId: string }[] = []
    const deferred: Promise<unknown>[] = []
    const sender = options.sender ?? (async (to: string, userId: string) => { sent.push({ to, userId }); return true })
    const read = async (as: string, method = 'GET') => {
      const response = await handleProfiles(new Request('https://tinct.app/api/profile', {
        method,
        headers: { authorization: `Bearer ${as}`, 'content-type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ showTime: true }) : undefined,
      }), (options.env ?? on) as never, {
        store,
        verifyUser: async req => signedUp[req.headers.get('authorization')?.slice(7) ?? ''] ?? null,
        now: () => new Date(NOW),
        random: () => 0.42,
        sendConfirmLink: sender,
        confirmLinkAllowed: async () => true,
        defer: options.defer ? promise => { deferred.push(promise) } : undefined,
      })
      await Promise.all(deferred)
      return response
    }
    return { store, sent, read }
  }

  it('an email sign-up gets the confirmation email once, on the first profile read, logged in email_log', async () => {
    const { store, sent, read } = setup()
    const first = await read(A)
    expect(first.status).toBe(200)
    expect(sent).toEqual([{ to: 'anders.h@example.com', userId: A }])
    expect(store.log).toEqual([{ user_id: A, template: 'confirm-email', dedupe_key: 'confirm-email:-' }])
    await read(A)
    await read(A, 'POST')
    expect(sent).toHaveLength(1)
  })

  it('it is an account email: sent with LIFECYCLE_EMAILS "0" and whatever the reading-email choice', async () => {
    const { store, sent, read } = setup({ env: { ...on, LIFECYCLE_EMAILS: '0' } })
    store.accounts.get(A)!.email_opt_in = false
    await read(A)
    expect(sent).toHaveLength(1)
  })

  it('never for Google, an already confirmed address, an account older than 48 hours, or an unknown sign-up time', async () => {
    const { store, sent, read } = setup()
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T09:59:00Z'
    for (const id of [A, B, C, D]) await read(id)
    expect(sent).toEqual([])
    expect(store.log).toEqual([])
  })

  it('only to the address the reader signed up with (as "Send confirmation link")', async () => {
    const { store, sent, read } = setup()
    store.accounts.get(A)!.email = 'someone.else@example.com'
    await read(A)
    expect(sent).toEqual([])
  })

  it('a send failure never blocks the profile; the reservation is released so a later read can try again', async () => {
    let fail = true
    const sent: string[] = []
    const { store, read } = setup({
      sender: async to => {
        if (fail) throw new Error('brevo down')
        sent.push(to); return true
      },
    })
    const response = await read(A)
    expect(response.status).toBe(200)
    expect(((await response.json()) as { profile: { handle: string } }).profile.handle).toBe('reader4780')
    expect(store.log).toEqual([])
    fail = false
    await read(A)
    await read(A)
    expect(sent).toEqual(['anders.h@example.com'])
  })

  it('a refused send (false) or a failing email log never blocks the profile either', async () => {
    const refused = setup({ sender: async () => false })
    expect((await refused.read(A)).status).toBe(200)
    expect(refused.store.log).toEqual([])
    const broken = setup()
    broken.store.reserveEmail = async () => { throw new Error('email_log 404') }
    expect((await broken.read(A)).status).toBe(200)
    expect(broken.sent).toEqual([])
  })

  it('without a sender (no EMAIL_LINK_SECRET or BREVO_API_KEY) nothing is reserved or sent', async () => {
    const store = new LoggedStore(); seed(store)
    store.accounts.get(A)!.email = users[A].email
    const response = await handleProfiles(new Request('https://tinct.app/api/profile', { headers: { authorization: `Bearer ${A}` } }), on as never, {
      store, verifyUser: async () => ({ ...users[A], created_at: fresh }), now: () => new Date(NOW), random: () => 0.42, sendConfirmLink: null,
    })
    expect(response.status).toBe(200)
    expect(store.log).toEqual([])
  })

  it('in the Worker it runs after the reply (waitUntil), so a slow send never delays sign-up', async () => {
    const { sent, read } = setup({ defer: true })
    expect((await read(A)).status).toBe(200)
    expect(sent).toHaveLength(1)
  })

  it('the Everyone rule is unchanged: sending the email confirms nothing; Everyone counts as Friends until the link is used', async () => {
    const { store, read } = setup()
    await read(A)
    expect(store.accounts.get(A)!.email_confirmed_at).toBeNull()
    const saved = await (await post(store, A, { visibility: 'everyone' })).json() as { profile: { visibility: string; effectiveVisibility: string; emailConfirmed: boolean } }
    expect(saved.profile).toMatchObject({ visibility: 'everyone', effectiveVisibility: 'friends', emailConfirmed: false })
    expect(effectiveVisibility('everyone', false)).toBe('friends')
    expect(effectiveVisibility('friends', false)).toBe('friends')
    expect(effectiveVisibility('everyone', true)).toBe('everyone')
  })

  it('the Supabase store reserves in email_log (unique per reader and key) and releases on failure', async () => {
    const calls: { url: string; init?: RequestInit }[] = []
    let answer: Response = Response.json([{ id: 1 }], { status: 201 })
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => { calls.push({ url: String(input), init }); return answer.clone() }))
    const { supabaseProfileStore } = await import('./worker/lib/profileStore')
    const store = supabaseProfileStore(on)
    expect(await store.reserveEmail!(A, 'confirm-email', 'confirm-email:-')).toBe(true)
    expect(calls[0].url).toBe('https://example.supabase.co/rest/v1/email_log?on_conflict=user_id,dedupe_key')
    expect(calls[0].init?.method).toBe('POST')
    expect(new Headers(calls[0].init?.headers).get('Prefer')).toBe('resolution=ignore-duplicates,return=representation')
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ user_id: A, template: 'confirm-email', book_id: null, dedupe_key: 'confirm-email:-', meta: {} })
    answer = Response.json([], { status: 201 })
    expect(await store.reserveEmail!(A, 'confirm-email', 'confirm-email:-')).toBe(false)
    answer = Response.json({ message: 'relation "email_log" does not exist' }, { status: 404 })
    expect(await store.reserveEmail!(A, 'confirm-email', 'confirm-email:-')).toBe(false)
    answer = new Response(null, { status: 204 })
    await store.releaseEmail!(A, 'confirm-email:-')
    expect(calls[calls.length - 1].url).toBe(`https://example.supabase.co/rest/v1/email_log?user_id=eq.${A}&dedupe_key=eq.confirm-email%3A-`)
    expect(calls[calls.length - 1].init?.method).toBe('DELETE')
  })
})

// The profile-flow brief (Anders, 22 Oct 2026): reading languages, returning accounts, Public / Private.
describe('reading languages and returning accounts', () => {
  it('a new profile reads in English; the reader can choose Danish too, and at least one stays', async () => {
    const store = new MemoryStore()
    seed(store)
    const first = await (await call(store, '/api/profile', { as: A })).json() as { profile: { readingLanguages: string[]; returning: boolean } }
    expect(first.profile.readingLanguages).toEqual(['en'])
    expect(store.profiles.get(A)!.reading_languages).toEqual(['en'])
    const both = await (await post(store, A, { readingLanguages: ['da', 'en'] })).json() as { profile: { readingLanguages: string[] } }
    expect(both.profile.readingLanguages).toEqual(['en', 'da'])
    for (const bad of [[], ['de'], ['en', 'en'], 'en', null]) {
      const res = await post(store, A, { readingLanguages: bad })
      expect(res.status).toBe(422)
    }
    expect(store.profiles.get(A)!.reading_languages).toEqual(['en', 'da'])
  })

  it('a row from before the column reads as English', async () => {
    const store = new MemoryStore()
    seed(store)
    await call(store, '/api/profile', { as: A })
    delete store.profiles.get(A)!.reading_languages
    const view = await (await call(store, '/api/profile', { as: A })).json() as { profile: { readingLanguages: string[] } }
    expect(view.profile.readingLanguages).toEqual(['en'])
  })

  it('returning: only an account more than 30 days old', async () => {
    const store = new MemoryStore()
    seed(store)
    users[C].created_at = '2026-09-07T09:59:59Z'
    users[D].created_at = '2026-09-08T10:00:00Z'
    try {
      const old = await (await call(store, '/api/profile', { as: C })).json() as { profile: { returning: boolean } }
      const fresh = await (await call(store, '/api/profile', { as: D })).json() as { profile: { returning: boolean } }
      expect(old.profile.returning).toBe(true)
      expect(fresh.profile.returning).toBe(false)
    } finally {
      delete users[C].created_at
      delete users[D].created_at
    }
  })

  it('Public saves Everyone with the three switches on; an unconfirmed email counts as Friends', async () => {
    const store = new MemoryStore()
    seed(store)
    await call(store, '/api/profile', { as: A })
    const view = await (await post(store, A, { visibility: 'everyone', showReading: true, showTime: true, onLeaderboard: true, setUp: true })).json() as { profile: { visibility: string; effectiveVisibility: string; showReading: boolean; showTime: boolean; onLeaderboard: boolean; setUp: boolean } }
    expect(view.profile).toMatchObject({ visibility: 'everyone', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: true, setUp: true })
    const priv = await (await post(store, A, { visibility: 'only_me', showReading: false, showTime: false, onLeaderboard: false, setUp: true })).json() as { profile: Record<string, unknown> }
    expect(priv.profile).toMatchObject({ visibility: 'only_me', showReading: false, showTime: false, onLeaderboard: false })
  })

  it('Skip (prompted only) changes no profile choice and leaves the profile not set up', async () => {
    const store = new MemoryStore()
    seed(store)
    await call(store, '/api/profile', { as: A })
    const before = { ...store.profiles.get(A)! }
    await post(store, A, { prompted: true })
    const after = store.profiles.get(A)!
    expect({ ...after, prompted_at: null }).toEqual({ ...before, prompted_at: null })
    expect(after.set_up_at).toBeNull()
  })
})
