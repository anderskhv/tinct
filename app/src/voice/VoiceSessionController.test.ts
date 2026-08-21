import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveVoiceSessionInstructions, VoiceSessionController } from './VoiceSessionController'
import { VOICE_AGENT_POLICY } from './context'
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
  }
}

describe('VoiceSessionController start failure', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
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

describe('voice session instructions', () => {
  it('keeps the in-car brief unless a lab override is supplied', () => {
    const production = resolveVoiceSessionInstructions(CONTEXT)
    expect(production).toContain(VOICE_AGENT_POLICY)
    expect(production).toContain('20–30 seconds')

    const lab = resolveVoiceSessionInstructions(CONTEXT, 'Lab desk brief with the full chapter.')
    expect(lab).toBe('Lab desk brief with the full chapter.')
    expect(lab).not.toContain(VOICE_AGENT_POLICY)
  })
})
