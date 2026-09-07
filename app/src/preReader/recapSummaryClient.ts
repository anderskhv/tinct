/**
 * Client side of the "so far" summary: the request to `/api/lab-recap` and a
 * small device cache so the library opens with the line already filled on a
 * repeat visit. Pure over an injectable fetch and storage; nothing here
 * touches the DOM.
 *
 * The cache lives under the `tinct:` namespace so sign-out wipes it with the
 * rest of the device's user data.
 *
 * A short absence is not summarised. Owner rule (2026-09-07): the "so far"
 * line is for a reader coming back to a book after being away from it, not
 * for someone who stepped out of the reader a minute ago — that reader
 * already knows where they are. `recapSummaryPermission` is the whole of that
 * rule — both conditions, the hour away and the return straight out of the
 * book's own reader — and the hero asks it before it asks the network.
 */
import { LAB_RECAP_ROUTE, type LabRecapRequest, type LabRecapResponse } from '../recapSummary'

/**
 * Away from a book for at least this long before a "so far" summary is
 * generated for it. Below it the hero says where the reader is and nothing
 * more: no request, no model call, no cache write.
 */
export const LAB_RECAP_MIN_AWAY_MS = 60 * 60 * 1000

export const RECAP_SUMMARY_STORAGE_KEY = 'tinct:lab-recap-summaries'
/** Entries kept per device, newest first. */
export const RECAP_SUMMARY_STORAGE_MAX = 24

export interface RecapAwayInput {
  /**
   * `lastActiveAt` of the book's newest reading-memory session, when there is
   * one. This is the primary clock.
   */
  sessionLastActiveAt?: number | null
  /**
   * The position record's timestamp for the place Continue resumes in. Used
   * only when there is no usable session timestamp.
   */
  placeUpdatedAt?: number | null
  now: number
}

/**
 * When the reader was last in this book: the memory session's `lastActiveAt`,
 * falling back to the position record's timestamp. Null when neither store
 * carries a usable clock value.
 */
export function recapLastSeenAt(input: RecapAwayInput): number | null {
  const session = input.sessionLastActiveAt
  if (typeof session === 'number' && Number.isFinite(session) && session > 0) return session
  const place = input.placeUpdatedAt
  if (typeof place === 'number' && Number.isFinite(place) && place > 0) return place
  return null
}

/**
 * How long the reader has been away from this book, or null when neither
 * store said when they were last in it. A clock that runs backwards (a
 * record written "in the future" by a skewed device) reads as 0 — away for
 * no time at all — rather than as a negative age.
 */
export function recapAwayMs(input: RecapAwayInput): number | null {
  const lastSeen = recapLastSeenAt(input)
  if (lastSeen === null || !Number.isFinite(input.now)) return null
  return Math.max(0, input.now - lastSeen)
}

/**
 * Whether the hero may ask the Worker for a "so far" summary of this place.
 *
 * At or above the threshold: yes — an hour away is long enough that a
 * reminder of the chapter earns its cost. Below it: no, and the caller must
 * skip the request entirely rather than send it and hide the answer.
 *
 * Unknown age (no session and no position timestamp) is NOT "recent": the
 * gap is unmeasured, not small, so the request goes ahead exactly as it did
 * before this rule existed. A plumbing regression that lost the timestamps
 * would then cost a few summaries, not silently delete the feature.
 */
export function shouldRequestRecapSummary(input: RecapAwayInput & { minAwayMs?: number }): boolean {
  const away = recapAwayMs(input)
  if (away === null) return true
  return away >= (input.minAwayMs ?? LAB_RECAP_MIN_AWAY_MS)
}

/** Where the pre-reader parked the book it last opened the reader on, in this browser session. */
export interface RecapReaderOrigin {
  bookId: string
  at: number
}

export interface RecapSummaryPermission {
  /** May the hero show a summary this device already holds for this place? */
  cache: boolean
  /** May the hero ask the Worker for one? */
  request: boolean
  reason: 'from-reader' | 'recent' | 'allowed'
}

/**
 * Everything the hero is allowed to do about a "so far" summary, in one
 * place. Two conditions, and they are different conditions:
 *
 *  1. **Straight back out of this book's reader** (`from-reader`). The reader
 *     went into this book from here and has come back to the library in the
 *     same browser session: they know what they just read, so the hero shows
 *     the position line and nothing else — no request, and not even a
 *     summary this device already has. Showing one would be the library
 *     recapping the page the reader was looking at a moment ago.
 *
 *  2. **Away from the book for less than `LAB_RECAP_MIN_AWAY_MS`**
 *     (`recent`, the release-3.12 rule). Nothing is *generated* for a
 *     five-minute break — no request, no model call, no spent free action —
 *     but a summary this device already holds is still shown, because it
 *     costs nothing and is true of the place on screen.
 *
 * The origin marker is honoured only while it is fresh (the same hour that
 * governs rule 2). A tab left open on the library all afternoon is no longer
 * "just back from the reader".
 */
export function recapSummaryPermission(input: RecapAwayInput & {
  bookId: string
  origin?: RecapReaderOrigin | null
  minAwayMs?: number
}): RecapSummaryPermission {
  const minAwayMs = input.minAwayMs ?? LAB_RECAP_MIN_AWAY_MS
  const origin = input.origin
  const fromThisBooksReader = Boolean(
    origin
    && origin.bookId === input.bookId
    && Number.isFinite(origin.at)
    && Number.isFinite(input.now)
    && input.now - origin.at >= 0
    && input.now - origin.at < minAwayMs,
  )
  if (fromThisBooksReader) return { cache: false, request: false, reason: 'from-reader' }
  if (!shouldRequestRecapSummary({ ...input, minAwayMs })) return { cache: true, request: false, reason: 'recent' }
  return { cache: true, request: true, reason: 'allowed' }
}

export interface StoredRecapSummary {
  summary: string
  at: number
}

interface StoredRecapSummaries {
  v: 1
  entries: Record<string, StoredRecapSummary>
}

export interface RecapSummaryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

type FetchLike = (input: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>

export type RecapSummaryResult =
  | { ok: true; response: LabRecapResponse }
  | { ok: false; error: string }

function readStore(storage: RecapSummaryStorage | null): StoredRecapSummaries {
  try {
    const raw = storage?.getItem(RECAP_SUMMARY_STORAGE_KEY)
    if (!raw) return { v: 1, entries: {} }
    const parsed = JSON.parse(raw) as Partial<StoredRecapSummaries>
    if (parsed?.v !== 1 || !parsed.entries || typeof parsed.entries !== 'object') return { v: 1, entries: {} }
    return { v: 1, entries: parsed.entries }
  } catch {
    return { v: 1, entries: {} }
  }
}

export function readStoredRecapSummary(storage: RecapSummaryStorage | null, key: string): string | null {
  const entry = readStore(storage).entries[key]
  return entry && typeof entry.summary === 'string' && entry.summary.trim() ? entry.summary : null
}

/** Remember a summary under its cache key; the oldest entries beyond the cap are dropped. */
export function storeRecapSummary(storage: RecapSummaryStorage | null, key: string, summary: string, now: number): void {
  if (!storage) return
  const store = readStore(storage)
  store.entries[key] = { summary, at: now }
  const kept = Object.entries(store.entries)
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, RECAP_SUMMARY_STORAGE_MAX)
  try {
    storage.setItem(RECAP_SUMMARY_STORAGE_KEY, JSON.stringify({ v: 1, entries: Object.fromEntries(kept) }))
  } catch { /* private mode / quota */ }
}

/**
 * Ask the Worker for the summary. Any failure is reported, never shown: the
 * hero keeps its position line and nothing else.
 */
export async function requestLabRecapSummary(input: {
  request: LabRecapRequest
  token?: string | null
  fetchImpl?: FetchLike
  apiBase?: string
}): Promise<RecapSummaryResult> {
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string, init: RequestInit) => fetch(url, init) : null)
  if (!fetchImpl) return { ok: false, error: 'fetch unavailable' }
  try {
    const response = await fetchImpl(`${input.apiBase ?? ''}${LAB_RECAP_ROUTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.token ? { Authorization: `Bearer ${input.token}` } : {}),
      },
      body: JSON.stringify(input.request),
    })
    if (!response.ok) return { ok: false, error: `recap route returned ${response.status}` }
    const data = await response.json() as Partial<LabRecapResponse> | null
    const summary = typeof data?.summary === 'string' ? data.summary.trim() : ''
    if (!summary || !data?.coverage) return { ok: false, error: 'recap route returned no summary' }
    return { ok: true, response: { ...data, summary } as LabRecapResponse }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'request failed' }
  }
}
