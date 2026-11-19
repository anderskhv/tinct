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

  it('words the book page for "read X online" searches and opens its text with a link to the first chapter or scene', () => {
    const crime = composeBookLibraryPage(library, readGeneratedBookPage(bookPage('crime-and-punishment'), 'crime-and-punishment')!)
    expect(crime).toContain('<title>Read Crime and Punishment online free, in modern English | Tinct</title>')
    expect(crime).toContain('<meta name="description" content="Read the full text of Crime and Punishment free online, with modern English beside Constance Garnett&#39;s translation. No sign-up, no ads.">')
    expect(crime).toContain('<div class="book-about-text">\n  <p class="start-reading"><a class="read-button primary-cta" href="/read/crime-and-punishment/chapter-1">Start reading: Part 1, Chapter 1</a></p>')
    expect(GENERATED_BOOK_META['moby-dick'].description).toBe("Read the full text of Moby Dick free online, with modern English beside Herman Melville's original. No sign-up, no ads.")
    expect(GENERATED_BOOK_META.hamlet.title).toBe('Read Hamlet online free, scene by scene in modern English | Tinct')
    expect(GENERATED_BOOK_META.hamlet.description).toBe("Read the full text of Hamlet free online, with modern English beside William Shakespeare's original. No sign-up, no ads.")
    expect(bookPage('hamlet')).toContain('<p class="start-reading"><a class="read-button primary-cta" href="/read/hamlet/act-1-scene-1">Start reading: Act 1, Scene 1</a></p>')
  })

  it('shows the start link beside the hero\'s Read button while scripts run, and the text\'s own without them', () => {
    const crime = composeBookLibraryPage(library, readGeneratedBookPage(bookPage('crime-and-punishment'), 'crime-and-punishment')!)
    expect(crime).toContain('<span data-icon="readArrow"></span></button><a class="hero-own hero-start" id="hero-start" href="/read/crime-and-punishment/chapter-1">Start reading: Part 1, Chapter 1</a><a class="hero-own" id="hero-own"')
    expect(crime.match(/id="hero-start"/g)).toHaveLength(1)
    const head = crime.slice(0, crime.indexOf('</head>'))
    expect(head).toContain('<style>#library .book-about .start-reading{display:none}html.returning #library .book-about .start-reading,html.returning-pending #library .book-about .start-reading,html:has(#hero-book .cover:not([data-book="crime-and-punishment"])) #library .book-about .start-reading{display:block}html:has(#hero-book .cover:not([data-book="crime-and-punishment"])) #hero-start{display:none}</style>')
    expect(head).toContain('<noscript><style>#hero-start{display:none!important}#library .book-about .start-reading{display:block!important}#library #shelves{margin-top:0}</style></noscript>')
    // The library's own hero is unchanged.
    expect(library).not.toContain('hero-start')
    expect(prefillLibraryHero(library, readGeneratedBookPage(bookPage('crime-and-punishment'), 'crime-and-punishment')!.hero)).not.toContain('hero-start')
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
    expect(html).toContain('<title>Read Wuthering Heights online free, in modern English | Tinct</title>')
    expect(html).toContain('<meta property="og:title" content="Read Wuthering Heights online free, in modern English | Tinct">')
    expect(html).toContain('<div id="shelves"></div><section id="book-about" class="book-about" aria-label="Wuthering Heights"><div class="book-about-text">')
    expect(html.match(/<main\b/g)).toHaveLength(1)
    expect(html).toContain('<base href="/lab/library_2/">')
  })
})
