// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { LAB_POSITION_STORAGE_KEY, emptyLabPositionState, type LabBookPlace } from '../labPosition'
import type { LabHighlight } from '../labHighlights'
import { placeFromLabBook } from '../useLabPositionSync'
import { bibleBookPages, bibleLinkPlace, bibleSavedPlace, bibleWindow, createBibleLazy, pendingBibleChapter, type BibleManifestEntry } from './marginPreviewBible'
import { cardOfConversation, conversationOfCard } from './marginPreviewCards'
import { loadMarginPreviewBook } from './marginPreviewLoad'
import { applyMarginMarks, marginMarks } from './marginPreviewMarks'
import { isMarginPreviewBook, marginPreviewStart, type MarginPreviewChapter } from './marginPreviewModel'
import { marginPreviewSource, setSourceChapter } from './useMarginPreviewPlace'

/** A Bible manifest as the editions ship it, numbered through: Genesis 1–50 = 1–50, Exodus 1–40 = 51–90, Psalms 1–150 = 479–628. */
const manifest: BibleManifestEntry[] = [
  ...Array.from({ length: 50 }, (_, i) => ({ number: i + 1, title: `Genesis ${i + 1}`, path: `ch${String(i + 1).padStart(4, '0')}.json`, paragraphCount: 4 })),
  ...Array.from({ length: 40 }, (_, i) => ({ number: 51 + i, title: `Exodus ${i + 1}`, paragraphCount: 4 })),
  ...Array.from({ length: 150 }, (_, i) => ({ number: 479 + i, title: `Psalms ${i + 1}`, paragraphCount: 6 })),
]
const verses = (number: number, count = 4) => Array.from({ length: count }, (_, i) => `v${number}.${i} In the beginning was word ${i} of chapter ${number}.`)

const pin = (over: Partial<LabBookPlace>): LabBookPlace => ({
  bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 23, sequentialChapter: 501, paragraphIndex: 2, wordIndex: 3,
  primaryEditionKey: 'bsb-en', updatedAt: 5000, deviceId: 'phone', rev: 1, ...over,
})
const deviceRecord = (...pins: LabBookPlace[]) => ({
  ...emptyLabPositionState('desk', null), books: Object.fromEntries(pins.map(p => [p.bookId, p])),
  lastSettledBookId: pins[0]?.bookId ?? null, lastSettledAt: pins[0]?.updatedAt ?? 0, updatedAt: pins[0]?.updatedAt ?? 0,
})

describe('the Bible in the margin view: chapters', () => {
  const chapters = manifest.map(pendingBibleChapter)
  it('starts from the manifest, every chapter pending, its part its biblical book', () => {
    expect(chapters).toHaveLength(240)
    expect(chapters[0]).toEqual({ number: 1, title: 'Genesis 1', section: 'Genesis', paragraphs: [], pending: true, paragraphCount: 4 })
    expect(chapters[50].section).toBe('Exodus')
  })
  it('a biblical book is the scope (Catch me up, the contents); the window is a chapter and its neighbours in the list', () => {
    expect(bibleBookPages(chapters, 1)).toEqual({ from: 1, to: 50 })
    expect(bibleBookPages(chapters, 52)).toEqual({ from: 51, to: 90 })
    expect(bibleBookPages(chapters, 113)).toEqual({ from: 91, to: 240 })
    // Genesis 50 to Exodus 1 across a book's end; Psalms 1 after Exodus 40 by the list, not by number + 1.
    expect(bibleWindow(chapters, 50)).toEqual([49, 50, 51])
    expect(bibleWindow(chapters, 479)).toEqual([90, 479, 480])
    expect(bibleWindow(chapters, 1)).toEqual([1, 2])
  })
  it('loads only what is asked, once, keeps the list, and tells who listens', async () => {
    const list = manifest.map(pendingBibleChapter)
    const fetchText = vi.fn(async (entry: { number: number; path?: string }) => verses(entry.number))
    const lazy = createBibleLazy(list, fetchText, new Map(manifest.map(e => [e.number, e.path])))
    const heard: number[][] = []
    lazy.subscribe(numbers => heard.push(numbers))
    const [a, b] = await Promise.all([lazy.load([1, 2, 2]), lazy.load([2, 3])])
    expect(a).toEqual([1, 2]); expect(b).toEqual([2, 3])
    expect(fetchText).toHaveBeenCalledTimes(3)
    expect(fetchText).toHaveBeenCalledWith({ number: 1, path: 'ch0001.json' })
    expect(list.filter(c => !c.pending).map(c => c.number)).toEqual([1, 2, 3])
    expect(list[0]).toEqual({ number: 1, title: 'Genesis 1', section: 'Genesis', paragraphs: verses(1).map(text => ({ text })) })
    expect(heard.flat().sort((x, y) => x - y)).toEqual([1, 2, 2, 3])
    expect(await lazy.load([1])).toEqual([1])
    expect(fetchText).toHaveBeenCalledTimes(3)
    expect(lazy.scope(60)).toEqual({ from: 51, to: 90 })
  })
  it('a chapter that fails to load stays pending and is asked again later', async () => {
    const list = manifest.map(pendingBibleChapter)
    let fail = true
    const lazy = createBibleLazy(list, async entry => { if (fail) throw new Error('offline'); return verses(entry.number) })
    expect(await lazy.load([5])).toEqual([])
    expect(list[4].pending).toBe(true)
    fail = false
    expect(await lazy.load([5])).toEqual([5])
    expect(list[4].pending).toBeUndefined()
  })
})

describe('the Bible in the margin view: places', () => {
  const chapters = manifest.map(pendingBibleChapter)
  it('a biblical book\'s pin opens at its chapter in the list (Psalms 23 = 501), its paragraph checked by the manifest', () => {
    const aligned = () => true
    expect(marginPreviewStart(pin({}), chapters, { editionKey: 'bsb-en', aligned, sequential: true })).toEqual({ chapterNumber: 501, paragraphIndex: 2, wordIndex: 3, updatedAt: 5000 })
    // Past the chapter's paragraphs: its start.
    expect(marginPreviewStart(pin({ paragraphIndex: 9 }), chapters, { editionKey: 'bsb-en', aligned, sequential: true })).toMatchObject({ chapterNumber: 501, paragraphIndex: 0, wordIndex: 0 })
    // Without `sequential` (every other book) the place's chapterNumber is the list's, as before.
    expect(marginPreviewStart(pin({}), chapters, { editionKey: 'bsb-en', aligned }).chapterNumber).toBe(23)
  })
  it('a pin opens at its own book\'s chapter (the Bible reader\'s check), found by book and chapter when its number is not that one', () => {
    expect(bibleSavedPlace(pin({}), chapters)).toEqual(pin({}))
    expect(bibleSavedPlace(pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 23 }), chapters)).toMatchObject({ bookId: 'genesis', chapterNumber: 23, sequentialChapter: 23 })
    expect(bibleSavedPlace(pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 77 }), chapters)).toBeNull()
    expect(bibleSavedPlace(pin({ bookId: 'tobit', headerBook: 'Tobit', chapterNumber: 1, sequentialChapter: 1190 }), chapters)).toBeNull()
    expect(bibleSavedPlace(null, chapters)).toBeNull()
  })
  it('a link\'s chapter counts through the Bible and becomes its biblical book\'s place', () => {
    expect(bibleLinkPlace(chapters, { editionKey: 'kjv-en', chapterNumber: 52, paragraphIndex: 1, wordIndex: 0 }, 9000)).toMatchObject({ bookId: 'exodus', headerBook: 'Exodus', chapterNumber: 2, sequentialChapter: 52, paragraphIndex: 1, primaryEditionKey: 'kjv-en', updatedAt: 9000 })
    expect(bibleLinkPlace(chapters, { editionKey: null, chapterNumber: 400, paragraphIndex: 0, wordIndex: 0 }, 1)).toBeNull()
  })
  it('a place written from the margin view is its biblical book\'s pin, never one under `bible`', () => {
    const loaded = manifest.map(pendingBibleChapter)
    const model = { bookId: 'bible', editionKey: 'bsb-en', editionLabel: 'Berean Standard Bible', title: 'The Bible', author: 'Various', language: 'en', chapters: loaded, start: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 }, normalHref: '/reader?book=bible&margin=0' }
    const source = marginPreviewSource(model)
    expect(source).toMatchObject({ bookId: 'bible', headerBook: 'Genesis', headerChapter: '1', chapterNumber: 1 })
    setSourceChapter(source, model, { number: 501, title: 'Psalms 23' })
    const place = placeFromLabBook(source, { paragraphIndex: 2, wordIndex: 4 }, 'desk', 7000, 3)
    expect(place).toMatchObject({ bookId: 'psalms', headerBook: 'Psalms', chapterNumber: 23, sequentialChapter: 501, paragraphIndex: 2, wordIndex: 4 })
    // Another book keeps its own title and chapter as before.
    const other = { ...model, bookId: 'frankenstein', title: 'Frankenstein' }
    const s2 = marginPreviewSource(other)
    setSourceChapter(s2, other, { number: 3, title: 'Chapter 3' })
    expect(s2).toMatchObject({ headerBook: 'Frankenstein', headerChapter: 'Chapter 3', chapterTitle: 'Chapter 3', chapterNumber: 3 })
  })
})

describe('the Bible in the margin view: loading', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { vi.restoreAllMocks() })
  const deps = (over: Record<string, unknown> = {}) => {
    const outline = vi.fn(async (_editionKey: string) => ({ chapters: manifest }))
    const chapter = vi.fn(async (_editionKey: string, entry: { number: number }) => verses(entry.number, entry.number >= 479 ? 6 : 4))
    return { outline, chapter, deps: { storage: localStorage, readToken: async () => null, loadBibleOutline: outline, loadBibleChapter: chapter, ...over } }
  }
  it('opens the Bible on a desktop only', () => {
    expect(isMarginPreviewBook(getBook('bible'))).toBe(true)
    expect(isMarginPreviewBook(getBook('bible'), { phone: true })).toBe(false)
    expect(isMarginPreviewBook(getBook('frankenstein'), { phone: true })).toBe(true)
  })
  it('opens at this device\'s newest biblical-book pin, loading that chapter and its neighbours only', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(deviceRecord(pin({}), pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 3, sequentialChapter: 3, updatedAt: 1000 }))))
    const { outline, chapter, deps: d } = deps()
    const book = await loadMarginPreviewBook('bible', d)
    expect(outline).toHaveBeenCalledWith('bsb-en')
    expect(book.chapters).toHaveLength(240)
    expect(book.start).toEqual({ chapterNumber: 501, paragraphIndex: 2, wordIndex: 3, updatedAt: 5000 })
    expect(chapter.mock.calls.map(c => c[1].number).sort((a, b) => a - b)).toEqual([500, 501, 502])
    expect(book.chapters.filter(c => !c.pending).map(c => c.number)).toEqual([500, 501, 502])
    expect(book.lazy?.scope(1)).toEqual({ from: 1, to: 50 })
    // More as the frame asks; never the whole book.
    await book.lazy!.load([503])
    expect(chapter).toHaveBeenCalledTimes(4)
    // Nothing of the book reader's was written.
    expect(JSON.parse(localStorage.getItem(LAB_POSITION_STORAGE_KEY)!).books.bible).toBeUndefined()
  })
  it('with no place, Genesis 1; a link opens its chapter in its edition', async () => {
    const { chapter, deps: d } = deps()
    const fresh = await loadMarginPreviewBook('bible', d)
    expect(fresh.start).toMatchObject({ chapterNumber: 1, paragraphIndex: 0, updatedAt: 0 })
    expect(chapter.mock.calls.map(c => c[1].number).sort((a, b) => a - b)).toEqual([1, 2])
    const { outline, deps: d2 } = deps({ at: { editionKey: 'kjv-en', chapterNumber: 50, paragraphIndex: 3, wordIndex: 2 }, now: () => 8000 })
    const linked = await loadMarginPreviewBook('bible', d2)
    expect(outline).toHaveBeenCalledWith('kjv-en')
    expect(linked.editionKey).toBe('kjv-en')
    expect(linked.start).toEqual({ chapterNumber: 50, paragraphIndex: 3, wordIndex: 2, updatedAt: 8000 })
    expect(linked.chapters.filter(c => !c.pending).map(c => c.number)).toEqual([49, 50, 51])
  })
  it('a pin opens at its own book\'s chapter; one this edition lacks opens at Genesis 1', async () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(deviceRecord(pin({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 23 }))))
    expect((await loadMarginPreviewBook('bible', deps().deps)).start.chapterNumber).toBe(23)
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify(deviceRecord(pin({ bookId: 'tobit', headerBook: 'Tobit', chapterNumber: 1, sequentialChapter: 1190 }))))
    expect((await loadMarginPreviewBook('bible', deps().deps)).start.chapterNumber).toBe(1)
  })
})

describe('the Bible in the margin view: marks and cards in chapters not loaded yet', () => {
  const chapters = (): MarginPreviewChapter[] => manifest.slice(0, 3).map(pendingBibleChapter)
  const hl = (over: Partial<LabHighlight>): LabHighlight => ({
    id: 'h1', bookId: 'bible', editionKey: 'bsb-en', chapterNumber: 2, paragraphIndex: 1, fromWord: 0, endParagraphIndex: 1, toWord: 3,
    color: 'gold', text: 'v2.1 In the', updatedAt: 100, ...over,
  } as LabHighlight)
  it('a highlight or note in a pending chapter is not shown, never changed and never removed', () => {
    const list = chapters()
    list[0] = { ...list[0], pending: undefined, paragraphs: verses(1).map(text => ({ text })) }
    delete list[0].pending; delete list[0].paragraphCount
    const scope = { bookId: 'bible', editionKey: 'bsb-en', chapters: list }
    const all = [hl({}), hl({ id: 'h2', chapterNumber: 1 }), hl({ id: 'n1', chapterNumber: 2, fromWord: 0, toWord: 0, text: '', note: 'kept', margin: 'note' } as Partial<LabHighlight>)]
    const shown = marginMarks(all, scope)
    expect(shown.map(m => m.id)).toEqual(['h2'])
    // The frame hands back what it was shown: nothing changes.
    expect(applyMarginMarks(all, shown, scope).changed).toBe(false)
    // Chapter 2 loads; a list made before it (without h1 and n1) removes nothing there.
    list[1] = { number: 2, title: 'Genesis 2', section: 'Genesis', paragraphs: verses(2).map(text => ({ text })) }
    const covered = new Set([1])
    const r = applyMarginMarks(all, shown, scope, 200, { covered: h => covered.has(h.chapterNumber) })
    expect(r.changed).toBe(false)
    expect(r.next).toEqual(all)
    // A list made with chapter 2 that leaves h1 out does remove it (the reader deleted it).
    covered.add(2)
    expect(applyMarginMarks(all, marginMarks(all, scope).filter(m => m.id !== 'h1'), scope, 200, { covered: h => covered.has(h.chapterNumber) }).removed.map(h => h.id)).toEqual(['h1'])
  })
  it('a card in a pending chapter is not shown, and a frame\'s copy of it is never written over the stored one', () => {
    const list = chapters()
    const scope = { bookId: 'bible', editionKey: 'bsb-en', chapters: list }
    const stored = conversationOfCard({ id: 'c1', kind: 'explain', page: 2, span: [2, 20, 40], text: 'x', turns: [{ role: 'assistant', content: 'Answer' }], at: 10, u: 10 }, { ...scope, chapters: [list[0], { number: 2, title: 'Genesis 2', section: 'Genesis', paragraphs: verses(2).map(text => ({ text })) }, list[2]] })!
    expect(stored.card?.anchor).toBeTruthy()
    expect(cardOfConversation(stored, scope)).toBeNull()
    expect(conversationOfCard({ id: 'c1', kind: 'explain', page: 2, text: 'x', turns: [], at: 10, u: 11 }, scope)).toBeNull()
    // Removing a card still works there.
    expect(conversationOfCard({ id: 'c1', page: 2, gone: true, u: 12 }, scope)?.card?.gone).toBe(true)
  })
})
