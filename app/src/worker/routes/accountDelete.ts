/**
 * The reader's own Delete account (Settings → Account), Anders 2026-10-09:
 * "Ideally right away in the app".
 *
 *   POST /api/account/delete   { "confirm": "delete-my-account", "userId": "<own id>" }
 *
 * Signed in only, and only for the caller's own account: the body must carry
 * the confirmation phrase and the caller's own id, so a stray or replayed
 * request (a prefetch, a wrong tab after switching accounts) deletes nothing.
 * Rate-limited like other sensitive routes.
 *
 * Deletion itself is the admin erasure (adminAccounts.ts deleteAccountData):
 * every per-user store in order, each step idempotent, an active Stripe
 * subscription cancelled at once (no refund) and the customer deleted, the auth
 * user last and only after everything else succeeded. A failed run leaves the
 * account in place, so the reader can simply try again.
 */
import { corsHeaders } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import type { CheckRateLimit } from '../lib/rateLimit'
import { deleteAccountData, resolveAccount, type Account, type AdminAccountsEnv } from './adminAccounts'

export const ACCOUNT_DELETE_PATH = '/api/account/delete'
export const ACCOUNT_DELETE_CONFIRM = 'delete-my-account'
/** Requests per minute per account. */
export const ACCOUNT_DELETE_PER_MINUTE = 3

export interface AccountDeleteDeps {
  verifyUser: (request: Request) => Promise<{ id: string; email?: string | null } | null>
  checkRateLimit: CheckRateLimit
}

function reply(data: unknown, status: number, request: Request): Response {
  return Response.json(data, { status, headers: { ...corsHeaders(request), 'Cache-Control': 'no-store' } })
}

export async function handleAccountDelete(request: Request, env: AdminAccountsEnv, deps: AccountDeleteDeps): Promise<Response> {
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, request)
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return reply({ error: 'Not configured' }, 500, request)
  const user = await deps.verifyUser(request)
  if (!user || !isValidUUID(user.id)) return reply({ error: 'Unauthorized' }, 401, request)
  if (!await deps.checkRateLimit(`account-delete:${user.id}`, undefined, ACCOUNT_DELETE_PER_MINUTE)) return reply({ error: 'rate_limited' }, 429, request)

  let body: Record<string, unknown> | null = null
  try {
    const parsed = await request.json()
    body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch { /* invalid below */ }
  if (!body || body.confirm !== ACCOUNT_DELETE_CONFIRM) return reply({ error: 'confirmation_required' }, 400, request)
  if (body.userId !== user.id) return reply({ error: 'wrong_account' }, 400, request)

  const resolved = await resolveAccount(env, { userId: user.id })
  let account: Account
  if ('error' in resolved) {
    if (resolved.status !== 404) return reply({ ok: false, deleted: false, error: 'deletion_failed' }, 502, request)
    account = { userId: user.id, email: null, authUser: null, profile: null }
  } else account = resolved.account

  const result = await deleteAccountData(env, account, 'account_self_delete')
  if (result.ok) return reply({ ok: true, deleted: true }, 200, request)
  // The auth user is gone but a final sweep failed: the account no longer
  // exists for the reader (they cannot retry), so the operator re-runs the
  // admin delete for the leftovers. The full id of the deleted account is
  // logged for that, and only in this case (docs/account-deletion.md).
  if (result.authGone) {
    console.log(JSON.stringify({ event: 'account_self_delete_incomplete', userId: user.id, failed: result.steps.filter(s => s.status === 'failed').map(s => s.step) }))
    return reply({ ok: false, deleted: true }, 200, request)
  }
  return reply({ ok: false, deleted: false, error: 'deletion_failed' }, 500, request)
}
