import { afterEach, describe, expect, it, vi } from 'vitest'
import { MICROPHONE_MESSAGES, MicrophoneRequestError, microphoneFailureFor, requestTalkMicrophone } from './microphoneRequest'

const domError = (name: string) => Object.assign(new Error(`${name} from the browser`), { name })

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe("Talk's microphone request", () => {
  it.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'missing'],
    ['NotReadableError', 'busy'],
    ['AbortError', 'busy'],
    ['OverconstrainedError', 'constraints'],
    ['InvalidStateError', 'audio_session'],
    ['TypeError', 'unknown'],
  ])('%s reads as %s, with a next step', async (name, failure) => {
    expect(microphoneFailureFor(domError(name))).toBe(failure)
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => Promise.reject(domError(name)) } })
    const error = await requestTalkMicrophone().stream.catch(e => e)
    expect(error).toBeInstanceOf(MicrophoneRequestError)
    expect(error.message).toBe(MICROPHONE_MESSAGES[failure as keyof typeof MICROPHONE_MESSAGES])
    // The browser's own wording never reaches the reader.
    expect(error.message).not.toContain('from the browser')
  })

  it('every message is one line', () => {
    for (const message of Object.values(MICROPHONE_MESSAGES)) {
      expect(message).not.toContain('\n')
      expect(message.length).toBeLessThan(130)
    }
  })

  it('a prompt left unanswered times out with the timeout line and lets the audio session go', async () => {
    vi.useFakeTimers()
    const types: string[] = []
    vi.stubGlobal('navigator', {
      audioSession: { get type() { return 'auto' }, set type(value: string) { types.push(value) } },
      mediaDevices: { getUserMedia: () => new Promise(() => {}) },
    })
    const request = requestTalkMicrophone(1_000)
    const outcome = request.stream.catch(e => e)
    await vi.advanceTimersByTimeAsync(1_001)
    expect((await outcome).message).toBe(MICROPHONE_MESSAGES.timeout)
    expect(types).toEqual(['play-and-record', 'auto'])
  })

  it('sets play-and-record before asking, since WebKit refuses capture under a playback session', () => {
    const order: string[] = []
    vi.stubGlobal('navigator', {
      audioSession: { get type() { return 'playback' }, set type(value: string) { order.push(value) } },
      mediaDevices: { getUserMedia: () => { order.push('getUserMedia'); return new Promise(() => {}) } },
    })
    requestTalkMicrophone().cancel()
    expect(order).toEqual(['play-and-record', 'getUserMedia', 'playback'])
  })

  it('no microphone API: the unavailable line, no audio session change', async () => {
    const types: string[] = []
    vi.stubGlobal('navigator', { audioSession: { get type() { return 'auto' }, set type(value: string) { types.push(value) } } })
    const error = await requestTalkMicrophone().stream.catch(e => e)
    expect(error.message).toBe(MICROPHONE_MESSAGES.unavailable)
    expect(types).toEqual([])
  })
})
