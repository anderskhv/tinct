import { jsonResponse } from '../lib/responses'
import { isValidUUID } from '../lib/security'
import { supabaseGet, type SupabaseEnv } from '../lib/supabase'

type VerifiedUser = { id: string; email: string }
type VerifyUser = (env: IssueStatusEnv, request: Request) => Promise<VerifiedUser | null>

export type IssueStatusEnv = SupabaseEnv

export async function handleReportStatus(request: Request, env: IssueStatusEnv): Promise<Response> {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id || !isValidUUID(id) || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ status: 'unknown' }, 200, request)
  }
  try {
    const res = await supabaseGet(env, `issue_reports?id=eq.${id}&select=status`)
    const rows = await res.json() as { status: string }[]
    return jsonResponse({ status: rows?.[0]?.status || 'unknown' }, 200, request)
  } catch {
    return jsonResponse({ status: 'unknown' }, 200, request)
  }
}

export async function handleFixesCount(
  request: Request,
  env: IssueStatusEnv,
  verifyUser: VerifyUser,
): Promise<Response> {
  try {
    const user = await verifyUser(env, request)
    if (!user) return jsonResponse({ count: 0 }, 200, request)
    const res = await supabaseGet(env, `issue_reports?user_id=eq.${user.id}&status=eq.confirmed&rewarded=eq.true&select=id`)
    const rows = await res.json() as { id: string }[]
    return jsonResponse({ count: rows?.length || 0 }, 200, request)
  } catch {
    return jsonResponse({ count: 0 }, 200, request)
  }
}
