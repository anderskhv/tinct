/**
 * Scanned books (30 Oct 2026 corpus of Internet Archive scans): the pieces of public/lab/addbook/js/pdf-scan.js
 * that read a scan's chapters, lines and furniture as printed.
 */
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))

interface Entry { id: string; label: string; page: number; kind?: string; parent?: string | null }
interface Item { str: string; transform: number[]; width: number; height: number; hasEOL: boolean; fontName?: string }
interface Row { y: number; x: number; size: number; text: string; words: number; ocr?: true }
interface Page { n: number; x0: number; y0: number; w: number; h: number; rows: Array<Row & { x2?: number; chars?: number }> }
interface ScanApi {
  furniture: (pages: Page[], title?: string) => (p: Page, r: Row) => boolean
  sequencedLabels: (list: Entry[]) => Entry[]
  alignTitles: (entries: Entry[], titles: string[]) => Entry[]
  wordBoxLayer: (items: Item[]) => boolean
  textRows: (items: Item[]) => Row[]
  epigraphRows: (rows: Array<{ y: number; size: number; text: string; words: number }>) => Set<number>
}

interface TextApi { readCap: (image: { width: number; height: number; data: Uint8Array }, size: number) => { letter: string; score: number; next: number } | null }

let api: ScanApi
let text: TextApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  require(ROOT + 'app/public/lab/addbook/js/pdf-text.js')
  api = (globalThis as unknown as { TinctPdfScan: ScanApi }).TinctPdfScan
  text = (globalThis as unknown as { TinctPdfText: TextApi }).TinctPdfText
})

const entries = (labels: string[]): Entry[] => labels.map((label, i) => ({ id: 'h' + i, label, page: i + 1 }))
const labels = (list: Entry[]) => list.map(e => e.label)
const item = (str: string, x: number, y: number, size: number, width: number, hasEOL = false): Item => ({ str, transform: [size, 0, 0, size, x, y], width, height: size, hasEOL })

describe('chapter labels in sequence', () => {
  it('reads a numeral as OCR misreads it where the neighbours agree: "CHAPTER L" before III is I, not 50', () => {
    expect(labels(api.sequencedLabels(entries(['CHAPTER L', 'CHAPTER in.', 'CHAPTER IV.', 'CHAPTER V.', 'CHAPTER VI.']))))
      .toEqual(['CHAPTER I.', 'CHAPTER III.', 'CHAPTER IV.', 'CHAPTER V.', 'CHAPTER VI.'])
  })
  it('keeps a real L in a long book, and gives a garbled label the number between its neighbours', () => {
    expect(labels(api.sequencedLabels(entries(['CHAPTER XLVIII.', 'CHAPTER XLIX.', 'CHAPTER L.', 'CHAPTER LI.', 'CHAPTER LII.']))))
      .toEqual(['CHAPTER XLVIII.', 'CHAPTER XLIX.', 'CHAPTER L.', 'CHAPTER LI.', 'CHAPTER LII.'])
    expect(labels(api.sequencedLabels(entries(['Pride and prejudice', 'CHAPTER II.', 'CHAPTER III.', 'CHAITKk [V.', 'CHAPTER V.', 'CHAPTER X.', 'CHAPTER XL', 'CHAPTER XII.']))))
      .toEqual(['Pride and prejudice', 'CHAPTER II.', 'CHAPTER III.', 'CHAPTER IV.', 'CHAPTER V.', 'CHAPTER X.', 'CHAPTER XI.', 'CHAPTER XII.'])
  })
  it('lets the numbering start again in each Book', () => {
    expect(labels(api.sequencedLabels(entries(['CHAPTER X.', 'CHAPTER XI.', 'CHAPTER I.', 'CHAPTER J.', 'CHAPTER III.', 'CHAPTER IV.']))))
      .toEqual(['CHAPTER X.', 'CHAPTER XI.', 'CHAPTER I.', 'CHAPTER II.', 'CHAPTER III.', 'CHAPTER IV.'])
    expect(labels(api.sequencedLabels(entries(['Preface', 'Of the American Editors', 'CHAPTER J.', 'CHAPTER II.', 'CHAPTER III.', 'CHAPTER IV.', 'CHAPTER V.']))))
      .toEqual(['Preface', 'Of the American Editors', 'CHAPTER I.', 'CHAPTER II.', 'CHAPTER III.', 'CHAPTER IV.', 'CHAPTER V.'])
  })
})

describe('headings named from the printed contents', () => {
  it('gives a heading OCR garbled the contents title it matches, in order', () => {
    const titles = ['CHAPTER I. The Cyclone', 'CHAPTER II. The Council with The Munchkins', 'CHAPTER III. How Dorothy Saved the Scarecrow', 'CHAPTER IV. The Road Through the Forest', 'CHAPTER v. The Rescue of the Tin Woodman']
    expect(labels(api.alignTitles(entries(['INTRODUCTION.', 'TKe Cyclorve', 'How DorolK/ ^^ved', 'CNjivpter V.']), titles)))
      .toEqual(['INTRODUCTION.', 'CHAPTER I. The Cyclone', 'CHAPTER III. How Dorothy Saved the Scarecrow', 'CHAPTER v. The Rescue of the Tin Woodman'])
  })
})

describe('a scan\'s lines', () => {
  it('a superscript sign joins its word\'s line ("Intel®"); a born-digital page is no word-box OCR layer', () => {
    const items = [
      item('The Intel', 45, 656, 9, 40), item('®', 85.5, 659.6, 7.2, 7), item(' ', 92.7, 659.6, 7.2, 3), item('64 and IA-32 Architectures Software Developer’s Manual, Volume 1', 95.5, 656, 9, 300, true),
      item('describes the basic architecture and programming environment of Intel 64 and IA-32 processors.', 45, 645, 9, 400, true),
      item('These volumes apply to application programmers and to programmers who write operating systems.', 45, 634, 9, 400, true),
    ]
    expect(api.wordBoxLayer(items)).toBe(false)
    expect(api.textRows(items).map(r => r.text)[0]).toBe('The Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volume 1')
  })
  it('a chapter\'s synopsis is no epigraph: its label above stays a heading', () => {
    const rows = [
      { y: 324, size: 10.5, text: 'CHAPTER IV.', words: 2 },
      { y: 311, size: 5, text: 'The food question.—Objection to paraffine oil as an atmosphere.—', words: 9 },
      { y: 303, size: 5.5, text: 'Advantages of cheese as a traveling companion.—A married', words: 8 },
      { y: 287, size: 5.5, text: '—I pack.—Cussedness of tooth brushes.—George and Harris', words: 8 },
    ]
    expect(api.epigraphRows(rows).has(0)).toBe(false)
  })
})

describe('page numbers as OCR misreads them', () => {
  const row = (text: string, y: number): Row => ({ text, y, x: 100, size: 10, words: text.split(' ').length, ocr: true })
  const body = (n: number) => Array.from({ length: 30 }, (_, i) => row(`line ${i} of page ${n} with enough words to be text`, 520 - i * 15))
  // A book's pages, each with its own number at the foot, as a scan prints it.
  const pages = (): Page[] => Array.from({ length: 12 }, (_, i) => ({ n: i + 1, x0: 0, y0: 0, w: 400, h: 600, rows: [...body(i + 1), row(String(i + 7), 40)] }))
  it('a number with scraps of a letter at a page\'s foot is its page number ("97 H", "I 12", "79 /")', () => {
    const list = pages()
    for (const t of ['. 97 H', 'I 12', '79 /', '> 16']) list[5].rows.push(row(t, 30))
    const isFurniture = api.furniture(list)
    for (const t of ['. 97 H', 'I 12', '79 /', '> 16']) expect(isFurniture(list[5], list[5].rows.find(r => r.text === t)!)).toBe(true)
  })
  it('elsewhere on the page only the number the pages around print; never an index line run on ("378.,.")', () => {
    const list = pages()
    list[5].rows.push(row('12 i', 300), row('40 x', 280), row('378.,.', 590))
    const isFurniture = api.furniture(list)
    expect(isFurniture(list[5], list[5].rows.find(r => r.text === '12 i')!)).toBe(true)
    expect(isFurniture(list[5], list[5].rows.find(r => r.text === '40 x')!)).toBe(false)
    expect(isFurniture(list[5], list[5].rows.find(r => r.text === '378.,.')!)).toBe(false)
  })
})

describe('a drop cap read from the page', () => {
  // A capital drawn as thick strokes on paper, in grey: W is four strokes, T two.
  function drawn(strokes: number[][], size = 80) {
    const data = new Uint8Array(size * size).fill(250)
    for (const [x1, y1, x2, y2] of strokes) for (let t = 0; t <= 1; t += 0.002) {
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const X = Math.round(x + dx), Y = Math.round(y + dy); if (X >= 0 && Y >= 0 && X < size && Y < size) data[Y * size + X] = 20 }
    }
    return { width: size, height: size, data }
  }
  it('reads a plain capital, and nothing from a page with no shape tall enough', () => {
    expect(text.readCap(drawn([[6, 10, 22, 70], [22, 70, 40, 22], [40, 22, 58, 70], [58, 70, 74, 10]]), 20)?.letter).toBe('W')
    expect(text.readCap(drawn([[10, 10, 70, 10], [40, 10, 40, 72]]), 20)?.letter).toBe('T')
    expect(text.readCap(drawn([[10, 40, 30, 40]]), 20)).toBeNull()
  })
})
