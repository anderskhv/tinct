import { libraryEntryPath } from '../worker/routes/libraryTwoRelease'

/** Low-priority public assets only. Never mounts a library or reads/writes positions. */
export function warmLibraryPreview() {
  if (libraryEntryPath(document.cookie) !== '/lab/library_2/') return
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData || navigator.onLine === false) return
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
  const warm = () => {
    if (stopped) return
    const base = '/lab/library_2/', version = '?v=20260928covers'
    const hour=new Date().getHours(),room=hour>=6&&hour<12?'morning':hour>=12&&hour<17?'afternoon':hour>=17&&hour<21?'evening':'night'
    const urls = [base + `assets/table-${room}-${innerWidth/innerHeight>1.2?'wide':'phone'}.jpg`]
    // Warm the actual public covers, selected book first. This manifest contains
    // artwork URLs only; it is never used to choose books or restore a position.
    try {
      const artwork: unknown = JSON.parse(sessionStorage.getItem('tinct:library-2-artwork') || '[]')
      if (Array.isArray(artwork)) for (const value of artwork.slice(0, 13)) {
        if (typeof value !== 'string') continue
        const url = new URL(value, location.origin + base)
        if (url.origin === location.origin && /^\/(?:lab\/library_2\/assets|covers)\/[a-z0-9/_-]+\.(?:jpg|png|webp)$/i.test(url.pathname) && !url.search) urls.push(url.pathname)
      }
    } catch { /* Storage is optional. */ }
    urls.push(...['styles.css', 'bookshelf.css', 'boot.js', 'initial-cover.js', 'app.js', 'bookshelf.js', 'bookshelf-view.js', 'bookshelf-template.js', 'visit.js', 'catalogue.js', 'cover-assets.js', 'books.js', 'reading-table.js', 'authors.js', 'motion.js', 'hero-navigation.js', 'scene-life.js', 'reading-room.js', 'taxonomy.js'].map(file => base + file + version))
    urls.push('/lab/catalogue.json', '/lab/library-2-reading.js' + version)
    for (const binding of ['green', 'oxblood', 'navy', 'black', 'brown', 'slate', 'plum', 'ochre']) urls.push(base + 'assets/spines/spine-' + binding + '.jpg')
    // Serial batches leave bandwidth available for the book's next chapter.
    // WebKit rejects requests as a navigation starts, before pagehide fires.
    // Any failure ends this optional warmup; never enqueue into a departing document.
    const unique = [...new Set(urls)]
    void (async () => { for (let i=0;i<unique.length && !stopped;i+=2) await Promise.all(unique.slice(i,i+2).map(url => fetch(url, { priority: 'low', signal: controller.signal } as RequestInit).then(r => r.arrayBuffer()).catch(() => { stopped = true; controller.abort() }))) })()
    keepVisit()
  }
  const schedule = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 5000 })
    else setTimeout(warm, 1500)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
}
