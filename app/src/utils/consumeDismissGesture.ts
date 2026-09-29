/** Consume the closing gesture, including events delivered after a popup unmounts. */
export function consumeDismissGesture(event: PointerEvent): void {
  event.preventDefault()
  event.stopImmediatePropagation()
  const types = ['pointerup', 'pointermove', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'click', 'contextmenu'] as const
  const consume = (next: Event) => {
    next.preventDefault()
    next.stopImmediatePropagation()
    if (next.type === 'click') cleanup()
  }
  const cleanup = () => {
    types.forEach(type => window.removeEventListener(type, consume, true))
    window.removeEventListener('pointerdown', cleanup, true)
    window.removeEventListener('pointercancel', cleanup, true)
    clearTimeout(timer)
  }
  types.forEach(type => window.addEventListener(type, consume, { capture: true, passive: false }))
  // A new gesture always proceeds. The timer only clears abandoned listeners.
  window.addEventListener('pointerdown', cleanup, { capture: true, once: true })
  window.addEventListener('pointercancel', cleanup, { capture: true, once: true })
  const timer = window.setTimeout(cleanup, 10_000)
}
