/**
 * Google sign-in on tinct.app itself (approved by Anders, 9 Nov 2026).
 *
 * Supabase's `signInWithOAuth({ provider: 'google' })` sends Google the
 * Supabase project's own callback, so Google's screen said "continue to
 * yazjyiqsxjystvpkyouk.supabase.co". Here the round trip is Tinct's:
 *
 * 1. The browser makes a PKCE verifier, a state and a raw nonce, keeps them in
 *    sessionStorage and goes to Google with redirect_uri
 *    `<origin>/auth/google/callback`, the S256 challenge and the SHA-256 hex
 *    of the nonce (Supabase's documented scheme for signInWithIdToken: Google
 *    gets the hash, Supabase gets the raw nonce and hashes it itself).
 * 2. The Worker answers that callback with a redirect to the sign-in page,
 *    carrying Google's code and state in the fragment, and later swaps the
 *    code for an ID token at Google with the client secret
 *    (`/api/auth/google/exchange`, src/worker/routes/googleAuth.ts). Only the
 *    ID and access tokens come back (Supabase checks the ID token's at_hash
 *    against the access token); nothing is stored.
 * 3. The page checks the state and hands both tokens and the raw nonce to
 *    `supabase.auth.signInWithIdToken`.
 *
 * Switched by the Worker: `/api/auth/google/config` names the client id only
 * when both GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are set.
 * Until then (or if that check fails) the button keeps Supabase's own flow.
 */

export const GOOGLE_CALLBACK_PATH = '/auth/google/callback'
export const GOOGLE_CONFIG_PATH = '/api/auth/google/config'
export const GOOGLE_EXCHANGE_PATH = '/api/auth/google/exchange'
export const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
/** The sign-in page's marker for a return from Google through the Worker. */
export const GOOGLE_RETURN_CALLBACK = 'google'
export const GOOGLE_FLOW_KEY = 'tinct:google-sign-in'
/** A round trip older than this is not finished; the reader starts again. */
export const GOOGLE_FLOW_MAX_AGE_MS = 15 * 60_000
const CONFIG_TIMEOUT_MS = 3_000

export interface GoogleFlow {
  state: string
  verifier: string
  /** The raw nonce: Supabase gets this, Google got its SHA-256 hex. */
  nonce: string
  returnTo: string
  redirectUri: string
  at: number
}

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return base64Url(bytes)
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
}

/** RFC 7636 S256: base64url(SHA-256(verifier)), no padding. */
export async function pkceChallenge(verifier: string): Promise<string> {
  return base64Url(await sha256(verifier))
}

/** What Google is given as `nonce`: lowercase hex SHA-256 of the raw nonce. */
export async function hashedNonce(rawNonce: string): Promise<string> {
  return [...await sha256(rawNonce)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function googleRedirectUri(origin: string): string {
  return `${origin}${GOOGLE_CALLBACK_PATH}`
}

export function googleAuthorizeUrl(options: { clientId: string; redirectUri: string; challenge: string; state: string; nonce: string }): string {
  const url = new URL(GOOGLE_AUTHORIZE_URL)
  url.searchParams.set('client_id', options.clientId)
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('code_challenge', options.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', options.state)
  url.searchParams.set('nonce', options.nonce)
  return url.toString()
}

/** A fresh flow, its Google URL, and the record to keep until the return. */
export async function createGoogleFlow(clientId: string, origin: string, returnTo: string, now = Date.now()): Promise<{ flow: GoogleFlow; url: string }> {
  const flow: GoogleFlow = { state: randomToken(16), verifier: randomToken(32), nonce: randomToken(32), returnTo, redirectUri: googleRedirectUri(origin), at: now }
  const url = googleAuthorizeUrl({ clientId, redirectUri: flow.redirectUri, challenge: await pkceChallenge(flow.verifier), state: flow.state, nonce: await hashedNonce(flow.nonce) })
  return { flow, url }
}

function readFlow(storage: Storage): GoogleFlow | null {
  try {
    const value = JSON.parse(storage.getItem(GOOGLE_FLOW_KEY) || 'null') as Partial<GoogleFlow> | null
    if (!value || typeof value.state !== 'string' || typeof value.verifier !== 'string' || typeof value.nonce !== 'string'
      || typeof value.returnTo !== 'string' || typeof value.redirectUri !== 'string' || typeof value.at !== 'number') return null
    return value as GoogleFlow
  } catch {
    return null
  }
}

/** Where the reader was going, without using up the flow (the page needs it before it starts). */
export function peekGoogleReturnTo(storage: Storage | null = safeSessionStorage()): string | null {
  return storage ? readFlow(storage)?.returnTo ?? null : null
}

/** The flow, once: it is removed as it is read, so a code cannot be replayed from this tab. */
export function takeGoogleFlow(storage: Storage | null = safeSessionStorage()): GoogleFlow | null {
  if (!storage) return null
  const flow = readFlow(storage)
  try { storage.removeItem(GOOGLE_FLOW_KEY) } catch { /* private mode */ }
  return flow
}

function safeSessionStorage(): Storage | null {
  try { return window.sessionStorage } catch { return null }
}

export interface GoogleReturn {
  code: string | null
  state: string | null
  error: string | null
}

/** What the Worker's callback redirect carries in the fragment. */
export function parseGoogleReturn(hash: string): GoogleReturn {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  return { code: params.get('code'), state: params.get('state'), error: params.get('error') }
}

export const GOOGLE_CANCELLED_MESSAGE = 'Google sign-in was cancelled. Try again, or use your email below.'
export const GOOGLE_FAILED_MESSAGE = 'Google sign-in didn’t finish. Please try again, or use your email below.'

export function googleReturnErrorMessage(error: string | null): string {
  return error === 'access_denied' ? GOOGLE_CANCELLED_MESSAGE : GOOGLE_FAILED_MESSAGE
}

/** The one navigation to Google; an object so tests can watch it. */
export const googleNavigation = { assign: (url: string) => location.assign(url) }

let configRequest: Promise<string | null> | null = null
/** The Worker's definite answer, once it has given one: a client id, or null for "not set up". */
let knownClientId: string | null | undefined

/** The Worker's answer if it is already in; undefined while it has not answered. */
export function googleClientIdKnown(): string | null | undefined {
  return knownClientId
}

/**
 * The client id when the Worker can finish Google sign-in itself; null when
 * it cannot, or the answer did not come in time (Supabase's flow is used).
 */
export function googleClientId(fetcher: typeof fetch = fetch, origin = location.origin): Promise<string | null> {
  if (!configRequest) {
    configRequest = (async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS)
      try {
        const response = await fetcher(new URL(GOOGLE_CONFIG_PATH, origin).toString(), { cache: 'no-store', credentials: 'omit', signal: controller.signal })
        if (!response.ok) return null
        const body = await response.json() as { clientId?: unknown }
        knownClientId = typeof body.clientId === 'string' && body.clientId ? body.clientId : null
        return knownClientId
      } catch {
        return null
      } finally {
        clearTimeout(timer)
      }
    })()
    // A check that failed (not a definite "not set up") is asked again on the next tap.
    void configRequest.then(() => { if (knownClientId === undefined) configRequest = null })
  }
  return configRequest
}

export function resetGoogleConfigForTest(): void {
  configRequest = null
  knownClientId = undefined
}

/**
 * Go to Google on Tinct's own redirect. False when this browser or the Worker
 * cannot (no Web Crypto, no sessionStorage, not configured): the caller then
 * uses Supabase's OAuth flow, exactly as before.
 */
export async function startGoogleSignIn(options: {
  returnTo: string
  origin?: string
  navigate?: (url: string) => void
  fetcher?: typeof fetch
  storage?: Storage | null
}): Promise<boolean> {
  const origin = options.origin ?? location.origin
  const storage = options.storage === undefined ? safeSessionStorage() : options.storage
  if (!storage || typeof crypto === 'undefined' || !crypto.subtle) return false
  const clientId = await googleClientId(options.fetcher ?? fetch, origin)
  if (!clientId) return false
  try {
    const { flow, url } = await createGoogleFlow(clientId, origin, options.returnTo)
    storage.setItem(GOOGLE_FLOW_KEY, JSON.stringify(flow))
    ;(options.navigate ?? googleNavigation.assign)(url)
    return true
  } catch {
    return false
  }
}

export type GoogleExchangeResult =
  | { kind: 'token'; idToken: string; accessToken?: string }
  | { kind: 'not_configured' }
  | { kind: 'failed' }

/** Swap Google's code for an ID token on Tinct's Worker. The code is useless without the verifier. */
export async function exchangeGoogleCode(code: string, flow: GoogleFlow, fetcher: typeof fetch = fetch, origin = location.origin): Promise<GoogleExchangeResult> {
  try {
    const response = await fetcher(new URL(GOOGLE_EXCHANGE_PATH, origin).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      cache: 'no-store',
      body: JSON.stringify({ code, codeVerifier: flow.verifier, redirectUri: flow.redirectUri }),
    })
    const body = await response.json().catch(() => null) as { idToken?: unknown; accessToken?: unknown; error?: unknown } | null
    if (response.ok && typeof body?.idToken === 'string' && body.idToken) {
      return { kind: 'token', idToken: body.idToken, ...(typeof body.accessToken === 'string' && body.accessToken ? { accessToken: body.accessToken } : {}) }
    }
    if (body?.error === 'not_configured') return { kind: 'not_configured' }
    return { kind: 'failed' }
  } catch {
    return { kind: 'failed' }
  }
}

export type GoogleReturnOutcome =
  | { kind: 'token'; idToken: string; accessToken?: string; nonce: string; returnTo: string }
  /** The Worker cannot finish it (secret removed meanwhile): use Supabase's flow. */
  | { kind: 'fallback'; returnTo: string }
  | { kind: 'error'; message: string }

/** Everything between Google's answer and signInWithIdToken: state check, single use, expiry, exchange. */
export async function finishGoogleReturn(returned: GoogleReturn, flow: GoogleFlow | null, options: { fetcher?: typeof fetch; origin?: string; now?: number } = {}): Promise<GoogleReturnOutcome> {
  if (returned.error) return { kind: 'error', message: googleReturnErrorMessage(returned.error) }
  const now = options.now ?? Date.now()
  if (!flow || !returned.code || !returned.state || returned.state !== flow.state || now - flow.at > GOOGLE_FLOW_MAX_AGE_MS || now < flow.at - 60_000) {
    return { kind: 'error', message: GOOGLE_FAILED_MESSAGE }
  }
  const exchanged = await exchangeGoogleCode(returned.code, flow, options.fetcher ?? fetch, options.origin ?? location.origin)
  if (exchanged.kind === 'token') return { kind: 'token', idToken: exchanged.idToken, ...(exchanged.accessToken ? { accessToken: exchanged.accessToken } : {}), nonce: flow.nonce, returnTo: flow.returnTo }
  if (exchanged.kind === 'not_configured') return { kind: 'fallback', returnTo: flow.returnTo }
  return { kind: 'error', message: GOOGLE_FAILED_MESSAGE }
}
