interface AccountDecisionProps {
  bookTitle: string
  bookAuthor: string
  onCreateAccount: () => void
  onSkip: () => void
  onShowPricing: () => void
}

export function AccountDecision({ bookTitle, bookAuthor, onCreateAccount, onSkip, onShowPricing }: AccountDecisionProps) {
  return (
    <div className="account-decision">
      <div className="account-decision-card">
        <p className="account-decision-book">
          You picked <strong>{bookTitle}</strong> — {bookAuthor}
        </p>

        <h2 className="account-decision-title">
          Get the most out of your reading
        </h2>

        <p className="account-decision-subtitle">
          Create a free account and get the full Premium experience for your first 30 days. No credit card, no auto-renew.
        </p>

        <ul className="account-decision-features">
          <li>
            <span className="account-decision-check">&#10003;</span>
            <div>
              <strong>Side-by-side reading</strong>
              <span>Read the original next to a modern translation</span>
            </div>
          </li>
          <li>
            <span className="account-decision-check">&#10003;</span>
            <div>
              <strong>Highlights, notes &amp; sync</strong>
              <span>Mark passages and pick up where you left off on any device</span>
            </div>
          </li>
          <li className="account-decision-premium-section">
            <span className="account-decision-divider-label">Premium — free for 30 days</span>
          </li>
          <li>
            <span className="account-decision-check premium-check">&#9733;</span>
            <div>
              <strong>AI reading companion</strong>
              <span>Ask questions about any passage and get context as you read</span>
            </div>
          </li>
          <li>
            <span className="account-decision-check premium-check">&#9733;</span>
            <div>
              <strong>Cast tracker &amp; audiobook</strong>
              <span>Spoiler-free character guide and audio that stays in sync with your reading position</span>
            </div>
          </li>
          <li>
            <span className="account-decision-check premium-check">&#9733;</span>
            <div>
              <strong>Offline mode &amp; export</strong>
              <span>Download books for offline reading and export your journal when you're done</span>
            </div>
          </li>
        </ul>

        <button className="account-decision-cta" onClick={onCreateAccount}>
          Create free account
        </button>

        <button className="account-decision-skip" onClick={onSkip}>
          Continue without account
        </button>

        <button className="account-decision-pricing" onClick={onShowPricing}>
          See full pricing &rarr;
        </button>
      </div>
    </div>
  )
}
