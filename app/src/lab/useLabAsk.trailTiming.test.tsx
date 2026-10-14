// @vitest-environment jsdom

/**
 * Time to first text (Anders, 14 Oct 2026): a typed question used to wait for
 * the account token and then, in series, for the reading trail (up to its
 * 1.2 s opening-line deadline) before the request left. The trail is
 * read-only and independent of the token, so it now starts with the send and
 * runs alongside; the request still carries the same trail.
 */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { LabReadingTrailEntry } from './labReadingTrail'

const control = vi.hoisted(() => ({
  trailDelayMs: 0,
  tokenDelayMs: 0,
  calls: [] as string[],
}))

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('./labAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./labAuth')>()
  return {
    ...actual,
    resolveLabVoiceToken: vi.fn(async () => {
      control.calls.push('token:start')
      await new Promise(resolve => setTimeout(resolve, control.tokenDelayMs))
      control.calls.push('token:end')
      return 'fixture'
    }),
  }
})
vi.mock('./labReadingTrail', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./labReadingTrail')>()
  return {
    ...actual,
    buildLabReadingTrail: vi.fn(async (): Promise<LabReadingTrailEntry[]> => {
      control.calls.push('trail:start')
      await new Promise(resolve => setTimeout(resolve, control.trailDelayMs))
      control.calls.push('trail:end')
      return [{ chapterNumber: 792, label: 'Jeremiah 47', openingLine: 'The word of the LORD that came to Jeremiah…' }]
    }),
  }
})

import { useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { buildLabReadingTrail } from './labReadingTrail'

const base: UseLabAskOptions = {
  bookId: 'bible',
  editionKey: 'web-en',
  bookTitle: 'The Bible',
  bookAuthor: 'Various',
  chapterLabel: 'Jeremiah 49',
  chapterNumber: 794,
  paragraphs: ['Of the children of Ammon.'],
  paragraphIndex: 0,
  signedIn: true,
  authToken: 'fixture',
  userId: null,
  voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}

const ok = () => new Response(
  JSON.stringify({ content: [{ text: 'Oracles against the neighbours.' }] }),
  { headers: { 'Content-Type': 'application/json' } },
)

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  control.calls = []
  control.trailDelayMs = 0
  control.tokenDelayMs = 0
})

it('starts the reading trail with the send, alongside the token, and sends the same trail', async () => {
  vi.useFakeTimers()
  control.trailDelayMs = 1_000
  control.tokenDelayMs = 1_000
  let fetchedAt: number | null = null
  const fetcher = vi.fn(async () => { fetchedAt = Date.now(); return ok() })
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  const startedAt = Date.now()

  let sent!: Promise<void>
  act(() => { sent = result.current.sendTyped('who is Kedar?') })
  // Both steps are under way before either has finished.
  await act(async () => { await vi.advanceTimersByTimeAsync(0) })
  expect(control.calls.slice(0, 2).sort()).toEqual(['token:start', 'trail:start'])
  expect(fetcher).not.toHaveBeenCalled()

  await act(async () => { await vi.advanceTimersByTimeAsync(1_000) })
  await act(async () => { await sent })
  expect(fetcher).toHaveBeenCalledTimes(1)
  // In parallel the request leaves after the slower step (1 s), not both (2 s).
  expect(fetchedAt! - startedAt).toBeLessThan(1_500)
  expect(buildLabReadingTrail).toHaveBeenCalledTimes(1)

  const body = JSON.parse(String((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body)) as {
    companion: { context: { readingTrail?: LabReadingTrailEntry[]; chapterNumber?: number } }
  }
  expect(body.companion.context.chapterNumber).toBe(794)
  expect(body.companion.context.readingTrail).toEqual([
    { chapterNumber: 792, label: 'Jeremiah 47', openingLine: 'The word of the LORD that came to Jeremiah…' },
  ])
})

it('warmTrail reads the trail ahead of a question without sending anything', async () => {
  const fetcher = vi.fn(async () => ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  await act(async () => { result.current.warmTrail(); await Promise.resolve() })
  expect(buildLabReadingTrail).toHaveBeenCalledTimes(1)
  expect(buildLabReadingTrail).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'bible', editionKey: 'web-en', currentChapter: 794 }))
  expect(fetcher).not.toHaveBeenCalled()
})
