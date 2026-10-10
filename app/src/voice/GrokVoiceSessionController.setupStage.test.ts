// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StartVoiceSessionInput } from './session'

const funnel = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('../utils/funnel', () => ({ trackFunnel: funnel.track }))
const { GrokVoiceSessionController } = await import('./GrokVoiceSessionController')

const input: StartVoiceSessionInput = { authToken: 'fixture-token', isAnonymous: false,
  context: { bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Ezra 7' },
  audio: { pausePlayback: () => null, resumePlayback: vi.fn() }, wasPlaying: false }

function setup(options: { getUserMedia?: () => Promise<unknown>; startCapture?: () => void } = {}) {
  vi.useFakeTimers()
  funnel.track.mockClear()
  const track = { stop: vi.fn(), onended: null }
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] }
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: options.getUserMedia || vi.fn().mockResolvedValue(stream) } })
  vi.stubGlobal('AudioContext', vi.fn())
  const controller = new GrokVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  Object.assign(controller, { startCapture: options.startCapture || vi.fn() })
  return { controller }
}

/** Every talk_failed event carries exactly one fixed code and no message text. */
function failedStages(): string[] {
  return funnel.track.mock.calls.filter(call => call[0] === 'talk_failed').map((call) => {
    expect(Object.keys(call[1])).toEqual(['stage'])
    return call[1].stage as string
  })
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('Talk setup failures name their step', () => {
  it('setup_mic: microphone permission refused (iPhone Safari NotAllowedError)', async () => {
    const refused = Object.assign(new Error('The request is not allowed by the user agent or the platform in the current context.'), { name: 'NotAllowedError' })
    const { controller } = setup({ getUserMedia: () => Promise.reject(refused) })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await controller.start(input)
    expect(failedStages()).toEqual(['setup_mic'])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('setup_mic: no microphone API at all', async () => {
    const { controller } = setup()
    vi.stubGlobal('navigator', {})
    await controller.start(input)
    expect(failedStages()).toEqual(['setup_mic'])
  })

  it('setup_audio_context: the capture graph cannot be built', async () => {
    const { controller } = setup({ startCapture: () => { throw new Error('InvalidStateError') } })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await controller.start(input)
    expect(failedStages()).toEqual(['setup_audio_context'])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('setup_token: Tinct refuses or cannot mint the session secret', async () => {
    const { controller } = setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ error: 'Forbidden' }) }))
    await controller.start(input)
    expect(failedStages()).toEqual(['setup_token'])
  })

  it('setup_socket: the provider socket drops before the session is ready, twice', async () => {
    const { controller } = setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ value: 'secret' }) }))
    const sockets: EventTarget[] = []
    class FakeSocket extends EventTarget {
      readyState = 0
      constructor() { super(); sockets.push(this); setTimeout(() => this.dispatchEvent(new Event('close')), 10) }
      send() {}
      close() {}
    }
    vi.stubGlobal('WebSocket', FakeSocket)
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(3_000)
    await started
    expect(sockets).toHaveLength(2)
    expect(failedStages()).toEqual(['setup_socket'])
  })

  it('a cancelled start reports nothing', async () => {
    const { controller } = setup({ getUserMedia: () => new Promise(() => {}) })
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(0)
    controller.stop()
    await vi.advanceTimersByTimeAsync(0)
    await started
    expect(failedStages()).toEqual([])
  })
})
