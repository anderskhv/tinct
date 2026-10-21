/**
 * The reader's side of the reading-time ledger (social brief, ship 1).
 *
 * While the Worker's SOCIAL_READING_TIME switch is off, nothing here sends
 * anything and the reader keeps today's device tally (labReadingYear.ts)
 * exactly as before. On:
 * - every counted tick (same activity rule as the device tally) goes to a
 *   small per-day, per-book pending store on the device instead of the yearly
 *   tally, so each second is in exactly one place;
 * - signed in, a heartbeat about every five minutes sends the current book's
 *   pending time; the Worker credits it under its limits;
 * - whatever a heartbeat cannot carry (signed out, offline, another book or
 *   day, the ledger not there yet) stays pending and is flushed later, once,
 *   under a flush id. A signed-out tally is flushed on sign-in.
 * - opening the You card or the Leaderboard first sends everything pending
 *   (flushPendingNow), so those figures and the board read the same rows.
 */
import { apiUrl } from '../utils/apiUrl'
import { emptyReadingYear, writeLocalReadingYear } from './labReadingYear'
import { BEAT_MAX_SECONDS, FLUSH_MAX_AGE_DAYS, addDays, daysBetween, localDay, type LedgerRow } from '../readingTime/model'

export type LedgerStatus = 'unknown' | 'off' | 'on' | 'unavailable'

let statusRequest: { at: number; promise: Promise<boolean>; failed?: boolean } | null = null

/**
 * How long a reader page trusts the switch it was told. A reader tab stays
 * open for days; on 8 Oct 2026 the switch went on, off and on again while tabs
 * stayed open, and a page that had once heard "off" (or could not ask) kept
 * counting into the yearly tally, which the ledger had already merged once,
 * so that reading never reached the ledger.
 */
export const SWITCH_RECHECK_MS = 5 * 60_000

/** A failed status request is kept this long at most, then asked again. */
export const SWITCH_FAILURE_KEEP_MS = 60_000

/**
 * Whether reading time is switched on. One answer is shared while it is
 * younger than `maxAgeMs` (default: for the page's life); a failed request
 * (read as off) only for SWITCH_FAILURE_KEEP_MS, so the next caller after
 * that asks again.
 */
export function readingTimeSwitch(fetchImpl: typeof fetch | undefined = typeof fetch === 'function' ? fetch : undefined, options: { maxAgeMs?: number } = {}): Promise<boolean> {
  if (!fetchImpl) return Promise.resolve(false)
  const maxAge = options.maxAgeMs ?? Number.POSITIVE_INFINITY
  if (statusRequest) {
    const keep = statusRequest.failed ? Math.min(maxAge, SWITCH_FAILURE_KEEP_MS) : maxAge
    if (Date.now() - statusRequest.at <= keep) return statusRequest.promise
  }
  const entry: { at: number; promise: Promise<boolean>; failed?: boolean } = { at: Date.now(), promise: Promise.resolve(false) }
  statusRequest = entry
  entry.promise = fetchImpl(apiUrl('/api/reading-time/status'), { cache: 'no-store' })
    .then(async response => {
      if (!response.ok) throw new Error(String(response.status))
      return (await response.json() as { enabled?: unknown }).enabled === true
    })
    .catch(() => {
      entry.failed = true
      return false
    })
  return entry.promise
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
 * BEAT_MAX_SECONDS of it (listening first). The rest waits for the next beat.
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

/**
 * One ledger send at a time: the heartbeat, the reader's flush and the flush
 * on opening the cards each read the pending store and send under this lock,
 * so no second is sent by two of them (on this page; across tabs too where
 * the browser has Web Locks).
 */
let sendChain: Promise<unknown> = Promise.resolve()
export function withLedgerSend<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: { request?: (name: string, cb: () => Promise<unknown>) => Promise<unknown> } }).locks : undefined
  const run = (): Promise<T> => (typeof locks?.request === 'function' ? locks.request('tinct-reading-time-send', fn) as Promise<T> : fn())
  const next = sendChain.then(run, run)
  sendChain = next.catch(() => undefined)
  return next
}

type SentEntry = { day: string; bookId: string } & PendingTime
/** Pending time on its way to the Worker right now (memory only). */
const inFlight = new Set<{ owner: string | null; entries: SentEntry[] }>()

/** Runs `send` with `entries` marked as on their way, so the figures neither count them twice nor lag the board. */
export async function trackSending<T>(owner: string | null, entries: SentEntry[], send: () => Promise<T>): Promise<T> {
  const mark = { owner, entries }
  inFlight.add(mark)
  try { return await send() } finally { inFlight.delete(mark) }
}

function minus(store: PendingStore, entries: SentEntry[]): PendingStore {
  const out: PendingStore = {}
  for (const [day, books] of Object.entries(store)) for (const [bookId, time] of Object.entries(books)) (out[day] ??= {})[bookId] = { ...time }
  for (const item of entries) {
    const prev = out[item.day]?.[item.bookId]
    if (!prev) continue
    const next = { read: Math.max(0, prev.read - whole(item.read)), listen: Math.max(0, prev.listen - whole(item.listen)) }
    if (next.read + next.listen > 0) out[item.day][item.bookId] = next
    else {
      delete out[item.day][item.bookId]
      if (Object.keys(out[item.day]).length === 0) delete out[item.day]
    }
  }
  return out
}

/**
 * The pending time the figures add to the ledger rows: the store less what is
 * on its way right now. A send that lands is in the ledger the board reads; one
 * that fails is back in the figures on the next read.
 */
export function pendingForFigures(owner: string | null): PendingStore {
  const store = readPending(owner)
  const sending = [...inFlight].filter(mark => mark.owner === owner).flatMap(mark => mark.entries)
  return sending.length ? minus(store, sending) : store
}

/**
 * The pending time a heartbeat may carry: the store less the entries of a
 * flush sent but not yet confirmed (it is resent under its id, so a beat must
 * not carry the same seconds again). Since 21 Oct 2026 such a flush can hold
 * today's current book (flushPendingNow).
 */
export function pendingForBeat(userId: string): PendingStore {
  const store = readPending(userId)
  const stored = readStoredFlush(userId)
  return stored && stored.owner === userId ? minus(store, stored.entries) : store
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

function readStoredFlush(userId: string): StoredFlush | null {
  try {
    const stored = JSON.parse(localStorage.getItem(flushKey(userId)) || 'null') as StoredFlush | null
    return stored && typeof stored.flushId === 'string' && Array.isArray(stored.entries) ? stored : null
  } catch {
    return null
  }
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
  const stored = readStoredFlush(input.userId)
  if (stored) return stored
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
    const response = await trackSending(flush.owner, flush.entries, () => fetchImpl(apiUrl('/api/reading-time/flush'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ flushId: flush.flushId, entries: flush.entries, earlier: flush.earlier }),
    }))
    if (response.status === 429) return 'too-soon'
    if (response.status === 503) {
      // Failed part-way: the id is spent and the first `applied` entries landed.
      // Take those off and drop the stored flush; the rest goes under a new id.
      const data = await response.json().catch(() => null) as { applied?: unknown } | null
      const applied = data?.applied
      if (typeof applied === 'number' && Number.isInteger(applied) && applied >= 0) {
        subtractPending(flush.owner, flush.entries.slice(0, applied))
        try { localStorage.removeItem(flushKey(userId)) } catch { /* ignore */ }
      }
      return 'unavailable'
    }
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

/** How long opening the You card or the Leaderboard waits for this device's pending time to reach the ledger. */
export const OPEN_FLUSH_WAIT_MS = 2_000

export type OpenFlushOutcome = 'nothing' | 'flushed' | 'failed' | 'late'

let openFlush: { userId: string; promise: Promise<OpenFlushOutcome> } | null = null

async function flushAllPending(token: string, userId: string, fetchImpl: typeof fetch): Promise<OpenFlushOutcome> {
  const waiting = () => pendingSeconds(readPending(userId)) + pendingSeconds(readPending(null)) > 0 || readStoredFlush(userId) !== null
  if (!waiting()) return 'nothing'
  if (!(await readingTimeSwitch(fetchImpl))) return 'nothing'
  return withLedgerSend(async () => {
    let sent = false
    // The signed-out store goes in a flush of its own, so at most two.
    for (let round = 0; round < 2; round += 1) {
      const batch = nextFlush({ userId, today: localDay(), currentBookId: null, guestEarlier: null })
      if (!batch) break
      const outcome = await sendFlush(token, userId, batch, year => writeLocalReadingYear(emptyReadingYear(year), null), fetchImpl)
      if (outcome !== 'credited') return 'failed'
      sent = true
    }
    return sent ? 'flushed' : 'nothing'
  })
}

/**
 * Sends everything this device still holds for the reader (every day and
 * book, today's current one too) before the You card's figures, its rank and
 * the Leaderboard are read, so all three come from the same ledger rows
 * (21 Oct 2026: the You card said 16 m while the board said 12 m: the
 * difference was this device's time waiting for its next heartbeat).
 *
 * Writes only when something is pending: at most one flush per open (two
 * after signed-out reading). Waits at most `waitMs`; a send still on its way
 * then goes on behind ('late'), and its seconds are left out of the figures
 * until it settles (pendingForFigures). Failed or offline, the pending time
 * stays on the device and the You card still adds it. Never throws.
 */
export function flushPendingNow(token: string, userId: string | null, options: { fetchImpl?: typeof fetch; waitMs?: number } = {}): Promise<OpenFlushOutcome> {
  if (!userId) return Promise.resolve('nothing')
  // One flush at a time: a second open while one is on its way waits for it.
  const running = openFlush && openFlush.userId === userId ? openFlush.promise : null
  const promise = running ?? flushAllPending(token, userId, options.fetchImpl ?? fetch).catch((): OpenFlushOutcome => 'failed')
  if (!running) {
    const entry = { userId, promise }
    openFlush = entry
    void promise.finally(() => { if (openFlush === entry) openFlush = null })
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const late = new Promise<OpenFlushOutcome>(resolve => { timer = setTimeout(() => resolve('late'), options.waitMs ?? OPEN_FLUSH_WAIT_MS) })
  return Promise.race([promise, late]).finally(() => clearTimeout(timer))
}

/** Tests only. */
export function resetLedgerSends(): void {
  sendChain = Promise.resolve()
  inFlight.clear()
  openFlush = null
}

export interface ReadingTimeSummary { rows: LedgerRow[] }

/** How long the reader waits for its ledger rows before showing what it has. */
export const SUMMARY_TIMEOUT_MS = 8_000

/**
 * The reader's ledger rows; null while off, unavailable or slower than
 * `timeoutMs` (the caller shows the device tally). Without a timeout a request
 * that never answered left the account sheet on its loading dash.
 */
export async function fetchReadingTime(token: string, fetchImpl: typeof fetch = fetch, options: { timeoutMs?: number } = {}): Promise<ReadingTimeSummary | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timeout = new Promise<null>(resolve => {
    timer = setTimeout(() => { controller?.abort(); resolve(null) }, options.timeoutMs ?? SUMMARY_TIMEOUT_MS)
  })
  try {
    return await Promise.race([readSummary(token, fetchImpl, controller?.signal), timeout])
  } finally {
    clearTimeout(timer)
  }
}

async function readSummary(token: string, fetchImpl: typeof fetch, signal: AbortSignal | undefined): Promise<ReadingTimeSummary | null> {
  try {
    const response = await fetchImpl(apiUrl('/api/reading-time'), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', ...(signal ? { signal } : {}) })
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
