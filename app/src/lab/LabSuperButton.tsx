import { useEffect, useRef, useState } from 'react'
import {
  LAB_SUPER_SPIN_MS,
  LAB_TEE_CROSS,
  LAB_TEE_REST,
  labTeeFrameAt,
  type LabTeeFrame,
} from './labSuperGlyph'

export interface LabSuperButtonProps {
  open: boolean
  onToggle: () => void
  /** The teal full stop that says there is something new behind the mark. */
  hint?: boolean
  /** Run the once-ever spin. The parent owns when that is allowed. */
  firstView?: boolean
  /** Called when the spin finishes or a touch ends it — either way, it is seen. */
  onFirstViewEnd?: () => void
  reducedMotion?: boolean
  label?: string
}

function Tee({ frame }: { frame: LabTeeFrame }) {
  return (
    <g transform={frame.rotateTransform}>
      <g transform={frame.skewTransform}>
        <path d={frame.stemPath} />
        <path d={frame.barPath} />
      </g>
    </g>
  )
}

/**
 * The super button: the drawn "t" that opens the reader's menu.
 *
 * No container at rest — the mark sits on the paper. Pressing gives it a soft
 * disc for 80 ms; opening the menu morphs the letter into an ×, and closing
 * runs the same 220 ms in reverse. The first time a reader ever sees it, and
 * only then, it spins once.
 *
 * Everything that moves here moves on `transform` and `opacity`, except the
 * ×-morph itself, which is a genuine geometry morph — the spec is explicit
 * that the midpoint must be neither letter nor ×. That morph writes `d` on two
 * paths inside a `contain: layout paint` button, so it never reads layout back
 * and never reaches the page.
 */
export function LabSuperButton({
  open,
  onToggle,
  hint = false,
  firstView = false,
  onFirstViewEnd,
  reducedMotion = false,
  label = 'Menu',
}: LabSuperButtonProps) {
  const stemRef = useRef<SVGPathElement>(null)
  const barRef = useRef<SVGPathElement>(null)
  const rotateRef = useRef<SVGGElement>(null)
  const skewRef = useRef<SVGGElement>(null)
  const markRef = useRef<SVGSVGElement>(null)
  const spinRef = useRef<HTMLSpanElement>(null)
  const paintedRef = useRef(open)
  const [pressed, setPressed] = useState(false)
  const [spinning, setSpinning] = useState(false)

  // The morph. One rAF loop over the eased curve, writing the two paths and
  // the two group transforms; nothing is measured, so nothing is forced.
  useEffect(() => {
    if (reducedMotion) return
    if (paintedRef.current === open) return
    paintedRef.current = open
    const mark = markRef.current
    mark?.style.setProperty('will-change', 'transform')
    let raf = 0
    let start = 0
    const paint = (frame: LabTeeFrame) => {
      rotateRef.current?.setAttribute('transform', frame.rotateTransform)
      skewRef.current?.setAttribute('transform', frame.skewTransform)
      stemRef.current?.setAttribute('d', frame.stemPath)
      barRef.current?.setAttribute('d', frame.barPath)
    }
    const step = (now: number) => {
      if (!start) start = now
      const frame = labTeeFrameAt(now - start, open)
      paint(frame)
      const done = open ? frame.progress >= 1 : frame.progress <= 0
      if (done) {
        mark?.style.removeProperty('will-change')
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      mark?.style.removeProperty('will-change')
      // A morph cut short still leaves the mark on the state it was heading
      // for: an interrupted × is not a resting shape.
      paint(open ? LAB_TEE_CROSS : LAB_TEE_REST)
    }
  }, [open, reducedMotion])

  // The first view. It ends on its own, or on the first touch anywhere — and
  // either way it counts as seen, so it never runs a second time.
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

  const rest = open ? LAB_TEE_CROSS : LAB_TEE_REST
  const classes = ['lab-super']
  if (open) classes.push('is-open')
  if (pressed) classes.push('is-pressed')
  if (spinning) classes.push(reducedMotion ? 'is-arriving' : 'is-spinning')
  if (hint && !open) classes.push('has-hint')

  return (
    <button
      type="button"
      className={classes.join(' ')}
      data-testid="lab-super"
      data-open={open ? 'true' : 'false'}
      data-hint={hint && !open ? 'true' : 'false'}
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
              ref={markRef}
              className="lab-super-mark"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {reducedMotion ? (
                // Reduced motion never morphs: the two shapes cross-fade, and
                // the mark is drawn twice so neither has to be rebuilt.
                <>
                  <g className="lab-super-letter"><Tee frame={LAB_TEE_REST} /></g>
                  <g className="lab-super-cross"><Tee frame={LAB_TEE_CROSS} /></g>
                </>
              ) : (
                <g ref={rotateRef} transform={rest.rotateTransform}>
                  <g ref={skewRef} transform={rest.skewTransform}>
                    <path ref={stemRef} d={rest.stemPath} />
                    <path ref={barRef} d={rest.barPath} />
                  </g>
                </g>
              )}
            </svg>
          </span>
        </span>
      </span>
      <span className="lab-super-stop" aria-hidden="true" />
    </button>
  )
}
