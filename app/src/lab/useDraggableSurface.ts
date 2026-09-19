/**
 * Drag a floating reader surface (today the voice pill) around the viewport.
 *
 * Three things make this different from a plain pointer-drag:
 *
 * 1. The surface is full of controls. A press must stay a press until the
 *    pointer has actually travelled, or Mute/End/Expand stop working. Nothing
 *    is captured, moved or suppressed below DRAG_SLOP.
 * 2. Once it IS a drag, the click that follows the release has to be swallowed,
 *    or letting go over End hangs up the call.
 * 3. A position is only useful if it survives the next visit and can never
 *    strand the surface off-screen — so it is stored per device and re-clamped
 *    against the viewport on read and on resize.
 *
 * The geometry is pure and unit-tested; the hook is the DOM glue.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/** Travel, in CSS px, before a press becomes a drag rather than a tap. */
export const DRAG_SLOP = 4
/** Smallest visible sliver kept on screen when clamping. */
export const EDGE_MARGIN = 8

export interface SurfacePoint { x: number; y: number }
export interface SurfaceBox { width: number; height: number }
export interface Viewport { width: number; height: number }

/**
 * Keep a surface inside the viewport. A surface larger than the viewport is
 * pinned to the top-left rather than pushed off the opposite edge, which is
 * what a naive `Math.min(max, …)` does once `max` goes negative.
 */
export function clampToViewport(point: SurfacePoint, box: SurfaceBox, viewport: Viewport, margin = EDGE_MARGIN): SurfacePoint {
  const maxX = viewport.width - box.width - margin
  const maxY = viewport.height - box.height - margin
  return {
    x: Math.round(maxX < margin ? margin : Math.min(Math.max(point.x, margin), maxX)),
    y: Math.round(maxY < margin ? margin : Math.min(Math.max(point.y, margin), maxY)),
  }
}

/** A stored point is only trusted if it is two finite numbers. */
export function parseStoredPoint(raw: string | null): SurfacePoint | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object') return null
    const { x, y } = value as Partial<SurfacePoint>
    if (typeof x !== 'number' || typeof y !== 'number') return null
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    return { x, y }
  } catch {
    return null
  }
}

function readStored(key: string): SurfacePoint | null {
  try { return parseStoredPoint(window.localStorage.getItem(key)) } catch { return null }
}

function writeStored(key: string, point: SurfacePoint): void {
  try { window.localStorage.setItem(key, JSON.stringify(point)) } catch { /* private mode */ }
}

export interface DraggableSurface<T extends HTMLElement> {
  ref: (node: T | null) => void
  /** Absolute placement once moved; `undefined` leaves the CSS resting corner. */
  style: { left: number; top: number; right: 'auto'; bottom: 'auto' } | undefined
  dragging: boolean
  /** Forget the stored place and return to the CSS corner. */
  reset: () => void
}

export function useDraggableSurface<T extends HTMLElement>(storageKey: string, enabled = true): DraggableSurface<T> {
  const [point, setPoint] = useState<SurfacePoint | null>(null)
  const [dragging, setDragging] = useState(false)
  const nodeRef = useRef<T | null>(null)
  const startRef = useRef<{ px: number; py: number; ox: number; oy: number; live: boolean } | null>(null)
  const movedRef = useRef(false)

  const measure = useCallback(() => {
    const node = nodeRef.current
    if (!node) return null
    const box = node.getBoundingClientRect()
    return { width: box.width, height: box.height, left: box.left, top: box.top }
  }, [])

  // Restore, clamped to the viewport this device actually has now.
  useEffect(() => {
    if (!enabled) return
    const stored = readStored(storageKey)
    if (!stored) return
    const box = measure()
    setPoint(clampToViewport(stored, { width: box?.width ?? 0, height: box?.height ?? 0 },
      { width: window.innerWidth, height: window.innerHeight }))
  }, [enabled, storageKey, measure])

  // A window that shrinks must not leave the surface unreachable.
  useEffect(() => {
    if (!enabled) return
    const onResize = () => {
      setPoint((current) => {
        if (!current) return current
        const box = measure()
        return clampToViewport(current, { width: box?.width ?? 0, height: box?.height ?? 0 },
          { width: window.innerWidth, height: window.innerHeight })
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [enabled, measure])

  const ref = useCallback((node: T | null) => {
    nodeRef.current = node
    if (!node || !enabled) return
  }, [enabled])

  useEffect(() => {
    const node = nodeRef.current
    if (!node || !enabled) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const box = node.getBoundingClientRect()
      startRef.current = { px: event.clientX, py: event.clientY, ox: box.left, oy: box.top, live: true }
      movedRef.current = false
    }

    const onPointerMove = (event: PointerEvent) => {
      const start = startRef.current
      if (!start?.live) return
      const dx = event.clientX - start.px
      const dy = event.clientY - start.py
      if (!movedRef.current) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_SLOP) return
        movedRef.current = true
        setDragging(true)
        try { node.setPointerCapture(event.pointerId) } catch { /* jsdom */ }
      }
      event.preventDefault()
      const box = node.getBoundingClientRect()
      setPoint(clampToViewport({ x: start.ox + dx, y: start.oy + dy },
        { width: box.width, height: box.height },
        { width: window.innerWidth, height: window.innerHeight }))
    }

    const endDrag = (event: PointerEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start?.live || !movedRef.current) return
      setDragging(false)
      try { node.releasePointerCapture(event.pointerId) } catch { /* jsdom */ }
      const box = node.getBoundingClientRect()
      const settled = clampToViewport({ x: box.left, y: box.top }, { width: box.width, height: box.height },
        { width: window.innerWidth, height: window.innerHeight })
      setPoint(settled)
      writeStored(storageKey, settled)
      // Releasing over End must not hang up: swallow exactly the click this
      // drag produces, and only that one.
      const swallow = (click: MouseEvent) => { click.stopPropagation(); click.preventDefault() }
      node.addEventListener('click', swallow, { capture: true, once: true })
      window.setTimeout(() => node.removeEventListener('click', swallow, true), 0)
      movedRef.current = false
    }

    node.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      node.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [enabled, storageKey, point === null])

  const reset = useCallback(() => {
    setPoint(null)
    try { window.localStorage.removeItem(storageKey) } catch { /* private mode */ }
  }, [storageKey])

  return {
    ref,
    style: point ? { left: point.x, top: point.y, right: 'auto' as const, bottom: 'auto' as const } : undefined,
    dragging,
    reset,
  }
}

/**
 * The companion panel is resized by dragging its inner edge. It is bounded as a
 * FRACTION of the window rather than in pixels: the point is that neither the
 * passage nor the conversation is ever squeezed into uselessness, and what
 * counts as useless scales with the display.
 */
export const COMPANION_MIN_FRACTION = 0.3
export const COMPANION_MAX_FRACTION = 0.7

export function clampCompanionWidth(px: number, viewportWidth: number): number {
  if (!Number.isFinite(px) || !(viewportWidth > 0)) return 0
  const min = viewportWidth * COMPANION_MIN_FRACTION
  const max = viewportWidth * COMPANION_MAX_FRACTION
  return Math.round(Math.min(Math.max(px, min), max))
}

/** A stored width is only trusted if it is a finite positive number. */
export function parseStoredWidth(raw: string | null): number | null {
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}
