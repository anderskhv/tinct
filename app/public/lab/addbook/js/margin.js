'use strict';
// Tinct · Add a book: the margin reader's pure rules for a PDF (docs/margin/BRIEF.md, PR 1a).
// Where the selection bar, More, the Define card and the note editor sit; which key opens Ask;
// the Copy quote text; the highlight colour that is the default; and how a PDF's highlights and
// notes from two devices merge. No DOM and no network here, so every rule has a unit test
// (src/addbookMargin.test.ts). Loaded before reader.js as window.TinctMargin.
(function (root, factory) {
  const api = factory();
  root.TinctMargin = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  // Every distance comes from docs/margin/margin-reference.css and the brief.
  const DESK = { barH: 44, above: 56, lead: 20, inset: 16, room: 64, gap: 12, tipMin: 24, tipLead: 40, moreGap: 8 };
  const PHONE = { barH: 48, edge: 10, gap: 12, moreGap: 8 };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /**
   * The selection bar. `first` and `last` are the selection's first and last line boxes, `frame`
   * the reader's box (below its top bar), `w`/`h` the bar's size. Desktop: 56px above the first
   * line, its left edge 20px left of the selection start, clamped 16px inside the frame; with less
   * than 64px above the selection it sits 12px below the last line with its tip up. Phone: 10px
   * from each edge, 12px below the last line (tip up), else 12px above the first line.
   * -> { left, top, width, below, tip } (tip: the tip's x inside the bar).
   */
  function placeBar({ first, last, frame, w, h, phone = false }) {
    last = last || first;
    if (phone) {
      const height = h || PHONE.barH;
      const left = frame.left + PHONE.edge, width = frame.right - frame.left - PHONE.edge * 2;
      let top = last.bottom + PHONE.gap, below = true;
      if (top + height > frame.bottom - PHONE.edge) { top = first.top - PHONE.gap - height; below = false }
      top = clamp(top, frame.top + PHONE.edge, frame.bottom - PHONE.edge - height);
      return { left, top, width, below, tip: clamp(first.left - left + DESK.tipLead, DESK.tipMin, width - DESK.tipMin) };
    }
    const height = h || DESK.barH;
    const width = Math.min(w, frame.right - frame.left - DESK.inset * 2);
    const left = clamp(first.left - DESK.lead, frame.left + DESK.inset, frame.right - DESK.inset - width);
    const roomAbove = first.top - frame.top;
    // 64px of room leaves the bar 8px clear of the top bar; that is the least it keeps above it.
    const topGap = DESK.room - DESK.above;
    let below = roomAbove < DESK.room, top;
    // A bar taller than the 44px menu (Ask wrapping to three lines) grows upward from where the menu ends.
    if (!below) top = first.top - DESK.above + DESK.barH - height;
    else top = last.bottom + DESK.gap;
    if (!below && top < frame.top + topGap) { below = true; top = last.bottom + DESK.gap }
    top = clamp(top, frame.top + topGap, frame.bottom - DESK.inset - height);
    return { left, top, width, below, tip: clamp(first.left - left + DESK.tipLead, DESK.tipMin, width - DESK.tipMin) };
  }

  /**
   * More, aligned to the dots: desktop above the bar (300px, 8px gap), below it when the bar is
   * below the selection or there is no room; phone below the bar (210px), above when no room.
   * `dots` is the More item's box. -> { left, top, below }
   */
  function placeMore({ bar, dots, frame, w, h, phone = false }) {
    const inset = phone ? PHONE.edge : DESK.inset, gap = phone ? PHONE.moreGap : DESK.moreGap;
    const centre = (dots.left + dots.right) / 2;
    const left = clamp(phone ? centre - w / 2 : dots.left - 120, frame.left + inset, frame.right - inset - w);
    const fitsAbove = bar.top - gap - h >= frame.top + inset, fitsBelow = bar.bottom + gap + h <= frame.bottom - inset;
    let below = phone ? fitsBelow || !fitsAbove : bar.below ? fitsBelow || !fitsAbove : !fitsAbove && fitsBelow;
    const top = clamp(below ? bar.bottom + gap : bar.top - gap - h, frame.top + inset, frame.bottom - inset - h);
    return { left, top, below };
  }

  /**
   * The Define card and the note editor (360px on desktop; on the phone the full width less 20px),
   * placed like the bar: above the word with 12px to spare, else below it. -> { left, top, width, below }
   */
  function placeCard({ first, last, frame, w, h, phone = false }) {
    last = last || first;
    const inset = phone ? PHONE.edge : DESK.inset;
    const width = phone ? frame.right - frame.left - PHONE.edge * 2 : Math.min(w, frame.right - frame.left - DESK.inset * 2);
    const left = phone ? frame.left + PHONE.edge : clamp(first.left - 60, frame.left + inset, frame.right - inset - width);
    let below, top;
    if (phone) {
      below = last.bottom + PHONE.gap + h <= frame.bottom - inset;
      top = below ? last.bottom + PHONE.gap : first.top - PHONE.gap - h;
    } else {
      below = first.top - DESK.gap - h < frame.top + inset;
      top = below ? last.bottom + DESK.gap : first.top - DESK.gap - h;
    }
    top = clamp(top, frame.top + inset, frame.bottom - inset - h);
    return { left, top, width, below };
  }

  /**
   * Typing with a selection opens Ask with that character: a printable key with no Cmd, Ctrl or
   * Alt (so Cmd/Ctrl +, - and 0 still zoom), not a space (it scrolls the pages), not while an IME
   * composes, and never while a field, button or menu row has the keys. -> the character, or null.
   */
  function typedChar(e, { inField = false } = {}) {
    if (!e || inField || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return null;
    const k = e.key;
    if (typeof k !== 'string' || [...k].length !== 1 || /\s/.test(k)) return null;
    if (/[\u0000-\u001f\u007f]/.test(k)) return null;
    return k;
  }

  /**
   * A key over a selection (BRIEF.md "Keys (desktop)", decided in PR 4): N (either case) is the note
   * on the selection; every other printable key opens Ask with that character. Like typedChar, only
   * without Cmd, Ctrl or Alt and never while a field has the keys, so once the question field has
   * focus an N is simply typed. -> { action: 'note' } | { action: 'ask', ch } | null
   */
  function selectionKey(e, o) {
    const ch = typedChar(e, o);
    if (!ch) return null;
    return ch === 'n' || ch === 'N' ? { action: 'note' } : { action: 'ask', ch };
  }
  /** One word (letters, with an inner apostrophe or hyphen), which opens Define instead of the bar. */
  const WORD = /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u;
  function oneWord(text) {
    const t = String(text || '').trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    return t.length >= 2 && t.length <= 40 && WORD.test(t) ? t : null;
  }
  /**
   * Double-click on a word that is part of a hyphenated compound ("auto-regressive"): the browser
   * selects only "regressive". -> the compound's [start, end) in `text` around the selected
   * [start, end), or null when the word is not joined by a hyphen to another (FIXES, deep test).
   */
  function hyphenWord(text, start, end) {
    const t = String(text || ''), L = /[\p{L}\p{M}\p{N}]/u, H = /[-\u2010\u2011]/;
    while (end > start && /\s/.test(t[end - 1])) end--;
    if (end <= start || !/^[\p{L}\p{M}\p{N}]+$/u.test(t.slice(start, end))) return null;
    let s = start, e = end;
    for (;;) { if (s >= 2 && H.test(t[s - 1]) && L.test(t[s - 2])) { s -= 1; while (s > 0 && L.test(t[s - 1])) s--; } else break }
    for (;;) { if (e + 1 < t.length && H.test(t[e]) && L.test(t[e + 1])) { e += 1; while (e < t.length && L.test(t[e])) e++; } else break }
    return s === start && e === end ? null : [s, e];
  }
  /** A capitalised word that does not start a sentence: a name, so Define asks the companion. */
  function nameMidSentence(word, before) {
    if (!/^\p{Lu}/u.test(word || '') || /^\p{Lu}+$/u.test(word)) return false;
    const b = String(before || '').replace(/\s+$/, '');
    if (!b) return false;
    return !/[.!?:;"“”‘(\[]$/.test(b);
  }

  /** Copy quote: the passage, then the title and page. */
  function copyQuote({ text, title, page }) {
    const quote = String(text || '').replace(/\s+/g, ' ').trim();
    const where = [String(title || '').trim(), page ? 'p. ' + page : ''].filter(Boolean).join(', ');
    return `“${quote}”` + (where ? `\n— ${where}` : '');
  }

  /** The highlight colour the dot shows and one tap uses: the last one chosen, else the first. */
  function defaultColor(prefs, colors) {
    const keys = colors.map(c => (Array.isArray(c) ? c[0] : c.key || c));
    return keys.includes(prefs?.hlColor) ? prefs.hlColor : keys[0];
  }
  /** Choosing a colour makes it the default. -> the new prefs (the caller saves them as today). */
  function chooseColor(prefs, key) { return Object.assign({}, prefs, { hlColor: key }) }

  /* ---------- A PDF's highlights and notes on the reader's devices ----------
     Each mark is a highlight record (id, page, rects, text, colour, at, and its note) with `u`, when
     it last changed. A removed mark becomes a tombstone { id, gone: true, u }. Merging two sets is a
     union by id where the newer edit wins; at the same time a removal wins, then the larger record,
     so both devices always arrive at the same set and nothing is lost on a conflict. */
  const stampOf = m => Number(m && (m.u || m.at)) || 0;
  function pick(a, b) {
    const sa = stampOf(a), sb = stampOf(b);
    if (sa !== sb) return sa > sb ? a : b;
    if (!!a.gone !== !!b.gone) return a.gone ? a : b;
    return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
  }
  function mergeMarks(...sets) {
    const out = new Map();
    for (const set of sets) for (const m of set || []) {
      if (!m || typeof m.id !== 'string' || !m.id) continue;
      const have = out.get(m.id);
      out.set(m.id, have ? pick(have, m) : m);
    }
    return [...out.values()].sort((a, b) => (a.page || 0) - (b.page || 0) || stampOf(a) - stampOf(b) || (a.id < b.id ? -1 : 1));
  }
  /** -> { live, gone }: the highlights to draw and the removals to remember. */
  function splitMarks(list) {
    const live = [], gone = [];
    for (const m of list || []) (m.gone ? gone : live).push(m);
    return { live, gone };
  }
  const tombstone = (id, at = Date.now()) => ({ id, gone: true, u: at });
  /** True when two sets hold the same marks (order aside). */
  function sameMarks(a, b) {
    const key = l => JSON.stringify(mergeMarks(l));
    return key(a) === key(b);
  }

  /**
   * The companion's contextual define answer (src/components/reader/contextualLookup.ts
   * parseContextualLookup: a definition, a person or a place, as JSON), for the Define card.
   * -> { word, pos, line } | null
   */
  const POS = /^(proper noun|noun phrase|verb phrase|noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|determiner|article|numeral|phrase|idiom|prefix|suffix|abbreviation)\b[^.:;]{0,30}[.:;]\s*/i;
  function parseLookup(raw, word) {
    const text = String(raw || '').trim();
    if (!text) return null;
    let v;
    try { v = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')) }
    catch { return /^(?:\{|\[|`{3})/.test(text) ? null : definition(text.slice(0, 1600)) }
    if (!v || typeof v !== 'object') return null;
    const field = (k, max) => (typeof v[k] === 'string' ? v[k].trim().slice(0, max) : '');
    if (v.kind === 'definition' && field('definition', 1600)) return definition(field('definition', 1600));
    if (v.kind === 'place' && field('name', 120) && field('description', 1600)) return { word: field('name', 120), pos: '', line: field('description', 1600) };
    if (v.kind === 'person' && field('name', 120) && field('body', 1600)) return { word: field('name', 120), pos: field('subtitle', 240), line: field('body', 1600) };
    return null;
    function definition(d) {
      const m = d.match(POS);
      return m && d.length > m[0].length ? { word, pos: m[1].toLowerCase(), line: d.slice(m[0].length) } : { word, pos: '', line: d };
    }
  }

  /* ---------- Markup: one builder each for the bar, More, Define and the note editor ----------
     The fixture (margin-fixture.html) and the reader draw them with these same builders, so what
     was compared with the mockup is what the reader shows. Icons are the mockup's own. */
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = body => `<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">${body}</svg>`;
  const ICONS = {
    more: svg('<circle cx="4" cy="9" r=".9"/><circle cx="9" cy="9" r=".9"/><circle cx="14" cy="9" r=".9"/>'),
    note: svg('<path d="M4 2.8h7.2L14.5 6v9.2H4z"/><path d="M11 2.8V6h3.5M6.6 9.2h5M6.6 12h3.4"/>'),
    mic: svg('<rect x="6.5" y="2.5" width="5" height="8.5" rx="2.5"/><path d="M4 9a5 5 0 0 0 10 0M9 14v2M6.5 16h5"/>'),
    up: svg('<path d="M9 14V4M4.5 8.5 9 4l4.5 4.5"/>'),
  };
  // Share as image stays out of the PDF reader for now (the fixture shows it); every other action is in.
  const LATER = { share: true };
  const shown = (id, all) => all || !LATER[id];
  const MORE_ROWS = [['define', 'Define', 'The word, as this text uses it'], ['factcheck', 'Fact-check', 'Does it still hold? Searches the web'], ['counterpoint', 'Counterpoint', 'The strongest objection to it'], ['quiz', 'Quiz me', 'Three questions to check you have it']];
  const MORE_ROWS_2 = [['copy', 'Copy quote', 'With the title and page number'], ['share', 'Share as image', 'The quote as a card to post']];
  const colorOf = (colors, key) => { const c = colors.find(x => x[0] === key) || colors[0]; return { key: c[0], label: c[1], dot: c[3] } };
  function dotHtml(colors, current, { noted = false } = {}) {
    const c = colorOf(colors, current);
    return `<button type="button" class="mr-bar__item" data-m="dot" aria-label="Highlight in ${esc(c.label)}"><span class="mr-dot" style="--hl-current:${esc(c.dot)}"></span></button>`
      + `<button type="button" class="mr-bar__item" data-m="note" aria-label="${noted ? 'Edit note' : 'Add note'}">${ICONS.note}</button>`;
  }
  function middleHtml({ all = false, moreOpen = false, caret = true } = {}) {
    return `<button type="button" class="mr-bar__item is-ask" data-m="ask">Ask${caret ? '<span class="mr-bar__caret" aria-hidden="true"></span>' : ''}</button><span class="mr-bar__sep" aria-hidden="true"></span>`
      + `<button type="button" class="mr-bar__item is-text" data-m="explain">Explain</button>`
      + (shown('simplify', all) ? `<button type="button" class="mr-bar__item is-text" data-m="simplify">Simplify</button>` : '')
      + `<button type="button" class="mr-bar__item" data-m="more" aria-label="More" aria-haspopup="menu" aria-expanded="${moreOpen}">${ICONS.more}</button>`;
  }
  function swatchesHtml(colors, current) {
    return colors.map(([k, label, , dot]) => `<button type="button" class="mr-swatch" data-color="${esc(k)}" style="background:${esc(dot)}" aria-label="${esc(label)}" aria-pressed="${k === current}"></button>`).join('');
  }
  /**
   * The bar. state: 'menu' | 'colors' | 'asking'. opts: { colors, current, phone, all (show the 1b
   * actions, fixture only), moreOpen, noted, question }.
   */
  function barHtml(state, o) {
    if (state === 'asking') {
      return `<label class="mr-bar__field"><textarea class="mr-ask" rows="1" enterkeyhint="send" aria-label="Ask about this passage">${esc(o.question || '')}</textarea></label>`
        + `<button type="button" class="mr-bar__item is-mic" data-m="mic" aria-label="Dictate" aria-pressed="false">${ICONS.mic}</button>`
        + `<button type="button" class="mr-bar__send" data-m="send" aria-label="Send"${o.question ? '' : ' disabled'}>${ICONS.up}</button>`;
    }
    if (state === 'colors') {
      return `<button type="button" class="mr-bar__item" data-m="more" aria-label="More" aria-haspopup="menu" aria-expanded="false">${ICONS.more}</button><span class="mr-bar__sep" aria-hidden="true"></span>`
        + swatchesHtml(o.colors, o.current) + `<span class="mr-bar__sep" aria-hidden="true"></span>`
        + `<button type="button" class="mr-bar__item" data-m="note" aria-label="${o.noted ? 'Edit note' : 'Add note'}">${ICONS.note}</button>`;
    }
    return middleHtml(o) + (o.phone ? '<span class="mr-bar__grow" aria-hidden="true"></span>' : '') + `<span class="mr-bar__sep" aria-hidden="true"></span>` + dotHtml(o.colors, o.current, o);
  }
  function moreHtml({ phone = false, all = false } = {}) {
    const rows1 = MORE_ROWS.filter(r => shown(r[0], all)), rows2 = MORE_ROWS_2.filter(r => shown(r[0], all));
    const row = ([id, name, line]) => phone
      ? `<button type="button" role="menuitem" data-m="${id}">${esc(name)}</button>`
      : `<button type="button" class="mr-more__row" role="menuitem" data-m="${id}"><b>${esc(name)}</b><span>${esc(line)}</span></button>`;
    return rows1.map(row).join('') + (rows1.length && rows2.length ? '<hr>' : '') + rows2.map(row).join('');
  }
  /**
   * The Define card. d: { word, pos, source ('Dictionary' or ''), senses: [{ text, fit }], line
   * (one paragraph instead of senses), wait (true while the companion answers) }.
   */
  /**
   * The Define card. `d.inText`: the meaning in this passage from the companion's `define`, shown
   * first under "In this text" when the dictionary has no sense that fits (or lacks the word), with
   * the dictionary's senses below it; offline, the dictionary alone.
   */
  function defineHtml(d, o) {
    const senses = (d.senses || []).slice(0, 3);
    const inText = d.inText ? `<p class="mr-define__in"><span class="mr-define__label">In this text</span>${esc(d.inText)}</p>` : '';
    const body = d.wait ? '<p class="mr-define__wait"></p>'
      : inText + (senses.length ? `<ol class="mr-define__senses">${senses.map(s => `<li${s.fit ? ' class="is-fit"' : ''}>${esc(s.text)}</li>`).join('')}</ol>`
        : d.line ? `<p>${esc(d.line)}</p>` : '');
    return `<div class="mr-define__body"><div class="mr-define__word">${esc(d.word)}<i class="mr-define__pos">${esc(d.pos || '')}</i><span class="mr-define__src">${esc(d.source || '')}</span></div>${body}</div>`
      + `<div class="mr-define__foot">${middleHtml({ ...o, caret: false })}<span class="mr-bar__sep" aria-hidden="true"></span>${dotHtml(o.colors, o.current, o)}</div>`;
  }
  /** A passage quoted in a card, cut at 120 characters with … (margin-reference.css .mr-quote). */
  function cut(text, max = 120) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    const room = t.slice(0, max - 1), at = room.lastIndexOf(' ');
    return (at > max * 0.6 ? room.slice(0, at) : room).replace(/[\s,;:.]+$/, '') + '…';
  }
  /** The note editor: the passage, the field, Remove highlight and Save note (the book reader's note sheet). */
  function noteHtml({ quote, note = '' }) {
    return `<div class="mr-note__body"><p class="mr-note__quote">“${esc(cut(quote))}”</p><textarea class="mr-note__field" rows="3" placeholder="Add a note…" aria-label="Highlight note">${esc(note)}</textarea></div>`
      + `<div class="mr-note__foot"><button type="button" class="mr-bar__item is-quiet" data-m="remove">Remove highlight</button><button type="button" class="mr-bar__item" data-m="save"${note ? '' : ' disabled'}>Save note</button></div>`;
  }
  /**
   * The question field's size (mockup 1B): at least 330px, growing with the words to 520px (or the
   * room there is), then wrapping to three lines. Desktop only for the width; the phone bar keeps
   * its width. Measures with a canvas in the field's own font.
   */
  function sizeAsk(el, { phone = false, room = 520 } = {}) {
    const t = el.querySelector('.mr-ask'); if (!t) return;
    if (!phone) {
      const max = Math.min(520, room);
      const g = (sizeAsk.ctx ||= el.ownerDocument.createElement('canvas').getContext('2d'));
      g.font = getComputedStyle(t).font;
      const words = Math.max(0, ...t.value.split('\n').map(l => g.measureText(l).width));
      el.style.width = '';
      const chrome = el.offsetWidth - t.clientWidth;
      el.style.width = Math.max(Math.min(330, max), Math.min(max, Math.ceil(words + chrome + 6))) + 'px';
    }
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 60) + 'px';
  }
  /* ---------- PR 2: the margin column, its cards, leader lines, marks and the phone's bottom card ----------
     docs/margin/BRIEF.md §3, §4 and §6. Every distance is the brief's or margin-reference.css's. */
  const COL = { width: 380, gap: 56, cardGap: 14, foot: 46, lift: 4, dot: 8, r: 2.6, narrow: 1180, right: 24, mark: 8, row: 28 };

  /**
   * Where the cards sit in the column. `passages` are the cards' passages in page order, each
   * { id, top, at?, fold?, keep? } with `top` the passage's first line measured from the column's top,
   * `at` when the card was made (older cards fold first; without it, page order), `fold: false`
   * for a card that never folds to a row and `keep: true` for one that never gathers either (the
   * primer's trigger); `cardHeights` the cards' heights in the same order;
   * `columnHeight` the room from the column's top to its foot. No card ends within 46px of the foot
   * (nor leaves no room for the "more" row) and none starts above `top`, the room kept for something
   * above every card (the primer's trigger, PR 3).
   * Each card's top is its passage's first line less 4px, at least 14px below the card before it.
   * When the cards run past the foot they move up, into the room above their passages, as far as
   * the column's top allows. When even that is not enough, the oldest cards fold to one-line rows
   * (`rowHeight`: their label and first words), one at a time, until the rest fit. Only when every
   * card but the open one is a row and they still do not fit do the last ones gather into the
   * "more" row. The open card (`open`, an id) never folds or gathers: it keeps its height (at most
   * the room there is).
   * -> { positions: [{ id, top, height, row? }], gathered: [id], stack: { top, height } | null }
   */
  function placeCards(passages, cardHeights, columnHeight, { open = null, stackHeight = 34, gap = COL.cardGap, foot = COL.foot, lift = COL.lift, top = 0, rowHeight = COL.row } = {}) {
    const limit = columnHeight - Math.max(foot, stackHeight + gap);
    const room = Math.max(0, limit - top);
    const items = passages.map((p, i) => ({
      i, id: p.id, open: open != null && p.id === open, keep: p.keep === true,
      want: Math.max(Number(p.top) - lift, top),
      full: Math.max(0, Math.min(Number(cardHeights[i]) || 0, room)),
      age: Number.isFinite(p.at) ? p.at : i,
      foldable: p.fold !== false,
    }));
    // Down from each passage, then up from the foot: the cards' tops, or null when they do not fit.
    const lay = (list, rows) => {
      const out = [];
      for (const it of list) {
        const height = rows.has(it.i) ? Math.min(rowHeight, it.full) : it.full;
        const prev = out[out.length - 1];
        out.push({ it, height, top: Math.max(it.want, prev ? prev.top + prev.height + gap : top) });
      }
      for (let k = out.length - 1; k >= 0; k--) {
        const bound = k === out.length - 1 ? limit : out[k + 1].top - gap;
        if (out[k].top + out[k].height > bound) out[k].top = bound - out[k].height;
      }
      return out.length && out[0].top < top - 1e-9 ? null : out;
    };
    const rows = new Set(), gathered = new Set();
    const shown = () => items.filter(it => !gathered.has(it.i));
    let placed = lay(shown(), rows);
    // The oldest fold first (never the open card); then the last on the page gather.
    const folds = items.filter(it => !it.open && it.foldable && it.full > rowHeight).sort((a, b) => a.age - b.age || a.i - b.i);
    for (const it of folds) { if (placed) break; rows.add(it.i); placed = lay(shown(), rows) }
    for (let k = items.length - 1; k >= 0 && !placed; k--) {
      if (items[k].open || items[k].keep) continue;
      gathered.add(items[k].i); placed = lay(shown(), rows);
    }
    // Only the open card is left, as tall as the room: it takes the room there is.
    if (!placed) placed = shown().map(it => ({ it, height: it.full, top }));
    const last = placed[placed.length - 1];
    const stack = gathered.size ? { top: last ? last.top + last.height + gap : top, height: stackHeight } : null;
    return {
      positions: placed.map(({ it, top, height }) => ({ id: it.id, top, height, ...(rows.has(it.i) && height < it.full ? { row: true } : {}) })),
      gathered: items.filter(it => gathered.has(it.i)).map(it => it.id),
      stack,
    };
  }

  /** A leader line: from the dot beside the passage (x0, y0) curving to the card's label line (x1, y1), as the mockup draws it. */
  function leadPath(x0, y0, x1, y1) {
    const f = v => Math.round(v * 10) / 10;
    return `M${f(x0)} ${f(y0)} C ${f(x0 + 24)} ${f(y0)} ${f(x1 - 22)} ${f(y1)} ${f(x1)} ${f(y1)}`;
  }

  /**
   * Where the column goes in a reader `width` wide with the page's visible right edge at
   * `pageRight`: 56px right of the page, 380px wide, at least 24px from the window's edge.
   * Below 1180px the column hides and cards become marks at the page's edge. -> { left, width } | null
   */
  function columnBox(width, pageRight) {
    if (width < COL.narrow) return null;
    return { left: Math.round(Math.min(pageRight + COL.gap, width - COL.right - COL.width)), width: COL.width };
  }
  /**
   * The room the page area leaves on its right for the column (the docked chat's --dock-w; the
   * area's edge is 14px further left, and the pages keep 16px of padding inside it): the page's
   * edge then sits 56px left of the column, which ends 24px from the window's edge.
   */
  const COLUMN_RESERVE = COL.gap + COL.width + COL.right - 16 - 14;

  /* ---------- Citation tags: {p. 12} -> a tag that scrolls the PDF there ---------- */
  /** What a tag shows: the citation as printed, without its braces. */
  function citeText(token) {
    if (token.kind === 'pp') return `pp. ${token.label}–${token.to}`;
    return `${token.kind}. ${token.label}`;
  }
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /**
   * The place a citation points to, or null when this PDF has no such place (the tag stays text).
   * `labels`: the PDF's printed page labels (pdf.js getPageLabels(), or null); `count`: its pages;
   * `texts`: page number -> that page's extracted text, for the pages known so far.
   * Pages: the printed label, else the page index when the PDF has no labels. Equations, figures,
   * tables and sections: the first known page whose text prints that number.
   * -> { page, needle } (needle: the printed words to find on the page, or '')
   */
  function citeTarget(token, { labels = null, count = 0, texts = null } = {}) {
    if (!token || token.type !== 'cite') return null;
    const label = String(token.label || '');
    if (token.kind === 'p' || token.kind === 'pp') {
      if (Array.isArray(labels) && labels.length) {
        const i = labels.findIndex(l => String(l ?? '').trim().toLowerCase() === label.toLowerCase());
        return i >= 0 && i < (count || labels.length) ? { page: i + 1, needle: '' } : null;
      }
      const n = /^\d+$/.test(label) ? Number(label) : 0;
      return n >= 1 && n <= count ? { page: n, needle: '' } : null;
    }
    const L = escRe(label);
    const re = {
      eq: [new RegExp(`\\(\\s*${L}\\s*\\)`), new RegExp(`\\bEq(?:uation)?s?\\.?\\s*\\(?${L}(?![\\d.])`, 'i')],
      fig: [new RegExp(`\\bFig(?:ure|\\.)?\\s*${L}(?!\\d)`, 'i')],
      table: [new RegExp(`\\bTable\\s*${L}(?!\\d)`, 'i')],
      sec: [new RegExp(`(?:^|\\n)\\s*${L}\\.?\\s+\\p{Lu}`, 'u'), new RegExp(`\\bSection\\s*${L}(?!\\d)`, 'i')],
    }[token.kind];
    if (!re || !texts) return null;
    const entries = (texts instanceof Map ? [...texts.entries()] : Object.entries(texts).map(([k, v]) => [Number(k), v])).sort((a, b) => a[0] - b[0]);
    for (const pattern of re) for (const [n, t] of entries) {
      const m = pattern.exec(typeof t === 'string' ? t : t?.text || '');
      if (m) return { page: n, needle: m[0].trim() };
    }
    return null;
  }

  /* ---------- The cards: a view over the kept results and the noted highlights ---------- */
  const KINDS = { explain: 'Explain', simplify: 'Simplify', ask: 'Ask', define: 'Define', factcheck: 'Fact-check', counterpoint: 'Counterpoint', quiz: 'Quiz me', note: 'Your note', whole: 'Whole PDF' };
  const CARD_KINDS = ['explain', 'simplify', 'ask', 'define', 'factcheck', 'counterpoint', 'quiz'];
  /** A card's passage ([[page, x, y, w, h]] in page fractions) as the reader's anchor list. */
  const anchorOfCard = card => (card.rects || []).map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
  /** A card's first line: [page, x, y, w, h] (lines within half a percent of a page count as one). */
  function firstRect(card) {
    return (card.rects || []).reduce((a, r) => (!a || r[0] < a[0] || (r[0] === a[0] && (r[2] < a[2] - 0.005 || (Math.abs(r[2] - a[2]) <= 0.005 && r[1] < a[1]))) ? r : a), null);
  }
  /** The kinds whose card is the companion's answer: without one it is an empty card. Ask and Define keep the reader's own words. */
  const ANSWER_KINDS = ['explain', 'simplify', 'factcheck', 'counterpoint', 'quiz'];
  /** Whether a kept card has what it is for: an answer with words in it, or a quiz's questions. */
  function cardAnswered(card) {
    if (!ANSWER_KINDS.includes(card?.kind)) return true;
    if (card.kind === 'quiz') return !!card.data?.questions?.length;
    return (card.turns || []).some(t => t?.role === 'assistant' && String(t.content || '').trim());
  }
  /**
   * The cards to show: every kept result (not removed) and every highlight with a note, in page order.
   * A result kept without its answer (cut off before it was written, 15 Oct 2026) is not shown, unless
   * it was made at or after `since` (this visit: its answer may still be on the way, or its error shown).
   */
  function cardView(cards, marks, { since = Infinity } = {}) {
    const out = [];
    // A unit's quiz (Quiz me on this chapter, from the primer) has no passage: it sits at the column's top instead.
    for (const c of cards || []) if (c && !c.gone && CARD_KINDS.includes(c.kind) && c.rects?.length && !c.data?.unit && (cardAnswered(c) || (c.at || 0) >= since)) out.push(c);
    for (const m of marks || []) if (m && !m.gone && m.note && m.rects?.length) out.push({ id: 'n-' + m.id, kind: 'note', mark: m.id, page: m.page, rects: m.rects.map(r => [m.page, ...r]), text: m.text, note: m.note, color: m.color, at: m.at, u: m.u || m.at });
    return out.sort((a, b) => { const fa = firstRect(a), fb = firstRect(b); return fa[0] - fb[0] || (Math.abs(fa[2] - fb[2]) > 0.005 ? fa[2] - fb[2] : fa[1] - fb[1]) || (a.at || 0) - (b.at || 0) });
  }
  /** Two devices' cards: the same rules as the highlights (a union by id, the newer edit wins, a removal is a tombstone). */
  const mergeCards = (...sets) => mergeMarks(...sets);
  const CARD_LIMITS = { text: 2000, turns: 40, content: 12000 };
  /** A new kept card for a passage (`anchor`: the reader's page-fraction boxes). */
  function newCard({ kind, page, anchor, text, turns = [], data = null, at = Date.now() }) {
    const r = v => Math.round(v * 10000) / 10000;
    const id = 'c' + at.toString(36) + Math.random().toString(36).slice(2, 6);
    return { id, kind, page, rects: (anchor || []).slice(0, 400).map(a => [a.n, r(a.x), r(a.y), r(a.w), r(a.h)]), text: String(text || '').slice(0, CARD_LIMITS.text), turns, ...(data ? { data } : {}), at, u: at };
  }

  /* ---------- Answers: the bottom line, citation tags, verdicts and sources ----------
     `P` is the margin's parsers (/lab/margin/margin-parse.js); `resolve(token)` -> its target or
     null. A tag that resolves is a button carrying its page; one that does not stays text. */
  function citeHtml(token, resolve) {
    const target = resolve ? resolve(token) : null;
    if (!target) return esc(token.raw);
    return `<button type="button" class="mr-cite" data-page="${target.page}"${target.needle ? ` data-needle="${esc(target.needle)}"` : ''}>${esc(citeText(token))}</button>`;
  }
  function inlineHtml(text, P, resolve) {
    // Markdown bold is never parsed: its stars are only dropped, so they do not show.
    const plain = String(text || '').replace(/\*\*(?=\S)([^*]+?)\*\*/g, '$1');
    return P.parseCitations(plain).map(part => (part.type === 'cite' ? citeHtml(part, resolve) : esc(part.text).replace(/\n/g, '<br>'))).join('');
  }
  const blocksOf = text => String(text || '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(b => b.replace(/^\n+|\s+$/g, '')).filter(b => b.trim());
  function blockHtml(b, P, resolve) {
    const fence = /^\s*```[^\n]*\n([\s\S]*?)\n?```\s*$/.exec(b);
    return fence ? `<pre>${esc(fence[1])}</pre>` : `<p>${inlineHtml(b.trim(), P, resolve)}</p>`;
  }
  /** An answer with its bottom line (the first sentence of the first paragraph) in weight 600; the rest of that paragraph runs on. */
  function answerHtml(text, P, { resolve = null, prefixes } = {}) {
    const blocks = blocksOf(text);
    if (!blocks.length) return '';
    if (/^\s*```/.test(blocks[0])) return blocks.map(b => blockHtml(b, P, resolve)).join('');
    const first = blocks[0].trim();
    const { lead } = P.splitBottomLine(first, prefixes ? { prefixes } : undefined);
    const tail = first.slice(lead.length).trim();
    return `<p><span class="is-bottom-line">${inlineHtml(lead, P, resolve)}</span>${tail ? ' ' + inlineHtml(tail, P, resolve) : ''}</p>` + blocks.slice(1).map(b => blockHtml(b, P, resolve)).join('');
  }
  /** Fact-check: the verdict line, one paragraph per claim with its verdict word in italic, the sources as plain links. */
  function factcheckHtml(text, P, { resolve = null } = {}) {
    const f = P.parseFactcheck(text);
    if (!f.lead) return { answer: '', sources: '' };
    const claims = f.claims.length ? `<div class="mr-claims">${f.claims.map(c => `<p>${c.verdict ? `<span class="mr-verdict">${esc(c.verdict)}</span> ` : ''}${inlineHtml(c.text, P, resolve)}</p>`).join('')}</div>` : '';
    const sources = f.sources.length ? `<div class="mr-sources">${f.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join('')}</div>` : '';
    return { answer: `<div class="mr-answer"><p><span class="is-bottom-line">${inlineHtml(f.lead, P, resolve)}</span></p></div>${claims}`, sources };
  }
  /** The words a folded card shows (two lines of them): plain, no tags. */
  function foldText(card, P) {
    const plain = t => String(t || '').replace(/\{[^{}\n]{1,40}\}/g, m => (P.parseCitations(m)[0]?.type === 'cite' ? '' : m)).replace(/\*\*/g, '').replace(/^\s*Sources:.*$/gim, '').replace(/```/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
    if (card.kind === 'note') return plain(card.note);
    if (card.kind === 'define') { const d = card.data || {}; return plain(d.inText || (d.senses || [])[0]?.text || d.line || '') }
    if (card.kind === 'quiz') {
      const q = card.data || {}, n = q.questions?.length || 0;
      if (q.done) return `${quizScore(q)} of ${n}`;
      return plain(q.questions?.[q.i || 0]?.q || '');
    }
    const answer = (card.turns || []).find(t => t.role === 'assistant');
    return plain(answer?.content || '');
  }
  const quizScore = q => (q.results || []).filter(r => r && r.verdict === 'right' && !r.shown).length;
  /** The question to reread after a quiz: "not yet" first, then "nearly", then one whose answer was shown; -1 when all were right. */
  function quizReread(q) {
    const rs = q.results || [];
    const rank = r => (!r ? 3 : r.shown ? 2 : r.verdict === 'not_yet' ? 0 : r.verdict === 'nearly' ? 1 : 9);
    let best = -1;
    (q.questions || []).forEach((_, i) => { if (rank(rs[i]) < 9 && (best < 0 || rank(rs[i]) < rank(rs[best]))) best = i });
    return best;
  }
  /** A card's label: its action and page ("Ask · p. 12"); Define names its word; a note is "Your note". */
  function cardLabel(card, pageLabel) {
    if (card.kind === 'note' || card.kind === 'whole') return KINDS[card.kind];
    if (card.kind === 'define') return `${KINDS.define} · ${card.data?.word || card.text}`;
    if (card.data?.unit) return `${KINDS[card.kind]} · ${card.data.unit.label || KINDS.whole}`;
    return `${KINDS[card.kind] || KINDS.explain}${pageLabel ? ` · p. ${pageLabel}` : ''}`;
  }
  const CARD_ICONS = {
    copy: svg('<rect x="6" y="6" width="9" height="9" rx="1.8"/><path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-6A1.5 1.5 0 0 0 3 4.5v6A1.5 1.5 0 0 0 4.5 12H6"/>'),
    mic: ICONS.mic,
  };
  /** The follow-up line: a field with a blinking caret and no placeholder, an optional link ("Show answer"), the mic. */
  function followHtml({ link = '', field = true, mic = true, label = 'Follow up' } = {}) {
    return `<div class="mr-follow">${field ? `<span class="mr-follow__field"><textarea class="mr-follow__input" rows="1" enterkeyhint="send" aria-label="${esc(label)}"></textarea><span class="mr-caret" aria-hidden="true"></span></span>` : ''}<span class="mr-follow__sp"></span>${link}${mic ? `<button type="button" class="mr-follow__mic" data-c="mic" aria-label="Dictate" aria-pressed="false">${CARD_ICONS.mic}</button>` : ''}</div>`;
  }
  /**
   * A card. Folded: its label and two lines. Open: the label and close, the passage quote, the
   * question bubble (Ask), the answer, the action's own parts, copy, and the follow-up line.
   * o: { open, P (parsers), resolve (citation -> target), pageLabel, status (a status line such as
   * "Checking sources…"), live (an answer on its way), pending (a quiz answer being marked),
   * writing (Quiz me's questions are still arriving: there will be three) }.
   */
  function cardHtml(card, o) {
    const P = o.P, label = esc(cardLabel(card, o.pageLabel));
    if (!o.open) return `<button type="button" class="mr-card__label" data-c="open">${label}</button><div class="mr-card__text">${esc(foldText(card, P))}</div>`;
    const q = card.data || {};
    const count = card.kind === 'quiz' && q.questions?.length && !q.done ? `<span class="mr-card__count">${(q.i || 0) + 1} of ${o.writing ? 3 : q.questions.length}</span>` : '';
    const head = `<div class="mr-card__label"><span class="mr-card__name">${label}</span>${count}<button type="button" class="mr-card__close" data-c="close" aria-label="Close">×</button></div>`;
    const copy = `<div class="mr-card__acts"><button type="button" class="mr-card__copy" data-c="copy" aria-label="Copy">${CARD_ICONS.copy}</button></div>`;
    const status = o.status ? `<p class="mr-status" role="status">${esc(o.status)}</p>` : '';
    if (card.kind === 'quiz') {
      const qs = q.questions || [];
      let body = '', foot = followHtml({ field: false, mic: false });
      if (!qs.length) body = status;
      else if (q.done) {
        const i = quizReread(q), cite = i >= 0 && qs[i].cite ? ' ' + inlineHtml(qs[i].cite, P, o.resolve) : '';
        body = `<div class="mr-answer"><p><span class="is-bottom-line">${quizScore(q)} of ${qs.length}</span></p>${i >= 0 ? `<p>${esc(qs[i].q)}${cite}</p>` : ''}</div>`;
        foot = '';
      } else if (!qs[q.i || 0]) {
        // Answered ahead of the stream (FIXES-2026-10-15 A7): a quiet line until the next question arrives.
        body = '<p class="mr-status mr-writing" role="status">Writing the next question…</p>';
        foot = followHtml({ field: false, mic: false });
      } else {
        const i = q.i || 0, item = qs[i], r = (q.results || [])[i];
        const cite = item.cite ? ' ' + inlineHtml(item.cite, P, o.resolve) : '';
        body = `<div class="mr-question">${esc(item.q)}</div>`;
        if (r) {
          body += r.shown
            ? `<div class="mr-answer"><p><span class="is-bottom-line">${esc(item.answer)}</span>${item.why ? ' ' + esc(item.why) : ''}${cite}</p></div>`
            : `<div class="mr-you">${esc(r.answer)}</div><div class="mr-answer"><p><span class="is-bottom-line">${esc(P.QUIZ_VERDICT_LINE[r.verdict])}</span>${r.feedback ? ' ' + esc(r.feedback) : ''}${cite}</p></div>`;
          // A quiz whose writing stopped early ends with the questions it has (FIXES-2026-10-15 A7).
          const last = q.ended && i + 1 >= qs.length;
          foot = followHtml({ field: false, mic: false, link: `<button type="button" class="mr-follow__link" data-c="next">${last ? 'See your score' : 'Next question →'}</button>` });
        } else if (o.pending != null) { body += `<div class="mr-you">${esc(o.pending)}</div>${status}<p class="mr-status mr-wait"></p>`; foot = '' }
        else foot = followHtml({ label: 'Your answer', link: '<button type="button" class="mr-follow__link" data-c="show">Show answer</button>' });
      }
      return head + `<div class="mr-card__body">${body}</div>` + foot;
    }
    let body = card.text && card.kind !== 'define' ? `<div class="mr-quote">${esc(cut(card.text))}</div>` : '';
    if (card.kind === 'note') body += `<div class="mr-answer is-note"><p>${esc(card.note)}</p></div>`;
    else if (card.kind === 'define') {
      const senses = q.senses || [];
      body += q.inText
        ? `<div class="mr-answer"><p class="mr-define__label">In this text</p><p><span class="is-bottom-line">${esc(q.inText)}</span></p>${senses.map(s => `<p class="mr-define__sense">${esc(s.text)}</p>`).join('')}</div>`
        : senses.length
          ? `<div class="mr-answer"><p><span class="is-bottom-line">${esc(senses[0].text)}</span></p>${senses.slice(1).map(s => `<p>${esc(s.text)}</p>`).join('')}</div>`
          : `<div class="mr-answer"><p><span class="is-bottom-line">${esc(q.line || '')}</span></p></div>`;
    }
    const turns = [...(card.turns || [])];
    if (o.live != null) turns.push({ role: 'assistant', content: o.live });
    let answered = card.kind === 'note' || card.kind === 'define';
    turns.forEach((t, k) => {
      if (t.role === 'user') { if (card.kind === 'ask' || k > 0) body += `<div class="mr-you">${esc(t.display || t.content)}</div>`; if (t.failed) body += `<p class="mr-status">${esc(t.failed)}</p>`; return }
      answered = true;
      if (card.kind === 'factcheck' && k <= 1) { const f = factcheckHtml(t.content, P, { resolve: o.resolve }); body += f.answer + f.sources }
      else body += `<div class="mr-answer">${answerHtml(t.content, P, { resolve: o.resolve })}</div>`;
    });
    body += status;
    return head + `<div class="mr-card__body">${body}${answered && !o.status && o.live == null ? copy : ''}</div>` + followHtml();
  }
  /** The "more" row: "{n} more on this page", their kinds on the right. */
  function stackHtml(cards, maxKinds = Infinity) {
    const all = [...new Set(cards.map(c => KINDS[c.kind]))];
    const kinds = all.slice(0, maxKinds).join(' · ');
    return `<span>${cards.length} more on this page</span><span>${esc(kinds)}</span>`;
  }
  /** The column foot: a hairline, a caret, "[/] the whole PDF" and the mic. */
  function footHtml() {
    return `<span class="mr-follow__field"><textarea class="mr-follow__input mr-foot__input" rows="1" enterkeyhint="send" aria-label="Ask about the whole PDF"></textarea><span class="mr-caret" aria-hidden="true"></span></span><span class="mr-follow__sp"></span><span class="mr-foot__hint"><span class="mr-key">/</span> the whole PDF</span><button type="button" class="mr-follow__mic" data-c="mic" aria-label="Dictate" aria-pressed="false">${CARD_ICONS.mic}</button>`;
  }

  /** A card's own classes: open or folded, a note (its rule in the highlight colour). */
  const cardClass = (card, open) => `mr-card ${open ? 'is-open' : 'is-folded'}${card.kind === 'note' ? ' is-note' : ''}`;
  /**
   * The whole-PDF thread (the existing chat thread's turns, as chat-thread.js threadRows orders
   * them with a divider when the page or the day changes), drawn in the card's own pieces.
   * rows: [{ type: 'divider', label } | { type: 'turn', index }]; turns: [{ role, text, quote, note }].
   */
  function threadHtml(rows, turns, o) {
    return rows.map(row => {
      if (row.type === 'divider') return `<p class="mr-divider">${esc(row.label)}</p>`;
      const t = turns[row.index]; if (!t) return '';
      if (t.role === 'user') return (t.quote ? `<div class="mr-quote">${esc(cut(t.quote))}</div>` : '') + (t.extra || '') + `<div class="mr-you">${esc(t.text)}</div>` + (t.note ? `<p class="mr-status">${esc(t.note)}</p>` : '');
      return t.text ? `<div class="mr-answer">${answerHtml(t.text, o.P, { resolve: o.resolve })}</div>` : '';
    }).join('');
  }
  /** The whole-PDF card: "Whole PDF", the thread, the attachments waiting to go, the follow-up line. */
  // On the phone the chat's card has no label (mockup 5D): swipe down or tap the page to close it.
  function wholeHtml(body, { open = true, fold = '', tray = '', label = true } = {}) {
    if (!open) return `<button type="button" class="mr-card__label" data-c="open">${KINDS.whole}</button><div class="mr-card__text">${esc(fold)}</div>`;
    return (label ? `<div class="mr-card__label"><span class="mr-card__name">${KINDS.whole}</span><button type="button" class="mr-card__close" data-c="close" aria-label="Close">×</button></div>` : '') + `<div class="mr-card__body">${body}</div>${tray}` + followHtml({ label: 'Ask about the whole PDF' });
  }
  /** The phone's bottom card: the grab handle, then a card's open contents. */
  const sheetHtml = inner => `<button type="button" class="mr-sheet__grab" data-c="grab" aria-label="Full height"></button>${inner}`;

  /* ---------- PR 3: Before you start (docs/margin/BRIEF.md §5, mockup section 4) ----------
     A PDF's units are its top-level outline entries as page ranges (the whole file when it has no
     outline). At a unit's start the margin offers one folded card, the trigger; it opens into the
     primer in place. Made once per unit and kept with the file (PROMPTS.md, chapter action `primer`). */
  // The mockup's .trig / .primer: 16px below the column's top, 70px above its bottom. A PDF shorter
  // than `units` pages is one unit, outline or not (a paper's primer covers the whole paper).
  const PRIMER = { top: 16, bottom: 70, units: 40 };
  /**
   * The units: `entries` are the outline's top-level items in outline order, each { title, page }
   * with `page` its 1-based page (null when it does not resolve). Entries are kept in page order;
   * a second entry on the same page as the one before is left out. The first unit also takes any
   * pages before its entry (a title page), so the PDF's start offers it too. Each unit's key is
   * "outline-{i}" (its index in the outline), "all" for the whole file: a PDF without an outline,
   * or one of fewer than 40 pages (FIXES-2026-10-15, B2).
   * -> [{ key, title, from, start, to }] (start: the entry's own page; the trigger shows from `from` to `start`)
   */
  function primerUnits(entries, count) {
    const n = Math.max(1, Number(count) || 1);
    const list = (entries || []).map((e, i) => ({ i, title: String(e?.title || '').replace(/\s+/g, ' ').trim().slice(0, 300), page: e?.page }))
      .filter(e => e.title && Number.isInteger(e.page) && e.page >= 1 && e.page <= n)
      .sort((a, b) => a.page - b.page || a.i - b.i)
      .filter((e, k, all) => k === 0 || e.page !== all[k - 1].page);
    if (!list.length || n < PRIMER.units) return [{ key: 'all', title: '', from: 1, start: 1, to: n }];
    return list.map((e, k) => ({ key: 'outline-' + e.i, title: e.title, from: k === 0 ? 1 : e.page, start: e.page, to: k + 1 < list.length ? list[k + 1].page - 1 : n }));
  }
  /** The unit a page is in. */
  const unitAt = (units, page) => (units || []).find(u => page >= u.from && page <= u.to) || (units || [])[0] || null;
  /** True on the pages where the trigger is offered: the unit's start (and any pages before it). */
  const atUnitStart = (unit, page) => !!unit && page >= unit.from && page <= unit.start;
  /**
   * How the trigger names its unit ("a map of chapter 1."): a numbered chapter, part or section as
   * "chapter 1", the whole file as "the whole PDF", any other heading as a phrase with "the", its
   * own number dropped and its capitalised words lowercased ("1 Introduction" -> "the introduction";
   * acronyms such as "BLEU" stay as printed).
   */
  function unitPhrase(unit) {
    if (!unit || unit.key === 'all' || !unit.title) return 'the whole PDF';
    const m = /^(chapter|part|section|lecture|unit|book|appendix)\s+([\p{L}\p{N}]+(?:\.\d+)*)(?=$|[\s.:,;—–-])/iu.exec(unit.title);
    if (m) return `${m[1].toLowerCase()} ${m[2]}`;
    const words = unit.title.replace(/[.:;,]+$/, '').replace(/^\s*(?:\d+(?:\.\d+)*\.?|[IVXLC]+\.|[A-Z]\.)\s+(?=\S)/u, '').trim()
      .split(/\s+/).map(w => (/^\p{Lu}[\p{Ll}'’-]*$/u.test(w) ? w.toLowerCase() : w));
    if (/^(the|a|an)$/i.test(words[0] || '')) words[0] = words[0].toLowerCase();
    return (/^(the|a|an)$/.test(words[0]) ? '' : 'the ') + words.join(' ');
  }
  /** A map row's printed page range ("pp. 9–10", "p. 12", "9-10") as a citation token, or null. */
  function mapPages(text) {
    const m = /^\s*(?:pp?\.?\s*)?([\p{L}\p{N}]{1,12})(?:\s*[–—-]\s*([\p{L}\p{N}]{1,12}))?\s*$/u.exec(String(text || ''));
    if (!m) return null;
    return m[2] ? { type: 'cite', kind: 'pp', label: m[1], to: m[2], raw: String(text) } : { type: 'cite', kind: 'p', label: m[1], raw: String(text) };
  }
  /** A heading with its own number: "1 Introduction", "3.2 Attention", "A.1 Proofs", "IV. Results", "Chapter 2 …". */
  const OWN_NUMBER = /^\s*(?:\d+(?:\.\d+)*\.?|[A-Z](?:\.\d+)+\.?|[A-Z]\.|[IVXLC]+\.|(?:chapter|part|section|appendix|lecture|unit)\s+[\p{L}\p{N}]+(?:\.\d+)*[.:]?)\s+\S/iu;
  /**
   * The trigger's words, a folded margin card's (Anders, 15 Oct): the italic label "Before you start",
   * then "The gist, the key claims and a map of {unit}." The B key is in its title, not a keycap.
   */
  function triggerHtml(unit) {
    return `<span class="mr-trigger__title">Before you start</span><span class="mr-trigger__sub">The gist, the key claims and a map of ${esc(unitPhrase(unit))}.</span>`;
  }
  /**
   * The primer. p: { gist, claims: [{ text, cite }], keepInMind: [..], map: [{ title, pages }] }, or
   * null while it is made (`wait`) or when it could not be (`status`, then Redo).
   * o: { P (parsers), resolve (citation -> target), status, wait, close (the close button; default true), id (the title's id) }.
   */
  function primerHtml(p, o = {}) {
    const close = o.close === false ? '' : '<button type="button" class="mr-card__close mr-primer__close" data-c="close" aria-label="Close">×</button>';
    const head = `<h4 class="mr-primer__title"${o.id ? ` id="${esc(o.id)}"` : ''}>Before you start${close}</h4>`;
    if (!p) {
      if (o.wait) return head + '<p class="mr-status mr-wait" role="status"></p>';
      return head + `<p class="mr-status" role="status">${esc(o.status || '')}</p><div class="mr-primer__foot"><span></span><button type="button" data-c="redo">Redo</button></div>`;
    }
    const tag = cite => (cite ? ' ' + inlineHtml(cite, o.P, o.resolve) : '');
    const claims = (p.claims || []).map((c, i) => `<li><span class="mr-primer__n" aria-hidden="true">${i + 1}</span><span>${inlineHtml(c.text, o.P, o.resolve)}${tag(c.cite)}</span></li>`).join('');
    const keep = (p.keepInMind || []).map(k => `<li>${inlineHtml(k, o.P, o.resolve)}</li>`).join('');
    // A map that uses the document's own numbered headings ("1 Introduction") shows each number once: no count beside it.
    const own = (p.map || []).some(r => OWN_NUMBER.test(r.title || ''));
    const rows = (p.map || []).map((r, i) => {
      const token = mapPages(r.pages), target = token && o.resolve ? o.resolve(token) : null;
      const inner = `${own ? '' : `<span class="mr-map__n" aria-hidden="true">${i + 1}</span>`}<span class="mr-map__title">${esc(r.title)}</span><span class="mr-map__pages">${esc(r.pages || '')}</span>`;
      const cls = 'mr-map__row' + (own ? ' is-own' : '');
      return target ? `<button type="button" class="${cls}" data-page="${target.page}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
    }).join('');
    return head
      + `<p class="mr-primer__gist">${inlineHtml(p.gist, o.P, o.resolve)}</p>`
      + `<div><p class="mr-primer__head">Key claims</p><ol class="mr-primer__claims">${claims}</ol></div>`
      + `<div><p class="mr-primer__head">Keep in mind</p><ul class="mr-primer__keep">${keep}</ul></div>`
      + `<div><p class="mr-primer__head">Map</p><div class="mr-map">${rows}</div></div>`
      + '<button type="button" class="mr-quiz-row" data-c="quiz"><span>Quiz me on this chapter</span><small>3 questions →</small></button>'
      + '<div class="mr-primer__foot"><span>Made when you opened the file</span><button type="button" data-c="redo">Redo</button></div>';
  }

  const html = { esc, cut, ICONS, LATER, barHtml, moreHtml, defineHtml, noteHtml, cardHtml, cardClass, stackHtml, footHtml, followHtml, answerHtml, factcheckHtml, inlineHtml, threadHtml, wholeHtml, sheetHtml, foldText, cardLabel, citeText, CARD_ICONS, triggerHtml, primerHtml };

  return { html, sizeAsk, parseLookup, DESK, PHONE, COL, PRIMER, COLUMN_RESERVE, KINDS, CARD_KINDS, CARD_LIMITS, placeBar, placeMore, placeCard, placeCards, leadPath, columnBox, citeTarget, cardView, cardAnswered, firstRect, mergeCards, newCard, anchorOfCard, quizScore, quizReread, typedChar, selectionKey, oneWord, hyphenWord, nameMidSentence, copyQuote, defaultColor, chooseColor, mergeMarks, splitMarks, tombstone, sameMarks, stampOf, primerUnits, unitAt, atUnitStart, unitPhrase, mapPages };
});
