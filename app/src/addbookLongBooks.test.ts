/**
 * The PDF reader on long books (docs/margin/FIXES-2026-10-15.md, "Additions from the scans, figures
 * and long-book test", items 8 to 11), on a 585-page book written by addbooks/web/test/make-pdf.mjs
 * (longBook: parts, chapters and sections in its outline, roman front matter, chapters printed from 1
 * at file page 23, a figure with text wrapped beside it, references and an index) and read with the
 * pdf.js the viewer ships:
 *   - the whole-book search (js/doc-search.js) and its ranking,
 *   - Before you start's unit: the chapter the reader is in, never a part, the index or the references
 *     (js/margin.js primerUnits, primerUnitAt, pageMatter),
 *   - printed page numbers where the file has no page labels (js/printed-pages.js),
 *   - reading order round a figure (js/reading-order.js).
 * No network and no AI.
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'

type Item = { str: string; transform: number[]; width: number; height: number; hasEOL: boolean }
type Unit = { key: string; title: string; from: number; start: number; to: number; matter?: string }
interface Search { create(): { add(page: number, text: string): void; search(q: string, o?: { limit?: number; skip?: Set<number> | null }): Array<{ page: number; text: string; score: number }>; size: number }; queryTerms(q: string): string[]; stem(w: string): string }
interface Order { roles(items: Item[], view?: number[] | null): Array<string | null>; pageText(items: Item[], roles?: Array<string | null>): string }
interface Printed { candidates(items: Item[], view: number[]): Array<{ value: number; roman: boolean }>; labels(perPage: Array<Array<{ value: number; roman: boolean }>>): string[] | null }
interface Margin {
  primerUnits(entries: unknown[], count: number): Unit[]
  primerUnitAt(units: Unit[], page: number): Unit | null
  unitAt(units: Unit[], page: number): Unit | null
  pageMatter(text: string): string | null
  matterOf(title: string): string | null
}
interface Meta { offset: number; pages: number; sarsaPage: number; figurePage: number; chapters: Array<{ title: string; from: number; to: number }>; refsFrom: number; indexFrom: number }
type Pdf = { numPages: number; getPage(n: number): Promise<{ view: number[]; getTextContent(): Promise<{ items: Item[] }> }>; getOutline(): Promise<Array<{ title: string; dest: unknown; items: unknown[] }>>; getDestination(d: string): Promise<unknown[]>; getPageIndex(ref: unknown): Promise<number>; getPageLabels(): Promise<string[] | null>; destroy(): Promise<void> }

let S: Search, R: Order, P: Printed, M: Margin
let pdfjs: { getDocument(o: unknown): { promise: Promise<Pdf> } }
let maker: { longBook(o: { meta: true }): { bytes: Buffer; meta: Meta }; pdfFixtures(): Record<string, Buffer>; proseBook(o?: unknown): Buffer }
let book: { meta: Meta; pdf: Pdf; pages: Array<{ items: Item[]; view: number[] }> }

const open = (bytes: Buffer) => pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
async function readAll(pdf: Pdf) {
  const pages = []
  for (let n = 1; n <= pdf.numPages; n++) { const page = await pdf.getPage(n); pages.push({ items: (await page.getTextContent()).items, view: page.view }) }
  return pages
}
/** The text the reader had before reading order: every item in the PDF's order. */
const streamText = (items: Item[]) => items.map(i => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ').trim()

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  ;(globalThis as unknown as { window: unknown }).window = globalThis
  for (const f of ['doc-search.js', 'reading-order.js', 'printed-pages.js', 'margin.js']) require(ROOT + 'app/public/lab/addbook/js/' + f)
  const g = globalThis as unknown as { TinctDocSearch: Search; TinctReadingOrder: Order; TinctPrintedPages: Printed; TinctMargin: Margin }
  S = g.TinctDocSearch; R = g.TinctReadingOrder; P = g.TinctPrintedPages; M = g.TinctMargin
  maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href)
  const made = maker.longBook({ meta: true })
  const pdf = await open(made.bytes)
  book = { meta: made.meta, pdf, pages: await readAll(pdf) }
}, 120_000)

describe('the whole-book search (js/doc-search.js)', () => {
  const textOf = (p: { items: Item[]; view: number[] }) => R.pageText(p.items, R.roles(p.items, p.view))
  const indexOf = (order: number[] = book.pages.map((_, i) => i + 1)) => {
    const index = S.create()
    for (const n of order) index.add(n, textOf(book.pages[n - 1]))
    return index
  }
  it('a question keeps its terms: "where", "is" and the like go, stems meet ("introduced" / "introduce")', () => {
    expect(S.queryTerms('Where is Sarsa introduced?')).toEqual(['sarsa', 'introduc'])
    expect(S.stem('introduces')).toBe(S.stem('introduce'))
    expect(S.stem('learning')).toBe('learn')
    expect(S.queryTerms('What does the book say about it?')).toEqual([])
  })
  it('"where is Sarsa introduced" ranks the page that introduces it first, above later mentions (the Gloss test\'s miss)', () => {
    const hits = indexOf().search('Where is Sarsa introduced?', { limit: 5 })
    expect(hits[0].page).toBe(book.meta.sarsaPage)
    expect(hits[0].text).toContain('gives rise to the name Sarsa')
    const later = hits.slice(1).map(h => h.page)
    expect(later.length).toBeGreaterThan(0)
    expect(later.every(p => p > book.meta.sarsaPage)).toBe(true)
    // At most one passage per page, best first, each a bounded excerpt.
    expect(new Set(hits.map(h => h.page)).size).toBe(hits.length)
    expect(hits.every((h, i) => i === 0 || h.score <= hits[i - 1].score)).toBe(true)
    expect(hits.every(h => h.text.length <= 902)).toBe(true)
  })
  it('terms that stand together win: "semi-gradient Sarsa" finds section 10.1, not the introduction', () => {
    const hits = indexOf().search('semi-gradient Sarsa on the mountain car', { limit: 3 })
    expect(textOf(book.pages[hits[0].page - 1])).toContain('10.1 Episodic Semi-gradient Control')
  })
  it('leaves out the pages it is told to skip (the chapter the request carries, an index, a reference list)', () => {
    const index = indexOf()
    const skip = new Set([book.meta.sarsaPage])
    const hits = index.search('Where is Sarsa introduced?', { limit: 5, skip })
    expect(hits.some(h => h.page === book.meta.sarsaPage)).toBe(false)
    expect(hits.length).toBeGreaterThan(0)
  })
  it('is incremental: pages added in any order, searchable as they arrive, the same ranking once all are in', () => {
    const forward = indexOf().search('TD error between successive predictions', { limit: 4 })
    const order = book.pages.map((_, i) => i + 1).reverse()
    const index = S.create()
    for (const n of order.slice(0, 120)) index.add(n, textOf(book.pages[n - 1]))
    expect(index.size).toBe(120)
    expect(index.search('Frontiers', { limit: 2 }).length).toBeGreaterThan(0)
    for (const n of order.slice(120)) index.add(n, textOf(book.pages[n - 1]))
    index.add(1, 'added twice is ignored')
    expect(index.search('TD error between successive predictions', { limit: 4 }).map(h => h.page)).toEqual(forward.map(h => h.page))
  })
  it('stays cheap on a 585-page book: indexing in about half a second, a search in milliseconds', () => {
    const texts = book.pages.map(textOf)
    let t = performance.now()
    const index = S.create()
    texts.forEach((text, i) => index.add(i + 1, text))
    const build = performance.now() - t
    t = performance.now()
    for (let k = 0; k < 20; k++) index.search('Where is Sarsa introduced?')
    const search = (performance.now() - t) / 20
    // Generous bounds: the suite runs beside other work (measured alone: about 0.5 s and 4 ms).
    expect(build).toBeLessThan(5000)
    expect(search).toBeLessThan(100)
  })
})

describe('Before you start\'s unit on a long book (margin.js)', () => {
  const entries = async () => {
    const pdf = book.pdf
    const at = async (item: { dest: unknown }) => { let d = item.dest; if (typeof d === 'string') d = await pdf.getDestination(d); return await pdf.getPageIndex((d as unknown[])[0]) + 1 }
    return Promise.all((await pdf.getOutline()).map(async item => ({ title: item.title, page: await at(item), items: await Promise.all((item.items as Array<{ title: string; dest: unknown }>).map(async kid => ({ title: kid.title, page: await at(kid) }))) })))
  }
  it('a part\'s chapters are the units (never "III Looking Deeper", five chapters at once); front and back matter are marked', async () => {
    const units = M.primerUnits(await entries(), book.meta.pages)
    expect(units.map(u => u.title)).toEqual(['Contents', 'Preface', 'Summary of Notation', ...book.meta.chapters.map(c => c.title), 'References', 'Index'])
    expect(units.filter(u => u.matter).map(u => [u.title, u.matter])).toEqual([['Contents', 'front'], ['Preface', 'front'], ['Summary of Notation', 'front'], ['References', 'back'], ['Index', 'back']])
    const ch16 = units.find(u => u.title.startsWith('16 '))!
    expect([ch16.from, ch16.to]).toEqual([book.meta.chapters[15].from, book.meta.chapters[15].to])
    expect(ch16.key).toBe('outline-6.2')
  })
  it('the primer is about the chapter the reader is in; on the index, the references or the front matter, the nearest real chapter', async () => {
    const units = M.primerUnits(await entries(), book.meta.pages)
    expect(M.primerUnitAt(units, book.meta.figurePage)?.title).toBe('16 Applications and Case Studies')
    expect(M.primerUnitAt(units, book.meta.indexFrom + 5)?.title).toBe('17 Frontiers')
    expect(M.primerUnitAt(units, book.meta.refsFrom + 1)?.title).toBe('17 Frontiers')
    expect(M.primerUnitAt(units, 8)?.title).toBe('1 Introduction')
    expect(M.primerUnitAt(units, 1)?.title).toBe('1 Introduction')
    // unitAt still names the unit a page is in (the trigger shows at a real unit's start only).
    expect(M.unitAt(units, book.meta.indexFrom + 5)?.title).toBe('Index')
  })
  it('a unit whose title says nothing is known by its pages: an index, a reference list, a contents page', () => {
    const text = (n: number) => R.pageText(book.pages[n - 1].items, R.roles(book.pages[n - 1].items, book.pages[n - 1].view))
    expect(M.pageMatter(text(book.meta.indexFrom + 2))).toBe('index')
    expect(M.pageMatter(text(book.meta.refsFrom + 2))).toBe('references')
    expect(M.pageMatter(text(3))).toBe('contents')
    for (const n of [book.meta.sarsaPage, book.meta.figurePage, 30, 400]) expect(M.pageMatter(text(n))).toBeNull()
    const units = M.primerUnits([{ title: 'Chapter 1', page: 1 }, { title: 'Chapter 2', page: 20 }, { title: 'Back of the book', page: 40 }], 50)
    units[2].matter = 'back'
    expect(M.primerUnitAt(units, 45)?.title).toBe('Chapter 2')
  })
  it('a book whose top level is chapters with sections keeps its chapters; a short PDF stays one unit; a book of matter only keeps its unit', () => {
    const chapters = [{ title: '1 Introduction', page: 2, items: [{ title: '1.1 Scope', page: 2 }, { title: '1.2 Plan', page: 9 }] }, { title: '2 Methods', page: 20, items: [{ title: '2.1 Data', page: 20 }, { title: '2.2 Models', page: 30 }] }]
    expect(M.primerUnits(chapters, 60).map(u => u.title)).toEqual(['1 Introduction', '2 Methods'])
    expect(M.primerUnits(chapters, 39)).toEqual([{ key: 'all', title: '', from: 1, start: 1, to: 39 }])
    const parts = [{ title: 'Part One: Motion', page: 2, items: [{ title: 'Chapter 1. Of Force', page: 3 }, { title: 'Chapter 2. Of Gravity', page: 20 }] }, { title: 'Part Two: Light', page: 40, items: [{ title: 'Chapter 3. Of Refraction', page: 41 }] }]
    expect(M.primerUnits(parts, 60).map(u => [u.key, u.title, u.from, u.start])).toEqual([['outline-0.0', 'Chapter 1. Of Force', 1, 3], ['outline-0.1', 'Chapter 2. Of Gravity', 20, 20], ['outline-1', 'Part Two: Light', 40, 40]])
    const matter = M.primerUnits([{ title: 'Preface', page: 1 }, { title: 'Index', page: 30 }], 50)
    expect(M.primerUnitAt(matter, 35)?.title).toBe('Index')
    expect(M.matterOf('12 References')).toBe('back')
    expect(M.matterOf('Notes on Method')).toBe('back')
    expect(M.matterOf('Indexing and search')).toBeNull()
  })
})

describe('printed page numbers (js/printed-pages.js)', () => {
  it('the long book: file page 445 prints 423, front matter in roman, the title page "i", every page labelled once', () => {
    const labels = P.labels(book.pages.map(p => P.candidates(p.items, p.view)))!
    expect(labels).toHaveLength(book.meta.pages)
    expect(labels[444]).toBe('423')
    expect(labels[book.meta.figurePage - 1]).toBe(String(book.meta.figurePage - book.meta.offset))
    expect(labels.slice(0, 4)).toEqual(['i', 'ii', 'iii', 'iv'])
    expect(labels[book.meta.offset]).toBe('1')
    // The last pages (the index, numbered in its heads) continue the run.
    expect(labels.at(-1)).toBe(String(book.meta.pages - book.meta.offset))
    expect(new Set(labels).size).toBe(labels.length)
  })
  it('reads the number in a running head and a lone number at the foot, never a chapter number in a head', () => {
    const page = book.pages[book.meta.figurePage - 1]
    expect(P.candidates(page.items, page.view)).toEqual([{ value: book.meta.figurePage - book.meta.offset, roman: false, edge: 'top' }])
    const opener = book.pages[book.meta.chapters[15].from - 1]
    expect(P.candidates(opener.items, opener.view)).toEqual([{ value: book.meta.chapters[15].from - book.meta.offset, roman: false, edge: 'bottom' }])
  })
  it('a number counts only where neighbouring pages agree: a stray number, or a number on one page alone, is no label', () => {
    const run = (from: number, count: number, d: number) => Array.from({ length: count }, (_, i) => [{ value: from + i + d, roman: false }])
    const perPage = [...run(1, 10, 20)]
    perPage[4] = [{ value: 7, roman: false }]
    const labels = P.labels(perPage)!
    expect(labels[4]).toBe('25')
    expect(P.labels([[{ value: 400, roman: false }], [], [], [], [], []])).toBeNull()
  })
  it('a PDF that prints its file page numbers, or none, gets no labels; an essay printed from page 41 does', async () => {
    const fixtures = maker.pdfFixtures()
    for (const name of ['prose_book.pdf', 'two_column_paper.pdf', 'scan_0042.pdf', 'IMG_20240512_scan.pdf']) {
      const pdf = await open(fixtures[name])
      expect(P.labels((await readAll(pdf)).map(p => P.candidates(p.items, p.view))), name).toBeNull()
      await pdf.destroy()
    }
    const essay = await open(fixtures['PossibleMinds Deutsch (1).pdf'])
    expect(P.labels((await readAll(essay)).map(p => P.candidates(p.items, p.view)))).toEqual(['41', '42', '43', '44', '45'])
    await essay.destroy()
  })
  it('only canonical roman numerals of front matter\'s size count ("mix", "civil" and "dim" are words)', () => {
    const view = [0, 0, 612, 792]
    const item = (str: string, y: number): Item => ({ str, transform: [9, 0, 0, 9, 300, y], width: 20, height: 9, hasEOL: false })
    expect(P.candidates([item('mix', 40), item('civil', 750), item('dim', 760), item('xiv', 30)], view)).toEqual([{ value: 14, roman: true, edge: 'bottom' }])
    expect(P.candidates([item('12', 400)], view)).toEqual([])
  })
})

describe('reading order round a figure (js/reading-order.js)', () => {
  it('text wrapped beside a figure: the body reads straight through, the caption and the labels follow as their own paragraphs', () => {
    const { items, view } = book.pages[book.meta.figurePage - 1]
    const roles = R.roles(items, view)
    const moved = items.filter((_, i) => roles[i] === 'figure' || roles[i] === 'caption').map(i => i.str)
    expect(moved).toEqual(['predicted probability', 'of winning', 'TD error', 'hidden units (40-80)', 'backgammon position', '(198 input units)', 'Figure 16.1: The TD-Gammon neural', 'network.'])
    const text = R.pageText(items, roles)
    const flat = text.replace(/\s+/g, ' ')
    expect(flat).toContain('evaluating every possible next position with the network and taking the best one.')
    expect(flat).toContain('estimates the probability of winning from that position. The weights')
    const [bodyPart, caption, labels] = text.split('\n\n').slice(-3)
    expect(bodyPart).not.toContain('predicted probability')
    expect(caption).toBe('Figure 16.1: The TD-Gammon neural network.')
    expect(labels).toBe('predicted probability; of winning; TD error; hidden units (40-80); backgammon position; (198 input units)')
    // The PDF's own order had the labels in among the body lines.
    expect(streamText(items).replace(/\s+/g, ' ')).toContain('with the TD error network')
  })
  it('a page without a figure reads exactly as before, so its text (and the cached prefix) does not change', async () => {
    const fixtures = maker.pdfFixtures()
    for (const name of ['prose_book.pdf', 'scan_0042.pdf', 'PossibleMinds Deutsch (1).pdf', 'week3_notes_final-v2.pdf']) {
      const pdf = await open(fixtures[name])
      for (const { items, view } of await readAll(pdf)) {
        expect(R.roles(items, view).every(r => r === 'body' || r === null), name).toBe(true)
        expect(R.pageText(items, R.roles(items, view))).toBe(streamText(items))
      }
      await pdf.destroy()
    }
    for (const n of [30, book.meta.sarsaPage, book.meta.indexFrom]) {
      const { items, view } = book.pages[n - 1]
      expect(R.pageText(items, R.roles(items, view))).toBe(streamText(items))
    }
  })
  it('a two-column paper: each figure caption leaves the columns\' flow; the columns, tables and equations stay', async () => {
    const pdf = await open(maker.pdfFixtures()['two_column_paper.pdf'])
    const pages = await readAll(pdf)
    for (const [i, { items, view }] of pages.entries()) {
      const roles = R.roles(items, view)
      const moved = items.filter((_, k) => roles[k] !== 'body' && roles[k] !== null).map(it => it.str)
      expect(moved, `page ${i + 1}`).toEqual((i + 1) % 2 === 0 && i + 1 <= 7 ? [`Figure ${(i + 1) / 2}. Return rates across chapters of different lengths, by week of reading.`] : [])
      if (moved.length) expect(R.pageText(items, roles).endsWith(`\n\n${moved[0]}`)).toBe(true)
    }
    await pdf.destroy()
  })
  it('running text that names a figure is not a caption ("Figure 3 shows …")', () => {
    const view = [0, 0, 612, 792]
    const line = (str: string, y: number, x = 72): Item => ({ str, transform: [11, 0, 0, 11, x, y], width: str.length * 5, height: 11, hasEOL: true })
    const items = Array.from({ length: 12 }, (_, k) => line(k === 5 ? 'Figure 3 shows the return rate for every chapter of the book we read.' : `Body line ${k} of running text that fills the column to its right edge.`, 700 - k * 14))
    expect(R.roles(items, view).every(r => r === 'body')).toBe(true)
  })
})
