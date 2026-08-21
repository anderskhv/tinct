import { useCallback, useMemo, useState } from 'react'
import type { ChatMessage } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useVoiceSession } from '../hooks/useVoiceSession'
import { apiUrl } from '../utils/apiUrl'
import type { AudioPlaybackAnchor, AudioPlaybackPause } from '../voice/types'
import { buildLabConversationInstructions, labConversationState, labReadingAngle, type LabAskTurn } from './labAsk'
import { readSupabaseAccessToken, resolveLabVoiceToken } from './labAuth'
import { LAB_COPY } from './labCopy'

let labAskId = 0
function nextId() {
  return `lab_ask_${Date.now()}_${++labAskId}`
}

const NOOP_AUDIO = {
  pausePlayback: () => null,
  resumePlayback: () => { /* optional listen engine */ },
}

export interface UseLabAskOptions {
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  paragraphs: string[]
  paragraphIndex: number
  authToken?: string | null
  isAudioPlaying?: boolean
  pausePlayback?: () => AudioPlaybackPause | null
  resumePlayback?: (anchor: AudioPlaybackAnchor) => void
}

export function useLabAsk(options: UseLabAskOptions) {
  const { session } = useAuth()
  const [typedLoading, setTypedLoading] = useState(false)
  const [turns, setTurns] = useState<LabAskTurn[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const sessionToken = session?.access_token ?? null
  const liveToken = options.authToken !== undefined ? options.authToken : sessionToken

  const instructions = useMemo(() => buildLabConversationInstructions({
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

  // Same hook as App.tsx + AudioStrip, but session.update gets the lab
  // conversation brief (full chapter, spoiler-hard) instead of VOICE_AGENT_POLICY.
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
    visibleText: options.paragraphs.join('\n\n'),
    isAudioPlaying: options.isAudioPlaying ?? false,
    pausePlayback: options.pausePlayback ?? NOOP_AUDIO.pausePlayback,
    resumePlayback: options.resumePlayback ?? NOOP_AUDIO.resumePlayback,
    recordMessage: () => { /* lab does not persist Feed history */ },
    appendLocalMessage,
    onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
    onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    mode: 'conversation',
    instructions,
    tools: [],
  })

  const startVoice = useCallback(async (): Promise<boolean> => {
    if (voice.isActive) return true
    setNotice(null)
    const authToken = await resolveLabVoiceToken({
      override: options.authToken,
      sessionToken,
      readSession: readSupabaseAccessToken,
    })
    if (!authToken) {
      setNotice(LAB_COPY.signInVoice)
      return false
    }
    const snapshot = await voice.start({ authToken })
    if (snapshot.error) {
      setNotice(snapshot.error)
      return false
    }
    return snapshot.isActive
  }, [options.authToken, sessionToken, voice.isActive, voice.start])

  const stopVoice = useCallback(() => {
    voice.stop()
  }, [voice.stop])

  const toggleInChatVoice = useCallback(async () => {
    if (voice.isActive) {
      voice.stop()
      return
    }
    await startVoice()
  }, [startVoice, voice.isActive, voice.stop])

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
    }),
    voiceActive: voice.isActive,
    startVoice,
    stopVoice,
    toggleInChatVoice,
    sendTyped,
  }
}
