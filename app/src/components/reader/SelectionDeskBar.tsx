import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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
export type DeskMoreId = 'define' | 'factcheck' | 'counterpoint' | 'quiz' | 'gallery' | 'copy' | 'share' | 'page'

/** The margin reader's ••• rows on desktop (margin.js MORE_ROWS and MORE_ROWS_2), with the lines it shows under them. */
export const DESK_MORE_ROWS: Record<DeskMoreId, [string, string]> = {
  define: ['Define', 'The word, as this text uses it'],
  factcheck: ['Fact-check', 'Does it still hold? Searches the web'],
  counterpoint: ['Counterpoint', 'The strongest objection to it'],
  quiz: ['Quiz me', 'A question about this passage'],
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
  sharedReader?: boolean
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
  /** Original PDF geometry; null means that passage is outside the visible reader. */
  getAnchor?: () => DeskBox | null
  onAsk: () => void
  /** Only the private shared reader uses the in-place Ask field. */
  onAskQuestion?: (question: string) => void
  onComposeAsk?: (initialQuestion?: string) => void
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
  const [askOpen, setAskOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const askRef = useRef<HTMLInputElement | null>(null)
  const askButtonRef = useRef<HTMLButtonElement | null>(null)
  const [morePlace, setMorePlace] = useState<{ left: number; top: number } | null>(null)
  const moreRef = useRef<HTMLDivElement | null>(null)
  const observedSelection = useRef({ x: fallback.x, y: fallback.y, seen: false })
  const frame = (): DeskBox => ({ left: 0, right: window.innerWidth, top: document.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 60, bottom: window.innerHeight })
  useLayoutEffect(() => {
    const native = window.getSelection()
    const container = native?.anchorNode?.parentElement
    const nativeRange = native && !native.isCollapsed && native.rangeCount && container?.closest('.lab')
      ? native.getRangeAt(0).cloneRange() : null
    const at = () => {
      const el = ref.current
      if (!el) return
      const bounds = frame()
      if (observedSelection.current.x !== fallback.x || observedSelection.current.y !== fallback.y) observedSelection.current = { x: fallback.x, y: fallback.y, seen: false }
      const nodes = Array.from(document.querySelectorAll('.lab .lab-hearing-word.is-selecting'))
      const host = nodes[0]?.closest('.continuous-reader')?.getBoundingClientRect()
      if (host) { bounds.top = Math.max(bounds.top, host.top); bounds.bottom = Math.min(bounds.bottom, host.bottom) }
      const supplied = props.getAnchor?.()
      if (props.getAnchor && !supplied) { setPlace(null); return }
      const rects = supplied ? [supplied] : nodes.length ? nodes.flatMap(node => Array.from(node.getClientRects()))
        : nativeRange?.getClientRects ? Array.from(nativeRange.getClientRects()) : []
      if (rects.some(box => box.right > box.left && box.bottom > box.top)) observedSelection.current.seen = true
      const boxes = rects
        .filter(box => box.right > box.left && box.bottom > box.top && box.bottom > bounds.top && box.top < bounds.bottom)
        .map(boxOf)
      if (observedSelection.current.seen && !boxes.length) { setPlace(null); return }
      const lines = firstAndLastLine(boxes) ?? { first: { left: fallback.x, right: fallback.x, top: fallback.y, bottom: fallback.y }, last: { left: fallback.x, right: fallback.x, top: fallback.y, bottom: fallback.y } }
      setPlace(deskBarPlace(lines.first, lines.last, bounds, el.offsetWidth, el.offsetHeight))
    }
    let frameId = 0
    const schedule = () => { if (!frameId) frameId = requestAnimationFrame(() => { frameId = 0; at() }) }
    at()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule, true) }
  }, [state, marked, askOpen, fallback.x, fallback.y, props.getAnchor])
  useLayoutEffect(() => {
    if (!moreOpen || !place) { setMorePlace(null); return }
    const bar = ref.current, menu = moreRef.current
    const dots = bar?.querySelector('[data-testid="lab-dbar-more"]')
    if (!bar || !menu || !dots) return
    const at = deskMorePlace({ ...boxOf(bar.getBoundingClientRect()), below: place.below }, boxOf(dots.getBoundingClientRect()), frame(), menu.offsetWidth, menu.offsetHeight)
    // The menu is drawn inside the bar (it shares its dismissal): its place is relative to the bar.
    setMorePlace({ left: at.left - place.left, top: at.top - place.top })
  }, [moreOpen, place])
  useLayoutEffect(() => { if (props.sharedReader && moreOpen && morePlace) moreRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true }) }, [props.sharedReader, moreOpen, morePlace])
  // A new state (highlighted, the colours) closes the menu.
  useLayoutEffect(() => { setMoreOpen(false); setAskOpen(false); setQuestion('') }, [state])
  useLayoutEffect(() => { if (askOpen) askRef.current?.focus({ preventScroll: true }) }, [askOpen])

  const closeAsk = () => {
    setAskOpen(false)
    setQuestion('')
    requestAnimationFrame(() => askButtonRef.current?.focus({ preventScroll: true }))
  }
  const openAsk = (initialQuestion?: string) => {
    if (props.onComposeAsk) { initialQuestion === undefined ? props.onComposeAsk() : props.onComposeAsk(initialQuestion); return }
    if (!props.onAskQuestion) { props.onAsk(); return }
    setMoreOpen(false)
    setQuestion(initialQuestion ?? '')
    setAskOpen(true)
  }

  useEffect(() => {
    if (!props.sharedReader || askOpen || moreOpen || !place || (!props.onAskQuestion && !props.onComposeAsk)) return
    const available = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      if (element?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return false
      // An open note, search, or another dialog owns its keyboard even when
      // the passage's selection toolbar remains mounted behind it.
      if (element?.closest('[role="dialog"],dialog') && !ref.current?.contains(element)) return false
      return ref.current?.style.visibility !== 'hidden'
    }
    const type = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey
        || Array.from(event.key).length !== 1 || !event.key.trim() || !available(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      openAsk(event.key)
    }
    // IME keydowns use Process/229; only the committed composition is text.
    // Editable targets already receive composition normally and are untouched.
    const compose = (event: CompositionEvent) => {
      if (!event.data || !available(event.target)) return
      event.preventDefault()
      event.stopPropagation()
      openAsk(event.data)
    }
    window.addEventListener('keydown', type, true)
    window.addEventListener('compositionend', compose, true)
    return () => { window.removeEventListener('keydown', type, true); window.removeEventListener('compositionend', compose, true) }
  }, [props.sharedReader, props.onAskQuestion, props.onComposeAsk, askOpen, moreOpen, place])

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
      <button ref={askButtonRef} type="button" className="lab-pbar-item is-text" data-testid="lab-dbar-ask" onClick={() => openAsk()}>Ask</button>
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
      <button ref={askButtonRef} type="button" className="lab-pbar-item is-ask" data-testid="lab-dbar-ask" onClick={() => openAsk()}>Ask<span className="lab-dbar-caret" aria-hidden="true" /></button>
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
      data-ask-open={askOpen ? 'true' : undefined}
      role="toolbar"
      aria-label="Selection"
      style={{ position: 'fixed', top: place?.top ?? -999, left: place?.left ?? 16, ['--tip' as string]: `${place?.tip ?? 40}px`, visibility: place ? undefined : 'hidden' }}
      onPointerDown={keep}
      onMouseDown={keep}
    >
      {askOpen ? <form className="lab-dbar-ask-form" onSubmit={event => {
        event.preventDefault()
        const text = question.trim()
        if (text && props.onAskQuestion) props.onAskQuestion(text)
      }}>
        <label className="lab-dbar-ask-label" htmlFor="lab-dbar-ask-field">Ask about this passage</label>
        <input ref={askRef} id="lab-dbar-ask-field" data-testid="lab-dbar-ask-field" className="lab-dbar-ask-field" value={question}
          onChange={event => setQuestion(event.target.value)} placeholder="Ask about this passage…" autoComplete="off"
          onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeAsk() } }} />
        <button type="submit" className="lab-dbar-ask-send" aria-label="Send question" disabled={!question.trim()}>↑</button>
      </form> : body}
      {moreOpen && (
        <div ref={moreRef} className={`lab-dmore${morePlace ? '' : ' is-measuring'}`} role="menu" aria-label="More" data-testid="lab-desk-more" data-shared-reader-menu=""
          onKeyDown={event => {
            if (!props.sharedReader) return
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setMoreOpen(false); ref.current?.querySelector<HTMLButtonElement>('[data-testid="lab-dbar-more"]')?.focus(); return }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
            event.preventDefault()
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
            const index = items.indexOf(document.activeElement as HTMLButtonElement)
            items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
          }}
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
