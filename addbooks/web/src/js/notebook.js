'use strict';
// Tinct · Add a book: the Notebook (Anders, 19 Oct 2026), after Gloss's. One panel, opened from the top
// bar, listing what the reader has made in this book, newest first: the companion's answers (the margin's
// cards: Explain, Ask, Simplify, Define, Fact-check, Counterpoint, Quiz me, Related, a figure's thread) and
// the reader's own notes and highlights. "All · My notes · AI" filters it. Each entry jumps to its passage
// and opens its card; its bin deletes it, with the margin's "Deleted · Undo". Copy all and Download
// (a Markdown file made on this device; nothing is sent anywhere).
// It reads the same store as the margin (the reader's `cards:` and `hl:` records) and keeps nothing of its
// own. Desktop only. The pure part (entries, filters, Markdown, times) has unit tests
// (src/addbookNotebook.test.ts); the panel is drawn by mount(host), called from reader.js.
(function (root, factory) {
  const api = factory();
  root.TinctNotebook = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const KINDS = { explain: 'Explain', ask: 'Ask', simplify: 'Simplify', define: 'Define', factcheck: 'Fact-check', counterpoint: 'Counterpoint', quiz: 'Quiz', related: 'Related', figure: 'Figure', note: 'Note', highlight: 'Highlight' };
  const CARD_KINDS = ['explain', 'ask', 'simplify', 'define', 'factcheck', 'counterpoint', 'quiz', 'related', 'figure'];
  const MINE = ['note', 'highlight'];
  // A unit's pill cards (the wide column's Recap and Catch me up: Ask cards on the unit, data.pill) go by their pill's name.
  const PILLS = { recap: 'Recap', catchup: 'Catch me up' };
  const FILTERS = [['all', 'All'], ['mine', 'My notes'], ['ai', 'AI']];
  const UNDO_MS = 6000;

  /** An answer as plain prose: citation tags as "(p. 3)", links as their words, no Markdown marks. */
  function plain(text) {
    return String(text || '')
      .replace(/\{\s*((?:p|pp|ch|fig|figure|table|eq|sec|§)\.?\s*[^{}]{1,40}?)\s*\}/gi, '($1)')
      .replace(/!?\[([^\]]*)\]\((?:[^()]|\([^)]*\))*\)/g, '$1')
      .replace(/(\*\*|__)(.+?)\1/g, '$2')
      .replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|[.,;:!?]|$)/g, '$1$2')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s*[-*•]\s+/gm, '• ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  const said = t => !!t && String(t.content || '').trim();
  /** Question-and-answer pairs from a card's thread: a turn of the reader's, then the companion's (either may be missing). */
  function pairs(turns) {
    const out = [];
    for (const t of turns || []) {
      if (!t || !said(t)) continue;
      if (t.role === 'user') out.push({ q: plain(t.content), a: '' });
      else if (out.length && !out[out.length - 1].a) out[out.length - 1].a = plain(t.content);
      else out.push({ q: '', a: plain(t.content) });
    }
    return out;
  }
  /** Whether a card has what it is for (as the margin's TinctMargin.cardAnswered): an answer, a quiz's questions, Define's meaning, Ask's question. */
  function answered(card) {
    if (card.kind === 'quiz') return !!card.data?.questions?.length;
    if (card.kind === 'define') return !!(card.data?.senses?.length || card.data?.line || (card.turns || []).some(t => t.role === 'assistant' && said(t)));
    if (card.kind === 'ask' || card.kind === 'figure') return (card.turns || []).some(said);
    return (card.turns || []).some(t => t.role === 'assistant' && said(t));
  }
  function cardEntry(card) {
    let qa = [];
    if (card.kind === 'quiz') {
      qa = (card.data.questions || []).map(item => ({ q: plain(item.q), a: plain([item.answer, item.why].filter(Boolean).join('. ').replace(/\.\.+/g, '.')) }));
    } else if (card.kind === 'define') {
      const senses = (card.data?.senses || []).map((s, i, all) => (all.length > 1 ? `${i + 1}. ` : '') + plain(s.text || s));
      qa = senses.length ? [{ q: '', a: senses.join('\n') }] : card.data?.line ? [{ q: '', a: plain(card.data.line) }] : [];
      qa.push(...pairs((card.turns || []).filter((t, i) => !(i === 0 && t.role === 'assistant' && senses.length))));
    } else qa = pairs(card.turns);
    const [first = { q: '', a: '' }, ...follow] = qa;
    return {
      id: card.id, source: 'card', kind: card.kind, mine: false, page: card.page,
      ...(PILLS[card.data?.pill] ? { pill: card.data.pill } : {}),
      unit: card.data?.unit ? card.data.unit.label || '' : '',
      word: card.kind === 'define' ? card.data?.word || card.text || '' : '',
      quote: card.kind === 'quiz' && card.data?.unit ? '' : String(card.text || '').trim(),
      q: first.q, a: first.a, follow, at: Number(card.at) || 0,
    };
  }
  /**
   * The Notebook's entries, newest first: every kept card with its answer (a card deleted, or made and never
   * answered, is left out) and every highlight (a highlight with a note is the reader's note).
   * -> [{ id, source: 'card' | 'mark', kind, mine, page, quote, q, a, follow: [{ q, a }], note?, at }]
   */
  function entriesOf({ cards = [], marks = [] } = {}) {
    const out = [];
    for (const c of cards || []) if (c && !c.gone && CARD_KINDS.includes(c.kind) && answered(c)) out.push(cardEntry(c));
    for (const m of marks || []) {
      if (!m || m.gone) continue;
      const note = String(m.note || '').trim();
      out.push({ id: (note ? 'n-' : 'h-') + m.id, mark: m.id, source: 'mark', kind: note ? 'note' : 'highlight', mine: true, page: m.page, quote: String(m.text || '').trim(), q: '', a: '', note, follow: [], color: m.color || 'gold', at: Number(m.at) || 0 });
    }
    return out.sort((a, b) => b.at - a.at || String(b.id).localeCompare(String(a.id)));
  }
  /** "All", "My notes" (the reader's own notes and highlights) or "AI" (the companion's answers). */
  function filterEntries(list, filter = 'all') {
    if (filter === 'mine') return list.filter(e => MINE.includes(e.kind));
    if (filter === 'ai') return list.filter(e => !MINE.includes(e.kind));
    return list.slice();
  }
  const countLine = n => `${n} ${n === 1 ? 'entry' : 'entries'}`;
  const kindName = e => PILLS[e.pill] || KINDS[e.kind] || KINDS.explain;
  /** When an entry was made, from now: "Just now", "5 min ago", "3 h ago", "Yesterday", "4 days ago", else the date. */
  function ago(at, now = Date.now()) {
    const s = Math.max(0, (now - at) / 1000);
    if (!at || !Number.isFinite(s)) return '';
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    const days = Math.floor(s / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const d = new Date(at), n = new Date(now);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(d.getFullYear() !== n.getFullYear() ? { year: 'numeric' } : {}) });
  }
  const stamp = at => { if (!at) return ''; const d = new Date(at); return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` };
  const quoteMd = t => String(t).split('\n').map(l => '> ' + l).join('\n');
  /**
   * The entries as Markdown, made on this device for Copy all and Download. `place(entry)` names its place
   * ("p. 12", "ch. 3"). -> string
   */
  function toMarkdown(list, { title = '', author = '', place = () => '' } = {}) {
    const lines = [`# ${title ? `${title}: notebook` : 'Notebook'}`];
    if (author) lines.push('', author);
    lines.push('', countLine(list.length));
    for (const e of list) {
      const where = e.unit || place(e);
      lines.push('', `## ${kindName(e)}${e.word ? ` · ${e.word}` : ''}${where ? ` · ${where}` : ''}`, '', `_${stamp(e.at)}_`);
      if (e.quote && !e.word) lines.push('', quoteMd(e.quote));
      if (e.note) lines.push('', e.note);
      const rows = [{ q: e.q, a: e.a }, ...e.follow];
      for (const r of rows) {
        if (r.q) lines.push('', `**Q.** ${r.q}`);
        if (r.a) lines.push('', `**A.** ${r.a}`);
      }
    }
    return lines.join('\n') + '\n';
  }
  /** A file name for the download: the book's title, safe on every system. */
  const fileName = title => `${(String(title || 'Notebook').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Notebook')} notebook.md`;

  /* ---------- The panel ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    book: '<path d="M6.6 3.8h10.1a1.8 1.8 0 0 1 1.8 1.8v12.8a1.8 1.8 0 0 1-1.8 1.8H6.6z"/><path d="M6.6 3.8v16.4M4.7 7.6h3.8M4.7 12h3.8M4.7 16.4h3.8M11.2 8.4h4.4M11.2 11.6h4.4"/>',
    copy: '<rect x="8.6" y="8.6" width="10.6" height="10.6" rx="2.2"/><path d="M15.4 8.6V6.6a1.8 1.8 0 0 0-1.8-1.8H6.6a1.8 1.8 0 0 0-1.8 1.8v7a1.8 1.8 0 0 0 1.8 1.8h2"/>',
    download: '<path d="M12 4.6v10.2M7.6 10.6 12 15l4.4-4.4M5.4 19.2h13.2"/>',
    close: '<path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/>',
    bin: '<path d="M5.4 7.2h13.2M9.8 7.2V5.4h4.4v1.8M7.2 7.2l.8 11.6a1.6 1.6 0 0 0 1.6 1.4h4.8a1.6 1.6 0 0 0 1.6-1.4l.8-11.6M10.4 10.6v6M13.6 10.6v6"/>',
  };
  const BUTTON_HTML = svg(ICONS.book);
  const nb = { host: null, el: null, list: null, open: false, filter: 'all', full: new Set(), undo: null, raf: 0, scroll: 0 };

  function qaHtml(label, text, cls = '') {
    return `<div class="nb-qa${cls}"><span class="nb-qa__l" aria-hidden="true">${label}</span><div class="nb-qa__t"><span class="nb-sr">${label === 'Q' ? 'Question' : 'Answer'}: </span>${esc(text).replace(/\n/g, '<br>')}</div></div>`;
  }
  function entryHtml(e, now) {
    const where = e.unit || nb.host.place(e);
    const name = kindName(e) + (e.word ? ` · ${e.word}` : '');
    const full = nb.full.has(e.id);
    const answer = e.a ? `<div class="nb-qa is-a"><span class="nb-qa__l" aria-hidden="true">A</span><div class="nb-qa__t"><div class="nb-answer${full ? ' is-full' : ''}"><span class="nb-sr">Answer: </span>${esc(e.a).replace(/\n/g, '<br>')}</div><button type="button" class="nb-more" data-nb="more" hidden>Read the whole answer</button></div></div>` : '';
    const follow = e.follow.length ? `<div class="nb-follow">${e.follow.map(f => (f.q ? qaHtml('Q', f.q) : '') + (f.a ? qaHtml('A', f.a, ' is-a') : '')).join('')}</div>` : '';
    return `<article class="nb-entry is-${e.kind}" role="listitem" tabindex="0" data-id="${esc(e.id)}" aria-label="${esc(`${name}${where ? ', ' + where : ''}`)}">
      <div class="nb-entry__top">${where ? `<span class="nb-chip">${esc(where)}</span>` : ''}<span class="nb-kind">${esc(name)}</span><span class="nb-time">${esc(ago(e.at, now))}</span><button type="button" class="nb-bin" data-nb="bin" aria-label="Delete">${svg(ICONS.bin)}</button></div>
      ${e.quote && !e.word ? `<blockquote class="nb-quote">${esc(e.quote)}</blockquote>` : ''}
      ${e.note ? `<p class="nb-note">${esc(e.note).replace(/\n/g, '<br>')}</p>` : ''}
      ${e.q ? qaHtml('Q', e.q) : ''}${answer}${follow}
    </article>`;
  }
  const undoHtml = () => '<div class="nb-undo" role="status"><span>Deleted</span><span aria-hidden="true">·</span><button type="button" data-nb="undo">Undo</button></div>';
  function current() {
    const data = nb.host.data();
    return entriesOf(data);
  }
  function draw() {
    if (!nb.open || !nb.el) return;
    const all = current(), shown = filterEntries(all, nb.filter), now = Date.now();
    nb.el.querySelector('.nb-count').textContent = countLine(shown.length);
    for (const b of nb.el.querySelectorAll('[data-f]')) b.setAttribute('aria-checked', String(b.dataset.f === nb.filter));
    const scroll = nb.list.scrollTop;
    const parts = shown.map(e => entryHtml(e, now));
    if (nb.undo) parts.splice(Math.min(nb.undo.index, parts.length), 0, undoHtml());
    nb.list.innerHTML = parts.length ? parts.join('') : '<p class="nb-empty">Nothing here yet.</p>';
    nb.list.scrollTop = scroll;
    // An answer longer than four lines is cut with a fade and "Read the whole answer".
    for (const a of nb.list.querySelectorAll('.nb-answer:not(.is-full)')) {
      const cut = a.scrollHeight > a.clientHeight + 2;
      a.classList.toggle('is-cut', cut);
      a.parentElement.querySelector('.nb-more').hidden = !cut;
    }
  }
  /** Something in the store changed (a card, a highlight, a note): drawn again on the next frame while open. */
  function changed() {
    if (!nb.open || nb.raf) return;
    nb.raf = (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout)(() => { nb.raf = 0; draw() });
  }
  function shownNow() { return filterEntries(current(), nb.filter) }
  async function copyAll() {
    const text = toMarkdown(shownNow(), { ...nb.host.meta(), place: nb.host.place });
    try { await navigator.clipboard.writeText(text); nb.host.toast('Copied.') } catch { nb.host.toast('Copy did not work here. Use Download instead.') }
  }
  function download() {
    const meta = nb.host.meta();
    const blob = new Blob([toMarkdown(current(), { ...meta, place: nb.host.place })], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = fileName(meta.title); a.hidden = true;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function remove(id) {
    const shown = shownNow(), index = shown.findIndex(e => e.id === id), entry = shown[index];
    if (!entry) return;
    endUndo();
    const restore = nb.host.remove(entry);
    if (typeof restore === 'function') nb.undo = { restore, index, timer: setTimeout(() => { nb.undo = null; draw() }, UNDO_MS) };
    draw();
    nb.list.querySelector('.nb-undo button')?.focus({ preventScroll: true });
  }
  function endUndo() { if (nb.undo) clearTimeout(nb.undo.timer); nb.undo = null }
  function build() {
    const el = document.createElement('aside');
    el.className = 'mr nb'; el.id = 'notebook';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-labelledby', 'nbTitle');
    el.innerHTML = `<div class="nb-head">
        <div class="nb-titles"><h2 class="nb-title" id="nbTitle">Notebook</h2><p class="nb-count"></p></div>
        <div class="nb-icons">
          <button type="button" class="nb-icon" data-nb="copy" aria-label="Copy all" title="Copy all">${svg(ICONS.copy)}</button>
          <button type="button" class="nb-icon" data-nb="download" aria-label="Download" title="Download">${svg(ICONS.download)}</button>
          <button type="button" class="nb-icon" data-nb="close" aria-label="Close" title="Close">${svg(ICONS.close)}</button>
        </div>
      </div>
      <div class="nb-seg" role="radiogroup" aria-label="Show">${FILTERS.map(([id, label]) => `<button type="button" role="radio" data-f="${id}" aria-checked="false">${label}</button>`).join('')}</div>
      <div class="nb-list" role="list"></div>`;
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b?.dataset.f) { nb.filter = b.dataset.f; endUndo(); draw(); return }
      const act = b?.dataset.nb, card = e.target.closest('.nb-entry');
      if (act === 'close') return close({ focus: true });
      if (act === 'copy') return void copyAll();
      if (act === 'download') return download();
      if (act === 'undo') { const r = nb.undo?.restore; endUndo(); r?.(); draw(); return }
      if (act === 'bin' && card) return remove(card.dataset.id);
      if (act === 'more' && card) { nb.full.add(card.dataset.id); const a = card.querySelector('.nb-answer'); a.classList.add('is-full'); a.classList.remove('is-cut'); b.hidden = true; return }
      if (card && !b && !getSelection()?.toString()) jump(card.dataset.id);
    });
    el.addEventListener('keydown', e => {
      const card = e.target.classList?.contains('nb-entry') ? e.target : null;
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); jump(card.dataset.id) }
      // The switch: arrows move along it, as a radio group's.
      const seg = e.target.closest?.('.nb-seg');
      if (seg && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const i = FILTERS.findIndex(f => f[0] === nb.filter), next = FILTERS[(i + (e.key === 'ArrowRight' ? 1 : FILTERS.length - 1)) % FILTERS.length][0];
        nb.filter = next; endUndo(); draw(); seg.querySelector(`[data-f="${next}"]`).focus();
      }
    });
    return el;
  }
  // The panel stands over the margin column, so it steps aside for the card it opens (reopened, it is as it was left).
  function jump(id) {
    const entry = shownNow().find(e => e.id === id);
    if (!entry) return;
    close({ away: true });
    nb.host.jump(entry);
  }
  function open() {
    if (!nb.host || nb.open) return;
    nb.open = true;
    if (!nb.el) { nb.el = build(); nb.list = nb.el.querySelector('.nb-list') }
    nb.host.root.appendChild(nb.el);
    nb.host.button.setAttribute('aria-expanded', 'true');
    nb.host.root.dataset.notebook = 'open';
    draw();
    nb.list.scrollTop = nb.scroll || 0;
    nb.el.querySelector(`[data-f="${nb.filter}"]`).focus({ preventScroll: true });
    nb.host.opened?.(true);
  }
  function close({ focus = false, away = false } = {}) {
    if (!nb.open) return;
    const inside = !away && nb.el.contains(document.activeElement);
    nb.scroll = nb.list.scrollTop;
    nb.open = false; endUndo();
    nb.el.remove();
    nb.host.button.setAttribute('aria-expanded', 'false');
    delete nb.host.root.dataset.notebook;
    if (focus || inside) nb.host.button.focus({ preventScroll: true });
    nb.host.opened?.(false);
  }
  /**
   * Draws the panel for the reader. `host`: { root, button, data() -> { cards, marks }, place(entry) -> "p. 12",
   * meta() -> { title, author }, jump(entry), remove(entry) -> restore() | null, toast(text), opened?(on) }.
   */
  function mount(host) {
    nb.host = host;
    host.button.innerHTML = BUTTON_HTML;
    host.button.addEventListener('click', () => (nb.open ? close({ focus: true }) : open()));
    // Escape closes it (before the margin's own Escape, which would fold a card), unless a menu over it is open.
    // On the window, in the capture phase: before the reader's own Escape (folding a card, closing the primer).
    window.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !nb.open) return;
      if (e.target.closest?.('.lab-v2-sheet-layer, .mr-note, .mr-more, .mr-define, .mr-bar, .mr-pbar')) return;
      if (!nb.el.contains(e.target) && e.target.closest?.('.mr-card, .mr-sheet, input, textarea, [contenteditable="true"]')) return;
      e.preventDefault(); e.stopImmediatePropagation(); close({ focus: true });
    }, true);
  }
  return { KINDS, CARD_KINDS, PILLS, FILTERS, UNDO_MS, plain, pairs, entriesOf, filterEntries, countLine, ago, toMarkdown, fileName, mount, open, close, changed, isOpen: () => nb.open };
});
