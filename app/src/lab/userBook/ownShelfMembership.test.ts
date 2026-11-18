// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'
const server = vi.hoisted(() => ({ owner: 'alice', rows: new Map<string, any>(), writes: [] as any[] }))
vi.mock('./userBookStore', () => ({ userBookOwner: () => server.owner }))
vi.mock('../../services/supabase', () => ({ supabase: {
  auth: { getSession: async () => ({ data: { session: { user: { id: server.owner } } } }), onAuthStateChange: vi.fn() },
  from: () => ({ select: () => ({ eq: () => ({ like: async () => ({ data: [...server.rows.values()], error: null }) }) }) }),
  rpc: async (_name: string, p: any) => {
    server.writes.push(p)
    const old = server.rows.get(p.p_key)
    if ((old?.rev ?? null) !== p.p_expected_rev) return { data: [{ ...old, applied: false }], error: null }
    const row = { key: p.p_key, value: p.p_value, rev: (old?.rev ?? 0) + 1, updated_at: new Date().toISOString() }
    server.rows.set(p.p_key, row)
    return { data: [{ ...row, applied: true }], error: null }
  },
} }))
const hex = 'a'.repeat(24), id = `userbook-${hex}`
beforeEach(() => { localStorage.clear(); vi.resetModules(); server.rows.clear(); server.writes = []; server.owner = 'alice' })
async function freshDevice() {
  localStorage.clear(); vi.resetModules()
  return import('./ownShelfMembership')
}
it('converges Read later and removal on another device without changing its PDF place', async () => {
  await (await import('../../libraryTwoSaved')).setSavedBook(id, true, { tableHidden: true, at: 200, expectedOwner: 'alice' })
  let device = await freshDevice()
  const place = '{"page":14,"frac":0.37,"at":100,"zoom":1.25}'
  localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`, place)
  await device.syncOwnShelfMembership('alice', [], [hex])
  let own = await import('./ownShelf')
  expect(own.ownShelfSavedAt(hex)).toBe(200)
  expect(own.pdfReading(hex, {}, 0)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`)).toBe(place)
  await (await import('../../libraryTwoSaved')).setSavedBook(id, false, { tableHidden: true, at: 300, expectedOwner: 'alice' })
  device = await freshDevice()
  localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`, place)
  await device.syncOwnShelfMembership('alice', [], [hex])
  own = await import('./ownShelf')
  expect(own.ownSavedAt(hex)).toBe(300)
  expect(own.ownShelfSavedAt(hex)).toBeNull()
  expect(localStorage.getItem(`tinct-addbook:pos:pdf:${hex}`)).toBe(place)
  localStorage.setItem(`tinct-addbook:pos:pdf:${hex}`, '{"page":15,"frac":0.1,"at":400}')
  expect(own.pdfReading(hex, {}, 0)?.lastActiveAt).toBe(400)
})
it('migrates only owner-verified local hides with their original timestamp', async () => {
  const own = await import('./ownShelf')
  own.hideOwnFromReadingTable(hex, 100, { saved: false })
  own.hideOwnFromReadingTable('b'.repeat(24), 200)
  await (await import('./ownShelfMembership')).syncOwnShelfMembership('alice', [hex], [])
  expect(server.writes).toHaveLength(1)
  expect(server.writes[0]).toMatchObject({ p_user_id: 'alice', p_key: `library-shelf:${id}`, p_value: { saved: false, tableHidden: true, at: 100 } })
})
it('does not migrate an old hide over a newer remote re-add', async () => {
  const own = await import('./ownShelf')
  own.hideOwnFromReadingTable(hex, 100)
  server.rows.set(`library-shelf:${id}`, { key: `library-shelf:${id}`, value: { saved: true, at: 500 }, rev: 3 })
  await (await import('./ownShelfMembership')).syncOwnShelfMembership('alice', [hex], [])
  expect(own.ownSavedAt(hex)).toBeNull()
  expect(server.writes).toHaveLength(0)
})
it('does nothing for a different signed-in account', async () => {
  await (await import('./ownShelfMembership')).syncOwnShelfMembership('bob', [hex], [hex])
  expect(server.writes).toHaveLength(0)
  await expect((await import('../../libraryTwoSaved')).setSavedBook(id, true, { expectedOwner: 'bob' })).rejects.toThrow('Account changed')
  expect(localStorage.length).toBe(0)
})
it('keeps a newer hide when an older browser reconnects with an unsent Read later', async () => {
  localStorage.setItem('tinct:library-2-saved:alice', JSON.stringify({ items: { [id]: { saved: true, tableHidden: true, at: 100 } }, pending: { [id]: { saved: true, tableHidden: true, at: 100 } } }))
  server.rows.set(`library-shelf:${id}`, { key: `library-shelf:${id}`, value: { saved: false, tableHidden: true, at: 500 }, rev: 3 })
  await (await import('./ownShelfMembership')).syncOwnShelfMembership('alice', [], [hex])
  const own = await import('./ownShelf')
  expect(own.ownSavedAt(hex)).toBe(500)
  expect(own.ownShelfSavedAt(hex)).toBeNull()
  expect(server.writes).toHaveLength(0)
})
it('migrates a newer local hide over an older acknowledged choice', async () => {
  const own = await import('./ownShelf')
  own.hideOwnFromReadingTable(hex, 500, { saved: false })
  server.rows.set(`library-shelf:${id}`, { key: `library-shelf:${id}`, value: { saved: true, tableHidden: true, at: 100 }, rev: 3 })
  await (await import('./ownShelfMembership')).syncOwnShelfMembership('alice', [hex], [])
  expect(server.rows.get(`library-shelf:${id}`).value).toEqual({ saved: false, tableHidden: true, at: 500 })
  expect(own.ownShelfSavedAt(hex)).toBeNull()
})
