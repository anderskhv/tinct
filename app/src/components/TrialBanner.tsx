import { useState } from 'react'
import { useTierContext } from '../contexts/TierContext'

interface TrialBannerProps {
  onSubscribe: () => void
}

export function TrialBanner({ onSubscribe }: TrialBannerProps) {
  const { isTrial, trialDaysRemaining, trialExpired } = useTierContext()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Trial expiring soon (3 days or less)
  if (isTrial && trialDaysRemaining <= 3) {
    return (
      <div className="trial-banner trial-banner-warning">
        <span className="trial-banner-text">
          Your free trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}. Subscribe to keep Premium features.
        </span>
        <button className="trial-banner-cta" onClick={onSubscribe}>Subscribe — $5/mo</button>
        <button className="trial-banner-dismiss" onClick={() => setDismissed(true)}>&times;</button>
      </div>
    )
  }

  // Trial expired
  if (trialExpired) {
    return (
      <div className="trial-banner trial-banner-expired">
        <span className="trial-banner-text">
          Your free trial has ended. Subscribe to restore AI chat, audiobook, Cast, and more.
        </span>
        <button className="trial-banner-cta" onClick={onSubscribe}>Subscribe — $5/mo</button>
        <button className="trial-banner-dismiss" onClick={() => setDismissed(true)}>&times;</button>
      </div>
    )
  }

  // Active trial with plenty of time — show subtle indicator
  if (isTrial && trialDaysRemaining <= 10) {
    return (
      <div className="trial-banner trial-banner-info">
        <span className="trial-banner-text">
          Premium trial — {trialDaysRemaining} days remaining
        </span>
        <button className="trial-banner-dismiss" onClick={() => setDismissed(true)}>&times;</button>
      </div>
    )
  }

  return null
}
