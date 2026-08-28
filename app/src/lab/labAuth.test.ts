import { describe, expect, it, vi } from 'vitest'
import { resolveLabVoiceToken } from './labAuth'

describe('resolveLabVoiceToken', () => {
  it('uses the production session token when no test override is set', async () => {
    const readSession = vi.fn().mockResolvedValue('should-not-run')
    await expect(resolveLabVoiceToken({
      sessionToken: 'supabase-access-token',
      readSession,
    })).resolves.toBe('supabase-access-token')
    expect(readSession).not.toHaveBeenCalled()
  })

  it('returns null for a signed-out override and does not read storage', async () => {
    const readSession = vi.fn().mockResolvedValue('hidden')
    await expect(resolveLabVoiceToken({
      override: null,
      sessionToken: 'stale',
      readSession,
    })).resolves.toBeNull()
    expect(readSession).not.toHaveBeenCalled()
  })

  it('reads the live Supabase session when React has not hydrated yet', async () => {
    await expect(resolveLabVoiceToken({
      sessionToken: null,
      readSession: async () => 'fresh-access-token',
    })).resolves.toBe('fresh-access-token')
  })
})
