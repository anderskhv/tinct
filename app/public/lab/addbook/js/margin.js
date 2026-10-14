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

  /** One word (letters, with an inner apostrophe or hyphen), which opens Define instead of the bar. */
  const WORD = /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u;
  function oneWord(text) {
    const t = String(text || '').trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    return t.length >= 2 && t.length <= 40 && WORD.test(t) ? t : null;
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
  // In PR 1a, the actions whose Worker intents ship in 1b stay out of the reader (the fixture shows them).
  const LATER = { simplify: true, factcheck: true, counterpoint: true, quiz: true, share: true };
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
  function defineHtml(d, o) {
    const senses = (d.senses || []).slice(0, 3);
    const body = d.wait ? '<p class="mr-define__wait"></p>'
      : senses.length ? `<ol class="mr-define__senses">${senses.map(s => `<li${s.fit ? ' class="is-fit"' : ''}>${esc(s.text)}</li>`).join('')}</ol>`
        : d.line ? `<p>${esc(d.line)}</p>` : '';
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
  const html = { esc, cut, ICONS, LATER, barHtml, moreHtml, defineHtml, noteHtml };

  return { html, sizeAsk, parseLookup, DESK, PHONE, placeBar, placeMore, placeCard, typedChar, oneWord, nameMidSentence, copyQuote, defaultColor, chooseColor, mergeMarks, splitMarks, tombstone, sameMarks, stampOf };
});
