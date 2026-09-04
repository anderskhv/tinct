export type VoiceModeState =
  | 'reading'
  | 'listening'
  | 'answering'
  | 'resume_pending'
  | 'conversation_idle'

export type VoiceSessionMode = 'quick' | 'conversation'

/** User-visible work phase, derived only from observed session/retrieval events. */
export type VoiceActivityPhase =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'checking_text'
  | 'preparing_answer'
  | 'speaking'

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

/** Lab: after resume_audiobook, wait this long for speech_start. If she never starts, honor. */
export const LAB_HONOR_RESUME_IDLE_MS = 4000
/** Lab: after user speech_started, force-end the turn after this much silence. */
export const LAB_STUCK_LISTENING_MS = 6000
/** Lab Realtime server_vad. Production keeps 700ms silence and default interrupt. */
export const LAB_VAD_THRESHOLD = 0.75
export const LAB_VAD_SILENCE_MS = 1200
export const LAB_VAD_INTERRUPT_RESPONSE = false
/** Lab: server_vad must not auto-create a response; we do that after 500ms speech. */
export const LAB_VAD_CREATE_RESPONSE = false
/** Lab Realtime semantic_vad. low waits longer before she yields. */
export const LAB_SEMANTIC_VAD_EAGERNESS = 'low' as const
/** Lab: unmute the outgoing mic this long after her speech_end. */
export const LAB_MIC_SETTLE_MS = 500
/** Lab Talk greeting. This is the first assistant response. */
export const LAB_VOICE_GREETING = "I'm listening."
export const LAB_AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
} as const
/** Lab: a barge-in is real only if speech_started lasts longer than this. */
export const LAB_BARGE_IN_MS = 500
/** Lab: after confirmed speech_stopped, wait this long for the server to create a response. */
export const LAB_FORCE_RESPONSE_MS = 250
export const VOICE_REALTIME_MODEL = 'gpt-realtime-2.1-mini'
export const VOICE_CLOSE_LINE = 'Picking up where we left off.'

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
