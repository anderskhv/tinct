import { afterEach, describe, expect, it, vi } from 'vitest'
import { VoiceSessionController } from './VoiceSessionController'
import { LAB_AUDIO_CONSTRAINTS, LAB_BARGE_IN_MS, LAB_MIC_SETTLE_MS, LAB_SEMANTIC_VAD_EAGERNESS, LAB_STUCK_LISTENING_MS, LAB_VAD_CREATE_RESPONSE, LAB_VAD_INTERRUPT_RESPONSE, LAB_VOICE_GREETING } from './types'
import type { AudioPlaybackAnchor, AudioPlaybackPause, VoiceReaderContext } from './types'

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

function makeController() {
  const snapshots: Array<{ error: string | null; state: string }> = []
  const controller = new VoiceSessionController({
    onSnapshot: snapshot => snapshots.push({ error: snapshot.error, state: snapshot.state }),
    onTurn: () => { /* unused */ },
  })
  return { controller, snapshots }
}

function audioEngine(pause: AudioPlaybackPause | null) {
  return {
    pausePlayback: vi.fn(() => pause),
    resumePlayback: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    skipPlayback: vi.fn(),
  }
}

describe('VoiceSessionController start failure', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('cancels connecting before getUserMedia resolves', async () => {
    let resolveMedia: (stream: { getTracks: () => Array<{ stop: () => void }> }) => void = () => { /* pending */ }
    const stopTrack = vi.fn()
    const getUserMedia = vi.fn().mockImplementation(() => new Promise(resolve => {
      resolveMedia = resolve
    }))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia },
    })

    const { controller } = makeController()
    const starting = controller.start({
      authToken: 'token',
      isAnonymous: false,
      context: CONTEXT,
      audio: audioEngine(null),
      wasPlaying: false,
    })
    controller.stop()
    resolveMedia({ getTracks: () => [{ stop: stopTrack }] })
    await starting

    expect(stopTrack).toHaveBeenCalled()
    expect(controller.getSnapshot().isActive).toBe(false)
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('does not call /api/voice-session without a bearer token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    })

    const { controller } = makeController()
    await controller.start({
      authToken: null,
      isAnonymous: true,
      context: CONTEXT,
      audio: audioEngine(null),
      wasPlaying: false,
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
    expect(controller.getSnapshot().isActive).toBe(false)
  })

  it('posts /api/lab-voice-session without a bearer when labGuest', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'unused' }),
    })
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [] })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia },
    })

    const { controller } = makeController()
    await controller.start({
      authToken: null,
      isAnonymous: true,
      labGuest: true,
      context: CONTEXT,
      audio: audioEngine(null),
      wasPlaying: false,
    })

    expect(fetchMock).toHaveBeenCalled()
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/lab-voice-session')
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  it('resumes the book after a failed getUserMedia when Ask paused playback', async () => {
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Requested device not found', 'NotFoundError')),
      },
    })

    const { controller, snapshots } = makeController()
    await controller.start({
      authToken: 'token',
      isAnonymous: false,
      context: CONTEXT,
      audio,
      wasPlaying: false,
    })

    expect(audio.pausePlayback).toHaveBeenCalledTimes(1)
    expect(audio.resumePlayback).toHaveBeenCalledWith(ANCHOR)
    expect(controller.getSnapshot().state).toBe('reading')
    expect(controller.getSnapshot().isActive).toBe(false)
    expect(snapshots.some(s => s.error === "Couldn't start voice. Try again.")).toBe(true)
  })

  it('resumes after a failed start when React said it was playing even if the pause report is stale', async () => {
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: false })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('getUserMedia failed')),
      },
    })

    const { controller, snapshots } = makeController()
    await controller.start({
      authToken: 'token',
      isAnonymous: false,
      context: CONTEXT,
      audio,
      wasPlaying: true,
    })

    expect(audio.resumePlayback).toHaveBeenCalledWith(ANCHOR)
    expect(snapshots.some(s => s.error === "Couldn't start voice. Try again.")).toBe(true)
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('does not start playback after a failed start if the book was already paused', async () => {
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: false })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Requested device not found', 'NotFoundError')),
      },
    })

    const { controller } = makeController()
    await controller.start({
      authToken: 'token',
      isAnonymous: false,
      context: CONTEXT,
      audio,
      wasPlaying: false,
    })

    expect(audio.pausePlayback).toHaveBeenCalledTimes(1)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('restores the book after a voice-session token failure', async () => {
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
      },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({ error: 'Voice is not available right now.' }),
    }))

    const { controller } = makeController()
    await controller.start({
      authToken: 'token',
      isAnonymous: false,
      context: CONTEXT,
      audio,
      wasPlaying: true,
    })

    expect(audio.resumePlayback).toHaveBeenCalledWith(ANCHOR)
    expect(controller.getSnapshot().isActive).toBe(false)
  })
})

describe('VoiceSessionController production continuity', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not end an idle session even after ten minutes', () => {
    vi.useFakeTimers()
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })

    expect(controller.getSnapshot().state).toBe('conversation_idle')
    vi.advanceTimersByTime(10 * 60_000)
    expect(controller.getSnapshot().state).toBe('conversation_idle')
    expect(audio.resumePlayback).not.toHaveBeenCalled()
  })

  it('uses balanced semantic VAD for faster natural turn detection', () => {
    const sent: string[] = []
    const { controller } = makeController()
    controller.testPrimeSession({
      audio: audioEngine({ anchor: ANCHOR, wasPlaying: true }),
      context: CONTEXT,
      send: data => sent.push(data),
    })

    const update = sent.map(item => JSON.parse(item)).find(item => item.type === 'session.update')
    expect(update?.session?.audio?.input?.turn_detection).toEqual({
      type: 'semantic_vad',
      eagerness: 'auto',
      interrupt_response: true,
      create_response: true,
    })
  })

  it('adds application-owned controls to the production tool set', () => {
    const sent: string[] = []
    const { controller } = makeController()
    controller.testPrimeSession({
      audio: audioEngine({ anchor: ANCHOR, wasPlaying: true }),
      context: CONTEXT,
      send: data => sent.push(data),
      applicationTools: [{
        type: 'function',
        name: 'open_tinct_view',
        parameters: { type: 'object', properties: {} },
      }],
    })

    const update = sent.map(item => JSON.parse(item)).find(item => item.type === 'session.update')
    expect(update.session.tools.map((tool: { name: string }) => tool.name)).toEqual([
      'resume_audiobook',
      'end_voice_session',
      'hold_voice_session',
      'open_tinct_view',
    ])
  })

  it('executes an application tool, attaches its output, and asks for a short spoken result', async () => {
    const sent: string[] = []
    const onApplicationTool = vi.fn(async () => ({
      output: { ok: true, view: 'library' },
      responseInstructions: 'Say the Library is open.',
    }))
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
      onApplicationTool,
    })
    controller.testPrimeSession({
      audio: audioEngine({ anchor: ANCHOR, wasPlaying: true }),
      context: CONTEXT,
      send: data => sent.push(data),
      applicationTools: [{ type: 'function', name: 'open_tinct_view' }],
    })

    await controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'open_tinct_view',
      call_id: 'call-library',
      arguments: JSON.stringify({ view: 'library' }),
    })

    expect(onApplicationTool).toHaveBeenCalledWith('open_tinct_view', { view: 'library' }, 'call-library')
    const events = sent.map(item => JSON.parse(item))
    expect(events).toContainEqual(expect.objectContaining({
      type: 'conversation.item.create',
      item: expect.objectContaining({
        type: 'function_call_output',
        call_id: 'call-library',
        output: JSON.stringify({ handled_by: 'tinct', ok: true, view: 'library' }),
      }),
    }))
    expect(events).toContainEqual({
      type: 'response.create',
      response: { instructions: 'Say the Library is open.' },
    })
  })

  it('reports first-audio latency separately for the first and second turns', () => {
    let clock = 100
    vi.stubGlobal('performance', { now: () => clock })
    const samples: Array<{ kind: string; turnNumber?: number; speechStoppedToFirstAudioMs?: number }> = []
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
      onLatency: sample => samples.push(sample),
    })
    controller.testPrimeSession({ audio: audioEngine({ anchor: ANCHOR, wasPlaying: true }) })

    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    clock = 375
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.output_audio.delta', delta: 'ignored' })

    clock = 500
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    clock = 690
    controller.testRealtime({ type: 'response.output_audio.delta', delta: 'ignored' })

    expect(samples).toMatchObject([
      { kind: 'turn', turnNumber: 1, speechStoppedToFirstAudioMs: 275 },
      { kind: 'turn', turnNumber: 2, speechStoppedToFirstAudioMs: 190 },
    ])
  })

  it('updates passage context without ending voice or jumping back to an old chapter', () => {
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      context: { ...CONTEXT, bookId: 'odyssey', chapterNumber: 5 },
    })

    controller.updateContext({ ...CONTEXT, bookId: 'odyssey', chapterNumber: 6, chapterLabel: 'Book 6' })
    expect(controller.getSnapshot().isActive).toBe(true)
    controller.explicitResume()
    expect(audio.resumePlayback).not.toHaveBeenCalled()
  })
})

describe('VoiceSessionController lab honor resume', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function withWindowTimers() {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
  }

  it('does not resume on the resume_audiobook tool instant in lab', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_1',
    })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('resumes after assistant speech ends', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_1',
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'response.done' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('does not resume at 1.5s if she has not started the closing line', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_1',
    })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1500)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('resumes after 4s idle only if she never starts speaking', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_1',
    })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3999)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(audio.resumePlayback).toHaveBeenCalled()
  })

  it('cancels idle on speech_start and waits for speech_end', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_1',
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    vi.advanceTimersByTime(4000)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).toHaveBeenCalled()
  })

  it('resumes after the spoken closing line even when the book was not marked playing', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: false })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true, shouldResumeBook: false })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'resume_audiobook',
      call_id: 'call_spoken',
    })
    expect(audio.resumePlayback).toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('does not resume on output_audio_buffer.stopped before the resume_audiobook tool', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
  })

  it('does not resume from a thanks transcript on lab', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'thanks',
    })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('ends Talk after a spoken goodbye and restores an audiobook that was playing', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: "Okay thanks, that's it for now.",
    })
    expect(controller.getSnapshot().state).not.toBe('reading')
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(controller.getSnapshot().state).toBe('reading')
    expect(audio.resumePlayback).toHaveBeenCalledTimes(1)
  })

  it('ends Talk after bye without starting an audiobook that was already paused', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: false })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true, shouldResumeBook: false })
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'Bye.',
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(controller.getSnapshot().state).toBe('reading')
    expect(audio.resumePlayback).not.toHaveBeenCalled()
  })

  it('applies set_playback_speed on the lab honor path', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    expect(audio.setPlaybackSpeed).toHaveBeenCalledWith(2)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('creates a spoken confirm after set_playback_speed and does not resume yet', () => {
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    sent.length = 0
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    const created = sent.map(item => JSON.parse(item)).filter(item => item.type === 'response.create')
    expect(created).toHaveLength(1)
    expect(created[0].response.instructions).toContain('Confirm the change')
    expect(created[0].response.instructions).not.toContain('Do not resume the book')
    expect(audio.setPlaybackSpeed).toHaveBeenCalledWith(2)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('resumes after set_playback_speed confirm speech_end', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    expect(audio.setPlaybackSpeed).toHaveBeenCalledWith(2)
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'response.done' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('moves next_chapter and plays after confirm speech_end', () => {
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    sent.length = 0
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'next_chapter',
      call_id: 'call_next',
    })
    expect(audio.skipPlayback).toHaveBeenCalledWith('next_chapter')
    const created = sent.map(item => JSON.parse(item)).filter(item => item.type === 'response.create')
    expect(created).toHaveLength(1)
    expect(created[0].response.instructions).toContain('Confirm the change')
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).toHaveBeenCalled()
    expect(controller.getSnapshot().state).toBe('reading')
  })

  it('does not start the book after a plain question speech_end', () => {
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true, shouldResumeBook: false })
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'who is Abraham',
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    expect(audio.skipPlayback).not.toHaveBeenCalled()
    expect(audio.setPlaybackSpeed).not.toHaveBeenCalled()
    expect(controller.getSnapshot().state).not.toBe('reading')
  })

  it('updates her Realtime audio.output.speed without touching the book', () => {
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      context: CONTEXT,
      send: (data) => sent.push(data),
    })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_assistant_pace',
      call_id: 'call_pace',
      arguments: '{"pace":"slow"}',
    })
    expect(controller.testAssistantPace()).toBe('slow')
    expect(audio.setPlaybackSpeed).not.toHaveBeenCalled()
    const update = sent.map(item => JSON.parse(item)).filter(item => item.type === 'session.update').at(-1)
    expect(update?.session?.audio?.output?.speed).toBe(0.8)
    expect(sent.map(item => JSON.parse(item)).some(item => item.type === 'response.create')).toBe(true)
  })

  it('resumes after set_playback_speed idle only if she never starts speaking', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: true })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    expect(audio.setPlaybackSpeed).toHaveBeenCalledWith(2)
    vi.advanceTimersByTime(3999)
    expect(audio.resumePlayback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(audio.resumePlayback).toHaveBeenCalled()
  })
})

describe('VoiceSessionController hung user turn', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function withWindowTimers() {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
  }

  it('creates a response after speech_stopped if the server did not', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    expect(controller.getSnapshot().state).toBe('conversation_idle')
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(false)
    vi.advanceTimersByTime(250)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(true)
  })

  it('does not send response.create if the server already did', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    controller.testRealtime({ type: 'response.created' })
    vi.advanceTimersByTime(250)
    expect(sent.filter(item => JSON.parse(item).type === 'response.create')).toHaveLength(0)
  })

  it('force-ends a stuck listening turn after 6s with no speech_stopped', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(controller.getSnapshot().state).toBe('listening')
    expect(controller.getSnapshot().userSpeechStarted).toBe(true)
    vi.advanceTimersByTime(LAB_STUCK_LISTENING_MS - 1)
    expect(controller.getSnapshot().state).toBe('listening')
    vi.advanceTimersByTime(2)
    expect(controller.getSnapshot().state).toBe('conversation_idle')
    expect(sent.some(item => JSON.parse(item).type === 'input_audio_buffer.commit')).toBe(true)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(true)
  })

  it('sends calmer lab VAD on session.update', () => {
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      context: CONTEXT,
      send: (data) => sent.push(data),
    })
    controller.setAssistantPace('normal')
    const update = sent.map(item => JSON.parse(item)).find(item => item.type === 'session.update')
    const vad = update?.session?.audio?.input?.turn_detection
    expect(vad).toEqual({
      type: 'semantic_vad',
      eagerness: LAB_SEMANTIC_VAD_EAGERNESS,
      interrupt_response: LAB_VAD_INTERRUPT_RESPONSE,
      create_response: LAB_VAD_CREATE_RESPONSE,
    })
    expect(update?.session?.audio?.input?.noise_reduction).toEqual({ type: 'far_field' })
    expect(LAB_SEMANTIC_VAD_EAGERNESS).toBe('low')
    expect(LAB_VAD_INTERRUPT_RESPONSE).toBe(false)
    expect(LAB_VAD_CREATE_RESPONSE).toBe(false)
    expect(LAB_BARGE_IN_MS).toBe(500)
    expect(LAB_MIC_SETTLE_MS).toBe(500)
    expect(LAB_STUCK_LISTENING_MS).toBe(6000)
    expect(LAB_AUDIO_CONSTRAINTS).toEqual({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
    })
  })
})


describe('VoiceSessionController lab barge-in', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function withWindowTimers() {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
  }

  function speakingController() {
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    return { controller, sent, turns, audio }
  }

  it('does not interrupt her for speech_started shorter than 500ms', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const { controller, sent, turns } = speakingController()
    expect(controller.getSnapshot().state).toBe('answering')
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS - 1)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    expect(controller.getSnapshot().state).toBe('answering')
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(false)
    expect(sent.some(item => JSON.parse(item).type === 'input_audio_buffer.clear')).toBe(true)
    vi.advanceTimersByTime(250)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(false)
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'oh está',
    })
    expect(turns).toEqual([])
    expect(controller.getSnapshot().state).toBe('answering')
  })

  function finishFirstAssistant(controller: VoiceSessionController) {
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
  }

  it('ignores short and long barge-in through the first assistant response', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const track = { enabled: true, kind: 'audio' }
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      audioTracks: [track],
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(controller.getSnapshot().state).toBe('answering')
    expect(track.enabled).toBe(false)
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS - 1)
    expect(controller.getSnapshot().state).toBe('answering')
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    vi.advanceTimersByTime(800)
    expect(controller.getSnapshot().state).toBe('answering')
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    expect(sent.filter(item => JSON.parse(item).type === 'response.create')).toHaveLength(0)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    vi.advanceTimersByTime(250)
    expect(controller.getSnapshot().state).toBe('answering')
    expect(sent.filter(item => JSON.parse(item).type === 'response.create')).toHaveLength(0)
  })

  it('does not treat user audio as a turn before session.update', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      sessionVadReady: false,
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS + 50)
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    expect(sent.some(item => JSON.parse(item).type === 'session.update')).toBe(false)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(false)
    controller.setAssistantPace('normal')
    expect(sent.some(item => JSON.parse(item).type === 'session.update')).toBe(true)
    const vad = sent.map(item => JSON.parse(item)).find(item => item.type === 'session.update')
      ?.session?.audio?.input?.turn_detection
    expect(vad.interrupt_response).toBe(false)
    expect(vad.create_response).toBe(false)
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(controller.getSnapshot().state).toBe('listening')
    expect(controller.getSnapshot().userSpeechStarted).toBe(true)
  })

  it('clears leftover input audio after the first committed user turn', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
    })
    sent.length = 0
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    const types = sent.map(item => JSON.parse(item).type)
    expect(types).toContain('input_audio_buffer.clear')
    expect(types.indexOf('input_audio_buffer.clear')).toBeLessThan(
      types.includes('response.create') ? types.indexOf('response.create') : types.length,
    )
  })

  it('ignores 400ms and cancels her after 600ms on the second and later turns', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const track = { enabled: true, kind: 'audio' }
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      audioTracks: [track],
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(track.enabled).toBe(false)
    finishFirstAssistant(controller)
    vi.advanceTimersByTime(LAB_MIC_SETTLE_MS)
    expect(track.enabled).toBe(true)

    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(controller.getSnapshot().state).toBe('answering')
    expect(track.enabled).toBe(true)
    sent.length = 0
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(400)
    expect(controller.getSnapshot().state).toBe('answering')
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    expect(sent.some(item => JSON.parse(item).type === 'response.cancel')).toBe(false)
    vi.advanceTimersByTime(200)
    expect(controller.getSnapshot().state).toBe('listening')
    expect(controller.getSnapshot().userSpeechStarted).toBe(true)
    expect(track.enabled).toBe(true)
    const types = sent.map(item => JSON.parse(item).type)
    expect(types).toContain('response.cancel')
    expect(types).toContain('output_audio_buffer.clear')
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'Who is Calypso?',
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    vi.advanceTimersByTime(250)
    expect(turns.filter(item => item.role === 'user')).toEqual([
      { role: 'user', text: 'Who is Calypso?' },
    ])
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(true)

    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(track.enabled).toBe(true)
    sent.length = 0
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(400)
    expect(sent.some(item => JSON.parse(item).type === 'response.cancel')).toBe(false)
    vi.advanceTimersByTime(200)
    expect(sent.map(item => JSON.parse(item).type)).toContain('response.cancel')
    expect(sent.map(item => JSON.parse(item).type)).toContain('output_audio_buffer.clear')
  })
})

describe('VoiceSessionController lab greeting and cancel', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function withWindowTimers() {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
  }

  it('creates the greeting with no user audio', () => {
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      greet: true,
    })
    const created = sent.map(item => JSON.parse(item)).filter(item => item.type === 'response.create')
    expect(created).toHaveLength(1)
    expect(created[0].response.instructions).toContain(LAB_VOICE_GREETING)
    expect(created[0].response.instructions).toContain('Do not call any tools')
    expect(sent.filter(item => JSON.parse(item).type === 'session.update')).toHaveLength(1)
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({
      type: 'response.output_audio_transcript.done',
      transcript: LAB_VOICE_GREETING,
    })
    expect(turns).toEqual([{ role: 'assistant', text: LAB_VOICE_GREETING }])
    expect(controller.getSnapshot().state).toBe('answering')
    expect(created[0].response.instructions).toContain('Do not greet')
    expect(created[0].response.instructions).toContain('Do not say hello')
    const session = sent.map(item => JSON.parse(item)).find(item => item.type === 'session.update')
    expect(session?.session?.instructions).not.toMatch(/Hey there/i)
    expect(session?.session?.instructions).not.toContain(LAB_VOICE_GREETING)
  })

  it('does not glue the greeting when both transcript event names fire', () => {
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      greet: true,
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({
      type: 'response.output_audio_transcript.delta',
      delta: LAB_VOICE_GREETING,
    })
    controller.testRealtime({
      type: 'response.audio_transcript.delta',
      delta: LAB_VOICE_GREETING,
    })
    controller.testRealtime({
      type: 'response.output_audio_transcript.done',
      transcript: LAB_VOICE_GREETING,
    })
    controller.testRealtime({
      type: 'response.audio_transcript.done',
      transcript: LAB_VOICE_GREETING,
    })
    expect(turns.every(item => item.text === LAB_VOICE_GREETING)).toBe(true)
    expect(turns.some(item => item.text === `${LAB_VOICE_GREETING}${LAB_VOICE_GREETING}`)).toBe(false)
    expect(sent.map(item => JSON.parse(item)).filter(item => item.type === 'response.create')).toHaveLength(1)
  })

  it('does not append leftover listening after the greeting', () => {
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      greet: true,
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({
      type: 'response.output_audio_transcript.delta',
      delta: LAB_VOICE_GREETING,
    })
    controller.testRealtime({
      type: 'response.output_audio_transcript.delta',
      delta: ' listening.',
    })
    controller.testRealtime({
      type: 'response.output_audio_transcript.done',
      transcript: `${LAB_VOICE_GREETING} listening.`,
    })
    expect(turns.every(item => item.text === LAB_VOICE_GREETING)).toBe(true)
    expect(turns.some(item => item.text.includes('listening. listening'))).toBe(false)
    expect(sent.map(item => JSON.parse(item)).filter(item => item.type === 'response.create')).toHaveLength(1)
  })

  it('does not treat the first real question after the greeting as the first-turn lock', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const track = { enabled: true, kind: 'audio' }
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: () => { /* unused */ },
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      greet: true,
      audioTracks: [track],
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    expect(track.enabled).toBe(false)
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS + 50)
    expect(controller.getSnapshot().userSpeechStarted).toBe(false)
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    vi.advanceTimersByTime(LAB_MIC_SETTLE_MS)
    expect(track.enabled).toBe(true)
    sent.length = 0
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    expect(controller.getSnapshot().state).toBe('listening')
    expect(controller.getSnapshot().userSpeechStarted).toBe(true)
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    vi.advanceTimersByTime(250)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(true)
  })

  it('keeps streamed assistant text on cancel and still creates the next response', () => {
    vi.useFakeTimers()
    withWindowTimers()
    const sent: string[] = []
    const turns: Array<{ role: string; text: string }> = []
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const controller = new VoiceSessionController({
      onSnapshot: () => { /* unused */ },
      onTurn: (role, text) => turns.push({ role, text }),
    })
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      greet: true,
    })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({
      type: 'response.output_audio_transcript.done',
      transcript: LAB_VOICE_GREETING,
    })
    controller.testRealtime({ type: 'response.done' })
    controller.testRealtime({ type: 'output_audio_buffer.stopped' })
    vi.advanceTimersByTime(LAB_MIC_SETTLE_MS)
    controller.testRealtime({ type: 'input_audio_buffer.speech_started' })
    vi.advanceTimersByTime(LAB_BARGE_IN_MS)
    controller.testRealtime({
      type: 'conversation.item.input_audio_transcription.completed',
      transcript: 'Why is this book interesting for gardening?',
    })
    controller.testRealtime({ type: 'input_audio_buffer.speech_stopped' })
    controller.testRealtime({ type: 'response.created' })
    controller.testRealtime({ type: 'output_audio_buffer.started' })
    controller.testRealtime({ type: 'response.output_audio_transcript.delta', delta: 'Absolutely, the opening ' })
    controller.testRealtime({ type: 'response.output_audio_transcript.delta', delta: 'is about homecoming.' })
    sent.length = 0
    controller.testRealtime({
      type: 'response.done',
      response: { status: 'cancelled' },
    })
    const assistantTurns = turns.filter(item => item.role === 'assistant')
    const userTurns = turns.filter(item => item.role === 'user')
    expect(assistantTurns.some(item => item.text === LAB_VOICE_GREETING)).toBe(true)
    expect(assistantTurns.at(-1)?.text).toBe('Absolutely, the opening is about homecoming.')
    expect(userTurns).toEqual([{ role: 'user', text: 'Why is this book interesting for gardening?' }])
    expect(assistantTurns.every(item => !item.text.includes('gardening'))).toBe(true)
    expect(sent.some(item => JSON.parse(item).type === 'response.create')).toBe(true)
  })
})

describe('VoiceSessionController production ignores lab speed tool', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not apply set_playback_speed without the lab honor flag', () => {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({ audio, honorModelResume: false })
    controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    expect(audio.setPlaybackSpeed).not.toHaveBeenCalled()
    expect(audio.resumePlayback).not.toHaveBeenCalled()
  })
})


describe('VoiceSessionController ask_companion hop', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function withWindowTimers() {
    vi.stubGlobal('window', {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    })
  }

  it('covers then tells her to speak the companion answer', async () => {
    withWindowTimers()
    const sent: string[] = []
    const query = vi.fn(async () => 'Telemachus is being given a path.')
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      onCompanionAsk: query,
    })
    sent.length = 0
    await controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_hop',
      arguments: '{"question":"what does this mean"}',
    })
    const events = sent.map(item => JSON.parse(item))
    const covers = events.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('Do not answer the question yet'))
    const spoken = events.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('Telemachus is being given a path.'))
    const output = events.find(item => item.type === 'conversation.item.create')
    expect(query).toHaveBeenCalledWith('what does this mean', expect.any(Object))
    expect(covers).toHaveLength(1)
    expect(covers[0].response.instructions).toContain('Let me look at the passage.')
    expect(output.item.output).toContain('Telemachus is being given a path.')
    expect(spoken).toHaveLength(1)
    expect(spoken[0].response.instructions).toContain('Do not invent a thinner substitute')
    expect(audio.setPlaybackSpeed).not.toHaveBeenCalled()
    expect(audio.skipPlayback).not.toHaveBeenCalled()
  })

  it('does not call the companion for playback tools', async () => {
    withWindowTimers()
    const query = vi.fn(async () => 'should not run')
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      onCompanionAsk: query,
    })
    await controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'set_playback_speed',
      call_id: 'call_speed',
      arguments: '{"rate":2}',
    })
    await controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'next_chapter',
      call_id: 'call_next',
      arguments: '{}',
    })
    expect(query).not.toHaveBeenCalled()
    expect(audio.setPlaybackSpeed).toHaveBeenCalledWith(2)
    expect(audio.skipPlayback).toHaveBeenCalledWith('next_chapter')
  })

  it('starts speaking the first sentence before the hop finishes', async () => {
    withWindowTimers()
    const sent: string[] = []
    let finish: (value: string) => void = () => { /* pending */ }
    const query = vi.fn((_question: string, notify?: { onFirstSpeakable?: (text: string) => void }) => {
      notify?.onFirstSpeakable?.('Athena is already beside him.')
      return new Promise<string>(resolve => { finish = resolve })
    })
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      onCompanionAsk: query,
    })
    sent.length = 0
    const pending = controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_stream',
      arguments: '{"question":"what does this mean"}',
    })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    const early = sent.map(item => JSON.parse(item))
    const covers = early.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('Do not answer the question yet'))
    const first = early.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('Athena is already beside him.'))
    expect(covers).toHaveLength(1)
    expect(first).toHaveLength(0)
    finish('Athena is already beside him. The council is about homecoming.')
    await pending
    const later = sent.map(item => JSON.parse(item))
    const speakFull = later.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('The council is about homecoming.'))
    expect(speakFull.length).toBeGreaterThanOrEqual(1)
    expect(later.filter(item => item.type === 'conversation.item.create').at(-1)?.item.output).toContain('The council is about homecoming.')
  })

  it('speaks the rest even if the first sentence does not prefix-match', async () => {
    withWindowTimers()
    const sent: string[] = []
    let finish: (value: string) => void = () => { /* pending */ }
    const query = vi.fn((_question: string, notify?: { onFirstSpeakable?: (text: string) => void }) => {
      notify?.onFirstSpeakable?.('Keller would treat Genesis 1 as a theological statement.')
      return new Promise<string>(resolve => { finish = resolve })
    })
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      send: (data) => sent.push(data),
      onCompanionAsk: query,
    })
    sent.length = 0
    const pending = controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_rest',
      arguments: '{"question":"how would Tim Keller read this Genesis 1?"}',
    })
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    finish('Keller treats Genesis 1 as a theological statement of God\'s good world. He would linger on the blessing.')
    await pending
    const later = sent.map(item => JSON.parse(item))
    const spoken = later.filter(item => item.type === 'response.create' && String(item.response?.instructions || '').includes('linger on the blessing'))
    expect(spoken).toHaveLength(1)
    const spokenAnswer = String(spoken[0].response.instructions).split('\n\n').slice(1).join('\n\n')
    expect(spokenAnswer).toContain('linger on the blessing')
    expect(spokenAnswer).not.toMatch(/got cut off|the answer I received/i)
  })

  it('reroutes a playback question if Realtime asked the companion by mistake', async () => {
    withWindowTimers()
    const query = vi.fn(async () => 'should not run')
    const audio = audioEngine({ anchor: ANCHOR, wasPlaying: true })
    const { controller } = makeController()
    controller.testPrimeSession({
      audio,
      honorModelResume: true,
      onCompanionAsk: query,
    })
    await controller.testRealtime({
      type: 'response.function_call_arguments.done',
      name: 'ask_companion',
      call_id: 'call_oops',
      arguments: '{"question":"go faster"}',
    })
    expect(query).not.toHaveBeenCalled()
    expect(audio.setPlaybackSpeed).toHaveBeenCalled()
  })
})
