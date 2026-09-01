import { apiUrl } from '../utils/apiUrl'
import { ASSISTANT_PACE_SPEED, isLabPlaybackSkip, parseAssistantPace, parseSetPlaybackSpeedArguments, type AssistantPace, type LabPlaybackSkip, cleanLabVoiceTranscript } from '../lab/labAsk'
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
import { buildVoiceInstructions, VOICE_TOOLS } from './context'
import { classifyVoiceUtterance, shouldHonorModelResume } from './intents'
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
  /** Lab-only. Production audio engines leave this unset. */
  skipPlayback?: (kind: LabPlaybackSkip) => void | Promise<void>
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
  /** Lab-only. Production AudioStrip leaves this unset. */
  onCompanionAsk?: (question: string, notify?: CompanionAskNotify) => Promise<string>
}

type RealtimeEvent = VoiceRealtimeEvent

function snapshotFrom(
  machine: VoiceMachineSnapshot,
  extra: { resumeInSeconds?: number | null; error?: string | null; userSpeechStarted?: boolean } = {},
): VoiceUiSnapshot {
  return {
    state: machine.state,
    mode: machine.mode,
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

  constructor(callbacks: VoiceSessionCallbacks) {
    this.callbacks = callbacks
  }

  getSnapshot(): VoiceUiSnapshot {
    return snapshotFrom(this.machine, {
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
    this.sessionStartedAt = monotonicNow()
    this.speechStoppedAt = null
    this.latencyTurnNumber = 0
    this.firstAudioRecordedForTurn = false
    this.lastUserIntent = 'none'
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
  }): void {
    this.honorModelResume = input.honorModelResume === true
    this.applicationTools = input.applicationTools ?? []
    this.onCompanionAsk = input.onCompanionAsk
    this.lastUserIntent = input.lastUserIntent ?? 'none'
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
    this.dispatch({ type: 'START', mode: 'conversation' })
  }

  /** Test-only: inject a realtime event. */
  testRealtime(event: VoiceRealtimeEvent): void | Promise<void> {
    return this.handleRealtimeEvent(event)
  }

  private dispatch(event: VoiceEvent): void {
    const previous = this.machine
    const next = reduceVoiceSession(previous, event)
    if (previous === next) {
      return
    }
    this.machine = next
    this.emit()

    if (shouldResumeAudiobookOnEnterReading(previous, next)) {
      void this.leaveVoice({
        speakClose: false,
      })
    }
  }

  private emit(error: string | null = null): void {
    this.callbacks.onSnapshot(snapshotFrom(this.machine, {
      resumeInSeconds: this.currentResumeSeconds(),
      error,
      userSpeechStarted: this.userSpeechStarted,
    }))
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
    this.clearDeferredHonorResumeTimer()
    this.clearLabUserTurnWatch()
    this.clearForceResponseTimer()
    this.clearBargeInTimer()
    this.clearMicUnmuteTimer()
    this.lastUtteranceConfirmed = false
    this.deferredHonorResume = false
    this.awaitingModelResponse = false
    this.speechStoppedAt = null
    this.firstAudioRecordedForTurn = false
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
    this.dc.send(JSON.stringify(payload))
  }

  private applyTurnResult(result: { state: VoiceTurnState; signal: VoiceTurnSignal }): void {
    this.turn = result.state
    if (result.signal === 'speech_start') {
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
    }
    if (result.signal === 'speech_end') {
      this.assistantLineFinished = true
      this.dispatch({ type: 'ASSISTANT_SPEECH_END' })
      if (this.honorModelResume) {
        this.completeFirstAssistantResponse()
        this.armMicUnmute()
      }
      if (this.deferredHonorResume === 'waiting_for_end') this.commitHonoredResume()
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
    if (this.honorModelResume && this.firstAssistantDone && this.assistantIsSpeaking()) {
      this.sendEvent({ type: 'response.cancel' })
      this.sendEvent({ type: 'output_audio_buffer.clear' })
    }
    this.dispatch({ type: 'USER_SPEECH_START' })
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
    this.lastUtteranceConfirmed = false
    if (!this.firstUserTurnCommitted) {
      this.firstUserTurnCommitted = true
      this.sendEvent({ type: 'input_audio_buffer.clear' })
    }
    this.ensureResponseAfterUserSpeech()
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
        this.applyTurnResult(reduceVoiceTurn(this.turn, event))
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
        return
      }
      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta': {
        if (!this.acceptAssistantTranscript(event.type || '')) return
        const piece = event.delta || event.transcript || ''
        if (piece) this.noteAssistantDelta(piece)
        return
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const raw = (event.transcript || event.item?.transcript || '').trim()
        const text = this.honorModelResume ? cleanLabVoiceTranscript(raw) : raw
        if (!text) return
        if (this.shouldDiscardUserTranscript()) return
        this.lastUtteranceConfirmed = false
        this.callbacks.onTurn('user', text)
        const intent = classifyVoiceUtterance(text)
        this.lastUserIntent = intent
        if (intent === 'none') return
        if (this.honorModelResume && intent === 'resume_audiobook') return
        this.dispatch({ type: 'INTENT', intent })
        return
      }
      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done': {
        if (!this.acceptAssistantTranscript(event.type || '')) return
        const text = (event.transcript || event.item?.transcript || '').trim()
        if (text) this.keepAssistantDraft(text)
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
        if (event.error?.message) this.emit(event.error.message)
        return
      default:
        return
    }
  }

  private speakCoverLine(text: string): boolean {
    const line = text.replace(/\s+/g, ' ').trim()
    if (!line || !this.dc || this.dc.readyState !== 'open') return false
    this.sendEvent({
      type: 'response.create',
      response: {
        instructions: `Say this one short line naturally, then stop and wait. Do not answer the question yet. Do not mention tools, models, or waiting.\n\n${line}`,
      },
    })
    return true
  }

  private alreadySpeakingThisTurn(): boolean {
    return this.turn.audioPlaying || this.turn.spokenThisTurn
  }

  private async handleCompanionAsk(callId: string, rawArguments?: string): Promise<void> {
    const question = parseAskCompanionArguments(rawArguments).question
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

    let latest = ''
    const hopPromise = runEscalatedCompanionTurn({
      question,
      alreadySpeaking: this.alreadySpeakingThisTurn(),
      speakCover: line => this.speakCoverLine(line),
      query: (asked) => query(asked, {
        onDelta: (text) => { latest = text },
        onFirstSpeakable: () => { /* cover line only; full answer spoken once below */ },
      }),
    })
    const hop = await hopPromise
    if (this.closed) return
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
    if (this.closed) return
    if (!this.alreadySpeakingThisTurn() && full) {
      this.sendEvent({
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

  private async handleToolCall(name: string, callId: string, rawArguments?: string): Promise<void> {
    if (name === ASK_COMPANION_TOOL) {
      await this.handleCompanionAsk(callId, rawArguments)
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
      const result = this.audio?.skipPlayback?.(name)
      if (result && typeof result.then === 'function') {
        void result.then(() => {
          if (this.closed) return
          this.continueAfterPlaybackAdjust()
        })
        return
      }
      this.continueAfterPlaybackAdjust()
      return
    }

    if (name === 'resume_audiobook') {
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
