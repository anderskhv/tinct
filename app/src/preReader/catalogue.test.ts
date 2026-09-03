import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BOOKS } from '../data/bookRegistry'
import { LIBRARY_HOUSES, LIBRARY_SHELVES } from '../data/libraryTaxonomy'
import {
  PRE_READER_CATALOGUE,
  buildReturningReaderViewModel,
  createReaderHandoffIntent,
  getBookDetailViewModel,
  getEditionSelectionViewModel,
  searchPreReaderBooks,
} from './catalogue'

const publicRoot = resolve(process.cwd(), 'public')

describe('pre-reader catalogue layer', () => {
  it('contains every and only published BOOKS entry with stable required fields', () => {
    expect(PRE_READER_CATALOGUE.books.map(book => book.id)).toEqual(BOOKS.map(book => book.id))
    expect(new Set(PRE_READER_CATALOGUE.books.map(book => book.id)).size).toBe(BOOKS.length)
    for (const book of PRE_READER_CATALOGUE.books) {
      expect(book.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(book.title.trim()).not.toBe('')
      expect(book.author.trim()).not.toBe('')
      expect(book.summary.trim()).not.toBe('')
      expect(book.cover.background).toMatch(/^#[0-9a-f]{6}$/i)
      expect(book.cover.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(book.availability.cover).toBe(true)
    }
  })

  it('classifies every published book into valid Houses → Shelves → Books paths', () => {
    const validHouseIds = new Set(LIBRARY_HOUSES.map(house => house.id))
    for (const book of PRE_READER_CATALOGUE.books) {
      expect(book.shelfIds.length, book.id).toBeGreaterThan(0)
      expect(book.houseIds.length, book.id).toBeGreaterThan(0)
      expect(book.shelfIds.every(shelfId => Boolean(LIBRARY_SHELVES[shelfId])), book.id).toBe(true)
      expect(book.houseIds.every(houseId => validHouseIds.has(houseId)), book.id).toBe(true)
      expect(PRE_READER_CATALOGUE.houses.some(house => house.shelves.some(shelf => shelf.books.some(item => item.id === book.id))), book.id).toBe(true)
    }
    expect(PRE_READER_CATALOGUE.booksById.has('much-ado-about-nothing')).toBe(true)
    expect(PRE_READER_CATALOGUE.booksById.get('ivan-ilyich')?.shelfIds).toContain('russian-novels')
  })

  it('offers only registered editions backed by chapter assets and honest capabilities', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      const registryBook = BOOKS.find(candidate => candidate.id === book.id)!
      expect(book.editions.map(edition => edition.key)).toEqual(registryBook.editions.map(edition => edition.key))
      expect(book.editions.length, book.id).toBeGreaterThan(0)
      for (const edition of book.editions) {
        const path = resolve(publicRoot, 'data/editions', `${book.id}-${edition.key}.json`)
        expect(existsSync(path), `${book.id}/${edition.key}`).toBe(true)
        const data = JSON.parse(readFileSync(path, 'utf8')) as { chapters?: Array<{ paragraphs?: string[] }> }
        expect(data.chapters?.some(chapter => Array.isArray(chapter.paragraphs) && chapter.paragraphs.length > 0), `${book.id}/${edition.key}`).toBe(true)
        expect(edition.availability.chapterText).toBe(true)
        expect(edition.availability.audio).toBe(registryBook.editions.find(item => item.key === edition.key)?.hasAudio === true)
        expect(edition.group === 'modern').toBe(edition.style === 'modern')
        if (edition.style === 'modern') expect(edition.provenanceLabel).toBe('Tinct AI adaptation')
        if (edition.translator) expect(edition.provenanceLabel).toContain(edition.translator)
      }
    }
  })

  it('marks optional prefaces available only under the published onboarding asset contract', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      expect(existsSync(resolve(publicRoot, 'data/onboarding', `${book.id}.json`)), book.id).toBe(true)
      expect(book.availability.optionalPreface).toBe(true)
    }
  })

  it('ranks exact titles, authors, and topics deterministically', () => {
    expect(searchPreReaderBooks('Meditations')[0].id).toBe('meditations')
    expect(searchPreReaderBooks('Homer').slice(0, 2).map(book => book.id)).toEqual(['odyssey', 'iliad'])
    expect(searchPreReaderBooks('mortality').map(book => book.id)).toContain('ivan-ilyich')
    expect(searchPreReaderBooks('Homer').map(book => book.id)).toEqual(searchPreReaderBooks('Homer').map(book => book.id))
  })

  it('builds detail and edition-selection models without impossible choices', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      const detail = getBookDetailViewModel(book.id)
      const selection = getEditionSelectionViewModel(book.id, 'does-not-exist')
      expect(detail?.book.id).toBe(book.id)
      expect(detail?.facts.editionCount).toBe(book.editions.length)
      expect(book.editions.some(edition => edition.key === selection?.selectedEditionKey), book.id).toBe(true)
      for (const option of [...(selection?.humanEditions || []), ...(selection?.modernEditions || [])]) {
        expect(book.editions.some(edition => edition.key === option.key), `${book.id}/${option.key}`).toBe(true)
      }
      for (const option of selection?.compareOptions || []) {
        expect(option.aligned, `${book.id}/${option.key}`).toBe(true)
        expect(option.key).not.toBe(selection?.selectedEditionKey)
      }
    }
  })

  it('creates only coherent handoff tuples that reference available content', () => {
    for (const book of PRE_READER_CATALOGUE.books) {
      const primary = book.editions[0]
      const compare = primary.availability.compare
        ? book.editions.find(edition => edition.key !== primary.key && edition.availability.compare)
        : undefined
      const audio = book.editions.find(edition => edition.availability.audio)
      const handoff = createReaderHandoffIntent({
        bookId: book.id,
        primaryEditionKey: primary.key,
        compareEditionKey: compare?.key,
        audioEditionKey: audio?.key,
        savedPlace: { bookId: book.id, chapterNumber: 1, page: 0, paragraphIndex: 0 },
      })
      expect(handoff?.bookId, book.id).toBe(book.id)
      expect(book.editions.some(edition => edition.key === handoff?.primaryEditionKey), book.id).toBe(true)
      if (handoff?.compareEditionKey) expect(book.editions.some(edition => edition.key === handoff.compareEditionKey && edition.availability.compare)).toBe(true)
      if (handoff?.audioEditionKey) expect(book.editions.some(edition => edition.key === handoff.audioEditionKey && edition.availability.audio)).toBe(true)
    }
    expect(createReaderHandoffIntent({ bookId: 'odyssey', primaryEditionKey: 'missing' })).toBeNull()
    expect(createReaderHandoffIntent({ bookId: 'odyssey', primaryEditionKey: 'original-en', audioEditionKey: 'original-ru' })).toBeNull()
    expect(createReaderHandoffIntent({
      bookId: 'ivan-ilyich',
      primaryEditionKey: 'original-ru',
      compareEditionKey: 'modern-en',
    })).toBeNull()
    expect(createReaderHandoffIntent({
      bookId: 'odyssey',
      primaryEditionKey: 'original-en',
      savedPlace: { bookId: 'bible', chapterNumber: 1 },
    })).toBeNull()
  })

  it('derives returning-reader cards from inputs without storage writes or cross-book leakage', () => {
    const returning = buildReturningReaderViewModel([
      { bookId: 'odyssey', editionKey: 'modern-en', chapterNumber: 4, page: 2, percent: 18, updatedAt: 100 },
      { bookId: 'meditations', editionKey: 'original-en', chapterNumber: 2, paragraphIndex: 7, percent: 9, updatedAt: 200 },
      { bookId: 'not-published', chapterNumber: 1, percent: 50, updatedAt: 300 },
    ], [
      { bookId: 'odyssey', lastReadAt: 100, summary: 'Reached Telemachus preparing to leave.' },
      { bookId: 'bible', lastReadAt: 999, summary: 'Must not leak into another book.' },
    ])
    expect(returning.map(item => item.book.id)).toEqual(['meditations', 'odyssey'])
    expect(returning[1].historySummary).toBe('Reached Telemachus preparing to leave.')
    expect(returning[0].historySummary).toBeNull()
    expect(returning.every(item => item.handoff.bookId === item.savedPlace.bookId)).toBe(true)
    const source = readFileSync(resolve(process.cwd(), 'src/preReader/catalogue.ts'), 'utf8')
    expect(source).not.toContain('localStorage')
    expect(source).not.toContain("services/storage")
    expect(source).not.toContain('useReadingPosition')
  })
})
