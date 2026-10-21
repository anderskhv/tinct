// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'

// Safari, 21 Oct 2026: Talk failed when it asked for the microphone on a
// first tap and worked on a second. WebKit counts a getUserMedia call as
// made in the reader's gesture only while that tap is being handled; Talk
// awaited its lazily loaded session code (and, signed in, a session read)
// first. These tests use the real useVoiceSession and the real, cold Talk
// chunk. No session is ever created: the microphone never answers, the
// Worker routes are stubbed and there is no socket.

const { readSupabaseAccessToken, trackFunnel } = vi.hoisted(() => ({ readSupabaseAccessToken: vi.fn(), trackFunnel: vi.fn() }))

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../utils/funnel', async (importOriginal) => ({ ...(await importOriginal<typeof import('../utils/funnel')>()), trackFunnel }))
vi.mock('./labAuth', async (importOriginal) => ({ ...(await importOriginal<typeof import('./labAuth')>()), readSupabaseAccessToken }))

const base: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: 'Genesis 1',
  chapterNumber: 1,
  paragraphs: ['In the beginning God created the heavens and the earth.'],
  paragraphIndex: 0,
  signedIn: true,
  userId: null,
  // The reader holds Talk's code cold until its first page is up.
  voiceWarm: false,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

let inTap = false
let calls: Array<{ inTap: boolean }> = []
const order: string[] = []

beforeEach(() => {
  calls = []
  order.length = 0
  vi.stubGlobal('navigator', {
    ...navigator,
    audioSession: {
      get type() { return 'auto' },
      set type(value: string) { order.push(`audioSession:${value}`) },
    },
    mediaDevices: {
      getUserMedia: vi.fn(() => {
        calls.push({ inTap })
        order.push('getUserMedia')
        return new Promise(() => { /* the prompt is never answered here */ })
      }),
    },
  })
  vi.stubGlobal('AudioContext', class {
    state = 'suspended'
    sampleRate = 48_000
    constructor() { order.push('AudioContext') }
    resume() { this.state = 'running'; return Promise.resolve() }
    close() { this.state = 'closed'; return Promise.resolve() }
  })
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"stubbed"}', { status: 400 })))
  vi.stubGlobal('WebSocket', class { constructor() { throw new Error('no sockets in this test') } })
})

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

/** The reader's tap: everything Talk does synchronously in it counts as in the gesture. */
function tap(run: () => unknown): void {
  inTap = true
  try { run() } finally { inTap = false }
}

it('a signed-in first tap asks for the microphone in the tap, before the session read and the cold Talk code', async () => {
  // The session is read from Supabase, which can refresh over the network.
  readSupabaseAccessToken.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('fresh-token'), 20)))
  const { result } = renderHook(() => useLabAsk(base))
  act(() => { tap(() => { void result.current.startVoice() }) })
  expect(calls).toEqual([{ inTap: true }])
  // Play-and-record first (WebKit refuses capture under narration's 'playback'), then the request, then the context.
  expect(order.slice(0, 3)).toEqual(['audioSession:play-and-record', 'getUserMedia', 'AudioContext'])
  // The session code loads and takes that same request: no second prompt.
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 200)) })
  expect(calls).toHaveLength(1)
  act(() => { result.current.stopVoice() })
  expect(order[order.length - 1]).toBe('audioSession:auto')
})

it('a guest first tap asks for the microphone in the tap, before the cold Talk code loads', async () => {
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false }))
  act(() => { tap(() => { void result.current.startVoice() }) })
  expect(calls).toEqual([{ inTap: true }])
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 200)) })
  expect(calls).toHaveLength(1)
  act(() => { result.current.stopVoice() })
})

it('Talk opened a frame after the tap (Explain, chapter notes) still asks in the tap', async () => {
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false }))
  act(() => { tap(() => { result.current.primeVoice() }) })
  expect(calls).toEqual([{ inTap: true }])
  // The frame after the tap: startVoice takes the primed request.
  await act(async () => { void result.current.startVoice(); await new Promise(resolve => setTimeout(resolve, 200)) })
  expect(calls).toHaveLength(1)
  act(() => { result.current.stopVoice() })
})

it('a primed microphone that never becomes a call is let go', async () => {
  vi.useFakeTimers()
  try {
    const track = { stop: vi.fn() }
    let grant: (stream: unknown) => void = () => {}
    ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(resolve => { grant = resolve }))
    const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false }))
    act(() => { result.current.primeVoice() })
    act(() => { result.current.stopVoice() })
    // Permission granted after the reader closed Talk: the stream is stopped at once.
    await act(async () => { grant({ getTracks: () => [track], getAudioTracks: () => [track] }) })
    expect(track.stop).toHaveBeenCalled()
    expect(order[order.length - 1]).toBe('audioSession:auto')
    // Closed with the prompt unanswered: one fixed-code cancellation, no text.
    expect(trackFunnel.mock.calls.filter(call => call[0] === 'talk_failed')).toEqual([['talk_failed', { stage: 'setup_mic', reason: 'cancelled' }]])
  } finally {
    vi.useRealTimers()
  }
})

it('a guest who closes Talk while its code is still loading gets no session and no open microphone', async () => {
  const track = { stop: vi.fn() }
  ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockImplementation(() => Promise.resolve({ getTracks: () => [track], getAudioTracks: () => [track] }))
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false }))
  act(() => { tap(() => { void result.current.startVoice() }) })
  act(() => { result.current.stopVoice() })
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 200)) })
  expect(track.stop).toHaveBeenCalled()
  // No session secret was asked for, and no session started (or failed) after the close.
  expect(fetch).not.toHaveBeenCalled()
  expect(trackFunnel.mock.calls.filter(call => call[0] === 'talk_failed')).toEqual([])
  expect(result.current.voiceActive).toBe(false)
})
