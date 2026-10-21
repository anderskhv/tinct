'use strict';
// Tinct · Add a book: the position strip beside a PDF's pages (desktop, 700px and up), and the
// arXiv stamp hidden on page 1. The strip is the whole PDF in a 34px lane at the window's left
// edge: one faint line per text block, the reader's window as a box, a dot per highlight and per
// card. Click or drag moves the window there; it is a slider for the keyboard (one page a step).
// Lines come from each page's text content, computed lazily (the pages near the window first,
// the rest when the browser is idle) and kept per page; a page not read yet shows plain lines.
// js/reader.js mounts it (TinctStrip.create) and masks the stamp as page 1 is drawn (renderPage).
// Pure helpers are exported for the tests (src/addbookStrip.test.ts).
(function (global) {
  /* ---------- The arXiv stamp ---------- */
  // arXiv prints "arXiv:1706.03762v7 [cs.CL] 2 Aug 2023" up the left margin of page 1.
  const STAMP_RE = /^arXiv:\d{4}\.\d{4,5}(v\d+)?\s+\[[^\]]+\]\s+\d{1,2} \w{3} \d{4}$/;
  const rotated = t => Math.abs(t[1]) > 0 || Math.abs(t[2]) > 0;
  /** The stamp among a page's text items (page 1 only, a rotated item matching STAMP_RE), or null. */
  function findStamp(items, pageNumber) {
    if (pageNumber !== 1 || !Array.isArray(items)) return null;
    for (const it of items) {
      const t = it && it.transform;
      if (!t || !rotated(t)) continue;
      if (STAMP_RE.test(String(it.str || '').trim())) return it;
    }
    return null;
  }
  /** The stamp's box in PDF units, padded: x from e − 1.0h − 2 to e + 0.3h + 2, y from f − 2 to f + width + 2. */
  function stampBox(item) {
    const [, , c, d, e, f] = item.transform, h = Math.hypot(c, d);
    return { x0: e - h - 2, x1: e + 0.3 * h + 2, y0: f - 2, y1: f + (item.width || 0) + 2 };
  }
  const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  /** The box's corners through a viewport transform (PDF units -> canvas pixels). */
  function boxCorners(box, transform) {
    return [[box.x0, box.y0], [box.x1, box.y0], [box.x1, box.y1], [box.x0, box.y1]].map(([x, y]) => apply(transform, x, y));
  }
  /** Paint the box white on the drawn page (before the theme turns white into the paper). */
  function maskStamp(ctx, transform, box) {
    const pts = boxCorners(box, transform);
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ---------- A page's text blocks (page fractions) ---------- */
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const median = list => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0 };
  const pct = (list, q) => { const s = [...list].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.floor(s.length * q)))] };
  /**
   * The page's text as blocks: { y0, y1, x0, x1, n, last } in fractions of the page (top down), and
   * the body's left edge and width. `view` is the page's viewport at scale 1 ({ width, height, transform }).
   * Rotated items are left out, and so is text much smaller than the page's own (labels inside figures).
   */
  function pageBlocks(items, view) {
    const W = view.width || 1, H = view.height || 1, vt = view.transform || [1, 0, 0, -1, 0, H];
    const its = [];
    for (const it of items || []) {
      const s = String(it && it.str || '').trim(); if (!s || !it.transform) continue;
      const m = mul(vt, it.transform), size = Math.hypot(m[2], m[3]);
      if (size < 0.5 || Math.abs(m[1]) > size * 1e-3 || Math.abs(m[2]) > size * 1e-3) continue;   // rotated
      its.push({ x: m[4] / W, y: m[5] / H, w: (it.width || 0) * Math.hypot(vt[0], vt[1]) / W, h: size / H });
    }
    if (!its.length) return { blocks: [], body: { x0: 0.15, w: 0.7 } };
    const typical = median(its.map(i => i.h));
    const text = its.filter(i => i.h >= typical * 0.7);
    text.sort((a, b) => a.y - b.y || a.x - b.x);
    const lines = [];
    for (const it of text) {
      const L = lines.slice(-2).find(l => Math.abs(l.y - it.y) < Math.max(l.h, it.h) * 0.45);
      if (L) { L.x0 = Math.min(L.x0, it.x); L.x1 = Math.max(L.x1, it.x + it.w); L.h = Math.max(L.h, it.h) }
      else lines.push({ y: it.y, h: it.h, x0: it.x, x1: it.x + it.w });
    }
    lines.sort((a, b) => a.y - b.y);
    const blocks = [];
    for (const l of lines) {
      const B = blocks[blocks.length - 1], gap = B ? l.y - l.h - B.y1 : 1;
      if (B && gap < Math.max(l.h, B.lh) * 0.9 && Math.abs(l.h - B.lh) < B.lh * 0.25) { B.y1 = l.y; B.n++; B.lx = [l.x0, l.x1]; B.x0 = Math.min(B.x0, l.x0); B.x1 = Math.max(B.x1, l.x1) }
      else blocks.push({ y0: l.y - l.h, y1: l.y, lh: l.h, x0: l.x0, x1: l.x1, n: 1, lx: [l.x0, l.x1] });
    }
    // The body: where long lines start, and how far they run.
    const longs = lines.filter(l => l.x1 - l.x0 >= 0.35);
    const x0 = longs.length ? pct(longs.map(l => l.x0), 0.25) : Math.min(...lines.map(l => l.x0));
    const x1 = longs.length ? pct(longs.map(l => l.x1), 0.9) : Math.max(...lines.map(l => l.x1));
    const body = { x0, w: Math.max(0.05, x1 - x0) };
    const r = v => Math.round(v * 10000) / 10000;
    return { body, blocks: blocks.map(b => ({ y0: r(b.y0), y1: r(b.y1), x0: r(b.x0), x1: r(b.x1), n: b.n, last: r((b.lx[1] - b.lx[0]) / Math.max(1e-6, b.x1 - b.x0)) })) };
  }

  /* ---------- Geometry: pages down the lane ---------- */
  const S = { left: 14, width: 34, x: 18, len: 16, dotX: 40, dot: 5, pitch: 3, dotGap: 6, gap: 6, inset: 14, foot: 16, plain: 4, plainLen: 12 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /**
   * Pages spread evenly from `top` to `bottom` with 6px gaps (smaller when a page would get under 20px). With `weights`
   * (an EPUB's chapters, by their height on the page; 21 Oct 2026) each page's band is its share of the lane, no gaps.
   */
  function geometry(N, top, bottom, weights = null) {
    const H = Math.max(0, bottom - top), n = Math.max(1, N);
    if (weights && weights.length === n) {
      const sum = weights.reduce((a, w) => a + Math.max(0, w), 0) || 1, tops = [], bands = [];
      let y = top;
      for (const w of weights) { tops.push(y); const b = H * Math.max(0, w) / sum; bands.push(b); y += b }
      return { N: n, top, bottom, gap: 0, band: H / n, tops, bands };
    }
    const gap = n > 1 ? Math.min(S.gap, (H / n) * 0.3) : 0;
    return { N: n, top, bottom, gap, band: (H - (n - 1) * gap) / n };
  }
  const yOf = (G, n, f) => G.tops ? G.tops[clamp(n, 1, G.N) - 1] + clamp(f, 0, 1) * G.bands[clamp(n, 1, G.N) - 1] : G.top + (clamp(n, 1, G.N) - 1) * (G.band + G.gap) + clamp(f, 0, 1) * G.band;
  /** The page and the fraction down it at strip y. */
  function atY(G, y) {
    if (G.tops) {
      let n = 1; while (n < G.N && G.tops[n] <= y) n++;
      while (n > 1 && !G.bands[n - 1] && G.tops[n - 1] >= y) n--;
      return { n, f: G.bands[n - 1] > 0 ? clamp((y - G.tops[n - 1]) / G.bands[n - 1], 0, 1) : 0 };
    }
    const n = clamp(Math.floor((y - G.top) / (G.band + G.gap)) + 1, 1, G.N);
    return { n, f: G.band > 0 ? clamp((y - yOf(G, n, 0)) / G.band, 0, 1) : 0 };
  }
  /**
   * The lines for the lane: one per text block, one per 3px down a tall block (its last at the last
   * line's length), length by the block's width against the body's, centred blocks offset.
   * `pages[n - 1]` is a page's pageBlocks() or null when not read yet (plain, evenly spaced lines).
   */
  function stripLines(pages, G) {
    const out = [];
    const push = (n, y, x0, len) => { const last = out[out.length - 1]; if (last && y - last.y < S.pitch) return; out.push({ n, y, x0, x1: x0 + len }) };
    for (let n = 1; n <= G.N; n++) {
      const pg = pages[n - 1];
      if (!pg) { for (let y = yOf(G, n, 0) + 1; y <= yOf(G, n, 1); y += S.plain) push(n, Math.round(y) + 0.5, S.x, S.plainLen); continue }
      const { body, blocks } = pg;
      for (const b of blocks) {
        const y0 = yOf(G, n, b.y0), y1 = yOf(G, n, b.y1);
        const k = Math.max(1, Math.min(b.n, Math.round((y1 - y0) / S.pitch) + 1));
        const w = Math.min(1, (b.x1 - b.x0) / body.w), off = clamp((b.x0 - body.x0) / body.w, 0, 0.7);
        for (let i = 0; i < k; i++) {
          const y = Math.round(k === 1 ? y0 : y0 + (y1 - y0) * i / (k - 1)) + 0.5;
          const lw = (i === k - 1 && k > 1 ? b.last : 1) * w;
          push(n, y, S.x + off * S.len, Math.max(3, Math.min(S.len - off * S.len, lw * S.len)));
        }
      }
    }
    return out;
  }
  /** Dots never touch: each at least 6px below the one above. */
  function spreadDots(dots, gap = S.dotGap) {
    const list = [...dots].sort((a, b) => a.y - b.y);
    for (let i = 1; i < list.length; i++) if (list[i].y - list[i - 1].y < gap) list[i] = { ...list[i], y: list[i - 1].y + gap };
    return list;
  }
  const HL = { gold: '#e9cf86', rose: '#eba7ad', sage: '#a9d0a3', sky: '#a6c2ee', lavender: '#c6b0ee' };
  const firstRect = rects => (rects || []).reduce((a, r) => (!a || r[0] < a[0] || (r[0] === a[0] && r[2] < a[2]) ? r : a), null);
  /**
   * A dot per highlight (its colour) and per card (filled), level with the passage's first line.
   * A note is its highlight's dot. `label(n)` is the page's printed label; `cardLabel(card)` the card's own.
   */
  function dotList(highlights, cards, G, { label = n => String(n), cardLabel = c => 'Card · p. ' + label(c.page) } = {}) {
    const out = [];
    for (const h of highlights || []) {
      if (!h || h.gone || !h.rects || !h.rects.length) continue;
      const [, y, , hh] = h.rects.reduce((a, r) => (r[1] < a[1] ? r : a));
      out.push({ n: h.page, y: yOf(G, h.page, y + hh / 2), color: HL[h.color] || HL.gold, card: false, label: (h.note ? 'Your note · p. ' : 'p. ') + label(h.page) });
    }
    for (const c of cards || []) {
      if (!c || c.gone || c.kind === 'note') continue;
      const r = firstRect(c.rects); if (!r) continue;
      out.push({ n: r[0], y: yOf(G, r[0], r[2] + r[4] / 2), card: true, label: cardLabel(c) });
    }
    return spreadDots(out);
  }
  /** The slider's keys: the page step (−1, +1) or the page to go to, or null for any other key. */
  function sliderKey(key, page, N) {
    const step = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 }[key];
    if (step) return clamp(page + step, 1, N);
    if (key === 'Home') return 1;
    if (key === 'End') return N;
    return null;
  }

  /* ---------- The strip in the reader ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const idle = cb => (global.requestIdleCallback ? global.requestIdleCallback(cb, { timeout: 600 }) : setTimeout(cb, 40));
  /**
   * opts: root, scroll, header, enabled(), count(), sheet(n), text(n) -> Promise<{ items, view }>,
   * highlights(), cards(), cardLabel(card), label(n), goTo(place); for an EPUB also blocks(n) (its chapter's blocks, as
   * pageBlocks gives them, or null), weights() (each chapter's share of the lane), name() and spot(n) (the words for n; none, a PDF's "p. 12 of 40").
   */
  function create(opts) {
    const el = document.createElement('div');
    el.className = 'mr pdf-strip';
    el.setAttribute('role', 'slider'); el.setAttribute('aria-label', 'Pages'); el.setAttribute('aria-orientation', 'vertical');
    el.tabIndex = 0; el.hidden = true;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'pdf-strip__lane');
    const tip = document.createElement('div'); tip.className = 'pdf-strip__tip'; tip.hidden = true; tip.setAttribute('aria-hidden', 'true');
    el.append(svg, tip);
    let gen = 0, raf = 0, G = null, lines = null, dots = null, win = null, hover = null, drag = false;
    let pages = [], prio = [], cursor = 1, busy = false;
    const geoKey = () => G ? `${G.N}:${G.top}:${G.bottom}:${G.tops ? G.tops.map(Math.round).join(',') : ''}` : '';

    /* -- Lazy lines: near the window first, the rest when idle -- */
    async function pump() {
      if (busy) return; busy = true;
      const my = gen;
      try {
        while (my === gen) {
          let n = 0;
          while (prio.length && !n) { const k = prio.shift(); if (pages[k - 1] === undefined) n = k }
          if (!n) {
            while (cursor <= opts.count() && pages[cursor - 1] !== undefined) cursor++;
            if (cursor > opts.count()) break;
            await new Promise(r => idle(r));
            if (my !== gen) break;
            if (prio.length) continue;
            n = cursor;
            if (pages[n - 1] !== undefined) continue;
          }
          pages[n - 1] = null;   // asked for
          let blocks = { body: { x0: 0.15, w: 0.7 }, blocks: [] };
          // An EPUB's chapter gives its blocks directly (opts.blocks, from its laid-out paragraphs); a PDF's page its text.
          try { const own = opts.blocks ? opts.blocks(n) : null; if (own) blocks = own; else { const t = await opts.text(n); if (my !== gen) break; blocks = pageBlocks(t.items, t.view) } } catch { if (my !== gen) break }
          pages[n - 1] = blocks; lines = null; schedule();
        }
      } finally { busy = false; if (my !== gen) pump() }
    }
    function want(from, to) {
      const N = opts.count(), list = [];
      for (let n = Math.max(1, from); n <= Math.min(N, to); n++) if (pages[n - 1] === undefined) list.push(n);
      if (!list.length) return;
      prio = [...list, ...prio.filter(n => !list.includes(n))];
      pump();
    }

    /* -- The window: the scroll area's top and bottom as page and fraction -- */
    function placeAt(y) {
      const N = opts.count();
      let lo = 1, hi = N;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (opts.sheet(mid).getBoundingClientRect().top <= y) lo = mid; else hi = mid - 1 }
      const r = opts.sheet(lo).getBoundingClientRect();
      return { n: lo, f: r.height ? clamp((y - r.top) / r.height, 0, 1) : 0 };
    }
    function windowNow() {
      const s = opts.scroll.getBoundingClientRect(), top = Math.max(s.top, opts.header.getBoundingClientRect().bottom);
      const a = placeAt(top), b = placeAt(Math.min(s.bottom, innerHeight));
      return { a, b, y0: yOf(G, a.n, a.f), y1: yOf(G, b.n, b.f) };
    }

    function draw() {
      raf = 0;
      const N = opts.count();
      if (!opts.enabled() || !N) { el.hidden = true; tip.hidden = true; return }
      if (!el.isConnected) opts.root.appendChild(el);
      el.hidden = false;
      const top = Math.ceil(opts.header.getBoundingClientRect().bottom) + S.inset, bottom = innerHeight - S.foot;
      const before = geoKey();
      G = geometry(N, top, bottom, opts.weights ? opts.weights() : null);
      if (geoKey() !== before) { lines = null; dots = null }
      el.style.top = top + 'px'; el.style.height = Math.max(0, bottom - top) + 'px';
      win = windowNow();
      want(win.a.n - 3, win.b.n + 3);
      if (!lines) lines = stripLines(pages, G);
      if (!dots) dots = dotList(opts.highlights(), opts.cards(), G, { label: opts.label, cardLabel: opts.cardLabel });
      const H = bottom - top, wh = win.y1 - win.y0, box = Math.max(8, wh + 4);
      svg.setAttribute('width', S.width); svg.setAttribute('height', H); svg.setAttribute('viewBox', `${S.left} ${top} ${S.width} ${H}`);
      const hv = hover && !drag ? hover : null, ghost = hv && !(hv.y >= win.y0 && hv.y <= win.y1);
      let out = `<rect class="pdf-strip__win" x="${S.left + 0.5}" y="${(win.y0 - 2.5).toFixed(1)}" width="31" height="${box.toFixed(1)}" rx="5"></rect>`;
      if (ghost) { const g0 = clamp(hv.y - wh / 2, G.top, G.bottom - wh); out += `<rect class="pdf-strip__ghost" x="${S.left + 0.5}" y="${(g0 - 2.5).toFixed(1)}" width="31" height="${box.toFixed(1)}" rx="5"></rect>` }
      for (const t of lines) {
        const on = t.y >= win.y0 && t.y <= win.y1, h = !on && hv && hv.n === t.n;
        out += `<line${on || h ? ' class="is-on"' : ''} x1="${t.x0}" x2="${t.x1.toFixed(1)}" y1="${t.y}" y2="${t.y}"></line>`;
      }
      for (const d of dots) out += d.card ? `<circle class="pdf-strip__card" cx="${S.dotX}" cy="${d.y.toFixed(1)}" r="2.6"></circle>` : `<circle class="pdf-strip__dot" cx="${S.dotX}" cy="${d.y.toFixed(1)}" r="${S.dot / 2}" style="fill:${d.color}"></circle>`;
      svg.innerHTML = out;
      const now = atY(G, (win.y0 + win.y1) / 2).n;
      el.setAttribute('aria-valuemin', '1'); el.setAttribute('aria-valuemax', String(N)); el.setAttribute('aria-valuenow', String(win.a.n));
      el.setAttribute('aria-label', opts.name ? opts.name() : 'Pages');
      el.setAttribute('aria-valuetext', opts.spot?.(win.a.n) || `p. ${opts.label(win.a.n)} of ${N}`);
      el.dataset.page = String(now);
      if (hover) {
        const near = hover.x >= S.dotX - 4 ? dots.find(d => Math.abs(d.y - hover.y) <= 4) : null;
        tip.textContent = near ? near.label : opts.spot?.(hover.n) || 'p. ' + opts.label(hover.n);
        tip.style.top = (clamp(near ? near.y : hover.y, top + 8, bottom - 8) - top) + 'px';
        tip.hidden = false;
      } else tip.hidden = true;
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(draw) }

    /* -- Pointer and keys -- */
    function jump(y) {
      if (!G || !win) return;
      const wh = win.y1 - win.y0, y0 = clamp(y - wh / 2, G.top, Math.max(G.top, G.bottom - wh));
      const p = atY(G, y0);
      opts.goTo({ page: p.n, frac: p.f });
    }
    const pointAt = e => { const p = G ? atY(G, e.clientY) : { n: 1, f: 0 }; return { ...p, y: e.clientY, x: e.clientX } };
    el.addEventListener('pointermove', e => { hover = pointAt(e); if (drag) jump(e.clientY); schedule() });
    el.addEventListener('pointerleave', () => { if (!drag) { hover = null; schedule() } });
    el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      // (Not prevented: the click focuses the strip as a mouse focus, so its keys work and no focus ring shows.)
      try { el.setPointerCapture(e.pointerId) } catch {}
      drag = true; hover = pointAt(e); jump(e.clientY); schedule();
    });
    const end = e => { if (!drag) return; drag = false; try { el.releasePointerCapture(e.pointerId) } catch {} if (e.type === 'pointercancel' || !el.matches(':hover')) hover = null; schedule() };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    // The wheel over the strip scrolls the pages (Ctrl+wheel still zooms them, reader.js).
    el.addEventListener('wheel', e => { if (e.ctrlKey) return; e.preventDefault(); opts.scroll.scrollBy({ top: e.deltaY * (e.deltaMode === 1 ? 16 : 1) }) }, { passive: false });
    el.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !G || !win) return;
      const to = sliderKey(e.key, win.a.n, opts.count()); if (to == null) return;
      e.preventDefault(); e.stopPropagation();
      opts.goTo({ page: to, frac: /^(Home|End)$/.test(e.key) ? 0 : win.a.f });
    });

    return {
      el,
      /** A new book: its lines are read afresh. */
      open() { gen++; pages = []; prio = []; cursor = 1; lines = null; dots = null; hover = null; drag = false; schedule() },
      close() { gen++; pages = []; prio = []; lines = null; dots = null; hover = null; el.hidden = true; tip.hidden = true },
      /** The pages scrolled or the layout changed. */
      update: schedule,
      /** Highlights or cards changed. */
      marksChanged() { dots = null; schedule() },
    };
  }

  global.TinctStrip = { STAMP_RE, findStamp, stampBox, boxCorners, maskStamp, pageBlocks, geometry, yOf, atY, stripLines, spreadDots, dotList, sliderKey, create, S };
})(typeof window !== 'undefined' ? window : globalThis);
