'use strict';
// Tinct · Add a book: a text PDF as Tinct text, the edition the Tinct reader reflows. No
// network and no AI: the PDF's own text layer, read the same way on every device (the same
// file converts to the same chapters, paragraphs and words, so a place is the same place).
//   1. Lines (js/pdf-scan.js textRows), without running heads and feet or page numbers
//      (furniture), in reading order: a page set in two columns is read column by column
//      between the lines that run across it, else top to bottom. Captions ("Figure 2. …") and
//      the small lettering inside figures are left out.
//      Rows on the same baseline in a column are one line (an equation and its number, "(2)").
//      Lettering stacked over another line (a label over an arrow, "constructor"; the chain of
//      labels above it), a table's cells beside its caption and the brackets of a display
//      formula ("⎛ ⎞") are left out too.
//      A numbered section heading in its own face or size ("1.1 Construction tasks", converter
//      2) is a heading, never the first words of the paragraph below it.
//   2. Paragraphs: a new one after a vertical gap of more than 1.5 lines, at a line indented
//      by more than 1 em from the line before, or after a short line ending a sentence
//      (. ? ! : "). A block set in from the margin (an abstract, a quotation) runs on line by
//      line (converter 2: before, every line of an indented abstract was a paragraph); a
//      reference list set with hanging indents keeps each entry whole.
//      Across a page or a column, the text runs on when the next line starts in lower case or
//      the line before ends without a full stop (and, in a book that indents its paragraphs,
//      when the next line is not indented).
//   3. Words broken at a line end ("under-" + "standing") are joined, unless the hyphenated
//      word stands elsewhere in the document ("self-evident") or its first part is a prefix the
//      document hyphenates in other words ("non-" + "existence", as "non-zero"); soft hyphens
//      (U+00AD) go.
//   4. Footnotes (smaller than the body, in the bottom quarter of the page, starting with a
//      marker) are collected after their chapter under a "Notes" heading.
//   5. Chapters: the scan's (outline, printed contents or headings); without any, chapters of
//      20 pages ("Pages 1–20"), or the whole document under its title when it is shorter.
//   5b. Crops (converter 3): a displayed formula, a figure or a table found on a page (pages[i].regions,
//      js/pdf-regions.js) stands in the text as a picture of the page where it sits: a paragraph of
//      its own (U+FFFC + its id, as an EPUB's pictures: app/src/lab/labFigures.ts), its caption
//      beneath it, the text it holds out of the running text (kept as its `alt`). One holding running
//      text is not taken. Without regions (a device that cannot draw them) the text is as converter 2's.
//   6. Each paragraph keeps the page it starts on (pages[i]) and where it runs onto the next
//      page ([paragraph, word, page] in pageBreaks), so a place converts between this edition
//      and the PDF's pages both ways (placeOf / pageOf; app/src/lab/userBook/pdfAnchors.ts).
// A document without a text layer (textPages 0) has no Tinct text: convert() returns null.
// Used by the Tinct reader (app/src/lab/userBook/pdfEdition.ts loads it as window.TinctPdfText)
// and Add a book's viewer (js/reader.js); the tests import this file directly.
(function (global) {
  // Rules that change any chapter, paragraph or word get a new number (userEdition.ts).
  // 2 (16 Oct 2026): indented blocks run on, numbered subheadings, figure labels left out.
  // 3 (16 Oct 2026): formulas, figures and tables as crops of the page, where the device draws them.
  // Rebuild older editions with corrected sloped rows and wrapped headings; places migrate by PDF page.
  // 5 (29 Oct 2026): a two-column page with a narrow gutter is read column by column (textRows' gutter).
  // 6 (29 Oct 2026): first-line paragraph indents are not a hanging indent; chapter headings past line 40;
  // a figure inside a paragraph's run follows the paragraph.
  // 7 (30 Oct 2026): scanned books: word-box OCR lines, lower-case run-ons, repeated lines kept unless at the same
  // height, superscript signs, lists at a book's start and drop-cap letters (30 Oct 2026 corpus).
  //   31 Oct 2026, same corpus: a scan is known by its one font and wandering sizes too; its drop-cap paragraphs are found
  //   by their inset lines and restored by word pairs; the lines beside a drop cap run on; a chapter's printed title is
  //   matched by likeness and its label line skipped; small-type pages (an index) stay; OCR's "1" for "!" and its carets go;
  //   a publisher's numbered lists at either end of the book leave the text.
  // 8 (31 Oct 2026): scans: page numbers as OCR misreads them ("i6i M", "129 i"), a chapter's label line opens its chapter,
  // OCR's "V" and "l" for "?" and "!", and drop caps read from the page where the device draws it (readCap).
  const PDF_TEXT_CONVERTER = 8;
  const CHAPTER_PAGES = 20;
  const S = () => global.TinctPdfScan;

  const median = list => { if (!list.length) return 0; const s = [...list].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] };
  const norm = s => String(s || '').toLowerCase().replace(/­/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const TERMINAL = /[.?!:"”’)\]]$/;
  const FOOTNOTE_MARK = /^(?:\d{1,3}|[*†‡§¶])(?:[.)]?\s|\s*\p{Lu})/u;
  const CAPTION = /^(?:fig(?:ure)?|table|tab|plate|chart|diagram)\.?\s*\d+/i;
  // A numbered section heading: "2.", "1.1", "3.15" and its title.
  const SECTION = /^(?:\d{1,2}\.(?:\d{1,2}\.?)*)\s+[\p{Lu}\p{Lt}]/u;
  const EQUATION_NUMBER = /^\(\d{1,3}(?:\.\d{1,3})?[a-z]?\)$/;
  // The pieces a display formula's tall brackets are set in (U+239B–U+23AD).
  const BRACKET_PIECES = /[\u239B-\u23AD]/g;

  /* ---------- Columns ---------- */
  // A page set in two columns: at least 8 lines on each side of the middle, their starts more
  // than 0.35 of the page apart, and lines narrower than 0.48 of the page. Returns, for each
  // row, 0 (left), 1 (right) or 'span' (across the page), or null for a page in one column.
  function columnsOf(rows, x0, w) {
    const mid = x0 + w / 2, slack = w * 0.02;
    const side = rows.map(r => r.x2 <= mid + slack ? 0 : r.x >= mid - slack ? 1 : 'span');
    const left = rows.filter((r, i) => side[i] === 0 && r.words >= 3), right = rows.filter((r, i) => side[i] === 1 && r.words >= 3);
    if (left.length < 8 || right.length < 8) return null;
    if (median(right.map(r => r.x)) - median(left.map(r => r.x)) <= 0.35 * w) return null;
    if (median([...left, ...right].map(r => r.x2 - r.x)) >= 0.48 * w) return null;
    return side;
  }
  // Rows in reading order: in two columns, each band between rows across the page is read left
  // column first, then right; else top to bottom (textRows' order).
  function readingOrder(rows, x0, w) {
    const side = columnsOf(rows, x0, w);
    if (!side) return rows.map(r => ({ ...r, col: 0 }));
    const out = [];
    let band = [[], []];
    const flush = () => { out.push(...band[0], ...band[1]); band = [[], []] };
    rows.forEach((r, i) => {
      if (side[i] === 'span') { flush(); out.push({ ...r, col: 'span' }) }
      else band[side[i]].push({ ...r, col: side[i] });
    });
    flush();
    return out;
  }

  /* ---------- Pages to lines ---------- */
  // The top and bottom tenth of a page, where running heads and feet are set.
  const edge = (p, r) => r.y - p.y0 > p.h * 0.9 || r.y - p.y0 < p.h * 0.1;
  // pages: [{ n, x0, y0, w, h, rows }] (rows from textRows). Returns the document's lines in
  // reading order, each { n, col, kind: 'body' | 'heading' | 'foot', … the row }.
  // keep(p, r): a row that stays text whatever else (a chapter's title inside a figure's crop).
  function documentLines(pages, title = '', keep = () => false) {
    const api = S();
    const isFurniture = api.furniture(pages, title);
    // Where running heads and feet are set (the line, its size), from those found repeating:
    // a head that changes from chapter to chapter, set in the same place, is one too. The slot is exact: a looser one
    // (31 Oct 2026, tried) let one line wrongly called furniture take the first or last line of every page of Pride and Prejudice.
    const slots = new Set();
    for (const p of pages) for (const r of p.rows) if (!api.isPageNumber(r.text) && isFurniture(p, r) && edge(p, r)) slots.add(Math.round(r.y - p.y0) + '|' + r.size);
    const inSlot = (p, r) => edge(p, r) && r.words <= 12 && slots.has(Math.round(r.y - p.y0) + '|' + r.size);
    const kept = pages.map(p => ({ ...p, rows: p.rows.filter(r => keep(p, r) || (!isFurniture(p, r) && !inSlot(p, r) && r.text.trim())) }));
    const body = api.bodyOf(kept.flatMap(p => p.rows));
    if (!body) return { lines: [], body: null, scanned: false };
    const scanned = isScan(kept.flatMap(p => p.rows), body);
    const out = [];
    for (const p of kept) {
      // Formulas, figures and tables kept as crops of the page (converter 3): their own text leaves the
      // running text, and each stands where it sits, as a line of its own.
      const { rows, pictures } = picturesOf(p, body, keep);
      // A scan's page set small throughout (an index, a bibliographical note; Problems of Philosophy, 30 Oct 2026 corpus) is
      // text, not the lettering inside a figure: its own body size tells small from smaller.
      const local = scanned ? api.bodyOf(rows) : null, small = (local && local.chars >= 300 && local.size < body.size ? local.size : body.size) * 0.8;
      const ordered = sameBaseline(readingOrder([...rows.map(r => ({ ...r, text: r.text.replace(BRACKET_PIECES, ' ').replace(/\s+/g, ' ').trim() })).filter(r => r.text), ...pictures].sort((a, b) => b.y - a.y || a.x - b.x), p.x0 || 0, p.w || 612), body);
      const left = columnLeft(ordered, body);
      const labels = stackedLabels(ordered, body, left);
      let inFoot = false, caption = null, bodySeen = false;
      const start = out.length;
      for (let [i, r] of ordered.entries()) {
        if (labels.has(i)) continue;
        if (r.figure) { out.push({ ...r, n: p.n, kind: 'figure' }); caption = null; inFoot = false; continue }
        const low = r.y - p.y0 < p.h * 0.25;
        if (caption && isCell(r, caption, left, body) && caption.y - r.y < body.size * 6) continue;
        // A caption and the lines that continue it, close below, in its own size.
        if (CAPTION.test(r.text) && r.size <= body.size * 1.05) {
          // A table's or a diagram's cells set just above its caption (not at the column's margin,
          // a few words each) are part of it.
          while (out.length > start && isCell(out.at(-1), r, left, body)) { const cell = out.pop(); r = { ...r, y: Math.max(r.y, cell.y) } }
          caption = r; continue;
        }
        if (caption && r.size === caption.size && caption.y - r.y < r.size * 1.8 && r.col === caption.col) { caption = r; continue }
        caption = null;
        if (r.size < body.size * 0.92 && low && (FOOTNOTE_MARK.test(r.text) || inFoot)) { inFoot = true; out.push({ ...r, n: p.n, kind: 'foot' }); continue }
        inFoot = false;
        // The lettering inside a figure or a chart: small text that is not a note. On a scan a chapter's title set smaller than
        // its text ("THE EXISTENCE OF MATTER" under "CHAPTER II" at 8 against 11; Problems of Philosophy, In the Land of the Blue
        // Gown) stands in capitals above the page's first line of text: it stays, as a heading.
        const smallTitle = scanned && !bodySeen && r.size >= small * 0.7 && r.words <= 12 && !/\p{Ll}{2}/u.test(r.text) && api.headingLike(r);
        if (r.size < small && !smallTitle) continue;
        if (r.words >= 6 && Math.abs(r.size - body.size) <= body.size * 0.25) bodySeen = true;
        let heading = smallTitle || (r.size >= body.size * 1.15 && r.words <= 16 && api.headingLike(r)) || subheading(r, body, p);
        // On a scan a chapter's first line beside its drop cap gets a tall box ("R. SHERLOCK HOLMES, who"; The Hound of the
        // Baskervilles): a line running on into the body text below it (lower case, or this one broken) is the paragraph's.
        if (heading && scanned) {
          const below = ordered.slice(i + 1).find(q => !q.figure && q.col === r.col && q.y < r.y - 0.5 && q.x < r.x2 && q.x2 > r.x);
          const runsOn = /^\p{Ll}/u.test(below?.text || '') || /\p{L}-$/u.test(r.text) || /\s(?:and|or|the|a|an|of|to|in|was|were|had|has|is|who|which|that|but|for|with|at|on|by|he|she|it|they|we|i|his|her|their|my|our|as|so|if|when|while)$/i.test(r.text);
          if (below && r.y - below.y < Math.max(r.size, below.size) * 1.8 && Math.abs(below.size - body.size) <= body.size * 0.25 && runsOn && !/[.!?:]$/.test(r.text)) heading = false;
        }
        out.push({ ...r, n: p.n, kind: heading ? 'heading' : 'body' });
      }
    }
    return { lines: out, body, scanned };
  }
  // A scan's text layer: words in their own boxes (textRows' ocr), or one font throughout a long book, its line sizes
  // wandering (an OCR layer set line by line: In the Land of the Blue Gown) or not (Problems of Philosophy's, set by mupdf;
  // 31 Oct 2026). A born-digital book has its bold and italic faces.
  function isScan(rows, body) {
    if (rows.filter(r => r.ocr).length >= rows.length * 0.5) return true;
    const oneFont = new Set(rows.filter(r => r.font).map(r => r.font)).size <= 1;
    return oneFont && (S().noisySizes(rows, body) || rows.length >= 3000);
  }

  // An equation and its number ("(2)", "(1.48)") set far apart on one baseline are one line.
  function sameBaseline(rows, body) {
    const out = [];
    for (const r of rows) {
      const prev = out.at(-1);
      if (prev && prev.col === r.col && EQUATION_NUMBER.test(r.text) && Math.abs(prev.y - r.y) < Math.max(2, body.size * 0.3) && r.x >= prev.x2 - 1) {
        out[out.length - 1] = { ...prev, x2: r.x2, text: prev.text + ' ' + r.text, words: prev.words + r.words, chars: prev.chars + 1 + r.chars, font: prev.font === r.font ? prev.font : null };
      } else out.push(r);
    }
    return out;
  }
  // Lettering stacked over another line of the page, closer than a line can be set (a label over
  // an equation's arrow: "constructor", "cell", "programmable constructor"), and the short rows
  // stacked on such a label ("program", "⇓"); never a line starting at the column's margin.
  // Indices into rows.
  function stackedLabels(rows, body, left) {
    const out = new Set();
    const inset = r => { const m = left(r.col) ?? Math.min(...rows.map(o => o.x)); return r.x - m > body.size * 2 };
    const short = r => r.words <= 4 && r.chars <= 40 && r.size < body.size * 1.15 && inset(r);
    const overlaps = (a, b) => a.x < b.x2 && a.x2 > b.x && a.col === b.col;
    rows.forEach((r, i) => {
      if (!short(r)) return;
      const tight = Math.min(r.size, body.size) * 0.95;
      if (rows.some((o, j) => j !== i && !short(o) && overlaps(r, o) && Math.abs(o.y - r.y) >= Math.max(2, body.size * 0.3) && Math.abs(o.y - r.y) < tight)) out.add(i);
    });
    // Upwards from each label: short rows set close above it, over the same line.
    for (let pass = 0; pass < 4; pass++) {
      rows.forEach((r, i) => {
        if (out.has(i) || !short(r)) return;
        if (rows.some((o, j) => out.has(j) && overlaps(r, o) && r.y > o.y && r.y - o.y < body.size * 1.4)) out.add(i);
      });
    }
    return out;
  }
  // The left margin of each column on a page: where most of its body-size lines start.
  function columnLeft(rows, body) {
    const by = new Map();
    for (const r of rows) {
      if (Math.abs(r.size - body.size) > body.size * 0.1 || r.words < 6) continue;
      const k = String(r.col), x = Math.round(r.x);
      if (!by.has(k)) by.set(k, new Map());
      by.get(k).set(x, (by.get(k).get(x) || 0) + 1);
    }
    const out = new Map();
    for (const [k, xs] of by) out.set(k, Number([...xs].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]));
    return col => out.get(String(col));
  }
  // A cell of a table or a label of a diagram beside its caption: off the column's margin, under
  // or over the caption's width, a few words, not a sentence, not a heading.
  function isCell(r, caption, left, body) {
    if (!r || r.figure || r.kind === 'heading' || r.kind === 'foot' || r.kind === 'figure' || r.col !== caption.col) return false;
    const margin = left(r.col), reach = body.size * 4;
    return margin != null && r.x - margin > body.size * 2 && r.words <= 6 && !/[.?!,]["”’)]?$/.test(r.text)
      && r.x < caption.x2 + reach && r.x2 > caption.x - reach;
  }
  // A numbered section heading ("1.1 Construction tasks", "2. Motivations") set apart from the
  // body by its face or size: a short line that is not a sentence.
  function subheading(r, body, p) {
    if (!SECTION.test(r.text) || r.words > 12 || /[.,;:]$/.test(r.text)) return false;
    if (r.font === body.font && Math.abs(r.size - body.size) < body.size * 0.08) return false;
    if (r.x2 - r.x > (p.w || 612) * 0.6) return false;
    return S().headingLike(r);
  }

  /* ---------- Crops: formulas, figures and tables as pictures of the page ---------- */
  // A row's place on its page, in page fractions from the top left (as pdf-regions.js gives regions).
  const rowBox = (p, r) => {
    const x0 = p.x0 || 0, w = p.w || 612, top = (p.y0 || 0) + (p.h || 792);
    return { l: (r.x - x0) / w, r: (r.x2 - x0) / w, cy: (top - r.y - r.size * 0.3) / (p.h || 792) };
  };
  const within = (q, b, grow = 0) => q.cy >= b.y - grow && q.cy <= b.y + b.h + grow && (Math.min(q.r, b.x + b.w) - Math.max(q.l, b.x)) >= Math.max(0.0001, (q.r - q.l) * 0.5);
  // Running text: a body-size line of eight words or more, mostly letters.
  const prose = (r, body) => r.words >= 8 && Math.abs(r.size - body.size) <= body.size * 0.12 && (r.text.match(/\p{L}/gu) || []).length >= r.text.replace(/\s/g, '').length * 0.7;
  // A page's regions (p.regions: pdf-regions.js pageRegions, with each crop's `id` and drawn size),
  // checked against its text: a figure or a table holding three lines of running text, or a formula
  // holding two, is not taken (findFigures read a page of prose as ink): its text stays text. The
  // rows each one holds become its `alt` (what the companion and a search read where it stands), those
  // in its caption's box its caption, and both leave the running text.
  // -> { rows: the page's rows left, pictures: one line for each region, where its top sits }
  function picturesOf(p, body, keep = () => false) {
    const regions = (p.regions || []).filter(g => g && g.id && g.w > 0 && g.h > 0);
    if (!regions.length) return { rows: p.rows, pictures: [] };
    const boxes = p.rows.map(r => rowBox(p, r));
    const taken = new Set(), pictures = [];
    for (const g of regions) {
      const inside = [], inCaption = [];
      p.rows.forEach((r, i) => {
        // A chapter's title set over a picture stays text: the chapter starts at it (31 Oct 2026).
        if (taken.has(i) || keep(p, r)) return;
        if (g.captionBox && within(boxes[i], g.captionBox)) inCaption.push(i);
        else if (within(boxes[i], g)) inside.push(i);
      });
      const running = inside.filter(i => prose(p.rows[i], body)).length;
      if (running >= (g.kind === 'equation' ? 2 : 3)) continue;
      for (const i of [...inside, ...inCaption]) taken.add(i);
      const text = list => clean(list.map(i => p.rows[i].text).join(' ').replace(BRACKET_PIECES, ' '));
      const x0 = p.x0 || 0, w = p.w || 612, top = (p.y0 || 0) + (p.h || 792);
      pictures.push({
        figure: { ...g, alt: text(inside), caption: text(inCaption) || g.caption || '' },
        x: x0 + g.x * w, x2: x0 + (g.x + g.w) * w, y: top - g.y * (p.h || 792), size: body.size, words: 0, chars: 999, text: FIGURE_MARK + g.id, font: null,
      });
    }
    return { rows: p.rows.filter((r, i) => !taken.has(i)), pictures };
  }
  const FIGURE_MARK = '\uFFFC';
  // "(1)", "(2.3)": the number a formula is set with, to name it.
  const EQUATION_TAG = /\((\d{1,3}(?:\.\d{1,3})?[a-z]?)\)(?!.*\(\d)/;
  function figureOf(g, number) {
    const tag = g.kind === 'equation' ? EQUATION_TAG.exec(g.alt || '') : null;
    const label = g.label || (g.kind === 'equation' ? (tag ? `Equation (${tag[1]})` : 'Equation') : 'Figure');
    return {
      id: g.id, number, src: 'asset:' + g.id, label,
      ...(g.caption ? { caption: g.caption } : {}),
      ...(g.alt ? { alt: g.alt } : {}),
      ...(g.css?.width > 0 && g.css?.height > 0 ? { width: Math.round(g.css.width), height: Math.round(g.css.height) } : {}),
      fit: g.kind === 'equation' ? 'text' : 'column',
      kind: g.kind,
    };
  }

  /* ---------- Lines to paragraphs ---------- */
  const wordCount = text => text.split(/\s+/).filter(Boolean).length;
  // Words printed with a hyphen inside a line ("self-evident"), lower case: a word broken at a
  // line end in the same place keeps its hyphen.
  // A short first part the document sets with a hyphen in two words or more ("non-zero",
  // "non-residual") is a prefix it hyphenates: "non-" + "existence" keeps its hyphen too.
  function hyphenatedWords(lines) {
    const out = new Set(), firsts = new Map();
    for (const l of lines) for (const m of l.text.matchAll(/\p{L}+-\p{L}+/gu)) {
      const word = m[0].toLowerCase();
      if (out.has(word)) continue;
      out.add(word);
      const first = word.slice(0, word.indexOf('-'));
      if (first.length <= 5) firsts.set(first, (firsts.get(first) || 0) + 1);
    }
    out.prefixes = new Set([...firsts].filter(([, n]) => n >= 2).map(([first]) => first));
    return out;
  }
  // Join a line onto the text before it: a word broken at the line end is joined (keeping its
  // hyphen when the hyphenated word stands elsewhere), else a space between.
  // OCR reads an exclamation mark as the figure one ("Good heavens 1 I cried", "Oh, you 1 Here"): after a word, before a
  // capital or a quotation mark, on a scan (30 Oct 2026 corpus). Not after a word that counts ("Chapter 1 The Cyclone").
  const COUNTED = /\b(?:chapter|chap|part|book|act|scene|vol|volume|no|page|p|pp|figure|fig|table|section|sect|number|stave|canto|plate|verse|psalm|line|note|step|item|edition|ed)\.?$/i;
  // A caret is no mark of a book: OCR makes it of a picture's initial ("'T^HE extract", "follow -^ the course"; Hound).
  // So it reads a question mark as "V" and an exclamation mark as "l" too ("that is not mad V Nevertheless", Sartor Resartus).
  const MARK = { 1: '!', l: '!', V: '?' };
  const bang = (text, ocr) => !ocr ? text : text.replace(/(\p{Ll}) (1|(?<=\p{L}{3} )[lV])(?= [\p{Lu}"“‘'])/gu, (m, w, mark, at, s) => COUNTED.test(s.slice(0, at + w.length)) ? m : w + MARK[mark])
    .replace(/(?<=\p{L})\^+(?=\p{L})/gu, '').replace(/(^|\s)[^\s\p{L}\p{N}]*\^[^\s\p{L}\p{N}]*(?=\s|$)/gu, '$1').replace(/\s{2,}/g, ' ').trim();
  const bangEnd = (text, next) => /\p{Ll} 1$|\p{L}{2}\p{Ll} [lV]$/u.test(text) && /^[\p{Lu}"“‘']/u.test(next) && !COUNTED.test(text.slice(0, -2)) ? text.slice(0, -2) + MARK[text.slice(-1)] : text;
  function joinLine(text, next, hyphenated, ocr = false) {
    if (ocr) text = bangEnd(text, next);
    if (/\p{L}­$/u.test(text) && /^\p{L}/u.test(next)) return text.slice(0, -1) + next;
    const broken = text.match(/(\p{L}+)-$/u);
    if (broken && /^\p{Ll}/u.test(next)) {
      const rest = next.match(/^\p{L}+/u)[0];
      const keep = hyphenated.has((broken[1] + '-' + rest).toLowerCase()) || !!hyphenated.prefixes?.has(broken[1].toLowerCase());
      return keep ? text + next : text.slice(0, -1) + next;
    }
    return text + ' ' + next;
  }
  const clean = text => text.replace(/­/g, '').replace(/\s+/g, ' ').trim();

  // Column geometry per page and column: where its lines start and end, its line pitch, a hanging
  // indent (`hang`: a reference list's entries), and its justified blocks set in from the margin.
  function geometry(lines) {
    const by = new Map();
    for (const l of lines) {
      if (l.kind !== 'body') continue;
      const k = l.n + '|' + l.col;
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(l);
    }
    const out = new Map();
    let carry = null;
    for (const [k, list] of by) {
      const gaps = [];
      for (let i = 1; i < list.length; i++) { const g = list[i - 1].y - list[i].y; if (g > 0 && g < list[i].size * 3) gaps.push(g) }
      const left = Math.min(...list.map(l => l.x)), right = Math.max(...list.map(l => l.x2));
      let hang = hangOf(list, left, right);
      // A list running on from the page or column before: its entries at the top belong to it.
      if (carry && (!hang || Math.abs(hang.d - carry) <= 1)) {
        hang ??= { d: carry, lines: new Set() };
        for (const l of list) { if (!(atMargin(l, left) || Math.abs(l.x - left - hang.d) <= 1)) break; if (hang.lines.has(l)) break; hang.lines.add(l) }
      }
      carry = hang && hang.lines.has(list.at(-1)) ? hang.d : null;
      out.set(k, { left, right, pitch: median(gaps) || list[0].size * 1.3, hang, blocks: blocksOf(list, left) });
    }
    return out;
  }
  const atMargin = (l, left) => l.x - left <= l.size * 0.5;
  // A hanging indent: lines at the margin followed by lines set in by the same amount, at least
  // three times, where the line at the margin runs on (not the short last line of a paragraph, as
  // before a book's indented first lines). The lines it holds, from its first entry on: { d, lines }, or null.
  function hangOf(list, left, right) {
    const by = new Map();
    for (let i = 1; i < list.length; i++) {
      const m = list[i - 1], l = list[i];
      if (!atMargin(m, left) || l.x - left <= l.size || l.x - left > l.size * 4) continue;
      const d = Math.round(l.x - left), ends = m.x2 - m.x < (right - left) * 0.8 && TERMINAL.test(m.text);
      const n = by.get(d) || { runs: 0, all: 0, sentences: 0, from: i - 1 };
      n.all++; if (!ends) n.runs++; if (TERMINAL.test(m.text)) n.sentences++;
      by.set(d, n);
    }
    // Paragraphs indented on their first line follow a line ending a sentence, even one set full to a justified
    // column's edge; a list's entries mostly run on from their first line (ResNet, 29 Oct 2026: its indented
    // paragraphs read as a hanging indent, a paragraph a line).
    // The list ends with its last line set in: prose below a bulleted list is no list (Intel SDM, 30 Oct 2026).
    for (const [d, n] of by) {
      if (!(n.runs >= 3 && n.runs >= n.all * 0.67 && n.sentences < n.all * 0.9)) continue;
      let to = list.length - 1;
      while (to > n.from && Math.round(list[to].x - left) !== d) to--;
      return { d, lines: new Set(list.slice(n.from, to + 1)) };
    }
    return null;
  }
  // Justified blocks set in from the margin (an abstract, a long quotation): three lines or more
  // starting at the same place, those before the last ending together. Each line -> its block's right edge.
  function blocksOf(list, left) {
    const out = new Map();
    let run = [];
    const close = () => {
      if (run.length >= 3) {
        const body = run.slice(0, -1), edge = Math.max(...body.map(l => l.x2));
        const flush = body.filter(l => edge - l.x2 <= 2).length;
        if (flush >= 2 && flush >= body.length * 0.7) for (const l of run) out.set(l, edge);
      }
      run = [];
    };
    for (const l of list) {
      if (l.x - left > l.size && run.length && Math.abs(l.x - run[0].x) <= 1) run.push(l);
      else { close(); if (l.x - left > l.size) run.push(l) }
    }
    close();
    return out;
  }

  // Paragraphs of one chapter's lines: [{ text, kind, page, breaks: [[word, page]] }] and its notes.
  function paragraphsOf(lines, geo, hyphenated, indents, scanned = lines.some(l => l.ocr)) {
    const paras = [], notes = [];
    let cur = null, prev = null, note = null;
    const waiting = [];
    const flush = () => { if (cur) paras.push(cur); paras.push(...waiting.splice(0)); cur = null; prev = null };
    for (const l of lines) {
      // A figure set inside a paragraph's run (at the top of the next column, "have also" | Figure 1 |
      // "greatly benefited") waits until the paragraph ends (29 Oct 2026).
      if (l.kind === 'figure') { const fig = { text: l.text, kind: null, page: l.n, breaks: [], figure: l.figure }; if (cur && cur.kind !== 'heading' && l.figure?.kind !== 'equation') waiting.push(fig); else { flush(); paras.push(fig) } continue }
      if (l.kind === 'foot') {
        if (!note || FOOTNOTE_MARK.test(l.text) || l.n !== note.last.n) { if (note) notes.push(note); note = { text: l.text, page: l.n, breaks: [], last: l } }
        else { note.text = joinLine(note.text, l.text, hyphenated); note.last = l }
        continue;
      }
      if (l.kind === 'heading') {
        if (cur?.kind === 'heading' && prev && prev.n === l.n && prev.y - l.y < l.size * 1.8 && Math.abs(prev.size - l.size) < 0.6) { cur.text = joinLine(cur.text, l.text, hyphenated); prev = l; continue }
        flush();
        cur = { text: l.text, kind: 'heading', page: l.n, breaks: [] }; prev = l;
        continue;
      }
      const g = geo.get(l.n + '|' + l.col) || { left: l.x, right: l.x2, pitch: l.size * 1.3 };
      const indented = l.x - g.left > l.size * 1.0;
      let fresh = !cur || cur.kind === 'heading';
      if (!fresh) {
        if (prev.n === l.n && prev.col === l.col) {
          const pg = geo.get(prev.n + '|' + prev.col) || g;
          // In a justified block set in from the margin (an abstract), a line is short against the block.
          const edge = g.blocks.get(l) !== undefined && g.blocks.get(l) === g.blocks.get(prev) ? g.blocks.get(l) : null;
          const short = edge != null ? prev.x2 < edge - (edge - prev.x) * 0.2 : prev.x2 - prev.x < (pg.right - pg.left) * 0.8;
          const gap = prev.y - l.y > g.pitch * 1.5, ends = short && TERMINAL.test(prev.text);
          // Set in further than the line before: a first line, a display, a quotation.
          // On a scan the lines beside a drop cap step in by its width, the first by a little less ("IR HENRY BASKERVILLE and" |
          // "Dr. Mortimer were ready"; Hound): a line stepping in from one already set in runs on.
          const stepIn = l.x - prev.x > l.size * 1.0 && !(scanned && prev.x - g.left > prev.size);
          if (g.hang?.lines.has(l)) fresh = gap || atMargin(l, g.left) || l.x - (g.left + g.hang.d) > l.size;
          else if (edge != null) fresh = gap || stepIn || ends;
          // On a scan a line set in after one set in that runs on (the lines beside a drop cap) is the same paragraph.
          else fresh = gap || (indented && !(scanned && prev.x - g.left > prev.size && l.x >= prev.x - l.size * 0.5 && !TERMINAL.test(prev.text) && prev.x2 - prev.x >= (pg.right - pg.left) * 0.5)) || stepIn || ends;
        } else {
          // Onto the next column or page.
          const runsOn = /^\p{Ll}/u.test(l.text) || !TERMINAL.test(prev.text);
          const pg = geo.get(prev.n + '|' + prev.col) || g;
          const full = prev.x2 - prev.x >= (pg.right - pg.left) * 0.8;
          // In a reference list, an entry starts at the margin; its indented lines run on.
          fresh = g.hang?.lines.has(l) ? atMargin(l, g.left) : !(runsOn || (indents && full && !indented));
        }
      }
      // A line starting in lower case after one that does not end a sentence, or ends in a broken word, runs
      // on: OCR jitters the left margin and sets a hyphen's second half in from it ("re-" | "gards", 30 Oct
      // 2026 corpus). On a born-digital page only after a full line, so table cells and code stay apart; never
      // after a dot leader, which ends a form field or a contents entry ("box 1 ..... 1a" | "b Household").
      if (fresh && cur && cur.kind !== 'heading' && prev && /^\p{Ll}/u.test(l.text) && !/\.{4,}/.test(prev.text)
        && (!TERMINAL.test(prev.text) || /\p{L}-$/u.test(prev.text))) {
        const pg = geo.get(prev.n + '|' + prev.col) || g;
        const fullPrev = prev.x2 - prev.x >= (pg.right - pg.left) * 0.8 && prev.words >= 5;
        const tooFar = prev.n === l.n && prev.col === l.col && prev.y - l.y > g.pitch * 2.2;
        if ((scanned || fullPrev) && !tooFar) fresh = false;
      }
      // A line opening with a bullet is a list item of its own ("• Pentium® processors" | "• P6 family processors").
      if (!fresh && cur && cur.kind !== 'heading' && /^[•▪◦‣●■□–]\s/u.test(l.text) && /^[•▪◦‣●■□–]\s/u.test(cur.text)) fresh = true;
      if (fresh) {
        flush();
        cur = { text: l.text, kind: null, page: l.n, breaks: [], inset: scanned && l.x - g.left > l.size * 1.5 };
        // Where a drop cap would stand: from the margin to the set-in lines, from above the first to below the last of them.
        if (cur.inset) cur.cap = { n: l.n, x0: g.left - l.size * 0.4, x1: l.x - l.size * 0.15, top: l.y + l.size * 1.6, bottom: l.y - l.size * 0.4, size: l.size };
        prev = l; continue;
      }
      if (l.n !== prev.n) cur.breaks.push([wordCount(clean(cur.text)), l.n]);
      cur.text = joinLine(cur.text, l.text, hyphenated, scanned);
      // A drop cap's paragraph: its first lines set in from the margin, the rest at it (restoreDropCaps).
      if (cur.inset && atMargin(l, g.left)) cur.margin = true;
      else if (cur.cap && !cur.margin && l.n === cur.cap.n && l.x - g.left > l.size * 1.5) cur.cap.bottom = Math.min(cur.cap.bottom, l.y - l.size * 0.4);
      prev = l;
    }
    flush();
    if (note) notes.push(note);
    // OCR's "1" for "!" closing a paragraph ("Good heavens 1").
    const done = p => ({ text: clean(scanned && !p.kind ? p.text.replace(/(\p{Ll}) (1|(?<=\p{L}{3} )[lV])$/u, (m, w, mark) => COUNTED.test(p.text.slice(0, -2)) ? m : w + MARK[mark]) : p.text), kind: p.kind, page: p.page, breaks: p.breaks, ...(p.figure ? { figure: p.figure } : {}), ...(p.inset && p.margin ? { dropCap: true, cap: p.cap } : {}) });
    return { paras: paras.map(done).filter(p => p.text), notes: notes.map(done).filter(p => p.text) };
  }

  /* ---------- Chapters ---------- */
  // The scan's entries that start chapters: leaves (a part with chapters under it is not one), by page.
  function chapterEntries(scan) {
    const entries = (scan?.entries || []).filter(e => e && typeof e.label === 'string' && Number.isInteger(e.page));
    return entries.filter(e => e.kind !== 'part' || !entries.some(c => c.parent === e.id)).sort((a, b) => a.page - b.page);
  }
  // Where each chapter starts in the lines: at its title on its page (the title lines are the
  // chapter's title, not its text), else at the page's first line.
  // A title's letters and figures, its label's numeral as a number: "CHAPTER IV." and "Chapter 4" (the house style
  // a scan's entries are shown in, pdfEdition.ts houseStyledScan) are one title.
  const LABEL_WORD = /\b(chapter|chap|book|part|act|canto|stave)\.?\s+([ivxlc]{1,7})\b/gi;
  const romanNumber = r => { const v = { i: 1, v: 5, x: 10, l: 50, c: 100 }; let t = 0, prev = 0; for (const ch of r.toLowerCase().split('').reverse()) { const n = v[ch] || 0; t += n < prev ? -n : n; prev = Math.max(prev, n) } return t };
  const canon = t => norm(String(t || '').replace(LABEL_WORD, (m, w, r) => `${w} ${romanNumber(r)}`));
  // A short label the scan misread ("CHABTEB VI." for the entry "Chapter 6"): its number and its look agree.
  function sameLabel(text, label) {
    const a = /^\s*(\S{4,9})\s+([IVXLCHUnmi]{1,7}|\d{1,3})[.,]?\s*$/.exec(String(text)), b = /^\s*(chapter|chap\.?)\s+([IVXLC]{1,7}|\d{1,3})\.?\s*$/i.exec(String(label));
    if (!a || !b) return false;
    // As OCR misreads numerals: "L" for I, "in" for III.
    const num = x => /^\d+$/.test(x) ? Number(x) : romanNumber(x.replace(/[Ll1|]/g, 'I').replace(/[HUn]/g, 'II').replace(/m/g, 'III').replace(/i/g, 'I'));
    return num(a[2]) === num(b[2]) && /^c/i.test(a[1]) && [...'hapter'].filter(c => a[1].toLowerCase().includes(c)).length >= 3;
  }
  // Whether a line is an entry's title as its page prints it: the same letters and figures, the label's numeral as a number
  // ("1 — The River Bank" | "THE RIVER BANK"), a misread label ("CHABTEB VI."), or on a scan nearly the same letters
  // ("Baskeryille" | "BASKERVILLE", 31 Oct 2026).
  const LABEL_ONLY = /^(?:chapter|chap\.?|book|part|act|stave|canto)[\s.:,]+[IVXLCJl\d]{1,7}[.:,]?$/i;
  function titleOf(label) {
    const want = canon(label), named = canon(String(label).replace(/^\s*(?:\d{1,3}|[IVXLC]{1,7})\s*(?:[.—–:-]\s*)/i, ''));
    return { want, named };
  }
  // whole: the text is two lines joined, so only the whole title counts (a paragraph's last line before a heading is not its title).
  function matchesTitle(text, label, { want, named }, scanned, whole = false) {
    const one = canon(text);
    if (!one || !want) return false;
    if (want === one || (named.length >= 4 && named !== want && named === one)) return true;
    if (!whole && (sameLabel(text, label) || (want.endsWith(one) && one.length >= 4 && want.length - one.length <= 4) || (one.endsWith(want) && want.length >= 4))) return true;
    const alike = (a, b) => a.length >= 6 && b.length >= 6 && Math.abs(a.length - b.length) <= 3 && S().likeness(a, b) >= (a.length >= 12 && b.length >= 12 ? 0.72 : 0.8);
    return scanned && (alike(one, want) || (named.length >= 6 && alike(one, named)));
  }
  function splitChapters(lines, scan, pageCount, scanned = lines.some(l => l.ocr)) {
    const entries = chapterEntries(scan);
    const out = [];
    if (!entries.length) {
      const title = scan?.title || '';
      for (let from = 1; from <= pageCount; from += CHAPTER_PAGES) {
        const to = Math.min(pageCount, from + CHAPTER_PAGES - 1);
        out.push({ title: pageCount <= CHAPTER_PAGES && title ? title : `Pages ${from}–${to}`, lines: lines.filter(l => l.n >= from && l.n <= to) });
      }
      return out;
    }
    const starts = [];
    let at = 0;
    for (const e of entries) {
      let i = lines.findIndex((l, k) => k >= at && l.n >= e.page);
      if (i < 0) i = lines.length;
      const title = titleOf(e.label), { want, named } = title;
      const skip = new Set();
      // The title as printed on its page (over one or two lines): a heading first, else any line.
      const from = i;
      find: for (const headingOnly of [true, false]) {
        // A heading anywhere on its page (a two-column page's second column starts past line 40: ResNet's
        // "2. Related Work", 29 Oct 2026); any other line only near the top.
        for (let k = from; k < lines.length && lines[k].n === e.page && (headingOnly || k < from + 40); k++) {
          if (headingOnly && lines[k].kind !== 'heading') continue;
          const one = canon(lines[k].text), two = k + 1 < lines.length && lines[k + 1].n === e.page ? one + canon(lines[k + 1].text) : one;
          if (!one || !want) continue;
          if (matchesTitle(lines[k].text, e.label, title, scanned)) { i = k; skip.add(k); break find }
          if (want === two || (two !== one && matchesTitle(lines[k].text + ' ' + lines[k + 1].text, e.label, title, scanned, true))) { i = k; skip.add(k); skip.add(k + 1); break find }
        }
      }
      // The chapter's label line just above its title ("CHAPTER IV" | "SIR HENRY BASKERVILLE") is the title's too: the reader's
      // house style numbers the title itself (31 Oct 2026).
      if (skip.size) for (let k = Math.max(from, i - 2); k < i; k++) if (lines[k].n === e.page && lines[k].words <= 3 && LABEL_ONLY.test(lines[k].text.trim().replace(/,$/, '.'))) skip.add(k);
      // A label line opening the chapter whose title was not found on the page is the title's stand-in, not its first words.
      if (!skip.size && i < lines.length && lines[i].n === e.page && lines[i].words <= 3 && LABEL_ONLY.test(lines[i].text.trim().replace(/,$/, '.'))) skip.add(i);
      // On a scan whose title could not be matched (hand lettering OCR read as marks: Oz's "CKb^pter" | "TKe Cyclorve"), the
      // heading lines the page opens with are that title, not text.
      if (scanned && !skip.size) for (let k = i; k < Math.min(lines.length, i + 4) && lines[k].n === e.page && lines[k].words <= 12 && (lines[k].kind === 'heading' || (lines[k].words <= 3 && !/\p{Ll}/u.test(lines[k].text))); k++) if (lines[k].kind === 'heading') skip.add(k);
      // The title printed again on the chapter's first pages (a half-title, then its opening page) is the title too.
      for (let k = i + 1; scanned && k < lines.length && lines[k].n <= e.page + 3; k++) {
        const t = canon(lines[k].text);
        if (lines[k].words <= 12 && t.length >= 4 && (t === want || t === named)) skip.add(k);
      }
      // On a scan the chapter starts at its label line just above the title, so the chapter before does not end on it
      // ("CHAPTER II" closing chapter I of The Hound of the Baskervilles, 31 Oct 2026 corpus).
      if (scanned && skip.size) { const label = Math.min(...skip); if (label < i && label >= i - 2) i = label }
      starts.push({ e, i, skip });
      at = i;
    }
    // An entry not found on its page (a contents line, "7.6. Algorithms 67") gives way to a later entry found there:
    // the lines above that one's title stay with the chapter before.
    for (let k = starts.length - 2; k >= 0; k--) {
      const s = starts[k], next = starts[k + 1];
      if (!s.skip.size && next.skip.size && next.e.page === s.e.page) s.i = next.i;
    }
    // Text before the first chapter (a preface without an entry) is a chapter under the book's title. On a scan its
    // pages of little text leave it (a title page, a half-title, a library's inscriptions and their pictures: the
    // reader shows the title and author above the text; Three Men in a Boat, 30 Oct 2026 corpus).
    // Whether the book is a scan is the whole book's (a sparse front page is too short for the word-box test).
    const before = lines.slice(0, starts[0].i);
    const wordsOn = new Map();
    for (const l of before) if (l.kind !== 'figure') wordsOn.set(l.n, (wordsOn.get(l.n) || 0) + l.words);
    // A page of prose: two lines or more of six words or more, mostly in lower case (a bookplate's capitals are none).
    const proseLines = new Map();
    for (const l of before) {
      const letters = (l.text.match(/\p{L}/gu) || []).length, lower = (l.text.match(/\p{Ll}/gu) || []).length;
      if (l.kind !== 'figure' && l.words >= 6 && lower >= letters * 0.6) proseLines.set(l.n, (proseLines.get(l.n) || 0) + 1);
    }
    const prose = new Set([...proseLines].filter(([, k]) => k >= 2).map(([n]) => n));
    const leadLines = scanned ? before.filter(l => (wordsOn.get(l.n) || 0) >= 40 && prose.has(l.n)) : before;
    const lead = leadLines.filter(l => l.kind === 'body');
    if (lead.length && lead.reduce((n, l) => n + l.words, 0) >= 20) out.push({ title: scan.title || '', lines: leadLines, lead: true });
    starts.forEach((s, k) => {
      const end = k + 1 < starts.length ? starts[k + 1].i : lines.length;
      out.push({ title: s.e.label, lines: lines.slice(s.i, end).filter((l, j) => !s.skip.has(s.i + j)) });
    });
    return out;
  }

  /* ---------- A drop cap read from the page ---------- */
  // Where the device can draw the page (convert's options.pixels), the picture beside a drop-cap paragraph's first lines is
  // matched against the capitals A–Z of ten book faces (Liberation Serif, FreeSerif, DejaVu Serif, Charter and Caladea,
  // regular and bold), each drawn in a 12 × 12 box: its shape and its width against its height. A plain capital reads at once ("W" for
  // "E spent two very pleasant days" in Three Men in a Boat, "M" for "R. SHERLOCK HOLMES"); an ornamented one (Pride and
  // Prejudice's) matches no face well and is left to the book's words (31 Oct 2026 corpus).
  // Per face and letter: one byte of width to height (× 50), then 144 cells of ink, 0–9, two to a byte.
  const CAP_FACES = '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';
  const CAP_GRID = 12;
  let capTemplates = null;
  function capFaces() {
    if (capTemplates) return capTemplates;
    const raw = typeof atob === 'function' ? atob(CAP_FACES) : Buffer.from(CAP_FACES, 'base64').toString('binary');
    const size = 1 + CAP_GRID * CAP_GRID / 2, out = [];
    for (let at = 0, k = 0; at + size <= raw.length; at += size, k++) {
      const cells = new Float64Array(CAP_GRID * CAP_GRID);
      for (let i = 0; i < CAP_GRID * CAP_GRID / 2; i++) { const b = raw.charCodeAt(at + 1 + i); cells[2 * i] = b >> 4; cells[2 * i + 1] = b & 15 }
      out.push({ letter: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[k % 26], aspect: raw.charCodeAt(at) / 50, cells });
    }
    return (capTemplates = out);
  }
  const correlation = (a, b) => {
    let ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) { ma += a[i]; mb += b[i] }
    ma /= a.length; mb /= b.length;
    let n = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2 }
    return n / Math.sqrt(da * db || 1);
  };
  // image: { width, height, data } in grey (0 black–255 white, one byte a pixel); size: a text line's size in its pixels.
  // -> { letter, score, next } (next: the second letter's score), or null where no shape a line and a half tall stands.
  function readCap(image, size) {
    const { width: w, height: h, data: d } = image;
    if (!w || !h || d.length < w * h) return null;
    // Ink: darker than Otsu's threshold between paper and print.
    const hist = new Array(256).fill(0);
    for (let i = 0; i < w * h; i++) hist[d[i]]++;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sB = 0, wB = 0, best = 0, th = 128;
    for (let t = 0; t < 256; t++) {
      wB += hist[t]; if (!wB) continue;
      const wF = w * h - wB; if (!wF) break;
      sB += t * hist[t];
      const v = wB * wF * (sB / wB - (sum - sB) / wF) ** 2;
      if (v > best) { best = v; th = t }
    }
    const ink = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) ink[i] = d[i] <= th ? 1 : 0;
    // The capital: the largest shape at least a line and a half tall, with the specks inside its box.
    const label = new Int32Array(w * h).fill(-1), shapes = [];
    for (let i = 0; i < w * h; i++) {
      if (!ink[i] || label[i] >= 0) continue;
      const stack = [i], s = { x0: w, y0: h, x1: -1, y1: -1, n: 0 };
      label[i] = shapes.length;
      while (stack.length) {
        const j = stack.pop(), x = j % w, y = (j / w) | 0;
        s.n++; if (x < s.x0) s.x0 = x; if (x > s.x1) s.x1 = x; if (y < s.y0) s.y0 = y; if (y > s.y1) s.y1 = y;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
          const q = Y * w + X;
          if (ink[q] && label[q] < 0) { label[q] = shapes.length; stack.push(q) }
        }
      }
      shapes.push(s);
    }
    const tall = shapes.filter(s => s.y1 - s.y0 + 1 >= size * 1.4).sort((a, b) => b.n - a.n)[0];
    if (!tall) return null;
    const box = { ...tall };
    for (const s of shapes) if (s !== tall && s.x0 >= box.x0 - 2 && s.x1 <= box.x1 + 2 && s.y0 >= box.y0 - 2 && s.y1 <= box.y1 + 2) {
      box.x0 = Math.min(box.x0, s.x0); box.x1 = Math.max(box.x1, s.x1); box.y0 = Math.min(box.y0, s.y0); box.y1 = Math.max(box.y1, s.y1);
    }
    const bw = box.x1 - box.x0 + 1, bh = box.y1 - box.y0 + 1, m = Math.max(bw, bh), step = m / CAP_GRID, ox = (m - bw) / 2, oy = (m - bh) / 2;
    const cells = new Float64Array(CAP_GRID * CAP_GRID);
    for (let j = 0; j < CAP_GRID; j++) for (let i = 0; i < CAP_GRID; i++) {
      let on = 0, all = 0;
      const ya = Math.floor(j * step), yb = Math.max(ya + 1, Math.floor((j + 1) * step)), xa = Math.floor(i * step), xb = Math.max(xa + 1, Math.floor((i + 1) * step));
      for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) {
        const X = Math.round(box.x0 - ox + x), Y = Math.round(box.y0 - oy + y);
        all++;
        if (X >= box.x0 && X <= box.x1 && Y >= box.y0 && Y <= box.y1 && ink[Y * w + X]) on++;
      }
      cells[j * CAP_GRID + i] = 9 * on / Math.max(1, all);
    }
    const aspect = bw / bh, score = new Map();
    for (const t of capFaces()) {
      const v = correlation(cells, t.cells) - 0.5 * Math.abs(Math.log(aspect / t.aspect));
      if (!score.has(t.letter) || v > score.get(t.letter)) score.set(t.letter, v);
    }
    const ranked = [...score].sort((a, b) => b[1] - a[1]);
    return { letter: ranked[0][0], score: ranked[0][1], next: ranked[1][1] };
  }
  // A capital read clearly: like one face's letter, and plainly more than like any other letter.
  const clearCap = r => !!r && r.score >= 0.75 && r.score - r.next >= 0.25;
  const capKey = cap => cap.n + '|' + Math.round(cap.x0) + '|' + Math.round(cap.top);

  // A scan's drop cap is a picture the OCR does not read: a chapter's first paragraph opens on capitals that are
  // no word ("HEN we discussed", "R. SHERLOCK HOLMES"), maybe after a stray mark ("‘HEN"). The letter that makes
  // the book's word four times more common than the capitals as they stand goes back (Pride and Prejudice,
  // Three Men in a Boat, 30 Oct 2026 corpus). A short line ("ACT I.") or a roman number is left alone.
  // The paragraph is a chapter's first two, the first after a heading inside it ("PREFACE," | "HE chief beauty"), or one
  // whose first lines are set in from the margin and the rest at it (the drop cap's room; a synopsis may come before it:
  // Three Men in a Boat). The letter is the one making the commonest word read with the word after ("SO far", not "TO far"),
  // or where the pairs are silent, the commonest word; a word in its own right ("HE") is left when no pair tells.
  // The marks OCR made of the picture before the capitals ("'[7^ ROM this point") go with it.
  // letters: the capitals read from the page (readCap), by capKey; asks: where a capital could be read, for convert to draw.
  // A capital read clearly picks the letter among those the book's words allow; and where the drop cap took the whole first
  // word ("is a truth universally acknowledged" under an "I"; "no objection was made" under an "A"), the word the book most
  // often reads before the first word left, beginning with that letter, goes back.
  function restoreDropCaps(paras, vocab, pairs = new Map(), letters = null, asks = null) {
    for (let k = 0, seen = 0; k < paras.length; k++) {
      const p = paras[k];
      if (p.kind === 'heading' || p.figure) continue;
      const prev = paras[k - 1], headed = prev && (prev.kind === 'heading' || (wordCount(prev.text) <= 3 && !/\p{Ll}/u.test(prev.text)));
      if (seen++ >= 4 && !headed && !p.dropCap) continue;
      // The initial read as a letter of its own ("S O, on the following evening"): one word with the capitals after it.
      p.text = p.text.replace(/^([^\p{L}]*)([A-Z]) ([A-Z]{1,11})(?=[.,;:'’]?\s)/u, (m0, junk, a, b) => (vocab.get((a + b).toLowerCase()) || 0) >= 3 ? junk + a + b : m0);
      const m = /^([^\p{L}]*)(?:[a-z](?=[A-Z]{2}))?([A-Z]{1,12})((?:['’]S)?[.,;:'’]?)(\s+)(\p{L}+)?/u.exec(p.text);
      // A capital is drawn and read only at a chapter's opening (after a synopsis too: Three Men in a Boat's runs over a few
      // paragraphs), and only where it would tell: the text opens in lower case, or on capitals a letter in front of would make
      // a word of the book's (each drawing costs a phone a page drawn).
      const opening = headed || seen <= 2 || (p.dropCap && seen <= 8);
      const lower = /^\p{Ll}/u.test(p.text), tells = lower || (!!m && [...'abcdefghijklmnopqrstuvwxyz'].some(L => (vocab.get(L + m[2].toLowerCase()) || 0) >= 2));
      const read = opening && tells && p.cap && letters ? letters.get(capKey(p.cap)) : null, clear = clearCap(read) ? read.letter : null;
      if (opening && tells && p.cap && asks) asks.push({ key: capKey(p.cap), ...p.cap });
      if (clear && lower) {
        const first = (/^\p{L}+/u.exec(p.text) || [''])[0].toLowerCase();
        let word = null, most = 2, uses = 0;
        for (const [pair, n] of pairs) {
          const [a, b] = pair.split(' ');
          if (b !== first || a[0] !== clear.toLowerCase() || n < most || (n === most && (vocab.get(a) || 0) <= uses)) continue;
          word = a; most = n; uses = vocab.get(a) || 0;
        }
        if (word) {
          paras[k] = { ...p, text: clear + word.slice(1) + ' ' + p.text, breaks: (p.breaks || []).map(([w, n]) => [w + 1, n]) };
          continue;
        }
      }
      if (m) m[1] = m[1].replace(/[^"“‘]/g, ''); // Of the marks, only an opening quotation mark stays.
      if (!m || wordCount(p.text) < 4 || (/^[IVXLC]+$/.test(m[2]) && m[3] === '.') || (/^(?:ACT|SCENE|BOOK|PART|CHAPTER|CANTO|STAVE)$/.test(m[2]) && /^[IVXLC\d]/.test(m[5] || ''))) continue;
      // The capitals as they stand count themselves once, in the words and in the pairs.
      const quote = m[1], x = m[2].toLowerCase(), self = (vocab.get(x) || 1) - 1, next = (m[5] || '').toLowerCase();
      const pairOf = w => next ? pairs.get(w + ' ' + next) || 0 : 0, own = Math.max(0, pairOf(x) - 1);
      let best = null, n = 0, pair = 0;
      for (const L of 'abcdefghijklmnopqrstuvwxyz') {
        const c = vocab.get(L + x) || 0, q = pairOf(L + x);
        if (c >= 3 && (q > pair || (q === pair && c > n))) { n = c; pair = q; best = L }
      }
      // The capital read from the page, where the book uses the word it makes ("W" + "E spent": "WE", not "HE").
      if (clear && (vocab.get(clear.toLowerCase() + x) || 0) >= 2) { best = clear.toLowerCase(); n = Infinity }
      if (best && (n > self * 4 || (pair >= 2 && pair > own * 2))) paras[k] = { ...p, text: quote + best.toUpperCase() + m[2] + m[3] + m[4] + p.text.slice(m.index + m[0].length - (m[5] || '').length) };
    }
  }

  /* ---------- The edition ---------- */
  // pages: [{ n, x0, y0, w, h, rows }] for every page of the document; scan: TinctPdfScan.scan's
  // result (its title, author, language, chapters and textPages). Returns the edition, or null
  // for a document with no text layer.
  // The pages near a book's start that are lists (a printed contents, a list of illustrations, a publisher's list of
  // titles: most lines ending on a number or a leader), on a scan or headed Contents. The reader has its own chapter
  // menu (The Importance of Being Earnest's Methuen lists, 30 Oct 2026 corpus).
  // A publisher's list numbers its titles first ("1 The Mighty Atom" | "2 Jane"), and stands at a scan's end too, where only
  // such a list goes: a book's index, its lines ending on page numbers, is the book's (The Origin of Species).
  function listPages(lines, pageCount, scanned = lines.some(l => l.ocr)) {
    const out = new Set(), edge = Math.max(12, pageCount * 0.1);
    const numbered = l => /^(?:\d{1,3}|\d \d|i ?o)\s+\p{Lu}/u.test(l.text);
    for (const n of new Set(lines.filter(l => l.n <= edge || (scanned && l.n > pageCount - edge)).map(l => l.n))) {
      const on = lines.filter(l => l.n === n && l.kind !== 'figure'), back = n > edge;
      const listed = on.filter(l => (!back && (/(?:\d{1,3}|\b[ivxlc]{1,6})\s*\.?$/i.test(l.text) || /\.{3,}|(?:\.\s){2,}/.test(l.text))) || (scanned && numbered(l))).length;
      if (on.length >= 4 && ((listed >= on.length * 0.4 && scanned) || /^(?:contents|list of (?:illustrations|chapters|plates)|illustrations)\b/i.test(on[0].text))) out.add(n);
    }
    return out;
  }
  // A scan's front matter that is the library's or the scanner's, not the book's: a due-date card ("THE PERSON
  // CHARGING THIS MATERIAL IS RE-"), a scanner's notice, a catalogue stamp; and the pictures of its covers and
  // endpapers, on pages before the one facing the title page (Three Men in a Boat, 30 Oct 2026 corpus).
  const LIBRARY_LINE = /person charging this material|latest date stamped below|to renew,? call|theft, mutilation|this book is due|date due\b|digitized by( the)? internet archive|archive\.org\/details|no known copyright restrictions|the original of this book is in|university library\b.*\bgift of|with funding from/i;
  function frontMatter(lines, pageCount, title, scanned = lines.some(l => l.ocr)) {
    const front = lines.filter(l => l.n <= Math.max(12, pageCount * 0.1));
    if (!scanned) return new Set();
    const out = new Set(), key = norm(title || '').slice(0, 24);
    const titlePage = key.length >= 6 ? front.find(l => l.kind !== 'figure' && norm(l.text).length >= 4 && key.startsWith(norm(l.text).slice(0, 24)))?.n : undefined;
    for (const n of new Set(front.map(l => l.n))) {
      const on = front.filter(l => l.n === n), words = on.filter(l => l.kind !== 'figure').reduce((t, l) => t + l.words, 0);
      const notice = on.filter(l => LIBRARY_LINE.test(l.text));
      if (notice.length && words < 120) for (const l of on) out.add(l);
      else for (const l of notice) out.add(l);
      if (titlePage && n < titlePage - 1) for (const l of on) if (l.kind === 'figure') out.add(l);
    }
    return out;
  }
  function fromPages(pages, scan, letters = null, asks = null) {
    if (!scan || !(scan.textPages > 0)) return null;
    // Each chapter's title on its page stays a line of text, inside a figure's crop or not.
    const titled = new Map();
    for (const e of chapterEntries(scan)) (titled.get(e.page) || titled.set(e.page, []).get(e.page)).push({ label: e.label, title: titleOf(e.label) });
    const allRows = pages.flatMap(p => p.rows), rawBody = S().bodyOf(allRows), anyScan = !!rawBody && isScan(allRows, rawBody);
    const keep = (p, r) => r.words <= 12 && !edge(p, r) && (titled.get(p.n) || []).some(t => matchesTitle(r.text, t.label, t.title, anyScan));
    const documented = documentLines(pages, scan.title, keep), body = documented.body, scanned = documented.scanned;
    const lists = listPages(documented.lines, pages.length, scanned), junk = frontMatter(documented.lines, pages.length, scan.title, scanned);
    // On a scan, a short line of OCR noise ("S33 t) VS>fyl"): each of its words has a figure or mark inside it and
    // is used nowhere else in the book.
    const used = new Map();
    for (const l of documented.lines) for (const w of l.text.split(/\s+/)) used.set(w, (used.get(w) || 0) + 1);
    const noise = l => scanned && l.kind !== 'figure' && l.words <= 4 && l.text.split(/\s+/).filter(Boolean).every(w => /\p{L}/u.test(w) ? /[\d^>|<{}\\]|\p{L}[)(\]]/u.test(w) && used.get(w) === 1 : !/^\d{1,4}$/.test(w));
    const lines = documented.lines.filter(l => !lists.has(l.n) && !junk.has(l) && !noise(l)).map(l => scanned && /\^| [1lV] /.test(l.text) ? { ...l, text: bang(l.text, true) } : l).filter(l => l.text);
    if (!lines.some(l => l.kind === 'body')) return null;
    const hyphenated = hyphenatedWords(lines);
    const geo = geometry(lines);
    const bodyLines = lines.filter(l => l.kind === 'body');
    const indents = bodyLines.filter(l => { const g = geo.get(l.n + '|' + l.col); return g && l.x - g.left > l.size }).length >= bodyLines.length * 0.03;
    const titleKey = norm(scan.title), authorKey = norm(scan.author);
    // On a scan, how often each word is used, and each pair of words in a row: a drop cap's lost letter is the one that
    // makes a common word, read with the word after it ("SO far" over "TO far").
    const vocab = new Map(), pairs = new Map();
    if (scanned) for (const l of lines) {
      const words = l.text.toLowerCase().match(/\p{L}+/gu) || [];
      words.forEach((w, i) => { vocab.set(w, (vocab.get(w) || 0) + 1); if (i) { const k = words[i - 1] + ' ' + w; pairs.set(k, (pairs.get(k) || 0) + 1) } });
    }
    const chapters = [];
    let figureCount = 0;
    for (const part of splitChapters(lines, scan, pages.length, scanned)) {
      let chapterLines = part.lines;
      // Before the document's first running text: its own title and byline are the book's, shown above it.
      if (!chapters.length) {
        const first = chapterLines.findIndex(l => l.kind === 'body' && l.words >= 6 && Math.abs(l.size - body.size) <= body.size * 0.05);
        // Text before any chapter (or a document without chapters): the rest of a title block set
        // larger than the text on the first page (a paper's affiliations and date) is the book's
        // too (converter 2). A page measured on it was no page of reading (16 Oct 2026).
        const titleBlock = (l, i) => (part.lead || !chapterEntries(scan).length) && i < first && l.n === lines[0]?.n && l.size > body.size * 1.1;
        chapterLines = chapterLines.filter((l, i) => !titleBlock(l, i) && (i >= first || ![titleKey, authorKey].includes(norm(l.text)) || !norm(l.text)));
      }
      const { paras, notes } = paragraphsOf(chapterLines, geo, hyphenated, indents, scanned);
      if (vocab.size) restoreDropCaps(paras, vocab, pairs, letters, asks);
      if (!paras.length && !notes.length) continue;
      const all = notes.length ? [...paras, { text: 'Notes', kind: 'heading', page: notes[0].page, breaks: [] }, ...notes] : paras;
      const chapter = { number: chapters.length + 1, title: part.title || scan.title || `Pages ${all[0].page}`, paragraphs: all.map(p => p.text), pages: all.map(p => p.page) };
      if (all.some(p => p.kind)) chapter.kinds = all.map(p => p.kind || null);
      const pageBreaks = [];
      all.forEach((p, i) => { for (const [word, page] of p.breaks) pageBreaks.push([i, word, page]) });
      if (pageBreaks.length) chapter.pageBreaks = pageBreaks;
      if (notes.length) chapter.notes = paras.length;
      const pictures = all.filter(p => p.figure);
      if (pictures.length) chapter.figures = pictures.map(p => figureOf(p.figure, ++figureCount));
      chapters.push(chapter);
    }
    if (!chapters.length) return null;
    return { format: 'tinct-user-edition-v1', converter: PDF_TEXT_CONVERTER, source: 'pdf', title: scan.title || '', author: scan.author || '', language: scan.language || '', chapters, droppedImages: 0 };
  }

  // pdf: a pdf.js document; options.scan: its scan (TinctPdfScan.scan); options.items(n) may
  // supply a page's text items; options.regions(n, page, items) the page's crops (pdf-regions.js
  // pageRegions, each with its `id` and drawn size `css`; app/src/lab/userBook/pdfEdition.ts draws
  // them); options.pixels(n, box) a piece of page n drawn in grey, { width, height, data } one byte a pixel (box: x0, x1,
  // top, bottom in the page's own units, and the page's x0, y0, w, h), where a drop cap stands (readCap; pdfEdition.ts draws
  // it); options.live() turns false to stop (null is returned).
  // Pages are read `concurrency` at a time (pdf.js parses one in its worker while another is drawn
  // here) and put together in page order, so the edition is the one a page at a time gives; options.pace(),
  // when given, is waited for before each page (reader.js: in idle time only). Its
  // stages are performance measures: 'tinct:pdf-text:pages' (text and regions), 'tinct:pdf-text:model'.
  const now = () => global.performance?.now?.() ?? Date.now();
  const measure = (name, start) => { try { global.performance?.measure?.(name, { start }) } catch {} };
  async function convert(pdf, { scan, items, regions, pixels = null, live = () => true, concurrency = 4, pace = null, onProgress } = {}) {
    if (!scan || !(scan.textPages > 0)) return null;
    const api = S();
    const count = pdf.numPages, pages = new Array(count), started = now();
    let next = 1, stop = false, completed = 0;
    onProgress?.(0, count);
    const read = async n => {
      const page = await pdf.getPage(n);
      const [x0, y0, x1, y1] = page.view;
      const list = items ? await items(n) : (await page.getTextContent()).items;
      const found = regions ? await regions(n, page, list).catch(() => []) : [];
      pages[n - 1] = { n, x0, y0, w: x1 - x0, h: y1 - y0, rows: api.textRows(list), ...(found?.length ? { regions: found } : {}) };
    };
    const lane = async () => {
      while (!stop && next <= count) {
        if (pace) { await pace(); if (stop || next > count) break }
        const n = next++;
        try { await read(n); onProgress?.(++completed, count) } catch (e) { stop = true; throw e }
        if (!live()) stop = true;
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(count, Math.floor(concurrency) || 1)) }, lane));
    if (stop) return null;
    measure('tinct:pdf-text:pages', started);
    const built = now(), asks = pixels ? [] : null;
    let edition = fromPages(pages, scan, null, asks);
    // Drop caps read from the page where the device can draw it: the edition is made again with their letters.
    if (asks?.length && live()) {
      const letters = new Map();
      for (const ask of asks.slice(0, 400)) {
        if (letters.has(ask.key)) continue;
        const page = pages[ask.n - 1];
        try {
          const image = page && await pixels(ask.n, { x0: ask.x0, x1: ask.x1, top: ask.top, bottom: ask.bottom, page: { x0: page.x0, y0: page.y0, w: page.w, h: page.h } });
          const read = image && readCap(image, ask.size * image.width / Math.max(1, ask.x1 - ask.x0));
          if (read) letters.set(ask.key, read);
        } catch { /* a page that cannot be drawn keeps its words */ }
      }
      if (!live()) return null;
      if ([...letters.values()].some(clearCap)) edition = fromPages(pages, scan, letters);
    }
    measure('tinct:pdf-text:model', built);
    return edition;
  }

  /* ---------- Places: text <-> page (app/src/lab/userBook/pdfAnchors.ts, the same rules) ---------- */
  const isNotes = (chapter, i) => Number.isInteger(chapter.notes) && i >= chapter.notes;
  // The words of each paragraph on each page: [{ chapter, paragraph, word (first on the page), words, page }].
  function spans(chapter) {
    const out = [];
    (chapter.paragraphs || []).forEach((text, i) => {
      const total = wordCount(text);
      const cuts = (chapter.pageBreaks || []).filter(b => b[0] === i).sort((a, b) => a[1] - b[1]);
      let word = 0, page = chapter.pages?.[i] ?? 1;
      for (const [, at, next] of cuts) { out.push({ paragraph: i, word, words: Math.max(0, at - word), page }); word = at; page = next }
      out.push({ paragraph: i, word, words: Math.max(0, total - word), page });
    });
    return out;
  }
  // The page a place in the text is on, and how far down it (by words): { page, frac }.
  function pageOf(edition, place) {
    const chapter = (edition?.chapters || []).find(c => c.number === place.chapterNumber);
    if (!chapter || !Array.isArray(chapter.pages)) return null;
    const list = spans(chapter);
    const word = Math.max(0, place.wordIndex || 0);
    const here = list.filter(s => s.paragraph === place.paragraphIndex);
    const span = here.filter(s => s.word <= word).at(-1) || here[0];
    if (!span) return null;
    // A note stands at the top of the page it was printed on (it is none of the page's own words).
    if (isNotes(chapter, span.paragraph)) return { page: span.page, frac: 0 };
    const onPage = list.filter(s => s.page === span.page && !isNotes(chapter, s.paragraph));
    const total = onPage.reduce((n, s) => n + s.words, 0);
    let before = 0;
    for (const s of onPage) { if (s === span) break; before += s.words }
    before += Math.min(span.words, word - span.word);
    return { page: span.page, frac: total > 0 ? Math.round((before / total) * 10000) / 10000 : 0 };
  }
  // The place in the text at a page and how far down it: the text that starts on that page, the
  // word `frac` of the way through its words (frac 0: the first, a paragraph running on from the
  // page before included); a page with no text of its own (a figure) gives the text before it.
  function placeOf(edition, page, frac = 0) {
    const chapters = (edition?.chapters || []).filter(c => Array.isArray(c.pages));
    let before = null;
    for (const chapter of chapters) {
      const list = spans(chapter).filter(s => !isNotes(chapter, s.paragraph));
      const onPage = list.filter(s => s.page === page && s.words > 0);
      if (onPage.length) {
        const total = onPage.reduce((n, s) => n + s.words, 0);
        let target = Math.min(total - 1, Math.max(0, Math.round((frac || 0) * total)));
        for (const s of onPage) {
          if (target < s.words) return { chapterNumber: chapter.number, paragraphIndex: s.paragraph, wordIndex: s.word + target };
          target -= s.words;
        }
      }
      for (const s of list) if (s.page < page && s.words > 0) before = { chapterNumber: chapter.number, paragraphIndex: s.paragraph, wordIndex: s.word };
    }
    if (before) return before;
    const first = chapters[0];
    return first ? { chapterNumber: first.number, paragraphIndex: 0, wordIndex: 0 } : null;
  }
  // The edition a PDF opens in on this device (Anders, 19 Oct 2026: a PDF's view is chosen per device;
  // only the place syncs): the reader's own choice here ('text' / 'pages'); else this device's kept
  // default (phone-edition / desk-edition); else the device's rule or the scan's default; null when
  // nothing is known yet. The place's edition (where it was last read, here or on another device)
  // never decides (app/src/lab/userBook/pdfEditions.ts pdfEditionChoice, the same rule).
  function choice(own, kept, layoutDefault) {
    for (const e of [own, kept]) if (e === 'text' || e === 'pages') return e;
    if (layoutDefault === 'text') return 'text';
    if (layoutDefault === 'pages' || layoutDefault === 'pages-only') return 'pages';
    return null;
  }
  // A stored Tinct text this code can read as it is (its rules, not another version's).
  const usable = e => !!e && e.format === 'tinct-user-edition-v1' && (e.source === 'pdf' ? e.converter === PDF_TEXT_CONVERTER : e.source === 'ocr') && Array.isArray(e.chapters) && e.chapters.length > 0;

  // convert's options.pixels as a browser draws them: the page by pdf.js at 200 dpi (the scale the letters were measured at),
  // on white, in grey. Null without a document; a turned page, or one that cannot be drawn, gives none.
  function drawnPixels(pdf) {
    if (typeof document === 'undefined') return null;
    return async (n, box) => {
      const page = await pdf.getPage(n), k = 200 / 72, pg = box.page;
      if ((page.rotate || 0) % 360) return null;
      const w = Math.round((box.x1 - box.x0) * k), h = Math.round((box.top - box.bottom) * k);
      if (w < 4 || h < 4 || w > 2000 || h > 2000) return null;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      if (!g) return null;
      try {
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
        await page.render({ canvasContext: g, viewport: page.getViewport({ scale: k }), transform: [1, 0, 0, 1, -(box.x0 - pg.x0) * k, -(pg.h - (box.top - pg.y0)) * k] }).promise;
        const d = g.getImageData(0, 0, w, h).data, data = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) data[i] = Math.round(d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11);
        return { width: w, height: h, data };
      } finally { c.width = c.height = 0 }
    };
  }

  global.TinctPdfText = { PDF_TEXT_CONVERTER, convert, drawnPixels, readCap, fromPages, columnsOf, readingOrder, pageOf, placeOf, usable, choice };
})(typeof window !== 'undefined' ? window : globalThis);
