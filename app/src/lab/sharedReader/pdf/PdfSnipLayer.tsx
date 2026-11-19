import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { snipCaption, snipRegion, type SnipRegion } from './pdfOriginalSnip'

export type PdfSnipPick = { page: number; region: SnipRegion; caption: string }

/**
 * Explain a figure: a crosshair layer over the PDF pages. Dragging a box on one page picks it; Escape, Cancel or
 * opening anything else ends it. The wheel still scrolls the pages under it, so a figure can be found first.
 */
export function PdfSnipLayer({ host, onPick, onCancel }: { host: HTMLElement | null; onPick: (pick: PdfSnipPick) => void; onCancel: () => void }) {
  const layer = useRef<HTMLDivElement>(null)
  const start = useRef<{ x: number; y: number; sheet: HTMLElement; pointer: number } | null>(null)
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [frame, setFrame] = useState<CSSProperties>({})
  const cancel = useRef(onCancel); cancel.current = onCancel
  useEffect(() => {
    const place = () => { const r = host?.getBoundingClientRect(); if (r) setFrame({ left: r.left, top: r.top, width: r.width, height: r.height }) }
    place()
    window.addEventListener('resize', place)
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); cancel.current() } }
    window.addEventListener('keydown', key, true)
    window.getSelection()?.removeAllRanges()
    layer.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    return () => { window.removeEventListener('resize', place); window.removeEventListener('keydown', key, true) }
  }, [host])
  const sheetAt = (x: number, y: number) => [...(host?.querySelectorAll<HTMLElement>('.pdf-original__page') ?? [])].find(sheet => {
    const r = sheet.getBoundingClientRect()
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  })
  const clamp = (sheet: HTMLElement, x: number, y: number) => {
    const r = sheet.getBoundingClientRect()
    return { x: Math.max(r.left, Math.min(r.right, x)), y: Math.max(r.top, Math.min(r.bottom, y)) }
  }
  return <div ref={layer} className="pdf-original-snip" role="dialog" aria-label="Explain a figure" data-testid="pdf-snip-layer" style={frame}
    onWheel={event => { if (host) host.scrollTop += event.deltaY }}
    onPointerDown={event => {
      if ((event.target as Element).closest('button')) return
      const sheet = sheetAt(event.clientX, event.clientY)
      if (!sheet) return
      event.preventDefault()
      layer.current?.setPointerCapture?.(event.pointerId)
      start.current = { x: event.clientX, y: event.clientY, sheet, pointer: event.pointerId }
      setBox({ left: event.clientX, top: event.clientY, width: 0, height: 0 })
    }}
    onPointerMove={event => {
      const from = start.current
      if (!from || from.pointer !== event.pointerId) return
      const to = clamp(from.sheet, event.clientX, event.clientY)
      setBox({ left: Math.min(from.x, to.x), top: Math.min(from.y, to.y), width: Math.abs(to.x - from.x), height: Math.abs(to.y - from.y) })
    }}
    onPointerUp={event => {
      const from = start.current
      if (!from || from.pointer !== event.pointerId) return
      start.current = null
      const to = clamp(from.sheet, event.clientX, event.clientY), page = from.sheet.getBoundingClientRect()
      const region = snipRegion({ left: from.x, top: from.y, right: to.x, bottom: to.y }, page)
      if (!region) { setBox(null); return }
      const lines = [...from.sheet.querySelectorAll<HTMLElement>('.pdf-original__text span')].map(span => {
        const r = span.getBoundingClientRect()
        return { x: (r.left - page.left) / page.width, y: (r.top - page.top) / page.height, w: r.width / page.width, h: r.height / page.height, text: span.textContent || '' }
      }).filter(line => line.text.trim())
      onPick({ page: Number(from.sheet.dataset.page), region, caption: snipCaption(lines, region) })
    }}
    onPointerCancel={() => { start.current = null; setBox(null) }}>
    <p className="pdf-original-snip__hint">Drag a box around a figure or table<button type="button" onClick={onCancel}>Cancel</button></p>
    {box && <div className="pdf-original-snip__box" data-testid="pdf-snip-box" style={{ left: box.left - (Number(frame.left) || 0), top: box.top - (Number(frame.top) || 0), width: box.width, height: box.height }} />}
  </div>
}
