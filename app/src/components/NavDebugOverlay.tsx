import { useEffect, useState } from 'react'

// On-screen tail of window.__tinctNavDebug for diagnosing reader page/position
// fights on mobile (where there's no easy console). Enable with ?debug=1 in the
// URL. Renders nothing otherwise, so it never affects normal users.
export function NavDebugOverlay() {
  const [enabled] = useState(() => {
    try {
      return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'
    } catch {
      return false
    }
  })
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    if (!enabled) return
    const tick = () => {
      const w = window as Window & { __tinctNavDebug?: Array<Record<string, unknown>> }
      const entries = (w.__tinctNavDebug || []).slice(-18)
      setLines(entries.map(e => {
        const at = typeof e.at === 'number' ? String(e.at).slice(-6) : ''
        if (e.kind === 'reader.setPage') return `${at} page ${String(e.source)} →${e.target}`
        if (e.kind === 'reader.layout') return `${at} layout ${String(e.note)} ipRef=${String(e.initialPageRef)}`
        return `${at} ${String(e.kind)}`
      }))
    }
    tick()
    const id = setInterval(tick, 400)
    return () => clearInterval(id)
  }, [enabled])

  if (!enabled) return null
  return (
    <div
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, maxHeight: '42vh', overflowY: 'auto',
        background: 'rgba(0,0,0,0.85)', color: '#8f8', font: '10px/1.35 monospace',
        padding: '6px 8px', zIndex: 2147483647, whiteSpace: 'pre-wrap', pointerEvents: 'none',
      }}
    >
      {lines.length ? lines.join('\n') : 'nav debug: no entries yet — switch to Compare'}
    </div>
  )
}
