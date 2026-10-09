import { useEffect, useState } from 'react'
import { readingTimeStats, localDay, type LedgerRow, type ReadingTimeStats } from '../readingTime/model'
import { readLocalReadingYear, readingYearTotals } from './labReadingYear'
import { SWITCH_RECHECK_MS, fetchReadingTime, pendingSeconds, readPending, readingTimeSwitch, withPending } from './labReadingTime'

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

/**
 * The ledger rows this page last received, per account (memory only, gone
 * with the page and never another account's). Opening the sheet again, or the
 * reader remounting it, shows these with this device's newer time at once
 * while the ledger is asked again, instead of the loading dash.
 */
let lastLedger: { userId: string; rows: LedgerRow[] } | null = null

/** Tests only. */
export function resetLastLedger(): void {
  lastLedger = null
}

function ledgerState(userId: string, rows: LedgerRow[]): SheetReadingTime {
  return { mode: 'ledger', stats: readingTimeStats(withPending(rows, readPending(userId)), localDay()) }
}

export function useLabReadingTime(userId: string | null, token: string | null, open: boolean): SheetReadingTime {
  const [state, setState] = useState<SheetReadingTime>({ mode: 'off' })
  useEffect(() => {
    if (!open) return
    let live = true
    void readingTimeSwitch(undefined, { maxAgeMs: SWITCH_RECHECK_MS }).then(async on => {
      if (!live) return
      if (!on) { setState({ mode: 'off' }); return }
      if (!userId) { setState({ mode: 'device', seconds: deviceReadingSeconds(null) }); return }
      const known = lastLedger?.userId === userId ? lastLedger.rows : null
      setState(previous => known ? ledgerState(userId, known) : previous.mode === 'ledger' ? previous : { mode: 'loading' })
      const summary = token ? await fetchReadingTime(token) : null
      if (!live) return
      if (summary) lastLedger = { userId, rows: summary.rows }
      const rows = summary?.rows ?? (lastLedger?.userId === userId ? lastLedger.rows : null)
      setState(rows
        ? ledgerState(userId, rows)
        : { mode: 'fallback', pendingSeconds: pendingSeconds(readPending(userId)) })
    })
    return () => { live = false }
  }, [open, userId, token])
  return state
}
