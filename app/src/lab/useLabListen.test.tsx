// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabListen } from './useLabListen'

function harness() {
  const pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1,
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    play: vi.fn(() => new Promise<void>((resolve, reject) => pending.push({ resolve, reject }))),
  })
  const paragraphs = ['In the beginning', 'Let there be light']
  const followed = paragraphs.map((text, index) => ({ index, text, file: `p${index}.mp3`, duration: 5, words: text.split(' ').map((text, i) => ({ text, start: i, end: i + 1 })) }))
  const hook = renderHook(() => useLabListen({ guardPlaybackRequests: true, bookId: 'bible', chapterNumber: 1, paragraphs, followParagraphs: followed, createAudio: () => audio }))
  return { ...hook, audio, pending }
}
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
it('does not skip paragraphs when a pending play is cancelled by pause', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  act(() => h.result.current.pause())
  await act(async () => h.pending[0].reject(new DOMException('Interrupted by pause', 'AbortError')))
  expect(h.audio.play).toHaveBeenCalledTimes(1)
  expect(h.result.current.clipIndex).toBe(0)
  expect(h.result.current.playing).toBe(false)
})
it('does not let a superseded rejection hide the new clip or its highlighting', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 1, wordIndex: 0 }) })
  await act(async () => h.pending[1].resolve())
  await act(async () => h.pending[0].reject(new DOMException('Source changed', 'AbortError')))
  expect(h.audio.play).toHaveBeenCalledTimes(2)
  expect(h.result.current.clipIndex).toBe(1)
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 1 })
})

it('retries a transient rejection at an automatic clip transition without forcing load', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => h.pending[0].resolve())

  act(() => h.audio.dispatchEvent(new Event('ended')))
  expect(h.audio.play).toHaveBeenCalledTimes(2)
  await act(async () => h.pending[1].reject(new DOMException('Source swap interrupted', 'AbortError')))
  await act(async () => { await Promise.resolve() })
  act(() => h.audio.dispatchEvent(new Event('canplay')))
  await act(async () => { await Promise.resolve() })
  expect(h.audio.play).toHaveBeenCalledTimes(3)
  await act(async () => h.pending[2].resolve())

  expect(h.audio.load).not.toHaveBeenCalled()
  expect(h.result.current.clipIndex).toBe(1)
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 1 })
})

it('does not retry an old rejected source after a newer play request supersedes it', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await act(async () => h.pending[0].reject(new DOMException('Interrupted', 'AbortError')))

  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 1, wordIndex: 0 }) })
  act(() => h.audio.dispatchEvent(new Event('canplay')))
  expect(h.audio.play).toHaveBeenCalledTimes(2)
  await act(async () => h.pending[1].resolve())

  expect(h.result.current.clipIndex).toBe(1)
  expect(h.result.current.playing).toBe(true)
})

it('blocks held-edition playback without fetching audio or changing follow state', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  const createAudio = vi.fn()
  const paragraphs = ['In the beginning']
  const followParagraphs: [] = []
  const h = renderHook(() => useLabListen({ playbackUnavailable: true, bookId: 'bible', audioEdition: 'kjv-en', paragraphs, followParagraphs, createAudio }))
  await act(async () => {
    expect(await h.result.current.start()).toBe(false)
    expect(await h.result.current.startAtPlace({ paragraphIndex: 0 })).toBe(false)
    h.result.current.resume()
  })
  expect(fetch).not.toHaveBeenCalled(); expect(createAudio).not.toHaveBeenCalled()
  expect(h.result.current.playing).toBe(false); expect(h.result.current.follow).toEqual({kind:'none'})
})

it('returns from conversation at the current sentence while ordinary resume stays exact', async () => {
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, { src: '', currentTime: 0, playbackRate: 1, pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), play: vi.fn().mockResolvedValue(undefined) })
  const text = 'First sentence. Second sentence has more words.'
  const words = text.split(' ').map((text, index) => ({ text, start: index, end: index + 1 }))
  const h = renderHook(() => useLabListen({ paragraphs: [text], followParagraphs: [{ index: 0, text, file: 'p0.mp3', words }], createAudio: () => audio }))
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0 }) })
  audio.currentTime = 4.6
  act(() => h.result.current.pause())
  await act(async () => h.result.current.resume())
  expect(audio.currentTime).toBe(4.6)
  act(() => h.result.current.pause())
  await act(async () => h.result.current.resume(true))
  expect(audio.currentTime).toBe(2)
})
