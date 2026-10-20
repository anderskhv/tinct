'use strict';
// Tinct · a PDF's Tinct text in Margin view (Anders, 20 Oct 2026, the approved mockup 2b). On the desktop, "Tinct text"
// for a PDF of the reader's own reads its text reflowed here, beside the margin, not in the Tinct reader: Tinct paper,
// one continuous scroll in the reader's font, size and theme (reader.js applyPaper, as an EPUB's), its headings as
// headings, its formulas, figures and tables as crisp crops of the page (pdf-text.js converter 3), and the margin's
// column, marks and cards, which go on citing the PDF's pages. The text is the PDF's Tinct text (pdf-text.js, or a
// recognised scan's: pdf-ocr.js), kept on the book's record with its crops (`edition`, `figureData`, as the Tinct
// reader keeps them: app/src/lab/userBook/userBookStore.ts), so either reader reads the same chapters and words.
// It opens through the EPUB path (reader.js openEpub): one block per edition paragraph, so a place is the edition's
// (chapter, paragraph, word) and converts to the PDF's page and back (TinctPdfText.pageOf / placeOf). Phones keep the
// Tinct reader. The tests import this file directly.
(function (global) {
  const KEY = 'pdftext:';
  const FIGURE_MARK = '￼';
  /** The text view's own key (its place, highlights and cards on this device), from the PDF's hex. */
  const keyOf = hex => KEY + hex;
  const isKey = key => String(key || '').startsWith(KEY);
  const pdfKey = key => 'pdf:' + String(key).slice(KEY.length);

  /** A figure paragraph's id (U+FFFC + id), or null. */
  const figureId = text => (String(text || '').startsWith(FIGURE_MARK) ? String(text).slice(1).trim() : null);

  /** One block per edition paragraph (so reader.js epubParas counts them as the edition does): its kind's element. */
  // A crop still being drawn holds its place at its size (an empty picture of its shape), so nothing moves when it comes.
  const placeholder = fig => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${fig.width > 0 ? fig.width : 1}" height="${fig.height > 0 ? fig.height : 1}"/>`);
  function paragraphEl(doc, chapter, i, src, waits = () => false) {
    const text = String(chapter.paragraphs[i] ?? ''), kind = chapter.kinds?.[i] || null, id = figureId(text);
    if (id) {
      const fig = (chapter.figures || []).find(f => f.id === id) || { id };
      const el = doc.createElement('div');
      el.className = 'pt-fig' + (fig.fit === 'text' ? ' is-formula' : '');
      el.dataset.figure = id;
      el.dataset.kind = fig.kind === 'equation' ? 'equation' : fig.kind === 'table' ? 'table' : 'figure';
      const url = src(id), wait = !url && !!waits(id);
      if (url || wait) {
        const img = doc.createElement('img');
        img.src = url || placeholder(fig); img.alt = fig.alt || fig.label || 'Figure'; img.decoding = 'async';
        if (wait) img.dataset.wait = '1';
        if (fig.width > 0 && fig.height > 0) { img.width = fig.width; img.height = fig.height }
        el.append(img);
      }
      // The caption under the crop (its words are the paragraph's, for a place and a selection); without one, a mark that keeps its index.
      const cap = doc.createElement('span');
      cap.className = 'pt-cap';
      cap.textContent = fig.caption || (url || wait ? '​' : fig.alt || fig.label || '​');
      el.append(cap);
      return el;
    }
    const el = doc.createElement(kind === 'heading' ? 'h3' : 'p');
    el.className = kind === 'heading' ? 'pt-h' : 'tb-p' + (kind ? ' pt-' + kind : '');
    el.textContent = text.trim() ? text : '​';
    return el;
  }

  /**
   * The edition as TinctEpub.parse returns a book: { title, authors, language, chapters: [{ index, title, node, text, role }], toc, start }.
   * `figureSrc(id)`: a crop's URL, or null (its caption stands alone); `figureWaits(id)`: true for a crop still being
   * drawn, which stands at its size until it comes (figureCame).
   */
  function bookOf(edition, { title = '', author = '', figureSrc = () => null, figureWaits = () => false, doc = global.document } = {}) {
    const toc = [];
    const chapters = (edition?.chapters || []).map((c, index) => {
      const node = doc.createElement('div');
      node.className = 'tb-chapter pt-chapter epub-body';
      const head = doc.createElement('header');
      head.className = 'tb-head';
      const t = doc.createElement('span'); t.className = 'tb-title'; t.textContent = c.title || title || `Part ${index + 1}`;
      head.append(t);
      node.append(head);
      const words = [];
      (c.paragraphs || []).forEach((p, i) => {
        node.append(paragraphEl(doc, c, i, figureSrc, figureWaits));
        const id = figureId(p);
        words.push(id ? ((c.figures || []).find(f => f.id === id)?.caption || '') : String(p));
      });
      toc.push({ id: 'c' + index, label: t.textContent, page: index + 1, anchor: '', depth: 0, parent: null, kind: 'chapter', number: c.number });
      return { index, href: '', title: t.textContent, node, text: [t.textContent, ...words].join('\n\n'), role: 'text' };
    });
    return { title: title || edition?.title || '', authors: author ? [author] : [], language: edition?.language || 'en', chapters, toc, cover: null, start: 0 };
  }

  /** A crop drawn after the book was built (bookOf figureWaits): its picture in place of the empty one. */
  function figureCame(book, id, url) {
    for (const c of book?.chapters || []) for (const img of c.node.querySelectorAll('.pt-fig img[data-wait]')) {
      if (img.parentElement.dataset.figure !== id) continue;
      img.src = url; delete img.dataset.wait;
    }
  }

  /** A place in the text view (chapter n, 1-based; paragraph; word) as the PDF's { page, frac }, or null. */
  function pageAt(edition, n, para = 0, word = 0) {
    const c = edition?.chapters?.[n - 1];
    if (!c || !global.TinctPdfText) return null;
    return global.TinctPdfText.pageOf(edition, { chapterNumber: c.number, paragraphIndex: Math.max(0, para | 0), wordIndex: Math.max(0, word | 0) });
  }
  /** The PDF's { page, frac } as a place in the text view: { n, para, word }, or null. */
  function spotAt(edition, page, frac = 0) {
    if (!global.TinctPdfText) return null;
    const at = global.TinctPdfText.placeOf(edition, page, frac);
    if (!at) return null;
    const n = (edition.chapters || []).findIndex(c => c.number === at.chapterNumber) + 1;
    return n > 0 ? { n, para: at.paragraphIndex, word: at.wordIndex } : null;
  }
  /** The paragraphs (indexes) of chapter n that hold words printed on `page`, the one running onto it included. */
  function parasOnPage(edition, n, page) {
    const c = edition?.chapters?.[n - 1]; if (!c || !Array.isArray(c.pages)) return [];
    const out = [];
    c.paragraphs.forEach((_, i) => {
      const from = c.pages[i], next = (c.pageBreaks || []).filter(b => b[0] === i).map(b => b[2]);
      const to = Math.max(from, ...next);
      if (page >= from && page <= to) out.push(i);
    });
    return out;
  }
  /** The chapters (1-based) with words on `page`. */
  const chaptersOnPage = (edition, page) => (edition?.chapters || []).map((c, i) => (parasOnPage(edition, i + 1, page).length ? i + 1 : 0)).filter(Boolean);

  /** A run of words (a highlight's, a card's passage) normalised for finding: letters and digits, single spaces. */
  const norm = s => String(s || '').toLowerCase().replace(/­/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  /** Where `text` stands in `hay` (both as they are), by their normalised words: [start, end] in `hay`, or null. */
  function findIn(hay, text) {
    const want = norm(text); if (want.length < 3) return null;
    let flat = '';
    const map = [];
    const raw = String(hay || '');
    for (let k = 0; k < raw.length; k++) {
      const ch = raw[k].toLowerCase();
      if (/[\p{L}\p{N}]/u.test(ch)) { flat += ch; map.push(k) } else if (flat && !flat.endsWith(' ')) { flat += ' '; map.push(k) }
    }
    const at = flat.indexOf(want); if (at < 0) return null;
    return [map[at], map[at + want.length - 1] + 1];
  }

  /*
   * Crops in this viewer, as the Tinct reader draws them (app/src/lab/userBook/pdfEdition.ts cropper, the same steps and
   * ids, so an edition converted in either has the same chapters, words and pictures): each page drawn small to find its
   * figures and tables (margin.js findFigures) and its displayed formulas (pdf-regions.js), then each region drawn sharp
   * at this device's pixel ratio. `images`: id -> { type, data } (the record's figureData).
   * The converter waits only for where the regions are (their ids and drawn sizes, which are all the text needs); their
   * sharp pictures are drawn after, one page at a time, nearest the reader's page first (`near`), while the converter goes
   * on. `drawn()` is done when all are (true: every one drawn), `onDrawn(id)` is told of each, `stop()` ends the drawing,
   * `pace()` (when set) is waited for before each page is drawn.
   */
  // The worker beside this script, with its cache tag.
  const WORKER = (() => { try { const src = global.document?.currentScript?.src; return src ? new URL('pdf-regions-worker.js' + new URL(src).search, src).href : null } catch { return null } })();
  function canvas(doc, w, h) { const c = doc.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c }
  const pngOf = c => new Promise(resolve => { try { c.toBlob(b => resolve(b), 'image/png') } catch { resolve(null) } });
  function cropper(images, { doc = global.document, dpr = Math.max(1, Math.min(3, global.devicePixelRatio || 1)), column = Math.min(680, Math.max(280, (global.innerWidth || 390) - 32)) } = {}) {
    const api = global.TinctPdfRegions, margin = global.TinctMargin, util = global.pdfjsLib?.Util;
    if (!api || !margin?.findFigures || !util || !doc) return null;
    const options = { dpr, column };
    // Where the regions are: worked out off the main thread while the next page is drawn (js/pdf-regions-worker.js).
    const find = api.finder ? api.finder(WORKER, margin) : input => Promise.resolve().then(() => api.find(input, margin));
    const queue = [];
    let running = null, focus = null, failed = false, stopped = false;
    // A page's sharp drawing: the page once, sharp enough for its sharpest crop, then each crop cut from it.
    const draw = async ({ n, page, regions, sizes, scale }) => {
      const big = page.getViewport({ scale });
      const sharp = canvas(doc, big.width, big.height), sg = sharp.getContext('2d');
      if (!sg) { failed = true; return }
      try {
        await page.render({ canvasContext: sg, viewport: big, background: 'rgba(0,0,0,0)' }).promise;
        for (const [k, region] of regions.entries()) {
          const size = sizes[k]; if (!size || stopped) continue;
          const crop = canvas(doc, size.width, size.height), cg = crop.getContext('2d');
          if (!cg) { failed = true; continue }
          cg.drawImage(sharp, region.x * sharp.width, region.y * sharp.height, region.w * sharp.width, region.h * sharp.height, 0, 0, crop.width, crop.height);
          const blob = await pngOf(crop);
          crop.width = crop.height = 0;
          if (!blob) { failed = true; continue }
          const id = `p${n}-${k + 1}`;
          images.set(id, { type: 'image/png', data: await blob.arrayBuffer() });
          try { run.onDrawn?.(id) } catch {}
        }
      } finally { sharp.width = sharp.height = 0 }
    };
    const pump = () => {
      running ??= (async () => {
        while (queue.length && !stopped) {
          // In idle time only, while the text is being prepared in the background (reader.js pdfTextPrepare).
          if (run.pace) await run.pace();
          if (!queue.length || stopped) break;
          let at = 0;
          if (focus != null) queue.forEach((job, i) => { if (Math.abs(job.n - focus) < Math.abs(queue[at].n - focus)) at = i });
          const [job] = queue.splice(at, 1);
          try { await draw(job) } catch { failed = true }
        }
        running = null;
      })();
    };
    const run = async (n, page, items) => {
      const base = page.getViewport({ scale: 1 }), pageSize = { w: base.width, h: base.height };
      const vp = page.getViewport({ scale: 480 / base.width });
      const drawn = canvas(doc, vp.width, vp.height), g = drawn.getContext('2d', { alpha: false });
      if (!g) return [];
      g.fillStyle = '#fff'; g.fillRect(0, 0, drawn.width, drawn.height);
      await page.render({ canvasContext: g, viewport: vp }).promise;
      const W = 240, H = Math.max(1, Math.round(W * drawn.height / drawn.width));
      const small = canvas(doc, W, H), x = small.getContext('2d', { willReadFrequently: true });
      if (!x) return [];
      x.drawImage(drawn, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) ink[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) < 247 ? 1 : 0;
      drawn.width = drawn.height = 0; small.width = small.height = 0;
      const spans = [], body = [];
      for (const it of items) {
        if (!it || typeof it.str !== 'string' || !it.str.trim() || !it.transform) continue;
        const tx = util.transform(vp.transform, it.transform), size = Math.hypot(tx[2], tx[3]);
        if (size < 1) continue;
        spans.push({ x: tx[4] / vp.width, y: (tx[5] - size * 0.86) / vp.height, w: (it.width * vp.scale) / vp.width, h: (size * 1.1) / vp.height, text: it.str });
        body.push({ x: tx[4], base: tx[5], size, w: it.width * vp.scale, str: it.str });
      }
      const regions = await find({ ink, W, H, spans, body, vp: { width: vp.width, height: vp.height } });
      if (!regions.length || stopped) return [];
      const sizes = regions.map(region => api.cropSize(region, pageSize, options));
      const most = Math.sqrt(12e6 / Math.max(1, pageSize.w * pageSize.h));
      const scale = Math.min(most, Math.max(1, ...regions.map((region, k) => (sizes[k] ? sizes[k].width / (region.w * pageSize.w) : 1))));
      queue.push({ n, page, regions, sizes, scale });
      pump();
      const out = [];
      for (const [k, region] of regions.entries()) if (sizes[k]) out.push({ ...region, id: `p${n}-${k + 1}`, css: sizes[k].css });
      return out;
    };
    run.near = page => { focus = Number.isFinite(page) ? page : null };
    run.stop = () => { stopped = true; queue.length = 0 };
    run.drawn = async () => { while (running) await running; return !failed && !stopped };
    run.busy = () => !!running || queue.length > 0;
    run.onDrawn = null;
    run.pace = null;
    return run;
  }

  global.TinctPdfTextView = { KEY, keyOf, isKey, pdfKey, figureId, bookOf, figureCame, pageAt, spotAt, parasOnPage, chaptersOnPage, norm, findIn, cropper };
})(typeof window !== 'undefined' ? window : globalThis);
