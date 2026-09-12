/**
 * The 2026-09-12 "Currently reading shows two books" defect.
 *
 * Nine books in progress, seven of them read in the classic app, and the
 * library's Reading-now shelf listed two — the two the /lab reader happened to
 * have pinned. The shelf resolved the lab position record alone while the book
 * page beside it (lab/catalogue-runtime.js `resolveContinuations()`) had always
 * read both stores.
 */
import { describe, expect, it } from 'vitest'
import type { LabPositionState } from '../lab/labPosition'
import { readingList, type LibraryBookInfo } from './libraryRecap'
import { emptyReadingMemory } from '../readingMemory/sessions'
import {
  PRODUCTION_POSITION_DEVICE_ID,
  parseProductionPlace,
  productionPlaces,
  withProductionPlaces,
} from './productionPositions'

const T0 = 1_750_000_000_000

const LAB_BOOKS = ['odyssey', 'ulysses']
const APP_BOOKS = ['war-and-peace', 'gilgamesh', 'hamlet', 'macbeth', 'midsummer', 'frankenstein', 'dracula']

const books = new Map<string, LibraryBookInfo>(
  [...LAB_BOOKS, ...APP_BOOKS].map(id => [id, { id, title: id, chapters: [{ number: 1, title: 'Chapter 1', paragraphCount: 20 }, { number: 2, title: 'Chapter 2', paragraphCount: 20 }] }]),
)

function labState(ids: string[]): LabPositionState {
  const entries = ids.map((id, index) => [id, {
    bookId: id, headerBook: id, chapterNumber: 1, sequentialChapter: 1,
    paragraphIndex: 3, wordIndex: 0, updatedAt: T0 + index, deviceId: 'device-a', rev: 1,
  }] as const)
  return {
    books: Object.fromEntries(entries),
    owner: null,
    recentChapters: {},
    finished: {},
    hidden: {},
    lastSettledBookId: ids[0] ?? null,
    lastSettledAt: T0,
    updatedAt: T0,
    deviceId: 'device-a',
  }
}

function appRecord(bookId: string, at: number) {
  return { bookId, chapterNumber: 2, currentPage: 1, totalPages: 9, scrollFraction: 0.4, lastParagraphIndex: 6, updatedAt: at }
}

function storeOf(records: Record<string, unknown>) {
  return (key: string) => (key in records ? JSON.stringify(records[key]) : null)
}

describe('parseProductionPlace', () => {
  it('reads a classic record into the shape the shelf resolves', () => {
    expect(parseProductionPlace('hamlet', appRecord('hamlet', T0 + 5), T0 + 100)).toEqual({
      bookId: 'hamlet', headerBook: 'hamlet', chapterNumber: 2, sequentialChapter: 2,
      paragraphIndex: 6, wordIndex: 0, pageIndex: 1,
      updatedAt: T0 + 5, deviceId: PRODUCTION_POSITION_DEVICE_ID, rev: 0,
    })
  })

  it('refuses records that are not this book, not a place, or not readable', () => {
    expect(parseProductionPlace('hamlet', appRecord('macbeth', T0), T0 + 100)).toBeNull()
    expect(parseProductionPlace('hamlet', { bookId: 'hamlet', currentPage: 0 }, T0 + 100)).toBeNull()
    expect(parseProductionPlace('hamlet', { bookId: 'hamlet', chapterNumber: 2 }, T0 + 100)).toBeNull()
    expect(parseProductionPlace('hamlet', null, T0 + 100)).toBeNull()
    // The Bible is pinned per biblical book in the lab record; a flat one cannot say where.
    expect(parseProductionPlace('bible', appRecord('bible', T0), T0 + 100)).toBeNull()
  })

  it('keeps a book whose record has no usable clock, ranked below any real pin', () => {
    const place = parseProductionPlace('hamlet', { ...appRecord('hamlet', T0), updatedAt: undefined }, T0 + 100)
    expect(place?.updatedAt).toBe(1)
  })
})

describe('productionPlaces', () => {
  it('costs only the book whose record is unreadable', () => {
    const read = (key: string) => {
      if (key === 'tinct:position:gilgamesh') throw new Error('storage blocked')
      if (key === 'tinct:position:hamlet') return '{ not json'
      if (key === 'tinct:position:macbeth') return JSON.stringify(appRecord('macbeth', T0 + 3))
      return null
    }
    expect(productionPlaces({ bookIds: ['gilgamesh', 'hamlet', 'macbeth'], read, now: T0 + 100 }).map(p => p.bookId))
      .toEqual(['macbeth'])
  })
})

describe('withProductionPlaces', () => {
  it('adds books the lab record does not have and leaves its own pins alone', () => {
    const lab = labState(LAB_BOOKS)
    const merged = withProductionPlaces(lab, productionPlaces({
      bookIds: books.keys(),
      read: storeOf(Object.fromEntries(APP_BOOKS.map((id, i) => [`tinct:position:${id}`, appRecord(id, T0 + 10 + i)]))),
      now: T0 + 1_000,
    }))
    expect(Object.keys(merged.books).sort()).toEqual([...LAB_BOOKS, ...APP_BOOKS].sort())
    expect(merged.books.odyssey.deviceId).toBe('device-a')
    // Nothing but the per-book places is touched.
    expect(merged.lastSettledBookId).toBe(lab.lastSettledBookId)
    expect(merged.hidden).toBe(lab.hidden)
    expect(merged.finished).toBe(lab.finished)
  })

  it('lets a strictly newer classic record win, and never a tie', () => {
    const lab = labState(['odyssey'])
    const tie = withProductionPlaces(lab, [parseProductionPlace('odyssey', appRecord('odyssey', lab.books.odyssey.updatedAt), T0 + 100)!])
    expect(tie.books.odyssey.deviceId).toBe('device-a')
    const newer = withProductionPlaces(lab, [parseProductionPlace('odyssey', appRecord('odyssey', lab.books.odyssey.updatedAt + 1), T0 + 100)!])
    expect(newer.books.odyssey.deviceId).toBe(PRODUCTION_POSITION_DEVICE_ID)
  })
})

describe('the Reading-now shelf over both stores', () => {
  it('lists every in-progress book, not only the ones the lab reader pinned', () => {
    const labOnly = readingList({ memory: emptyReadingMemory(), viewer: null, positions: labState(LAB_BOOKS), books })
    // The defect, as reported: two cards for nine books in progress.
    expect(labOnly.readingNow.map(row => row.bookId)).toEqual(['ulysses', 'odyssey'])

    const both = readingList({
      memory: emptyReadingMemory(),
      viewer: null,
      positions: withProductionPlaces(labState(LAB_BOOKS), productionPlaces({
        bookIds: books.keys(),
        read: storeOf(Object.fromEntries(APP_BOOKS.map((id, i) => [`tinct:position:${id}`, appRecord(id, T0 + 10 + i)]))),
        now: T0 + 1_000,
      })),
      books,
    })
    expect(both.readingNow.map(row => row.bookId).sort()).toEqual([...LAB_BOOKS, ...APP_BOOKS].sort())
    expect(both.readingNow[0].target).toMatchObject({ bookId: 'dracula', chapterNumber: 2, source: 'position' })
  })

  it('still honours a book the reader took off the list', () => {
    const lab = { ...labState(LAB_BOOKS), hidden: { hamlet: T0 + 900 } }
    const list = readingList({
      memory: emptyReadingMemory(),
      viewer: null,
      positions: withProductionPlaces(lab, productionPlaces({
        bookIds: books.keys(),
        read: storeOf({ 'tinct:position:hamlet': appRecord('hamlet', T0 + 10) }),
        now: T0 + 1_000,
      })),
      books,
    })
    expect(list.readingNow.map(row => row.bookId)).not.toContain('hamlet')
  })
})
