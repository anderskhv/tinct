// @vitest-environment jsdom
import { useEffect, useRef, useState } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabListen } from './useLabListen'
import { useNarrationPrefetch } from './useNarrationPrefetch'
import type { NarrationParagraphResult } from './labNarration'
import { chunkNarrationText, narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

// Excerpts from the reported WEB Ezra 7 -> 8 boundary, with real chapter IDs.
const text: Record<number, string[]> = {
  410: ["I was strengthened according to the hand of Yahweh my God on me, and I gathered together out of Israel chief men to go up with me."],
  411: ["Now these are the heads of their fathers' [houses], and this is the genealogy of those who went up with me from Babylon, in the reign of Artaxerxes the king:"],
}
const followed = Object.fromEntries(Object.entries(text).map(([chapter, paragraphs]) => [chapter, paragraphs.map((value, index) => ({ index, text: value }))]))
async function ready(chapter: number): Promise<NarrationParagraphResult[]> {
  const paragraph = text[chapter][0]
  const tokens = narrationTextForParagraph(paragraph).split(' ')
  const chunks = chunkNarrationText(paragraph).map(chunk => ({
    ...chunk, ready: true, hash: 'ezra-' + chapter,
    url: '/api/audio-file?clip=ezra-' + chapter, duration: 10, timingsUsable: true,
    words: tokens.slice(chunk.wordFrom, chunk.wordTo).map((word, index) => ({ text: word, start: index / tokens.length * 10, end: (index + 1) / tokens.length * 10 })),
  }))
  return [{ paragraph: 0, status: 'ready', textHash: await sha256Hex(narrationTextForParagraph(paragraph)), chunkCount: chunks.length, readyChunks: chunks.length, chunks, duration: 10 }]
}
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('warms Ezra 8 during Ezra 7 and starts it without a new blocking narration request', async () => {
  const cache = new Map<number, NarrationParagraphResult[]>([[410, await ready(410)]])
  const next = await ready(411)
  const ensure = vi.fn(async () => next)
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, duration: 10, ended: false, playbackRate: 1,
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    play: vi.fn(async () => {}),
  })
  const fetcher = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }))
  vi.stubGlobal('fetch', fetcher)
  const h = renderHook(() => {
    const [chapter, setChapter] = useState(410)
    const playerRef = useRef<ReturnType<typeof useLabListen> | null>(null)
    const player = useLabListen({
      guardPlaybackRequests: true, bookId: 'bible', chapterNumber: chapter, audioEdition: 'web-en',
      paragraphs: text[chapter], followParagraphs: followed[chapter], createAudio: () => audio,
      narration: { voice: 'ara', prepared: () => cache.get(chapter) ?? [], ensure },
      onChapterComplete: () => {
        if (chapter !== 410) return false
        playerRef.current!.handoffChapter()
        setChapter(411)
        return true
      },
    })
    playerRef.current = player
    useNarrationPrefetch({
      active: player.playing, voice: 'ara', bookId: 'bible', editionKey: 'web-en',
      chapter, nextChapter: chapter === 410 ? 411 : null, paragraphCount: 1,
      currentParagraph: 0, remainingSeconds: 10, authToken: 'test-token',
      ensureImpl: ensure, onPrepared: (target, results) => cache.set(target, results),
    })
    useEffect(() => { void playerRef.current!.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) }, [chapter])
    return { chapter, player }
  })
  await waitFor(() => expect(cache.has(411)).toBe(true))
  await waitFor(() => expect(audio.src).toContain('ezra-410'))
  await waitFor(() => expect(h.result.current.player.pending).toBe(false))
  expect(ensure.mock.calls.length).toBeGreaterThan(0)
  expect(fetcher.mock.calls.some(call => String(call[0]).includes('ezra-411'))).toBe(true)
  const requestsBeforeBoundary = ensure.mock.calls.length
  act(() => { Object.assign(audio, { currentTime: 10, ended: true }); audio.dispatchEvent(new Event('ended')) })
  await waitFor(() => expect(h.result.current.chapter).toBe(411))
  await waitFor(() => expect(audio.src).toContain('ezra-411'))
  await waitFor(() => expect(h.result.current.player.pending).toBe(false))
  expect(audio.currentTime).toBe(0)
  expect(ensure.mock.calls.length).toBe(requestsBeforeBoundary)
  expect(audio.play).toHaveBeenCalledTimes(2)
})

it('continues into a next chapter still being made: waits calmly, never errors, starts when it lands', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    const cache = new Map<number, NarrationParagraphResult[]>([[410, await ready(410)]])
    const next = await ready(411)
    const landedState = next[0]
    if (landedState.status !== 'ready') throw new Error('expected ready')
    const cold: NarrationParagraphResult[] = [{ ...landedState, status: 'pending', readyChunks: 0, duration: undefined,
      chunks: landedState.chunks.map(chunk => ({ index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: false })), retryAfterMs: 1000 }]
    let landed = false
    const warmCalls: number[] = []
    // The warm (prefetch) and the player both see "still being made" until it lands.
    const warm = vi.fn(async (request: { chapter: number }) => { warmCalls.push(request.chapter); return landed ? next : cold })
    const ensure = vi.fn(async () => (landed ? next : cold))
    const audio = new EventTarget() as HTMLAudioElement
    Object.assign(audio, {
      src: '', currentTime: 0, duration: 10, ended: false, playbackRate: 1,
      pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
      play: vi.fn(async () => {}),
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) })))
    const h = renderHook(() => {
      const [chapter, setChapter] = useState(410)
      const playerRef = useRef<ReturnType<typeof useLabListen> | null>(null)
      const player = useLabListen({
        guardPlaybackRequests: true, bookId: 'bible', chapterNumber: chapter, audioEdition: 'web-en',
        paragraphs: text[chapter], followParagraphs: followed[chapter], createAudio: () => audio,
        narration: { voice: 'ara', prepared: () => cache.get(chapter) ?? [], ensure },
        onChapterComplete: () => {
          if (chapter !== 410) return false
          playerRef.current!.handoffChapter()
          setChapter(411)
          return true
        },
      })
      playerRef.current = player
      useNarrationPrefetch({
        active: player.playing, voice: 'ara', bookId: 'bible', editionKey: 'web-en',
        chapter, nextChapter: chapter === 410 ? 411 : null, paragraphCount: 1,
        currentParagraph: 0, remainingSeconds: 10, authToken: 'test-token',
        ensureImpl: warm as never, onPrepared: (target, results) => cache.set(target, results),
      })
      useEffect(() => { void playerRef.current!.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) }, [chapter])
      return { chapter, player }
    })
    await waitFor(() => expect(audio.src).toContain('ezra-410'))
    // Near the end of chapter 410 the next chapter's opening was asked for ahead of time.
    await waitFor(() => expect(warmCalls).toContain(411))
    act(() => { Object.assign(audio, { currentTime: 10, ended: true }); audio.dispatchEvent(new Event('ended')) })
    await waitFor(() => expect(h.result.current.chapter).toBe(411))
    for (let second = 0; second < 20; second += 1) {
      await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
      expect(h.result.current.player.narration.status).not.toBe('error')
    }
    expect(h.result.current.player.narration).toMatchObject({ status: 'loading', waiting: true })
    landed = true
    await act(async () => { await vi.advanceTimersByTimeAsync(5_100) })
    await waitFor(() => expect(audio.src).toContain('ezra-411'))
    expect(h.result.current.player.narration).toEqual({ status: 'idle' })
  } finally {
    vi.useRealTimers()
  }
})
