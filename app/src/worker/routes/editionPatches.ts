import { jsonResponse } from '../lib/responses'
import type { SupabaseEnv } from '../lib/supabase'

export type EditionPatchesEnv = SupabaseEnv & {
  RATE_LIMIT?: KVNamespace
}

export async function handleEditionPatches(
  request: Request,
  env: EditionPatchesEnv,
  checkRateLimit: (key: string, kv?: KVNamespace, maxRequests?: number) => Promise<boolean>,
): Promise<Response> {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return jsonResponse([], 200, request)

  const url = new URL(request.url)
  const bookId = url.searchParams.get('bookId') || ''
  const editionKey = url.searchParams.get('editionKey') || ''
  if (!bookId || !editionKey) return jsonResponse([], 200, request)

  // Whitelist bookId/editionKey to prevent injection via the `eq.` filter.
  if (!/^[a-z0-9-]{1,64}$/i.test(bookId) || !/^[a-z0-9-]{1,32}$/i.test(editionKey)) {
    return jsonResponse([], 200, request)
  }

  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown'
  if (!await checkRateLimit(`patches:${clientIP}`, env.RATE_LIMIT, 30)) {
    return jsonResponse({ error: 'Rate limit exceeded' }, 429, request)
  }

  // Live text corrections are retired (decided 18 Nov 2026): the edition files are the
  // text. Older clients still ask, so answer an empty list without touching the database.
  return jsonResponse([], 200, request)
}
