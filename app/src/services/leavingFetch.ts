/**
 * Account commits made while the page is hidden or being left go out with `keepalive`, so they complete after the
 * page is frozen or closed (Disk IO, 14 Nov 2026: highlights and chat wait a few seconds before they are sent,
 * and are sent at once on hide and pagehide). Only `commit_user_data` calls, only small bodies (the browser
 * allows about 64 KB in flight for keepalive requests per page); anything else, or a keepalive request the
 * browser refuses, is an ordinary request. A commit carries an expected rev, so one that is sent twice
 * conflicts and merges instead of being applied twice.
 */
let hidden = false

try {
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof window.addEventListener === 'function' && typeof document.addEventListener === 'function') {
    const update = () => { hidden = document.visibilityState === 'hidden' }
    // Capture listeners, added when this module loads: they run before the writers' own hide handlers.
    document.addEventListener('visibilitychange', update, true)
    window.addEventListener('pagehide', () => { hidden = true }, true)
    window.addEventListener('pageshow', update, true)
  }
} catch { /* no page to leave (worker, test stub): plain requests */ }

const KEEPALIVE_BODY_CHARS = 20_000
const COMMIT_PATH = /\/rest\/v1\/rpc\/commit_user_data$/

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

export function keepaliveFor(input: RequestInfo | URL, init: RequestInit | undefined, pageHidden = hidden): boolean {
  if (!pageHidden || !init || (init.method ?? 'GET').toUpperCase() !== 'POST') return false
  if (typeof init.body !== 'string' || init.body.length > KEEPALIVE_BODY_CHARS) return false
  return COMMIT_PATH.test(requestUrl(input).split('?')[0])
}

export const leavingAwareFetch: typeof fetch = async (input, init) => {
  if (keepaliveFor(input, init)) {
    try {
      return await globalThis.fetch(input, { ...init, keepalive: true })
    } catch (error) {
      if (init?.signal?.aborted) throw error
      // Refused (over the keepalive allowance) or failed: once more as an ordinary request.
    }
  }
  return globalThis.fetch(input, init)
}
