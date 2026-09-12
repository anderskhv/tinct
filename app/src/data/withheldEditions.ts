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
 * Meditations `modern-da` was withdrawn on 2026-09-12. It is not a rights
 * problem: it is a structure problem. It was translated paragraph for
 * paragraph against the Casaubon 1634 text that used to be served as
 * `original-en` (412 paragraphs, non-standard section numbering), and on
 * 2026-09-12 the book was re-based onto George Long 1862 (487 paragraphs).
 * Its paragraph N is no longer the same passage as paragraph N of the live
 * editions, so it can neither be read alongside them nor compared with them,
 * and the alignment promise above does not hold for it. It falls back to
 * `modern-en` — the modern English edition, the closest thing to what a
 * reader who chose Moderne Dansk was choosing.
 *
 * NOTE the interaction with `rebasedEditions`: moving a reader from
 * `meditations/modern-da` to `modern-en` at the SAME paragraph is exactly the
 * unsound move this file's alignment argument licenses everywhere else. It is
 * safe here only because every stored `meditations/modern-da` location
 * necessarily predates the re-basing (the edition is withdrawn in the same
 * change), so `rebaseSavedPosition` has already dropped its paragraph before
 * the successor is consulted. The reader arrives at the top of the same
 * chapter, which is the most that survives honestly.
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
  'meditations/modern-da': 'modern-en',
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
