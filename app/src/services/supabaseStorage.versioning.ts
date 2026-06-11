export type VersionedStorageRow = {
  key: string
  value: unknown
  rev?: number | null
  updated_at?: string | null
  applied?: boolean | null
  conflict?: boolean | null
}

export type SupabaseLikeError = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export function shouldFallbackToLegacyUserDataWrite(error: SupabaseLikeError | null | undefined): boolean {
  if (!error) return false
  const text = `${error.code ?? ''} ${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase()
  return (
    text.includes('commit_user_data') ||
    text.includes('function') && text.includes('not found') ||
    text.includes('could not find the function') ||
    text.includes('column') && text.includes('rev') && text.includes('does not exist') ||
    error.code === '42703' ||
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    error.code === 'PGRST204'
  )
}

export function coerceRev(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return Math.floor(raw)
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed)
  }
  return undefined
}

export function versionedWriteApplied(row: VersionedStorageRow | null | undefined): boolean {
  return !!row && row.applied !== false && row.conflict !== true
}
