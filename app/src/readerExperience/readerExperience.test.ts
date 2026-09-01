import { describe, expect, it } from 'vitest'
import type { Book, EditionData } from '../types'
import { readerCapabilities } from './capabilities'
import { readerDocumentFromEditionData } from './documentAdapter'

const book: Book = {
  id: 'test-book',
  title: 'Test Book',
  author: 'Test Author',
  editions: [
    { key: 'original-en', language: 'en', style: 'original', label: 'Original', aligned: true, hasAudio: true },
    { key: 'modern-en', language: 'en', style: 'modern', label: 'Modern', aligned: true },
  ],
}

const primary: EditionData = {
  chapters: [
    { number: 1, title: 'Act I', paragraphs: ['First.', 'Second.'] },
    { number: 2, title: 'Act II', paragraphs: ['Third.'] },
  ],
  sections: [{ title: 'Part One', chapters: [1, 2] }],
}

describe('reader document adapter', () => {
  it('maps production book and edition data without changing paragraph identity', () => {
    const compare: EditionData = {
      chapters: [{ number: 1, title: 'Act I', paragraphs: ['First modern.', 'Second modern.'] }],
    }
    const document = readerDocumentFromEditionData({
      book,
      primaryEditionKey: 'original-en',
      primaryData: primary,
      compareEditionKey: 'modern-en',
      compareData: compare,
      chapterNumber: 1,
    })

    expect(document.book).toEqual({ id: 'test-book', title: 'Test Book', author: 'Test Author' })
    expect(document.chapter.paragraphs).toBe(primary.chapters[0].paragraphs)
    expect(document.chapter.compareParagraphs).toBe(compare.chapters[0].paragraphs)
    expect(document.chapters).toEqual([{ number: 1, title: 'Act I' }, { number: 2, title: 'Act II' }])
    expect(document.sections).toBe(primary.sections)
  })

  it('fails explicitly for a missing edition or chapter', () => {
    expect(() => readerDocumentFromEditionData({
      book,
      primaryEditionKey: 'missing',
      primaryData: primary,
      chapterNumber: 1,
    })).toThrow('Unknown primary edition')
    expect(() => readerDocumentFromEditionData({
      book,
      primaryEditionKey: 'original-en',
      primaryData: primary,
      chapterNumber: 99,
    })).toThrow('Unknown chapter')
  })
})

describe('reader capability selectors', () => {
  it('derives compare, audio, word-follow, cast, and hierarchical navigation', () => {
    expect(readerCapabilities({
      book,
      primaryEdition: book.editions[0],
      data: primary,
      hasWordTimings: true,
      threads: { bookId: book.id, characters: [{ id: 'hero' }] as never },
    })).toEqual({
      canCompare: true,
      canListen: true,
      canFollowWords: true,
      hasCast: true,
      navigationKind: 'sections',
    })
  })

  it('selects the Bible tree by book identity', () => {
    expect(readerCapabilities({
      book: { ...book, id: 'bible' },
      primaryEdition: book.editions[0],
      data: primary,
    }).navigationKind).toBe('bible-tree')
  })
})
