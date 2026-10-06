import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOKS, getBook } from '../data/bookRegistry'
import { PRE_READER_CATALOGUE } from '../preReader/catalogue'
import { bookFromEntry, ensurePublicBook, mentionsPublicBook, preloadPublicBooksForReader, registerPublicBook, type PublicEntry } from './publicBooks'

const entry = (id: string): PublicEntry => ({
  id, title: 'The River House', author: 'Ann Example', summary: 'Public-domain text from Project Gutenberg.', year: 1871, wordCount: 1200,
  cover: { background: '#2c2417', accent: '#e9dfc4' },
  editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', translator: null, year: 1871 }],
})

afterEach(() => {
  for (let i = BOOKS.length - 1; i >= 0; i--) if (BOOKS[i].id.startsWith('pd-')) BOOKS.splice(i, 1)
  vi.unstubAllGlobals()
})

describe('public books in the reader', () => {
  it('registers an added book so getBook (the reader registry) knows it, without touching registry books', () => {
    const book = bookFromEntry(entry('pd-pg-77'))
    expect(book).toEqual({ id: 'pd-pg-77', title: 'The River House', author: 'Ann Example', description: 'Public-domain text from Project Gutenberg.', year: 1871, wordCount: 1200, coverColor: '#2c2417', coverAccent: '#e9dfc4', editions: [{ key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: false, hasAudio: false, year: 1871 }] })
    registerPublicBook(book, entry('pd-pg-77'))
    expect(getBook('pd-pg-77')?.title).toBe('The River House')
    expect(PRE_READER_CATALOGUE.booksById.get('pd-pg-77')).toBeTruthy()
    const before = BOOKS.length
    registerPublicBook({ ...book, id: 'odyssey' })
    expect(BOOKS.length).toBe(before)
    expect(getBook('odyssey')?.title).not.toBe('The River House')
  })

  it('fetches a missing public book once; registry ids never fetch', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ book: bookFromEntry(entry('pd-pg-78')), entry: entry('pd-pg-78') }))
    await Promise.all([ensurePublicBook('pd-pg-78', fetchImpl as unknown as typeof fetch), ensurePublicBook('pd-pg-78', fetchImpl as unknown as typeof fetch)])
    await ensurePublicBook('pd-pg-78', fetchImpl as unknown as typeof fetch)
    await ensurePublicBook('odyssey', fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0]).toEqual(['/api/public-books/pd-pg-78'])
    expect(getBook('pd-pg-78')).toBeTruthy()
  })

  it('preloads the index before the reader renders only when stored state names a public book', async () => {
    const storage = (values: Record<string, string>) => ({ getItem: (key: string) => values[key] ?? null })
    const fetchImpl = vi.fn(async () => Response.json({ books: [entry('pd-pg-79')] }))
    vi.stubGlobal('sessionStorage', storage({}))
    vi.stubGlobal('localStorage', storage({ 'tinct-lab-position': '{"books":{"odyssey":{"bookId":"odyssey"}}}' }))
    await preloadPublicBooksForReader(fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).not.toHaveBeenCalled()
    vi.stubGlobal('sessionStorage', storage({ 'tinct:lab-reader-handoff': '{"kind":"open-reader","bookId":"pd-pg-79"}' }))
    await preloadPublicBooksForReader(fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).toHaveBeenCalledWith('/api/public-books')
    expect(getBook('pd-pg-79')?.editions[0].key).toBe('original-en')
    expect(mentionsPublicBook(null, '"pd-ws-da-q1-abc"')).toBe(true)
    expect(mentionsPublicBook('{"bookId":"pride-and-prejudice"}')).toBe(false)
  })
})
