// @vitest-environment jsdom
// Lock-screen narration (iPhone, 17 Oct 2026): a chapter boundary must keep
// playing with no gesture while the page is hidden, the player must follow
// the real element when iOS pauses it, an interruption (a message ping) must
// resume by itself, and the lock-screen controls must act on the element
// synchronously.
import { clipUrlOfSource } from './narrationClipBuffer'
import { useEffect, useRef, useState } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { narrationBridgeUrls, useLabListen } from './useLabListen'
import type { NarrationParagraphResult } from './labNarration'
import { chunkNarrationText, narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

const text: Record<number, string[]> = {
  410: ['I was strengthened according to the hand of Yahweh my God on me, and I gathered together out of Israel chief men to go up with me.'],
  411: ["Now these are the heads of their fathers' houses, and this is the genealogy of those who went up with me from Babylon."],
}
const followed = Object.fromEntries(Object.entries(text).map(([chapter, paragraphs]) => [chapter, paragraphs.map((value, index) => ({ index, text: value }))]))

async function ready(chapter: number): Promise<NarrationParagraphResult[]> {
  const paragraph = text[chapter][0]
  const tokens = narrationTextForParagraph(paragraph).split(' ')
  const chunks = chunkNarrationText(paragraph).map(chunk => ({
    ...chunk, ready: true, hash: `ezra-${chapter}-${chunk.index}`,
    url: `/api/audio-file?clip=ezra-${chapter}-${chunk.index}`, duration: 10, timingsUsable: true,
    words: tokens.slice(chunk.wordFrom, chunk.wordTo).map((word, index) => ({ text: word, start: index / tokens.length * 10, end: (index + 1) / tokens.length * 10 })),
  }))
  return [{ paragraph: 0, status: 'ready', textHash: await sha256Hex(narrationTextForParagraph(paragraph)), chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: 10 * chunks.length }]
}

/** A media element that behaves like WebKit's for the parts the player relies on. */
class FakeAudio extends EventTarget {
  private source = ''
  currentTime = 0
  duration = 10
  ended = false
  paused = true
  playbackRate = 1
  autoplay = false
  muted = false
  preload = ''
  /** What the next play() does; a refusal models iOS denying audio without a gesture. */
  refuse = false
  playLog: string[] = []
  get src() { return this.source }
  set src(value: string) { this.source = value; this.paused = true; this.ended = false; this.currentTime = 0 }
  play = vi.fn(() => {
    this.playLog.push(this.source)
    if (this.refuse) return Promise.reject(new DOMException('not allowed', 'NotAllowedError'))
    this.paused = false
    this.ended = false
    queueMicrotask(() => { this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')) })
    return Promise.resolve()
  })
  pause = vi.fn(() => {
    if (this.paused) return
    this.paused = true
    queueMicrotask(() => this.dispatchEvent(new Event('pause')))
  })
  load = vi.fn()
  setAttribute = vi.fn()
  removeAttribute = vi.fn((name: string) => { if (name === 'src') this.src = '' })
  /** iOS pausing the element itself: a call, Siri, a notification sound. */
  systemPause() { this.paused = true; this.dispatchEvent(new Event('pause')) }
  finish() {
    this.currentTime = this.duration
    this.ended = true
    this.paused = true
    this.dispatchEvent(new Event('pause'))
    this.dispatchEvent(new Event('ended'))
  }
}

type Handler = (details: MediaSessionActionDetails) => void
let handlers: Map<string, Handler>
let session: { metadata: unknown; playbackState: string; setActionHandler: (action: string, handler: Handler | null) => void; setPositionState: () => void }

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => state === 'hidden' })
}

beforeEach(() => {
  handlers = new Map()
  session = {
    metadata: null,
    playbackState: 'none',
    setActionHandler: (action, handler) => { if (handler) handlers.set(action, handler); else handlers.delete(action) },
    setPositionState: () => {},
  }
  Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: session })
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  setVisibility('visible')
  delete (navigator as { mediaSession?: unknown }).mediaSession
})

/** One chapter of ready narration, playing. */
async function playingChapter(audio: FakeAudio) {
  const prepared = await ready(410)
  const ensure = vi.fn(async () => prepared)
  const h = renderHook(() => {
    const player = useLabListen({
      guardPlaybackRequests: true, bookId: 'bible', chapterNumber: 410, audioEdition: 'web-en',
      paragraphs: text[410], followParagraphs: followed[410], createAudio: () => audio as unknown as HTMLAudioElement,
      narration: { voice: 'ara', prepared: () => prepared, ensure },
    })
    return player
  })
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await waitFor(() => expect(audio.src).toContain('ezra-410'))
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  await waitFor(() => expect(h.result.current.pending).toBe(false))
  return { h, ensure }
}

it('crosses a chapter boundary on a hidden page by starting the next chapter on the same element inside ended', async () => {
  const cache = new Map<number, NarrationParagraphResult[]>([[410, await ready(410)], [411, await ready(411)]])
  const ensure = vi.fn(async () => [] as NarrationParagraphResult[])
  const audio = new FakeAudio()
  // The next chapter's text arrives over the network only after the boundary.
  let releaseChapter: () => void = () => {}
  const chapterLoaded = new Promise<void>(resolve => { releaseChapter = resolve })
  const h = renderHook(() => {
    const [chapter, setChapter] = useState(410)
    const playerRef = useRef<ReturnType<typeof useLabListen> | null>(null)
    const player = useLabListen({
      guardPlaybackRequests: true, bookId: 'bible', chapterNumber: chapter, audioEdition: 'web-en',
      paragraphs: text[chapter], followParagraphs: followed[chapter], createAudio: () => audio as unknown as HTMLAudioElement,
      narration: { voice: 'ara', prepared: () => cache.get(chapter) ?? [], ensure },
      nextChapterAudio: () => (chapter === 410 ? { chapterNumber: 411, urls: narrationBridgeUrls(cache.get(411) ?? []) } : null),
      onChapterComplete: () => {
        if (chapter !== 410) return false
        playerRef.current!.handoffChapter()
        void chapterLoaded.then(() => setChapter(411))
        return true
      },
    })
    playerRef.current = player
    useEffect(() => { void playerRef.current!.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) }, [chapter])
    return { chapter, player }
  })
  await waitFor(() => expect(audio.src).toContain('ezra-410'))
  await waitFor(() => expect(h.result.current.player.pending).toBe(false))
  setVisibility('hidden')
  const pausesBefore = audio.pause.mock.calls.length
  const playsBefore = audio.play.mock.calls.length

  act(() => { audio.finish() })
  // Synchronously, inside `ended`: same element, next chapter's first recording.
  expect(audio.play.mock.calls.length).toBe(playsBefore + 1)
  expect(clipUrlOfSource(audio.playLog[audio.playLog.length - 1])).toContain('ezra-411-0')
  // Downloaded before the chapter ended: the opening plays from memory, with no request at the boundary.
  expect(audio.playLog[audio.playLog.length - 1]).toMatch(/^blob:/)
  expect(h.result.current.chapter).toBe(410)

  // The page is still loading chapter 411 while the bridge plays.
  await act(async () => { await Promise.resolve() })
  audio.currentTime = 3
  act(() => { audio.dispatchEvent(new Event('timeupdate')) })
  expect(h.result.current.player.playing).toBe(true)

  releaseChapter()
  await waitFor(() => expect(h.result.current.chapter).toBe(411))
  await waitFor(() => expect(h.result.current.player.pending).toBe(false))
  await waitFor(() => expect(h.result.current.player.follow.kind).toBe('word'))
  // Adopted where it is, not restarted: no pause, no rewind, no second request.
  expect(clipUrlOfSource(audio.src)).toContain('ezra-411-0')
  expect(audio.currentTime).toBe(3)
  expect(audio.pause.mock.calls.length).toBe(pausesBefore)
  expect(ensure).not.toHaveBeenCalled()
  expect(h.result.current.player.playing).toBe(true)
  expect(h.result.current.player.narration).toEqual({ status: 'idle' })
  expect(session.playbackState).toBe('playing')
})

it('narrationBridgeUrls lists the next chapter opening in playing order, stopping at the first group not ready', async () => {
  const [opening] = await ready(411)
  if (opening.status !== 'ready') throw new Error('expected ready')
  const second = { ...opening, paragraph: 1, chunks: opening.chunks.map(chunk => ({ ...chunk, url: chunk.url + '-p1' })) }
  const cold = { ...opening, paragraph: 2, status: 'pending' as const, chunks: opening.chunks.map(chunk => ({ ...chunk, ready: false, url: undefined })) }
  expect(narrationBridgeUrls([second, cold, opening])).toEqual([...opening.chunks.map(chunk => chunk.url), ...second.chunks.map(chunk => chunk.url + '')])
  expect(narrationBridgeUrls([cold])).toEqual([])
  expect(narrationBridgeUrls([{ paragraph: 0, status: 'failed', reason: 'x' }])).toEqual([])
})

it('reflects a pause iOS made on the element, and one Play tap resumes it', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  audio.currentTime = 4
  // A phone call: iOS pauses the element and refuses to restart it meanwhile.
  audio.refuse = true
  act(() => { audio.systemPause() })
  expect(h.result.current.playing).toBe(false)
  expect(session.playbackState).toBe('paused')
  // Let every automatic retry run out.
  await act(async () => { await vi.advanceTimersByTimeAsync(15_000) })
  expect(h.result.current.playing).toBe(false)
  audio.refuse = false
  const plays = audio.play.mock.calls.length
  act(() => { h.result.current.resume() })
  expect(audio.play.mock.calls.length).toBe(plays + 1)
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  expect(audio.currentTime).toBe(4)
  expect(session.playbackState).toBe('playing')
})

it('reconciles with the element when the page becomes visible again', async () => {
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  // A pause whose event the page never received (it was suspended).
  audio.paused = true
  act(() => { document.dispatchEvent(new Event('visibilitychange')) })
  await waitFor(() => expect(h.result.current.playing).toBe(false))
  expect(session.playbackState).toBe('paused')
})

it('resumes by itself after an interruption, but never after the reader paused', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  setVisibility('hidden')
  // A message ping: iOS pauses the element; the sound is over a moment later.
  audio.refuse = true
  act(() => { audio.systemPause() })
  const playsAtPing = audio.play.mock.calls.length
  await act(async () => { await vi.advanceTimersByTimeAsync(600) })
  audio.refuse = false
  await act(async () => { await vi.advanceTimersByTimeAsync(3_000) })
  expect(audio.play.mock.calls.length).toBeGreaterThan(playsAtPing)
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  expect(audio.paused).toBe(false)

  // The reader pauses (lock screen): nothing restarts it.
  act(() => { handlers.get('pause')!({ action: 'pause' }) })
  await act(async () => { await Promise.resolve() })
  const playsAtPause = audio.play.mock.calls.length
  await act(async () => { await vi.advanceTimersByTimeAsync(15_000) })
  act(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')) })
  expect(audio.play.mock.calls.length).toBe(playsAtPause)
  expect(h.result.current.playing).toBe(false)
  expect(audio.paused).toBe(true)
})

it('lock-screen Play on a hidden page calls play() on the element synchronously', async () => {
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  setVisibility('hidden')
  audio.currentTime = 4.5
  act(() => { handlers.get('pause')!({ action: 'pause' }) })
  expect(audio.paused).toBe(true)
  await waitFor(() => expect(h.result.current.playing).toBe(false))
  expect(session.playbackState).toBe('paused')

  const plays = audio.play.mock.calls.length
  handlers.get('play')!({ action: 'play' })
  expect(audio.play.mock.calls.length).toBe(plays + 1)
  expect(session.playbackState).toBe('playing')
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  expect(audio.currentTime).toBe(4.5)
})

it('lock-screen Play resumes at the same spot after the element lost its source while paused', async () => {
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  setVisibility('hidden')
  audio.currentTime = 6
  act(() => { handlers.get('pause')!({ action: 'pause' }) })
  await waitFor(() => expect(h.result.current.playing).toBe(false))
  // WebKit dropped the media while suspended.
  audio.src = ''
  const plays = audio.play.mock.calls.length
  handlers.get('play')!({ action: 'play' })
  expect(audio.play.mock.calls.length).toBe(plays + 1)
  expect(audio.playLog[audio.playLog.length - 1]).toContain('ezra-410-0')
  audio.dispatchEvent(new Event('loadedmetadata'))
  expect(audio.currentTime).toBe(6)
  await waitFor(() => expect(h.result.current.playing).toBe(true))
})

it('does not fight another app: a second interruption right after an automatic resume stays paused', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const audio = new FakeAudio()
  const { h } = await playingChapter(audio)
  act(() => { audio.systemPause() })
  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  // Music the reader started takes the audio again.
  act(() => { audio.systemPause() })
  const plays = audio.play.mock.calls.length
  await act(async () => { await vi.advanceTimersByTimeAsync(15_000) })
  expect(audio.play.mock.calls.length).toBe(plays)
  expect(h.result.current.playing).toBe(false)
  expect(session.playbackState).toBe('paused')
})
