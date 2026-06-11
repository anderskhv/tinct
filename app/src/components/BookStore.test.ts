import { describe, expect, it } from 'vitest'
import { hasStartedPosition, isFinished } from './BookStore'

describe('BookStore finished state', () => {
  it('treats a 100% current position as finished', () => {
    expect(isFinished({
      bookId: 'the-awakening',
      highestCompletedChapter: 38,
      totalChapters: 39,
      percent: 97,
      positionPercent: 100,
    })).toBe(true)
  })

  it('treats all completed chapters as finished', () => {
    expect(isFinished({
      bookId: 'the-awakening',
      highestCompletedChapter: 39,
      totalChapters: 39,
      percent: 100,
    })).toBe(true)
  })
})

describe('BookStore active reading state', () => {
  it('treats a saved chapter-1 page position as started', () => {
    expect(hasStartedPosition({
      bookId: 'war-and-peace',
      chapterNumber: 1,
      currentPage: 2,
      totalPages: 37,
      scrollFraction: 0.055,
      lastParagraphIndex: 1,
    })).toBe(true)
  })

  it('does not treat a seeded first-page position as started', () => {
    expect(hasStartedPosition({
      bookId: 'war-and-peace',
      chapterNumber: 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 0,
    })).toBe(false)
  })
})
