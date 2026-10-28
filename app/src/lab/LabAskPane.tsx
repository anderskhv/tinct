import { consumeDismissGesture } from '../utils/consumeDismissGesture'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Ref, type MutableRefObject } from 'react'
import { LAB_DESKTOP_PANES, labVoicePhaseLabel } from './labChrome'
import { LabWait } from './LabWait'
import { useReaderWindow } from './useReaderWindow'
import { LAB_COPY } from './labCopy'
import type { LabAskTurn, LabConversationState } from './labAsk'
import { LabMarkdown } from './LabMarkdown'
// The thread both readers share (Anders, 9 Oct 2026; docs/chat/): its model,
// keys, press-and-hold and look live in public/lab/chat-thread.{js,css}, which
// the PDF reader for a reader's own books loads too.
import {
  bindPress, composerKey, COMPOSER_LINES, cutQuote, fitComposer, fitSpacer, ICONS, keptCopyIndex, lastQuestion, latestPill,
  questionTop, scrollToLatest, threadRows, timeLabel, WAIT_HTML, BACK_TO_BOOK_HTML,
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
  /** What the companion is looking up before the answer begins, e.g. "Reading Jeremiah 32…". */
  typedStatus?: string | null
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
  embeddedPhoneCard?: boolean
  composerPlaceholder?: string
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

/** iOS reports fractional scroll positions: within a pixel is "where we put it". */
function samePlace(a: number, b: number | null): boolean {
  return b !== null && Math.abs(a - b) <= 1
}

export function LabAskPane({
  conversationState,
  focusTurnId,
  onBackToContents,
  dictationState = 'idle',
  onStopVoice,
  voiceActive: _voiceActive,
  typedLoading,
  typedStatus = null,
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
  embeddedPhoneCard = false,
  composerPlaceholder,
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
  const panelRef = useRef<HTMLElement | null>(null)
  const setPanelRef = useCallback((node: HTMLElement | null) => { panelRef.current = node; windowRef(node) }, [windowRef])
  const dismissRef = useRef(onDone)
  dismissRef.current = onDone
  useEffect(() => {
    if (!desktopCompanion || minimized) return
    const outside = (event: PointerEvent) => {
      const target = event.target
      if (!dismissRef.current || !(target instanceof Node) || panelRef.current?.contains(target)) return
      consumeDismissGesture(event)
      dismissRef.current?.()
    }
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    return () => window.removeEventListener('pointerdown', outside, true)
  }, [desktopCompanion, minimized])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [copiedTurn, setCopiedTurn] = useState<string | null>(null)
  // Auto-grow to five lines (fitComposer: no scrollbar until the field really clips).
  useLayoutEffect(() => {
    const field = textareaRef.current
    if (field) fitComposer(field)
  }, [draft])
  // The "Latest" pill: the reader scrolled up and something new arrived below (latestPill).
  const [away, setAway] = useState(false)
  const latestRef = useRef<ReturnType<typeof latestPill> | null>(null)
  latestRef.current ??= latestPill()
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
  // The first turn the window shows. When the oldest turn changes because the
  // stored history was re-read (its oldest messages trimmed, older ones
  // added), the window keeps starting at that turn, so nothing moves on
  // screen; only a different history (another book) resets it.
  const firstShownIdRef = useRef<string | undefined>(undefined)
  if (oldestTurnIdRef.current !== turns[0]?.id) {
    oldestTurnIdRef.current = turns[0]?.id
    const keep = firstShownIdRef.current ? turns.findIndex(turn => turn.id === firstShownIdRef.current) : -1
    setHiddenCount(keep >= 0 ? keep : Math.max(0, turns.length - LAB_ASK_WINDOW))
  }
  // The cloud history landed and replaced what was on screen: show the newest
  // window of the reconciled thread, wherever the reader had scrolled to in
  // the stale copy. Leaving them parked in an old conversation that is no
  // longer the end of the thread is the bug this exists to prevent. Only the
  // first landing after the chat opens: a later refresh (the tab coming back)
  // leaves the reader where they are, so the window never seems to reload.
  const historyStatusRef = useRef(historyStatus)
  const repinRef = useRef(false)
  const landedRef = useRef(historyStatus !== 'loading')
  if (historyStatusRef.current !== historyStatus) {
    if (historyStatusRef.current === 'loading' && !landedRef.current) {
      landedRef.current = true
      repinRef.current = true
      setHiddenCount(Math.max(0, turns.length - LAB_ASK_WINDOW))
    }
    historyStatusRef.current = historyStatus
  }
  const hidden = Math.min(hiddenCount, Math.max(0, turns.length - 1))
  firstShownIdRef.current = turns[hidden]?.id
  const visibleTurns = hidden > 0 ? turns.slice(hidden) : turns
  // Height before older turns were prepended, so the message under the
  // reader's eye stays where it was.
  const revealAnchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  // Where we last pinned the thread, and whether the reader has scrolled
  // since. A reader who is reading older messages is never yanked down;
  // one who is at (or within LAB_ASK_FOLLOW_PX of) the bottom keeps following.
  const pinnedScrollTopRef = useRef<number | null>(null)
  const nearBottomRef = useRef(true)
  // The reader's newest question, held near the top while its answer arrives
  // (Anders, 10 Oct 2026: "keep the screen motion calm as the answer
  // generates and let the user scroll"). On send the thread scrolls once so
  // the question sits near the top; after that nothing follows the answer.
  const anchorIdRef = useRef<string | null>(null)
  // Room below the question so it can sit near the top while its answer is
  // short; it shrinks as the answer grows, so the text fills downward under a
  // still question and the view never has to move.
  const spacerRef = useRef<HTMLDivElement | null>(null)
  // Opened on a clean window and nothing new since: the space follows the thread's height.
  const cleanOpenRef = useRef(false)
  const canSend = draft.trim().length > 0
  const empty = turns.length === 0 && !typedLoading
  const syncing = historyStatus === 'loading'

  const setSpacer = (_node: HTMLDivElement, value: null) => {
    if (spacerRef.current && value === null) spacerRef.current.style.height = '0px'
  }

  const anchorRow = (node: HTMLDivElement): HTMLElement | null => {
    const id = anchorIdRef.current
    if (!id) return null
    return Array.from(node.querySelectorAll<HTMLElement>('[data-turn-id]')).find(row => row.dataset.turnId === id) ?? null
  }

  /** The Latest pill: never where the thread put the view (after a send, on open); only once the reader scrolled up and more arrived below. */
  const measureAway = useCallback((node: HTMLDivElement) => {
    setAway(latestRef.current!.shows(node, pinnedScrollTopRef.current === null))
  }, [])

  const pinToBottom = useCallback((node: HTMLDivElement) => {
    node.scrollTop = node.scrollHeight
    pinnedScrollTopRef.current = node.scrollTop
    nearBottomRef.current = true
    latestRef.current!.placed(node)
  }, [])

  /**
   * Keep the held question reachable near the top as the thread changes: size
   * the room below it, and — only while the reader has not scrolled since we
   * put them there — keep it there (the phone keyboard closing on send makes
   * the window taller).
   */
  const holdQuestion = useCallback((node: HTMLDivElement, row: HTMLElement, place: boolean) => {
    const top = questionTop(node, row)
    fitSpacer(node, top)
    if (place) {
      node.scrollTop = top
      pinnedScrollTopRef.current = node.scrollTop
      nearBottomRef.current = false
      latestRef.current!.placed(node)
    }
  }, [])

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
      measureAway(node)
      revealOlder()
      return
    }
    // Under a held question, a view pulled up to the thread's new end is the
    // browser clamping, not the reader: the phone keyboard closing on send
    // makes the thread taller than its writing space for a moment, and WebKit
    // reports that scroll before the resize observer refits the space. Put
    // the question back near the top (14 Oct 2026: it sat at the foot with
    // the Latest pill over its answer).
    const held = anchorRow(node)
    const pinned = pinnedScrollTopRef.current
    if (held && pinned !== null && node.scrollTop < pinned - 1 && node.scrollTop >= node.scrollHeight - node.clientHeight - 1) {
      holdQuestion(node, held, true)
    } else if (!samePlace(node.scrollTop, pinned)) {
      pinnedScrollTopRef.current = null
      nearBottomRef.current = isNearBottom(node)
    }
    measureAway(node)
    // anchorRow reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, holdQuestion, measureAway, revealOlder])

  // Older turns were prepended: keep the reader's line still.
  useLayoutEffect(() => {
    const node = threadRef.current
    const anchor = revealAnchorRef.current
    if (!node || !anchor) return
    revealAnchorRef.current = null
    const grown = node.scrollHeight - anchor.scrollHeight
    node.scrollTop = Math.max(0, anchor.scrollTop + grown)
    latestRef.current!.shift(grown)
    pinnedScrollTopRef.current = null
    nearBottomRef.current = isNearBottom(node)
  }, [hidden])

  useLayoutEffect(() => {
    const node = threadRef.current
    if (!node) return
    const lastTurn = turns[turns.length - 1]
    const newTurn = !!lastTurn && lastTurn.id !== lastTurnIdRef.current
    const justOpened = !didPositionThreadRef.current || repinRef.current
    // Under a held question, the browser may have pulled the view up because
    // the thread got shorter for a moment (the waiting dots giving way to the
    // first words): that is not the reader scrolling. Put it back.
    const held = anchorRow(node)
    const pinned = pinnedScrollTopRef.current
    if (held && pinned !== null && node.scrollTop < pinned - 1 && node.scrollTop >= node.scrollHeight - node.clientHeight - 1) {
      holdQuestion(node, held, false)
      node.scrollTop = pinned
    }
    // Detect scrolling that did not raise a scroll event (tests, programmatic).
    if (pinnedScrollTopRef.current !== null && !samePlace(node.scrollTop, pinnedScrollTopRef.current)) {
      pinnedScrollTopRef.current = null
      nearBottomRef.current = isNearBottom(node)
    }
    // The reader's own question among the turns added since the last render
    // (with an Explain, the question and its answer arrive together).
    // An empty thread counts too: its first question is held like any other.
    const before = lastTurnIdRef.current ? turns.findIndex(turn => turn.id === lastTurnIdRef.current) : -1
    const asked = newTurn && !justOpened && (before >= 0 || lastTurnIdRef.current === null)
      ? [...turns.slice(before + 1)].reverse().find(turn => turn.role === 'user' && turn.source !== 'voice')
      : undefined
    if (asked) {
      // Sent: scroll once, so the question sits near the top with a little of
      // the previous answer above it. The answer grows downward from here.
      anchorIdRef.current = asked.id
      cleanOpenRef.current = false
      const row = anchorRow(node)
      if (row) holdQuestion(node, row, true)
    } else if (justOpened) {
      anchorIdRef.current = null
      setSpacer(node, null)
      // Open on a clean window: one screen of writing space above the
      // composer, the whole thread immediately above it, reached by scrolling up.
      if (!focusTurnId && !typedLoading && spacerRef.current) {
        spacerRef.current.style.height = `${node.clientHeight}px`
        cleanOpenRef.current = true
      }
      pinToBottom(node)
    } else if (anchorIdRef.current && anchorRow(node)) {
      // The answer arriving (or finishing) under a held question: the room
      // below shrinks as it grows; the view does not move.
      holdQuestion(node, anchorRow(node)!, false)
    } else {
      if (newTurn) {
        setSpacer(node, null)
        cleanOpenRef.current = false
      }
      // Turns that are not the reader's own question (Talk, another device):
      // follow only a reader who is already at the bottom.
      if ((newTurn && lastTurn.role === 'user') || !desktopCompanion && (pinnedScrollTopRef.current !== null || nearBottomRef.current)) pinToBottom(node)
    }
    measureAway(node)
    didPositionThreadRef.current = true
    repinRef.current = false
    lastTurnIdRef.current = lastTurn?.id ?? null
  }, [desktopCompanion, focusTurnId, hidden, holdQuestion, measureAway, pinToBottom, turns, typedLoading])

  const focusedTurnRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!focusTurnId || focusedTurnRef.current === focusTurnId) return
    const index = turns.findIndex(turn => turn.id === focusTurnId)
    if (index < 0) return
    if (hidden > index) { setHiddenCount(index); return }
    const body = threadRef.current
    const row = Array.from(body?.querySelectorAll<HTMLElement>('[data-turn-id]') || []).find(node => node.dataset.turnId === focusTurnId)
    if (!body || !row) return
    // A short answer needs the same trailing room as a newly sent question;
    // otherwise scrollTop clamps and leaves the follow-up at the bottom.
    anchorIdRef.current = focusTurnId
    cleanOpenRef.current = false
    holdQuestion(body, row, true)
    focusedTurnRef.current = focusTurnId
  }, [focusTurnId, hidden, turns, holdQuestion])

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
      const held = anchorRow(current)
      if (held) {
        // The keyboard closing after send: the question stays where it was put,
        // unless the reader has scrolled since.
        holdQuestion(current, held, pinnedScrollTopRef.current !== null)
        measureAway(current)
        return
      }
      const resizedClean = cleanOpenRef.current && (pinnedScrollTopRef.current !== null || nearBottomRef.current)
      if (resizedClean && spacerRef.current) spacerRef.current.style.height = `${current.clientHeight}px`
      // A newly opened desktop window also needs its blank writing space
      // kept below history while the panel reaches its final size.
      if (resizedClean || !desktopCompanion && (pinnedScrollTopRef.current !== null || nearBottomRef.current)) pinToBottom(current)
    })
    observer.observe(node)
    return () => observer.disconnect()
    // anchorRow reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopCompanion, empty, holdQuestion, measureAway, pinToBottom])

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
    <p className="tc-status" data-testid="lab-ask-syncing"><LabWait label={LAB_COPY.askHistorySyncing} size={14} /></p>
  )
  const noticeNode = (notice || localError) && (
    <p className="tc-status" data-testid="lab-ask-notice">{notice || localError}{onRetry && !typedLoading && <button type="button" onClick={onRetry}>Try again</button>}</p>
  )
  const dictationNode = dictationState !== 'idle' && (
    <p className="tc-status" role="status" data-testid="lab-dictation-status">
      {dictationState === 'starting' ? <LabWait label="Starting microphone…" size={14} live={false} />
        : dictationState === 'transcribing' ? <LabWait label="Writing down what you said…" size={14} live={false} />
        : 'Listening — tap stop to finish'}
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
        textareaRef.current?.focus({ preventScroll: true })
      }}
    >
      {attachment && (
        <section className="tc-attached" data-testid="lab-ask-attachment" aria-label={attachment.kind === 'figure' ? 'Figure attached to question' : 'Highlighted passage attached to question'} tabIndex={0}>
          {cutQuote(attachment.text)}
          <button type="button" className="tc-mark" aria-label="Remove" onClick={() => {
            onRemoveAttachment?.()
            window.requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }))
          }} dangerouslySetInnerHTML={{ __html: ICONS.close }} />
        </section>
      )}
      <div className={`tc-field${draft.length === 0 ? ' is-empty' : ''}`}>
        <label className="lab-visually-hidden" htmlFor="lab-ask-input">{composerPlaceholder || LAB_COPY.askPlaceholder}</label>
        <textarea
          id="lab-ask-input"
          data-testid="lab-ask-input"
          ref={node => {
            textareaRef.current = node
            if (typeof inputRef === 'function') inputRef(node)
            else if (inputRef) (inputRef as MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node
          }}
          rows={1}
          placeholder={composerPlaceholder}
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
      ref={setPanelRef}
      data-window-minimized={minimized && desktopCompanion ? 'true' : undefined}
      className={`lab-ask tc ${empty ? 'is-empty' : 'has-thread'}${phoneSheet ? ' is-phone-sheet' : ''}${embeddedPhoneCard ? ' is-phone-card-chat' : ''}${desktopCompanion ? ` is-desktop-companion is-${desktopCompanion}` : ''}`}
      data-testid="lab-ask-pane"
      data-companion={desktopCompanion || undefined}
      aria-label={LAB_DESKTOP_PANES[0]}
    >
      {desktopCompanion && !minimized && <button type="button" data-reader-window-resize data-testid="lab-ask-resizer" aria-label="Resize the conversation panel" />}
      {desktopCompanion && <div className="tc-handle" data-reader-window-handle aria-hidden="true" />}
      {onDone && (
        <button
          type="button"
          // "Back to book" (Anders, 10 Oct 2026), the pre-redesign control, in place of the faint ×.
          className="tc-back"
          data-reader-window-control
          data-testid={desktopCompanion ? 'lab-desktop-companion-close' : 'lab-ask-done'}
          // With the keyboard up this is still the way back to the book: one
          // tap puts the keyboard away and closes Chat together. The press must
          // not move focus: a blur on press closes the keyboard, the sheet
          // reflows under the finger and the click never lands (QA 2026-10-06).
          onPointerDown={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onClick={close}
          dangerouslySetInnerHTML={{ __html: BACK_TO_BOOK_HTML }}
        />
      )}
      {desktopCompanion && (
        <button type="button" className="tc-tab" data-reader-window-control aria-label={minimized ? 'Restore chat' : 'Minimize chat'} onClick={() => setMinimized(value => !value)} dangerouslySetInnerHTML={{ __html: ICONS.collapse }} />
      )}
      {onBackToContents && <button type="button" className="tc-older" onClick={onBackToContents}>← Back to contents</button>}
      <div className="tc-body">
        <div className="tc-thread" data-testid="lab-ask-thread" ref={threadRef} onScroll={onThreadScroll} data-hidden-turns={hidden}>
          {hidden > 0 && (
            <button type="button" className="tc-older" data-testid="lab-ask-older" onClick={revealOlder}>
              {hidden === 1 ? '1 earlier message' : `${hidden} earlier messages`}
            </button>
          )}
          {embeddedPhoneCard && visibleTurns[0] && placeOf(visibleTurns[0]) && <p className="tc-divider" data-testid="lab-ask-initial-location">{placeOf(visibleTurns[0])}</p>}
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
                  <div className="tc-quote" data-testid="lab-ask-history-passage">{cutQuote(turn.highlightedText)}</div>
                )}
                <div className="tc-bubble">{turn.content}</div>
                {unanswered && <span className="tc-note" data-testid="lab-ask-unanswered">{LAB_COPY.askUnanswered}</span>}
                {acts}
              </div>
            ) : (
              <div key={turn.id} className={`tc-turn tc-a${live ? ' is-streaming' : ''}`} data-chat-row data-testid="lab-ask-turn-assistant" data-turn-id={turn.id}>
                <div className="tc-answer"><div className="tc-md"><LabMarkdown words={live}>{turn.content}</LabMarkdown></div></div>
                {acts}
              </div>
            )
          })}
          {typedLoading && !streaming && (
            // The answer has not begun: three faint dots breathing slowly, no
            // "thinking" line. During a book or source lookup a quiet line
            // says what is being read; the answer replaces it.
            <div className="tc-pending tc-a is-streaming" data-testid="lab-ask-pending">
              <div className="tc-answer" dangerouslySetInnerHTML={{ __html: WAIT_HTML }} />
              {typedStatus && <p className="tc-lookup" data-testid="lab-ask-lookup" aria-live="polite">{typedStatus}</p>}
            </div>
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
