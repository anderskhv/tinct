// The reading table's markup (reading-table.js draws and wires it): spine bindings, ribbons and
// the table's HTML, apart from the drawing so the first paint's placeholder (boot.js, a classic
// script) can be held to the same structure by src/libraryTwoReadingTable.test.ts.
import { coverAsset } from './cover-assets.js?v=20261009owncover';
import { ownCoverImage, paperCoverUrl, paintedCoverAt } from '../book-cover.js?v=20261009owncover';
import { shortTitle } from '../book-title.js?v=20261009owncover';
import { PAPER_SPINE, hasPaperSpine } from './spine.js?v=20261009rel10';
import { depthRatio } from './table-layout.js?v=20261011crop';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Spine bindings. Each book takes the binding nearest its cover tone. When
// SPINE_TEXTURES is true, the painted texture assets/spines/spine-<name>.jpg is
// layered under the gilt lettering; until then the colour alone is used.
export const SPINE_TEXTURES = true;
const BINDINGS = [
  ['green', '#24472a'], ['oxblood', '#5a1c18'], ['navy', '#253c5c'], ['black', '#2b2d2e'],
  ['brown', '#5a3522'], ['slate', '#5d6f7c'], ['plum', '#4a2a45'], ['ochre', '#9a7a2c'],
];
const hash = id => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const hexRgb = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export function bindingFor(book) {
  const rgb = hexRgb(book.tone);
  if (!rgb) return BINDINGS[hash(book.bookId) % BINDINGS.length];
  const find = name => BINDINGS.find(b => b[0] === name);
  const [r, g, b] = rgb, max = Math.max(r, g, b), chroma = max - Math.min(r, g, b);
  // Nearly grey covers: dark or pale neutral bindings.
  if (chroma < 10) return find(max > 110 ? 'slate' : 'black');
  // Otherwise by hue, so a red cover gets a red spine however dark it is.
  const hue = (max === r ? ((g - b) / chroma + 6) % 6 : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4) * 60;
  if (hue < 15 || hue >= 330) return find('oxblood');
  if (hue < 55) return find(chroma > 55 ? 'ochre' : 'brown');
  if (hue < 175) return find('green');
  if (hue < 255) return find(chroma < 20 && max > 90 ? 'slate' : 'navy');
  return find('plum');
}

// Bookmark ribbons: one colour per book, stable across visits.
const RIBBONS = ['#69413e', '#6b6045', '#58634c', '#86724b'];
const ribbonFor = id => RIBBONS[hash(id) % RIBBONS.length];
export const percentLabel = p => (p == null ? '' : p > 0 && p < 1 ? '<1%' : `${Math.round(p)}%`);
/** The spine's look: the leather binding, or (an added book's paper cover) the same paper. */
export function spineStyle(b) {
  if (hasPaperSpine(b.bookId, b.cover)) {
    return { name: 'paper', colour: PAPER_SPINE.colour, textured: false, spine: `${PAPER_SPINE.edge},${PAPER_SPINE.colour}`, reflection: PAPER_SPINE.colour,
      title: ` style="color:${PAPER_SPINE.ink};text-shadow:none"`, gilt: ' style="visibility:hidden"' };
  }
  const [name, colour] = bindingFor(b);
  const texture = SPINE_TEXTURES ? `url('assets/spines/spine-${name}.jpg') 50% 50%/100% 100%,` : '';
  return { name, colour, textured: SPINE_TEXTURES, spine: `linear-gradient(90deg,#0009,#0000 16%,#ffffff14 44%,#0000 64%,#0009),${texture}${colour}`, reflection: `${texture}${colour}`, title: '', gilt: '' };
}

/**
 * A book's cover by the one rule every surface uses (/lab/book-cover.js): the library's
 * painting, else the catalogue's art; a reader's own book (b.own, src/lab/userBook/ownShelf.ts)
 * wears its own picture (a data: URL kept on this device), else the same paper cover with its
 * title as My shelf and the reader's book switcher draw.
 */
export function bookCover(b) {
  return b.own ? (ownCoverImage(b.cover) || paperCoverUrl(b.title, b.author || '', b.kind || '')) : coverAsset(b.bookId, b.cover);
}

/**
 * The same cover at the size the desk draws it (2026-10-10): a book stands at most 235 CSS px wide
 * (table-layout.js), at most 2× in the canvas, so a painting's 480 px copy (book-cover.js
 * paintedCoverAt); an own book's picture and catalogue art as they are.
 */
export const DESK_COVER_PX = 480;
export function deskCover(b) {
  return b.own ? bookCover(b) : paintedCoverAt(b.bookId, DESK_COVER_PX) ?? coverAsset(b.bookId, b.cover);
}

/**
 * The spine's title: its short form (/lab/book-title.js), set in one line along the spine.
 * `--tl` (its length in characters) lets the stylesheet fit the type to the spine's length
 * (styles.css .rt-spine em); a title still too long ends in an ellipsis, never past the spine.
 */
export function spineTitle(b) {
  const text = shortTitle(b.title);
  return { text, length: Math.max(1, [...text].length) };
}

export function bookMarkup(b, i) {
  const cover = deskCover(b);
  const s = spineStyle(b);
  const spine = spineTitle(b);
  return `
    <button class="rt-b${b.linked ? ' is-linked' : ''}" data-i="${i}" aria-label="${esc(b.title)}" style="--dr:${depthRatio(b)};--ribbon:${ribbonFor(b.bookId)};--binding:${s.colour};--p:${Math.max(6, Math.min(94, b.percent ?? 50)) / 100};--cover:url('${esc(cover)}')">
      <span class="rt-shadow" aria-hidden="true"></span>
      <span class="rt-cast" aria-hidden="true"></span>
      <span class="rt-f rt-back"></span>
      <span class="rt-f rt-fore"></span>
      <span class="rt-f rt-head"></span>
      <span class="rt-mark" aria-hidden="true"><i></i></span>
      <span class="rt-f rt-refl rt-refl-front"></span>
      <span class="rt-f rt-refl rt-refl-spine" style="background:${s.reflection}"></span>
      <span class="rt-f rt-spine${s.textured ? ' is-textured' : ''}" data-binding="${s.name}" style="background:${s.spine};--tl:${spine.length}"><i class="rt-gilt"${s.gilt}></i><em${s.title}>${esc(spine.text)}</em><i class="rt-gilt"${s.gilt}></i></span>
      <span class="rt-f rt-front"><img src="${esc(cover)}" alt="" decoding="async" fetchpriority="${i === 0 ? 'high' : 'auto'}" draggable="false"></span>
    </button>`;
}

/** The table's markup. The unit test holds boot.js's first-paint placeholder to this structure. */
export function markup(table) {
  return `
    <div class="rt-stage" id="rt-stage"><div class="rt-row" id="rt-row">${table.reading.map(bookMarkup).join('')}</div>
      <div class="rt-dots" id="rt-dots">${table.reading.map((b, i) => `<button data-i="${i}" aria-label="${esc(b.title)}"></button>`).join('')}</div>
      <button type="button" class="rt-remove" id="rt-remove" aria-label="Remove book from currently reading" hidden>×</button>
      <button id="rt-prev" class="rt-hidden-nav" aria-label="Previous book" tabindex="-1"></button><button id="rt-next" class="rt-hidden-nav" aria-label="Next book" tabindex="-1"></button></div>
    <div class="rt-info"><div class="rt-fade" id="rt-info">
      <h1 id="rt-title"></h1>
      <p class="rt-book-metadata" id="rt-book-metadata"></p>
      <p class="rt-meta"><span id="rt-place"></span><span id="rt-pct"></span></p>
      <div class="rt-recap" id="rt-recap-box"><div class="rt-quote"><small>Where you left off</small><p id="rt-recap"></p></div><button id="rt-more">Read more</button></div>
    </div>
    <a class="rt-continue read-button" id="rt-continue" href="#">Continue<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20m-6-6 6 6-6 6"/></svg></a></div>
    <dialog class="rt-remove-dialog" id="rt-remove-dialog" aria-labelledby="rt-remove-heading">
      <h2 id="rt-remove-heading">Remove from currently reading?</h2>
      <p>It stays on My shelf under Saved for later, and your place is kept.</p>
      <div><button type="button" id="rt-remove-cancel" autofocus>Keep book</button><button type="button" id="rt-remove-confirm">Remove</button></div>
    </dialog>`;
}

