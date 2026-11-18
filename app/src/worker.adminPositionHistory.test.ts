import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleAdminPositionHistory, type AdminAccountsEnv } from './worker/routes/adminAccounts'

const userId = '11111111-1111-4111-8111-111111111111'
const entry = { at: 1, device: 'phone', book: 'master', chapter: 2, paragraph: 62, word: 0, placeAt: 1, rev: 1, outcome: 'accepted' }

function world() {
  const positionHistory = vi.fn(async () => [entry])
  const read = vi.fn()
  const getByName = vi.fn(() => ({ positionHistory, read }))
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes('/auth/v1/admin/users/')) return Response.json({ id: userId, email: 'reader@example.invalid' })
    if (url.includes('/rest/v1/profiles')) return Response.json([{ id: userId, email: 'reader@example.invalid' }])
    return new Response('unexpected', { status: 500 })
  })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role', READER_POSITION: { getByName } } as unknown as AdminAccountsEnv
  return { env, getByName, positionHistory, read, fetchMock }
}
const post = (body: unknown) => new Request('https://tinct.app/api/admin/position-history', { method: 'POST', body: JSON.stringify(body), headers: { Authorization: 'Bearer admin' } })

describe('admin position history route', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

  it('refuses anyone the site-admin check refuses, and non-POST, before touching data', async () => {
    const w = world()
    expect((await handleAdminPositionHistory(post({ userId }), w.env, async () => false)).status).toBe(403)
    expect((await handleAdminPositionHistory(new Request('https://tinct.app/api/admin/position-history'), w.env, async () => true)).status).toBe(405)
    expect(w.getByName).not.toHaveBeenCalled()
    expect(w.fetchMock).not.toHaveBeenCalled()
  })

  it('returns one account\'s history without running the position import', async () => {
    const w = world()
    const verify = vi.fn(async () => true)
    const response = await handleAdminPositionHistory(post({ userId }), w.env, verify)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ userId, history: [entry] })
    expect(verify).toHaveBeenCalledOnce()
    expect(w.getByName).toHaveBeenCalledExactlyOnceWith(userId)
    expect(w.read).not.toHaveBeenCalled()
  })

  it('rejects an invalid account reference', async () => {
    const w = world()
    expect((await handleAdminPositionHistory(post({ userId: 'nope' }), w.env, async () => true)).status).toBe(400)
    expect(w.getByName).not.toHaveBeenCalled()
  })
})
