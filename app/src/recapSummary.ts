/**
 * The "so far" chapter summary shown under the library recap's position line,
 * shared by the Worker route (`/api/lab-recap`) and the lab client.
 *
 * Truth rule: a summary only ever covers text the reader has reached — the
 * chapter from its start through the paragraph they stopped in, the whole
 * chapter once they finished it, and at most the previous chapter as well
 * when it belongs to the same sitting. Nothing beyond the reader's place is
 * ever sent to the model.
 *
 * Cache rule: nearby positions share one entry. For long chapters the
 * paragraph is rounded DOWN to a 5-paragraph bucket (never up: rounding up
 * would summarise text the reader has not seen). Short chapters — most Bible
 * chapters are 3–12 paragraphs — keep the exact paragraph, because rounding
 * down four paragraphs there would drop most of what was read.
 */
export const LAB_RECAP_ROUTE = '/api/lab-recap'
export const RECAP_PROMPT_VERSION = 'lab-recap-v1'
export const RECAP_BUCKET_PARAGRAPHS = 5
/** Chapters shorter than this keep the exact paragraph in the cache key. */
export const RECAP_BUCKET_MIN_CHAPTER_PARAGRAPHS = 25
export const RECAP_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Reasonable ceiling for a paragraph index in any edition. */
export const RECAP_MAX_PARAGRAPH_INDEX = 10_000

export interface LabRecapRequest {
  bookId: string
  editionKey: string
  /** Edition-sequential chapter number (Genesis 1 = 1, Proverbs 17 = 645). */
  chapterNumber: number
  /** 0-based paragraph the reader stopped in. */
  paragraphIndex: number
  /** The reader finished the chapter: summarise all of it. */
  completed?: boolean
  /** Exactly `chapterNumber - 1`, when the previous chapter belongs to the same sitting. */
  previousChapterNumber?: number
  /** Shown to the model for context only; not part of the cache key. */
  bookTitle?: string
}

export interface LabRecapCoverage {
  chapterNumber: number
  /** 0-based last paragraph the summary covers (inclusive). */
  throughParagraph: number
  paragraphCount: number
  /** True when the summary covers the whole chapter. */
  complete: boolean
  /** Set when the previous chapter was summarised too. */
  fromChapterNumber: number | null
}

export interface LabRecapResponse {
  summary: string
  coverage: LabRecapCoverage
  model: string
  version: string
  cached: boolean
}

function clampIndex(paragraphIndex: number, paragraphCount: number): number {
  const last = Math.max(0, paragraphCount - 1)
  if (!Number.isFinite(paragraphIndex)) return 0
  return Math.min(last, Math.max(0, Math.floor(paragraphIndex)))
}

/**
 * The last paragraph (inclusive) a summary for this position covers: the
 * paragraph itself for short chapters, the start of its 5-paragraph bucket
 * for long ones, the chapter's last paragraph once it is finished.
 */
export function recapCoverageThrough(input: { paragraphIndex: number; paragraphCount: number; completed: boolean }): number {
  const count = Math.max(1, Math.floor(input.paragraphCount))
  if (input.completed) return count - 1
  const index = clampIndex(input.paragraphIndex, count)
  const size = count >= RECAP_BUCKET_MIN_CHAPTER_PARAGRAPHS ? RECAP_BUCKET_PARAGRAPHS : 1
  return Math.floor(index / size) * size
}

/**
 * Cache key for one summary. Positions that summarise the same text share it;
 * the previous-chapter scope and prompt version are part of it so a change in
 * either never serves a stale entry. Identical on the Worker and the client
 * when both know the chapter length; when the client does not, it keys by the
 * exact paragraph, which only costs a cache miss.
 */
export function recapCacheKey(input: {
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  paragraphCount: number | null
  completed: boolean
  previousChapterNumber?: number | null
}): string {
  const through = input.completed
    ? 'end'
    : input.paragraphCount === null
      ? String(clampIndex(input.paragraphIndex, RECAP_MAX_PARAGRAPH_INDEX + 1))
      : String(recapCoverageThrough({ paragraphIndex: input.paragraphIndex, paragraphCount: input.paragraphCount, completed: false }))
  const from = input.previousChapterNumber ?? input.chapterNumber
  return `${RECAP_PROMPT_VERSION}/${input.bookId}/${input.editionKey}/${input.chapterNumber}/${from}/${through}`
}
