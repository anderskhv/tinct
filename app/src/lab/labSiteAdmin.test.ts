import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) } }))
const { cachedSiteAdmin, rememberSiteAdmin, refreshSiteAdmin } = await import('./labSiteAdmin')

const memory = () => {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
}

describe('the cached site-admin answer', () => {
  it('counts only for the user it was cached for', () => {
    const storage = memory()
    expect(cachedSiteAdmin('u1', storage)).toBe(false)
    rememberSiteAdmin('u1', true, storage)
    expect(cachedSiteAdmin('u1', storage)).toBe(true)
    expect(cachedSiteAdmin('u2', storage)).toBe(false)
    expect(cachedSiteAdmin(null, storage)).toBe(false)
    rememberSiteAdmin('u2', false, storage)
    expect(cachedSiteAdmin('u1', storage)).toBe(true)
    rememberSiteAdmin('u1', false, storage)
    expect(cachedSiteAdmin('u1', storage)).toBe(false)
  })
  it('never throws with blocked storage', () => {
    const broken = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') }, removeItem: () => { throw new Error('x') } }
    expect(cachedSiteAdmin('u1', broken)).toBe(false)
    expect(() => rememberSiteAdmin('u1', true, broken)).not.toThrow()
  })
  it('a user with no site_admins row is not an admin', async () => {
    expect(await refreshSiteAdmin('u3')).toBe(false)
  })
})
