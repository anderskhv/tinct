import { describe, expect, it } from 'vitest'
import { formatWholeBookProgress, searchPublishedBooks, wholeBookProgress } from '../../public/lab/library-2-model.js'

const book = (id: string, chapters: number[]) => ({
  id,
  readingStructure: {
    totalParagraphs: chapters.reduce((sum, value) => sum + value, 0),
    chapters: chapters.map((paragraphCount, index) => ({ number: index + 1, title: `Chapter ${index + 1}`, paragraphCount })),
  },
})

describe('Library 2 model', () => {
  it('calculates monotonic whole-book progress from chapter extent', () => {
    const novel = book('novel', [10, 20, 30])
    const start = wholeBookProgress(novel, { chapterNumber: 1, page: 1, totalPages: 2 })
    const middle = wholeBookProgress(novel, { chapterNumber: 2, page: 0, totalPages: 4 })
    const later = wholeBookProgress(novel, { chapterNumber: 3, paragraphIndex: 15 })
    expect(start).toBeCloseTo(8.33, 1)
    expect(middle).toBeCloseTo(16.67, 1)
    expect(later).toBeCloseTo(75, 1)
    expect(start).toBeLessThan(middle)
    expect(middle).toBeLessThan(later)
  })

  it('keeps an early page in a long book near the beginning', () => {
    const longBook = book('long', Array.from({ length: 1000 }, () => 5))
    const progress = wholeBookProgress(longBook, { chapterNumber: 1, page: 1, totalPages: 2 })
    expect(progress).toBeLessThan(.1)
    expect(formatWholeBookProgress(progress)).toBe('<1% read')
  })

  it('never regresses behind genuine completed chapters', () => {
    const novel = book('novel', [10, 20, 30, 40])
    expect(wholeBookProgress(novel, { chapterNumber: 2, page: 0, totalPages: 4 }, { highestCompletedChapter: 3 })).toBe(60)
    expect(wholeBookProgress(novel, { chapterNumber: 1 }, null, true)).toBe(100)
  })

  it('uses the viewport-independent chapter fraction when pagination changes', () => {
    const novel = book('novel', [12, 18, 24])
    const phone = wholeBookProgress(novel, { chapterNumber: 2, page: 7, totalPages: 20, scrollFraction: .4 })
    const desktop = wholeBookProgress(novel, { chapterNumber: 2, page: 2, totalPages: 7, scrollFraction: .4 })
    expect(phone).toBeCloseTo(desktop!, 8)
  })

  it('keeps exact title precedence and author search unique', () => {
    const books = [
      { id: 'republic', title: 'The Republic', author: 'Plato', catalogueIndex: 0 },
      { id: 'documents', title: 'The US Founding Documents', author: 'Various', catalogueIndex: 1 },
      { id: 'emma', title: 'Emma', author: 'Jane Austen', catalogueIndex: 2 },
    ]
    expect(searchPublishedBooks(books, 'Republic').map((item: { id: string }) => item.id)).toEqual(['republic'])
    expect(searchPublishedBooks(books, 'Jane Austen').map((item: { id: string }) => item.id)).toEqual(['emma'])
  })
})
