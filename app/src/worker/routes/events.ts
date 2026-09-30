/**
 * POST /api/events — the funnel intake.
 *
 * Extends the existing analytics pipeline (public.analytics_events, read by
 * /admin/metrics) instead of adding a new one. The library page and the reader
 * batch their events here with sendBeacon or a keepalive fetch, so nothing
 * waits on analytics. The Worker validates, maps each event onto the existing
 * row shape and inserts with the service role in the background.
 *
 *   pageview / page_duration  -> event_type 'pageview' / 'page_duration'
 *   everything else           -> event_type 'event', payload.type = the name
 *
 * Every row carries the anonymous device id in payload.device_id. Only names
 * on FUNNEL_EVENT_NAMES and primitive, short property values are accepted; no
 * free text is stored.
 */
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseInsertMinimal, type SupabaseEnv } from '../lib/supabase'

export type EventsEnv = SupabaseEnv & { RATE_LIMIT?: KVNamespace }
type VerifyUser = (env: EventsEnv, request: Request) => Promise<{ id: string } | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const FUNNEL_EVENT_NAMES = new Set([
  'pageview', 'page_duration',
  'landing_view', 'book_opened', 'first_page_turn', 'chapter_completed',
  'ai_first_use', 'anon_limit_reached', 'signup_started', 'signup_completed',
  'member_ai_use', 'checkout_started', 'checkout_completed',
])

export const EVENTS_MAX_BODY_BYTES = 16_384
export const EVENTS_MAX_BATCH = 20
export const EVENTS_RATE_PER_MINUTE = 60
const MAX_PROPS = 12
const MAX_STRING = 120
const MAX_DURATION_MS = 30 * 60 * 1000
const SURFACES = new Set(['library', 'reader', 'sign-in', 'server'])
const ID = /^[A-Za-z0-9_-]{8,64}$/
const PROP_KEY = /^[a-z][a-z0-9_]{0,31}$/

type Primitive = string | number | boolean

interface IncomingEvent { name?: unknown; props?: unknown }
interface IncomingBatch {
  deviceId?: unknown
  sessionId?: unknown
  surface?: unknown
  path?: unknown
  referrer?: unknown
  attribution?: unknown
  events?: unknown
}

export interface AnalyticsInsertRow {
  event_type: 'pageview' | 'page_duration' | 'event'
  path: string
  referrer: string | null
  user_agent: string
  duration_ms?: number
  user_id: string | null
  session_id: string
  payload: Record<string, unknown>
}

function cleanProps(raw: unknown): Record<string, Primitive> {
  const out: Record<string, Primitive> = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const [key, value] of Object.entries(raw as Record<string, unknown>).slice(0, MAX_PROPS)) {
    if (!PROP_KEY.test(key)) continue
    if (typeof value === 'string') out[key] = value.slice(0, MAX_STRING)
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else if (typeof value === 'boolean') out[key] = value
  }
  return out
}

function cleanAttribution(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const touch = (value: unknown) => {
    const props = cleanProps(value)
    return Object.keys(props).length ? props : undefined
  }
  const source = raw as { first_touch?: unknown; last_touch?: unknown }
  const first = touch(source.first_touch)
  const last = touch(source.last_touch)
  return first || last ? { ...(first ? { first_touch: first } : {}), ...(last ? { last_touch: last } : {}) } : undefined
}

function cleanPath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') ? value.split('?')[0].slice(0, 200) : '/'
}

/** Pure: validate a batch and map it onto analytics_events rows. Returns null for a malformed body. */
export function buildAnalyticsRows(body: unknown, userAgent: string, userId: string | null): AnalyticsInsertRow[] | null {
  if (!body || typeof body !== 'object') return null
  const batch = body as IncomingBatch
  if (typeof batch.deviceId !== 'string' || !ID.test(batch.deviceId)) return null
  if (typeof batch.sessionId !== 'string' || !ID.test(batch.sessionId)) return null
  if (!Array.isArray(batch.events) || batch.events.length === 0) return null
  const surface = typeof batch.surface === 'string' && SURFACES.has(batch.surface) ? batch.surface : 'reader'
  const path = cleanPath(batch.path)
  const referrer = typeof batch.referrer === 'string' && batch.referrer ? batch.referrer.slice(0, 300) : null
  const attribution = cleanAttribution(batch.attribution)
  const rows: AnalyticsInsertRow[] = []
  for (const item of (batch.events as IncomingEvent[]).slice(0, EVENTS_MAX_BATCH)) {
    if (!item || typeof item.name !== 'string' || !FUNNEL_EVENT_NAMES.has(item.name)) continue
    const props = cleanProps(item.props)
    const common = {
      path, referrer, user_agent: userAgent.slice(0, 300), user_id: userId, session_id: batch.sessionId as string,
    }
    if (item.name === 'page_duration') {
      const duration = Math.round(Number(props.duration_ms))
      if (!Number.isFinite(duration) || duration < 1000) continue
      rows.push({
        ...common, event_type: 'page_duration', duration_ms: Math.min(duration, MAX_DURATION_MS),
        payload: { reason: 'duration', device_id: batch.deviceId, surface },
      })
    } else if (item.name === 'pageview') {
      rows.push({
        ...common, event_type: 'pageview',
        payload: { ...props, device_id: batch.deviceId, surface, ...(attribution ? { attribution } : {}) },
      })
    } else {
      rows.push({
        ...common, event_type: 'event',
        payload: { ...props, type: item.name, device_id: batch.deviceId, surface, ...(attribution ? { attribution } : {}) },
      })
    }
  }
  return rows.length ? rows : null
}

/** Insert rows; every failure is swallowed and logged without content. */
export async function writeAnalyticsRows(env: EventsEnv, rows: AnalyticsInsertRow[]): Promise<void> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return
    const response = await supabaseInsertMinimal(env, 'analytics_events', rows)
    if (!response.ok) console.warn(JSON.stringify({ event: 'funnel_write_failed', status: response.status }))
  } catch {
    console.warn(JSON.stringify({ event: 'funnel_write_failed', status: 0 }))
  }
}

export function insertAnalyticsRows(env: EventsEnv, ctx: { waitUntil(p: Promise<unknown>): void } | undefined, rows: AnalyticsInsertRow[]): void {
  try { ctx?.waitUntil(writeAnalyticsRows(env, rows)) } catch { /* analytics never fails a request */ }
}

/** Server-side funnel events (checkout) reuse the same rows. */
export function recordServerEvent(
  env: EventsEnv,
  ctx: { waitUntil(p: Promise<unknown>): void } | undefined,
  input: { name: 'checkout_started' | 'checkout_completed'; userId: string | null; props?: Record<string, Primitive> },
): void {
  const rows = buildAnalyticsRows({
    deviceId: `server-${input.userId ?? 'anonymous'}`.slice(0, 64), sessionId: `server-${input.name}`, surface: 'server', path: '/api',
    events: [{ name: input.name, props: input.props ?? {} }],
  }, 'tinct-worker', input.userId)
  if (rows) insertAnalyticsRows(env, ctx, rows)
}

function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function handleEvents(
  request: Request,
  env: EventsEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (parseInt(request.headers.get('content-length') || '0', 10) > EVENTS_MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Request too large' }, 413, request)
  }
  let text: string
  try { text = await request.text() } catch { return jsonResponse({ error: 'Invalid body' }, 400, request) }
  if (text.length > EVENTS_MAX_BODY_BYTES) return jsonResponse({ error: 'Request too large' }, 413, request)
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const ua = request.headers.get('user-agent') || ''

  // Validate first with no user, so a malformed or rate-limited beacon costs nothing.
  if (!buildAnalyticsRows(parsed, ua, null)) return jsonResponse({ error: 'Invalid events' }, 400, request)
  if (!await checkRateLimit(`events:${clientIp(request)}`, env.RATE_LIMIT, EVENTS_RATE_PER_MINUTE)) {
    return new Response(null, { status: 204, headers: corsHeaders(request) })
  }

  // The user lookup happens in the background write, never on the response path.
  ctx.waitUntil((async () => {
    let userId: string | null = null
    if (request.headers.get('authorization')) {
      try {
        const user = await verifyUser(env, request)
        userId = user && isValidUUID(user.id) ? user.id : null
      } catch { userId = null }
    }
    const rows = buildAnalyticsRows(parsed, ua, userId)
    if (rows) await writeAnalyticsRows(env, rows)
  })())
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
