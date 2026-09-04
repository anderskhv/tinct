import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { VoiceSessionController, type VoiceUiSnapshot } from '../voice/VoiceSessionController'
import type { AssistantPace, LabPlaybackSkip } from '../lab/labAsk'
import type { CompanionAskNotify, CompanionAskResult } from '../lab/labCompanion'
import { nearbyParagraphWindow } from '../voice/context'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceApplicationToolHandler, VoiceLatencySample, VoiceReaderContext, VoiceReaderProfile, VoiceSessionMode } from '../voice/types'
import { VOICE_REALTIME_MODEL } from '../voice/types'

let voiceMessageId = 0
function nextVoiceMessageId() {
  return `voice_${Date.now()}_${++voiceMessageId}`
}

export interface UseVoiceSessionOptions {
  authToken: string | null
  isAnonymous: boolean
  /** Lab-only guest/test path. Production App.tsx leaves this unset. */
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
  resumePlayback: (anchor: AudioPlaybackAnchor) => void
  recordMessage: (message: ChatMessage, chapterNumber: number, paragraphIndex?: number) => void
  appendLocalMessage: (message: ChatMessage) => void
  onNeedAuth: () => void
  onInsufficientBalance: () => void
  onUsage?: () => void
  mode?: VoiceSessionMode
  /** Lab-only. Production AudioStrip leaves this unset so buildVoiceInstructions runs. */
  instructions?: string
  tools?: readonly unknown[]
  /** Production-owned functions appended to the base voice controls. */
  applicationTools?: readonly unknown[]
  onApplicationTool?: VoiceApplicationToolHandler
  /** Clears session-scoped application state such as the voice undo stack. */
  onSessionStart?: () => void
  honorModelResume?: boolean
  /** Lab-only. Production AudioStrip leaves this unset. */
  setPlaybackSpeed?: (rate: number) => void
  /** Lab-only. Production AudioStrip leaves this unset. */
  skipPlayback?: (kind: LabPlaybackSkip) => void | Promise<void>
  /** Lab-only. Production AudioStrip leaves this unset. */
  assistantPace?: AssistantPace
  onSetAssistantPace?: (pace: AssistantPace) => void
  /** Lab-only. Hard book questions hop to /api/lab-chat. Production leaves this unset. */
  onCompanionAsk?: (question: string, notify?: CompanionAskNotify) => Promise<CompanionAskResult>
}

const IDLE_SNAPSHOT: VoiceUiSnapshot = {
  state: 'reading',
  mode: 'conversation',
  activity: 'idle',
  resumeInSeconds: null,
  error: null,
  isActive: false,
  userSpeechStarted: false,
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const [ui, setUi] = useState<VoiceUiSnapshot>(IDLE_SNAPSHOT)
  const [latencySamples, setLatencySamples] = useState<VoiceLatencySample[]>([])
  const optionsRef = useRef(options)
  optionsRef.current = options
  const controllerRef = useRef<VoiceSessionController | null>(null)

  useEffect(() => {
    const controller = new VoiceSessionController({
      onSnapshot: setUi,
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
      onLatency: (sample) => {
        setLatencySamples(previous => {
          const next = [...previous, sample].slice(-20)
          if (typeof window !== 'undefined') {
            ;(window as Window & { __tinctVoiceDebug?: unknown }).__tinctVoiceDebug = {
              model: VOICE_REALTIME_MODEL,
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
    return () => {
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
    controllerRef.current?.updateContext(buildContext())
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
    options.readerProfile,
  ])

  const unlockAudio = useCallback(() => {
    controllerRef.current?.unlockLabAudioContext()
  }, [])

  const start = useCallback(async (overrides?: { authToken?: string | null }) => {
    const opts = optionsRef.current
    opts.onSessionStart?.()
    const authToken = overrides?.authToken !== undefined ? overrides.authToken : opts.authToken
    if (opts.honorModelResume) controllerRef.current?.unlockLabAudioContext()
    await controllerRef.current?.start({
      authToken,
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
      tools: opts.tools,
      applicationTools: opts.applicationTools,
      honorModelResume: opts.honorModelResume,
      assistantPace: opts.assistantPace,
      onCompanionAsk: opts.onCompanionAsk,
    })
    return controllerRef.current?.getSnapshot() ?? IDLE_SNAPSHOT
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
    switch (ui.activity) {
      case 'connecting':
        return 'Connecting…'
      case 'listening':
        return 'Listening…'
      case 'checking_text':
        return 'Checking the text…'
      case 'preparing_answer':
        return 'Preparing answer…'
      case 'speaking':
        return 'Speaking…'
      default:
        if (ui.state === 'resume_pending') return `Continuing in ${ui.resumeInSeconds ?? 3}…`
        return null
    }
  })()

  return {
    state: ui.state,
    activity: ui.activity,
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
