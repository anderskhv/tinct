'use strict';
// Tinct · the margin preview (Anders, 19 Oct 2026): a registered Tinct book in this reader, for testing.
// /reader?book=<id>&margin=1 shows this page (book.html) in a frame at /lab/addbook/book?tinctBook=<id> and hands it the book's
// main edition, already loaded and checked (src/lab/marginPreview/: the edition loader, the book reader's place,
// read only). Here it becomes an EPUB's chapters (reader.js openRegistered): one <p> per edition paragraph, so a
// place is the same (chapter, paragraph, word) in both readers. The preview keeps its own place, highlights,
// notes and cards on this device (tinct-addbook:*:preview:<id>) and never writes the book reader's.
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

  /** A paragraph as the book reader shows it: its text, emphasised ranges in <em>. An empty one keeps its index. */
  function paragraphEl(p) {
    const el = document.createElement('p');
    el.className = 'tb-p';
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
.lab.byob .epub-sheet{content-visibility:visible}
.lab.byob .tb-chapter.tb-later{content-visibility:auto}
.tb-mark{display:none}
.lab.is-phone .pdf-column{padding-top:0;padding-left:0;padding-right:0}
.lab.is-phone .epub-sheet,html .lab.byob.is-phone .epub-sheet{width:100%;max-width:672px;margin:0 auto;padding:10px 1.55rem 2.4em;background:transparent!important;box-shadow:none!important;border:0;border-radius:0;color:var(--lab-ink)}
.lab.is-phone .epub-pg,html .lab.byob.is-phone .epub-pg{font-size:calc(1.58rem / 1.3 * var(--epub-scale,1));line-height:1.48;color:var(--lab-ink)!important}
.lab.is-phone .epub-pg p.tb-p{margin:0 0 .28em;text-align:justify;text-justify:auto;-webkit-hyphens:auto;hyphens:auto}
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
    seedPlace(model);
    let from = 1;
    try { from = Math.max(1, Number(JSON.parse(localStorage.getItem(POS) || 'null')?.page) || 1) } catch {}
    const book = asEpub(model, from);
    setTimeout(() => laterChapters(model), 1200);
    // Two-page and Compare (the desktop's Layout): the book reader at this chapter, paragraph and word, in that layout.
    const layoutHref = typeof host.layoutHref === 'function'
      ? (view, at) => { const c = model.chapters[at.page - 1]; return c ? host.layoutHref(view, { editionKey: model.editionKey, chapterNumber: c.number, paragraphIndex: at.para || 0, wordIndex: at.word || 0 }) : null }
      : null;
    await R.openRegistered(book, { bookId: id, editionLabel: model.editionLabel || 'edition', normalHref: model.normalHref || `/reader?book=${encodeURIComponent(id)}&margin=0`, layoutHref });
  }
  window.TinctBookPreview = { asEpub, seedPlace, KEY, estimate, partNamed };
  if (window.TinctReader) open(); else addEventListener('tinct-reader-ready', open, { once: true });
})();
