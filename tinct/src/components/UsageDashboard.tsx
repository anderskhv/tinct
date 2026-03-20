import type { UserProfile } from '../types'

interface UsageDashboardProps {
  profile: UserProfile | null
  onClose: () => void
  onTopUp: (amountCents: number) => void
  isAnonymous: boolean
  onSignIn: () => void
}

const TOP_UP_OPTIONS = [
  { cents: 500, label: '$5', messages: '~150 messages' },
  { cents: 1000, label: '$10', messages: '~300 messages' },
  { cents: 2000, label: '$20', messages: '~600 messages' },
]

export function UsageDashboard({ profile, onClose, onTopUp, isAnonymous, onSignIn }: UsageDashboardProps) {
  const balanceCents = profile?.token_balance_cents ?? 0
  const balanceDollars = (balanceCents / 100).toFixed(2)
  const totalUsed = profile?.total_tokens_used ?? 0

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="usage-card" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">&times;</button>

        <h2 className="auth-title">Your Balance</h2>

        {isAnonymous ? (
          <div className="usage-anon">
            <p className="usage-anon-text">Sign in to purchase AI message credits and sync your reading across devices.</p>
            <button className="auth-submit" onClick={onSignIn}>Sign in</button>
          </div>
        ) : (
          <>
            <div className="usage-balance">
              <span className="usage-balance-amount">${balanceDollars}</span>
              <span className="usage-balance-label">remaining</span>
            </div>

            {totalUsed > 0 && (
              <p className="usage-total">Total tokens used: {totalUsed.toLocaleString()}</p>
            )}

            <div className="usage-topup-section">
              <h3 className="usage-topup-title">Top up</h3>
              <div className="usage-topup-grid">
                {TOP_UP_OPTIONS.map(opt => (
                  <button
                    key={opt.cents}
                    className="usage-topup-button"
                    onClick={() => onTopUp(opt.cents)}
                  >
                    <span className="usage-topup-amount">{opt.label}</span>
                    <span className="usage-topup-msgs">{opt.messages}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="usage-pricing-info">
              <h4>Transparent pricing</h4>
              <p>Each AI message costs ~$0.034 (2.5x our API cost of ~$0.014).</p>
              <p>Reading is always free. You only pay for AI chat.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
