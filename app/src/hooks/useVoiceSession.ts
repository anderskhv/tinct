import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { GrokVoiceSessionController } from '../voice/GrokVoiceSessionController'
import { IDLE_VOICE_SNAPSHOT, type VoiceAudioEngine, type VoiceUiSnapshot } from '../voice/session'
import type { AssistantPace } from '../lab/labAsk'
import { nearbyParagraphWindow } from '../voice/context'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceApplicationToolHandler, VoiceLatencySample, VoiceReaderContext, VoiceReaderProfile, VoiceSessionMode } from '../voice/types'

let voiceMessageId = 0
function nextVoiceMessageId() {
  return `voice_${Date.now()}_${++voiceMessageId}`
}

export interface UseVoiceSessionOptions {
  authToken: string | null
  isAnonymous: boolean
  /** Lab reader / library guest path. Production App.tsx leaves this unset. */
  labGuest?: boolean
  bookId: string
  bookTitle: string
  bookAuthor: string
  editionKey?: string
  editionLabel?: string
  chapterNumber: number
  chapterTitle: string
  readingObjective?: string
  chapterParagraphs: string[]
  paragraphIndex: number
  pageNumber?: number
  totalPages?: number
  visibleText: string
  readerProfile?: VoiceReaderProfile
  isAudioPlaying: boolean
  pausePlayback: () => AudioPlaybackPause | null
  resumePlayback: (anchor: AudioPlaybackAnchor, playAudio?: boolean) => void
  recordMessage: (message: ChatMessage, chapterNumber: number, paragraphIndex?: number) => void
  appendLocalMessage: (message: ChatMessage) => void
  onNeedAuth: () => void
  onInsufficientBalance: () => void
  onUsage?: () => void
  onBeforeUserTurn?: () => boolean
  onEndConversation?: () => void
  mode?: VoiceSessionMode
  /** Replaces the whole Tinct prompt (the library assistant). The reader leaves this unset. */
  instructions?: string
  /** Reference material (data, not instructions) for the reader's position and recent conversation. */
  reference?: string
  tools?: readonly unknown[]
  /** Production-owned functions appended to the base voice controls. */
  applicationTools?: readonly unknown[]
  onApplicationTool?: VoiceApplicationToolHandler
  /** Clears session-scoped application state such as the voice undo stack. */
  onSessionStart?: () => void
  /** Lab reader only. */
  setPlaybackSpeed?: (rate: number) => void
  skipPlayback?: VoiceAudioEngine['skipPlayback']
  assistantPace?: AssistantPace
  onSetAssistantPace?: (pace: AssistantPace) => void
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const [ui, setUi] = useState<VoiceUiSnapshot>(IDLE_VOICE_SNAPSHOT)
  const [latencySamples, setLatencySamples] = useState<VoiceLatencySample[]>([])
  const optionsRef = useRef(options)
  optionsRef.current = options
  const controllerRef = useRef<GrokVoiceSessionController | null>(null)

  useEffect(() => {
    const controller = new GrokVoiceSessionController({
      onSnapshot: setUi,
      onBeforeUserTurn: () => optionsRef.current.onBeforeUserTurn?.() ?? true,
      onTurn: (role, text, meta) => {
        const opts = optionsRef.current
        const message: ChatMessage = {
          id: nextVoiceMessageId(),
          role,
          content: text,
          timestamp: Date.now(),
          bookId: opts.bookId,
          chapterNumber: opts.chapterNumber,
          paragraphIndex: opts.paragraphIndex,
          isComplete: meta?.cancelled ? false : true,
          source: 'voice',
        }
        opts.appendLocalMessage(message)
        opts.recordMessage(message, opts.chapterNumber, opts.paragraphIndex)
      },
      onNeedAuth: () => optionsRef.current.onNeedAuth(),
      onInsufficientBalance: () => optionsRef.current.onInsufficientBalance(),
      onUsage: () => optionsRef.current.onUsage?.(),
      onEndRequested: () => optionsRef.current.onEndConversation?.(),
      onLatency: (sample) => {
        setLatencySamples(previous => {
          const next = [...previous, sample].slice(-20)
          if (typeof window !== 'undefined') {
            ;(window as Window & { __tinctVoiceDebug?: unknown }).__tinctVoiceDebug = {
              model: sample.model,
              samples: next,
            }
          }
          return next
        })
      },
      onSetAssistantPace: (pace) => optionsRef.current.onSetAssistantPace?.(pace),
      onApplicationTool: (name, args, callId) => {
        const handler = optionsRef.current.onApplicationTool
        if (!handler) {
          return {
            output: { ok: false, error: 'application_tool_unavailable' },
            responseInstructions: 'Briefly say that control is not available here. Do not claim it worked.',
          }
        }
        return handler(name, args, callId)
      },
    })
    controllerRef.current = controller
    const debugHost = window as Window & { __tinctVoiceCapture?: () => unknown }
    debugHost.__tinctVoiceCapture = () => controller.getCaptureDiagnostics()
    return () => {
      delete debugHost.__tinctVoiceCapture
      controller.dispose()
      controllerRef.current = null
    }
  }, [])

  const buildContext = useCallback((): VoiceReaderContext => {
    const opts = optionsRef.current
    const current = opts.chapterParagraphs[opts.paragraphIndex] || ''
    return {
      bookId: opts.bookId,
      bookTitle: opts.bookTitle,
      bookAuthor: opts.bookAuthor,
      editionKey: opts.editionKey,
      editionLabel: opts.editionLabel,
      chapterNumber: opts.chapterNumber,
      chapterLabel: opts.chapterTitle,
      paragraphIndex: opts.paragraphIndex,
      pageNumber: opts.pageNumber,
      totalPages: opts.totalPages,
      readingAngle: opts.readingObjective,
      currentParagraph: current,
      nearbyParagraphs: nearbyParagraphWindow(opts.chapterParagraphs, opts.paragraphIndex),
      visibleText: opts.visibleText,
      readerProfile: opts.readerProfile,
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.updateContext(buildContext(), options.reference, options.instructions)
  }, [
    buildContext,
    options.bookId,
    options.editionKey,
    options.editionLabel,
    options.chapterNumber,
    options.chapterTitle,
    options.paragraphIndex,
    options.pageNumber,
    options.totalPages,
    options.readingObjective,
    options.chapterParagraphs,
    options.visibleText,
    options.instructions,
    options.reference,
    options.readerProfile,
  ])

  const unlockAudio = useCallback(() => {
    controllerRef.current?.unlockLabAudioContext()
  }, [])

  const start = useCallback(async (overrides?: { authToken?: string | null; greeting?: string }) => {
    const opts = optionsRef.current
    opts.onSessionStart?.()
    const authToken = overrides?.authToken !== undefined ? overrides.authToken : opts.authToken
    controllerRef.current?.unlockLabAudioContext()
    await controllerRef.current?.start({
      authToken,
      greeting: overrides?.greeting,
      isAnonymous: !authToken,
      labGuest: opts.labGuest === true,
      context: buildContext(),
      wasPlaying: opts.isAudioPlaying,
      audio: {
        pausePlayback: opts.pausePlayback,
        resumePlayback: opts.resumePlayback,
        setPlaybackSpeed: opts.setPlaybackSpeed,
        skipPlayback: opts.skipPlayback,
      },
      mode: opts.mode ?? 'conversation',
      instructions: opts.instructions,
      reference: opts.reference,
      tools: opts.tools,
      applicationTools: opts.applicationTools,
      assistantPace: opts.assistantPace,
    })
    return controllerRef.current?.getSnapshot() ?? IDLE_VOICE_SNAPSHOT
  }, [buildContext])

  const stop = useCallback(() => {
    controllerRef.current?.stop()
  }, [])

  const handleVoiceButton = useCallback(() => {
    const controller = controllerRef.current
    if (!controller) return
    if (!controller.getSnapshot().isActive) {
      start()
      return
    }
    controller.explicitResume()
  }, [start])

  const explicitResume = useCallback(() => {
    controllerRef.current?.explicitResume()
  }, [])

  const statusLabel = (() => {
    if (ui.error) return ui.error
    switch (ui.state) {
      case 'listening':
        return 'Listening…'
      case 'answering':
        return 'Answering…'
      case 'resume_pending':
        return `Continuing in ${ui.resumeInSeconds ?? 3}…`
      case 'conversation_idle':
        return 'Still here — ask another, or go back to the book.'
      default:
        return null
    }
  })()

  return {
    state: ui.state,
    activity: ui.activity,
    /** Transport only, reported apart from microphone and assistant activity. */
    connection: ui.connection,
    micMuted: ui.micMuted,
    setMicMuted: (muted: boolean) => {
      controllerRef.current?.setMicMuted(muted)
    },
    /** Real loudness of the assistant's playback, or null when no tap exists. */
    getAssistantLevel: () => controllerRef.current?.getAssistantLevel() ?? null,
    isActive: ui.isActive,
    error: ui.error,
    resumeInSeconds: ui.resumeInSeconds,
    userSpeechStarted: ui.userSpeechStarted,
    latencySamples,
    statusLabel,
    start,
    unlockAudio,
    stop,
    handleVoiceButton,
    explicitResume,
    setAssistantPace: (pace: AssistantPace) => {
      controllerRef.current?.setAssistantPace(pace)
    },
  }
}
