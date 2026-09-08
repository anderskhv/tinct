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
