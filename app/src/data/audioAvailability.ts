import manifest from './audioAvailability.json'
/** Reversible discovery policy. Never use this to reject saved text locations. */
const held = new Set(manifest.held_editions.map(edition => edition.key))
const heldChapters = new Map(manifest.held_chapters.map(entry => [entry.key, new Set(entry.chapters)]))
const heldBooks = new Set(manifest.held_books)
export const isAudioHeld = (bookId: string, editionKey: string, chapter?: number): boolean => {
  const key = `${bookId}/${editionKey}`
  return held.has(key) || (chapter !== undefined && Boolean(heldChapters.get(key)?.has(chapter)))
}
export const isBookDiscoverable = (bookId: string): boolean => !heldBooks.has(bookId)
export const isEditionDiscoverable = (bookId: string, edition: { key: string; language: string }): boolean => edition.language !== 'da' && !isAudioHeld(bookId, edition.key)
