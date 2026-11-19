/**
 * The cache key for the desktop spread's next-chapter opening (the right leaf
 * that shows the next chapter's start when a chapter ends on the left). The
 * opening is fetched once per key and keeps the title it was fetched with.
 */
export function nextOpeningCacheKey(input: {
  desktopSpread: boolean
  bookId: string
  /** The edition the reader is set to (the preference). */
  readerEditionKey: string
  /** The edition `book.chapters` was loaded in (chapterEditionKey of the text on screen), when known. */
  shownEditionKey?: string
  nextChapterNumber: number | null
  nextChapterTitle: string | null
  nextOpensBibleBook: boolean
  chaptersProvisional?: boolean
}): string | null {
  const { desktopSpread, bookId, readerEditionKey, shownEditionKey, nextChapterNumber, nextChapterTitle, nextOpensBibleBook, chaptersProvisional } = input
  if (!desktopSpread || nextChapterNumber == null || !nextChapterTitle || nextOpensBibleBook || chaptersProvisional) return null
  // An edition switch changes the preference at once and the chapter list (and so nextChapterTitle) a moment later.
  // Keyed in that gap, the opening would hold the outgoing edition's title under the incoming edition's key for good:
  // an English heading over Danish text (Pinocchio, two kids' iPads, 16 Nov 2026). Wait for the list to catch up.
  if (shownEditionKey && shownEditionKey !== readerEditionKey) return null
  return `${bookId}:${readerEditionKey}:${nextChapterNumber}`
}
