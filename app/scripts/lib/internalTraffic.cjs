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
 * The header is deliberately not set with `setExtraHTTPHeaders`: that applies
 * to every request, including Supabase, audio and font hosts, where an
 * unexpected custom header turns simple requests into CORS preflights those
 * hosts refuse. Scripts that already add `x-tinct-check` in a `route.fetch`
 * keep doing so.
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

function setFlag() {
  try { localStorage.setItem('tinct:internal', '1') } catch { /* opaque origin (about:blank) */ }
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
