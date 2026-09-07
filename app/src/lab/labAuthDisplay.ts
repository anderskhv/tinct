/** Display helpers for signed-in chrome, shared by the library header and the reader (no side effects). */

export type UserLike = { email?: string | null; user_metadata?: Record<string, unknown> | null } | null | undefined

/** Short display name: first name from profile metadata, else the email's local part. */
export function displayNameFor(user: UserLike): string | null {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const candidates = [metadata.full_name, metadata.name, metadata.given_name, metadata.first_name]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim().split(/\s+/)[0]
  }
  const local = typeof user.email === 'string' ? user.email.split('@')[0].trim() : ''
  return local || null
}

/** The account glyph's letter: the first letter of the display name. */
export function accountInitial(name: string | null): string {
  const first = (name ?? '').trim().charAt(0)
  return first ? first.toLocaleUpperCase() : ''
}
