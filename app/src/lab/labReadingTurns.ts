/**
 * Reading time by page turns (Anders, 10 Nov 2026): time spent reading with pages turning. The one thing not counted
 * is a page left open while pages are not turning.
 *
 * - A turn (forward or back, a chapter jump, a PDF page, a new paragraph scrolled into view in the Margin reader)
 *   credits the visible time since the previous turn to the page just left, at most PAGE_CAP_MS.
 * - The last page of a session (the page hidden, closed, or another book opened with no turn after it) earns the
 *   session's median page time, at most what that page was visibly open and PAGE_CAP_MS; LAST_PAGE_FEW_TURNS_MS when
 *   the session had fewer than MEDIAN_MIN_TURNS turns.
 * - Only visible time is reading: hidden or locked time is never credited.
 *
 * Everything is computed from timestamps given to it, so throttled timers lose nothing. Pure: no DOM, no clock.
 */
export const PAGE_CAP_MS = 15 * 60_000
export const LAST_PAGE_FEW_TURNS_MS = 60_000
export const MEDIAN_MIN_TURNS = 3

/** Content-free diagnostics for a session, in seconds (internal sessions only). */
export interface ReadingTurnsDiagnostics {
  counted: number
  visible: number
  dropped: { idle: number; cap: number; paused: number; tickGap: number }
  turns: number
}

export interface ReadingCredit {
  /** Credited reading, ending at `end` (epoch ms). */
  ms: number
  end: number
}

export interface ReadingTurns {
  /** A page turn at `now`: the page just left is credited. */
  turn(now: number): ReadingCredit | null
  /** The session ends at `now` (hidden, closed, another book): the last page earns the session's typical page time. */
  end(now: number, reason?: 'idle' | 'paused'): ReadingCredit | null
  /** Visible again at `now`: a new session starts on the page on screen. */
  start(now: number): void
  /** Throw away the page's time so far without crediting it (narration took over: listening counts instead). */
  restart(now: number): void
  readonly active: boolean
  diagnostics(): ReadingTurnsDiagnostics
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function createReadingTurns(now: number, visible = true): ReadingTurns {
  /** When the page on screen became visible (null: hidden, no session). */
  let pageSince: number | null = visible ? now : null
  let pageTimes: number[] = []
  const diag: ReadingTurnsDiagnostics = { counted: 0, visible: 0, dropped: { idle: 0, cap: 0, paused: 0, tickGap: 0 }, turns: 0 }
  const seconds = (ms: number) => ms / 1000
  return {
    get active() { return pageSince !== null },
    turn(at) {
      if (pageSince === null) return null
      const open = Math.max(0, at - pageSince)
      const ms = Math.min(open, PAGE_CAP_MS)
      pageSince = at
      pageTimes.push(ms)
      diag.turns += 1
      diag.visible += seconds(open)
      diag.counted += seconds(ms)
      diag.dropped.cap += seconds(open - ms)
      return ms > 0 ? { ms, end: at } : null
    },
    end(at, reason = 'idle') {
      if (pageSince === null) return null
      const open = Math.max(0, at - pageSince)
      const typical = pageTimes.length >= MEDIAN_MIN_TURNS ? median(pageTimes) : LAST_PAGE_FEW_TURNS_MS
      const ms = Math.min(open, typical, PAGE_CAP_MS)
      pageSince = null
      pageTimes = []
      diag.visible += seconds(open)
      diag.counted += seconds(ms)
      diag.dropped[reason] += seconds(open - ms)
      return ms > 0 ? { ms, end: at } : null
    },
    start(at) { if (pageSince === null) pageSince = at },
    restart(at) { if (pageSince !== null) pageSince = at },
    diagnostics: () => ({ ...diag, dropped: { ...diag.dropped } }),
  }
}
