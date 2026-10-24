import manifest from './editionAvailability.json'

/** Temporary holds preserve registry identities, text assets and all saved data.
 * They have no successor: never pass these through migrateWithheldEdition.
 */
export const TEMPORARY_EDITION_HOLDS: Readonly<Record<string, { reason: string }>> = manifest.editions
/** Reviewed Danish text editions explicitly published by Anders.
 * Other Danish files remain preserved but withdrawn. Adding a language never
 * grants publication by itself: each exact identity must pass integration QA.
 */
export const OFFERED_DANISH_EDITIONS: ReadonlySet<string> = new Set([
  'to-the-lighthouse/modern-da',
  'a-little-princess/modern-da',
  'around-the-world-80-days/modern-da',
  'jungle-book/modern-da',
  'grimms-fairy-tales/modern-da',
  'arabian-nights/modern-da',
  'moby-dick/modern-da',
  'crime-and-punishment/modern-da',
  'the-prince/modern-da',
  'confessions/modern-da',
  'alice-in-wonderland/modern-da',
  'bacchae/modern-da',
  'magna-carta/modern-da',
  'medea/modern-da',
  'meditations/modern-da',
  'middlemarch/modern-da',
  'the-art-of-war/modern-da',
  'wuthering-heights/modern-da',
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
