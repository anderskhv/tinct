// Shared by the worker and the standalone Node verification. No app dependencies.
const STOP = new Set(['a', 'an', 'the', 'of', 'and', 'in', 'to', 'by', 'for']);
export function normalize(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/dostoyevsky|dostoievski|dostoievsky|dostoevskii|dostoyevski/g, 'dostoevsky')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const tokens = value => normalize(value).split(' ').filter(Boolean);
const personText = p => [p.name, ...(p.aliases || [])].join(' ');
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
export function createSearch(works) {
  const inverted = new Map(), vocabByLength = new Map();
  const docs = works.map((w, id) => {
    const fields = [w.editions.map(e => e.title).join(' '),
      w.editions.flatMap(e => e.authors).map(personText).join(' '),
      w.editions.flatMap(e => e.translators).map(personText).join(' '),
      [w.subtitle || '', ...w.subjects, ...w.bookshelves].join(' ')].map(tokens);
    const weights = new Map();
    fields.forEach((field, f) => field.forEach(t => weights.set(t, Math.max(weights.get(t) || 0, [12, 10, 7, 2][f]))));
    for (const token of weights.keys()) {
      if (!inverted.has(token)) {
        inverted.set(token, []);
        if (!vocabByLength.has(token.length)) vocabByLength.set(token.length, []);
        vocabByLength.get(token.length).push(token);
      }
      inverted.get(token).push(id);
    }
    return {weights, title: normalize(w.title), author: new Set(fields[1]), titleTerms: new Set(tokens(w.title).filter(t => !STOP.has(t)))};
  });
  const expansionCache = new Map();
  function expand(term) {
    if (expansionCache.has(term)) return expansionCache.get(term);
    const matches = new Map();
    if (inverted.has(term)) matches.set(term, 1);
    const limit = term.length >= 7 ? 2 : 1;
    // Prefixes allow incremental typing. Never turn short words into fuzzy noise.
    for (let length = term.length; length <= term.length + 8; length++) {
      for (const word of vocabByLength.get(length) || []) {
        if (term.length >= 3 && word !== term && word.startsWith(term)) matches.set(word, 0.74);
      }
    }
    if (term.length >= 4) {
      for (let length = term.length - limit; length <= term.length + limit; length++) {
        for (const word of vocabByLength.get(length) || []) {
          if (!matches.has(word) && near(term, word, limit)) matches.set(word, 0.58);
        }
      }
    }
    if (expansionCache.size > 150) expansionCache.clear();
    expansionCache.set(term, matches);
    return matches;
  }
  return function search(query, filters = {}, limit = 24) {
    const started = performance.now();
    const normalized = normalize(query);
    const allTokens = [...new Set(tokens(query))];
    const meaningful = allTokens.filter(t => !STOP.has(t));
    const terms = meaningful.length ? meaningful : allTokens;
    const expansions = terms.map(expand);
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
      if (filters.subject && ![...w.subjects, ...w.bookshelves].includes(filters.subject)) continue;
      let score = 0;
      const doc = docs[id];
      for (const expansion of expansions) {
        let best = 0;
        for (const [token, factor] of expansion) best = Math.max(best, (doc.weights.get(token) || 0) * factor);
        score += best;
      }
      if (terms.length && terms.every(t => doc.author.has(t))) score += 55;
      if (terms.length) score += 15 * terms.filter(t => doc.titleTerms.has(t)).length / Math.max(1, doc.titleTerms.size);
      if (/^index of (the )?project gutenberg/.test(doc.title)) score -= 45;
      if (normalized && doc.title === normalized) score += 30;
      else if (normalized && doc.title.includes(normalized)) score += 15;
      // Popularity is bounded so an unrelated popular subject match cannot win.
      score += Math.log10(1 + w.popularity) * 1.4 + (w.quality === 'clean' ? 0.4 : 0);
      ranked.push({id, score});
    }
    ranked.sort((a, b) => b.score - a.score || works[a.id].title.localeCompare(works[b.id].title) || works[a.id].id.localeCompare(works[b.id].id));
    return {total: ranked.length, results: ranked.slice(0, limit).map(({id}) => works[id]), elapsedMs: Math.round((performance.now() - started) * 10) / 10};
  };
}
