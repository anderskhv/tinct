import manifest from './editionAvailability.json'

/** Temporary holds preserve registry identities, text assets and all saved data.
 * They have no successor: never pass these through migrateWithheldEdition.
 */
export const TEMPORARY_EDITION_HOLDS: Readonly<Record<string, { reason: string }>> = manifest.editions
export function editionHold(bookId: string, editionKey: string | undefined): { reason: string } | undefined {
  if (!editionKey) return undefined
  // Retain the identity and asset for existing readers' explicit recovery.
  // A language withdrawal must never map saved coordinates onto another text.
  if (editionKey.endsWith('-da')) return { reason: 'Danish editions are no longer offered in Tinct. Your original text, reading place, highlights and notes remain preserved.' }
  return TEMPORARY_EDITION_HOLDS[bookId + '/' + editionKey]
}
export const isBookTemporarilyHeld = (bookId: string): boolean => manifest.wholeBooks.includes(bookId)
export const TEMPORARY_HOLD_NOTICE = 'This edition is not currently offered. Your saved place, highlights, notes and reading history are retained. We have not switched your edition.'
