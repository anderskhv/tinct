/**
 * Cloudflare Worker entry point.
 * Handles /api/* routes and falls through to static assets for everything else.
 */

interface Env {
  ANTHROPIC_API_KEY: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  STRIPE_PRICE_CHAT_100?: string
  STRIPE_PRICE_CHAT_200?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  BREVO_API_KEY?: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

// ===== Rate Limiting =====

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MONTHLY_MESSAGE_LIMIT = 100

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// ===== Supabase Helpers =====

async function supabaseGet(env: Env, path: string) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  })
}

async function supabaseRpc(env: Env, fn: string, params: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: JSON.stringify(params),
  })
}

async function supabaseUpdate(env: Env, table: string, id: string, data: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

async function supabaseInsert(env: Env, table: string, data: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

async function verifyUser(env: Env, request: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ') || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  const token = authHeader.slice(7)
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY },
  })
  if (!res.ok) return null
  return res.json() as Promise<{ id: string; email: string }>
}

// ===== HMAC for Stripe Webhooks =====

async function computeHmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ===== API: Chat =====

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 })

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!checkRateLimit(clientIP)) {
    return Response.json({ error: 'Rate limit exceeded. Max 10 requests/minute.' }, { status: 429 })
  }

  // Check auth and message quota
  let userId: string | null = null
  const user = await verifyUser(env, request)

  if (user && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    userId = user.id
    const profileRes = await supabaseGet(env, `profiles?id=eq.${userId}&select=messages_used_this_period,message_balance,subscription_status,subscription_period_end`)
    const profiles = await profileRes.json() as {
      messages_used_this_period: number
      message_balance: number
      subscription_status: string | null
      subscription_period_end: string | null
    }[]
    const profile = profiles?.[0]

    if (profile) {
      const isSubscribed = profile.subscription_status === 'active' ||
        (profile.subscription_status === 'canceled' &&
         !!profile.subscription_period_end &&
         new Date(profile.subscription_period_end) > new Date())
      const monthlyRemaining = Math.max(0, MONTHLY_MESSAGE_LIMIT - (profile.messages_used_this_period || 0))
      const hasMessages = (isSubscribed && monthlyRemaining > 0) || (profile.message_balance || 0) > 0

      if (!hasMessages) {
        return Response.json({ error: 'No messages remaining. Buy a chat pack to continue.' }, { status: 402 })
      }
    }
  }

  try {
    const body = await request.json() as {
      model?: string; max_tokens?: number; system?: string; messages?: unknown[]
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 1024,
        system: body.system || '',
        messages: body.messages || [],
      }),
    })

    const data = await response.json()

    // Deduct message on success
    if (response.ok && userId && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabaseRpc(env, 'use_message', { p_user_id: userId })
    }

    return Response.json(data, { status: response.status })
  } catch (err) {
    return Response.json({
      error: 'Proxy error',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}

// ===== API: Balance =====

async function handleBalance(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const user = await verifyUser(env, request)
  if (!user) return Response.json({ token_balance_cents: 200, total_tokens_used: 0 })

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=token_balance_cents,total_tokens_used,messages_used_this_period,message_balance`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  return Response.json(profiles?.[0] || { token_balance_cents: 0, total_tokens_used: 0, messages_used_this_period: 0, message_balance: 0 })
}

// ===== API: Create Checkout =====

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 500 })

  const user = await verifyUser(env, request)
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  // Get or create Stripe customer
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
    const customer = await customerRes.json() as { id: string }
    customerId = customer.id
    await supabaseUpdate(env, 'profiles', user.id, { stripe_customer_id: customerId })
  }

  const body = await request.json() as { type: string }
  const origin = request.headers.get('origin') || 'https://tinct.app'

  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)

    if (body.type === 'subscription') {
      if (!env.STRIPE_PRICE_PREMIUM) return Response.json({ error: 'Price not configured' }, { status: 500 })
      params.set('mode', 'subscription')
      params.set('line_items[0][price]', env.STRIPE_PRICE_PREMIUM)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'subscription')
      params.set('subscription_data[metadata][supabase_user_id]', user.id)
    } else if (body.type === 'chat_pack_100') {
      if (!env.STRIPE_PRICE_CHAT_100) return Response.json({ error: 'Price not configured' }, { status: 500 })
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_100)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '100')
      params.set('metadata[amount_cents]', '300')
    } else if (body.type === 'chat_pack_200') {
      if (!env.STRIPE_PRICE_CHAT_200) return Response.json({ error: 'Price not configured' }, { status: 500 })
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
    const stripeData = await stripeRes.json() as Record<string, unknown>
    if (!stripeRes.ok || stripeData.error) {
      return Response.json({ error: 'Stripe error', details: stripeData }, { status: 400 })
    }
    const checkoutUrl = (stripeData as { url: string }).url
    if (!checkoutUrl) return Response.json({ error: 'No checkout URL returned', details: stripeData }, { status: 500 })
    return Response.json({ url: checkoutUrl })
  } catch (err) {
    return Response.json({ error: 'Checkout creation failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// ===== API: Webhook =====

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
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

  const expectedSig = await computeHmac(env.STRIPE_WEBHOOK_SECRET, `${parts.timestamp}.${rawBody}`)
  if (!parts.signatures.some(sig => sig === expectedSig)) {
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
      if (!userId) break

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
        if (messageCount > 0) await supabaseRpc(env, 'credit_messages', { p_user_id: userId, p_count: messageCount })
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
      if (!userId) break
      const updates: Record<string, unknown> = { subscription_status: obj.status === 'active' ? 'active' : obj.status }
      if (obj.current_period_end) {
        updates.subscription_period_end = new Date(obj.current_period_end * 1000).toISOString()
        updates.messages_used_this_period = 0
        updates.period_start = new Date().toISOString()
      }
      await supabaseUpdate(env, 'profiles', userId, updates)
      break
    }

    case 'customer.subscription.deleted': {
      const userId = obj.metadata?.supabase_user_id
      if (userId) await supabaseUpdate(env, 'profiles', userId, { subscription_status: 'canceled' })
      break
    }

    case 'invoice.payment_failed': {
      const userId = obj.metadata?.supabase_user_id
      if (userId) await supabaseUpdate(env, 'profiles', userId, { subscription_status: 'past_due' })
      break
    }
  }

  return Response.json({ received: true })
}

// ===== API: Customer Portal =====

async function handleCreatePortal(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 500 })

  const user = await verifyUser(env, request)
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const customerId = profiles?.[0]?.stripe_customer_id
  if (!customerId) return Response.json({ error: 'No subscription found' }, { status: 404 })

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
    if (session.error) return Response.json({ error: session.error.message }, { status: 400 })
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: 'Portal creation failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// ===== API: Cancel Subscription =====

async function handleCancelSubscription(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 500 })

  const user = await verifyUser(env, request)
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  // Get stripe_customer_id
  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const customerId = profiles?.[0]?.stripe_customer_id
  if (!customerId) return Response.json({ error: 'No subscription found' }, { status: 404 })

  try {
    // List active subscriptions for this customer
    const listRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
    })
    const listData = await listRes.json() as { data: { id: string }[] }
    const subscriptionId = listData.data?.[0]?.id
    if (!subscriptionId) return Response.json({ error: 'No active subscription' }, { status: 404 })

    // Cancel at period end (not immediately)
    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'cancel_at_period_end=true',
    })
    const sub = await cancelRes.json() as { id: string; cancel_at_period_end: boolean; current_period_end: number; error?: { message: string } }
    if (sub.error) return Response.json({ error: sub.error.message }, { status: 400 })

    // Update profile
    await supabaseUpdate(env, 'profiles', user.id, {
      subscription_status: 'canceled',
      subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    })

    return Response.json({
      canceled: true,
      access_until: new Date(sub.current_period_end * 1000).toISOString(),
    })
  } catch (err) {
    return Response.json({ error: 'Cancellation failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// ===== API: Subscription Info =====

async function handleSubscriptionInfo(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 })

  const user = await verifyUser(env, request)
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=subscription_status,subscription_period_end,stripe_customer_id,messages_used_this_period,message_balance,period_start`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  const profile = profiles?.[0]
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  // If subscribed, fetch live subscription details from Stripe
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
      // Non-critical — return profile data without Stripe details
    }
  }

  return Response.json({
    subscription_status: profile.subscription_status,
    subscription_period_end: profile.subscription_period_end,
    messages_used_this_period: profile.messages_used_this_period,
    message_balance: profile.message_balance,
    period_start: profile.period_start,
    stripe: stripeSubscription,
  })
}

// ===== Email: Send via Brevo =====

async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<boolean> {
  if (!env.BREVO_API_KEY) return false
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Tinct', email: 'contact@tinct.app' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

function trialReminderEmail(daysLeft: number): { subject: string; html: string } {
  return {
    subject: `Your Tinct trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2a2a2a;">
        <h2 style="font-weight: 400;">Your free trial is ending soon</h2>
        <p>You have <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> left of Premium on Tinct.</p>
        <p>To keep AI chat, audiobook, Cast, and all Premium features, subscribe for <strong>$5/month</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="https://tinct.app?action=subscribe" style="background: #b8960c; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 16px;">Subscribe — $5/month</a>
        </p>
        <p style="color: #777; font-size: 14px;">Reading is always free. All books, editions, highlights, and notes stay yours regardless. Premium just adds AI chat, audiobook, and Cast.</p>
        <p style="color: #777; font-size: 14px;">Can't afford it? Just reply to this email — we'll work something out.</p>
        <p style="color: #aaa; font-size: 12px; margin-top: 32px;">— Tinct, a new way to read<br>
        <a href="https://tinct.app" style="color: #aaa;">tinct.app</a></p>
      </div>
    `,
  }
}

// ===== Cron: Trial Expiry Reminders =====

async function handleScheduled(env: Env): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.BREVO_API_KEY) return

  // Find users whose trial ends in exactly 3 days:
  // - Account created 27 days ago (trial = 30 days)
  // - No active subscription
  // - Not already canceled (they chose to leave)
  const now = new Date()
  const targetCreatedBefore = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000)
  const targetCreatedAfter = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)

  // Query auth.users joined with profiles
  // Using the profiles table which has created_at from the user
  const query = `profiles?select=id,email,subscription_status&subscription_status=is.null&or=(subscription_status.is.null,subscription_status.eq.)&created_at=gte.${targetCreatedAfter.toISOString()}&created_at=lt.${targetCreatedBefore.toISOString()}`

  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })
    const users = await res.json() as { id: string; email: string; subscription_status: string | null }[]

    if (!Array.isArray(users)) return

    for (const user of users) {
      if (!user.email) continue
      const { subject, html } = trialReminderEmail(3)
      await sendEmail(env, user.email, subject, html)
    }
  } catch {
    // Cron failures are silent — logged by Cloudflare
  }
}

// ===== Router =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    switch (url.pathname) {
      case '/api/chat': return handleChat(request, env)
      case '/api/balance': return handleBalance(request, env)
      case '/api/create-checkout': return handleCreateCheckout(request, env)
      case '/api/webhook': return handleWebhook(request, env)
      case '/api/create-portal': return handleCreatePortal(request, env)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env)
    }

    // Fall through to static assets
    return env.ASSETS.fetch(request)
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(env))
  },
}
