import { supabase } from '../services/supabase'

/**
 * Whether the signed-in reader is a site admin (public.site_admins, the table the Worker's verifySiteAdmin and
 * /admin/metrics use; its RLS lets a user read only their own row). Admin-only try-outs read the
 * cached answer synchronously at first paint, so the reader never switches surface mid-read; the check refreshes
 * the cache for the next visit. The cache holds only the user id, never a name or email, and counts only while
 * that user is the one signed in on this device.
 */
const KEY = 'tinct-site-admin'

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function store(): Store | null {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}

export function cachedSiteAdmin(userId: string | null | undefined, storage: Store | null = store()): boolean {
  if (!userId) return false
  try { return storage?.getItem(KEY) === userId } catch { return false }
}

export function rememberSiteAdmin(userId: string, admin: boolean, storage: Store | null = store()): void {
  try {
    if (admin) storage?.setItem(KEY, userId)
    else if (storage?.getItem(KEY) === userId) storage?.removeItem(KEY)
  } catch { /* storage blocked: the try-out stays off */ }
}

/** Ask Supabase once per signed-in user and keep the answer for the next visit. */
export async function refreshSiteAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('site_admins').select('user_id').eq('user_id', userId).maybeSingle()
    if (error) return cachedSiteAdmin(userId)
    const admin = Boolean(data)
    rememberSiteAdmin(userId, admin)
    return admin
  } catch {
    return cachedSiteAdmin(userId)
  }
}
