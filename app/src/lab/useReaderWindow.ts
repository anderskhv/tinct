import { useCallback, useLayoutEffect, useState } from 'react'
import { clampToViewport } from './useDraggableSurface'

type Placement = { x: number; y: number; width?: number; height?: number }
/** Which sides a resize moves: any of n, s, e, w, as a normal window's edges and corners. */
type Edges = { n: boolean; s: boolean; e: boolean; w: boolean }

/** How far inside a window's border its edges and corners resize it. */
export const READER_WINDOW_EDGE = 8

/** The edges under a point within `box`, or null in the window's interior. */
export function readerWindowEdgesAt(box: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>, x: number, y: number, band = READER_WINDOW_EDGE): Edges | null {
  if (x < box.left || x > box.right || y < box.top || y > box.bottom) return null
  // Corners take a larger target, as on a desktop window.
  const corner = band * 2
  const nearN = y - box.top <= band, nearS = box.bottom - y <= band
  const nearW = x - box.left <= band, nearE = box.right - x <= band
  const n = nearN || (y - box.top <= corner && (x - box.left <= corner || box.right - x <= corner))
  const s = nearS || (box.bottom - y <= corner && (x - box.left <= corner || box.right - x <= corner))
  const w = nearW || (x - box.left <= corner && (y - box.top <= corner || box.bottom - y <= corner))
  const e = nearE || (box.right - x <= corner && (y - box.top <= corner || box.bottom - y <= corner))
  return n || s || e || w ? { n, s, e, w } : null
}

export function readerWindowEdgeName(edges: Edges): string {
  return `${edges.n ? 'n' : edges.s ? 's' : ''}${edges.e ? 'e' : edges.w ? 'w' : ''}`
}

/** Shared desktop window mechanics. Only the header drags; body text and
 * controls retain their native pointer behaviour. Position lives in this tab. */
export function useReaderWindow<T extends HTMLElement>(
  key: string, enabled = true, collapsed = false,
) {
  const [node, setNode] = useState<T | null>(null)
  const ref = useCallback((element: T | null) => setNode(element), [])
  useLayoutEffect(() => {
    if (!node || !enabled || !node.closest('.lab.is-desktop:not(.has-phone-chrome)')) return
    const storageKey = 'tinct-window:' + key
    let saved: Placement | null = null
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
      if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) saved = value
    } catch { /* unavailable storage */ }
    node.dataset.readerWindow = 'true'
    const set = (property: string, value: string) => node.style.setProperty(property, value, 'important')
    const topInset = () => Math.max(8, (node.closest('.lab')?.querySelector('.lab-header')?.getBoundingClientRect().bottom ?? 0) + 8)
    const place = (x: number, y: number) => {
      const box = node.getBoundingClientRect()
      const point = clampToViewport({ x, y }, box, { width: innerWidth, height: innerHeight })
      set('left', point.x + 'px'); set('top', Math.max(topInset(), point.y) + 'px')
      set('right', 'auto'); set('bottom', 'auto'); set('transform', 'none')
    }
    const size = (width: number, height: number) => {
      // Explain / Define may grow only as wide as one reader leaf.
      const limit = key === 'explain' || key === 'define' ? innerWidth / 2 - 36 : innerWidth - 32
      set('width', Math.max(260, Math.min(width, limit)) + 'px')
      set('height', Math.max(160, Math.min(height, innerHeight - topInset() - 8)) + 'px')
    }
    if (collapsed) { set('width', '240px'); set('height', '52px') }
    else if (saved && Number.isFinite(saved.width) && Number.isFinite(saved.height)) size(saved.width!, saved.height!)
    if (saved) place(saved.x, saved.y)
    const clamp = () => {
      const box = node.getBoundingClientRect()
      if (!collapsed && (box.width > innerWidth - 16 || box.height > innerHeight - topInset() - 8)) size(box.width, box.height)
      const current = node.getBoundingClientRect()
      if (saved || current.left < 8 || current.top < topInset() || current.right > innerWidth - 8 || current.bottom > innerHeight - 8) place(current.left, current.top)
    }
    const remember = () => {
      const box = node.getBoundingClientRect()
      saved = { ...(saved ?? {}), x: box.left, y: box.top,
        ...(!collapsed && node.style.height ? { width: box.width, height: box.height } : {}) }
      try { sessionStorage.setItem(storageKey, JSON.stringify(saved)) } catch { /* private mode */ }
    }
    let drag: { id: number; x: number; y: number; box: DOMRect; resize: Edges | null; moved: boolean } | null = null
    // The edge under a pointer, marked on the window so its cursor shows over any child.
    const edgesAt = (event: PointerEvent): Edges | null => (
      collapsed || event.pointerType === 'touch' ? null : readerWindowEdgesAt(node.getBoundingClientRect(), event.clientX, event.clientY))
    const hover = (event: PointerEvent) => {
      if (drag) return
      const edges = edgesAt(event)
      if (edges) node.dataset.readerWindowEdge = readerWindowEdgeName(edges)
      else delete node.dataset.readerWindowEdge
    }
    const leave = () => { if (!drag) delete node.dataset.readerWindowEdge }
    const down = (event: PointerEvent) => {
      const target = event.target as Element
      const corner = !!target.closest('[data-reader-window-resize]')
      if (event.button !== 0 || collapsed && corner) return
      const resize: Edges | null = corner ? { n: false, s: true, e: true, w: false } : edgesAt(event)
      if (!resize && (!target.closest('[data-reader-window-handle]') || target.closest('button,input,select,textarea,a'))) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, box: node.getBoundingClientRect(), resize, moved: false }
      event.preventDefault()
      node.setPointerCapture?.(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y
      if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 4) return
      drag.moved = true
      event.preventDefault()
      const { box, resize } = drag
      if (!resize) { place(box.left + dx, box.top + dy); return }
      size(box.width + (resize.e ? dx : resize.w ? -dx : 0), box.height + (resize.s ? dy : resize.n ? -dy : 0))
      // A left or top edge moves that side: the opposite side stays where it was.
      const next = node.getBoundingClientRect()
      place(resize.w ? box.right - next.width : box.left, resize.n ? box.bottom - next.height : box.top)
    }
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      if (drag.moved) remember()
      drag = null
      hover(event)
      if (node.hasPointerCapture?.(event.pointerId)) node.releasePointerCapture(event.pointerId)
    }
    const keydown = (event: KeyboardEvent) => {
      if (!(event.target as Element).closest('[data-reader-window-resize]') || !event.key.startsWith('Arrow')) return
      event.preventDefault()
      const box = node.getBoundingClientRect()
      size(box.width + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0),
        box.height + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0))
      place(box.left, box.top); remember()
    }
    clamp()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(clamp) : null
    observer?.observe(node)
    node.addEventListener('pointerdown', down)
    node.addEventListener('pointermove', hover)
    node.addEventListener('pointerleave', leave)
    node.addEventListener('keydown', keydown)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('resize', clamp)
    return () => {
      observer?.disconnect()
      node.removeEventListener('pointerdown', down)
      node.removeEventListener('pointermove', hover)
      node.removeEventListener('pointerleave', leave)
      node.removeEventListener('keydown', keydown)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('resize', clamp)
      delete node.dataset.readerWindow
      delete node.dataset.readerWindowEdge
      for (const property of ['left', 'top', 'right', 'bottom', 'transform', 'width', 'height']) node.style.removeProperty(property)
    }
  }, [node, key, enabled, collapsed])
  return ref
}
