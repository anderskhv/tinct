'use strict';
// Tinct · Add a book: reading order around figures (docs/margin/FIXES-2026-10-15.md, long books, item 11).
// A figure's labels and its caption are not part of the body's flow. Where body text wraps beside a
// figure, a PDF's text comes out interleaved ("…before one side were a total of 198 input units …"),
// both in a selection (the text layer sorts lines by height) and in the text the companion reads (the
// PDF's own order). This finds those items so the reader can keep them out of the flow:
//   roles(items, view)  -> one role per text item: 'body', 'caption' or 'figure' (null for empty ones)
//   pageText(items, roles) -> the page's text: the body in the PDF's order, then each caption and the
//                             figure's labels after it, as their own paragraphs; a superscript as ^ (n^2)
//   scripts(items), shown(items, marks, i) -> which items are superscripts, and an item's text as read
//   suspect(items), hidden(items, view, ink, W, H) -> text a placed figure carries clipped out of sight
// Pure: positioned pdf.js text items in, plain values out (the tests run it in Node). Figure
// detection itself (the chip, PR E) is separate; this only orders text.
(function (global) {
  // "Figure 16.1:", "Fig. 3.", "Table 2 —", "Algorithm 1:" at the start of a line.
  const CAPTION = /^(?:Figure|Fig\.|FIGURE|Table|TABLE|Algorithm|Exhibit|Plate)\s*(?:[A-Z]\.)?\d+(?:[.\-–]\d+)*[a-z]?\s*(?:[:|—–]|\.(?!\d)|-(?=\s))/;
  const sizeOf = it => Math.hypot(it.transform[2], it.transform[3]) || it.height || 0;
  const rotated = it => Math.abs(it.transform[1]) > 0.01 * Math.abs(it.transform[0]) || Math.abs(it.transform[2]) > 0.01 * Math.abs(it.transform[3]);
  const median = list => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0 };
  const quantile = (list, q) => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0 };

  /* ---------- Superscripts (morning retest 16 Oct, item 1) ----------
     TeX sets an exponent as its own item, smaller and raised ("n" then "2" in O(n²·d), "10" then "18" in
     3.3·10¹⁸). Read as a line of its own, it left the body (a figure's label), so the companion read
     "O(n · d)" and "3.3 · 10". An item set at most 0.85 of the size of the item it follows on the line, raised
     by 0.2 to 0.75 of that item's size and starting where it ends, is a superscript of it; the items that run
     on after it, raised and small, are the same superscript ("2" "i/d" "model" in 10000^(2i/dmodel)). It is
     written with ^ ("n^2", "10^18", "10000^(2i/dmodel)"), keeps its base's place and role, and the same items
     always give the same text. A footnote mark is not an exponent: symbols only (∗ † ‡), or digits after a word
     of four letters or more or after punctuation, stay as printed. */
  const FOOTNOTE_SYMBOLS = /^[*∗†‡§¶♯♮#]+$/u;
  /** One mark per item: null, or { base, first, last, caret, paren } for an item of a superscript run. */
  function scripts(items) {
    const list = Array.isArray(items) ? items : [];
    const marks = list.map(() => null);
    const upright = it => it && typeof it.str === 'string' && it.transform && !rotated(it);
    let base = -1, prev = -1, run = [];
    const close = () => {
      if (!run.length) return;
      const text = run.map(i => list[i].str.trim()).join('');
      const before = list[base].str.trimEnd();
      const footnote = FOOTNOTE_SYMBOLS.test(text) || (/^\d{1,3}$/.test(text) && (/\p{L}{4,}$/u.test(before) || /[.,;:]$/.test(before)));
      const paren = !/^(?:\d+|\p{L}|[-−+]?\d+|[′″'*∗†‡]+)$/u.test(text);
      run.forEach((i, k) => { marks[i] = { base, first: k === 0, last: k === run.length - 1, caret: !footnote, paren: !footnote && paren } });
      run = [];
    };
    list.forEach((it, i) => {
      if (!upright(it)) return;
      if (!it.str.trim()) return; // a space between keeps the run (it is written as it stands)
      const size = sizeOf(it), x = it.transform[4], y = it.transform[5];
      if (base >= 0) {
        const b = list[base], bs = sizeOf(b), rise = y - b.transform[5];
        const p = list[prev], end = p.transform[4] + (p.width || 0);
        const near = x >= end - bs * 0.5 && x <= end + bs * 0.8;
        if (near && bs > 0 && size <= bs * 0.85 && rise >= bs * 0.2 && rise <= bs * 0.75) { run.push(i); prev = i; return }
      }
      close();
      base = i; prev = i;
    });
    close();
    return marks;
  }
  /** An item's text as read: a superscript's first item opens with ^ (or ^( ), its last closes the bracket. */
  function shown(list, marks, i) {
    const m = marks && marks[i], str = list[i].str;
    if (!m || !m.caret) return str;
    return (m.first ? (m.paren ? '^(' : '^') : '') + str.trim() + (m.last && m.paren ? ')' : '');
  }

  /** Visual segments: items on one baseline, split where a gap is wider than 1.5 em. Top first. */
  function segmentsOf(items, marks = null) {
    const rows = [];
    items.forEach((it, i) => {
      if (!it || typeof it.str !== 'string' || !it.str.trim() || !it.transform || rotated(it)) return;
      if (marks && marks[i]) return; // a superscript goes with its base (roles)
      const size = sizeOf(it), y = it.transform[5];
      if (size < 0.5) return;
      let row = rows.find(r => Math.abs(r.y - y) < Math.max(1, Math.min(r.size, size) * 0.5));
      if (!row) { row = { y, size, parts: [] }; rows.push(row) }
      row.parts.push({ i, x: it.transform[4], x2: it.transform[4] + (it.width || 0), size, str: it.str });
    });
    const segs = [];
    for (const row of rows.sort((a, b) => b.y - a.y)) {
      const parts = row.parts.sort((a, b) => a.x - b.x);
      let cur = null;
      for (const p of parts) {
        if (cur && p.x - cur.x2 <= Math.max(p.size, cur.size) * 1.5) { cur.items.push(p.i); cur.x2 = Math.max(cur.x2, p.x2); cur.text += (p.x - cur.lastX2 > p.size * 0.12 ? ' ' : '') + p.str; cur.size = Math.max(cur.size, p.size); cur.lastX2 = p.x2 }
        else { cur = { y: row.y, x: p.x, x2: p.x2, lastX2: p.x2, size: p.size, items: [p.i], text: p.str }; segs.push(cur) }
      }
    }
    for (const s of segs) { s.text = s.text.replace(/\s+/g, ' ').trim(); s.chars = s.text.length }
    return segs;
  }

  /** The body's size: the one most characters are set in (to the half point). */
  function bodySize(segs) {
    const by = new Map();
    for (const s of segs) { const k = Math.round(s.size * 2) / 2; by.set(k, (by.get(k) || 0) + s.chars) }
    return [...by].sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
  }

  /** Text columns: left edges shared by several long body-size lines, each with its right edge. */
  function columnsOf(segs, size) {
    const longs = segs.filter(s => s.chars >= 30 && Math.abs(s.size - size) <= size * 0.12);
    const groups = [];
    for (const s of [...longs].sort((a, b) => a.x - b.x)) {
      const g = groups.at(-1);
      if (g && s.x - g.last <= size * 1.5) { g.segs.push(s); g.last = s.x } else groups.push({ segs: [s], last: s.x });
    }
    const need = Math.max(3, Math.floor(longs.length * 0.08));
    return groups.filter(g => g.segs.length >= need).map(g => {
      const left = median(g.segs.map(s => s.x)), right = quantile(g.segs.map(s => s.x2), 0.9);
      return { left, right, top: Math.max(...g.segs.map(s => s.y)), bottom: Math.min(...g.segs.map(s => s.y)), segs: g.segs };
    });
  }

  /**
   * The areas beside text that wraps round a figure: three or more lines in a row of one column that
   * end well short of its right edge at about the same place (the figure is to their right), or a
   * column of its own that stands where another column's lines are absent and ends at the same right
   * edge (the figure is to its left). Ragged or short last lines never run three in a row at one place.
   */
  function wrapZones(cols, size) {
    const zones = [];
    for (const c of cols) {
      const lines = c.segs.filter(s => Math.abs(s.x - c.left) <= size * 1.5).sort((a, b) => b.y - a.y);
      const pitch = median(lines.slice(1).map((s, k) => lines[k].y - s.y).filter(g => g > 0)) || size * 1.3;
      let run = [];
      const close = () => {
        if (run.length >= 3) {
          const right = Math.max(...run.map(s => s.x2));
          const next = cols.filter(o => o.left > c.left + size * 2).sort((a, b) => a.left - b.left)[0];
          zones.push({ x0: right + size * 0.3, x1: next ? next.left - size * 0.5 : Infinity, y0: Math.min(...run.map(s => s.y)) - pitch * 3, y1: Math.max(...run.map(s => s.y)) + pitch * 3 });
        }
        run = [];
      };
      for (const s of lines) {
        const short = s.x2 < c.right - size * 4;
        const prev = run.at(-1);
        if (short && (!prev || (prev.y - s.y <= pitch * 2.2 && Math.abs(Math.max(...run.map(r => r.x2)) - s.x2) <= size * 6))) run.push(s);
        else { close(); if (short) run.push(s) }
      }
      close();
    }
    for (const a of cols) for (const b of cols) {
      if (a === b || b.left >= a.left - size * 3 || Math.abs(a.right - b.right) > size * 2) continue;
      const overlap = b.segs.some(s => s.y <= a.top + size && s.y >= a.bottom - size);
      if (!overlap) zones.push({ x0: -Infinity, x1: a.left - size * 0.3, y0: a.bottom - size * 4, y1: a.top + size * 4 });
    }
    return zones;
  }

  /**
   * One role per item. `view`: the page's box ([x0, y0, x1, y1], pdf.js page.view), so the running
   * heads and feet at the page's edges are never taken for figure labels.
   */
  function roles(items, view = null) {
    const list = Array.isArray(items) ? items : [];
    const out = list.map(it => (it && typeof it.str === 'string' && it.str.trim() ? 'body' : null));
    const marks = scripts(list);
    const segs = segmentsOf(list, marks);
    if (!segs.length) return out;
    const size = bodySize(segs), cols = columnsOf(segs, size);
    const [vy0, vy1] = view ? [view[1], view[3]] : [Math.min(...segs.map(s => s.y)) - size * 4, Math.max(...segs.map(s => s.y)) + size * 4];
    const edge = s => s.y > vy1 - (vy1 - vy0) * 0.06 || s.y < vy0 + (vy1 - vy0) * 0.06;
    const atColumn = s => cols.some(c => Math.abs(s.x - c.left) <= size * 1.5);
    const mark = (s, role) => { for (const i of s.items) out[i] = role; s.role = role };
    // Captions: a line that starts "Figure N:" (or Table, Algorithm), and the lines of the same size that run on below it.
    for (let k = 0; k < segs.length; k++) {
      const s = segs[k];
      if (s.role || !CAPTION.test(s.text)) continue;
      // Running text that only names a figure ("Figure 3 shows …" has no colon) is not a caption; a caption set in
      // the body's own size must start its column's line.
      if (Math.abs(s.size - size) <= size * 0.05 && !atColumn(s) && cols.length) continue;
      mark(s, 'caption');
      let last = s, x0 = s.x, x2 = s.x2, count = 0;
      for (let j = k + 1; j < segs.length && count < 12; j++) {
        const t = segs[j];
        if (t.role || t.y >= last.y) continue;
        if (last.y - t.y > Math.max(t.size, last.size) * 1.8) break;
        if (Math.abs(t.size - s.size) > s.size * 0.1 || t.x2 < x0 - size || t.x > x2 + size) continue;
        if (Math.abs(t.x - x0) > size * 2 && Math.abs((t.x + t.x2) / 2 - (x0 + x2) / 2) > size * 2) continue;
        // A line that shares its row with other text under the caption is a table's row or a figure's labels, never
        // the caption's next line (Table 2's "BLEU" beside "Training Cost (FLOPs)", ByteNet's "23.75" in the GAN and
        // Attention papers' tables, which a caption above them took in).
        if (segs.some(o => o !== t && !o.role && Math.abs(o.y - t.y) < Math.min(o.size, t.size) * 0.5 && o.x2 >= x0 - size && o.x <= x2 + size)) break;
        // A caption in the body's size ends at a line that closes a sentence short of its width.
        if (Math.abs(s.size - size) <= size * 0.05 && /[.!?]$/.test(last.text) && last.x2 < x2 - size * 3) break;
        mark(t, 'caption'); x2 = Math.max(x2, t.x2); last = t; count++;
      }
    }
    const captioned = segs.some(s => s.role === 'caption');
    // Labels beside wrapped text: anything inside a wrap zone that is not the body's own line.
    const zones = wrapZones(cols, size);
    const inZone = s => zones.some(z => (s.x + s.x2) / 2 >= z.x0 && (s.x + s.x2) / 2 <= z.x1 && s.y >= z.y0 && s.y <= z.y1);
    // A label of smaller type can stand at a column's left edge inside the zone (ResNet's "relu" under
    // its boxes, in the figure paper): a figure's label as PR E's detection takes it, never body text.
    const label = s => s.size < size * 0.88 && s.chars <= 40;
    for (const s of segs) if (!s.role && !edge(s) && inZone(s) && (!atColumn(s) || label(s))) mark(s, 'figure');
    // On a page with a caption: short lines of smaller type standing on their own (a diagram's labels, a plot's ticks).
    if (captioned) for (const s of segs) {
      if (s.role || edge(s) || atColumn(s) || s.size >= size * 0.88 || s.chars > 40) continue;
      if (segs.some(o => o !== s && !o.role && Math.abs(o.y - s.y) < size * 0.5 && Math.abs(o.size - size) <= size * 0.12 && o.chars >= 30)) continue;
      mark(s, 'figure');
    }
    // Rotated text on a figure page is an axis label.
    if (captioned || zones.length) list.forEach((it, i) => { if (out[i] === 'body' && it.transform && rotated(it)) out[i] = 'figure' });
    // A superscript stands where its base stands.
    marks.forEach((m, i) => { if (m && out[i]) out[i] = out[m.base] });
    return out;
  }

  /** The page's text: the body as the PDF orders it, then captions and figure labels, each a paragraph of its own. */
  function pageText(items, itemRoles = roles(items)) {
    const list = Array.isArray(items) ? items : [];
    const marks = scripts(list);
    const join = picked => picked.map(i => shown(list, marks, i) + (list[i].hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ').trim();
    const body = [], caption = [], figure = [];
    list.forEach((it, i) => { const r = itemRoles[i]; if (r === 'caption') caption.push(i); else if (r === 'figure') figure.push(i); else if (it && typeof it.str === 'string') body.push(i) });
    const byPlace = (a, b) => (list[b].transform[5] - list[a].transform[5]) || (list[a].transform[4] - list[b].transform[4]);
    const lines = idx => {
      const rows = [];
      for (const i of [...idx].sort(byPlace)) { const row = rows.at(-1); if (row && Math.abs(list[row[0]].transform[5] - list[i].transform[5]) < sizeOf(list[i]) * 0.5) row.push(i); else rows.push([i]) }
      return rows.map(row => row.map(i => shown(list, marks, i).trim()).filter(Boolean).join(' ').replace(/ (?=\^)/g, '')).filter(Boolean);
    };
    const parts = [join(body)];
    if (caption.length) parts.push(lines(caption).join(' ').replace(/(\p{L})- (\p{Ll})/gu, '$1$2'));
    if (figure.length) parts.push(lines(figure).join('; '));
    return parts.filter(Boolean).join('\n\n');
  }

  /* ---------- Text the page does not show (gloss-test/retest.html and full-battery.html: "wrapped text is scrambled") ----------
     A figure placed from another PDF can carry that PDF's whole page of text, clipped to the figure's box
     (TD-Gammon's network in Sutton and Barto's book carries a page of an earlier draft). pdf.js returns the
     clipped text too, so it interleaved with the page's own lines in selections and in the companion's text.
     Such text is drawn in one go (one run of items in the PDF's order), lies on top of the page's own lines,
     and, where it runs over blank paper, leaves no ink. */
  /** Item boxes in PDF units, upright items only. */
  const boxOf = it => { const h = sizeOf(it); return { x0: it.transform[4], x1: it.transform[4] + (it.width || 0), y0: it.transform[5] - h * 0.2, y1: it.transform[5] + h * 0.8, h } };
  function overlapping(items) {
    const list = [];
    items.forEach((it, i) => { if (it && typeof it.str === 'string' && it.str.trim().length >= 6 && it.transform && !rotated(it) && (it.width || 0) > 0) list.push({ i, b: boxOf(it), s: it.str.trim() }) });
    list.sort((a, b) => a.b.y0 - b.b.y0);
    const pairs = [];
    for (let k = 0; k < list.length; k++) {
      const a = list[k];
      for (let j = k + 1; j < list.length && list[j].b.y0 < a.b.y1; j++) {
        const b = list[j], w = Math.min(a.b.x1, b.b.x1) - Math.max(a.b.x0, b.b.x0), h = Math.min(a.b.y1, b.b.y1) - Math.max(a.b.y0, b.b.y0);
        if (w <= 0 || h <= 0 || a.s === b.s || Math.abs(a.b.y0 - b.b.y0) < Math.min(a.b.h, b.b.h) * 0.2) continue;
        const small = Math.min((a.b.x1 - a.b.x0) * (a.b.y1 - a.b.y0), (b.b.x1 - b.b.x0) * (b.b.y1 - b.b.y0));
        if (w * h > small * 0.3) pairs.push([a.i, b.i]);
      }
    }
    return pairs;
  }
  /** Whether a page may carry text it does not show (lines of text on top of each other): only then is it drawn to look. */
  const suspect = items => overlapping(Array.isArray(items) ? items : []).length >= 3;
  /**
   * The items the page does not show. `ink`: the drawn page, W×H (1 where there is ink); `view`: the page's box.
   * An item of 8 characters or more over blank paper is unseen; the run of items between the first and the last
   * unseen one is the hidden text's, and in it an item that lies on top of the page's own text, or leaves almost
   * no ink, is unseen too. Fewer than three unseen items: nothing is. -> Set of item indexes
   */
  function hidden(items, view, ink, W, H) {
    const list = Array.isArray(items) ? items : [], out = new Set();
    if (!suspect(list) || !ink || !view) return out;
    const vw = view[2] - view[0], vh = view[3] - view[1];
    const look = it => {
      const b = boxOf(it), l = Math.max(0, Math.round(((b.x0 - view[0]) / vw) * W)), r = Math.min(W - 1, Math.round(((b.x1 - view[0]) / vw) * W) - 1);
      const t = Math.max(0, Math.round(((view[3] - (b.y1 - b.h * 0.25)) / vh) * H)), bt = Math.min(H - 1, Math.round(((view[3] - (b.y0 + b.h * 0.2)) / vh) * H));
      if (r - l < 4 || bt < t) return null;
      let cols = 0, run = 0, gap = 0;
      for (let x = l; x <= r; x++) { let any = 0; for (let y = t; y <= bt && !any; y++) any = ink[y * W + x]; if (any) { cols++; run = 0 } else if (++run > gap) gap = run }
      return { cover: cols / (r - l + 1), gap, h: (b.h / vh) * H };
    };
    const blank = [];
    list.forEach((it, i) => {
      const str = it && typeof it.str === 'string' ? it.str.replace(/\s+/g, '') : '';
      if (str.length < 8 || !it.transform || rotated(it)) return;
      const m = look(it);
      if (m && (m.cover < 0.35 || m.gap > Math.max(10, m.h * 2))) blank.push(i);
    });
    if (blank.length < 3) return out;
    const lo = Math.min(...blank), hi = Math.max(...blank);
    // Lying on top of the page's own text (items outside the hidden run), by any amount of a third of the smaller box.
    const upright = i => list[i] && typeof list[i].str === 'string' && list[i].str.trim() && list[i].transform && !rotated(list[i]) && (list[i].width || 0) > 0;
    const onTop = i => {
      if (!upright(i)) return false;
      const a = boxOf(list[i]), aa = (a.x1 - a.x0) * (a.y1 - a.y0);
      for (let j = 0; j < list.length; j++) {
        if (j >= lo && j <= hi || !upright(j)) continue;
        const b = boxOf(list[j]), w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (w > 0 && h > 0 && w * h > Math.min(aa, (b.x1 - b.x0) * (b.y1 - b.y0)) * 0.3 && Math.abs(a.y0 - b.y0) >= Math.min(a.h, b.h) * 0.2) return true;
      }
      return false;
    };
    // In the run, text right against the page's own lines (on them, or between two of them) is the hidden page's;
    // a figure's labels stand apart, over the figure's ink.
    const nearText = i => {
      const a = boxOf(list[i]);
      for (let j = 0; j < list.length; j++) {
        if (j >= lo && j <= hi || !upright(j)) continue;
        const b = boxOf(list[j]);
        if (Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 0 && Math.max(b.y0 - a.y1, a.y0 - b.y1) < Math.min(a.h, b.h) * 0.6) return true;
      }
      return false;
    };
    const gone = i => { if (!upright(i)) return null; if (onTop(i) || nearText(i)) return true; const m = look(list[i]); return !m || m.cover < 0.35 };
    for (let i = lo; i <= hi; i++) if (blank.includes(i) || gone(i) !== false) out.add(i);
    return out;
  }

  global.TinctReadingOrder = { roles, pageText, scripts, shown, CAPTION, suspect, hidden };
})(typeof window !== 'undefined' ? window : globalThis);
