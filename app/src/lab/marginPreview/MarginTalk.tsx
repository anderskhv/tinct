/**
 * Talk in the margin reader (Anders, 22 Oct 2026: the margin reader's Talk is the book reader's, Grok's voice, never
 * the browser's): the book reader's voice session (useVoiceSession, /api/voice-session, a guest's two-minute trial
 * through /api/lab-voice-session) and its call surface (LabVoiceCall), run in the page that frames the margin reader,
 * as its narration is (useMarginListen). The frame (public/lab/addbook/js/reader.js) asks for a call with what the
 * reader is on (`start`: the book, the chapter, its paragraphs and the one in view, the recent conversation), and is
 * handed each spoken turn for its Chat thread (`TinctReaderTalk.turn`). A reader's own book: the session hears only
 * the passage on screen and the conversation, and no id or edition goes out (as the book reader's Talk on it).
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVoiceSession } from '../../hooks/useVoiceSession'
import { readSupabaseAccessToken } from '../labAuth'
import { gateLabAiAction } from '../labAccountPrompt'
import { LAB_COPY } from '../labCopy'
import { buildLabTalkReference } from '../labDirectVoice'
import { LAB_PREFS_KEY, parseLabPrefs } from '../labPrefs'
import { labCallView } from '../labVoiceCall'
import type { ChatMessage } from '../../types'

/** What the frame says the reader is on when Talk starts. */
export interface MarginTalkContext {
  bookTitle: string
  bookAuthor: string
  chapterNumber: number
  chapterLabel: string
  paragraphs: string[]
  paragraphIndex: number
  /** The Chat thread so far (its last turns are the session's reference). */
  turns: Array<{ role: 'user' | 'assistant'; content: string }>
}

/** The frame's way to Talk (MarginPreview.tsx puts it on window.TinctMarginPreview.talk). */
export interface MarginTalkApi {
  /** In the reader's tap; the context may still be gathering (a PDF page's text). */
  start: (context: MarginTalkContext | Promise<MarginTalkContext>) => void
  stop: () => void
  active: () => boolean
}

declare global {
  interface Window {
    /** The margin reader's side of Talk (reader.js): a spoken turn for its Chat thread, and the call's end. */
    TinctReaderTalk?: { turn: (role: 'user' | 'assistant', text: string) => void; ended: () => void; failed?: (message: string | null) => void }
  }
}

function voicePersona(): 'female' | 'male' {
  try { return parseLabPrefs(JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null'), 'desktop').voicePersona === 'male' ? 'male' : 'female' } catch { return 'female' }
}

const MarginTalkSurface = lazy(() => import('./MarginTalkSurface'))

const EMPTY_CONTEXT: MarginTalkContext = { bookTitle: '', bookAuthor: '', chapterNumber: 1, chapterLabel: '', paragraphs: [], paragraphIndex: 0, turns: [] }

/**
 * `bookId`: a Tinct book's id (its edition goes with it), or an own book's `userbook-<hex>` (`privateBook`: neither
 * goes out). `frame`: the margin reader's window, where each spoken turn is written into Chat.
 */
export function useMarginTalk(input: { bookId: string; editionKey: string | null; privateBook: boolean; frame: () => Window | null; signedIn: boolean; onAccount: () => void; pauseListen?: () => void }) {
  const { bookId, editionKey, privateBook, signedIn } = input
  const [context, setContext] = useState<MarginTalkContext | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const inputRef = useRef(input)
  inputRef.current = input
  useEffect(() => { void readSupabaseAccessToken().then(t => setToken(t ?? null), () => setToken(null)) }, [signedIn])

  const now = context ?? EMPTY_CONTEXT
  const reference = useMemo(() => context ? buildLabTalkReference({
    bookId: privateBook ? undefined : bookId, editionKey: privateBook ? undefined : editionKey ?? undefined,
    bookTitle: context.bookTitle, bookAuthor: context.bookAuthor, chapterLabel: context.chapterLabel, chapterNumber: context.chapterNumber,
    paragraphs: context.paragraphs, paragraphIndex: context.paragraphIndex,
  } as Parameters<typeof buildLabTalkReference>[0], context.turns) : undefined, [context, bookId, editionKey, privateBook])
  const toFrame = useCallback((role: 'user' | 'assistant', text: string) => {
    try { inputRef.current.frame()?.TinctReaderTalk?.turn(role, text) } catch { /* the frame went away */ }
  }, [])
  const voice = useVoiceSession({
    authToken: token,
    isAnonymous: !token,
    // Signed out: the guest Talk trial (one a day, two minutes), as in the book reader.
    labGuest: !signedIn,
    bookId,
    editionKey: privateBook ? undefined : editionKey ?? undefined,
    bookTitle: now.bookTitle,
    bookAuthor: now.bookAuthor,
    chapterNumber: now.chapterNumber,
    chapterTitle: now.chapterLabel,
    chapterParagraphs: now.paragraphs,
    paragraphIndex: now.paragraphIndex,
    visibleText: '',
    isAudioPlaying: false,
    pausePlayback: () => null,
    resumePlayback: () => {},
    recordMessage: () => {},
    appendLocalMessage: (message: ChatMessage) => { if (message.content?.trim()) toFrame(message.role === 'user' ? 'user' : 'assistant', message.content) },
    onBeforeUserTurn: () => (signedIn ? gateLabAiAction({ signedIn }).allowed : true),
    onGuestTrial: event => { if (event !== 'started') inputRef.current.onAccount() },
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    onEndConversation: () => end(),
    mode: 'conversation',
    reference,
    voicePersona: voicePersona(),
    warm: false,
  })
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  const end = useCallback(() => {
    voiceRef.current.stop()
    setContext(null)
    setNotice(null)
    try { inputRef.current.frame()?.TinctReaderTalk?.ended() } catch { /* the frame went away */ }
  }, [])
  // Grok's voice failed (setup, the connection, the account: any error): the call goes and Chat answers in text, never in
  // the browser's voice (Anders, 22 Oct 2026); the frame says why.
  const failure = context ? (notice ?? voice.error) : null
  useEffect(() => {
    if (!failure) return
    voiceRef.current.stop()
    setContext(null)
    setNotice(null)
    try { inputRef.current.frame()?.TinctReaderTalk?.failed?.(failure) } catch { /* the frame went away */ }
  }, [failure])
  // The call starts once the session has the reader's place (the context is set first, then start reads it).
  const startPending = useRef(false)
  useEffect(() => {
    if (!context || !startPending.current) return
    startPending.current = false
    void voiceRef.current.start({ authToken: token })
  }, [context, token])

  const api = useMemo<MarginTalkApi>(() => ({
    start: next => {
      setNotice(null)
      // A conversation and the narration do not talk over each other (the book reader pauses it for Talk too).
      try { inputRef.current.pauseListen?.() } catch { /* nothing playing */ }
      // In the reader's tap (it reaches this page too): the microphone is asked for now, the session starts once the
      // place is in its options.
      voiceRef.current.unlockAudio()
      voiceRef.current.prime()
      startPending.current = true
      void Promise.resolve(next).then(ctx => setContext({ ...ctx, turns: ctx.turns.slice(-8) }), () => { startPending.current = false; voiceRef.current.releasePrimed() })
    },
    stop: () => end(),
    active: () => voiceRef.current.isActive,
  }), [end])

  const view = labCallView({ connection: voice.connection, activity: voice.activity as never, micMuted: voice.micMuted, fullDuplex: true })
  let dark = false
  try { dark = !!input.frame()?.document.querySelector('.lab.is-night') } catch { /* the frame's look stays unknown */ }
  const surface = context ? (
    <Suspense fallback={null}>
      <MarginTalkSurface
        view={view}
        dark={dark}
        getAssistantLevel={voice.getAssistantLevel}
        notice={notice ?? voice.error}
        onMuteToggle={() => voice.setMicMuted(!voice.micMuted)}
        onEnd={end}
        onReconnect={() => void voice.start({ authToken: token })}
      />
    </Suspense>
  ) : null
  return { api, surface }
}
