import { nativeEntryDestination } from '../utils/nativeEntry'
import { nativeAuthStorage } from '../utils/nativeAuthStorage'
import { isNativeCapacitor } from '../utils/nativePlatform'
import { installNativeAuth } from '../utils/nativeAuth'
import { createClient, navigatorLock, type SupabaseClient } from '@supabase/supabase-js'
import { createBrowserAuthStorage } from './browserAuthStorage'
import { serializeBrowserAuthLock } from './browserAuthLock'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // A burst of same-tab requests must not time out and steal from one
      // another while the reader is rendering a large imported book. Retain
      // the SDK's native cross-tab exclusion and acquisition timeout.
      ...(!isNativeCapacitor() && typeof navigator !== 'undefined' && navigator.locks
        ? { lock: serializeBrowserAuthLock(navigatorLock) } : {}),
      detectSessionInUrl: !isNativeCapacitor(),
      ...(isNativeCapacitor() ? { flowType: 'pkce' as const } : {}),
      storage: isNativeCapacitor() ? nativeAuthStorage : typeof window !== 'undefined' ? createBrowserAuthStorage(window.localStorage) : undefined,
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
