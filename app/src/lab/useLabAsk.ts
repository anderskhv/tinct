import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useVoiceSession } from '../hooks/useVoiceSession'
import { apiUrl } from '../utils/apiUrl'
import {
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
  type LabAskTurn,
  type LabPlaybackSkip,
} from './labAsk'
import { buildLabTalkInstructions, queryLabCompanion, readAnthropicResponse, type CompanionAskNotify } from './labCompanion'
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
  resolveLabChatBook,
  writeLabChatHistoryLocal,
} from './labTalkHistory'

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
  onResumeListen?: () => void
  onSetPlaybackSpeed?: (rate: number) => void
  onPlaybackSkip?: (kind: LabPlaybackSkip) => void | Promise<void>
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session } = useAuth()
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
  }), [
    options.bookAuthor,
    options.bookTitle,
    options.chapterLabel,
    options.chapterNumber,
    options.editionLabel,
    options.paragraphIndex,
    options.paragraphs,
  ])
  const instructions = useMemo(() => buildLabAskInstructions(askContext), [askContext])
  const talkInstructions = useMemo(() => buildLabTalkInstructions(askContext), [askContext])

  const onCompanionAsk = useCallback(async (question: string, notify?: CompanionAskNotify) => {
    const authToken = await resolveLabVoiceToken({
      override: optionsRef.current.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    return queryLabCompanion({
      authToken,
      system: buildLabAskInstructions({
        bookTitle: optionsRef.current.bookTitle,
        bookAuthor: optionsRef.current.bookAuthor,
        chapterLabel: optionsRef.current.chapterLabel,
        chapterNumber: optionsRef.current.chapterNumber,
        editionLabel: optionsRef.current.editionLabel,
        paragraphs: optionsRef.current.paragraphs,
        paragraphIndex: optionsRef.current.paragraphIndex,
        readingAngle: labReadingAngle(),
      }),
      question,
      context: {
        bookTitle: optionsRef.current.bookTitle,
        bookAuthor: optionsRef.current.bookAuthor,
        chapterLabel: optionsRef.current.chapterLabel,
        chapterNumber: optionsRef.current.chapterNumber,
        editionLabel: optionsRef.current.editionLabel,
        paragraphs: optionsRef.current.paragraphs,
        paragraphIndex: optionsRef.current.paragraphIndex,
        readingAngle: labReadingAngle(),
      },
      onDelta: notify?.onDelta,
      onFirstSpeakable: notify?.onFirstSpeakable,
    })
  }, [sessionToken])

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
    tools: LAB_VOICE_TOOLS,
    onCompanionAsk,
    honorModelResume: true,
    setPlaybackSpeed: (rate) => optionsRef.current.onSetPlaybackSpeed?.(rate),
    skipPlayback: (kind) => optionsRef.current.onPlaybackSkip?.(kind),
    assistantPace,
    onSetAssistantPace: setAssistantPace,
  })

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
      const history = [...turns, userTurn]
        .slice(-20)
        .map(turn => ({ role: turn.role, content: turn.content }))
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) headers.Authorization = `Bearer ${authToken}`
      const response = await fetch(apiUrl(authToken ? '/api/chat' : '/api/lab-chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          stream: true,
          system: instructions,
          messages: history,
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
      if (skipped.skip) {
        await optionsRef.current.onPlaybackSkip?.(skipped.skip)
      }
      if (resumed.resume || skipped.skip) {
        // Let a chapter skip commit (header + listen chapter) before Play.
        window.setTimeout(() => optionsRef.current.onResumeListen?.(), 0)
      }
    } catch {
      setNotice(LAB_COPY.askUnavailable)
    } finally {
      sendingRef.current = false
      setTypedLoading(false)
    }
  }, [instructions, options.authToken, sessionToken, turns])

  return {
    turns,
    notice,
    typedLoading,
    conversationState: labConversationState({
      voiceState: voice.state,
      error: voice.error,
      starting,
    }),
    voiceActive: voice.isActive || starting,
    userSpeechStarted: voice.userSpeechStarted,
    startVoice,
    stopVoice,
    failStart,
    toggleInChatVoice,
    sendTyped,
  }
}
