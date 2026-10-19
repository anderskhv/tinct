/**
 * A text PDF's Tinct text (addbooks/web/src/js/pdf-text.js, installed as
 * public/lab/addbook/js/pdf-text.js): chapters and paragraphs from the PDF's
 * own text layer, read with the pdf.js the viewer ships, on PDFs written by
 * addbooks/web/test/make-pdf.mjs. The same file converts the same way every time.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { pageOfTextPlace, textPlaceOfPage } from './pdfAnchors'
import type { UserBookChapter, UserBookEdition } from './userEdition'
import { PDF_TEXT_CONVERTER, usableUserEdition } from './userEdition'

const require = createRequire(import.meta.url)
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const VENDOR = ROOT + 'app/public/lab/addbook/vendor/pdfjs/'

interface Row { y: number; x: number; x2: number; size: number; font: string | null; text: string; words: number; chars: number; fonts: Set<string> }
interface Scan { title: string; author: string; textPages: number; nav: string; entries: unknown[]; language: string }
interface Doc { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>; destroy: () => Promise<void> }
interface PdfTextApi {
  PDF_TEXT_CONVERTER: number
  convert: (pdf: Doc, options: { scan: Scan }) => Promise<UserBookEdition | null>
  fromPages: (pages: Array<{ n: number; x0: number; y0: number; w: number; h: number; rows: Row[] }>, scan: Scan) => UserBookEdition | null
  pageOf: (edition: UserBookEdition, place: { chapterNumber: number; paragraphIndex: number; wordIndex: number }) => { page: number; frac: number } | null
  placeOf: (edition: UserBookEdition, page: number, frac?: number) => { chapterNumber: number; paragraphIndex: number; wordIndex: number } | null
  usable: (edition: unknown) => boolean
  choice: (pos: unknown, stored: unknown, layoutDefault: unknown) => string | null
}
type MakePdf = (spec: unknown) => Buffer
type Prose = (top: number, count: number, options?: Record<string, unknown>) => Array<{ x: number; y: number; size: number; font: string; text: string }>

let text: PdfTextApi
let scanApi: { scan: (pdf: Doc, options: { fileName: string }) => Promise<Scan>; textRows: (items: unknown[]) => Row[] }
let fixtures: Record<string, Buffer>
let makePdf: MakePdf
let prose: Prose
let proseBook: (options: { text: true }) => { bytes: Buffer; chapters: Array<{ title: string; paragraphs: string[] }> }
let pdfjs: { getDocument: (options: unknown) => { promise: Promise<Doc> } }

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  require(ROOT + 'addbooks/web/src/js/pdf-scan.js')
  require(ROOT + 'addbooks/web/src/js/pdf-text.js')
  scanApi = (globalThis as unknown as { TinctPdfScan: typeof scanApi }).TinctPdfScan
  text = (globalThis as unknown as { TinctPdfText: PdfTextApi }).TinctPdfText
  const maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href) as { pdfFixtures: () => Record<string, Buffer>; makePdf: MakePdf; prose: Prose; proseBook: typeof proseBook }
  fixtures = maker.pdfFixtures()
  makePdf = maker.makePdf
  prose = maker.prose
  proseBook = maker.proseBook
})

const open = (bytes: Buffer) => pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
async function convertOf(bytes: Buffer, fileName = 'book.pdf'): Promise<{ edition: UserBookEdition | null; scan: Scan }> {
  const pdf = await open(bytes)
  try {
    const scan = await scanApi.scan(pdf, { fileName })
    return { edition: await text.convert(pdf, { scan }), scan }
  } finally { await pdf.destroy() }
}
async function rowsOf(bytes: Buffer, n: number): Promise<Row[]> {
  const pdf = await open(bytes)
  try { return scanApi.textRows((await (await pdf.getPage(n)).getTextContent()).items) } finally { await pdf.destroy() }
}
const body = (chapter: UserBookChapter) => chapter.paragraphs.slice(0, chapter.notes ?? chapter.paragraphs.length)

describe('Tinct text: a book of prose', () => {
  it('has the book’s chapters and, in each, its paragraphs exactly as written', async () => {
    const { bytes, chapters } = proseBook({ text: true })
    const { edition } = await convertOf(bytes, 'treatise.pdf')
    expect(edition).toMatchObject({ format: 'tinct-user-edition-v1', converter: PDF_TEXT_CONVERTER, source: 'pdf', title: 'A Treatise of Small Things', author: 'Ann Example', language: 'en' })
    expect(usableUserEdition(edition, 'pdf')).toBe(true)
    expect(usableUserEdition(edition, 'epub')).toBe(false)
    expect(edition!.chapters.map(chapter => chapter.title)).toEqual(chapters.map(chapter => chapter.title))
    // Running heads, page numbers and the title page are not text; every paragraph is whole,
    // across lines (words broken at line ends joined) and across pages.
    edition!.chapters.forEach((chapter, i) => expect(body(chapter)).toEqual(chapters[i].paragraphs))
  })

  it('joins words broken at a line end, keeps a hyphenated word whole, and leaves no soft hyphen', async () => {
    const { edition } = await convertOf(proseBook({ text: true }).bytes)
    const all = edition!.chapters.flatMap(chapter => chapter.paragraphs).join('\n')
    expect(all).toContain('self-evident')
    expect(all).not.toMatch(/selfevident|\p{L}-\s\p{Ll}|­/u)
    expect(all).toContain('demonstratively')
    expect(all).not.toMatch(/A TREATISE|CHAPTER \d/)
    // A soft hyphen from the text layer goes, joining its word.
    const row = (y: number, t: string, x = 72): Row => ({ y, x, x2: 440, size: 11, font: 'f1', text: t, words: t.split(' ').length, chars: t.length, fonts: new Set(['f1']) })
    const lines = Array.from({ length: 12 }, (_, i) => row(700 - i * 15, i === 3 ? 'all the objects of human reason or enquiry may naturally be under­' : i === 4 ? 'standing that the square of the hypothenuse is equal to the square' : 'Of the first kind are the sciences of Geometry and Algebra, and in short'))
    const made = text.fromPages([{ n: 1, x0: 0, y0: 0, w: 612, h: 792, rows: lines }], { title: 'T', author: '', textPages: 1, nav: 'pages', entries: [], language: 'en' })
    expect(made!.chapters[0].paragraphs.join(' ')).toContain('be understanding that')
    expect(made!.chapters[0].paragraphs.join(' ')).not.toContain('­')
  })

  it('collects a chapter’s footnotes after it under Notes', async () => {
    const { edition } = await convertOf(proseBook({ text: true }).bytes)
    const second = edition!.chapters[1]
    expect(second.notes).toBe(second.paragraphs.length - 2)
    expect(second.paragraphs.slice(second.notes)).toEqual(['Notes', '1 Hume first printed this argument in 1748, and he revised it for the edition that appeared after his death.'])
    expect(second.kinds?.slice(second.notes)).toEqual(['heading', null])
    expect(edition!.chapters.filter(chapter => chapter.notes !== undefined)).toHaveLength(1)
  })

  it('records the page each paragraph starts on and where it runs onto the next page', async () => {
    const bytes = proseBook({ text: true }).bytes
    const { edition } = await convertOf(bytes)
    const chapters = edition!.chapters
    // Chapter 1 begins on page 2 (after the title page); pages never run backwards.
    expect(chapters[0].pages![0]).toBe(2)
    const starts = chapters.flatMap(chapter => body(chapter).map((_, i) => chapter.pages![i]))
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
    const breaks = chapters.flatMap(chapter => (chapter.pageBreaks ?? []).map(cut => ({ chapter, cut })))
    expect(breaks.length).toBeGreaterThanOrEqual(4)
    for (const { chapter, cut: [paragraph, word, page] } of breaks) {
      expect(page).toBe(chapter.pages![paragraph] + 1)
      // The word at the break is where that page's text begins (or the end of a word broken across it).
      const rows = (await rowsOf(bytes, page)).filter(row => row.size === 11)
      const words = chapter.paragraphs[paragraph].split(/\s+/)
      const first = rows[0].text.split(' ')
      expect(words[word] === first[0] || words[word - 1].endsWith(first[0])).toBe(true)
    }
  })

  it('converts the same file the same way every time', async () => {
    const bytes = proseBook({ text: true }).bytes
    const a = await convertOf(bytes), b = await convertOf(Buffer.from(bytes))
    expect(JSON.stringify(b.edition)).toBe(JSON.stringify(a.edition))
  })
})

describe('Tinct text: other documents', () => {
  it('reads a page in two columns column by column, leaving out captions', async () => {
    const bytes = fixtures['two_column_paper.pdf']
    const { edition } = await convertOf(bytes, 'paper.pdf')
    const all = edition!.chapters.flatMap(chapter => chapter.paragraphs).join(' ')
    const rows = (await rowsOf(bytes, 3)).filter(row => row.size === 9.5)
    const left = rows.filter(row => row.x < 300), right = rows.filter(row => row.x > 300)
    const at = (row: Row) => all.indexOf(row.text.split(' ').slice(0, 4).join(' '))
    // The whole left column, top to bottom, then the right.
    expect(at(left[0])).toBeGreaterThanOrEqual(0)
    expect(at(left[1])).toBeGreaterThan(at(left[0]))
    expect(at(right[0])).toBeGreaterThan(at(left[left.length - 1]))
    expect(at(right[right.length - 1])).toBeGreaterThan(at(right[0]))
    expect(all).not.toMatch(/Figure \d\./)
  })

  it('gives an essay its title and sections, without running heads, page numbers or its title twice', async () => {
    const { edition } = await convertOf(fixtures['PossibleMinds Deutsch (1).pdf'], 'PossibleMinds Deutsch (1).pdf')
    expect(edition!.chapters.map(chapter => chapter.title)).toEqual(['Beyond Reward and Punishment', 'Misconceptions of Thinking', 'What It Means to Think'])
    const all = edition!.chapters.flatMap(chapter => chapter.paragraphs)
    expect(all.join('\n')).not.toMatch(/POSSIBLE MINDS|DAVID DEUTSCH|^4\d$/m)
    expect(all).not.toContain('Beyond Reward and Punishment')
    expect(edition!.chapters[1].pages![0]).toBe(3)
  })

  it('splits a document without chapters into chapters of 20 pages, or one under its title', async () => {
    const long = makePdf({ pages: Array.from({ length: 45 }, (_, n) => ({ lines: [...prose(720, 40, { from: n * 13, width: 70 + (n % 17) }), { x: 300, y: 36, size: 9, font: 'Helvetica', text: String(n + 1) }] })) })
    const { edition } = await convertOf(long, 'notes.pdf')
    expect(edition!.chapters.map(chapter => chapter.title)).toEqual(['Pages 1–20', 'Pages 21–40', 'Pages 41–45'])
    // Each chapter's text is from its own pages.
    edition!.chapters.forEach((chapter, i) => { for (const page of chapter.pages!) { expect(page).toBeGreaterThanOrEqual(i * 20 + 1); expect(page).toBeLessThanOrEqual(i * 20 + 20) } })
    const short = await convertOf(fixtures['week3_notes_final-v2.pdf'], 'week3_notes_final-v2.pdf')
    expect(short.edition!.chapters.map(chapter => chapter.title)).toEqual(['Week3 notes'])
    expect(short.edition!.chapters[0].paragraphs.join(' ')).not.toMatch(/Lecture notes, week 3|Page \d of 2/)
  })

  it('has no Tinct text for a scan without a text layer, or one whose text layer is noise', async () => {
    const scan = await convertOf(fixtures['IMG_20240512_scan.pdf'], 'IMG_20240512_scan.pdf')
    expect(scan.scan.textPages).toBe(0)
    expect(scan.edition).toBeNull()
    const noise = makePdf({ pages: [1, 2, 3].map(n => ({ lines: Array.from({ length: 30 }, (_, i) => ({ y: 720 - i * 15, size: 11, font: 'Times-Roman', text: `%% ${n}${i} ## 4.5 ~ 0x1 12 3 a8 7 ** == ${i}` })) })) })
    const garbage = await convertOf(noise, 'scan.pdf')
    expect(garbage.scan.textPages).toBe(0)
    expect(garbage.edition).toBeNull()
  })
})

describe('Tinct text: places between the text and the pages', () => {
  it('finds a page from the text and the text from a page, the same in the viewer’s copy', async () => {
    const { edition } = await convertOf(proseBook({ text: true }).bytes)
    const chapters = edition!.chapters
    for (const chapter of chapters) {
      for (let i = 0; i < chapter.paragraphs.length; i += 3) {
        const words = chapter.paragraphs[i].split(/\s+/).length
        for (const wordIndex of [0, Math.floor(words / 2), words - 1]) {
          const place = { chapterNumber: chapter.number, paragraphIndex: i, wordIndex }
          const page = pageOfTextPlace(chapters, place)
          expect(text.pageOf(edition!, place)).toEqual(page)
          // Back from that page and spot: the same word (the notes aside, which stand for no page).
          if (chapter.notes !== undefined && i >= chapter.notes) continue
          expect(textPlaceOfPage(chapters, page!.page, page!.frac)).toEqual(place)
          expect(text.placeOf(edition!, page!.page, page!.frac)).toEqual(place)
        }
      }
    }
    // The top of a page is the text there, a paragraph running on from the page before included.
    const [paragraph, word, page] = chapters[0].pageBreaks![0]
    expect(textPlaceOfPage(chapters, page, 0)).toEqual({ chapterNumber: 1, paragraphIndex: paragraph, wordIndex: word })
    // The title page, before any text: the first word.
    expect(textPlaceOfPage(chapters, 1, 0)).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0 })
  })

  // Rewritten 19 Oct 2026 (Anders: a PDF's view is chosen per device; only the place syncs): the place no
  // longer takes part. The order is this device's own choice, its kept default, then the rule's default.
  it('picks the edition a PDF opens in by the same rule as the reader: this device\'s choice, its kept default, the rule', () => {
    expect(text.choice('pages', 'text', 'text')).toBe('pages')
    expect(text.choice('text', 'pages', 'pages')).toBe('text')
    expect(text.choice(null, 'text', 'pages')).toBe('text')
    expect(text.choice(null, 'pages', 'text')).toBe('pages')
    expect(text.choice(null, null, 'text')).toBe('text')
    expect(text.choice(null, null, 'pages-only')).toBe('pages')
    expect(text.choice(null, null, undefined)).toBeNull()
  })
})

describe('Tinct text: the installed copy', () => {
  it('ships the text script the tests cover, with the scan and viewer scripts it works with', () => {
    for (const file of ['pdf-text.js', 'pdf-scan.js', 'reader.js']) {
      expect(readFileSync(ROOT + 'app/public/lab/addbook/js/' + file, 'utf8')).toBe(readFileSync(ROOT + 'addbooks/web/src/js/' + file, 'utf8'))
    }
    expect(readFileSync(ROOT + 'app/public/lab/addbook/css/reader.css', 'utf8')).toBe(readFileSync(ROOT + 'addbooks/web/src/css/reader.css', 'utf8'))
  })
})
