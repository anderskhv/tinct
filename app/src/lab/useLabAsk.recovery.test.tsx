// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))

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
  JSON.stringify({ content: [{ text: 'Jeremiah 49 collects oracles against Israel’s neighbours.' }] }),
  { headers: { 'Content-Type': 'application/json' } },
)

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

/**
 * 2026-09-12: one failed round left the Ask panel showing "Ask is unavailable
 * right now" with a "Try again" that could never work. A failure must be a
 * failure of that round only.
 */
it('recovers on the next question after a failed round, and clears the notice', async () => {
  const fetcher = vi.fn()
    .mockRejectedValueOnce(new Error('tool round collapsed'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  expect(result.current.notice).toBeTruthy()
  expect(result.current.retryTyped).toBeTypeOf('function')

  await act(async () => { await result.current.sendTyped('who is Kedar?') })
  expect(result.current.notice).toBeNull()
  expect(result.current.turns.some(turn => turn.role === 'assistant' && turn.content.includes('Jeremiah 49'))).toBe(true)
})

it('retries the same failed question and succeeds', async () => {
  const fetcher = vi.fn()
    .mockRejectedValueOnce(new Error('tool round collapsed'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  await act(async () => { result.current.retryTyped!(); await new Promise(resolve => setTimeout(resolve, 10)) })

  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(result.current.notice).toBeNull()
  // The retry is the same turn, not a second one in the thread.
  expect(result.current.turns.filter(turn => turn.role === 'user')).toHaveLength(1)
})

/**
 * The anonymous account policy allows one free AI action. A failed round used
 * to consume it, so "Try again" opened the account sheet instead of retrying
 * and the panel stayed stuck on its failure notice for good.
 */
it('does not spend an anonymous reader’s free action on a retry', async () => {
  const onAccountPrompt = vi.fn()
  const fetcher = vi.fn()
    .mockRejectedValueOnce(new Error('tool round collapsed'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false, onAccountPrompt }))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(onAccountPrompt).not.toHaveBeenCalled()

  await act(async () => { result.current.retryTyped!(); await new Promise(resolve => setTimeout(resolve, 10)) })
  expect(onAccountPrompt).not.toHaveBeenCalled()
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(result.current.notice).toBeNull()
})

it('reports the server’s own message rather than a generic failure', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } },
  ))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  expect(result.current.notice).toBe('Rate limit exceeded. Try again in a minute.')
})

/** A withdrawn edition must never reach the worker, whatever the reader carries. */
it('sends the successor edition when the reader still holds a withdrawn one', async () => {
  const fetcher = vi.fn().mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk({ ...base, editionKey: 'modern-en' }))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  const body = JSON.parse(fetcher.mock.calls[0][1].body)
  expect(body.book).toMatchObject({ bookId: 'bible', editionKey: 'web-en', chapterNumber: 794 })
  expect(JSON.stringify(body)).not.toContain('modern-en')
})
