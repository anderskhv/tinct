import { useEffect, useRef, type CSSProperties } from 'react'
import { consumeDismissGesture } from '../utils/consumeDismissGesture'
import type { PlacedFootnote } from './labFootnotes'

export interface OpenFootnote {
  note: PlacedFootnote
  /** Where the marker sits, in viewport pixels. */
  x: number
  y: number
  showBelow: boolean
}

/** The footnote a marker opened, in the surface the selection popup uses. */
export function LabFootnote({ open, onClose }: { open: OpenFootnote; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (ref.current?.contains(event.target as Node)) return
      // The first outside gesture only closes: it must not also act on the page.
      consumeDismissGesture(event)
      closeRef.current()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', onKey, true) }
  }, [])
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [open.note.id])
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-label={String(open.note.number)}
      data-testid="lab-footnote"
      className={`selection-popup is-compact is-lab lab-footnote${open.showBelow ? ' selection-popup-below' : ''}`}
      style={{ left: open.x, top: open.y, position: 'fixed' } as CSSProperties}
      onClick={event => event.stopPropagation()}
      onMouseUp={event => event.stopPropagation()}
      onTouchEnd={event => event.stopPropagation()}
    >
      <div className="popup-character lab-footnote-body">
        <p><sup className="lab-footnote-number">{open.note.number}</sup> {open.note.text}</p>
      </div>
    </div>
  )
}
