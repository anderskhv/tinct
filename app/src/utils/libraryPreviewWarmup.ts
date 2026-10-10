/**
 * While the reader is idle, warm the library the reader will go back to, so
 * it opens from the device: the page's own scripts and styles, the engine
 * bundles its boot.js preloads for a returning reader, the room scene, the
 * desk's cover and spines, and the catalogue.
 *
 * The list comes from the library page itself (its modulepreload, stylesheet
 * and script tags) and from boot.js (the stamped engine bundles), never from a
 * copy kept here: a copy drifted for two weeks (10 Oct 2026: the warm-up
 * fetched `?v=20260928covers` while the library had moved on through five
 * tags, so nothing it warmed was used).
 *
 * Low-priority public assets only. Never mounts a library or reads/writes
 * positions. Same-origin public paths only; anything else is skipped.
 */
const LIBRARY_BASE = '/lab/library_2/'
const PUBLIC_ASSET = /^\/(?:lab|omarchy|assets|covers)\/[A-Za-z0-9/_.-]+(?:\?v=[A-Za-z0-9_.-]+)?$/
const PUBLIC_IMAGE = /^\/(?:lab\/library_2\/assets|covers)\/[A-Za-z0-9/_-]+\.(?:jpg|png|webp)$/i

/** The URLs the library page loads: its modulepreloads, stylesheets and scripts, resolved against its base. */
export function libraryPageAssets(html: string): string[] {
  const urls: string[] = []
  const tag = /<(link|script)\b([^>]*)>/gi
  let match: RegExpExecArray | null
  while ((match = tag.exec(html))) {
    const attrs = match[2]
    const href = /\b(?:href|src)="([^"]+)"/i.exec(attrs)?.[1]
    if (!href) continue
    if (match[1].toLowerCase() === 'link' && !/\brel="(?:modulepreload|stylesheet)"/i.test(attrs)) continue
    const path = publicPath(href)
    if (path) urls.push(path)
  }
  return urls
}

/** The engine bundles and the reading bridge that boot.js preloads for a returning reader. */
export function bootPreloads(bootSource: string): string[] {
  return [...bootSource.matchAll(/(\/assets\/[A-Za-z0-9_.-]+\.js|\/lab\/library-2-reading\.js\?v=[A-Za-z0-9_.-]+)/g)].map(m => m[1])
}

function publicPath(value: string): string | null {
  try {
    const url = new URL(value, location.origin + LIBRARY_BASE)
    if (url.origin !== location.origin) return null
    const path = url.pathname + url.search
    return PUBLIC_ASSET.test(path) && !/token=/.test(path) ? path : null
  } catch {
    return null
  }
}

function publicImage(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value, location.origin + LIBRARY_BASE)
    return url.origin === location.origin && !url.search && PUBLIC_IMAGE.test(url.pathname) ? url.pathname : null
  } catch {
    return null
  }
}

/** The desk the library will paint first (boot.js): its shown cover, every book's cover, and the spines. */
function deskImages(): string[] {
  const urls: string[] = []
  try {
    const first = JSON.parse(localStorage.getItem('tinct:library-2-first-paint') || 'null') as { cover?: unknown; art?: Record<string, { u?: unknown }> } | null
    const shown = publicImage(first?.cover)
    if (shown) urls.push(shown)
    for (const entry of Object.values(first?.art ?? {})) { const cover = publicImage(entry?.u); if (cover) urls.push(cover) }
  } catch { /* Storage is optional. */ }
  try {
    const artwork: unknown = JSON.parse(sessionStorage.getItem('tinct:library-2-artwork') || '[]')
    if (Array.isArray(artwork)) for (const value of artwork.slice(0, 13)) { const cover = publicImage(value); if (cover) urls.push(cover) }
  } catch { /* Storage is optional. */ }
  return urls
}

export function warmLibraryPreview() {
  // Never on Save Data or a 2G-class connection: there, every byte belongs to the book.
  if (!networkSpare()) return
  const controller = new AbortController()
  let stopped = false
  const keepVisit = () => {
    try {
      const visit = JSON.parse(sessionStorage.getItem('tinct:library-2-visit') || 'null')
      if (visit) sessionStorage.setItem('tinct:library-2-visit', JSON.stringify({ ...visit, at: Date.now() }))
    } catch { /* Storage is optional. */ }
  }
  window.addEventListener('pagehide', () => {
    stopped = true
    controller.abort()
    keepVisit()
  }, { once: true })
  // Any failure ends this optional warm-up; never enqueue into a departing document.
  // WebKit rejects requests as a navigation starts, before pagehide fires.
  const get = (url: string) => fetch(url, { priority: 'low', signal: controller.signal } as RequestInit)
  const warm = () => {
    if (stopped) return
    const hour = new Date().getHours(), room = hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night'
    const scene = LIBRARY_BASE + `assets/table-${room}-${innerWidth / innerHeight > 1.2 ? 'wide' : 'phone'}.jpg`
    void (async () => {
      try {
        // The page and the scene first; the page says what else to warm.
        const [page] = await Promise.all([get(LIBRARY_BASE + 'index.html').then(r => r.text()), get(scene).then(r => r.arrayBuffer())])
        if (stopped) return
        const urls = [...deskImages(), ...libraryPageAssets(page), '/lab/catalogue.json']
        for (const binding of ['green', 'oxblood', 'navy', 'black', 'brown', 'slate', 'plum', 'ochre']) urls.push(LIBRARY_BASE + 'assets/spines/spine-' + binding + '.jpg')
        const unique = [...new Set(urls)]
        let boot = ''
        // Serial batches leave bandwidth available for the book's next chapter.
        for (let i = 0; i < unique.length && !stopped; i += 2) {
          await Promise.all(unique.slice(i, i + 2).map(url => get(url).then(async r => {
            if (/\/boot\.js(?:\?|$)/.test(url)) boot = await r.text()
            else await r.arrayBuffer()
          })))
        }
        // The engine bundles boot.js preloads for a returning reader, last: the largest, and only needed once signed in.
        const bundles = [...new Set(bootPreloads(boot))].filter(url => !unique.includes(url))
        for (let i = 0; i < bundles.length && !stopped; i += 2) {
          await Promise.all(bundles.slice(i, i + 2).map(url => get(url).then(r => r.arrayBuffer())))
        }
      } catch {
        stopped = true
        controller.abort()
      }
    })()
    keepVisit()
  }
  whenReaderSettled(warm, () => stopped)
}

/** Save Data, a 2G-class connection, or offline: no optional network work at all. */
export function networkSpare(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !(connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType || '') || navigator.onLine === false)
}

/**
 * Run optional work once the reader has settled: the reader's own first page
 * comes first, and so do the chapter texts and audio it fetches right after,
 * so this waits for the page to be on screen, then three seconds more, then
 * the browser's idle time. Bounded, so a reader that never reports ready
 * still gets its optional work.
 */
export function whenReaderSettled(run: () => void, stopped: () => boolean = () => false, settleMs = 3000): void {
  const idle = () => {
    if (stopped()) return
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 5000 })
    else setTimeout(run, 1500)
  }
  const schedule = () => {
    const started = Date.now()
    const tick = () => {
      if (stopped()) return
      if (document.querySelector('[data-reader-ready="true"]') || Date.now() - started > 10000) setTimeout(idle, settleMs)
      else setTimeout(tick, 250)
    }
    tick()
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
}
