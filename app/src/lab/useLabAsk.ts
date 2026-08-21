import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabase'
import { apiUrl } from '../utils/apiUrl'
import { buildVoiceInstructions } from '../voice/context'
import {
  VoiceSessionController,
  type VoiceUiSnapshot,
} from '../voice/VoiceSessionController'
import { labConversationState, labReadingAngle, labVoiceContext, type LabAskTurn, type LabConversationState } from './labAsk'
import { LAB_COPY } from './labCopy'

const IDLE_SNAPSHOT: VoiceUiSnapshot = {
  state: 'reading',
  mode: 'conversation',
  phase: 'idle',
  resumeInSeconds: null,
  error: null,
  isActive: false,
}

const NOOP_AUDIO = {
  pausePlayback: () => null,
  resumePlayback: () => { /* lab follow clock is owned by LabApp */ },
}

let labAskId = 0
function nextId() {
  return `lab_ask_${Date.now()}_${++labAskId}`
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
  const [token, setToken] = useState<string | null>(options.authToken ?? null)
  const [ui, setUi] = useState<VoiceUiSnapshot>(IDLE_SNAPSHOT)
  const [starting, setStarting] = useState(false)
  const [typedLoading, setTypedLoading] = useState(false)
  const [turns, setTurns] = useState<LabAskTurn[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const turnsRef = useRef(turns)
  turnsRef.current = turns
  const controllerRef = useRef<VoiceSessionController | null>(null)

  useEffect(() => {
    if (options.authToken !== undefined) {
      setToken(options.authToken)
      return
    }
    if (!supabase) return
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setToken(data.session?.access_token ?? null)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null)
    })
    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [options.authToken])

  useEffect(() => {
    const controller = new VoiceSessionController({
      onSnapshot: setUi,
      onTurn: (role, text) => {
        setTurns(current => [...current, {
          id: nextId(),
          role,
          content: text,
          source: 'voice',
        }])
      },
      onNeedAuth: () => setNotice(LAB_COPY.signInVoice),
      onInsufficientBalance: () => setNotice(LAB_COPY.balanceEmpty),
    })
    controllerRef.current = controller
    return () => {
      controller.dispose()
      controllerRef.current = null
    }
  }, [])

  const buildContext = useCallback(() => {
    const opts = optionsRef.current
    return labVoiceContext({
      bookTitle: opts.bookTitle,
      bookAuthor: opts.bookAuthor,
      chapterLabel: opts.chapterLabel,
      paragraphs: opts.paragraphs,
      paragraphIndex: opts.paragraphIndex,
      readingAngle: labReadingAngle(),
    })
  }, [])

  const startVoice = useCallback(async (): Promise<boolean> => {
    const controller = controllerRef.current
    if (!controller) return false
    if (controller.getSnapshot().isActive) return true

    setNotice(null)
    setStarting(true)
    const authToken = optionsRef.current.authToken !== undefined
      ? optionsRef.current.authToken
      : token
    await controller.start({
      authToken,
      isAnonymous: !authToken,
      context: buildContext(),
      audio: NOOP_AUDIO,
      wasPlaying: false,
      mode: 'conversation',
    })
    setStarting(false)
    const snapshot = controller.getSnapshot()
    if (snapshot.error) {
      setNotice(snapshot.error)
      return false
    }
    return snapshot.isActive
  }, [buildContext, token])

  const stopVoice = useCallback(() => {
    controllerRef.current?.stop()
    setStarting(false)
  }, [])

  const toggleInChatVoice = useCallback(async () => {
    const controller = controllerRef.current
    if (!controller) return
    if (controller.getSnapshot().isActive) {
      controller.stop()
      return
    }
    await startVoice()
  }, [startVoice])

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

    const authToken = optionsRef.current.authToken !== undefined
      ? optionsRef.current.authToken
      : token
    if (!authToken) {
      setNotice(LAB_COPY.signInAsk)
      return
    }

    setTypedLoading(true)
    try {
      const history = [...turnsRef.current, userTurn]
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
          system: buildVoiceInstructions(buildContext()),
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
  }, [buildContext, token])

  const conversationState: LabConversationState = labConversationState({
    phase: ui.phase,
    starting,
    error: ui.error,
  })

  return {
    turns,
    notice,
    typedLoading,
    conversationState,
    voiceActive: ui.isActive || starting,
    startVoice,
    stopVoice,
    toggleInChatVoice,
    sendTyped,
  }
}
