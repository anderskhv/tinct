'use strict';
// Tinct · the margin preview (Anders, 19 Oct 2026): a registered Tinct book in this reader, for testing.
// /reader?book=<id>&margin=1 shows this page (book.html) in a frame at /lab/addbook/book?tinctBook=<id> and hands it the book's
// main edition, already loaded and checked (src/lab/marginPreview/: the edition loader, the book reader's place,
// read only). Here it becomes an EPUB's chapters (reader.js openRegistered): one <p> per edition paragraph, so a
// place is the same (chapter, paragraph, word) in both readers.
// Sync (21 Oct 2026, margin view as the desktop's default): the place is reported to the page, which writes it through
// the book reader's position path (src/lab/marginPreview/useMarginPreviewPlace.ts); this frame keeps a copy of it on
// this device (pos:preview:<id>) only to open where it was. Highlights and notes are the book reader's own
// (useMarginPreviewMarks), and cards live in the book's chat history (useMarginPreviewCards), held here in memory only.
(function () {
  const id = new URLSearchParams(location.search).get('tinctBook');
  if (!id || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(id)) return;
  // The margin at every width: the phone's bottom card and selection bar too (reader.js epubMargin).
  window.TinctEpubMargin = true;
  const KEY = 'preview:' + id;
  const POS = 'tinct-addbook:pos:' + KEY;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const column = () => document.getElementById('column');
  const say = html => { const c = column(); if (c) c.innerHTML = `<div class="pdf-status" role="alert">${html}</div>` };

  /** The page that framed this one (MarginPreview.tsx: load, paper, layoutHref), waited for briefly. -> it, or null */
  async function bridge() {
    for (let i = 0; i < 50; i++) {
      try { const p = window.parent !== window && window.parent.TinctMarginPreview; if (p && p.bookId === id) return p } catch { return null }
      await new Promise(r => setTimeout(r, 100));
    }
    return null;
  }

  /*
   * Tinct paper (Anders, 20 Oct 2026): on the desktop the book reads as in the book reader, its font, size, line,
   * paragraph gap, alignment and its leaf's measure for this reader and window (marginPreviewPaper), on the theme's
   * own paper: no white sheet, border or shadow (white sheets are for a PDF's real pages). The margin column sits
   * beside the text, which scrolls with it. Applied again as the window changes width (the size follows it).
   */
  let paperOf = null;
  function applyPaper() {
    const lab = document.querySelector('.lab'); if (!lab || !paperOf) return;
    let p = null;
    try { p = paperOf(innerWidth) } catch { p = null }
    if (!p) return;
    const set = (k, v) => lab.style.setProperty(k, v);
    set('--tb-font', p.fontFamily); set('--tb-size', p.fontSize + 'px'); set('--tb-head', String(p.headingSize / p.fontSize));
    set('--tb-lh', String(p.lineHeight)); set('--tb-gap', p.paragraphGap + 'em'); set('--tb-align', p.align); set('--tb-measure', p.measure + 'px');
  }
  addEventListener('resize', applyPaper);

  /*
   * A figure (22 Oct 2026, launch): the picture at its paragraph, its caption under it, as the book reader shows it and as
   * a PDF's Tinct text draws its crops here (pdf-text-view.js: .pt-fig, its CSS, the figure peek on "Figure 2"). One
   * block whose text is the caption, or a zero-width space, so it is one paragraph (reader.js epubParas) at its index and
   * its drawn text is the model's (marginPreviewAnchors drawnParagraphText). Its size is set before the image loads.
   */
  function figureEl(p) {
    const fig = p.figure || {}, el = document.createElement('div');
    el.className = 'pt-fig tb-fig' + (fig.large ? ' is-large' : '');
    el.dataset.figure = String(fig.id || ''); el.dataset.kind = 'figure';
    if (fig.src) {
      const img = document.createElement('img');
      img.src = fig.src; img.alt = fig.alt || p.text || `Figure ${fig.number || ''}`.trim(); img.decoding = 'async'; img.loading = 'lazy';
      if (fig.width > 0 && fig.height > 0) { img.width = fig.width; img.height = fig.height; img.style.aspectRatio = `${fig.width} / ${fig.height}` }
      el.append(img);
    }
    const cap = document.createElement('span');
    cap.className = 'pt-cap';
    cap.textContent = String(p.text || '').trim() ? p.text : '\u200b';
    el.append(cap);
    return el;
  }

  /** A paragraph as the book reader shows it: its text, emphasised ranges in <em>, its kind (a subheading, an item, a line). An empty one keeps its index. */
  function paragraphEl(p) {
    if (p.figure) return figureEl(p);
    const el = document.createElement('p');
    el.className = 'tb-p' + (p.kind ? ' tb-' + p.kind : '');
    const text = String(p.text || '');
    if (!text.trim()) { el.textContent = '​'; return el }
    let at = 0;
    for (const [a, b] of p.em || []) {
      if (a > at) el.append(text.slice(at, a));
      const em = document.createElement('em'); em.textContent = text.slice(a, b); el.append(em);
      at = b;
    }
    if (at < text.length) el.append(text.slice(at));
    return el;
  }

  const partNamed = (part, title) => { const name = String(part).replace(/^part\s+[\divxlc]+\s*[—–:.-]?\s*/i, '').trim().toLowerCase(); return !!name && String(title).toLowerCase().includes(name) };

  /** The model as TinctEpub.parse returns a book: { title, authors, language, chapters: [{ index, title, node, text }], toc }.
   * `from`: the chapter (1-based) the reader opens at. The chapters after the next one are laid out later (laterChapters). */
  function asEpub(model, from = 1) {
    const toc = [], parts = new Map();
    const chapters = model.chapters.map((c, index) => {
      const node = document.createElement('div');
      node.className = 'tb-chapter';
      const head = document.createElement('header');
      head.className = 'tb-head';
      head.innerHTML = (c.section ? `<span class="tb-part">${esc(c.section)}</span>` : '') + `<span class="tb-title">${esc(c.title)}</span>`;
      // The phone shows the heading as the book reader does, its chapter's title alone, when that names the part
      // ("The Window · 1" under "Part I — The Window"); a part the title does not name keeps its line.
      if (c.section && partNamed(c.section, c.title)) head.classList.add('is-named');
      node.append(head, ...c.paragraphs.map(paragraphEl));
      if (index + 1 > from + 1) { node.classList.add('tb-later'); node.style.containIntrinsicBlockSize = `auto ${estimate(c)}px` }
      let parent = null;
      if (c.section) {
        if (!parts.has(c.section)) { const e = { id: 'p' + parts.size, label: c.section, page: index + 1, anchor: '', depth: 0, parent: null, kind: 'part' }; parts.set(c.section, e); toc.push(e) }
        parent = parts.get(c.section).id;
      }
      toc.push({ id: 'c' + index, label: c.title, page: index + 1, anchor: '', depth: parent ? 1 : 0, parent, kind: 'chapter', number: c.number });
      return { index, href: '', title: c.title, node, text: [c.title, ...c.paragraphs.map(p => p.text)].join('\n\n') };
    });
    return { title: model.title, authors: model.author ? [model.author] : [], language: model.language || 'en', chapters, toc, cover: null };
  }

  /**
   * The first page on a phone (round 2): every chapter drawn at once was the largest part of it (0.4 s of layout for
   * Frankenstein at a phone's speed, more for a long book). The chapters up to the place and the one after are drawn
   * at once, so the place is where it was (round 1: estimated heights above it moved it). Those after it are drawn
   * by the browser when they come near (`.tb-later`: content-visibility auto, at an estimated height), and one by one
   * while the reader is still: a chapter is drawn then only while it is below the screen, where its real height moves
   * nothing in view. One the reader has passed (the contents' jump) is left to the browser.
   */
  const LINE_PX = () => (innerWidth < 700 ? 1.1 : 0.75); // px of height per character, before one chapter is measured
  let pxPerChar = 0;
  const charsOf = c => c.paragraphs.reduce((n, p) => n + String(p.text || '').length + 60, 200);
  const estimate = c => Math.round(charsOf(c) * (pxPerChar || LINE_PX()));
  function laterChapters(model) {
    const nodes = [...document.querySelectorAll('.tb-chapter')];
    const measured = nodes.findIndex((n, i) => !n.classList.contains('tb-later') && n.offsetHeight > 0 && model.chapters[i]?.paragraphs.length > 3);
    if (measured >= 0) {
      pxPerChar = nodes[measured].offsetHeight / charsOf(model.chapters[measured]);
      nodes.forEach((n, i) => { if (n.classList.contains('tb-later')) n.style.containIntrinsicBlockSize = `auto ${estimate(model.chapters[i])}px` });
    }
    const idle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 1500 }) : f => setTimeout(f, 120);
    let i = 0;
    const next = () => {
      for (; i < nodes.length; i++) {
        const n = nodes[i]; if (!n.classList.contains('tb-later') || !n.isConnected) continue;
        if (n.getBoundingClientRect().top <= innerHeight * 2) continue; // near or passed: the browser draws it
        n.classList.remove('tb-later'); i++; break;
      }
      if (i < nodes.length) idle(next);
    };
    idle(next);
  }

  /**
   * Where it opens: its own place, unless the book reader's place is newer (read there since). The reader then goes to
   * that chapter, paragraph and word (reader.js epubRestore, from pos:<key>), and keeps its own place from there.
   */
  function seedPlace(model) {
    const s = model.start; if (!s || !s.updatedAt) return;
    let own = null;
    try { own = JSON.parse(localStorage.getItem(POS) || 'null') } catch {}
    if ((Number(own?.at) || 0) >= s.updatedAt) return;
    const page = model.chapters.findIndex(c => c.number === s.chapterNumber) + 1;
    if (page < 1) return;
    const { via: _v, quote: _q, ...rest } = own || {};
    try { localStorage.setItem(POS, JSON.stringify({ ...rest, page, frac: 0, para: s.paragraphIndex, word: s.wordIndex, at: s.updatedAt, from: 'reader' })) } catch {}
  }

  const STYLE = `.tb-chapter .tb-head{display:block;margin:0 0 1.6em;text-align:center}
.tb-chapter .tb-part{display:block;font-size:.9em;font-style:italic;opacity:.7;margin-bottom:.4em}
.tb-chapter .tb-title{display:block;font-family:'Playfair Display','EB Garamond',Georgia,serif;font-size:1.45em;line-height:1.25}
.tb-chapter .tb-p{white-space:pre-line}
.tb-chapter .tb-fig img{width:auto;height:auto;max-width:100%;max-height:min(78vh,900px)}
html .lab.byob .epub-pg p.tb-p.tb-heading{font-weight:600;text-align:left;margin-top:1.1em;-webkit-hyphens:manual;hyphens:manual;text-wrap:balance}
html .lab.byob .epub-pg p.tb-p.tb-label,html .lab.byob .epub-pg p.tb-p.tb-line{text-align:left;-webkit-hyphens:manual;hyphens:manual}
html .lab.byob .epub-pg p.tb-p.tb-subtitle,html .lab.byob .epub-pg p.tb-p.tb-byline{font-style:italic;text-align:left;color:var(--lab-ink-muted);-webkit-hyphens:manual;hyphens:manual}
html .lab.byob .epub-pg p.tb-p.tb-item{padding-left:1.2em;text-indent:-1.2em}
.lab.byob .epub-sheet{content-visibility:visible}
.lab.byob .tb-chapter.tb-later{content-visibility:auto}
.tb-mark{display:none}
.lab.is-phone .pdf-column{padding-top:0;padding-left:0;padding-right:0}
.lab.is-phone .epub-sheet,html .lab.byob.is-phone .epub-sheet{width:100%;max-width:672px;margin:0 auto;padding:10px 1.55rem 2.4em;background:transparent!important;box-shadow:none!important;border:0;border-radius:0;color:var(--lab-ink)}
.lab.is-phone .epub-pg,html .lab.byob.is-phone .epub-pg{font-size:calc(1.58rem / 1.3 * var(--epub-scale,1));line-height:1.48;color:var(--lab-ink)!important}
.lab.is-phone .epub-pg p.tb-p{margin:0 0 .28em;text-align:var(--lab-text-align,justify);text-justify:auto;word-spacing:normal;letter-spacing:normal;overflow-wrap:break-word;word-break:normal;-webkit-hyphens:auto;hyphens:auto;-webkit-hyphenate-limit-before:2;-webkit-hyphenate-limit-after:3;-webkit-hyphenate-limit-lines:3;hyphenate-limit-chars:7 2 3;hyphenate-limit-lines:3}
.lab.is-phone .tb-chapter .tb-head{text-align:left;margin:0 0 .45em}
.lab.is-phone .tb-chapter .tb-part{font-size:.82em;margin-bottom:.25em;color:var(--lab-ink-muted);opacity:1}
.lab.is-phone .tb-chapter .tb-head.is-named .tb-part{display:none}
.lab.is-phone .tb-chapter .tb-title{font-family:var(--lab-font-reader,'EB Garamond',Georgia,serif);font-weight:700;font-size:1.266em;line-height:1.42}
.lab.is-phone .tb-mark{display:block;margin:.2em 0 .9em;font-family:'EB Garamond',Georgia,serif;color:var(--lab-ink-muted);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.lab.is-phone .tb-mark.is-end{margin:1.1em 0 .4em;padding-top:.7em;border-top:1px solid color-mix(in srgb,var(--lab-ink) 14%,transparent)}
.lab.is-phone .tb-mark::before{content:attr(data-k) " " attr(data-n);display:block;margin:0 0 4px;font-size:15px;font-style:italic;line-height:1.3;color:var(--lab-ink-faint)}
.lab.is-phone .tb-pill{display:inline-flex;align-items:center;min-height:36px;margin:0 8px 0 0;padding:0;border:0;background:transparent;color:var(--lab-ink-muted);font:15px/1.3 'EB Garamond',Georgia,serif;cursor:pointer;-webkit-tap-highlight-color:transparent}
.lab.is-phone .tb-pill::after{content:attr(data-label);border:1px solid color-mix(in srgb,var(--lab-ink) 22%,transparent);border-radius:999px;padding:3px 12px}
.lab.is-phone .tb-pill:not([data-pill="note"])::after{content:"✧\\00a0\\00a0" attr(data-label)}
.lab.is-phone .tb-pill[aria-expanded="true"]::after{color:var(--lab-ink);background:var(--lab-surface)}
.lab.is-phone .tb-pill:focus-visible{outline:none}
.lab.is-phone .tb-pill:focus-visible::after{outline:2px solid var(--lab-ink-muted);outline-offset:2px}
html .lab.byob:not(.is-phone) .epub-sheet{width:min(100%,var(--tb-measure,42em));max-width:100%;padding:12px 0 2.4em;background:transparent!important;box-shadow:none!important;border:0;border-radius:0;color:var(--lab-ink)}
html .lab.byob:not(.is-phone) .epub-pg{font-family:var(--tb-font,var(--lab-font-reader,'Literata',Georgia,serif));font-size:calc(var(--tb-size,19px) * var(--epub-scale,1));line-height:var(--tb-lh,1.48);color:var(--lab-ink)!important}
html .lab.byob:not(.is-phone) .epub-pg p.tb-p{margin:0 0 var(--tb-gap,.28em);text-align:var(--tb-align,justify);text-justify:auto;-webkit-hyphens:auto;hyphens:auto;hyphenate-limit-chars:7 2 3;-webkit-hyphenate-limit-before:2;-webkit-hyphenate-limit-after:3;text-wrap:wrap}
html .lab.byob:not(.is-phone) .tb-chapter .tb-head{text-align:left;margin:0 0 20px;padding-top:9px}
html .lab.byob:not(.is-phone) .tb-chapter .tb-part{font-family:'EB Garamond',Georgia,serif;font-size:.82em;margin-bottom:.25em;color:var(--lab-ink-muted);opacity:1}
html .lab.byob:not(.is-phone) .tb-chapter .tb-head.is-named .tb-part{display:none}
html .lab.byob:not(.is-phone) .tb-chapter .tb-title{font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:700;font-size:calc(var(--tb-head,1.1127) * 1em);line-height:1.25;color:var(--lab-ink)}`;
  // (Chapters are drawn whole, not skipped off screen: a Tinct chapter runs to many screens, and an estimated height
  // above the place moved it as the chapters were drawn; reader.js epubGoSpot measures real lines.)

  /**
   * The reading fonts, fetched while the book loads (at most FONT_WAIT_MS): the chapters are then laid out once, in
   * their own fonts. A font that came later reflowed the whole book after the place was restored, and without scroll
   * anchoring (Safari) moved it by paragraphs; reader.js also goes back to the held place then (fonts loadingdone).
   */
  const FONT_WAIT_MS = 1500;
  function fontsSoon() {
    const f = document.fonts; if (!f?.load) return Promise.resolve();
    const lab = document.querySelector('.lab');
    const css = lab && getComputedStyle(lab), body = (css && (css.getPropertyValue('--tb-font').trim() || css.getPropertyValue('--lab-font-reader').trim())) || "'Literata', Georgia, serif";
    const wanted = [`400 19px ${body}`, `italic 400 19px ${body}`, `400 28px 'Playfair Display'`].map(font => f.load(font, 'Aa').catch(() => null));
    return Promise.race([Promise.all(wanted), new Promise(r => setTimeout(r, FONT_WAIT_MS))]);
  }

  /* ---------- Sync with the page (21 Oct 2026): the place ----------
     The page (MarginPreviewSync) writes the place through the book reader's store, with its guards: it is told
     where the view is and decides what of that is a place (marginPreviewPlace.ts). `open`: the book is open and its
     place restored (the word it was restored to: the target); `move`: the view moved (each place kept here,
     reader.js savePlaceNow). The reader's own actions are counted (a restore is the reader's place only once it has
     landed, or once they act). Uses reader.js's globals (state, epubHold, epubSpot, epubGoSpot, currentPlace). */
  const POS_KEY = 'pos:' + KEY;
  let interactions = 0, sync = null, lastActive = 0, goes = 0;
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(type, () => {
    interactions++;
    const now = Date.now(); if (now - lastActive > 1000) { lastActive = now; try { sync?.place?.active?.() } catch {} }
  }, { capture: true, passive: true });
  /** The page's sync, once it is there (it mounts as the book loads), or null. */
  async function syncOf(host) {
    for (let i = 0; i < 40; i++) { try { if (host?.sync) return host.sync } catch { return null } await new Promise(r => setTimeout(r, 75)) }
    return null;
  }
  /** Where the view is: the word it was brought to while it has not moved since (previewSpot), else the top of the view; null in the space at a chapter's end. */
  function spotNow() {
    try {
      const page = currentPlace().page, s = document.getElementById('scroll'), x = epubHold.exact;
      if (x && x.top != null && x.page === page && Math.abs(s.scrollTop - x.top) <= 2) return { page, para: x.para, word: x.word };
      const e = epubSpot();
      return Number.isInteger(e.para) ? { page, para: e.para, word: e.word || 0 } : null;
    } catch { return null }
  }
  /** The screen of its chapter the view is on (the reading year's pages). */
  function screenNow() {
    try {
      const s = document.getElementById('scroll'), p = state.pages[currentPlace().page - 1];
      return Math.max(0, Math.floor((s.getBoundingClientRect().top - p.sheet.getBoundingClientRect().top) / Math.max(1, s.clientHeight)));
    } catch { return 0 }
  }
  function reportPlace(kind, extra = {}) {
    try { sync?.place?.report({ kind, spot: spotNow(), interactions, screen: screenNow(), ...extra }, document.visibilityState === 'hidden') } catch {}
  }
  /** Once a restore has settled (epubGoSpot's word at the top: epubHold.exact.top), or a moment for one without a word. -> its target */
  async function settled(want = null) {
    const t0 = Date.now();
    for (;;) {
      await new Promise(r => requestAnimationFrame(() => setTimeout(r, 30)));
      const x = typeof epubHold !== 'undefined' ? epubHold.exact : null;
      if (x && x.top != null && (!want || (x.page === want.page && x.para === want.para && x.word === want.word))) return { page: x.page, para: x.para, word: x.word };
      if (Date.now() - t0 > (x || want ? 3000 : 700)) return want || (x ? { page: x.page, para: x.para, word: x.word } : null);
    }
  }
  function watchPlace() {
    // A place kept here is a move when its time changes (savePlaceNow stamps `at` only for a move).
    const set = store.set;
    let at = (store.get(POS_KEY) || {}).at || 0;
    store.set = (k, v) => {
      set(k, v);
      if (k !== POS_KEY || !v || v.at === at) return;
      at = v.at;
      reportPlace('move');
    };
    sync.place.listen(spot => {
      goes++;
      if (!epubGoSpot(spot.page, spot.para, spot.word)) { reportPlace('open', { target: spot }); return }
      settled(spot).then(target => reportPlace('open', { target }));
    });
  }

  /* ---------- Sync with the page: highlights and notes (21 Oct 2026) ----------
     The book's marks are the book reader's own (the page's useMarginPreviewMarks: its list, its tombstones, its
     account rows). Here reader.js's store keeps them in memory under the preview's keys, filled from the page and
     handed back to it after each change; nothing of them is written to this device's own keys any more (the page
     moved what was there into the book reader's list once). */
  /* Cards too (21 Oct 2026): Explain, Simplify, Define, Ask, quizzes, primers, recaps… are kept in the book's chat
     history (the page's useMarginPreviewCards), held here in memory as `cards:<key>`. */
  const CARD_KEY = 'cards:' + KEY;
  const MARK_KEYS = new Set(['hl:' + KEY, 'hl-gone:' + KEY, CARD_KEY]);
  const memory = new Map();
  let marksTimer = 0, cardsTimer = 0;
  function pushCards() {
    clearTimeout(cardsTimer); cardsTimer = 0;
    try { sync?.cards?.put(JSON.parse(memory.get(CARD_KEY) || '[]')) } catch {}
  }
  function redrawMarks() {
    try { renderEpubHighlights() } catch {}
    try { marginLayout({ fresh: true }) } catch {}
    try { window.TinctNotebook?.changed() } catch {}
  }
  function pushMarks() {
    clearTimeout(marksTimer); marksTimer = 0;
    try { sync?.marks?.put(JSON.parse(memory.get('hl:' + KEY) || '[]')) } catch {}
  }
  function keepMarks() {
    const { get, set, del } = store;
    store.get = k => (MARK_KEYS.has(k) ? (memory.has(k) ? JSON.parse(memory.get(k)) : null) : get(k));
    store.del = k => (MARK_KEYS.has(k) ? void memory.delete(k) : del(k));
    store.set = (k, v) => {
      if (!MARK_KEYS.has(k)) return set(k, v);
      const text = JSON.stringify(v);
      if (memory.get(k) === text) return;
      memory.set(k, text);
      try { window.TinctNotebook?.changed() } catch {}
      if (k === 'hl:' + KEY) { clearTimeout(marksTimer); marksTimer = setTimeout(pushMarks, 400) }
      if (k === CARD_KEY && sync?.cards) { clearTimeout(cardsTimer); cardsTimer = setTimeout(pushCards, 800) }
    };
    try { memory.set('hl:' + KEY, JSON.stringify(sync.marks.list() || [])) } catch { memory.set('hl:' + KEY, '[]') }
    try { memory.set(CARD_KEY, JSON.stringify(sync.cards?.list() || [])) } catch { memory.set(CARD_KEY, '[]') }
    sync.cards?.listen(list => {
      const text = JSON.stringify(list || []);
      if (cardsTimer || memory.get(CARD_KEY) === text) return; // a change here is on its way: it wins
      memory.set(CARD_KEY, text);
      if (state.key === 'preview:' + id) { try { marginLayout({ fresh: true }) } catch {} try { window.TinctNotebook?.changed() } catch {} }
    });
    sync.marks.listen(list => {
      const text = JSON.stringify(list || []);
      if (marksTimer || memory.get('hl:' + KEY) === text) return; // a change of the reader's is on its way: it wins
      memory.set('hl:' + KEY, text);
      if (state.key === 'preview:' + id) redrawMarks();
    });
    // Leaving: what is waiting goes now.
    const leaving = () => { if (marksTimer) pushMarks(); if (cardsTimer) pushCards() };
    addEventListener('pagehide', leaving);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leaving() });
  }

  async function open() {
    const R = window.TinctReader; if (!R?.openRegistered) return;
    const style = document.createElement('style'); style.textContent = STYLE; document.head.appendChild(style);
    document.body.dataset.view = 'reader'; document.getElementById('root').hidden = false; document.getElementById('start').hidden = true;
    say('Opening…');
    const host = await bridge();
    paperOf = typeof host?.paper === 'function' ? host.paper : null;
    applyPaper();
    const fonts = fontsSoon();
    let model = null;
    try { model = host ? await host.load() : null } catch { model = null }
    await fonts;
    if (!model || !Array.isArray(model.chapters) || !model.chapters.length) {
      say(`This preview opens from the reader. <a href="/reader?book=${encodeURIComponent(id)}&amp;margin=1" target="_top">Open the margin preview</a>`);
      return;
    }
    // The page's sync first (it mounts as the book loads), so the book opens with its marks and cards, and the later
    // chapters' layout (laterChapters) is timed from the open as before.
    sync = await syncOf(host);
    if (sync?.marks) keepMarks();
    seedPlace(model);
    let from = 1;
    try { from = Math.max(1, Number(JSON.parse(localStorage.getItem(POS) || 'null')?.page) || 1) } catch {}
    const book = asEpub(model, from);
    setTimeout(() => laterChapters(model), 1200);
    // Two-page and Compare (the desktop's Layout): the book reader at this chapter, paragraph and word, in that layout.
    const layoutHref = typeof host.layoutHref === 'function'
      ? (view, at) => { const c = model.chapters[at.page - 1]; return c ? host.layoutHref(view, { editionKey: model.editionKey, chapterNumber: c.number, paragraphIndex: at.para || 0, wordIndex: at.word || 0 }) : null }
      : null;
    const opened = await R.openRegistered(book, { bookId: id, editionLabel: model.editionLabel || 'edition', normalHref: model.normalHref || `/reader?book=${encodeURIComponent(id)}&margin=0`, layoutHref });
    if (!opened || !sync?.place) return;
    watchPlace();
    const target = await settled();
    reportPlace('open', { target });
    // A reflow just after the restore (a font, the top bar's controls) can leave the view off its word as it is
    // reported, and the page then holds the place (marginPreviewPlace). reader.js brings the view back to the held
    // word; the restore is told again a few times while the reader has not acted, so it is written once it holds.
    const before = interactions;
    for (const ms of [1200, 2500, 5000]) setTimeout(() => { if (interactions === before && !goes && state.key === 'preview:' + id) reportPlace('open', { target }) }, ms);
  }
  window.TinctBookPreview = { asEpub, seedPlace, KEY, estimate, partNamed };
  if (window.TinctReader) open(); else addEventListener('tinct-reader-ready', open, { once: true });
})();
