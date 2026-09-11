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

  it('reads a linear book from its place alone: a poisoned high-water record cannot inflate it', () => {
    const novel = book('novel', [10, 20, 30, 40])
    // The legacy reader's `highestCompletedChapter: 3` used to claim chapters
    // 1–3 as read (60%) while the place sits at the start of chapter 2 (10%).
    // The record is no longer an input; the place is the whole answer.
    expect(wholeBookProgress(novel, { chapterNumber: 2, page: 0, totalPages: 4 })).toBe(10)
    expect(wholeBookProgress(novel, { chapterNumber: 1 }, { completed: true })).toBe(100)
  })

  it('reads a linear book at chapter 646 of 1189 as about half, whatever the old record claimed', () => {
    // The Bible's shape, but as a linear book: 1189 chapters, 6704 paragraphs,
    // Proverbs 18 = chapter 646 starts at paragraph 3640. The account whose
    // `tinct:progress:bible` carried `highestCompletedChapter: 1146` read
    // "97% read" here.
    const chapters = Array.from({ length: 1189 }, (_, index) => (index < 645 ? 3640 / 645 : (6704 - 3640) / 544))
    const linear = book('linear', chapters)
    const percent = wholeBookProgress(linear, { chapterNumber: 646, paragraphIndex: 0 })!
    expect(percent).toBeCloseTo(54.3, 0)
    expect(percent).toBeLessThan(60)
  })

  it('reads the Bible from its finished chapters, paragraph-weighted, plus the current chapter', () => {
    // Genesis 1–10 (10 paragraphs each), Psalm 117 (2), Psalm 119 (176), then
    // filler so the totals are legible.
    const paragraphs = [...Array.from({ length: 10 }, () => 10), 2, 176, ...Array.from({ length: 8 }, () => 10)]
    const bible = book('bible', paragraphs)
    const total = paragraphs.reduce((sum, value) => sum + value, 0)
    // Finished Genesis 1–10 and Psalm 119; resume at the start of chapter 13.
    const finished = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]
    const atStart = wholeBookProgress(bible, { chapterNumber: 13, paragraphIndex: 0 }, { finishedChapters: finished })!
    expect(atStart).toBeCloseTo(((100 + 176) / total) * 100, 5)
    // Halfway into chapter 13 adds half of its 10 paragraphs.
    const halfway = wholeBookProgress(bible, { chapterNumber: 13, paragraphIndex: 5 }, { finishedChapters: finished })!
    expect(halfway).toBeCloseTo(((100 + 176 + 5) / total) * 100, 5)
    // Psalm 117 and Psalm 119 are not worth the same.
    const psalm117 = wholeBookProgress(bible, { chapterNumber: 13 }, { finishedChapters: [11] })!
    const psalm119 = wholeBookProgress(bible, { chapterNumber: 13 }, { finishedChapters: [12] })!
    expect(psalm119).toBeGreaterThan(psalm117 * 10)
    // Resuming inside a finished chapter does not count it twice.
    expect(wholeBookProgress(bible, { chapterNumber: 12, paragraphIndex: 100 }, { finishedChapters: [12] })).toBeCloseTo((176 / total) * 100, 5)
  })

  it('reads under 1% for a Bible reader who only jumped to a late chapter once', () => {
    const bible = book('bible', Array.from({ length: 1189 }, () => 6704 / 1189))
    // Landed on chapter 1146 (Hebrews 13), read a paragraph, finished nothing.
    const percent = wholeBookProgress(bible, { chapterNumber: 1146, paragraphIndex: 1 }, { finishedChapters: [] })!
    expect(percent).toBeLessThan(1)
    expect(formatWholeBookProgress(percent)).toBe('<1% read')
    // And an explicit completion mark is still the whole book.
    expect(wholeBookProgress(bible, { chapterNumber: 1146 }, { completed: true })).toBe(100)
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
