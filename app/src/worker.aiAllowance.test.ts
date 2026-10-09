import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_MODEL } from './companionModel'
import type { AllowanceGate, AllowanceView } from './worker/lib/aiAllowance'
import { handleAiAllowance } from './worker/routes/aiAllowance'
import { availableTopUps, chatPackSale, handleCreateCheckout, handleWebhook } from './worker/routes/billing'
import { AI_ALLOWANCE_ENFORCED } from './aiAllowanceSwitch'
import { handleChat } from './worker/routes/chat'
import { handleLabCatchUp } from './worker/routes/labCatchUp'
import { handleLabChapterNotes } from './worker/routes/labChapterNotes'
import { handleLabRecap } from './worker/routes/labRecap'
import { XAI_CLIENT_SECRETS_URL, handleVoiceSession } from './worker/routes/voice'

const userId = '11111111-1111-4111-8111-111111111111'
const supabaseEnv = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true

const usedUp: AllowanceView = { usedFraction: 1, monthUsedFraction: 1, topUpLeftFraction: null, state: 'used_up', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: false }
const plenty: AllowanceView = { usedFraction: 0.25, monthUsedFraction: 0.4, topUpLeftFraction: 0.5, state: 'ok', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: true }
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
    expect(Object.keys(body).sort()).toEqual(['enabled', 'hasTopUp', 'monthUsedFraction', 'resetsAt', 'state', 'topUpLeftFraction', 'topUps', 'usedFraction'])
    expect(body).toEqual({ enabled: true, usedFraction: 0.25, monthUsedFraction: 0.4, topUpLeftFraction: 0.5, state: 'ok', resetsAt: '2026-10-20T00:00:00.000Z', hasTopUp: true, topUps: [] })
    expect(JSON.stringify(body)).not.toMatch(/usd|micros|cents|credit|spend|\$/i)
  })

  it('names the top-ups on sale, never their prices or credit', async () => {
    const env = { ...supabaseEnv, STRIPE_PRICE_CHAT_200: 'price_5', STRIPE_PRICE_TOP_UP_10: 'price_10' }
    const response = await handleAiAllowance(new Request('https://tinct.app/api/ai-allowance'), env, reader, gate(usedUp))
    const body = await response.json() as Record<string, unknown>
    expect(body.topUps).toEqual(['chat_pack_200', 'top_up_10'])
    expect(JSON.stringify(body)).not.toMatch(/price_|usd|micros|cents|credit|spend|\$/i)
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

  it('chapter notes on Sonnet charge only the reader whose request generates them; cached copies are free for everyone', async () => {
    // A shared cache, as caches.default: the first reader's request writes it.
    const store = new Map<string, Response>()
    const cache = {
      match: vi.fn(async (key: Request) => store.get(key.url)?.clone()),
      put: vi.fn(async (key: Request, value: Response) => { store.set(key.url, value) }),
    }
    const ledgerRows: Array<Record<string, unknown>> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/rest/v1/ai_usage_events')) ledgerRows.push(JSON.parse(String(init?.body)))
      return new Response(null, { status: 201 })
    }))
    const anthropic = vi.fn(async (_payload: Record<string, unknown>, _apiKey: string) => Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"beats":[{"title":"Where we are","text":"Anna arrives."},{"title":"Watch for","text":"Snow."}]}' }], usage: { input_tokens: 1000, output_tokens: 200 } }))
    const ledgerEnv = { ...env, ...supabaseEnv }
    const body = { bookId: 'anna', editionKey: 'original-en', chapterNumber: 2, kind: 'primer' }
    const firstReader = '22222222-2222-4222-8222-222222222222'
    const secondReader = '33333333-3333-4333-8333-333333333333'
    const allowsAi = vi.fn(async () => true)

    const first = context()
    const generated = await handleLabChapterNotes(post('/api/lab-chapter-notes', body), ledgerEnv, first.ctx, allow, { reserveGuestSpend: allow, cache, fetchAnthropic: anthropic, allowsAi, resolveUser: async () => firstReader })
    await Promise.all(first.pending)
    expect(await generated.json()).toMatchObject({ source: 'model' })
    expect(anthropic).toHaveBeenCalledTimes(1)
    expect(anthropic.mock.calls[0][0]).toMatchObject({ model: COMPANION_MODEL })
    expect(ledgerRows).toHaveLength(1)
    expect(ledgerRows[0]).toMatchObject({ user_id: firstReader, guest_key: null, feature: 'chapter_notes', model: COMPANION_MODEL })
    expect(Number(ledgerRows[0].cost_usd)).toBeGreaterThan(0)

    const second = context()
    const resolveSecond = vi.fn(async () => secondReader)
    const served = await handleLabChapterNotes(post('/api/lab-chapter-notes', body), ledgerEnv, second.ctx, allow, { reserveGuestSpend: allow, cache, fetchAnthropic: anthropic, allowsAi, resolveUser: resolveSecond })
    await Promise.all(second.pending)
    expect(await served.json()).toMatchObject({ source: 'cache' })
    expect(anthropic).toHaveBeenCalledTimes(1)
    expect(ledgerRows).toHaveLength(1)
    // The cached copy neither checks nor charges the second reader.
    expect(allowsAi).toHaveBeenCalledTimes(1)
    expect(resolveSecond).not.toHaveBeenCalled()
  })

  it('a cached chapter note is served even at zero', async () => {
    const cache = { match: vi.fn(async () => Response.json({ beats: [{ title: 'Where we are', text: 'Anna arrives.' }] })), put: vi.fn(async () => {}) }
    const allowsAi = vi.fn(refused)
    const response = await handleLabChapterNotes(post('/api/lab-chapter-notes', { bookId: 'anna', editionKey: 'original-en', chapterNumber: 2, kind: 'end' }), env, context().ctx, allow, { reserveGuestSpend: allow, cache, fetchAnthropic: fetchAnthropic(), allowsAi })
    expect(response.status).toBe(200)
    expect(allowsAi).not.toHaveBeenCalled()
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
    ['chat_pack_200', '500', 3_500_000],
    ['top_up_10', '1000', 7_500_000],
  ])('credits %s from the configured map', async (checkoutType, amountCents, micros) => {
    const { rpcBodies } = stubSupabase()
    const response = await handleWebhook(await signed(completed({ checkout_type: checkoutType, amount_cents: amountCents })), env)
    expect(response.status).toBe(200)
    expect(rpcBodies).toEqual([{ fn: 'credit_ai_topup', body: { p_user_id: userId, p_stripe_session_id: 'cs_test_1', p_micros: micros, p_amount_cents: Number(amountCents) } }])
  })

  it.each([
    ['100', '300'],
    ['200', '500'],
  ])('a message pack (%s messages, sold while the switch is off) adds messages exactly as on main', async (messageCount, amountCents) => {
    const inserts: Array<{ table: string; body: Record<string, unknown> }> = []
    const { rpcBodies, fetchMock } = stubSupabase()
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const rpc = /\/rpc\/([a-z_]+)$/.exec(url)
      if (rpc) { rpcBodies.push({ fn: rpc[1], body: JSON.parse(String(init?.body)) }); return Response.json(true) }
      const table = /\/rest\/v1\/([a-z_]+)/.exec(url)?.[1]
      if (table && init?.method === 'POST') inserts.push({ table, body: JSON.parse(String(init.body)) })
      return Response.json({}, { status: 201 })
    })
    const response = await handleWebhook(await signed(completed({ message_count: messageCount, amount_cents: amountCents })), env)
    expect(response.status).toBe(200)
    expect(inserts).toEqual([{ table: 'payments', body: { user_id: userId, stripe_session_id: 'cs_test_1', amount_cents: Number(amountCents), type: 'chat_pack', status: 'completed' } }])
    expect(rpcBodies).toEqual([{ fn: 'credit_messages', body: { p_user_id: userId, p_count: Number(messageCount) } }])
  })

  it('a replayed message pack is not credited twice (payments conflict), as on main', async () => {
    const { rpcBodies, fetchMock } = stubSupabase()
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (/\/rpc\//.test(url)) { rpcBodies.push({ fn: url, body: JSON.parse(String(init?.body)) }); return Response.json(true) }
      return Response.json({ code: '23505' }, { status: 409 })
    })
    const response = await handleWebhook(await signed(completed({ message_count: '200', amount_cents: '500' })), env)
    expect(response.status).toBe(200)
    expect(rpcBodies).toEqual([])
  })

  it('credits by what the session was sold as, not by the switch at delivery', () => {
    expect(chatPackSale({ message_count: '100' })).toEqual({ kind: 'messages' })
    expect(chatPackSale({ message_count: '200', amount_cents: '500' })).toEqual({ kind: 'messages' })
    expect(chatPackSale({ checkout_type: 'top_up_10' })).toEqual({ kind: 'top_up', checkoutType: 'top_up_10' })
    expect(chatPackSale({})).toBeNull()
    expect(chatPackSale(undefined)).toBeNull()
  })

  it('mixed flip: a message pack bought before and a top-up bought after the flip each get what was sold', async () => {
    const { rpcBodies } = stubSupabase()
    const checkoutEnv = { STRIPE_SECRET_KEY: 'sk_test', STRIPE_PRICE_CHAT_200: 'price_5', ...supabaseEnv }
    const metadataOf = async (allowanceOn: boolean) => {
      const sessions: URLSearchParams[] = []
      vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input).includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
        if (String(input) === 'https://api.stripe.com/v1/checkout/sessions') sessions.push(new URLSearchParams(String(init?.body)))
        return Response.json({ url: 'https://checkout.stripe.com/c/pay' })
      }))
      await handleCreateCheckout(post('/api/create-checkout', { type: 'chat_pack_200' }), checkoutEnv, reader, undefined, allowanceOn)
      return Object.fromEntries([...sessions[0].entries()].filter(([key]) => key.startsWith('metadata[') && key !== 'metadata[supabase_user_id]').map(([key, value]) => [key.slice(9, -1), value]))
    }
    const beforeFlip = await metadataOf(false)
    const afterFlip = await metadataOf(true)
    expect(beforeFlip).toEqual({ type: 'chat_pack', message_count: '200', amount_cents: '500' })
    expect(afterFlip).toEqual({ type: 'chat_pack', checkout_type: 'chat_pack_200', amount_cents: '500' })
    // Both webhooks arrive after the flip (or both before: the webhook does not read the switch).
    const { rpcBodies: delivered } = stubSupabase()
    await handleWebhook(await signed(completed(beforeFlip)), env)
    await handleWebhook(await signed(completed(afterFlip)), env)
    expect(delivered.map(entry => entry.fn)).toEqual(['credit_messages', 'credit_ai_topup'])
    expect(delivered[0].body).toEqual({ p_user_id: userId, p_count: 200 })
    expect(delivered[1].body).toMatchObject({ p_micros: 3_500_000, p_amount_cents: 500 })
    expect(rpcBodies).toEqual([])
  })

  it('ignores amounts in the metadata and unknown top-up types', async () => {
    const { rpcBodies } = stubSupabase()
    await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_9000', credit_usd: '500', message_count: '1000' })), env)
    expect(rpcBodies).toEqual([])
    // The $3 pack is never a top-up: no credit.
    await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_100', message_count: '100' })), env)
    expect(rpcBodies).toEqual([])
    await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_200', credit_usd: '500', micros: '999999999' })), env)
    expect(rpcBodies.map(entry => entry.fn)).toEqual(['credit_ai_topup'])
    expect(rpcBodies[0].body.p_micros).toBe(3_500_000)
  })

  it('hands every delivery of one session to the database under the same session id, so a replay credits once', async () => {
    // credit_ai_topup inserts the payment ON CONFLICT (stripe_session_id) DO NOTHING
    // and adds credit only when the row was new; a replay returns false.
    const rpcBodies: Array<Record<string, unknown>> = []
    let seen = false
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/rpc/credit_ai_topup')) {
        rpcBodies.push(JSON.parse(String(init?.body)))
        const first = !seen
        seen = true
        return Response.json(first)
      }
      return Response.json({})
    }))
    const event = completed({ checkout_type: 'top_up_10', amount_cents: '1000' })
    const first = await handleWebhook(await signed(event), env)
    const replay = await handleWebhook(await signed(event), env)
    expect([first.status, replay.status]).toEqual([200, 200])
    expect(rpcBodies).toHaveLength(2)
    expect(rpcBodies[0]).toEqual(rpcBodies[1])
    expect(rpcBodies[0]).toMatchObject({ p_stripe_session_id: 'cs_test_1', p_micros: 7_500_000 })
  })

  it('answers 500 so Stripe retries when the credit cannot be written', async () => {
    stubSupabase(404)
    const response = await handleWebhook(await signed(completed({ checkout_type: 'chat_pack_200' })), env)
    expect(response.status).toBe(500)
  })
})

describe('top-up checkout', () => {
  const env = { STRIPE_SECRET_KEY: 'sk_test', STRIPE_PRICE_CHAT_100: 'price_3', STRIPE_PRICE_CHAT_200: 'price_5', STRIPE_PRICE_TOP_UP_10: 'price_10', ...supabaseEnv }

  function stubStripe() {
    const sessions: URLSearchParams[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
      if (url === 'https://api.stripe.com/v1/checkout/sessions') {
        sessions.push(new URLSearchParams(String(init?.body)))
        return Response.json({ url: 'https://checkout.stripe.com/c/pay' })
      }
      return Response.json({})
    }))
    return sessions
  }

  it.each([
    ['chat_pack_200', 'price_5', '500'],
    ['top_up_10', 'price_10', '1000'],
  ])('switch on: sells %s at its own price with its checkout type', async (type, price, cents) => {
    const sessions = stubStripe()
    const response = await handleCreateCheckout(post('/api/create-checkout', { type }), env, reader, undefined, true)
    expect(response.status).toBe(200)
    expect(sessions[0].get('mode')).toBe('payment')
    expect(sessions[0].get('line_items[0][price]')).toBe(price)
    expect(sessions[0].get('metadata[type]')).toBe('chat_pack')
    expect(sessions[0].get('metadata[checkout_type]')).toBe(type)
    expect(sessions[0].get('metadata[message_count]')).toBeNull()
    expect(sessions[0].get('metadata[amount_cents]')).toBe(cents)
  })

  it('switch on: no longer sells the $3 pack', async () => {
    const sessions = stubStripe()
    const response = await handleCreateCheckout(post('/api/create-checkout', { type: 'chat_pack_100' }), env, reader, undefined, true)
    expect(response.status).toBe(400)
    expect(sessions).toEqual([])
  })

  it.each([
    ['chat_pack_100', 'price_3', '100', '300'],
    ['chat_pack_200', 'price_5', '200', '500'],
  ])('switch off: sells %s exactly as on main', async (type, price, messages, cents) => {
    const sessions = stubStripe()
    const response = await handleCreateCheckout(post('/api/create-checkout', { type }), env, reader, undefined, false)
    expect(response.status).toBe(200)
    const metadata = [...sessions[0].entries()].filter(([key]) => key.startsWith('metadata['))
    expect(metadata).toEqual([
      ['metadata[supabase_user_id]', userId],
      ['metadata[type]', 'chat_pack'],
      ['metadata[message_count]', messages],
      ['metadata[amount_cents]', cents],
    ])
    expect(sessions[0].get('mode')).toBe('payment')
    expect(sessions[0].get('line_items[0][price]')).toBe(price)
    expect(sessions[0].get('line_items[0][quantity]')).toBe('1')
  })

  it('switch off: the $10 top-up is not on sale', async () => {
    const sessions = stubStripe()
    const response = await handleCreateCheckout(post('/api/create-checkout', { type: 'top_up_10' }), env, reader, undefined, false)
    expect(response.status).toBe(400)
    expect(sessions).toEqual([])
  })

  it('follows the shipped switch by default (off: message packs)', async () => {
    const sessions = stubStripe()
    await handleCreateCheckout(post('/api/create-checkout', { type: 'chat_pack_200' }), env, reader)
    expect(sessions[0].get('metadata[message_count]')).toBe(AI_ALLOWANCE_ENFORCED ? null : '200')
  })

  it('offers the $10 top-up only once its price is set', () => {
    expect(availableTopUps(env)).toEqual(['chat_pack_200', 'top_up_10'])
    expect(availableTopUps({ ...env, STRIPE_PRICE_TOP_UP_10: undefined })).toEqual(['chat_pack_200'])
    expect(availableTopUps({})).toEqual([])
  })

  it('reads the $10 price under either secret name, STRIPE_PRICE_TOP_UP_10 first', async () => {
    const named = (fields: Record<string, string | undefined>) => ({ ...env, STRIPE_PRICE_TOP_UP_10: undefined, ...fields })
    for (const [fields, price] of [
      [{ STRIPE_PRICE_TOP_UP_10: 'price_10' }, 'price_10'],
      [{ STRIPE_PRICE_TOPUP_10: 'price_10_cf' }, 'price_10_cf'],
      [{ STRIPE_PRICE_TOP_UP_10: 'price_10', STRIPE_PRICE_TOPUP_10: 'price_10_cf' }, 'price_10'],
    ] as const) {
      expect(availableTopUps(named(fields))).toEqual(['chat_pack_200', 'top_up_10'])
      const sessions = stubStripe()
      const response = await handleCreateCheckout(post('/api/create-checkout', { type: 'top_up_10' }), named(fields), reader, undefined, true)
      expect(response.status).toBe(200)
      expect(sessions[0].get('line_items[0][price]')).toBe(price)
      expect(sessions[0].get('metadata[amount_cents]')).toBe('1000')
    }
    expect(availableTopUps(named({}))).toEqual(['chat_pack_200'])
  })

  it('leaves the $5 price on STRIPE_PRICE_CHAT_200 only', async () => {
    const env5 = { ...env, STRIPE_PRICE_CHAT_200: undefined, STRIPE_PRICE_TOPUP_5: 'price_5_cf' }
    expect(availableTopUps(env5)).toEqual(['top_up_10'])
    const sessions = stubStripe()
    const response = await handleCreateCheckout(post('/api/create-checkout', { type: 'chat_pack_200' }), env5, reader, undefined, true)
    expect(response.status).toBe(500)
    expect(sessions).toEqual([])
  })
})
