/**
 * A text PDF's Tinct text on real pages (converter 2, Anders's phone, 16 Oct 2026):
 * Deutsch's "Constructor Theory" opened as one short paragraph per PDF line, its
 * "1.1 Construction tasks" ran into the text below it, and "constructor" (a label
 * over an equation's arrow) stood alone as a paragraph. The pages are the
 * PDF's own text items, read with the pdf.js Add a book ships
 * (__fixtures__/*.pages.json), turned into lines by pdf-scan.js and into the
 * edition by pdf-text.js, as on a device.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import type { UserBookChapter, UserBookEdition } from './userEdition'
import { PDF_TEXT_CONVERTER } from './userEdition'
import { readPdfTextPlace } from './pdfEditions'
import { pageOfTextPlace } from './pdfAnchors'
import { readUserBookPlace, writeUserBookPlace } from './userBookPlace'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const FIXTURES = fileURLToPath(new URL('./__fixtures__/', import.meta.url))

type Item = [string, number[], number, string]
interface Fixture { pageList: Array<{ n: number; view: number[]; items: Item[] }> }
interface Entry { id: string; label: string; page: number; kind: string; parent: null }
interface Scan { title: string; author: string; textPages: number; entries: Entry[]; language: string }
let fromPages: (pages: unknown[], scan: Scan) => UserBookEdition | null
let textRows: (items: unknown[]) => unknown[]
let converter: number

beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  require(ROOT + 'app/public/lab/addbook/js/pdf-text.js')
  const g = globalThis as unknown as { TinctPdfScan: { textRows: typeof textRows }; TinctPdfText: { fromPages: typeof fromPages; PDF_TEXT_CONVERTER: number } }
  textRows = g.TinctPdfScan.textRows
  fromPages = g.TinctPdfText.fromPages
  converter = g.TinctPdfText.PDF_TEXT_CONVERTER
})

// `renumber`: the kept pages as pages 1, 2, … of a document of their own (no chapters to place).
function pagesOf(name: string, renumber = false) {
  const fixture = JSON.parse(readFileSync(FIXTURES + name, 'utf8')) as Fixture
  return fixture.pageList.map((page, index) => {
    const [x0, y0, x1, y1] = page.view
    const items = page.items.map(([str, transform, width, fontName]) => ({ str, transform, width, fontName }))
    return { n: renumber ? index + 1 : page.n, x0, y0, w: x1 - x0, h: y1 - y0, rows: textRows(items) }
  })
}
const entry = (id: string, label: string, page: number): Entry => ({ id, label, page, kind: 'chapter', parent: null })
// The scan Add a book makes of the whole file (its headings), for the pages kept here.
const constructorScan: Scan = {
  title: 'Constructor Theory', author: 'David Deutsch', textPages: 40, language: 'en',
  entries: [entry('h0', '1. Introduction', 1), entry('h1', '2. Motivations', 7), entry('h3', '4. Conclusion', 39), entry('h4', 'Acknowledgements', 39), entry('h5', 'References', 39)],
}
const paragraphs = (edition: UserBookEdition) => edition.chapters.flatMap(chapter => chapter.paragraphs)
const chapterOf = (edition: UserBookEdition, title: string) => edition.chapters.find(chapter => chapter.title === title)!
const kindOf = (chapter: UserBookChapter, i: number) => chapter.kinds?.[i] ?? null

describe('Constructor Theory, as Tinct text', () => {
  let edition: UserBookEdition
  beforeAll(() => { edition = fromPages(pagesOf('constructor-theory.pages.json'), constructorScan)! })

  it('is made under the rules this app reads', () => {
    expect(converter).toBe(PDF_TEXT_CONVERTER)
    expect(edition.converter).toBe(PDF_TEXT_CONVERTER)
  })

  it('joins the abstract, set in from the margin, into one paragraph (not one per PDF line)', () => {
    const abstract = paragraphs(edition).filter(text => text.includes('dichotomy between possible and impossible'))
    expect(abstract).toHaveLength(1)
    expect(abstract[0]).toMatch(/^Constructor theory seeks to express all fundamental scientific theories in terms of a dichotomy between possible and impossible physical transformations – those that can be caused to happen and those that cannot\. This is a departure/)
    expect(abstract[0]).toContain('from initial conditions and laws of motion.')
    expect(abstract[0]).toMatch(/anthropocentric attributes such as knowledge in physical terms\.$/)
    // No paragraph is a lone line of it.
    expect(paragraphs(edition)).not.toContain('cannot. This is a departure from the prevailing conception of')
  })

  it('sets a numbered subheading apart: "1.1 Construction tasks" is a heading, not the start of the text below', () => {
    const intro = chapterOf(edition, '1. Introduction')
    expect(intro.paragraphs[0]).toBe('1.1 Construction tasks')
    expect(kindOf(intro, 0)).toBe('heading')
    expect(intro.paragraphs[1]).toMatch(/^Consider an automated factory for producing goods/)
    const motivations = chapterOf(edition, '2. Motivations')
    expect(motivations.paragraphs[0]).toBe('2.1 Catalysis')
    expect(kindOf(motivations, 0)).toBe('heading')
    const generalising = motivations.paragraphs.indexOf('2.7 Generalising computation')
    expect(generalising).toBeGreaterThan(0)
    expect(kindOf(motivations, generalising)).toBe('heading')
  })

  it('leaves out lettering inside equations and diagrams: the label over an arrow, a table’s cells', () => {
    const all = paragraphs(edition)
    for (const label of ['constructor', 'cell', 'program', '⇓', 'programmable constructor', 'Output', 'Abstract', 'Physical', 'Other', 'construction']) expect(all).not.toContain(label)
    // Equation (1) reads on its own, without the label set over its arrow.
    const one = all.find(text => text.endsWith('(1)'))
    expect(one).toMatch(/^input state of substrate\(s\) ⎯+→ output state of substrate\(s\)\. \(1\)$/)
    // Table 1's cells and caption are not text.
    expect(all.some(text => /Abstract Computation Preparation|Physical Measurement|A classification of constructions/.test(text))).toBe(false)
    // The words around the table stand.
    expect(all.some(text => text.endsWith('So we have the following classification:'))).toBe(true)
  })

  it('keeps an equation’s number with it, and a display formula without its bracket pieces', () => {
    const all = paragraphs(edition)
    expect(all).toContain('input state of substrates → output state of substrates (2)')
    expect(all).not.toContain('(2)')
    expect(all.some(text => /[⎛-⎭]/.test(text))).toBe(false)
  })

  it('joins words broken at a line end, and keeps a hyphen the document uses ("non-" as in "non-zero")', () => {
    const all = paragraphs(edition).join(' ')
    expect(all).toContain('including the non-existence of a universal classical constructor')
    expect(all).not.toMatch(/\p{L}- \p{Ll}/u)
  })

  it('keeps each reference whole: a hanging indent runs on, the next entry starts at the margin', () => {
    const references = chapterOf(edition, 'References')
    expect(references.paragraphs[0]).toBe('Barbour, J. 1999 The End of Time, Weidenfeld and Nicolson.')
    expect(references.paragraphs).toContain('Deutsch, D. & Hayden, P. 2000 Information flow in entangled quantum systems Proc. R. Soc. A456 1759-74.')
    expect(references.paragraphs).toContain('de Grey, A. 2007 in Rae, M. (ed.) Ending Aging St. Martin\'s Press, New York.')
    // The last entry on a page ends there; the next page's first entry starts afresh, and every entry with its author.
    expect(references.paragraphs.some(text => text.startsWith('Deutsch, D. 1985 Quantum theory') && text.endsWith('97-117'))).toBe(true)
    expect(references.paragraphs).toContain('Deutsch, D. 1997 The Fabric of Reality Allen Lane The Penguin Press, London.')
    for (const text of references.paragraphs) expect(text).toMatch(/^(?:[A-Z][\p{L}'’-]+|de Grey|von Neumann),/u)
    // The prose on the same page as the list is untouched by it.
    const conclusion = chapterOf(edition, '4. Conclusion')
    expect(conclusion.paragraphs).toHaveLength(1)
    expect(conclusion.paragraphs[0]).toMatch(/^The principles of constructor theory .* or not is knowledge\.$/)
  })
})

describe('Prose PDFs keep their paragraphs', () => {
  it('The Yellow Wallpaper: each indented paragraph is one, its short one-line paragraphs too', () => {
    const edition = fromPages(pagesOf('yellow-wallpaper.pages.json', true), { title: 'The Yellow Wallpaper', author: 'Charlotte Perkins Gilman', textPages: 2, entries: [], language: 'en' })!
    const all = paragraphs(edition)
    expect(all[0]).toBe('It is very seldom that mere ordinary people like John and myself secure ancestral halls for the summer.')
    expect(all).toContain('Personally, I disagree with their ideas.')
    expect(all).toContain('Personally, I believe that congenial work, with excitement and change, would do me good.')
    expect(all).toContain('But what is one to do?')
    expect(all).toContain('My brother is also a physician, and also of high standing, and he says the same thing.')
    expect(all).toContain('So I take phosphates or phosphites—whichever it is, and tonics, and journeys, and air, and exercise, and am absolutely forbidden to “work” until I am well again.')
    expect(all.length).toBeGreaterThanOrEqual(35)
  })

  it('MacKay: a block set in from the page’s margin is read as paragraphs, and a sentence beside a figure caption stays', () => {
    const edition = fromPages(pagesOf('mackay.pages.json', true), { title: 'Information Theory', author: 'David MacKay', textPages: 2, entries: [], language: 'en' })!
    const all = paragraphs(edition)
    const first = all.find(text => text.startsWith('a source bit is flipped.'))!
    expect(first).toContain('are all seven bits equally likely to be corrupted when the noise vector has weight two?')
    expect(first).toMatch(/simply three sevenths of the probability of block error\.$/)
    expect(all.join(' ')).toContain('we start from the parity-check matrix')
    expect(all.some(text => text.startsWith('{a, e, i, o, u}, then'))).toBe(true)
  })
})

describe('A place read under the earlier rules', () => {
  const HEX = 'c'.repeat(64)
  const store = new Map<string, string>()
  beforeAll(() => {
    ;(globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    } as Storage
  })

  it.each([1, 3])('moves from converter %s to the same words on the same PDF page', oldConverter => {
    store.clear()
    const edition = fromPages(pagesOf('constructor-theory.pages.json'), constructorScan)!
    // The same words as converter 1 kept them: the abstract one short paragraph per PDF line (ten words here).
    const first = edition.chapters[0]
    const pieces: string[] = [], pages: number[] = []
    first.paragraphs.forEach((text, i) => {
      const words = text.split(/\s+/)
      for (let at = 0; at < words.length; at += 10) { pieces.push(words.slice(at, at + 10).join(' ')); pages.push(first.pages![i]) }
    })
    const previous: UserBookEdition = { ...edition, converter: oldConverter, chapters: [{ number: 1, title: first.title, paragraphs: pieces, pages }, ...edition.chapters.slice(1)] }
    // Read at "cannot." in the old text.
    const old = pieces.findIndex(text => text.split(/\s+/).includes('cannot.'))
    const word = pieces[old].split(/\s+/).indexOf('cannot.')
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: old, wordIndex: word, updatedAt: 500, converter: oldConverter })
    const at = pageOfTextPlace(previous.chapters, { chapterNumber: 1, paragraphIndex: old, wordIndex: word })!
    expect(at.page).toBe(1)
    const place = readPdfTextPlace(HEX, edition, { previous })!
    expect(place).toMatchObject({ chapterNumber: 1, converter: PDF_TEXT_CONVERTER, updatedAt: 500 })
    const words = edition.chapters[0].paragraphs[place.paragraphIndex].split(/\s+/)
    expect(words[place.wordIndex]).toBe('cannot.')
    // Kept under the new rules: the next open reads it as it is.
    expect(readUserBookPlace(HEX, edition)).toMatchObject({ paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex, converter: PDF_TEXT_CONVERTER })
    expect(readPdfTextPlace(HEX, edition)).toMatchObject({ paragraphIndex: place.paragraphIndex, wordIndex: place.wordIndex })
  })

  it('without the old conversion at hand, its indices are not read into the new text', () => {
    const edition = fromPages(pagesOf('constructor-theory.pages.json'), constructorScan)!
    store.clear()
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 3, wordIndex: 4, updatedAt: 500, converter: 1 })
    expect(readPdfTextPlace(HEX, edition)).toBeNull()
  })
})

describe('Registered books are untouched', () => {
  // Conversion and Original page rendering both use pdf.js, but only the
  // owned-file conversion path loads the source-to-prose rules (pdf-text.js).
  it('limits PDF conversion and page-engine entry points to the reader’s own file paths', async () => {
    const { readdirSync, statSync } = await import('node:fs')
    const SRC = fileURLToPath(new URL('../../', import.meta.url))
    const files: string[] = []
    const walk = (dir: string) => { for (const name of readdirSync(dir)) { const path = dir + '/' + name; if (statSync(path).isDirectory()) { if (name !== '__fixtures__' && name !== 'node_modules') walk(path) } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) files.push(path) } }
    walk(SRC.replace(/\/$/, ''))
    const source = (pattern: RegExp) => files.filter(path => pattern.test(readFileSync(path, 'utf8')))
      .map(path => path.slice(SRC.length).replace(/^\//, '')).sort()
    expect(source(/js\/pdf-text\.js\?v=|\bconvertPdf\(|import\('\.\/pdfEdition'\)/)).toEqual(['lab/userBook/pdfEdition.ts', 'lab/userBook/userBookStore.ts'])
    expect(source(/\bloadPdfEngine\(/)).toEqual([
      'lab/sharedReader/pdf/PdfOriginalReaderShell.tsx', 'lab/sharedReader/pdf/PdfOriginalSurface.tsx',
      // Original figures use the same raw page engine/detector; they never invoke source-to-prose conversion.
      'lab/sharedReader/pdf/pdfOriginalFigures.ts',
      'lab/userBook/pdfEdition.ts', 'lab/userBook/usePdfOriginalServices.ts',
    ])
  })
})

describe('The title of a paper whose running heads repeat it (Constructor Theory, 16 Oct 2026)', () => {
  it('reads the printed title, large on page 1, though every page’s head repeats it, and prefers it to a longer metadata title', () => {
    const api = (globalThis as unknown as { TinctPdfScan: { printedTitle: (pages: unknown[], isFurniture: unknown) => { title: string | null; author: string | null }; furniture: (pages: unknown[]) => unknown; sameTitleLonger: (meta: string | null, printed: string | null) => string | null } }).TinctPdfScan
    const pages = pagesOf('constructor-theory.pages.json').slice(0, 2).map(page => ({ ...page }))
    expect(api.printedTitle(pages, api.furniture(pages)).title).toBe('Constructor Theory')
    // The PDF's metadata title is "Constructor Theory Philosophy" (a journal section after it).
    expect(api.sameTitleLonger('Constructor Theory Philosophy', 'Constructor Theory')).toBeNull()
    expect(api.sameTitleLonger('Attention Is All You Need', 'Attention Is All You Need')).toBe('Attention Is All You Need')
    expect(api.sameTitleLonger('The Yellow Wallpaper', null)).toBe('The Yellow Wallpaper')
    expect(api.sameTitleLonger('A Treatise', 'Notes')).toBe('A Treatise')
  })
})
