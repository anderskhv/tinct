/**
 * Reading time you can trust (social brief, ship 1).
 *
 *   GET  /api/reading-time/status   { enabled } for anyone; the reader asks once per page
 *   GET  /api/reading-time          the signed-in reader's own ledger rows
 *   POST /api/reading-time/beat     one heartbeat (about once a minute while reading)
 *   POST /api/reading-time/flush    time counted signed out or offline, once per flushId
 *   POST /api/reading-time/card     the reader's reading card, as PNG (not stored)
 *
 * Behind the Worker var SOCIAL_READING_TIME ("1" = on). Off (the default),
 * every route answers `{ enabled: false }` and reads nothing, and the reader
 * keeps today's device tally. On, a missing `reading_time` table (the
 * migration not yet run) answers 503 and the reader again keeps its device
 * tally; nothing throws.
 *
 * The Worker sets the limits, not the browser: one beat per ~50 s per reader
 * (an atomic gate in the usage coordinator), at most 60 s credited per beat,
 * at most 16 h a reader-local day, listening only while narration plays.
 * add_reading_time() enforces the daily cap again inside the database.
 */
import {
  DAILY_CAP_SECONDS,
  EARLIER_BOOK_ID,
  creditBeat,
  earlierDayForYear,
  importYears,
  parseBeat,
  parseFlush,
  plausibleToday,
  readingYearSeconds,
  type LedgerRow,
} from '../../readingTime/model'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'

export type ReadingTimeEnv = SupabaseEnv & {
  /** "1" turns reading time on (routes, sheet, Your reading). Absent = off. */
  SOCIAL_READING_TIME?: string
  ASSETS?: { fetch: (request: Request) => Promise<Response> }
}

export interface ReadingTimeDeps {
  verifyUser: (request: Request) => Promise<{ id: string } | null>
  /** One beat per reader per BEAT_MIN_GAP_MS; false = too soon (nothing counted). */
  beatGate: (userId: string) => Promise<boolean>
  /** True the first time a flushId is seen for this reader; false for a repeat. */
  flushOnce: (userId: string, flushId: string) => Promise<boolean>
  /** Per-reader request limit for flushes and cards. */
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>
  now?: () => number
}

export function readingTimeEnabled(env: Pick<ReadingTimeEnv, 'SOCIAL_READING_TIME'>): boolean {
  return env.SOCIAL_READING_TIME === '1'
}

class LedgerUnavailable extends Error {}

const MAX_BODY_BYTES = 16_384
const PAGE = 1000
const MAX_PAGES = 20

function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

function unavailable(request: Request): Response {
  return noStore(jsonResponse({ enabled: true, error: 'unavailable' }, 503, request))
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return null
  try { return JSON.parse(text) } catch { return null }
}

async function rows<T>(env: ReadingTimeEnv, path: string): Promise<T[]> {
  let res: Response
  try { res = await supabaseGet(env, path) } catch { throw new LedgerUnavailable('read failed') }
  // A missing table (migration not run) is a 404 from PostgREST; any failure is "unavailable".
  if (!res.ok) throw new LedgerUnavailable(`read ${res.status}`)
  return await res.json() as T[]
}

type RawRow = { day: string; book_id: string; read_seconds: number; listen_seconds: number }

/** Every ledger row of one reader. */
export async function loadLedger(env: ReadingTimeEnv, userId: string): Promise<LedgerRow[]> {
  const out: LedgerRow[] = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = await rows<RawRow>(env, `reading_time?user_id=eq.${userId}&select=day,book_id,read_seconds,listen_seconds&order=day.asc,book_id.asc&limit=${PAGE}&offset=${page * PAGE}`)
    for (const row of batch) out.push({ day: row.day, bookId: row.book_id, read: Number(row.read_seconds) || 0, listen: Number(row.listen_seconds) || 0 })
    if (batch.length < PAGE) break
  }
  return out
}

async function addTime(env: ReadingTimeEnv, userId: string, day: string, bookId: string, read: number, listen: number): Promise<{ read: number; listen: number }> {
  let res: Response
  try {
    res = await supabaseRpc(env, 'add_reading_time', { p_user_id: userId, p_day: day, p_book_id: bookId, p_read: read, p_listen: listen, p_daily_cap: DAILY_CAP_SECONDS })
  } catch { throw new LedgerUnavailable('write failed') }
  if (!res.ok) throw new LedgerUnavailable(`write ${res.status}`)
  const data = await res.json().catch(() => null) as Array<{ read_credited?: number; listen_credited?: number }> | { read_credited?: number; listen_credited?: number } | null
  const row = Array.isArray(data) ? data[0] : data
  return { read: Number(row?.read_credited) || 0, listen: Number(row?.listen_credited) || 0 }
}

/**
 * Merges the account's `reading-year-*` totals into the ledger, once per
 * year: each year's total lands on its own '_earlier' row, inserted only if
 * that row does not exist (a primary-key conflict is ignored), so a repeat
 * or a race can never count the same time twice. Years already merged are
 * not read again.
 */
export async function ensureYearlyTotalsMerged(env: ReadingTimeEnv, userId: string, nowMs: number): Promise<void> {
  const merged = new Set((await rows<{ day: string }>(env, `reading_time?user_id=eq.${userId}&book_id=eq.${EARLIER_BOOK_ID}&select=day`)).map(row => row.day))
  const missing = importYears(nowMs).filter(year => !merged.has(earlierDayForYear(year)))
  for (const year of missing) {
    const data = await rows<{ value: unknown }>(env, `user_data?user_id=eq.${userId}&key=eq.reading-year-${year}&select=value&limit=1`).catch(error => {
      if (error instanceof LedgerUnavailable) return null
      throw error
    })
    // An unreadable tally is not merged as zero: try again on the next beat.
    if (!data) continue
    const total = readingYearSeconds(data[0]?.value ?? null, year, nowMs)
    let res: Response
    try {
      res = await fetch(`${env.SUPABASE_URL}/rest/v1/reading_time?on_conflict=user_id,day,book_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
          Prefer: 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify({ user_id: userId, day: earlierDayForYear(year), book_id: EARLIER_BOOK_ID, read_seconds: total, listen_seconds: 0 }),
      })
    } catch { throw new LedgerUnavailable('merge failed') }
    if (!res.ok) throw new LedgerUnavailable(`merge ${res.status}`)
  }
}

async function usedOn(env: ReadingTimeEnv, userId: string, day: string): Promise<number> {
  const list = await rows<{ read_seconds: number; listen_seconds: number }>(env, `reading_time?user_id=eq.${userId}&day=eq.${day}&book_id=neq.${EARLIER_BOOK_ID}&select=read_seconds,listen_seconds`)
  return list.reduce((sum, row) => sum + (Number(row.read_seconds) || 0) + (Number(row.listen_seconds) || 0), 0)
}

async function signedIn(request: Request, deps: ReadingTimeDeps): Promise<string | null> {
  const user = await deps.verifyUser(request)
  return user && isValidUUID(user.id) ? user.id : null
}

export async function handleReadingTime(request: Request, env: ReadingTimeEnv, deps: ReadingTimeDeps): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '')
  const now = deps.now ?? Date.now
  const on = readingTimeEnabled(env)

  if (path === '/api/reading-time/status') {
    if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
    return noStore(jsonResponse({ enabled: on }, 200, request))
  }

  const route = path === '/api/reading-time' ? 'summary'
    : path === '/api/reading-time/beat' ? 'beat'
      : path === '/api/reading-time/flush' ? 'flush'
        : path === '/api/reading-time/card' ? 'card' : null
  if (!route) return jsonResponse({ error: 'not_found' }, 404, request)
  if (request.method !== (route === 'summary' ? 'GET' : 'POST')) return jsonResponse({ error: 'Method not allowed' }, 405, request)
  // Off: a no-op that reads nothing, not even the caller's identity.
  if (!on) return noStore(jsonResponse({ enabled: false }, 200, request))

  const userId = await signedIn(request, deps)
  if (!userId) return jsonResponse({ error: 'Authentication required' }, 401, request)

  try {
    if (route === 'summary') {
      await ensureYearlyTotalsMerged(env, userId, now())
      return noStore(jsonResponse({ enabled: true, rows: await loadLedger(env, userId) }, 200, request))
    }

    if (route === 'beat') {
      const beat = parseBeat(await readJson(request), now())
      if (!beat) return jsonResponse({ error: 'invalid_beat' }, 400, request)
      if (!(await deps.beatGate(userId))) return noStore(jsonResponse({ enabled: true, error: 'too_soon' }, 429, request))
      // The yearly totals are merged before the first beat is credited.
      await ensureYearlyTotalsMerged(env, userId, now())
      const credit = creditBeat(beat, await usedOn(env, userId, beat.day))
      const credited = credit.read + credit.listen > 0 ? await addTime(env, userId, beat.day, beat.bookId, credit.read, credit.listen) : credit
      return noStore(jsonResponse({ enabled: true, credited }, 200, request))
    }

    if (route === 'flush') {
      const flush = parseFlush(await readJson(request), now())
      if (!flush) return jsonResponse({ error: 'invalid_flush' }, 400, request)
      if (!(await deps.checkRateLimit(`reading-flush:${userId}`, undefined, 3))) return jsonResponse({ error: 'rate_limited' }, 429, request)
      await ensureYearlyTotalsMerged(env, userId, now())
      // Applied once: a retry of the same flush (a lost reply) credits nothing.
      if (!(await deps.flushOnce(userId, flush.flushId))) return noStore(jsonResponse({ enabled: true, credited: 0, repeat: true }, 200, request))
      // The flush id is spent: a failure from here on says how many entries
      // landed (in order; `earlier` goes last), so the reader keeps the rest
      // pending under a new id instead of a retry being answered "repeat".
      let credited = 0, applied = 0
      try {
        for (const entry of flush.entries) {
          const result = await addTime(env, userId, entry.day, entry.bookId, entry.read, entry.listen)
          credited += result.read + result.listen
          applied += 1
        }
        if (flush.earlier > 0) {
          const year = new Date(now()).getUTCFullYear()
          const result = await addTime(env, userId, earlierDayForYear(year), EARLIER_BOOK_ID, flush.earlier, 0)
          credited += result.read
        }
      } catch (error) {
        if (!(error instanceof LedgerUnavailable)) throw error
        console.warn(JSON.stringify({ event: 'reading_time_unavailable', route, reason: error.message, applied }))
        return noStore(jsonResponse({ enabled: true, error: 'unavailable', applied }, 503, request))
      }
      return noStore(jsonResponse({ enabled: true, credited }, 200, request))
    }

    // route === 'card'
    const body = await readJson(request) as { today?: unknown } | null
    const today = body?.today
    if (!plausibleToday(today, now())) return jsonResponse({ error: 'invalid_card' }, 400, request)
    if (!(await deps.checkRateLimit(`reading-card:${userId}`, undefined, 6))) return jsonResponse({ error: 'rate_limited' }, 429, request)
    if (!env.ASSETS) return unavailable(request)
    await ensureYearlyTotalsMerged(env, userId, now())
    const ledger = await loadLedger(env, userId)
    const { readingTimeStats } = await import('../../readingTime/model')
    const { renderReadingCardPng } = await import('../lib/readingCard')
    let png: Uint8Array
    try {
      png = await renderReadingCardPng(env.ASSETS, url.origin, readingTimeStats(ledger, today))
    } catch (error) {
      console.warn(JSON.stringify({ event: 'reading_card_failed', reason: error instanceof Error ? error.message : 'failed' }))
      return unavailable(request)
    }
    return new Response(png as unknown as BodyInit, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
  } catch (error) {
    if (error instanceof LedgerUnavailable) {
      console.warn(JSON.stringify({ event: 'reading_time_unavailable', route, reason: error.message }))
      return unavailable(request)
    }
    throw error
  }
}
