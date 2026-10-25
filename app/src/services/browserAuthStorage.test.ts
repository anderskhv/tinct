// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { createBrowserAuthStorage, signInErrorMessage } from './browserAuthStorage'

function cappedStorage(initial: Record<string, string>, limit: number): Storage {
  const values = new Map(Object.entries(initial))
  return {
    get length() { return values.size },
    key: i => [...values.keys()][i] ?? null,
    getItem: key => values.get(key) ?? null,
    removeItem: key => { values.delete(key) },
    clear: () => values.clear(),
    setItem(key, value) {
      const next = new Map(values); next.set(key, value)
      if ([...next].reduce((n, [k, v]) => n + k.length + v.length, 0) > limit) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      values.set(key, value)
    },
  }
}
const notes = { 'tinct-lab-highlights': 'precious highlights', 'tinct:chat-history:bible': 'unsynced question', 'tinct:lab-device-user': 'owner' }

describe('browser auth storage under pressure', () => {
  it('retains the standard auth key across a new adapter and removes it on sign-out', () => {
    const store = cappedStorage(notes, 500)
    createBrowserAuthStorage(store).setItem('sb-project-auth-token', 'session')
    expect(createBrowserAuthStorage(store).getItem('sb-project-auth-token')).toBe('session')
    createBrowserAuthStorage(store).removeItem('sb-project-auth-token')
    expect(store.getItem('sb-project-auth-token')).toBeNull()
    for (const [key, value] of Object.entries(notes)) expect(store.getItem(key)).toBe(value)
  })
  it('reclaims only enough optional previews and preserves all reader data', () => {
    const store = cappedStorage({ ...notes, 'tinct:library-2-own-thumb:one': 'x'.repeat(300), 'tinct:library-2-table:owner': 'cached table' }, 450)
    createBrowserAuthStorage(store).setItem('sb-project-auth-token', 's'.repeat(100))
    expect(store.getItem('sb-project-auth-token')).toBe('s'.repeat(100))
    expect(store.getItem('tinct:library-2-own-thumb:one')).toBeNull()
    expect(store.getItem('tinct:library-2-table:owner')).toBe('cached table')
    for (const [key, value] of Object.entries(notes)) expect(store.getItem(key)).toBe(value)
  })
  it('does not evict previews when a normal write fits', () => {
    const store = cappedStorage({ 'tinct:library-2-own-thumb:one': 'cached' }, 500)
    createBrowserAuthStorage(store).setItem('sb-project-auth-token', 'session')
    expect(store.getItem('tinct:library-2-own-thumb:one')).toBe('cached')
  })
  it('fails without deleting reader data when no disposable space is available', () => {
    const store = cappedStorage(notes, 150)
    expect(() => createBrowserAuthStorage(store).setItem('sb-project-auth-token', 's'.repeat(300))).toThrow('quota')
    for (const [key, value] of Object.entries(notes)) expect(store.getItem(key)).toBe(value)
  })
  it('does not mislabel service quotas as device storage failures', () => {
    expect(signInErrorMessage(new Error('Service quota exceeded'))).toBe('Service quota exceeded')
    expect(signInErrorMessage({ originalError: new DOMException('Full', 'QuotaExceededError') })).toContain('browser has no space')
  })
  it('completes a real Supabase password flow and persists the session despite a full preview cache', async () => {
    const store = cappedStorage({ ...notes, 'tinct:library-2-own-thumb:one': 'x'.repeat(3000) }, 2000)
    const client = createClient('https://quota-test.supabase.co', 'synthetic-anon-key', {
      auth: { storage: createBrowserAuthStorage(store), autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: async () => new Response(JSON.stringify({ access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user: { id: 'owner', aud: 'authenticated', email: 'test@example.invalid' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }) },
    })
    try {
      const result = await client.auth.signInWithPassword({ email: 'test@example.invalid', password: 'synthetic-password' })
      expect(result.error).toBeNull()
      expect(result.data.session?.user.id).toBe('owner')
      expect(JSON.parse(store.getItem('sb-quota-test-auth-token')!).access_token).toBe('synthetic-access')
      expect((await client.auth.getSession()).data.session?.user.id).toBe('owner')
      await client.auth.signOut({ scope: 'local' })
      expect(store.getItem('sb-quota-test-auth-token')).toBeNull()
      for (const [key, value] of Object.entries(notes)) expect(store.getItem(key)).toBe(value)
    } finally { await client.auth.stopAutoRefresh() }
  })
})
