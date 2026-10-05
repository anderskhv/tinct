import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import type { AllowanceGate, AllowanceView } from './worker/lib/aiAllowance'
import { handleAiAllowance } from './worker/routes/aiAllowance'
import { chatPackCheckoutType, handleWebhook } from './worker/routes/billing'
import { handleChat } from './worker/routes/chat'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
import { handleLabChapterNotes } from './worker/routes/labChapterNotes'
import { handleLabRecap } from './worker/routes/labRecap'
import { XAI_CLIENT_SECRETS_URL, handleVoiceSession } from './worker/routes/voice'

const userId = '11111111-1111-4111-8111-111111111111'
const supabaseEnv = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true

const usedUp: AllowanceView = { usedFraction: 1, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false }
const plenty: AllowanceView = { usedFraction: 0.25, state: 'ok', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: true }
const gate = (view: AllowanceView | null, enforced = true): AllowanceGate & { load: ReturnType<typeof vi.fn> } => ({ enforced, load: vi.fn(async () => view) })

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(promise) } } as unknown as ExecutionContext, pending }
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://tinct.app${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers } })
}

function anthropicFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === 'https://api.anthropic.com/v1/messages') {
      return Response.json({ content: [{ type: 'text', text: 'Answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })
    }
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const calledAnthropic = (fetchMock: ReturnType<typeof vi.fn>) => fetchMock.mock.calls.some(call => String(call[0]) === 'https://api.anthropic.com/v1/messages')

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('GET /api/ai-allowance', () => {
  it('requires sign-in', async () => {
    const response = await handleAiAllowance(new Request('https://tinct.app/api/ai-allowance'), supabaseEnv, async () => null, gate(plenty))
    expect(response.status).toBe(401)
  })

  it('says only that it is off while the switch is off, and reads nothing', async () => {
    const off = gate(plenty, false)
    const response = await handleAiAllowance(new Request('https://tinct.app/api/ai-allowance'), supabaseEnv, reader, off)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ enabled: false })
    expect(off.load).not.toHaveBeenCalled()
  })

  it('returns the bar fields and never an amount', async () => {
    // Even a view carrying an amount is copied field by field.
    const leaky = { ...plenty, spendMicros: 5 } as AllowanceView
    const response = await handleAiAllowance(new Request('https://tinct.app/api/ai-allowance'), supabaseEnv, reader, gate(leaky))
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const body = await response.json() as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(['enabled', 'hasTopUp', 'resetsAt', 'state', 'usedFraction'])
    expect(body).toEqual({ enabled: true, usedFraction: 0.25, state: 'ok', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: true })
    expect(JSON.stringify(body)).not.toMatch(/usd|micros|cents|credit|spend|\$/i)
  })

  it('answers 503 when the usage cannot be read', async () => {
    const response = await handleAiAllowance(new Request('https://tinct.app/api/ai-allowance'), supabaseEnv, reader, gate(null))
    expect(response.status).toBe(503)
  })
})

describe('signed-in chat gate', () => {
  const env = { ANTHROPIC_API_KEY: 'k', ...supabaseEnv }
  const chatBody = { system: 'You are a companion.', messages: [{ role: 'user', content: 'Who is Athena?' }] }
  const companion = (intent: 'explain' | 'define') => ({
    companion: {
      intent,
      selection: 'Athena',
      context: { bookTitle: 'The Odyssey', bookAuthor: 'Homer', chapterLabel: 'Book 1', paragraphs: ['Athena spoke.'], paragraphIndex: 0 },
    },
  })

  it('refuses chat with 402 allowance_used when the allowance is used up', async () => {
    const fetchMock = anthropicFetch()
    const response = await handleChat(post('/api/chat', chatBody), env, context().ctx, reader, allow, { allowanceGate: gate(usedUp) })
    expect(response.status).toBe(402)
    expect(await response.json()).toEqual({ error: 'allowance_used' })
    expect(calledAnthropic(fetchMock)).toBe(false)
  })

  it('never blocks Explain or Define', async () => {
    for (const intent of ['explain', 'define'] as const) {
      const fetchMock = anthropicFetch()
      const response = await handleChat(post('/api/chat', companion(intent)), env, context().ctx, reader, allow, { allowanceGate: gate(usedUp) })
      expect(response.status).toBe(200)
      expect(calledAnthropic(fetchMock)).toBe(true)
    }
  })

  it('lets chat through with allowance left, or with the switch off', async () => {
    for (const allowanceGate of [gate(plenty), gate(usedUp, false)]) {
      const fetchMock = anthropicFetch()
      const response = await handleChat(post('/api/chat', chatBody), env, context().ctx, reader, allow, { allowanceGate })
      expect(response.status).toBe(200)
      expect(calledAnthropic(fetchMock)).toBe(true)
    }
  })

  it('does not read the allowance while the switch is off', async () => {
    anthropicFetch()
    const off = gate(usedUp, false)
    await handleChat(post('/api/chat', chatBody), env, context().ctx, reader, allow, { allowanceGate: off })
    expect(off.load).not.toHaveBeenCalled()
  })
})

describe('voice session gate', () => {
  it('refuses to start Talk at zero, and starts it otherwise', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => String(input) === XAI_CLIENT_SECRETS_URL ? Response.json({ value: 'secret', expires_at: 1 }) : Response.json({}))
    vi.stubGlobal('fetch', fetchMock)
    const env = { XAI_API_KEY: 'x', ...supabaseEnv }
    const blocked = await handleVoiceSession(post('/api/voice-session', {}), env, context().ctx, reader, allow, gate(usedUp))
    expect(blocked.status).toBe(402)
    expect(await blocked.json()).toEqual({ error: 'allowance_used' })
    expect(fetchMock.mock.calls.some(call => String(call[0]) === XAI_CLIENT_SECRETS_URL)).toBe(false)

    const open = await handleVoiceSession(post('/api/voice-session', {}), env, context().ctx, reader, allow, gate(usedUp, false))
    expect(open.status).toBe(200)
  })
})

describe('recap, chapter notes and Catch me up gates', () => {
  const chapters: Record<number, { number: number; title: string; paragraphs: string[] }> = {
    1: { number: 1, title: 'Chapter 1', paragraphs: ['Anna arrives.', 'Snow falls.'] },
    2: { number: 2, title: 'Chapter 2', paragraphs: ['Levin mows.'] },
  }
  const assets = {
    fetch: async (request: Request) => {
      const path = new URL(request.url).pathname
      if (path.startsWith('/data/catch-up/')) return new Response('nf', { status: 404 })
      if (path.endsWith('/manifest.json')) return Response.json({ chapters: Object.values(chapters).map(c => ({ number: c.number, title: c.title, path: `ch${String(c.number).padStart(4, '0')}.json` })) })
      const match = /ch(\d{4})\.json$/.exec(path)
      const found = match ? chapters[Number(match[1])] : undefined
      return found ? Response.json(found) : new Response('nf', { status: 404 })
    },
  }
  const env = { ANTHROPIC_API_KEY: 'k', ASSETS: assets }
  const fetchAnthropic = () => vi.fn(async () => Response.json({ model: COMPANION_MODEL, stop_reason: 'end_turn', content: [{ type: 'text', text: '{"beats":[]} So far, Anna arrives.' }], usage: { input_tokens: 1, output_tokens: 1 } }))
  const refused = async () => false

  it('recap refuses generation at zero', async () => {
    const anthropic = fetchAnthropic()
    const response = await handleLabRecap(post('/api/lab-recap', { bookId: 'anna', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 1, completed: false }), env, context().ctx, allow, { reserveGuestSpend: allow, cache: null, fetchAnthropic: anthropic, allowsAi: refused })
    expect(response.status).toBe(402)
    expect(await response.json()).toEqual({ error: 'allowance_used' })
    expect(anthropic).not.toHaveBeenCalled()
  })

  it('recap still serves a cached entry at zero', async () => {
    const stored = { summary: 'So far.', coverage: { chapterNumber: 1, throughParagraph: 1, paragraphCount: 2, complete: true, fromChapterNumber: null }, model: COMPANION_MODEL, version: 'v', cached: false }
    const cache = { match: vi.fn(async () => Response.json(stored)), put: vi.fn(async () => {}) }
    const allowsAi = vi.fn(refused)
    const response = await handleLabRecap(post('/api/lab-recap', { bookId: 'anna', editionKey: 'original-en', chapterNumber: 1, paragraphIndex: 1, completed: false }), env, context().ctx, allow, { reserveGuestSpend: allow, cache, fetchAnthropic: fetchAnthropic(), allowsAi })
    expect(response.status).toBe(200)
    expect(allowsAi).not.toHaveBeenCalled()
  })

  it('chapter notes refuse generation at zero', async () => {
    const anthropic = fetchAnthropic()
    const response = await handleLabChapterNotes(post('/api/lab-chapter-notes', { bookId: 'anna', editionKey: 'original-en', chapterNumber: 2, kind: 'primer' }), env, context().ctx, allow, { reserveGuestSpend: allow, cache: null, fetchAnthropic: anthropic, allowsAi: refused })
    expect(response.status).toBe(402)
    expect(anthropic).not.toHaveBeenCalled()
  })

  it('Catch me up refuses generation at zero', async () => {
    const anthropic = fetchAnthropic()
    const response = await handleLabCatchUp(post('/api/lab-catch-up', { bookId: 'anna', editionKey: 'original-en', unitId: 'ch-1', bookTitle: 'Anna' }), env, context().ctx, allow, { reserveGuestSpend: allow, cache: null, fetchAnthropic: anthropic, allowsAi: refused })
    expect(response.status).toBe(402)
    expect(anthropic).not.toHaveBeenCalled()
  })
})

describe('Stripe webhook top-up credit', () => {
  const env = { STRIPE_WEBHOOK_SECRET: 'whsec_test', ...supabaseEnv }

  async function signed(event: unknown) {
    const body = JSON.stringify(event)
    const timestamp = String(Math.floor(Date.now() / 1000))
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`)))
    const signature = Array.from(mac).map(byte => byte.toString(16).padStart(2, '0')).join('')
    return new Request('https://tinct.app/api/webhook', { method: 'POST', body, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` } })
  }

  const completed = (metadata: Record<string, string>) => ({
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_1', metadata: { supabase_user_id: userId, type: 'chat_pack', ...metadata } } },
  })

  function stubSupabase(status = 200) {
    const rpcBodies: Array<{ fn: string; body: Record<string, unknown> }> = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const rpc = /\/rpc\/([a-z_]+)$/.exec(url)
      if (rpc) {
        rpcBodies.push({ fn: rpc[1], body: JSON.parse(String(init?.body)) })
        return Response.json(true, { status })
      }
      return Response.json({})
    })
    vi.stubGlobal('fetch', fetchMock)
    return { rpcBodies, fetchMock }
  }

  it.each([
    ['chat_pack_100', '100', 2_100_000],
    ['chat_pack_200', '200', 3_500_000],
  ])('credits %s from the configured map', async (checkoutType, messageCount, micros) => {
    const { rpcBodies } = stubSupabase()
    const response = await handleWebhook(await signed(completed({ checkout_type: checkoutType, message_count: messageCount, amount_cents: '300' })), env)
    expect(response.status).toBe(200)
    expect(rpcBodies).toEqual([{ fn: 'credit_ai_topup', body: { p_user_id: userId, p_stripe_session_id: 'cs_test_1', p_micros: micros, p_amount_cents: 300 } }])
  })

  it('reads sessions created before checkout_type was stored by their message count', async () => {
    const { rpcBodies } = stubSupabase()
    await handleWebhook(await signed(completed({ message_count: '200', amount_cents: '500' })), env)
    expect(rpcBodies[0].body.p_micros).toBe(3_500_000)
    expect(chatPackCheckoutType({ message_count: '100' })).toBe('chat_pack_100')
    expect(chatPackCheckoutType({ message_count: '999' })).toBeNull()
  })

  it('ignores amounts in the metadata and unknown pack types, and no longer credits messages', async () => {
    const { rpcBodies } = stubSupabase()
    await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_9000', credit_usd: '500', message_count: '1000' })), env)
    expect(rpcBodies).toEqual([])
    await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_100', credit_usd: '500', micros: '999999999' })), env)
    expect(rpcBodies.map(entry => entry.fn)).toEqual(['credit_ai_topup'])
    expect(rpcBodies[0].body.p_micros).toBe(2_100_000)
  })

  it('answers 500 so Stripe retries when the credit cannot be written', async () => {
    stubSupabase(404)
    const response = await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_100' })), env)
    expect(response.status).toBe(500)
  })
})
