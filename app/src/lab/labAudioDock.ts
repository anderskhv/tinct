import { useLayoutEffect, type RefObject } from 'react'

/**
 * Where the desktop audio dock sits (Anders, 9 Oct 2026). The pill rides a
 * little over the foot of the leaf, into its bottom padding where the folios
 * live, but never over the text: its top stays below the text box (and below
 * a chapter-end row docked in that padding). With too little room the
 * overlap shrinks and the pill sits lower; it never climbs onto text.
 */
export const DESKTOP_DOCK_OVERLAP = 10
/** Gap kept between the bottom of the text box and the pill's top. */
export const DESKTOP_DOCK_TEXT_CLEARANCE = 4
/** Lowest the pill may sit: its bottom edge this far above the viewport's. */
export const DESKTOP_DOCK_MIN_BOTTOM = 0

export interface DesktopDockLayout {
  viewportHeight: number
  /** Bottom of the leaf (the page wrap's box). */
  leafBottom: number
  /** Bottom of everything that must stay uncovered: the text box, a docked chapter-end row. */
  contentBottom: number
  dockHeight: number
  overlap?: number
  clearance?: number
}

/** The dock's CSS `bottom`, in px. Pure. */
export function desktopDockBottom({
  viewportHeight, leafBottom, contentBottom, dockHeight,
  overlap = DESKTOP_DOCK_OVERLAP, clearance = DESKTOP_DOCK_TEXT_CLEARANCE,
}: DesktopDockLayout): number {
  const top = Math.max(leafBottom - overlap, contentBottom + clearance)
  return Math.max(DESKTOP_DOCK_MIN_BOTTOM, Math.round(viewportHeight - top - dockHeight))
}

/** Reads the live layout of one leaf: its bottom and the bottom of what must stay visible. */
export function measureDesktopLeaf(root: ParentNode): { leafBottom: number; contentBottom: number } | null {
  const wrap = root.querySelector<HTMLElement>('.lab-page-wrap')
  const passage = root.querySelector<HTMLElement>('.lab-page-wrap > .lab-passage')
  if (!wrap || !passage) return null
  const leaf = wrap.getBoundingClientRect()
  if (leaf.height <= 0) return null
  const box = passage.getBoundingClientRect()
  const padBottom = parseFloat(getComputedStyle(passage).paddingBottom) || 0
  let contentBottom = box.bottom - padBottom
  // A glyph's box can reach a little past the text box (tall descenders):
  // the last visible line on either page counts too.
  if (typeof document !== 'undefined' && typeof document.createRange === 'function') {
    passage.querySelectorAll<HTMLElement>('.lab-book-col').forEach(column => {
      const range = document.createRange()
      range.selectNodeContents(column)
      const rects = typeof range.getClientRects === 'function' ? range.getClientRects() : []
      for (const rect of Array.from(rects)) {
        if (rect.height > 0 && rect.width > 0 && rect.top < leaf.bottom && rect.bottom > leaf.top) contentBottom = Math.max(contentBottom, rect.bottom)
      }
    })
  }
  root.querySelectorAll<HTMLElement>('.lab-page-wrap .lab-chapter-end.is-docked').forEach(end => {
    const rect = end.getBoundingClientRect()
    if (rect.height > 0) contentBottom = Math.max(contentBottom, rect.bottom)
  })
  return { leafBottom: leaf.bottom, contentBottom }
}

/** Keeps the open dock placed against the live leaf: on resize, page turns and font changes. */
export function useDesktopDockPlacement(dockRef: RefObject<HTMLElement | null>, active: boolean): void {
  useLayoutEffect(() => {
    const dock = dockRef.current
    if (!active || !dock) return
    const root = dock.closest('.lab') ?? document
    let frame = 0
    const place = () => {
      frame = 0
      const leaf = measureDesktopLeaf(root)
      if (!leaf) { dock.style.removeProperty('--lab-dock-bottom'); return }
      const bottom = desktopDockBottom({ viewportHeight: window.innerHeight, ...leaf, dockHeight: dock.getBoundingClientRect().height })
      dock.style.setProperty('--lab-dock-bottom', bottom + 'px')
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(place) }
    place()
    const wrap = root.querySelector('.lab-page-wrap')
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
    resize?.observe(dock)
    if (wrap) resize?.observe(wrap)
    // A page turn can dock a chapter-end row in the leaf's foot.
    const mutations = wrap && typeof MutationObserver === 'function' ? new MutationObserver(schedule) : null
    if (wrap) mutations?.observe(wrap, { childList: true, subtree: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      resize?.disconnect()
      mutations?.disconnect()
      window.removeEventListener('resize', schedule)
      dock.style.removeProperty('--lab-dock-bottom')
    }
  }, [dockRef, active])
}
