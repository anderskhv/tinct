import { useEffect, useRef, useState } from 'react'
import { readLabDeviceId } from './labPositionStore'
import { forwardPagesRead, readLocalReadingYear, readingYearTotals, recordReading, syncReadingYear, writeLocalReadingYear, type ReadingYearTotals } from './labReadingYear'

/** Reading time counts only while the reader was active this recently (or audio plays). */
const ACTIVE_WINDOW_MS = 3 * 60_000
const TICK_MS = 30_000
const SYNC_MS = 2 * 60_000

/**
 * Records this device's reading into the year tally: pages for each forward
 * page turn, and time only while the reader is visibly in use (a turn or
 * input within the last three minutes, or narration playing).
 */
export function useLabReadingYear(input: {
  userId: string | null
  bookId: string
  chapter: number
  page: number
  onCover: boolean
  paused: boolean
  listeningRef: { current: boolean }
}): void {
  const { userId, bookId, chapter, page, onCover, paused, listeningRef } = input
  const previousRef = useRef<{ bookId: string; chapter: number; page: number } | null>(null)
  const activeAtRef = useRef(Date.now())
  const dirtyRef = useRef(false)
  const userRef = useRef(userId)
  userRef.current = userId

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
      if (document.visibilityState === 'visible' && !paused && active) add({ seconds: Math.min(60, Math.round((now - last) / 1000)) })
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
