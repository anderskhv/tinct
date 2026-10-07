import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import {
  handleProfiles,
  isProfileApiPath,
  stripJpegMetadata,
  type ProfileAuthUser,
} from './worker/routes/profiles'
import { ProfilesUnavailable, type AccountRow, type ProfileStore, type PublicCardRow, type ReaderProfileRow } from './worker/lib/profileStore'
import { SOCIAL_ENTRY_SCRIPT, SOCIAL_META, withSocialMarkers } from './worker/routes/socialPages'
import { EMAIL_CONSENT_VERSION, effectiveVisibility } from './social/profileRules'
import { confirmUrl } from './worker/lifecycle/links'
import { handleEmailLink } from './worker/routes/emailLinks'

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

  it('the Worker router leaves /api/profile, /you and every page exactly as before', async () => {
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
      const you = await worker.fetch(new Request('https://tinct.app/you'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(you.status).toBe(404)
      const api = await worker.fetch(new Request('https://tinct.app/api/profile'), { ...env, SOCIAL_PROFILES: off } as never, ctx)
      expect(api.status).toBe(404)
    }
    // No Supabase call was made for any of it.
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('reader_profiles'))).toBe(false)
  })

  it('switch on marks the library, reader and sign-in pages, and only those', async () => {
    const page = (path: string) => withSocialMarkers(new Response('<html><head></head><body></body></html>', { headers: { 'content-type': 'text/html' } }), new Request(`https://tinct.app${path}`))
    expect(await (await page('/library')).text()).toContain(SOCIAL_META + SOCIAL_ENTRY_SCRIPT)
    expect(await (await page('/reader')).text()).toContain(SOCIAL_META)
    expect(await (await page('/reader')).text()).not.toContain(SOCIAL_ENTRY_SCRIPT)
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
  it('created on first read: Only me, name and link from the email, the book they are reading', async () => {
    const store = new MemoryStore(); seed(store)
    const response = await call(store, '/api/profile?book=odyssey', { as: A })
    const { profile } = await response.json() as { profile: Record<string, unknown> }
    expect(profile).toMatchObject({
      handle: 'anders.h', link: 'tinct.app/@anders.h', name: 'Anders H',
      picture: { kind: 'set', value: 'at-sea' }, background: { kind: 'set', value: 'at-sea' },
      visibility: 'only_me', effectiveVisibility: 'only_me', onLeaderboard: false,
      needsSetup: true, shouldPrompt: true, emailConfirmed: false,
    })
    // Nobody else can see it.
    expect((await call(store, '/api/profiles/anders.h', { as: C })).status).toBe(404)
    expect((await call(store, '/api/profiles/anders.h')).status).toBe(404)
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
    expect((await post(store, C, { handle: 'anders.h' })).status).toBe(409)
    expect((await post(store, C, { handle: 'ANDERS.H' })).status).toBe(409)
    expect((await post(store, C, { visibility: 'public' })).status).toBe(422)
    expect((await post(store, C, { handle: 'cee.reads' })).status).toBe(200)
    expect(store.profiles.get(C)!.handle).toBe('cee.reads')
    const check = await (await call(store, '/api/profile/handle?h=Cee.Reads', { as: A })).json()
    expect(check).toMatchObject({ ok: false, reason: 'taken' })
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
    const response = await call(store, '/api/profiles/anders.h', viewer ? { as: viewer } : {})
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
    expect((await look(store, D))!.limited).toBe(true)
    expect((await look(store, null))!.limited).toBe(true)
    expect((await look(store, B))!.limited).toBe(true)
    expect((await look(store, B))!.shows).toEqual({ reading: false, time: false, leaderboard: false })
    expect((await look(store, C))!.limited).toBe(false)
    await post(store, A, { showReading: false, onLeaderboard: true })
    expect((await look(store, C))!.shows).toEqual({ reading: false, time: true, leaderboard: true })
  })

  it('Everyone is blocked until the email is confirmed', async () => {
    const store = await world()
    const saved = await (await post(store, A, { visibility: 'everyone' })).json() as { profile: { visibility: string; effectiveVisibility: string } }
    expect(saved.profile).toMatchObject({ visibility: 'everyone', effectiveVisibility: 'friends' })
    expect((await look(store, D))!.limited).toBe(true)
    expect((await look(store, B))!.limited).toBe(true)
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
    const body = await (await call(store, '/api/profiles/anders.h', { as: D })).text()
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

  it('visible to the owner at once, to others only after approval', async () => {
    const store = new MemoryStore(); seed(store)
    store.accounts.get(A)!.email_confirmed_at = '2026-10-08T11:00:00Z'
    const objects = new Map<string, Uint8Array>()
    const bucket = {
      put: async (key: string, value: Uint8Array) => { objects.set(key, value) },
      get: async (key: string) => objects.has(key) ? { body: objects.get(key), httpMetadata: { contentType: 'image/jpeg' } } : null,
      delete: async (key: string) => { objects.delete(key) },
    }
    const env = { ...on, USER_BOOKS: bucket }
    await post(store, A, { visibility: 'everyone' }, env)
    const upload = await call(store, '/api/profile/image?slot=picture', { method: 'POST', as: A, body: jpegWithExif() as BodyInit }, env)
    const { profile } = await upload.json() as { profile: { picture: { kind: string; url: string; review: string } } }
    expect(profile.picture).toMatchObject({ kind: 'upload', review: 'pending' })
    expect([...objects.values()][0].length).toBeLessThan(jpegWithExif().length)
    expect((await call(store, profile.picture.url, { as: A }, env)).status).toBe(200)
    expect((await call(store, profile.picture.url, { as: D }, env)).status).toBe(404)
    expect((await call(store, profile.picture.url, {}, env)).status).toBe(404)
    const seen = await (await call(store, '/api/profiles/anders.h', { as: D }, env)).json() as { profile: { picture: { kind: string } } }
    expect(seen.profile.picture.kind).toBe('initial')
    store.profiles.get(A)!.picture_review = 'approved'
    expect((await call(store, profile.picture.url, { as: D }, env)).status).toBe(200)
    // Choosing a set removes the stored photo.
    await post(store, A, { picture: { kind: 'set', value: 'stoic' } }, env)
    expect(objects.size).toBe(0)
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
