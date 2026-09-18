// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLabListen } from './useLabListen'
import { NarrationEnsureError, type NarrationParagraphResult } from './labNarration'
import { narrationTextForParagraph, sha256Hex } from '../narration/narrationCore'

const PARAGRAPHS = [
  'Tell me, O Muse, of that ingenious hero.',
  'So now all who escaped death had got safely home.',
  'Now Neptune had gone off to the Ethiopians.',
  'Meanwhile the other gods were assembled.',
]

async function readyResult(index: number, options: { words?: boolean; duration?: number } = {}): Promise<NarrationParagraphResult> {
  const text = narrationTextForParagraph(PARAGRAPHS[index])
  const tokens = text.split(' ')
  const duration = options.duration ?? 4
  return {
    paragraph: index,
    status: 'ready',
    source: 'generated',
    url: `/api/audio-file?path=narration%2Ffish%2Fblob%2Fhash-${index}.mp3`,
    duration,
    words: options.words === false ? null : tokens.map((word, i) => ({ text: word, start: (i * duration) / tokens.length, end: ((i + 1) * duration) / tokens.length })),
    timingsUsable: options.words !== false,
    hash: `hash-${index}`,
    textHash: await sha256Hex(text),
  }
}

interface EnsureCall { indexes: number[]; signal: AbortSignal; resolve: (results: NarrationParagraphResult[]) => void; reject: (error: Error) => void }

function harness(options: { voice?: string; kokoroWords?: boolean } = {}) {
  const pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  const audio = new EventTarget() as HTMLAudioElement
  Object.assign(audio, {
    src: '', currentTime: 0, playbackRate: 1,
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    play: vi.fn(() => new Promise<void>((resolve, reject) => pending.push({ resolve, reject }))),
  })
  const calls: EnsureCall[] = []
  const ensure = vi.fn((indexes: number[], signal: AbortSignal) => new Promise<NarrationParagraphResult[]>((resolve, reject) => {
    calls.push({ indexes, signal, resolve, reject })
    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  }))
  // Kokoro manifest words for the same paragraphs must never paint over Fish audio.
  const followed = PARAGRAPHS.map((text, index) => ({
    index, text, file: `p${index}.mp3`, duration: 9,
    words: options.kokoroWords === false ? undefined : text.split(' ').map((word, i) => ({ text: word, start: i * 0.9, end: i * 0.9 + 0.9 })),
  }))
  const fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
  const hook = renderHook(
    (props: { voice: string; narrationOn: boolean; edition: string }) => useLabListen({
      guardPlaybackRequests: true,
      bookId: 'odyssey',
      chapterNumber: 1,
      audioEdition: props.edition,
      paragraphs: PARAGRAPHS,
      followParagraphs: followed,
      createAudio: () => audio,
      narration: props.narrationOn ? { voice: props.voice, ensure } : null,
    }),
    { initialProps: { voice: options.voice ?? 'a', narrationOn: true, edition: 'original-en' } },
  )
  return { ...hook, audio, pending, calls, ensure, fetchSpy }
}

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('useLabListen narration pilot', () => {
  it('prepares the first paragraph before playing it and never touches the Kokoro manifest', async () => {
    const h = harness()
    let started: Promise<boolean> | undefined
    await act(async () => { started = h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.calls[0].indexes).toEqual([0])
    expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 0 })
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.fetchSpy).not.toHaveBeenCalled()
    // Until Fish words arrive, no Kokoro timings are exposed for painting.
    expect(h.result.current.followParagraphs.every(paragraph => !paragraph.words)).toBe(true)

    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    expect(await started).toBe(true)
    expect(h.audio.src).toContain('narration%2Ffish%2Fblob%2Fhash-0.mp3')
    expect(h.result.current.narration).toEqual({ status: 'idle' })
    expect(h.result.current.clips[0]).toMatchObject({ kind: 'paragraph', index: 0, url: expect.stringContaining('hash-0'), narration: { ready: true } })
    expect(h.result.current.followParagraphs[0].words?.length).toBe(narrationTextForParagraph(PARAGRAPHS[0]).split(' ').length)
    await act(async () => h.pending[0].resolve())
    expect(h.result.current.playing).toBe(true)
    expect(h.result.current.follow).toMatchObject({ kind: 'word', paragraphIndex: 0 })
  })

  it('looks ahead a bounded number of paragraphs once playback starts, sharing in-flight work with a play request', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.calls[1].indexes).toEqual([1, 2])
    await act(async () => h.pending[0].resolve())

    // The reader reaches paragraph 1 before the look-ahead answered: no
    // duplicate request, the play waits on the same promise.
    act(() => h.audio.dispatchEvent(new Event('ended')))
    await waitFor(() => expect(h.result.current.narration).toEqual({ status: 'loading', paragraphIndex: 1 }))
    expect(h.calls.length).toBe(2)
    await act(async () => { h.calls[1].resolve([await readyResult(1), await readyResult(2)]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.audio.src).toContain('hash-1')
    expect(h.result.current.clipIndex).toBe(1)
    // Look-ahead from paragraph 1 asks only for paragraph 3; 2 is already prepared.
    await waitFor(() => expect(h.calls.length).toBe(3))
    expect(h.calls[2].indexes).toEqual([3])
  })

  it('seeks to a word inside an unprepared paragraph after preparing it', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 2, wordIndex: 3 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    expect(h.calls[0].indexes).toEqual([2])
    await act(async () => { h.calls[0].resolve([await readyResult(2, { duration: 8 })]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    const clip = h.result.current.clips[2]
    const count = narrationTextForParagraph(PARAGRAPHS[2]).split(' ').length
    expect(clip.kind === 'paragraph' && clip.words?.[3].start).toBeCloseTo(3 * 8 / count, 3)
    expect(h.audio.currentTime).toBeCloseTo(3 * 8 / count, 3)
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
    await act(async () => { h.calls[1].resolve([await readyResult(0)]) })
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
      await act(async () => { h.calls[0].resolve([{ paragraph: 0, status: 'pending', textHash: 'x', retryAfterMs: 500 }]) })
      await act(async () => { await vi.advanceTimersByTimeAsync(600) })
      await waitFor(() => expect(h.calls.length).toBe(2))
      await act(async () => { h.calls[1].resolve([await readyResult(0)]) })
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
    // A late answer from the old voice must not become the new voice's clip.
    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(2))
    expect(h.calls[1].indexes).toEqual([0])
    expect(h.audio.play).not.toHaveBeenCalled()
  })

  it('drops prepared recordings when the edition changes and re-prepares for the new text', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => { h.rerender({ voice: 'a', narrationOn: true, edition: 'modern-en' }) })
    expect(h.result.current.clips).toEqual([])
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(3))
    expect(h.calls[2].indexes).toEqual([0])
  })

  it('ignores a ready recording whose text hash no longer matches the paragraph', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    const stale = { ...(await readyResult(0)), textHash: 'stale' }
    await act(async () => { h.calls[0].resolve([stale]) })
    await waitFor(() => expect(h.result.current.narration.status).toBe('error'))
    expect(h.audio.play).not.toHaveBeenCalled()
    expect(h.result.current.clips[0]).toMatchObject({ url: undefined, narration: { ready: false } })
  })

  it('plays audio without word paint when the recording carries no usable timings', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([await readyResult(0, { words: false })]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    await act(async () => h.pending[0].resolve())
    expect(h.result.current.followParagraphs[0].words).toBeUndefined()
    expect(h.result.current.follow).toEqual({ kind: 'paragraph', paragraphIndex: 0 })
  })

  it('stops with a retry when the prepared audio fails to load', async () => {
    const h = harness()
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.calls.length).toBe(1))
    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
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
    await act(async () => { h.calls[0].resolve([await readyResult(0)]) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(1))
    act(() => h.result.current.stop())
    await act(async () => { void h.result.current.startAtPlace({ paragraphIndex: 0, wordIndex: 0 }) })
    await waitFor(() => expect(h.audio.play).toHaveBeenCalledTimes(2))
    expect(h.calls.filter(call => call.indexes.includes(0)).length).toBe(1)
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
