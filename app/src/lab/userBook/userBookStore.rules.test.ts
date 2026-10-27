// @vitest-environment jsdom
/**
 * openUserBook never re-cuts a book a reader already has: a stored conversion
 * made under rules 5 opens as it is (healed in memory only), and a book that
 * must be converted again on this device, with a place saved under rules 5,
 * is converted under rules 5. Only a book never converted here gets the current rules (6 and later).
 * IndexedDB is a small in-memory stand-in (the store's own calls only).
 */
import { createRequire } from 'node:module'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { convertPdf } from './pdfEdition'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { zip } from '../../../../addbooks/web/test/make-epub.mjs'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book tests
import { pdfFixtures } from '../../../../addbooks/web/test/make-pdf.mjs'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import { openUserBook } from './userBookStore'
import { PDF_TEXT_CONVERTER, USER_EDITION_CONVERTER, USER_EDITION_FORMAT, type UserBookEdition } from './userEdition'

const OWNER = 'owner-1'
const HEX = 'ab'.repeat(12)

const CONTAINER = '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
const page = (body: string) => `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>x</title></head><body>${body}</body></html>`
/** The Importance of Being Earnest's first act, as Project Gutenberg sets it: rules 5 call the chapter "Scene", rules 6 "First Act". */
function earnest(): ArrayBuffer {
  const speeches = Array.from({ length: 24 }, (_, i) => `<p>${['ALGERNON', 'LANE', 'JACK'][i % 3]}.<br/>Line ${i} of the scene, sir.</p>`).join('')
  const bytes: Uint8Array = zip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', CONTAINER],
    ['OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">t</dc:identifier><dc:title>The Importance of Being Earnest</dc:title><dc:creator>Oscar Wilde</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="a" href="a.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="a"/></spine></package>'],
    ['OEBPS/nav.xhtml', page('<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc"><ol><li><a href="a.xhtml#a">FIRST ACT</a><ol><li><a href="a.xhtml#s">SCENE</a></li></ol></li></ol></nav>')],
    ['OEBPS/a.xhtml', page(`<h2 id="a">FIRST ACT</h2><h3 id="s">SCENE</h3><p>Morning-room in Algernon’s flat in Half-Moon Street.</p>${speeches}`)],
  ])
  return Uint8Array.from(bytes).buffer
}

let records: Map<string, Record<string, unknown>>
beforeEach(() => {
  records = new Map()
  ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
})
afterEach(() => {
  delete (globalThis as { indexedDB?: unknown }).indexedDB
  localStorage.clear()
})

describe('openUserBook keeps every book already converted as it was', () => {
  it('opens a conversion stored under rules 5 as it is, healed in memory only', async () => {
    const stored: UserBookEdition = {
      format: USER_EDITION_FORMAT, converter: 5, title: 'War and Peace', author: 'graf Leo Tolstoy', language: 'en', droppedImages: 0, bylines: true,
      chapters: [{ number: 1, title: 'Chapter 1', paragraphs: ['BOOK ONE: 1805', '“Well, Prince, so Genoa and Lucca are now just family estates.”'] }, { number: 2, title: 'Chapter 2', paragraphs: ['Anna Pávlovna’s drawing room was gradually filling.'] }],
    }
    // No file on the record: converting it again could not even happen.
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, edition: stored })
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(5)
    expect(result.book.edition.chapters.map(chapter => [chapter.number, chapter.title, chapter.paragraphs])).toEqual(stored.chapters.map(chapter => [chapter.number, chapter.title, chapter.paragraphs]))
    expect(result.book.edition.author).toBe('Leo Tolstoy')
    // The stored conversion itself is untouched.
    expect((records.get(`epub:${HEX}`)!.edition as UserBookEdition).author).toBe('graf Leo Tolstoy')
  })

  it('converts a book read before rules 6 again under rules 5, so its saved place points at the same words', async () => {
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, bytes: earnest() })
    localStorage.setItem(`tinct-addbook:place:${HEX}`, JSON.stringify({ chapterNumber: 1, paragraphIndex: 4, wordIndex: 0, updatedAt: 1 }))
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(5)
    expect(result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['Scene'])
    // Paragraph 4 is still the line it was: the speaker alone, as rules 5 set it.
    expect(result.book.edition.chapters[0].paragraphs.slice(0, 5)).toEqual(['FIRST ACT', 'Morning-room in Algernon’s flat in Half-Moon Street.', 'ALGERNON.', 'Line 0 of the scene, sir.', 'LANE.'])
    expect(result.book.place?.paragraphIndex).toBe(4)
    expect((records.get(`epub:${HEX}`)!.edition as UserBookEdition).converter).toBe(5)
  })

  it('converts a book never read here under the current rules', async () => {
    records.set(`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, bytes: earnest() })
    const result = await openUserBook(HEX, { owner: OWNER })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book.edition.converter).toBe(USER_EDITION_CONVERTER)
    expect(result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['First Act'])
    expect(result.book.edition.chapters[0].paragraphs[2]).toBe('ALGERNON. Line 0 of the scene, sir.')
    expect(result.book.edition.speakers).toBe(true)
  })
})

// A PDF on this device: converted to its Tinct text with Add a book's own scripts and pdf.js
// (loaded here as the tests of pdf-text.js load them), on make-pdf.mjs's fixtures.
describe('openUserBook: a PDF as its Tinct text', () => {
  // The repository root (tests run from app/; jsdom's import.meta.url is not a file URL).
  const ROOT = process.cwd().replace(/\/app\/?$/, '') + '/'
  let fixtures: Record<string, Buffer>
  let engine: Parameters<typeof convertPdf>[1] extends infer O ? NonNullable<O extends { engine?: infer E } ? E : never> : never
  beforeAll(async () => {
    const require = createRequire(ROOT + 'app/package.json')
    const quiet = console.log
    console.log = () => {}
    require(ROOT + 'app/public/lab/addbook/vendor/pdfjs/pdf.worker.min.js')
    require(ROOT + 'app/public/lab/addbook/vendor/pdfjs/pdf.min.js')
    console.log = quiet
    require(ROOT + 'app/public/lab/addbook/js/pdf-scan.js')
    require(ROOT + 'app/public/lab/addbook/js/pdf-text.js')
    const g = globalThis as unknown as Record<string, never>
    engine = async () => ({ pdfjs: g.pdfjsLib, scan: g.TinctPdfScan, text: g.TinctPdfText })
    fixtures = (pdfFixtures as () => Record<string, Buffer>)()
  })
  const bytesOf = (name: string) => Uint8Array.from(fixtures[name]).buffer
  const keep = (name: string, extra: Record<string, unknown> = {}) => records.set(`pdf:${HEX}`, { key: `pdf:${HEX}`, kind: 'pdf', owner: OWNER, name, bytes: bytesOf(name), ...extra })
  const converter = () => vi.fn((bytes: ArrayBuffer, options: { fileName?: string; stored?: unknown }) => convertPdf(bytes, { ...options, engine: engine as never }))

  it('converts a book of prose once, keeps it with its default edition, and opens it here', async () => {
    keep('prose_book.pdf')
    const convert = converter()
    // Nothing chosen on this desktop: converted and kept, then on to the viewer, its pages (Margin view, every
    // PDF since 19 Oct 2026; running prose was Tinct text by the desktop's default of 16 Oct).
    expect(await openUserBook(HEX, { owner: OWNER, convert })).toMatchObject({ ok: false, reason: 'pages' })
    expect(records.get(`pdf:${HEX}`)).toMatchObject({ edition: { source: 'pdf' } })
    localStorage.setItem(`tinct-addbook:open-rule:${HEX}`, '2')
    expect(await openUserBook(HEX, { owner: OWNER, convert })).toMatchObject({ ok: false, reason: 'pages' })
    // Convert to Tinct book, chosen on this device: it opens here.
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    const result = await openUserBook(HEX, { owner: OWNER, convert })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.book).toMatchObject({ kind: 'pdf', pdfPages: 21, place: null, edition: { source: 'pdf', converter: PDF_TEXT_CONVERTER, title: 'A Treatise of Small Things' } })
    expect(result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['Chapter 1. Of Ideas', 'Chapter 2. Of Impressions', 'Chapter 3. Of Custom', 'Chapter 4. Of Belief', 'Chapter 5. Of Necessity'])
    const record = records.get(`pdf:${HEX}`)!
    expect(record).toMatchObject({ layout: { default: 'text' }, scan: { v: 7, layout: { default: 'text' } }, pages: 21 })
    expect((record.edition as UserBookEdition).chapters).toEqual(result.book.edition.chapters)
    // The next open reads what is kept.
    const again = await openUserBook(HEX, { owner: OWNER, convert })
    expect(again.ok && again.book.edition.chapters.length).toBe(5)
    expect(convert).toHaveBeenCalledTimes(1)
  })

  it('sends a paper to its pages by default, and keeps its Tinct text for when the reader switches', async () => {
    keep('two_column_paper.pdf')
    const result = await openUserBook(HEX, { owner: OWNER, convert: converter() })
    expect(result).toMatchObject({ ok: false, reason: 'pages' })
    expect(records.get(`pdf:${HEX}`)).toMatchObject({ layout: { default: 'pages' }, edition: { source: 'pdf' } })
    // Chosen in the viewer ("Tinct text"): it opens here.
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    expect((await openUserBook(HEX, { owner: OWNER })).ok).toBe(true)
  })

  it('opens selected text in the shared reader on desktop while preserving original pages and scans', async () => {
    keep('prose_book.pdf')
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    const text = await openUserBook(HEX, { owner: OWNER, desktop: true, sharedReader: true, convert: converter() })
    expect(text).toMatchObject({ ok: true, book: { kind: 'pdf', pdfPages: 21 } })
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"pages"')
    expect(await openUserBook(HEX, { owner: OWNER, desktop: true, sharedReader: true })).toMatchObject({ ok: false, reason: 'pages' })
    keep('IMG_20240512_scan.pdf')
    localStorage.removeItem(`tinct-addbook:edition:${HEX}`)
    expect(await openUserBook(HEX, { owner: OWNER, desktop: true, sharedReader: true, convert: converter() })).toMatchObject({ ok: false, reason: 'pages' })
  })

  it('keeps a PDF read in its pages before Tinct text existed in its pages, prose or not', async () => {
    keep('prose_book.pdf')
    localStorage.setItem(`tinct-addbook:pos:pdf:${HEX}`, JSON.stringify({ page: 7, frac: 0.4, zoom: 1, at: 99 }))
    expect(await openUserBook(HEX, { owner: OWNER, convert: converter() })).toMatchObject({ ok: false, reason: 'pages' })
  })

  it('has no Tinct text for a scan: its pages only; and a PDF kept without its file is downloaded by the viewer', async () => {
    keep('IMG_20240512_scan.pdf')
    expect(await openUserBook(HEX, { owner: OWNER, convert: converter() })).toMatchObject({ ok: false, reason: 'pages_only' })
    expect(records.get(`pdf:${HEX}`)).toMatchObject({ scan: { v: 7, textPages: 0, layout: { default: 'pages-only' } } })
    expect(records.get(`pdf:${HEX}`)!.edition).toBeUndefined()
    records.set(`pdf:${HEX}`, { key: `pdf:${HEX}`, kind: 'pdf', owner: OWNER, name: 'x.pdf' })
    expect(await openUserBook(HEX, { owner: OWNER, convert: converter() })).toMatchObject({ ok: false, reason: 'missing' })
  })

  it('converts again a Tinct text kept under other rules, and never opens an EPUB’s conversion for a PDF', async () => {
    keep('PossibleMinds Deutsch (1).pdf', { edition: { format: USER_EDITION_FORMAT, converter: 6, title: 'x', author: '', language: 'en', droppedImages: 0, chapters: [{ number: 1, title: 'x', paragraphs: ['x'] }] } })
    // Read as Tinct text on this desktop by the reader's choice (its default is its pages since 19 Oct 2026).
    localStorage.setItem(`tinct-addbook:edition:${HEX}`, '"text"')
    const convert = converter()
    const result = await openUserBook(HEX, { owner: OWNER, convert })
    expect(convert).toHaveBeenCalledTimes(1)
    expect(result.ok && result.book.edition.chapters.map(chapter => chapter.title)).toEqual(['Beyond Reward and Punishment', 'Misconceptions of Thinking', 'What It Means to Think'])
  })
})
