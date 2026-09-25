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
/**
 * Text discovery. Recording holds (the 2026-09-10 structural audio audit) keep
 * old recordings from playing; they no longer hide the text, which narration
 * now streams from (approved default editions, 2026-09-25). Danish stays out
 * of discovery under the English-first language scope.
 */
export const isEditionDiscoverable = (_bookId: string, edition: { key: string; language: string }): boolean => edition.language !== 'da'
