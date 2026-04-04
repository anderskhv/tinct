interface Env {
  STRIPE_SECRET_KEY?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

type CheckoutType = 'subscription' | 'chat_pack_100' | 'chat_pack_200'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Verify user
  const token = authHeader.slice(7)
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY },
  })
  if (!userRes.ok) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  const user = await userRes.json() as { id: string; email: string }

  const body = await request.json() as { type: CheckoutType }
  const origin = request.headers.get('origin') || 'https://tinct.app'

  // Look up existing stripe_customer_id from profile
  const profileRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  let customerId = profiles?.[0]?.stripe_customer_id || null

  // Create Stripe customer if needed (required for subscriptions, good for all)
  if (!customerId) {
    const customerParams = new URLSearchParams()
    customerParams.set('email', user.email)
    customerParams.set('metadata[supabase_user_id]', user.id)

    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: customerParams.toString(),
    })
    const customer = await customerRes.json() as { id: string }
    customerId = customer.id

    // Save customer ID to profile
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ stripe_customer_id: customerId }),
    })
  }

  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)

    if (body.type === 'subscription') {
      if (!env.STRIPE_PRICE_PREMIUM) {
        return Response.json({ error: 'Subscription price not configured' }, { status: 500 })
      }
      params.set('mode', 'subscription')
      params.set('line_items[0][price]', env.STRIPE_PRICE_PREMIUM)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'subscription')
      params.set('subscription_data[metadata][supabase_user_id]', user.id)
    } else if (body.type === 'chat_pack_100') {
      if (!env.STRIPE_PRICE_CHAT_100) {
        return Response.json({ error: 'Chat pack price not configured' }, { status: 500 })
      }
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_100)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '100')
      params.set('metadata[amount_cents]', '300')
    } else if (body.type === 'chat_pack_200') {
      if (!env.STRIPE_PRICE_CHAT_200) {
        return Response.json({ error: 'Chat pack price not configured' }, { status: 500 })
      }
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_200)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '200')
      params.set('metadata[amount_cents]', '500')
    } else {
      return Response.json({ error: 'Invalid checkout type' }, { status: 400 })
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await stripeRes.json() as { url: string; error?: { message: string } }
    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 400 })
    }
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({
      error: 'Checkout creation failed',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
