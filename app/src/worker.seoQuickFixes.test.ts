import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from './worker'
import { GENERATED_BOOK_META } from './data/bookMetaGenerated'

// SEO quick fixes (Anders, 16 Nov 2026): crawlable /lab scripts and styles, the right author portrait, the
// Odyssey's title, Gutenberg underscores as <em>, and Related books on every book page.

const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const robots = readFileSync('public/robots.txt', 'utf8')
const library = readFileSync('public/lab/library_2/index.html', 'utf8')
const bookIds = readdirSync('public/read').filter(id => existsSync(`public/read/${id}/book.html`))
const bookPage = (id: string) => readFileSync(`public/read/${id}/book.html`, 'utf8')
const about = (html: string) => html.slice(html.indexOf('<!--tinct:about-->'), html.indexOf('<!--/tinct:about-->'))

const env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const url = new URL(request.url)
      const html = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      const book = url.pathname.match(/^\/read\/([a-z0-9-]+)\/book$/)?.[1]
      if (book && existsSync(`public/read/${book}/book.html`)) return html(bookPage(book))
      if (url.pathname === '/lab/library_2/') return html(library)
      if (url.pathname === '/lab/design-system.html') return html(readFileSync('public/lab/design-system.html', 'utf8'))
      if (url.pathname === '/lab/display-profile.js') return new Response('export {}', { headers: { 'Content-Type': 'text/javascript' } })
      if (url.pathname === '/lab/tinct-ui.css') return new Response(':root{}', { headers: { 'Content-Type': 'text/css' } })
      if (url.pathname === '/404.html') return html('<title>Page not found — Tinct</title>')
      return new Response('Not found', { status: 404 })
    },
  },
}
const ctx = { waitUntil: () => undefined } as unknown as Parameters<typeof worker.fetch>[2]
const get = (path: string) => worker.fetch(new Request(`https://tinct.app${path}`, { headers: { 'User-Agent': GOOGLEBOT } }), env as never, ctx)

/** Google's robots.txt rule for one path in the `User-agent: *` group: the longest matching rule wins, Allow on a tie. */
function googleAllows(path: string): boolean {
  const group = robots.split(/\n(?=User-agent:)/)[0]
  const rules = [...group.matchAll(/^(Allow|Disallow):\s*(\S*)\s*$/gm)].map(([, kind, pattern]) => ({ allow: kind === 'Allow', pattern }))
  const matches = rules.filter(rule => rule.pattern && new RegExp(`^${rule.pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}`).test(path))
  if (!matches.length) return true
  matches.sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow))
  return matches[0].allow
}

describe('robots.txt and /lab', () => {
  it('lets crawlers fetch the /lab scripts and styles every book page loads, and nothing else under /lab', () => {
    const composed = library.match(/(?:src|href)="(\/lab\/[^"]+\.(?:js|css)(?:\?[^"]*)?)"/g)!.map(attr => attr.replace(/^(?:src|href)="|"$/g, ''))
    expect(composed.length).toBeGreaterThan(5)
    for (const asset of [...composed, '/lab/display-profile.js', '/lab/library_2/app.js?v=1', '/lab/tinct-ui.css?v=1']) expect(googleAllows(asset), asset).toBe(true)
    for (const page of ['/lab', '/lab/', '/lab/design-system.html', '/lab/addbook/', '/lab/library_2/']) expect(googleAllows(page), page).toBe(false)
    expect(googleAllows('/read/moby-dick')).toBe(true)
    expect(googleAllows('/data/editions/moby-dick-modern-en.json')).toBe(false)
  })

  it('answers a /lab HTML page with noindex, but not its scripts and styles', async () => {
    const page = await get('/lab/design-system.html')
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toBe('noindex, noarchive')
    for (const asset of ['/lab/display-profile.js', '/lab/tinct-ui.css']) {
      const resp = await get(asset)
      expect(resp.status, asset).toBe(200)
      expect(resp.headers.get('X-Robots-Tag'), asset).toBeNull()
    }
  })
})

describe('book pages', () => {
  it('give the flap this book\'s author, or no portrait, never a relative Mary Shelley', async () => {
    const moby = await (await get('/read/moby-dick')).text()
    expect(moby).toContain('<img id="slip-portrait" src="/lab/library_2/assets/author-flaps/herman-melville.jpg" alt="Herman Melville, historical portrait">')
    const frankenstein = await (await get('/read/frankenstein')).text()
    expect(frankenstein).toContain('<img id="slip-portrait" src="/lab/library_2/assets/author-flaps/mary-shelley.jpg"')
    const unlisted = bookIds.find(id => !/"portrait":\{/.test(bookPage(id)))!
    expect(unlisted).toBeTruthy()
    const none = await (await get(`/read/${unlisted}`)).text()
    expect(none).not.toContain('id="slip-portrait"')
    for (const id of ['moby-dick', 'odyssey', unlisted]) {
      expect(await (await get(`/read/${id}`)).text(), id).not.toContain('assets/mary-shelley-portrait.jpg')
    }
  })

  it('title the Odyssey like every other book, with no audio or AI promise', async () => {
    expect(GENERATED_BOOK_META.odyssey.title).toBe('The Odyssey in modern English, free to read | Tinct')
    const html = await (await get('/read/odyssey')).text()
    expect(html).toContain('<title>The Odyssey in modern English, free to read | Tinct</title>')
    const description = html.match(/<meta name="description" content="([^"]*)"/)![1]
    expect(description).not.toMatch(/audio|AI|companion|narrat/i)
    expect(html).not.toMatch(/Modern Translation, AI Companion, Audiobook/)
  })

  it('set Gutenberg _underscores_ as emphasis on every book page', () => {
    for (const id of bookIds) expect(about(bookPage(id)), id).not.toMatch(/(^|[\s>(“"‘'])_[^_\s<][^_<]*_(?=$|[\s<.,;:!?)”"’'])/)
    expect(about(bookPage('pride-and-prejudice'))).toMatch(/<em>[^<]+<\/em>/)
  })

  it('list four to six related books: the same author first, then the same shelf', () => {
    for (const id of bookIds) {
      const block = bookPage(id).match(/<section class="glance-section related-books" aria-label="Related books">([\s\S]*?)<\/section>/)?.[1]
      expect(block, id).toBeTruthy()
      const links = [...block!.matchAll(/<a href="\/read\/([a-z0-9-]+)">/g)].map(match => match[1])
      expect(links.length, id).toBeGreaterThanOrEqual(4)
      expect(links.length, id).toBeLessThanOrEqual(6)
      expect(links, id).not.toContain(id)
      for (const link of links) expect(existsSync(`public/read/${link}/book.html`), `${id} -> ${link}`).toBe(true)
      // Plain links: the title, nothing written for the block.
      expect(block!.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().startsWith('Related books ')).toBe(true)
    }
    const crime = bookPage('crime-and-punishment').match(/aria-label="Related books">([\s\S]*?)<\/section>/)![1]
    const crimeLinks = [...crime.matchAll(/href="\/read\/([a-z0-9-]+)"/g)].map(match => match[1])
    expect(crimeLinks.slice(0, 2).sort()).toEqual(['brothers-karamazov', 'notes-from-underground'])
    expect(crimeLinks.slice(2).every(link => GENERATED_BOOK_META[link]?.author !== 'Fyodor Dostoevsky')).toBe(true)
  })
})
