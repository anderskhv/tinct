// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LAB_SILENT_UNLOCK_SRC, useLabListen } from './useLabListen'

/** One timed word per second; paragraph 0 has three sentences. */
function harness() {
  const pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1, autoplay: false, ended: false, muted: false,
    pause: vi.fn(), load: vi.fn(),
    removeAttribute: vi.fn((name: string) => { if (name === 'src') Object.assign(audio, { src: '' }) }),
    play: vi.fn(() => new Promise<void>((resolve, reject) => pending.push({ resolve, reject }))),
  })
  const paragraphs = ['It was dark. The storm rose over the lake. We waited.', 'Morning came. The boat was gone.']
  const followed = paragraphs.map((text, index) => ({
    index, text, file: `p${index}.mp3`, duration: 20,
    words: text.split(' ').map((word, i) => ({ text: word, start: i, end: i + 1 })),
  }))
  const hook = renderHook(() => useLabListen({ guardPlaybackRequests: true, bookId: 'frankenstein', chapterNumber: 1, paragraphs, followParagraphs: followed, createAudio: () => audio }))
  return { ...hook, audio, pending }
}

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('resumes from a word chosen while paused, not from where playback was paused', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => h.pending[0].resolve())
  Object.assign(h.audio, { currentTime: 4.2 })
  act(() => h.result.current.pause())
  expect(h.result.current.playing).toBe(false)

  // The reader taps "boat" in the next paragraph while paused.
  act(() => h.result.current.seekToPlace(1, 3))
  expect(h.result.current.playing).toBe(false)
  expect(h.audio.src).toContain('p1.mp3')
  expect(h.audio.currentTime).toBe(3)
  expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 1, wordIndex: 3 })

  act(() => { h.result.current.resume() })
  await act(async () => h.pending[h.pending.length - 1].resolve())
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.clipIndex).toBe(1)
  expect(h.audio.src).toContain('p1.mp3')
  expect(h.audio.currentTime).toBe(3)
})

it('resumes a jump made while playing from the jumped-to sentence after pause', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => h.pending[0].resolve())
  // Jump forward to "over" (word 6) while playing: audio continues from there.
  act(() => h.result.current.seekToPlace(0, 6))
  expect(h.audio.currentTime).toBe(6)
  await act(async () => h.pending[h.pending.length - 1].resolve())
  Object.assign(h.audio, { currentTime: 7.4 })
  act(() => h.result.current.pause())
  // A return from Talk resumes at the start of that sentence ("The").
  act(() => { h.result.current.resume(true) })
  expect(h.audio.currentTime).toBe(3)
})

it('unlocks the element once, inside the gesture, with muted silence it never keeps', async () => {
  const h = harness()
  act(() => h.result.current.unlockPlayback())
  expect(h.audio.play).toHaveBeenCalledTimes(1)
  expect(h.audio.pause).toHaveBeenCalled()
  expect(h.audio.muted).toBe(true)
  expect(h.audio.src).toBe(LAB_SILENT_UNLOCK_SRC)
  await act(async () => h.pending[0].resolve())
  expect(h.audio.src).toBe('')
  expect(h.audio.muted).toBe(false)
  expect(h.result.current.playing).toBe(false)
  act(() => h.result.current.unlockPlayback())
  expect(h.audio.play).toHaveBeenCalledTimes(1)
})

it('a real play request right after the unlock owns the element, unmuted', async () => {
  const h = harness()
  act(() => h.result.current.unlockPlayback())
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 3 }) })
  expect(h.audio.muted).toBe(false)
  expect(h.audio.src).toContain('p0.mp3')
  await act(async () => h.pending[0].reject(new DOMException('Interrupted', 'AbortError')))
  await act(async () => h.pending[1].resolve())
  expect(h.audio.src).toContain('p0.mp3')
  expect(h.audio.muted).toBe(false)
  expect(h.result.current.playing).toBe(true)
})

it('leaves an element that already holds narration alone', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => h.pending[0].resolve())
  act(() => h.result.current.pause())
  const plays = vi.mocked(h.audio.play).mock.calls.length
  act(() => h.result.current.unlockPlayback())
  expect(h.audio.play).toHaveBeenCalledTimes(plays)
  expect(h.audio.src).toContain('p0.mp3')
})

/**
 * iOS WebKit: an element may start outside a gesture only once it has been
 * played inside one. Talk's "play the audiobook" starts audio from a socket
 * callback, long after the tap; on a never-played element that first play()
 * was refused and the reader saw "Audio couldn't start" until Retry (a tap).
 */
function gestureGatedHarness() {
  let gesture = false
  let unlocked = false
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1, autoplay: false, ended: false, muted: false,
    pause: vi.fn(), load: vi.fn(),
    removeAttribute: vi.fn((name: string) => { if (name === 'src') Object.assign(audio, { src: '' }) }),
    play: vi.fn(() => {
      if (gesture) unlocked = true
      return unlocked ? Promise.resolve() : Promise.reject(new DOMException('Not allowed without a user gesture', 'NotAllowedError'))
    }),
  })
  const paragraphs = ['It was dark. The storm rose.']
  const followed = paragraphs.map((text, index) => ({ index, text, file: `p${index}.mp3`, duration: 5, words: text.split(' ').map((word, i) => ({ text: word, start: i, end: i + 1 })) }))
  const hook = renderHook(() => useLabListen({ guardPlaybackRequests: true, bookId: 'frankenstein', chapterNumber: 1, paragraphs, followParagraphs: followed, createAudio: () => audio }))
  return { ...hook, audio, inGesture: (run: () => void) => { gesture = true; try { run() } finally { gesture = false } } }
}

it('reproduces the first-attempt failure: audio started later, outside the gesture, is refused', async () => {
  vi.useFakeTimers()
  try {
    const h = gestureGatedHarness()
    await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
    expect(h.result.current.playing).toBe(false)
    expect(h.result.current.narration).toMatchObject({ status: 'error', reason: 'playback' })
  } finally { vi.useRealTimers() }
})

it('starts audio outside the gesture when the Talk tap unlocked the element first', async () => {
  const h = gestureGatedHarness()
  act(() => h.inGesture(() => h.result.current.unlockPlayback()))
  await act(async () => { await Promise.resolve() })
  // Later, from the companion's callback: no gesture.
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 3 }) })
  await act(async () => { await Promise.resolve() })
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration).toEqual({ status: 'idle' })
  expect(h.audio.src).toContain('p0.mp3')
  expect(h.audio.currentTime).toBe(3)
})
