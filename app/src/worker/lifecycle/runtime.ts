/**
 * Wires the lifecycle engine (./engine.ts) to the Worker: Supabase (service
 * role), the reader-position and recap Durable Objects, the static assets
 * (catalogue, library hooks, onboarding acclaim) and Brevo.
 *
 * Switches (wrangler.jsonc vars; both default off):
 * - LIFECYCLE_EMAILS = "1": the engine runs (welcome every 10 minutes, the
 *   reading emails hourly) and replaces the legacy 09:00 trial-day emails.
 *   Off, the Worker behaves exactly as before.
 * - LIFECYCLE_TRIAL_NOTICES = "1": trial-ending / trial-ended go out. Leave
 *   off until checkout is confirmed working.
 * Secrets: EMAIL_LINK_SECRET (signs unsubscribe/confirm links; without it no
 * opt-in email and no `welcome` confirm link is made), and optionally
 * LIFECYCLE_REPLY_TO (Anders's inbox for Reply-To).
 * The test gate (isLifecycleTestRecipient) always applies.
 */
import { parseLabPositionState, type LabPositionState } from '../../lab/labPosition'
import type { ReaderPositionCoordinator } from '../readerPositionCoordinator'
import type { RecapPreparationCoordinator } from '../recapPreparationCoordinator'
import { isLifecycleTestRecipient, sendEmail, LIFECYCLE_TEST_GATE } from '../routes/emails'
import type { Acclaim } from './nextBook'
import { runLifecycleSweep, runWelcomeSweep, WELCOME_WINDOW_MS, type CatalogueEntry, type LifecycleDeps, type PreparedRecap, type Profile } from './engine'
import type { LogRow } from './rules'

export interface LifecycleEnv {
  LIFECYCLE_EMAILS?: string
  LIFECYCLE_TRIAL_NOTICES?: string
  EMAIL_LINK_SECRET?: string
  LIFECYCLE_REPLY_TO?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  READER_POSITION?: DurableObjectNamespace<ReaderPositionCoordinator>
  RECAP_PREPARATION?: DurableObjectNamespace<RecapPreparationCoordinator>
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

export const lifecycleEmailsOn = (env: { LIFECYCLE_EMAILS?: string }) => env.LIFECYCLE_EMAILS === '1'
export const trialNoticesOn = (env: { LIFECYCLE_TRIAL_NOTICES?: string }) => env.LIFECYCLE_TRIAL_NOTICES === '1'

const ASSET_ORIGIN = 'https://tinct.app'
const PROFILE_PAGE = 1000
const PROFILE_PAGES = 20

function headers(env: LifecycleEnv, extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`, ...extra }
}

async function rest(env: LifecycleEnv, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: headers(env, (init.headers as Record<string, string>) ?? {}) })
}

/**
 * Profiles the engine may consider. With the test gate on only the test
 * aliases are even read (select=* so ship 2's columns are seen when they
 * exist, and their absence never fails the query).
 */
export async function lifecycleProfiles(env: LifecycleEnv, options: { createdSince?: string } = {}): Promise<Profile[]> {
  const filters: string[] = ['select=*', 'order=created_at.asc,id.asc']
  if (LIFECYCLE_TEST_GATE) filters.push(`or=(email.ilike.${encodeURIComponent('tinct*@fastmail.com')},email.eq.${encodeURIComponent('ahvelplund@fastmail.com')})`)
  if (options.createdSince) filters.push(`created_at=gte.${encodeURIComponent(options.createdSince)}`)
  const rows: Profile[] = []
  for (let page = 0; page < PROFILE_PAGES; page++) {
    const res = await rest(env, `profiles?${filters.join('&')}&limit=${PROFILE_PAGE}&offset=${page * PROFILE_PAGE}`)
    if (!res.ok) { console.error('[lifecycle] profiles query failed', res.status); break }
    const batch = await res.json() as Profile[]
    if (!Array.isArray(batch)) break
    rows.push(...batch)
    if (batch.length < PROFILE_PAGE) break
  }
  return rows.filter(row => typeof row?.email === 'string' && isLifecycleTestRecipient(row.email))
}

async function assetJson(env: LifecycleEnv, path: string): Promise<unknown | null> {
  if (!env.ASSETS) return null
  try {
    const res = await env.ASSETS.fetch(new Request(`${ASSET_ORIGIN}${path}`))
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

export function createLifecycleDeps(env: LifecycleEnv, now: () => number = Date.now): LifecycleDeps {
  let cataloguePromise: Promise<ReadonlyMap<string, CatalogueEntry>> | null = null
  return {
    now,
    linkSecret: env.EMAIL_LINK_SECRET || null,
    replyTo: env.LIFECYCLE_REPLY_TO || null,
    trialNotices: trialNoticesOn(env),
    isRecipientAllowed: isLifecycleTestRecipient,
    catalogue() {
      cataloguePromise ??= assetJson(env, '/lab/catalogue.json').then(raw => {
        const books = (raw as { books?: CatalogueEntry[] } | null)?.books
        return new Map(Array.isArray(books) ? books.map(book => [book.id, book]) : [])
      })
      return cataloguePromise
    },
    async hook(bookId) {
      const raw = await assetJson(env, `/lab/library_2/intro-data/${encodeURIComponent(bookId)}.json`) as { hook?: { text?: unknown } } | null
      return typeof raw?.hook?.text === 'string' ? raw.hook.text : null
    },
    async acclaim(bookId) {
      const raw = await assetJson(env, `/data/onboarding/${encodeURIComponent(bookId)}.json`) as { acclaim?: Acclaim[] } | null
      return Array.isArray(raw?.acclaim) ? raw!.acclaim : null
    },
    async position(userId): Promise<LabPositionState | null> {
      try {
        if (env.READER_POSITION) {
          const stored = await env.READER_POSITION.getByName(userId).exportState() as { position?: unknown }
          return stored?.position ? parseLabPositionState(stored.position, userId) : null
        }
        const raw = await env.RATE_LIMIT?.get(`lab-position:${userId}`, 'json')
        return raw ? parseLabPositionState(raw, userId) : null
      } catch {
        return null
      }
    },
    async preparedRecap(userId, bookId): Promise<PreparedRecap | null> {
      try {
        if (!env.RECAP_PREPARATION) return null
        const { queue } = await env.RECAP_PREPARATION.getByName(userId).exportState() as { queue: { entries?: Record<string, { request?: { chapterNumber?: number; paragraphIndex?: number }; result?: { summary?: string; empty?: boolean } }> } | null }
        const entry = queue?.entries?.[bookId]
        if (!entry?.result?.summary || entry.result.empty || typeof entry.request?.chapterNumber !== 'number') return null
        return { summary: entry.result.summary, chapterNumber: entry.request.chapterNumber, paragraphIndex: entry.request.paragraphIndex ?? 0 }
      } catch {
        return null
      }
    },
    async authUser(userId) {
      try {
        const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { headers: headers(env) })
        if (!res.ok) return null
        const user = await res.json() as { app_metadata?: { provider?: string }; user_metadata?: Record<string, unknown> }
        const meta = user.user_metadata ?? {}
        const given = typeof meta.given_name === 'string' ? meta.given_name : ''
        const full = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : ''
        return { provider: user.app_metadata?.provider ?? null, firstName: (given || full.split(/\s+/)[0] || '').trim() || null }
      } catch {
        return null
      }
    },
    async readingTime(userId, sinceDay) {
      try {
        const res = await rest(env, `reading_time?user_id=eq.${userId}&day=gte.${sinceDay}&book_id=neq._earlier&select=book_id,read_seconds,listen_seconds`)
        return res.ok ? await res.json() as Array<{ book_id: string; read_seconds: number; listen_seconds: number }> : null
      } catch {
        return null
      }
    },
    async log(userId) {
      try {
        const res = await rest(env, `email_log?user_id=eq.${userId}&select=template,book_id,dedupe_key,sent_at,meta&order=sent_at.desc&limit=500`)
        if (!res.ok) { console.error('[lifecycle] email_log read failed', res.status); return null }
        return await res.json() as LogRow[]
      } catch {
        return null
      }
    },
    async reserve(userId, row) {
      try {
        const res = await rest(env, 'email_log?on_conflict=user_id,dedupe_key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify({ user_id: userId, ...row }),
        })
        if (!res.ok) return false
        const rows = await res.json() as unknown[]
        return Array.isArray(rows) && rows.length === 1
      } catch {
        return false
      }
    },
    async release(userId, dedupeKey) {
      try {
        await rest(env, `email_log?user_id=eq.${userId}&dedupe_key=eq.${encodeURIComponent(dedupeKey)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
      } catch { /* the reservation stays; the email is not retried */ }
    },
    send(email) {
      return sendEmail(env, email.to, email.subject, email.html, {
        senderName: email.senderName,
        replyTo: email.replyTo,
        text: email.text,
        headers: email.headers,
      })
    },
  }
}

export function configured(env: LifecycleEnv): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.BREVO_API_KEY)
}

/** The every-10-minutes cron: welcome every run; the reading/trial sweep once an hour (the run in minutes 0–9). */
export async function runLifecycleCron(env: LifecycleEnv, scheduledTime: number, now: () => number = Date.now): Promise<void> {
  if (!lifecycleEmailsOn(env) || !configured(env)) return
  const deps = createLifecycleDeps(env, now)
  const welcome = await runWelcomeSweep(deps, await lifecycleProfiles(env, { createdSince: new Date(now() - WELCOME_WINDOW_MS).toISOString() }))
  console.log(JSON.stringify({ event: 'lifecycle_welcome', sent: welcome.sent.length, skipped: welcome.skipped }))
  if (new Date(scheduledTime).getUTCMinutes() < 10) {
    const sweep = await runLifecycleSweep(deps, await lifecycleProfiles(env))
    console.log(JSON.stringify({ event: 'lifecycle_sweep', considered: sweep.considered, sent: sweep.sent.map(s => s.template), skipped: sweep.skipped }))
  }
}
