import { describe, expect, it } from 'vitest'
import {
  handleBalance,
  handleCancelSubscription,
  handleCreateCheckout,
  handleCreatePortal,
  handleSubscriptionInfo,
  handleWebhook,
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
