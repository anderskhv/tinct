import { getAllowedOrigin, jsonResponse } from '../lib/responses'
import { isValidUUID, timingSafeEqual } from '../lib/security'
import { supabaseGet, supabaseInsert, supabaseRpc, supabaseUpdate, type SupabaseEnv } from '../lib/supabase'

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: BillingEnv, request: Request) => Promise<VerifiedUser | null>

export type BillingEnv = SupabaseEnv & {
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
}

const WEBHOOK_TOLERANCE_SECONDS = 300 // 5 minutes

async function computeHmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function handleBalance(request: Request, env: BillingEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ token_balance_cents: 200, total_tokens_used: 0 }, 200, request)

  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=token_balance_cents,total_tokens_used,messages_used_this_period,message_balance`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  return jsonResponse(profiles?.[0] || { token_balance_cents: 0, total_tokens_used: 0, messages_used_this_period: 0, message_balance: 0 }, 200, request)
}

export async function handleCreateCheckout(request: Request, env: BillingEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  let customerId = profiles?.[0]?.stripe_customer_id || null

  if (!customerId) {
    const params = new URLSearchParams()
    params.set('email', user.email)
    params.set('metadata[supabase_user_id]', user.id)
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const customerData = await customerRes.json() as { id?: string; error?: { message: string } }
    if (!customerRes.ok || !customerData.id) {
      console.error('[Stripe] Customer creation failed:', customerData.error?.message)
      return jsonResponse({ error: `Payment setup failed: ${customerData.error?.message || 'Could not create customer'}` }, 500, request)
    }
    customerId = customerData.id
    await supabaseUpdate(env, 'profiles', user.id, { stripe_customer_id: customerId })
  }

  const body = await request.json() as {
    type: string
    attribution?: {
      first_touch?: Record<string, unknown> | null
      last_touch?: Record<string, unknown> | null
    }
  }
  const origin = getAllowedOrigin(request)

  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)

    const lastTouch = body.attribution?.last_touch || body.attribution?.first_touch || null
    if (lastTouch) {
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid', 'ttclid', 'rdt_cid', 'landing_path', 'landing_referrer']) {
        const value = lastTouch[key]
        if (typeof value === 'string' && value) {
          params.set(`metadata[attr_${key}]`, value.slice(0, 500))
        }
      }
    }

    if (body.type === 'subscription') {
      if (!env.STRIPE_PRICE_PREMIUM) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'subscription')
      params.set('line_items[0][price]', env.STRIPE_PRICE_PREMIUM)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'subscription')
      params.set('subscription_data[metadata][supabase_user_id]', user.id)
    } else if (body.type === 'chat_pack_100') {
      if (!env.STRIPE_PRICE_CHAT_100) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_100)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '100')
      params.set('metadata[amount_cents]', '300')
    } else if (body.type === 'chat_pack_200') {
      if (!env.STRIPE_PRICE_CHAT_200) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_200)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '200')
      params.set('metadata[amount_cents]', '500')
    } else {
      return jsonResponse({ error: 'Invalid checkout type' }, 400, request)
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const stripeData = await stripeRes.json() as { url?: string; error?: { message: string } }
    if (!stripeRes.ok || stripeData.error) {
      console.error('[Stripe] Session creation failed:', stripeData.error?.message)
      return jsonResponse({ error: `Payment processing failed: ${stripeData.error?.message || 'Unknown Stripe error'}` }, 400, request)
    }
    const checkoutUrl = stripeData.url
    if (!checkoutUrl) return jsonResponse({ error: 'Payment processing failed' }, 500, request)
    return jsonResponse({ url: checkoutUrl }, 200, request)
  } catch {
    return jsonResponse({ error: 'Payment processing failed' }, 500, request)
  }
}

export async function handleWebhook(request: Request, env: BillingEnv): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Service unavailable' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature') || ''
  const rawBody = await request.text()

  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    if (key === 't') acc.timestamp = value
    if (key === 'v1') acc.signatures.push(value)
    return acc
  }, { timestamp: '', signatures: [] as string[] })

  if (!parts.timestamp || parts.signatures.length === 0) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const webhookAge = Math.abs(Math.floor(Date.now() / 1000) - parseInt(parts.timestamp, 10))
  if (isNaN(webhookAge) || webhookAge > WEBHOOK_TOLERANCE_SECONDS) {
    return Response.json({ error: 'Webhook too old' }, { status: 400 })
  }

  const expectedSig = await computeHmac(env.STRIPE_WEBHOOK_SECRET, `${parts.timestamp}.${rawBody}`)
  if (!parts.signatures.some(sig => timingSafeEqual(sig, expectedSig))) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as {
    type: string
    data: { object: { id: string; metadata?: Record<string, string>; customer?: string; subscription?: string; current_period_end?: number; status?: string } }
  }
  const obj = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const type = obj.metadata?.type
      const userId = obj.metadata?.supabase_user_id
      if (!userId || !isValidUUID(userId)) break

      if (type === 'subscription') {
        await supabaseUpdate(env, 'profiles', userId, {
          subscription_status: 'active',
          stripe_customer_id: obj.customer,
          messages_used_this_period: 0,
          period_start: new Date().toISOString(),
        })
        if (obj.subscription && env.STRIPE_SECRET_KEY) {
          const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${obj.subscription}`, {
            headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
          })
          const sub = await subRes.json() as { current_period_end?: number }
          if (sub.current_period_end) {
            await supabaseUpdate(env, 'profiles', userId, {
              subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
          }
        }
      } else if (type === 'chat_pack') {
        const messageCount = parseInt(obj.metadata?.message_count || '0', 10)
        if (messageCount <= 0 || messageCount > 1000) break
        const paymentRes = await supabaseInsert(env, 'payments', {
          user_id: userId, stripe_session_id: obj.id,
          amount_cents: parseInt(obj.metadata?.amount_cents || '0', 10),
          type: type || 'unknown', status: 'completed',
        })
        if (paymentRes.status === 409) break
        if (!paymentRes.ok) return new Response('Payment insert failed', { status: 500 })
        await supabaseRpc(env, 'credit_messages', { p_user_id: userId, p_count: messageCount })
        break
      }

      await supabaseInsert(env, 'payments', {
        user_id: userId, stripe_session_id: obj.id,
        amount_cents: parseInt(obj.metadata?.amount_cents || '0', 10),
        type: type || 'unknown', status: 'completed',
      })
      break
    }

    case 'customer.subscription.updated': {
      const userId = obj.metadata?.supabase_user_id
      if (!userId || !isValidUUID(userId)) break
      const updates: Record<string, unknown> = { subscription_status: obj.status === 'active' ? 'active' : obj.status }
      if (obj.current_period_end) {
        const newPeriodEnd = new Date(obj.current_period_end * 1000)
        updates.subscription_period_end = newPeriodEnd.toISOString()
        const prev = await supabaseGet(env, `profiles?id=eq.${userId}&select=subscription_period_end`)
        const prevRows = await prev.json() as Array<{ subscription_period_end: string | null }> | null
        const prevPeriodEnd = prevRows?.[0]?.subscription_period_end
        const periodAdvanced = !prevPeriodEnd || new Date(prevPeriodEnd).getTime() < newPeriodEnd.getTime()
        if (periodAdvanced) {
          updates.messages_used_this_period = 0
          updates.period_start = new Date().toISOString()
        }
      }
      await supabaseUpdate(env, 'profiles', userId, updates)
      break
    }

    case 'customer.subscription.deleted': {
      const userId = obj.metadata?.supabase_user_id
      if (userId && isValidUUID(userId)) await supabaseUpdate(env, 'profiles', userId, { subscription_status: 'canceled' })
      break
    }

    case 'invoice.payment_failed': {
      const userId = obj.metadata?.supabase_user_id
      if (userId && isValidUUID(userId)) await supabaseUpdate(env, 'profiles', userId, { subscription_status: 'past_due' })
      break
    }
  }

  return Response.json({ received: true })
}

export async function handleCreatePortal(request: Request, env: BillingEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const customerId = profiles?.[0]?.stripe_customer_id
  if (!customerId) return jsonResponse({ error: 'No subscription found' }, 404, request)

  const origin = getAllowedOrigin(request)
  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('return_url', origin)
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const session = await portalRes.json() as { url: string; error?: { message: string } }
    if (session.error) return jsonResponse({ error: 'Billing portal unavailable' }, 400, request)
    return jsonResponse({ url: session.url }, 200, request)
  } catch {
    return jsonResponse({ error: 'Billing portal unavailable' }, 500, request)
  }
}

export async function handleCancelSubscription(request: Request, env: BillingEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const customerId = profiles?.[0]?.stripe_customer_id
  if (!customerId) return jsonResponse({ error: 'No subscription found' }, 404, request)

  try {
    const listRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
    })
    const listData = await listRes.json() as { data: { id: string }[] }
    const subscriptionId = listData.data?.[0]?.id
    if (!subscriptionId) return jsonResponse({ error: 'No active subscription' }, 404, request)

    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'cancel_at_period_end=true',
    })
    const sub = await cancelRes.json() as { id: string; cancel_at_period_end: boolean; current_period_end: number; error?: { message: string } }
    if (sub.error) return jsonResponse({ error: 'Cancellation failed' }, 400, request)

    await supabaseUpdate(env, 'profiles', user.id, {
      subscription_status: 'canceled',
      subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    })

    return jsonResponse({
      canceled: true,
      access_until: new Date(sub.current_period_end * 1000).toISOString(),
    }, 200, request)
  } catch {
    return jsonResponse({ error: 'Cancellation failed' }, 500, request)
  }
}

export async function handleSubscriptionInfo(request: Request, env: BillingEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=subscription_status,subscription_period_end,stripe_customer_id,messages_used_this_period,message_balance,period_start`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  const profile = profiles?.[0]
  if (!profile) return jsonResponse({ error: 'Profile not found' }, 404, request)

  let stripeSubscription: Record<string, unknown> | null = null
  if (profile.stripe_customer_id && env.STRIPE_SECRET_KEY) {
    try {
      const listRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${profile.stripe_customer_id}&limit=1`, {
        headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
      })
      const listData = await listRes.json() as { data: { id: string; status: string; current_period_end: number; cancel_at_period_end: boolean }[] }
      if (listData.data?.[0]) {
        const sub = listData.data[0]
        stripeSubscription = {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        }
      }
    } catch {
      // Non-critical: return profile data without live Stripe details.
    }
  }

  return jsonResponse({
    subscription_status: profile.subscription_status,
    subscription_period_end: profile.subscription_period_end,
    messages_used_this_period: profile.messages_used_this_period,
    message_balance: profile.message_balance,
    period_start: profile.period_start,
    stripe: stripeSubscription,
  }, 200, request)
}
