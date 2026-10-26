import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchExplainResponse } from './explainFetch'
afterEach(() => vi.unstubAllGlobals())
describe('Explain pre-stream recovery', () => {
  it.each([502, 504])('retries %s once with the same request and deadline', async status => {
    const answer = new Response('answer'), fetch = vi.fn().mockResolvedValueOnce(new Response('failed', { status })).mockResolvedValueOnce(answer)
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    const init = { method: 'POST', body: 'same passage', headers: { Authorization: 'Bearer synthetic' }, signal }
    expect(await fetchExplainResponse('/api/chat', init)).toBe(answer)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][1]).toMatchObject({ method: 'POST', body: init.body, signal, headers: { authorization: 'Bearer synthetic', 'x-tinct-retry': '1' } })
  })
  it.each([200, 401, 402, 403, 429, 500, 503])('does not retry %s or consume a successful stream', async status => {
    const response = new Response('body', { status }), fetch = vi.fn().mockResolvedValue(response)
    vi.stubGlobal('fetch', fetch)
    expect(await fetchExplainResponse('/api/chat', {})).toBe(response)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(response.bodyUsed).toBe(false)
  })
  it('recovers a network failure once, but never loops', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('network'))
    vi.stubGlobal('fetch', fetch)
    await expect(fetchExplainResponse('/api/chat', {})).rejects.toThrow('network')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it('does not retry a cancelled request', async () => {
    const controller = new AbortController(); controller.abort()
    const fetch = vi.fn().mockRejectedValue(new TypeError('cancelled'))
    vi.stubGlobal('fetch', fetch)
    await expect(fetchExplainResponse('/api/chat', { signal: controller.signal })).rejects.toThrow('cancelled')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
