/**
 * The classic reader's saved places, as the library's Reading-now shelf reads
 * them.
 *
 * Tinct has two readers and two position stores. The /lab reader writes one
 * versioned record (`tinct-lab-position`, synced through /api/lab-position);
 * the classic app writes one key per book (`tinct:position:{bookId}`). The
 * library's book page has always read both — `resolveContinuations()` in
 * lab/catalogue-runtime.js merges them so Continue lands in the right place —
 * but the Reading-now shelf was built from the lab record alone. A reader
 * whose books are mostly in the classic store therefore saw a shelf of two
 * when nine books were in progress (2026-09-12).
 *
 * This module is the bridge, and it is read-only in both directions: classic
 * records are parsed into the shape the shelf already understands and folded
 * into an in-memory copy of the lab record. Nothing here writes either store,
 * and a lab pin always outranks a classic one for the same book unless the
 * classic one is strictly newer.
 */
import type { LabBookPlace, LabPositionState } from '../lab/labPosition'

export const PRODUCTION_POSITION_PREFIX = 'tinct:position:'

/**
 * Device id on a place that came from the classic store. It exists so a place
 * read here is recognisable if it ever turns up somewhere it should not: no
 * code path writes these back.
 */
export const PRODUCTION_POSITION_DEVICE_ID = 'app-reader'

function isCount(value: unknown, min: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= 100_000
}

/** A clock value `parseLabBookPlace` would accept. */
function isClock(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1e15
}

/**
 * One `tinct:position:{bookId}` record as a `LabBookPlace`. The same
 * validation lab/catalogue-runtime.js applies in `productionPosition()`:
 * the record must name its own book and carry a chapter and a page.
 *
 * The Bible is excluded. Its places are pinned per biblical book in the lab
 * record (`genesis`, `daniel`…), and a flat `tinct:position:bible` record
 * cannot say which of them the reader is in.
 */
export function parseProductionPlace(bookId: string, raw: unknown, now = Date.now()): LabBookPlace | null {
  if (!bookId || bookId === 'bible') return null
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (src.bookId !== bookId) return null
  if (!isCount(src.chapterNumber, 1)) return null
  if (!isCount(src.currentPage, 0)) return null
  const paragraphIndex = isCount(src.lastParagraphIndex, 0) ? src.lastParagraphIndex : 0
  // An absent or implausible clock must not outrank a real lab pin, and must
  // not be dropped either: the book is genuinely in progress.
  const updatedAt = isClock(src.updatedAt) && src.updatedAt <= now ? src.updatedAt : 1
  return {
    bookId,
    headerBook: bookId,
    chapterNumber: src.chapterNumber,
    sequentialChapter: src.chapterNumber,
    paragraphIndex: Math.min(paragraphIndex, 10_000),
    wordIndex: 0,
    pageIndex: src.currentPage,
    updatedAt,
    deviceId: PRODUCTION_POSITION_DEVICE_ID,
    rev: 0,
  }
}

/**
 * Every classic place the catalogue can resolve. Reads are per book id rather
 * than a scan of the whole key space, and each one is isolated: a single
 * unreadable or malformed record costs that book and no other.
 */
export function productionPlaces(input: {
  bookIds: Iterable<string>
  read: (key: string) => string | null
  now?: number
}): LabBookPlace[] {
  const places: LabBookPlace[] = []
  for (const bookId of input.bookIds) {
    let place: LabBookPlace | null = null
    try {
      const raw = input.read(`${PRODUCTION_POSITION_PREFIX}${bookId}`)
      place = raw === null ? null : parseProductionPlace(bookId, JSON.parse(raw), input.now)
    } catch {
      place = null
    }
    if (place) places.push(place)
  }
  return places
}

/**
 * The lab record with the classic places folded in. A book the lab record
 * already knows keeps its pin unless the classic record is strictly newer —
 * the lab reader is the one that syncs, so it wins ties. Nothing else about
 * the record is touched: the resume pointer, the finished chapters and the
 * hidden list are the lab record's own.
 */
export function withProductionPlaces(state: LabPositionState, places: readonly LabBookPlace[]): LabPositionState {
  if (places.length === 0) return state
  const books = { ...state.books }
  let changed = false
  for (const place of places) {
    const known = books[place.bookId]
    if (known && known.updatedAt >= place.updatedAt) continue
    books[place.bookId] = place
    changed = true
  }
  return changed ? { ...state, books } : state
}
