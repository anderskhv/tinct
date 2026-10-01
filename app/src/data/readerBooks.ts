import { getBook } from './bookRegistry'
import type { Book } from '../types'

/** Explicit reader-only pilot. Never feed this list into library/SEO discovery. */
export const UNLISTED_READER_BOOKS: readonly Book[] = [{
  id: 'pd-35', title: 'The Time Machine', author: 'H. G. Wells', year: 1895, wordCount: 32310,
  coverColor: '#1f4a5c', coverAccent: '#ece7db',
  editions: [{ key: 'original-en', language: 'en', style: 'original',
    label: 'Original English', year: 1895, aligned: false, hasAudio: false }],
}]

export function isUnlistedReaderBook(id: string): boolean {
  return UNLISTED_READER_BOOKS.some(book => book.id === id)
}

/** Reading availability is broader than public-library membership. */
export function getReaderBook(id: string): Book | undefined {
  return getBook(id) ?? UNLISTED_READER_BOOKS.find(book => book.id === id)
}
