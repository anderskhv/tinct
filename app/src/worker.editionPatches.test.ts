import { describe, expect, it } from 'vitest'
import { handleEditionPatches } from './worker/routes/editionPatches'

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

describe('edition patches route', () => {
  it('returns an empty patch list when Supabase is not configured', async () => {
    const response = await handleEditionPatches(
      new Request('https://tinct.app/api/edition-patches?bookId=odyssey&editionKey=modern-en'),
      {},
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  })

  it('rejects non-GET methods', async () => {
    const response = await handleEditionPatches(
      new Request('https://tinct.app/api/edition-patches?bookId=odyssey&editionKey=modern-en', { method: 'POST' }),
      env,
      async () => true,
    )

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('returns empty list for invalid identifiers without hitting rate limit', async () => {
    let rateLimitCalls = 0
    const response = await handleEditionPatches(
      new Request('https://tinct.app/api/edition-patches?bookId=odyssey;drop&editionKey=modern-en'),
      env,
      async () => {
        rateLimitCalls += 1
        return true
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
    expect(rateLimitCalls).toBe(0)
  })

  it('returns 429 when the route-specific rate limit blocks', async () => {
    const response = await handleEditionPatches(
      new Request('https://tinct.app/api/edition-patches?bookId=odyssey&editionKey=modern-en', {
        headers: { 'cf-connecting-ip': '203.0.113.10' },
      }),
      env,
      async (key, _kv, maxRequests) => {
        expect(key).toBe('patches:203.0.113.10')
        expect(maxRequests).toBe(30)
        return false
      },
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Rate limit exceeded' })
  })
})
