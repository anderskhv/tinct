import { useTierContext } from '../contexts/TierContext'

interface UpgradePromptProps {
  feature: string
  onCreateAccount?: () => void
  onUpgrade?: () => void
}

export function UpgradePrompt({ feature, onCreateAccount, onUpgrade }: UpgradePromptProps) {
  const { tier } = useTierContext()

  if (tier === 'none') {
    return (
      <div className="upgrade-prompt">
        <p className="upgrade-prompt-text">
          Create a free account to use {feature}
        </p>
        {onCreateAccount && (
          <button className="upgrade-prompt-cta" onClick={onCreateAccount}>
            Create free account
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="upgrade-prompt">
      <p className="upgrade-prompt-text">
        {feature} is a Premium feature
      </p>
      {onUpgrade && (
        <button className="upgrade-prompt-cta" onClick={onUpgrade}>
          Upgrade to Premium
        </button>
      )}
    </div>
  )
}
