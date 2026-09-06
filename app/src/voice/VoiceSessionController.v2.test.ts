import { afterEach, describe, expect, it, vi } from 'vitest'
import { LAB_HOLDING_LINE, LAB_STILL_LOOKING_LINE, LAB_STILL_LOOKING_MS } from '../lab/labCompanion'
import { VoiceSessionController } from './VoiceSessionController'
import { LAB_BARGE_IN_MS, LAB_FORCE_RESPONSE_MS, LAB_MIC_SETTLE_MS, LAB_VOICE_GREETING } from './types'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceReaderContext } from './types'
import { VOICE_V2_FAILURE_LINE, VOICE_V2_FAILURE_NOTICE, type VoiceActivityPhase } from './v2/voiceV2'
import { SPEAK_COMPANION_VERBATIM_V2 } from '../lab/labVoiceV2'

const ANCHOR: AudioPlaybackAnchor = {
  bookId: 'odyssey',
  editionKey: 'original-en',
  chapterNumber: 5,
  paragraphIndex: 3,
  paragraphNumber: 4,
  offsetSeconds: 12.5,
}

const CONTEXT: VoiceReaderContext = {
  bookTitle: 'The Odyssey',
  bookAuthor: 'Homer',
  chapterLabel: 'Book 5',
}

type Snap = { state: string; activity: VoiceActivityPhase; error: string | null; isActive: boolean }

function audioEngine(pause: AudioPlaybackPause | null) {
  return {
    pausePlayback: vi.fn(() => pause),
    resumePlayback: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    skipPlayback: vi.fn(),
  }
}

function withWindowTimers() {
  vi.stubGlobal('window', {
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  })
}

type Sent = { type: string; response?: { instructions?: string }; item?: { output?: string } }

function harness(input: {
  version?: 'v1' | 'v2'
  wasPlaying?: boolean
  onCompanionAsk?: (question: string) => Promise<unknown>
  greet?: boolean
  audioTracks?: Array<{ enabled: boolean; kind?: string }>
} = {}) {
  const sent: Sent[] = []
  const snapshots: Snap[] = []
  const turns: Array<{ role: string; text: string; cancelled?: boolean }> = []
  const audio = audioEngine({ anchor: ANCHOR, wasPlaying: input.wasPlaying ?? true })
  const controller = new VoiceSessionController({
    onSnapshot: snapshot => snapshots.push({
      state: snapshot.state,
      activity: snapshot.activity,
      error: snapshot.error,
      isActive: snapshot.isActive,
    }),
    onTurn: (role, text, meta) => turns.push({ role, text, cancelled: meta?.cancelled }),
  })
  controller.testPrimeSession({
    audio,
    honorModelResume: true,
    voiceVersion: input.version ?? 'v2',
    send: data => sent.push(JSON.parse(data) as Sent),
    onCompanionAsk: input.onCompanionAsk as never,
    greet: input.greet,
    audioTracks: input.audioTracks,
    shouldResumeBook: input.wasPlaying ?? true,
  })
  const types = () => sent.map(item => item.type)
  const creates = () => sent.filter(item => item.type === 'response.create')
  const activity = () => controller.getSnapshot().activity
  return { controller, sent, snapshots, turns, audio, types, creates, activity }
}

/** The opening "I'm listening." plus its completion, so later turns are "second and later". */
function finishGreeting(h: ReturnType<typeof harness>) {
  h.controller.testRealtime({ type: 'response.created' })
  h.controller.testRealtime({ type: 'output_audio_buffer.started' })
  h.controller.testRealtime({ type: 'response.output_audio_transcript.done', transcript: LAB_VOICE_GREETING })
  h.controller.testRealtime({ type: 'response.done' })
  h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
  vi.advanceTimersByTime(LAB_MIC_SETTLE_MS)
  // The greeting's own response.create is not part of the turn under test.
  h.sent.length = 0
}

function userSays(h: ReturnType<typeof harness>, transcript: string) {
  h.controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
  vi.advanceTimersByTime(LAB_BARGE_IN_MS)
  h.controller.testRealtime({ type: 'conversation.item.input_audio_transcription.completed', transcript })
  h.controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
}

function assistantSpeaks(h: ReturnType<typeof harness>, transcript: string) {
  h.controller.testRealtime({ type: 'response.created' })
  h.controller.testRealtime({ type: 'output_audio_buffer.started' })
  h.controller.testRealtime({ type: 'response.output_audio_transcript.done', transcript })
  h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } })
  h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
}

describe('Voice V1 is untouched by the V2 preview', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reports activity idle for every V1 event and never cancels a silent response', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ version: 'v1', greet: true })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    // V1: a barge-in while the answer is still being prepared (no audio) does not cancel.
    h.sent.length = 0
    h.controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(h.types()).not.toContain('response.cancel')
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    h.controller.testRealtime({ type: 'response.done' })
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(h.snapshots.every(snapshot => snapshot.activity === 'idle')).toBe(true)
    expect(h.activity()).toBe('idle')
    expect(h.controller.getSnapshot().isActive).toBe(true)
  })

  it('still speaks the V1 cover line before the companion hop', async () => {
    withWindowTimers()
    const query = vi.fn(async () => 'Telemachus is being given a path.')
    const h = harness({ version: 'v1', onCompanionAsk: query })
    h.sent.length = 0
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_v1',
      arguments: '{"question":"what does this mean"}',
    })
    const covers = h.creates().filter(item => String(item.response?.instructions).includes(LAB_HOLDING_LINE))
    expect(covers).toHaveLength(1)
    expect(h.creates().some(item => String(item.response?.instructions).includes(SPEAK_COMPANION_VERBATIM_V2))).toBe(false)
    expect(h.activity()).toBe('idle')
  })

  it('ignores a data channel close and realtime errors keep their V1 shape', () => {
    withWindowTimers()
    const h = harness({ version: 'v1' })
    h.controller.testDataChannelClosed()
    expect(h.controller.getSnapshot().isActive).toBe(true)
    h.controller.testRealtime({ type: 'error', error: { message: 'Cancellation failed: no active response found' } })
    expect(h.snapshots.at(-1)?.error).toBe('Cancellation failed: no active response found')
  })
})

describe('Voice V2 status is event-driven', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reports Connecting from the first snapshot of start() and idle after a start failure', async () => {
    const snapshots: Snap[] = []
    const controller = new VoiceSessionController({
      onSnapshot: snapshot => snapshots.push({ state: snapshot.state, activity: snapshot.activity, error: snapshot.error, isActive: snapshot.isActive }),
      onTurn: () => { /* unused */ },
    })
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }) },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 500, ok: false, json: async () => ({ error: 'down' }) }))
    await controller.start({
      authToken: 'token',
      isAnonymous: false,
      labGuest: true,
      honorModelResume: true,
      voiceVersion: 'v2',
      context: CONTEXT,
      audio: audioEngine(null),
      wasPlaying: false,
    })
    expect(snapshots[0].activity).toBe('connecting')
    expect(snapshots.at(-1)).toMatchObject({ activity: 'idle', state: 'reading', error: 'down' })
  })

  it('walks Listening, Checking text, Preparing answer, Speaking, Listening from real events only', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    expect(h.activity()).toBe('listening')
    // The greeting is spoken, not "prepared" as an answer.
    h.controller.testRealtime({ type: 'response.created' })
    expect(h.activity()).toBe('listening')
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'response.output_audio_transcript.done', transcript: LAB_VOICE_GREETING })
    h.controller.testRealtime({ type: 'response.done' })
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    vi.advanceTimersByTime(LAB_MIC_SETTLE_MS)
    expect(h.activity()).toBe('listening')
    h.sent.length = 0

    h.controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    expect(h.activity()).toBe('listening')
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(h.activity()).toBe('listening')
    h.controller.testRealtime({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'Who is Calypso?' })
    h.controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    expect(h.activity()).toBe('checking_text')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    expect(h.creates()).toHaveLength(1)
    expect(h.activity()).toBe('checking_text')
    h.controller.testRealtime({ type: 'response.created' })
    expect(h.activity()).toBe('preparing_answer')
    h.controller.testRealtime({ type: 'response.output_audio.delta' })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(h.activity()).toBe('listening')

    const seen = h.snapshots.map(snapshot => snapshot.activity)
    expect(new Set(seen)).toEqual(new Set(['listening', 'speaking', 'checking_text', 'preparing_answer']))
    expect(h.controller.getSnapshot().isActive).toBe(true)
  })

  it('shows Checking text while the companion hop runs and Preparing answer once it returns', async () => {
    withWindowTimers()
    let finish: (value: string) => void = () => { /* pending */ }
    const query = vi.fn(() => new Promise<string>(resolve => { finish = resolve }))
    const h = harness({ onCompanionAsk: query })
    h.controller.testRealtime({ type: 'response.created' })
    expect(h.activity()).toBe('preparing_answer')
    const pending = h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_hop',
      arguments: '{"question":"what does this mean"}',
    })
    expect(h.activity()).toBe('checking_text')
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } })
    expect(h.activity()).toBe('checking_text')
    finish('Telemachus is being given a path.')
    await pending
    expect(h.activity()).toBe('preparing_answer')
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'response.done' })
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(h.activity()).toBe('listening')
  })
})

describe('Voice V2 companion hop resolves into exactly one answer', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('speaks no cover line and requests the verbatim answer exactly once', async () => {
    withWindowTimers()
    const query = vi.fn(async () => 'Telemachus is being given a path.')
    const h = harness({ onCompanionAsk: query })
    h.sent.length = 0
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_hop',
      arguments: '{"question":"what does this mean"}',
    })
    expect(query).toHaveBeenCalledWith('what does this mean')
    const creates = h.creates()
    expect(creates).toHaveLength(1)
    const instructions = String(creates[0].response?.instructions)
    expect(instructions).toContain(SPEAK_COMPANION_VERBATIM_V2)
    expect(instructions).toContain('Telemachus is being given a path.')
    expect(instructions).not.toMatch(/Good question|Let me look|Do not answer the question yet|the answer I received/i)
    const output = h.sent.find(item => item.type === 'conversation.item.create')
    expect(JSON.parse(String(output?.item?.output))).toEqual({
      ok: true,
      speak_verbatim: true,
      answer: 'Telemachus is being given a path.',
    })
    expect(h.audio.setPlaybackSpeed).not.toHaveBeenCalled()
    expect(h.audio.skipPlayback).not.toHaveBeenCalled()
  })

  it('accepts the structured V2 hop result', async () => {
    withWindowTimers()
    const query = vi.fn(async () => ({ status: 'completed', answer: 'Athena is beside him.', attempts: 2, stopReason: 'end_turn' }))
    const h = harness({ onCompanionAsk: query })
    h.sent.length = 0
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_struct',
      arguments: '{"question":"who is with him"}',
    })
    expect(h.creates()).toHaveLength(1)
    expect(String(h.creates()[0].response?.instructions)).toContain('Athena is beside him.')
  })

  it('says the explicit failure line once when the companion fails', async () => {
    withWindowTimers()
    const query = vi.fn(async () => ({ status: 'failed', answer: '', attempts: 2, stopReason: 'max_tokens', failureReason: 'incomplete' }))
    const h = harness({ onCompanionAsk: query })
    h.sent.length = 0
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_fail',
      arguments: '{"question":"what does this mean"}',
    })
    const creates = h.creates()
    expect(creates).toHaveLength(1)
    expect(String(creates[0].response?.instructions)).toContain(VOICE_V2_FAILURE_LINE)
    expect(String(creates[0].response?.instructions)).not.toMatch(/cut off/i)
    const output = h.sent.find(item => item.type === 'conversation.item.create')
    expect(JSON.parse(String(output?.item?.output))).toMatchObject({ ok: false, speak_verbatim: true, answer: VOICE_V2_FAILURE_LINE })
    expect(h.activity()).toBe('preparing_answer')
    assistantSpeaks(h, VOICE_V2_FAILURE_LINE)
    expect(h.activity()).toBe('listening')
    expect(h.controller.getSnapshot().isActive).toBe(true)
  })

  it('treats a thrown hop as a failure, not a silent drop', async () => {
    withWindowTimers()
    const query = vi.fn(async () => { throw new Error('network') })
    const h = harness({ onCompanionAsk: query })
    h.sent.length = 0
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_throw',
      arguments: '{"question":"what does this mean"}',
    })
    expect(h.creates()).toHaveLength(1)
    expect(String(h.creates()[0].response?.instructions)).toContain(VOICE_V2_FAILURE_LINE)
  })

  it('still reroutes a playback question the model sent to the companion by mistake', async () => {
    withWindowTimers()
    const query = vi.fn(async () => 'should not run')
    const h = harness({ onCompanionAsk: query })
    await h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_oops',
      arguments: '{"question":"go faster"}',
    })
    expect(query).not.toHaveBeenCalled()
    expect(h.audio.setPlaybackSpeed).toHaveBeenCalled()
  })

  it('lets a newer reader turn supersede a hop that was still checking', async () => {
    vi.useFakeTimers()
    withWindowTimers()
    let finish: (value: string) => void = () => { /* pending */ }
    const query = vi.fn(() => new Promise<string>(resolve => { finish = resolve }))
    const h = harness({ onCompanionAsk: query, greet: true })
    finishGreeting(h)
    userSays(h, 'What does this mean?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    const pending = h.controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_old',
      arguments: '{"question":"What does this mean?"}',
    })
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } })
    expect(h.activity()).toBe('checking_text')
    // The reader moves on before the companion returns.
    h.sent.length = 0
    userSays(h, 'Actually, who is Calypso?')
    finish('An answer to the old question.')
    await pending
    const outputs = h.sent.filter(item => item.type === 'conversation.item.create')
    expect(outputs).toHaveLength(1)
    expect(JSON.parse(String(outputs[0].item?.output))).toEqual({ ok: false, superseded: true })
    expect(h.creates().some(item => String(item.response?.instructions).includes('An answer to the old question.'))).toBe(false)
  })
})

describe('Voice V2 interruptions and long answers', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('cancels a spoken answer once on barge-in and answers the new turn exactly once', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const track = { enabled: true, kind: 'audio' }
    const h = harness({ greet: true, audioTracks: [track] })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    h.controller.testRealtime({ type: 'response.output_audio_transcript.delta', delta: 'Calypso is the nymph who ' })
    expect(h.activity()).toBe('speaking')

    h.sent.length = 0
    h.controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS - 100)
    expect(h.types()).not.toContain('response.cancel')
    expect(h.activity()).toBe('speaking')
    vi.advanceTimersByTime(100)
    expect(h.types().filter(type => type === 'response.cancel')).toHaveLength(1)
    expect(h.activity()).toBe('listening')
    h.controller.testRealtime({ type: 'response.done', response: { status: 'cancelled' } })
    expect(h.activity()).toBe('listening')
    expect(h.turns.at(-1)).toMatchObject({ role: 'assistant', text: 'Calypso is the nymph who', cancelled: true })
    expect(h.creates()).toHaveLength(0)

    h.controller.testRealtime({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'No, who is Athena?' })
    h.controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    expect(h.activity()).toBe('checking_text')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    expect(h.creates()).toHaveLength(1)
    expect(h.types().filter(type => type === 'response.cancel')).toHaveLength(1)
    assistantSpeaks(h, 'Athena is the goddess who backs him.')
    expect(h.creates()).toHaveLength(1)
    expect(h.activity()).toBe('listening')
    expect(h.snapshots.some(snapshot => snapshot.error)).toBe(false)
  })

  it('cancels an answer that is still being prepared when the reader speaks over it', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    expect(h.activity()).toBe('preparing_answer')
    h.sent.length = 0
    h.controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(h.types()).toContain('response.cancel')
    expect(h.activity()).toBe('listening')
  })

  it('completes a long multi-chunk answer once, through an audio pause, without truncation', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Explain the whole opening argument in depth.')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    const chunks = Array.from({ length: 12 }, (_, i) => `Sentence ${i + 1} of the long answer. `)
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    for (const [index, chunk] of chunks.entries()) {
      h.controller.testRealtime({ type: 'response.output_audio.delta' })
      h.controller.testRealtime({ type: 'response.output_audio_transcript.delta', delta: chunk })
      if (index === 5) {
        // A pause in playback mid-answer is not the end of the answer.
        h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
        expect(h.activity()).toBe('speaking')
        expect(h.controller.getSnapshot().state).toBe('answering')
        h.controller.testRealtime({ type: 'output_audio_buffer.started' })
      }
    }
    h.controller.testRealtime({ type: 'response.output_audio_transcript.done', transcript: chunks.join('').trim() })
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'message' }] } })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(h.activity()).toBe('listening')
    const assistant = h.turns.filter(turn => turn.role === 'assistant' && turn.text !== LAB_VOICE_GREETING)
    expect(assistant.at(-1)?.text).toBe(chunks.join('').trim())
    expect(assistant.at(-1)?.cancelled).toBeUndefined()
    expect(h.creates()).toHaveLength(1)
    expect(h.snapshots.some(snapshot => snapshot.error)).toBe(false)
    expect(h.snapshots.filter(snapshot => snapshot.activity === 'listening').length).toBeGreaterThan(0)
  })
})

describe('Voice V2 failures are explicit', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows a visible failure and returns to Listening when Realtime errors after a request', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    expect(h.creates()).toHaveLength(1)
    h.controller.testRealtime({ type: 'error', error: { message: 'The server had an error while processing your request' } })
    expect(h.snapshots.at(-1)).toMatchObject({ error: VOICE_V2_FAILURE_NOTICE, activity: 'listening', isActive: true })
    expect(h.activity()).toBe('listening')
  })

  it('does not surface the benign echo of its own cancel as a failure', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    const before = h.snapshots.length
    h.controller.testRealtime({ type: 'error', error: { message: 'Cancellation failed: no active response found' } })
    expect(h.snapshots.length).toBe(before)
    expect(h.activity()).toBe('listening')
  })

  it('shows a visible failure when a response fails before speaking', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'response.done', response: { status: 'failed' } })
    expect(h.snapshots.at(-1)).toMatchObject({ error: VOICE_V2_FAILURE_NOTICE, activity: 'listening', isActive: true })
  })

  it('reports a silent response to a live request instead of hanging on Preparing answer', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Who is Calypso?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    expect(h.activity()).toBe('preparing_answer')
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [] } })
    expect(h.activity()).toBe('listening')
    expect(h.snapshots.at(-1)?.error).toBe(VOICE_V2_FAILURE_NOTICE)
  })

  it('ends the session with a visible error when the data channel closes', () => {
    withWindowTimers()
    const h = harness({ wasPlaying: true })
    h.controller.testDataChannelClosed()
    expect(h.snapshots.at(-1)).toMatchObject({ state: 'reading', activity: 'idle', error: 'Connection lost.', isActive: false })
    expect(h.audio.resumePlayback).toHaveBeenCalledTimes(1)
  })
})

describe('Voice V2 explicit goodbye', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not end the session on a bare thanks', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'Thanks.')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    assistantSpeaks(h, 'Any time.')
    expect(h.controller.getSnapshot().state).not.toBe('reading')
    expect(h.controller.getSnapshot().isActive).toBe(true)
    expect(h.activity()).toBe('listening')
    expect(h.audio.resumePlayback).not.toHaveBeenCalled()
  })

  it('ends after one spoken sign-off on an explicit goodbye', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, "Okay thanks, that's it for now.")
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    expect(h.creates()).toHaveLength(1)
    expect(h.controller.getSnapshot().state).not.toBe('reading')
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(h.activity()).toBe('speaking')
    h.controller.testRealtime({ type: 'response.function_call_arguments.done', name: 'end_voice_session', call_id: 'call_end' })
    h.controller.testRealtime({ type: 'response.output_audio_transcript.done', transcript: 'Goodbye for now.' })
    h.controller.testRealtime({ type: 'response.done' })
    expect(h.controller.getSnapshot().state).not.toBe('reading')
    h.controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(h.controller.getSnapshot()).toMatchObject({ state: 'reading', activity: 'idle', isActive: false })
    expect(h.creates()).toHaveLength(1)
    expect(h.audio.resumePlayback).toHaveBeenCalledTimes(1)
    const listeningAfterEnd = h.snapshots.slice(h.snapshots.findIndex(snapshot => snapshot.state === 'reading'))
    expect(listeningAfterEnd.every(snapshot => snapshot.activity === 'idle')).toBe(true)
  })

  it('requests exactly one sign-off when the model ends the session without speaking', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true, wasPlaying: false })
    finishGreeting(h)
    userSays(h, 'Bye.')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'response.function_call_arguments.done', name: 'end_voice_session', call_id: 'call_end_silent' })
    h.sent.length = 0
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } })
    expect(h.creates()).toHaveLength(1)
    expect(String(h.creates()[0].response?.instructions)).toContain('one short natural goodbye')
    expect(h.controller.getSnapshot().state).not.toBe('reading')
    assistantSpeaks(h, 'Goodbye.')
    expect(h.controller.getSnapshot()).toMatchObject({ state: 'reading', activity: 'idle', isActive: false })
    expect(h.creates()).toHaveLength(1)
    expect(h.audio.resumePlayback).not.toHaveBeenCalled()
  })

  it('does not honor end_voice_session for a question that merely mentions goodbye', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const h = harness({ greet: true })
    finishGreeting(h)
    userSays(h, 'What does goodbye mean here?')
    vi.advanceTimersByTime(LAB_FORCE_RESPONSE_MS)
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'response.function_call_arguments.done', name: 'end_voice_session', call_id: 'call_end_wrong' })
    h.controller.testRealtime({ type: 'response.done', response: { status: 'completed', output: [{ type: 'function_call' }] } })
    expect(h.controller.getSnapshot().isActive).toBe(true)
  })
})

describe('Voice V2 hop stays silent and every book question reaches the companion', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('produces no response.create during the hop except one "still looking" line after 6 s', async () => {
    vi.useFakeTimers()
    withWindowTimers()
    let resolveHop: (value: string) => void = () => { /* pending */ }
    const query = vi.fn(() => new Promise<string>(resolve => { resolveHop = resolve }))
    const h = harness({ onCompanionAsk: query })
    h.sent.length = 0
    const hop = h.controller.testRealtime({ type: 'response.function_call_arguments.done', name: 'ask_companion', call_id: 'call_v2_hold', arguments: '{"question":"But what does the king want?"}' })
    await Promise.resolve()
    expect(h.creates()).toHaveLength(0)
    await h.controller.testRealtime({ type: 'response.function_call_arguments.done', name: 'hold_voice_session', call_id: 'call_stray' })
    expect(h.creates()).toHaveLength(0)
    vi.advanceTimersByTime(LAB_STILL_LOOKING_MS + 1)
    expect(h.creates()).toHaveLength(1)
    expect(String(h.creates()[0].response?.instructions)).toContain(LAB_STILL_LOOKING_LINE)
    resolveHop('He wants reassurance without cost.')
    await hop
    expect(h.creates()).toHaveLength(2)
    expect(String(h.creates()[1].response?.instructions)).toContain(SPEAK_COMPANION_VERBATIM_V2)
    expect(String(h.creates()[1].response?.instructions)).toContain('He wants reassurance without cost.')
    expect(h.creates().every(item => !/waiting on|full explanation|don't want to invent/i.test(String(item.response?.instructions)))).toBe(true)
    expect(h.activity()).toBe('preparing_answer')
  })

  it('cancels a Realtime self-answer and routes the short question to the companion', async () => {
    vi.useFakeTimers()
    withWindowTimers()
    const query = vi.fn(async () => 'Zedekiah wants a safe word from God.')
    const h = harness({ onCompanionAsk: query })
    finishGreeting(h)
    userSays(h, 'But what does the king want?')
    expect(query).not.toHaveBeenCalled()
    h.controller.testRealtime({ type: 'response.created' })
    h.controller.testRealtime({ type: 'response.output_audio_transcript.delta', delta: 'Great catch. I only have what is here' })
    await vi.advanceTimersByTimeAsync(0)
    expect(h.types()).toContain('response.cancel')
    expect(query).toHaveBeenCalledTimes(1)
    expect(String(query.mock.calls[0][0])).toBe('But what does the king want?')
    expect(h.turns.some(turn => turn.role === 'assistant' && turn.text.includes('Great catch'))).toBe(false)
    const spoken = h.creates().at(-1)
    expect(String(spoken?.response?.instructions)).toContain(SPEAK_COMPANION_VERBATIM_V2)
    expect(String(spoken?.response?.instructions)).toContain('Zedekiah wants a safe word from God.')
    expect(h.activity()).toBe('preparing_answer')
  })
})
