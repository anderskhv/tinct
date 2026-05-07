import { useEffect, useRef } from 'react'
import type { PitchKind } from './PitchPanel'

/**
 * Popover surfaced when an anonymous / free-post-trial user clicks the
 * audiobook button in the reader. Replaces the previous behavior of opening
 * a non-functional player UI.
 *
 * Two variants:
 *   - anonymous       → "Create a free account" CTA
 *   - free-post-trial → "Upgrade to Premium" CTA
 *
 * Premium users with audio access never see this — they get the real player.
 */

export interface AudioPitchPopoverProps {
  open: boolean
  kind: PitchKind  // 'anonymous' | 'free-post-trial'
  onClose: () => void
  onCreateAccount?: () => void
  onSignIn?: () => void
  onUpgrade?: () => void
  /** Anchor element — popover positions relative to this. */
  anchorEl?: HTMLElement | null
}

export function AudioPitchPopover({ open, kind, onClose, onCreateAccount, onSignIn, onUpgrade, anchorEl }: AudioPitchPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Click outside dismisses
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && e.target !== anchorEl) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose, anchorEl])

  // Escape closes
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} className="audio-pitch-popover" role="dialog" aria-label="Audiobook">
      {kind === 'anonymous' ? (
        <>
          <h3 className="pitch-headline">Synced audiobook</h3>
          <p className="pitch-body">
            Listen and read at the same time. The audio stays in sync with the text. Pause anywhere,
            resume on any device.
          </p>
          <button className="pitch-cta-primary" onClick={onCreateAccount}>Create a free account</button>
          <p className="pitch-fineprint">Audio included free for 30 days.</p>
          <button className="pitch-cta-secondary" onClick={onSignIn}>Already have an account? Sign in</button>
        </>
      ) : (
        <>
          <h3 className="pitch-headline">Audiobook is Premium</h3>
          <p className="pitch-body">Synced narration that picks up where you left off.</p>
          <button className="pitch-cta-primary" onClick={onUpgrade}>Upgrade for $3/mo</button>
        </>
      )}
    </div>
  )
}
