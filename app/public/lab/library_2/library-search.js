// "Available in Tinct": the library's own books, ranked by the catalogue's search engine
// (addbooks/site/search.js, installed as /lab/addbook/js/search.js), so the library and
// "Not yet in Tinct" agree: accents folded, word prefixes, near spellings ("wuthering hights"),
// other spellings and titles ("tolstoi", "Inferno"), the author's name, then popularity.
// What the catalogue knows of the same book (borrowFor: popularity, the author's other names,
// other titles) is lent once the catalogue search has loaded; until then books rank on their own.
// Approved by Anders, 2026-10-07 (library search quality).
import {createSearch, hydrate} from '../addbook/js/search.js?v=20261008rank1';

/** A Tinct book as a catalogue work the engine can rank (`book` keeps the library's own object). */
export function tinctWork(book, borrowed = null) {
  const authors = [{name: book.author || '', aliases: borrowed?.aliases || []}];
  const translators = (borrowed?.translators || []).map(name => ({name}));
  const popularity = borrowed?.popularity || 0;
  return {id: 'tinct:' + book.id, book, title: book.title || '', altTitles: [...(book.altTitles || []), ...(borrowed?.titles || [])],
    authors, translators, language: ['en'], popularity, editions: [{title: book.title || '', authors, translators, popularity}]};
}

const plainMatch = (book, words) => words.every(word => `${book.title} ${book.author}`.toLocaleLowerCase().includes(word));

/**
 * Ranks `books` for a query: the engine's matches first, in its order, then any book only the
 * old plain match finds (one or two letters typed, a word inside a word), so no book that
 * used to be found is hidden. An empty query lists every book in the library's order.
 */
export function createLibrarySearch(books, borrowed = {}) {
  const search = createSearch(hydrate(books.map(book => tinctWork(book, borrowed[book.id]))));
  return query => {
    if (!String(query || '').trim()) return books.slice();
    const ranked = search(query, {}, books.length).results.map(work => work.book);
    const seen = new Set(ranked);
    const words = query.toLocaleLowerCase().trim().split(/\s+/);
    for (const book of books) if (!seen.has(book) && plainMatch(book, words)) ranked.push(book);
    return ranked;
  };
}

/**
 * The library's search over a list that grows (catalogue books, added books): rebuilt when the
 * books or what they borrow change. `lend(map)` adds borrowed facts; true when anything is new.
 */
export function librarySearch(books) {
  let engine = null, key = '', borrowed = {};
  const keyOf = () => books.map(book => `${book.id}:${(book.altTitles || []).length}`).join(',');
  return {
    filter(query) {
      const now = keyOf();
      if (!engine || now !== key) { engine = createLibrarySearch(books, borrowed); key = now; }
      return engine(query);
    },
    lend(map) {
      const fresh = Object.keys(map || {}).filter(id => !borrowed[id]);
      if (!fresh.length) return false;
      borrowed = {...borrowed, ...map};
      engine = null;
      return true;
    },
  };
}
