'use strict';
// Tinct · Add a book: a text PDF as Tinct text, the edition the Tinct reader reflows. No
// network and no AI: the PDF's own text layer, read the same way on every device (the same
// file converts to the same chapters, paragraphs and words, so a place is the same place).
//   1. Lines (js/pdf-scan.js textRows), without running heads and feet or page numbers
//      (furniture), in reading order: a page set in two columns is read column by column
//      between the lines that run across it, else top to bottom. Captions ("Figure 2. …") and
//      the small lettering inside figures are left out.
//   2. Paragraphs: a new one after a vertical gap of more than 1.5 lines, at a first line
//      indented by more than 1 em, or after a short line ending a sentence (. ? ! : ").
//      Across a page or a column, the text runs on when the next line starts in lower case or
//      the line before ends without a full stop (and, in a book that indents its paragraphs,
//      when the next line is not indented).
//   3. Words broken at a line end ("under-" + "standing") are joined, unless the hyphenated
//      word stands elsewhere in the document ("self-evident"); soft hyphens (U+00AD) go.
//   4. Footnotes (smaller than the body, in the bottom quarter of the page, starting with a
//      marker) are collected after their chapter under a "Notes" heading.
//   5. Chapters: the scan's (outline, printed contents or headings); without any, chapters of
//      20 pages ("Pages 1–20"), or the whole document under its title when it is shorter.
//   6. Each paragraph keeps the page it starts on (pages[i]) and where it runs onto the next
//      page ([paragraph, word, page] in pageBreaks), so a place converts between this edition
//      and the PDF's pages both ways (placeOf / pageOf; app/src/lab/userBook/pdfAnchors.ts).
// A document without a text layer (textPages 0) has no Tinct text: convert() returns null.
// Used by the Tinct reader (app/src/lab/userBook/pdfEdition.ts loads it as window.TinctPdfText)
// and Add a book's viewer (js/reader.js); the tests import this file directly.
(function (global) {
  // Rules that change any chapter, paragraph or word get a new number (userEdition.ts).
  const PDF_TEXT_CONVERTER = 1;
  const CHAPTER_PAGES = 20;
  const S = () => global.TinctPdfScan;

  const median = list => { if (!list.length) return 0; const s = [...list].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] };
  const norm = s => String(s || '').toLowerCase().replace(/­/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  const TERMINAL = /[.?!:"”’)\]]$/;
  const FOOTNOTE_MARK = /^(?:\d{1,3}|[*†‡§¶])(?:[.)]?\s|\s*\p{Lu})/u;
  const CAPTION = /^(?:fig(?:ure)?|table|tab|plate|chart|diagram)\.?\s*\d+/i;

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
  function documentLines(pages) {
    const api = S();
    const isFurniture = api.furniture(pages);
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
      const ordered = readingOrder(p.rows, p.x0 || 0, p.w || 612);
      let inFoot = false, caption = null;
      for (const r of ordered) {
        const low = r.y - p.y0 < p.h * 0.25;
        // A caption and the lines that continue it, close below, in its own size.
        if (CAPTION.test(r.text) && r.size <= body.size * 1.05) { caption = r; continue }
        if (caption && r.size === caption.size && caption.y - r.y < r.size * 1.8 && r.col === caption.col) { caption = r; continue }
        caption = null;
        if (r.size < body.size * 0.92 && low && (FOOTNOTE_MARK.test(r.text) || inFoot)) { inFoot = true; out.push({ ...r, n: p.n, kind: 'foot' }); continue }
        inFoot = false;
        // The lettering inside a figure or a chart: small text that is not a note.
        if (r.size < body.size * 0.8) continue;
        const heading = r.size >= body.size * 1.15 && r.words <= 16 && api.headingLike(r);
        out.push({ ...r, n: p.n, kind: heading ? 'heading' : 'body' });
      }
    }
    return { lines: out, body };
  }

  /* ---------- Lines to paragraphs ---------- */
  const wordCount = text => text.split(/\s+/).filter(Boolean).length;
  // Words printed with a hyphen inside a line ("self-evident"), lower case: a word broken at a
  // line end in the same place keeps its hyphen.
  function hyphenatedWords(lines) {
    const out = new Set();
    for (const l of lines) for (const m of l.text.matchAll(/\p{L}+-\p{L}+/gu)) out.add(m[0].toLowerCase());
    return out;
  }
  // Join a line onto the text before it: a word broken at the line end is joined (keeping its
  // hyphen when the hyphenated word stands elsewhere), else a space between.
  function joinLine(text, next, hyphenated) {
    if (/\p{L}­$/u.test(text) && /^\p{L}/u.test(next)) return text.slice(0, -1) + next;
    const broken = text.match(/(\p{L}+)-$/u);
    if (broken && /^\p{Ll}/u.test(next)) {
      const rest = next.match(/^\p{L}+/u)[0];
      return hyphenated.has((broken[1] + '-' + rest).toLowerCase()) ? text + next : text.slice(0, -1) + next;
    }
    return text + ' ' + next;
  }
  const clean = text => text.replace(/­/g, '').replace(/\s+/g, ' ').trim();

  // Column geometry per page and column: where its lines start and end, and its line pitch.
  function geometry(lines) {
    const by = new Map();
    for (const l of lines) {
      if (l.kind !== 'body') continue;
      const k = l.n + '|' + l.col;
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(l);
    }
    const out = new Map();
    for (const [k, list] of by) {
      const gaps = [];
      for (let i = 1; i < list.length; i++) { const g = list[i - 1].y - list[i].y; if (g > 0 && g < list[i].size * 3) gaps.push(g) }
      out.set(k, { left: Math.min(...list.map(l => l.x)), right: Math.max(...list.map(l => l.x2)), pitch: median(gaps) || list[0].size * 1.3 });
    }
    return out;
  }

  // Paragraphs of one chapter's lines: [{ text, kind, page, breaks: [[word, page]] }] and its notes.
  function paragraphsOf(lines, geo, hyphenated, indents) {
    const paras = [], notes = [];
    let cur = null, prev = null, note = null;
    const flush = () => { if (cur) paras.push(cur); cur = null; prev = null };
    for (const l of lines) {
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
          const short = prev.x2 - prev.x < (pg.right - pg.left) * 0.8;
          fresh = prev.y - l.y > g.pitch * 1.5 || indented || (short && TERMINAL.test(prev.text));
        } else {
          // Onto the next column or page.
          const runsOn = /^\p{Ll}/u.test(l.text) || !TERMINAL.test(prev.text);
          const pg = geo.get(prev.n + '|' + prev.col) || g;
          const full = prev.x2 - prev.x >= (pg.right - pg.left) * 0.8;
          fresh = !(runsOn || (indents && full && !indented));
        }
      }
      if (fresh) { flush(); cur = { text: l.text, kind: null, page: l.n, breaks: [] }; prev = l; continue }
      if (l.n !== prev.n) cur.breaks.push([wordCount(clean(cur.text)), l.n]);
      cur.text = joinLine(cur.text, l.text, hyphenated);
      prev = l;
    }
    flush();
    if (note) notes.push(note);
    const done = p => ({ text: clean(p.text), kind: p.kind, page: p.page, breaks: p.breaks });
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
        for (let k = from; k < lines.length && lines[k].n === e.page && k < from + 40; k++) {
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
    // Text before the first chapter (a preface without an entry) is a chapter under the book's title.
    const lead = lines.slice(0, starts[0].i).filter(l => l.kind === 'body');
    if (lead.length && lead.reduce((n, l) => n + l.words, 0) >= 20) out.push({ title: scan.title || '', lines: lines.slice(0, starts[0].i), lead: true });
    starts.forEach((s, k) => {
      const end = k + 1 < starts.length ? starts[k + 1].i : lines.length;
      out.push({ title: s.e.label, lines: lines.slice(s.i, end).filter((l, j) => !s.skip.has(s.i + j)) });
    });
    return out;
  }

  /* ---------- The edition ---------- */
  // pages: [{ n, x0, y0, w, h, rows }] for every page of the document; scan: TinctPdfScan.scan's
  // result (its title, author, language, chapters and textPages). Returns the edition, or null
  // for a document with no text layer.
  function fromPages(pages, scan) {
    if (!scan || !(scan.textPages > 0)) return null;
    const { lines } = documentLines(pages);
    if (!lines.some(l => l.kind === 'body')) return null;
    const hyphenated = hyphenatedWords(lines);
    const geo = geometry(lines);
    const bodyLines = lines.filter(l => l.kind === 'body');
    const indents = bodyLines.filter(l => { const g = geo.get(l.n + '|' + l.col); return g && l.x - g.left > l.size }).length >= bodyLines.length * 0.03;
    const titleKey = norm(scan.title), authorKey = norm(scan.author);
    const chapters = [];
    for (const part of splitChapters(lines, scan, pages.length)) {
      let chapterLines = part.lines;
      // Before the document's first running text: its own title and byline are the book's, shown above it.
      if (!chapters.length) {
        const first = chapterLines.findIndex(l => l.kind === 'body' && l.words >= 6);
        chapterLines = chapterLines.filter((l, i) => i >= first || ![titleKey, authorKey].includes(norm(l.text)) || !norm(l.text));
      }
      const { paras, notes } = paragraphsOf(chapterLines, geo, hyphenated, indents);
      if (!paras.length && !notes.length) continue;
      const all = notes.length ? [...paras, { text: 'Notes', kind: 'heading', page: notes[0].page, breaks: [] }, ...notes] : paras;
      const chapter = { number: chapters.length + 1, title: part.title || scan.title || `Pages ${all[0].page}`, paragraphs: all.map(p => p.text), pages: all.map(p => p.page) };
      if (all.some(p => p.kind)) chapter.kinds = all.map(p => p.kind || null);
      const pageBreaks = [];
      all.forEach((p, i) => { for (const [word, page] of p.breaks) pageBreaks.push([i, word, page]) });
      if (pageBreaks.length) chapter.pageBreaks = pageBreaks;
      if (notes.length) chapter.notes = paras.length;
      chapters.push(chapter);
    }
    if (!chapters.length) return null;
    return { format: 'tinct-user-edition-v1', converter: PDF_TEXT_CONVERTER, source: 'pdf', title: scan.title || '', author: scan.author || '', language: scan.language || '', chapters, droppedImages: 0 };
  }

  // pdf: a pdf.js document; options.scan: its scan (TinctPdfScan.scan); options.items(n) may
  // supply a page's text items; options.live() turns false to stop (null is returned).
  async function convert(pdf, { scan, items, live = () => true } = {}) {
    if (!scan || !(scan.textPages > 0)) return null;
    const api = S();
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const [x0, y0, x1, y1] = page.view;
      const list = items ? await items(n) : (await page.getTextContent()).items;
      pages.push({ n, x0, y0, w: x1 - x0, h: y1 - y0, rows: api.textRows(list) });
      if (!live()) return null;
    }
    return fromPages(pages, scan);
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
  // The edition a PDF opens in: the edition of its place ('t' / 'p'); else the reader's choice
  // on this device ('text' / 'pages'); else a place kept before Tinct text existed stays in
  // Original pages; else the scan's default; null when nothing is known yet
  // (app/src/lab/userBook/pdfEditions.ts pdfEditionChoice, the same rule).
  function choice(pos, stored, layoutDefault) {
    if (pos?.edition === 't') return 'text';
    if (pos?.edition === 'p') return 'pages';
    if (stored === 'text' || stored === 'pages') return stored;
    if (pos && Number.isInteger(pos.page)) return 'pages';
    if (layoutDefault === 'text') return 'text';
    if (layoutDefault === 'pages' || layoutDefault === 'pages-only') return 'pages';
    return null;
  }
  // A stored Tinct text this code can read as it is (its rules, not another version's).
  const usable = e => !!e && e.format === 'tinct-user-edition-v1' && (e.source === 'pdf' ? e.converter === PDF_TEXT_CONVERTER : e.source === 'ocr') && Array.isArray(e.chapters) && e.chapters.length > 0;

  global.TinctPdfText = { PDF_TEXT_CONVERTER, convert, fromPages, columnsOf, readingOrder, pageOf, placeOf, usable, choice };
})(typeof window !== 'undefined' ? window : globalThis);
