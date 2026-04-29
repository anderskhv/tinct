import { useState, useEffect, useLayoutEffect } from 'react'

export interface TourStep {
  id: string
  /** Section name shown as the bubble headline (e.g. "Chat companion"). */
  headline: string
  /** data-tour value of element to highlight. Omit for fullscreen step (mobile views). */
  selector?: string
  copy: string
  /** Optional bullet list rendered under the copy (e.g. example chat prompts). */
  examples?: string[]
  /** Called when the step becomes active (e.g. setActiveView, setPanelTab). */
  setup?: () => void
  /** Intro/outro step — no backdrop dim, no cutout. Bubble is centered on screen. */
  intro?: boolean
  outro?: boolean
}

interface Props {
  open: boolean
  steps: TourStep[]
  onClose: () => void
}

const SETUP_DELAY_MS = 220

export function FeatureTour({ open, steps, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // Reset index whenever the tour reopens.
  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  const step = steps[index]

  // Run setup + measure target on every step change.
  useEffect(() => {
    if (!open || !step) return
    step.setup?.()
    if (!step.selector) {
      setRect(null)
      return
    }
    // Setup may scroll/open panels; wait for layout to settle before measuring.
    // The first measure (220ms) catches most cases; the second (450ms) catches
    // the side-panel slide-in transition (~320ms) and any late layout shifts.
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.selector}"]`)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    const t1 = window.setTimeout(measure, SETUP_DELAY_MS)
    const t2 = window.setTimeout(measure, 450)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [open, step])

  // Re-measure on resize so the cutout stays aligned.
  useLayoutEffect(() => {
    if (!open || !step?.selector) return
    const remeasure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.selector}"]`)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    window.addEventListener('resize', remeasure)
    return () => window.removeEventListener('resize', remeasure)
  }, [open, step])

  if (!open || !step) return null

  const isLast = index === steps.length - 1

  // Bubble positioning. Intro/outro steps center vertically + horizontally.
  // With a target rect: place to the side that has more room (below by default,
  // above if too low; left of target if target is on the right edge).
  // No target + non-intro: centered card near bottom of viewport.
  const bubbleStyle: React.CSSProperties = (() => {
    if (step.intro || step.outro) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
    }
    if (!rect) {
      // Mobile chat/feed/cast steps land here. 100px bottom margin clears the
      // mobile tab-bar (~70-80px) so the user can see which mobile-view tab
      // is active and the active-tab indicator changing between steps.
      return { left: '50%', bottom: 100, transform: 'translateX(-50%)' }
    }
    const margin = 22
    // Examples list adds ~75px to bubble height. Underestimating used to leave
    // the chat-step bubble overlapping the bottom-bar cutout (Anders, 2026-04-29).
    const bubbleH = step.examples && step.examples.length > 0 ? 310 : 220
    const bubbleW = Math.min(360, window.innerWidth - 24)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceLeft = rect.left
    const placeBelow = spaceBelow > bubbleH + margin + 24
    // Side-panel cutouts are tall and pinned right — prefer placing the bubble
    // to their LEFT instead of trying to fit above/below.
    const placeLeft = !placeBelow && spaceLeft > bubbleW + margin + 24
    if (placeLeft) {
      const left = Math.max(12, rect.left - bubbleW - margin)
      const top = Math.max(12, Math.min(window.innerHeight - bubbleH - 12, rect.top + rect.height / 2 - bubbleH / 2))
      return { top, left, width: bubbleW }
    }
    const top = placeBelow ? rect.bottom + margin : Math.max(12, rect.top - bubbleH - margin)
    let left = rect.left + rect.width / 2 - bubbleW / 2
    left = Math.max(12, Math.min(window.innerWidth - bubbleW - 12, left))
    return { top, left, width: bubbleW }
  })()

  return (
    <div className="feature-tour-root" role="dialog" aria-label="Feature tour">
      {(step.intro || step.outro) ? null : rect ? (
        <div
          className="feature-tour-cutout"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      ) : (
        <div className="feature-tour-backdrop" />
      )}

      <div className="feature-tour-bubble" style={bubbleStyle}>
        <div className="feature-tour-bubble-head">
          <span className="feature-tour-counter">{index + 1} of {steps.length}</span>
          <button
            type="button"
            className="feature-tour-skip"
            onClick={onClose}
          >
            Skip tour
          </button>
        </div>
        <h3 className="feature-tour-headline">{step.headline}</h3>
        <div className="feature-tour-copy">{step.copy}</div>
        {step.examples && step.examples.length > 0 && (
          <ul className="feature-tour-examples">
            {step.examples.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
        )}
        <div className="feature-tour-foot">
          {index > 0 && (
            <button
              type="button"
              className="feature-tour-back"
              onClick={() => setIndex(i => i - 1)}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            className="feature-tour-next"
            onClick={() => {
              if (isLast) onClose()
              else setIndex(i => i + 1)
            }}
          >
            {isLast ? 'Begin reading →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
