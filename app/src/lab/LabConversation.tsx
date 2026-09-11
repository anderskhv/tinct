import { LAB_COPY } from './labCopy'
import type { LabConversationState } from './labAsk'

export type ConversationState = LabConversationState

export function LabVoiceGate({ phase }: { phase: 'connecting' | 'ready' }) {
  const word = phase === 'ready' ? LAB_COPY.readyToSpeak : LAB_COPY.connecting
  return (
    <div
      className={`lab-voice-gate${phase === 'ready' ? ' is-ready' : ''}`}
      data-testid="lab-voice-gate"
      data-phase={phase}
    >
      {phase === 'connecting' && <span className="lab-voice-gate-pulse" aria-hidden="true" />}
      <p className="lab-voice-gate-word">{word}</p>
    </div>
  )
}

interface LabOrbProps {
  state: ConversationState
  onActivate?: () => void
  label?: string
}

export function LabOrb({ state, onActivate, label }: LabOrbProps) {
  const status = state === 'listening'
    ? LAB_COPY.listening
    : state === 'speaking'
      ? LAB_COPY.speaking
      : state === 'connecting'
        ? LAB_COPY.connecting
        : state === 'checking'
          ? LAB_COPY.checkingText
          : state === 'preparing'
            ? LAB_COPY.preparingAnswer
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
