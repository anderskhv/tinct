import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { consumeDismissGesture } from '../../utils/consumeDismissGesture'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import { useReaderSelectionCopy } from '../../components/reader/useReaderSelectionCopy'
import { PhoneIcon } from './LabPhoneCard'
import './marginPhone.css'

export type PhoneMoreId = 'define' | 'factcheck' | 'counterpoint' | 'quiz' | 'copy'
/** The margin reader's ••• on a phone (margin.js MORE_ROWS, names only); Related is a PDF's alone. */
export const PHONE_MORE_ROWS: [PhoneMoreId, string][] = [['define', 'Define'], ['factcheck', 'Fact-check'], ['counterpoint', 'Counterpoint'], ['quiz', 'Quiz me'], ['copy', 'Copy quote']]

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
  /** A saved highlight was tapped, or the selection was just highlighted: its colours, its note and ✕ (remove it). */
  existingColor?: HighlightColor
  noted?: boolean
  /** Where the press ended, used only when no selected word is painted. */
  fallbackY: number
  onAsk: () => void
  onExplain: () => void
  onSimplify: () => void
  onMore: (id: PhoneMoreId) => void
  onHighlight: (color: HighlightColor) => void
  onNote: () => void
  onRemove: () => void
  onDismiss: () => void
}

/**
 * The phone's selection bar (the margin reader's `.mr-pbar`): dark, the width
 * of the page less 10px a side, 12px below the selection's last line (above
 * its first line when there is no room), its tip at the selection. Ask ·
 * Explain · Simplify · ••• · highlight · note; a highlight shows Ask · Explain,
 * its colours, its note and ✕ (remove it).
 */
export function LabPhoneBar(props: LabPhoneBarProps) {
  const { text, existingColor, noted = false, fallbackY } = props
  const ref = useRef<HTMLDivElement | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [place, setPlace] = useState<{ top: number; tip: number; below: boolean } | null>(null)
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
      const tip = first ? first.left + Math.min(first.width / 2, 24) : window.innerWidth / 2
      const low = window.innerHeight - 16
      const below = bottom + 12 + height <= low || top - 12 - height < header + 8
      setPlace({ top: below ? Math.min(low - height, bottom + 12) : Math.max(header + 8, top - 12 - height), tip: Math.max(26, Math.min(window.innerWidth - 26, tip)) - 10, below })
    }
    at()
    window.addEventListener('resize', at)
    return () => window.removeEventListener('resize', at)
  }, [text, existingColor, fallbackY])
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
      data-state={existingColor ? 'existing' : 'menu'}
      role="toolbar"
      aria-label="Selection"
      style={{ top: place?.top ?? -999, ['--tip' as string]: `${place?.tip ?? 0}px` }}
      onPointerDown={keep}
      onMouseDown={keep}
    >
      {existingColor ? (
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
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-remove" aria-label="Remove highlight" title="Remove highlight" onClick={props.onRemove}><PhoneIcon name="close" /></button>
        </>
      ) : (
        <>
          <button type="button" className="lab-pbar-item is-ask" data-testid="lab-pbar-ask" onClick={props.onAsk}>Ask<span className="lab-pbar-caret" aria-hidden="true" /></button>
          {sep}
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-explain" onClick={props.onExplain}>Explain</button>
          <button type="button" className="lab-pbar-item is-text" data-testid="lab-pbar-simplify" onClick={props.onSimplify}>Simplify</button>
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-more" aria-label="More" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen(open => !open)}><PhoneIcon name="more" /></button>
          <span className="lab-pbar-grow" aria-hidden="true" />
          {sep}
          <button type="button" className="lab-pbar-item is-hl" data-testid="lab-pbar-highlight" aria-label={`Highlight in ${current.label}`}
            onClick={() => props.onHighlight(current.key)}>
            <span className="lab-pbar-hl"><PhoneIcon name="highlight" /><span className="lab-pbar-dot" style={{ background: current.hex }} /></span>
          </button>
          <button type="button" className="lab-pbar-item" data-testid="lab-pbar-note" aria-label={noted ? 'Edit note' : 'Add note'} onClick={props.onNote}><PhoneIcon name="note" /></button>
        </>
      )}
      {moreOpen && !existingColor && (
        <div className={`lab-pmore${place?.below === false ? ' is-above' : ''}`} role="menu" data-testid="lab-phone-more">
          {PHONE_MORE_ROWS.map(([id, name]) => (
            <button key={id} type="button" role="menuitem" data-testid={`lab-pmore-${id}`} onClick={() => { setMoreOpen(false); props.onMore(id) }}>{name}</button>
          ))}
        </div>
      )}
    </div>
  )
}
