/**
 * Retention cleanup: keeps the privacy notice's promises that analytics events
 * and usage records are kept for 24 months (app/public/privacy.html#retention)
 * and that a report about a profile is kept for up to 12 months.
 *
 * Runs on its own Cloudflare cron (RETENTION_CRON, wrangler.jsonc), separate
 * from the daily email cron so each run has its own subrequest budget and the
 * lifecycle emails never run twice. Every request is filtered by the table's
 * timestamp column (`created_at=lt.<cutoff>`, the cutoff set by that table's
 * retention period): a batch of ids older than the cutoff is read, then
 * deleted by those ids AND the same cutoff, so a row younger than its period
 * can never be removed and no delete is unfiltered. Each table is handled on
 * its own: a failure on one is logged and the run moves on to the next.
 * Batches are bounded and a run stops at its subrequest budget; whatever is
 * left is picked up by the next run, so repeating a run is harmless.
 * Logs carry counts only, never row contents.
 */
import { supabaseDelete, supabaseGet, type SupabaseEnv } from '../lib/supabase'

/** Daily at 03:17 UTC. Must match an entry in wrangler.jsonc `triggers.crons`. */
export const RETENTION_CRON = '17 3 * * *'
export const RETENTION_MONTHS = 24
/** Rows per delete. 200 uuids keep the `id=in.(...)` URL near 7.5 KB. */
export const RETENTION_BATCH = 200
/** Subrequests one run may spend (each batch is one read and one delete); under Cloudflare's 50. */
export const RETENTION_SUBREQUEST_BUDGET = 40

/** Profile reports are kept for up to 12 months (privacy notice, profiles). */
export const PROFILE_REPORT_RETENTION_MONTHS = 12

/**
 * Tables with a retention promise, their timestamp column and period in months.
 * profile_reports comes first: it is small and has the shorter promise, so a
 * large analytics backlog using up the run's budget can never starve it.
 */
export const RETENTION_TABLES: ReadonlyArray<{ table: string; column: string; months: number }> = [
  // Reports about profiles (supabase/migrations/20261008_social.sql), resolved or not.
  { table: 'profile_reports', column: 'created_at', months: PROFILE_REPORT_RETENTION_MONTHS },
  { table: 'analytics_events', column: 'created_at', months: RETENTION_MONTHS },
  { table: 'ai_usage_events', column: 'created_at', months: RETENTION_MONTHS },
  // Legacy per-reader token ledger (supabase/migration.sql); no longer written.
  { table: 'token_usage', column: 'created_at', months: RETENTION_MONTHS },
]

/** uuid (analytics_events, token_usage) or bigint identity (ai_usage_events, profile_reports). */
const ROW_ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9]{1,19})$/i

/**
 * `now` minus RETENTION_MONTHS calendar months, in UTC. The day is clamped to
 * the target month's length (29 Feb -> 28 Feb), so the cutoff is never later
 * than exactly `months` months ago.
 */
export function retentionCutoff(now: Date, months = RETENTION_MONTHS): string {
  const totalMonths = now.getUTCFullYear() * 12 + now.getUTCMonth() - months
  const year = Math.floor(totalMonths / 12)
  const month = totalMonths - year * 12
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(
    year, month, Math.min(now.getUTCDate(), lastDay),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds(),
  )).toISOString()
}

export type RetentionTableResult = {
  table: string
  /** Rows created before this instant are deleted. */
  cutoff: string
  deleted: number
  batches: number
  /** True when nothing older than the cutoff is left in the table. */
  complete: boolean
  error?: string
}

export type RetentionRunResult = { tables: RetentionTableResult[] }

export async function runRetentionCleanup(env: SupabaseEnv, now = new Date()): Promise<RetentionRunResult | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(JSON.stringify({ event: 'retention_cleanup_skipped', reason: 'missing_supabase_config' }))
    return null
  }
  let budget = RETENTION_SUBREQUEST_BUDGET
  const tables: RetentionTableResult[] = []

  for (const { table, column, months } of RETENTION_TABLES) {
    const cutoff = retentionCutoff(now, months)
    const filter = `${column}=lt.${cutoff}`
    const result: RetentionTableResult = { table, cutoff, deleted: 0, batches: 0, complete: false }
    tables.push(result)
    while (budget >= 2) {
      budget -= 1
      let ids: string[]
      try {
        const res = await supabaseGet(env, `${table}?select=id&${filter}&order=${column}.asc,id.asc&limit=${RETENTION_BATCH}`)
        if (!res.ok) { result.error = `read ${res.status}`; break }
        const rows = await res.json() as { id?: unknown }[]
        ids = rows.map(row => String(row.id ?? '')).filter(id => ROW_ID.test(id))
        if (ids.length !== rows.length) { result.error = 'unexpected id'; break }
      } catch {
        result.error = 'read failed'
        break
      }
      if (ids.length === 0) { result.complete = true; break }

      budget -= 1
      try {
        const res = await supabaseDelete(env, `${table}?id=in.(${ids.join(',')})&${filter}`)
        if (!res.ok) { result.error = `delete ${res.status}`; break }
      } catch {
        result.error = 'delete failed'
        break
      }
      result.deleted += ids.length
      result.batches += 1
      if (ids.length < RETENTION_BATCH) { result.complete = true; break }
    }
    console.log(JSON.stringify({ event: 'retention_cleanup', ...result }))
  }

  console.log(JSON.stringify({
    event: 'retention_cleanup_done',
    deleted: tables.reduce((sum, item) => sum + item.deleted, 0),
    complete: tables.every(item => item.complete),
  }))
  return { tables }
}
