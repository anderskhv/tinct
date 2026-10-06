/**
 * Analytics never learn about a reader's own book. While the reader shows one
 * (`/reader?userBook=…`) no usage event is sent at all, and an event that
 * names a user book anywhere is dropped wherever it comes from. Add a book
 * itself sends none; this keeps the reader the same.
 */
import { mentionsUserBook, userBookFromSearch } from './userBookId'

export function readingPrivateBook(): boolean {
  if (typeof location === 'undefined') return false
  return location.pathname === '/reader' && userBookFromSearch(location.search) !== null
}

export function withholdAnalytics(payload?: unknown): boolean {
  return readingPrivateBook() || mentionsUserBook(payload)
}
