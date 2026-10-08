// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { BOOKS, CONJECTURE_BOOKS, getBook } from './bookRegistry'
import { defaultCompareEditionKey, defaultPrimaryEditionKey, savedPlaceFallbackEditionKey } from './editionDefaults'
import { GENERATED_BOOK_META } from './bookMetaGenerated'
import { publisherPermission } from './publisherPermissions'
import { PRE_READER_CATALOGUE, serializePreReaderCatalogue } from '../preReader/catalogue'
import { bookFacts, filterAvailable } from '../../public/lab/library_2/add-to-tinct.js'
import { isPublicBookId } from '../../public/lab/public-books.js'

// The five Conjecture books (2025-26) are written in modern English: Tinct has
// no Modern English edition of them and must never offer, default to or
// advertise one (Anders, 2026-10-08).
const IDS = ['the-sovereign-child', 'lords-of-the-cosmos', 'bold-conjectures-volume-1', 'bold-conjectures-volume-2', 'the-farthest-reaches']
const MODERN = /modern/i

describe('books with no Modern English edition', () => {
  it('are published, flagged and carry only the publisher text', () => {
    expect(CONJECTURE_BOOKS.map(book => book.id)).toEqual(IDS)
    for (const id of IDS) {
      const book = getBook(id)!
      expect(BOOKS).toContain(book)
      expect(book.noModernEdition, id).toBe(true)
      expect(book.editions.map(edition => edition.key), id).toEqual(['original-en'])
      expect(book.editions.some(edition => edition.style === 'modern' || MODERN.test(edition.label)), id).toBe(false)
      expect(book.editions.some(edition => edition.hasAudio), id).toBe(false)
    }
  })

  it('default to the original and offer no Compare edition', () => {
    for (const id of IDS) {
      const book = getBook(id)!
      expect(defaultPrimaryEditionKey(id, book.editions)).toBe('original-en')
      expect(savedPlaceFallbackEditionKey(id, book.editions)).toBe('original-en')
      expect(defaultCompareEditionKey(id, book.editions, 'original-en', book.year)).toBeUndefined()
      const entry = PRE_READER_CATALOGUE.booksById.get(id)!
      expect(entry.editions.map(edition => edition.key)).toEqual(['original-en'])
      expect(entry.editions.some(edition => edition.group === 'modern' || edition.style === 'modern')).toBe(false)
      expect(entry.defaultEditionKey).toBe('original-en')
      expect(entry.defaultCompareEditionKey).toBeNull()
      expect(entry.availability.compare).toBe(false)
      expect(entry.availability.audio).toBe(false)
    }
  })

  it('never match the library search Modern English filter or show its pill', () => {
    const books = serializePreReaderCatalogue().books.filter(book => IDS.includes(book.id))
    expect(books).toHaveLength(IDS.length)
    for (const book of books) expect(bookFacts(book).modern, book.id).toBe(false)
    expect(filterAvailable(books, { modern: true, audio: false, language: '' })).toEqual([])
    expect(filterAvailable(books, { modern: false, audio: false, language: 'en' })).toHaveLength(IDS.length)
  })

  it('have no Modern English purchase, and no Modern English or public-domain claim in their copy', () => {
    for (const id of IDS) {
      // Paid Modern English editions exist only for added public-domain books.
      expect(isPublicBookId(id)).toBe(false)
      const meta = GENERATED_BOOK_META[id]
      expect(meta, id).toBeDefined()
      expect(meta.description).not.toMatch(MODERN)
      expect(meta.description).not.toMatch(/audio|classic/i)
      const entry = PRE_READER_CATALOGUE.booksById.get(id)!
      for (const edition of entry.editions) expect(edition.provenanceLabel).not.toMatch(/public.domain/i)
      expect(publisherPermission(id)?.rights).toBeTruthy()
    }
  })
})
