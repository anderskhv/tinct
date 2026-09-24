// The production catalogue behind the library_2 design: every discoverable
// book, its introduction data, and a hand-off into the production reader that
// never loses a reader's place.
const CATALOGUE_URL = '/lab/catalogue.json';
const POSITION_KEY = 'tinct-lab-position';

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

function savedPlace(bookId) {
  try {
    const state = JSON.parse(localStorage.getItem(POSITION_KEY) || 'null');
    return state?.books?.[bookId] || null;
  } catch {
    return null;
  }
}

const signedIn = () => /(?:^|;\s*)tinct_auth=1(?:;|$)/.test(document.cookie);

function readerEdition(book, preferred) {
  const readable = (book.editions || []).filter(e => e.availability?.chapterText !== false && e.language !== 'da');
  return readable.find(e => e.key === preferred)?.key
    || readable.find(e => e.style === 'original' && e.language === 'en')?.key
    || readable.find(e => e.style === 'modern' && e.language === 'en')?.key
    || readable[0]?.key
    || null;
}

/**
 * Where "Begin reading" goes. Signed-in readers go through the production
 * book page, which merges this device's place with the account's newer cloud
 * place; a signed-out reader's place on this device resumes exactly; everyone
 * else starts at the first chapter.
 */
export function readerHref(book, preferredEdition) {
  const id = encodeURIComponent(book.id);
  if (signedIn()) return `/library?book=${id}&view=book-detail`;
  const place = savedPlace(book.id);
  const edition = readerEdition(book, place?.primaryEditionKey || preferredEdition);
  if (!edition) return `/library?book=${id}&view=book-detail`;
  if (place) return `/library?book=${id}&start=${place.chapterNumber}.${(place.paragraphIndex || 0) + 1}&edition=${encodeURIComponent(edition)}&direct=reader`;
  return `/library?book=${id}&start=${book.firstChapter || 1}.1&edition=${encodeURIComponent(edition)}&direct=reader`;
}
