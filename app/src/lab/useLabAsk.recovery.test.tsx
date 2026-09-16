// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useLabAsk, type UseLabAskOptions } from './useLabAsk'

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }))

vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent }))

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
    .mockRejectedValueOnce(new Error('tool round collapsed again'))
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

it('automatically retries a zero-output failure as the same question and succeeds', async () => {
  const fetcher = vi.fn()
    .mockRejectedValueOnce(new Error('tool round collapsed'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })

  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(result.current.notice).toBeNull()
  // The retry is the same turn, not a second one in the thread.
  expect(result.current.turns.filter(turn => turn.role === 'user')).toHaveLength(1)
})

it('sends and stores the full highlighted passage separately, then clears when accepted', async () => {
  const fetcher = vi.fn().mockResolvedValue(ok())
  const onAccepted = vi.fn()
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => {
    await result.current.sendTyped('Why does this matter?', undefined, undefined, {
      highlightedText: 'Socrates says that we must never return injustice for injustice.',
      onAccepted,
    })
  })

  const request = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as { messages: Array<{ role: string; content: string }> }
  expect(request.messages.at(-1)?.content).toContain('[The reader highlighted this passage:\nSocrates says that we must never return injustice for injustice.]')
  expect(request.messages.at(-1)?.content).toContain('\n\nWhy does this matter?')
  expect(result.current.turns.find(turn => turn.role === 'user')?.highlightedText).toBe('Socrates says that we must never return injustice for injustice.')
  expect(onAccepted).toHaveBeenCalledTimes(1)
})

it('keeps the submitted passage on its failed turn after clearing the composer', async () => {
  const onAccepted = vi.fn()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => {
    await result.current.sendTyped('Why?', undefined, undefined, { highlightedText: 'The passage.', onAccepted })
  })

  expect(result.current.notice).toBeTruthy()
  expect(result.current.retryTyped).toBeTypeOf('function')
  expect(result.current.turns.find(turn => turn.role === 'user')?.highlightedText).toBe('The passage.')
  expect(onAccepted).toHaveBeenCalledTimes(1)
})

it('explains a selected passage without adding it to chat history', async () => {
  const fetcher = vi.fn().mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  const before = result.current.turns.length
  let answer = ''

  await act(async () => {
    answer = await result.current.explainSelection({
      text: '  The selected words.  ',
      editionKey: 'web-en',
      editionLabel: 'World English Bible',
      paragraphs: ['The selected words.'],
      paragraphIndex: 0,
    }, vi.fn())
  })

  expect(answer).toContain('Jeremiah 49')
  expect(result.current.turns).toHaveLength(before)
  const request = JSON.parse(String(fetcher.mock.calls[0][1]?.body)) as { messages: Array<{ content: string }>; book?: { bookId?: string; editionKey?: string } }
  expect(request.messages[0].content).toContain('<selected_passage>\nThe selected words.\n</selected_passage>')
  expect(request.messages[0].content).toContain('without using knowledge from later in the work')
  expect(JSON.stringify(request)).toContain('web-en')
})

it('does not clear a new draft when retrying an earlier failed turn', async () => {
  const onAccepted = vi.fn()
  const fetcher = vi.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => {
    await result.current.sendTyped('Why?', undefined, undefined, { highlightedText: 'The passage.', onAccepted })
  })
  expect(onAccepted).toHaveBeenCalledTimes(1)

  await act(async () => { result.current.retryTyped?.(); await new Promise(resolve => setTimeout(resolve, 10)) })
  expect(onAccepted).toHaveBeenCalledTimes(1)
  const retry = JSON.parse(String(fetcher.mock.calls[2][1]?.body)) as { messages: Array<{ content: string }> }
  expect(retry.messages.at(-1)?.content).toContain('The passage.')
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
    .mockRejectedValueOnce(new Error('tool round collapsed again'))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false, onAccountPrompt }))

  await act(async () => { await result.current.sendTyped('recap this chapter') })
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(onAccountPrompt).not.toHaveBeenCalled()

  await act(async () => { result.current.retryTyped!(); await new Promise(resolve => setTimeout(resolve, 10)) })
  expect(onAccountPrompt).not.toHaveBeenCalled()
  expect(fetcher).toHaveBeenCalledTimes(3)
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
  expect(fetcher).toHaveBeenCalledTimes(1)
})

it('automatically retries a zero-output gateway interruption and records recovery without question text', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: { type: 'upstream_timeout', message: 'The reply was interrupted. Please try again.' } }), {
      status: 504, headers: { 'Content-Type': 'application/json' },
    }))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })

  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(result.current.notice).toBeNull()
  expect(result.current.turns.filter(turn => turn.role === 'user')).toHaveLength(1)
  expect(trackEvent).toHaveBeenCalledWith('chat_request_recovered', expect.objectContaining({
    first_failure_type: 'upstream_timeout', attempts: 2,
  }), null)
  expect(JSON.stringify(trackEvent.mock.calls)).not.toContain('recap this chapter')
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


it('shows a useful streamed error and retries without duplicating the reader question', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response('data: {"type":"error","error":{"type":"overloaded_error"}}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    }))
    .mockResolvedValueOnce(new Response('data: {"type":"error","error":{"type":"overloaded_error"}}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    }))
    .mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  await act(async () => { await result.current.sendTyped('recap this chapter') })
  expect(result.current.notice).toBe('The answer service is busy. Please try again shortly.')
  await act(async () => { result.current.retryTyped!(); await new Promise(resolve => setTimeout(resolve, 10)) })
  expect(result.current.notice).toBeNull()
  expect(result.current.turns.filter(turn => turn.role === 'user')).toHaveLength(1)
})

it('does not automatically replay after partial answer text', async () => {
  const stream = [
    'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"A partial answer"}}',
    '',
    'data: {"type":"error","error":{"type":"overloaded_error"}}',
    '',
  ].join('\n')
  const fetcher = vi.fn().mockResolvedValue(new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  }))
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))

  await act(async () => { await result.current.sendTyped('recap this chapter') })

  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(result.current.notice).toBe('The answer service is busy. Please try again shortly.')
  expect(result.current.turns.some(turn => turn.role === 'assistant' && turn.content === 'A partial answer')).toBe(true)
})

it('clears an accepted question before the network answer arrives', async () => {
  let finish!: (response: Response) => void
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve })))
  const onAccepted = vi.fn()
  const { result } = renderHook(() => useLabAsk(base))
  let pending!: Promise<void>
  act(() => { pending = result.current.sendTyped('Explain why', undefined, undefined, { onAccepted }) })
  expect(onAccepted).toHaveBeenCalledOnce()
  expect(result.current.turns.filter(turn => turn.role === 'user')).toHaveLength(1)
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); finish(ok()); await pending })
  expect(onAccepted).toHaveBeenCalledOnce()
})

it('reuses speculative explanations and imports their context only on explicit Chat handoff', async () => {
  const fetcher = vi.fn().mockResolvedValue(ok())
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  const input = { text: 'Of the children of Ammon.', editionKey: 'web-en', paragraphs: base.paragraphs, paragraphIndex: 0 }
  let answer = ''
  await act(async () => { answer = await result.current.explainSelection({ ...input, speculative: true }, vi.fn()) })
  await act(async () => { await result.current.explainSelection(input, vi.fn()) })
  expect(fetcher).toHaveBeenCalledOnce()
  expect(result.current.turns).toHaveLength(0)
  act(() => result.current.keepExplanation(input.text, answer, 0))
  expect(result.current.turns.map(turn => turn.role)).toEqual(['user', 'assistant'])
  await act(async () => { await result.current.sendTyped('Go deeper') })
  const body = JSON.parse(fetcher.mock.calls[1][1].body)
  expect(body.messages.some((message: { role: string; content: string }) => message.role === 'assistant' && message.content === answer)).toBe(true)
})

it('never spends guest allowance or opens an account prompt during speculation', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
  const onAccountPrompt = vi.fn()
  const { result } = renderHook(() => useLabAsk({ ...base, signedIn: false, authToken: null, onAccountPrompt }))
  await expect(result.current.explainSelection({ text: 'Selected passage', editionKey: 'web-en', paragraphs: base.paragraphs, paragraphIndex: 0, speculative: true }, vi.fn())).rejects.toThrow()
  expect(fetcher).not.toHaveBeenCalled(); expect(onAccountPrompt).not.toHaveBeenCalled()
})
