interface Env {
  STRIPE_SECRET_KEY?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.STRIPE_SECRET_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
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
  const user = await userRes.json() as { id: string }

  // Get stripe_customer_id from profile
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
  const customerId = profiles?.[0]?.stripe_customer_id

  if (!customerId) {
    return Response.json({ error: 'No subscription found' }, { status: 404 })
  }

  const origin = request.headers.get('origin') || 'https://tinct.app'

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
    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 400 })
    }
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({
      error: 'Portal creation failed',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
