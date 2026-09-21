/**
 * Original/classic English editions whose existing whole-book Bella audio and
 * word sync were verified in the 2026-09-21 inventory. This deliberately
 * excludes the nine editions under separate repair, plus Meditations, Faust,
 * Jekyll, Bible and Histories exceptions. Do not expand without fresh evidence.
 */
export const RETAINED_BELLA_ORIGINAL_BOOKS = new Set([
  'midsummer',
  'antigone',
  'apology',
  'beowulf',
  'confessions',
  'crito',
  'discourse-on-inequality',
  'frankenstein',
  'kant-groundwork',
  'heart-of-darkness',
  'peloponnesian-war',
  'jerusalem',
  'magna-carta',
  'descartes-meditations',
  'frederick-douglass',
  'oedipus-at-colonus',
  'on-liberty',
  'phaedrus',
  'symposium',
  'the-aeneid',
  'the-art-of-war',
  'comedy-of-errors',
  'divine-comedy',
  'gilgamesh',
  'jungle-book',
  'the-manual',
  'the-prince',
  'social-contract',
  'werther',
  'us-founding-documents',
  'utilitarianism',
])

export function usesRetainedBella(bookId: string, editionKey: string, persona: 'female' | 'male'): boolean {
  return persona === 'female' && editionKey === 'original-en' && RETAINED_BELLA_ORIGINAL_BOOKS.has(bookId)
}
