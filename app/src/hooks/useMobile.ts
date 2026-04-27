import { useState, useEffect, useCallback, useRef } from 'react'

export type MobileView = 0 | 1 | 2 | 3 | 4 // 0=reader, 1=compare, 2=chat, 3=notes, 4=cast

interface UseMobileReturn {
  isMobile: boolean
  activeView: MobileView
  setActiveView: (view: MobileView) => void
  swipeHandlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}

const SWIPE_THRESHOLD = 50

/**
 * Mobile/tablet breakpoint: 1024px.
 *
 * Anything ≤ this width gets the single-column mobile layout. Above
 * 1024px, the desktop layout with side-panel rails activates.
 *
 * Why 1024 and not 768: at 768px the mobile layout was only triggering
 * for phones. iPad portrait (~810-1024px) and 7-8" e-readers
 * (~1000-1400px logical) got the desktop layout rendered in too little
 * space — vertically-rotated rail spines looked broken, text was
 * squeezed against the panel. 1024px is the conventional tablet
 * boundary and aligns with how every other responsive site treats this
 * size class.
 *
 * Don't change this in just one place — there are matching
 * `(max-width: 1024px)` media queries in index.css that drive the
 * actual mobile layout styles. JS and CSS thresholds must agree.
 */
export function useMobile(splitViewEnabled: boolean): UseMobileReturn {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches
  )
  const [activeView, setActiveView] = useState<MobileView>(0)

  // Viewport detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Reset to reader view when switching to/from mobile
  useEffect(() => {
    if (!isMobile) setActiveView(0)
  }, [isMobile])

  const getNextView = useCallback((current: MobileView, direction: 1 | -1): MobileView => {
    const views: MobileView[] = [0, 1, 2, 3, 4]
    const idx = views.indexOf(current)
    const nextIdx = idx + direction
    if (nextIdx < 0 || nextIdx >= views.length) return current
    return views[nextIdx]
  }, [])

  // Touch tracking
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    touchStart.current = null

    // Only horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return

    // Don't swipe if user has text selected
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

    if (deltaX < 0) {
      // Swipe left → next view
      setActiveView(prev => getNextView(prev, 1))
    } else {
      // Swipe right → previous view
      setActiveView(prev => getNextView(prev, -1))
    }
  }, [getNextView])

  return {
    isMobile,
    activeView,
    setActiveView,
    swipeHandlers: { onTouchStart, onTouchEnd },
  }
}
