/**
 * Signed links in lifecycle emails: one-click unsubscribe and one-click email
 * confirmation. HMAC-SHA256 with the Worker secret EMAIL_LINK_SECRET; without
 * the secret no link can be made, so no opt-in or welcome email goes out.
 *
 * Token: base64url(JSON payload) "." base64url(signature).
 * - unsubscribe: { p: 'u', u: userId } — never expires (old emails keep working);
 * - confirm:     { p: 'c', u: userId, e: first 16 hex of SHA-256(email), x: expiry ms }
 *   — bound to the address it was sent to, valid 30 days.
 */

export const EMAIL_ORIGIN = 'https://tinct.app'
export const CONFIRM_TTL_MS = 30 * 24 * 3600 * 1000

type Purpose = 'u' | 'c'
export interface LinkPayload { p: Purpose; u: string; e?: string; x?: number }

const encoder = new TextEncoder()

function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null
  try {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4))
    return Uint8Array.from(binary, char => char.charCodeAt(0))
  } catch {
    return null
  }
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function emailHash(email: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(email.trim().toLowerCase())))
  return [...digest.slice(0, 8)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function signLink(secret: string, payload: LinkPayload): Promise<string> {
  const body = base64url(encoder.encode(JSON.stringify(payload)))
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(body)))
  return `${body}.${base64url(signature)}`
}

export async function verifyLink(secret: string, token: string | null | undefined, purpose: Purpose, now = Date.now()): Promise<LinkPayload | null> {
  if (!secret || !token || token.length > 512) return null
  const [body, sig, extra] = token.split('.')
  if (!body || !sig || extra !== undefined) return null
  const signature = fromBase64url(sig)
  const raw = fromBase64url(body)
  if (!signature || !raw) return null
  // crypto.subtle.verify compares in constant time.
  if (!await crypto.subtle.verify('HMAC', await key(secret), signature as Uint8Array<ArrayBuffer>, encoder.encode(body))) return null
  let payload: LinkPayload
  try { payload = JSON.parse(new TextDecoder().decode(raw)) } catch { return null }
  if (!payload || payload.p !== purpose || typeof payload.u !== 'string' || !/^[0-9a-f-]{36}$/i.test(payload.u)) return null
  if (purpose === 'c' && (typeof payload.x !== 'number' || payload.x < now || typeof payload.e !== 'string')) return null
  return payload
}

export async function unsubscribeUrl(secret: string, userId: string): Promise<string> {
  return `${EMAIL_ORIGIN}/unsubscribe?t=${await signLink(secret, { p: 'u', u: userId })}`
}

export async function confirmUrl(secret: string, userId: string, email: string, now = Date.now()): Promise<string> {
  return `${EMAIL_ORIGIN}/confirm?t=${await signLink(secret, { p: 'c', u: userId, e: await emailHash(email), x: now + CONFIRM_TTL_MS })}`
}

/** Gmail/Yahoo bulk-sender headers (RFC 2369 + RFC 8058 one-click). */
export function unsubscribeHeaders(url: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${url}>, <mailto:contact@tinct.app?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}
