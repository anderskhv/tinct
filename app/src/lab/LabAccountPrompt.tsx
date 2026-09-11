import { useEffect } from 'react'
import { LAB_COPY } from './labCopy'
import { labSignInHref, type LabAiAction } from './labAccountPrompt'

interface LabAccountSheetProps {
  open: boolean
  /** Which AI action was held back; kept on the sheet for tests and analytics, not shown. */
  action: LabAiAction
  /** Where sign-in should return to (the reader's current URL). */
  returnTo: string
  onClose: () => void
  desktop?: boolean
}

/**
 * The account sheet shown on an anonymous reader's second AI action. The
 * held-back turn is never sent; closing the sheet returns to reading. Same
 * overlay pattern as LabSettingsSheet (bottom sheet on phones, popover on
 * desktop), one title, one sentence, a cream pill and a text link.
 */
export function LabAccountSheet({ open, action, returnTo, onClose, desktop = false }: LabAccountSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, open])
  if (!open) return null
  return (
    <div
      className={`lab-account-overlay${desktop ? ' is-desktop-popover' : ''}`}
      data-testid="lab-account-sheet"
      data-action={action}
      onClick={onClose}
    >
      <section
        className="lab-account-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-account-title"
        onClick={event => event.stopPropagation()}
      >
        <span className="lab-ss-grabber" aria-hidden="true" />
        <button
          type="button"
          className="lab-account-close"
          onClick={onClose}
          aria-label={LAB_COPY.accountDismiss}
          data-testid="lab-account-dismiss"
        >
          ×
        </button>
        <p className="lab-account-eyebrow">{LAB_COPY.accountEyebrow}</p>
        <h2 className="lab-account-title" id="lab-account-title">{LAB_COPY.accountTitle}</h2>
        <p className="lab-account-body">{LAB_COPY.accountBody}</p>
        <a className="lab-account-primary" href={labSignInHref('create', returnTo)} data-testid="lab-account-create">
          {LAB_COPY.accountCreate}
        </a>
        <a className="lab-account-secondary" href={labSignInHref('signin', returnTo)} data-testid="lab-account-sign-in">
          {LAB_COPY.accountSignIn}
        </a>
      </section>
    </div>
  )
}

interface LabSecondBookNudgeProps {
  returnTo: string
  onDismiss: () => void
}

/** One quiet line under the reader header for an anonymous reader's second book. */
export function LabSecondBookNudge({ returnTo, onDismiss }: LabSecondBookNudgeProps) {
  return (
    <p className="lab-account-nudge" data-testid="lab-second-book-nudge">
      <span>
        {LAB_COPY.secondBookNudge}
        <a href={labSignInHref('create', returnTo)} data-testid="lab-second-book-nudge-link">{LAB_COPY.secondBookNudgeLink}</a>
      </span>
      <button
        type="button"
        className="lab-account-nudge-dismiss"
        onClick={onDismiss}
        aria-label={LAB_COPY.secondBookNudgeDismiss}
        data-testid="lab-second-book-nudge-dismiss"
      >
        ×
      </button>
    </p>
  )
}
