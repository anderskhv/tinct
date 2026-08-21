import { useCallback, useMemo, useState } from 'react'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useVoiceSession } from '../hooks/useVoiceSession'
import { apiUrl } from '../utils/apiUrl'
import {
  buildLabAskInstructions,
  labConversationState,
  labReadingAngle,
  type LabAskTurn,
} from './labAsk'
import { readSupabaseAccessToken, resolveLabVoiceToken } from './labAuth'
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
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session } = useAuth()
  const [typedLoading, setTypedLoading] = useState(false)
  const [turns, setTurns] = useState<LabAskTurn[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  const sessionToken = session?.access_token ?? null
  const liveToken = options.authToken !== undefined ? options.authToken : sessionToken

  const instructions = useMemo(() => buildLabAskInstructions({
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

  const appendLocalMessage = useCallback((message: ChatMessage) => {
    const content = (message.content || '').trim()
    if (!content) return
    setTurns(current => [...current, {
      id: message.id || nextId(),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content,
      source: 'voice',
    }])
  }, [])

  // Same hook as App.tsx + AudioStrip. Lab supplies its own instructions
  // so production buildVoiceInstructions stays the in-car brief.
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
    visibleText: instructions,
    isAudioPlaying: false,
    pausePlayback: NOOP_AUDIO.pausePlayback,
    resumePlayback: NOOP_AUDIO.resumePlayback,
    recordMessage: () => { /* lab does not persist Feed history */ },
    appendLocalMessage,
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    mode: 'conversation',
    instructions,
    tools: [],
  })

  const startVoice = useCallback(async (): Promise<boolean> => {
    if (voice.isActive || starting) return true
    setNotice(null)
    setStarting(true)
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
    if (!text) return

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
      setNotice(LAB_COPY.signInAsk)
      return
    }

    setTypedLoading(true)
    try {
      const history = [...turns, userTurn]
        .slice(-20)
        .map(turn => ({ role: turn.role, content: turn.content }))
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: instructions,
          messages: history,
        }),
      })
      const data = await response.json().catch(() => ({})) as {
        error?: { message?: string } | string
        content?: Array<{ text?: string }>
      }
      if (response.status === 401) {
        setNotice(LAB_COPY.signInAsk)
        return
      }
      if (response.status === 402) {
        setNotice(LAB_COPY.balanceEmpty)
        return
      }
      if (!response.ok) {
        const message = typeof data.error === 'string'
          ? data.error
          : data.error?.message || LAB_COPY.askUnavailable
        setNotice(message)
        return
      }
      const reply = data.content?.[0]?.text?.trim()
      if (reply) {
        setTurns(current => [...current, {
          id: nextId(),
          role: 'assistant',
          content: reply,
          source: 'typed',
        }])
      }
    } catch {
      setNotice(LAB_COPY.askUnavailable)
    } finally {
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
    startVoice,
    stopVoice,
    toggleInChatVoice,
    sendTyped,
  }
}
