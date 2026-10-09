// Catalogue search off the main thread. The ranking is the search engine's own
// (addbooks/site/search.js, copied in at build time as ./search.js).
import { createSearch, hydrate, borrowFor, applyPriors, altTitlesFor, containedWorksFor, includedWork, renown } from './search.js?v=20261009rel1';
let search = null, byId = null, catalogue = null, english = null, sitelinks = new Map(), priorsTable = null;
// The page shows a slim copy of each work; editions carry only what a result card needs. Other
// titles and the Wikidata work let the library tell a copy of one of its books (public-books.js).
const slim = w => ({ id: w.id, page: w.page, title: w.title, subtitle: w.subtitle, authors: w.authors, translators: w.translators, language: w.language, onTinct: w.onTinct, tinctIds: w.tinctIds, firstPublishedYear: w.firstPublishedYear,
  altTitles: [...new Set([...w.altTitles, ...altTitlesFor(w.title, w.authors.map(p => p.name).join(' '))])], wikidata: w.wikidata || null,
  editions: w.editions.slice(0, 1).map(e => ({ source: e.source, sourceUrl: e.sourceUrl, epubUrl: e.epubUrl, licence: e.licence })),
  // How well known it is (the ranking's fame, search.js renown), and the works a collection holds, with theirs (from the priors' sitelinks).
  fame: Math.round(renown(w) * 100) / 100, contains: contains(w) });
const names = w => w.authors.map(p => p.name).join(' ');
const contains = w => containedWorksFor(w.title, names(w)).map(c => ({ title: c.title, fame: c.wikidata && sitelinks.get(c.wikidata) ? Math.round(renown({ sitelinks: sitelinks.get(c.wikidata) }) * 100) / 100 : 0 }));
// Work priors (Wikidata work, sitelinks, English name): without them the catalogue ranks as before.
const loadPriors = () => fetch(new URL('../data/work-priors.json?v=20261009rel1', import.meta.url)).then(r => r.ok ? r.json() : null).catch(() => null);
// The catalogue comes in two parts when the build made them (app/scripts/build-catalogue-shards.mjs):
// its English works first, which every search without a chosen language needs (Add imports English
// only), and the other languages only when a search asks for one. Without the parts, the whole file.
const DATA = name => new URL('../data/' + name, import.meta.url);
async function readCatalogue(name) {
  const response = await fetch(DATA(name));
  if (!response.ok) return null;
  // Some hosts already decode .gz files in transit; only gunzip bytes that are still gzip.
  const bytes = new Uint8Array(await response.arrayBuffer());
  const gz = bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (gz) return await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
  // A host that answers a missing file with a page (the dev server's index.html) has no such part.
  const text = new TextDecoder().decode(bytes);
  return text.trimStart().startsWith('{') ? JSON.parse(text) : null;
}
function prepare(list) {
  const works = applyPriors(hydrate(list), priorsTable);
  // Slim records keep authors on the work only; the ranking reads them from editions.
  for (const w of works) for (const e of w.editions) { if (!e.authors.length) e.authors = w.authors; if (!e.translators.length) e.translators = w.translators; if (!e.title) e.title = w.title }
  for (const w of works) if (w.wikidata && w.sitelinks) sitelinks.set(w.wikidata, Math.max(sitelinks.get(w.wikidata) || 0, w.sitelinks));
  return works;
}
function install(works) {
  search = createSearch(works);
  catalogue = works;
  byId = new Map(works.map(w => [w.id, w]));
}
// The other languages, once: resolves true when the whole catalogue is searchable.
let whole = null, complete = false;
function loadRest() {
  if (complete) return Promise.resolve(true);
  if (!whole) whole = readCatalogue('catalog-more.json.gz').then(more => {
    if (!more) return false;
    install([...catalogue, ...prepare(more.works)]);
    complete = true;
    return true;
  }).catch(() => false);
  return whole;
}
const isEnglish = w => w.language.includes('en');
const send = (data, out) => {
  const flagged = out.author?.works;
  return { type: 'results', request: data.request, total: out.total,
    // The author the query names (search.js identify), and which results are theirs, for the author card.
    author: out.author ? { name: out.author.name, names: out.author.names, birthYear: out.author.birthYear, deathYear: out.author.deathYear } : null,
    results: out.results.map(w => { const item = slim(w), includes = includedWork(w.title, names(w), data.query); if (flagged?.has(w)) item.byAuthor = true; return includes ? { ...item, includes } : item }) };
};
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      const priors = loadPriors();
      let catalog = await readCatalogue('catalog-en.json.gz');
      complete = !catalog;
      if (!catalog) catalog = await readCatalogue('catalog.json.gz');
      if (!catalog) throw new Error('catalogue missing');
      priorsTable = await priors;
      // Every Wikidata work's sitelinks, from the priors: a collection's works lend their fame to the
      // author card even when their own editions are in the part not loaded (Latin Seneca dialogues).
      for (const [wikidata, links] of Object.values(priorsTable?.works || {})) if (wikidata && links) sitelinks.set(wikidata, Math.max(sitelinks.get(wikidata) || 0, links));
      const works = prepare(catalog.works);
      install(works);
      english = complete ? works.filter(isEnglish) : works;
      self.postMessage({ type: 'ready', total: works.length, sources: new Set(works.flatMap(w => w.editions.map(e => e.source))).size });
    } else if (data.type === 'search' && search) {
      const filters = data.filters || {};
      // A chosen language other than English, or none, searches every language.
      if (filters.language !== 'en') await loadRest();
      const out = search(data.query, filters, data.limit || 12);
      const message = send(data, out);
      // Nothing in English: where the other languages have the author the query names, say so
      // (the empty search explains that the English translations are not public domain yet).
      if (filters.language === 'en' && !out.total && String(data.query || '').trim() && await loadRest()) {
        const other = search(data.query, {}, 12);
        if (other.author) message.elsewhere = { name: other.author.name, languages: [...new Set([...other.author.works].flatMap(w => w.language))].filter(code => code !== 'und') };
      }
      self.postMessage(message);
    } else if (data.type === 'borrow' && catalogue) {
      // The library's own books, ranked with this engine, borrow what the catalogue knows of the
      // same books in English (the library's books are English editions: a Norwegian Candide's
      // translator is not one of Tinct's Candide).
      self.postMessage({ type: 'borrowed', request: data.request, borrowed: borrowFor(data.books || [], english || catalogue.filter(isEnglish)) });
    } else if (data.type === 'get' && byId) {
      const w = byId.get(data.id);
      self.postMessage({ type: 'work', request: data.request, work: w ? slim(w) : null });
    }
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e?.message || e) });
  }
};
