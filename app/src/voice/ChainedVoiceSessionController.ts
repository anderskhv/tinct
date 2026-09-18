import { apiUrl } from '../utils/apiUrl'
import { buildVoiceInstructions, VOICE_TOOLS } from './context'
import { experimentInstructions, type VoiceDiagnostic } from './voiceLab'
import { LAB_AUDIO_CONSTRAINTS, type AudioPlaybackAnchor, type VoiceReaderContext } from './types'
import { isLabPlaybackSkip, parseAssistantPace, parseSetPlaybackSpeedArguments, type AssistantPace } from '../lab/labAsk'
import type { StartVoiceSessionInput, VoiceSessionCallbacks, VoiceUiSnapshot } from './VoiceSessionController'
import { readEvents, retainsPendingQuestion, sourceLinks, takeThought } from './chainProtocol'
import { ChainSpeechPlayer } from './ChainSpeechPlayer'

type Turn = {
  id: number; question: string; abort: AbortController; generated: string; heard: string;
  done: boolean; sources: any[]; speechAt: number; firstAudio: boolean
}
const idle = (): VoiceUiSnapshot => ({ state: 'reading', mode: 'conversation', activity: 'idle', connection: 'idle', micMuted: false, resumeInSeconds: null, error: null, isActive: false, userSpeechStarted: false })

/** Preview only: Sol authors every answer; no conversational voice model paraphrases it. */
export class ChainedVoiceSessionController {
  private ui = idle()
  private input: StartVoiceSessionInput | null = null
  private pc: RTCPeerConnection | null = null
  private stream: MediaStream | null = null
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private player: ChainSpeechPlayer | null = null
  private sessionAbort: AbortController | null = null
  private generation = 0
  private sequence = 0
  private turn: Turn | null = null
  private history: any[] = []
  private unfinished = ''
  private anchor: AudioPlaybackAnchor | null = null
  private awaitingTranscript = false
  private speaking = false
  private speechStoppedAt = 0
  private pace: AssistantPace = 'normal'
  private committed: string[] = []
  private transcripts = new Map<string, string>()
  private processed = new Set<string>()
  private transcriptTimer: ReturnType<typeof setTimeout> | undefined
  constructor(private callbacks: VoiceSessionCallbacks) {}
  getSnapshot() { return this.ui }
  private emit(update: Partial<VoiceUiSnapshot>) { this.ui = { ...this.ui, ...update }; this.callbacks.onSnapshot(this.ui) }
  private diagnose(event: Omit<VoiceDiagnostic, 'at'>) { this.callbacks.onVoiceDiagnostic?.({ at: Date.now(), ...event }) }
  unlockLabAudioContext() {
    if (!this.context && typeof AudioContext !== 'undefined') this.context = new AudioContext()
    void this.context?.resume().catch(() => {})
  }
  getAssistantLevel() {
    if (!this.analyser) return null
    const data = new Uint8Array(this.analyser.fftSize); this.analyser.getByteTimeDomainData(data)
    return Math.sqrt(data.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / data.length)
  }
  setMicMuted(muted: boolean) {
    this.stream?.getAudioTracks().forEach(track => { track.enabled = !muted })
    this.emit({ micMuted: muted })
    if (muted) { this.speaking = false; this.flushTranscripts(); void this.player?.resume() }
  }
  setAssistantPace(pace: AssistantPace) { this.pace = pace }
  updateContext(context: VoiceReaderContext, instructions?: string) {
    if (!this.input) return
    if (context.bookId !== this.input.context.bookId) { this.stop(); return }
    this.input.context = context
    if (instructions) this.input.instructions = instructions
  }
  private instructions() {
    const input = this.input!
    const base = experimentInstructions(input.voiceExperiment!, input.instructions || buildVoiceInstructions(input.context), input.context)
    return base + '\nChapter reference (may extend beyond the visible page; never claim it is all visible):\n' +
      (input.context.chapterText || '').slice(0, 18000) +
      (this.unfinished ? '\nPrevious interrupted draft, NOT fully heard by the reader; use only to resolve their follow-up, never assume you already told them this:\n' + this.unfinished.slice(0, 5000) : '')
  }
  private tools(): any[] {
    return (this.input?.tools ?? [...VOICE_TOOLS, ...(this.input?.applicationTools ?? [])])
      .filter((tool: any) => tool?.type === 'function' && !['ask_companion', 'search_reading_sources'].includes(tool.name)) as any[]
  }
  private async request(body: unknown, signal: AbortSignal) {
    const result = await fetch(apiUrl('/api/voice-chain'), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.input?.authToken },
      body: JSON.stringify(body), signal: AbortSignal.any([signal, AbortSignal.timeout(45000)]),
    })
    if (!result.ok) {
      const error = await result.json().catch(() => null) as any
      throw new Error(error?.error || 'Voice request failed.')
    }
    return result
  }
  async start(input: StartVoiceSessionInput) {
    if (this.ui.isActive) return
    this.stop()
    this.unlockLabAudioContext()
    const generation = this.generation, setupAt = Date.now()
    this.input = { ...input, voiceExperiment: input.voiceExperiment ? { ...input.voiceExperiment } : undefined }
    this.sessionAbort = new AbortController()
    this.pace = input.assistantPace || 'normal'
    this.anchor = input.audio.pausePlayback()?.anchor ?? null
    this.emit({ isActive: true, connection: 'connecting', activity: 'connecting', mode: input.mode ?? 'conversation' })
    this.diagnose({ type: 'call.started', settings: input.voiceExperiment, instructions: this.instructions() })
    const current = () => generation === this.generation
    try {
      if (!input.authToken) { this.callbacks.onNeedAuth?.(); throw new Error('Sign in to use this voice experiment.') }
      if (!this.context) throw new Error('Audio playback is unavailable in this browser.')
      this.analyser = this.context.createAnalyser()
      this.analyser.connect(this.context.destination)
      this.player = new ChainSpeechPlayer(this.context, this.analyser,
        text => {
          const turn = this.turn
          if (!turn) return Promise.reject(new Error('Turn ended'))
          return this.request({ action: 'speech', text, pace: this.pace }, turn.abort.signal)
        },
        text => {
          const turn = this.turn
          if (!turn) return
          this.emit({ activity: 'speaking', state: 'answering' })
          this.diagnose({ type: 'speech.chunk.started', id: String(turn.id), text })
          if (!turn.firstAudio) {
            turn.firstAudio = true
            this.diagnose({ type: 'speech.first_audio', id: String(turn.id), durationMs: Date.now() - turn.speechAt })
            this.callbacks.onLatency?.({ kind: 'turn', at: Date.now(), turnNumber: turn.id, model: 'gpt-5.6-sol', speechStoppedToFirstAudioMs: Date.now() - turn.speechAt })
          }
        },
        text => {
          if (!this.turn) return
          this.turn.heard += (this.turn.heard ? ' ' : '') + text
          this.diagnose({ type: 'assistant.transcript', text: text + ' ' })
        },
        () => this.finishTurn(),
        error => { this.cancelTurn(); this.emit({ error: error instanceof Error ? error.message : 'Speech failed.', activity: 'listening', state: 'listening' }) },
      )
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { ...LAB_AUDIO_CONSTRAINTS } })
      if (!current()) { stream.getTracks().forEach(track => track.stop()); return }
      this.stream = stream
      const pc = this.pc = new RTCPeerConnection()
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      pc.onconnectionstatechange = () => { if (current() && ['failed', 'disconnected'].includes(pc.connectionState)) this.fail('Voice connection lost. Reconnect to continue.') }
      const dc = pc.createDataChannel('oai-events')
      dc.onmessage = event => {
        if (!current()) return
        try { this.handleEvent(JSON.parse(String(event.data))) } catch { this.diagnose({ type: 'error', text: 'Malformed transcription event' }) }
      }
      dc.onclose = () => { if (current() && this.ui.isActive) this.fail('Voice connection lost. Reconnect to continue.') }
      let timeout: ReturnType<typeof setTimeout> | undefined
      const connected = new Promise<void>((resolve, reject) => {
        dc.onopen = () => { clearTimeout(timeout); resolve() }
        timeout = setTimeout(() => reject(new Error('Voice connection timed out.')), 25000)
      })
      // Attach a rejection handler immediately while SDP negotiation is in progress.
      void connected.catch(() => {})
      try {
        await pc.setLocalDescription(await pc.createOffer())
        if (!current()) return
        const response = await this.request({ action: 'transcription', sdp: pc.localDescription?.sdp }, this.sessionAbort.signal)
        const sdp = await response.text()
        if (!current()) return
        await pc.setRemoteDescription({ type: 'answer', sdp })
        await connected
      } finally { clearTimeout(timeout) }
      if (!current()) return
      this.emit({ connection: 'connected', activity: 'listening', state: 'listening' })
      this.diagnose({ type: 'call.connected' })
      this.callbacks.onUsage?.()
      this.callbacks.onLatency?.({ kind: 'session_setup', at: Date.now(), model: 'gpt-live-transcribe', sessionSetupMs: Date.now() - setupAt })
    } catch (error) { if (current()) this.fail(error instanceof Error ? error.message : 'Voice could not start.') }
  }
  /** Exposed for deterministic transport tests; no browser microphone needed. */
  handleEvent(event: any) {
    if (!this.ui.isActive) return
    if (event.type === 'input_audio_buffer.speech_started') {
      this.speaking = true; this.awaitingTranscript = true; clearTimeout(this.transcriptTimer)
      void this.player?.pause()
      this.emit({ activity: 'listening', userSpeechStarted: true })
      this.diagnose({ type: 'user.speech_started' })
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      this.speaking = false; this.speechStoppedAt = Date.now()
      this.diagnose({ type: 'user.speech_stopped' })
      this.flushTranscripts()
    } else if (event.type === 'input_audio_buffer.committed') {
      if (!this.processed.has(event.item_id) && !this.committed.includes(event.item_id)) this.committed.push(event.item_id)
      this.flushTranscripts()
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      if (this.processed.has(event.item_id)) return
      this.transcripts.set(event.item_id, String(event.transcript || '').replace(/\uFFFD/g, '').trim())
      this.flushTranscripts()
    } else if (event.type === 'conversation.item.input_audio_transcription.failed') {
      this.transcripts.set(event.item_id, '')
      this.emit({ error: 'I missed that. Please try again.' }); this.flushTranscripts()
    } else if (event.type === 'error') {
      this.diagnose({ type: 'error', text: event.error?.message })
      this.emit({ error: 'Voice could not process that audio. Reconnect if it persists.' })
    }
  }
  private flushTranscripts() {
    if (this.speaking) return
    clearTimeout(this.transcriptTimer)
    this.transcriptTimer = setTimeout(() => {
      if (this.speaking || !this.ui.isActive) return
      const parts: string[] = []
      while (this.committed.length && this.transcripts.has(this.committed[0])) {
        const id = this.committed.shift()!
        this.processed.add(id); parts.push(this.transcripts.get(id)!)
        this.transcripts.delete(id)
      }
      const text = parts.filter(Boolean).join(' ')
      if (text) this.acceptUtterance(text)
      else if (!this.committed.length && parts.length) { this.awaitingTranscript = false; void this.player?.resume() }
    }, 120)
  }
  /** A clarification such as "yes" is always a real turn; only pending status/exact repeats retain work. */
  acceptUtterance(text: string) {
    if (!this.input || !this.ui.isActive || !text.trim()) return
    this.awaitingTranscript = false
    this.diagnose({ type: 'user.transcript', text: text + ' ' })
    this.callbacks.onTurn('user', text)
    if (this.turn && retainsPendingQuestion(text, this.turn.question)) {
      this.diagnose({ type: 'request.retained', id: String(this.turn.id), text })
      void this.player?.resume()
      this.emit({ activity: this.player?.busy ? 'speaking' : 'preparing_answer', state: 'answering' })
      return
    }
    if (this.callbacks.onBeforeUserTurn?.() === false) { this.stop(); return }
    this.cancelTurn()
    void this.player?.resume()
    const turn: Turn = { id: ++this.sequence, question: text, abort: new AbortController(), generated: '', heard: '', done: false, sources: [], speechAt: this.speechStoppedAt || Date.now(), firstAudio: false }
    this.turn = turn
    this.history.push({ role: 'user', content: text })
    this.emit({ error: null, activity: 'preparing_answer', state: 'answering' })
    void this.answer(turn)
  }
  private async answer(turn: Turn) {
    const current = () => this.turn === turn && !turn.abort.signal.aborted
    const messages = this.history.slice(-30)
    let buffer = ''
    try {
      for (let round = 0; round < 5 && current(); round++) {
        const response = await this.request({ action: 'answer', instructions: this.instructions(), messages, tools: this.tools() }, turn.abort.signal)
        if (!response.body) throw new Error('Missing answer stream.')
        let complete = false
        const output: any[] = []
        await readEvents(response.body, event => {
          if (!current()) return
          if (event.type === 'response.output_text.delta') {
            turn.generated += event.delta; buffer += event.delta
            this.diagnose({ type: 'backend.text', id: String(turn.id), text: event.delta })
            let thought
            while ((thought = takeThought(buffer))) { buffer = thought.rest; this.player?.enqueue(thought.text) }
          }
          if (event.type === 'response.output_item.done') output.push(event.item)
          if (event.type === 'response.output_text.annotation.added') turn.sources.push(event.annotation)
          if (event.type === 'response.completed') {
            complete = true
            for (const item of event.response?.output || []) for (const part of item.content || []) turn.sources.push(...(part.annotations || []))
          }
          if (event.type === 'response.created' || event.type.startsWith('response.web_search_call.')) this.diagnose({ type: event.type, id: String(turn.id) })
          if (['response.failed', 'response.incomplete', 'error'].includes(event.type)) throw new Error('The answer did not complete. Please try again.')
        })
        if (!current()) return
        if (!complete) throw new Error('The answer connection ended early.')
        const calls = output.filter(item => item.type === 'function_call')
        if (!calls.length) {
          const thought = takeThought(buffer, true)
          if (thought) this.player?.enqueue(thought.text)
          const links = sourceLinks(turn.sources)
          if (links) {
            // Store links before announcing them. The test room retains these in its local chat/diagnostics.
            this.callbacks.onTurn('assistant', 'Sources:\n' + links)
            this.diagnose({ type: 'sources.saved', id: String(turn.id), text: links })
            this.player?.enqueue('I’ve put the sources in the chat.')
          }
          turn.done = true
          this.diagnose({ type: 'response.completed', id: String(turn.id) })
          this.finishTurn()
          return
        }
        // Keep reasoning items/encrypted state with function calls for the same response.
        messages.push(...output)
        for (const call of calls) {
          // A spoken correction may still be transcribing. Do not execute an action over it.
          while (current() && (this.speaking || this.awaitingTranscript)) await new Promise(resolve => setTimeout(resolve, 50))
          if (!current()) return
          this.diagnose({ type: 'tool.started', id: call.call_id, text: call.name })
          let result: unknown
          try { result = await this.runTool(call) } catch { result = { ok: false, error: 'Control failed. Do not claim success.' } }
          if (!current()) return
          messages.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) })
          this.diagnose({ type: 'tool.completed', id: call.call_id, text: JSON.stringify(result).slice(0, 12000) })
        }
      }
      if (current()) throw new Error('Too many lookup steps. Please narrow the question.')
    } catch (error) {
      if (!current()) return
      this.diagnose({ type: 'error', id: String(turn.id), text: error instanceof Error ? error.message : 'Answer failed' })
      this.cancelTurn()
      this.emit({ state: 'listening', activity: 'listening', error: error instanceof Error ? error.message : 'Answer failed. Please try again.' })
    }
  }
  private finishTurn() {
    const turn = this.turn
    if (!turn?.done || this.player?.busy) return
    if (turn.heard) {
      this.history.push({ role: 'assistant', content: turn.heard })
      this.callbacks.onTurn('assistant', turn.heard + (sourceLinks(turn.sources) ? '\n\nSources:\n' + sourceLinks(turn.sources) : ''))
    }
    const links = sourceLinks(turn.sources)
    if (links) this.history.push({ role: 'assistant', content: 'Verified source links for the preceding answer:\n' + links })
    this.history = this.history.slice(-30)
    this.unfinished = ''; this.turn = null
    this.emit({ activity: 'listening', state: 'listening' })
  }
  private cancelTurn() {
    const turn = this.turn
    if (turn) {
      turn.abort.abort()
      this.unfinished = turn.generated
      if (turn.heard) {
        this.history.push({ role: 'assistant', content: turn.heard })
        this.callbacks.onTurn('assistant', turn.heard, { cancelled: true })
      }
      this.diagnose({ type: 'response.interrupted', id: String(turn.id), text: 'Only completed audio chunks enter heard history.' })
    }
    this.turn = null; this.player?.cancel()
  }
  private async runTool(call: any): Promise<unknown> {
    const input = this.input
    if (!input || !this.tools().some(tool => tool.name === call.name)) return { ok: false, error: 'Unknown control' }
    const args = JSON.parse(call.arguments || '{}')
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
      this.setAssistantPace(pace); this.callbacks.onSetAssistantPace?.(pace); return { ok: true }
    }
    if (isLabPlaybackSkip(call.name)) {
      if (!input.audio.skipPlayback) return { ok: false }
      const result = await input.audio.skipPlayback(call.name)
      if (this.input === input && result?.resumePlayback) this.explicitResume()
      return { ok: true, result }
    }
    if (!this.callbacks.onApplicationTool) return { ok: false, error: 'Control unavailable' }
    const result = await this.callbacks.onApplicationTool(call.name, args, call.call_id)
    return { result: result.output, responseInstructions: result.responseInstructions }
  }
  explicitResume(playAudio?: boolean) {
    const input = this.input, anchor = this.anchor
    this.stop()
    if (input && anchor) input.audio.resumePlayback(anchor, playAudio)
  }
  private fail(error: string) { this.stop(); this.emit({ error, connection: 'disconnected' }) }
  stop() {
    if (this.ui.isActive) this.diagnose({ type: 'call.ended' })
    this.generation++
    this.cancelTurn(); this.sessionAbort?.abort(); this.sessionAbort = null
    clearTimeout(this.transcriptTimer)
    this.pc?.close(); this.pc = null
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null
    this.player = null; this.analyser?.disconnect(); this.analyser = null
    this.input = null; this.anchor = null; this.history = []; this.unfinished = ''
    this.committed = []; this.transcripts.clear(); this.processed.clear()
    this.speaking = false; this.awaitingTranscript = false; this.speechStoppedAt = 0
    void this.context?.resume().catch(() => {})
    this.ui = idle(); this.callbacks.onSnapshot(this.ui)
  }
  dispose() { this.stop(); void this.context?.close().catch(() => {}); this.context = null }
}
