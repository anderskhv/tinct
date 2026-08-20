export const TINCT_AUTH_COOKIE = 'tinct_auth'

export function hasSignedInCookie(cookie = typeof document !== 'undefined' ? document.cookie : ''): boolean {
  return (cookie || '').split(';').some(part => part.trim() === `${TINCT_AUTH_COOKIE}=1`)
}

export function signedInCookieSetValue(): string {
  return `${TINCT_AUTH_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
}

export function signedInCookieClearValues(): string[] {
  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT'
  return [
    `${TINCT_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`,
    `${TINCT_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`,
    `${TINCT_AUTH_COOKIE}=; Path=/; Expires=${expired}; SameSite=Lax; Secure`,
    `${TINCT_AUTH_COOKIE}=; Path=/; Expires=${expired}; SameSite=Lax`,
  ]
}

export function setSignedInCookie(): void {
  if (typeof document === 'undefined') return
  try {
    document.cookie = signedInCookieSetValue()
  } catch { /* ignore */ }
}

export function clearSignedInCookie(): void {
  if (typeof document === 'undefined') return
  for (const value of signedInCookieClearValues()) {
    try {
      document.cookie = value
    } catch { /* ignore */ }
  }
}
