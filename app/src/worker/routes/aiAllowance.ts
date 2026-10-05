/**
 * GET /api/ai-allowance (signed-in): the reader's own usage bar.
 *
 * Switch off: `{ enabled: false }` and nothing is read, so the client shows
 * no bar. On: `{ enabled: true, usedFraction, state, resetsAt, hasTopUp }`.
 * Never a currency or an amount.
 */
import { createAllowanceGate, type AllowanceGate } from '../lib/aiAllowance'
import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { SupabaseEnv } from '../lib/supabase'

export async function handleAiAllowance<E extends SupabaseEnv>(
  request: Request,
  env: E,
  verifyUser: (env: E, request: Request) => Promise<{ id: string } | null>,
  gate: AllowanceGate = createAllowanceGate(env),
): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  const user = await verifyUser(env, request)
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401, request)
  if (!isValidUUID(user.id)) return jsonResponse({ error: 'Invalid user' }, 400, request)
  if (!gate.enforced) return noStore(jsonResponse({ enabled: false }, 200, request))
  const view = await gate.load(user.id)
  if (!view) return jsonResponse({ error: 'Usage unavailable' }, 503, request)
  // Whitelisted copy: only these four fields ever leave the Worker.
  return noStore(jsonResponse({
    enabled: true,
    usedFraction: view.usedFraction,
    state: view.state,
    resetsAt: view.resetsAt,
    hasTopUp: view.hasTopUp,
  }, 200, request))
}

function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store')
  return response
}
