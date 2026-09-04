export type SupabaseEnv = {
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export async function supabaseGet(env: SupabaseEnv, path: string) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  })
}

export async function supabaseRpc(env: SupabaseEnv, fn: string, params: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: JSON.stringify(params),
  })
}

export async function supabaseUpdate(env: SupabaseEnv, table: string, id: string, data: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}

export async function supabaseInsert(env: SupabaseEnv, table: string, data: Record<string, unknown>) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  })
}

export async function supabaseDelete(env: SupabaseEnv, path: string) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'return=minimal',
    },
  })
}
