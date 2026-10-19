'use strict';
// Tinct · the margin preview (Anders, 19 Oct 2026): a registered Tinct book in this reader, for testing.
// /reader?book=<id>&margin=1 shows this page in a frame at /lab/addbook/?tinctBook=<id> and hands it the book's
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

  /** The book from the page that framed this one (MarginPreview.tsx), waited for briefly. -> its load() promise, or null */
  async function framed() {
    for (let i = 0; i < 50; i++) {
      try { const p = window.parent !== window && window.parent.TinctMarginPreview; if (p && p.bookId === id) return p.load() } catch { return null }
      await new Promise(r => setTimeout(r, 100));
    }
    return null;
  }

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

  /** The model as TinctEpub.parse returns a book: { title, authors, language, chapters: [{ index, title, node, text }], toc }. */
  function asEpub(model) {
    const toc = [], parts = new Map();
    const chapters = model.chapters.map((c, index) => {
      const node = document.createElement('div');
      node.className = 'tb-chapter';
      const head = document.createElement('header');
      head.className = 'tb-head';
      head.innerHTML = (c.section ? `<span class="tb-part">${esc(c.section)}</span>` : '') + `<span class="tb-title">${esc(c.title)}</span>`;
      node.append(head, ...c.paragraphs.map(paragraphEl));
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
.tb-chapter .tb-part{display:block;font-size:.78em;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:.5em}
.tb-chapter .tb-title{display:block;font-family:'Playfair Display','EB Garamond',Georgia,serif;font-size:1.45em;line-height:1.25}
.tb-chapter .tb-p{white-space:pre-line}`;

  async function open() {
    const R = window.TinctReader; if (!R?.openRegistered) return;
    const style = document.createElement('style'); style.textContent = STYLE; document.head.appendChild(style);
    document.body.dataset.view = 'reader'; document.getElementById('root').hidden = false; document.getElementById('start').hidden = true;
    say('Opening…');
    let model = null;
    try { model = await framed() } catch { model = null }
    if (!model || !Array.isArray(model.chapters) || !model.chapters.length) {
      say(`This preview opens from the reader. <a href="/reader?book=${encodeURIComponent(id)}&amp;margin=1" target="_top">Open the margin preview</a>`);
      return;
    }
    seedPlace(model);
    await R.openRegistered(asEpub(model), { bookId: id, editionLabel: model.editionLabel || 'edition', normalHref: model.normalHref || `/reader?book=${encodeURIComponent(id)}&margin=0` });
  }
  window.TinctBookPreview = { asEpub, seedPlace, KEY };
  if (window.TinctReader) open(); else addEventListener('tinct-reader-ready', open, { once: true });
})();
