import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { consumeDismissGesture } from '../../utils/consumeDismissGesture'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import { useReaderSelectionCopy } from '../../components/reader/useReaderSelectionCopy'
import { PhoneIcon } from './LabPhoneCard'
import './marginPhone.css'

export type PhoneMoreId = 'define' | 'factcheck' | 'counterpoint' | 'quiz' | 'copy'
/** The margin reader's ••• on a phone (margin.js MORE_ROWS, names only); Related is a PDF's alone. */
// No Define: a word is defined by a single tap on it (Anders, 30 Oct 2026).
export const PHONE_MORE_ROWS: [PhoneMoreId, string][] = [['factcheck', 'Evaluate'], ['counterpoint', 'Counterpoint'], ['quiz', 'Quiz me'], ['copy', 'Copy']]

/** The part of the window the reader can see (above the software keyboard), in layout coordinates. */
function visibleWindow(): { top: number; bottom: number; width: number } {
  const viewport = window.visualViewport
  const top = viewport ? Math.max(0, viewport.offsetTop) : 0
  return { top, bottom: viewport ? top + viewport.height : window.innerHeight, width: viewport?.width || window.innerWidth }
}

/** The gap between the bar and its ••• menu, and the least room the menu keeps from a window edge. */
const MORE_GAP_PX = 8
const MORE_EDGE_PX = 10

/**
 * Where the ••• menu goes, relative to the bar: its left edge under the •••, moved in to stay whole inside the
 * window; below the bar when it fits there, else above it when it fits, else on the side with more room.
 */
export function phoneMorePlace(
  bar: { left: number; top: number; bottom: number },
  button: { left: number },
  menu: { width: number; height: number },
  view: { top: number; bottom: number; width: number },
): { left: number; above: boolean } {
  const lowest = view.width - MORE_EDGE_PX - menu.width
  const left = Math.max(MORE_EDGE_PX, Math.min(lowest, button.left)) - bar.left
  const below = view.bottom - MORE_EDGE_PX - (bar.bottom + MORE_GAP_PX)
  const above = bar.top - MORE_GAP_PX - (view.top + MORE_EDGE_PX)
  return { left: Math.round(left), above: below < menu.height && (above >= menu.height || above > below) }
}

/** The least room the bar keeps from a side of the window. */
const BAR_EDGE_PX = 10

/**
 * Where the bar goes across the window: only as wide as its buttons, its tip (the selection's start, kept
 * 26px in from a side) about 30px in from the bar's left, moved in to stay whole inside the window.
 */
export function phoneBarLeft(tipX: number, barWidth: number, viewWidth: number): { left: number; tip: number } {
  const x = Math.max(26, Math.min(viewWidth - 26, tipX))
  const left = Math.max(BAR_EDGE_PX, Math.min(viewWidth - BAR_EDGE_PX - barWidth, x - 30))
  return { left: Math.floor(left), tip: Math.round(x - Math.floor(left)) }
}

const LAST_COLOR_KEY = 'tinct-highlight-color'
export function lastHighlightColor(): HighlightColor {
  try { const saved = localStorage.getItem(LAST_COLOR_KEY); return HIGHLIGHT_COLORS.find(c => c.key === saved)?.key ?? 'gold' } catch { return 'gold' }
}
function rememberColor(color: HighlightColor) {
  try { localStorage.setItem(LAST_COLOR_KEY, color) } catch { /* private mode */ }
}

export interface LabPhoneBarProps {
  /** The selected words (copy, and where the bar sits). */
  text: string
  /** The selected passage is highlighted. A fresh save keeps its icon until the next press opens colours. */
  existingColor?: HighlightColor
  noted?: boolean
  /** Where the press ended, used only when no selected word is painted. */
  fallbackY: number
  /** PDF text-layer selections provide a native rect rather than painted lab-hearing-word nodes. */
  fallbackX?: number
  onAsk: () => void
  onExplain: () => void
  onSimplify: () => void
  onMore: (id: PhoneMoreId) => void
  onHighlight: (color: HighlightColor) => void
  onNote: () => void
  onRemove: () => void
  /** A reader's own PDF text can return to the page containing this selection. */
  onShowPage?: () => void
  onDismiss: () => void
}

/**
 * The phone's selection bar (the margin reader's `.mr-pbar`): dark, only as
 * wide as its buttons and placed at the selection, 12px below the selection's last line (above
 * its first line when there is no room), its tip at the selection. Ask ·
 * Explain · Simplify · ••• · highlight · note; a highlight shows Ask · Explain,
 * its colours, its note and ✕ (remove it).
 */
export function LabPhoneBar(props: LabPhoneBarProps) {
  const { text, existingColor, noted = false, fallbackY } = props
  const ref = useRef<HTMLDivElement | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(!!existingColor)
  // A newly applied mark keeps the same toolbar; only its next highlighter
  // press opens colours. Opening a different saved mark may show them directly.
  useEffect(() => { setPaletteOpen(!!existingColor) }, [text, props.fallbackX, fallbackY])
  const [place, setPlace] = useState<{ top: number; left: number; tip: number; below: boolean } | null>(null)
  useReaderSelectionCopy(text)
  useLayoutEffect(() => {
    const at = () => {
      const boxes = Array.from(document.querySelectorAll('.lab .lab-passage .lab-hearing-word.is-selecting'))
        .flatMap(node => Array.from(node.getClientRects()))
        .filter(box => box.width && box.height && box.bottom > 0 && box.top < window.innerHeight)
      const header = document.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 60
      const height = ref.current?.offsetHeight || 48
      const top = boxes.length ? Math.min(...boxes.map(box => box.top)) : fallbackY
      const bottom = boxes.length ? Math.max(...boxes.map(box => box.bottom)) : fallbackY
      const first = boxes[0]
      const tip = first ? first.left + Math.min(first.width / 2, 24) : props.fallbackX ?? window.innerWidth / 2
      const low = window.innerHeight - 16
      const below = bottom + 12 + height <= low || top - 12 - height < header + 8
      const across = phoneBarLeft(tip, Math.ceil(ref.current?.getBoundingClientRect().width || 0), window.innerWidth)
      setPlace({ top: below ? Math.min(low - height, bottom + 12) : Math.max(header + 8, top - 12 - height), ...across, below })
    }
    at()
    window.addEventListener('resize', at)
    return () => window.removeEventListener('resize', at)
  }, [text, existingColor, fallbackY, props.fallbackX])
  // The ••• menu: as wide as its longest name, under the ••• when it fits below the bar, else above it, and
  // never past an edge of the visible window.
  const moreRef = useRef<HTMLDivElement | null>(null)
  const [morePlace, setMorePlace] = useState<{ left: number; above: boolean } | null>(null)
  useLayoutEffect(() => {
    if (!moreOpen) { setMorePlace(null); return }
    const at = () => {
      const bar = ref.current, menu = moreRef.current
      const button = bar?.querySelector('[data-testid="lab-pbar-more"]')
      if (!bar || !menu || !button) return
      setMorePlace(phoneMorePlace(bar.getBoundingClientRect(), button.getBoundingClientRect(), { width: menu.offsetWidth, height: menu.offsetHeight }, visibleWindow()))
    }
    at()
    window.addEventListener('resize', at)
    window.visualViewport?.addEventListener('resize', at)
    return () => { window.removeEventListener('resize', at); window.visualViewport?.removeEventListener('resize', at) }
  }, [moreOpen, place])
  const dismissRef = useRef(props.onDismiss)
  dismissRef.current = props.onDismiss
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (target && ref.current?.contains(target)) return
      if (target?.closest?.('.lab-v2-sheet-layer, [aria-modal="true"]')) { dismissRef.current(); return }
      // The first outside press only dismisses: it never selects, turns a page or opens a word.
      consumeDismissGesture(event)
      dismissRef.current()
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); dismissRef.current() } }
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    window.addEventListener('keydown', onKey, true)
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', onKey, true) }
  }, [])
  const current = HIGHLIGHT_COLORS.find(color => color.key === (existingColor ?? lastHighlightColor())) ?? HIGHLIGHT_COLORS[0]
  const keep = (event: React.PointerEvent | React.MouseEvent) => event.preventDefault()
  const sep = <span className="lab-pbar-sep" aria-hidden="true" />
  return (
    <div
      ref={ref}
      className={`lab-pbar${place?.below === false ? ' is-above' : ''}`}
      data-testid="lab-phone-bar"
      data-state={existingColor && paletteOpen ? 'existing' : 'menu'}
      role="toolbar"
      aria-label="Selection"
      style={{ top: place?.top ?? -999, left: place?.left ?? 10, ['--tip' as string]: `${place?.tip ?? 0}px` }}
      onPointerDown={keep}
      onMouseDown={keep}
    >
      {existingColor && paletteOpen ? (
        <>
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-ask" onClick={props.onAsk}>Ask</button>
          {sep}
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-explain" onClick={props.onExplain}>Explain</button>
          {sep}
          {HIGHLIGHT_COLORS.map(color => (
            <button key={color.key} type="button" className="lab-pbar-swatch" data-testid={`lab-pbar-color-${color.key}`} aria-label={color.label}
              aria-pressed={color.key === existingColor} style={{ background: color.hex }}
              onClick={() => { rememberColor(color.key); props.onHighlight(color.key) }} />
          ))}
          {sep}
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-note" aria-label={noted ? 'Edit note' : 'Add note'} onClick={props.onNote}><PhoneIcon name="note" /></button>
          {props.onShowPage && <button type="button" className="lab-pbar-item" data-testid="lab-pbar-more" aria-label="More" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen(open => !open)}><PhoneIcon name="more" /></button>}
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-remove" aria-label="Remove highlight" title="Remove highlight" onClick={props.onRemove}><PhoneIcon name="close" /></button>
        </>
      ) : (
        <>
          <button type="button" className="lab-pbar-item is-ask" data-testid="lab-pbar-ask" onClick={props.onAsk}>Ask</button>
          {sep}
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-explain" onClick={props.onExplain}>Explain</button>
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-simplify" onClick={props.onSimplify}>Simplify</button>
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-more" aria-label="More" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen(open => !open)}><PhoneIcon name="more" /></button>
          {sep}
          <button type="button" className="lab-pbar-item is-hl" data-testid="lab-pbar-highlight" aria-label={`Highlight in ${current.label}`}
            onClick={() => { if (existingColor) setPaletteOpen(true); else { rememberColor(current.key); props.onHighlight(current.key) } }}>
            <span className="lab-pbar-hl"><PhoneIcon name="highlight" /><span className="lab-pbar-dot" style={{ background: current.hex }} /></span>
          </button>
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-note" aria-label={noted ? 'Edit note' : 'Add note'} onClick={props.onNote}><PhoneIcon name="note" /></button>
        </>
      )}
      {moreOpen && (!(existingColor && paletteOpen) || props.onShowPage) && (
        <div ref={moreRef} className={`lab-pmore${morePlace?.above ? ' is-above' : ''}`} role="menu" data-testid="lab-phone-more"
          style={{ left: morePlace?.left ?? 0, visibility: morePlace ? undefined : 'hidden' }}>
          {!existingColor && PHONE_MORE_ROWS.map(([id, name]) => (
            <button key={id} type="button" role="menuitem" data-testid={`lab-pmore-${id}`} onClick={() => { setMoreOpen(false); props.onMore(id) }}>{name}</button>
          ))}
          {props.onShowPage && <button type="button" role="menuitem" data-testid="lab-pmore-page" onClick={() => { setMoreOpen(false); props.onShowPage?.() }}>Show page</button>}
        </div>
      )}
    </div>
  )
}
