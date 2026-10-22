import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types'
import { PhoneIcon } from '../../lab/marginPhone/LabPhoneCard'
import { deskBarPlace, deskMorePlace, firstAndLastLine, type DeskBox } from './deskBarPlace'
import '../../lab/marginPhone/marginPhone.css'
import './selectionDeskBar.css'

/**
 * The bar's states, as the margin reader names them (margin.js barHtml): a fresh selection ('menu'), its colours once
 * it is highlighted ('colors'), and a saved highlight clicked ('existing').
 */
export type DeskBarState = 'menu' | 'colors' | 'existing'
export type DeskMoreId = 'define' | 'factcheck' | 'counterpoint' | 'gallery' | 'copy' | 'share' | 'page'

/** The margin reader's ••• rows on desktop (margin.js MORE_ROWS and MORE_ROWS_2), with the lines it shows under them. */
export const DESK_MORE_ROWS: Record<DeskMoreId, [string, string]> = {
  define: ['Define', 'The word, as this text uses it'],
  factcheck: ['Fact-check', 'Does it still hold? Searches the web'],
  counterpoint: ['Counterpoint', 'The strongest objection to it'],
  gallery: ['Character gallery', 'Everyone in this passage'],
  copy: ['Copy', 'The passage, to paste elsewhere'],
  share: ['Share as image', 'The quote as a card to post'],
  page: ['Show page', 'This passage on its original page'],
}

/** The margin reader's swatch colours on the dark bar (reader.js HL_COLORS, the dot column). */
export const DESK_SWATCH: Record<HighlightColor, string> = {
  gold: '#e9cf86', rose: '#eba7ad', sage: '#a9d0a3', sky: '#a6c2ee', lavender: '#c6b0ee',
}

export interface SelectionDeskBarProps {
  state: DeskBarState
  /** The colour a click on the highlighter uses, or the saved highlight's colour. */
  color: HighlightColor
  /** The passage is highlighted already (the highlighter's dot then opens the colours). */
  marked: boolean
  noted: boolean
  /** The ••• rows: the first group (lookups), then the second (the passage itself). */
  moreRows: DeskMoreId[][]
  /** Where the press ended, used only when no selected word is painted. */
  fallback: { x: number; y: number }
  onAsk: () => void
  onExplain: () => void
  onSimplify: () => void
  onMore: (id: DeskMoreId) => void
  onHighlight: () => void
  onSwatch: (color: HighlightColor) => void
  onNote: () => void
  onRemove: () => void
  /** Container props owned by SelectionPopup (keyboard trap, dismissal guards). */
  containerProps?: Record<string, unknown>
}

const boxOf = (rect: DOMRect | DeskBox): DeskBox => ({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom })

/**
 * The classic desktop reader's selection bar: the margin reader's dark `.mr-bar` (and the phone's `.lab-pbar`), at
 * its desktop size and place. Ask · Explain · Simplify · ••• · highlighter · note; once highlighted, ••• · its colours
 * · note; a saved highlight, Ask · Explain · ••• · its colours · note · ✕. Answers open where the classic reader opens
 * them: Ask in the chat panel, Explain and the ••• lookups in the explanation card beside the passage.
 */
export const SelectionDeskBar = forwardRef<HTMLDivElement, SelectionDeskBarProps>(function SelectionDeskBar(props, forwarded) {
  const { state, color, marked, noted, moreRows, fallback } = props
  const ref = useRef<HTMLDivElement | null>(null)
  const setRef = (node: HTMLDivElement | null) => {
    ref.current = node
    if (typeof forwarded === 'function') forwarded(node)
    else if (forwarded) forwarded.current = node
  }
  const [place, setPlace] = useState<{ left: number; top: number; below: boolean; tip: number } | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const [morePlace, setMorePlace] = useState<{ left: number; top: number } | null>(null)
  const moreRef = useRef<HTMLDivElement | null>(null)
  const frame = (): DeskBox => ({ left: 0, right: window.innerWidth, top: document.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 60, bottom: window.innerHeight })
  useLayoutEffect(() => {
    const at = () => {
      const el = ref.current
      if (!el) return
      const boxes = Array.from(document.querySelectorAll('.lab .lab-hearing-word.is-selecting'))
        .flatMap(node => Array.from(node.getClientRects()))
        .filter(box => box.width && box.height && box.bottom > 0 && box.top < window.innerHeight)
        .map(boxOf)
      const lines = firstAndLastLine(boxes) ?? { first: { left: fallback.x, right: fallback.x, top: fallback.y, bottom: fallback.y }, last: { left: fallback.x, right: fallback.x, top: fallback.y, bottom: fallback.y } }
      setPlace(deskBarPlace(lines.first, lines.last, frame(), el.offsetWidth, el.offsetHeight))
    }
    at()
    window.addEventListener('resize', at)
    return () => window.removeEventListener('resize', at)
  }, [state, marked, fallback.x, fallback.y])
  useLayoutEffect(() => {
    if (!moreOpen || !place) { setMorePlace(null); return }
    const bar = ref.current, menu = moreRef.current
    const dots = bar?.querySelector('[data-testid="lab-dbar-more"]')
    if (!bar || !menu || !dots) return
    const at = deskMorePlace({ ...boxOf(bar.getBoundingClientRect()), below: place.below }, boxOf(dots.getBoundingClientRect()), frame(), menu.offsetWidth, menu.offsetHeight)
    // The menu is drawn inside the bar (it shares its dismissal): its place is relative to the bar.
    setMorePlace({ left: at.left - place.left, top: at.top - place.top })
  }, [moreOpen, place])
  // A new state (highlighted, the colours) closes the menu.
  useLayoutEffect(() => { setMoreOpen(false) }, [state])

  const keep = (event: React.PointerEvent | React.MouseEvent) => event.preventDefault()
  const sep = <span className="lab-pbar-sep" aria-hidden="true" />
  const current = HIGHLIGHT_COLORS.find(item => item.key === color) ?? HIGHLIGHT_COLORS[0]
  const swatches = HIGHLIGHT_COLORS.map(item => (
    <button key={item.key} type="button" className="lab-pbar-swatch" data-testid={`lab-dbar-color-${item.key}`} aria-label={item.label}
      aria-pressed={marked && item.key === color} style={{ background: DESK_SWATCH[item.key] }} onClick={() => props.onSwatch(item.key)} />
  ))
  const note = <button type="button" className="lab-pbar-item" data-testid="lab-dbar-note" aria-label={noted ? 'Edit note' : 'Add note'} onClick={props.onNote}><PhoneIcon name="note" /></button>
  const more = (rows: DeskMoreId[][]) => rows.some(group => group.length)
    ? <button type="button" className="lab-pbar-item" data-testid="lab-dbar-more" aria-label="More" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen(open => !open)}><PhoneIcon name="more" /></button>
    : null
  let body: ReactNode
  if (state === 'existing') {
    body = <>
      <button type="button" className="lab-pbar-item is-text" data-testid="lab-dbar-ask" onClick={props.onAsk}>Ask</button>
      {sep}
      <button type="button" className="lab-pbar-item is-text" data-testid="lab-dbar-explain" onClick={props.onExplain}>Explain</button>
      {more(moreRows)}
      {sep}
      {swatches}
      {sep}
      {note}
      <button type="button" className="lab-pbar-item" data-testid="lab-dbar-remove" aria-label="Remove highlight" title="Remove highlight" onClick={props.onRemove}><PhoneIcon name="close" /></button>
    </>
  } else if (state === 'colors') {
    body = <>
      {more(moreRows)}
      {sep}
      {swatches}
      {sep}
      {note}
    </>
  } else {
    body = <>
      <button type="button" className="lab-pbar-item is-ask" data-testid="lab-dbar-ask" onClick={props.onAsk}>Ask<span className="lab-dbar-caret" aria-hidden="true" /></button>
      {sep}
      <button type="button" className="lab-pbar-item is-text" data-testid="lab-dbar-explain" onClick={props.onExplain}>Explain</button>
      <button type="button" className="lab-pbar-item is-text" data-testid="lab-dbar-simplify" onClick={props.onSimplify}>Simplify</button>
      {more(moreRows)}
      {sep}
      <button type="button" className="lab-pbar-item is-hl" data-testid="lab-dbar-highlight" aria-label={`Highlight in ${current.label}`} onClick={props.onHighlight}>
        <span className="lab-pbar-hl"><PhoneIcon name="highlight" /><span className="lab-pbar-dot" style={{ background: DESK_SWATCH[current.key] }} /></span>
      </button>
      {note}
    </>
  }
  const groups = moreRows.filter(group => group.length)
  return (
    <div
      {...props.containerProps}
      ref={setRef}
      className={`selection-popup is-lab is-desk-bar lab-pbar is-desk${place?.below ? ' is-below' : ''}`}
      data-testid="lab-desk-bar"
      data-bar-state={state}
      role="toolbar"
      aria-label="Selection"
      style={{ position: 'fixed', top: place?.top ?? -999, left: place?.left ?? 16, ['--tip' as string]: `${place?.tip ?? 40}px`, visibility: place ? undefined : 'hidden' }}
      onPointerDown={keep}
      onMouseDown={keep}
    >
      {body}
      {moreOpen && (
        <div ref={moreRef} className={`lab-dmore${morePlace ? '' : ' is-measuring'}`} role="menu" aria-label="More" data-testid="lab-desk-more"
          style={{ left: morePlace?.left ?? 0, top: morePlace?.top ?? 0 }}>
          {groups.map((group, index) => (
            <div key={index} className="lab-dmore-group">
              {index > 0 && <hr />}
              {group.map(id => (
                <button key={id} type="button" role="menuitem" className="lab-dmore-row" data-testid={`lab-dmore-${id}`}
                  onClick={() => { setMoreOpen(false); props.onMore(id) }}>
                  <b>{DESK_MORE_ROWS[id][0]}</b><span>{DESK_MORE_ROWS[id][1]}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
