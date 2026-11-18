/**
 * The PDF viewer's fast scan (public/lab/addbook/js/pdf-scan.js): title, author and chapters from the
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
interface ScanResult { v: number; title: string; author: string; pages: number; nav: string; entries: ScanEntry[]; language: string; textPages: number; source: { title: string; author: string } }
interface PdfScanApi {
  SCAN_VERSION: number
  scan: (pdf: unknown, options: { fileName: string }) => Promise<ScanResult>
  titleOf: (pdf: unknown, options: { fileName: string }) => Promise<{ title: string; author: string; source: { title: string; author: string } }>
  current: (scan: unknown) => boolean
  cleanFileName: (name: string) => string
  metaTitle: (raw: unknown, name: string) => string | null
  metaAuthor: (raw: unknown) => string | null
  nameLike: (text: string) => boolean
  isPageNumber: (text: string) => boolean
  languageOf: (text: string, declared: string | null) => string
  epigraphRows: (rows: Array<{ y: number; size: number; text: string; words: number }>) => Set<number>
}
type MakePdf = (spec: unknown) => Buffer
type Prose = (top: number, count: number, options?: Record<string, unknown>) => Array<{ x: number; y: number; size: number; font: string; text: string }>

let scanApi: PdfScanApi
let makePdf: MakePdf
let prose: Prose
let fixtures: Record<string, Buffer>
let pdfjs: { getDocument: (options: unknown) => { promise: Promise<{ destroy: () => Promise<void> }> } }

beforeAll(async () => {
  const quiet = console.log
  console.log = () => {}
  require(VENDOR + 'pdf.worker.min.js')
  require(VENDOR + 'pdf.min.js')
  console.log = quiet
  pdfjs = (globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib
  require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
  scanApi = (globalThis as unknown as { TinctPdfScan: PdfScanApi }).TinctPdfScan
  const maker = await import(/* @vite-ignore */ pathToFileURL(ROOT + 'addbooks/web/test/make-pdf.mjs').href) as { makePdf: MakePdf; prose: Prose; pdfFixtures: () => Record<string, Buffer> }
  makePdf = maker.makePdf
  prose = maker.prose
  fixtures = maker.pdfFixtures()
})

async function scanOf(bytes: Buffer, fileName: string): Promise<ScanResult> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
  try { return await scanApi.scan(pdf, { fileName }) } finally { await pdf.destroy() }
}

describe('PDF scan: title, author, chapters', () => {
  it('does not append a large drop-cap paragraph opening to a chapter heading', async () => {
    const scan = await scanOf(makePdf({ pages: [
      { lines: [{ y: 730, size: 24, font: 'Times-Roman', text: 'A Novel' }, ...prose(670, 28)] },
      { lines: [{ x: 136, y: 268, size: 15.5, font: 'Times-Roman', text: 'CHAPTER II.' },
        { x: 131, y: 241, size: 15.5, font: 'Times-Roman', text: 'A reader was among the ear-' },
        { x: 142, y: 226, size: 9.5, font: 'Times-Roman', text: 'liest of those who entered the room.' }, ...prose(210, 12, { size: 9.5 })] },
      { lines: [{ x: 136, y: 733, size: 24, font: 'Times-Roman', text: 'CHAPTER III.' }, ...prose(680, 28)] },
    ] }), 'novel.pdf')
    expect(scan.entries.find(e => e.page === 2)?.label).toBe('CHAPTER II.')
  })

  it('keeps lowercase continuation lines in a wrapped heading without absorbing body text', async () => {
    const scan = await scanOf(makePdf({ pages: [
      { lines: [{ y: 730, size: 24, font: 'Times-Bold', text: 'Annual Report' }, ...prose(670, 28)] },
      { lines: [{ x: 55, y: 733, size: 32, font: 'Times-Bold', text: 'Report on the bank' },
        { x: 55, y: 699, size: 32, font: 'Times-Bold', text: 'and its activities' },
        { x: 55, y: 665, size: 32, font: 'Times-Bold', text: 'during the year' }, ...prose(600, 26)] },
      { lines: [{ x: 55, y: 733, size: 24, font: 'Times-Bold', text: 'Financial Stability' }, ...prose(680, 28)] },
    ] }), 'report.pdf')
    expect(scan.entries.map(e => e.label)).toEqual(['Report on the bank and its activities during the year', 'Financial Stability'])
  })

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

  it('joins a heading across a face change and interleaved text in another column', async () => {
    const bytes = makePdf({ pages: [
      { lines: [{ y: 700, size: 20, font: 'Times-Bold', text: 'Annual Report' }, ...prose(650, 30)] },
      { lines: [
        { x: 55, y: 735, size: 13, font: 'Times-Bold', text: 'Monetary policy, financial' },
        { x: 310, y: 735, size: 9, text: 'Other column continues on its own printed line.' },
        { x: 55, y: 720, size: 13, text: 'markets and the economy' },
        { x: 310, y: 720, size: 9, text: 'This paragraph must not enter the heading.' },
        ...prose(680, 30, { size: 9 }),
      ] },
      { lines: [{ y: 720, size: 18, font: 'Times-Bold', text: 'Financial Stability' }, ...prose(680, 30, { size: 9 })] },
    ] })
    const scan = await scanOf(bytes, 'annual-report.pdf')
    expect(scan.entries.map(entry => entry.label)).toEqual(['Monetary policy, financial markets and the economy', 'Financial Stability'])
  })

  it('does not turn a separate figure caption title into a chapter heading', async () => {
    const bytes=makePdf({pages:[
      {lines:[{y:700,size:20,font:'Times-Bold',text:'Annual Report'},...prose(650,30)]},
      {lines:[{y:720,size:18,font:'Times-Bold',text:'Monetary Policy'},...prose(680,12),
        {y:460,size:9,font:'Times-Bold',text:'Figur 1'},
        {y:440,size:16,font:'Times-Bold',text:'Exchange Rates Remain Stable'}]},
      {lines:[{y:720,size:18,font:'Times-Bold',text:'Financial Stability'},...prose(680,30)]}
    ]})
    const scan=await scanOf(bytes,'annual-report.pdf')
    expect(scan.entries.map(e=>e.label)).toEqual(['Monetary Policy','Financial Stability'])
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

// QA on production PDFs (#359): plays and novels under one title bookmark, chapters set as a
// numeral alone, two-column papers, OCR scans with title pages, contents pages, scanners' notices
// and library stamps, foreign-language books, scans without a text layer.
describe('PDF scan: the cases QA found (#359)', () => {
  type Line = { x?: number; y: number; size: number; font: string; text: string }
  const text = (top: number, n: number, opts: Record<string, unknown> = {}) => prose(top, n, opts) as Line[]

  it('opens a single title bookmark into its acts and scenes', async () => {
    const bytes = makePdf({
      outline: [{ title: 'Macbeth', page: 1, children: [
        { title: 'ACT I', page: 2, children: [{ title: 'SCENE I. An open Place.', page: 2 }, { title: 'SCENE II. A Camp near Forres.', page: 3 }] },
        { title: 'ACT II', page: 4, children: [{ title: 'SCENE I. Inverness.', page: 4 }] },
      ] }],
      pages: [1, 2, 3, 4].map(n => ({ lines: text(720, 30, { from: n * 9 }) })),
    })
    const s = await scanOf(bytes, 'macbeth.pdf')
    expect(s.nav).toBe('outline')
    expect(s.entries.map(e => [e.label, e.page, e.kind, e.parent])).toEqual([
      ['ACT I', 2, 'part', null],
      ['SCENE I. An open Place.', 2, 'chapter', 'o0'],
      ['SCENE II. A Camp near Forres.', 3, 'chapter', 'o0'],
      ['ACT II', 4, 'part', null],
      ['SCENE I. Inverness.', 4, 'chapter', 'o3'],
    ])
  })

  it('finds chapters set as a Roman numeral alone, the first one too, and tells the language', async () => {
    const german = 'Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt und es war nicht der Traum, den er sich gewünscht hatte, sondern die Wirklichkeit, die mit dem Tage kam'
    const deutsch = (top: number, n: number) => Array.from({ length: n }, (_, i) => ({ x: 72, y: top - i * 15, size: 11, font: 'Times-Roman', text: german.slice((i * 7) % 60, ((i * 7) % 60) + 80) }))
    const bytes = makePdf({ pages: [
      { lines: [{ y: 600, size: 24, font: 'Times-Bold', text: 'Die Verwandlung' }, { y: 560, size: 11, font: 'Times-Roman', text: 'Franz Kafka' }] },
      { lines: [{ x: 280, y: 720, size: 15, font: 'Times-Bold', text: 'I.' }, ...deutsch(690, 40)] },
      { lines: deutsch(720, 44) },
      { lines: [{ x: 280, y: 720, size: 15, font: 'Times-Bold', text: 'II.' }, ...deutsch(690, 40)] },
    ] })
    const s = await scanOf(bytes, 'verwandlung.pdf')
    expect(s.entries.map(e => [e.label, e.page])).toEqual([['I.', 2], ['II.', 4]])
    expect(s.language).toBe('de')
    expect(scanApi.languageOf('x', 'fr-FR')).toBe('fr')
    expect(scanApi.languageOf('Il y avait en Vestphalie, dans le château de monsieur le baron, un jeune garçon à qui la nature avait donné les mœurs les plus douces. Sa physionomie annonçait son âme. Il avait le jugement assez droit, avec l’esprit le plus simple; c’est, je crois, pour cette raison qu’on le nommait Candide, et que les anciens domestiques de la maison le soupçonnaient d’être le fils de la sœur de monsieur le baron.', null)).toBe('fr')
    expect(scanApi.languageOf('Too short to tell.', null)).toBe('')
  })

  it('keeps a heading in the left column apart from the right column beside it', async () => {
    const left = (top: number, n: number, from: number) => text(top, n, { x: 48, width: 42, size: 9.5, from })
    const right = (top: number, n: number, from: number) => text(top, n, { x: 315, width: 42, size: 9.5, from })
    const bytes = makePdf({ pages: [
      { lines: [
        { x: 95, y: 713, size: 17, font: 'Times-Bold', text: 'Attention and Return in Long-Form Reading' },
        { x: 235, y: 691, size: 9.5, font: 'Times-Roman', text: 'A. Researcher and B. Scholar' },
        ...left(660, 6, 0),
        { x: 48, y: 573, size: 11, font: 'Times-Bold', text: '1 Introduction' },
        { x: 315, y: 573, size: 9.5, font: 'Times-Roman', text: 'and arithmetic; and in short, every affirmation' },
        ...left(556, 30, 30), ...right(559, 30, 50),
      ] },
      { lines: [...left(720, 20, 70), { x: 48, y: 440, size: 11, font: 'Times-Bold', text: '2 Related Work' }, { x: 315, y: 440, size: 9.5, font: 'Times-Roman', text: 'of human reason or enquiry may naturally' }, ...left(425, 22, 90), ...right(720, 50, 110)] },
      // A page of small-type references: the body text above them is not made a heading.
      { lines: [{ x: 48, y: 713, size: 9.5, font: 'Times-Roman', text: 'Texts context of notes accumulation texts' }, ...text(700, 40, { x: 48, size: 8, from: 5 })] },
    ] })
    const s = await scanOf(bytes, 'paper.pdf')
    expect(s.entries.map(e => [e.label, e.page])).toEqual([['1 Introduction', 1], ['2 Related Work', 2]])
  })

  it('leaves out a scan’s notice page, title page, contents page, stamps and lines only a little larger', async () => {
    // A scan's text layer: one face, and line sizes that wander (10 to 12 pt for 10.5 pt text).
    const wander = [10, 10.5, 11, 10.5, 12, 10, 11.5, 10.5]
    const scanned = (top: number, n: number, from: number) => text(top, n, { from }).map((l, i) => ({ ...l, size: wander[i % wander.length] }))
    const bytes = makePdf({ pages: [
      { lines: [{ y: 720, size: 14, font: 'Times-Roman', text: 'Usage guidelines' }, ...text(690, 12, { from: 3 }), { y: 500, size: 11, font: 'Times-Roman', text: 'About this book: see Google Book Search at books.google.com for the full text' }, { y: 470, size: 14, font: 'Times-Roman', text: 'About Google Book Search' }] },
      { lines: [
        { y: 700, size: 29, font: 'Times-Roman', text: 'A Study of Memory' }, { y: 650, size: 14, font: 'Times-Roman', text: 'FOR' },
        { y: 600, size: 25, font: 'Times-Roman', text: 'Connected Trains of Thought' }, { y: 480, size: 10, font: 'Times-Roman', text: 'BY' },
        { y: 450, size: 18, font: 'Times-Roman', text: 'E. N. HENDERSON' },
      ] },
      { lines: [{ y: 640, size: 15, font: 'Times-Roman', text: 'CONTENTS.' }, ...['Introductory 1', 'Memory 7', 'The Method 26', 'The Tests 28', 'Summary 83', 'Marks 51', 'Appendix 88'].map((t, i) => ({ y: 600 - i * 16, size: 13, font: 'Times-Roman', text: t }))] },
      { lines: [{ y: 640, size: 17, font: 'Times-Roman', text: 'INTRODUCTORY.' }, ...scanned(600, 34, 0)] },
      { lines: [...scanned(720, 8, 40), { y: 600, size: 12.5, font: 'Times-Roman', text: 'This material we may naturally suppose to be of especial' }, ...scanned(585, 28, 60)] },
      { lines: [...scanned(720, 10, 90), { y: 560, size: 12.5, font: 'Times-Roman', text: 'Results of Laboratory Experimentation.' }, ...scanned(540, 24, 20)] },
      { lines: [{ y: 640, size: 17, font: 'Times-Roman', text: 'PART II. THE SPECIAL RESEARCH.' }, ...scanned(600, 34, 7)] },
      { lines: [...scanned(720, 30, 11), { y: 200, size: 16, font: 'Times-Roman', text: '25 CENTS FINE OF' }] },
    ] })
    const s = await scanOf(bytes, 'memory.pdf')
    expect(s.entries.map(e => [e.label, e.page])).toEqual([['INTRODUCTORY.', 4], ['PART II. THE SPECIAL RESEARCH.', 7]])
  })

  it('counts the pages with text: none for a scan without a text layer, or with only a scanner’s notice', async () => {
    expect((await scanOf(fixtures['IMG_20240512_scan.pdf'], 'IMG_20240512_scan.pdf')).textPages).toBe(0)
    expect((await scanOf(fixtures['PossibleMinds Deutsch (1).pdf'], 'PossibleMinds Deutsch (1).pdf')).textPages).toBe(5)
    const notice = makePdf({ pages: [
      { lines: [{ y: 720, size: 14, font: 'Times-Roman', text: 'About Google Book Search' }, ...text(690, 12, { from: 3 }), { y: 500, size: 11, font: 'Times-Roman', text: 'This is a digital copy of a book that was preserved for generations on library shelves.' }] },
      { images: [{ x: 0, y: 0, w: 612, h: 792, pw: 64, ph: 82 }] },
    ] })
    expect((await scanOf(notice, 'two.pdf')).textPages).toBe(0)
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
    expect(scanApi.metaTitle('arXiv:math/0211159v1 [math.DG] 11 Nov 2002', 'perelman.pdf')).toBeNull()
    expect(scanApi.metaTitle('arXiv:1512.03385v1  [cs.CV]  10 Dec 2015', 'paper.pdf')).toBeNull()
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

// The uploads QA named by their file names on production (29 Oct 2026): each case as the real file has it.
describe('PDF title picker: the real uploads of 29 Oct 2026', () => {
  async function titleOf(bytes: Buffer, fileName: string) {
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise
    try { return await scanApi.titleOf(pdf, { fileName }) } finally { await pdf.destroy() }
  }
  const T = 'Times-Roman', B = 'Times-Bold'
  it('MacKay, book.pdf: no metadata, so the title page’s largest type and its author', async () => {
    const notice = { y: 784, size: 8, font: T, text: 'Copyright Cambridge University Press 2003. On-screen viewing permitted.' }
    const got = await titleOf(makePdf({ pages: [
      { lines: [notice, { y: 632, size: 13, font: T, text: 'Information Theory, Inference, and Learning Algorithms' }, { y: 555, size: 13, font: T, text: 'David J.C. MacKay' }] },
      ...[1, 2].map(() => ({ lines: [notice, ...prose(700, 30)] })),
    ] }), 'book.pdf')
    expect(got).toMatchObject({ title: 'Information Theory, Inference, and Learning Algorithms', author: 'David J.C. MacKay', source: { title: 'printed' } })
  })
  it('Berkshire Hathaway 2023, report.pdf: refuses the print driver’s “printmgr file” and takes the cover’s name, though every page repeats it', async () => {
    const head = { y: 760, size: 9, font: T, text: 'BERKSHIRE HATHAWAY INC.' }
    const got = await titleOf(makePdf({ info: { Title: 'printmgr file' }, pages: [
      { lines: [{ y: 504, size: 18.5, font: B, text: 'BERKSHIRE HATHAWAY INC.' }, { y: 254, size: 13.5, font: T, text: '2023' }, { y: 236, size: 13.5, font: T, text: 'ANNUAL REPORT' }] },
      { lines: [head, ...prose(700, 30)] }, { lines: [head, ...prose(700, 30)] },
    ] }), 'report.pdf')
    expect(got.title).toBe('BERKSHIRE HATHAWAY INC.')
  })
  it('an archive.org scan, scan.pdf: the metadata title and the catalogue’s author without the dates', async () => {
    const got = await titleOf(makePdf({ info: { Title: 'The origin of species', Author: 'Darwin, Charles, 1809-1882' }, pages: [
      { size: [432, 648], images: [{ x: 0, y: 0, w: 432, h: 648, pw: 90, ph: 135 }] },
    ] }), 'scan.pdf')
    expect(got).toEqual({ title: 'The origin of species', author: 'Charles Darwin', source: { title: 'metadata', author: 'metadata' } })
  })
  it('arXiv, paper.pdf: empty metadata, so the printed title and authors', async () => {
    const got = await titleOf(makePdf({ info: { Title: '', Author: '' }, pages: [
      { lines: [{ y: 700, size: 17, font: B, text: 'Attention Is All You Need' }, { y: 660, size: 10, font: T, text: 'Ashish Vaswani' }, ...prose(600, 30, { size: 10 })] },
    ] }), 'paper.pdf')
    expect(got).toMatchObject({ title: 'Attention Is All You Need', author: 'Ashish Vaswani' })
  })
  it('a deck without a title anywhere, deck.pdf: the file name made readable, the metadata author', async () => {
    const got = await titleOf(makePdf({ info: { Author: 'Geoffrey Hinton' }, pages: [{ lines: prose(700, 20) }] }), 'deck (1).pdf')
    expect(got).toMatchObject({ title: 'Deck', author: 'Geoffrey Hinton', source: { title: 'file' } })
  })
  it('refuses tools’ job names and reads catalogue authors', () => {
    for (const raw of ['printmgr file', 'PDFCreator job 12', 'Layout 1', 'doc04512320231120', 'Microsoft Word - report.docx', 'untitled', '2023', 'ab'])
      expect(scanApi.metaTitle(raw, 'x.pdf')).toBeNull()
    expect(scanApi.metaTitle('The origin of species', 'scan.pdf')).toBe('The origin of species')
    expect(scanApi.metaAuthor('Darwin, Charles, 1809-1882')).toBe('Charles Darwin')
    expect(scanApi.metaAuthor('Woolf, Virginia, 1882-1941.')).toBe('Virginia Woolf')
    expect(scanApi.metaAuthor('Geoffrey Hinton')).toBe('Geoffrey Hinton')
  })
})
