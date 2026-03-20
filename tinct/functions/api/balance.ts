interface Env {
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ balance_cents: 200, total_tokens_used: 0 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Verify token with Supabase
  const token = authHeader.slice(7)
  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_ROLE_KEY },
  })
  if (!userRes.ok) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  const userData = await userRes.json() as { id: string }

  // Get profile
  const profileRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}&select=token_balance_cents,total_tokens_used`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )
  const profiles = await profileRes.json() as Array<{ token_balance_cents: number; total_tokens_used: number }>

  return Response.json({
    balance_cents: profiles?.[0]?.token_balance_cents ?? 0,
    total_tokens_used: profiles?.[0]?.total_tokens_used ?? 0,
  })
}
