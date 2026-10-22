// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBook } from '../../data/bookRegistry'
import { DEFAULT_LAB_PREFS, LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import { marginPreviewMenu, marginReadingChoices } from './marginPreviewMenu'
import { marginVoiceChoices, withMarginVoice } from './marginListenModel'
import type { MarginPreviewBook } from './marginPreviewModel'

const book = getBook('frankenstein')!
const main = book.editions[0].key

describe('the margin preview t menu: Book settings', () => {
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
