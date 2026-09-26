// The illustrated bays show one fixed-capacity row. These helpers also bound
// the collection browser, independently of how large the underlying shelf gets.
export function pageItems(ids, requestedPage, size) {
 const capacity = Math.max(1, Math.trunc(size) || 1);
 const total = Math.ceil(ids.length / capacity);
 const index = Math.max(0, Math.min(Math.trunc(requestedPage) || 0, total - 1));
 const start = index * capacity;
 return { index, total, start, items: ids.slice(start, start + capacity) };
}
export function rowFor(ids, selected, size) {
 const index = Math.max(0, ids.indexOf(selected));
 return pageItems(ids, Math.floor(index / Math.max(1, Math.trunc(size) || 1)), size);
}
