import { migrateWithheldEdition } from '../data/withheldEditions'
import { PRE_READER_CATALOGUE, createReaderHandoffIntent, type ReaderHandoffIntent } from './catalogue'
import type { ContinueTarget } from './libraryRecap'
import { defaultPrimaryEditionKey } from '../data/editionDefaults'

function defaultEditionKey(bookId: string): string | null {
  const editions = (PRE_READER_CATALOGUE.booksById.get(bookId)?.editions ?? [])
    .filter(edition => edition.language !== 'da' && edition.availability.chapterText)
  // A saved row without an edition predates edition keys; those readers were
  // reading the old default, the original. Continuing must not switch their
  // text to the new-reader default (Tinct Modern English).
  return editions.find(edition => edition.style === 'original' && edition.language === 'en')?.key
    ?? defaultPrimaryEditionKey(bookId, editions)
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
