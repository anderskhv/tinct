// @vitest-environment jsdom
/**
 * Listen for a reader's own book in the margin reader (Anders, 22 Oct 2026: Tinct's voice for every book): the
 * frame hands its chapters over (attachOwn), the player reads them through the own-book route with the book's hex
 * (ensureOwnNarration, as the book reader sends it), nothing is kept in the replay cache, the place stays the frame's,
 * and a reader without Premium is sent to the account (onPremiumRequired). The player and the route are mocks.
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LAB_POSITION_STORAGE_KEY } from '../labPosition'
import { LAB_PREFS_KEY } from '../labPrefs'

const player = vi.hoisted(() => ({
  options: null as null | Record<string, unknown>,
  state: { playing: false, pending: false, src: null as string | null, follow: { kind: 'none' } as Record<string, unknown>, narration: { status: 'idle' } as Record<string, unknown> },
  calls: [] as Array<[string, ...unknown[]]>,
}))
vi.mock('../useLabListen', () => ({
  narrationBridgeUrls: () => [],
  useLabListen: (options: Record<string, unknown>) => {
    player.options = options
    const call = (name: string) => (...args: unknown[]) => { player.calls.push([name, ...args]); return Promise.resolve(true) }
    return {
      ...player.state, buffering: false, isPending: () => player.state.pending, speed: 1, chapterTime: 0, chapterDuration: 0, clipIndex: 0, currentTime: 0,
      start: call('start'), startAtPlace: call('startAtPlace'), seekToPlace: call('seekToPlace'), pause: call('pause'), dismissNarration: call('dismissNarration'),
      resume: () => true, stop: call('stop'), handoffChapter: call('handoffChapter'), seek: call('seek'), seekChapter: call('seekChapter'), setSpeed: call('setSpeed'),
    }
  },
}))
const reports = vi.hoisted(() => [] as Array<[boolean, string]>)
vi.mock('../useLabListenReport', () => ({ useLabListenReport: (playing: boolean, bookId: string) => { reports.push([playing, bookId]) } }))
vi.mock('../labAuth', () => ({ readSupabaseAccessToken: () => Promise.resolve('token') }))
const loads = vi.hoisted(() => [] as unknown[])
vi.mock('../labSource', async (actual) => ({ ...(await actual<typeof import('../labSource')>()), loadLabBookSource: (input: unknown) => { loads.push(input); return Promise.reject(new Error('not for own books')) } }))
const ensures = vi.hoisted(() => ({ own: [] as unknown[], shared: [] as unknown[] }))
vi.mock('../labNarration', async (actual) => ({
  ...(await actual<typeof import('../labNarration')>()),
  fetchNarrationPilotInfo: () => Promise.resolve({ enabled: true, provider: 'grok', voices: [{ key: 'f', label: 'Ara', persona: 'female' }], ownBooks: true }),
  ensureOwnNarration: (request: unknown, options: unknown) => { ensures.own.push([request, options]); return Promise.resolve([]) },
  ensureNarration: (request: unknown) => { ensures.shared.push(request); return Promise.resolve([]) },
}))

const { useMarginListen } = await import('./useMarginListen')
const HEX = 'ab'.repeat(12)
const chapters = [{ number: 1, title: 'Title page' }, { number: 2, title: 'p. 2' }, { number: 3, title: 'p. 3' }]
const frameText = (skipTo?: number) => ({
  chapters: () => chapters,
  chapter: vi.fn(async (n: number) => ({ number: skipTo ?? n, title: `p. ${skipTo ?? n}`, paragraphs: ['One two three.', 'Four five six.'] })),
})

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({ audioSpeed: 1 }))
  player.calls = []; player.options = null; loads.length = 0; reports.length = 0; ensures.own = []; ensures.shared = []
  player.state = { playing: false, pending: false, src: null, follow: { kind: 'none' }, narration: { status: 'idle' } }
})
afterEach(() => vi.clearAllMocks())

function mount(onPremiumRequired = vi.fn()) {
  const own = { hex: HEX, onPremiumRequired }
  return { ...renderHook(() => useMarginListen({ bookId: `userbook-${HEX}`, editionKey: 'own', own })), onPremiumRequired }
}
const ready = () => waitFor(() => expect(player.options?.narration).toBeTruthy())

describe('useMarginListen with an own book', () => {
  it('Play reads the frame\'s chapter: its paragraphs, through the own-book route with the hex, from the place asked', async () => {
    const { result } = mount()
    await ready()
    const text = frameText()
    act(() => result.current.attachOwn!(text))
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 2 }))
    await waitFor(() => expect(player.calls).toContainEqual(['startAtPlace', { paragraphIndex: 1, wordIndex: 2 }]))
    expect(text.chapter).toHaveBeenCalledWith(2)
    expect(loads).toEqual([])
    expect(player.options).toMatchObject({ chapterNumber: 2, paragraphs: ['One two three.', 'Four five six.'], audioEdition: 'own', coverSrc: undefined })
    const narration = player.options!.narration as { ensure: (i: number[], s: AbortSignal) => Promise<unknown>; prepared: () => unknown[] }
    await narration.ensure([1], new AbortController().signal)
    expect(ensures.own).toEqual([[{ bookHex: HEX, voice: 'f', paragraphs: [{ index: 1, text: 'Four five six.', fromChunk: undefined }], mode: 'next' }, expect.objectContaining({ authToken: 'token' })]])
    expect(ensures.shared).toEqual([])
    expect(narration.prepared()).toEqual([])
  })

  it('a chapter without text is passed over: the next one starts at its top', async () => {
    const { result } = mount()
    await ready()
    act(() => result.current.attachOwn!(frameText(3)))
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 4, wordIndex: 7 }))
    await waitFor(() => expect(player.calls).toContainEqual(['startAtPlace', { paragraphIndex: 0, wordIndex: 0 }]))
    expect(player.options?.chapterNumber).toBe(3)
  })

  it('the place stays the frame\'s, and no listening time is reported with the book\'s id', async () => {
    const { result, rerender } = mount()
    await ready()
    act(() => result.current.attachOwn!(frameText()))
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(player.options?.chapterNumber).toBe(2))
    player.state = { ...player.state, playing: true, src: 'blob:clip', follow: { kind: 'word', paragraphIndex: 1, wordIndex: 1 } }
    rerender()
    player.state = { ...player.state, playing: false }
    rerender()
    act(() => result.current.stop())
    expect(localStorage.getItem(LAB_POSITION_STORAGE_KEY)).toBeNull()
    expect(reports.every(([playing]) => playing === false)).toBe(true)
  })

  it('not Premium: the request is put away and the account is opened, once', async () => {
    const { rerender, onPremiumRequired } = mount()
    await ready()
    player.state = { ...player.state, narration: { status: 'error', paragraphIndex: 0, message: 'x', reason: 'own_book_premium' } }
    rerender()
    expect(onPremiumRequired).toHaveBeenCalledTimes(1)
    expect(player.calls).toContainEqual(['dismissNarration'])
    expect(player.calls).toContainEqual(['pause'])
  })

  it('any other failure (5xx, a timeout): no read aloud for the book from then on, never another voice', async () => {
    const { result, rerender, onPremiumRequired } = mount()
    await ready()
    expect(result.current.snapshot().available).toBe(true)
    player.state = { ...player.state, src: 'blob:clip', narration: { status: 'error', paragraphIndex: 0, message: 'x', reason: 'http' } }
    rerender()
    expect(onPremiumRequired).not.toHaveBeenCalled()
    expect(player.calls).toContainEqual(['dismissNarration'])
    expect(player.calls).toContainEqual(['pause'])
    player.state = { ...player.state, narration: { status: 'idle' } }
    rerender()
    expect(result.current.snapshot()).toMatchObject({ available: false, open: false })
  })

  it('another text opened in the frame: what was loaded from the last one goes', async () => {
    const { result } = mount()
    await ready()
    act(() => result.current.attachOwn!(frameText()))
    act(() => result.current.play({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(player.options?.chapterNumber).toBe(2))
    const next = frameText()
    act(() => result.current.attachOwn!(next))
    expect(player.options?.paragraphs).toEqual([])
    act(() => result.current.play({ chapterNumber: 3, paragraphIndex: 0, wordIndex: 0 }))
    await waitFor(() => expect(next.chapter).toHaveBeenCalledWith(3))
  })
})
