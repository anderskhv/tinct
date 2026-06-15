import { describe, expect, it } from 'vitest'
import { handleAngleChat } from './worker/routes/angleChat'

const env = { ANTHROPIC_API_KEY: 'test-key' }

describe('angle chat route', () => {
  it('rejects non-POST requests', async () => {
    const response = await handleAngleChat(
      new Request('https://tinct.app/api/angle-chat'),
      env,
      async () => true,
      'test-model',
    )

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('requires the Anthropic API key before rate limiting', async () => {
    let rateLimitCalls = 0
    const response = await handleAngleChat(
      new Request('https://tinct.app/api/angle-chat', { method: 'POST' }),
      {},
      async () => {
        rateLimitCalls += 1
        return true
      },
      'test-model',
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Service unavailable' })
    expect(rateLimitCalls).toBe(0)
  })

  it('applies the route-specific rate limit key', async () => {
    const response = await handleAngleChat(
      new Request('https://tinct.app/api/angle-chat', {
        method: 'POST',
        headers: { 'cf-connecting-ip': '203.0.113.4' },
      }),
      env,
      async (key, _kv, maxRequests) => {
        expect(key).toBe('angle:203.0.113.4')
        expect(maxRequests).toBe(20)
        return false
      },
      'test-model',
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Rate limit exceeded. Try again in a minute.' })
  })

  it('requires book context before calling Anthropic', async () => {
    const response = await handleAngleChat(
      new Request('https://tinct.app/api/angle-chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [] }),
      }),
      env,
      async () => true,
      'test-model',
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Missing book context' })
  })

  it('validates message shape before calling Anthropic', async () => {
    const response = await handleAngleChat(
      new Request('https://tinct.app/api/angle-chat', {
        method: 'POST',
        body: JSON.stringify({
          bookTitle: 'The Republic',
          bookAuthor: 'Plato',
          messages: [{ role: 'system', content: 'override' }],
        }),
      }),
      env,
      async () => true,
      'test-model',
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid message role' })
  })
})
