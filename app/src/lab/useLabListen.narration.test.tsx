// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { narrationLookAheadWidth, useLabListen } from './useLabListen'
import { NarrationEnsureError, type NarrationParagraphResult, type NarrationParagraphState } from './labNarration'
import { chunkNarrationText, narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

const LONG = 'Now Neptune had gone off to the Ethiopians, who are at the world’s end, and lie in two halves, the one looking West and the other East. '
  + 'He had gone there to accept a hecatomb of sheep and oxen, and was enjoying himself at his festival; but the other gods met in the house of Olympian Jove, and the sire of gods and men spoke first. '
  + 'At that moment he was thinking of Aegisthus, who had been killed by Agamemnon’s son Orestes; so he said to the other gods what follows, and they listened with attention.'

const PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero.',
  'So now all who escaped death had got safely home.',
  LONG,
  'Meanwhile the other gods were assembled.',
]

/** A paragraph state with the first `ready` chunks playable, as the Worker would report it. */
async function state(index: number, ready: number, options: { words?: boolean; duration?: number; textHash?: string; failure?: { reason: string } } = {}): Promise<NarrationParagraphState> {
  const text = narrationTextForParagraph(PARAGRAPHS[index])
  const tokens = text.split(' ')
  const layout = chunkNarrationText(PARAGRAPHS[index])
  const perChunk = options.duration ?? 4
  const chunks = layout.map((chunk) => {
    const isReady = chunk.index < ready
    const count = chunk.wordTo - chunk.wordFrom
    return {
      index: chunk.index,
      wordFrom: chunk.wordFrom,
      wordTo: chunk.wordTo,
      ready: isReady,
      ...(isReady ? {
        hash: `hash-${index}-${chunk.index}`,
        url: `/api/audio-file?path=narration%2Ffish%2Fblob%2Fhash-${index}-${chunk.index}.mp3`,
        duration: perChunk,
        words: options.words === false ? null : tokens.slice(chunk.wordFrom, chunk.wordTo).map((word, i) => ({ text: word, start: (i * perChunk) / count, end: ((i + 1) * perChunk) / count })),
        timingsUsable: options.words !== false,
      } : {}),
    }
  })
  const complete = ready >= layout.length
  return {
    paragraph: index,
    status: complete ? 'ready' : ready > 0 ? 'partial' : 'pending',
    textHash: options.textHash ?? await sha256Hex(text),
    chunkCount: layout.length,
    readyChunks: Math.min(ready, layout.length),
    chunks,
    duration: complete ? perChunk * layout.length : undefined,
    words: complete && options.words !== false
      ? tokens.map((word, i) => ({ text: word, start: i * 0.1, end: i * 0.1 + 0.1 }))
      : null,
    timingsUsable: complete && options.words !== false,
    failure: options.failure,
  }
}

interface EnsureCall { fromChunks?: Record<number, number>; indexes: number[]; mode?: string; signal: AbortSignal; resolve: (results: NarrationParagraphResult[]) => void; reject: (error: Error) => void }

function harness(options: { voice?: string; speed?: number; prepared?: () => NarrationParagraphResult[] } = {}) {
  const pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1,
    pause: vi.fn(), load: vi.fn(),
    // Like a real element: removing the attribute empties `src`.
    removeAttribute: vi.fn((name: string) => { if (name === 'src') (audio as { src: string }).src = '' }),
    play: vi.fn(() => new Promise<void>((resolve, reject) => pending.push({ resolve, reject }))),
  })
  const calls: EnsureCall[] = []
  const ensure = vi.fn((indexes: number[], signal: AbortSignal, mode?: string, fromChunks?: Record<number, number>) => new Promise<NarrationParagraphResult[]>((resolve, reject) => {
    calls.push({ indexes, mode, fromChunks, signal, resolve, reject })
    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  }))
  // Kokoro manifest words for the same paragraphs must never paint over Fish audio.
  const followed = PARAGRAPHS.map((text, index) => ({
    index, text, file: `p${index}.mp3`, duration: 9,
    words: text.split(' ').map((word, i) => ({ text: word, start: i * 0.9, end: i * 0.9 + 0.9 })),
  }))
  const fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
  const followedCache = new Map<string[], Array<{ index: number; text: string }>>()
  const followedFor = (paragraphs: string[]) => {
    let entry = followedCache.get(paragraphs)
    if (!entry) { entry = paragraphs.map((text, index) => ({ index, text })); followedCache.set(paragraphs, entry) }
    return entry
  }
  type Props = { voice: string; narrationOn: boolean; edition: string; paragraphs?: string[] }
  const hook = renderHook(
    (props: Props) => useLabListen({
      guardPlaybackRequests: true,
      playbackSpeed: options.speed,
      bookId: 'odyssey',
      chapterNumber: 1,
      audioEdition: props.edition,
      paragraphs: props.paragraphs ?? PARAGRAPHS,
      followParagraphs: props.paragraphs ? followedFor(props.paragraphs) : followed,
      createAudio: () => audio,
      narration: props.narrationOn ? { voice: props.voice, ensure, prepared: options.prepared } : null,
    }),
    { initialProps: { voice: options.voice ?? 'a', narrationOn: true, edition: 'original-en' } as Props },
  )
  const rerenderWith = (paragraphs: string[]) => hook.rerender({ voice: options.voice ?? 'a', narrationOn: true, edition: 'original-en', paragraphs })
  /** Answer the latest call with the given ready counts per requested paragraph. */
  const answer = async (call: EnsureCall, readyByIndex: Record<number, number>, extra: Parameters<typeof state>[2] = {}) => {
    call.resolve(await Promise.all(call.indexes.map(index => state(index, readyByIndex[index] ?? 0, extra))))
  }
  return { ...hook, audio, pending, calls, ensure, fetchSpy, rerenderWith, answer }
}

const last = (h: ReturnType<typeof harness>) => h.calls[h.calls.length - 1]

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('useLabListen narration pilot (sentence groups)', () => {
  it('seeks directly to an uncached sentence group without preparing skipped groups', async () => {
    const h = harness()
    const layout = chunkNarrationText(PARAGRAPHS[2])
    const target = layout[layout.length - 1]
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: target.wordFrom }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.calls[0].indexes).toEqual([2])
    expect(h.calls[0].fromChunks).toEqual({ 2: target.index })
    const ready = await state(2, layout.length)
    ready.chunks = ready.chunks.map(chunk => chunk.index === target.index ? chunk : { index: chunk.index, wordFrom: chunk.wordFrom, wordTo: chunk.wordTo, ready: false })
    ready.status = 'partial'; ready.readyChunks = 1; ready.duration = undefined; ready.words = null
    await act(async () => h.calls[0].resolve([ready]))
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.audio.src).toContain('hash-2-' + target.index)
    expect(h.result.current.chapterDuration).toBeGreaterThan(4)
    h.unmount()
  })

  it('remembers an uncached word chosen while paused until explicit resume', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({paragraphIndex:0,wordIndex:0}) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    act(() => h.result.current.pause())
    await act(async () => { await Promise.resolve() })
    act(() => h.result.current.seekToPlace(3, 3))
    expect(h.calls.length).toBe(1)
    act(() => h.result.current.resume())
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.calls[1].indexes).toEqual([3])
    await act(async () => { await h.answer(h.calls[1], {3:1}) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.audio.currentTime).toBe(2)
    h.unmount()
  })

  it('opening a reader schedules no synthesis', async () => {
    const h = harness()
    await act(async () => { await Promise.resolve() })
    expect(h.ensure).not.toHaveBeenCalled()
    h.unmount()
  })

  it('retains the ended media element while the next generated clip arrives and ignores stale media events', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.calls.length).toBe(2))
    Object.assign(h.audio, { ended: true, currentTime: 4 })
    vi.mocked(h.audio.pause).mockClear()
    const previous = h.audio.src
    act(() => h.audio.dispatchEvent(new Event('ended')))
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 1 })
    expect(h.audio.src).toBe(previous)
    expect(h.audio.pause).not.toHaveBeenCalled()
    act(() => {
      h.audio.dispatchEvent(new Event('timeupdate'))
      h.audio.dispatchEvent(new Event('ended'))
    })
    expect(h.result.current.currentTime).toBe(0)
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 1 })
    // A lock-screen seek must use the pending clip's clock, not the previous
    // element's ended time that we retained to preserve the media session.
    act(() => h.result.current.seek(0))
    await act(async () => { await h.answer(h.calls[1], { 1: 1, 2: 1, 3: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-1-0.mp3')
    expect(h.audio.currentTime).toBe(0)
    expect(h.audio.pause).not.toHaveBeenCalled()
    h.unmount()
  })
  it('prepares the first sentence group before playing it and never touches the Kokoro manifest', async () => {
    const h = harness()
    let started: Promise<boolean> | undefined
    await act(async () => { started = h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.calls[0].indexes).toEqual([0])
    expect(h.calls[0].mode).toBe('next')
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.fetchSpy).not.toHaveBeenCalled()
    expect(h.result.current.followParagraphs.every(paragraph => !paragraph.words)).toBe(true)

    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(await started).toBe(true)
    expect(h.audio.src).toContain('hash-0-0.mp3')
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    expect(h.result.current.clips[0]).toMatchObject({ kind: 'paragraph', index: 0, chunk: { index: 0, count: 1 }, narration: { ready: true } })
    await act(async () => h.pending[0].resolve())
    expect(h.result.current.playing).toBe(true)
    expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 0, wordIndex: 0 })
  })

  it('plays a long paragraph as consecutive sentence-group clips while later groups arrive', async () => {
    const h = harness()
    const layout = chunkNarrationText(LONG)
    expect(layout.length).toBeGreaterThanOrEqual(3)
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 2: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.audio.src).toContain('hash-2-0.mp3')
    const chunkClips = h.result.current.clips.filter(clip => clip.kind === 'paragraph' && clip.index === 2)
    expect(chunkClips.length).toBe(layout.length)
    expect(chunkClips[1]).toMatchObject({ url: undefined, narration: { ready: false } })
    await act(async () => h.pending[0].resolve())

    // The look-ahead keeps asking, one group per round, for paragraphs 2..4.
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(last(h).indexes).toEqual([2, 3])
    await act(async () => { await h.answer(last(h), { 2: 2, 3: 0 }) })
    const second = h.result.current.clips.filter(clip => clip.kind === 'paragraph' && clip.index === 2)[1]
    expect(second).toMatchObject({ url: expect.stringContaining('hash-2-1'), chunk: { index: 1, wordFrom: layout[1].wordFrom } })

    // Reaching the end of group 0 flows into group 1 without a new request.
    const callsBefore = h.calls.length
    act(() => h.audio.dispatchEvent(new Event('ended')))
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-2-1.mp3')
    expect(h.result.current.clipIndex).toBe(h.result.current.clips.findIndex(clip => clip.kind === 'paragraph' && clip.index === 2 && clip.chunk?.index === 1))
    expect(h.calls.length).toBeGreaterThanOrEqual(callsBefore)
    await act(async () => h.pending[1].resolve())
    // Follow paint reports paragraph-level word indexes from the chunk's own timings.
    h.audio.currentTime = 0
    act(() => h.audio.dispatchEvent(new Event('timeupdate')))
    expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 2, wordIndex: layout[1].wordFrom })
  })

  it('downloads the next ready groups while one plays, so a boundary does not wait on the network', async () => {
    const h = harness()
    h.fetchSpy.mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })
    const layout = chunkNarrationText(LONG)
    expect(layout.length).toBeGreaterThanOrEqual(3)
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    // Every group of the paragraph is already made.
    await act(async () => { await h.answer(h.calls[0], { 2: layout.length }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.fetchSpy).toHaveBeenCalledTimes(2))
    expect(h.fetchSpy.mock.calls.map(([url, init]) => [url, init?.cache])).toEqual([
      [expect.stringContaining('hash-2-1.mp3'), 'force-cache'],
      [expect.stringContaining('hash-2-2.mp3'), 'force-cache'],
    ])
    // Moving on downloads only what is new, never a clip twice.
    act(() => h.audio.dispatchEvent(new Event('ended')))
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    const urls = h.fetchSpy.mock.calls.map(([url]) => String(url))
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every(url => !url.includes('hash-2-0'))).toBe(true)
  })

  it('at 3x prepares the next sentence groups side by side, so loading never becomes the barrier', async () => {
    expect([1, 1.25, 1.5, 2, 2.5, 3].map(narrationLookAheadWidth)).toEqual([1, 1, 2, 2, 3, 3])
    const h = harness({ speed: 3 })
    const layout = chunkNarrationText(LONG)
    expect(layout.length).toBeGreaterThanOrEqual(3)
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 0 }) })
    // The first group and the two after it are asked for at once, each by name.
    await waitFor(() => expect(h.calls.length).toBe(3))
    expect(h.calls.map(call => [call.indexes, call.fromChunks])).toEqual([[[2], { 2: 0 }], [[2], { 2: 1 }], [[2], { 2: 2 }]])
    // Answers arrive out of order; none takes back what another made playable.
    const only = async (call: EnsureCall, group: number) => {
      const empty = await state(2, 0)
      const full = await state(2, layout.length)
      call.resolve([{ ...empty, status: 'partial', readyChunks: 1, chunks: empty.chunks.map((chunk, i) => i === group ? full.chunks[i] : chunk) }])
    }
    await act(async () => {
      await only(h.calls[2], 2)
      await only(h.calls[1], 1)
      await only(h.calls[0], 0)
    })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.audio.playbackRate).toBe(3)
    expect(h.audio.src).toContain('hash-2-0.mp3')
    const clips = h.result.current.clips.filter(clip => clip.kind === 'paragraph' && clip.index === 2)
    expect(clips[1]).toMatchObject({ url: expect.stringContaining('hash-2-1') })
    expect(clips[2]).toMatchObject({ url: expect.stringContaining('hash-2-2') })
    // Listening on, the look-ahead asks only for what is still missing, never twice for one group.
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.calls.length).toBeGreaterThanOrEqual(4))
    const ahead = h.calls.slice(3)
    expect(new Set(ahead.map(call => JSON.stringify(call.fromChunks))).size).toBe(ahead.length)
    expect(ahead.map(call => call.fromChunks)).not.toContainEqual({ 2: 1 })
    expect(ahead.map(call => call.fromChunks)).not.toContainEqual({ 2: 2 })
  })

  it('at normal speed keeps to one request at a time', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 2: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.calls.length).toBe(2))
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(h.calls.length).toBe(2)
  })

  it('keeps the chapter clock moving forward across sentence-group boundaries', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 2: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.calls.length).toBe(2))
    await act(async () => { await h.answer(last(h), { 2: 2, 3: 0 }) })
    h.audio.currentTime = 3
    act(() => h.audio.dispatchEvent(new Event('timeupdate')))
    const before = h.result.current.chapterTime
    expect(before).toBeGreaterThan(3)
    act(() => h.audio.dispatchEvent(new Event('ended')))
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    h.audio.currentTime = 0
    await act(async () => h.pending[1].resolve())
    h.audio.currentTime = 0.5
    act(() => h.audio.dispatchEvent(new Event('timeupdate')))
    expect(h.result.current.chapterTime).toBeGreaterThan(before)
  })

  it('seeks to a word inside a later, unprepared sentence group after preparing it', async () => {
    const h = harness()
    const layout = chunkNarrationText(LONG)
    const target = layout[1].wordFrom + 2
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: target }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.calls[0].indexes).toEqual([2])
    await act(async () => { await h.answer(h.calls[0], { 2: 1 }) })
    // Group 0 is ready but the word lives in group 1: keep preparing.
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 2 })
    await act(async () => { await h.answer(h.calls[1], { 2: 2 }, { duration: 8 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.audio.src).toContain('hash-2-1.mp3')
    const count = layout[1].wordTo - layout[1].wordFrom
    expect(h.audio.currentTime).toBeCloseTo(2 * 8 / count, 3)
  })

  it('shows a failure with a retry instead of skipping or switching narrators', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([{ paragraph: 0, status: 'failed', reason: 'budget_exhausted', textHash: 'x' }]) })
    await waitFor(() => expect(h.result.current.narration.status).toBe('error'))
    expect(h.result.current.narration).toMatchObject({ status: 'error', paragraphIndex: 0, reason: 'budget_exhausted' })
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.result.current.playing).toBe(false)
    expect(h.audio.src).toBe('')

    act(() => h.result.current.retryNarration())
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
    await act(async () => { await h.answer(h.calls[1], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
  })

  it('reports transport failures from the ensure call as a retryable error', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].reject(new NarrationEnsureError('Sign in', 'unauthenticated', 401)) })
    await waitFor(() => expect(h.result.current.narration.status).toBe('error'))
    expect(h.result.current.narration).toMatchObject({ reason: 'unauthenticated', message: expect.stringContaining('Sign in') })
  })

  it('polls a pending recording another listener is generating', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const h = harness()
      await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
      await waitFor(() => expect(h.calls.length).toBe(1))
      await act(async () => { h.calls[0].resolve([{ ...(await state(0, 0)), retryAfterMs: 500 }]) })
      await act(async () => { await vi.advanceTimersByTimeAsync(600) })
      await waitFor(() => expect(h.calls.length).toBe(2))
      await act(async () => { await h.answer(h.calls[1], { 0: 1 }) })
      await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    } finally {
      vi.useRealTimers()
    }
  })

  it('aborts in-flight preparation and forgets prepared clips when the voice changes', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    const firstSignal = h.calls[0].signal
    await act(async () => { h.rerender({ voice: 'b', narrationOn: true, edition: 'original-en' }) })
    expect(firstSignal.aborted).toBe(true)
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    expect(h.result.current.clips).toEqual([])
    expect(h.result.current.playing).toBe(false)
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.calls[1].indexes).toEqual([0])
    expect(h.audio.play).not.toHaveBeenCalled()
  })

  it('drops prepared recordings when the edition changes and re-prepares for the new text', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => { h.rerender({ voice: 'a', narrationOn: true, edition: 'modern-en' }) })
    expect(h.result.current.clips).toEqual([])
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.filter(call => call.indexes[0] === 0).length).toBe(2))
  })

  it('ignores a ready recording whose text hash no longer matches the paragraph', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([await state(0, 1, { textHash: 'stale' })]) })
    await waitFor(() => expect(h.result.current.narration.status).toBe('error'))
    expect(h.audio.play).not.toHaveBeenCalled()
    const placeholder = h.result.current.clips[0]
    expect(placeholder.kind === 'paragraph' && placeholder.url).toBeUndefined()
    expect(placeholder.kind === 'paragraph' && placeholder.narration?.ready).toBe(false)
  })

  it('plays audio without word paint when the recording carries no usable timings', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }, { words: false }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    expect(h.result.current.followParagraphs[0].words).toBeUndefined()
    expect(h.result.current.follow).toEqual({ kind: 'paragraph', paragraphIndex: 0 })
  })

  it('stops with a retry when the prepared audio fails to load', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    act(() => h.audio.dispatchEvent(new Event('playing')))
    act(() => h.audio.dispatchEvent(new Event('error')))
    expect(h.result.current.playing).toBe(false)
    expect(h.result.current.narration).toMatchObject({ status: 'error', reason: 'playback' })
    expect(h.audio.play).toHaveBeenCalledTimes(1)
    act(() => h.result.current.retryNarration())
    expect(h.audio.play).toHaveBeenCalledTimes(2)
  })

  it('reuses prepared recordings after stop and start on the same tuple', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    act(() => h.result.current.stop())
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.calls.filter(call => call.indexes[0] === 0 && call.indexes.length === 1).length).toBe(1)
  })

  it('does not start playback on its own when the reader pauses while preparing', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
    act(() => h.result.current.pause())
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await act(async () => { await Promise.resolve() })
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.result.current.playing).toBe(false)
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(2))
    await act(async () => { await h.answer(h.calls[1], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
  })

  it('does not loop when a prepared entry no longer matches the paragraph text', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    act(() => h.result.current.stop())
    const changed = [...PARAGRAPHS]
    changed[0] = 'Sing to me, Muse, of the man of twists and turns.'
    await act(async () => { h.rerenderWith(changed) })
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.filter(call => call.indexes[0] === 0 && call.indexes.length === 1).length).toBe(2))
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
    const text = narrationTextForParagraph(changed[0])
    await act(async () => {
      const fresh = await state(0, 1, { words: false })
      last(h).resolve([{ ...fresh, textHash: await sha256Hex(text), chunks: fresh.chunks.map(chunk => ({ ...chunk, url: '/api/audio-file?path=narration%2Ffish%2Fblob%2Fhash-0b.mp3', wordTo: text.split(' ').length })) }])
    })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-0b')
  })

  it('keeps a paused seek into an unprepared paragraph paused', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }, { duration: 4 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    act(() => h.result.current.pause())
    await waitFor(() => expect(h.calls.length).toBe(2)) // look-ahead round
    act(() => { h.result.current.seek(30) })
    await act(async () => { await Promise.resolve() })
    expect(h.calls.length).toBe(2) // Seeking while paused cannot synthesize.
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    expect(h.audio.play).toHaveBeenCalledTimes(1)
    expect(h.result.current.playing).toBe(false)
    expect(h.result.current.clipIndex).toBe(1)
  })

  it('tapping a word ahead while listening silences the old chunk until the target is ready', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    act(() => h.audio.dispatchEvent(new Event('playing')))
    expect(h.result.current.playing).toBe(true)
    await waitFor(() => expect(h.calls.length).toBe(2)) // look-ahead [1, 2]
    const pauses = (h.audio.pause as ReturnType<typeof vi.fn>).mock.calls.length

    act(() => h.result.current.seekToPlace(3, 0))
    // The old chunk stops at once; its clock cannot paint the target's words.
    expect((h.audio.pause as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(pauses)
    expect(h.audio.removeAttribute).toHaveBeenCalledWith('src')
    expect(h.result.current.follow).toEqual({ kind: 'none' })
    await waitFor(() => expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 3 }))
    // An `ended` from the silenced element must not advance past the target.
    h.audio.src = ''
    act(() => h.audio.dispatchEvent(new Event('ended')))
    expect(h.audio.play).toHaveBeenCalledTimes(1)
    // The look-ahead round answers first, then the target's own round.
    await act(async () => { await h.answer(h.calls[1], { 1: 1, 2: 1 }) })
    await waitFor(() => expect(h.calls.length).toBe(3))
    expect(h.calls[2].indexes).toEqual([3])
    await act(async () => { await h.answer(h.calls[2], { 3: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-3-0.mp3')
    expect(h.result.current.clipIndex).toBe(h.result.current.clips.findIndex(clip => clip.kind === 'paragraph' && clip.index === 3))
  })

  it('resumes through preparation, never by replaying the previous chunk', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    await waitFor(() => expect(h.calls.length).toBe(2))
    // Paragraph 1 is not ready yet; playback reaches it.
    act(() => h.audio.dispatchEvent(new Event('ended')))
    await waitFor(() => expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 1 }))
    expect(h.result.current.src).toBeTruthy()
    expect(h.result.current.src).not.toContain('hash-0-0')
    act(() => h.result.current.pause())
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    // Play again: the shell sees a src and resumes; the hook prepares the target instead of replaying chunk 0.
    act(() => { h.result.current.resume() })
    await waitFor(() => expect(h.calls.length).toBe(3))
    await waitFor(() => expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 1 }))
    expect(h.audio.play).toHaveBeenCalledTimes(1)
    await act(async () => { await h.answer(h.calls[2], { 1: 1, 2: 0 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-1-0.mp3')
  })

  it('treats a rate limit as a short wait, not a failure', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const h = harness()
      await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
      await waitFor(() => expect(h.calls.length).toBe(1))
      await act(async () => { h.calls[0].reject(new NarrationEnsureError('Too many', 'rate_limited', 429)) })
      await act(async () => { await vi.advanceTimersByTimeAsync(3100) })
      await waitFor(() => expect(h.calls.length).toBe(2))
      expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
      await act(async () => { await h.answer(h.calls[1], { 0: 1 }) })
      await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    } finally {
      vi.useRealTimers()
    }
  })

  it('leaves the Kokoro path untouched when narration is off', async () => {
    const h = harness()
    await act(async () => { h.rerender({ voice: 'a', narrationOn: false, edition: 'original-en' }) })
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(h.ensure).not.toHaveBeenCalled()
    expect(h.audio.src).toContain('odyssey%2Foriginal-en%2Fch1%2Fp0.mp3')
    expect(h.result.current.followParagraphs[0].words?.[1].start).toBe(0.9)
  })
})


describe('cancellable inline playback loading', () => {
  it('is cancellable immediately, delays the spinner, and never starts a late prepared recording', async () => {
    const h = harness()
    act(() => { void h.result.current.start() })
    expect(h.result.current.pending).toBe(true)
    expect(h.result.current.loading).toBe(false)
    await waitFor(() => expect(h.calls).toHaveLength(1))
    await waitFor(() => expect(h.result.current.loading).toBe(true))
    await act(async () => { await h.result.current.start(); h.result.current.resume() })
    expect(h.calls).toHaveLength(1)
    const request = h.calls[0]
    act(() => h.result.current.pause())
    expect(request.signal.aborted).toBe(true)
    expect(h.result.current.pending).toBe(false)
    expect(h.result.current.loading).toBe(false)
    await act(async () => { await h.answer(request, { 0: 1 }) })
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.calls).toHaveLength(1)
  })

  it('keeps loading after preparation until native playback, and cancels a late native start', async () => {
    const h = harness()
    await act(async () => { void h.result.current.start() })
    await waitFor(() => expect(h.calls).toHaveLength(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledOnce())
    expect(h.result.current.narration.status).toBe('idle')
    expect(h.result.current.pending).toBe(true)
    await waitFor(() => expect(h.result.current.loading).toBe(true))
    act(() => h.result.current.pause())
    const pauses = vi.mocked(h.audio.pause).mock.calls.length
    await act(async () => { h.audio.dispatchEvent(new Event('playing')); h.pending[0].resolve() })
    expect(h.audio.pause).toHaveBeenCalledTimes(pauses + 1)
    expect(h.result.current.playing).toBe(false)
    expect(h.result.current.loading).toBe(false)
  })

  it('clears loading on native success and resumes cached audio without spinner flicker', async () => {
    const h = harness()
    await act(async () => { void h.result.current.start() })
    await waitFor(() => expect(h.calls).toHaveLength(1))
    await act(async () => { await h.answer(h.calls[0], { 0: 1 }) })
    await waitFor(() => expect(h.pending).toHaveLength(1))
    await act(async () => { h.audio.dispatchEvent(new Event('playing')); h.pending[0].resolve() })
    expect(h.result.current.pending).toBe(false)
    act(() => h.result.current.pause())
    await act(async () => { h.result.current.resume(); h.pending[1].resolve() })
    expect(h.result.current.playing).toBe(true)
    expect(h.result.current.pending).toBe(false)
    expect(h.result.current.loading).toBe(false)
  })

  it('shows a retryable failure instead of endless loading, then retries the same place', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 1 }) })
    await waitFor(() => expect(h.calls).toHaveLength(1))
    await act(async () => h.calls[0].reject(new Error('network')))
    expect(h.result.current.pending).toBe(false)
    expect(h.result.current.loading).toBe(false)
    expect(h.result.current.narration.status).toBe('error')
    act(() => h.result.current.retryNarration())
    expect(h.result.current.pending).toBe(true)
    await waitFor(() => expect(h.calls).toHaveLength(2))
    expect(h.calls[1].indexes).toEqual([1])
    await act(async () => { await h.answer(h.calls[1], { 1: 1 }) })
    await waitFor(() => expect(h.pending).toHaveLength(1))
    await act(async () => h.pending[0].resolve())
    expect(h.result.current.narration.status).toBe('idle')
    expect(h.result.current.pending).toBe(false)
  })

  it('clears pending loading when the voice or edition changes', async () => {
    const h = harness()
    await act(async () => { void h.result.current.start() })
    await waitFor(() => expect(h.calls).toHaveLength(1))
    h.rerender({ voice: 'm', narrationOn: true, edition: 'original-en' })
    expect(h.calls[0].signal.aborted).toBe(true)
    expect(h.result.current.pending).toBe(false)
    expect(h.result.current.loading).toBe(false)
    expect(h.audio.play).not.toHaveBeenCalled()
  })
})

it('ends a stalled start with a retryable timeout and aborts its preparation', async () => {
  const h = harness()
  vi.useFakeTimers()
  try {
    await act(async () => { await h.result.current.start() })
    expect(h.calls).toHaveLength(1)
    await act(async () => { await vi.advanceTimersByTimeAsync(45_000) })
    expect(h.calls[0].signal.aborted).toBe(true)
    expect(h.result.current.pending).toBe(false)
    expect(h.result.current.loading).toBe(false)
    expect(h.result.current.narration).toMatchObject({ status: 'error', reason: 'timeout' })
    expect(h.audio.play).not.toHaveBeenCalled()
  } finally { vi.useRealTimers() }
})

describe('prepared next-chapter handoff', () => {
 it('starts the warmed opening without another blocking ensure request', async () => {
  const prepared=await state(0,1)
  const h=harness({prepared:()=>[prepared]})
  await act(async()=>{void h.result.current.startAtPlace({paragraphIndex:0,wordIndex:0})})
  await waitFor(()=>expect(h.audio.play).toHaveBeenCalledTimes(1))
  // Requests for later paragraphs may refill the buffer in the background;
  // the opening itself starts before any of those unresolved calls finish.
  expect(h.calls.every(call => !call.indexes.includes(0))).toBe(true)
  expect(h.audio.src).toContain('hash-0-0')
  h.unmount()
 })
 it('rejects warmed audio for different text and prepares the current words', async () => {
  const prepared=await state(0,1,{textHash:'obsolete'})
  const h=harness({prepared:()=>[prepared]})
  await act(async()=>{void h.result.current.startAtPlace({paragraphIndex:0,wordIndex:0})})
  await waitFor(()=>expect(h.calls).toHaveLength(1))
  expect(h.audio.play).not.toHaveBeenCalled()
  h.unmount()
 })
})
