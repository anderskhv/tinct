import { useEffect, useRef, useState } from 'react'
import { readLabDeviceId } from './labPositionStore'
import { emptyReadingYear, forwardPagesRead, readLocalReadingYear, readingYearTotals, recordReading, syncReadingYear, writeLocalReadingYear, type ReadingYearTotals } from './labReadingYear'
import { addPending, beatPayload, nextFlush, readPending, readingTimeSwitch, sendBeat, sendFlush, subtractPending, type LedgerStatus } from './labReadingTime'
import { PRIVATE_BOOK_ID, ledgerBookId, localDay } from '../readingTime/model'
import { supabase } from '../services/supabase'

/** Reading time counts only while the reader was active this recently (or audio plays). */
const ACTIVE_WINDOW_MS = 3 * 60_000
const TICK_MS = 30_000
const SYNC_MS = 2 * 60_000
/** Heartbeats: about once a minute (the Worker accepts one per ~50 s). */
const BEAT_EVERY_MS = 58_000
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
 * a heartbeat about once a minute, and a flush for what a heartbeat cannot
 * carry. Off (the default, or until the switch is known) nothing changes.
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
      const year = new Date().getFullYear()
      const guestSeconds = readingYearTotals(readLocalReadingYear(year, null)).seconds
      const batch = nextFlush({ userId: user, today: localDay(), currentBookId: bookRef.current, guestEarlier: guestSeconds > 0 ? { year, seconds: guestSeconds } : null })
      if (!batch) return
      const outcome = await sendFlush(token, user, batch, flushedYear => writeLocalReadingYear(emptyReadingYear(flushedYear), null))
      if (outcome === 'unavailable') ledgerRef.current = 'unavailable'
      else if (outcome === 'off') ledgerRef.current = 'off'
    } finally {
      sendingRef.current = false
    }
  }

  const beat = async () => {
    const user = userRef.current
    if (!user || ledgerRef.current !== 'on' || sendingRef.current) return
    if (Date.now() - lastBeatRef.current < BEAT_EVERY_MS) return
    const payload = beatPayload(readPending(user), localDay(), bookRef.current, listeningRef.current)
    if (!payload) return
    lastBeatRef.current = Date.now()
    sendingRef.current = true
    let outcome: Awaited<ReturnType<typeof sendBeat>> = 'failed'
    try {
      const token = await sessionToken(user)
      if (!token) return
      outcome = await sendBeat(token, payload)
      // Sent is settled: the Worker's limits decide what of it counts.
      if (outcome === 'credited') subtractPending(user, [payload])
      else if (outcome === 'unavailable') ledgerRef.current = 'unavailable'
      else if (outcome === 'off') ledgerRef.current = 'off'
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
    const mark = () => { activeAtRef.current = Date.now() }
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    events.forEach(name => window.addEventListener(name, mark, { passive: true }))
    let last = Date.now()
    const timer = window.setInterval(() => {
      const now = Date.now()
      const active = now - activeAtRef.current < ACTIVE_WINDOW_MS || listeningRef.current
      if (document.visibilityState === 'visible' && !paused && active) {
        const seconds = Math.min(60, Math.round((now - last) / 1000))
        if (ledgerRef.current === 'on' || ledgerRef.current === 'unavailable') {
          // Narration playing counts as listening, otherwise reading.
          addPending(userRef.current, localDay(), bookRef.current, listeningRef.current ? { listen: seconds } : { read: seconds })
          void beat()
        } else if (!privateRef.current) add({ seconds })
      }
      last = now
    }, TICK_MS)
    return () => { events.forEach(name => window.removeEventListener(name, mark)); window.clearInterval(timer) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    if (!userId) return
    const sync = () => {
      if (!dirtyRef.current) return
      dirtyRef.current = false
      const year = new Date().getFullYear()
      syncReadingYear(userId, readLocalReadingYear(year, userId)).catch(() => { dirtyRef.current = true })
    }
    const timer = window.setInterval(sync, SYNC_MS)
    const onHide = () => { if (document.visibilityState === 'hidden') sync() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', sync)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', sync); sync() }
  }, [userId])
}

/** This year's totals for the account sheet: the device copy at once, then the account's (all devices) when signed in. */
export function useReadingYearTotals(userId: string | null, open: boolean): ReadingYearTotals {
  const year = new Date().getFullYear()
  const [totals, setTotals] = useState(() => readingYearTotals(readLocalReadingYear(year, userId)))
  useEffect(() => {
    if (!open) return
    let live = true
    setTotals(readingYearTotals(readLocalReadingYear(year, userId)))
    if (userId) syncReadingYear(userId, readLocalReadingYear(year, userId)).then(state => { if (live) setTotals(readingYearTotals(state)) }).catch(() => {})
    return () => { live = false }
  }, [open, userId, year])
  return totals
}
