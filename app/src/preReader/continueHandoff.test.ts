import { describe, expect, it } from 'vitest'
import { continueHandoff } from './continueHandoff'

describe('continue handoff', () => {
  it('carries one saved book tuple into the reader', () => {
    expect(continueHandoff({
      bookId: 'odyssey',
      editionKey: 'modern-en',
      chapterNumber: 8,
      chapterLabel: 'Book 8',
      pageIndex: 3,
      paragraphIndex: 14,
      wordIndex: 6,
      paragraphCount: 50,
      source: 'position',
      at: 10,
    })).toEqual({
      kind: 'open-reader',
      bookId: 'odyssey',
      primaryEditionKey: 'modern-en',
      resumeLatest: true,
      savedPlace: { bookId: 'odyssey', chapterNumber: 8, page: 3, paragraphIndex: 14, wordIndex: 6 },
    })
  })

  // Anders, 26 Nov 2026: Danish beside English, out of the book and back in, was English beside English.
  it('opens the pair the reader left the book in', () => {
    expect(continueHandoff({
      bookId: 'odyssey', editionKey: 'original-en', compareEditionKey: 'modern-da', chapterNumber: 8, chapterLabel: 'Book 8',
      pageIndex: 3, paragraphIndex: 14, wordIndex: 6, paragraphCount: 50, source: 'position', at: 10,
    })).toEqual({
      kind: 'open-reader',
      bookId: 'odyssey',
      primaryEditionKey: 'original-en',
      compareEditionKey: 'modern-da',
      resumeLatest: true,
      savedPlace: { bookId: 'odyssey', chapterNumber: 8, page: 3, paragraphIndex: 14, wordIndex: 6 },
    })
  })

  it('drops a compare edition that cannot sit beside the saved one, and keeps the place', () => {
    const target = {
      bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 8, chapterLabel: 'Book 8',
      pageIndex: 3, paragraphIndex: 14, wordIndex: 6, paragraphCount: 50, source: 'position' as const, at: 10,
    }
    const place = { bookId: 'odyssey', chapterNumber: 8, page: 3, paragraphIndex: 14, wordIndex: 6 }
    // Pope's verse does not line up with the prose editions; the same edition twice is no pair; an unknown key is none.
    for (const compareEditionKey of ['verse-en', 'modern-en', 'no-such-edition']) {
      expect(continueHandoff({ ...target, compareEditionKey }), compareEditionKey)
        .toEqual({ kind: 'open-reader', bookId: 'odyssey', primaryEditionKey: 'modern-en', resumeLatest: true, savedPlace: place })
    }
  })

  // 17 Nov 2026: a PC whose copy of the place was a morning old opened a book through the switcher at chapter 4 and
  // saved it over the phone's chapter 5. Every switcher hand-off asks the reader for the account's newest place.
  it('asks the reader for the newest place of the book, whatever this device last knew', () => {
    for (const source of ['position', 'memory'] as const) {
      expect(continueHandoff({
        bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 4, chapterLabel: 'Book 4',
        pageIndex: 0, paragraphIndex: 60, wordIndex: 0, paragraphCount: 80, source, at: 10,
      }), source).toMatchObject({ resumeLatest: true, savedPlace: { chapterNumber: 4, paragraphIndex: 60 } })
    }
  })

  it('chooses the default readable edition when the saved row has none', () => {
    expect(continueHandoff({
      bookId: 'crito', editionKey: null, chapterNumber: 2, chapterLabel: 'Chapter 2',
      pageIndex: 0, paragraphIndex: 0, wordIndex: 0, paragraphCount: null, source: 'memory', at: 10,
    })?.primaryEditionKey).toBe('original-en')
  })
})
