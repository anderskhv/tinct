import { loadReviewedIntroduction } from './reviewed-introductions.js?v=20260930fix';
// The production catalogue behind the library_2 design: every discoverable
// book, its introduction data, and a hand-off into the production reader that
// never loses a reader's place.
import { coverAsset, coverSources } from './cover-assets.js?v=20261009owncover';
import { withPublicBooks } from './add-to-tinct.js?v=20261014talkwake';
import { coverToneFor } from './spine.js?v=20261009rel10';
const CATALOGUE_URL = '/lab/catalogue.json';

let catalogue = null;
let catalogueData = null;

// Share the raw catalogue with the returning-reader adapter. Its reading list
// also needs books hidden from discovery, so filtering belongs only below.
export function loadCatalogueData() {
  // One download per page, however many copies of this module the page loaded.
  if (!catalogueData && window.__library2CatalogueShared) catalogueData = window.__library2CatalogueShared;
  if (!catalogueData) {
    // Reuse the returning page's head-start fetch; a fetch preload is requested
    // twice by WebKit when the catalogue requires cache revalidation.
    const early = window.__library2Catalogue;
    delete window.__library2Catalogue;
    const native = window.Capacitor?.isNativePlatform?.()
      ? import('/lab/native-books.js').then(() => window.__tinctNativeBooks.catalogue())
      : null;
    catalogueData = (native || early || fetch(CATALOGUE_URL).then(response => {
      if (!response.ok) throw new Error(`Catalogue ${response.status}`);
      return response.json();
    })).then(data => (native ? data : withPublicBooks(data))).catch(error => { catalogueData = null; window.__library2CatalogueShared = null; throw error; });
    window.__library2CatalogueShared = catalogueData;
  }
  return catalogueData;
}

export async function loadCatalogue() {
  if (catalogue) return catalogue;
  const data = await loadCatalogueData();
  catalogue = {
    books: data.books.filter(book => book.discoveryAvailable !== false),
    // Held from the shelves, found by a typed search (War and Peace, 2026-10-08).
    searchOnly: data.books.filter(book => book.discoveryAvailable === false && book.searchAvailable === true),
    houses: data.houses || [],
  };
  return catalogue;
}

/** A library_2 book for a catalogue entry; the introduction is fetched when opened. */
export function libraryBook(entry) {
  return {
    id: entry.id,
    title: entry.title,
    author: entry.author,
    cover: coverAsset(entry.id, entry.art?.src || null),
    coverSources: coverSources(entry.id, entry.art),
    // An added book's paper cover opens on paper boards, not a dark binding.
    coverTone: coverToneFor(entry),
    summary: entry.summary || entry.blurb || '',
    preface: null,
    characters: null,
    fromCatalogue: true,
    // A book readers added (public-books.js): a paper cover until a painting exists.
    ...(entry.paper ? { paper: !entry.art, public: entry.public || null, form: entry.form || null, era: entry.era || null, year: entry.year ?? null } : {}),
  };
}

/** Attach the catalogue facts the reader hand-off needs to any library_2 book. */
export function attachCatalogue(book, entry) {
  book.coverSources = coverSources(entry.id, entry.art);
  book.editions = entry.editions || [];
  book.defaultEditionKey = entry.defaultEditionKey || null;
  book.defaultCompareEditionKey = entry.defaultCompareEditionKey || null;
  book.wordCount = entry.wordCount ?? null;
  book.displayYear = entry.displayYear || '';
  book.firstChapter = entry.readingStructure?.chapters?.[0]?.number ?? 1;
  book.houseIds = entry.houseIds || [];
  if (!book.summary) book.summary = entry.summary || entry.blurb || '';
}

/** Preface paragraphs and cast for a catalogue book, loaded once when it is opened. */
// The authored book opening (Codex-written in the desktop app, imported verbatim from book-openers.json; never
// generated or rewritten here) and the book's supporting rows (primer-data/<id>.<lang>.json, the same authored
// source). A book without either keeps its title and Begin reading: no stand-in text is made.
let openersReady = null;
function loadOpeners() {
  openersReady ||= fetch('book-openers.json').then(r => (r.ok ? r.json() : null)).then(data => {
    const byId = new Map();
    for (const entry of data?.books ?? []) if (typeof entry?.workId === 'string' && typeof entry.opening === 'string') byId.set(entry.workId, entry.opening);
    return byId;
  }).catch(() => new Map());
  return openersReady;
}
const text = value => (typeof value === 'string' && value.trim() ? value.trim() : null);
const list = (value, max) => (Array.isArray(value) ? value.slice(0, max) : []);
/** The supporting rows as the page draws them; anything malformed is left out, never guessed. */
export function primerRows(data) {
  if (!data || data.schemaVersion !== 1) return null;
  const passages = value => list(value, 6).flatMap(p => (p && text(p.quote) && Number.isInteger(p.chapterNumber) && Number.isInteger(p.paragraphIndex) && text(p.editionKey) ? [{ editionKey: p.editionKey, chapterNumber: p.chapterNumber, paragraphIndex: p.paragraphIndex, quote: p.quote.trim() }] : []));
  return {
    opening: text(data.opening),
    structure: list(data.structure, 6).flatMap(item => (text(item?.title) && text(item?.text) ? [{ title: item.title.trim(), text: item.text.trim() }] : [])),
    people: list(data.people, 8).flatMap(item => (text(item?.name) && text(item?.text) ? [{ name: item.name.trim(), role: text(item.role), text: item.text.trim() }] : [])),
    context: list(data.context, 4).flatMap(item => (text(item?.title) && text(item?.text) ? [{ title: item.title.trim(), level: ['essential', 'recommended', 'optional'].includes(item.level) ? item.level : 'optional', text: item.text.trim(), passages: passages(item.passages) }] : [])),
    notice: list(data.notice, 6).flatMap(item => (text(item?.text) ? [{ text: item.text.trim(), why: text(item.why), passages: passages(item.passages) }] : [])),
  };
}
export async function loadPrimer(book, language = 'en') {
  const id = encodeURIComponent(book.id);
  const [openers, data] = await Promise.all([
    loadOpeners(),
    fetch(`primer-data/${id}.${language}.json`).then(r => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  const rows = primerRows(data);
  // The English opening is book-openers.json's (it wins over a copy in the rows file); another language's is its own file's.
  book.opening = (language === 'en' ? openers.get(book.id) : rows?.opening) ?? rows?.opening ?? null;
  book.primer = rows;
}

export async function loadIntroduction(book) {
  await loadReviewedIntroduction(book);
  if (book.preface && book.characters) return;
  const id = encodeURIComponent(book.id);
  const json = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const [preface, onboarding] = await Promise.all([json(`/lab/prefaces/${id}.json`), json(`/data/onboarding/${id}.json`)]);
  if (!book.preface) book.preface = preface?.paragraphs?.length ? preface.paragraphs : [book.summary].filter(Boolean);
  if (!book.characters) book.characters = (onboarding?.cast || []).map(c => ({ aliases: [c.name], subtitle: c.role, body: c.description }));
}




/** The production reading engine (device + cloud places, recaps), loaded once on demand. */
let readingApiPromise = null;
export function readingApi() {
  if (!readingApiPromise) readingApiPromise = import('/lab/library-2-reading.js?v=20261014talkwake').then(() => {
    if (!window.__tinctLibraryTwoReading) throw new Error('reading engine unavailable');
    return window.__tinctLibraryTwoReading;
  });
  readingApiPromise.catch(() => { readingApiPromise = null; });
  return readingApiPromise;
}

/**
 * Where "Begin reading" and "Continue" go: straight into the production
 * reader at the reader's place (merged device and cloud), else from the start
 * in the chosen edition. Without the engine, the production book page.
 */
export async function readerDestination(book, preferredEdition, choice) {
  try {
    const api = await readingApi();
    return await api.readerDestination(book.id, preferredEdition || null, choice);
  } catch {
    return `/library?book=${encodeURIComponent(book.id)}&view=book-detail`;
  }
}

