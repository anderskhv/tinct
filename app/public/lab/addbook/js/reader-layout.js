'use strict';
// Tinct · Add a book: the reader's layouts (the Aa panel, Anders, 15 Oct 2026). A PDF reads in
// Margin view (the margin column, its marks or the phone's bottom card) or in Focus view (the page
// in the middle, no column; Explain, Ask and the chat open in a pop-up window, as in the book
// reader). An EPUB has no margin yet, so it has no layout to choose. The choice is this device's
// (the reader's prefs, tinct-addbook:prefs). No DOM and no network here, so every rule has a unit
// test (src/addbookLayout.test.ts). Loaded before reader.js as window.TinctReaderLayout.
(function (root, factory) {
  const api = factory();
  root.TinctReaderLayout = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const LAYOUTS = { margin: 'Margin view (default)', focus: 'Focus view' };
  const DEFAULT = 'margin';
  // Where a text PDF's Tinct text (its reflowed edition, read in the Tinct reader) is offered in the Aa
  // panel, as "Convert to Tinct book" (Anders, 15 Oct 2026): 'layout', a third choice under Layout;
  // 'row', its own row below the size. Moving it is this one switch.
  const TINCT_TEXT = 'layout';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /** The layout a book reads in: a PDF's stored choice, else Margin view; an EPUB always reads as it does now. */
  function layoutOf(prefs, kind) {
    if (kind !== 'pdf') return DEFAULT;
    const v = prefs && prefs.layout;
    return Object.prototype.hasOwnProperty.call(LAYOUTS, v) ? v : DEFAULT;
  }
  /** The prefs with this layout chosen (Margin view, the default, is stored as no choice). */
  function withLayout(prefs, layout) {
    const next = { ...(prefs || {}) };
    if (layout === DEFAULT || !Object.prototype.hasOwnProperty.call(LAYOUTS, layout)) delete next.layout;
    else next.layout = layout;
    return next;
  }
  /**
   * The Layout choices in the Aa panel. A PDF: Margin view and Focus view, then Convert to Tinct book (its Tinct text) when the
   * PDF has a Tinct text and TINCT_TEXT is 'layout' (it leaves for the Tinct reader, so it is never
   * the current one here). An EPUB: none (it has one way to read here; no Two page or Compare yet).
   * -> [{ id, label, on, leaves? }]
   */
  function options(kind, { layout = DEFAULT, hasText = false, tinctText = TINCT_TEXT } = {}) {
    if (kind !== 'pdf') return [];
    const out = Object.entries(LAYOUTS).map(([id, label]) => ({ id, label, on: id === layout }));
    if (hasText && tinctText === 'layout') out.push({ id: 'text', label: 'Convert to Tinct book', on: false, leaves: true });
    return out;
  }
  /**
   * Where the margin shows a card: 'focus' (a pop-up window) in Focus view at any width; in Margin
   * view, 'phone' (the bottom card) on the phone layout, 'column' from `narrow` px, 'marks' below it.
   */
  function surface(layout, { phone = false, width = 0, narrow = 1180 } = {}) {
    if (layout === 'focus') return 'focus';
    if (phone) return 'phone';
    return width >= narrow ? 'column' : 'marks';
  }
  /** Where an answer (Explain, Ask, Simplify, the whole-PDF chat, Talk's thread) is drawn on a surface. */
  function answerHost(surfaceName) {
    return { focus: 'popup', column: 'column', marks: 'float', phone: 'sheet' }[surfaceName] || null;
  }
  /**
   * Switch layouts without moving the reader: the place is read before the change and gone back to
   * after it (the page may change width), then kept. `place()` -> { page, frac }; `apply(next)` makes
   * the change; `goTo(place)`; `save()`. -> the place kept, or null when nothing changed.
   */
  function switchLayout(from, to, { place, apply, goTo, save }) {
    if (from === to) return null;
    const at = place();
    apply(to);
    goTo(at);
    if (save) save();
    return at;
  }
  /**
   * The pop-up window of Focus view (the book reader's Explain window, src/lab/lab.css
   * .selection-popup.is-contextual-explain: 380px, 18px corners). `frame` is the reader's box below its
   * top bar (on the phone, above the keyboard), `passage` the passage's box or null (the whole-PDF chat,
   * a unit's quiz, Before you start), `h` the window's natural height.
   * Desktop: 380px wide; beside the page when there is room right of it, level with the passage; else
   * below the passage, else above it, centred on it; else on the larger side, shortened to fit. Phone:
   * the frame's width less 12px each side, below or above the passage the same way. Without a passage:
   * centred at the top (the phone: at the bottom). Always inside the frame, 12px (phone) or 16px clear.
   * -> { left, top, width, maxHeight, side }
   */
  function placePopup({ frame, passage = null, pageRight = null, w = 380, h, phone = false }) {
    const inset = phone ? 12 : 16, gap = 12;
    const width = phone ? frame.right - frame.left - inset * 2 : Math.min(w, frame.right - frame.left - inset * 2);
    const room = Math.max(120, frame.bottom - frame.top - inset * 2);
    const fit = Math.min(h, room);
    const across = (centre) => clamp(centre - width / 2, frame.left + inset, frame.right - inset - width);
    if (!passage) {
      const left = phone ? frame.left + inset : across((frame.left + frame.right) / 2);
      const top = phone ? frame.bottom - inset - fit : frame.top + inset;
      return { left, top, width, maxHeight: room, side: 'none' };
    }
    if (!phone && pageRight != null && pageRight + 24 + width <= frame.right - inset) {
      const top = clamp(passage.top - 4, frame.top + inset, frame.bottom - inset - fit);
      return { left: pageRight + 24, top, width, maxHeight: room, side: 'beside' };
    }
    const left = phone ? frame.left + inset : across((passage.left + passage.right) / 2);
    const below = frame.bottom - inset - (passage.bottom + gap), above = passage.top - gap - (frame.top + inset);
    if (h <= below) return { left, top: passage.bottom + gap, width, maxHeight: below, side: 'below' };
    if (h <= above) return { left, top: passage.top - gap - h, width, maxHeight: above, side: 'above' };
    // Too tall for either side: the larger one, shortened (its answer scrolls inside); with less than
    // 200px on both, over the page from the frame's top (the passage is underlined beneath it).
    if (Math.max(below, above) >= 200) {
      return below >= above
        ? { left, top: passage.bottom + gap, width, maxHeight: below, side: 'below' }
        : { left, top: passage.top - gap - above, width, maxHeight: above, side: 'above' };
    }
    return { left, top: frame.top + inset, width, maxHeight: room, side: 'over' };
  }
  /* ---------- Phones: fit the text column (the PM's full battery, 15 Oct 2026) ---------- */
  // A PDF page at the phone's width is too small to read, so on a phone the pages open zoomed until
  // the text column fills the width (one column of a two-column paper), panned to that column; the
  // pan stays inside the page. Pinch zoom stays the reader's, and their zoom is kept instead.
  const quantile = (list, q) => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0 };
  const median = list => quantile(list, 0.5);
  /**
   * One page's text column, in the page's units: `rows` its visual lines (TinctPdfScan.textRows), `sides`
   * what TinctPdfText.columnsOf says of them (null for a page in one column; else 0, 1 or 'span' per
   * row). A two-column page's column is its first one, as wide as the wider of the two. Lines of fewer
   * than 4 words (headings, labels, page numbers) do not count. -> { left, right, columns } or null
   * when the page has too little running text to tell.
   */
  function textColumn(rows, sides = null) {
    const lines = (rows || []).map((r, i) => ({ r, side: sides ? sides[i] : 0 })).filter(({ r }) => r && r.words >= 4 && r.x2 > r.x);
    const box = side => {
      const of = lines.filter(l => l.side === side).map(l => l.r);
      return of.length >= 6 ? { left: quantile(of.map(r => r.x), 0.1), right: quantile(of.map(r => r.x2), 0.9) } : null;
    };
    const first = box(0);
    if (!first || first.right <= first.left) return null;
    if (!sides) return { ...first, columns: 1 };
    const second = box(1);
    const width = Math.max(first.right - first.left, second ? second.right - second.left : 0);
    return { left: first.left, right: first.left + width, columns: 2 };
  }
  /** The document's column from its pages' (each a textColumn or null): the median left and width, the columns most pages have. */
  function documentColumn(list) {
    const cols = (list || []).filter(Boolean);
    if (!cols.length) return null;
    const left = median(cols.map(c => c.left)), width = median(cols.map(c => c.right - c.left));
    const two = cols.filter(c => c.columns === 2).length;
    return { left, right: left + width, columns: two * 2 > cols.length ? 2 : 1 };
  }
  // Zoomed in by less than this, the column already nearly fills the width: the page stays at fit.
  const COLUMN_FIT_MIN = 1.1;
  const ZOOM_MAX = 3;
  /**
   * The zoom at which the column fills the scroller's width less `gutter` each side. `room`: the scroller's
   * width in CSS px, which is the page's width at zoom 1 on a phone (no side padding while zoomed);
   * `pageWidth`: the page's width in its units; `cropX`: the share trimmed off each side (Trim page margins).
   * -> a zoom from 1 to 3 (1: leave the page at fit).
   */
  function columnZoom({ column, pageWidth, room, cropX = 0, gutter = 10 }) {
    if (!column || !(pageWidth > 0) || !(room > 0)) return 1;
    const shown = pageWidth * (1 - 2 * cropX), width = column.right - column.left;
    if (!(width > 0)) return 1;
    const z = ((room - 2 * gutter) * shown) / (width * room);
    if (!(z >= COLUMN_FIT_MIN)) return 1;
    return Math.round(Math.min(ZOOM_MAX, z) * 100) / 100;
  }
  /**
   * The scroller's left offset that puts the column `gutter` px from the screen's left edge: `sheetLeft`
   * is the page's left in the scroller's content, `sheetWidth` its width now, `x0` the page box's left.
   * Kept inside the page: never left of its edge, never past its right edge less the screen.
   */
  function columnScroll({ column, pageWidth, x0 = 0, cropX = 0, sheetLeft, sheetWidth, room, gutter = 10 }) {
    if (!column || !(pageWidth > 0)) return Math.max(0, sheetLeft);
    const scale = sheetWidth / (pageWidth * (1 - 2 * cropX));
    const at = sheetLeft + (column.left - x0 - cropX * pageWidth) * scale - gutter;
    return Math.round(clamp(at, sheetLeft, Math.max(sheetLeft, sheetLeft + sheetWidth - room)));
  }
  /**
   * The phone's page pill, fullest first: the chapter, then the page (or an EPUB's percent), then the
   * same without its chevron. The reader shows the first that leaves the title whole and is not cut
   * itself, else the last: never an empty pill. -> [{ label, chevron }]
   */
  function pillStages({ chapter = '', page = '', pct = '', epub = false } = {}) {
    const short = epub ? pct : page ? `p. ${page}` : pct;
    const out = [];
    if (chapter) out.push({ label: chapter, chevron: true });
    if (short) out.push({ label: short, chevron: true }, { label: short, chevron: false });
    return out.length ? out : [{ label: chapter || short || '–', chevron: false }];
  }
  return { LAYOUTS, DEFAULT, TINCT_TEXT, layoutOf, withLayout, options, surface, answerHost, switchLayout, placePopup, textColumn, documentColumn, columnZoom, columnScroll, pillStages, COLUMN_FIT_MIN };
});
