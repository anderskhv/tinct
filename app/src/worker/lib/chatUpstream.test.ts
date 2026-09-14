import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAT_HEADERS_TIMEOUT_MS, ChatUpstreamError, fetchChatUpstream } from './chatUpstream'

describe('chat upstream failure handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([429, 500, 502, 503, 504, 529])('retries a rejected %i once with the identical request', async status => {
    const success = Response.json({ content: [{ type: 'text', text: 'answer' }] })
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ error: { type: 'overloaded_error', message: 'private provider detail' } }, {
      status, headers: { 'request-id': 'req_overloaded' },
    })).mockResolvedValueOnce(success)
    vi.stubGlobal('fetch', fetchMock)
    const promise = fetchChatUpstream('secret-key', { messages: ['private passage'] })
    await vi.advanceTimersByTimeAsync(349)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await promise).toBe(success)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][1].body).toEqual(fetchMock.mock.calls[1][1].body)
    const logs = JSON.stringify(vi.mocked(console.warn).mock.calls)
    expect(logs).toContain('req_overloaded')
    for (const privateValue of ['secret-key', 'private passage', 'private provider detail']) expect(logs).not.toContain(privateValue)
  })

  it('stops after the second rejection and sanitizes its provider error', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => Response.json({ error: { type: 'overloaded_error', message: 'secret' } }, { status: 529 }))
    vi.stubGlobal('fetch', fetchMock)
    const promise = fetchChatUpstream('key', {})
    await vi.advanceTimersByTimeAsync(350)
    const response = await promise
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: { type: 'overloaded_error', message: expect.stringContaining('busy') } })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([400, 401, 403, 404, 413])('does not retry non-transient %i or expose credentials', async status => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: { type: 'authentication_error', message: 'secret credential details' } }, { status }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await fetchChatUpstream('key', {})
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('credential')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not retry a longer Retry-After cooldown or when text has already been sent', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response('not JSON', { status: 503, headers: { 'retry-after': '60' } }))
    vi.stubGlobal('fetch', fetchMock)
    await fetchChatUpstream('key', {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fetchMock.mockImplementation(async () => new Response('not JSON', { status: 503 }))
    await fetchChatUpstream('key', {}, false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not replay an ambiguous transport failure or log its raw exception', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('secret private exception'))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchChatUpstream('key', {})).rejects.toBeInstanceOf(ChatUpstreamError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('private exception')
  })

  it('aborts stalled response headers and does not retry an ambiguous timeout', async () => {
    const fetchMock = vi.fn().mockImplementation((_url, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('aborted')))
    }))
    vi.stubGlobal('fetch', fetchMock)
    const result = fetchChatUpstream('key', {}).catch(error => error)
    await vi.advanceTimersByTimeAsync(CHAT_HEADERS_TIMEOUT_MS)
    expect(await result).toMatchObject({ errorType: 'upstream_timeout', status: 504 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('bounds an invalid error body and discards unrecognized error types', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(20_000))) }, cancel,
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 400 })))
    const response = await fetchChatUpstream('key', {})
    expect(await response.json()).toMatchObject({ error: { type: 'upstream_error' } })
    expect(cancel).toHaveBeenCalled()
  })
})
