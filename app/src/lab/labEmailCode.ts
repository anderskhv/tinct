/**
 * Signing in with an email code (onboarding v3, approved 2 Nov 2026): Supabase `signInWithOtp` sends a 6-digit code
 * (the "Magic Link" template's {{ .Token }}) and `verifyOtp` turns it into a session. The code also proves the
 * address, so the Worker records it as confirmed (routes/profiles.ts sessionProvedEmail).
 */

/** Digits in a code. Must match Authentication › Providers › Email › "Email OTP length" in Supabase. */
export const EMAIL_CODE_LENGTH = 6
/** How long "Send a new code" waits after a code was sent. */
export const EMAIL_CODE_RESEND_SECONDS = 30

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/** "Open Gmail" is offered only for a Gmail address. */
export function isGmailAddress(value: string): boolean {
  return /@(gmail|googlemail)\.com$/i.test(value.trim())
}

/**
 * Tinct's own words for what Supabase answers about codes; null leaves any other error to the general message.
 * Never says whether an address has an account.
 */
export function emailCodeErrorMessage(error: unknown): string | null {
  const value = error as { status?: unknown; code?: unknown; message?: unknown } | null
  const code = typeof value?.code === 'string' ? value.code : ''
  const message = typeof value?.message === 'string' ? value.message.toLowerCase() : ''
  if (value?.status === 429 || code.includes('rate_limit') || message.includes('rate limit') || message.includes('security purposes')) {
    return 'Too many codes for now. Wait a minute, then ask for a new one.'
  }
  if (code === 'otp_expired' || message.includes('expired')) return 'That code has expired. Send a new one.'
  if (code === 'otp_disabled' || message.includes('signups not allowed for otp')) return 'We could not send a code to that address. Check it, or continue with Google.'
  if (message.includes('token') && (message.includes('invalid') || message.includes('not found'))) return 'That code did not work. Check it, or send a new one.'
  if (code === 'validation_failed' || message.includes('invalid format') || message.includes('unable to validate email')) return 'Please check your email address.'
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'That email and password do not match. You can also sign in with an email code.'
  return null
}
