import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { queryCompanion } from '../chat/queryCompanion'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useVoiceSession } from '../hooks/useVoiceSession'
import {
  buildLabAskInstructions,
  labConversationState,
  labReadingAngle,
  mergeLabVoiceTurn,
  type LabAskTurn,
} from './labAsk'
import { readSupabaseAccessToken, resolveLabVoiceToken } from './labAuth'
import {
  ASK_READING_COMPANION_TOOL,
  LAB_TALK_TOOLS,
  buildLabCompanionSystem,
  buildLabTalkInstructions,
  decideHearResume,
  handleLabTalkTool,
  type LabPlaybackCommand,
  type LabPlaybackResult,
} from './labCompanion'
import { LAB_COPY } from './labCopy'

let labAskId = 0
function nextId() {
  return `lab_ask_${Date.now()}_${++labAskId}`
}

const NOOP_AUDIO = {
  pausePlayback: () => null,
  resumePlayback: () => { /* lab listen is owned by LabApp */ },
}

export interface UseLabAskOptions {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  paragraphs: string[]
  paragraphIndex: number
  authToken?: string | null
  onPlaybackCommand?: (command: LabPlaybackCommand) => LabPlaybackResult
  onResumeAfterSpeech?: () => void
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session } = useAuth()
  const [typedLoading, setTypedLoading] = useState(false)
  const [turns, setTurns] = useState<LabAskTurn[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const sendingRef = useRef(false)
  const pendingHearResumeRef = useRef(false)
  const sawSpeakingForResumeRef = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const sessionToken = session?.access_token ?? null
  const liveToken = options.authToken !== undefined ? options.authToken : sessionToken
  const askContext = useMemo(() => ({
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    chapterLabel: options.chapterLabel,
    paragraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    readingAngle: labReadingAngle(),
  }), [
    options.bookAuthor,
    options.bookTitle,
    options.chapterLabel,
    options.paragraphIndex,
    options.paragraphs,
  ])

  const companionSystem = useMemo(() => buildLabCompanionSystem(askContext), [askContext])
  const typedInstructions = useMemo(() => buildLabAskInstructions(askContext), [askContext])
  const talkInstructions = useMemo(() => buildLabTalkInstructions(askContext), [askContext])

  const appendLocalMessage = useCallback((message: ChatMessage) => {
    const content = (message.content || '').trim()
    if (!content) return
    setTurns(current => mergeLabVoiceTurn(current, {
      id: message.id || nextId(),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content,
      source: 'voice',
    }))
  }, [])

  const handleToolCall = useCallback(async (input: {
    name: string
    callId: string
    arguments: string
    alreadySpeaking: boolean
    speakCover: (line: string) => boolean
  }) => {
    const authToken = await resolveLabVoiceToken({
      override: optionsRef.current.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })

    const result = await handleLabTalkTool({
      name: input.name,
      args: input.arguments,
      alreadySpeaking: input.alreadySpeaking,
      speakCover: input.speakCover,
      onPlayback: command => optionsRef.current.onPlaybackCommand?.(command) ?? { ok: true },
      queryCompanion: async (question) => {
        if (!authToken) return ''
        const reply = await queryCompanion({
          authToken,
          system: companionSystem,
          messages: [{ role: 'user', content: question }],
        })
        return reply.text
      },
    })

    if (result.scheduleHearResume) {
      pendingHearResumeRef.current = true
      sawSpeakingForResumeRef.current = input.alreadySpeaking
    }

    if (result.queriedClaude && result.output) {
      try {
        const parsed = JSON.parse(result.output) as { answer?: string }
        if (parsed.answer) {
          setTurns(current => mergeLabVoiceTurn(current, {
            id: nextId(),
            role: 'assistant',
            content: parsed.answer,
            source: 'voice',
          }))
        }
      } catch {
        /* tool output is for Realtime; transcript still arrives separately */
      }
    }

    return {
      handled: result.handled,
      output: result.output,
      continueResponse: result.continueResponse,
      responseInstructions: result.responseInstructions,
    }
  }, [companionSystem, sessionToken])

  // Same hook as App.tsx + AudioStrip. Lab supplies Talk instructions and
  // tools so production buildVoiceInstructions stays the in-car brief.
  const voice = useVoiceSession({
    authToken: liveToken,
    isAnonymous: !liveToken,
    bookId: 'odyssey',
    bookTitle: options.bookTitle,
    bookAuthor: options.bookAuthor,
    chapterNumber: 1,
    chapterTitle: options.chapterLabel,
    readingObjective: labReadingAngle(),
    chapterParagraphs: options.paragraphs,
    paragraphIndex: options.paragraphIndex,
    visibleText: talkInstructions,
    isAudioPlaying: false,
    pausePlayback: NOOP_AUDIO.pausePlayback,
    resumePlayback: NOOP_AUDIO.resumePlayback,
    recordMessage: () => { /* lab does not persist Feed history */ },
    appendLocalMessage,
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    mode: 'conversation',
    instructions: talkInstructions,
    tools: LAB_TALK_TOOLS,
    onToolCall: handleToolCall,
  })

  const conversationState = labConversationState({
    voiceState: voice.state,
    error: voice.error,
    starting,
  })

  useEffect(() => {
    if (pendingHearResumeRef.current && conversationState === 'speaking') {
      sawSpeakingForResumeRef.current = true
    }
    if (
      pendingHearResumeRef.current
      && decideHearResume({
        pending: pendingHearResumeRef.current,
        sawSpeaking: sawSpeakingForResumeRef.current,
        state: conversationState,
      }) === 'resume'
    ) {
      pendingHearResumeRef.current = false
      sawSpeakingForResumeRef.current = false
      voice.stop()
      optionsRef.current.onResumeAfterSpeech?.()
    }
  }, [conversationState])

  const startVoice = useCallback(async (): Promise<boolean> => {
    if (voice.isActive || starting) return true
    setNotice(null)
    const knownToken = options.authToken !== undefined ? options.authToken : sessionToken
    if (knownToken) setStarting(true)
    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    if (!authToken) {
      setStarting(false)
      setNotice(LAB_COPY.signInVoice)
      return false
    }
    if (!knownToken) setStarting(true)
    const snapshot = await voice.start({ authToken })
    setStarting(false)
    if (snapshot.error) {
      setNotice(snapshot.error)
      return false
    }
    return snapshot.isActive
  }, [options.authToken, sessionToken, starting, voice.isActive, voice.start])

  const stopVoice = useCallback(() => {
    setStarting(false)
    pendingHearResumeRef.current = false
    sawSpeakingForResumeRef.current = false
    voice.stop()
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
    sendingRef.current = true

    const userTurn: LabAskTurn = {
      id: nextId(),
      role: 'user',
      content: text,
      source: 'typed',
    }
    setTurns(current => [...current, userTurn])
    setNotice(null)

    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    if (!authToken) {
      sendingRef.current = false
      setNotice(LAB_COPY.signInAsk)
      return
    }

    setTypedLoading(true)
    try {
      const history = [...turns, userTurn]
        .slice(-20)
        .map(turn => ({ role: turn.role, content: turn.content }))
      const result = await queryCompanion({
        authToken,
        system: companionSystem,
        messages: history,
      })
      if (result.status === 401) {
        setNotice(LAB_COPY.signInAsk)
        return
      }
      if (result.status === 402) {
        setNotice(LAB_COPY.balanceEmpty)
        return
      }
      if (result.error) {
        setNotice(result.error || LAB_COPY.askUnavailable)
        return
      }
      if (result.text) {
        setTurns(current => [...current, {
          id: nextId(),
          role: 'assistant',
          content: result.text,
          source: 'typed',
        }])
      }
    } catch {
      setNotice(LAB_COPY.askUnavailable)
    } finally {
      setTypedLoading(false)
      sendingRef.current = false
    }
  }, [companionSystem, options.authToken, sessionToken, turns])

  return {
    turns,
    notice,
    typedLoading,
    conversationState,
    voiceActive: voice.isActive || starting,
    startVoice,
    stopVoice,
    toggleInChatVoice,
    sendTyped,
    typedInstructions,
    talkInstructions,
    escalateToolName: ASK_READING_COMPANION_TOOL,
  }
}
