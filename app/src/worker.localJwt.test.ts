/**
 * Supabase session tokens (ES256) are verified in the Worker against the
 * project's published JWKS, so most requests make no /auth/v1/user call.
 * Supabase is still asked when local verification is impossible.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import worker, { forgetVerifiedUser, resetVerifiedUsersForTest } from './worker'
import { verifySupabaseJwtLocally } from './worker/lib/supabaseJwt'

const SB = 'https://sb.test'
const env = {
  SUPABASE_URL: SB, SUPABASE_SERVICE_ROLE_KEY: 'service', SUPABASE_ANON_KEY: 'anon',
  ASSETS: { fetch: async () => new Response('nf', { status: 404 }) },
}
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const USER = { id: '11111111-1111-4111-8111-111111111111', email: 'a@example.com' }
const KID = 'kid-1'

const b64 = (data: string | Uint8Array) => Buffer.from(data).toString('base64url')
let keys: CryptoKeyPair
let otherKeys: CryptoKeyPair
let publicJwk: JsonWebKey
let jwksKeys: Record<string, unknown>[] = []
let jwksUp = true
let jwksCalls = 0
let authCalls = 0

async function sign(header: Record<string, unknown>, claims: Record<string, unknown>, key: CryptoKey = keys.privateKey): Promise<string> {
  const input = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(claims))}`
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(input)))
  return `${input}.${b64(sig)}`
}
const nowS = () => Math.floor(Date.now() / 1000)
const claims = (over: Record<string, unknown> = {}) => ({
  sub: USER.id, email: USER.email, aud: 'authenticated', role: 'authenticated',
  iss: `${SB}/auth/v1`, exp: nowS() + 3600, iat: nowS(), ...over,
})
const header = (over: Record<string, unknown> = {}) => ({ alg: 'ES256', typ: 'JWT', kid: KID, ...over })

beforeAll(async () => {
  keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']) as CryptoKeyPair
  otherKeys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']) as CryptoKeyPair
  publicJwk = await crypto.subtle.exportKey('jwk', keys.publicKey)
})

beforeEach(() => {
  resetVerifiedUsersForTest()
  jwksKeys = [{ ...publicJwk, kid: KID, alg: 'ES256', use: 'sig', key_ops: ['verify'] }]
  jwksUp = true
  jwksCalls = 0
  authCalls = 0
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url === `${SB}/auth/v1/.well-known/jwks.json`) {
      jwksCalls++
      return jwksUp ? Response.json({ keys: jwksKeys }) : new Response('down', { status: 503 })
    }
    if (url.endsWith('/auth/v1/user')) {
      authCalls++
      return Response.json(USER)
    }
    // Any table read: one row, so /api/subscription-info finds the reader's profile.
    return Response.json([{ created_at: '2026-10-01T00:00:00Z' }])
  }))
})
afterEach(() => vi.unstubAllGlobals())

describe('verifySupabaseJwtLocally', () => {
  it('accepts a valid ES256 session token and reads id and email from its claims', async () => {
    const verdict = await verifySupabaseJwtLocally(SB, await sign(header(), claims()))
    expect(verdict).toEqual({ kind: 'user', user: USER })
    expect(jwksCalls).toBe(1)
    // The JWKS is kept: a second token needs no fetch.
    await verifySupabaseJwtLocally(SB, await sign(header(), claims({ email: 'b@example.com' })))
    expect(jwksCalls).toBe(1)
  })

  it('refuses an expired token, allowing 30 seconds of clock skew', async () => {
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ exp: nowS() - 60 })))).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ exp: nowS() - 5 })))).kind).toBe('user')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ exp: undefined })))).kind).toBe('invalid')
  })

  it('refuses a wrong audience, a wrong issuer and a missing subject', async () => {
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ aud: 'anon' })))).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ iss: 'https://other.supabase.co/auth/v1' })))).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ sub: '' })))).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ aud: ['authenticated'] })))).kind).toBe('user')
  })

  it('refuses a bad signature and a tampered payload', async () => {
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims(), otherKeys.privateKey))).kind).toBe('invalid')
    const [h, , s] = (await sign(header(), claims())).split('.')
    const forged = `${h}.${b64(JSON.stringify(claims({ sub: '22222222-2222-4222-8222-222222222222' })))}.${s}`
    expect((await verifySupabaseJwtLocally(SB, forged)).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, `${h}.${b64(JSON.stringify(claims()))}.`)).kind).toBe('invalid')
    expect((await verifySupabaseJwtLocally(SB, `${h}.not json!.${s}`)).kind).toBe('invalid')
  })

  it('never accepts alg none, in any spelling, and never asks anyone about it', async () => {
    for (const alg of ['none', 'None', 'NONE']) {
      const token = `${b64(JSON.stringify({ alg, typ: 'JWT', kid: KID }))}.${b64(JSON.stringify(claims()))}.`
      expect((await verifySupabaseJwtLocally(SB, token)).kind).toBe('invalid')
    }
    expect(jwksCalls).toBe(0)
  })

  it('takes the algorithm from the key, never from the token header', async () => {
    // An RS256 header against the published EC key is refused, not tried as RSA.
    const [, body, sig] = (await sign(header(), claims())).split('.')
    const relabelled = `${b64(JSON.stringify(header({ alg: 'RS256' })))}.${body}.${sig}`
    expect((await verifySupabaseJwtLocally(SB, relabelled)).kind).toBe('invalid')
    // An HS256 token is never checked with the public key as an HMAC secret: Supabase decides.
    const hs = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${body}.${sig}`
    expect((await verifySupabaseJwtLocally(SB, hs)).kind).toBe('unknown')
  })

  it('refetches the JWKS once for an unknown key id, then verifies with the new key', async () => {
    await verifySupabaseJwtLocally(SB, await sign(header(), claims()))
    expect(jwksCalls).toBe(1)
    const rotatedJwk = await crypto.subtle.exportKey('jwk', otherKeys.publicKey)
    jwksKeys = [...jwksKeys, { ...rotatedJwk, kid: 'kid-2', alg: 'ES256' }]
    const later = Date.now() + 31_000
    const token = await sign(header({ kid: 'kid-2' }), claims({ exp: nowS() + 3600 }), otherKeys.privateKey)
    expect(await verifySupabaseJwtLocally(SB, token, later)).toEqual({ kind: 'user', user: USER })
    expect(jwksCalls).toBe(2)
    // A key id that is still not published is left to Supabase; no fetch loop.
    const unknown = await sign(header({ kid: 'kid-9' }), claims(), otherKeys.privateKey)
    expect((await verifySupabaseJwtLocally(SB, unknown, later + 1_000)).kind).toBe('unknown')
    expect(jwksCalls).toBe(2)
  })

  it('leaves the decision to Supabase when the JWKS cannot be fetched', async () => {
    jwksUp = false
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims()))).kind).toBe('unknown')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims()))).kind).toBe('unknown')
    expect(jwksCalls).toBe(1)
  })

  it('leaves unreadable tokens, HS256 tokens and other roles to Supabase', async () => {
    expect((await verifySupabaseJwtLocally(SB, 'token')).kind).toBe('unknown')
    expect((await verifySupabaseJwtLocally(SB, 'h.e30.s')).kind).toBe('unknown')
    const anonKey = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify({ iss: 'supabase', role: 'anon' }))}.sig`
    expect((await verifySupabaseJwtLocally(SB, anonKey)).kind).toBe('unknown')
    expect((await verifySupabaseJwtLocally(SB, await sign(header(), claims({ role: 'service_role' })))).kind).toBe('unknown')
  })
})

const ask = (path: string, token: string, init: RequestInit = {}) =>
  worker.fetch(new Request(`https://tinct.app${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } }), env as never, ctx)

describe('verifyUser in the Worker', () => {
  it('answers a signed-in request without calling /auth/v1/user', async () => {
    const token = await sign(header(), claims())
    for (let i = 0; i < 5; i++) expect((await ask('/api/subscription-info', token)).status).toBe(200)
    expect(authCalls).toBe(0)
    expect(jwksCalls).toBe(1)
  })

  it('refuses a bad local token without asking Supabase', async () => {
    expect((await ask('/api/subscription-info', await sign(header(), claims({ exp: nowS() - 120 })))).status).toBe(401)
    expect((await ask('/api/subscription-info', await sign(header(), claims(), otherKeys.privateKey))).status).toBe(401)
    expect(authCalls).toBe(0)
  })

  it('falls back to /auth/v1/user when the JWKS is down', async () => {
    jwksUp = false
    expect((await ask('/api/subscription-info', await sign(header(), claims()))).status).toBe(200)
    expect(authCalls).toBe(1)
  })

  it('still asks Supabase before an account deletion', async () => {
    const token = await sign(header(), claims())
    const response = await ask('/api/account/delete', token, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'wrong', userId: USER.id }),
    })
    expect(response.status).not.toBe(401)
    expect(authCalls).toBe(1)
  })

  it('refuses a deleted account\'s token on this isolate, though it still verifies locally', async () => {
    const token = await sign(header(), claims())
    expect((await ask('/api/subscription-info', token)).status).toBe(200)
    forgetVerifiedUser(new Request('https://tinct.app/', { headers: { Authorization: `Bearer ${token}` } }), true)
    expect((await ask('/api/subscription-info', token)).status).toBe(401)
    // A failed deletion (deleted false) does not lock the reader out.
    const other = await sign(header(), claims({ iat: nowS() - 1 }))
    forgetVerifiedUser(new Request('https://tinct.app/', { headers: { Authorization: `Bearer ${other}` } }))
    expect((await ask('/api/subscription-info', other)).status).toBe(200)
  })
})
