// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import {
  LAB_LIBRARY_BOOT_KEY,
  labSignedInHint,
  libraryViewRequested,
  parseLabLibraryBootSnapshot,
  readCachedSupabaseUser,
  readLabLibraryBootSnapshot,
  safeCoverSource,
  snapshotWithReaderPlace,
  writeLabLibraryBootSnapshot,
  type LabLibraryBootSnapshot,
} from './labLibraryBoot'

const NOW = 1_800_000_000_000

function snapshot(over: Partial<LabLibraryBootSnapshot> = {}): LabLibraryBootSnapshot {
  return {
    v: 1,
    at: NOW - 1000,
    userId: 'user-a',
    readingNow: 2,
    finished: 1,
    hero: { bookId: 'bible', title: 'The Bible', chapterLabel: 'Proverbs 17', headline: '“Better is a dry morsel…”', coverSrc: '/covers/bible.jpg', coverSrcSet: '/covers/bible.jpg 1x', note: '12% read' },
    row: [{ bookId: 'odyssey', title: 'The Odyssey', coverSrc: '/covers/odyssey.jpg', coverSrcSet: null }],
    ...over,
  }
}

afterEach(() => { localStorage.clear() })

describe('libraryViewRequested', () => {
  it('recognises the lab route, the launch route and the query form', () => {
    expect(libraryViewRequested('/lab/library')).toBe(true)
    expect(libraryViewRequested('/lab/library/')).toBe(true)
    expect(libraryViewRequested('/library')).toBe(true)
    expect(libraryViewRequested('/lab/', '?view=library&book=odyssey')).toBe(true)
    expect(libraryViewRequested('/lab/?view=library')).toBe(false)
    expect(libraryViewRequested('/lab/landing')).toBe(false)
    expect(libraryViewRequested('/lab/reader')).toBe(false)
    expect(libraryViewRequested('/lab/', '?view=edition')).toBe(false)
  })
})

describe('boot snapshot', () => {
  it('round-trips through storage and rejects stale, foreign or malformed records', () => {
    writeLabLibraryBootSnapshot(snapshot())
    expect(readLabLibraryBootSnapshot(localStorage, NOW)).toEqual(snapshot())
    expect(parseLabLibraryBootSnapshot({ ...snapshot(), v: 2 }, NOW)).toBeNull()
    expect(parseLabLibraryBootSnapshot({ ...snapshot(), at: NOW - 31 * 24 * 3600 * 1000 }, NOW)).toBeNull()
    expect(parseLabLibraryBootSnapshot({ ...snapshot(), hero: { bookId: 'bible' } }, NOW)).toBeNull()
    expect(parseLabLibraryBootSnapshot('nope', NOW)).toBeNull()
    localStorage.setItem(LAB_LIBRARY_BOOT_KEY, '{not json')
    expect(readLabLibraryBootSnapshot(localStorage, NOW)).toBeNull()
  })

  it('only lets a cover source through that an <img> may load from this page', () => {
    expect(safeCoverSource('/covers/x.jpg')).toBe('/covers/x.jpg')
    expect(safeCoverSource('https://cdn.example/x.jpg')).toBe('https://cdn.example/x.jpg')
    expect(safeCoverSource('data:image/svg+xml;charset=UTF-8,%3Csvg')).toMatch(/^data:image\/svg\+xml/)
    expect(safeCoverSource('//evil/x.jpg')).toBeNull()
    expect(safeCoverSource('javascript:alert(1)')).toBeNull()
    expect(safeCoverSource('data:text/html,hi')).toBeNull()
    const parsed = parseLabLibraryBootSnapshot({ ...snapshot(), hero: { ...snapshot().hero, coverSrc: 'javascript:x', coverSrcSet: 'x' } }, NOW)
    expect(parsed?.hero?.coverSrc).toBeNull()
    expect(parsed?.hero?.coverSrcSet).toBeNull()
  })

  it('folds the reader place in: same chapter keeps the headline, another chapter gets the location line', () => {
    const same = snapshotWithReaderPlace(snapshot(), { userId: 'user-a', bookId: 'bible', title: 'The Bible', chapterLabel: 'Proverbs 17', now: NOW })
    expect(same.hero).toEqual(snapshot().hero)
    expect(same.readingNow).toBe(2)
    expect(same.at).toBe(NOW)

    const moved = snapshotWithReaderPlace(snapshot(), { userId: 'user-a', bookId: 'bible', title: 'The Bible', chapterLabel: 'Hebrews 3', now: NOW })
    expect(moved.hero).toEqual({ bookId: 'bible', title: 'The Bible', chapterLabel: 'Hebrews 3', headline: 'You stopped in Hebrews 3', coverSrc: '/covers/bible.jpg', coverSrcSet: '/covers/bible.jpg 1x', note: null })
    expect(moved.readingNow).toBe(2)

    // A book that was on the row steps up: its cover comes with it, the old
    // hero steps down to the front of the row, and the count is unchanged.
    const other = snapshotWithReaderPlace(snapshot(), { userId: 'user-a', bookId: 'odyssey', title: 'The Odyssey', chapterLabel: 'Book 3', now: NOW })
    expect(other.hero).toMatchObject({ bookId: 'odyssey', title: 'The Odyssey', headline: 'You stopped in Book 3', coverSrc: '/covers/odyssey.jpg' })
    expect(other.row).toEqual([{ bookId: 'bible', title: 'The Bible', coverSrc: '/covers/bible.jpg', coverSrcSet: '/covers/bible.jpg 1x' }])
    expect(other.readingNow).toBe(2)
    // A book new to the library: no cover yet, one more on the row.
    const fresh = snapshotWithReaderPlace(snapshot(), { userId: 'user-a', bookId: 'hamlet', title: 'Hamlet', chapterLabel: 'Act 1', now: NOW })
    expect(fresh.hero).toMatchObject({ bookId: 'hamlet', coverSrc: null })
    expect(fresh.row.map(card => card.bookId)).toEqual(['bible', 'odyssey'])
    expect(fresh.readingNow).toBe(3)
  })

  it('carries the row after the hero, without the hero, duplicates, unsafe covers or more than a dozen', () => {
    const row = Array.from({ length: 15 }, (_, index) => ({ bookId: `book-${index}`, title: `Book ${index}`, coverSrc: `/covers/${index}.jpg`, coverSrcSet: null }))
    const parsed = parseLabLibraryBootSnapshot(snapshot({ row: [
      { bookId: 'bible', title: 'The Bible', coverSrc: '/covers/bible.jpg', coverSrcSet: null },
      { bookId: 'odyssey', title: 'The Odyssey', coverSrc: 'javascript:x', coverSrcSet: 'x' },
      { bookId: 'odyssey', title: 'The Odyssey', coverSrc: '/covers/odyssey.jpg', coverSrcSet: null },
      { bookId: '', title: 'Nameless' },
      ...row,
    ] }), NOW)!
    expect(parsed.row).toHaveLength(12)
    expect(parsed.row[0]).toEqual({ bookId: 'odyssey', title: 'The Odyssey', coverSrc: null, coverSrcSet: null })
    expect(parsed.row.map(card => card.bookId)).not.toContain('bible')
    // Older snapshots have no row; a snapshot without a hero has none either.
    expect(parseLabLibraryBootSnapshot({ ...snapshot(), row: undefined }, NOW)?.row).toEqual([])
    expect(parseLabLibraryBootSnapshot(snapshot({ hero: null }), NOW)?.row).toEqual([])
  })

  it('never carries another account\'s snapshot into the reader place', () => {
    const next = snapshotWithReaderPlace(snapshot(), { userId: 'user-b', bookId: 'bible', title: 'The Bible', chapterLabel: 'Proverbs 17', now: NOW })
    expect(next.userId).toBe('user-b')
    expect(next.hero?.headline).toBe('You stopped in Proverbs 17')
    expect(next.readingNow).toBe(1)
    const anonymous = snapshotWithReaderPlace(null, { userId: null, bookId: 'bible', title: 'The Bible', chapterLabel: 'Genesis 1', now: NOW })
    expect(anonymous).toMatchObject({ userId: null, readingNow: 1, finished: 0 })
  })
})

describe('signed-in hint', () => {
  it('reads the persisted Supabase session, with a display name and initial', () => {
    localStorage.setItem('sb-yazjyiqsxjystvpkyouk-auth-token', JSON.stringify({ access_token: 'x', user: { id: 'user-a', email: 'anders@example.com', user_metadata: { full_name: 'Anders Hvelplund' } } }))
    expect(readCachedSupabaseUser()).toEqual({ id: 'user-a', email: 'anders@example.com', name: 'Anders', initial: 'A' })
    expect(labSignedInHint(localStorage, '')).toBe(true)
  })

  it('falls back to the signed-in cookie, and to nothing on a signed-out device', () => {
    expect(readCachedSupabaseUser()).toBeNull()
    expect(labSignedInHint(localStorage, 'tinct_auth=1; other=2')).toBe(true)
    expect(labSignedInHint(localStorage, 'other=2')).toBe(false)
    localStorage.setItem('tinct:last-user-id', 'user-a')
    expect(labSignedInHint(localStorage, '')).toBe(false)
    localStorage.setItem('sb-ref-auth-token', 'null')
    expect(labSignedInHint(localStorage, '')).toBe(false)
  })
})
