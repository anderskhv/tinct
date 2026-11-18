/**
 * Whether a Supabase auth event means the library page is signed in (true),
 * signed out (false), or should keep what it shows (null). A null session is a
 * sign-out only when Supabase says so (SIGNED_OUT) or when the browser holds no
 * session at all: INITIAL_SESSION can be null while a refresh is still pending
 * or another tab holds the auth lock, and clearing the page's signed-in class
 * then sent the picture's tap to the sign-in page and back (11 Oct 2026).
 */
export function libraryAuthSignedIn(event: string, session: { user?: unknown } | null | undefined, stored: boolean): boolean | null {
  if (session?.user) return true
  if (event === 'SIGNED_OUT' || !stored) return false
  return null
}
