import { LAB_COPY } from './labCopy'

export type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface LabOrbProps {
  state: ConversationState
  onActivate?: () => void
  label?: string
}

export function LabOrb({ state, onActivate, label }: LabOrbProps) {
  const status = state === 'listening'
    ? LAB_COPY.listening
    : state === 'thinking'
      ? LAB_COPY.thinking
      : state === 'speaking'
        ? LAB_COPY.speaking
        : LAB_COPY.readyToAsk

  return (
    <div className={`lab-orb-wrap lab-orb-${state}`}>
      <button
        type="button"
        className="lab-orb"
        onClick={onActivate}
        aria-label={label || status}
      >
        <span className="lab-orb-core" />
      </button>
      <p className="lab-orb-status">{status}</p>
    </div>
  )
}

interface LabConversationOverlayProps {
  state: ConversationState
  onLeave: () => void
  onActivate: () => void
}

export function LabConversationOverlay({ state, onLeave, onActivate }: LabConversationOverlayProps) {
  return (
    <div className="lab-conversation" data-testid="lab-conversation">
      <button
        type="button"
        className="lab-conversation-leave"
        onClick={onLeave}
        aria-label={LAB_COPY.leaveConversation}
      >
        ×
      </button>
      <p className="lab-conversation-hint">{LAB_COPY.conversationHint}</p>
      <LabOrb state={state} onActivate={onActivate} />
    </div>
  )
}
