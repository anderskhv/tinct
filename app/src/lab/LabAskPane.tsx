import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type Ref, type MutableRefObject } from 'react'
import { LAB_DESKTOP_PANES, labVoicePhaseLabel } from './labChrome'
import { LAB_COPY } from './labCopy'
import type { LabAskTurn, LabConversationState } from './labAsk'
import { LabMarkdown } from './LabMarkdown'

interface LabAskPaneProps {
  conversationState: LabConversationState
  chromeV2?: boolean
  focusTurnId?: string | null
  onBackToContents?: () => void
  dictationState?: 'idle' | 'starting' | 'listening'
  onStopVoice?: () => void
  voiceActive: boolean
  typedLoading: boolean
  turns: LabAskTurn[]
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (value: string) => void
  onMic: () => void
  onVoiceMode: () => void
  onRetry?: () => void
  notice?: string | null
  onDone?: () => void
  phoneSheet?: boolean
  onKeyboardOpenChange?: (open: boolean) => void
  /** The host focuses this inside the Chat tap; iOS only raises the keyboard for a gesture-synchronous focus(). */
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>
  chapterLabels?: Record<number, string>
  desktopCompanion?: 'chat' | 'talk'
}

/** Within this many pixels of the bottom counts as "at the bottom". */
export const LAB_ASK_FOLLOW_PX = 80
/** Turns rendered when the thread opens; older ones are added in windows of this size. */
export const LAB_ASK_WINDOW = 40
/** Scrolling within this many pixels of the top reveals the next window of older turns. */
export const LAB_ASK_LOAD_MORE_PX = 120
/** Breathing room above a reply pinned to the top of the viewport. */
export const LAB_ASK_REPLY_TOP_GAP = 8

function isNearBottom(node: HTMLElement): boolean {
  return node.scrollHeight - node.scrollTop - node.clientHeight <= LAB_ASK_FOLLOW_PX
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
  chromeV2 = false,
  focusTurnId,
  onBackToContents,
  dictationState = 'idle',
  onStopVoice,
  voiceActive: _voiceActive,
  typedLoading,
  turns,
  draft,
  onDraftChange,
  onSubmit,
  onMic,
  onVoiceMode,
  onRetry,
  notice,
  onDone,
  phoneSheet = false,
  onKeyboardOpenChange,
  inputRef,
  chapterLabels = {},
  desktopCompanion,
}: LabAskPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [copiedTurn, setCopiedTurn] = useState<string | null>(null)
  useLayoutEffect(() => {
    const field = textareaRef.current
    if (!field) return
    field.style.height = '0px'
    field.style.height = `${Math.min(field.scrollHeight, 180)}px`
  }, [draft, chromeV2])
  const copyTurn = async (turn: LabAskTurn) => {
    try {
      await navigator.clipboard.writeText(turn.content)
      setCopiedTurn(turn.id)
    } catch {
      setLocalError('Could not copy. Select the message to copy it.')
    }
  }
  const [localError, setLocalError] = useState<string | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const lastTurnIdRef = useRef<string | null>(null)
  const didPositionThreadRef = useRef(false)
  // Windowing: the whole history is in `turns`, the DOM holds the newest
  // LAB_ASK_WINDOW plus whatever the reader revealed by scrolling up. A new
  // oldest turn (open, book switch, cloud merge) resets the window to the
  // newest messages; appends keep it.
  const [hiddenCount, setHiddenCount] = useState(() => Math.max(0, turns.length - LAB_ASK_WINDOW))
  const oldestTurnIdRef = useRef<string | undefined>(turns[0]?.id)
  if (oldestTurnIdRef.current !== turns[0]?.id) {
    oldestTurnIdRef.current = turns[0]?.id
    setHiddenCount(Math.max(0, turns.length - LAB_ASK_WINDOW))
  }
  const hidden = Math.min(hiddenCount, Math.max(0, turns.length - 1))
  const visibleTurns = hidden > 0 ? turns.slice(hidden) : turns
  // Height before older turns were prepended, so the message under the
  // reader's eye stays where it was.
  const revealAnchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  // Where we last pinned the thread, and whether the reader has scrolled
  // since. A reader who is reading older messages is never yanked down;
  // one who is at (or within LAB_ASK_FOLLOW_PX of) the bottom keeps following.
  const pinnedScrollTopRef = useRef<number | null>(null)
  const nearBottomRef = useRef(true)
  // 'bottom': keep the newest line in view. 'reply-top': the reader's answer
  // just began; its first line sits near the top of the viewport and the
  // thread follows only while the end of the reply is still within reach.
  const pinModeRef = useRef<'bottom' | 'reply-top'>('bottom')
  // Room below the newest reply so its first line can sit at the top of the
  // viewport even while the reply is short; it shrinks as the reply grows,
  // so the text fills downward under a still first line.
  const spacerRef = useRef<HTMLDivElement | null>(null)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading

  const lastReplyOf = (node: HTMLDivElement): HTMLElement | null => {
    const replies = node.querySelectorAll<HTMLElement>('[data-testid="lab-ask-turn-assistant"]')
    return replies[replies.length - 1] ?? null
  }

  const replyTopOf = (node: HTMLDivElement, reply: HTMLElement): number => (
    reply.getBoundingClientRect().top - node.getBoundingClientRect().top + node.scrollTop - LAB_ASK_REPLY_TOP_GAP
  )

  /**
   * Size the room below the reply so the furthest the thread can scroll is
   * exactly the reply's first line. Measured from real geometry, so the
   * thread's own padding and the pending row are accounted for.
   */
  const setSpacer = useCallback((node: HTMLDivElement, reply: HTMLElement | null) => {
    const spacer = spacerRef.current
    if (!spacer) return
    if (!reply) {
      spacer.style.height = '0px'
      return
    }
    const current = parseFloat(spacer.style.height || '0') || 0
    const wanted = current + (replyTopOf(node, reply) + node.clientHeight - node.scrollHeight)
    spacer.style.height = `${Math.max(0, Math.round(wanted))}px`
  }, [])

  /** Keep the reply's first line at the top while it streams (the spacer absorbs the growth). */
  const holdReplyTop = useCallback((node: HTMLDivElement, reply: HTMLElement) => {
    node.scrollTop = Math.max(0, replyTopOf(node, reply))
    pinnedScrollTopRef.current = node.scrollTop
    nearBottomRef.current = isNearBottom(node)
    pinModeRef.current = 'reply-top'
  }, [])

  const pinToBottom = useCallback((node: HTMLDivElement) => {
    node.scrollTop = node.scrollHeight
    pinnedScrollTopRef.current = node.scrollTop
    nearBottomRef.current = true
    pinModeRef.current = 'bottom'
  }, [])

  /** Scroll so the first line of the newest reply is visible near the top of the viewport. */
  const pinToReplyTop = useCallback((node: HTMLDivElement) => {
    const reply = lastReplyOf(node)
    if (!reply) {
      pinToBottom(node)
      return
    }
    setSpacer(node, reply)
    holdReplyTop(node, reply)
  }, [holdReplyTop, pinToBottom, setSpacer])

  const revealOlder = useCallback(() => {
    const node = threadRef.current
    if (!node || hidden === 0) return
    revealAnchorRef.current = { scrollHeight: node.scrollHeight, scrollTop: node.scrollTop }
    pinnedScrollTopRef.current = null
    nearBottomRef.current = false
    setHiddenCount(current => Math.max(0, Math.min(current, hidden) - LAB_ASK_WINDOW))
  }, [hidden])

  const onThreadScroll = useCallback(() => {
    const node = threadRef.current
    if (!node) return
    if (hidden > 0 && node.scrollTop <= LAB_ASK_LOAD_MORE_PX && revealAnchorRef.current === null) {
      revealOlder()
      return
    }
    if (pinnedScrollTopRef.current !== null && node.scrollTop === pinnedScrollTopRef.current) return
    pinnedScrollTopRef.current = null
    nearBottomRef.current = isNearBottom(node)
  }, [hidden, revealOlder])

  // Older turns were prepended: keep the reader's line still.
  useLayoutEffect(() => {
    const node = threadRef.current
    const anchor = revealAnchorRef.current
    if (!node || !anchor) return
    revealAnchorRef.current = null
    const grown = node.scrollHeight - anchor.scrollHeight
    node.scrollTop = Math.max(0, anchor.scrollTop + grown)
    pinnedScrollTopRef.current = null
    nearBottomRef.current = isNearBottom(node)
  }, [hidden])

  useLayoutEffect(() => {
    const node = threadRef.current
    if (!node) return
    const lastTurn = turns[turns.length - 1]
    const newTurn = !!lastTurn && lastTurn.id !== lastTurnIdRef.current
    const justOpened = !didPositionThreadRef.current
    // Detect scrolling that did not raise a scroll event (tests, programmatic).
    const scrolledSincePin = pinnedScrollTopRef.current !== null && node.scrollTop !== pinnedScrollTopRef.current
    if (scrolledSincePin) {
      pinnedScrollTopRef.current = null
      nearBottomRef.current = isNearBottom(node)
    }
    const replyJustBegan = newTurn && lastTurn.role === 'assistant' && turns[turns.length - 2]?.role === 'user' && !justOpened
    const heldReply = !newTurn && lastTurn?.role === 'assistant' && pinModeRef.current === 'reply-top' && pinnedScrollTopRef.current !== null
      ? lastReplyOf(node)
      : null
    if (replyJustBegan) {
      // The reader should see the answer begin, not their own question.
      pinToReplyTop(node)
    } else if (heldReply) {
      // Still streaming under a held first line: the text fills downward.
      setSpacer(node, heldReply)
      holdReplyTop(node, heldReply)
    } else {
      if (newTurn || justOpened) setSpacer(node, null)
      const shouldFollow = justOpened
        || (newTurn && lastTurn.role === 'user')
        || pinnedScrollTopRef.current !== null
        || nearBottomRef.current
      if (shouldFollow) pinToBottom(node)
    }
    didPositionThreadRef.current = true
    lastTurnIdRef.current = lastTurn?.id ?? null
  }, [holdReplyTop, pinToBottom, pinToReplyTop, setSpacer, turns, typedLoading])

  const focusedTurnRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!chromeV2 || !focusTurnId || focusedTurnRef.current === focusTurnId) return
    const index = turns.findIndex(turn => turn.id === focusTurnId)
    if (index < 0) return
    if (hidden > index) { setHiddenCount(index); return }
    const body = threadRef.current
    const row = Array.from(body?.querySelectorAll<HTMLElement>('[data-turn-id]') || []).find(node => node.dataset.turnId === focusTurnId)
    if (!body || !row) return
    body.scrollTop = Math.max(0, row.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop)
    nearBottomRef.current = false
    pinnedScrollTopRef.current = null
    focusedTurnRef.current = focusTurnId
  }, [chromeV2, focusTurnId, hidden, turns])

  // The phone keyboard shrinks the thread; keep the newest message in view
  // when the reader was already at the bottom.
  useEffect(() => {
    const node = threadRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const current = threadRef.current
      if (!current) return
      if (pinModeRef.current === 'reply-top' && pinnedScrollTopRef.current !== null) return
      if (pinnedScrollTopRef.current !== null || nearBottomRef.current) pinToBottom(current)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [empty, pinToBottom])

  const submit = () => {
    if (typedLoading) return
    const value = draft.trim()
    if (!value) {
      setLocalError('Write a question first.')
      return
    }
    setLocalError(null)
    if (phoneSheet) {
      textareaRef.current?.blur()
      onKeyboardOpenChange?.(false)
    }
    onSubmit(value)
  }

  const noticeNode = (notice || localError) && (
    <p className="lab-ask-notice" data-testid="lab-ask-notice">{notice || localError}{onRetry && !typedLoading && <button type="button" className="lab-text-btn" onClick={onRetry}>Try again</button>}</p>
  )
  const dictationNode = chromeV2 && dictationState !== 'idle' && (
    <p className="lab-ask-voice-status" role="status" data-testid="lab-dictation-status">
      {dictationState === 'starting' ? 'Starting microphone…' : 'Listening — tap stop to finish'}
    </p>
  )
  const statusNode = conversationState !== 'idle' && (
    <p
      className={`lab-ask-voice-status is-${conversationState}`}
      data-testid="lab-ask-voice-status"
      data-voice-phase={conversationState}
      role="status"
    >
      <span className="lab-ask-voice-status-glyph" aria-hidden="true"><i /><i /><i /></span>
      <span>{labVoicePhaseLabel(conversationState)}</span>
    </p>
  )
  const composerNode = (
    <form
      className={`lab-ask-composer${chromeV2 ? " is-multiline" : ""}`}
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
      {chromeV2 ? <textarea
        id="lab-ask-input"
        data-testid="lab-ask-input"
        ref={node => {
          textareaRef.current = node
          if (typeof inputRef === 'function') inputRef(node)
          else if (inputRef) (inputRef as MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node
        }}
        rows={1}
        className="lab-ask-input"
        value={draft}
        onFocus={() => onKeyboardOpenChange?.(true)}
        onBlur={() => onKeyboardOpenChange?.(false)}
        onChange={event => onDraftChange(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={LAB_COPY.askPlaceholder}
      /> : (<input
        id="lab-ask-input"
        data-testid="lab-ask-input"
        ref={inputRef as Ref<HTMLInputElement>}
        type="text"
        className="lab-ask-input"
        value={draft}
        onFocus={() => onKeyboardOpenChange?.(true)}
        onBlur={() => onKeyboardOpenChange?.(false)}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={LAB_COPY.askPlaceholder}
        autoComplete="off"
      />)}
      <button
        type="button"
        className="lab-ask-icon lab-ask-mic"
        onClick={onMic}
        aria-label={chromeV2 ? (dictationState === 'idle' ? 'Dictate a question' : 'Stop dictation') : LAB_COPY.micLabel}
        {...(chromeV2 ? { 'aria-pressed': dictationState !== 'idle', disabled: conversationState !== 'idle' } : {})}
        data-testid="lab-ask-mic"
      >
        {chromeV2 && dictationState !== 'idle' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : <MicIcon />}
      </button>
      <button
        type="button"
        className="lab-ask-send"
        hidden={chromeV2 && !canSend}
        aria-label={LAB_COPY.sendLabel}
        data-testid="lab-ask-send"
        disabled={typedLoading}
        onPointerDown={(event) => {
          // Keep the focused input (and mobile keyboard chrome) stable until
          // the activation completes. Otherwise the target can move between
          // pointer-down and click when the input blurs.
          event.preventDefault()
        }}
        onClick={submit}
      >
        {chromeV2 ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : LAB_COPY.sendLabel}
      </button>
      {conversationState !== 'idle' && (
        <button
          type="button"
          className={`lab-ask-icon lab-ask-voice is-${conversationState} is-alive`}
          onClick={onStopVoice ?? onMic}
          aria-label={LAB_COPY.stopTalk}
          data-testid="lab-ask-voice"
          data-voice-phase={conversationState}
        >
          <span className="lab-ask-voice-x" aria-hidden="true">×</span>
        </button>
      )}
      {conversationState === 'idle' && !canSend && (!chromeV2 || dictationState === 'idle') && (
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
      className={`lab-ask ${empty ? 'is-empty' : 'has-thread'}${phoneSheet ? ' is-phone-sheet' : ''}${desktopCompanion ? ` is-desktop-companion is-${desktopCompanion}` : ''}`}
      data-testid="lab-ask-pane"
      data-companion={desktopCompanion || undefined}
      aria-label={LAB_DESKTOP_PANES[0]}
    >
      {desktopCompanion && (
        <div className="lab-desktop-companion-head">
          <span className="lab-desktop-companion-mark" aria-hidden="true">{desktopCompanion === 'talk' ? <VoiceIcon /> : '••'}</span>
          <strong>{desktopCompanion === 'talk' ? LAB_COPY.talk : LAB_COPY.chat}</strong>
          <button type="button" onClick={onDone} aria-label={`Close ${desktopCompanion}`} data-testid="lab-desktop-companion-close">×</button>
        </div>
      )}
      {onDone && !desktopCompanion && (
        <div className="lab-ask-toolbar">
          <button
            type="button"
            className="lab-ask-done"
            onClick={onDone}
            data-testid="lab-ask-done"
          >
            {chromeV2 ? '← Back to book' : LAB_COPY.done}
          </button>
        </div>
      )}
      {chromeV2 && onBackToContents && <button className="lab-ask-back-contents" onClick={onBackToContents}>← Back to contents</button>}
      {empty ? (
        <p className="lab-ask-greeting">{LAB_COPY.askGreeting}</p>
      ) : (
        <div className="lab-ask-thread" data-testid="lab-ask-thread" ref={threadRef} onScroll={onThreadScroll} data-hidden-turns={hidden}>
          {hidden > 0 && (
            <button
              type="button"
              className="lab-ask-older"
              data-testid="lab-ask-older"
              onClick={revealOlder}
            >
              {hidden === 1 ? '1 earlier message' : `${hidden} earlier messages`}
            </button>
          )}
          {visibleTurns.map((turn, index) => {
            const previousChapter = visibleTurns[index - 1]?.chapterNumber
            const chapterLabel = turn.chapterNumber != null ? chapterLabels[turn.chapterNumber] : undefined
            const showChapter = !!chapterLabel && turn.chapterNumber !== previousChapter
            return (
              <Fragment key={turn.id}>
                {showChapter && <p className="lab-ask-location" data-testid="lab-ask-location">{chapterLabel}</p>}
                <div
                  className={`lab-ask-turn is-${turn.role}`}
                  data-testid={`lab-ask-turn-${turn.role}`}
                  {...(chromeV2 ? { 'data-turn-id': turn.id } : {})}
                >
                  {chromeV2 && turn.timestamp != null && Number.isFinite(turn.timestamp) && (
                    <time className="lab-ask-time" dateTime={new Date(turn.timestamp).toISOString()}>
                      {new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(turn.timestamp)}
                    </time>
                  )}
                  {turn.role === 'user' ? (
                    <p className="lab-ask-user">
                      <span className="lab-ask-user-label">{LAB_COPY.youLabel}</span>
                      {turn.content}
                    </p>
                  ) : (
                    <div className="lab-ask-reply">
                      <span className="lab-ask-reply-label">{LAB_COPY.tinctLabel}</span>
                      <LabMarkdown>{turn.content}</LabMarkdown>
                    </div>
                  )}
                  {chromeV2 && <button type="button" className="lab-ask-copy" aria-label={copiedTurn === turn.id ? 'Copied' : turn.role === 'user' ? 'Copy question' : 'Copy answer'} onClick={() => void copyTurn(turn)}>
                    {copiedTurn === turn.id ? '✓' : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  </button>}
                </div>
              </Fragment>
            )
          })}
          {typedLoading && (
            <p className="lab-ask-pending">{LAB_COPY.typedPending}</p>
          )}
          <div className="lab-ask-thread-spacer" data-testid="lab-ask-thread-spacer" ref={spacerRef} aria-hidden="true" />
        </div>
      )}
      {phoneSheet ? (
        <div className="lab-ask-chrome" data-testid="lab-ask-chrome">
          {noticeNode}
          {dictationNode}
          {statusNode}
          {composerNode}
        </div>
      ) : (
        <>
          {noticeNode}
          {dictationNode}
          {statusNode}
          {composerNode}
        </>
      )}
    </aside>
  )
}
