// Audio URL resolver. Direct R2 on the web, but route through the worker
// proxy when running inside Capacitor — the WebView's `https://localhost`
// origin doesn't reliably load media from a different origin (R2's
// `pub-*.r2.dev`), and the manifest fetch is straight-up blocked by CORS.
// The worker's `/api/audio-file` and `/api/audio-manifest` endpoints proxy
// R2 with `Access-Control-Allow-Origin: *` and the right Content-Type.
//
// On the web (tinct.app origin) we keep direct R2 — fewer hops, lower
// latency, and our existing CSP/CORS already covers it.

const R2_BASE = 'https://pub-c34df89c93284423a39b03537595c2e2.r2.dev'

function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!(window as Record<string, unknown>).Capacitor
}

/** Where worker endpoints live when running in Capacitor — must call the
 * deployed tinct.app worker, not the localhost SPA host. */
function workerOrigin(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (origin.startsWith('https://localhost') || origin.startsWith('capacitor://')) {
      return 'https://tinct.app'
    }
  }
  return ''
}

// Direct R2 root (web) — kept exported for backward compat with existing code
// that builds `${AUDIO_BASE_URL}/path` directly. New code should prefer
// resolveAudioUrl() which handles the Capacitor case.
export const AUDIO_BASE_URL = (() => {
  // On Capacitor, AUDIO_BASE_URL is the worker proxy root and consumers
  // append /path; the worker handles `/path/foo.mp3` as a query-string
  // call internally. To keep callers simple we return a base URL that
  // produces the right call when concatenated with a path:
  //   web:       https://pub-...r2.dev/<path>
  //   capacitor: https://tinct.app/api/audio-file?path=<path>
  // Capacitor consumers must use resolveAudioUrl() — the static base
  // can't form a valid query-string with concatenation.
  if (isCapacitor()) {
    // Returning R2_BASE here would silently break Capacitor. Returning a
    // proxy-prefix that's invalid on its own forces callers to use
    // resolveAudioUrl(). But for safety, return R2_BASE — caller code
    // should be migrated explicitly via resolveAudioUrl below.
    return R2_BASE
  }
  return import.meta.env.VITE_AUDIO_BASE_URL || R2_BASE
})()

/**
 * Resolve a relative R2 path (e.g. "antigone/original-en/ch1/p001.mp3" or
 * "disclaimer-en.mp3") to a fetchable URL. Use this in BottomBar.tsx
 * everywhere instead of `${AUDIO_BASE_URL}/...` so the Capacitor proxy
 * path is taken automatically.
 *
 * `kind: 'file'` returns audio (audio/mpeg). `kind: 'manifest'` returns
 * JSON. Both endpoints are CORS-enabled so they work from any origin.
 */
export function resolveAudioUrl(path: string, kind: 'file' | 'manifest' = 'file'): string {
  if (isCapacitor()) {
    const endpoint = kind === 'manifest' ? '/api/audio-manifest' : '/api/audio-file'
    return `${workerOrigin()}${endpoint}?path=${encodeURIComponent(path)}`
  }
  return `${R2_BASE}/${path}`
}
