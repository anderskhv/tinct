import { migrateWithheldEdition } from '../data/withheldEditions'
import { PRE_READER_CATALOGUE, createReaderHandoffIntent, type ReaderHandoffIntent } from './catalogue'
import type { ContinueTarget } from './libraryRecap'

function defaultEditionKey(bookId: string): string | null {
  const editions = (PRE_READER_CATALOGUE.booksById.get(bookId)?.editions ?? [])
    .filter(edition => edition.language !== 'da' && edition.availability.chapterText)
  return editions.find(edition => edition.style === 'original' && edition.language === 'en')?.key
    ?? editions.find(edition => edition.style === 'modern' && edition.language === 'en')?.key
    ?? editions[0]?.key
    ?? null
}

/** Build the same validated reader handoff for every Reading-now entry point. */
export function continueHandoff(target: ContinueTarget): ReaderHandoffIntent | null {
  const savedEditionKey = target.editionKey === null
    ? null
    : migrateWithheldEdition(target.bookId, target.editionKey)
  const editionKey = savedEditionKey ?? defaultEditionKey(target.bookId)
  if (!editionKey) return null
  return createReaderHandoffIntent({
    bookId: target.bookId,
    primaryEditionKey: editionKey,
    savedPlace: {
      bookId: target.bookId,
      chapterNumber: target.chapterNumber,
      page: target.pageIndex,
      paragraphIndex: target.paragraphIndex,
      wordIndex: target.wordIndex,
    },
  })
}
