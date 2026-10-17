// @vitest-environment jsdom
// Narration must not stop by itself mid-chapter on a locked iPhone (Anders,
// 17 Oct 2026, driving: "sometimes after 10 minutes, sometimes after 20, the
// audio just pauses ... you have to go and look at the app again").
//
// The fake element models what WebKit does with the screen locked: once the
// element is idle (ended or paused), play() is refused unless it runs inside
// one of the element's own events. A silent element that keeps playing keeps
// the audio session, and the page, alive.
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  LAB_NARRATION_HOLD_SRC,
  NARRATION_BUFFER_TARGET_SECONDS,
  NARRATION_HIDDEN_BUFFER_TARGET_SECONDS,
  useLabListen,
} from './useLabListen'
import type { NarrationParagraphResult } from './labNarration'
import { chunkNarrationText, narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

async function paragraphState(chapter: string, index: number, text: string, isReady: boolean, duration = 10): Promise<NarrationParagraphResult> {
  const tokens = narrationTextForParagraph(text).split(' ')
  const chunks = chunkNarrationText(text).map(chunk => ({
    ...chunk,
    ready: isReady,
    ...(isReady ? {
      hash: `${chapter}-${index}-${chunk.index}`,
      url: `/api/audio-file?clip=${chapter}-${index}-${chunk.index}`,
      duration,
      timingsUsable: true,
      words: tokens.slice(chunk.wordFrom, chunk.wordTo).map((word, i) => ({ text: word, start: i / tokens.length * duration, end: (i + 1) / tokens.length * duration })),
    } : {}),
  }))
  return {
    paragraph: index,
    status: isReady ? 'ready' : 'pending',
    textHash: await sha256Hex(narrationTextForParagraph(text)),
    chunkCount: chunks.length,
    readyChunks: isReady ? chunks.length : 0,
    chunks,
    ...(isReady ? { duration: duration * chunks.length } : {}),
  }
}

/** A media element that behaves like WebKit's on a locked iPhone, for the parts the player relies on. */
class LockedPhoneAudio extends EventTarget {
  private source = ''
  private eventDepth = 0
  currentTime = 0
  duration = 10
  ended = false
  paused = true
  loop = false
  playbackRate = 1
  autoplay = false
  muted = false
  preload = ''
  error: { code: number } | null = null
  /** The screen is locked: an idle element may start only from its own event. */
  locked = false
  /** iOS refusing every start (a call in progress). */
  refuse = false
  playLog: Array<{ src: string; inEvent: boolean }> = []
  refusedLog: string[] = []
  get src() { return this.source }
  set src(value: string) {
    this.source = value ? new URL(value, 'https://tinct.app').href : ''
    this.paused = true
    this.ended = false
    this.error = null
    this.currentTime = 0
  }
  dispatchEvent(event: Event): boolean {
    this.eventDepth += 1
    try { return super.dispatchEvent(event) } finally { this.eventDepth -= 1 }
  }
  play = vi.fn(() => {
    const inEvent = this.eventDepth > 0
    this.playLog.push({ src: this.source, inEvent })
    if (this.refuse || (this.locked && this.paused && !inEvent)) {
      this.refusedLog.push(this.source)
      return Promise.reject(new DOMException('not allowed', 'NotAllowedError'))
    }
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
  finish() {
    this.currentTime = this.duration
    this.ended = true
    this.paused = true
    this.dispatchEvent(new Event('pause'))
    this.dispatchEvent(new Event('ended'))
  }
  /** A dropped connection in a car: the clip cannot be fetched. */
  networkError() {
    this.error = { code: 2 }
    this.paused = true
    this.dispatchEvent(new Event('error'))
  }
  /** iOS pausing the element itself: a navigation prompt, a call, Siri. */
  systemPause() { this.paused = true; this.dispatchEvent(new Event('pause')) }
  /** iOS resuming the element itself when the interruption ends. */
  systemResume() {
    this.paused = false
    this.dispatchEvent(new Event('play'))
    this.dispatchEvent(new Event('playing'))
  }
  tick(seconds = 0.25) {
    this.currentTime += seconds
    this.dispatchEvent(new Event('timeupdate'))
  }
  holding() { return isHold(this.source) && this.loop && !this.paused }
}

/** The hold's silence: made in memory (blob:) where the platform can, else the static file. */
function isHold(src: string) { return src.startsWith('blob:') || src.endsWith(LAB_NARRATION_HOLD_SRC) }
const holdSrc = expect.toSatisfy((src: string) => isHold(src))

type Handler = (details: MediaSessionActionDetails) => void
let handlers: Map<string, Handler>
let session: { metadata: unknown; playbackState: string; setActionHandler: (action: string, handler: Handler | null) => void; setPositionState: () => void }

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => state === 'hidden' })
}

function lockScreen(audio: LockedPhoneAudio) {
  setVisibility('hidden')
  audio.locked = true
  act(() => { document.dispatchEvent(new Event('visibilitychange')) })
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

const TWO = [
  'And the king said unto me, For what dost thou make request? So I prayed to the God of heaven.',
  'And I said unto the king, If it please the king, send me unto the city of my fathers.',
]
// Stable across renders, as the reader passes them.
const TWO_FOLLOWED = TWO.map((text, index) => ({ index, text }))

/**
 * A chapter whose first paragraph is ready and whose second is still being
 * made: every ensure waits on `answer`, which the test controls.
 */
async function slowNextGroup() {
  const audio = new LockedPhoneAudio()
  const opening = await paragraphState('neh', 0, TWO[0], true)
  const answers: Array<(results: NarrationParagraphResult[]) => void> = []
  const ensure = vi.fn((indexes: number[], signal: AbortSignal) => new Promise<NarrationParagraphResult[]>((resolve, reject) => {
    answers.push(resolve)
    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  }))
  const h = renderHook(() => useLabListen({
    guardPlaybackRequests: true, bookId: 'nehemiah', chapterNumber: 2, audioEdition: 'web-en',
    paragraphs: TWO, followParagraphs: TWO_FOLLOWED,
    createAudio: () => audio as unknown as HTMLAudioElement,
    narration: { voice: 'ara', prepared: () => [opening], ensure },
  }))
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await waitFor(() => expect(audio.src).toContain('neh-0-0'))
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  await waitFor(() => expect(h.result.current.pending).toBe(false))
  const answerAll = async (ready: boolean) => {
    const results = await Promise.all(TWO.map((text, index) => paragraphState('neh', index, text, index === 0 || ready)))
    act(() => { answers.splice(0).forEach(resolve => resolve(results)) })
    await act(async () => { await Promise.resolve() })
  }
  return { h, audio, ensure, answers, answerAll }
}

it('bridges a slow next sentence group with silence on the same element, then swaps inside an element event', async () => {
  const { h, audio, answerAll } = await slowNextGroup()
  lockScreen(audio)

  act(() => { audio.finish() })
  // Inside `ended`: the element keeps playing (silence) instead of going idle.
  expect(audio.holding()).toBe(true)
  expect(audio.playLog[audio.playLog.length - 1]).toEqual({ src: holdSrc, inEvent: true })
  await act(async () => { await Promise.resolve() })
  expect(h.result.current.playing).toBe(true)
  expect(session.playbackState).toBe('playing')

  // The next group arrives late, from the network, outside any element event.
  await answerAll(true)
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  expect(audio.refusedLog).toEqual([])
  expect(audio.holding()).toBe(true)

  // The silence's own clock event carries the swap; play() runs inside it.
  act(() => { audio.tick() })
  expect(audio.src).toContain('neh-1-0')
  expect(audio.playLog[audio.playLog.length - 1]).toEqual({ src: expect.stringContaining('neh-1-0'), inEvent: true })
  expect(audio.paused).toBe(false)
  expect(audio.loop).toBe(false)
  await waitFor(() => expect(h.result.current.pending).toBe(false))
  expect(audio.refusedLog).toEqual([])
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration).toEqual({ status: 'idle' })
  expect(session.playbackState).toBe('playing')
})

it('keeps holding through a long wait for the next group: no stall timeout, no give-up at the start ceiling', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const { h, audio, answers, answerAll } = await slowNextGroup()
  lockScreen(audio)
  const pausesBefore = audio.pause.mock.calls.length
  act(() => { audio.finish() })
  expect(audio.holding()).toBe(true)
  // Ninety seconds of "still being made", answered as it is asked.
  for (let elapsed = 0; elapsed < 90_000; elapsed += 1_000) {
    if (answers.length) await answerAll(false)
    await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
    act(() => { audio.tick(1) })
  }
  expect(audio.pause.mock.calls.length).toBe(pausesBefore)
  expect(audio.holding()).toBe(true)
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration.status).not.toBe('error')
  expect(session.playbackState).toBe('playing')

  await waitFor(() => expect(answers.length).toBeGreaterThan(0))
  await answerAll(true)
  act(() => { audio.tick() })
  expect(audio.src).toContain('neh-1-0')
  expect(audio.paused).toBe(false)
  expect(audio.refusedLog).toEqual([])
})

it('retries a clip after a network error from the same place on the same element, instead of stopping', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const { h, audio } = await slowNextGroup()
  lockScreen(audio)
  audio.currentTime = 4
  act(() => { audio.tick(0) })

  act(() => { audio.networkError() })
  // Not stopped: silence holds the session while the connection comes back.
  expect(audio.holding()).toBe(true)
  await act(async () => { await Promise.resolve() })
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration.status).not.toBe('error')

  // Still offline at the first retry.
  await act(async () => { await vi.advanceTimersByTimeAsync(1_100) })
  act(() => { audio.tick() })
  expect(audio.src).toContain('neh-0-0')
  act(() => { audio.networkError() })
  expect(audio.holding()).toBe(true)

  // Back online: the same recording, from the same second.
  await act(async () => { await vi.advanceTimersByTimeAsync(2_100) })
  act(() => { audio.tick() })
  expect(audio.src).toContain('neh-0-0')
  expect(audio.playLog[audio.playLog.length - 1]).toEqual({ src: expect.stringContaining('neh-0-0'), inEvent: true })
  act(() => { audio.dispatchEvent(new Event('loadedmetadata')) })
  expect(audio.currentTime).toBe(4)
  expect(audio.paused).toBe(false)
  await act(async () => { await Promise.resolve() })
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration).toEqual({ status: 'idle' })
  expect(audio.refusedLog).toEqual([])
  expect(session.playbackState).toBe('playing')
})

it('follows iOS resuming the element after a long interruption, and still never after the reader paused', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const { h, audio } = await slowNextGroup()
  lockScreen(audio)
  audio.currentTime = 3
  // A phone call longer than the automatic retries.
  audio.refuse = true
  act(() => { audio.systemPause() })
  await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
  expect(h.result.current.playing).toBe(false)
  audio.refuse = false
  const pauses = audio.pause.mock.calls.length
  // The call ends and iOS resumes the element itself.
  act(() => { audio.systemResume() })
  await act(async () => { await Promise.resolve() })
  expect(audio.pause.mock.calls.length).toBe(pauses)
  expect(audio.paused).toBe(false)
  expect(h.result.current.playing).toBe(true)
  expect(session.playbackState).toBe('playing')

  // The reader pauses: a late native start is silenced again.
  act(() => { handlers.get('pause')!({ action: 'pause' }) })
  await act(async () => { await Promise.resolve() })
  expect(h.result.current.playing).toBe(false)
  act(() => { audio.systemResume() })
  expect(audio.paused).toBe(true)
  expect(h.result.current.playing).toBe(false)
})

it('looks further ahead while the page is hidden', async () => {
  const texts = Array.from({ length: 80 }, (_, index) => `This is paragraph number ${index + 1} of the chapter, read aloud.`)
  // Twenty ready paragraphs of ten seconds: 200 s ahead, more than the visible target.
  const prepared = await Promise.all(texts.map((text, index) => paragraphState('long', index, text, index < 20)))
  const asked: number[][] = []
  const ensure = vi.fn(async (indexes: number[]) => {
    asked.push(indexes)
    return Promise.all(indexes.map(index => paragraphState('long', index, texts[index], true)))
  })
  const audio = new LockedPhoneAudio()
  const followedTexts = texts.map((text, index) => ({ index, text }))
  const h = renderHook(() => useLabListen({
    guardPlaybackRequests: true, bookId: 'nehemiah', chapterNumber: 3, audioEdition: 'web-en',
    paragraphs: texts, followParagraphs: followedTexts,
    createAudio: () => audio as unknown as HTMLAudioElement,
    narration: { voice: 'ara', prepared: () => prepared, ensure },
  }))
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)) })
  expect(20 * 10).toBeGreaterThan(NARRATION_BUFFER_TARGET_SECONDS)
  expect(asked).toEqual([])

  lockScreen(audio)
  await waitFor(() => expect(asked.length).toBeGreaterThan(0))
  expect(asked[0][0]).toBe(20)
  // It keeps going until the hidden target is covered.
  await waitFor(() => expect(Math.max(...asked.flat())).toBeGreaterThanOrEqual(NARRATION_HIDDEN_BUFFER_TARGET_SECONDS / 10 - 1))
})
