import { getBook } from '../data/bookRegistry'
import { createReaderHandoffIntent, type ReaderHandoffIntent } from '../preReader/catalogue'
import type { LabPrefs } from './labPrefs'
import { syncLabAudioEdition } from './labPrefs'
import type { LabBookPlace } from './labPosition'
import type { LabSource } from './labSource'

export const LAB_READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'

let pageHandoffRead = false
let pageHandoff: ReaderHandoffIntent | null = null

type HandoffStorage = Pick<Storage, 'getItem' | 'removeItem'>

/** Read once, delete before any asynchronous book load, and return only a registry-valid intent. */
export function consumeLabReaderHandoff(storage?: HandoffStorage | null): ReaderHandoffIntent | null {
  const target = storage ?? (typeof sessionStorage === 'undefined' ? null : sessionStorage)
  if (!target) return null
  let raw: string | null = null
  try {
    raw = target.getItem(LAB_READER_HANDOFF_KEY)
  } catch {
    return null
  }
  if (!raw) return null
  try {
    // Consume before validation/loading so refreshes can never replay a stale tuple.
    target.removeItem(LAB_READER_HANDOFF_KEY)
  } catch {
    // A readable-but-nonwritable storage implementation is unusual; validation
    // still protects the current render from malformed or cross-book state.
  }
  try {
    const candidate = JSON.parse(raw) as ReaderHandoffIntent
    if (candidate?.kind !== 'open-reader') return null
    return createReaderHandoffIntent(candidate)
  } catch {
    return null
  }
}

/** React StrictMode may evaluate component initializers twice; consume storage once per document. */
export function consumeLabReaderHandoffForPage(): ReaderHandoffIntent | null {
  if (!pageHandoffRead) {
    pageHandoffRead = true
    pageHandoff = consumeLabReaderHandoff()
  }
  return pageHandoff
}

export function releaseLabReaderHandoffForPage(handoff: ReaderHandoffIntent | null): void {
  if (pageHandoff === handoff) {
    pageHandoff = null
    pageHandoffRead = false
  }
}

export function prefsFromLabReaderHandoff(current: LabPrefs, handoff: ReaderHandoffIntent | null): LabPrefs {
  if (!handoff) return current
  const book = getBook(handoff.bookId)
  if (!book) return current
  const primary = book.editions.find(edition => edition.key === handoff.primaryEditionKey)!
  const audio = handoff.audioEditionKey
    || (primary.hasAudio ? primary.key : book.editions.find(edition => edition.hasAudio)?.key)
    || primary.key
  const compare = handoff.compareEditionKey
    || book.editions.find(edition => edition.aligned && edition.key !== primary.key)?.key
    || primary.key
  return {
    ...current,
    primaryEdition: primary.key,
    compareEdition: compare,
    audioEdition: audio,
    compareOpen: Boolean(handoff.compareEditionKey),
  }
}

/** Restore edition availability from the same per-book tuple as the reading place. */
export function prefsFromLabResumePlace(current: LabPrefs, place: LabBookPlace | null): LabPrefs {
  if (!place?.primaryEditionKey) return current
  const book = getBook(place.bookId) ?? getBook('bible')
  if (!book) return current
  const primary = book.editions.find(edition => edition.key === place.primaryEditionKey)
  if (!primary) return current
  const compare = place.compareEditionKey
    ? book.editions.find(edition => edition.key === place.compareEditionKey && edition.key !== primary.key)
    : undefined
  return syncLabAudioEdition({
    ...current,
    primaryEdition: primary.key,
    compareEdition: compare?.key ?? current.compareEdition,
    compareOpen: Boolean(compare),
  }, book.editions)
}

/** Correct metadata during the short async load; never paint a previous book's text. */
export function pendingLabSourceForHandoff(handoff: ReaderHandoffIntent): LabSource {
  const book = getBook(handoff.bookId)!
  const chapterNumber = handoff.savedPlace?.chapterNumber ?? 1
  const chapterLabel = `Chapter ${chapterNumber}`
  const primary = book.editions.find(edition => edition.key === handoff.primaryEditionKey)!
  return {
    bookId: book.id,
    editions: book.editions,
    bookTitle: book.title,
    bookAuthor: book.author,
    editionLabel: primary.label,
    chapterLabel,
    chapterTitle: chapterLabel,
    chapterNumber,
    headerBook: book.title,
    headerChapter: chapterLabel,
    paragraphs: [],
    compareParagraphs: [],
    followParagraphs: [],
    chapters: [{ number: chapterNumber, title: chapterLabel }],
    cast: [],
  }
}
