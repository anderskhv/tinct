import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildAnalyticsRows, handleEvents, recordServerEvent, FUNNEL_EVENT_NAMES, EVENTS_MAX_BATCH } from './worker/routes/events'
import { handleCreateCheckout } from './worker/routes/billing'

const userId = '11111111-1111-4111-8111-111111111111'
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const batch = (events: unknown[], extra: Record<string, unknown> = {}) => ({
  deviceId: 'device-1234abcd', sessionId: 'session1234abcd', surface: 'reader', path: '/reader', referrer: 'https://example.org/', events, ...extra,
})

function context() {
  const pending: Promise<unknown>[] = []
  return { ctx: { waitUntil: (promise: Promise<unknown>) => { pending.push(Promise.resolve(promise)) } } as unknown as ExecutionContext, pending }
}

function stubAnalytics() {
  const bodies: Array<Array<Record<string, unknown>>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).endsWith('/rest/v1/analytics_events')) { bodies.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }) }
    return new Response('unexpected', { status: 500 })
  }))
  return bodies
}

afterEach(() => vi.unstubAllGlobals())

describe('funnel event rows', () => {
  it('accepts exactly the funnel, pageview and duration events', () => {
    expect([...FUNNEL_EVENT_NAMES].sort()).toEqual([
      'ai_first_use', 'anon_limit_reached', 'book_opened', 'chapter_completed', 'checkout_completed', 'checkout_started',
      'first_page_turn', 'landing_view', 'member_ai_use', 'page_duration', 'pageview', 'signup_completed', 'signup_started',
    ])
  })

  it('maps onto the existing analytics_events shape the dashboard already reads', () => {
    const rows = buildAnalyticsRows(batch([
      { name: 'pageview' },
      { name: 'page_duration', props: { duration_ms: 12345 } },
      { name: 'book_opened', props: { book_id: 'odyssey', signed_in: false } },
    ], { attribution: { last_touch: { utm_source: 'newsletter', landing_path: '/library' }, first_touch: null } }), 'UA', null)!
    expect(rows.map(row => row.event_type)).toEqual(['pageview', 'page_duration', 'event'])
    expect(rows[1]).toMatchObject({ duration_ms: 12345, session_id: 'session1234abcd', path: '/reader', user_id: null })
    expect(rows[2].payload).toMatchObject({ type: 'book_opened', device_id: 'device-1234abcd', surface: 'reader', book_id: 'odyssey', signed_in: false })
    expect(rows[2].payload.attribution).toEqual({ last_touch: { utm_source: 'newsletter', landing_path: '/library' } })
    expect(rows[0].payload.device_id).toBe('device-1234abcd')
  })

  it('drops unknown events, short durations and non-primitive props, and caps the batch', () => {
    const rows = buildAnalyticsRows(batch([
      { name: 'evil_event' },
      { name: 'page_duration', props: { duration_ms: 200 } },
      { name: 'book_opened', props: { book_id: { nested: 'x' }, 'Bad Key': 1, note: 'y'.repeat(500) } },
      ...Array.from({ length: 40 }, () => ({ name: 'first_page_turn' })),
    ]), 'UA', userId)!
    expect(rows.length).toBeLessThanOrEqual(EVENTS_MAX_BATCH)
    expect(rows.some(row => row.payload.type === 'evil_event')).toBe(false)
    expect(rows.filter(row => row.event_type === 'page_duration')).toHaveLength(0)
    const opened = rows.find(row => row.payload.type === 'book_opened')!
    expect(opened.payload.book_id).toBeUndefined()
    expect(opened.payload['Bad Key']).toBeUndefined()
    expect(String(opened.payload.note)).toHaveLength(120)
    expect(rows.every(row => row.user_id === userId)).toBe(true)
  })

  it('rejects malformed bodies', () => {
    expect(buildAnalyticsRows(null, 'UA', null)).toBeNull()
    expect(buildAnalyticsRows(batch([]), 'UA', null)).toBeNull()
    expect(buildAnalyticsRows(batch([{ name: 'pageview' }], { deviceId: 'x' }), 'UA', null)).toBeNull()
    expect(buildAnalyticsRows(batch([{ name: 'nope' }]), 'UA', null)).toBeNull()
  })
})

describe('POST /api/events', () => {
  const request = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('https://tinct.app/api/events', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'content-type': 'text/plain;charset=UTF-8', ...headers } })

  it('answers 204 at once and writes in the background, attaching the account when a session is present', async () => {
    const bodies = stubAnalytics()
    const { ctx, pending } = context()
    const verify = vi.fn(async () => ({ id: userId }))
    const response = await handleEvents(request(batch([{ name: 'landing_view' }]), { authorization: 'Bearer t' }), env, ctx, verify, async () => true)
    expect(response.status).toBe(204)
    await Promise.all(pending)
    expect(bodies).toHaveLength(1)
    expect(bodies[0][0]).toMatchObject({ event_type: 'event', user_id: userId })
  })

  it('accepts a beacon sent as text/plain without an account', async () => {
    const bodies = stubAnalytics()
    const { ctx, pending } = context()
    const verify = vi.fn(async () => null)
    const response = await handleEvents(request(batch([{ name: 'pageview' }])), env, ctx, verify, async () => true)
    expect(response.status).toBe(204)
    await Promise.all(pending)
    expect(verify).not.toHaveBeenCalled()
    expect(bodies[0][0]).toMatchObject({ event_type: 'pageview', user_id: null })
  })

  it('refuses bad input before doing any work, and stays silent when rate limited', async () => {
    const bodies = stubAnalytics()
    const { ctx, pending } = context()
    const verify = vi.fn(async () => null)
    expect((await handleEvents(new Request('https://tinct.app/api/events'), env, ctx, verify, async () => true)).status).toBe(405)
    expect((await handleEvents(request('{nope'), env, ctx, verify, async () => true)).status).toBe(400)
    expect((await handleEvents(request({ hello: 1 }), env, ctx, verify, async () => true)).status).toBe(400)
    expect((await handleEvents(request('x'.repeat(20_000)), env, ctx, verify, async () => true)).status).toBe(413)
    expect((await handleEvents(request(batch([{ name: 'pageview' }])), env, ctx, verify, async () => false)).status).toBe(204)
    await Promise.all(pending)
    expect(bodies).toHaveLength(0)
  })

  it('never fails the beacon when the database is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down') }))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { ctx, pending } = context()
    const response = await handleEvents(request(batch([{ name: 'pageview' }])), env, ctx, async () => null, async () => true)
    expect(response.status).toBe(204)
    await expect(Promise.all(pending)).resolves.toBeDefined()
  })
})

describe('server-side checkout events', () => {
  it('records checkout_started when a checkout session is created', async () => {
    const bodies = stubAnalytics()
    const fetchMock = vi.mocked(fetch)
    const base = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input)
      if (url.includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
      if (url.startsWith('https://api.stripe.com/')) return Response.json({ url: 'https://checkout.stripe.test/s' })
      return base(input, init)
    })
    const { ctx, pending } = context()
    const response = await handleCreateCheckout(
      new Request('https://tinct.app/api/create-checkout', { method: 'POST', body: JSON.stringify({ type: 'subscription' }), headers: { 'content-type': 'application/json' } }),
      { ...env, STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_PREMIUM: 'price_1' }, async () => ({ id: userId, email: 'r@example.com' }), ctx,
    )
    expect(response.status).toBe(200)
    await Promise.all(pending)
    expect(bodies[0][0]).toMatchObject({ event_type: 'event', user_id: userId, payload: expect.objectContaining({ type: 'checkout_started', surface: 'server' }) })
  })

  it('recordServerEvent is harmless without a database', () => {
    const { ctx } = context()
    expect(() => recordServerEvent({}, ctx, { name: 'checkout_completed', userId })).not.toThrow()
    expect(() => recordServerEvent(env, undefined, { name: 'checkout_completed', userId: null })).not.toThrow()
  })
})
