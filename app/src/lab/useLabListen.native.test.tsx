// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabListen } from './useLabListen'

const native = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn(async () => {}) }))
vi.mock('../utils/nativePlatform', () => ({ isNativeCapacitor: () => true }))
vi.mock('@capacitor/core', () => ({ registerPlugin: () => ({
  addListener: async () => ({ remove: async () => {} }),
  start: native.start, update: async () => {}, stop: native.stop,
}) }))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('never lets source autoplay bypass Android ownership or an intervening pause', async () => {
  let ready!: () => void
  native.start.mockImplementation(() => new Promise<void>(resolve => { ready = resolve }))
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1, autoplay: false, ended: false,
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
  })
  const text = 'In the beginning'
  const h = renderHook(() => useLabListen({
    guardPlaybackRequests: true, bookId: 'bible', chapterNumber: 1,
    paragraphs: [text],
    followParagraphs: [{ index: 0, text, file: 'p0.mp3', duration: 5,
      words: text.split(' ').map((text, i) => ({ text, start: i, end: i + 1 })) }],
    createAudio: () => audio,
  }))
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await waitFor(() => expect(native.start).toHaveBeenCalledTimes(1))
  expect(audio.src).not.toBe('')
  expect(audio.autoplay).toBe(false)
  expect(audio.play).not.toHaveBeenCalled()
  act(() => h.result.current.handoffChapter())
  expect(audio.autoplay).toBe(false)
  act(() => h.result.current.pause())
  await act(async () => { ready(); await Promise.resolve() })
  expect(audio.play).not.toHaveBeenCalled()
  expect(h.result.current.playing).toBe(false)
})
