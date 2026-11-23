import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { danishTitlesFor } from '../data/danishTitles'
import { OFFERED_DANISH_EDITIONS, editionHold } from '../data/editionAvailability'
import { DANISH_FREE_PAGE_HEADLINE, DANISH_FREE_PAGE_SLUG } from '../data/freePages'
import { isEditionWithheld } from '../data/withheldEditions'
import { handleSeoAndStaticRequest } from '../worker/routes/seo'
import {
  DANISH_FREE_PAGE,
  FREE_PAGES,
  MODERN_ENGLISH_PAGE,
  danishSource,
  freeReaderHref,
  hasLiveEdition,
  modernEnglishBooks,
  modernEnglishShelves,
  renderModernEnglishPage,
} from './modernEnglishPage'

// The Danish free page, "Klassikere på nutidsdansk" (Anders, 23 Nov 2026): the modern-English page's sibling, from
// the same code, for the books whose Danish edition is published. Unlisted, selling nothing, every word Danish.
const ASSETS = { css: '/lab/modern-english/modern-english.css?v=1', js: '/lab/modern-english/modern-english.js?v=1' }
const list = modernEnglishBooks(BOOKS, DANISH_FREE_PAGE)
const html = renderModernEnglishPage(ASSETS, undefined, DANISH_FREE_PAGE)
/** The page as a reader sees it: tags, scripts and attributes other than the spoken ones removed. */
const visible = (page: string) => page.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
const spoken = (page: string) => [...page.matchAll(/(?:aria-label|placeholder|alt|title|data-empty)="([^"]*)"/g)].map(match => match[1])

describe('the Danish list comes from the registry', () => {
  it('lists exactly the books whose Danish edition is offered and not held or withheld', () => {
    const listed = new Set(list.map(entry => entry.id))
    expect(listed.size).toBeGreaterThanOrEqual(60)
    for (const entry of BOOKS) expect(listed.has(entry.id), entry.id).toBe(hasLiveEdition(entry, 'modern-da'))
    for (const id of listed) {
      expect(OFFERED_DANISH_EDITIONS.has(`${id}/modern-da`), id).toBe(true)
      expect(editionHold(id, 'modern-da'), id).toBeUndefined()
      expect(isEditionWithheld(id, 'modern-da'), id).toBe(false)
    }
    // Every offered edition of a registered, unheld book is on the page.
    for (const identity of OFFERED_DANISH_EDITIONS) {
      const id = identity.split('/')[0]
      const entry = getBook(id)
      if (entry && hasLiveEdition(entry, 'modern-da')) expect(listed.has(id), id).toBe(true)
    }
    // A book with Modern English and no published Danish is not here.
    expect(listed.has('pride-and-prejudice')).toBe(false)
    expect(listed.has('meditations')).toBe(true)
  })

  it('shows a Danish title where one is on file, never an invented one, and still finds the book by its English title', () => {
    const byId = new Map(list.map(entry => [entry.id, entry]))
    expect(byId.get('a-little-princess')!.title).toBe('Den lille prinsesse')
    expect(byId.get('a-little-princess')!.also).toContain('A Little Princess')
    expect(byId.get('meditations')!.title).toBe('Selvbetragtninger')
    expect(byId.get('hamlet')!.title).toBe('Hamlet')
    for (const entry of list) expect(entry.title, entry.id).toBe(danishTitlesFor(entry.id)[0] ?? getBook(entry.id)!.title)
  })

  it('names what each Danish edition was made from, in Danish', () => {
    expect(danishSource(getBook('meditations')!)).toBe('via George Longs engelske oversættelse, 1862')
    expect(danishSource(getBook('oedipus-rex')!)).toBe('via Francis Storrs engelske oversættelse, 1912')
    expect(danishSource(getBook('hamlet')!)).toBe('fra den engelske original')
    expect(danishSource(getBook('communist-manifesto')!)).toBe('via Samuel Moores engelske oversættelse, 1888')
    expect(danishSource(getBook('master-and-margarita')!)).toBe('fra den russiske original')
    for (const entry of list) expect(entry.source, entry.id).toMatch(/^(?:via .+ engelske oversættelse(?:, \d{4})?|fra den (?:engelske|russiske) original|fra den engelske udgave)$/)
  })

  it('shelves the books in the library house order under Danish names', () => {
    const shelves = modernEnglishShelves(list, DANISH_FREE_PAGE)
    expect(shelves.map(shelf => shelf.title).slice(0, 4)).toEqual(['Filosofi', 'Politik og staten', 'Drama', 'Skønlitteratur'])
    expect(shelves.reduce((sum, shelf) => sum + shelf.books.length, 0)).toBe(list.length)
  })
})

describe('the Danish page', () => {
  it('opens every book in the free reading mode with the Danish ref', () => {
    expect(freeReaderHref('meditations', DANISH_FREE_PAGE)).toBe(`/reader?book=meditations&mode=free&ref=${DANISH_FREE_PAGE_SLUG}`)
    const links = [...html.matchAll(/href="(\/reader[^"]*)"/g)].map(match => match[1].replace(/&amp;/g, '&'))
    expect(links).toHaveLength(list.length)
    for (const link of links) expect(link).toMatch(new RegExp(`^/reader\\?book=[a-z0-9-]+&mode=free&ref=${DANISH_FREE_PAGE_SLUG}$`))
    expect(html).not.toContain('ref=modern-english')
  })

  it('is Danish in every word it shows and says', () => {
    expect(html).toContain('<html lang="da">')
    const count = Math.floor(list.length / 10) * 10
    expect(html).toContain(`<h1>${DANISH_FREE_PAGE_HEADLINE(count)}</h1>`)
    expect(DANISH_FREE_PAGE_HEADLINE(60)).toBe('60+ klassikere på nutidsdansk. Gratis.')
    for (const text of [
      'Den engelske udgave er altid ét tryk væk.', 'Søg på titel eller forfatter', 'Filosofi', 'Drama', 'Skønlitteratur', 'Poesi', 'Politik',
      'Antikken, før 500', 'Middelalder, 500–1500', '1500–1600-tallet', '1700-tallet', '1800-tallet', '1900-tallet',
      'En vej ind, ikke en videnskabelig oversættelse. Gratis at læse i begge udgaver.', 'Privatliv', 'Vilkår', 'Kreditering', 'Om Tinct',
      'Ingen bog med det navn. Prøv forfatteren.', 'Ingen bog på hylderne passer til begge valg. Fjern et af dem.',
      '<title>Klassikere på nutidsdansk, gratis | Tinct</title>',
    ]) expect(html, text).toContain(text)
    // None of the English page's own words is left, in the text or in what a screen reader says.
    const english = /\b(?:Search|Category|Period|Books|About|Privacy|Terms|Credits|Philosophy|Fiction|Poetry|Politics|Ancient|Medieval|classics|translation|Free|free|library|from the original|Made with AI|No book|scholarly|versions)\b/
    const titles = new Set(list.flatMap(entry => [entry.title, entry.author]))
    const chrome = visible(html).split(/\s{2,}/).map(text => text.trim()).filter(text => text && !titles.has(text))
    for (const text of [...chrome, ...spoken(html)]) expect(text, text).not.toMatch(english)
    expect(html).toContain('aria-label="Tincts bibliotek">Tinct.</a>')
  })

  it('keeps the shape of the page: one pill per category and period, no top bar, nothing for sale', () => {
    expect(html.match(/data-kind="house"/g)).toHaveLength(5)
    expect(html.match(/data-kind="era"/g)).toHaveLength(6)
    expect(html).not.toMatch(/sign-in|Sign in|Premium|Subscribe|\$\d|Log ind|Opret konto/)
    expect(html).not.toContain('<header')
    expect(html).not.toMatch(/href="\/try\b/)
  })

  it('is noindex, served unlisted by the Worker and absent from the sitemap', async () => {
    expect(DANISH_FREE_PAGE.indexable).toBe(false)
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
    const path = `/${DANISH_FREE_PAGE_SLUG}`
    const env = { ASSETS: { fetch: async (request: Request) => new URL(request.url).pathname === path
      ? new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      : new Response('nf', { status: 404 }) } }
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const get = (target: string, cookie?: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${target}`, cookie ? { headers: { Cookie: cookie } } : undefined), env as never, ctx)
    const page = await get(path)
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect((await get(path, 'tinct_auth=1')).status).toBe(200)
    for (const other of [`${path}.html`, `${path}/`]) {
      const moved = await get(other)
      expect(moved.status).toBe(301)
      expect(moved.headers.get('Location')).toBe(path)
    }
    for (const file of ['public/sitemap.xml', 'public/robots.txt', 'public/llms.txt']) expect(readFileSync(file, 'utf8'), file).not.toContain(DANISH_FREE_PAGE_SLUG)
  })

  it('has its slug in the two hand-kept files, so a rename is caught', () => {
    expect(readFileSync('.gitignore', 'utf8')).toContain(`public/${DANISH_FREE_PAGE_SLUG}.html`)
    expect(readFileSync('vite.config.ts', 'utf8')).toContain(`'/${DANISH_FREE_PAGE_SLUG}': '/${DANISH_FREE_PAGE_SLUG}.html'`)
    expect(FREE_PAGES.map(page => page.slug)).toEqual(['modern-english', DANISH_FREE_PAGE_SLUG])
  })
})

describe('the English page is the page it was', () => {
  const english = renderModernEnglishPage(ASSETS)

  it('is rendered the same with and without the page named', () => {
    expect(renderModernEnglishPage(ASSETS, undefined, MODERN_ENGLISH_PAGE)).toBe(english)
    expect(modernEnglishBooks()).toEqual(modernEnglishBooks(BOOKS, MODERN_ENGLISH_PAGE))
  })

  it('keeps its words, its language and its links, and takes nothing from the Danish page', () => {
    expect(english).toContain('<html lang="en">')
    expect(english).toContain('<title>Classics in modern English, free | Tinct</title>')
    expect(english).toContain('<p class="me-sub">The original, or its classic human translation, is always one tap away.</p>')
    expect(english).toContain('<ul id="me-results" class="me-results" role="listbox" aria-label="Books" hidden></ul>')
    expect(english).toContain('<footer class="me-footer"><nav aria-label="About"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/credits">Credits</a><a href="/about">About Tinct</a></nav></footer>')
    expect(english).not.toMatch(/nutidsdansk|data-empty|"x":|Søg|klassikere/)
    expect(freeReaderHref('meditations')).toBe('/reader?book=meditations&mode=free&ref=modern-english')
  })
})
