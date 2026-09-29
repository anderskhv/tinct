/** A provider's first authenticated session is created with the account. */
export function isInitialAccountSession(user: { created_at?: string; last_sign_in_at?: string }): boolean {
  const created = Date.parse(user.created_at || '')
  const signedIn = Date.parse(user.last_sign_in_at || '')
  return Number.isFinite(created) && Number.isFinite(signedIn)
    && signedIn >= created && signedIn - created < 60_000
}

/** Kept separate so navigation can be asserted without touching real accounts. */
export function navigateAfterAuth(destination: string): void {
  window.location.assign(destination)
}
