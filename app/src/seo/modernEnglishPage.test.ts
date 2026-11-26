import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { danishTitlesFor } from '../data/danishTitles'
import { OFFERED_DANISH_EDITIONS } from '../data/editionAvailability'
import { handleSeoAndStaticRequest } from '../worker/routes/seo'
import type { Book } from '../types'
import {
  DANISH_SHELVES,
  danishAuthor,
  freeReaderHref,
  hasLiveModernEnglish,
  modernEnglishBooks,
  modernEnglishShelves,
  modernEnglishSource,
  nudanskBooks,
  renderModernEnglishPage,
} from './modernEnglishPage'

// The modern-English page (docs/modern-english/BUILD-BRIEF.md): built from the registry, listed since 23 Nov 2026, selling nothing.
const ASSETS = { css: '/lab/modern-english/modern-english.css?v=1', js: '/lab/modern-english/modern-english.js?v=1' }

const book = (over: Partial<Book>): Book => ({
  id: 'test-book', title: 'Test', author: 'Someone',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Translator (1900)', translator: 'A. Translator', year: 1900 },
    { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern English' },
  ],
  ...over,
} as Book)

describe('the book list comes from the registry', () => {
  it('lists every book whose Modern English is live, and only those', () => {
    const listed = new Set(modernEnglishBooks().map(entry => entry.id))
    expect(listed.size).toBeGreaterThan(100)
    for (const entry of BOOKS) expect(listed.has(entry.id), entry.id).toBe(hasLiveModernEnglish(entry))
    // A whole-book hold (Symposium), a withheld modern-en (the Bible) and a book with no Modern English are out.
    expect(listed.has('symposium')).toBe(false)
    expect(listed.has('bible')).toBe(false)
    expect(listed.has('the-sovereign-child')).toBe(false)
    expect(listed.has('meditations')).toBe(true)
  })

  it('leaves out a local-only book, a held edition and a book with no modern-en edition', () => {
    expect(hasLiveModernEnglish(book({}))).toBe(true)
    expect(hasLiveModernEnglish(book({ localOnly: true }))).toBe(false)
    expect(hasLiveModernEnglish(book({ noModernEdition: true }))).toBe(false)
    expect(hasLiveModernEnglish(book({ editions: [book({}).editions[0]] }))).toBe(false)
    expect(hasLiveModernEnglish(book({ id: 'symposium' }))).toBe(false)
  })

  it('names the source from the original-en edition: translator and year, else the original', () => {
    expect(modernEnglishSource(getBook('meditations')!)).toBe('from George Long, 1862')
    expect(modernEnglishSource(getBook('crime-and-punishment')!)).toBe('from Constance Garnett, 1914')
    expect(modernEnglishSource(getBook('pride-and-prejudice')!)).toBe('from the original')
    expect(modernEnglishSource(book({}))).toBe('from A. Translator, 1900')
    expect(modernEnglishSource(book({ editions: [{ ...book({}).editions[0], year: undefined }, book({}).editions[1]] }))).toBe('from A. Translator')
  })

  it('shelves the books in the library house order, each by date', () => {
    const shelves = modernEnglishShelves(modernEnglishBooks())
    expect(shelves.map(shelf => shelf.house).slice(0, 4)).toEqual(['philosophy', 'politics', 'drama', 'novel'])
    for (const shelf of shelves) expect(shelf.books.map(entry => entry.ySort)).toEqual([...shelf.books.map(entry => entry.ySort)].sort((a, b) => a - b))
  })
})

describe('the page', () => {
  const html = renderModernEnglishPage(ASSETS)

  it('opens every book in the free reading mode, in Modern English', () => {
    expect(freeReaderHref('meditations')).toBe('/reader?book=meditations&mode=free&ref=modern-english')
    const links = [...html.matchAll(/href="(\/reader[^"]*)"/g)].map(match => match[1].replace(/&amp;/g, '&'))
    expect(links.length).toBeGreaterThan(100)
    for (const link of links) expect(link).toMatch(/^\/reader\?book=[a-z0-9-]+&mode=free&ref=modern-english$/)
  })

  it('is indexable with its canonical, has no top bar, sells nothing and links nothing unlisted', () => {
    // Listed on 23 Nov 2026 (Anders): no robots meta, and the canonical names the page.
    expect(html).not.toMatch(/<meta name="robots"/)
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/modern-english">')
    expect(html).toContain('<h1>100+ classics in modern translation. Free.</h1>')
    expect(html).toContain('A way in, not a scholarly translation. Free to read, in both versions.')
    expect(html).not.toMatch(/sign-in|Sign in|Premium|Subscribe|\$\d/)
    expect(html).not.toMatch(/href="\/try\b/)
    expect(html).not.toContain('<header')
    // The one brand mark (Anders, 23 Nov): a wordmark to the library, and no account prompt.
    expect(html).toContain('<a class="me-wordmark" href="/library" aria-label="Tinct library">Tinct.</a>')
    expect(html).not.toMatch(/Create account/i)
  })

  it('names the author on every card, under the title, and keeps the source line below it', () => {
    // Anders, 26 Nov 2026: the cards showed only the source, so Plato's dialogues all read "Jowett".
    const cards = [...html.matchAll(/<li class="me-card"[^>]*>(.*?)<\/li>/g)].map(match => match[1])
    expect(cards).toHaveLength(modernEnglishBooks().length)
    for (const card of cards) expect(card).toMatch(/<span class="me-card-title">[^<]+<\/span><span class="me-card-author">[^<]+<\/span><span class="me-card-source">from [^<]+<\/span>/)
    const meditations = getBook('meditations')!
    expect(html).toContain(`<span class="me-card-title">${meditations.title}</span><span class="me-card-author">${meditations.author}</span><span class="me-card-source">from George Long, 1862</span>`)
    const jowett = modernEnglishBooks().filter(entry => entry.source.includes('Jowett'))
    expect(jowett.length).toBeGreaterThan(0)
    for (const entry of jowett) expect(entry.author).not.toMatch(/Jowett/)
    expect(html).toContain(`<span class="me-card-author">${jowett[0].author}</span><span class="me-card-source">${jowett[0].source}</span>`)
  })

  it('has one pill per category and period, each a toggle', () => {
    expect(html.match(/data-kind="house"/g)).toHaveLength(5)
    expect(html.match(/data-kind="era"/g)).toHaveLength(6)
  })

  it('is served indexable by the Worker and is in the sitemap and llms.txt', async () => {
    const env = { ASSETS: { fetch: async (request: Request) => new URL(request.url).pathname === '/modern-english'
      ? new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      : new Response('nf', { status: 404 }) } }
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const get = (path: string, cookie?: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${path}`, cookie ? { headers: { Cookie: cookie } } : undefined), env as never, ctx)
    const page = await get('/modern-english')
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toBeNull()
    // Signed-in readers may see it.
    expect((await get('/modern-english', 'tinct_auth=1')).status).toBe(200)
    for (const path of ['/modern-english.html', '/modern-english/']) {
      const moved = await get(path)
      expect(moved.status).toBe(301)
      expect(moved.headers.get('Location')).toBe('/modern-english')
    }
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://tinct.app/modern-english</loc>')
    expect(readFileSync('public/llms.txt', 'utf8')).toContain('https://tinct.app/modern-english')
    // robots.txt neither names nor blocks it.
    expect(readFileSync('public/robots.txt', 'utf8')).not.toContain('modern-english')
  })
})

// The Danish sibling at /nudansk (Anders, 26 Nov 2026: "release the danish page too and add it to the sitemap").
describe('the Danish page', () => {
  const list = nudanskBooks()
  const html = renderModernEnglishPage(ASSETS, list, 'da')

  it('lists exactly the books offered in modern Danish', () => {
    const offered = [...OFFERED_DANISH_EDITIONS].filter(identity => identity.endsWith('/modern-da')).map(identity => identity.split('/')[0])
    expect(list.map(entry => entry.id).sort()).toEqual([...offered].sort())
    expect(list.length).toBe(OFFERED_DANISH_EDITIONS.size)
    expect(renderModernEnglishPage(ASSETS, undefined, 'da')).toBe(html)
  })

  it('uses the Danish title on file, else the English one, never an invented title', () => {
    for (const entry of list) expect(entry.title, entry.id).toBe(danishTitlesFor(entry.id)[0] ?? getBook(entry.id)!.title)
    expect(list.find(entry => entry.id === 'king-lear')!.title).toBe('Kong Lear')
    expect(list.find(entry => entry.id === 'hamlet')!.title).toBe('Hamlet')
    expect(html).toContain('<span class="me-card-title">Kong Lear</span><span class="me-card-author">William Shakespeare</span></a></li>')
  })

  it('names authors in Danish where a spelling is on file, else with "og" for "and"', () => {
    expect(danishAuthor('Plato')).toBe('Platon')
    expect(danishAuthor('Jacob and Wilhelm Grimm')).toBe('Jacob og Wilhelm Grimm')
    expect(danishAuthor('Gilbert and Sullivan')).toBe('Gilbert og Sullivan')
    expect(danishAuthor('William Shakespeare')).toBe('William Shakespeare')
    for (const entry of list) expect(entry.author, entry.id).not.toMatch(/ and /)
    // No source line on the Danish page.
    expect(html).not.toContain('me-card-source')
  })

  it('opens every book in free mode in Danish, and shelves it in the approved order', () => {
    const links = [...html.matchAll(/href="(\/reader[^"]*)"/g)].map(match => match[1].replace(/&amp;/g, '&'))
    expect(links).toHaveLength(list.length)
    for (const link of links) expect(link).toMatch(/^\/reader\?book=[a-z0-9-]+&mode=free&ref=nudansk$/)
    const shelves = modernEnglishShelves(list, 'da')
    expect(shelves.map(shelf => shelf.title)).toEqual(DANISH_SHELVES.map(shelf => shelf.label))
    expect(shelves.reduce((sum, shelf) => sum + shelf.books.length, 0)).toBe(list.length)
    expect(list.find(entry => entry.id === 'a-little-princess')!.house).toBe('kids')
    expect(html.match(/data-kind="house"/g)).toHaveLength(6)
    expect(html).toContain('>Børn og unge</button>')
    expect(html).toContain('>1500–1600-tallet</button>')
  })

  it('is in Danish, with its canonical, the hreflang pair and Danish share tags', () => {
    expect(html).toContain('<html lang="da">')
    expect(html).toContain('<title>De største klassikere på nudansk, gratis | Tinct</title>')
    expect(html).toContain('<h1>De største klassikere på nudansk. Gratis.</h1>')
    expect(html).toContain('<p class="me-sub">Originalen er altid ét tryk væk.</p>')
    expect(html).toContain('placeholder="Søg på titel eller forfatter"')
    expect(html).toContain('data-empty="Ingen bøger fundet"')
    expect(html).toContain(`<meta name="description" content="${list.length} klassikere på nudansk, gratis at læse, med originalen ét tryk væk.">`)
    expect(html).toContain('<meta property="og:title" content="De største klassikere på nudansk, gratis">')
    expect(html).toContain('<meta property="og:locale" content="da_DK">')
    expect(html).not.toMatch(/<meta name="robots"/)
    expect(html).not.toMatch(/sign-in|Sign in|Premium|Subscribe|\$\d/)
    for (const page of [html, renderModernEnglishPage(ASSETS)]) {
      expect(page).toContain('<link rel="alternate" hreflang="en" href="https://tinct.app/modern-english">')
      expect(page).toContain('<link rel="alternate" hreflang="da" href="https://tinct.app/nudansk">')
    }
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/nudansk">')
  })

  it('is served indexable by the Worker, with the share image, and is in the sitemap and llms.txt', async () => {
    const env = { ASSETS: { fetch: async (request: Request) => new URL(request.url).pathname === '/nudansk'
      ? new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      : new Response('nf', { status: 404 }) } }
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const get = (path: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${path}`), env as never, ctx)
    const page = await get('/nudansk')
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toBeNull()
    const served = await page.text()
    expect(served).toContain('<html lang="da">')
    expect(served).toContain('<meta property="og:image" content="https://tinct.app/brand/')
    for (const path of ['/nudansk.html', '/nudansk/']) {
      const moved = await get(path)
      expect(moved.status).toBe(301)
      expect(moved.headers.get('Location')).toBe('/nudansk')
    }
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://tinct.app/nudansk</loc>')
    expect(readFileSync('scripts/generate-sitemap.cjs', 'utf8')).toContain('${ORIGIN}/nudansk')
    expect(readFileSync('public/llms.txt', 'utf8')).toContain('https://tinct.app/nudansk')
  })
})
