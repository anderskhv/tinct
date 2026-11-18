// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { EXPLAIN_STALL_MS, useLabAsk, type UseLabAskOptions } from './useLabAsk'
import { LabChatError } from './labCompanion'

// All AI is mocked: fetch is stubbed in every test; nothing leaves the process.
vi.mock('../data/editionLoader', () => ({ loadEditionWindow: vi.fn() }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null, likelyAuthenticated: false }) }))
vi.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({ state: 'idle', activity: 'idle', connection: 'idle', isActive: false, stop: vi.fn(), setAssistantPace: vi.fn() }),
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))

const base: UseLabAskOptions = {
  bookId: 'to-the-lighthouse', editionKey: 'original-en', bookTitle: 'To the Lighthouse', bookAuthor: 'Virginia Woolf',
  chapterLabel: 'Chapter 1', chapterNumber: 1, paragraphs: ['Her father was dying there, Mrs Ramsay knew.'], paragraphIndex: 0,
  signedIn: true, authToken: 'fixture', userId: null, voiceToolAdapter: {} as UseLabAskOptions['voiceToolAdapter'],
}
const input = { text: 'Her father was dying there,', editionKey: 'original-en', paragraphs: base.paragraphs, paragraphIndex: 0 }
const encoder = new TextEncoder()
const delta = (text: string) => encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`)
const stop = encoder.encode('event: message_stop\ndata: {"type":"message_stop"}\n\n')
/** An SSE response whose body the test feeds by hand; it errors when the request is aborted. */
function sse(signal: AbortSignal) {
  let controller!: ReadableStreamDefaultController<Uint8Array>
  const body = new ReadableStream<Uint8Array>({ start(c) { controller = c } })
  signal.addEventListener('abort', () => { try { controller.error(new DOMException('aborted', 'AbortError')) } catch { /* closed */ } })
  return { response: new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }), controller }
}
/** Like fetch that never answers: pending until aborted. */
const hangingFetch = () => vi.fn().mockImplementation((_url: string, init: { signal: AbortSignal }) => new Promise((_, reject) => {
  init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
}))

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks() })

it('gives up on a request that never answers, aborts it, and Try again fetches afresh', async () => {
  const fetcher = hangingFetch()
  vi.stubGlobal('fetch', fetcher)
  const { result } = renderHook(() => useLabAsk(base))
  const pending = result.current.explainSelection(input, vi.fn())
  const outcome = pending.then(() => 'resolved', (error: unknown) => error)
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS - 1)
  expect(await Promise.race([outcome, Promise.resolve('pending')])).toBe('pending')
  await vi.advanceTimersByTimeAsync(1)
  const error = await outcome
  expect(error).toBeInstanceOf(LabChatError)
  expect((error as LabChatError).type).toBe('timeout')
  expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
  // The stalled entry is not reused within the 60 s cache window.
  const retry = result.current.explainSelection(input, vi.fn()).catch(() => {})
  await vi.advanceTimersByTimeAsync(0)
  expect(fetcher).toHaveBeenCalledTimes(2)
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS)
  await retry
})

it('gives up on a stream that opens and then goes quiet before its answer is complete', async () => {
  let feed!: ReadableStreamDefaultController<Uint8Array>
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, init: { signal: AbortSignal }) => {
    const { response, controller } = sse(init.signal); feed = controller; return response
  }))
  const { result } = renderHook(() => useLabAsk(base))
  const onDelta = vi.fn()
  const outcome = result.current.explainSelection(input, onDelta).then(() => 'resolved', (error: unknown) => error)
  await vi.advanceTimersByTimeAsync(0)
  feed.enqueue(delta('Mrs Ramsay is thinking of'))
  await vi.advanceTimersByTimeAsync(0)
  expect(onDelta).toHaveBeenCalledWith('Mrs Ramsay is thinking of')
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS)
  expect(await outcome).toBeInstanceOf(LabChatError)
})

it('keeps a slow but moving stream: each new piece of text restarts the wait', async () => {
  let feed!: ReadableStreamDefaultController<Uint8Array>
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, init: { signal: AbortSignal }) => {
    const { response, controller } = sse(init.signal); feed = controller; return response
  }))
  const { result } = renderHook(() => useLabAsk(base))
  const outcome = result.current.explainSelection(input, vi.fn())
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS - 1000)
  feed.enqueue(delta('Mrs Ramsay remembers her father '))
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS - 1000)
  feed.enqueue(delta('dying far away.'))
  await vi.advanceTimersByTimeAsync(EXPLAIN_STALL_MS - 1000)
  feed.enqueue(stop); feed.close()
  await act(async () => { await vi.advanceTimersByTimeAsync(0) })
  await expect(outcome).resolves.toBe('Mrs Ramsay remembers her father dying far away.')
})

it('fails, rather than loading, when the stream ends without any text', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, init: { signal: AbortSignal }) => {
    const { response, controller } = sse(init.signal); controller.enqueue(stop); controller.close(); return response
  }))
  const { result } = renderHook(() => useLabAsk(base))
  await expect(result.current.explainSelection(input, vi.fn())).rejects.toBeInstanceOf(LabChatError)
})
