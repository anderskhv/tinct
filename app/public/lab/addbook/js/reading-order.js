'use strict';
// Tinct · Add a book: reading order around figures (docs/margin/FIXES-2026-10-15.md, long books, item 11).
// A figure's labels and its caption are not part of the body's flow. Where body text wraps beside a
// figure, a PDF's text comes out interleaved ("…before one side were a total of 198 input units …"),
// both in a selection (the text layer sorts lines by height) and in the text the companion reads (the
// PDF's own order). This finds those items so the reader can keep them out of the flow:
//   roles(items, view)  -> one role per text item: 'body', 'caption' or 'figure' (null for empty ones)
//   pageText(items, roles) -> the page's text: the body in the PDF's order, then each caption and the
//                             figure's labels after it, as their own paragraphs
// Pure: positioned pdf.js text items in, plain values out (the tests run it in Node). Figure
// detection itself (the chip, PR E) is separate; this only orders text.
(function (global) {
  // "Figure 16.1:", "Fig. 3.", "Table 2 —", "Algorithm 1:" at the start of a line.
  const CAPTION = /^(?:Figure|Fig\.|FIGURE|Table|TABLE|Algorithm|Exhibit|Plate)\s*(?:[A-Z]\.)?\d+(?:[.\-–]\d+)*[a-z]?\s*(?:[:.|—–]|-(?=\s))/;
  const sizeOf = it => Math.hypot(it.transform[2], it.transform[3]) || it.height || 0;
  const rotated = it => Math.abs(it.transform[1]) > 0.01 * Math.abs(it.transform[0]) || Math.abs(it.transform[2]) > 0.01 * Math.abs(it.transform[3]);
  const median = list => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0 };
  const quantile = (list, q) => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0 };

  /** Visual segments: items on one baseline, split where a gap is wider than 1.5 em. Top first. */
  function segmentsOf(items) {
    const rows = [];
    items.forEach((it, i) => {
      if (!it || typeof it.str !== 'string' || !it.str.trim() || !it.transform || rotated(it)) return;
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
    const segs = segmentsOf(list);
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
    return out;
  }

  /** The page's text: the body as the PDF orders it, then captions and figure labels, each a paragraph of its own. */
  function pageText(items, itemRoles = roles(items)) {
    const list = Array.isArray(items) ? items : [];
    const join = picked => picked.map(i => list[i].str + (list[i].hasEOL ? '\n' : '')).join('').replace(/[ \t]+/g, ' ').trim();
    const body = [], caption = [], figure = [];
    list.forEach((it, i) => { const r = itemRoles[i]; if (r === 'caption') caption.push(i); else if (r === 'figure') figure.push(i); else if (it && typeof it.str === 'string') body.push(i) });
    const byPlace = (a, b) => (list[b].transform[5] - list[a].transform[5]) || (list[a].transform[4] - list[b].transform[4]);
    const lines = idx => {
      const rows = [];
      for (const i of [...idx].sort(byPlace)) { const row = rows.at(-1); if (row && Math.abs(list[row[0]].transform[5] - list[i].transform[5]) < sizeOf(list[i]) * 0.5) row.push(i); else rows.push([i]) }
      return rows.map(row => row.map(i => list[i].str.trim()).filter(Boolean).join(' ')).filter(Boolean);
    };
    const parts = [join(body)];
    if (caption.length) parts.push(lines(caption).join(' ').replace(/(\p{L})- (\p{Ll})/gu, '$1$2'));
    if (figure.length) parts.push(lines(figure).join('; '));
    return parts.filter(Boolean).join('\n\n');
  }

  global.TinctReadingOrder = { roles, pageText, CAPTION };
})(typeof window !== 'undefined' ? window : globalThis);
