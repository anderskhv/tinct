import { describe, expect, it } from 'vitest'
import { emptyLabPositionState, type LabBookPlace } from '../lab/labPosition'
import { readingTimeStats } from './model'
import { yourReadingView, type CatalogueEntry } from './yourReading'
import { readingCardSvg } from '../worker/lib/readingCard'

const chapters = (count: number) => Array.from({ length: count }, (_, index) => ({ number: index + 1, title: `Chapter ${index + 1}`, paragraphCount: 10 }))
const catalogue = new Map<string, CatalogueEntry>([
  ['frankenstein', { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley', wordCount: 75_000, art: { src: '/covers/v2/frankenstein.webp' }, readingStructure: { chapters: chapters(24) } }],
  ['odyssey', { id: 'odyssey', title: 'The Odyssey', author: 'Homer', wordCount: 120_000, art: { src: '/covers/v2/odyssey.webp' }, readingStructure: { chapters: chapters(24) } }],
  ['meditations', { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', wordCount: 60_000, art: null, readingStructure: { chapters: chapters(12) } }],
])

function place(bookId: string, sequentialChapter: number, updatedAt: number): LabBookPlace {
  return { bookId, headerBook: bookId, chapterNumber: sequentialChapter, sequentialChapter, paragraphIndex: 0, wordIndex: 0, updatedAt } as LabBookPlace
}

describe('Your reading', () => {
  it('lists finished books by the end of the last chapter, the rest as reading now, each with its hours', () => {
    const positions = {
      ...emptyLabPositionState('device'),
      books: { frankenstein: place('frankenstein', 24, Date.UTC(2026, 9, 1, 20)), odyssey: place('odyssey', 14, Date.UTC(2026, 9, 6, 20)) },
      finished: { frankenstein: [1, 2, 24], odyssey: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
    }
    const stats = readingTimeStats([
      { day: '2026-10-01', bookId: 'frankenstein', read: 6 * 3600 + 1200, listen: 0 },
      { day: '2026-10-06', bookId: 'odyssey', read: 4 * 3600 + 600, listen: 0 },
      { day: '2026-10-05', bookId: 'meditations', read: 900, listen: 0 },
    ], '2026-10-07')
    const view = yourReadingView({ stats, positions, catalogue })
    expect(view.finishedCount).toBe(1)
    expect(view.chaptersCount).toBe(16)
    expect(view.finished.map(book => [book.title, book.hours])).toEqual([['Frankenstein', '6 h 20 m']])
    expect(view.readingNow.map(book => [book.title, book.progress, book.hours])).toEqual([
      ['The Odyssey', 'Ch. 14 of 24', '4 h 10 m'],
      // Ledger time without a place on this device still counts as being read.
      ['Meditations', null, '15 m'],
    ])
    // 10.8 hours against Frankenstein's 300 minutes at 250 words a minute.
    expect(view.comparison).toBe('About two Frankensteins, start to finish.')
  })

  it('draws the reading card from the figures alone, naming no one', () => {
    const stats = readingTimeStats([{ day: '2026-10-07', bookId: 'odyssey', read: 41 * 3600 + 1200, listen: 0 }], '2026-10-07')
    const svg = readingCardSvg(stats)
    expect(svg).toContain('Reading time since 7 October')
    expect(svg).toContain('>41<')
    expect(svg).toContain('>20<')
    expect(svg).toContain('Read free at tinct.app')
    expect(svg).not.toMatch(/@|reader@/)
  })
})
