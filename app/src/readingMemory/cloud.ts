import { supabase } from '../services/supabase'
import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'
import { READING_MEMORY_CLOUD_KEY } from './deviceStore'
import type { CloudCommitResult, ReadingMemoryCloud, VersionedCloudRow } from './queue'
import { emptyReadingMemory, parseReadingMemory } from './sessions'
import type { ReadingMemoryState } from './types'

type SupabaseLike = NonNullable<typeof supabase>

function rowFromVersioned(row: VersionedStorageRow | null | undefined): VersionedCloudRow | null {
  if (!row) return null
  const rev = coerceRev(row.rev) ?? 0
  // A tombstone (value: null) reads as an empty memory at the server's rev,
  // so the next commit carries the right expected rev.
  if (row.value === null || row.value === undefined) return { state: emptyReadingMemory(), rev }
  return { state: parseReadingMemory(row.value), rev }
}

/**
 * Signed-in copy of the reading memory in `public.user_data` under the key
 * `reading-memory`, written through the versioned `commit_user_data` RPC
 * with an expected rev. A conflict returns the server row instead of
 * overwriting it; clearing writes a `null` tombstone so other devices see
 * the deletion.
 */
export function createSupabaseReadingMemoryCloud(userId: string, client: SupabaseLike | null = supabase): ReadingMemoryCloud | null {
  if (!client) return null
  return {
    async read() {
      const { data, error } = await client
        .from('user_data')
        .select('key, value, rev')
        .eq('user_id', userId)
        .eq('key', READING_MEMORY_CLOUD_KEY)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!data) return null
      return rowFromVersioned(data as VersionedStorageRow)
    },
    async commit(state: ReadingMemoryState | null, expectedRev: number | null): Promise<CloudCommitResult> {
      const { data, error } = await client.rpc('commit_user_data', {
        p_user_id: userId,
        p_key: READING_MEMORY_CLOUD_KEY,
        p_value: state,
        p_expected_rev: expectedRev ?? null,
      })
      if (error) throw new Error(error.message)
      const row = (Array.isArray(data) ? data[0] : data) as VersionedStorageRow | undefined
      const applied = versionedWriteApplied(row)
      return {
        applied,
        conflict: !applied && row?.conflict === true,
        row: rowFromVersioned(row),
      }
    },
  }
}

/** Tombstone delete of the signed-in memory (value: null through commit_user_data). */
export async function clearCloudReadingMemory(userId: string, client: SupabaseLike | null = supabase): Promise<boolean> {
  const cloud = createSupabaseReadingMemoryCloud(userId, client)
  if (!cloud) return false
  try {
    const row = await cloud.read()
    const result = await cloud.commit(null, row?.rev ?? null)
    return result.applied
  } catch {
    return false
  }
}
