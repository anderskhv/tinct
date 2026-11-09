/**
 * Section detection for papers without bookmarks (pdfSectionHeadings), on PDFs written by
 * addbooks/web/test/make-pdf.mjs and read with the pdf.js and line building (pdf-scan.js textRows,
 * furniture) the reader ships.
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { detectPdfDocumentSections, detectPdfSections, readableCaps, sectionNumbering, type PdfSectionPage, type PdfTextRow } from './pdfSectionHeadings'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'
type Heads = Array<{ text: string; page: number; y: number; column: number; level: number }>
type Maker = {
  researchPaper: (options?: Record<string, unknown>) => { bytes: Buffer; heads: Heads; pages: number }
  twoColumnPaper: () => Buffer; sectionPaper: () => Buffer; pdfFixtures: () => Record<string, Buffer>
  makePdf: (spec: unknown) => Buffer; prose: (top: number, count: number, options?: Record<string, unknown>) => Array<Record<string, unknown>>
}
let maker: Maker
let pdfjs: { getDocument: (options: unknown) => { promise: Promise<Parameters<typeof detectPdfDocumentSections>[0] & { destroy: () => Promise<void> }> } }
let scan: Parameters<typeof detectPdfDocumentSections>[1]

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  scan = (globalThis as unknown as { TinctPdfScan: typeof scan }).TinctPdfScan
  maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href) as Maker
})

async function sectionsOf(bytes: Buffer) {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
  try { return await detectPdfDocumentSections(pdf, scan) } finally { await pdf.destroy() }
}
const named = (list: Awaited<ReturnType<typeof sectionsOf>>) => list?.map(section => [section.title, section.page, section.level])
/** Where the fixture set a heading, as the reader's place: the top of its line, from the top of the page. */
const fracOf = (head: Heads[number]) => (792 - (head.y + (head.level === 1 ? head.text === 'Abstract' ? 11 : 12 : 10))) / 792

describe('sections of a paper without bookmarks', () => {
  it('names a two-column paper’s numbered sections in reading order, at their headings', async () => {
    const { bytes, heads } = maker.researchPaper({ meta: true })
    const sections = await sectionsOf(bytes)
    expect(named(sections)).toEqual([
      ['Abstract', 1, 1], ['1 Introduction', 1, 1], ['2 Related Work', 2, 1], ['3 Method', 2, 1], ['3.1 Problem Setup', 2, 2],
      ['3.2 Training Objective', 3, 2], ['4 Experiments', 3, 1], ['4.1 Datasets', 4, 2],
      // The left column's last subsection before the right column's section on the same page.
      ['4.2 Baselines', 4, 2], ['5 Results', 4, 1], ['6 Discussion', 5, 1], ['7 Conclusion', 5, 1],
      ['Acknowledgments', 6, 1], ['References', 6, 1], ['A Additional Proofs', 7, 1],
    ])
    for (const section of sections!) {
      const head = heads.find(head => head.text === section.title)!
      expect(section.frac).toBeCloseTo(fracOf(head), 2)
    }
  })

  it('leaves out the title block, running head, page numbers, captions, a chart title and a table header', async () => {
    const titles = (await sectionsOf(maker.researchPaper()))!.map(section => section.title).join(' | ')
    expect(titles).not.toMatch(/Sparse Attention|Ann Example|University|example\.org|Preprint|Figure|Table|Accuracy by|Model|^\d+$/)
  })

  it('finds a one-column paper’s introduction, which the chapter scan takes for the title block', async () => {
    const sections = await sectionsOf(maker.researchPaper({ columns: 1 }))
    expect(named(sections)?.slice(0, 4)).toEqual([['Abstract', 1, 1], ['1 Introduction', 1, 1], ['2 Related Work', 2, 1], ['3 Method', 2, 1]])
    expect(sections!.filter(section => section.level === 1)).toHaveLength(11)
  })

  it('reads an unnumbered paper’s sections by the style its known headings share, and its smaller ones as subsections', async () => {
    const sections = await sectionsOf(maker.researchPaper({ numbered: false }))
    expect(sections!.filter(section => section.level === 1).map(section => section.title)).toEqual(
      ['Abstract', 'Introduction', 'Related Work', 'Method', 'Experiments', 'Results', 'Discussion', 'Conclusion', 'Acknowledgments', 'References'])
    expect(sections!.filter(section => section.level === 2).map(section => section.title)).toEqual(['Problem Setup', 'Training Objective', 'Datasets', 'Baselines'])
  })

  it('reads IEEE headings set in capitals at the body’s size, and names them readably', async () => {
    const sections = await sectionsOf(maker.researchPaper({ caps: true }))
    expect(named(sections)?.filter(section => section[2] === 1).map(section => section[0])).toEqual(
      ['Abstract', 'I. Introduction', 'II. Related Work', 'III. Method', 'IV. Experiments', 'V. Results', 'VI. Discussion', 'VII. Conclusion', 'Acknowledgments', 'References', 'Appendix A. Proofs'])
    expect(named(sections)?.filter(section => section[2] === 2).map(section => section[0])).toEqual(['A. Problem Setup', 'B. Training Objective', 'A. Datasets', 'B. Baselines'])
  })

  it('keeps a section heading set under a figure caption (the scan takes it for the figure’s title)', async () => {
    const sections = await sectionsOf(maker.twoColumnPaper())
    expect(named(sections)).toEqual([['Abstract', 1, 1], ['1 Introduction', 1, 1], ['2 Method', 4, 1], ['References', 8, 1]])
  })

  it('stays out of books, essays, notes and scans: their chapters come from the outline or the scan as before', async () => {
    const fixtures = maker.pdfFixtures()
    for (const name of ['PossibleMinds Deutsch (1).pdf', 'week3_notes_final-v2.pdf', 'IMG_20240512_scan.pdf', 'prose_book.pdf', 'scan_0042.pdf'])
      expect(await sectionsOf(fixtures[name]), name).toBeNull()
  })
})

describe('safeguards on text rows', () => {
  // A page of body rows (10 pt, font "body") with the given rows among them.
  const page = (n: number, rows: Array<Partial<PdfTextRow> & { text: string; y: number }>): PdfSectionPage => ({ n, x0: 0, y0: 0, w: 612, h: 792, rows: [
    ...rows.map(row => ({ x: 72, x2: 72 + row.text.length * 5, size: 10, font: 'body', words: row.text.split(' ').length, ...row })),
    ...Array.from({ length: 30 }, (_, line) => ({ y: 600 - line * 13, x: 72, x2: 540, size: 10, font: 'body', words: 12, text: `Body line ${line} on page ${n} carries the paper's running argument forward with care.` })),
  ].sort((a, b) => b.y - a.y) })
  const faceOf = (_page: number, font: string) => ({ body: 'Times-Roman', bold: 'Times-Bold', big: 'Times-Bold', italic: 'Times-Italic' }[font] ?? '')
  const heading = (text: string, y: number, extra: Partial<PdfTextRow> = {}) => ({ text, y, size: 12, font: 'big', ...extra })

  it('needs two numbered or known sections, else returns null for the reader to keep its page units', async () => {
    expect(await detectPdfSections([page(1, [heading('1 Introduction', 700)]), page(2, [])], { faceOf })).toBeNull()
    expect(await detectPdfSections([page(1, [heading('A Long Night', 700)]), page(2, [heading('The Morning After', 700)])], { faceOf })).toBeNull()
    expect(await detectPdfSections([page(1, [heading('1 Introduction', 700)]), page(2, [heading('2 Method', 700)])], { faceOf })).toHaveLength(2)
  })

  it('leaves out a numbered list in the body face, numbers out of sequence and a bold line beside numbered headings', async () => {
    const sections = await detectPdfSections([
      page(1, [heading('1 Introduction', 700), { text: '1 We propose a sparse model', y: 660 }, { text: '2 We evaluate it', y: 646 }]),
      page(2, [heading('2 Method', 700), heading('12 Monkeys Revisited', 640), { text: 'Model Accuracy Recall', y: 620, font: 'bold' }, heading('2.1 Setup', 610, { size: 10, font: 'bold' })]),
      page(3, [heading('3 Results', 700), { text: 'Our main contributions are', y: 650, font: 'bold' }]),
    ], { faceOf })
    expect(sections?.map(section => section.title)).toEqual(['1 Introduction', '2 Method', '2.1 Setup', '3 Results'])
  })

  it('leaves out a running head set like a heading on every page, captions and sentences', async () => {
    const sections = await detectPdfSections([1, 2, 3].map(n => page(n, [
      heading('Proceedings of Reading', 760), ...(n === 1 ? [heading('1 Introduction', 700)] : n === 2 ? [heading('2 Method', 700), heading('Figure 2: The model', 400), heading('This is a sentence.', 380)] : [heading('References', 700)]),
    ])), { faceOf })
    expect(sections?.map(section => section.title)).toEqual(['1 Introduction', '2 Method', 'References'])
  })

  it('keeps italic emphasis out unless it is an IEEE subsection', async () => {
    const sections = await detectPdfSections([
      page(1, [heading('I. INTRODUCTION', 700, { size: 10, font: 'body' }), { text: 'A. Datasets', y: 640, font: 'italic' }, { text: 'Emphasis Here', y: 600, font: 'italic', size: 11 }]),
      page(2, [heading('II. METHOD', 700, { size: 10, font: 'body' })]),
    ], { faceOf })
    expect(sections?.map(section => [section.title, section.level])).toEqual([['I. Introduction', 1], ['A. Datasets', 2], ['II. Method', 1]])
  })
})

it('parses section numbers and makes capitals readable', () => {
  expect(sectionNumbering('2.1 Method')).toMatchObject({ kind: 'arabic', parts: [2, 1], name: 'Method' })
  expect(sectionNumbering('IV. RESULTS')).toMatchObject({ kind: 'roman', parts: [4] })
  expect(sectionNumbering('Appendix B: Data')).toMatchObject({ kind: 'appendix', parts: [2] })
  expect(sectionNumbering('A.2 Proofs')).toMatchObject({ kind: 'letter', parts: [1, 2] })
  expect(sectionNumbering('2024 was a year')).toBeNull()
  expect(readableCaps('II. RELATED WORK')).toBe('II. Related Work')
  expect(readableCaps('APPENDIX A. PROOFS OF THE THEOREMS')).toBe('Appendix A. Proofs of the Theorems')
  expect(readableCaps('3.1 Problem Setup')).toBe('3.1 Problem Setup')
})
