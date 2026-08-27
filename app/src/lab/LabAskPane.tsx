import { useEffect, useRef, useState } from 'react'
import { LAB_DESKTOP_PANES, labVoicePhaseLabel } from './labChrome'
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
  onDone?: () => void
  phoneSheet?: boolean
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

export function LabAskPane({
  conversationState,
  voiceActive: _voiceActive,
  typedLoading,
  turns,
  draft,
  onDraftChange,
  onSubmit,
  onMic,
  onVoiceMode,
  notice,
  onDone,
  phoneSheet = false,
}: LabAskPaneProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading

  useEffect(() => {
    const node = threadRef.current
    if (!node) return
    const last = node.lastElementChild
    if (last && typeof (last as HTMLElement).scrollIntoView === 'function') {
      (last as HTMLElement).scrollIntoView({ block: 'nearest' })
    }
    node.scrollTop = node.scrollHeight
  }, [turns, typedLoading])

  const submit = () => {
    if (typedLoading) return
    const value = draft.trim()
    if (!value) {
      setLocalError('Write a question first.')
      return
    }
    setLocalError(null)
    onSubmit(value)
  }

  const noticeNode = (notice || localError) && (
    <p className="lab-ask-notice" data-testid="lab-ask-notice">{notice || localError}</p>
  )
  const statusNode = conversationState !== 'idle' && (
    <p className="lab-ask-voice-status" data-testid="lab-ask-voice-status">
      {conversationState === 'listening'
        ? `${labVoicePhaseLabel(conversationState)} · ${LAB_COPY.yourTurn}`
        : labVoicePhaseLabel(conversationState)}
    </p>
  )
  const composerNode = (
    <form
      className="lab-ask-composer"
      data-testid="lab-ask-composer"
      data-voice-phase={conversationState}
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
        type="text"
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
        className="lab-ask-icon lab-ask-mic"
        onClick={onMic}
        aria-label={LAB_COPY.micLabel}
        data-testid="lab-ask-mic"
      >
        <MicIcon />
      </button>
      <button
        type="submit"
        className="lab-ask-send"
        aria-label={LAB_COPY.sendLabel}
        data-testid="lab-ask-send"
        disabled={typedLoading}
      >
        {LAB_COPY.sendLabel}
      </button>
      {conversationState !== 'idle' && (
        <button
          type="button"
          className={`lab-ask-icon lab-ask-voice is-${conversationState} is-alive`}
          onClick={onMic}
          aria-label={LAB_COPY.stopTalk}
          data-testid="lab-ask-voice"
          data-voice-phase={conversationState}
        >
          <span className="lab-ask-voice-x" aria-hidden="true">×</span>
        </button>
      )}
      {conversationState === 'idle' && !canSend && (
        <button
          type="button"
          className="lab-ask-icon lab-ask-voice"
          onClick={onVoiceMode}
          aria-label={LAB_COPY.voiceModeLabel}
          data-testid="lab-ask-voice"
          data-voice-phase={conversationState}
        >
          <VoiceIcon />
        </button>
      )}
    </form>
  )
  return (
    <aside
      className={`lab-ask ${empty ? 'is-empty' : 'has-thread'}${phoneSheet ? ' is-phone-sheet' : ''}`}
      data-testid="lab-ask-pane"
      aria-label={LAB_DESKTOP_PANES[0]}
    >
      {onDone && (
        <div className="lab-ask-toolbar">
          <button
            type="button"
            className="lab-ask-done"
            onClick={onDone}
            data-testid="lab-ask-done"
          >
            {LAB_COPY.done}
          </button>
        </div>
      )}
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
                <p className="lab-ask-user">
                  <span className="lab-ask-user-label">{LAB_COPY.youLabel}</span>
                  {turn.content}
                </p>
              ) : (
                <p className="lab-ask-reply">
                  <span className="lab-ask-reply-label">{LAB_COPY.tinctLabel}</span>
                  {turn.content}
                </p>
              )}
            </div>
          ))}
          {typedLoading && (
            <p className="lab-ask-pending">{LAB_COPY.typedPending}</p>
          )}
        </div>
      )}
      {phoneSheet ? (
        <div className="lab-ask-chrome" data-testid="lab-ask-chrome">
          {noticeNode}
          {statusNode}
          {composerNode}
        </div>
      ) : (
        <>
          {noticeNode}
          {statusNode}
          {composerNode}
        </>
      )}
    </aside>
  )
}
