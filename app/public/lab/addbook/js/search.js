// Shared by the worker and the standalone Node verification. No app dependencies.
const STOP = new Set(['a', 'an', 'the', 'of', 'and', 'in', 'to', 'by', 'for']);
// Letters NFKD does not decompose, so "Kobenhavn" finds "København" and "strasse" finds "Straße".
const FOLD = {'ø':'o','æ':'ae','œ':'oe','ß':'ss','ł':'l','đ':'d','ð':'d','þ':'th','ı':'i'};
export function normalize(value) {
  return value.toLowerCase().replace(/[øæœßłđðþı]/g, c => FOLD[c]).normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/dostoyevsky|dostoievski|dostoievsky|dostoevskii|dostoyevski/g, 'dostoevsky')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const tokens = value => normalize(value).split(' ').filter(Boolean);
// Exact-title ranking ignores a leading article in any catalogue language ("The Odyssey" = "Odyssey").
const ARTICLE = /^(the|a|an|le|la|les|l|un|une|der|die|das|ein|eine|el|los|las|il|lo|gli|o|os|as|de|het|een|den|det|en|et|ett) /;
const core = value => value.replace(ARTICLE, '');
export function near(a, b, limit = 1) {
  if (Math.abs(a.length - b.length) > limit) return false;
  // Bounded Damerau-Levenshtein, including an adjacent transposition.
  let prev2, prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1]));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], prev2[j - 2] + 1);
    }
    if (Math.min(...row) > limit) return false;
    prev2 = prev; prev = row;
  }
  return prev[b.length] <= limit;
}
// The catalogue omits empty fields to stay small; restore the shape every consumer expects.
const person = p => ({birthYear: null, deathYear: null, aliases: [], ...p});
export function hydrate(works) {
  for (const w of works) {
    w.authors = (w.authors || []).map(person); w.translators = (w.translators || []).map(person);
    w.subjects ||= []; w.bookshelves ||= []; w.altTitles ||= []; w.tinctIds ||= []; w.onTinct ||= false;
    w.title ??= ''; w.language ||= ['und']; w.subtitle ??= null; w.firstPublishedYear ??= null; w.originalLanguage ??= null;
    for (const e of w.editions) {
      e.authors = (e.authors || []).map(person); e.translators = (e.translators || []).map(person);
      e.title ??= ''; e.subjects ||= []; e.bookshelves ||= []; e.language ||= ['und'];
      e.epubUrl ??= null; e.coverUrl ??= null; e.sourceUrl ??= null; e.subtitle ??= null; e.popularity ??= 0;
    }
  }
  return works;
}
// Ranking (Anders, 2026-10-07): tiers first, then popularity within a tier.
//   1  the title starts with the query, or a title word is a query word; and, when the query
//      is an author's name ("dostoevsky", "jane austen", see authorQuery), that author's books
//   2  a title word starts with a query word ("faust" -> "Faustus")   2.5 a title word is a near spelling
//   3  the author's own name has the word, or a word starting with it   3.5 a near spelling
//   4  a translator, the subtitle, a subject or a bookshelf             4.5 a near spelling
//   5  only another name of an author or translator ("Faust, Frederick Schiller" for Max Brand).
//      Counted only when that one name holds at least two of a query's words ("frederick faust"):
//      a single word found only there is dropped, so "faust" does not list Max Brand's westerns.
// Every query word must be found somewhere; a work's tier is that of its best-placed word.
// Within a tier: English first when no language is chosen, then a score of popularity plus
// the share of the query's words the title holds and a bonus when a title is exactly the query
// (an author's own book, for their name, counts as both),
// so "meditations marcus" puts Meditations by Marcus Aurelius above small editions titled "Marcus Aurelius".
const TITLE = 1, AUTHOR = 2, OTHER = 3;
// [exact word, word starting with it, near spelling] for each field.
const TIER = {[TITLE]: [1, 2, 2.5], [AUTHOR]: [3, 3, 3.5], [OTHER]: [4, 4, 4.5]};
const EXACT = 0, PREFIX = 1, NEAR = 2;
const TITLE_COVER = [1, 0.75, 0.6];
const ALIAS_TIER = 5, INDEX_TIER = 4.9;
// A title that is exactly the query ("La divina commedia") outweighs a 10,000-fold popularity gap.
const EXACT_TITLE = 4;
export function createSearch(works) {
  const inverted = new Map(), vocabByLength = new Map();
  const add = (token, id) => {
    let ids = inverted.get(token);
    if (!ids) {
      inverted.set(token, ids = []);
      if (!vocabByLength.has(token.length)) vocabByLength.set(token.length, []);
      vocabByLength.get(token.length).push(token);
    }
    ids.push(id);
  };
  const people = w => [...w.editions.flatMap(e => e.authors), ...w.editions.flatMap(e => e.translators)];
  const docs = works.map((w, id) => {
    // Each word with the best field it appears in.
    const field = new Map();
    const put = (text, f) => { for (const t of tokens(text || '')) if (!(field.get(t) <= f)) field.set(t, f); };
    const titles = [w.title, ...w.editions.map(e => e.title), ...(w.altTitles || [])];
    titles.forEach(t => put(t, TITLE));
    const authors = w.editions.flatMap(e => e.authors);
    authors.forEach(p => put(p.name, AUTHOR));
    w.editions.flatMap(e => e.translators).forEach(p => put(p.name, OTHER));
    [w.subtitle, ...w.subjects, ...w.bookshelves].forEach(t => put(t, OTHER));
    for (const t of field.keys()) add(t, id);
    // Other names are indexed so a multi-word query can find them; their words rank only as tier 5.
    const aliasWords = new Set();
    for (const p of people(w)) for (const a of p.aliases || []) for (const t of tokens(a)) if (!field.has(t)) aliasWords.add(t);
    for (const t of aliasWords) add(t, id);
    const title = core(normalize(w.title));
    return {field, titles: [...new Set(titles.filter(Boolean).map(t => core(normalize(t))))],
      author: new Set(authors.flatMap(p => tokens(p.name))), index: /^index of (the )?project gutenberg/.test(title)};
  });
  const expansionCache = new Map();
  function expand(term) {
    if (expansionCache.has(term)) return expansionCache.get(term);
    const matches = new Map();
    if (inverted.has(term)) matches.set(term, EXACT);
    const limit = term.length >= 7 ? 2 : 1;
    // Prefixes allow incremental typing. Never turn short words into fuzzy noise.
    for (let length = term.length; length <= term.length + 8; length++) {
      for (const word of vocabByLength.get(length) || []) {
        if (term.length >= 3 && word !== term && word.startsWith(term)) matches.set(word, PREFIX);
      }
    }
    if (term.length >= 4) {
      for (let length = term.length - limit; length <= term.length + limit; length++) {
        for (const word of vocabByLength.get(length) || []) {
          if (!matches.has(word) && near(term, word, limit)) matches.set(word, NEAR);
        }
      }
    }
    if (expansionCache.size > 150) expansionCache.clear();
    expansionCache.set(term, matches);
    return matches;
  }
  // Tier 5: one other name of the work's people that holds at least two query words,
  // including every word `missing` (found nowhere else). Infinity when there is none.
  function aliasTier(w, expansions, missing) {
    if (expansions.length < 2) return Infinity;
    for (const p of people(w)) for (const a of p.aliases || []) {
      const words = new Set(tokens(a));
      const holds = expansions.map(expansion => [...expansion.keys()].some(t => words.has(t)));
      if (holds.filter(Boolean).length >= 2 && missing.every(i => holds[i])) return ALIAS_TIER;
    }
    return Infinity;
  }
  return function search(query, filters = {}, limit = 24) {
    const started = performance.now();
    const normalized = core(normalize(query));
    const allTokens = [...new Set(tokens(query))];
    const meaningful = allTokens.filter(t => !STOP.has(t));
    const terms = meaningful.length ? meaningful : allTokens;
    const expansions = terms.map(expand);
    const preferEnglish = !filters.language;
    let candidates;
    if (terms.length) {
      const sets = expansions.map(expansion => {
        const ids = new Set();
        for (const token of expansion.keys()) for (const id of inverted.get(token) || []) ids.add(id);
        return ids;
      }).sort((a, b) => a.size - b.size);
      candidates = [...sets[0]].filter(id => sets.every(set => set.has(id)));
    } else candidates = works.map((_, i) => i);
    const ranked = [];
    for (const id of candidates) {
      const w = works[id];
      if (filters.language && !w.language.includes(filters.language)) continue;
      if (filters.standardOnly && w.quality !== 'clean') continue;
      if (filters.source && !w.editions.some(e => e.source === filters.source)) continue;
      if (filters.subject && ![...w.subjects, ...w.bookshelves].includes(filters.subject)) continue;
      const doc = docs[id];
      let tier = terms.length ? Infinity : 1, cover = 0;
      const missing = [];
      expansions.forEach((expansion, i) => {
        let best = Infinity, inTitle = 0;
        for (const [token, kind] of expansion) {
          const f = doc.field.get(token);
          if (!f) continue;
          best = Math.min(best, TIER[f][kind]);
          if (f === TITLE) inTitle = Math.max(inTitle, TITLE_COVER[kind]);
        }
        if (best === Infinity) missing.push(i);
        tier = Math.min(tier, best);
        cover += inTitle;
      });
      if (missing.length) {
        const alias = aliasTier(w, expansions, missing);
        if (alias === Infinity) continue;
        tier = Math.min(tier, alias);
      }
      const exact = !!normalized && doc.titles.includes(normalized);
      if (exact || (normalized && doc.titles.some(t => t.startsWith(normalized + ' ')))) tier = 1;
      const byAuthor = terms.length > 0 && terms.every(t => doc.author.has(t));
      ranked.push({id, tier, cover, exact, byAuthor, index: doc.index});
    }
    // The query is an author's name when more matching works carry it as their author's own
    // name than as a title ("dostoevsky", "jane austen"; not "faust"): then the author's books
    // rank with the title matches, as if their titles were the query.
    const titled = ranked.filter(r => r.tier === 1 && !r.byAuthor).length;
    const authorQuery = ranked.filter(r => r.byAuthor).length > titled;
    for (const r of ranked) {
      if (authorQuery && r.byAuthor) { r.tier = 1; r.cover = terms.length; r.exact = true; }
      if (r.index) r.tier = Math.max(r.tier, INDEX_TIER);
      const w = works[r.id];
      r.english = preferEnglish && w.language.includes('en') ? 1 : 0;
      r.score = 3 * r.cover / Math.max(1, terms.length) + (r.exact ? EXACT_TITLE : 0) + Math.log10(1 + w.popularity) + (w.quality === 'clean' ? 0.4 : 0);
    }
    ranked.sort((a, b) => a.tier - b.tier || b.english - a.english || b.score - a.score
      || works[a.id].title.localeCompare(works[b.id].title) || works[a.id].id.localeCompare(works[b.id].id));
    return {total: ranked.length, results: ranked.slice(0, limit).map(({id}) => works[id]), elapsedMs: Math.round((performance.now() - started) * 10) / 10};
  };
}
