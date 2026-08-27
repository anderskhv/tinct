import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { VoiceSessionController, type VoiceUiSnapshot } from '../voice/VoiceSessionController'
import type { AssistantPace, LabPlaybackSkip } from '../lab/labAsk'
import type { CompanionAskNotify } from '../lab/labCompanion'
import { nearbyParagraphWindow } from '../voice/context'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceReaderContext, VoiceSessionMode } from '../voice/types'

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
  chapterNumber: number
  chapterTitle: string
  readingObjective?: string
  chapterParagraphs: string[]
  paragraphIndex: number
  visibleText: string
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
  honorModelResume?: boolean
  /** Lab-only. Production AudioStrip leaves this unset. */
  setPlaybackSpeed?: (rate: number) => void
  /** Lab-only. Production AudioStrip leaves this unset. */
  skipPlayback?: (kind: LabPlaybackSkip) => void | Promise<void>
  /** Lab-only. Production AudioStrip leaves this unset. */
  assistantPace?: AssistantPace
  onSetAssistantPace?: (pace: AssistantPace) => void
  /** Lab-only. Hard book questions hop to /api/lab-chat. Production leaves this unset. */
  onCompanionAsk?: (question: string, notify?: CompanionAskNotify) => Promise<string>
}

const IDLE_SNAPSHOT: VoiceUiSnapshot = {
  state: 'reading',
  mode: 'quick',
  resumeInSeconds: null,
  error: null,
  isActive: false,
  userSpeechStarted: false,
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const [ui, setUi] = useState<VoiceUiSnapshot>(IDLE_SNAPSHOT)
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
      onSetAssistantPace: (pace) => optionsRef.current.onSetAssistantPace?.(pace),
    })
    controllerRef.current = controller
    return () => {
      controller.dispose()
      controllerRef.current = null
    }
  }, [])

  const locationKey = `${options.bookId}:${options.chapterNumber}`
  const locationKeyRef = useRef(locationKey)
  useEffect(() => {
    if (locationKeyRef.current === locationKey) return
    locationKeyRef.current = locationKey
    // Lab honor path stays open through a chapter skip so she can confirm, then play.
    if (optionsRef.current.honorModelResume) return
    controllerRef.current?.stop()
  }, [locationKey])

  const buildContext = useCallback((): VoiceReaderContext => {
    const opts = optionsRef.current
    const current = opts.chapterParagraphs[opts.paragraphIndex] || ''
    return {
      bookTitle: opts.bookTitle,
      bookAuthor: opts.bookAuthor,
      chapterLabel: opts.chapterTitle,
      readingAngle: opts.readingObjective,
      currentParagraph: current,
      nearbyParagraphs: nearbyParagraphWindow(opts.chapterParagraphs, opts.paragraphIndex),
      visibleText: opts.visibleText,
    }
  }, [])

  const unlockAudio = useCallback(() => {
    controllerRef.current?.unlockLabAudioContext()
  }, [])

  const start = useCallback(async (overrides?: { authToken?: string | null }) => {
    const opts = optionsRef.current
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
      mode: opts.mode ?? 'quick',
      instructions: opts.instructions,
      tools: opts.tools,
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
    controller.handleMicTap()
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
    isActive: ui.isActive,
    error: ui.error,
    resumeInSeconds: ui.resumeInSeconds,
    userSpeechStarted: ui.userSpeechStarted,
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
