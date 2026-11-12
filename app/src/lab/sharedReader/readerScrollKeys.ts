import { useEffect, useRef, type RefObject } from 'react'

/**
 * Keyboard scrolling for the Margin reader and the whole-book scroll.
 *
 * Both readers scroll an inner element (`.continuous-reader`), not the page.
 * A browser sends ArrowDown, PageDown or Space to the scroller that holds
 * focus, and on arrival focus is on <body>: the document has nothing to
 * scroll, so the keys did nothing until the reader clicked into the text
 * (12 Nov 2026 user test, Windows). The reader handles these keys itself,
 * wherever focus rests outside a field, a menu or another scrolling panel,
 * and moves its scroller the way a page scrolls.
 */
export type ReaderScrollKeyAction =
  | { kind: 'by'; delta: number }
  | { kind: 'start' }
  | { kind: 'end' }

/** A line's worth of scroll for ArrowDown/ArrowUp, as browsers step a page. */
export const READER_SCROLL_LINE = 48

type KeyLike = Pick<KeyboardEvent, 'key' | 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey' | 'isComposing' | 'defaultPrevented'>

/** What a key does to a scroller this tall, or null when it is not a scrolling key. */
export function readerScrollKeyAction(event: KeyLike, viewportHeight: number): ReaderScrollKeyAction | null {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return null
  const screen = Math.max(READER_SCROLL_LINE, viewportHeight - READER_SCROLL_LINE)
  if (event.key === ' ') return { kind: 'by', delta: event.shiftKey ? -screen : screen }
  // Shift with an arrow or Home/End extends a selection; it is not a scroll.
  if (event.shiftKey) return null
  switch (event.key) {
    case 'ArrowDown': return { kind: 'by', delta: READER_SCROLL_LINE }
    case 'ArrowUp': return { kind: 'by', delta: -READER_SCROLL_LINE }
    case 'PageDown': return { kind: 'by', delta: screen }
    case 'PageUp': return { kind: 'by', delta: -screen }
    case 'Home': return { kind: 'start' }
    case 'End': return { kind: 'end' }
    default: return null
  }
}

const OWN_KEYS = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"],[role="listbox"],[role="menu"],[role="menubar"],[role="radiogroup"],[role="tablist"],[role="tree"],[role="grid"],[role="combobox"],[role="spinbutton"],[role="toolbar"],[role="dialog"],[role="alertdialog"],dialog'
const ACTIVATES_ON_SPACE = 'button,a[href],summary,label,[role="button"],[role="link"],[role="checkbox"],[role="switch"],[role="option"],[role="menuitem"],[role="tab"]'

const scrollsItself = (node: Element) => {
  if (!(node instanceof HTMLElement) || node.scrollHeight <= node.clientHeight + 1) return false
  const overflow = getComputedStyle(node).overflowY
  return overflow === 'auto' || overflow === 'scroll'
}

/**
 * Whether the reader may take this key from where it was pressed. Fields,
 * sliders, menus, toolbars and dialogs keep their keys, a focused control
 * keeps Space, and another scrolling panel (Chat, a card's own text) scrolls
 * itself natively.
 */
export function readerScrollKeyTarget(target: EventTarget | null, host: HTMLElement, key: string): boolean {
  if (!host.isConnected || host.clientHeight === 0) return false
  if (typeof document !== 'undefined') {
    if (document.documentElement.dataset.tinctCommandsOpen === 'true') return false
    if (document.querySelector('[aria-modal="true"]')) return false
  }
  const element = target instanceof Element ? target : null
  if (!element || element === document.body || element === document.documentElement) return true
  if ((element as HTMLElement).isContentEditable || element.closest(OWN_KEYS)) return false
  if (key === ' ' && element.closest(ACTIVATES_ON_SPACE)) return false
  for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
    if (node === host) return true
    if (scrollsItself(node)) return false
  }
  return true
}

/**
 * Listen for scrolling keys on the window for one reader scroller. `browse`
 * marks the move as the reader's own (as a wheel does), so the position store
 * records the place the scroll comes to rest on. `edge` lets a reader say
 * where its chapter starts or ends; without it, the scroller's own ends.
 */
export function useReaderScrollKeys(
  hostRef: RefObject<HTMLElement | null>,
  handlers: { browse: () => void; edge?: (which: 'start' | 'end', host: HTMLElement) => number | null },
  enabled = true,
) {
  const latest = useRef(handlers)
  latest.current = handlers
  useEffect(() => {
    if (!enabled) return
    // A second press while a smooth scroll is still running steps on from
    // where the first was going, as a browser does, not from mid-flight.
    let pending: { top: number; at: number } | null = null
    const onKey = (event: KeyboardEvent) => {
      const host = hostRef.current
      if (!host) return
      const action = readerScrollKeyAction(event, host.clientHeight)
      if (!action || !readerScrollKeyTarget(event.target, host, event.key)) return
      event.preventDefault()
      latest.current.browse()
      const max = Math.max(0, host.scrollHeight - host.clientHeight)
      const from = pending && performance.now() - pending.at < 350 ? pending.top : host.scrollTop
      const top = Math.max(0, Math.min(max, action.kind === 'by' ? from + action.delta
        : latest.current.edge?.(action.kind, host) ?? (action.kind === 'start' ? 0 : max)))
      const smooth = !event.repeat && typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches
      pending = smooth ? { top, at: performance.now() } : null
      host.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hostRef, enabled])
}
