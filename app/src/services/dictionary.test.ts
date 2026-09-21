import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

it('retries a failed download on the next lookup, instead of caching a miss', async () => {
  let attempts = 0
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.includes('archaic')) return { ok: true, json: async () => ({}) }
    attempts++
    if (attempts === 1) throw new Error('temporary network failure')
    return { ok: true, json: async () => ({ orchard: ['a planted fruit garden'] }) }
  }))
  const { lookup, isFullyLoaded } = await import('./dictionary')
  expect(await lookup('orchard')).toBeNull()
  expect(await lookup('“Orchard,”')).toMatchObject({ word: 'orchard', definitions: ['a planted fruit garden'] })
  expect(attempts).toBe(2)
  expect(isFullyLoaded()).toBe(false)
})

it('loads the shipped archaic supplement and shares concurrent shard requests', async () => {
  const fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => url.includes('archaic') ? { thou: ['you (as subject)'] } : {} }))
  vi.stubGlobal('fetch', fetcher)
  const { lookup } = await import('./dictionary')
  const results = await Promise.all([lookup('THOU'), lookup('thou')])
  expect(results.map(result => result?.definitions)).toEqual([['you (as subject)'], ['you (as subject)']])
  expect(fetcher).toHaveBeenCalledTimes(2)
})
