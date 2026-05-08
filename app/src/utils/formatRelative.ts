/**
 * Smart hybrid relative date format.
 * < 1m       → "just now"
 * < 1h       → "12m ago"
 * < 24h      → "5h ago"
 * < 48h      → "yesterday"
 * < 7d       → "Tuesday"
 * < 1y       → "Apr 12"
 * else       → "Apr 12, 2025"
 */
export function formatRelative(ts: number): string {
  const now = Date.now()
  const diff = Math.max(0, now - ts)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const year = 365 * day

  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 2 * day) return 'yesterday'

  const date = new Date(ts)
  if (diff < week) return date.toLocaleDateString(undefined, { weekday: 'long' })
  if (diff < year) return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Full timestamp for hover tooltip — "May 8, 2026 at 09:53" */
export function formatAbsolute(ts: number): string {
  const d = new Date(ts)
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${date} at ${time}`
}
