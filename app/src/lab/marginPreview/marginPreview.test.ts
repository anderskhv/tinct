// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { decideMarginPreview, handoffBookIdOf, marginPreviewBookForPage, MARGIN_PREVIEW_KEY, NO_PREVIEW } from './marginPreviewFlag'
import { isMarginPreviewBook, marginPreviewChapters, marginPreviewEditionKey, marginPreviewStart, normalReaderHref } from './marginPreviewModel'
import { loadMarginPreviewBook } from './marginPreviewLoad'
import { getBook } from '../../data/bookRegistry'
import { LAB_POSITION_STORAGE_KEY, type LabBookPlace } from '../labPosition'
import type { EditionData } from '../../types'

const isPreviewBook = (id: string) => isMarginPreviewBook(getBook(id))
const decide = (search: string, sticky = false, handoffBookId: string | null = null) => decideMarginPreview({ search, sticky, handoffBookId, isPreviewBook })

describe('the margin preview flag', () => {
  it('is off without the flag and without the opt-in: the book reader, unchanged, nothing stored', () => {
    for (const search of ['', '?book=frankenstein', '?book=frankenstein&chapter=3', '?userBook=abc', '?layout=phone'])
      expect(decide(search)).toEqual(NO_PREVIEW)
  })
  it('opens a registered book with margin=1 and stores the opt-in', () => {
    expect(decide('?book=frankenstein&margin=1')).toEqual({ bookId: 'frankenstein', sticky: 'on', search: null, consumeHandoff: false })
    expect(decide('?book=to-the-lighthouse&margin=1', true)).toEqual({ bookId: 'to-the-lighthouse', sticky: null, search: null, consumeHandoff: false })
  })
  it('with the opt-in, a book link opens in the preview; margin=0 turns it off and opens the book reader', () => {
    expect(decide('?book=frankenstein', true).bookId).toBe('frankenstein')
    expect(decide('?book=frankenstein&margin=0', true)).toEqual({ bookId: null, sticky: 'off', search: '?book=frankenstein', consumeHandoff: false })
    expect(decide('?book=frankenstein&margin=0', false)).toEqual({ bookId: null, sticky: null, search: '?book=frankenstein', consumeHandoff: false })
  })
  it('never previews the Bible, an unknown book, or a link with its own rules', () => {
    expect(decide('?book=bible&margin=1').bookId).toBeNull()
    expect(decide('?book=no-such-book&margin=1').bookId).toBeNull()
    for (const extra of ['&chapter=2', '&share=abcdefg', '&heldBook=x', '&modern=paid', '&userBook=abc']) expect(decide('?book=frankenstein' + extra, true).bookId).toBeNull()
  })
  it('with the opt-in, a book handed over from the library opens in the preview, and the hand-off is used up', () => {
    expect(decide('', true, 'frankenstein')).toEqual({ bookId: 'frankenstein', sticky: null, search: '?book=frankenstein', consumeHandoff: true })
    expect(decide('', false, 'frankenstein')).toEqual(NO_PREVIEW)
    expect(decide('', true, 'bible').bookId).toBeNull()
    expect(handoffBookIdOf(JSON.stringify({ kind: 'open-reader', bookId: 'frankenstein' }))).toBe('frankenstein')
    expect(handoffBookIdOf('{')).toBeNull()
  })
})

describe('the page wrapper', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear() })
  afterEach(() => { window.history.replaceState(null, '', '/') })
  it('reads nothing more and writes nothing on a normal /reader visit', () => {
    window.history.replaceState(null, '', '/reader?book=frankenstein')
    const set = vi.spyOn(Storage.prototype, 'setItem'), remove = vi.spyOn(Storage.prototype, 'removeItem')
    expect(marginPreviewBookForPage(isPreviewBook)).toBeNull()
    expect(set).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled()
    expect(window.location.search).toBe('?book=frankenstein')
    set.mockRestore(); remove.mockRestore()
  })
  it('stores the opt-in on margin=1 and removes it on margin=0, leaving the address without the flag', () => {
    window.history.replaceState(null, '', '/reader?book=frankenstein&margin=1')
    expect(marginPreviewBookForPage(isPreviewBook)).toBe('frankenstein')
    expect(localStorage.getItem(MARGIN_PREVIEW_KEY)).toBe('1')
    window.history.replaceState(null, '', '/reader?book=frankenstein')
    expect(marginPreviewBookForPage(isPreviewBook)).toBe('frankenstein')
    window.history.replaceState(null, '', '/reader?book=frankenstein&margin=0')
    expect(marginPreviewBookForPage(isPreviewBook)).toBeNull()
    expect(localStorage.getItem(MARGIN_PREVIEW_KEY)).toBeNull()
    expect(window.location.search).toBe('?book=frankenstein')
  })
})

describe('main.tsx', () => {
  it('decides the preview only on /reader, never for a reader’s own book, and otherwise renders the book reader as before', () => {
    const main = readFileSync(resolve(__dirname, '../../main.tsx'), 'utf8')
    expect(main).toContain("const preview = pathname === '/reader' && !userBookHex ? marginPreviewMountForPage(")
    // The desktop frame returns before the stored-data migrations and the book reader's render;
    // a phone renders the book reader itself (marginPreviewMount.test.ts).
    expect(main.indexOf("if (preview?.mount === 'frame'")).toBeLessThan(main.indexOf('storedContentMigrations()'))
    expect(main.indexOf("if (preview?.mount === 'frame'")).toBeLessThan(main.lastIndexOf("render(preview?.mount === 'phone')"))
  })
})

const place = (over: Partial<LabBookPlace> = {}): LabBookPlace => ({
  bookId: 'frankenstein', headerBook: 'Frankenstein', chapterNumber: 3, sequentialChapter: 3, paragraphIndex: 2, wordIndex: 5,
  primaryEditionKey: 'modern-en', updatedAt: 1000, deviceId: 'd', rev: 1, ...over,
})

describe('the book as the margin reader’s text', () => {
  const data: EditionData = {
    chapters: [
      { number: 1, title: 'Letter 1', paragraphs: ['_To Mrs. Saville, England._', 'St. Petersburgh, December 11th.'] } as never,
      { number: 3, title: 'Chapter 3', paragraphs: ['One two', 'A _very_ fine day it was, said she.', 'Last'] } as never,
    ],
    sections: [{ title: 'Part One', chapters: [3] }],
  }
  it('keeps every paragraph in order, its words as the book reader counts them, emphasis as ranges', () => {
    const chapters = marginPreviewChapters(data)
    expect(chapters.map(c => [c.number, c.title, c.section, c.paragraphs.length])).toEqual([[1, 'Letter 1', undefined, 2], [3, 'Chapter 3', 'Part One', 3]])
    expect(chapters[0].paragraphs[0]).toEqual({ text: 'To Mrs. Saville, England.', em: [[0, 25]] })
    const p = chapters[1].paragraphs[1]
    expect(p.text).toBe('A very fine day it was, said she.')
    expect(p.text.slice(...p.em![0])).toBe('very')
    // The same words, in the same places, as the raw paragraph's whitespace split.
    expect(p.text.split(/\s+/).length).toBe('A _very_ fine day it was, said she.'.split(/\s+/).length)
  })
  it('opens at the book reader’s chapter, paragraph and word; a place outside the text falls back safely', () => {
    const chapters = marginPreviewChapters(data), opts = { editionKey: 'modern-en', aligned: () => true }
    expect(marginPreviewStart(place({ paragraphIndex: 1, wordIndex: 2 }), chapters, opts)).toEqual({ chapterNumber: 3, paragraphIndex: 1, wordIndex: 2, updatedAt: 1000 })
    expect(marginPreviewStart(place({ paragraphIndex: 1, wordIndex: 99 }), chapters, opts).wordIndex).toBe(7)
    expect(marginPreviewStart(place({ paragraphIndex: 40 }), chapters, opts)).toEqual({ chapterNumber: 3, paragraphIndex: 0, wordIndex: 0, updatedAt: 1000 })
    expect(marginPreviewStart(place({ chapterNumber: 9 }), chapters, opts)).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 1000 })
    expect(marginPreviewStart(null, chapters, opts)).toEqual({ chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 })
    // Read in another aligned edition: its paragraph, not its word.
    expect(marginPreviewStart(place({ primaryEditionKey: 'original-en', paragraphIndex: 1, wordIndex: 3 }), chapters, opts)).toMatchObject({ paragraphIndex: 1, wordIndex: 0 })
    expect(marginPreviewStart(place({ primaryEditionKey: 'original-en', paragraphIndex: 1 }), chapters, { ...opts, aligned: k => k !== 'original-en' })).toMatchObject({ paragraphIndex: 0 })
  })
  it('reads the main edition: the saved place’s, else the chosen one, else the default (Modern English)', () => {
    const book = getBook('frankenstein')!
    expect(marginPreviewEditionKey(book)).toBe('modern-en')
    expect(marginPreviewEditionKey(book, { prefsEdition: 'original-en' })).toBe('original-en')
    expect(marginPreviewEditionKey(book, { placeEdition: 'original-en', prefsEdition: 'modern-en' })).toBe('original-en')
    expect(marginPreviewEditionKey(book, { placeEdition: 'no-such', prefsEdition: 'bsb-en' })).toBe('modern-en')
    expect(normalReaderHref('to-the-lighthouse')).toBe('/reader?book=to-the-lighthouse&margin=0')
  })
})

describe('loading the preview', () => {
  beforeEach(() => { localStorage.clear() })
  const edition = JSON.parse(readFileSync(resolve(__dirname, '../../../public/data/editions/frankenstein-modern-en.json'), 'utf8')) as EditionData
  const record = (p: LabBookPlace) => ({ books: { [p.bookId]: p }, finished: {}, hidden: {}, lastSettledBookId: p.bookId, lastSettledAt: p.updatedAt, updatedAt: p.updatedAt, deviceId: 'd' })

  it('starts at the newer of the device’s and the account’s place, and never writes the book reader’s keys', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(record(place({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 1000 }))))
    const before = { ...localStorage }
    const set = vi.spyOn(Storage.prototype, 'setItem'), remove = vi.spyOn(Storage.prototype, 'removeItem')
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('/api/lab-position'); expect(init?.method).toBe('GET')
      return new Response(JSON.stringify(record(place({ chapterNumber: 4, paragraphIndex: 3, wordIndex: 2, updatedAt: 2000 }))), { status: 200 })
    })
    const loaded = await loadMarginPreviewBook('frankenstein', { fetchImpl: fetchImpl as unknown as typeof fetch, readToken: async () => 'token', loadEditionImpl: async () => edition })
    expect(loaded).toMatchObject({ bookId: 'frankenstein', editionKey: 'modern-en', title: 'Frankenstein', normalHref: '/reader?book=frankenstein&margin=0' })
    expect(loaded.chapters).toHaveLength(edition.chapters.length)
    expect(loaded.start).toEqual({ chapterNumber: 4, paragraphIndex: 3, wordIndex: 2, updatedAt: 2000 })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(set).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled()
    expect({ ...localStorage }).toEqual(before)
    set.mockRestore(); remove.mockRestore()
  })
  it('signed out: the device’s place, no request', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(record(place({ chapterNumber: 5, paragraphIndex: 0, wordIndex: 0 }))))
    const fetchImpl = vi.fn()
    const loaded = await loadMarginPreviewBook('frankenstein', { fetchImpl: fetchImpl as unknown as typeof fetch, readToken: async () => null, loadEditionImpl: async () => edition })
    expect(loaded.start.chapterNumber).toBe(5)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('round 3: fetches the device place’s edition while the account’s place is asked for, and uses the boot’s early GET', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(record(place({ chapterNumber: 2, updatedAt: 1000 }))))
    const order: string[] = []
    let answer: (r: Response) => void = () => {}
    const fetchImpl = vi.fn(() => { order.push('position'); return new Promise<Response>(r => { answer = r }) })
    const loadEditionImpl = vi.fn(async (_id: string, key: string) => { order.push('edition ' + key); return edition })
    const task = loadMarginPreviewBook('frankenstein', { fetchImpl: fetchImpl as unknown as typeof fetch, readToken: async () => 'token', loadEditionImpl })
    await new Promise(r => setTimeout(r, 0))
    expect(order).toEqual(['edition modern-en', 'position'])
    answer(new Response(JSON.stringify(record(place({ chapterNumber: 4, updatedAt: 2000 }))), { status: 200 }))
    expect((await task).start.chapterNumber).toBe(4)
    expect(loadEditionImpl).toHaveBeenCalledTimes(1)
    // The account's newer place read in another edition: that edition is loaded and read.
    const other = vi.fn(async () => new Response(JSON.stringify(record(place({ chapterNumber: 3, primaryEditionKey: 'original-en', updatedAt: 3000 }))), { status: 200 }))
    const loads = vi.fn(async (_id: string, _key: string) => edition)
    const read = await loadMarginPreviewBook('frankenstein', { fetchImpl: other as unknown as typeof fetch, readToken: async () => 'token', loadEditionImpl: loads })
    expect(read.editionKey).toBe('original-en')
    expect(loads.mock.calls.map(c => c[1])).toEqual(['modern-en', 'original-en'])
    // The head script's early GET with the same token is taken once instead of asking again.
    const slot = window as unknown as Record<string, unknown>
    slot.__tinctPositionPrefetch = { token: 'token', at: Date.now(), body: Promise.resolve(record(place({ chapterNumber: 6, updatedAt: 4000 }))) }
    const none = vi.fn()
    const booted = await loadMarginPreviewBook('frankenstein', { fetchImpl: none as unknown as typeof fetch, readToken: async () => 'token', loadEditionImpl: async () => edition })
    expect(booted.start.chapterNumber).toBe(6)
    expect(none).not.toHaveBeenCalled()
    expect(slot.__tinctPositionPrefetch).toBeUndefined()
  })
  it('refuses the Bible', async () => {
    await expect(loadMarginPreviewBook('bible', { readToken: async () => null })).rejects.toThrow()
  })
})
