import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PhoneIcon } from '../marginPhone/LabPhoneCard'
import type { CardBox } from './desktopCardPlace'
import './sourceMarginRail.css'

export interface SourceMarginEntry {
  id: string
  label: string
  source: () => CardBox | null
  order: number
  open: boolean
  content: ReactNode
  preview?: string
  sourceText?: string
  onToggle: () => void
  onDelete?: () => void
  /** Notes without a passage have no source leader. */
  free?: boolean
}
export interface SourceMarginRailProps {
  host: HTMLElement | null
  entries: SourceMarginEntry[]
  onBlankNote?: (position: { clientY: number; sourceY: number }) => void
}
export function sourceMarginLayout<T extends { id: string; y: number; height: number; order: number }>(items: T[], gap = 18) {
  let floor = 0
  return [...items].sort((a, b) => a.order - b.order || a.y - b.y || a.id.localeCompare(b.id)).map(item => {
    const top = Math.max(item.y, floor)
    floor = top + item.height + gap
    return { ...item, top }
  })
}
/** Leave source ink horizontally; change height only beyond the reading column. */
export function sourceMarginLeaderPath(sourceX:number, sourceY:number, railLeft:number, headerY:number) {
  const channel=railLeft-12, end=railLeft-6
  return `M${sourceX} ${sourceY}H${channel}V${headerY}H${end}`
}
/** A layer in the source scroller, never another scrolling panel. */
export function SourceMarginRail({ host, entries, onBlankNote }: SourceMarginRailProps) {
  const layer = useRef<HTMLDivElement>(null)
  const latest = useRef(entries)
  latest.current = entries
  const [layout, setLayout] = useState<{ left: number; width: number; height: number; items: Array<{ id: string; top: number; y: number; sourceX: number }> }>({ left: 0, width: 380, height: 0, items: [] })
  useLayoutEffect(() => {
    if (!host || !layer.current) return
    let raf = 0
    const measure = () => {
      const frame = host.getBoundingClientRect()
      const located = latest.current.flatMap(entry => {
        const source = entry.source()
        if (!source) return []
        const el = [...(layer.current?.querySelectorAll<HTMLElement>('section[data-card-id]') ?? [])].find(el => el.dataset.cardId === entry.id)
        return [{ id: entry.id, y: source.top - frame.top + host.scrollTop, sourceX: source.right - frame.left + host.scrollLeft, height: el?.offsetHeight || (entry.open ? 100 : 46), order: entry.order }]
      })
      const columns = [...host.querySelectorAll<HTMLElement>('.continuous-reader-window, .pdf-original__page')].map(node => node.getBoundingClientRect().right - frame.left + host.scrollLeft)
      const left = columns.length ? Math.max(...columns) + 18 : located.length ? Math.max(...located.map(item => item.sourceX)) + 18 : Math.max(0, host.clientWidth - 400)
      const width = Math.max(1, Math.min(380, host.clientWidth - left - 18))
      const ordered = sourceMarginLayout(located)
      const next = { left, width, height: Math.max(host.clientHeight, ...ordered.map(item => item.top + item.height + 32)), items: ordered.map(item => ({ id: item.id, top: item.top, y: item.y, sourceX: item.sourceX })) }
      setLayout(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure() }) }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(host)
    const observeGeometry = () => {
      for (const el of host.querySelectorAll<HTMLElement>('.continuous-reader-window, .pdf-original__page, section[data-card-id]')) observer?.observe(el)
    }
    observeGeometry()
    const mutation = typeof MutationObserver === 'undefined' ? null : new MutationObserver(() => { observeGeometry(); schedule() })
    mutation?.observe(host, { childList: true, subtree: true })
    measure(); schedule()
    host.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(raf); observer?.disconnect(); mutation?.disconnect(); host.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [host, entries.map(entry => `${entry.id}:${entry.open}`).join('|')])
  useEffect(() => {
    if (!host) return
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      const open = latest.current.find(entry => entry.open)
      if (open) { event.preventDefault(); open.onToggle() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [host])
  if (!host) return null
  return createPortal(<div ref={layer} className="source-margin-rail" data-testid="source-margin-rail" style={{ height: layout.height }}>
    <div className="source-margin-room" aria-hidden="true" style={{ left: layout.left, width: Math.max(layout.width, host.clientWidth - layout.left), height: layout.height }} onPointerDown={event => {
      if (event.target !== event.currentTarget) return
      onBlankNote?.({ clientY: event.clientY, sourceY: event.clientY - host.getBoundingClientRect().top + host.scrollTop })
    }} />
    <svg className="source-margin-leaders" data-testid="source-margin-leaders" width="100%" height={layout.height} aria-hidden="true">
      {layout.items.map(at => { const entry = entries.find(item => item.id === at.id); if (!entry || entry.free) return null
        const endY = at.top + 16
        return <g key={at.id} data-card-id={at.id} className={entry.open ? 'is-open' : 'is-folded'}><circle cx={at.sourceX} cy={at.y} r={1.5} /><path d={sourceMarginLeaderPath(at.sourceX, at.y, layout.left, endY)} /></g>
      })}
    </svg>
    {entries.map(entry => { const at = layout.items.find(item => item.id === entry.id)
      return <section key={entry.id} data-testid="source-margin-item" data-card-id={entry.id} data-source-order={entry.order} data-open={entry.open} className={`source-margin-item ${entry.open ? 'is-open' : 'is-folded'}`} aria-describedby={entry.sourceText ? `source-about-${entry.id}` : undefined} style={{ left: layout.left, width: layout.width, top: at?.top ?? 0, visibility: at ? undefined : 'hidden' }}>
        <header className="source-margin-head"><button type="button" data-testid="source-margin-open" className="source-margin-label" onClick={entry.onToggle} aria-expanded={entry.open}>{entry.label}</button>
          {entry.open && <button type="button" data-testid="source-margin-minimise" aria-label="Minimise" onClick={entry.onToggle}>−</button>}
          {entry.onDelete && <button type="button" aria-label={`Delete ${entry.label}`} onClick={entry.onDelete}><PhoneIcon name="trash" /></button>}
        </header>
        {entry.sourceText && <span className="lab-visually-hidden" id={`source-about-${entry.id}`}>{entry.sourceText}</span>}
        {!entry.open && <button type="button" className="source-margin-preview" onClick={entry.onToggle}>{entry.preview?.slice(0, 160) || 'Open this card'}</button>}
        <div className="source-margin-content" hidden={!entry.open}>{entry.content}</div>
      </section>
    })}
  </div>, host)
}
