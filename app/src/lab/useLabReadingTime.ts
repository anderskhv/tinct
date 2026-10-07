import { useEffect, useState } from 'react'
import { readingTimeStats, localDay, type ReadingTimeStats } from '../readingTime/model'
import { readLocalReadingYear, readingYearTotals } from './labReadingYear'
import { fetchReadingTime, pendingSeconds, readPending, readingTimeSwitch, withPending } from './labReadingTime'

/**
 * What the account sheet shows for reading time.
 * - `off`: the switch is off (or not known yet): today's "This year" block.
 * - `ledger`: signed in, the ledger answered: Last 7 days and the facts line.
 * - `device`: signed out with the switch on: hours on this device.
 * - `fallback`: signed in, switch on, ledger unavailable: today's block, with
 *   the time waiting on this device added to its hours.
 */
export type SheetReadingTime =
  | { mode: 'off' }
  | { mode: 'ledger'; stats: ReadingTimeStats }
  | { mode: 'device'; seconds: number }
  | { mode: 'fallback'; pendingSeconds: number }
  /** Signed in, switch on, the ledger not answered yet: the block's frame without figures. */
  | { mode: 'loading' }

export function deviceReadingSeconds(owner: string | null, year = new Date().getFullYear()): number {
  return readingYearTotals(readLocalReadingYear(year, owner)).seconds + pendingSeconds(readPending(owner))
}

export function useLabReadingTime(userId: string | null, token: string | null, open: boolean): SheetReadingTime {
  const [state, setState] = useState<SheetReadingTime>({ mode: 'off' })
  useEffect(() => {
    if (!open) return
    let live = true
    void readingTimeSwitch().then(async on => {
      if (!live) return
      if (!on) { setState({ mode: 'off' }); return }
      if (!userId) { setState({ mode: 'device', seconds: deviceReadingSeconds(null) }); return }
      setState(previous => previous.mode === 'ledger' ? previous : { mode: 'loading' })
      const summary = token ? await fetchReadingTime(token) : null
      if (!live) return
      setState(summary
        ? { mode: 'ledger', stats: readingTimeStats(withPending(summary.rows, readPending(userId)), localDay()) }
        : { mode: 'fallback', pendingSeconds: pendingSeconds(readPending(userId)) })
    })
    return () => { live = false }
  }, [open, userId, token])
  return state
}
