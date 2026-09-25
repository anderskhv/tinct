import { GROK_CLIENT_SECRET_TTL_SECONDS, GROK_VOICE_MODEL } from '../../voice/grokConfig'
import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'

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

function labGuestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'lab-guest'
}

export async function handleLabVoiceSession(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  return handleVoiceSession(request, env, ctx, async () => null, checkRateLimit, { allowLabGuest: true })
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
  options?: { allowLabGuest?: boolean },
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.XAI_API_KEY
  if (!apiKey) return jsonResponse({ error: VOICE_NOT_CONFIGURED_ERROR }, 503, request)

  const allowLabGuest = options?.allowLabGuest === true
  const user = allowLabGuest ? null : await verifyUser(env, request)
  if (!allowLabGuest) {
    if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
    if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  }
  const userId = user?.id ?? `lab-guest:${labGuestIp(request)}`
  if (allowLabGuest) {
    const rateAllowed = await checkRateLimit(`lab-voice:${labGuestIp(request)}`, env.RATE_LIMIT, 6)
    if (!rateAllowed) {
      logVoiceStartFailure(429, 'rate_limited', false)
      return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
    }
  } else {
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
      return jsonResponse({ error: message || 'Could not start a voice session.' }, response.status >= 400 ? response.status : 502, request)
    }

    if (user && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }

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
