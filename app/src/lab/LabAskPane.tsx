import { useState } from 'react'
import { LAB_DESKTOP_PANES } from './labChrome'
import { LAB_COPY } from './labCopy'
import { LabOrb, type ConversationState } from './LabConversation'

interface LabAskPaneProps {
  conversationState: ConversationState
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (value: string) => void
  onMic: () => void
  notice?: string | null
}

export function LabAskPane({
  conversationState,
  draft,
  onDraftChange,
  onSubmit,
  onMic,
  notice,
}: LabAskPaneProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  return (
    <aside className="lab-ask" data-testid="lab-ask-pane" aria-label={LAB_DESKTOP_PANES[0]}>
      <header className="lab-ask-header">
        <h2 className="lab-ask-title">{LAB_DESKTOP_PANES[0]}</h2>
      </header>
      <LabOrb state={conversationState} onActivate={onMic} />
      <form
        className="lab-ask-form"
        onSubmit={(event) => {
          event.preventDefault()
          const value = draft.trim()
          if (!value) {
            setLocalError('Write a question first.')
            return
          }
          setLocalError(null)
          onSubmit(value)
        }}
      >
        <label className="lab-visually-hidden" htmlFor="lab-ask-input">
          {LAB_COPY.askPlaceholder}
        </label>
        <textarea
          id="lab-ask-input"
          className="lab-ask-input"
          rows={3}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={LAB_COPY.askPlaceholder}
        />
        <div className="lab-ask-actions">
          <button type="button" className="lab-text-btn" onClick={onMic}>
            Microphone
          </button>
          <button type="submit" className="lab-text-btn lab-text-btn-strong">
            Ask
          </button>
        </div>
      </form>
      {(notice || localError) && (
        <p className="lab-ask-notice" data-testid="lab-ask-notice">{notice || localError}</p>
      )}
    </aside>
  )
}
