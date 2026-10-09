import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../../worker'
import { LOG_HORIZON_MS } from '../lifecycle/rules'
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
/** Profile reports are kept for up to 12 months (privacy notice). */
const REPORT_CUTOFF = '2025-10-06T03:17:00.000Z'
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
      const bigint = table === 'ai_usage_events' || table === 'profile_reports' || table === 'email_log'
      const rows = Array.from({ length: count }, (_, i) => ({ id: bigint ? String(offset + i + 1) : uuid(offset + i + 1) }))
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

  it('covers profile reports (12 months) first, then the small email log and reader-data audit, then the analytics and usage tables (24 months)', () => {
    expect(RETENTION_TABLES).toEqual([
      { table: 'profile_reports', column: 'created_at', months: 12 },
      { table: 'email_log', column: 'sent_at', months: 24 },
      { table: 'user_data_audit', column: 'created_at', months: 24 },
      { table: 'analytics_events', column: 'created_at', months: 24 },
      { table: 'ai_usage_events', column: 'created_at', months: 24 },
      { table: 'token_usage', column: 'created_at', months: 24 },
    ])
  })

  it('profile_reports is the table and created_at the column the social migration defines', () => {
    const sql = readFileSync(fileURLToPath(new URL('../../../supabase/migrations/20261008_social.sql', import.meta.url)), 'utf8')
    const table = /create table if not exists public\.profile_reports \(([\s\S]*?)\n\);/.exec(sql)?.[1]
    expect(table).toMatch(/\bid bigint generated always as identity primary key/)
    expect(table).toMatch(/\bcreated_at timestamptz not null default now\(\)/)
  })

  it('email_log is the table and sent_at the column its migration defines (no created_at)', () => {
    const sql = readFileSync(fileURLToPath(new URL('../../../supabase/migrations/20261008_email_log.sql', import.meta.url)), 'utf8')
    const table = /create table if not exists public\.email_log \(([\s\S]*?)\n\);/.exec(sql)?.[1]
    expect(table).toMatch(/\bid bigint generated always as identity primary key/)
    expect(table).toMatch(/\bsent_at timestamptz not null default now\(\)/)
    expect(table).not.toMatch(/\bcreated_at\b/)
  })

  it('user_data_audit is the table and created_at the column its SQL defines', () => {
    const sql = readFileSync(fileURLToPath(new URL('../../../supabase/user_data_audit.sql', import.meta.url)), 'utf8')
    const table = /CREATE TABLE IF NOT EXISTS public\.user_data_audit \(([\s\S]*?)\n\);/.exec(sql)?.[1]
    expect(table).toMatch(/\bid UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/)
    expect(table).toMatch(/\bcreated_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/)
  })

  it('deletes email_log rows older than 24 months by sent_at, and user_data_audit rows by created_at', async () => {
    const { calls } = mockSupabase({ email_log: 2, user_data_audit: 1 })
    const result = await runRetentionCleanup(env, NOW)
    expect(calls.filter(call => call.path.startsWith('email_log'))).toEqual([
      { method: 'GET', path: `email_log?select=id&sent_at=lt.${CUTOFF}&order=sent_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'DELETE', path: `email_log?id=in.(1,2)&sent_at=lt.${CUTOFF}` },
    ])
    expect(calls.filter(call => call.path.startsWith('user_data_audit'))).toEqual([
      { method: 'GET', path: `user_data_audit?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'DELETE', path: `user_data_audit?id=in.(${uuid(1)})&created_at=lt.${CUTOFF}` },
    ])
    expect(result?.tables.slice(1, 3)).toEqual([
      { table: 'email_log', cutoff: CUTOFF, deleted: 2, batches: 1, complete: true },
      { table: 'user_data_audit', cutoff: CUTOFF, deleted: 1, batches: 1, complete: true },
    ])
  })

  it('the lifecycle rules\' log horizon stays at least 30 days inside the email_log cutoff', () => {
    const months = RETENTION_TABLES.find(t => t.table === 'email_log')!.months
    for (const at of ['2026-10-06T03:17:00.000Z', '2028-02-29T12:00:00.000Z', '2027-03-31T00:00:00.000Z', '2030-12-31T23:59:59.999Z']) {
      const now = new Date(at)
      expect(now.getTime() - LOG_HORIZON_MS - Date.parse(retentionCutoff(now, months))).toBeGreaterThanOrEqual(30 * 24 * 3600_000)
    }
  })

  it('a large analytics backlog never starves the email log or the reader-data audit', async () => {
    const { calls } = mockSupabase({ analytics_events: RETENTION_BATCH * 100, email_log: 1, user_data_audit: 1 })
    const result = await runRetentionCleanup(env, NOW)
    expect(calls.filter(call => call.method === 'DELETE' && /^(email_log|user_data_audit)\?/.test(call.path))).toHaveLength(2)
    expect(result?.tables.slice(1, 3).map(t => [t.table, t.deleted, t.complete])).toEqual([['email_log', 1, true], ['user_data_audit', 1, true]])
  })

  it('deletes only profile reports older than 12 months, resolved or not', async () => {
    const { calls } = mockSupabase({ profile_reports: 3 })
    const result = await runRetentionCleanup(env, NOW)
    const reportCalls = calls.filter(call => call.path.startsWith('profile_reports'))
    expect(reportCalls).toEqual([
      { method: 'GET', path: `profile_reports?select=id&created_at=lt.${REPORT_CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'DELETE', path: `profile_reports?id=in.(1,2,3)&created_at=lt.${REPORT_CUTOFF}` },
    ])
    // No filter on resolved_at: the notice promises 12 months for every report.
    expect(reportCalls.every(call => !call.path.includes('resolved_at'))).toBe(true)
    expect(result?.tables[0]).toEqual({ table: 'profile_reports', cutoff: REPORT_CUTOFF, deleted: 3, batches: 1, complete: true })
    // The 24-month tables keep their own, older cutoff.
    expect(calls.filter(call => !call.path.startsWith('profile_reports')).every(call => call.path.includes(`_at=lt.${CUTOFF}&`))).toBe(true)
  })

  it('a failed profile report cleanup does not stop the other tables', async () => {
    const { calls } = mockSupabase({ profile_reports: 2, analytics_events: 1 }, { failDelete: 'profile_reports' })
    const result = await runRetentionCleanup(env, NOW)
    expect(result?.tables[0]).toMatchObject({ table: 'profile_reports', deleted: 0, complete: false, error: 'delete 500' })
    expect(result?.tables[3]).toMatchObject({ table: 'analytics_events', deleted: 1, complete: true })
    expect(calls.filter(call => call.method === 'DELETE' && call.path.startsWith('analytics_events'))).toHaveLength(1)
  })

  it('deletes nothing when no row is older than 24 months (today)', async () => {
    const { calls } = mockSupabase({})
    const result = await runRetentionCleanup(env, NOW)

    expect(calls).toEqual([
      { method: 'GET', path: `profile_reports?select=id&created_at=lt.${REPORT_CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `email_log?select=id&sent_at=lt.${CUTOFF}&order=sent_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `user_data_audit?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `analytics_events?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `ai_usage_events?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
      { method: 'GET', path: `token_usage?select=id&created_at=lt.${CUTOFF}&order=created_at.asc,id.asc&limit=${RETENTION_BATCH}` },
    ])
    expect(result?.tables.map(t => [t.table, t.deleted, t.complete])).toEqual([
      ['profile_reports', 0, true], ['email_log', 0, true], ['user_data_audit', 0, true], ['analytics_events', 0, true], ['ai_usage_events', 0, true], ['token_usage', 0, true],
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
    expect(calls.filter(call => call.method === 'GET' && !call.path.startsWith('profile_reports')).every(call => call.path.includes(`_at=lt.${CUTOFF}&`))).toBe(true)

    expect(result?.tables).toEqual([
      { table: 'profile_reports', cutoff: REPORT_CUTOFF, deleted: 0, batches: 0, complete: true },
      { table: 'email_log', cutoff: CUTOFF, deleted: 0, batches: 0, complete: true },
      { table: 'user_data_audit', cutoff: CUTOFF, deleted: 0, batches: 0, complete: true },
      { table: 'analytics_events', cutoff: CUTOFF, deleted: RETENTION_BATCH + 3, batches: 2, complete: true },
      { table: 'ai_usage_events', cutoff: CUTOFF, deleted: 2, batches: 1, complete: true },
      { table: 'token_usage', cutoff: CUTOFF, deleted: 0, batches: 0, complete: true },
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
    // profile_reports, email_log and user_data_audit (empty) spend one read each first.
    expect(result?.tables.slice(0, 3).map(t => [t.table, t.complete])).toEqual([['profile_reports', true], ['email_log', true], ['user_data_audit', true]])
    expect(result?.tables[3]).toMatchObject({ table: 'analytics_events', complete: false, deleted: RETENTION_BATCH * Math.floor((RETENTION_SUBREQUEST_BUDGET - 3) / 2) })
    expect(result?.tables[4]).toMatchObject({ deleted: 0, complete: false })
  })

  it('stops a table on a failed delete and moves on', async () => {
    const { calls } = mockSupabase({ analytics_events: 3, ai_usage_events: 1 }, { failDelete: 'analytics_events' })
    const result = await runRetentionCleanup(env, NOW)
    expect(result?.tables[3]).toMatchObject({ table: 'analytics_events', deleted: 0, complete: false, error: 'delete 500' })
    expect(result?.tables[4]).toMatchObject({ table: 'ai_usage_events', deleted: 1, complete: true })
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
    mockSupabase({ profile_reports: 1, analytics_events: 2 })
    await runRetentionCleanup(env, NOW)
    expect(logs.length).toBeGreaterThan(0)
    expect(logs.join('\n')).not.toContain(uuid(1))
    expect(logs.join('\n')).not.toContain('in.(')
    expect(JSON.parse(logs[0])).toEqual({ event: 'retention_cleanup', table: 'profile_reports', cutoff: REPORT_CUTOFF, deleted: 1, batches: 1, complete: true })
    expect(JSON.parse(logs[3])).toEqual({ event: 'retention_cleanup', table: 'analytics_events', cutoff: CUTOFF, deleted: 2, batches: 1, complete: true })
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
    vi.useRealTimers()
  })

  it('is declared in wrangler.jsonc next to the email cron', () => {
    const config = readFileSync(fileURLToPath(new URL('../../../wrangler.jsonc', import.meta.url)), 'utf8')
    const crons = /"crons":\s*(\[[^\]]*\])/.exec(config)?.[1]
    expect(JSON.parse(crons!)).toEqual(['0 9 * * *', RETENTION_CRON, MODERN_EDITION_CRON])
  })

  async function runCron(cron: string, fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = async () => Response.json([])) {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // The handler reads the clock itself; pin it so the cutoffs are known.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    const fetchMock = vi.fn(fetchImpl)
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
    expect(urls.every(url => url.includes('created_at=lt.') || url.includes('/email_log?select=id&sent_at=lt.'))).toBe(true)
    expect(urls[0]).toContain(`/rest/v1/profile_reports?select=id&created_at=lt.${REPORT_CUTOFF}&`)
  })

  it('the retention cron deletes old profile reports, and a profile report failure leaves the other steps running', async () => {
    const urls = await runCron(RETENTION_CRON, async (input, init) => {
      const url = String(input)
      if (url.includes('/profile_reports')) throw new Error('network down')
      if ((init?.method ?? 'GET') === 'GET' && url.includes('/analytics_events')) return Response.json([{ id: uuid(1) }])
      return init?.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json([])
    })
    expect(urls.filter(url => url.includes('/profile_reports'))).toHaveLength(1)
    expect(urls.some(url => url.includes(`/analytics_events?id=in.(${uuid(1)})&created_at=lt.${CUTOFF}`))).toBe(true)
    expect(urls.some(url => url.includes('/token_usage?select=id'))).toBe(true)
  })

  it('the retention cron deletes a profile report older than 12 months', async () => {
    const urls = await runCron(RETENTION_CRON, async (input, init) => {
      const url = String(input)
      if ((init?.method ?? 'GET') === 'GET' && url.includes('/profile_reports')) return Response.json([{ id: 7 }])
      return init?.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json([])
    })
    expect(urls).toContain(`${REST}profile_reports?id=in.(7)&created_at=lt.${REPORT_CUTOFF}`)
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
