/**
 * Locked /lab library model — pure functions, no DOM.
 *
 * Shared by catalogue-runtime.js (the library view) and the unit tests in
 * src/preReader/libraryModel.test.ts. Everything the library decides —
 * which palette it wears, which covers sit on the popular shelf, which one
 * is selected, whether the slide-in reveal runs, whether the reader is new or
 * returning, which houses the index lists and with what counts, what the
 * search→open→back snapshot holds — lives here so it can be tested without a
 * browser.
 */

export const REVEAL_SESSION_KEY = 'tinct:lab-library-revealed'
export const READING_MEMORY_DEVICE_KEY = 'tinct:reading-memory'
/** The reader's own position store (per-book records + lastSettledBookId). */
export const LAB_POSITION_DEVICE_KEY = 'tinct-lab-position'
/** The reader's appearance preferences; `theme` lives per profile (phone / desktop). */
export const LAB_PREFS_DEVICE_KEY = 'tinct-lab-prefs'
/** Where the library parks its state when it is left, so Back can put it back. */
export const LIBRARY_RETURN_SESSION_KEY = 'tinct:lab-library-return'
/** The shelf selection, kept for the length of the browser session. */
export const LIBRARY_SHELF_SESSION_KEY = 'tinct:lab-library-shelf'
export const POPULAR_SHELF_SIZE = 8

/** Reveal timing from the locked artboards: 56px travel, staggered starts. */
export const REVEAL_DURATION_MS = 520
export const REVEAL_FIRST_DELAY_MS = 120
export const REVEAL_STAGGER_MS = 70

/**
 * The reader's profile boundary (`PHONE_QUERY` in the reader): the library
 * reads the same appearance profile the reader would use at this width.
 */
export const LAB_PHONE_PROFILE_MAX_WIDTH = 1024

export function normalizeLibraryText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// ------------------------------------------------------------------ palette

const LAB_THEMES = new Set(['system', 'light', 'dark', 'book'])

/**
 * The reader's stored theme for a profile: v2 prefs keep one appearance per
 * profile; v1 was one flat object (`theme`, or the older `darkMode`).
 * Anything unreadable is `system`.
 */
export function labThemeFromPrefs(raw, profile = 'phone') {
  if (typeof raw !== 'string' || !raw) return 'system'
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return 'system'
    const appearance = parsed.version === 2 && parsed[profile] && typeof parsed[profile] === 'object' ? parsed[profile] : parsed
    if (LAB_THEMES.has(appearance.theme)) return appearance.theme
    if (parsed.version !== 2 && typeof appearance.darkMode === 'boolean') return appearance.darkMode ? 'dark' : 'light'
    return 'system'
  } catch {
    return 'system'
  }
}

export function labProfileForWidth(width) {
  return Number.isFinite(width) && width <= LAB_PHONE_PROFILE_MAX_WIDTH ? 'phone' : 'desktop'
}

/**
 * Which palette the library wears: `dark` (the locked navy) for the dark
 * theme, `book` (the reader's book theme paper) and `light` (the reader's
 * light paper) for those themes, and `system` following prefers-color-scheme.
 */
export function libraryPaletteFor(theme, systemDark = false) {
  if (theme === 'dark') return 'dark'
  if (theme === 'book') return 'book'
  if (theme === 'light') return 'light'
  return systemDark ? 'dark' : 'light'
}

export function libraryPaletteFromPrefs(raw, profile, systemDark) {
  return libraryPaletteFor(labThemeFromPrefs(raw, profile), systemDark)
}

// -------------------------------------------------------------------- books

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

/** The registry description (2–3 sentences) when the book has one, else the taxonomy one-liner. */
export function bookDescription(book) {
  const summary = typeof book?.summary === 'string' ? book.summary.trim() : ''
  const blurb = typeof book?.blurb === 'string' ? book.blurb.trim() : ''
  return summary || blurb
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

/**
 * The popular section head, in the index row's language: the label on the
 * left, the count on the right. One place to change (or cut) it.
 */
export function popularHead(count) {
  return { label: 'Popular', count: String(Number.isInteger(count) && count > 0 ? count : 0) }
}

/**
 * Horizontal scroll that brings a shelf item fully into view without moving
 * anything vertically. `item` and `shelf` are content-box geometry in the
 * shelf's own coordinates.
 */
export function shelfScrollLeft(input) {
  const { scrollLeft, clientWidth, itemLeft, itemWidth, padLeft = 0, padRight = 0 } = input
  const visibleStart = scrollLeft + padLeft
  const visibleEnd = scrollLeft + clientWidth - padRight
  if (itemLeft < visibleStart) return Math.max(0, itemLeft - padLeft)
  if (itemLeft + itemWidth > visibleEnd) return Math.max(0, itemLeft + itemWidth + padRight - clientWidth)
  return scrollLeft
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
 * Provisional new/returning decision from the raw device stores, taken
 * synchronously before the recap loads so the shelf renders in the right
 * mode on first paint: a reading-memory session or a reader position record
 * makes a returning reader. reading-memory.js is the authority afterwards.
 */
export function libraryModeFromDeviceMemory(rawMemory, rawPosition = null) {
  if (typeof rawMemory === 'string' && rawMemory) {
    try {
      const parsed = JSON.parse(rawMemory)
      const sessions = parsed && typeof parsed === 'object' && parsed.sessions && typeof parsed.sessions === 'object'
        ? Object.values(parsed.sessions)
        : []
      if (sessions.some(session => session && typeof session === 'object' && session.anchor && typeof session.anchor.bookId === 'string')) return 'returning'
    } catch {
      // unreadable mirror: fall through to the position store
    }
  }
  if (typeof rawPosition === 'string' && rawPosition) {
    try {
      const parsed = JSON.parse(rawPosition)
      const places = parsed && typeof parsed === 'object' && parsed.books && typeof parsed.books === 'object'
        ? Object.values(parsed.books)
        : []
      if (places.some(place => place && typeof place === 'object' && typeof place.bookId === 'string' && Number.isInteger(place.sequentialChapter))) return 'returning'
    } catch {
      // unreadable record: new reader
    }
  }
  return 'new'
}

// -------------------------------------------------------------------- index

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

// ----------------------------------------------------------- leave / return

/**
 * What the library parks when it is left (a book opened from search, the
 * reader, a link): the scroll position from before the search began, the
 * shelf selection, the open house, and whether the search must be cleared on
 * return. Back restores exactly this instead of a stale results view.
 */
export function librarySnapshot(input) {
  const query = typeof input.query === 'string' ? input.query.trim() : ''
  const preSearchScrollY = Number.isFinite(input.preSearchScrollY) ? input.preSearchScrollY : null
  return {
    scrollY: Math.max(0, Math.round(query && preSearchScrollY !== null ? preSearchScrollY : (Number.isFinite(input.scrollY) ? input.scrollY : 0))),
    shelfIndex: Number.isInteger(input.shelfIndex) && input.shelfIndex >= 0 ? input.shelfIndex : 0,
    expandedHouseId: typeof input.expandedHouseId === 'string' && input.expandedHouseId ? input.expandedHouseId : null,
    clearSearch: Boolean(query),
  }
}

export function parseLibrarySnapshot(raw) {
  if (typeof raw !== 'string' || !raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return librarySnapshot({
      scrollY: parsed.scrollY,
      shelfIndex: parsed.shelfIndex,
      expandedHouseId: parsed.expandedHouseId,
      query: parsed.clearSearch === true ? 'x' : '',
      preSearchScrollY: parsed.scrollY,
    })
  } catch {
    return null
  }
}
