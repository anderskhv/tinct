export type VoiceModeState =
  | 'reading'
  | 'listening'
  | 'answering'
  | 'resume_pending'
  | 'conversation_idle'

export type VoiceSessionMode = 'quick' | 'conversation'

export type VoiceIntent =
  | 'resume_audiobook'
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

export const RESUME_GRACE_MS = 4000
export const CONVERSATION_IDLE_TIMEOUT_MS = 45_000
export const MAX_VOICE_SESSION_MS = 3 * 60_000

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
  bookTitle: string
  bookAuthor: string
  chapterLabel: string
  readingAngle?: string
  currentParagraph?: string
  nearbyParagraphs?: string[]
  visibleText?: string
}
