import { describe, expect, it } from 'vitest'
import {
  REVEAL_SESSION_KEY,
  bookDescription,
  libraryViewFromLocation,
  claimReveal,
  columnise,
  filterIndexBooks,
  indexHouses,
  libraryModeFromDeviceMemory,
  DEFAULT_LANDING_WORLD,
  LANDING_WORLDS,
  landingWorldFrom,
  mostVisibleWorld,
  centredShelfIndex,
  formatReadingTime,
  librarySnapshot,
  moveSelection,
  parseLibrarySnapshot,
  popularBooks,
  popularLead,
  popularShelfSize,
  shelfFocusIndex,
  showPopularShelf,
  readerWordsPerMinute,
  readingMinutes,
  readingTimeLine,
  publishedCount,
  revealDelayMs,
  revealTotalMs,
  searchPlaceholder,
  shelfScrollLeft,
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

  it('moves the selection with clamping and heads the shelf like an index row', () => {
    expect(moveSelection(0, -1, 8)).toBe(0)
    expect(moveSelection(0, 1, 8)).toBe(1)
    expect(moveSelection(7, 1, 8)).toBe(7)
    expect(moveSelection(99, 0, 8)).toBe(7)
    expect(moveSelection(3, 0, 0)).toBe(0)
    expect(popularLead()).toEqual({
      title: 'Pick your first book',
      row: 'Popular choices',
      more: 'The search and all 100 books are further down.',
    })
  })

  it('shows the popular row only to a reader with nothing in Reading now', () => {
    expect(showPopularShelf('new')).toBe(true)
    expect(showPopularShelf('returning')).toBe(false)
  })

  it('grows the popular row with the viewport so a wide track is not half empty', () => {
    // Phone: eight covers already overflow a 390px track.
    expect(popularShelfSize(320)).toBe(8)
    expect(popularShelfSize(390)).toBe(8)
    expect(popularShelfSize(768)).toBe(8)
    // Desktop: eight 136px covers leave a wide band, so the row carries more.
    expect(popularShelfSize(1024)).toBe(8)
    expect(popularShelfSize(1440)).toBe(10)
    expect(popularShelfSize(1920)).toBe(13)
    // Never fewer than the phone's row, whatever it is handed.
    expect(popularShelfSize(0)).toBe(8)
    expect(popularShelfSize(Number.NaN)).toBe(8)
  })

  it('focuses the last cover at the end of the track, where there is no room to centre it', () => {
    const items = [{ left: 0, width: 124 }, { left: 140, width: 124 }, { left: 280, width: 124 }]
    // Mid-track: nearest the centre, as before.
    expect(shelfFocusIndex(items, 140, 200, 600)).toBe(1)
    // Both ends: the cover at that end, which the centre rule cannot reach.
    expect(shelfFocusIndex(items, 0, 200, 600)).toBe(0)
    expect(shelfFocusIndex(items, 400, 200, 600)).toBe(2)
    expect(shelfFocusIndex(items, 399.5, 200, 600)).toBe(2)
    // A row that does not scroll has no end to be at: the first cover.
    expect(shelfFocusIndex(items, 0, 600, 600)).toBe(0)
    expect(shelfFocusIndex([], 0, 200, 600)).toBe(0)
  })

  it('carries the landing world the reader left, and nothing that is not one of ours', () => {
    expect(LANDING_WORLDS).toEqual(['odyssey', 'pride', 'frankenstein'])
    expect(DEFAULT_LANDING_WORLD).toBe('odyssey')
    expect(landingWorldFrom('pride')).toBe('pride')
    expect(landingWorldFrom('frankenstein')).toBe('frankenstein')
    expect(landingWorldFrom('meditations')).toBeNull()
    expect(landingWorldFrom(null)).toBeNull()
    expect(landingWorldFrom(42)).toBeNull()
  })

  it('reads the world off the crossfade: the most opaque layer is the one on screen', () => {
    expect(mostVisibleWorld([
      { world: 'odyssey', opacity: 0.06 },
      { world: 'pride', opacity: 0.94 },
      { world: 'frankenstein', opacity: 0 },
    ])).toBe('pride')
    // Mid-dissolve, the one that is winning is the one the reader sees.
    expect(mostVisibleWorld([
      { world: 'odyssey', opacity: 0.48 },
      { world: 'pride', opacity: 0.52 },
      { world: 'frankenstein', opacity: 0 },
    ])).toBe('pride')
    // A tie keeps the layer underneath rather than flickering to the next.
    expect(mostVisibleWorld([
      { world: 'odyssey', opacity: 0.5 },
      { world: 'pride', opacity: 0.5 },
    ])).toBe('odyssey')
    expect(mostVisibleWorld([{ world: 'nope', opacity: 1 }])).toBeNull()
    expect(mostVisibleWorld([{ world: 'odyssey', opacity: Number.NaN }])).toBe('odyssey')
    expect(mostVisibleWorld([])).toBeNull()
    expect(mostVisibleWorld(null)).toBeNull()
  })

  it('prefers the registry description and falls back to the taxonomy one-liner', () => {
    expect(bookDescription({ summary: ' Two sentences. Maybe three. ', blurb: 'One line.' })).toBe('Two sentences. Maybe three.')
    expect(bookDescription({ summary: '', blurb: 'One line.' })).toBe('One line.')
    expect(bookDescription({ blurb: 'One line.' })).toBe('One line.')
    expect(bookDescription({})).toBe('')
    expect(bookDescription(null)).toBe('')
  })

  it('scrolls the shelf horizontally only as far as needed to show the item', () => {
    const base = { scrollLeft: 0, clientWidth: 390, padLeft: 14, padRight: 14 }
    expect(shelfScrollLeft({ ...base, itemLeft: 14, itemWidth: 124 })).toBe(0)
    expect(shelfScrollLeft({ ...base, itemLeft: 434, itemWidth: 124 })).toBe(434 + 124 + 14 - 390)
    expect(shelfScrollLeft({ ...base, scrollLeft: 300, itemLeft: 14, itemWidth: 124 })).toBe(0)
    expect(shelfScrollLeft({ ...base, scrollLeft: 300, itemLeft: 154, itemWidth: 124 })).toBe(140)
    expect(shelfScrollLeft({ ...base, scrollLeft: 300, itemLeft: 400, itemWidth: 124 })).toBe(300)
  })

  it('parks the live search and the opened book on leave, and parses it back on return', () => {
    const searched = librarySnapshot({ scrollY: 900, shelfIndex: 3, expandedHouseId: 'drama', query: 'republic', bookId: 'the-republic' })
    expect(searched).toEqual({ scrollY: 900, shelfIndex: 3, expandedHouseId: 'drama', query: 'republic', bookId: 'the-republic' })
    const plain = librarySnapshot({ scrollY: 900.4, shelfIndex: 1, expandedHouseId: null, query: '' })
    expect(plain).toEqual({ scrollY: 900, shelfIndex: 1, expandedHouseId: null, query: '', bookId: null })
    expect(librarySnapshot({ query: '  ', shelfIndex: -2 })).toEqual({ scrollY: 0, shelfIndex: 0, expandedHouseId: null, query: '', bookId: null })
    expect(parseLibrarySnapshot(JSON.stringify(searched))).toEqual(searched)
    expect(parseLibrarySnapshot(JSON.stringify(plain))).toEqual(plain)
    expect(parseLibrarySnapshot(null)).toBeNull()
    expect(parseLibrarySnapshot('nope')).toBeNull()
    expect(parseLibrarySnapshot('[]')).toEqual({ scrollY: 0, shelfIndex: 0, expandedHouseId: null, query: '', bookId: null })
  })

  it('states a reading time from the word count, and says so when the speed is the reader\'s own', () => {
    expect(readingMinutes(2500)).toBe(10)
    expect(readingMinutes(2500, 500)).toBe(5)
    expect(readingMinutes(0)).toBeNull()
    expect(readingMinutes(null)).toBeNull()
    expect(readingMinutes(10, 250)).toBe(1)
    expect(formatReadingTime(45)).toBe('45 min')
    expect(formatReadingTime(60)).toBe('1 hr')
    expect(formatReadingTime(150)).toBe('2 hr 30 min')
    expect(formatReadingTime(700)).toBe('11 hr')
    expect(formatReadingTime(0)).toBeNull()
    expect(readingTimeLine(120_000)).toEqual({ value: '8 hr', wordsPerMinute: 250, measured: false, note: 'at 250 words a minute' })
    expect(readingTimeLine(120_000, 400)).toEqual({ value: '5 hr', wordsPerMinute: 400, measured: true, note: 'at your 400 words a minute' })
    expect(readingTimeLine(null)).toBeNull()
  })

  it('reads a words-per-minute out of the reader speed records, ignoring thin or absurd ones', () => {
    expect(readerWordsPerMinute([])).toBeNull()
    expect(readerWordsPerMinute([{ totalWordsRead: 100, totalSecondsSpent: 60 }])).toBeNull()
    expect(readerWordsPerMinute([{ totalWordsRead: 6000, totalSecondsSpent: 30 }])).toBeNull()
    expect(readerWordsPerMinute([{ totalWordsRead: 6000, totalSecondsSpent: 1200 }])).toBe(300)
    expect(readerWordsPerMinute([
      { totalWordsRead: 6000, totalSecondsSpent: 1200 },
      { totalWordsRead: 5000, totalSecondsSpent: 1500 },
    ])).toBe(250)
    expect(readerWordsPerMinute(null)).toBeNull()
  })

  it('focuses the shelf item nearest the centre of the scroller', () => {
    const items = [{ left: 0, width: 120 }, { left: 136, width: 120 }, { left: 272, width: 120 }]
    expect(centredShelfIndex(items, 0, 200)).toBe(0)
    expect(centredShelfIndex(items, 136, 200)).toBe(1)
    expect(centredShelfIndex(items, 272, 200)).toBe(2)
    expect(centredShelfIndex(items, 1000, 200)).toBe(2)
    expect(centredShelfIndex([], 0, 200)).toBe(0)
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
    expect(libraryModeFromDeviceMemory(null, JSON.stringify({ books: { daniel: { bookId: 'daniel', sequentialChapter: 857 } } }))).toBe('returning')
    expect(libraryModeFromDeviceMemory('{not json', JSON.stringify({ books: { daniel: { bookId: 'daniel', sequentialChapter: 857 } } }))).toBe('returning')
    expect(libraryModeFromDeviceMemory(null, JSON.stringify({ books: { daniel: { bookId: 'daniel' } } }))).toBe('new')
    expect(libraryModeFromDeviceMemory(null, JSON.stringify({ books: {} }))).toBe('new')
    expect(libraryModeFromDeviceMemory(null, '{bad')).toBe('new')
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

describe('libraryViewFromLocation', () => {
  it('matches the lab route, the launch route and the query form only', () => {
    expect(libraryViewFromLocation('/lab/library')).toBe(true)
    expect(libraryViewFromLocation('/lab/library/', '')).toBe(true)
    expect(libraryViewFromLocation('/library', '')).toBe(true)
    expect(libraryViewFromLocation('/lab/', '?view=library&book=odyssey')).toBe(true)
    expect(libraryViewFromLocation('/lab/', 'view=library')).toBe(true)
    expect(libraryViewFromLocation('/lab/landing', '')).toBe(false)
    expect(libraryViewFromLocation('/lab/', '?view=edition')).toBe(false)
    expect(libraryViewFromLocation('/lab/reader', '')).toBe(false)
  })
})

it('keeps Full voice and the new reader through library navigation', async () => {
  const { readerPreviewSearch } = await import('../../public/lab/library-model.js')
  expect(readerPreviewSearch('?chrome=v2&voiceTrial=full&book=bible')).toBe('?chrome=v2&voiceTrial=full')
  expect(readerPreviewSearch('?chrome=v2&voiceTrial=unknown')).toBe('?chrome=v2')
  expect(readerPreviewSearch('')).toBe('')
})
