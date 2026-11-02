/**
 * A provider's first authenticated session is created with the account. An email code is different: Supabase makes
 * the account when the code is sent, and the reader may take minutes to type it, so a code sign-in passes the
 * code's own lifetime as the window (onboarding v3).
 */
export function isInitialAccountSession(user: { created_at?: string; last_sign_in_at?: string }, windowMs = 60_000): boolean {
  const created = Date.parse(user.created_at || '')
  const signedIn = Date.parse(user.last_sign_in_at || '')
  return Number.isFinite(created) && Number.isFinite(signedIn)
    && signedIn >= created && signedIn - created < windowMs
}

/** An email code lives 10 minutes (Supabase OTP expiry, 600 s); a little more covers a slow sign-in. */
export const EMAIL_CODE_NEW_ACCOUNT_WINDOW_MS = 15 * 60_000

/** Kept separate so navigation can be asserted without touching real accounts. */
export function navigateAfterAuth(destination: string, replace = false): void {
  if (replace) window.location.replace(destination)
  else window.location.assign(destination)
}
