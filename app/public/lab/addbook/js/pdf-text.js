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
  const PDF_TEXT_CONVERTER = 6;
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
  function documentLines(pages, title = '') {
    const api = S();
    const isFurniture = api.furniture(pages, title);
    // Where running heads and feet are set (the line, its size), from those found repeating:
    // a head that changes from chapter to chapter, set in the same place, is one too.
    const slots = new Set();
    for (const p of pages) for (const r of p.rows) if (!api.isPageNumber(r.text) && isFurniture(p, r) && edge(p, r)) slots.add(Math.round(r.y - p.y0) + '|' + r.size);
    const inSlot = (p, r) => edge(p, r) && r.words <= 12 && slots.has(Math.round(r.y - p.y0) + '|' + r.size);
    const kept = pages.map(p => ({ ...p, rows: p.rows.filter(r => !isFurniture(p, r) && !inSlot(p, r) && r.text.trim()) }));
    const body = api.bodyOf(kept.flatMap(p => p.rows));
    if (!body) return { lines: [], body: null };
    const out = [];
    for (const p of kept) {
      // Formulas, figures and tables kept as crops of the page (converter 3): their own text leaves the
      // running text, and each stands where it sits, as a line of its own.
      const { rows, pictures } = picturesOf(p, body);
      const ordered = sameBaseline(readingOrder([...rows.map(r => ({ ...r, text: r.text.replace(BRACKET_PIECES, ' ').replace(/\s+/g, ' ').trim() })).filter(r => r.text), ...pictures].sort((a, b) => b.y - a.y || a.x - b.x), p.x0 || 0, p.w || 612), body);
      const left = columnLeft(ordered, body);
      const labels = stackedLabels(ordered, body, left);
      let inFoot = false, caption = null;
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
        // The lettering inside a figure or a chart: small text that is not a note.
        if (r.size < body.size * 0.8) continue;
        const heading = (r.size >= body.size * 1.15 && r.words <= 16 && api.headingLike(r)) || subheading(r, body, p);
        out.push({ ...r, n: p.n, kind: heading ? 'heading' : 'body' });
      }
    }
    return { lines: out, body };
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
  function picturesOf(p, body) {
    const regions = (p.regions || []).filter(g => g && g.id && g.w > 0 && g.h > 0);
    if (!regions.length) return { rows: p.rows, pictures: [] };
    const boxes = p.rows.map(r => rowBox(p, r));
    const taken = new Set(), pictures = [];
    for (const g of regions) {
      const inside = [], inCaption = [];
      p.rows.forEach((r, i) => {
        if (taken.has(i)) return;
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
  function joinLine(text, next, hyphenated) {
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
  function paragraphsOf(lines, geo, hyphenated, indents) {
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
          const stepIn = l.x - prev.x > l.size * 1.0;
          if (g.hang?.lines.has(l)) fresh = gap || atMargin(l, g.left) || l.x - (g.left + g.hang.d) > l.size;
          else if (edge != null) fresh = gap || stepIn || ends;
          else fresh = gap || indented || stepIn || ends;
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
        if ((l.ocr || fullPrev) && !tooFar) fresh = false;
      }
      // A line opening with a bullet is a list item of its own ("• Pentium® processors" | "• P6 family processors").
      if (!fresh && cur && cur.kind !== 'heading' && /^[•▪◦‣●■□–]\s/u.test(l.text) && /^[•▪◦‣●■□–]\s/u.test(cur.text)) fresh = true;
      if (fresh) { flush(); cur = { text: l.text, kind: null, page: l.n, breaks: [] }; prev = l; continue }
      if (l.n !== prev.n) cur.breaks.push([wordCount(clean(cur.text)), l.n]);
      cur.text = joinLine(cur.text, l.text, hyphenated);
      prev = l;
    }
    flush();
    if (note) notes.push(note);
    const done = p => ({ text: clean(p.text), kind: p.kind, page: p.page, breaks: p.breaks, ...(p.figure ? { figure: p.figure } : {}) });
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
  function splitChapters(lines, scan, pageCount) {
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
      const want = norm(e.label);
      const skip = new Set();
      // The title as printed on its page (over one or two lines): a heading first, else any line.
      const from = i;
      find: for (const headingOnly of [true, false]) {
        // A heading anywhere on its page (a two-column page's second column starts past line 40: ResNet's
        // "2. Related Work", 29 Oct 2026); any other line only near the top.
        for (let k = from; k < lines.length && lines[k].n === e.page && (headingOnly || k < from + 40); k++) {
          if (headingOnly && lines[k].kind !== 'heading') continue;
          const one = norm(lines[k].text), two = k + 1 < lines.length && lines[k + 1].n === e.page ? one + norm(lines[k + 1].text) : one;
          if (!one || !want) continue;
          if (want === one || (want.endsWith(one) && one.length >= 4 && want.length - one.length <= 4) || (one.endsWith(want) && want.length >= 4)) { i = k; skip.add(k); break find }
          if (want === two) { i = k; skip.add(k); skip.add(k + 1); break find }
        }
      }
      starts.push({ e, i, skip });
      at = i;
    }
    // An entry not found on its page (a contents line, "7.6. Algorithms 67") gives way to a later entry found there:
    // the lines above that one's title stay with the chapter before.
    for (let k = starts.length - 2; k >= 0; k--) {
      const s = starts[k], next = starts[k + 1];
      if (!s.skip.size && next.skip.size && next.e.page === s.e.page) s.i = next.i;
    }
    // Text before the first chapter (a preface without an entry) is a chapter under the book's title.
    const lead = lines.slice(0, starts[0].i).filter(l => l.kind === 'body');
    if (lead.length && lead.reduce((n, l) => n + l.words, 0) >= 20) out.push({ title: scan.title || '', lines: lines.slice(0, starts[0].i), lead: true });
    starts.forEach((s, k) => {
      const end = k + 1 < starts.length ? starts[k + 1].i : lines.length;
      out.push({ title: s.e.label, lines: lines.slice(s.i, end).filter((l, j) => !s.skip.has(s.i + j)) });
    });
    return out;
  }

  // A scan's drop cap is a picture the OCR does not read: a chapter's first paragraph opens on capitals that are
  // no word ("HEN we discussed", "R. SHERLOCK HOLMES"), maybe after a stray mark ("‘HEN"). The letter that makes
  // the book's word four times more common than the capitals as they stand goes back (Pride and Prejudice,
  // Three Men in a Boat, 30 Oct 2026 corpus). A short line ("ACT I.") or a roman number is left alone.
  function restoreDropCaps(paras, vocab) {
    for (let k = 0, seen = 0; k < paras.length && seen < 2; k++) {
      const p = paras[k];
      if (p.kind === 'heading' || p.figure) continue;
      seen++;
      const m = /^[‘'’"“^%()]*([A-Z]{1,12})([.,;:'’]?)(\s)/.exec(p.text);
      if (!m || wordCount(p.text) < 8 || (/^[IVXLC]+$/.test(m[1]) && m[2] === '.')) continue;
      const x = m[1].toLowerCase(), self = vocab.get(x) || 0;
      let best = null, n = 0;
      for (const L of 'abcdefghijklmnopqrstuvwxyz') { const c = vocab.get(L + x) || 0; if (c > n) { n = c; best = L } }
      if (best && n >= 3 && n > self * 4) paras[k] = { ...p, text: best.toUpperCase() + p.text.slice(m.index + m[0].length - m[1].length - m[2].length - m[3].length) };
    }
  }

  /* ---------- The edition ---------- */
  // pages: [{ n, x0, y0, w, h, rows }] for every page of the document; scan: TinctPdfScan.scan's
  // result (its title, author, language, chapters and textPages). Returns the edition, or null
  // for a document with no text layer.
  function fromPages(pages, scan) {
    if (!scan || !(scan.textPages > 0)) return null;
    const { lines, body } = documentLines(pages, scan.title);
    if (!lines.some(l => l.kind === 'body')) return null;
    const hyphenated = hyphenatedWords(lines);
    const geo = geometry(lines);
    const bodyLines = lines.filter(l => l.kind === 'body');
    const indents = bodyLines.filter(l => { const g = geo.get(l.n + '|' + l.col); return g && l.x - g.left > l.size }).length >= bodyLines.length * 0.03;
    const titleKey = norm(scan.title), authorKey = norm(scan.author);
    // On a scan, how often each word is used: a drop cap's lost letter is the one that makes a common word.
    const vocab = new Map();
    if (lines.some(l => l.ocr)) for (const l of lines) for (const w of l.text.toLowerCase().match(/\p{L}+/gu) || []) vocab.set(w, (vocab.get(w) || 0) + 1);
    const chapters = [];
    let figureCount = 0;
    for (const part of splitChapters(lines, scan, pages.length)) {
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
      const { paras, notes } = paragraphsOf(chapterLines, geo, hyphenated, indents);
      if (vocab.size) restoreDropCaps(paras, vocab);
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
  // them); options.live() turns false to stop (null is returned).
  // Pages are read `concurrency` at a time (pdf.js parses one in its worker while another is drawn
  // here) and put together in page order, so the edition is the one a page at a time gives; options.pace(),
  // when given, is waited for before each page (reader.js: in idle time only). Its
  // stages are performance measures: 'tinct:pdf-text:pages' (text and regions), 'tinct:pdf-text:model'.
  const now = () => global.performance?.now?.() ?? Date.now();
  const measure = (name, start) => { try { global.performance?.measure?.(name, { start }) } catch {} };
  async function convert(pdf, { scan, items, regions, live = () => true, concurrency = 4, pace = null, onProgress } = {}) {
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
    const built = now(), edition = fromPages(pages, scan);
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

  global.TinctPdfText = { PDF_TEXT_CONVERTER, convert, fromPages, columnsOf, readingOrder, pageOf, placeOf, usable, choice };
})(typeof window !== 'undefined' ? window : globalThis);
