import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleLabVoiceSession, handleVoiceSession, VOICE_NOT_CONFIGURED_ERROR, XAI_CLIENT_SECRETS_URL } from './worker/routes/voice'
import { GROK_CLIENT_SECRET_TTL_SECONDS, GROK_VOICE_MODEL } from './voice/grokConfig'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  XAI_API_KEY: 'xai-test-key',
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

function voiceRequest(body = '{}') {
  return new Request('https://tinct.app/api/voice-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
}

describe('voice session route (Grok native speech-to-speech)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-18T12:00:00Z'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('rejects non-POST requests', async () => {
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(
      new Request('https://tinct.app/api/voice-session'),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )
    expect(response.status).toBe(405)
  })

  it('fails clearly when XAI_API_KEY is missing, even if the old OpenAI key is present', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(
      voiceRequest(),
      { OPENAI_API_KEY: 'openai-key' },
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: VOICE_NOT_CONFIGURED_ERROR })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requires auth before minting a client secret', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(voiceRequest(), env, ctx, async () => null, async () => true)
    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mints a lab guest client secret without a session and does not charge', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === XAI_CLIENT_SECRETS_URL) return Response.json({ value: 'xai-realtime-guest', expires_at: 1_789_740_000 })
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const rateLimit = vi.fn(async (key: string) => {
      expect(key.startsWith('lab-voice:')).toBe(true)
      return true
    })
    const { ctx, waitUntil } = makeExecutionContext()

    const response = await handleLabVoiceSession(voiceRequest(), env, ctx, rateLimit)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ value: 'xai-realtime-guest', expires_at: 1_789_740_000, model: GROK_VOICE_MODEL })
    expect(waitUntil).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('mints a client secret for a signed-in reader and charges one message', async () => {
    let xaiBody: Record<string, unknown> | null = null
    let xaiAuth = ''
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
      if (url === XAI_CLIENT_SECRETS_URL) {
        xaiBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        xaiAuth = String((init?.headers as Record<string, string>).Authorization)
        return Response.json({ value: 'xai-realtime-secret', expires_at: 1_789_740_000 })
      }
      if (url.includes('/rest/v1/rpc/use_message')) return Response.json({})
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx, pending, waitUntil } = makeExecutionContext()

    const response = await handleVoiceSession(
      voiceRequest(),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ value: 'xai-realtime-secret', expires_at: 1_789_740_000, model: GROK_VOICE_MODEL })
    expect(xaiBody).toEqual({ expires_after: { seconds: GROK_CLIENT_SECRET_TTL_SECONDS } })
    expect(xaiAuth).toBe('Bearer xai-test-key')
    expect(waitUntil).toHaveBeenCalledTimes(1)
    await Promise.all(pending)
    expect(fetchMock.mock.calls.some(call => String(call[0]).includes('/rest/v1/rpc/use_message'))).toBe(true)
  })

  it('never forwards client-supplied provider parameters', async () => {
    let xaiBody: Record<string, unknown> | null = null
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === XAI_CLIENT_SECRETS_URL) {
        xaiBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return Response.json({ value: 'xai-realtime-secret', expires_at: 1 })
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    }))
    const { ctx } = makeExecutionContext()
    const response = await handleLabVoiceSession(
      voiceRequest(JSON.stringify({ model: 'grok-4', voiceTrial: 'full', session: { instructions: 'x' }, expires_after: { seconds: 999999 } })),
      env,
      ctx,
      async () => true,
    )
    expect(response.status).toBe(200)
    expect(xaiBody).toEqual({ expires_after: { seconds: GROK_CLIENT_SECRET_TTL_SECONDS } })
  })

  it('blocks readers without chat access before contacting xAI', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/rest/v1/profiles')) {
        return Response.json([{
          messages_used_this_period: 100,
          message_balance: 0,
          subscription_status: 'canceled',
          subscription_period_end: '2026-01-01T00:00:00Z',
          created_at: '2025-01-01T12:00:00Z',
        }])
      }
      return Response.json({ error: 'unexpected fetch' }, { status: 500 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(
      voiceRequest(),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )
    expect(response.status).toBe(402)
    expect(fetchMock.mock.calls.some(call => String(call[0]) === XAI_CLIENT_SECRETS_URL)).toBe(false)
  })

  it('rate limits guests per minute', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleLabVoiceSession(voiceRequest(), env, ctx, async () => false)
    expect(response.status).toBe(429)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('surfaces a provider failure without leaking the key', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Insufficient credits' }, { status: 402 })))
    const { ctx } = makeExecutionContext()
    const response = await handleLabVoiceSession(voiceRequest(), env, ctx, async () => true)
    expect(response.status).toBe(402)
    const body = await response.json() as { error: string }
    expect(body.error).toBe('Insufficient credits')
    expect(JSON.stringify(body)).not.toContain('xai-test-key')
  })
})
