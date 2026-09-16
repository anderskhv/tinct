import { apiUrl } from '../utils/apiUrl'
import { isLabPlaybackSkip, parseAssistantPace, parseSetPlaybackSpeedArguments, type AssistantPace } from '../lab/labAsk'
import { buildVoiceInstructions, VOICE_TOOLS } from './context'
import { LAB_AUDIO_CONSTRAINTS, type AudioPlaybackAnchor, type VoiceReaderContext } from './types'
import { VOICE_LIVE_MODEL } from './liveConfig'
import type { StartVoiceSessionInput, VoiceSessionCallbacks, VoiceUiSnapshot } from './VoiceSessionController'

type LiveEvent = { type: string; delta?: string; error?: { message?: string }; delegation_id?: string; event?: LiveEvent; response?: { id?: string }; item?: { type?: string; name?: string; call_id?: string; arguments?: string } }
type ToolCall = { name: string; callId: string; arguments: string }
const idle = (): VoiceUiSnapshot => ({ state: 'reading', mode: 'conversation', activity: 'idle', connection: 'idle', micMuted: false, resumeInSeconds: null, error: null, isActive: false, userSpeechStarted: false })

/** Live's full-duplex transport. Realtime's manual turn triggers never enter this path. */
export class LiveVoiceSessionController {
  private ui = idle()
  private input: StartVoiceSessionInput | null = null
  private pc: RTCPeerConnection | null = null
  private dc: RTCDataChannel | null = null
  private stream: MediaStream | null = null
  private audio: HTMLAudioElement | null = null
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private generation = 0
  private ready = false
  private readerLocation = ''
  private anchor: AudioPlaybackAnchor | null = null
  private captions = { user: '', assistant: '' }
  private responses = new Map<string, { id: string; calls: ToolCall[] }>()
  private handled = new Set<string>()
  private toolQueue: Promise<void> = Promise.resolve()
  constructor(private callbacks: VoiceSessionCallbacks) {}
  getSnapshot() { return this.ui }
  private emit(update: Partial<VoiceUiSnapshot>) { this.ui = { ...this.ui, ...update }; this.callbacks.onSnapshot(this.ui) }
  private send(event: Record<string, unknown>) {
    if (this.ready && this.dc?.readyState === 'open') this.dc.send(JSON.stringify({ event_id: crypto.randomUUID(), ...event }))
  }
  unlockLabAudioContext() {
    if (!this.context && typeof AudioContext !== 'undefined') this.context = new AudioContext()
    void this.context?.resume().catch(() => {})
  }
  getAssistantLevel() {
    if (!this.analyser) return null
    const data = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(data)
    return Math.sqrt(data.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / data.length)
  }
  setMicMuted(muted: boolean) { this.stream?.getAudioTracks().forEach(track => { track.enabled = !muted }); this.emit({ micMuted: muted }) }
  setAssistantPace(pace: AssistantPace) { this.send({ type: 'session.instructions.append', delegation_id: null, content: `The reader requests a ${pace} speaking pace. Apply it to subsequent speech.` }) }
  updateContext(context: VoiceReaderContext, instructions?: string) {
    if (!this.input) return
    if (this.input.context.bookId !== context.bookId) { this.stop(); return }
    if (JSON.stringify(this.input.context) === JSON.stringify(context) && (!instructions || instructions === this.input.instructions)) return
    this.input.context = context
    if (instructions) this.input.instructions = instructions
    // Frontend context is location only. In the reader visibleText carries the
    // entire backend prompt; truncating its JSON can leak conflicting role and
    // tool instructions into Live after the first turn.
    const location = JSON.stringify({ book: context.bookTitle, chapter: context.chapterLabel, chapterNumber: context.chapterNumber, paragraphIndex: context.paragraphIndex, edition: context.editionLabel })
    if (location !== this.readerLocation) {
      this.readerLocation = location
      this.send({ type: 'session.thinking.append', delegation_id: null, content: `Reader location (reference data): ${location}` })
    }
    this.send({ type: 'session.update', session: { delegation: { type: 'responses', responses: { instructions: this.input.instructions || buildVoiceInstructions(context) } } } })
  }
  private flush(role: 'user' | 'assistant') {
    const text = this.captions[role].replace(/\uFFFD/g, '').trim()
    this.captions[role] = ''
    if (/[\p{L}\p{N}]/u.test(text)) this.callbacks.onTurn(role, text)
  }
  private caption(role: 'user' | 'assistant', delta: string) {
    this.captions[role] += delta
    // A pause is not the end of a question. Keep its fragments together until
    // the backend starts work, or the session ends. Output pauses may be long
    // too: flush on the reader's next utterance, not on every breath.
    if (role === 'user') this.flush('assistant')
    if (role === 'user') this.emit({ userSpeechStarted: true })
  }
  private fail(message: string) { this.stop(); this.emit({ error: message, connection: 'disconnected' }) }
  async start(input: StartVoiceSessionInput) {
    if (this.ui.isActive) return
    this.stop()
    const generation = this.generation
    const startedAt = Date.now()
    this.input = input
    this.anchor = input.audio.pausePlayback()?.anchor ?? null
    this.emit({ isActive: true, state: 'reading', activity: 'connecting', connection: 'connecting', mode: input.mode ?? 'conversation' })
    if (!input.labGuest && !input.authToken) { this.fail('Sign in to ask by voice.'); this.callbacks.onNeedAuth?.(); return }
    const current = () => generation === this.generation
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Couldn't start voice. Microphone access is unavailable. Type a question instead.")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { ...LAB_AUDIO_CONSTRAINTS } })
      if (!current()) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      const pc = new RTCPeerConnection()
      this.pc = pc
      const audio = document.createElement('audio')
      audio.autoplay = true
      audio.setAttribute('playsinline', 'true')
      this.audio = audio
      pc.ontrack = event => {
        if (!current()) return
        audio.srcObject = event.streams[0]
        void audio.play().catch(() => { if (current()) this.emit({ error: 'Tap Talk again to enable voice playback.' }) })
        if (this.context) {
          this.analyser = this.context.createAnalyser()
          this.context.createMediaStreamSource(event.streams[0]).connect(this.analyser)
        }
      }
      pc.onconnectionstatechange = () => {
        if (current() && (pc.connectionState === 'failed' || pc.connectionState === 'disconnected')) this.fail('Voice connection lost. Reconnect to continue.')
      }
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      const dc = pc.createDataChannel('oai-events')
      this.dc = dc
      let started: () => void = () => {}
      const startedPromise = new Promise<void>(resolve => { started = resolve })
      dc.addEventListener('message', event => {
        if (!current()) return
        try {
          const data = JSON.parse(String(event.data)) as LiveEvent
          if (data.type === 'session.started') started()
          this.handleEvent(data)
        } catch { /* Ignore malformed event frames. */ }
      })
      dc.addEventListener('close', () => { if (current() && this.ui.isActive) this.fail('Voice connection lost. Reconnect to continue.') })
      await pc.setLocalDescription(await pc.createOffer())
      if (pc.iceGatheringState !== 'complete') {
        await new Promise<void>((resolve, reject) => {
          const finish = () => { clearTimeout(timer); pc.removeEventListener('icegatheringstatechange', change) }
          const change = () => { if (pc.iceGatheringState === 'complete') { finish(); resolve() } }
          const timer = setTimeout(() => { finish(); reject(new Error('Could not prepare voice connection.')) }, 10_000)
          pc.addEventListener('icegatheringstatechange', change)
          change()
        })
      }
      if (!current()) return
      const res = await fetch(apiUrl(input.labGuest && !input.authToken ? '/api/lab-voice-session' : '/api/voice-session'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(input.authToken ? { Authorization: `Bearer ${input.authToken}` } : {}) },
        body: JSON.stringify({ protocol: 'live', sdp: pc.localDescription?.sdp, instructions: input.instructions || buildVoiceInstructions(input.context), tools: input.tools ?? [...VOICE_TOOLS, ...(input.applicationTools ?? [])] }),
      })
      const data = await res.json() as { transport?: { sdp?: string }; error?: string }
      if (!current()) return
      if (!res.ok || !data.transport?.sdp) {
        if (res.status === 401) this.callbacks.onNeedAuth?.()
        if (res.status === 402) this.callbacks.onInsufficientBalance?.()
        throw new Error(data.error || 'GPT Live could not start. Please try again.')
      }
      await pc.setRemoteDescription({ type: 'answer', sdp: data.transport.sdp })
      let timeout: ReturnType<typeof setTimeout> | undefined
      try { await Promise.race([startedPromise, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('GPT Live did not start.')), 15_000) })]) }
      finally { clearTimeout(timeout) }
      if (current()) { this.callbacks.onUsage?.(); this.callbacks.onLatency?.({ kind: 'session_setup', at: Date.now(), sessionSetupMs: Date.now() - startedAt, model: VOICE_LIVE_MODEL }) }
    } catch (error) { if (current()) this.fail(error instanceof Error ? error.message : 'Could not start voice.') }
  }
  /** Exposed for deterministic protocol regression tests. */
  handleEvent(event: LiveEvent) {
    if (event.type === 'session.started') {
      if (this.ready) return
      this.ready = true
      this.emit({ connection: 'connected', activity: 'listening', state: 'listening' })
      if (this.input?.greeting) this.send({ type: 'session.instructions.append', delegation_id: null, content: `The reader opened this conversation to prepare for the book. Say this opening line now, once: ${JSON.stringify(this.input.greeting)} Then pause for the reader. Keep the introduction spoiler-free unless asked otherwise.` })
    }
    else if (event.type === 'session.input_transcript.delta') this.caption('user', event.delta ?? '')
    else if (event.type === 'session.output_transcript.delta') this.caption('assistant', event.delta ?? '')
    else if (event.type === 'session.closed') this.stop()
    else if (event.type === 'error') this.emit({ error: event.error?.message || 'Voice could not complete that request.' })
    else if (event.type === 'response.event' && event.event && event.delegation_id) {
      const nested = event.event
      const key = event.delegation_id
      if (nested.type === 'response.created') {
        this.flush('user')
        this.responses.set(key, { id: nested.response?.id ?? '', calls: [] })
      }
      const response = this.responses.get(key)
      if (!response) return
      if (nested.type === 'response.output_item.done' && nested.item?.type === 'function_call' && nested.item.call_id && nested.item.name) {
        if (!response.calls.some(call => call.callId === nested.item!.call_id)) response.calls.push({ callId: nested.item.call_id, name: nested.item.name, arguments: nested.item.arguments ?? '{}' })
      }
      if (nested.type === 'response.completed') {
        this.responses.delete(key)
        const generation = this.generation
        this.toolQueue = this.toolQueue.then(async () => {
          if (generation !== this.generation) return
          for (const call of response.calls) {
            if (this.handled.has(call.callId)) continue
            this.handled.add(call.callId)
            let output: unknown
            try { output = await this.runTool(call) } catch { output = { ok: false, error: 'The action could not be completed.' } }
            if (generation !== this.generation) return
            this.send({ type: 'response.item.create', item: { type: 'function_call_output', call_id: call.callId, output: JSON.stringify(output) } })
          }
          if (response.calls.length && generation === this.generation) this.send({ type: 'response.create' })
        }).catch(() => { /* Individual tool failures return a result above. */ })
      }
    }
  }
  private async runTool(call: ToolCall): Promise<unknown> {
    const input = this.input
    if (!input) return { ok: false, error: 'Session ended' }
    const args = JSON.parse(call.arguments) as Record<string, unknown>
    if (call.name === 'ask_companion') {
      if (typeof args.question !== 'string' || !input.onCompanionAsk) return { ok: false }
      this.flush('user')
      const result = await input.onCompanionAsk(args.question)
      return typeof result === 'string' ? { ok: true, answer: result } : result
    }
    if (call.name === 'resume_audiobook') { this.explicitResume(typeof args.play_audio === 'boolean' ? args.play_audio : undefined); return { ok: true } }
    if (call.name === 'end_voice_session') { this.stop(); this.callbacks.onEndRequested?.(); return { ok: true } }
    if (call.name === 'hold_voice_session') return { ok: true }
    if (call.name === 'set_playback_speed') {
      const rate = parseSetPlaybackSpeedArguments(call.arguments)
      if (rate == null || !input.audio.setPlaybackSpeed) return { ok: false }
      input.audio.setPlaybackSpeed(rate); return { ok: true, rate }
    }
    if (call.name === 'set_assistant_pace') {
      const pace = parseAssistantPace(call.arguments)
      if (!pace) return { ok: false }
      this.setAssistantPace(pace); this.callbacks.onSetAssistantPace?.(pace); return { ok: true, pace }
    }
    if (isLabPlaybackSkip(call.name)) {
      if (!input.audio.skipPlayback) return { ok: false }
      const outcome = await input.audio.skipPlayback(call.name)
      if (this.input === input && outcome?.resumePlayback) this.explicitResume()
      return { ok: true, outcome }
    }
    const allowed = (input.tools ?? input.applicationTools ?? []).some(tool => tool && typeof tool === 'object' && 'name' in tool && tool.name === call.name)
    if (!allowed || !this.callbacks.onApplicationTool) return { ok: false, error: 'Unknown control' }
    const result = await this.callbacks.onApplicationTool(call.name, args, call.callId)
    // The direct voice tools return both evidence and how to handle failures.
    // Preserve that contract when crossing the Live backend boundary.
    return { result: result.output, responseInstructions: result.responseInstructions }
  }
  explicitResume(playAudio?: boolean) {
    const input = this.input
    const anchor = this.anchor ?? (input ? { bookId: input.context.bookId ?? '', editionKey: input.context.editionKey ?? '', chapterNumber: input.context.chapterNumber ?? 1, paragraphIndex: input.context.paragraphIndex ?? 0, paragraphNumber: (input.context.paragraphIndex ?? 0) + 1, offsetSeconds: 0 } : null)
    this.stop()
    if (input && anchor) input.audio.resumePlayback(anchor, playAudio)
  }
  stop() {
    this.send({ type: 'session.close' })
    this.generation++
    this.ready = false
    this.readerLocation = ''
    this.flush('user'); this.flush('assistant')
    this.stream?.getTracks().forEach(track => track.stop())
    this.dc?.close(); this.pc?.close()
    if (this.audio) { this.audio.pause(); this.audio.srcObject = null }
    this.stream = null; this.dc = null; this.pc = null; this.audio = null; this.analyser = null
    this.responses.clear(); this.handled.clear(); this.input = null
    this.ui = idle(); this.callbacks.onSnapshot(this.ui)
  }
  dispose() { this.stop(); void this.context?.close(); this.context = null }
}
