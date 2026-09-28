/** Low-priority public assets only. Never mounts a library or reads/writes positions. */
export function warmLibraryPreview() {
  if (!/(?:^|;\s*)tinct_library_preview=1(?:;|$)/.test(document.cookie)) return
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData || navigator.onLine === false) return
  const keepVisit = () => {
    try {
      const visit = JSON.parse(sessionStorage.getItem('tinct:library-2-visit') || 'null')
      if (visit) sessionStorage.setItem('tinct:library-2-visit', JSON.stringify({ ...visit, at: Date.now() }))
    } catch { /* Storage is optional. */ }
  }
  window.addEventListener('pagehide', keepVisit)
  const warm = () => {
    const base = '/lab/library_2/', version = '?v=20260928b'
    const urls = ['styles.css', 'bookshelf.css', 'boot.js', 'initial-cover.js', 'app.js', 'bookshelf.js', 'bookshelf-view.js', 'bookshelf-template.js', 'visit.js', 'catalogue.js', 'books.js', 'reading-table.js', 'authors.js', 'motion.js', 'hero-navigation.js', 'scene-life.js', 'reading-room.js', 'taxonomy.js'].map(file => base + file + version)
    urls.push(base + 'shelf-study/library-wall.jpg', '/lab/catalogue.json', '/lab/library-2-reading.js' + version)
    for (const binding of ['green', 'oxblood', 'navy', 'black', 'brown', 'slate', 'plum', 'ochre']) urls.push(base + 'assets/spines/spine-' + binding + '.jpg')
    // Serial batches leave bandwidth available for the book's next chapter.
    void (async () => { for (let i=0;i<urls.length;i+=2) await Promise.all(urls.slice(i,i+2).map(url => fetch(url, { priority: 'low' } as RequestInit).then(r => r.arrayBuffer()).catch(() => {}))) })()
    keepVisit()
  }
  const schedule = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 5000 })
    else setTimeout(warm, 1500)
  }
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
}
