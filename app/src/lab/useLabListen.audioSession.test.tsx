// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { acquireBrowserAudioSession } from '../utils/browserAudioSession'
import { useLabListen } from './useLabListen'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function harness() {
  let type = 'auto'
  const writes: string[] = []
  const session = { get type() { return type }, set type(next: string) { type = next; writes.push(next) } }
  vi.stubGlobal('navigator', { audioSession: session })
  const modesAtPlay: string[] = []
  const pending: Array<() => void> = []
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1, autoplay: false, ended: false, paused: true,
    pause: vi.fn(() => { Object.assign(audio, { paused: true }) }), load: vi.fn(), removeAttribute: vi.fn(),
    play: vi.fn(() => {
      modesAtPlay.push(session.type)
      Object.assign(audio, { paused: false })
      return new Promise<void>(resolve => pending.push(resolve))
    }),
  })
  const paragraphs = ['First paragraph', 'Second paragraph']
  const followParagraphs = paragraphs.map((text, index) => ({ index, text, file: `p${index}.mp3`, duration: 5 }))
  const hook = renderHook(() => useLabListen({ bookId: 'bible', chapterNumber: 1, paragraphs, followParagraphs, createAudio: () => audio }))
  return { ...hook, audio, session, writes, modesAtPlay, pending }
}
it('owns playback before initial play and resume while their promises are pending', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0 }) })
  expect(h.modesAtPlay).toEqual(['playback'])
  await act(async () => h.pending[0]())
  act(() => h.result.current.pause())
  expect(h.session.type).toBe('auto')
  act(() => h.result.current.resume())
  expect(h.modesAtPlay).toEqual(['playback', 'playback'])
  expect(h.session.type).toBe('playback')
  await act(async () => h.pending[1]())
  h.unmount()
  expect(h.session.type).toBe('auto')
})
it('keeps one lease across clip boundaries and chapter handoff and releases on stop', async () => {
  const h = harness()
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0 }) })
  await act(async () => h.pending[0]())
  Object.assign(h.audio, { ended: true, currentTime: 5 })
  act(() => h.audio.dispatchEvent(new Event('ended')))
  expect(h.modesAtPlay).toEqual(['playback', 'playback'])
  await act(async () => h.pending[1]())
  act(() => h.result.current.handoffChapter())
  expect(h.writes).toEqual(['playback'])
  act(() => h.result.current.stop())
  expect(h.session.type).toBe('auto')
})
it('preserves Talk priority when narration starts, pauses and resumes', async () => {
  const h = harness()
  const releaseTalk = acquireBrowserAudioSession('play-and-record')
  try {
    await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0 }) })
    expect(h.modesAtPlay).toEqual(['play-and-record'])
    await act(async () => h.pending[0]())
    act(() => h.result.current.pause())
    expect(h.session.type).toBe('play-and-record')
    act(() => h.result.current.resume())
    expect(h.modesAtPlay).toEqual(['play-and-record', 'play-and-record'])
    await act(async () => h.pending[1]())
    releaseTalk()
    expect(h.session.type).toBe('playback')
    act(() => h.result.current.stop())
    expect(h.session.type).toBe('auto')
  } finally { releaseTalk() }
})
