// Public image URLs shared by the table and the reader's idle preloader.
// The paintings and the rule for which cover a book wears live in /lab/book-cover.js,
// shared with My shelf, the reader's book switcher and Add a book's viewer.
import { paintedCover, paintedCoverSources } from '../book-cover.js?v=20261009owncover';
export function coverAsset(id, fallback) {
  return paintedCover(id) ?? fallback;
}

/** The catalogue's art files are 540 px wide, its `@2x` 1080 (art.srcSet "… 1x, … 2x"). */
export const ART_WIDTH = 540;
/**
 * A book's cover files, smallest first, each `{ src, width }` (2026-10-10): a painting's copies and the
 * painting (book-cover.js), or the catalogue art and its @2x, or the one file there is. A surface takes
 * the smallest with at least the pixels it draws (app.js ensureCover). Null for the paper cover.
 */
export function coverSources(id, art) {
  const painted = paintedCoverSources(id);
  if (painted) return painted;
  const src = typeof art === 'string' ? art : typeof art?.src === 'string' ? art.src : null;
  if (!src) return null;
  const twoX = typeof art?.srcSet === 'string' ? art.srcSet.split(',').map(part => part.trim().split(/\s+/)).find(([, descriptor]) => descriptor === '2x')?.[0] : null;
  return twoX ? [{ src, width: ART_WIDTH }, { src: twoX, width: ART_WIDTH * 2 }] : [{ src, width: Infinity }];
}
