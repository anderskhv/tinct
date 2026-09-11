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
    // 200 after Bible modern-en was withdrawn on 2026-09-11 (NIV-derived text).
    expect(new Set(reviewed).size).toBe(200)
    expect(manifest.eligible_editions).toHaveLength(148)
    expect(manifest.held_editions).toHaveLength(52)
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
  it('holds mismatched modern Apology audio while preserving original discovery and saved modern text', () => {
    expect(isAudioHeld('apology', 'modern-en')).toBe(true)
    expect(isAudioHeld('apology', 'original-en')).toBe(false)
    expect(isBookDiscoverable('apology')).toBe(true)
    const savedPlace = {bookId:'apology',chapterNumber:1,paragraphIndex:61,page:0}
    expect(createReaderHandoffIntent({bookId:'apology',primaryEditionKey:'modern-en',savedPlace})?.savedPlace).toEqual(savedPlace)
  })
  it('keeps the Bible selectable through KJV and WEB after the modern editions were withdrawn', () => {
    // modern-en (NIV-derived) and modern-da (its Danish rendering) left the
    // registry on 2026-09-11. KJV and WEB were released from the missing_audio
    // hold at the same time so the book does not become unpickable.
    const bible = BOOKS.find(b=>b.id==='bible')!
    expect(bible.editions.map(e=>e.key)).toEqual(['kjv-en', 'web-en'])
    expect(bible.editions.filter(e=>isEditionDiscoverable(bible.id,e)).map(e=>e.key)).toEqual(['kjv-en', 'web-en'])
    expect(isBookDiscoverable('bible')).toBe(true)
  })
})
