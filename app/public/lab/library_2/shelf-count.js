// Count books, not memberships: the same book can be saved and currently reading.
export function shelfBookCount({ saved = [], reading = [], finished = [], uploads = [], catalogue = [] } = {}) {
  const known = new Set(catalogue.map(book => book.id));
  const ids = new Set([...reading, ...finished].map(book => book.bookId).filter(Boolean));
  for (const id of saved) if (known.has(id)) ids.add(id);
  for (const book of uploads) if (book?.key) ids.add('userbook-' + String(book.key).replace(/^(epub|pdf):/, ''));
  return ids.size;
}
