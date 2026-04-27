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
 * Treat e-ink (Boox/Onyx) as mobile regardless of viewport width.
 * Boox 7-8" devices report 1000-1400px logical width — wider than our
 * 768px mobile breakpoint — so they got desktop layout, which crammed
 * three columns + side panel into a small e-ink screen and left
 * Anders's chat input cut off (B23). The mobile single-pane layout is
 * a much better fit for e-ink ergonomics.
 *
 * Detection sources (any one is enough):
 *   - data-eink attr on <html>, set in main.tsx from Capacitor+Android
 *     UA, or `boox`/`onyx`/`eink`/`e-ink` substrings, or `?eink=1`
 *   - viewport ≤ 768px (the standard mobile breakpoint)
 */
function detectMobileLike(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(max-width: 768px)').matches) return true
  if (typeof document !== 'undefined' && document.documentElement.hasAttribute('data-eink')) return true
  return false
}

export function useMobile(splitViewEnabled: boolean): UseMobileReturn {
  const [isMobile, setIsMobile] = useState(detectMobileLike)
  const [activeView, setActiveView] = useState<MobileView>(0)

  // Viewport detection — also re-evaluates if a parent component flips
  // the data-eink attribute (rare; usually static from main.tsx).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = () => setIsMobile(detectMobileLike())
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
