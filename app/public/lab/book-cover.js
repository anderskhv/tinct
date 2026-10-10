// One cover per book, on every surface that draws one: the library's reading table and
// its spines, My shelf, the shelf study, Your reading, the reader's book switcher and Add
// a book's viewer. Shared by library_2 (as a module) and the app bundles (src/), like
// public-books.js. No browser APIs at import time.
//
// The rule, in order:
//   1. the library's painting of a Tinct book (assets/<id>.jpg);
//   2. the catalogue's own art (/covers/v2/…, or an added book's painting from the Worker);
//   3. a reader's own book: its own picture, kept on this device (a data: URL);
//   4. else the small copy of that picture kept with the book's account copy, read on
//      another device of the account (a data: URL kept on this device; userBook/ownCovers.ts);
//   5. nothing (null): the surface draws the paper cover (paperCover below).

/** Tinct books the library has a painting of (assets/<id>.jpg, 1024 px; thumbs/<id>.webp, 240 px). */
export const PAINTED_COVER_IDS = Object.freeze(['frankenstein', 'jekyll-and-hyde', 'candide', 'julius-caesar', 'the-prince', 'meditations', 'jane-eyre', 'odyssey', 'crime-and-punishment', 'pride-and-prejudice', 'to-the-lighthouse', 'iliad', 'the-republic', 'confessions', 'nicomachean-ethics']);
const painted = new Set(PAINTED_COVER_IDS);
const PAINTED_BASE = '/lab/library_2/assets/';
/** The widths of a painting's two files, for srcset. */
export const PAINTED_WIDTHS = Object.freeze({ full: 1024, thumb: 240 });
/**
 * The smaller copies of each painting (assets/covers/<id>-<width>.webp, scripts/build-cover-derivatives.mjs)
 * and the painting's own width: a surface takes the smallest file with at least the pixels it draws
 * (paintedCoverAt), so a phone, a laptop at 2× and a 1× desktop each download about what they show.
 * The four 768 px paintings have a 480 copy only. src/libraryCoverDerivatives.test.ts holds this to the files.
 */
export const PAINTED_SIZES = Object.freeze({
  default: Object.freeze({ widths: Object.freeze([480, 960]), full: 1024 }),
  confessions: Object.freeze({ widths: Object.freeze([480]), full: 768 }),
  iliad: Object.freeze({ widths: Object.freeze([480]), full: 768 }),
  'nicomachean-ethics': Object.freeze({ widths: Object.freeze([480]), full: 768 }),
  'the-republic': Object.freeze({ widths: Object.freeze([480]), full: 768 }),
});

/** The library's painting of a book, or null. */
export function paintedCover(bookId) {
  return painted.has(bookId) ? `${PAINTED_BASE}${bookId}.jpg` : null;
}

/** The painting's copies, smallest first, each `{ src, width }`, ending with the painting itself. */
export function paintedCoverSources(bookId) {
  if (!painted.has(bookId)) return null;
  const sizes = PAINTED_SIZES[bookId] || PAINTED_SIZES.default;
  return [...sizes.widths.map(width => ({ src: `${PAINTED_BASE}covers/${bookId}-${width}.webp`, width })), { src: `${PAINTED_BASE}${bookId}.jpg`, width: sizes.full }];
}

/**
 * The painting's file for a surface drawing it `pixels` device pixels wide (CSS width × the screen's
 * pixel ratio): the smallest copy at least that wide, else the painting itself. Null for a book
 * without a painting. A surface asking for nothing in particular gets the painting.
 */
export function paintedCoverAt(bookId, pixels) {
  const sources = paintedCoverSources(bookId);
  if (!sources) return null;
  const need = Number.isFinite(pixels) && pixels > 0 ? pixels : Infinity;
  return (sources.find(source => source.width >= need) || sources[sources.length - 1]).src;
}

const OWN_COVER = /^data:image\/(jpeg|png|webp);base64,/;
/** An own book's kept picture, when it is one (a data: URL of an image), else null. */
export function ownCoverImage(cover) {
  return typeof cover === 'string' && OWN_COVER.test(cover) ? cover : null;
}

/**
 * A book's cover: `{ src, srcSet }`, or null for the paper cover.
 * `art` is the catalogue's `art` ({ src, srcSet }) or its src; `ownCover` an own book's kept picture;
 * `storedCover` the account's copy of it, used only when this device has none.
 * srcSet (with `w` descriptors) lets a small surface (the switcher's 32 px rows) take a small file.
 */
export function resolveBookCover({ bookId, art = null, ownCover = null, storedCover = null } = {}) {
  const paintedSrc = paintedCover(bookId);
  if (paintedSrc) return { src: paintedSrc, srcSet: [`${PAINTED_BASE}thumbs/${bookId}.webp ${PAINTED_WIDTHS.thumb}w`, ...paintedCoverSources(bookId).map(source => `${source.src} ${source.width}w`)].join(', ') };
  const artSrc = typeof art === 'string' ? art : typeof art?.src === 'string' ? art.src : '';
  if (artSrc) return { src: artSrc, srcSet: typeof art === 'object' && typeof art?.srcSet === 'string' && art.srcSet ? art.srcSet : null };
  const own = ownCoverImage(ownCover) || ownCoverImage(storedCover);
  return own ? { src: own, srcSet: null } : null;
}

/** The cover's image URL alone (null: the paper cover). */
export function bookCoverSrc(input) {
  return resolveBookCover(input)?.src ?? null;
}

// ---- The paper cover ----
function hue(text) { let h = 0; for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function wrap(ctx, text, width) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = [];
  let line = '';
  for (const word of words) { const next = line ? line + ' ' + word : word; if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line);
  return lines;
}
/** At most `max` lines; the last one kept says the title goes on (…), never cut silently. */
function clampLines(ctx, lines, max, width) {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = kept[max - 1] + ' ' + lines[max];
  while (last.length > 1 && ctx.measureText(last + '…').width > width) last = last.slice(0, -1).trimEnd();
  kept[max - 1] = last + '…';
  return kept;
}
/** A typographic paper cover (480×720): title and author set on cream paper, a thin rule in the book's own hue. */
export function paperCover(title, author, kind) {
  const c = document.createElement('canvas'); c.width = 480; c.height = 720;
  const ctx = c.getContext('2d'); if (!ctx) return c;
  const h = hue(title); ctx.fillStyle = '#ece5d0'; ctx.fillRect(0, 0, 480, 720);
  const grain = ctx.createLinearGradient(0, 0, 480, 720); grain.addColorStop(0, '#f4eedc'); grain.addColorStop(1, '#ddd3b8');
  ctx.fillStyle = grain; ctx.globalAlpha = .6; ctx.fillRect(0, 0, 480, 720); ctx.globalAlpha = 1;
  ctx.fillStyle = `hsl(${h} 30% 32%)`; ctx.fillRect(0, 0, 14, 720);
  ctx.strokeStyle = `hsl(${h} 25% 38%)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(70, 250); ctx.lineTo(410, 250); ctx.stroke();
  ctx.fillStyle = '#1c1a14'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let size = 48; ctx.font = `${size}px Georgia,serif`; let lines = wrap(ctx, title, 340);
  while (lines.length > 5 && size > 26) { size -= 4; ctx.font = `${size}px Georgia,serif`; lines = wrap(ctx, title, 340); }
  clampLines(ctx, lines, 6, 340).forEach((line, i) => ctx.fillText(line, 70, 310 + i * size * 1.18, 340));
  if (author) { ctx.font = '22px Georgia,serif'; ctx.fillStyle = '#4a4536'; wrap(ctx, author.toUpperCase(), 340).slice(0, 2).forEach((line, i) => ctx.fillText(line, 70, 620 + i * 28, 340)); }
  if (kind) { ctx.font = '600 15px system-ui,sans-serif'; ctx.fillStyle = `hsl(${h} 25% 38%)`; ctx.fillText(String(kind).toUpperCase(), 70, 200); }
  return c;
}

const paperUrls = new Map();
/** The paper cover as an image URL (cached per title, author and kind); '' where this browser cannot draw it. */
export function paperCoverUrl(title, author = '', kind = '') {
  const key = `${title}\n${author}\n${kind}`;
  if (!paperUrls.has(key)) {
    let url = '';
    try { url = paperCover(title, author, kind).toDataURL('image/jpeg', 0.9) || ''; } catch { url = ''; }
    if (!url.startsWith('data:image/')) url = '';
    paperUrls.set(key, url);
  }
  return paperUrls.get(key);
}
