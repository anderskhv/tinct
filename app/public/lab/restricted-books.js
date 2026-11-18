// Books not served to this visitor's country (Book.restrictedCountries; the Worker
// decides per request, src/worker/lib/regionGate.ts). The Worker answers
// GET /api/restricted-books with book ids only, never the country. One request
// per page, shared by every copy of this module (the library's own modules and
// the bundled reading engine) through window; nothing is written to storage.
// Any failure means "none": the Worker still refuses the text itself, so failing
// open only changes what the library shows.
export const RESTRICTED_BOOKS_PATH = '/api/restricted-books';
const SHARED = '__tinctRestrictedBooks';
const ID = /^[a-z0-9-]{1,80}$/;
let resolved = null;

/** The ids in a /api/restricted-books answer, well-formed ones only. */
export function parseRestrictedBookIds(value) {
  const ids = value && Array.isArray(value.restrictedBookIds) ? value.restrictedBookIds : [];
  return new Set(ids.filter(id => typeof id === 'string' && ID.test(id)));
}

function signalUrl() {
  // The Android app's pages are local files: ask tinct.app itself (its CORS admits the app).
  try { if (window.Capacitor?.isNativePlatform?.()) return 'https://tinct.app' + RESTRICTED_BOOKS_PATH; } catch { /* web */ }
  return RESTRICTED_BOOKS_PATH;
}

export async function fetchRestrictedBookIds(fetchImpl = (input, init) => fetch(input, init)) {
  try {
    const response = await fetchImpl(signalUrl(), { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) return new Set();
    return parseRestrictedBookIds(await response.json());
  } catch {
    return new Set();
  }
}

/** The restricted ids, asked once per page. */
export function loadRestrictedBookIds(fetchImpl) {
  const scope = typeof window === 'undefined' ? globalThis : window;
  if (!scope[SHARED]) {
    scope[SHARED] = fetchRestrictedBookIds(fetchImpl).then(ids => { resolved = ids; return ids; });
  }
  return scope[SHARED].then(ids => { resolved = ids; return ids; });
}

/** The page's request when one was started (the library's catalogue starts it), else null: asks nothing itself. */
export function pendingRestrictedBookIds() {
  const scope = typeof window === 'undefined' ? globalThis : window;
  return scope[SHARED] || null;
}

/** The answer once it has arrived (empty before). */
export function restrictedBookIdsNow() {
  return resolved || new Set();
}

export function resetRestrictedBookIdsForTest() {
  resolved = null;
  const scope = typeof window === 'undefined' ? globalThis : window;
  delete scope[SHARED];
}

/** "Dostoevsky, Tolstoy and Bulgakov" without "Bulgakov": "Dostoevsky and Tolstoy". Other text is kept. */
export function listWithout(text, name) {
  if (typeof text !== 'string' || !name) return text;
  const items = text.split(/,\s*|\s+and\s+/).map(item => item.trim()).filter(Boolean);
  if (items.length < 2 || !items.includes(name) || !/^[^,]+(?:,\s*[^,]+)*\s+and\s+[^,]+$/.test(text.trim())) return text;
  const kept = items.filter(item => item !== name);
  return kept.length === 1 ? kept[0] : `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}`;
}

const surname = author => (typeof author === 'string' ? author.trim().split(/\s+/).pop() : '') || '';

/**
 * The catalogue as a visitor from a restricted country sees it: each restricted
 * book out of discovery and search (the fields held books use), off every
 * shelf and the popular list, and its author's name out of a shelf subtitle
 * that listed it for that book alone. A new object; the input is not changed.
 */
export function restrictCatalogue(data, ids) {
  if (!data || !Array.isArray(data.books) || !ids || !ids.size) return data;
  const restricted = data.books.filter(book => ids.has(book.id));
  if (!restricted.length) return data;
  const books = data.books.map(book => ids.has(book.id) ? { ...book, discoveryAvailable: false, searchAvailable: false, restricted: true } : book);
  const authorStillShown = (name, bookIds) => books.some(book => !book.restricted && bookIds.includes(book.id) && surname(book.author) === name);
  const names = [...new Set(restricted.map(book => surname(book.author)).filter(Boolean))];
  const houses = (data.houses || []).map(house => ({
    ...house,
    shelves: (house.shelves || []).map(shelf => {
      const before = shelf.bookIds || [];
      const bookIds = before.filter(id => !ids.has(id));
      let subtitle = shelf.subtitle;
      if (bookIds.length !== before.length) for (const name of names) if (!authorStillShown(name, bookIds)) subtitle = listWithout(subtitle, name);
      return { ...shelf, bookIds, ...(shelf.subtitle !== undefined ? { subtitle } : {}) };
    }),
  }));
  const renamed = new Map();
  (data.houses || []).forEach((house, h) => (house.shelves || []).forEach((shelf, s) => {
    if (shelf.subtitle && houses[h].shelves[s].subtitle !== shelf.subtitle) renamed.set(shelf.subtitle, houses[h].shelves[s].subtitle);
  }));
  return {
    ...data,
    books: renamed.size ? books.map(book => Array.isArray(book.topics) ? { ...book, topics: book.topics.map(topic => renamed.get(topic) ?? topic) } : book) : books,
    houses,
    ...(Array.isArray(data.popular) ? { popular: data.popular.filter(id => !ids.has(id)) } : {}),
  };
}
