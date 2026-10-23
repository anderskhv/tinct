// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { forgetOwnedReaderLocalState, forgetRemovedOwnBooks, hideOwnFromReadingTable, ownReading, ownReadingNow, ownSavedAt, ownShelfSavedAt, pdfReading, readOwnShelf, OWN_SHELF_UNSAVED_PREFIX, OWN_TABLE_HIDDEN_PREFIX, type OwnShelfBook } from './ownShelf'
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

describe('owner-qualified reader data on remote deletion', () => {
  afterEach(() => localStorage.clear())
  it('removes only the deleted owner’s same-hash generation', () => {
    const prefixes = ['text-marks-sync:', 'text-marks-local:', 'text-marks-previous:', 'text-marks-adopted:', 'text-marks-quarantine:',
      'text-marks-canonical:', 'text-cards-canonical:', 'text-cards-adopted:', 'legacy-epub-annotations:', 'legacy-epub-migrated:']
    for (const prefix of prefixes) for (const owner of ['owner-a', 'owner-b']) localStorage.setItem(`tinct-addbook:${prefix}${owner}:${HEX}`, owner)
    localStorage.setItem(`tinct-addbook:text-cards-unassigned:${HEX}`, 'unknown')
    localStorage.setItem(`tinct-addbook:legacy-epub-owner:${HEX}`, 'owner-a')
    for (const owner of ['owner-a', 'owner-b']) for (const kind of ['text-marks', 'text-cards']) localStorage.setItem(`tinct-addbook:${kind}-canonical:${owner}:${HEX}:${'f'.repeat(32)}`, owner)
    for (const owner of ['owner-a', 'owner-b']) for (const kind of ['marks', 'cards']) localStorage.setItem(`tinct-addbook:pdf-original-${kind}:${owner}:${'f'.repeat(32)}:${HEX}`, owner)
    forgetOwnedReaderLocalState('owner-a', HEX)
    for (const prefix of prefixes) {
      expect(localStorage.getItem(`tinct-addbook:${prefix}owner-a:${HEX}`)).toBeNull()
      expect(localStorage.getItem(`tinct-addbook:${prefix}owner-b:${HEX}`)).toBe('owner-b')
    }
    expect(localStorage.getItem(`tinct-addbook:text-cards-unassigned:${HEX}`)).toBe('unknown')
    expect(localStorage.getItem(`tinct-addbook:legacy-epub-owner:${HEX}`)).toBeNull()
    for (const kind of ['text-marks', 'text-cards']) {
      expect(localStorage.getItem(`tinct-addbook:${kind}-canonical:owner-a:${HEX}:${'f'.repeat(32)}`)).toBeNull()
      expect(localStorage.getItem(`tinct-addbook:${kind}-canonical:owner-b:${HEX}:${'f'.repeat(32)}`)).toBe('owner-b')
    }
    for (const kind of ['marks', 'cards']) {
      expect(localStorage.getItem(`tinct-addbook:pdf-original-${kind}:owner-a:${'f'.repeat(32)}:${HEX}`)).toBeNull()
      expect(localStorage.getItem(`tinct-addbook:pdf-original-${kind}:owner-b:${'f'.repeat(32)}:${HEX}`)).toBe('owner-b')
    }
  })
  it('remote account deletion clears its journal before the same bytes can be reuploaded', async () => {
    const owner = 'owner-a', fileId = 'f'.repeat(32)
    const aKey = `tinct-addbook:text-cards-canonical:${owner}:${HEX}:${fileId}`
    const bKey = `tinct-addbook:text-cards-canonical:owner-b:${HEX}:${fileId}`
    localStorage.setItem(aKey, 'old private cards')
    localStorage.setItem(bKey, 'other owner cards')
    const records = [{ key: `epub:${HEX}`, owner, cloudId: fileId }, { key: `epub:${HEX}`, owner: 'owner-b', cloudId: fileId }]
    vi.stubGlobal('indexedDB', { databases: async () => [{ name: 'tinct-addbook' }], open: () => {
      const request: { result?: unknown; onsuccess?: () => void } = {}
      setTimeout(() => {
        const tx: { oncomplete?: () => void; onerror?: () => void; onabort?: () => void } = {}
        const db = { close() {}, transaction: () => tx }
        Object.assign(tx, { objectStore: () => ({ openCursor: () => {
          const cursorRequest: { result?: unknown; onsuccess?: () => void } = {}
          let index = 0
          const next = () => setTimeout(() => {
            const row = records[index]
            cursorRequest.result = row ? { value: row, delete: () => { records.splice(index, 1) }, continue: () => { if (records[index] === row) index++; next() } } : null
            cursorRequest.onsuccess?.()
            if (!row) tx.oncomplete?.()
          }, 0)
          next()
          return cursorRequest
        } }) })
        request.result = db
        request.onsuccess?.()
      }, 0)
      return request
    } })
    expect(await forgetRemovedOwnBooks(owner, new Set())).toEqual([`epub:${HEX}`])
    expect(localStorage.getItem(aKey)).toBeNull()
    expect(localStorage.getItem(bKey)).toBe('other owner cards')
    expect(records).toContainEqual(expect.objectContaining({ owner: 'owner-b' }))
    vi.unstubAllGlobals()
  })
})

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

describe('an own EPUB read only in Margin view (22 Oct 2026)', () => {
  it('is being read from the margin reader\u2019s own place, last read when that place was kept', () => {
    const margin = { [`tinct-addbook:pos:epub:${HEX}`]: { page: 3, frac: 0.2, para: 1, word: 0, quote: 'words', at: 900 } }
    expect(ownReading(HEX, null, 7, store(margin))).toMatchObject({ bookId: `userbook-${HEX}`, lastActiveAt: 900, percent: null })
    // Opened only (no move kept): not being read.
    expect(ownReading(HEX, null, 7, store({ [`tinct-addbook:pos:epub:${HEX}`]: { page: 1, frac: 0 } }))).toBeNull()
    // The later of the two places is when it was last read; the Tinct reader's place still names the chapter.
    const both = { ...margin, [`tinct-addbook:place:${HEX}`]: { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500 } }
    expect(ownReading(HEX, chapters, 1, store(both))).toMatchObject({ chapterNumber: 2, lastActiveAt: 900 })
    expect(ownReading(HEX, null, 7, store({ ...margin, [OWN_TABLE_HIDDEN_PREFIX + HEX]: '950' }))).toBeNull()
  })
})

describe('My shelf’s Read later and Remove from Currently reading for an own book (2026-10-21)', () => {
  afterEach(() => { localStorage.clear() })
  const kept = () => ({
    place: localStorage.getItem(`tinct-addbook:place:${HEX}`),
    pdf: localStorage.getItem(`tinct-addbook:pos:pdf:${HEX}`),
    highlights: localStorage.getItem(`tinct-addbook:highlights:${HEX}`),
  })
  const seed = () => {
    localStorage.setItem(`tinct-addbook:place:${HEX}`, JSON.stringify({ chapterNumber: 2, paragraphIndex: 1, updatedAt: 500 }))
    localStorage.setItem(`tinct-addbook:pos:pdf:${HEX}`, JSON.stringify({ page: 4, at: 500 }))
    localStorage.setItem(`tinct-addbook:highlights:${HEX}`, '[{"id":"h1"}]')
    return kept()
  }

  it('Read later takes it off the reading table onto Saved for later, its place and highlights untouched', () => {
    const before = seed()
    hideOwnFromReadingTable(HEX, 600)
    expect(kept()).toEqual(before)
    expect(ownReading(HEX, chapters, 1)).toBeNull()
    expect(pdfReading(HEX, { pages: 8 }, 1)).toBeNull()
    expect(ownSavedAt(HEX)).toBe(600)
    expect(ownShelfSavedAt(HEX)).toBe(600)
    expect(localStorage.getItem(OWN_SHELF_UNSAVED_PREFIX + HEX)).toBeNull()
  })

  it('Remove from Currently reading takes it off the table but not onto Saved for later; Continue still skips it', () => {
    const before = seed()
    hideOwnFromReadingTable(HEX, 600, { saved: false })
    expect(kept()).toEqual(before)
    expect(ownReading(HEX, chapters, 1)).toBeNull()
    // Continue reads ownSavedAt: the book stays off it.
    expect(ownSavedAt(HEX)).toBe(600)
    expect(ownShelfSavedAt(HEX)).toBeNull()
  })

  it('a later Read later (or the desk’s ×) lists it under Saved for later again; reading on brings it back to the table', () => {
    seed()
    hideOwnFromReadingTable(HEX, 600, { saved: false })
    hideOwnFromReadingTable(HEX, 700)
    expect(ownShelfSavedAt(HEX)).toBe(700)
    localStorage.setItem(`tinct-addbook:place:${HEX}`, JSON.stringify({ chapterNumber: 3, paragraphIndex: 0, updatedAt: 800 }))
    expect(ownReading(HEX, chapters, 1)?.chapterLabel).toBe('Chapter 2')
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
    const book: OwnShelfBook & { reading: typeof reading } = { key: `pdf:${HEX}`, kind: 'pdf', hex: HEX, title: 'Beyond Reward and Punishment', author: 'David Deutsch', cover: 'data:image/jpeg;base64,AAAA', at: 1, href: `/reader?userBook=${HEX}`, reading }
    const row = ownTableBook(book)
    expect(row).toMatchObject({ bookId: `userbook-${HEX}`, title: 'Beyond Reward and Punishment', chapterLabel: 'p. 3 of 8', own: true, wordCount: null, lastActiveAt: 900 })
    expect(row.percent).toBeCloseTo(30)
    expect(ownQuickBookRows([book])[0]).toMatchObject({ chapterLabel: 'p. 3 of 8', href: `/reader?userBook=${HEX}` })
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

  // Rewritten 19 Oct 2026 (Anders: a PDF's view is chosen per device; only the place syncs): a place read in
  // Tinct text (here or on another device) no longer opens the reader; the edition kept on this device does.
  it('opens a PDF in this device\'s edition: its Tinct text in the reader, its pages in the viewer', async () => {
    const [prose, paper, legacy, unknown, switched, chosen] = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6'].map(p => p.repeat(12))
    withRecords([
      pdf(prose, 'text'), pdf(paper, 'pages'), pdf(legacy, 'text'), pdf(unknown), pdf(switched, 'pages'), pdf(chosen, 'pages'),
      { key: `epub:${HEX}`, kind: 'epub', owner: 'me', name: 'b.epub', openedAt: 1 },
    ])
    // Read in the viewer before Tinct text existed, not opened here since: the viewer tells its edition.
    localStorage.setItem(`tinct-addbook:pos:pdf:${legacy}`, JSON.stringify({ page: 4, frac: 0, at: 9 }))
    // Read as Tinct text (here, or on another device: the place says so): not this device's view.
    for (const hex of [switched, chosen]) localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`, JSON.stringify({ page: 2, frac: 0, at: 9, edition: 't' }))
    // Opened in the viewer on this device under the current open rule (reader.js openKind).
    for (const hex of [prose, switched]) localStorage.setItem(`tinct-addbook:open-rule:${hex}`, '2')
    // Convert to Tinct book, chosen on this device.
    localStorage.setItem(`tinct-addbook:edition:${chosen}`, '"text"')
    const hrefs = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))
    // One address for every own book since 22 Oct 2026 ("One Tinct"): the reader there opens the view below.
    expect(hrefs).toEqual({
      // Running prose opened as Tinct text by the desktop's default of 16 Oct; its pages since 19 Oct 2026.
      [prose]: `/reader?userBook=${prose}`,
      [paper]: `/reader?userBook=${paper}`,
      [legacy]: `/reader?userBook=${legacy}`,
      // Not scanned on this device yet: the viewer, which forwards once it has classified it.
      [unknown]: `/reader?userBook=${unknown}`,
      [switched]: `/reader?userBook=${switched}`,
      [chosen]: `/reader?userBook=${chosen}`,
      // An EPUB on the desktop (19 Oct 2026, epubView.ts): Add a book's margin reader.
      [HEX]: `/reader?userBook=${HEX}`,
    })
  })

  // Anders, 19 Oct 2026: EPUBs open in the margin reader on the desktop; phones keep the Tinct reader; the reader's own choice on this device wins.
  it('opens an EPUB in Margin view on the desktop, in the Tinct reader on a phone or when chosen on this device', async () => {
    const [plain, converted, back] = ['e1', 'e2', 'e3'].map(p => p.repeat(12))
    const epub = (hex: string) => ({ key: `epub:${hex}`, kind: 'epub', owner: 'me', name: `${hex}.epub`, openedAt: 1 })
    withRecords([epub(plain), epub(converted), epub(back)])
    localStorage.setItem(`tinct-addbook:epub-view:${converted}`, JSON.stringify('text'))
    localStorage.setItem(`tinct-addbook:epub-view:${back}`, JSON.stringify('margin'))
    const width = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
      expect(Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))).toEqual({
        [plain]: `/reader?userBook=${plain}`,
        [converted]: `/reader?userBook=${converted}`,
        [back]: `/reader?userBook=${back}`,
      })
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
      expect(Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))).toEqual({
        [plain]: `/reader?userBook=${plain}`,
        [converted]: `/reader?userBook=${converted}`,
        [back]: `/reader?userBook=${back}`,
      })
    } finally { Object.defineProperty(window, 'innerWidth', { configurable: true, value: width }) }
  })

  it('a PDF not yet opened here under the desktop rule of 16 Oct 2026 opens in the viewer, which tells its edition: Tinct text by the old default or by a place nobody chose', async () => {
    const [prose, read, chosen] = ['a7', 'b8', 'c9'].map(p => p.repeat(12))
    withRecords([pdf(prose, 'text'), pdf(read, 'text'), pdf(chosen, 'text')])
    // Read as Tinct text when the desktop sent every PDF scoring under 3.5 there (MacKay's extract): no choice kept.
    localStorage.setItem(`tinct-addbook:pos:pdf:${read}`, JSON.stringify({ page: 5, frac: 0.2, at: 9, edition: 't' }))
    // The reader chose Tinct text on this device (Convert to Tinct book): that wins at once.
    localStorage.setItem(`tinct-addbook:pos:pdf:${chosen}`, JSON.stringify({ page: 5, frac: 0.2, at: 9, edition: 't' }))
    localStorage.setItem(`tinct-addbook:edition:${chosen}`, JSON.stringify('text'))
    const hrefs = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))
    // One address for every own book since 22 Oct 2026 ("One Tinct"): the reader there opens the view below.
    expect(hrefs).toEqual({
      [prose]: `/reader?userBook=${prose}`,
      [read]: `/reader?userBook=${read}`,
      [chosen]: `/reader?userBook=${chosen}`,
    })
    // Told by the viewer: on the desktop its pages, running prose too (19 Oct 2026; Tinct text by the default
    // of 16 Oct before), also where that old default was kept as Tinct text (no choice); on a phone, once the
    // viewer has told it (and kept running prose as Tinct text), the library goes straight there.
    localStorage.setItem(`tinct-addbook:open-rule:${prose}`, '2')
    localStorage.setItem(`tinct-addbook:open-rule:${read}`, '1')
    localStorage.setItem(`tinct-addbook:edition:${read}`, JSON.stringify('text'))
    localStorage.setItem(`tinct-addbook:desk-edition:${read}`, JSON.stringify({ edition: 'text', kind: 'paper', by: 'text', v: 1 }))
    const again = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))
    expect(again[prose]).toBe(`/reader?userBook=${prose}`)
    expect(again[read]).toBe(`/reader?userBook=${read}`)
    expect(again[chosen]).toBe(`/reader?userBook=${chosen}`)
    const width = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
      const phone = Object.fromEntries((await readOwnShelf('me')).map(book => [book.hex, book.href]))
      expect(phone[prose]).toBe(`/reader?userBook=${prose}`)
      expect(phone[chosen]).toBe(`/reader?userBook=${chosen}`)
    } finally { Object.defineProperty(window, 'innerWidth', { configurable: true, value: width }) }
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
    expect(books[scan]).toMatchObject({ scan: true, href: `/reader?userBook=${scan}` })
    expect(books[recognised].scan).toBeUndefined()
    expect(books[recognised].href).toBe(`/reader?userBook=${recognised}`)
    expect(books[prose].scan).toBeUndefined()
  })

  it('opens a book of unknown kind in the reader, unless it is a PDF read in its pages', () => {
    expect(ownBookHref(HEX, null, null)).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, null, 'pages')).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'epub', 'pages')).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'pdf', 'text')).toBe(`/reader?userBook=${HEX}`)
  })
})
