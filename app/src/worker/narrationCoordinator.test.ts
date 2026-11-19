import { createRequire } from 'node:module'
import { describe, expect, it, vi } from 'vitest'
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    ctx: any; env: any
    constructor(ctx: any, env: any) { this.ctx = ctx; this.env = env }
  },
}))
import { NarrationCoordinator } from './narrationCoordinator'

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as { DatabaseSync: new (path: string) => any }

/** Real SQLite behind the Durable Object SQL surface the coordinator uses. */
function storage() {
  const db = new DatabaseSync(':memory:')
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
    deleteAll: async () => { db.exec('DROP TABLE IF EXISTS lease'); db.exec('DROP TABLE IF EXISTS spend') },
  }
}

const coordinator = () => new NarrationCoordinator({ storage: storage() } as unknown as DurableObjectState, {})

describe('narration coordinator: own-book account ceiling', () => {
  it('holds a calendar month to its limit and starts again next month', () => {
    const c = coordinator()
    expect(c.reserveMonth('2026-10-01', 600, 1_000)).toBe(true)
    expect(c.reserveMonth('2026-10-20', 600, 1_000)).toBe(false)
    expect(c.reserveMonth('2026-10-20', 400, 1_000)).toBe(true)
    expect(c.reserveMonth('2026-11-01', 1_000, 1_000)).toBe(true)
    expect(c.reserveMonth('bad', 1, 1_000)).toBe(false)
  })

  it('keeps at most the previous month of rows', () => {
    const c = coordinator()
    c.reserveMonth('2026-08-31', 10, 1_000)
    c.reserveMonth('2026-09-15', 10, 1_000)
    c.reserveMonth('2026-10-02', 10, 1_000)
    expect(c.usage().map(row => row.day)).toEqual(['2026-09-15', '2026-10-02'])
  })

  it('refunds without going below zero, and purges everything', async () => {
    const c = coordinator()
    c.reserveMonth('2026-10-02', 500, 1_000)
    c.refund('2026-10-02', 800)
    expect(c.usage()).toEqual([{ day: '2026-10-02', bytes: 0 }])
    await c.purge()
    expect(c.usage()).toEqual([])
    // Still usable after a purge.
    expect(c.reserveMonth('2026-10-02', 500, 1_000)).toBe(true)
  })

  it('leaves the shared monthly reserve unchanged', () => {
    const c = coordinator()
    expect(c.reserve('2026-10-02', 600, 1_000, 2_000)).toBe(true)
    expect(c.reserve('2026-10-02', 600, 1_000, 2_000)).toBe(false)
  })
})
