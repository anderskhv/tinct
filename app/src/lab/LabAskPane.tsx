import { useEffect, useRef, useState } from 'react'
import { LAB_DESKTOP_PANES } from './labChrome'
import { LAB_COPY } from './labCopy'
import type { LabAskTurn, LabConversationState } from './labAsk'

interface LabAskPaneProps {
  conversationState: LabConversationState
  voiceActive: boolean
  typedLoading: boolean
  turns: LabAskTurn[]
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (value: string) => void
  onMic: () => void
  onVoiceMode: () => void
  notice?: string | null
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.55" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M12 17v3.2M9.2 20.2h5.6" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  )
}

function VoiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4.2" y="9" width="2.6" height="6" rx="1.1" />
      <rect x="10.7" y="5" width="2.6" height="14" rx="1.1" />
      <rect x="17.2" y="8" width="2.6" height="8" rx="1.1" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 18.5V6.2M7 11.2 12 6.2l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LabAskPane({
  conversationState,
  voiceActive,
  typedLoading,
  turns,
  draft,
  onDraftChange,
  onSubmit,
  onMic,
  onVoiceMode,
  notice,
}: LabAskPaneProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading

  useEffect(() => {
    const node = threadRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [turns, typedLoading])

  const submit = () => {
    const value = draft.trim()
    if (!value) {
      setLocalError('Write a question first.')
      return
    }
    setLocalError(null)
    onSubmit(value)
  }

  return (
    <aside
      className={`lab-ask ${empty ? 'is-empty' : 'has-thread'}`}
      data-testid="lab-ask-pane"
      aria-label={LAB_DESKTOP_PANES[0]}
    >
      {empty ? (
        <p className="lab-ask-greeting">{LAB_COPY.askGreeting}</p>
      ) : (
        <div className="lab-ask-thread" data-testid="lab-ask-thread" ref={threadRef}>
          {turns.map(turn => (
            <div
              key={turn.id}
              className={`lab-ask-turn is-${turn.role}`}
              data-testid={`lab-ask-turn-${turn.role}`}
            >
              {turn.role === 'user' ? (
                <p className="lab-ask-bubble">{turn.content}</p>
              ) : (
                <p className="lab-ask-reply">{turn.content}</p>
              )}
            </div>
          ))}
          {typedLoading && (
            <p className="lab-ask-pending">{LAB_COPY.typedPending}</p>
          )}
        </div>
      )}
      {(notice || localError) && (
        <p className="lab-ask-notice" data-testid="lab-ask-notice">{notice || localError}</p>
      )}
      <form
        className="lab-ask-composer"
        data-testid="lab-ask-composer"
        data-voice-phase={voiceActive ? conversationState : 'idle'}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label className="lab-visually-hidden" htmlFor="lab-ask-input">
          {LAB_COPY.askPlaceholder}
        </label>
        <input
          id="lab-ask-input"
          className="lab-ask-input"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
          placeholder={LAB_COPY.askPlaceholder}
          autoComplete="off"
        />
        <button
          type="button"
          className={`lab-ask-icon lab-ask-mic ${voiceActive ? `is-${conversationState}` : ''}`}
          onClick={onMic}
          aria-label={LAB_COPY.micLabel}
          data-testid="lab-ask-mic"
        >
          <MicIcon />
        </button>
        {canSend ? (
          <button
            type="submit"
            className="lab-ask-icon lab-ask-send"
            aria-label={LAB_COPY.sendLabel}
            data-testid="lab-ask-send"
          >
            <SendIcon />
          </button>
        ) : (
          <button
            type="button"
            className={`lab-ask-icon lab-ask-voice ${voiceActive ? `is-${conversationState}` : ''}`}
            onClick={onVoiceMode}
            aria-label={LAB_COPY.voiceModeLabel}
            data-testid="lab-ask-voice"
          >
            <VoiceIcon />
          </button>
        )}
      </form>
    </aside>
  )
}
