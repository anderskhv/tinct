import { UNLISTED_READER_BOOKS } from '../data/readerBooks'
import { createReaderHandoffIntent, PRE_READER_CATALOGUE, type ReaderHandoffSelection, type ReaderHandoffBook } from '../preReader/catalogue'

// The ordinary catalogue stays unchanged. Extend only the reader's validation
// input, retaining its edition, coordinate and cross-book checks.
const booksById = new Map<string, ReaderHandoffBook>(PRE_READER_CATALOGUE.booksById)
for (const book of UNLISTED_READER_BOOKS) {
  booksById.set(book.id, { id: book.id, editions: book.editions.map(edition => ({
    key: edition.key, aligned: false,
    availability: { chapterText: true, audio: false, compare: false },
  })) })
}
export function createOpenReaderIntent(selection: ReaderHandoffSelection) {
  return createReaderHandoffIntent(selection, { booksById })
}
