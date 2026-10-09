// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ownReading, ownReadingNow, pdfReading, readOwnShelf, OWN_TABLE_HIDDEN_PREFIX, type OwnShelfBook } from './ownShelf'
import { ownBookHref } from './userBookId'
import { ownQuickBookRows, withOwnBookRows, type QuickBookRow } from '../../preReader/quickBookSwitcher'
import { ownTableBook, withOwnReading, type ReadingTableBook } from '../../libraryTwoReading'

const HEX = 'cc12cd34ef56ab12cd34ef56'
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
const chapters = [
  { number: 1, title: 'Letter 1', paragraphs: [words(100), words(100)] },
  { number: 2, title: 'Chapter 1', paragraphs: [words(50), words(50), words(50), words(50)] },
  { number: 3, title: 'Chapter 2', paragraphs: [words(400)] },
]
const store = (values: Record<string, unknown>) => (key: string) => values[key] ?? null

describe('an own book being read', () => {
  it('names its chapter, how far through the book it is and its length, from this device', () => {
    const reading = ownReading(HEX, chapters, 1, store({ [`tinct-addbook:place:${HEX}`]: { chapterNumber: 2, paragraphIndex: 2, wordIndex: 10, updatedAt: 500 } }))!
    expect(reading).toMatchObject({ bookId: `userbook-${HEX}`, chapterNumber: 2, chapterLabel: 'Chapter 1', wordCount: 800, lastActiveAt: 500 })
    // 200 + 100 + 10 of 800 words.
    expect(reading.percent).toBeCloseTo(38.75)
    expect(reading.headline).toBe('You’re in the middle of Chapter 1')
  })

  it('is not being read without a saved place, and leaves the reading table when removed since', () => {
    expect(ownReading(HEX, chapters, 1, store({}))).toBeNull()
    const place = { [`tinct-addbook:place:${HEX}`]: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 500 } }
    expect(ownReading(HEX, chapters, 1, store({ ...place, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '600' }))).toBeNull()
    // Reading on after the removal brings it back.
    expect(ownReading(HEX, chapters, 1, store({ ...place, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '400' }))?.chapterLabel).toBe('Letter 1')
  })

  it('without its text on this device, keeps the place time and claims no progress line', () => {
    const reading = ownReading(HEX, null, 7, store({ [`tinct-addbook:place:${HEX}`]: { chapterNumber: 4, paragraphIndex: 0, wordIndex: 0 } }))!
    expect(reading).toMatchObject({ chapterLabel: '', headline: '', percent: null, wordCount: null, lastActiveAt: 7 })
  })
})

describe('a PDF being read', () => {
  const scan = { entries: [{ id: 'h0', label: 'Misconceptions of Thinking', page: 3, kind: 'chapter', parent: null }, { id: 'h1', label: 'What It Means to Think', page: 6, kind: 'chapter', parent: null }] }
  it('shows its page in place of a chapter, with how far through it is, and no time left', () => {
    const reading = pdfReading(HEX, { pages: 8 }, 1, store({ [`tinct-addbook:pos:pdf:${HEX}`]: { page: 3, frac: 0.4, zoom: 1, pages: 8, at: 900 } }))!
    expect(reading).toMatchObject({ bookId: `userbook-${HEX}`, chapterLabel: 'p. 3 of 8', headline: '', wordCount: null, lastActiveAt: 900 })
    expect(reading.percent).toBeCloseTo(30)
  })
  it('says which real chapter the page is in, when the scan found chapters', () => {
    const reading = pdfReading(HEX, { pages: 8, scan }, 1, store({ [`tinct-addbook:pos:pdf:${HEX}`]: { page: 4, frac: 0, pages: 8, at: 900 } }))!
    expect(reading.chapterLabel).toBe('p. 4 of 8')
    expect(reading.headline).toBe('You’re in the middle of Misconceptions of Thinking')
  })
  it('stands on the reading table and in Reading now like an EPUB, opening at its own address', () => {
    const reading = pdfReading(HEX, { pages: 8 }, 1, store({ [`tinct-addbook:pos:pdf:${HEX}`]: { page: 3, frac: 0.4, pages: 8, at: 900 } }))!
    const book: OwnShelfBook & { reading: typeof reading } = { key: `pdf:${HEX}`, kind: 'pdf', hex: HEX, title: 'Beyond Reward and Punishment', author: 'David Deutsch', cover: 'data:image/jpeg;base64,AAAA', at: 1, href: `/lab/addbook/?userBook=${HEX}`, reading }
    const row = ownTableBook(book)
    expect(row).toMatchObject({ bookId: `userbook-${HEX}`, title: 'Beyond Reward and Punishment', chapterLabel: 'p. 3 of 8', own: true, wordCount: null, lastActiveAt: 900 })
    expect(row.percent).toBeCloseTo(30)
    expect(ownQuickBookRows([book])[0]).toMatchObject({ chapterLabel: 'p. 3 of 8', href: `/lab/addbook/?userBook=${HEX}` })
  })
  it('is not being read before a page is kept, and an older place (no time, no page count) still counts', () => {
    expect(pdfReading(HEX, { pages: 8 }, 1, store({}))).toBeNull()
    const old = pdfReading(HEX, { pages: 5 }, 77, store({ [`tinct-addbook:pos:pdf:${HEX}`]: { page: 9, frac: 0, zoom: 1 } }))!
    expect(old).toMatchObject({ chapterLabel: 'p. 5 of 5', lastActiveAt: 77 })
    expect(pdfReading(HEX, { pages: 5 }, 77, store({ [`tinct-addbook:pos:pdf:${HEX}`]: { page: 2, at: 500 }, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '600' }))).toBeNull()
  })
})

const own = (hex: string, title: string, lastActiveAt: number, cover: string | null = 'data:image/jpeg;base64,AAAA'): OwnShelfBook & { reading: NonNullable<OwnShelfBook['reading']> } => ({
  key: `epub:${hex}`, kind: 'epub', hex, title, author: 'A. Writer', cover, at: 1, href: `/reader?userBook=${hex}`,
  reading: { bookId: `userbook-${hex}`, chapterNumber: 3, chapterLabel: 'Chapter Three', headline: 'You’re in the middle of Chapter Three', percent: 25, wordCount: 90000, lastActiveAt },
})

describe('own books beside Tinct’s', () => {
  it('lists the most recently read first', () => {
    const books = [own('aa', 'Old', 1), { ...own('bb', 'Unread', 9), reading: null }, own('cc', 'New', 5)]
    expect(ownReadingNow(books).map(book => book.title)).toEqual(['New', 'Old'])
  })

  it('switcher rows open the own book at its own URL, ordered with Tinct’s rows by time', () => {
    const tinct = [{ bookId: 'frankenstein', title: 'Frankenstein', chapterLabel: 'Chapter 7', coverSrc: '/covers/v2/frankenstein.webp', coverSrcSet: null, coverTone: null, lastActiveAt: 4 }] as QuickBookRow[]
    const rows = withOwnBookRows(tinct, ownQuickBookRows([own('cc', 'The Sovereign Child', 6), own('dd', 'Notes', 2)]))
    expect(rows.map(row => [row.title, row.chapterLabel, row.href ?? null])).toEqual([
      ['The Sovereign Child', 'Chapter Three', '/reader?userBook=cc'],
      ['Frankenstein', 'Chapter 7', null],
      ['Notes', 'Chapter Three', '/reader?userBook=dd'],
    ])
    expect(rows[0].coverSrc).toBe('data:image/jpeg;base64,AAAA')
  })

  it('reading-table rows have the same fields as Tinct’s books, the hero going to the most recent', () => {
    const tinct = [{ bookId: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', cover: '/covers/v2/frankenstein.webp', wordCount: 75000, tone: '#0a1a0a', chapterLabel: 'Chapter 7', headline: 'You’re in the middle of Chapter 7', percent: 42, recap: null, lastActiveAt: 4 }] as ReadingTableBook[]
    const table = withOwnReading(tinct, [own('cc', 'The Sovereign Child', 6)])
    expect(table.map(book => book.bookId)).toEqual(['userbook-cc', 'frankenstein'])
    expect(table[0]).toEqual(ownTableBook(own('cc', 'The Sovereign Child', 6)))
    expect(table[0]).toMatchObject({ title: 'The Sovereign Child', author: 'A. Writer', cover: 'data:image/jpeg;base64,AAAA', chapterLabel: 'Chapter Three', percent: 25, wordCount: 90000, recap: null, own: true })
    expect(withOwnReading(tinct, [])).toBe(tinct)
  })
})

describe('where an own book opens', () => {
  /** Add a book's IndexedDB, in memory: the reads readOwnShelf makes (one cursor over `books`). */
  function withRecords(records: Array<Record<string, unknown>>) {
    const db = {
      objectStoreNames: { contains: () => true },
      close() {},
      transaction: () => ({
        objectStore: () => ({
          openCursor() {
            const request: { result?: unknown; onsuccess?: () => void } = {}
            let i = 0
            const step = () => setTimeout(() => {
              request.result = i < records.length ? { value: records[i], continue: () => { i += 1; step() } } : null
              request.onsuccess?.()
            }, 0)
            step()
            return request
          },
        }),
      }),
    }
    vi.stubGlobal('indexedDB', {
      databases: async () => [{ name: 'tinct-addbook' }],
      open() {
        const request: { result?: unknown; onsuccess?: () => void } = {}
        setTimeout(() => { request.result = db; request.onsuccess?.() }, 0)
        return request
      },
    })
  }
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear() })
  const pdf = (hex: string, layout?: string) => ({ key: `pdf:${hex}`, kind: 'pdf', owner: 'me', name: `${hex}.pdf`, openedAt: 1, ...(layout ? { scan: { v: 5, entries: [], layout: { default: layout } } } : {}) })

  it('opens a PDF in the edition it is read in: its Tinct text in the reader, its pages in the viewer', async () => {
    const [prose, paper, legacy, unknown, switched] = ['a1', 'b2', 'c3', 'd4', 'e5'].map(p => p.repeat(12))
    withRecords([
      pdf(prose, 'text'), pdf(paper, 'pages'), pdf(legacy, 'text'), pdf(unknown), pdf(switched, 'pages'),
      { key: `epub:${HEX}`, kind: 'epub', owner: 'me', name: 'b.epub', openedAt: 1 },
    ])
    // Read in the viewer before Tinct text existed: it stays in its pages until the reader switches.
    localStorage.setItem(`tinct-addbook:pos:pdf:${legacy}`, JSON.stringify({ page: 4, frac: 0, at: 9 }))
    // Read as Tinct text (here, or on another device: the place says so).
    localStorage.setItem(`tinct-addbook:pos:pdf:${switched}`, JSON.stringify({ page: 2, frac: 0, at: 9, edition: 't' }))
    const hrefs = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))
    expect(hrefs).toEqual({
      [prose]: `/reader?userBook=${prose}`,
      [paper]: `/lab/addbook/?userBook=${paper}`,
      [legacy]: `/lab/addbook/?userBook=${legacy}`,
      // Not scanned on this device yet: the viewer, which forwards once it has classified it.
      [unknown]: `/lab/addbook/?userBook=${unknown}`,
      [switched]: `/reader?userBook=${switched}`,
      [HEX]: `/reader?userBook=${HEX}`,
    })
  })

  it('marks a scan whose text is not on this device, and opens one whose recognised text is here as Tinct text', async () => {
    const [scan, recognised, prose] = ['f1', 'f2', 'f3'].map(p => p.repeat(12))
    const scanned = { v: 5, entries: [], textPages: 0, layout: { default: 'pages-only' } }
    withRecords([
      { ...pdf(scan), scan: scanned },
      { ...pdf(recognised), scan: scanned, edition: { format: 'tinct-user-edition-v1', converter: 1, source: 'ocr', title: 't', author: '', language: 'en', droppedImages: 0, chapters: [{ number: 1, title: 't', paragraphs: ['x'] }] } },
      pdf(prose, 'text'),
    ])
    // The recognised text reached this device: it opens as Tinct text from now on (pdfEditions.ts adoptOcrEditionChoice).
    localStorage.setItem(`tinct-addbook:edition:${recognised}`, '"text"')
    const books = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book]))
    expect(books[scan]).toMatchObject({ scan: true, href: `/lab/addbook/?userBook=${scan}` })
    expect(books[recognised].scan).toBeUndefined()
    expect(books[recognised].href).toBe(`/reader?userBook=${recognised}`)
    expect(books[prose].scan).toBeUndefined()
  })

  it('opens a book of unknown kind in the reader, unless it is a PDF read in its pages', () => {
    expect(ownBookHref(HEX, null, null)).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, null, 'pages')).toBe(`/lab/addbook/?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'epub', 'pages')).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'pdf', 'text')).toBe(`/reader?userBook=${HEX}`)
  })
})
