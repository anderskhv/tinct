/**
 * Who wrote the text the reader is in, for every AI prompt that names an
 * author (typed and spoken companion, Explain, chapter actions, Talk).
 *
 * Most books have one author: prompts name the book's author as always. An
 * essay collection or anthology (EditionData.collection) is different: each
 * chapter may name its own writer (Chapter.author, read from its byline at
 * import), and the book's credit is an editor or a list of contributors, not
 * the writer of any one chapter. There a chapter with a byline is by that
 * writer, and one without is by "the author" -- never a guess from the
 * book-level credit. Pure: shared by the client and the Worker.
 */

/** Set only for a collection. */
export interface Authorship {
  collection: true
  /** The current chapter's own writer, when its byline names one. */
  chapterAuthor?: string
}

const NAME_CHARS = 120

/** The current chapter's authorship, from the edition's collection flag and the chapter's `author`. */
export function chapterAuthorship(edition: { collection?: boolean } | null | undefined, chapter: { author?: string } | null | undefined): Authorship | undefined {
  const name = typeof chapter?.author === 'string' ? chapter.author.replace(/\s+/g, ' ').trim().slice(0, NAME_CHARS) : ''
  if (!edition?.collection && !name) return undefined
  return name ? { collection: true, chapterAuthor: name } : { collection: true }
}

/** A loaded book's authorship at one chapter: its collection flag and that chapter's `author`. */
export function sourceAuthorship(source: { collection?: boolean; chapters: ReadonlyArray<{ number: number; author?: string }> }, chapterNumber: number | undefined): Authorship | undefined {
  if (!source.collection) return undefined
  return chapterAuthorship(source, source.chapters.find(chapter => chapter.number === chapterNumber))
}

/** `{ authorship }` only when there is one, so a single-author book's context is unchanged. */
export function withAuthorship(authorship: Authorship | undefined): { authorship?: Authorship } {
  return authorship ? { authorship } : {}
}

/** A request's authorship, bounded; anything else is a single-author book. */
export function parseAuthorship(raw: unknown): Authorship | undefined {
  if (!raw || typeof raw !== 'object' || (raw as { collection?: unknown }).collection !== true) return undefined
  const name = (raw as { chapterAuthor?: unknown }).chapterAuthor
  return chapterAuthorship({ collection: true }, { author: typeof name === 'string' ? name.replace(/[<>]/g, '') : undefined })
}

/**
 * The author a prompt names for the text in front of the reader: the book's
 * author, the chapter's own writer in a collection, or "the author" for a
 * collection's chapter that names none.
 */
export function promptAuthor(bookAuthor: string, authorship?: Authorship): string {
  if (!authorship) return bookAuthor
  return authorship.chapterAuthor || 'the author'
}

/** "Bold Conjectures by …": the title as a prompt names it, with the book's credit only where it is the writer's. */
export function bookByline(bookTitle: string, bookAuthor: string, authorship?: Authorship): string {
  return authorship ? `${bookTitle} (a collection by several writers)` : `${bookTitle} by ${bookAuthor}`
}

/** The line a prompt adds for a collection, so the companion never credits the editor with a chapter. */
export function authorshipNote(bookAuthor: string, authorship?: Authorship, which = 'this chapter'): string {
  if (!authorship) return ''
  const credit = bookAuthor.trim() ? ` (${bookAuthor.trim()})` : ''
  return authorship.chapterAuthor
    ? `Authorship: this book collects writing by several authors; ${which} is by ${authorship.chapterAuthor}. Name ${authorship.chapterAuthor} as its author, never the book's editor or another contributor.`
    : `Authorship: this book collects writing by several authors and ${which} names no writer. Refer to its writer as "the author"; never attribute it to the book's credit${credit} or guess a name.`
}
