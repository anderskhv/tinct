import { supabase } from './supabase'

export type ReadingActivityMode = 'read' | 'listened'

export interface DurableReadingActivitySession {
  sessionId: string
  userId: string
  bookId: string
  chapterNumber: number
  editionKey: string
  mode: ReadingActivityMode
  startedAt: number
  lastActiveAt: number
  startParagraphIndex?: number
  lastParagraphIndex?: number
  clientRevision: number
}

export interface ReadingActivityPoint {
  userId: string
  bookId: string
  chapterNumber: number
  editionKey: string
  mode: ReadingActivityMode
  paragraphIndex?: number
  now: number
}

export interface ReadingActivityQueryResult {
  status: 'ok' | 'unavailable'
  sessions: DurableReadingActivitySession[]
  error?: string
}

export const DURABLE_READING_SESSION_GAP_MS = 30 * 60 * 1000
const PENDING_READING_ACTIVITY_KEY = 'tinct:pending-reading-activity-v1'

function sameSessionTuple(session: DurableReadingActivitySession, point: ReadingActivityPoint): boolean {
  return session.userId === point.userId
    && session.bookId === point.bookId
    && session.chapterNumber === point.chapterNumber
    && session.editionKey === point.editionKey
    && session.mode === point.mode
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Secure random IDs are unavailable')
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Advance the device-local durable session. A chapter, edition, mode, user,
 * or 30-minute activity boundary gets a fresh stable UUID. */
export function advanceDurableReadingSession(args: {
  previous: DurableReadingActivitySession | null
  point: ReadingActivityPoint
  createId?: () => string
  sessionGapMs?: number
}): DurableReadingActivitySession {
  const {
    previous,
    point,
    createId = createSessionId,
    sessionGapMs = DURABLE_READING_SESSION_GAP_MS,
  } = args
  const canContinue = Boolean(
    previous
    && sameSessionTuple(previous, point)
    && point.now >= previous.lastActiveAt
    && point.now - previous.lastActiveAt <= sessionGapMs,
  )

  if (previous && canContinue) {
    return {
      ...previous,
      lastActiveAt: point.now,
      lastParagraphIndex: point.paragraphIndex,
      clientRevision: previous.clientRevision + 1,
    }
  }

  return {
    sessionId: createId(),
    userId: point.userId,
    bookId: point.bookId,
    chapterNumber: point.chapterNumber,
    editionKey: point.editionKey,
    mode: point.mode,
    startedAt: point.now,
    lastActiveAt: point.now,
    startParagraphIndex: point.paragraphIndex,
    lastParagraphIndex: point.paragraphIndex,
    clientRevision: 1,
  }
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function optionalParagraph(value: unknown): number | undefined {
  return value === undefined || value === null
    ? undefined
    : isNonNegativeInteger(value) ? value : undefined
}

function isDurableSession(value: unknown): value is DurableReadingActivitySession {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<DurableReadingActivitySession>
  return typeof row.sessionId === 'string' && row.sessionId.length > 0
    && typeof row.userId === 'string' && row.userId.length > 0
    && typeof row.bookId === 'string' && row.bookId.length > 0
    && Number.isInteger(row.chapterNumber) && (row.chapterNumber || 0) > 0
    && typeof row.editionKey === 'string' && row.editionKey.length > 0
    && (row.mode === 'read' || row.mode === 'listened')
    && typeof row.startedAt === 'number' && Number.isFinite(row.startedAt) && row.startedAt > 0
    && typeof row.lastActiveAt === 'number' && Number.isFinite(row.lastActiveAt) && row.lastActiveAt >= row.startedAt
    && Number.isInteger(row.clientRevision) && (row.clientRevision || 0) > 0
    && (row.startParagraphIndex === undefined || isNonNegativeInteger(row.startParagraphIndex))
    && (row.lastParagraphIndex === undefined || isNonNegativeInteger(row.lastParagraphIndex))
}

function pendingKey(session: Pick<DurableReadingActivitySession, 'userId' | 'sessionId'>): string {
  return `${session.userId}::${session.sessionId}`
}

/** Merge retries without letting an older request move a session backwards. */
export function mergePendingReadingActivity(
  current: DurableReadingActivitySession,
  incoming: DurableReadingActivitySession,
): DurableReadingActivitySession {
  if (pendingKey(current) !== pendingKey(incoming)) return current
  const sameTuple = current.bookId === incoming.bookId
    && current.chapterNumber === incoming.chapterNumber
    && current.editionKey === incoming.editionKey
    && current.mode === incoming.mode
  if (!sameTuple) return current
  if (incoming.clientRevision < current.clientRevision) return current
  return {
    ...incoming,
    startedAt: Math.min(current.startedAt, incoming.startedAt),
    startParagraphIndex: current.startedAt <= incoming.startedAt
      ? current.startParagraphIndex
      : incoming.startParagraphIndex,
    lastActiveAt: Math.max(current.lastActiveAt, incoming.lastActiveAt),
  }
}

function loadPendingReadingActivity(): Map<string, DurableReadingActivitySession> {
  const pending = new Map<string, DurableReadingActivitySession>()
  if (typeof localStorage === 'undefined') return pending
  try {
    const raw = localStorage.getItem(PENDING_READING_ACTIVITY_KEY)
    if (!raw) return pending
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return pending
    for (const value of parsed) {
      if (!isDurableSession(value)) continue
      const key = pendingKey(value)
      const existing = pending.get(key)
      pending.set(key, existing ? mergePendingReadingActivity(existing, value) : value)
    }
  } catch { /* ignore malformed or unavailable localStorage */ }
  return pending
}

function savePendingReadingActivity(pending: Map<string, DurableReadingActivitySession>): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (pending.size === 0) localStorage.removeItem(PENDING_READING_ACTIVITY_KEY)
    else localStorage.setItem(PENDING_READING_ACTIVITY_KEY, JSON.stringify(Array.from(pending.values())))
  } catch { /* storage may be full or disabled */ }
}

export function enqueueReadingActivity(session: DurableReadingActivitySession): void {
  const pending = loadPendingReadingActivity()
  const key = pendingKey(session)
  const existing = pending.get(key)
  pending.set(key, existing ? mergePendingReadingActivity(existing, session) : session)
  savePendingReadingActivity(pending)
}

type CommitResult = 'applied' | 'superseded' | 'failed'

async function commitReadingActivity(session: DurableReadingActivitySession): Promise<CommitResult> {
  if (!supabase) return 'failed'
  try {
    const { data, error } = await supabase.rpc('record_reading_activity_session', {
      p_session_id: session.sessionId,
      p_book_id: session.bookId,
      p_chapter_number: session.chapterNumber,
      p_edition_key: session.editionKey,
      p_mode: session.mode,
      p_started_at: new Date(session.startedAt).toISOString(),
      p_last_active_at: new Date(session.lastActiveAt).toISOString(),
      p_start_paragraph_index: session.startParagraphIndex ?? null,
      p_last_paragraph_index: session.lastParagraphIndex ?? null,
      p_client_revision: session.clientRevision,
    })
    if (error) {
      console.warn('[ReadingActivity] durable write failed:', error.message)
      return 'failed'
    }
    const result = Array.isArray(data) ? data[0] : data
    if (!result || typeof result !== 'object' || !('applied' in result)) return 'failed'
    return result.applied === false ? 'superseded' : 'applied'
  } catch (error) {
    console.warn('[ReadingActivity] durable write threw:', error)
    return 'failed'
  }
}

const drainPromises = new Map<string, Promise<void>>()

/** Replay only the current user's queue. Each row is idempotent by session UUID
 * and server-side client revision, so an older retry cannot erase a newer hit. */
export function drainPendingReadingActivity(userId: string): Promise<void> {
  const existing = drainPromises.get(userId)
  if (existing) return existing
  let failed = false
  const promise = (async () => {
    const snapshot = loadPendingReadingActivity()
    for (const [key, session] of snapshot.entries()) {
      if (session.userId !== userId) continue
      const result = await commitReadingActivity(session)
      if (result === 'failed') {
        failed = true
        break
      }
      const latest = loadPendingReadingActivity()
      const stillQueued = latest.get(key)
      if (stillQueued && stillQueued.clientRevision <= session.clientRevision) {
        latest.delete(key)
        savePendingReadingActivity(latest)
      }
    }
  })().finally(() => {
    drainPromises.delete(userId)
    // A newer revision may have been queued while the request was in flight.
    // Drain it now after a successful pass; do not spin when the network or
    // migration is unavailable.
    if (!failed) {
      const hasMoreForUser = Array.from(loadPendingReadingActivity().values())
        .some(session => session.userId === userId)
      if (hasMoreForUser) void drainPendingReadingActivity(userId)
    }
  })
  drainPromises.set(userId, promise)
  return promise
}

/** Queue synchronously before attempting the network so closing the tab or
 * going offline cannot silently drop the latest session revision. */
export function persistReadingActivity(session: DurableReadingActivitySession): void {
  enqueueReadingActivity(session)
  void drainPendingReadingActivity(session.userId)
}

interface ReadingActivityRow {
  session_id?: unknown
  book_id?: unknown
  chapter_number?: unknown
  edition_key?: unknown
  mode?: unknown
  started_at?: unknown
  last_active_at?: unknown
  start_paragraph_index?: unknown
  last_paragraph_index?: unknown
  client_revision?: unknown
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseReadingActivityRow(row: ReadingActivityRow, userId: string): DurableReadingActivitySession | null {
  const startedAt = parseTimestamp(row.started_at)
  const lastActiveAt = parseTimestamp(row.last_active_at)
  const mode = row.mode === 'read' || row.mode === 'listened' ? row.mode : null
  if (!mode) return null
  const candidate: DurableReadingActivitySession = {
    sessionId: typeof row.session_id === 'string' ? row.session_id : '',
    userId,
    bookId: typeof row.book_id === 'string' ? row.book_id : '',
    chapterNumber: typeof row.chapter_number === 'number' ? row.chapter_number : 0,
    editionKey: typeof row.edition_key === 'string' ? row.edition_key : '',
    mode,
    startedAt: startedAt || 0,
    lastActiveAt: lastActiveAt || 0,
    startParagraphIndex: optionalParagraph(row.start_paragraph_index),
    lastParagraphIndex: optionalParagraph(row.last_paragraph_index),
    clientRevision: typeof row.client_revision === 'number' ? row.client_revision : 0,
  }
  return isDurableSession(candidate) ? candidate : null
}

/** Indexed user/time query used at voice-tool call time. It intentionally does
 * not depend on the generic user_data bootstrap cache. */
export async function queryReadingActivitySessions(args: {
  userId: string
  start?: number
  end?: number
  bookIds?: string[]
  limit?: number
}): Promise<ReadingActivityQueryResult> {
  if (!supabase) return { status: 'unavailable', sessions: [], error: 'supabase_not_configured' }
  if (args.bookIds && args.bookIds.length === 0) return { status: 'ok', sessions: [] }
  try {
    let query = supabase
      .from('reading_activity_sessions')
      .select('session_id, book_id, chapter_number, edition_key, mode, started_at, last_active_at, start_paragraph_index, last_paragraph_index, client_revision')
      .eq('user_id', args.userId)
      .order('last_active_at', { ascending: false })
      .limit(Math.max(1, Math.min(args.limit ?? 64, 100)))
    if (args.start !== undefined) query = query.gte('last_active_at', new Date(args.start).toISOString())
    if (args.end !== undefined) query = query.lt('started_at', new Date(args.end).toISOString())
    if (args.bookIds) query = query.in('book_id', args.bookIds)
    const { data, error } = await query
    if (error) {
      console.warn('[ReadingActivity] history query failed:', error.message)
      return { status: 'unavailable', sessions: [], error: error.message }
    }
    const sessions = (Array.isArray(data) ? data : [])
      .map(row => parseReadingActivityRow(row, args.userId))
      .filter((row): row is DurableReadingActivitySession => Boolean(row))
    return { status: 'ok', sessions }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('[ReadingActivity] history query threw:', message)
    return { status: 'unavailable', sessions: [], error: message }
  }
}
