'use strict';
// Tinct · Listen in the margin preview (Anders, 21 Oct 2026: "audio playback need to work there too").
// A Tinct book in the margin reader (js/tinct-book.js) is heard with the book reader's own player: it runs in the page
// that frames this one (src/lab/marginPreview/useMarginListen.ts, window.parent.TinctMarginPreview.listen), with its
// clip buffer, stall recovery, lock screen and speed. This file draws Play in the top bar, the transport and the
// follow highlight from the player's snapshots, and hands it places: the paragraph and word at the top of the view,
// or the start of a selection. A place is the same (chapter, paragraph, word) in both readers: one <p class="tb-p">
// per edition paragraph, words as `\S+` of its text (src/lab/marginPreview/marginPreviewModel.ts).
// A reader's own EPUB or PDF is heard the same way (Anders, 22 Oct 2026: Tinct's voice for every book, never the
// browser's): the page that frames it (MarginOwnBook) runs the same player through the own-book route, and its
// chapters and paragraphs come from reader.js (window.TinctOwnListen: an EPUB's chapters or a PDF's pages, each
// paragraph with the text nodes it is drawn in), handed to the player here (attachOwn).
(function (global) {
  /** [start, end) of each `\S+` word of a text. */
  function wordOffsets(text) {
    const out = [];
    for (const m of String(text || '').matchAll(/\S+/g)) out.push([m.index, m.index + m[0].length]);
    return out;
  }
  /** The word a character offset is in, or the next word when it is between words. */
  function wordIndexAt(text, offset) {
    let n = 0;
    for (const [, end] of wordOffsets(text)) { if (end <= offset) n++; else break }
    return n;
  }
  /** A paragraph's text as one string, with each text node's start in it. */
  function textNodes(el) {
    const nodes = [];
    let at = 0;
    const doc = el.ownerDocument, walker = doc.createTreeWalker(el, 4 /* SHOW_TEXT */);
    for (let n; (n = walker.nextNode());) { nodes.push({ node: n, at }); at += n.nodeValue.length }
    return { nodes, text: nodes.map(x => x.node.nodeValue).join('') };
  }
  /** A DOM point for a character offset of the paragraph's text. */
  function pointAt(nodes, offset) {
    for (let i = nodes.length - 1; i >= 0; i--) if (nodes[i].at <= offset) return [nodes[i].node, Math.min(offset - nodes[i].at, nodes[i].node.nodeValue.length)];
    return nodes.length ? [nodes[0].node, 0] : null;
  }
  /** A Range over characters [a, b) of text drawn in `nodes` ({ node, at }), or null. */
  function rangeOver(nodes, a, b) {
    const start = pointAt(nodes, a), end = pointAt(nodes, b);
    if (!start || !end) return null;
    const r = start[0].ownerDocument.createRange();
    try { r.setStart(start[0], start[1]); r.setEnd(end[0], end[1]) } catch { return null }
    return r;
  }
  /** A Range over words [from, to) of an own book's paragraph ({ text, nodes() }); the whole paragraph without `from`. */
  function paraRange(para, from, to = from + 1) {
    if (!para) return null;
    const nodes = para.nodes(); if (!nodes.length) return null;
    if (from == null) return rangeOver(nodes, 0, para.text.length);
    const words = wordOffsets(para.text); if (!words.length) return null;
    const a = words[Math.max(0, Math.min(from, words.length - 1))], b = words[Math.max(0, Math.min(to - 1, words.length - 1))];
    return rangeOver(nodes, a[0], b[1]);
  }
  /** A Range over words [from, to) of a paragraph, or null. */
  function wordsRange(el, from, to = from + 1) {
    const { nodes, text } = textNodes(el), words = wordOffsets(text);
    if (!words.length) return null;
    const a = words[Math.max(0, Math.min(from, words.length - 1))], b = words[Math.max(0, Math.min(to - 1, words.length - 1))];
    const start = pointAt(nodes, a[0]), end = pointAt(nodes, b[1]);
    if (!start || !end) return null;
    const r = el.ownerDocument.createRange(); r.setStart(start[0], start[1]); r.setEnd(end[0], end[1]);
    return r;
  }
  /** The paragraph and word a DOM point names: { para, word } in its chapter, or null outside the text. */
  function placeOfPoint(chapterEl, node, offset) {
    const el = (node.nodeType === 1 ? node : node.parentElement)?.closest?.('p.tb-p');
    if (!el || !chapterEl.contains(el)) return null;
    const paras = paragraphsOf(chapterEl), para = paras.indexOf(el);
    if (para < 0) return null;
    const r = el.ownerDocument.createRange(); r.setStart(el, 0);
    try { r.setEnd(node, offset) } catch { return { para, word: 0 } }
    return { para, word: wordIndexAt(el.textContent, r.toString().length) };
  }
  /** A chapter's paragraphs, one per edition paragraph, in order. */
  const paragraphsOf = chapterEl => [...chapterEl.querySelectorAll(':scope > p.tb-p')];
  /** The first index in 0..n-1 whose bottom(i) is past y (bottoms grow with i), or n. */
  function firstPast(n, bottom, y) { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (bottom(mid) > y) hi = mid; else lo = mid + 1 } return lo }
  /** The chapter (index), paragraph and word at the top of a view whose top edge is `top` (a client y). */
  function topPlace(chapterEls, top) {
    const c = firstPast(chapterEls.length, i => chapterEls[i].getBoundingClientRect().bottom, top);
    if (c >= chapterEls.length) return null;
    const paras = paragraphsOf(chapterEls[c]);
    const p = firstPast(paras.length, i => paras[i].getBoundingClientRect().bottom, top);
    if (p >= paras.length) return { chapter: Math.min(c + 1, chapterEls.length - 1), para: 0, word: 0 };
    const el = paras[p];
    if (el.getBoundingClientRect().top >= top) return { chapter: c, para: p, word: 0 };
    const words = wordOffsets(textNodes(el).text);
    const w = firstPast(words.length, i => { const r = wordsRange(el, i)?.getClientRects(); return r && r.length ? r[r.length - 1].bottom : -Infinity }, top);
    return { chapter: c, para: p, word: Math.min(w, Math.max(0, words.length - 1)) };
  }
  /**
   * Whether to scroll for the word heard: not while the reader browses (scrolled away from it), and not while it is
   * comfortably in view (`band`: [top, bottom] client ys).
   */
  function needsScroll(rect, band, browsing) {
    if (browsing || !rect) return false;
    return rect.top < band[0] || rect.bottom > band[1];
  }
  const api = { wordOffsets, wordIndexAt, wordsRange, placeOfPoint, paragraphsOf, topPlace, needsScroll, rangeOver, paraRange };
  global.TinctBookListen = api;

  /* ---------- The page: only in the preview's frame (js/tinct-book.js), only once the reader has the book ---------- */
  const doc = global.document;
  if (!doc || !global.location) return;
  const params = new URLSearchParams(global.location.search);
  const id = params.get('tinctBook'), ownHex = params.get('userBook');
  const tinct = !!id && /^[a-z0-9][a-z0-9-]{0,80}$/.test(id);
  // A reader's own book, in the frame of MarginOwnBook (its host names the book by `userbook-<hex>`).
  const ownMode = !tinct && !!ownHex && /^[0-9a-f]{24,64}$/.test(ownHex);
  if (!tinct && !ownMode) return;
  const OWN = () => global.TinctOwnListen || null;
  const $ = k => doc.getElementById(k);
  // reader.js's own helpers (its top-level bindings are this page's globals): read only when it defines them.
  /* global ICON, SKIP, toast */
  const readerIcons = () => (typeof ICON !== 'undefined' ? ICON : {});
  const readerSkip = () => (typeof SKIP === 'function' ? SKIP : null);
  const readerToast = () => (typeof toast === 'function' ? toast : null);
  const hostOf = () => { try { const p = global.parent !== global && global.parent.TinctMarginPreview; return p && (ownMode ? p.own && String(p.bookId || '').endsWith(ownHex) : p.bookId === id) ? p : null } catch { return null } };
  const player = () => hostOf()?.listen || null;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let model = null, snap = null, chosen = null, browsing = false, selfScrollUntil = 0, toldError = '';
  const chapterEls = () => [...doc.querySelectorAll('.tb-chapter')];
  const chapterIndexOf = number => model ? model.chapters.findIndex(c => c.number === number) : -1;
  const rootEl = () => doc.querySelector('.lab');
  const isPhone = () => !!rootEl()?.classList.contains('is-phone');
  const say = text => { const t = readerToast(); if (t) t(text) };

  const STYLE = `html .lab.is-epub.tb-can-listen #playBtn{display:grid!important}
.lab.tb-can-listen #playBtn[data-loading="true"]{position:relative}
.lab.tb-can-listen #playBtn[data-loading="true"]::after,.tb-listen-dock [data-a="play"][data-loading="true"]::after{content:"";position:absolute;inset:3px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--lab-ink) 18%,transparent);border-top-color:var(--lab-ink);animation:tb-listen-spin .9s linear infinite;pointer-events:none}
.tb-listen-dock [data-a="play"]{position:relative}
@keyframes tb-listen-spin{to{transform:rotate(1turn)}}
::highlight(tinct-listen){background-color:color-mix(in srgb,var(--lab-surface,#f4efe4) 82%,#d9c69d 18%);color:var(--lab-ink,#0b0b0b)}
::highlight(tinct-listen-para){background-color:color-mix(in srgb,var(--lab-surface,#f4efe4) 92%,#d9c69d 8%)}
.text-layer ::highlight(tinct-listen){color:transparent;background-color:var(--pdf-hl,rgba(214,186,112,.38))}
.text-layer ::highlight(tinct-listen-para){color:transparent;background-color:rgba(214,186,112,.14)}
.tb-chapter p.tb-p.tb-heard{position:relative}
.tb-chapter p.tb-p.tb-heard:not(.has-word)::before{content:"";position:absolute;left:-12px;top:.25em;bottom:.25em;width:3px;border-radius:2px;background:color-mix(in srgb,var(--lab-ink,#0b0b0b) 24%,transparent);pointer-events:none}
@media (prefers-reduced-motion:reduce){.lab.tb-can-listen #playBtn[data-loading="true"]::after,.tb-listen-dock [data-a="play"][data-loading="true"]::after{animation:none}}`;

  /* ---------- An own book's paragraphs (reader.js TinctOwnListen), kept per chapter for the text drawn now ---------- */
  let ownCache = new Map(), ownVersion = -1;
  function ownParas(n) {
    const O = OWN(); if (!O) return Promise.resolve([]);
    if (O.version !== ownVersion) { ownVersion = O.version; ownCache = new Map() }
    if (!ownCache.has(n)) { const v = { list: null }; v.done = Promise.resolve(O.paragraphs(n)).then(list => (v.list = Array.isArray(list) ? list : [])).catch(() => (v.list = [])); ownCache.set(n, v) }
    return ownCache.get(n).done;
  }
  const ownParasNow = n => (OWN()?.version === ownVersion ? ownCache.get(n)?.list : null) || null;
  /** The chapter (page), paragraph and word at the top of the view, in an own book. */
  async function ownTopPlace() {
    const O = OWN(), s = $('scroll'); if (!O || !s) return null;
    const top = s.getBoundingClientRect().top + 1, first = O.pageAt();
    for (let n = first; n <= Math.min(O.lastPage(), first + 2); n++) {
      const paras = await ownParas(n);
      const bottom = r => { const q = r ? [...r.getClientRects()].filter(x => x.height > 0) : []; return q.length ? q[q.length - 1].bottom : -Infinity };
      const p = firstPast(paras.length, i => bottom(paraRange(paras[i])), top);
      if (p >= paras.length) continue;
      const words = wordOffsets(paras[p].text);
      const w = firstPast(words.length, i => bottom(paraRange(paras[p], i)), top);
      return { chapterNumber: n, paragraphIndex: p, wordIndex: Math.min(w, Math.max(0, words.length - 1)) };
    }
    return { chapterNumber: first, paragraphIndex: 0, wordIndex: 0 };
  }
  /** An own book's place of a DOM point (a selection's start), when its chapter's paragraphs are known. */
  function ownPointPlace(node, offset) {
    const O = OWN(), n = O?.pageOf(node); if (!n) return null;
    const paras = ownParasNow(n); if (!paras) return null;
    for (let i = 0; i < paras.length; i++) {
      const hit = paras[i].nodes().find(x => x.node === node);
      if (hit) return { chapterNumber: n, paragraphIndex: i, wordIndex: wordIndexAt(paras[i].text, hit.at + offset) };
    }
    return null;
  }

  /** Where Play starts: the start of a selection in the text, else the paragraph and word at the top of the view. */
  function readingPlace() {
    if (ownMode) { const pick = chosen; chosen = null; return pick || ownTopPlace() }
    if (!model) return null;
    const els = chapterEls();
    const pick = chosen; chosen = null;
    if (pick) return pick;
    const s = $('scroll'); if (!s) return null;
    const at = topPlace(els, s.getBoundingClientRect().top + 1);
    if (!at) return null;
    const c = model.chapters[at.chapter];
    return c ? { chapterNumber: c.number, paragraphIndex: at.para, wordIndex: at.word } : null;
  }
  /** The start of the selection, read as Play is pressed (before the press can move it). */
  function selectionPlace() {
    const sel = global.getSelection?.(); if (!sel || sel.isCollapsed || !sel.rangeCount || !model) return null;
    if (ownMode) { const r = sel.getRangeAt(0); return ownPointPlace(r.startContainer, r.startOffset) }
    const r = sel.getRangeAt(0), els = chapterEls();
    const i = els.findIndex(el => el.contains(r.startContainer)); if (i < 0) return null;
    const at = placeOfPoint(els[i], r.startContainer, r.startOffset); if (!at) return null;
    return { chapterNumber: model.chapters[i].number, paragraphIndex: at.para, wordIndex: at.word };
  }
  /** The paragraph element heard, or null. */
  function heardEl(s = snap) {
    if (!s?.follow || s.chapterNumber == null || ownMode) return null;
    const i = chapterIndexOf(s.chapterNumber), el = chapterEls()[i];
    return el ? paragraphsOf(el)[s.follow.paragraphIndex] || null : null;
  }
  /** An own book's paragraph heard ({ text, nodes() }), when its chapter's paragraphs are known. */
  function heardPara(s = snap) {
    if (!ownMode || !s?.follow || s.chapterNumber == null) return null;
    return ownParasNow(s.chapterNumber)?.[s.follow.paragraphIndex] || null;
  }
  function heardRange(s = snap) {
    if (ownMode) {
      const para = heardPara(s); if (!para || s.follow.wordIndex == null) return null;
      return s.follow.from != null && s.follow.to != null ? paraRange(para, s.follow.from, s.follow.to) : paraRange(para, s.follow.wordIndex);
    }
    const el = heardEl(s); if (!el || s.follow.wordIndex == null) return null;
    return s.follow.from != null && s.follow.to != null ? wordsRange(el, s.follow.from, s.follow.to) : wordsRange(el, s.follow.wordIndex);
  }
  function heardRect(s = snap) {
    const r = heardRange(s), rects = r ? [...r.getClientRects()].filter(q => q.height > 0) : [];
    if (rects.length) return { top: rects[0].top, bottom: rects[rects.length - 1].bottom };
    if (ownMode) {
      // The paragraph (no word timed yet), else its page (a PDF page not drawn yet: going there draws it).
      const pr = heardPara(s) ? paraRange(heardPara(s)) : null, q = pr ? [...pr.getClientRects()].filter(x => x.height > 0) : [];
      if (q.length) return { top: q[0].top, bottom: Math.min(q[q.length - 1].bottom, q[0].top + 60) };
      const sheet = s?.chapterNumber != null ? OWN()?.sheet(s.chapterNumber) : null; if (!sheet) return null;
      const b = sheet.getBoundingClientRect();
      return { top: b.top, bottom: b.top + 60 };
    }
    const el = heardEl(s); if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: b.top, bottom: Math.min(b.bottom, b.top + 60) };
  }
  /** The view's comfortable band: below the top bar, above the transport. */
  function band() {
    const s = $('scroll'), sr = s.getBoundingClientRect();
    const dock = doc.querySelector('.tb-listen-dock')?.getBoundingClientRect();
    const bottom = Math.min(sr.bottom, dock && dock.height ? dock.top : sr.bottom) - sr.height * 0.08;
    return [sr.top + sr.height * 0.08, bottom];
  }
  function inView(s = snap) { const r = heardRect(s); if (!r) return false; const b = band(); return r.bottom > b[0] && r.top < b[1] }
  function scrollToHeard(force = false) {
    const s = $('scroll'); if (!s) return;
    const r = heardRect(); if (!r) return;
    if (!force && !needsScroll(r, band(), browsing)) return;
    const sr = s.getBoundingClientRect();
    selfScrollUntil = Date.now() + 900;
    const smooth = !force && !global.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    s.scrollBy({ top: r.top - (sr.top + sr.height * 0.3), behavior: smooth ? 'smooth' : 'auto' });
  }

  /* ---------- The follow highlight: the word (or sentence) heard, else its paragraph ---------- */
  const highlights = global.CSS && global.CSS.highlights && typeof global.Highlight === 'function' ? global.CSS.highlights : null;
  let mark = null, markedEl = null, paraMark = null;
  function paint() {
    if (ownMode) {
      // An own book: the word heard, else (no word timed yet) its paragraph, lightly; the page's DOM is not touched.
      if (!highlights) return;
      const on = snap && (snap.playing || snap.status === 'paused' || snap.pending) && snap.open;
      if (!mark) { mark = new global.Highlight(); highlights.set('tinct-listen', mark) }
      if (!paraMark) { paraMark = new global.Highlight(); highlights.set('tinct-listen-para', paraMark) }
      mark.clear(); paraMark.clear();
      if (!on) return;
      const range = heardRange();
      if (range) { mark.add(range); return }
      const para = heardPara(); const pr = para ? paraRange(para) : null;
      if (pr) paraMark.add(pr);
      return;
    }
    const el = snap && (snap.playing || snap.status === 'paused' || snap.pending) && snap.open ? heardEl() : null;
    if (markedEl && markedEl !== el) markedEl.classList.remove('tb-heard', 'has-word');
    markedEl = el;
    const range = el ? heardRange() : null;
    if (el) { el.classList.add('tb-heard'); el.classList.toggle('has-word', !!(range && highlights)) }
    if (!highlights) return;
    if (!mark) { mark = new global.Highlight(); highlights.set('tinct-listen', mark) }
    mark.clear();
    if (range) mark.add(range);
  }

  /* ---------- Play in the top bar and the transport (the book reader's controls, as reader.js draws them) ---------- */
  const ICONS = readerIcons;
  function setPlayButton() {
    const b = $('playBtn'); if (!b) return;
    const playing = !!snap?.playing, loading = !!(snap?.pending || snap?.buffering);
    const icon = playing ? ICONS().pause : ICONS().play;
    if (icon) b.innerHTML = icon;
    b.setAttribute('aria-label', playing ? 'Pause' : snap?.pending ? 'Preparing narration' : 'Play');
    b.dataset.loading = String(loading);
    const root = rootEl(); if (root) root.dataset.playing = String(playing);
  }
  const skipIcon = dir => { const S = readerSkip(); return S ? S(dir) : (dir === 'back' ? '−15' : '+15') };
  function renderTransport() {
    const root = rootEl(); if (!root) return;
    let bar = doc.querySelector('.tb-listen-dock');
    if (!snap?.open) { bar?.remove(); doc.querySelector('.tb-listen-speed')?.remove(); if (root.dataset.transport === 'open' && !doc.querySelector('.byob-transport')) root.dataset.transport = 'closed'; return }
    root.dataset.transport = 'open';
    const playing = snap.playing, rate = Math.round(snap.speed * 100) / 100;
    const playIcon = ((playing ? ICONS().pause : ICONS().play) || '').replace(/20\.7/g, '22');
    const pos = snap.chapterDuration > 0 ? Math.max(0, Math.min(1, snap.chapterTime / snap.chapterDuration)) : 0;
    const label = snap.chapterTitle || (model?.chapters[chapterIndexOf(snap.chapterNumber)]?.title ?? '');
    const loading = String(!!(snap.pending || snap.buffering));
    const key = [isPhone(), playing, rate, loading, label, Math.round(pos * 1000)].join('|');
    if (bar && bar.dataset.key === key) return;
    if (isPhone()) {
      if (!bar || bar.tagName !== 'FOOTER') { bar?.remove(); bar = doc.createElement('footer'); bar.className = 'lab-phone-bar byob-transport tb-listen-dock'; root.appendChild(bar) }
      bar.innerHTML = `<div class="lab-phone-bar-row is-audio has-5">
      <button type="button" class="lab-phone-fat lab-audio-control lab-audio-speed" data-a="speed" aria-label="Playback speed ${rate} times. Open speed control">${rate}×</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="back" aria-label="Back 15 seconds">${skipIcon('back')}</button>
      <button type="button" class="lab-phone-fat lab-audio-control is-active" data-a="play" data-loading="${loading}" aria-label="${playing ? 'Pause audiobook' : 'Resume audiobook'}">${playIcon}</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="forward" aria-label="Forward 15 seconds">${skipIcon('forward')}</button>
      <button type="button" class="lab-phone-fat lab-audio-control" data-a="close" aria-label="Close audio controls"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path></svg></button></div>`;
    } else {
      if (!bar || bar.tagName !== 'SECTION') { bar?.remove(); bar = doc.createElement('section'); bar.className = 'lab-desktop-audio-dock byob-transport tb-listen-dock'; bar.setAttribute('aria-label', 'Audio player'); root.appendChild(bar) }
      bar.innerHTML = `<button type="button" class="lab-desktop-audio-speed" data-a="speed" aria-label="Playback speed ${rate} times">${rate}×</button>
      <button type="button" data-a="back" aria-label="Back 15 seconds">${skipIcon('back')}</button>
      <button type="button" class="is-primary" data-a="play" data-loading="${loading}" aria-label="${playing ? 'Pause' : 'Resume audiobook'}">${playIcon}</button>
      <button type="button" data-a="forward" aria-label="Forward 15 seconds">${skipIcon('forward')}</button>
      <div class="lab-desktop-audio-track"><strong>${esc(model?.title || doc.title || '')}</strong><span>${esc(label)}</span>
        <i role="slider" tabindex="0" aria-label="Chapter position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pos * 100)}" aria-valuetext="${Math.round(pos * 100)}% of ${esc(label || 'the chapter')}"><b style="width:${(pos * 100).toFixed(1)}%"></b></i></div>
      ${playing || snap.pending ? '' : '<button type="button" class="lab-desktop-audio-dismiss" data-a="close" aria-label="Close audio controls"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path></svg></button>'}`;
      const slider = bar.querySelector('[role="slider"]');
      slider.onpointerdown = ev => { const rr = slider.getBoundingClientRect(), p = player(); if (p && snap.chapterDuration > 0) p.seekChapter(Math.max(0, Math.min(1, (ev.clientX - rr.left) / rr.width)) * snap.chapterDuration) };
      slider.onkeydown = ev => { const p = player(); if (!p) return; if (ev.key === 'ArrowLeft') { ev.preventDefault(); p.skip(-15) } if (ev.key === 'ArrowRight') { ev.preventDefault(); p.skip(15) } };
    }
    bar.dataset.key = key;
    bar.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const p = player(); if (!p) return;
      const a = b.dataset.a;
      if (a === 'play') transportPlay();
      if (a === 'back') p.skip(-15);
      if (a === 'forward') p.skip(15);
      if (a === 'speed') speedPopover();
      if (a === 'close') p.stop();
    });
  }
  function speedPopover() {
    const old = doc.querySelector('.tb-listen-speed'); if (old) { old.remove(); return }
    const p = player(); if (!p) return;
    const rate = snap?.speed || 1;
    const pop = doc.createElement('section');
    pop.className = 'lab-audio-speed-popover tb-listen-speed'; pop.setAttribute('aria-label', 'Playback speed');
    pop.innerHTML = `<div class="lab-audio-speed-heading"><span>Playback speed</span><output>${rate}×</output><button type="button" class="lab-audio-speed-done">Done</button></div>
    <input class="lab-v2-slider" type="range" min="0.5" max="3" step="0.25" value="${rate}" aria-label="Playback speed">
    <div class="lab-audio-speed-scale" aria-hidden="true"><span>0.5×</span><span>1×</span><span>2×</span><span>3×</span></div>`;
    rootEl().appendChild(pop);
    pop.querySelector('input').oninput = e => { const v = Number(e.target.value); pop.querySelector('output').textContent = v + '×'; player()?.setSpeed(v) };
    pop.querySelector('.lab-audio-speed-done').onclick = () => pop.remove();
  }

  /** Top bar Play: pause what plays; else go on where it paused (still in view), else start at the reading place. */
  function topPlay() {
    const p = player(); if (!p || !model) return;
    if (snap?.available === false) { say('Audio is not available for this edition yet.'); return }
    if (snap?.playing || snap?.pending) { p.pause(); return }
    browsing = false;
    if (snap?.open && snap.status === 'paused' && inView() && !chosen && p.resume()) return;
    Promise.resolve(readingPlace()).then(at => { if (at) p.play(at) });
  }
  /** The transport's Play: pause, or go on from the sentence heard. */
  function transportPlay() {
    const p = player(); if (!p) return;
    if (snap?.playing || snap?.pending) { p.pause(); return }
    browsing = false;
    if (p.resume()) { scrollToHeard(true); return }
    const at = snap?.chapterNumber != null && snap.follow ? { chapterNumber: snap.chapterNumber, paragraphIndex: snap.follow.paragraphIndex, wordIndex: snap.follow.wordIndex || 0 } : readingPlace();
    Promise.resolve(at).then(place => { if (place) p.play(place) });
  }

  function onSnapshot(next) {
    const prev = snap;
    snap = next;
    setPlayButton();
    renderTransport();
    paint();
    if (next.message && next.message !== toldError) { toldError = next.message; say(next.message) }
    if (!next.message) toldError = '';
    if (!next.playing) return;
    // A new paragraph, a new chapter or a fresh start: keep the word heard in view, unless the reader browses.
    const moved = !prev || !prev.playing || prev.chapterNumber !== next.chapterNumber || prev.follow?.paragraphIndex !== next.follow?.paragraphIndex || prev.follow?.wordIndex !== next.follow?.wordIndex;
    if (moved) scrollToHeard();
  }

  /* ---------- The reader's own scrolling: browsing while listening, never fought ---------- */
  function readerMoved() {
    if (!snap?.playing || Date.now() < selfScrollUntil) return;
    // Away from the word heard: the reader browses until it is back in view, or until Play.
    browsing = !inView();
  }

  function mount(book) {
    model = book;
    const style = doc.createElement('style'); style.textContent = STYLE; doc.head.appendChild(style);
    rootEl()?.classList.add('tb-can-listen');
    const b = $('playBtn');
    if (b) {
      // An own scan without text has nothing to read (reader.js hasNoText): Play stays off for it.
      const off = ownMode && OWN() && !OWN().canPlay();
      b.disabled = !!off; if (off) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      // The selection is read before the press can collapse it.
      b.addEventListener('pointerdown', () => { chosen = selectionPlace() }, true);
      b.onclick = e => { e.preventDefault(); if (!chosen) chosen = selectionPlace(); topPlay() };
    }
    const s = $('scroll');
    s?.addEventListener('scroll', () => { if (!s.__tbRaf) s.__tbRaf = requestAnimationFrame(() => { s.__tbRaf = 0; readerMoved() }) }, { passive: true });
    for (const type of ['wheel', 'touchmove']) s?.addEventListener(type, () => { selfScrollUntil = 0 }, { passive: true });
    const p = player();
    if (!p) return;
    const off = p.subscribe(onSnapshot);
    onSnapshot(p.snapshot());
    global.addEventListener('pagehide', () => { try { off() } catch {} });
  }

  /** An own book: its chapters and paragraphs, handed to the player (useMarginListen attachOwn) as the text it reads. */
  const ownTitle = n => OWN()?.chapters().find(c => c.number === n)?.title || '';
  function attachOwn(p) {
    const O = OWN();
    model = { title: O.title(), chapters: O.chapters() };
    p.attachOwn({
      chapters: () => OWN()?.chapters() || [],
      // The chapter asked for, or the next one with text to read (a page or chapter without any is passed over).
      chapter: async n => {
        const O2 = OWN(); if (!O2) return null;
        for (let m = n; m <= O2.lastPage(); m++) {
          const paras = await ownParas(m);
          if (paras.length) return { number: m, title: ownTitle(m), paragraphs: paras.map(x => x.text.replace(/\s+/g, ' ').trim()) };
        }
        return null;
      },
    });
  }
  async function bootOwn() {
    // A long PDF can take a while to open: its book is waited for up to five minutes.
    for (let i = 0; i < 3000; i++) {
      const host = hostOf(), O = OWN();
      if (host?.listen?.attachOwn && O?.ready()) {
        attachOwn(host.listen);
        mount(model);
        // Another text of the book opened in place (a PDF's pages and its Tinct text): the player reads that one now.
        global.addEventListener('tinct-own-listen', () => { const h = hostOf(); if (h?.listen?.attachOwn && OWN()?.ready()) { attachOwn(h.listen); const b = $('playBtn'); if (b) { const off = !OWN().canPlay(); b.disabled = off; if (off) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled') } paint() } });
        return;
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
  async function boot() {
    if (ownMode) return bootOwn();
    // The book drawn by the reader (reader.js openRegistered, from js/tinct-book.js), and the framing page's player.
    for (let i = 0; i < 600; i++) {
      let host = null;
      try { host = global.parent !== global && global.parent.TinctMarginPreview } catch { return }
      const ready = host && host.bookId === id && host.listen && doc.querySelector('.tb-chapter p.tb-p');
      if (ready) {
        let book = null;
        try { book = await host.load() } catch { return }
        if (book && Array.isArray(book.chapters)) mount(book);
        return;
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
  if (global.TinctReader) boot(); else global.addEventListener('tinct-reader-ready', boot, { once: true });
})(typeof window !== 'undefined' ? window : globalThis);
