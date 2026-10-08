// Spines of books readers added to Tinct (public-books.js). Until a painting
// exists the book wears the typographic paper cover, so its spine is the same
// paper: cream, a faint edge, ink lettering, no leather. A painted cover keeps
// the series' leather bindings, chosen from the painting: the Worker stores the
// painting's spine tone as the entry's cover.background when it stores the
// painting, and the table samples the painting itself as for every cover.
import { isPublicBookId } from '../public-books.js?v=20261008rel7';

export const PAPER_SPINE = Object.freeze({
  colour: '#e6dfca',
  edge: 'linear-gradient(90deg,#4a402c47,#0000 13%,#ffffff3d 46%,#0000 74%,#4a402c3d)',
  ink: '#3f3828',
  // The inside of the cover when the book opens (the binding's tone elsewhere).
  board: '#cdc3a6',
});

/** An added book with no painting yet: its cover, and so its spine, is paper. */
export function hasPaperSpine(bookId, cover) {
  return isPublicBookId(bookId) && !cover;
}

/** The binding tone a catalogue entry opens on: paper boards for a paper cover, else its stored tone. */
export function coverToneFor(entry) {
  return hasPaperSpine(entry?.id, entry?.art?.src) ? PAPER_SPINE.board : entry?.cover?.background || '#1b231c';
}

/** An added book's painting: the Worker stored its spine tone (the painting's left edge) as the book's tone. */
export function hasStoredSpineTone(book) {
  return isPublicBookId(book?.bookId) && !!book.cover && /^#[0-9a-f]{6}$/i.test(book.tone || '');
}
