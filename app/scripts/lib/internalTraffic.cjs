/**
 * Tinct's own automated checks are internal traffic: they must be marked, not
 * counted as readers in analytics_events or ai_usage_events.
 *
 * Every check that drives a browser calls `markInternal` once on what it
 * launched. It sets the same device flag a person sets with `?internal=1`
 * (localStorage `tinct:internal`, see public/lab/internal-traffic.js) before any
 * page script runs, so the app itself marks funnel events `internal: true` and
 * sends `x-tinct-check: 1` on AI and narration requests (the Worker's cost log
 * stores those under its `check` key).
 *
 * The same init script also adds `x-tinct-check: 1` to every `fetch` the page
 * makes to a Tinct `/api/` route (same origin, tinct.app or a workers.dev
 * preview), so profile, follow, recap, position and every other API call is
 * marked too, not only the AI and narration requests the app marks itself.
 * (sendBeacon cannot carry headers; the funnel marks those events in the
 * body.) The header is deliberately not set with `setExtraHTTPHeaders`: that
 * applies to every request, including Supabase, audio and font hosts, where an
 * unexpected custom header turns simple requests into CORS preflights those
 * hosts refuse. Request routing is not used either: it would turn off the
 * browser's HTTP cache that the audio checks depend on.
 *
 * Node-side calls use `checkFetch(url, init)` or spread `checkHeaders()`.
 *
 * Every script that targets production (TINCT_ORIGIN, TEST_ORIGIN or
 * tinct.app) must use this helper; scripts/internalTrafficUsage.test.ts fails
 * CI otherwise.
 *
 * Accepts a Browser (marks its open contexts and every context or page made
 * from it afterwards), a BrowserContext, or a Page (including an Android
 * WebView page, where it also sets the flag on the page that is already open).
 * Returns the same object, so `const browser = await markInternal(await chromium.launch())` works.
 *
 * CommonJS so both the .cjs and the .mjs scripts can load it.
 */
const INTERNAL_KEY = 'tinct:internal'
const MARKED = Symbol.for('tinct.internalTraffic')

/** Runs in the page before any of its scripts; must stay self-contained (it is serialised). */
function setFlag() {
  try { localStorage.setItem('tinct:internal', '1') } catch { /* opaque origin (about:blank) */ }
  try {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function' || window.__tinctCheckFetch) return
    window.__tinctCheckFetch = true
    const original = window.fetch
    window.fetch = function tinctCheckFetch(input, init) {
      try {
        const raw = typeof input === 'string' || input instanceof URL ? String(input) : input && input.url
        const url = new URL(raw, window.location.href)
        const tinctHost = url.origin === window.location.origin || /(^|\.)tinct\.app$/.test(url.hostname) || /\.workers\.dev$/.test(url.hostname)
        if (tinctHost && url.pathname.startsWith('/api/')) {
          const headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined))
          headers.set('x-tinct-check', '1')
          init = Object.assign({}, init, { headers })
        }
      } catch { /* leave the request as it was */ }
      return original.call(this, input, init)
    }
  } catch { /* never in the way of the page */ }
}

/** Headers for a Tinct API call made from Node by a check. */
function checkHeaders(extra = {}) {
  return { ...extra, 'x-tinct-check': '1' }
}

/** `fetch` with `x-tinct-check: 1` added, keeping the caller's headers. */
function checkFetch(url, init = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('x-tinct-check', '1')
  return fetch(url, { ...init, headers })
}

async function markInternal(target) {
  if (!target || target[MARKED]) return target
  target[MARKED] = true
  // Browser: every context, now and later.
  if (typeof target.newContext === 'function' && typeof target.contexts === 'function') {
    const newContext = target.newContext.bind(target)
    target.newContext = async (...args) => markInternal(await newContext(...args))
    const newPage = target.newPage.bind(target)
    target.newPage = async (...args) => {
      const page = await newPage(...args)
      await markInternal(page.context())
      return page
    }
    await Promise.all(target.contexts().map(context => markInternal(context)))
    return target
  }
  // BrowserContext or Page: before any script of every later document.
  if (typeof target.addInitScript === 'function') await target.addInitScript(setFlag)
  // A Page that is already showing Tinct (the Android WebView): set it now too.
  if (typeof target.evaluate === 'function' && typeof target.url === 'function' && /^https?:/.test(target.url())) {
    await target.evaluate(setFlag).catch(() => {})
  }
  return target
}

// Plain assignments so ESM scripts can `import { markInternal } from './lib/internalTraffic.cjs'`.
exports.INTERNAL_KEY = INTERNAL_KEY
exports.CHECK_HEADER = 'x-tinct-check'
exports.markInternal = markInternal
exports.checkHeaders = checkHeaders
exports.checkFetch = checkFetch
