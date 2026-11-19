// The reading table's hero title (reading-table.js): fitted, never clipped.

/**
 * The hero title's size step (0 = the full display size, 4 = the smallest): a
 * long title steps the type down so it fits in at most three lines and is never
 * clipped ("Minor Dialogues, Together With the Dialogue on Clemency").
 */
export function heroTitleStep(title) {
  const n = [...String(title || '')].length;
  return n <= 24 ? 0 : n <= 40 ? 1 : n <= 62 ? 2 : n <= 90 ? 3 : 4;
}
export const HERO_TITLE_STEPS = 4;
/** Set the hero title, then step its size down while it still needs more than three lines. */
export function fitHeroTitle(h1, title) {
  let text = h1.querySelector('.rt-title-text');
  if (!text) { text = document.createElement('span'); text.className = 'rt-title-text'; h1.replaceChildren(text); }
  text.textContent = title;
  let step = heroTitleStep(title);
  h1.dataset.fit = String(step);
  while (step < HERO_TITLE_STEPS && text.scrollHeight > text.clientHeight + 1) h1.dataset.fit = String(++step);
  return step;
}
