// @vitest-environment jsdom
// Stripe Checkout's return to the reader for a Modern English edition:
// `/reader?book=<id>&modern=1&session_id=…` (paid) and `/reader?book=<id>&modern=cancel`.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { PRE_READER_CATALOGUE } from '../preReader/catalogue'
import { bookFromEntry, preloadPublicBooksForReader, registerPublicBook, type PublicEntry } from '../utils/publicBooks'
import { cancelModernCheckout, modernReturnFromParams, pendingPurchase } from './labModernEditionApi'
import { handoffForModernReturn, modernReturnHandoff } from './labReaderHandoff'

const BOOK = 'pd-pg-158'
const entry = (id: string) => ({
  id, title: 'Emma', author: 'Jane Austen', wordCount: 160000,
  editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', availability: { chapterText: true, audio: false, compare: false } }],
  readingStructure: { totalParagraphs: 20, chapters: [{ number: 1, title: 'Chapter I', paragraphCount: 10 }, { number: 2, title: 'Chapter II', paragraphCount: 10 }] },
})
const register = (id: string) => { const e = entry(id); registerPublicBook(bookFromEntry(e as unknown as PublicEntry), e) }

afterEach(() => {
  for (let i = BOOKS.length - 1; i >= 0; i--) if (BOOKS[i].id.startsWith('pd-')) BOOKS.splice(i, 1)
  const byId = PRE_READER_CATALOGUE.booksById as Map<string, unknown>
  for (const id of [...byId.keys()]) if (id.startsWith('pd-')) byId.delete(id)
  sessionStorage.clear()
  localStorage.clear()
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('the return parameters', () => {
  const read = (query: string) => modernReturnFromParams(new URLSearchParams(query))

  it('reads a paid and a cancelled return for an added public book', () => {
    expect(read(`book=${BOOK}&modern=1&session_id=cs_test_a1B2`)).toEqual({ bookId: BOOK, kind: 'paid', sessionId: 'cs_test_a1B2' })
    expect(read(`book=${BOOK}&modern=cancel`)).toEqual({ bookId: BOOK, kind: 'cancel', sessionId: null })
  })

  it('accepts only a public book id and the two return kinds; a malformed session id is dropped', () => {
    expect(read('book=frankenstein&modern=1')).toBeNull() // a registry book: not a Modern English purchase
    expect(read('book=../api/x&modern=1')).toBeNull()
    expect(read('book=pd-pg-1%3Cscript%3E&modern=1')).toBeNull()
    expect(read(`book=${BOOK}`)).toBeNull()
    expect(read(`book=${BOOK}&modern=yes`)).toBeNull()
    expect(read('modern=1')).toBeNull()
    expect(read(`book=${BOOK}&modern=1&session_id={CHECKOUT_SESSION_ID}`)).toEqual({ bookId: BOOK, kind: 'paid', sessionId: null })
    expect(read(`book=${BOOK}&modern=1&session_id=cs_x"><img`)?.sessionId).toBeNull()
  })
})

describe('where a return opens', () => {
  it('opens the named book at the reader’s latest place, else its first chapter, in its default edition', () => {
    register(BOOK)
    expect(modernReturnHandoff(BOOK)).toEqual({
      kind: 'open-reader', bookId: BOOK, primaryEditionKey: 'original-en', resumeLatest: true,
      savedPlace: { bookId: BOOK, chapterNumber: 1, paragraphIndex: 0, wordIndex: 0, page: 0 },
    })
    expect(modernReturnHandoff('pd-pg-404')).toBeNull() // not registered: opens nothing
  })

  it('another tab or browser (no hand-off stored): the book from the URL, and a paid return marks the purchase', () => {
    register(BOOK)
    const handoff = handoffForModernReturn({ bookId: BOOK, kind: 'paid', sessionId: 'cs_1' }, null)
    expect(handoff?.bookId).toBe(BOOK)
    expect(pendingPurchase()).toBe(BOOK)
  })

  it('the same tab: its stored hand-off for that book wins (it carries the place), a stale one for another book does not', () => {
    register(BOOK)
    const stored = { kind: 'open-reader' as const, bookId: BOOK, primaryEditionKey: 'original-en', resumeLatest: true, savedPlace: { bookId: BOOK, chapterNumber: 2, paragraphIndex: 4, wordIndex: 0, page: 3 } }
    expect(handoffForModernReturn({ bookId: BOOK, kind: 'paid', sessionId: null }, stored)).toBe(stored)
    const other = { ...stored, bookId: 'frankenstein', savedPlace: { ...stored.savedPlace, bookId: 'frankenstein' } }
    expect(handoffForModernReturn({ bookId: BOOK, kind: 'paid', sessionId: null }, other)?.bookId).toBe(BOOK)
    // An unknown book in the URL leaves the tab's own hand-off.
    expect(handoffForModernReturn({ bookId: 'pd-pg-404', kind: 'paid', sessionId: null }, other)).toBe(other)
  })

  it('a cancelled return opens the book and clears its purchase mark', () => {
    register(BOOK)
    sessionStorage.setItem('tinct:modern-purchase', BOOK)
    expect(handoffForModernReturn({ bookId: BOOK, kind: 'cancel', sessionId: null }, null)?.bookId).toBe(BOOK)
    expect(pendingPurchase()).toBeNull()
  })

  it('the page reads the return once, opens the book and takes the parameters out of the address', async () => {
    register(BOOK)
    window.history.replaceState(null, '', `/reader?book=${BOOK}&modern=1&session_id=cs_test_9&x=1`)
    vi.resetModules()
    const fresh = await import('./labReaderHandoff')
    const registry = await import('../utils/publicBooks')
    const e = entry(BOOK)
    registry.registerPublicBook(registry.bookFromEntry(e as unknown as PublicEntry), e)
    const handoff = fresh.consumeLabReaderHandoffForPage()
    expect(handoff?.bookId).toBe(BOOK)
    expect(fresh.modernReturnForPage()).toEqual({ bookId: BOOK, kind: 'paid', sessionId: 'cs_test_9' })
    expect(window.location.search).toBe('?x=1')
    expect(sessionStorage.getItem('tinct:modern-purchase')).toBe(BOOK)
  })
})

describe('before the reader renders', () => {
  it('registers the book a return names, with no hand-off or saved place on this device', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.endsWith(`/api/public-books/${BOOK}`)) { const e = entry(BOOK); return Response.json({ book: bookFromEntry(e as unknown as PublicEntry), entry: e }) }
      return new Response('', { status: 404 })
    })
    await preloadPublicBooksForReader(fetchImpl as unknown as typeof fetch, `?book=${BOOK}&modern=1`)
    expect(getBook(BOOK)?.id).toBe(BOOK)
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual([`/api/public-books/${BOOK}`])
    // Not a return: nothing is fetched.
    const none = vi.fn()
    await preloadPublicBooksForReader(none as unknown as typeof fetch, `?book=${BOOK}`)
    expect(none).not.toHaveBeenCalled()
  })
})

describe('the cancel return', () => {
  it('asks the Worker to end the buyer’s own session, once per page', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ released: true }))
    expect(await cancelModernCheckout(BOOK, 'tok', fetchImpl as unknown as typeof fetch)).toBe(true)
    expect(await cancelModernCheckout(BOOK, 'tok', fetchImpl as unknown as typeof fetch)).toBe(false)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(`/api/public-books/${BOOK}/modern-en/cancel`)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(await cancelModernCheckout('pd-pg-2', 'tok', (async () => Response.json({ released: false })) as unknown as typeof fetch)).toBe(false)
  })
})
