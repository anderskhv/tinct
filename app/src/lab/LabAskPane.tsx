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
  chapterLabel?: (chapterNumber: number) => string
}

function inlineMarkup(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}

function LabMessage({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: React.ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  const flushList = () => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    blocks.push(<Tag key={`list-${blocks.length}`}>{list.items.map((item, index) => <li key={index}>{inlineMarkup(item)}</li>)}</Tag>)
    list = null
  }
  lines.forEach((raw) => {
    const line = raw.trim()
    const item = line.match(/^(?:([-*])|(\d+)\.)\s+(.+)$/)
    if (item) {
      const ordered = Boolean(item[2])
      if (list && list.ordered !== ordered) flushList()
      if (!list) list = { ordered, items: [] }
      list.items.push(item[3])
      return
    }
    flushList()
    if (!line) return
    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      blocks.push(<h3 key={`heading-${blocks.length}`}>{inlineMarkup(heading[2])}</h3>)
    } else if (line.startsWith('> ')) {
      blocks.push(<blockquote key={`quote-${blocks.length}`}>{inlineMarkup(line.slice(2))}</blockquote>)
    } else {
      blocks.push(<p key={`p-${blocks.length}`}>{inlineMarkup(line)}</p>)
    }
  })
  flushList()
  return <div className="lab-ask-message">{blocks}</div>
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
  chapterLabel,
}: LabAskPaneProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading

  useEffect(() => {
    const node = threadRef.current
    if (!node) return
    const frame = requestAnimationFrame(() => { node.scrollTop = node.scrollHeight })
    return () => cancelAnimationFrame(frame)
  }, [turns, typedLoading])

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, Math.max(112, window.innerHeight * 0.32))}px`
  }, [draft])

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
      <textarea
        ref={inputRef}
        id="lab-ask-input"
        rows={1}
        className="lab-ask-input"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
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
          {turns.map((turn, index) => (
            <div key={turn.id}>
            {index > 0 && turn.chapterNumber != null && turn.chapterNumber !== turns[index - 1]?.chapterNumber && (
              <p className="lab-ask-moved" data-testid="lab-ask-moved">
                Moved to {chapterLabel?.(turn.chapterNumber) || `chapter ${turn.chapterNumber}`}
              </p>
            )}
            <div
              className={`lab-ask-turn is-${turn.role}`}
              data-testid={`lab-ask-turn-${turn.role}`}
            >
              {turn.role === 'user' ? (
                <div className="lab-ask-user">
                  <span className="lab-ask-user-label">{LAB_COPY.youLabel}</span>
                  <LabMessage text={turn.content} />
                </div>
              ) : (
                <div className="lab-ask-reply">
                  <span className="lab-ask-reply-label">{LAB_COPY.tinctLabel}</span>
                  <LabMessage text={turn.content} />
                </div>
              )}
            </div>
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
