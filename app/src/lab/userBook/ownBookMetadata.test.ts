import { describe, expect, it } from 'vitest'
import { withOwnBookMetadata } from './ownBookMetadata'
import type { LoadedUserBook } from './userBookStore'

describe('mutable account metadata', () => {
  it('updates labels without shifting converted text, figure assets, or a saved word', () => {
    const book = { hex: 'ab'.repeat(12), bookId: 'userbook-' + 'ab'.repeat(12), kind: 'epub', images: new Map(),
      place: { chapterNumber: 2, paragraphIndex: 1, wordIndex: 7, updatedAt: 200 },
      edition: { format: 'tinct-user-edition-v1', converter: 7, title: 'Original', author: 'Writer', language: 'en', droppedImages: 0,
        chapters: [{ number: 2, title: 'II', paragraphs: ['one two three'] }] } } as LoadedUserBook
    const changed = withOwnBookMetadata(book, { title: 'Revised title', author: '', name: 'original.epub', metadataRev: 2 })
    expect(changed.edition).toMatchObject({ title: 'Revised title', author: '', converter: 7, chapters: book.edition.chapters })
    expect(changed.place).toBe(book.place)
    expect(changed.images).toBe(book.images)
    expect(book.edition.title).toBe('Original')
    expect(withOwnBookMetadata(book, { title: 'Original filename', author: '', name: 'original.epub', metadataRev: 0 })).toBe(book)
  })
})
