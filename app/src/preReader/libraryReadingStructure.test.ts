import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { serializePreReaderCatalogue } from './catalogue'
import { addLibraryReadingStructures } from './libraryReadingStructure'

describe('Library 2 published reading structures', () => {
  const catalogue = addLibraryReadingStructures(
    serializePreReaderCatalogue(),
    path.resolve(process.cwd(), 'public'),
  )

  it('gives every published book an honest, non-Danish structure', () => {
    expect(catalogue.books).toHaveLength(100)
    for (const book of catalogue.books) {
      expect(book.readingStructure.editionKey).toBeTruthy()
      expect(book.editions.find(edition => edition.key === book.readingStructure.editionKey)?.language).not.toBe('da')
      expect(book.readingStructure.chapters.length).toBeGreaterThan(0)
      expect(book.readingStructure.totalParagraphs).toBe(
        book.readingStructure.chapters.reduce((sum, chapter) => sum + chapter.paragraphCount, 0),
      )
    }
  })

  it('uses the real chapter extent instead of a chapter-local page percentage', () => {
    const bible = catalogue.books.find(book => book.id === 'bible')!
    const odyssey = catalogue.books.find(book => book.id === 'odyssey')!
    expect(bible.readingStructure.chapters).toHaveLength(1189)
    expect(bible.readingStructure.chapters[0].title).toBe('Genesis 1')
    expect(odyssey.readingStructure.chapters).toHaveLength(24)
  })
})
