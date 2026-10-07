import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { VoiceOrb } from './VoiceOrb'
import './labLibrarianTab.css'
import type { LabLibrarianTabDock, LabLibrarianTabMode } from './labPrefs'
import {
  LIBRARIAN_TAB_BAND_MIN_HEIGHT,
  LIBRARIAN_TAB_BAND_WIDTH,
  LIBRARIAN_TAB_CATCH,
  LIBRARIAN_TAB_HEIGHT,
  LIBRARIAN_TAB_LONG_PRESS_MS,
  LIBRARIAN_TAB_ORB,
  LIBRARIAN_TAB_PEEK_HEIGHT,
  LIBRARIAN_TAB_PEEK_DELAY_MS,
  LIBRARIAN_TAB_PEEK_MS,
  LIBRARIAN_TAB_TAP_SLOP,
  librarianTabAvoid,
  librarianTabBand,
  librarianTabDockFromDrop,
  librarianTabIconSize,
  librarianTabOverTarget,
  librarianTabPull,
  librarianTabRect,
  librarianTabReleased,
  librarianTabStretch,
  librarianTabYRange,
  type LibrarianTabFrame,
} from './labLibrarianTab'

export const LIBRARIAN_TAB_LABEL = 'Librarian tab'

/**
 * The reading surface the tab docks against: the painted passage inside the
 * page wrap (never the hidden measuring copies), and the paper between its
 * edges and the text. Page-turn buttons on the reader edge become zones the
 * tab keeps clear of.
 */
export function measureLibrarianTabFrame(wrap: HTMLElement | null): { frame: LibrarianTabFrame; avoid: Record<'left' | 'right', Array<[number, number]>> } | null {
  if (!wrap || typeof window === 'undefined') return null
  const passage = Array.from(wrap.querySelectorAll<HTMLElement>('.lab-passage'))
    .find(element => !element.closest('.lab-page-measure, .lab-desktop-measure') && element.getBoundingClientRect().width > 0)
  if (!passage) return null
  const rect = passage.getBoundingClientRect()
  const style = window.getComputedStyle(passage)
  const marginLeft = parseFloat(style.paddingLeft) || 0
  const marginRight = parseFloat(style.paddingRight) || 0
  const frame: LibrarianTabFrame = {
    left: rect.left,
    right: rect.right,
    top: Math.max(rect.top, 0),
    bottom: Math.min(rect.bottom, window.innerHeight),
    marginLeft,
    marginRight,
  }
  const avoid: Record<'left' | 'right', Array<[number, number]>> = { left: [], right: [] }
  const reach = LIBRARIAN_TAB_BAND_MIN_HEIGHT / 2 + 6
  for (const button of Array.from(document.querySelectorAll<HTMLElement>('[data-testid="lab-page-prev"], [data-testid="lab-page-next"]'))) {
    const box = button.getBoundingClientRect()
    if (!box.width || !box.height) continue
    const zone: [number, number] = [box.top - reach, box.bottom + reach]
    if (box.left < frame.left + LIBRARIAN_TAB_BAND_WIDTH && box.right > frame.left) avoid.left.push(zone)
    if (box.right > frame.right - LIBRARIAN_TAB_BAND_WIDTH && box.left < frame.right) avoid.right.push(zone)
  }
  return { frame, avoid }
}

export function LibrarianTabIcon({ mode, size }: { mode: LabLibrarianTabMode; size: number }) {
  return mode === 'chat'
    ? <svg className="lab-librarian-tab-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" data-mode="chat"><path d="M4 5.5h16v10H9l-5 4z" /></svg>
    : <svg className="lab-librarian-tab-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" data-mode="talk"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>
}

export interface LabLibrarianTabProps {
  /** The page wrap: the tab measures the painted passage inside it. */
  surfaceRef: RefObject<HTMLElement | null>
  /** Anything that can move the reading surface's edges or margins. */
  measureKey: string
  dock: LabLibrarianTabDock
  mode: LabLibrarianTabMode
  /** Null: long press does nothing. */
  longPressMode: LabLibrarianTabMode | null
  /** The first-run peek: once, ~1s. */
  peek?: boolean
  reducedMotion?: boolean
  eink?: boolean
  onOpen: (mode: LabLibrarianTabMode) => void
  onDock: (dock: LabLibrarianTabDock) => void
  onHide: () => void
  onPeekEnd?: () => void
}

type Phase = 'idle' | 'pressing' | 'dragging' | 'free'

interface Gesture {
  pointerId: number
  x0: number
  y0: number
  /** Pointer offset from the tab centre, so the tab does not jump under the finger. */
  dy: number
  moved: boolean
  held: boolean
  side: 'left' | 'right'
  free: boolean
  x: number
  y: number
  timer: ReturnType<typeof setTimeout> | null
}

/**
 * The librarian tab. Tap opens the default mode; with Long press on, a 450ms
 * hold opens the other. Drag it along the edge to move it; pull it ~56px off
 * the edge and it lets go as the orb; drop it near either edge to dock it
 * there, or on the hide target to hide it.
 *
 * Every frame of a drag writes styles straight to the tab's own nodes: the
 * reader never re-renders for it, and nothing outside the tab repaints.
 */
function LabLibrarianTabImpl({
  surfaceRef, measureKey, dock, mode, longPressMode, peek = false, reducedMotion = false, eink = false,
  onOpen, onDock, onHide, onPeekEnd,
}: LabLibrarianTabProps) {
  const [measured, setMeasured] = useState<ReturnType<typeof measureLibrarianTabFrame>>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [overTarget, setOverTarget] = useState(false)
  const [peeking, setPeeking] = useState(false)
  const bandRef = useRef<HTMLDivElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const orbRef = useRef<HTMLDivElement | null>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const still = reducedMotion || eink

  const measure = useCallback(() => setMeasured(current => {
    const next = measureLibrarianTabFrame(surfaceRef.current)
    // A page being swapped can leave no painted passage for a frame: keep the
    // last place rather than blinking the tab out.
    if (!next) return current
    if (!current) return next
    const a = current.frame
    const b = next.frame
    const same = a.left === b.left && a.right === b.right && a.top === b.top && a.bottom === b.bottom
      && a.marginLeft === b.marginLeft && a.marginRight === b.marginRight
      && JSON.stringify(current.avoid) === JSON.stringify(next.avoid)
    return same ? current : next
  }), [surfaceRef])

  useLayoutEffect(() => { measure() }, [measure, measureKey])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('resize', measure)
    const wrap = surfaceRef.current
    const observer = typeof ResizeObserver === 'function' && wrap ? new ResizeObserver(() => measure()) : null
    if (observer && wrap) observer.observe(wrap)
    // A late font or a settled page map can move the passage without a resize.
    const late = window.setTimeout(measure, 400)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
      window.clearTimeout(late)
    }
  }, [measure, surfaceRef, measureKey])

  // The first-run peek: once, about a second, then never again.
  const peekEndRef = useRef(onPeekEnd)
  peekEndRef.current = onPeekEnd
  useEffect(() => {
    if (!peek || !measured) return
    // Once the page has settled, so the stretch is seen rather than lost in the first paint.
    let end = 0
    const start = window.setTimeout(() => {
      setPeeking(true)
      end = window.setTimeout(() => { setPeeking(false); peekEndRef.current?.() }, LIBRARIAN_TAB_PEEK_MS)
    }, LIBRARIAN_TAB_PEEK_DELAY_MS)
    return () => { window.clearTimeout(start); window.clearTimeout(end) }
  }, [peek, Boolean(measured)])

  useEffect(() => () => { const timer = gestureRef.current?.timer; if (timer) clearTimeout(timer) }, [])

  const frame = measured?.frame ?? null
  const height = peeking ? LIBRARIAN_TAB_PEEK_HEIGHT : LIBRARIAN_TAB_HEIGHT
  const range = frame ? librarianTabYRange(frame, height) : null
  const docked = frame && range ? (() => {
    const wanted = frame.top + dock.y * (frame.bottom - frame.top)
    const y = librarianTabAvoid(wanted, measured!.avoid[dock.side], range)
    return { ...dock, y: (y - frame.top) / Math.max(1, frame.bottom - frame.top) }
  })() : null
  const tab = frame && docked ? librarianTabRect(frame, docked, height) : null
  const band = frame && tab ? librarianTabBand(frame, tab, dock.side) : null

  /** During a drag: the band and pill follow the finger, straight to the DOM. */
  const paintDrag = useCallback((gesture: Gesture) => {
    if (!frame || !tab) return
    const bandEl = bandRef.current
    const pillEl = pillRef.current
    const orbEl = orbRef.current
    const [min, max] = librarianTabYRange(frame)
    const centre = Math.max(min, Math.min(max, gesture.y - gesture.dy))
    if (gesture.free) {
      if (orbEl) orbEl.style.transform = `translate3d(${gesture.x - LIBRARIAN_TAB_ORB / 2}px, ${gesture.y - LIBRARIAN_TAB_ORB / 2}px, 0)`
      return
    }
    const stretch = librarianTabStretch(librarianTabPull(frame, gesture.side, gesture.x))
    const bandHeight = Math.max(LIBRARIAN_TAB_BAND_MIN_HEIGHT, LIBRARIAN_TAB_HEIGHT)
    if (bandEl) bandEl.style.transform = `translate3d(${gesture.side === 'right' ? frame.right - LIBRARIAN_TAB_BAND_WIDTH : frame.left}px, ${centre - bandHeight / 2}px, 0)`
    if (pillEl) pillEl.style.width = `${tab.width + stretch}px`
  }, [frame, tab])

  // The docked place is written here, not through React's style prop: a drag
  // writes the same properties by hand, and React would not know to put them back.
  useLayoutEffect(() => {
    if (gestureRef.current?.moved || !tab || !band) return
    if (bandRef.current) bandRef.current.style.transform = `translate3d(${band.left}px, ${band.top}px, 0)`
    if (pillRef.current) pillRef.current.style.width = `${tab.width}px`
  })

  const finish = useCallback((gesture: Gesture, cancelled: boolean) => {
    if (gesture.timer) clearTimeout(gesture.timer)
    gestureRef.current = null
    setPhase('idle')
    setOverTarget(false)
    if (!gesture.moved) {
      if (!gesture.held && !cancelled) onOpen(mode)
      return
    }
    if (!frame) return
    if (gesture.free && !cancelled && librarianTabOverTarget(gesture.x, gesture.y, window.innerWidth, window.innerHeight)) {
      onHide()
      return
    }
    const drop = gesture.free
      ? librarianTabDockFromDrop(frame, gesture.x, gesture.y - gesture.dy)
      : { ...librarianTabDockFromDrop(frame, gesture.side === 'right' ? frame.right : frame.left, gesture.y - gesture.dy), side: gesture.side }
    onDock(drop)
  }, [frame, mode, onDock, onHide, onOpen])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tab || gestureRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.stopPropagation()
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* synthetic pointer */ }
    const gesture: Gesture = {
      pointerId: event.pointerId, x0: event.clientX, y0: event.clientY,
      dy: event.clientY - (tab.top + tab.height / 2),
      moved: false, held: false, side: dock.side, free: false, x: event.clientX, y: event.clientY, timer: null,
    }
    if (longPressMode) {
      gesture.timer = setTimeout(() => {
        const current = gestureRef.current
        if (!current || current.moved) return
        current.held = true
        current.timer = null
        setPhase('idle')
        onOpen(longPressMode)
      }, LIBRARIAN_TAB_LONG_PRESS_MS)
    }
    gestureRef.current = gesture
    setPhase('pressing')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.held || !frame) return
    event.stopPropagation()
    gesture.x = event.clientX
    gesture.y = event.clientY
    if (!gesture.moved) {
      if (Math.hypot(event.clientX - gesture.x0, event.clientY - gesture.y0) <= LIBRARIAN_TAB_TAP_SLOP) return
      gesture.moved = true
      if (gesture.timer) { clearTimeout(gesture.timer); gesture.timer = null }
      setPhase('dragging')
    }
    if (!gesture.free && librarianTabReleased(librarianTabPull(frame, gesture.side, gesture.x))) {
      gesture.free = true
      setPhase('free')
    } else if (gesture.free) {
      // Brought back to either edge, the orb is taken back by it.
      const near = gesture.x < (frame.left + frame.right) / 2 ? 'left' : 'right'
      if (librarianTabPull(frame, near, gesture.x) < LIBRARIAN_TAB_CATCH) {
        gesture.free = false
        gesture.side = near
        setPhase('dragging')
      }
    }
    setOverTarget(gesture.free && librarianTabOverTarget(gesture.x, gesture.y, window.innerWidth, window.innerHeight))
    paintDrag(gesture)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    event.stopPropagation()
    finish(gesture, false)
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    finish(gesture, true)
  }

  // The orb mounts on letting go; place it under the finger before it paints.
  useLayoutEffect(() => {
    const gesture = gestureRef.current
    if (phase === 'free' && gesture) paintDrag(gesture)
  }, [phase, paintDrag])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    event.stopPropagation()
    onOpen(mode)
  }

  if (!frame || !tab || !band) return null
  const dragging = phase === 'dragging' || phase === 'free'
  const holding = phase === 'pressing' && longPressMode != null
  const icon = librarianTabIconSize(tab.width)
  return (
    <>
      <div
        ref={bandRef}
        className={`lab-librarian-tab-band is-${dock.side}${dragging ? ' is-dragging' : ''}${phase === 'free' ? ' is-free' : ''}${peeking ? ' is-peeking' : ''}${still ? ' is-still' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={LIBRARIAN_TAB_LABEL}
        data-testid="lab-librarian-tab-band"
        data-mode={mode}
        data-side={dock.side}
        data-phase={phase}
        style={{ width: band.width, height: band.height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={event => event.stopPropagation()}
        onContextMenu={event => event.preventDefault()}
        onKeyDown={onKeyDown}
      >
        <span
          ref={pillRef}
          className="lab-librarian-tab"
          data-testid="lab-librarian-tab"
          style={{ height: tab.height, top: (band.height - tab.height) / 2 }}
        >
          <LibrarianTabIcon mode={mode} size={icon} />
        </span>
        {holding && (
          <svg className="lab-librarian-tab-ring" data-testid="lab-librarian-tab-ring" viewBox="0 0 36 36" aria-hidden="true"
            style={{ [dock.side]: Math.max(0, tab.width / 2 - 18) }}>
            <circle cx="18" cy="18" r="16" pathLength="100" />
          </svg>
        )}
      </div>
      {phase === 'free' && (
        <div ref={orbRef} className="lab-librarian-tab-orb" data-testid="lab-librarian-tab-orb" aria-hidden="true">
          <VoiceOrb status="listening" motion={still ? 'still' : 'breathe'} reducedMotion={still} size={LIBRARIAN_TAB_ORB - 6} testId="lab-librarian-tab-orb-canvas" />
        </div>
      )}
      {dragging && (
        <div className={`lab-librarian-tab-target${overTarget ? ' is-active' : ''}`} data-testid="lab-librarian-tab-target" aria-hidden="true">×</div>
      )}
    </>
  )
}

export const LabLibrarianTab = memo(LabLibrarianTabImpl)

export interface LabLibrarianTabSettingsProps {
  mode: LabLibrarianTabMode
  longPress: boolean
  /** Talk can be chosen; false for a reader's own book. */
  talkAvailable?: boolean
  onMode: (mode: LabLibrarianTabMode) => void
  onLongPress: (on: boolean) => void
  onHide: () => void
  onClose: () => void
}

/** Two choices, one pressed: the small segmented control the tab's settings use. */
export function LibrarianSegment<T extends string>({ label, value, options, onChange, testId }: {
  label: string
  value: T
  options: Array<{ value: T; label: string; disabled?: boolean }>
  onChange: (value: T) => void
  testId: string
}) {
  return (
    <span className="lab-librarian-segment" role="group" aria-label={label} data-testid={testId}>
      {options.map(option => (
        <button key={option.value} type="button" aria-pressed={value === option.value} disabled={option.disabled}
          data-testid={`${testId}-${option.value}`} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </span>
  )
}

/** "Librarian tab": the tab's settings, opened from ⋯ in the chat header. */
export function LabLibrarianTabSettings({ mode, longPress, talkAvailable = true, onMode, onLongPress, onHide, onClose }: LabLibrarianTabSettingsProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return (
    <div className="lab-librarian-settings-layer" data-testid="lab-librarian-settings-layer">
      <button type="button" className="lab-librarian-settings-scrim" aria-label="Close" onClick={onClose} />
      <section className="lab-librarian-settings" data-testid="lab-librarian-settings" aria-label={LIBRARIAN_TAB_LABEL}>
        <div className="lab-librarian-settings-head">
          <h2>{LIBRARIAN_TAB_LABEL}</h2>
          <button type="button" className="lab-librarian-settings-close" aria-label="Close" data-testid="lab-librarian-settings-close" onClick={onClose}>×</button>
        </div>
        <div className="lab-librarian-settings-row">
          <span>Tab opens</span>
          <LibrarianSegment label="Tab opens" testId="lab-librarian-opens" value={mode}
            options={[{ value: 'chat', label: 'Chat' }, { value: 'talk', label: 'Talk', disabled: !talkAvailable }]} onChange={onMode} />
        </div>
        <div className="lab-librarian-settings-row">
          <span>Long press</span>
          <LibrarianSegment label="Long press" testId="lab-librarian-long-press" value={longPress ? 'other' : 'off'}
            options={[{ value: 'off', label: 'Off' }, { value: 'other', label: 'Other', disabled: !talkAvailable }]} onChange={value => onLongPress(value === 'other')} />
        </div>
        <button type="button" className="lab-librarian-settings-row is-hide" data-testid="lab-librarian-hide" onClick={onHide}>
          <span>Hide the tab</span>
        </button>
      </section>
    </div>
  )
}

/** "Librarian tab hidden · Undo", for six seconds after hiding. */
export function LabLibrarianTabNote({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="lab-librarian-note" role="status" data-testid="lab-librarian-note">
      <span>Librarian tab hidden</span>
      <button type="button" data-testid="lab-librarian-undo" onClick={onUndo}>Undo</button>
    </div>
  )
}
