// A book link (/library?book=<id>, the shared /read/<id>) puts its book at the front of a returning
// reader's desk for the visit (bookshelf.js). Pure helpers, no imports, so they are testable alone.

/**
 * The desk with the linked book in front, when the reader is not reading it; the desk as it is
 * otherwise. `entry` is the linked book's desk row (bookshelf.js deskBook), or null.
 */
export function deskWithLink(table, linked, entry) {
  if (!linked || !entry || table.reading.some(book => book.bookId === linked)) return table;
  return { ...table, reading: [entry, ...table.reading] };
}

/**
 * The address once the reader has taken the linked book `id` off their desk (Anders, 6 Nov 2026:
 * on /library?book=frankenstein, Frankenstein removed with its × came back at the front, now a
 * linked book with no ×, and stayed there through reloads). The link goes: /read/<id> becomes
 * /library, and ?book=<id> (with its ?edition=) leaves the query; everything else stays. Null when
 * the address does not link that book.
 */
export function addressWithoutLink(href, id) {
  let url;
  try { url = new URL(href); } catch { return null; }
  let changed = false;
  if (url.pathname.replace(/\/$/, '') === `/read/${id}`) { url.pathname = '/library'; changed = true; }
  if (url.searchParams.get('book') === id) { url.searchParams.delete('book'); url.searchParams.delete('edition'); changed = true; }
  return changed ? url.pathname + url.search + url.hash : null;
}
