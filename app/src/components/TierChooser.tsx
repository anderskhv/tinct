import { useState } from 'react'

export type Tier = 'premium' | 'free' | 'anonymous'

interface TierChooserProps {
  onSelect: (tier: Tier) => void
  onClose?: () => void
  bookTitle?: string
  bookAuthor?: string
}

export function TierChooser({ onSelect, onClose, bookTitle, bookAuthor }: TierChooserProps) {
  const [selected, setSelected] = useState<Tier>('premium')

  return (
    <div className="tier-chooser-overlay" onClick={onClose}>
      <div className="tier-chooser-card" onClick={e => e.stopPropagation()}>
        {onClose && (
          <button className="tier-chooser-close" onClick={onClose} aria-label="Close">&times;</button>
        )}

        {bookTitle && (
          <p className="tier-chooser-book">
            {bookTitle}{bookAuthor ? ` — ${bookAuthor}` : ''}
          </p>
        )}

        <h2 className="tier-chooser-title">How would you like to read?</h2>

        <div className="tier-chooser-options">
          <button
            type="button"
            className={`tier-chooser-option ${selected === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelected('premium')}
          >
            <div className="tier-chooser-option-header">
              <span className="tier-chooser-option-name">Premium</span>
              <span className="tier-chooser-option-badge">30 days free</span>
            </div>
            <p className="tier-chooser-option-desc">
              AI companion, Cast, audiobook, Feed. <strong>Auto-cancels at day 30</strong> unless you choose to continue. No card. No surprise charges.
            </p>
          </button>

          <button
            type="button"
            className={`tier-chooser-option ${selected === 'free' ? 'selected' : ''}`}
            onClick={() => setSelected('free')}
          >
            <div className="tier-chooser-option-header">
              <span className="tier-chooser-option-name">Free account</span>
            </div>
            <p className="tier-chooser-option-desc">
              Save your progress across devices. Reading stays free, forever.
            </p>
          </button>

          <button
            type="button"
            className={`tier-chooser-option ${selected === 'anonymous' ? 'selected' : ''}`}
            onClick={() => setSelected('anonymous')}
          >
            <div className="tier-chooser-option-header">
              <span className="tier-chooser-option-name">Keep reading — no account</span>
            </div>
            <p className="tier-chooser-option-desc">
              You can create one later. Nothing changes right now.
            </p>
          </button>
        </div>

        <button className="tier-chooser-cta" onClick={() => onSelect(selected)}>
          Continue →
        </button>
      </div>
    </div>
  )
}
