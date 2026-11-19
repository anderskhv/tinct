import { useEffect, useRef } from 'react'
import { readLabDeviceId } from './labPositionStore'
import { emptyReadingYear, forwardPagesRead, readLocalReadingYear, readingYearTotals, recordReading, syncReadingYear, writeLocalReadingYear } from './labReadingYear'
import { SWITCH_RECHECK_MS, addPending, beatPayload, nextFlush, pendingForBeat, readingTimeSwitch, sendBeat, sendFlush, subtractPending, trackSending, withLedgerSend, type LedgerStatus } from './labReadingTime'
import { BEAT_MAX_SECONDS, BEAT_MIN_GAP_MS, PRIVATE_BOOK_ID, ledgerBookId, localDay } from '../readingTime/model'
import { supabase } from '../services/supabase'
import { isInternalTraffic } from '../utils/internalTraffic'
import { createReadingTurns, type ReadingCredit, type ReadingTurns } from './labReadingTurns'

/** Listening is counted on this tick; reading is credited at page turns (labReadingTurns.ts), and the tick only flushes. */
const TICK_MS = 30_000
/**
 * The yearly tally's account copy (one versioned user_data row) goes up this
 * often, and on hide and pagehide. Only used while the ledger is off.
 */
export const READING_YEAR_SYNC_MS = 15 * 60_000
/**
 * Heartbeats: about every five minutes (the Worker accepts one per
 * BEAT_MIN_GAP_MS and credits up to BEAT_MAX_SECONDS). Seconds wait in the
 * pending store between beats; leaving the page sends them at once.
 */
export const LEDGER_BEAT_EVERY_MS = 5 * 60_000 - 2_000
/** Pending time from other books, days, or signed-out reading goes up this often. */
const FLUSH_EVERY_MS = 10 * 60_000

async function sessionToken(userId: string): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id === userId ? data.session.access_token : null
  } catch {
    return null
  }
}

/**
 * Records this device's reading into the year tally: pages for each forward
 * page turn, and time by page turns (labReadingTurns.ts, Anders 10 Nov 2026):
 * each turn credits the visible time since the previous one, at most 15
 * minutes, and the session's last page its typical page time. Listening counts
 * while narration plays, as before.
 *
 * While the Worker's reading-time switch is on (labReadingTime.ts), the same
 * counted time goes to the ledger instead: a per-day, per-book pending store,
 * a heartbeat about every five minutes (and on hide / pagehide), and a flush
 * for what a heartbeat cannot carry. Off (the default, or until the switch is known) nothing changes.
 *
 * A reader's own book (`privateBook`) is never in the device tally (no pages,
 * no time, as before). With the ledger on, its time counts under the one
 * opaque PRIVATE_BOOK_ID bucket: never the own book's id.
 */
export function useLabReadingYear(input: {
  userId: string | null
  bookId: string
  chapter: number
  page: number
  onCover: boolean
  paused: boolean
  listeningRef: { current: boolean }
  /** The reader's own book: counted only in the ledger, under the private bucket. */
  privateBook?: boolean
  /**
   * A turn where `page` does not say one: the Margin reader's newest paragraph in view, a PDF's page. Any change of
   * `bookId`, `chapter`, `page` or `turn` is a page turn for reading time (pages read still follow `page` only).
   */
  turn?: string | number
}): void {
  const { userId, bookId, chapter, page, onCover, paused, listeningRef, privateBook = false, turn } = input
  const previousRef = useRef<{ bookId: string; chapter: number; page: number } | null>(null)
  /** The reading-turns counter of the book on screen (set by the accrual effect below). */
  const turnsRef = useRef<ReadingTurns | null>(null)
  const creditRef = useRef<(credit: ReadingCredit | null) => void>(() => {})
  const dirtyRef = useRef(false)
  const userRef = useRef(userId)
  userRef.current = userId
  const privateRef = useRef(privateBook)
  privateRef.current = privateBook
  // What the ledger records: an own book is the private bucket, whatever its id.
  const bookRef = useRef(bookId)
  bookRef.current = privateBook ? PRIVATE_BOOK_ID : ledgerBookId(bookId)
  const ledgerRef = useRef<LedgerStatus>('unknown')
  const lastBeatRef = useRef(Date.now())
  const lastFlushRef = useRef(0)
  const sendingRef = useRef(false)
  /** When the page last learned the switch was off or the ledger unavailable. */
  const checkedAtRef = useRef(Date.now())

  const settle = (outcome: Awaited<ReturnType<typeof sendBeat>>) => {
    if (outcome !== 'unavailable' && outcome !== 'off') return
    ledgerRef.current = outcome
    checkedAtRef.current = Date.now()
  }

  // Off or unavailable is not for the page's life: ask again every few
  // minutes, and resume the ledger (and flush what waited) once it is on.
  const recheck = () => {
    const status = ledgerRef.current
    if (status !== 'off' && status !== 'unavailable') return
    if (Date.now() - checkedAtRef.current < SWITCH_RECHECK_MS) return
    checkedAtRef.current = Date.now()
    void readingTimeSwitch(undefined, { maxAgeMs: SWITCH_RECHECK_MS }).then(on => {
      const current = ledgerRef.current
      if (current !== 'off' && current !== 'unavailable') return
      if (!on) { ledgerRef.current = 'off'; return }
      ledgerRef.current = 'on'
      void flush(true)
    })
  }

  // Flush what the heartbeat cannot carry: other books and days, offline
  // time, and after sign-in the signed-out tally. One request at a time.
  const flush = async (force = false) => {
    const user = userRef.current
    if (!user || ledgerRef.current !== 'on' || sendingRef.current) return
    if (!force && Date.now() - lastFlushRef.current < FLUSH_EVERY_MS) return
    lastFlushRef.current = Date.now()
    sendingRef.current = true
    try {
      const token = await sessionToken(user)
      if (!token) return
      // Under the ledger lock: the flush on opening the cards (flushPendingNow) reads the same store.
      await withLedgerSend(async () => {
        const year = new Date().getFullYear()
        const guestSeconds = readingYearTotals(readLocalReadingYear(year, null)).seconds
        const batch = nextFlush({ userId: user, today: localDay(), currentBookId: bookRef.current, guestEarlier: guestSeconds > 0 ? { year, seconds: guestSeconds } : null })
        if (!batch) return
        const outcome = await sendFlush(token, user, batch, flushedYear => writeLocalReadingYear(emptyReadingYear(flushedYear), null))
        settle(outcome)
      })
    } finally {
      sendingRef.current = false
    }
  }

  /**
   * `leaving` (hide / pagehide) sends as soon as the Worker's gate allows,
   * instead of waiting for the five-minute mark; so does a full beat's worth
   * of pending time (time carried from an earlier beat drains this way).
   */
  const beat = async (leaving = false) => {
    const user = userRef.current
    if (!user || ledgerRef.current !== 'on' || sendingRef.current) return
    const since = Date.now() - lastBeatRef.current
    // Less a flush sent but not yet confirmed: it carries those seconds already.
    const pending = pendingForBeat(user)
    const current = pending[localDay()]?.[bookRef.current]
    const full = current ? current.read + current.listen >= BEAT_MAX_SECONDS : false
    if (since < LEDGER_BEAT_EVERY_MS && !((leaving || full) && since >= BEAT_MIN_GAP_MS)) return
    if (!beatPayload(pending, localDay(), bookRef.current, listeningRef.current)) return
    lastBeatRef.current = Date.now()
    sendingRef.current = true
    let outcome: Awaited<ReturnType<typeof sendBeat>> = 'failed'
    try {
      const token = await sessionToken(user)
      if (!token) return
      // Read again under the ledger lock: a flush on opening the cards may have sent it meanwhile.
      outcome = await withLedgerSend(async () => {
        const payload = beatPayload(pendingForBeat(user), localDay(), bookRef.current, listeningRef.current)
        if (!payload) return 'failed' as const
        const result = await trackSending(user, [payload], () => sendBeat(token, payload))
        // Sent is settled: the Worker's limits decide what of it counts.
        if (result === 'credited') subtractPending(user, [payload])
        else settle(result)
        return result
      })
    } finally {
      sendingRef.current = false
    }
    if (outcome === 'credited') void flush()
  }

  useEffect(() => {
    let live = true
    void readingTimeSwitch().then(on => {
      if (!live || ledgerRef.current !== 'unknown') return
      ledgerRef.current = on ? 'on' : 'off'
      checkedAtRef.current = Date.now()
    })
    return () => { live = false }
  }, [])

  // Signed in with the ledger on: bring the yearly tally up to date (the
  // Worker merges it once, at the account's first ledger contact), then flush.
  useEffect(() => {
    if (!userId) return
    let live = true
    void readingTimeSwitch().then(async on => {
      if (!live || !on) return
      const year = new Date().getFullYear()
      await syncReadingYear(userId, readLocalReadingYear(year, userId)).catch(() => {})
      if (live) void flush(true)
    })
    return () => { live = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const add = (entry: { seconds?: number; pages?: number; bookId?: string }) => {
    const year = new Date().getFullYear()
    writeLocalReadingYear(recordReading(readLocalReadingYear(year, userRef.current), readLabDeviceId(), entry), userRef.current)
    dirtyRef.current = true
  }

  useEffect(() => {
    if (onCover) return
    const next = { bookId, chapter, page }
    const pages = forwardPagesRead(previousRef.current, next)
    if (pages > 0) add({ pages, bookId })
    previousRef.current = next
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter, page, onCover])

  // Every turn credits the page just left; while narration plays, listening counts instead.
  const turnSeenRef = useRef<string | null>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  useEffect(() => {
    const key = `${bookId}\u0000${chapter}\u0000${page}\u0000${turn ?? ''}`
    const previous = turnSeenRef.current
    turnSeenRef.current = key
    if (previous === null || previous === key || !previous.startsWith(`${bookId}\u0000`)) return
    const turns = turnsRef.current
    if (!turns) return
    // A turn on a visible page while no session runs (a missed visibilitychange): the reader is here; start one.
    if (!turns.active) { if (document.visibilityState === 'visible' && !pausedRef.current) turns.start(Date.now()); return }
    if (listeningRef.current) { turns.restart(Date.now()); return }
    creditRef.current(turns.turn(Date.now()))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter, page, turn])

  useEffect(() => {
    // Capture the owner and book for this session. Cleanup must settle the
    // outgoing reader even though render has already updated the live refs.
    const countedBook = privateBook ? PRIVATE_BOOK_ID : ledgerBookId(bookId)
    let last = Date.now()
    let visible = document.visibilityState === 'visible'
    const turns = createReadingTurns(Date.now(), visible && !paused)
    turnsRef.current = turns
    const record = (start: number, seconds: number, kind: 'read' | 'listen') => {
      if (seconds <= 0) return
      if (ledgerRef.current === 'on' || ledgerRef.current === 'unavailable') {
        // Split at local midnight rather than assigning an entire stretch to
        // the new day. Date's calendar arithmetic also handles DST changes.
        let cursor = start
        let remaining = seconds
        while (remaining > 0) {
          const date = new Date(cursor)
          const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime()
          const part = Math.min(remaining, Math.ceil((midnight - cursor) / 1000))
          addPending(userId, localDay(date), countedBook, kind === 'listen' ? { listen: part } : { read: part })
          cursor += part * 1000
          remaining -= part
        }
      } else if (!privateBook) {
        const year = new Date().getFullYear()
        writeLocalReadingYear(recordReading(readLocalReadingYear(year, userId), readLabDeviceId(), { seconds }), userId)
        dirtyRef.current = true
      }
    }
    const credit = (reading: ReadingCredit | null) => {
      if (!reading) return
      const seconds = Math.round(reading.ms / 1000)
      record(reading.end - seconds * 1000, seconds, 'read')
    }
    creditRef.current = credit
    // Content-free diagnostics in internal sessions (?internal=1): seconds counted, visible and dropped by reason.
    const report = () => {
      if (!isInternalTraffic()) return
      try { (window as unknown as { __tinctReadingTime?: unknown }).__tinctReadingTime = turns.diagnostics() } catch { /* never throws */ }
    }
    // Listening, as before: while narration plays and the page is visible.
    const accrueListen = () => {
      const now = Date.now()
      if (!listeningRef.current) { last = now; return }
      // Narration owns this stretch: the page's reading time restarts after it.
      turns.restart(now)
      const start = Math.max(last, now - 60_000)
      const seconds = visible && !paused ? Math.max(0, Math.floor((now - start) / 1000)) : 0
      last = visible && !paused ? start + seconds * 1000 : now
      record(start, seconds, 'listen')
    }
    const endSession = (reason: 'idle' | 'paused' = 'idle') => { accrueListen(); credit(turns.end(Date.now(), reason)); report() }
    const onVisibility = () => {
      const now = document.visibilityState === 'visible'
      if (now === visible) return
      if (!now) { endSession(); visible = false; void beat(true); return }
      visible = true
      last = Date.now()
      if (!paused) turns.start(Date.now())
    }
    const leave = () => { endSession(); visible = false; void beat(true) }
    // iOS brings a page back from its cache without a visibilitychange.
    const resume = () => { visible = document.visibilityState === 'visible'; last = Date.now(); if (visible && !paused) turns.start(Date.now()) }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', leave)
    window.addEventListener('pageshow', resume)
    const timer = window.setInterval(() => {
      accrueListen()
      recheck()
      void beat()
    }, TICK_MS)
    return () => {
      endSession(paused ? 'paused' : 'idle')
      if (turnsRef.current === turns) turnsRef.current = null
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('pageshow', resume)
      window.clearInterval(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, userId, bookId, privateBook])

  useEffect(() => {
    if (!userId) return
    const sync = () => {
      if (!dirtyRef.current) return
      dirtyRef.current = false
      const year = new Date().getFullYear()
      syncReadingYear(userId, readLocalReadingYear(year, userId)).catch(() => { dirtyRef.current = true })
    }
    const timer = window.setInterval(sync, READING_YEAR_SYNC_MS)
    const onHide = () => { if (document.visibilityState === 'hidden') sync() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', sync)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', sync); sync() }
  }, [userId])
}
