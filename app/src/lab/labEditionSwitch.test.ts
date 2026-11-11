import { beforeEach, describe, expect, it } from 'vitest'
import {
  chapterEditionKey, chapterWordFraction, editionSwitchReturn, landEditionSwitch, leadingPreface, mapPlaceByWords, noteChapterEdition,
  pendingEditionSwitch, placeAtWordFraction, readEditionSwitch, rememberEditionSwitch, type EditionSwitchRecord,
} from './labEditionSwitch'

const store = () => {
  const data = new Map<string, string>()
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v) }, removeItem: (k: string) => { data.delete(k) } }
}

describe('a place carried by words between unaligned editions', () => {
  // Butler-like: 4 paragraphs of 100 words; Pope-like: 10 paragraphs of 30 words.
  const prose = [100, 100, 100, 100]
  const verse = Array.from({ length: 10 }, () => 30)

  it('lands at the same share of the chapter', () => {
    expect(mapPlaceByWords(prose, verse, { paragraphIndex: 0, wordIndex: 0 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    // 250 of 400 words = 62.5% -> word 187 of 300 = paragraph 6, word 7.
    expect(mapPlaceByWords(prose, verse, { paragraphIndex: 2, wordIndex: 50 })).toEqual({ paragraphIndex: 6, wordIndex: 7 })
    expect(mapPlaceByWords(verse, prose, { paragraphIndex: 5, wordIndex: 0 })).toEqual({ paragraphIndex: 2, wordIndex: 0 })
  })

  it('never opens at the chapter start for a place past it, and never leaves the chapter', () => {
    expect(mapPlaceByWords(prose, verse, { paragraphIndex: 3, wordIndex: 99 })).toEqual({ paragraphIndex: 9, wordIndex: 29 })
    expect(mapPlaceByWords(prose, verse, { paragraphIndex: 40, wordIndex: 4000 })).toEqual({ paragraphIndex: 9, wordIndex: 29 })
    expect(mapPlaceByWords(prose, verse, { paragraphIndex: -3, wordIndex: -1 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    expect(mapPlaceByWords(prose, [], { paragraphIndex: 2, wordIndex: 5 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    expect(mapPlaceByWords([], verse, { paragraphIndex: 2, wordIndex: 5 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
  })

  it('is monotonic: a later place never lands earlier', () => {
    const source = [12, 0, 87, 3, 240, 41, 9]
    const target = [5, 60, 60, 1, 0, 130, 77, 20, 20]
    let last = -1
    source.forEach((count, paragraphIndex) => {
      for (let wordIndex = 0; wordIndex < Math.max(1, count); wordIndex += 1) {
        const at = mapPlaceByWords(source, target, { paragraphIndex, wordIndex })
        const offset = target.slice(0, at.paragraphIndex).reduce((sum, n) => sum + Math.max(1, n), 0) + at.wordIndex
        expect(offset).toBeGreaterThanOrEqual(last)
        expect(at.paragraphIndex).toBeLessThan(target.length)
        expect(at.wordIndex).toBeLessThan(Math.max(1, target[at.paragraphIndex]))
        last = offset
      }
    })
  })

  it('a chapter mapped onto itself is the same place, word for word', () => {
    const counts = [12, 0, 87, 3, 240, 41, 9]
    counts.forEach((count, paragraphIndex) => {
      for (let wordIndex = 0; wordIndex < Math.max(1, count); wordIndex += 1) {
        expect(mapPlaceByWords(counts, counts, { paragraphIndex, wordIndex })).toEqual({ paragraphIndex, wordIndex })
      }
    })
  })

  it('a wordless paragraph (a figure) takes a place of its own', () => {
    expect(chapterWordFraction([10, 0, 10], { paragraphIndex: 1, wordIndex: 0 })).toBeCloseTo(10 / 21)
    expect(placeAtWordFraction([10, 0, 10], 10 / 21)).toEqual({ paragraphIndex: 1, wordIndex: 0 })
  })
})

describe('an edition’s own opening (a verse translation’s prose argument)', () => {
  const verse = ['The argument of the book, in prose.', 'Line one,\nline two.', 'Line three,\nline four.', 'Line five,\nline six.']
  const prose = ['One paragraph.', 'Another paragraph.', 'A third.']

  it('is told from the text: a first paragraph without line breaks in a chapter set in lines', () => {
    expect(leadingPreface(verse)).toBe(1)
    expect(leadingPreface(prose)).toBe(0)
    expect(leadingPreface(verse.slice(1))).toBe(0)
    expect(leadingPreface(verse.slice(0, 2))).toBe(0)
    // The argument may itself hold a newline; its lines run far longer than a verse line.
    expect(leadingPreface([`ARGUMENT.\n${'A long prose sentence of the argument. '.repeat(6)}`, ...verse.slice(1)])).toBe(1)
  })

  it('counts for nothing in the other edition: the share is of the text after it', () => {
    const argument = [100, 50, 50]
    const plain = [50, 50]
    // Half-way through the prose is half-way through the verse, not half-way through argument plus verse.
    expect(mapPlaceByWords(plain, argument, { paragraphIndex: 1, wordIndex: 0 }, { target: 1 })).toEqual({ paragraphIndex: 2, wordIndex: 0 })
    expect(mapPlaceByWords(argument, plain, { paragraphIndex: 2, wordIndex: 0 }, { source: 1 })).toEqual({ paragraphIndex: 1, wordIndex: 0 })
    // The chapter start stays the chapter start, argument included; a place inside the argument is the start.
    expect(mapPlaceByWords(plain, argument, { paragraphIndex: 0, wordIndex: 0 }, { target: 1 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    expect(mapPlaceByWords(plain, argument, { paragraphIndex: 0, wordIndex: 1 }, { target: 1 })).toEqual({ paragraphIndex: 1, wordIndex: 1 })
    expect(mapPlaceByWords(argument, plain, { paragraphIndex: 0, wordIndex: 60 }, { source: 1 })).toEqual({ paragraphIndex: 0, wordIndex: 0 })
    // A chapter that is all preface has none.
    expect(chapterWordFraction([10], { paragraphIndex: 0, wordIndex: 5 }, 1)).toBeCloseTo(0.5)
  })
})

describe('going back is exact', () => {
  const record: EditionSwitchRecord = {
    bookId: 'odyssey', chapterNumber: 7, fraction: 0.4,
    from: { editionKey: 'original-en', paragraphIndex: 15, wordIndex: 119 },
    to: { editionKey: 'verse-en' },
  }
  let storage: ReturnType<typeof store>
  beforeEach(() => { storage = store(); rememberEditionSwitch(null, storage) })

  it('a switch waits for its landing place, then returns the very place left when the reader has not moved', () => {
    rememberEditionSwitch(record, storage)
    expect(pendingEditionSwitch({ bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en' }, storage)).toEqual(record)
    expect(pendingEditionSwitch({ bookId: 'odyssey', chapterNumber: 8, editionKey: 'verse-en' }, storage)).toBeNull()
    expect(pendingEditionSwitch({ bookId: 'iliad', chapterNumber: 7, editionKey: 'verse-en' }, storage)).toBeNull()
    // Not landed yet: nothing to go back from.
    expect(editionSwitchReturn({ bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en', targetEditionKey: 'original-en', place: { paragraphIndex: 18, wordIndex: 4 } }, { storage })).toBeNull()
    landEditionSwitch(record, { paragraphIndex: 18, wordIndex: 4 }, storage)
    expect(pendingEditionSwitch({ bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en' }, storage)).toBeNull()
    expect(editionSwitchReturn({ bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en', targetEditionKey: 'original-en', place: { paragraphIndex: 18, wordIndex: 4 } }, { storage }))
      .toEqual({ paragraphIndex: 15, wordIndex: 119 })
  })

  it('a reader who moved, another chapter, another book or another edition gets no remembered place', () => {
    rememberEditionSwitch(record, storage)
    landEditionSwitch(record, { paragraphIndex: 18, wordIndex: 4 }, storage)
    const now = { bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en', targetEditionKey: 'original-en', place: { paragraphIndex: 18, wordIndex: 4 } }
    expect(editionSwitchReturn({ ...now, place: { paragraphIndex: 19, wordIndex: 0 } }, { storage })).toBeNull()
    expect(editionSwitchReturn({ ...now, chapterNumber: 8 }, { storage })).toBeNull()
    expect(editionSwitchReturn({ ...now, bookId: 'iliad' }, { storage })).toBeNull()
    expect(editionSwitchReturn({ ...now, targetEditionKey: 'modern-en' }, { storage })).toBeNull()
    expect(editionSwitchReturn({ ...now, editionKey: 'modern-en' }, { storage })).toBeNull()
  })

  it('a damaged record is no record', () => {
    storage.setItem('tinct-edition-switch', '{"bookId":"odyssey","chapterNumber":7,"from":{"editionKey":"a","paragraphIndex":-1,"wordIndex":0},"to":{"editionKey":"b"},"fraction":0.5}')
    expect(readEditionSwitch(storage)).toBeNull()
    storage.setItem('tinct-edition-switch', 'not json')
    expect(readEditionSwitch(storage)).toBeNull()
  })

  it('without session storage the tab still remembers', () => {
    rememberEditionSwitch({ ...record, to: { editionKey: 'verse-en', paragraphIndex: 2, wordIndex: 1 } }, null)
    expect(editionSwitchReturn({ bookId: 'odyssey', chapterNumber: 7, editionKey: 'verse-en', targetEditionKey: 'original-en', place: { paragraphIndex: 2, wordIndex: 1 } }, { storage: null }))
      .toEqual({ paragraphIndex: 15, wordIndex: 119 })
    rememberEditionSwitch(null, null)
  })
})

describe('the edition of a loaded chapter', () => {
  it('is known by its text', () => {
    const paragraphs = ['One.', 'Two.']
    expect(chapterEditionKey(paragraphs)).toBeUndefined()
    noteChapterEdition(paragraphs, 'verse-en')
    expect(chapterEditionKey(paragraphs)).toBe('verse-en')
    expect(chapterEditionKey(['One.', 'Two.'])).toBeUndefined()
  })
})
