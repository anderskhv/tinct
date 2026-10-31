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
//   Version 11 (2026-10-30): scanned books (30 Oct 2026 corpus): word-box OCR lines, catalogue authors, title pages
//     past the third, running heads and signatures at a scan's text edges, chapter labels, contents read leniently
//     and continued, garbled headings named from the printed contents. Headings are read on the first 1000 pages
//     (400 before: Pride and Prejudice's 512 pages lost chapters L to LXI), a chapter's title wrapped over centred
//     lines or under its label is one heading on a scan, numbered contents fill their gaps from the text.
// Used by js/reader.js (window.TinctPdfScan); the tests import this file directly.
(function (global) {
  const SCAN_VERSION = 11;
  const HEADING_PAGES = 1000;

  /* ---------- Text rows ---------- */
  // Positioned text items -> visual lines, top first: { y, x, x2, size, fonts, font, chars, text, words }.
  // Rotated text is left out.
  // An OCR layer that sets each word in its own box (Internet Archive's LuraDocument scans): a word's y is
  // its box's bottom and its size the box's height, so the words of one printed line sit up to ~0.4 em
  // apart and differ in size. Most of a page's lines then hold about as many sizes as words, and an item
  // is one word. Items without a letter or digit (a superscript "®", a bullet) are not words and do not count.
  // No born-digital page in the regression set passes this test (30 Oct 2026 corpus).
  function wordBoxLayer(items) {
    const lines = [], perItem = [];
    let line = [], px = -Infinity;
    const close = () => { if (line.length >= 5) lines.push(line); line = [] };
    for (const it of items || []) {
      if (!it || !it.transform || typeof it.str !== 'string') continue;
      if (/[\p{L}\p{N}]/u.test(it.str)) { if (it.transform[4] < px) close(); line.push(it); px = it.transform[4]; perItem.push(it.str.trim().split(/\s+/).length) }
      if (it.hasEOL) { close(); px = -Infinity }
    }
    close();
    if (lines.length < 3) return false;
    const sizeOf = it => Math.round((Math.hypot(it.transform[2], it.transform[3]) || it.height || 0) * 10) / 10;
    const varied = lines.filter(l => new Set(l.map(sizeOf)).size >= l.length * 0.5).length;
    perItem.sort((p, q) => p - q);
    return varied >= lines.length * 0.6 && perItem[Math.floor(perItem.length / 2)] <= 1;
  }
  function textRows(items) {
    const rows = [];
    // On a word-box OCR page a word joins the line of the word before it when it follows it in the text
    // stream, with no line end (hasEOL) between, to its right and roughly level: grouping by y alone split
    // each printed line into fragments and interleaved them ("very late in the morn-" | "usually" | "save").
    const wordBoxes = wordBoxLayer(items);
    let last = null, eol = true;
    for (const it of items || []) {
      if (!it || typeof it.str !== 'string' || !it.transform) continue;
      const [a, b, c, d, x, y] = it.transform;
      if (!it.str.trim()) { if (it.hasEOL) eol = true; continue }
      if (Math.abs(b) > 0.01 * Math.abs(a) || Math.abs(c) > 0.01 * Math.abs(d)) { eol = true; continue }
      const size = Math.hypot(c, d) || it.height || 0;
      let row = null, tall = false;
      if (wordBoxes && last && !eol) {
        const em = Math.max(size, last.size);
        if (x >= last.end - em * 0.5 && x - last.end < em * 3 && Math.abs(y - last.y) < Math.max(2, em * 0.6)) row = last.row;
        // A chapter's first word set with a drop cap ("SIR" | "HENRY was more pleased") has a box reaching down to the next
        // line, so its y is well below the words after it: the word that opens a line (after a line end) and the word next
        // to it in the stream are one line all the same, else the first lands on the line below ("surprised SIR to see";
        // The Hound of the Baskervilles, 30 Oct 2026 corpus). The line sits where the second word does.
        else if (last.lineStart && x >= last.end - em * 0.5 && x - last.end < em * 3 && Math.abs(y - last.y) < em * 1.2) { row = last.row; tall = true }
      }
      // A superscript sign ("Intel®", "™", "†") follows its word in the stream, smaller and raised less than
      // an em: it belongs to that word's line, not a row of its own between lines (Intel SDM, 30 Oct 2026).
      // A note number or an exponent ("itself¹", "10⁻⁹") is left out of the line as before.
      const raised = !row && last && !eol && /^[®™©℠†‡*∗§°]+$/u.test(it.str.trim()) && size <= last.size * 0.85 && y > last.y && y - last.y < last.size * 0.6
        && x >= last.end - 1 && x - last.end < last.size;
      if (raised) row = last.row;
      row ||= rows.find(r => Math.abs(r.y - y) < Math.max(2, size * 0.3));
      if (!row) { row = { y, parts: [] }; rows.push(row) }
      if (tall) row.y = y; // The line sits where its ordinary words do, not where the drop cap's box ends.
      row.parts.push({ x, y, w: it.width || 0, s: it.str, size, font: it.fontName });
      last = raised ? { ...last, end: x + (it.width || 0) } : { row, end: x + (it.width || 0), y, size, lineStart: eol };
      eol = !!it.hasEOL;
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
      let size = [...by].sort((p, q) => q[1] - p[1])[0][0];
      // Word-box OCR: each word's size is its box's height, so the line's size is the median by characters.
      if (wordBoxes && by.size >= 3) {
        const list = [...by].sort((p, q) => p[0] - q[0]), half = list.reduce((n, entry) => n + entry[1], 0) / 2;
        let seen = 0;
        for (const [k, n] of list) { seen += n; if (seen >= half) { size = k; break } }
      }
      let text = '';
      parts.forEach((p, i) => { const prev = parts[i - 1]; if (prev && p.x - (prev.x + prev.w) > size * 0.12 && !/\s$/.test(text) && !/^\s/.test(p.s)) text += ' '; text += p.s });
      text = text.replace(/\s+/g, ' ').replace(/\s+([,.:;!?)])/g, '$1').trim();
      const fonts = new Set(parts.filter(p => p.s.trim()).map(p => p.font));
      return { y: r.y, x: parts[0].x, x2: parts.at(-1).x + parts.at(-1).w, size, fonts, font: fonts.size === 1 ? [...fonts][0] : null, chars: text.length, text, words: text.split(' ').length, ...(wordBoxes ? { ocr: true } : {}) };
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
  // Letter-pair (Dice) likeness of two strings' letters, 0..1: a running head misread a little
  // differently on each page of a scan still looks like itself.
  const bigrams = s => { const t = s.toLowerCase().replace(/[^\p{L}]+/gu, ''), out = new Map(); for (let i = 0; i < t.length - 1; i++) out.set(t.slice(i, i + 2), (out.get(t.slice(i, i + 2)) || 0) + 1); return out };
  function likeness(a, b) {
    const A = bigrams(a), B = bigrams(b);
    let n = 0, total = 0;
    for (const v of A.values()) total += v;
    for (const v of B.values()) total += v;
    for (const [k, v] of A) n += Math.min(v, B.get(k) || 0);
    return total ? 2 * n / total : 0;
  }
  // "CHAPTER IV.", "BOOK II": a chapter's label line, which repeats (numbers aside) on every chapter's first page.
  const LABEL_LINE = /^(?:(?:chapter|chap\.?|book|part|act|stave|canto)[\s.:,]+[IVXLCJl\d]{1,7}[.:,]?|(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last)\s+(?:act|part|book))$/i;
  const labelLine = r => r.words <= 3 && LABEL_LINE.test(r.text.trim());
  // A scan's label whose numeral OCR garbled ("CHAPTER: |", "CHAPTER 0X!", "CHAPTER’ XIII"; In the Land of the Blue Gown, 30 Oct 2026 corpus).
  const OCR_LABEL = /^(?:chapter|chap\.?)(?!\p{L})\W{0,2}\s*\S{1,6}$/iu;
  // The word "Chapter" as OCR reads hand lettering ("CKb^pter", "Chsvpter", "CNjivpter V.", "CK5vpterXIV."; Oz).
  const CHAPTERISH = /^C[\w^&'.]{1,4}pter/i;
  // Rows that repeat across pages: near the top or bottom on several pages (numbers aside), or
  // the very same line on several pages at the same height on the page and not only once a page
  // (a chapter's title under a running head that repeats it, a play's speaker names, stay). On a
  // scan also a running head misread differently on each page ("A SIIKOI'SII I UK LAD"): short,
  // at the top, and like the book's title or a head seen on many pages; and a printer's signature
  // at the foot ("49 E"). A chapter's label line is furniture only as a running head: on pages
  // close together, not once a chapter (Sartor Resartus's "CHAPTER I." in each Book; 30 Oct 2026 corpus).
  function furniture(pages, bookTitle = '') {
    const need = pages.length <= 3 ? 2 : 3;
    // A scan's page box takes in wide margins (Sartor Resartus's "30 SARTOR RESARTUS." at 82% of the page; North of
    // Boston's "17 B" at 37%): there the first and last two lines of a page's text are at its edges too, when they
    // stand within two lines of where the book's pages usually start and end (a chapter's first page starts lower).
    const ends = new Map();
    for (const p of pages) {
      const ys = (p.rows || []).filter(q => /\p{L}\p{L}|\d/u.test(q.text)).map(q => q.y - p.y0).sort((x, y) => y - x);
      if (ys.length >= 4) ends.set(p, { top: ys.slice(0, 2), foot: ys.slice(-2), h: p.h, ocr: p.rows.some(r => r.ocr) });
    }
    const median = list => list.sort((x, y) => x - y)[Math.floor(list.length / 2)];
    // On a scan (word-box OCR, or text set well inside the page's box on most pages: a scanner's margins).
    const inset = [...ends.values()].filter(e => e.top[0] < e.h * 0.86 && e.foot[1] > e.h * 0.14).length;
    for (const [p, e] of ends) if (!e.ocr && inset < ends.size * 0.7) ends.delete(p);
    const usual = ends.size >= 5 ? { top: median([...ends.values()].map(e => e.top[0])), foot: median([...ends.values()].map(e => e.foot[1])) } : null;
    const scanEdge = (p, r) => {
      const e = usual && ends.get(p);
      if (!e) return false;
      const y = r.y - p.y0, near = Math.max(2, r.size) * 2.5;
      return e.top.includes(y) && Math.abs(y - usual.top) <= near ? 'top' : e.foot.includes(y) && Math.abs(y - usual.foot) <= near ? 'foot' : false;
    };
    const atEdge = (p, r) => r.y - p.y0 > p.h * 0.9 || r.y - p.y0 < p.h * 0.1 || !!scanEdge(p, r);
    const seen = new Map(), exact = new Map(), inner = new Map(), at = new Map(), where = new Map();
    const slot = (p, r) => r.text + '|' + Math.round((r.y - p.y0) / p.h * 50);
    for (const p of pages) {
      for (const k of new Set(p.rows.filter(r => atEdge(p, r)).map(edgeKey))) if (k) seen.set(k, (seen.get(k) || 0) + 1);
      // As printed: a running head in capitals ("DAVID DEUTSCH") is not the byline it repeats ("David Deutsch").
      for (const k of new Set(p.rows.map(r => r.text))) { exact.set(k, (exact.get(k) || 0) + 1); (where.get(k) || where.set(k, []).get(k)).push(p.n) }
      for (const k of new Set(p.rows.filter(r => !atEdge(p, r)).map(r => r.text))) inner.set(k, (inner.get(k) || 0) + 1);
      for (const k of new Set(p.rows.map(r => slot(p, r)))) at.set(k, (at.get(k) || 0) + 1);
    }
    // The heads a misread one is likened to: the lines pages open with, seen on three pages or more (a chapter's own head
    // stands on its odd pages alone, eight of 288 in The Souls of Black Folk), the commonest first. Not any line at an edge:
    // "said Elizabeth" ends enough pages of Pride and Prejudice to pass for a head and take the lines like it with it. Three
    // pages on a scan; born-digital books keep the old one in twenty (a table's caption continued over three pages opens them).
    const topRow = p => (p.rows || []).find(q => /\p{L}{2}/u.test(q.text));
    const tops = new Map();
    for (const p of pages) { const q = topRow(p), k = q && edgeKey(q); if (k) tops.set(k, (tops.get(k) || 0) + 1) }
    const often = pages.some(p => p.rows.some(r => r.ocr)) ? need : Math.max(need, pages.length * 0.05);
    const heads = [...tops].filter(([, n]) => n >= often).sort((p, q) => q[1] - p[1]).map(([k]) => k).slice(0, 80);
    const shortTitle = String(bookTitle || '').split(/[:;(]/)[0];
    // A scan's running head misread differently on every page ("OF ALEXAOT)ER CRUMMBLL 223"; The Souls of Black Folk) is still
    // like the top line of the pages one or two before or after, at the same height.
    const index = new Map(pages.map((p, i) => [p, i]));
    const likeNeighbour = (p, r) => { const i = index.get(p); return [-2, -1, 1, 2].some(d => { const q = pages[i + d] && topRow(pages[i + d]); return q && Math.abs((q.y - pages[i + d].y0) - (r.y - p.y0)) < Math.max(r.size, 8) * 1.5 && edgeKey(q).length >= 6 && likeness(edgeKey(r), edgeKey(q)) >= 0.65 }) };
    const fuzzyHead = (p, r) => (r.y - p.y0 > p.h * 0.9 || scanEdge(p, r) === 'top') && r.words <= 10 && edgeKey(r).length >= 6
      && ((shortTitle.replace(/[^\p{L}]+/gu, '').length >= 6 && likeness(edgeKey(r), shortTitle) >= 0.7) || heads.some(k => likeness(edgeKey(r), k) >= 0.75) || (r.ocr && topRow(p) === r && likeNeighbour(p, r)));
    // A scrap of OCR noise on a scan's edge ("o", '"'), never a chapter's numeral above its title ("I", "IV").
    const stray = (p, r) => r.ocr && r.text.replace(/\s/g, '').length <= 2 && !/^[IVXL]+\.?$/.test(r.text.trim()) && (atEdge(p, r) || r.y - p.y0 > p.h * 0.85);
    // A page number OCR split in two ("8 1", "1 97"), or beside a printer's signature ("10 145"), alone on a scan's top or foot line.
    const splitNumber = (p, r) => r.ocr && /^\d{1,3} \d{1,4}$/.test(r.text.trim()) && r.text.replace(/\D/g, '').length <= 6 && atEdge(p, r);
    const signature = (p, r) => (r.y - p.y0 < p.h * 0.12 || scanEdge(p, r) === 'foot') && /^\d{1,4}\s+[A-Z]{1,2}\d?$/.test(r.text.trim());
    // A scan's page number as OCR misreads it ("i6i M", "I 12", "79 /", "> 16", "337 z"): a short row of a number and
    // scraps of a letter or two. At the page's top or foot it is the page number; anywhere else on the page ("129 i" a third
    // of the way down North of Boston's) only when it is the number the pages around print (30 Oct 2026 corpus).
    const folioOf = text => {
      const t = text.trim();
      // Not an index's line run on from the column before ("378.,."): a page number has no stop after it.
      if (t.length > 12 || !/\d/.test(t) || /\d[.,;]/.test(t)) return null;
      const tokens = t.split(/\s+/).map(w => w.replace(/^[^\p{L}\d|]+|[^\p{L}\d|]+$/gu, '')).filter(Boolean);
      if (!tokens.length || tokens.length > 3) return null;
      let n = null;
      for (const w of tokens) {
        if (/^[\dilIoO|]{1,4}$/.test(w) && /\d/.test(w)) { if (n !== null) return null; n = Number(w.replace(/[ilI|]/g, '1').replace(/[oO]/g, '0')) }
        else if (!/^\p{L}{1,2}$/u.test(w)) return null;
      }
      return n;
    };
    const printed = new Map();
    for (const p of pages) for (const r of p.rows) {
      if (!atEdge(p, r)) continue;
      const m = r.text.trim().match(/^(\d{1,4})\b|\b(\d{1,4})$/);
      if (m && (isPageNumber(r.text) || (seen.get(edgeKey(r)) || 0) >= need)) printed.set(p.n, p.n - Number(m[1] || m[2]));
    }
    const offsets = [...printed].sort((a, b) => a[0] - b[0]);
    const expected = n => { const near = offsets.filter(([m]) => Math.abs(m - n) <= 12).map(([, o]) => o); return near.length >= 2 ? new Set(near.map(o => n - o)) : null };
    const folio = (p, r) => {
      if (!r.ocr || isPageNumber(r.text)) return false;
      const n = folioOf(r.text);
      if (n === null) return false;
      return atEdge(p, r) || !!expected(p.n)?.has(n);
    };
    const sameHeight = (p, r) => { const [t, y] = [r.text, Math.round((r.y - p.y0) / p.h * 50)]; return [-1, 0, 1].reduce((n, d) => n + (at.get(t + '|' + (y + d)) || 0), 0) };
    const close = r => { const ns = where.get(r.text) || []; return ns.some((n, i) => i && n - ns[i - 1] <= 2) };
    const repeated = (p, r) => (exact.get(r.text) || 0) >= need && (atEdge(p, r) || (inner.get(r.text) || 0) >= need) && sameHeight(p, r) >= need;
    return (p, r) => labelLine(r) ? (repeated(p, r) || (atEdge(p, r) && (seen.get(edgeKey(r)) || 0) >= need)) && close(r)
      : isPageNumber(r.text) || splitNumber(p, r) || stray(p, r) || signature(p, r) || folio(p, r) || (atEdge(p, r) && ((seen.get(edgeKey(r)) || 0) >= need || fuzzyHead(p, r))) || repeated(p, r);
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
      // A chapter's synopsis ("—I pack.—Cussedness of tooth brushes.—") runs dash after sentence; no attribution does.
      const synopsis = t => /[.!?]\s*[—–]\s*\S/u.test(t);
      if (!ATTRIBUTION.test(r.text) || r.words > 14 || synopsis(r.text) || (i > 0 && synopsis(rows[i - 1].text))) return;
      out.add(i);
      // The quotation above: lines close together, up to eight of them, never a chapter's label ("CHAPTER IV.").
      for (let j = i - 1, below = r; j >= 0 && i - j <= 8; j--) {
        const up = rows[j];
        if (up.y - below.y > Math.max(up.size, below.size) * 2.4 || labelLine(up)) break;
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
  const ARXIV_STAMP = /^arXiv:\s*[\w.\/-]+v?\d*\b/i;
  // A web address set large on a cover ("VISITA WWW.RASPBERRYITALY.COM") is a banner, not the title.
  const WEB_LINE = /(?:^|\s)(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|org|net|io|co\.uk)\b/i;
  function metaTitle(raw, name) {
    let t = readable(raw).replace(/^microsoft (?:word|powerpoint) - /i, '');
    if (t.length <= 3 || !/\p{L}{2}/u.test(t)) return null;
    if (/^(untitled|microsoft word|document|title|unknown|none|slide \d+|print|scan)\b/i.test(t)) return null;
    // A print driver's or tool's job name ("printmgr file", "PDFCreator job 12", "Layout 1", "doc04512320231120"), not a title.
    if (/^(printmgr|print ?manager|pdf ?creator|acrobat|adobe|distiller|ghostscript|quartz|layout \d|job \d|doc\d)/i.test(t) || /^\S+ (file|job|document)$/i.test(t)) return null;
    if (/\.(pdf|docx?|tex|dvi|html?|txt|rtf|odt|pages|indd|qxd|ps)$/i.test(t) || /^[a-z]:\\|^\/|^https?:/i.test(t)) return null;
    if (bare(t) === bare(name) || (/[_]/.test(t) && !/\s/.test(t)) || /\(\d+\)\s*$/.test(t)) return null;
    if (/^[\w-]+$/.test(t) && /\d/.test(t)) return null; // "scan0042", "IMG-2024"
    if (ARXIV_STAMP.test(t)) return null; // arXiv's margin stamp ("arXiv:math/0211159v1 [math.DG] 11 Nov 2002")
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
  const HONORIFIC = /^(?:sir|dame|lord|lady|baron|baroness|bart\.?|mrs\.?|mr\.?|miss|rev\.?|count|countess|earl|viscount|duke|jr\.?|sr\.?)$/i;
  const ROLE = /,\s*\[?(?:ill|illus|illustrator|ed|editor|tr|trans|translator|joint author|comp|compiler)\.?\]?\s*$/i;
  function catalogueName(part) {
    const t = part.replace(/\([^)]*\)/g, ' ').replace(/,?\s*(?:\d{3,4}\??\s*-\s*(?:\d{3,4}\??)?|b\.\s*\d{3,4}|d\.\s*\d{3,4}|fl\.\s*\d{3,4})\.?\s*$/i, '').replace(/\s+/g, ' ').trim().replace(/,$/, '');
    const [surname, ...rest] = t.split(/\s*,\s*/);
    const given = rest.filter(piece => piece && !HONORIFIC.test(piece));
    if (!surname || !/^[\p{Lu}]/u.test(surname)) return null;
    return given.length ? `${given.join(' ')} ${surname}` : surname;
  }
  function metaAuthor(raw) {
    let t = readable(raw).replace(/^by\s+/i, '');
    // A library catalogue's heading, as Internet Archive PDFs carry it: "Darwin, Charles, 1809-1882",
    // "Doyle, Arthur Conan, Sir, 1859-1930", "Du Bois, W. E. B. (William Edward Burghardt), 1868-1963",
    // several joined by ";": the names as printed, without dates, fuller forms or titles.
    if (/,/.test(t) && (/\d{3,4}|\(|;/.test(t) || /^[\p{Lu}][\p{L}'’-]+, [\p{Lu}][\p{L}'’. -]+$/u.test(t))) {
      // An illustrator, editor or translator credited beside the author is not the author ("Thomson, Hugh, 1860-1920, ill").
      const parts = t.split(/\s*;\s*/), authors = parts.filter(part => !ROLE.test(part));
      const names = (authors.length ? authors : parts).map(part => catalogueName(part.replace(ROLE, ''))).filter(Boolean);
      if (names.length) t = names.slice(0, 3).join(' and ');
    }
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
    // A page with a single scrap of text (a cover's OCR noise: "nia") holds no title; past the third page, only a
    // title page does (a "by" line), not a publisher's list (The Importance of Being Earnest, 30 Oct 2026 corpus).
    for (const p of pages.slice(0, 10)) {
      if (p.rows.filter(r => /\p{L}{2}/u.test(r.text)).length < 2) continue;
      if (p.n > 3 && !p.rows.some(r => /^by$/i.test(r.text.trim()) || BY_LINE.test(r.text.trim()))) continue;
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
      const banner = r => WEB_LINE.test(r.text) && r.words <= 6
      // A cover whose largest line is a web banner names no title; its other lines are sections ("Presentazione").
      if (pages[0]?.rows.some(r => banner(r) && r.size >= Math.max(...pages[0].rows.map(x => x.size)) * 0.92)) break;
      const lettered = p.rows.filter((r, i) => !skip.has(i) && /\p{L}{2}/u.test(r.text) && !banner(r) && !ARXIV_STAMP.test(r.text)), pageBody = bodyOf(lettered);
      // On a short cover (a few lines on page 1) the largest line is the title even where later pages repeat it
      // ("BERKSHIRE HATHAWAY INC." over every page of its annual report).
      const coverTop = p.n === 1 && lettered.length <= 6 ? Math.max(...lettered.map(r => r.size)) : Infinity;
      const rows = lettered.filter(r => !isFurniture(p, r) || (!atEdge(p, r) && !isPageNumber(r.text) && ((pageBody && r.size >= pageBody.size * 1.3) || r.size >= coverTop)));
      if (!rows.length) continue;
      const body = bodyOf(rows);
      const top = Math.max(...rows.map(r => r.size));
      // A page set at one size has no title on it, unless it is a short title page.
      // A short title page with a "by" line takes its largest line too (THE IMPORTANCE | OF BEING EARNEST | … | BY).
      const titlePage = rows.length <= 14 && rows.some(r => /^by$/i.test(r.text.trim()) || BY_LINE.test(r.text.trim())) && rows.some(r => r.size < top * 0.8);
      if (top < body.size * 1.15 && !(rows.length <= 6 && p.n === 1 && rows[0].words <= 14) && !titlePage) continue;
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
      for (const [k, r] of near.entries()) {
        // "BY" on a line of its own, the name on the next ("BY" | "OSCAR WILDE").
        if (/^by$/i.test(r.text.trim()) && near[k + 1] && nameLike(near[k + 1].text) && near[k + 1].words <= 6) { author = readable(near[k + 1].text); break }
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
  // A scan's label line read with a comma for its full stop ("CHAPTER VI,"; Sartor Resartus, 30 Oct 2026 corpus) is a label.
  const labelComma = t => /,$/.test(t) && LABEL_LINE.test(t.replace(/,$/, '.'));
  function headingLike(r) {
    const t = r.text, letters = (t.match(/\p{L}/gu) || []).length;
    if (/^[IVXLC]{1,7}\.$/.test(t)) return true;
    return r.words <= 12 && (letters >= 4 || (letters >= 2 && LABEL_HEADING.test(t))) && letters >= t.replace(/\s/g, '').length * 0.6
      && /^([\p{Lu}]|[\dIVXivx]+(?:\.\d+)*[.)]?\s|[A-Z]\.?\d*\s|§)/u.test(t) && (!/[,;:]$/.test(t) || labelComma(t))
      && !/[=∑∫≡⊗⊕→←≈≤≥±×√∂∇]/.test(t) && !FIGURE_LABEL.test(t) && !isPageNumber(t);
  }
  // pages: [{ n, y0, h, rows }]; fontName(pageNumber, fontId) -> Promise<string>.
  // Pages a scanning service adds (Google Books' notice) are not the book.
  // A library's slip on a scan too ("Return this material to the library from which it was borrowed"; The Importance of Being Earnest).
  const BOILERPLATE_PAGE = /google book search|books\.google\.com|digital copy of a book that was preserved for generations|return this material to the library|regional library facility|person charging this material/i;
  // A play's "SCENE" alone on its line opens the stage direction, not a chapter.
  const BOILERPLATE_HEADING = /^(scene\.?$|the end\.?$|finis\.?$|preservation review|usage guidelines|about google book search|digitized by( the)? (internet archive|google)|this is a digital copy)|\b(cents? fine|date due|this book is due|overdue|return(ed)? on or before)\b/i;
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
    const isFurniture = furniture(pages, title);
    const same = s => bare(s);
    // On a scan, a heading stands well above the body; a line set a little larger is noise.
    const noisy = noisySizes(pages.flatMap(p => p.rows), docBody), step = noisy ? 1.35 : 1.15;
    // A scan (word-box OCR on its pages of text, or one font throughout with wandering sizes): its heading pages hold too
    // few words for the word-box test themselves. A slide deck's sizes wander too, in its several faces.
    const scanned = pages.some(p => p.rows.some(r => r.ocr)) || (noisy && new Set(pages.flatMap(p => p.rows.filter(r => r.font).map(r => r.font))).size <= 1);
    const out = [];
    let reading = false;
    for (const p of pages) {
      const local = bodyOf(p.rows), body = local && local.chars >= 300 ? local : docBody;
      // A contents page: many lines ending on a page number, or headed Contents (a scan's contents with chapters'
      // synopses: In the Land of the Blue Gown's "Vili CONTENTS" | "CHAPTER V" | "INTO THE CHINESE COUNTRY").
      // A publisher's numbered list on a scan ("1 The Mighty Atom" | "2 Jane"; Methuen's catalogue in The Importance of Being Earnest).
      if (p.rows.filter(r => CONTENTS_LINE.test(r.text)).length >= 5 || BOILERPLATE_PAGE.test(p.rows.map(r => r.text).join(' '))
        || (scanned && p.rows.length >= 8 && p.rows.filter(r => /^(?:\d{1,3}|\d \d|i ?o)\s+\p{Lu}/u.test(r.text)).length >= p.rows.length * 0.3)
        || p.rows.slice(0, 3).some(r => /^(?:\S{1,5}\s+)?(?:contents|list of chapters)\.?(?:\s+\S{1,5})?$/i.test(r.text.trim()))) continue;
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
      // A scan's page without running text (a chapter opening on a picture, Oz): its large lines close together are one
      // heading whatever their alignment and sizes (hand lettering is read in many sizes), fragments of one line too.
      const bare = scanned && p.rows.filter(isBody).length < 2;
      let found = [];
      const pending = [];
      for (const [i, r] of p.rows.entries()) {
        if (i < first) continue;
        const next = p.rows.slice(i + 1).find(n => n.y < r.y - 0.5 && n.x < r.x2 && n.x2 > r.x);
        // On a scan the sizes of a line's words wander (a word's box is its height): the line below is body text within a quarter.
        const proseOpening = r.font === body.font && next && r.y - next.y < Math.max(r.size, next.size) * 1.8 && Math.abs(next.size - body.size) <= body.size * (scanned ? 0.25 : 0.1) && (/^\p{Ll}/u.test(next.text) || /-$/.test(r.text)) && !/[.!?:]$/.test(r.text);
        // A scan's title wrapped over centred lines ("TKe Se^vrcK for tKe" | "WicKed WitcK"; Oz, The Souls of Black Folk) continues
        // the line above when the two share a centre; born-digital headings continue at the same left edge as before.
        const centred = scanned && (r.words <= 8 || r.size >= Math.max(body.size, docBody.size) * 1.2) && r.x2 - r.x < p.w * 0.75;
        const prev = pending.findLast(h => Math.abs(h.x - r.x) < r.size * 0.5 || (centred && Math.abs((h.x + h.x2) / 2 - (r.x + r.x2) / 2) < r.size * 2) || bare);
        // A chapter's title under its label ("CHAPTER II" | "AUGUST IN CHEFOO", set smaller than the body in In the Land of the Blue
        // Gown) is the label's heading on a scan: a short line in capitals, not prose, within two and a half lines of the label.
        const underLabel = prev && prev.label && scanned && !proseOpening && r.words <= 12 && /^\p{Lu}/u.test(r.text) && !/\p{Ll}{3}/u.test(r.text) && !LABEL_LINE.test(r.text.trim()) && !OCR_LABEL.test(r.text.trim())
          && prev.y - r.y > r.size * 0.5 && prev.y - r.y < Math.max(prev.size, r.size) * 2.6 && (r.text.match(/\p{L}/gu) || []).length >= r.text.replace(/\s/g, '').length * 0.6;
        // A continuation need not start with a capital. Test it against the
        // accepted heading's typography and column before the standalone-title filter.
        const continues = prev && !proseOpening && ((prev.font === r.font || r.size >= Math.max(body.size, docBody.size) * 1.2) && Math.abs(prev.size - r.size) <= r.size * (bare ? 0.5 : scanned ? 0.2 : 0.05)
          && prev.y - r.y > (bare ? -r.size * 0.3 : r.size * 0.5) && prev.y - r.y < Math.max(r.size, bare ? prev.size : 0) * 1.8 || underLabel)
          && prev.words + r.words <= 16
          && (!skip.has(i) || bare) && !isFurniture(p, r) && !BOILERPLATE_HEADING.test(r.text)
          && !FIGURE_LABEL.test(r.text) && !isPageNumber(r.text) && /\p{L}/u.test(r.text);
        if (continues) {
          prev.entry.label = (prev.entry.label.replace(/,$/, '.') + ' ' + r.text).replace(/(?<=\p{L})-\s(?=\p{Ll})/gu, '').replace(/(?<=\p{Lu})-\s(?=\p{Lu}+\b)/gu, m => /\p{Ll}/u.test(prev.entry.label + r.text) ? m : '');
          prev.entry.lines++;
          Object.assign(prev, { y: Math.min(prev.y, r.y), x2: Math.max(prev.x2, r.x2), x: Math.min(prev.x, r.x), size: bare ? r.size : prev.size, words: prev.words + r.words, label: underLabel && prev.entry.lines < 3 });
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
        // On a scan, a few words in capitals set beside a chapter's picture initial ("MORNING THE" | "Scarecrow said to his"; Oz)
        // open the paragraph whose next line starts at the same place a line below them.
        const insetOpening = scanned && next && r.words <= 4 && Math.abs(next.x - r.x) < r.size && r.y - next.y < next.size * 1.9 && Math.abs(next.size - body.size) <= body.size * 0.25 && !/[.!?:]$/.test(r.text);
        if (insetOpening) { continue }
        // A misread stamp on a scan ("25 CENTS FINE OF AK imTXAL"): letters out of case inside a word.
        if (noisy && /\p{Ll}\p{Lu}{2}/u.test(r.text)) { continue }
        // On a scan a short line of speech ("Mamma!", "What?") gets a tall box from its mark (The Importance of Being Earnest),
        // and a scrap without a vowel ("i mmm") is no word (The Souls of Black Folk; 30 Oct 2026 corpus).
        if (noisy && r.words <= 3 && /[!?]$/.test(r.text) && !OCR_LABEL.test(r.text.trim())) { continue }
        if (noisy && !/(?<!\p{L})\p{L}*[aeiouyAEIOUY]\p{L}+|\p{L}+[aeiouyAEIOUY]\p{L}*(?!\p{L})/u.test(r.text) && !/^[IVXLC]+\.?$/.test(r.text.trim())) { continue }
        // Larger than this page's body and the book's (a page of small-type notes does not make its body text a heading).
        // A chapter's label alone on its line in the top half of a page ("CHAPTER IV.") is a heading at any size:
        // a scan's text layer can set every line alike (Problems of Philosophy, 30 Oct 2026 corpus). On a scan the
        // numeral may be misread past reading ("CHAPTER: |", "CHAPTER 0X!"): the label's neighbours number it (sequencedLabels).
        const label = labelLine(r) || labelComma(r.text) || (scanned && r.words <= 3 && OCR_LABEL.test(r.text.trim()));
        const larger = r.size >= Math.max(body.size, docBody.size) * step || (label && r.y - p.y0 > p.h * 0.5);
        const sameSize = Math.abs(r.size - body.size) <= body.size * 0.08;
        if (!larger && !(sameSize && r.font && r.font !== body.font)) { continue }
        const face = r.font ? await fontName(p.n, r.font) : '';
        if (!live()) return null;
        // Italic or oblique lines are quotations, epigraphs or emphasis, unless set much larger.
        if (isItalic(face) && r.size < body.size * 1.35) { continue }
        if (!larger && !isBold(face)) { continue }
        const entry = { id: 'h' + (out.length + found.length), label: r.text, page: p.n, kind: 'chapter', parent: null, lines: 1 };
        found.push(entry);
        pending.push({ entry, font: r.font, y: r.y, x: r.x, x2: r.x2, size: r.size, words: r.words, label });
      }
      // A title page (large lines and no running text: "A Study of Memory / for / … / by …") has no
      // chapters: before the text begins, two such lines or more; after, three or more. A scan's chapter opening on a
      // page of its own, led by its label however OCR read the word ("CKb^pter", "Chsvpter"; Oz, 30 Oct 2026 corpus), stays.
      const text = p.rows.filter(isBody).length >= 3;
      const chapterPage = bare && p.rows.some(r => CHAPTERISH.test(r.text) || LABEL_LINE.test(r.text.trim().replace(/,$/, ".")) || OCR_LABEL.test(r.text.trim()));
      const opening = e => scanned && (chapterPage || CHAPTERISH.test(e.label) || LABEL_LINE.test(e.label.split(/\s+/).slice(0, 2).join(" ")));
      const lines = found.filter(e => !opening(e)).reduce((n, e) => n + e.lines, 0);
      if (!text && lines >= (reading ? 3 : 2)) found = found.filter(opening);
      reading ||= text;
      for (const e of found) delete e.lines;
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
  // Leaders printed as two dots, spaced dots or OCR's commas (". . 12", "„ , 12") are leaders too.
  const LEADERS = /(?:\s*[.…·•,„]){2,}\s*(\d{1,4}|[ivxlc]{1,6})$/i;
  // A roman numeral as a scan's OCR reads it ("H." for II, "Xni" for XIII, "VTII" for VIII): numbered in sequence below.
  const ROMANISH = '(?:[IVXLCHJlniT]{1,7}|im|ID|CX)';
  const TITLED_LINE = new RegExp(`^((?:chapter\\s+)?(?:${ROMANISH}|\\d{1,3})[.,]?\\s+["“‘']?\\p{L}.*?)[.,]?\\s+(\\d{1,3})$`, 'u');
  const CARRY_START = new RegExp(`^${ROMANISH}[.,]?\\s+["“‘']?\\p{Lu}`, 'u');
  const ROMAN_LED = new RegExp(`^${ROMANISH}[.,]?\\s`);
  const ROMAN_LABEL = new RegExp(`^(${ROMANISH})([.,]?\\s+)(.*)$`);
  async function contentsEntries(numPages, pageRows, pageText, { scanned = false, title = '' } = {}) {
    const limit = Math.min(30, numPages), raw = [], contentsPages = new Set();
    for (let n = 1; n <= limit; n++) {
      // A contents line split at its leaders (textRows' wide gap) is one line again; a list of illustrations
      // is no contents ("Heading to Chapter XII … 63"); on a page headed Contents a title and its page
      // number without leaders count (30 Oct 2026 corpus).
      const rows = [];
      for (const t of (await pageRows(n)).map(r => r.text)) {
        if (rows.length && /^[\s.…·•,„'"]*(?:\d{1,4}|[ivxlc]{1,6})$/i.test(t) && /[.…·•]/.test(t) && !/\d$/.test(rows.at(-1))) rows[rows.length - 1] += ' ' + t;
        else rows.push(t);
      }
      const head = rows.slice(0, 4).join(' ');
      if (/illustrations|list of plates|list of figures|\bplates\b/i.test(head)) continue;
      const titled = /contents|list of chapters/i.test(head);
      // A page number OCR misread ("i6", "l2O") is its figures.
      const lines = rows.map(t => t.replace(/(\s)([\dilIoO]{1,4})$/, (m, sp, n) => /\d/.test(n) && /[ilIoO]/.test(n) ? sp + n.replace(/[ilI]/g, '1').replace(/[oO]/g, '0') : m).replace(LEADERS, ' ... $1'));
      let hits = 0, carry = '', carried = 0;
      const found = [];
      for (const line of lines) {
        const m = line.match(/^(.*?)\s*(?:\.\s*){3,}\s*(\d{1,4}|[ivxlc]{1,6})$/i) || (carry && line.match(/^(.*?)\s+(\d{1,4})$/))
          || (titled && line.match(TITLED_LINE))
          || (titled && line.match(/^(\p{Lu}[\p{L}'’ ,.-]*\p{L}["”’']?)[\s.,]+(\d{1,3})$/u));
        if (!m) {
          if ((/^\d{1,2}\s+\S/.test(line) || (titled && CARRY_START.test(line))) && !/\d$/.test(line)) { carry = line.replace(/-$/, ''); carried = 1 }
          // A title wrapped, or split at a wide gap, over several lines ("V KNOWLEDGE" | "BY ACQUAINTANCE AND" | "… 72").
          else if (carry && titled && carried < 3 && !/\d$/.test(line) && /^["“‘']?\p{Lu}/u.test(line)) { carry += ' ' + line.replace(/-$/, ''); carried++ }
          else carry = '';
          continue
        }
        const label = (carry ? carry + (m[1] ? (carry.endsWith('-') ? '' : ' ') + m[1] : '') : m[1]).replace(/\s*\.\s*$/, '').replace(/\s+/g, ' ').trim();
        carry = '';
        if (!label) continue;
        hits++; found.push({ label, printed: m[2], bare: !/\.\.\./.test(line) });
      }
      if (hits >= 4) { contentsPages.add(n); raw.push(...found) }
      else if (raw.length && hits === 0) break;
    }
    if (raw.length < 3) return null;
    // Read mostly without leaders, a contents' numbers must climb page by page, and an offset must find two of its
    // titles: a list whose numbers are no pages ("Summary 83", "Marks 51") is no contents.
    const leaderless = raw.filter(r => r.bare).length > raw.length / 2;
    if (leaderless) {
      const nums = raw.map(r => Number(r.printed)).filter(Number.isFinite);
      const climbs = nums.slice(1).filter((v, i) => v >= nums[i]).length;
      if (climbs < (nums.length - 1) * 0.8) return null;
    }
    let part = null;
    // A novel's contents numbers its chapters in roman ("IV. The Food Question 33"): each is a chapter.
    const romanLed = raw.filter(r => ROMAN_LED.test(r.label)).length >= raw.length * 0.6;
    // Numbered in roman, the scan's misread numerals ("H.", "HI.", "CX.") take their place in the sequence. Two entries
    // OCR ran into one line ("X. The Sun at noon … n XI. On your midnight pallet lying"; A Shropshire Lad) are two.
    if (romanLed) {
      for (let i = 0; i < raw.length; i++) {
        const m = /^((?:[IVXLC]{1,6})[.,]?\s+\S.*?)\s+(?:\S{1,2}\s+)?([IVXLC]{1,6})\.\s+(\p{Lu}.*)$/u.exec(raw[i].label);
        if (m && roman(m[2]) === roman(m[1].split(/[.,\s]/)[0]) + 1) raw.splice(i, 1, { ...raw[i], label: m[1] }, { ...raw[i], label: m[2] + '. ' + m[3] });
      }
      let prev = 0;
      for (const r of raw) {
        const m = ROMAN_LABEL.exec(r.label);
        if (!m) continue;
        const v = /^[IVXLC]+$/.test(m[1]) && toRoman(roman(m[1])) === m[1] ? roman(m[1]) : 0;
        const n = v > prev && v <= prev + 2 ? v : prev + 1;
        r.label = toRoman(n) + '. ' + m[3];
        prev = n;
      }
    }
    const entries = raw.map((r, i) => {
      if (romanLed) return { id: 'c' + i, printed: r.printed, arabic: /^\d+$/.test(r.printed), kind: 'chapter', label: r.label, title: r.label.replace(/^[IVXLC]{1,6}[.,]?\s+/, '').replace(/^["“‘']/, ''), parent: null };
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
      return best && best.score >= (leaderless ? Math.min(2, list.length) : 1) ? best.off : null;
    };
    const arabic = entries.filter(e => e.arabic && e.kind !== 'part').slice(0, 5).map(e => ({ ...e, base: Number(e.printed) }));
    const romanList = entries.filter(e => !e.arabic).slice(0, 3).map(e => ({ ...e, base: roman(e.printed) }));
    const offA = arabic.length ? await offsetFor(arabic, [-5, 80]) : null;
    const offR = romanList.length ? await offsetFor(romanList, [-5, 40]) : null;
    for (const e of entries) e.page = e.arabic ? (offA == null ? null : Number(e.printed) + offA) : (offR == null ? null : roman(e.printed) + offR);
    // A scan's plates are not numbered, so the shift grows through the book: an entry whose page does not
    // print its title is on the first page after (up to 40 on, never before the entry above) that prints it
    // as a line of its own below the running head (Pride and Prejudice, Hound, 30 Oct 2026 corpus). Only on a
    // scan: a born-digital document's offset holds, and its long contents is heard before the book is read.
    if (offA != null && scanned) {
      const key = t => norm(t).replace(/^(?:chapter )?(?:[ivxlc]+|\d+) /, '').replace(/ /g, '');
      const bookKey = key(title);
      // The rows that carry words, and whether a page holds running text (three lines of six words or more).
      const lettered = rows => rows.filter(r => /\p{L}{2}/u.test(r.text));
      const prose = rows => rows.filter(r => r.words >= 6).length >= 3;
      let floor = 1;
      for (const e of entries) {
        if (!e.arabic || !e.title) continue;
        const want = key(e.title);
        if (want.length < 4) { floor = Math.max(floor, e.page || 1); continue }
        // The title as a line of its own (the page's text may say "the problem" in passing), as OCR may misread it
        // ("TIIRES BROKEN THREADS": alike, from the same letter; "First Report" is not "Second Report"), from a few
        // pages before the shifted page on. The line stands among the page's first four (a chapter opens at the top,
        // a plate's caption under its picture does not: "ME,. BADGER." in The Wind in the Willows), and is not the
        // running head the page two before opens with too (Hound's "THE HOUND OF THE BASKERVILLES" over its even pages).
        const like = r => { const k = key(r.text); return k === want || (k.length >= 4 && (want.startsWith(k) || k.startsWith(want)) && Math.abs(k.length - want.length) <= Math.max(3, want.length * 0.3)) || (k.length >= 6 && Math.abs(k.length - want.length) <= 3 && k[0] === want[0] && likeness(k, want) >= 0.7) };
        const titleRow = rows => lettered(rows).slice(0, 4).findIndex(r => r.words <= 12 && like(r));
        const opens = async n => {
          if (n < 1 || n > numPages || contentsPages.has(n)) return false;
          const rows = await pageRows(n), at = titleRow(rows);
          if (at < 0) return false;
          if (at > 0) return true;
          // The same line at the same height two pages before is the running head (a half-title sets the title lower).
          const before = n > 2 && !contentsPages.has(n - 2) ? lettered(await pageRows(n - 2))[0] : null, top = lettered(rows)[0];
          return !(before && key(before.text) === key(top.text) && Math.abs(before.y - top.y) < Math.max(top.size, 8) * 1.5);
        };
        for (let n = Math.max(floor + 1, e.page - 6); n <= Math.min(numPages, e.page + 40); n++) {
          if (!(await opens(n))) continue;
          // A half-title page before the chapter's own (the title alone, then a plate): the chapter's page prints the title
          // over its text within three pages (The Wind in the Willows's "IV" | "MR. BADGER" on 95 and again on 97).
          if (!prose(await pageRows(n))) for (let m = n + 1; m <= Math.min(numPages, n + 3); m++) if (await opens(m) && prose(await pageRows(m))) { n = m; break }
          e.page = n; floor = n; break;
        }
      }
      // A chapter's title printed again as the running head of its odd pages: the chapter starts at the first page of
      // the run that prints it, one or two pages back (The Wind in the Willows: "THE RIVER BANK" on 15, 17, 19 …).
      // Not a title that is the book's, the running head of every other page (Hound's chapter XIV).
      let low = 1;
      for (const e of entries) {
        if (!e.arabic || !e.title || !e.page) continue;
        const want = key(e.title);
        if (want.length < 4 || want === bookKey) { low = e.page; continue }
        const prints = async n => { if (n <= low || contentsPages.has(n)) return false; const rows = await pageRows(n); return prose(rows) && lettered(rows).slice(0, 2).some(r => key(r.text) === want) };
        for (let moved = 0; moved < 4;) {
          if (await prints(e.page - 1)) { e.page -= 1; moved += 1 }
          else if (await prints(e.page - 2)) { e.page -= 2; moved += 2 }
          else break;
        }
        low = e.page;
      }
    }
    const out = entries.filter(e => e.page >= 1 && e.page <= numPages).map(({ printed, arabic: _a, title: _t, number: _n, ...e }) => e);
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
  // The chapter titles a printed contents or "List of Chapters" gives, in order, page numbers or none
  // ("CHAPTER XI. The Wonderful Emerald City" | "of Oz."): pages: the first pages as pageOf reads them.
  function printedTitles(pages) {
    const out = [];
    for (const p of pages.slice(0, 30)) {
      const rows = p.rows.filter(r => /\p{L}/u.test(r.text));
      const at = rows.slice(0, 4).findIndex(r => /^(?:list of chapters|contents|table of contents)\b/i.test(r.text.trim()));
      if (at < 0) continue;
      const found = [];
      for (const r of rows.slice(at + 1)) {
        const t = r.text.replace(/(?:\s*[.…·•,„]){2,}\s*(?:\d{1,4}|[ivxlc]{1,6})$/i, '').replace(/\s+\d{1,4}$/, '').trim();
        if (!t || /^(?:chapter|page)s?$|^chapter\s+page$/i.test(t)) continue;
        const opens = /^(?:chapter\s+)?(?:[IVXLCJl]{1,7}|\d{1,3})[.,:]?\s+\p{L}/iu.test(t) || /^chapter\b/i.test(t);
        if (!opens && found.length && (/^\p{Ll}/u.test(t) || !/[.!?"”]$/.test(found.at(-1)))) found[found.length - 1] += ' ' + t;
        else if (opens) found.push(t);
      }
      if (found.length >= 3) out.push(...found);
      else if (out.length) break;
    }
    return out.map(t => t.replace(/[.,]$/, '').replace(/\s+/g, ' '));
  }
  // Headings found on a scan whose titles are pictures read badly by OCR ("TKe Cyclorve", "OF THE TRAINma OF
  // BLACK MEN 103") take the printed contents' titles, matched in order by their letters (Oz, Souls).
  const titleLetters = t => String(t).toLowerCase().replace(/^\W*(?:chapter|chap)\W+/, '').replace(/^(?:[ivxlcjh]{1,7}|\d{1,3})\b\W*/, '').replace(/\b\d{1,4}\b/g, '').replace(/[^\p{L}]+/gu, '');
  function alignTitles(entries, titles) {
    if (titles.length < 4 || !entries.length) return entries;
    const a = entries.map(e => titleLetters(e.label)), b = titles.map(titleLetters);
    const score = (i, j) => { if (a[i].length < 3 || b[j].length < 3) return 0; const v = likeness(a[i], b[j]); return v >= 0.35 ? v : 0 };
    const n = a.length, m = b.length, best = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
      const v = score(i, j);
      best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], v ? v + best[i + 1][j + 1] : 0);
    }
    const out = entries.slice(), pairs = [];
    for (let i = 0, j = 0; i < n && j < m;) {
      const v = score(i, j);
      if (v && best[i][j] === v + best[i + 1][j + 1]) { pairs.push([i, j]); i++; j++ }
      else if (best[i][j] === best[i + 1][j]) i++;
      else j++;
    }
    // Between two titles matched so, the headings left take the titles left in order where they are a little alike
    // or name the same numeral ("CNjivpter V." | "CHAPTER v. The Rescue of the Tin Woodman").
    const numeral = t => (/\b([IVXL]{1,6})\b\.?\s*$/i.exec(String(t).replace(/^.*?(?:ter|pter)\s*/i, '')) || /^(?:chapter\s+)?([IVXL]{1,6})\b/i.exec(String(t)) || [])[1]?.toUpperCase() || '';
    const bounds = [[-1, -1], ...pairs, [n, m]];
    const extra = [];
    for (let k = 0; k + 1 < bounds.length; k++) {
      let j0 = bounds[k][1] + 1;
      // As many headings left between two matched titles as titles left: each takes the title in its place ("Liorv." between
      // chapters V and VII is VI, The Cowardly Lion; Oz, 30 Oct 2026 corpus).
      const ni = bounds[k + 1][0] - bounds[k][0] - 1, nj = bounds[k + 1][1] - bounds[k][1] - 1;
      if (ni > 0 && ni === nj) { for (let t = 0; t < ni; t++) extra.push([bounds[k][0] + 1 + t, j0 + t]); continue }
      for (let i = bounds[k][0] + 1; i < bounds[k + 1][0]; i++) {
        for (let j = j0; j < bounds[k + 1][1]; j++) {
          const sameNumeral = numeral(entries[i].label) && numeral(entries[i].label) === numeral(titles[j]);
          if (sameNumeral || (a[i].length >= 3 && b[j].length >= 3 && likeness(a[i], b[j]) >= 0.2)) { extra.push([i, j]); j0 = j + 1; break }
        }
      }
    }
    for (const [i, j] of [...pairs, ...extra]) if (a[i] !== b[j]) out[i] = { ...entries[i], label: titles[j] };
    // A heading no title names that OCR read as marks ("1 #|/^ LITTLE PARTY", "CK i ix-fe^ Coi/rvt") is no chapter.
    const named = new Set([...pairs, ...extra].map(([i]) => i));
    return out.filter((e, i) => named.has(i) || !/[#|^\\<>{}~]|\/\S*\//.test(String(e.label)));
  }
  // A contents numbering its entries in roman that skips some (a scan's lines lost to OCR: A Shropshire Lad's VII, XXIII, L)
  // or stops short of the book (a scan missing its last contents page: ends at XLIV of LXIII; Hound's XV) takes the numerals
  // missing from the text, each alone on its line ("XLV -^", "CHAPTER XV") on the pages between its neighbours, named by
  // the line after it.
  function continueNumbered(entries, pages) {
    const lead = e => /^([IVXLC]{1,7})[.,]?\s/.exec(String(e.label));
    const numbered = entries.filter(lead);
    if (numbered.length < 5 || numbered.length < entries.length * 0.6) return entries;
    const numeralRow = r => { const k = /^(?:CHAPTER\s+|CHAP\.\s*)?([IVXLC]{1,7})[\W_]{0,3}$/i.exec(r.text.trim()); return k && toRoman(roman(k[1])) === k[1].toUpperCase() ? roman(k[1]) : 0 };
    const out = [];
    const fill = (from, to, want, until) => {
      for (const p of pages) {
        if (p.n < from || p.n > to || want > until) continue;
        for (let i = 0; i < p.rows.length; i++) {
          const v = numeralRow(p.rows[i]);
          if (!v || v < want || v > Math.min(until, want + 3)) continue;
          want = v;
          const next = p.rows.slice(i + 1).find(q => /\p{L}{2}/u.test(q.text));
          out.push({ id: 'n' + v, label: `${toRoman(v)}. ${next ? next.text.replace(/[,;:.]+$/, '') : ''}`.trim(), page: p.n, kind: 'chapter', parent: null });
          want++;
        }
      }
    };
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i], m = lead(e);
      out.push(e);
      if (!m) continue;
      const next = entries.slice(i + 1).find(lead), nm = next && lead(next);
      const want = roman(m[1]) + 1, until = nm ? roman(nm[1]) - 1 : Infinity;
      if (want <= until) fill(nm ? e.page : e.page + 1, nm ? next.page : Infinity, want, until);
    }
    return out;
  }
  // Headings that are mostly chapter labels ("CHAPTER II.", "CHAPTER III.") read in sequence: a label the scan
  // garbled ("CHAITKk [V.", "CHA ER-XIV") or misread as another numeral ("CHAPTER XL" between X and XII) takes
  // the number its neighbours give it (Pride and Prejudice, 30 Oct 2026 corpus).
  const toRoman = n => { let out = ''; for (const [v, r] of [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { out += r; n -= v } return out };
  function sequencedLabels(list) {
    // Each label's numeral as printed and as OCR misreads numerals ("L", "l" for I; "H", "n", "U" for II; "in", "m"
    // for III: "CHAPTER L" is I where II follows, not 50).
    // The label, its numeral and the title a scan's heading may carry after it ("CHAPTER II AUGUST IN CHEFOO").
    const LABEL = /^(?:CHAPTER|Chapter|CHAP\.?)(?![A-Za-z])\W{0,2}\s*(\S{1,7}?)[.,:!]?(?:\s+(.*))?$/;
    const valid = t => /^[IVXLC]+$/.test(t) && toRoman(roman(t)) === t ? roman(t) : null;
    const options = list.map(e => {
      const m = LABEL.exec(String(e.label).trim());
      if (!m) return [];
      const raw = valid(m[1]), ocr = valid(m[1].replace(/[Ll1|]/g, 'I').replace(/[HUn]/g, 'II').replace(/m/g, 'III').replace(/i/g, 'I'));
      return [...new Set([raw, ocr].filter(v => v))];
    });
    const labelled = list.filter(e => /^\s*(?:C\s?H\s?A|CHAP|Chap)/.test(String(e.label))).length;
    if (labelled < 5 || options.filter(o => o.length).length < labelled * 0.6) return list;
    // A reading holds where a neighbour within three entries agrees with it, a chapter or two missing between (a
    // book's numbering may start again: Sartor Resartus's three Books); the printed reading first.
    const n = list.length;
    const fits = (v, i) => {
      for (let j = Math.max(0, i - 3); j <= Math.min(n - 1, i + 3); j++) {
        if (j === i) continue;
        for (const w of options[j]) { const gap = j > i ? w - v : v - w, d = Math.abs(j - i); if (gap >= d && gap <= d + 2) return true }
      }
      return false;
    };
    const chosen = options.map((o, i) => o.find(v => fits(v, i)) ?? null);
    // A label too garbled to read ("CHAITKk [V.", "CHAPTER J.", "CHAPTER: |") takes the number its read neighbours give it.
    const garbled = e => /^(?:C\s?H\s?A|CHA|CH\.|C[HI]AP)/i.test(String(e.label)) && (String(e.label).length <= 16 || LABEL.test(String(e.label).trim()));
    for (let i = 0; i < n; i++) {
      if (chosen[i] !== null || !garbled(list[i])) continue;
      const before = chosen.slice(0, i).reduceRight((v, x, j) => v ?? (x !== null ? x + (i - j) : null), null);
      const after = chosen.slice(i + 1).reduce((v, x, j) => v ?? (x !== null ? x - (j + 1) : null), null);
      const want = before ?? after;
      if (want != null && want >= 1 && (before == null || after == null || before === after)) chosen[i] = want;
    }
    // Two labels in a row read as one number ("CHAPTER IV" twice, III misread; In the Land of the Blue Gown): the one
    // whose other neighbour leaves a number free takes it.
    for (let i = 0; i + 1 < n; i++) {
      if (chosen[i] === null || chosen[i] !== chosen[i + 1]) continue;
      if (i > 0 && chosen[i - 1] !== null && chosen[i - 1] + 1 < chosen[i]) chosen[i] = chosen[i - 1] + 1;
      else if (i + 2 < n && chosen[i + 2] !== null && chosen[i + 2] - 1 > chosen[i + 1]) chosen[i + 1] = chosen[i + 2] - 1;
    }
    return list.map((e, i) => {
      if (chosen[i] === null) return e;
      const m = LABEL.exec(String(e.label).trim());
      const label = 'CHAPTER ' + toRoman(chosen[i]) + '.' + (m?.[2] ? ' ' + m[2].replace(/[\s>|<\\^~*]+$/, '') : '');
      return label === String(e.label).trim() ? e : { ...e, label };
    });
  }
  // On a scan, a chapter's title as its page prints it replaces the contents' reading of it when the page's words are the
  // book's (used three times or more in it) and the contents' are not ("Baskeryille" against "BASKERVILLE", "DOMTJM"
  // against "DOMUM"; The Hound of the Baskervilles, The Wind in the Willows, 31 Oct 2026). The numeral stays the contents'.
  function printedSpellings(entries, pages) {
    const vocab = new Map();
    for (const p of pages) for (const r of p.rows) for (const w of r.text.toLowerCase().match(/\p{L}{3,}/gu) || []) vocab.set(w, (vocab.get(w) || 0) + 1);
    const known = t => { const ws = t.toLowerCase().match(/\p{L}{3,}/gu) || []; return ws.length ? ws.filter(w => (vocab.get(w) || 0) >= 3).length / ws.length : 1 };
    const key = t => norm(t).replace(/^(?:chapter )?(?:[ivxlc]+|\d+) /, '').replace(/ /g, '');
    return entries.map(e => {
      const m = /^((?:[IVXLC]{1,7}|\d{1,3})[.,·—-]?\s+)?(.*)$/.exec(String(e.label)), want = key(m[2]);
      const page = want.length >= 6 && pages.find(p => p.n === e.page);
      if (!page) return e;
      const row = page.rows.filter(r => /\p{L}{2}/u.test(r.text)).slice(0, 4).find(r => { const k = key(r.text); return r.words <= 12 && k !== want && k.length >= 6 && Math.abs(k.length - want.length) <= 3 && likeness(k, want) >= 0.7 });
      if (!row) return e;
      const printed = row.text.replace(/^(?:chapter\s+)?(?:[IVXLC]{1,7}|\d{1,3})[.,]?\s+/i, '').replace(/[.,;:]+$/, '').trim();
      return known(printed) > known(m[2]) ? { ...e, label: (m[1] || '') + printed } : e;
    });
  }
  // The same heading twice within two pages (a half-title page, then the act's first page: "FIRST ACT") is one,
  // at the later page, where its text begins (The Importance of Being Earnest).
  // On a scan the repeat may be misread ("The Forethought" | "THE FOEETHOUGHT"; The Souls of Black Folk): alike, and numbered alike.
  function nearRepeats(list) {
    const alike = (a, b) => { const x = bare(a), y = bare(b); return x === y || (x.length >= 6 && !/\d|\b[IVXLC]+\b/.test(a + b) && likeness(x, y) >= 0.8) };
    return list.filter((e, i) => { const next = list[i + 1]; return !(next && alike(next.label, e.label) && next.page - e.page <= 2 && next.page >= e.page && !list.some(c => c.parent === e.id)) });
  }
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
    for (let n = 1; n <= Math.min(10, pdf.numPages); n++) first.push(await pageOf(n));
    if (!live()) return null;
    const { title, author, source } = pickTitle(info, first, fileName);
    onTitle?.({ title, author });
    // Pages read for the scan: 400, as before; up to HEADING_PAGES only when the chapters must come from headings
    // (a long scan without bookmarks or a usable contents: Pride and Prejudice's 512 pages). A book whose bookmarks or
    // contents give its chapters is not read further, so its chapters are ready as soon as before.
    const total = Math.min(maxPages, pdf.numPages), base = Math.min(total, 400);
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
    else if ((entries = await contentsEntries(pdf.numPages, async n => (await pageOf(n)).rows, text, { scanned: all.some(p => p.rows.some(r => r.ocr)), title }))) nav = 'contents';
    if (!live()) return null;
    if (entries) entries = usableEntries(entries);
    if (entries && onEntries) { try { onEntries({ nav, entries, language, text: !noise && all.some(runningText) ? true : null }) } catch { /* the listener's own failure never stops the scan */ } }
    for (let n = all.length + 1; n <= base; n++) { all.push(await pageOf(n)); if (!live()) return null }
    if (!entries || (nav === 'contents' && entries.length < 6)) for (let n = all.length + 1; n <= total; n++) { all.push(await pageOf(n)); if (!live()) return null }
    if (nav === 'contents' && entries) entries = continueNumbered(entries, all);
    if (nav === 'contents' && entries && all.some(p => p.rows.some(r => r.ocr))) entries = printedSpellings(entries, all);
    // Headings as chapters: named from the printed contents where garbled, numbered in sequence, a repeat within two pages dropped.
    const headed = found => nearRepeats(sequencedLabels(alignTitles(usableEntries(found), noise || !all.some(p => p.rows.some(r => r.ocr)) ? [] : printedTitles(all))));
    if (!entries && (entries = await headingEntries(all, { fontName, title, author, live }))) { nav = 'headings'; entries = headed(entries) }
    // A contents page read only in part (a garbled scan: 4 of its 16 lines) gives way to headings that find more.
    else if (nav === 'contents' && entries.length < 6) { const found = await headingEntries(all, { fontName, title, author, live }); if (found && usableEntries(found).length > entries.length) { nav = 'headings'; entries = headed(found) } }
    if (!live()) return null;
    // Pages with running text (a scanner's notice page aside): none means a scan without a text layer.
    let textPages = all.filter(runningText).length;
    if (noise) textPages = 0;
    const kind = await layout(pdf, all, { itemsOf, fontName, isFurniture: furniture(all, title), textPages, live });
    if (!live() || !kind) return null;
    return {
      v: SCAN_VERSION, title, author, pages: pdf.numPages, nav, entries: entries || [], language, textPages, layout: kind,
      source,
    };
  }
  /**
   * The book's title and author: the metadata Title unless it is junk, else the largest type on the
   * first pages, else the file name made readable; the author from the metadata, else the title page.
   * info: pdf.js metadata info; first: the first pages as pageOf reads them.
   */
  function pickTitle(info, first, fileName) {
    const printed = printedTitle(first, furniture(first));
    const fromMeta = sameTitleLonger(metaTitle(info?.Title, fileName), printed.title);
    const title = fromMeta || printed.title || cleanFileName(fileName);
    const fromMetaAuthor = metaAuthor(info?.Author);
    return { title, author: fromMetaAuthor || printed.author || '',
      source: { title: fromMeta ? 'metadata' : printed.title ? 'printed' : 'file', author: fromMetaAuthor ? 'metadata' : printed.author ? 'printed' : 'none' } };
  }
  /** Title and author alone (metadata and the first three pages), for naming a PDF the moment it is added. */
  async function titleOf(pdf, { fileName = '' } = {}) {
    let info = {};
    try { info = (await pdf.getMetadata())?.info || {} } catch {}
    const first = [];
    for (let n = 1; n <= Math.min(3, pdf.numPages); n++) {
      const page = await pdf.getPage(n), [x0, y0, x1, y1] = page.view;
      first.push({ n, page, x0, w: x1 - x0, y0, h: y1 - y0, rows: textRows((await page.getTextContent()).items) });
    }
    return pickTitle(info, first, fileName);
  }
  // A stored scan is used when it is of this version.
  const current = s => !!s && s.v === SCAN_VERSION && Array.isArray(s.entries) && typeof s.title === 'string';

  global.TinctPdfScan = { likeness, noisySizes, nearRepeats, wordBoxLayer, sequencedLabels, printedTitles, alignTitles, SCAN_VERSION, scan, titleOf, pickTitle, current, usableEntries, layout, twoColumns, hasTable, textRows, bodyOf, epigraphRows, furniture, headingLike, headingEntries, outlineEntries, languageOf, contentsEntries, printedTitle, sameTitleLonger, metaTitle, metaAuthor, cleanFileName, nameLike, isItalic, isBold, isPageNumber };
})(typeof window !== 'undefined' ? window : globalThis);
