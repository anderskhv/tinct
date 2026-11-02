import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleSeoAndStaticRequest } from './worker/routes/seo'
afterEach(() => vi.unstubAllGlobals())
describe('mutable public book assets after an editorial release', () => {
  const paths = [
    '/data/editions/apology-modern-en.json',
    '/data/editions-chapters/medea-modern-da/ch0001.json',
    '/data/characters/apology.v1.json',
    '/data/onboarding/apology.json',
    '/data/edition-migrations/apology.positions.json',
  ]
  it.each(paths)('ignores old immutable cache entries at an unversioned address: %s', async path => {
    const match = vi.fn(async () => Response.json({ text: 'old edition' }, { headers: { 'Cache-Control': 'public, max-age=2592000, immutable' } }))
    const put = vi.fn()
    vi.stubGlobal('caches', { default: { match, put } })
    const fetch = vi.fn(async () => Response.json({ text: 'revised edition' }))
    const pending: Promise<unknown>[] = []
    const ctx = { waitUntil(promise: Promise<unknown>) { pending.push(promise) } } as unknown as ExecutionContext
    for (const method of ['GET', 'HEAD']) {
      const response = await handleSeoAndStaticRequest(new Request('https://tinct.app' + path, { method }), { ASSETS: { fetch } }, ctx)
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('no-cache, must-revalidate')
      if (method === 'GET') expect(await response.json()).toEqual({ text: 'revised edition' })
    }
    await Promise.all(pending)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(match).not.toHaveBeenCalled()
    expect(put).not.toHaveBeenCalled()
  })
  it('keeps versioned reader cache hits and bypasses them for explicit fresh requests', async () => {
    const match = vi.fn(async () => Response.json({ text: 'pinned edition' }))
    const put = vi.fn()
    vi.stubGlobal('caches', { default: { match, put } })
    const fetch = vi.fn(async () => Response.json({ text: 'current edition' }))
    const ctx = { waitUntil() {} } as unknown as ExecutionContext
    const url = 'https://tinct.app/data/editions/apology-modern-en.json'
    const pinned = await handleSeoAndStaticRequest(new Request(url + '?v=release-one'), { ASSETS: { fetch } }, ctx)
    expect(await pinned.json()).toEqual({ text: 'pinned edition' })
    expect(fetch).not.toHaveBeenCalled()
    for (const query of ['?fresh=1', '?v=release-one&fresh=1', '?v=']) {
      const response = await handleSeoAndStaticRequest(new Request(url + query), { ASSETS: { fetch } }, ctx)
      expect(await response.json()).toEqual({ text: 'current edition' })
      expect(response.headers.get('Cache-Control')).toBe('no-cache, must-revalidate')
    }
    expect(match).toHaveBeenCalledTimes(1)
    expect(put).not.toHaveBeenCalled()
  })
  it('stores versioned reader misses without sharing them across versions', async () => {
    const match = vi.fn(async () => undefined)
    const put = vi.fn(async (_request: Request, _response: Response) => undefined)
    vi.stubGlobal('caches', { default: { match, put } })
    const fetch = vi.fn(async () => Response.json({ text: 'current edition' }))
    const pending: Promise<unknown>[] = []
    const ctx = { waitUntil(promise: Promise<unknown>) { pending.push(promise) } } as unknown as ExecutionContext
    for (const version of ['one', 'two']) {
      const response = await handleSeoAndStaticRequest(new Request('https://tinct.app/data/editions/apology-modern-en.json?v=' + version), { ASSETS: { fetch } }, ctx)
      expect(response.headers.get('Cache-Control')).toContain('immutable')
    }
    await Promise.all(pending)
    expect(put).toHaveBeenCalledTimes(2)
    expect(put.mock.calls.map(call => new URL((call[0] as Request).url).searchParams.get('v'))).toEqual(['one', 'two'])
  })
})
