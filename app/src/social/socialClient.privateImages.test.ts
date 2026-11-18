import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { privateImageUrl } from './socialClient'

describe('authenticated profile image recovery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:picture')
  })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('deduplicates in-flight and successful loads for the same session', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('image'))
    const first = privateImageUrl('session', '/image/reuse')
    expect(privateImageUrl('session', '/image/reuse')).toBe(first)
    expect(await first).toBe('blob:picture')
    expect(await privateImageUrl('session', '/image/reuse')).toBe('blob:picture')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries a failed image instead of retaining a blank disc forever', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 503 })).mockResolvedValueOnce(new Response('image'))
    expect(await privateImageUrl('session', '/image/retry')).toBeNull()
    expect(await privateImageUrl('session', '/image/retry')).toBe('blob:picture')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('a refreshed token does not reuse the stale token request', async () => {
    let finishOld!: (response: Response) => void
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
      .mockResolvedValueOnce(new Response('image'))
    const old = privateImageUrl('expired', '/image/auth')
    await Promise.resolve()
    expect(await privateImageUrl('fresh', '/image/auth')).toBe('blob:picture')
    finishOld(new Response('', { status: 401 }))
    expect(await old).toBeNull()
    expect(await privateImageUrl('fresh', '/image/auth')).toBe('blob:picture')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('bounds a stalled fetch, permits retry, and ignores its late completion', async () => {
    vi.useFakeTimers()
    let finishOld!: (response: Response) => void
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
      .mockResolvedValueOnce(new Response('image'))
    const old = privateImageUrl('session', '/image/stalled')
    await vi.advanceTimersByTimeAsync(10000)
    expect(await old).toBeNull()
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal?.aborted).toBe(true)
    expect(await privateImageUrl('session', '/image/stalled')).toBe('blob:picture')
    finishOld(new Response('late'))
    await vi.runAllTimersAsync()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(await privateImageUrl('session', '/image/stalled')).toBe('blob:picture')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
