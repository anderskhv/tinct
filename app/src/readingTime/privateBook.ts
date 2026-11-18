/**
 * A reader's own books (EPUBs opened through Add a book, `userbook-<hex>`)
 * are private: their time counts toward the reader's totals and the
 * leaderboard, but no id or title of an own book ever leaves the device.
 *
 * The ledger records an own book's time under one opaque bucket,
 * PRIVATE_BOOK_ID, whichever own book it was. Anywhere a book would be shown
 * (a profile, Your reading, the leaderboard), that bucket is "a private book"
 * with no cover and no link, and it is never matched for "Also reading your
 * books". Added public-domain books (`pd-…`) are catalogue books, shown as
 * usual. Pure: shared by the Worker and the reader.
 */
import { isUserBookId } from '../lab/userBook/userBookId'
import { EARLIER_BOOK_ID, PRIVATE_BOOK_ID, ledgerBookId } from './model'

export { PRIVATE_BOOK_ID, ledgerBookId }

/** How an own book is shown to anyone (approved wording, 8 Oct 2026). */
export const PRIVATE_BOOK_LABEL = 'a private book'

export function isPrivateBucket(bookId: unknown): boolean {
  return bookId === PRIVATE_BOOK_ID || isUserBookId(bookId)
}

/** A ledger book id that names a real book others may see (not the private bucket, not pre-ledger time). */
export function isShareableBookId(bookId: unknown): bookId is string {
  return typeof bookId === 'string' && bookId !== EARLIER_BOOK_ID && !isPrivateBucket(bookId)
}
