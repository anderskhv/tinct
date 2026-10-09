'use strict';
// Tinct · Add a book: recognising the text of a scanned PDF (a PDF without a text layer), so it
// reads as Tinct text too (Premium and the trial; OCR, §3 of the PDF editions plan). The page
// images are made here, in the reader's browser, with the pdf.js the viewer ships, and sent to
// the reader's own account (/api/user-books/ocr/{hex}, app/src/worker/routes/userBooks.ts);
// the account recognises them and assembles the Tinct text (app/src/lab/userBook/ocrEdition.ts).
//   - Each page is drawn with its long edge at 1600 px, in greyscale, as a JPEG of quality 0.75.
//   - A page with less than 0.3% ink is blank: never sent (and never counted).
//   - Four pages are sent at a time, and only while the page is visible; the job resumes from
//     what the account says is still missing (GET status `missing`), on this device or another.
//   - The reader is asked once per book, never automatically. A free account is told, once, in
//     one calm line, what Premium would do; a switch that is off (the route answers 404) shows
//     nothing at all.
// Pure helpers (view, toSend, upload, run) take everything they touch as arguments, so
// app/src/lab/userBook/pdfOcr.test.ts runs them without a browser.
(function (global) {
  const RENDER_EDGE = 1600;
  const JPEG_QUALITY = 0.75;
  /** Below this share of ink a page is blank. */
  const BLANK_INK = 0.003;
  /** A pixel darker than this (0-255 grey) is ink. */
  const INK_LEVEL = 128;
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
        show(status);
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
      if (greyInk(image.data) < BLANK_INK) return { blank: true };
      ctx.putImageData(image, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
      if (!blob) throw Object.assign(new Error('render_failed'), { code: 'render_failed' });
      return { blank: false, blob };
    } finally { page.cleanup?.(); canvas.width = canvas.height = 0 }
  }

  /**
   * The account's OCR routes with the reader's token (`token()`): status() resolves null when
   * the switch is off (404) or the account cannot be asked; the others throw ({ status, code }).
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
        try { const r = await call(base(hex)); return r.ok ? await r.json() : null } catch { return null }
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
    view, shelfLine, toSend, upload, run, defaultEdition, greyInk, renderPage, api, canStart,
  };
})(typeof window !== 'undefined' ? window : globalThis);
