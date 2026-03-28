/**
 * Cloudflare Worker entry point.
 * Handles /api/* routes (chat proxy) and falls through to static assets for everything else.
 */

interface Env {
  ANTHROPIC_API_KEY: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

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

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!checkRateLimit(clientIP)) {
    return Response.json({ error: 'Rate limit exceeded. Max 10 requests/minute.' }, { status: 429 })
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
    return Response.json(data, { status: response.status })
  } catch (err) {
    return Response.json({
      error: 'Proxy error',
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/chat') {
      return handleChat(request, env)
    }

    // Fall through to static assets
    return env.ASSETS.fetch(request)
  },
}
