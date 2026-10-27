import { useEffect, useRef } from 'react'
import { readLabDeviceId } from './labPositionStore'
import { emptyReadingYear, forwardPagesRead, readLocalReadingYear, readingYearTotals, recordReading, syncReadingYear, writeLocalReadingYear } from './labReadingYear'
import { SWITCH_RECHECK_MS, addPending, beatPayload, nextFlush, pendingForBeat, readingTimeSwitch, sendBeat, sendFlush, subtractPending, trackSending, withLedgerSend, type LedgerStatus } from './labReadingTime'
import { BEAT_MAX_SECONDS, BEAT_MIN_GAP_MS, PRIVATE_BOOK_ID, ledgerBookId, localDay } from '../readingTime/model'
import { supabase } from '../services/supabase'

/** Reading time counts only while the reader was active this recently (or audio plays). */
const ACTIVE_WINDOW_MS = 3 * 60_000
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
 * page turn, and time only while the reader is visibly in use (a turn or
 * input within the last three minutes, or narration playing).
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
}): void {
  const { userId, bookId, chapter, page, onCover, paused, listeningRef, privateBook = false } = input
  const previousRef = useRef<{ bookId: string; chapter: number; page: number } | null>(null)
  const activeAtRef = useRef(Date.now())
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
    if (pages > 0) {
      activeAtRef.current = Date.now()
      add({ pages, bookId })
    }
    previousRef.current = next
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter, page, onCover])

  useEffect(() => {
    // Capture the owner and book for this interval. Cleanup must settle the
    // outgoing reader even though render has already updated the live refs.
    const countedBook = privateBook ? PRIVATE_BOOK_ID : ledgerBookId(bookId)
    let last = Date.now()
    let visible = document.visibilityState === 'visible'
    const accrue = () => {
      const now = Date.now()
      const end = listeningRef.current ? now : Math.min(now, activeAtRef.current + ACTIVE_WINDOW_MS)
      const start = Math.max(last, now - 60_000)
      const seconds = visible && !paused ? Math.max(0, Math.floor((end - start) / 1000)) : 0
      last = visible && !paused && end === now ? start + seconds * 1000 : now
      if (!seconds) return
      if (ledgerRef.current === 'on' || ledgerRef.current === 'unavailable') {
        // Split at local midnight rather than assigning an entire tick to
        // the new day. Date's calendar arithmetic also handles DST changes.
        let cursor = start
        let remaining = seconds
        while (remaining > 0) {
          const date = new Date(cursor)
          const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime()
          const part = Math.min(remaining, Math.ceil((midnight - cursor) / 1000))
          addPending(userId, localDay(date), countedBook, listeningRef.current ? { listen: part } : { read: part })
          cursor += part * 1000
          remaining -= part
        }
      } else if (!privateBook) {
        const year = new Date().getFullYear()
        writeLocalReadingYear(recordReading(readLocalReadingYear(year, userId), readLabDeviceId(), { seconds }), userId)
        dirtyRef.current = true
      }
    }
    const mark = () => {
      accrue()
      visible = document.visibilityState === 'visible'
      activeAtRef.current = Date.now()
    }
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    events.forEach(name => window.addEventListener(name, mark, { passive: true }))
    const onVisibility = () => {
      accrue()
      visible = document.visibilityState === 'visible'
      last = Date.now()
      if (!visible) void beat(true)
    }
    const leave = () => { accrue(); visible = false; void beat(true) }
    const resume = () => { last = Date.now(); visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', leave)
    window.addEventListener('pageshow', resume)
    const timer = window.setInterval(() => {
      accrue()
      recheck()
      void beat()
    }, TICK_MS)
    return () => {
      accrue()
      events.forEach(name => window.removeEventListener(name, mark))
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
