export type ReaderLoadPhase =
  | 'reader_boot_start'
  | 'auth_session_start'
  | 'auth_session_resolved'
  | 'auth_session_timeout'
  | 'auth_session_error'
  | 'position_request_start'
  | 'position_request_resolved'
  | 'position_request_empty'
  | 'position_request_error'
  | 'required_text_start'
  | 'required_text_ready'
  | 'required_text_error'
  | 'fonts_start'
  | 'fonts_ready'
  | 'pagination_ready'
  | 'first_visible_passage'

export type ReaderLoadTraceEntry = {
  phase: ReaderLoadPhase
  atMs: number
  durationMs?: number
  outcome?: 'session' | 'signed_out' | 'timeout' | 'success' | 'empty' | 'error'
}

type TraceWindow = Window & { tinctLoadTrace?: () => ReaderLoadTraceEntry[] }

let enabled: boolean | null = null
let startedAt: number | null = null
let entries: ReaderLoadTraceEntry[] = []
const phaseStarts = new Map<string, number>()

function traceEnabled(): boolean {
  if (enabled !== null) return enabled
  if (typeof window === 'undefined') return false
  try {
    const query = new URLSearchParams(window.location.search)
    enabled = query.get('perf') === '1' || query.get('loadTrace') === '1'
  } catch {
    enabled = false
  }
  return enabled
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

export function startReaderLoadTrace(): void {
  if (!traceEnabled() || startedAt !== null) return
  startedAt = now()
  entries = [{ phase: 'reader_boot_start', atMs: 0 }]
  const target = window as TraceWindow
  target.tinctLoadTrace = () => entries.map(entry => ({ ...entry }))
}

export function markReaderLoadTrace(
  phase: ReaderLoadPhase,
  options: { startOf?: string; endOf?: string; outcome?: ReaderLoadTraceEntry['outcome'] } = {},
): void {
  if (!traceEnabled()) return
  if (startedAt === null) startReaderLoadTrace()
  if (startedAt === null || entries.some(entry => entry.phase === phase)) return
  const timestamp = now()
  if (options.startOf) phaseStarts.set(options.startOf, timestamp)
  const spanStart = options.endOf ? phaseStarts.get(options.endOf) : undefined
  entries.push({
    phase,
    atMs: Math.round(timestamp - startedAt),
    ...(spanStart === undefined ? {} : { durationMs: Math.round(timestamp - spanStart) }),
    ...(options.outcome ? { outcome: options.outcome } : {}),
  })
  if (phase === 'first_visible_passage') {
    // eslint-disable-next-line no-console
    console.groupCollapsed('[reader-load] first visible passage')
    // eslint-disable-next-line no-console
    console.table(entries)
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

export function readerLoadTraceForTest(): ReaderLoadTraceEntry[] {
  return entries.map(entry => ({ ...entry }))
}

export function resetReaderLoadTraceForTest(): void {
  enabled = null
  startedAt = null
  entries = []
  phaseStarts.clear()
}
