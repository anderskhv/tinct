import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  paragraphPlainText,
  renderParagraph,
  renderScenePages,
  READER_CSS_PLACEHOLDER,
  SCENE_PAGE_BOOKS,
  SCENE_SLUG_RE,
  sceneAssetPlaceholder,
  scenePageDescription,
  scenePageTitle,
  sceneSlug,
  type Edition,
} from './scenePages'
import { curlyQuotes } from './bookStructure'
import { parseSceneHandoff } from '../lab/labSceneHandoff'
import manifest from '../data/scenePages.generated.json'

const edition = (bookId: string, key: string): Edition => JSON.parse(readFileSync(`public/data/editions/${bookId}-${key}.json`, 'utf8'))
const BOOKS = { hamlet: 'Hamlet', macbeth: 'Macbeth', 'romeo-and-juliet': 'Romeo and Juliet', 'julius-caesar': 'Julius Caesar', othello: 'Othello' } as const
const book = (id: keyof typeof BOOKS) => ({ id, title: BOOKS[id], author: 'William Shakespeare' })
const lines = (id: string) => { try { return JSON.parse(readFileSync(`public/data/editions/${id}-lines.json`, 'utf8')) } catch { return null } }
const pagesOf = (id: keyof typeof BOOKS) => renderScenePages({ book: book(id), modern: edition(id, 'modern-en'), original: edition(id, 'original-en'), originalLines: lines(id) })

describe('scene addresses', () => {
  it('names a scene by act and scene, never by chapter number', () => {
    expect(sceneSlug('Act 3, Scene 1 — A Room in the Castle')).toBe('act-3-scene-1')
    expect(sceneSlug('Prologue')).toBe('prologue')
    expect(sceneSlug('Act 2, Prologue')).toBe('act-2-prologue')
    expect(() => sceneSlug('Chapter 8')).toThrow()
    expect(SCENE_SLUG_RE.test('chapter-8')).toBe(false)
  })

  it('titles and describes the scene as the brief asks', () => {
    // Titles and descriptions by search intent (Anders, 19 Nov 2026, docs/seo-brief-2026-11-19.md §3).
    expect(scenePageTitle(book('hamlet'), 'Act 3, Scene 1 — A Room in the Castle', 4)).toBe('Hamlet, Act 3, Scene 1 of 4: full text in modern English | Tinct')
    const description = scenePageDescription(book('hamlet'), 'Act 3, Scene 1 — A Room in the Castle')
    expect(description).toBe('Read Act 3, Scene 1 of Hamlet free, in modern English beside the original. No sign-up.')
    expect(description.length).toBeLessThanOrEqual(155)
  })

  it('the committed manifest is what the editions give (rebuild with scripts/seo/build-scene-pages.mjs)', () => {
    const books = (manifest as { books: Record<string, Array<{ chapter: number; slug: string; title: string }>> }).books
    expect(Object.keys(books)).toEqual([...SCENE_PAGE_BOOKS])
    for (const id of SCENE_PAGE_BOOKS) {
      expect(books[id]).toEqual(edition(id, 'modern-en').chapters.map(chapter => ({ chapter: chapter.number, slug: sceneSlug(chapter.title), title: chapter.title })))
    }
  })
})

describe('scene page text', () => {
  // Byte for byte but for the quotes: the Modern English is set with typographer's quotes since 19 Nov 2026 (brief §2).
  it.each(SCENE_PAGE_BOOKS)('%s: every scene carries its whole modern text, byte for byte, as real HTML', id => {
    const modern = edition(id, 'modern-en')
    const pages = pagesOf(id)
    expect(pages).toHaveLength(modern.chapters.length)
    for (const [index, page] of pages.entries()) {
      const chapter = modern.chapters[index]
      const doc = new JSDOM(page.html).window.document
      const stage = doc.querySelector('[data-scene-modern]')!
      const paragraphs = [...stage.querySelectorAll('p[data-p]')]
      expect(paragraphs.map(p => p.textContent)).toEqual(chapter.paragraphs.map(text => paragraphPlainText(curlyQuotes(text))))
      // Emphasis marks are the only bytes the page draws differently (as <em>), as the reader does.
      for (const [at, text] of chapter.paragraphs.entries()) {
        if (!text.includes('_')) expect(paragraphs[at].textContent).toBe(curlyQuotes(text))
      }
      // "Act 3, Scene 1 of 4" in the heading, the place under it.
      const [scene, place] = chapter.title.split(' — ')
      expect(doc.querySelector('h1')!.textContent).toMatch(new RegExp(`^${scene}( of \\d+)?$`))
      if (place) expect(doc.querySelector('.chapter-name')!.textContent).toBe(place)
      expect(doc.querySelectorAll('h1')).toHaveLength(1)
      expect(doc.title).toBe(`${BOOKS[id]}, ${doc.querySelector('h1')!.textContent}: full text in modern English | Tinct`)
      // The first scene is the play's book page (/read/{play}), so it points there.
      expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(index === 0 ? `https://tinct.app/read/${id}` : `https://tinct.app/read/${id}/${page.slug}`)
      // No Listen, anywhere.
      expect(page.html).not.toMatch(/lab-v2-play|aria-label="(?:Listen|Play)/)
      expect(page.html).toContain(READER_CSS_PLACEHOLDER)
      expect(page.html).toContain(sceneAssetPlaceholder('scene-page.js'))
    }
  })

  it('sets speakers as the reader does: the label in its own run, the speech after it', () => {
    const hamlet = edition('hamlet', 'modern-en').chapters[7]
    const doc = new JSDOM(pagesOf('hamlet')[7].html).window.document
    const king = doc.querySelector('#lab-p-1')!
    expect(king.querySelector('.lab-speech-run .lab-verse-speaker')!.textContent).toBe('KING.')
    expect(king.querySelector('.lab-verse-dialogue')!.textContent!.trim()).toBe(curlyQuotes(hamlet.paragraphs[1]).replace(/^KING\. /, ''))
  })

  it('draws emphasis as <em> and keeps the words in place', () => {
    const html = renderParagraph('PORTER. _Knock, knock._ Who is there?', 4)
    expect(html).toContain('<em>Knock,</em> <em>knock.</em>')
    expect(new JSDOM(`<body>${html}</body>`).window.document.querySelector('p')!.textContent).toBe('PORTER. Knock, knock. Who is there?')
  })

  // Since 19 Nov 2026 (brief §2) the original sits beside the Modern English (Both, the desktop default for the
  // plays), in the HTML, with a switch; it was collapsed below.
  it('sets the original beside the modern text, with the verse lines where the reader has them (Hamlet)', () => {
    const page = pagesOf('hamlet')[7]
    const doc = new JSDOM(page.html).window.document
    expect(doc.querySelector('[data-scene-page]')!.getAttribute('data-view')).toBe('both')
    const column = doc.querySelector('.chapter-col-original')!
    expect(column.querySelector('.chapter-col-head')!.textContent).toBe("Shakespeare's original")
    const original = edition('hamlet', 'original-en').chapters[7]
    expect([...column.querySelectorAll('p[id^="orig-p-"]')].map(p => p.textContent)).toEqual(original.paragraphs.map(paragraphPlainText))
    expect(column.querySelectorAll('.lab-verse-line').length).toBeGreaterThan(50)
    expect([...doc.querySelectorAll('.chapter-view-switch.is-desk button')].map(b => `${b.textContent}:${b.getAttribute('aria-pressed')}`)).toEqual(['Original:false', 'Modern:false', 'Both:true'])
    expect([...doc.querySelectorAll('.chapter-view-switch.is-phone button')].map(b => b.textContent)).toEqual(['Modern English', 'Original'])
    // The modern text leads: it comes first in the document.
    expect(page.html.indexOf('class="chapter-col chapter-col-modern')).toBeLessThan(page.html.indexOf('class="chapter-col chapter-col-original'))
  })

  it('links the neighbouring scene pages and hands every reader action over at this scene', () => {
    const pages = pagesOf('hamlet')
    const doc = new JSDOM(pages[7].html).window.document
    expect(doc.querySelector('a[rel="prev"]')!.getAttribute('href')).toBe('/read/hamlet/act-2-scene-2')
    expect(doc.querySelector('a[rel="next"]')!.getAttribute('href')).toBe('/read/hamlet/act-3-scene-2')
    expect(new JSDOM(pages[0].html).window.document.querySelector('a[rel="prev"]')).toBeNull()
    // The first scene's address is the play's book page.
    expect(new JSDOM(pages[1].html).window.document.querySelector('a[rel="prev"]')!.getAttribute('href')).toBe('/read/hamlet')
    const hrefs = Object.fromEntries([...doc.querySelectorAll('a[data-scene-action]')].map(a => [`${a.getAttribute('data-scene-action')}:${a.textContent}`, a.getAttribute('href')!]))
    expect(hrefs['primer:✧Primer for Act 3, Scene 1']).toBe('/reader?book=hamlet&chapter=8&edition=modern-en#scene=primer')
    expect(hrefs['quiz:✧Quiz me']).toBe('/reader?book=hamlet&chapter=8&edition=modern-en#scene=quiz')
    const last = edition('hamlet', 'modern-en').chapters[7].paragraphs.length - 1
    expect(hrefs['recap:✧Recap']).toBe(`/reader?book=hamlet&chapter=8&edition=modern-en&paragraph=${last}#scene=recap`)
    for (const href of Object.values(hrefs)) expect(parseSceneHandoff(new URL(href, 'https://tinct.app').hash)).not.toBeNull()
    // The margin, top to bottom: the reader's first-visit hint and its one Primer link (Anders, 16 Nov 2026), then the ask field.
    const margin = doc.querySelector('.scene-margin')!
    expect(margin.querySelector('.lab-first-hint-text')!.textContent).toBe('Highlight any passage to have it explained, simplified, or to ask about it.')
    expect([...margin.querySelectorAll('.lab-start-acts a')].map(a => a.textContent)).toEqual(['✧Primer for Act 3, Scene 1'])
    expect(margin.querySelector('textarea')!.getAttribute('placeholder')).toBe('Or ask about this scene')
    const order = ['lab-first-hint-text', 'lab-start-acts', 'scene-ask-form'].map(name => margin.innerHTML.indexOf(name))
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    // The scene end: Continue reading, then Recap and Quiz me, then the neighbours.
    expect(doc.querySelector('.chapter-continue-link')!.textContent).toBe('Continue reading: Act 3, Scene 2 of 4 →')
    const end = ['chapter-continue', 'lab-chapter-end', 'scene-turns'].map(name => pages[7].html.indexOf(`class="${name}`))
    expect([...end].sort((a, b) => a - b)).toEqual(end)
  })
})

describe('the play\'s book page', () => {
  const pages = renderScenePages({ book: book('hamlet'), modern: edition('hamlet', 'modern-en'), original: edition('hamlet', 'original-en'), originalLines: lines('hamlet'), bookPage: { source: { kind: 'english-original', author: 'William Shakespeare' } } })
  const doc = new JSDOM(pages[0].html).window.document

  it('is the first scene under the play\'s header, with the scene list below, at /read/{play}', () => {
    expect(pages[0].chapterNumber).toBe(0)
    expect(doc.title).toBe('Read Hamlet online free, scene by scene in modern English | Tinct')
    expect(doc.querySelector('meta[name="description"]')!.getAttribute('content')).toBe("Hamlet has 5 acts and 20 scenes. Read the full text free online in modern English beside William Shakespeare's original. No sign-up, no ads.")
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://tinct.app/read/hamlet')
    expect(doc.querySelector('h1')!.textContent).toBe('Hamlet')
    expect(doc.querySelector('#book-structure')!.textContent).toBe('5 acts · 20 scenes')
    expect(doc.querySelector('h2.lab-passage-headline')!.textContent).toBe('Act 1, Scene 1 of 5')
    const list = [...doc.querySelectorAll('#chapters ol > li > a')]
    expect(list).toHaveLength(20)
    expect(list[0].getAttribute('href')).toBe('/read/hamlet')
    expect(list[1].getAttribute('href')).toBe('/read/hamlet/act-1-scene-2')
  })
})
