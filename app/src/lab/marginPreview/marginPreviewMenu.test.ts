// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { DEFAULT_LAB_PREFS, LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import { marginPreviewMenu, marginReadingChoices } from './marginPreviewMenu'
import { marginVoiceChoices, withMarginVoice } from './marginListenModel'
import type { MarginPreviewBook } from './marginPreviewModel'
import { landEditionSwitch, readEditionSwitch, rememberEditionSwitch } from '../labEditionSwitch'

const book = getBook('frankenstein')!
const main = book.editions[0].key

describe('the margin preview t menu: Reading settings', () => {
  it('offers the book’s editions as Main version and the others (or None) as Compare version', () => {
    const c = marginReadingChoices(book, main, { compareOpen: false, compareEdition: '' })
    expect(c.edition).toBe(main)
    expect(c.editions.map(e => e.value)).toContain(main)
    expect(c.compareEdition).toBe('')
    expect(c.compareEditions[0]).toEqual({ value: '', label: 'None' })
    expect(c.compareEditions.map(e => e.value)).not.toContain(main)
  })
  it('names the compare edition the reader chose, never the main one', () => {
    const other = book.editions.find(e => e.key !== main)!.key
    expect(marginReadingChoices(book, main, { compareOpen: true, compareEdition: other }).compareEdition).toBe(other)
    expect(marginReadingChoices(book, main, { compareOpen: true, compareEdition: main }).compareEdition).not.toBe(main)
  })
  it('voice: the book reader’s choices, written as its voice row writes them', () => {
    const grok = marginVoiceChoices(DEFAULT_LAB_PREFS, 'grok')
    expect(grok.options.map(o => o.value)).toEqual(['female', 'male', 'orion', 'eve'])
    expect(withMarginVoice(DEFAULT_LAB_PREFS, 'eve')).toMatchObject({ audiobookVoice: 'eve', voicePersonaChosen: true })
    expect(withMarginVoice({ ...DEFAULT_LAB_PREFS, audiobookVoice: 'eve' }, 'male')).toMatchObject({ audiobookVoice: null, voicePersona: 'male' })
    expect(marginVoiceChoices(DEFAULT_LAB_PREFS, undefined).options.map(o => o.value)).toEqual(['female', 'male'])
  })
})

describe('the margin preview t menu: a new main version keeps the place', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })
  it('opens the preview again at the same chapter, paragraph and word in the edition chosen', async () => {
    const other = book.editions.find(e => e.key !== main)!.key
    const model = { bookId: book.id, editionKey: main, chapters: [{ number: 1 }, { number: 2 }, { number: 3 }] } as unknown as MarginPreviewBook
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as unknown as Location)
    const menu = marginPreviewMenu(book.id, Promise.resolve(model))
    menu.setEdition(other, { page: 3, para: 7, word: 4 })
    await new Promise(r => setTimeout(r, 0))
    expect(assign).toHaveBeenCalledWith(`/reader?book=${book.id}&margin=1&edition=${encodeURIComponent(other)}&chapter=3&paragraph=7&word=4`)
    expect(parseLabPrefs(JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null'), 'desktop').primaryEdition).toBe(other)
  })
  it('the edition already read does nothing', async () => {
    const model = { bookId: book.id, editionKey: main, chapters: [{ number: 1 }] } as unknown as MarginPreviewBook
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as unknown as Location)
    marginPreviewMenu(book.id, Promise.resolve(model)).setEdition(main, { page: 1, para: 0, word: 0 })
    await new Promise(r => setTimeout(r, 0))
    expect(assign).not.toHaveBeenCalled()
  })
})

// Pope's Odyssey beside Butler's (Anders, 11 Nov 2026: "we need total consistency"): the paragraphs do not line up, so
// the place is carried as how far into the chapter it is, and going straight back opens the very place left.
describe('the margin preview t menu: a version whose paragraphs do not line up', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); rememberEditionSwitch(null) })
  const odyssey = getBook('odyssey')!
  const prose = { bookId: 'odyssey', editionKey: 'original-en', chapters: [{ number: 7, paragraphs: [{ text: 'one two three four' }, { text: 'five six seven eight' }] }] } as unknown as MarginPreviewBook
  const verse = { bookId: 'odyssey', editionKey: 'verse-en', chapters: [{ number: 7, paragraphs: [{ text: 'a b' }, { text: 'c d' }, { text: 'e f' }, { text: 'g h' }] }] } as unknown as MarginPreviewBook
  const open = async (model: MarginPreviewBook, editionKey: string, at: { page: number; para: number; word: number }) => {
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as unknown as Location)
    marginPreviewMenu('odyssey', Promise.resolve(model)).setEdition(editionKey, at)
    // The book's anchors are looked up first (these toy chapters are not the texts they were counted against, so none apply).
    await vi.waitFor(() => expect(assign).toHaveBeenCalled())
    return assign
  }

  it('Pope is the unaligned edition this is about', () => {
    expect(odyssey.editions.find(e => e.key === 'verse-en')?.aligned).toBe(false)
  })
  it('notes how far into the chapter the reader is and lets the page that opens the other version land it', async () => {
    const assign = await open(prose, 'verse-en', { page: 1, para: 1, word: 2 })
    // The other version's own paragraph numbers are not known here: the link names the chapter only.
    expect(assign).toHaveBeenCalledWith('/reader?book=odyssey&margin=1&edition=verse-en&chapter=7&paragraph=0&word=0')
    expect(readEditionSwitch()).toEqual({
      bookId: 'odyssey', chapterNumber: 7, fraction: 6 / 8,
      from: { editionKey: 'original-en', paragraphIndex: 1, wordIndex: 2 }, to: { editionKey: 'verse-en' },
    })
  })
  it('going straight back opens the very place left; having moved on, the place is carried again', async () => {
    await open(prose, 'verse-en', { page: 1, para: 1, word: 2 })
    landEditionSwitch(readEditionSwitch()!, { paragraphIndex: 3, wordIndex: 0 })
    const back = await open(verse, 'original-en', { page: 1, para: 3, word: 1 })
    expect(back).toHaveBeenCalledWith('/reader?book=odyssey&margin=1&edition=original-en&chapter=7&paragraph=1&word=2')
    expect(readEditionSwitch()).toBeNull()

    await open(prose, 'verse-en', { page: 1, para: 1, word: 2 })
    landEditionSwitch(readEditionSwitch()!, { paragraphIndex: 3, wordIndex: 0 })
    const moved = await open(verse, 'original-en', { page: 1, para: 1, word: 0 })
    expect(moved).toHaveBeenCalledWith('/reader?book=odyssey&margin=1&edition=original-en&chapter=7&paragraph=0&word=0')
    expect(readEditionSwitch()).toMatchObject({ fraction: 2 / 8, from: { editionKey: 'verse-en', paragraphIndex: 1, wordIndex: 0 }, to: { editionKey: 'original-en' } })
  })
})

describe('the margin preview t menu: a switch through the book’s anchors', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); rememberEditionSwitch(null) })
  it('Butler to Pope names the place in the link (the same moment, not the same paragraph number), and back is exact', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const chapter = (name: string) => (JSON.parse(readFileSync(resolve(__dirname, `../../../public/data/editions/${name}.json`), 'utf8')).chapters as Array<{ number: number; paragraphs: string[] }>).find(c => c.number === 7)!
    const model = (editionKey: string, name: string) => ({ bookId: 'odyssey', editionKey, chapters: [{ number: 7, paragraphs: chapter(name).paragraphs.map(text => ({ text })) }] }) as unknown as MarginPreviewBook
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as unknown as Location)
    // Butler's paragraph 16: "Pontonous then mixed wine and water".
    marginPreviewMenu('odyssey', Promise.resolve(model('original-en', 'odyssey-original-en'))).setEdition('verse-en', { page: 1, para: 16, word: 0 })
    await vi.waitFor(() => expect(assign).toHaveBeenCalled())
    const href = new URL(assign.mock.calls[0][0] as string, 'https://tinct.app')
    const para = Number(href.searchParams.get('paragraph'))
    const word = Number(href.searchParams.get('word'))
    const pope = chapter('odyssey-verse-en').paragraphs
    expect(pope[para].split(/\s+/).slice(word, word + 12).join(' ')).toContain('Pontonous')
    expect(readEditionSwitch()?.to).toEqual({ editionKey: 'verse-en', paragraphIndex: para, wordIndex: word })
    assign.mockClear()
    marginPreviewMenu('odyssey', Promise.resolve(model('verse-en', 'odyssey-verse-en'))).setEdition('original-en', { page: 1, para, word })
    await vi.waitFor(() => expect(assign).toHaveBeenCalled())
    expect(assign).toHaveBeenCalledWith('/reader?book=odyssey&margin=1&edition=original-en&chapter=7&paragraph=16&word=0')
  })
})
