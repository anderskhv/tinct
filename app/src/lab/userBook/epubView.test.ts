// @vitest-environment jsdom
/**
 * Where an own EPUB opens (Anders, 19 Oct 2026): Margin view (Add a book's margin reader) on the desktop, the
 * Tinct reader on a phone, the reader's own choice on this device winning on the desktop; and the place
 * crossing between the two by its words, the newer one winning. The same rule and the same word search as
 * public/lab/addbook/js/reader-layout.js (TinctReaderLayout.epubView, findQuote), checked side by side.
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { chooseEpubMargin, epubView, epubViewHere, findQuote, quoteKey, readEpubPlace, writeEpubViewChoice } from './epubView'
import { ownBookHref } from './userBookId'
import { openUserBook } from './userBookStore'
import { writeUserBookPlace } from './userBookPlace'
import { USER_EDITION_FORMAT, type UserBookEdition } from './userEdition'

const require = createRequire(import.meta.url)
require(resolve(__dirname, '../../../public/lab/addbook/js/reader-layout.js'))
const RL = (globalThis as unknown as { TinctReaderLayout: { epubView: typeof epubView; findQuote: typeof findQuote; quoteKey: typeof quoteKey; options(kind: string, o?: Record<string, unknown>): Array<{ id: string; label: string; on: boolean; leaves?: boolean }> } }).TinctReaderLayout
const HEX = 'cd'.repeat(12)

const edition: UserBookEdition = {
  format: USER_EDITION_FORMAT, converter: 6, title: 'Lamplight Essays', author: 'Ed Itor', language: 'en', droppedImages: 0,
  chapters: [
    { number: 1, title: 'Preface', paragraphs: ['If we really do live in a lamplit household, then where does electricity fit into that picture?', 'A second paragraph of the preface.'] },
    { number: 2, title: '1 The Fate of Lamps', paragraphs: ['Modern lamps consist of two pillars, namely the filament, which explains brightness.', 'Philosophers, engineers and unaffiliated enthusiasts have offered incompatible explanations for centuries, and the disagreement continues.'] },
  ],
}

afterEach(() => { localStorage.clear(); Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 }) })

describe('where an EPUB opens (epubView)', () => {
  it('the desktop: Margin view unless the reader chose the Tinct reader here; a phone: the Tinct reader', () => {
    for (const rule of [epubView, RL.epubView]) {
      expect(rule({ phone: false })).toBe('margin')
      expect(rule({ phone: false, own: 'margin' })).toBe('margin')
      expect(rule({ phone: false, own: 'text' })).toBe('text')
      expect(rule({ phone: false, own: 'junk' })).toBe('margin')
      // Phones keep the Tinct reader, whatever this browser kept at a desktop's width.
      expect(rule({ phone: true })).toBe('text')
      expect(rule({ phone: true, own: 'margin' })).toBe('text')
    }
  })

  it('reads this device\'s choice and width', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    expect(epubViewHere(HEX)).toBe('margin')
    writeEpubViewChoice(HEX, 'text')
    expect(epubViewHere(HEX)).toBe('text')
    writeEpubViewChoice(HEX, 'margin')
    expect(epubViewHere(HEX)).toBe('margin')
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    expect(epubViewHere(HEX)).toBe('text')
  })

  it('links an EPUB to its view: the margin reader, else the Tinct reader (a PDF as before)', () => {
    expect(ownBookHref(HEX, 'epub', 'margin')).toBe(`/lab/addbook/?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'epub', 'text')).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'epub', null)).toBe(`/reader?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'pdf', 'pages')).toBe(`/lab/addbook/?userBook=${HEX}`)
    expect(ownBookHref(HEX, 'pdf', 'text')).toBe(`/reader?userBook=${HEX}`)
  })

  it('the Aa panel of an EPUB in Margin view: that view, and Convert to Tinct book; none without the margin', () => {
    expect(RL.options('epub', { epubMargin: true })).toEqual([{ id: 'margin', label: 'Margin view (default)', on: true }, { id: 'text', label: 'Convert to Tinct book', on: false, leaves: true }])
    expect(RL.options('epub')).toEqual([])
  })
})

describe('the place, by its words', () => {
  const chapters = edition.chapters.map(chapter => chapter.paragraphs)
  it('finds words in the paragraphs of another reading of the file, loosely (case, accents, punctuation), the same in both', () => {
    const cases: Array<[string, unknown]> = [
      ['engineers and unaffiliated enthusiasts have offered incompatible explanations for centuries', { chapter: 1, para: 1, word: 1 }],
      ['If we really do live in a lamplit household', { chapter: 0, para: 0, word: 0 }],
      ['“MODERN lamps—consist of two pillars', { chapter: 1, para: 0, word: 0 }],
      // A long quote whose end differs (the other reader cut the paragraph there): its first words still find it.
      ['namely the filament, which explains brightness. And then a sentence this reading does not have at all', { chapter: 1, para: 0, word: 6 }],
      ['words that are nowhere in this book at all', null],
      ['tiny', null],
    ]
    for (const [quote, want] of cases) {
      expect(findQuote(chapters, quote)).toEqual(want)
      expect(RL.findQuote(chapters, quote)).toEqual(want)
    }
    expect(quoteKey('Ça va? Très—bien!')).toBe(RL.quoteKey('Ça va? Très—bien!'))
  })

  it('the Tinct reader opens at the margin reader\'s place when that is newer, and keeps it as its own', () => {
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 100, converter: 6 })
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX}`, JSON.stringify({ page: 3, frac: 0.4, para: 2, word: 1, quote: 'engineers and unaffiliated enthusiasts have offered', at: 5000 }))
    expect(readEpubPlace(HEX, edition)).toEqual({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 1, updatedAt: 5000, converter: 6 })
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:place:${HEX}`)!)).toMatchObject({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 1, updatedAt: 5000 })
    // Read later in the Tinct reader: its own place stands.
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 9000, converter: 6 })
    expect(readEpubPlace(HEX, edition)).toMatchObject({ chapterNumber: 1, paragraphIndex: 1, updatedAt: 9000 })
  })

  it('a place whose words are not found never moves the reader', () => {
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 3, updatedAt: 100, converter: 6 })
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX}`, JSON.stringify({ page: 1, frac: 0, quote: 'nothing like this is in the book', at: 5000 }))
    expect(readEpubPlace(HEX, edition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 3 })
  })

  it('"Margin view" in the Tinct reader: chosen on this device, the words of the place sent for the margin reader to take at once', () => {
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX}`, JSON.stringify({ page: 1, frac: 0.2, zoom: 1.2, para: 0, word: 0, quote: 'old', at: 10 }))
    chooseEpubMargin(HEX, edition, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 2 })
    expect(JSON.parse(localStorage.getItem(`tinct-addbook:epub-view:${HEX}`)!)).toBe('margin')
    const pos = JSON.parse(localStorage.getItem(`tinct-addbook:pos:epub:${HEX}`)!)
    expect(pos).toMatchObject({ zoom: 1.2, via: 't', quote: 'and unaffiliated enthusiasts have offered incompatible explanations for centuries, and the disagreement continues.' })
    expect(pos.at).toBeGreaterThan(10)
  })
})

describe('the Tinct reader sends an EPUB read in Margin view on to the margin reader', () => {
  function fakeIndexedDb(records: Map<string, Record<string, unknown>>) {
    const db = {
      objectStoreNames: { contains: () => true }, createObjectStore() {}, close() {},
      transaction() {
        const tx: Record<string, unknown> & { oncomplete?: () => void } = {}
        setTimeout(() => tx.oncomplete?.(), 5)
        tx.objectStore = () => ({ get(key: string) { const request: { result?: unknown; onsuccess?: () => void } = {}; setTimeout(() => { request.result = records.get(key); request.onsuccess?.() }, 0); return request }, put(value: Record<string, unknown>) { records.set(String(value.key), value) } })
        return tx
      },
    }
    return { open() { const request: { result?: unknown; onsuccess?: () => void } = {}; setTimeout(() => { request.result = db; request.onsuccess?.() }, 0); return request } }
  }
  afterEach(() => { delete (globalThis as { indexedDB?: unknown }).indexedDB })

  it('before any conversion (an EPUB here, or a book not on this device yet); a PDF and the Tinct reader\'s own view are unchanged', async () => {
    const records = new Map<string, Record<string, unknown>>([[`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: 'me', name: 'a.epub', edition }]])
    ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
    expect(await openUserBook(HEX, { owner: 'me', epubView: 'margin' })).toEqual({ ok: false, reason: 'margin', message: '' })
    expect(await openUserBook('ef'.repeat(12), { owner: 'me', epubView: 'margin', account: async () => null })).toEqual({ ok: false, reason: 'margin', message: '' })
    const read = await openUserBook(HEX, { owner: 'me', epubView: 'text' })
    expect(read.ok && read.book.edition.title).toBe('Lamplight Essays')
    const unsaid = await openUserBook(HEX, { owner: 'me' })
    expect(unsaid.ok).toBe(true)
  })
})
