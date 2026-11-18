/** How far the pointer may travel and still be a click (LabPassage counts under 3px as one). */
export const DISMISS_CLICK_SLOP_PX = 4

/**
 * The press that dismissed something is, if it ends as a click, only that dismissal: its release and its click reach
 * nothing else (no word definition under it). If it turns into a drag it is the reader selecting text, and goes on
 * untouched, so a passage can still be selected in one gesture while a card is open.
 *
 * Unlike consumeDismissGesture the press itself is not taken: whatever started on it (the page's own drag) is ended
 * with a pointercancel when the click is swallowed, so nothing is left waiting for a release that never came.
 */
export function consumeDismissClick(down: PointerEvent): void {
  const startX = down.clientX, startY = down.clientY, pressed = down.target
  let moved = false
  const move = (event: Event) => {
    const at = event as PointerEvent
    if (Math.hypot(at.clientX - startX, at.clientY - startY) > DISMISS_CLICK_SLOP_PX) moved = true
  }
  const swallow = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation() }
  const up = (event: Event) => {
    move(event)
    if (moved) { cleanup(); return }
    swallow(event)
    window.removeEventListener('pointermove', move, true)
    window.removeEventListener('pointerup', up, true)
    // The page saw the press: tell it the gesture is over, without a release it would read as a click.
    if (pressed instanceof Element && pressed.isConnected) pressed.dispatchEvent(new Event('pointercancel', { bubbles: true, cancelable: true }))
  }
  const click = (event: Event) => { if (!moved) swallow(event); cleanup() }
  const cleanup = () => {
    window.removeEventListener('pointermove', move, true)
    window.removeEventListener('pointerup', up, true)
    window.removeEventListener('click', click, true)
    window.removeEventListener('pointerdown', cleanup, true)
    window.removeEventListener('pointercancel', cancelled, true)
    clearTimeout(timer)
  }
  // A real pointercancel (not the one sent above) ends the gesture.
  const cancelled = (event: Event) => { if (event.isTrusted) cleanup() }
  window.addEventListener('pointermove', move, true)
  window.addEventListener('pointerup', up, { capture: true, passive: false })
  window.addEventListener('click', click, { capture: true, passive: false })
  window.addEventListener('pointercancel', cancelled, true)
  // A new press always proceeds. Registered after this press has finished dispatching.
  const timer = window.setTimeout(cleanup, 10_000)
  queueMicrotask(() => window.addEventListener('pointerdown', cleanup, { capture: true, once: true }))
}
