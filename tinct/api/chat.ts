import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Determine user identity for rate limiting and billing
  const authHeader = req.headers.authorization
  let userId: string | null = null
  let supabase: ReturnType<typeof createClient> | null = null

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  // Verify JWT if provided
  if (authHeader?.startsWith('Bearer ') && supabase) {
    const token = authHeader.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      userId = user.id
    }
  }

  // Rate limit by user ID or IP
  const rateLimitKey = userId || (req.headers['x-forwarded-for'] as string) || 'unknown'
  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Max 10 requests/minute.' })
  }

  // Check balance for authenticated users
  if (userId && supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('token_balance_cents')
      .eq('id', userId)
      .single()

    if (profile && profile.token_balance_cents <= 0) {
      return res.status(402).json({
        error: 'Insufficient balance',
        balance_cents: 0,
        message: 'Your AI chat balance is empty. Please top up to continue.',
      })
    }
  }

  try {
    const { model, max_tokens, system, messages } = req.body

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1024,
        system: system || '',
        messages: messages || [],
      }),
    })

    const data = await response.json()

    // If successful and we have usage data, deduct from balance
    if (response.ok && data.usage && userId && supabase) {
      const inputTokens = data.usage.input_tokens || 0
      const outputTokens = data.usage.output_tokens || 0

      // Calculate cost: Sonnet pricing $3/M input, $15/M output, 2.5x markup
      const inputCostCents = (inputTokens / 1_000_000) * 300
      const outputCostCents = (outputTokens / 1_000_000) * 1500
      const totalCostCents = (inputCostCents + outputCostCents) * 2.5

      // Atomic balance deduction
      await supabase.rpc('deduct_balance', {
        p_user_id: userId,
        p_amount_cents: totalCostCents,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_feature: 'chat',
        p_book_id: req.body.metadata?.bookId || null,
        p_chapter: req.body.metadata?.chapter || null,
      })

      // Get updated balance
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('token_balance_cents')
        .eq('id', userId)
        .single()

      data._tinct = {
        cost_cents: totalCostCents,
        balance_cents: updatedProfile?.token_balance_cents ?? 0,
      }
    }

    return res.status(response.status).json(data)
  } catch (err) {
    return res.status(500).json({
      error: 'Proxy error',
      details: err instanceof Error ? err.message : String(err),
    })
  }
}
