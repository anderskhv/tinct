/**
 * Local verification of Supabase access tokens (asymmetric signing keys).
 *
 * The project signs sessions with ES256 and publishes the public keys at
 * `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`. Verifying here saves the
 * `/auth/v1/user` round trip on almost every request.
 *
 * Verdicts:
 * - `user`: signature, expiry, audience, issuer and subject all hold.
 * - `invalid`: the token is definitely not a signed-in user's (bad signature,
 *   expired, wrong audience or issuer, `alg: none`, malformed body).
 * - `unknown`: local verification is impossible (HS256 or another algorithm,
 *   unreadable header, JWKS unreachable, key id not published). The caller
 *   asks Supabase instead, exactly as before.
 *
 * Workers rule: only completed data is shared between requests. A JWKS fetch
 * in flight belongs to its own request and is never awaited by another one.
 */

export type LocalJwtVerdict =
  | { kind: 'user'; user: { id: string; email: string } }
  | { kind: 'invalid' }
  | { kind: 'unknown' }

const JWKS_TTL_MS = 10 * 60_000
/** An unknown key id refetches the JWKS at most this often per isolate. */
const JWKS_MIN_REFETCH_MS = 30_000
/** After a failed JWKS fetch, requests go straight to Supabase this long. */
const JWKS_FAILURE_BACKOFF_MS = 30_000
const JWKS_TIMEOUT_MS = 5_000
const EXP_LEEWAY_S = 30

type Jwk = { kty?: string; kid?: string; alg?: string; crv?: string; use?: string; key_ops?: string[]; [k: string]: unknown }
type KeyEntry = { alg: 'ES256' | 'RS256'; key: CryptoKey }
type JwksState = { fetchedAt: number; keys: Map<string, KeyEntry> }

const jwksBySite = new Map<string, JwksState>()
const jwksFailedAt = new Map<string, number>()

export function resetJwksCacheForTest(): void {
  jwksBySite.clear()
  jwksFailedAt.clear()
}

const B64URL = /^[A-Za-z0-9_-]*$/

function base64UrlBytes(part: string): Uint8Array<ArrayBuffer> | null {
  if (!B64URL.test(part)) return null
  try {
    const bin = atob(part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (part.length % 4)) % 4))
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

function base64UrlJson(part: string): Record<string, unknown> | null {
  const bytes = base64UrlBytes(part)
  if (!bytes) return null
  try {
    const value = JSON.parse(new TextDecoder().decode(bytes)) as unknown
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
  } catch {
    return null
  }
}

/** The algorithm a published key is for, from its own type: never from the token. */
function keyAlgorithm(jwk: Jwk): KeyEntry['alg'] | null {
  if (jwk.use !== undefined && jwk.use !== 'sig') return null
  if (Array.isArray(jwk.key_ops) && !jwk.key_ops.includes('verify')) return null
  if (jwk.kty === 'EC' && jwk.crv === 'P-256' && (jwk.alg === undefined || jwk.alg === 'ES256')) return 'ES256'
  if (jwk.kty === 'RSA' && (jwk.alg === undefined || jwk.alg === 'RS256')) return 'RS256'
  return null
}

async function importKey(jwk: Jwk, alg: KeyEntry['alg']): Promise<CryptoKey> {
  // Only the public members: a published private member must never be used.
  const publicJwk: JsonWebKey = alg === 'ES256'
    ? { kty: 'EC', crv: 'P-256', x: jwk.x as string, y: jwk.y as string, ext: true }
    : { kty: 'RSA', n: jwk.n as string, e: jwk.e as string, ext: true }
  const algorithm = alg === 'ES256' ? { name: 'ECDSA', namedCurve: 'P-256' } : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
  return crypto.subtle.importKey('jwk', publicJwk, algorithm, false, ['verify'])
}

/** Fetches and imports this request's own copy of the JWKS; null when unreachable or unusable. */
async function fetchJwks(supabaseUrl: string, now: number): Promise<JwksState | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), JWKS_TIMEOUT_MS)
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`, { signal: controller.signal })
    if (!res.ok) return null
    const body = await res.json() as { keys?: unknown }
    if (!body || !Array.isArray(body.keys)) return null
    const keys = new Map<string, KeyEntry>()
    for (const raw of body.keys as Jwk[]) {
      if (!raw || typeof raw.kid !== 'string' || !raw.kid) continue
      const alg = keyAlgorithm(raw)
      if (!alg) continue
      try {
        keys.set(raw.kid, { alg, key: await importKey(raw, alg) })
      } catch {
        // A key that does not import is skipped; the others still verify.
      }
    }
    return { fetchedAt: now, keys }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function findKey(supabaseUrl: string, kid: string, now: number): Promise<KeyEntry | 'unavailable' | 'not-found'> {
  let state = jwksBySite.get(supabaseUrl)
  const fresh = state && now - state.fetchedAt < JWKS_TTL_MS
  const hit = fresh ? state!.keys.get(kid) : undefined
  if (hit) return hit
  // A stale JWKS, or a fresh one without this kid (rotation): fetch once,
  // but an unknown kid does not refetch more often than JWKS_MIN_REFETCH_MS.
  if (fresh && now - state!.fetchedAt < JWKS_MIN_REFETCH_MS) return 'not-found'
  const failedAt = jwksFailedAt.get(supabaseUrl)
  if (failedAt !== undefined && now - failedAt < JWKS_FAILURE_BACKOFF_MS) return 'unavailable'
  const fetched = await fetchJwks(supabaseUrl, now)
  if (!fetched) {
    jwksFailedAt.set(supabaseUrl, now)
    return 'unavailable'
  }
  jwksFailedAt.delete(supabaseUrl)
  jwksBySite.set(supabaseUrl, fetched)
  state = fetched
  return state.keys.get(kid) ?? 'not-found'
}

function audienceOk(aud: unknown): boolean {
  if (aud === 'authenticated') return true
  return Array.isArray(aud) && aud.includes('authenticated')
}

export async function verifySupabaseJwtLocally(supabaseUrl: string, token: string, now = Date.now()): Promise<LocalJwtVerdict> {
  const parts = token.split('.')
  if (parts.length !== 3) return { kind: 'unknown' }
  const header = base64UrlJson(parts[0])
  if (!header) return { kind: 'unknown' }
  const alg = header.alg
  // `none` in any spelling is never a signed-in user.
  if (typeof alg !== 'string' || alg.toLowerCase() === 'none') return { kind: 'invalid' }
  // HS256 (the legacy secret, e.g. the anon key) and anything else: Supabase decides.
  if (alg !== 'ES256' && alg !== 'RS256') return { kind: 'unknown' }
  if (typeof header.kid !== 'string' || !header.kid) return { kind: 'unknown' }
  if (header.crit !== undefined) return { kind: 'invalid' }

  const payload = base64UrlJson(parts[1])
  const signature = base64UrlBytes(parts[2])
  if (!payload || !signature || signature.length === 0) return { kind: 'invalid' }
  if (alg === 'ES256' && signature.length !== 64) return { kind: 'invalid' }

  const entry = await findKey(supabaseUrl, header.kid, now)
  if (entry === 'unavailable' || entry === 'not-found') return { kind: 'unknown' }
  // The algorithm comes from the key's own type; the header must agree with it.
  if (entry.alg !== alg) return { kind: 'invalid' }

  const algorithm = entry.alg === 'ES256' ? { name: 'ECDSA', hash: 'SHA-256' } : { name: 'RSASSA-PKCS1-v1_5' }
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  let valid = false
  try {
    valid = await crypto.subtle.verify(algorithm, entry.key, signature, signed)
  } catch {
    valid = false
  }
  if (!valid) return { kind: 'invalid' }

  const nowS = now / 1000
  if (typeof payload.exp !== 'number' || payload.exp + EXP_LEEWAY_S <= nowS) return { kind: 'invalid' }
  if (typeof payload.nbf === 'number' && payload.nbf - EXP_LEEWAY_S > nowS) return { kind: 'invalid' }
  if (!audienceOk(payload.aud)) return { kind: 'invalid' }
  if (payload.iss !== `${supabaseUrl}/auth/v1`) return { kind: 'invalid' }
  if (typeof payload.sub !== 'string' || !payload.sub) return { kind: 'invalid' }
  // Session tokens carry role "authenticated"; anything else (anon, service_role,
  // a custom role) is left to Supabase, as before.
  if (payload.role !== 'authenticated') return { kind: 'unknown' }
  return { kind: 'user', user: { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : '' } }
}
