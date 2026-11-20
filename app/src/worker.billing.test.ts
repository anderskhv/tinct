import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  availablePremiumIntervals,
  CHECKOUT_TERMS_MESSAGE,
  handleBalance,
  handleCancelSubscription,
  handleCreateCheckout,
  handleCreatePortal,
  handleSubscriptionInfo,
  handleWebhook,
  logCheckoutRefusal,
  premiumPriceFor,
} from './worker/routes/billing'

const stripeEnv = {
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
}

describe('billing routes', () => {
  it('returns the anonymous starter balance', async () => {
    const response = await handleBalance(
      new Request('https://tinct.app/api/balance'),
      {},
      async () => null,
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ token_balance_cents: 200, total_tokens_used: 0 })
  })

  it('rejects non-GET balance requests', async () => {
    const response = await handleBalance(
      new Request('https://tinct.app/api/balance', { method: 'POST' }),
      {},
      async () => null,
    )

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('requires Stripe configuration before checkout auth work', async () => {
    let verifyCalls = 0
    const response = await handleCreateCheckout(
      new Request('https://tinct.app/api/create-checkout', { method: 'POST' }),
      {},
      async () => {
        verifyCalls += 1
        return null
      },
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Service unavailable' })
    expect(verifyCalls).toBe(0)
  })

  it('requires auth for checkout, portal, cancellation, and subscription info', async () => {
    const verifyUser = async () => null
    const [checkout, portal, cancellation, subscription] = await Promise.all([
      handleCreateCheckout(new Request('https://tinct.app/api/create-checkout', { method: 'POST' }), stripeEnv, verifyUser),
      handleCreatePortal(new Request('https://tinct.app/api/create-portal', { method: 'POST' }), stripeEnv, verifyUser),
      handleCancelSubscription(new Request('https://tinct.app/api/cancel-subscription', { method: 'POST' }), stripeEnv, verifyUser),
      handleSubscriptionInfo(new Request('https://tinct.app/api/subscription-info'), stripeEnv, verifyUser),
    ])

    expect(checkout.status).toBe(401)
    expect(portal.status).toBe(401)
    expect(cancellation.status).toBe(401)
    expect(subscription.status).toBe(401)
  })

  describe('Stripe Tax at checkout', () => {
    afterEach(() => vi.unstubAllGlobals())
    const checkoutParams = async (env: Record<string, string>) => {
      let sent = new URLSearchParams()
      vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
        if (url === 'https://api.stripe.com/v1/checkout/sessions') { sent = new URLSearchParams(String(init?.body)); return Response.json({ url: 'https://checkout.stripe.com/x' }) }
        return Response.json({})
      }))
      const response = await handleCreateCheckout(
        new Request('https://tinct.app/api/create-checkout', { method: 'POST', body: JSON.stringify({ type: 'subscription' }), headers: { 'content-type': 'application/json' } }),
        { ...stripeEnv, STRIPE_PRICE_PREMIUM: 'price_5', ...env },
        async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' }),
      )
      expect(response.status).toBe(200)
      return sent
    }

    it('stays off until it is switched on', async () => {
      const sent = await checkoutParams({})
      expect(sent.get('line_items[0][price]')).toBe('price_5')
      expect(sent.has('automatic_tax[enabled]')).toBe(false)
    })

    it('asks Stripe to work out the tax when switched on', async () => {
      const sent = await checkoutParams({ STRIPE_AUTOMATIC_TAX: 'on' })
      expect(sent.get('automatic_tax[enabled]')).toBe('true')
      expect(sent.get('customer_update[address]')).toBe('auto')
    })
  })

  describe('terms consent at checkout (EU right of withdrawal)', () => {
    afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })
    const reader = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' })
    const env = {
      ...stripeEnv,
      STRIPE_PRICE_PREMIUM: 'price_month', STRIPE_PRICE_PREMIUM_YEARLY: 'price_year',
      STRIPE_PRICE_CHAT_100: 'price_3', STRIPE_PRICE_CHAT_200: 'price_5', STRIPE_PRICE_TOP_UP_10: 'price_10',
    }
    const checkout = async (body: unknown, allowanceOn: boolean, stripeReply = () => Response.json({ url: 'https://checkout.stripe.com/x' })) => {
      const sent: URLSearchParams[] = []
      vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
        if (url === 'https://api.stripe.com/v1/checkout/sessions') { sent.push(new URLSearchParams(String(init?.body))); return stripeReply() }
        return Response.json({})
      }))
      const response = await handleCreateCheckout(
        new Request('https://tinct.app/api/create-checkout', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
        env, reader, undefined, allowanceOn,
      )
      return { response, sent }
    }

    it('keeps the line short, linked to the terms, and within Stripe\'s 1200 characters', () => {
      expect(CHECKOUT_TERMS_MESSAGE).toBe('I agree to the [Terms](https://tinct.app/terms). Tinct starts right away, so I lose the 14-day right to cancel for what I have already used.')
      expect(CHECKOUT_TERMS_MESSAGE.length).toBeLessThanOrEqual(1200)
    })

    it.each([
      ['monthly Premium', { type: 'subscription' }, false],
      ['yearly Premium', { type: 'subscription', interval: 'year' }, false],
      ['the $3 message pack', { type: 'chat_pack_100' }, false],
      ['the $5 message pack', { type: 'chat_pack_200' }, false],
      ['the $5 AI top-up', { type: 'chat_pack_200' }, true],
      ['the $10 AI top-up', { type: 'top_up_10' }, true],
    ])('requires the terms checkbox and the withdrawal line for %s', async (_kind, body, allowanceOn) => {
      const { response, sent } = await checkout(body, allowanceOn)
      expect(response.status).toBe(200)
      expect(sent).toHaveLength(1)
      expect(sent[0].get('consent_collection[terms_of_service]')).toBe('required')
      expect(sent[0].get('custom_text[terms_of_service_acceptance][message]')).toBe(CHECKOUT_TERMS_MESSAGE)
      expect(String(sent[0])).toContain('consent_collection%5Bterms_of_service%5D=required')
    })

    it('logs a refusal over the terms setup by name, and keeps the consent rather than retrying without it', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
      const refusal = 'You cannot collect consent to your terms of service unless a URL is set in the Stripe Dashboard.'
      const { response, sent } = await checkout({ type: 'subscription' }, false, () => Response.json({ error: { message: refusal } }, { status: 400 }))
      expect(response.status).toBe(400)
      expect(sent).toHaveLength(1)
      expect(errors).toHaveBeenCalledWith(expect.stringContaining('terms consent'), refusal)
    })

    it('logs any other refusal as a plain failure', () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
      logCheckoutRefusal('subscription', 'No such price')
      expect(errors).toHaveBeenCalledWith(expect.stringContaining('creation failed'), 'No such price')
    })
  })

  describe('Premium interval: monthly or yearly', () => {
    afterEach(() => vi.unstubAllGlobals())
    const reader = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' })
    const prices = { STRIPE_PRICE_PREMIUM: 'price_month', STRIPE_PRICE_PREMIUM_YEARLY: 'price_year' }
    const checkout = async (body: unknown, env: Record<string, string> = prices) => {
      const stripeCalls: URLSearchParams[] = []
      vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/rest/v1/profiles')) return Response.json([{ stripe_customer_id: 'cus_1' }])
        if (url === 'https://api.stripe.com/v1/checkout/sessions') { stripeCalls.push(new URLSearchParams(String(init?.body))); return Response.json({ url: 'https://checkout.stripe.com/x' }) }
        return Response.json({})
      }))
      const response = await handleCreateCheckout(
        new Request('https://tinct.app/api/create-checkout', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
        { ...stripeEnv, ...env },
        reader,
      )
      return { response, sent: stripeCalls[0] ?? null, stripeCalls: stripeCalls.length }
    }

    it('maps each interval to its own Worker secret', () => {
      expect(premiumPriceFor(prices, 'month')).toBe('price_month')
      expect(premiumPriceFor(prices, 'year')).toBe('price_year')
      expect(premiumPriceFor({ STRIPE_PRICE_PREMIUM: 'price_month' }, 'year')).toBeNull()
      expect(availablePremiumIntervals(prices)).toEqual(['month', 'year'])
      expect(availablePremiumIntervals({ STRIPE_PRICE_PREMIUM: 'price_month' })).toEqual(['month'])
      expect(availablePremiumIntervals({})).toEqual([])
    })

    it('charges the monthly price when no interval is named (older pages)', async () => {
      const { response, sent } = await checkout({ type: 'subscription' })
      expect(response.status).toBe(200)
      expect(sent?.get('line_items[0][price]')).toBe('price_month')
      expect(sent?.get('metadata[interval]')).toBe('month')
    })

    it('charges the yearly price for interval "year", as the same Premium subscription', async () => {
      const month = (await checkout({ type: 'subscription', interval: 'month' })).sent!
      const year = (await checkout({ type: 'subscription', interval: 'year' })).sent!
      expect(month.get('line_items[0][price]')).toBe('price_month')
      expect(year.get('line_items[0][price]')).toBe('price_year')
      expect(year.get('mode')).toBe('subscription')
      expect(year.get('metadata[type]')).toBe('subscription')
      expect(year.get('metadata[interval]')).toBe('year')
      expect(year.get('subscription_data[metadata][supabase_user_id]')).toBe('11111111-1111-4111-8111-111111111111')
      expect(year.get('subscription_data[metadata][interval]')).toBe('year')
      // Same trial handling for both: none at Checkout (the 30-day trial runs from account creation).
      expect(year.has('subscription_data[trial_period_days]')).toBe(false)
      expect(month.has('subscription_data[trial_period_days]')).toBe(false)
      // Apart from the price and the interval label, the two Checkout requests are identical.
      const rest = (params: URLSearchParams) => [...params].filter(([key]) => key !== 'line_items[0][price]' && !key.endsWith('[interval]'))
      expect(rest(year)).toEqual(rest(month))
    })

    it('applies the Stripe Tax switch to yearly exactly as to monthly', async () => {
      const taxed = { ...prices, STRIPE_AUTOMATIC_TAX: 'on' }
      for (const interval of ['month', 'year']) {
        const { sent } = await checkout({ type: 'subscription', interval }, taxed)
        expect(sent?.get('automatic_tax[enabled]')).toBe('true')
        expect(sent?.get('customer_update[address]')).toBe('auto')
      }
      const untaxed = (await checkout({ type: 'subscription', interval: 'year' })).sent!
      expect(untaxed.has('automatic_tax[enabled]')).toBe(false)
    })

    it('refuses the yearly plan cleanly when its secret is missing, and monthly still works', async () => {
      const onlyMonthly = { STRIPE_PRICE_PREMIUM: 'price_month' }
      const year = await checkout({ type: 'subscription', interval: 'year' }, onlyMonthly)
      expect(year.response.status).toBe(400)
      expect(await year.response.json()).toEqual({ error: 'The yearly plan is not available' })
      expect(year.stripeCalls).toBe(0)
      const month = await checkout({ type: 'subscription', interval: 'month' }, onlyMonthly)
      expect(month.response.status).toBe(200)
      expect(month.sent?.get('line_items[0][price]')).toBe('price_month')
    })

    it.each([
      [{ type: 'subscription', price: 'price_attacker' }],
      [{ type: 'subscription', priceId: 'price_attacker' }],
      [{ type: 'subscription', interval: 'year', price_id: 'price_attacker' }],
      [{ type: 'subscription', line_items: [{ price: 'price_attacker', quantity: 1 }] }],
      [{ type: 'subscription', interval: 'price_attacker' }],
      [{ type: 'subscription', interval: 'week' }],
      [{ type: 'chat_pack_100', interval: 'year' }],
      [['subscription']],
      ['subscription'],
    ])('rejects a client-supplied price or unknown field: %j', async body => {
      const { response, stripeCalls } = await checkout(body)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Invalid checkout request' })
      expect(stripeCalls).toBe(0)
    })

    it('lists the intervals on sale in subscription info', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ subscription_status: null, stripe_customer_id: null }])))
      const info = async (env: Record<string, string>) => (await handleSubscriptionInfo(new Request('https://tinct.app/api/subscription-info'), { ...stripeEnv, ...env }, reader)).json() as Promise<{ intervals: string[] }>
      expect((await info(prices)).intervals).toEqual(['month', 'year'])
      expect((await info({ STRIPE_PRICE_PREMIUM: 'price_month' })).intervals).toEqual(['month'])
    })
  })

  describe('webhooks for a yearly subscription', () => {
    afterEach(() => vi.unstubAllGlobals())
    const userId = '11111111-1111-4111-8111-111111111111'
    const yearEnd = Math.floor(Date.UTC(2027, 9, 6) / 1000)
    const sign = async (payload: string) => {
      const timestamp = Math.floor(Date.now() / 1000)
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(stripeEnv.STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`))
      return `t=${timestamp},v1=${[...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')}`
    }
    const deliver = async (event: unknown, previousPeriodEnd: string | null = null) => {
      const patches: Record<string, unknown>[] = []
      vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/rest/v1/profiles') && init?.method === 'PATCH') { patches.push(JSON.parse(String(init.body))); return new Response(null, { status: 204 }) }
        if (url.includes('/rest/v1/profiles')) return Response.json([{ subscription_period_end: previousPeriodEnd }])
        if (url.startsWith('https://api.stripe.com/v1/subscriptions/sub_year')) return Response.json({ id: 'sub_year', current_period_end: yearEnd })
        return Response.json({}, { status: 201 })
      }))
      const payload = JSON.stringify(event)
      const response = await handleWebhook(new Request('https://tinct.app/api/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': await sign(payload) } }), stripeEnv)
      return { response, patches }
    }

    it('activates Premium on checkout.session.completed and records the year-long period', async () => {
      const { response, patches } = await deliver({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_1', customer: 'cus_1', subscription: 'sub_year', metadata: { type: 'subscription', interval: 'year', supabase_user_id: userId } } },
      })
      expect(response.status).toBe(200)
      expect(patches[0]).toMatchObject({ subscription_status: 'active', stripe_customer_id: 'cus_1', messages_used_this_period: 0 })
      expect(patches[1]).toEqual({ subscription_period_end: '2027-10-06T00:00:00.000Z' })
    })

    it('handles renewal, cancellation and failed payment as for monthly', async () => {
      const renewed = await deliver({
        type: 'customer.subscription.updated',
        data: { object: { id: 'sub_year', status: 'active', current_period_end: yearEnd, metadata: { supabase_user_id: userId, interval: 'year' } } },
      }, '2026-10-06T00:00:00.000Z')
      expect(renewed.response.status).toBe(200)
      expect(renewed.patches[0]).toMatchObject({ subscription_status: 'active', subscription_period_end: '2027-10-06T00:00:00.000Z', messages_used_this_period: 0 })

      const deleted = await deliver({ type: 'customer.subscription.deleted', data: { object: { id: 'sub_year', metadata: { supabase_user_id: userId, interval: 'year' } } } })
      expect(deleted.patches).toEqual([{ subscription_status: 'canceled' }])

      const failed = await deliver({ type: 'invoice.payment_failed', data: { object: { id: 'in_1', metadata: { supabase_user_id: userId, interval: 'year' } } } })
      expect(failed.patches).toEqual([{ subscription_status: 'past_due' }])
    })
  })

  it('rejects non-POST webhooks', async () => {
    const response = await handleWebhook(new Request('https://tinct.app/api/webhook'), stripeEnv)

    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('rejects webhooks when Stripe/Supabase config is missing', async () => {
    const response = await handleWebhook(
      new Request('https://tinct.app/api/webhook', { method: 'POST' }),
      {},
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Service unavailable' })
  })

  it('rejects webhooks with missing signatures', async () => {
    const response = await handleWebhook(
      new Request('https://tinct.app/api/webhook', { method: 'POST', body: '{}' }),
      stripeEnv,
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid signature' })
  })
})

describe('first month Premium labels', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
  const now = new Date('2026-10-26T12:00:00Z')
  const user = async () => ({ id: '11111111-1111-4111-8111-111111111111', email: 'synthetic@example.com' })
  async function info(profile: Record<string, unknown>, receipt?: object) {
    vi.useFakeTimers(); vi.setSystemTime(now)
    vi.stubGlobal('fetch', vi.fn(async input => Response.json(String(input).includes('user_data?') ? receipt ? [{ value: receipt }] : [] : [profile])))
    return (await handleSubscriptionInfo(new Request('https://tinct.app/api/subscription-info'), { ...stripeEnv, STRIPE_SECRET_KEY: '' }, user)).json()
  }
  it('reports the actual trial as Premium with its expiry, even without a subscription', async () => {
    expect(await info({ created_at: now.toISOString(), subscription_status: null })).toMatchObject({ premium: true, first_month_free_until: '2026-11-25T12:00:00.000Z' })
  })
  it('labels a recorded grant, but cannot create access from the label receipt', async () => {
    const receipt = { startsAt: now.toISOString(), expiresAt: '2026-11-25T12:00:00.000Z' }
    const profile = { created_at: '2026-01-01T00:00:00Z', subscription_status: 'canceled', period_start: receipt.startsAt, subscription_period_end: receipt.expiresAt }
    expect(await info(profile, receipt)).toMatchObject({ premium: true, first_month_free_until: receipt.expiresAt })
    expect(await info(profile)).toMatchObject({ premium: true, first_month_free_until: null })
    expect(await info({ ...profile, subscription_period_end: '2026-10-01T00:00:00Z' }, receipt)).toMatchObject({ first_month_free_until: null })
  })
  it('does not label an active paying account as a free month', async () => {
    expect(await info({ created_at: now.toISOString(), subscription_status: 'active' })).toMatchObject({ premium: true, first_month_free_until: null })
  })
})
