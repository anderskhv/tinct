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
  RATE_LIMIT?: KVNamespace
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

// ===== Security Constants =====

const ALLOWED_ORIGINS = ['https://tinct.app', 'https://tinct.ahvelplund.workers.dev']
const CHAT_MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS_CAP = 2048
const MAX_REQUEST_BODY_BYTES = 100_000 // 100KB
const MAX_SYSTEM_PROMPT_LENGTH = 4000
const MAX_MESSAGES = 50
const WEBHOOK_TOLERANCE_SECONDS = 300 // 5 minutes

// ===== Rate Limiting (KV-backed, persistent across cold starts) =====

const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX = 10
const MONTHLY_MESSAGE_LIMIT = 100

async function checkRateLimit(key: string, kv?: KVNamespace): Promise<boolean> {
  if (!kv) return true // Graceful degradation if KV not configured

  try {
    const kvKey = `rl:${key}`
    const entry = await kv.get<{ count: number; resetAt: number }>(kvKey, 'json')
    const now = Date.now()

    if (!entry || now > entry.resetAt) {
      await kv.put(kvKey, JSON.stringify({ count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 }), {
        expirationTtl: RATE_LIMIT_WINDOW_SECONDS * 2,
      })
      return true
    }

    if (entry.count >= RATE_LIMIT_MAX) return false

    await kv.put(kvKey, JSON.stringify({ count: entry.count + 1, resetAt: entry.resetAt }), {
      expirationTtl: Math.max(1, Math.ceil((entry.resetAt - now) / 1000) + 1),
    })
    return true
  } catch {
    return true // If KV fails, allow the request (fail open — quota check is the real guard)
  }
}

// ===== CORS =====

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function handleOptions(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}

function jsonResponse(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: corsHeaders(request) })
}

// ===== Origin Validation =====

function getAllowedOrigin(request: Request): string {
  const origin = request.headers.get('origin') || ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

// ===== Constant-Time String Comparison =====

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ===== UUID Validation =====

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidUUID(s: string): boolean {
  return UUID_RE.test(s)
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
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  // Rate limit by IP (KV-backed, persistent across cold starts)
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(clientIP, env.RATE_LIMIT)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  // Request size check
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse({ error: 'Request too large' }, 413, request)
  }

  // Authentication required
  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const userId = user.id

  // Check message quota
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
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
        return jsonResponse({ error: 'No messages remaining. Buy a chat pack to continue.' }, 402, request)
      }
    }
  }

  try {
    const body = await request.json() as {
      max_tokens?: number; system?: string; messages?: unknown[]
    }

    // Validate input
    const system = typeof body.system === 'string' ? body.system.slice(0, MAX_SYSTEM_PROMPT_LENGTH) : ''
    const messages = Array.isArray(body.messages) ? body.messages.slice(0, MAX_MESSAGES) : []
    const maxTokens = Math.min(Math.max(1, body.max_tokens || 1024), MAX_TOKENS_CAP)

    // Validate message structure
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) return jsonResponse({ error: 'Invalid message format' }, 400, request)
      const m = msg as Record<string, unknown>
      if (m.role !== 'user' && m.role !== 'assistant') return jsonResponse({ error: 'Invalid message role' }, 400, request)
      if (typeof m.content !== 'string') return jsonResponse({ error: 'Invalid message content' }, 400, request)
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    })

    const data = await response.json()

    // Deduct message on success
    if (response.ok && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabaseRpc(env, 'use_message', { p_user_id: userId })
    }

    return jsonResponse(data, response.status, request)
  } catch {
    return jsonResponse({ error: 'Chat request failed' }, 500, request)
  }
}

// ===== API: Balance =====

async function handleBalance(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ token_balance_cents: 200, total_tokens_used: 0 }, 200, request)

  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=token_balance_cents,total_tokens_used,messages_used_this_period,message_balance`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  return jsonResponse(profiles?.[0] || { token_balance_cents: 0, total_tokens_used: 0, messages_used_this_period: 0, message_balance: 0 }, 200, request)
}

// ===== API: Create Checkout =====

async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

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
  const origin = getAllowedOrigin(request)

  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)

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
    const stripeData = await stripeRes.json() as Record<string, unknown>
    if (!stripeRes.ok || stripeData.error) {
      return jsonResponse({ error: 'Payment processing failed' }, 400, request)
    }
    const checkoutUrl = (stripeData as { url: string }).url
    if (!checkoutUrl) return jsonResponse({ error: 'Payment processing failed' }, 500, request)
    return jsonResponse({ url: checkoutUrl }, 200, request)
  } catch {
    return jsonResponse({ error: 'Payment processing failed' }, 500, request)
  }
}

// ===== API: Webhook =====

async function handleWebhook(request: Request, env: Env): Promise<Response> {
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

  // Reject stale webhooks (replay protection)
  const webhookAge = Math.abs(Math.floor(Date.now() / 1000) - parseInt(parts.timestamp, 10))
  if (isNaN(webhookAge) || webhookAge > WEBHOOK_TOLERANCE_SECONDS) {
    return Response.json({ error: 'Webhook too old' }, { status: 400 })
  }

  // Constant-time signature comparison
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
        if (messageCount > 0 && messageCount <= 1000) await supabaseRpc(env, 'credit_messages', { p_user_id: userId, p_count: messageCount })
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
        updates.subscription_period_end = new Date(obj.current_period_end * 1000).toISOString()
        updates.messages_used_this_period = 0
        updates.period_start = new Date().toISOString()
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

// ===== API: Customer Portal =====

async function handleCreatePortal(request: Request, env: Env): Promise<Response> {
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

// ===== API: Cancel Subscription =====

async function handleCancelSubscription(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  // Get stripe_customer_id
  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const customerId = profiles?.[0]?.stripe_customer_id
  if (!customerId) return jsonResponse({ error: 'No subscription found' }, 404, request)

  try {
    // List active subscriptions for this customer
    const listRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Basic ${btoa(env.STRIPE_SECRET_KEY + ':')}` },
    })
    const listData = await listRes.json() as { data: { id: string }[] }
    const subscriptionId = listData.data?.[0]?.id
    if (!subscriptionId) return jsonResponse({ error: 'No active subscription' }, 404, request)

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
    if (sub.error) return jsonResponse({ error: 'Cancellation failed' }, 400, request)

    // Update profile
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

// ===== API: Subscription Info =====

async function handleSubscriptionInfo(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=subscription_status,subscription_period_end,stripe_customer_id,messages_used_this_period,message_balance,period_start`)
  const profiles = await profileRes.json() as Record<string, unknown>[]
  const profile = profiles?.[0]
  if (!profile) return jsonResponse({ error: 'Profile not found' }, 404, request)

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

  return jsonResponse({
    subscription_status: profile.subscription_status,
    subscription_period_end: profile.subscription_period_end,
    messages_used_this_period: profile.messages_used_this_period,
    message_balance: profile.message_balance,
    period_start: profile.period_start,
    stripe: stripeSubscription,
  }, 200, request)
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

// ===== Security Headers =====

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self' https://yazjyiqsxjystvpkyouk.supabase.co https://pub-c34df89c93284423a39b03537595c2e2.r2.dev https://api.stripe.com; img-src 'self' data:; frame-src https://js.stripe.com",
}

// ===== Router =====

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS preflight for all /api/ routes
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return handleOptions(request)
    }

    switch (url.pathname) {
      case '/api/chat': return handleChat(request, env)
      case '/api/balance': return handleBalance(request, env)
      case '/api/create-checkout': return handleCreateCheckout(request, env)
      case '/api/webhook': return handleWebhook(request, env)
      case '/api/create-portal': return handleCreatePortal(request, env)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env)
    }

    // Fall through to static assets, add security headers to HTML responses
    const response = await env.ASSETS.fetch(request)
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      const newResponse = new Response(response.body, response)
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        newResponse.headers.set(key, value)
      }
      return newResponse
    }
    return response
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(env))
  },
}
