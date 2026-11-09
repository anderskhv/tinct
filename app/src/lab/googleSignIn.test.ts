// @vitest-environment jsdom
import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GOOGLE_CANCELLED_MESSAGE,
  GOOGLE_FAILED_MESSAGE,
  GOOGLE_FLOW_KEY,
  GOOGLE_FLOW_MAX_AGE_MS,
  createGoogleFlow,
  exchangeGoogleCode,
  finishGoogleReturn,
  googleClientId,
  googleClientIdKnown,
  hashedNonce,
  parseGoogleReturn,
  peekGoogleReturnTo,
  pkceChallenge,
  randomToken,
  resetGoogleConfigForTest,
  startGoogleSignIn,
  takeGoogleFlow,
  type GoogleFlow,
} from './googleSignIn'

const origin = 'https://tinct.app'
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const flow = (extra: Partial<GoogleFlow> = {}): GoogleFlow => ({
  state: 'state-1', verifier: 'v'.repeat(43), nonce: 'raw-nonce', returnTo: '/reader?book=bible#p12', redirectUri: `${origin}/auth/google/callback`, at: Date.now(), ...extra,
})

beforeEach(() => { sessionStorage.clear(); resetGoogleConfigForTest() })
afterEach(() => vi.restoreAllMocks())

describe('PKCE and nonce helpers', () => {
  it('makes the RFC 7636 S256 challenge (Appendix B vector)', async () => {
    expect(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  })

  it('gives Google the lowercase hex SHA-256 of the raw nonce (Supabase signInWithIdToken scheme)', async () => {
    const raw = 'a-raw-nonce'
    expect(await hashedNonce(raw)).toBe(createHash('sha256').update(raw).digest('hex'))
  })

  it('random tokens are base64url and long enough for a PKCE verifier', () => {
    const token = randomToken(32)
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(randomToken(32)).not.toBe(token)
  })

  it('builds the Google URL on the app origin with S256 and the hashed nonce', async () => {
    const { flow: made, url } = await createGoogleFlow('client-1.apps.googleusercontent.com', 'http://localhost:3011', '/library')
    const google = new URL(url)
    expect(google.origin + google.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(Object.fromEntries(google.searchParams)).toEqual({
      client_id: 'client-1.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3011/auth/google/callback',
      response_type: 'code',
      scope: 'openid email profile',
      code_challenge: await pkceChallenge(made.verifier),
      code_challenge_method: 'S256',
      state: made.state,
      nonce: await hashedNonce(made.nonce),
    })
    expect(google.searchParams.get('nonce')).not.toBe(made.nonce)
    expect(made.redirectUri).toBe('http://localhost:3011/auth/google/callback')
  })
})

describe('the kept round trip', () => {
  it('is read once, and peeking does not use it up', () => {
    sessionStorage.setItem(GOOGLE_FLOW_KEY, JSON.stringify(flow()))
    expect(peekGoogleReturnTo()).toBe('/reader?book=bible#p12')
    expect(takeGoogleFlow()?.state).toBe('state-1')
    expect(takeGoogleFlow()).toBeNull()
    expect(peekGoogleReturnTo()).toBeNull()
  })

  it('ignores a malformed record', () => {
    sessionStorage.setItem(GOOGLE_FLOW_KEY, '{"state":1}')
    expect(takeGoogleFlow()).toBeNull()
  })

  it('reads code, state and error from the fragment', () => {
    expect(parseGoogleReturn('#code=4%2F0A&state=s')).toEqual({ code: '4/0A', state: 's', error: null })
    expect(parseGoogleReturn('#error=access_denied&state=s')).toEqual({ code: null, state: 's', error: 'access_denied' })
  })
})

describe('the switch (Worker config)', () => {
  it('uses the client id the Worker names', async () => {
    const fetcher = vi.fn(async () => json({ clientId: 'client-1' }))
    expect(await googleClientId(fetcher as never, origin)).toBe('client-1')
    expect(String((fetcher.mock.calls[0] as unknown[])[0])).toBe('https://tinct.app/api/auth/google/config')
  })

  it('is off when the Worker fails or is unreachable, and asks again on the next tap', async () => {
    expect(await googleClientId(vi.fn(async () => json({}, 500)) as never, origin)).toBeNull()
    expect(googleClientIdKnown()).toBeUndefined()
    expect(await googleClientId(vi.fn(async () => { throw new TypeError('offline') }) as never, origin)).toBeNull()
    expect(await googleClientId(vi.fn(async () => json({ clientId: 'later' })) as never, origin)).toBe('later')
  })

  it('remembers a definite "not set up" for the page, so a tap goes straight to Supabase', async () => {
    expect(await googleClientId(vi.fn(async () => json({ clientId: null })) as never, origin)).toBeNull()
    expect(googleClientIdKnown()).toBeNull()
    const again = vi.fn(async () => json({ clientId: 'x' }))
    expect(await googleClientId(again as never, origin)).toBeNull()
    expect(again).not.toHaveBeenCalled()
  })

  it('starts Google and keeps verifier, state, nonce and place in sessionStorage', async () => {
    const navigate = vi.fn()
    const started = await startGoogleSignIn({ returnTo: '/reader?book=bible', origin, navigate, fetcher: vi.fn(async () => json({ clientId: 'client-1' })) as never })
    expect(started).toBe(true)
    const kept = JSON.parse(sessionStorage.getItem(GOOGLE_FLOW_KEY)!) as GoogleFlow
    expect(kept).toMatchObject({ returnTo: '/reader?book=bible', redirectUri: 'https://tinct.app/auth/google/callback' })
    const google = new URL(navigate.mock.calls[0][0])
    expect(google.searchParams.get('state')).toBe(kept.state)
    expect(google.searchParams.get('code_challenge')).toBe(await pkceChallenge(kept.verifier))
    expect(google.searchParams.get('nonce')).toBe(await hashedNonce(kept.nonce))
  })

  it('falls back (returns false, navigates nowhere) when unconfigured or without storage', async () => {
    const navigate = vi.fn()
    expect(await startGoogleSignIn({ returnTo: '/library', origin, navigate, fetcher: vi.fn(async () => json({ clientId: null })) as never })).toBe(false)
    expect(await startGoogleSignIn({ returnTo: '/library', origin, navigate, storage: null, fetcher: vi.fn(async () => json({ clientId: 'c' })) as never })).toBe(false)
    expect(navigate).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(GOOGLE_FLOW_KEY)).toBeNull()
  })
})

describe('finishing the return', () => {
  it('exchanges the code with the verifier and hands back the token and raw nonce', async () => {
    const fetcher = vi.fn(async (_url: string, _init?: RequestInit) => json({ idToken: 'id.token.value' }))
    const outcome = await finishGoogleReturn({ code: 'code-1', state: 'state-1', error: null }, flow(), { fetcher: fetcher as never, origin })
    expect(outcome).toEqual({ kind: 'token', idToken: 'id.token.value', nonce: 'raw-nonce', returnTo: '/reader?book=bible#p12' })
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toBe('https://tinct.app/api/auth/google/exchange')
    expect(JSON.parse(String(init?.body))).toEqual({ code: 'code-1', codeVerifier: 'v'.repeat(43), redirectUri: 'https://tinct.app/auth/google/callback' })
  })

  it('a cancelled Google screen says so; any other Google error is the general notice', async () => {
    expect(await finishGoogleReturn({ code: null, state: 'state-1', error: 'access_denied' }, flow())).toEqual({ kind: 'error', message: GOOGLE_CANCELLED_MESSAGE })
    expect(await finishGoogleReturn({ code: null, state: 'state-1', error: 'server_error' }, flow())).toEqual({ kind: 'error', message: GOOGLE_FAILED_MESSAGE })
  })

  it('refuses a wrong state, a missing flow or an old flow without calling the Worker', async () => {
    const fetcher = vi.fn(async () => json({ idToken: 'x' }))
    for (const [returned, kept] of [
      [{ code: 'c', state: 'other', error: null }, flow()],
      [{ code: 'c', state: 'state-1', error: null }, null],
      [{ code: 'c', state: 'state-1', error: null }, flow({ at: Date.now() - GOOGLE_FLOW_MAX_AGE_MS - 1 })],
      [{ code: null, state: 'state-1', error: null }, flow()],
    ] as const) {
      expect(await finishGoogleReturn(returned, kept, { fetcher: fetcher as never, origin })).toEqual({ kind: 'error', message: GOOGLE_FAILED_MESSAGE })
    }
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('falls back to Supabase when the Worker says it is not configured', async () => {
    const outcome = await finishGoogleReturn({ code: 'c', state: 'state-1', error: null }, flow(), { fetcher: vi.fn(async () => json({ error: 'not_configured' }, 503)) as never, origin })
    expect(outcome).toEqual({ kind: 'fallback', returnTo: '/reader?book=bible#p12' })
  })

  it('a failed exchange or network error is the general notice', async () => {
    expect(await exchangeGoogleCode('c', flow(), vi.fn(async () => json({ error: 'exchange_failed' }, 400)) as never, origin)).toEqual({ kind: 'failed' })
    expect(await exchangeGoogleCode('c', flow(), vi.fn(async () => { throw new TypeError('offline') }) as never, origin)).toEqual({ kind: 'failed' })
    expect(await finishGoogleReturn({ code: 'c', state: 'state-1', error: null }, flow(), { fetcher: vi.fn(async () => json({}, 502)) as never, origin })).toEqual({ kind: 'error', message: GOOGLE_FAILED_MESSAGE })
  })
})
