/**
 * Durable reading memory (lab).
 *
 * A reading session is one spell of reading a single (book, edition, chapter)
 * tuple. Its anchor is always written as one coherent tuple — book, edition,
 * chapter, page, paragraph, and the exact text range that was on screen —
 * never partially. Timestamps are real device clock values; nothing here
 * fabricates a date.
 */

export type ReadingSessionState = 'started' | 'resumed' | 'progressed' | 'completed'

export interface ReadingTextRange {
  /** Paragraph index (0-based) where the read range starts. */
  startParagraphIndex: number
  /** Word index (0-based, inclusive) inside the start paragraph. */
  startWordIndex: number
  /** Character offset (inclusive) inside the start paragraph. */
  startCharOffset: number
  /** Paragraph index (0-based) where the read range ends. */
  endParagraphIndex: number
  /** Word index (exclusive) inside the end paragraph. */
  endWordIndex: number
  /** Character offset (exclusive) inside the end paragraph. */
  endCharOffset: number
  /** Exact first words of the range, for verification against the edition text. */
  firstWords: string
  /** Exact last words of the range, for verification against the edition text. */
  lastWords: string
}

export interface ReadingAnchor {
  bookId: string
  editionKey: string
  /** Edition chapter number (sequential index inside the edition, e.g. Genesis 1 = 1). */
  chapterNumber: number
  /** Human label of the chapter as rendered ("Genesis 1", "Chapter 1 — Loomings"). */
  chapterLabel: string
  /** 1-based page as rendered when the session was last active. */
  page: number
  /** Total rendered pages for the chapter at that moment, or null when unknown. */
  totalPages: number | null
  /** Paragraph where the reader stopped (tail of the last visible page). */
  paragraphIndex: number
  /** Word index (exclusive) where the reader stopped inside that paragraph. */
  wordIndex: number
  /** Exact text range read during the session (union of visible pages). */
  range: ReadingTextRange
}

export interface ReadingSession {
  id: string
  /** Monotonic per-session sequence; replaying the same (id, seq) is a no-op. */
  seq: number
  deviceId: string
  state: ReadingSessionState
  anchor: ReadingAnchor
  startedAt: number
  lastActiveAt: number
  endedAt: number | null
  /** Set only on an explicit completion signal. */
  completedAt: number | null
}

export interface ReadingMemoryState {
  v: 1
  sessions: Record<string, ReadingSession>
  updatedAt: number
}

/** A queued write: the full session snapshot at a given sequence. */
export interface ReadingMemoryEvent {
  sessionId: string
  seq: number
  session: ReadingSession
}

export type RecapSource = 'device' | 'cloud'
export type RecapGeneratedBy = 'excerpt' | 'summary'

export interface RecapProvenance {
  source: RecapSource
  generatedBy: RecapGeneratedBy
  /** Model id when a summary was produced. */
  model?: string
  /** Summary prompt version when a summary was produced. */
  version?: string
  sessionId: string
  sessionSeq: number
  sessionState: ReadingSessionState
  anchor: ReadingAnchor
}

export interface RecapCard {
  bookId: string
  editionKey: string
  chapterNumber: number
  /** "You finished Genesis 1" or "You stopped in Genesis 1". */
  headline: string
  /** "Genesis 1 · page 2 of 4". */
  location: string
  /** Exact excerpt, optional summary, or empty when no text could be resolved. */
  body: string
  bodyKind: 'excerpt' | 'summary' | 'location-only'
  /** Lines formatted from stored timestamps only; missing values are omitted. */
  timeline: string[]
  completed: boolean
  provenance: RecapProvenance
}
