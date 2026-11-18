// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRestrictedBookIds, loadRestrictedBookIds, parseRestrictedBookIds, resetRestrictedBookIdsForTest, RESTRICTED_BOOKS_URL } from './restrictedBooks'

afterEach(() => { resetRestrictedBookIdsForTest(); vi.restoreAllMocks() })

describe('restricted books signal (client)', () => {
  it('reads only well-formed book ids', () => {
    expect([...parseRestrictedBookIds({ restrictedBookIds: ['master-and-margarita', 7, '../x', 'ODYSSEY'] })]).toEqual(['master-and-margarita'])
    expect(parseRestrictedBookIds(null).size).toBe(0)
  })
  it('fails open: an error, an old Worker or offline means none', async () => {
    expect((await fetchRestrictedBookIds(async () => { throw new Error('offline') })).size).toBe(0)
    expect((await fetchRestrictedBookIds(async () => new Response('Not found', { status: 404 }))).size).toBe(0)
    expect((await fetchRestrictedBookIds(async () => new Response('not json'))).size).toBe(0)
  })
  it('asks once per page, without cookies or cache, and stores nothing', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const fetchImpl = vi.fn(async () => Response.json({ restrictedBookIds: ['master-and-margarita'] }))
    const first = await loadRestrictedBookIds(fetchImpl)
    const second = await loadRestrictedBookIds(fetchImpl)
    expect([...first]).toEqual(['master-and-margarita'])
    expect(second).toBe(first)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl).toHaveBeenCalledWith(RESTRICTED_BOOKS_URL, { cache: 'no-store', credentials: 'omit' })
    expect(setItem).not.toHaveBeenCalled()
  })
})
