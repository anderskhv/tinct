/**
 * Lightweight performance instrumentation, gated on `?perf=1`.
 *
 * Used to diagnose book-switch latency (network → parse → set state →
 * first paint → position restored). All marks/measures are no-ops unless
 * the page was loaded with `?perf=1` in the URL. Zero overhead for
 * normal users.
 *
 * Usage:
 *   import { perfMark, perfMeasure, perfStartSwitch } from '../utils/perf'
 *   perfStartSwitch(bookId)               // resets the run
 *   perfMark('book-switch-start')
 *   perfMark('fetch-start')
 *   perfMark('fetch-end')
 *   perfMeasure('fetch', 'fetch-start', 'fetch-end')
 *
 * Once `position-restored` fires, the helper logs a console.table summary
 * of every measure for the run.
 */

let perfEnabled: boolean | null = null

function isPerfEnabled(): boolean {
  if (perfEnabled !== null) return perfEnabled
  if (typeof window === 'undefined') {
    perfEnabled = false
    return false
  }
  try {
    perfEnabled = new URLSearchParams(window.location.search).get('perf') === '1'
  } catch {
    perfEnabled = false
  }
  return perfEnabled
}

/** Marks recorded for the in-flight book switch (cleared on perfStartSwitch). */
const liveMarks = new Set<string>()
let activeBookId: string | null = null

function uniqueName(name: string): string {
  // Marks and measures need unique names per run so a second book switch
  // doesn't get tangled with the first. Append the active book id (set
  // by perfStartSwitch) to keep things readable.
  return activeBookId ? `${name}::${activeBookId}` : name
}

export function perfStartSwitch(bookId: string): void {
  if (!isPerfEnabled()) return
  // Drop any leftover marks from a previous run so the next summary is
  // clean. The old marks remain in the buffer (so devs can inspect them
  // via performance.getEntries()), but our active set is reset.
  liveMarks.clear()
  activeBookId = bookId
  perfMark('book-switch-start')
}

export function perfMark(name: string): void {
  if (!isPerfEnabled()) return
  try {
    const n = uniqueName(name)
    performance.mark(n)
    liveMarks.add(name)
  } catch { /* ignore */ }
}

export function perfMeasure(label: string, startMark: string, endMark: string): void {
  if (!isPerfEnabled()) return
  if (!liveMarks.has(startMark) || !liveMarks.has(endMark)) return
  try {
    performance.measure(uniqueName(label), uniqueName(startMark), uniqueName(endMark))
  } catch { /* ignore — mark missing or out of order */ }
}

/**
 * Log a console.table of every measure for the active run, then reset.
 * Idempotent: only logs once per run.
 */
let summaryLogged = false
export function perfLogSummary(): void {
  if (!isPerfEnabled()) return
  if (summaryLogged) return
  if (!activeBookId) return
  summaryLogged = true
  // Defer to end of the current task so the last few marks (set just
  // before this call) are flushed.
  queueMicrotask(() => {
    try {
      const suffix = `::${activeBookId}`
      const measures = performance.getEntriesByType('measure')
        .filter(m => m.name.endsWith(suffix))
        .map(m => ({
          stage: m.name.replace(suffix, ''),
          startMs: Math.round(m.startTime),
          durationMs: Math.round(m.duration),
        }))
        .sort((a, b) => a.startMs - b.startMs)
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[perf] book-switch ${activeBookId}`)
      // eslint-disable-next-line no-console
      console.table(measures)
      // eslint-disable-next-line no-console
      console.groupEnd()
    } catch { /* ignore */ }
    // Allow the next switch to log again.
    summaryLogged = false
    liveMarks.clear()
    activeBookId = null
  })
}

/** Hint for the dev console: type `tinctPerf()` to see what's available. */
if (typeof window !== 'undefined') {
  const w = window as Window & { tinctPerf?: () => unknown }
  if (!w.tinctPerf) {
    w.tinctPerf = () => ({
      enabled: isPerfEnabled(),
      activeBookId,
      measures: typeof performance !== 'undefined'
        ? performance.getEntriesByType('measure').map(m => ({ name: m.name, startMs: Math.round(m.startTime), durationMs: Math.round(m.duration) }))
        : [],
    })
  }
}
