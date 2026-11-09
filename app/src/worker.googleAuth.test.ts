import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'
import { GOOGLE_TOKEN_URL, handleGoogleAuth } from './worker/routes/googleAuth'

const configured = { GOOGLE_OAUTH_CLIENT_ID: 'client-1.apps.googleusercontent.com', GOOGLE_OAUTH_CLIENT_SECRET: 'top-secret' }
const allow = vi.fn(async () => true)
const verifier = 'v'.repeat(43)
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const exchange = (body: unknown, headers: Record<string, string> = { Origin: 'https://tinct.app' }) => new Request('https://tinct.app/api/auth/google/exchange', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
})
const good = { code: '4/0A-code', codeVerifier: verifier, redirectUri: 'https://tinct.app/auth/google/callback' }

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); allow.mockClear() })

describe('GET /api/auth/google/config (the switch)', () => {
  it('names the client id only when the id and the secret are both set, and never the secret', async () => {
    for (const [env, expected] of [
      [configured, 'client-1.apps.googleusercontent.com'],
      [{ GOOGLE_OAUTH_CLIENT_ID: 'client-1' }, null],
      [{ GOOGLE_OAUTH_CLIENT_SECRET: 'top-secret' }, null],
      [{}, null],
    ] as const) {
      const response = await handleGoogleAuth(new Request('https://tinct.app/api/auth/google/config'), env, { checkRateLimit: allow })
      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      const text = await response.text()
      expect(JSON.parse(text)).toEqual({ clientId: expected })
      expect(text).not.toContain('top-secret')
    }
  })
})

describe('GET /auth/google/callback', () => {
  it('sends the reader to the sign-in page with code and state in the fragment only', async () => {
    const response = await worker.fetch(new Request('https://tinct.app/auth/google/callback?state=s1&code=4%2F0A-code&scope=email+openid&authuser=0&prompt=none'), {} as never, ctx)
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/sign-in?callback=google#code=4%2F0A-code&state=s1')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
  })

  it('passes a cancelled Google screen on, and never a blank page for a bare visit', async () => {
    const cancelled = await worker.fetch(new Request('https://tinct.app/auth/google/callback?error=access_denied&state=s1'), {} as never, ctx)
    expect(cancelled.headers.get('Location')).toBe('/sign-in?callback=google#state=s1&error=access_denied')
    const bare = await worker.fetch(new Request('https://tinct.app/auth/google/callback'), {} as never, ctx)
    expect(bare.headers.get('Location')).toBe('/sign-in?callback=google#error=missing_code')
  })
})

describe('POST /api/auth/google/exchange', () => {
  it('swaps the code and verifier at Google with the secret and returns only the ID token', async () => {
    const google = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ access_token: 'ya29.access', id_token: 'eyJ.id.token', expires_in: 3599, token_type: 'Bearer', refresh_token: 'never-asked' }))
    vi.stubGlobal('fetch', google)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const usage = { getByName: () => ({ hit: async () => true }) }
    const response = await worker.fetch(exchange(good), { ...configured, USAGE_COORDINATOR: usage } as never, ctx)
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ idToken: 'eyJ.id.token' })
    const [url, init] = google.mock.calls[0]
    expect(url).toBe(GOOGLE_TOKEN_URL)
    expect(init?.method).toBe('POST')
    expect(Object.fromEntries(new URLSearchParams(String(init?.body)))).toEqual({
      grant_type: 'authorization_code', code: '4/0A-code', code_verifier: verifier,
      redirect_uri: 'https://tinct.app/auth/google/callback', client_id: 'client-1.apps.googleusercontent.com', client_secret: 'top-secret',
    })
    expect(warn).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  it('says not_configured (so the page falls back to Supabase) without calling Google', async () => {
    const google = vi.fn()
    for (const env of [{}, { GOOGLE_OAUTH_CLIENT_ID: 'client-1' }]) {
      const response = await handleGoogleAuth(exchange(good), env, { checkRateLimit: allow, fetcher: google as never })
      expect(response.status).toBe(503)
      expect(await response.json()).toEqual({ error: 'not_configured' })
    }
    expect(google).not.toHaveBeenCalled()
  })

  it('refuses a foreign redirect_uri, a bad verifier, another origin, GET, and too many tries', async () => {
    const google = vi.fn()
    const deps = { checkRateLimit: allow, fetcher: google as never }
    expect((await handleGoogleAuth(exchange({ ...good, redirectUri: 'https://evil.example/auth/google/callback' }), configured, deps)).status).toBe(400)
    expect((await handleGoogleAuth(exchange({ ...good, codeVerifier: 'short' }), configured, deps)).status).toBe(400)
    expect((await handleGoogleAuth(exchange({ ...good, code: '' }), configured, deps)).status).toBe(400)
    expect((await handleGoogleAuth(exchange(good, { Origin: 'https://evil.example' }), configured, deps)).status).toBe(403)
    expect((await handleGoogleAuth(new Request('https://tinct.app/api/auth/google/exchange'), configured, deps)).status).toBe(405)
    expect((await handleGoogleAuth(exchange(good), configured, { checkRateLimit: vi.fn(async () => false), fetcher: google as never })).status).toBe(429)
    expect(google).not.toHaveBeenCalled()
  })

  it('a refused code is exchange_failed, logged by Google error code only — never the code, verifier, secret or token', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const google = vi.fn(async () => Response.json({ error: 'invalid_grant', error_description: 'Bad Request' }, { status: 400 }))
    const response = await handleGoogleAuth(exchange(good), configured, { checkRateLimit: allow, fetcher: google as never })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'exchange_failed' })
    const logged = warn.mock.calls.map(call => call.join(' ')).join('\n')
    expect(logged).toContain('invalid_grant')
    for (const secret of ['4/0A-code', verifier, 'top-secret']) expect(logged).not.toContain(secret)

    const offline = await handleGoogleAuth(exchange(good), configured, { checkRateLimit: allow, fetcher: vi.fn(async () => { throw new TypeError('network') }) as never })
    expect(offline.status).toBe(502)
    expect(await offline.json()).toEqual({ error: 'exchange_failed' })
  })
})
