// Whether an answer from readerDestination (catalogue.js; src/libraryTwoReading.ts) opens a
// reader: the production reader with the hand-off written, or a reader's own book. Anything
// else is the book-page fallback (/library?book=…&view=book-detail), which the engine answers
// when it cannot hand the book over. Following that fallback sent readers through the cover's
// opening and back to the library with no word (The Jungle Book, 20 Oct 2026): every open
// follows only a reader address and otherwise says the book could not open.
export function opensReader(href) {
  return typeof href === 'string' && (href === '/reader' || href.startsWith('/reader?userBook=') || href.startsWith('/lab/addbook/?userBook='));
}
