/**
 * On-device layout trace (Anders, 26 Nov 2026: "yes on the trace").
 *
 * Chases the phone bug where a page came back half height after the People
 * card closed. Opt-in only: `?layoutTrace=1` turns it on for this tab (kept in
 * sessionStorage until the tab closes), `?layoutTrace=0` turns it off. Off,
 * every hook is one cached boolean check: no listeners, no DOM, no storage
 * writes.
 *
 * On, it keeps the last TRACE_CAP entries in memory and in this tab's
 * sessionStorage, and the t menu offers "Copy trace". Entries hold layout
 * figures, chapter, page and paragraph indices, element tags and classes, and
 * the names of open cards and sheets. Never book text, never personal data,
 * and nothing is sent anywhere: it leaves the device only when the reader
 * copies it.
 */

export const LAYOUT_TRACE_PARAM = 'layoutTrace'
export const LAYOUT_TRACE_ON_KEY = 'tinct-layout-trace-on'
export const LAYOUT_TRACE_LOG_KEY = 'tinct-layout-trace'
export const TRACE_CAP = 300

export type LayoutTraceEntry = { t: number; k: string } & Record<string, unknown>

let enabled: boolean | null = null
let entries: LayoutTraceEntry[] = []
let origin = 0
let saveTimer: ReturnType<typeof setTimeout> | null = null
let openGetter: (() => string[]) | null = null

function session(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage } catch { return null }
}

/** Is the trace on in this tab? Read once, then cached. */
export function layoutTraceOn(): boolean {
  if (enabled !== null) return enabled
  enabled = false
  try {
    const store = session()
    const flag = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get(LAYOUT_TRACE_PARAM)
    if (flag === '0') {
      store?.removeItem(LAYOUT_TRACE_ON_KEY)
      store?.removeItem(LAYOUT_TRACE_LOG_KEY)
      return enabled
    }
    if (flag === '1') store?.setItem(LAYOUT_TRACE_ON_KEY, '1')
    enabled = flag === '1' || store?.getItem(LAYOUT_TRACE_ON_KEY) === '1'
    if (enabled) {
      const saved = store?.getItem(LAYOUT_TRACE_LOG_KEY)
      const parsed = saved ? JSON.parse(saved) as { o?: number; e?: LayoutTraceEntry[] } : null
      if (parsed && Array.isArray(parsed.e)) {
        entries = parsed.e.slice(-TRACE_CAP)
        origin = typeof parsed.o === 'number' ? parsed.o : 0
      }
    }
  } catch {
    // A blocked or corrupt store leaves the trace as the URL says, in memory only.
  }
  return enabled
}

function now(): number {
  return Date.now()
}

function save() {
  saveTimer = null
  try { session()?.setItem(LAYOUT_TRACE_LOG_KEY, JSON.stringify({ o: origin, e: entries })) } catch { /* full or blocked */ }
}

function scheduleSave() {
  if (saveTimer !== null) return
  saveTimer = setTimeout(save, 300)
}

/** The element with focus, as tag.class (no text). */
export function layoutTraceActive(): string {
  if (typeof document === 'undefined') return ''
  const el = document.activeElement
  if (!el) return ''
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''
  return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`
}

/** Window, document and visual viewport figures, the focused element and the open cards and sheets. */
export function layoutTraceEnv(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const vv = window.visualViewport
  const round = (n: number | undefined) => typeof n === 'number' ? Math.round(n * 10) / 10 : null
  let open: string[] = []
  try { open = openGetter?.() ?? [] } catch { open = [] }
  return {
    ih: window.innerHeight,
    vh: round(vv?.height),
    vs: round(vv?.scale),
    vo: round(vv?.offsetTop),
    // The window's own scroll and the layout's height: iOS pans the window to a focused field, and innerHeight can
    // then report less than the layout is tall (the half-height page, 27 Nov 2026).
    sy: Math.round(window.scrollY || 0),
    dh: typeof document === 'undefined' ? null : document.documentElement?.clientHeight ?? null,
    ae: layoutTraceActive(),
    open,
  }
}

/** Append one entry. A no-op while the trace is off. */
export function layoutTrace(kind: string, data?: Record<string, unknown>, withEnv = true): void {
  if (!layoutTraceOn()) return
  const at = now()
  if (!entries.length || !origin) origin = at
  const entry: LayoutTraceEntry = { t: at - origin, k: kind, ...(data ?? {}), ...(withEnv ? layoutTraceEnv() : {}) }
  entries.push(entry)
  if (entries.length > TRACE_CAP) entries.splice(0, entries.length - TRACE_CAP)
  scheduleSave()
}

/** LabApp names the cards and sheets that are open (read at each entry). */
export function setLayoutTraceOpenGetter(getter: (() => string[]) | null): void {
  if (!layoutTraceOn()) return
  openGetter = getter
}

export function layoutTraceEntries(): LayoutTraceEntry[] {
  return entries.slice()
}

/** The whole buffer as compact JSON, for the clipboard. */
export function layoutTraceJson(): string {
  return JSON.stringify({
    v: 1,
    at: new Date(origin || now()).toISOString(),
    ua: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    dpr: typeof window === 'undefined' ? null : window.devicePixelRatio,
    sw: typeof screen === 'undefined' ? null : screen.width,
    sh: typeof screen === 'undefined' ? null : screen.height,
    e: entries,
  })
}

/**
 * Visual viewport resize/scroll and orientation changes, throttled per kind
 * (one entry per 150 ms, the last one always kept). Installed only while on.
 */
export function installLayoutTraceListeners(): () => void {
  if (!layoutTraceOn() || typeof window === 'undefined') return () => {}
  const last: Record<string, number> = {}
  const trailing: Record<string, ReturnType<typeof setTimeout> | undefined> = {}
  const record = (kind: string) => {
    const at = now()
    if (trailing[kind]) { clearTimeout(trailing[kind]); trailing[kind] = undefined }
    if (at - (last[kind] ?? 0) >= 150) {
      last[kind] = at
      layoutTrace(kind)
      return
    }
    trailing[kind] = setTimeout(() => { trailing[kind] = undefined; last[kind] = now(); layoutTrace(kind) }, 150)
  }
  const vv = window.visualViewport
  const onResize = () => record('vv-resize')
  const onScroll = () => record('vv-scroll')
  const onOrientation = () => record('orientation')
  const onWindowResize = () => record('win-resize')
  const onHide = () => { if (saveTimer !== null) { clearTimeout(saveTimer); save() } }
  vv?.addEventListener('resize', onResize)
  vv?.addEventListener('scroll', onScroll)
  window.addEventListener('orientationchange', onOrientation)
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('pagehide', onHide)
  layoutTrace('trace-start', { w: window.innerWidth })
  return () => {
    vv?.removeEventListener('resize', onResize)
    vv?.removeEventListener('scroll', onScroll)
    window.removeEventListener('orientationchange', onOrientation)
    window.removeEventListener('resize', onWindowResize)
    window.removeEventListener('pagehide', onHide)
    Object.values(trailing).forEach(timer => timer && clearTimeout(timer))
  }
}

/** A painted-overflow measurement, rounded. */
export function tracePainted(painted: { lastBottom: number; chromeTop: number; lineHeight: number; lastLineWords: number; scrollOverflow: boolean } | null | undefined): Record<string, unknown> {
  if (!painted) return { painted: null }
  return { inkBottom: Math.round(painted.lastBottom), chromeTop: Math.round(painted.chromeTop), lineH: Math.round(painted.lineHeight), lastLineWords: painted.lastLineWords, scrollOverflow: painted.scrollOverflow }
}

/** A page as indices only: first paragraph and words, last segment's paragraph and end word. */
export function tracePage(page: { paragraphIndex: number; from: number; to: number; segments?: { paragraphIndex: number; from: number; to: number }[] } | null | undefined): number[] | null {
  if (!page) return null
  const last = page.segments?.length ? page.segments[page.segments.length - 1] : page
  return [page.paragraphIndex, page.from, last.paragraphIndex, last.to]
}

export function resetLayoutTraceForTest(): void {
  enabled = null
  entries = []
  origin = 0
  openGetter = null
  if (saveTimer !== null) clearTimeout(saveTimer)
  saveTimer = null
}

export function flushLayoutTraceForTest(): void {
  if (saveTimer !== null) { clearTimeout(saveTimer); save() }
}
