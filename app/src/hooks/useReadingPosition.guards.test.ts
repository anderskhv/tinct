import { describe, expect, it } from 'vitest'
import {
  buildReadingPositionForWrite,
} from './useReadingPosition'
import type { ReaderBookContext, ReaderLocation } from '../readerSession/types'
import type { Book, EditionData } from '../types'
import {
  shouldBlockRegression,
  clampChapter,
  isParagraphInBounds,
  isDefaultishPosition,
  shouldMigrateLocalToCloud,
  shouldSkipOnBookChange,
  shouldBlockHistoryRegression,
  shouldCleanupProgress,
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

const readerContext: ReaderBookContext = { book, editionData }

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

describe('buildReadingPositionForWrite — readerSession source switch', () => {
  it('matches the legacy state-derived tuple when readerSession source is disabled', () => {
    expect(buildReadingPositionForWrite({
      bookId: 'the-awakening',
      chapterNumber: 2,
      currentPage: 4,
      totalPages: 9,
      lastParagraphIndex: 1,
      now: NOW,
      readerSession: {
        location: readerLocation({ chapterNumber: 3, paragraphIndex: 2, scrollFraction: 0.75 }),
        context: readerContext,
        status: 'ready',
      },
      useReaderSessionSource: false,
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

  it('uses the validated readerSession location as the content tuple when enabled', () => {
    expect(buildReadingPositionForWrite({
      bookId: 'the-awakening',
      chapterNumber: 1,
      currentPage: 4,
      totalPages: 9,
      lastParagraphIndex: 0,
      now: NOW,
      readerSession: {
        location: readerLocation({ chapterNumber: 2, paragraphIndex: 1, scrollFraction: 0.5 }),
        context: readerContext,
        status: 'ready',
      },
      useReaderSessionSource: true,
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

  it('keeps layout unavailable writes chapter/paragraph-only under either source', () => {
    expect(buildReadingPositionForWrite({
      bookId: 'the-awakening',
      chapterNumber: 2,
      currentPage: 4,
      totalPages: 1,
      lastParagraphIndex: 1,
      now: NOW,
      readerSession: {
        location: readerLocation({ chapterNumber: 2, paragraphIndex: 1, scrollFraction: 0.5 }),
        context: readerContext,
        status: 'ready',
      },
      useReaderSessionSource: true,
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

  it('does not flag any non-chapter-1 position as default', () => {
    expect(isDefaultishPosition({ chapterNumber: 2, currentPage: 0 })).toBe(false)
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
