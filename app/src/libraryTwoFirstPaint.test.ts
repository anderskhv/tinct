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
    expect(css).toContain('html.returning-scene-pending[data-returning-view=table] #hero{background:#10150f var(--initial-scene) center/cover}')
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
    expect(boot({ record: { ...record, v: 2 } }).images).not.toContain('/lab/library_2/assets/frankenstein.jpg')
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
    expect(appended.filter(el => el.rel === 'preload' && el.as === 'image').map(el => el.href)).toEqual(['assets/room-sharp.jpg', 'assets/frankenstein.jpg'])
  })
})
