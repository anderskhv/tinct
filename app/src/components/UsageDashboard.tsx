import { useState } from 'react'
import type { UserProfile } from '../types'

type CheckoutType = 'subscription' | 'chat_pack_100' | 'chat_pack_200'

interface UsageDashboardProps {
  profile: UserProfile | null
  onClose: () => void
  onCheckout: (type: CheckoutType) => void
  onCancelSubscription: () => Promise<void>
  isAnonymous: boolean
  isSubscribed: boolean
  isCanceled: boolean
  onSignIn: () => void
  messagesRemaining: number
  monthlyRemaining: number
  messageBalance: number
  session: { access_token: string } | null
}

export function UsageDashboard({
  profile, onClose, onCheckout, onCancelSubscription,
  isAnonymous, isSubscribed, isCanceled, onSignIn,
  messagesRemaining, monthlyRemaining, messageBalance, session,
}: UsageDashboardProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const monthlyUsed = 100 - monthlyRemaining

  // Calculate reset/end date
  const periodEndDate = profile?.subscription_period_end ? new Date(profile.subscription_period_end) : null
  const resetDate = (() => {
    if (periodEndDate) return periodEndDate
    if (profile?.period_start) {
      const d = new Date(profile.period_start)
      d.setDate(d.getDate() + 30)
      return d
    }
    return null
  })()
  const resetLabel = resetDate
    ? resetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null

  const handleCancel = async () => {
    setCanceling(true)
    try {
      await onCancelSubscription()
      setShowCancelConfirm(false)
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="usage-card" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">&times;</button>

        <h2 className="auth-title">
          {isSubscribed ? 'Your Subscription' : 'Go Premium'}
        </h2>

        {isAnonymous ? (
          <div className="usage-anon">
            <p className="usage-anon-text">
              Create a free account to get 30 days of Premium — AI chat, audiobook, Cast, and more. No credit card needed.
            </p>
            <button className="auth-submit" onClick={onSignIn}>Create free account</button>
            <p className="usage-free-note">
              Reading is always free, even without an account. All books, all editions, highlights, and notes — no charge, ever.
            </p>
          </div>
        ) : isSubscribed ? (
          <>
            {/* Subscription status */}
            <div className="usage-status">
              {isCanceled ? (
                <p className="usage-status-text usage-status-canceled">
                  Canceled — access until {resetLabel || 'end of period'}
                </p>
              ) : (
                <p className="usage-status-text usage-status-active">
                  Premium active — renews {resetLabel || 'next month'}
                </p>
              )}
            </div>

            {/* Monthly quota */}
            <div className="usage-quota">
              <div className="usage-quota-header">
                <span className="usage-quota-label">Monthly messages{resetLabel ? ` — resets ${resetLabel}` : ''}</span>
                <span className="usage-quota-count">{monthlyRemaining} of 100 remaining</span>
              </div>
              <div className="usage-progress-bar">
                <div
                  className="usage-progress-fill"
                  style={{ width: `${Math.min(100, monthlyUsed)}%` }}
                />
              </div>
            </div>

            {/* Extra message balance */}
            {messageBalance > 0 && (
              <div className="usage-extra">
                + {messageBalance} extra messages from chat packs
              </div>
            )}

            {/* Total remaining */}
            <div className="usage-total-remaining">
              <span className="usage-total-count">{messagesRemaining}</span>
              <span className="usage-total-label">messages available</span>
            </div>

            {/* Buy more */}
            <div className="usage-topup-section">
              <h3 className="usage-topup-title">
                {messagesRemaining < 20 ? 'Running low — buy more messages' : 'Buy extra messages'}
              </h3>
              <div className="usage-topup-grid">
                <button className="usage-topup-button" onClick={() => onCheckout('chat_pack_100')}>
                  <span className="usage-topup-amount">$3</span>
                  <span className="usage-topup-msgs">100 messages</span>
                </button>
                <button className="usage-topup-button" onClick={() => onCheckout('chat_pack_200')}>
                  <span className="usage-topup-amount">$5</span>
                  <span className="usage-topup-msgs">200 messages</span>
                </button>
              </div>
              <p className="usage-topup-note">Extra messages never expire and carry across months.</p>
            </div>

            {/* Subscription management */}
            <div className="usage-subscription-actions">
              {isCanceled ? (
                <button className="usage-resubscribe" onClick={() => onCheckout('subscription')}>
                  Resubscribe — $5/month
                </button>
              ) : showCancelConfirm ? (
                <div className="usage-cancel-confirm">
                  <p className="usage-cancel-text">
                    Are you sure? You'll keep Premium until {resetLabel || 'the end of your billing period'}. After that, you can still read for free — all books, editions, highlights, and notes stay yours.
                  </p>
                  <div className="usage-cancel-buttons">
                    <button className="usage-cancel-yes" onClick={handleCancel} disabled={canceling}>
                      {canceling ? 'Canceling...' : 'Yes, cancel'}
                    </button>
                    <button className="usage-cancel-no" onClick={() => setShowCancelConfirm(false)}>
                      Keep subscription
                    </button>
                  </div>
                </div>
              ) : (
                <button className="usage-manage" onClick={() => setShowCancelConfirm(true)}>
                  Cancel subscription
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Not subscribed — subscribe pitch */}
            <div className="usage-subscribe-pitch">
              <p className="usage-price">$5 <span className="usage-price-period">/ month</span></p>
              <ul className="usage-feature-list">
                <li>100 AI chat messages per month</li>
                <li>Audiobook for every book</li>
                <li>Cast — spoiler-free character tracker</li>
                <li>Intelligent notes with AI cleanup</li>
                <li>Cross-device sync</li>
              </ul>
              <button className="auth-submit" onClick={() => onCheckout('subscription')}>
                Subscribe — $5/month
              </button>
            </div>

            {/* Chat packs without subscription */}
            <div className="usage-topup-section">
              <h3 className="usage-topup-title">Or buy messages only</h3>
              <div className="usage-topup-grid">
                <button className="usage-topup-button" onClick={() => onCheckout('chat_pack_100')}>
                  <span className="usage-topup-amount">$3</span>
                  <span className="usage-topup-msgs">100 messages</span>
                </button>
                <button className="usage-topup-button" onClick={() => onCheckout('chat_pack_200')}>
                  <span className="usage-topup-amount">$5</span>
                  <span className="usage-topup-msgs">200 messages</span>
                </button>
              </div>
            </div>

            <div className="usage-free-section">
              <p className="usage-free-note">
                Reading is always free. All books, all editions, highlights, and notes — no charge, ever. Premium adds AI chat, audiobook, and Cast.
              </p>
              <p className="usage-affordability">
                Can't afford it? <a href="mailto:anders@tinct.app" className="usage-email-link">Email us</a> — we'll work something out.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
