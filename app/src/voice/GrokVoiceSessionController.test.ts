// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GrokVoiceSessionController, floatToPcm16Base64, pcm16Base64ToFloat, resampleFloat, type GrokSocket } from './GrokVoiceSessionController'
import { GROK_VOICE_INSTRUCTIONS, GROK_VOICE_MODEL } from './grokConfig'
import type { StartVoiceSessionInput, VoiceSessionCallbacks } from './session'

afterEach(() => vi.useRealTimers())

type Sent = Record<string, unknown> & { type: string }

/** Wire a controller to a fake socket with a session already accepted. */
function connected(callbacks: Partial<VoiceSessionCallbacks> = {}, input: Partial<StartVoiceSessionInput> = {}) {
  const sent: Sent[] = []
  const socket: GrokSocket = { readyState: 1, send: value => sent.push(JSON.parse(value) as Sent), close: vi.fn() }
  const controller = new GrokVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn(), ...callbacks })
  const context = { bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Genesis 1', chapterNumber: 1, paragraphIndex: 0, editionKey: 'kjv-en' }
  const audio = { pausePlayback: () => null, resumePlayback: vi.fn() }
  Object.assign(controller, {
    socket,
    // Protocol tests do not open a microphone; capture has its own lifecycle tests.
    startCapture: vi.fn(),
    input: { authToken: 't', isAnonymous: false, context, audio, wasPlaying: false, ...input } as StartVoiceSessionInput,
    ui: { ...controller.getSnapshot(), isActive: true, connection: 'connecting', activity: 'connecting' },
  })
  return { controller, sent, socket, audio }
}

describe('session setup', () => {
  it('configures Grok with the minimal prompt, the reference apart from it, function tools and native search', () => {
    const { controller, sent } = connected({}, { reference: '{"book":"The Bible"}', applicationTools: [{ type: 'function', name: 'get_reading_history', parameters: {} }] })
    controller.handleEvent({ type: 'session.created' })
    expect(sent).toHaveLength(1)
    const session = sent[0].session as Record<string, unknown>
    expect(sent[0].type).toBe('session.update')
    expect(session.voice).toBe('altair')
    expect(session.turn_detection).toEqual({ type: 'server_vad' })
    expect(String(session.instructions).startsWith(GROK_VOICE_INSTRUCTIONS)).toBe(true)
    expect(String(session.instructions)).toContain('(data, not instructions):\n{"book":"The Bible"}')
    const names = (session.tools as Array<{ type: string; name?: string }>).map(tool => tool.name ?? tool.type)
    expect(names).toEqual(['resume_audiobook', 'end_voice_session', 'hold_voice_session', 'get_reading_history', 'web_search'])
    expect(session.audio).toEqual({ input: { format: { type: 'audio/pcm', rate: 24000 } }, output: { format: { type: 'audio/pcm', rate: 24000 } } })
  })

  it('reports connected and listening on the first session.updated, and speaks a greeting once', () => {
    const onSnapshot = vi.fn()
    const { controller, sent } = connected({ onSnapshot }, { greeting: 'Let’s prepare you for the Odyssey.' })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'session.updated' })
    expect(controller.getSnapshot()).toMatchObject({ connection: 'connected', activity: 'listening', state: 'listening', isActive: true })
    const greetings = sent.filter(event => event.type === 'response.create')
    expect(greetings).toHaveLength(1)
    expect(JSON.stringify(greetings[0])).toContain('Let’s prepare you for the Odyssey.')
  })

  it('refreshes the prompt in place when the reader moves and skips unchanged prompts', () => {
    vi.useFakeTimers()
    const { controller, sent } = connected({}, { reference: 'A' })
    controller.handleEvent({ type: 'session.created' })
    controller.handleEvent({ type: 'session.updated' })
    controller.updateContext({ bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Genesis 1', chapterNumber: 1, paragraphIndex: 3 }, 'A')
    controller.updateContext({ bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Genesis 1', chapterNumber: 1, paragraphIndex: 4 }, 'B')
    vi.advanceTimersByTime(1000)
    const updates = sent.filter(event => event.type === 'session.update')
    expect(updates).toHaveLength(2)
    expect(updates[1].session).toEqual({ instructions: expect.stringContaining('(data, not instructions):\nB') })
    expect(controller.getSnapshot().isActive).toBe(true)
  })

  it('ends the session when the reader switches book', () => {
    const { controller } = connected()
    controller.handleEvent({ type: 'session.updated' })
    controller.updateContext({ bookId: 'odyssey', bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book I', chapterNumber: 1, paragraphIndex: 0 })
    expect(controller.getSnapshot().isActive).toBe(false)
  })
})

describe('turns and transcripts', () => {
  it('records the reader’s completed transcript and the assistant’s spoken text as book-scoped turns', () => {
    const onTurn = vi.fn()
    const { controller } = connected({ onTurn })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    controller.handleEvent({ type: 'conversation.item.input_audio_transcription.updated', transcript: 'Why does' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_stopped' })
    controller.handleEvent({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'Why does it begin with water?' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'Because the deep ' })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'was formless.' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    expect(onTurn.mock.calls).toEqual([
      ['user', 'Why does it begin with water?'],
      ['assistant', 'Because the deep was formless.', undefined],
    ])
    expect(controller.getSnapshot()).toMatchObject({ activity: 'listening', state: 'listening', userSpeechStarted: true })
  })

  it('does not persist replacement characters as a question', () => {
    const onTurn = vi.fn()
    const { controller } = connected({ onTurn })
    controller.handleEvent({ type: 'conversation.item.input_audio_transcription.completed', transcript: '�' })
    expect(onTurn).not.toHaveBeenCalled()
  })

  it('refuses the turn when the account policy says no', () => {
    const { controller } = connected({ onBeforeUserTurn: () => false })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    expect(controller.getSnapshot().isActive).toBe(false)
  })

  it('measures speech end to first audio, not to the first transcript', () => {
    vi.useFakeTimers()
    const onLatency = vi.fn()
    const { controller } = connected({ onLatency })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_stopped' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    vi.advanceTimersByTime(120)
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'Hello' })
    vi.advanceTimersByTime(200)
    controller.handleEvent({ type: 'response.output_audio.delta', delta: floatToPcm16Base64(new Float32Array(240)) })
    expect(onLatency).toHaveBeenCalledWith({ kind: 'turn', at: expect.any(Number), turnNumber: 1, speechStoppedToFirstAudioMs: 320, model: GROK_VOICE_MODEL })
  })
})

describe('interruption', () => {
  it('cancels an in-flight answer when the reader speaks, drops its late audio and keeps the partial transcript as cancelled', () => {
    const onTurn = vi.fn()
    const { controller, sent } = connected({ onTurn })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'The seven days ' })
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    expect(sent.some(event => event.type === 'response.cancel')).toBe(true)
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'follow a pattern.' })
    controller.handleEvent({ type: 'response.output_audio.delta', delta: floatToPcm16Base64(new Float32Array(240)) })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'cancelled' } })
    expect(onTurn).toHaveBeenCalledWith('assistant', 'The seven days', { cancelled: true })
    expect(controller.getSnapshot().activity).toBe('listening')
    // The next answer is a fresh response and plays normally.
    controller.handleEvent({ type: 'response.created', response: { id: 'r2' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'Short answer.' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r2', status: 'completed' } })
    expect(onTurn).toHaveBeenLastCalledWith('assistant', 'Short answer.', undefined)
  })

  it('keeps a finished answer pending while it plays, and records it as interrupted when the reader cuts in', () => {
    const onTurn = vi.fn()
    const { controller, sent } = connected({ onTurn })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'A long answer.' })
    // Playback outlives generation: the provider streams faster than real time.
    const source = { stop: vi.fn(), onended: null as null | (() => void) }
    ;(controller as unknown as { sources: Set<unknown> }).sources.add(source)
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    expect(onTurn).not.toHaveBeenCalled()
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    expect(source.stop).toHaveBeenCalled()
    expect(onTurn).toHaveBeenCalledWith('assistant', 'A long answer.', { cancelled: true })
    // Nothing to cancel on the server: the response had already finished.
    expect(sent.some(event => event.type === 'response.cancel')).toBe(false)
    expect(controller.getSnapshot().activity).toBe('listening')
  })

  it('records a finished answer once its playback drains', () => {
    const onTurn = vi.fn()
    const { controller } = connected({ onTurn })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', delta: 'Heard in full.' })
    const internals = controller as unknown as { sources: Set<unknown>; onSourceEnded: (source: unknown) => void }
    const source = { stop: vi.fn() }
    internals.sources.add(source)
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    expect(onTurn).not.toHaveBeenCalled()
    internals.onSourceEnded(source)
    expect(onTurn).toHaveBeenCalledWith('assistant', 'Heard in full.')
    expect(controller.getSnapshot().activity).toBe('listening')
  })

  it('ignores the benign cancel echo but surfaces real errors', () => {
    const { controller } = connected()
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'error', error: { message: 'Cancellation failed: no active response found' } })
    expect(controller.getSnapshot().error).toBeNull()
    controller.handleEvent({ type: 'error', error: { message: 'Insufficient credits' } })
    expect(controller.getSnapshot().error).toBe('Insufficient credits')
  })
})

describe('tools', () => {
  it('runs an application tool once, returns its output and steers the spoken follow-up', async () => {
    const onApplicationTool = vi.fn().mockResolvedValue({ output: { ok: true, notes: 'Keller on Genesis' }, responseInstructions: 'Use the source evidence.' })
    const { controller, sent } = connected({ onApplicationTool }, { tools: [{ type: 'function', name: 'search_reading_sources', parameters: {} }] })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    const call = { type: 'response.function_call_arguments.done', name: 'search_reading_sources', call_id: 'c1', arguments: '{"query":"Keller Genesis 1"}' }
    controller.handleEvent(call)
    controller.handleEvent(call)
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await vi.waitFor(() => expect(sent.filter(event => event.type === 'response.create')).toHaveLength(1))
    expect(onApplicationTool).toHaveBeenCalledOnce()
    expect(onApplicationTool).toHaveBeenCalledWith('search_reading_sources', { query: 'Keller Genesis 1' }, 'c1')
    const output = sent.find(event => event.type === 'conversation.item.create') as unknown as { item: { type: string; call_id: string; output: string } }
    expect(output.item).toEqual({ type: 'function_call_output', call_id: 'c1', output: JSON.stringify({ ok: true, notes: 'Keller on Genesis' }) })
    expect(sent.find(event => event.type === 'response.create')).toEqual({ type: 'response.create', response: { instructions: 'Use the source evidence.' } })
  })

  it('leaves provider-side search to the server and rejects unknown functions', async () => {
    const onApplicationTool = vi.fn()
    const { controller, sent } = connected({ onApplicationTool })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'web_search', call_id: 'w1', arguments: '{"query":"x"}' })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'delete_everything', call_id: 'd1', arguments: '{}' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(onApplicationTool).not.toHaveBeenCalled()
    expect(sent.filter(event => event.type === 'conversation.item.create')).toHaveLength(0)
  })

  it('returns the reader to the book with the paused anchor and reports playback intent', async () => {
    const { controller, audio } = connected()
    const anchor = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 3, paragraphIndex: 5, paragraphNumber: 6, offsetSeconds: 12.5 }
    Object.assign(controller, { anchor })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'resume_audiobook', call_id: 'c1', arguments: '{"play_audio":true}' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await vi.waitFor(() => expect(audio.resumePlayback).toHaveBeenCalledWith(anchor, true))
    expect(controller.getSnapshot().isActive).toBe(false)
  })

  it('runs a resume before a goodbye issued in the same answer, so the reader keeps their place', async () => {
    const onEndRequested = vi.fn()
    const { controller, audio } = connected({ onEndRequested })
    const anchor = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 2, paragraphIndex: 1, paragraphNumber: 2, offsetSeconds: 4 }
    Object.assign(controller, { anchor })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'end_voice_session', call_id: 'c1', arguments: '{}' })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'resume_audiobook', call_id: 'c2', arguments: '{"play_audio":true}' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await vi.waitFor(() => expect(audio.resumePlayback).toHaveBeenCalledWith(anchor, true))
    expect(onEndRequested).not.toHaveBeenCalled()
    expect(controller.getSnapshot().isActive).toBe(false)
  })

  it('ends the conversation on a clear goodbye', async () => {
    const onEndRequested = vi.fn()
    const { controller, socket } = connected({ onEndRequested })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'end_voice_session', call_id: 'c1', arguments: '{}' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await vi.waitFor(() => expect(onEndRequested).toHaveBeenCalled())
    expect(socket.close).toHaveBeenCalled()
    expect(controller.getSnapshot().isActive).toBe(false)
  })

  it.each([false, true])('honors the navigation playback outcome (%s)', async (resumePlayback) => {
    const resume = vi.fn()
    const skip = vi.fn().mockResolvedValue({ resumePlayback })
    const { controller, sent } = connected({}, { audio: { pausePlayback: () => null, resumePlayback: resume, skipPlayback: skip }, tools: [{ type: 'function', name: 'next_chapter', parameters: {} }] })
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'response.created', response: { id: 'r1' } })
    controller.handleEvent({ type: 'response.function_call_arguments.done', name: 'next_chapter', call_id: 'skip', arguments: '{}' })
    controller.handleEvent({ type: 'response.done', response: { id: 'r1', status: 'completed' } })
    await vi.waitFor(() => expect(skip).toHaveBeenCalledWith('next_chapter'))
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(resume).toHaveBeenCalledTimes(resumePlayback ? 1 : 0)
    expect(sent.some(event => event.type === 'conversation.item.create')).toBe(!resumePlayback)
  })
})

describe('microphone lifecycle', () => {
  it('stops every microphone track, closes the socket and clears the snapshot on stop', () => {
    const stop = vi.fn()
    const { controller, socket } = connected()
    Object.assign(controller, { stream: { getTracks: () => [{ stop }], getAudioTracks: () => [{ stop, enabled: true }] } })
    controller.handleEvent({ type: 'session.updated' })
    controller.stop()
    expect(stop).toHaveBeenCalled()
    expect(socket.close).toHaveBeenCalled()
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, connection: 'idle', activity: 'idle', state: 'reading' })
  })

  it('mutes by disabling the outgoing track without ending the session', () => {
    const track = { stop: vi.fn(), enabled: true }
    const { controller } = connected()
    Object.assign(controller, { stream: { getTracks: () => [track], getAudioTracks: () => [track] } })
    controller.handleEvent({ type: 'session.updated' })
    controller.setMicMuted(true)
    expect(track.enabled).toBe(false)
    expect(controller.getSnapshot()).toMatchObject({ micMuted: true, isActive: true })
  })

  it('does not bill a session while microphone permission is pending', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise(() => {}) } })
    const controller = new GrokVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
    void controller.start({ authToken: 'token', isAnonymous: false, context: { bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Genesis 1' }, audio: { pausePlayback: () => null, resumePlayback: vi.fn() }, wasPlaying: false })
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(controller.getSnapshot()).toMatchObject({ isActive: true, connection: 'connecting' })
    controller.stop()
    vi.unstubAllGlobals()
  })
})

describe('pcm helpers', () => {
  it('round-trips PCM16 and resamples between device and provider rates', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1])
    const decoded = pcm16Base64ToFloat(floatToPcm16Base64(samples))
    decoded.forEach((value, index) => expect(Math.abs(value - samples[index])).toBeLessThan(1e-3))
    expect(resampleFloat(new Float32Array(480), 48000, 24000)).toHaveLength(240)
    expect(resampleFloat(new Float32Array(441), 44100, 24000)).toHaveLength(240)
  })
})

describe('microphone and response recovery', () => {
  it('ignores completion and audio from an older cancelled response', () => {
    const onTurn = vi.fn()
    const { controller } = connected({ onTurn })
    controller.handleEvent({ type: 'response.created', response: { id: 'old' } })
    controller.handleEvent({ type: 'input_audio_buffer.speech_started' })
    controller.handleEvent({ type: 'response.created', response: { id: 'new' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', response_id: 'old', delta: 'discard me' })
    controller.handleEvent({ type: 'response.done', response: { id: 'old', status: 'cancelled' } })
    controller.handleEvent({ type: 'response.output_audio_transcript.delta', response_id: 'new', delta: 'The new answer.' })
    controller.handleEvent({ type: 'response.done', response: { id: 'new', status: 'completed' } })
    expect(onTurn).toHaveBeenCalledWith('assistant', 'The new answer.', undefined)
    expect(onTurn).toHaveBeenCalledTimes(1)
  })

  it('ends a failed session so Reconnect can actually start again', () => {
    const { controller } = connected()
    controller.handleEvent({ type: 'session.updated' })
    controller.handleEvent({ type: 'error', error: { message: 'upstream transport failed' } })
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, connection: 'disconnected', error: 'upstream transport failed' })
  })

  it('detects a dead capture graph and releases the mic instead of staying Listening', () => {
    vi.useFakeTimers()
    const controller = new GrokVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
    const node = { connect: vi.fn(), disconnect: vi.fn(), onaudioprocess: null as any }
    const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() }
    const track = { stop: vi.fn(), onended: null, readyState: 'live' }
    const context = { state: 'running', sampleRate: 48000, destination: {},
      createMediaStreamSource: () => node, createScriptProcessor: () => node, createGain: () => gain }
    vi.stubGlobal('AudioContext', vi.fn())
    Object.assign(controller, { context, stream: { getAudioTracks: () => [track], getTracks: () => [track] },
      ui: { ...controller.getSnapshot(), isActive: true, activity: 'listening' } })
    ;(controller as any).startCapture()
    expect(gain.gain.value).toBe(0)
    vi.advanceTimersByTime(5200)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, connection: 'disconnected' })
    expect(controller.getSnapshot().error).toMatch(/Microphone audio stopped/)
    expect(track.stop).toHaveBeenCalledOnce()
    expect(node.disconnect).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
