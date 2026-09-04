import { jsonResponse } from '../lib/responses'
import {
  getDiagnosticConsent,
  isConfiguredOwner,
  recordServerDiagnosticEvent,
  validDiagnosticEventType,
  validOpaqueId,
  type DiagnosticEnv,
} from '../lib/diagnostics'
import { supabaseDelete, supabaseGet, supabaseInsert } from '../lib/supabase'

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: DiagnosticEnv, request: Request) => Promise<VerifiedUser | null>
type VerifySiteAdmin = (env: DiagnosticEnv, request: Request) => Promise<boolean>

async function requireOwner(env: DiagnosticEnv, request: Request, verifyUser: VerifyUser) {
  if (!env.OWNER_DIAGNOSTIC_USER_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return { error: 'Not configured', status: 503 } as const
  const user = await verifyUser(env, request)
  if (!user || !isConfiguredOwner(env, user.id)) return { error: 'Forbidden', status: 403 } as const
  return { user } as const
}

export async function handleDiagnosticConsent(request: Request, env: DiagnosticEnv, verifyUser: VerifyUser): Promise<Response> {
  const auth = await requireOwner(env, request, verifyUser)
  if ('error' in auth) return jsonResponse({ error: auth.error }, auth.status, request)
  if (request.method === 'GET') return jsonResponse(await getDiagnosticConsent(env, auth.user.id), 200, request)
  if (request.method !== 'PUT') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const body = await request.json().catch(() => null) as { enabled?: unknown; rawContentEnabled?: unknown } | null
  if (!body || typeof body.enabled !== 'boolean' || typeof body.rawContentEnabled !== 'boolean') {
    return jsonResponse({ error: 'Invalid consent' }, 400, request)
  }
  const rawEnabled = body.enabled && body.rawContentEnabled
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/diagnostic_consents?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ user_id: auth.user.id, enabled: body.enabled, raw_content_enabled: rawEnabled, updated_at: new Date().toISOString() }),
  })
  if (!response.ok) return jsonResponse({ error: 'Could not update consent' }, 502, request)
  return jsonResponse({ enabled: body.enabled, raw_content_enabled: rawEnabled }, 200, request)
}

export async function handleDiagnosticEvent(request: Request, env: DiagnosticEnv, verifyUser: VerifyUser): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const auth = await requireOwner(env, request, verifyUser)
  if ('error' in auth) return jsonResponse({ error: auth.error }, auth.status, request)
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || !validOpaqueId(body.sessionId) || !validDiagnosticEventType(body.type)
    || (body.turnId != null && !validOpaqueId(body.turnId)) || (body.providerId != null && !validOpaqueId(body.providerId))) {
    return jsonResponse({ error: 'Invalid event' }, 400, request)
  }
  const captured = await recordServerDiagnosticEvent(env, auth.user.id, {
    sessionId: body.sessionId,
    turnId: body.turnId as string | undefined,
    providerId: body.providerId as string | undefined,
    type: body.type,
    metadata: body.metadata,
    raw: body.raw,
  })
  return new Response(null, { status: captured ? 202 : 204, headers: { 'Cache-Control': 'no-store' } })
}

export async function handleAdminDiagnostics(
  request: Request,
  env: DiagnosticEnv,
  verifyUser: VerifyUser,
  verifySiteAdmin: VerifySiteAdmin,
): Promise<Response> {
  const auth = await requireOwner(env, request, verifyUser)
  if ('error' in auth) return jsonResponse({ error: auth.error }, auth.status, request)
  if (!await verifySiteAdmin(env, request)) return jsonResponse({ error: 'Forbidden' }, 403, request)

  if (request.method === 'DELETE') {
    const scope = new URL(request.url).searchParams.get('scope')
    const filter = scope === 'expired'
      ? `expires_at=lt.${encodeURIComponent(new Date().toISOString())}`
      : `user_id=eq.${encodeURIComponent(auth.user.id)}`
    await supabaseDelete(env, `diagnostic_payloads?${filter}`)
    const deleted = await supabaseDelete(env, `diagnostic_events?${filter}`)
    await supabaseInsert(env, 'diagnostic_access_audit', { operator_user_id: auth.user.id, action: `delete_${scope === 'expired' ? 'expired' : 'all'}` })
    return new Response(null, { status: deleted.ok ? 204 : 502, headers: { 'Cache-Control': 'no-store' } })
  }
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)

  const session = new URL(request.url).searchParams.get('session')
  const sessionFilter = session && validOpaqueId(session) ? `&session_id=eq.${encodeURIComponent(session)}` : ''
  const events = await supabaseGet(env, `diagnostic_events?user_id=eq.${encodeURIComponent(auth.user.id)}${sessionFilter}&select=id,session_id,turn_id,provider_id,event_type,metadata,created_at,expires_at&order=created_at.asc&limit=1000`)
  if (!events.ok) return jsonResponse({ error: 'Could not read diagnostics' }, 502, request)
  const rows = await events.json()
  let payloads: unknown[] | undefined
  if (new URL(request.url).searchParams.get('includeRaw') === '1') {
    const rawResponse = await supabaseGet(env, `diagnostic_payloads?user_id=eq.${encodeURIComponent(auth.user.id)}&select=event_id,payload,created_at,expires_at&order=created_at.asc&limit=1000`)
    if (!rawResponse.ok) return jsonResponse({ error: 'Could not read diagnostic payloads' }, 502, request)
    payloads = await rawResponse.json() as unknown[]
  }
  await supabaseInsert(env, 'diagnostic_access_audit', { operator_user_id: auth.user.id, action: 'read', session_id: session || null })
  return jsonResponse(payloads ? { events: rows, payloads } : { events: rows }, 200, request)
}
