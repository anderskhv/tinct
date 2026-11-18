// The reading table's geometry (reading-table.js wire): pure functions of the stage's size,
// the books' shapes and the chosen book, so the first paint's placeholder (boot.js, a classic
// script that cannot import this file, so it carries the same functions; the unit test
// src/libraryTwoFirstPaint.test.ts holds the two equal) stands every book exactly where the
// table will stand it.
import { tableWindow, MAX_SPINES, bookBox } from './table-window.js?v=20261009cover';

/** Thickness as a fraction of the book's height, from its length. */
export const depthRatio = book => Math.max(0.085, Math.min(0.2, 0.065 + (book.wordCount || 90000) / 1_600_000));

/**
 * Book height from the stage, with headroom for the bookmark; the row stands on the stage's
 * floor. `desk` is the wide layout (innerWidth >= 900). The camera's eye level sits a little
 * above the books' base, so the table is seen at a low angle and the books stand on it.
 */
export function tableFit(stageW, stageH, desk) {
  const H = Math.round(Math.max(130, Math.min(desk ? 352 : 240, stageH / 1.36, stageW * (desk ? 0.44 : 0.39) * 1.5)));
  const base = stageH - H * 0.05;
  return { H, bw: Math.round(H * 2 / 3), originY: Math.round(base - H * 0.42) };
}

/**
 * Books stand in reading order, the most recent on the left. The chosen one is pulled forward
 * and turned to face the reader (12 degrees, `turn` giving the direction); the others stand
 * spine-out, spines flush with its cover. Positions come from real footprints, so neighbours
 * never overlap, and the row is centred on the stage. `books` are { aspect, depthRatio };
 * `removable` leaves room for the remove × beside the chosen book.
 */
export function tableLayout({ H, stageW, desk, books, current, turn = 1, removable = true }) {
  const gap = Math.max(2, H * 0.01);
  const around = Math.max(H * 0.08, removable ? 24 : 0);
  const face = 12 * turn, rad = Math.abs(face) * Math.PI / 180;
  const size = i => bookBox(H, books[i].aspect);
  const depth = i => H * books[i].depthRatio;
  const chosenFoot = size(current).w * Math.cos(rad) + depth(current) * Math.sin(rad);
  const pad = desk ? 0 : 20, minEdge = -stageW / 2 + pad, maxEdge = stageW / 2 - pad;
  const { from, to } = tableWindow(books.map((_, i) => depth(i) + gap), current, Math.max(0, maxEdge - minEdge - chosenFoot - 2 * around), MAX_SPINES);
  const xs = [];
  xs[current] = 0;
  let right = chosenFoot / 2 + around, left = -chosenFoot / 2 - around;
  for (let i = current + 1; i < books.length; i++) { xs[i] = right + depth(i) / 2; if (i <= to) right += depth(i) + gap; }
  for (let i = current - 1; i >= 0; i--) { xs[i] = left - depth(i) / 2; if (i >= from) left -= depth(i) + gap; }
  if (from === current) left = -chosenFoot / 2;
  if (to === current) right = chosenFoot / 2;
  let shift = -(left + right) / 2;
  if (left + shift < minEdge) shift = minEdge - left;
  if (right + shift > maxEdge) shift = maxEdge - right;
  shift = Math.min(Math.max(shift, minEdge + chosenFoot / 2), maxEdge - chosenFoot / 2);
  return books.map((_, i) => {
    const chosen = i === current, { w, h } = size(i), d = depth(i);
    return { w, h, d, x: xs[i] + shift, z: chosen ? H * 0.05 : -(w / 2 - d / 2), rotate: chosen ? face : 90, current: chosen, away: i < from || i > to };
  });
}

/** The inline styles the table writes for one laid-out book (and the placeholder copies). */
export function bookStyle(box) {
  return { '--bw': `${box.w.toFixed(1)}px`, '--bh': `${box.h.toFixed(1)}px`, '--d': `${box.d.toFixed(1)}px`, transform: `translate3d(${box.x.toFixed(1)}px,0,${box.z.toFixed(1)}px) rotateY(${box.rotate}deg)` };
}
