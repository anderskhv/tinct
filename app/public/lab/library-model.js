/**
 * Locked /lab library model — pure functions, no DOM.
 *
 * Shared by catalogue-runtime.js (the library view) and the unit tests in
 * src/preReader/libraryModel.test.ts. Everything the library decides —
 * which world it wears, which covers sit on the popular shelf, which one
 * is selected, whether the slide-in reveal runs, whether the reader is new or
 * returning, which houses the index lists and with what counts, what the
 * search→open→back snapshot holds — lives here so it can be tested without a
 * browser.
 */

export const REVEAL_SESSION_KEY = 'tinct:lab-library-revealed'
export const READING_MEMORY_DEVICE_KEY = 'tinct:reading-memory'
/** The reader's own position store (per-book records + lastSettledBookId). */
export const LAB_POSITION_DEVICE_KEY = 'tinct-lab-position'
/** Where the library parks its state when it is left, so Back can put it back. */
export const LIBRARY_RETURN_SESSION_KEY = 'tinct:lab-library-return'
/** The shelf selection, kept for the length of the browser session. */
export const LIBRARY_SHELF_SESSION_KEY = 'tinct:lab-library-shelf'
/**
 * Where the pre-reader records that it has just sent the reader INTO a book,
 * so that a library reached straight back out of that book knows where the
 * reader came from. Per browser session; mirrored as a literal in
 * lab/library-boot.js, which writes it for the signed-in resume redirect.
 */
export const READER_ORIGIN_SESSION_KEY = 'tinct:lab-reader-origin'
export const POPULAR_SHELF_SIZE = 8

/** Reveal timing from the locked artboards: 56px travel, staggered starts. */
export const REVEAL_DURATION_MS = 520
export const REVEAL_FIRST_DELAY_MS = 120
export const REVEAL_STAGGER_MS = 70

export function normalizeLibraryText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// ------------------------------------------------------------- landing world

/**
 * The three worlds the landing page crossfades behind its headline. The
 * pre-reader is one continuous surface: whichever of these the landing was
 * showing when the reader pressed Start reading is the ground the library,
 * the book page and the edition screen then wear. Before 2026-09-07 the
 * library instead wore the READER's theme (light paper by default), so the
 * reader walked out of a dark world into a white page mid-journey.
 */
export const LANDING_WORLDS = ['odyssey', 'pride', 'frankenstein']

/** What the library falls back to when it was reached without the landing. */
export const DEFAULT_LANDING_WORLD = 'odyssey'

/** Where the landing parks the world it was showing when it was left. */
export const LANDING_WORLD_SESSION_KEY = 'tinct:lab-landing-world'

/** A stored or supplied world id, or null when it is not one of ours. */
export function landingWorldFrom(value) {
  return typeof value === 'string' && LANDING_WORLDS.includes(value) ? value : null
}

/**
 * Which world the landing is showing right now. The three layers crossfade
 * on one 42s animation, so the one on screen is simply the most opaque;
 * reading the opacities back beats recomputing the animation's phase,
 * because it stays true if the timing is ever retuned.
 *
 * `layers` are `{ world, opacity }`. Ties keep the earlier layer, which is
 * the one painted underneath.
 */
export function mostVisibleWorld(layers) {
  let best = null
  let bestOpacity = -1
  for (const layer of Array.isArray(layers) ? layers : []) {
    const world = landingWorldFrom(layer?.world)
    if (!world) continue
    const opacity = Number.isFinite(layer.opacity) ? layer.opacity : 0
    if (opacity > bestOpacity + 1e-6) {
      best = world
      bestOpacity = opacity
    }
  }
  return best
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
 * The lead over the popular row. Only a reader with nothing in Reading now
 * ever sees this row (see `showPopularShelf`), so the lead is written for
 * that reader: an action in the page's headline face, the row named quietly
 * under it, and a line saying that the rest of the library is further down.
 * One place to change or cut the copy.
 */
export function popularLead() {
  return {
    title: 'Pick your first book',
    row: 'Popular choices',
    more: 'The search and all 100 books are further down.',
  }
}

/**
 * Whether the library shows the popular row at all. A reader who already has
 * books in Reading now has picked; showing them a shelf of first suggestions
 * above their own books is the library talking over them. The row is for the
 * reader who has nothing yet.
 */
export function showPopularShelf(mode) {
  return mode !== 'returning'
}

/**
 * How many covers the popular row carries at this width. Eight fills a phone
 * and overflows it; a 1440 or 1920 desktop shows all eight at once with a
 * wide empty band to their right, so the row grows with the viewport — one
 * cover more than fits, so the row still reads as something to scroll.
 *
 * `padding`, `cover` and `gap` mirror the CSS in lab/index.html.
 */
export function popularShelfSize(viewportWidth, size = POPULAR_SHELF_SIZE) {
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 0
  if (width <= 0) return size
  const wide = width >= 601
  const padding = wide ? 48 : 14
  const cover = wide ? 136 : 124
  const gap = wide ? 24 : 16
  const track = Math.max(0, width - padding * 2)
  const fits = Math.ceil((track + gap) / (cover + gap))
  return Math.max(size, fits + 1)
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
/**
 * Whether the URL asks for the library: `/lab/library`, `/library` (the
 * launch route) or `?view=library` on the pre-reader page. Mirrors
 * `libraryViewRequested` in src/lab/labLibraryBoot.ts and the inline boot
 * script in lab/index.html.
 */
export function libraryViewFromLocation(pathname, search = '') {
  const path = String(pathname || '').split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (path === '/lab/library' || path === '/library') return true
  const query = String(search || '')
  return new URLSearchParams(query.startsWith('?') ? query.slice(1) : query).get('view') === 'library'
}

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
 * reader, a link): the scroll position, the shelf selection, the open house,
 * the live search query, and the book that was opened. Back restores exactly
 * this — including the search results the reader was looking at, scrolled to
 * the book they came from.
 *
 * Before 2026-09-07 a snapshot taken during a search threw the query away and
 * rewound to the pre-search scroll position, so one Back press undid two
 * steps: the book page AND the search. That is the "back goes back twice" bug.
 */
export function librarySnapshot(input) {
  const query = typeof input.query === 'string' ? input.query.trim() : ''
  return {
    scrollY: Math.max(0, Math.round(Number.isFinite(input.scrollY) ? input.scrollY : 0)),
    shelfIndex: Number.isInteger(input.shelfIndex) && input.shelfIndex >= 0 ? input.shelfIndex : 0,
    expandedHouseId: typeof input.expandedHouseId === 'string' && input.expandedHouseId ? input.expandedHouseId : null,
    query,
    bookId: typeof input.bookId === 'string' && input.bookId ? input.bookId : null,
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
      query: parsed.query,
      bookId: parsed.bookId,
    })
  } catch {
    return null
  }
}

// ------------------------------------------------------------ reading time

/** The stated default when nothing has been learned about this reader. */
export const DEFAULT_WORDS_PER_MINUTE = 250

/**
 * Minutes to read `wordCount` words at `wordsPerMinute`. Null when the book
 * has no word count — the book page then says nothing rather than guessing.
 */
export function readingMinutes(wordCount, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE) {
  const words = Number.isFinite(wordCount) && wordCount > 0 ? wordCount : null
  const wpm = Number.isFinite(wordsPerMinute) && wordsPerMinute > 0 ? wordsPerMinute : DEFAULT_WORDS_PER_MINUTE
  if (words === null) return null
  return Math.max(1, Math.round(words / wpm))
}

/** "40 min", "6 hr", "12 hr 30 min" — the shape the book page's stat pill wears. */
export function formatReadingTime(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null
  const whole = Math.round(minutes)
  if (whole < 60) return `${whole} min`
  const hours = Math.floor(whole / 60)
  const rest = whole % 60
  if (hours >= 10 || rest === 0) return `${hours} hr`
  return `${hours} hr ${rest} min`
}

/**
 * A reader's own words-per-minute, when the reader has one, else null. The
 * reader's speed model (src/hooks/useReadingSpeed.ts) stores per book under
 * `tinct:reading-speed:{bookId}`; a learned entry carries enough sampled time
 * to be worth stating. Values outside 80–1200 wpm are noise, not a reader.
 */
export function readerWordsPerMinute(records) {
  const samples = (Array.isArray(records) ? records : []).map(record => {
    if (!record || typeof record !== 'object') return null
    const words = Number(record.totalWordsRead)
    const seconds = Number(record.totalSecondsSpent)
    if (!Number.isFinite(words) || !Number.isFinite(seconds) || seconds < 120 || words < 500) return null
    const wpm = (words / seconds) * 60
    return wpm >= 80 && wpm <= 1200 ? wpm : null
  }).filter(value => value !== null)
  if (!samples.length) return null
  return Math.round(samples.reduce((total, value) => total + value, 0) / samples.length)
}

/**
 * The book page's reading-time line. When the reader has a measured speed the
 * copy says so, so the number is never mistaken for a claim about them.
 */
export function readingTimeLine(wordCount, readerWpm = null) {
  const measured = Number.isFinite(readerWpm) && readerWpm > 0
  const wpm = measured ? readerWpm : DEFAULT_WORDS_PER_MINUTE
  const label = formatReadingTime(readingMinutes(wordCount, wpm))
  if (!label) return null
  return {
    value: label,
    wordsPerMinute: Math.round(wpm),
    measured,
    note: measured ? `at your ${Math.round(wpm)} words a minute` : `at ${DEFAULT_WORDS_PER_MINUTE} words a minute`,
  }
}

// --------------------------------------------------------- centred shelf

/**
 * Which shelf item is the focused one: the item whose centre is nearest the
 * centre of the scroller. The IntersectionObserver in catalogue-runtime.js
 * does this natively while a finger is on the row; this pure version is what
 * the tests assert and what the runtime falls back to when the observer is
 * unavailable.
 *
 * `items` are `{ left, width }` in the scroller's content coordinates.
 */
export function centredShelfIndex(items, scrollLeft, clientWidth) {
  if (!Array.isArray(items) || !items.length) return 0
  const centre = (Number.isFinite(scrollLeft) ? scrollLeft : 0) + (Number.isFinite(clientWidth) ? clientWidth : 0) / 2
  let best = 0
  let bestDistance = Infinity
  items.forEach((item, index) => {
    const left = Number.isFinite(item?.left) ? item.left : 0
    const width = Number.isFinite(item?.width) ? item.width : 0
    const distance = Math.abs(left + width / 2 - centre)
    if (distance < bestDistance - 0.5) {
      bestDistance = distance
      best = index
    }
  })
  return best
}

/**
 * Which cover a scrolling row is focused on.
 *
 * Nearest the centre, except at the ends of the track. The row's last cover
 * ends at the page's right margin — there is no trailing spacer to carry it
 * into the middle, because that spacer is what let the row scroll a whole
 * empty slot past its last cover — so at the end of the track the focus is
 * the last cover, and at the start it is the first.
 *
 * `items` are `{ left, width }` in the scroller's content coordinates.
 */
export function shelfFocusIndex(items, scrollLeft, clientWidth, scrollWidth) {
  if (!Array.isArray(items) || !items.length) return 0
  const left = Number.isFinite(scrollLeft) ? scrollLeft : 0
  const client = Number.isFinite(clientWidth) ? clientWidth : 0
  const max = Math.max(0, (Number.isFinite(scrollWidth) ? scrollWidth : 0) - client)
  if (max > 0 && left >= max - 1) return items.length - 1
  if (left <= 1) return 0
  return centredShelfIndex(items, left, client)
}

// ------------------------------------------------------ came from the reader

/**
 * Record that the reader is being opened on `bookId` from here. Written on
 * the way out, read on the way back — see `recapSummaryPermission` in
 * src/preReader/recapSummaryClient.ts for what the library does with it.
 */
export function writeReaderOrigin(storage, bookId, now) {
  if (!storage || typeof bookId !== 'string' || !bookId) return
  try {
    storage.setItem(READER_ORIGIN_SESSION_KEY, JSON.stringify({ v: 1, bookId, at: Number.isFinite(now) ? now : Date.now() }))
  } catch {
    // Storage blocked: the library falls back to the away-time rule alone.
  }
}

/** The recorded origin, or null when there is none or it is unreadable. */
export function readReaderOrigin(storage) {
  let raw = null
  try {
    raw = storage ? storage.getItem(READER_ORIGIN_SESSION_KEY) : null
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.v !== 1 || typeof parsed.bookId !== 'string' || !parsed.bookId) return null
    const at = Number.isFinite(parsed.at) ? parsed.at : null
    return at === null ? null : { bookId: parsed.bookId, at }
  } catch {
    return null
  }
}
