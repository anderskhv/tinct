import type { UserProfile } from '../types'

type CheckoutType = 'subscription' | 'chat_pack_100' | 'chat_pack_200'

interface UsageDashboardProps {
  profile: UserProfile | null
  onClose: () => void
  onCheckout: (type: CheckoutType) => void
  onManageSubscription: () => void
  isAnonymous: boolean
  isSubscribed: boolean
  onSignIn: () => void
  messagesRemaining: number
  monthlyRemaining: number
  messageBalance: number
}

export function UsageDashboard({
  profile, onClose, onCheckout, onManageSubscription,
  isAnonymous, isSubscribed, onSignIn,
  messagesRemaining, monthlyRemaining, messageBalance,
}: UsageDashboardProps) {
  const monthlyUsed = 100 - monthlyRemaining
  const isTrial = !isSubscribed && profile?.subscription_status == null

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="usage-card" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">&times;</button>

        <h2 className="auth-title">
          {isSubscribed ? 'Your Usage' : 'Go Premium'}
        </h2>

        {isAnonymous ? (
          <div className="usage-anon">
            <p className="usage-anon-text">Sign in to access AI chat, audiobook, Cast, and more. Free for 30 days.</p>
            <button className="auth-submit" onClick={onSignIn}>Sign in</button>
          </div>
        ) : isSubscribed ? (
          <>
            {/* Monthly quota */}
            <div className="usage-quota">
              <div className="usage-quota-header">
                <span className="usage-quota-label">Monthly messages</span>
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

            {/* Buy more when running low */}
            {messagesRemaining < 20 && (
              <div className="usage-topup-section">
                <h3 className="usage-topup-title">Need more messages?</h3>
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
            )}

            <button className="usage-manage" onClick={onManageSubscription}>
              Manage subscription
            </button>
          </>
        ) : (
          <>
            {/* Not subscribed — upsell */}
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
              <p className="usage-reading-free">Reading is always free. You only pay for premium features.</p>
            </div>

            {/* Chat packs available even without subscription */}
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
          </>
        )}
      </div>
    </div>
  )
}
