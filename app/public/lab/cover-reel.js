/** Shared cover motion for discovery and the reader's own shelf. */
export function createCoverReel(shelf, { selector, index = 0, onSelect }) {
  let position = index, drag = null, wheelTimer, blockedUntil = 0
  const items = () => [...shelf.querySelectorAll(selector)]
  const clamp = n => Math.max(0, Math.min(items().length - 1, n))
  const step = () => (items()[0]?.offsetWidth || 166) + 28
  function paint() {
    items().forEach((item, i) => {
      const distance = i - position, amount = Math.abs(distance)
      item.style.transform = `translateX(calc(-50% + ${distance * step()}px)) translateY(${Math.min(amount, 3) * 13}px) rotateY(${Math.max(-1.6, Math.min(1.6, distance)) * -16}deg) scale(${1 - Math.min(amount, 3) * .075})`
      item.style.opacity = String(Math.max(.24, 1 - amount * .2))
      item.style.zIndex = String(10 - Math.round(amount))
    })
  }
  function select(n) { position = clamp(n); paint(); onSelect(position) }
  shelf.ondragstart = event => event.preventDefault()
  shelf.onpointerdown = event => {
    if (event.button !== 0 || event.target.closest('[data-now-remove]')) return
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, initial: position, moved: 0 }
    if (event.pointerType === 'mouse') event.preventDefault()
    shelf.classList.add('is-dragging')
  }
  shelf.onpointermove = event => {
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    if (Math.abs(dy) > Math.abs(dx) + 12 && drag.moved < 5) {
      const initial = drag.initial; drag = null
      shelf.classList.remove('is-dragging'); position = initial; paint(); return
    }
    drag.moved = Math.max(drag.moved, Math.abs(dx))
    if (drag.moved > 6 && !shelf.hasPointerCapture(event.pointerId)) shelf.setPointerCapture(event.pointerId)
    const raw = drag.initial - dx / step(), end = items().length - 1
    position = raw < 0 ? raw * .22 : raw > end ? end + (raw - end) * .22 : raw
    paint()
  }
  const finish = event => {
    if (!drag || drag.id !== event.pointerId) return
    const { moved, initial } = drag, travelled = position - initial
    const target = moved >= 28 && Math.abs(travelled) < .5 ? Math.round(initial) + Math.sign(travelled) : Math.round(position)
    drag = null; shelf.classList.remove('is-dragging')
    if (shelf.hasPointerCapture(event.pointerId)) shelf.releasePointerCapture(event.pointerId)
    if (moved > 6) blockedUntil = Date.now() + 350
    select(target)
  }
  shelf.onpointerup = finish; shelf.onpointercancel = finish
  shelf.onlostpointercapture = event => { if (event.target === shelf && drag) finish(event) }
  shelf.onwheel = event => {
    const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX
    if (!delta || (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY))) return
    event.preventDefault(); clearTimeout(wheelTimer)
    const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? shelf.clientWidth : 1)
    position = clamp(position + pixels / step()); shelf.classList.add('is-dragging'); paint()
    wheelTimer = setTimeout(() => { shelf.classList.remove('is-dragging'); select(Math.round(position)) }, 120)
  }
  const blockClick = event => { if (Date.now() < blockedUntil) { event.preventDefault(); event.stopImmediatePropagation() } }
  shelf.addEventListener('click', blockClick, true)
  paint()
  return {
    setIndex(n) { position = clamp(n); paint() },
    destroy() {
      clearTimeout(wheelTimer)
      shelf.removeEventListener('click', blockClick, true)
      for (const name of ['ondragstart','onpointerdown','onpointermove','onpointerup','onpointercancel','onlostpointercapture','onwheel']) shelf[name] = null
    },
  }
}
