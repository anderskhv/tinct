// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StartVoiceSessionInput } from './session'

const funnel = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('../utils/funnel', () => ({ trackFunnel: funnel.track }))
const { GrokVoiceSessionController } = await import('./GrokVoiceSessionController')
const { MICROPHONE_MESSAGES, requestTalkMicrophone } = await import('./microphoneRequest')

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

const REASONS = ['NotAllowedError', 'NotFoundError', 'NotReadableError', 'OverconstrainedError', 'AbortError',
  'SecurityError', 'InvalidStateError', 'TypeError', 'timeout', 'cancelled', 'unavailable', 'other']

/**
 * Every talk_failed event carries a fixed stage code and, for the microphone
 * step only, a fixed reason code (Anders, 21 Oct 2026); never message text.
 */
function failedEvents(): Array<{ stage: string; reason?: string }> {
  return funnel.track.mock.calls.filter(call => call[0] === 'talk_failed').map((call) => {
    const props = call[1] as { stage: string; reason?: string }
    if (props.stage === 'setup_mic') {
      expect(Object.keys(props)).toEqual(['stage', 'reason'])
      expect(REASONS).toContain(props.reason)
    } else expect(Object.keys(props)).toEqual(['stage'])
    return props
  })
}

function failedStages(): string[] {
  return failedEvents().map(event => event.stage)
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

  it('a start closed before the microphone prompt was answered is counted as cancelled, once', async () => {
    const { controller } = setup({ getUserMedia: () => new Promise(() => {}) })
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(0)
    controller.stop()
    await vi.advanceTimersByTimeAsync(0)
    await started
    controller.stop()
    expect(failedEvents()).toEqual([{ stage: 'setup_mic', reason: 'cancelled' }])
  })

  it('a start closed after the microphone answered is not a cancellation', async () => {
    const { controller } = setup()
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(0)
    controller.stop()
    await vi.advanceTimersByTimeAsync(0)
    await started
    expect(failedEvents()).toEqual([])
  })

  it.each([
    ['NotAllowedError'], ['NotFoundError'], ['NotReadableError'], ['OverconstrainedError'], ['AbortError'], ['SecurityError'], ['InvalidStateError'],
  ])('setup_mic reason: the browser error name %s, as a fixed code', async (name) => {
    const { controller } = setup({ getUserMedia: () => Promise.reject(Object.assign(new Error('free text the browser wrote'), { name })) })
    await controller.start(input)
    expect(failedEvents()).toEqual([{ stage: 'setup_mic', reason: name }])
  })

  it('setup_mic reason: a prompt never answered within the limit is timeout', async () => {
    const { controller } = setup({ getUserMedia: () => new Promise(() => {}) })
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(30_001)
    await started
    expect(failedEvents()).toEqual([{ stage: 'setup_mic', reason: 'timeout' }])
    expect(controller.getSnapshot().error).toBe(MICROPHONE_MESSAGES.timeout)
  })

  it('setup_mic reason: no microphone API is unavailable', async () => {
    const { controller } = setup()
    vi.stubGlobal('navigator', {})
    await controller.start(input)
    expect(failedEvents()).toEqual([{ stage: 'setup_mic', reason: 'unavailable' }])
  })

  it('setup_mic reason: an unknown error name is reported as other, never as its text', async () => {
    const { controller } = setup({ getUserMedia: () => Promise.reject(Object.assign(new Error('x'), { name: 'WeirdVendorError' })) })
    await controller.start(input)
    expect(failedEvents()).toEqual([{ stage: 'setup_mic', reason: 'other' }])
  })

  it('setup_mic: a refused prompt reads as one line with the next step, not the browser text', async () => {
    const refused = Object.assign(new Error('The request is not allowed by the user agent or the platform in the current context.'), { name: 'NotAllowedError' })
    const { controller } = setup({ getUserMedia: () => Promise.reject(refused) })
    await controller.start(input)
    expect(controller.getSnapshot().error).toBe(MICROPHONE_MESSAGES.denied)
    expect(failedStages()).toEqual(['setup_mic'])
  })

  it('takes the microphone asked for in the tap instead of asking again', async () => {
    const getUserMedia = vi.fn(() => new Promise(() => {}))
    const { controller } = setup({ getUserMedia })
    const microphone = requestTalkMicrophone()
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    void controller.start({ ...input, microphone })
    await vi.advanceTimersByTimeAsync(10)
    expect(getUserMedia).toHaveBeenCalledTimes(1)
    controller.stop()
  })

  it('a start refused before the microphone (signed out) lets the tap\'s request go', async () => {
    const track = { stop: vi.fn() }
    let grant: (stream: unknown) => void = () => {}
    const { controller } = setup({ getUserMedia: () => new Promise(resolve => { grant = resolve }) })
    const microphone = requestTalkMicrophone()
    await controller.start({ ...input, authToken: null, microphone })
    // The sign-in refusal is the record; letting the microphone go is not a cancellation.
    expect(failedEvents()).toEqual([{ stage: 'sign_in' }])
    grant({ getTracks: () => [track], getAudioTracks: () => [track] })
    await vi.advanceTimersByTimeAsync(0)
    expect(track.stop).toHaveBeenCalled()
  })
})
