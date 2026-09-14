import { describe, expect, it } from 'vitest'
import { emptyReadingMemory } from '../readingMemory/sessions'
import { emptyLabPositionState, type LabBookPlace } from '../lab/labPosition'
import { quickBookRows } from './quickBookSwitcher'

function place(overrides: Partial<LabBookPlace> & Pick<LabBookPlace, 'bookId'>): LabBookPlace {
  return {
    headerBook: overrides.bookId,
    chapterNumber: 1,
    sequentialChapter: 1,
    paragraphIndex: 0,
    wordIndex: 0,
    pageIndex: 0,
    updatedAt: 1,
    deviceId: 'device',
    rev: 1,
    ...overrides,
  }
}

describe('quick book switcher rows', () => {
  it('uses the same Reading-now rules and keeps each saved tuple coherent', () => {
    const state = emptyLabPositionState('device')
    state.books.odyssey = place({ bookId: 'odyssey', headerBook: 'The Odyssey', chapterNumber: 4, sequentialChapter: 4, paragraphIndex: 12, wordIndex: 7, pageIndex: 5, primaryEditionKey: 'modern-en', updatedAt: 20 })
    state.books.proverbs = place({ bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, paragraphIndex: 3, wordIndex: 2, pageIndex: 1, primaryEditionKey: 'kjv-en', updatedAt: 30 })
    const rows = quickBookRows({
      catalogue: [
        { id: 'odyssey', title: 'The Odyssey', art: { src: '/covers/v2/odyssey.webp' }, readingStructure: { chapters: [{ number: 4, title: 'Book 4', paragraphCount: 40 }] } },
        { id: 'bible', title: 'The Bible', art: { src: '/covers/v2/bible.webp' }, readingStructure: { chapters: [{ number: 645, title: 'Proverbs 17', paragraphCount: 31 }] } },
      ],
      positions: state,
      memory: emptyReadingMemory(),
      viewer: null,
    })

    expect(rows.map(row => row.bookId)).toEqual(['bible', 'odyssey'])
    expect(rows[0]).toMatchObject({ title: 'The Bible', chapterLabel: 'Proverbs 17', target: { bookId: 'bible', chapterNumber: 645, paragraphIndex: 3, wordIndex: 2, pageIndex: 1, editionKey: 'kjv-en' } })
    expect(rows[1]).toMatchObject({ title: 'The Odyssey', chapterLabel: 'Book 4', target: { bookId: 'odyssey', chapterNumber: 4, paragraphIndex: 12, wordIndex: 7, pageIndex: 5, editionKey: 'modern-en' } })
  })

  it('omits completed and explicitly hidden books', () => {
    const state = emptyLabPositionState('device')
    state.books.odyssey = place({ bookId: 'odyssey', updatedAt: 20 })
    state.books.crito = place({ bookId: 'crito', updatedAt: 10 })
    state.hidden.crito = 11
    const rows = quickBookRows({
      catalogue: [
        { id: 'odyssey', title: 'The Odyssey', readingStructure: { chapters: [{ number: 1, title: 'Book 1' }] } },
        { id: 'crito', title: 'Crito', readingStructure: { chapters: [{ number: 1, title: 'Chapter 1' }] } },
      ],
      positions: state,
      memory: emptyReadingMemory(),
      viewer: null,
      completedBookIds: new Set(['odyssey']),
    })
    expect(rows).toEqual([])
  })
})
