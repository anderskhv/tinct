'use strict';
// Tinct · Add a book: the page numbers a PDF prints, for a PDF without page labels (docs/margin/
// FIXES-2026-10-15.md, long books, item 10). A book's file page 445 can print 423: the reader cites,
// copies and finds pages by the printed number, so the margin uses it wherever it uses page labels.
//   candidates(items, view) -> the numbers printed at the top or bottom of one page: [{ value, roman }]
//   labels(perPage)          -> one label per page (perPage[i] is file page i + 1's candidates), or null
//   pageOf(value, labels, o) -> the file page a typed page number names (printed first, the file's as the fallback)
// A number counts when the pages around it agree: the same distance between printed and file page
// on at least two neighbours within four pages, in arabic or in roman numerals (front matter). Pages
// between agreeing pages (a blank page, a chapter opening without a number) take the run's number.
// Pure: positioned pdf.js text items in, labels out (the tests run it in Node).
(function (global) {
  const ROMAN = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  const ROMAN_RE = /^[ivxlcdm]{1,7}$/i;
  function romanValue(s) {
    let total = 0, prev = 0;
    for (const ch of s.toLowerCase().split('').reverse()) { const v = ROMAN[ch] || 0; total += v < prev ? -v : v; prev = Math.max(prev, v) }
    return total;
  }
  function toRoman(n) {
    const table = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
    let out = '';
    for (const [v, s] of table) while (n >= v) { out += s; n -= v }
    return out;
  }
  // A canonical roman numeral of front matter's size only (so "mix", "dim" or "civil" are words, not numbers).
  const isRoman = s => ROMAN_RE.test(s) && toRoman(romanValue(s)) === s.toLowerCase() && romanValue(s) <= 100;
  const EDGE = 0.1;
  // A running head below a banner (MacKay's copyright lines fill the top tenth; its "68 4 — The Source Coding
  // Theorem" sits at 751 of 842): the three outermost lines of each edge count too, within its outer 15%.
  const EDGE_WIDE = 0.15, OUTER_LINES = 3;

  /**
   * The numbers on one page's top or bottom edge (its outer tenth, and its three outermost lines in the
 * outer 15%, for a running head below a banner): a line that is only a number
   * ("423", "– 12 –", "xii"), or a running head that starts or ends with one ("423 Chapter 16 …",
   * "16.1. TD-Gammon 423"). `view`: the page's box, pdf.js page.view.
   */
  function candidates(items, view) {
    if (!Array.isArray(items) || !view) return [];
    const [, y0, , y1] = view, h = y1 - y0;
    if (!(h > 0)) return [];
    const all = [];
    for (const it of items) {
      if (!it || typeof it.str !== 'string' || !it.str.trim() || !it.transform) continue;
      const y = it.transform[5];
      if (y < y1 - h * EDGE_WIDE && y > y0 + h * EDGE_WIDE) continue;
      const size = Math.hypot(it.transform[2], it.transform[3]) || 1;
      let row = all.find(r => Math.abs(r.y - y) < size * 0.5);
      if (!row) { row = { y, parts: [] }; all.push(row) }
      row.parts.push({ x: it.transform[4], s: it.str.trim() });
    }
    // Every line in the outer tenth, and the outermost few of each edge in its outer 15%.
    const tops = all.filter(r => r.y > y0 + h / 2).sort((a, b) => b.y - a.y), feet = all.filter(r => r.y <= y0 + h / 2).sort((a, b) => a.y - b.y);
    const rows = [...tops, ...feet].filter(r => !(r.y < y1 - h * EDGE && r.y > y0 + h * EDGE) || tops.indexOf(r) >= 0 && tops.indexOf(r) < OUTER_LINES || feet.indexOf(r) >= 0 && feet.indexOf(r) < OUTER_LINES);
    const out = [];
    const add = (s, edge) => {
      const t = s.replace(/^[-–—\s]+|[-–—\s]+$/g, '');
      if (/^\d{1,4}$/.test(t) && Number(t) >= 1) out.push({ value: Number(t), roman: false, edge });
      else if (isRoman(t)) out.push({ value: romanValue(t), roman: true, edge });
    };
    for (const row of rows) {
      const parts = row.parts.sort((a, b) => a.x - b.x).map(p => p.s);
      const line = parts.join(' ').replace(/\s+/g, ' ').trim();
      const edge = row.y > y0 + h / 2 ? 'top' : 'bottom';
      if (/^[-–—\s]*(?:\d{1,4}|[ivxlcdm]{1,7})[-–—\s]*$/i.test(line)) { add(line, edge); continue }
      // A running head: its first or last word, when that is a number standing alone.
      const first = /^(\d{1,4}|[ivxlcdm]{1,7})\s+\S/i.exec(line), last = /\S\s+(\d{1,4}|[ivxlcdm]{1,7})$/i.exec(line);
      if (first) add(first[1], edge);
      if (last) add(last[1], edge);
    }
    return out;
  }

  /**
   * One label per file page from each page's candidates, or null when the PDF prints no page numbers
   * that hold across pages, or prints its file page numbers (nothing to correct).
   */
  function labels(perPage) {
    const count = Array.isArray(perPage) ? perPage.length : 0;
    if (count < 3) return null;
    const offsets = perPage.map((list, i) => (list || []).map(c => ({ roman: c.roman, d: c.value - (i + 1), value: c.value })));
    const found = new Array(count).fill(null);
    for (let i = 0; i < count; i++) {
      for (const c of offsets[i]) {
        let agree = 0;
        for (let j = Math.max(0, i - 4); j <= Math.min(count - 1, i + 4); j++) if (j !== i && offsets[j].some(o => o.roman === c.roman && o.d === c.d)) agree++;
        if (agree >= 2) { found[i] = { roman: c.roman, d: c.d }; break }
      }
    }
    const known = found.filter(Boolean);
    if (known.length < Math.max(3, count * 0.2)) return null;
    if (known.every(f => !f.roman && f.d === 0)) return null;
    // Pages between two pages of one run take its number; pages after the last arabic page continue it;
    // pages before the first numbered page count on in roman from the first page, as front matter does.
    const out = new Array(count).fill(null);
    for (let i = 0; i < count; i++) if (found[i]) out[i] = found[i];
    for (let i = 0; i < count; i++) {
      if (out[i]) continue;
      let a = i - 1; while (a >= 0 && !found[a]) a--;
      let b = i + 1; while (b < count && !found[b]) b++;
      const before = a >= 0 ? found[a] : null, after = b < count ? found[b] : null;
      if (before && after && before.roman === after.roman && before.d === after.d) out[i] = before;
      else if (before && !before.roman && (!after || i - a <= b - i)) out[i] = before;
      else if (after && after.roman) out[i] = after;
      else if (before && before.roman && (!after || i - a <= b - i)) out[i] = before;
      else if (after && !after.roman && i + 1 + after.d >= 1) out[i] = after;
    }
    const text = out.map((f, i) => {
      if (!f) return toRoman(i + 1);
      const v = i + 1 + f.d;
      return v >= 1 ? (f.roman ? toRoman(v) : String(v)) : toRoman(i + 1);
    });
    // A label printed twice (two runs meeting) keeps its first page; later ones fall back to the file page.
    const seen = new Set();
    return text.map((label, i) => { if (seen.has(label)) return String(i + 1); seen.add(label); return label });
  }

  /**
   * The file page a typed page number names ("Go to page"): the page that prints it ("423", "viii", any case),
   * where exactly one does; where none does (or the file has no labels), a typed number is the file's own page;
   * where several do, a typed number is the file's page and a word ("ii" in two front matters) the one nearest
   * the reader. `labels`: one per file page, or null; `count`: the file's pages; `near`: the reader's page.
   * -> a file page, or 0
   */
  function pageOf(value, labels, { count = 0, near = 1 } = {}) {
    const v = String(value || '').trim().toLowerCase().replace(/^p(?:age|\.)?\s*/, '');
    if (!v) return 0;
    const file = /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= count ? Number(v) : 0;
    const hits = [];
    if (Array.isArray(labels)) labels.forEach((l, i) => { if (String(l ?? '').trim().toLowerCase() === v && i < count) hits.push(i + 1) });
    if (hits.length === 1) return hits[0];
    if (file) return file;
    return hits.length ? hits.reduce((a, b) => (Math.abs(b - near) < Math.abs(a - near) ? b : a)) : 0;
  }

  global.TinctPrintedPages = { candidates, labels, romanValue, toRoman, pageOf };
})(typeof window !== 'undefined' ? window : globalThis);
