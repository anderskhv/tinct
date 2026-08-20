import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleVoiceSession, VOICE_NOT_CONFIGURED_ERROR } from './worker/routes/voice'
import { VOICE_REALTIME_MODEL } from './voice/types'

const userId = '11111111-1111-4111-8111-111111111111'
const env = {
  OPENAI_API_KEY: 'openai-key',
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

function voiceRequest() {
  return new Request('https://tinct.app/api/voice-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  })
}

describe('voice session route', () => {
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
    const response = await handleVoiceSession(
      new Request('https://tinct.app/api/voice-session'),
      env,
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )
    expect(response.status).toBe(405)
  })

  it('fails clearly when OPENAI_API_KEY is missing', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(
      voiceRequest(),
      {},
      ctx,
      async () => ({ id: userId, email: 'reader@example.com' }),
      async () => true,
    )
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: VOICE_NOT_CONFIGURED_ERROR })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requires auth before minting a token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { ctx } = makeExecutionContext()
    const response = await handleVoiceSession(
      voiceRequest(),
      env,
      ctx,
      async () => null,
      async () => true,
    )
    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mints an ephemeral realtime token and charges one message', async () => {
    let openaiBody: Record<string, unknown> | null = null
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
      if (url === 'https://api.openai.com/v1/realtime/client_secrets') {
        openaiBody = JSON.parse(String(init?.body)) as Record<string, unknown>
        return Response.json({ value: 'ek_test_123', expires_at: 1_771_600_000 })
      }
      if (url.includes('/rest/v1/rpc/use_message')) {
        return Response.json({})
      }
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
    expect(await response.json()).toEqual({
      value: 'ek_test_123',
      expires_at: 1_771_600_000,
      model: VOICE_REALTIME_MODEL,
    })
    expect(openaiBody).toMatchObject({
      session: { type: 'realtime', model: VOICE_REALTIME_MODEL },
    })
    expect(waitUntil).toHaveBeenCalledTimes(1)
    await Promise.all(pending)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/rest/v1/rpc/use_message',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
