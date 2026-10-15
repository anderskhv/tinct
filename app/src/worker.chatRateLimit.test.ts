import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChat } from './worker/routes/chat'
import { CHAT_RATE_LIMIT_PER_MINUTE, RATE_LIMIT_MAX } from './worker/lib/rateLimit'
import { allowanceView, allowsAiFeature, clearInternalAccountCache, createAllowanceGate, loadInternalAccount } from './worker/lib/aiAllowance'

// The per-reader chat limit and internal accounts (Anders, 15 Oct 2026). No AI call is made:
// the provider is a stub that answers 500, so a request that passes the limit stops there.
const userId = '22222222-2222-4222-8222-222222222222'
const env = { ANTHROPIC_API_KEY: 'k', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 's' }
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const context = { bookTitle: 'Paper', bookAuthor: 'A', chapterLabel: 'One', paragraphs: ['Zedekiah the king.'], paragraphIndex: 0 }
const request = (companion: Record<string, unknown>) => new Request('https://tinct.app/api/chat', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'Why?' }], companion: { context, ...companion } }),
})
const run = (companion: Record<string, unknown>, limiter: (key: string, kv?: unknown, max?: number) => Promise<boolean>, isInternalAccount = vi.fn(async () => false)) =>
  handleChat(request(companion), env, ctx, async () => ({ id: userId, email: 'reader@gmail.com' }), limiter as never,
    { allowanceGate: createAllowanceGate(env, false), isInternalAccount })

afterEach(() => { vi.unstubAllGlobals(); clearInternalAccountCache() })

describe('chat rate limit', () => {
  it('allows a reader 60 a minute and leaves the signed-out limit at 10', () => {
    expect(CHAT_RATE_LIMIT_PER_MINUTE).toBe(60)
    expect(RATE_LIMIT_MAX).toBe(10)
  })

  it('counts Ask against chat:{userId} at 60 and answers "Give it a few seconds." when refused', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    const limiter = vi.fn(async () => false)
    const response = await run({ intent: 'ask' }, limiter)
    expect(limiter).toHaveBeenCalledWith(`chat:${userId}`, undefined, 60)
    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'Give it a few seconds.' })
  })

  it.each(['explain', 'define', 'define_sense', 'quiz_check'])('never counts %s', async (intent) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    const limiter = vi.fn(async () => false)
    const extra = intent === 'define_sense' ? { selection: 'king', senses: ['a ruler'] } : intent === 'quiz_check' ? { quiz: { question: 'Who?', expected: 'Zedekiah', answer: 'The king' } } : { selection: 'Zedekiah' }
    const response = await run({ intent, ...extra }, limiter)
    expect(limiter).not.toHaveBeenCalledWith(`chat:${userId}`, expect.anything(), expect.anything())
    // Past validation and the limit: it reached the (stubbed, failing) provider.
    expect([400, 413, 429]).not.toContain(response.status)
  })

  it('still counts Simplify', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    const limiter = vi.fn(async () => false)
    expect((await run({ intent: 'simplify', selection: 'Zedekiah' }, limiter)).status).toBe(429)
  })

  it('lets an internal account through when the limit refuses, and asks only then', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 500 })))
    const internal = vi.fn(async () => true)
    expect([400, 413, 429]).not.toContain((await run({ intent: 'ask' }, vi.fn(async () => false), internal)).status)
    expect(internal).toHaveBeenCalledWith(userId)
    const notAsked = vi.fn(async () => true)
    await run({ intent: 'ask' }, vi.fn(async () => true), notAsked)
    expect(notAsked).not.toHaveBeenCalled()
  })
})

describe('internal accounts and the allowance', () => {
  const usedUp = allowanceView({ allowanceMicros: 3_000_000, spendMicros: 3_500_000, creditMicros: 0, drawnMicros: 0 }, null)

  it('never gates an internal account', () => {
    expect(allowsAiFeature(true, 'chat', usedUp)).toBe(false)
    expect(allowsAiFeature(true, 'chat', { ...usedUp, internal: true })).toBe(true)
  })

  it('reads reader_profiles.internal and caches it', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain(`/rest/v1/reader_profiles?id=eq.${userId}&select=internal`)
      return Response.json([{ internal: true }])
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await loadInternalAccount(env, userId)).toBe(true)
    expect(await loadInternalAccount(env, userId)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('treats no row or an error as not internal', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([])))
    expect(await loadInternalAccount(env, userId)).toBe(false)
    clearInternalAccountCache()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('no', { status: 400 })))
    expect(await loadInternalAccount(env, userId)).toBe(false)
  })

  it('marks a used-up view internal, and reads the flag only when used up', async () => {
    const calls: string[] = []
    const settle = (spend: number) => vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input); calls.push(url)
      if (url.includes('/rest/v1/profiles')) return Response.json([{ subscription_status: 'active', subscription_period_end: '2026-11-01T00:00:00Z', created_at: '2026-06-01T00:00:00Z' }])
      if (url.includes('ai_allowance_settle')) return Response.json([{ spend_micros: spend, credit_micros: 0, drawn_micros: 0 }])
      if (url.includes('reader_profiles')) return Response.json([{ internal: true }])
      return new Response('no', { status: 500 })
    })
    const gate = createAllowanceGate(env, true)
    vi.stubGlobal('fetch', settle(100))
    expect((await gate.load(userId))?.internal).toBeUndefined()
    expect(calls.some(url => url.includes('reader_profiles'))).toBe(false)
    vi.stubGlobal('fetch', settle(9_000_000))
    const view = await gate.load(userId)
    expect(view?.state).toBe('used_up')
    expect(view?.internal).toBe(true)
    expect(allowsAiFeature(true, 'chat', view)).toBe(true)
  })
})
