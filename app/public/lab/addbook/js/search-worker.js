// Catalogue search off the main thread. The ranking is the search engine's own
// (addbooks/site/search.js, copied in at build time as ./search.js).
import { createSearch, hydrate, borrowFor, applyPriors, altTitlesFor, containedWorksFor, includedWork, fame } from './search.js?v=20261008rel6';
let search = null, byId = null, catalogue = null, sitelinks = new Map();
// The page shows a slim copy of each work; editions carry only what a result card needs. Other
// titles and the Wikidata work let the library tell a copy of one of its books (public-books.js).
const slim = w => ({ id: w.id, page: w.page, title: w.title, subtitle: w.subtitle, authors: w.authors, translators: w.translators, language: w.language, onTinct: w.onTinct, tinctIds: w.tinctIds, firstPublishedYear: w.firstPublishedYear,
  altTitles: [...new Set([...w.altTitles, ...altTitlesFor(w.title, w.authors.map(p => p.name).join(' '))])], wikidata: w.wikidata || null,
  editions: w.editions.slice(0, 1).map(e => ({ source: e.source, sourceUrl: e.sourceUrl, epubUrl: e.epubUrl, licence: e.licence })),
  // How well known it is (the ranking's fame), and the works a collection holds, with theirs (from the priors' sitelinks).
  fame: Math.round(fame(w) * 100) / 100, contains: contains(w) });
const names = w => w.authors.map(p => p.name).join(' ');
const contains = w => containedWorksFor(w.title, names(w)).map(c => ({ title: c.title, fame: c.wikidata && sitelinks.get(c.wikidata) ? Math.round(fame({ sitelinks: sitelinks.get(c.wikidata) }) * 100) / 100 : 0 }));
// Work priors (Wikidata work, sitelinks, English name): without them the catalogue ranks as before.
const loadPriors = () => fetch(new URL('../data/work-priors.json?v=20261008rel6', import.meta.url)).then(r => r.ok ? r.json() : null).catch(() => null);
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      const priors = loadPriors();
      const response = await fetch(new URL('../data/catalog.json.gz', import.meta.url));
      if (!response.ok) throw new Error('catalogue missing');
      // Some hosts already decode .gz files in transit; only gunzip bytes that are still gzip.
      const bytes = new Uint8Array(await response.arrayBuffer());
      const gz = bytes[0] === 0x1f && bytes[1] === 0x8b;
      const catalog = gz ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json() : JSON.parse(new TextDecoder().decode(bytes));
      const works = applyPriors(hydrate(catalog.works), await priors);
      // Slim records keep authors on the work only; the ranking reads them from editions.
      for (const w of works) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
      search = createSearch(works);
      catalogue = works;
      byId = new Map(works.map(w => [w.id, w]));
      for (const w of works) if (w.wikidata && w.sitelinks) sitelinks.set(w.wikidata, Math.max(sitelinks.get(w.wikidata) || 0, w.sitelinks));
      self.postMessage({ type: 'ready', total: works.length, sources: new Set(works.flatMap(w => w.editions.map(e => e.source))).size });
    } else if (data.type === 'search' && search) {
      const out = search(data.query, data.filters || {}, data.limit || 12);
      self.postMessage({ type: 'results', request: data.request, total: out.total, results: out.results.map(w => { const item = slim(w), includes = includedWork(w.title, names(w), data.query); return includes ? { ...item, includes } : item }) });
    } else if (data.type === 'borrow' && catalogue) {
      // The library's own books, ranked with this engine, borrow what the catalogue knows of them.
      self.postMessage({ type: 'borrowed', request: data.request, borrowed: borrowFor(data.books || [], catalogue) });
    } else if (data.type === 'get' && byId) {
      const w = byId.get(data.id);
      self.postMessage({ type: 'work', request: data.request, work: w ? slim(w) : null });
    }
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e?.message || e) });
  }
};
