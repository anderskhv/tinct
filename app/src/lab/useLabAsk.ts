import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useTinctVoiceTools } from '../hooks/useTinctVoiceTools'
import { useVoiceSession } from '../hooks/useVoiceSession'
import { COMPANION_EFFORT_TYPED, COMPANION_MODEL } from '../companionModel'
import { apiUrl } from '../utils/apiUrl'
import type { TinctVoiceToolAdapter } from '../voice/tinctTools'
import {
  affirmativeAnswersLookupOffer,
  applyLabVoiceTurn,
  buildLabAskInstructions,
  isResumeListenCommand,
  LAB_VOICE_TOOLS,
  labConversationState,
  labReadingAngle,
  labTypedPace,
  labTypedResume,
  labTypedSkip,
  labTypedSpeed,
  type AssistantPace,
  type LabAskContext,
  type LabAskTurn,
  type LabPlaybackSkip,
} from './labAsk'
import {
  buildLabTalkInstructions,
  labCompanionBookFields,
  queryLabCompanion,
  readAnthropicResponse,
  type CompanionAskNotify,
} from './labCompanion'
import { buildLabReadingTrail, openingLineOf, recordTrailVisit, type LabReadingTrailEntry, type LabTrailVisit } from './labReadingTrail'
import { buildLabTalkInstructionsV2, LAB_VOICE_TOOLS_V2, labConversationStateV2, queryLabCompanionV2 } from './labVoiceV2'
import type { LabVoiceVersion } from './labRoute'
import { readSupabaseAccessToken, resolveLabVoiceToken } from './labAuth'
import { LAB_COPY } from './labCopy'
import {
  createLabChatHistorySync,
  dumpLabTalkTurns,
  fetchLabChatHistoryCloud,
  LAB_CHAT_BOOK_ID,
  mergeLabChatHistoryStates,
  persistLabTalkTurn,
  readLabAskTurns,
  readLabChatHistoryLocal,
  readLabTalkHistory,
  resolveLabChatBook,
  writeLabChatHistoryLocal,
} from './labTalkHistory'
import {
  buildLabVoiceControlInstructions,
  labVoiceActionEntry,
  mergeLabVoiceTools,
  shouldResumePlaybackAfterNavigation,
  type LabPlaybackNavigationOutcome,
  type LabVoiceActionEntry,
  type LabVoiceViewSnapshot,
} from './labVoiceControls'

let labAskId = 0
function nextId() {
  return `lab_ask_${Date.now()}_${++labAskId}`
}

export interface UseLabAskOptions {
  bookTitle: string
  bookAuthor: string
  headerBook?: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  authToken?: string | null
  /** Registry book id + edition key. Both present → requests carry `book` and the worker can read other chapters. */
  bookId?: string
  editionKey?: string
  chapterCount?: number
  /** Rendered page for the trail's "Now:" line; read at send time. */
  getPage?: () => { pageNumber: number; totalPages: number } | null
  /** True when opening this companion paused a playing audiobook (the session started from playback). */
  playbackInterrupted?: () => boolean
  onResumeListen?: () => void
  onSetPlaybackSpeed?: (rate: number) => void
  onPlaybackSkip?: (kind: LabPlaybackSkip) => void | LabPlaybackNavigationOutcome | Promise<void | LabPlaybackNavigationOutcome>
  voiceToolAdapter: TinctVoiceToolAdapter<LabVoiceViewSnapshot>
  onVoiceToolAction?: (entry: LabVoiceActionEntry) => void
  onVoiceToolSessionStart?: () => void
  /** `'v2'` only from `/lab/reader?voice=v2`. Defaults to Voice V1. */
  voiceVersion?: LabVoiceVersion
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session } = useAuth()
  const voiceVersion: LabVoiceVersion = options.voiceVersion === 'v2' ? 'v2' : 'v1'
  const isVoiceV2 = voiceVersion === 'v2'
  const chatBook = resolveLabChatBook(options.headerBook || options.chapterLabel)
  const chatBookId = chatBook?.bookId ?? ''
  const [typedLoading, setTypedLoading] = useState(false)
  const [turns, setTurns] = useState<LabAskTurn[]>(() => readLabAskTurns(chatBookId))
  const loadedForBookRef = useRef(chatBookId)
  if (loadedForBookRef.current !== chatBookId) {
    loadedForBookRef.current = chatBookId
    const hydrated = readLabAskTurns(chatBookId)
    setTurns(hydrated)
    dumpLabTalkTurns(hydrated)
  }
  const [notice, setNotice] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [assistantPace, setAssistantPace] = useState<AssistantPace>('normal')
  const sendingRef = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const chatBookRef = useRef(chatBook)
  chatBookRef.current = chatBook

  const sessionToken = session?.access_token ?? null
  const viewerId = session?.user?.id ?? null

  // Chapters the reader visited during this session, with their opening
  // lines, for the companion's reading trail. Read-only observation of the
  // rendered tuple; nothing here changes position logic.
  const trailVisitsRef = useRef<LabTrailVisit[]>([])
  const trailBookRef = useRef(options.bookId)
  if (trailBookRef.current !== options.bookId) {
    trailBookRef.current = options.bookId
    trailVisitsRef.current = []
  }
  useEffect(() => {
    if (options.chapterNumber == null || options.paragraphs.length === 0) return
    trailVisitsRef.current = recordTrailVisit(trailVisitsRef.current, {
      chapterNumber: options.chapterNumber,
      label: options.chapterLabel,
      openingLine: openingLineOf(options.paragraphs),
      at: Date.now(),
    })
  }, [options.bookId, options.chapterNumber, options.chapterLabel, options.paragraphs])

  const readTrail = useCallback(async (): Promise<LabReadingTrailEntry[]> => {
    const current = optionsRef.current
    if (!current.bookId) return []
    try {
      return await buildLabReadingTrail({
        bookId: current.bookId,
        editionKey: current.editionKey,
        currentChapter: current.chapterNumber,
        visits: trailVisitsRef.current,
        viewer: viewerId,
      })
    } catch {
      return []
    }
  }, [viewerId])

  const askContextNow = useCallback((readingTrail: LabReadingTrailEntry[]): LabAskContext => {
    const current = optionsRef.current
    const page = current.getPage?.() ?? null
    return {
      bookTitle: current.bookTitle,
      bookAuthor: current.bookAuthor,
      chapterLabel: current.chapterLabel,
      chapterNumber: current.chapterNumber,
      editionLabel: current.editionLabel,
      paragraphs: current.paragraphs,
      paragraphIndex: current.paragraphIndex,
      readingAngle: labReadingAngle(),
      bookId: current.bookId,
      editionKey: current.editionKey,
      chapterCount: current.chapterCount,
      pageNumber: page?.pageNumber,
      totalPages: page?.totalPages,
      readingTrail,
    }
  }, [])
  const liveToken = options.authToken !== undefined ? options.authToken : sessionToken
  const syncRef = useRef(createLabChatHistorySync({ token: liveToken }))
  useEffect(() => {
    syncRef.current = createLabChatHistorySync({ token: liveToken })
  }, [liveToken])

  useEffect(() => {
    const onOnline = () => { void syncRef.current.flush() }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  useEffect(() => {
    if (!liveToken) return
    let cancelled = false
    void fetchLabChatHistoryCloud(liveToken).then((cloud) => {
      if (cancelled || !cloud) return
      const merged = mergeLabChatHistoryStates(readLabChatHistoryLocal(), cloud)
      writeLabChatHistoryLocal(merged)
      const bookId = chatBookRef.current?.bookId ?? ''
      if (loadedForBookRef.current !== bookId) return
      const hydrated = readLabAskTurns(bookId, merged)
      setTurns(hydrated)
      dumpLabTalkTurns(hydrated)
    })
    return () => { cancelled = true }
  }, [liveToken])

  const askContext = useMemo(() => ({
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    chapterLabel: options.chapterLabel,
    chapterNumber: options.chapterNumber,
    editionLabel: options.editionLabel,
    paragraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    readingAngle: labReadingAngle(),
    bookId: options.bookId,
    editionKey: options.editionKey,
  }), [
    options.bookAuthor,
    options.bookTitle,
    options.chapterLabel,
    options.chapterNumber,
    options.editionLabel,
    options.paragraphIndex,
    options.paragraphs,
    options.bookId,
    options.editionKey,
  ])
  const rememberedLabTurns = useMemo(() => {
    const acrossLibrary = readLabTalkHistory()
      .sort((a, b) => a.endTimestamp - b.endTimestamp)
      .flatMap(conversation => conversation.messages.map(message => ({
        role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: `${conversation.bookId}: ${message.content}`,
        cancelled: message.isComplete === false,
      })))
    return acrossLibrary.length > 0 ? acrossLibrary : turns
  }, [turns])
  const talkInstructions = useMemo(
    () => buildLabVoiceControlInstructions(
      isVoiceV2 ? buildLabTalkInstructionsV2(askContext) : buildLabTalkInstructions(askContext),
      rememberedLabTurns,
    ),
    [askContext, isVoiceV2, rememberedLabTurns],
  )
  const tinctVoiceTools = useTinctVoiceTools(options.voiceToolAdapter)
  const mergedVoiceTools = useMemo(
    () => mergeLabVoiceTools(isVoiceV2 ? LAB_VOICE_TOOLS_V2 : LAB_VOICE_TOOLS),
    [isVoiceV2],
  )

  const onTinctVoiceTool = useCallback(async (
    name: string,
    arguments_: Record<string, unknown>,
    callId: string,
  ) => {
    const result = await tinctVoiceTools.onTool(name, arguments_, callId)
    optionsRef.current.onVoiceToolAction?.(labVoiceActionEntry(name, arguments_, callId, result))
    return result
  }, [tinctVoiceTools.onTool])

  const onCompanionAsk = useCallback(async (question: string, notify?: CompanionAskNotify) => {
    const authToken = await resolveLabVoiceToken({
      override: optionsRef.current.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    const query = isVoiceV2 ? queryLabCompanionV2 : queryLabCompanion
    const context = askContextNow(await readTrail())
    return query({
      authToken,
      system: buildLabAskInstructions(context),
      question,
      context,
      onDelta: notify?.onDelta,
      onFirstSpeakable: notify?.onFirstSpeakable,
    })
  }, [askContextNow, isVoiceV2, readTrail, sessionToken])

  const appendLocalMessage = useCallback((message: ChatMessage) => {
    const content = (message.content || '').trim()
    if (!content) return
    if (message.role === 'user' && isResumeListenCommand(content)) {
      optionsRef.current.onResumeListen?.()
      return
    }
    const incoming: LabAskTurn = {
      id: message.id || nextId(),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content,
      source: 'voice',
      chapterNumber: message.chapterNumber ?? optionsRef.current.chapterNumber,
      paragraphIndex: message.paragraphIndex ?? optionsRef.current.paragraphIndex,
      cancelled: message.isComplete === false,
    }
    setTurns(current => {
      const next = applyLabVoiceTurn(current, incoming)
      dumpLabTalkTurns(next)
      return next
    })
  }, [])

  // Same hook as App.tsx + AudioStrip. Lab supplies its own instructions
  // so production buildVoiceInstructions stays the in-car brief.
  const voice = useVoiceSession({
    authToken: liveToken,
    isAnonymous: !liveToken,
    labGuest: true,
    bookId: LAB_CHAT_BOOK_ID,
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    chapterNumber: options.chapterNumber ?? 1,
    chapterTitle: options.chapterLabel,
    readingObjective: labReadingAngle(),
    chapterParagraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    visibleText: talkInstructions,
    isAudioPlaying: false,
    pausePlayback: () => null,
    resumePlayback: () => { optionsRef.current.onResumeListen?.() },
    recordMessage: (message, chapterNumber, paragraphIndex) => {
      const book = chatBookRef.current
      if (!book) return
      const state = persistLabTalkTurn(message, chapterNumber, paragraphIndex, book)
      syncRef.current.persist(state)
    },
    appendLocalMessage,
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    mode: 'conversation',
    instructions: talkInstructions,
    tools: mergedVoiceTools,
    onApplicationTool: onTinctVoiceTool,
    onSessionStart: () => {
      tinctVoiceTools.resetUndo()
      optionsRef.current.onVoiceToolSessionStart?.()
    },
    onCompanionAsk,
    honorModelResume: true,
    setPlaybackSpeed: (rate) => optionsRef.current.onSetPlaybackSpeed?.(rate),
    skipPlayback: (kind) => optionsRef.current.onPlaybackSkip?.(kind),
    assistantPace,
    onSetAssistantPace: setAssistantPace,
    voiceVersion,
  })

  // Voice V2: a mid-session failure is shown, not swallowed. The notice
  // clears the moment the reader starts a new turn. V1 keeps its own path.
  useEffect(() => {
    if (!isVoiceV2 || !voice.error) return
    setNotice(voice.error)
  }, [isVoiceV2, voice.error])
  useEffect(() => {
    if (!isVoiceV2 || !voice.userSpeechStarted) return
    setNotice(null)
  }, [isVoiceV2, voice.userSpeechStarted])

  const startVoice = useCallback(async (): Promise<boolean> => {
    if (voice.isActive || starting) return true
    voice.unlockAudio()
    setNotice(null)
    const knownToken = options.authToken !== undefined ? options.authToken : sessionToken
    if (knownToken) setStarting(true)
    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    if (!knownToken) setStarting(true)
    const snapshot = await voice.start({ authToken })
    setStarting(false)
    if (snapshot.error) {
      setNotice(snapshot.error)
      return false
    }
    if (!snapshot.isActive) {
      setNotice(current => current || LAB_COPY.voiceStartFailed)
      return false
    }
    return true
  }, [options.authToken, sessionToken, starting, voice.isActive, voice.start])

  const stopVoice = useCallback(() => {
    setStarting(false)
    voice.stop()
  }, [voice.stop])

  const failStart = useCallback((message?: string) => {
    setStarting(false)
    voice.stop()
    setNotice(current => current || message || LAB_COPY.voiceStartFailed)
  }, [voice.stop])

  const toggleInChatVoice = useCallback(async () => {
    if (voice.isActive || starting) {
      stopVoice()
      return
    }
    await startVoice()
  }, [startVoice, starting, stopVoice, voice.isActive])

  const sendTyped = useCallback(async (content: string) => {
    const text = content.trim()
    if (!text || sendingRef.current) return
    if (isResumeListenCommand(text)) {
      options.onResumeListen?.()
      return
    }
    sendingRef.current = true

    const userTurn: LabAskTurn = {
      id: nextId(),
      role: 'user',
      content: text,
      source: 'typed',
      chapterNumber: options.chapterNumber ?? 1,
      paragraphIndex: options.paragraphIndex,
    }
    setTurns(current => {
      const next = [...current, userTurn]
      dumpLabTalkTurns(next)
      return next
    })
    const book = chatBookRef.current
    if (book) {
      const state = persistLabTalkTurn({
        id: userTurn.id,
        role: 'user',
        content: text,
        timestamp: Date.now(),
        bookId: book.bookId,
        chapterNumber: options.chapterNumber ?? 1,
        isComplete: true,
        source: 'text',
      }, options.chapterNumber ?? 1, options.paragraphIndex, book)
      syncRef.current.persist(state)
    }
    setNotice(null)

    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })

    setTypedLoading(true)
    try {
      const previousAssistant = [...turns].reverse().find(turn => turn.role === 'assistant' && !turn.cancelled)?.content ?? null
      // "Yes!!" after "we could go back a few chapters and have a look?" is
      // consent to the lookup. The model gets the tools; the app ignores any
      // move or resume marker it might still emit for that turn.
      const lookupConsent = affirmativeAnswersLookupOffer(text, previousAssistant)
      const history = [...turns, userTurn]
        .slice(-20)
        .map(turn => ({ role: turn.role, content: turn.content }))
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) headers.Authorization = `Bearer ${authToken}`
      const context = askContextNow(await readTrail())
      const response = await fetch(apiUrl(authToken ? '/api/chat' : '/api/lab-chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: COMPANION_MODEL,
          max_tokens: 1024,
          stream: true,
          effort: COMPANION_EFFORT_TYPED,
          system: buildLabAskInstructions(context),
          messages: history,
          ...labCompanionBookFields(context),
        }),
      })
      if (response.status === 401) {
        setNotice(authToken ? LAB_COPY.signInAsk : LAB_COPY.askUnavailable)
        return
      }
      if (response.status === 402) {
        setNotice(LAB_COPY.balanceEmpty)
        return
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as {
          error?: { message?: string } | string
        }
        const message = typeof data.error === 'string'
          ? data.error
          : data.error?.message || LAB_COPY.askUnavailable
        setNotice(message)
        return
      }
      let assistantId = nextId()
      const rawReply = await readAnthropicResponse(response, (accumulated) => {
        const content = accumulated.trim()
        if (!content) return
        setTurns(current => {
          const last = current[current.length - 1]
          const next = last?.id === assistantId
            ? [...current.slice(0, -1), { ...last, content }]
            : [...current, {
                id: assistantId,
                role: 'assistant' as const,
                content,
                source: 'typed' as const,
                chapterNumber: options.chapterNumber ?? 1,
                paragraphIndex: options.paragraphIndex,
              }]
          dumpLabTalkTurns(next)
          return next
        })
      })
      const resumed = labTypedResume(rawReply)
      const parsed = labTypedSpeed(resumed.text)
      const paced = labTypedPace(parsed.text)
      const skipped = labTypedSkip(paced.text)
      if (skipped.text) {
        const assistantTurn: LabAskTurn = {
          id: assistantId || nextId(),
          role: 'assistant',
          content: skipped.text,
          source: 'typed',
          chapterNumber: options.chapterNumber ?? 1,
          paragraphIndex: options.paragraphIndex,
        }
        setTurns(current => {
          const last = current[current.length - 1]
          const next = last?.id === assistantTurn.id
            ? [...current.slice(0, -1), assistantTurn]
            : [...current, assistantTurn]
          dumpLabTalkTurns(next)
          return next
        })
        if (book) {
          const state = persistLabTalkTurn({
            id: assistantTurn.id,
            role: 'assistant',
            content: skipped.text,
            timestamp: Date.now(),
            bookId: book.bookId,
            chapterNumber: options.chapterNumber ?? 1,
            isComplete: true,
            source: 'text',
          }, options.chapterNumber ?? 1, options.paragraphIndex, book)
          syncRef.current.persist(state)
        }
      }
      if (parsed.speed != null) {
        optionsRef.current.onSetPlaybackSpeed?.(parsed.speed)
      }
      if (paced.pace) {
        setAssistantPace(paced.pace)
        voice.setAssistantPace(paced.pace)
      }
      const skip = lookupConsent ? null : skipped.skip
      const resume = lookupConsent ? false : resumed.resume
      let resumeAfterNavigation = false
      if (skip) {
        // A move opens the reader at the new place. It plays only when this
        // companion session began from playback or the reader asked to hear
        // the book; a move made to look something up never starts audio.
        const outcome = await optionsRef.current.onPlaybackSkip?.(skip)
        resumeAfterNavigation = outcome && typeof outcome === 'object'
          ? outcome.resumePlayback
          : shouldResumePlaybackAfterNavigation({
              sessionStartedFromPlayback: optionsRef.current.playbackInterrupted?.() === true,
              explicitPlayRequest: resume,
            })
      }
      if (resume || resumeAfterNavigation) {
        // Let a chapter skip commit (header + listen chapter) before Play.
        window.setTimeout(() => optionsRef.current.onResumeListen?.(), 0)
      }
    } catch {
      setNotice(LAB_COPY.askUnavailable)
    } finally {
      sendingRef.current = false
      setTypedLoading(false)
    }
  }, [askContextNow, options.authToken, readTrail, sessionToken, turns])

  return {
    turns,
    notice,
    typedLoading,
    conversationState: isVoiceV2
      ? labConversationStateV2({ activity: voice.activity, starting })
      : labConversationState({
        voiceState: voice.state,
        error: voice.error,
        starting,
      }),
    voiceVersion,
    voiceActive: voice.isActive || starting,
    userSpeechStarted: voice.userSpeechStarted,
    startVoice,
    stopVoice,
    failStart,
    toggleInChatVoice,
    sendTyped,
  }
}
