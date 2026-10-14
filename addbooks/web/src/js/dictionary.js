'use strict';
// Tinct · Add a book: the offline dictionary for the PDF reader's Define card.
// A static-page mirror of app/src/services/dictionary.ts: the same files (/data/dict/{letter}.json
// and archaic.json), the same normalisation and stems, the archaic supplement first, and only a
// successful download cached, so a later lookup retries. As there, shards are kept in memory for
// the page; a downloaded shard is also kept in the app's offline cache (Cache Storage
// 'tinct-offline-v3', public/sw.js), so a word looked up once is there with the network off.
// Loaded before reader.js as window.TinctDictionary.
(function (root, factory) {
  const api = factory();
  root.TinctDictionary = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  const SHARD_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const OFFLINE_CACHE = 'tinct-offline-v3';

  function shardKey(word) {
    const first = String(word).trim().toLowerCase().charAt(0);
    return SHARD_LETTERS.includes(first) ? first : null;
  }
  function normalize(word) {
    return String(word).normalize('NFKC').trim().toLowerCase().replace(/[‘’]/g, "'").replace(/\u00ad/g, '').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  }
  // Conservative stems, longer suffixes first (services/dictionary.ts stemCandidates).
  function stemCandidates(word) {
    const out = [], seen = new Set([word]);
    const push = s => { if (s && s.length >= 2 && !seen.has(s)) { seen.add(s); out.push(s) } };
    if (word.endsWith("'s")) push(word.slice(0, -2));
    if (word.endsWith("s'")) push(word.slice(0, -2));
    if (word.endsWith('ies') && word.length > 4) push(word.slice(0, -3) + 'y');
    if (word.endsWith('ied') && word.length > 4) push(word.slice(0, -3) + 'y');
    if (word.endsWith('ily') && word.length > 4) push(word.slice(0, -3) + 'y');
    if (word.endsWith('es') && word.length > 3) push(word.slice(0, -2));
    if (word.endsWith('ed') && word.length > 3) {
      push(word.slice(0, -2));
      push(word.slice(0, -1));
      if (/(.)\1ed$/.test(word)) push(word.slice(0, -3));
    }
    if (word.endsWith('ing') && word.length > 4) {
      push(word.slice(0, -3));
      push(word.slice(0, -3) + 'e');
      if (/(.)\1ing$/.test(word)) push(word.slice(0, -4));
    }
    if (word.endsWith('ly') && word.length > 3) push(word.slice(0, -2));
    if (word.endsWith('er') && word.length > 3) {
      push(word.slice(0, -2));
      push(word.slice(0, -1));
    }
    if (word.endsWith('est') && word.length > 4) {
      push(word.slice(0, -3));
      push(word.slice(0, -2));
    }
    if (word.endsWith('s') && word.length > 2) push(word.slice(0, -1));
    return out;
  }

  /** A dictionary over `fetchImpl` (and, when given, a Cache Storage `cachesImpl` for offline). */
  function createDictionary({ fetchImpl, cachesImpl, base = '/data/dict/' } = {}) {
    const shardCache = new Map(), shardLoading = new Map();
    const doFetch = fetchImpl || (typeof fetch === 'function' ? (...a) => fetch(...a) : null);
    const store = cachesImpl === undefined ? (typeof caches !== 'undefined' ? caches : null) : cachesImpl;
    async function fromOffline(url) {
      try { const c = await store?.open(OFFLINE_CACHE); const r = await c?.match(url); return r ? await r.json() : null } catch { return null }
    }
    function loadShard(letter) {
      const cached = shardCache.get(letter);
      if (cached) return Promise.resolve(cached);
      const inflight = shardLoading.get(letter);
      if (inflight) return inflight;
      const url = base + letter + '.json';
      const promise = (async () => {
        try {
          if (!doFetch) throw new Error('no fetch');
          const res = await doFetch(url);
          if (!res.ok) throw new Error(`shard ${letter} HTTP ${res.status}`);
          const copy = typeof res.clone === 'function' ? res.clone() : null;
          const data = await res.json();
          shardCache.set(letter, data);
          if (copy && store) store.open(OFFLINE_CACHE).then(c => c.put(url, copy)).catch(() => {});
          return data;
        } catch {
          // Offline: a shard downloaded before is in the offline cache.
          const kept = await fromOffline(url);
          if (kept && typeof kept === 'object') { shardCache.set(letter, kept); return kept }
          return {};
        } finally {
          shardLoading.delete(letter);
        }
      })();
      shardLoading.set(letter, promise);
      return promise;
    }
    // -> { word, definitions, resolvedFrom? } | null
    async function lookup(input) {
      const word = normalize(input);
      if (!word) return null;
      const letter = shardKey(word);
      if (!letter) return null;
      const [shard, archaic] = await Promise.all([loadShard(letter), loadShard('archaic')]);
      if (archaic[word]?.length) return { word, definitions: archaic[word] };
      const direct = shard[word];
      if (direct && direct.length) return { word, definitions: direct };
      for (const candidate of stemCandidates(word)) {
        const stemLetter = shardKey(candidate);
        if (!stemLetter) continue;
        const stemShard = stemLetter === letter ? shard : await loadShard(stemLetter);
        const hit = stemShard[candidate];
        if (hit && hit.length) return { word: candidate, resolvedFrom: word, definitions: hit };
      }
      return null;
    }
    const isFullyLoaded = () => SHARD_LETTERS.every(l => shardCache.has(l));
    // Every shard into the offline cache, one at a time, skipping those already there, so Define
    // works with the network off for any word. -> true when all are kept.
    async function warm() {
      if (!store || !doFetch) return false;
      try {
        const c = await store.open(OFFLINE_CACHE);
        for (const letter of ['archaic', ...SHARD_LETTERS]) {
          const url = base + letter + '.json';
          if (await c.match(url)) continue;
          const res = await doFetch(url);
          if (!res.ok) return false;
          await c.put(url, res);
        }
        return true;
      } catch { return false }
    }
    return { lookup, loadShard, isFullyLoaded, warm };
  }

  const shared = typeof window !== 'undefined' ? createDictionary() : null;
  return { normalize, stemCandidates, shardKey, createDictionary, OFFLINE_CACHE, lookup: input => shared ? shared.lookup(input) : Promise.resolve(null), warm: () => shared ? shared.warm() : Promise.resolve(false) };
});
