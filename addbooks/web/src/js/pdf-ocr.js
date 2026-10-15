'use strict';
// Tinct · Add a book: recognising the text of a scanned PDF (a PDF without a text layer), so it
// reads as Tinct text too (Premium and the trial; OCR, §3 of the PDF editions plan). The page
// images are made here, in the reader's browser, with the pdf.js the viewer ships, and sent to
// the reader's own account (/api/user-books/ocr/{hex}, app/src/worker/routes/userBooks.ts);
// the account recognises them and assembles the Tinct text (app/src/lab/userBook/ocrEdition.ts).
//   - Each page is drawn with its long edge at 1600 px, in greyscale, as a JPEG of quality 0.75.
//   - A page with less than 0.3% ink is blank: never sent (and never counted), unless it has
//     faint print: 1% of it well darker than its paper (a light scan of small type, where
//     hardly a pixel is dark, as a 1911 Britannica page in the real test of 9 Oct 2026).
//   - Four pages are sent at a time, and only while the page is visible; the job resumes from
//     what the account says is still missing (GET status `missing`), on this device or another.
//   - The reader is asked once per book, never automatically. A free account is told, once, in
//     one calm line, what Premium would do; a switch that is off (the route answers 404) shows
//     nothing at all.
// Pure helpers (view, toSend, upload, run, and the text layer's pageText, inkMask, findLines,
// layoutPage, textItems) take everything they touch as arguments, so
// app/src/lab/userBook/pdfOcr.test.ts and pdfOcrLayer.test.ts run them without a browser.
// Once recognised, the scan stays in this viewer with the margin (the scans test, 15 Oct 2026):
// its recognised pages (GET …/pages) are laid over the page images as a text layer. Each block
// has its box from recognition (`b`, 0-1000 of the page, ocrEdition.ts OcrBox); the page's own ink
// finds the printed lines inside it. A page recognised before boxes existed is laid out by its ink
// alone, in reading order (columns left to right).
(function (global) {
  const RENDER_EDGE = 1600;
  const JPEG_QUALITY = 0.75;
  /** Below this share of ink a page is blank. */
  const BLANK_INK = 0.003;
  /** A pixel darker than this (0-255 grey) is ink. */
  const INK_LEVEL = 128;
  /** Faint print: a pixel this much darker than the page's paper (its median grey)... */
  const FAINT_BELOW_PAPER = 64;
  /** ...on at least this share of the page is text, however light the scan. */
  const FAINT_INK = 0.01;
  const PARALLEL = 4;
  const POLL_MS = 5000;
  /** Waiting after the account's upload rate limit (120 pages a minute). */
  const RATE_WAIT_MS = 15000;

  // The approved copy (PDF editions plan, §3 Client).
  const FREE_LINE = 'This PDF is a scan. With Premium, Tinct can recognise its text so you can read it reflowed, listen and ask about it.';
  const READY = 'Tinct text is ready';
  const SHELF = 'Recognising text…';
  const LATER = 'Continues later';
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const count = n => Number(n).toLocaleString('en-GB');
  const preparing = (x, n) => `Preparing pages ${count(x)} of ${count(n)}`;
  const recognising = (x, n) => `Recognising text: ${count(x)} of ${count(n)} pages`;
  // A month's ceilings start again on the first of the next month (UTC, as the account counts).
  const continuesOn = at => { const d = new Date(at); return `Continues on ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` };
  const failedLine = n => `${count(n)} ${n === 1 ? 'page' : 'pages'} could not be read.`;
  const offerLine = (pages, month) => {
    const left = Math.max(0, (month?.limit ?? 0) - (month?.used ?? 0));
    return `This PDF is a scan. Tinct can recognise its text so you can read it reflowed, listen and ask about it. It has ${count(pages)} pages and would use ${count(Math.min(pages, left) || pages)} of the ${count(left)} pages left in your month.`;
  };

  /** Premium or the trial: may start; anything else is a free account. */
  const canStart = tier => tier === 'premium' || tier === 'trial';
  const settled = s => (s.done || 0) + (s.failed || 0) + (s.blank || 0);

  /**
   * What the reader sees for a scan, from the account's status (null: the switch is off or the
   * account cannot be asked, so nothing) and what this device remembers of the book (`local`:
   * { asked, ready, prepared }):
   *   { kind: 'offer' | 'free' | 'progress' | 'paused' | 'ready' | 'failed', text, action? }
   * or null for nothing.
   */
  function view(status, local = {}, pages = status?.pages) {
    if (!status || typeof status !== 'object' || !status.state) return null;
    const n = status.pages || pages || 0;
    const free = !canStart(status.tier);
    if (status.state === 'done') {
      if (status.failed > 0 && !free) return { kind: 'failed', text: failedLine(status.failed), action: 'retry' };
      return local.ready ? null : { kind: 'ready', text: READY };
    }
    if (free) return { kind: 'free', text: FREE_LINE, action: 'account' };
    if (status.state === 'none') return local.asked ? null : { kind: 'offer', text: offerLine(pages || 0, status.month), action: 'start' };
    if (status.state === 'paused') {
      if (status.reason === 'account_pages' || status.reason === 'account_usd') return { kind: 'paused', text: status.resumesAt ? continuesOn(status.resumesAt) : LATER };
      if (status.reason === 'global_usd') return { kind: 'paused', text: LATER };
      // Premium had lapsed and is back: the job goes on once asked again (run).
      return { kind: 'progress', text: recognising(settled(status), n) };
    }
    // The account recognises pages as they arrive ("running"): while some are still to send, it is preparing.
    if (status.state === 'uploading' || (status.state === 'running' && status.missing?.length)) {
      const x = Math.max(local.prepared || 0, (status.uploaded || 0) + (status.blank || 0));
      return { kind: 'progress', text: preparing(Math.min(x, n), n) };
    }
    if (status.state === 'running') return { kind: 'progress', text: recognising(settled(status), n) };
    return null; // 'failed' (nothing to recognise): the pages stay as they are
  }

  /** What My shelf says of a book whose text is being recognised (null: nothing). */
  const shelfLine = status => status && ['uploading', 'running', 'paused'].includes(status.state) ? SHELF : null;

  /**
   * The pages to send, in order: those the account says are missing (all of them before the job
   * exists), less the pages this device found blank.
   */
  function toSend(status, pages, blank = []) {
    const skip = new Set(blank);
    const all = !status || status.state === 'none' ? Array.from({ length: pages }, (_, i) => i + 1) : Array.isArray(status.missing) ? status.missing : [];
    return all.filter(n => Number.isInteger(n) && n >= 1 && n <= pages && !skip.has(n));
  }

  /**
   * Sends `pages` (in order, `parallel` at a time): each is drawn (`render(n)` -> { blank } or
   * { blob }) and sent (`put(n, blob)` -> 'ok' | 'skipped') only while `waitVisible()` lets it
   * (it resolves when the page is visible). `onPage(n, 'ok' | 'skipped' | 'blank')` after each.
   * Stops when `live()` turns false, and at the first error (thrown after the pages in flight
   * end): what was not sent stays missing in the account and is sent on the next run.
   */
  async function upload(pages, { render, put, waitVisible = async () => {}, onPage = () => {}, live = () => true, parallel = PARALLEL }) {
    const queue = pages.slice();
    let failure = null;
    const worker = async () => {
      while (queue.length && !failure && live()) {
        await waitVisible();
        if (!live() || failure || !queue.length) return;
        const n = queue.shift();
        try {
          const drawn = await render(n);
          if (!live()) return;
          if (drawn.blank) { onPage(n, 'blank'); continue }
          onPage(n, await put(n, drawn.blob));
        } catch (e) { failure = failure || e }
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, parallel) }, worker));
    if (failure) throw failure;
  }

  /**
   * One job, from the reader's yes (or a resume) to its Tinct text: started (or resumed: the
   * same start, with the blank pages found so far), the missing pages sent, then the status
   * asked every `pollMs` until it is done or paused; then `onEdition(edition)`.
   *   ctx: { hex, pages, api, render, local: { get(), set(patch) }, live, waitVisible, onStatus, onEdition, sleep, pollMs, rerun }
   * `onStatus(status, local)` after every change. Resolves with the last status.
   */
  async function run(ctx) {
    const { hex, pages, api, local, live = () => true } = ctx;
    const sleep = ctx.sleep || (ms => new Promise(r => setTimeout(r, ms)));
    const show = status => { if (live()) ctx.onStatus?.(status, local.get()) };
    let status = await api.start(hex, { pages, blank: local.get().blank || [], ...(ctx.rerun ? { rerun: ctx.rerun } : {}) });
    local.set({ asked: true, started: true, ready: false });
    for (let round = 0; live(); round++) {
      const list = toSend(status, pages, local.get().blank);
      if (list.length) {
        let left = list.length;
        local.set({ prepared: pages - left });
        show(status);
        const found = [];
        await upload(list, {
          render: ctx.render,
          put: (n, blob) => api.put(hex, n, blob),
          waitVisible: ctx.waitVisible,
          live,
          onPage: (n, how) => {
            left -= 1;
            if (how === 'blank') { found.push(n); local.set({ blank: [...new Set([...(local.get().blank || []), n])] }) }
            local.set({ prepared: pages - left });
            show(status);
          },
        });
        if (!live()) return status;
        // Blank pages found on the way: the account counts them as done (never sent, never charged).
        status = found.length ? await api.start(hex, { pages, blank: local.get().blank || [] }) : await api.status(hex);
        if (!status) return status;
        // Done already (a few pages, recognised as they came): said below, once the text is kept.
        if (status.state !== 'done') show(status);
        continue;
      }
      // Done: the Tinct text is kept first, so "Tinct text is ready" comes with its control.
      if (status.state === 'done') {
        const edition = await api.edition(hex);
        if (edition && live()) await ctx.onEdition?.(edition, status);
        show(status);
        return status;
      }
      show(status);
      if (status.state === 'paused' && status.reason !== 'premium_required') return status;
      if (status.state === 'failed') return status;
      await sleep(ctx.pollMs ?? POLL_MS);
      if (!live()) return status;
      const next = await api.status(hex);
      if (!next) return status;
      status = next;
    }
    return status;
  }

  /** The edition a recognised text opens in (app/src/lab/userBook/ocrEdition.ts ocrDefaultEdition, the same rule). */
  function defaultEdition(edition) {
    const layout = edition && edition.ocrLayout;
    if (!layout || !(layout.pages > 0)) return 'text';
    return layout.columns / layout.pages >= 0.3 && layout.equations / layout.pages >= 0.2 ? 'pages' : 'text';
  }

  /** Greyscale in place (RGBA, on white) and the share of ink. */
  function greyInk(data) {
    let ink = 0;
    const px = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255;
      const y = Math.round((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a + 255 * (1 - a));
      data[i] = data[i + 1] = data[i + 2] = y; data[i + 3] = 255;
      if (y < INK_LEVEL) ink++;
    }
    return px ? ink / px : 0;
  }

  /**
   * The share of a greyed page (greyInk first) well darker than its paper, its median grey.
   * With its `width`, only the middle of the page counts: a scan's dark gutter and edges are not print.
   */
  function faintInk(data, width = 0) {
    const counts = new Uint32Array(256);
    const all = data.length / 4;
    const w = width > 0 ? width : all, h = all / w;
    const mx = width > 0 ? Math.floor(w * 0.08) : 0, my = width > 0 ? Math.floor(h * 0.08) : 0;
    let px = 0;
    for (let y = my; y < h - my; y++) for (let x = mx, i = (y * w + mx) * 4; x < w - mx; x++, i += 4) { counts[data[i]]++; px++ }
    let seen = 0, paper = 255;
    for (let y = 0; y < 256; y++) { seen += counts[y]; if (seen * 2 >= px) { paper = y; break } }
    let faint = 0;
    for (let y = 0; y < paper - FAINT_BELOW_PAPER; y++) faint += counts[y];
    return px ? faint / px : 0;
  }
  /** Blank: hardly any ink and no faint print either. Greys `data` in place. */
  const isBlank = (data, width = 0) => greyInk(data) < BLANK_INK && faintInk(data, width) < FAINT_INK;

  /** One page as the account takes it: { blank: true }, or { blank: false, blob } (greyscale JPEG). */
  async function renderPage(pdf, n, doc = global.document) {
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: RENDER_EDGE / Math.max(base.width, base.height) });
    const canvas = doc.createElement('canvas');
    canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    try {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (isBlank(image.data, image.width)) return { blank: true };
      ctx.putImageData(image, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
      if (!blob) throw Object.assign(new Error('render_failed'), { code: 'render_failed' });
      return { blank: false, blob };
    } finally { page.cleanup?.(); canvas.width = canvas.height = 0 }
  }

  /* ---------- The recognised text as a text layer over the page image ---------- */
  /** Printed but not part of the text read or asked about: running heads, footers, page numbers. */
  const FURNITURE = new Set(['head', 'foot', 'num']);
  /** Kept line by line. */
  const LINED = new Set(['alg', 'tbl', 'eq']);
  const blocksOf = page => (page && Array.isArray(page.blocks) ? page.blocks : []).filter(b => b && typeof b.x === 'string' && b.x.trim());
  /** A recognised page's text, as the margin's companion reads it: blocks in order, a blank line between, furniture left out. */
  function pageText(page) {
    return blocksOf(page).filter(b => !FURNITURE.has(b.t)).map(b => LINED.has(b.t) ? b.x.split('\n').map(l => l.trim()).filter(Boolean).join('\n') : b.x.replace(/\s+/g, ' ').trim()).join('\n\n');
  }

  /** Ink of a page image (RGBA): 1 where a pixel is well darker than the paper (its median grey). */
  function inkMask(data, w, h) {
    const n = w * h, grey = new Uint8Array(n), counts = new Uint32Array(256);
    for (let i = 0; i < n; i++) { const y = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) | 0; grey[i] = y; counts[y]++ }
    let seen = 0, paper = 255;
    for (let y = 0; y < 256; y++) { seen += counts[y]; if (seen * 2 >= n) { paper = y; break } }
    const cut = Math.min(paper - 48, 200), mask = new Uint8Array(n);
    for (let i = 0; i < n; i++) mask[i] = grey[i] < cut ? 1 : 0;
    return mask;
  }

  const median = list => { if (!list.length) return 0; const s = list.slice().sort((a, b) => a - b); return s[s.length >> 1] };
  /**
   * The printed lines in a region of an ink mask ([x0, y0, x1, y1] in pixels): rows with ink grouped
   * into lines (an i's dot or an accent joins its line), each with its ink's extent.
   * -> [{ x0, y0, x1, y1 }] in pixels, top to bottom.
   */
  function findLines(mask, w, h, region = [0, 0, w, h]) {
    const X0 = Math.max(0, Math.floor(region[0])), Y0 = Math.max(0, Math.floor(region[1])), X1 = Math.min(w, Math.ceil(region[2])), Y1 = Math.min(h, Math.ceil(region[3]));
    if (X1 - X0 < 3 || Y1 - Y0 < 2) return [];
    const minInk = Math.max(1, Math.round((X1 - X0) * 0.003));
    let runs = [], start = -1;
    for (let y = Y0; y <= Y1; y++) {
      let c = 0;
      if (y < Y1) for (let x = X0, i = y * w + X0; x < X1; x++, i++) c += mask[i];
      if (y < Y1 && c >= minInk) { if (start < 0) start = y } else if (start >= 0) { runs.push({ y0: start, y1: y }); start = -1 }
    }
    // A small run close to a taller one (a dot, an accent, a descender cut off) belongs to it.
    const tall = median(runs.map(r => r.y1 - r.y0));
    for (let merged = true; merged && runs.length > 1;) {
      merged = false;
      for (let i = 0; i < runs.length; i++) {
        const r = runs[i], hgt = r.y1 - r.y0;
        if (hgt >= tall * 0.5) continue;
        const up = runs[i - 1], down = runs[i + 1];
        const gapUp = up ? r.y0 - up.y1 : Infinity, gapDown = down ? down.y0 - r.y1 : Infinity;
        const into = gapDown <= gapUp ? (gapDown <= Math.max(2, tall * 0.35) ? i + 1 : -1) : (gapUp <= Math.max(2, tall * 0.35) ? i - 1 : -1);
        if (into < 0) continue;
        const t = runs[into]; t.y0 = Math.min(t.y0, r.y0); t.y1 = Math.max(t.y1, r.y1);
        runs.splice(i, 1); merged = true; break;
      }
    }
    const lines = [];
    for (const r of runs) {
      // Its ink's extent, and its words: runs of ink apart by a third of the line's height or more.
      let l = -1, rt = -1, words = 0, gap = Infinity;
      const space = Math.max(2, (r.y1 - r.y0) * 0.33);
      for (let x = X0; x < X1; x++) {
        let any = 0; for (let y = r.y0; y < r.y1 && !any; y++) any = mask[y * w + x];
        if (any) { if (l < 0) l = x; if (gap >= space) words++; rt = x + 1; gap = 0 } else gap++;
      }
      if (l >= 0 && rt - l >= 3 && r.y1 - r.y0 >= 2) lines.push({ x0: l, y0: r.y0, x1: rt, y1: r.y1, words });
    }
    return lines;
  }

  /** A run of columns free of ink down the middle of the page: the gutter of a two-column page, or null. */
  function findGutter(mask, w, h, lines) {
    if (lines.length < 3) return null;
    const ink = new Uint32Array(w);
    for (const L of lines) for (let y = L.y0; y < L.y1; y++) for (let x = L.x0, i = y * w + L.x0; x < L.x1; x++, i++) ink[x] += mask[i];
    const rows = lines.reduce((s, L) => s + (L.y1 - L.y0), 0), quiet = Math.max(1, rows * 0.15);
    let best = null, at = -1;
    for (let x = Math.floor(w * 0.3); x <= Math.ceil(w * 0.7); x++) {
      if (x < Math.ceil(w * 0.7) && ink[x] <= quiet) { if (at < 0) at = x } else if (at >= 0) { if (!best || x - at > best[1] - best[0]) best = [at, x]; at = -1 }
    }
    return best && best[1] - best[0] >= w * 0.012 ? best : null;
  }

  /** Lines in reading order: a two-column stretch left column first, a line across the gutter where it stands. */
  function readingOrder(mask, w, h, lines) {
    const g = findGutter(mask, w, h, lines);
    if (!g) return lines;
    const out = [], left = [], right = [];
    const flush = () => { out.push(...left.splice(0), ...right.splice(0)) };
    for (const L of lines) {
      let across = 0;
      for (let y = L.y0; y < L.y1 && across < 2; y++) for (let x = g[0], i = y * w + g[0]; x < g[1]; x++, i++) across += mask[i];
      if (across >= 2 || L.x1 <= g[0] || L.x0 >= g[1]) {
        if (L.x1 <= g[0]) left.push(L); else if (L.x0 >= g[1]) right.push(L); else { flush(); out.push(L) }
        continue;
      }
      const a = findLines(mask, w, h, [L.x0, L.y0, g[0], L.y1]), b = findLines(mask, w, h, [g[1], L.y0, L.x1, L.y1]);
      const box = parts => parts.length ? { x0: Math.min(...parts.map(q => q.x0)), y0: L.y0, x1: Math.max(...parts.map(q => q.x1)), y1: L.y1, words: parts.reduce((n, q) => n + q.words, 0) } : null;
      const la = box(a), lb = box(b);
      if (la) left.push(la);
      if (lb) right.push(lb);
    }
    flush();
    return out;
  }

  const wordsOf = text => text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  /** Words over lines: as many as each line's ink shows when the count agrees, else in proportion to each line's width. [[word, …] per line] */
  function spread(words, lines) {
    if (!lines.length) return [];
    if (lines.every(L => L.words > 0) && lines.reduce((a, L) => a + L.words, 0) === words.length) {
      let k = 0;
      return lines.map(L => words.slice(k, k += L.words));
    }
    const widths = lines.map(L => Math.max(1, L.x1 - L.x0)), total = widths.reduce((a, b) => a + b, 0);
    const chars = words.reduce((a, wd) => a + wd.length + 1, 0);
    const out = lines.map(() => []);
    let line = 0, used = 0, target = widths[0] / total * chars;
    for (let k = 0; k < words.length; k++) {
      const len = words[k].length + 1, left = words.length - k, linesLeft = lines.length - line;
      // On to the next line when this one is full (past half the word), or when the words left are needed one a line.
      if (line < lines.length - 1 && out[line].length && (used + len / 2 > target || left <= linesLeft - 1)) { line++; target += widths[line] / total * chars }
      out[line].push(words[k]); used += len;
    }
    return out;
  }

  /**
   * A recognised page laid over its image: [{ text, kind, box: [x0, y0, x1, y1] }], each a printed
   * line, `box` in fractions of the page from its top-left corner. `mask` is the page's ink (inkMask)
   * at `w`×`h` pixels; without ink where a block says it is, its lines are spread evenly over its box.
   */
  function layoutPage(page, mask, w, h) {
    const blocks = blocksOf(page);
    if (!blocks.length || !(w > 0 && h > 0)) return [];
    const plausible = L => L.y1 - L.y0 <= h * 0.06;
    const pageLines = findLines(mask, w, h, [w * 0.02, h * 0.01, w * 0.98, h * 0.99]).filter(plausible);
    const lead = median(pageLines.map(L => L.y1 - L.y0)) || h * 0.014;
    const norm = L => [L.x0 / w, L.y0 / h, L.x1 / w, L.y1 / h];
    const out = [];
    const place = (block, lines) => {
      const lined = LINED.has(block.t) ? block.x.split('\n').map(l => l.trim()).filter(Boolean) : null;
      const texts = lined && lined.length === lines.length ? lined.map(l => [l]) : spread(wordsOf(block.x), lines);
      texts.forEach((ws, i) => { if (ws.length) out.push({ text: ws.join(' '), kind: block.t, box: norm(lines[i]) }) });
    };
    const even = (block, [x0, y0, x1, y1]) => {
      const n = Math.max(1, Math.min(Math.floor((y1 - y0) / (lead * 1.3)) || 1, Math.ceil(block.x.length / 60)));
      const step = (y1 - y0) / n;
      return Array.from({ length: n }, (_, i) => ({ x0, y0: y0 + i * step, x1, y1: y0 + i * step + Math.min(step, lead) }));
    };
    if (blocks.every(b => Array.isArray(b.b) && b.b.length === 4)) {
      for (const block of blocks) {
        const [l, t, r, btm] = block.b, padX = w * 0.006, padY = h * 0.004;
        const region = [l / 1000 * w - padX, t / 1000 * h - padY, r / 1000 * w + padX, btm / 1000 * h + padY];
        // A neighbouring line's ascenders or descenders inside the padding are not a line of this block.
        const top = t / 1000 * h, bottom = btm / 1000 * h;
        const lines = findLines(mask, w, h, region).filter(L => plausible(L) && Math.min(L.y1, bottom) - Math.max(L.y0, top) >= (L.y1 - L.y0) * 0.5);
        place(block, lines.length ? lines : even(block, [l / 1000 * w, t / 1000 * h, r / 1000 * w, btm / 1000 * h]));
      }
      return out;
    }
    // No boxes (recognised before 15 Oct 2026): the blocks in order over the page's lines in reading order.
    let lines = readingOrder(mask, w, h, pageLines);
    if (!lines.length) lines = even({ x: blocks.map(b => b.x).join(' ') }, [w * 0.1, h * 0.08, w * 0.9, h * 0.92]);
    const widths = lines.map(L => Math.max(1, L.x1 - L.x0)), total = widths.reduce((a, b) => a + b, 0);
    const sizes = blocks.map(b => b.x.length + 1), chars = sizes.reduce((a, b) => a + b, 0);
    let at = 0;
    blocks.forEach((block, i) => {
      const from = at, need = sizes[i] / chars * total, blocksLeft = blocks.length - i - 1;
      let got = 0;
      while (at < lines.length - blocksLeft && (at === from || got + widths[at] / 2 <= need)) { got += widths[at]; at++ }
      // Out of lines: what is left shares the last one.
      place(block, at > from ? lines.slice(from, at) : [lines[lines.length - 1]]);
    });
    return out;
  }

  /** [a, b, c, d, e, f] products and inverse, as pdf.js's Util. */
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const inverse = m => { const d = m[0] * m[3] - m[1] * m[2]; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d, (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d] };
  /**
   * Laid-out lines as pdf.js text items, for the viewer's text layer (reader.js buildTextLayer): one item
   * a line, in the page's own space, from the page's viewport at scale 1 ({ width, height, transform }).
   * Each line's text fills its box: its top at the box's top, its size the box's height.
   */
  function textItems(lines, vp) {
    const back = inverse(vp.transform);
    return lines.map(L => {
      const [x0, y0, x1, y1] = L.box, size = Math.max(1, (y1 - y0) * vp.height / 0.95);
      const shown = [size, 0, 0, -size, x0 * vp.width, y0 * vp.height + size * 0.86];
      return { str: L.text, dir: 'ltr', width: (x1 - x0) * vp.width, height: size, transform: mul(back, shown), fontName: 'ocr', hasEOL: true, kind: L.kind };
    });
  }

  /**
   * The account's OCR routes with the reader's token (`token()`): status() resolves null when
   * the switch is off (404), undefined when the account cannot be asked now (offline, busy,
   * signed out); pages() the recognised pages or null; the others throw ({ status, code }).
   */
  function api({ token, fetch: fetchImpl = (...a) => global.fetch(...a), sleep = ms => new Promise(r => setTimeout(r, ms)) }) {
    const base = hex => '/api/user-books/ocr/' + encodeURIComponent(hex);
    const call = (path, init = {}) => {
      const t = token();
      if (!t) return Promise.reject(Object.assign(new Error('signed_out'), { code: 'signed_out' }));
      return fetchImpl(path, { ...init, cache: 'no-store', credentials: 'same-origin', headers: { ...(init.headers || {}), Authorization: 'Bearer ' + t } });
    };
    const fail = async r => { let code = ''; try { code = (await r.json())?.error || '' } catch {} return Object.assign(new Error(code || 'HTTP ' + r.status), { status: r.status, code }) };
    return {
      async status(hex) {
        try { const r = await call(base(hex)); return r.ok ? await r.json() : r.status === 404 ? null : undefined } catch { return undefined }
      },
      async pages(hex) {
        try { const r = await call(base(hex) + '/pages'); if (!r.ok) return null; const body = await r.json(); return Array.isArray(body?.pages) ? body.pages : null } catch { return null }
      },
      async start(hex, body) {
        const r = await call(base(hex), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw await fail(r);
        return r.json();
      },
      async put(hex, n, blob) {
        for (let tries = 0; ; tries++) {
          const r = await call(`${base(hex)}/pages/${n}`, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
          if (r.ok) return 'ok';
          // Recognised already, or blank: nothing to send.
          if (r.status === 409) return 'skipped';
          if (r.status === 429 && tries < 8) { await sleep(RATE_WAIT_MS); continue }
          throw await fail(r);
        }
      },
      async edition(hex) {
        try { const r = await call(base(hex) + '/edition'); if (!r.ok) return null; const e = await r.json(); return global.TinctPdfText?.usable ? (global.TinctPdfText.usable(e) && e.source === 'ocr' ? e : null) : e } catch { return null }
      },
    };
  }

  global.TinctPdfOcr = {
    RENDER_EDGE, JPEG_QUALITY, BLANK_INK, INK_LEVEL, PARALLEL, POLL_MS,
    FREE_LINE, READY, SHELF, LATER,
    view, shelfLine, toSend, upload, run, defaultEdition, greyInk, faintInk, isBlank, renderPage, api, canStart,
    pageText, inkMask, findLines, layoutPage, textItems,
  };
})(typeof window !== 'undefined' ? window : globalThis);
