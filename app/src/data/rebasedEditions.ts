import type { ReadingPosition } from '../types'

/**
 * Books whose served text was re-based onto a DIFFERENT source after
 * publication, and the moment it happened.
 *
 * This is a narrower and more dangerous class than `withheldEditions`. There,
 * an edition disappears and a successor takes its place at the same paragraph,
 * which is sound because Tinct's editions are paragraph-aligned. Here the
 * edition keeps its key and the reader keeps their stored paragraph index, but
 * the text under that index is different text. Nothing 404s, nothing is out of
 * range, and the reader is silently put somewhere they have not been. That is
 * the failure this file exists to prevent.
 *
 * Meditations, 2026-09-12: the text served as `original-en` was Meric Casaubon
 * 1634 (412 paragraphs, and non-standard numbering — Casaubon's Book II opens
 * at standard II.4), mislabelled in the registry as George Long 1862. It is now
 * actually Long 1862, 487 paragraphs, one per numbered section, with `modern-en`
 * rebuilt against it. The twelve books are the same twelve books, so CHAPTER
 * NUMBERS ARE UNCHANGED; every paragraph index within them moved.
 *
 * Note what the existing range validation does NOT catch here. Old profile
 * 17,14,17,43,30,51,44,58,43,37,31,27; new 17,17,16,51,36,59,75,61,42,38,39,36.
 * Every chapter but the third grew, so almost every stored paragraph index is
 * still comfortably in range and `isValidLocation` passes it. Silence is the
 * whole problem; it has to be caught by date, not by bounds.
 */
const REBASED_AT: Record<string, number> = {
  // 2026-09-12T00:00:00Z
  meditations: Date.UTC(2026, 8, 12),
}

export function isRebasedBook(bookId: string): boolean {
  return bookId in REBASED_AT
}

/**
 * Whether a stored location for this book was written against text that has
 * since been replaced.
 *
 * A position with no `updatedAt` counts as stale. `updatedAt` is optional and
 * older writers omitted it, so absence means "written at an unknown time" —
 * and an unknown time before a re-basing has to be assumed to be before it.
 * The cost of being wrong that way is the top of the right chapter; the cost of
 * the other way is the wrong passage, presented as the reader's own place.
 */
export function isPositionStale(bookId: string, updatedAt?: number): boolean {
  const rebasedAt = REBASED_AT[bookId]
  if (rebasedAt === undefined) return false
  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) return true
  return updatedAt < rebasedAt
}

/**
 * A stored position, re-based if it needs it.
 *
 * What survives is the CHAPTER, and only the chapter. The twelve books of the
 * Meditations are still the twelve books, so a reader who was in Book 7 is
 * still in Book 7 — that much is true of the new text and is real information
 * about where they were. What does not survive is the paragraph: there is no
 * paragraph-to-paragraph map between Casaubon and Long and this code does not
 * invent one. So the paragraph, the scroll fraction and the page are dropped
 * and the reader opens at the top of the chapter they were in.
 *
 * The alternative — reset to the start of the book — is also honest, and is
 * rejected because it throws away the one thing the re-basing did not break. A
 * reader in Book 11 is sent back to Book 1 to buy nothing.
 *
 * Idempotent, and deliberately does not stamp `updatedAt`: it is a read-time
 * view of stored bytes, not a write. It keeps returning the same chapter-start
 * until the reader's own next write stamps a current time, after which it stops
 * firing for them.
 */
export function rebaseSavedPosition(position: ReadingPosition | null): ReadingPosition | null {
  if (!position) return position
  if (!isPositionStale(position.bookId, position.updatedAt)) return position
  return {
    ...position,
    currentPage: 0,
    totalPages: 1,
    scrollFraction: 0,
    lastParagraphIndex: undefined,
  }
}
