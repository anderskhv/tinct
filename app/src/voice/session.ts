import type { AssistantPace, LabPlaybackSkip } from '../lab/labAsk'
import type { LabPlaybackNavigationOutcome } from '../lab/labVoiceControls'
import type { VoiceActivityPhase } from './v2/voiceV2'
import type {
  AudioPlaybackAnchor,
  AudioPlaybackPause,
  VoiceApplicationToolHandler,
  VoiceLatencySample,
  VoiceMachineSnapshot,
  VoiceModeState,
  VoiceReaderContext,
  VoiceSessionMode,
} from './types'

/** The reader's audiobook engine as the voice session sees it. */
export interface VoiceAudioEngine {
  pausePlayback: () => AudioPlaybackPause | null
  resumePlayback: (anchor: AudioPlaybackAnchor, playAudio?: boolean) => void
  /** Lab reader only. The classic reader leaves this unset. */
  setPlaybackSpeed?: (rate: number) => void
  /**
   * Lab reader only. May return whether playback should resume after the move
   * (see shouldResumePlaybackAfterNavigation); when it returns nothing, the
   * session's own wasPlaying decides.
   */
  skipPlayback?: (kind: LabPlaybackSkip) => void | LabPlaybackNavigationOutcome | Promise<void | LabPlaybackNavigationOutcome>
}

export interface VoiceSessionCallbacks {
  onSnapshot: (snapshot: VoiceUiSnapshot) => void
  /** Return false to refuse the reader's turn (anonymous allowance spent). */
  onBeforeUserTurn?: () => boolean
  onTurn: (role: 'user' | 'assistant', text: string, meta?: { cancelled?: boolean }) => void
  onNeedAuth?: () => void
  onInsufficientBalance?: () => void
  onUsage?: () => void
  onEndRequested?: () => void
  onLatency?: (sample: VoiceLatencySample) => void
  onSetAssistantPace?: (pace: AssistantPace) => void
  /** Production-owned Tinct tools such as history, navigation, and settings. */
  onApplicationTool?: VoiceApplicationToolHandler
}

/**
 * Transport truth, reported separately from what the session is doing. It
 * moves only on observed socket events and on the two explicit ends
 * (`stop`, `fail`) — never on a timer and never on a guess.
 */
export type VoiceConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected'

export interface VoiceUiSnapshot {
  state: VoiceModeState
  mode: VoiceMachineSnapshot['mode']
  /** Event-derived work phase: what the microphone and the assistant are doing. */
  activity: VoiceActivityPhase
  /** Transport only. Independent of microphone and assistant activity. */
  connection: VoiceConnectionState
  /** The reader muted the outgoing microphone. The assistant may still speak. */
  micMuted: boolean
  resumeInSeconds: number | null
  error: string | null
  isActive: boolean
  userSpeechStarted: boolean
}

export interface StartVoiceSessionInput {
  /** Spoken once when the session connects, before the reader speaks. */
  greeting?: string
  authToken: string | null
  isAnonymous: boolean
  /** Lab reader / library only. The classic reader leaves this unset so it still requires sign-in. */
  labGuest?: boolean
  context: VoiceReaderContext
  audio: VoiceAudioEngine
  wasPlaying: boolean
  mode?: VoiceSessionMode
  /** When set, replaces the whole system prompt (the library assistant). */
  instructions?: string
  /** Reference material (data, not instructions) appended to the Tinct prompt. */
  reference?: string
  /** When set, replaces VOICE_TOOLS. */
  tools?: readonly unknown[]
  /** Added to VOICE_TOOLS. Ignored when `tools` replaces them. */
  applicationTools?: readonly unknown[]
  /** Native provider web search. Defaults to on. */
  enableSearch?: boolean
  assistantPace?: AssistantPace
}

export const IDLE_VOICE_SNAPSHOT: VoiceUiSnapshot = {
  state: 'reading',
  mode: 'conversation',
  activity: 'idle',
  connection: 'idle',
  micMuted: false,
  resumeInSeconds: null,
  error: null,
  isActive: false,
  userSpeechStarted: false,
}
