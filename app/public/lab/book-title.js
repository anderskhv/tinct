// A book's title in a box of its own size: the reading table's spines and hero, the shelf
// study's spines, My shelf's cards and the reader's book switcher rows. Shared by library_2
// and the app bundles (src/). No browser APIs at import time.
//
// The rule: where the box is small (a spine, a card, a one-line row) the title's short form
// stands for it, then the type is fitted to the box, and only a title that still cannot fit
// at the smallest size ends in an ellipsis. The full title stays in the accessible name.

/**
 * A title's short form: the part before a subtitle colon ("The Beginning of Infinity:
 * Explanations that Transform the World" → "The Beginning of Infinity"). A title without
 * one, or with nothing before it, is its own short form. Spaces are tidied.
 */
export function shortTitle(title) {
  const full = String(title ?? '').replace(/\s+/g, ' ').trim();
  const match = /^(.+?)\s*[:：]\s+\S/.exec(full);
  const short = match ? match[1].trim() : '';
  return short.length >= 2 ? short : full;
}

/** Width of one capital on a spine, in ems: Georgia capitals plus the spines' letter-spacing, rounded up. */
export const SPINE_EM_PER_CHAR = 0.86;

/**
 * The spine type size (px) that sets `title` in one line along `length` px of spine, held
 * between `min` and `max`. Below `min` the line ends in an ellipsis (CSS text-overflow).
 */
export function spineTitleSize(title, length, { min = 6, max = 14 } = {}) {
  const chars = Math.max(1, [...String(title ?? '')].length);
  const fit = length / (chars * SPINE_EM_PER_CHAR);
  return Math.max(min, Math.min(max, Number.isFinite(fit) ? fit : max));
}
