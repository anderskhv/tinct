// Audio URL resolver. Audio is served through the Tinct Worker so the R2
// bucket can stay private. The Worker reads from the AUDIO_BUCKET binding and
// applies the access/rate-limit policy at one origin.

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

/**
 * Resolve a relative audio path (e.g. "antigone/original-en/ch1/p001.mp3" or
 * "disclaimer-en.mp3") to a fetchable URL. Use this in BottomBar.tsx
 * and other audio callers instead of building direct R2 URLs.
 *
 * `kind: 'file'` returns audio (audio/mpeg). `kind: 'manifest'` returns
 * JSON. Both endpoints are CORS-enabled so they work from any origin.
 */
export function resolveAudioUrl(path: string, kind: 'file' | 'manifest' = 'file'): string {
  const endpoint = kind === 'manifest' ? '/api/audio-manifest' : '/api/audio-file'
  if (isCapacitor()) {
    return `${workerOrigin()}${endpoint}?path=${encodeURIComponent(path)}`
  }
  return `${endpoint}?path=${encodeURIComponent(path)}`
}
