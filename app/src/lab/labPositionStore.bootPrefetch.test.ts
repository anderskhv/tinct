// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLabPositionCloud } from './labPositionStore'

const record = { books: {}, finished: {}, owner: null, hidden: {}, lastSettledBookId: null, lastSettledAt: 0, updatedAt: 1, deviceId: 'd' }
const slot = () => window as unknown as Record<string, unknown>

afterEach(() => { delete slot().__tinctPositionPrefetch; vi.unstubAllGlobals() })

describe('cloud position read started by the boot script', () => {
  it('takes the early response once for the same token, then requests normally', async () => {
    const network = vi.fn(async () => new Response(JSON.stringify(record), { status: 200 }))
    vi.stubGlobal('fetch', network)
    slot().__tinctPositionPrefetch = { token: 't', at: Date.now(), body: Promise.resolve(record) }
    expect(await fetchLabPositionCloud('t')).not.toBeNull()
    expect(network).not.toHaveBeenCalled()
    expect(slot().__tinctPositionPrefetch).toBeUndefined()
    expect(await fetchLabPositionCloud('t')).not.toBeNull()
    expect(network).toHaveBeenCalledTimes(1)
  })

  it('ignores an early response for another token, a stale one, or a failed one', async () => {
    for (const early of [
      { token: 'other', at: Date.now(), body: Promise.resolve(record) },
      { token: 't', at: Date.now() - 60_000, body: Promise.resolve(record) },
      { token: 't', at: Date.now(), body: Promise.resolve(null) },
    ]) {
      const network = vi.fn(async () => new Response(JSON.stringify(record), { status: 200 }))
      vi.stubGlobal('fetch', network)
      slot().__tinctPositionPrefetch = early
      expect(await fetchLabPositionCloud('t')).not.toBeNull()
      expect(network).toHaveBeenCalledTimes(1)
    }
  })
})
