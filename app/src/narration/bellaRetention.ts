/**
 * Original/classic English editions whose existing whole-book Bella audio and
 * word sync were verified in the 2026-09-21 inventory and focused repair
 * closeout. This deliberately excludes the five unresolved repair editions,
 * plus Meditations, Faust, Bible and Histories exceptions. Do not expand
 * without fresh evidence.
 *
 * Pride and Prejudice left the set on 2026-09-25: its restructured original
 * (seven paragraph merges) no longer matches the index-keyed recordings.
 */
export const RETAINED_BELLA_ORIGINAL_BOOKS = new Set([
  'midsummer',
  'antigone',
  'apology',
  'beowulf',
  'candide',
  'confessions',
  'crito',
  'discourse-on-inequality',
  'frankenstein',
  'federalist-papers',
  'kant-groundwork',
  'heart-of-darkness',
  'peloponnesian-war',
  'jerusalem',
  'jekyll-and-hyde',
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
