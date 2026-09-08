import type { VoiceTrial } from '../voice/voiceTrial'
import { BOOK_PASSAGE_TOOL, buildDirectVoiceInstructions, retrieveVoicePassage } from './labDirectVoice'
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
import { gateLabAiAction, type LabAccountPromptRequest, type LabAiAction } from './labAccountPrompt'
import { dumpLabTalkTurns, fetchLabChatHistoryCloud, LAB_CHAT_BOOK_ID } from './labTalkHistory'
import {
  appendLabChatTurn,
  createLabChatCloudWriter,
  createLabChatHistoryCloud,
  migrateLegacyLabChatHistoryCloud,
  migrateLegacyLabChatHistoryLocal,
  readAllLabBookChats,
  readLabBookChat,
  turnsFromConversations,
} from './labChatHistory'
import type { ChatConversation } from '../types'
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
  /** Biblical book / registry title; display only. History is keyed by `bookId`. */
  headerBook?: string
  chapterLabel: string
  chapterNumber?: number
  editionLabel?: string
  paragraphs: string[]
  paragraphIndex: number
  authToken?: string | null
  /** Signed-in override (host / tests). Defaults to a live token or a likely Supabase session. */
  signedIn?: boolean
  /** The account policy held back an anonymous reader's AI action; the host shows the sheet. The turn is not sent. */
  onAccountPrompt?: (request: LabAccountPromptRequest) => void
  /** Registry book id + edition key. Both present → requests carry `book` and the worker can read other chapters. */
  bookId?: string
  /** Explicit V2 continuation chosen in contents; never a cross-book thread. */
  conversationId?: string | null
  editionKey?: string
  /** Signed-in user id for the versioned cloud row; defaults to the live Supabase user. `null` = signed out. */
  userId?: string | null
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
  quietCompanionHandoff?: boolean
  voiceTrial?: VoiceTrial | null
  voiceVersion?: LabVoiceVersion
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session, likelyAuthenticated } = useAuth()
  const voiceVersion: LabVoiceVersion = options.voiceVersion === 'v2' ? 'v2' : 'v1'
  const isVoiceV2 = voiceVersion === 'v2'
  // History is one row per registry book, shared with the classic reader
  // (`chat-history:{bookId}`). The Bible is one book, as in the registry.
  const chatBookId = options.bookId || ''
  const [typedLoading, setTypedLoading] = useState(false)
  const [historyStatus, setHistoryStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  // `conversations` is this book's stored history (classic shape, for the
  // chapter picker); `turns` is the displayed thread: the stored history on
  // open, then the live turns as they stream. Storage writes run alongside.
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    migrateLegacyLabChatHistoryLocal()
    return readLabBookChat(chatBookId)
  })
  const [turns, setTurns] = useState<LabAskTurn[]>(() => turnsFromConversations(conversations))
  const loadedForBookRef = useRef(chatBookId)
  if (loadedForBookRef.current !== chatBookId) {
    loadedForBookRef.current = chatBookId
    const stored = readLabBookChat(chatBookId)
    const hydrated = turnsFromConversations(stored)
    setConversations(stored)
    setTurns(hydrated)
    dumpLabTalkTurns(hydrated)
  }
  const [notice, setNotice] = useState<string | null>(null)
  const dismissNotice = useCallback(() => setNotice(null), [])
  const [starting, setStarting] = useState(false)
  const [assistantPace, setAssistantPace] = useState<AssistantPace>('normal')
  const sendingRef = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const chatBookIdRef = useRef(chatBookId)
  chatBookIdRef.current = chatBookId

  const sessionToken = session?.access_token ?? null
  const viewerId = options.userId !== undefined ? options.userId : (session?.user?.id ?? null)

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
  const signedIn = options.signedIn ?? (Boolean(liveToken) || likelyAuthenticated)
  // Account policy (labAccountPrompt.ts), in one place, before any network
  // call or mic session: the first anonymous AI action is free, the second
  // shows the account sheet and is not sent. Signed in: never gated.
  const gateAiAction = useCallback((action: LabAiAction, text?: string): boolean => {
    const decision = gateLabAiAction({ signedIn })
    if (!decision.allowed) optionsRef.current.onAccountPrompt?.({ action, text })
    return decision.allowed
  }, [signedIn])
  // Signed in: the same versioned `user_data` row the classic reader
  // writes (commit_user_data with an expected rev). One writer per account.
  const cloudWriter = useMemo(() => {
    if (!viewerId) return null
    const cloud = createLabChatHistoryCloud(viewerId)
    return cloud ? createLabChatCloudWriter(cloud) : null
  }, [viewerId])
  const cloudWriterRef = useRef(cloudWriter)
  cloudWriterRef.current = cloudWriter

  /** Record a finalized turn: local mirror first, then the cloud row when signed in. */
  const recordTurn = useCallback((message: ChatMessage, chapterNumber: number, paragraphIndex?: number) => {
    const bookId = chatBookIdRef.current
    if (!bookId) return
    const next = appendLabChatTurn(bookId, message, chapterNumber, paragraphIndex, optionsRef.current.conversationId || undefined)
    if (loadedForBookRef.current === bookId) setConversations(next)
    cloudWriterRef.current?.push(bookId, next)
  }, [])

  // Open / sign-in / book change: fold the retired KV blob in once per
  // account, then merge this book's cloud row with the local mirror.
  useEffect(() => {
    if (!viewerId || !cloudWriter || !chatBookId) { setHistoryStatus('ready'); return }
    let cancelled = false
    const run = async () => {
      setHistoryStatus('loading')
      await migrateLegacyLabChatHistoryCloud({
        userId: viewerId,
        fetchLegacy: () => fetchLabChatHistoryCloud(liveToken),
      })
      let unavailable = false
      const merged = await cloudWriter.sync(chatBookId, () => { unavailable = true })
      if (cancelled || loadedForBookRef.current !== chatBookId) return
      setHistoryStatus(unavailable ? 'unavailable' : 'ready')
      setConversations(merged)
      const hydrated = turnsFromConversations(merged)
      // A reply still streaming (not stored yet) survives the re-hydration.
      setTurns((current) => {
        const stored = new Set(hydrated.map(turn => turn.id))
        const pending = current.filter(turn => !stored.has(turn.id))
        const next = pending.length > 0 ? [...hydrated, ...pending] : hydrated
        dumpLabTalkTurns(next)
        return next
      })
    }
    const failed = () => { if (!cancelled) setHistoryStatus('unavailable') }
    void run().catch(failed)
    const onOnline = () => { void run().catch(failed) }
    window.addEventListener('online', onOnline)
    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
    }
    // liveToken only feeds the one-time legacy fetch; a token refresh must not re-sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatBookId, cloudWriter, viewerId])

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
    const acrossLibrary = readAllLabBookChats()
      .sort((a, b) => a.endTimestamp - b.endTimestamp)
      .flatMap(conversation => conversation.messages.map(message => ({
        role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: `${conversation.bookId}: ${message.content}`,
        cancelled: message.isComplete === false,
      })))
    return acrossLibrary.length > 0 ? acrossLibrary : turns
  }, [turns])
  const selectedConversationTurns = useMemo(() => {
    const selected = options.conversationId ? conversations.find(item => item.id === options.conversationId && item.bookId === chatBookId) : null
    return selected ? turnsFromConversations([selected]) : null
  }, [options.conversationId, conversations, chatBookId])
  const talkInstructions = useMemo(
    () => buildLabVoiceControlInstructions(
      options.voiceTrial ? buildDirectVoiceInstructions(askContext) : isVoiceV2 ? buildLabTalkInstructionsV2(askContext) : buildLabTalkInstructions(askContext),
      selectedConversationTurns ?? (options.voiceTrial ? turns : rememberedLabTurns),
    ) + (options.quietCompanionHandoff ? '\nIn this reader, call ask_companion silently and wait for its result. Do not speak a looking-up or waiting message before or during the call. The interface shows the waiting state. When the answer is available, speak the supplied answer completely.' : ''),
    [askContext, isVoiceV2, rememberedLabTurns, selectedConversationTurns, turns, options.quietCompanionHandoff, options.voiceTrial],
  )
  const tinctVoiceTools = useTinctVoiceTools(options.voiceToolAdapter)
  const mergedVoiceTools = useMemo(
    () => mergeLabVoiceTools(options.voiceTrial ? [...LAB_VOICE_TOOLS.filter(tool => tool.name !== 'ask_companion'), BOOK_PASSAGE_TOOL] : isVoiceV2 ? LAB_VOICE_TOOLS_V2 : LAB_VOICE_TOOLS).map(tool =>
      options.quietCompanionHandoff && tool && typeof tool === 'object' && 'name' in tool && tool.name === 'ask_companion'
        ? { ...tool, description: "Ask Tinct's reading companion for a book answer. Call silently, wait for the result, then speak the supplied answer. Never use for playback controls." }
        : tool),
    [isVoiceV2, options.quietCompanionHandoff, options.voiceTrial],
  )

  const onTinctVoiceTool = useCallback(async (
    name: string,
    arguments_: Record<string, unknown>,
    callId: string,
  ) => {
    if (optionsRef.current.voiceTrial && name === 'get_book_passage') {
      return retrieveVoicePassage(askContextNow(await readTrail()), arguments_)
    }
    const result = await tinctVoiceTools.onTool(name, arguments_, callId)
    optionsRef.current.onVoiceToolAction?.(labVoiceActionEntry(name, arguments_, callId, result))
    return result
  }, [tinctVoiceTools.onTool, askContextNow, readTrail])

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
    // Direct Realtime owns its command turn. Stopping from this transcript
    // callback would tear down the connection before its tool can reply.
    if (!optionsRef.current.voiceTrial && message.role === 'user' && isResumeListenCommand(content)) {
      optionsRef.current.onResumeListen?.()
      return
    }
    const incoming: LabAskTurn = {
      id: message.id || nextId(),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content,
      source: 'voice',
      timestamp: message.timestamp,
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
    bookId: options.voiceTrial ? (options.bookId || LAB_CHAT_BOOK_ID) : LAB_CHAT_BOOK_ID,
    ...(options.voiceTrial ? { editionKey: options.editionKey, editionLabel: options.editionLabel } : {}),
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
    recordMessage: recordTurn,
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
    onCompanionAsk: options.voiceTrial ? undefined : onCompanionAsk,
    voiceTrial: options.voiceTrial,
    honorModelResume: true,
    quietCompanionHandoff: options.quietCompanionHandoff,
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
    if (!gateAiAction('voice')) return false
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
  }, [gateAiAction, options.authToken, sessionToken, starting, voice.isActive, voice.start])

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
    if (!gateAiAction('chat', text)) return
    sendingRef.current = true

    const userTurn: LabAskTurn = {
      id: nextId(),
      role: 'user',
      content: text,
      source: 'typed',
      timestamp: Date.now(),
      chapterNumber: options.chapterNumber ?? 1,
      paragraphIndex: options.paragraphIndex,
    }
    setTurns(current => {
      const next = [...current, userTurn]
      dumpLabTalkTurns(next)
      return next
    })
    recordTurn({
      id: userTurn.id,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      bookId: chatBookIdRef.current,
      chapterNumber: options.chapterNumber ?? 1,
      isComplete: true,
      source: 'text',
    }, options.chapterNumber ?? 1, options.paragraphIndex)
    setNotice(null)

    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })

    setTypedLoading(true)
    try {
      const selected = options.conversationId ? conversations.find(item => item.id === options.conversationId && item.bookId === chatBookIdRef.current) : null
      const contextTurns = selected ? turnsFromConversations([selected]) : turns
      const previousAssistant = [...contextTurns].reverse().find(turn => turn.role === 'assistant' && !turn.cancelled)?.content ?? null
      // "Yes!!" after "we could go back a few chapters and have a look?" is
      // consent to the lookup. The model gets the tools; the app ignores any
      // move or resume marker it might still emit for that turn.
      const lookupConsent = affirmativeAnswersLookupOffer(text, previousAssistant)
      // The companion's window stays the last 20 turns; only the displayed history grew.
      const history = [...contextTurns, userTurn]
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
          timestamp: Date.now(),
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
        recordTurn({
          id: assistantTurn.id,
          role: 'assistant',
          content: skipped.text,
          timestamp: Date.now(),
          bookId: chatBookIdRef.current,
          chapterNumber: options.chapterNumber ?? 1,
          isComplete: true,
          source: 'text',
        }, options.chapterNumber ?? 1, options.paragraphIndex)
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
  }, [askContextNow, gateAiAction, options.authToken, options.conversationId, options.chapterNumber, options.paragraphIndex, readTrail, recordTurn, sessionToken, turns, conversations])

  return {
    turns,
    /** This book's stored history (classic shape), for the chapter picker. */
    conversations,
    historyStatus,
    notice,
    dismissNotice,
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
    /** Transport truth, reported apart from microphone/assistant activity. */
    voiceConnection: starting && voice.connection === 'idle' ? 'connecting' as const : voice.connection,
    micMuted: voice.micMuted,
    setMicMuted: voice.setMicMuted,
    getAssistantLevel: voice.getAssistantLevel,
    userSpeechStarted: voice.userSpeechStarted,
    startVoice,
    stopVoice,
    failStart,
    toggleInChatVoice,
    sendTyped,
  }
}
