// A signed-out guest's Talk trial (Anders, 16 Oct 2026): one conversation per
// IP per day, at most two minutes, reserved against the guest AI ceiling and
// relayed through the Worker so the two minutes are enforced here. Every xAI
// socket is a fake; nothing leaves the process.
import { createRequire } from 'node:module'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { UsageCoordinator } from './worker/usageCoordinator'
import { createRateLimiter } from './worker/lib/rateLimit'
import { createGuestSpendHolder } from './worker/lib/aiSpend'
import { handleLabVoiceRelay, handleLabVoiceSession, type RelaySocket } from './worker/routes/voice'
import {
  TALK_TRIAL_CHECKS_PER_DAY, TALK_TRIAL_CLOSE_CODE, TALK_TRIAL_RESERVE_MICROS, TALK_TRIAL_SECONDS,
  TALK_TRIAL_TICKET_SECONDS, TALK_TRIAL_USED_CODE, verifyTalkTicket,
} from './worker/lib/talkTrial'
import { GROK_VOICE_MODEL } from './voice/grokConfig'

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string) => any }

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
function namespace() {
  const objects = new Map<string, UsageCoordinator>()
  return {
    objects,
    getByName(name: string) {
      if (!objects.has(name)) objects.set(name, new UsageCoordinator({ storage: storage() } as unknown as DurableObjectState, {}))
      return objects.get(name)!
    },
  }
}

const NOW = Date.parse('2026-10-16T12:00:00Z')
const IP = '203.0.113.7'

function setup(options: { dailyCents?: string } = {}) {
  const ns = namespace()
  const env = {
    XAI_API_KEY: 'xai-test-key',
    AI_LEDGER_SALT: 'salt',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    GUEST_AI_DAILY_CENTS: options.dailyCents,
    USAGE_COORDINATOR: ns as unknown as DurableObjectNamespace<UsageCoordinator>,
  }
  const checkRateLimit = createRateLimiter(env)
  const hold = createGuestSpendHolder(env, () => NOW)
  const spent = () => ns.getByName('spend:guest-ai:2026-10').usage().find(row => row.day === '2026-10-16')?.units ?? 0
  return { ns, env, checkRateLimit, hold, spent }
}

function start(env: ReturnType<typeof setup>['env'], deps: ReturnType<typeof setup>, headers: Record<string, string> = {}) {
  return handleLabVoiceSession(new Request('https://tinct.app/api/lab-voice-session', {
    method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': IP, ...headers }, body: '{}',
  }), env, deps.checkRateLimit, deps.hold, () => NOW)
}

class FakeSocket implements RelaySocket {
  accepted = false
  sent: Array<string | ArrayBuffer> = []
  closed: { code?: number; reason?: string } | null = null
  listeners: Record<string, Array<(event: any) => void>> = {}
  accept() { this.accepted = true }
  send(data: string | ArrayBuffer) { if (this.closed) throw new Error('closed'); this.sent.push(data) }
  close(code?: number, reason?: string) { if (!this.closed) this.closed = { code, reason } }
  addEventListener(type: string, listener: (event: any) => void) { (this.listeners[type] ??= []).push(listener) }
  emit(type: string, event: unknown) { for (const listener of this.listeners[type] ?? []) listener(event) }
}

function makeCtx() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}

function relayRequest(ticket: string) {
  return new Request('https://tinct.app/api/lab-voice-relay', {
    headers: { upgrade: 'websocket', 'sec-websocket-protocol': `tinct-ticket.${ticket}`, 'cf-connecting-ip': IP },
  })
}

describe('guest Talk trial: the session route', () => {
  beforeEach(() => { vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('allows a guest once a day, reserving two minutes of Talk, and never mints an xAI secret for the browser', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const deps = setup()
    const response = await start(deps.env, deps)
    expect(response.status).toBe(200)
    const body = await response.json() as { value: string; expires_at: number; model: string; relay: string; max_seconds: number }
    expect(body).toMatchObject({ model: GROK_VOICE_MODEL, relay: '/api/lab-voice-relay', max_seconds: 120 })
    expect(TALK_TRIAL_SECONDS).toBe(120)
    // A relay ticket, not a provider secret: xAI is never contacted to start a trial.
    expect(fetchMock).not.toHaveBeenCalled()
    expect(body.value).not.toContain('xai')
    const ticket = await verifyTalkTicket(deps.env, body.value, NOW)
    expect(ticket).toMatchObject({ d: '2026-10-16', u: TALK_TRIAL_RESERVE_MICROS, c: false })
    expect(body.expires_at).toBe(Math.floor(NOW / 1000) + TALK_TRIAL_TICKET_SECONDS)
    // Two minutes at the voice ledger's $0.08 a minute.
    expect(TALK_TRIAL_RESERVE_MICROS).toBe(160_000)
    expect(deps.spent()).toBe(160_000)
    // The trial key is hashed: no object name carries the raw IP.
    expect([...deps.ns.objects.keys()].some(name => name.startsWith('rl:talk-trial:') && name.includes(IP))).toBe(false)
  })

  it('refuses the second trial that day with the trial code, and gives its reservation back', async () => {
    const deps = setup()
    expect((await start(deps.env, deps)).status).toBe(200)
    const second = await start(deps.env, deps)
    expect(second.status).toBe(429)
    expect(await second.json()).toMatchObject({ code: TALK_TRIAL_USED_CODE })
    expect(deps.spent()).toBe(160_000)
  })

  it('refuses when the guest ceiling is full, without spending the day\'s trial', async () => {
    const deps = setup({ dailyCents: '10' }) // $0.10 < two minutes ($0.16)
    const response = await start(deps.env, deps)
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'AI is resting — try again later.', code: 'ai_resting' })
    expect([...deps.ns.objects.keys()].some(name => name.startsWith('rl:talk-trial:'))).toBe(false)
  })

  it("gives Tinct's own checks a small shared daily pool, never more trials per IP", async () => {
    const deps = setup()
    const check = { 'x-tinct-check': '1' }
    for (let i = 0; i < TALK_TRIAL_CHECKS_PER_DAY; i++) {
      // A different runner IP each time does not matter: the pool is shared.
      const response = await handleLabVoiceSession(new Request('https://tinct.app/api/lab-voice-session', {
        method: 'POST', headers: { 'cf-connecting-ip': `198.51.100.${i}`, ...check }, body: '{}',
      }), deps.env, deps.checkRateLimit, deps.hold, () => NOW)
      expect(response.status).toBe(200)
    }
    expect((await start(deps.env, deps, check)).status).toBe(429)
    // The pool is separate from the reader's own trial on that IP.
    expect((await start(deps.env, deps)).status).toBe(200)
  })
})

describe('guest Talk trial: the relay', () => {
  beforeEach(() => { vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  async function openRelay(deps: ReturnType<typeof setup>, upstream: FakeSocket | null = new FakeSocket()) {
    const ledger: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/rest/v1/ai_usage_events')) { ledger.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
      throw new Error(`unexpected fetch ${String(input)}`)
    }))
    const ticket = (await (await start(deps.env, deps)).json() as { value: string }).value
    const client = new FakeSocket()
    const server = new FakeSocket()
    let clock = NOW
    let timer: { fn: () => void; ms: number } | null = null
    const { ctx, pending } = makeCtx()
    let respondedWith: string | null = null
    const response = await handleLabVoiceRelay(relayRequest(ticket), deps.env, ctx, deps.checkRateLimit, {
      connectUpstream: async () => upstream,
      createPair: () => [client, server],
      respond: (_socket, protocol) => { respondedWith = protocol; return new Response(null, { status: 200 }) },
      now: () => clock,
      setTimer: (fn, ms) => { timer = { fn, ms }; return 1 },
      clearTimer: () => { timer = null },
    })
    return {
      response, ticket, client, server, upstream, ledger, pending, ctx,
      respondedWith: () => respondedWith,
      timer: () => timer,
      advance: (ms: number) => { clock += ms },
    }
  }

  it('relays frames both ways unchanged and closes the call at two minutes, metering it under the guest key', async () => {
    const deps = setup()
    const relay = await openRelay(deps)
    expect(relay.response.status).toBe(200)
    expect(relay.respondedWith()).toBe(`tinct-ticket.${relay.ticket}`)
    expect(relay.server.accepted && relay.upstream!.accepted).toBe(true)
    relay.server.emit('message', { data: '{"type":"session.update"}' })
    relay.upstream!.emit('message', { data: '{"type":"session.updated"}' })
    expect(relay.upstream!.sent).toEqual(['{"type":"session.update"}'])
    expect(relay.server.sent).toEqual(['{"type":"session.updated"}'])
    // The cap is the Worker's timer, at exactly two minutes.
    expect(relay.timer()?.ms).toBe(120_000)
    relay.advance(120_000)
    relay.timer()!.fn()
    expect(relay.server.closed).toEqual({ code: TALK_TRIAL_CLOSE_CODE, reason: 'talk_trial_ended' })
    expect(relay.upstream!.closed).toEqual({ code: TALK_TRIAL_CLOSE_CODE, reason: 'talk_trial_ended' })
    await Promise.all(relay.pending)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(relay.ledger).toHaveLength(1)
    expect(relay.ledger[0]).toMatchObject({ user_id: null, feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds: 120, cost_usd: 0.16 })
    expect(typeof relay.ledger[0].guest_key).toBe('string')
    expect(relay.ledger[0].guest_key).not.toContain(IP)
    // Two full minutes used the whole reservation.
    expect(deps.spent()).toBe(160_000)
  })

  it('drops a frame that arrives after the two minutes and ends the call, even without the timer', async () => {
    const deps = setup()
    const relay = await openRelay(deps)
    relay.advance(120_001)
    relay.server.emit('message', { data: 'late audio' })
    expect(relay.upstream!.sent).toEqual([])
    expect(relay.server.closed?.code).toBe(TALK_TRIAL_CLOSE_CODE)
    await Promise.all(relay.pending)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(relay.ledger[0]).toMatchObject({ seconds: 120 })
  })

  it('a call the guest ends early is metered for its length and gives the rest of the reservation back', async () => {
    const deps = setup()
    const relay = await openRelay(deps)
    relay.advance(30_000)
    relay.server.emit('close', { code: 1000, reason: '' })
    expect(relay.upstream!.closed?.code).toBe(1000)
    await Promise.all(relay.pending)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(relay.ledger[0]).toMatchObject({ seconds: 30, cost_usd: 0.04 })
    expect(deps.spent()).toBe(40_000)
  })

  it('opens one relay per ticket', async () => {
    const deps = setup()
    const relay = await openRelay(deps)
    const again = await handleLabVoiceRelay(relayRequest(relay.ticket), deps.env, relay.ctx, deps.checkRateLimit, {
      connectUpstream: async () => new FakeSocket(), createPair: () => [new FakeSocket(), new FakeSocket()], respond: () => new Response(null), now: () => NOW,
    })
    expect(again.status).toBe(401)
  })

  it('refuses a forged or expired ticket before contacting xAI', async () => {
    const deps = setup()
    const connectUpstream = vi.fn(async () => new FakeSocket())
    const forged = await handleLabVoiceRelay(relayRequest('e30.AAAA'), deps.env, makeCtx().ctx, deps.checkRateLimit, { connectUpstream })
    expect(forged.status).toBe(401)
    const ticket = (await (await start(deps.env, deps)).json() as { value: string }).value
    const late = await handleLabVoiceRelay(relayRequest(ticket), deps.env, makeCtx().ctx, deps.checkRateLimit, { connectUpstream, now: () => NOW + 31_000 })
    expect(late.status).toBe(401)
    expect(connectUpstream).not.toHaveBeenCalled()
  })

  it('gives the trial and the reservation back when xAI does not connect', async () => {
    const deps = setup()
    const relay = await openRelay(deps, null)
    expect(relay.response.status).toBe(502)
    expect(deps.spent()).toBe(0)
    // The guest can start again today.
    expect((await start(deps.env, deps)).status).toBe(200)
  })
})
