/**
 * Google sign-in on tinct.app (src/lab/googleSignIn.ts has the whole flow).
 *
 * - GET  /api/auth/google/config    the public client id, or null while the
 *                                    Worker cannot finish sign-in (switch).
 * - GET  /auth/google/callback      Google's redirect_uri. Sends the reader to
 *                                    the sign-in page with code/state/error in
 *                                    the fragment, which never reaches a server.
 * - POST /api/auth/google/exchange  code + PKCE verifier -> Google's token
 *                                    endpoint with the client secret; answers
 *                                    with the ID token only.
 *
 * Nothing is stored and no token, code or verifier is ever logged.
 */
import { jsonResponse } from '../lib/responses'
import type { CheckRateLimit } from '../lib/rateLimit'

export interface GoogleAuthEnv {
  /** The OAuth client id (public). Worker secret or var. */
  GOOGLE_OAUTH_CLIENT_ID?: string
  /** The OAuth client secret. Worker secret only; never sent to a browser. */
  GOOGLE_OAUTH_CLIENT_SECRET?: string
}

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_AUTH_PATHS = {
  config: '/api/auth/google/config',
  callback: '/auth/google/callback',
  exchange: '/api/auth/google/exchange',
} as const
const EXCHANGE_PER_MINUTE = 10
const TOKEN_TIMEOUT_MS = 10_000
const VERIFIER = /^[A-Za-z0-9._~-]{43,128}$/

export function googleAuthConfigured(env: GoogleAuthEnv): boolean {
  return Boolean(env.GOOGLE_OAUTH_CLIENT_ID?.trim() && env.GOOGLE_OAUTH_CLIENT_SECRET?.trim())
}

export function isGoogleAuthPath(pathname: string): boolean {
  return pathname === GOOGLE_AUTH_PATHS.config || pathname === GOOGLE_AUTH_PATHS.callback || pathname === GOOGLE_AUTH_PATHS.exchange
}

function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store')
  return response
}

function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || 'unknown'
}

export async function handleGoogleAuth(request: Request, env: GoogleAuthEnv, deps: { checkRateLimit: CheckRateLimit; fetcher?: typeof fetch }): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname === GOOGLE_AUTH_PATHS.config) {
    if (request.method !== 'GET' && request.method !== 'HEAD') return noStore(jsonResponse({ error: 'Method not allowed' }, 405, request))
    return noStore(jsonResponse({ clientId: googleAuthConfigured(env) ? env.GOOGLE_OAUTH_CLIENT_ID!.trim() : null }, 200, request))
  }
  if (url.pathname === GOOGLE_AUTH_PATHS.callback) return googleCallback(request, url)
  return googleExchange(request, env, deps)
}

/**
 * Google's answer, passed to the sign-in page in the fragment. Only the three
 * parameters the page reads are carried; anything else Google adds is dropped.
 */
function googleCallback(request: Request, url: URL): Response {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { 'Cache-Control': 'no-store' } })
  const carried = new URLSearchParams()
  for (const key of ['code', 'state', 'error'] as const) {
    const value = url.searchParams.get(key)
    if (value && value.length <= 2048) carried.set(key, value)
  }
  if (!carried.has('code') && !carried.has('error')) carried.set('error', 'missing_code')
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/sign-in?callback=google#${carried.toString()}`,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

async function googleExchange(request: Request, env: GoogleAuthEnv, deps: { checkRateLimit: CheckRateLimit; fetcher?: typeof fetch }): Promise<Response> {
  if (request.method !== 'POST') return noStore(jsonResponse({ error: 'Method not allowed' }, 405, request))
  if (!googleAuthConfigured(env)) return noStore(jsonResponse({ error: 'not_configured' }, 503, request))
  const url = new URL(request.url)
  // Same-origin page calls only.
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return noStore(jsonResponse({ error: 'forbidden' }, 403, request))
  if (!await deps.checkRateLimit(`google-exchange:${clientIp(request)}`, undefined, EXCHANGE_PER_MINUTE)) {
    return noStore(jsonResponse({ error: 'rate_limited' }, 429, request))
  }
  let body: { code?: unknown; codeVerifier?: unknown; redirectUri?: unknown }
  try {
    body = await request.json() as typeof body
  } catch {
    return noStore(jsonResponse({ error: 'invalid_request' }, 400, request))
  }
  const code = typeof body?.code === 'string' ? body.code : ''
  const verifier = typeof body?.codeVerifier === 'string' ? body.codeVerifier : ''
  const redirectUri = `${url.origin}${GOOGLE_AUTH_PATHS.callback}`
  // The redirect_uri must be this origin's callback, exactly what the page sent Google.
  if (!code || code.length > 2048 || !VERIFIER.test(verifier) || body?.redirectUri !== redirectUri) {
    return noStore(jsonResponse({ error: 'invalid_request' }, 400, request))
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TOKEN_TIMEOUT_MS)
  try {
    const response = await (deps.fetcher ?? fetch)(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: verifier,
        redirect_uri: redirectUri,
        client_id: env.GOOGLE_OAUTH_CLIENT_ID!.trim(),
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET!.trim(),
      }).toString(),
      signal: controller.signal,
    })
    const answer = await response.json().catch(() => null) as { id_token?: unknown; error?: unknown } | null
    if (!response.ok || typeof answer?.id_token !== 'string' || !answer.id_token) {
      // Google's error code (e.g. invalid_grant) names no one; nothing else is logged.
      console.warn(JSON.stringify({ event: 'google_exchange_failed', status: response.status, error: typeof answer?.error === 'string' ? answer.error.slice(0, 40) : null }))
      return noStore(jsonResponse({ error: 'exchange_failed' }, 400, request))
    }
    return noStore(jsonResponse({ idToken: answer.id_token }, 200, request))
  } catch {
    console.warn(JSON.stringify({ event: 'google_exchange_failed', status: controller.signal.aborted ? 'timeout' : 'network', error: null }))
    return noStore(jsonResponse({ error: 'exchange_failed' }, 502, request))
  } finally {
    clearTimeout(timer)
  }
}
