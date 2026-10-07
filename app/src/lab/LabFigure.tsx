import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { acquireFigureUrl, figureAspect, figureLabel, figurePlacement, releaseFigureUrl, type LabFigure } from './labFigures'
import { useReaderWindow } from './useReaderWindow'
import './labCatchUp.css'

/** A figure's image, its URL held only while it is drawn (labFigures.ts). */
function FigureImage({ figure, className }: { figure: LabFigure; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const next = acquireFigureUrl(figure.src)
    setUrl(next)
    return () => { if (next) releaseFigureUrl(figure.src) }
  }, [figure.src])
  return url
    ? <img className={className} src={url} alt={figure.alt || figure.caption || ''} decoding="async" draggable={false} />
    : null
}

/** A figure's small square picture (the Figures tab, a strip). */
export function LabFigureThumb({ figure }: { figure: LabFigure }) {
  return <span className="lab-figure-thumb"><FigureImage figure={figure} /></span>
}

/**
 * A figure on the page: inline (full column width, caption beneath) or a
 * strip (thumbnail, "FIGURE N ↗", caption), as labFigures decides for this
 * layout. The box sizes are the measuring copy's exactly (figureElement).
 * It is a button: a tap opens the figure card, never a selection or a page turn.
 */
export function LabFigureView({ figure, onOpen }: { figure: LabFigure; onOpen?: (figure: LabFigure) => void }) {
  const place = figurePlacement(figure)
  const open = onOpen ? () => onOpen(figure) : undefined
  const caption = figure.caption ? <span className="lab-figure-caption">{figure.caption}</span> : null
  if (place.mode === 'strip') {
    return (
      <button type="button" className="lab-figure is-strip" data-figure-id={figure.id} data-testid="lab-figure" onClick={open}
        aria-label={figure.caption ? `Figure ${figure.number}: ${figure.caption}` : `Figure ${figure.number}`}>
        <span className="lab-figure-thumb"><FigureImage figure={figure} /></span>
        <span className="lab-figure-strip-text">
          <span className="lab-figure-label">{figureLabel(figure)}</span>
          {caption}
        </span>
      </button>
    )
  }
  return (
    <button type="button" className="lab-figure is-inline" data-figure-id={figure.id} data-testid="lab-figure" onClick={open}
      aria-label={figure.caption ? `Figure ${figure.number}: ${figure.caption}` : `Figure ${figure.number}`}>
      <span className="lab-figure-frame" style={place.width != null && place.height != null ? { width: place.width, height: place.height } : { aspectRatio: figureAspect(figure) }}>
        <FigureImage figure={figure} />
      </span>
      {caption}
    </button>
  )
}

const MAX_ZOOM = 5

/**
 * The figure card: the image large (pinch or double-tap to zoom, drag when
 * zoomed), its caption, and Explain / Chat, in the Catch me up sheet. An
 * overlay only: opening and closing it never moves the reader.
 */
export function LabFigureCard({ figure, onClose, onExplain, onAsk }: {
  figure: LabFigure
  onClose: () => void
  onExplain?: (figure: LabFigure) => void
  onAsk?: (figure: LabFigure) => void
}) {
  const windowRef = useReaderWindow<HTMLElement>('figure', true)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ distance: number; scale: number } | null>(null)
  const lastTap = useRef(0)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  useEffect(() => { setView({ scale: 1, x: 0, y: 0 }) }, [figure.id])

  const spread = () => {
    const [a, b] = [...pointers.current.values()]
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* jsdom */ }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) pinch.current = { distance: spread(), scale: view.scale }
    if (pointers.current.size === 1) {
      const now = event.timeStamp
      if (now - lastTap.current < 300) setView(current => current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 })
      lastTap.current = now
    }
  }
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2 && pinch.current && pinch.current.distance > 0) {
      const scale = Math.min(MAX_ZOOM, Math.max(1, pinch.current.scale * spread() / pinch.current.distance))
      setView(current => scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...current, scale })
    } else if (pointers.current.size === 1) {
      setView(current => current.scale > 1 ? { ...current, x: current.x + event.clientX - previous.x, y: current.y + event.clientY - previous.y } : current)
    }
  }
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  return (
    <div className="lab-v2-sheet-layer lab-figure-layer" data-testid="lab-figure-layer">
      <button type="button" className="lab-super-scrim" aria-label="Close" onClick={onClose} />
      <section ref={windowRef} className="lab-v2-sheet lab-figure-card" data-testid="lab-figure-card" data-layer="figure" aria-label={`Figure ${figure.number}`}>
        <div className="lab-v2-head is-titled" data-reader-window-handle>
          <h2 className="lab-v2-title">Figure {figure.number}</h2>
          <button type="button" className="lab-v2-dismiss" data-testid="lab-figure-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="lab-v2-sheet-body lab-figure-card-body">
          <div className="lab-figure-zoom" data-testid="lab-figure-zoom" data-zoom={view.scale > 1 ? 'in' : 'out'}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <div className="lab-figure-zoom-inner" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
              <FigureImage figure={figure} />
            </div>
          </div>
          {figure.caption && <p className="lab-figure-card-caption">{figure.caption}</p>}
        </div>
        {(onExplain || onAsk) && <div className="lab-catch-up-foot lab-figure-card-foot">
          {onExplain && <button type="button" className="lab-catch-up-discuss" data-testid="lab-figure-explain" onClick={() => onExplain(figure)}>✧ Explain</button>}
          {onAsk && <button type="button" className="lab-catch-up-discuss" data-testid="lab-figure-ask" onClick={() => onAsk(figure)}>Chat</button>}
        </div>}
      </section>
    </div>
  )
}
