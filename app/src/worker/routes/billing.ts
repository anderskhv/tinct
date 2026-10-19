import { getAllowedOrigin, jsonResponse } from '../lib/responses'
import { isValidUUID, timingSafeEqual } from '../lib/security'
import { recordServerEvent } from './events'
import { supabaseGet, supabaseInsert, supabaseRpc, supabaseUpdate, type SupabaseEnv } from '../lib/supabase'
import { isTopUpType, TOP_UP_TYPES, TOP_UPS, topUpCreditMicros, type TopUpType } from '../lib/aiAllowance'
import { AI_ALLOWANCE_ENFORCED } from '../../aiAllowanceSwitch'

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: BillingEnv, request: Request) => Promise<VerifiedUser | null>

export type BillingEnv = SupabaseEnv & {
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  STRIPE_PRICE_PREMIUM?: string
  /** The yearly Premium price. Without it the yearly plan is not offered. */
  STRIPE_PRICE_PREMIUM_YEARLY?: string
  /** The $3 message pack; sold only while the AI allowance is off. */
  STRIPE_PRICE_CHAT_100?: string
  /** The $5 pack: messages while the allowance is off, an AI top-up once it is on. */
  STRIPE_PRICE_CHAT_200?: string
  /** The $10 AI top-up (allowance on). Without it (or STRIPE_PRICE_TOPUP_10) that top-up is not offered. */
  STRIPE_PRICE_TOP_UP_10?: string
  /** The same $10 price under the name the Cloudflare secret was created with (Anders, 2026-10-07). */
  STRIPE_PRICE_TOPUP_10?: string
  /** 'on' once Stripe Tax is set up: Checkout then works out VAT / sales tax from the billing address. */
  STRIPE_AUTOMATIC_TAX?: string
}

const WEBHOOK_TOLERANCE_SECONDS = 300 // 5 minutes

/**
 * The line beside Stripe's required terms checkbox at every Checkout (Anders, 2026-10-19).
 * EU consumer law (CRD art. 16(m), 7(3)/8(8)) needs the buyer's express request to start
 * at once and their acknowledgement that the 14-day withdrawal right is lost for what is
 * delivered; terms.html ("EU right of withdrawal") says the same. Stripe allows Markdown
 * links and up to 1200 characters here.
 */
export const CHECKOUT_TERMS_MESSAGE = 'I agree to the [Terms](https://tinct.app/terms). Tinct starts right away, so I lose the 14-day right to cancel for what I have already used.'

/**
 * Every Checkout session requires the terms checkbox. Stripe refuses the session
 * when no Terms of service URL is set in the dashboard's public details; that refusal
 * is logged by `logCheckoutRefusal`, and the consent is never dropped to get past it.
 */
export function requireCheckoutConsent(params: URLSearchParams): void {
  params.set('consent_collection[terms_of_service]', 'required')
  params.set('custom_text[terms_of_service_acceptance][message]', CHECKOUT_TERMS_MESSAGE)
}

/** Logs a refused Checkout session, naming the terms setup when that is the cause. */
export function logCheckoutRefusal(kind: string, message: string | undefined): void {
  if (message && /terms|consent_collection|custom_text/i.test(message)) {
    console.error(`[Stripe] ${kind} checkout refused over the terms consent (check the Terms of service URL in Stripe public details):`, message)
  } else {
    console.error(`[Stripe] ${kind} checkout session creation failed:`, message ?? 'Unknown Stripe error')
  }
}

export type BillingInterval = 'month' | 'year'

/**
 * The Premium price for a billing interval, from the Worker's own secrets.
 * The client only ever names the interval; a price id never comes from it.
 */
export function premiumPriceFor(env: BillingEnv, interval: BillingInterval): string | null {
  return (interval === 'year' ? env.STRIPE_PRICE_PREMIUM_YEARLY : env.STRIPE_PRICE_PREMIUM) || null
}

/** The intervals checkout can sell right now: monthly and, once its price is set, yearly. */
export function availablePremiumIntervals(env: BillingEnv): BillingInterval[] {
  return (['month', 'year'] as const).filter(interval => premiumPriceFor(env, interval))
}

/**
 * The Stripe price of a top-up, from the Worker's own secrets (never from the
 * client). The $10 price is read under either secret name. Checkout and the
 * top-ups on sale (availableTopUps) both come through here.
 */
export function topUpPriceFor(env: BillingEnv, type: TopUpType): string | null {
  return (type === 'chat_pack_200' ? env.STRIPE_PRICE_CHAT_200 : env.STRIPE_PRICE_TOP_UP_10 || env.STRIPE_PRICE_TOPUP_10) || null
}

/** The top-ups checkout can sell right now, in the order the usage bar offers them. */
export function availableTopUps(env: BillingEnv): TopUpType[] {
  return TOP_UP_TYPES.filter(type => topUpPriceFor(env, type))
}

/** The only fields a checkout request may carry. Anything else (a price id above all) is refused. */
const CHECKOUT_FIELDS = new Set(['type', 'interval', 'attribution'])

type CheckoutBody = {
  type: string
  interval?: BillingInterval
  attribution?: {
    first_touch?: Record<string, unknown> | null
    last_touch?: Record<string, unknown> | null
  }
}

function parseCheckoutBody(value: unknown): CheckoutBody | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const body = value as Record<string, unknown>
  if (Object.keys(body).some(key => !CHECKOUT_FIELDS.has(key))) return null
  if (typeof body.type !== 'string') return null
  if (body.interval !== undefined) {
    if (body.type !== 'subscription' || (body.interval !== 'month' && body.interval !== 'year')) return null
  }
  return body as CheckoutBody
}

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

/**
 * The reader's Stripe customer, created (and saved on the profile) the first
 * time they buy anything. Shared by every Checkout this Worker starts.
 */
export async function ensureStripeCustomer(env: BillingEnv, user: VerifiedUser): Promise<{ id: string } | { error: string }> {
  const profileRes = await supabaseGet(env, `profiles?id=eq.${user.id}&select=stripe_customer_id`)
  const profiles = await profileRes.json() as { stripe_customer_id: string | null }[]
  const existing = profiles?.[0]?.stripe_customer_id || null
  if (existing) return { id: existing }
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
    return { error: `Payment setup failed: ${customerData.error?.message || 'Could not create customer'}` }
  }
  await supabaseUpdate(env, 'profiles', user.id, { stripe_customer_id: customerData.id })
  return { id: customerData.id }
}

/**
 * `allowanceOn` (src/aiAllowanceSwitch.ts) decides what a pack is sold as.
 * Off: the message packs exactly as before (chat_pack_100 $3 / chat_pack_200
 * $5, `message_count` metadata, messages credited). On: AI top-ups
 * (chat_pack_200 $5 / top_up_10 $10, `checkout_type` metadata, AI credit).
 */
export async function handleCreateCheckout(request: Request, env: BillingEnv, verifyUser: VerifyUser, ctx?: ExecutionContext, allowanceOn: boolean = AI_ALLOWANCE_ENFORCED): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.STRIPE_SECRET_KEY) return jsonResponse({ error: 'Service unavailable' }, 500, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)

  let body: CheckoutBody | null = null
  try { body = parseCheckoutBody(await request.json()) } catch { body = null }
  if (!body) return jsonResponse({ error: 'Invalid checkout request' }, 400, request)
  const interval: BillingInterval = body.interval ?? 'month'
  if (body.type === 'subscription' && !premiumPriceFor(env, interval)) {
    // A plan whose price is not configured is not on sale: the page hides it, and a
    // stale page gets a plain refusal instead of a charge for the other interval.
    return jsonResponse({ error: interval === 'year' ? 'The yearly plan is not available' : 'Service unavailable' }, interval === 'year' ? 400 : 500, request)
  }

  const customer = await ensureStripeCustomer(env, user)
  if ('error' in customer) return jsonResponse({ error: customer.error }, 500, request)
  const customerId = customer.id

  const origin = getAllowedOrigin(request)

  try {
    const params = new URLSearchParams()
    params.set('customer', customerId)
    params.set('success_url', `${origin}?payment=success`)
    params.set('cancel_url', `${origin}?payment=cancelled`)
    params.set('metadata[supabase_user_id]', user.id)
    requireCheckoutConsent(params)
    if (env.STRIPE_AUTOMATIC_TAX === 'on') {
      params.set('automatic_tax[enabled]', 'true')
      // The customer already exists; Checkout saves the billing address it asks for onto it.
      params.set('customer_update[address]', 'auto')
    }

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
      // Monthly and yearly are the same Premium: same metadata, same webhook path,
      // same tax settings above. Only the price differs.
      params.set('mode', 'subscription')
      params.set('line_items[0][price]', premiumPriceFor(env, interval)!)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'subscription')
      params.set('metadata[interval]', interval)
      params.set('subscription_data[metadata][supabase_user_id]', user.id)
      params.set('subscription_data[metadata][interval]', interval)
    } else if (!allowanceOn && body.type === 'chat_pack_100') {
      if (!env.STRIPE_PRICE_CHAT_100) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_100)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '100')
      params.set('metadata[amount_cents]', '300')
    } else if (!allowanceOn && body.type === 'chat_pack_200') {
      if (!env.STRIPE_PRICE_CHAT_200) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'payment')
      params.set('line_items[0][price]', env.STRIPE_PRICE_CHAT_200)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[message_count]', '200')
      params.set('metadata[amount_cents]', '500')
    } else if (allowanceOn && isTopUpType(body.type)) {
      // A top-up ($5 or $10). The webhook credits AI credit by checkout type
      // (lib/aiAllowance.ts TOP_UPS); the $3 pack is not a top-up type.
      const price = topUpPriceFor(env, body.type)
      if (!price) return jsonResponse({ error: 'Service unavailable' }, 500, request)
      params.set('mode', 'payment')
      params.set('line_items[0][price]', price)
      params.set('line_items[0][quantity]', '1')
      params.set('metadata[type]', 'chat_pack')
      params.set('metadata[checkout_type]', body.type)
      params.set('metadata[amount_cents]', String(TOP_UPS[body.type].priceCents))
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
      logCheckoutRefusal(String(body.type).slice(0, 32), stripeData.error?.message)
      return jsonResponse({ error: `Payment processing failed: ${stripeData.error?.message || 'Unknown Stripe error'}` }, 400, request)
    }
    const checkoutUrl = stripeData.url
    if (!checkoutUrl) return jsonResponse({ error: 'Payment processing failed' }, 500, request)
    recordServerEvent(env, ctx, { name: 'checkout_started', userId: user.id, props: { type: String(body.type).slice(0, 32), ...(body.type === 'subscription' ? { interval } : {}) } })
    return jsonResponse({ url: checkoutUrl }, 200, request)
  } catch {
    return jsonResponse({ error: 'Payment processing failed' }, 500, request)
  }
}

/** A completed Checkout session, as the webhook hands it to a product's grant. */
export type CheckoutSessionObject = { id: string; metadata?: Record<string, string>; customer?: string; payment_intent?: string | null; payment_status?: string }

/** Products granted outside this file. Each grant must be idempotent: Stripe redelivers events. */
export interface WebhookHooks {
  /** A paid Modern English edition (routes/publicBookModern.ts). 'refunded': the book was already paid for, so this payment was refunded. */
  modernEdition?: (session: CheckoutSessionObject) => Promise<{ outcome: 'granted' | 'already' | 'refunded' | 'invalid'; amountCents: number }>
  /** A Modern English checkout that ended unpaid (expired, or its delayed payment failed): its hold on the book is released. */
  modernRelease?: (session: CheckoutSessionObject) => Promise<unknown>
}

/**
 * A Modern English edition is granted only for a session Stripe reports as paid
 * (checkout.session.completed with payment_status 'paid', or a delayed payment that
 * succeeded); a completed session still awaiting a delayed payment grants nothing yet.
 */
async function grantModernSession(env: BillingEnv, obj: CheckoutSessionObject, userId: string, hooks: WebhookHooks): Promise<Response | null> {
  if (obj.payment_status !== 'paid') return null
  // Without the grant wired in, fail so Stripe redelivers once it is.
  if (!hooks.modernEdition) return new Response('Not configured', { status: 503 })
  const grant = await hooks.modernEdition(obj)
  if (grant.outcome === 'invalid') return null
  const paymentRes = await supabaseInsert(env, 'payments', {
    user_id: userId, stripe_session_id: obj.id, amount_cents: grant.amountCents,
    type: 'modern_edition', status: grant.outcome === 'refunded' ? 'refunded' : 'completed',
  })
  if (paymentRes.status !== 409 && !paymentRes.ok) return new Response('Payment insert failed', { status: 500 })
  return null
}

/**
 * What a completed pack session was sold as, from its own metadata (written
 * by handleCreateCheckout, arriving in a signed event), not from the switch
 * at delivery time: a session created with `checkout_type` is an AI top-up;
 * one created with `message_count` (switch off) is a message pack. So a
 * purchase made just before a flip still gets what was sold.
 */
export function chatPackSale(metadata: Record<string, string> | undefined): { kind: 'top_up'; checkoutType: string } | { kind: 'messages' } | null {
  if (!metadata) return null
  if (metadata.checkout_type) return { kind: 'top_up', checkoutType: metadata.checkout_type }
  if (metadata.message_count) return { kind: 'messages' }
  return null
}

export async function handleWebhook(request: Request, env: BillingEnv, ctx?: ExecutionContext, hooks: WebhookHooks = {}): Promise<Response> {
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
    data: { object: { id: string; metadata?: Record<string, string>; customer?: string; subscription?: string; current_period_end?: number; status?: string; payment_intent?: string | null; payment_status?: string } }
  }
  const obj = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const type = obj.metadata?.type
      const userId = obj.metadata?.supabase_user_id
      if (!userId || !isValidUUID(userId)) break
      recordServerEvent(env, ctx, { name: 'checkout_completed', userId, props: { type: String(type ?? 'unknown').slice(0, 32) } })

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
      } else if (type === 'chat_pack' && chatPackSale(obj.metadata)?.kind !== 'top_up') {
        // A message pack (sold while the AI allowance is off): exactly as before.
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
      } else if (type === 'chat_pack') {
        // An AI top-up (sold while the allowance is on) adds AI credit
        // (lib/aiAllowance.ts). The amount comes from the configured map by
        // checkout type, never from the client.
        const sale = chatPackSale(obj.metadata)
        const micros = sale?.kind === 'top_up' ? topUpCreditMicros(sale.checkoutType) : null
        if (micros === null) break
        // Records the payment and the credit in one transaction; a replayed
        // event (same session id) credits nothing. A failure answers 500 so
        // Stripe retries (also before the allowance migration has run).
        const creditRes = await supabaseRpc(env, 'credit_ai_topup', {
          p_user_id: userId,
          p_stripe_session_id: obj.id,
          p_micros: micros,
          p_amount_cents: parseInt(obj.metadata?.amount_cents || '0', 10) || 0,
        })
        if (!creditRes.ok) return new Response('Top-up credit failed', { status: 500 })
        break
      } else if (type === 'modern_edition') {
        const failed = await grantModernSession(env, obj, userId, hooks)
        if (failed) return failed
        break
      }

      await supabaseInsert(env, 'payments', {
        user_id: userId, stripe_session_id: obj.id,
        amount_cents: parseInt(obj.metadata?.amount_cents || '0', 10),
        type: type || 'unknown', status: 'completed',
      })
      break
    }

    case 'checkout.session.async_payment_succeeded': {
      // A delayed payment (e.g. a bank debit) cleared: only Modern English waits for it.
      const userId = obj.metadata?.supabase_user_id
      if (obj.metadata?.type !== 'modern_edition' || !userId || !isValidUUID(userId)) break
      const failed = await grantModernSession(env, obj, userId, hooks)
      if (failed) return failed
      break
    }

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      // Unpaid: the book's hold for this session is released so others can buy it.
      if (obj.metadata?.type !== 'modern_edition') break
      if (!hooks.modernRelease) return new Response('Not configured', { status: 503 })
      await hooks.modernRelease(obj)
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
    intervals: availablePremiumIntervals(env),
  }, 200, request)
}
