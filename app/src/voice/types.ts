export type VoiceModeState =
  | 'reading'
  | 'listening'
  | 'answering'
  | 'resume_pending'
  | 'conversation_idle'

export type VoiceSessionMode = 'quick' | 'conversation'

export type VoiceIntent =
  | 'resume_audiobook'
  | 'end_voice_session'
  | 'hold_session'
  | 'open_conversation'
  | 'none'

export type VoiceEvent =
  | { type: 'START'; mode?: VoiceSessionMode }
  | { type: 'USER_SPEECH_START' }
  | { type: 'USER_SPEECH_END' }
  | { type: 'ASSISTANT_SPEECH_START' }
  | { type: 'ASSISTANT_SPEECH_END' }
  | { type: 'INTENT'; intent: VoiceIntent }
  | { type: 'RESUME_WINDOW_ELAPSED' }
  | { type: 'CONVERSATION_TIMEOUT' }
  | { type: 'MIC_TAP' }
  | { type: 'EXPLICIT_RESUME' }
  | { type: 'FAIL' }
  | { type: 'STOP' }

export interface VoiceMachineSnapshot {
  state: VoiceModeState
  mode: VoiceSessionMode
}

export const LAB_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
} as const

export interface AudioPlaybackAnchor {
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  paragraphNumber: number
  offsetSeconds: number
}

/** Result of pausing the audiobook for Ask. `wasPlaying` is the engine truth. */
export interface AudioPlaybackPause {
  anchor: AudioPlaybackAnchor
  wasPlaying: boolean
}

export interface VoiceReaderContext {
  bookId?: string
  bookTitle: string
  bookAuthor: string
  editionKey?: string
  editionLabel?: string
  chapterNumber?: number
  chapterLabel: string
  paragraphIndex?: number
  pageNumber?: number
  totalPages?: number
  readingAngle?: string
  currentParagraph?: string
  nearbyParagraphs?: string[]
  visibleText?: string
  readerProfile?: VoiceReaderProfile
}

export interface VoiceReaderProfile {
  libraryBooks: Array<{
    bookId: string
    title: string
    author: string
  }>
  recentBooks: Array<{
    bookId: string
    title: string
    chapterNumber: number
    paragraphIndex?: number
  }>
  recentExchanges: Array<{
    bookId: string
    bookTitle: string
    question: string
    answer?: string
    timestamp: number
  }>
  readingLanguages: string[]
}

export type VoiceLatencySample =
  | {
      kind: 'session_setup'
      at: number
      sessionSetupMs: number
      model: string
    }
  | {
      kind: 'turn'
      at: number
      turnNumber: number
      speechStoppedToFirstAudioMs: number
      model: string
    }

export interface VoiceApplicationToolResult {
  output: Record<string, unknown>
  /** Instructions for the short spoken turn after function output is attached. */
  responseInstructions?: string
}

export type VoiceApplicationToolHandler = (
  name: string,
  arguments_: Record<string, unknown>,
  callId: string,
) => VoiceApplicationToolResult | Promise<VoiceApplicationToolResult>
