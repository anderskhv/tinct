// "Available in Tinct": the library's own books, ranked by the catalogue's search engine
// (addbooks/site/search.js, installed as /lab/addbook/js/search.js), so the library and
// "Not yet in Tinct" agree: accents folded, word prefixes, near spellings ("wuthering hights"),
// other spellings and titles ("tolstoi", "Inferno"), the author's name, then popularity.
// What the catalogue knows of the same book (borrowFor: popularity, the author's other names,
// other titles) is lent once the catalogue search has loaded; until then books rank on their own.
// Approved by Anders, 2026-10-07 (library search quality).
// Danish (Anders, 2026-11-13): a book's Danish titles ("Den lille prinsesse") rank as titles and
// Danish spellings of its author ("Platon") as the author's name (catalogue `localTitles`,
// `localAuthors`, from src/data/danishTitles.ts). The engine folds æ to ae, ø to o and å to a;
// Danish keyboards without them also write ø as oe and å as aa, so those spellings are indexed too.
import {createSearch, hydrate, normalize} from '../addbook/js/search.js?v=20261009rel10';

/** A name as typed without æ, ø and å: "Brødrene" is also "Broedrene", "Håndbogen" "Haandbogen". */
export function danishSpellings(text) {
  const value = String(text || '');
  if (!/[øØåÅ]/.test(value)) return [];
  return [value.replace(/ø/g, 'oe').replace(/Ø/g, 'Oe').replace(/å/g, 'aa').replace(/Å/g, 'Aa')];
}

/**
 * Text folded the way Danish is typed: the engine's fold (case, accents, æ to ae, ø to o, å to a),
 * then aa and oe as a and o, so "Haandbogen", "Håndbogen" and "Handbogen" are one word.
 */
export function foldDanish(text) {
  return normalize(String(text || '')).replace(/aa/g, 'a').replace(/oe/g, 'o');
}

/** A book's Danish titles (catalogue `localTitles.da`), the one to show first. */
export const danishTitles = book => book?.localTitles?.da || [];
const danishAuthors = book => book?.localAuthors?.da || [];
const unique = values => [...new Set(values.filter(Boolean))];

/** A Tinct book as a catalogue work the engine can rank (`book` keeps the library's own object). */
export function tinctWork(book, borrowed = null) {
  const titles = [...(book.altTitles || []), ...danishTitles(book), ...(borrowed?.titles || [])];
  const named = [book.author || '', ...danishAuthors(book)];
  // A Danish spelling is the author's own name ("Sofokles" alone finds Sophocles), not only one of
  // their other names, which count only when they hold two of a query's words.
  const authors = unique([...named, ...named.flatMap(danishSpellings)]).map((name, i) => ({name, aliases: i ? [] : borrowed?.aliases || []}));
  const translators = (borrowed?.translators || []).map(name => ({name}));
  const popularity = borrowed?.popularity || 0;
  const altTitles = unique([...titles, ...[book.title, ...titles].flatMap(danishSpellings)]);
  return {id: 'tinct:' + book.id, book, title: book.title || '', altTitles,
    authors, translators, language: ['en'], popularity, editions: [{title: book.title || '', authors, translators, popularity}]};
}

// Every word typed is inside the book's title, other titles or author's names: as typed
// (lower case), or folded the way Danish is typed ("kunsten at foere krig").
const plainText = book => {
  const text = [book.title, ...(book.altTitles || []), ...danishTitles(book), book.author, ...danishAuthors(book)].join(' | ');
  return {raw: text.toLocaleLowerCase(), folded: foldDanish(text)};
};
const plainMatch = (text, raw, folded) => (raw.length && raw.every(word => text.raw.includes(word)))
  || (folded.length && folded.every(word => text.folded.includes(word)));

/**
 * Ranks `books` for a query: the engine's matches first, in its order, then any book only the
 * old plain match finds (one or two letters typed, a word inside a word), so no book that
 * used to be found is hidden. An empty query lists every book in the library's order.
 */
export function createLibrarySearch(books, borrowed = {}) {
  const search = createSearch(hydrate(books.map(book => tinctWork(book, borrowed[book.id]))));
  const folded = new Map();
  const plain = book => { if (!folded.has(book)) folded.set(book, plainText(book)); return folded.get(book); };
  return query => {
    if (!String(query || '').trim()) return books.slice();
    const ranked = search(query, {}, books.length).results.map(work => work.book);
    const seen = new Set(ranked);
    const raw = query.toLocaleLowerCase().trim().split(/\s+/), folded = foldDanish(query).split(' ').filter(Boolean);
    for (const book of books) if (!seen.has(book) && plainMatch(plain(book), raw, folded)) ranked.push(book);
    return ranked;
  };
}

/**
 * The library's search over a list that grows (catalogue books, added books): rebuilt when the
 * books or what they borrow change. `lend(map)` adds borrowed facts; true when anything is new.
 * `books` is the list, or a function returning it when the list is assembled from several.
 */
export function librarySearch(books) {
  let engine = null, key = '', borrowed = {};
  const list = typeof books === 'function' ? books : () => books;
  const keyOf = () => list().map(book => `${book.id}:${(book.altTitles || []).length}:${danishTitles(book).length}`).join(',');
  return {
    filter(query) {
      const now = keyOf();
      if (!engine || now !== key) { engine = createLibrarySearch(list(), borrowed); key = now; }
      return engine(query);
    },
    /** A book's other titles for "also known as": its Danish ones, then those borrowed from the catalogue (borrowFor). */
    titlesFor(id) { return unique([...danishTitles(list().find(book => book.id === id)), ...(borrowed[id]?.titles || [])]); },
    lend(map) {
      const fresh = Object.keys(map || {}).filter(id => !borrowed[id]);
      if (!fresh.length) return false;
      borrowed = {...borrowed, ...map};
      engine = null;
      return true;
    },
  };
}
