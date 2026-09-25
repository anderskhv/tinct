// The production catalogue behind the library_2 design: every discoverable
// book, its introduction data, and a hand-off into the production reader that
// never loses a reader's place.
const CATALOGUE_URL = '/lab/catalogue.json';

let catalogue = null;

export async function loadCatalogue() {
  if (catalogue) return catalogue;
  const response = await fetch(CATALOGUE_URL);
  if (!response.ok) throw new Error(`Catalogue ${response.status}`);
  const data = await response.json();
  catalogue = {
    books: data.books.filter(book => book.discoveryAvailable !== false),
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
    cover: entry.art?.src || null,
    coverTone: entry.cover?.background || '#1b231c',
    summary: entry.summary || entry.blurb || '',
    preface: null,
    characters: null,
    fromCatalogue: true,
  };
}

/** Attach the catalogue facts the reader hand-off needs to any library_2 book. */
export function attachCatalogue(book, entry) {
  book.editions = entry.editions || [];
  book.wordCount = entry.wordCount ?? null;
  book.firstChapter = entry.readingStructure?.chapters?.[0]?.number ?? 1;
  book.houseIds = entry.houseIds || [];
  if (!book.summary) book.summary = entry.summary || entry.blurb || '';
}

/** Preface paragraphs and cast for a catalogue book, loaded once when it is opened. */
export async function loadIntroduction(book) {
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
  if (!readingApiPromise) readingApiPromise = import('/lab/library-2-reading.js?v=20260925b').then(() => {
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
export async function readerDestination(book, preferredEdition) {
  try {
    const api = await readingApi();
    return await api.readerDestination(book.id, preferredEdition || null);
  } catch {
    return `/library?book=${encodeURIComponent(book.id)}&view=book-detail`;
  }
}
