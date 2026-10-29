/**
 * The edition a PDF opens in by default (pdf-scan.js layout, part of the scan
 * since SCAN_VERSION 5): running prose opens as its Tinct text, a document
 * whose pages carry columns, mathematics, figures and tables as its Original
 * pages, a scan without text in its pages only. Read with the viewer's pdf.js
 * on the fixtures of addbooks/web/test/make-pdf.mjs.
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'

interface Layout { default: string; score: number; signals: Record<string, boolean> }
interface Scan { v: number; textPages: number; layout: Layout }
interface Doc { destroy: () => Promise<void> }
let scanApi: { SCAN_VERSION: number; scan: (pdf: Doc, options: { fileName: string }) => Promise<Scan>; current: (scan: unknown) => boolean }
let fixtures: Record<string, Buffer>
let makePdf: (spec: unknown) => Buffer
let prose: (top: number, count: number, options?: Record<string, unknown>) => Array<Record<string, unknown>>
let pdfjs: { getDocument: (options: unknown) => { promise: Promise<Doc> } }

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  scanApi = (globalThis as unknown as { TinctPdfScan: typeof scanApi }).TinctPdfScan
  const maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href) as { pdfFixtures: () => Record<string, Buffer>; makePdf: typeof makePdf; prose: typeof prose }
  fixtures = maker.pdfFixtures()
  makePdf = maker.makePdf
  prose = maker.prose
})

async function layoutOf(bytes: Buffer, fileName: string): Promise<Scan> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
  try { return await scanApi.scan(pdf, { fileName }) } finally { await pdf.destroy() }
}

describe('PDF layout: the edition a PDF opens in', () => {
  it.each([
    ['PossibleMinds Deutsch (1).pdf', 'text'],
    ['week3_notes_final-v2.pdf', 'text'],
    ['scan_0042.pdf', 'text'],
    ['prose_book.pdf', 'text'],
    ['two_column_paper.pdf', 'pages'],
    ['IMG_20240512_scan.pdf', 'pages-only'],
  ])('%s opens as %s', async (name, expected) => {
    const scan = await layoutOf(fixtures[name], name)
    expect(scan.v).toBe(10)
    expect(scan.layout.default).toBe(expected)
  })

  it('scores the paper on its columns, mathematics, figures, tables and paper markers', async () => {
    const { layout } = await layoutOf(fixtures['two_column_paper.pdf'], 'two_column_paper.pdf')
    expect(layout.signals).toEqual({ columns: true, math: true, figures: true, tables: true, paper: true, short: true, prose: true })
    expect(layout.score).toBe(7.5)
  })

  it('scores a book of prose as prose, with nothing of a paper', async () => {
    const { layout } = await layoutOf(fixtures['prose_book.pdf'], 'prose_book.pdf')
    expect(layout).toEqual({ default: 'text', score: -1.5, signals: { columns: false, math: false, figures: false, tables: false, paper: false, short: true, prose: true } })
  })

  it('takes two columns alone, without the rest of a paper, for prose', async () => {
    // Each line numbered (a line printed the same on several pages is a running head).
    const column = (x: number, from: number, n: number) => prose(720, 50, { x, width: 36, size: 9.5, from }).map((line, i) => ({ ...line, text: `${line.text} ${n * 100 + i}` }))
    const bytes = makePdf({ pages: Array.from({ length: 6 }, (_, n) => ({ lines: [...column(48, n * 31, n), ...column(315, n * 31 + 17, n + 50)] })) })
    const { layout } = await layoutOf(bytes, 'columns.pdf')
    expect(layout.signals.columns).toBe(true)
    // Columns (+3) and short (+0.5) reach the line; prose (−2) keeps it as text.
    expect(layout.signals.prose).toBe(true)
    expect(layout).toMatchObject({ default: 'text', score: 1.5 })
  })

  it('is part of the scan from version 5: an older scan is scanned again', () => {
    expect(scanApi.SCAN_VERSION).toBe(10)
    expect(scanApi.current({ v: 5, title: 'x', entries: [] })).toBe(false)
    expect(scanApi.current({ v: 4, title: 'x', entries: [] })).toBe(false)
  })
})
