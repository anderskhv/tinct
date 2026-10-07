import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../../worker'
import { MODERN_EDITION_CRON } from './publicBookModern'
import {
  RETENTION_BATCH,
  RETENTION_CRON,
  RETENTION_SUBREQUEST_BUDGET,
  RETENTION_TABLES,
  retentionCutoff,
  runRetentionCleanup,
} from './retention'

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const NOW = new Date('2026-10-06T03:17:00.000Z')
const CUTOFF = '2024-10-06T03:17:00.000Z'
const REST = 'https://example.supabase.co/rest/v1/'

type Call = { method: string; path: string }

function uuid(n: number): string {
  return `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
}

/** Mocked Supabase REST: `older[table]` is how many rows lie before the cutoff. */
function mockSupabase(older: Record<string, number>, options: { failDelete?: string } = {}) {
  const calls: Call[] = []
  const remaining = { ...older }
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    expect(url.startsWith(REST)).toBe(true)
    const path = url.slice(REST.length)
    calls.push({ method, path })
    const table = path.split('?')[0]
    if (method === 'GET') {
      const limit = Number(new URL(url).searchParams.get('limit'))
      const count = Math.min(remaining[table] ?? 0, limit)
      const offset = (older[table] ?? 0) - (remaining[table] ?? 0)
      const rows = Array.from({ length: count }, (_, i) => ({ id: table === 'ai_usage_events' ? String(offset + i + 1) : uuid(offset + i + 1) }))
      return Response.json(rows)
    }
    if (method === 'DELETE') {
      if (options.failDelete === table) return new Response('nope', { status: 500 })
      const ids = /id=in\.\(([^)]*)\)/.exec(path)?.[1].split(',') ?? []
      remaining[table] = (remaining[table] ?? 0) - ids.length
      return new Response(null, { status: 204 })
    }
    throw new Error(`unexpected ${method}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock }
}

describe('retentionCutoff', () => {
  it('is exactly 24 calendar months earlier, in UTC', () => {
    expect(retentionCutoff(NOW)).toBe(CUTOFF)
    expect(retentionCutoff(new Date('2027-01-31T23:59:59.999Z'))).toBe('2025-01-31T23:59:59.999Z')
  })

  it('clamps a missing day to the end of the month, never later', () => {
    expect(retentionCutoff(new Date('2028-02-29T12:00:00.000Z'))).toBe('2026-02-28T12:00:00.000Z')
  })
})

describe('runRetentionCleanup', () => {
  let logs: string[]
  beforeEach(() => {
    logs = []
    vi.spyOn(console, 'log').mockImplementation((line: unknown) => { logs.push(String(line)) })
    vi.spyOn(console, 'error').mockImplementation((line: unknown) => { logs.push(String(line)) })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('covers the analytics and usage tables by created_at', () => {
    expect(RETENTION_TABLES).toEqual([
      { table: 'analytics_events', column: 'created_at' },
      { table: 'ai_usage_events', column: 'created_at' },
      { table: 'token_usage', column: 'created_at' },
    ])
  })

  it('deletes nothing when no row is older than 24 months (today)', async () => {
    const { calls } = mockSupabase({})
    const result = await runRetentionCleanup(env, NOW)

    expect(calls).toEqual([
      { method: 'GET', path: `analytics_events?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `ai_usage_events?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `token_usage?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
    ])
    expect(result?.tables.map(t => [t.table, t.deleted, t.complete])).toEqual([
      ['analytics_events', 0, true], ['ai_usage_events', 0, true], ['token_usage', 0, true],
    ])
  })

  it('deletes old rows in bounded batches, each filtered by id AND created_at=lt.<cutoff>', async () => {
    const { calls } = mockSupabase({ analytics_events: RETENTION_BATCH + 3, ai_usage_events: 2 })
    const result = await runRetentionCleanup(env, NOW)

    const deletes = calls.filter(call => call.method === 'DELETE')
    expect(deletes).toHaveLength(3)
    for (const call of deletes) {
      expect(call.path).toMatch(new RegExp(`^(analytics_events|ai_usage_events)\\?id=in\\.\\([^)]+\\)&created_at=lt\\.${CUTOFF.replace(/\./g, '\\.')}$`))
      const ids = /id=in\.\(([^)]*)\)/.exec(call.path)![1].split(',')
      expect(ids.length).toBeGreaterThan(0)
      expect(ids.length).toBeLessThanOrEqual(RETENTION_BATCH)
    }
    expect(deletes[0].path.split('id=in.(')[1].split(')')[0].split(',')).toHaveLength(RETENTION_BATCH)
    expect(deletes[2].path).toBe(`ai_usage_events?id=in.(1,2)&created_at=lt.${CUTOFF}`)
    expect(calls.filter(call => call.method === 'GET').every(call => call.path.includes(`&created_at=lt.${CUTOFF}&`))).toBe(true)

    expect(result?.tables).toEqual([
      { table: 'analytics_events', deleted: RETENTION_BATCH + 3, batches: 2, complete: true },
      { table: 'ai_usage_events', deleted: 2, batches: 1, complete: true },
      { table: 'token_usage', deleted: 0, batches: 0, complete: true },
    ])
  })

  it('is idempotent: a second run finds nothing left and deletes nothing', async () => {
    mockSupabase({ token_usage: 5 })
    await runRetentionCleanup(env, NOW)
    const { calls } = mockSupabase({})
    const second = await runRetentionCleanup(env, NOW)
    expect(calls.some(call => call.method === 'DELETE')).toBe(false)
    expect(second?.tables.every(t => t.deleted === 0 && t.complete)).toBe(true)
  })

  it('stops at its subrequest budget and leaves the rest for the next run', async () => {
    const { fetchMock } = mockSupabase({ analytics_events: RETENTION_BATCH * 100 })
    const result = await runRetentionCleanup(env, NOW)
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(RETENTION_SUBREQUEST_BUDGET)
    expect(result?.tables[0]).toMatchObject({ complete: false, deleted: RETENTION_BATCH * (RETENTION_SUBREQUEST_BUDGET / 2) })
    expect(result?.tables[1]).toMatchObject({ deleted: 0, complete: false })
  })

  it('stops a table on a failed delete and moves on', async () => {
    const { calls } = mockSupabase({ analytics_events: 3, ai_usage_events: 1 }, { failDelete: 'analytics_events' })
    const result = await runRetentionCleanup(env, NOW)
    expect(result?.tables[0]).toMatchObject({ deleted: 0, complete: false, error: 'delete 500' })
    expect(result?.tables[1]).toMatchObject({ deleted: 1, complete: true })
    expect(calls.filter(call => call.method === 'DELETE' && call.path.startsWith('analytics_events'))).toHaveLength(1)
  })

  it('never deletes when a read returns an id it does not recognise', async () => {
    const fetchMock = vi.fn(async () => Response.json([{ id: '1);drop' }]))
    vi.stubGlobal('fetch', fetchMock)
    const result = await runRetentionCleanup(env, NOW)
    expect(fetchMock.mock.calls.every(([, init]) => (init as RequestInit | undefined)?.method !== 'DELETE')).toBe(true)
    expect(result?.tables.every(t => t.error === 'unexpected id')).toBe(true)
  })

  it('logs counts only, never row ids', async () => {
    mockSupabase({ analytics_events: 2 })
    await runRetentionCleanup(env, NOW)
    expect(logs.length).toBeGreaterThan(0)
    expect(logs.join('\n')).not.toContain(uuid(1))
    expect(JSON.parse(logs[0])).toEqual({ event: 'retention_cleanup', cutoff: CUTOFF, table: 'analytics_events', deleted: 2, batches: 1, complete: true })
  })

  it('does nothing without Supabase config', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(runRetentionCleanup({}, NOW)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('retention cron wiring', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('is declared in wrangler.jsonc next to the email cron', () => {
    const config = readFileSync(fileURLToPath(new URL('../../../wrangler.jsonc', import.meta.url)), 'utf8')
    const crons = /"crons":\s*(\[[^\]]*\])/.exec(config)?.[1]
    expect(JSON.parse(crons!)).toEqual(['0 9 * * *', RETENTION_CRON, MODERN_EDITION_CRON])
  })

  async function runCron(cron: string) {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = vi.fn(async () => Response.json([]))
    vi.stubGlobal('fetch', fetchMock)
    const pending: Promise<unknown>[] = []
    const ctx = { waitUntil: (p: Promise<unknown>) => { pending.push(p) }, passThroughOnException: () => {} }
    await worker.scheduled({ cron, scheduledTime: NOW.getTime() } as ScheduledEvent, env as never, ctx as unknown as ExecutionContext)
    await Promise.all(pending)
    return fetchMock.mock.calls.map(([input]) => String(input))
  }

  it('the retention cron runs only the cleanup', async () => {
    const urls = await runCron(RETENTION_CRON)
    expect(urls).toHaveLength(RETENTION_TABLES.length)
    expect(urls.every(url => url.includes('created_at=lt.'))).toBe(true)
  })

  it('the Modern English cron runs neither the cleanup nor the emails (and nothing while its switch is off)', async () => {
    const urls = await runCron(MODERN_EDITION_CRON)
    expect(urls).toEqual([])
  })

  it('the email cron does not run the cleanup', async () => {
    const urls = await runCron('0 9 * * *')
    expect(urls.some(url => url.includes('select=id&created_at=lt.'))).toBe(false)
  })
})
