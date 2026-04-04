interface Env {
  ANTHROPIC_API_KEY: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Rate limit by IP
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!checkRateLimit(clientIP)) {
    return Response.json({ error: 'Rate limit exceeded. Max 10 requests/minute.' }, { status: 429 })
  }

  // Check auth and message quota if Supabase is configured
  let userId: string | null = null
  const authHeader = request.headers.get('authorization')

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY },
    })

    if (userRes.ok) {
      const user = await userRes.json() as { id: string }
      userId = user.id

      // Check message quota
      const profileRes = await fetch(
        `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=messages_used_this_period,message_balance,subscription_status,subscription_period_end`,
        {
          headers: {
            'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      )
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
           profile.subscription_period_end &&
           new Date(profile.subscription_period_end) > new Date())
        const monthlyRemaining = Math.max(0, MONTHLY_MESSAGE_LIMIT - (profile.messages_used_this_period || 0))
        const hasMessages = (isSubscribed && monthlyRemaining > 0) || (profile.message_balance || 0) > 0

        if (!hasMessages) {
          return Response.json({ error: 'No messages remaining. Buy a chat pack to continue.' }, { status: 402 })
        }
      }
    }
  }

  try {
    const body = await request.json() as {
      model?: string
      max_tokens?: number
      system?: string
      messages?: unknown[]
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
      await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/use_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ p_user_id: userId }),
      })
    }

    return Response.json(data, { status: response.status })
  } catch (err) {
    return Response.json({
      error: 'Proxy error',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
