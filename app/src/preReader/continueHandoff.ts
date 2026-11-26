import { migrateWithheldEdition } from '../data/withheldEditions'
import { PRE_READER_CATALOGUE, createReaderHandoffIntent, type ReaderHandoffIntent } from './catalogue'
import type { ContinueTarget } from './libraryRecap'
import { savedPlaceFallbackEditionKey } from '../data/editionDefaults'
import { isEditionLanguageOffered } from '../data/editionAvailability'

function defaultEditionKey(bookId: string): string | null {
  const editions = (PRE_READER_CATALOGUE.booksById.get(bookId)?.editions ?? [])
    .filter(edition => isEditionLanguageOffered(bookId, edition) && edition.availability.chapterText)
  // A saved row without an edition predates edition keys; those readers were
  // reading the old default, the original. Continuing must not switch their
  // text to the new-reader default (Tinct Modern English).
  return savedPlaceFallbackEditionKey(bookId, editions) ?? null
}

/** Build the same validated reader handoff for every Reading-now entry point. */
export function continueHandoff(target: ContinueTarget): ReaderHandoffIntent | null {
  const savedEditionKey = target.editionKey === null
    ? null
    : migrateWithheldEdition(target.bookId, target.editionKey)
  const editionKey = savedEditionKey ?? defaultEditionKey(target.bookId)
  if (!editionKey) return null
  const selection = {
    bookId: target.bookId,
    primaryEditionKey: editionKey,
    savedPlace: {
      bookId: target.bookId,
      chapterNumber: target.chapterNumber,
      page: target.pageIndex,
      paragraphIndex: target.paragraphIndex,
      wordIndex: target.wordIndex,
    },
  }
  // The pair the reader left the book in opens again (Anders, 26 Nov 2026: Danish beside English came back as
  // English beside English). A compare edition that can no longer sit beside this one is dropped, never the place.
  const compareEditionKey = savedEditionKey && target.compareEditionKey
    ? migrateWithheldEdition(target.bookId, target.compareEditionKey)
    : null
  return (compareEditionKey ? createReaderHandoffIntent({ ...selection, compareEditionKey }) : null)
    ?? createReaderHandoffIntent(selection)
}
