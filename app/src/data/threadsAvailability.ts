import { isPublicBookId } from '../../public/lab/public-books.js'

/**
 * Books with no Cast file (`public/data/editions/{bookId}-threads.json`).
 * Cast is optional; asking for a file that is not there only logs a 404 in
 * the reader's console, so the reader does not ask. Unlisted books are asked
 * for (a missing file then costs only that 404). A test keeps this list equal
 * to the files on disk. Added public books (`pd-` ids) never have one.
 */
export const BOOKS_WITHOUT_THREADS: ReadonlySet<string> = new Set([
  'adventures-of-sherlock-holmes',
  'arabian-nights',
  'aristotle-politics',
  'beautiful-stories-from-shakespeare',
  'beyond-good-and-evil',
  'bold-conjectures-volume-1',
  'bold-conjectures-volume-2',
  'communist-manifesto',
  'confessions',
  'crito',
  'descartes-meditations',
  'discourse-on-inequality',
  'faust-part-1',
  'federalist-papers',
  'genealogy-of-morals',
  'grimms-fairy-tales',
  'iliad-for-boys-and-girls',
  'lords-of-the-cosmos',
  'magna-carta',
  'meditations',
  'merry-adventures-of-robin-hood',
  'nicomachean-ethics',
  'notes-from-underground',
  'odyssey-for-boys-and-girls',
  'on-liberty',
  'pinocchio',
  'poetics',
  'second-treatise',
  'social-contract',
  'story-of-king-arthur-and-his-knights',
  'the-art-of-war',
  'the-farthest-reaches',
  'the-manual',
  'the-prince',
  'the-secret-garden',
  'the-sovereign-child',
  'us-founding-documents',
  'utilitarianism',
  'vindication-rights-of-woman',
  'walden',
  'wind-in-the-willows',
  'wonder-book-and-tanglewood-tales',
])

export function bookHasThreads(bookId: string): boolean {
  return !isPublicBookId(bookId) && !BOOKS_WITHOUT_THREADS.has(bookId)
}
