import { existsSync, readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

/**
 * The returning reader's first paint (2026-10-10). Measured on production before
 * these changes: the desk showed 6-10 s after navigation on a phone over 4G,
 * behind five serial module round trips, the engine's late bundles, a cover and
 * spine fetched only once the table existed, and a second rebuild when the
 * account read reordered the cached books.
 */
const publicDir = new URL('../public/', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, publicDir), 'utf8')
const html = read('lab/library_2/index.html')

/** Static import graph of the page's module scripts, as site paths with their cache tags. */
function moduleGraph(): { roots: string[]; modules: string[] } {
  const roots = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map(m => m[1]).map(src => (src.startsWith('/') ? src : '/lab/library_2/' + src))
  const seen = new Set<string>()
  const visit = (url: string) => {
    if (seen.has(url)) return
    seen.add(url)
    const file = new URL('.' + url.split('?')[0], publicDir)
    if (!existsSync(file)) return
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/^\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      const target = new URL(match[1], 'https://tinct.app' + url)
      visit(target.pathname + target.search)
    }
  }
  roots.forEach(visit)
  return { roots, modules: [...seen].filter(url => !roots.includes(url) && existsSync(new URL('.' + url.split('?')[0], publicDir))).sort() }
}

describe('library first paint: the module graph is fetched with the page', () => {
  it('index.html preloads every module app.js imports, directly or through another module, under the same cache tag', () => {
    const preloads = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(m => m[1]).map(href => (href.startsWith('/') ? href : '/lab/library_2/' + href)).sort()
    const { modules } = moduleGraph()
    expect(modules.length).toBeGreaterThan(20)
    expect(preloads).toEqual(modules)
    // Every preloaded file exists, so a tag bump that misses one is caught here.
    for (const url of preloads) expect(existsSync(new URL('.' + url.split('?')[0], publicDir)), url).toBe(true)
  })
  it('the hero paints the preloaded table scene while the desk is pending, instead of hiding everything', () => {
    const css = read('lab/library_2/bookshelf.css')
    expect(css).not.toContain('html.returning-pending #hero{visibility:hidden}')
    expect(css).toContain('html.returning-pending #hero>:not(.reading-table){visibility:hidden}')
    expect(css).toContain('html.returning-scene-pending[data-returning-view=table] #hero,html.returning-pending[data-returning-view=table] #hero,html.returning[data-returning-view=table] #hero{background:var(--initial-scene-colour,#10150f) var(--initial-scene) var(--initial-scene-position,center)/var(--initial-scene-size,cover) no-repeat}')
    expect(css).toContain('html[data-returning-view=table] .bookshelf-loading:not(:has(p)){background:transparent}')
  })
  it('shelf covers wait for the desk while it is pending, and never wait forever', () => {
    const app = read('lab/library_2/app.js')
    expect(app).toContain("function shelfCover(book){(deskPending()?deskRevealed.then(()=>ensureCover(book)):ensureCover(book)).catch(()=>{});}")
    // The desk's own cover goes straight through ensureCover, never through the wait.
    expect(app).toMatch(/prepareCover:async\(id,canvas\)=>\{[^\n]*?await ensureCover\(book\);paintCover\(canvas,id/)
    expect(app).not.toContain('await deskRevealed')
    expect(app).toMatch(/const deskRevealed=new Promise\(resolve=>\{if\(!deskPending\(\)\)return resolve\(\);[\s\S]*setTimeout\(done,6000\)/)
  })
})

describe('library first paint: boot.js preloads the shown book', () => {
  const source = read('lab/library_2/boot.js')
  function boot(options: { record?: unknown; user?: string | null; signedCookie?: boolean; view?: string } = {}) {
    const records = new Map<string, string>()
    const user = options.user === undefined ? 'reader-a' : options.user
    if (user) records.set('sb-test-auth-token', JSON.stringify({ user: { id: user } }))
    if (options.record !== undefined) records.set('tinct:library-2-first-paint', typeof options.record === 'string' ? options.record : JSON.stringify(options.record))
    const localStorage = { length: records.size, key: (i: number) => [...records.keys()][i], getItem: (key: string) => records.get(key) ?? null, setItem: vi.fn() }
    const appended: Array<Record<string, string>> = []
    const document = {
      cookie: options.signedCookie === false ? '' : 'tinct_auth=1',
      documentElement: { style: { visibility: '', setProperty: vi.fn() }, classList: { add: vi.fn() }, dataset: {} as Record<string, string> },
      head: { append: (el: Record<string, string>) => appended.push(el) }, createElement: () => ({}) as Record<string, string>,
    }
    const url = new URL('/library' + (options.view ? `?view=${options.view}` : ''), 'https://tinct.app')
    const window: Record<string, unknown> = {}
    runInNewContext(source, { window, location: { pathname: url.pathname, search: url.search, replace: vi.fn() }, localStorage, sessionStorage: { getItem: () => null, setItem: vi.fn() }, document, URLSearchParams, Date, innerWidth: 393, innerHeight: 734, fetch: vi.fn(async () => ({ ok: true, json: async () => ({}) })) })
    expect(localStorage.setItem).not.toHaveBeenCalled()
    return { appended, images: appended.filter(el => el.rel === 'preload' && el.as === 'image').map(el => el.href), document }
  }

  it('gives the pending hero the room\'s own colour under the painting (returning reader), never for a book link or the shelf', () => {
    const hour = new Date().getHours()
    const room = hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night'
    const colour = { morning: '#352619', afternoon: '#2d1e15', evening: '#2d1709', night: '#21150f' }[room]
    const set = (calls: unknown[][]) => calls.find(([name]) => name === '--initial-scene-colour')?.[1]
    expect(set(boot({ signedCookie: true }).document.documentElement.style.setProperty.mock.calls)).toBe(colour)
    expect(set(boot({ signedCookie: true, view: 'shelf' }).document.documentElement.style.setProperty.mock.calls)).toBeUndefined()
    expect(set(boot({ signedCookie: false, user: null }).document.documentElement.style.setProperty.mock.calls)).toBeUndefined()
  })
  const record = { v: 1, owner: 'reader-a', bookId: 'frankenstein', cover: '/lab/library_2/assets/frankenstein.jpg', spine: 'green' }

  it('fetches the shown book\'s cover and spine texture with the page for the same account', () => {
    const { images } = boot({ record })
    expect(images).toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(images).toContain('assets/spines/spine-green.jpg')
    // The scene is still preloaded first.
    expect(images[0]).toMatch(/^assets\/table-(morning|afternoon|evening|night)-phone\.jpg$/)
  })
  it('a paper spine or no spine preloads the cover alone', () => {
    const { images } = boot({ record: { ...record, spine: null } })
    expect(images).toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(images.some(href => href.includes('spine-'))).toBe(false)
  })
  it('never preloads another account\'s book, a signed-out device\'s record, or a malformed one', () => {
    expect(boot({ record: { ...record, owner: 'reader-b' } }).images).not.toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(boot({ record, user: null, signedCookie: false }).images).not.toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(boot({ record: '{broken' }).images).not.toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(boot({ record: { ...record, v: 3 } }).images).not.toContain('/lab/library_2/assets/frankenstein.jpg')
    expect(boot({ record: { ...record, cover: 'https://evil.example/x.jpg' } }).images.some(href => href.includes('evil'))).toBe(false)
    expect(boot({ record: { ...record, cover: 'data:image/jpeg;base64,AAAA' } }).images.some(href => href.startsWith('data:'))).toBe(false)
    expect(boot({ record: { ...record, spine: '../x' } }).images.some(href => href.includes('..'))).toBe(false)
  })
  it('the shelf study view keeps its own wall image and no desk preloads', () => {
    const { images } = boot({ record, view: 'shelf' })
    expect(images).toEqual(['shelf-study/library-wall.jpg'])
  })
  it('preloads the reading engine\'s bundles once the build has stamped them, after the engine itself', () => {
    const stamped = source.replace('/*__BRIDGE_DEPS__*/[]', '["/assets/labAuth-abc12345.js","/assets/cloud-def67890.js"]')
    const appended: Array<Record<string, string>> = []
    const localStorage = { length: 0, key: () => null, getItem: () => null, setItem: vi.fn() }
    runInNewContext(stamped, { window: {}, location: { pathname: '/library', search: '', replace: vi.fn() }, localStorage, sessionStorage: { getItem: () => null, setItem: vi.fn() },
      document: { cookie: 'tinct_auth=1', documentElement: { style: { visibility: '', setProperty: vi.fn() }, classList: { add: vi.fn() }, dataset: {} }, head: { append: (el: Record<string, string>) => appended.push(el) }, createElement: () => ({}) },
      URLSearchParams, Date, innerWidth: 393, innerHeight: 734, fetch: vi.fn(async () => ({ ok: true, json: async () => ({}) })) })
    const modules = appended.filter(el => el.rel === 'modulepreload').map(el => el.href)
    expect(modules[0]).toMatch(/^\/lab\/library-2-reading\.js\?v=/)
    expect(modules.slice(1)).toEqual(['/assets/labAuth-abc12345.js', '/assets/cloud-def67890.js'])
  })
  it('a first-time visitor gets no engine, no desk preloads', () => {
    const { appended } = boot({ user: null, signedCookie: false })
    expect(appended.some(el => el.rel === 'modulepreload')).toBe(false)
    expect(appended.filter(el => el.rel === 'preload' && el.as === 'image').map(el => el.href)).toEqual(['assets/room-sharp.jpg', 'assets/covers/frankenstein-960.webp'])
    expect(read('lab/library_2/initial-cover.js')).toContain('document.getElementById("hero-cover-preview").src="assets/covers/frankenstein-960.webp"')
  })
})

// ---- The first paint's desk (2026-10-10) ----
// @ts-expect-error -- plain browser module of the library page
import * as layoutModule from '../public/lab/library_2/table-layout.js'
// @ts-expect-error -- plain browser module of the library page
import { tableWindow, bookBox } from '../public/lab/library_2/table-window.js'
// @ts-expect-error -- plain browser module of the library page
import { heroTitleStep, HERO_TITLE_STEPS } from '../public/lab/library_2/hero-title.js'
// @ts-expect-error -- plain browser module of the library page
import { tableCrop } from '../public/lab/library_2/reading-room.js'
import { createRequire } from 'node:module'

/** boot.js in a bare context, its desk helpers only. */
function bootHelpers(): { layout: Record<string, any>; desk: { model: (...args: unknown[]) => any; markup: (model: unknown) => string } } {
  const source = readFileSync(new URL('../public/lab/library_2/boot.js', import.meta.url), 'utf8')
  const window: Record<string, any> = {}
  runInNewContext(source, { window, location: { pathname: '/library', search: '' }, localStorage: { length: 0, key: () => null, getItem: () => null, setItem: vi.fn() }, sessionStorage: { getItem: () => null, setItem: vi.fn() },
    document: { cookie: '', documentElement: { style: { visibility: '', setProperty: vi.fn() }, classList: { add: vi.fn() }, dataset: {} }, head: { append: vi.fn() }, createElement: () => ({}) }, URLSearchParams, Date, innerWidth: 393, innerHeight: 734, fetch: vi.fn(async () => ({ ok: true, json: async () => ({}) })), matchMedia: () => ({ matches: false }), navigator: { userAgent: '' } })
  return { layout: window.__library2Boot.layout, desk: window.__library2Boot.deskPlaceholder }
}
const storageOf = (entries: Record<string, unknown>) => ({ getItem: (key: string) => (key in entries ? JSON.stringify(entries[key]) : null) })

describe('library first paint: boot.js carries the table\'s own geometry (2026-10-10)', () => {
  // A small deterministic generator, so the comparison covers many tables, phones and desks alike.
  let seed = 7
  const rand = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647 }
  const { layout } = bootHelpers()
  it('tableWindow, bookBox, depthRatio, tableFit, tableLayout and bookStyle agree with table-window.js and table-layout.js on 400 random tables', () => {
    for (let n = 0; n < 400; n++) {
      const count = 1 + Math.floor(rand() * 12), current = Math.floor(rand() * count)
      const desk = rand() < 0.5, stageW = desk ? 500 + rand() * 900 : 250 + rand() * 300, stageH = 150 + rand() * 400
      const books = Array.from({ length: count }, () => ({ aspect: 0.4 + rand() * 0.8, depthRatio: layoutModule.depthRatio({ wordCount: Math.floor(rand() * 300000) }) }))
      const fit = layoutModule.tableFit(stageW, stageH, desk)
      expect(layout.tableFit(stageW, stageH, desk)).toEqual(fit)
      const turn = rand() < 0.5 ? 1 : -1, removable = rand() < 0.8
      const boxes = layoutModule.tableLayout({ H: fit.H, stageW, desk, books, current, turn, removable })
      expect(layout.tableLayout({ H: fit.H, stageW, desk, books, current, turn, removable })).toEqual(boxes)
      expect(boxes.map(layout.bookStyle)).toEqual(boxes.map(layoutModule.bookStyle))
      const costs = books.map(b => b.depthRatio * fit.H + 3)
      const room = rand() * 600
      expect(layout.tableWindow(costs, current, room, 8)).toEqual(tableWindow(costs, current, room, 8))
      expect(layout.bookBox(fit.H, books[0].aspect)).toEqual(bookBox(fit.H, books[0].aspect))
      expect(layout.depthRatio({ wordCount: n * 1000 })).toBe(layoutModule.depthRatio({ wordCount: n * 1000 }))
    }
    for (let room = 0; room < 1200; room += 37) {
      const costs = [40, 55, 30, 70, 25, 60, 45, 35, 50, 20]
      for (let current = 0; current < costs.length; current++) expect(layout.tableWindow(costs, current, room, 8)).toEqual(tableWindow(costs, current, room, 8))
    }
  })
  it('heroTitleStep and tableCrop agree with hero-title.js and reading-room.js', () => {
    expect(layout.HERO_TITLE_STEPS).toBe(HERO_TITLE_STEPS)
    for (const n of [0, 5, 24, 25, 40, 41, 62, 63, 90, 91, 200]) expect(layout.heroTitleStep('x'.repeat(n))).toBe(heroTitleStep('x'.repeat(n)))
    for (let n = 0; n < 100; n++) {
      const w = 300 + rand() * 1600, h = 400 + rand() * 800, wide = w / h > 1.2, iw = wide ? 1536 : 1024, ih = wide ? 1024 : 1536
      const edge = Math.max(h * .3, Math.min(h * .8, rand() * h))
      expect(layout.tableCrop(w, h, iw, ih, ih * (wide ? .64 : .51), edge)).toEqual(tableCrop(w, h, iw, ih, ih * (wide ? .64 : .51), edge))
    }
  })
  it('the table scenes have the sizes boot.js crops them by (phone 1024×1536, wide 1536×1024)', async () => {
    const sharp = createRequire(import.meta.url)('sharp') as (file: string) => { metadata: () => Promise<{ width?: number; height?: number }> }
    for (const room of ['morning', 'afternoon', 'evening', 'night']) {
      const phone = await sharp(new URL(`lab/library_2/assets/table-${room}-phone.jpg`, publicDir).pathname).metadata()
      const wide = await sharp(new URL(`lab/library_2/assets/table-${room}-wide.jpg`, publicDir).pathname).metadata()
      expect([phone.width, phone.height], room).toEqual([1024, 1536])
      expect([wide.width, wide.height], room).toEqual([1536, 1024])
    }
  })
})

describe('library first paint: the desk model is the table the device will paint first (2026-10-10)', () => {
  const { desk } = bootHelpers()
  const now = 1_800_000_000_000
  const art = { frankenstein: { t: 'Frankenstein', b: 'green', c: '#24472a', a: 0.6667, u: '/lab/library_2/assets/frankenstein.jpg' }, 'pride-and-prejudice': { t: 'Pride and Prejudice', b: 'oxblood', c: '#5a1c18', a: 0.6667, u: '/lab/library_2/assets/pride-and-prejudice.jpg' } }
  const record = { v: 2, owner: 'reader-a', bookId: 'frankenstein', cover: '/lab/library_2/assets/frankenstein.jpg', spine: 'green', hero: { w: 390, h: 700 }, art }
  const rows = [
    { bookId: 'frankenstein', title: 'Frankenstein', wordCount: 75000, percent: 42, recap: 'Victor returns.', chapterLabel: 'Letter 4', headline: 'You’re at the start of Letter 4' },
    { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', wordCount: 122000, percent: 3, recap: null, chapterLabel: 'Chapter 2', headline: 'You’re at the start of Chapter 2' },
  ]
  const cache = { 'tinct:library-2-table:reader-a': { mode: 'returning', reading: rows, finished: [] } }
  it('takes the rows and order of the device\'s table snapshot, the first book shown', () => {
    const model = desk.model(record, 'reader-a', storageOf(cache), storageOf({}), now)
    expect(model.hero).toEqual({ w: 390, h: 700 })
    expect(model.books.map((b: { bookId: string }) => b.bookId)).toEqual(['frankenstein', 'pride-and-prejudice'])
    expect(model.current).toBe(0)
    expect(model.books[0]).toMatchObject({ title: 'Frankenstein', spineTitle: 'Frankenstein', binding: 'green', colour: '#24472a', aspect: 0.6667, cover: '/lab/library_2/assets/frankenstein.jpg', spine: 'green', percent: 42, recap: 'Victor returns.', chapterLabel: 'Letter 4' })
  })
  it('the book just read leads, as libraryTwoReading.ts withJustRead leads it, with its new place and no stale recap', () => {
    const snapshot = { 'tinct:lab-library-boot': { v: 1, at: now - 1000, userId: 'reader-a', hero: { bookId: 'pride-and-prejudice', title: 'Pride and Prejudice', chapterLabel: 'Chapter 5', headline: 'You’re in the middle of Chapter 5', lastReadAt: now - 5000 } } }
    const model = desk.model(record, 'reader-a', storageOf({ ...cache, ...snapshot }), storageOf({}), now)
    expect(model.books.map((b: { bookId: string }) => b.bookId)).toEqual(['pride-and-prejudice', 'frankenstein'])
    expect(model.books[0]).toMatchObject({ chapterLabel: 'Chapter 5', headline: 'You’re in the middle of Chapter 5', percent: null, recap: '' })
    // An hour later it is just another row; another account's snapshot is not this reader's.
    expect(desk.model(record, 'reader-a', storageOf({ ...cache, 'tinct:lab-library-boot': { ...snapshot['tinct:lab-library-boot'], hero: { ...snapshot['tinct:lab-library-boot'].hero, lastReadAt: now - 2 * 60 * 60 * 1000 } } }), storageOf({}), now).books[0].bookId).toBe('frankenstein')
    expect(desk.model(record, 'reader-a', storageOf({ ...cache, 'tinct:lab-library-boot': { ...snapshot['tinct:lab-library-boot'], userId: 'reader-b' } }), storageOf({}), now).books[0].bookId).toBe('frankenstein')
    // A book just read that the snapshot does not know waits for the catalogue: no placeholder.
    expect(desk.model(record, 'reader-a', storageOf({ ...cache, 'tinct:lab-library-boot': { ...snapshot['tinct:lab-library-boot'], hero: { ...snapshot['tinct:lab-library-boot'].hero, bookId: 'odyssey' } } }), storageOf({}), now)).toBeNull()
  })
  it('the visit\'s chosen book stays in front within the session', () => {
    const visit = { 'tinct:library-2-visit': { mode: 'shelf', tableBook: 'pride-and-prejudice', at: now - 60_000 } }
    expect(desk.model(record, 'reader-a', storageOf(cache), storageOf(visit), now).current).toBe(1)
    expect(desk.model(record, 'reader-a', storageOf(cache), storageOf({ 'tinct:library-2-visit': { ...visit['tinct:library-2-visit'], at: now - 5 * 60 * 60 * 1000 } }), now).current).toBe(0)
  })
  it('draws nothing it cannot draw exactly: another account, a v1 record, a book without a record, an own book in front, a malformed cover', () => {
    expect(desk.model({ ...record, owner: 'reader-b' }, 'reader-a', storageOf(cache), storageOf({}), now)).toBeNull()
    expect(desk.model({ v: 1, owner: 'reader-a', bookId: 'frankenstein', cover: record.cover, spine: 'green' }, 'reader-a', storageOf(cache), storageOf({}), now)).toBeNull()
    expect(desk.model({ ...record, art: { frankenstein: art.frankenstein } }, 'reader-a', storageOf(cache), storageOf({}), now)).toBeNull()
    const ownFirst = { 'tinct:library-2-table:reader-a': { mode: 'returning', reading: [{ bookId: 'userbook-abc', title: 'My book', own: true, cover: null }, ...rows], finished: [] } }
    expect(desk.model({ ...record, art: { ...art, 'userbook-abc': { t: 'My book', b: 'paper', c: '#e6dfca', a: 0.6667, u: null } } }, 'reader-a', storageOf(ownFirst), storageOf({}), now)).toBeNull()
    expect(desk.model({ ...record, art: { ...art, frankenstein: { ...art.frankenstein, u: 'https://evil.example/x.jpg' } } }, 'reader-a', storageOf(cache), storageOf({}), now)).toBeNull()
    expect(desk.model({ ...record, art: { ...art, frankenstein: { ...art.frankenstein, b: '../x' } } }, 'reader-a', storageOf(cache), storageOf({}), now)).toBeNull()
    expect(desk.model(record, 'reader-a', storageOf({}), storageOf({}), now)).toBeNull()
  })
  it('the page paints the desk right after the hero is parsed, the placeholder leaves only after the table has arrived, and the hero keeps the room under the scene', () => {
    // An external script (the production CSP allows no inline script) right after the book overlay, before the
    // librarian and the rest of the page: the desk is painted as soon as the hero and the overlay are parsed.
    expect(html).toMatch(/<\/div><script src="initial-cover\.js\?v=\w+"><\/script>\n<button id="librarian"/)
    expect(html.indexOf('initial-cover.js')).toBeGreaterThan(html.indexOf('id="book-overlay"'))
    expect(html.indexOf('initial-cover.js')).toBeLessThan(html.indexOf('id="librarian"'))
    expect(read('lab/library_2/initial-cover.js')).toContain('window.__library2Boot?.desk?.paint(document.getElementById("hero"))')
    const table = read('lab/library_2/reading-table.js')
    expect(table).toMatch(/if\(other\.classList\.contains\(PLACEHOLDER_CLASS\)\)\{setTimeout\(\(\)=>other\.remove\(\),.*?\);continue;\}/)
    expect(read('lab/library_2/bookshelf.js')).toContain("t.classList.contains('is-placeholder')?t.remove():t.setAttribute('hidden','')")
    const css = read('lab/library_2/styles.css')
    expect(css).toContain('.reading-table.is-placeholder{pointer-events:none}')
    expect(css).toContain('.reading-table.is-ready .rt-remove{animation:table-arrive .24s ease-out backwards}')
    expect(css).toContain('html.library-ready #librarian{animation:orb-arrive .3s ease-out backwards}')
    const shelf = read('lab/library_2/bookshelf.css')
    expect(shelf).toContain('html.returning[data-returning-view=table] #hero{background:var(--initial-scene-colour,#10150f) var(--initial-scene) var(--initial-scene-position,center)/var(--initial-scene-size,cover) no-repeat}')
    expect(shelf).toContain('html.returning-pending[data-returning-view=table] #library #shelves{margin:25px 0 0;padding-top:0}')
    // The scene crop reads whichever stage stands, the placeholder's or the table's.
    expect(read('lab/library_2/app.js')).toContain("const stage=document.querySelector('.rt-stage'),hero=$('hero')")
  })
})
