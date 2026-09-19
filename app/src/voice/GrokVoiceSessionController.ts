import { apiUrl } from '../utils/apiUrl'
import { ASSISTANT_PACE_SPEED, isLabPlaybackSkip, parseAssistantPace, parseSetPlaybackSpeedArguments, type AssistantPace } from '../lab/labAsk'
import { VOICE_TOOLS } from './context'
import { GROK_AUDIO_RATE, GROK_REALTIME_URL, GROK_VOICE, GROK_VOICE_MODEL, buildGrokReaderReference, buildGrokVoiceInstructions } from './grokConfig'
import { IDLE_VOICE_SNAPSHOT, type StartVoiceSessionInput, type VoiceSessionCallbacks, type VoiceUiSnapshot } from './session'
import { LAB_AUDIO_CONSTRAINTS, type AudioPlaybackAnchor, type VoiceReaderContext } from './types'
import { isBenignRealtimeError } from './v2/voiceV2'

export type GrokEvent = {
  type: string
  delta?: string
  transcript?: string
  name?: string
  call_id?: string
  arguments?: string
  response_id?: string
  item_id?: string
  error?: { message?: string; code?: string }
  response?: { id?: string; status?: string }
}

type ToolCall = { name: string; callId: string; arguments: string }

/** Minimal transport seam so the protocol can be exercised without a socket. */
export interface GrokSocket {
  readyState: number
  send: (data: string) => void
  close: () => void
}

/** Audio chunks are sent every ~100 ms; the worklet yields 128-frame blocks. */
const SEND_INTERVAL_MS = 100
/** Rejoin the output stream a little ahead of now so scheduling stays gap-free. */
const PLAYBACK_LEAD_SECONDS = 0.05
/** Reader movement is common; one prompt refresh per short window is enough. */
const CONTEXT_UPDATE_DEBOUNCE_MS = 400
const CONNECT_TIMEOUT_MS = 15_000

const CAPTURE_WORKLET = `class TinctPcmCapture extends AudioWorkletProcessor {
  process(inputs) { const channel = inputs[0] && inputs[0][0]; if (channel) this.port.postMessage(channel.slice(0)); return true }
}
registerProcessor('tinct-pcm-capture', TinctPcmCapture)`

function idle(): VoiceUiSnapshot {
  return { ...IDLE_VOICE_SNAPSHOT }
}

function toolName(tool: unknown): string | null {
  return tool && typeof tool === 'object' && typeof (tool as { name?: unknown }).name === 'string' ? (tool as { name: string }).name : null
}

/** Linear resample between the device rate and the provider rate. */
export function resampleFloat(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input
  const length = Math.max(1, Math.round(input.length * toRate / fromRate))
  const output = new Float32Array(length)
  const step = fromRate / toRate
  for (let i = 0; i < length; i++) {
    const position = i * step
    const index = Math.floor(position)
    const next = Math.min(input.length - 1, index + 1)
    const fraction = position - index
    output[i] = input[index] * (1 - fraction) + input[next] * fraction
  }
  return output
}

export function floatToPcm16Base64(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2)
  const view = new DataView(bytes.buffer)
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

export function pcm16Base64ToFloat(base64: string): Float32Array {
  const binary = atob(base64)
  const samples = new Float32Array(Math.floor(binary.length / 2))
  for (let i = 0; i < samples.length; i++) {
    const value = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8)
    samples[i] = (value >= 0x8000 ? value - 0x10000 : value) / 0x8000
  }
  return samples
}

/**
 * Grok native speech-to-speech over one WebSocket. The browser streams PCM16
 * from the microphone, the model listens, reasons and speaks itself, and
 * spoken audio is scheduled straight into an AudioContext. No transcription
 * hop, no second model, no separate TTS.
 */
export class GrokVoiceSessionController {
  private ui = idle()
  private input: StartVoiceSessionInput | null = null
  private socket: GrokSocket | null = null
  private stream: MediaStream | null = null
  private context: AudioContext | null = null
  private captureNode: AudioWorkletNode | ScriptProcessorNode | null = null
  private captureSource: MediaStreamAudioSourceNode | null = null
  private outputGain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private pendingCapture: Float32Array[] = []
  private pendingCaptureLength = 0
  private sendTimer: ReturnType<typeof setInterval> | null = null
  private sources = new Set<AudioBufferSourceNode>()
  private playhead = 0
  private generation = 0
  private ready = false
  private stopping = false
  private anchor: AudioPlaybackAnchor | null = null
  private instructions = ''
  private contextTimer: ReturnType<typeof setTimeout> | null = null
  private response: { id: string; text: string; stale: boolean; audioStarted: boolean; calls: ToolCall[]; done: boolean } | null = null
  /** A finished answer still being played out. Recorded when it ends or is interrupted. */
  private spoken: { text: string } | null = null
  private handledCalls = new Set<string>()
  private toolQueue: Promise<void> = Promise.resolve()
  private speechStoppedAt = 0
  private turnNumber = 0
  private startedAt = 0

  constructor(private callbacks: VoiceSessionCallbacks) {}

  getSnapshot(): VoiceUiSnapshot { return this.ui }

  private emit(update: Partial<VoiceUiSnapshot>) {
    this.ui = { ...this.ui, ...update }
    this.callbacks.onSnapshot(this.ui)
  }

  private send(event: Record<string, unknown>) {
    if (this.socket && this.socket.readyState === 1) this.socket.send(JSON.stringify(event))
  }

  /** The prompt for the current reader position. Reference text stays apart from instructions. */
  private buildInstructions(context: VoiceReaderContext, input = this.input): string {
    if (!input) return ''
    if (input.instructions) return input.instructions
    return buildGrokVoiceInstructions(input.reference ?? buildGrokReaderReference(context))
  }

  private sessionTools(input: StartVoiceSessionInput): unknown[] {
    const functions = [...(input.tools ?? [...VOICE_TOOLS, ...(input.applicationTools ?? [])])]
    return input.enableSearch === false ? functions : [...functions, { type: 'web_search' }]
  }

  unlockLabAudioContext(): void {
    if (typeof AudioContext === 'undefined') return
    if (!this.context) {
      try { this.context = new AudioContext() } catch { return }
    }
    if (this.context.state === 'suspended') void this.context.resume().catch(() => {})
  }

  getAssistantLevel(): number | null {
    if (!this.analyser) return null
    const data = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(data)
    return Math.sqrt(data.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / data.length)
  }

  setMicMuted(muted: boolean): void {
    this.stream?.getAudioTracks().forEach(track => { track.enabled = !muted })
    this.emit({ micMuted: muted })
  }

  setAssistantPace(pace: AssistantPace): void {
    this.send({ type: 'session.update', session: { audio: { output: { speed: ASSISTANT_PACE_SPEED[pace] } } } })
  }

  /** Reader movement refreshes the prompt in place; the conversation is kept. */
  updateContext(context: VoiceReaderContext, reference?: string, instructions?: string): void {
    if (!this.input) return
    if (this.input.context.bookId !== context.bookId) { this.stop(); return }
    this.input.context = context
    if (reference !== undefined) this.input.reference = reference
    if (instructions !== undefined) this.input.instructions = instructions
    if (!this.ready) return
    if (this.contextTimer) clearTimeout(this.contextTimer)
    this.contextTimer = setTimeout(() => {
      this.contextTimer = null
      this.publishInstructions()
    }, CONTEXT_UPDATE_DEBOUNCE_MS)
  }

  private publishInstructions(): void {
    if (!this.input || !this.ready) return
    const next = this.buildInstructions(this.input.context)
    if (next === this.instructions) return
    this.instructions = next
    this.send({ type: 'session.update', session: { instructions: next } })
  }

  private fail(message: string) {
    this.stop()
    this.emit({ error: message, connection: 'disconnected' })
  }

  async start(input: StartVoiceSessionInput): Promise<void> {
    if (this.ui.isActive) return
    this.stop()
    const generation = this.generation
    this.startedAt = Date.now()
    this.input = { ...input }
    this.anchor = input.audio.pausePlayback()?.anchor ?? null
    this.emit({ isActive: true, state: 'reading', activity: 'connecting', connection: 'connecting', mode: input.mode ?? 'conversation', error: null })
    if (!input.labGuest && !input.authToken) {
      this.fail('Sign in to ask by voice.')
      this.callbacks.onNeedAuth?.()
      return
    }
    const current = () => generation === this.generation
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Couldn't start voice. Microphone access is unavailable. Type a question instead.")
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { ...LAB_AUDIO_CONSTRAINTS } })
      if (!current()) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      const response = await fetch(apiUrl(input.labGuest && !input.authToken ? '/api/lab-voice-session' : '/api/voice-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(input.authToken ? { Authorization: `Bearer ${input.authToken}` } : {}) },
        body: '{}',
      })
      const data = await response.json().catch(() => ({})) as { value?: string; model?: string; error?: string }
      if (!current()) return
      if (!response.ok || !data.value) {
        if (response.status === 401) this.callbacks.onNeedAuth?.()
        if (response.status === 402) this.callbacks.onInsufficientBalance?.()
        throw new Error(data.error || 'Voice could not start. Please try again.')
      }
      const socket = this.openSocket(data.value, data.model || GROK_VOICE_MODEL)
      this.socket = socket
      await this.awaitReady(generation)
      if (!current()) return
      this.callbacks.onUsage?.()
      this.callbacks.onLatency?.({ kind: 'session_setup', at: Date.now(), sessionSetupMs: Date.now() - this.startedAt, model: GROK_VOICE_MODEL })
    } catch (error) {
      if (current()) this.fail(error instanceof Error ? error.message : 'Could not start voice.')
    }
  }

  private openSocket(secret: string, model: string): WebSocket {
    const generation = this.generation
    const socket = new WebSocket(`${GROK_REALTIME_URL}?model=${encodeURIComponent(model)}`, [`xai-client-secret.${secret}`])
    socket.addEventListener('message', event => {
      if (generation !== this.generation) return
      try { this.handleEvent(JSON.parse(String(event.data)) as GrokEvent) } catch { /* Ignore malformed frames. */ }
    })
    socket.addEventListener('close', () => {
      if (generation === this.generation && this.ui.isActive && !this.stopping) this.fail('Voice connection lost. Reconnect to continue.')
    })
    socket.addEventListener('error', () => {
      if (generation === this.generation && this.ui.isActive && !this.stopping) this.fail('Voice connection lost. Reconnect to continue.')
    })
    return socket
  }

  private awaitReady(generation: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const started = Date.now()
      const poll = () => {
        if (generation !== this.generation) { resolve(); return }
        if (this.ready) { resolve(); return }
        if (this.ui.error) { reject(new Error(this.ui.error)); return }
        if (Date.now() - started > CONNECT_TIMEOUT_MS) { reject(new Error('Voice did not connect. Please try again.')); return }
        setTimeout(poll, 50)
      }
      poll()
    })
  }

  /** Exposed for deterministic protocol regression tests. */
  handleEvent(event: GrokEvent): void {
    const input = this.input
    if (!input) return
    switch (event.type) {
      case 'session.created': {
        this.instructions = this.buildInstructions(input.context)
        this.send({
          type: 'session.update',
          session: {
            voice: GROK_VOICE,
            instructions: this.instructions,
            turn_detection: { type: 'server_vad' },
            tools: this.sessionTools(input),
            audio: {
              input: { format: { type: 'audio/pcm', rate: GROK_AUDIO_RATE } },
              output: { format: { type: 'audio/pcm', rate: GROK_AUDIO_RATE }, ...(input.assistantPace ? { speed: ASSISTANT_PACE_SPEED[input.assistantPace] } : {}) },
            },
          },
        })
        return
      }
      case 'session.updated': {
        if (this.ready) return
        this.ready = true
        this.startCapture()
        this.emit({ connection: 'connected', activity: 'listening', state: 'listening' })
        if (input.greeting) {
          this.send({ type: 'response.create', response: { instructions: `The reader opened this conversation to prepare for the book. Say this opening line now, once: ${JSON.stringify(input.greeting)} Then wait for the reader. Keep the introduction spoiler-free unless asked otherwise.` } })
        }
        return
      }
      case 'input_audio_buffer.speech_started': {
        if (!this.ui.userSpeechStarted && this.callbacks.onBeforeUserTurn?.() === false) { this.stop(); return }
        this.turnNumber++
        this.interruptAssistant()
        this.emit({ userSpeechStarted: true, activity: 'listening', state: 'listening' })
        return
      }
      case 'input_audio_buffer.speech_stopped': {
        this.speechStoppedAt = Date.now()
        this.emit({ activity: 'preparing_answer', state: 'answering' })
        return
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const text = (event.transcript || '').replace(/�/g, '').trim()
        if (/[\p{L}\p{N}]/u.test(text)) this.callbacks.onTurn('user', text)
        return
      }
      case 'response.created': {
        this.response = { id: event.response?.id || '', text: '', stale: false, audioStarted: false, calls: [], done: false }
        if (this.ui.activity === 'listening') this.emit({ activity: 'preparing_answer', state: 'answering' })
        return
      }
      case 'response.output_audio.delta':
      case 'response.audio.delta': {
        const response = this.response
        if (!response || response.stale || !event.delta) return
        if (!response.audioStarted) {
          response.audioStarted = true
          if (this.speechStoppedAt) {
            this.callbacks.onLatency?.({ kind: 'turn', at: Date.now(), turnNumber: this.turnNumber, speechStoppedToFirstAudioMs: Date.now() - this.speechStoppedAt, model: GROK_VOICE_MODEL })
            this.speechStoppedAt = 0
          }
        }
        this.schedulePlayback(event.delta)
        return
      }
      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta':
      case 'response.text.delta': {
        if (this.response && !this.response.stale) this.response.text += event.delta || ''
        return
      }
      case 'response.function_call_arguments.done': {
        if (!event.name || !event.call_id) return
        const known = [...(input.tools ?? [...VOICE_TOOLS, ...(input.applicationTools ?? [])])].some(tool => toolName(tool) === event.name)
        // Provider-side tools such as web_search finish on the server; only application functions run here.
        if (!known && event.name !== 'end_voice_session' && event.name !== 'resume_audiobook' && event.name !== 'hold_voice_session') return
        this.response?.calls.push({ name: event.name, callId: event.call_id, arguments: event.arguments || '{}' })
        return
      }
      case 'response.done': {
        const response = this.response
        if (!response) return
        response.done = true
        const cancelled = event.response?.status === 'cancelled' || response.stale
        const text = response.text.replace(/�/g, '').trim()
        const spoken = /[\p{L}\p{N}]/u.test(text)
        if (spoken && (cancelled || this.sources.size === 0)) this.callbacks.onTurn('assistant', text, cancelled ? { cancelled: true } : undefined)
        else if (spoken) this.spoken = { text }
        if (!cancelled && response.calls.length) this.runToolCalls(response.calls)
        this.response = null
        if (this.sources.size === 0) this.emit({ activity: 'listening', state: 'listening' })
        return
      }
      case 'error': {
        if (isBenignRealtimeError(event.error?.message)) return
        this.emit({ error: event.error?.message || 'Voice could not complete that request.' })
        return
      }
      default:
        return
    }
  }

  /** The reader spoke over the assistant: stop what is playing and drop the rest of that answer. */
  private interruptAssistant(): void {
    const response = this.response
    if (response && !response.done) {
      response.stale = true
      this.send({ type: 'response.cancel' })
    } else if (response && this.sources.size) {
      response.stale = true
    }
    if (this.sources.size) {
      this.stopPlayback()
      if (this.spoken) {
        // The answer had finished generating but the reader cut it off: keep what was said as interrupted.
        this.callbacks.onTurn('assistant', this.spoken.text, { cancelled: true })
        this.spoken = null
      }
      if (response) {
        const text = response.text.replace(/�/g, '').trim()
        if (/[\p{L}\p{N}]/u.test(text)) this.callbacks.onTurn('assistant', text, { cancelled: true })
        response.text = ''
        if (response.done) this.response = null
      }
    }
  }

  private runToolCalls(calls: ToolCall[]): void {
    const generation = this.generation
    // "Take me back to the book" often arrives with a goodbye too. The resume carries the
    // reader's place, so it must run before anything that ends the session.
    const ordered = [...calls].sort((a, b) => Number(b.name === 'resume_audiobook') - Number(a.name === 'resume_audiobook'))
    this.toolQueue = this.toolQueue.then(async () => {
      let continued = false
      for (const call of ordered) {
        if (generation !== this.generation) return
        if (this.handledCalls.has(call.callId)) continue
        this.handledCalls.add(call.callId)
        let result: { output: unknown; responseInstructions?: string }
        try { result = await this.runTool(call) } catch { result = { output: { ok: false, error: 'The action could not be completed.' } } }
        if (generation !== this.generation) return
        if (result.output === undefined) continue
        this.send({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: call.callId, output: JSON.stringify(result.output) } })
        if (!continued) {
          continued = true
          this.send({ type: 'response.create', ...(result.responseInstructions ? { response: { instructions: result.responseInstructions } } : {}) })
        }
      }
    }).catch(() => { /* Individual tool failures return a result above. */ })
  }

  private async runTool(call: ToolCall): Promise<{ output: unknown; responseInstructions?: string }> {
    const input = this.input
    if (!input) return { output: { ok: false, error: 'Session ended' } }
    let args: Record<string, unknown> = {}
    try { args = JSON.parse(call.arguments || '{}') as Record<string, unknown> } catch { args = {} }
    // Session-ending controls return nothing: there is no session left to continue.
    if (call.name === 'resume_audiobook') { this.explicitResume(typeof args.play_audio === 'boolean' ? args.play_audio : undefined); return { output: undefined } }
    if (call.name === 'end_voice_session') { this.stop(); this.callbacks.onEndRequested?.(); return { output: undefined } }
    if (call.name === 'hold_voice_session') return { output: { ok: true }, responseInstructions: 'Stay in the conversation and listen. Do not resume the book.' }
    if (call.name === 'set_playback_speed') {
      const rate = parseSetPlaybackSpeedArguments(call.arguments)
      if (rate == null || !input.audio.setPlaybackSpeed) return { output: { ok: false } }
      input.audio.setPlaybackSpeed(rate)
      return { output: { ok: true, rate }, responseInstructions: 'Confirm the new audiobook speed in one short sentence.' }
    }
    if (call.name === 'set_assistant_pace') {
      const pace = parseAssistantPace(call.arguments)
      if (!pace) return { output: { ok: false } }
      this.setAssistantPace(pace)
      this.callbacks.onSetAssistantPace?.(pace)
      return { output: { ok: true, pace } }
    }
    if (isLabPlaybackSkip(call.name)) {
      if (!input.audio.skipPlayback) return { output: { ok: false } }
      const outcome = await input.audio.skipPlayback(call.name)
      if (this.input === input && outcome?.resumePlayback) { this.explicitResume(); return { output: undefined } }
      return { output: { ok: true, outcome }, responseInstructions: 'Confirm the move in one short sentence and keep listening.' }
    }
    const allowed = [...(input.tools ?? input.applicationTools ?? [])].some(tool => toolName(tool) === call.name)
    if (!allowed || !this.callbacks.onApplicationTool) return { output: { ok: false, error: 'Unknown control' } }
    const result = await this.callbacks.onApplicationTool(call.name, args, call.callId)
    return { output: result.output, responseInstructions: result.responseInstructions }
  }

  explicitResume(playAudio?: boolean): void {
    const input = this.input
    const context = input?.context
    const anchor = this.anchor ?? (context ? {
      bookId: context.bookId ?? '',
      editionKey: context.editionKey ?? '',
      chapterNumber: context.chapterNumber ?? 1,
      paragraphIndex: context.paragraphIndex ?? 0,
      paragraphNumber: (context.paragraphIndex ?? 0) + 1,
      offsetSeconds: 0,
    } : null)
    this.stop()
    if (input && anchor) input.audio.resumePlayback(anchor, playAudio)
  }

  // ----- microphone capture -----

  private startCapture(): void {
    const stream = this.stream
    if (!stream || typeof AudioContext === 'undefined') return
    this.unlockLabAudioContext()
    const context = this.context
    if (!context) return
    try {
      const source = context.createMediaStreamSource(stream)
      this.captureSource = source
      const rate = context.sampleRate
      const onChunk = (chunk: Float32Array) => {
        if (this.ui.micMuted) return
        this.pendingCapture.push(resampleFloat(chunk, rate, GROK_AUDIO_RATE))
        this.pendingCaptureLength += this.pendingCapture[this.pendingCapture.length - 1].length
      }
      const useWorklet = typeof AudioWorkletNode !== 'undefined' && context.audioWorklet && typeof Blob !== 'undefined' && typeof URL !== 'undefined'
      if (useWorklet) {
        const generation = this.generation
        const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }))
        void context.audioWorklet.addModule(url).then(() => {
          URL.revokeObjectURL(url)
          if (generation !== this.generation || !this.captureSource) return
          const node = new AudioWorkletNode(context, 'tinct-pcm-capture', { numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1 })
          node.port.onmessage = message => onChunk(message.data as Float32Array)
          source.connect(node)
          this.captureNode = node
        }).catch(() => { this.startScriptCapture(context, source, onChunk) })
      } else {
        this.startScriptCapture(context, source, onChunk)
      }
      this.sendTimer = setInterval(() => this.flushCapture(), SEND_INTERVAL_MS)
    } catch {
      /* A browser without WebAudio capture still keeps the session; it simply hears nothing. */
    }
  }

  private startScriptCapture(context: AudioContext, source: MediaStreamAudioSourceNode, onChunk: (chunk: Float32Array) => void): void {
    if (typeof context.createScriptProcessor !== 'function') return
    const node = context.createScriptProcessor(2048, 1, 1)
    node.onaudioprocess = event => onChunk(event.inputBuffer.getChannelData(0).slice(0))
    source.connect(node)
    const silence = context.createGain()
    silence.gain.value = 0
    node.connect(silence)
    silence.connect(context.destination)
    this.captureNode = node
  }

  private flushCapture(): void {
    if (!this.pendingCaptureLength) return
    const merged = new Float32Array(this.pendingCaptureLength)
    let offset = 0
    for (const chunk of this.pendingCapture) { merged.set(chunk, offset); offset += chunk.length }
    this.pendingCapture = []
    this.pendingCaptureLength = 0
    this.send({ type: 'input_audio_buffer.append', audio: floatToPcm16Base64(merged) })
  }

  // ----- assistant playback -----

  private schedulePlayback(base64: string): void {
    const context = this.context
    if (!context) return
    const samples = pcm16Base64ToFloat(base64)
    if (!samples.length) return
    if (!this.outputGain) {
      this.outputGain = context.createGain()
      this.analyser = context.createAnalyser()
      this.outputGain.connect(this.analyser)
      this.analyser.connect(context.destination)
    }
    const buffer = context.createBuffer(1, samples.length, GROK_AUDIO_RATE)
    buffer.getChannelData(0).set(samples)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(this.outputGain)
    const startAt = Math.max(this.playhead, context.currentTime + PLAYBACK_LEAD_SECONDS)
    source.start(startAt)
    this.playhead = startAt + buffer.duration
    this.sources.add(source)
    source.onended = () => this.onSourceEnded(source)
    if (this.ui.activity !== 'speaking') this.emit({ activity: 'speaking', state: 'answering' })
  }

  /** The last scheduled buffer finished: the answer has actually been heard. */
  private onSourceEnded(source: AudioBufferSourceNode): void {
    this.sources.delete(source)
    if (this.sources.size !== 0 || !this.ui.isActive || (this.response && !this.response.done)) return
    if (this.spoken) { this.callbacks.onTurn('assistant', this.spoken.text); this.spoken = null }
    if (this.ui.activity !== 'listening') this.emit({ activity: 'listening', state: 'listening' })
  }

  private stopPlayback(): void {
    for (const source of this.sources) {
      source.onended = null
      try { source.stop() } catch { /* already ended */ }
    }
    this.sources.clear()
    this.playhead = 0
    if (this.ui.isActive && this.ui.activity === 'speaking') this.emit({ activity: 'listening', state: 'listening' })
  }

  stop(): void {
    this.stopping = true
    this.generation++
    this.ready = false
    if (this.contextTimer) { clearTimeout(this.contextTimer); this.contextTimer = null }
    if (this.sendTimer) { clearInterval(this.sendTimer); this.sendTimer = null }
    this.pendingCapture = []
    this.pendingCaptureLength = 0
    this.stopPlayback()
    if (this.spoken) { this.callbacks.onTurn('assistant', this.spoken.text, { cancelled: true }); this.spoken = null }
    const response = this.response
    if (response) {
      const text = response.text.replace(/�/g, '').trim()
      if (/[\p{L}\p{N}]/u.test(text)) this.callbacks.onTurn('assistant', text, { cancelled: !response.done })
    }
    this.response = null
    try { this.captureNode?.disconnect() } catch { /* ignore */ }
    try { this.captureSource?.disconnect() } catch { /* ignore */ }
    this.captureNode = null
    this.captureSource = null
    this.stream?.getTracks().forEach(track => track.stop())
    this.stream = null
    try { this.socket?.close() } catch { /* ignore */ }
    this.socket = null
    this.instructions = ''
    this.handledCalls.clear()
    this.turnNumber = 0
    this.speechStoppedAt = 0
    this.input = null
    this.anchor = null
    this.stopping = false
    this.ui = idle()
    this.callbacks.onSnapshot(this.ui)
  }

  dispose(): void {
    this.stop()
    try { void this.context?.close() } catch { /* ignore */ }
    this.context = null
    this.outputGain = null
    this.analyser = null
  }
}
