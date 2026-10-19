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
    // Desktop, no room above or below (a short window, the bar mid-screen): beside the bar, right of
    // it or else left, level with it as far as the frame allows. It may cover page text, never the bar.
    if (!phone && !fitsAbove && !fitsBelow) {
      const right = bar.right + gap, leftOf = bar.left - gap - w;
      const x = right + w <= frame.right - inset ? right : leftOf >= frame.left + inset ? leftOf : null;
      if (x != null) return { left: x, top: clamp((bar.top + bar.bottom) / 2 - h / 2, frame.top + inset, frame.bottom - inset - h), below: false, beside: true };
    }
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

  /**
   * What Define asks for a word (`hit`: the offline dictionary's entry, or null). The dictionary's
   * senses show unless the word is a name mid-sentence (offline, they show anyway). Online, the
   * companion's in-text meaning is always asked, dictionary word or not, and shown first under
   * "In this text" (15 Oct: "perplexity" read "confusion", "ensembles" musicians, "saturates" a
   * chemical sense); define_sense orders the senses below it. -> { dictionary, inText, sense }
   */
  function defineAsks(hit, { word, before, online }) {
    const dictionary = !!hit && (!nameMidSentence(word, before) || !online);
    return { dictionary, inText: !!online, sense: dictionary && !!online };
  }

  /**
   * Copy quote: the passage, then the title and page. `page` is the page as printed (its label,
   * "xii" or "12"); `place` names a place that is not a page (an EPUB's chapter) and wins over it.
   */
  function copyQuote({ text, title, page, place }) {
    const quote = String(text || '').replace(/\s+/g, ' ').trim();
    const where = [String(title || '').trim(), place ? String(place).trim() : page ? 'p. ' + page : ''].filter(Boolean).join(', ');
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
  // A leading label about the word's grammar rather than its meaning: "Proper noun used as a term (…).", "Eponym, used as a modifier:".
  const GRAMMAR_LABEL = /^\s*(?:an?\s+)?(?:proper noun|eponym(?:ous)?(?:\s+term)?)\b(?:[^.:;\n(]|\([^)\n]*\))*?(?:used as|modifier|term|adjective|name)(?:[^.:;\n(]|\([^)\n]*\))*[.:;\u2014\u2013]\s+/i;
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
    function definition(d0) {
      // Never a grammar label first (re-check 2, 16 Oct: "Proper noun used as a term (adjective-like modifier…)" on "Parzen").
      const d = d0.replace(GRAMMAR_LABEL, '') || d0;
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
    // The note: a pencil over a short rule (Anders, 15 Oct: in the style of Gloss's bar, drawn as our own).
    note: svg('<path d="M11.6 3.4l2.9 2.9-7.6 7.6-3.6.8.8-3.6z"/><path d="M10.1 4.9l2.9 2.9M10.5 15.3h4.6"/>'),
    // The highlight: a chisel-tipped highlighter, its colour as a small dot at its foot (dotHtml).
    highlight: svg('<path d="M12.3 2.8l2.9 2.9-6.6 6.6-2.9-2.9z"/><path d="M5.7 9.4l-1.2 4 4-1.2M3.4 15.4h3.4"/>'),
    mic: svg('<rect x="6.5" y="2.5" width="5" height="8.5" rx="2.5"/><path d="M4 9a5 5 0 0 0 10 0M9 14v2M6.5 16h5"/>'),
    up: svg('<path d="M9 14V4M4.5 8.5 9 4l4.5 4.5"/>'),
    // Remove highlight on the phone's bar (no room for its words there): the cards' bin.
    trash: svg('<path d="M3.5 5h11M7.2 5V3.4h3.6V5M5 5l.8 9.6h6.4L13 5M7.6 7.8v4.4M10.4 7.8v4.4"/>'),
  };
  // Share as image stays out of the PDF reader for now (the fixture shows it); every other action is in.
  const LATER = { share: true };
  const shown = (id, all) => all || !LATER[id];
  // Related (FIXES-2026-10-15 A5): between Fact-check and Counterpoint.
  const MORE_ROWS = [['define', 'Define', 'The word, as this text uses it'], ['factcheck', 'Fact-check', 'Does it still hold? Searches the web'], ['related', 'Related', 'Where else the text takes this up'], ['counterpoint', 'Counterpoint', 'The strongest objection to it'], ['quiz', 'Quiz me', 'Three questions to check you have it']];
  const MORE_ROWS_2 = [['copy', 'Copy quote', 'With the title and page number'], ['share', 'Share as image', 'The quote as a card to post']];
  const colorOf = (colors, key) => { const c = colors.find(x => x[0] === key) || colors[0]; return { key: c[0], label: c[1], dot: c[3] } };
  function dotHtml(colors, current, { noted = false } = {}) {
    const c = colorOf(colors, current);
    // The highlighter with the current colour as a small dot at its foot (one tap highlights in it).
    return `<button type="button" class="mr-bar__item is-hl" data-m="dot" aria-label="Highlight in ${esc(c.label)}"><span class="mr-hl">${ICONS.highlight}<span class="mr-dot" style="--hl-current:${esc(c.dot)}"></span></span></button>`
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
   * The bar. state: 'menu' | 'colors' | 'asking' | 'existing'. opts: { colors, current, phone, all (show the 1b
   * actions, fixture only), moreOpen, noted, question }. 'existing' is a highlight clicked (Anders, 19 Oct 2026): Ask
   * and Explain, its colours, its note, and Remove highlight (on the phone, the bin with that name).
   */
  function barHtml(state, o) {
    if (state === 'existing') {
      const sep = '<span class="mr-bar__sep" aria-hidden="true"></span>';
      return `<button type="button" class="mr-bar__item is-text" data-m="ask">Ask</button>${sep}<button type="button" class="mr-bar__item is-text" data-m="explain">Explain</button>${sep}`
        + swatchesHtml(o.colors, o.current) + sep
        + `<button type="button" class="mr-bar__item" data-m="note" aria-label="${o.noted ? 'Edit note' : 'Add note'}">${ICONS.note}</button>`
        + (o.phone ? `<button type="button" class="mr-bar__item" data-m="remove" aria-label="Remove highlight">${ICONS.trash}</button>` : `<button type="button" class="mr-bar__item is-text" data-m="remove">Remove highlight</button>`);
    }
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
    // Its {p. N} citations are tags, as in cards (o.P, o.resolve); without the parsers, plain text.
    // While it is written: the label in its place, first, with the wait ring (d.inWait); the senses below it at once.
    const inText = d.inText ? `<p class="mr-define__in"><span class="mr-define__label">In this text</span>${o?.P ? inlineHtml(d.inText, o.P, o.resolve) : esc(d.inText)}</p>`
      : d.inWait ? '<p class="mr-define__in mr-define__wait"><span class="mr-define__label">In this text</span></p>' : '';
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
      // A heading on its own line, "Section 3", or (text extracted without line breaks) a heading run on after a sentence: "… entirely. 3 Model Architecture".
      sec: [new RegExp(`(?:^|\\n)\\s*${L}\\.?\\s+\\p{Lu}`, 'u'), new RegExp(`\\bSection\\s*${L}(?!\\d)`, 'i'), new RegExp(`(?:[.:!?]\\s+|\\s{2,})${L}\\.?\\s+\\p{Lu}\\p{Ll}{2,}`, 'u')],
    }[token.kind];
    if (!re || !texts) return null;
    const entries = (texts instanceof Map ? [...texts.entries()] : Object.entries(texts).map(([k, v]) => [Number(k), v])).sort((a, b) => a[0] - b[0]);
    for (const pattern of re) for (const [n, t] of entries) {
      const m = pattern.exec(typeof t === 'string' ? t : t?.text || '');
      if (m) return { page: n, needle: m[0].replace(/^[.:!?\s]+/, '').trim() };
    }
    return null;
  }

  /* ---------- The cards: a view over the kept results and the noted highlights ---------- */
  const KINDS = { explain: 'Explain', simplify: 'Simplify', ask: 'Ask', define: 'Define', factcheck: 'Fact-check', related: 'Related', counterpoint: 'Counterpoint', quiz: 'Quiz me', note: 'Your note', whole: 'Whole PDF', chat: 'Chat', figure: 'Figure', formula: 'Formula', snip: 'Snip' };
  // A figure's card (FIXES-2026-10-15 item 4) holds one thread about one figure, formula or snip: its box is the card's passage.
  const CARD_KINDS = ['explain', 'simplify', 'ask', 'define', 'factcheck', 'related', 'counterpoint', 'quiz', 'figure'];
  /** The whole file's card is "Whole PDF", or "Whole book" for an EPUB. */
  const wholeName = doc => (doc === 'epub' ? 'Whole book' : KINDS.whole);
  /** A card's passage ([[page, x, y, w, h]] in page fractions) as the reader's anchor list. */
  const anchorOfCard = card => (card.rects || []).map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
  /** A card's first line: [page, x, y, w, h] (lines within half a percent of a page count as one). */
  function firstRect(card) {
    return (card.rects || []).reduce((a, r) => (!a || r[0] < a[0] || (r[0] === a[0] && (r[2] < a[2] - 0.005 || (Math.abs(r[2] - a[2]) <= 0.005 && r[1] < a[1]))) ? r : a), null);
  }
  /** The kinds whose card is the companion's answer: without one it is an empty card. Ask and Define keep the reader's own words. */
  const ANSWER_KINDS = ['explain', 'simplify', 'factcheck', 'related', 'counterpoint', 'quiz'];
  /** Whether a kept card has what it is for: an answer with words in it, or a quiz's questions. Related is an answer; a figure's card is a thread, kept as Ask is. */
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
    // A note in the margin (a click on the empty column) or a unit's own note (its end's Note) has no passage: its one
    // box has no size (noteSpot). It is "free": no underline, no leader line, its field always editable.
    for (const m of marks || []) if (m && !m.gone && m.note && m.rects?.length) { const spot = noteSpot(m); out.push({ id: 'n-' + m.id, kind: 'note', mark: m.id, page: m.page, rects: m.rects.map(r => [m.page, ...r]), text: m.text, note: m.note, color: m.color, at: m.at, u: m.u || m.at, ...(spot ? { free: true, ...(spot.unit ? { unitNote: true } : {}) } : {}) }) }
    return out.sort((a, b) => { const fa = firstRect(a), fb = firstRect(b); return fa[0] - fb[0] || (Math.abs(fa[2] - fb[2]) > 0.005 ? fa[2] - fb[2] : fa[1] - fb[1]) || (a.at || 0) - (b.at || 0) });
  }
  /**
   * A note with no passage (Anders, 19 Oct 2026, evening): a margin note, kept as a highlight record whose one box has
   * no size, [x, y, 0, 0], at the height it was written (x 1: the page's right edge, y its height on the page), or a
   * unit's own note (the Note pill at its end), whose box is [2, 1, 0, 0] on the unit's last page. Both sync as every
   * note does (the account keeps a highlight's boxes as they are). -> { y, unit } | null
   */
  function noteSpot(m) {
    const r = m?.rects;
    if (!Array.isArray(r) || r.length !== 1 || !Array.isArray(r[0]) || r[0][2] !== 0 || r[0][3] !== 0) return null;
    return { y: Number(r[0][1]) || 0, unit: r[0][0] === 2 };
  }
  /** The box a margin note keeps: at `y` (a fraction of its page's height); a unit's note: its last page's foot. */
  const noteBox = (y, { unit = false } = {}) => (unit ? [2, 1, 0, 0] : [1, Math.round(Math.max(0, Math.min(1, y)) * 10000) / 10000, 0, 0]);
  /**
   * Deleting a card (Anders, 15 Oct): what goes. A card becomes a tombstone (synced as every card's
   * removal). A note's card is its highlight's note: the note goes, and the highlight with it when the
   * note made it (`withNote`), else the highlight stays. Any other card takes with it a highlight made on
   * its passage after it (never one that predates the card, nor one carrying a note of its own).
   * `marks`: the file's highlights. -> { card: id | null, removeMarks: [id], clearNote: id | null }
   */
  function deletePlan(card, marks = []) {
    const live = (marks || []).filter(m => m && !m.gone);
    if (card?.kind === 'note') {
      const m = live.find(x => x.id === card.mark);
      if (!m) return { card: null, removeMarks: [], clearNote: null };
      return m.withNote ? { card: null, removeMarks: [m.id], clearNote: null } : { card: null, removeMarks: [], clearNote: m.id };
    }
    const at = Number(card?.at) || 0;
    const boxes = (card?.rects || []).map(([n, x, y, w, h]) => ({ n, x, y, w, h }));
    const covered = m => (m.rects || []).some(([x, y, w, h]) => boxes.some(b => b.n === m.page && overlapOf({ x, y, w, h }, b) > 0.3));
    const removeMarks = live.filter(m => !m.note && (Number(m.at) || 0) >= at && covered(m)).map(m => m.id);
    return { card: card?.id || null, removeMarks, clearNote: null };
  }
  /** Two devices' cards: the same rules as the highlights (a union by id, the newer edit wins, a removal is a tombstone). */
  const mergeCards = (...sets) => mergeMarks(...sets);
  const CARD_LIMITS = { text: 2000, turns: 40, content: 12000 };
  /** A quiz answer the reader types is kept to this many characters (the Worker marks at most this much). */
  const QUIZ_ANSWER_CHARS = 2000;
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
    // A tag this PDF has no place for is shown without its braces ("p. 1"), never as "{p. 1}"; one written in parentheses stays as written.
    if (!target) return esc(token.raw.startsWith('(') ? token.raw : citeText(token));
    return `<button type="button" class="mr-cite" data-page="${target.page}"${target.needle ? ` data-needle="${esc(target.needle)}"` : ''}>${esc(citeText(token))}</button>`;
  }
  /**
   * A stray *word* (the prompts ask for plain prose) shows as italics; a lone star, a product (2*3)
   * or a footnote mark (text*) stays as written. Runs on escaped text.
   */
  const italics = html => html.replace(/(^|[^\w*])\*(?=[^\s*])([^*\n]{0,200}?[^\s*])\*(?![\w*])/g, '$1<em>$2</em>');
  function inlineHtml(text, P, resolve) {
    // Markdown bold is never parsed: its stars are only dropped, so they do not show.
    const plain = String(text || '').replace(/\*\*(?=\S)([^*]+?)\*\*/g, '$1');
    // A bare "eq. 1" (no braces) is a tag only when this PDF has that equation (recheck-1, 16 Oct); the rest as before.
    const bare = token => (/^eq\./i.test(token.raw) ? Boolean(resolve && resolve(token)) : true);
    return P.parseCitations(plain, bare).map(part => (part.type === 'cite' ? citeHtml(part, resolve) : italics(esc(part.text)).replace(/\n/g, '<br>'))).join('');
  }
  const blocksOf = text => String(text || '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map(b => b.replace(/^\n+|\s+$/g, '')).filter(b => b.trim());
  function blockHtml(b, P, resolve) {
    const fence = /^\s*```[^\n]*\n([\s\S]*?)\n?```\s*$/.exec(b);
    return fence ? `<pre>${esc(fence[1])}</pre>` : `<p>${inlineHtml(b.trim(), P, resolve)}</p>`;
  }
  /**
   * A reply in a conversation (Chat, and a card's follow-ups): plain paragraphs, no bold bottom line, as the book
   * reader's chat shows its answers (Anders, 19 Oct 2026: a follow-up's first sentence came out bold up to a quote).
   */
  function replyHtml(text, P, { resolve = null } = {}) {
    return blocksOf(text).map(b => blockHtml(b, P, resolve)).join('');
  }
  /** An answer with its bottom line (the first sentence of the first paragraph) in weight 600; the rest of that paragraph runs on. */
  function answerHtml(text, P, { resolve = null, prefixes } = {}) {
    const blocks = blocksOf(text);
    if (!blocks.length) return '';
    if (/^\s*```/.test(blocks[0])) return blocks.map(b => blockHtml(b, P, resolve)).join('');
    const first = blocks[0].trim();
    const { lead } = P.splitBottomLine(first, prefixes ? { prefixes } : undefined);
    const tail = first.slice(lead.length).trim();
    // One sentence is the whole answer, in regular weight: the lead is bold only when more follows (19 Oct 2026).
    if (!tail && blocks.length === 1) return `<p>${inlineHtml(lead, P, resolve)}</p>`;
    return `<p><span class="is-bottom-line">${inlineHtml(lead, P, resolve)}</span>${tail ? ' ' + inlineHtml(tail, P, resolve) : ''}</p>` + blocks.slice(1).map(b => blockHtml(b, P, resolve)).join('');
  }
  /**
   * Fact-check (Anders, 19 Oct 2026): the verdict line first, as the bottom line; then the one plain caveat or reason
   * paragraph, any further claim with its verdict word in italic; the sources as plain links. Nothing before the
   * verdict is shown (the restating opening, a first round's text before the search: P.cleanFactcheck drops them),
   * and while it streams, words that are not yet a verdict wait (the card's dots show meanwhile). An answer kept
   * before 19 Oct is cleaned the same way when it is drawn.
   */
  function factcheckHtml(text, P, { resolve = null, live = false } = {}) {
    const f = P.parseFactcheck(P.cleanFactcheck ? P.cleanFactcheck(text) : text);
    if (live && !f.verdict) return { answer: '', sources: '' };
    if (!f.lead) return { answer: '', sources: '' };
    const claims = f.claims.length ? `<div class="mr-claims">${f.claims.map(c => `<p>${c.verdict && c.verdict !== P.NOTE ? `<span class="mr-verdict">${esc(c.verdict)}</span> ` : ''}${inlineHtml(c.text, P, resolve)}</p>`).join('')}</div>` : '';
    // The sources as a labelled row of links (night run final, 16 Oct: the bare titles read as a raw tail), their titles tidied (sourceTitle).
    const sources = f.sources.length ? `<div class="mr-sources"><span class="mr-sources__label">Sources</span>${f.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join('')}</div>` : '';
    const verdict = `<div class="mr-answer"><p><span class="is-bottom-line">${inlineHtml(f.lead, P, resolve)}</span></p></div>`;
    return { answer: verdict + claims, sources };
  }
  /**
   * An answer as a card shows it: never a sentence about the passage picture (full battery on train 3), except in a
   * figure's card, whose picture is its subject; Explain without its template lines (recheck-1 and the night run's
   * final round, 16 Oct); Counterpoint without the "strongest objection … author's best reply" template; and no
   * answer referring back to its own earlier replies (morning retest, 16 Oct). The parsers' twins (margin-parse.js).
   */
  function cleanAnswer(kind, text, P) {
    let t = String(text || '');
    if (!P) return t;
    if (kind !== 'figure' && P.withoutPictureTalk) t = P.withoutPictureTalk(t);
    if (kind === 'explain' && P.withoutTemplateTalk) t = P.withoutTemplateTalk(t);
    if (kind === 'counterpoint' && P.counterpointAnswer) t = P.counterpointAnswer(t);
    if (P.withoutSelfReference) t = P.withoutSelfReference(t);
    return t;
  }
  /** The words a folded card shows (two lines of them): plain, no tags. */
  function foldText(card, P) {
    const plain = t => String(t || '').replace(/\{[^{}\n]{1,40}\}/g, m => (P.parseCitations(m)[0]?.type === 'cite' ? '' : m)).replace(/\*\*/g, '').replace(/(^|[^\w*])\*(?=[^\s*])([^*\n]{0,200}?[^\s*])\*(?![\w*])/g, '$1$2').replace(/^\s*Sources:.*$/gim, '').replace(/```/g, '').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
    if (card.kind === 'note') return plain(card.note);
    if (card.kind === 'define') { const d = card.data || {}; return plain(d.inText || (d.senses || [])[0]?.text || d.line || '') }
    if (card.kind === 'quiz') {
      const q = card.data || {};
      if (q.done) return quizLine(q);
      return plain(q.questions?.[q.i || 0]?.q || '');
    }
    const answer = (card.turns || []).find(t => t.role === 'assistant');
    // Related, folded: its bottom line (the label says how many places).
    if (card.kind === 'related' && answer && P.parseRelated) return plain(P.parseRelated(answer.content).lead);
    // Fact-check, folded: its verdict line and what follows it (nothing before the verdict; 19 Oct 2026).
    if (card.kind === 'factcheck' && answer) { const f = P.parseFactcheck(P.cleanFactcheck ? P.cleanFactcheck(answer.content) : answer.content); if (f.verdict && f.lead) return plain([f.lead, ...f.claims.map(c => (c.verdict ? c.verdict + ' ' : '') + c.text)].join(' ')) }
    if (card.kind === 'figure' && !answer) return plain(card.text);
    if (card.kind === 'simplify' && answer && P.simplifyAnswer) { const s = P.simplifyAnswer(answer.content, card.text); return s.unchanged ? SIMPLIFY_UNCHANGED : plain(s.text) }
    return plain(cleanAnswer(card.kind, answer?.content || '', P));
  }
  /**
   * A unit's actions (Anders, 19 Oct 2026, evening; the wide column), as the book reader's chapter pills look and behave
   * (src/lab/LabChapterEnd.tsx, LabChapterHeading.tsx): at its start Primer (Before you start) and Catch me up; at its
   * end Recap, Quiz me and Note (the reader's own note on it). The companion's carry its mark (✧); the note does not.
   * Each opens a margin card. o: { unit (its key), name (its phrase, for screen readers), open (the open pill's id) }.
   * They sit in the unit's marks (markHtml).
   */
  const PILLS = { primer: 'Primer', catchup: 'Catch me up', recap: 'Recap', quiz: 'Quiz me', note: 'Note' };
  const PILL_SETS = { start: ['primer', 'catchup'], end: ['recap', 'quiz', 'note'] };
  function pillsHtml(where, o = {}) {
    const label = { primer: `Before you start: ${o.line || ''}`.trim(), catchup: `Catch me up on what came before ${o.name || 'this chapter'}`, recap: `Recap ${o.name || 'this chapter'}`, quiz: `Quiz me on ${o.name || 'this chapter'}`, note: `Note on ${o.name || 'this chapter'}` };
    return PILL_SETS[where].map(id => `<button type="button" class="mr-pill${id === 'note' ? ' is-note' : ''}" data-pill="${id}" aria-label="${esc(label[id])}" aria-expanded="${o.open === id}"${id === 'primer' ? ' title="Before you start (B)"' : ''}><span>${id === 'note' ? '' : '<span class="mr-pill__mark" aria-hidden="true">✧</span>'}${PILLS[id]}</span></button>`).join('');
  }
  /**
   * A unit's mark on the wide column (Anders's mockup, 19 Oct 2026, night): a margin item that scrolls with the page, its
   * hairline rule level with the top of the unit's heading (start) or of its last line (end). "Starting" or "End of",
   * the unit's name and its pages, then its actions (pillsHtml). o: { name, pages ("pp. 10–18"), open, phrase, line }.
   */
  function markHtml(where, o = {}) {
    const pages = o.pages ? ` <small class="mr-unit__pages">${esc(o.pages)}</small>` : '';
    return `<span class="mr-unit__k">${where === 'start' ? 'Starting' : 'End of'}</span><span class="mr-unit__n">${esc(o.name || '')}${pages}</span><div class="mr-unit__acts">${pillsHtml(where, { open: o.open, name: o.phrase, line: o.line })}</div>`;
  }
  /** A unit's name in its marks and the chapter menu: its title as printed, a band's without its pages ("Pages 11–20" stays). */
  function unitName(unit, whole = '') {
    if (!unit || unit.key === 'all' || !unit.title) return whole;
    return unit.pages ? unit.title : unit.title.replace(/, pages \d+–\d+$/, '');
  }
  /** What a Simplify card says when the answer was only the passage again. */
  const SIMPLIFY_UNCHANGED = 'This passage is already in plain words.';
  const quizScore = q => (q.results || []).filter(r => r && r.verdict === 'right' && !r.shown).length;
  /**
   * The end card's line: right answers of the questions answered. "Show answer" questions are not
   * scored (FIXES-2026-10-15, deep test): "2 of 3", or "1 of 2 answered, 1 shown".
   */
  function quizLine(q) {
    const n = q.questions?.length || 0, shown = (q.results || []).slice(0, n).filter(r => r && r.shown).length;
    if (!shown) return `${quizScore(q)} of ${n}`;
    return shown < n ? `${quizScore(q)} of ${n - shown} answered, ${shown} shown` : `${shown} of ${n} shown`;
  }
  /** The question to reread after a quiz: "not yet" first, then "nearly", then one whose answer was shown; -1 when all were right. */
  function quizReread(q) {
    const rs = q.results || [];
    const rank = r => (!r ? 3 : r.shown ? 2 : r.verdict === 'not_yet' ? 0 : r.verdict === 'nearly' ? 1 : 9);
    let best = -1;
    (q.questions || []).forEach((_, i) => { if (rank(rs[i]) < 9 && (best < 0 || rank(rs[i]) < rank(rs[best]))) best = i });
    return best;
  }
  /**
   * A card's label: its action and page ("Ask · p. 12"); Define names its word; a note is "Your note".
   * `unit` names the place for a file without pages ("ch." for an EPUB's chapter).
   */
  function cardLabel(card, pageLabel, { unit = 'p.', doc = 'pdf' } = {}) {
    if (card.kind === 'whole') return wholeName(doc);
    if (card.kind === 'note') return KINDS.note;
    if (card.kind === 'define') return `${KINDS.define} · ${card.data?.word || card.text}`;
    if (card.data?.unit) return `${PILLS[card.data.pill] || KINDS[card.kind]} · ${card.data.unit.label || wholeName(doc)}`;
    // A figure's card: its caption's own label ("Figure 2 · p. 3"), else what it is.
    if (card.kind === 'figure') return `${card.data?.label || KINDS[card.data?.region] || KINDS.figure}${pageLabel ? ` · ${unit} ${pageLabel}` : ''}`;
    return `${KINDS[card.kind] || KINDS.explain}${pageLabel ? ` · ${unit} ${pageLabel}` : ''}`;
  }
  /** Related, folded: "Related · 3 places" (PROMPTS.md); null while it has no answer. */
  function relatedFoldLabel(card, P) {
    const answer = (card.turns || []).find(t => t.role === 'assistant');
    if (!answer || !P.parseRelated) return null;
    const n = P.parseRelated(answer.content).rows.length;
    return n ? `${KINDS.related} · ${n} ${n === 1 ? 'place' : 'places'}` : null;
  }
  /**
   * Related's places (PROMPTS.md): one row each, its citation tag on the left, then its line. A row
   * whose place resolves is a button (data-page, data-needle; an EPUB's quoted words in data-quote);
   * one that does not is plain text with its citation as written.
   */
  function relatedHtml(text, P, { resolve = null, place = null } = {}) {
    const r = P.parseRelated(text);
    if (!r.lead) return '';
    const rows = r.rows.map(row => {
      const target = row.cite ? (resolve ? resolve(row.cite) : null) : row.quote && place ? place(row.quote) : null;
      // A book's place is its quoted words, in italics at the line's start (they wrap with it); a PDF's, its tag.
      const lead = row.cite ? `<span class="mr-cite mr-related__tag">${esc(citeText(row.cite))}</span>` : row.quote ? `<span class="mr-related__quote">“${esc(cut(row.quote, 60))}”</span> ` : '';
      const inner = `${lead}<span class="mr-related__line">${inlineHtml(row.text, P, resolve)}</span>`;
      const cls = `mr-related__row${row.quote ? ' is-quote' : ''}`;
      if (!target) return `<div class="${cls}">${inner}</div>`;
      const attrs = target.page ? ` data-page="${target.page}"${target.needle ? ` data-needle="${esc(target.needle)}"` : ''}` : '';
      return `<button type="button" class="${cls}"${attrs}${row.quote ? ` data-quote="${esc(row.quote)}"` : ''}>${inner}</button>`;
    }).join('');
    return `<div class="mr-answer"><p><span class="is-bottom-line">${inlineHtml(r.lead, P, resolve)}</span></p></div>` + (rows ? `<div class="mr-related">${rows}</div>` : '');
  }
  const CARD_ICONS = {
    copy: svg('<rect x="6" y="6" width="9" height="9" rx="1.8"/><path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-6A1.5 1.5 0 0 0 3 4.5v6A1.5 1.5 0 0 0 4.5 12H6"/>'),
    mic: ICONS.mic,
    // Delete: a bin, in the copy icon's stroke (Anders, 15 Oct: every margin item can be deleted).
    trash: svg('<path d="M3.5 5h11M7.2 5V3.4h3.6V5M5 5l.8 9.6h6.4L13 5M7.6 7.8v4.4M10.4 7.8v4.4"/>'),
    // Minimise: one horizontal line, in the same stroke (Anders, 19 Oct 2026, as Gloss: the card folds, nothing is deleted).
    minimise: svg('<path d="M4.5 9h9"/>'),
    // Send: the selection bar's up-arrow, in the same stroke (Anders, 19 Oct 2026, as Gloss's follow-up field).
    send: ICONS.up,
  };
  /**
   * The follow-up line: a rounded, bordered field that is always visible, with its placeholder ("Ask a follow-up"),
   * the mic inside it on the right and then the send button, an up-arrow that is enabled once there is text (Anders,
   * 19 Oct 2026: "it's too hidden that this is indeed a chat field. Gloss does better"). Enter sends, as before; the
   * caret shows only when the field has the focus (15 Oct). An optional link ("Show answer") goes under the field.
   * A card's bin is in its action row under the answer, beside copy (cardHtml), not here.
   */
  function followHtml({ link = '', field = true, label = 'Follow up', placeholder = 'Ask a follow-up' } = {}) {
    if (!field && !link) return '';
    const box = field ? `<div class="mr-follow__box"><span class="mr-follow__field"><textarea class="mr-follow__input" rows="1" enterkeyhint="send" placeholder="${esc(placeholder)}" aria-label="${esc(label)}"></textarea></span><button type="button" class="mr-follow__mic" data-c="mic" aria-label="Dictate" aria-pressed="false">${CARD_ICONS.mic}</button><button type="button" class="mr-follow__send" data-c="send" aria-label="Send" disabled>${CARD_ICONS.send}</button></div>` : '';
    return `<div class="mr-follow${field ? ' has-field' : ''}">${box}${link}</div>`;
  }
  /**
   * A card. Folded: its label and two lines. Open: the label and close, the passage quote, the
   * question bubble (Ask), the answer, the action's own parts, copy, and the follow-up line.
   * o: { open, P (parsers), resolve (citation -> target), pageLabel, status (a status line such as
   * "Checking sources…"), live (an answer on its way), pending (a quiz answer being marked),
   * writing (Quiz me's questions are still arriving: there will be three) }.
   */
  function cardHtml(card, o) {
    const P = o.P, label = esc(cardLabel(card, o.pageLabel, o.where));
    if (!o.open) return `<button type="button" class="mr-card__label" data-c="open">${card.kind === 'related' ? esc(relatedFoldLabel(card, P) || cardLabel(card, o.pageLabel, o.where)) : label}</button><div class="mr-card__text">${esc(foldText(card, P))}</div>`;
    const q = card.data || {};
    const count = card.kind === 'quiz' && q.questions?.length && !q.done ? `<span class="mr-card__count">${(q.i || 0) + 1} of ${o.writing ? 3 : q.questions.length}</span>` : '';
    // Its top-right control minimises it (folds it, as a click outside does).
    const head = `<div class="mr-card__label"><span class="mr-card__name">${label}</span>${count}<button type="button" class="mr-card__close" data-c="close" aria-label="Minimise">${CARD_ICONS.minimise}</button></div>`;
    // The action row under the answer, as Gloss's: copy, once there is something to copy, then the bin (Anders,
    // 19 Oct 2026: the bin moved out of the follow-up line into this row). There is no regenerate action for a card.
    const acts = withCopy => `<div class="mr-card__acts">${withCopy ? `<button type="button" class="mr-card__copy" data-c="copy" aria-label="Copy">${CARD_ICONS.copy}</button>` : ''}${deleteHtml(card)}</div>`;
    const status = o.status ? `<p class="mr-status" role="status">${esc(o.status)}</p>` : '';
    if (card.kind === 'quiz') {
      const qs = q.questions || [];
      let body = '', foot = '';
      if (!qs.length) body = status;
      else if (q.done) {
        const i = quizReread(q), cite = i >= 0 && qs[i].cite ? ' ' + inlineHtml(qs[i].cite, P, o.resolve) : '';
        body = `<div class="mr-answer"><p><span class="is-bottom-line">${esc(quizLine(q))}</span></p>${i >= 0 ? `<p>${esc(qs[i].q)}${cite}</p>` : ''}</div>`;
        // The end card offers another quiz on the same passage (or unit).
        foot = followHtml({ field: false, link: '<button type="button" class="mr-follow__link" data-c="again">Try another quiz</button>' });
      } else if (!qs[q.i || 0]) {
        // Answered ahead of the stream (FIXES-2026-10-15 A7): a quiet line until the next question arrives.
        body = '<p class="mr-status mr-writing" role="status">Writing the next question…</p>';
        foot = '';
      } else {
        const i = q.i || 0, item = qs[i], r = (q.results || [])[i];
        const cite = item.cite ? ' ' + inlineHtml(item.cite, P, o.resolve) : '';
        body = `<div class="mr-question">${esc(item.q)}</div>`;
        if (r) {
          body += r.shown
            ? `<div class="mr-answer"><p><span class="is-bottom-line">${esc(item.answer)}</span>${item.why ? ' ' + esc(item.why) : ''}${cite}</p></div>`
            : `<div class="mr-you">${esc(r.answer)}</div><div class="mr-answer"><p><span class="is-bottom-line">${esc(P.QUIZ_VERDICT_LINE[r.verdict])}</span>${r.feedback ? ' ' + esc(r.feedback) : ''}${cite}</p></div>`;
          // The last question once the quiz is written (a quiz whose writing stopped early ends with the questions it has, FIXES-2026-10-15 A7).
          const last = i + 1 >= qs.length && (q.ended || !o.writing);
          foot = followHtml({ field: false, link: `<button type="button" class="mr-follow__link" data-c="next">${last ? 'See your score' : 'Next question'} →</button>` });
        } else if (o.pending != null) { body += `<div class="mr-you">${esc(o.pending)}</div>${status}<p class="mr-status mr-wait"></p>`; foot = '' }
        // A marking that failed shows its error here; the reader's answer stays in the field (the reader puts it back).
        else { body += status; foot = followHtml({ label: 'Your answer', placeholder: 'Your answer', link: '<button type="button" class="mr-follow__link" data-c="show">Show answer</button>' }) }
      }
      // A quiz has nothing to copy; its action row holds the bin, unless an answer is being marked.
      return head + `<div class="mr-card__body">${body}${o.pending != null ? '' : acts(false)}</div>` + foot;
    }
    // A figure's card: the figure's thumbnail at the top (its room kept while it is drawn), then its caption.
    // Anders, 19 Oct 2026, night: on the wide column the figure is right beside its card (the leader line joins them), so
    // the card shows no picture and starts with the caption; elsewhere (narrow windows, the phone) a small one, at most
    // 120px tall, that opens the figure large. o.thumb: its picture (or '' while drawn); none given, no picture.
    const thumb = card.kind === 'figure' && o.thumb != null ? `<button type="button" class="mr-thumb" data-figview aria-label="Show ${label} larger"${o.thumbRatio ? ` style="aspect-ratio:${Number(o.thumbRatio).toFixed(3)}"` : ''}>${o.thumb ? `<img src="${esc(o.thumb)}" alt="${label}">` : ''}</button>` : '';
    // The passage is not quoted at the card's top (Anders, 19 Oct 2026): its underline in the text and the leader line
    // say what the card is about. Screen readers get it as the card's description (reader.js: aria-describedby).
    // A figure's card keeps its caption, which is what the figure says, not a quote.
    let body = thumb + (card.text && card.kind === 'figure' ? `<div class="mr-quote">${esc(cut(card.text))}</div>` : card.text && card.kind !== 'define' ? `<span class="mr-card__about" hidden>${esc(cut(card.text))}</span>` : '');
    // A margin note (or a unit's note): its words in a field, always editable; Ask turns it into a chat; the bin.
    if (card.kind === 'note' && card.free) {
      const field = `<textarea class="mr-note-edit" rows="2" placeholder="${card.unitNote ? 'A note on this chapter' : 'Write a note'}" aria-label="${card.unitNote ? 'Chapter note' : 'Note'}">${esc(card.note || '')}</textarea>`;
      return head + `<div class="mr-card__body">${field}<div class="mr-card__acts"><button type="button" class="mr-card__ask" data-c="note-ask">Ask</button>${card.draft ? '' : deleteHtml(card)}</div></div>`;
    }
    if (card.kind === 'note') body += `<div class="mr-answer is-note"><p>${esc(card.note)}</p></div>`;
    else if (card.kind === 'define') {
      const senses = q.senses || [];
      body += q.inText
        ? `<div class="mr-answer"><p class="mr-define__label">In this text</p><p><span class="is-bottom-line">${P ? inlineHtml(q.inText, P, o.resolve) : esc(q.inText)}</span></p>${senses.map(s => `<p class="mr-define__sense">${esc(s.text)}</p>`).join('')}</div>`
        : senses.length
          ? `<div class="mr-answer"><p><span class="is-bottom-line">${esc(senses[0].text)}</span></p>${senses.slice(1).map(s => `<p>${esc(s.text)}</p>`).join('')}</div>`
          : q.line ? `<div class="mr-answer"><p><span class="is-bottom-line">${esc(q.line)}</span></p></div>` : '';
    }
    const turns = [...(card.turns || [])];
    if (o.live != null) turns.push({ role: 'assistant', content: o.live });
    let answered = card.kind === 'note' || card.kind === 'define';
    // Never a sentence about the passage picture (full battery on train 3), except in a figure's card, whose picture is its subject.
    // Explain never shows its template lines, "no notation here" or "the passage is cut off" (recheck-1, 16 Oct).
    // No answer refers to its own earlier replies, and Counterpoint has no "strongest objection … author's best reply" template (16 Oct).
    // Only the card's own answer (its first) gets the card's treatment; a follow-up's reply is a chat reply: Chat's
    // cleanup (never the Explain opening's selection stripping) and plain paragraphs (Anders, 19 Oct 2026).
    const lead = turns.findIndex(t => t.role !== 'user');
    const clean = (text, k) => cleanAnswer(k === lead ? card.kind : 'chat', text, P);
    turns.forEach((t0, k) => {
      const t = t0.role === 'user' ? t0 : { ...t0, content: clean(t0.content, k) };
      if (t.role === 'user') { if (card.kind === 'ask' || card.kind === 'figure' || k > 0) body += `<div class="mr-you" data-turn="${k}">${esc(t.display || t.content)}</div>`; if (t.failed) body += `<p class="mr-status">${esc(t.failed)}</p>`; return }
      answered = true;
      if (card.kind === 'factcheck' && k <= 1) { const f = factcheckHtml(t.content, P, { resolve: o.resolve, live: o.live != null && k === turns.length - 1 }); body += f.answer + f.sources }
      else if (card.kind === 'related' && k === 0 && P.parseRelated) body += relatedHtml(t.content, P, { resolve: o.resolve, place: o.place });
      else if (card.kind === 'simplify' && k === 0 && P.simplifyAnswer) {
        // Never the passage again, never a note about the rewrite (retest after train 2): when nothing else came back, say so.
        // While it streams, a first paragraph that is the passage so far shows as written (the rewrite may follow).
        const s = P.simplifyAnswer(t.content, card.text, o.source);
        if (s.unchanged && o.live != null && k === turns.length - 1) body += `<div class="mr-answer">${answerHtml(t.content, P, { resolve: o.resolve })}</div>`;
        else body += `<div class="mr-answer">${s.unchanged ? `<p><span class="is-bottom-line">${SIMPLIFY_UNCHANGED}</span></p>` : answerHtml(s.text, P, { resolve: o.resolve })}</div>`;
      }
      else body += `<div class="mr-answer">${(k === lead ? answerHtml : replyHtml)(t.content, P, { resolve: o.resolve })}</div>`;
    });
    body += status;
    return head + `<div class="mr-card__body">${body}${acts(answered && !o.status && o.live == null)}</div>` + followHtml();
  }
  /** The "more" row: "{n} more on this page" (an EPUB: "in this chapter"), their kinds on the right. */
  function stackHtml(cards, maxKinds = Infinity, { doc = 'pdf' } = {}) {
    const all = [...new Set(cards.map(c => KINDS[c.kind]))];
    const kinds = all.slice(0, maxKinds).join(' · ');
    return `<span>${cards.length} more ${doc === 'epub' ? 'in this chapter' : 'on this page'}</span><span>${esc(kinds)}</span>`;
  }
  /** What the whole file is called: "the whole PDF", or "the whole book" for an EPUB. */
  const wholeWords = doc => (doc === 'epub' ? 'the whole book' : 'the whole PDF');
  /** A card's delete: a bin in the action row, beside copy (no confirm; the reader can undo for a few seconds). */
  const deleteHtml = card => `<button type="button" class="mr-card__delete" data-c="delete" aria-label="${card.kind === 'note' ? 'Delete note' : 'Delete'}">${CARD_ICONS.trash}</button>`;

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
      // data-turn: the question's first piece, which the thread holds near its top once it is sent (reader.js holdThread).
      if (t.role === 'user') return (t.quote ? `<div class="mr-quote" data-turn="${row.index}">${esc(cut(t.quote))}</div>` : '') + (t.extra || '') + `<div class="mr-you" data-turn="${row.index}">${esc(t.text)}</div>` + (t.note ? `<p class="mr-status">${esc(t.note)}</p>` : '');
      return t.text ? `<div class="mr-answer">${replyHtml(cleanAnswer('chat', t.text, o.P), o.P, { resolve: o.resolve })}</div>` : '';
    }).join('');
  }
  /**
   * Chat: the conversation about the whole file (the t menu's Chat, or "/"), the thread, the
   * attachments waiting to go, the follow-up line. It is the margin's Chat card (Anders, 15 Oct: the
   * column's whole-PDF line is gone; questions about the whole document go through Chat).
   */
  // On the phone the chat's card has no label (mockup 5D): swipe down or tap the page to close it.
  function wholeHtml(body, { open = true, fold = '', tray = '', label = true, doc = 'pdf' } = {}) {
    if (!open) return `<button type="button" class="mr-card__label" data-c="open">${KINDS.chat}</button><div class="mr-card__text">${esc(fold)}</div>`;
    return (label ? `<div class="mr-card__label"><span class="mr-card__name">${KINDS.chat}</span><button type="button" class="mr-card__close" data-c="close" aria-label="Close">×</button></div>` : '') + `<div class="mr-card__body">${body}</div>${tray}` + followHtml({ label: `Ask about ${wholeWords(doc)}`, placeholder: `Ask about ${wholeWords(doc)}` });
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
   * with `page` its 1-based page (null when it does not resolve), and optionally `items`, its own
   * entries in the same shape. A part whose entries are chapters ("I Tabular Solution Methods" over
   * "2 Multi-armed Bandits", …) gives its chapters as units, so a book's unit is the chapter the reader
   * is in, never a part of five chapters (FIXES-2026-10-15, long books, item 9). Entries are kept in
   * page order; a second entry on the same page as the one before is left out. The first unit also
   * takes any pages before its entry (a title page), so the PDF's start offers it too. Each unit's key
   * is "outline-{i}" (its index in the outline; "outline-{i}.{j}" for a part's chapter j), "all" for
   * the whole file: a PDF without an outline, or one of fewer than 40 pages (FIXES-2026-10-15, B2).
   * Front and back matter (Contents, Preface, References, Index, …) carry `matter: 'front' | 'back'`.
   * A chapter whose title is only its number and name ("1 Introduction to Information Theory", "1 ·
   * Introduction …") carries `chapter` (its number) and `label` ("Chapter 1: Introduction to
   * Information Theory"), so it is named as that chapter (Anders, 15 Oct, MacKay): a part's chapters,
   * an entry marked `kind: 'chapter'` (a printed contents' chapters, js/pdf-scan.js), or any such
   * entry in a book of 100 pages or more.
   * -> [{ key, title, from, start, to, matter?, chapter?, label? }] (start: the entry's own page; the trigger shows from `from` to `start`)
   */
  function primerUnits(entries, count) {
    const n = Math.max(1, Number(count) || 1);
    const clean = (e, key) => ({ key, title: String(e?.title || '').replace(/\s+/g, ' ').trim().slice(0, 300), page: e?.page, ...(e?.kind === 'chapter' ? { chapter: true } : {}) });
    const flat = [];
    (entries || []).forEach((e, i) => {
      const kids = Array.isArray(e?.items) ? e.items.map((c, j) => clean(c, `${i}.${j}`)).filter(c => c.title && Number.isInteger(c.page)) : [];
      if (isPart(clean(e, ''), kids)) {
        // The part's own pages before its first chapter (its title page) go with that chapter.
        kids.forEach((c, j) => flat.push({ ...c, chapter: true, i: flat.length, page: j === 0 && Number.isInteger(e.page) ? Math.min(e.page, c.page) : c.page, start: c.page }));
      } else flat.push({ ...clean(e, String(i)), i: flat.length });
    });
    const list = flat.filter(e => e.title && Number.isInteger(e.page) && e.page >= 1 && e.page <= n)
      .sort((a, b) => a.page - b.page || a.i - b.i)
      .filter((e, k, all) => k === 0 || e.page !== all[k - 1].page);
    if (!list.length || n < PRIMER.units) return [{ key: 'all', title: '', from: 1, start: 1, to: n }];
    return list.map((e, k) => {
      const matter = matterOf(e.title);
      const start = Number.isInteger(e.start) && e.start <= n ? e.start : e.page;
      const named = !matter && (e.chapter || n >= 100) ? numberedChapter(e.title) : null;
      return { key: 'outline-' + e.key, title: e.title, from: k === 0 ? 1 : e.page, start, to: k + 1 < list.length ? list[k + 1].page - 1 : n, ...(matter ? { matter } : {}), ...(named ? { chapter: named.n, label: `Chapter ${named.n}: ${named.name}` } : {}) };
    });
  }
  /**
   * For a PDF without an outline: the chapters its scan found (js/pdf-scan.js entries, `nav` how they
   * were found) as primerUnits' entries: the top-level ones, a part with its chapters as items, each
   * chapter marked as one. From the printed contents always; from headings found by size only when
   * they are chapter-sized (five pages each or more on average), never a book's every section.
   * -> [{ title, page, kind?, items }]
   */
  function scanEntries(list, nav, count) {
    list = Array.isArray(list) ? list : [];
    if (!list.length || (nav !== 'contents' && nav !== 'headings')) return [];
    if (nav === 'headings' && (Number(count) || 0) / list.length < 5) return [];
    const entry = e => ({ title: e.label, page: e.page, ...(e.kind === 'chapter' ? { kind: 'chapter' } : {}) });
    return list.filter(e => !e.parent).map(e => ({ ...entry(e), items: list.filter(c => c.parent === e.id).slice(0, 60).map(entry) }));
  }
  /** A chapter's title that is its number and its name: "1 Introduction", "12. Rates", "3 · Inference" -> { n, name }; else null. */
  function numberedChapter(title) {
    const m = /^(\d{1,3})(?:\s*[.:·—–-]\s*|\s+)(\S.*)$/u.exec(String(title || '').trim());
    return m && !/^\d/.test(m[2]) ? { n: m[1], name: m[2].trim() } : null;
  }
  /**
   * A long PDF with no chapters to go by (no outline, no printed contents) and too long to send
   * whole: blocks of `size` pages, each its own unit ("pages 1–40"), the same blocks the margin's
   * document uses (reader.js docRange), so a primer never claims to cover the whole PDF.
   */
  function primerBlocks(count, size = PRIMER.units) {
    const n = Math.max(1, Number(count) || 1), out = [];
    for (let from = 1; from <= n; from += size) {
      const to = Math.min(n, from + size - 1);
      out.push({ key: `pages-${from}`, title: `Pages ${from}–${to}`, from, start: from, to, pages: true });
    }
    return out;
  }
  /**
   * Reading units sized for Primer, Catch me up, Recap and Quiz me (Anders, 19 Oct 2026: "rarely will you want a recap
   * of a paragraph nor of a full book"). `entries`: the outline's (or the scan's) headings, each { title, page, kind?,
   * items? } with `items` the next heading level, to any depth; a flat outline numbered "1", "1.1", "2" … is nested by
   * its numbers. `count`: the file's pages. The rule, in pages (UNIT_SIZE):
   *  - the top-level headings are the units (a part whose entries are chapters gives its chapters, as primerUnits);
   *  - a unit longer than `split` (30) is split at its next heading level, again as needed; with no headings under it,
   *    into bands of about `band` (10) pages ("Chapter 3, pages 41–50");
   *  - a unit shorter than `min` (2) joins its shorter neighbour (front or back matter only joins matter, unless it has
   *    no page of its own);
   *  - with no usable headings, bands of `band` pages ("Pages 11–20"), the last taking a tail of `min` pages or fewer;
   *    a file of `band` + `min` pages or fewer is one unit, "all".
   * The aim is units of about 3–25 pages. Each unit runs from its heading's page to the page before the next one's; the
   * first also takes the pages before its heading (from 1, `start` its heading's page). Keys follow the outline's
   * ("outline-2", "outline-2.1"), a joined unit's both ends ("outline-0_1"), a band its first page ("outline-3-p41",
   * "pages-11"); all are keys the Worker's storage accepts.
   * -> [{ key, title, from, start, to, matter?, chapter?, label?, parts?, pages? }]
   */
  const UNIT_SIZE = { min: 2, split: 30, band: 10 };
  const SECTION_NO = /^(\d{1,3}(?:\.\d{1,3})*)\.?(?=\s|$)/;
  function sizeUnits(entries, count, opts = {}) {
    const S = { ...UNIT_SIZE, ...opts }, n = Math.max(1, Number(count) || 1);
    const cleanTitle = t => String(t || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const size = u => u.to - u.from + 1;
    // The headings as a tree: unresolved entries give way to their own entries; flat numbering nested.
    const tree = (list, prefix) => {
      const out = [];
      (Array.isArray(list) ? list : []).forEach((e, i) => {
        const key = prefix + i, items = tree(e?.items, key + '.'), title = cleanTitle(e?.title), page = e?.page;
        if (!title || !Number.isInteger(page) || page < 1 || page > n) { out.push(...items); return }
        out.push({ key, title, page, chapter: e?.kind === 'chapter', items });
      });
      return nest(out);
    };
    const nest = list => {
      const out = [], stack = [];
      for (const node of list) {
        const num = SECTION_NO.exec(node.title)?.[1];
        if (num) {
          while (stack.length && !num.startsWith(stack[stack.length - 1].num + '.')) stack.pop();
          if (stack.length) { stack[stack.length - 1].node.items.push(node); stack.push({ num, node }); continue }
          stack.push({ num, node });
        } else stack.length = 0;
        out.push(node);
      }
      for (const node of out) node.items.sort((a, b) => a.page - b.page);
      return out;
    };
    let top = tree(entries, '');
    // A part whose entries are chapters gives its chapters (its own pages before the first go with the first).
    top = top.flatMap(e => (isPart(e, e.items) ? e.items.map((c, j) => ({ ...c, chapter: true, page: j === 0 ? Math.min(e.page, c.page) : c.page, start: c.page })) : [e]));
    const bands = (from, to, base) => {
      const out = [];
      for (let a = from; a <= to; a += S.band) {
        let b = Math.min(to, a + S.band - 1);
        if (to - b <= S.min) b = to;
        out.push({ ...base(a, b), from: a, start: a, to: b });
        if (b === to) break;
      }
      return out;
    };
    if (!top.length) {
      if (n <= S.band + S.min) return [{ key: 'all', title: '', from: 1, start: 1, to: n }];
      return bands(1, n, (a, b) => ({ key: `pages-${a}`, title: `Pages ${a}–${b}`, pages: true }));
    }
    // Headings in page order over [lo, hi], each running to the page before the next (a heading sharing its page with
    // the next one has no page of its own: it joins a neighbour below).
    const lay = (nodes, lo, hi) => {
      const list = nodes.map((nd, i) => ({ nd, i })).filter(({ nd }) => nd.page <= hi).sort((a, b) => a.nd.page - b.nd.page || a.i - b.i).map(({ nd }) => nd);
      let units = list.map((nd, k) => {
        const page = Math.max(lo, nd.page);
        return { key: 'outline-' + nd.key, title: nd.title, nd, from: k === 0 ? lo : page, start: Math.max(lo, Number.isInteger(nd.start) ? nd.start : page), to: k + 1 < list.length ? Math.max(lo, list[k + 1].page) - 1 : hi };
      });
      // Too long: split at the next heading level, or into bands.
      units = units.flatMap(u => {
        if (size(u) <= S.split) return [u];
        const kids = u.nd.items.filter(c => c.page >= u.from && c.page <= u.to);
        if (kids.length && !(kids.length === 1 && kids[0].page <= u.start)) {
          const subs = lay(kids, u.from, u.to);
          // The pages between the heading and its first section go with the first section; the heading stays its own when it has pages of its own.
          if (subs.length && u.start < subs[0].start && subs[0].start - u.start >= S.min) return [{ ...u, to: subs[0].start - 1 }, ...subs.map((s, i) => (i === 0 ? { ...s, from: subs[0].start } : s))];
          return subs;
        }
        // No headings under it: kept whole up to twice the limit (a 31-page chapter is still one chapter), else bands.
        if (size(u) <= S.split * 2) return [u];
        return bands(u.from, u.to, (a, b) => ({ key: `${u.key}-p${a}`, title: `${u.title}, pages ${a}–${b}`, base: u.title, nd: { ...u.nd, items: [] }, banded: true }));
      });
      return units;
    };
    let units = lay(top, 1, n);
    units.forEach(u => { u.matter = matterOf(u.title) });
    // Too short: joined to the shorter neighbour (the later one when they are as long), until none is.
    for (let k; (k = units.findIndex((u, i) => size(u) < S.min && joinable(i))) >= 0;) {
      const u = units[k], prev = units[k - 1], next = units[k + 1];
      const ok = o => o && (size(u) <= 0 || !!o.matter === !!u.matter);
      const into = ok(prev) && ok(next) ? (size(prev) < size(next) ? k - 1 : k + 1) : ok(next) ? k + 1 : k - 1;
      const [a, b] = into < k ? [units[into], u] : [u, units[into]];
      // Named for the part that is not front or back matter (a conclusion sharing its page with the references), else the longer.
      const lead = !!a.matter !== !!b.matter ? (a.matter ? b : a) : size(b) > size(a) ? b : a;
      const joined = { ...lead, key: a.key.split('_')[0] + '_' + b.key.replace(/^outline-/, '').split('_').pop(), from: a.from, start: a.start, to: b.to, matter: a.matter && b.matter ? lead.matter : null, head: a.head || a.title, parts: [...(a.parts || [a.title]), ...(b.parts || [b.title])] };
      units.splice(Math.min(k, into), 2, joined);
    }
    function joinable(i) {
      const u = units[i], ok = o => o && (size(u) <= 0 || !!o.matter === !!u.matter);
      return ok(units[i - 1]) || ok(units[i + 1]);
    }
    if (units.length === 1 && units[0].from === 1 && units[0].to === n && n <= S.split && !units[0].title) return [{ key: 'all', title: '', from: 1, start: 1, to: n }];
    return units.map(u => {
      const named = !u.matter && !u.parts && (u.nd?.chapter || n >= 100) ? numberedChapter(u.banded ? u.base : u.title) : null;
      const band = u.banded ? `, pages ${u.from}–${u.to}` : '';
      return { key: u.key.slice(0, 64), title: u.title, from: u.from, start: Math.min(Math.max(u.start, u.from), u.to), to: u.to, ...(u.matter ? { matter: u.matter } : {}), ...(named ? { chapter: named.n, label: `Chapter ${named.n}: ${named.name}${band}` } : {}), ...(u.banded ? { band: true, head: u.base } : {}), ...(u.parts ? { parts: u.parts, head: u.head } : {}) };
    });
  }
  /** The scan's chapters and headings (js/pdf-scan.js entries: { id, label, page, kind, parent }) as sizeUnits' entries, nested by parent. */
  function scanTree(list) {
    list = Array.isArray(list) ? list.filter(e => e && Number.isInteger(e.page)) : [];
    const kids = id => list.filter(e => (e.parent ?? null) === id).slice(0, 200).map(e => ({ title: e.label, page: e.page, ...(e.kind === 'chapter' ? { kind: 'chapter' } : {}), items: e.id != null && e.id !== id ? kids(e.id) : [] }));
    return kids(null);
  }
  // A part's own entries are chapters: numbered "2 …" or "Chapter 2 …" (not sections such as "2.1 …").
  const CHAPTER_TITLE = /^(?:(?:chapter|lecture)\s+[\p{L}\p{N}]+[.:]?|\d{1,3}\.?)\s+\S/iu;
  const PART_TITLE = /^(?:(?:part|book|volume)\s+[\p{L}\p{N}]+|[IVXLC]{1,6}\.?)(?=$|[\s.:—–-])/u;
  function isPart(entry, kids) {
    if (kids.length < 2) return false;
    const chapters = kids.filter(c => CHAPTER_TITLE.test(c.title) && !/^\d+\.\d/.test(c.title)).length;
    return chapters >= Math.ceil(kids.length * 0.6) || (PART_TITLE.test(entry.title) && /^(?:[Pp]art\b|[IVXLC]{1,6}\.?\s)/.test(entry.title));
  }
  // Front and back matter, by title: never the subject of a primer (an index's primer, the Gloss test of 15 Oct).
  const FRONT_MATTER = /^(?:contents|table of contents|brief contents|preface|foreword|prologue|acknowledge?ments?|dedication|(?:summary of |list of )?notations?|list of (?:figures|tables|symbols|abbreviations|illustrations)|abbreviations|about (?:the|this) (?:author|authors|book|edition)|copyright|title page|half[- ]title|frontispiece|epigraph|cover|praise for)\b/i;
  const BACK_MATTER = /^(?:(?:subject |author |name |general )?index|references|bibliography|works cited|literature cited|further reading|sources|glossary|notes|endnotes|colophon|about the authors?)\b/i;
  function matterOf(title) {
    const t = String(title || '').replace(/^\s*(?:\d+(?:\.\d+)*\.?|[IVXLC]+\.)\s+/, '').trim();
    return FRONT_MATTER.test(t) ? 'front' : BACK_MATTER.test(t) ? 'back' : null;
  }
  /**
   * What a page's own text says it is, for units whose title does not: an index (most lines end in
   * page numbers: "Sarsa, 129, 131–133"), a reference list (most lines carry a year and read as
   * citations) or a contents page (most lines end in dot leaders and a number). -> 'index' |
   * 'references' | 'contents' | null
   */
  function pageMatter(text) {
    const lines = String(text || '').split(/\n+/).map(l => l.trim()).filter(l => l.length > 2);
    if (lines.length < 8) return null;
    const share = re => lines.filter(l => re.test(l)).length / lines.length;
    if (share(/(?:\.\s*){3,}\s*(?:\d{1,4}|[ivxlc]{1,6})$/i) >= 0.5) return 'contents';
    if (share(/^[^\d].{1,80}?,\s*\d{1,4}(?:\s*[–-]\s*\d{1,4})?(?:,\s*\d{1,4}(?:\s*[–-]\s*\d{1,4})?)*\.?$/) >= 0.55) return 'index';
    if (share(/(?:\(\s*(?:1[6-9]|20)\d\d[a-z]?\s*\)|\b(?:1[6-9]|20)\d\d[a-z]?\.)/) >= 0.4 && share(/^(?:\[\d+\]|\p{Lu}[\p{L}'’-]+,\s+\p{Lu}\.)/u) >= 0.3) return 'references';
    return null;
  }
  /**
   * The unit Before you start is about on `page`: the unit the page is in, unless that is front or
   * back matter (by title, or `matter` set from its text); then the nearest real unit, the earlier
   * one when two are as near. A PDF of one unit, or one that is all matter, keeps unitAt's unit.
   */
  function primerUnitAt(units, page) {
    const here = unitAt(units, page);
    if (!here || !here.matter) return here;
    const real = (units || []).filter(u => !u.matter);
    if (!real.length) return here;
    const gap = u => (page < u.from ? u.from - page : page > u.to ? page - u.to : 0);
    return real.reduce((best, u) => (gap(u) < gap(best) ? u : best));
  }
  /** The unit a page is in. */
  const unitAt = (units, page) => (units || []).find(u => page >= u.from && page <= u.to) || (units || [])[0] || null;
  /** True on the pages where the trigger is offered: the unit's start (and any pages before it). */
  const atUnitStart = (unit, page) => !!unit && page >= unit.from && page <= unit.start;
  /**
   * How the trigger names its unit ("a map of chapter 1."): a numbered chapter, part or section as
   * "chapter 1" (a unit primerUnits found to be a chapter, too: "1 Introduction …" in a book), a block
   * of a long file without chapters as "pages 41–80", the whole file as "the whole PDF", any other heading as a phrase with "the", its
   * own number dropped and its capitalised words lowercased ("1 Introduction" -> "the introduction";
   * acronyms such as "BLEU" stay as printed).
   */
  function unitPhrase(unit) {
    if (!unit || unit.key === 'all' || !unit.title) return 'the whole PDF';
    // A band of a long chapter without sections (sizeUnits): "pages 71–80 of chapter 3".
    if (unit.band) return `pages ${unit.from}–${unit.to} of ${unitPhrase({ ...unit, band: false, title: unit.head || unit.title.replace(/, pages \d+–\d+$/, '') })}`;
    if (unit.chapter) return `chapter ${unit.chapter}`;
    if (unit.pages) return `pages ${unit.from}–${unit.to}`;
    const m = /^(chapter|part|section|lecture|unit|book|appendix)\s+([\p{L}\p{N}]+(?:\.\d+)*)(?=$|[\s.:,;—–-])/iu.exec(unit.title);
    if (m) return `${m[1].toLowerCase()} ${m[2]}`;
    const words = unit.title.replace(/[.:;,]+$/, '').replace(/^\s*(?:\d+(?:\.\d+)*\.?|[IVXLC]+\.|[A-Z]\.)\s+(?=\S)/u, '').trim()
      .split(/\s+/).map(w => (/^\p{Lu}[\p{Ll}'’-]*$/u.test(w) ? w.toLowerCase() : w));
    if (/^(the|a|an)$/i.test(words[0] || '')) words[0] = words[0].toLowerCase();
    return (/^(the|a|an)$/.test(words[0]) ? '' : 'the ') + words.join(' ');
  }
  /**
   * The chapters, sections, parts or appendices a question names ("chapters 7 and 10", "section 3.2",
   * "Part II", "appendix A"), in order, at most four. -> [{ kind, n }] (n as written, lowercased)
   */
  const REF_WORD = { chapter: 'chapter', chapters: 'chapter', ch: 'chapter', chs: 'chapter', section: 'section', sections: 'section', sec: 'section', secs: 'section', '§': 'section', part: 'part', parts: 'part', appendix: 'appendix', appendices: 'appendix', lecture: 'lecture', lectures: 'lecture' };
  const UNIT_REF = /(^|[^\p{L}])(chapters?|chs?\.?|sections?|secs?\.?|§|parts?|appendix|appendices|lectures?)\s*((?:\d+(?:\.\d+)*|[ivxlc]{1,6}|[a-z])(?![\p{L}\p{N}])(?:\s*(?:,|and|&|or|to|–|-)\s*(?:\d+(?:\.\d+)*|[ivxlc]{1,6}|[a-z])(?![\p{L}\p{N}]))*)/giu;
  function chapterRefs(question) {
    const out = [];
    for (const m of String(question || '').matchAll(UNIT_REF)) {
      const kind = REF_WORD[m[2].toLowerCase().replace(/\.$/, '')];
      for (const n of m[3].split(/\s*(?:,|and|&|or|to|–|-)\s*/i)) {
        const v = n.trim().toLowerCase();
        // A number, a roman numeral or (appendix, part) one letter; never a word ("chapter about").
        if (!v || !(/^\d+(?:\.\d+)*$/.test(v) || /^[ivxlc]{1,6}$/.test(v) || (/^[a-z]$/.test(v) && (kind === 'appendix' || kind === 'part')))) continue;
        if (!out.some(r => r.kind === kind && r.n === v)) out.push({ kind, n: v });
        if (out.length >= 4) return out;
      }
    }
    return out;
  }
  /**
   * The contents entries a question names (chapterRefs): `entries` are [{ title, page }] (the contents,
   * the outline). "chapter 7" is the entry titled "Chapter 7 …" or "7 …" (not "7.1 …"); "section 3.2"
   * the one titled "3.2 …"; "part II" "Part II …" or "II …"; "appendix A" "Appendix A …" or "A …".
   * -> [{ title, page, kind, n }], one per reference that is found, in the question's order.
   */
  function namedUnits(question, entries) {
    const list = (entries || []).filter(e => e && e.title && Number.isInteger(e.page));
    const esc_ = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const out = [];
    for (const r of chapterRefs(question)) {
      const n = esc_(r.n), word = r.kind === 'section' ? '(?:section|sec\\.?|§)' : r.kind;
      const own = new RegExp(`^\\s*${word}\\s+${n}(?![\\p{L}\\p{N}]|\\.\\d)`, 'iu');
      const bare = r.kind === 'chapter' || r.kind === 'section' || r.kind === 'part' || r.kind === 'appendix' ? new RegExp(`^\\s*${n}(?:[.:]|\\s)(?!\\d)\\s*\\S`, 'iu') : null;
      const hit = list.find(e => own.test(e.title)) || (bare && list.find(e => bare.test(e.title)));
      if (hit && !out.some(o => o.page === hit.page)) out.push({ title: hit.title, page: hit.page, kind: r.kind, n: r.n });
    }
    return out;
  }
  /** The question without the references it names ("What do chapters 7 and 10 say?" -> "What do say?"), for the search. */
  const withoutRefs = question => String(question || '').replace(UNIT_REF, '$1').replace(/\s+/g, ' ').replace(/\s+([?.!,;:])/g, '$1').trim();
  /**
   * Before you start opening in place (Anders, 15 Oct: "it should just expand"): the open primer starts
   * where its trigger is (`from`: the trigger's top and height in the column, or null when it is not
   * shown) and grows down to PRIMER.bottom above the column's foot. With less than `min` room below the
   * trigger it starts higher, as little as needed, never above PRIMER.top (nor above the trigger: it only
   * grows). Without a trigger it opens where it always did, PRIMER.top. -> { start: { top, height } | null, top, height }
   */
  function primerBox(from, columnHeight, { min = 360, lift = 14 } = {}) {
    const end = Math.max(0, columnHeight - PRIMER.bottom);
    if (!from) return { start: null, top: PRIMER.top, height: Math.max(0, end - PRIMER.top) };
    const want = Math.max(0, from.top - lift);
    const top = Math.max(Math.min(PRIMER.top, want), Math.min(want, end - min));
    return { start: { top: Math.max(0, from.top - lift), height: Math.max(0, from.height + lift) }, top, height: Math.max(0, end - top) };
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
   * then "The gist and a map of {unit}." It names no other section: what follows the gist depends
   * on the document's kind, known only once the primer is made. The B key is in its title, not a keycap.
   */
  function triggerHtml(unit) {
    return `<span class="mr-trigger__title">Before you start</span><span class="mr-trigger__sub">${esc(triggerLine(unit))}</span>`;
  }
  /** The trigger's line, also its accessible name: "The gist and a map of chapter 1." */
  const triggerLine = unit => `The gist and a map of ${unitPhrase(unit)}.`;
  /**
   * A primer's sections after the gist: its own, or, for a primer stored before kinds (Anders, 15
   * Oct), its claims and cautions as Key claims and Keep in mind. -> [{ title, items: [{ text, cite } | { term, meaning }] }]
   */
  function primerSections(p) {
    if (Array.isArray(p?.sections)) return p.sections.filter(s => s && s.title && Array.isArray(s.items) && s.items.length);
    const claims = (p?.claims || []).map(c => (typeof c === 'string' ? { text: c, cite: '' } : c)).filter(c => c?.text);
    const keep = (p?.keepInMind || []).filter(k => typeof k === 'string' && k).map(text => ({ text, cite: '' }));
    return [claims.length ? { title: 'Key claims', items: claims } : null, keep.length ? { title: 'Keep in mind', items: keep } : null].filter(Boolean);
  }
  /**
   * The primer. p: { kind, gist, sections: [{ title, items }], map: [{ title, pages }] } (or a primer
   * stored before kinds: { gist, claims, keepInMind, map }), or null while it is made (`wait`) or when
   * it could not be (`status`, then Redo). The gist first, then each section under its italic label:
   * a paper's, a textbook's or other's first section and any steps numbered, as Key claims always
   * were; the others, and terms ("term — meaning"), as Keep in mind was; then the map, Quiz me and the footer.
   * o: { P (parsers), resolve (citation -> target), status, wait, close (the close button; default true), id (the title's id),
   *      unit (the unit's name, "Chapter 1: Introduction to Information Theory", shown under the title) }.
   */
  function primerHtml(p, o = {}) {
    const close = o.close === false ? '' : '<button type="button" class="mr-card__close mr-primer__close" data-c="close" aria-label="Close">×</button>';
    const head = `<h4 class="mr-primer__title"${o.id ? ` id="${esc(o.id)}"` : ''}>Before you start${close}</h4>`;
    if (!p) {
      if (o.wait) return head + '<p class="mr-status mr-wait" role="status"></p>';
      return head + `<p class="mr-status" role="status">${esc(o.status || '')}</p><div class="mr-primer__foot"><span></span><button type="button" data-c="redo">Redo</button></div>`;
    }
    const tag = cite => (cite ? ' ' + inlineHtml(cite, o.P, o.resolve) : '');
    const line = it => (it.term ? `${esc(it.term)} — ${inlineHtml(it.meaning, o.P, o.resolve)}` : `${inlineHtml(it.text, o.P, o.resolve)}${tag(it.cite)}`);
    const sections = primerSections(p).map((sec, k) => {
      // Numbered: a paper's claims, a textbook's outcomes, other's points (the first section, as Key claims was) and steps; a story's situation and a guide's scope are not a sequence.
      const numbered = !sec.items.some(it => it.term) && sec.items.length > 1 && (/^steps\b/i.test(sec.title) || (k === 0 && p.kind !== 'narrative' && p.kind !== 'practical'));
      const list = numbered
        ? `<ol class="mr-primer__claims">${sec.items.map((it, i) => `<li><span class="mr-primer__n" aria-hidden="true">${i + 1}</span><span>${line(it)}</span></li>`).join('')}</ol>`
        : `<ul class="mr-primer__keep">${sec.items.map(it => `<li>${line(it)}</li>`).join('')}</ul>`;
      return `<div><p class="mr-primer__head">${esc(sec.title)}</p>${list}</div>`;
    }).join('');
    // A map that uses the document's own numbered headings ("1 Introduction") shows each number once: no count beside it.
    const own = (p.map || []).some(r => OWN_NUMBER.test(r.title || ''));
    const rows = (p.map || []).map((r, i) => {
      const token = mapPages(r.pages), target = token && o.resolve ? o.resolve(token) : null;
      const inner = `${own ? '' : `<span class="mr-map__n" aria-hidden="true">${i + 1}</span>`}<span class="mr-map__title">${esc(r.title)}</span><span class="mr-map__pages">${esc(r.pages || '')}</span>`;
      const cls = 'mr-map__row' + (own ? ' is-own' : '');
      return target ? `<button type="button" class="${cls}" data-page="${target.page}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
    }).join('');
    return head
      + (o.unit ? `<p class="mr-primer__unit">${esc(o.unit)}</p>` : '')
      + `<p class="mr-primer__gist">${inlineHtml(p.gist, o.P, o.resolve)}</p>`
      + sections
      + `<div><p class="mr-primer__head">Map</p><div class="mr-map">${rows}</div></div>`
      + '<button type="button" class="mr-quiz-row" data-c="quiz"><span>Quiz me on this chapter</span><small>3 questions →</small></button>'
      + '<div class="mr-primer__foot"><span>Made when you opened the file</span><button type="button" data-c="redo">Redo</button></div>';
  }

  /* ---------- Figures (FIXES-2026-10-15, items 4–7): detection, captions, the chip and the figure's card ----------
     Detection reads a small grey copy of the drawn page (`ink`: 1 where there is ink, W×H pixels,
     square) and the text layer's spans and displayed formulas (page fractions). */
  // A caption starts a line: "Figure 2.", "Fig. 3 The …", "Table 1:", "Figure 16.1: …" (not "Figure 2 shows …").
  const CAPTION_RE = /^(Figure|FIGURE|Fig\.?|FIG\.?|Table|TABLE)\s*(\d+(?:[.\-–]\d+)*[a-z]?|[A-Z](?:\.\d+)*)(?=\s*(?:[:—–|]|\.(?!\d))|\s+\p{Lu}|\s*$)/u;
  const REF_RE = /\b(Figure|Fig\.?|Table)\s*(\d+(?:\.\d+)*[a-z]?)(?![\d.]*\d)/i;
  const figKind = w => (/^t/i.test(w) ? 'table' : 'figure');
  const figLabel = (kind, n) => `${kind === 'table' ? 'Table' : 'Figure'} ${n}`;
  /** A caption's own label, when `text` starts with one. -> { kind: 'figure' | 'table', n, label } | null */
  function captionOf(text) {
    const m = CAPTION_RE.exec(String(text || '').replace(/^\s+/, ''));
    return m ? { kind: figKind(m[1]), n: m[2], label: figLabel(figKind(m[1]), m[2]) } : null;
  }
  /** The first figure or table a question names ("Figure 2", "Fig. 2", "fig 3.1", "Table 1"). -> { kind, n, label } | null */
  function figureRef(text) {
    const m = REF_RE.exec(String(text || ''));
    return m ? { kind: figKind(m[1]), n: m[2], label: figLabel(figKind(m[1]), m[2]) } : null;
  }
  /**
   * Which figure goes with a question (item 7): the one the question names, else the one whose
   * caption is the selection; only one whose caption is among `captions` (those on the page, each
   * { kind, n, fig }). -> that caption, or null (then the passage crop goes, as before).
   */
  function figureFor({ selection = '', question = '', captions = [] } = {}) {
    const find = want => (want && (captions || []).find(c => c && c.fig != null && c.kind === want.kind && String(c.n).toLowerCase() === String(want.n).toLowerCase())) || null;
    return find(figureRef(question)) || find(captionOf(selection)) || null;
  }
  /**
   * The picture a passage action sends when the passage touches a table or a formula (morning retest, 16 Oct: Table 1's
   * O(n²·d) reached the model as "O(n · d)"): the passage's box (page fractions { x, y, w, h }) grown to take in each
   * table it overlaps, each displayed formula it overlaps, and the table the passage names when that table is on this
   * page ("as Table 1 shows"). `figures`: the page's found figures (fractions); `captions`: their captions ({ kind, n,
   * fig }); `blocks`: the displayed formulas (fractions). -> the grown box, or null when it touches neither (then the
   * passage's own crop goes, as before).
   */
  function mathBox({ box, figures = [], captions = [], blocks = [], text = '' } = {}) {
    if (!box || !(box.w > 0) || !(box.h > 0)) return null;
    const meets = (a, b) => a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const tables = (captions || []).filter(c => c && c.kind === 'table' && c.fig != null && figures?.[c.fig]);
    const named = figureRef(text), add = [];
    for (const c of tables) {
      const f = figures[c.fig];
      if (meets(box, f) || (named && named.kind === 'table' && String(named.n).toLowerCase() === String(c.n).toLowerCase())) add.push(f);
    }
    for (const b of blocks || []) if (meets(box, b)) add.push(b);
    if (!add.length) return null;
    let x0 = box.x, y0 = box.y, x1 = box.x + box.w, y1 = box.y + box.h;
    for (const f of add) { x0 = Math.min(x0, f.x); y0 = Math.min(y0, f.y); x1 = Math.max(x1, f.x + f.w); y1 = Math.max(y1, f.y + f.h) }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  /** How much two boxes ({ x, y, w, h }) overlap: their intersection over their union. */
  function overlapOf(a, b) {
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (w <= 0 || h <= 0) return 0;
    return (w * h) / (a.w * a.h + b.w * b.h - w * h);
  }
  /** A figure's card (one thread per figure): the kept card for the figure at `box` on `page`, or null. */
  function figureCardFor(cards, page, box) {
    return (cards || []).find(c => c && !c.gone && c.kind === 'figure' && c.page === page && c.rects?.[0] && overlapOf({ x: c.rects[0][1], y: c.rects[0][2], w: c.rects[0][3], h: c.rects[0][4] }, box) > 0.5) || null;
  }
  /**
   * The figure chip (item 6): right-aligned with the figure, 4px above it, kept `inset` inside
   * `bounds` (the page as far as it is on screen, below the top bar; `outer`, the screen, when the
   * chip is wider than that). Above when it fits, else below the figure, else just inside its top.
   * All in screen pixels. -> { left, top, side }
   */
  function placeChip({ box, w, h, bounds, outer = bounds, gap = 4, inset = 8 }) {
    // Wider than the page on screen (a narrow phone page): inside the screen (`outer`) instead.
    const room = (bounds.right - bounds.left) - inset * 2 >= w ? bounds : outer;
    const left = clamp(box.right - w, room.left + inset, Math.max(room.left + inset, room.right - inset - w));
    const above = box.top - gap - h, below = box.bottom + gap;
    if (above >= bounds.top + inset) return { left, top: above, side: 'above' };
    if (below + h <= bounds.bottom - inset) return { left, top: below, side: 'below' };
    return { left, top: clamp(Math.max(box.top, bounds.top) + gap, bounds.top + inset, Math.max(bounds.top + inset, bounds.bottom - inset - h)), side: 'inside' };
  }
  /** Ink grown by R pixels each way (a square), in two passes. */
  function grow(ink, W, H, R) {
    const across = new Uint8Array(W * H), out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      let last = -Infinity; for (let x = 0; x < W; x++) { if (ink[y * W + x]) last = x; if (x - last <= R) across[y * W + x] = 1 }
      last = Infinity; for (let x = W - 1; x >= 0; x--) { if (ink[y * W + x]) last = x; if (last - x <= R) across[y * W + x] = 1 }
    }
    for (let x = 0; x < W; x++) {
      let last = -Infinity; for (let y = 0; y < H; y++) { if (across[y * W + x]) last = y; if (y - last <= R) out[y * W + x] = 1 }
      last = Infinity; for (let y = H - 1; y >= 0; y--) { if (across[y * W + x]) last = y; if (last - y <= R) out[y * W + x] = 1 }
    }
    return out;
  }
  /** Connected areas of ink grown by R: their boxes (shrunk back by R) and `n`, the ink in each that `skip` does not mark. */
  function areasOf(ink, W, H, R, skip = null) {
    const grown = grow(ink, W, H, R), seen = new Uint8Array(W * H), out = [];
    for (let i = 0; i < W * H; i++) {
      if (!grown[i] || seen[i]) continue;
      let l = W, t = H, r = 0, b = 0, n = 0; const st = [i]; seen[i] = 1;
      while (st.length) {
        const j = st.pop(), y = (j / W) | 0, x = j % W;
        if (ink[j] && !(skip && skip[j])) n++;
        if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y;
        for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < W * H && !seen[k] && grown[k] && Math.abs((k % W) - x) <= 1) { seen[k] = 1; st.push(k) }
      }
      out.push({ l: l + R, t: t + R, r: r - R, b: b - R, n });
    }
    return out;
  }
  /**
   * Text the page does not show: a span whose middle has a long run of paper where its letters
   * should be. A figure placed from another document can carry that document's text, clipped out of
   * sight (TD-Gammon's network in Sutton and Barto's book carries a page of an earlier draft); taken
   * for running text, it blanked the diagram. Short spans and spans over ink of their own stay.
   */
  function unseen(s, ink, W, H) {
    const str = String(s.text || '').replace(/\s+/g, '');
    if (str.length < 3) return false;
    const l = Math.max(0, Math.round(s.x * W)), r = Math.min(W - 1, Math.round((s.x + s.w) * W) - 1);
    const t = Math.max(0, Math.round((s.y + s.h * 0.25) * H)), b = Math.min(H - 1, Math.round((s.y + s.h * 0.8) * H));
    if (r - l < 4 || b < t) return false;
    let cols = 0, run = 0, gap = 0;
    for (let x = l; x <= r; x++) {
      let any = 0; for (let y = t; y <= b && !any; y++) any = ink[y * W + x];
      if (any) { cols++; run = 0 } else if (++run > gap) gap = run;
    }
    const cover = cols / (r - l + 1);
    return cover < 0.35 || (str.length >= 8 && gap > Math.max(10, (s.h * H) * 2));
  }
  /**
   * A figure's box snapped to the page's own drawing (Anders, 19 Oct 2026, Constructor Theory's Table 1: the crop was
   * offset from the table's outer rule). `f`: the box found from the drawn page (page fractions; a coarse picture, so its
   * edges are off by a few points); `shapes`: the page's painted paths and pictures ({ x, y, w, h }, page fractions:
   * reader.js pageShapes); `labels`: text that is no running text and no caption; `caps`: the captions' boxes. The
   * shapes that meet the box, and those touching them, make the drawing's box; when it covers most of the found box it
   * is the figure, with the labels beside or over it (a header above a table, a row label set upwards at its left) and
   * a small pad, kept off the captions. Otherwise (no drawing, or a little of it) the found box stays.
   */
  const SNAP = { pad: 0.005, reach: 0.04, touch: 0.004, cover: 0.55 };
  function snapFigure(f, shapes = [], labels = [], caps = []) {
    const meets = (a, b, g = 0) => a.x <= b.x + b.w + g && a.x + a.w >= b.x - g && a.y <= b.y + b.h + g && a.y + a.h >= b.y - g;
    const join = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y } };
    const area = a => Math.max(0, a.w) * Math.max(0, a.h);
    const cut = (a, b) => area({ x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), w: Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h: Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) });
    // Within reach of the found box only (never the page's frame, a rule across the page, or a neighbour's drawing).
    const reach = { x: f.x - SNAP.reach, y: f.y - SNAP.reach, w: f.w + SNAP.reach * 2, h: f.h + SNAP.reach * 2 };
    const near = (shapes || []).filter(o => o && o.w >= 0 && o.h >= 0 && !(o.w > 0.9 && o.h > 0.9) && area(o) < 0.6 && o.x >= reach.x && o.y >= reach.y && o.x + o.w <= reach.x + reach.w && o.y + o.h <= reach.y + reach.h);
    let U = null;
    const used = new Set();
    for (const o of near) if (meets(o, f)) { U = U ? join(U, o) : { ...o }; used.add(o) }
    if (!U) return f;
    for (let grew = true; grew;) { grew = false; for (const o of near) if (!used.has(o) && meets(o, U, SNAP.touch)) { U = join(U, o); used.add(o); grew = true } }
    if (cut(U, f) < SNAP.cover * area(f)) return f;
    // The labels round the drawing: text over it or within a line's height of it that the found box holds (its middle
    // inside it, give or take its coarse edge).
    let box = U;
    const held = l => { const cx = l.x + l.w / 2, cy = l.y + l.h / 2; return cx >= f.x - 0.01 && cx <= f.x + f.w + 0.01 && cy >= f.y - 0.01 && cy <= f.y + f.h + 0.01 };
    for (const l of labels || []) if (meets(l, U, Math.max(0.012, l.h * 1.2)) && held(l) && !(caps || []).some(c => meets(l, c))) box = join(box, l);
    const P = SNAP.pad;
    let out = { x: box.x - P, y: box.y - P, w: box.w + P * 2, h: box.h + P * 2 };
    // Never into a caption: the pad stops short of it.
    for (const c of caps || []) {
      if (!meets(out, c) || meets(box, c)) continue;
      if (c.y >= box.y + box.h) out.h = Math.min(out.h, c.y - out.y - 0.001);
      else if (c.y + c.h <= box.y) { const b = out.y + out.h; out.y = Math.max(out.y, c.y + c.h + 0.001); out.h = b - out.y }
    }
    const x = Math.max(0, out.x), y = Math.max(0, out.y);
    return { x, y, w: Math.min(1, out.x + out.w) - x, h: Math.min(1, out.y + out.h) - y };
  }
  /**
   * The figures on a page (item 5): areas of ink that are not running text. Running text (lines
   * of more than 48 characters or 7 words), captions and displayed formulas are blanked out. Short
   * label text ("hidden units") inside an area of ink stays, joining the pieces of a diagram, but
   * only ink that is not label text counts towards a figure. Lines are split where a gap is wider
   * than the line is tall, so text beside a figure never bridges it; text the page does not show
   * (`unseen`) is left out. Each caption ("Figure 2.", "Table 1:") is matched to the figure just
   * above it, beside it (a caption in the margin, as MacKay sets them), around it, or (a table)
   * below it; one found only in part grows to the ink between the caption and the text above it,
   * never past another caption or into another figure. Pieces side by side join into one figure
   * unless each has its own caption. A displayed formula inside a figure, or between it and its
   * caption (ResNet's "F(x) + x" under Figure 2), is part of it; a caption with nothing else beside
   * or above it takes the formula there. With no figure found, the ink beside, above or below the
   * caption is its figure (the fallback).
   * `spans`: [{ x, y, w, h, text }]; `formulas`: [{ x, y, w, h }]; all page fractions.
   * -> { figures: [{ x, y, w, h, label?, caption? }], captions: [{ kind, n, label, text, fig, box }] }
   */
  function findFigures({ ink, W, H, spans = [], formulas = [], shapes = [] } = {}) {
    const N = W * H;
    const px = q => ({ l: Math.max(0, Math.floor(q.x * W) - 1), t: Math.max(0, Math.floor(q.y * H)), r: Math.min(W - 1, Math.ceil((q.x + q.w) * W)), b: Math.min(H - 1, Math.ceil((q.y + q.h) * H)) });
    const fill = (a, q, v) => { for (let y = q.t; y <= q.b; y++) a.fill(v, y * W + q.l, y * W + q.r + 1) };
    const union = (a, o) => ({ l: Math.min(a.l, o.l), t: Math.min(a.t, o.t), r: Math.max(a.r, o.r), b: Math.max(a.b, o.b), n: (a.n || 0) + (o.n || 0) });
    const meets = (a, o, gap = 0) => a.l <= o.r + gap && a.r >= o.l - gap && a.t <= o.b + gap && a.b >= o.t - gap;
    // Lines, then segments: a line split where the gap is wider than its text is tall.
    const items = (spans || []).filter(s => s && s.w > 0 && s.h > 0 && String(s.text || '').trim() && !unseen(s, ink, W, H)).map(s => ({ ...s, cy: s.y + s.h / 2 })).sort((a, b) => a.cy - b.cy);
    const lines = [];
    for (const s of items) { const L = lines[lines.length - 1]; if (L && Math.abs(s.cy - L.cy) < Math.min(s.h, L.h) * 0.5) L.items.push(s); else lines.push({ cy: s.cy, h: s.h, items: [s] }) }
    const segs = [];
    for (const L of lines) {
      let cur = null;
      for (const s of L.items.sort((a, b) => a.x - b.x)) {
        if (cur && (s.x - (cur.x + cur.w)) * W <= s.h * H * 1.2) {
          // A word space only where the PDF leaves one: pieces set close ("Table 1", ": A c", "lassification") join
          // as they print (Anders, 19 Oct 2026: "Table 1 : A c lassification of constructions").
          const gap = (s.x - (cur.x + cur.w)) * W, tight = gap <= s.h * H * 0.12 || /\s$/.test(cur.parts[cur.parts.length - 1]) || /^\s/.test(s.text);
          const right = Math.max(cur.x + cur.w, s.x + s.w), bottom = Math.max(cur.y + cur.h, s.y + s.h);
          cur.y = Math.min(cur.y, s.y); cur.w = right - cur.x; cur.h = bottom - cur.y; cur.parts.push((tight ? '' : ' ') + s.text);
        } else { cur = { x: s.x, y: s.y, w: s.w, h: s.h, parts: [s.text], line: L }; segs.push(cur) }
      }
    }
    for (const s of segs) {
      s.text = s.parts.join('').replace(/\s+/g, ' ').trim();
      s.q = px(s); s.caption = captionOf(s.text);
      // An algorithm's or a plate's caption is no figure's, but it ends the figure above it.
      s.stop = !!s.caption || /^(Algorithm|Exhibit|Plate|Listing)\s*\d+(?:[.\-–]\d+)*\s*[.:]/.test(s.text);
      // A row of figures or braces ("t 000 000 111", "︷ ︸︸ ︷") is a table's, not running text.
      const chars = s.text.replace(/\s/g, '').length, cells = (s.text.match(/[\d︷︸⏞⏟]/g) || []).length;
      s.running = (s.text.length > 48 || s.text.split(' ').length > 7) && cells < chars * 0.5;
    }
    // Text wrapped beside a figure runs in short lines: three or more lines of words, one under the other, starting and
    // ending together, are running text too (Sutton and Barto's backgammon board).
    for (const s of segs) {
      const chars = s.text.replace(/\s/g, '').length, letters = (s.text.match(/\p{L}/gu) || []).length;
      if (s.running || s.text.length < 25 || s.text.split(' ').length < 4 || letters < chars * 0.7) continue;
      const lh = s.q.b - s.q.t + 3, same = o => o !== s && o.text.length >= 15 && Math.abs(o.q.l - s.q.l) <= 2 && Math.abs(o.q.r - s.q.r) <= 4;
      const near = segs.filter(o => same(o) && Math.abs(o.q.t - s.q.t) <= lh * 2.5);
      if (near.length >= 2 || (near.length === 1 && segs.some(o => o !== near[0] && same(o) && Math.abs(o.q.t - near[0].q.t) <= lh * 1.5 && Math.abs(o.q.t - s.q.t) > lh * 0.5))) s.wrapped = true;
    }
    for (const s of segs) { if (s.wrapped) s.running = true; if (s.running) s.line.running = true }
    // Captions: a caption's first line and those just below it, in its column, that start no other caption.
    const captions = [];
    segs.forEach((s, i) => {
      if (!s.caption) return;
      const box = { ...s.q }, lh = Math.max(1, s.q.b - s.q.t), parts = [s.text], own = captions.length;
      s.capOf = own;
      for (let k = i + 1; k < segs.length && parts.length < 8; k++) {
        const o = segs[k];
        if (o.q.t - box.b > lh * 0.9) break;
        if (o.caption || o.q.t < box.b - lh * 0.5 || o.q.l > box.r || o.q.r < box.l) continue;
        // A caption's next line starts where it starts, or is centred under it and no wider (a table's cells, and the
        // running text under a short centred caption, are neither).
        const aligned = Math.abs(o.q.l - s.q.l) <= lh * 1.5, centred = Math.abs((o.q.l + o.q.r) - (s.q.l + s.q.r)) / 2 <= lh * 1.5 && o.q.r - o.q.l <= s.q.r - s.q.l + lh;
        if (!aligned && !centred) break;
        o.inCaption = true; o.capOf = own; parts.push(o.text);
        box.l = Math.min(box.l, o.q.l); box.r = Math.max(box.r, o.q.r); box.b = Math.max(box.b, o.q.b);
      }
      captions.push({ ...s.caption, q: box, lh, text: parts.join(' ').slice(0, 600) });
    });
    // Areas of ink with every text blanked: where labels sit (in one, or within 3px of it: a label under a diagram's last row).
    const bare = Uint8Array.from(ink);
    for (const s of segs) fill(bare, s.q, 0);
    for (const f of formulas || []) fill(bare, px(f), 0);
    const areas = areasOf(bare, W, H, 8).filter(o => o.n >= 12);
    const inArea = q => areas.some(o => meets(q, o, 3));
    const kept = Uint8Array.from(ink), label = new Uint8Array(N);
    for (const s of segs) {
      if (!s.running && !s.caption && !s.inCaption && inArea(s.q)) { fill(label, s.q, 1); continue }
      // Short text on a line of running text (inline maths, a footnote mark) goes with it, as words do.
      if (s.running || s.caption || s.inCaption || s.line.running || (s.word = s.text.length >= 4 && /[A-Za-z]{3}/.test(s.text))) fill(kept, s.q, 0);
    }
    const maths = (formulas || []).map(f => ({ ...px(f), n: 0, formula: true }));
    for (const f of maths) fill(kept, f, 0);
    // For the caption fallback: only running text and captions blanked (a table's cells are short text, often taken for formulas).
    const loose = Uint8Array.from(ink);
    for (const s of segs) if (s.running || s.caption || s.inCaption) fill(loose, s.q, 0);
    const boxes = areasOf(kept, W, H, 3, label).filter(o => (o.r - o.l) >= W * 0.07 && (o.b - o.t) >= H * 0.04 && o.n >= 30 && (o.r - o.l) * (o.b - o.t) < N * 0.5);
    // A caption's own piece: one it lies against (just below, above for a table, or beside), in its columns.
    const nextTo = (c, o) => {
      const q = c.q, across = Math.min(o.r, q.r) - Math.max(o.l, q.l) > 0;
      return (across && o.b <= q.t + 2 && q.t - o.b <= H * 0.08) || (c.kind === 'table' && across && o.t >= q.b - 2 && o.t - q.b <= H * 0.08);
    };
    // Side-by-side pieces of one figure (an image, an arrow diagram, an image) become one box; two pieces each
    // with a caption of its own are two figures (ResNet's Figure 7 and Table 8, side by side in two columns).
    for (let merged = true; merged;) {
      merged = false;
      outer: for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j], ov = Math.min(a.b, b.b) - Math.max(a.t, b.t), gap = Math.max(a.l, b.l) - Math.min(a.r, b.r);
        if (!(ov > 0.6 * Math.min(a.b - a.t, b.b - b.t) && gap < W * 0.18)) continue;
        if (captions.some(c => nextTo(c, a) && !nextTo(c, b)) && captions.some(c => nextTo(c, b) && !nextTo(c, a))) continue;
        boxes[i] = union(a, b); boxes.splice(j, 1); merged = true; break outer;
      }
    }
    // Two columns when no running line but a caption crosses the page's middle: a caption then keeps to its column.
    const twoColumns = !segs.some(s => s.running && !s.caption && !s.inCaption && s.q.l < W * 0.4 && s.q.r > W * 0.6);
    // The ink between a caption and the running text (or another caption) above it (dir -1) or below it (+1), in its column.
    const bandOf = (c, dir, from = kept, near = null) => {
      const cap = c.q, half = W / 2, narrow = twoColumns && cap.r - cap.l < W * 0.55;
      let [x0, x1] = narrow && cap.r <= half + W * 0.04 ? [0, Math.floor(half)] : narrow && cap.l >= half - W * 0.04 ? [Math.ceil(half), W - 1] : [0, W - 1];
      // Growing a figure found in part: only round it, so text beside it (wrapped round a diagram) is no edge.
      if (near) { x0 = Math.max(x0, near.l - 16); x1 = Math.min(x1, near.r + 16) }
      let edge = dir < 0 ? 0 : H - 1;
      for (const s of segs) {
        if (s.capOf === captions.indexOf(c) || !(s.running || s.stop || s.inCaption || (near && s.word)) || s.q.r < x0 || s.q.l > x1) continue;
        if (dir < 0 && s.q.b < cap.t && s.q.b + 1 > edge) edge = s.q.b + 1;
        if (dir > 0 && s.q.t > cap.b && s.q.t - 1 < edge) edge = s.q.t - 1;
      }
      const [y0, y1] = dir < 0 ? [edge, cap.t - 1] : [cap.b + 1, edge];
      return inkIn(from, x0, x1, y0, y1);
    };
    // The ink beside a caption set in the margin (MacKay's Figure 1.10, a table of digits): from the caption's top
    // down to the next running text, on the side away from the page's edge.
    const besideOf = c => {
      const cap = c.q, right = cap.l >= W * 0.55, left = cap.r <= W * 0.45;
      if (!(right || left) || cap.r - cap.l > W * 0.35) return null;
      const [x0, x1] = right ? [0, cap.l - 3] : [cap.r + 3, W - 1];
      let edge = H - 1;
      for (const s of segs) if (s.capOf !== captions.indexOf(c) && (s.running || s.stop) && s.q.t > cap.t + c.lh && s.q.r >= x0 && s.q.l <= x1 && s.q.t - 1 < edge) edge = s.q.t - 1;
      return inkIn(loose, x0, x1, cap.t - 1, edge);
    };
    function inkIn(from, x0, x1, y0, y1) {
      if (y1 - y0 < 2 || x1 - x0 < 2) return null;
      const part = new Uint8Array(N);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) part[y * W + x] = from[y * W + x];
      const pieces = areasOf(part, W, H, 3).filter(o => o.n >= 16);
      return pieces.length ? pieces.reduce(union) : null;
    }
    // Which piece a caption lies against: just above it, (a table) just below it, beside it, or around it.
    const how = (c, f) => {
      const box = c.q, overlapX = Math.min(f.r, box.r) - Math.max(f.l, box.l) > 0;
      if (overlapX && f.b <= box.t + 2 && box.t - f.b <= H * 0.08) return { d: box.t - f.b, h: 'above' };
      if (c.kind === 'table' && overlapX && f.t >= box.b - 2 && f.t - box.b <= H * 0.08) return { d: f.t - box.b, h: 'below' };
      if (box.t >= f.t - (box.b - box.t) && box.t <= f.b) {
        const side = box.l >= f.r - 2 ? box.l - f.r : f.l >= box.r - 2 ? f.l - box.r : Infinity;
        // In the margin, a little further off, with nothing running between them.
        const clear = side <= W * 0.25 && !segs.some(s => s.running && s.capOf == null && s.q.b >= box.t && s.q.t <= box.b && (box.l >= f.r ? s.q.l < box.l && s.q.r > f.r : s.q.r > box.r && s.q.l < f.l));
        if (side <= W * 0.06 || clear) return { d: Math.abs(box.t - f.t) + 1 + side * 0.1, h: 'beside' };
      }
      if (meets(f, box) && box.t > f.t && box.b < f.b) return { d: 0.5, h: 'inside' };
      return null;
    };
    // Each caption takes the piece it lies closest against, closest pairs first (a table's caption below the
    // table it ends, ahead of the next table below it: ResNet's Tables 7 and 8).
    const taken = new Set(), pairs = [];
    captions.forEach((c, i) => boxes.forEach((f, j) => { const m = how(c, f); if (m) pairs.push({ i, j, d: Math.max(0, m.d) + (m.h === 'below' ? 2 : 0), h: m.h }) }));
    pairs.sort((a, b) => a.d - b.d || a.i - b.i);
    for (const { i, j, h } of pairs) if (captions[i].fig == null && !taken.has(j)) { captions[i].fig = j; captions[i].rel = h; taken.add(j) }
    for (const c of captions) {
      if (c.fig != null) {
        const f = boxes[c.fig];
        // Beside a figure in the margin, the next caption down beside the same ink starts the next figure (MacKay's Figures 3.1 and 3.2, stacked).
        if (c.rel === 'beside') for (const o of captions) if (o !== c && o.q.t > c.q.t + c.lh && o.q.t < f.b && (o.q.l >= f.r - 2 || o.q.r <= f.l + 2) && o.q.t - 2 > f.t) f.b = Math.min(f.b, o.q.t - 2);
        // Found only in part (a diagram's upper half apart from its lower): the ink up to the text above, unless that runs into another figure.
        if (c.rel === 'above') {
          const band = bandOf(c, -1, kept, f);
          if (band && band.b >= f.t) { const grown = union(f, band); if (!boxes.some((o, j) => j !== c.fig && meets(grown, o, -1) && !meets(f, o, -1))) Object.assign(f, grown) }
        }
        continue;
      }
      // The fallback: no figure was found for this caption. The ink beside it when it is set in the margin (MacKay's
      // Figure 1.10, a table of digits), else a displayed formula above or beside it in no other figure (a channel
      // drawn with its equations), else the ink above it (a table's: below).
      const big = band => band && band.r - band.l >= W * 0.05 && band.b - band.t >= H * 0.03 && band.n >= 30;
      const add = o => { boxes.push(o); c.fig = boxes.length - 1; taken.add(c.fig) };
      const side = besideOf(c);
      if (big(side)) { add(side); continue }
      let fm = null, fd = Infinity;
      for (const f of maths) { if (f.used || boxes.some(o => meets(f, o, -1))) continue; const m = how(c, f); if (m && m.h !== 'inside' && m.d < fd) { fd = m.d; fm = f } }
      if (fm) { fm.used = true; add({ l: fm.l, t: fm.t, r: fm.r, b: fm.b, n: 0 }); continue }
      for (const dir of c.kind === 'table' ? [1, -1] : [-1, 1]) { const band = bandOf(c, dir, loose); if (big(band)) { add(band); break } }
    }
    // A displayed formula inside a figure, or between it and its caption, is part of it (and its chip is the figure's).
    for (const c of captions) {
      if (c.fig == null) continue;
      const f = boxes[c.fig];
      for (const m of maths) {
        const inside = meets(m, f, 2), between = m.t >= f.b - 2 && m.b <= c.q.t + 2 && Math.min(m.r, f.r) - Math.max(m.l, f.l) > 0;
        if (!m.used && (inside || between)) { m.used = true; Object.assign(f, union(f, m), { n: f.n }) }
      }
    }
    // One area, one figure: an uncaptioned piece mostly inside captioned figures goes; a captioned figure mostly
    // inside an uncaptioned area that holds no other captioned figure takes the whole area (MacKay's Figure 1.17).
    const owned = new Set(captions.filter(c => c.fig != null).map(c => c.fig)), area = o => Math.max(1, (o.r - o.l) * (o.b - o.t));
    const inter = (a, o) => Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) * Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
    const drop = new Set();
    // A box mostly covered by running text, or holding three lines of it, is prose, never a figure, whatever inline
    // symbols it has (Anders, 19 Oct 2026: a paragraph of Constructor Theory with a fraktur A and an italic N was
    // boxed as a figure, its chip in place of the selection's bar).
    const prose = o => {
      const runs = segs.filter(s => (s.running || s.line.running) && !s.caption && !s.inCaption && inter(o, s.q) > 0.5 * area(s.q));
      return runs.reduce((a, s) => a + inter(o, s.q), 0) > 0.45 * area(o) || new Set(runs.map(s => s.line)).size >= 3;
    };
    boxes.forEach((o, j) => { if (prose(o)) drop.add(j) });
    boxes.forEach((o, j) => {
      if (owned.has(j) || drop.has(j)) return;
      const inside = [...owned].filter(k => inter(o, boxes[k]) > 0.6 * Math.min(area(o), area(boxes[k])));
      if (inside.length === 1 && area(o) > area(boxes[inside[0]]) && ![...owned].some(k => k !== inside[0] && inter(o, boxes[k]) > 0)) { Object.assign(boxes[inside[0]], union(boxes[inside[0]], o)); drop.add(j) }
      else if (inside.length && [...owned].reduce((a, k) => a + inter(o, boxes[k]), 0) > 0.6 * area(o)) drop.add(j);
    });
    if (drop.size) {
      const map = [], kept = [];
      boxes.forEach((o, j) => { if (!drop.has(j)) { map[j] = kept.length; kept.push(o) } });
      for (const c of captions) if (c.fig != null) c.fig = map[c.fig];
      boxes.length = 0; boxes.push(...kept);
    }
    const pad = 1.5;
    const figures = boxes.map(o => ({ x: Math.max(0, (o.l - pad) / W), y: Math.max(0, (o.t - pad) / H), w: Math.min(1, (o.r - o.l + pad * 2) / W), h: Math.min(1, (o.b - o.t + pad * 2) / H) }));
    // Snapped to the page's own drawing where it has one (its rules, paths and pictures; snapFigure): the drawing's
    // box with the labels round it, never its caption, padded a little.
    if (shapes?.length) {
      const labels = segs.filter(s => !s.running && !s.line.running && !s.caption && !s.inCaption && !s.stop).map(s => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
      const caps = captions.map(c => ({ x: c.q.l / W, y: c.q.t / H, w: (c.q.r - c.q.l + 1) / W, h: (c.q.b - c.q.t + 1) / H }));
      figures.forEach((f, j) => Object.assign(f, snapFigure(f, shapes, labels, caps)));
    }
    const out = [];
    for (const c of captions) {
      if (c.fig == null) continue;
      const f = figures[c.fig];
      if (!f.label) { f.label = c.label; f.caption = c.text }
      out.push({ kind: c.kind, n: c.n, label: c.label, text: c.text, fig: c.fig, box: { x: c.q.l / W, y: c.q.t / H, w: (c.q.r - c.q.l + 1) / W, h: (c.q.b - c.q.t + 1) / H } });
    }
    return { figures, captions: out };
  }

  const html = { esc, cut, ICONS, LATER, pillsHtml, markHtml, unitName, PILLS, barHtml, moreHtml, defineHtml, noteHtml, cardHtml, cardClass, stackHtml, followHtml, answerHtml, replyHtml, factcheckHtml, relatedHtml, relatedFoldLabel, inlineHtml, threadHtml, wholeHtml, sheetHtml, foldText, cardLabel, citeText, CARD_ICONS, triggerHtml, primerHtml, primerSections };

  return { html, sizeAsk, parseLookup, DESK, PHONE, COL, PRIMER, COLUMN_RESERVE, KINDS, CARD_KINDS, CARD_LIMITS, QUIZ_ANSWER_CHARS, placeBar, placeMore, placeCard, placeCards, leadPath, columnBox, citeTarget, cardView, cardAnswered, firstRect, mergeCards, newCard, anchorOfCard, quizScore, quizLine, quizReread, typedChar, selectionKey, oneWord, hyphenWord, nameMidSentence, defineAsks, copyQuote, defaultColor, chooseColor, mergeMarks, splitMarks, tombstone, sameMarks, stampOf, primerUnits, sizeUnits, scanTree, UNIT_SIZE, unitAt, atUnitStart, noteSpot, noteBox, unitPhrase, mapPages, wholeName, captionOf, figureRef, figureFor, snapFigure, SNAP, mathBox, overlapOf, figureCardFor, placeChip, findFigures, matterOf, pageMatter, primerUnitAt, deletePlan, chapterRefs, namedUnits, withoutRefs, primerBox, numberedChapter, primerBlocks, scanEntries, triggerLine };
});
