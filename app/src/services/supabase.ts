import { nativeEntryDestination } from '../utils/nativeEntry'
import { nativeAuthStorage } from '../utils/nativeAuthStorage'
import { isNativeCapacitor } from '../utils/nativePlatform'
import { installNativeAuth } from '../utils/nativeAuth'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: !isNativeCapacitor(),
      ...(isNativeCapacitor() ? { flowType: 'pkce' as const } : {}),
      storage: isNativeCapacitor() ? nativeAuthStorage : typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })
}

export const supabase = createSupabaseClient()
// The native root immediately redirects to the bundled library. Starting an
// async callback handler on that outgoing document creates competing redirects
// with the library/account page that is already loading.
if (supabase && isNativeCapacitor() && !nativeEntryDestination(true, window.location.pathname)) void installNativeAuth(supabase).catch(() => { /* Starting sign-in retries and displays failure. */ })

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
