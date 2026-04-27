import { useState, useEffect } from 'react'
import { useTierContext } from '../contexts/TierContext'
import { storage } from '../services/storage'

interface TrialBannerProps {
  onSubscribe: () => void
  onCreateAccount?: () => void
}

// Cloud-synced via the storage abstraction. Was previously raw localStorage,
// which meant dismissing the banner on desktop didn't propagate to mobile or
// Boox — Anders saw the trial-ended banner reappear only on Boox even after
// he'd dismissed it elsewhere (B17). Same key name is preserved so existing
// localStorage entries are read on first load (storage.get falls back to
// localStorage when the cloud cache is empty).
const DISMISS_KEY = 'tinct-banner-dismissed'

export function TrialBanner({ onSubscribe, onCreateAccount }: TrialBannerProps) {
  const { tier, isTrial, trialDaysRemaining, trialExpired } = useTierContext()
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissal when the tier state changes — a new banner is a new ask.
  useEffect(() => {
    try {
      const stored = storage.get<{ state: string; at: number }>(DISMISS_KEY)
      if (stored && typeof stored === 'object') {
        if (stored.state === bannerState() && Date.now() - stored.at < 24 * 60 * 60 * 1000) {
          setDismissed(true)
          return
        }
      }
    } catch { /* ignore */ }
    setDismissed(false)
  }, [tier, isTrial, trialExpired])

  function bannerState(): string {
    if (tier === 'none') return 'anonymous'
    if (trialExpired) return 'expired'
    if (isTrial && trialDaysRemaining <= 3) return 'trial-warning'
    if (isTrial) return 'trial-info'
    return 'none'
  }

  function handleDismiss() {
    setDismissed(true)
    try {
      storage.set(DISMISS_KEY, { state: bannerState(), at: Date.now() })
    } catch { /* ignore */ }
  }

  if (dismissed) return null

  // Anonymous — pitch the free account, no pricing
  if (tier === 'none' && onCreateAccount) {
    return (
      <div className="trial-banner trial-banner-anon">
        <span className="trial-banner-text">
          <strong>Save your place across devices.</strong> AI companion, audiobook, Feed. Free account →
        </span>
        <button className="trial-banner-cta" onClick={onCreateAccount}>Create account</button>
        <button className="trial-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">&times;</button>
      </div>
    )
  }

  // Trial expiring soon (3 days or less)
  if (isTrial && trialDaysRemaining <= 3) {
    return (
      <div className="trial-banner trial-banner-warning">
        <span className="trial-banner-text">
          Your free trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}. Keep Premium for $3/mo.
        </span>
        <button className="trial-banner-cta" onClick={onSubscribe}>Subscribe · $3/mo</button>
        <button className="trial-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">&times;</button>
      </div>
    )
  }

  // Trial expired
  if (trialExpired) {
    return (
      <div className="trial-banner trial-banner-expired">
        <span className="trial-banner-text">
          Your free trial has ended. Reading stays free forever. Subscribe for $3/mo to restore AI chat, audiobook, and Cast.
        </span>
        <button className="trial-banner-cta" onClick={onSubscribe}>Subscribe · $3/mo</button>
        <button className="trial-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">&times;</button>
      </div>
    )
  }

  // Active trial — subtle state reminder
  if (isTrial && trialDaysRemaining <= 30) {
    return (
      <div className="trial-banner trial-banner-info">
        <span className="trial-banner-text">
          <strong>Premium trial active.</strong> {trialDaysRemaining} days remaining. Cancels automatically.
        </span>
        <button className="trial-banner-dismiss" onClick={handleDismiss} aria-label="Dismiss">&times;</button>
      </div>
    )
  }

  return null
}
