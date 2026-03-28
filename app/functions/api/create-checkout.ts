interface Env {
  STRIPE_SECRET_KEY?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

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

  const body = await request.json() as { amount_cents: number }
  const validAmounts = [500, 1000, 2000]
  if (!validAmounts.includes(body.amount_cents)) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 })
  }

  try {
    // Create Stripe Checkout session via API
    const amountLabels: Record<number, string> = {
      500: '$5 — ~150 messages',
      1000: '$10 — ~300 messages',
      2000: '$20 — ~600 messages',
    }

    const origin = request.headers.get('origin') || 'https://tinct.app'
    const params = new URLSearchParams()
    params.set('payment_method_types[]', 'card')
    params.set('line_items[0][price_data][currency]', 'usd')
    params.set('line_items[0][price_data][product_data][name]', 'Tinct AI Chat Credits')
    params.set('line_items[0][price_data][product_data][description]', amountLabels[body.amount_cents])
    params.set('line_items[0][price_data][unit_amount]', String(body.amount_cents))
    params.set('line_items[0][quantity]', '1')
    params.set('mode', 'payment')
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)
    params.set('metadata[credit_cents]', String(body.amount_cents))

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await stripeRes.json() as { url: string }
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({
      error: 'Checkout creation failed',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
