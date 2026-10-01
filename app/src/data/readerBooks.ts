import { getBook } from './bookRegistry'
import type { Book } from '../types'
import { danishRightsReview, eligibleInDenmark } from '../addbooks/danishRights'

/** Explicit reader-only pilot. Never feed this list into library/SEO discovery. */
const PILOT_CANDIDATES: readonly Book[] = [{
  id: 'pd-35', title: 'The Time Machine', author: 'H. G. Wells', year: 1895, wordCount: 32310,
  coverColor: '#1f4a5c', coverAccent: '#ece7db',
  editions: [{ key: 'original-en', language: 'en', style: 'original',
    label: 'Original English', year: 1895, aligned: false, hasAudio: false }],
}]

// Missing Danish evidence keeps a candidate out of Add and reader handoffs.
export const UNLISTED_READER_BOOKS: readonly Book[] = PILOT_CANDIDATES
  .map(book => ({ ...book, editions: book.editions.filter(edition => eligibleInDenmark(danishRightsReview(book.id, edition.key))) }))
  .filter(book => book.editions.length > 0)

export function isUnlistedReaderBook(id: string): boolean {
  return UNLISTED_READER_BOOKS.some(book => book.id === id)
}

/** Reading availability is broader than public-library membership. */
export function getReaderBook(id: string): Book | undefined {
  return getBook(id) ?? UNLISTED_READER_BOOKS.find(book => book.id === id)
}
