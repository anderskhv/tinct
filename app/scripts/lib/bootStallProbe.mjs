// Diagnostics for a reader that never finishes booting in a live check (17 Nov 2026: two
// staged releases rolled back with the reader's own scripts, CSS and fonts still pending and
// no error). When a boot times out, each request still pending is fetched again directly from
// the runner, so the evidence says whether the file was unavailable at the edge (status,
// timing, cache headers) or only the browser's connection stalled. Diagnostic only: it never
// changes a check's verdict.
import { createRequire } from 'node:module'
const { checkHeaders } = createRequire(import.meta.url)('./internalTraffic.cjs')

export function trackPending(page) {
  const pending = new Map()
  const started = request => pending.set(request, Date.now())
  const finished = request => pending.delete(request)
  page.on('request', started); page.on('requestfinished', finished); page.on('requestfailed', finished)
  return {
    pending,
    stop() { page.off('request', started); page.off('requestfinished', finished); page.off('requestfailed', finished) },
  }
}

/** Re-fetch up to `limit` stalled URLs (same origin only) and report what the edge answers. */
export async function probeStalled(pending, { limit = 8, timeoutMs = 15_000 } = {}) {
  const now = Date.now()
  const entries = [...pending.entries()].slice(0, limit)
  return Promise.all(entries.map(async ([request, since]) => {
    const url = request.url()
    const started = Date.now()
    const base = { url, resourceType: request.resourceType(), pendingMs: now - since }
    try {
      const response = await fetch(url, { headers: checkHeaders({ 'User-Agent': 'Tinct-boot-stall-probe' }), signal: AbortSignal.timeout(timeoutMs) })
      const body = await response.arrayBuffer()
      const h = name => response.headers.get(name)
      return { ...base, status: response.status, ms: Date.now() - started, bytes: body.byteLength,
        cfRay: h('cf-ray'), cfCacheStatus: h('cf-cache-status'), age: h('age'), contentType: h('content-type') }
    } catch (error) {
      return { ...base, error: String(error), ms: Date.now() - started }
    }
  }))
}
