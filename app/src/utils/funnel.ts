/**
 * Funnel instrumentation for the reader (the library page has its own copy in
 * public/lab/library_2/funnel.js: same wire format, no bundler).
 *
 * Events are queued in memory and sent to /api/events in small batches with
 * fetch keepalive (when the reader is signed in, so the Worker can attach the
 * account) or sendBeacon. Sending is fire and forget: it never awaits, never
 * throws and never blocks reading. It is off in development, in tests and in
 * automated browsers, so QA runs do not pollute the numbers.
 *
 * The anonymous device id is the reader's existing lab device id (localStorage
 * `tinct-lab-device-id`, see lab/labPosition.ts). The reader registers the real
 * `readLabDeviceId` through `setFunnelDeviceId`; other pages (sign-in, library
 * assistant) read the same key with the light fallback below, so importing the
 * funnel never drags the position store into their bundles.
 */
import { apiUrl } from './apiUrl'
import { captureAttribution, getAttributionPayload } from './attribution'

export type FunnelEventName =
  | 'landing_view' | 'book_opened' | 'first_page_turn' | 'chapter_completed'
  | 'ai_first_use' | 'anon_limit_reached' | 'signup_started' | 'signup_completed'
  | 'member_ai_use' | 'checkout_started' | 'checkout_completed'

type Wire = FunnelEventName | 'pageview' | 'page_duration'
type Props = Record<string, string | number | boolean | null | undefined>

export interface FunnelDeps {
  enabled: () => boolean
  deviceId: () => string
  sessionId: () => string
  path: () => string
  referrer: () => string
  attribution: () => unknown
  token: () => string | null
  visible: () => boolean
  now: () => number
  send: (body: string, token: string | null) => void
  once: { has(name: string): boolean; add(name: string): void }
  setTimer: (fn: () => void, ms: number) => unknown
  clearTimer: (handle: unknown) => void
}

export const FUNNEL_FLUSH_MS = 4000
export const FUNNEL_BATCH = 10
export const FUNNEL_HEARTBEAT_MS = 30_000

export function createFunnel(deps: FunnelDeps, surface: 'library' | 'reader' | 'sign-in' = 'reader') {
  let queue: Array<{ name: Wire; props: Record<string, string | number | boolean> }> = []
  let timer: unknown = null
  let visibleSince: number | null = null
  let visibleMs = 0
  let heartbeat: unknown = null

  const clean = (props?: Props) => {
    const out: Record<string, string | number | boolean> = {}
    for (const [key, value] of Object.entries(props ?? {})) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') out[key] = value
    }
    return out
  }

  function flush(): void {
    if (timer !== null) { deps.clearTimer(timer); timer = null }
    if (queue.length === 0) return
    const events = queue.slice(0, 20)
    queue = queue.slice(20)
    try {
      deps.send(JSON.stringify({
        deviceId: deps.deviceId(), sessionId: deps.sessionId(), surface, path: deps.path(),
        referrer: deps.referrer(), attribution: deps.attribution(), events,
      }), deps.token())
    } catch { /* analytics never breaks reading */ }
    if (queue.length) flush()
  }

  function track(name: Wire, props?: Props): void {
    try {
      if (!deps.enabled()) return
      queue.push({ name, props: clean(props) })
      if (queue.length >= FUNNEL_BATCH) flush()
      else if (timer === null) timer = deps.setTimer(flush, FUNNEL_FLUSH_MS)
    } catch { /* never throws */ }
  }

  /** Once per device: the first time this has ever happened here. */
  function trackOnce(name: FunnelEventName, props?: Props): void {
    try {
      if (!deps.enabled() || deps.once.has(name)) return
      deps.once.add(name)
      track(name, props)
    } catch { /* never throws */ }
  }

  function takeVisible(): number {
    const now = deps.now()
    const total = visibleMs + (visibleSince !== null ? now - visibleSince : 0)
    visibleMs = 0
    visibleSince = visibleSince !== null ? now : null
    return total
  }

  function reportDuration(): void {
    const ms = takeVisible()
    if (ms >= 1000) track('page_duration', { duration_ms: Math.round(ms) })
  }

  /** Call when the page becomes visible or hidden. Hidden flushes everything. */
  function visibility(visible: boolean): void {
    try {
      if (visible) { if (visibleSince === null) visibleSince = deps.now(); return }
      reportDuration()
      visibleSince = null
      flush()
    } catch { /* never throws */ }
  }

  /** Record the pageview and start counting visible time. */
  function start(props?: Props): void {
    try {
      if (!deps.enabled()) return
      track('pageview', props)
      visibleSince = deps.visible() ? deps.now() : null
      if (heartbeat === null) {
        const beat = () => { reportDuration(); heartbeat = deps.setTimer(beat, FUNNEL_HEARTBEAT_MS) }
        heartbeat = deps.setTimer(beat, FUNNEL_HEARTBEAT_MS)
      }
    } catch { /* never throws */ }
  }

  function stop(): void {
    if (heartbeat !== null) { deps.clearTimer(heartbeat); heartbeat = null }
  }

  return { track, trackOnce, flush, start, stop, visibility }
}

// ===== Browser wiring =====

const ONCE_KEY = 'tinct:funnel-once'
const SESSION_KEY = 'tinct-funnel-session'

function newId(): string {
  try { if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, '') } catch { /* fall through */ }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.padEnd(16, '0').slice(0, 32)
}

function browserSession(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const next = newId()
    sessionStorage.setItem(SESSION_KEY, next)
    return next
  } catch { return memorySession }
}
const memorySession = newId()

function browserOnce(): FunnelDeps['once'] {
  const read = (): string[] => {
    try { const value = JSON.parse(localStorage.getItem(ONCE_KEY) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] }
  }
  const memory = new Set<string>()
  return {
    has: name => memory.has(name) || read().includes(name),
    add: name => {
      memory.add(name)
      try { localStorage.setItem(ONCE_KEY, JSON.stringify([...new Set([...read(), name])])) } catch { /* private mode */ }
    },
  }
}

const DEVICE_KEY = 'tinct-lab-device-id'
let deviceIdReader: (() => string) | null = null
/** The reader hands over `readLabDeviceId` so there is exactly one id source there. */
export function setFunnelDeviceId(read: () => string): void { deviceIdReader = read }

function lightDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing) return existing
    const next = newId()
    localStorage.setItem(DEVICE_KEY, next)
    return next
  } catch { return memorySession }
}

let authToken: string | null = null
/** The reader host tells the funnel who is signed in, so the Worker can attach the account. */
export function setFunnelToken(token: string | null): void { authToken = token }
export function getFunnelToken(): string | null { return authToken }

function browserDeps(): FunnelDeps {
  return {
    enabled: () => {
      if (typeof window === 'undefined' || import.meta.env.DEV || import.meta.env.MODE === 'test') return false
      return !(typeof navigator !== 'undefined' && navigator.webdriver)
    },
    deviceId: () => (deviceIdReader ? deviceIdReader() : lightDeviceId()),
    sessionId: browserSession,
    path: () => location.pathname,
    referrer: () => document.referrer,
    attribution: () => { captureAttribution(); return getAttributionPayload() },
    token: () => authToken,
    visible: () => document.visibilityState !== 'hidden',
    now: () => Date.now(),
    send: (body, token) => {
      const url = apiUrl('/api/events')
      if (token || typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
        void fetch(url, {
          method: 'POST', keepalive: true, body,
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        }).catch(() => {})
        return
      }
      // text/plain keeps the beacon a simple request: no preflight.
      if (!navigator.sendBeacon(url, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) {
        void fetch(url, { method: 'POST', keepalive: true, body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {})
      }
    },
    once: browserOnce(),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
  }
}

let instance: ReturnType<typeof createFunnel> | null = null
let hooked = false

export function funnel(surface: 'library' | 'reader' | 'sign-in' = 'reader'): ReturnType<typeof createFunnel> {
  if (!instance) instance = createFunnel(browserDeps(), surface)
  if (!hooked && typeof document !== 'undefined') {
    hooked = true
    document.addEventListener('visibilitychange', () => instance?.visibility(document.visibilityState !== 'hidden'))
    window.addEventListener('pagehide', () => instance?.visibility(false))
  }
  return instance
}

/** Fire and forget helpers for call sites. */
export function trackFunnel(name: FunnelEventName, props?: Props): void { funnel().track(name, props) }
export function trackFunnelOnce(name: FunnelEventName, props?: Props): void { funnel().trackOnce(name, props) }
