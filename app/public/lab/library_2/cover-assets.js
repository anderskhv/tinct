// Public image URLs shared by the table and the reader's idle preloader.
// The paintings and the rule for which cover a book wears live in /lab/book-cover.js,
// shared with My shelf, the reader's book switcher and Add a book's viewer.
import { paintedCover } from '../book-cover.js?v=20261009shelf';
export function coverAsset(id, fallback) {
  return paintedCover(id) ?? fallback;
}
