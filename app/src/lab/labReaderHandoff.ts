import { editionHold, isBookTemporarilyHeld } from '../data/editionAvailability'
import { getBook } from '../data/bookRegistry'
import { defaultCompareEditionKey, defaultPrimaryEditionKey } from '../data/editionDefaults'
import { createReaderHandoffIntent, PRE_READER_CATALOGUE, type ReaderHandoffIntent } from '../preReader/catalogue'
import { clearPendingPurchase, markPendingPurchase, modernReturnFromParams, pendingPurchase, type ModernReturn } from './labModernEditionApi'
import type { LabPrefs } from './labPrefs'
import { syncLabAudioEdition } from './labPrefs'
import type { LabBookPlace } from './labPosition'
import type { LabSource } from './labSource'

export const LAB_READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'

let pageHandoffRead = false
let pageHandoff: ReaderHandoffIntent | null = null
let pageSharedLink: { id: string; ref: string } | null = null
let pageModernReturn: ModernReturn | null = null

/** The Checkout return (`?book=…&modern=1|cancel`) this page was opened from, read before the URL is cleaned. */
export function modernReturnForPage(): ModernReturn | null {
  return pageModernReturn
}

/**
 * The hand-off for a Checkout return: the named book at the reader's latest place in it,
 * else its first chapter, in its default edition. Null when the book is not registered
 * (an unknown id opens nothing).
 */
export function modernReturnHandoff(bookId: string): ReaderHandoffIntent | null {
  const book = getBook(bookId)
  if (!book) return null
  const entry = PRE_READER_CATALOGUE.booksById.get(bookId) as { readingStructure?: { chapters?: Array<{ number?: number }> } } | undefined
  const first = entry?.readingStructure?.chapters?.[0]?.number
  const chapterNumber = Number.isInteger(first) && (first as number) >= 1 ? first as number : 1
  const primaryEditionKey = defaultPrimaryEditionKey(bookId, book.editions) ?? 'original-en'
  return createReaderHandoffIntent({ bookId, primaryEditionKey, resumeLatest: true, savedPlace: { bookId, chapterNumber, paragraphIndex: 0, wordIndex: 0, page: 0 } })
}

/**
 * Where a Checkout return opens: this tab's own hand-off when it names the same book
 * (it carries the place the reader left from), else the book the return names; a
 * return that names no registered book leaves the tab's hand-off as it was.
 * A paid return marks the purchase, so the reader switches to the edition once it is
 * granted (labModernEdition polls briefly); a cancelled one clears the mark.
 */
export function handoffForModernReturn(modernReturn: ModernReturn, stored: ReaderHandoffIntent | null): ReaderHandoffIntent | null {
  if (modernReturn.kind === 'paid') markPendingPurchase(modernReturn.bookId)
  else if (pendingPurchase() === modernReturn.bookId) clearPendingPurchase()
  if (stored?.bookId === modernReturn.bookId) return stored
  return modernReturnHandoff(modernReturn.bookId) ?? stored
}

/** The `/q/{id}` link this page was opened from, read before the URL is cleaned. */
export function sharedLinkForPage(): { id: string; ref: string } | null {
  return pageSharedLink
}

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

/**
 * Public deep link: `/reader?book=<id>&edition=<key>&chapter=<n>`. The SEO book
 * and chapter pages ("Start reading in Tinct") use it. A link that names a
 * chapter opens exactly that chapter (paragraph 0) in that edition, even if
 * the reader has a saved place in the same book. A link without a chapter
 * (`/reader?book=<id>`, the lifecycle emails' "keep reading") opens that book
 * at the reader's latest place in it, else its first chapter, so the reader's
 * own saved position is never overridden; before, it opened whatever book was
 * read last, or the Bible (QA 2026-10-09). Book and edition are validated against the registry, and an
 * unknown book yields null (the normal reader entry); an unavailable edition falls back to original-en.
 * A link without an edition opens the new-reader default: the default edition
 * with its default Compare edition beside it.
 */
export function readerHandoffFromUrlParams(params: URLSearchParams | null): ReaderHandoffIntent | null {
  const bookId = params?.get('book')
  const chapterText = params?.get('chapter')
  if (!params || !bookId) return null
  if (chapterText === null) return params.has('modern') ? null : modernReturnHandoff(bookId)
  if (!/^\d{1,5}$/.test(chapterText)) return null
  const chapterNumber = Number(chapterText)
  if (chapterNumber < 1 || !getBook(bookId)) return null
  // A shared highlight (/q/{id}) opens at its passage, not the chapter top.
  const at = (key: string) => {
    const text = params.get(key)
    return text && /^\d{1,6}$/.test(text) ? Number(text) : 0
  }
  const savedPlace = { bookId, chapterNumber, paragraphIndex: at('paragraph'), wordIndex: at('word'), page: 0 }
  const open = (primaryEditionKey: string) => createReaderHandoffIntent({ bookId, primaryEditionKey, savedPlace, startAtSavedPlace: true })
  const named = params.get('edition')
  if (!named) {
    const book = getBook(bookId)!
    const primary = defaultPrimaryEditionKey(bookId, book.editions)
    const compare = primary ? defaultCompareEditionKey(bookId, book.editions, primary, book.year) : undefined
    const paired = primary && compare
      ? createReaderHandoffIntent({ bookId, primaryEditionKey: primary, compareEditionKey: compare, savedPlace, startAtSavedPlace: true })
      : null
    return paired ?? (primary ? open(primary) : null) ?? open('original-en')
  }
  // An edition the book lacks or withholds keeps the chapter in the default edition.
  return open(named) ?? (named === 'original-en' ? null : open('original-en'))
}

/** React StrictMode may evaluate component initializers twice; consume storage once per document. */
export function consumeLabReaderHandoffForPage(): ReaderHandoffIntent | null {
  if (!pageHandoffRead) {
    pageHandoffRead = true
    const params = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
    const heldBook = params?.get('heldBook')
    const heldEdition = params?.get('heldEdition') || 'original-en'
    const positive = (key: string, fallback: number) => {
      const value = Number(params?.get(key))
      return Number.isSafeInteger(value) && value >= fallback ? value : fallback
    }
    pageModernReturn = heldBook ? null : modernReturnFromParams(params)
    pageHandoff = heldBook && (isBookTemporarilyHeld(heldBook) || editionHold(heldBook, heldEdition))
      ? createReaderHandoffIntent({ bookId: heldBook, primaryEditionKey: heldEdition,
          savedPlace: { bookId: heldBook, chapterNumber: positive('chapter', 1), paragraphIndex: positive('paragraph', 0), wordIndex: positive('word', 0), page: 0 } })
      : pageModernReturn
        ? handoffForModernReturn(pageModernReturn, consumeLabReaderHandoff())
        : consumeLabReaderHandoff() ?? readerHandoffFromUrlParams(params)
    if (pageModernReturn && params) forgetParams(params, ['book', 'modern', 'session_id'])
    const shareId = params?.get('share')
    if (pageHandoff && shareId && /^[a-hj-km-np-z2-9]{7}$/.test(shareId)) pageSharedLink = { id: shareId, ref: (params?.get('ref') || '').slice(0, 80) }
    if (!heldBook && pageHandoff && params?.has('chapter') && readerHandoffFromUrlParams(params)) forgetDeepLinkParams(params)
  }
  return pageHandoff
}

/**
 * A deep link opens its chapter once. Leaving `chapter` in the address made a
 * later reload jump back to it and overwrite the reader's place (QA
 * 2026-10-01), so the link's own parameters leave the URL once read.
 */
function forgetDeepLinkParams(params: URLSearchParams): void {
  forgetParams(params, ['book', 'edition', 'chapter', 'paragraph', 'word', 'share', 'ref'])
}

function forgetParams(params: URLSearchParams, keys: string[]): void {
  try {
    const rest = new URLSearchParams(params)
    for (const key of keys) rest.delete(key)
    const query = rest.toString()
    window.history.replaceState(window.history.state, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash)
  } catch { /* the place still opens; only a reload would differ */ }
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
  const savedOverride = handoff.savedPlace && current.audioFollowsPrimary === false ? current.audioEdition : undefined
  const audio = handoff.audioEditionKey
    || savedOverride
    || (primary.hasAudio ? primary.key : book.editions.find(edition => edition.hasAudio)?.key)
    || primary.key
  const pairedDefault = defaultCompareEditionKey(book.id, book.editions, primary.key, book.year)
  const compare = handoff.compareEditionKey || pairedDefault || primary.key
  // Compare is on by default for every entry point (Anders, 2026-10-06). An
  // explicit pick in the handoff (an edition, or None) is the reader's new
  // choice; otherwise a reader's earlier choice of None still holds.
  const compareOpen = handoff.compareChosen
    ? Boolean(handoff.compareEditionKey)
    : current.compareChosen
      ? current.compareOpen && compare !== primary.key
      : compare !== primary.key
  return {
    ...current,
    primaryEdition: primary.key,
    compareEdition: compare,
    audioEdition: audio,
    audioFollowsPrimary: handoff.audioEditionKey ? handoff.audioEditionKey === primary.key : !savedOverride,
    compareOpen,
    ...(handoff.compareChosen || current.compareChosen ? { compareChosen: true } : {}),
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
  if (!current.compareChosen) {
    // Compare is on by default (Anders, 2026-10-06): this book's pair, else
    // its paired default. A book with one edition has nothing to compare.
    const paired = compare?.key ?? defaultCompareEditionKey(book.id, book.editions, primary.key, book.year)
    return syncLabAudioEdition({
      ...current,
      primaryEdition: primary.key,
      compareEdition: paired ?? current.compareEdition,
      compareOpen: Boolean(paired),
    }, book.editions)
  }
  return syncLabAudioEdition({
    ...current,
    primaryEdition: primary.key,
    compareEdition: compare?.key ?? current.compareEdition,
    // Edition keys restore the pair, but the latest settings choice owns
    // availability. An older position must neither disable Compare nor undo None.
    compareOpen: current.compareOpen,
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
    chaptersProvisional: true,
    cast: [],
  }
}
