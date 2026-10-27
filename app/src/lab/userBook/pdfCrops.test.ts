/**
 * Tinct text with page crops (converter 3, Anders 16 Oct 2026): a PDF's displayed formulas,
 * figures and tables stand in the text as pictures cut from their page, where they sit, their
 * captions beneath them, their own text out of the running text. The regions come from the
 * viewer's rules (pdf-regions.js displayFormulas, margin.js findFigures, shared); the placement
 * from pdf-text.js. Real pages of Deutsch's "Constructor Theory" (the PDF's own text items, read
 * with Add a book's pdf.js: __fixtures__/constructor-theory.pages.json).
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import type { UserBookEdition } from './userEdition'
import { PDF_TEXT_CONVERTER } from './userEdition'
import { FIGURE_MARK, figureName, figurePlacement, figureReadingText } from '../labFigures'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const FIXTURES = fileURLToPath(new URL('./__fixtures__/', import.meta.url))

type Box = { x: number; y: number; w: number; h: number }
type Region = Box & { kind: string; label?: string; caption?: string; captionBox?: Box; id?: string; css?: { width: number; height: number } }
interface Regions {
  displayFormulas: (body: Array<{ x: number; base: number; size: number; w: number; str: string }>, vp: { width: number; height: number }) => { blocks: Array<Box & { members: Array<{ str: string }> }> }
  pageRegions: (input: { figures?: unknown[]; captions?: unknown[]; blocks?: unknown[] }) => Region[]
  textLines: (body: Array<{ x: number; base: number; size: number; w: number; str: string }>, vp: { width: number; height: number }) => unknown[]
  trimRegions: (regions: Region[], lines: unknown[]) => Region[]
  cropSize: (region: Region, page: { w: number; h: number }, options: { dpr: number; column: number }) => { width: number; height: number; css: { width: number; height: number } } | null
  MAX_SIDE: number
}
let regions: Regions
let fromPages: (pages: unknown[], scan: unknown) => UserBookEdition | null
let textRows: (items: unknown[]) => unknown[]

beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  require(ROOT + 'app/public/lab/addbook/js/pdf-text.js')
  require(ROOT + 'app/public/lab/addbook/js/pdf-regions.js')
  const g = globalThis as unknown as { TinctPdfScan: { textRows: typeof textRows }; TinctPdfText: { fromPages: typeof fromPages }; TinctPdfRegions: Regions }
  regions = g.TinctPdfRegions
  textRows = g.TinctPdfScan.textRows
  fromPages = g.TinctPdfText.fromPages
})

type Item = [string, number[], number, string]
interface Fixture { pageList: Array<{ n: number; view: number[]; items: Item[] }> }
const fixture = () => JSON.parse(readFileSync(FIXTURES + 'constructor-theory.pages.json', 'utf8')) as Fixture
const pageOf = (n: number) => fixture().pageList.find(page => page.n === n)!
/** A page's text items as the viewer and the crops read them: viewport pixels at `scale` (pdf.js Util.transform). */
function bodyOf(n: number, scale = 1) {
  const page = pageOf(n), [x0, , , y1] = page.view
  const vp = { width: (page.view[2] - x0) * scale, height: (y1 - page.view[1]) * scale }
  const body = page.items.map(([str, t, width]) => {
    const tx = [t[0] * scale, -t[1] * scale, t[2] * scale, -t[3] * scale, (t[4] - x0) * scale, (y1 - t[5]) * scale]
    return { x: tx[4], base: tx[5], size: Math.hypot(tx[2], tx[3]), w: width * scale, str }
  })
  return { body, vp }
}
function pagesWith(extra: Record<number, Region[]>) {
  return fixture().pageList.map(page => {
    const [x0, y0, x1, y1] = page.view
    const rows = textRows(page.items.map(([str, transform, width, fontName]) => ({ str, transform, width, fontName })))
    return { n: page.n, x0, y0, w: x1 - x0, h: y1 - y0, rows, ...(extra[page.n] ? { regions: extra[page.n] } : {}) }
  })
}
const scan = {
  title: 'Constructor Theory', author: 'David Deutsch', textPages: 40, language: 'en',
  entries: [{ id: 'h0', label: '1. Introduction', page: 1, kind: 'chapter', parent: null }, { id: 'h1', label: '2. Motivations', page: 7, kind: 'chapter', parent: null }, { id: 'h3', label: '4. Conclusion', page: 39, kind: 'chapter', parent: null }, { id: 'h5', label: 'References', page: 39, kind: 'chapter', parent: null }],
}
const withIds = (n: number, list: Region[]) => list.map((region, k) => ({ ...region, id: `p${n}-${k + 1}`, css: regions.cropSize(region, { w: 595.29, h: 841.89 }, { dpr: 3, column: 358 })!.css }))
const paragraphs = (edition: UserBookEdition) => edition.chapters.flatMap(chapter => chapter.paragraphs)
const figures = (edition: UserBookEdition) => edition.chapters.flatMap(chapter => chapter.figures ?? [])

describe('Where a page’s formulas are (the viewer’s rule, shared)', () => {
  it('finds formula (9) on page 14 as a displayed formula, and none in its running text', () => {
    const { body, vp } = bodyOf(14)
    const { blocks } = regions.displayFormulas(body, vp)
    const texts = blocks.map(block => block.members.map(member => member.str).join(' ').replace(/\s+/g, ' '))
    expect(texts).toHaveLength(1)
    expect(texts[0]).toMatch(/\{ x → Π \( x \) \}.*\( 9 \)/)
    expect(blocks[0].y).toBeGreaterThan(0.1)
    expect(blocks[0].y + blocks[0].h).toBeLessThan(0.2)
  })

  it('leaves a formula written in words to the text (page 2’s (1) and (2)), its number with it', () => {
    const { body, vp } = bodyOf(2)
    const { blocks } = regions.displayFormulas(body, vp)
    expect(blocks.some(block => block.members.some(member => /input state/.test(member.str)))).toBe(false)
    // "(2)", far right of its words, is found as a piece of a formula; alone it is none.
    expect(regions.pageRegions({ blocks })).toEqual([])
  })
})

describe('A page’s regions and their crops', () => {
  it('takes captioned figures and tables with their labels, sizeable uncaptioned pictures, and formulas outside them', () => {
    const found = regions.pageRegions({
      figures: [{ x: 0.3, y: 0.38, w: 0.42, h: 0.12 }, { x: 0.1, y: 0.1, w: 0.05, h: 0.02 }, { x: 0.1, y: 0.6, w: 0.5, h: 0.2 }],
      captions: [{ kind: 'table', n: '1', label: 'Table 1', text: 'Table 1: A classification of constructions', fig: 0, box: { x: 0.35, y: 0.72, w: 0.3, h: 0.02 } }],
      blocks: [{ x: 0.2, y: 0.25, w: 0.6, h: 0.03 }, { x: 0.35, y: 0.4, w: 0.2, h: 0.03 }],
    })
    expect(found.map(region => region.kind)).toEqual(['equation', 'table', 'figure'])
    expect(found[1]).toMatchObject({ label: 'Table 1', caption: 'Table 1: A classification of constructions', captionBox: { x: 0.35 } })
    // The mark of 5% by 2% is no figure; the formula inside the table is the table's.
    expect(found).toHaveLength(3)
    for (const region of found) { expect(region.x).toBeGreaterThanOrEqual(0); expect(region.x + region.w).toBeLessThanOrEqual(1) }
  })

  it('refuses what only looks like a formula: an equation’s number alone, a word split off a line of prose, a title page’s names, a numbered heading', () => {
    const at = { x: 0.2, w: 0.3, h: 0.03 }
    const found = regions.pageRegions({ blocks: [
      { ...at, y: 0.1, members: [{ str: '(' }, { str: '2' }, { str: ')' }] },
      { ...at, y: 0.2, members: [{ str: 'below)' }, { str: '.' }] },
      { ...at, y: 0.3, members: [{ str: 'Llion Jones∗' }, { str: 'Aidan N. Gomez∗ †' }, { str: 'Google Research' }] },
      { ...at, y: 0.35, members: [{ str: '3.12' }, { str: 'Time' }] },
      { ...at, y: 0.4, members: [{ str: 'Attention(Q, K, V ) = softmax(' }, { str: 'QK' }, { str: 'T' }, { str: '√' }, { str: 'd' }, { str: ')V' }, { str: '(1)' }] },
    ] })
    expect(found.map(region => region.y + 0.004)).toEqual([0.4])
  })

  it('trims several bottom source-note lines from a captioned chart instead of discarding its plot', () => {
    const lines=[.81,.84,.87].map(y=>({x:.12,y,w:.7,h:.02,text:'A source note with enough words to describe the chart.',words:12,letters:1}))
    const kept=regions.trimRegions([{kind:'figure',x:.1,y:.5,w:.8,h:.4,captionBox:{x:.1,y:.5,w:.4,h:.03}}],lines)
    expect(kept).toHaveLength(1)
    expect(kept[0].y).toBeGreaterThan(.53)
    expect(kept[0].y+kept[0].h).toBeLessThan(.81)
  })
  it('keeps a figure off the prose around it, a caption out of its crop, and a formula whole across its line', () => {
    const line = (y: number, words: number, x = 0.1, w = 0.8, text = Array.from({ length: words }, () => 'word').join(' ')) => ({ x, y, w, h: 0.012, text, words, letters: 1 })
    const lines = [line(0.30, 12), line(0.62, 12), line(0.64, 12), line(0.40, 4, 0.3, 0.4, 'BLEU Training Cost (FLOPs)'), line(0.36, 9, 0.1, 0.8, 'Table 2: The Transformer achieves better BLEU scores than'), line(0.375, 1, 0.1, 0.1, 'cost.'), line(0.8, 3, 0.1, 0.3, 'Attention(Q, K, V) = softmax(')]
    const kept = regions.trimRegions([
      // A table whose box runs into a footnote's first two lines below it, its caption above it reaching into its header.
      { kind: 'table', x: 0.1, y: 0.35, w: 0.8, h: 0.31, captionBox: { x: 0.1, y: 0.355, w: 0.8, h: 0.06 } },
      // A figure over a page of prose: none.
      { kind: 'figure', x: 0.05, y: 0.25, w: 0.9, h: 0.45 },
      // The right part of a formula whose start is on the same line.
      { kind: 'equation', x: 0.45, y: 0.795, w: 0.2, h: 0.025 },
    ], lines)
    expect(kept.map(region => region.kind)).toEqual(['table', 'equation'])
    const [table, equation] = kept
    // The caption ends at its sentence ("cost."); the header is the table's; the footnote is cut off.
    expect(table.captionBox!.y + table.captionBox!.h).toBeCloseTo(0.387, 3)
    expect(table.y).toBeGreaterThan(0.387)
    expect(table.y).toBeLessThan(0.40)
    expect(table.y + table.h).toBeLessThan(0.62)
    expect(equation.x).toBeLessThan(0.1)
    expect(equation.x + equation.w).toBeGreaterThanOrEqual(0.65)
    // A formula a line of prose runs through is none.
    expect(regions.trimRegions([{ kind: 'equation', x: 0.4, y: 0.298, w: 0.2, h: 0.02 }], lines)).toEqual([])
  })

  it('reads a page’s lines of text with their words', () => {
    const { body, vp } = bodyOf(14)
    const found = regions.textLines(body, vp) as Array<{ text: string; words: number; y: number }>
    const line = found.find(item => item.text.startsWith('Theories of information and computation'))!
    expect(line.words).toBeGreaterThanOrEqual(10)
    expect(line.y).toBeGreaterThan(0.2)
    expect(line.y).toBeLessThan(0.3)
  })

  it('draws a formula at the size of the text around it and a figure across the column, sharp at the device’s pixel ratio', () => {
    const page = { w: 595.29, h: 841.89 }
    const equation = regions.cropSize({ kind: 'equation', x: 0.2, y: 0.3, w: 0.3, h: 0.03 }, page, { dpr: 3, column: 358 })!
    expect(equation.css.width).toBe(Math.round(0.3 * page.w * 1.4))
    expect(equation.width).toBe(equation.css.width * 3)
    const wide = regions.cropSize({ kind: 'equation', x: 0.1, y: 0.3, w: 0.8, h: 0.03 }, page, { dpr: 2, column: 358 })!
    expect(wide.css.width).toBe(358)
    const figure = regions.cropSize({ kind: 'figure', x: 0.1, y: 0.3, w: 0.8, h: 0.4 }, page, { dpr: 3, column: 680 })!
    expect(figure.css.width).toBe(680)
    // Never more than 1568 pixels on its long side.
    expect(Math.max(figure.width, figure.height)).toBeLessThanOrEqual(regions.MAX_SIDE)
    expect(figure.width / figure.height).toBeCloseTo((0.8 * page.w) / (0.4 * page.h), 1)
  })
})

describe('Constructor Theory with its formulas and its table as crops', () => {
  let edition: UserBookEdition
  beforeAll(() => {
    // Page 14: formula (9), found by the viewer's rule, and Table 1 (its cells and its caption) as findFigures boxes it.
    const nine = regions.pageRegions({ blocks: regions.displayFormulas(bodyOf(14).body, bodyOf(14).vp).blocks })
    const table: Region = { kind: 'table', x: 0.33, y: 0.585, w: 0.39, h: 0.125, label: 'Table 1', caption: 'Table 1: A classification of constructions', captionBox: { x: 0.345, y: 0.715, w: 0.32, h: 0.022 } }
    edition = fromPages(pagesWith({ 14: withIds(14, [...nine, table]) }), scan)!
  })

  it('stands each crop where it sits, a paragraph of its own between the text before and after it', () => {
    expect(edition.converter).toBe(PDF_TEXT_CONVERTER)
    const chapter = edition.chapters.find(item => item.title === '2. Motivations')!
    const nine = chapter.figures!.find(figure => figure.label === 'Equation (9)')!
    const at = chapter.paragraphs.indexOf(FIGURE_MARK + nine.id)
    expect(at).toBeGreaterThan(0)
    expect(chapter.paragraphs[at - 1]).toBe('Constructor theory is the ultimate generalisation of the idea of catalysis.')
    expect(chapter.paragraphs[at + 1]).toBe('Implicitly, defining such media defines information itself.')
    expect(chapter.pages![at]).toBe(14)
    const table = chapter.figures!.find(figure => figure.kind === 'table')!
    const atTable = chapter.paragraphs.indexOf(FIGURE_MARK + table.id)
    expect(chapter.paragraphs[atTable - 1]).toMatch(/So we have the following classification:$/)
    expect(chapter.paragraphs[atTable + 1]).toMatch(/^In this paper the term ‘information’ means classical information\./)
  })

  it('takes the formula’s own text out of the running text, keeping it as what is read where it stands', () => {
    const all = paragraphs(edition)
    expect(all.some(text => /x → Π\(x\)|\(9\)$/.test(text))).toBe(false)
    const nine = figures(edition).find(figure => figure.label === 'Equation (9)')!
    expect(nine.alt).toMatch(/\{x → Π\(x\)\}.*\(9\)/)
    expect(nine).toMatchObject({ src: 'asset:' + nine.id, kind: 'equation', fit: 'text' })
    expect(figureReadingText(nine)).toMatch(/^\[Equation \(9\): /)
    // Formulas written in words (page 2) stay text.
    expect(all).toContain('input state of substrates → output state of substrates (2)')
  })

  it('cuts a table out with its caption beneath it, its cells gone from the text', () => {
    const table = figures(edition).find(figure => figure.kind === 'table')!
    expect(table).toMatchObject({ label: 'Table 1', caption: 'Table 1: A classification of constructions', fit: 'column' })
    expect(table.alt).toMatch(/Abstract Computation Preparation/)
    const all = paragraphs(edition)
    expect(all.some(text => /Abstract Computation Preparation|A classification of constructions/.test(text))).toBe(false)
    expect(all.some(text => text.endsWith('So we have the following classification:'))).toBe(true)
    expect(figureName(table)).toBe('Table 1')
  })

  it('numbers the crops in reading order, one id each', () => {
    const list = figures(edition)
    expect(list.map(figure => figure.number)).toEqual(list.map((_, i) => i + 1))
    expect(new Set(list.map(figure => figure.id)).size).toBe(list.length)
  })

  it('never takes a region that holds running text: its words stay words', () => {
    const wrong: Region = { kind: 'figure', x: 0.1, y: 0.1, w: 0.8, h: 0.4 }
    const kept = fromPages(pagesWith({ 2: withIds(2, [wrong]) }), scan)!
    expect(figures(kept)).toHaveLength(0)
    expect(paragraphs(kept).some(text => text.startsWith('Constructors appear under various names in physics'))).toBe(true)
  })

  it('without regions (a device that cannot draw them), the text is the text', () => {
    const plain = fromPages(pagesWith({}), scan)!
    expect(figures(plain)).toHaveLength(0)
    expect(paragraphs(plain)).toContain('input state of substrates → output state of substrates (2)')
  })
})

describe('Registered books’ pictures are drawn as before', () => {
  it('a figure without a fit keeps its own size rule (at most twice its pixels); a crop fills the column or keeps the text’s size', () => {
    const at = { columnWidth: 600, pageHeight: 900 }
    expect(figurePlacement({ width: 200, height: 100 }, at)).toEqual({ mode: 'inline', width: 400, height: 200 })
    expect(figurePlacement({ width: 200, height: 100, fit: 'column' }, at)).toEqual({ mode: 'inline', width: 600, height: 300 })
    expect(figurePlacement({ width: 200, height: 40, fit: 'text' }, at)).toEqual({ mode: 'inline', width: 200, height: 40 })
    expect(figureName({ number: 3 })).toBe('Figure 3')
  })
})

describe('Show page: a look at the PDF’s own page at a paragraph', () => {
  it('keeps the spot as the shared place, still in Tinct text, and changes no choice: Back returns to the paragraph', async () => {
    const store = new Map<string, string>()
    ;(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v) }, removeItem: (k: string) => { store.delete(k) }, clear: () => store.clear(), key: () => null, length: 0 } as Storage
    const { showPdfPageAt, pdfEditionChoice, readPdfTextPlace } = await import('./pdfEditions')
    const hex = 'd'.repeat(24)
    const edition = fromPages(pagesWith({}), scan)!
    const chapter = edition.chapters.find(item => item.title === '2. Motivations')!
    const paragraphIndex = chapter.paragraphs.findIndex(text => text.startsWith('Implicitly, defining such media'))
    // Read as Tinct text on this desktop: the reader's own choice (Convert to Tinct book; the desktop's default is its pages since 19 Oct 2026).
    store.set('tinct-addbook:edition:' + hex, '"text"')
    const at = showPdfPageAt(hex, edition.chapters, { chapterNumber: chapter.number, paragraphIndex, wordIndex: 0, updatedAt: 1_000, converter: edition.converter })
    expect(at.page).toBe(14)
    expect(at.frac).toBeGreaterThanOrEqual(0)
    expect(store.get('tinct-addbook:edition:' + hex)).toBe('"text"')
    expect(pdfEditionChoice(hex, 'text')).toBe('text')
    expect(readPdfTextPlace(hex, edition)).toMatchObject({ chapterNumber: chapter.number, paragraphIndex, wordIndex: 0 })
  })
})
