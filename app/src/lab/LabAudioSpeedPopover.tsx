import { useLayoutEffect, useRef, type RefObject } from 'react'

/** Narration's speed range and step (listen.setSpeed clamps to the same). */
export const AUDIO_SPEED_MIN = 0.5
export const AUDIO_SPEED_MAX = 3
export const AUDIO_SPEED_STEP = 0.25

/** One step slower or faster, kept on the 0.25 grid inside 0.5–3. */
export function stepAudioSpeed(speed: number, direction: -1 | 1): number {
  const onGrid = Math.round(speed / AUDIO_SPEED_STEP) * AUDIO_SPEED_STEP
  const next = onGrid + direction * AUDIO_SPEED_STEP
  return Math.min(AUDIO_SPEED_MAX, Math.max(AUDIO_SPEED_MIN, Math.round(next * 100) / 100))
}

interface LabAudioSpeedPopoverProps {
  speed: number
  onChange: (speed: number) => void
  /** The dock's (or the phone bar's) speed button: the popover stands over it and points at it. */
  anchorRef: RefObject<HTMLElement | null>
  /** Desktop: fixed over the dock's button. Phone: placed by CSS above the bar, only its pointer follows the button. */
  desktop: boolean
}

/**
 * Playback speed (approved mockup A, 4 Nov 2026): one row — the label, Slower,
 * the speed as a figure, Faster — anchored over the speed button with a small
 * pointer. Escape and a tap outside close it (LabApp owns that), so it has no
 * Done button.
 */
export function LabAudioSpeedPopover({ speed, onChange, anchorRef, desktop }: LabAudioSpeedPopoverProps) {
  const ref = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const place = () => {
      const pop = ref.current, anchor = anchorRef.current
      if (!pop || !anchor) return
      const a = anchor.getBoundingClientRect()
      const centre = a.left + a.width / 2
      if (desktop) {
        const width = pop.offsetWidth, gutter = 12
        const left = Math.max(gutter, Math.min(window.innerWidth - width - gutter, centre - 30))
        pop.style.setProperty('--lab-speed-left', `${Math.round(left)}px`)
        pop.style.setProperty('--lab-speed-bottom', `${Math.round(window.innerHeight - a.top + 12)}px`)
        pop.style.setProperty('--lab-speed-arrow', `${Math.round(centre - left)}px`)
      } else {
        const p = pop.getBoundingClientRect()
        pop.style.setProperty('--lab-speed-arrow', `${Math.round(Math.max(22, Math.min(p.width - 22, centre - p.left)))}px`)
      }
    }
    place()
    window.addEventListener('resize', place)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null
    if (anchorRef.current) observer?.observe(anchorRef.current)
    return () => { window.removeEventListener('resize', place); observer?.disconnect() }
  }, [anchorRef, desktop, speed])

  const label = `${speed}×`
  return (
    <section
      ref={ref}
      id="lab-audio-speed-popover"
      className="lab-audio-speed-popover"
      data-testid="lab-audio-speed-popover"
      role="group"
      aria-labelledby="lab-audio-speed-title"
    >
      <span id="lab-audio-speed-title" className="lab-audio-speed-title">Playback speed</span>
      <div className="lab-audio-speed-stepper">
        <button
          type="button"
          className="lab-audio-speed-step"
          data-testid="lab-audio-speed-slower"
          aria-label="Slower"
          disabled={speed <= AUDIO_SPEED_MIN}
          onClick={() => onChange(stepAudioSpeed(speed, -1))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <output className="lab-audio-speed-value" data-testid="lab-audio-speed-value" aria-live="polite">{label}</output>
        <button
          type="button"
          className="lab-audio-speed-step"
          data-testid="lab-audio-speed-faster"
          aria-label="Faster"
          disabled={speed >= AUDIO_SPEED_MAX}
          onClick={() => onChange(stepAudioSpeed(speed, 1))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
    </section>
  )
}
