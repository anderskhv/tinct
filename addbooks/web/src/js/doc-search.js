'use strict';
// Tinct · Add a book: searching the whole of a long PDF for a question's terms (docs/margin/
// FIXES-2026-10-15.md, long books, item 8). A book over the margin's whole-document limit sends its
// current chapter and its contents; this finds the few other passages a question needs ("where is
// Sarsa introduced" -> the page that introduces it), from the text the reader has already extracted.
//   const index = TinctDocSearch.create()
//   index.add(page, text)                 pages in any order, as they are read (incremental)
//   index.search(query, { limit, skip })  -> [{ page, text, score }], best first, at most one per page
// Ranking: BM25 over overlapping windows of about 90 words, with a light English stemmer, a bonus
// for query terms that stand together, and one for the window where a rare term first appears (the
// place a book introduces something). Pure; no browser APIs (the tests run it in Node).
(function (global) {
  const WINDOW = 90, STEP = 60, PASSAGE_CHARS = 900;
  const K1 = 1.2, B = 0.75;
  // Words that carry nothing in a question about a book ("where is X introduced" keeps X and "introduced").
  const STOP = new Set(('a an and are as at be been but by can could did do does for from had has have how i if in into is it its '
    + 'me my of on or our so than that the their them then there these they this those to us was we were what when where which '
    + 'who whom whose why will with would you your about tell explain book chapter page pages text say says said mean means please '
    + 'does doing done also any some more most other such only same very just').split(' '));
  const fold = s => String(s).toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
  /** A word's stem: plurals, -ing, -ed and a final e go, so "introduced", "introduces" and "introduce" meet. */
  function stem(word) {
    let w = word.replace(/['’]s$/, '');
    if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y';
    else if (w.length > 4 && /(?:sses|shes|ches|xes)$/.test(w)) w = w.slice(0, -2);
    else if (w.length > 3 && /[^su]s$/.test(w)) w = w.slice(0, -1);
    if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 4 && /ed$/.test(w)) w = w.slice(0, -2);
    if (w.length > 4 && /e$/.test(w)) w = w.slice(0, -1);
    return w;
  }
  /** The text's words with where they are: [{ term, from, to }]. Numbers stay (a question can name "16.1"). */
  function tokens(text) {
    const out = [], re = /[\p{L}\p{N}]+(?:[’'.-][\p{L}\p{N}]+)*/gu;
    const s = String(text || '');
    let m;
    while ((m = re.exec(s))) {
      const raw = fold(m[0]).replace(/[’']/g, '');
      for (const part of raw.split(/[.-]/)) if (part) out.push({ term: stem(part), word: part, from: m.index, to: m.index + m[0].length });
    }
    return out;
  }
  /** A question's terms, without the words that carry nothing. */
  function queryTerms(query) {
    const words = tokens(query).filter(t => !STOP.has(t.word) && (t.word.length > 1 || /\d/.test(t.word)));
    return [...new Set(words.map(t => t.term))];
  }

  function create() {
    const pages = new Map(); // page -> text
    const windows = [];      // { page, from, to, len }
    const postings = new Map(); // term -> [window, count, window, count, …], in order added (flat: a 500-page book stays a few MB)
    let totalLen = 0;
    function add(page, text) {
      if (pages.has(page)) return;
      const value = String(text || '');
      pages.set(page, value);
      const toks = tokens(value);
      for (let start = 0; start < toks.length; start += STEP) {
        const part = toks.slice(start, start + WINDOW);
        if (!part.length) break;
        const tf = new Map();
        for (const t of part) tf.set(t.term, (tf.get(t.term) || 0) + 1);
        const id = windows.length;
        windows.push({ page, from: part[0].from, to: part.at(-1).to, len: part.length });
        totalLen += part.length;
        for (const [term, count] of tf) { let list = postings.get(term); if (!list) postings.set(term, (list = [])); list.push(id, count) }
        if (start + WINDOW >= toks.length) break;
      }
    }
    /**
     * The best windows for `query`, at most one per page and `limit` in all, each as up to 900
     * characters of its page round the terms. `skip`: pages to leave out (those the request already
     * carries, an index, a reference list).
     */
    function search(query, { limit = 5, skip = null } = {}) {
      const terms = queryTerms(query).filter(t => postings.has(t));
      const N = windows.length;
      if (!terms.length || !N) return [];
      const avg = totalLen / N;
      const idf = new Map(terms.map(t => { const df = postings.get(t).length / 2; return [t, Math.log(1 + (N - df + 0.5) / (df + 0.5))] }));
      const scores = new Map();
      for (const t of terms) {
        const list = postings.get(t);
        for (let k = 0; k < list.length; k += 2) {
          const id = list[k], f = list[k + 1], w = windows[id];
          scores.set(id, (scores.get(id) || 0) + idf.get(t) * (f * (K1 + 1)) / (f + K1 * (1 - B + B * w.len / avg)));
        }
      }
      // Terms that stand together ("semi-gradient Sarsa", "TD error") count again: read again for the best windows only.
      if (terms.length > 1) for (const [id] of [...scores].sort((a, b) => b[1] - a[1]).slice(0, 60)) {
        const w = windows[id], seq = tokens(pages.get(w.page).slice(w.from, w.to)).map(t => t.term);
        for (let k = 0; k + 1 < seq.length; k++) if (seq[k] !== seq[k + 1] && terms.includes(seq[k]) && terms.includes(seq[k + 1])) { scores.set(id, scores.get(id) + 0.5 * Math.min(idf.get(seq[k]), idf.get(seq[k + 1]))); break }
      }
      // Where a rare term first appears is often where the book introduces it.
      for (const t of terms) {
        const list = postings.get(t);
        if (list.length / 2 > Math.max(3, N * 0.05)) continue;
        let first = list[0];
        for (let k = 2; k < list.length; k += 2) { const b = list[k]; if (windows[b].page < windows[first].page || (windows[b].page === windows[first].page && b < first)) first = b }
        scores.set(first, scores.get(first) + 0.6 * idf.get(t));
      }
      const ranked = [...scores].filter(([id]) => !skip || !skip.has(windows[id].page)).sort((a, b) => b[1] - a[1] || windows[a[0]].page - windows[b[0]].page);
      const out = [], used = new Set();
      for (const [id, score] of ranked) {
        const w = windows[id];
        if (used.has(w.page)) continue;
        used.add(w.page);
        out.push({ page: w.page, at: centre(pages.get(w.page), w, terms), text: excerpt(pages.get(w.page), w, terms), score: Math.round(score * 1000) / 1000 });
        if (out.length >= limit) break;
      }
      return out;
    }
    /** Where in its page the window's first query term is. */
    function centre(text, w, terms) {
      const hit = tokens(text.slice(w.from, w.to)).find(t => terms.includes(t.term));
      return w.from + (hit ? hit.from : 0);
    }
    /** Up to PASSAGE_CHARS of the page round the window's first query term, cut at word boundaries. */
    function excerpt(text, w, terms) {
      const at = centre(text, w, terms);
      let from = Math.max(0, Math.min(w.from, at - PASSAGE_CHARS / 3)), to = Math.min(text.length, from + PASSAGE_CHARS);
      from = Math.max(0, Math.min(from, to - PASSAGE_CHARS));
      if (from > 0) { const sp = text.indexOf(' ', from); if (sp > 0 && sp < from + 40) from = sp + 1 }
      if (to < text.length) { const sp = text.lastIndexOf(' ', to); if (sp > to - 40) to = sp }
      return `${from > 0 ? '…' : ''}${text.slice(from, to).replace(/\s+/g, ' ').trim()}${to < text.length ? '…' : ''}`;
    }
    return { add, search, has: page => pages.has(page), get size() { return pages.size } };
  }

  /* ---------- A hit's whole section (retest 15 Oct: "the definition falls past the text I have") ----------
     A search window is a few lines; the reader's question is usually answered by the section it falls in.
     A section runs from the last contents entry (outline, printed contents or headings) at or before the hit
     to the next entry after it: its title is found on its first page, the next entry's on the last. */
  const plain = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  /** Where a contents entry's title starts on its page (its first words, letters and digits only), else -1. */
  function titleAt(text, title) {
    const want = plain(title).split(' ').filter(Boolean);
    if (!want.length) return -1;
    // Each word's position in the page, folded as the title is.
    const words = [], re = /[\p{L}\p{N}]+/gu;
    for (let m; (m = re.exec(text));) words.push({ w: m[0].toLowerCase(), at: m.index });
    // The title without a leading number ("17.1 General Value Functions" may print as "17.1" then the words).
    const tries = [want.slice(0, 4), want.filter(w => !/^[\d.]+$/.test(w)).slice(0, 4)].filter(t => t.length);
    for (const t of tries) for (let i = 0; i + t.length <= words.length; i++) if (t.every((w, k) => words[i + k].w === w)) return words[i].at;
    return -1;
  }
  /**
   * The search's hits as their sections, in the hits' order: { n, text } with "[p. N]" where each later page
   * starts. Each section at most `cap` characters (a longer one: the part round its hit, from a word); all of
   * them at most `budget`, after which a hit keeps its own excerpt while that fits. A hit with no contents
   * entry before it keeps its excerpt. Hits in one section become one passage.
   * `hits`: [{ page, at, text }]; `entries`: [{ title, page }]; `texts`: page texts (texts[n - 1]); `label(n)`: a page's printed label.
   */
  function sections(hits, { entries = [], texts = [], label = n => String(n), cap = 16000, budget = 40000 } = {}) {
    const list = (entries || []).filter(e => e && e.title && Number.isInteger(e.page) && e.page >= 1 && e.page <= texts.length)
      .map(e => ({ title: e.title, page: e.page, at: Math.max(0, titleAt(String(texts[e.page - 1] || ''), e.title)) }))
      .sort((a, b) => a.page - b.page || a.at - b.at);
    const out = [], seen = new Set();
    let used = 0;
    for (const hit of hits || []) {
      const at = Number.isInteger(hit.at) ? hit.at : 0;
      const before = list.filter(e => e.page < hit.page || (e.page === hit.page && e.at <= at));
      const start = before[before.length - 1], end = list.find(e => e.page > hit.page || (e.page === hit.page && e.at > at));
      const key = start ? start.page + ':' + start.at : null;
      if (key && seen.has(key)) continue;
      let passage = null;
      if (start) {
        seen.add(key);
        const last = end ? end.page : Math.min(texts.length, start.page + 30);
        const parts = [];
        let hitAt = 0, length = 0;
        for (let n = start.page; n <= last; n++) {
          let text = String(texts[n - 1] || '');
          const from = n === start.page ? start.at : 0, to = end && n === end.page ? end.at : text.length;
          if (n === hit.page) hitAt = length + (n === start.page ? 0 : `[p. ${label(n)}] `.length) + Math.max(0, at - from);
          text = text.slice(from, to).replace(/\s+/g, ' ').trim();
          if (!text) continue;
          const piece = (n === start.page ? '' : `[p. ${label(n)}] `) + text;
          parts.push(piece); length += piece.length + 1;
        }
        // The next section's number, printed before its title, is not this section's.
        let whole = parts.join(' ');
        if (end) whole = whole.replace(/\s+(?:\[p\. [^\]]+\]\s*)?\d+(?:\.\d+)+\.?$/, '');
        if (whole.length > cap) {
          // Too long: the part round the hit, from a word.
          let from = Math.max(0, Math.min(hitAt - Math.floor(cap / 3), whole.length - cap));
          if (from > 0) { const sp = whole.indexOf(' ', from); if (sp > 0 && sp < from + 40) from = sp + 1 }
          let to = Math.min(whole.length, from + cap);
          if (to < whole.length) { const sp = whole.lastIndexOf(' ', to); if (sp > to - 40) to = sp }
          whole = (from > 0 ? '…' : '') + whole.slice(from, to) + (to < whole.length ? '…' : '');
        }
        if (whole && used + whole.length <= budget) passage = { n: label(start.page), text: whole };
      }
      if (!passage && hit.text && used + hit.text.length <= budget) passage = { n: label(hit.page), text: hit.text };
      if (passage) { out.push(passage); used += passage.text.length }
    }
    return out;
  }

  global.TinctDocSearch = { create, queryTerms, stem, tokens, sections, titleAt };
})(typeof window !== 'undefined' ? window : globalThis);
