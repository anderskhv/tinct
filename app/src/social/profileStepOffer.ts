/**
 * The profile step is offered once per account (Anders, 15 Oct and 9 Nov 2026).
 *
 * Skip on "Your profile" records the offer on the account (POST /api/profile
 * { prompted: true } sets prompted_at; no profile choice is saved, so the
 * name, picture and visibility stay as they were), and the library offers the
 * step only while the profile says shouldPrompt (never set up, never
 * offered). Showing the step also leaves this device mark, which covers
 * leaving the step without Skip or Continue; sign-out wipes it with the rest
 * of the tinct: keys.
 */
export const LEGACY_SETUP_KEY_PREFIX = 'tinct:profile-flow-offered-20261026:'

export function markProfileStepOffered(userId: string | null | undefined, storage: Storage | null = safeLocalStorage()): void {
  if (!userId || !storage) return
  try { storage.setItem(LEGACY_SETUP_KEY_PREFIX + userId, '1') } catch { /* private mode */ }
}

export function profileStepOfferedHere(userId: string, storage: Storage | null = safeLocalStorage()): boolean {
  try { return storage?.getItem(LEGACY_SETUP_KEY_PREFIX + userId) != null } catch { return true }
}

function safeLocalStorage(): Storage | null {
  try { return window.localStorage } catch { return null }
}
