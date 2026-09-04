import { applyReadingMemoryEvent, eventFromSession, hasPriorSessionForTuple, sessionTupleKey } from './sessions'
import { buildTextRange, compareWordPlace, unionTextRange, type WordPlace } from './textRange'
import type { ReadingAnchor, ReadingMemoryEvent, ReadingMemoryState, ReadingSession } from './types'

/** A gap longer than this starts a new (resumed) session for the same chapter. */
export const READING_SESSION_GAP_MS = 30 * 60 * 1000

/** What the reader is showing right now, read from existing reader state. */
export interface ReaderObservation {
  bookId: string
  editionKey: string
  chapterNumber: number
  chapterLabel: string
  paragraphs: string[]
  /** 0-based rendered page index. */
  pageIndex: number
  totalPages: number
  /** First word on the visible page. */
  pageStart: WordPlace
  /** Word after the last word on the visible page (exclusive). */
  pageEnd: WordPlace
  /** False while pages are unsettled, a cover is up, or the tuple is loading. */
  ready: boolean
  /** True only on an explicit completion signal (see detectCompletionSignal). */
  completionSignal: boolean
}

export interface ReadingMemoryRecorderOptions {
  deviceId: string
  now?: () => number
  createId?: () => string
  load: () => ReadingMemoryState
  save: (state: ReadingMemoryState) => void
  /** Receives every write, in order, for the cloud queue. */
  onEvent?: (event: ReadingMemoryEvent) => void
  sessionGapMs?: number
}

export interface ReadingMemoryRecorder {
  observe(observation: ReaderObservation): ReadingSession | null
  /** Close the open session (pagehide / unmount). Safe to call repeatedly. */
  end(): ReadingSession | null
  current(): ReadingSession | null
  state(): ReadingMemoryState
}

export function createReadingSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function anchorFromObservation(observation: ReaderObservation, previous?: ReadingAnchor): ReadingAnchor | null {
  const pageRange = buildTextRange(observation.paragraphs, observation.pageStart, observation.pageEnd)
  if (!pageRange) return null
  const range = previous ? unionTextRange(observation.paragraphs, previous.range, pageRange) : pageRange
  if (!range) return null
  return {
    bookId: observation.bookId,
    editionKey: observation.editionKey,
    chapterNumber: observation.chapterNumber,
    chapterLabel: observation.chapterLabel,
    page: Math.max(1, observation.pageIndex + 1),
    totalPages: observation.totalPages >= 1 ? observation.totalPages : null,
    paragraphIndex: observation.pageEnd.paragraphIndex,
    wordIndex: observation.pageEnd.wordIndex,
    range,
  }
}

export function createReadingMemoryRecorder(options: ReadingMemoryRecorderOptions): ReadingMemoryRecorder {
  const now = options.now ?? (() => Date.now())
  const createId = options.createId ?? createReadingSessionId
  const gapMs = options.sessionGapMs ?? READING_SESSION_GAP_MS
  let state = options.load()
  let current: ReadingSession | null = null

  const commit = (session: ReadingSession) => {
    const next = applyReadingMemoryEvent(state, eventFromSession(session))
    if (next === state) return
    state = next
    current = session
    options.save(state)
    options.onEvent?.(eventFromSession(session))
  }

  const close = (at: number): ReadingSession | null => {
    if (!current || current.endedAt !== null) return current
    const ended: ReadingSession = { ...current, seq: current.seq + 1, endedAt: at }
    commit(ended)
    return ended
  }

  return {
    observe(observation) {
      if (!observation.ready || observation.paragraphs.length === 0) return current
      const at = now()
      const tuple = sessionTupleKey(observation)
      const sameTuple = current !== null && sessionTupleKey(current.anchor) === tuple
      const stale = current !== null && (current.endedAt !== null || at - current.lastActiveAt > gapMs)

      if (!sameTuple || stale) {
        if (current && !sameTuple) close(at)
        // A gap-expired session ends at its last real activity, not "now".
        else if (current && current.endedAt === null) close(current.lastActiveAt)
        const anchor = anchorFromObservation(observation)
        if (!anchor) return current
        const resumed = hasPriorSessionForTuple(state, anchor)
        const opened: ReadingSession = {
          id: createId(),
          seq: 1,
          deviceId: options.deviceId,
          state: observation.completionSignal ? 'completed' : (resumed ? 'resumed' : 'started'),
          anchor,
          startedAt: at,
          lastActiveAt: at,
          endedAt: null,
          completedAt: observation.completionSignal ? at : null,
        }
        commit(opened)
        return current
      }

      const open = current as ReadingSession
      const pageChanged = open.anchor.page !== observation.pageIndex + 1
        || compareWordPlace({ paragraphIndex: open.anchor.paragraphIndex, wordIndex: open.anchor.wordIndex }, observation.pageEnd) !== 0
      const completing = observation.completionSignal && open.state !== 'completed'
      if (!pageChanged && !completing) return open
      const anchor = anchorFromObservation(observation, open.anchor)
      if (!anchor) return open
      const progressed: ReadingSession = {
        ...open,
        seq: open.seq + 1,
        anchor,
        state: open.state === 'completed' || completing ? 'completed' : 'progressed',
        lastActiveAt: at,
        completedAt: open.completedAt ?? (completing ? at : null),
      }
      commit(progressed)
      return current
    },
    end() {
      return close(now())
    },
    current: () => current,
    state: () => state,
  }
}

/**
 * The only two signals that mark a chapter completed:
 *  1. the reader turned forward onto the final page and that page renders the
 *     chapter's last word;
 *  2. the reader turned past the final page (the lab marks the chapter
 *     finished at that moment), detected as a transition, never as "the set
 *     already contained this chapter".
 * Merely opening a chapter, or landing on its last page from a backward
 * chapter retreat, is not completion.
 */
export function detectCompletionSignal(input: {
  pageIndex: number
  totalPages: number
  pageEnd: WordPlace
  paragraphs: string[]
  lastParagraphWordCount: number
  pageTurnDirection: 'next' | 'previous' | null
  chapterNumber: number
  finishedChapters: ReadonlySet<number>
  previousFinishedChapters: ReadonlySet<number> | null
}): boolean {
  const lastIndex = input.paragraphs.length - 1
  const onFinalPage = input.totalPages >= 1 && input.pageIndex === input.totalPages - 1
  const rendersLastWord = lastIndex >= 0
    && input.pageEnd.paragraphIndex === lastIndex
    && input.pageEnd.wordIndex >= input.lastParagraphWordCount
  const turnedOntoFinalPage = input.pageTurnDirection === 'next' && onFinalPage && rendersLastWord
  const turnedPastEnd = input.previousFinishedChapters !== null
    && input.finishedChapters.has(input.chapterNumber)
    && !input.previousFinishedChapters.has(input.chapterNumber)
  return turnedOntoFinalPage || turnedPastEnd
}
