// @vitest-environment jsdom
// Gapless narration (tester report, 20 Oct 2026: "often he thinks 'oh it
// stopped', and then it continues"). The recordings after the playing one are
// downloaded whole ahead of their turn, by listening time, into the next
// chapter's opening too; a boundary swaps the same element to the copy in
// memory, inside `ended`, at the one playback speed. A wait for audio
// mid-recording shows in the transport instead of as silence.
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLabListen } from './useLabListen'
import type { NarrationParagraphResult } from './labNarration'
import { CLIP_BUFFER_SAVE_DATA_SECONDS, CLIP_BUFFER_VISIBLE_SECONDS, clipUrlOfSource } from './narrationClipBuffer'
import { chunkNarrationText, narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

const CLIP_SECONDS = 20
const paragraphs = Array.from({ length: 16 }, (_, index) => `Paragraph ${index} tells the story onward, and the voice reads it aloud.`)
const followParagraphs = paragraphs.map((text, index) => ({ index, text }))
const clipUrl = (chapter: number, paragraph: number) => `/api/audio-file?clip=c${chapter}-p${paragraph}`

async function ready(chapter: number): Promise<NarrationParagraphResult[]> {
  return Promise.all(paragraphs.map(async (paragraph, index) => {
    const chunks = chunkNarrationText(paragraph).map(chunk => ({
      ...chunk, ready: true, hash: `c${chapter}-p${index}`, url: clipUrl(chapter, index), duration: CLIP_SECONDS, timingsUsable: false,
    }))
    return { paragraph: index, status: 'ready' as const, textHash: await sha256Hex(narrationTextForParagraph(paragraph)), chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: CLIP_SECONDS }
  }))
}

class FakeAudio extends EventTarget {
  private source = ''
  currentTime = 0
  duration = CLIP_SECONDS
  ended = false
  paused = true
  playbackRate = 1
  autoplay = false
  muted = false
  loop = false
  preload = ''
  error: { code: number } | null = null
  playLog: Array<{ src: string; rate: number }> = []
  get src() { return this.source }
  set src(value: string) { this.source = value; this.paused = true; this.ended = false; this.currentTime = 0; this.error = null }
  play = vi.fn(() => {
    this.playLog.push({ src: this.source, rate: this.playbackRate })
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
}

let fetched: string[]

beforeEach(() => {
  fetched = []
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    fetched.push(String(url))
    return { ok: true, arrayBuffer: async () => new Uint8Array(64).buffer }
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  delete (navigator as { connection?: unknown }).connection
})

async function playing(options: { speed?: number; nextChapter?: boolean } = {}) {
  const audio = new FakeAudio()
  const current = await ready(1)
  const next = await ready(2)
  const h = renderHook(() => useLabListen({
    guardPlaybackRequests: true, bookId: 'frankenstein', chapterNumber: 1, audioEdition: 'original-en',
    paragraphs, followParagraphs, playbackSpeed: options.speed,
    createAudio: () => audio as unknown as HTMLAudioElement,
    narration: { voice: 'f', prepared: () => current, ensure: vi.fn(async () => current) },
    nextChapterAudio: options.nextChapter ? () => ({ chapterNumber: 2, urls: next.flatMap(result => result.status === 'ready' ? result.chunks.map(chunk => chunk.url!) : []) }) : undefined,
  }))
  await act(async () => { await h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
  await waitFor(() => expect(h.result.current.playing).toBe(true))
  await waitFor(() => expect(h.result.current.pending).toBe(false))
  return { h, audio }
}

const settle = () => act(async () => { for (let i = 0; i < 40; i += 1) await Promise.resolve() })

it('downloads two minutes of recordings ahead, nearest first, while the page is visible', async () => {
  const { audio } = await playing()
  await settle()
  // The playing clip's remaining 20 s count toward the window.
  const ahead = Math.ceil((CLIP_BUFFER_VISIBLE_SECONDS - CLIP_SECONDS) / CLIP_SECONDS)
  expect(ahead).toBe(5)
  await waitFor(() => expect(fetched.length).toBeGreaterThanOrEqual(ahead))
  expect(fetched.slice(0, ahead)).toEqual(Array.from({ length: ahead }, (_, index) => clipUrl(1, index + 1)))
  // Never more than the window (plus the clip that crosses its edge).
  expect(fetched.length).toBeLessThanOrEqual(ahead + 1)
  expect(new Set(fetched).size).toBe(fetched.length)
  expect(audio.src).toBe(clipUrl(1, 0))
})

it('swaps to the downloaded copy inside ended, on the same element, at the one speed', async () => {
  const { h, audio } = await playing({ speed: 1.5 })
  await settle()
  await waitFor(() => expect(fetched).toContain(clipUrl(1, 1)))
  await settle()
  const plays = audio.play.mock.calls.length
  act(() => { audio.finish() })
  // Synchronously, from the event: no request, no React render in between.
  expect(audio.play.mock.calls.length).toBe(plays + 1)
  const last = audio.playLog[audio.playLog.length - 1]
  expect(last.src).toMatch(/^blob:/)
  expect(clipUrlOfSource(last.src)).toBe(clipUrl(1, 1))
  // Invariant 5: the rate is set on the swap and again on play.
  expect(audio.playbackRate).toBe(1.5)
  await settle()
  expect(audio.playbackRate).toBe(1.5)
  expect(h.result.current.clipIndex).toBe(1)
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.narration).toEqual({ status: 'idle' })
})

it('has the next chapter opening downloaded before this chapter ends', async () => {
  const { audio } = await playing({ nextChapter: true })
  // Walk to the last two paragraphs: the chapter's remaining audio is inside the window.
  for (let paragraph = 0; paragraph < paragraphs.length - 2; paragraph += 1) {
    act(() => { audio.finish() })
    await settle()
  }
  await waitFor(() => expect(fetched).toContain(clipUrl(2, 0)))
  const firstNext = fetched.indexOf(clipUrl(2, 0))
  expect(fetched.slice(0, firstNext)).toContain(clipUrl(1, paragraphs.length - 1))
})

it('keeps a shorter window with Save-Data on', async () => {
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } })
  await playing()
  await settle()
  // 45 s: the playing clip plus the two after it that a boundary always has.
  const ahead = Math.max(2, Math.ceil((CLIP_BUFFER_SAVE_DATA_SECONDS - CLIP_SECONDS) / CLIP_SECONDS))
  expect(ahead).toBe(2)
  await waitFor(() => expect(fetched.length).toBeGreaterThanOrEqual(ahead))
  await settle()
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(fetched).toEqual([clipUrl(1, 1), clipUrl(1, 2)])
})

it('shows a wait for audio mid-recording in the transport, and clears it when sound resumes', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const { h, audio } = await playing()
  act(() => { audio.dispatchEvent(new Event('waiting')) })
  // A blip never flashes the ring.
  expect(h.result.current.buffering).toBe(false)
  await act(async () => { vi.advanceTimersByTime(400) })
  expect(h.result.current.buffering).toBe(true)
  expect(h.result.current.playing).toBe(true)
  expect(h.result.current.pending).toBe(false)
  act(() => { audio.dispatchEvent(new Event('playing')) })
  expect(h.result.current.buffering).toBe(false)
  // A pause clears it too, and a later wait before the delay shows nothing.
  act(() => { audio.dispatchEvent(new Event('waiting')) })
  act(() => { h.result.current.pause() })
  await act(async () => { vi.advanceTimersByTime(400) })
  expect(h.result.current.buffering).toBe(false)
})

it('streams the recording itself, from the same place, when its downloaded copy will not play', async () => {
  const { h, audio } = await playing()
  await settle()
  await waitFor(() => expect(fetched).toContain(clipUrl(1, 1)))
  await settle()
  act(() => { audio.finish() })
  expect(audio.src).toMatch(/^blob:/)
  await settle()
  audio.currentTime = 4
  audio.error = { code: 4 }
  act(() => { audio.dispatchEvent(new Event('error')) })
  expect(audio.src).toBe(clipUrl(1, 1))
  await settle()
  expect(audio.currentTime).toBe(4)
  expect(h.result.current.clipIndex).toBe(1)
  expect(h.result.current.narration).toEqual({ status: 'idle' })
})

describe('a recording that stalls mid-clip (iPhone, 20 Oct 2026: stopped on "say", still showing Pause)', () => {
  let session: { playbackState: string; metadata: unknown; setActionHandler: () => void; setPositionState: () => void }
  beforeEach(() => {
    session = { playbackState: 'none', metadata: null, setActionHandler: () => {}, setPositionState: () => {} }
    Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: session })
  })
  afterEach(() => { delete (navigator as { mediaSession?: unknown }).mediaSession })

  it('notices the clock standing still, says so, and recovers the same second at the same speed', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { h, audio } = await playing({ speed: 1.5 })
    audio.currentTime = 7
    act(() => { audio.dispatchEvent(new Event('timeupdate')) })
    expect(session.playbackState).toBe('playing')
    const plays = audio.play.mock.calls.length
    // The element keeps saying it plays; its clock does not move.
    await act(async () => { vi.advanceTimersByTime(2_100) })
    expect(h.result.current.buffering).toBe(true)
    expect(session.playbackState).toBe('paused')
    // First a nudge in place (play, as the stall is noticed), then a reload of the same recording from the stalled second.
    expect(audio.play.mock.calls.length).toBeGreaterThan(plays)
    expect(session.playbackState).toBe('paused')
    const loads = audio.playLog.length
    audio.playbackRate = 1
    await act(async () => { vi.advanceTimersByTime(1_500) })
    expect(audio.playLog.length).toBeGreaterThan(loads)
    expect(clipUrlOfSource(audio.src)).toBe(clipUrl(1, 0))
    expect(audio.currentTime).toBe(7)
    expect(audio.playbackRate).toBe(1.5)
    // Sound again: the transport and the lock screen follow.
    audio.currentTime = 7.4
    act(() => { audio.dispatchEvent(new Event('timeupdate')) })
    expect(h.result.current.buffering).toBe(false)
    expect(session.playbackState).toBe('playing')
    expect(h.result.current.playing).toBe(true)
  })

  it('in front of the reader, stops honestly with Retry after its tries run out', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { h, audio } = await playing()
    audio.currentTime = 3
    act(() => { audio.dispatchEvent(new Event('timeupdate')) })
    await act(async () => { vi.advanceTimersByTime(45_000) })
    expect(h.result.current.playing).toBe(false)
    expect(h.result.current.buffering).toBe(false)
    expect(h.result.current.narration).toMatchObject({ status: 'error', reason: 'stalled' })
    expect(session.playbackState).toBe('paused')
    act(() => { h.result.current.retryNarration() })
    expect(clipUrlOfSource(audio.src)).toBe(clipUrl(1, 0))
    expect(audio.currentTime).toBe(3)
  })

  it('a reader pause is never a stall', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { h, audio } = await playing()
    act(() => { h.result.current.pause() })
    const plays = audio.play.mock.calls.length
    await act(async () => { vi.advanceTimersByTime(10_000) })
    expect(audio.play.mock.calls.length).toBe(plays)
    expect(h.result.current.buffering).toBe(false)
  })
})
