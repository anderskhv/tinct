// Reads the search engine's full catalogue (addbooks/site/data/index.json[.gz], built by
// addbooks/scripts/build-index) and makes the slim copy the browser downloads.
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const DATA = join(REPO, 'addbooks/site/data');

export function loadFullIndex(path) {
  const candidates = path ? [path] : [join(DATA, 'index.json.gz'), join(DATA, 'index.json')];
  const file = candidates.find(existsSync);
  if (!file) throw new Error('No catalogue found. Build it first from the repository root:\n  ./addbooks/scripts/build-index\n(downloads the public catalogues once, about 10–30 minutes; later builds can use --offline)');
  const raw = readFileSync(file);
  return JSON.parse((file.endsWith('.gz') ? gunzipSync(raw) : raw).toString('utf8'));
}

const person = p => {
  const out = { name: p.name };
  if (p.birthYear != null) out.birthYear = p.birthYear;
  if (p.deathYear != null) out.deathYear = p.deathYear;
  if (p.aliases?.length) out.aliases = p.aliases.slice(0, 3);
  return out;
};
const nameOnly = p => ({ name: p.name });
// Only what search ranks on and what a result card shows. Every edition except the
// preferred one is dropped; translators and authors live on the work. The preferred edition
// is the first with an EPUB (build-index puts those first), so a work Gutenberg has as an
// EPUB never reaches the browser as a library page without one.
export function slimWork(w) {
  const e = w.editions.find(edition => edition.epubUrl) || w.editions[0] || {};
  const out = { id: w.id, title: w.title, language: w.language, popularity: w.popularity || 0, editions: [{ source: e.source, sourceUrl: e.sourceUrl || null, epubUrl: e.epubUrl || null, licence: e.licence || 'PD' }] };
  if (w.subtitle) out.subtitle = w.subtitle;
  if (w.altTitles?.length) out.altTitles = w.altTitles.slice(0, 4);
  if (w.authors?.length) out.authors = w.authors.map(person);
  if (w.translators?.length) out.translators = w.translators.map(nameOnly);
  const shelves = (w.bookshelves || []).filter(b => b.startsWith('Category: ')).slice(0, 4);
  if (shelves.length) out.bookshelves = shelves;
  const subjects = (w.subjects || []).filter(s => s.length < 60).slice(0, 4);
  if (subjects.length) out.subjects = subjects;
  if (w.quality === 'clean') out.quality = 'clean';
  if (w.onTinct) { out.onTinct = true; out.tinctIds = w.tinctIds; }
  if (w.firstPublishedYear) out.firstPublishedYear = w.firstPublishedYear;
  return out;
}

// Works a reader can actually get: an EPUB or a source page to download from.
export const obtainable = w => w.editions?.some(e => e.epubUrl || e.sourceUrl);

/**
 * Works whose Gutenberg EPUB the slim catalogue would lose: a Gutenberg edition has an EPUB
 * but the slim record has none. The build refuses a catalogue with any (2026-10-07).
 */
export function lostGutenbergEpubs(works) {
  return works.filter(w => w.editions?.some(e => e.source === 'Gutenberg' && e.epubUrl) && !slimWork(w).editions[0].epubUrl);
}
