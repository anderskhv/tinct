import { adoptReadingMemoryOnSignIn } from './adoption'
import { browserKeyValueStorage, deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory, type KeyValueStorage } from './deviceStore'
import { drainReadingMemoryQueue, type ReadingMemoryCloud } from './queue'
import { buildRecapCard, type RecapFormatOptions, type RecapSummary } from './recap'
import { READING_SESSION_GAP_MS } from './recorder'
import {
  applyReadingMemoryEvent,
  applyReadingMemoryEvents,
  closeStaleSessions,
  eventFromSession,
  latestReadingSession,
  mergeReadingMemory,
  visibleToViewer,
} from './sessions'
import { summaryAttemptDue, summaryMatchesSession, withStoredSummary, withSummaryError, type RecapSummaryResult } from './summary'
import type { ReadingAnchor, ReadingMemoryState, ReadingSession, RecapCard, RecapSource, RecapSyncState } from './types'

export interface RecapAuth {
  userId: string | null
  token: string | null
}

export interface RecapLoadDeps {
  /** Current account, read from the persisted auth session (works offline). */
  auth: () => Promise<RecapAuth>
  storage?: KeyValueStorage | null
  /** Versioned cloud copy for a signed-in account; null when unconfigured. */
  cloudFor?: (userId: string) => ReadingMemoryCloud | null
  loadChapter: (anchor: ReadingAnchor) => Promise<{ paragraphs: string[] } | null>
  /** The worker chat path; absent means summaries are off. */
  requestSummary?: (input: { token: string; session: ReadingSession; paragraphs: string[]; bookTitle?: string }) => Promise<RecapSummaryResult>
  bookTitle?: (bookId: string) => string | undefined
  now?: () => number
  online?: () => boolean
  sessionGapMs?: number
  format?: RecapFormatOptions
  /** False to forbid a summary attempt in this load (budget spent already). */
  allowSummary?: boolean
  /** A user-initiated retry ignores the time back-off (never the attempt cap). */
  manualSummary?: boolean
}

export interface RecapResumeTarget {
  bookId: string
  editionKey: string
  chapterNumber: number
  /** 0-based rendered page the reader stopped on. */
  pageIndex: number
  paragraphIndex: number
  wordIndex: number
}

export type RecapSummaryStatus = 'stored' | 'generated' | 'failed' | 'not-due' | 'unavailable'

export interface RecapLoadResult {
  card: RecapCard
  session: ReadingSession
  paragraphs: string[] | null
  signedIn: boolean
  online: boolean
  syncState: RecapSyncState
  /** Newest session by lastActiveAt, whatever its sync state. */
  resume: RecapResumeTarget
  summaryStatus: RecapSummaryStatus
  /** True when this load spent a summary attempt (success or failure). */
  summaryAttempted: boolean
}

function toRecapSummary(session: ReadingSession): RecapSummary | null {
  const stored = summaryMatchesSession(session)
  if (!stored) return null
  return { text: stored.text, model: stored.model, version: stored.version, route: stored.route, generatedAt: stored.generatedAt }
}

/**
 * Load "What you read last".
 *
 *  1. Signed in: adopt signed-out sessions, drain the queue (online only),
 *     merge the cloud copy into the device mirror. Offline, the mirror is the
 *     truth and the queue keeps every write for the next `online`.
 *  2. Close open sessions older than the 30-minute gap (at their last real
 *     activity) — the recap-load half of the rule.
 *  3. Pick the newest session visible to this viewer by lastActiveAt.
 *  4. Signed in, online, closed session without a summary and with attempts
 *     left: generate the summary ONCE, store it inside the session (new seq)
 *     and queue it; on failure store `summaryError` and back off.
 *  5. Drain what this load queued, then report the sync state.
 */
export async function loadRecap(deps: RecapLoadDeps): Promise<RecapLoadResult | null> {
  const now = deps.now ?? (() => Date.now())
  const online = deps.online ? deps.online() : (typeof navigator === 'undefined' ? true : navigator.onLine !== false)
  const storage = deps.storage === undefined ? browserKeyValueStorage() : deps.storage
  const gapMs = deps.sessionGapMs ?? READING_SESSION_GAP_MS
  const auth = await deps.auth()
  const signedIn = Boolean(auth.userId)
  const queue = deviceReadingMemoryQueue(storage)

  let cloud: ReadingMemoryCloud | null = null
  let cloudState: ReadingMemoryState | null = null
  let state = readDeviceReadingMemory(storage)

  if (auth.userId) {
    cloud = deps.cloudFor?.(auth.userId) ?? null
    const adoption = await adoptReadingMemoryOnSignIn({ userId: auth.userId, storage, cloud, drain: online })
    state = readDeviceReadingMemory(storage)
    if (cloud && online) {
      cloudState = adoption.drain?.state ?? null
      if (!cloudState) {
        try {
          cloudState = (await cloud.read())?.state ?? null
        } catch {
          cloudState = null
        }
      }
      if (cloudState) {
        state = mergeReadingMemory(state, cloudState)
        writeDeviceReadingMemory(state, storage)
      }
    }
  }

  const stale = closeStaleSessions(state, now(), gapMs)
  if (stale.length > 0) {
    state = applyReadingMemoryEvents(state, stale)
    writeDeviceReadingMemory(state, storage)
    if (signedIn) for (const event of stale) queue.push(event)
  }

  let session = latestReadingSession(state, visibleToViewer(auth.userId))
  if (!session) return null

  const chapter = await deps.loadChapter(session.anchor)
  const paragraphs = chapter?.paragraphs ?? null

  let summaryStatus: RecapSummaryStatus = summaryMatchesSession(session) ? 'stored' : 'unavailable'
  let summaryAttempted = false
  const canGenerate = Boolean(auth.userId && auth.token && online && paragraphs && deps.requestSummary && deps.allowSummary !== false)
  if (summaryStatus !== 'stored' && canGenerate) {
    const due = summaryAttemptDue(session, now(), { manual: deps.manualSummary })
    if (!due.attempt) {
      summaryStatus = 'not-due'
    } else {
      summaryAttempted = true
      const result = await deps.requestSummary!({
        token: auth.token as string,
        session,
        paragraphs: paragraphs as string[],
        bookTitle: deps.bookTitle?.(session.anchor.bookId),
      })
      const updated = result.ok ? withStoredSummary(session, result.summary, now()) : withSummaryError(session, result.error, now())
      summaryStatus = result.ok ? 'generated' : 'failed'
      state = applyReadingMemoryEvent(state, eventFromSession(updated))
      session = updated
      writeDeviceReadingMemory(state, storage)
      queue.push(eventFromSession(updated))
    }
  }

  if (cloud && online && queue.pending().length > 0) {
    const drained = await drainReadingMemoryQueue(queue, cloud).catch(() => null)
    if (drained?.state) cloudState = drained.state
  }

  const pendingForSession = queue.pending().some(event => event.sessionId === session!.id)
  const inCloud = cloudState?.sessions[session.id]
  const synced = Boolean(inCloud && inCloud.seq >= session.seq) && !pendingForSession
  const syncState: RecapSyncState = !signedIn ? 'device-only' : synced ? 'synced' : 'pending'
  const source: RecapSource = syncState === 'synced' ? 'cloud' : 'device'

  const card = buildRecapCard({
    session,
    source,
    paragraphs,
    summary: toRecapSummary(session),
    syncState,
    format: deps.format,
  })
  return {
    card,
    session,
    paragraphs,
    signedIn,
    online,
    syncState,
    resume: {
      bookId: session.anchor.bookId,
      editionKey: session.anchor.editionKey,
      chapterNumber: session.anchor.chapterNumber,
      pageIndex: Math.max(0, session.anchor.page - 1),
      paragraphIndex: session.anchor.paragraphIndex,
      wordIndex: session.anchor.wordIndex,
    },
    summaryStatus,
    summaryAttempted,
  }
}

/** Copy for the recap header's sync line. */
export function recapSyncCopy(syncState: RecapSyncState, online: boolean): string {
  if (syncState === 'device-only') return 'Saved on this device only · sign in to keep it'
  if (syncState === 'synced') return 'Synced to your account'
  return online ? 'Saving to your account…' : "Will sync when you're back online"
}
