import { useEffect, useState } from 'react'
import { isAndroidNative, isHomeApp, requestHomeApp } from '../utils/homeRole'

const DISMISS_KEY = 'tinct-home-role-dismissed'

/**
 * First-run prompt on Capacitor Android (primary use case: Boox-style e-readers).
 * Offers to set Tinct as the default home app so pressing the device's Home
 * button / power button lands straight in the book. One-shot: either the user
 * accepts, or we remember the dismissal and never nag again.
 *
 * No-ops on web, iOS, and on Android when the user already holds the role.
 */
export function HomeRolePrompt() {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (!isAndroidNative()) return
      try {
        if (localStorage.getItem(DISMISS_KEY)) return
      } catch { /* ignore */ }
      const already = await isHomeApp()
      if (cancelled || already) return
      setVisible(true)
    }
    check()
    return () => { cancelled = true }
  }, [])

  if (!visible) return null

  async function onAccept() {
    setBusy(true)
    const granted = await requestHomeApp()
    setBusy(false)
    if (granted) {
      try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
      setVisible(false)
    }
    // If not granted, leave the prompt up — user can dismiss or retry.
  }

  function onDismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }

  return (
    <div className="home-role-overlay" role="dialog" aria-labelledby="home-role-title">
      <div className="home-role-modal">
        <p className="home-role-eyebrow">Reading on an e-reader?</p>
        <h2 id="home-role-title" className="home-role-title">Wake straight into your book.</h2>
        <p className="home-role-body">
          Make Tinct your home screen and the device's home button always lands
          here. Other apps are still one back-swipe away.
        </p>
        <div className="home-role-actions">
          <button className="home-role-secondary" onClick={onDismiss} disabled={busy}>
            Not now
          </button>
          <button className="home-role-primary" onClick={onAccept} disabled={busy}>
            {busy ? 'Opening…' : 'Make Tinct home'}
          </button>
        </div>
      </div>
    </div>
  )
}
