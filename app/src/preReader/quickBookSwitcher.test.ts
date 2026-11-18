import { describe, expect, it } from 'vitest'
import { applyReadingMemoryEvents, emptyReadingMemory, eventFromSession } from '../readingMemory/sessions'
import { sessionFor } from '../readingMemory/fixtures.test-helpers'
import { emptyLabPositionState, type LabBookPlace } from '../lab/labPosition'
import { quickBookRows, withAddedBooks, type QuickBookCatalogueEntry } from './quickBookSwitcher'

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

  it('labels every book\u2019s chapter in house style', () => {
    const state = emptyLabPositionState('device')
    state.books.beowulf = place({ bookId: 'beowulf', headerBook: 'Beowulf', chapterNumber: 12, sequentialChapter: 12, primaryEditionKey: 'original-en', updatedAt: 20 })
    state.books.proverbs = place({ bookId: 'proverbs', headerBook: 'Proverbs', chapterNumber: 17, sequentialChapter: 645, primaryEditionKey: 'kjv-en', updatedAt: 10 })
    const rows = quickBookRows({
      catalogue: [
        { id: 'beowulf', title: 'Beowulf', readingStructure: { chapters: [{ number: 12, title: 'Fitt XII' }] } },
        { id: 'bible', title: 'The Bible', readingStructure: { chapters: [{ number: 645, title: 'Proverbs 17' }] } },
      ],
      positions: state,
      memory: emptyReadingMemory(),
      viewer: null,
    })
    expect(rows.map(row => [row.title, row.chapterLabel])).toEqual([['Beowulf', 'Fitt 12'], ['The Bible', 'Proverbs 17']])
  })
})

describe('quick book switcher rows for added books (pd-…)', () => {
  const builtIn: QuickBookCatalogueEntry[] = [{ id: 'hamlet', title: 'Hamlet', art: { src: '/covers/v2/hamlet.webp' }, readingStructure: { chapters: [{ number: 1, title: 'Act 1, Scene 1' }] } }]
  const lesMis: QuickBookCatalogueEntry = {
    id: 'pd-pg-135',
    title: 'Les Misérables',
    art: { src: '/api/public-books/pd-pg-135/cover', srcSet: '/api/public-books/pd-pg-135/cover 1x' },
    cover: { background: '#3a4f5c' },
    readingStructure: { chapters: [{ number: 1, title: 'CHAPTER I—M. MYRIEL', paragraphCount: 30 }] },
  }
  // Les Misérables as the reading memory recorded it before house style: raw label, no catalogue entry.
  const lesMisSession = sessionFor({ bookId: 'pd-pg-135', editionKey: 'original-en', chapterNumber: 1, chapterLabel: 'CHAPTER I—M. MYRIEL', paragraphs: ['In 1815, M. Charles-François-Bienvenu Myriel was Bishop of D——.', 'He was an old man of about seventy-five years of age.'] }, { state: 'progressed', startedAt: 100 })
  const memory = applyReadingMemoryEvents(emptyReadingMemory(), [eventFromSession(lesMisSession)])

  it('shows an added book\u2019s title, painted cover and house-style chapter, not its id', () => {
    const rows = quickBookRows({
      catalogue: builtIn,
      positions: emptyLabPositionState('device'),
      memory,
      viewer: null,
      added: { entries: [lesMis], complete: true },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      bookId: 'pd-pg-135',
      title: 'Les Misérables',
      chapterLabel: 'Chapter 1',
      coverSrc: '/api/public-books/pd-pg-135/cover',
      coverSrcSet: '/api/public-books/pd-pg-135/cover 1x',
      coverTone: '#3a4f5c',
      target: { bookId: 'pd-pg-135', chapterNumber: 1, source: 'memory' },
    })
  })

  it('resolves an added book\u2019s saved place through its own entry, never the Bible', () => {
    const state = emptyLabPositionState('device')
    state.books['pd-pg-135'] = place({ bookId: 'pd-pg-135', headerBook: 'Les Misérables', paragraphIndex: 4, pageIndex: 2, primaryEditionKey: 'original-en', updatedAt: 50 })
    const catalogue = [...builtIn, { id: 'bible', title: 'The Bible', readingStructure: null }]
    const rows = quickBookRows({ catalogue, positions: state, memory: emptyReadingMemory(), viewer: null, added: { entries: [{ ...lesMis, art: null }], complete: true } })
    expect(rows.map(row => row.bookId)).toEqual(['pd-pg-135'])
    expect(rows[0]).toMatchObject({ title: 'Les Misérables', chapterLabel: 'Chapter 1', coverSrc: null, coverTone: '#3a4f5c', target: { paragraphIndex: 4, pageIndex: 2, source: 'position' } })
  })

  it('keeps the recorded title when the book\u2019s metadata cannot be read', () => {
    const state = emptyLabPositionState('device')
    state.books['pd-pg-135'] = place({ bookId: 'pd-pg-135', headerBook: 'Les Misérables', primaryEditionKey: 'original-en', updatedAt: 150 })
    const rows = quickBookRows({ catalogue: builtIn, positions: state, memory, viewer: null, added: { entries: [], complete: false } })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ bookId: 'pd-pg-135', title: 'Les Misérables', chapterLabel: 'Chapter 1', coverSrc: null, coverTone: null })
  })

  it('drops an added book nothing names any more instead of showing its id', () => {
    const state = emptyLabPositionState('device')
    state.books['pd-pg-135'] = place({ bookId: 'pd-pg-135', headerBook: 'Les Misérables', updatedAt: 150 })
    // The whole index was read and the book is not in it: it can no longer be opened.
    expect(quickBookRows({ catalogue: builtIn, positions: state, memory, viewer: null, added: { entries: [], complete: true } })).toEqual([])
    // Unknown here and no recorded title (reading memory only, or a record whose title is its id).
    expect(quickBookRows({ catalogue: builtIn, positions: emptyLabPositionState('device'), memory, viewer: null })).toEqual([])
    const untitled = emptyLabPositionState('device')
    untitled.books['pd-pg-135'] = place({ bookId: 'pd-pg-135', updatedAt: 150 })
    expect(quickBookRows({ catalogue: builtIn, positions: untitled, memory, viewer: null })).toEqual([])
  })

  it('merges added books without replacing registry books or accepting other ids', () => {
    const merged = withAddedBooks(builtIn, [lesMis, { ...lesMis, title: 'Duplicate' }, { id: 'hamlet', title: 'Not Hamlet' }, { id: 'pd-pg-1', title: '  ' }])
    expect(merged.map(book => [book.id, book.title])).toEqual([['hamlet', 'Hamlet'], ['pd-pg-135', 'Les Misérables']])
  })
})
