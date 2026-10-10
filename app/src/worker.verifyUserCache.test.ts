/**
 * A token verified with Supabase is remembered for a minute per isolate, so
 * the several requests a page makes at once (the account cards make seven) do
 * not each pay a Supabase round trip before their own work (10 Oct 2026, each
 * /auth/v1/user call measured at 300-700 ms). Failures are never remembered,
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
  it('verifies a token once for several requests, and each token separately', async () => {
    const a = jwt(Math.floor(Date.now() / 1000) + 3600), b = jwt(Math.floor(Date.now() / 1000) + 3601)
    // Seven at once, as the account cards send them: one Supabase call.
    await Promise.all(Array.from({ length: 7 }, () => ask(a)))
    expect(authCalls).toEqual([`Bearer ${a}`])
    await ask(a)
    expect(authCalls.length).toBe(1)
    await ask(b)
    expect(authCalls).toEqual([`Bearer ${a}`, `Bearer ${b}`])
  })

  it('never remembers a refused token, nor one past its own expiry', async () => {
    authOk = false
    const bad = jwt(Math.floor(Date.now() / 1000) + 3600)
    await ask(bad); await ask(bad)
    expect(authCalls.length).toBe(2)
    authOk = true
    const expired = jwt(Math.floor(Date.now() / 1000) - 10)
    await ask(expired); await ask(expired)
    expect(authCalls.filter(h => h === `Bearer ${expired}`).length).toBe(2)
  })
})
