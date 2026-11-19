import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import worker from './worker'
import { BOOKS } from './data/bookRegistry'
import manifest from './data/chapterPages.generated.json'
import notes from './data/editionNotes.generated.json'
import { SEO_INDEX_ALLOWLIST } from './data/seoIndexAllowlist'
import { chapterPageMarker, renderChapterPages, renderShelfHubs } from './seo/chapterPages'

// Chapter pages and shelf hubs (Anders, 16 Nov 2026): /read/{bookId}/chapter-N and /read/shelf/{shelf}, served
// as static HTML to everyone. The packs are rendered here from the editions, as the build writes them.
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
type Entry = { chapters: number; packs: number[]; indexable: boolean; original: string | null }
const books = manifest.books as Record<string, Entry>
const edition = (id: string, key: string) => JSON.parse(readFileSync(`public/data/editions/${id}-${key}.json`, 'utf8'))

/** The packs of a book as build-chapter-pages.mjs writes them: pages after their markers, split at the manifest's starts. */
function packsOf(id: string): Map<string, string> {
  const book = BOOKS.find(entry => entry.id === id)!
  const entry = books[id]
  const pages = renderChapterPages({
    book, modern: edition(id, 'modern-en'), original: entry.original ? edition(id, entry.original) : null, originalKey: entry.original,
    note: (notes.books as Record<string, string>)[id] ?? null, indexable: entry.indexable,
  })
  const packs = new Map<string, string>()
  entry.packs.forEach((start, index) => {
    const end = entry.packs[index + 1] ?? Infinity
    packs.set(`/seo/chapter-packs/${id}/${index}.txt`, pages.filter(page => page.chapterNumber >= start && page.chapterNumber < end).map(page => `${chapterPageMarker(page.chapterNumber)}\n${page.html}`).join(''))
  })
  return packs
}
const packs = new Map([...packsOf('moby-dick'), ...packsOf('odyssey')])
const hubs = renderShelfHubs({
  books: [{ id: 'crime-and-punishment', title: 'Crime and Punishment', modern: true, cover: null }, { id: 'meditations', title: 'Meditations', modern: true, cover: null }],
  indexableBooks: new Set(['crime-and-punishment']),
})
const library = readFileSync('public/lab/library_2/index.html', 'utf8')

const env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const url = new URL(request.url)
      const html = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      if (packs.has(url.pathname)) return new Response(packs.get(url.pathname)!, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      const hub = url.pathname.match(/^\/read\/shelf\/([a-z-]+)$/)?.[1]
      if (hub && hubs.some(entry => entry.shelfId === hub)) return html(hubs.find(entry => entry.shelfId === hub)!.html)
      const bookPage = url.pathname.match(/^\/read\/([a-z0-9-]+)\/book$/)?.[1]
      if (bookPage && existsSync(`public/read/${bookPage}/book.html`)) return html(readFileSync(`public/read/${bookPage}/book.html`, 'utf8'))
      if (url.pathname === '/lab/library_2/') return html(library)
      if (url.pathname === '/404.html') return html('<title>Page not found — Tinct</title>')
      return new Response('Not found', { status: 404 })
    },
  },
}
const ctx = { waitUntil: () => undefined } as unknown as Parameters<typeof worker.fetch>[2]
const get = (path: string, headers: Record<string, string> = { 'User-Agent': GOOGLEBOT }) => worker.fetch(new Request(`https://tinct.app${path}`, { headers }), env as never, ctx)
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')

describe('chapter pages', () => {
  it('serve an allowlisted book\'s chapter to Googlebot: 200, both texts as HTML, self-canonical, no noindex', async () => {
    const resp = await get('/read/moby-dick/chapter-1')
    expect(resp.status).toBe(200)
    expect(resp.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(resp.headers.get('X-Robots-Tag')).toBeNull()
    expect(resp.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    const html = await resp.text()
    expect(html).not.toMatch(/name="robots"/)
    expect(html).toContain('<title>Moby Dick, Chapter 1: full text in modern English | Tinct</title>')
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/read/moby-dick/chapter-1">')
    expect(text(html)).toContain('Call me Ishmael. Some years ago — never mind exactly how long')
    expect(text(html)).toContain('Call me Ishmael. Some years ago—never mind how long precisely')
    expect(html).toContain('<meta property="og:image" content="https://tinct.app/brand/20260921/books/moby-dick.jpg">')
    expect(html.match(/<!--tinct:chapter-page/g)).toBeNull()
  })

  it('serve the last chapter of a pack and of the book', async () => {
    for (const chapter of [13, 14, 136]) {
      const resp = await get(`/read/moby-dick/chapter-${chapter}`)
      expect(resp.status, String(chapter)).toBe(200)
      expect(await resp.text()).toContain(`<link rel="canonical" href="https://tinct.app/read/moby-dick/chapter-${chapter}">`)
    }
  })

  it('serve another book\'s chapter live, but noindex, follow (header and meta tag)', async () => {
    const resp = await get('/read/odyssey/chapter-1')
    expect(resp.status).toBe(200)
    expect(resp.headers.get('X-Robots-Tag')).toBe('noindex, follow')
    const html = await resp.text()
    expect(html).toContain('<meta name="robots" content="noindex, follow">')
    expect(text(html)).toContain('Tell me, Muse, of that clever hero')
  })

  it('are the same page signed in', async () => {
    const out = await (await get('/read/moby-dick/chapter-2')).text()
    expect(await (await get('/read/moby-dick/chapter-2', { Cookie: 'tinct_auth=1' })).text()).toBe(out)
  })

  it('answer 404 for a chapter the book does not have', async () => {
    for (const path of ['/read/moby-dick/chapter-137', '/read/moby-dick/chapter-0', '/read/moby-dick/chapter-99999', '/read/odyssey/chapter-25']) {
      const resp = await get(path)
      expect(resp.status, path).toBe(404)
      expect(resp.headers.get('X-Robots-Tag'), path).toBe('noindex, noarchive')
    }
  })

  it.each(['/read/moby-dick/chapter-1/', '/read/moby-dick/chapter-1.html', '/read/Moby-Dick/Chapter-1', '/read/moby-dick/chapter-01'])('send %s to the one address', async path => {
    const resp = await get(`${path}?utm_source=test&gclid=x`)
    expect(resp.status).toBe(301)
    expect(resp.headers.get('Location')).toBe('/read/moby-dick/chapter-1?utm_source=test&gclid=x')
  })

  it('never serve a pack to a visitor', async () => {
    const resp = await get('/seo/chapter-packs/moby-dick/0.txt')
    expect(resp.status).toBe(404)
  })

  it('leave the plays and books without chapter pages as they were', async () => {
    for (const [path, target] of [['/read/hamlet/chapter-8', '/read/hamlet/act-3-scene-1'], ['/read/king-lear/chapter-2', '/read/king-lear'], ['/read/bible-genesis/chapter-1', '/read/bible']]) {
      const resp = await get(path)
      expect(resp.status, path).toBe(301)
      expect(resp.headers.get('Location'), path).toBe(target)
    }
  })
})

describe('book pages', () => {
  it('show the edition note, the first paragraph in both versions and every chapter\'s page, without scripts', async () => {
    const resp = await get('/read/moby-dick')
    expect(resp.status).toBe(200)
    const html = await resp.text()
    const about = html.slice(html.indexOf('<section id="book-about"'))
    expect(about).toContain("<strong>How this edition was made.</strong> Tinct's modern English is drafted with AI from Herman Melville's original text, then checked by a separate AI review against it. The original is always beside it, and if you spot a mistake, tell us.")
    expect(about).toContain('<p class="opening-label">Modern English</p>')
    expect(about).toContain('<p class="opening-label">Original (1851)</p>')
    expect(text(about)).toContain('Call me Ishmael. Some years ago — never mind exactly how long')
    expect(text(about)).toContain('Call me Ishmael. Some years ago—never mind how long precisely')
    for (let chapter = 1; chapter <= 136; chapter += 1) expect(about).toContain(`<a href="/read/moby-dick/chapter-${chapter}">`)
    expect(about).toContain('id="chapters"')
  })
})

describe('shelf hubs', () => {
  it('serve a hub that lists an allowlisted book as indexable, another as noindex, follow, and 404 for no shelf', async () => {
    const indexable = await get('/read/shelf/russian-novels')
    expect(indexable.status).toBe(200)
    expect(indexable.headers.get('X-Robots-Tag')).toBeNull()
    expect(await indexable.text()).toContain('<h1>The Russians in modern English</h1>')
    const other = await get('/read/shelf/stoics')
    expect(other.status).toBe(200)
    expect(other.headers.get('X-Robots-Tag')).toBe('noindex, follow')
    expect((await get('/read/shelf/no-such-shelf')).status).toBe(404)
    expect((await get('/read/shelf/russian-novels/')).headers.get('Location')).toBe('/read/shelf/russian-novels')
  })
})

describe('the sitemap', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])

  it('lists chapter pages only for the allowlisted books with a known source, every chapter of each', () => {
    const chapterLocs = locs.filter(loc => /\/chapter-\d+$/.test(loc))
    const listed = new Set(chapterLocs.map(loc => loc.match(/\/read\/([a-z0-9-]+)\/chapter-/)![1]))
    const indexable = Object.entries(books).filter(([, entry]) => entry.indexable).map(([id]) => id)
    expect([...listed].sort()).toEqual(indexable.sort())
    expect(indexable.every(id => SEO_INDEX_ALLOWLIST.includes(id))).toBe(true)
    expect(listed.size).toBe(14)
    expect(listed.has('ivan-ilyich')).toBe(false)
    expect(listed.has('odyssey')).toBe(false)
    for (const id of indexable) expect(chapterLocs.filter(loc => loc.includes(`/read/${id}/chapter-`)), id).toHaveLength(books[id].chapters)
  })

  it('lists only the indexable shelf hubs', () => {
    const hubLocs = locs.filter(loc => loc.includes('/read/shelf/')).map(loc => loc.split('/').pop())
    expect(hubLocs.sort()).toEqual(Object.entries(manifest.hubs as Record<string, boolean>).filter(([, indexable]) => indexable).map(([id]) => id).sort())
  })
})
