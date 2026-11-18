import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import { SEO_INDEX_ALLOWLIST } from './data/seoIndexAllowlist'
import { chapterPageEntry } from './worker/lib/chapterPages'
import { contentBookIdForPath, linksRestrictableBook, regionRefusalPage, withoutRestrictedCards } from './worker/lib/regionGate'

// Step 2 (Anders approved mockups a and b, 17 Nov 2026): the direct-link message, the chapter
// pages and packs, the library's book links, and public pages that link the book.
const BOOK = 'master-and-margarita'
const ctx = { waitUntil: vi.fn(), passThroughOnException() {} } as unknown as ExecutionContext
const request = (path: string, country: string | null) => new Request('https://tinct.app' + path, { headers: country ? { 'CF-IPCountry': country } : {} })

const LD = `{"@context":"https://schema.org","@type":"CollectionPage","hasPart":[{"@type":"Book","name":"Anna Karenina","url":"https://tinct.app/read/anna-karenina"},{"@type":"Book","name":"The Master and Margarita","url":"https://tinct.app/read/${BOOK}"},{"@type":"Book","name":"Crime and Punishment","url":"https://tinct.app/read/crime-and-punishment"}]}`
const HUB = `<!doctype html><html><head><title>The Russians</title><script type="application/ld+json">${LD}</script></head><body><ul class="shelf">`
  + '<li class="book"><a href="/read/crime-and-punishment"><span class="tui-book-title">Crime and Punishment</span></a></li>'
  + `<li class="book"><a href="/read/${BOOK}"><img src="/covers/v2/${BOOK}.webp" alt=""><span class="tui-book-title">The Master and Margarita</span></a></li>`
  + '<li class="book"><a href="/read/anna-karenina"><span class="tui-book-title">Anna Karenina</span></a></li>'
  + '</ul></body></html>'

function env(html = HUB) {
  const assets = vi.fn(async (req: Request) => {
    const path = new URL(req.url).pathname
    if (path === '/read/shelf/russian-novels' || path === '/read/anna-karenina/book' || path === '/read/') return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    return new Response('Not found', { status: 404 })
  })
  return { ASSETS: { fetch: assets }, assets }
}
afterEach(() => vi.restoreAllMocks())

describe('the direct-link message (mockup b)', () => {
  it('names the book with its cover and offers the library, in the design system, never naming the country', async () => {
    const response = regionRefusalPage(request(`/read/${BOOK}`, 'US'), BOOK)
    expect(response.status).toBe(451)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const html = await response.text()
    expect(html).toContain('<h1 id="unavailable-title">This book isn’t available in your country.</h1>')
    expect(html).toContain('<p class="book">The Master and Margarita · Mikhail Bulgakov</p>')
    expect(html).toContain(`<img src="/covers/v2/${BOOK}.webp" alt=""`)
    expect(html).toContain('<a class="tui-btn tui-btn--primary" href="/library">Browse the library</a>')
    expect(html).toContain('/lab/tinct-ui.css?v=')
    expect(html).toContain('/fonts/tinct-fonts.css')
    expect(html).toContain('@media (prefers-color-scheme: dark)')
    // Two families: Playfair Display (title) and the system UI face; no mono, no EB Garamond chrome.
    expect(html).toContain('font-family:var(--tui-font-display)')
    expect(html).toContain('font-family:var(--tui-font-ui)')
    expect(html).not.toMatch(/font-serif|monospace|Plex Mono/)
    expect(html).not.toMatch(/\bUS\b|United States|Russia\b/)
    // No script: the page stays inside the strict CSP.
    expect(html).not.toContain('<script')
  })
  it('without a known book it still answers, with no book line', async () => {
    const html = await regionRefusalPage(request('/q/x', 'US')).text()
    expect(html).toContain('This book isn’t available in your country.')
    expect(html).not.toContain('class="book"')
  })
  for (const path of [`/read/${BOOK}`, `/read/${BOOK}/chapter-12`, `/reader?book=${BOOK}`, `/library?book=${BOOK}`, `/library?book=${BOOK}&view=book-detail`, `/?book=${BOOK}`]) {
    for (const country of ['US', 'RU']) {
      it(`${country}: ${path} shows the message`, async () => {
        const response = await worker.fetch(request(path, country), env() as never, ctx)
        expect(response.status).toBe(451)
        expect(await response.text()).toContain('The Master and Margarita · Mikhail Bulgakov')
      })
    }
  }
  it('DK and a missing country: the library link is the library, not the message', async () => {
    for (const country of ['DK', null]) {
      const response = await worker.fetch(request(`/library?book=${BOOK}`, country), env() as never, ctx)
      expect(response.status).not.toBe(451)
    }
  })
})

describe('chapter pages (main, 16 Nov 2026)', () => {
  it('the book has chapter pages, kept out of the index allowlist', () => {
    expect(chapterPageEntry(BOOK, 12)).not.toBeNull()
    expect(chapterPageEntry(BOOK, 12)?.indexable).toBe(false)
    expect(SEO_INDEX_ALLOWLIST).not.toContain(BOOK)
  })
  it('every chapter page and pack slice is the book’s content', () => {
    for (let chapter = 1; chapter <= 33; chapter += 1) expect(contentBookIdForPath(`/read/${BOOK}/chapter-${chapter}`)).toBe(BOOK)
    expect(contentBookIdForPath(`/seo/chapter-packs/${BOOK}/3.txt`)).toBe(BOOK)
    expect(contentBookIdForPath('/seo/chapter-packs/anna-karenina/3.txt')).toBe('anna-karenina')
  })
  for (const country of ['US', 'RU']) {
    it(`${country}: a chapter page, its .html and slash forms, and a pack slice are refused without reading the pack`, async () => {
      for (const path of [`/read/${BOOK}/chapter-3`, `/read/${BOOK}/chapter-3.html`, `/read/${BOOK}/chapter-3/`, `/read/${BOOK}/chapter-999`, `/seo/chapter-packs/${BOOK}/0.txt`]) {
        const { ASSETS, assets } = env()
        const response = await worker.fetch(request(path, country), { ASSETS } as never, ctx)
        expect(response.status, path).toBe(451)
        expect(assets).not.toHaveBeenCalled()
      }
    })
  }
})

describe('public pages that link the book (shelf hubs, the /read hub, other books’ pages)', () => {
  it('finds a card that links the book, and only that card', () => {
    expect(linksRestrictableBook(HUB)).toBe(true)
    expect(linksRestrictableBook(HUB.replace(new RegExp(BOOK, 'g'), 'odyssey'))).toBe(false)
    const out = withoutRestrictedCards(HUB, new Set([BOOK]))
    expect(out).not.toContain(BOOK)
    expect(out).toContain('Crime and Punishment')
    expect(out).toContain('Anna Karenina')
    const data = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
    expect(data.hasPart.map((part: { name: string }) => part.name)).toEqual(['Anna Karenina', 'Crime and Punishment'])
    // The first and the last entry go cleanly too.
    for (const id of ['anna-karenina', 'crime-and-punishment']) expect(() => JSON.parse(withoutRestrictedCards(LD, new Set([id])))).not.toThrow()
    expect(withoutRestrictedCards(HUB, new Set())).toBe(HUB)
  })
  for (const country of ['US', 'RU']) {
    it(`${country}: the shelf hub leaves the book out, kept private to the country`, async () => {
      const response = await worker.fetch(request('/read/shelf/russian-novels', country), env() as never, ctx)
      expect(response.status).toBe(200)
      const html = await response.text()
      expect(html).not.toContain(`/read/${BOOK}`)
      expect(html).toContain('Anna Karenina')
      expect(response.headers.get('Cache-Control')).toMatch(/^private/)
      expect(response.headers.get('Vary')).toContain('CF-IPCountry')
    })
  }
  for (const country of ['DK', 'GB', null]) {
    it(`${country ?? 'missing'}: the shelf hub lists the book, still private and varying by country`, async () => {
      const response = await worker.fetch(request('/read/shelf/russian-novels', country), env() as never, ctx)
      expect(response.status).toBe(200)
      expect(await response.text()).toContain(`/read/${BOOK}`)
      expect(response.headers.get('Cache-Control')).toMatch(/^private/)
      expect(response.headers.get('Vary')).toContain('CF-IPCountry')
    })
  }
  it('a page that does not link the book keeps its public cache', async () => {
    const plain = HUB.replace(new RegExp(BOOK, 'g'), 'odyssey')
    const response = await worker.fetch(request('/read/shelf/russian-novels', 'US'), env(plain) as never, ctx)
    expect(response.headers.get('Cache-Control')).toMatch(/^public/)
    expect(await response.text()).toBe(await (await worker.fetch(request('/read/shelf/russian-novels', 'DK'), env(plain) as never, ctx)).text())
  })
})
