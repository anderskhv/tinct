interface BalanceIndicatorProps {
  messagesRemaining: number
  hasBalance: boolean
  isAnonymous: boolean
  onTopUp: () => void
  onSignIn: () => void
}

export function BalanceIndicator({
  messagesRemaining,
  hasBalance,
  isAnonymous,
  onTopUp,
  onSignIn,
}: BalanceIndicatorProps) {
  if (isAnonymous && hasBalance) {
    return (
      <button
        className="balance-indicator balance-anonymous"
        onClick={onSignIn}
        title="Sign in to save progress and get more messages"
      >
        {messagesRemaining} msgs free
      </button>
    )
  }

  if (!hasBalance) {
    return (
      <button
        className="balance-indicator balance-empty"
        onClick={isAnonymous ? onSignIn : onTopUp}
        title={isAnonymous ? 'Sign in to continue chatting' : 'Top up your balance'}
      >
        0 msgs — {isAnonymous ? 'Sign in' : 'Top up'}
      </button>
    )
  }

  return (
    <button
      className="balance-indicator"
      onClick={onTopUp}
      title={`${messagesRemaining} AI messages remaining. Click to top up.`}
    >
      {messagesRemaining} msgs
    </button>
  )
}
