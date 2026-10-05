import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { GENERATED_BOOK_META } from '../../data/bookMetaGenerated'
import { composeBookLibraryPage, prefillLibraryHero, readGeneratedBookPage } from './bookLibraryPage'

const library = readFileSync('public/lab/library_2/index.html', 'utf8')
const bookPage = (id: string) => readFileSync(`public/read/${id}/book.html`, 'utf8')

describe('book links in the library', () => {
  it('reads every public book page the generator writes', () => {
    const ids = Object.keys(GENERATED_BOOK_META).filter(id => existsSync(`public/read/${id}/book.html`))
    expect(ids.length).toBeGreaterThan(50)
    for (const id of ids) {
      const page = readGeneratedBookPage(bookPage(id), id)
      expect(page, id).not.toBeNull()
      expect(page!.hero.title, id).toBeTruthy()
      expect(page!.hero.question, id).toBeTruthy()
      expect(page!.seoHead, id).toContain(`<link rel="canonical" href="https://tinct.app/read/${id}">`)
      expect(page!.about, id).toMatch(/^<main>[\s\S]*<\/main>$/)
    }
  })

  it('refuses a page for another book or without its markers', () => {
    expect(readGeneratedBookPage(bookPage('wuthering-heights'), 'jane-eyre')).toBeNull()
    expect(readGeneratedBookPage('<html>odyssey marketing</html>', 'odyssey')).toBeNull()
  })

  it('fills every part of the hero that names the featured book', () => {
    const html = prefillLibraryHero(library, { id: 'wuthering-heights', title: 'Wuthering Heights', author: 'Emily Brontë', question: 'What does a family pass on besides its name?', cover: '/covers/v2/wuthering-heights.webp' })
    // The author flap further down is filled when a book opens; the hero names only the linked book.
    expect(html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0]).not.toMatch(/Frankenstein|Mary Shelley/)
    expect(html).toContain('<html lang="en" data-linked-book="wuthering-heights">')
    expect(html).toContain('<p class="author" id="hero-author">Emily Brontë’s</p><h1 id="hero-title">Wuthering Heights</h1><p class="question">What does a family pass on besides its name?</p>')
    expect(html).toContain('<span id="hero-genre"></span><span id="hero-time"></span>')
    expect(html).toContain('<button id="hero-book" class="hero-book cover-button" aria-label="Open Wuthering Heights"><img id="hero-cover-preview" alt="" fetchpriority="high" decoding="async" src="/covers/v2/wuthering-heights.webp"><canvas class="cover" data-book="wuthering-heights">')
  })

  it('escapes hero text', () => {
    const html = prefillLibraryHero(library, { id: 'x', title: 'A <b>"Book"</b>', author: 'Some & One', question: '<script>', cover: null })
    expect(html).toContain('<h1 id="hero-title">A &lt;b&gt;&quot;Book&quot;&lt;/b&gt;</h1>')
    expect(html).toContain('id="hero-author">Some &amp; One’s</p>')
    expect(html).toContain('<p class="question">&lt;script&gt;</p>')
    expect(html).toContain('<img id="hero-cover-preview" alt="" fetchpriority="high" decoding="async">')
  })

  it('composes the shared page: indexable, one title, the book text after the shelves', () => {
    const page = readGeneratedBookPage(bookPage('wuthering-heights'), 'wuthering-heights')!
    const html = composeBookLibraryPage(library, page)
    expect(html).not.toContain('noindex')
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html).toContain('<title>Read Wuthering Heights Free Online | Tinct</title>')
    expect(html).toContain('<meta property="og:title" content="Read Wuthering Heights Free Online | Tinct">')
    expect(html).toContain('<div id="shelves"></div><section id="book-about" class="book-about" aria-label="Wuthering Heights"><div class="book-about-text">')
    expect(html.match(/<main\b/g)).toHaveLength(1)
    expect(html).toContain('<base href="/lab/library_2/">')
  })
})
