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
