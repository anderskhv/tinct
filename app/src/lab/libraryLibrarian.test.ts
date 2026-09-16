import { describe, expect, it } from 'vitest'
import {
  eligibleLibraryBooks,
  estimatedHours,
  libraryCataloguePrompt,
  recommendationBookIds,
  searchLibraryCatalogue,
  visibleLibrarianText,
  type LibraryCatalogue,
} from './libraryLibrarian'

const catalogue: LibraryCatalogue = {
  books: [
    { id: 'republic', title: 'The Republic', author: 'Plato', summary: 'A dialogue about justice and the ideal city.', wordCount: 75_000, topics: ['justice'], houseIds: ['philosophy'], availability: { chapterText: true } },
    { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', blurb: 'Private notes on duty and mortality.', wordCount: 45_000, shelfIds: ['stoics'], availability: { chapterText: true } },
    { id: 'future-book', title: 'Future Book', author: 'Nobody', comingSoon: true, availability: { chapterText: true } },
    { id: 'withheld', title: 'Withheld', author: 'Nobody', availability: { chapterText: false } },
  ],
}

describe('library librarian catalogue boundary', () => {
  it('searches every eligible catalogue field and excludes unavailable books', () => {
    expect(eligibleLibraryBooks(catalogue).map(book => book.id)).toEqual(['republic', 'meditations'])
    expect(searchLibraryCatalogue(catalogue, 'justice').map(book => book.id)).toEqual(['republic'])
    expect(searchLibraryCatalogue(catalogue, 'stoics').map(book => book.id)).toEqual(['meditations'])
    expect(searchLibraryCatalogue(catalogue, 'future')).toEqual([])
  })

  it('builds a library-only prompt with accurate time estimates and no arbitrary book context', () => {
    const prompt = libraryCataloguePrompt(catalogue)
    expect(prompt).toContain('republic | The Republic | Plato | About 5 hours')
    expect(prompt).toContain('meditations | Meditations | Marcus Aurelius | About 3 hours')
    expect(prompt).not.toContain('Future Book')
    expect(prompt).not.toContain('Withheld')
    expect(prompt).toContain('separate library-selection conversation')
    expect(prompt).not.toContain('Ask about this page')
  })

  it('only turns eligible recommendation markers into actionable books', () => {
    const text = 'Try The Republic [[book:republic]] or Future Book [[book:future-book]].'
    expect(recommendationBookIds(text, catalogue)).toEqual(['republic'])
    expect(visibleLibrarianText(text)).toBe('Try The Republic or Future Book.')
  })

  it('keeps a single honest reading-time number', () => {
    expect(estimatedHours(75_000)).toBe('About 5 hours')
    expect(estimatedHours(null)).toBeNull()
  })
})
