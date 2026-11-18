/**
 * The reader's one wait indicator: the Play button's ring (LoadingIcon), on the
 * control that was tapped or in the exact area that is loading. Never a popup.
 *
 * - Appears only after LAB_WAIT_DELAY_MS, so quick work never flashes it.
 * - The status wording the wait had before stays, for assistive technology only
 *   (`role="status"`, visually hidden), so nothing new is read on screen.
 * - Static under prefers-reduced-motion (lab.css `.lab-audio-spinner`).
 * - Errors are not waits: they keep their own text and surface.
 *
 * The plain-JS pages (library, Add a book) draw the same ring with
 * public/lab/wait-ring.js.
 */
import { useEffect, useState } from 'react'
import { LoadingIcon } from './LabReaderIcons'

export const LAB_WAIT_DELAY_MS = 150

/** True once `delayMs` has passed since mount; false again when the delay changes. */
export function useLabWaitShown(delayMs: number = LAB_WAIT_DELAY_MS): boolean {
  const [shown, setShown] = useState(delayMs <= 0)
  useEffect(() => {
    if (delayMs <= 0) { setShown(true); return }
    setShown(false)
    const timer = window.setTimeout(() => setShown(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [delayMs])
  return shown
}

export function LabWait({ label, size = 21, className, delayMs = LAB_WAIT_DELAY_MS, live = true, testId = 'lab-wait' }: {
  /** The wait's existing wording, for screen readers only. */
  label: string
  /** The ring's box in px; the Play button's is 21. */
  size?: number
  className?: string
  delayMs?: number
  /** False inside a parent that is already a live region (`aria-live` / `role="status"`). */
  live?: boolean
  testId?: string
}) {
  const shown = useLabWaitShown(delayMs)
  return (
    <span
      className={`lab-wait${shown ? ' is-shown' : ''}${className ? ` ${className}` : ''}`}
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
      aria-busy={shown || undefined}
      data-testid={testId}
      data-wait={shown ? 'shown' : 'pending'}
      style={{ ['--lab-wait-size' as string]: `${size}px` }}
    >
      {shown && <LoadingIcon size={size} />}
      <span className="lab-visually-hidden">{shown ? label : ''}</span>
    </span>
  )
}
