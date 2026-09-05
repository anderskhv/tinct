/**
 * Locked /lab library model — pure functions, no DOM.
 *
 * Shared by catalogue-runtime.js (the library view) and the unit tests in
 * src/preReader/libraryModel.test.ts. Everything the library decides —
 * which covers sit on the popular shelf, which one is selected, whether the
 * slide-in reveal runs, whether the reader is new or returning, which houses
 * the index lists and with what counts — lives here so it can be tested
 * without a browser.
 */

export const REVEAL_SESSION_KEY = 'tinct:lab-library-revealed'
export const READING_MEMORY_DEVICE_KEY = 'tinct:reading-memory'
export const POPULAR_SHELF_SIZE = 8
export const IN_PROGRESS_ROWS_MAX = 4

/** Reveal timing from the locked artboards: 56px travel, staggered starts. */
export const REVEAL_DURATION_MS = 520
export const REVEAL_FIRST_DELAY_MS = 120
export const REVEAL_STAGGER_MS = 70

export function normalizeLibraryText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** A book the library may list: published text, not a stub or a coming-soon placeholder. */
export function isListable(book) {
  if (!book || typeof book !== 'object') return false
  if (book.stub === true || book.comingSoon === true || book.unavailable === true) return false
  if (book.availability && book.availability.chapterText === false) return false
  return true
}

export function listableBooks(catalogue) {
  return (catalogue?.books || []).filter(isListable)
}

/**
 * The popular shelf: the catalogue's ordered `popular` ids, kept only when
 * the book is listable and has real cover art. Never padded with books
 * that lack art — the shelf shows the covers that exist.
 */
export function popularBooks(catalogue, size = POPULAR_SHELF_SIZE) {
  const byId = new Map(listableBooks(catalogue).map(book => [book.id, book]))
  const ids = Array.isArray(catalogue?.popular) ? catalogue.popular : []
  const seen = new Set()
  const shelf = []
  for (const id of ids) {
    const book = byId.get(id)
    if (!book || seen.has(id) || !book.art?.src) continue
    seen.add(id)
    shelf.push(book)
    if (shelf.length === size) break
  }
  return shelf
}

export function clampSelection(index, count) {
  if (!Number.isInteger(count) || count <= 0) return 0
  if (!Number.isInteger(index)) return 0
  return Math.min(count - 1, Math.max(0, index))
}

/** Keyboard/tap selection: clamps at the ends, never wraps. */
export function moveSelection(index, delta, count) {
  return clampSelection(clampSelection(index, count) + delta, count)
}

export function selectionEyebrow(index, count) {
  if (!count) return 'Popular'
  return `Popular · ${clampSelection(index, count) + 1} of ${count}`
}

export function revealDelayMs(position) {
  return REVEAL_FIRST_DELAY_MS + Math.max(0, position) * REVEAL_STAGGER_MS
}

export function revealTotalMs(count) {
  if (!count) return 0
  return revealDelayMs(count - 1) + REVEAL_DURATION_MS
}

/**
 * Claim the once-per-session reveal. Returns true only the first time it is
 * called in a browser session, and never when motion is reduced. The flag is
 * written even when motion is reduced so a later preference change does not
 * replay it.
 */
export function claimReveal(storage, reducedMotion = false) {
  let seen = false
  try {
    seen = storage?.getItem(REVEAL_SESSION_KEY) === '1'
    if (!seen) storage?.setItem(REVEAL_SESSION_KEY, '1')
  } catch {
    // Storage blocked (private mode): reveal once per page load instead.
  }
  return !seen && !reducedMotion
}

/**
 * Provisional new/returning decision from the raw device reading memory,
 * taken synchronously before the recap loads so the shelf renders in the
 * right mode on first paint. `loadRecap()` is the authority afterwards.
 */
export function libraryModeFromDeviceMemory(raw) {
  if (typeof raw !== 'string' || !raw) return 'new'
  try {
    const parsed = JSON.parse(raw)
    const sessions = parsed && typeof parsed === 'object' && parsed.sessions && typeof parsed.sessions === 'object'
      ? Object.values(parsed.sessions)
      : []
    return sessions.some(session => session && typeof session === 'object' && session.anchor && typeof session.anchor.bookId === 'string')
      ? 'returning'
      : 'new'
  } catch {
    return 'new'
  }
}

/** Houses as index rows with counts; stubs hidden; empty houses omitted. */
export function indexHouses(catalogue) {
  const books = listableBooks(catalogue)
  return (catalogue?.houses || []).map(house => {
    const members = books.filter(book => Array.isArray(book.houseIds) && book.houseIds.includes(house.id))
    return { id: house.id, title: house.title, count: members.length, books: members }
  }).filter(house => house.count > 0)
}

export function publishedCount(catalogue) {
  return listableBooks(catalogue).length
}

/** Split rows into `columns` column arrays, filling each column top to bottom. */
export function columnise(rows, columns) {
  const count = Math.max(1, Math.trunc(columns) || 1)
  const perColumn = Math.ceil(rows.length / count)
  const result = []
  for (let index = 0; index < count; index++) {
    const slice = rows.slice(index * perColumn, (index + 1) * perColumn)
    if (slice.length) result.push(slice)
  }
  return result
}

function titleKey(value) {
  return normalizeLibraryText(value).replace(/^(the|a|an)\s+/, '')
}

/**
 * The search row filters the index by title or author. Blank query → every
 * listable book. Ordering: title starts with the query, then title contains,
 * then author matches; ties keep catalogue order.
 */
export function filterIndexBooks(catalogue, rawQuery) {
  const books = listableBooks(catalogue)
  const query = normalizeLibraryText(rawQuery)
  if (!query) return books
  const key = titleKey(query)
  return books.map(book => {
    const title = normalizeLibraryText(book.title)
    const author = normalizeLibraryText(book.author)
    const bare = titleKey(book.title)
    let score = 0
    if (title === query || bare === key) score = 500
    else if (title.startsWith(query) || bare.startsWith(key)) score = 400
    else if (title.includes(query) || bare.includes(key)) score = 300
    else if (author.startsWith(query)) score = 200
    else if (author.includes(query)) score = 100
    return score ? { book, score } : null
  }).filter(Boolean)
    .sort((left, right) => right.score - left.score || (left.book.catalogueIndex ?? 0) - (right.book.catalogueIndex ?? 0))
    .map(result => result.book)
}

export function searchPlaceholder(catalogue) {
  const count = publishedCount(catalogue)
  return `Search ${count} ${count === 1 ? 'book' : 'books'}`
}
