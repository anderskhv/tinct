import { describe, expect, it } from 'vitest'
import type { Book, ChatConversation, ReadingPosition } from '../types'
import { buildVoiceReaderProfile } from './readerProfile'

const books: Array<Pick<Book, 'id' | 'title' | 'author'>> = [
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer' },
  { id: 'awakening', title: 'The Awakening', author: 'Kate Chopin' },
]

describe('buildVoiceReaderProfile', () => {
  it('builds bounded cross-book continuity from existing user data', () => {
    const conversations: ChatConversation[] = [{
      id: 'chat-1',
      bookId: 'odyssey',
      chapterNumber: 5,
      startTimestamp: 100,
      endTimestamp: 300,
      preview: 'Why does hospitality matter?',
      messages: [
        { id: 'q-1', role: 'user', content: 'Why does hospitality matter?', timestamp: 200, bookId: 'odyssey' },
        { id: 'a-1', role: 'assistant', content: 'It reveals character through the treatment of strangers.', timestamp: 300, bookId: 'odyssey' },
      ],
    }]
    const positions: ReadingPosition[] = [{
      bookId: 'awakening',
      chapterNumber: 7,
      currentPage: 2,
      totalPages: 5,
      scrollFraction: 0.4,
      lastParagraphIndex: 9,
      updatedAt: 500,
    }]

    const profile = buildVoiceReaderProfile({
      books,
      libraryIds: ['odyssey', 'awakening'],
      conversations,
      positions,
      readingLanguages: ['en', 'da', 'en'],
    })

    expect(profile.libraryBooks.map(book => book.title)).toEqual(['The Odyssey', 'The Awakening'])
    expect(profile.recentBooks[0]).toMatchObject({ title: 'The Awakening', chapterNumber: 7, paragraphIndex: 9 })
    expect(profile.recentExchanges[0]).toMatchObject({
      bookTitle: 'The Odyssey',
      question: 'Why does hospitality matter?',
      answer: 'It reveals character through the treatment of strangers.',
    })
    expect(profile.readingLanguages).toEqual(['en', 'da'])
  })
})
