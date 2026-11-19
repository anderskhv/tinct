// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { offerCoverToAccount, sendMissingCovers, storedCovers, type CachedCover, type CoverCache } from './ownCovers'
import { fetchAccountCover, listAccountBooks, putAccountCover, type AccountBook } from './ownAccount'
import { ownShelfWithAccount } from './ownSync'
import { ownTableBook } from '../../libraryTwoReading'
import { ownQuickBookRows } from '../../preReader/quickBookSwitcher'

const forget = vi.hoisted(() => vi.fn(async () => [] as string[]))
const local = vi.hoisted(() => ({ books: [] as unknown[] }))
vi.mock('./ownShelf', async original => ({
  ...await original<typeof import('./ownShelf')>(),
  forgetRemovedOwnBooks: forget,
  readOwnShelf: async () => local.books,
}))

const HEX = 'ab12cd34ef56ab12cd34ef56'
const OTHER = 'ff00ff00ff00ff00ff00ff00'
const sha = (hex: string) => hex + '0'.repeat(40)
const LOCAL_COVER = 'data:image/jpeg;base64,TE9DQUw='
const book = (hex: string, cover: string | null, type: 'epub' | 'pdf' = 'epub'): AccountBook => ({
  id: hex.slice(0, 8).padEnd(32, '0'), type, name: `${hex}.${type}`, title: `Book ${hex.slice(0, 4)}`, author: 'A. Reader', size: 10, sha256: sha(hex), createdAt: '2026-10-09T00:00:00.000Z', cover,
})
const coverUrl = (hex: string, v = 'k1') => `/api/user-books/covers/${hex}?v=${v}`
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])

/** The account, in memory: its list (books with their cover URL), places and stored covers. */
function account(books: AccountBook[]) {
  const stored = new Map<string, { bytes: Uint8Array; type: string }>()
  const calls: Array<{ method: string; url: string; type?: string; size?: number }> = []
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input)
    const method = init.method ?? 'GET'
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    if (url === '/api/user-books') return Response.json({ books })
    if (url === '/api/user-books/places') return Response.json({ places: {} })
    const match = /^\/api\/user-books\/covers\/([0-9a-f]{24})(\?v=\w+)?$/.exec(url)
    if (!match) return new Response('no', { status: 404 })
    if (method === 'PUT') {
      const body = init.body as Blob
      calls.push({ method, url, type: (init.headers as Record<string, string>)['Content-Type'], size: body.size })
      stored.set(match[1], { bytes: new Uint8Array(await body.arrayBuffer()), type: body.type })
      const listed = books.find(item => item.sha256.startsWith(match[1]))
      if (listed) listed.cover = coverUrl(match[1], 'k2')
      return Response.json({ cover: coverUrl(match[1], 'k2') })
    }
    calls.push({ method, url })
    const cover = stored.get(match[1])
    return cover ? new Response(cover.bytes as unknown as BodyInit, { headers: { 'Content-Type': cover.type } }) : new Response('no', { status: 404 })
  }) as unknown as typeof fetch
  return { books, stored, calls, fetchImpl }
}

function memoryCache(): CoverCache & { items: Map<string, CachedCover> } {
  const items = new Map<string, CachedCover>()
  return {
    items,
    async read(owner) { return new Map([...items].filter(([, item]) => item.owner === owner)) },
    async keep(item) { items.set(item.hex, item) },
    async drop(hexes) { for (const hex of hexes) items.delete(hex) },
  }
}

const shrink = vi.fn(async (url: string) => (url.startsWith('data:image/') ? new Blob([JPEG], { type: 'image/jpeg' }) : null))

beforeEach(() => { localStorage.clear(); local.books = []; shrink.mockClear(); forget.mockClear() })
afterEach(() => { vi.restoreAllMocks() })

describe('sending this device\'s covers to the account', () => {
  it('sends the small copy of a kept cover for a book whose account copy has none, and only then', async () => {
    const acct = account([book(HEX, null), book(OTHER, coverUrl(OTHER))])
    const sent = await sendMissingCovers([
      { hex: HEX, cover: LOCAL_COVER },
      // Already stored in the account: not sent again.
      { hex: OTHER, cover: LOCAL_COVER },
      // No picture here, or not an image: nothing to send.
      { hex: 'cd'.repeat(12), cover: null },
    ], acct.books, { token: 'tok', fetchImpl: acct.fetchImpl, shrink })
    expect(sent).toEqual([HEX])
    expect(acct.calls).toEqual([{ method: 'PUT', url: `/api/user-books/covers/${HEX}`, type: 'image/jpeg', size: JPEG.byteLength }])
    expect(shrink).toHaveBeenCalledTimes(1)
  })

  it('sends nothing signed out, nothing too large, and nothing that is not a JPEG or WebP', async () => {
    const acct = account([book(HEX, null)])
    expect(await sendMissingCovers([{ hex: HEX, cover: LOCAL_COVER }], acct.books, { token: null, fetchImpl: acct.fetchImpl, shrink })).toEqual([])
    const big = async () => new Blob([new Uint8Array(64 * 1024 + 1)], { type: 'image/jpeg' })
    expect(await sendMissingCovers([{ hex: HEX, cover: LOCAL_COVER }], acct.books, { token: 'tok', fetchImpl: acct.fetchImpl, shrink: big })).toEqual([])
    expect(await putAccountCover(HEX, new Blob(['<svg/>'], { type: 'image/svg+xml' }), 'tok', acct.fetchImpl)).toBeNull()
    expect(acct.calls).toEqual([])
  })

  it('offers a freshly drawn cover (healCover) when the account copy has none', async () => {
    const acct = account([book(HEX, null)])
    expect(await offerCoverToAccount(HEX, LOCAL_COVER, { token: 'tok', fetchImpl: acct.fetchImpl, shrink })).toBe(true)
    expect(acct.stored.has(HEX)).toBe(true)
    // Stored now: offered again, it is not sent twice.
    expect(await offerCoverToAccount(HEX, LOCAL_COVER, { token: 'tok', fetchImpl: acct.fetchImpl, shrink })).toBe(false)
    expect(acct.calls.filter(call => call.method === 'PUT')).toHaveLength(1)
  })
})

describe('the account\'s stored covers on another device', () => {
  it('reads a stored cover once, keeps it on this device, and reads it again only when it changes', async () => {
    const acct = account([book(HEX, coverUrl(HEX, 'k1'))])
    acct.stored.set(HEX, { bytes: JPEG, type: 'image/jpeg' })
    const cache = memoryCache()
    const first = await storedCovers('owner-b', acct.books, new Set([HEX]), { token: 'tok', fetchImpl: acct.fetchImpl, cache })
    expect(first.get(HEX)).toMatch(/^data:image\/jpeg;base64,/)
    expect(cache.items.get(HEX)).toMatchObject({ owner: 'owner-b', v: 'k1' })
    expect(acct.calls).toHaveLength(1)
    // The next listing wears the kept copy: nothing is downloaded.
    expect((await storedCovers('owner-b', acct.books, new Set([HEX]), { token: 'tok', fetchImpl: acct.fetchImpl, cache })).get(HEX)).toBe(first.get(HEX))
    expect(acct.calls).toHaveLength(1)
    // A new cover in the account (a new ?v=) is read again.
    acct.books[0].cover = coverUrl(HEX, 'k9')
    await storedCovers('owner-b', acct.books, new Set([HEX]), { token: 'tok', fetchImpl: acct.fetchImpl, cache })
    expect(acct.calls).toHaveLength(2)
    expect(cache.items.get(HEX)?.v).toBe('k9')
    // Offline (no account list): the kept copy as it is.
    expect((await storedCovers('owner-b', null, new Set([HEX]), { cache })).get(HEX)).toMatch(/^data:image\/jpeg;base64,/)
    // Another account on this browser does not see it.
    expect((await storedCovers('owner-c', null, new Set([HEX]), { cache })).size).toBe(0)
  })

  it('reads none for a book with a picture on this device, and forgets kept covers of books gone from the account', async () => {
    const acct = account([book(HEX, coverUrl(HEX))])
    acct.stored.set(HEX, { bytes: JPEG, type: 'image/jpeg' })
    const cache = memoryCache()
    await cache.keep({ hex: OTHER, owner: 'owner-b', v: 'k1', url: LOCAL_COVER })
    expect((await storedCovers('owner-b', acct.books, new Set(), { token: 'tok', fetchImpl: acct.fetchImpl, cache })).size).toBe(0)
    expect(acct.calls).toEqual([])
    await vi.waitFor(() => expect(cache.items.has(OTHER)).toBe(false))
  })

  it('refuses a stored cover that is not an image of the account\'s own URL', async () => {
    const acct = account([])
    expect(await fetchAccountCover('https://evil.example/x.jpg', 'tok', acct.fetchImpl)).toBeNull()
    expect(await fetchAccountCover(`/api/user-books/covers/${HEX}?v=k1`, null, acct.fetchImpl)).toBeNull()
    const html = vi.fn(async () => new Response('<html>', { headers: { 'Content-Type': 'text/html' } })) as unknown as typeof fetch
    expect(await fetchAccountCover(`/api/user-books/covers/${HEX}?v=k1`, 'tok', html)).toBeNull()
    // The list's cover URL is kept only when it names that book.
    const listed = await listAccountBooks('tok', vi.fn(async () => Response.json({ books: [{ ...book(HEX, coverUrl(OTHER)) }, { ...book(OTHER, 'javascript:alert(1)') }] })) as unknown as typeof fetch)
    expect(listed?.map(item => item.cover)).toEqual([null, null])
  })
})

describe('device B lists a book added on device A with its real cover', () => {
  it('My shelf, the reading table and the reader\'s switcher wear the stored cover; this device\'s own picture wins', async () => {
    const acct = account([book(HEX, coverUrl(HEX)), book(OTHER, coverUrl(OTHER), 'pdf')])
    acct.stored.set(HEX, { bytes: JPEG, type: 'image/jpeg' })
    acct.stored.set(OTHER, { bytes: JPEG, type: 'image/jpeg' })
    // The PDF is on this device too, with its own picture.
    local.books = [{ key: `pdf:${OTHER}`, kind: 'pdf', hex: OTHER, title: 'Here', author: '', cover: LOCAL_COVER, at: 5, href: '/lab/addbook/?userBook=' + OTHER, reading: null }]
    localStorage.setItem(`tinct-addbook:place:${HEX}`, JSON.stringify({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 10, percent: 40 }))
    const shelf = await ownShelfWithAccount('owner-b', { token: 'tok', fetchImpl: acct.fetchImpl, cache: memoryCache(), shrink })
    const added = shelf.find(item => item.hex === HEX)!
    expect(added.cover).toBeNull()
    expect(added.storedCover).toMatch(/^data:image\/jpeg;base64,/)
    const here = shelf.find(item => item.hex === OTHER)!
    expect(here.cover).toBe(LOCAL_COVER)
    expect(here.storedCover).toBeUndefined()
    // Only the book with no picture here was downloaded.
    expect(acct.calls.filter(call => call.method === 'GET')).toEqual([{ method: 'GET', url: coverUrl(HEX) }])
    const reading = added as typeof added & { reading: NonNullable<typeof added.reading> }
    expect(ownTableBook(reading).cover).toBe(added.storedCover)
    expect(ownQuickBookRows([reading])[0].coverSrc).toBe(added.storedCover)
  })

  it('sends this device\'s cover for an account copy that has none while it lists the books (backfill)', async () => {
    const acct = account([book(HEX, null)])
    local.books = [{ key: `epub:${HEX}`, kind: 'epub', hex: HEX, title: 'Mine', author: '', cover: LOCAL_COVER, at: 5, href: '/reader?userBook=' + HEX, reading: null }]
    await ownShelfWithAccount('owner-a', { token: 'tok', fetchImpl: acct.fetchImpl, cache: memoryCache(), shrink })
    await vi.waitFor(() => expect(acct.stored.has(HEX)).toBe(true))
    expect(acct.calls.filter(call => call.method === 'PUT')).toHaveLength(1)
  })
})
