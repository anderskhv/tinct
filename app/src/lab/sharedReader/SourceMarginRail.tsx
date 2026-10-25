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
  ownsSourcePointer?: (event: PointerEvent) => boolean
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
/** Start at the page border; every segment stays in the outside margin. */
export function sourceMarginLeaderPath(sourceX:number, sourceY:number, railLeft:number, headerY:number) {
  const channel=railLeft-12, end=railLeft-6
  return `M${sourceX} ${sourceY}H${channel}V${headerY}H${end}`
}
/** A layer in the source scroller, never another scrolling panel. */
export function SourceMarginRail({ host, entries, onBlankNote, ownsSourcePointer }: SourceMarginRailProps) {
  const layer = useRef<HTMLDivElement>(null)
  const latest = useRef(entries)
  latest.current = entries
  const sourcePointer = useRef(ownsSourcePointer)
  sourcePointer.current = ownsSourcePointer
  const [layout, setLayout] = useState<{ left: number; width: number; height: number; items: Array<{ id: string; top: number; y: number; sourceX: number | null }> }>({ left: 0, width: 380, height: 0, items: [] })
  useLayoutEffect(() => {
    if (!host || !layer.current) return
    let raf = 0
    const measure = () => {
      const frame = host.getBoundingClientRect()
      const columns = [...host.querySelectorAll<HTMLElement>('.continuous-reader-window, .pdf-original__page')].map(node => node.getBoundingClientRect())
      const located = latest.current.flatMap(entry => {
        const source = entry.source()
        if (!source) return []
        const el = [...(layer.current?.querySelectorAll<HTMLElement>('section[data-card-id]') ?? [])].find(el => el.dataset.cardId === entry.id)
        // A PDF may contain sheets of different widths. Use the sheet at the
        // source's first line, rather than extending from its last word or from
        // some other, wider page. Multi-line/cross-page quotes keep their first Y.
        const containing = columns.find(box => source.top >= box.top && source.top < box.bottom && source.left >= box.left && source.left <= box.right)
        const intersecting = columns.find(box => source.bottom > box.top && source.top < box.bottom)
        const border = containing?.right ?? intersecting?.right ?? (columns.length ? Math.max(...columns.map(box => box.right)) : null)
        return [{ id: entry.id, y: source.top - frame.top + host.scrollTop, sourceX: border === null ? null : border - frame.left + host.scrollLeft, height: el?.offsetHeight || (entry.open ? 100 : 46), order: entry.order }]
      })
      const left = columns.length ? Math.max(...columns.map(box => box.right - frame.left + host.scrollLeft)) + 18 : located.length ? Math.max(...located.map(item => item.sourceX ?? 0)) + 18 : Math.max(0, host.clientWidth - 400)
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
    const covered = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      return !!element?.closest('.lab-v2-sheet-layer, [aria-modal="true"], .lab-super-menu, .lab-pbar, [role="listbox"], [role="menu"]')
        || !![...document.querySelectorAll('[aria-modal="true"], .lab-v2-sheet-layer, .lab-super-menu')].find(node => !node.closest('.source-margin-item') && !(node as HTMLElement).hidden)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229 || covered(event.target)) return
      const open = latest.current.filter(entry => entry.open)
      if (open.length) { event.preventDefault(); event.stopPropagation(); open.forEach(entry => entry.onToggle()) }
    }
    const outside = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target || covered(target) || target.closest('.source-margin-item, .source-margin-room, [data-source-card-id], [data-source-mark-id], .pdf-original__minimap, .source-minimap') || sourcePointer.current?.(event)) return
      latest.current.filter(entry => entry.open).forEach(entry => entry.onToggle())
    }
    window.addEventListener('keydown', key, true)
    window.addEventListener('pointerdown', outside, true)
    return () => { window.removeEventListener('keydown', key, true); window.removeEventListener('pointerdown', outside, true) }
  }, [host])
  if (!host) return null
  return createPortal(<div ref={layer} className="source-margin-rail" data-testid="source-margin-rail" style={{ height: layout.height }}>
    <div className="source-margin-room" aria-hidden="true" style={{ left: layout.left, width: Math.max(layout.width, host.clientWidth - layout.left), height: layout.height }} onPointerDown={event => {
      if (event.target !== event.currentTarget) return
      onBlankNote?.({ clientY: event.clientY, sourceY: event.clientY - host.getBoundingClientRect().top + host.scrollTop })
    }} />
    <svg className="source-margin-leaders" data-testid="source-margin-leaders" width="100%" height={layout.height} aria-hidden="true">
      {layout.items.map(at => { const entry = entries.find(item => item.id === at.id); if (!entry || entry.free || at.sourceX === null) return null
        const endY = at.top + 16
        return <g key={at.id} data-card-id={at.id} className={entry.open ? 'is-open' : 'is-folded'}><path d={sourceMarginLeaderPath(at.sourceX, at.y, layout.left, endY)} /></g>
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
