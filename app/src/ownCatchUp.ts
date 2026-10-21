/**
 * "Catch me up" for a reader's own book (`userbook-{hex}`), shared by the
 * Worker route (`worker/routes/ownCatchUp.ts`) and the reader
 * (`lab/userBook/ownCatchUp.ts`). Pure.
 *
 * The Worker cannot read an own book (the file sits in R2 as the raw EPUB or
 * PDF; conversion happens on the reader's device), so the recap is built
 * incrementally on the reader's request: one chapter at a time, the client
 * sends that chapter's text (up to the reader's place) with the cumulative
 * recap so far, and the Worker returns the new cumulative recap. Each step is
 * kept privately in the owner's account (`u/{userId}/recaps/{bookHex}/`),
 * never shared between accounts, and deleted with the book.
 */
export const OWN_CATCH_UP_ROUTE = '/api/own-catch-up'
/** Part of every stored key: a new prompt starts a new chain. */
export const OWN_CATCH_UP_PROMPT_VERSION = 'own-catch-up-v2'
/** One request carries one chapter, at most this many characters (sampled when longer). */
export const OWN_CATCH_UP_MAX_CHAPTER_CHARS = 32_000
/** The cumulative recap sent back with the next chapter. */
export const OWN_CATCH_UP_MAX_RECAP_CHARS = 4_000
export const OWN_CATCH_UP_MAX_TITLE_CHARS = 120
export const OWN_CATCH_UP_MAX_CHAPTER_NUMBER = 10_000

/** One stored step of the chain: the recap of everything through `chapter` (to `through`). */
export interface OwnCatchUpStep {
  version: string
  chapter: number
  /** The step covers the whole chapter (stored per chapter) or the reader's place in it (one slot per book). */
  complete: boolean
  /** 0-based last paragraph covered. */
  through: number
  /** SHA-256 of the chapter text this step summarised. */
  textHash: string
  /** SHA-256 of the cumulative recap it was built on ('' for the first step). */
  previousHash: string
  /** The cumulative recap; '' when nothing so far had anything to summarise. */
  recap: string
}

/** POST body: one chapter and the recap so far. */
export interface OwnCatchUpRequest {
  book: string
  chapter: number
  complete: boolean
  through: number
  text: string
  previous: string
  bookTitle?: string
  chapterTitle?: string
}

export interface OwnCatchUpResponse {
  recap: string
  chapter: number
  complete: boolean
  cached: boolean
}

/** GET answer: the account's stored chain for this book, through the chapter asked about. */
export interface OwnCatchUpLookup {
  steps: OwnCatchUpStep[]
  current: OwnCatchUpStep | null
}

/** Opening and closing of a text within `maxChars`, the middle marked as left out. */
export function sampleCatchUpText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const marker = ' […] '
  const head = Math.max(0, Math.floor((maxChars - marker.length) * 0.6))
  const tail = Math.max(0, maxChars - marker.length - head)
  return `${text.slice(0, head).trimEnd()}${marker}${text.slice(text.length - tail).trimStart()}`
}
