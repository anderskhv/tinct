/**
 * Pure guard logic for reading-position writes.
 *
 * Extracted from useReadingPosition so the rules can be unit-tested without
 * mounting React. Every function here is deterministic given its inputs —
 * no module state, no side effects. The hook composes these with refs and
 * effects to drive saveNow's actual write decision.
 *
 * **DO NOT INLINE THESE BACK INTO THE HOOK.** The whole point of having
 * them in a separate module is the tests in `useReadingPosition.guards.test.ts`.
 * If those tests get deleted or skipped, the bugs they prevent (B1, B19,
 * B21) come back. The Apr 23 regression that removed `tinct-current-book`
 * is a textbook example of "this seems unnecessary, deleting" — the test
 * suite is the structural defense against that pattern.
 */

/**
 * Backward-regression guard.
 *
 * Returns true if a write should be blocked because it would regress chapter
 * below the cloud-known baseline without a recent user-driven nav signal.
 *
 * - No cloud baseline → don't block (allows the first writes per book).
 * - Forward or same-chapter write → don't block.
 * - Backward write within `graceMs` of a user nav → don't block (legitimate
 *   prev-chapter / TOC click).
 * - Backward write outside the grace window → BLOCK (almost certainly a
 *   destructive write from a default-state remount, B19).
 */
export function shouldBlockRegression(args: {
  attemptedChapter: number
  cloudKnownChapter: number | undefined
  lastUserNavAt: number
  now: number
  graceMs: number
}): boolean {
  const { attemptedChapter, cloudKnownChapter, lastUserNavAt, now, graceMs } = args
  if (cloudKnownChapter === undefined) return false
  if (attemptedChapter >= cloudKnownChapter) return false
  if (now - lastUserNavAt <= graceMs) return false
  return true
}

/**
 * Chapter bounds validation.
 *
 * A chapter index that's <1 or >totalChapters is bogus — almost always a
 * cross-book chapter-index leak (B1) where a chapter from a different book
 * was applied to this one. Returns the validated chapter, falling back to
 * 1 when out of bounds.
 *
 * `totalChapters === 0` means the book hasn't loaded yet — leave the input
 * alone, the caller will re-run validation when primaryData arrives.
 */
export function clampChapter(chapter: number, totalChapters: number): number {
  if (totalChapters <= 0) return chapter
  if (chapter < 1) return 1
  if (chapter > totalChapters) return 1
  return chapter
}

/**
 * Paragraph bounds validation.
 *
 * Returns true if the saved paragraph index is in range for the chapter's
 * actual paragraph count. Catches the page-19-of-21 phantom (B21): a
 * paragraph index from a longer book's chapter 1 applied to a shorter
 * book's chapter 1 — chapter happens to be valid (1 is always valid)
 * but the paragraph doesn't exist here.
 */
export function isParagraphInBounds(paragraphIndex: number | undefined, paragraphCount: number): boolean {
  if (paragraphIndex === undefined) return true
  if (paragraphIndex < 0) return false
  return paragraphIndex < paragraphCount
}

/**
 * Default-state position detector.
 *
 * Returns true if the position looks like the in-memory React-state default
 * captured before any real navigation: chapter 1, currentPage 0, no paragraph
 * pinned (or the very first paragraph). This is what an anonymous-mode tab
 * writes to localStorage when the user opens a book and doesn't navigate.
 *
 * Used by `shouldMigrateLocalToCloud` to refuse migration of these phantom
 * positions over real cloud values when the user signs back in.
 *
 * Conservative — `lastParagraphIndex <= 2` covers the rare case where the
 * `targetParagraphRef` saved a tiny number for cosmetic alignment without
 * the user actually reading anywhere.
 */
export function isDefaultishPosition(p: { chapterNumber: number; currentPage: number; lastParagraphIndex?: number }): boolean {
  if (p.chapterNumber !== 1) return false
  if (p.currentPage !== 0) return false
  if (p.lastParagraphIndex === undefined) return true
  return p.lastParagraphIndex <= 2
}

/**
 * Book-change skip detector.
 *
 * Returns true when a position-write effect is firing due to a bookId
 * change, in which case the write must be skipped: chapterNumber and
 * lastParagraphIndex still reflect the OLD book until App.tsx's
 * bookId-change effect (which queues setCurrentChapter etc.) commits on
 * the NEXT render. Letting the write through here is how a position with
 * the new book's id but the old book's chapter/paragraph lands in cloud
 * (the 2026-05-09 Odyssey→Bible bleed: ch=1 from default state, p=13
 * from Odyssey's first-visible paragraph, written under bookId='bible').
 *
 * The chapter-change effect in `useReadingPosition` runs on every change
 * to `bookId` (it's a dep), in the same effect-flush as the App.tsx
 * effect that resets state. Both effects see the same render's stateRef,
 * so without this skip the write captures the cross-book mismatch.
 */
export function shouldSkipOnBookChange(prevBookId: string, currentBookId: string): boolean {
  return prevBookId !== currentBookId
}

/**
 * Migration-direction decider.
 *
 * Called by the sign-in migration loop in App.tsx to decide whether a
 * localStorage position should be written up to cloud. Three rules:
 *
 *  1. If cloud has nothing, local always wins (legitimate first migration).
 *  2. If local is default-shaped AND cloud is real reading, REFUSE — local
 *     is almost certainly an anonymous-mode default-state write that
 *     would corrupt the user's actual cloud position. (This is the bug
 *     diagnosed 2026-05-06: anonymous testing repeatedly overwrote real
 *     cloud positions because anonymous's `Date.now()` was newer.)
 *  3. Otherwise, the most recent `updatedAt` wins.
 *
 * Pure function for the test suite — UI calls this to gate the upsert.
 */
export function shouldMigrateLocalToCloud(args: {
  local: { chapterNumber: number; currentPage: number; lastParagraphIndex?: number; updatedAt?: number } | null | undefined
  cloud: { chapterNumber: number; currentPage: number; lastParagraphIndex?: number; updatedAt?: number } | null | undefined
}): boolean {
  const { local, cloud } = args
  if (!local) return false
  if (!cloud) return true
  // Anonymous-mode pollution guard: a default-shaped local must never
  // overwrite a non-default-shaped cloud, regardless of timestamps.
  if (isDefaultishPosition(local) && !isDefaultishPosition(cloud)) return false
  // Otherwise: more recent wins.
  if (local.updatedAt !== undefined && cloud.updatedAt !== undefined) {
    return local.updatedAt > cloud.updatedAt
  }
  return false
}
