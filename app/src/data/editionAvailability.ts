import manifest from './editionAvailability.json'

/** Temporary holds preserve registry identities, text assets and all saved data.
 * They have no successor: never pass these through migrateWithheldEdition.
 */
export const TEMPORARY_EDITION_HOLDS: Readonly<Record<string, { reason: string }>> = manifest.editions
/**
 * The only Danish editions Tinct offers: a deliberate, narrow exception to the
 * Danish withdrawal (Anders, 2026-10-10: To the Lighthouse in Danish; 2026-10-19: A Little Princess, Around the World in Eighty Days and The Jungle Book; later 2026-10-19: Grimms' Fairy Tales and The Arabian Nights). Every
 * other `-da` edition stays withdrawn. List exact `bookId/editionKey`
 * identities; never infer an exception from the language.
 */
export const OFFERED_DANISH_EDITIONS: ReadonlySet<string> = new Set([
  'to-the-lighthouse/modern-da',
  'a-little-princess/modern-da',
  'around-the-world-80-days/modern-da',
  'jungle-book/modern-da',
  'grimms-fairy-tales/modern-da',
  'arabian-nights/modern-da',
])
export const isOfferedDanishEdition = (bookId: string, editionKey: string | undefined): boolean =>
  Boolean(editionKey) && OFFERED_DANISH_EDITIONS.has(bookId + '/' + editionKey)
/** Whether Tinct offers an edition's language: every non-Danish edition, and Danish only by the allowlist above. */
export const isEditionLanguageOffered = (bookId: string, edition: { key: string; language?: string }): boolean =>
  edition.language !== 'da' || isOfferedDanishEdition(bookId, edition.key)
export function editionHold(bookId: string, editionKey: string | undefined): { reason: string } | undefined {
  if (!editionKey) return undefined
  // Retain the identity and asset for existing readers' explicit recovery.
  // A language withdrawal must never map saved coordinates onto another text.
  // The allowlist is checked first and only lifts the language withdrawal:
  // a manifest hold on an offered edition still applies.
  if (editionKey.endsWith('-da') && !isOfferedDanishEdition(bookId, editionKey)) return { reason: 'Danish editions are no longer offered in Tinct. Your original text, reading place, highlights and notes remain preserved.' }
  return TEMPORARY_EDITION_HOLDS[bookId + '/' + editionKey]
}
export const isBookTemporarilyHeld = (bookId: string): boolean => manifest.wholeBooks.includes(bookId)
export const TEMPORARY_HOLD_NOTICE = 'This edition is not currently offered. Your saved place, highlights, notes and reading history are retained. We have not switched your edition.'
