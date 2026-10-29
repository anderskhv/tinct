'use strict';
// Tinct · Add a book: the fast scan of a PDF, run when it is added or first opened, and again
// when SCAN_VERSION moves on. Deterministic, no network: the document's title and author, and
// a chapter list that is real or none at all.
//   1. Title: the metadata Title when it is a real title, else the largest line(s) printed on
//      the first pages (not a running head, page number or epigraph), else the file name made
//      readable ("PossibleMinds_Deutsch (1).pdf" -> "Possible Minds Deutsch").
//   2. Author: the metadata Author when it names a person, else a "by …" / "edited by …" line
//      or a name-like line beside the printed title.
//   3. Chapters: the outline (bookmarks), else the printed Contents pages, else headings found
//      by size and face, leaving out epigraphs and quotations (italic lines, lines in quotes,
//      the lines of a quotation above its "— Author, Work" line), running heads and feet (text
//      repeated across pages) and page numbers. A document with no real headings gets page
//      navigation (nav 'pages', no entries) instead of a chapter made up from a stray line.
//      Headings found this way also leave out title pages, contents pages, scanners' notices
//      and stamps, and lines of a scan's text layer that are only a little larger than the body.
//   4. Language: the declared one, else the language of the text's common words.
//   5. textPages: how many of the scanned pages carry text (0: a scan without a text layer, or
//      one whose text layer is garbage: more than 30% of its tokens without a letter).
//   6. layout: the edition the PDF opens in by default ('text': Tinct text, 'pages': Original
//      pages, 'pages-only': no text to reflow), from its columns, mathematics, figures and
//      tables (see layout below). Version 5 (2026-10-09) added it.
//   Version 6 (2026-10-16): a metadata title that is the printed title with more after it gives way to the printed one.
//   Version 8 (2026-10-28): reconstruct sloped word baselines and keep lowercase wrapped heading lines.
//   Version 9 (2026-10-28): keep drop-cap paragraph openings out of wrapped headings.
//   Version 10 (2026-10-29): split lines joined across a narrow two-column gutter (gutterOf).
// Used by js/reader.js (window.TinctPdfScan); the tests import this file directly.
(function (global) {
  const SCAN_VERSION = 10;
  const HEADING_PAGES = 400;

  /* ---------- Text rows ---------- */
  // Positioned text items -> visual lines, top first: { y, x, x2, size, fonts, font, chars, text, words }.
  // Rotated text is left out.
  function textRows(items) {
    const rows = [];
    for (const it of items || []) {
      if (!it || typeof it.str !== 'string' || !it.transform) continue;
      const [a, b, c, d, x, y] = it.transform;
      if (!it.str.trim() || Math.abs(b) > 0.01 * Math.abs(a) || Math.abs(c) > 0.01 * Math.abs(d)) continue;
      const size = Math.hypot(c, d) || it.height || 0;
      let row = rows.find(r => Math.abs(r.y - y) < Math.max(2, size * 0.3));
      if (!row) { row = { y, parts: [] }; rows.push(row) }
      row.parts.push({ x, y, w: it.width || 0, s: it.str, size, font: it.fontName });
    }
    // A line that runs across a wide gap into a second column is two lines: a heading in the
    // left column is not joined to the right column's text ("1 Introduction" + "of long slow …").
    // A page in two columns set with a narrow gutter (a conference paper's 0.3 in, under three ems)
    // has its two columns' lines on the same baseline joined into one ("…lower complex- greatly
    // benefited…"). A gap of more than an em over the page's gutter (gutterOf) splits the line, and
    // the sloped-line pass below never joins across it.
    const gutter = gutterOf(rows);
    const overGutter = (a, b) => gutter !== null && a.x + a.w < gutter && b.x > gutter;
    const split = [];
    for (const r of rows) {
      const parts = r.parts.sort((p, q) => p.x - q.x);
      let seg = [parts[0]];
      const close = () => split.push({ y: r.y, parts: seg });
      for (let i = 1; i < parts.length; i++) {
        const p = parts[i], prev = seg.at(-1), gap = p.x - (prev.x + prev.w), em = Math.max(p.size, prev.size) || 1;
        const rest = parts.slice(i).map(q => q.s).join(' ').trim();
        if ((gap > em * 3 && (rest.split(/\s+/).length >= 2 || (rest.match(/\p{L}/gu) || []).length >= 8) && /\p{L}{2}/u.test(seg.map(q => q.s).join(''))) || (gap > em && overGutter(prev, p))) { close(); seg = [p] }
        else seg.push(p);
      }
      close();
    }
    // OCR can describe a gently sloped printed baseline using horizontal word boxes.
    // The first pass may split it against a different column's baseline. Rejoin only
    // neighbouring fragments whose word origins support one shallow straight line;
    // widening the vertical row tolerance alone would merge genuine adjacent lines.
    const aligned = (left, right) => {
      const end = left.parts.at(-1), start = right.parts[0];
      const em = Math.max(end.size, start.size) || 1;
      const gap = start.x - end.x - end.w;
      if (gap < 0 || gap > em * 3 || Math.abs(start.y - end.y) > em * 0.5 || overGutter(end, start)) return false;
      const parts = [...left.parts, ...right.parts];
      if (parts.length < 4 || parts.some(p => Math.abs(p.size - em) > em * 0.1)) return false;
      const mx = parts.reduce((s, p) => s + p.x, 0) / parts.length;
      const my = parts.reduce((s, p) => s + p.y, 0) / parts.length;
      const variance = parts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
      if (!variance) return false;
      const slope = parts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / variance;
      return Math.abs(slope) <= 0.03 && parts.every(p => Math.abs(p.y - (my + slope * (p.x - mx))) <= Math.max(0.5, em * 0.08));
    };
    split.sort((p, q) => p.parts[0].x - q.parts[0].x);
    for (let i = 0; i < split.length; i++) {
      for (let j = i + 1; j < split.length; j++) {
        if (!aligned(split[i], split[j])) continue;
        split[i].parts.push(...split[j].parts);
        split[i].y = split[i].parts[0].y;
        split.splice(j, 1);
        j = i; // A line can have more than two fragments.
      }
    }
    return split.sort((p, q) => q.y - p.y || p.parts[0].x - q.parts[0].x).map(r => {
      const parts = r.parts;
      // The line's size is the size most of its characters are set in (a large symbol does not count).
      const by = new Map();
      for (const p of parts) { const k = Math.round(p.size * 2) / 2; by.set(k, (by.get(k) || 0) + p.s.trim().length) }
      const size = [...by].sort((p, q) => q[1] - p[1])[0][0];
      let text = '';
      parts.forEach((p, i) => { const prev = parts[i - 1]; if (prev && p.x - (prev.x + prev.w) > size * 0.12 && !/\s$/.test(text) && !/^\s/.test(p.s)) text += ' '; text += p.s });
      text = text.replace(/\s+/g, ' ').replace(/\s+([,.:;!?)])/g, '$1').trim();
      const fonts = new Set(parts.filter(p => p.s.trim()).map(p => p.font));
      return { y: r.y, x: parts[0].x, x2: parts.at(-1).x + parts.at(-1).w, size, fonts, font: fonts.size === 1 ? [...fonts][0] : null, chars: text.length, text, words: text.split(' ').length };
    });
  }
  // rows: [{ parts }]. The x of a gutter between two columns, or null. Candidates are the gaps of
  // more than an em inside a line, near the middle of the text; one is a gutter when at least 8
  // lines of a column end just before it and 8 start just after it, and few lines run across it.
  function gutterOf(rows) {
    const segs = [], gaps = [];
    let lo = Infinity, hi = -Infinity;
    for (const r of rows) {
      const parts = [...r.parts].sort((p, q) => p.x - q.x);
      lo = Math.min(lo, parts[0].x); hi = Math.max(hi, parts.at(-1).x + parts.at(-1).w);
      for (let i = 1; i < parts.length; i++) {
        const prev = parts[i - 1], p = parts[i], a = prev.x + prev.w, em = Math.max(p.size, prev.size) || 1;
        if (p.x - a > em && p.x - a <= em * 8) gaps.push([a, p.x]);
      }
      segs.push(parts);
    }
    if (!(hi > lo)) return null;
    // Where a line or a gap in one starts or ends (lines a little off one another's baseline,
    // ResNet's references, are not joined here but may be by the sloped-line pass below).
    const edges = [...gaps.flatMap(([a, b]) => [a + 0.5, b - 0.5]), ...segs.flatMap(parts => [parts[0].x - 0.5, parts.at(-1).x + parts.at(-1).w + 0.5])];
    let best = null, most = 0;
    for (const x of new Set(edges.map(x => Math.round(x * 2) / 2))) {
      if (x < lo + (hi - lo) * 0.35 || x > lo + (hi - lo) * 0.65) continue;
      let left = 0, right = 0, across = 0;
      for (const parts of segs) {
        const em = Math.max(...parts.map(p => p.size)) || 1;
        const words = q => (q.s.match(/\p{L}{2,}/gu) || []).length;
        if (parts.some(p => p.x < x && p.x + p.w > x)) { across++; continue }
        const before = parts.filter(p => p.x + p.w <= x), after = parts.filter(p => p.x >= x);
        // A line of a column: five words or more, filling at least 0.3 of the text's width.
        const line = list => list.length && list.reduce((n, q) => n + words(q), 0) >= 5 && list.at(-1).x + list.at(-1).w - list[0].x >= (hi - lo) * 0.3;
        if (line(before) && x - (before.at(-1).x + before.at(-1).w) <= em * 8) left++;
        if (line(after) && after[0].x - x <= em * 8) right++;
      }
      if (left < 8 || right < 8 || across * 2 > Math.min(left, right)) continue;
      if (left + right - across > most) { most = left + right - across; best = x }
    }
    return best;
  }
  const sizeKey = s => Math.round(s * 2) / 2;
  // Body text: the size (and face) that carries the most characters.
  function bodyOf(rows) {
    const w = new Map();
    for (const r of rows) { const k = sizeKey(r.size) + '|' + (r.font || ''); w.set(k, (w.get(k) || 0) + r.chars) }
    const top = [...w].sort((p, q) => q[1] - p[1])[0];
    if (!top) return null;
    const bar = top[0].indexOf('|');
    return { size: Number(top[0].slice(0, bar)), font: top[0].slice(bar + 1) || null, chars: top[1] };
  }

  /* ---------- Faces ---------- */
  const isBold = name => /bold|black|heavy|semibold|demi|cmbx/i.test(name || '');
  const isItalic = name => /italic|oblique|slanted|cmti|cmsl|-it\b|\bit$/i.test(name || '');

  /* ---------- Furniture: running heads and feet, page numbers ---------- */
  const PAGE_NUMBER = /^(?:(?:page|p\.|pg\.?|side|seite|s\.)\s*)?(?:\d{1,4}|[ivxlcdm]{1,7})(?:\s*(?:of|\/|af|von)\s*\d{1,4})?$/i;
  const isPageNumber = text => PAGE_NUMBER.test(text.trim()) || /^[-–—]\s*\d{1,4}\s*[-–—]$/.test(text.trim());
  // Numbers aside (and, for scanned text, the short tokens a misread number leaves: "II", "H").
  const edgeKey = r => r.text.toLowerCase().replace(/\d+/g, ' ').split(/\s+/).map(w => w.replace(/[^\p{L}]+/gu, '')).filter(w => w.length > 2 && !/^[ivxlc]+$/.test(w)).join('');
  const atEdge = (p, r) => r.y - p.y0 > p.h * 0.9 || r.y - p.y0 < p.h * 0.1;
  // Rows that repeat across pages: near the top or bottom on several pages (numbers aside), or
  // the very same line on several pages anywhere.
  function furniture(pages) {
    const need = pages.length <= 3 ? 2 : 3;
    const seen = new Map(), exact = new Map();
    for (const p of pages) {
      for (const k of new Set(p.rows.filter(r => atEdge(p, r)).map(edgeKey))) if (k) seen.set(k, (seen.get(k) || 0) + 1);
      // As printed: a running head in capitals ("DAVID DEUTSCH") is not the byline it repeats ("David Deutsch").
      for (const k of new Set(p.rows.map(r => r.text))) exact.set(k, (exact.get(k) || 0) + 1);
    }
    return (p, r) => isPageNumber(r.text) || (atEdge(p, r) && (seen.get(edgeKey(r)) || 0) >= need) || (exact.get(r.text) || 0) >= need;
  }

  /* ---------- Epigraphs and quotations ---------- */
  const ATTRIBUTION = /^\s*(?:[—–―~]|-{1,2}(?=\s*\p{Lu}))\s*\S/u;
  const OPENS_QUOTE = /^\s*["“”„«»‘’'‹›]/;
  const CLOSES_QUOTE = /["”»’›]\s*$/;
  // The rows of a page that are an epigraph or a quotation: an attribution line ("— William
  // Shakespeare, Macbeth"), the lines of the quotation above it, a short line continuing the
  // attribution below it, and lines that open (or close) a quotation. Indices into rows.
  function epigraphRows(rows) {
    const out = new Set();
    rows.forEach((r, i) => {
      if (OPENS_QUOTE.test(r.text) || (CLOSES_QUOTE.test(r.text) && r.words <= 14)) out.add(i);
      if (!ATTRIBUTION.test(r.text) || r.words > 14) return;
      out.add(i);
      // The quotation above: lines close together, up to eight of them.
      for (let j = i - 1, below = r; j >= 0 && i - j <= 8; j--) {
        const up = rows[j];
        if (up.y - below.y > Math.max(up.size, below.size) * 2.4) break;
        out.add(j); below = up;
        if (OPENS_QUOTE.test(up.text)) break;
      }
      // A work's name wrapped onto the next line.
      const next = rows[i + 1];
      if (next && next.words <= 6 && r.y - next.y < r.size * 1.8 && !/[.!?]$/.test(r.text)) out.add(i + 1);
    });
    return out;
  }

  /* ---------- Names ---------- */
  const readable = s => String(s || '').replace(/\s+/g, ' ').trim();
  // A file name made readable: no extension, copy counters, version tags or underscores.
  function cleanFileName(name) {
    let t = String(name || '').replace(/\.(pdf|epub)$/i, '');
    t = t.replace(/[_]+/g, ' ').replace(/(?<=\S)-(?=\S)/g, ' ').replace(/(?<=\p{Ll})(?=\p{Lu}\p{Ll})/gu, ' ');
    for (let i = 0; i < 4; i++) t = t.replace(/\s*(?:\(\d+\)|\[\d+\]|\bcopy(?: \d+)?|\bfinal\b|\bdraft\b|\bv\d+(?:\.\d+)*|\brev\d*\b)\s*$/i, '');
    t = readable(t.replace(/\s+-\s*$/, ''));
    return t ? t[0].toUpperCase() + t.slice(1) : readable(name) || 'Untitled';
  }
  const bare = s => String(s || '').toLowerCase().replace(/\.(pdf|epub|docx?)$/i, '').replace(/\(\d+\)/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  // The metadata Title when it is a real title: not empty, a program's default, a file name or
  // the file's own name.
  function metaTitle(raw, name) {
    let t = readable(raw).replace(/^microsoft (?:word|powerpoint) - /i, '');
    if (t.length <= 3 || !/\p{L}{2}/u.test(t)) return null;
    if (/^(untitled|microsoft word|document|title|unknown|none|slide \d+|print|scan)\b/i.test(t)) return null;
    if (/\.(pdf|docx?|tex|dvi|html?|txt|rtf|odt|pages|indd|qxd|ps)$/i.test(t) || /^[a-z]:\\|^\/|^https?:/i.test(t)) return null;
    if (bare(t) === bare(name) || (/[_]/.test(t) && !/\s/.test(t)) || /\(\d+\)\s*$/.test(t)) return null;
    if (/^[\w-]+$/.test(t) && /\d/.test(t)) return null; // "scan0042", "IMG-2024"
    return t;
  }
  // The metadata's title is the printed one with more after it ("Constructor Theory Philosophy": a
  // journal's section, "… EPA-402-K-02-003, September 2010": a report number): the printed title
  // is the book's (version 6). -> the metadata's title, or null to take the printed one.
  function sameTitleLonger(meta, printed) {
    if (!meta || !printed) return meta;
    const m = bare(meta), p = bare(printed);
    return p.length >= 8 && m.length > p.length && m.startsWith(p) ? null : meta;
  }
  const NOT_A_PERSON = /^(user|admin|administrator|owner|unknown|author|anonymous|default|guest|windows user|microsoft|office|adobe|acrobat|pdf|latex|tex|scanner|copier|hp|canon|xerox|epson|ricoh|brother)\b/i;
  function metaAuthor(raw) {
    const t = readable(raw).replace(/^by\s+/i, '');
    if (t.length < 3 || t.length > 120 || !/\p{L}{2}/u.test(t)) return null;
    if (NOT_A_PERSON.test(t) || /@|https?:|www\.|\.com\b|\d{3,}/i.test(t)) return null;
    return t;
  }
  // A line that reads as people's names: two to six words, capitals or initials, joined by
  // "and", "&", commas or particles; no digits or sentence punctuation.
  const PARTICLE = /^(and|&|de|da|di|del|der|den|van|von|la|le|du|y|e|bin|ibn|al|st\.?)$/i;
  function nameLike(text) {
    const t = readable(text).replace(/[*†‡§¹²³]+/g, '').replace(/,\s*$/, '');
    if (!t || /\d|[:;!?()]/.test(t) || t.length > 90) return false;
    const words = t.split(/\s+/);
    if (words.length < 2 || words.length > 9) return false;
    const names = words.filter(w => !PARTICLE.test(w.replace(/,$/, '')));
    return names.length >= 2 && names.every(w => /^(\p{Lu}[\p{L}'’.-]*|\p{Lu}\.)[,]?$/u.test(w));
  }
  const BY_LINE = /^(?:(edited|compiled|translated|introduced|selected)(?: and [a-z]+)? by|by)\s+(.{3,100})$/i;

  /* ---------- Title and author printed on the first pages ---------- */
  // pages: [{ n, y0, h, rows }]. Returns { title, author } (either may be null).
  function printedTitle(pages, isFurniture) {
    for (const p of pages.slice(0, 3)) {
      const skip = epigraphRows(p.rows);
      // Reports often print "Figure 1" above a large, bold chart title. That
      // title belongs to the figure, not to the document's chapter navigation.
      for (const [index, label] of p.rows.entries()) {
        if (!FIGURE_LABEL.test(label.text)) continue;
        skip.add(index);
        let previous = label;
        for (let lines = 0; lines < 3; lines++) {
          const nextIndex = p.rows.findIndex((r, i) => i > index && r.y < previous.y - .5
            && Math.abs(r.x - label.x) < Math.max(label.size, r.size) * 1.5);
          const next = p.rows[nextIndex];
          if (!next || previous.y - next.y > Math.max(previous.size, next.size) * 2.2
            || next.words > 14 || next.size < label.size || (lines > 0 && next.font !== previous.font)) break;
          skip.add(nextIndex); previous = next;
        }
      }
      // A title the running heads repeat ("Constructor Theory" over every page) is still the title where it is
      // set large, away from the page's edges (version 6).
      const lettered = p.rows.filter((r, i) => !skip.has(i) && /\p{L}{2}/u.test(r.text)), pageBody = bodyOf(lettered);
      const rows = lettered.filter(r => !isFurniture(p, r) || (pageBody && !atEdge(p, r) && !isPageNumber(r.text) && r.size >= pageBody.size * 1.3));
      if (!rows.length) continue;
      const body = bodyOf(rows);
      const top = Math.max(...rows.map(r => r.size));
      // A page set at one size has no title on it, unless it is a short title page.
      if (top < body.size * 1.15 && !(rows.length <= 6 && p.n === 1 && rows[0].words <= 14)) continue;
      const i = rows.findIndex(r => r.size >= top * 0.92);
      const lines = [rows[i]];
      for (let j = i + 1; j < rows.length && lines.length < 3; j++) {
        const r = rows[j], prev = lines.at(-1);
        if (r.size < top * 0.92 || prev.y - r.y > r.size * 2) break;
        lines.push(r);
      }
      const title = lines.map(l => l.text).join(' ').replace(/(?<=\p{L})-\s(?=\p{Ll})/gu, '').replace(/\s+/g, ' ').trim();
      if (title.length < 3 || title.length > 200) continue;
      // The author: a "by" line, or a name-like line, just below the title (or just above it).
      let author = null;
      const at = rows.indexOf(lines.at(-1));
      const near = [...rows.slice(at + 1, at + 5), ...rows.slice(Math.max(0, i - 2), i).reverse()];
      for (const r of near) {
        const by = r.text.match(BY_LINE);
        if (by && nameLike(by[2])) { author = readable(by[2]); break }
        if (nameLike(r.text) && r.words <= 9 && r.size >= body.size * 0.95) { author = readable(r.text).replace(/,\s*$/, ''); break }
      }
      return { title, author };
    }
    // A page without a larger title can still carry a "by" line.
    for (const p of pages.slice(0, 2)) for (const r of p.rows.slice(0, 12)) { const by = r.text.match(BY_LINE); if (by && nameLike(by[2])) return { title: null, author: readable(by[2]) } }
    return { title: null, author: null };
  }

  /* ---------- Chapters ---------- */
  // A heading reads like a title: few words, mostly letters, starting with a capital or a
  // section number, not a sentence or formula running on, not a figure or table caption.
  // A chapter set as a Roman numeral alone ("I.", "XII.") counts; any other heading has at least
  // four letters ("FOR", "BY" on a title page are not chapters), or is a label ("Act", "Teil").
  const FIGURE_LABEL = /^(?:fig(?:ure|ur)?|table|tabel|tab)\.?\s*\d/i;
  const LABEL_HEADING = /^(?:part|book|act|scene|canto|chapter|chap|teil|buch|akt|kapitel|livre|partie|chapitre|acte|libro|parte|capítulo|capitolo)\b/i;
  function headingLike(r) {
    const t = r.text, letters = (t.match(/\p{L}/gu) || []).length;
    if (/^[IVXLC]{1,7}\.$/.test(t)) return true;
    return r.words <= 12 && (letters >= 4 || (letters >= 2 && LABEL_HEADING.test(t))) && letters >= t.replace(/\s/g, '').length * 0.6
      && /^([\p{Lu}]|[\dIVXivx]+(?:\.\d+)*[.)]?\s|[A-Z]\.?\d*\s|§)/u.test(t) && !/[,;:]$/.test(t)
      && !/[=∑∫≡⊗⊕→←≈≤≥±×√∂∇]/.test(t) && !FIGURE_LABEL.test(t) && !isPageNumber(t);
  }
  // pages: [{ n, y0, h, rows }]; fontName(pageNumber, fontId) -> Promise<string>.
  // Pages a scanning service adds (Google Books' notice) are not the book.
  const BOILERPLATE_PAGE = /google book search|books\.google\.com|digital copy of a book that was preserved for generations/i;
  const BOILERPLATE_HEADING = /^(usage guidelines|about google book search|digitized by( the)? (internet archive|google)|this is a digital copy)|\b(cents? fine|date due|this book is due|overdue|return(ed)? on or before)\b/i;
  // A printed contents page without dot leaders: many lines ending in a page number.
  const CONTENTS_LINE = /\p{L}[.,:;)'’]?\s+(?:\d{1,4}|[ivxlc]{1,6})$/u;
  // Scanned (OCR) text: one face, and body lines whose sizes wander from line to line.
  function noisySizes(rows, body) {
    const lines = rows.filter(r => r.words >= 6 && Math.abs(r.size - body.size) <= body.size * 0.15);
    return lines.length >= 20 && lines.filter(r => Math.abs(r.size - body.size) > body.size * 0.04).length > lines.length * 0.3;
  }
  async function headingEntries(pages, { fontName = async () => '', title = '', author = '', live = () => true } = {}) {
    const docBody = bodyOf(pages.flatMap(p => p.rows));
    if (!docBody) return null;
    const isFurniture = furniture(pages);
    const same = s => bare(s);
    // On a scan, a heading stands well above the body; a line set a little larger is noise.
    const noisy = noisySizes(pages.flatMap(p => p.rows), docBody), step = noisy ? 1.35 : 1.15;
    const out = [];
    let reading = false;
    for (const p of pages) {
      const local = bodyOf(p.rows), body = local && local.chars >= 300 ? local : docBody;
      if (p.rows.filter(r => CONTENTS_LINE.test(r.text)).length >= 5 || BOILERPLATE_PAGE.test(p.rows.map(r => r.text).join(' '))) continue;
      const skip = epigraphRows(p.rows);
      // Reports often print "Figure 1" above a large, bold chart title. That
      // title belongs to the figure, not to the document's chapter navigation.
      for (const [index, label] of p.rows.entries()) {
        if (!FIGURE_LABEL.test(label.text)) continue;
        skip.add(index);
        let previous = label;
        for (let lines = 0; lines < 3; lines++) {
          const nextIndex = p.rows.findIndex((r, i) => i > index && r.y < previous.y - .5
            && Math.abs(r.x - label.x) < Math.max(label.size, r.size) * 1.5);
          const next = p.rows[nextIndex];
          if (!next || previous.y - next.y > Math.max(previous.size, next.size) * 2.2
            || next.words > 14 || next.size < label.size || (lines > 0 && next.font !== previous.font)) break;
          skip.add(nextIndex); previous = next;
        }
      }
      const isBody = r => Math.abs(r.size - body.size) <= body.size * 0.1 && r.words >= 6;
      // On page 1, what sits above the first body paragraph is the title block (title, authors, epigraph).
      const para = p.rows.findIndex(r => r.font === body.font && Math.abs(r.size - body.size) < 0.6 && r.words >= 6);
      const first = p.n > 1 ? 0 : para < 0 ? Infinity : para;
      const found = [];
      const pending = [];
      for (const [i, r] of p.rows.entries()) {
        if (i < first) continue;
        const next = p.rows.slice(i + 1).find(n => n.y < r.y - 0.5 && n.x < r.x2 && n.x2 > r.x);
        const proseOpening = r.font === body.font && next && r.y - next.y < Math.max(r.size, next.size) * 1.8 && Math.abs(next.size - body.size) <= body.size * 0.1 && (/^\p{Ll}/u.test(next.text) || /-$/.test(r.text)) && !/[.!?:]$/.test(r.text);
        const prev = pending.findLast(h => Math.abs(h.x - r.x) < r.size * 0.5);
        // A continuation need not start with a capital. Test it against the
        // accepted heading's typography and column before the standalone-title filter.
        const continues = prev && !proseOpening && (prev.font === r.font || r.size >= Math.max(body.size, docBody.size) * 1.2) && Math.abs(prev.size - r.size) <= r.size * 0.05
          && prev.y - r.y > r.size * 0.5 && prev.y - r.y < r.size * 1.8
          && Math.abs(prev.x - r.x) < r.size * 0.5 && prev.words + r.words <= 16
          && !skip.has(i) && !isFurniture(p, r) && !BOILERPLATE_HEADING.test(r.text)
          && !FIGURE_LABEL.test(r.text) && !isPageNumber(r.text) && /\p{L}/u.test(r.text);
        if (continues) {
          prev.entry.label = (prev.entry.label + ' ' + r.text).replace(/(?<=\p{L})-\s(?=\p{Ll})/gu, '').replace(/(?<=\p{Lu})-\s(?=\p{Lu}+\b)/gu, m => /\p{Ll}/u.test(prev.entry.label + r.text) ? m : '');
          Object.assign(prev, { y: r.y, words: prev.words + r.words });
          continue;
        }
        // A row in another column cannot interrupt this heading. A row in
        // its own column that is not a continuation ends it.
        if (prev) pending.splice(pending.indexOf(prev), 1);
        if (skip.has(i) || !headingLike(r) || isFurniture(p, r) || BOILERPLATE_HEADING.test(r.text)) { continue }
        if (same(r.text) && (same(r.text) === same(title) || same(r.text) === same(author))) { continue }
        // A line in the body's face running on into the body below (the next line of the same
        // column starts in lower case, or this one ends in a hyphen) is a paragraph's first line.
        if (proseOpening) { continue }
        // A misread stamp on a scan ("25 CENTS FINE OF AK imTXAL"): letters out of case inside a word.
        if (noisy && /\p{Ll}\p{Lu}{2}/u.test(r.text)) { continue }
        // Larger than this page's body and the book's (a page of small-type notes does not make its body text a heading).
        const larger = r.size >= Math.max(body.size, docBody.size) * step;
        const sameSize = Math.abs(r.size - body.size) <= body.size * 0.08;
        if (!larger && !(sameSize && r.font && r.font !== body.font)) { continue }
        const face = r.font ? await fontName(p.n, r.font) : '';
        if (!live()) return null;
        // Italic or oblique lines are quotations, epigraphs or emphasis, unless set much larger.
        if (isItalic(face) && r.size < body.size * 1.35) { continue }
        if (!larger && !isBold(face)) { continue }
        const entry = { id: 'h' + (out.length + found.length), label: r.text, page: p.n, kind: 'chapter', parent: null };
        found.push(entry);
        pending.push({ entry, font: r.font, y: r.y, x: r.x, size: r.size, words: r.words });
      }
      // A title page (large lines and no running text: "A Study of Memory / for / … / by …") has no
      // chapters: before the text begins, two such lines or more; after, three or more.
      const text = p.rows.filter(isBody).length >= 3;
      if (!text && found.length >= (reading ? 3 : 2)) continue;
      reading ||= text;
      out.push(...found);
    }
    out.splice(0, out.length, ...out.filter(e => !BOILERPLATE_HEADING.test(e.label)));
    out.forEach((e, i) => { e.id = 'h' + i });
    return out.length >= 2 && out.length <= Math.max(12, pages.length * 4) ? out : null;
  }

  // The outline (bookmarks), to two levels below the top. Needs at least two entries with pages.
  async function outlineEntries(pdf) {
    const outline = await pdf.getOutline().catch(() => null);
    if (!outline?.length) return null;
    const out = [];
    const walk = async (items, depth, parent) => {
      for (const it of items) {
        let dest = it.dest;
        try {
          if (typeof dest === 'string') dest = await pdf.getDestination(dest);
          const page = Array.isArray(dest) && dest[0] ? (typeof dest[0] === 'number' ? dest[0] + 1 : (await pdf.getPageIndex(dest[0])) + 1) : null;
          const label = readable(it.title);
          if (!label) continue;
          const e = { id: 'o' + out.length, label, page, kind: it.items?.length ? 'part' : 'chapter', parent };
          out.push(e);
          if (it.items?.length && depth < 2) await walk(it.items, depth + 1, e.id);
        } catch { /* an entry without a destination is left out */ }
      }
    };
    // One bookmark holding all the others (the book's own title over its acts or chapters):
    // its children are the contents, not one entry to unfold.
    const lone = outline.length === 1 && outline[0].items?.length ? outline[0].items : null;
    await walk(lone || outline, 0, null);
    const entries = out.filter(e => e.page);
    return entries.length >= 2 ? entries : null;
  }

  const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const ROMAN = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  function roman(s) { let t = 0, prev = 0; for (const ch of s.toLowerCase().split('').reverse()) { const v = ROMAN[ch] || 0; t += v < prev ? -v : v; prev = Math.max(prev, v) } return t }
  // A printed Contents page ("Chapter title ....... 12"), with the shift from printed page
  // numbers to the PDF's pages found where the chapter titles are printed.
  async function contentsEntries(numPages, pageRows, pageText) {
    const limit = Math.min(30, numPages), raw = [], contentsPages = new Set();
    for (let n = 1; n <= limit; n++) {
      const lines = (await pageRows(n)).map(r => r.text);
      let hits = 0, carry = '';
      const found = [];
      for (const line of lines) {
        const m = line.match(/^(.*?)\s*(?:\.\s*){3,}\s*(\d{1,4}|[ivxlc]{1,6})$/i) || (carry && line.match(/^(.*?)\s+(\d{1,4})$/));
        if (!m) { if (/^\d{1,2}\s+\S/.test(line) && !/\d$/.test(line)) carry = line.replace(/-$/, ''); else carry = ''; continue }
        const label = (carry ? carry + (m[1] ? (carry.endsWith('-') ? '' : ' ') + m[1] : '') : m[1]).replace(/\s*\.\s*$/, '').replace(/\s+/g, ' ').trim();
        carry = '';
        if (!label) continue;
        hits++; found.push({ label, printed: m[2] });
      }
      if (hits >= 4) { contentsPages.add(n); raw.push(...found) }
      else if (raw.length && hits === 0) break;
    }
    if (raw.length < 3) return null;
    let part = null;
    const entries = raw.map((r, i) => {
      const ch = r.label.match(/^(\d{1,3})\s+(.+)$/), pt = r.label.match(/^([IVX]{1,5})\s+(.+)$/);
      const e = { id: 'c' + i, printed: r.printed, arabic: /^\d+$/.test(r.printed) };
      if (pt) { Object.assign(e, { kind: 'part', label: `${pt[1]} · ${pt[2]}`, title: pt[2], parent: null }); part = e }
      else if (ch) Object.assign(e, { kind: 'chapter', label: `${ch[1]} · ${ch[2]}`, title: ch[2], number: Number(ch[1]), parent: part?.id || null });
      else Object.assign(e, { kind: 'front', label: r.label, title: r.label, parent: part && r.arabic ? part.id : null });
      return e;
    });
    const hasTitle = async (n, title) => n >= 1 && n <= numPages && !contentsPages.has(n) && norm(await pageText(n)).includes(norm(title).slice(0, 28));
    const offsetFor = async (list, range) => {
      let best = null;
      for (let off = range[0]; off <= range[1]; off++) {
        let score = 0;
        for (const e of list) if (await hasTitle(e.base + off, e.title)) score++;
        if (!best || score > best.score) best = { off, score };
        if (score === list.length) break;
      }
      return best && best.score > 0 ? best.off : null;
    };
    const arabic = entries.filter(e => e.arabic && e.kind !== 'part').slice(0, 5).map(e => ({ ...e, base: Number(e.printed) }));
    const romanList = entries.filter(e => !e.arabic).slice(0, 3).map(e => ({ ...e, base: roman(e.printed) }));
    const offA = arabic.length ? await offsetFor(arabic, [-5, 80]) : null;
    const offR = romanList.length ? await offsetFor(romanList, [-5, 40]) : null;
    for (const e of entries) e.page = e.arabic ? (offA == null ? null : Number(e.printed) + offA) : (offR == null ? null : roman(e.printed) + offR);
    const out = entries.filter(e => e.page && e.page <= numPages).map(({ printed, arabic: _a, title: _t, number: _n, ...e }) => e);
    return out.length >= 2 ? out : null;
  }

  /* ---------- Language ---------- */
  // The document's language ("en", "fr", "de", …): its declared language (the catalogue's /Lang),
  // else the language whose common words its text uses most. Read aloud picks a voice by it and
  // chapter titles are styled by it. '' when the text is too short to tell.
  const COMMON_WORDS = {
    en: 'the and of to in that is was he it with for as his on be at by had not but which',
    fr: 'le la les et des du un une est que qui dans il ne pas pour au sur se plus elle',
    de: 'der die und das nicht ist ich sie zu den mit sich des auf ein eine er es dem war',
    es: 'el la los las y que de en un una por con no se del su para es al lo',
    it: 'il di che la e per un una non in del si della con le gli sono è al',
    nl: 'de het een en van dat niet is ik je op te zijn met voor er maar hij',
    pt: 'o a os as que de do da em um uma não para com se por mais ao',
    da: 'og at det er en til i den på som med han af for ikke var de',
    sv: 'och att det är en som på av för med inte till han den var de jag',
  };
  const COMMON = Object.fromEntries(Object.entries(COMMON_WORDS).map(([k, v]) => [k, new Set(v.split(' '))]));
  function languageOf(text, declared) {
    const tag = String(declared || '').trim().toLowerCase().split(/[-_]/)[0];
    if (/^[a-z]{2,3}$/.test(tag)) return tag;
    const words = String(text || '').toLowerCase().match(/\p{L}+/gu) || [];
    if (words.length < 40) return '';
    const score = Object.fromEntries(Object.keys(COMMON).map(k => [k, 0]));
    for (const w of words) for (const k in COMMON) if (COMMON[k].has(w)) score[k]++;
    const [best, n] = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return n >= words.length * 0.08 ? best : '';
  }

  /* ---------- Layout: which edition a PDF opens in ---------- */
  // A PDF whose pages carry what reflowed text loses (columns, mathematics, figures, tables:
  // a paper, a textbook, slides) opens as its pages; running prose opens as Tinct text. Scored
  // on at most 40 pages with text, spread through the document:
  //   columns +3   at least 30% of the pages in two columns (8+ lines each side, their starts
  //                more than 0.35 of the page apart, lines narrower than 0.48 of it);
  //   math +2      1.5% of the characters mathematical (U+2200–22FF, U+1D400–1D7FF, or set
  //                in a mathematics font), or 0.4 display equations a page;
  //   figures +1.5 at least 25% of the pages with pictures over 20% of the page (a page-size
  //                scan aside), or drawn with more than 300 paths;
  //   tables +1.5  at least 15% of the pages with 4 lines in a row of 3 or more wide gaps;
  //   paper +1     "Abstract" on the first 2 pages, "References" or "Bibliography" on the last
  //                3, or an arXiv or DOI identifier;
  //   short +0.5   40 pages or fewer;
  //   prose −2     80% of the characters in the body's face and size, over 1200 a page.
  // 3.5 or more: 'pages'; else 'text'; no text layer: 'pages-only'. Deterministic.
  const LAYOUT_SAMPLE = 40;
  const MATH_FONT = /CMMI|CMSY|CMEX|MSBM|MSAM|STIX.*Math|Cambria ?Math|Symbol|Asana|XITS ?Math|Latin ?Modern ?Math/i;
  const MATH_CHAR = /[∀-⋿]|[\u{1d400}-\u{1d7ff}]/u;
  const SIGNAL_POINTS = { columns: 3, math: 2, figures: 1.5, tables: 1.5, paper: 1, short: 0.5, prose: -2 };
  // Two columns on a page (see js/pdf-text.js columnsOf, the same test).
  function twoColumns(rows, x0, w) {
    const mid = x0 + w / 2, slack = w * 0.02, med = l => { const s = [...l].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] ?? 0 };
    const left = rows.filter(r => r.x2 <= mid + slack && r.words >= 3), right = rows.filter(r => r.x >= mid - slack && r.x2 > mid + slack && r.words >= 3);
    return left.length >= 8 && right.length >= 8 && med(right.map(r => r.x)) - med(left.map(r => r.x)) > 0.35 * w && med([...left, ...right].map(r => r.x2 - r.x)) < 0.48 * w;
  }
  // Lines of a table: 4 in a row with 3 or more gaps wider than 2 em between their pieces.
  function hasTable(items) {
    const lines = [];
    for (const it of items || []) {
      if (!it?.transform || typeof it.str !== 'string' || !it.str.trim()) continue;
      const [a, , , d, x, y] = it.transform, size = Math.abs(d) || Math.abs(a) || 10;
      let line = lines.find(l => Math.abs(l.y - y) < Math.max(2, size * 0.3));
      if (!line) { line = { y, parts: [] }; lines.push(line) }
      line.parts.push({ x, x2: x + (it.width || 0), size });
    }
    // In a row: each within 3 lines of the one above (a column of text beside it aside).
    let run = 0, above = null;
    for (const l of lines.sort((p, q) => q.y - p.y)) {
      const parts = l.parts.sort((p, q) => p.x - q.x);
      let gaps = 0;
      for (let i = 1; i < parts.length; i++) if (parts[i].x - parts[i - 1].x2 > 2 * Math.max(parts[i].size, parts[i - 1].size)) gaps++;
      if (gaps < 3) continue;
      run = above && above.y - l.y < 3 * parts[0].size ? run + 1 : 1;
      above = l;
      if (run >= 4) return true;
    }
    return false;
  }
  // Pictures and drawings on a page, from its operators: the share of the page under pictures
  // (one covering 85% or more is a scanned page, not a figure) and how many paths it draws.
  async function pagePictures(page, OPS) {
    const ops = await page.getOperatorList();
    const [x0, y0, x1, y1] = page.view, area = Math.abs((x1 - x0) * (y1 - y0)) || 1;
    let ctm = [1, 0, 0, 1, 0, 0], covered = 0, full = false, paths = 0;
    const stack = [];
    const times = (m, n) => [m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3], m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3], m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5]];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i], args = ops.argsArray[i];
      if (fn === OPS.save) stack.push(ctm);
      else if (fn === OPS.restore) ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
      else if (fn === OPS.transform && args?.length >= 6) ctm = times(args, ctm);
      else if (fn === OPS.constructPath) paths++;
      else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject || fn === OPS.paintImageMaskXObject || fn === OPS.paintImageXObjectRepeat) {
        const share = Math.abs(ctm[0] * ctm[3] - ctm[1] * ctm[2]) / area;
        if (share >= 0.85) full = true; else covered += share;
      }
    }
    return { figure: (!full && covered > 0.2) || paths > 300 };
  }
  // pages: the scan's pages ({ n, page, x0, w, rows }); itemsOf(n): a page's text items;
  // fontName(n, id): a font's name. Returns { default, score, signals }.
  async function layout(pdf, pages, { itemsOf, fontName, isFurniture, textPages, live = () => true }) {
    if (!textPages) return { default: 'pages-only', score: 0, signals: {} };
    const withText = pages.filter(p => (p.rows.map(r => r.text).join('').match(/\p{L}/gu) || []).length >= 50);
    const sample = withText.length <= LAYOUT_SAMPLE ? withText : Array.from({ length: LAYOUT_SAMPLE }, (_, i) => withText[Math.floor((i * withText.length) / LAYOUT_SAMPLE)]);
    const OPS = global.pdfjsLib?.OPS;
    let columns = 0, figures = 0, tables = 0, equations = 0, chars = 0, math = 0, bodyChars = 0;
    const mathFonts = new Map();
    for (const p of sample) {
      const rows = p.rows.filter(r => !isFurniture(p, r));
      if (twoColumns(rows, p.x0, p.w)) columns++;
      if (hasTable(await itemsOf(p.n))) tables++;
      if (OPS && (await pagePictures(p.page, OPS).catch(() => ({ figure: false }))).figure) figures++;
      if (!live()) return null;
      const body = bodyOf(rows);
      for (const r of rows) {
        const n = r.text.replace(/\s/g, '').length;
        chars += n;
        if (body && Math.abs(r.size - body.size) < 0.6 && r.font === body.font) bodyChars += n;
        let inMathFont = false;
        if (r.font) {
          if (!mathFonts.has(r.font)) mathFonts.set(r.font, MATH_FONT.test(await fontName(p.n, r.font)));
          inMathFont = mathFonts.get(r.font);
        }
        const symbols = [...r.text].filter(ch => MATH_CHAR.test(ch)).length;
        math += inMathFont ? n : symbols;
        // A display equation: a short line of symbols more than words.
        const letters = (r.text.match(/\p{L}/gu) || []).length;
        if ((inMathFont || symbols > 0 || /=/.test(r.text)) && r.words <= 12 && letters < n * 0.65 && r.x2 - r.x < p.w * 0.45) equations++;
      }
    }
    const count = Math.max(1, sample.length);
    const first = pages.filter(p => p.n <= 2), last = pages.filter(p => p.n > pdf.numPages - 3);
    const textOf = list => list.flatMap(p => p.rows.map(r => r.text)).join('\n');
    const signals = {
      columns: columns / count >= 0.3,
      math: (chars > 0 && math / chars >= 0.015) || equations / count >= 0.4,
      figures: figures / count >= 0.25,
      tables: tables / count >= 0.15,
      paper: first.some(p => p.rows.some(r => /^(?:\d+\.?\s*)?abstract\b/i.test(r.text))) || last.some(p => p.rows.some(r => /^(?:\d+\.?\s*)?(?:references|bibliography)\.?$/i.test(r.text))) || /\barxiv:\s*\d|\bdoi:\s*10\.\d/i.test(textOf([...first, ...last])),
      short: pdf.numPages <= 40,
      prose: chars > 0 && bodyChars / chars >= 0.8 && chars / count > 1200,
    };
    const score = Math.round(Object.entries(signals).reduce((s, [k, on]) => s + (on ? SIGNAL_POINTS[k] : 0), 0) * 10) / 10;
    return { default: score >= 3.5 ? 'pages' : 'text', score, signals };
  }

  /* ---------- The scan ---------- */
  // An entry whose label has no letter or digit ("." or ";", a stray mark read as a contents line) is
  // no chapter: left out, its own entries moved up a level. The reader also applies it to stored scans.
  function usableEntries(list) {
    if (!Array.isArray(list)) return [];
    const gone = new Map(list.filter(e => !/[\p{L}\p{N}]/u.test(String(e?.label ?? ''))).map(e => [e.id, e.parent ?? null]));
    if (!gone.size) return list;
    const up = id => { let at = id; while (at != null && gone.has(at)) at = gone.get(at); return at ?? null };
    return list.filter(e => !gone.has(e.id)).map(e => (e.parent != null && gone.has(e.parent) ? { ...e, parent: up(e.parent) } : e));
  }
  // The language sample: the scanned pages' text in order, up to about 20,000 characters.
  function sampleOf(pages) {
    let sample = '';
    for (const p of pages) { sample += ' ' + p.rows.map(r => r.text).join(' '); if (sample.length > 20000) break }
    return sample;
  }
  // pdf: a pdf.js document. options.fileName names the file; options.items(n) may supply a
  // page's text items (the reader's cache); options.live() turns false to stop early;
  // options.onTitle({ title, author }) hears the title before the chapters are found;
  // options.onEntries({ nav, entries, language, text }) hears chapters from the outline or a printed
  // contents as soon as they are found, before the other pages are read (a 640-page book's took 13 s;
  // round 1, 15 Oct): the same entries and language the result carries; `text` is true when the
  // pages read so far already show the file has text, else null (not known yet).
  async function scan(pdf, { fileName = '', items, live = () => true, onTitle, onEntries, maxPages = HEADING_PAGES } = {}) {
    const textCache = new Map();
    const itemsOf = async n => {
      if (items) return items(n);
      if (!textCache.has(n)) textCache.set(n, (await (await pdf.getPage(n)).getTextContent()).items);
      return textCache.get(n);
    };
    const pageCache = new Map();
    const pageOf = async n => {
      if (!pageCache.has(n)) {
        const page = await pdf.getPage(n), [x0, y0, x1, y1] = page.view;
        pageCache.set(n, { n, page, x0, w: x1 - x0, y0, h: y1 - y0, rows: textRows(await itemsOf(n)) });
      }
      return pageCache.get(n);
    };
    const fonts = new Map();
    const fontName = async (n, id) => {
      if (fonts.has(id)) return fonts.get(id);
      let name = '';
      try { const { page } = await pageOf(n); if (!page.commonObjs.has(id)) await page.getOperatorList(); name = page.commonObjs.has(id) ? page.commonObjs.get(id)?.name || '' : '' } catch {}
      fonts.set(id, name);
      return name;
    };
    let info = {};
    try { info = (await pdf.getMetadata())?.info || {} } catch {}
    // Title and author first, from the first pages (shown while the chapters are found).
    const first = [];
    for (let n = 1; n <= Math.min(3, pdf.numPages); n++) first.push(await pageOf(n));
    if (!live()) return null;
    const printed = printedTitle(first, furniture(first));
    const fromMeta = sameTitleLonger(metaTitle(info.Title, fileName), printed.title);
    const title = fromMeta || printed.title || cleanFileName(fileName);
    const author = metaAuthor(info.Author) || printed.author || '';
    onTitle?.({ title, author });
    const total = Math.min(maxPages, pdf.numPages);
    const all = [...first];
    // The pages the language sample needs first (it depends on these alone), then the outline or printed contents.
    while (all.length < total && sampleOf(all).length <= 20000) { all.push(await pageOf(all.length + 1)); if (!live()) return null }
    const sample = sampleOf(all), language = languageOf(sample, info.Language);
    const runningText = p => { const t = p.rows.map(r => r.text).join(' '); return (t.match(/\p{L}/gu) || []).length >= 50 && !BOILERPLATE_PAGE.test(t) };
    // A text layer that is mostly not words (a broken font's codes, an OCR layer of noise) is no text.
    const tokens = sample.split(/\s+/).filter(Boolean);
    const noise = tokens.length >= 40 && tokens.filter(t => !/\p{L}/u.test(t)).length > tokens.length * 0.3;
    const text = async n => (await itemsOf(n)).map(i => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ');
    let entries = null, nav = 'pages';
    if ((entries = await outlineEntries(pdf))) nav = 'outline';
    else if ((entries = await contentsEntries(pdf.numPages, async n => (await pageOf(n)).rows, text))) nav = 'contents';
    if (!live()) return null;
    if (entries) entries = usableEntries(entries);
    if (entries && onEntries) { try { onEntries({ nav, entries, language, text: !noise && all.some(runningText) ? true : null }) } catch { /* the listener's own failure never stops the scan */ } }
    for (let n = all.length + 1; n <= total; n++) { all.push(await pageOf(n)); if (!live()) return null }
    if (!entries && (entries = await headingEntries(all, { fontName, title, author, live }))) { nav = 'headings'; entries = usableEntries(entries) }
    if (!live()) return null;
    // Pages with running text (a scanner's notice page aside): none means a scan without a text layer.
    let textPages = all.filter(runningText).length;
    if (noise) textPages = 0;
    const kind = await layout(pdf, all, { itemsOf, fontName, isFurniture: furniture(all), textPages, live });
    if (!live() || !kind) return null;
    return {
      v: SCAN_VERSION, title, author, pages: pdf.numPages, nav, entries: entries || [], language, textPages, layout: kind,
      source: { title: fromMeta ? 'metadata' : printed.title ? 'printed' : 'file', author: metaAuthor(info.Author) ? 'metadata' : printed.author ? 'printed' : 'none' },
    };
  }
  // A stored scan is used when it is of this version.
  const current = s => !!s && s.v === SCAN_VERSION && Array.isArray(s.entries) && typeof s.title === 'string';

  global.TinctPdfScan = { SCAN_VERSION, scan, current, usableEntries, layout, twoColumns, hasTable, textRows, bodyOf, epigraphRows, furniture, headingLike, headingEntries, outlineEntries, languageOf, contentsEntries, printedTitle, sameTitleLonger, metaTitle, metaAuthor, cleanFileName, nameLike, isItalic, isBold, isPageNumber };
})(typeof window !== 'undefined' ? window : globalThis);
