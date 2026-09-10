import { describe, expect, it } from 'vitest'
import { BOOKS } from './bookRegistry'
import manifest from './audioAvailability.json'
import { isAudioHeld, isBookDiscoverable, isEditionDiscoverable } from './audioAvailability'
import { PRE_READER_CATALOGUE, createReaderHandoffIntent } from '../preReader/catalogue'
import { listableBooks } from '../../public/lab/library-model.js'
import { fullShelf } from '../../public/lab/entry-model.js'
describe('reversible edition discovery availability', () => {
  it('partitions every current English edition exactly once', () => {
    const actual = BOOKS.flatMap(book => book.editions.filter(e => e.language === 'en').map(e => `${book.id}/${e.key}`)).sort()
    const reviewed = [...manifest.eligible_editions, ...manifest.held_editions.map(e => e.key)].sort()
    expect(reviewed).toEqual(actual)
    expect(new Set(reviewed).size).toBe(201)
    expect(manifest.eligible_editions).toHaveLength(148)
    expect(manifest.held_editions).toHaveLength(53)
    expect(BOOKS.filter(book => !book.editions.some(e => e.language === 'en' && !isAudioHeld(book.id, e.key))).map(b=>b.id).sort()).toEqual([...manifest.held_books].sort())
  })
  it('removes held books only from discovery, retaining direct text handoffs and exact places', () => {
    expect(PRE_READER_CATALOGUE.books).toHaveLength(100)
    expect(listableBooks(PRE_READER_CATALOGUE)).toHaveLength(90)
    expect(fullShelf(PRE_READER_CATALOGUE)).toHaveLength(90)
    for (const id of manifest.held_books) {
      expect(isBookDiscoverable(id)).toBe(false)
      const book = PRE_READER_CATALOGUE.booksById.get(id)!
      const edition = book.editions.find(e=>e.language==='en')!
      const savedPlace = {bookId:id,chapterNumber:1,paragraphIndex:2,page:1}
      expect(createReaderHandoffIntent({bookId:id,primaryEditionKey:edition.key,savedPlace})?.savedPlace).toEqual(savedPlace)
    }
  })
  it('retains Bible modern while excluding held English and paused Danish from new choices', () => {
    const bible = BOOKS.find(b=>b.id==='bible')!
    expect(bible.editions.filter(e=>isEditionDiscoverable(bible.id,e)).map(e=>e.key)).toEqual(['modern-en'])
    expect(isBookDiscoverable('bible')).toBe(true)
  })
})
