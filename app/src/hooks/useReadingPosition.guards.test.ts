import { describe, expect, it } from 'vitest'
import {
  shouldBlockRegression,
  clampChapter,
  isParagraphInBounds,
  isDefaultishPosition,
  shouldMigrateLocalToCloud,
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
