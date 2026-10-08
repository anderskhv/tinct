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
// Used by js/reader.js (window.TinctPdfScan); the tests import this file directly.
(function (global) {
  const SCAN_VERSION = 3;
  const HEADING_PAGES = 400;

  /* ---------- Text rows ---------- */
  // Positioned text items -> visual lines, top first: { y, x, size, fonts, font, chars, text, words }.
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
      row.parts.push({ x, w: it.width || 0, s: it.str, size, font: it.fontName });
    }
    return rows.sort((p, q) => q.y - p.y).map(r => {
      const parts = r.parts.sort((p, q) => p.x - q.x);
      // The line's size is the size most of its characters are set in (a large symbol does not count).
      const by = new Map();
      for (const p of parts) { const k = Math.round(p.size * 2) / 2; by.set(k, (by.get(k) || 0) + p.s.trim().length) }
      const size = [...by].sort((p, q) => q[1] - p[1])[0][0];
      let text = '';
      parts.forEach((p, i) => { const prev = parts[i - 1]; if (prev && p.x - (prev.x + prev.w) > size * 0.12 && !/\s$/.test(text) && !/^\s/.test(p.s)) text += ' '; text += p.s });
      text = text.replace(/\s+/g, ' ').replace(/\s+([,.:;!?)])/g, '$1').trim();
      const fonts = new Set(parts.filter(p => p.s.trim()).map(p => p.font));
      return { y: r.y, x: parts[0].x, size, fonts, font: fonts.size === 1 ? [...fonts][0] : null, chars: text.length, text, words: text.split(' ').length };
    });
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
  const edgeKey = r => r.text.toLowerCase().replace(/\d+/g, '').replace(/[^\p{L}]+/gu, '');
  const atEdge = (p, r) => r.y - p.y0 > p.h * 0.9 || r.y - p.y0 < p.h * 0.1;
  // Rows that repeat across pages: near the top or bottom on several pages (numbers aside), or
  // the very same line on several pages anywhere.
  function furniture(pages) {
    const need = pages.length <= 3 ? 2 : 3;
    const seen = new Map(), exact = new Map();
    for (const p of pages) {
      for (const k of new Set(p.rows.filter(r => atEdge(p, r)).map(edgeKey))) if (k) seen.set(k, (seen.get(k) || 0) + 1);
      for (const k of new Set(p.rows.map(r => r.text.toLowerCase()))) exact.set(k, (exact.get(k) || 0) + 1);
    }
    return (p, r) => isPageNumber(r.text) || (atEdge(p, r) && (seen.get(edgeKey(r)) || 0) >= need) || (exact.get(r.text.toLowerCase()) || 0) >= need;
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
      const rows = p.rows.filter((r, i) => !skip.has(i) && !isFurniture(p, r) && /\p{L}{2}/u.test(r.text));
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
  function headingLike(r) {
    const t = r.text, letters = (t.match(/\p{L}/gu) || []).length;
    return r.words <= 12 && letters >= 2 && letters >= t.replace(/\s/g, '').length * 0.6
      && /^([\p{Lu}]|[\dIVXivx]+(?:\.\d+)*[.)]?\s|[A-Z]\.?\d*\s|§)/u.test(t) && !/[,;:]$/.test(t)
      && !/[=∑∫≡⊗⊕→←≈≤≥±×√∂∇]/.test(t) && !/^(fig(ure)?|table|tab)\.?\s*\d/i.test(t) && !isPageNumber(t);
  }
  // pages: [{ n, y0, h, rows }]; fontName(pageNumber, fontId) -> Promise<string>.
  async function headingEntries(pages, { fontName = async () => '', title = '', author = '', live = () => true } = {}) {
    const docBody = bodyOf(pages.flatMap(p => p.rows));
    if (!docBody) return null;
    const isFurniture = furniture(pages);
    const same = s => bare(s);
    const out = [];
    for (const p of pages) {
      const local = bodyOf(p.rows), body = local && local.chars >= 300 ? local : docBody;
      const skip = epigraphRows(p.rows);
      // On page 1, what sits above the first body paragraph is the title block (title, authors, epigraph).
      const para = p.rows.findIndex(r => r.font === body.font && Math.abs(r.size - body.size) < 0.6 && r.words >= 6);
      const first = p.n > 1 ? 0 : para < 0 ? Infinity : para;
      let prev = null;
      for (const [i, r] of p.rows.entries()) {
        if (i < first) continue;
        if (skip.has(i) || !headingLike(r) || isFurniture(p, r)) { prev = null; continue }
        if (same(r.text) && (same(r.text) === same(title) || same(r.text) === same(author))) { prev = null; continue }
        const larger = r.size >= body.size * 1.15;
        const sameSize = Math.abs(r.size - body.size) <= body.size * 0.08;
        if (!larger && !(sameSize && r.font && r.font !== body.font)) { prev = null; continue }
        const face = r.font ? await fontName(p.n, r.font) : '';
        if (!live()) return null;
        // Italic or oblique lines are quotations, epigraphs or emphasis, unless set much larger.
        if (isItalic(face) && r.size < body.size * 1.35) { prev = null; continue }
        if (!larger && !isBold(face)) { prev = null; continue }
        // A heading that wraps onto a second line, in the same face.
        if (prev && prev.font === r.font && prev.y - r.y < r.size * 1.8 && prev.words + r.words <= 16) {
          prev.entry.label = (prev.entry.label + ' ' + r.text).replace(/(?<=\p{L})-\s(?=\p{Ll})/gu, '');
          Object.assign(prev, { y: r.y, words: prev.words + r.words });
          continue;
        }
        const entry = { id: 'h' + out.length, label: r.text, page: p.n, kind: 'chapter', parent: null };
        out.push(entry);
        prev = { entry, font: r.font, y: r.y, words: r.words };
      }
    }
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
    await walk(outline, 0, null);
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

  /* ---------- The scan ---------- */
  // pdf: a pdf.js document. options.fileName names the file; options.items(n) may supply a
  // page's text items (the reader's cache); options.live() turns false to stop early;
  // options.onTitle({ title, author }) hears the title before the chapters are found.
  async function scan(pdf, { fileName = '', items, live = () => true, onTitle, maxPages = HEADING_PAGES } = {}) {
    const textCache = new Map();
    const itemsOf = async n => {
      if (items) return items(n);
      if (!textCache.has(n)) textCache.set(n, (await (await pdf.getPage(n)).getTextContent()).items);
      return textCache.get(n);
    };
    const pageCache = new Map();
    const pageOf = async n => {
      if (!pageCache.has(n)) {
        const page = await pdf.getPage(n), [, y0, , y1] = page.view;
        pageCache.set(n, { n, page, y0, h: y1 - y0, rows: textRows(await itemsOf(n)) });
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
    const fromMeta = metaTitle(info.Title, fileName);
    const title = fromMeta || printed.title || cleanFileName(fileName);
    const author = metaAuthor(info.Author) || printed.author || '';
    onTitle?.({ title, author });
    const total = Math.min(maxPages, pdf.numPages);
    const all = [...first];
    for (let n = first.length + 1; n <= total; n++) { all.push(await pageOf(n)); if (!live()) return null }
    const text = async n => (await itemsOf(n)).map(i => i.str + (i.hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ');
    let entries = null, nav = 'pages';
    if ((entries = await outlineEntries(pdf))) nav = 'outline';
    else if ((entries = await contentsEntries(pdf.numPages, async n => (await pageOf(n)).rows, text))) nav = 'contents';
    else if ((entries = await headingEntries(all, { fontName, title, author, live }))) nav = 'headings';
    if (!live()) return null;
    return {
      v: SCAN_VERSION, title, author, pages: pdf.numPages, nav, entries: entries || [],
      source: { title: fromMeta ? 'metadata' : printed.title ? 'printed' : 'file', author: metaAuthor(info.Author) ? 'metadata' : printed.author ? 'printed' : 'none' },
    };
  }
  // A stored scan is used when it is of this version.
  const current = s => !!s && s.v === SCAN_VERSION && Array.isArray(s.entries) && typeof s.title === 'string';

  global.TinctPdfScan = { SCAN_VERSION, scan, current, textRows, bodyOf, epigraphRows, furniture, headingLike, headingEntries, outlineEntries, contentsEntries, printedTitle, metaTitle, metaAuthor, cleanFileName, nameLike, isItalic, isBold, isPageNumber };
})(typeof window !== 'undefined' ? window : globalThis);
