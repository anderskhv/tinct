import { createRequire } from 'node:module'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { UsageCoordinator } from './usageCoordinator'
import { createRateLimiter } from './lib/rateLimit'
import { createGuestSpendReserver, estimateAiCostMicros, guestAiDailyMicros } from './lib/aiSpend'

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string) => any }

/** Real SQLite behind the Durable Object SQL surface the coordinator uses. */
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
    deleteAll: async () => { db.exec('DROP TABLE IF EXISTS request_window'); db.exec('DROP TABLE IF EXISTS spend'); alarm = null },
    get alarm() { return alarm },
  }
}

function coordinator(store = storage()) {
  return new UsageCoordinator({ storage: store } as unknown as DurableObjectState, {})
}

describe('usage coordinator', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-30T12:00:00Z')) })
  afterEach(() => vi.useRealTimers())

  it('counts concurrent requests atomically within one window', async () => {
    const c = coordinator()
    const results = await Promise.all(Array.from({ length: 8 }, () => c.hit(5, 60_000)))
    expect(results.filter(Boolean)).toHaveLength(5)
    vi.advanceTimersByTime(60_000)
    expect(await c.hit(5, 60_000)).toBe(true)
  })

  it('reserves against a daily limit and never over-commits', () => {
    const c = coordinator()
    expect(c.reserve('2026-09-30', 600, 1_000)).toBe(true)
    expect(c.reserve('2026-09-30', 600, 1_000)).toBe(false)
    expect(c.reserve('2026-09-30', 400, 1_000)).toBe(true)
    expect(c.reserve('2026-10-01', 600, 1_000)).toBe(true)
    expect(c.reserve('not-a-day', 1, 1_000)).toBe(false)
    expect(c.usage()).toEqual([{ day: '2026-09-30', units: 1_000 }, { day: '2026-10-01', units: 600 }])
  })

  it('clears an idle request window', async () => {
    const store = storage()
    const c = coordinator(store)
    await c.hit(1, 60_000)
    expect(store.alarm).toBe(Date.now() + 120_000)
    vi.advanceTimersByTime(120_000)
    await c.alarm()
    expect(await coordinator(store).hit(1, 60_000)).toBe(true)
  })

  it('keeps counting on the same instance after an idle window is cleared', async () => {
    const c = coordinator()
    expect(await c.hit(1, 60_000)).toBe(true)
    vi.advanceTimersByTime(120_000)
    await c.alarm()
    expect(await c.hit(1, 60_000)).toBe(true)
    expect(await c.hit(1, 60_000)).toBe(false)
    expect(c.reserve('2026-09-30', 1, 10)).toBe(true)
  })
})

describe('rate limiter and ceiling fail closed', () => {
  it('refuses without a binding or when the coordinator fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await createRateLimiter({})('chat:x')).toBe(false)
    const broken = { getByName: () => ({ hit: async () => { throw new Error('down') } }) }
    expect(await createRateLimiter({ USAGE_COORDINATOR: broken as any })('chat:x')).toBe(false)
    expect(await createGuestSpendReserver({})(100)).toBe(false)
    warn.mockRestore()
  })

  it('routes each key and budget to its own coordinator', async () => {
    const names: string[] = []
    const hit = vi.fn(async () => true)
    const reserve = vi.fn(async () => true)
    const namespace = { getByName: (name: string) => { names.push(name); return { hit, reserve } } }
    expect(await createRateLimiter({ USAGE_COORDINATOR: namespace as any })('lab-chat:1.2.3.4', undefined, 6)).toBe(true)
    expect(hit).toHaveBeenCalledWith(6, 60_000)
    const reserver = createGuestSpendReserver({ USAGE_COORDINATOR: namespace as any, GUEST_AI_DAILY_CENTS: '250' }, () => Date.parse('2026-09-30T23:00:00Z'))
    expect(await reserver(1234.2)).toBe(true)
    expect(reserve).toHaveBeenCalledWith('2026-09-30', 1235, 2_500_000)
    expect(names).toEqual(['rl:lab-chat:1.2.3.4', 'spend:guest-ai:2026-09'])
  })

  it('defaults the ceiling and estimates cost from characters and output bound', () => {
    expect(guestAiDailyMicros({})).toBe(5_000_000)
    expect(guestAiDailyMicros({ GUEST_AI_DAILY_CENTS: 'nope' })).toBe(5_000_000)
    expect(estimateAiCostMicros({ inputChars: 4_000, maxTokens: 100 })).toBe(1_000 * 3 + 100 * 15)
    expect(estimateAiCostMicros({ inputChars: 4_000, maxTokens: 100, tools: true })).toBe(1_500 * 3 + 100 * 15)
  })
})
