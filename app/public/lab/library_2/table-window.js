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
