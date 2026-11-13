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
    expect(scenePageTitle(book('hamlet'), 'Act 3, Scene 1 — A Room in the Castle')).toBe('Hamlet, Act 3, Scene 1 in modern English | Tinct')
    const description = scenePageDescription(book('hamlet'), 'Act 3, Scene 1 — A Room in the Castle')
    expect(description).toBe("Hamlet, Act 3, Scene 1 (A Room in the Castle): the whole scene in a modern-English version, with Shakespeare's original text below it.")
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
  it.each(SCENE_PAGE_BOOKS)('%s: every scene carries its whole modern text, byte for byte, as real HTML', id => {
    const modern = edition(id, 'modern-en')
    const pages = pagesOf(id)
    expect(pages).toHaveLength(modern.chapters.length)
    for (const [index, page] of pages.entries()) {
      const chapter = modern.chapters[index]
      const doc = new JSDOM(page.html).window.document
      const stage = doc.querySelector('[data-scene-modern]')!
      const paragraphs = [...stage.querySelectorAll('p[data-p]')]
      expect(paragraphs.map(p => p.textContent)).toEqual(chapter.paragraphs.map(paragraphPlainText))
      // Emphasis marks are the only bytes the page draws differently (as <em>), as the reader does.
      for (const [at, text] of chapter.paragraphs.entries()) {
        if (!text.includes('_')) expect(paragraphs[at].textContent).toBe(text)
      }
      expect(doc.querySelector('h1')!.textContent).toBe(chapter.title)
      expect(doc.querySelectorAll('h1')).toHaveLength(1)
      expect(doc.title).toBe(`${BOOKS[id]}, ${chapter.title.split(' — ')[0]} in modern English | Tinct`)
      expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(`https://tinct.app/read/${id}/${page.slug}`)
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
    expect(king.querySelector('.lab-verse-dialogue')!.textContent!.trim()).toBe(hamlet.paragraphs[1].replace(/^KING\. /, ''))
  })

  it('draws emphasis as <em> and keeps the words in place', () => {
    const html = renderParagraph('PORTER. _Knock, knock._ Who is there?', 4)
    expect(html).toContain('<em>Knock,</em> <em>knock.</em>')
    expect(new JSDOM(`<body>${html}</body>`).window.document.querySelector('p')!.textContent).toBe('PORTER. Knock, knock. Who is there?')
  })

  it('keeps the original collapsed below, with the verse lines where the reader has them (Hamlet)', () => {
    const page = pagesOf('hamlet')[7]
    const doc = new JSDOM(page.html).window.document
    const details = doc.querySelector('details.scene-original')!
    expect(details.hasAttribute('open')).toBe(false)
    expect(details.querySelector('summary')!.textContent).toBe("Shakespeare's original text of this scene")
    const original = edition('hamlet', 'original-en').chapters[7]
    expect([...details.querySelectorAll('p[data-p]')].map(p => p.textContent)).toEqual(original.paragraphs.map(paragraphPlainText))
    expect(details.querySelectorAll('.lab-verse-line').length).toBeGreaterThan(50)
    // The modern text leads: it comes first in the document.
    expect(page.html.indexOf('data-scene-modern=')).toBeLessThan(page.html.indexOf('class="scene-original'))
  })

  it('links the neighbouring scene pages and hands every reader action over at this scene', () => {
    const pages = pagesOf('hamlet')
    const doc = new JSDOM(pages[7].html).window.document
    expect(doc.querySelector('a[rel="prev"]')!.getAttribute('href')).toBe('/read/hamlet/act-2-scene-2')
    expect(doc.querySelector('a[rel="next"]')!.getAttribute('href')).toBe('/read/hamlet/act-3-scene-2')
    expect(new JSDOM(pages[0].html).window.document.querySelector('a[rel="prev"]')).toBeNull()
    const hrefs = Object.fromEntries([...doc.querySelectorAll('a[data-scene-action]')].map(a => [`${a.getAttribute('data-scene-action')}:${a.textContent}`, a.getAttribute('href')!]))
    expect(hrefs['primer:✧Primer']).toBe('/reader?book=hamlet&chapter=8&edition=modern-en#scene=primer')
    expect(hrefs['summary:✧Summary']).toBe('/reader?book=hamlet&chapter=8&edition=modern-en#scene=summary')
    expect(hrefs['quiz:✧Quiz me']).toBe('/reader?book=hamlet&chapter=8&edition=modern-en#scene=quiz')
    const last = edition('hamlet', 'modern-en').chapters[7].paragraphs.length - 1
    expect(hrefs['recap:✧Recap']).toBe(`/reader?book=hamlet&chapter=8&edition=modern-en&paragraph=${last}#scene=recap`)
    for (const href of Object.values(hrefs)) expect(parseSceneHandoff(new URL(href, 'https://tinct.app').hash)).not.toBeNull()
    // The margin, top to bottom, in the approved order.
    const margin = doc.querySelector('.scene-margin')!
    expect(margin.querySelector('.source-margin-label')!.textContent).toBe('Hamlet in modern English · Act 3, Scene 1')
    expect(margin.textContent).toContain('Highlight any passage to have it explained, simplified, or to ask about it.')
    expect(margin.querySelector('textarea')!.getAttribute('placeholder')).toBe('Or ask about this scene')
    const order = ['source-margin-label', 'scene-welcome', 'scene-bar-picture', 'scene-ask-form', 'lab-start-acts'].map(name => margin.innerHTML.indexOf(name))
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    // The scene end: Recap and Quiz me, then the neighbours, then the original.
    const end = ['lab-chapter-end', 'scene-turns', 'scene-original'].map(name => pages[7].html.indexOf(`class="${name}`))
    expect([...end].sort((a, b) => a - b)).toEqual(end)
  })
})
