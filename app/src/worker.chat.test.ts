import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleChat } from './worker/routes/chat'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  ANTHROPIC_API_KEY: 'anthropic-key',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

function makeExecutionContext() {
  const pending: Promise<unknown>[] = []
  const waitUntil = vi.fn((promise: Promise<unknown>) => {
    pending.push(Promise.resolve(promise))
  })
  return {
    ctx: { waitUntil } as unknown as ExecutionContext,
    pending,
    waitUntil,
  }
}

function chatRequest(body: unknown, init: RequestInit = {}) {
  return new Request('https://tinct.app/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    ...init,
  })
}

describe('chat route', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-16T12:00:00Z'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('rejects non-POST requests', async () => {
    const { ctx } = makeExecutionContext()
    const response = await handleChat(
      new Request('https://tinct.app/api/chat'),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('requires auth before rate limiting or upstream calls', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const rateLimit = vi.fn(async () => true)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ messages: [] }),
      env,
      ctx,
      async () => null,
      rateLimit,
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authentication required' })
    expect(rateLimit).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the route-specific rate limit blocks', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) {
        return Response.json([{
          messages_used_this_period: 0,
          message_balance: 0,
          subscription_status: 'active',
          subscription_period_end: null,
          created_at: '2026-06-01T12:00:00Z',
        }])
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ messages: [] }),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async (key) => {
        expect(key).toBe(`chat:${userId}`)
        return false
      },
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Rate limit exceeded. Try again in a minute.' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows trial users and caps the Anthropic request payload', async () => {
    let anthropicBody: Record<string, unknown> | null = null
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) {
        return Response.json([{
          messages_used_this_period: 0,
          message_balance: 0,
          subscription_status: null,
          subscription_period_end: null,
          created_at: '2026-06-01T12:00:00Z',
        }])
      }
      if (url === 'https://api.anthropic.com/v1/messages') {
        anthropicBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return Response.json({ content: [], usage: { input_tokens: 1, output_tokens: 1 } })
      }
      if (url.includes('/rest/v1/rpc/use_message')) {
        return Response.json({})
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, pending, waitUntil } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({
        max_tokens: 99_999,
        system: [{ type: 'text', text: 'reader context', cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: 'hello' }],
      }),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ content: [], usage: { input_tokens: 1, output_tokens: 1 } })
    expect(anthropicBody).toMatchObject({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [{ type: 'text', text: 'reader context', cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: 'hello' }],
    })
    expect(waitUntil).toHaveBeenCalledTimes(1)
    await Promise.all(pending)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/rest/v1/rpc/use_message',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('rejects invalid system blocks before calling Anthropic', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json(null)
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()

    const response = await handleChat(
      chatRequest({ system: [{ type: 'image', text: 'not allowed' }], messages: [] }),
      { ANTHROPIC_API_KEY: 'anthropic-key' },
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid system prompt block type' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
