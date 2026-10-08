// War and Peace in search (Anders, 2026-10-08): the book stays held from the
// shelves (the audio audit's held_books), but a typed search finds it. Only
// search changes: shelves, the empty search list, links and the librarian keep
// the hold, and every other book is untouched.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PRE_READER_CATALOGUE, searchPreReaderBooks, serializePreReaderCatalogue } from './preReader/catalogue'
import { SEARCH_ONLY_BOOKS, isBookDiscoverable, isBookSearchable } from './data/audioAvailability'
import { eligibleLibraryBooks } from './lab/libraryLibrarian'
import { listableBooks } from '../public/lab/library-model.js'
// @ts-expect-error -- plain browser module of the library page
import { librarySearch } from '../public/lab/library_2/library-search.js'

const WAR_AND_PEACE = 'war-and-peace'

describe('War and Peace in search', () => {
  it('is searchable while still held from discovery', () => {
    expect(SEARCH_ONLY_BOOKS).toEqual(new Set([WAR_AND_PEACE]))
    expect(isBookDiscoverable(WAR_AND_PEACE)).toBe(false)
    expect(isBookSearchable(WAR_AND_PEACE)).toBe(true)
    const book = PRE_READER_CATALOGUE.booksById.get(WAR_AND_PEACE)!
    expect(book.discoveryAvailable).toBe(false)
    expect(book.searchAvailable).toBe(true)
  })

  it('changes no other book: searchable exactly when discoverable', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      if (book.id === WAR_AND_PEACE) continue
      expect(book.searchAvailable, book.id).toBe(book.discoveryAvailable)
    }
  })

  it('stays off the shelves, the empty search list and the librarian', () => {
    const shelved = serializePreReaderCatalogue().houses.flatMap(house => house.shelves.flatMap(shelf => shelf.bookIds))
    expect(shelved).not.toContain(WAR_AND_PEACE)
    expect(searchPreReaderBooks('').map(book => book.id)).not.toContain(WAR_AND_PEACE)
    expect(listableBooks(PRE_READER_CATALOGUE).map((book: { id: string }) => book.id)).not.toContain(WAR_AND_PEACE)
    expect(eligibleLibraryBooks(serializePreReaderCatalogue() as never).map(book => book.id)).not.toContain(WAR_AND_PEACE)
  })

  it('is found by a typed search', () => {
    expect(searchPreReaderBooks('War and Peace')[0]?.id).toBe(WAR_AND_PEACE)
    expect(searchPreReaderBooks('Tolstoy').map(book => book.id)).toContain(WAR_AND_PEACE)
  })
})

describe('the library page (library_2)', () => {
  it('loads held-but-searchable books apart from the shelves', () => {
    const source = readFileSync('public/lab/library_2/catalogue.js', 'utf8')
    expect(source).toContain('books: data.books.filter(book => book.discoveryAvailable !== false),')
    expect(source).toContain('searchOnly: data.books.filter(book => book.discoveryAvailable === false && book.searchAvailable === true),')
    const data = serializePreReaderCatalogue()
    expect(data.books.filter(book => book.discoveryAvailable === false && book.searchAvailable === true).map(book => book.id)).toEqual([WAR_AND_PEACE])
  })

  it('searches a list assembled from several (the shelves plus search-only books)', () => {
    const shelves = [{ id: 'anna-karenina', title: 'Anna Karenina', author: 'Leo Tolstoy' }]
    const searchOnly: typeof shelves = []
    const search = librarySearch(() => [...shelves, ...searchOnly])
    expect(search.filter('war and peace').map((book: { id: string }) => book.id)).toEqual([])
    searchOnly.push({ id: WAR_AND_PEACE, title: 'War and Peace', author: 'Leo Tolstoy' })
    expect(search.filter('war and peace')[0].id).toBe(WAR_AND_PEACE)
  })

  it('wires the typed search, not the empty list, to the search-only books', () => {
    const app = readFileSync('public/lab/library_2/app.js', 'utf8')
    expect(app).toContain('const tinctSearch=librarySearch(searchPool);')
    expect(app).toContain("export function filterBooks(query){return String(query||'').trim()?tinctSearch.filter(query):books.slice();}")
    // Linked books (?book=) keep the hold.
    expect(app).toContain('const entry=data.books.find(b=>b.id===linkedBook&&b.discoveryAvailable!==false)')
  })
})
