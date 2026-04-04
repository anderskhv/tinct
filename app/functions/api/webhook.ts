interface Env {
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

async function computeHmac(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature') || ''
  const rawBody = await request.text()

  // Parse Stripe signature header
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    if (key === 't') acc.timestamp = value
    if (key === 'v1') acc.signatures.push(value)
    return acc
  }, { timestamp: '', signatures: [] as string[] })

  if (!parts.timestamp || parts.signatures.length === 0) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Verify signature
  const signedPayload = `${parts.timestamp}.${rawBody}`
  const expectedSig = await computeHmac(env.STRIPE_WEBHOOK_SECRET, signedPayload)
  const isValid = parts.signatures.some(sig => sig === expectedSig)

  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody) as {
    type: string
    data: {
      object: {
        id: string
        metadata?: Record<string, string>
        customer?: string
        subscription?: string
        current_period_end?: number
        status?: string
      }
    }
  }

  const obj = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const type = obj.metadata?.type
      const userId = obj.metadata?.supabase_user_id

      if (!userId) break

      if (type === 'subscription') {
        // Subscription purchased — update profile
        await supabaseUpdate(env, 'profiles', userId, {
          subscription_status: 'active',
          stripe_customer_id: obj.customer,
          messages_used_this_period: 0,
          period_start: new Date().toISOString(),
        })

        // If we have a subscription ID, fetch period end from Stripe
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
        // Chat pack purchased — credit message balance
        const messageCount = parseInt(obj.metadata?.message_count || '0', 10)
        if (messageCount > 0) {
          await supabaseRpc(env, 'credit_messages', {
            p_user_id: userId,
            p_count: messageCount,
          })
        }
      }

      // Log payment
      await supabaseInsert(env, 'payments', {
        user_id: userId,
        stripe_session_id: obj.id,
        amount_cents: parseInt(obj.metadata?.amount_cents || '0', 10),
        type: type || 'unknown',
        status: 'completed',
      })
      break
    }

    case 'customer.subscription.updated': {
      // Subscription renewed or changed — update status and period
      const userId = obj.metadata?.supabase_user_id
      if (!userId) break

      const updates: Record<string, unknown> = {
        subscription_status: obj.status === 'active' ? 'active' : obj.status,
      }

      if (obj.current_period_end) {
        updates.subscription_period_end = new Date(obj.current_period_end * 1000).toISOString()
        // Reset monthly message count on renewal (new period)
        updates.messages_used_this_period = 0
        updates.period_start = new Date().toISOString()
      }

      await supabaseUpdate(env, 'profiles', userId, updates)
      break
    }

    case 'customer.subscription.deleted': {
      // Subscription canceled — mark as canceled but keep access until period end
      const userId = obj.metadata?.supabase_user_id
      if (!userId) break

      await supabaseUpdate(env, 'profiles', userId, {
        subscription_status: 'canceled',
      })
      break
    }

    case 'invoice.payment_failed': {
      // Payment failed on renewal — mark as past_due
      const userId = obj.metadata?.supabase_user_id
      if (!userId) break

      await supabaseUpdate(env, 'profiles', userId, {
        subscription_status: 'past_due',
      })
      break
    }
  }

  return Response.json({ received: true })
}
