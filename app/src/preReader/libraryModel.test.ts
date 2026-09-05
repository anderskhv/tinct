import { describe, expect, it } from 'vitest'
import {
  REVEAL_SESSION_KEY,
  claimReveal,
  columnise,
  filterIndexBooks,
  indexHouses,
  libraryModeFromDeviceMemory,
  moveSelection,
  popularBooks,
  publishedCount,
  revealDelayMs,
  revealTotalMs,
  searchPlaceholder,
  selectionEyebrow,
} from '../../public/lab/library-model.js'

type TestBook = {
  id: string
  title: string
  author: string
  houseIds: string[]
  catalogueIndex: number
  art?: { src: string; srcSet: string } | null
  stub?: boolean
  availability?: { chapterText: boolean }
}

const book = (id: string, title: string, author: string, houseIds: string[], index: number, extra: Partial<TestBook> = {}): TestBook => ({
  id, title, author, houseIds, catalogueIndex: index, art: { src: `/covers/v2/${id}.webp`, srcSet: `/covers/v2/${id}.webp 1x` }, ...extra,
})

const catalogue = {
  popular: ['odyssey', 'hamlet', 'the-republic', 'missing-book', 'odyssey', 'no-art', 'stubbed'],
  houses: [
    { id: 'epic', title: 'Poetry & Epic' },
    { id: 'drama', title: 'Drama' },
    { id: 'philosophy', title: 'Philosophy' },
    { id: 'empty', title: 'Empty House' },
  ],
  books: [
    book('odyssey', 'The Odyssey', 'Homer', ['epic'], 0),
    book('hamlet', 'Hamlet', 'William Shakespeare', ['drama'], 1),
    book('the-republic', 'The Republic', 'Plato', ['philosophy'], 2),
    book('no-art', 'Republic of Letters', 'Anon', ['philosophy'], 3, { art: null }),
    book('stubbed', 'Summa', 'Aquinas', ['philosophy'], 4, { stub: true }),
    book('unpublished', 'Unpublished', 'Nobody', ['drama'], 5, { availability: { chapterText: false } }),
    book('emma', 'Emma', 'Jane Austen', ['drama'], 6, { art: null }),
  ],
}

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value) },
    dump: () => Object.fromEntries(map),
  }
}

describe('locked library model', () => {
  it('builds the popular shelf from the ordered ids, only listable books with art, no duplicates', () => {
    expect(popularBooks(catalogue).map((item: TestBook) => item.id)).toEqual(['odyssey', 'hamlet', 'the-republic'])
    expect(popularBooks(catalogue, 2).map((item: TestBook) => item.id)).toEqual(['odyssey', 'hamlet'])
    expect(popularBooks({ books: catalogue.books })).toEqual([])
  })

  it('moves the selection with clamping and labels the eyebrow', () => {
    expect(moveSelection(0, -1, 8)).toBe(0)
    expect(moveSelection(0, 1, 8)).toBe(1)
    expect(moveSelection(7, 1, 8)).toBe(7)
    expect(moveSelection(99, 0, 8)).toBe(7)
    expect(moveSelection(3, 0, 0)).toBe(0)
    expect(selectionEyebrow(0, 8)).toBe('Popular · 1 of 8')
    expect(selectionEyebrow(7, 8)).toBe('Popular · 8 of 8')
    expect(selectionEyebrow(0, 0)).toBe('Popular')
  })

  it('staggers the reveal from the artboard timings', () => {
    expect(revealDelayMs(0)).toBe(120)
    expect(revealDelayMs(7)).toBe(610)
    expect(revealTotalMs(8)).toBe(1130)
    expect(revealTotalMs(0)).toBe(0)
  })

  it('claims the reveal once per session and never under reduced motion', () => {
    const storage = fakeStorage()
    expect(claimReveal(storage)).toBe(true)
    expect(storage.dump()[REVEAL_SESSION_KEY]).toBe('1')
    expect(claimReveal(storage)).toBe(false)
    const reduced = fakeStorage()
    expect(claimReveal(reduced, true)).toBe(false)
    expect(reduced.dump()[REVEAL_SESSION_KEY]).toBe('1')
    expect(claimReveal(reduced, false)).toBe(false)
    const throwing = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    expect(claimReveal(throwing)).toBe(true)
    expect(claimReveal(null)).toBe(true)
  })

  it('decides returning from the raw device reading memory without trusting malformed data', () => {
    expect(libraryModeFromDeviceMemory(null)).toBe('new')
    expect(libraryModeFromDeviceMemory('')).toBe('new')
    expect(libraryModeFromDeviceMemory('{not json')).toBe('new')
    expect(libraryModeFromDeviceMemory(JSON.stringify({ v: 1, sessions: {}, updatedAt: 0 }))).toBe('new')
    expect(libraryModeFromDeviceMemory(JSON.stringify({ v: 1, sessions: { a: { anchor: {} } } }))).toBe('new')
    expect(libraryModeFromDeviceMemory(JSON.stringify({ v: 1, sessions: { a: { anchor: { bookId: 'bible' } } } }))).toBe('returning')
  })

  it('lists houses with counts, hides stubs and unpublished books, and omits empty houses', () => {
    const houses = indexHouses(catalogue)
    expect(houses.map((house: { id: string; count: number }) => [house.id, house.count])).toEqual([['epic', 1], ['drama', 2], ['philosophy', 2]])
    expect(houses[2].books.map((item: TestBook) => item.id)).toEqual(['the-republic', 'no-art'])
    expect(publishedCount(catalogue)).toBe(5)
    expect(searchPlaceholder(catalogue)).toBe('Search 5 books')
    expect(searchPlaceholder({ books: [catalogue.books[0]] })).toBe('Search 1 book')
  })

  it('fills index columns top to bottom like the artboard', () => {
    expect(columnise([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    expect(columnise([1, 2, 3, 4], 3)).toEqual([[1, 2], [3, 4]])
    expect(columnise([], 3)).toEqual([])
    expect(columnise([1, 2], 1)).toEqual([[1, 2]])
  })

  it('filters the index by title or author with sensible ordering', () => {
    expect(filterIndexBooks(catalogue, '').map((item: TestBook) => item.id)).toEqual(['odyssey', 'hamlet', 'the-republic', 'no-art', 'emma'])
    expect(filterIndexBooks(catalogue, 'republic').map((item: TestBook) => item.id)).toEqual(['the-republic', 'no-art'])
    expect(filterIndexBooks(catalogue, 'The Republic').map((item: TestBook) => item.id)).toEqual(['the-republic', 'no-art'])
    expect(filterIndexBooks(catalogue, 'austen').map((item: TestBook) => item.id)).toEqual(['emma'])
    expect(filterIndexBooks(catalogue, 'HOMER').map((item: TestBook) => item.id)).toEqual(['odyssey'])
    expect(filterIndexBooks(catalogue, 'summa')).toEqual([])
    expect(filterIndexBooks(catalogue, 'zzz')).toEqual([])
  })
})
