import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { VoiceSessionController, type VoiceUiSnapshot } from '../voice/VoiceSessionController'
import { nearbyParagraphWindow } from '../voice/context'
import type { AudioPlaybackAnchor, VoiceReaderContext } from '../voice/types'

let voiceMessageId = 0
function nextVoiceMessageId() {
  return `voice_${Date.now()}_${++voiceMessageId}`
}

export interface UseVoiceSessionOptions {
  authToken: string | null
  isAnonymous: boolean
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
  pausePlayback: () => AudioPlaybackAnchor | null
  resumePlayback: (anchor: AudioPlaybackAnchor) => void
  recordMessage: (message: ChatMessage, chapterNumber: number, paragraphIndex?: number) => void
  appendLocalMessage: (message: ChatMessage) => void
  onNeedAuth: () => void
  onInsufficientBalance: () => void
  onUsage?: () => void
}

const IDLE_SNAPSHOT: VoiceUiSnapshot = {
  state: 'reading',
  mode: 'quick',
  resumeInSeconds: null,
  error: null,
  isActive: false,
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const [ui, setUi] = useState<VoiceUiSnapshot>(IDLE_SNAPSHOT)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const controllerRef = useRef<VoiceSessionController | null>(null)

  useEffect(() => {
    const controller = new VoiceSessionController({
      onSnapshot: setUi,
      onTurn: (role, text) => {
        const opts = optionsRef.current
        const message: ChatMessage = {
          id: nextVoiceMessageId(),
          role,
          content: text,
          timestamp: Date.now(),
          bookId: opts.bookId,
          chapterNumber: opts.chapterNumber,
          paragraphIndex: opts.paragraphIndex,
          isComplete: true,
          source: 'voice',
        }
        opts.appendLocalMessage(message)
        opts.recordMessage(message, opts.chapterNumber, opts.paragraphIndex)
      },
      onNeedAuth: () => optionsRef.current.onNeedAuth(),
      onInsufficientBalance: () => optionsRef.current.onInsufficientBalance(),
      onUsage: () => optionsRef.current.onUsage?.(),
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

  const start = useCallback(() => {
    const opts = optionsRef.current
    void controllerRef.current?.start({
      authToken: opts.authToken,
      isAnonymous: opts.isAnonymous,
      context: buildContext(),
      wasPlaying: opts.isAudioPlaying,
      audio: {
        pausePlayback: opts.pausePlayback,
        resumePlayback: opts.resumePlayback,
      },
    })
  }, [buildContext])

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
    statusLabel,
    start,
    handleVoiceButton,
    explicitResume,
  }
}
