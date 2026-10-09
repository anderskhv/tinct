import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Ref, type MutableRefObject } from 'react'
import { LAB_DESKTOP_PANES, labVoicePhaseLabel } from './labChrome'
import { useReaderWindow } from './useReaderWindow'
import { LAB_COPY } from './labCopy'
import type { LabAskTurn, LabConversationState } from './labAsk'
import { LabMarkdown } from './LabMarkdown'
// The thread both readers share (Anders, 9 Oct 2026; docs/chat/): its model,
// keys, press-and-hold and look live in public/lab/chat-thread.{js,css}, which
// the PDF reader for a reader's own books loads too.
import {
  bindPress, composerKey, COMPOSER_LINES, cutQuote, fitComposer, HINT_TEXT, ICONS, isAway, keptCopyIndex, lastQuestion, scrollToLatest,
  takeHint, threadRows, timeLabel,
} from '../../public/lab/chat-thread.js'
import '../../public/lab/chat-thread.css'

interface LabAskPaneProps {
  conversationState: LabConversationState
  focusTurnId?: string | null
  onBackToContents?: () => void
  dictationState?: 'idle' | 'starting' | 'listening' | 'transcribing'
  onStopVoice?: () => void
  voiceActive: boolean
  typedLoading: boolean
  turns: LabAskTurn[]
  draft: string
  attachment?: { text: string; kind?: 'highlight' | 'figure' } | null
  onRemoveAttachment?: () => void
  onDraftChange: (value: string) => void
  onSubmit: (value: string) => void
  onMic: () => void
  /** Absent: no voice conversation is offered (a reader's own book). */
  onVoiceMode?: () => void
  onRetry?: () => void
  notice?: string | null
  onDone?: () => void
  phoneSheet?: boolean
  onKeyboardOpenChange?: (open: boolean) => void
  /** The host focuses this inside the Chat tap; iOS only raises the keyboard for a gesture-synchronous focus(). */
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>
  chapterLabels?: Record<number, string>
  desktopCompanion?: 'chat' | 'talk'
  /**
   * Where this device's copy of the thread stands against the account's row.
   * `loading` means the cloud history has not come back yet, so what is on
   * screen is only what this device happens to have stored — months out of
   * date when the newer turns were had on another device.
   */
  historyStatus?: 'loading' | 'ready' | 'unavailable'
  /** A question's quoted passage was tapped: show that passage on the page. */
  onQuote?: (turn: LabAskTurn) => void
  /**
   * Desktop minimize, held by the host when it passes these (the menu's
   * Librarian row restores a minimized chat). Uncontrolled otherwise.
   * Minimized, the chat draws nothing: there is no floating orb (2026-10-08).
   */
  minimized?: boolean
  onMinimizedChange?: (minimized: boolean) => void
}

/** Within this many pixels of the bottom counts as "at the bottom". */
export const LAB_ASK_FOLLOW_PX = 80
/** Turns rendered when the thread opens; older ones are added in windows of this size. */
export const LAB_ASK_WINDOW = 40
/** Scrolling within this many pixels of the top reveals the next window of older turns. */
export const LAB_ASK_LOAD_MORE_PX = 120
/** The composer grows with its text to five lines (16px/1.4, plus its padding), then scrolls. */
export const LAB_ASK_MAX_COMPOSER_PX = Math.round(16 * 1.4 * COMPOSER_LINES)
/** Breathing room above a reply pinned to the top of the viewport: clear of the close mark and the top fade (36px). */
export const LAB_ASK_REPLY_TOP_GAP = 36

/**
 * A question that never got an answer: the turn after it is another question,
 * or it is the end of the thread and nothing is in flight. Stored history
 * keeps these (they are what the reader asked), but unmarked they read as a
 * question the companion ignored.
 */
export function labAskTurnUnanswered(turns: LabAskTurn[], index: number, typedLoading: boolean): boolean {
  const turn = turns[index]
  if (!turn || turn.role !== 'user' || turn.source === 'voice') return false
  const next = turns[index + 1]
  if (next) return next.role !== 'assistant'
  return !typedLoading
}

function isNearBottom(node: HTMLElement): boolean {
  return node.scrollHeight - node.scrollTop - node.clientHeight <= LAB_ASK_FOLLOW_PX
}

export function LabAskPane({
  conversationState,
  focusTurnId,
  onBackToContents,
  dictationState = 'idle',
  onStopVoice,
  voiceActive: _voiceActive,
  typedLoading,
  turns,
  draft,
  attachment,
  onRemoveAttachment,
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
  historyStatus = 'ready',
  minimized: minimizedProp,
  onMinimizedChange,
  onQuote,
}: LabAskPaneProps) {
  const [minimizedOwn, setMinimizedOwn] = useState(false)
  const minimized = minimizedProp ?? minimizedOwn
  const setMinimized = (next: boolean | ((value: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(minimized) : next
    if (minimizedProp === undefined) setMinimizedOwn(value)
    onMinimizedChange?.(value)
  }
  const windowRef = useReaderWindow<HTMLElement>('chat', !!desktopCompanion && !minimized)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [copiedTurn, setCopiedTurn] = useState<string | null>(null)
  // Auto-grow to five lines (fitComposer: no scrollbar until the field really clips).
  useLayoutEffect(() => {
    const field = textareaRef.current
    if (field) fitComposer(field)
  }, [draft])
  // The keyboard hint, once per session, on the desktop only.
  // (An effect, not a state initializer: React's strict mode runs initializers twice.)
  const [hint, setHint] = useState(false)
  useEffect(() => {
    if (phoneSheet) return
    let storage: Storage | null = null
    try { storage = window.sessionStorage } catch { /* blocked */ }
    if (takeHint(storage)) setHint(true)
  }, [])
  // More than a screen above the newest line: the "Latest" pill.
  const [away, setAway] = useState(false)
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
  // The cloud history landed and replaced what was on screen: show the newest
  // window of the reconciled thread, wherever the reader had scrolled to in
  // the stale copy. Leaving them parked in an old conversation that is no
  // longer the end of the thread is the bug this exists to prevent.
  const historyStatusRef = useRef(historyStatus)
  const repinRef = useRef(false)
  if (historyStatusRef.current !== historyStatus) {
    if (historyStatusRef.current === 'loading') {
      repinRef.current = true
      setHiddenCount(Math.max(0, turns.length - LAB_ASK_WINDOW))
    }
    historyStatusRef.current = historyStatus
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
  // Opened on a clean window and nothing new since: the space follows the thread's height.
  const cleanOpenRef = useRef(false)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading
  const syncing = historyStatus === 'loading'

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
    setAway(isAway(node))
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
    const justOpened = !didPositionThreadRef.current || repinRef.current
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
      // Open on a clean window: one screen of writing space above the
      // composer, the whole thread immediately above it, reached by scrolling up.
      if (justOpened && !focusTurnId && !typedLoading && spacerRef.current) {
        spacerRef.current.style.height = `${node.clientHeight}px`
        cleanOpenRef.current = true
      }
      if (newTurn && !justOpened) cleanOpenRef.current = false
      const shouldFollow = justOpened
        || (newTurn && lastTurn.role === 'user')
        || pinnedScrollTopRef.current !== null
        || nearBottomRef.current
      if (shouldFollow) pinToBottom(node)
    }
    didPositionThreadRef.current = true
    repinRef.current = false
    lastTurnIdRef.current = lastTurn?.id ?? null
  }, [focusTurnId, hidden, holdReplyTop, pinToBottom, pinToReplyTop, setSpacer, turns, typedLoading])

  const focusedTurnRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!focusTurnId || focusedTurnRef.current === focusTurnId) return
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
  }, [focusTurnId, hidden, turns])

  // Press-and-hold on the phone reveals a message's row (the shared behaviour).
  useEffect(() => {
    const node = threadRef.current
    return node ? bindPress(node) : undefined
  }, [])

  // The phone keyboard shrinks the thread; keep the newest message in view
  // when the reader was already at the bottom.
  useEffect(() => {
    const node = threadRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const current = threadRef.current
      if (!current) return
      if (pinModeRef.current === 'reply-top' && pinnedScrollTopRef.current !== null) return
      const resizedClean = cleanOpenRef.current && (pinnedScrollTopRef.current !== null || nearBottomRef.current)
      if (resizedClean && spacerRef.current) spacerRef.current.style.height = `${current.clientHeight}px`
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
    setHint(false)
    if (phoneSheet) {
      textareaRef.current?.blur()
      onKeyboardOpenChange?.(false)
    }
    onSubmit(value)
  }

  const close = () => { textareaRef.current?.blur(); onKeyboardOpenChange?.(false); onDone?.() }
  const streaming = typedLoading && turns[turns.length - 1]?.role === 'assistant'
  const kept = keptCopyIndex(turns, streaming)
  const placeOf = (turn: LabAskTurn) => (turn.chapterNumber != null ? chapterLabels[turn.chapterNumber] : undefined)
  // Dividers come from the whole thread, so the first turn of a window shows one only when it starts a new chapter or day.
  const rows = threadRows(turns.map(turn => ({ role: turn.role, at: turn.timestamp, place: placeOf(turn) })))
    .flatMap(row => {
      if (row.type === 'turn') return row.index >= hidden ? [{ ...row, index: row.index - hidden }] : []
      const next = Number(row.key.slice('divider-'.length))
      return next > hidden ? [row] : []
    })

  // Status lines sit above the composer, not inside the thread: the thread
  // opens scrolled to its end, so a line at its top is the one thing the
  // reader cannot see. No empty-state copy: an empty thread is a caret.
  const syncingNode = syncing && !empty && (
    <p className="tc-status" data-testid="lab-ask-syncing" role="status">{LAB_COPY.askHistorySyncing}</p>
  )
  const noticeNode = (notice || localError) && (
    <p className="tc-status" data-testid="lab-ask-notice">{notice || localError}{onRetry && !typedLoading && <button type="button" onClick={onRetry}>Try again</button>}</p>
  )
  const dictationNode = dictationState !== 'idle' && (
    <p className="tc-status" role="status" data-testid="lab-dictation-status">
      {dictationState === 'starting' ? 'Starting microphone…' : dictationState === 'transcribing' ? 'Writing down what you said…' : 'Listening — tap stop to finish'}
    </p>
  )
  const statusNode = conversationState !== 'idle' && (
    <p className={`tc-status is-${conversationState}`} data-testid="lab-ask-voice-status" data-voice-phase={conversationState} role="status">
      {labVoicePhaseLabel(conversationState)}
    </p>
  )
  const composerNode = (
    <form
      className="tc-compose"
      data-testid="lab-ask-composer"
      data-voice-phase={conversationState}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      // Any press on the composer that is not aimed at a control means "write here".
      onPointerDown={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('button, a, input, textarea, [contenteditable]')) return
        if (target.closest('.tc-attached')) return
        event.preventDefault()
        textareaRef.current?.focus()
      }}
    >
      {attachment && (
        <section className="tc-attached" data-testid="lab-ask-attachment" aria-label={attachment.kind === 'figure' ? 'Figure attached to question' : 'Highlighted passage attached to question'} tabIndex={0}>
          {cutQuote(attachment.text)}
          <button type="button" className="tc-mark" aria-label="Remove" onClick={() => {
            onRemoveAttachment?.()
            window.requestAnimationFrame(() => textareaRef.current?.focus())
          }} dangerouslySetInnerHTML={{ __html: ICONS.close }} />
        </section>
      )}
      <div className={`tc-field${draft.length === 0 ? ' is-empty' : ''}`}>
        <label className="lab-visually-hidden" htmlFor="lab-ask-input">{LAB_COPY.askPlaceholder}</label>
        <textarea
          id="lab-ask-input"
          data-testid="lab-ask-input"
          ref={node => {
            textareaRef.current = node
            if (typeof inputRef === 'function') inputRef(node)
            else if (inputRef) (inputRef as MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node
          }}
          rows={1}
          className="tc-input"
          value={draft}
          enterKeyHint={phoneSheet ? undefined : 'send'}
          onFocus={() => onKeyboardOpenChange?.(true)}
          onBlur={() => onKeyboardOpenChange?.(false)}
          onChange={event => onDraftChange(event.target.value)}
          onKeyDown={event => {
            const action = composerKey({
              key: event.key, shiftKey: event.shiftKey, metaKey: event.metaKey, ctrlKey: event.ctrlKey, altKey: event.altKey,
              isComposing: event.nativeEvent.isComposing,
            }, { phone: phoneSheet, empty: draft.length === 0 })
            if (action === 'send') {
              event.preventDefault()
              submit()
            } else if (action === 'recall') {
              const last = lastQuestion(turns)
              if (!last) return
              event.preventDefault()
              onDraftChange(last)
            }
            // Escape: the reader closes Chat itself (LabApp), like every other sheet.
          }}
        />
        {conversationState !== 'idle' ? (
          <button
            type="button"
            className={`tc-mark tc-talk-live is-${conversationState} is-alive`}
            onClick={onStopVoice ?? onMic}
            aria-label={LAB_COPY.stopTalk}
            data-testid="lab-ask-voice"
            data-voice-phase={conversationState}
            dangerouslySetInnerHTML={{ __html: ICONS.close }}
          />
        ) : null}
        {(!canSend || dictationState !== 'idle') && (
          <button
            type="button"
            className="tc-mark tc-mic"
            onClick={onMic}
            aria-label={dictationState === 'idle' ? 'Dictate a question' : 'Stop dictation'}
            aria-pressed={dictationState !== 'idle'}
            disabled={conversationState !== 'idle' || dictationState === 'transcribing'}
            data-testid="lab-ask-mic"
            dangerouslySetInnerHTML={{ __html: dictationState !== 'idle' ? ICONS.stop : ICONS.mic }}
          />
        )}
        {conversationState === 'idle' && !canSend && dictationState === 'idle' && onVoiceMode && (
          <button
            type="button"
            className="tc-mark tc-talk"
            onClick={onVoiceMode}
            aria-label={LAB_COPY.voiceModeLabel}
            data-testid="lab-ask-voice"
            data-voice-phase={conversationState}
            dangerouslySetInnerHTML={{ __html: ICONS.talk }}
          />
        )}
        <button
          type="button"
          className="tc-mark tc-send"
          hidden={!canSend}
          aria-label={LAB_COPY.sendLabel}
          data-testid="lab-ask-send"
          disabled={typedLoading || !canSend}
          onPointerDown={(event) => {
            // Keep the focused input (and mobile keyboard chrome) stable until
            // the activation completes. Otherwise the target can move between
            // pointer-down and click when the input blurs.
            event.preventDefault()
          }}
          onClick={submit}
          dangerouslySetInnerHTML={{ __html: ICONS.send }}
        />
      </div>
      {hint && !phoneSheet && <p className="tc-hint" data-testid="lab-ask-hint">{HINT_TEXT}</p>}
    </form>
  )
  const latestNode = (
    <button type="button" className="tc-latest" data-testid="lab-ask-latest" hidden={!away} onClick={() => {
      const node = threadRef.current
      if (node) scrollToLatest(node)
    }}><span dangerouslySetInnerHTML={{ __html: ICONS.down }} />Latest</button>
  )
  return (
    <aside
      style={minimized && desktopCompanion ? { display: 'none' } : undefined}
      ref={windowRef}
      data-window-minimized={minimized && desktopCompanion ? 'true' : undefined}
      className={`lab-ask tc ${empty ? 'is-empty' : 'has-thread'}${phoneSheet ? ' is-phone-sheet' : ''}${desktopCompanion ? ` is-desktop-companion is-${desktopCompanion}` : ''}`}
      data-testid="lab-ask-pane"
      data-companion={desktopCompanion || undefined}
      aria-label={LAB_DESKTOP_PANES[0]}
    >
      {desktopCompanion && !minimized && <button type="button" data-reader-window-resize data-testid="lab-ask-resizer" aria-label="Resize the conversation panel" />}
      {desktopCompanion && <div className="tc-handle" data-reader-window-handle aria-hidden="true" />}
      {onDone && (
        <button
          type="button"
          className="tc-close"
          aria-label={desktopCompanion ? `Close ${desktopCompanion}` : 'Close chat'}
          data-testid={desktopCompanion ? 'lab-desktop-companion-close' : 'lab-ask-done'}
          // With the keyboard up this is still the way back to the book: one
          // tap puts the keyboard away and closes Chat together. The press must
          // not move focus: a blur on press closes the keyboard, the sheet
          // reflows under the finger and the click never lands (QA 2026-10-06).
          onPointerDown={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onClick={close}
          dangerouslySetInnerHTML={{ __html: ICONS.close }}
        />
      )}
      {desktopCompanion && (
        <button type="button" className="tc-tab" aria-label={minimized ? 'Restore chat' : 'Minimize chat'} onClick={() => setMinimized(value => !value)} dangerouslySetInnerHTML={{ __html: ICONS.collapse }} />
      )}
      {onBackToContents && <button type="button" className="tc-older" onClick={onBackToContents}>← Back to contents</button>}
      <div className="tc-body">
        <div className="tc-thread" data-testid="lab-ask-thread" ref={threadRef} onScroll={onThreadScroll} data-hidden-turns={hidden}>
          {hidden > 0 && (
            <button type="button" className="tc-older" data-testid="lab-ask-older" onClick={revealOlder}>
              {hidden === 1 ? '1 earlier message' : `${hidden} earlier messages`}
            </button>
          )}
          {rows.map(row => {
            if (row.type === 'divider') return <p key={row.key} className="tc-divider" data-testid="lab-ask-location">{row.label}</p>
            const index = hidden + row.index
            const turn = turns[index]
            const live = streaming && index === turns.length - 1
            const unanswered = labAskTurnUnanswered(visibleTurns, row.index, typedLoading)
            const copied = copiedTurn === turn.id
            const acts = !live && (
              <div className={`tc-acts${index === kept ? ' is-kept' : ''}`}>
                <button
                  type="button"
                  className="tc-mark tc-copy"
                  aria-label={copied ? 'Copied' : turn.role === 'user' ? 'Copy question' : 'Copy answer'}
                  onClick={() => void copyTurn(turn)}
                  dangerouslySetInnerHTML={{ __html: copied ? ICONS.copied : ICONS.copy }}
                />
                {turn.timestamp != null && Number.isFinite(turn.timestamp) && (
                  <time className="tc-time" dateTime={new Date(turn.timestamp).toISOString()}>{timeLabel(turn.timestamp)}</time>
                )}
              </div>
            )
            return turn.role === 'user' ? (
              <div key={turn.id} className={`tc-turn tc-q${turn.highlightedText ? ' has-quote' : ''}`} data-chat-row data-testid="lab-ask-turn-user" data-turn-id={turn.id}>
                {turn.highlightedText && (
                  <button type="button" className="tc-quote" data-testid="lab-ask-history-passage" disabled={!onQuote} onClick={() => onQuote?.(turn)}>{cutQuote(turn.highlightedText)}</button>
                )}
                <div className="tc-bubble">{turn.content}</div>
                {unanswered && <span className="tc-note" data-testid="lab-ask-unanswered">{LAB_COPY.askUnanswered}</span>}
                {acts}
              </div>
            ) : (
              <div key={turn.id} className={`tc-turn tc-a${live ? ' is-streaming' : ''}`} data-chat-row data-testid="lab-ask-turn-assistant" data-turn-id={turn.id}>
                <div className="tc-answer"><div className="tc-md"><LabMarkdown>{turn.content}</LabMarkdown></div></div>
                {acts}
              </div>
            )
          })}
          {typedLoading && !streaming && (
            // The answer has not begun: only its cursor, no "thinking" line.
            <div className="tc-pending tc-a is-streaming" data-testid="lab-ask-pending"><div className="tc-answer"><span className="tc-cursor" role="status" aria-label="Answer on the way" /></div></div>
          )}
          <div className="tc-spacer" data-testid="lab-ask-thread-spacer" ref={spacerRef} aria-hidden="true" />
        </div>
        {!empty && <div className="tc-fade" aria-hidden="true" />}
        {latestNode}
      </div>
      {phoneSheet ? (
        <div className="lab-ask-chrome tc-chrome" data-testid="lab-ask-chrome">
          {syncingNode}
          {noticeNode}
          {dictationNode}
          {statusNode}
          {composerNode}
        </div>
      ) : (
        <>
          {syncingNode}
          {noticeNode}
          {dictationNode}
          {statusNode}
          {composerNode}
        </>
      )}
    </aside>
  )
}
