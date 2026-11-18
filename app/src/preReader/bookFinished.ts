/**
 * The one rule for "this book is finished", shared by the library's Finished
 * shelf (libraryRecap.readingList) and Your reading (readingTime/yourReading).
 *
 * A book is finished when any of these holds:
 *  - the reader marked it read (an explicit mark; `markedRead`, wired when
 *    marks exist);
 *  - a completion record says so (`book-completed:*`, or a `progress:*`
 *    record at 100% / all chapters — preReader/libraryCompletion.ts);
 *  - every chapter of the book is finished;
 *  - the last chapter was read to its end AND at least
 *    FINISHED_CHAPTER_SHARE of the book's chapters are finished.
 *
 * "Finished chapters" are the reader's finished-chapter record united with
 * completed reading-memory sessions (the same evidence the chapter picker
 * shows). Opening, or jumping to, the last chapter is never enough on its own:
 * a two-chapter book with only chapter 2 finished is not finished (Gorgias,
 * 2026-10-09: the final chapter alone used to count).
 */

/** Share of a book's chapters that must be finished when the last one is. */
export const FINISHED_CHAPTER_SHARE = 0.9

export interface BookFinishedEvidence {
  /** The book's chapter numbers (sequential, as the catalogue lists them). */
  chapterNumbers: readonly number[]
  /** Chapters the records say were finished. */
  finishedChapters: Iterable<number>
  /** A completion record (`book-completed:*` or a complete `progress:*`). */
  completionRecord?: boolean
  /** The reader marked the book read. */
  markedRead?: boolean
}

export function isBookFinished(evidence: BookFinishedEvidence): boolean {
  if (evidence.markedRead || evidence.completionRecord) return true
  const chapters = [...new Set(evidence.chapterNumbers.filter(n => Number.isInteger(n) && n > 0))]
  if (chapters.length === 0) return false
  const finished = new Set(evidence.finishedChapters)
  const done = chapters.reduce((sum, n) => sum + (finished.has(n) ? 1 : 0), 0)
  if (done === chapters.length) return true
  const last = Math.max(...chapters)
  return finished.has(last) && done >= FINISHED_CHAPTER_SHARE * chapters.length
}
