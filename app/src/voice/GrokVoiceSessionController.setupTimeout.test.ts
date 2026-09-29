// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GrokVoiceSessionController, VOICE_REQUEST_TIMEOUT_MS, VOICE_MICROPHONE_TIMEOUT_MS } from './GrokVoiceSessionController'
import type { StartVoiceSessionInput } from './session'

const input: StartVoiceSessionInput = { authToken: 'fixture-token', isAnonymous: false,
  context: { bookId: 'bible', bookTitle: 'The Bible', bookAuthor: 'Various', chapterLabel: 'Ezra 7' },
  audio: { pausePlayback: () => null, resumePlayback: vi.fn() }, wasPlaying: false }
function setup(getUserMedia?: () => Promise<unknown>) {
  vi.useFakeTimers()
  const track = { stop: vi.fn(), onended: null }
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] }
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: getUserMedia || vi.fn().mockResolvedValue(stream) } })
  const controller = new GrokVoiceSessionController({ onSnapshot: vi.fn(), onTurn: vi.fn() })
  Object.assign(controller, { startCapture: vi.fn() })
  return { controller, stream, track }
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('bounded voice setup', () => {
  it('retries a hanging HTTP request once, then explains failure and releases the microphone', async () => {
    const { controller, track } = setup()
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(2 * VOICE_REQUEST_TIMEOUT_MS + 1100)
    await started
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.every(call => (call as unknown as [string, RequestInit])[1].signal?.aborted)).toBe(true)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, connection: 'disconnected', error: expect.stringContaining('timed out') })
    expect(track.stop).toHaveBeenCalledTimes(1)
  })

  it('bounds a hanging response body too', async () => {
    const { controller } = setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => new Promise(() => {}) })
    vi.stubGlobal('fetch', fetchMock)
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(2 * VOICE_REQUEST_TIMEOUT_MS + 1100)
    await started
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(controller.getSnapshot().error).toContain('timed out')
  })

  it('cancels a pending request without retrying or reviving the closed session', async () => {
    const { controller, track } = setup()
    let respond!: (response: unknown) => void
    const fetchMock = vi.fn(() => new Promise(resolve => { respond = resolve }))
    vi.stubGlobal('fetch', fetchMock)
    const socket = vi.fn()
    vi.stubGlobal('WebSocket', socket)
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(0)
    controller.stop()
    await started
    respond({ ok: true, json: async () => ({ value: 'late-secret' }) })
    await vi.advanceTimersByTimeAsync(VOICE_REQUEST_TIMEOUT_MS * 3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(socket).not.toHaveBeenCalled()
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(controller.getSnapshot()).toMatchObject({ isActive: false, error: null })
  })

  it('times out a pending microphone, never mints a session, and stops a late permission grant', async () => {
    let grant!: (stream: unknown) => void
    const { controller, stream, track } = setup(() => new Promise(resolve => { grant = resolve }))
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const started = controller.start(input)
    await vi.advanceTimersByTimeAsync(VOICE_MICROPHONE_TIMEOUT_MS + 1)
    await started
    expect(controller.getSnapshot().error).toContain('Microphone did not become ready')
    grant(stream)
    await vi.advanceTimersByTimeAsync(0)
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
