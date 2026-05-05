// Focused buy-buttons modal for signed-in users who hit zero balance during
// a chat. App.tsx routes them here (rather than the full UsageDashboard)
// when handleInsufficientBalance fires — the goal is one tap to checkout.
//
// Reconstructed 2026-05-05 after the original was lost in a bad deploy
// script. Prop signature matches the call site in App.tsx exactly. Pricing
// strings are display-only — actual prices are set server-side in the
// /api/create-checkout handler.

type CheckoutType = 'subscription' | 'chat_pack_100' | 'chat_pack_200'

interface TopUpModalProps {
  monthlyRemaining: number
  messageBalance: number
  onCheckout: (type: CheckoutType) => void
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(11, 11, 11, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: 24,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--paper, #ece7db)',
  color: 'var(--ink, #0b0b0b)',
  borderRadius: 6,
  border: '1px solid var(--ink, #0b0b0b)',
  maxWidth: 460,
  width: '100%',
  padding: '32px 32px 28px',
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  position: 'relative',
}

const closeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 14,
  background: 'transparent',
  border: 'none',
  fontSize: 24,
  lineHeight: 1,
  cursor: 'pointer',
  color: 'var(--dim, #6a6555)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: '-0.015em',
  margin: '0 0 8px',
}

const subtitleStyle: React.CSSProperties = {
  fontFamily: "'EB Garamond', Georgia, serif",
  fontSize: 17,
  lineHeight: 1.5,
  color: 'var(--dim, #6a6555)',
  margin: '0 0 20px',
}

const balanceRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--dim, #6a6555)',
  borderTop: '1px solid rgba(11, 11, 11, 0.12)',
  borderBottom: '1px solid rgba(11, 11, 11, 0.12)',
  padding: '12px 0',
  margin: '0 0 24px',
}

const optionStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: '1px solid var(--ink, #0b0b0b)',
  borderRadius: 4,
  padding: '14px 16px',
  marginBottom: 10,
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  transition: 'background 0.12s',
}

const optionPrimaryStyle: React.CSSProperties = {
  ...optionStyle,
  background: 'var(--accent, #1f4a5c)',
  color: 'var(--paper, #ece7db)',
  borderColor: 'var(--accent, #1f4a5c)',
}

const optionLabelStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 17,
  fontWeight: 600,
  display: 'block',
  marginBottom: 2,
}

const optionDescStyle: React.CSSProperties = {
  fontFamily: "'EB Garamond', Georgia, serif",
  fontSize: 14,
  opacity: 0.8,
}

const footerStyle: React.CSSProperties = {
  fontFamily: "'EB Garamond', Georgia, serif",
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--dim, #6a6555)',
  margin: '18px 0 0',
  textAlign: 'center',
}

export function TopUpModal({
  monthlyRemaining,
  messageBalance,
  onCheckout,
  onClose,
}: TopUpModalProps) {
  const totalRemaining = monthlyRemaining + messageBalance
  const subtitle = totalRemaining <= 0
    ? "You've used your AI chat allowance. Pick an option below to keep going."
    : `You have ${totalRemaining} message${totalRemaining === 1 ? '' : 's'} left. Top up before you run out.`

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label="Top up AI chat">
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <button style={closeStyle} onClick={onClose} aria-label="Close">×</button>

        <h2 style={titleStyle}>Keep the conversation going</h2>
        <p style={subtitleStyle}>{subtitle}</p>

        <div style={balanceRowStyle}>
          <span>Monthly · {monthlyRemaining}</span>
          <span>Top-up balance · {messageBalance}</span>
        </div>

        <button
          style={optionPrimaryStyle}
          onClick={() => onCheckout('subscription')}
        >
          <span style={optionLabelStyle}>Premium · $3 / month</span>
          <span style={optionDescStyle}>
            100 AI messages every month, audiobook, character tracker, offline mode. First month free.
          </span>
        </button>

        <button
          style={optionStyle}
          onClick={() => onCheckout('chat_pack_200')}
        >
          <span style={optionLabelStyle}>200 messages · $5</span>
          <span style={optionDescStyle}>One-time top-up. No subscription. Messages never expire.</span>
        </button>

        <button
          style={optionStyle}
          onClick={() => onCheckout('chat_pack_100')}
        >
          <span style={optionLabelStyle}>100 messages · $3</span>
          <span style={optionDescStyle}>Smaller one-time top-up.</span>
        </button>

        <p style={footerStyle}>
          If price is a barrier, write to <a href="mailto:contact@tinct.app" style={{ color: 'inherit' }}>contact@tinct.app</a> and we'll work something out.
        </p>
      </div>
    </div>
  )
}
