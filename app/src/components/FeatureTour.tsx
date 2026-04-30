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
  /** Autoplay loop — used by the landing-page demo embed. Hides Skip/Next/Back
   *  controls, advances through steps automatically every AUTOPLAY_STEP_MS,
   *  and loops back to step 0 after the outro. Manual onClose is suppressed. */
  autoplay?: boolean
}

const SETUP_DELAY_MS = 220
const AUTOPLAY_STEP_MS = 7000
const AUTOPLAY_RESTART_MS = 2200

export function FeatureTour({ open, steps, onClose, autoplay = false }: Props) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  // Demo-mode pause flag — toggled by `tinct:tour-pause` / `tinct:tour-resume`
  // postMessages from the landing-page parent. When paused, the autoplay
  // timer is suppressed; user-initiated jumps still work.
  const [isPaused, setIsPaused] = useState(false)

  // Reset index whenever the tour reopens.
  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  // Autoplay loop — advance every AUTOPLAY_STEP_MS, restart after outro.
  // Suppressed when paused.
  useEffect(() => {
    if (!open || !autoplay || isPaused || steps.length === 0) return
    const isLastStep = index >= steps.length - 1
    const delay = isLastStep ? AUTOPLAY_RESTART_MS : AUTOPLAY_STEP_MS
    const t = window.setTimeout(() => {
      setIndex(i => (i >= steps.length - 1 ? 0 : i + 1))
    }, delay)
    return () => window.clearTimeout(t)
  }, [open, autoplay, isPaused, index, steps.length])

  // Broadcast step changes to the parent window so the landing-page demo
  // iframe can sync its right-side description to the currently-highlighted
  // feature. Only fires in autoplay mode (i.e. the demo embed). Same-origin
  // postMessage; the parent listener filters by message type.
  useEffect(() => {
    if (!open || !autoplay || !steps[index]) return
    if (typeof window === 'undefined' || window.parent === window) return
    try {
      window.parent.postMessage(
        { type: 'tinct:tour-step', stepId: steps[index].id, index, total: steps.length },
        '*'
      )
    } catch { /* cross-origin — fine, just no sync */ }
  }, [open, autoplay, index, steps])

  // Tell the parent window the tour is ready (mounted, open, autoplay
  // configured). The landing-page demo listens for this and takes over
  // timing, sending tour-pause + driving via tour-jump messages instead.
  // This makes the right-side caption sync rock-solid because the parent
  // owns the cycle clock — the iframe is a pure follower.
  useEffect(() => {
    if (!open || !autoplay) return
    if (typeof window === 'undefined' || window.parent === window) return
    try { window.parent.postMessage({ type: 'tinct:tour-ready' }, '*') } catch { /* */ }
  }, [open, autoplay])

  // Listen for control messages from the parent window:
  //   - tinct:tour-jump   → jump to the step with matching stepId
  //   - tinct:tour-pause  → suppress autoplay (visitor wants to dwell)
  //   - tinct:tour-resume → re-enable autoplay
  useEffect(() => {
    if (!open || !autoplay || steps.length === 0) return
    const handler = (e: MessageEvent) => {
      const data = e?.data as { type?: string; stepId?: string } | undefined
      if (!data || typeof data.type !== 'string') return
      if (data.type === 'tinct:tour-jump' && data.stepId) {
        const target = steps.findIndex(s => s.id === data.stepId)
        if (target >= 0 && target !== index) setIndex(target)
        return
      }
      if (data.type === 'tinct:tour-pause') setIsPaused(true)
      if (data.type === 'tinct:tour-resume') setIsPaused(false)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [open, autoplay, steps, index])

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

      {/* In autoplay (landing-demo) mode, hide the bubble entirely — only
          the cutout halo communicates which feature is active. The
          right-side description on the landing page provides the copy. */}
      {!autoplay && (
      <div className={`feature-tour-bubble ${autoplay ? 'feature-tour-bubble--autoplay' : ''}`} style={bubbleStyle}>
        {!autoplay && (
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
        )}
        <h3 className="feature-tour-headline">{step.headline}</h3>
        <div className="feature-tour-copy">{step.copy}</div>
        {step.examples && step.examples.length > 0 && (
          <ul className="feature-tour-examples">
            {step.examples.map((ex, i) => <li key={i}>{ex}</li>)}
          </ul>
        )}
        {!autoplay && (
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
        )}
      </div>
      )}
    </div>
  )
}
