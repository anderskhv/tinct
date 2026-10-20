'use strict';
// Tinct · Add a book: the reader's layouts (the Aa panel, Anders, 15 Oct 2026). A PDF reads in
// Margin view (the margin column, its marks or the phone's bottom card) or in Focus view (the page
// in the middle, no column; Explain, Ask and the chat open in a pop-up window, as in the book
// reader). An EPUB reads in Margin view on the desktop (epubView), or in the Tinct reader. The choice is this device's
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
  function options(kind, { layout = DEFAULT, hasText = false, tinctText = TINCT_TEXT, epubMargin = false } = {}) {
    // An EPUB read here in Margin view (the desktop, epubView): that view, and Convert to Tinct book (the Tinct reader).
    if (kind === 'epub' && epubMargin) return [{ id: 'margin', label: LAYOUTS.margin, on: true }, { id: 'text', label: 'Convert to Tinct book', on: false, leaves: true }];
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
   * itself, else the last: never an empty pill. -> [{ label, chevron, cut? }]
   * An EPUB's chapter (a Tinct book's in the margin preview, round 2: To the Lighthouse showed "33%" alone) is
   * tried shorter before the percent: its numbered part ("Chapter 1" of "Book One (1805) — Chapter 1"), then
   * cut with an ellipsis (`cut`: a closing number is kept: "The Wi… · 1").
   * Round 3: in an EPUB the book's title gives way first, as the chapter's name is what the pill is for ("To the
   * Lighthouse | The W… · 2" on a 390 px phone): each chapter label is tried with the title whole, then with the title
   * cut (`title: 'cut'`, still readable), then without the title (`title: 'off'`), and is cut itself only after that.
   */
  function pillStages({ chapter = '', page = '', pct = '', epub = false } = {}) {
    const short = epub ? pct : page ? `p. ${page}` : pct;
    const out = [];
    if (chapter && epub) {
      const name = shortChapter(chapter), labels = name !== chapter ? [chapter, name] : [chapter];
      for (const label of labels) out.push({ label, chevron: true }, { label, chevron: true, title: 'cut' });
      for (const label of labels) out.push({ label, chevron: true, title: 'off' });
      out.push({ label: name, chevron: false, cut: true, title: 'off' });
    } else if (chapter) out.push({ label: chapter, chevron: true });
    if (short) out.push({ label: short, chevron: true }, { label: short, chevron: false });
    return out.length ? out : [{ label: chapter || short || '–', chevron: false }];
  }
  /** A chapter's numbered part, for a short pill: "Chapter 1" of "Book One (1805) — Chapter 1", "Act 1, Scene 1" of
   * "Act 1, Scene 1 — Venice. A street"; the label itself when no part of it ends with a number. */
  function shortChapter(label) {
    const parts = String(label || '').split(/\s+—\s+/);
    if (parts.length < 2) return String(label || '');
    return parts.slice().reverse().find(p => /(?:^|\s)(?:\d+|[IVXLC]+)\.?$/.test(p.trim())) || String(label);
  }
  /** A label as its cut stage shows it: the closing number kept whole after the ellipsis. -> { head, tail } */
  function cutLabel(label) {
    const m = /^(.*?\S)(\s*[·,:]?\s+(?:\d+|[IVXLC]+))$/.exec(String(label || ''));
    return m ? { head: m[1], tail: m[2] } : { head: String(label || ''), tail: '' };
  }
  /* ---------- Phones: the mode a PDF opens in, by its kind (Anders, 16 Oct 2026, option C) ---------- */
  // On a phone a narrative or an essay (fiction, memoir, essays) opens as its Tinct text, reflowed in the
  // Tinct reader, and so does a paper of running prose (textHeavy); a paper dense with equations, figures
  // or tables, a textbook, a practical guide and anything else open in their pages at the column fit. The kind is told at open from the text of a few pages and the scan, before any AI call;
  // a primer kept for the book names its kind, and that wins. Unsure: the pages. The desktop keeps the
  // scan's default (pdf-scan.js layout). The reader's own choice always wins (TinctPdfText.choice).
  const KINDS = ['paper', 'textbook', 'narrative', 'practical', 'other'];
  /** The pages read to tell the kind: the first three and five spread through the document. */
  function kindPages(count) {
    const n = Math.max(0, Math.floor(count || 0)), out = new Set();
    for (let k = 1; k <= Math.min(3, n); k++) out.add(k);
    for (let i = 1; i <= 5 && n > 3; i++) out.add(Math.max(1, Math.min(n, Math.round((n * i) / 6))));
    return [...out].sort((a, b) => a - b);
  }
  const IMPERATIVE = /^(?:[■•▪●◦·]\s*|\d{1,2}[.)]\s+)?(?:use|remove|clean|check|avoid|keep|make|turn|open|close|wear|add|place|put|do not|don['’]t|never|always|select|click|tap|press|install|fix|dry|wash|throw|fill|cut|mix|set|apply|ensure|contact|call|follow|take|stop|start|store|replace|reduce|increase|vent|repair|ventilate|discard|scrub|run|insert|connect|choose|try|consult|hire|ask|find|look|be sure|let|allow|prevent|limit|consider|go|move|lift|preheat|stir|bake|remember|if you)\b/i;
  /** What the sampled text says (`pages`: [{ n, text }]): rates per 1,000 words, shares and yes/no signs. */
  function kindSigns(pages) {
    const text = (pages || []).map(p => (p && p.text) || '').join('\n');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const words = (text.match(/\p{L}+/gu) || []).length;
    const per = n => (words ? (n * 1000) / words : 0);
    const count = re => (text.match(re) || []).length;
    const first = (pages || []).filter(p => p && p.n <= 2).map(p => p.text || '').join('\n');
    const letters = (text.match(/\p{L}/gu) || []).length, digits = (text.match(/\d/g) || []).length;
    const sentences = text.replace(/\n(?=[■•▪●◦·])/g, '. ').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(x => x.length > 12);
    return {
      words,
      abstract: /^(?:\d+\.?\s*)?abstract\b/im.test(first),
      references: /^(?:\d+\.?\s*)?(?:references|bibliography|works cited)\.?$/im.test(text),
      arxiv: /\barxiv:\s*\d|\bdoi:\s*10\.\d|\bdoi\.org\/10\./i.test(text),
      // Citations: [12], [3, 7], (Vaswani et al., 2017).
      cites: per(count(/\[\d{1,3}(?:\s*[,–-]\s*\d{1,3})*\]/g) + count(/\([A-Z][\p{L}'-]+(?: et al\.?| and [A-Z][\p{L}'-]+)?,? (?:1[89]|20)\d\d[a-z]?\)/gu)),
      exercises: count(/^(?:exercises?|problems?)\s*\d+(?:\.\d+)*/gim) + count(/\bsolution to exercise\b/gi),
      theorems: count(/^(?:theorem|definition|lemma|example|proof)\s*\d*[.:]/gim),
      dialogue: per(count(/[“"][^”"\n]{2,200}[”"]/g)),
      firstPerson: per(count(/\b(?:I|me|my|myself|I['’]m|I['’]ve|I['’]d)\b/g)),
      you: per(count(/\b(?:you|your|yours)\b/gi)),
      digits: letters ? digits / letters : 0,
      // Bullets and numbered steps, per 1,000 words; the share of sentences that tell the reader to do something.
      lists: per(lines.filter(l => /^(?:[■•▪●◦·✓☐]\s*|[-–*]\s+|(?:step\s+)?\d{1,2}[.)]\s+\p{L})/iu.test(l)).length),
      imperatives: sentences.length ? sentences.filter(x => IMPERATIVE.test(x.trim())).length / sentences.length : 0,
      questions: lines.filter(l => /^(?:how|what|why|when|who|where|can|should|do|does|is|are)\b[^?]{3,80}\?\s*\d*$/i.test(l)).length,
    };
  }
  /**
   * The document's kind, told locally from `pages` (the sampled text, kindPages) and the `scan` (its layout
   * signals, chapters, navigation), or the kept primer's `primerKind`, which wins. Scores each kind and
   * names the best only when it scores 3 or more and leads the next by 1 or more; else 'other' (unsure).
   * -> { kind, sure, by: 'primer' | 'text' }
   */
  function docKind({ scan = null, pages = [], count = 0, primerKind = null } = {}) {
    if (KINDS.includes(primerKind)) return { kind: primerKind, sure: true, by: 'primer' };
    const f = kindSigns(pages), s = (scan && scan.layout && scan.layout.signals) || {};
    if (f.words < 150) return { kind: 'other', sure: false, by: 'text' };
    const entries = Array.isArray(scan && scan.entries) ? scan.entries : [];
    const numbered = entries.filter(e => /^(?:chapter\s+)?\d+\s*(?:·|\.|:|\s)\s*\p{L}/iu.test(String((e && e.label) || ''))).length;
    const n = count || (scan && scan.pages) || 0;
    const score = {
      paper: (f.abstract ? 3 : 0) + (f.references ? 2 : 0) + (f.arxiv ? 1 : 0) + (f.cites >= 3 ? 2 : f.cites >= 1 ? 1 : 0)
        + (s.paper ? 1 : 0) + (s.columns ? 1 : 0) + (s.math ? 1 : 0) + (n > 150 ? -3 : n > 60 ? -1 : 0),
      textbook: (f.exercises >= 3 ? 3 : f.exercises >= 1 ? 2 : 0) + (numbered >= 4 ? 2 : 0) + (n >= 80 ? 1.5 : n < 40 ? -2 : 0)
        + (s.math ? 1 : 0) + (f.theorems >= 2 ? 1 : 0) - (f.abstract ? 2 : 0),
      narrative: (s.prose ? 2 : 0) + (f.dialogue >= 5 ? 2 : f.dialogue >= 2 ? 1 : 0) + (f.firstPerson >= 30 ? 2.5 : f.firstPerson >= 15 ? 1.5 : 0)
        + (f.digits < 0.008 ? 1 : f.digits > 0.03 ? -2 : 0) + (scan && scan.nav === 'pages' ? 0.5 : 0)
        - (s.math ? 3 : 0) - (s.columns ? 3 : 0) - (s.tables ? 2 : 0) - (s.paper || f.abstract ? 3 : 0) - (f.cites >= 1 ? 2 : 0) - (f.lists >= 4 ? 2 : 0) - (f.exercises ? 2 : 0),
      practical: (f.lists >= 8 ? 2.5 : f.lists >= 4 ? 1.5 : 0) + (f.imperatives >= 0.15 ? 2 : f.imperatives >= 0.07 ? 1 : 0) + (f.questions >= 2 ? 1 : 0)
        + (f.you >= 10 ? 1 : 0) - (f.abstract ? 2 : 0) - (s.math ? 1 : 0),
    };
    const [[kind, top], [, next]] = Object.entries(score).sort((a, b) => b[1] - a[1]);
    const sure = top >= 3 && top - next >= 1;
    return { kind: sure ? kind : 'other', sure, by: 'text' };
  }
  // The scan's own rule (pdf-scan.js layout: columns, mathematics, figures and tables score against prose,
  // 'text' under 3.5) sent Deutsch's "Constructor Theory", a 40-page paper of running prose, to its Tinct
  // text; on a phone a paper or an unsure kind follows it only when no page-bound sign is on as well.
  const PAGE_BOUND = ['columns', 'math', 'figures', 'tables'];
  /** True when the scan reads the PDF as running text: its default is Tinct text and no columns, mathematics, figures or tables. */
  function textHeavy(layout) {
    const signals = (layout && layout.signals) || {};
    return !!layout && layout.default === 'text' && !PAGE_BOUND.some(k => signals[k]);
  }
  /**
   * The edition a kind opens in on a phone: a narrative (fiction, memoir, an essay) as its Tinct text; a
   * textbook or a practical guide in its pages; a paper or an unsure kind as its Tinct text only when it is
   * text-heavy (textHeavy: mostly prose, few equations, figures or tables), else in its pages.
   */
  function phoneEdition(kind, layout = null) {
    if (kind === 'narrative') return 'text';
    if (kind === 'textbook' || kind === 'practical') return 'pages';
    return textHeavy(layout) ? 'text' : 'pages';
  }
  /**
   * The edition a PDF opens in on the desktop (Anders, 19 Oct 2026: Margin view is the main desktop
   * experience): its original pages, in Margin view, whatever its kind. The prose exception of 16 Oct
   * (a narrative, or running prose such as Deutsch's "Constructor Theory", as its Tinct text) is gone;
   * Tinct text on the desktop is the reader's own choice on that device ("Convert to Tinct book").
   */
  function desktopEdition(kind, layout = null) {
    return 'pages';
  }
  /**
   * The default edition a PDF opens in when the reader has chosen none: on a phone, by its kind (when told,
   * phoneEdition) and the scan's `layout`, else the scan's default; on the desktop, by desktopEdition (its
   * pages, in Margin view). A PDF without text ('pages-only')
   * has its pages only.
   */
  function openDefault({ phone = false, kind = null, layout = null } = {}) {
    const layoutDefault = (layout && layout.default) || null;
    if (layoutDefault === 'pages-only') return layoutDefault;
    if (phone) return kind ? phoneEdition(kind, layout) : layoutDefault;
    return layoutDefault ? desktopEdition(kind, layout) : null;
  }
  /**
   * The reader's own edition choice for a book on this device (tinct-addbook:edition:<hex>), or null. The
   * phone keeps its default there too (so the library and the Tinct reader open the book the same way),
   * marked by `auto` ({ edition }, tinct-addbook:phone-edition:<hex>), and so does the desktop (`desk`,
   * tinct-addbook:desk-edition:<hex>): a stored value equal to either is a default, not the reader's
   * choice, and is ignored.
   */
  function ownChoice(stored, auto, desk = null) {
    if (stored !== 'text' && stored !== 'pages') return null;
    return (auto && auto.edition === stored) || (desk && desk.edition === stored) ? null : stored;
  }
  /**
   * Where an EPUB opens (Anders, 19 Oct 2026): on the desktop, here, in Margin view (its text flowing, with
   * the margin's cards and the Notebook), unless the reader chose the Tinct reader on this device ("Convert to
   * Tinct book"; `own`: 'text'), or chose Margin view back from there ('margin'). Phones keep the Tinct reader,
   * as before 19 Oct. `own` is this device's choice (tinct-addbook:epub-view:<hex>), never the account's.
   * The same rule as app/src/lab/userBook/epubView.ts. -> 'margin' | 'text'
   */
  function epubView({ phone = false, own = null } = {}) {
    if (phone) return 'text';
    return own === 'text' ? 'text' : 'margin';
  }
  /** Words compared loosely: letters and figures only, lower case, accents and punctuation dropped. */
  const quoteKey = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  /**
   * Where some words stand in a book (the place crossing between an EPUB read here and its Tinct text, whose
   * paragraphs are cut by another reader of the file): `chapters` is a list of chapters, each a list of
   * paragraph texts. The first paragraph holding the words' first 60 letters, else their first 30, else 16
   * (whole words); `word` is the index of the word they start at. -> { chapter, para, word } (0-based) | null
   */
  function findQuote(chapters, quote) {
    const q = quoteKey(quote); if (q.length < 6) return null;
    const keys = (chapters || []).map(list => (list || []).map(quoteKey));
    for (const size of [60, 30, 16]) {
      if (q.length < size && size !== 16) continue;
      const cut = q.length <= size ? q : q.slice(0, q.lastIndexOf(' ', size) > 5 ? q.lastIndexOf(' ', size) : size);
      for (let c = 0; c < keys.length; c++) for (let p = 0; p < keys[c].length; p++) {
        const k = keys[c][p], at = (' ' + k).indexOf(' ' + cut);
        if (at < 0) continue;
        return { chapter: c, para: p, word: at === 0 ? 0 : k.slice(0, at).split(' ').filter(Boolean).length };
      }
    }
    return null;
  }
  /*
   * Tinct paper for an EPUB of the reader's own on the desktop (Anders, 20 Oct 2026: "the same continuous Tinct-paper
   * page as Tinct books in the preview"): the text as the book reader's desktop leaf sets it for this reader and window,
   * by the same formulas as the preview's (app/src/lab/marginPreview/marginPreviewModel.ts marginPreviewPaper; a unit
   * test keeps them equal). `raw`: the stored `tinct-lab-prefs` (its desktop appearance). -> { fontFamily, fontSize,
   * headingSize, lineHeight, paragraphGap, align, measure } (px, em)
   */
  const FONTS = { baskerville: "'Libre Baskerville', 'EB Garamond', Georgia, serif", sourceserif: "'Source Serif 4', 'EB Garamond', Georgia, serif", literata: "'Literata', 'EB Garamond', Georgia, serif", atkinson: "'Atkinson Hyperlegible', 'IBM Plex Sans', system-ui, sans-serif" };
  function desktopAppearance(raw) {
    let src = null;
    try { src = typeof raw === 'string' ? JSON.parse(raw || 'null') : raw } catch { src = null }
    if (!src || typeof src !== 'object') return {};
    if (src.version === 2 && src.desktop && typeof src.desktop === 'object') return { ...(src.shared || {}), ...src.desktop };
    return src;
  }
  function paper(raw, viewportWidth) {
    const p = desktopAppearance(raw), w = Number(viewportWidth) > 0 ? Number(viewportWidth) : 1440;
    const desktopDefault = clamp(Math.round(w * 0.00077 * 10) / 10, 1.0, 1.4);
    const size = p.fontSizeExplicit === true && Number(p.fontSize) > 0 ? Number(p.fontSize) : desktopDefault;
    const named = (v, map, dflt) => (typeof v === 'number' && Number.isFinite(v) ? v : map[v] ?? dflt);
    const scale = named(p.margins, { narrow: 0.7, wide: 1.45, medium: 1 }, 1);
    const padX = clamp(w * 0.03, 28, 64) * scale;
    const explicit = typeof p.alignmentExplicit === 'boolean' ? p.alignmentExplicit : p.alignment === 'left' || p.alignment === 'justify';
    return {
      fontFamily: p.fontFamily === 'garamond' ? "'EB Garamond', Georgia, 'Times New Roman', serif" : FONTS[p.fontFamily] || FONTS.literata,
      fontSize: 16 * 1.42 * size / 1.3,
      headingSize: 16 * 1.58 * size / 1.3,
      lineHeight: named(p.lineSpacing, { compact: 1.34, open: 1.62, comfortable: 1.48 }, 1.48),
      paragraphGap: named(p.paragraphSpacing, { compact: 0.08, generous: 0.55, standard: 0.28 }, 0.28),
      align: explicit && (p.alignment === 'left' || p.alignment === 'justify') ? p.alignment : 'justify',
      measure: Math.max(280, (w - 2 * 31 - 2 * padX - 56) / 2),
    };
  }
  return { paper, epubView, quoteKey, findQuote, LAYOUTS, DEFAULT, TINCT_TEXT, layoutOf, withLayout, options, surface, answerHost, switchLayout, placePopup, textColumn, documentColumn, columnZoom, columnScroll, pillStages, shortChapter, cutLabel, COLUMN_FIT_MIN, KINDS, kindPages, kindSigns, docKind, textHeavy, phoneEdition, desktopEdition, openDefault, ownChoice };
});
