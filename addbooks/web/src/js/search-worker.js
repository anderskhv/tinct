// Catalogue search off the main thread. The ranking is the search engine's own
// (addbooks/site/search.js, copied in at build time as ./search.js).
import { createSearch, hydrate } from './search.js';
let search = null, byId = null;
// The page shows a slim copy of each work; editions carry only what a result card needs.
const slim = w => ({ id: w.id, title: w.title, subtitle: w.subtitle, authors: w.authors, translators: w.translators, language: w.language, onTinct: w.onTinct, tinctIds: w.tinctIds, firstPublishedYear: w.firstPublishedYear,
  editions: w.editions.slice(0, 1).map(e => ({ source: e.source, sourceUrl: e.sourceUrl, epubUrl: e.epubUrl, licence: e.licence })) });
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      const response = await fetch(new URL('../data/catalog.json.gz', import.meta.url));
      if (!response.ok) throw new Error('catalogue missing');
      const catalog = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json();
      const works = hydrate(catalog.works);
      // Slim records keep authors on the work only; the ranking reads them from editions.
      for (const w of works) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
      search = createSearch(works);
      byId = new Map(works.map(w => [w.id, w]));
      self.postMessage({ type: 'ready', total: works.length, sources: new Set(works.flatMap(w => w.editions.map(e => e.source))).size });
    } else if (data.type === 'search' && search) {
      const out = search(data.query, data.filters || {}, data.limit || 12);
      self.postMessage({ type: 'results', request: data.request, total: out.total, results: out.results.map(slim) });
    } else if (data.type === 'get' && byId) {
      const w = byId.get(data.id);
      self.postMessage({ type: 'work', request: data.request, work: w ? slim(w) : null });
    }
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e?.message || e) });
  }
};
