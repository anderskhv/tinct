/**
 * A token verified with Supabase is remembered for a minute per isolate, so
 * later requests can reuse completed verification data. Pending fetches are
 * never shared between requests. Failures are never remembered,
 * a token past its own expiry is not, and account deletion forgets the token.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker, { resetVerifiedUsersForTest } from './worker'

const env = {
  SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_ROLE_KEY: 'service', SUPABASE_ANON_KEY: 'anon',
  ASSETS: { fetch: async () => new Response('nf', { status: 404 }) },
}
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
const USER = { id: '11111111-1111-4111-8111-111111111111', email: 'a@example.com' }
const jwt = (exp: number) => `h.${Buffer.from(JSON.stringify({ sub: USER.id, exp })).toString('base64url')}.s`
let authCalls: string[] = []
let authOk = true

beforeEach(() => {
  resetVerifiedUsersForTest()
  authCalls = []
  authOk = true
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/auth/v1/user')) {
      authCalls.push(new Headers(init?.headers).get('Authorization') || '')
      return authOk ? Response.json(USER) : Response.json({ error: 'bad' }, { status: 401 })
    }
    return Response.json([])
  }))
})
afterEach(() => vi.unstubAllGlobals())

const ask = (token: string) => worker.fetch(new Request('https://tinct.app/api/subscription-info', { headers: { Authorization: `Bearer ${token}` } }), env as never, ctx)

describe('verifyUser cache', () => {
  it('does not make a new request wait for an unrelated pending verification', async () => {
    const token = jwt(Math.floor(Date.now() / 1000) + 3600)
    let release!: (response: Response) => void
    const fetcher = vi.mocked(fetch)
    fetcher.mockImplementationOnce(() => new Promise(resolve => { release = resolve }))
    const first = ask(token)
    let secondDone = false
    const second = ask(token).then(response => { secondDone = true; return response })
    try {
      await new Promise(resolve => setTimeout(resolve, 30))
      expect(secondDone).toBe(true)
    } finally {
      release(Response.json(USER))
      await Promise.all([first, second])
    }
  })

  it('reports an authentication service outage as unavailable, never an invalid login', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({ error: 'service detail' }, { status: 503 }))
    const response = await ask(jwt(Math.floor(Date.now() / 1000) + 3600))
    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ error: 'Authentication is temporarily unavailable', reason: 'auth_unavailable' })
  })

  it('bounds a stalled authentication lookup and allows a later request to recover', async () => {
    vi.useFakeTimers()
    try {
      let signal: AbortSignal | undefined
      vi.mocked(fetch).mockImplementationOnce((_input, init) => {
        signal = init?.signal as AbortSignal
        return new Promise((_resolve, reject) => signal?.addEventListener('abort', () => reject(new Error('private detail'))))
      })
      const token = jwt(Math.floor(Date.now() / 1000) + 3600)
      let settled = false
      const pending = ask(token).then(response => { settled = true; return response })
      await vi.advanceTimersByTimeAsync(10_000)
      expect(settled).toBe(true)
      expect((await pending).status).toBe(503)
      expect(signal?.aborted).toBe(true)
      vi.mocked(fetch)
        .mockResolvedValueOnce(Response.json(USER))
        .mockResolvedValueOnce(Response.json([{ created_at: '2026-10-01T00:00:00Z' }]))
      expect((await ask(token)).status).toBe(200)
    } finally { vi.useRealTimers() }
  })
  it('reuses completed verification data, while concurrent requests own their I/O', async () => {
    const a = jwt(Math.floor(Date.now() / 1000) + 3600), b = jwt(Math.floor(Date.now() / 1000) + 3601)
    // Concurrent requests do not share a request-owned pending fetch.
    await Promise.all(Array.from({ length: 7 }, () => ask(a)))
    expect(authCalls).toEqual(Array(7).fill(`Bearer ${a}`))
    await ask(a)
    expect(authCalls.length).toBe(7)
    await ask(b)
    expect(authCalls).toEqual([...Array(7).fill(`Bearer ${a}`), `Bearer ${b}`])
  })

  it('never remembers a refused token, nor one past its own expiry', async () => {
    authOk = false
    const bad = jwt(Math.floor(Date.now() / 1000) + 3600)
    expect((await ask(bad)).status).toBe(401)
    expect((await ask(bad)).status).toBe(401)
    expect(authCalls.length).toBe(2)
    authOk = true
    const expired = jwt(Math.floor(Date.now() / 1000) - 10)
    await ask(expired); await ask(expired)
    expect(authCalls.filter(h => h === `Bearer ${expired}`).length).toBe(2)
  })
})
