import { VOICE_LIVE_MODEL, VOICE_LIVE_BACKEND_MODEL, LIVE_VOICE_INSTRUCTIONS } from '../../voice/liveConfig'
import { parseVoiceTrial, VOICE_TRIAL_MODELS } from '../../voice/voiceTrial'
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

  // The trial is explicit; arbitrary model names are never accepted.
  const body = await request.json().catch(() => null) as { voiceTrial?: unknown; protocol?: unknown; sdp?: unknown; instructions?: unknown; tools?: unknown } | null
  const trial = parseVoiceTrial(body?.voiceTrial)
  const model = trial ? VOICE_TRIAL_MODELS[trial] : VOICE_REALTIME_MODEL
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
    const safetyId = await hashSafetyIdentifier(userId)
    if (body?.protocol === 'live') {
      if (typeof body.sdp !== 'string' || !body.sdp.startsWith('v=0') || body.sdp.length > 65_536
        || typeof body.instructions !== 'string' || body.instructions.length > 65_536
        || !Array.isArray(body.tools) || body.tools.length > 60) {
        return jsonResponse({ error: 'Invalid voice session request.' }, 400, request)
      }
      // Only application functions are accepted: no client-supplied hosted tools,
      // models, endpoints or credentials may turn this route into a paid API proxy.
      const tools = body.tools.filter((tool: unknown) => tool && typeof tool === 'object'
        && (tool as { type?: unknown }).type === 'function'
        && typeof (tool as { name?: unknown }).name === 'string')
      if (tools.length !== body.tools.length || JSON.stringify(tools).length > 65_536) {
        return jsonResponse({ error: 'Invalid voice tools.' }, 400, request)
      }
      const response = await fetch('https://api.openai.com/v1/live/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'OpenAI-Safety-Identifier': safetyId },
        body: JSON.stringify({
          session: {
            model: VOICE_LIVE_MODEL,
            instructions: LIVE_VOICE_INSTRUCTIONS,
            audio: { output: { voice: 'marin' } },
            delegation: { type: 'responses', responses: {
              model: VOICE_LIVE_BACKEND_MODEL,
              instructions: body.instructions,
              tools, parallel_tool_calls: false,
            } },
          },
          transport: { type: 'webrtc', sdp: body.sdp },
        }),
      })
      const data = await response.json() as { session?: { id?: string }; transport?: { type?: string; sdp?: string }; error?: { message?: string } }
      if (!response.ok || !data.transport?.sdp) return jsonResponse({ error: data.error?.message || 'Could not start GPT Live.' }, response.status >= 400 ? response.status : 502, request)
      if (user && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
      return jsonResponse({ session: data.session, transport: data.transport, model: VOICE_LIVE_MODEL }, 200, request)
    }

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
          model,
          audio: { output: { voice: 'marin' } },
        },
      }),
    })

    const data = await response.json() as { value?: string; expires_at?: number; error?: { message?: string } }
    if (!response.ok || !data.value) {
      const message = data.error?.message || 'Could not start a voice session.'
      return jsonResponse({ error: message }, response.status >= 400 ? response.status : 502, request)
    }

    if (user && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.waitUntil(supabaseRpc(env, 'use_message', { p_user_id: userId }))
    }

    return jsonResponse({
      value: data.value,
      expires_at: data.expires_at ?? null,
      model,
    }, 200, request)
  } catch {
    return jsonResponse({ error: 'Could not start a voice session.' }, 500, request)
  }
}
