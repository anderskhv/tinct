/**
 * Swipe the paused phone audio bar down to put it away.
 *
 * The bar is full of controls, so a press stays a press until the finger has
 * travelled SWIPE_SLOP; nothing moves, is captured or is swallowed before
 * then. Past the slop the gesture is decided once: mostly downward becomes a
 * drag that the bar follows; anything else (sideways, upward) is left alone
 * for the rest of that press. Once it is a drag, the click that follows the
 * release is swallowed, so letting go over Play does not resume the book.
 *
 * The geometry is pure and unit-tested; the hook is the DOM glue. Closing is
 * the caller's own close, the same one the handle button runs.
 */
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from 'react'

/** Travel, in CSS px, before a press becomes a gesture rather than a tap. */
export const SWIPE_SLOP = 8
/** Downward travel that closes on release. */
export const SWIPE_CLOSE_DISTANCE = 40
/** A quick flick closes from a shorter travel. */
export const SWIPE_FLICK_DISTANCE = 16
export const SWIPE_FLICK_VELOCITY = 0.5 // px per ms
/** How long the bar takes to slide out after a closing release. */
export const SWIPE_EXIT_MS = 160

export type SwipeIntent = 'pending' | 'drag' | 'ignore'

/** What a press that has travelled (dx, dy) is: undecided, a downward drag, or not ours. */
export function swipeIntent(dx: number, dy: number): SwipeIntent {
  if (Math.hypot(dx, dy) < SWIPE_SLOP) return 'pending'
  return dy > 0 && dy > Math.abs(dx) * 1.5 ? 'drag' : 'ignore'
}

/** Whether a downward drag released after (dx, dy) over `ms` closes the bar. */
export function swipeCloses(dx: number, dy: number, ms: number): boolean {
  if (dy <= 0 || dy <= Math.abs(dx)) return false
  if (dy >= SWIPE_CLOSE_DISTANCE) return true
  return dy >= SWIPE_FLICK_DISTANCE && dy / Math.max(1, ms) >= SWIPE_FLICK_VELOCITY
}

interface Press { id: number; x: number; y: number; t: number; intent: SwipeIntent; dy: number }

export interface SwipeDownClose<T extends HTMLElement> {
  ref: (node: T | null) => void
  handlers: {
    onPointerDown: (event: ReactPointerEvent<T>) => void
    onPointerMove: (event: ReactPointerEvent<T>) => void
    onPointerUp: (event: ReactPointerEvent<T>) => void
    onPointerCancel: (event: ReactPointerEvent<T>) => void
    onClickCapture: (event: ReactMouseEvent<T>) => void
  }
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

export function useSwipeDownClose<T extends HTMLElement>(enabled: boolean, reducedMotion: boolean, onClose: () => void): SwipeDownClose<T> {
  const nodeRef = useRef<T | null>(null)
  const pressRef = useRef<Press | null>(null)
  const swallowClickRef = useRef(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const paint = useCallback((dy: number | null, transition?: string) => {
    const node = nodeRef.current
    if (!node) return
    node.style.transition = transition ?? (dy === null ? '' : 'none')
    node.style.transform = dy === null ? '' : `translateY(${Math.max(0, dy)}px)`
  }, [])

  const clear = useCallback(() => {
    if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null }
    const node = nodeRef.current
    if (node) { node.style.transition = ''; node.style.transform = ''; node.style.opacity = '' }
  }, [])

  // The bar may stop being closable mid-press (Play from elsewhere, a page
  // turn): drop the press and put the bar back where it lives.
  useEffect(() => {
    if (enabled) return
    pressRef.current = null
    clear()
  }, [enabled, clear])
  useEffect(() => clear, [clear])

  const ref = useCallback((node: T | null) => { nodeRef.current = node }, [])

  const onPointerDown = useCallback((event: ReactPointerEvent<T>) => {
    swallowClickRef.current = false
    if (!enabled || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) { pressRef.current = null; return }
    pressRef.current = { id: event.pointerId ?? 0, x: event.clientX, y: event.clientY, t: now(), intent: 'pending', dy: 0 }
  }, [enabled])

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    const press = pressRef.current
    if (!press || (event.pointerId ?? 0) !== press.id || press.intent === 'ignore') return
    const dx = event.clientX - press.x
    const dy = event.clientY - press.y
    if (press.intent === 'pending') {
      press.intent = swipeIntent(dx, dy)
      if (press.intent !== 'drag') return
      swallowClickRef.current = true
      try { event.currentTarget.setPointerCapture?.(press.id) } catch { /* pointer already gone */ }
    }
    press.dy = dy
    if (!reducedMotion) paint(dy)
  }, [paint, reducedMotion])

  const finish = useCallback((event: ReactPointerEvent<T>, cancelled: boolean) => {
    const press = pressRef.current
    if (!press || (event.pointerId ?? 0) !== press.id) return
    pressRef.current = null
    if (press.intent !== 'drag') return
    // The click of this press, if the browser sends one, is swallowed; a
    // later keyboard press on a control is not.
    setTimeout(() => { swallowClickRef.current = false }, 400)
    const dx = event.clientX - press.x
    const dy = cancelled ? press.dy : event.clientY - press.y
    if (cancelled || !swipeCloses(dx, dy, now() - press.t)) {
      if (!reducedMotion) paint(null, 'transform 160ms ease')
      return
    }
    if (reducedMotion) { closeRef.current(); return }
    const node = nodeRef.current
    if (node) {
      node.style.transition = `transform ${SWIPE_EXIT_MS}ms ease-in, opacity ${SWIPE_EXIT_MS}ms ease-in`
      node.style.transform = `translateY(calc(100% + ${Math.max(24, dy)}px))`
      node.style.opacity = '0'
    }
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null
      closeRef.current()
      clear()
    }, SWIPE_EXIT_MS)
  }, [clear, paint, reducedMotion])

  const onPointerUp = useCallback((event: ReactPointerEvent<T>) => finish(event, false), [finish])
  const onPointerCancel = useCallback((event: ReactPointerEvent<T>) => finish(event, true), [finish])

  const onClickCapture = useCallback((event: ReactMouseEvent<T>) => {
    if (!swallowClickRef.current) return
    swallowClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture } }
}
