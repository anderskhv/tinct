import { apiUrl } from '../utils/apiUrl'
import { buildVoiceInstructions, VOICE_TOOLS } from './context'
import { classifyVoiceUtterance, shouldHonorModelResume } from './intents'
import { INITIAL_VOICE_SNAPSHOT, isVoiceSessionActive, reduceVoiceSession, shouldResumeAudiobookOnEnterReading } from './stateMachine'
import type { AudioPlaybackAnchor, VoiceEvent, VoiceIntent, VoiceMachineSnapshot, VoiceModeState, VoiceReaderContext } from './types'
import { CONVERSATION_IDLE_TIMEOUT_MS, MAX_VOICE_SESSION_MS, RESUME_GRACE_MS, VOICE_CLOSE_LINE } from './types'

export interface VoiceAudioEngine {
  pausePlayback: () => AudioPlaybackAnchor | null
  resumePlayback: (anchor: AudioPlaybackAnchor) => void
}

export interface VoiceSessionCallbacks {
  onSnapshot: (snapshot: VoiceUiSnapshot) => void
  onTurn: (role: 'user' | 'assistant', text: string) => void
  onNeedAuth?: () => void
  onInsufficientBalance?: () => void
  onUsage?: () => void
}

export interface VoiceUiSnapshot {
  state: VoiceModeState
  mode: VoiceMachineSnapshot['mode']
  resumeInSeconds: number | null
  error: string | null
  isActive: boolean
}

export interface StartVoiceSessionInput {
  authToken: string | null
  isAnonymous: boolean
  context: VoiceReaderContext
  audio: VoiceAudioEngine
  wasPlaying: boolean
}

type RealtimeEvent = {
  type?: string
  transcript?: string
  name?: string
  call_id?: string
  item?: { transcript?: string; name?: string; call_id?: string }
}

function snapshotFrom(
  machine: VoiceMachineSnapshot,
  extra: { resumeInSeconds?: number | null; error?: string | null } = {},
): VoiceUiSnapshot {
  return {
    state: machine.state,
    mode: machine.mode,
    resumeInSeconds: extra.resumeInSeconds ?? null,
    error: extra.error ?? null,
    isActive: isVoiceSessionActive(machine.state),
  }
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

export class VoiceSessionController {
  private machine: VoiceMachineSnapshot = INITIAL_VOICE_SNAPSHOT
  private lastUserIntent: VoiceIntent = 'none'
  private callbacks: VoiceSessionCallbacks
  private audio: VoiceAudioEngine | null = null
  private anchor: AudioPlaybackAnchor | null = null
  private shouldResumeBook = false
  private context: VoiceReaderContext | null = null
  private pc: RTCPeerConnection | null = null
  private dc: RTCDataChannel | null = null
  private localStream: MediaStream | null = null
  private remoteAudio: HTMLAudioElement | null = null
  private resumeTimer: number | null = null
  private conversationTimer: number | null = null
  private sessionTimer: number | null = null
  private countdownTimer: number | null = null
  private resumeDeadline = 0
  private assistantSpeaking = false
  private closed = false

  constructor(callbacks: VoiceSessionCallbacks) {
    this.callbacks = callbacks
  }

  getSnapshot(): VoiceUiSnapshot {
    return snapshotFrom(this.machine, {
      resumeInSeconds: this.currentResumeSeconds(),
    })
  }

  async start(input: StartVoiceSessionInput): Promise<void> {
    if (this.machine.state !== 'reading') {
      this.handleMicTap()
      return
    }

    this.closed = false
    this.lastUserIntent = 'none'
    this.assistantSpeaking = false
    this.context = input.context
    this.audio = input.audio
    this.shouldResumeBook = input.wasPlaying
    this.anchor = input.audio.pausePlayback()
    this.emit()

    if (input.isAnonymous || !input.authToken) {
      this.fail('Sign in to ask by voice.', { resumeBook: input.wasPlaying })
      this.callbacks.onNeedAuth?.()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (this.closed) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      this.localStream = stream

      const tokenRes = await fetch(apiUrl('/api/voice-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${input.authToken}`,
        },
      })
      const tokenData = await tokenRes.json().catch(() => ({})) as { value?: string; error?: string }

      if (tokenRes.status === 402) {
        this.fail('Your AI chat balance is empty. Top up to continue.', { resumeBook: input.wasPlaying })
        this.callbacks.onInsufficientBalance?.()
        return
      }
      if (tokenRes.status === 401) {
        this.fail('Sign in to ask by voice.', { resumeBook: input.wasPlaying })
        this.callbacks.onNeedAuth?.()
        return
      }
      if (!tokenRes.ok || !tokenData.value) {
        this.fail(tokenData.error || 'Voice is not available right now.', { resumeBook: input.wasPlaying })
        return
      }

      this.callbacks.onUsage?.()
      await this.connectRealtime(tokenData.value)
      if (this.closed) return
      this.dispatch({ type: 'START' })
      this.armSessionTimeout()
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone access is needed for voice.'
        : "Couldn't start voice. Try again."
      this.fail(message, { resumeBook: input.wasPlaying })
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
    this.dispatch({ type: 'STOP' })
  }

  dispose(): void {
    this.closed = true
    if (this.machine.state !== 'reading' && this.shouldResumeBook && this.anchor && this.audio) {
      this.audio.resumePlayback(this.anchor)
    }
    this.teardownConnection()
    this.clearTimers()
  }

  private dispatch(event: VoiceEvent): void {
    const previous = this.machine
    const next = reduceVoiceSession(previous, event)
    if (previous === next) {
      this.syncTimers(next)
      return
    }
    this.machine = next
    this.syncTimers(next)
    this.emit()

    if (shouldResumeAudiobookOnEnterReading(previous, next)) {
      void this.leaveVoice({
        speakClose: event.type === 'RESUME_WINDOW_ELAPSED' || event.type === 'CONVERSATION_TIMEOUT',
      })
    }
  }

  private emit(error: string | null = null): void {
    this.callbacks.onSnapshot(snapshotFrom(this.machine, {
      resumeInSeconds: this.currentResumeSeconds(),
      error,
    }))
  }

  private currentResumeSeconds(): number | null {
    if (this.machine.state !== 'resume_pending' || !this.resumeDeadline) return null
    return Math.max(0, Math.ceil((this.resumeDeadline - Date.now()) / 1000))
  }

  private fail(error: string, opts: { resumeBook: boolean }): void {
    this.shouldResumeBook = opts.resumeBook
    this.machine = INITIAL_VOICE_SNAPSHOT
    this.teardownConnection()
    this.clearTimers()
    this.emit(error)
    if (opts.resumeBook && this.anchor && this.audio) {
      this.audio.resumePlayback(this.anchor)
    }
  }

  private async leaveVoice(opts: { speakClose: boolean }): Promise<void> {
    const resumeBook = this.shouldResumeBook
    const anchor = this.anchor
    const audio = this.audio
    this.teardownConnection()
    this.clearTimers()
    if (opts.speakClose && resumeBook) {
      await speakCloseLine()
    }
    if (resumeBook && anchor && audio) {
      audio.resumePlayback(anchor)
    }
    this.anchor = null
    this.audio = null
    this.shouldResumeBook = false
  }

  private syncTimers(snapshot: VoiceMachineSnapshot): void {
    this.clearResumeTimer()
    this.clearConversationTimer()

    if (snapshot.state === 'resume_pending') {
      this.resumeDeadline = Date.now() + RESUME_GRACE_MS
      this.resumeTimer = window.setTimeout(() => {
        this.dispatch({ type: 'RESUME_WINDOW_ELAPSED' })
      }, RESUME_GRACE_MS)
      this.countdownTimer = window.setInterval(() => this.emit(), 250)
    }

    if (snapshot.state === 'conversation_idle') {
      this.conversationTimer = window.setTimeout(() => {
        this.dispatch({ type: 'CONVERSATION_TIMEOUT' })
      }, CONVERSATION_IDLE_TIMEOUT_MS)
    }
  }

  private armSessionTimeout(): void {
    this.clearSessionTimer()
    this.sessionTimer = window.setTimeout(() => {
      this.dispatch({ type: 'EXPLICIT_RESUME' })
    }, MAX_VOICE_SESSION_MS)
  }

  private clearResumeTimer(): void {
    if (this.resumeTimer != null) window.clearTimeout(this.resumeTimer)
    if (this.countdownTimer != null) window.clearInterval(this.countdownTimer)
    this.resumeTimer = null
    this.countdownTimer = null
    this.resumeDeadline = 0
  }

  private clearConversationTimer(): void {
    if (this.conversationTimer != null) window.clearTimeout(this.conversationTimer)
    this.conversationTimer = null
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer != null) window.clearTimeout(this.sessionTimer)
    this.sessionTimer = null
  }

  private clearTimers(): void {
    this.clearResumeTimer()
    this.clearConversationTimer()
    this.clearSessionTimer()
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

    this.localStream?.getTracks().forEach(track => pc.addTrack(track, this.localStream!))

    const dc = pc.createDataChannel('oai-events')
    this.dc = dc
    dc.addEventListener('open', () => this.sendSessionUpdate())
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
  }

  private sendSessionUpdate(): void {
    if (!this.dc || this.dc.readyState !== 'open' || !this.context) return
    this.dc.send(JSON.stringify({
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions: buildVoiceInstructions(this.context),
        tools: VOICE_TOOLS,
        tool_choice: 'auto',
        audio: {
          input: {
            transcription: { model: 'gpt-4o-mini-transcribe' },
            turn_detection: {
              type: 'server_vad',
              silence_duration_ms: 700,
              prefix_padding_ms: 300,
            },
          },
        },
      },
    }))
  }

  private sendEvent(payload: Record<string, unknown>): void {
    if (!this.dc || this.dc.readyState !== 'open') return
    this.dc.send(JSON.stringify(payload))
  }

  private handleRealtimeEvent(event: RealtimeEvent): void {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        this.dispatch({ type: 'USER_SPEECH_START' })
        return
      case 'input_audio_buffer.speech_stopped':
        this.dispatch({ type: 'USER_SPEECH_END' })
        return
      case 'output_audio_buffer.started':
      case 'response.output_audio.delta':
      case 'response.audio.delta':
        if (!this.assistantSpeaking) {
          this.assistantSpeaking = true
          this.dispatch({ type: 'ASSISTANT_SPEECH_START' })
        }
        return
      case 'output_audio_buffer.stopped':
        if (this.assistantSpeaking) {
          this.assistantSpeaking = false
          this.dispatch({ type: 'ASSISTANT_SPEECH_END' })
        }
        return
      case 'conversation.item.input_audio_transcription.completed': {
        const text = (event.transcript || event.item?.transcript || '').trim()
        if (!text) return
        this.callbacks.onTurn('user', text)
        const intent = classifyVoiceUtterance(text)
        this.lastUserIntent = intent
        if (intent !== 'none') this.dispatch({ type: 'INTENT', intent })
        return
      }
      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done': {
        const text = (event.transcript || event.item?.transcript || '').trim()
        if (text) this.callbacks.onTurn('assistant', text)
        return
      }
      case 'response.function_call_arguments.done': {
        const name = event.name || event.item?.name
        const callId = event.call_id || event.item?.call_id
        if (!name || !callId) return
        this.handleToolCall(name, callId)
        return
      }
      case 'response.done':
        if (this.assistantSpeaking) {
          this.assistantSpeaking = false
          this.dispatch({ type: 'ASSISTANT_SPEECH_END' })
        }
        return
      default:
        return
    }
  }

  private handleToolCall(name: string, callId: string): void {
    if (name === 'resume_audiobook') {
      const honor = shouldHonorModelResume(this.lastUserIntent)
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ ok: honor, handled_by: 'app' }),
        },
      })
      if (honor) this.dispatch({ type: 'INTENT', intent: 'resume_audiobook' })
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
      this.dispatch({ type: 'INTENT', intent: 'hold_session' })
    }
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch { /* ignore */ }
    }
  }
}
