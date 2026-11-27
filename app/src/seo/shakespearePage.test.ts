import { existsSync, readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { LIBRARY_BOOK_META } from '../data/libraryTaxonomy'
import { handleSeoAndStaticRequest } from '../worker/routes/seo'
import type { Book } from '../types'
import { hasLiveModernEnglish } from './modernEnglishPage'
import {
  DEMO_PASSAGE,
  PLAY_ORDER,
  SHAKESPEARE_COPY,
  renderShakespearePage,
  shakespeareDemo,
  shakespearePlays,
  type EditionFile,
  type VerseLineFile,
} from './shakespearePage'

// The Shakespeare page at /shakespeare (mockup approved by Anders, 27 Nov 2026): the About page's layout, showing
// only Shakespeare in the original and in modern English.
const ASSETS = { tokens: '/lab/tinct-ui.css?v=1', about: '/lab/try/try.css?v=1', css: '/lab/shakespeare/shakespeare.css?v=1', js: '/lab/shakespeare/shakespeare.js?v=1' }
const json = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T
const original = json<EditionFile>('public/data/editions/hamlet-original-en.json')
const modern = json<EditionFile>('public/data/editions/hamlet-modern-en.json')
const lines = json<VerseLineFile>('public/data/editions/hamlet-lines.json')
const css = readFileSync('public/lab/shakespeare/shakespeare.css', 'utf8')
const script = readFileSync('public/lab/shakespeare/shakespeare.js', 'utf8')

const plays = shakespearePlays()
const demo = shakespeareDemo(original, modern, lines, getBook('hamlet')!)
const html = renderShakespearePage(ASSETS, { plays, demo })
const text = (markup: string) => markup.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('the plays come from the registry', () => {
  it('lists every Shakespeare play whose Modern English is live, and only those', () => {
    const shelves = new Map(LIBRARY_BOOK_META.map(entry => [entry.id, entry.shelves]))
    const expected = BOOKS.filter(book => book.author === 'William Shakespeare'
      && (shelves.get(book.id) ?? []).some(shelf => shelf.startsWith('shakespeare-')) && hasLiveModernEnglish(book)).map(book => book.id)
    expect(plays.map(play => play.id).sort()).toEqual([...expected].sort())
    expect(new Set(plays.map(play => play.id)).size).toBe(plays.length)
    // A retelling by another author is not a play of his.
    expect(plays.some(play => play.id === 'beautiful-stories-from-shakespeare')).toBe(false)
    for (const play of plays) expect(play.title, play.id).toBe(getBook(play.id)!.title)
  })

  it('counts them in the heading and the description, never a number typed in', () => {
    expect(html).toContain(`<h2 id="plays-title">All ${plays.length} plays</h2>`)
    expect(html).toContain(`<meta name="description" content="${plays.length} Shakespeare plays, `)
    const fewer = renderShakespearePage(ASSETS, { plays: plays.slice(0, 7), demo })
    expect(fewer).toContain('<h2 id="plays-title">All 7 plays</h2>')
    expect(fewer.match(/<li><a href="\/reader/g)).toHaveLength(7)
  })

  it('leaves out a play whose Modern English is not live, and one that is not on a Shakespeare shelf', () => {
    const hamlet = getBook('hamlet')!
    const withoutModern = { ...hamlet, editions: hamlet.editions.filter(edition => edition.key !== 'modern-en') } as Book
    expect(shakespearePlays([withoutModern, getBook('macbeth')!]).map(play => play.id)).toEqual(['macbeth'])
    expect(shakespearePlays([{ ...hamlet, noModernEdition: true } as Book])).toEqual([])
    expect(shakespearePlays([{ ...hamlet, id: 'not-on-a-shelf' } as Book])).toEqual([])
    expect(shakespearePlays([{ ...hamlet, author: 'Someone Else' } as Book])).toEqual([])
  })

  it('opens the ten plays of the mockup first, in its order; a play the order does not name follows', () => {
    expect(plays.slice(0, 10).map(play => play.id)).toEqual([
      'hamlet', 'macbeth', 'romeo-and-juliet', 'othello', 'king-lear', 'midsummer', 'twelfth-night', 'the-tempest',
      'much-ado-about-nothing', 'julius-caesar',
    ])
    for (const play of plays) expect(PLAY_ORDER, play.id).toContain(play.id)
    expect(shakespearePlays([getBook('cymbeline')!, getBook('hamlet')!]).map(play => play.id)).toEqual(['hamlet', 'cymbeline'])
  })

  it('opens every play in the reader\'s free mode, from its cover', () => {
    const links = [...html.matchAll(/<li><a href="([^"]+)"><img src="([^"]+)"[^>]*><span>([^<]+)<\/span><\/a><\/li>/g)]
    expect(links).toHaveLength(plays.length)
    links.forEach((link, index) => {
      const play = plays[index]
      expect(link[1].replace(/&amp;/g, '&')).toBe(`/reader?book=${play.id}&mode=free&ref=shakespeare`)
      expect(link[2]).toBe(`/covers/v2/${play.id}.webp`)
      expect(existsSync(`public${link[2]}`), link[2]).toBe(true)
      expect(link[3]).toBe(play.title)
    })
    // No other way into the reader, and no chapter in the address: the reader opens the play's first scene.
    expect(html.match(/href="\/reader/g)).toHaveLength(plays.length)
    expect(html).not.toMatch(/\/reader\?[^"]*chapter=/)
  })
})

describe('the passage is Hamlet, Act 3, Scene 1, from the two editions', () => {
  const scene = original.chapters.find(chapter => chapter.title.startsWith('Act 3, Scene 1'))!
  const at = scene.paragraphs.findIndex(paragraph => paragraph.startsWith('HAMLET. To be, or not to be'))
  const originalSpeech = scene.paragraphs[at]
  const modernSpeech = modern.chapters.find(chapter => chapter.number === scene.number)!.paragraphs[at]

  it('shows the edition files\' own words, row by row, with nothing added, changed or left out between them', () => {
    expect(demo.title).toBe('Hamlet')
    expect(demo.scene).toBe('Act 3, Scene 1')
    expect(demo.rows).toHaveLength(5)
    const shownOriginal = demo.rows.map(row => row.original.join(' ')).join(' ')
    const shownModern = demo.rows.map(row => row.modern).join(' ')
    // One unbroken stretch of each edition's paragraph, from its first word.
    expect(originalSpeech.startsWith(shownOriginal)).toBe(true)
    expect(modernSpeech.startsWith(shownModern)).toBe(true)
    expect(shownOriginal.endsWith(DEMO_PASSAGE.original.last)).toBe(true)
    expect(shownModern.endsWith(DEMO_PASSAGE.modern.last)).toBe(true)
    expect(demo.rows[0].original).toEqual(['HAMLET. To be, or not to be, that is the question:'])
    expect(demo.rows[3].modern).toBe(modernSpeech.slice(modernSpeech.indexOf('To die, to sleep.'), modernSpeech.indexOf('Because in that sleep')).trim())
    for (const row of demo.rows) {
      expect(row.modern.length).toBeGreaterThan(0)
      for (const line of row.original) expect(originalSpeech).toContain(line)
    }
  })

  it('breaks the original where the play\'s verse lines break', () => {
    const offsets = lines.chapters[String(scene.number)][String(at)]
    const shown = demo.rows.flatMap(row => row.original)
    // Every verse line that begins inside the passage begins a line on the page.
    const end = originalSpeech.indexOf(DEMO_PASSAGE.original.last) + DEMO_PASSAGE.original.last.length
    for (const offset of offsets.filter(value => value < end)) {
      const lineStart = originalSpeech.slice(offset, offset + 12)
      expect(shown.some(line => line.startsWith(lineStart.trim().slice(0, 10))), lineStart).toBe(true)
    }
    expect(demo.rows[1].original).toEqual([
      'Whether ’tis nobler in the mind to suffer', 'The slings and arrows of outrageous fortune,',
      'Or to take arms against a sea of troubles,', 'And by opposing end them?',
    ])
    // Without the line file the words are the same, unbroken.
    const plain = shakespeareDemo(original, modern, null, getBook('hamlet')!)
    expect(plain.rows.map(row => row.original.join(' '))).toEqual(demo.rows.map(row => row.original.join(' ')))
    expect(plain.rows[1].original).toHaveLength(1)
  })

  it('fails the build rather than show something else when an edition no longer holds the passage', () => {
    const changed = (file: EditionFile, edit: (paragraph: string) => string): EditionFile => ({
      chapters: file.chapters.map(chapter => chapter.number === scene.number
        ? { ...chapter, paragraphs: chapter.paragraphs.map((paragraph, index) => index === at ? edit(paragraph) : paragraph) }
        : chapter),
    })
    const book = getBook('hamlet')!
    expect(() => shakespeareDemo(changed(original, paragraph => paragraph.replace('For in that sleep', 'In that sleep')), modern, lines, book)).toThrow(/no longer in the passage/)
    expect(() => shakespeareDemo(original, changed(modern, paragraph => paragraph.replace('Is it nobler', 'Which is nobler')), lines, book)).toThrow(/no longer in the passage/)
    expect(() => shakespeareDemo(changed(original, () => 'KING. Something else.'), modern, lines, book)).toThrow(/is not in hamlet/)
    expect(() => shakespeareDemo({ chapters: [] }, modern, lines, book)).toThrow(/has no "Act 3, Scene 1"/)
    // A reworded modern line is shown as the edition now has it.
    const reworded = shakespeareDemo(original, changed(modern, paragraph => paragraph.replace('Yes, there\'s the problem.', 'Yes, that is the catch.')), lines, book)
    expect(reworded.rows[3].modern).toContain('Yes, that is the catch.')
  })

  it('sets both editions in each row, the original line by line', () => {
    expect(html.match(/<div class="shk-row">/g)).toHaveLength(demo.rows.length)
    expect(html).toContain('<div class="shk-heads"><span>As written</span><span>In modern English</span></div>')
    expect(html).toContain('<p class="shk-original"><span class="shk-line">HAMLET. To be, or not to be, that is the question:</span></p><p class="shk-modern">HAMLET. To be, or not to be — that is the question.</p>')
    expect(html).toContain('<span class="shk-book">Hamlet</span>')
    expect(html).toContain('· Act 3, Scene 1 ')
    for (const row of demo.rows) expect(text(html)).toContain(row.modern)
  })
})

describe('the page', () => {
  it('says what the mockup says: the headline, the line under it and Pick a play, which leads to the plays', () => {
    expect(html).toContain('<h1 class="shk-headline">Shakespeare as he wrote it, and in plain English.</h1>')
    expect(html).toContain('<p class="shk-sub">Every line as he wrote it, next to the same line in plain English.</p>')
    expect(html).toContain('<a class="shk-pick" href="#plays">Pick a play <span aria-hidden="true">↓</span></a>')
    expect(html).toContain('<section class="shk-plays" id="plays" aria-labelledby="plays-title">')
    expect(html).toContain('<p>Every one in the original and in modern English, free.</p>')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(SHAKESPEARE_COPY.plays(23)).toBe('All 23 plays')
  })

  it('shows nothing else: no Start reading, no pricing, no AI features, no account pitch', () => {
    expect(text(html)).not.toMatch(/Start reading|Create account|Premium|Pricing|\$\d|free month|credit card/i)
    expect(text(html)).not.toMatch(/\bAI\b|Explain|companion|Listen|narrat|audiobook|Talk|summary/i)
    expect(html).not.toContain('#pricing')
    expect(html).not.toMatch(/try-moments|try-plans|try-demo|data-try-/)
    // The one account link is a quiet Sign in in the top bar.
    expect(html.match(/href="\/sign-in[^"]*"/g)).toEqual(['href="/sign-in"'])
  })

  it('has no Questions section: the plays are the last thing before the footer (Anders, 27 Nov 2026)', () => {
    expect(html).not.toMatch(/id="questions"|<details|try-below|try-section/)
    expect(text(html)).not.toMatch(/\bQuestions\b/)
    expect(html).toMatch(/<\/ul>\s*<\/section>\s*<\/main>\s*<footer class="try-footer">/)
  })

  it('is indexable and self-canonical, with the About page\'s stylesheet before its own and no inline script', () => {
    expect(html).not.toMatch(/<meta name="robots"/)
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/shakespeare">')
    expect(html).toContain('<meta property="og:url" content="https://tinct.app/shakespeare">')
    expect(html).toContain('<title>Shakespeare in the original and in modern English, free | Tinct</title>')
    expect(html.indexOf(ASSETS.tokens)).toBeLessThan(html.indexOf(ASSETS.about))
    expect(html.indexOf(ASSETS.about)).toBeLessThan(html.indexOf(ASSETS.css))
    // The Worker's content policy allows scripts from files only.
    for (const tag of html.match(/<script\b[^>]*>/g)!) expect(tag).toMatch(/\ssrc="\/lab\//)
    expect(html).not.toMatch(/\son[a-z]+="/)
    expect(html).not.toMatch(/location\.replace|tinct_auth/)
  })

  it('keeps to the design rules: the three type roles, never mono, no capitals by style', () => {
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(rules).not.toMatch(/mono|Courier|Menlo|Consolas/i)
    expect(css).not.toMatch(/text-transform|small-caps/)
    for (const family of css.match(/var\(--tui-font-[a-z]+\)/g)!) expect(['var(--tui-font-display)', 'var(--tui-font-serif)', 'var(--tui-font-ui)']).toContain(family)
    // Every face is one of the design system's three roles, never a family named here.
    for (const declared of rules.matchAll(/\bfont(?:-family)?:\s*([^;]+);/g)) expect(declared[1], declared[0]).toMatch(/var\(--tui-font-(display|serif|ui)\)$/)
    // Titles in Playfair Display, the passage and the play names in EB Garamond.
    expect(css).toMatch(/\.shk-headline \{[^}]*var\(--tui-font-display\)/)
    expect(css).toMatch(/\.shk-row p \{[^}]*var\(--tui-font-serif\)/)
    expect(css).toMatch(/\.shk-covers a \{[^}]*var\(--tui-font-serif\)/)
  })
})

describe('desktop shows both editions with no switch; a phone shows one, behind a switch that works', () => {
  it('hides the switch on the desktop and the second edition on a phone, in the stylesheet', () => {
    const [desktop, phone] = css.split('@media (max-width: 899px)')
    expect(desktop).toMatch(/\.shk-switch \{ display: none; \}/)
    expect(desktop).not.toMatch(/data-view/)
    expect(phone).toMatch(/\.shk-switch \{ display: inline-flex;/)
    expect(phone).toContain('.shk-reader[data-view="original"] .shk-modern, .shk-reader[data-view="modern"] .shk-original { display: none; }')
    expect(phone).toMatch(/\.shk-heads \{ display: none; \}/)
    // Only Original and Modern: the phone reader has no Both view.
    expect(html.match(/data-shk-view="[a-z]+"/g)).toEqual(['data-shk-view="original"', 'data-shk-view="modern"'])
  })

  it('switches the passage between Original and Modern, and marks the one in use', () => {
    const dom = new JSDOM(html, { runScripts: 'outside-only' })
    dom.window.eval(script)
    const { document } = dom.window
    const reader = document.querySelector('[data-shk-reader]')!
    const [originalButton, modernButton] = [...reader.querySelectorAll<HTMLButtonElement>('[data-shk-view]')]
    expect(reader.getAttribute('data-view')).toBe('original')
    expect(originalButton.getAttribute('aria-pressed')).toBe('true')
    modernButton.click()
    expect(reader.getAttribute('data-view')).toBe('modern')
    expect(modernButton.getAttribute('aria-pressed')).toBe('true')
    expect(originalButton.getAttribute('aria-pressed')).toBe('false')
    originalButton.click()
    expect(reader.getAttribute('data-view')).toBe('original')
    expect(originalButton.getAttribute('aria-pressed')).toBe('true')
    expect(modernButton.getAttribute('aria-pressed')).toBe('false')
    // Nothing on the page calls the server or keeps anything on the device.
    expect(script).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/)
  })
})

describe('built and served like the modern-English page', () => {
  it('is generated in prebuild, after the sitemap, and is not committed', () => {
    const prebuild = (JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }).scripts.prebuild
    expect(prebuild).toContain('node scripts/seo/build-shakespeare.mjs')
    expect(prebuild.indexOf('build-shakespeare.mjs')).toBeGreaterThan(prebuild.indexOf('generate-sitemap.cjs'))
    expect(readFileSync('.gitignore', 'utf8').split('\n')).toContain('public/shakespeare.html')
    const builder = readFileSync('scripts/seo/build-shakespeare.mjs', 'utf8')
    // It reads the passage's play (DEMO_PASSAGE.bookId) from the edition files, and nothing from the About page.
    for (const source of ['-original-en.json', '-modern-en.json', '-lines.json', 'public/shakespeare.html']) expect(builder, source).toContain(source)
    expect(builder).not.toContain('about.html')
    expect(DEMO_PASSAGE.bookId).toBe('hamlet')
  })

  it('is served indexable by the Worker, to signed-in readers too, with the share image; other spellings redirect', async () => {
    const env = { ASSETS: { fetch: async (request: Request) => new URL(request.url).pathname === '/shakespeare'
      ? new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      : new Response('nf', { status: 404 }) } }
    const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
    const get = (path: string, cookie?: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${path}`, cookie ? { headers: { Cookie: cookie } } : undefined), env as never, ctx)
    const page = await get('/shakespeare')
    expect(page.status).toBe(200)
    expect(page.headers.get('X-Robots-Tag')).toBeNull()
    expect(page.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    expect(page.headers.get('Content-Security-Policy')).toContain("script-src 'self'")
    const served = await page.text()
    expect(served).toContain('<h1 class="shk-headline">Shakespeare as he wrote it, and in plain English.</h1>')
    expect(served).toContain('<meta property="og:image" content="https://tinct.app/brand/')
    // Signed-in readers may see it: no redirect.
    const signedIn = await get('/shakespeare', 'tinct_auth=1')
    expect(signedIn.status).toBe(200)
    expect(signedIn.headers.get('Location')).toBeNull()
    for (const path of ['/shakespeare.html', '/shakespeare/']) {
      const moved = await get(path)
      expect(moved.status, path).toBe(301)
      expect(moved.headers.get('Location'), path).toBe('/shakespeare')
    }
    const ad = await get('/shakespeare/?utm_source=x')
    expect(ad.headers.get('Location')).toBe('/shakespeare?utm_source=x')
  })

  it('is in the sitemap and llms.txt, and robots.txt neither names nor blocks it', () => {
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://tinct.app/shakespeare</loc>')
    expect(readFileSync('scripts/generate-sitemap.cjs', 'utf8')).toContain('${ORIGIN}/shakespeare')
    expect(readFileSync('public/llms.txt', 'utf8')).toContain('https://tinct.app/shakespeare')
    expect(readFileSync('public/robots.txt', 'utf8')).not.toContain('shakespeare')
  })
})
