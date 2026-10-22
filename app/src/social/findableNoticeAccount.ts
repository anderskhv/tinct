/**
 * The account side of the findable-profiles notice (findableNotice.ts): a
 * `findableNoticeSeen: true` field in the account's existing `preferences`
 * row in user_data, read and merged like the voice choice
 * (lab/useVoicePersonaSync.ts) and written through the versioned
 * `commit_user_data` RPC, so other fields in the row are kept.
 */
import { supabase } from '../services/supabase'
import { versionedWriteApplied } from '../services/supabaseStorage.versioning'

export const FINDABLE_NOTICE_PREF = 'findableNoticeSeen'

type PreferencesRow = { value: Record<string, unknown> | null; rev: number | null; applied?: boolean | null; conflict?: boolean | null }

async function readPreferences(userId: string): Promise<PreferencesRow> {
  if (!supabase) return { value: null, rev: null }
  const { data, error } = await supabase.from('user_data').select('value,rev').eq('user_id', userId).eq('key', 'preferences').maybeSingle()
  if (error) throw error
  return (data ?? { value: null, rev: null }) as PreferencesRow
}

/** Whether the account has seen the notice. Without Supabase there is no account to ask: not seen. Throws when the read fails. */
export async function readAccountNoticeSeen(userId: string): Promise<boolean> {
  const row = await readPreferences(userId)
  return row.value?.[FINDABLE_NOTICE_PREF] === true
}

/** Marks it seen in the account; true once the account has it. */
export async function writeAccountNoticeSeen(userId: string): Promise<boolean> {
  if (!supabase) return false
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const row = await readPreferences(userId)
    const value = row.value && typeof row.value === 'object' ? row.value : {}
    if (value[FINDABLE_NOTICE_PREF] === true) return true
    const { data, error } = await supabase.rpc('commit_user_data', {
      p_user_id: userId,
      p_key: 'preferences',
      p_value: { ...value, [FINDABLE_NOTICE_PREF]: true },
      p_expected_rev: typeof row.rev === 'number' ? row.rev : null,
    })
    if (error) return false
    if (versionedWriteApplied((Array.isArray(data) ? data[0] : data) as PreferencesRow | null)) return true
  }
  return false
}
