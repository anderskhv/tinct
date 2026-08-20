import { VOICE_REALTIME_MODEL } from '../../voice/types'
import { evaluateChatAccess, type ChatProfile } from '../lib/chatAccess'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, supabaseRpc, type SupabaseEnv } from '../lib/supabase'

export type VoiceEnv = SupabaseEnv & {
  OPENAI_API_KEY?: string
  RATE_LIMIT?: KVNamespace
}

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: VoiceEnv, request: Request) => Promise<VerifiedUser | null>
type CheckRateLimit = (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>

export const VOICE_NOT_CONFIGURED_ERROR = 'Voice is not configured. Set the OPENAI_API_KEY Worker secret.'

async function hashSafetyIdentifier(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`tinct-voice:${userId}`))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function handleVoiceSession(
  request: Request,
  env: VoiceEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  checkRateLimit: CheckRateLimit,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const apiKey = env.OPENAI_API_KEY
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
    return jsonResponse({ error: 'Rate limit exceeded. Try again in a minute.' }, 429, request)
  }

  const access = evaluateChatAccess(profile)
  if (!access.allowed) return jsonResponse({ error: access.error }, 402, request)

  try {
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
      const message = data.error?.message || 'Could not start a voice session.'
      return jsonResponse({ error: message }, response.status >= 400 ? response.status : 502, request)
    }

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }

    return jsonResponse({
      value: data.value,
      expires_at: data.expires_at ?? null,
      model: VOICE_REALTIME_MODEL,
    }, 200, request)
  } catch {
    return jsonResponse({ error: 'Could not start a voice session.' }, 500, request)
  }
}
