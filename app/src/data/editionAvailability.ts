import manifest from './editionAvailability.json'

/** Temporary holds preserve registry identities, text assets and all saved data.
 * They have no successor: never pass these through migrateWithheldEdition.
 */
export const TEMPORARY_EDITION_HOLDS: Readonly<Record<string, { reason: string }>> = manifest.editions
export function editionHold(bookId: string, editionKey: string | undefined): { reason: string } | undefined {
  return editionKey ? TEMPORARY_EDITION_HOLDS[bookId + '/' + editionKey] : undefined
}
export const isBookTemporarilyHeld = (bookId: string): boolean => manifest.wholeBooks.includes(bookId)
export const TEMPORARY_HOLD_NOTICE = 'This edition is temporarily unavailable while we verify a complete replacement. Your saved place, highlights, notes and reading history are retained. We have not switched your edition.'
