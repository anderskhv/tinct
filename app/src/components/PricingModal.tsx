interface PricingModalProps {
  onClose: () => void
  onCreateAccount?: () => void
}

const tiers = [
  {
    name: 'No account',
    price: 'Free',
    description: 'Just read',
    features: [
      { label: 'All text editions', included: true },
      { label: 'Side-by-side', included: false },
      { label: 'Highlights & notes', included: false },
      { label: 'Cross-device sync', included: false },
      { label: 'Cast tracker & audiobook', included: false },
      { label: 'AI chat', included: false },
      { label: 'Offline mode & export', included: false },
      { label: 'Reading journal', included: false },
    ],
  },
  {
    name: 'Free account',
    price: 'Free',
    description: 'Read deeply',
    badge: 'Includes 30 days of Premium',
    features: [
      { label: 'All text editions', included: true },
      { label: 'Side-by-side', included: true },
      { label: 'Highlights & notes', included: true },
      { label: 'Cross-device sync', included: true },
      { label: 'Cast tracker & audiobook', included: false },
      { label: 'AI chat', included: false },
      { label: 'Offline mode & export', included: false },
      { label: 'Reading journal', included: false },
    ],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$5/mo',
    description: 'The full experience',
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Cast tracker & audiobook', included: true },
      { label: 'AI chat (200/mo)', included: true },
      { label: 'Offline mode & export', included: true },
      { label: 'Reading journal', included: true },
    ],
  },
]

export function PricingModal({ onClose, onCreateAccount }: PricingModalProps) {
  return (
    <div className="pricing-overlay" onClick={onClose}>
      <div className="pricing-card" onClick={e => e.stopPropagation()}>
        <button className="pricing-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="pricing-title">Simple pricing</h2>
        <p className="pricing-subtitle">
          Every new account gets the full Premium experience free for 30 days. After that, continue for free or upgrade to keep Premium features.
        </p>

        <div className="pricing-grid">
          {tiers.map(tier => (
            <div key={tier.name} className={`pricing-tier ${tier.highlight ? 'pricing-tier-highlight' : ''}`}>
              <h3 className="pricing-tier-name">{tier.name}</h3>
              <p className="pricing-tier-price">{tier.price}</p>
              <p className="pricing-tier-desc">{tier.description}</p>
              {tier.badge && (
                <p className="pricing-tier-badge">{tier.badge}</p>
              )}
              <ul className="pricing-tier-features">
                {tier.features.map(f => (
                  <li key={f.label} className={f.included ? 'pricing-included' : 'pricing-excluded'}>
                    <span>{f.included ? '\u2713' : '\u2014'}</span> {f.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {onCreateAccount && (
          <button className="pricing-cta" onClick={onCreateAccount}>
            Create free account
          </button>
        )}

        <p className="pricing-sam-harris">
          If Premium is out of reach, write to contact@tinct.app. We'll work something out.
        </p>
      </div>
    </div>
  )
}
