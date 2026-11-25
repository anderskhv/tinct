// A signed-out guest's listening trial (Anders, 25 Nov 2026): five minutes a
// day of narration that already exists, enforced in the Worker with the Talk
// trial's mechanism (a UsageCoordinator slot per UTC day and hashed IP). The
// Grok provider is a fake fetch: nothing leaves the process, nothing is paid.
import { createRequire } from 'node:module'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { UsageCoordinator } from './worker/usageCoordinator'
import { handleNarration, type NarrationDeps, type NarrationEnv } from './worker/routes/narration'
import {
  LISTEN_TRIAL_CHECK_SERVED_SECONDS, LISTEN_TRIAL_SECONDS, LISTEN_TRIAL_SERVED_SECONDS, LISTEN_TRIAL_USED_CODE, listenTrialSlot,
} from './worker/lib/listenTrial'
import { syntheticMp3 } from './narration/narrationTestFixtures'
import { LISTEN_TRIAL_USED_CODE as READER_USED_CODE } from './lab/labNarration'
import { LISTEN_TRIAL_SECONDS as READER_TRIAL_SECONDS } from './lab/labListenTrial'

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string) => any }
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function storage() {
  const db = new DatabaseSync(':memory:')
  let alarm: number | null = null
  const exec = (query: string, ...bindings: unknown[]) => {
    const rows = /^\s*SELECT/i.test(query) ? db.prepare(query).all(...bindings) : (db.prepare(query).run(...bindings), [])
    return { toArray: () => rows, one: () => rows[0] }
  }
  return {
    sql: { exec },
    transactionSync<T>(fn: () => T): T {
      db.exec('BEGIN')
      try { const value = fn(); db.exec('COMMIT'); return value } catch (error) { db.exec('ROLLBACK'); throw error }
    },
    getAlarm: async () => alarm,
    setAlarm: async (value: number) => { alarm = value },
  }
}

/** One real coordinator per object name, as the Durable Object namespace gives. */
function usageNamespace() {
  const objects = new Map<string, UsageCoordinator>()
  return {
    objects,
    getByName(name: string) {
      if (!objects.has(name)) objects.set(name, new UsageCoordinator({ storage: storage() } as unknown as DurableObjectState, {}))
      return objects.get(name)!
    },
  }
}

class FakeR2 {
  store = new Map<string, Uint8Array>()
  async get(key: string) {
    const value = this.store.get(key)
    if (!value) return null
    return { key, size: value.length, body: value, json: async () => JSON.parse(decoder.decode(value)),
      arrayBuffer: async () => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) }
  }
  async head(key: string) { const value = this.store.get(key); return value ? { key, size: value.length } : null }
  async put(key: string, value: Uint8Array | string) { this.store.set(key, typeof value === 'string' ? encoder.encode(value) : value) }
  async list(options: { prefix: string }) { return { objects: [...this.store.keys()].filter(key => key.startsWith(options.prefix)).map(key => ({ key })) } }
  async delete(key: string) { this.store.delete(key) }
}

class FakeKV {
  store = new Map<string, string>()
  async get(key: string, type?: string) { const value = this.store.get(key); return value == null ? null : type === 'json' ? JSON.parse(value) : value }
  async put(key: string, value: string) { this.store.set(key, value) }
  async delete(key: string) { this.store.delete(key) }
}

const PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy.',
  'So now all who escaped death in battle or by shipwreck had got safely home except Ulysses.',
  'But there! It rests with heaven to determine whether he is to return.',
]
const NOW = Date.parse('2026-11-25T12:00:00Z')
const GUEST_IP = '203.0.113.7'
const SIGNED_IN = { id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' }

function setup(options: { usage?: boolean } = {}) {
  const usage = usageNamespace()
  const provider: string[] = []
  let user: { id: string; email: string } | null = SIGNED_IN
  const env = {
    NARRATION_PILOT: '1',
    NARRATION_PROVIDER: 'grok',
    XAI_API_KEY: 'grok-test',
    AI_LEDGER_SALT: 'salt',
    AUDIO_BUCKET: new FakeR2() as unknown as R2Bucket,
    RATE_LIMIT: new FakeKV() as unknown as KVNamespace,
    NARRATION_COORDINATOR: { getByName: () => ({ claim: async () => true, release: async () => {}, reserve: async () => true, refund: async () => {}, usage: async () => [] }) } as unknown as NarrationEnv['NARRATION_COORDINATOR'],
    ...(options.usage === false ? {} : { USAGE_COORDINATOR: usage as unknown as NarrationEnv['USAGE_COORDINATOR'] }),
    ASSETS: {
      fetch: async (request: Request) => new URL(request.url).pathname === '/data/editions/odyssey-original-en.json'
        ? Response.json({ chapters: [{ number: 1, title: 'Book 1', paragraphs: PARAGRAPHS }] })
        : new Response('Not found', { status: 404 }),
    },
  } as NarrationEnv
  // The only "provider": a fake Grok answer. Every call is recorded so a test can assert none happened.
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const text = JSON.parse(String(init?.body ?? '{}')).text as string
    provider.push(text)
    const chars = Array.from(text)
    const duration = 5.224
    return Response.json({ audio: btoa(String.fromCharCode(...syntheticMp3(200))), duration,
      audio_timestamps: { graph_chars: chars, graph_times: chars.map((_, i) => [i * duration / chars.length, (i + 1) * duration / chars.length]) } })
  }) as typeof fetch
  const clock = { now: NOW }
  const deps: NarrationDeps = {
    verifyUser: async () => user,
    verifySiteAdmin: async () => false,
    checkRateLimit: async () => true,
    fetchImpl,
    now: () => clock.now,
    sleep: async () => {},
  }
  const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext
  const ensure = async (paragraphs: number[], headers: Record<string, string> = {}) => {
    const response = await handleNarration(new Request('https://tinct.app/api/narration/ensure', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': GUEST_IP, ...(user ? { authorization: 'Bearer token' } : {}), ...headers },
      body: JSON.stringify({ bookId: 'odyssey', editionKey: 'original-en', chapter: 1, voice: 'f', mode: 'next', paragraphs: paragraphs.map(index => ({ index })) }),
    }), env, ctx, deps)
    return { status: response.status, json: await response.json() as { code?: string; generated?: number; paragraphs: Array<{ status: string; chunks: Array<{ ready: boolean; duration?: number }> }> } }
  }
  const slot = async (check = false) => listenTrialSlot(env, { ip: GUEST_IP, check, day: new Date(clock.now).toISOString().slice(0, 10) })
  /** Seconds counted in today's slot (the window row's count). */
  const counted = async (check = false) => {
    const name = (await slot(check)).name
    if (!usage.objects.has(name)) return 0
    const row = (usage.objects.get(name) as unknown as { ctx: { storage: ReturnType<typeof storage> } }).ctx.storage.sql.exec('SELECT count FROM request_window WHERE id=1').toArray()[0] as { count: number } | undefined
    return row?.count ?? 0
  }
  return {
    env, usage, provider, clock, ensure, slot, counted,
    signIn: () => { user = SIGNED_IN },
    signOut: () => { user = null },
  }
}

const servedSeconds = (json: { paragraphs: Array<{ chunks: Array<{ ready: boolean; duration?: number }> }> }) =>
  json.paragraphs.flatMap(paragraph => paragraph.chunks).filter(chunk => chunk.ready).reduce((sum, chunk) => sum + (chunk.duration ?? 0), 0)

describe('guest listening trial (Worker)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW) })
  afterEach(() => vi.useRealTimers())

  it('is five minutes for the reader, and twice that for what the Worker hands out (the buffer ahead)', () => {
    expect(LISTEN_TRIAL_SECONDS).toBe(300)
    expect(LISTEN_TRIAL_SERVED_SECONDS).toBe(600)
    // The reader stops at the same five minutes and knows the Worker's refusal.
    expect(READER_TRIAL_SECONDS).toBe(LISTEN_TRIAL_SECONDS)
    expect(READER_USED_CODE).toBe(LISTEN_TRIAL_USED_CODE)
  })

  it('serves a guest narration that already exists, under the limit, and counts it against the hashed IP', async () => {
    const t = setup()
    expect((await t.ensure([0])).status).toBe(200) // signed in: recorded once (fake provider)
    expect((await t.ensure([1])).status).toBe(200)
    const made = t.provider.length
    expect(made).toBeGreaterThan(0)
    t.signOut()
    const guest = await t.ensure([0])
    expect(guest.status).toBe(200)
    expect(guest.json.generated).toBe(0)
    expect(guest.json.paragraphs[0].status).toBe('ready')
    expect(t.provider).toHaveLength(made)
    const seconds = servedSeconds(guest.json)
    expect(seconds).toBeGreaterThan(0)
    expect(await t.counted()).toBe(Math.ceil(seconds))
    // The slot is named by the day and a hashed key: the raw address is never stored.
    const name = (await t.slot()).name
    expect(name).toMatch(/^rl:listen-trial:2026-11-25:[0-9a-f]{20}$/)
    expect(name).not.toContain(GUEST_IP)
  })

  it('refuses a guest once today\'s trial is used, with the account sheet\'s 401', async () => {
    const t = setup()
    await t.ensure([0])
    await t.ensure([1])
    t.signOut()
    // Just under the ceiling: this answer is served (it is one buffer at most), the next is refused.
    await t.usage.getByName((await t.slot()).name).hitUnits(LISTEN_TRIAL_SERVED_SECONDS - 1, LISTEN_TRIAL_SERVED_SECONDS, 86_400_000)
    expect((await t.ensure([0])).status).toBe(200)
    const refused = await t.ensure([1])
    expect(refused.status).toBe(401)
    expect(refused.json.code).toBe(LISTEN_TRIAL_USED_CODE)
    // The next UTC day is a new trial.
    t.clock.now = Date.parse('2026-11-26T00:00:05Z')
    vi.setSystemTime(t.clock.now)
    expect((await t.ensure([1])).status).toBe(200)
  })

  it('never makes new narration for a guest: a paragraph without a recording is refused and nothing is counted', async () => {
    const t = setup()
    t.signOut()
    const refused = await t.ensure([2])
    expect(refused.status).toBe(401)
    expect(refused.json.code).toBeUndefined()
    expect(t.provider).toHaveLength(0)
    expect(await t.counted()).toBe(0)
  })

  it('refuses a guest when the coordinator is missing (fails closed, as Talk\'s trial does)', async () => {
    const t = setup({ usage: false })
    await t.ensure([0])
    t.signOut()
    expect((await t.ensure([0])).status).toBe(401)
  })

  it('leaves a signed-in reader unchanged: served and generated past a used guest trial, nothing counted', async () => {
    const t = setup()
    await t.usage.getByName((await t.slot()).name).hitUnits(LISTEN_TRIAL_SERVED_SECONDS, LISTEN_TRIAL_SERVED_SECONDS, 86_400_000)
    const before = await t.counted()
    const reader = await t.ensure([2])
    expect(reader.status).toBe(200)
    expect(reader.json.generated).toBe(1)
    expect((await t.ensure([2])).status).toBe(200)
    expect(await t.counted()).toBe(before)
  })

  it('counts Tinct\'s own checks in their shared pool, not a visitor\'s slot', async () => {
    const t = setup()
    await t.ensure([0])
    t.signOut()
    expect((await t.ensure([0], { 'x-tinct-check': '1' })).status).toBe(200)
    expect(await t.counted()).toBe(0)
    expect(await t.counted(true)).toBeGreaterThan(0)
    expect((await t.slot(true))).toEqual({ name: 'rl:listen-trial:2026-11-25:check', limit: LISTEN_TRIAL_CHECK_SERVED_SECONDS })
  })
})
