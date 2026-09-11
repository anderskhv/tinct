/**
 * Editions withdrawn from Tinct after publication.
 *
 * Unlike `audioAvailability`, this is not a discovery policy: the edition is
 * gone from the registry and its text is no longer served. What remains is the
 * saved locations of readers who were in it. Those must keep their place, so a
 * withheld edition names a successor and the reader moves there at the same
 * chapter and paragraph. That is only sound because Tinct's editions are
 * paragraph-aligned — paragraph N of chapter C is the same passage in every
 * edition of the book.
 *
 * Bible `modern-en` was withdrawn on 2026-09-11: the 2026-09-11 translation
 * audit confirmed it reproduces the copyrighted NIV (2011) at every sampled
 * location. `modern-da` was withdrawn with it because it is a Danish rendering
 * of that same English, and so carries the same derivative exposure. Both fall
 * back to `web-en` (World English Bible, public domain, modern English) rather
 * than `kjv-en`, because a reader who chose a modern edition chose readability.
 */
const SUCCESSORS: Record<string, string> = {
  'bible/modern-en': 'web-en',
  'bible/modern-da': 'web-en',
}

export function isEditionWithheld(bookId: string, editionKey: string): boolean {
  return `${bookId}/${editionKey}` in SUCCESSORS
}

/**
 * The edition a saved location should be moved to, or the key unchanged when
 * the edition is still published.
 */
export function migrateWithheldEdition(bookId: string, editionKey: string): string {
  return SUCCESSORS[`${bookId}/${editionKey}`] ?? editionKey
}
