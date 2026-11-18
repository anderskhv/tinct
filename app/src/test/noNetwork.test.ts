import net from 'node:net'
import { describe, expect, it, vi } from 'vitest'

describe('unit-test network boundary', () => {
  it('fails an accidental external fetch and socket before either can connect', async () => {
    await expect(fetch('https://unreachable.invalid/api')).rejects.toThrow('Real network is blocked in Vitest: GET https://unreachable.invalid/api')
    expect(() => net.connect({ host: 'unreachable.invalid', port: 443 })).toThrow('Real socket is blocked in Vitest')
  })

  it('still permits an explicit per-test fetch mock', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ok: true })))
    expect(await (await fetch('https://unreachable.invalid/api')).json()).toEqual({ ok: true })
    vi.unstubAllGlobals()
    await expect(fetch('https://unreachable.invalid/api')).rejects.toThrow('Real network is blocked in Vitest')
  })
})
