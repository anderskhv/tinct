// @vitest-environment jsdom
/**
 * Listen in the margin preview, the wiring: the frame's calls reach the book reader's player (useLabListen, mocked
 * here) as the book reader makes them, the chapter heard is loaded as the book reader loads it, and where listening
 * stops becomes the book reader's place. No audio and no narration request: the player and the loaders are mocks.
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_POSITION_STORAGE_KEY } from '../labPosition'
import { LAB_PREFS_KEY } from '../labPrefs'

const player = vi.hoisted(() => ({
  options: null as null | Record<string, unknown>,
  state: { playing: false, pending: false, src: null as string | null, follow: { kind: 'none' } as Record<string, unknown> },
  calls: [] as Array<[string, ...unknown[]]>,
}))
vi.mock('../useLabListen', () => ({
  narrationBridgeUrls: () => [],
  useLabListen: (options: Record<string, unknown>) => {
    player.options = options
    const call = (name: string) => (...args: unknown[]) => { player.calls.push([name, ...args]); return Promise.resolve(true) }
    return {
      ...player.state, buffering: false, isPending: () => player.state.pending, speed: 1.5, chapterTime: 0, chapterDuration: 0,
      narration: { status: 'idle' }, clipIndex: 0, currentTime: 0,
      start: call('start'), startAtPlace: call('startAtPlace'), seekToPlace: call('seekToPlace'), pause: call('pause'),
      resume: (...args: unknown[]) => { player.calls.push(['resume', ...args]); return true }, stop: call('stop'),
      handoffChapter: call('handoffChapter'), seek: call('seek'), seekChapter: call('seekChapter'), setSpeed: call('setSpeed'),
    }
  },
}))
vi.mock('../useNarrationPrefetch', () => ({ useNarrationPrefetch: () => {} }))
vi.mock('../useLabListenReport', () => ({ useLabListenReport: () => {} }))
vi.mock('../labAuth', () => ({ readSupabaseAccessToken: () => Promise.resolve(null) }))
const loads = vi.hoisted(() => [] as Array<Record<string, unknown>>)
vi.mock('../labSource', async (actual) => ({
  ...(await actual<typeof import('../labSource')>()),
  loadLabBookSource: (input: { chapterNumber: number }) => {
    loads.push(input)
    return Promise.resolve({
      bookId: 'frankenstein', chapterNumber: input.chapterNumber, chapterLabel: `Chapter ${input.chapterNumber}`,
      paragraphs: ['One two three.', 'Four five six.'], followParagraphs: [{ index: 0, text: 'One two three.' }, { index: 1, text: 'Four five six.' }],
      chapters: [{ number: 1, title: 'Chapter 1' }, { number: 2, title: 'Chapter 2' }, { number: 3, title: 'Chapter 3' }],
    })
  },
}))
vi.mock('../labNarration', async (actual) => ({
  ...(await actual<typeof import('../labNarration')>()),
  fetchNarrationPilotInfo: () => Promise.resolve({ enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female' }] }),
}))

const { useMarginListen } = await import('./useMarginListen')

function mount() {
  return renderHook(() => useMarginListen({ bookId: 'frankenstein', editionKey: 'modern-en' }))
}
const ready = () => waitFor(() => expect(player.options?.narration).toBeTruthy())

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({ audioSpeed: 1.5 }))
  player.calls = []; player.options = null; loads.length = 0
  player.state = { playing: false, pending: false, src: null, follow: { kind: 'none' } }
})
afterEach(() => vi.clearAllMocks())

describe('useMarginListen: the frame drives the book reader’s player', () => {
  it('Play at a place loads that chapter of the edition shown, then starts there; speed comes from the reader’s prefs', async () => {
    const { result } = mount()
    await ready()
    expect(player.options?.playbackSpeed).toBe(1.5)
    expect(player.options?.audioEdition).toBe('modern-en')
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 2 }))
    await waitFor(() => expect(player.calls).toContainEqual(['startAtPlace', { paragraphIndex: 1, wordIndex: 2 }]))
    expect(loads).toEqual([expect.objectContaining({ bookId: 'frankenstein', primaryEditionKey: 'modern-en', chapterNumber: 2 })])
    expect(player.options?.chapterNumber).toBe(2)
    expect(player.options?.paragraphs).toEqual(['One two three.', 'Four five six.'])
  })

  it('while playing that chapter, Play elsewhere in it moves the narration; pause, skip, the slider and speed pass through', async () => {
    const { result, rerender } = mount()
    await ready()
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(player.calls.some(c => c[0] === 'startAtPlace')).toBe(true))
    player.state = { playing: true, pending: false, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 0, wordIndex: 1 } }
    rerender()
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 0 }))
    act(() => { result.current.skip(-15); result.current.skip(15); result.current.seekChapter(42); result.current.setSpeed(2); result.current.pause() })
    expect(player.calls.slice(-6)).toEqual([['seekToPlace', 1, 0], ['seek', -15], ['seek', 15], ['seekChapter', 42], ['setSpeed', 2], ['pause']])
    expect(result.current.snapshot()).toMatchObject({ status: 'playing', chapterNumber: 2, follow: { paragraphIndex: 0, wordIndex: 1 }, speed: 1.5 })
  })

  it('a new speed is saved with the reader’s prefs, as the book reader saves it', async () => {
    mount()
    await ready()
    act(() => (player.options!.onPlaybackSpeedChange as (s: number) => void)(1.75))
    expect(JSON.parse(localStorage.getItem(LAB_PREFS_KEY)!).shared.audioSpeed).toBe(1.75)
  })

  it('where listening stops is the book reader’s place for the book: paused here, or on the lock screen', async () => {
    const { result, rerender } = mount()
    await ready()
    act(() => result.current.play({ chapterNumber: 3, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(player.options?.chapterNumber).toBe(3))
    player.state = { playing: true, pending: false, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 1, wordIndex: 2 } }
    rerender()
    player.state = { ...player.state, playing: false }
    rerender()
    const record = JSON.parse(localStorage.getItem(LAB_POSITION_STORAGE_KEY)!)
    expect(record.books.frankenstein).toMatchObject({ chapterNumber: 3, paragraphIndex: 1, wordIndex: 2, primaryEditionKey: 'modern-en' })
    expect(record.lastSettledBookId).toBe('frankenstein')
  })

  it('a chapter heard to its end hands the element over and starts the next chapter at its first word', async () => {
    const { result, rerender } = mount()
    await ready()
    act(() => result.current.play({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 0 }))
    await waitFor(() => expect(player.options?.chapterNumber).toBe(1))
    player.state = { playing: true, pending: false, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 1, wordIndex: 2 } }
    rerender()
    let accepted = false
    act(() => { accepted = (player.options!.onChapterComplete as () => boolean)() })
    expect(accepted).toBe(true)
    expect(player.calls).toContainEqual(['handoffChapter'])
    await waitFor(() => expect(player.calls).toContainEqual(['start', { paragraphIndex: 0, wordIndex: 0 }]))
    expect(player.options?.chapterNumber).toBe(2)
  })

  it('Close puts the transport away and keeps the place; resume goes on from the sentence heard', async () => {
    const { result, rerender } = mount()
    await ready()
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(player.options?.chapterNumber).toBe(2))
    player.state = { playing: false, pending: false, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 1, wordIndex: 0 } }
    rerender()
    expect(result.current.resume()).toBe(true)
    expect(player.calls).toContainEqual(['resume', true])
    act(() => result.current.stop())
    expect(result.current.snapshot().open).toBe(false)
    expect(JSON.parse(localStorage.getItem(LAB_POSITION_STORAGE_KEY)!).books.frankenstein).toMatchObject({ chapterNumber: 2, paragraphIndex: 1 })
  })

  it('the frame is told of every change', async () => {
    const { result, rerender } = mount()
    await ready()
    const seen: string[] = []
    const off = result.current.subscribe(s => seen.push(s.status))
    player.state = { playing: true, pending: false, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 0, wordIndex: 0 } }
    rerender()
    await waitFor(() => expect(seen).toContain('playing'))
    off()
  })
})
