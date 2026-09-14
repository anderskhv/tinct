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
      savedPlace: { bookId: 'odyssey', chapterNumber: 8, page: 3, paragraphIndex: 14, wordIndex: 6 },
    })
  })

  it('chooses the default readable edition when the saved row has none', () => {
    expect(continueHandoff({
      bookId: 'crito', editionKey: null, chapterNumber: 2, chapterLabel: 'Chapter 2',
      pageIndex: 0, paragraphIndex: 0, wordIndex: 0, paragraphCount: null, source: 'memory', at: 10,
    })?.primaryEditionKey).toBe('original-en')
  })
})
