/**
 * The reader's side of the reading-time ledger (social brief, ship 1).
 *
 * While the Worker's SOCIAL_READING_TIME switch is off, nothing here sends
 * anything and the reader keeps today's device tally (labReadingYear.ts)
 * exactly as before. On:
 * - every counted tick (same activity rule as the device tally) goes to a
 *   small per-day, per-book pending store on the device instead of the yearly
 *   tally, so each second is in exactly one place;
 * - signed in, a heartbeat about once a minute sends the current book's
 *   pending time; the Worker credits it under its limits;
 * - whatever a heartbeat cannot carry (signed out, offline, another book or
 *   day, the ledger not there yet) stays pending and is flushed later, once,
 *   under a flush id. A signed-out tally is flushed on sign-in.
 */
import { apiUrl } from '../utils/apiUrl'
import { BEAT_MAX_SECONDS, FLUSH_MAX_AGE_DAYS, addDays, daysBetween, localDay, type LedgerRow } from '../readingTime/model'

export type LedgerStatus = 'unknown' | 'off' | 'on' | 'unavailable'

let statusRequest: Promise<boolean> | null = null

/** Whether reading time is switched on, asked once per page. Any failure reads as off. */
export function readingTimeSwitch(fetchImpl: typeof fetch | undefined = typeof fetch === 'function' ? fetch : undefined): Promise<boolean> {
  if (!fetchImpl) return Promise.resolve(false)
  statusRequest ??= fetchImpl(apiUrl('/api/reading-time/status'), { cache: 'no-store' })
    .then(async response => response.ok && (await response.json() as { enabled?: unknown }).enabled === true)
    .catch(() => false)
  return statusRequest
}

/** Tests only. */
export function resetReadingTimeSwitch(): void {
  statusRequest = null
}

export interface PendingTime { read: number; listen: number }
export type PendingStore = Record<string, Record<string, PendingTime>>

function pendingKey(owner: string | null): string {
  return `tinct:reading-time-pending:${owner ?? 'guest'}`
}

function whole(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

export function readPending(owner: string | null): PendingStore {
  try {
    const raw = JSON.parse(localStorage.getItem(pendingKey(owner)) || 'null')
    if (!raw || typeof raw !== 'object') return {}
    const out: PendingStore = {}
    for (const [day, books] of Object.entries(raw as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !books || typeof books !== 'object') continue
      for (const [bookId, value] of Object.entries(books as Record<string, unknown>)) {
        const time = value as Partial<PendingTime> | null
        const read = whole(time?.read), listen = whole(time?.listen)
        if (read + listen > 0) (out[day] ??= {})[bookId] = { read, listen }
      }
    }
    return out
  } catch {
    return {}
  }
}

function writePending(owner: string | null, store: PendingStore): void {
  try {
    if (Object.keys(store).length === 0) localStorage.removeItem(pendingKey(owner))
    else localStorage.setItem(pendingKey(owner), JSON.stringify(store))
  } catch { /* private mode */ }
}

/** Drops days a flush could no longer carry. */
export function trimPending(store: PendingStore, today: string): PendingStore {
  const out: PendingStore = {}
  for (const [day, books] of Object.entries(store)) {
    if (daysBetween(day, today) <= FLUSH_MAX_AGE_DAYS) out[day] = books
  }
  return out
}

export function addPending(owner: string | null, day: string, bookId: string, time: Partial<PendingTime>): void {
  const store = trimPending(readPending(owner), day)
  const prev = store[day]?.[bookId] ?? { read: 0, listen: 0 }
  ;(store[day] ??= {})[bookId] = { read: prev.read + whole(time.read), listen: prev.listen + whole(time.listen) }
  writePending(owner, store)
}

/** Takes `taken` off the store (what was sent); time added since stays. */
export function subtractPending(owner: string | null, taken: Array<{ day: string; bookId: string } & PendingTime>): void {
  const store = readPending(owner)
  for (const item of taken) {
    const prev = store[item.day]?.[item.bookId]
    if (!prev) continue
    const next = { read: Math.max(0, prev.read - whole(item.read)), listen: Math.max(0, prev.listen - whole(item.listen)) }
    if (next.read + next.listen > 0) store[item.day][item.bookId] = next
    else {
      delete store[item.day][item.bookId]
      if (Object.keys(store[item.day]).length === 0) delete store[item.day]
    }
  }
  writePending(owner, store)
}

export function pendingSeconds(store: PendingStore): number {
  let total = 0
  for (const books of Object.values(store)) for (const time of Object.values(books)) total += time.read + time.listen
  return total
}

export function pendingRows(store: PendingStore): LedgerRow[] {
  return Object.entries(store).flatMap(([day, books]) => Object.entries(books).map(([bookId, time]) => ({ day, bookId, read: time.read, listen: time.listen })))
}

/**
 * What one heartbeat carries: the current book's pending time today, at most
 * a minute of it (listening first). The rest waits for the next beat.
 */
export function beatPayload(store: PendingStore, day: string, bookId: string, playing: boolean): { day: string; bookId: string; read: number; listen: number; playing: boolean } | null {
  const time = store[day]?.[bookId]
  if (!time) return null
  const listen = Math.min(time.listen, BEAT_MAX_SECONDS)
  const read = Math.min(time.read, BEAT_MAX_SECONDS - listen)
  if (read + listen <= 0) return null
  return { day, bookId, read, listen, playing: playing || listen > 0 }
}

export type BeatOutcome = 'credited' | 'too-soon' | 'off' | 'unavailable' | 'failed'

export async function sendBeat(token: string, beat: NonNullable<ReturnType<typeof beatPayload>>, fetchImpl: typeof fetch = fetch): Promise<BeatOutcome> {
  try {
    const response = await fetchImpl(apiUrl('/api/reading-time/beat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(beat),
      keepalive: true,
    })
    if (response.status === 429) return 'too-soon'
    if (response.status === 503) return 'unavailable'
    if (!response.ok) return 'failed'
    const data = await response.json().catch(() => null) as { enabled?: boolean } | null
    return data?.enabled === false ? 'off' : 'credited'
  } catch {
    return 'failed'
  }
}

interface StoredFlush {
  flushId: string
  owner: string | null
  entries: Array<{ day: string; bookId: string } & PendingTime>
  earlier: number
  /** Guest yearly tally year that `earlier` came from, cleared once the flush lands. */
  earlierYear?: number
}

function flushKey(userId: string): string {
  return `tinct:reading-time-flush:${userId}`
}

function newFlushId(): string {
  const bytes = new Uint8Array(12)
  try { crypto.getRandomValues(bytes) } catch { for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256) }
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Builds the next flush for `userId`: every pending entry of the account
 * except the one the heartbeat is draining (today's current book), and,
 * after sign-in, everything the signed-out tally holds. A flush that was
 * sent but not confirmed is resent as it was, with the same id.
 */
export function nextFlush(input: {
  userId: string
  today: string
  currentBookId: string | null
  guestEarlier: { year: number; seconds: number } | null
}): StoredFlush | null {
  try {
    const stored = JSON.parse(localStorage.getItem(flushKey(input.userId)) || 'null') as StoredFlush | null
    if (stored && typeof stored.flushId === 'string' && Array.isArray(stored.entries)) return stored
  } catch { /* rebuild */ }
  const today = input.today
  const own = pendingRows(trimPending(readPending(input.userId), today))
    .filter(row => !(row.day === today && row.bookId === input.currentBookId))
  const guest = pendingRows(trimPending(readPending(null), today))
  const earlier = input.guestEarlier?.seconds ?? 0
  if (own.length === 0 && guest.length === 0 && earlier <= 0) return null
  // One owner per flush keeps the bookkeeping exact: the signed-out store first.
  const owner = guest.length > 0 || earlier > 0 ? null : input.userId
  const entries = (owner === null ? guest : own).slice(0, 200)
  const flush: StoredFlush = { flushId: newFlushId(), owner, entries, earlier: owner === null ? earlier : 0, earlierYear: owner === null ? input.guestEarlier?.year : undefined }
  try { localStorage.setItem(flushKey(input.userId), JSON.stringify(flush)) } catch { /* sent once, best effort */ }
  return flush
}

/**
 * Sends a flush; on success takes its entries off the pending store and calls
 * `onEarlierFlushed` so the caller can clear the signed-out yearly tally.
 */
export async function sendFlush(token: string, userId: string, flush: StoredFlush, onEarlierFlushed: (year: number) => void, fetchImpl: typeof fetch = fetch): Promise<BeatOutcome> {
  try {
    const response = await fetchImpl(apiUrl('/api/reading-time/flush'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ flushId: flush.flushId, entries: flush.entries, earlier: flush.earlier }),
    })
    if (response.status === 429) return 'too-soon'
    if (response.status === 503) return 'unavailable'
    if (!response.ok) {
      // A flush the Worker refuses as malformed will never land; drop it rather than retry forever.
      if (response.status === 400) {
        subtractPending(flush.owner, flush.entries)
        try { localStorage.removeItem(flushKey(userId)) } catch { /* ignore */ }
      }
      return 'failed'
    }
    const data = await response.json().catch(() => null) as { enabled?: boolean } | null
    if (data?.enabled === false) return 'off'
    subtractPending(flush.owner, flush.entries)
    if (flush.earlier > 0 && flush.earlierYear) onEarlierFlushed(flush.earlierYear)
    try { localStorage.removeItem(flushKey(userId)) } catch { /* ignore */ }
    return 'credited'
  } catch {
    return 'failed'
  }
}

export interface ReadingTimeSummary { rows: LedgerRow[] }

/** The reader's ledger rows; null while off or unavailable (the caller shows the device tally). */
export async function fetchReadingTime(token: string, fetchImpl: typeof fetch = fetch): Promise<ReadingTimeSummary | null> {
  try {
    const response = await fetchImpl(apiUrl('/api/reading-time'), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!response.ok) return null
    const data = await response.json() as { enabled?: boolean; rows?: unknown }
    if (data.enabled !== true || !Array.isArray(data.rows)) return null
    const rows = data.rows.flatMap(row => {
      const item = row as Partial<LedgerRow>
      return typeof item.day === 'string' && typeof item.bookId === 'string'
        ? [{ day: item.day, bookId: item.bookId, read: whole(item.read), listen: whole(item.listen) }]
        : []
    })
    return { rows }
  } catch {
    return null
  }
}

/** Ledger rows plus this device's time not yet in the ledger, so the figures never lag the reader. */
export function withPending(rows: LedgerRow[], store: PendingStore): LedgerRow[] {
  return [...rows, ...pendingRows(store)]
}

export { localDay, addDays }
