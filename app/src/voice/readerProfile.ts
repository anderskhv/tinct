import type { Book, ChatConversation, ReadingPosition } from '../types'
import type { VoiceReaderProfile } from './types'

const MAX_LIBRARY_BOOKS = 12
const MAX_RECENT_BOOKS = 5
const MAX_RECENT_EXCHANGES = 6

interface BuildVoiceReaderProfileInput {
  books: Array<Pick<Book, 'id' | 'title' | 'author'>>
  libraryIds: string[]
  conversations: ChatConversation[]
  positions: ReadingPosition[]
  readingLanguages: string[]
}

export function buildVoiceReaderProfile(input: BuildVoiceReaderProfileInput): VoiceReaderProfile {
  const booksById = new Map(input.books.map(book => [book.id, book]))
  const libraryBooks = input.libraryIds
    .map(bookId => booksById.get(bookId))
    .filter((book): book is Pick<Book, 'id' | 'title' | 'author'> => Boolean(book))
    .slice(0, MAX_LIBRARY_BOOKS)
    .map(book => ({ bookId: book.id, title: book.title, author: book.author }))

  const recentBooks = [...input.positions]
    .filter(position => booksById.has(position.bookId))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, MAX_RECENT_BOOKS)
    .map(position => ({
      bookId: position.bookId,
      title: booksById.get(position.bookId)!.title,
      chapterNumber: position.chapterNumber,
      paragraphIndex: position.lastParagraphIndex,
    }))

  const seenMessages = new Set<string>()
  const recentExchanges = input.conversations.flatMap(conversation => {
    const exchanges: VoiceReaderProfile['recentExchanges'] = []
    const messages = conversation.messages || []
    for (let i = 0; i < messages.length; i++) {
      const question = messages[i]
      if (question.role !== 'user' || !question.content.trim()) continue
      if (question.id && seenMessages.has(question.id)) continue
      if (question.id) seenMessages.add(question.id)
      const answer = messages.slice(i + 1).find(message => message.role === 'assistant' && message.content.trim())
      const bookId = question.bookId || conversation.bookId
      exchanges.push({
        bookId,
        bookTitle: booksById.get(bookId)?.title || bookId,
        question: question.content,
        answer: answer?.content,
        timestamp: question.timestamp || conversation.endTimestamp || conversation.startTimestamp,
      })
    }
    return exchanges
  })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_RECENT_EXCHANGES)

  return {
    libraryBooks,
    recentBooks,
    recentExchanges,
    readingLanguages: [...new Set(input.readingLanguages)].slice(0, 6),
  }
}
