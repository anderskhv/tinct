import type { ReadingAnchor, ReadingMemoryEvent, ReadingMemoryState, ReadingSession, ReadingSessionState, ReadingTextRange } from './types'

export const READING_MEMORY_VERSION = 1 as const
/** Keep the memory bounded; the recap only needs the most recent sessions. */
export const READING_MEMORY_MAX_SESSIONS = 50

const STATES: ReadingSessionState[] = ['started', 'resumed', 'progressed', 'completed']

export function emptyReadingMemory(): ReadingMemoryState {
  return { v: READING_MEMORY_VERSION, sessions: {}, updatedAt: 0 }
}

function isInt(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function isClock(value: unknown): value is number {
  return isInt(value, 1, 1e15)
}

function isText(value: unknown, max = 200): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max
}

export function parseTextRange(raw: unknown): ReadingTextRange | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (!isInt(src.startParagraphIndex, 0) || !isInt(src.startWordIndex, 0) || !isInt(src.startCharOffset, 0)) return null
  if (!isInt(src.endParagraphIndex, 0) || !isInt(src.endWordIndex, 1) || !isInt(src.endCharOffset, 1)) return null
  if (!isText(src.firstWords, 400) || !isText(src.lastWords, 400)) return null
  if (src.endParagraphIndex < src.startParagraphIndex) return null
  if (src.endParagraphIndex === src.startParagraphIndex && src.endWordIndex <= src.startWordIndex) return null
  return {
    startParagraphIndex: src.startParagraphIndex,
    startWordIndex: src.startWordIndex,
    startCharOffset: src.startCharOffset,
    endParagraphIndex: src.endParagraphIndex,
    endWordIndex: src.endWordIndex,
    endCharOffset: src.endCharOffset,
    firstWords: src.firstWords,
    lastWords: src.lastWords,
  }
}

/** The anchor is one tuple: every field must be present or the anchor is invalid. */
export function parseAnchor(raw: unknown): ReadingAnchor | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (!isText(src.bookId, 120) || !isText(src.editionKey, 120)) return null
  if (!isInt(src.chapterNumber, 1, 100_000)) return null
  if (!isText(src.chapterLabel, 300)) return null
  if (!isInt(src.page, 1, 1_000_000)) return null
  if (src.totalPages !== null && !isInt(src.totalPages, 1, 1_000_000)) return null
  if (!isInt(src.paragraphIndex, 0) || !isInt(src.wordIndex, 0)) return null
  const range = parseTextRange(src.range)
  if (!range) return null
  if (src.totalPages !== null && src.page > src.totalPages) return null
  return {
    bookId: src.bookId,
    editionKey: src.editionKey,
    chapterNumber: src.chapterNumber,
    chapterLabel: src.chapterLabel,
    page: src.page,
    totalPages: src.totalPages === null ? null : src.totalPages,
    paragraphIndex: src.paragraphIndex,
    wordIndex: src.wordIndex,
    range,
  }
}

export function parseReadingSession(raw: unknown): ReadingSession | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (!isText(src.id, 120) || !isInt(src.seq, 1) || !isText(src.deviceId, 120)) return null
  if (!STATES.includes(src.state as ReadingSessionState)) return null
  const anchor = parseAnchor(src.anchor)
  if (!anchor) return null
  if (!isClock(src.startedAt) || !isClock(src.lastActiveAt)) return null
  if (src.lastActiveAt < src.startedAt) return null
  if (src.endedAt !== null && !isClock(src.endedAt)) return null
  if (src.completedAt !== null && !isClock(src.completedAt)) return null
  // Completed is a stored fact, never a derived one: the state and the
  // timestamp must agree.
  if ((src.state === 'completed') !== (src.completedAt !== null)) return null
  return {
    id: src.id,
    seq: src.seq,
    deviceId: src.deviceId,
    state: src.state as ReadingSessionState,
    anchor,
    startedAt: src.startedAt,
    lastActiveAt: src.lastActiveAt,
    endedAt: src.endedAt === null ? null : (src.endedAt as number),
    completedAt: src.completedAt === null ? null : (src.completedAt as number),
  }
}

export function parseReadingMemory(raw: unknown): ReadingMemoryState {
  const empty = emptyReadingMemory()
  if (!raw || typeof raw !== 'object') return empty
  const src = raw as Record<string, unknown>
  if (!src.sessions || typeof src.sessions !== 'object') return empty
  const sessions: Record<string, ReadingSession> = {}
  for (const [id, value] of Object.entries(src.sessions as Record<string, unknown>)) {
    const session = parseReadingSession(value)
    if (!session || session.id !== id) continue
    sessions[id] = session
  }
  return {
    v: READING_MEMORY_VERSION,
    sessions,
    updatedAt: isInt(src.updatedAt, 0, 1e15) ? src.updatedAt : 0,
  }
}

export function parseReadingMemoryEvent(raw: unknown): ReadingMemoryEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  const session = parseReadingSession(src.session)
  if (!session) return null
  if (src.sessionId !== session.id || src.seq !== session.seq) return null
  return { sessionId: session.id, seq: session.seq, session }
}

function pruneSessions(sessions: Record<string, ReadingSession>): Record<string, ReadingSession> {
  const ids = Object.keys(sessions)
  if (ids.length <= READING_MEMORY_MAX_SESSIONS) return sessions
  const keep = ids
    .map(id => sessions[id])
    .sort((a, b) => b.lastActiveAt - a.lastActiveAt || b.seq - a.seq)
    .slice(0, READING_MEMORY_MAX_SESSIONS)
  return Object.fromEntries(keep.map(session => [session.id, session]))
}

/**
 * Apply one queued write. Idempotent: an event whose (sessionId, seq) is not
 * newer than the stored session returns the SAME state object, so a caller
 * can detect "no change" by identity.
 */
export function applyReadingMemoryEvent(state: ReadingMemoryState, event: ReadingMemoryEvent): ReadingMemoryState {
  const session = parseReadingSession(event.session)
  if (!session || session.id !== event.sessionId || session.seq !== event.seq) return state
  const existing = state.sessions[session.id]
  if (existing && existing.seq >= session.seq) return state
  return {
    v: READING_MEMORY_VERSION,
    sessions: pruneSessions({ ...state.sessions, [session.id]: session }),
    updatedAt: Math.max(state.updatedAt, session.lastActiveAt, session.endedAt ?? 0, session.completedAt ?? 0),
  }
}

export function applyReadingMemoryEvents(state: ReadingMemoryState, events: ReadingMemoryEvent[]): ReadingMemoryState {
  return [...events]
    .sort((a, b) => a.sessionId.localeCompare(b.sessionId) || a.seq - b.seq)
    .reduce(applyReadingMemoryEvent, state)
}

/** Union of two memories; per session the higher seq wins. */
export function mergeReadingMemory(a: ReadingMemoryState, b: ReadingMemoryState): ReadingMemoryState {
  const events = Object.values(b.sessions).map(session => ({ sessionId: session.id, seq: session.seq, session }))
  return applyReadingMemoryEvents(a, events)
}

export function eventFromSession(session: ReadingSession): ReadingMemoryEvent {
  return { sessionId: session.id, seq: session.seq, session }
}

/** Most recently active session, if any. */
export function latestReadingSession(state: ReadingMemoryState): ReadingSession | null {
  let best: ReadingSession | null = null
  for (const session of Object.values(state.sessions)) {
    if (!best || session.lastActiveAt > best.lastActiveAt || (session.lastActiveAt === best.lastActiveAt && session.seq > best.seq)) {
      best = session
    }
  }
  return best
}

export function sessionTupleKey(anchor: Pick<ReadingAnchor, 'bookId' | 'editionKey' | 'chapterNumber'>): string {
  return `${anchor.bookId}|${anchor.editionKey}|${anchor.chapterNumber}`
}

export function hasPriorSessionForTuple(
  state: ReadingMemoryState,
  anchor: Pick<ReadingAnchor, 'bookId' | 'editionKey' | 'chapterNumber'>,
  excludeId?: string,
): boolean {
  const key = sessionTupleKey(anchor)
  return Object.values(state.sessions).some(session => session.id !== excludeId && sessionTupleKey(session.anchor) === key)
}
