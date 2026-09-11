import { useEffect, useRef, useState } from 'react'
import {
  LAB_SUPER_SPIN_MS,
  LAB_TEE_MORPH_FRAMES,
  LAB_V2_MARK_PX,
  labTeeFrameIndexAt,
} from './labSuperGlyph'

export interface LabSuperButtonProps {
  open: boolean
  onToggle: () => void
  /** Run the spin. The parent owns when that is allowed. */
  firstView?: boolean
  /** Called when the spin finishes or a touch ends it. */
  onFirstViewEnd?: () => void
  reducedMotion?: boolean
  label?: string
}

const LAST_FRAME = LAB_TEE_MORPH_FRAMES.length - 1

/**
 * The super button: the drawn "t" that opens the reader's menu.
 *
 * No container at rest — the mark sits on the paper. Pressing gives it a soft
 * disc for 80 ms; opening the menu morphs the letter into an ×, and closing
 * runs the same 220 ms in reverse. Once per reader load it spins once.
 *
 * Nothing here does layout work while it moves. The morph is a ladder of
 * pre-drawn frames — every one of them in the DOM from the start, laid out
 * once — and running it means raising one frame's opacity and dropping
 * another's. The spin and the press disc are transform and opacity. Under
 * reduced motion the same ladder cross-fades end to end instead of stepping.
 */
export function LabSuperButton({
  open,
  onToggle,
  firstView = false,
  onFirstViewEnd,
  reducedMotion = false,
  label = 'Menu',
}: LabSuperButtonProps) {
  const frameRefs = useRef<(SVGGElement | null)[]>([])
  const shownRef = useRef(open ? LAST_FRAME : 0)
  const spinRef = useRef<HTMLSpanElement>(null)
  const openRef = useRef(open)
  const [pressed, setPressed] = useState(false)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    const show = (index: number) => {
      if (index === shownRef.current) return
      frameRefs.current[shownRef.current]?.style.setProperty('opacity', '0')
      frameRefs.current[index]?.style.setProperty('opacity', '1')
      shownRef.current = index
    }
    if (openRef.current === open) return
    openRef.current = open
    // Reduced motion never steps through the morph: the two ends cross-fade,
    // which is the same two opacities under a CSS transition.
    if (reducedMotion) {
      show(open ? LAST_FRAME : 0)
      return
    }
    let raf = 0
    let start = 0
    const step = (now: number) => {
      if (!start) start = now
      const index = labTeeFrameIndexAt(now - start, open)
      show(index)
      if (index === (open ? LAST_FRAME : 0)) return
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      // A morph cut short still lands on the state it was heading for: an
      // interrupted × is not a resting shape.
      show(open ? LAST_FRAME : 0)
    }
  }, [open, reducedMotion])

  // The first view. It ends on its own, or on the first touch anywhere.
  useEffect(() => {
    if (!firstView) return
    setSpinning(true)
    const spin = spinRef.current
    spin?.style.setProperty('will-change', 'transform')
    const finish = () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', finish, true)
      spin?.style.removeProperty('will-change')
      setSpinning(false)
      onFirstViewEnd?.()
    }
    const timer = window.setTimeout(finish, reducedMotion ? 240 : LAB_SUPER_SPIN_MS)
    window.addEventListener('pointerdown', finish, true)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', finish, true)
      spin?.style.removeProperty('will-change')
    }
  }, [firstView, onFirstViewEnd, reducedMotion])

  const classes = ['lab-super']
  if (open) classes.push('is-open')
  if (pressed) classes.push('is-pressed')
  if (reducedMotion) classes.push('is-reduced')
  if (spinning) classes.push(reducedMotion ? 'is-arriving' : 'is-spinning')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      data-testid="lab-super"
      data-open={open ? 'true' : 'false'}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup="menu"
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onToggle}
    >
      <span className="lab-super-disc" aria-hidden="true" />
      <span className="lab-super-nudge" aria-hidden="true">
        <span className="lab-super-spin" ref={spinRef}>
          <span className="lab-super-pulse">
            <svg
              className="lab-super-mark"
              width={LAB_V2_MARK_PX}
              height={LAB_V2_MARK_PX}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {LAB_TEE_MORPH_FRAMES.map((frame, index) => (
                <g
                  key={index}
                  className="lab-super-frame"
                  data-frame={index}
                  // The opacity is the morph's, not React's: set once on
                  // mount, and after that only `show()` writes it. A style
                  // prop would be reasserted on every render, and a render
                  // mid-morph — the press disc, a parent's state — would
                  // put the ladder back at one end with the loop halfway up.
                  ref={node => {
                    frameRefs.current[index] = node
                    if (node && !node.style.opacity) {
                      node.style.opacity = index === shownRef.current ? '1' : '0'
                    }
                  }}
                  transform={frame.rotateTransform}
                >
                  <g transform={frame.skewTransform}>
                    <path d={frame.stemPath} />
                    <path d={frame.barPath} />
                  </g>
                </g>
              ))}
            </svg>
          </span>
        </span>
      </span>
    </button>
  )
}
