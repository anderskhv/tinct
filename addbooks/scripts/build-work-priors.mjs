#!/usr/bin/env node
// Work priors for the catalogue search (addbooks/site/search.js applyPriors): for each catalogue
// work Wikidata can identify, the work it is an edition of (Wikidata P629, else the item itself),
// how many Wikimedia sites have a page on that work (sitelinks: a fame signal that does not depend
// on Gutenberg downloads, so a Wikisource-only work such as Seneca's Moral Letters is not ranked as
// unread), and the work's English name. Wikisource works carry their Wikidata item in their id;
// Gutenberg works are linked by Wikidata's Gutenberg ebook ID (P2034).
//
//   NODE_USE_ENV_PROXY=1 node addbooks/scripts/build-work-priors.mjs [--catalog <catalog.json.gz>] [--offline]
//
// Reads the slim catalogue (default: the installed app/public/lab/addbook/data/catalog.json.gz),
// caches every Wikidata answer under addbooks/.cache/wikidata/ (rerun with --offline to rebuild
// from the cache) and writes addbooks/web/src/data/work-priors.json, which build.mjs ships next to
// the catalogue. Wikidata is CC0. No paid API is called.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null };
const OFFLINE = args.includes('--offline');
const CATALOG = opt('--catalog') || join(REPO, 'app/public/lab/addbook/data/catalog.json.gz');
const CACHE = join(REPO, 'addbooks/.cache/wikidata');
const OUT = join(REPO, 'addbooks/web/src/data/work-priors.json');
// A work needs at least this many sitelinks to be kept: below it the signal is noise, and the file stays small.
const MIN_SITELINKS = 3;
const BATCH = 200;
const UA = 'TinctCatalogueBuild/1.0 (https://tinct.app; catalogue metadata, CC0)';

mkdirSync(CACHE, { recursive: true });
async function sparql(query) {
  const file = join(CACHE, createHash('sha256').update(query).digest('hex').slice(0, 24) + '.json');
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  if (OFFLINE) throw new Error('Not cached (run without --offline): ' + query.slice(0, 120));
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch('https://query.wikidata.org/sparql', { method: 'POST', body: 'query=' + encodeURIComponent(query),
        headers: { accept: 'application/sparql-results+json', 'user-agent': UA, 'content-type': 'application/x-www-form-urlencoded' } });
      if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 160)}`);
      const rows = (await response.json()).results.bindings;
      writeFileSync(file, JSON.stringify(rows));
      return rows;
    } catch (error) {
      if (attempt >= 5) throw error;
      console.error(`  retry ${attempt + 1}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * 2 ** attempt));
    }
  }
}
const qid = uri => uri.slice(uri.lastIndexOf('/') + 1);
const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

const works = JSON.parse(gunzipSync(readFileSync(CATALOG)).toString('utf8')).works;
// Catalogue work id -> its Wikidata item.
const itemOf = new Map();
for (const w of works) if (/^ws:[a-z-]+:Q\d+$/.test(w.id)) itemOf.set(w.id, w.id.slice(w.id.lastIndexOf(':') + 1));
console.error(`Wikisource works: ${itemOf.size}`);
const gutenberg = await sparql('SELECT ?item ?pg WHERE { ?item wdt:P2034 ?pg }');
const pgIds = new Set(works.filter(w => w.id.startsWith('pg:')).map(w => w.id));
for (const row of gutenberg) { const id = 'pg:' + row.pg.value; if (pgIds.has(id) && !itemOf.has(id)) itemOf.set(id, qid(row.item.value)); }
console.error(`with Gutenberg links: ${itemOf.size}`);

// Item -> the work it is an edition of (P629). An item that is an edition of several works is left as itself.
const items = [...new Set(itemOf.values())];
const workOf = new Map();
for (const [i, batch] of chunks(items, BATCH).entries()) {
  const rows = await sparql(`SELECT ?item ?work WHERE { VALUES ?item { ${batch.map(q => 'wd:' + q).join(' ')} } ?item wdt:P629 ?work }`);
  const seen = new Map();
  for (const row of rows) { const item = qid(row.item.value); seen.set(item, [...(seen.get(item) || []), qid(row.work.value)]); }
  for (const [item, list] of seen) if (list.length === 1) workOf.set(item, list[0]);
  if (i % 50 === 0) console.error(`  editions ${i * BATCH}/${items.length}`);
}
// Sitelinks and the English name of every work.
const targets = [...new Set(items.map(item => workOf.get(item) || item))];
const facts = new Map();
for (const [i, batch] of chunks(targets, BATCH).entries()) {
  const rows = await sparql(`SELECT ?work ?n ?label WHERE { VALUES ?work { ${batch.map(q => 'wd:' + q).join(' ')} } ?work wikibase:sitelinks ?n . OPTIONAL { ?work rdfs:label ?label FILTER(lang(?label) = "en") } }`);
  for (const row of rows) facts.set(qid(row.work.value), { n: +row.n.value, label: row.label?.value || null });
  if (i % 50 === 0) console.error(`  works ${i * BATCH}/${targets.length}`);
}

// Output: {catalogue work id: [work, sitelinks, English name when it is not the catalogue title]}.
const out = {};
const plain = s => String(s || '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
for (const w of works) {
  const item = itemOf.get(w.id);
  if (!item) continue;
  const work = workOf.get(item) || item, fact = facts.get(work);
  if (!fact || fact.n < MIN_SITELINKS) continue;
  const label = fact.label && plain(fact.label) !== plain(w.title) && !/^Q\d+$/.test(fact.label) ? fact.label : null;
  out[w.id] = label ? [work, fact.n, label] : [work, fact.n];
}
mkdirSync(dirname(OUT), { recursive: true });
const payload = { version: 1, source: 'Wikidata (CC0): P629 edition of, sitelinks, English label; Gutenberg links by P2034', builtAt: new Date().toISOString(), minSitelinks: MIN_SITELINKS, works: out };
writeFileSync(OUT, JSON.stringify(payload) + '\n');
console.error(`Wrote ${Object.keys(out).length} works to ${OUT} (${(JSON.stringify(payload).length / 1024).toFixed(0)} KB)`);
