// Pure helpers of the reading table's quiet reconciliation and its first-paint record
// (2026-10-10). No imports, so they are testable apart from the table's drawing.

const bookIds = rows => rows.map(b => b.bookId);
export const sameOrder = (a, b) => bookIds(a).join() === bookIds(b).join();
export const sameBooks = (a, b) => a.length === b.length && bookIds(a).every(id => bookIds(b).includes(id));

/**
 * The fresh table in the shown table's order when they hold the same books; otherwise the
 * fresh table as it is. The first paint leads with the book just left (the device's
 * snapshot) while the account read orders by last activity: the row the reader is
 * looking at keeps its order and the fresh facts land in place, never a rebuilt table.
 */
export function keepShownOrder(shown, next) {
  if (!shown || !sameBooks(shown.reading, next.reading) || sameOrder(shown.reading, next.reading)) return next;
  const byId = new Map(next.reading.map(b => [b.bookId, b]));
  const reading = shown.reading.map(b => byId.get(b.bookId));
  return { ...next, reading, ...(next.shelfReading ? { shelfReading: reading } : {}) };
}

/**
 * What boot.js needs to fetch the shown book's cover and spine texture with the page:
 * public image URLs and this account's id, nothing about the reading. An own book's cover
 * (a data: URL kept on this device) is never written here.
 */
export const FIRST_PAINT_KEY = 'tinct:library-2-first-paint';
export function firstPaintRecord(table, view, owner, coverOf = book => book.cover) {
  const index = Number(view.querySelector('.rt-b.is-current')?.dataset.i ?? 0);
  const book = table.reading[index];
  if (!book || book.own || !owner) return null;
  const cover = coverOf(book);
  const spine = view.querySelector(`.rt-b[data-i="${index}"] .rt-spine`)?.dataset.binding || null;
  if (!cover || /^data:/.test(cover)) return null;
  return { v: 1, owner, bookId: book.bookId, cover, spine: spine && spine !== 'paper' ? spine : null };
}

/** The first paint's static desk (boot.js) carries this class; the table removes it once its own faces have arrived. */
export const PLACEHOLDER_CLASS = 'is-placeholder';

/**
 * The record behind the next visit's first paint (boot.js, the desk placeholder): the shown
 * book's cover and spine (above) plus what the table learnt by drawing that boot.js cannot
 * know from the device's table snapshot (`tinct:library-2-table:<account>`): each book's
 * sampled binding and colour, its cover's shape, its spine's title and its public cover URL,
 * and the hero's size the geometry was fitted in. Null when any book lacks these.
 */
export function deskRecord(table, view, owner, coverOf = book => book.cover, hero = view?.parentElement) {
  const base = firstPaintRecord(table, view, owner, coverOf);
  if (!base || !hero) return null;
  const w = hero.clientWidth, h = hero.clientHeight;
  if (!w || !h) return null;
  const art = {};
  for (const box of view.querySelectorAll('.rt-b[data-i]')) {
    const book = table.reading[Number(box.dataset.i)];
    if (!book) continue;
    const spine = box.querySelector('.rt-spine'), em = spine?.querySelector('em');
    const bw = parseFloat(box.style.getPropertyValue('--bw')), bh = parseFloat(box.style.getPropertyValue('--bh'));
    const binding = spine?.dataset.binding, colour = box.style.getPropertyValue('--binding').trim();
    if (!binding || !colour || !(bw > 0) || !(bh > 0) || !em) return null;
    const cover = book.own ? null : coverOf(book);
    // The cover's own shape (naturalWidth / naturalHeight, as the table measured it), not the drawn box's rounded one.
    const img = box.querySelector('.rt-front img');
    const aspect = img?.naturalWidth > 0 && img?.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : bw / bh;
    art[book.bookId] = { t: em.textContent, b: binding, c: colour, a: Number(aspect.toFixed(6)), u: cover && !/^data:/.test(cover) ? cover : null };
  }
  return { ...base, v: 2, hero: { w, h }, art };
}
