// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { emptyLabPositionState } from './lab/labPosition'
import type { RecapLoadDeps } from './readingMemory/recapLoad'

const calls = vi.hoisted(() => ({
  membership: vi.fn(), saved: vi.fn(),
  auth: vi.fn(), memory: vi.fn(), localPositions: vi.fn(), cloudPositions: vi.fn(),
  completions: vi.fn(), readingList: vi.fn(), readMemory: vi.fn(),
  readPosition: vi.fn(), writePosition: vi.fn(), putPosition: vi.fn(), onAuth: vi.fn(),
  ownShelf: vi.fn(async () => []),
}))
// The reader's own books (their private account copies and places): an independent read, stubbed here.
vi.mock('./lab/userBook/ownSync', async original => {
  const { ownReadingNow } = await import('./lab/userBook/ownShelf')
  return {
    ...await original<typeof import('./lab/userBook/ownSync')>(), ownShelfWithAccount: calls.ownShelf,
    ownReadingNowWithAccount: async (owner: string | null) => owner ? ownReadingNow(await calls.ownShelf() ?? []) : [],
  }
})
vi.mock('./libraryTwoSaved', () => ({ loadShelfMembership: calls.membership, setSavedBook: calls.saved, loadSavedBooks: vi.fn() }))
vi.mock('./services/supabase', () => ({
  supabase: {
    auth: { getSession: calls.auth, onAuthStateChange: calls.onAuth },
    from: () => ({ select: () => ({ eq: () => ({ or: calls.completions }) }) }),
  },
  isSupabaseConfigured: () => true,
}))
vi.mock('./readingMemory/recapLoad', () => ({ loadRecap: calls.memory }))
vi.mock('./lab/labPositionStore', () => ({
  prepareLabPositionLocal: calls.localPositions, fetchLabPositionCloud: calls.cloudPositions,
  readLabPositionLocal: calls.readPosition, writeLabPositionLocal: calls.writePosition, putLabPositionCloud: calls.putPosition,
}))
vi.mock('./readingMemory/deviceStore', async original => ({
  ...await original<typeof import('./readingMemory/deviceStore')>(), readDeviceReadingMemory: calls.readMemory,
}))
vi.mock('./preReader/libraryRecap', async original => ({
  ...await original<typeof import('./preReader/libraryRecap')>(), readingList: calls.readingList,
}))

function gate<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => { calls.readPosition.mockReturnValue(emptyLabPositionState('device-a', null)); calls.writePosition.mockImplementation(value => value); calls.membership.mockResolvedValue({ removed: [], tableHidden: [] }); calls.saved.mockResolvedValue({ ids: [], synced: true }) })
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); vi.resetModules(); localStorage.clear() })


// Books not served in the visitor's country (public/lab/restricted-books.js): off the desk, never off the account.
describe('a country-restricted book on the desk', () => {
  const target = { chapterNumber: 7, pageIndex: 0, paragraphIndex: 4, wordIndex: 0, editionKey: 'modern-en', chapterLabel: '7. The bad apartment', at: 100 }
  const row = (bookId: string) => ({ bookId, target, finishedChapters: [], progress: 'middle', lastActiveAt: 100, session: null, recap: null })
  const entry = (id: string, extra: Record<string, unknown> = {}) => ({ id, title: id, author: 'Author', defaultEditionKey: 'modern-en', editions: [{ key: 'modern-en', language: 'en', style: 'modern' }], readingStructure: { chapters: [{ number: 7, title: '7', paragraphCount: 40 }] }, ...extra })
  function reads() {
    calls.auth.mockResolvedValue({ data: { session: null } })
    const positions = emptyLabPositionState('device-a', null)
    positions.books['master-and-margarita'] = { bookId: 'master-and-margarita', headerBook: 'master-and-margarita', chapterNumber: 7, sequentialChapter: 7, paragraphIndex: 4, wordIndex: 0, updatedAt: 100, deviceId: 'device-a', rev: 1 }
    calls.localPositions.mockResolvedValue(positions)
    calls.memory.mockResolvedValue(null)
    calls.readMemory.mockReturnValue({ version: 1, sessions: {}, updatedAt: 0 })
    calls.readingList.mockReturnValue({ readingNow: [row('master-and-margarita'), row('anna-karenina')], finished: [{ bookId: 'master-and-margarita', finishedAt: 50 }] })
    return structuredClone(positions)
  }

  it('leaves the book off the table and Finished, writes no position, and keeps the saved place', async () => {
    const before = reads()
    const { loadReadingTable } = await import('./libraryTwoReading')
    const table = await loadReadingTable({ catalogue: Promise.resolve({ books: [entry('master-and-margarita', { restricted: true, discoveryAvailable: false }), entry('anna-karenina')] }) })
    expect(table.reading.map(book => book.bookId)).toEqual(['anna-karenina'])
    expect(table.shelfReading?.map(book => book.bookId)).toEqual(['anna-karenina'])
    expect(table.finished).toEqual([])
    expect(calls.writePosition).not.toHaveBeenCalled()
    expect(calls.putPosition).not.toHaveBeenCalled()
    expect(calls.saved).not.toHaveBeenCalled()
    expect(calls.readingList.mock.calls[0][0].positions.books['master-and-margarita']).toMatchObject({ chapterNumber: before.books['master-and-margarita'].chapterNumber, paragraphIndex: 4 })
    // The fast-paint snapshot written for the next visit does not carry it either.
    expect(localStorage.getItem('tinct:library-2-table:guest')).not.toContain('master-and-margarita')
  })

  it('keeps the book where it is served (no restriction in the catalogue)', async () => {
    reads()
    const { loadReadingTable } = await import('./libraryTwoReading')
    const table = await loadReadingTable({ catalogue: Promise.resolve({ books: [entry('master-and-margarita'), entry('anna-karenina')] }) })
    expect(table.reading.map(book => book.bookId)).toEqual(['master-and-margarita', 'anna-karenina'])
  })

  it('takes it off a cached first paint once the page knows, without asking for anything itself', async () => {
    reads()
    const fetch = vi.fn(async () => Response.json({ books: [] }))
    vi.stubGlobal('fetch', fetch)
    ;(window as unknown as Record<string, unknown>).__tinctRestrictedBooks = Promise.resolve(new Set(['master-and-margarita']))
    localStorage.setItem('tinct:library-2-table:guest', JSON.stringify({ mode: 'returning', reading: [{ bookId: 'master-and-margarita', title: 'M' }, { bookId: 'anna-karenina', title: 'A' }], finished: [] }))
    const painted: Array<{ reading: Array<{ bookId: string }> }> = []
    const { loadReadingTable } = await import('./libraryTwoReading')
    await loadReadingTable({ catalogue: Promise.resolve({ books: [entry('anna-karenina')] }), onCached: table => painted.push(table) })
    expect(painted[0].reading.map(book => book.bookId)).toEqual(['anna-karenina'])
    expect(fetch.mock.calls.some(call => String(call[0]).includes('restricted-books'))).toBe(false)
    delete (window as unknown as Record<string, unknown>).__tinctRestrictedBooks
  })

  it('withoutRestrictedBooks: an empty desk becomes the new-reader library; nothing else changes', async () => {
    const { withoutRestrictedBooks } = await import('./libraryTwoReading')
    const table = { mode: 'returning' as const, reading: [{ bookId: 'master-and-margarita' }], finished: [], shelfReading: [{ bookId: 'master-and-margarita' }] } as never
    expect(withoutRestrictedBooks(table, new Set())).toBe(table)
    expect(withoutRestrictedBooks(table, new Set(['master-and-margarita']))).toMatchObject({ mode: 'new', reading: [], shelfReading: [] })
  })
})
