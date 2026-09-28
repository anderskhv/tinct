/** Public rollout approved by Anders on 2026-09-28. Set false for rollback. */
export const LIBRARY_TWO_DEFAULT = true

/** Preview opt-in remains available during rollback. This cookie grants no
 * authentication or account access. */
export function libraryEntryPath(cookie: string | null, promoted = LIBRARY_TWO_DEFAULT): '/lab/' | '/lab/library_2/' {
  return promoted || /(?:^|;\s*)tinct_library_preview=1(?:;|$)/.test(cookie || '') ? '/lab/library_2/' : '/lab/'
}
