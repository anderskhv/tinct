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
interface ScanApi {
  sequencedLabels: (list: Entry[]) => Entry[]
  alignTitles: (entries: Entry[], titles: string[]) => Entry[]
  wordBoxLayer: (items: Item[]) => boolean
  textRows: (items: Item[]) => Row[]
  epigraphRows: (rows: Array<{ y: number; size: number; text: string; words: number }>) => Set<number>
}

let api: ScanApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  api = (globalThis as unknown as { TinctPdfScan: ScanApi }).TinctPdfScan
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
