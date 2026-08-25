import { describe, expect, it } from 'vitest'
import { buildReadingPositionForWrite, commitReadingPosition, markCloudLoaded } from '../readerSession/positionSync'
import type { ReaderLocation } from '../readerSession/types'
import type { Book, EditionData, ReadingPosition } from '../types'
import { localStorageProvider, setStorageProvider, type StorageProvider } from '../services/storage'
import {
  shouldBlockRegression,
  clampChapter,
  isParagraphInBounds,
  isDefaultishPosition,
  shouldMigrateLocalToCloud,
  shouldRecoverEarlyResetFromHistory,
  shouldSkipOnBookChange,
  shouldBlockHistoryRegression,
  shouldCleanupProgress,
  buildReadingProgressUpdate,
} from './useReadingPosition.guards'

/**
 * These tests pin down the architectural invariants whose absence caused
 * the recurring sync bugs (B1, B19, B21). If any of these tests gets removed
 * or weakened, those bugs come back.
 *
 * The Apr 23 incident — `tinct-current-book` write removed by a "this seems
 * unnecessary" cleanup — is the failure mode this suite exists to prevent.
 */

const GRACE_MS = 5_000
const NOW = 1_777_300_000_000 // arbitrary fixed instant

const book: Book = {
  id: 'the-awakening',
  title: 'The Awakening',
  author: 'Kate Chopin',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true },
  ],
}

const editionData: EditionData = {
  chapters: [
    { number: 1, title: 'Chapter 1', paragraphs: ['a', 'b', 'c'] },
    { number: 2, title: 'Chapter 2', paragraphs: ['d', 'e', 'f'] },
    { number: 3, title: 'Chapter 3', paragraphs: ['g', 'h', 'i'] },
  ],
}

function withMemoryStorage(run: (store: Map<string, unknown>) => void) {
  const store = new Map<string, unknown>()
  const provider: StorageProvider = {
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
  }
  setStorageProvider(provider)
  try {
    run(store)
  } finally {
    setStorageProvider(localStorageProvider)
  }
}

function readerLocation(patch: Partial<ReaderLocation> = {}): ReaderLocation {
  return {
    bookId: 'the-awakening',
    chapterNumber: 2,
    paragraphIndex: 1,
    scrollFraction: 0.5,
    editionKey: 'original-en',
    activeView: 'read',
    source: 'reader-layout',
    revision: 1,
    ...patch,
  }
}

describe('buildReadingPositionForWrite — readerSession source of truth', () => {
  it('uses readerSession as the content tuple and preserves layout page fields as metadata', () => {
    expect(buildReadingPositionForWrite({
      currentPage: 4,
      totalPages: 9,
      now: NOW,
      location: readerLocation({ chapterNumber: 2, paragraphIndex: 1, scrollFraction: 0.5 }),
    })).toEqual({
      bookId: 'the-awakening',
      chapterNumber: 2,
      currentPage: 4,
      totalPages: 9,
      scrollFraction: 0.5,
      updatedAt: NOW,
      lastParagraphIndex: 1,
    })
  })

  it('keeps layout unavailable writes chapter/paragraph-only from readerSession', () => {
    expect(buildReadingPositionForWrite({
      currentPage: 4,
      totalPages: 1,
      now: NOW,
      location: readerLocation({ chapterNumber: 2, paragraphIndex: 1, scrollFraction: 0.5 }),
    })).toEqual({
      bookId: 'the-awakening',
      chapterNumber: 2,
      currentPage: 0,
      totalPages: 1,
      scrollFraction: 0.5,
      updatedAt: NOW,
      lastParagraphIndex: 1,
    })
  })
})

describe('commitReadingPosition — positionSync boundary', () => {
  it('writes the validated readerSession position and current-book pointer', () => withMemoryStorage((store) => {
    markCloudLoaded('the-awakening', null)
    const result = commitReadingPosition({
      cause: 'unit-test',
      readerSession: {
        location: readerLocation({ chapterNumber: 2, paragraphIndex: 2, scrollFraction: 0.75 }),
        context: { book, editionData },
        status: 'ready',
      },
      currentPage: 6,
      totalPages: 9,
      totalChapters: 3,
      now: NOW,
    })

    expect(result.committed).toBe(true)
    expect(store.get('tinct-current-book')).toBe('the-awakening')
    expect(store.get('position:the-awakening')).toEqual({
      bookId: 'the-awakening',
      chapterNumber: 2,
      currentPage: 6,
      totalPages: 9,
      scrollFraction: 0.75,
      updatedAt: NOW,
      lastParagraphIndex: 2,
    } satisfies ReadingPosition)
  }))

  it('writes windowed absolute Bible chapter positions by actual loaded chapter number', () => withMemoryStorage((store) => {
    markCloudLoaded('bible', null)
    const result = commitReadingPosition({
      cause: 'page-change',
      readerSession: {
        location: readerLocation({
          bookId: 'bible',
          chapterNumber: 677,
          paragraphIndex: 2,
          editionKey: 'kjv-en',
          scrollFraction: 0,
        }),
        context: {
          book: {
            id: 'bible',
            title: 'Bible',
            author: 'Various',
            editions: [{ key: 'kjv-en', language: 'en', style: 'kjv', label: 'KJV', aligned: true }],
          },
          editionData: {
            chapters: [676, 677, 678].map(number => ({
              number,
              title: `Chapter ${number}`,
              paragraphs: ['p0', 'p1', 'p2', 'p3'],
            })),
          },
        },
        status: 'ready',
      },
      currentPage: 3,
      totalPages: 5,
      totalChapters: 1189,
      now: NOW,
    })

    expect(result.committed).toBe(true)
    expect(store.get('position:bible')).toMatchObject({
      bookId: 'bible',
      chapterNumber: 677,
      currentPage: 3,
      totalPages: 5,
      scrollFraction: 0.75,
      lastParagraphIndex: 2,
    })
  }))

  it('skips invalid readerSession locations before storage writes', () => withMemoryStorage((store) => {
    markCloudLoaded('the-awakening', null)
    const result = commitReadingPosition({
      cause: 'unit-test',
      readerSession: {
        location: readerLocation({ chapterNumber: 99 }),
        context: { book, editionData },
        status: 'ready',
      },
      currentPage: 6,
      totalPages: 9,
      totalChapters: 3,
      now: NOW,
    })

    expect(result).toMatchObject({ committed: false, reason: 'reader-session:invalid-location:unit-test' })
    expect(store.has('tinct-current-book')).toBe(false)
    expect(store.has('position:the-awakening')).toBe(false)
  }))
})

describe('shouldBlockRegression — destructive remount class (B19)', () => {
  it('does not block when no cloud baseline exists (first writes per book)', () => {
    expect(
      shouldBlockRegression({
        attemptedChapter: 1,
        cloudKnownChapter: undefined,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('does not block forward writes (attempted > cloud)', () => {
    expect(
      shouldBlockRegression({
        attemptedChapter: 6,
        cloudKnownChapter: 5,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('does not block same-chapter writes (page navigation within a chapter)', () => {
    expect(
      shouldBlockRegression({
        attemptedChapter: 5,
        cloudKnownChapter: 5,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('BLOCKS backward writes with no recent user nav (B19 destructive remount)', () => {
    // Cloud says chapter 5; in-memory tries to write chapter 1; no user nav
    // happened in the grace window. This is the exact shape of the bug:
    // a modal/auth flow briefly reset chapter to 1 and the heartbeat fired.
    expect(
      shouldBlockRegression({
        attemptedChapter: 1,
        cloudKnownChapter: 5,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(true)
  })

  it('does NOT block backward writes within the user-nav grace window (legitimate prev-chapter / TOC click)', () => {
    expect(
      shouldBlockRegression({
        attemptedChapter: 1,
        cloudKnownChapter: 5,
        lastUserNavAt: NOW - 1_000, // 1s ago, well within 5s grace
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('blocks again once the grace window elapses', () => {
    expect(
      shouldBlockRegression({
        attemptedChapter: 1,
        cloudKnownChapter: 5,
        lastUserNavAt: NOW - GRACE_MS - 1, // just past the grace window
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(true)
  })

  it('treats nav exactly at grace boundary as still-allowed (inclusive)', () => {
    // Defensive: clock skew across event handlers can land "now - lastNav"
    // exactly at graceMs. A strict > test means slight jitter wins; an <=
    // (current implementation) errs on the side of allowing the write.
    expect(
      shouldBlockRegression({
        attemptedChapter: 1,
        cloudKnownChapter: 5,
        lastUserNavAt: NOW - GRACE_MS,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })
})

describe('clampChapter — cross-book chapter-index leak (B1)', () => {
  it('returns the input unchanged when totalChapters is unknown (book not loaded yet)', () => {
    expect(clampChapter(39, 0)).toBe(39)
    expect(clampChapter(1, 0)).toBe(1)
  })

  it('clamps below-range chapters to 1', () => {
    expect(clampChapter(0, 12)).toBe(1)
    expect(clampChapter(-5, 12)).toBe(1)
  })

  it('clamps above-range chapters to 1 (not totalChapters)', () => {
    // We deliberately fall back to chapter 1, not the last chapter — the
    // bogus chapter is a leak signal, not a hint about the user's intent.
    // Sending the user to the last chapter would feel like spoilers.
    expect(clampChapter(39, 12)).toBe(1)
    expect(clampChapter(1525, 100)).toBe(1)
  })

  it('passes valid chapters through unchanged', () => {
    expect(clampChapter(1, 12)).toBe(1)
    expect(clampChapter(7, 12)).toBe(7)
    expect(clampChapter(12, 12)).toBe(12)
  })
})

describe('shouldBlockHistoryRegression — stale same-book overwrite', () => {
  it('blocks passive writes far behind reading history', () => {
    // Account forensic shape from 2026-05-28:
    // reading-log reached The Awakening ch39, then a later passive position
    // write tried to make ch30 canonical again.
    expect(
      shouldBlockHistoryRegression({
        attemptedChapter: 30,
        historyHighWaterChapter: 39,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(true)
  })

  it('allows an explicit recent jump back', () => {
    expect(
      shouldBlockHistoryRegression({
        attemptedChapter: 30,
        historyHighWaterChapter: 39,
        lastUserNavAt: NOW - 1_000,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('allows near-neighbor writes to avoid blocking normal chapter-boundary jitter', () => {
    expect(
      shouldBlockHistoryRegression({
        attemptedChapter: 38,
        historyHighWaterChapter: 39,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('allows writing Jeremiah 18 when that is the most recent history place and high-water is James 1', () => {
    // 2026-08-25: Anders was in Jeremiah 18 (763) while progress high-water
    // was Hebrews 13 / James 1 (1146/1147). Treating 763 as regression
    // prevented the real place from persisting after a Genesis 1 blip.
    expect(
      shouldBlockHistoryRegression({
        attemptedChapter: 763,
        historyHighWaterChapter: 1147,
        recentHistoryChapter: 763,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(false)
  })

  it('still blocks a stale earlier write when recent history is the high-water chapter', () => {
    expect(
      shouldBlockHistoryRegression({
        attemptedChapter: 763,
        historyHighWaterChapter: 1147,
        recentHistoryChapter: 1147,
        lastUserNavAt: 0,
        now: NOW,
        graceMs: GRACE_MS,
      }),
    ).toBe(true)
  })
})

describe('isParagraphInBounds — page 19-of-21 phantom (B21)', () => {
  it('treats undefined paragraph as in-bounds (no saved paragraph index)', () => {
    expect(isParagraphInBounds(undefined, 8)).toBe(true)
  })

  it('rejects negative paragraph indexes', () => {
    expect(isParagraphInBounds(-1, 8)).toBe(false)
  })

  it('accepts valid paragraph indexes', () => {
    expect(isParagraphInBounds(0, 8)).toBe(true)
    expect(isParagraphInBounds(7, 8)).toBe(true)
  })

  it('rejects paragraph indexes >= paragraphCount', () => {
    // Exactly the bleed pattern: a longer book had paragraph 22 saved;
    // applied to a chapter with only 8 paragraphs it lands out of bounds.
    expect(isParagraphInBounds(8, 8)).toBe(false)
    expect(isParagraphInBounds(22, 8)).toBe(false)
    expect(isParagraphInBounds(180, 25)).toBe(false)
  })

  it('handles empty chapters (paragraphCount=0) by rejecting any index', () => {
    expect(isParagraphInBounds(0, 0)).toBe(false)
    expect(isParagraphInBounds(undefined, 0)).toBe(true) // no claim → no problem
  })
})

describe('isDefaultishPosition — anonymous-mode default-state detector', () => {
  it('flags chapter 1 page 0 with no paragraph as default', () => {
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 0 })).toBe(true)
  })

  it('flags chapter 1 page 0 with paragraph 0/1/2 as default (cosmetic alignment)', () => {
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 0, lastParagraphIndex: 0 })).toBe(true)
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 0, lastParagraphIndex: 2 })).toBe(true)
  })

  it('does not flag chapter 1 with progress past paragraph 2 as default', () => {
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 0, lastParagraphIndex: 5 })).toBe(false)
  })

  it('flags chapter 2 page 0 as default-shaped too', () => {
    // Bible Genesis 2 is the same failure mode as Genesis 1: an early
    // default/remount position must not overwrite a real deep position.
    expect(isDefaultishPosition({ chapterNumber: 2, currentPage: 0 })).toBe(true)
    expect(isDefaultishPosition({ chapterNumber: 2, currentPage: 0, lastParagraphIndex: 2 })).toBe(true)
  })

  it('does not flag later chapter positions as default', () => {
    expect(isDefaultishPosition({ chapterNumber: 5, currentPage: 0 })).toBe(false)
  })

  it('does not flag chapter 1 with currentPage > 0 as default', () => {
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 1 })).toBe(false)
    expect(isDefaultishPosition({ chapterNumber: 1, currentPage: 5 })).toBe(false)
  })
})

describe('shouldMigrateLocalToCloud — anonymous-pollution guard', () => {
  const local = { chapterNumber: 1, currentPage: 0, lastParagraphIndex: 2, updatedAt: NOW + 1000 }
  const realCloud = { chapterNumber: 7, currentPage: 3, lastParagraphIndex: 45, updatedAt: NOW - 86_400_000 }

  it('refuses to migrate when local is null or undefined', () => {
    expect(shouldMigrateLocalToCloud({ local: null, cloud: realCloud })).toBe(false)
    expect(shouldMigrateLocalToCloud({ local: undefined, cloud: realCloud })).toBe(false)
  })

  it('migrates local when cloud is empty (legitimate first sync)', () => {
    expect(shouldMigrateLocalToCloud({ local, cloud: null })).toBe(true)
    expect(shouldMigrateLocalToCloud({ local, cloud: undefined })).toBe(true)
  })

  it('REFUSES to migrate default-shaped local over real cloud — even with newer updatedAt', () => {
    // This is the bug. Anonymous testing wrote chapter 1 paragraph 2 with
    // a fresh Date.now(). Cloud held chapter 7 from yesterday. The old
    // logic preferred newer-timestamp. The fix here refuses.
    expect(shouldMigrateLocalToCloud({ local, cloud: realCloud })).toBe(false)
  })

  it('REFUSES to migrate a Genesis 2-shaped local reset over real Bible progress', () => {
    const genesis2Reset = { chapterNumber: 2, currentPage: 0, lastParagraphIndex: 1, updatedAt: NOW + 1000 }
    const ezekielCloud = { chapterNumber: 803, currentPage: 0, lastParagraphIndex: 12, updatedAt: NOW - 86_400_000 }
    expect(shouldMigrateLocalToCloud({ local: genesis2Reset, cloud: ezekielCloud })).toBe(false)
  })

  it('migrates local over cloud when local is real reading and newer', () => {
    const realLocal = { chapterNumber: 8, currentPage: 1, lastParagraphIndex: 12, updatedAt: NOW + 1000 }
    expect(shouldMigrateLocalToCloud({ local: realLocal, cloud: realCloud })).toBe(true)
  })

  it('does not migrate real local over real cloud when cloud is newer', () => {
    const realLocal = { chapterNumber: 8, currentPage: 1, lastParagraphIndex: 12, updatedAt: NOW - 1_000_000 }
    const newerCloud = { chapterNumber: 9, currentPage: 0, lastParagraphIndex: 5, updatedAt: NOW + 1_000_000 }
    expect(shouldMigrateLocalToCloud({ local: realLocal, cloud: newerCloud })).toBe(false)
  })

  it('migrates default local over default cloud (no real position to protect)', () => {
    const defaultCloud = { chapterNumber: 1, currentPage: 0, lastParagraphIndex: 2, updatedAt: NOW - 1000 }
    expect(shouldMigrateLocalToCloud({ local, cloud: defaultCloud })).toBe(true) // local is newer
  })
})

describe('shouldRecoverEarlyResetFromHistory — Bible early-reset recovery', () => {
  it('recovers when saved position is an early reset and history is far ahead', () => {
    expect(shouldRecoverEarlyResetFromHistory({
      position: { chapterNumber: 2, currentPage: 0, scrollFraction: 0, lastParagraphIndex: 1 },
      historyChapter: 803,
    })).toBe(true)
  })

  it('does not recover for small gaps that may be normal rereading', () => {
    expect(shouldRecoverEarlyResetFromHistory({
      position: { chapterNumber: 2, currentPage: 0, scrollFraction: 0, lastParagraphIndex: 1 },
      historyChapter: 8,
    })).toBe(false)
  })

  it('does not recover over a deliberate non-defaultish early position', () => {
    expect(shouldRecoverEarlyResetFromHistory({
      position: { chapterNumber: 2, currentPage: 1, scrollFraction: 0.4, lastParagraphIndex: 20 },
      historyChapter: 803,
    })).toBe(false)
  })
})

describe('shouldSkipOnBookChange — Odyssey→Bible bleed (2026-05-09)', () => {
  it('skips when bookId differs from previous render (book just switched)', () => {
    expect(shouldSkipOnBookChange('odyssey', 'bible')).toBe(true)
  })

  it('does not skip when bookId is unchanged (within-book navigation)', () => {
    expect(shouldSkipOnBookChange('bible', 'bible')).toBe(false)
  })

  it('skips on any book→book transition, regardless of pair', () => {
    // The trigger is "bookId changed in this effect run" — we don't care
    // which direction. Stale state is stale state.
    expect(shouldSkipOnBookChange('the-awakening', 'paradise-lost')).toBe(true)
    expect(shouldSkipOnBookChange('paradise-lost', 'the-awakening')).toBe(true)
  })
})

describe('shouldCleanupProgress — finished-book preservation', () => {
  it('cleans progress that is far ahead of the saved position', () => {
    expect(
      shouldCleanupProgress({
        highestCompletedChapter: 18,
        totalChapters: 40,
        positionChapter: 5,
        hasCompletedRecord: false,
      }),
    ).toBe(true)
  })

  it('does not clean a finished book even when reopened near the start', () => {
    expect(
      shouldCleanupProgress({
        highestCompletedChapter: 40,
        totalChapters: 40,
        positionChapter: 1,
        hasCompletedRecord: false,
      }),
    ).toBe(false)
  })

  it('does not clean when an explicit completed record exists', () => {
    expect(
      shouldCleanupProgress({
        highestCompletedChapter: 20,
        totalChapters: 40,
        positionChapter: 1,
        hasCompletedRecord: true,
      }),
    ).toBe(false)
  })

  it('does not clean normal near-neighbor progress', () => {
    expect(
      shouldCleanupProgress({
        highestCompletedChapter: 8,
        totalChapters: 40,
        positionChapter: 6,
        hasCompletedRecord: false,
      }),
    ).toBe(false)
  })
})

describe('buildReadingProgressUpdate — readerSession progress chapter', () => {
  it('marks the readerSession chapter complete on the last page', () => {
    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 3,
      currentPage: 9,
      totalPages: 10,
      totalChapters: 10,
      existing: { bookId: 'the-awakening', highestCompletedChapter: 2, totalChapters: 10, percent: 20 },
    })).toEqual({
      bookId: 'the-awakening',
      highestCompletedChapter: 3,
      totalChapters: 10,
      percent: 30,
      positionPercent: 30,
    })
  })

  it('marks previous chapters complete when reading a later readerSession chapter', () => {
    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 5,
      currentPage: 1,
      totalPages: 10,
      totalChapters: 10,
      existing: { bookId: 'the-awakening', highestCompletedChapter: 2, totalChapters: 10, percent: 20 },
    })).toEqual({
      bookId: 'the-awakening',
      highestCompletedChapter: 4,
      totalChapters: 10,
      percent: 40,
      positionPercent: 42,
    })
  })

  it('updates only positionPercent when no new chapter is completed', () => {
    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 3,
      currentPage: 4,
      totalPages: 10,
      totalChapters: 10,
      existing: {
        bookId: 'the-awakening',
        highestCompletedChapter: 3,
        totalChapters: 10,
        percent: 30,
        positionPercent: 25,
      },
    })).toEqual({
      bookId: 'the-awakening',
      highestCompletedChapter: 3,
      totalChapters: 10,
      percent: 30,
      positionPercent: 25,
    })
  })

  it('does not create progress from positionPercent alone', () => {
    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 1,
      currentPage: 0,
      totalPages: 10,
      totalChapters: 10,
      existing: null,
    })).toBeNull()
  })

  it('skips progress while layout or chapter bounds are not trustworthy', () => {
    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 2,
      currentPage: 0,
      totalPages: 1,
      totalChapters: 10,
      existing: null,
    })).toBeNull()

    expect(buildReadingProgressUpdate({
      bookId: 'the-awakening',
      progressChapter: 99,
      currentPage: 0,
      totalPages: 10,
      totalChapters: 10,
      existing: null,
    })).toBeNull()
  })
})
