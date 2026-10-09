// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { accountOnlyBook, flushOwnPlaces, noteOwnPlace, pullAccountPlaces, pushOwnPlace, reconcileOpenPlace, reconcileOwnBooks } from './ownSync'
import { fetchAccountCopy, type AccountPlace } from './ownAccount'
import { readUserBookPlace, storedPlaceConverter, writeUserBookPlace } from './userBookPlace'
import type { UserBookEdition } from './userEdition'

const forget = vi.hoisted(() => vi.fn(async () => [] as string[]))
vi.mock('./ownShelf', async original => ({ ...await original<typeof import('./ownShelf')>(), forgetRemovedOwnBooks: forget }))

const HEX = 'ab12cd34ef56ab12cd34ef56'
const KEY = `tinct-addbook:place:${HEX}`
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
const chapters = [
  { number: 1, title: 'One', paragraphs: [words(50), words(50)] },
  { number: 2, title: 'Two', paragraphs: [words(50), words(50)] },
]
const edition = { title: 'Mine', chapters } as unknown as UserBookEdition
const kept = () => JSON.parse(localStorage.getItem(KEY) || 'null')

/** The account's places endpoint, in memory: versioned like worker/routes/userBooks.ts. */
function account(initial: Record<string, AccountPlace> = {}) {
  const places = { ...initial }
  const calls: Array<{ method: string; url: string; body: unknown; keepalive?: boolean }> = []
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input)
    const method = init.method ?? 'GET'
    const body = init.body ? JSON.parse(String(init.body)) : null
    calls.push({ method, url, body, keepalive: init.keepalive })
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    if (url === '/api/user-books/places') return Response.json({ places })
    const hex = url.split('/').pop()!
    const current = places[hex]
    if ((current?.rev ?? 0) !== body.rev) return Response.json({ error: 'conflict', place: current ?? null }, { status: 409 })
    places[hex] = { ...body.place, rev: (current?.rev ?? 0) + 1 }
    return Response.json({ place: places[hex] })
  }) as unknown as typeof fetch
  return { places, calls, fetchImpl }
}

beforeEach(() => { localStorage.clear(); forget.mockClear() })
afterEach(() => { vi.useRealTimers() })

describe('own-book places across devices', () => {
  it('takes an account place read later on another device, and keeps this device\'s newer one', async () => {
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 100 })
    const { fetchImpl } = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 3, updatedAt: 200, percent: 75, rev: 4 } })
    await pullAccountPlaces('tok', fetchImpl)
    expect(readUserBookPlace(HEX, edition)).toEqual({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 3, updatedAt: 200 })
    expect(kept()).toMatchObject({ rev: 4, savedAt: 200 })

    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 9, updatedAt: 300 })
    await pullAccountPlaces('tok', fetchImpl)
    expect(readUserBookPlace(HEX, edition)?.wordIndex).toBe(9)
    // The revision seen stays with the place this device noted since.
    expect(kept().rev).toBe(4)
  })

  it('saves this device\'s place with the revision it saw, the percent from its text, and no title', async () => {
    const { places, calls, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(places[HEX]).toEqual({ chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500, percent: 50, rev: 1 })
    expect(kept()).toMatchObject({ rev: 1, savedAt: 500, percent: 50 })
    expect(JSON.stringify(calls)).not.toContain('Mine')
    // Nothing new: nothing sent.
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('current')
    expect(calls).toHaveLength(1)
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 600 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(calls[1].body).toMatchObject({ rev: 1 })
    expect(places[HEX].rev).toBe(2)
  })

  it('on a stale revision: an older account place is replaced, a newer one is taken here instead', async () => {
    const older = account({ [HEX]: { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 100, rev: 7 } })
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 900 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl: older.fetchImpl, chapters })).toBe('saved')
    expect(older.calls.map(call => (call.body as { rev: number }).rev)).toEqual([0, 7])
    expect(older.places[HEX]).toMatchObject({ chapterNumber: 2, rev: 8 })

    localStorage.clear()
    const newer = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: 2_000, rev: 3 } })
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 1_000 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl: newer.fetchImpl, chapters })).toBe('adopted')
    expect(newer.places[HEX]).toMatchObject({ chapterNumber: 2, wordIndex: 5, rev: 3 })
    expect(readUserBookPlace(HEX, edition)).toMatchObject({ chapterNumber: 2, paragraphIndex: 1, wordIndex: 5, updatedAt: 2_000 })
  })

  it('a place keeps the conversion rules it was read under, to the account and back (storedPlaceConverter)', async () => {
    const { places, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 500, converter: 6 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl, chapters })).toBe('saved')
    expect(places[HEX]).toMatchObject({ converter: 6, rev: 1 })
    localStorage.clear()
    await pullAccountPlaces('tok', fetchImpl)
    expect(storedPlaceConverter(HEX)).toBe(6)
    expect(readUserBookPlace(HEX, edition)).toMatchObject({ chapterNumber: 2, converter: 6 })
    // A newer place on this device keeps its own rules and the revision it saw.
    writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 600, converter: 6 })
    expect(kept()).toMatchObject({ converter: 6, rev: 1 })
  })

  it('never sends the opening mark (no reading time) or anything signed out', async () => {
    const { calls, fetchImpl } = account()
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, updatedAt: 0 })
    expect(await pushOwnPlace(HEX, { token: 'tok', fetchImpl })).toBe('current')
    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 10 })
    expect(await pushOwnPlace(HEX, { token: null, fetchImpl })).toBe('unavailable')
    expect(calls).toEqual([])
  })

  it('the reader\'s notes are sent a moment later, the last one only, and at once when the page is hidden', async () => {
    vi.useFakeTimers()
    const { calls, fetchImpl } = account()
    const send = vi.spyOn(globalThis, 'fetch').mockImplementation(fetchImpl)
    const token = await import('./ownAccount')
    const tokenSpy = vi.spyOn(token, 'ownBookToken').mockResolvedValue('tok')
    try {
      writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 10 })
      noteOwnPlace(HEX, chapters)
      writeUserBookPlace(HEX, { chapterNumber: 2, paragraphIndex: 0, wordIndex: 0, updatedAt: 20 })
      noteOwnPlace(HEX, chapters)
      expect(calls).toHaveLength(0)
      flushOwnPlaces()
      await vi.waitFor(() => expect(calls).toHaveLength(1))
      expect(calls[0]).toMatchObject({ method: 'PUT', keepalive: true, body: { rev: 0, place: { chapterNumber: 2, updatedAt: 20 } } })
      await vi.advanceTimersByTimeAsync(5_000)
      expect(calls).toHaveLength(1)
    } finally {
      send.mockRestore()
      tokenSpy.mockRestore()
    }
  })

  it('before the reader opens: a newer account place is taken, a newer device place is saved; offline opens at once', async () => {
    const { places, fetchImpl } = account({ [HEX]: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 0, updatedAt: 500, rev: 1 } })
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl, chapters })
    expect(readUserBookPlace(HEX, edition)?.chapterNumber).toBe(2)

    writeUserBookPlace(HEX, { chapterNumber: 1, paragraphIndex: 1, wordIndex: 0, updatedAt: 900 })
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl, chapters })
    await vi.waitFor(() => expect(places[HEX]).toMatchObject({ chapterNumber: 1, updatedAt: 900, rev: 2 }))

    const never = vi.fn(() => new Promise<Response>(() => {})) as unknown as typeof fetch
    const started = Date.now()
    await reconcileOpenPlace(HEX, { token: 'tok', fetchImpl: never, timeoutMs: 50 })
    expect(Date.now() - started).toBeLessThan(1_000)
  })
})

describe('own books removed on another device', () => {
  it('forgets on this device the books the account no longer lists, then takes the account\'s places', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books'
      ? Response.json({ books: [{ id: 'f'.repeat(32), type: 'epub', sha256: 'c'.repeat(64), title: 'Kept', name: 'kept.epub', author: '', size: 1, createdAt: '2026-10-01T00:00:00Z' }] })
      : Response.json({ places: {} })) as unknown as typeof fetch
    const books = await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl })
    expect(books).toHaveLength(1)
    expect(forget).toHaveBeenCalledWith('owner-1', new Set([`epub:${'c'.repeat(24)}`]))
  })

  it('forgets nothing when the account cannot be read (offline, signed out, an error)', async () => {
    const failing = vi.fn(async () => new Response('', { status: 500 })) as unknown as typeof fetch
    expect(await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl: failing })).toBeNull()
    expect(await reconcileOwnBooks('owner-1', { token: null, fetchImpl: failing })).toBeNull()
    const offline = vi.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
    expect(await reconcileOwnBooks('owner-1', { token: 'tok', fetchImpl: offline })).toBeNull()
    expect(forget).not.toHaveBeenCalled()
  })

  it('lists an account EPUB not on this device to open in the reader, with the place and progress read elsewhere', () => {
    localStorage.setItem(`tinct-addbook:place:${'d'.repeat(24)}`, JSON.stringify({ chapterNumber: 3, paragraphIndex: 2, wordIndex: 0, updatedAt: 700, percent: 41.5 }))
    const book = accountOnlyBook({ id: 'e'.repeat(32), type: 'epub', sha256: 'd'.repeat(64), title: 'River Notes', name: 'river.epub', author: 'Me', size: 1, createdAt: '2026-10-01T00:00:00Z' })
    expect(book).toMatchObject({ key: `epub:${'d'.repeat(24)}`, href: `/reader?userBook=${'d'.repeat(24)}`, title: 'River Notes', cover: null })
    expect(book.reading).toMatchObject({ bookId: `userbook-${'d'.repeat(24)}`, percent: 41.5, lastActiveAt: 700 })
    const pdf = accountOnlyBook({ id: 'e'.repeat(32), type: 'pdf', sha256: 'a'.repeat(64), title: '', name: 'notes.pdf', author: '', size: 1, createdAt: '' })
    expect(pdf).toMatchObject({ title: 'notes', href: `/lab/addbook/?userBook=${'a'.repeat(24)}`, reading: null })
  })
})

describe('an account copy downloaded to this device', () => {
  const bytes = new TextEncoder().encode('an epub file').buffer
  async function hexOf(data: ArrayBuffer) {
    const digest = await crypto.subtle.digest('SHA-256', data)
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
  }
  it('is fetched by the book\'s hex and used only when its bytes match it', async () => {
    const sha = await hexOf(bytes)
    const list = { books: [{ id: 'a'.repeat(32), type: 'epub', sha256: sha, title: 'T', name: 't.epub', author: '', size: 12, createdAt: '' }] }
    const ok = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books' ? Response.json(list) : new Response(bytes)) as unknown as typeof fetch
    const copy = await fetchAccountCopy(sha.slice(0, 24), 'tok', ok)
    expect(copy.status).toBe('found')
    const altered = vi.fn(async (input: RequestInfo | URL) => String(input) === '/api/user-books' ? Response.json(list) : new Response('something else')) as unknown as typeof fetch
    expect((await fetchAccountCopy(sha.slice(0, 24), 'tok', altered)).status).toBe('unavailable')
    expect((await fetchAccountCopy('0'.repeat(24), 'tok', ok)).status).toBe('gone')
    expect((await fetchAccountCopy(sha.slice(0, 24), null, ok)).status).toBe('unavailable')
    const pdfList = vi.fn(async () => Response.json({ books: [{ ...list.books[0], type: 'pdf' }] })) as unknown as typeof fetch
    expect((await fetchAccountCopy(sha.slice(0, 24), 'tok', pdfList)).status).toBe('pdf')
  })
})
