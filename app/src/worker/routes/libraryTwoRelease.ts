/** Public rollout is deliberately off until Anders says go. */
export const LIBRARY_TWO_DEFAULT = false

/** A reviewer's opt-in follows them back from the reader; everyone else keeps
 * the existing library. Cookies grant no authentication or account access. */
export function libraryEntryPath(cookie: string | null, promoted = LIBRARY_TWO_DEFAULT): '/lab/' | '/lab/library_2/' {
  return promoted || /(?:^|;\s*)tinct_library_preview=1(?:;|$)/.test(cookie || '') ? '/lab/library_2/' : '/lab/'
}
