import manifest from './audioAvailability.json'
/** Reversible discovery policy. Never use this to reject saved text locations. */
const held = new Set(manifest.held_editions.map(edition => edition.key))
const heldBooks = new Set(manifest.held_books)
export const isAudioHeld = (bookId: string, editionKey: string): boolean => held.has(`${bookId}/${editionKey}`)
export const isBookDiscoverable = (bookId: string): boolean => !heldBooks.has(bookId)
export const isEditionDiscoverable = (bookId: string, edition: { key: string; language: string }): boolean => edition.language !== 'da' && !isAudioHeld(bookId, edition.key)
