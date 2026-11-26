import manifest from './editionAvailability.json'

/** Temporary holds preserve registry identities, text assets and all saved data.
 * They have no successor: never pass these through migrateWithheldEdition.
 */
export const TEMPORARY_EDITION_HOLDS: Readonly<Record<string, { reason: string }>> = manifest.editions
/** Danish text editions explicitly authorized for publication by Anders.
 * Other Danish files remain preserved but withdrawn. Adding a language never
 * grants publication by itself: each exact identity must pass integration QA.
 */
export const OFFERED_DANISH_EDITIONS: ReadonlySet<string> = new Set([
  // Recovered Danish batch 02, 18 Nov 2026 (books/wip/danish-recovered-batch-02).
  'hamlet/modern-da',
  'king-lear/modern-da',
  'othello/modern-da',
  'romeo-and-juliet/modern-da',
  'midsummer/modern-da',
  'twelfth-night/modern-da',
  'the-tempest/modern-da',
  'comedy-of-errors/modern-da',
  'coriolanus/modern-da',
  'beyond-good-and-evil/modern-da',
  // Earlier batches.
  'to-the-lighthouse/modern-da',
  'a-little-princess/modern-da',
  'around-the-world-80-days/modern-da',
  'jungle-book/modern-da',
  'grimms-fairy-tales/modern-da',
  'arabian-nights/modern-da',
  'moby-dick/modern-da',
  'crime-and-punishment/modern-da',
  'apology/modern-da',
  'us-founding-documents/modern-da',
  'crito/modern-da',
  'the-prince/modern-da',
  'confessions/modern-da',
  'alice-in-wonderland/modern-da',
  'bacchae/modern-da',
  'magna-carta/modern-da',
  'medea/modern-da',
  'meditations/modern-da',
  'middlemarch/modern-da',
  // Recovered Danish batch 03, 18 Nov 2026 (books/wip/danish-recovered-batch-03).
  'oresteia/modern-da',
  'the-aeneid/modern-da',
  'the-republic/modern-da',
  'walden/modern-da',
  'war-and-peace/modern-da',
  // End of batch 03.
  'the-art-of-war/modern-da',
  'the-manual/modern-da',
  'wuthering-heights/modern-da',
  'master-and-margarita/modern-da',
  'pinocchio/modern-da',
  // Young readers, 20 Nov 2026 (books/wip/<id>).
  'odyssey-for-boys-and-girls/modern-da',
  'iliad-for-boys-and-girls/modern-da',
  'merry-adventures-of-robin-hood/modern-da',
  'wonder-book-and-tanglewood-tales/modern-da',
  'beautiful-stories-from-shakespeare/modern-da',
  'wind-in-the-willows/modern-da',
  // The last two of the shelf, 26 Nov 2026 (books/wip/young-readers-danish; Anders: every book on the shelf in Danish).
  'the-secret-garden/modern-da',
  'story-of-king-arthur-and-his-knights/modern-da',
  // End of young readers.
  'ivan-ilyich/modern-da',
  'werther/modern-da',
  'communist-manifesto/modern-da',
  'poetics/modern-da',
  'phaedrus/modern-da',
  'phaedo/modern-da',
  'utilitarianism/modern-da',
  'on-liberty/modern-da',
  'kant-groundwork/modern-da',
  'descartes-meditations/modern-da',
  'jekyll-and-hyde/modern-da',
  'aristotle-politics/modern-da',
  'hume-enquiry/modern-da',
  // Recovered Danish batch 01, 18 Nov 2026 (books/wip/danish-recovered-batch-01).
  'antigone/modern-da',
  'candide/modern-da',
  'frankenstein/modern-da',
  'frederick-douglass/modern-da',
  'genealogy-of-morals/modern-da',
  'heart-of-darkness/modern-da',
  'notes-from-underground/modern-da',
  'oedipus-at-colonus/modern-da',
  'oedipus-rex/modern-da',
  // Published 2026-11-18 without a native-speaker read: Anders's explicit waiver (17 Nov 2026).
  'gilgamesh/modern-da',
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
