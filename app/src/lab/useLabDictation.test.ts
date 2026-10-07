// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DICTATION_COPY, DICTATION_MAX_SECONDS, useLabDictation } from './useLabDictation'
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers() })
it('dictates into the draft and ignores late recognition after stop or book switch', () => {
  let recognition: any
  class Recognition {
    onstart: any; onresult: any; onend: any; onerror: any
    start = vi.fn(); stop = vi.fn()
    constructor() { recognition = this }
  }
  vi.stubGlobal('SpeechRecognition', Recognition)
  const onDraft = vi.fn()
  const { result, rerender } = renderHook(({ book }) => useLabDictation(book, onDraft), { initialProps: { book: 'romeo-and-juliet' } })
  act(() => result.current.toggle('Tell me'))
  expect(result.current.state).toBe('starting')
  act(() => recognition.onstart())
  expect(result.current.state).toBe('listening')
  const lateResult = recognition.onresult
  act(() => recognition.onresult({ results: [{ 0: { transcript: 'about the feud' }, isFinal: false }] }))
  expect(onDraft).toHaveBeenLastCalledWith('Tell me about the feud')
  act(() => result.current.stop())
  act(() => lateResult({ results: [{ 0: { transcript: 'late words' }, isFinal: true }] }))
  expect(onDraft).toHaveBeenCalledTimes(1)
  expect(recognition.stop).toHaveBeenCalledTimes(1)
  act(() => result.current.toggle(''))
  const previous = recognition
  rerender({ book: 'bible' })
  expect(previous.stop).toHaveBeenCalledTimes(1)
  expect(result.current.state).toBe('idle')
})
it('reports unavailable dictation without starting a conversation', () => {
  vi.stubGlobal('SpeechRecognition', undefined)
  vi.stubGlobal('webkitSpeechRecognition', undefined)
  const { result } = renderHook(() => useLabDictation('bible', vi.fn()))
  act(() => result.current.toggle(''))
  expect(result.current.notice).toContain('unavailable')
  expect(result.current.state).toBe('idle')
})

// ---- Signed in: MediaRecorder + /api/dictation ----

let recorder: FakeRecorder | null = null
const track = { stop: vi.fn() }
class FakeRecorder {
  static isTypeSupported = vi.fn((type: string) => type === 'audio/mp4')
  state: 'inactive' | 'recording' = 'inactive'
  mimeType: string
  ondataavailable: any = null; onstart: any = null; onstop: any = null; onerror: any = null
  constructor(_stream: unknown, options: { mimeType?: string } = {}) { this.mimeType = options.mimeType || 'audio/webm'; recorder = this }
  start = vi.fn(() => { this.state = 'recording'; this.onstart?.() })
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob([new Uint8Array(400)], { type: this.mimeType }) })
    this.onstop?.()
  })
}

function stubRecording(fetchImpl: (url: string, init: RequestInit) => Promise<Response>) {
  recorder = null
  track.stop.mockClear()
  const getUserMedia = vi.fn(async () => ({ getTracks: () => [track] }))
  vi.stubGlobal('MediaRecorder', FakeRecorder)
  vi.stubGlobal('navigator', { ...navigator, language: 'en-US', mediaDevices: { getUserMedia } })
  const fetchMock = vi.fn(fetchImpl)
  vi.stubGlobal('fetch', fetchMock)
  const recognition = vi.fn()
  vi.stubGlobal('SpeechRecognition', recognition)
  return { getUserMedia, fetchMock, recognition }
}

const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve() }
const signedInOptions = { signedIn: true, getAuthToken: () => 'token-1', getKeyterms: () => ['Zerubbabel', 'Ezra'], language: 'en' }

it('signed in: records, sends the clip with keyterms on stop, and adds the text after the draft', async () => {
  const { getUserMedia, fetchMock, recognition } = stubRecording(async () => new Response(JSON.stringify({ text: 'who was Zerubbabel?' }), { status: 200 }))
  const onDraft = vi.fn()
  const { result } = renderHook(() => useLabDictation('bible', onDraft, signedInOptions))
  act(() => result.current.toggle('Tell me'))
  expect(result.current.state).toBe('starting')
  await act(flush)
  expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
  expect(recognition).not.toHaveBeenCalled()
  expect(recorder!.mimeType).toBe('audio/mp4')
  expect(result.current.state).toBe('listening')
  act(() => result.current.toggle('Tell me'))
  expect(result.current.state).toBe('transcribing')
  // A second tap while transcribing does nothing.
  act(() => result.current.toggle('Tell me'))
  await act(flush)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0]
  expect(url).toContain('/api/dictation')
  expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
  const form = init.body as FormData
  expect(JSON.parse(String(form.get('keyterms')))).toEqual(['Zerubbabel', 'Ezra'])
  expect(form.get('language')).toBe('en')
  expect(form.get('bookId')).toBe('bible')
  expect((form.get('audio') as Blob).type).toBe('audio/mp4')
  expect(onDraft).toHaveBeenCalledWith('Tell me who was Zerubbabel?')
  expect(result.current.state).toBe('idle')
  expect(track.stop).toHaveBeenCalled()
})

it('signed in: stop() discards the recording and a late transcription is ignored', async () => {
  let resolveFetch: (response: Response) => void = () => {}
  const { fetchMock } = stubRecording(() => new Promise(resolve => { resolveFetch = resolve }))
  const onDraft = vi.fn()
  const { result, rerender } = renderHook(({ book }) => useLabDictation(book, onDraft, signedInOptions), { initialProps: { book: 'bible' } })
  act(() => result.current.toggle(''))
  await act(flush)
  act(() => result.current.stop())
  await act(flush)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(track.stop).toHaveBeenCalled()
  expect(result.current.state).toBe('idle')

  act(() => result.current.toggle(''))
  await act(flush)
  act(() => result.current.toggle(''))
  await act(flush)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  rerender({ book: 'odyssey' })
  resolveFetch(new Response(JSON.stringify({ text: 'late words' }), { status: 200 }))
  await act(flush)
  expect(onDraft).not.toHaveBeenCalled()
  expect(result.current.state).toBe('idle')
})

it('signed in: finishes on its own at the time cap', async () => {
  vi.useFakeTimers()
  const { fetchMock } = stubRecording(async () => new Response(JSON.stringify({ text: 'a long question' }), { status: 200 }))
  const onDraft = vi.fn()
  const { result } = renderHook(() => useLabDictation('bible', onDraft, signedInOptions))
  act(() => result.current.toggle(''))
  await act(flush)
  expect(result.current.state).toBe('listening')
  await act(async () => { vi.advanceTimersByTime(DICTATION_MAX_SECONDS * 1000); await flush() })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(onDraft).toHaveBeenCalledWith('a long question')
})

it('signed in: reports denied microphone, empty speech and failed transcription', async () => {
  const denied = stubRecording(async () => new Response('{}'))
  denied.getUserMedia.mockRejectedValueOnce(Object.assign(new Error('no'), { name: 'NotAllowedError' }))
  const { result } = renderHook(() => useLabDictation('bible', vi.fn(), signedInOptions))
  act(() => result.current.toggle(''))
  await act(flush)
  expect(result.current.notice).toBe(DICTATION_COPY.denied)
  expect(result.current.state).toBe('idle')

  stubRecording(async () => new Response(JSON.stringify({ text: '  ' }), { status: 200 }))
  act(() => result.current.toggle(''))
  await act(flush)
  act(() => result.current.toggle(''))
  await act(flush)
  expect(result.current.notice).toBe(DICTATION_COPY.noSpeech)

  stubRecording(async () => new Response(JSON.stringify({ error: 'x' }), { status: 502 }))
  act(() => result.current.toggle(''))
  await act(flush)
  act(() => result.current.toggle(''))
  await act(flush)
  expect(result.current.notice).toBe(DICTATION_COPY.failed)
  expect(result.current.state).toBe('idle')
})

it('signed out: keeps the browser recognition and never records', async () => {
  const { getUserMedia, fetchMock } = stubRecording(async () => new Response('{}'))
  let started = false
  class Recognition { onstart: any; onresult: any; onend: any; onerror: any; start = () => { started = true }; stop = vi.fn() }
  vi.stubGlobal('SpeechRecognition', Recognition)
  const { result } = renderHook(() => useLabDictation('bible', vi.fn(), { signedIn: false }))
  act(() => result.current.toggle(''))
  await act(flush)
  expect(started).toBe(true)
  expect(getUserMedia).not.toHaveBeenCalled()
  expect(fetchMock).not.toHaveBeenCalled()
})
