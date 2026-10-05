import { GROK_CLIENT_SECRET_TTL_SECONDS, GROK_VOICE_MODEL } from '../../voice/grokConfig'
import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import { AI_RESTING_MESSAGE, AI_RESTING_TYPE } from '../lib/aiSpend'
import { isProviderBudgetError } from '../lib/chatUpstream'
import { corsHeaders, jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'
import { recordAiUsage, talkCostUsd, type LedgerEnv } from '../lib/aiUsage'

export type VoiceEnv = SupabaseEnv & {
  /** Grok native speech-to-speech: mints the browser's ephemeral client secret. */
  XAI_API_KEY?: string
  /** Still used by the shared source-research route, not by the voice path. */
  OPENAI_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: VoiceEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const VOICE_NOT_CONFIGURED_ERROR = 'Voice is not configured. Set the XAI_API_KEY Worker secret.'
export const XAI_CLIENT_SECRETS_URL = 'https://api.x.ai/v1/realtime/client_secrets'

/**
 * One line per refused or failed voice start, so a reader's "voice would not
 * connect" leaves evidence (invocation logs are off): the status and reason,
 * never the account. Setup failures after this point (the provider socket)
 * are retried by the client and do not reach the Worker.
 */
function logVoiceStartFailure(status: number, reason: string, signedIn: boolean): void {
  console.log(JSON.stringify({ event: 'voice_session_failed', status, reason: reason.slice(0, 160), signedIn }))
}

/**
 * Voice sessions require sign-in. The former signed-out route answers with
 * the same 401 the signed-in route gives without a session, so older
 * clients show their sign-in prompt instead of an error.
 */
export async function handleLabVoiceSession(request: Request): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  logVoiceStartFailure(401, 'sign_in_required', false)
  return jsonResponse({ error: 'Authentication required' }, 401, request)
}

/**
 * Mints a short-lived xAI client secret for one browser voice session. The API
 * key never leaves the Worker; the browser opens the WebSocket itself. Model,
 * prompt and tools are set by the client in `session.update`, so this route
 * accepts no provider parameters at all.
 */
export async function handleVoiceSession(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.XAI_API_KEY
  if (!apiKey) return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)

  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  const userId = user.id
  const profilePromise: Promise<ChatProfile | null> = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? supabaseGet(env, `profiles?id=eq.${userId}&select=messages_used_this_period,message_balance,subscription_status,subscription_period_end,created_at`)
        .then(async (profileRes) => {
          if (!profileRes.ok) return null
          const profiles = await profileRes.json() as ChatProfile[]
          return profiles?.[0] ?? null
        })
        .catch(() => null)
    : Promise.resolve(null)

  const [rateAllowed, profile] = await Promise.all([
    checkRateLimit(`voice:${userId}`, env.RATE_LIMIT, 6),
    profilePromise,
  ])
  if (!rateAllowed) {
    logVoiceStartFailure(429, 'rate_limited', true)
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  const access = evaluateChatAccess(profile)
  if (!access.allowed) {
    logVoiceStartFailure(402, 'no_access', true)
    return jsonResponse({ error: access.error }, 402, request)
  }

  try {
    const response = await fetch(XAI_CLIENT_SECRETS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_after: { seconds: GROK_CLIENT_SECRET_TTL_SECONDS } }),
    })
    const data = await response.json().catch(() => ({})) as { value?: string; expires_at?: number; error?: string | { message?: string } }
    if (!response.ok || typeof data.value !== 'string' || !data.value) {
      const message = typeof data.error === 'string' ? data.error : data.error?.message
      logVoiceStartFailure(response.status, `provider: ${message || 'no client secret'}`, Boolean(user))
      // Provider credit, spend or rate limits: a calm resting state, not a raw provider message.
      if (response.status === 402 || response.status === 429 || isProviderBudgetError(response.status, data)) {
        return jsonResponse({ error: AI_RESTING_MESSAGE, code: AI_RESTING_TYPE }, 503, request)
      }
      return jsonResponse({ error: message || 'Could not start a voice session.' }, response.status >= 400 ? response.status : 502, request)
    }

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }
    // Cost ledger: the session row. Connected seconds arrive later from /api/voice-usage.
    recordAiUsage(env as LedgerEnv, ctx, { userId }, { feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds: 0, cost_usd: 0 })

    return jsonResponse({
      value: data.value,
      expires_at: data.expires_at ?? null,
      model: GROK_VOICE_MODEL,
    }, 200, request)
  } catch (error) {
    logVoiceStartFailure(500, `exception: ${error instanceof Error ? error.message : 'unknown'}`, Boolean(user))
    return jsonResponse({ error: 'Could not start a voice session.' }, 500, request)
  }
}

/**
 * The longest a single Talk session can legitimately be billed for. The browser
 * talks to xAI directly, so connected time is self-reported; a report is capped
 * here so a bad client cannot inflate the ledger. Provider session limit
 * UNVERIFIED (the 10-minute client-secret TTL only bounds opening the socket).
 */
export const TALK_SESSION_MAX_SECONDS = 1800

/**
 * POST /api/voice-usage {seconds, bookId?}: the client reports connected Talk
 * time when a session ends or the page is hidden. Signed-in only. Always 204
 * for a well-formed report; the ledger write is best effort and never blocks.
 */
export async function handleVoiceUsage(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const user = await verifyUser(env, request)
  if (!user || !isValidUUID(user.id)) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!await checkRateLimit(`voice-usage:${user.id}`, env.RATE_LIMIT, 30)) return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > 1024) return jsonResponse({ error: 'Request too large' }, 413, request)
  let body: { seconds?: unknown; bookId?: unknown }
  try { body = await request.json() as typeof body } catch { return jsonResponse({ error: 'Invalid JSON' }, 400, request) }
  const raw = typeof body?.seconds === 'number' ? body.seconds : NaN
  if (!Number.isFinite(raw) || raw <= 0) return jsonResponse({ error: 'Invalid seconds' }, 400, request)
  const seconds = Math.min(raw, TALK_SESSION_MAX_SECONDS)
  const bookId = typeof body.bookId === 'string' && /^[a-z0-9-]{1,64}$/.test(body.bookId) ? body.bookId : null
  recordAiUsage(env as LedgerEnv, ctx, { userId: user.id }, {
    feature: 'talk', provider: 'xai', model: GROK_VOICE_MODEL, seconds, book_id: bookId, cost_usd: talkCostUsd(seconds),
  })
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
