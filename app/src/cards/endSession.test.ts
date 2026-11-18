import { describe, expect, it, vi } from 'vitest'
import { endSession } from './endSession'

describe('endSession', () => {
  it('a refused sign-out (the account was just deleted) still ends the session on this device', async () => {
    const signOut = vi.fn(async (options?: { scope?: string }) => ({ error: options?.scope === 'local' ? null : { status: 403, message: 'User from sub claim in JWT does not exist' } }))
    await endSession({ signOut })
    expect(signOut.mock.calls).toEqual([[], [{ scope: 'local' }]])
  })
  it('a normal sign-out is one call; a thrown one falls back too; no client does nothing', async () => {
    const ok = vi.fn(async () => ({ error: null }))
    await endSession({ signOut: ok })
    expect(ok).toHaveBeenCalledTimes(1)
    const thrown = vi.fn(async (options?: { scope?: string }) => { if (!options) throw new Error('offline'); return { error: null } })
    await endSession({ signOut: thrown })
    expect(thrown.mock.calls).toEqual([[], [{ scope: 'local' }]])
    await expect(endSession(null)).resolves.toBeUndefined()
  })
})
