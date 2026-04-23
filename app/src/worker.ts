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

const ALLOWED_ORIGINS = ['https://tinct.app', 'https://tinct.ahvelplund.workers.dev', 'capacitor://localhost', 'https://localhost', 'http://localhost']
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

async function checkRateLimit(key: string, kv?: KVNamespace, maxRequests = RATE_LIMIT_MAX): Promise<boolean> {
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

    if (entry.count >= maxRequests) return false

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
  // Allow Capacitor origins (capacitor://, https://localhost, null, or empty)
  const isCapacitorOrigin = !origin || origin === 'null' || origin.startsWith('capacitor://') || origin.startsWith('https://localhost') || origin.startsWith('http://localhost')
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : isCapacitorOrigin ? '*' : ALLOWED_ORIGINS[0]
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
      'Prefer': 'return=representation',
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

// ===== API: Angle Chat (unauthenticated, topic-locked) =====
// Dedicated endpoint for the pre-reading angle conversation in BookOnboarding.
// No auth required so anonymous users can use it. Server controls the system
// prompt so the topic is locked to the book and can't be prompt-injected.
// Rate-limited by IP and capped to a short back-and-forth.

const ANGLE_CHAT_MAX_MESSAGES = 12 // ~6 turns each side
const ANGLE_CHAT_MAX_TOKENS = 400

async function handleAngleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`angle:${clientIP}`, env.RATE_LIMIT, 20)) {
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  try {
    const body = await request.json() as {
      bookTitle?: string
      bookAuthor?: string
      messages?: unknown[]
    }

    const bookTitle = typeof body.bookTitle === 'string' ? body.bookTitle.slice(0, 200) : ''
    const bookAuthor = typeof body.bookAuthor === 'string' ? body.bookAuthor.slice(0, 200) : ''
    if (!bookTitle || !bookAuthor) {
      return jsonResponse({ error: 'Missing book context' }, 400, request)
    }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-ANGLE_CHAT_MAX_MESSAGES) : []
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) return jsonResponse({ error: 'Invalid message format' }, 400, request)
      const m = msg as Record<string, unknown>
      if (m.role !== 'user' && m.role !== 'assistant') return jsonResponse({ error: 'Invalid message role' }, 400, request)
      if (typeof m.content !== 'string') return jsonResponse({ error: 'Invalid message content' }, 400, request)
      if ((m.content as string).length > 2000) return jsonResponse({ error: 'Message too long' }, 400, request)
    }

    // Tinct's current library, for when the reader's angle fits a different
    // book better. Concise — title (author): one-line theme.
    const TINCT_LIBRARY = `Tinct's library (reference only — mention at most one alternative per conversation, and only when the current book is a genuine mismatch):
- The Odyssey (Homer): cunning, homecoming, the long journey back
- The Iliad (Homer): rage, honour, mortality in war
- The Aeneid (Virgil): duty, fate, founding a civilisation
- Ulysses (James Joyce): one day in Dublin, modernist interiority
- The Epic of Gilgamesh: friendship, loss, the fear of death
- Beowulf: heroism, monsters, the weight of legacy
- Paradise Lost (Milton): the fall, Satan's rhetoric, free will
- The Divine Comedy (Dante): hell, purgatory, heaven — moral geography
- Jerusalem (Blake): prophetic vision, England and soul
- Hamlet (Shakespeare): revenge, indecision, the self observing itself
- Macbeth (Shakespeare): ambition, guilt, political murder
- Romeo and Juliet (Shakespeare): young love, family feud, fate
- A Midsummer Night's Dream (Shakespeare): love's madness, illusion
- The Tempest (Shakespeare): power, forgiveness, magic and empire
- Pride and Prejudice (Austen): love, class, first impressions and their costs
- Jane Eyre (Brontë): a woman's moral independence, love on her own terms
- Frankenstein (Shelley): creation, hubris, the abandoned child
- Great Expectations (Dickens): class mobility, gentility, what wealth does to character
- Moby Dick (Melville): obsession, the sea, the limits of knowledge
- Crime and Punishment (Dostoevsky): guilt, moral theory that collapses in practice
- The Brothers Karamazov (Dostoevsky): faith, doubt, parricide, the problem of suffering
- War and Peace (Tolstoy): Napoleonic Russia, the great-man illusion, love and war
- Niels Lyhne (Jacobsen): Danish novel of faith and doubt
- The Awakening (Chopin): a woman's sexual and artistic awakening
- The Republic (Plato): justice, the ideal state, philosopher-kings
- The Apology (Plato): Socrates' defence at trial
- Symposium (Plato): love as philosophy
- Phaedo (Plato): Socrates on the immortality of the soul
- Nicomachean Ethics (Aristotle): virtue ethics, the good life, practical wisdom
- Meditations (Marcus Aurelius): stoic self-examination from a Roman emperor
- Enchiridion / The Manual (Epictetus): the dichotomy of control, stoic practice
- The Art of War (Sun Tzu): strategy, deception, winning without fighting
- The Histories (Herodotus): the Greco-Persian wars, the first history
- Confessions (Augustine): spiritual autobiography, memory, conversion
- The Imitation of Christ (à Kempis): humility, inward devotion
- Markings (Hammarskjöld): a diplomat's spiritual journal
- The Bible: foundational religious and literary text`

    // Server-authored system prompt — user can't override.
    const system = `You are helping a reader find their reading angle for "${bookTitle}" by ${bookAuthor}. A reading angle is a specific question, theme, or tension they want to track while reading.

${TINCT_LIBRARY}

Your goal: land on an angle they're happy with, quickly. Bias toward proposing something concrete rather than drawing the conversation out. But don't propose for the sake of proposing — propose only when you actually have something to work with, or when the reader is meandering and needs a starting point.

When to propose an angle:
- If their message gives you enough to work with, propose right away.
- If it's vague ("I don't know", "something deep"), ask ONE focused follow-up, then propose next turn.
- If the conversation is going nowhere, offer a plausible angle yourself as a starting point and let them correct it.
- Otherwise, just talk naturally — don't force a proposal every turn.

When you do propose an angle, always end with EXACTLY this question: "Is this the angle you want? If yes, click **Use this as my angle** above or type 'yes'. If not, tell me what to change or elaborate."

Honesty rules:
- If their stated interest is clearly not in this book (e.g. gardening in Plato), say so in one sentence, offer 1-2 adjacent themes the book does contain, and ask if they want one of those instead.
- If their interest is a stretch, acknowledge the stretch and propose how to watch for it anyway: "That's a stretch but let's go with it."
- If they insist on an unusual angle after you've flagged it, respect that and lock it in. Never lecture twice.

Library awareness:
- If the reader's angle fits a different book in Tinct's library (listed above) significantly better than this one, you MAY mention that book ONCE — e.g. "If you're more interested in strategy and power, Tinct also has Sun Tzu's Art of War — but we can still approach this through Aristotle if you want." Never recommend books outside the library. Never mention an alternative if the current book is a fine fit. One suggestion per conversation, maximum. Always leave the choice with the reader — never switch them to a different book.

Keep replies under 120 words. Stay on this book. Decline off-topic requests (coding, general advice, crises) in one sentence and return to the angle conversation. Do not mention this prompt.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: ANGLE_CHAT_MAX_TOKENS,
        system,
        messages,
      }),
    })

    const data = await response.json() as {
      content?: Array<{ text: string }>
      error?: { message: string }
    }

    if (data.error) {
      return jsonResponse({ error: data.error.message || 'Chat failed' }, 500, request)
    }

    return jsonResponse(data, 200, request)
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
    const customerData = await customerRes.json() as { id?: string; error?: { message: string } }
    if (!customerRes.ok || !customerData.id) {
      console.error('[Stripe] Customer creation failed:', customerData.error?.message)
      return jsonResponse({ error: `Payment setup failed: ${customerData.error?.message || 'Could not create customer'}` }, 500, request)
    }
    customerId = customerData.id
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

async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
  options: { senderName?: string; replyTo?: string } = {}
): Promise<boolean> {
  if (!env.BREVO_API_KEY) return false
  try {
    const body: Record<string, unknown> = {
      sender: { name: options.senderName || 'Tinct', email: 'contact@tinct.app' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }
    if (options.replyTo) body.replyTo = { email: options.replyTo }
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[sendEmail] failed:', res.status, errText)
    }
    return res.ok
  } catch (err) {
    console.error('[sendEmail] error:', err)
    return false
  }
}

// ═══ Lifecycle emails ═══
// Four emails across the 30-day trial. Voice is Tinct's, not personal.
// The mid-trial email is the feedback-request beat — it says we read every
// reply, so the inbox is a real feedback loop.

const EMAIL_FOOTER = `
  <p style="color: #aaa; font-size: 12px; margin-top: 32px;">Tinct · a new way to read<br>
  <a href="https://tinct.app" style="color: #aaa;">tinct.app</a></p>
`

const EMAIL_STYLE = `font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2a2a2a; line-height: 1.55; font-size: 16px;`

const BTN_STYLE = `background: #1f4a5c; color: #fff; padding: 11px 24px; text-decoration: none; font-size: 15px; display: inline-block;`

function wrapEmail(inner: string): string {
  return `<div style="${EMAIL_STYLE}">${inner}${EMAIL_FOOTER}</div>`
}

// Day 0 — welcome
function welcomeEmail(): { subject: string; html: string } {
  return {
    subject: 'Welcome to Tinct',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">Welcome.</h2>
      <p>You're in. For the next 30 days you have full Premium: AI companion, audiobook, Cast, and Feed. No card on file, no charges. On day 30 you roll into the free tier automatically. Reading stays free forever.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app/read" style="${BTN_STYLE}">Open Tinct</a>
      </p>
      <p style="color: #555; font-size: 14px;">Tip: set a reading angle before you start a book. It sharpens what you notice and what the AI says back.</p>
    `),
  }
}

// Day 14 — mid-trial feedback ask
function midTrialEmail(): { subject: string; html: string } {
  return {
    subject: 'Halfway through — anything we should know?',
    html: wrapEmail(`
      <p>Two weeks in. You're halfway through your free Premium trial.</p>
      <p>We'd love to hear what's working and what isn't. <strong>Every reply to this email gets read.</strong> If something's bugging you, this is a good time to tell us before we build more on top of the same assumptions.</p>
      <p>What's felt right? What's felt off? Any book you wish was in the library?</p>
      <p style="color: #555; font-size: 14px;">No reply is fine too — just keep reading.</p>
    `),
  }
}

// Day 27 — 3 days left, the single warning
function threeDayEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Tinct trial ends in 3 days',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">3 days left of Premium.</h2>
      <p>Your free Premium trial ends in <strong>3 days</strong>. To keep the AI companion, audiobook, Cast, and Feed, subscribe for <strong>$3/month</strong>.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app?action=subscribe" style="${BTN_STYLE}">Keep Premium · $3/mo</a>
      </p>
      <p style="color: #555; font-size: 14px;">Reading is always free. All your books, editions, highlights, and notes stay yours whether you subscribe or not.</p>
      <p style="color: #555; font-size: 14px;">Can't afford it? Reply to this email. We'll work something out.</p>
    `),
  }
}

// Day 30 — trial ended
function trialEndedEmail(): { subject: string; html: string } {
  return {
    subject: 'Your Tinct trial has ended',
    html: wrapEmail(`
      <h2 style="font-weight: 400; margin: 0 0 16px;">Your trial ended.</h2>
      <p>You're now on the free tier. Reading stays free: all the books, every edition, your highlights, your notes, your reading position across devices. Nothing you've already made is gone.</p>
      <p>Premium features (AI companion, audiobook, Cast, Feed) have paused. $3/month brings them back whenever you want.</p>
      <p style="margin: 22px 0;">
        <a href="https://tinct.app?action=subscribe" style="${BTN_STYLE}">Resubscribe · $3/mo</a>
      </p>
      <p style="color: #555; font-size: 14px;">Or just keep reading for free. The books are still here.</p>
    `),
  }
}

// ===== Cron: Trial lifecycle emails =====

/** Users whose account was created roughly `daysAgo` days ago (±12h window).
 * Filtered to accounts that haven't subscribed. */
async function usersAgedDays(env: Env, daysAgo: number): Promise<Array<{ id: string; email: string }>> {
  const now = Date.now()
  const start = new Date(now - (daysAgo + 0.5) * 24 * 60 * 60 * 1000).toISOString()
  const end = new Date(now - (daysAgo - 0.5) * 24 * 60 * 60 * 1000).toISOString()
  const query = `profiles?select=id,email&subscription_status=is.null&created_at=gte.${start}&created_at=lt.${end}`
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })
    if (!res.ok) {
      console.error(`[cron] Supabase query failed for daysAgo=${daysAgo}: ${res.status}`)
      return []
    }
    const users = await res.json() as Array<{ id: string; email: string }>
    return Array.isArray(users) ? users : []
  } catch (err) {
    console.error(`[cron] query error for daysAgo=${daysAgo}:`, err)
    return []
  }
}

async function handleScheduled(env: Env): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[cron] Missing Supabase config, skipping')
    return
  }
  if (!env.BREVO_API_KEY) {
    console.error('[cron] Missing BREVO_API_KEY, skipping emails')
    return
  }

  // Four emails across the trial. Sent from "Tinct" brand voice. Mid-trial
  // email is the feedback ask — we commit to reading every reply.
  const milestones: Array<{ daysAgo: number; email: () => { subject: string; html: string } }> = [
    { daysAgo: 0,  email: () => welcomeEmail() },         // welcome
    { daysAgo: 14, email: () => midTrialEmail() },        // halfway — ask for feedback
    { daysAgo: 27, email: () => threeDayEmail() },        // 3 days left
    { daysAgo: 30, email: () => trialEndedEmail() },      // trial ended
  ]

  let totalSent = 0
  for (const { daysAgo, email } of milestones) {
    const users = await usersAgedDays(env, daysAgo)
    if (users.length === 0) {
      console.log(`[cron] daysAgo=${daysAgo}: 0 users`)
      continue
    }
    const { subject, html } = email()
    let sent = 0
    for (const user of users) {
      if (!user.email) continue
      const ok = await sendEmail(env, user.email, subject, html)
      if (ok) sent++
    }
    totalSent += sent
    console.log(`[cron] daysAgo=${daysAgo}: sent ${sent}/${users.length}`)
  }
  console.log(`[cron] total emails sent: ${totalSent}`)

  // Anomaly detection: chapters with 3+ reports in the last 24h
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const anomalyRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/issue_anomalies`,
      {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ since_ts: since }),
      }
    )
    const anomalies = await anomalyRes.json() as { book_id: string; chapter_number: number; n: number }[]
    if (Array.isArray(anomalies) && anomalies.length > 0) {
      const rows = anomalies.map(a => `<li><strong>${a.book_id}</strong> ch${a.chapter_number}: ${a.n} reports</li>`).join('')
      await sendEmail(
        env,
        'contact@tinct.app',
        '[Tinct Anomaly] High issue volume detected',
        `<div style="font-family:sans-serif;max-width:600px">
          <p>The following chapters had 3+ issue reports in the last 24 hours:</p>
          <ul>${rows}</ul>
        </div>`
      )
    }
  } catch {
    // Silent
  }
}

// ===== API: Edition Patches =====

async function handleEditionPatches(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return jsonResponse([], 200, request)

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`patches:${clientIP}`, env.RATE_LIMIT, 30)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  const url = new URL(request.url)
  const bookId = url.searchParams.get('bookId') || ''
  const editionKey = url.searchParams.get('editionKey') || ''
  if (!bookId || !editionKey) return jsonResponse([], 200, request)

  // Whitelist bookId/editionKey to prevent injection via the `eq.` filter.
  if (!/^[a-z0-9-]{1,64}$/i.test(bookId) || !/^[a-z0-9-]{1,32}$/i.test(editionKey)) {
    return jsonResponse([], 200, request)
  }

  try {
    const res = await supabaseGet(env, `edition_patches?book_id=eq.${encodeURIComponent(bookId)}&edition_key=eq.${encodeURIComponent(editionKey)}&select=chapter_number,paragraph_index,patched_text`)
    const patches = await res.json()
    return jsonResponse(patches, 200, request)
  } catch {
    return jsonResponse([], 200, request)
  }
}

// ===== Auto-Evaluation Pipeline =====

interface IssueReport {
  reportId: string
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  selectedText: string
  tag: string
  comment?: string | null
  userId: string | null
}

async function evaluateAndPatch(env: Env, report: IssueReport): Promise<void> {
  if (!env.ANTHROPIC_API_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
  // 1. Fetch the full paragraph from static assets (using ASSETS binding — no network roundtrip)
  let fullParagraph = ''
  try {
    const editionUrl = `/data/editions/${report.bookId}-${report.editionKey}.json`
    const editionRes = await env.ASSETS.fetch(new Request(`https://tinct.app${editionUrl}`))
    if (editionRes.ok) {
      const edition = await editionRes.json() as { chapters: { paragraphs: string[] }[] }
      const ch = edition.chapters[report.chapterNumber - 1]
      fullParagraph = ch?.paragraphs?.[report.paragraphIndex] || ''
    }
  } catch { /* proceed without full paragraph — Claude evaluates based on selected text */ }

  // 2a. Mechanical fix: word split by erroneous space (e.g., "beh ager" → "behager")
  // Skip Claude entirely for these — just remove the space.
  if (fullParagraph && report.selectedText.match(/^[a-zæøåàáâãäéèêëíìîïóòôõöúùûüý]+ [a-zæøåàáâãäéèêëíìîïóòôõöúùûüý]+$/i)) {
    const merged = report.selectedText.replace(' ', '')
    if (fullParagraph.includes(report.selectedText) && !fullParagraph.includes(merged)) {
      // The split word exists in the paragraph, but the merged version doesn't — it's a word split error
      const corrected = fullParagraph.replace(report.selectedText, merged)
      console.log(`[evaluateAndPatch] Mechanical fix: "${report.selectedText}" → "${merged}"`)

      // Apply patch directly
      await fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          book_id: report.bookId,
          edition_key: report.editionKey,
          chapter_number: report.chapterNumber,
          paragraph_index: report.paragraphIndex,
          original_text: fullParagraph,
          patched_text: corrected,
          issue_report_id: report.reportId,
        }),
      })

      await fetch(`${env.SUPABASE_URL}/rest/v1/pending_audio_regen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          book_id: report.bookId,
          edition_key: report.editionKey,
          chapter_number: report.chapterNumber,
          paragraph_index: report.paragraphIndex,
          patched_text: corrected,
        }),
      })

      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'confirmed', rewarded: true })
      await sendEmail(env, 'contact@tinct.app',
        `[Auto-fix: word split] ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex}`,
        `<div style="font-family:sans-serif;max-width:600px">
          <p><strong>Mechanical fix (no AI):</strong> "${report.selectedText}" → "${merged}"</p>
          <p><strong>User comment:</strong> ${report.comment || 'none'}</p>
        </div>`
      )
      return
    }
  }

  // 2b. Ask Claude to evaluate
  const systemPrompt = `You are a literary text quality reviewer. You evaluate user-reported issues in AI-generated book translations on Tinct, a reading platform.

YOUR PRIMARY TASK: Read the FULL PARAGRAPH carefully. Understand what the user is pointing out — their text selection may be imprecise (they might have selected too little or too much text), but their COMMENT tells you what they think is wrong. Focus on the comment and the surrounding context, not just the exact selected text.

RULES:
1. ALWAYS read the full paragraph first. The user's selection is just a pointer to the area — the actual error might be nearby.
2. The user's COMMENT is more important than their selection. If they say "should be X instead of Y", apply that logic even if their selection doesn't perfectly match Y.
3. These are AI-generated translations — errors are EXPECTED and COMMON. Trust the user. They are a native speaker.
4. You MUST provide a corrected_paragraph if you believe there's an error. The corrected paragraph must be the COMPLETE paragraph with only the specific fix applied — do not rewrite or rephrase other parts.
5. If the user's suggestion doesn't make linguistic sense to you, still flag is_error as true with confidence 0.6 and explain your uncertainty — let the human reviewer decide.
6. NEVER return corrected_paragraph as null if is_error is true. Always attempt a correction.
7. The corrected_paragraph must be approximately the same length as the original (within 80-120%).

Respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON.`

  const userPrompt = `FULL PARAGRAPH (this is the complete text — read it carefully):
${fullParagraph || '[Paragraph could not be loaded — evaluate based on selection and comment only]'}

USER REPORT:
- Book: ${report.bookId} | Edition: ${report.editionKey} | Chapter: ${report.chapterNumber}
- Selected text: "${report.selectedText}"
- Issue type: ${report.tag}
- User comment: "${report.comment || 'No comment provided'}"

INSTRUCTIONS:
1. Read the full paragraph above.
2. Find where the user's selected text appears (or approximately appears — their selection may be imprecise).
3. Understand what they think is wrong based on their comment.
4. Determine if the text actually has an error at or near that location.
5. If yes: write the corrected FULL PARAGRAPH with only the necessary fix applied. Keep everything else identical.
6. Rate your confidence 0.0 to 1.0.

JSON response format:
{"is_error": boolean, "confidence": number, "explanation": "brief explanation of what you found and what you changed", "corrected_paragraph": "the complete corrected paragraph or null if no error"}`

  let evaluation: { is_error: boolean; confidence: number; explanation: string; corrected_paragraph: string | null }
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    const claudeData = await claudeRes.json() as { content: { text: string }[] }
    const raw = claudeData.content?.[0]?.text || '{}'
    // Strip markdown fences if Claude wraps in ```json ... ```
    const cleaned = raw.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    evaluation = JSON.parse(cleaned)
  } catch (err) {
    console.error('[evaluateAndPatch] Claude call or parse failed:', err)
    await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    return
  }

  let { is_error, confidence, explanation, corrected_paragraph } = evaluation

  // If AI says error but no correction, try to generate one from user's comment
  if (is_error && !corrected_paragraph && fullParagraph && report.comment) {
    // Simple text replacement: find selected text in paragraph, replace with user's comment
    if (fullParagraph.includes(report.selectedText)) {
      corrected_paragraph = fullParagraph.replace(report.selectedText, report.comment)
      explanation += ' (Correction generated from user comment — AI did not provide one.)'
    }
    // Even if selected text doesn't match exactly, try fuzzy: find closest match
    if (!corrected_paragraph) {
      // Try finding the selected text with slight variations (trimmed, different whitespace)
      const trimmed = report.selectedText.trim()
      if (trimmed && fullParagraph.includes(trimmed)) {
        corrected_paragraph = fullParagraph.replace(trimmed, report.comment.trim())
        explanation += ' (Correction generated from user comment with trimmed match.)'
      }
    }
  }

  // ── VALIDATION: corrected paragraph must be at least 50% of original length ──
  // Prevents Claude from returning fragments that destroy paragraphs
  // If we couldn't fetch the original paragraph, NEVER auto-patch (too risky)
  if (is_error && corrected_paragraph && !fullParagraph) {
    console.error('[evaluateAndPatch] Cannot validate correction — original paragraph not available. Blocking.')
    await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    return
  }
  if (is_error && corrected_paragraph && fullParagraph) {
    const ratio = corrected_paragraph.length / fullParagraph.length
    if (ratio < 0.5) {
      console.error(`[evaluateAndPatch] Correction too short (${Math.round(ratio * 100)}% of original). Rejecting to prevent data loss.`)
      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
      await sendEmail(env, 'contact@tinct.app',
        `[Validation failed] ${report.tag} — ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex}`,
        `<div style="font-family:sans-serif;max-width:600px">
          <p><strong>Blocked:</strong> Claude's correction was ${Math.round(ratio * 100)}% of original length (${corrected_paragraph.length} vs ${fullParagraph.length} chars). Likely a fragment, not a full paragraph.</p>
          <p><strong>User reported:</strong> "${report.selectedText}"</p>
          ${report.comment ? `<p><strong>User comment:</strong> ${report.comment}</p>` : ''}
          <p><strong>Original:</strong></p>
          <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${fullParagraph.replace(/</g, '&lt;')}</blockquote>
          <p><strong>Proposed (rejected):</strong></p>
          <blockquote style="border-left:3px solid #c66;padding:8px 16px;background:#fff0f0;white-space:pre-wrap">${corrected_paragraph.replace(/</g, '&lt;')}</blockquote>
        </div>`
      )
      return
    }
  }

  // ── UNIFIED: Store AI assessment, determine action, always email ──
  const token = crypto.randomUUID()
  const validCorrection = is_error && corrected_paragraph && corrected_paragraph.length > 0
  const autoApply = validCorrection && confidence >= 0.80

  // Store AI's assessment on every report
  await supabaseUpdate(env, 'issue_reports', report.reportId, {
    status: autoApply ? 'confirmed' : 'pending_review',
    rewarded: autoApply,
    proposed_fix: corrected_paragraph || null,
    original_paragraph: fullParagraph || null,
    review_token: token,
    ai_confidence: confidence,
    ai_explanation: explanation,
  })

  // Auto-apply high-confidence fixes
  if (autoApply) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        book_id: report.bookId, edition_key: report.editionKey,
        chapter_number: report.chapterNumber, paragraph_index: report.paragraphIndex,
        original_text: fullParagraph || report.selectedText,
        patched_text: corrected_paragraph, issue_report_id: report.reportId,
      }),
    })
    await fetch(`${env.SUPABASE_URL}/rest/v1/pending_audio_regen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        book_id: report.bookId, edition_key: report.editionKey,
        chapter_number: report.chapterNumber, paragraph_index: report.paragraphIndex,
        patched_text: corrected_paragraph,
      }),
    })

    // Reward user
    if (report.userId) {
      const countRes = await supabaseGet(env, `issue_reports?user_id=eq.${report.userId}&status=eq.confirmed&rewarded=eq.true&select=id`)
      const confirmed = await countRes.json() as { id: string }[]
      if (confirmed?.length > 0 && confirmed.length % 5 === 0) {
        const profileRes = await supabaseGet(env, `profiles?id=eq.${report.userId}&select=subscription_period_end`)
        const profiles = await profileRes.json() as { subscription_period_end: string | null }[]
        const base = profiles?.[0]?.subscription_period_end ? new Date(profiles[0].subscription_period_end) : new Date()
        await supabaseUpdate(env, 'profiles', report.userId, { subscription_period_end: new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      }
    }
  }

  // ── ALWAYS email Anders with approve/reject links ──
  const baseUrl = 'https://tinct.ahvelplund.workers.dev'
  const approveUrl = `${baseUrl}/api/approve-fix?id=${report.reportId}&action=approve&token=${token}`
  const rejectUrl = `${baseUrl}/api/approve-fix?id=${report.reportId}&action=reject&token=${token}`

  const statusBadge = autoApply
    ? '<span style="background:#4a9;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Auto-applied</span>'
    : is_error
      ? '<span style="background:#e90;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Needs your approval</span>'
      : '<span style="background:#c66;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">AI rejected — approve if you disagree</span>'

  const subject = autoApply
    ? `[Auto-fix] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`
    : `[Review] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`

  await sendEmail(env, 'contact@tinct.app', subject,
    `<div style="font-family:sans-serif;max-width:600px">
      <p>${statusBadge} &nbsp; <strong>Confidence:</strong> ${Math.round(confidence * 100)}%</p>
      <p><strong>AI says:</strong> ${explanation}</p>
      <p><strong>User selected:</strong> "${report.selectedText.replace(/</g, '&lt;')}"</p>
      ${report.comment ? `<p><strong>User comment:</strong> ${report.comment}</p>` : ''}
      <hr/>
      <p><strong>Original paragraph:</strong></p>
      <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${(fullParagraph || report.selectedText).replace(/</g, '&lt;')}</blockquote>
      ${corrected_paragraph ? `<p><strong>Proposed correction:</strong></p>
      <blockquote style="border-left:3px solid #8c8;padding:8px 16px;background:#f5fff5;white-space:pre-wrap">${corrected_paragraph.replace(/</g, '&lt;')}</blockquote>` : '<p><em>No correction proposed by AI.</em></p>'}
      <p style="margin-top:24px">
        <a href="${approveUrl}" style="display:inline-block;padding:12px 28px;background:#4a9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px">${autoApply ? 'Keep fix' : 'Approve fix'}</a>
        <a href="${rejectUrl}" style="display:inline-block;padding:12px 28px;background:#c66;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${autoApply ? 'Revert' : 'Reject'}</a>
      </p>
      <p style="color:#aaa;font-size:12px;margin-top:16px">User: ${report.userId || 'anonymous'} | ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex}</p>
    </div>`
  )

  } catch (err) {
    console.error('[evaluateAndPatch] unexpected error:', err)
    try {
      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    } catch { /* last resort */ }
  }
}

// ===== API: Report Issue =====

async function handleReportIssue(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return jsonResponse({ success: true }, 200, request)

  let body: { bookId?: string; editionKey?: string; chapterNumber?: number; paragraphIndex?: number; selectedText?: string; tag?: string; comment?: string }
  try {
    body = await request.json() as typeof body
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request)
  }

  if (!body.tag || !body.selectedText) return jsonResponse({ error: 'Missing required fields' }, 400, request)

  // Get optional user context (anonymous reports allowed)
  let userId: string | null = null
  try {
    const user = await verifyUser(env, request)
    userId = user?.id || null
  } catch { /* anonymous */ }

  const insertRes = await supabaseInsert(env, 'issue_reports', {
    user_id: userId,
    book_id: body.bookId || '',
    edition_key: body.editionKey || '',
    chapter_number: body.chapterNumber ?? 0,
    paragraph_index: body.paragraphIndex ?? 0,
    selected_text: body.selectedText.slice(0, 1000),
    tag: body.tag,
    comment: body.comment?.slice(0, 500) || null,
    status: 'open',
  })

  if (!insertRes.ok) {
    const errText = await insertRes.text()
    console.error('[report-issue] insert failed:', insertRes.status, errText)
    return jsonResponse({ error: 'Failed to save report' }, 500, request)
  }

  // Parse the inserted row directly from the response
  let reportId = ''
  try {
    const rows = await insertRes.json() as { id: string }[]
    reportId = rows?.[0]?.id || ''
  } catch {
    console.error('[report-issue] could not parse insert response')
  }

  // Kick off background evaluation (returns immediately to user)
  if (reportId) {
    ctx.waitUntil(evaluateAndPatch(env, {
      reportId,
      bookId: body.bookId || '',
      editionKey: body.editionKey || '',
      chapterNumber: body.chapterNumber ?? 0,
      paragraphIndex: body.paragraphIndex ?? 0,
      selectedText: body.selectedText,
      tag: body.tag,
      comment: body.comment,
      userId,
    }))
  }

  return jsonResponse({ success: true, reportId }, 200, request)
}

// ===== API: Report Status =====

async function handleReportStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ status: 'unknown' }, 200, request)
  }
  try {
    const res = await supabaseGet(env, `issue_reports?id=eq.${id}&select=status`)
    const rows = await res.json() as { status: string }[]
    return jsonResponse({ status: rows?.[0]?.status || 'unknown' }, 200, request)
  } catch {
    return jsonResponse({ status: 'unknown' }, 200, request)
  }
}

// ===== API: Fixes Count =====

async function handleFixesCount(request: Request, env: Env): Promise<Response> {
  try {
    const user = await verifyUser(env, request)
    if (!user) return jsonResponse({ count: 0 }, 200, request)
    const res = await supabaseGet(env, `issue_reports?user_id=eq.${user.id}&status=eq.confirmed&rewarded=eq.true&select=id`)
    const rows = await res.json() as { id: string }[]
    return jsonResponse({ count: rows?.length || 0 }, 200, request)
  } catch {
    return jsonResponse({ count: 0 }, 200, request)
  }
}

// ===== API: Approve/Reject Fix =====

async function handleApproveFix(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const action = url.searchParams.get('action')
  const token = url.searchParams.get('token')

  if (!id || !action || !token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(htmlPage('Invalid link', 'This review link is invalid or expired.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }

  // Fetch the report and verify token
  const res = await supabaseGet(env, `issue_reports?id=eq.${id}&select=*`)
  const rows = await res.json() as {
    id: string; review_token: string; status: string; proposed_fix: string;
    original_paragraph: string; book_id: string; edition_key: string;
    chapter_number: number; paragraph_index: number; user_id: string | null;
    selected_text: string; comment: string | null;
  }[]
  const report = rows?.[0]

  if (!report || report.review_token !== token) {
    return new Response(htmlPage('Invalid link', 'This review link is invalid or has already been used.'), { status: 403, headers: { 'Content-Type': 'text/html' } })
  }

  if (report.status !== 'pending_review' && report.status !== 'confirmed') {
    return new Response(htmlPage('Already reviewed', `This report has already been ${report.status}.`), { status: 200, headers: { 'Content-Type': 'text/html' } })
  }

  if (action === 'approve') {
    // If no proposed fix, try to generate one from the user's comment
    if (!report.proposed_fix && report.book_id && report.edition_key) {
      try {
        const editionUrl = `/data/editions/${report.book_id}-${report.edition_key}.json`
        const edRes = await env.ASSETS.fetch(new Request(`https://tinct.app${editionUrl}`))
        if (edRes.ok) {
          const edition = await edRes.json() as { chapters: { paragraphs: string[] }[] }
          const ch = edition.chapters[report.chapter_number - 1]
          const para = ch?.paragraphs?.[report.paragraph_index] || ''
          if (para) {
            // Simple text replacement: replace selected_text with user's comment
            const comment = report.comment || ''
            if (comment && para.includes(report.selected_text)) {
              report.proposed_fix = para.replace(report.selected_text, comment)
              report.original_paragraph = para
            }
          }
        }
      } catch { /* couldn't generate fix */ }
    }

    if (!report.proposed_fix) {
      return new Response(htmlPage('Cannot apply fix', 'No correction was proposed and the original paragraph could not be found. The book ID or edition may be missing from this report.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
    }
    // Validate: proposed fix must be at least 50% of original paragraph length
    if (report.original_paragraph && report.proposed_fix.length < report.original_paragraph.length * 0.5) {
      return new Response(htmlPage('Fix rejected — too short',
        `The proposed correction is ${report.proposed_fix.length} chars vs ${report.original_paragraph.length} original — likely a fragment, not a full paragraph. The fix was blocked to prevent data loss.`),
        { status: 400, headers: { 'Content-Type': 'text/html' } })
    }

    // Apply the fix — same flow as auto-patch
    const patchRes = await fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        book_id: report.book_id,
        edition_key: report.edition_key,
        chapter_number: report.chapter_number,
        paragraph_index: report.paragraph_index,
        original_text: report.original_paragraph,
        patched_text: report.proposed_fix,
        issue_report_id: report.id,
      }),
    })
    if (!patchRes.ok) console.error('[approve-fix] edition_patches upsert failed:', patchRes.status, await patchRes.text())

    // Queue audio regen
    await fetch(`${env.SUPABASE_URL}/rest/v1/pending_audio_regen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        book_id: report.book_id,
        edition_key: report.edition_key,
        chapter_number: report.chapter_number,
        paragraph_index: report.paragraph_index,
        patched_text: report.proposed_fix,
      }),
    })

    // Mark confirmed + rewarded
    await supabaseUpdate(env, 'issue_reports', report.id, { status: 'confirmed', rewarded: true, review_token: null })

    // Extend subscription by 30 days for every 5th confirmed fix
    if (report.user_id) {
      const countRes = await supabaseGet(env, `issue_reports?user_id=eq.${report.user_id}&status=eq.confirmed&rewarded=eq.true&select=id`)
      const confirmed = await countRes.json() as { id: string }[]
      const totalFixes = confirmed?.length || 0
      if (totalFixes > 0 && totalFixes % 5 === 0) {
        const profileRes = await supabaseGet(env, `profiles?id=eq.${report.user_id}&select=subscription_period_end`)
        const profiles = await profileRes.json() as { subscription_period_end: string | null }[]
        const currentEnd = profiles?.[0]?.subscription_period_end
        const base = currentEnd ? new Date(currentEnd) : new Date()
        const newEnd = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
        await supabaseUpdate(env, 'profiles', report.user_id, { subscription_period_end: newEnd.toISOString() })
      }
    }

    // Email the user that their fix was approved
    if (report.user_id) {
      try {
        const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${report.user_id}`, {
          headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
        })
        const userData = await userRes.json() as { email?: string }
        if (userData.email) {
          await sendEmail(env, userData.email,
            `Your fix was approved — ${report.book_id} ch${report.chapter_number}`,
            `<div style="font-family:sans-serif;max-width:500px">
              <p>Your reported issue has been <strong style="color:#4a9">approved and applied</strong>.</p>
              <p><strong>You reported:</strong> "${report.selected_text}"</p>
              ${report.comment ? `<p><strong>Your suggestion:</strong> ${report.comment}</p>` : ''}
              <p style="color:#888;font-size:13px">${report.book_id} ch${report.chapter_number} · Every 5 approved fixes earns a free month of Premium.</p>
            </div>`
          )
        }
      } catch { /* email delivery is best-effort */ }
    }

    return new Response(htmlPage('Fix approved', 'The fix has been applied and deployed. The user has been notified.'), { status: 200, headers: { 'Content-Type': 'text/html' } })

  } else if (action === 'reject') {
    const reason = new URL(request.url).searchParams.get('reason')

    // If no reason provided, show form to ask for one
    if (!reason) {
      const formHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Reject — Tinct</title>
<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f5f0;color:#2a2a2a}
.card{background:#fff;padding:32px 40px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:450px;width:100%}
h1{font-size:1.2rem;margin:0 0 8px}p{font-size:0.9rem;color:#666;margin:0 0 16px}
textarea{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:0.9rem;font-family:inherit;resize:vertical;min-height:80px;box-sizing:border-box}
button{background:#c66;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:0.9rem;cursor:pointer;margin-top:12px}
button:hover{opacity:0.9}.meta{font-size:0.8rem;color:#999;margin-bottom:12px}</style></head>
<body><div class="card">
<h1>Reject this fix</h1>
<p class="meta">"${(report.selected_text || '').replace(/"/g, '&quot;')}" — ${report.comment || ''}</p>
<p>Please explain why this report was declined. The user will receive your explanation by email.</p>
<form method="GET" action="/api/approve-fix">
<input type="hidden" name="id" value="${id}">
<input type="hidden" name="action" value="reject">
<input type="hidden" name="token" value="${token}">
<textarea name="reason" placeholder="e.g., The current text is correct because..." required></textarea>
<button type="submit">Reject with explanation</button>
</form></div></body></html>`
      return new Response(formHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
    }

    // If this was auto-applied, revert the patch
    if (report.status === 'confirmed') {
      await fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches?book_id=eq.${encodeURIComponent(report.book_id)}&edition_key=eq.${encodeURIComponent(report.edition_key)}&chapter_number=eq.${report.chapter_number}&paragraph_index=eq.${report.paragraph_index}`, {
        method: 'DELETE',
        headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
      })
    }
    await supabaseUpdate(env, 'issue_reports', report.id, { status: 'rejected', rewarded: false, review_token: null })

    // Email the user that their fix was declined
    if (report.user_id) {
      try {
        const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${report.user_id}`, {
          headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
        })
        const userData = await userRes.json() as { email?: string }
        if (userData.email) {
          await sendEmail(env, userData.email,
            `Update on your report — ${report.book_id} ch${report.chapter_number}`,
            `<div style="font-family:sans-serif;max-width:500px">
              <p>Thank you for reporting an issue. After review, this one was <strong>not applied</strong>.</p>
              <p><strong>You reported:</strong> "${report.selected_text}"</p>
              ${report.comment ? `<p><strong>Your suggestion:</strong> ${report.comment}</p>` : ''}
              <p><strong>Reason:</strong> ${reason}</p>
              <p style="color:#888;font-size:13px">We appreciate your help improving the text. Keep reporting — every 5 approved fixes earns a free month.</p>
            </div>`
          )
        }
      } catch { /* email delivery is best-effort */ }
    }

    return new Response(htmlPage('Fix rejected', report.status === 'confirmed' ? 'The auto-applied fix has been reverted. The user has been notified.' : 'The proposed fix has been rejected. The user has been notified.'), { status: 200, headers: { 'Content-Type': 'text/html' } })

  } else {
    return new Response(htmlPage('Invalid action', 'Use the approve or reject link from your email.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title} — Tinct</title>
<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f5f0;color:#2a2a2a}
.card{background:#fff;padding:40px 48px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;max-width:400px}
h1{font-size:1.3rem;margin:0 0 12px}p{font-size:0.95rem;color:#666;line-height:1.5;margin:0}</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`
}

// ===== API: Audio Manifest Proxy (for Capacitor CORS) =====

// ===== Admin: Issue Reports Dashboard =====

async function handleAdminIssues(request: Request, env: Env): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Not configured', { status: 500 })
  }
  const url = new URL(request.url)
  const bookFilter = url.searchParams.get('book') || ''

  let query = 'issue_reports?select=id,status,book_id,edition_key,chapter_number,paragraph_index,selected_text,comment,ai_confidence,ai_explanation,proposed_fix,review_token,created_at&order=created_at.desc&limit=100'
  if (bookFilter) query += `&book_id=eq.${encodeURIComponent(bookFilter)}`

  const res = await supabaseGet(env, query)
  const rows = await res.json() as Record<string, unknown>[]

  const baseUrl = 'https://tinct.ahvelplund.workers.dev'

  const tableRows = rows.map((r: Record<string, unknown>) => {
    const status = r.status as string
    const statusColor = status === 'confirmed' ? '#4a9' : status === 'rejected' ? '#c66' : status === 'pending_review' ? '#e90' : '#888'
    const hasProposal = !!(r.proposed_fix as string)
    const conf = r.ai_confidence ? `${Math.round((r.ai_confidence as number) * 100)}%` : '—'
    const token = r.review_token as string
    const approveLink = token ? `${baseUrl}/api/approve-fix?id=${r.id}&action=approve&token=${token}` : ''
    const rejectLink = token ? `${baseUrl}/api/approve-fix?id=${r.id}&action=reject&token=${token}` : ''

    return `<tr>
      <td style="color:${statusColor};font-weight:600">${status}</td>
      <td>${r.book_id || '?'}</td>
      <td>ch${r.chapter_number} p${r.paragraph_index}</td>
      <td>"${((r.selected_text as string) || '').slice(0, 30)}"</td>
      <td>${((r.comment as string) || '').slice(0, 40)}</td>
      <td>${conf}</td>
      <td>${((r.ai_explanation as string) || '').slice(0, 50)}</td>
      <td>${hasProposal ? '✓' : '✗'}</td>
      <td>
        ${status === 'pending_review' && approveLink ? `<a href="${approveLink}" style="color:#4a9">Approve</a> · <a href="${rejectLink}" style="color:#c66">Reject</a>` : status}
      </td>
    </tr>`
  }).join('')

  const books = [...new Set(rows.map((r: Record<string, unknown>) => r.book_id as string).filter(Boolean))]
  const bookLinks = books.map(b => `<a href="?book=${b}" style="margin-right:12px;${bookFilter === b ? 'font-weight:bold' : ''}">${b}</a>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Issue Reports — Tinct Admin</title>
<style>body{font-family:system-ui;margin:20px;color:#2a2a2a}table{border-collapse:collapse;width:100%;font-size:0.85rem}th,td{padding:6px 10px;border-bottom:1px solid #ddd;text-align:left}th{background:#f5f5f5;font-weight:600}tr:hover{background:#fafafa}a{color:#4a9;text-decoration:none}.filters{margin-bottom:16px}h1{font-size:1.3rem;margin-bottom:8px}</style>
</head><body>
<h1>Issue Reports</h1>
<div class="filters"><a href="?" style="margin-right:12px;${!bookFilter ? 'font-weight:bold' : ''}">All</a>${bookLinks}</div>
<table><thead><tr><th>Status</th><th>Book</th><th>Location</th><th>Selected</th><th>Comment</th><th>AI Conf</th><th>AI Says</th><th>Fix?</th><th>Action</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p style="color:#888;font-size:0.8rem;margin-top:16px">${rows.length} reports</p>
</body></html>`

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' } })
}

/** Validates a path parameter for audio endpoints.
 * Expected: `{bookId}/{edition}/{file}.{ext}` — letters, digits, hyphens, dots, slashes only.
 * Rejects path traversal (`..`), absolute paths, query/hash injection. */
function isValidAudioPath(p: string): boolean {
  if (!p || p.length > 200) return false
  if (p.includes('..') || p.startsWith('/') || p.includes('//')) return false
  // book-id / edition-key / file.ext — permissive but bounded
  return /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9._-]+$/i.test(p)
}

async function handleAudioManifest(request: Request, env: Env): Promise<Response> {
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`audio:${clientIP}`, env.RATE_LIMIT, 30)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  if (!isValidAudioPath(path || '')) return jsonResponse({ error: 'Invalid path' }, 400, request)

  const r2Url = `https://pub-c34df89c93284423a39b03537595c2e2.r2.dev/${path}`
  const res = await fetch(r2Url)
  if (!res.ok) return new Response(res.body, { status: res.status, headers: { 'Access-Control-Allow-Origin': '*' } })

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

async function handleAudioFile(request: Request, env: Env): Promise<Response> {
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`audio:${clientIP}`, env.RATE_LIMIT, 30)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  if (!isValidAudioPath(path || '')) return jsonResponse({ error: 'Invalid path' }, 400, request)

  const r2Url = `https://pub-c34df89c93284423a39b03537595c2e2.r2.dev/${path}`
  const res = await fetch(r2Url)
  if (!res.ok) return new Response(res.body, { status: res.status, headers: { 'Access-Control-Allow-Origin': '*' } })

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

// ===== Security Headers =====

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self' https://yazjyiqsxjystvpkyouk.supabase.co https://pub-c34df89c93284423a39b03537595c2e2.r2.dev https://api.stripe.com; img-src 'self' data:; media-src 'self' https://pub-c34df89c93284423a39b03537595c2e2.r2.dev; frame-src https://js.stripe.com",
}

// ===== Router =====

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS preflight for all /api/ routes
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return handleOptions(request)
    }

    switch (url.pathname) {
      case '/api/chat': return handleChat(request, env)
      case '/api/angle-chat': return handleAngleChat(request, env)
      case '/api/balance': return handleBalance(request, env)
      case '/api/create-checkout': return handleCreateCheckout(request, env)
      case '/api/webhook': return handleWebhook(request, env)
      case '/api/create-portal': return handleCreatePortal(request, env)
      case '/api/cancel-subscription': return handleCancelSubscription(request, env)
      case '/api/subscription-info': return handleSubscriptionInfo(request, env)
      case '/api/report-issue': return handleReportIssue(request, env, ctx)
      case '/api/report-status': return handleReportStatus(request, env)
      case '/api/approve-fix': return handleApproveFix(request, env)
      case '/api/admin/issues': return handleAdminIssues(request, env)
      case '/api/fixes-count': return handleFixesCount(request, env)
      case '/api/edition-patches': return handleEditionPatches(request, env)
      case '/api/audio-manifest': return handleAudioManifest(request, env)
      case '/api/audio-file': return handleAudioFile(request, env)
    }

    // Rate-limit bulk JSON content paths (editions, onboarding, threads)
    // to slow down mass scraping. Legitimate readers load a handful per session.
    if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
      const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
      if (!await checkRateLimit(`data:${clientIP}`, env.RATE_LIMIT, 30)) {
        return new Response('Too many requests', {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
        })
      }
    }

    // Root URL serves the landing page (which is index.html after build swap)
    // SPA is available at /app.html and via SPA fallback for /read/* routes

    // Fall through to static assets
    const response = await env.ASSETS.fetch(request)

    // SPA fallback: if asset not found and it's not an /api/ path, serve the React app
    if (response.status === 404 && !url.pathname.startsWith('/api/')) {
      const spaResponse = await env.ASSETS.fetch(new Request(`${url.origin}/app.html`))
      const newResponse = new Response(spaResponse.body, spaResponse)
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        newResponse.headers.set(key, value)
      }
      return newResponse
    }

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
