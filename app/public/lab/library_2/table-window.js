// The reading table (reading-table.js) with many books in progress: which stand on it.
/** At most this many spines stand beside the chosen book; the rest are reached by the dots. */
export const MAX_SPINES = 8;
/**
 * Which books stand on the table: the chosen one and its nearest neighbours,
 * as many as fit in `room` px (each costing its spine width plus gap) and at
 * most `max`, balanced left and right. Returns the inclusive index range.
 */
export function tableWindow(costs, current, room, max = MAX_SPINES) {
  let from = current, to = current, left = 0, right = 0;
  for (;;) {
    if (to - from >= max) break;
    const canLeft = from > 0 && left + right + costs[from - 1] <= room;
    const canRight = to < costs.length - 1 && left + right + costs[to + 1] <= room;
    if (!canLeft && !canRight) break;
    if (canLeft && (!canRight || left < right)) left += costs[--from];
    else right += costs[++to];
  }
  return { from, to };
}

/** The library's cover shape (width/height), and the shape of a book whose cover has not loaded. */
export const COVER_ASPECT = 2 / 3;
/** Covers keep their own shape between these width/height ratios; beyond them the face is held to the bound and the painting letterboxed. */
export const MIN_COVER_ASPECT = 0.5, MAX_COVER_ASPECT = 1;
/** The widest a book stands, as a share of the table's book height: a cover wider than 3:4 stands shorter instead. */
export const MAX_BOOK_WIDTH = 0.75;
/**
 * A book's front face on the table, `height` being the table's book height: the
 * shape of its own cover (`aspect` = naturalWidth / naturalHeight), so a cover is
 * never stretched or cropped. Up to 3:4 it stands the full height; wider covers
 * stand shorter, at most MAX_BOOK_WIDTH × height wide.
 */
export function bookBox(height, aspect) {
  const shape = Number.isFinite(aspect) && aspect > 0 ? Math.min(MAX_COVER_ASPECT, Math.max(MIN_COVER_ASPECT, aspect)) : COVER_ASPECT;
  const w = Math.min(height * shape, height * MAX_BOOK_WIDTH);
  return { w, h: w / shape };
}
