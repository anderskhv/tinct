'use strict';
// Tinct · Add a book: where a PDF page's displayed formulas, figures and tables are. No DOM and
// no network, so both readers of a PDF share one set of rules:
//   - the viewer (js/reader.js): a displayed formula is selected whole, a figure gets its chip
//     (with TinctMargin.findFigures, js/margin.js);
//   - Tinct text (js/pdf-text.js, app/src/lab/userBook/pdfEdition.ts): each formula, figure and
//     table becomes a crop of its page standing in the text where it sits, its caption beneath it,
//     its own lettering out of the running text (Anders, 16 Oct 2026).
// The tests import this file directly (app/src/lab/userBook/pdfCrops.test.ts).
(function (root, factory) {
  const api = factory();
  root.TinctPdfRegions = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const median = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] || 0 };

  /**
   * Displayed formulas. TeX sets an equation as many small fragments (fractions, sums, sub- and
   * superscripts) in no reading order. `body`: the page's text items in viewport pixels,
   * [{ x, base, size, w, str, … }] (any other fields ride along); `vp`: { width, height }.
   * -> { order: body in visual line order, prose: line boxes of running text, blocks: the
   * displayed formulas [{ x, y, w, h, members }] } (boxes in page fractions; `members`, the body
   * items each formula holds). Math squeezed between two prose lines is inline, never a block.
   */
  function displayFormulas(body, vp) {
    if (!body.length) return { order: [], blocks: [], prose: [] };
    const longOnes = body.filter(b => b.str.trim().length > 30);
    const size = median((longOnes.length ? longOnes : body).map(b => b.size));
    const lines = [];
    for (const b of [...body].sort((a, c) => a.base - c.base)) {
      const L = lines.at(-1);
      if (L && b.base - L.base < size * 0.42) { L.items.push(b); L.bottom = Math.max(L.bottom, b.base) } else lines.push({ base: b.base, bottom: b.base, items: [b] });
    }
    for (const L of lines) L.items.sort((a, c) => a.x - c.x);
    const order = []; for (const L of lines) order.push(...L.items);
    const MATHY = /[=≡≃≈≤≥<>±×·∑∏∫√∂∞∈→←⇒|^_{}()\[\]Ͱ-Ͽ∀-⋿]/;
    const FN = /^(ln|log|exp|sin|cos|tan|max|min|lim|det|sup|inf|arg|mod|var|pr)$/i;
    const wordsOf = items => items.map(b => b.str.trim()).filter(Boolean);
    const isProse = words => { const t = words.join(' ').split(/[^A-Za-zÀ-ɏ’']+/).filter(w => w.length >= 2 && !FN.test(w)); return t.some(w => w.length >= 6) || t.length >= 3 };
    // A prose line can end in a piece of a formula far to its right ("or, equivalently,      ( )"): split it off.
    const split = [];
    for (const L of lines) {
      const segs = [[L.items[0]]]; let a = L.items[0];
      for (const b of L.items.slice(1)) { if (b.str.trim() && a.str.trim() && b.x - (a.x + a.w) > size * 3) segs.push([b]); else segs.at(-1).push(b); if (b.str.trim()) a = b }
      if (segs.length > 1 && isProse(wordsOf(L.items))) for (const g of segs) split.push({ base: L.base, bottom: L.bottom, items: g });
      else split.push(L);
    }
    const kind = L => {
      const words = wordsOf(L.items);
      if (!words.length || isProse(words)) return 'T';
      const mathy = words.some(w => MATHY.test(w)) || L.items.some(b => b.str.trim() && Math.abs(b.size - size) > size * 0.15);
      if (mathy && (words.length >= 2 || words[0].length >= 3)) return 'M';
      return words.every(w => w.length <= 4 && !/[.,;:]$/.test(w)) ? 'F' : 'T';
    };
    const kinds = split.map(kind);
    const tBases = split.filter((L, i) => kinds[i] === 'T').map(L => L.base);
    const gaps = tBases.slice(1).map((b, i) => b - tBases[i]).filter(g => g > size * 0.8 && g < size * 2);
    const lead = gaps.length ? median(gaps) : size * 1.25;
    const runs = []; let cur = null;
    split.forEach((L, i) => {
      if (kinds[i] === 'T') { cur = null; return }
      if (cur && L.base - cur.lines.at(-1).bottom < size * 2.4) cur.lines.push(L), cur.kinds.push(kinds[i]); else { cur = { lines: [L], kinds: [kinds[i]] }; runs.push(cur) }
    });
    // Displayed formulas stand apart from the prose; math squeezed between two prose lines is inline.
    const blocks = runs.filter(r => {
      if (!r.kinds.includes('M')) return false;
      const first = r.lines[0].base, last = r.lines.at(-1).bottom;
      const above = tBases.filter(b => b < first - 1).at(-1), below = tBases.find(b => b > last + 1);
      const both = (above === undefined || first - above < lead * 1.1) && (below === undefined || below - last < lead * 1.1);
      const either = (above !== undefined && first - above < lead * 0.9) || (below !== undefined && below - last < lead * 0.9);
      return !both && !either;
    });
    const box = (items, pad) => { let l = Infinity, t = Infinity, r = -Infinity, btm = -Infinity; for (const b of items) { l = Math.min(l, b.x); r = Math.max(r, b.x + b.w); t = Math.min(t, b.base - b.size * 0.9); btm = Math.max(btm, b.base + b.size * 0.3) } return { x: (l - pad) / vp.width, y: (t - pad) / vp.height, w: (r - l + pad * 2) / vp.width, h: (btm - t + pad * 2) / vp.height } };
    const prose = split.filter((L, i) => kinds[i] === 'T').map(L => box(L.items, size * 0.15));
    return {
      order, prose,
      blocks: blocks.map(B => { const members = B.lines.flatMap(L => L.items); return { ...box(members, size * 0.25), members } }),
    };
  }

  const MATH = /[=≡≃≈≤≥<>±×·∑∏∫√∂∞∈∉⊂⊆∪∩→←↦⇒⇔∀∃∇^_{}|⊗⊕Ͱ-Ͽ\u2200-\u22FF\u{1D400}-\u{1D7FF}]/u;
  const EQUATION_NUMBER = /^\(?\d{1,3}(?:\.\d{1,3})?[a-z]?\)?[.,]?$/;
  const meets = (a, b, gap = 0) => a.x < b.x + b.w + gap && a.x + a.w > b.x - gap && a.y < b.y + b.h + gap && a.y + a.h > b.y - gap;
  const clip = q => { const x = Math.max(0, q.x), y = Math.max(0, q.y); return { ...q, x, y, w: Math.min(1, q.x + q.w) - x, h: Math.min(1, q.y + q.h) - y } };

  /**
   * A page's regions for Tinct text: each figure and table TinctMargin.findFigures found (with its
   * caption's label, text and box), and each displayed formula outside them. A figure without a
   * caption counts only when it is a picture of some size (a fifth of the page wide, a sixteenth
   * high): a rule, a logo or a stray mark is no figure. `figures`, `captions` as findFigures returns
   * them; `blocks` as displayFormulas does. All page fractions, top left at 0.
   * -> [{ kind: 'figure' | 'table' | 'equation', x, y, w, h, label?, caption?, captionBox? }], top first.
   */
  function pageRegions({ figures = [], captions = [], blocks = [], pad = 0.004 } = {}) {
    const out = [];
    (figures || []).forEach((f, i) => {
      if (!f || !(f.w > 0) || !(f.h > 0)) return;
      const c = (captions || []).find(k => k && k.fig === i);
      if (!c && (f.w < 0.2 || f.h < 0.0625)) return;
      out.push(clip({ kind: c?.kind === 'table' ? 'table' : 'figure', x: f.x - pad, y: f.y - pad, w: f.w + pad * 2, h: f.h + pad * 2, ...(c ? { label: c.label, caption: c.text, captionBox: c.box } : {}) }));
    });
    const pictures = out.slice();
    for (const b of blocks || []) {
      if (!b || !(b.w > 0) || !(b.h > 0) || pictures.some(f => meets(b, f))) continue;
      // An equation's number alone ("(2)" beside a formula written in words, which stays text) is no formula.
      const said = Array.isArray(b.members) ? b.members.map(m => String(m.str || '')).join('').replace(/\s+/g, '') : '';
      if (said && EQUATION_NUMBER.test(said)) continue;
      // Nor is a word split off a line of prose ("below).", far right of a justified line): a formula carries mathematics.
      const spoken = Array.isArray(b.members) ? b.members.map(m => String(m.str || '')).join(' ') : '';
      const tokens = spoken.split(/\s+/).filter(Boolean);
      if (tokens.length && !MATH.test(spoken) && /\p{Ll}{4}/u.test(spoken) && tokens.every(t => /^[("‘“]?[\p{L}'’-]*[).,;:!?"’”]*$/u.test(t))) continue;
      // Nor names and words set apart (a title page's authors, marked with ∗ and †): a formula is mostly symbols and single letters.
      const chars = spoken.replace(/\s/g, '').length, letters = (spoken.match(/\p{L}/gu) || []).length;
      if (chars && letters / chars >= 0.75 && tokens.filter(t => /\p{L}{3,}/u.test(t)).length >= 3) continue;
      // Nor a numbered heading or a label without any mathematics ("3.12 Time").
      if (!MATH.test(spoken) && /\p{Lu}\p{Ll}{3,}/u.test(spoken) && tokens.length <= 6) continue;
      out.push(clip({ kind: 'equation', x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 }));
    }
    return out.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  /**
   * A page's lines of text, from its items (viewport pixels, as displayFormulas takes them): each
   * line's box in page fractions, its word count and how much of it is letters.
   */
  function textLines(body, vp, splitGaps = false) {
    const lines = [];
    const size = median(body.map(b => b.size)) || 10;
    for (const b of [...body].filter(b => String(b.str || '').trim()).sort((a, c) => a.base - c.base || a.x - c.x)) {
      const L = lines.at(-1);
      if (L && Math.abs(b.base - L.base) < Math.min(b.size, size) * 0.42) L.items.push(b); else lines.push({ base: b.base, items: [b] });
    }
    const separated = !splitGaps ? lines : lines.flatMap(L => {
      const items = [...L.items].sort((a, b) => a.x - b.x);
      if (items.length >= 6 && items.every(b => /^\S{1,5}$/.test(b.str.trim()))) return [L];
      const groups = [];
      for (const item of items) {
        const group = groups.at(-1), previous = group?.at(-1);
        if (!previous || item.x - previous.x - previous.w > size * 3) groups.push([item]);
        else group.push(item);
      }
      return groups.map(items => ({ ...L, items }));
    });
    return separated.map(L => {
      // Widely spaced single-token ticks are an axis, not a sentence. Combining
      // month labels into one prose line would discard the chart containing them.
      const items = [...L.items].sort((a, b) => a.x - b.x);
      const gaps = items.slice(1).filter((b, i) => b.x - items[i].x - items[i].w > Math.max(b.size, items[i].size)).length;
      const labels = items.length >= 6 && items.every(b => /^\S{1,5}$/.test(b.str.trim())) && gaps >= (items.length - 1) * .75;
      const text = L.items.map(b => b.str).join(' ').replace(/\s+/g, ' ').trim(), chars = text.replace(/\s/g, '').length;
      let l = Infinity, r = -Infinity, t = Infinity, btm = -Infinity;
      for (const b of L.items) { l = Math.min(l, b.x); r = Math.max(r, b.x + b.w); t = Math.min(t, b.base - b.size * 0.8); btm = Math.max(btm, b.base + b.size * 0.2) }
      return { x: l / vp.width, y: t / vp.height, w: (r - l) / vp.width, h: (btm - t) / vp.height, labels, text, words: text.split(' ').length, letters: chars ? (text.match(/\p{L}/gu) || []).length / chars : 0 };
    });
  }
  /**
   * Figures and tables kept off the running text around them: a line of prose (eight words or more,
   * mostly letters) inside a figure's box near its top or bottom (a footnote under a table, the line
   * above a diagram) is cut off the box; a box holding three such lines, or two after the cut, is no
   * figure (findFigures read text as ink). Formulas are left as they are. `lines`: textLines. -> the regions kept.
   */
  function trimRegions(regions, lines) {
    const running = (lines || []).filter(L => !L.labels && L.words >= 8 && L.letters >= 0.7);
    const inside = (g, L) => { const cy = L.y + L.h / 2; return cy > g.y && cy < g.y + g.h && Math.min(L.x + L.w, g.x + g.w) - Math.max(L.x, g.x) >= L.w * 0.5 };
    const out = [];
    const crosses = (g, L) => Math.min(L.y + L.h, g.y + g.h) - Math.max(L.y, g.y) > L.h * 0.3 && Math.min(L.x + L.w, g.x + g.w) - Math.max(L.x, g.x) > 0;
    for (const g0 of regions || []) {
      // A formula that a line of prose runs through is part of that line (P_drop = 0.1 at the end of a sentence): no crop.
      // Otherwise it takes in the whole of its lines: "Attention(Q, K, V) = softmax(" before the fraction is the formula's too.
      if (g0.kind === 'equation') {
        if (running.some(L => crosses(g0, L))) continue;
        const g = { ...g0 };
        for (const L of lines || []) {
          const cy = L.y + L.h / 2;
          if (cy <= g0.y || cy >= g0.y + g0.h) continue;
          const l = Math.min(g.x, L.x - 0.004), r = Math.max(g.x + g.w, L.x + L.w + 0.004), t = Math.min(g.y, L.y - 0.002), b = Math.max(g.y + g.h, L.y + L.h + 0.002);
          Object.assign(g, { x: Math.max(0, l), y: Math.max(0, t), w: Math.min(1, r) - Math.max(0, l), h: Math.min(1, b) - Math.max(0, t) });
        }
        out.push(g); continue;
      }
      const g = { ...g0 };
      // A caption set above a table ends at its sentence: short lines after it (the table's own header) are the table's.
      if (g.captionBox && g.captionBox.y + g.captionBox.h / 2 < g.y + g.h / 2) {
        const c = g.captionBox, capLines = (lines || []).filter(L => { const cy = L.y + L.h / 2; return cy > c.y && cy < c.y + c.h && Math.min(L.x + L.w, c.x + c.w) - Math.max(L.x, c.x) > 0 }).sort((a, b) => a.y - b.y);
        while (capLines.length > 1 && capLines.at(-1).words <= 6 && !/[.:]$/.test(capLines.at(-1).text || '')) capLines.pop();
        const last = capLines.at(-1);
        if (last) g.captionBox = { ...c, h: Math.max(0.005, last.y + last.h - c.y) };
      }
      // Its caption is set beneath the crop as text, never inside it: a caption above or below is cut off the box.
      const cap = g.captionBox;
      if (cap && Math.min(cap.y + cap.h, g.y + g.h) - Math.max(cap.y, g.y) > 0 && Math.min(cap.x + cap.w, g.x + g.w) - Math.max(cap.x, g.x) > 0) {
        if (cap.y + cap.h / 2 < g.y + g.h / 2) { const bottom = g.y + g.h; g.y = cap.y + cap.h + 0.002; g.h = Math.max(0, bottom - g.y) }
        else g.h = Math.max(0, cap.y - 0.002 - g.y);
      }
      const mid = g.y + g.h / 2, hits = running.filter(L => inside(g, L));
      // Three lines of prose in it: findFigures read text as ink.
      const bottomNotes = g.captionBox && hits.every(L => L.y >= g.y + g.h * .75);
      if (hits.length >= 3 && !bottomNotes) continue;
      const below = hits.filter(L => L.y + L.h / 2 >= mid).sort((a, b) => a.y - b.y)[0];
      const above = hits.filter(L => L.y + L.h / 2 < mid).sort((a, b) => (b.y + b.h) - (a.y + a.h))[0];
      if (below) g.h = Math.max(0, below.y - 0.002 - g.y);
      if (above) { const bottom = g.y + g.h; g.y = above.y + above.h + 0.002; g.h = Math.max(0, bottom - g.y) }
      if (g.h < 0.02 || running.filter(L => inside(g, L)).length >= 2) continue;
      out.push(g);
    }
    return out;
  }

  /**
   * How large a region's crop is drawn (its pixels), sharp at the device's pixel ratio: a figure or a
   * table fills the reading column (`column`, CSS pixels), a formula stands at the size of the text
   * around it (TEXT_SCALE CSS pixels to a PDF point), never wider than the column; the long side
   * at most MAX_SIDE pixels. `region` in page fractions, `page` its size in PDF points.
   * -> { width, height, css: { width, height } } (`css`: the size it is drawn at, at most).
   */
  const MAX_SIDE = 1568, TEXT_SCALE = 1.4;
  function cropSize(region, page, { dpr = 1, column = 680 } = {}) {
    const wPt = region.w * page.w, hPt = region.h * page.h;
    if (!(wPt > 0) || !(hPt > 0)) return null;
    const cssW = region.kind === 'equation' ? Math.min(column, wPt * TEXT_SCALE) : column;
    const cssH = cssW * hPt / wPt;
    const ratio = Math.max(1, Math.min(3, dpr || 1));
    const fit = Math.min(1, MAX_SIDE / Math.max(cssW * ratio, cssH * ratio));
    return { width: Math.max(1, Math.round(cssW * ratio * fit)), height: Math.max(1, Math.round(cssH * ratio * fit)), css: { width: Math.round(cssW), height: Math.round(cssH) } };
  }

  /**
   * A page's regions for Tinct text, from what the croppers read of it (js/pdf-text-view.js, pdfEdition.ts): its ink at
   * 240 px wide (`ink`, W x H, 1 where dark), its text items as page fractions (`spans`, for findFigures) and in viewport
   * pixels (`body`, `vp`, for displayFormulas). `margin`: TinctMargin (findFigures). -> trimRegions' regions.
   */
  function find({ ink, W, H, spans, body, vp, captionColumns = false }, margin) {
    // A caption in a separate side column establishes a gutter. Keep math
    // fragments on its two sides apart: axis ticks otherwise join an adjacent
    // displayed equation, erase the plot from the raster, and grow its crop left.
    const captions = captionColumns ? body.filter(b => /^(?:Figure|Fig\.|Table|Figur|Tabel)\s+\d/i.test(b.str.trim())) : [];
    const cuts = [...new Set(captions.map(b => b.x - b.size * .5))].filter(x =>
      x > vp.width * .4 && x < vp.width * .85 &&
      !body.some(b => b.base > vp.height * .1 && b.base < vp.height * .95 && b.x < x && b.x + b.w > x));
    const cut = cuts[0];
    const columns = cut === undefined ? [body] : [body.filter(b => b.x < cut), body.filter(b => b.x >= cut)];
    const pictures = cut === undefined ? [] : margin.findFigures({ ink, W, H, spans, formulas: [] }).figures.filter(f => f.label);
    const blocks = columns.flatMap((column, index) => displayFormulas(column, vp).blocks.filter(block =>
      !index || !pictures.some(picture => meets(block, picture))));
    const found = margin.findFigures({ ink, W, H, spans, formulas: blocks });
    const regions = pageRegions({ figures: found.figures, captions: found.captions, blocks });
    if (cut === undefined) return trimRegions(regions, textLines(body, vp));
    return regions.flatMap(region => {
      const column = columns[(region.x + region.w / 2) * vp.width >= cut ? 1 : 0];
      // Formula padding must not pull in a nearby prose line, or grow across
      // horizontal whitespace to an unrelated phrase beside the equation.
      const columnLines = textLines(column, vp, true);
      const bounded = { ...region };
      if (region.kind === 'equation') for (const L of columnLines) {
        if (L.words < 3 || L.letters < .7 || L.x >= region.x + region.w || L.x + L.w <= region.x) continue;
        const center = L.y + L.h / 2;
        if (center < region.y && L.y + L.h > bounded.y) {
          const bottom = bounded.y + bounded.h;
          bounded.y = L.y + L.h + .001; bounded.h = bottom - bounded.y;
        } else if (center > region.y + region.h && L.y < bounded.y + bounded.h) bounded.h = L.y - .001 - bounded.y;
      }
      const lines = columnLines.filter(L => region.kind !== 'equation' ||
        L.y + L.h / 2 >= bounded.y && L.y + L.h / 2 <= bounded.y + bounded.h && L.x < bounded.x + bounded.w && L.x + L.w > bounded.x);
      return trimRegions([bounded], lines);
    });
  }
  /**
   * `find`, off the main thread (js/pdf-regions-worker.js at `url`) while the pages are drawn on it; here instead where a
   * worker cannot start or fails, and until it has loaded (a short document never waits for it). The same rules either
   * way, so the same regions. The worker stops when idle.
   * -> input => Promise<regions>
   */
  function finder(url, margin) {
    let worker = null, ready = false, seq = 0, rest = null;
    const waiting = new Map();
    const here = input => new Promise(resolve => resolve(find(input, margin)));
    const close = () => { clearTimeout(rest); try { worker?.terminate() } catch {} worker = null; ready = false };
    const fail = () => { close(); url = null; const left = [...waiting.values()]; waiting.clear(); for (const w of left) w.here() };
    const start = () => {
      if (worker || !url || typeof Worker !== 'function') return worker;
      try {
        worker = new Worker(url);
        worker.onmessage = e => {
          if (e.data?.ready) { ready = true; rest = setTimeout(close, 4000); return }
          const w = waiting.get(e.data?.id); if (!w) return;
          waiting.delete(e.data.id);
          if (e.data.error) w.here(); else w.resolve(e.data.regions);
          if (!waiting.size) { clearTimeout(rest); rest = setTimeout(close, 4000) }
        };
        worker.onerror = e => { e?.preventDefault?.(); fail() };
      } catch { worker = null; url = null }
      return worker;
    };
    return input => {
      if (!start() || !ready) return here(input);
      clearTimeout(rest);
      return new Promise((resolve, reject) => {
        const id = ++seq;
        waiting.set(id, { resolve, here: () => here(input).then(resolve, reject) });
        try { worker.postMessage({ id, ...input }) } catch { waiting.delete(id); here(input).then(resolve, reject) }
      });
    };
  }

  return { displayFormulas, pageRegions, textLines, trimRegions, cropSize, find, finder, MAX_SIDE, TEXT_SCALE };
});
