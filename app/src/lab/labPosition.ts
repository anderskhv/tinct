/**
 * Lab reading-position sync (lab-only: /lab, /lab/phone).
 *
 * Production Tinct stored one cursor per library bookId. The KJV is one
 * bookId (`bible`) with sequential chapter indexes (Genesis 1 = 1, James 1 =
 * 1147). Recovery then treated "further in the Bible" as further in *this*
 * book: a defaultish remount plus history high-water snapped Jeremiah → James.
 * Cloud vs local used timestamps, but a newer anonymous Genesis-1 write, or a
 * furthest-chapter pick without a book check, could still jump the wrong book.
 *
 * Lab rules (locked):
 * - Local is the truth. Cloud is a signed-in backup. Guest never hits the net.
 * - Position is keyed by *biblical* book (genesis, romans, james), not `bible`.
 * - Each book keeps its own word-accurate pin. A Genesis peek does not overwrite
 *   the Romans pin. Last-write-wins *inside* a book; never furthest-across-Bible.
 * - Resume is `lastSettledBookId`, not max(chapterNumber). A short visit does
 *   not become the resume book until dwell (~25s) or a page turn / Play there.
 *   Leaving (hide/pagehide) after any real reading in the visited book also
 *   settles it; iOS throttles timers, so the dwell timer alone is not enough.
 * - Another device applies a cloud pin only if: same bookId, newer updatedAt
 *   (or higher rev), and that chapter exists on this client. "This client"
 *   means the loaded manifest, never the boot-render fallback chapter list.
 * - Every note writes localStorage synchronously (merge-before-write, newer
 *   per-book record wins). Only the cloud PUT is debounced.
 * - Record is small: books map + lastSettledBookId. GET/PUT /api/lab-position.
 * - Finished chapters ride in the same record (`finished[libraryBookId]`, sorted
 *   sequential chapter numbers) so they survive devices and reloads like the
 *   pin does. A finish is monotonic: merges union, never regress.
 */
export const LAB_POSITION_STORAGE_KEY = 'tinct-lab-position'
export const LAB_POSITION_DEVICE_KEY = 'tinct-lab-device-id'
/** Set when a cloud PUT failed or was skipped offline; cleared once a PUT lands. */
export const LAB_POSITION_DIRTY_KEY = 'tinct-lab-position-dirty'
export const LAB_POSITION_DWELL_MS = 25_000
export const LAB_POSITION_DEBOUNCE_MS = 1_000
/**
 * How long a signed-in reader waits for the cloud record (and the chapter
 * manifest it is validated against) before painting the local place. The
 * reader shows one resolved position from its first paint; after this
 * window a late cloud record may only move it forward inside the same book
 * (see `shouldFollowLateCloudResume`).
 */
export const LAB_INITIAL_CLOUD_WAIT_MS = 3_000

export type LabPlaceReason =
  | 'open-book'
  | 'page-turn'
  | 'mode-change'
  | 'play'
  | 'pause'
  | 'hide'
  | 'chapter-jump'
  | 'dwell'
  | 'word'

export interface LabBookPlace {
  bookId: string
  headerBook: string
  chapterNumber: number
  sequentialChapter: number
  paragraphIndex: number
  wordIndex: number
  pageIndex?: number
  primaryEditionKey?: string
  compareEditionKey?: string
  readerMode?: 'read' | 'compare'
  updatedAt: number
  deviceId: string
  rev: number
}

export interface LabReaderStateSnapshot {
  pageIndex: number
  primaryEditionKey: string
  compareEditionKey?: string
  readerMode: 'read' | 'compare'
}

function withReaderState(place: LabBookPlace, readerState?: LabReaderStateSnapshot): LabBookPlace {
  if (!readerState) return place
  return {
    ...place,
    pageIndex: Math.max(0, Math.round(readerState.pageIndex)),
    primaryEditionKey: readerState.primaryEditionKey,
    compareEditionKey: readerState.compareEditionKey,
    readerMode: readerState.readerMode,
  }
}

export interface LabPositionState {
  books: Record<string, LabBookPlace>
  /**
   * Chapters the reader turned past (or heard to the end), keyed by library
   * bookId (`bible`, `odyssey`, …) with sequential chapter numbers, sorted.
   */
  finished: Record<string, number[]>
  /**
   * Books the reader took off the Reading-now list, keyed by library bookId,
   * valued with the moment they did it. Nothing is deleted: the place, the
   * notes, the highlights, the chat and the reading-memory sessions are all
   * untouched — the book simply stops being listed.
   *
   * Hidden-ness is a comparison, not a boolean, which is why one timestamp is
   * enough: the book is hidden while the hide is at least as new as its place.
   * Opening the book writes a newer place, so it returns to the list by
   * itself, at the place it was left — no un-hide write, and therefore no
   * tombstone to sync and nothing to go stale between devices. Merging is
   * max-per-book, so a hide on the phone reaches the laptop with the pins.
   */
  hidden: Record<string, number>
  lastSettledBookId: string | null
  lastSettledAt: number
  updatedAt: number
  deviceId: string
}

export interface LabChapterRef {
  number: number
  title: string
}

export function emptyLabPositionState(deviceId: string): LabPositionState {
  return {
    books: {},
    finished: {},
    hidden: {},
    lastSettledBookId: null,
    lastSettledAt: 0,
    updatedAt: 0,
    deviceId,
  }
}

const MAX_FINISHED_PER_BOOK = 5000

function normalizeFinishedList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<number>()
  for (const item of raw) {
    if (isFiniteInt(item, 1, 5000)) seen.add(item)
    if (seen.size >= MAX_FINISHED_PER_BOOK) break
  }
  return [...seen].sort((a, b) => a - b)
}

export function parseFinishedChapters(raw: unknown): Record<string, number[]> {
  if (!raw || typeof raw !== 'object') return {}
  const finished: Record<string, number[]> = {}
  for (const [bookId, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!bookId || bookId.length > 80) continue
    const chapters = normalizeFinishedList(list)
    if (chapters.length > 0) finished[bookId] = chapters
  }
  return finished
}

/** Union per book; a chapter once finished stays finished on every device. */
export function unionFinishedChapters(a: Record<string, number[]>, b: Record<string, number[]>): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const bookId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const merged = normalizeFinishedList([...(a[bookId] || []), ...(b[bookId] || [])])
    if (merged.length > 0) out[bookId] = merged
  }
  return out
}

export function finishedChaptersFor(state: LabPositionState, bookId: string): Set<number> {
  return new Set(state.finished[bookId] || [])
}

export function withFinishedChapter(state: LabPositionState, bookId: string, sequentialChapter: number, now: number): LabPositionState {
  if (!isFiniteInt(sequentialChapter, 1, 5000) || !bookId) return state
  if (state.finished[bookId]?.includes(sequentialChapter)) return state
  return {
    ...state,
    finished: unionFinishedChapters(state.finished, { [bookId]: [sequentialChapter] }),
    updatedAt: Math.max(state.updatedAt, now),
  }
}

export function biblicalBookId(headerBook: string): string {
  return headerBook
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'genesis'
}

export function parseBiblicalPlaceTitle(title: string): { book: string; chapter: string } {
  const trimmed = title.trim()
  const match = trimmed.match(/^(.*\S)\s+(\d+)$/)
  if (match) return { book: match[1], chapter: match[2] }
  return { book: trimmed || 'Genesis', chapter: '1' }
}

export function placeFromChapterRef(input: {
  chapters: LabChapterRef[]
  sequentialChapter: number
  paragraphIndex: number
  wordIndex: number
  deviceId: string
  now: number
  rev: number
  /** Registry book context. Omitted for the Bible's per-biblical-book pins. */
  bookId?: string
  headerBook?: string
  readerState?: LabReaderStateSnapshot
}): LabBookPlace {
  const entry = input.chapters.find(item => item.number === input.sequentialChapter)
  if (input.bookId && input.bookId !== 'bible') {
    return withReaderState({
      bookId: input.bookId,
      headerBook: input.headerBook || input.bookId,
      chapterNumber: entry?.number ?? input.sequentialChapter,
      sequentialChapter: input.sequentialChapter,
      paragraphIndex: Math.max(0, input.paragraphIndex),
      wordIndex: Math.max(0, input.wordIndex),
      updatedAt: input.now,
      deviceId: input.deviceId,
      rev: input.rev,
    }, input.readerState)
  }
  const parsed = parseBiblicalPlaceTitle(entry?.title || 'Genesis 1')
  const chapterNumber = Number(parsed.chapter)
  return withReaderState({
    bookId: biblicalBookId(parsed.book),
    headerBook: parsed.book,
    chapterNumber: Number.isInteger(chapterNumber) && chapterNumber > 0 ? chapterNumber : 1,
    sequentialChapter: input.sequentialChapter,
    paragraphIndex: Math.max(0, input.paragraphIndex),
    wordIndex: Math.max(0, input.wordIndex),
    updatedAt: input.now,
    deviceId: input.deviceId,
    rev: input.rev,
  }, input.readerState)
}

function isFiniteInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function parseLabBookPlace(raw: unknown): LabBookPlace | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.bookId !== 'string' || !src.bookId || src.bookId.length > 80) return null
  if (src.bookId === 'bible') return null
  if (typeof src.headerBook !== 'string' || !src.headerBook || src.headerBook.length > 80) return null
  if (!isFiniteInt(src.chapterNumber, 1, 5000)) return null
  if (!isFiniteInt(src.sequentialChapter, 1, 5000)) return null
  if (!isFiniteInt(src.paragraphIndex, 0, 10_000)) return null
  if (!isFiniteInt(src.wordIndex, 0, 100_000)) return null
  if (src.pageIndex !== undefined && !isFiniteInt(src.pageIndex, 0, 100_000)) return null
  if (src.primaryEditionKey !== undefined && (typeof src.primaryEditionKey !== 'string' || !src.primaryEditionKey || src.primaryEditionKey.length > 80)) return null
  if (src.compareEditionKey !== undefined && (typeof src.compareEditionKey !== 'string' || !src.compareEditionKey || src.compareEditionKey.length > 80)) return null
  if (src.readerMode !== undefined && src.readerMode !== 'read' && src.readerMode !== 'compare') return null
  if (!isFiniteInt(src.updatedAt, 1, 1e15)) return null
  if (typeof src.deviceId !== 'string' || !src.deviceId || src.deviceId.length > 80) return null
  if (!isFiniteInt(src.rev, 0, 1e15)) return null
  return {
    bookId: src.bookId,
    headerBook: src.headerBook,
    chapterNumber: src.chapterNumber,
    sequentialChapter: src.sequentialChapter,
    paragraphIndex: src.paragraphIndex,
    wordIndex: src.wordIndex,
    ...(src.pageIndex === undefined ? {} : { pageIndex: src.pageIndex }),
    ...(src.primaryEditionKey === undefined ? {} : { primaryEditionKey: src.primaryEditionKey }),
    ...(src.compareEditionKey === undefined ? {} : { compareEditionKey: src.compareEditionKey }),
    ...(src.readerMode === undefined ? {} : { readerMode: src.readerMode }),
    updatedAt: src.updatedAt,
    deviceId: src.deviceId,
    rev: src.rev,
  }
}

export function parseLabPositionState(raw: unknown, fallbackDeviceId = 'lab'): LabPositionState {
  const empty = emptyLabPositionState(fallbackDeviceId)
  if (!raw || typeof raw !== 'object') return empty
  const src = raw as Record<string, unknown>
  const books: Record<string, LabBookPlace> = {}
  if (src.books && typeof src.books === 'object') {
    for (const [key, value] of Object.entries(src.books as Record<string, unknown>)) {
      const place = parseLabBookPlace(value)
      if (!place || place.bookId !== key) continue
      books[key] = place
    }
  }
  const deviceId = typeof src.deviceId === 'string' && src.deviceId ? src.deviceId : fallbackDeviceId
  const lastSettledBookId = typeof src.lastSettledBookId === 'string' && books[src.lastSettledBookId]
    ? src.lastSettledBookId
    : null
  const lastSettledAt = isFiniteInt(src.lastSettledAt, 0, 1e15) ? src.lastSettledAt : 0
  const updatedAt = isFiniteInt(src.updatedAt, 0, 1e15) ? src.updatedAt : 0
  return {
    books,
    finished: parseFinishedChapters(src.finished),
    hidden: parseHiddenFromReadingNow(src.hidden),
    lastSettledBookId,
    lastSettledAt,
    updatedAt,
    deviceId,
  }
}

// ------------------------------------------------- hidden from Reading now

const MAX_HIDDEN_BOOKS = 500

export function parseHiddenFromReadingNow(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  const hidden: Record<string, number> = {}
  for (const [bookId, at] of Object.entries(raw as Record<string, unknown>)) {
    if (!bookId || bookId.length > 80) continue
    if (!isFiniteInt(at, 1, 1e15)) continue
    hidden[bookId] = at
    if (Object.keys(hidden).length >= MAX_HIDDEN_BOOKS) break
  }
  return hidden
}

/** Newest hide per book wins, so the list agrees across devices. */
export function mergeHiddenFromReadingNow(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a }
  for (const [bookId, at] of Object.entries(b)) {
    if (!(bookId in out) || at > out[bookId]) out[bookId] = at
  }
  return out
}

/**
 * Whether the book is off the Reading-now list. It is, while the reader's
 * hide is at least as new as the book's own place: reading it again writes a
 * newer place and puts it back, at the same page.
 */
export function isHiddenFromReadingNow(state: Pick<LabPositionState, 'hidden' | 'books'>, bookId: string): boolean {
  const hiddenAt = state.hidden?.[bookId] ?? 0
  if (hiddenAt <= 0) return false
  return hiddenAt >= (state.books?.[bookId]?.updatedAt ?? 0)
}

/** Take a book off the list. Writes one timestamp; deletes nothing. */
export function withHiddenFromReadingNow(state: LabPositionState, bookId: string, now: number): LabPositionState {
  if (!bookId || !isFiniteInt(now, 1, 1e15)) return state
  if (state.hidden[bookId] === now) return state
  return {
    ...state,
    hidden: mergeHiddenFromReadingNow(state.hidden, { [bookId]: now }),
    updatedAt: Math.max(state.updatedAt, now),
  }
}

export function resumePlace(state: LabPositionState): LabBookPlace | null {
  if (!state.lastSettledBookId) return null
  return state.books[state.lastSettledBookId] ?? null
}

/**
 * Whether a pin names a chapter this client can open, given the library book
 * whose chapter list is loaded (`libraryBookId`: `bible` or a registry id).
 * A Bible manifest validates only Bible pins — a book of that manifest and a
 * chapter of that book — so a registry pin whose chapter number happens to
 * coincide with a sequential Bible index (Crito 3 vs Genesis 3) is never
 * accepted. A registry chapter list validates only pins of that same book.
 */
export function chapterExistsOnClient(place: LabBookPlace, chapters: LabChapterRef[], libraryBookId = 'bible'): boolean {
  if (chapters.length === 0) return false
  if (libraryBookId !== 'bible') {
    return place.bookId === libraryBookId && chapters.some(item => item.number === place.sequentialChapter)
  }
  const inBook = chapters.filter(item => biblicalBookId(parseBiblicalPlaceTitle(item.title).book) === place.bookId)
  if (inBook.length === 0) return false
  const sequential = inBook.find(item => item.number === place.sequentialChapter)
  if (sequential) return Number(parseBiblicalPlaceTitle(sequential.title).chapter) === place.chapterNumber
  return inBook.some(item => Number(parseBiblicalPlaceTitle(item.title).chapter) === place.chapterNumber)
}

export function isNewerPlace(candidate: LabBookPlace, known: LabBookPlace | null | undefined): boolean {
  if (!known) return true
  if (candidate.updatedAt !== known.updatedAt) return candidate.updatedAt > known.updatedAt
  return candidate.rev > known.rev
}

/** Same-book guard. James 1147 must never land on Genesis/Romans. */
export function shouldApplyCloudBookPlace(args: {
  contextBookId: string
  incoming: LabBookPlace | null | undefined
  local: LabBookPlace | null | undefined
  chapters: LabChapterRef[]
  /** Library book the chapter list belongs to (`bible` or a registry id). */
  libraryBookId?: string
}): boolean {
  const { contextBookId, incoming, local, chapters, libraryBookId = 'bible' } = args
  if (!incoming) return false
  if (incoming.bookId !== contextBookId) return false
  if (local && local.bookId !== incoming.bookId) return false
  if (!chapterExistsOnClient(incoming, chapters, libraryBookId)) return false
  return isNewerPlace(incoming, local)
}

/**
 * A cloud record that lands after the reader has painted. The initial
 * resolution (before first paint) may move anywhere the merge says; a late
 * arrival may only move the reader forward inside the book it is already in,
 * and never once the reader has touched the page. The merge itself already
 * guarantees the incoming place is the newer record.
 */
export function shouldFollowLateCloudResume(args: {
  current: { bookId: string; sequentialChapter: number; paragraphIndex: number }
  incoming: Pick<LabBookPlace, 'bookId' | 'sequentialChapter' | 'paragraphIndex'>
  interacted: boolean
}): boolean {
  const { current, incoming, interacted } = args
  if (interacted) return false
  if (incoming.bookId !== current.bookId) return false
  if (incoming.sequentialChapter !== current.sequentialChapter) return incoming.sequentialChapter > current.sequentialChapter
  return incoming.paragraphIndex > current.paragraphIndex
}

export function mergeLabPositionStates(local: LabPositionState, cloud: LabPositionState, chapters: LabChapterRef[], libraryBookId = 'bible'): LabPositionState {
  const books: Record<string, LabBookPlace> = { ...local.books }
  for (const [bookId, incoming] of Object.entries(cloud.books)) {
    if (!shouldApplyCloudBookPlace({
      contextBookId: bookId,
      incoming,
      local: books[bookId],
      chapters,
      libraryBookId,
    })) continue
    books[bookId] = incoming
  }

  let lastSettledBookId = local.lastSettledBookId
  let lastSettledAt = local.lastSettledAt
  const cloudResume = cloud.lastSettledBookId ? books[cloud.lastSettledBookId] : null
  if (
    cloud.lastSettledBookId
    && cloud.lastSettledAt > local.lastSettledAt
    && cloudResume
    && chapterExistsOnClient(cloudResume, chapters, libraryBookId)
  ) {
    lastSettledBookId = cloud.lastSettledBookId
    lastSettledAt = cloud.lastSettledAt
  }

  return {
    books,
    finished: unionFinishedChapters(local.finished, cloud.finished),
    hidden: mergeHiddenFromReadingNow(local.hidden, cloud.hidden),
    lastSettledBookId,
    lastSettledAt,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
    deviceId: local.deviceId || cloud.deviceId,
  }
}

/**
 * Time-ordered merge with no chapter gate: newer per-book record wins, newer
 * settle wins. Used by the server (chapter existence is a client concern) and
 * by the localStorage layer so an older tab cannot regress a newer record.
 */
export function mergeLabPositionStatesByTime(local: LabPositionState, incoming: LabPositionState): LabPositionState {
  const books = { ...local.books }
  for (const [bookId, place] of Object.entries(incoming.books)) {
    if (place.bookId !== bookId) continue
    if (isNewerPlace(place, books[bookId])) books[bookId] = place
  }
  let lastSettledBookId = local.lastSettledBookId
  let lastSettledAt = local.lastSettledAt
  if (incoming.lastSettledAt > local.lastSettledAt && incoming.lastSettledBookId && books[incoming.lastSettledBookId]) {
    lastSettledBookId = incoming.lastSettledBookId
    lastSettledAt = incoming.lastSettledAt
  }
  return {
    books,
    finished: unionFinishedChapters(local.finished, incoming.finished),
    hidden: mergeHiddenFromReadingNow(local.hidden, incoming.hidden),
    lastSettledBookId,
    lastSettledAt,
    updatedAt: Math.max(local.updatedAt, incoming.updatedAt),
    deviceId: incoming.deviceId || local.deviceId,
  }
}

export function settleReason(reason: LabPlaceReason): boolean {
  return reason === 'open-book' || reason === 'page-turn' || reason === 'mode-change' || reason === 'play' || reason === 'dwell'
}

export function persistImmediate(reason: LabPlaceReason): boolean {
  return reason === 'open-book' || reason === 'pause' || reason === 'hide' || reason === 'chapter-jump' || reason === 'mode-change' || reason === 'play' || reason === 'dwell'
}

export interface LabPositionNote {
  place: LabBookPlace
  reason: LabPlaceReason
  now?: number
}

export interface LabPositionController {
  state(): LabPositionState
  replace(state: LabPositionState): void
  note(input: LabPositionNote): LabPositionState
  /**
   * The reader turned past the last page (or heard the chapter out). An
   * explicit (bookId, chapter) tuple, never the in-memory place, so no
   * suspension gate can drop it; persisted at once.
   */
  finish(input: { bookId: string; sequentialChapter: number; now?: number }): LabPositionState
  applyCloud(cloud: LabPositionState, chapters: LabChapterRef[], libraryBookId?: string): LabPositionState
  resume(): LabBookPlace | null
  flush(): LabPositionState
}

/**
 * `local`: write the local store now, cloud PUT still pending on the debounce.
 * `debounce` / `immediate`: write everywhere.
 */
export type LabPersistCause = 'debounce' | 'immediate' | 'local'

export function createLabPositionController(opts: {
  deviceId: string
  now?: () => number
  persist?: (state: LabPositionState, cause: LabPersistCause, reason?: LabPlaceReason) => void
  dwellMs?: number
  debounceMs?: number
  schedule?: (fn: () => void, ms: number) => () => void
}): LabPositionController {
  const nowFn = opts.now ?? (() => Date.now())
  const dwellMs = opts.dwellMs ?? LAB_POSITION_DWELL_MS
  const debounceMs = opts.debounceMs ?? LAB_POSITION_DEBOUNCE_MS
  let state = emptyLabPositionState(opts.deviceId)
  let visitingBookId: string | null = null
  let visitStartedAt = 0
  let visitPlace: LabBookPlace | null = null
  /** Any note other than `hide` inside the visited book: a page turn, Play, a next chapter. */
  let visitActivity = false
  let cancelDebounce: (() => void) | null = null
  let cancelDwell: (() => void) | null = null

  const persist = (cause: LabPersistCause, reason?: LabPlaceReason) => {
    opts.persist?.(state, cause, reason)
  }

  const scheduleDebounce = (reason: LabPlaceReason) => {
    cancelDebounce?.()
    if (!opts.schedule) {
      persist('immediate', reason)
      return
    }
    persist('local', reason)
    cancelDebounce = opts.schedule(() => {
      cancelDebounce = null
      persist('debounce', reason)
    }, debounceMs)
  }

  const startVisit = (place: LabBookPlace, now: number) => {
    visitingBookId = place.bookId
    visitStartedAt = now
    visitPlace = place
    visitActivity = false
    armDwell(place, now)
  }

  const writeSettled = (place: LabBookPlace, now: number) => {
    state = {
      ...state,
      books: { ...state.books, [place.bookId]: place },
      lastSettledBookId: place.bookId,
      lastSettledAt: now,
      updatedAt: now,
      deviceId: opts.deviceId,
    }
    visitingBookId = null
    visitPlace = null
    visitStartedAt = 0
    visitActivity = false
    cancelDwell?.()
    cancelDwell = null
  }

  const writeBookOnly = (place: LabBookPlace, now: number) => {
    state = {
      ...state,
      books: { ...state.books, [place.bookId]: place },
      updatedAt: now,
      deviceId: opts.deviceId,
    }
  }

  const armDwell = (place: LabBookPlace, startedAt: number) => {
    cancelDwell?.()
    if (!opts.schedule) return
    cancelDwell = opts.schedule(() => {
      cancelDwell = null
      if (visitingBookId !== place.bookId) return
      const dwellPlace = visitPlace ?? place
      writeSettled({ ...dwellPlace, updatedAt: startedAt + dwellMs, rev: dwellPlace.rev + 1 }, startedAt + dwellMs)
      persist('immediate')
    }, dwellMs)
  }

  return {
    state: () => state,
    replace(next) {
      state = next
    },
    note(input) {
      const now = input.now ?? nowFn()
      const place = { ...input.place, updatedAt: now, deviceId: opts.deviceId }
      const settled = state.lastSettledBookId
      const sameSettled = settled === place.bookId
      const firstPin = !settled

      if (input.reason === 'chapter-jump' && !sameSettled && !firstPin && visitingBookId !== place.bookId) {
        startVisit(place, now)
        persist('immediate', input.reason)
        return state
      }

      if (visitingBookId && visitingBookId === place.bookId && !sameSettled) {
        visitPlace = place
        if (input.reason !== 'hide') visitActivity = true
        const leavingAfterReading = input.reason === 'hide' && (visitActivity || now - visitStartedAt >= dwellMs)
        if (settleReason(input.reason) || leavingAfterReading || firstPin) {
          writeSettled(place, now)
        }
        if (persistImmediate(input.reason)) persist('immediate', input.reason)
        else scheduleDebounce(input.reason)
        return state
      }

      if (sameSettled || firstPin || settleReason(input.reason)) {
        if (sameSettled || firstPin || settleReason(input.reason)) writeSettled(place, now)
        else writeBookOnly(place, now)
      } else if (input.reason === 'pause' || input.reason === 'hide' || input.reason === 'word') {
        if (sameSettled || firstPin) writeSettled(place, now)
      }

      if (persistImmediate(input.reason) || firstPin) persist('immediate', input.reason)
      else scheduleDebounce(input.reason)
      return state
    },
    finish(input) {
      const next = withFinishedChapter(state, input.bookId, input.sequentialChapter, input.now ?? nowFn())
      if (next === state) return state
      state = { ...next, deviceId: opts.deviceId }
      persist('immediate')
      return state
    },
    applyCloud(cloud, chapters, libraryBookId = 'bible') {
      state = mergeLabPositionStates(state, cloud, chapters, libraryBookId)
      return state
    },
    resume: () => resumePlace(state),
    flush() {
      cancelDebounce?.()
      cancelDebounce = null
      persist('immediate')
      return state
    },
  }
}
