import { apiUrl } from '../utils/apiUrl'
import { ASSISTANT_PACE_SPEED, affirmativeAnswersLookupOffer, isLabPlaybackSkip, lookupQuestionFromOffer, parseAssistantPace, parseSetPlaybackSpeedArguments, type AssistantPace, type LabPlaybackSkip, cleanLabVoiceTranscript } from '../lab/labAsk'
import { shouldResumePlaybackAfterNavigation, type LabPlaybackNavigationOutcome } from '../lab/labVoiceControls'
import { holdingLineInstructions, LAB_HOLDING_LINE, LAB_HOP_NARRATION, LAB_STILL_LOOKING_LINE, LAB_STILL_LOOKING_MS } from '../lab/labCompanion'
import {
  ASK_COMPANION_TOOL,
  companionSpeakInstructions,
  isLabPlaybackUtterance,
  parseAskCompanionArguments,
  playbackArgsForUtterance,
  playbackToolForUtterance,
  runEscalatedCompanionTurn,
  shouldEscalateToCompanion,
  spokenCompanionAnswer,
  type CompanionAskNotify,
} from '../lab/labCompanion'
import {
  closingLineInstructionsV2,
  companionSpeakInstructionsV2,
  failureSpeakInstructionsV2,
  signOffInstructionsV2,
} from '../lab/labVoiceV2'
import { buildVoiceInstructions, VOICE_TOOLS } from './context'
import { classifyVoiceUtterance, shouldHonorModelEnd, shouldHonorModelResume } from './intents'
import {
  isBenignRealtimeError,
  normalizeCompanionResult,
  VOICE_V2_FAILURE_LINE,
  VOICE_V2_FAILURE_NOTICE,
  type CompanionAskResult,
  type VoiceActivityPhase,
  type VoiceVersion,
} from './v2/voiceV2'
import { INITIAL_VOICE_SNAPSHOT, isVoiceSessionActive, reduceVoiceSession, shouldResumeAudiobookOnEnterReading } from './stateMachine'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceApplicationToolHandler, VoiceEvent, VoiceIntent, VoiceLatencySample, VoiceMachineSnapshot, VoiceModeState, VoiceReaderContext, VoiceSessionMode } from './types'
import { LAB_AUDIO_CONSTRAINTS, LAB_BARGE_IN_MS, LAB_FORCE_RESPONSE_MS, LAB_HONOR_RESUME_IDLE_MS, LAB_MIC_SETTLE_MS, LAB_SEMANTIC_VAD_EAGERNESS, LAB_STUCK_LISTENING_MS, LAB_VAD_CREATE_RESPONSE, LAB_VAD_INTERRUPT_RESPONSE, LAB_VOICE_GREETING, VOICE_CLOSE_LINE, VOICE_REALTIME_MODEL } from './types'
import {
  INITIAL_VOICE_TURN,
  noteToolCallHandled,
  reduceVoiceTurn,
  type VoiceRealtimeEvent,
  type VoiceTurnSignal,
  type VoiceTurnState,
} from './voiceTurn'

export interface VoiceAudioEngine {
  pausePlayback: () => AudioPlaybackPause | null
  resumePlayback: (anchor: AudioPlaybackAnchor) => void
  /** Lab-only. Production audio engines leave this unset. */
  setPlaybackSpeed?: (rate: number) => void
  /**
   * Lab-only. Production audio engines leave this unset. May return whether
   * playback should resume after the move (see shouldResumePlaybackAfterNavigation);
   * when it returns nothing, the session's own wasPlaying decides.
   */
  skipPlayback?: (kind: LabPlaybackSkip) => void | LabPlaybackNavigationOutcome | Promise<void | LabPlaybackNavigationOutcome>
}

export interface VoiceSessionCallbacks {
  onSnapshot: (snapshot: VoiceUiSnapshot) => void
  onTurn: (role: 'user' | 'assistant', text: string, meta?: { cancelled?: boolean }) => void
  onNeedAuth?: () => void
  onInsufficientBalance?: () => void
  onUsage?: () => void
  onLatency?: (sample: VoiceLatencySample) => void
  /** Lab-only. Production leaves this unset. */
  onSetAssistantPace?: (pace: AssistantPace) => void
  /** Production-owned Tinct tools such as history, navigation, and settings. */
  onApplicationTool?: VoiceApplicationToolHandler
}

export interface VoiceUiSnapshot {
  state: VoiceModeState
  mode: VoiceMachineSnapshot['mode']
  /** Voice V2 only. Event-derived work phase; V1 always reports `idle`. */
  activity: VoiceActivityPhase
  resumeInSeconds: number | null
  error: string | null
  isActive: boolean
  userSpeechStarted: boolean
}

export interface StartVoiceSessionInput {
  authToken: string | null
  isAnonymous: boolean
  /** Lab-only. Production App.tsx leaves this unset so /app still requires sign-in. */
  labGuest?: boolean
  context: VoiceReaderContext
  audio: VoiceAudioEngine
  wasPlaying: boolean
  mode?: VoiceSessionMode
  /** When set, replaces production buildVoiceInstructions for this session. */
  instructions?: string
  /** When set, replaces VOICE_TOOLS. */
  tools?: readonly unknown[]
  /** Added to VOICE_TOOLS in production. Ignored when `tools` replaces them. */
  applicationTools?: readonly unknown[]
  /** Lab-only. Production leaves this unset so shouldHonorModelResume still gates the tool. */
  honorModelResume?: boolean
  /** Lab-only. Realtime audio.output.speed. */
  assistantPace?: AssistantPace
  /** Lab-only. Production AudioStrip leaves this unset. V2 may return a structured result. */
  onCompanionAsk?: (question: string, notify?: CompanionAskNotify) => Promise<string | CompanionAskResult>
  /** Lab-only. `/lab/reader?voice=v2` sets `'v2'`; everything else is V1. */
  voiceVersion?: VoiceVersion
}

type RealtimeEvent = VoiceRealtimeEvent

function snapshotFrom(
  machine: VoiceMachineSnapshot,
  extra: { activity?: VoiceActivityPhase; resumeInSeconds?: number | null; error?: string | null; userSpeechStarted?: boolean } = {},
): VoiceUiSnapshot {
  return {
    state: machine.state,
    mode: machine.mode,
    activity: extra.activity ?? 'idle',
    resumeInSeconds: extra.resumeInSeconds ?? null,
    error: extra.error ?? null,
    isActive: isVoiceSessionActive(machine.state),
    userSpeechStarted: extra.userSpeechStarted === true,
  }
}

const LAB_HONOR_RESUME_ANCHOR: AudioPlaybackAnchor = {
  bookId: 'lab',
  editionKey: 'lab',
  chapterNumber: 1,
  paragraphIndex: 0,
  paragraphNumber: 1,
  offsetSeconds: 0,
}

function speakCloseLine(): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve()
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(VOICE_CLOSE_LINE)
    utter.rate = 1
    utter.pitch = 1
    const done = () => resolve()
    utter.onend = done
    utter.onerror = done
    window.setTimeout(done, 2500)
    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    } catch {
      resolve()
    }
  })
}

function monotonicNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now()
  return Date.now()
}

export class VoiceSessionController {
  private machine: VoiceMachineSnapshot = INITIAL_VOICE_SNAPSHOT
  private lastUserIntent: VoiceIntent = 'none'
  /** Last confirmed reader utterance and last finished assistant line, for the lookup-offer guard. */
  private lastUserUtterance = ''
  private lastAssistantLine = ''
  /** A companion hop is in flight (V1 or V2): the model may speak only the holding line. */
  private hopPending = false
  private hopResponseAllowed = false
  private hopOverrunCancelled = false
  private holdingLine: string | null = null
  private stillLookingTimer: number | null = null
  /** Reader utterance that must reach the companion even if the model starts answering itself. */
  private pendingEscalation: string | null = null
  private assistantAnsweredSinceUserTurn = false
  /** The pending hop was started by the app (not by a model tool call). */
  private appHopActive = false
  private callbacks: VoiceSessionCallbacks
  private audio: VoiceAudioEngine | null = null
  private anchor: AudioPlaybackAnchor | null = null
  private shouldResumeBook = false
  private context: VoiceReaderContext | null = null
  private instructions: string | null = null
  private tools: readonly unknown[] | null = null
  private applicationTools: readonly unknown[] = []
  private honorModelResume = false
  private assistantPace: AssistantPace = 'normal'
  private onCompanionAsk: StartVoiceSessionInput['onCompanionAsk'] = undefined
  private pc: RTCPeerConnection | null = null
  private dc: RTCDataChannel | null = null
  private localStream: MediaStream | null = null
  private remoteAudio: HTMLAudioElement | null = null
  private turn: VoiceTurnState = INITIAL_VOICE_TURN
  private closed = false
  private deferredHonorResume: false | 'waiting_for_start' | 'waiting_for_end' = false
  private deferredHonorResumeTimer: number | null = null
  private deferredHonorEnd: false | 'waiting_for_start' | 'waiting_for_end' = false
  private deferredHonorEndTimer: number | null = null
  private awaitingModelResponse = false
  private forceResponseTimer: number | null = null
  private stuckListeningTimer: number | null = null
  private silenceWatchTimer: number | null = null
  private labAudioContext: AudioContext | null = null
  private userSpeechStarted = false
  private bargeInTimer: number | null = null
  private lastUtteranceConfirmed = false
  private sessionVadReady = false
  private firstUserTurnCommitted = false
  private firstAssistantDone = false
  private greetingRequested = false
  private assistantDraft = ''
  private assistantTranscriptFamily: 'output' | 'audio' | null = null
  private assistantLineFinished = false
  private micUnmuteTimer: number | null = null
  private connectionLossTimer: number | null = null
  private sessionStartedAt: number | null = null
  private speechStoppedAt: number | null = null
  private latencyTurnNumber = 0
  private firstAudioRecordedForTurn = false
  // Voice V2 preview state. Untouched (defaults) for V1 sessions.
  private voiceVersion: VoiceVersion = 'v1'
  private activity: VoiceActivityPhase = 'idle'
  /** Bumped on every confirmed reader turn so a stale companion hop can tell it was superseded. */
  private v2HopSeq = 0
  private v2HopInFlight = false
  private v2CreateOutstanding = false
  private v2UserSpeaking = false
  private v2SpokeThisResponse = false
  private v2SignOffRequested = false

  constructor(callbacks: VoiceSessionCallbacks) {
    this.callbacks = callbacks
  }

  getSnapshot(): VoiceUiSnapshot {
    return snapshotFrom(this.machine, {
      activity: this.activity,
      resumeInSeconds: this.currentResumeSeconds(),
      userSpeechStarted: this.userSpeechStarted,
    })
  }

  async start(input: StartVoiceSessionInput): Promise<void> {
    if (this.machine.state !== 'reading') {
      this.handleMicTap()
      return
    }

    this.closed = false
    this.voiceVersion = input.voiceVersion === 'v2' ? 'v2' : 'v1'
    this.resetV2Turn()
    this.activity = this.isV2() ? 'connecting' : 'idle'
    this.sessionStartedAt = monotonicNow()
    this.speechStoppedAt = null
    this.latencyTurnNumber = 0
    this.firstAudioRecordedForTurn = false
    this.lastUserIntent = 'none'
    this.lastUserUtterance = ''
    this.lastAssistantLine = ''
    this.pendingEscalation = null
    this.assistantAnsweredSinceUserTurn = false
    this.endHop()
    this.userSpeechStarted = false
    this.lastUtteranceConfirmed = false
    this.sessionVadReady = false
    this.firstUserTurnCommitted = false
    this.firstAssistantDone = false
    this.greetingRequested = false
    this.assistantDraft = ''
    this.assistantTranscriptFamily = null
    this.assistantLineFinished = false
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    if (input.honorModelResume) this.unlockLabAudioContext()
    this.turn = INITIAL_VOICE_TURN
    this.context = input.context
    this.instructions = input.instructions?.trim() || null
    this.tools = input.tools ?? null
    this.applicationTools = input.applicationTools ?? []
    this.honorModelResume = input.honorModelResume === true
    if (input.assistantPace) this.assistantPace = input.assistantPace
    this.onCompanionAsk = input.onCompanionAsk
    this.audio = input.audio
    const paused = input.audio.pausePlayback()
    this.anchor = paused?.anchor ?? null
    this.shouldResumeBook = Boolean(paused?.wasPlaying || input.wasPlaying)
    this.emit()

    if (!input.labGuest && (input.isAnonymous || !input.authToken)) {
      this.fail('Sign in to ask by voice.')
      this.callbacks.onNeedAuth?.()
      return
    }

    try {
      const mediaPromise = navigator.mediaDevices.getUserMedia({
        audio: input.honorModelResume ? { ...LAB_AUDIO_CONSTRAINTS } : true,
      })
      const tokenHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (input.authToken) tokenHeaders.Authorization = `Bearer ${input.authToken}`
      const tokenPromise = fetch(apiUrl(input.labGuest && !input.authToken ? '/api/lab-voice-session' : '/api/voice-session'), {
        method: 'POST',
        headers: tokenHeaders,
      })
      const [mediaResult, tokenResult] = await Promise.allSettled([mediaPromise, tokenPromise])
      if (this.closed) {
        if (mediaResult.status === 'fulfilled') {
          mediaResult.value.getTracks().forEach(track => track.stop())
        }
        return
      }
      if (mediaResult.status === 'rejected') {
        const error = mediaResult.reason
        const message = error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Microphone access is needed for voice.'
          : "Couldn't start voice. Try again."
        this.fail(message)
        return
      }
      this.localStream = mediaResult.value
      if (tokenResult.status === 'rejected') {
        this.fail("Couldn't start voice. Try again.")
        return
      }
      const tokenRes = tokenResult.value
      const tokenData = await tokenRes.json().catch(() => ({})) as { value?: string; error?: string }

      if (tokenRes.status === 402) {
        this.fail('Your AI chat balance is empty. Top up to continue.')
        this.callbacks.onInsufficientBalance?.()
        return
      }
      if (tokenRes.status === 401) {
        this.fail('Sign in to ask by voice.')
        this.callbacks.onNeedAuth?.()
        return
      }
      if (!tokenRes.ok || !tokenData.value) {
        this.fail(tokenData.error || 'Voice is not available right now.')
        return
      }

      this.callbacks.onUsage?.()
      await this.connectRealtime(tokenData.value)
      if (this.closed) {
        this.restoreBook({ speakClose: false })
        return
      }
      // The data channel is open: the first live snapshot already says so.
      if (this.isV2()) this.activity = this.turn.audioPlaying ? 'speaking' : 'listening'
      this.dispatch({ type: 'START', mode: input.mode })
      if (this.sessionStartedAt != null) {
        this.callbacks.onLatency?.({
          kind: 'session_setup',
          at: Date.now(),
          sessionSetupMs: Math.round(monotonicNow() - this.sessionStartedAt),
          model: VOICE_REALTIME_MODEL,
        })
      }
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone access is needed for voice.'
        : "Couldn't start voice. Try again."
      this.fail(message)
    }
  }

  handleMicTap(): void {
    if (this.machine.state === 'reading') return
    this.dispatch({ type: 'MIC_TAP' })
  }

  explicitResume(): void {
    if (this.machine.state === 'reading') return
    this.dispatch({ type: 'EXPLICIT_RESUME' })
  }

  stop(): void {
    this.closed = true
    this.activity = 'idle'
    this.userSpeechStarted = false
    this.lastUtteranceConfirmed = false
    this.sessionVadReady = false
    this.firstUserTurnCommitted = false
    this.firstAssistantDone = false
    this.greetingRequested = false
    this.assistantDraft = ''
    this.assistantTranscriptFamily = null
    this.assistantLineFinished = false
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    if (this.machine.state === 'reading') {
      this.machine = INITIAL_VOICE_SNAPSHOT
      this.turn = INITIAL_VOICE_TURN
      void this.restoreBook({ speakClose: false })
      this.emit()
      return
    }
    this.dispatch({ type: 'STOP' })
  }

  dispose(): void {
    this.closed = true
    this.restoreBook({ speakClose: false })
  }

  /** Test-only: enter a live session without WebRTC. */
  setAssistantPace(pace: AssistantPace): void {
    this.assistantPace = pace
    this.sendSessionUpdate()
  }

  updateContext(context: VoiceReaderContext): void {
    const movedToDifferentPassage = Boolean(
      this.context?.bookId
      && context.bookId
      && (this.context.bookId !== context.bookId || this.context.chapterNumber !== context.chapterNumber),
    )
    this.context = context
    if (movedToDifferentPassage) {
      // Refresh the pause anchor if the audio engine has already moved with
      // the reader. Otherwise refuse the stale anchor rather than jumping
      // back into the previous book/chapter when voice ends.
      const refreshed = this.audio?.pausePlayback()
      const refreshedMatches = Boolean(
        refreshed?.anchor
        && (!context.bookId || refreshed.anchor.bookId === context.bookId)
        && (typeof context.chapterNumber !== 'number' || refreshed.anchor.chapterNumber === context.chapterNumber),
      )
      this.anchor = refreshedMatches ? refreshed!.anchor : null
      if (!refreshedMatches) this.shouldResumeBook = false
    }
    if (this.machine.state !== 'reading') this.sendSessionUpdate()
  }

  testAssistantPace(): AssistantPace {
    return this.assistantPace
  }

  testPrimeSession(input: {
    audio: VoiceAudioEngine
    honorModelResume?: boolean
    lastUserIntent?: VoiceIntent
    onCompanionAsk?: StartVoiceSessionInput['onCompanionAsk']
    context?: VoiceReaderContext
    send?: (data: string) => void
    sessionVadReady?: boolean
    audioTracks?: Array<{ enabled: boolean; kind?: string }>
    greet?: boolean
    shouldResumeBook?: boolean
    applicationTools?: readonly unknown[]
    voiceVersion?: VoiceVersion
  }): void {
    this.voiceVersion = input.voiceVersion === 'v2' ? 'v2' : 'v1'
    this.resetV2Turn()
    this.activity = 'idle'
    this.honorModelResume = input.honorModelResume === true
    this.applicationTools = input.applicationTools ?? []
    this.onCompanionAsk = input.onCompanionAsk
    this.lastUserIntent = input.lastUserIntent ?? 'none'
    this.lastUserUtterance = ''
    this.lastAssistantLine = ''
    this.pendingEscalation = null
    this.assistantAnsweredSinceUserTurn = false
    this.endHop()
    this.userSpeechStarted = false
    this.lastUtteranceConfirmed = false
    this.firstUserTurnCommitted = false
    this.firstAssistantDone = false
    this.greetingRequested = false
    this.assistantDraft = ''
    this.assistantTranscriptFamily = null
    this.assistantLineFinished = false
    this.sessionVadReady = input.sessionVadReady ?? (input.honorModelResume === true)
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    this.audio = input.audio
    if (input.context) this.context = input.context
    if (input.audioTracks) {
      this.localStream = { getAudioTracks: () => input.audioTracks as MediaStreamTrack[] } as MediaStream
    }
    if (input.send) {
      this.dc = { readyState: 'open', send: input.send } as RTCDataChannel
      this.instructions = this.instructions || 'lab'
      this.context = this.context || input.context || {
        bookTitle: 'The Odyssey',
        bookAuthor: 'Homer',
        chapterLabel: 'Book 1',
      }
      if (input.sessionVadReady !== false) this.sendSessionUpdate()
      if (input.greet) this.sendLabGreeting()
    }
    this.anchor = {
      bookId: 'odyssey',
      editionKey: 'original-en',
      chapterNumber: 1,
      paragraphIndex: 0,
      paragraphNumber: 1,
      offsetSeconds: 1,
    }
    this.shouldResumeBook = input.shouldResumeBook !== false
    if (this.isV2()) this.activity = this.turn.audioPlaying ? 'speaking' : 'listening'
    this.dispatch({ type: 'START', mode: 'conversation' })
  }

  /** Test-only: inject a realtime event. */
  testRealtime(event: VoiceRealtimeEvent): void | Promise<void> {
    return this.handleRealtimeEvent(event)
  }

  /** Test-only: simulate the Realtime data channel closing under a live session. */
  testDataChannelClosed(): void {
    if (this.dc) this.handleDataChannelClosed(this.dc)
  }

  private dispatch(event: VoiceEvent): void {
    const previous = this.machine
    const next = reduceVoiceSession(previous, event)
    if (previous === next) {
      return
    }
    this.machine = next
    if (next.state === 'reading') this.activity = 'idle'
    this.emit()

    if (shouldResumeAudiobookOnEnterReading(previous, next)) {
      void this.leaveVoice({
        speakClose: false,
      })
    }
  }

  private emit(error: string | null = null): void {
    this.callbacks.onSnapshot(snapshotFrom(this.machine, {
      activity: this.activity,
      resumeInSeconds: this.currentResumeSeconds(),
      error,
      userSpeechStarted: this.userSpeechStarted,
    }))
  }

  private isV2(): boolean {
    return this.voiceVersion === 'v2'
  }

  /** V2 only: publish a phase change the moment the event that proves it arrives. */
  private setActivity(next: VoiceActivityPhase): void {
    if (!this.isV2() || this.activity === next) return
    this.activity = next
    this.emit()
  }

  private resetV2Turn(): void {
    this.v2HopInFlight = false
    this.v2CreateOutstanding = false
    this.v2UserSpeaking = false
    this.v2SpokeThisResponse = false
    this.v2SignOffRequested = false
  }

  /** V2: a turn is still owed an answer while any of these is true. */
  private v2TurnBusy(): boolean {
    return this.v2HopInFlight || this.v2CreateOutstanding || this.turn.pendingFunctionCall
  }

  private v2SessionGone(): boolean {
    return this.closed || this.machine.state === 'reading'
  }

  /** V2: the Realtime leg failed after a request was live. Say so visibly, keep listening. */
  private noticeV2Failure(): void {
    this.v2HopInFlight = false
    this.v2CreateOutstanding = false
    this.awaitingModelResponse = false
    this.clearForceResponseTimer()
    this.activity = 'listening'
    this.emit(VOICE_V2_FAILURE_NOTICE)
  }

  private sendFunctionOutput(callId: string, output: Record<string, unknown>): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(output),
      },
    })
  }

  private handleDataChannelClosed(dc: RTCDataChannel): void {
    if (!this.isV2() || this.closed || this.dc !== dc) return
    if (this.machine.state === 'reading') return
    this.fail('Connection lost.')
  }

  private noteSpeechStoppedForLatency(): void {
    this.latencyTurnNumber += 1
    this.speechStoppedAt = monotonicNow()
    this.firstAudioRecordedForTurn = false
  }

  private noteFirstAudioForLatency(): void {
    if (this.speechStoppedAt == null || this.firstAudioRecordedForTurn) return
    this.firstAudioRecordedForTurn = true
    this.callbacks.onLatency?.({
      kind: 'turn',
      at: Date.now(),
      turnNumber: this.latencyTurnNumber,
      speechStoppedToFirstAudioMs: Math.round(monotonicNow() - this.speechStoppedAt),
      model: VOICE_REALTIME_MODEL,
    })
  }

  private currentResumeSeconds(): number | null {
    return null
  }

  private fail(error: string): void {
    this.activity = 'idle'
    this.resetV2Turn()
    this.machine = INITIAL_VOICE_SNAPSHOT
    this.turn = INITIAL_VOICE_TURN
    this.userSpeechStarted = false
    this.lastUtteranceConfirmed = false
    this.sessionVadReady = false
    this.firstUserTurnCommitted = false
    this.firstAssistantDone = false
    this.greetingRequested = false
    this.assistantDraft = ''
    this.assistantTranscriptFamily = null
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    this.setOutgoingMicEnabled(true)
    this.emit(error)
    void this.restoreBook({ speakClose: false })
  }

  private async leaveVoice(opts: { speakClose: boolean }): Promise<void> {
    await this.restoreBook(opts)
  }

  /** Undo the Ask pause: resume if the book was playing, keep the paused-at-Ask place either way. */
  private async restoreBook(opts: { speakClose: boolean }): Promise<void> {
    const resumeBook = this.shouldResumeBook
    const anchor = this.anchor
    const audio = this.audio
    this.anchor = null
    this.audio = null
    this.shouldResumeBook = false
    this.teardownConnection()
    this.clearTimers()
    this.turn = INITIAL_VOICE_TURN
    if (opts.speakClose && resumeBook) {
      await speakCloseLine()
    }
    if (resumeBook && audio) {
      audio.resumePlayback(anchor ?? LAB_HONOR_RESUME_ANCHOR)
    }
  }

  private clearTimers(): void {
    this.endHop()
    this.pendingEscalation = null
    this.clearDeferredHonorResumeTimer()
    this.clearDeferredHonorEndTimer()
    this.clearLabUserTurnWatch()
    this.clearForceResponseTimer()
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    this.lastUtteranceConfirmed = false
    this.deferredHonorResume = false
    this.deferredHonorEnd = false
    this.awaitingModelResponse = false
    this.speechStoppedAt = null
    this.firstAudioRecordedForTurn = false
    this.resetV2Turn()
  }

  private async connectRealtime(ephemeralKey: string): Promise<void> {
    const pc = new RTCPeerConnection()
    this.pc = pc

    const remoteAudio = document.createElement('audio')
    remoteAudio.autoplay = true
    remoteAudio.setAttribute('playsinline', 'true')
    this.remoteAudio = remoteAudio
    pc.ontrack = event => {
      remoteAudio.srcObject = event.streams[0]
      void remoteAudio.play().catch(() => { /* autoplay may be unlocked by the tap */ })
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        if (this.connectionLossTimer != null) window.clearTimeout(this.connectionLossTimer)
        this.connectionLossTimer = null
        return
      }
      if (pc.connectionState === 'failed') {
        this.fail('Connection lost.')
        return
      }
      if (pc.connectionState === 'disconnected' && this.connectionLossTimer == null) {
        this.connectionLossTimer = window.setTimeout(() => {
          this.connectionLossTimer = null
          if (this.pc === pc && pc.connectionState === 'disconnected') this.fail('Connection lost.')
        }, 10_000)
      }
    }
    remoteAudio.addEventListener('ended', () => {
      if (this.deferredHonorResume === 'waiting_for_end') this.commitHonoredResume()
      if (this.deferredHonorEnd === 'waiting_for_end') this.commitHonoredEnd()
    })

    this.localStream?.getTracks().forEach(track => pc.addTrack(track, this.localStream!))

    const dc = pc.createDataChannel('oai-events')
    this.dc = dc
    const dataChannelReady = new Promise<void>(resolve => {
      dc.addEventListener('open', () => {
        this.sendSessionUpdate()
        this.sendLabGreeting()
        resolve()
      }, { once: true })
    })
    dc.addEventListener('message', event => {
      try {
        this.handleRealtimeEvent(JSON.parse(String(event.data)) as RealtimeEvent)
      } catch { /* ignore malformed events */ }
    })
    dc.addEventListener('close', () => this.handleDataChannelClosed(dc))

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    })
    if (!sdpResponse.ok) {
      throw new Error("Couldn't connect the voice session.")
    }
    await pc.setRemoteDescription({
      type: 'answer',
      sdp: await sdpResponse.text(),
    })
    let dataChannelTimeout: number | null = null
    try {
      await Promise.race([
        dataChannelReady,
        new Promise<void>((_, reject) => {
          dataChannelTimeout = window.setTimeout(() => reject(new Error("Couldn't open the voice session.")), 15_000)
        }),
      ])
    } finally {
      if (dataChannelTimeout != null) window.clearTimeout(dataChannelTimeout)
    }
  }

  private sendSessionUpdate(): void {
    if (!this.dc || this.dc.readyState !== 'open' || !this.context) return
    const tools = this.tools ?? [...VOICE_TOOLS, ...this.applicationTools]
    const session: Record<string, unknown> = {
      type: 'realtime',
      instructions: this.instructions || buildVoiceInstructions(this.context),
      audio: {
        input: {
          transcription: { model: 'gpt-4o-mini-transcribe' },
          turn_detection: this.honorModelResume
            ? {
                type: 'semantic_vad',
                eagerness: LAB_SEMANTIC_VAD_EAGERNESS,
                interrupt_response: LAB_VAD_INTERRUPT_RESPONSE,
                create_response: LAB_VAD_CREATE_RESPONSE,
              }
            : {
                type: 'semantic_vad',
                eagerness: 'auto',
                interrupt_response: true,
                create_response: true,
              },
          ...(this.honorModelResume ? { noise_reduction: { type: 'far_field' } } : {}),
        },
        // Realtime audio.output.speed for her speaking rate, not the book.
        output: {
          speed: ASSISTANT_PACE_SPEED[this.assistantPace],
        },
      },
    }
    if (tools.length > 0) {
      session.tools = tools
      session.tool_choice = 'auto'
    }
    this.dc.send(JSON.stringify({
      type: 'session.update',
      session,
    }))
    if (this.honorModelResume) {
      this.sessionVadReady = true
      this.sendEvent({ type: 'input_audio_buffer.clear' })
    }
  }

  private sendEvent(payload: Record<string, unknown>): void {
    if (!this.dc || this.dc.readyState !== 'open') return
    // While a companion hop is pending the only responses allowed are the
    // holding lines and the answer itself; a stray response.create is how the
    // Realtime model ended up narrating "I'm still waiting on the companion…".
    if (payload.type === 'response.create' && this.hopPending && !this.hopResponseAllowed) return
    this.dc.send(JSON.stringify(payload))
    if (this.isV2() && payload.type === 'response.create') this.v2CreateOutstanding = true
  }

  private applyTurnResult(result: { state: VoiceTurnState; signal: VoiceTurnSignal }): void {
    this.turn = result.state
    if (result.signal === 'speech_start') {
      this.v2SpokeThisResponse = true
      this.setActivity('speaking')
      this.assistantLineFinished = false
      this.dispatch({ type: 'ASSISTANT_SPEECH_START' })
      if (this.honorModelResume && !this.firstAssistantDone) {
        this.clearMicUnmuteTimer()
        this.setOutgoingMicEnabled(false)
      }
      if (this.deferredHonorResume === 'waiting_for_start') {
        this.clearDeferredHonorResumeTimer()
        this.deferredHonorResume = 'waiting_for_end'
      }
      if (this.deferredHonorEnd === 'waiting_for_start') {
        this.clearDeferredHonorEndTimer()
        this.deferredHonorEnd = 'waiting_for_end'
      }
    }
    if (result.signal === 'speech_end') {
      this.assistantLineFinished = true
      this.dispatch({ type: 'ASSISTANT_SPEECH_END' })
      if (
        this.isV2()
        && !this.v2TurnBusy()
        && this.deferredHonorEnd !== 'waiting_for_end'
        && this.deferredHonorResume !== 'waiting_for_end'
      ) {
        this.setActivity('listening')
      }
      if (this.honorModelResume) {
        this.completeFirstAssistantResponse()
        this.armMicUnmute()
      }
      if (this.deferredHonorResume === 'waiting_for_end') this.commitHonoredResume()
      if (this.deferredHonorEnd === 'waiting_for_end') this.commitHonoredEnd()
    }
  }

  /**
   * Lab wait rule: after resume_audiobook, do not honor until she starts
   * then finishes the closing line. Idle (~4s) only if she never starts.
   */
  private armDeferredHonorResume(): void {
    this.clearDeferredHonorResumeTimer()
    this.deferredHonorResumeTimer = window.setTimeout(() => {
      if (this.deferredHonorResume === 'waiting_for_start') this.commitHonoredResume()
    }, LAB_HONOR_RESUME_IDLE_MS)
  }

  private commitHonoredResume(): void {
    if (!this.deferredHonorResume) return
    this.clearDeferredHonorResumeTimer()
    this.deferredHonorResume = false
    this.turn = INITIAL_VOICE_TURN
    this.shouldResumeBook = true
    if (!this.anchor) this.anchor = LAB_HONOR_RESUME_ANCHOR
    this.dispatch({ type: 'INTENT', intent: 'resume_audiobook' })
  }

  private clearDeferredHonorResumeTimer(): void {
    if (this.deferredHonorResumeTimer != null) window.clearTimeout(this.deferredHonorResumeTimer)
    this.deferredHonorResumeTimer = null
  }

  /** Lab: a recognized goodbye gets one short spoken sign-off, then closes. */
  private armDeferredHonorEnd(): void {
    this.clearDeferredHonorEndTimer()
    this.deferredHonorEndTimer = window.setTimeout(() => {
      if (this.deferredHonorEnd === 'waiting_for_start') this.commitHonoredEnd()
    }, LAB_HONOR_RESUME_IDLE_MS)
  }

  private commitHonoredEnd(): void {
    if (!this.deferredHonorEnd) return
    this.clearDeferredHonorEndTimer()
    this.deferredHonorEnd = false
    this.turn = INITIAL_VOICE_TURN
    this.dispatch({ type: 'INTENT', intent: 'end_voice_session' })
  }

  private clearDeferredHonorEndTimer(): void {
    if (this.deferredHonorEndTimer != null) window.clearTimeout(this.deferredHonorEndTimer)
    this.deferredHonorEndTimer = null
  }


  private assistantIsSpeaking(): boolean {
    return this.turn.audioPlaying || this.machine.state === 'answering'
  }

  private clearBargeInTimer(): void {
    if (this.bargeInTimer != null) window.clearTimeout(this.bargeInTimer)
    this.bargeInTimer = null
  }

  private confirmUserSpeech(): void {
    this.bargeInTimer = null
    this.lastUtteranceConfirmed = true
    this.userSpeechStarted = true
    this.assistantLineFinished = false
    this.assistantAnsweredSinceUserTurn = false
    // V2 also cancels a response that is still being prepared (no audio yet),
    // so the reader's new turn is never answered twice or queued behind a stale answer.
    const v2PreparingAnswer = this.isV2() && this.turn.responseOpen
    if (this.honorModelResume && this.firstAssistantDone && (this.assistantIsSpeaking() || v2PreparingAnswer)) {
      this.sendEvent({ type: 'response.cancel' })
      this.sendEvent({ type: 'output_audio_buffer.clear' })
    }
    this.v2UserSpeaking = true
    this.dispatch({ type: 'USER_SPEECH_START' })
    this.setActivity('listening')
    this.awaitingModelResponse = false
    this.armLabUserTurnWatch()
  }

  /**
   * Lab: speech_started is a barge-in only after 500ms of sustained speech.
   * Shorter blips (echo, "oh está") must not stop her or create a response.
   */
  private handleSpeechStarted(): void {
    if (!this.honorModelResume) {
      this.lastUtteranceConfirmed = true
      this.userSpeechStarted = true
      this.dispatch({ type: 'USER_SPEECH_START' })
      this.awaitingModelResponse = false
      this.armLabUserTurnWatch()
      return
    }
    if (!this.sessionVadReady || this.ignoringFirstResponseBargeIn()) {
      this.clearBargeInTimer()
      this.userSpeechStarted = false
      this.sendEvent({ type: 'input_audio_buffer.clear' })
      return
    }
    this.clearBargeInTimer()
    this.userSpeechStarted = false
    this.bargeInTimer = window.setTimeout(() => {
      this.confirmUserSpeech()
    }, LAB_BARGE_IN_MS)
  }

  private handleSpeechStopped(): void {
    if (!this.honorModelResume) {
      this.noteSpeechStoppedForLatency()
      this.clearLabUserTurnWatch()
      this.dispatch({ type: 'USER_SPEECH_END' })
      this.ensureResponseAfterUserSpeech()
      return
    }
    if (!this.sessionVadReady || this.ignoringFirstResponseBargeIn()) {
      this.clearBargeInTimer()
      this.userSpeechStarted = false
      this.sendEvent({ type: 'input_audio_buffer.clear' })
      return
    }
    if (this.bargeInTimer != null) {
      this.clearBargeInTimer()
      this.userSpeechStarted = false
      this.sendEvent({ type: 'input_audio_buffer.clear' })
      return
    }
    if (!this.lastUtteranceConfirmed && !this.userSpeechStarted) {
      this.sendEvent({ type: 'input_audio_buffer.clear' })
      return
    }
    this.clearLabUserTurnWatch()
    this.dispatch({ type: 'USER_SPEECH_END' })
    this.noteV2UserTurnEnded()
    this.lastUtteranceConfirmed = false
    if (!this.firstUserTurnCommitted) {
      this.firstUserTurnCommitted = true
      this.sendEvent({ type: 'input_audio_buffer.clear' })
    }
    this.ensureResponseAfterUserSpeech()
  }

  /** V2: the reader finished a turn. Anything still checking for an older turn is now stale. */
  private noteV2UserTurnEnded(): void {
    if (!this.isV2()) return
    this.v2UserSpeaking = false
    this.v2HopSeq += 1
    this.setActivity('checking_text')
  }

  private shouldDiscardUserTranscript(): boolean {
    if (!this.honorModelResume) return false
    if (this.lastUtteranceConfirmed) return false
    return this.assistantIsSpeaking()
  }

  private handleRealtimeEvent(event: RealtimeEvent): void | Promise<void> {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        this.handleSpeechStarted()
        return
      case 'input_audio_buffer.speech_stopped':
        this.handleSpeechStopped()
        return
      case 'response.created':
        this.awaitingModelResponse = false
        this.clearForceResponseTimer()
        this.assistantDraft = ''
        this.assistantTranscriptFamily = null
        if (this.honorModelResume && !this.firstAssistantDone) {
          this.clearMicUnmuteTimer()
          this.setOutgoingMicEnabled(false)
        }
        this.applyTurnResult(reduceVoiceTurn(this.turn, event))
        if (this.isV2()) {
          this.v2CreateOutstanding = false
          this.v2SpokeThisResponse = false
          // The opening "I'm listening." is not an answer being prepared.
          const greeting = this.greetingRequested && !this.firstAssistantDone && !this.firstUserTurnCommitted
          if (!greeting) this.setActivity('preparing_answer')
        }
        return
      case 'output_audio_buffer.started':
      case 'response.output_audio.delta':
      case 'response.audio.delta':
      case 'output_audio_buffer.stopped':
      case 'response.done':
      case 'response.cancelled': {
        if (event.type === 'output_audio_buffer.started' || event.type === 'response.output_audio.delta' || event.type === 'response.audio.delta') {
          this.noteFirstAudioForLatency()
        }
        const turnResult = reduceVoiceTurn(this.turn, event)
        this.applyTurnResult(turnResult)
        if (event.type === 'output_audio_buffer.started' && this.pendingEscalation && !this.hopPending && !this.turn.pendingFunctionCall) {
          this.escalateNow()
        }
        if (event.type === 'response.done' && this.assistantDraft.trim()) this.assistantAnsweredSinceUserTurn = true
        const cancelled = event.type === 'response.cancelled' || event.response?.status === 'cancelled'
        if (cancelled) this.flushAssistantDraft(true)
        if (this.honorModelResume && this.firstUserTurnCommitted && !this.turn.audioPlaying) {
          this.completeFirstAssistantResponse()
        }
        if (this.honorModelResume && cancelled) {
          this.completeFirstAssistantResponse()
          this.armMicUnmute()
          this.recoverAfterCancel()
        }
        if (this.isV2() && (event.type === 'response.done' || event.type === 'response.cancelled')) {
          this.settleV2Response(event, cancelled, turnResult.signal)
        }
        return
      }
      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta': {
        if (!this.acceptAssistantTranscript(event.type || '')) return
        const piece = event.delta || event.transcript || ''
        if (piece && this.pendingEscalation && !this.hopPending && !this.turn.pendingFunctionCall) {
          // The model chose to answer a book question itself: cut it off and ask the companion.
          this.escalateNow()
          return
        }
        if (piece) this.noteAssistantDelta(piece)
        return
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const raw = (event.transcript || event.item?.transcript || '').trim()
        const text = this.honorModelResume ? cleanLabVoiceTranscript(raw) : raw
        if (!text) return
        if (this.shouldDiscardUserTranscript()) return
        this.lastUtteranceConfirmed = false
        this.lastUserUtterance = text
        this.callbacks.onTurn('user', text)
        const intent = classifyVoiceUtterance(text)
        this.lastUserIntent = intent
        if (intent === 'none') {
          this.noteEscalationCandidate(text)
          return
        }
        if (this.honorModelResume && intent === 'resume_audiobook') return
        if (this.honorModelResume && intent === 'end_voice_session') {
          this.deferredHonorEnd = 'waiting_for_start'
          this.armDeferredHonorEnd()
          return
        }
        this.dispatch({ type: 'INTENT', intent })
        return
      }
      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done': {
        if (!this.acceptAssistantTranscript(event.type || '')) return
        const text = (event.transcript || event.item?.transcript || '').trim()
        if (text) this.keepAssistantDraft(text)
        this.enforceHoldingLine()
        this.flushAssistantDraft(false)
        return
      }
      case 'response.function_call_arguments.done': {
        const name = event.name || event.item?.name
        const callId = event.call_id || event.item?.call_id
        const rawArguments = event.arguments || event.item?.arguments
        if (!name || !callId) return
        this.applyTurnResult(reduceVoiceTurn(this.turn, event))
        return this.handleToolCall(name, callId, rawArguments)
      }
      case 'error':
        if (this.isV2()) {
          this.handleV2RealtimeError(event.error?.message)
          return
        }
        if (event.error?.message) this.emit(event.error.message)
        return
      default:
        return
    }
  }

  /**
   * V2: a response finished without leaving speech behind. Decide, from the
   * events alone, whether the turn is settled, owed a sign-off, or failed.
   */
  private settleV2Response(event: RealtimeEvent, cancelled: boolean, signal: VoiceTurnSignal): void {
    if (this.v2SessionGone()) return
    if (signal === 'speech_end') return
    if (this.turn.audioPlaying || this.v2TurnBusy()) return
    if (this.v2SpokeThisResponse) return
    if (event.response?.status === 'failed') {
      this.noticeV2Failure()
      return
    }
    if (this.deferredHonorEnd === 'waiting_for_start') {
      // The model called end_voice_session without speaking. One sign-off, then close.
      if (this.v2SignOffRequested) {
        this.commitHonoredEnd()
        return
      }
      this.v2SignOffRequested = true
      this.sendEvent({ type: 'response.create', response: { instructions: signOffInstructionsV2() } })
      return
    }
    if (this.deferredHonorResume === 'waiting_for_start') {
      if (this.v2SignOffRequested) {
        this.commitHonoredResume()
        return
      }
      this.v2SignOffRequested = true
      this.sendEvent({ type: 'response.create', response: { instructions: closingLineInstructionsV2() } })
      return
    }
    if (cancelled) {
      this.setActivity('listening')
      return
    }
    if (this.activity === 'preparing_answer') {
      // A live request produced no speech and no tool call: a silent drop. Say so.
      this.noticeV2Failure()
      return
    }
    this.setActivity('listening')
  }

  private handleV2RealtimeError(message: string | undefined): void {
    const hadOutstandingCreate = this.v2CreateOutstanding
    this.v2CreateOutstanding = false
    if (isBenignRealtimeError(message)) return
    if (this.v2SessionGone()) {
      if (message) this.emit(message)
      return
    }
    if (hadOutstandingCreate || this.activity === 'preparing_answer') {
      this.noticeV2Failure()
      return
    }
    if (message) this.emit(message)
  }

  private speakCoverLine(text: string): boolean {
    const line = text.replace(/\s+/g, ' ').trim()
    if (!line || !this.dc || this.dc.readyState !== 'open') return false
    this.holdingLine = line
    this.hopOverrunCancelled = false
    this.sendHopResponse({
      type: 'response.create',
      response: { instructions: holdingLineInstructions(line) },
    })
    return true
  }

  /** A response.create the hop itself is allowed to make (holding line or answer). */
  private sendHopResponse(payload: Record<string, unknown>): void {
    this.hopResponseAllowed = true
    try {
      this.sendEvent(payload)
    } finally {
      this.hopResponseAllowed = false
    }
  }

  private beginHop(): void {
    this.hopPending = true
    this.hopOverrunCancelled = false
    this.holdingLine = null
    this.armStillLookingTimer()
  }

  private endHop(): void {
    this.hopPending = false
    this.appHopActive = false
    this.holdingLine = null
    this.clearStillLookingTimer()
  }

  /** Rule 2: after ~6 s of a pending hop, one more short line, then silence. */
  private armStillLookingTimer(): void {
    this.clearStillLookingTimer()
    if (typeof window === 'undefined') return
    this.stillLookingTimer = window.setTimeout(() => {
      this.stillLookingTimer = null
      if (!this.hopPending || this.closed || this.turn.audioPlaying) return
      this.holdingLine = LAB_STILL_LOOKING_LINE
      this.hopOverrunCancelled = false
      this.sendHopResponse({
        type: 'response.create',
        response: { instructions: holdingLineInstructions(LAB_STILL_LOOKING_LINE) },
      })
    }, LAB_STILL_LOOKING_MS)
  }

  private clearStillLookingTimer(): void {
    if (this.stillLookingTimer != null && typeof window !== 'undefined') window.clearTimeout(this.stillLookingTimer)
    this.stillLookingTimer = null
  }

  /**
   * Rules 1 and 3: during a hop the model may say the holding line and
   * nothing else. Anything longer, or any mention of the mechanism, is cut
   * off at once and the transcript keeps only the holding line.
   */
  private enforceHoldingLine(): void {
    if (!this.hopPending || this.hopOverrunCancelled) return
    const draft = this.assistantDraft.replace(/\s+/g, ' ').trim()
    if (!draft) return
    const allowed = this.holdingLine ?? LAB_HOLDING_LINE
    const overrun = draft.length > allowed.length + 12 || LAB_HOP_NARRATION.test(draft)
    if (!overrun) return
    this.hopOverrunCancelled = true
    this.sendEvent({ type: 'response.cancel' })
    this.sendEvent({ type: 'output_audio_buffer.clear' })
    this.assistantDraft = allowed
  }

  /**
   * Every reader utterance about the book goes to the companion. If the
   * Realtime model starts answering it itself, that answer is cancelled and
   * the companion is asked directly.
   */
  private noteEscalationCandidate(text: string): void {
    if (!this.honorModelResume || !this.onCompanionAsk) return
    if (this.hopPending || this.turn.pendingFunctionCall) return
    let question: string | null = null
    if (affirmativeAnswersLookupOffer(text, this.lastAssistantLine)) {
      question = lookupQuestionFromOffer(this.lastAssistantLine, text)
    } else if (shouldEscalateToCompanion(text)) {
      question = text
    }
    if (!question) return
    this.pendingEscalation = question
    if (this.turn.responseOpen || this.turn.audioPlaying) {
      // The model is already answering in its own words: cut it off now.
      // If it has produced nothing yet, wait for its first signal (a tool
      // call is fine; speech is not).
      if (this.assistantDraft.trim() || this.turn.audioPlaying) this.escalateNow()
      return
    }
    if (this.assistantAnsweredSinceUserTurn) this.escalateNow()
  }

  private escalateNow(): void {
    const question = this.pendingEscalation
    this.pendingEscalation = null
    if (!question || this.hopPending || !this.onCompanionAsk) return
    if (this.turn.responseOpen || this.turn.audioPlaying) {
      this.sendEvent({ type: 'response.cancel' })
      this.sendEvent({ type: 'output_audio_buffer.clear' })
      this.assistantDraft = ''
    }
    if (this.lastAssistantLine && affirmativeAnswersLookupOffer(this.lastUserUtterance, this.lastAssistantLine)) this.lastAssistantLine = ''
    void this.runAppEscalation(question)
  }

  private async runAppEscalation(question: string): Promise<void> {
    const query = this.onCompanionAsk
    if (!query) return
    if (this.isV2()) {
      await this.runAppEscalationV2(question, query)
      return
    }
    this.beginHop()
    this.appHopActive = true
    let latest = ''
    const hop = await runEscalatedCompanionTurn({
      question,
      alreadySpeaking: this.alreadySpeakingThisTurn(),
      speakCover: line => this.speakCoverLine(line),
      query: (asked) => query(asked, {
        onDelta: (text) => { latest = text },
        onFirstSpeakable: () => { /* holding line only; the full answer is spoken once below */ },
      }).then(result => (typeof result === 'string' ? result : result.answer)),
    })
    if (this.closed) {
      this.endHop()
      return
    }
    const full = spokenCompanionAnswer(hop.answer.trim() || latest.trim())
      || hop.answer.trim()
      || latest.trim()
      || 'I could not get a reading of this passage just now.'
    await this.waitUntilQuietForHop()
    this.endHop()
    if (this.closed) return
    this.sendHopResponse({
      type: 'response.create',
      response: { instructions: companionSpeakInstructions(full) },
    })
  }

  private async runAppEscalationV2(question: string, query: NonNullable<StartVoiceSessionInput['onCompanionAsk']>): Promise<void> {
    const seq = this.v2HopSeq
    this.beginHop()
    this.appHopActive = true
    this.v2HopInFlight = true
    this.setActivity('checking_text')
    let result: CompanionAskResult
    try {
      result = normalizeCompanionResult(await query(question))
    } catch {
      result = { status: 'failed', answer: '', attempts: 1, stopReason: 'error', failureReason: 'request_failed' }
    }
    if (this.v2SessionGone()) {
      this.endHop()
      this.v2HopInFlight = false
      return
    }
    await this.waitForV2UserTurnEnd()
    if (this.v2SessionGone() || seq !== this.v2HopSeq) {
      this.endHop()
      this.v2HopInFlight = false
      if (!this.v2SessionGone()) this.setActivity('listening')
      return
    }
    const completed = result.status === 'completed' && result.answer.trim().length > 0
    const answer = completed ? result.answer.trim() : VOICE_V2_FAILURE_LINE
    this.setActivity('preparing_answer')
    await this.waitUntilQuietForHop()
    this.endHop()
    if (this.v2SessionGone()) {
      this.v2HopInFlight = false
      return
    }
    this.sendHopResponse({
      type: 'response.create',
      response: { instructions: completed ? companionSpeakInstructionsV2(answer) : failureSpeakInstructionsV2() },
    })
    this.v2HopInFlight = false
  }

  private alreadySpeakingThisTurn(): boolean {
    return this.turn.audioPlaying || this.turn.spokenThisTurn
  }

  /**
   * A bare "yes" to an offer such as "we could go back a few chapters and
   * have a look?" is consent to the lookup. The hop carries no history, so
   * the offer itself becomes the question.
   */
  private expandAffirmativeQuestion(question: string): string {
    if (!affirmativeAnswersLookupOffer(question, this.lastAssistantLine)) return question
    const expanded = lookupQuestionFromOffer(this.lastAssistantLine, question)
    this.lastAssistantLine = ''
    return expanded
  }

  private lookupConsentPending(): boolean {
    return affirmativeAnswersLookupOffer(this.lastUserUtterance, this.lastAssistantLine)
  }

  /** The model answered a lookup consent with a move or a resume: do the lookup instead. */
  private async redirectToLookup(callId: string): Promise<void> {
    const question = lookupQuestionFromOffer(this.lastAssistantLine, this.lastUserUtterance)
    this.lastAssistantLine = ''
    const rawArguments = JSON.stringify({ question })
    if (this.isV2()) await this.handleCompanionAskV2(callId, rawArguments)
    else await this.handleCompanionAsk(callId, rawArguments)
  }

  private resumeAfterNavigation(outcome: void | LabPlaybackNavigationOutcome): boolean {
    if (outcome && typeof outcome === 'object' && typeof outcome.resumePlayback === 'boolean') return outcome.resumePlayback
    return shouldResumePlaybackAfterNavigation({ sessionStartedFromPlayback: this.shouldResumeBook })
  }

  private async handleCompanionAsk(callId: string, rawArguments?: string): Promise<void> {
    const question = this.expandAffirmativeQuestion(parseAskCompanionArguments(rawArguments).question)
    const query = this.onCompanionAsk

    if (question && isLabPlaybackUtterance(question) && !shouldEscalateToCompanion(question)) {
      await this.handleToolCall(playbackToolForUtterance(question), callId, JSON.stringify(playbackArgsForUtterance(question)))
      return
    }

    if (!question || !query) {
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: false, error: 'missing_question' }),
        },
      })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      this.continueAfterNonResumeTool()
      return
    }

    this.pendingEscalation = null
    this.beginHop()
    let latest = ''
    const hopPromise = runEscalatedCompanionTurn({
      question,
      alreadySpeaking: this.alreadySpeakingThisTurn(),
      speakCover: line => this.speakCoverLine(line),
      query: (asked) => query(asked, {
        onDelta: (text) => { latest = text },
        onFirstSpeakable: () => { /* cover line only; full answer spoken once below */ },
      }).then(result => (typeof result === 'string' ? result : result.answer)),
    })
    const hop = await hopPromise
    if (this.closed) {
      this.endHop()
      return
    }
    const full = spokenCompanionAnswer(hop.answer.trim() || latest.trim())
      || hop.answer.trim()
      || latest.trim()
      || 'I could not get a reading of this passage just now.'
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify({ speak_verbatim: true, answer: full }),
      },
    })
    this.applyTurnResult(noteToolCallHandled(this.turn))
    await this.waitUntilQuietForHop()
    this.endHop()
    if (this.closed) return
    if (!this.alreadySpeakingThisTurn() && full) {
      this.sendHopResponse({
        type: 'response.create',
        response: {
          instructions: companionSpeakInstructions(full),
        },
      })
    }
  }

  private waitUntilQuietForHop(): Promise<void> {
    if (!this.turn.audioPlaying) return Promise.resolve()
    return new Promise(resolve => {
      const started = Date.now()
      const tick = () => {
        if (!this.turn.audioPlaying || this.closed || Date.now() - started > 10_000) resolve()
        else window.setTimeout(tick, 50)
      }
      tick()
    })
  }

  /** V2: never attach an answer while the reader is mid-sentence. */
  private waitForV2UserTurnEnd(): Promise<void> {
    if (!this.v2UserSpeaking) return Promise.resolve()
    return new Promise(resolve => {
      const started = Date.now()
      const tick = () => {
        if (!this.v2UserSpeaking || this.closed || Date.now() - started > 10_000) resolve()
        else window.setTimeout(tick, 50)
      }
      tick()
    })
  }

  /**
   * V2 companion hop. No cover line, no narrated waiting. The hop either
   * returns one complete answer, which is then spoken once, or an explicit
   * one-line failure. A newer reader turn supersedes an older hop.
   */
  private async handleCompanionAskV2(callId: string, rawArguments?: string): Promise<void> {
    const question = this.expandAffirmativeQuestion(parseAskCompanionArguments(rawArguments).question)
    const query = this.onCompanionAsk

    if (question && isLabPlaybackUtterance(question) && !shouldEscalateToCompanion(question)) {
      await this.handleToolCall(playbackToolForUtterance(question), callId, JSON.stringify(playbackArgsForUtterance(question)))
      return
    }

    if (!question || !query) {
      this.sendFunctionOutput(callId, { ok: false, error: 'missing_question' })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      this.setActivity('preparing_answer')
      this.sendEvent({ type: 'response.create', response: { instructions: failureSpeakInstructionsV2() } })
      return
    }

    const seq = this.v2HopSeq
    this.pendingEscalation = null
    this.beginHop()
    this.v2HopInFlight = true
    this.setActivity('checking_text')
    let result: CompanionAskResult
    try {
      result = normalizeCompanionResult(await query(question))
    } catch {
      result = { status: 'failed', answer: '', attempts: 1, stopReason: 'error', failureReason: 'request_failed' }
    }
    if (this.v2SessionGone()) {
      this.endHop()
      this.v2HopInFlight = false
      return
    }
    await this.waitForV2UserTurnEnd()
    if (this.v2SessionGone()) {
      this.endHop()
      this.v2HopInFlight = false
      return
    }
    if (seq !== this.v2HopSeq) {
      // The reader moved on while we were checking. The newer turn owns the
      // answer; close this call quietly so the conversation stays well-formed.
      this.endHop()
      this.sendFunctionOutput(callId, { ok: false, superseded: true })
      this.v2HopInFlight = false
      this.applyTurnResult(noteToolCallHandled(this.turn))
      return
    }

    const completed = result.status === 'completed' && result.answer.trim().length > 0
    const answer = completed ? result.answer.trim() : VOICE_V2_FAILURE_LINE
    this.setActivity('preparing_answer')
    this.sendFunctionOutput(callId, { ok: completed, speak_verbatim: true, answer })
    this.applyTurnResult(noteToolCallHandled(this.turn))
    await this.waitUntilQuietForHop()
    this.endHop()
    if (this.v2SessionGone()) {
      this.v2HopInFlight = false
      return
    }
    this.sendHopResponse({
      type: 'response.create',
      response: {
        instructions: completed ? companionSpeakInstructionsV2(answer) : failureSpeakInstructionsV2(),
      },
    })
    this.v2HopInFlight = false
  }

  private async handleToolCall(name: string, callId: string, rawArguments?: string): Promise<void> {
    this.pendingEscalation = null
    const busyWithLookup = (this.hopPending && (isLabPlaybackSkip(name) || name === 'resume_audiobook'))
      || (this.appHopActive && name === ASK_COMPANION_TOOL)
    if (busyWithLookup) {
      // The app is already asking the companion for this turn. A second hop,
      // a move, or a resume in the meantime would answer the reader twice or
      // move them away from the passage the answer is about.
      this.sendFunctionOutput(callId, { ok: false, handled_by: 'app', busy: 'looking_it_up' })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      return
    }
    if (name === ASK_COMPANION_TOOL) {
      if (this.isV2()) await this.handleCompanionAskV2(callId, rawArguments)
      else await this.handleCompanionAsk(callId, rawArguments)
      return
    }

    if (name === 'set_assistant_pace') {
      const honor = this.honorModelResume
      const pace = honor ? parseAssistantPace(rawArguments) : null
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor && pace != null, handled_by: 'app', pace }),
        },
      })
      if (honor && pace) {
        this.assistantPace = pace
        this.sendSessionUpdate()
        this.callbacks.onSetAssistantPace?.(pace)
      }
      this.applyTurnResult(noteToolCallHandled(this.turn))
      this.continueAfterNonResumeTool()
      return
    }

    if (name === 'set_playback_speed') {
      const honor = this.honorModelResume
      const rate = honor ? parseSetPlaybackSpeedArguments(rawArguments) : null
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor && rate != null, handled_by: 'app', rate }),
        },
      })
      if (honor && rate != null) {
        this.audio?.setPlaybackSpeed?.(rate)
        this.applyTurnResult(noteToolCallHandled(this.turn))
        this.continueAfterPlaybackAdjust()
        return
      }
      this.applyTurnResult(noteToolCallHandled(this.turn))
      this.continueAfterNonResumeTool()
      return
    }

    if (isLabPlaybackSkip(name)) {
      const honor = this.honorModelResume
      if (honor && this.lookupConsentPending()) {
        // "Yes!!" to "we could go back and have a look?" must not move the
        // reader; the companion reads the earlier chapter instead.
        await this.redirectToLookup(callId)
        return
      }
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor, handled_by: 'app', skip: name }),
        },
      })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      if (!honor) return
      const settle = (outcome: void | LabPlaybackNavigationOutcome) => {
        if (this.closed) return
        // A move opens the reader at the new place. Audio follows only when
        // this session began from playback; otherwise confirm and keep listening.
        if (this.resumeAfterNavigation(outcome)) this.continueAfterPlaybackAdjust()
        else this.continueAfterNonResumeTool()
      }
      const result = this.audio?.skipPlayback?.(name)
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        void (result as Promise<void | LabPlaybackNavigationOutcome>).then(settle, () => settle(undefined))
        return
      }
      settle(result as void | LabPlaybackNavigationOutcome)
      return
    }

    if (name === 'resume_audiobook') {
      if (this.honorModelResume && this.lookupConsentPending()) {
        await this.redirectToLookup(callId)
        return
      }
      const honor = this.honorModelResume || shouldHonorModelResume(this.lastUserIntent)
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor, handled_by: 'app' }),
        },
      })
      if (honor) {
        if (this.honorModelResume) {
          this.shouldResumeBook = true
          if (!this.anchor) this.anchor = LAB_HONOR_RESUME_ANCHOR
          const alreadySpeaking = this.turn.audioPlaying || this.turn.spokenThisTurn
          if (alreadySpeaking) {
            this.deferredHonorResume = 'waiting_for_end'
            this.applyTurnResult(noteToolCallHandled(this.turn))
            return
          }
          if (this.assistantLineFinished) {
            this.deferredHonorResume = 'waiting_for_end'
            this.applyTurnResult(noteToolCallHandled(this.turn))
            this.commitHonoredResume()
            return
          }
          this.deferredHonorResume = 'waiting_for_start'
          this.applyTurnResult(noteToolCallHandled(this.turn))
          this.armDeferredHonorResume()
          return
        }
        this.turn = INITIAL_VOICE_TURN
        this.dispatch({ type: 'INTENT', intent: 'resume_audiobook' })
        return
      }
      this.applyTurnResult(noteToolCallHandled(this.turn))
      return
    }

    if (name === 'end_voice_session') {
      const honor = shouldHonorModelEnd(this.lastUserIntent)
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor, handled_by: 'app' }),
        },
      })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      if (!honor) return
      if (!this.honorModelResume) {
        this.turn = INITIAL_VOICE_TURN
        this.dispatch({ type: 'INTENT', intent: 'end_voice_session' })
        return
      }
      if (this.deferredHonorEnd === 'waiting_for_end') return
      const alreadySpeaking = this.turn.audioPlaying || this.turn.spokenThisTurn
      if (alreadySpeaking) {
        this.deferredHonorEnd = 'waiting_for_end'
        return
      }
      if (this.assistantLineFinished) {
        this.deferredHonorEnd = 'waiting_for_end'
        this.commitHonoredEnd()
        return
      }
      this.deferredHonorEnd = 'waiting_for_start'
      this.armDeferredHonorEnd()
      return
    }

    if (name === 'hold_voice_session') {
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: true, handled_by: 'app' }),
        },
      })
      this.applyTurnResult(noteToolCallHandled(this.turn))
      this.dispatch({ type: 'INTENT', intent: 'hold_session' })
      this.continueAfterNonResumeTool()
      return
    }

    if (this.callbacks.onApplicationTool) {
      let arguments_: Record<string, unknown> = {}
      if (rawArguments) {
        try {
          const parsed = JSON.parse(rawArguments) as unknown
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            arguments_ = parsed as Record<string, unknown>
          }
        } catch { /* malformed tool arguments are handled by the application tool */ }
      }

      try {
        const result = await this.callbacks.onApplicationTool(name, arguments_, callId)
        if (this.closed) return
        this.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify({ handled_by: 'tinct', ...result.output }),
          },
        })
        this.applyTurnResult(noteToolCallHandled(this.turn))
        this.sendEvent({
          type: 'response.create',
          response: {
            instructions: result.responseInstructions
              || 'Briefly tell the reader the result. Do not mention tools. Do not call another tool and do not resume the book.',
          },
        })
      } catch {
        if (this.closed) return
        this.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify({ ok: false, handled_by: 'tinct', error: 'tool_failed' }),
          },
        })
        this.applyTurnResult(noteToolCallHandled(this.turn))
        this.sendEvent({
          type: 'response.create',
          response: {
            instructions: 'Briefly say you could not do that just now. Do not claim it worked, do not call another tool, and do not resume the book.',
          },
        })
      }
    }
  }

  private ensureResponseAfterUserSpeech(): void {
    if (!this.honorModelResume) return
    this.awaitingModelResponse = true
    this.clearForceResponseTimer()
    this.forceResponseTimer = window.setTimeout(() => {
      if (!this.awaitingModelResponse) return
      this.sendEvent({ type: 'response.create' })
    }, LAB_FORCE_RESPONSE_MS)
  }

  private armLabUserTurnWatch(): void {
    if (!this.honorModelResume) return
    this.clearLabUserTurnWatch()
    if (this.startLabSilenceWatch()) return
    this.stuckListeningTimer = window.setTimeout(() => {
      this.forceEndUserTurn()
    }, LAB_STUCK_LISTENING_MS)
  }

  private startLabSilenceWatch(): boolean {
    if (!this.localStream || typeof AudioContext === 'undefined') return false
    try {
      this.unlockLabAudioContext()
      const ctx = this.labAudioContext
      if (!ctx) return false
      const source = ctx.createMediaStreamSource(this.localStream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      let silentMs = 0
      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        if (rms < 0.035) silentMs += 80
        else silentMs = 0
        if (silentMs >= LAB_STUCK_LISTENING_MS) {
          this.clearLabUserTurnWatch()
          this.forceEndUserTurn()
          return
        }
        this.silenceWatchTimer = window.setTimeout(tick, 80)
      }
      this.silenceWatchTimer = window.setTimeout(tick, 80)
      return true
    } catch {
      return false
    }
  }

  private forceEndUserTurn(): void {
    this.clearLabUserTurnWatch()
    this.dispatch({ type: 'USER_SPEECH_END' })
    this.noteV2UserTurnEnded()
    this.sendEvent({ type: 'input_audio_buffer.commit' })
    if (this.honorModelResume && !this.firstUserTurnCommitted) {
      this.firstUserTurnCommitted = true
      this.sendEvent({ type: 'input_audio_buffer.clear' })
    }
    this.sendEvent({ type: 'response.create' })
    this.awaitingModelResponse = false
  }

  private clearForceResponseTimer(): void {
    if (this.forceResponseTimer != null) window.clearTimeout(this.forceResponseTimer)
    this.forceResponseTimer = null
  }

  private clearLabUserTurnWatch(): void {
    if (this.stuckListeningTimer != null) window.clearTimeout(this.stuckListeningTimer)
    this.stuckListeningTimer = null
    if (this.silenceWatchTimer != null) window.clearTimeout(this.silenceWatchTimer)
    this.silenceWatchTimer = null
    /* Keep the lab AudioContext. Suspend on teardown, do not close. */
  }

  private ignoringFirstResponseBargeIn(): boolean {
    return this.honorModelResume && !this.firstAssistantDone && (
      this.firstUserTurnCommitted || this.assistantIsSpeaking()
    )
  }

  private completeFirstAssistantResponse(): void {
    if (this.firstAssistantDone) return
    this.firstAssistantDone = true
    this.setOutgoingMicEnabled(true)
  }

  unlockLabAudioContext(): void {
    if (typeof AudioContext === 'undefined') return
    if (!this.labAudioContext) {
      try { this.labAudioContext = new AudioContext() } catch { return }
    }
    if (this.labAudioContext.state === 'suspended') {
      void this.labAudioContext.resume()
    }
  }

  private sendLabGreeting(): void {
    if (!this.honorModelResume || this.greetingRequested) return
    this.greetingRequested = true
    this.sendEvent({
      type: 'response.create',
      response: {
        instructions: `Speak this exact line and then stop. Do not add any other word.\n\n${LAB_VOICE_GREETING}\n\nDo not greet. Do not say hello. Do not repeat listening. Do not mention the book. Do not ask a question. Do not call any tools.`,
      },
    })
  }

  private continueAfterNonResumeTool(): void {
    if (!this.honorModelResume) return
    if (this.turn.spokenThisTurn || this.turn.audioPlaying) return
    this.sendEvent({
      type: 'response.create',
      response: {
        instructions: 'Confirm the change in one short sentence. Do not greet. Do not call any tools. Do not resume the book.',
      },
    })
  }

  /**
   * Lab wait rule: after a place or rate change, speak a short confirm,
   * wait for speech_end / output_audio_buffer.stopped, then play.
   */
  private continueAfterPlaybackAdjust(): void {
    if (!this.honorModelResume) return
    this.shouldResumeBook = true
    if (!this.anchor) this.anchor = LAB_HONOR_RESUME_ANCHOR
    const alreadySpeaking = this.turn.audioPlaying || this.turn.spokenThisTurn
    if (alreadySpeaking) {
      this.deferredHonorResume = 'waiting_for_end'
      return
    }
    this.sendEvent({
      type: 'response.create',
      response: {
        instructions: 'Confirm the change in one short sentence. Do not greet. Do not call any tools.',
      },
    })
    this.deferredHonorResume = 'waiting_for_start'
    this.armDeferredHonorResume()
  }

  private assistantTranscriptKind(type: string): 'output' | 'audio' | null {
    if (type.startsWith('response.output_audio_transcript')) return 'output'
    if (type.startsWith('response.audio_transcript')) return 'audio'
    return null
  }

  private acceptAssistantTranscript(type: string): boolean {
    const kind = this.assistantTranscriptKind(type)
    if (!kind) return true
    if (!this.assistantTranscriptFamily) {
      this.assistantTranscriptFamily = kind
      return true
    }
    return this.assistantTranscriptFamily === kind
  }

  private isGreetingOnly(text: string): boolean {
    const normalized = text.replace(/\s+/g, ' ').trim()
    return normalized === LAB_VOICE_GREETING || /^I'm listening\.(?:\s*listening\.)*$/i.test(normalized)
  }

  private shouldEmitAssistantTurn(text: string): boolean {
    const trimmed = text.trim()
    if (!trimmed) return false
    if (this.firstUserTurnCommitted && this.isGreetingOnly(trimmed)) return false
    return true
  }

  private noteAssistantDelta(piece: string): void {
    if (!piece) return
    const current = this.assistantDraft
    const trimmedPiece = piece.replace(/^\s+/, '')
    if (current.endsWith(piece) || current.endsWith(trimmedPiece) || current === piece) return
    const greeting = LAB_VOICE_GREETING
    const normalized = current.replace(/\s+/g, ' ').trim()
    if (normalized === greeting || /^I'm listening\.(?:\s*listening\.)*$/i.test(normalized)) {
      this.assistantDraft = greeting
      if (this.shouldEmitAssistantTurn(greeting)) this.callbacks.onTurn('assistant', greeting)
      return
    }
    if (current && piece.startsWith(current)) this.assistantDraft = piece
    else if (current && current.startsWith(piece)) return
    else this.assistantDraft += piece
    const glued = this.assistantDraft.replace(/\s+/g, ' ').trim()
    if (glued === greeting || /^I'm listening\.(?:\s*listening\.)*$/i.test(glued)) {
      this.assistantDraft = greeting
    }
    this.enforceHoldingLine()
    const text = this.assistantDraft.trim()
    if (text && this.shouldEmitAssistantTurn(text)) this.callbacks.onTurn('assistant', text)
  }

  private keepAssistantDraft(text: string): void {
    const next = text.trim()
    if (!next) return
    const greeting = LAB_VOICE_GREETING
    if (next === greeting || /^I'm listening\.(?:\s*listening\.)*$/i.test(next.replace(/\s+/g, ' '))) {
      this.assistantDraft = greeting
      return
    }
    if (this.assistantDraft.trim() === greeting) return
    if (next.length >= this.assistantDraft.trim().length) this.assistantDraft = next
  }

  private flushAssistantDraft(cancelled: boolean): void {
    const text = this.assistantDraft.trim()
    if (text) this.lastAssistantLine = text
    if (text && this.shouldEmitAssistantTurn(text)) {
      this.callbacks.onTurn('assistant', text, cancelled ? { cancelled: true } : undefined)
    }
  }

  private recoverAfterCancel(): void {
    this.awaitingModelResponse = false
    this.clearForceResponseTimer()
    // Wait for his speech_end to create. Do not answer mid-barge-in.
    if (this.lastUtteranceConfirmed) return
    if (this.firstUserTurnCommitted && this.firstAssistantDone) {
      this.sendEvent({ type: 'response.create' })
    }
  }

  private armMicUnmute(): void {
    this.clearMicUnmuteTimer()
    this.micUnmuteTimer = window.setTimeout(() => {
      this.micUnmuteTimer = null
      this.setOutgoingMicEnabled(true)
    }, LAB_MIC_SETTLE_MS)
  }

  private clearMicUnmuteTimer(): void {
    if (this.micUnmuteTimer != null) window.clearTimeout(this.micUnmuteTimer)
    this.micUnmuteTimer = null
  }

  private setOutgoingMicEnabled(enabled: boolean): void {
    this.localStream?.getAudioTracks?.().forEach(track => { track.enabled = enabled })
    try {
      this.pc?.getSenders().forEach(sender => {
        if (sender.track?.kind === 'audio') sender.track.enabled = enabled
      })
    } catch { /* ignore */ }
  }

  private teardownConnection(): void {
    try { this.dc?.close() } catch { /* ignore */ }
    this.dc = null
    try { this.pc?.getSenders().forEach(sender => sender.track?.stop()) } catch { /* ignore */ }
    try { this.pc?.close() } catch { /* ignore */ }
    this.pc = null
    this.localStream?.getTracks().forEach(track => track.stop())
    this.localStream = null
    if (this.remoteAudio) {
      try { this.remoteAudio.pause() } catch { /* ignore */ }
      this.remoteAudio.srcObject = null
      this.remoteAudio = null
    }
    if (this.labAudioContext) {
      try { void this.labAudioContext.suspend() } catch { /* ignore */ }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch { /* ignore */ }
    }
  }
}
