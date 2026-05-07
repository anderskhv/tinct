import { useEffect, useState } from 'react'

/**
 * Top-of-reader banner shown to anonymous users whose device localStorage has
 * `tinct:last-user-id` set — i.e., a known account previously signed in here.
 * Encourages them to sign back in. Dismissible for the current session.
 *
 * Doesn't show:
 *   - if user is currently signed in (caller doesn't render)
 *   - if no last-user-id (fresh device)
 *   - if dismissed in this session
 *   - if onboarding/preface is in front of the reader (caller doesn't render)
 */

interface Props {
  onSignIn: () => void
}

const DISMISS_KEY = 'tinct:signin-banner-dismissed-session'

export function SignInBanner({ onSignIn }: Props) {
  const [dismissed, setDismissed] = useState(true)  // start hidden, decide in effect

  useEffect(() => {
    let hasLastUser = false
    try {
      hasLastUser = !!localStorage.getItem('tinct:last-user-id')
    } catch { /* ignore */ }
    let isDismissed = false
    try {
      isDismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch { /* ignore */ }
    setDismissed(!hasLastUser || isDismissed)
  }, [])

  if (dismissed) return null

  function handleDismiss() {
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setDismissed(true)
  }

  return (
    <div className="signin-banner" role="status">
      <span className="signin-banner-text">
        Welcome back. Sign in to keep your highlights, journal, and reading position synced.
      </span>
      <div className="signin-banner-actions">
        <button className="signin-banner-cta" onClick={onSignIn}>Sign in</button>
        <button className="signin-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">×</button>
      </div>
    </div>
  )
}
