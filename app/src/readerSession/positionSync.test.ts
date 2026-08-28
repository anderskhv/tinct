import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Book, EditionData } from '../types'
import { localStorageProvider, setStorageProvider, storage, type StorageProvider } from '../services/storage'
import {
  USER_NAV_GRACE_MS,
  commitReadingPosition,
  commitReadingProgress,
  getHistoryRecoveryChapter,
  getRecoverableSavedPosition,
  getReadingProgress,
  getSavedPosition,
  markCloudLoaded,
  markCloudPosition,
  markUserNav,
} from './positionSync'
import type { ReaderBookContext, ReaderLocation, ReaderSessionState } from './types'

// commitReadingPosition keeps module-level maps (dedupBaseline, cloudKnownChapter,
// lastUserNavAt) keyed by bookId. To keep tests independent we give each test its
// own bookId rather than trying to reset private module state.

function createMemoryStorage(): { provider: StorageProvider; store: Map<string, unknown> } {
  const store = new Map<string, unknown>()
  return {
    store,
    provider: {
      get<T>(key: string): T | null {
        return (store.get(key) as T | undefined) ?? null
      },
      set<T>(key: string, value: T): void {
        store.set(key, value)
      },
      delete(key: string): void {
        store.delete(key)
      },
      getAll<T>(prefix: string): T[] {
        return Array.from(store.entries())
          .filter(([key]) => key.startsWith(prefix))
          .map(([, value]) => value as T)
      },
    },
  }
}

function book(id: string): Book {
  return {
    id,
    title: id,
    author: 'Test',
    editions: [
      { key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true },
    ],
  }
}

function editionData(chapters: number, paragraphs = 4): EditionData {
  return {
    chapters: Array.from({ length: chapters }, (_, i) => ({
      number: i + 1,
      title: `Chapter ${i + 1}`,
      paragraphs: Array.from({ length: paragraphs }, (_p, j) => `p${j}`),
    })),
  }
}

function context(id: string, chapters = 10): ReaderBookContext {
  return { book: book(id), editionData: editionData(chapters) }
}

function location(id: string, patch: Partial<ReaderLocation> = {}): ReaderLocation {
  return {
    bookId: id,
    chapterNumber: 3,
    paragraphIndex: 1,
    scrollFraction: 0.25,
    editionKey: 'original-en',
    activeView: 'read',
    source: 'user',
    revision: 1,
    ...patch,
  }
}

function commitArgs(id: string, opts: {
  location?: Partial<ReaderLocation>
  status?: ReaderSessionState['status']
  currentPage?: number
  totalPages?: number
  totalChapters?: number
  now?: number
  cause?: string
} = {}) {
  return {
    cause: opts.cause ?? 'test',
    readerSession: {
      location: location(id, opts.location),
      context: context(id),
      status: opts.status ?? ('ready' as ReaderSessionState['status']),
    },
    currentPage: opts.currentPage ?? 4,
    totalPages: opts.totalPages ?? 10,
    totalChapters: opts.totalChapters ?? 10,
    now: opts.now ?? 1_000_000,
  }
}

let store: Map<string, unknown>

beforeEach(() => {
  const memory = createMemoryStorage()
  store = memory.store
  setStorageProvider(memory.provider)
})

afterEach(() => {
  setStorageProvider(localStorageProvider)
})

describe('commitReadingPosition (pinned current behavior)', () => {
  it('writes both position: and tinct-current-book on a successful commit', () => {
    const id = 'pin-success'
    const result = commitReadingPosition(commitArgs(id))
    expect(result.committed).toBe(true)
    expect(store.get(`position:${id}`)).toMatchObject({ bookId: id, chapterNumber: 3 })
    expect(store.get('tinct-current-book')).toBe(id)
    expect(getSavedPosition(id)?.chapterNumber).toBe(3)
  })

  it('blocks the write when status is not ready', () => {
    const id = 'pin-status'
    const result = commitReadingPosition(commitArgs(id, { status: 'loading-edition' }))
    expect(result.committed).toBe(false)
    expect(result.reason).toContain('reader-session:loading-edition')
    expect(storage.get(`position:${id}`)).toBeNull()
  })

  it('blocks the write when the location is invalid for the book', () => {
    const id = 'pin-invalid'
    // chapter 999 does not exist in a 10-chapter book
    const result = commitReadingPosition(commitArgs(id, { location: { chapterNumber: 999 } }))
    expect(result.committed).toBe(false)
    expect(result.reason).toContain('reader-session:invalid-location')
    expect(storage.get(`position:${id}`)).toBeNull()
  })

  it('skips an identical follow-up commit (dedup)', () => {
    const id = 'pin-dedup'
    expect(commitReadingPosition(commitArgs(id)).committed).toBe(true)
    const second = commitReadingPosition(commitArgs(id, { now: 1_000_500 }))
    expect(second.committed).toBe(false)
    expect(second.reason).toContain('unchanged')
  })

  it('blocks a backward chapter regression below the known cloud chapter', () => {
    const id = 'pin-regression'
    markCloudPosition(id, { bookId: id, chapterNumber: 6, currentPage: 0, totalPages: 10, scrollFraction: 0 })
    const result = commitReadingPosition(commitArgs(id, { location: { chapterNumber: 3 } }))
    expect(result.committed).toBe(false)
    expect(result.reason).toContain('regression-blocked')
    expect(result.cloudChapter).toBe(6)
    expect(result.attemptedChapter).toBe(3)
  })

  it('allows a backward chapter move within the user-nav grace window', () => {
    const id = 'pin-usernav'
    const now = 5_000_000
    markCloudPosition(id, { bookId: id, chapterNumber: 6, currentPage: 0, totalPages: 10, scrollFraction: 0 })
    markUserNav(id) // sets lastUserNavAt = Date.now(); grace window is open relative to `now`
    const result = commitReadingPosition(commitArgs(id, {
      location: { chapterNumber: 3 },
      now: Date.now() + USER_NAV_GRACE_MS - 1,
    }))
    expect(result.committed).toBe(true)
    void now
  })

  it('blocks a regression below the reading-history high-water chapter', () => {
    const id = 'pin-history'
    // history high-water from progress storage
    store.set(`progress:${id}`, { bookId: id, highestCompletedChapter: 7, totalChapters: 10, percent: 70 })
    const result = commitReadingPosition(commitArgs(id, { location: { chapterNumber: 3 } }))
    expect(result.committed).toBe(false)
    expect(result.reason).toContain('history-regression-blocked')
  })

  it('allows persisting Jeremiah 18 when that is the newest log entry and high-water is James 1', () => {
    const id = 'commit-jeremiah-reread'
    markCloudLoaded(id, null)
    store.set(`progress:${id}`, {
      bookId: id,
      highestCompletedChapter: 1146,
      totalChapters: 1189,
      percent: 96,
    })
    store.set(`reading-log:${id}`, {
      bookId: id,
      updatedAt: 4_000,
      chapters: {
        763: {
          chapterNumber: 763,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 3_500,
          lastReadAt: 4_000,
          completed: false,
          lastParagraphIndex: 6,
          totalParagraphs: 12,
        },
        1147: {
          chapterNumber: 1147,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 1_000,
          lastReadAt: 1_200,
          completed: false,
        },
      },
    })

    const result = commitReadingPosition({
      cause: 'jeremiah-reread',
      readerSession: {
        location: location(id, {
          chapterNumber: 763,
          paragraphIndex: 6,
          scrollFraction: 0.5,
          editionKey: 'kjv-en',
        }),
        context: {
          book: {
            id,
            title: 'Bible',
            author: 'Various',
            editions: [{ key: 'kjv-en', language: 'en', style: 'kjv', label: 'KJV', aligned: true }],
          },
          editionData: {
            chapters: [762, 763, 764].map(number => ({
              number,
              title: `Chapter ${number}`,
              paragraphs: ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
            })),
          },
        },
        status: 'ready',
      },
      currentPage: 2,
      totalPages: 6,
      totalChapters: 1189,
      now: 5_000,
    })

    expect(result.committed).toBe(true)
    expect(getSavedPosition(id)?.chapterNumber).toBe(763)
  })

  it('treats markCloudLoaded(null) as clearing the dedup baseline', () => {
    const id = 'pin-clear'
    expect(commitReadingPosition(commitArgs(id)).committed).toBe(true)
    expect(commitReadingPosition(commitArgs(id, { now: 1_000_500 })).committed).toBe(false)
    markCloudLoaded(id, null)
    // After clearing the baseline, the same tuple is no longer deduped.
    expect(commitReadingPosition(commitArgs(id, { now: 1_001_000 })).committed).toBe(true)
  })

  it('persists page-derived scrollFraction only when layout is known', () => {
    const withLayout = 'pin-frac-layout'
    commitReadingPosition(commitArgs(withLayout, { currentPage: 9, totalPages: 10, location: { scrollFraction: 0.0 } }))
    expect(getSavedPosition(withLayout)?.scrollFraction).toBeCloseTo(1, 5)

    // The hook blocks this earlier; the commit helper still accepts an
    // explicit caller, so layout gating is covered in useReadingPosition.
  })

  it('blocks a same-chapter reset to the beginning after a deeper position', () => {
    const id = 'pin-same-chapter-reset'
    expect(commitReadingPosition(commitArgs(id, {
      location: { chapterNumber: 6, paragraphIndex: 2, scrollFraction: 0.62 },
      currentPage: 6,
      totalPages: 10,
    }))).toMatchObject({ committed: true })
    const result = commitReadingPosition(commitArgs(id, {
      location: { chapterNumber: 6, paragraphIndex: 0, scrollFraction: 0 },
      currentPage: 0,
      totalPages: 10,
      now: 1_000_500,
    }))
    expect(result.committed).toBe(false)
    expect(result.reason).toContain('same-chapter-regression-blocked')
  })
})

describe('getReadingProgress', () => {
  it('reads back a stored progress record', () => {
    const id = 'pin-progress-read'
    store.set(`progress:${id}`, { bookId: id, highestCompletedChapter: 2, totalChapters: 10, percent: 20 })
    expect(getReadingProgress(id)?.highestCompletedChapter).toBe(2)
  })
})

describe('getRecoverableSavedPosition', () => {
  it('recovers a poisoned Genesis 2 Bible position from reading history', () => {
    const id = 'recover-bible-log'
    store.set(`position:${id}`, {
      bookId: id,
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 1,
      updatedAt: 1_000,
    })
    store.set(`reading-log:${id}`, {
      bookId: id,
      updatedAt: 2_000,
      chapters: {
        803: {
          chapterNumber: 803,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 1_500,
          lastReadAt: 2_000,
          completed: false,
          lastParagraphIndex: 4,
          totalParagraphs: 10,
        },
      },
    })

    expect(getRecoverableSavedPosition(id, 1189)).toMatchObject({
      bookId: id,
      chapterNumber: 803,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 4 / 9,
      lastParagraphIndex: 4,
    })
  })

  it('recovers from completed progress when reading history is missing', () => {
    const id = 'recover-bible-progress'
    store.set(`position:${id}`, {
      bookId: id,
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 0,
    })
    store.set(`progress:${id}`, {
      bookId: id,
      highestCompletedChapter: 802,
      totalChapters: 1189,
      percent: 67,
    })

    expect(getRecoverableSavedPosition(id, 1189)).toMatchObject({
      bookId: id,
      chapterNumber: 803,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: undefined,
    })
  })

  it('preserves an intentional early-book position instead of recovering from history', () => {
    const id = 'recover-bible-deliberate'
    const saved = {
      bookId: id,
      chapterNumber: 2,
      currentPage: 4,
      totalPages: 12,
      scrollFraction: 0.4,
      lastParagraphIndex: 20,
    }
    store.set(`position:${id}`, saved)
    store.set(`progress:${id}`, {
      bookId: id,
      highestCompletedChapter: 802,
      totalChapters: 1189,
      percent: 67,
    })

    expect(getRecoverableSavedPosition(id, 1189)).toEqual(saved)
  })

  it('recovers Jeremiah 18 from a poisoned Genesis 1 blip instead of James 1 high-water', () => {
    // Production shape 2026-08-25: position:bible is Genesis 1, progress
    // highestCompletedChapter is Hebrews 13 (1146) so high-water next is
    // James 1 (1147), but the newest lastReadAt is Jeremiah 18 (763).
    const id = 'recover-jeremiah-vs-james'
    store.set(`position:${id}`, {
      bookId: id,
      chapterNumber: 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
      lastParagraphIndex: 0,
      updatedAt: 3_000,
    })
    store.set(`progress:${id}`, {
      bookId: id,
      highestCompletedChapter: 1146,
      totalChapters: 1189,
      percent: 96,
    })
    store.set(`reading-log:${id}`, {
      bookId: id,
      updatedAt: 4_000,
      chapters: {
        763: {
          chapterNumber: 763,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 3_500,
          lastReadAt: 4_000,
          completed: false,
          lastParagraphIndex: 6,
          totalParagraphs: 12,
        },
        1147: {
          chapterNumber: 1147,
          editions: ['kjv-en'],
          readCount: 1,
          firstReadAt: 1_000,
          lastReadAt: 1_200,
          completed: false,
        },
      },
    })

    expect(getHistoryRecoveryChapter(id, 1189)).toEqual({
      chapterNumber: 763,
      paragraphIndex: 6,
      totalParagraphs: 12,
    })
    expect(getRecoverableSavedPosition(id, 1189)).toMatchObject({
      bookId: id,
      chapterNumber: 763,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 6 / 11,
      lastParagraphIndex: 6,
    })
  })

  it('recovers Jeremiah 18 from chat location when that is newer than the James 1 high-water', () => {
    const id = 'recover-jeremiah-chat'
    store.set(`position:${id}`, {
      bookId: id,
      chapterNumber: 1,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0,
    })
    store.set(`progress:${id}`, {
      bookId: id,
      highestCompletedChapter: 1146,
      totalChapters: 1189,
      percent: 96,
    })
    store.set(`chat-history:${id}`, [{
      id: 'conv-jeremiah',
      bookId: id,
      chapterNumber: 763,
      paragraphIndex: 3,
      startTimestamp: 3_000,
      endTimestamp: 5_000,
      preview: 'Jeremiah 18',
      messages: [{
        id: 'm1',
        role: 'user',
        content: 'What is happening in Jeremiah 18?',
        timestamp: 5_000,
        bookId: id,
        chapterNumber: 763,
        paragraphIndex: 3,
      }],
    }])

    expect(getHistoryRecoveryChapter(id, 1189)).toEqual({
      chapterNumber: 763,
      paragraphIndex: 3,
      totalParagraphs: undefined,
    })
    expect(getRecoverableSavedPosition(id, 1189)?.chapterNumber).toBe(763)
  })
})

describe('commitReadingProgress', () => {
  it('marks the chapter completed on the last page (steady-state shape)', () => {
    const id = 'prog-laststeady'
    const result = commitReadingProgress({ bookId: id, progressChapter: 3, currentPage: 9, totalPages: 10, totalChapters: 10 })
    expect(result.committed).toBe(true)
    expect(getReadingProgress(id)).toMatchObject({ highestCompletedChapter: 3, totalChapters: 10 })
  })

  it('marks chapter N-1 completed when mid-chapter (deeper-chapter shape)', () => {
    const id = 'prog-mid'
    const result = commitReadingProgress({ bookId: id, progressChapter: 5, currentPage: 2, totalPages: 10, totalChapters: 10 })
    expect(result.committed).toBe(true)
    // mid chapter 5 => chapters 1..4 are completed
    expect(getReadingProgress(id)?.highestCompletedChapter).toBe(4)
  })

  it('records completion of the just-left chapter with the synthetic last-page shape', () => {
    const id = 'prog-advance'
    // chapter-advance caller passes the PRE-advance chapter + synthetic 1/2 layout
    const result = commitReadingProgress({ bookId: id, progressChapter: 7, currentPage: 1, totalPages: 2, totalChapters: 10 })
    expect(result.committed).toBe(true)
    expect(getReadingProgress(id)?.highestCompletedChapter).toBe(7)
  })

  it('is monotonic — never lowers highestCompletedChapter', () => {
    const id = 'prog-monotonic'
    store.set(`progress:${id}`, { bookId: id, highestCompletedChapter: 8, totalChapters: 10, percent: 80 })
    // a write for an earlier chapter must not regress the completed high-water
    commitReadingProgress({ bookId: id, progressChapter: 3, currentPage: 2, totalPages: 10, totalChapters: 10 })
    expect(getReadingProgress(id)?.highestCompletedChapter).toBe(8)
  })

  it('skips when totalChapters is unknown (cross-book bleed guard)', () => {
    const id = 'prog-nochapters'
    const result = commitReadingProgress({ bookId: id, progressChapter: 3, currentPage: 2, totalPages: 10, totalChapters: 0 })
    expect(result.committed).toBe(false)
    expect(result.reason).toBe('no-chapters')
    expect(storage.get(`progress:${id}`)).toBeNull()
  })

  it('skips when chapter is out of range', () => {
    const id = 'prog-oor'
    const result = commitReadingProgress({ bookId: id, progressChapter: 999, currentPage: 2, totalPages: 10, totalChapters: 10 })
    expect(result.committed).toBe(false)
    expect(result.reason).toBe('no-update')
  })
})
