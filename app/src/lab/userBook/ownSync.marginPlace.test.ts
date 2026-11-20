// @vitest-environment jsdom
/**
 * "I'm reading a private book on my desktop, but my phone is opening the bible...?" (Anders, 4 Nov 2026).
 *
 * The desktop reads an own EPUB in Margin view (Add a book's margin reader, the desktop's default), which keeps
 * its place only as `tinct-addbook:pos:epub:<hex>` (its words). Before the fix nothing sent that place to the
 * account, so a phone (no copy of the book, only the account) had no recent place for it and led with the Bible
 * read earlier. Now the margin place becomes the Tinct reader's place and is saved, and the phone leads with it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeIndexedDb } from './fakeIndexedDb.test-helpers'
import type { UserBookEdition } from './userEdition'
import type { AccountPlace } from './ownAccount'
import { withOwnReading, type ReadingTableBook } from '../../libraryTwoReading'

vi.mock('./ownAccount', async original => ({ ...await original<typeof import('./ownAccount')>(), ownBookToken: async () => 'tok' }))
vi.mock('./ownShelf', async original => ({ ...await original<typeof import('./ownShelf')>(), forgetRemovedOwnBooks: async () => [] }))
vi.mock('./ownCovers', async original => ({ ...await original<typeof import('./ownCovers')>(), sendMissingCovers: async () => [], storedCovers: async () => new Map() }))

const { noteEpubMarginPlace } = await import('./ownSync')
const { ownReadingNowWithAccount } = await import('./ownSync')

const OWNER = 'u-anders'
const HEX = 'ab12cd34ef56ab12cd34ef56'
const HEX2 = '1234567890abcdef12345678'
const SHA = HEX + '0'.repeat(40)
const T1 = Date.parse('2026-11-03T20:00:00Z') // the Bible, read on the phone
const T2 = Date.parse('2026-11-04T09:00:00Z') // the own EPUB, read on the desktop in Margin view
const words = (from: number, n: number) => Array.from({ length: n }, (_, i) => `word${from + i}`).join(' ')
const edition = {
  format: 'tinct-user-edition-v1', title: 'River Notes', author: 'Me', converter: 8,
  chapters: [
    { number: 1, title: 'One', paragraphs: [words(0, 40), words(40, 40)] },
    { number: 2, title: 'Two', paragraphs: [words(80, 40), words(120, 40)] },
  ],
} as unknown as UserBookEdition

const signIn = () => localStorage.setItem('sb-x-auth-token', JSON.stringify({ user: { id: OWNER, email: 'a@example.com' } }))

/** The account, in memory: its book list and its places endpoint, versioned like worker/routes/userBooks.ts. */
function account() {
  const places: Record<string, AccountPlace> = {}
  const books = [{ id: 'e'.repeat(32), type: 'epub', sha256: SHA, title: 'River Notes', name: 'river.epub', author: 'Me', size: 1, createdAt: '2026-10-01T00:00:00Z' }]
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input)
    const method = init.method ?? 'GET'
    if (url === '/api/user-books' && method === 'GET') return Response.json({ books })
    if (url === '/api/user-books/places' && method === 'GET') return Response.json({ places })
    if (url.startsWith('/api/user-books/places/') && method === 'PUT') {
      const body = JSON.parse(String(init.body))
      const hex = url.split('/').pop()!
      const current = places[hex]
      if ((current?.rev ?? 0) !== body.rev) return Response.json({ error: 'conflict', place: current ?? null }, { status: 409 })
      places[hex] = { ...body.place, rev: (current?.rev ?? 0) + 1 }
      return Response.json({ place: places[hex] })
    }
    return Response.json({ error: 'not_found' }, { status: 404 })
  }) as unknown as typeof fetch
  return { places, fetchImpl }
}

const bible: ReadingTableBook = {
  bookId: 'bible', title: 'The Bible', author: '', cover: null, wordCount: null, displayYear: '', tone: null,
  chapterLabel: 'Genesis 3', headline: '', percent: 4, recap: null, lastActiveAt: T1,
} as ReadingTableBook

beforeEach(() => { localStorage.clear(); signIn() })
afterEach(() => { delete (globalThis as { indexedDB?: unknown }).indexedDB; vi.useRealTimers() })

describe('an own EPUB read in Margin view on the desktop, then the phone', () => {
  it('saves the margin place to the account, and the phone leads with the book, not the Bible read before it', async () => {
    const remote = account()

    // Desktop: the book is on this device (with its Tinct text), read only in Margin view at T2.
    const records = new Map<string, Record<string, unknown>>([[`epub:${HEX}`, { key: `epub:${HEX}`, kind: 'epub', owner: OWNER, name: 'river.epub', title: 'River Notes', edition }]])
    ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX}`, JSON.stringify({ page: 2, para: 1, word: 5, quote: words(125, 14), at: T2 }))
    await noteEpubMarginPlace(HEX, { now: true, fetchImpl: remote.fetchImpl })
    await vi.waitFor(() => expect(remote.places[HEX]).toBeDefined())
    // The same words in the Tinct text: chapter 2, paragraph 1, word 5, read at T2.
    expect(remote.places[HEX]).toMatchObject({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: T2, converter: 8 })
    // Nothing of the book's text goes with it.
    expect(Object.keys(remote.places[HEX]).sort()).toEqual(['chapterNumber', 'converter', 'paragraphIndex', 'percent', 'rev', 'updatedAt', 'wordIndex'])

    // Phone: nothing of the book on this device, only the account.
    delete (globalThis as { indexedDB?: unknown }).indexedDB
    localStorage.clear(); signIn()
    const own = await ownReadingNowWithAccount(OWNER, { token: 'tok', fetchImpl: remote.fetchImpl })
    expect(own.map(book => book.reading.bookId)).toEqual([`userbook-${HEX}`])
    expect(own[0].reading.lastActiveAt).toBe(T2)
    const table = withOwnReading([bible], own)
    expect(table[0].bookId).toBe(`userbook-${HEX}`)
    expect(table[1].bookId).toBe('bible')
  })

  it('converts a book never opened in the Tinct reader on this device, once, and keeps the text on its record', async () => {
    const remote = account()
    const records = new Map<string, Record<string, unknown>>([[`epub:${HEX2}`, { key: `epub:${HEX2}`, kind: 'epub', owner: OWNER, name: 'river.epub', title: 'River Notes', bytes: new ArrayBuffer(4) }]])
    ;(globalThis as { indexedDB?: unknown }).indexedDB = fakeIndexedDb(records)
    const { ownEpubEdition } = await import('./userBookStore')
    const convert = vi.fn(async () => ({ edition, images: new Map() }))
    const load = (hex: string, owner: string) => ownEpubEdition(hex, owner, convert)
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX2}`, JSON.stringify({ page: 1, para: 0, word: 0, quote: words(40, 14), at: T2 }))
    await noteEpubMarginPlace('cd34ef56ab12cd34ef56ab12', { now: true, fetchImpl: remote.fetchImpl, edition: async () => null })
    await noteEpubMarginPlace(HEX2, { now: true, fetchImpl: remote.fetchImpl, edition: load })
    await vi.waitFor(() => expect(remote.places[HEX2]).toMatchObject({ chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: T2 }))
    expect(convert).toHaveBeenCalledTimes(1)
    expect(records.get(`epub:${HEX2}`)?.edition).toBe(edition)
    // A later move uses the text already found: no second conversion, the newer place saved.
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX2}`, JSON.stringify({ page: 1, para: 0, word: 0, quote: words(85, 14), at: T2 + 1000 }))
    await noteEpubMarginPlace(HEX2, { now: true, fetchImpl: remote.fetchImpl, edition: load })
    await vi.waitFor(() => expect(remote.places[HEX2]).toMatchObject({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 5, updatedAt: T2 + 1000 }))
    expect(convert).toHaveBeenCalledTimes(1)
  })

  it('writes and sends nothing signed out, or for a book it has no text for', async () => {
    const remote = account()
    localStorage.setItem(`tinct-addbook:pos:epub:${HEX}`, JSON.stringify({ quote: words(0, 14), at: T2 }))
    await noteEpubMarginPlace('ef56ab12cd34ef56ab12cd34', { now: true, fetchImpl: remote.fetchImpl, edition: async () => null })
    localStorage.removeItem('sb-x-auth-token')
    await noteEpubMarginPlace('0123456789abcdef01234567', { now: true, fetchImpl: remote.fetchImpl, edition: async () => edition })
    expect(remote.fetchImpl).not.toHaveBeenCalled()
    expect(localStorage.getItem('tinct-addbook:place:0123456789abcdef01234567')).toBeNull()
  })
})
