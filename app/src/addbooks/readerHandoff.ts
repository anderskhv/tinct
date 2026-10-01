import { UNLISTED_READER_BOOKS, isUnlistedReaderBook } from '../data/readerBooks'
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
  const intent = createReaderHandoffIntent(selection, { booksById })
  // Imported prose uses the normal measured pages and saved-word restoration.
  // The legacy exact-passage flag replaces measured maps with budget estimates
  // (one paragraph per page when no budget exists). Also normalize old pilot
  // handoffs and chapter deep links so they cannot reintroduce sparse pages.
  if (intent && isUnlistedReaderBook(intent.bookId)) delete intent.startAtSavedPlace
  return intent
}
