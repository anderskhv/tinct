import { LAB_COPY } from './labCopy'
import type { LabConversationState } from './labAsk'

export type ConversationState = LabConversationState

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
        : null

  return (
    <div className={`lab-orb-wrap lab-orb-${state}`}>
      <button
        type="button"
        className="lab-orb"
        onClick={onActivate}
        aria-label={label || status || LAB_COPY.conversationHint}
        data-testid="lab-orb"
      >
        <span className="lab-orb-core" />
      </button>
      {status && <p className="lab-orb-status">{status}</p>}
    </div>
  )
}

interface LabConversationOverlayProps {
  state: ConversationState
  onLeave: () => void
  onActivate: () => void
  notice?: string | null
}

export function LabConversationOverlay({
  state,
  onLeave,
  onActivate,
  notice,
}: LabConversationOverlayProps) {
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
      {notice && (
        <p className="lab-ask-notice" data-testid="lab-voice-notice">{notice}</p>
      )}
    </div>
  )
}
