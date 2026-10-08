/**
 * The PDF viewer's fast scan (addbooks/web/src/js/pdf-scan.js, installed as
 * public/lab/addbook/js/pdf-scan.js): title, author and chapters from the
 * document itself, on small PDFs written by addbooks/web/test/make-pdf.mjs and
 * read with the same pdf.js the viewer ships (public/lab/addbook/vendor/pdfjs).
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'

interface ScanEntry { id: string; label: string; page: number; kind: string; parent: string | null }
interface ScanResult { v: number; title: string; author: string; pages: number; nav: string; entries: ScanEntry[]; source: { title: string; author: string } }
interface PdfScanApi {
  SCAN_VERSION: number
  scan: (pdf: unknown, options: { fileName: string }) => Promise<ScanResult>
  current: (scan: unknown) => boolean
  cleanFileName: (name: string) => string
  metaTitle: (raw: unknown, name: string) => string | null
  metaAuthor: (raw: unknown) => string | null
  nameLike: (text: string) => boolean
  isPageNumber: (text: string) => boolean
  epigraphRows: (rows: Array<{ y: number; size: number; text: string; words: number }>) => Set<number>
}
type MakePdf = (spec: unknown) => Buffer

let scanApi: PdfScanApi
let makePdf: MakePdf
let fixtures: Record<string, Buffer>
let pdfjs: { getDocument: (options: unknown) => { promise: Promise<{ destroy: () => Promise<void> }> } }

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  require(ROOT + 'addbooks/web/src/js/pdf-scan.js')
  scanApi = (globalThis as unknown as { TinctPdfScan: PdfScanApi }).TinctPdfScan
  const maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href) as { makePdf: MakePdf; pdfFixtures: () => Record<string, Buffer> }
  makePdf = maker.makePdf
  fixtures = maker.pdfFixtures()
})

async function scanOf(bytes: Buffer, fileName: string): Promise<ScanResult> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
  try { return await scanApi.scan(pdf, { fileName }) } finally { await pdf.destroy() }
}

describe('PDF scan: title, author, chapters', () => {
  it('takes title and author from the metadata and chapters from the outline', async () => {
    const s = await scanOf(fixtures['scan_0042.pdf'], 'scan_0042.pdf')
    expect(s).toMatchObject({ v: scanApi.SCAN_VERSION, title: 'Notes on Natural Philosophy', author: 'Mary Somerville', pages: 4, nav: 'outline', source: { title: 'metadata', author: 'metadata' } })
    expect(s.entries.map(e => [e.label, e.page, e.kind, e.parent])).toEqual([
      ['Preface', 1, 'chapter', null],
      ['Part One: Motion', 2, 'part', null],
      ['Chapter 1. Of Force', 2, 'chapter', 'o1'],
      ['Chapter 2. Of Gravity', 3, 'chapter', 'o1'],
      ['Part Two: Light', 4, 'part', null],
      ['Chapter 3. Of Refraction', 4, 'chapter', 'o4'],
    ])
    expect(scanApi.current(s)).toBe(true)
    expect(scanApi.current({ ...s, v: scanApi.SCAN_VERSION - 1 })).toBe(false)
  })

  it('reads an essay’s printed title and author, and never makes its epigraph or running heads a chapter', async () => {
    const s = await scanOf(fixtures['PossibleMinds Deutsch (1).pdf'], 'PossibleMinds Deutsch (1).pdf')
    expect(s.title).toBe('Beyond Reward and Punishment')
    expect(s.author).toBe('David Deutsch')
    expect(s.source).toEqual({ title: 'printed', author: 'printed' })
    expect(s.nav).toBe('headings')
    expect(s.entries.map(e => [e.label, e.page])).toEqual([['Misconceptions of Thinking', 3], ['What It Means to Think', 5]])
    const labels = s.entries.map(e => e.label).join(' | ')
    expect(labels).not.toMatch(/Macbeth|Shakespeare|Tomorrow|POSSIBLE MINDS|DEUTSCH/i)
  })

  it('leaves out an epigraph inside the text, larger than the body, with its attribution wrapped', async () => {
    const body = (top: number, n: number) => Array.from({ length: n }, (_, i) => ({ y: top - i * 15, size: 11, font: 'Times-Roman', text: 'Of the first kind are the sciences of Geometry, Algebra, and Arithmetic, and in short every affirmation.' }))
    const bytes = makePdf({ pages: [
      { lines: [{ y: 700, size: 20, font: 'Times-Bold', text: 'On Thinking Machines' }, ...body(660, 36)] },
      { lines: [
        { x: 160, y: 720, size: 14, font: 'Times-Italic', text: 'Life’s but a walking shadow, a poor player' },
        { x: 160, y: 702, size: 14, font: 'Times-Italic', text: 'That struts and frets his hour upon the stage' },
        { x: 220, y: 682, size: 14, font: 'Times-Roman', text: '— William Shakespeare,' },
        { x: 220, y: 664, size: 14, font: 'Times-Roman', text: 'Macbeth' },
        ...body(630, 36),
      ] },
      { lines: body(720, 40) },
    ] })
    const s = await scanOf(bytes, 'essay.pdf')
    expect(s.title).toBe('On Thinking Machines')
    expect(s.entries).toEqual([])
    expect(s.nav).toBe('pages')
  })

  it('gives a short note with no headings page navigation and a cleaned file name', async () => {
    const s = await scanOf(fixtures['week3_notes_final-v2.pdf'], 'week3_notes_final-v2.pdf')
    expect(s).toMatchObject({ title: 'Week3 notes', author: '', nav: 'pages', entries: [], pages: 2, source: { title: 'file' } })
  })

  it('handles a scanned PDF with no text at all', async () => {
    const s = await scanOf(fixtures['IMG_20240512_scan.pdf'], 'IMG_20240512_scan.pdf')
    expect(s).toMatchObject({ nav: 'pages', entries: [], author: '', pages: 2, source: { title: 'file', author: 'none' } })
    expect(s.title).toBe('IMG 20240512 scan')
  })

  it('reads a "by" line beside the title', async () => {
    const bytes = makePdf({ pages: [{ lines: [
      { y: 700, size: 24, font: 'Helvetica-Bold', text: 'The Federalist Papers' },
      { y: 670, size: 12, font: 'Helvetica', text: 'edited by Alexander Hamilton and James Madison' },
      ...Array.from({ length: 30 }, (_, i) => ({ y: 630 - i * 15, size: 11, font: 'Times-Roman', text: 'To the People of the State of New York: after an unequivocal experience of the inefficiency.' })),
    ] }] })
    const s = await scanOf(bytes, 'fed.pdf')
    expect(s).toMatchObject({ title: 'The Federalist Papers', author: 'Alexander Hamilton and James Madison' })
  })
})

describe('PDF scan: the rules', () => {
  it('cleans file names', () => {
    expect(scanApi.cleanFileName('PossibleMinds Deutsch (1).pdf')).toBe('Possible Minds Deutsch')
    expect(scanApi.cleanFileName('Constructor_theory_of_time_SUB_Version.pdf')).toBe('Constructor theory of time SUB Version')
    expect(scanApi.cleanFileName('report-final copy.pdf')).toBe('Report')
    expect(scanApi.cleanFileName('notes_v2 [3].PDF')).toBe('Notes')
  })
  it('refuses metadata titles that are not titles', () => {
    expect(scanApi.metaTitle('PossibleMinds Deutsch (1)', 'PossibleMinds Deutsch (1).pdf')).toBeNull()
    expect(scanApi.metaTitle('Microsoft Word - essay.docx', 'x.pdf')).toBeNull()
    expect(scanApi.metaTitle('untitled', 'x.pdf')).toBeNull()
    expect(scanApi.metaTitle('scan0042', 'x.pdf')).toBeNull()
    expect(scanApi.metaTitle('Notes on Natural Philosophy', 'scan_0042.pdf')).toBe('Notes on Natural Philosophy')
  })
  it('refuses metadata authors that are not people', () => {
    for (const raw of ['Administrator', 'user', 'Adobe Acrobat 9.0', 'jdoe@example.com', '']) expect(scanApi.metaAuthor(raw)).toBeNull()
    expect(scanApi.metaAuthor('David Deutsch')).toBe('David Deutsch')
  })
  it('knows names, page numbers and epigraph lines', () => {
    expect(scanApi.nameLike('David Deutsch')).toBe(true)
    expect(scanApi.nameLike('J. R. R. Tolkien')).toBe(true)
    expect(scanApi.nameLike('Misconceptions of thinking')).toBe(false)
    for (const t of ['12', 'Page 3 of 8', 'xiv', '— 4 —', 'p. 7']) expect(scanApi.isPageNumber(t)).toBe(true)
    expect(scanApi.isPageNumber('Introduction')).toBe(false)
    const rows = [
      { y: 700, size: 12, text: 'The Fall', words: 2 },
      { y: 660, size: 11, text: '“Tomorrow, and tomorrow, and tomorrow,', words: 5 },
      { y: 646, size: 11, text: 'Creeps in this petty pace', words: 5 },
      { y: 630, size: 11, text: '— William Shakespeare, Macbeth', words: 4 },
      { y: 590, size: 11, text: 'All the objects of human reason', words: 6 },
    ]
    expect([...scanApi.epigraphRows(rows)].sort()).toEqual([1, 2, 3])
  })
})

describe('PDF scan: the installed copy', () => {
  it('ships the scan and theme scripts the tests cover', () => {
    for (const file of ['pdf-scan.js', 'pdf-theme.js']) {
      expect(readFileSync(ROOT + 'app/public/lab/addbook/js/' + file, 'utf8')).toBe(readFileSync(ROOT + 'addbooks/web/src/js/' + file, 'utf8'))
    }
  })
})
