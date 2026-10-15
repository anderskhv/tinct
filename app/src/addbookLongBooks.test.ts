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
type Unit = { key: string; title: string; from: number; start: number; to: number; matter?: string; chapter?: string; label?: string; pages?: boolean }
interface Search { create(): { add(page: number, text: string): void; search(q: string, o?: { limit?: number; skip?: Set<number> | null }): Array<{ page: number; text: string; score: number }>; size: number }; queryTerms(q: string): string[]; stem(w: string): string }
interface Order { roles(items: Item[], view?: number[] | null): Array<string | null>; pageText(items: Item[], roles?: Array<string | null>): string; CAPTION: RegExp; suspect(items: Item[]): boolean; hidden(items: Item[], view: number[], ink: Uint8Array, W: number, H: number): Set<number> }
interface Printed { candidates(items: Item[], view: number[]): Array<{ value: number; roman: boolean }>; labels(perPage: Array<Array<{ value: number; roman: boolean }>>): string[] | null }
interface Margin {
  primerUnits(entries: unknown[], count: number): Unit[]
  primerUnitAt(units: Unit[], page: number): Unit | null
  unitAt(units: Unit[], page: number): Unit | null
  pageMatter(text: string): string | null
  matterOf(title: string): string | null
  captionOf(text: string): { kind: string; n: string; label: string } | null
  scanEntries(list: unknown[], nav: string, count: number): Array<{ title: string; page: number; kind?: string; items: unknown[] }>
  primerBlocks(count: number): Unit[]
  unitPhrase(unit: Unit | null): string
  triggerLine(unit: Unit | null): string
}
interface Scan { scan(pdf: Pdf, o: { fileName: string }): Promise<{ nav: string; entries: Array<{ id: string; label: string; page: number; kind: string; parent: string | null }> }> }
interface Meta { offset: number; pages: number; sarsaPage: number; figurePage: number; chapters: Array<{ title: string; from: number; to: number }>; refsFrom: number; indexFrom: number }
type Pdf = { numPages: number; getPage(n: number): Promise<{ view: number[]; getTextContent(): Promise<{ items: Item[] }> }>; getOutline(): Promise<Array<{ title: string; dest: unknown; items: unknown[] }>>; getDestination(d: string): Promise<unknown[]>; getPageIndex(ref: unknown): Promise<number>; getPageLabels(): Promise<string[] | null>; destroy(): Promise<void> }

type OcrPage = { page: number; printed_page?: string | null; blocks: Array<{ t: string; x: string; b?: number[] }> }
interface Ocr { furnitureItems(page: OcrPage): Item[]; FURNITURE_VIEW: number[]; pageText(page: OcrPage): string }
let S: Search, R: Order, P: Printed, M: Margin, O: Ocr, SC: Scan
let pdfjs: { getDocument(o: unknown): { promise: Promise<Pdf> } }
let maker: { longBook(o: { meta: true; bookmarks?: boolean }): { bytes: Buffer; meta: Meta }; pdfFixtures(): Record<string, Buffer>; proseBook(o?: unknown): Buffer; figurePaper(): Buffer }
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
  for (const f of ['doc-search.js', 'reading-order.js', 'printed-pages.js', 'margin.js', 'pdf-ocr.js', 'pdf-scan.js']) require(ROOT + 'app/public/lab/addbook/js/' + f)
  const g = globalThis as unknown as { TinctDocSearch: Search; TinctReadingOrder: Order; TinctPrintedPages: Printed; TinctMargin: Margin; TinctPdfOcr: Ocr; TinctPdfScan: Scan }
  S = g.TinctDocSearch; R = g.TinctReadingOrder; P = g.TinctPrintedPages; M = g.TinctMargin; O = g.TinctPdfOcr; SC = g.TinctPdfScan
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

describe('Before you start on a long book: which part it covers (Anders, 15 Oct: MacKay\'s 640 pages, "a map of the whole PDF")', () => {
  const outlineEntries = async () => {
    const pdf = book.pdf
    const at = async (item: { dest: unknown }) => { let d = item.dest; if (typeof d === 'string') d = await pdf.getDestination(d); return await pdf.getPageIndex((d as unknown[])[0]) + 1 }
    return Promise.all((await pdf.getOutline()).map(async item => ({ title: item.title, page: await at(item), items: await Promise.all((item.items as Array<{ title: string; dest: unknown }>).map(async kid => ({ title: kid.title, page: await at(kid) }))) })))
  }
  it('with an outline: from the preface, chapter 1, named "Chapter 1: Introduction" and "chapter 1"; a part\'s chapters are named as chapters', async () => {
    const units = M.primerUnits(await outlineEntries(), book.meta.pages)
    const one = M.primerUnitAt(units, 8)!
    expect([one.title, one.label, M.unitPhrase(one), M.triggerLine(one)]).toEqual(['1 Introduction', 'Chapter 1: Introduction', 'chapter 1', 'The gist and a map of chapter 1.'])
    expect(one.to).toBe(book.meta.chapters[0].to)
    const sixteen = M.primerUnitAt(units, book.meta.figurePage)!
    expect([sixteen.label, M.unitPhrase(sixteen)]).toEqual(['Chapter 16: Applications and Case Studies', 'chapter 16'])
    // Front and back matter are never named as chapters.
    expect(units.filter(u => u.matter).every(u => !u.chapter && !u.label)).toBe(true)
  })
  it('without an outline (MacKay\'s case): the chapters of its printed contents; from the front matter chapter 1 alone, labelled; never "the whole PDF"', async () => {
    const made = maker.longBook({ meta: true, bookmarks: false })
    const pdf = await open(made.bytes)
    try {
      expect(await pdf.getOutline()).toBeNull()
      const scan = await SC.scan(pdf, { fileName: 'learning.pdf' })
      expect(scan.nav).toBe('contents')
      const units = M.primerUnits(M.scanEntries(scan.entries, scan.nav, pdf.numPages), pdf.numPages)
      expect(units.length).toBeGreaterThan(17)
      for (const page of [1, 3, 8, 15]) {
        const unit = M.primerUnitAt(units, page)!
        // Chapter 1 alone: its own pages, from its opener to the page before chapter 2; never two chapters at once.
        expect([unit.label, unit.start, unit.to], `page ${page}`).toEqual(['Chapter 1: Introduction', made.meta.chapters[0].from, made.meta.chapters[0].to])
      }
      expect(M.primerUnitAt(units, made.meta.figurePage)!.label).toBe('Chapter 16: Applications and Case Studies')
      expect(M.primerUnitAt(units, made.meta.indexFrom + 2)!.label).toBe('Chapter 17: Frontiers')
      for (let n = 1; n <= pdf.numPages; n += 7) expect(M.triggerLine(M.primerUnitAt(units, n)), String(n)).not.toContain('whole PDF')
      // Every unit is one chapter (or matter): no unit spans two chapter openers.
      const openers = made.meta.chapters.map(c => c.from)
      for (const u of units) expect(openers.filter(p => p > u.start && p <= u.to), u.title).toEqual([])
    } finally { await pdf.destroy() }
  }, 120_000)
  it('a long PDF with nothing to go by: blocks of 40 pages, named by their pages; a short one stays "the whole PDF"', () => {
    const blocks = M.primerBlocks(95)
    expect(blocks.map(b => [b.key, b.from, b.to])).toEqual([['pages-1', 1, 40], ['pages-41', 41, 80], ['pages-81', 81, 95]])
    expect(M.triggerLine(M.primerUnitAt(blocks, 50))).toBe('The gist and a map of pages 41–80.')
    for (const b of blocks) expect(b.key).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)
    expect(M.triggerLine(M.primerUnits([], 12)[0])).toBe('The gist and a map of the whole PDF.')
  })
  it('headings found by size become units only when chapter-sized; an outline-less file\'s scan without chapters gives none', () => {
    const heads = Array.from({ length: 10 }, (_, i) => ({ id: 'h' + i, label: `Heading ${i}`, page: i * 3 + 1, kind: 'chapter', parent: null }))
    expect(M.scanEntries(heads, 'headings', 30)).toEqual([])
    expect(M.scanEntries(heads, 'headings', 200)).toHaveLength(10)
    expect(M.scanEntries(heads, 'pages', 200)).toEqual([])
    expect(M.scanEntries(heads, 'outline', 200)).toEqual([])
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

describe('a recognised scan in the whole-book read (PR D with PR F)', () => {
  // Twelve recognised pages of an essay printed from page 41: the body, a running head on even pages,
  // the page number at the foot (with its box, as recognition gives it since 15 Oct 2026).
  const scan = (opts: { boxes?: boolean; printedOnly?: boolean; offset?: number } = {}): OcrPage[] => Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, printed = String(n + (opts.offset ?? 40)), box = (b: number[]) => (opts.boxes === false ? {} : { b })
    const blocks: OcrPage['blocks'] = [{ t: 'p', x: `Page ${n} of the essay on ${n === 7 ? 'eligibility traces and their decay' : 'reading and return'}.`, ...box([100, 120, 900, 860]) }]
    if (opts.printedOnly) return { page: n, printed_page: printed, blocks }
    if (n % 2 === 0) blocks.unshift({ t: 'head', x: `${printed} The Essay`, ...box([100, 40, 600, 58]) })
    blocks.push({ t: 'num', x: printed, ...box([480, 950, 520, 966]) })
    return { page: n, printed_page: null, blocks }
  })
  const labelsOf = (pages: OcrPage[]) => P.labels(pages.map(pg => P.candidates(O.furnitureItems(pg), O.FURNITURE_VIEW)))
  it('its heads and feet give printed page numbers, with boxes, without them, or from the page number recognition read', () => {
    const want = Array.from({ length: 12 }, (_, i) => String(i + 41))
    expect(labelsOf(scan())).toEqual(want)
    expect(labelsOf(scan({ boxes: false }))).toEqual(want)
    expect(labelsOf(scan({ printedOnly: true }))).toEqual(want)
  })
  it('a scan that prints its file page numbers gets no labels, as a PDF with text does', () => {
    expect(labelsOf(scan({ offset: 0 }))).toBeNull()
  })
  it('its recognised text is what the whole-book search finds, without the heads and feet', () => {
    const pages = scan(), index = S.create()
    pages.forEach(pg => index.add(pg.page, O.pageText(pg)))
    const hits = index.search('where are eligibility traces discussed?', { limit: 3 })
    expect(hits[0].page).toBe(7)
    expect(O.pageText(pages[1])).not.toContain('The Essay')
  })
})

describe('one notion of a figure: PR E\'s detection and PR F\'s reading order', () => {
  // E finds figures from the page's ink (in the browser: margin-check `figures` and `long` compare the
  // two on the drawn pages); here, the text both read: the same caption lines, and the labels F keeps
  // out of the body are the figure paper's labels, the ones E's detection keeps inside its figures.
  const figurePages = async () => readAll(await open(maker.figurePaper()))
  const captionLines = (items: Item[], roles: Array<string | null>) => ({
    e: items.filter(it => M.captionOf(it.str)).map(it => it.str),
    f: items.filter((it, i) => roles[i] === 'caption' && R.CAPTION.test(it.str.trim())).map(it => it.str),
  })
  it('the same lines start a caption on the figure paper and on the long book\'s figure page', async () => {
    const pages = [...(await figurePages()), book.pages[book.meta.figurePage - 1]]
    for (const [i, { items, view }] of pages.entries()) {
      const { e, f } = captionLines(items, R.roles(items, view))
      expect(f, `page ${i + 1}`).toEqual(e)
      expect(e.length, `page ${i + 1}`).toBe(1)
    }
  })
  it('the labels F keeps out of the body are the diagrams\' own labels, and no running text', async () => {
    const pages = await figurePages()
    const moved = pages.map(({ items, view }) => { const roles = R.roles(items, view); return items.filter((_, i) => roles[i] === 'figure').map(it => it.str) })
    expect(moved[0]).toEqual(['predicted probability of winning', 'hidden units (40-80)', 'backgammon position (198 input units)'])
    // ResNet's block diagram at the page's left edge: "relu" stands at the body's left edge, under the boxes.
    expect(moved[1]).toEqual(['weight layer', 'weight layer', 'relu', 'relu', 'x', 'F(x) + x'])
    expect(moved[3]).toEqual([])
  })
  it('running text that names a figure starts no caption for either', () => {
    for (const t of ['Figure 3 shows the return rate for every chapter.', 'Table 2 lists the runs we kept.', 'Fig. 4 is drawn to scale.']) {
      expect(M.captionOf(t), t).toBeNull()
      expect(R.CAPTION.test(t), t).toBe(false)
    }
    for (const t of ['Figure 16.1: The TD-Gammon neural', 'Fig. 3. The block', 'Table 1. Error rates', 'Figure 2: Residual learning']) {
      expect(M.captionOf(t), t).not.toBeNull()
      expect(R.CAPTION.test(t), t).toBe(true)
    }
  })
})

describe('after the retest (15 Oct): a search hit\'s whole section, and "Go to page" by the printed number', () => {
  type Hit = { page: number; at: number; text: string }
  type Sections = (hits: Hit[], o: { entries: Array<{ title: string; page: number }>; texts: string[]; label?: (n: number) => string; cap?: number; budget?: number }) => Array<{ n: string; text: string }>
  const sections = () => (S as unknown as { sections: Sections }).sections
  const pageOf = (v: string, labels: string[] | null, o: { count: number; near?: number }) => (P as unknown as { pageOf(v: string, l: string[] | null, o: unknown): number }).pageOf(v, labels, o)
  // Pages 1–6 of a book: 17 Frontiers opens on page 2, 17.1 starts lower on it and runs over page 3 to 17.2 on page 4.
  const words = (n: number, w: string) => Array.from({ length: n }, () => w).join(' ')
  const texts = [
    'The end of chapter sixteen. ' + words(80, 'soaring'),
    'Chapter 17 Frontiers In this final chapter we touch on topics. 17.1 General Value Functions and Auxiliary Tasks Our notion of value function has become general. ' + words(60, 'cumulant'),
    'A general value function predicts any signal, its cumulant. ' + words(120, 'prediction'),
    'The definition ends here. 17.2 Temporal Abstraction via Options ' + words(80, 'option'),
    words(100, 'option'),
    words(100, 'other'),
  ]
  const entries = [{ title: 'Frontiers', page: 2 }, { title: 'General Value Functions and Auxiliary Tasks', page: 2 }, { title: 'Temporal Abstraction via Options', page: 4 }]
  const label = (n: number) => String(n + 422)
  it('a hit sends its whole section, from its title to the next one, over its pages, marked "[p. N]" (general value functions: the definition is on the next page)', () => {
    const [one] = sections()([{ page: 2, at: texts[1].indexOf('Our notion'), text: '…a few lines…' }], { entries, texts, label })
    expect(one.n).toBe('424')
    expect(one.text.startsWith('General Value Functions and Auxiliary Tasks Our notion')).toBe(true)
    expect(one.text).toContain('[p. 425] A general value function predicts any signal, its cumulant.')
    expect(one.text).toContain('[p. 426] The definition ends here.')
    expect(one.text).not.toMatch(/17\.2|Temporal Abstraction|Frontiers In this/)
  })
  it('hits keep their order; two hits in one section send it once; a hit before any section keeps its own lines', () => {
    const got = sections()([
      { page: 4, at: 80, text: 'options…' }, { page: 3, at: 10, text: 'cumulant…' }, { page: 2, at: texts[1].length - 20, text: 'again…' }, { page: 1, at: 5, text: 'The end of chapter sixteen…' },
    ], { entries, texts, label })
    expect(got.map(p => p.n)).toEqual(['426', '424', '423'])
    expect(got[0].text.startsWith('Temporal Abstraction via Options')).toBe(true)
    expect(got[2].text).toBe('The end of chapter sixteen…')
  })
  it('within the budget: a section longer than its cap is the part round its hit; once the budget is spent, nothing more', () => {
    const [long] = sections()([{ page: 3, at: 500, text: 'x' }], { entries, texts, label, cap: 400 })
    expect(long.text.length).toBeLessThanOrEqual(402)
    expect(long.text).toContain('prediction')
    const few = sections()([{ page: 2, at: texts[1].indexOf('Our'), text: 'a' }, { page: 4, at: 80, text: 'b' }], { entries, texts, label, budget: 1200 })
    expect(few.reduce((a, p) => a + p.text.length, 0)).toBeLessThanOrEqual(1200)
    expect(few).toHaveLength(2)
    expect(few[1].text).toBe('b')
  })
  it('with no contents at all, each hit keeps its lines (as before)', () => {
    expect(sections()([{ page: 3, at: 0, text: 'lines' }], { entries: [], texts, label })).toEqual([{ n: '425', text: 'lines' }])
  })
  it('the long book\'s search gives each hit a place on its page, where its first term is', () => {
    const index = S.create()
    texts.forEach((t, i) => index.add(i + 1, t))
    const [hit] = index.search('general value function') as Array<{ page: number; at: number }>
    expect(texts[hit.page - 1].slice(hit.at).toLowerCase()).toMatch(/^general/)
  })
  it('"Go to page" takes the printed number (423 is file page 445), roman front matter in any case, the file\'s page where none prints it', () => {
    const roman = (P as unknown as { toRoman(n: number): string }).toRoman
    const labels = Array.from({ length: 548 }, (_, i) => (i < 22 ? roman(i + 1) : String(i - 21)))
    expect(pageOf('423', labels, { count: 548 })).toBe(445)
    expect(pageOf('viii', labels, { count: 548 })).toBe(8)
    expect(pageOf('VIII', labels, { count: 548 })).toBe(8)
    expect(pageOf('p. 423', labels, { count: 548 })).toBe(445)
    // No page prints 540: the file's page 540.
    expect(pageOf('540', labels, { count: 548 })).toBe(540)
    expect(pageOf('900', labels, { count: 548 })).toBe(0)
    expect(pageOf('', labels, { count: 548 })).toBe(0)
    // Without labels, the file's page as before.
    expect(pageOf('12', null, { count: 548 })).toBe(12)
    // Two pages print "1" (a part that starts again): the number is ambiguous, so the file's page 1; a word goes to the nearer.
    const twice = ['i', 'ii', '1', '2', 'i', 'ii', '1', '2']
    expect(pageOf('1', twice, { count: 8 })).toBe(1)
    expect(pageOf('ii', twice, { count: 8, near: 7 })).toBe(6)
    expect(pageOf('ii', twice, { count: 8, near: 1 })).toBe(2)
  })
  it('reading order: "Figure 1.18 shows …" in running text is no caption; "Figure 1.4 . The …" is', () => {
    expect(R.CAPTION.test('Figure 1.18 shows the performance of repetition codes')).toBe(false)
    expect(R.CAPTION.test('Figure 1.4 . The binary symmetric channel.')).toBe(true)
    expect(R.CAPTION.test('Figure 16.1: The TD-Gammon ANN')).toBe(true)
  })
})

describe('text a placed figure carries out of sight (full battery, 15 Oct: "text wrapped beside a figure is scrambled")', () => {
  // A 600×800 page drawn at 240×320 (2.5 units a pixel): body lines on the left, a figure on the right, and the
  // figure's hidden page of text (an earlier draft) right across it, over blank paper and on top of the body.
  const view = [0, 0, 600, 800], W = 240, H = 320
  const item = (str: string, x: number, y: number, width: number, size = 10): Item => ({ str, transform: [size, 0, 0, size, x, y], width, height: size, hasEOL: true })
  const page = () => {
    const ink = new Uint8Array(W * H), items: Item[] = []
    const paint = (x: number, y: number, w: number, size = 10) => { const l = Math.round(x / 2.5), r = Math.round((x + w) / 2.5), t = Math.round((800 - y - size * 0.7) / 2.5), b = Math.round((800 - y) / 2.5); for (let yy = t; yy <= b; yy++) for (let xx = l; xx <= r; xx++) ink[yy * W + xx] = 1 }
    // The figure, as the PDF draws it first: its label (drawn), then the hidden draft's lines.
    items.push(item('predicted probability', 380, 700, 120)); paint(380, 700, 120)
    for (let k = 0; k < 12; k++) items.push(item(`hidden draft line ${k} of an earlier page of the book`, 60 + (k % 2) * 200, 745 - k * 12.5, 260))
    // The page's own lines (drawn), the wrapped body beside the figure.
    for (let k = 0; k < 12; k++) { items.push(item(`network had two additional units in its line ${k}`, 60, 740 - k * 12.5, 230)); paint(60, 740 - k * 12.5, 230) }
    // The figure's ink, round its label.
    for (let yy = 40; yy < 110; yy++) for (let xx = 150; xx < 220; xx += 6) ink[yy * W + xx] = 1
    return { items, ink }
  }
  it('the hidden lines go, the page\'s own lines and the figure\'s label stay; reading order then reads the body straight', () => {
    const { items, ink } = page()
    expect(R.suspect(items)).toBe(true)
    const gone = R.hidden(items, view, ink, W, H)
    const kept = items.filter((_, i) => !gone.has(i)).map(it => it.str)
    expect(kept.filter(s => /hidden draft/.test(s))).toEqual([])
    expect(kept).toContain('predicted probability')
    expect(kept.filter(s => /^network had/.test(s))).toHaveLength(12)
    const shown = items.map((it, i) => (gone.has(i) ? { ...it, str: '', hasEOL: false } : it))
    const text = R.pageText(shown, R.roles(shown, view))
    expect(text).toMatch(/in its line 0\s+network had two additional units in its line 1\s+network had/)
    expect(text).not.toMatch(/hidden draft/)
  })
  it('a page whose lines never lie on each other is left alone (nothing drawn, nothing dropped)', () => {
    const items = Array.from({ length: 30 }, (_, k) => item(`An ordinary line of running text number ${k}`, 60, 740 - k * 14, 300))
    expect(R.suspect(items)).toBe(false)
    expect(R.hidden(items, view, new Uint8Array(W * H), W, H).size).toBe(0)
  })
  it('lines on top of each other, all of them drawn (no blank paper under any): nothing is dropped', () => {
    const { items } = page(), ink = new Uint8Array(W * H).fill(1)
    expect(R.hidden(items, view, ink, W, H).size).toBe(0)
  })
})
