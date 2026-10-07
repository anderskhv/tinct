import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleNarration, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import {
  OWN_BOOK_MAX_PARAGRAPH_CHARS,
  handleOwnAudio,
  handleOwnEnsure,
  ownBookNarrationLimits,
  usdToNarrationBytes,
} from './worker/routes/ownBookNarration'
import { handleUserBooks } from './worker/routes/userBooks'
import { fakeUserBooksBucket } from './worker/fakeUserBooksBucket'
import { narrationTextForParagraph, sha256Hex } from './narration/narrationCore'
import { syntheticMp3 } from './narration/narrationTestFixtures'

/**
 * Read-aloud of a reader's own book (routes/ownBookNarration.ts). The provider
 * is a stub: no request leaves the test. Storage is the private USER_BOOKS
 * fake; AUDIO_BUCKET is a recorder that must never be written.
 */

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const SHA_A = 'ab12cd34ef56ab12cd34ef56'.padEnd(64, '0')
const SHA_OTHER = '99887766554433221100aabb'.padEnd(64, '1')
const HEX = SHA_A.slice(0, 24)
const PARAGRAPHS = [
  'It was a dark night and the lamp was lit.',
  'The morning came over the hills, and the house woke slowly.',
]

class RecordingBucket {
  writes: string[] = []
  reads: string[] = []
  async put(key: string) { this.writes.push(key); return null }
  async get(key: string) { this.reads.push(key); return null }
  async head(key: string) { this.reads.push(key); return null }
  async list() { return { objects: [] } }
  async delete(key: string) { this.writes.push(`delete:${key}`) }
}

class FakeKV {
  store = new Map<string, string>()
  async get(key: string, type?: string) { const value = this.store.get(key); return value == null ? null : type === 'json' ? JSON.parse(value) : value }
  async put(key: string, value: string) { this.store.set(key, value) }
  async delete(key: string) { this.store.delete(key) }
}

function coordinator() {
  const names: string[] = []
  const spend = new Map<string, Map<string, number>>()
  const held = new Map<string, string>()
  const rows = (name: string) => { let map = spend.get(name); if (!map) { map = new Map(); spend.set(name, map) } return map }
  const namespace = {
    getByName: (name: string) => {
      names.push(name)
      return {
        claim: async (token: string) => { if (held.has(name)) return false; held.set(name, token); return true },
        release: async (token: string) => { if (held.get(name) === token) held.delete(name) },
        reserve: async (day: string, bytes: number, daily: number, monthly: number) => {
          const map = rows(name)
          const total = [...map.values()].reduce((a, b) => a + b, 0)
          if ((map.get(day) ?? 0) + bytes > daily || total + bytes > monthly) return false
          map.set(day, (map.get(day) ?? 0) + bytes)
          return true
        },
        reserveMonth: async (day: string, bytes: number, monthly: number) => {
          const map = rows(name)
          const total = [...map.entries()].filter(([d]) => d.startsWith(day.slice(0, 7))).reduce((a, [, b]) => a + b, 0)
          if (total + bytes > monthly) return false
          map.set(day, (map.get(day) ?? 0) + bytes)
          return true
        },
        refund: async (day: string, bytes: number) => { const map = rows(name); map.set(day, Math.max(0, (map.get(day) ?? 0) - bytes)) },
        usage: async () => [...rows(name).entries()].map(([day, bytes]) => ({ day, bytes })),
        purge: async () => { spend.delete(name) },
      }
    },
  }
  const total = (name: string) => [...(spend.get(name)?.values() ?? [])].reduce((a, b) => a + b, 0)
  return { namespace, names, total }
}

function setup(options: { on?: boolean; env?: Record<string, string> } = {}) {
  const userBooks = fakeUserBooksBucket()
  const audio = new RecordingBucket()
  const kv = new FakeKV()
  const coord = coordinator()
  const book = (owner: string, sha: string, id: string) => userBooks.objects.set(`u/${owner}/${id}`, {
    key: `u/${owner}/${id}`, bytes: new Uint8Array(100), uploaded: new Date('2026-10-01T00:00:00Z'),
    customMetadata: { name: 'Mine.epub', title: 'Mine', author: '', type: 'epub', sha256: sha, createdAt: '2026-10-01T00:00:00.000Z' },
  })
  book(A, SHA_A, 'a'.repeat(32))
  book(A, SHA_OTHER, 'c'.repeat(32))
  // Reader B owns a different file only.
  book(B, SHA_OTHER, 'b'.repeat(32))
  const env = {
    NARRATION_PILOT: '1',
    NARRATION_PROVIDER: 'grok',
    XAI_API_KEY: 'grok-test',
    NARRATION_GROK_BASE_URL: 'https://grok.test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    ...(options.on === false ? {} : { OWN_BOOK_NARRATION: '1' }),
    AUDIO_BUCKET: audio,
    USER_BOOKS: userBooks.bucket,
    RATE_LIMIT: kv,
    NARRATION_COORDINATOR: coord.namespace,
    ...options.env,
  } as unknown as NarrationEnv
  // Supabase: profiles (Premium check) and the cost ledger. Both readers subscribe by default.
  const profiles: Record<string, Record<string, unknown>> = {
    [A]: { subscription_status: 'active', subscription_period_end: null, created_at: '2026-01-01T00:00:00Z' },
    [B]: { subscription_status: 'active', subscription_period_end: null, created_at: '2026-01-01T00:00:00Z' },
  }
  const ledgerRows: Record<string, unknown>[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/profiles?')) {
      const id = /id=eq\.([0-9a-f-]+)/.exec(url)?.[1] ?? ''
      return Response.json(profiles[id] ? [profiles[id]] : [])
    }
    if (url.endsWith('/rest/v1/ai_usage_events')) { ledgerRows.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
    throw new Error(`unexpected fetch ${url}`)
  }))
  const providerCalls: string[] = []
  const fetchImpl = (async (_input: string | URL | Request, init?: RequestInit) => {
    const text = (JSON.parse(String(init?.body ?? '{}')) as { text?: string }).text ?? ''
    providerCalls.push(text)
    const duration = 3.2
    const chars = Array.from(text)
    return Response.json({ audio: btoa(String.fromCharCode(...syntheticMp3(200))), duration,
      audio_timestamps: { graph_chars: chars, graph_times: chars.map((_, i) => [i * duration / chars.length, (i + 1) * duration / chars.length]) } })
  }) as typeof fetch
  const clock = { now: Date.UTC(2026, 9, 7, 12, 0, 0) }
  const users: Record<string, string> = { 'Bearer token-a': A, 'Bearer token-b': B }
  const deps: NarrationDeps = {
    verifyUser: async (_env, request) => { const id = users[request.headers.get('authorization') ?? '']; return id ? { id, email: `${id}@example.com` } : null },
    verifySiteAdmin: async () => false,
    checkRateLimit: async () => true,
    fetchImpl,
    now: () => clock.now,
    sleep: async (ms: number) => { clock.now += ms },
  }
  const ctx = { waited: [] as Promise<unknown>[], waitUntil(promise: Promise<unknown>) { this.waited.push(promise) }, passThroughOnException() {} } as unknown as ExecutionContext & { waited: Promise<unknown>[] }
  return { env, deps, ctx, userBooks, audio, kv, coord, providerCalls, clock, profiles, ledgerRows }
}

type World = ReturnType<typeof setup>

async function ensure(w: World, body: Record<string, unknown>, token: string | null = 'token-a') {
  const request = new Request('https://tinct.app/api/narration/own/ensure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ book: HEX, voice: 'f', mode: 'all', paragraphs: PARAGRAPHS.map((text, index) => ({ index, text })), ...body }),
  })
  const response = await handleOwnEnsure(request, w.env, w.ctx, w.deps)
  await Promise.all(w.ctx.waited)
  return { status: response.status, json: await response.json() as Record<string, any> }
}

afterEach(() => { vi.unstubAllGlobals() })

describe('own-book narration: switch and scope', () => {
  it('with the switch off answers exactly today’s 403, and the shared route still refuses user books', async () => {
    for (const on of [false, true]) {
      const w = setup({ on })
      const legacy = await handleNarration(new Request('https://tinct.app/api/narration/ensure', {
        method: 'POST', headers: { Authorization: 'Bearer token-a' },
        body: JSON.stringify({ bookId: `userbook-${HEX}`, editionKey: 'own-en', chapter: 1, voice: 'f', paragraphs: [{ index: 0 }] }),
      }), w.env, w.ctx, w.deps)
      expect(legacy.status).toBe(403)
      expect(await legacy.json()).toEqual({ error: 'Outside the narration scope' })
      if (on) continue
      const own = await ensure(w, {})
      expect(own).toEqual({ status: 403, json: { error: 'Outside the narration scope' } })
      const file = await handleOwnAudio(new Request(`https://tinct.app/api/narration/own/audio?u=${A}`), w.env, w.clock.now)
      expect(file.status).toBe(403)
      expect(w.providerCalls).toEqual([])
    }
  })

  it('tells the reader whether own books can be read aloud, without naming any book', async () => {
    const off = await handleNarration(new Request('https://tinct.app/api/narration/voices'), setup({ on: false }).env, {} as ExecutionContext, setup().deps)
    expect((await off.json() as { ownBooks: boolean }).ownBooks).toBe(false)
    const w = setup()
    const on = await handleNarration(new Request('https://tinct.app/api/narration/voices'), w.env, w.ctx, w.deps)
    expect((await on.json() as { ownBooks: boolean }).ownBooks).toBe(true)
    // Without its private bucket the feature is off even with the switch on.
    const unbound = setup()
    delete (unbound.env as { USER_BOOKS?: unknown }).USER_BOOKS
    const res = await handleNarration(new Request('https://tinct.app/api/narration/voices'), unbound.env, unbound.ctx, unbound.deps)
    expect((await res.json() as { ownBooks: boolean }).ownBooks).toBe(false)
  })

  it('is for signed-in owners only: signed out is 401, another reader’s book is 404', async () => {
    const w = setup()
    expect((await ensure(w, {}, null)).status).toBe(401)
    // Reader B has never stored this file: same hex, different account.
    expect(await ensure(w, {}, 'token-b')).toEqual({ status: 404, json: { error: 'Not found' } })
    expect(w.providerCalls).toEqual([])
    expect(w.userBooks.calls.put).toBe(0)
  })

  it('caps request text', async () => {
    const w = setup()
    const long = await ensure(w, { paragraphs: [{ index: 0, text: 'word '.repeat(OWN_BOOK_MAX_PARAGRAPH_CHARS / 5 + 1) }] })
    expect(long.status).toBe(413)
    const many = await ensure(w, { paragraphs: [0, 1, 2, 3].map(index => ({ index, text: 'x' })) })
    expect(many.status).toBe(400)
    const huge = await handleOwnEnsure(new Request('https://tinct.app/api/narration/own/ensure', {
      method: 'POST', headers: { Authorization: 'Bearer token-a' }, body: 'x'.repeat(200 * 1024),
    }), w.env, w.ctx, w.deps)
    expect(huge.status).toBe(413)
    expect(w.providerCalls).toEqual([])
  })
})

describe('own-book narration: Premium only', () => {
  const day = 86_400_000
  it('refuses a free account past its trial with 402, before any provider call', async () => {
    const w = setup()
    w.profiles[A] = { subscription_status: null, subscription_period_end: null, created_at: new Date(w.clock.now - 31 * day).toISOString() }
    expect(await ensure(w, {})).toEqual({ status: 402, json: { error: 'Premium required', reason: 'premium_required' } })
    // A cancelled subscription whose paid period has ended is a free account too.
    w.profiles[A] = { subscription_status: 'canceled', subscription_period_end: new Date(w.clock.now - day).toISOString(), created_at: '2026-01-01T00:00:00Z' }
    expect((await ensure(w, {})).status).toBe(402)
    expect(w.providerCalls).toEqual([])
    expect(w.coord.total(`own-user:${A}`)).toBe(0)
  })

  it('allows a reader in the 30-day trial', async () => {
    const w = setup()
    w.profiles[A] = { subscription_status: null, subscription_period_end: null, created_at: new Date(w.clock.now - 29 * day).toISOString() }
    const res = await ensure(w, {})
    expect(res.status).toBe(200)
    expect(w.providerCalls).toEqual(PARAGRAPHS)
  })

  it('allows a subscriber, including a cancelled one until the paid period ends', async () => {
    const w = setup()
    expect((await ensure(w, {})).status).toBe(200)
    const v = setup()
    v.profiles[A] = { subscription_status: 'canceled', subscription_period_end: new Date(v.clock.now + day).toISOString(), created_at: '2026-01-01T00:00:00Z' }
    expect((await ensure(v, {})).status).toBe(200)
  })

  it('fails closed when the profile cannot be read', async () => {
    const w = setup()
    delete (w.env as { SUPABASE_URL?: unknown }).SUPABASE_URL
    expect((await ensure(w, {})).status).toBe(503)
    expect(w.providerCalls).toEqual([])
  })
})

describe('own-book narration: private storage', () => {
  it('stores audio only under the owner’s narration prefix, serves it behind a signed link, and never touches AUDIO_BUCKET', async () => {
    const w = setup()
    const first = await ensure(w, {})
    expect(first.status).toBe(200)
    expect(first.json.paragraphs.map((p: { status: string }) => p.status)).toEqual(['ready', 'ready'])
    expect(first.json.paragraphs[0].textHash).toBe(await sha256Hex(narrationTextForParagraph(PARAGRAPHS[0])))
    expect(w.providerCalls).toEqual(PARAGRAPHS)
    const written = [...w.userBooks.objects.keys()].filter(key => key.includes('/narration/'))
    expect(written).toHaveLength(4)
    expect(written.every(key => key.startsWith(`u/${A}/narration/${HEX}/`))).toBe(true)
    expect(w.audio.writes).toEqual([])
    expect(w.audio.reads).toEqual([])
    // Metadata carries timings, not the paragraph text.
    const meta = [...w.userBooks.objects.values()].find(item => item.key.endsWith('.json'))!
    expect(new TextDecoder().decode(meta.bytes)).not.toContain(PARAGRAPHS[0])

    const chunk = first.json.paragraphs[0].chunks[0]
    expect(chunk.url).toMatch(/^\/api\/narration\/own\/audio\?/)
    const served = await handleOwnAudio(new Request(`https://tinct.app${chunk.url}`), w.env, w.clock.now)
    expect(served.status).toBe(200)
    expect(served.headers.get('Content-Type')).toBe('audio/mpeg')
    expect(served.headers.get('Cache-Control')).toMatch(/^private, max-age=\d+$/)
    expect((await served.arrayBuffer()).byteLength).toBeGreaterThan(800)

    // The signature binds account, book, recording and expiry.
    const url = new URL(chunk.url, 'https://tinct.app')
    const tamper = (name: string, value: string) => { const copy = new URL(url); copy.searchParams.set(name, value); return copy.toString() }
    for (const forged of [tamper('u', B), tamper('h', 'f'.repeat(64)), tamper('s', '0'.repeat(64)), tamper('e', String(Number(url.searchParams.get('e')) + 3600_000))]) {
      expect((await handleOwnAudio(new Request(forged), w.env, w.clock.now)).status).toBe(404)
    }
    expect((await handleOwnAudio(new Request(url.toString()), w.env, Number(url.searchParams.get('e')) + 1)).status).toBe(404)

    // A second request is answered from the private store: no new synthesis.
    const again = await ensure(w, {})
    expect(again.json.paragraphs.map((p: { status: string }) => p.status)).toEqual(['ready', 'ready'])
    expect(w.providerCalls).toHaveLength(2)
  })

  it('never shares recordings between accounts: the same file read by two readers is two private copies', async () => {
    const w = setup()
    w.userBooks.objects.set(`u/${B}/${'d'.repeat(32)}`, { ...w.userBooks.objects.get(`u/${A}/${'a'.repeat(32)}`)!, key: `u/${B}/${'d'.repeat(32)}` })
    await ensure(w, {})
    await ensure(w, {}, 'token-b')
    expect(w.providerCalls).toEqual([...PARAGRAPHS, ...PARAGRAPHS])
    const keys = [...w.userBooks.objects.keys()].filter(key => key.includes('/narration/'))
    expect(keys.filter(key => key.startsWith(`u/${A}/`))).toHaveLength(4)
    expect(keys.filter(key => key.startsWith(`u/${B}/`))).toHaveLength(4)
  })

  it('records spend as narration_generate with the userbook marker, never the book id or text', async () => {
    const w = setup()
    const rows = w.ledgerRows
    await ensure(w, {})
    expect(rows).toHaveLength(2)
    for (const row of rows) {
      expect(row).toMatchObject({ user_id: A, feature: 'narration_generate', provider: 'xai', book_id: 'userbook', cache_hit: false })
      expect(row.cost_usd).toBeGreaterThan(0)
      expect(JSON.stringify(row)).not.toContain(HEX)
      expect(JSON.stringify(row)).not.toContain('lamp')
    }
  })
})

describe('own-book narration: ceilings', () => {
  it('converts dollars with the TTS price ($20 ≈ 1.33 M characters a month, $100 the pool)', () => {
    expect(usdToNarrationBytes(20)).toBe(1_333_333)
    expect(ownBookNarrationLimits({} as NarrationEnv)).toMatchObject({ accountUsd: 20, globalUsd: 100, accountBytes: 1_333_333, globalBytes: 6_666_666 })
  })

  it('answers 429 with a reason once the account’s monthly cap is reached', async () => {
    // A cap below one chunk.
    const w = setup({ env: { OWN_BOOK_NARRATION_MONTHLY_USD: '0.0001' } })
    const res = await ensure(w, {})
    expect(res).toEqual({ status: 429, json: { error: 'Narration limit reached', reason: 'own_book_cap' } })
    expect(w.providerCalls).toEqual([])
  })

  it('counts toward its own pool, never the shared narration budget', async () => {
    const w = setup()
    await ensure(w, {})
    const bytes = PARAGRAPHS.reduce((sum, text) => sum + new TextEncoder().encode(text).length, 0)
    expect(w.coord.total(`own-user:${A}`)).toBe(bytes)
    expect(w.coord.total('own-budget:2026-10')).toBe(bytes)
    expect(w.coord.names.some(name => name.startsWith('budget:'))).toBe(false)
    expect([...w.kv.store.keys()].some(key => key.startsWith('narration:usage'))).toBe(false)
    // No coordinator name carries the book in the clear.
    expect(w.coord.names.some(name => name.includes(HEX))).toBe(false)
  })

  it('stops at the pool and gives the account its share back', async () => {
    const w = setup({ env: { OWN_BOOK_NARRATION_GLOBAL_MONTHLY_USD: '0.0001' } })
    const res = await ensure(w, {})
    expect(res).toEqual({ status: 429, json: { error: 'Narration limit reached', reason: 'own_book_pool' } })
    expect(w.coord.total(`own-user:${A}`)).toBe(0)
    expect(w.providerCalls).toEqual([])
  })
})

describe('own-book narration: deletion', () => {
  it('deleting a book deletes its narration, and only its narration', async () => {
    const w = setup()
    await ensure(w, {})
    // Narration for the reader's other book, and for another reader.
    w.userBooks.objects.set(`u/${A}/narration/${SHA_OTHER.slice(0, 24)}/x.mp3`, { key: `u/${A}/narration/${SHA_OTHER.slice(0, 24)}/x.mp3`, bytes: new Uint8Array(1), uploaded: new Date(), customMetadata: {} })
    w.userBooks.objects.set(`u/${B}/narration/${HEX}/y.mp3`, { key: `u/${B}/narration/${HEX}/y.mp3`, bytes: new Uint8Array(1), uploaded: new Date(), customMetadata: {} })
    const verifyUser = async (request: Request) => (request.headers.get('authorization') === 'Bearer token-a' ? { id: A } : null)
    const res = await handleUserBooks(new Request(`https://tinct.app/api/user-books/${'a'.repeat(32)}`, { method: 'DELETE', headers: { Authorization: 'Bearer token-a' } }), { USER_BOOKS: w.userBooks.bucket }, { verifyUser, checkRateLimit: async () => true })
    expect(res.status).toBe(200)
    const left = [...w.userBooks.objects.keys()]
    expect(left.filter(key => key.startsWith(`u/${A}/narration/${HEX}/`))).toEqual([])
    expect(left).toContain(`u/${A}/narration/${SHA_OTHER.slice(0, 24)}/x.mp3`)
    expect(left).toContain(`u/${B}/narration/${HEX}/y.mp3`)
    // With the book gone, narration for it is refused.
    expect((await ensure(w, {})).status).toBe(404)
  })

  it('narration does not show up as a book or count toward the account’s storage', async () => {
    const w = setup()
    await ensure(w, {})
    const verifyUser = async () => ({ id: A })
    const res = await handleUserBooks(new Request('https://tinct.app/api/user-books', { headers: { Authorization: 'Bearer token-a' } }), { USER_BOOKS: w.userBooks.bucket }, { verifyUser, checkRateLimit: async () => true })
    const body = await res.json() as { books: Array<{ id: string }> }
    expect(body.books.map(book => book.id).sort()).toEqual(['a'.repeat(32), 'c'.repeat(32)])
  })
})
