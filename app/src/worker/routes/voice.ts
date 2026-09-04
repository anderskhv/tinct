import { VOICE_REALTIME_MODEL } from '../../voice/types'
import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'
import { getDiagnosticConsent, isConfiguredOwner, recordServerDiagnosticEvent } from '../lib/diagnostics'

export type VoiceEnv = SupabaseEnv & {
  OPENAI_API_KEY?: string
  RATE_LIMIT?: KVNamespace
  OWNER_DIAGNOSTIC_USER_ID?: string
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: VoiceEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const VOICE_NOT_CONFIGURED_ERROR = 'Voice is not configured. Set the OPENAI_API_KEY Worker secret.'

async function hashSafetyIdentifier(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`tinct-voice:${userId}`))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
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

export async function handleVoiceSession(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
  options?: { allowLabGuest?: boolean },
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.OPENAI_API_KEY
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
      return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
    }

    const access = evaluateChatAccess(profile)
    if (!access.allowed) return jsonResponse({ error: access.error }, 402, request)
  }

  try {
    const diagnosticSessionId = user && isConfiguredOwner(env, userId)
      && (await getDiagnosticConsent(env, userId)).enabled
      ? crypto.randomUUID()
      : null
    if (diagnosticSessionId) {
      await recordServerDiagnosticEvent(env, userId, {
        sessionId: diagnosticSessionId,
        type: 'request_accepted',
        metadata: { source: 'voice_session', transport: 'webrtc', model: VOICE_REALTIME_MODEL },
      })
      await recordServerDiagnosticEvent(env, userId, {
        sessionId: diagnosticSessionId,
        type: 'provider_started',
        metadata: { source: 'voice_session', model: VOICE_REALTIME_MODEL },
      })
    }
    const providerStartedAt = Date.now()
    const safetyId = await hashSafetyIdentifier(userId)
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Safety-Identifier': safetyId,
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: VOICE_REALTIME_MODEL,
          audio: { output: { voice: 'marin' } },
        },
      }),
    })

    const data = await response.json() as { value?: string; expires_at?: number; error?: { message?: string } }
    if (!response.ok || !data.value) {
      if (diagnosticSessionId) {
        await recordServerDiagnosticEvent(env, userId, {
          sessionId: diagnosticSessionId,
          type: 'provider_error',
          metadata: { source: 'voice_session', status: response.status, latency_ms: Date.now() - providerStartedAt, error_class: 'session_token' },
        })
      }
      const message = data.error?.message || 'Could not start a voice session.'
      return jsonResponse({ error: message }, response.status >= 400 ? response.status : 502, request)
    }

    if (diagnosticSessionId) {
      await recordServerDiagnosticEvent(env, userId, {
        sessionId: diagnosticSessionId,
        type: 'provider_completed',
        metadata: { source: 'voice_session', status: response.status, latency_ms: Date.now() - providerStartedAt },
      })
    }

    if (user && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }

    return jsonResponse({
      value: data.value,
      expires_at: data.expires_at ?? null,
      model: VOICE_REALTIME_MODEL,
      ...(diagnosticSessionId ? { diagnostic_session_id: diagnosticSessionId } : {}),
    }, 200, request)
  } catch {
    return jsonResponse({ error: 'Could not start a voice session.' }, 500, request)
  }
}
