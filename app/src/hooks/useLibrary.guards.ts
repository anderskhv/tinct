export type LibraryWriteMode = 'add' | 'remove' | 'replace'

export interface StoreOpenState {
  wasInLibrary: boolean
  hasProgress: boolean
}

function unique(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(id => typeof id === 'string' && id.length > 0)))
}

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

/**
 * Protect add writes from stale-device overwrites.
 *
 * Adding a book should never drop an existing cloud/cache library entry. A
 * deliberate remove still writes the smaller set, because removal is a real
 * user action.
 */
export function resolveLibraryWrite(existing: string[] | null | undefined, next: string[], mode: LibraryWriteMode): string[] {
  const normalizedNext = unique(next)
  // `replace` is emitted by passive React persistence. It is not evidence of
  // a user intentionally removing books, so it must not shrink a newer cloud
  // library held by this stale device.
  if (mode === 'remove') return normalizedNext
  return unique([...(existing || []), ...normalizedNext])
}

export function shouldSkipInitialLibraryWrite(existing: string[] | null | undefined, next: string[]): boolean {
  return sameIds(unique(existing || []), unique(next))
}

export function shouldAdoptInitialLibraryFromStorage(
  existing: string[] | null | undefined,
  next: string[],
  mode: LibraryWriteMode,
): boolean {
  return mode === 'replace' && Array.isArray(existing) && !sameIds(unique(existing), unique(next))
}

/**
 * Opening a not-yet-added book whose store card has no visible progress is a
 * fresh-start action. It must not restore a stale hidden `position:*` row.
 */
export function shouldStartFreshFromStoreOpen(state: StoreOpenState): boolean {
  return !state.wasInLibrary && !state.hasProgress
}
