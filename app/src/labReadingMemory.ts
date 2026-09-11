/**
 * Returning-reader sections for the locked /lab library.
 *
 * Reads durable reading sessions (device-only when signed out; device mirror
 * + versioned cloud copy when signed in) and the reader's own position store
 * (device record, merged by time with the account's cloud copy when signed
 * in), and renders truthfully:
 *
 *  - READING NOW · N — every book in progress, newest first by the newer of
 *    the two stores. The first is the hero: the eyebrow names the chapter
 *    Continue resumes in, the headline says where in it the reader is
 *    ("You’re in the middle of Proverbs 17"), and under it a "so far" line
 *    summarises the chapter up to that place — shown at once from the
 *    device cache, else requested from `/api/lab-recap` and filled in when
 *    it arrives, never an error. A summary is only GENERATED after an hour
 *    away from that book (LAB_RECAP_MIN_AWAY_MS); come back sooner and the
 *    hero is the position line alone. The book is named under it, one cream
 *    "Continue reading" pill. The rest are quiet rows: cover, title, "Last
 *    time · <chapter>", and one line of prose when there is a truthful one
 *    to show — the stored session summary for that chapter, else a "so far"
 *    summary this device already cached for that exact place. A row never
 *    asks for a new one.
 *  - FINISHED · N — books whose newest session completed the final chapter,
 *    or that the app marked `book-completed:*`. Quiet rows with a check.
 *
 * Continue resumes at the reader's true last place: the position store when
 * its record is newer than the memory session, else the memory anchor (see
 * preReader/libraryRecap.ts). It also tells the library which mode it is in.
 *
 * Summaries stay automatic, never a button: a session closed by the
 * 30-minute rule gets ONE generation attempt per library load for signed-in
 * readers, stored inside the session record so it syncs with the session
 * and is never regenerated elsewhere. Signed-out readers get the exact
 * excerpt only. Offline, a signed-in reader stays signed in: the recap reads
 * the local mirrors, writes wait in the queue and drain on `online`.
 */
import { supabase } from './services/supabase'
import { completedLibraryBookId } from './preReader/libraryCompletion'
import { createSupabaseReadingMemoryCloud, clearCloudReadingMemory } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { clearDeviceReadingMemory, readDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, type RecapAuth, type RecapLoadResult } from './readingMemory/recapLoad'
import { requestRecapSummary } from './readingMemory/summary'
import type { ReadingAnchor } from './readingMemory/types'
import { accountLabPositionRecord, mergeLabPositionStatesByTime, withHiddenFromReadingNow, type LabPositionState } from './lab/labPosition'
import { fetchLabPositionCloud, putLabPositionCloud, readLabPositionLocal, writeLabPositionLocal } from './lab/labPositionStore'
import { decideLabAiAction, recordLabAiAction } from './lab/labAccountPrompt'
import { recapCacheKey, type LabRecapRequest } from './recapSummary'
import { readStoredRecapSummary, recapSummaryPermission, requestLabRecapSummary, storeRecapSummary } from './preReader/recapSummaryClient'
import { LAB_LIBRARY_BOOT_ROW_MAX, clearLabLibraryBootSnapshot, safeCoverSource, writeLabLibraryBootSnapshot, type LabLibraryBootCard, type LabLibraryBootSnapshot } from './lab/labLibraryBoot'
// The Reading-now row and the popular row scroll by the same rule, so they
// read the focused cover out of the same function rather than each keeping a
// copy of it. library-model.js is a plain pure-function module; the bundler
// takes this one export and leaves the rest.
import { readerPreviewSearch, readReaderOrigin, shelfFocusIndex, writeReaderOrigin } from '../public/lab/library-model.js'
import {
  catalogueBookIdForPlace,
  heroHeadline,
  libraryModeFor,
  readingList,
  recapEyebrow,
  type ContinueTarget,
  type LibraryBookInfo,
  type LibraryMode,
  type ReadingList,
  type ReadingListRow,
} from './preReader/libraryRecap'

interface CatalogueBook {
  id: string
  title: string
  author: string
  art?: { src: string; srcSet: string } | null
  editions: Array<{ key: string; label: string; style?: string; language?: string; availability?: { chapterText?: boolean } }>
  readingStructure?: { chapters?: Array<{ number: number; title: string; paragraphCount?: number }> } | null
}

interface CoverSource {
  src: string
  srcSet: string
}

interface LabPreReaderApi {
  createHandoff?: (selection: {
    bookId: string
    primaryEditionKey: string
    savedPlace?: { bookId: string; chapterNumber: number; page?: number; paragraphIndex?: number; wordIndex?: number }
  }) => unknown | null
  openBook?: (bookId: string) => Promise<boolean>
  coverFor?: (bookId: string) => CoverSource | null
  bookProgress?: (
    bookId: string,
    place: { chapterNumber: number; page?: number; totalPages?: number | null; paragraphIndex?: number },
    finishedChapters?: number[],
  ) => number | null
}

const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'
const BOOK_COMPLETED_PREFIX = 'tinct:book-completed:'
/** The library never writes the position store: an explicit id keeps the read side-effect free. */
const LIBRARY_POSITION_DEVICE_ID = 'lab-library'

const root = document.querySelector<HTMLElement>('#tinct-onboarding-worlds-v5')
const section = root?.querySelector<HTMLElement>('[data-reading-memory-recap]') ?? null

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] as string)

let catalogue: Map<string, CatalogueBook> | null = null
let lastRendered: RecapLoadResult | null = null
let lastList: ReadingList = { readingNow: [], finished: [] }
/** One automatic summary attempt per library load, whatever re-renders happen. */
let summaryBudgetSpent = false
let renderChain: Promise<void> = Promise.resolve()
let renderQueued = false
let positionsResolving = true
let renderedViewer: string | null | undefined
/** A Continue tapped on the boot-painted recap before the first confirmed render; served by that render. */
let pendingContinue: string | null = null

function preReader(): LabPreReaderApi | undefined {
  return (window as Window & { __tinctLabPreReader?: LabPreReaderApi }).__tinctLabPreReader
}

function buildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

async function loadCatalogue(): Promise<Map<string, CatalogueBook>> {
  if (catalogue) return catalogue
  try {
    const response = await fetch('/lab/catalogue.json?v=20260907-4')
    if (!response.ok) throw new Error(String(response.status))
    const data = await response.json() as { books?: CatalogueBook[] }
    catalogue = new Map((data.books ?? []).map(book => [book.id, book]))
  } catch {
    catalogue = new Map()
  }
  return catalogue
}

/**
 * The persisted Supabase session, which stays available offline: being
 * offline while signed in must never look like being signed out.
 */
async function readAuth(): Promise<RecapAuth> {
  if (!supabase) return { userId: null, token: null }
  try {
    const { data } = await supabase.auth.getSession()
    return { userId: data.session?.user?.id ?? null, token: data.session?.access_token ?? null }
  } catch {
    return { userId: null, token: null }
  }
}

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

/**
 * The reader's position store as the library sees it: the device record,
 * merged by time with the account's cloud copy when signed in and online.
 * Read-only — the reader owns every write.
 */
async function loadPositions(auth: RecapAuth): Promise<LabPositionState | null> {
  let local: LabPositionState
  try {
    local = readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
  } catch {
    return null
  }
  // Read-only, but account-aware: another account's device record is not this
  // viewer's library, and a signed-out record does not outrank the account's
  // own row (2026-09-07).
  if (!auth.token || !auth.userId || !isOnline()) return accountLabPositionRecord(local, null, auth.userId)
  const cloud = await fetchLabPositionCloud(auth.token).catch(() => null)
  return accountLabPositionRecord(local, cloud, auth.userId)
}

/** Explicit completion markers and the legacy reader’s terminal progress records. */
function completedBookIds(): Set<string> {
  const ids = new Set<string>()
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || (!key.startsWith(BOOK_COMPLETED_PREFIX) && !key.startsWith('tinct:progress:'))) continue
      try {
        const id = completedLibraryBookId(key, JSON.parse(localStorage.getItem(key) ?? 'null'))
        if (id) ids.add(id)
      } catch { /* A malformed legacy record must not hide other finished books. */ }
    }
  } catch {
    // storage blocked
  }
  return ids
}

function bookInfos(books: Map<string, CatalogueBook>): Map<string, LibraryBookInfo> {
  return new Map([...books.values()].map(book => [book.id, {
    id: book.id,
    title: book.title,
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({ number: chapter.number, title: chapter.title, paragraphCount: chapter.paragraphCount })),
  }]))
}

function bookTitle(book: CatalogueBook | undefined, bookId: string): string {
  if (book) return book.title
  if (bookId === 'bible') return 'The Bible'
  return bookId
}

function coverFor(book: CatalogueBook | undefined, bookId: string): CoverSource | null {
  const fromRuntime = preReader()?.coverFor?.(bookId) ?? null
  if (fromRuntime) return fromRuntime
  if (book?.art?.src) return { src: book.art.src, srcSet: book.art.srcSet }
  return null
}

function coverMarkup(book: CatalogueBook | undefined, bookId: string): string {
  const cover = coverFor(book, bookId)
  if (!cover) return '<span class="lib-cover" aria-hidden="true"></span>'
  return `<span class="lib-cover"><img src="${escapeHtml(cover.src)}"${cover.srcSet ? ` srcset="${escapeHtml(cover.srcSet)}"` : ''} alt="" decoding="async"></span>`
}

/**
 * "54% read" under Continue. The number is the catalogue runtime's
 * (lab/library-2-model.js `wholeBookProgress`): position-derived for a
 * linear book; for the Bible the paragraphs of the row's finished chapters
 * plus the current chapter's fraction.
 */
function progressNote(row: Pick<ReadingListRow, 'target' | 'session' | 'finishedChapters'>): string | null {
  const { target, session } = row
  const percent = preReader()?.bookProgress?.(target.bookId, {
    chapterNumber: target.chapterNumber,
    page: target.pageIndex,
    totalPages: session && session.anchor.chapterNumber === target.chapterNumber ? session.anchor.totalPages : null,
    paragraphIndex: target.paragraphIndex,
  }, row.finishedChapters)
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return null
  if (percent > 0 && percent < 1) return '<1% read'
  return `${Math.round(percent)}% read`
}

function publishMode(mode: LibraryMode): void {
  ;(window as Window & { __tinctLabLibraryMode?: LibraryMode }).__tinctLabLibraryMode = mode
  window.dispatchEvent(new CustomEvent('tinct:lab-library-mode', { detail: { mode } }))
}

const sectionHead = (label: string, count: number, attr: string) => `<header class="lib-index-head lib-sec-head" ${attr}><span class="lib-eyebrow is-dim">${escapeHtml(label)}</span><span class="lib-cnt">${count}</span></header>`

/**
 * The "so far" request for the hero's place, or null when the summary is out
 * of scope: no recorded edition, or a Danish edition (English only for now).
 */
function summaryRequestFor(hero: ReadingListRow, books: Map<string, CatalogueBook>): LabRecapRequest | null {
  const { target } = hero
  if (!target.editionKey) return null
  const book = books.get(hero.bookId)
  const edition = book?.editions.find(item => item.key === target.editionKey)
  if (edition?.language === 'da' || target.editionKey.endsWith('-da')) return null
  return {
    bookId: hero.bookId,
    editionKey: target.editionKey,
    chapterNumber: target.chapterNumber,
    paragraphIndex: target.paragraphIndex,
    completed: hero.progress === 'finished',
    ...(hero.includePreviousChapter ? { previousChapterNumber: target.chapterNumber - 1 } : {}),
    bookTitle: bookTitle(book, hero.bookId),
  }
}

function summaryKeyFor(hero: ReadingListRow, request: LabRecapRequest): string {
  return recapCacheKey({
    bookId: request.bookId,
    editionKey: request.editionKey,
    chapterNumber: request.chapterNumber,
    paragraphIndex: request.paragraphIndex,
    paragraphCount: hero.target.paragraphCount,
    completed: request.completed === true,
    previousChapterNumber: request.previousChapterNumber ?? null,
  })
}

function deviceStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

type SummaryLineStatus = 'pending' | 'none' | 'cached' | 'fresh' | 'loading' | 'unavailable' | 'offline' | 'account-required' | 'recent' | 'from-reader'

function sessionStore(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage
  } catch {
    return null
  }
}

/**
 * The book this visit to the reader started on, named as the CATALOGUE names
 * it. The library and the book page record the catalogue id, but the boot
 * script's resume redirect can only see the reader's own position record —
 * and the reader pins the Bible per biblical book (`jeremiah`, `proverbs`),
 * never as `bible`. Same mapping the position store gets.
 */
function readerOrigin(books: Map<string, CatalogueBook>) {
  const origin = readReaderOrigin(sessionStore())
  if (!origin) return null
  const bookId = catalogueBookIdForPlace({ bookId: origin.bookId }, books)
  return bookId ? { bookId, at: origin.at } : null
}

/**
 * Per page load: keys being fetched or that failed. A re-render during a
 * request must not start a second one, and a failed key is not retried until
 * the next library load — the hero degrades to its position line.
 */
const summaryOutcomes = new Map<string, 'loading' | 'unavailable'>()

function heroSummaryLine(key: string): HTMLElement | null {
  return section?.querySelector<HTMLElement>(`[data-recap-summary-key="${CSS.escape(key)}"]`) ?? null
}

/** Set the status only while the hero for this key is the one on screen. */
function setSummaryStatus(key: string, status: SummaryLineStatus): void {
  if (section && heroSummaryLine(key)) section.dataset.summaryLine = status
}

/** Reveal a recap only once text is available; the reader can continue immediately. */
function showSummary(key: string, summary: string, status: 'cached' | 'fresh'): void {
  const line = heroSummaryLine(key)
  if (!line || !section) return
  const text = line.querySelector<HTMLElement>('.lib-recap-summary-text')
  if (!text) return
  text.textContent = summary
  line.hidden = false
  line.classList.add('is-shown')
  section.dataset.summaryLine = status
  markExpandable(line, text)
}

const MORE_LABEL = 'More'
const LESS_LABEL = 'Less'

/** Clamped text is text there is more of; only then is the block a control. */
function markExpandable(line: HTMLElement, text: HTMLElement): void {
  const clamped = text.scrollHeight > text.clientHeight + 1
  const more = line.querySelector<HTMLElement>('.lib-recap-summary-more')
  line.toggleAttribute('disabled', !clamped)
  if (clamped) line.setAttribute('aria-expanded', 'false')
  else line.removeAttribute('aria-expanded')
  if (more) more.textContent = clamped ? MORE_LABEL : ''
  line.dataset.expandable = String(clamped)
}

/**
 * Open or close the "so far" block. The clamp comes off in one frame, so the
 * height is animated from the measured collapsed height to the measured full
 * one and the inline height is dropped again at the end — the box grows
 * calmly and the page below it follows, and nothing scrolls on its own.
 */
function toggleSummary(line: HTMLElement): void {
  if (line.dataset.expandable !== 'true') return
  const text = line.querySelector<HTMLElement>('.lib-recap-summary-text')
  if (!text) return
  const opening = !line.classList.contains('is-open')
  const from = text.getBoundingClientRect().height
  line.classList.toggle('is-open', opening)
  line.setAttribute('aria-expanded', String(opening))
  const more = line.querySelector<HTMLElement>('.lib-recap-summary-more')
  if (more) more.textContent = opening ? LESS_LABEL : MORE_LABEL
  if (reducedMotion()) return
  text.style.height = 'auto'
  const to = text.getBoundingClientRect().height
  if (Math.abs(to - from) < 1) { text.style.height = ''; return }
  text.style.height = `${from}px`
  void text.getBoundingClientRect().height
  const settle = (event: TransitionEvent) => {
    if (event.propertyName !== 'height') return
    text.style.height = ''
    text.removeEventListener('transitionend', settle)
  }
  text.addEventListener('transitionend', settle)
  requestAnimationFrame(() => { text.style.height = `${to}px` })
}

/**
 * Fill the hero's "so far" line. The position line is already on screen;
 * this only ever adds text. Device cache first (the library opens complete
 * on a repeat visit); otherwise, away long enough, online and allowed, one
 * request. The anonymous free AI action is spent only on a request that
 * succeeds, and a cache hit costs nothing. Any failure leaves the line
 * hidden.
 *
 * Cache decision (owner rule, 2026-09-07): the device cache is read BEFORE
 * the away-threshold, so a summary this device already holds for exactly
 * this place is still shown after a short absence. The rule is about not
 * *producing* a summary of a five-minute break — showing one that already
 * exists costs nothing, is true of the place on screen, and stops the line
 * from disappearing when the reader bounces back to the library.
 */
async function fillHeroSummary(
  hero: ReadingListRow,
  books: Map<string, CatalogueBook>,
  allowRequest = true,
): Promise<void> {
  if (!section) return
  const request = summaryRequestFor(hero, books)
  if (!request) {
    section.dataset.summaryLine = 'none'
    return
  }
  const key = summaryKeyFor(hero, request)
  const storage = deviceStorage()
  // Both halves of the rule — the hour away from the book, and the return
  // straight back out of that book's own reader — live in
  // preReader/recapSummaryClient.ts.
  const permission = recapSummaryPermission({
    bookId: hero.bookId,
    origin: readerOrigin(books),
    sessionLastActiveAt: hero.session?.lastActiveAt ?? null,
    placeUpdatedAt: hero.target.at,
    now: Date.now(),
  })
  const cached = permission.cache ? readStoredRecapSummary(storage, key) : null
  if (cached) {
    showSummary(key, cached, 'cached')
    return
  }
  // Came out of this book's reader: the position line is the whole hero, and
  // nowCaptionMarkup has already left the block out of the page.
  if (permission.reason === 'from-reader') {
    section.dataset.summaryLine = 'from-reader'
    return
  }
  // Scrolling PAST a book is not asking about it. The caption repaints on
  // every focus change with allowRequest false — cache and status only — and
  // the caller schedules the one request after the focus has settled.
  if (!allowRequest) {
    setSummaryStatus(key, summaryOutcomes.get(key) ?? 'pending')
    return
  }
  // Away for less than LAB_RECAP_MIN_AWAY_MS: the hero says where the reader
  // is and stops there. No request is sent, so there is no model call, no
  // spent free action and no cache write.
  if (!permission.request) {
    setSummaryStatus(key, 'recent')
    return
  }
  const outcome = summaryOutcomes.get(key)
  if (outcome) {
    setSummaryStatus(key, outcome)
    return
  }
  if (!isOnline()) {
    setSummaryStatus(key, 'offline')
    return
  }
  summaryOutcomes.set(key, 'loading')
  setSummaryStatus(key, 'loading')
  const auth = await readAuth()
  const decision = decideLabAiAction({ signedIn: Boolean(auth.userId) })
  if (!decision.allowed) {
    summaryOutcomes.delete(key)
    setSummaryStatus(key, 'account-required')
    return
  }
  const result = await requestLabRecapSummary({ request, token: auth.token }).catch(() => ({ ok: false as const, error: 'request failed' }))
  if (!result.ok) {
    summaryOutcomes.set(key, 'unavailable')
    setSummaryStatus(key, 'unavailable')
    return
  }
  summaryOutcomes.delete(key)
  if (decision.reason === 'free' && !result.response.cached) recordLabAiAction()
  storeRecapSummary(storage, key, result.response.summary, Date.now())
  showSummary(key, result.response.summary, 'fresh')
}

/**
 * Reading now (2026-09-07): one row of covers that scrolls like the popular
 * shelf, and one caption under it for the book in the middle. Every card is
 * the same card — no hero above a stack of quiet rows, no amber accent, and
 * no per-card "so far" summary: the summary belongs to the book you scrolled
 * to, and there is only ever one of it on screen.
 */
function nowItemMarkup(row: ReadingListRow, books: Map<string, CatalogueBook>, index: number, focused: boolean): string {
  const title = bookTitle(books.get(row.bookId), row.bookId)
  return `<div class="lib-now-item${focused ? ' is-focused' : ''}" data-now-book="${escapeHtml(row.bookId)}" data-now-index="${index}"><button type="button" class="lib-now-open" data-recap-open="${escapeHtml(row.bookId)}" data-continue-source="${row.target.source}" data-continue-chapter="${row.target.chapterNumber}" aria-current="${focused}" aria-label="${escapeHtml(`Continue ${title} from ${row.target.chapterLabel}`)}">${coverMarkup(books.get(row.bookId), row.bookId)}</button>${removeMarkup(row.bookId, title)}</div>`
}

function elementFromMarkup(markup: string): HTMLElement {
  const template = document.createElement('template')
  template.innerHTML = markup.trim()
  return template.content.firstElementChild as HTMLElement
}

function setAttr(node: Element, name: string, value: string): void {
  if (node.getAttribute(name) !== value) node.setAttribute(name, value)
}

/**
 * Bring an existing card up to date without recreating it. The cover's
 * `<img>` is the point: assigning the same `src` again is harmless, but a
 * recreated node is a fresh request and a blank frame while it decodes, and
 * the boot paint (lab/library-boot.js) has already put the hero's cover on
 * screen before this module loaded.
 */
function updateNowItem(item: HTMLElement, row: ReadingListRow, books: Map<string, CatalogueBook>, index: number, focused: boolean): void {
  const book = books.get(row.bookId)
  const title = bookTitle(book, row.bookId)
  setAttr(item, 'data-now-index', String(index))
  item.classList.toggle('is-focused', focused)
  let open = item.querySelector<HTMLElement>('.lib-now-open')
  if (!open) {
    open = elementFromMarkup(`<button type="button" class="lib-now-open"></button>`)
    item.prepend(open)
  }
  setAttr(open, 'data-recap-open', row.bookId)
  setAttr(open, 'data-continue-source', row.target.source)
  setAttr(open, 'data-continue-chapter', String(row.target.chapterNumber))
  setAttr(open, 'aria-current', String(focused))
  setAttr(open, 'aria-label', `Continue ${title} from ${row.target.chapterLabel}`)
  let cover = open.querySelector<HTMLElement>('.lib-cover')
  if (!cover) {
    cover = elementFromMarkup('<span class="lib-cover"></span>')
    open.replaceChildren(cover)
  }
  const source = coverFor(book, row.bookId)
  let img = cover.querySelector('img')
  if (!source) {
    img?.remove()
    setAttr(cover, 'aria-hidden', 'true')
  } else {
    cover.removeAttribute('aria-hidden')
    if (!img) {
      img = document.createElement('img')
      img.alt = ''
      img.decoding = 'async'
      cover.appendChild(img)
    }
    if (img.getAttribute('src') !== source.src) img.src = source.src
    if (source.srcSet) { if (img.getAttribute('srcset') !== source.srcSet) img.srcset = source.srcSet }
    else if (img.hasAttribute('srcset')) img.removeAttribute('srcset')
  }
  let remove = item.querySelector<HTMLElement>('.lib-now-remove')
  if (!remove) {
    remove = elementFromMarkup(removeMarkup(row.bookId, title))
    item.appendChild(remove)
  }
  setAttr(remove, 'data-now-remove', row.bookId)
  setAttr(remove, 'aria-label', `Remove ${title} from currently reading`)
}

/**
 * The row's cards, keyed by book. Cards already on the row — the confirmed
 * render's, or the one the boot paint put there — are kept and moved into
 * place; only genuinely new books get a new card, and books that left the
 * list have theirs removed. Nothing here recreates an `<img>` that is
 * already showing the right cover.
 */
function reconcileNowShelf(shelf: HTMLElement, rows: ReadingListRow[], books: Map<string, CatalogueBook>, focused: number): void {
  const existing = new Map<string, HTMLElement>()
  for (const item of [...shelf.querySelectorAll<HTMLElement>('.lib-now-item')]) {
    const id = item.dataset.nowBook
    if (id && !existing.has(id) && item.parentElement === shelf) existing.set(id, item)
    else item.remove()
  }
  rows.forEach((row, index) => {
    let item = existing.get(row.bookId)
    if (item) {
      updateNowItem(item, row, books, index, index === focused)
      existing.delete(row.bookId)
    } else {
      item = elementFromMarkup(nowItemMarkup(row, books, index, index === focused))
    }
    const slot = shelf.children[index] ?? null
    if (slot !== item) shelf.insertBefore(item, slot)
  })
  for (const stale of existing.values()) stale.remove()
  while (shelf.children.length > rows.length) shelf.lastElementChild!.remove()
  shelf.classList.toggle('is-single', rows.length < 2)
}

/** The Finished rows, keyed by book: a row is static per book, so a kept one is left alone. */
function reconcileFinishedRows(container: HTMLElement, rows: ReadingList['finished'], books: Map<string, CatalogueBook>): void {
  const existing = new Map<string, HTMLElement>()
  for (const item of [...container.querySelectorAll<HTMLElement>('.lib-recap-row')]) {
    const id = item.dataset.finishedBook
    if (id && !existing.has(id) && item.parentElement === container) existing.set(id, item)
    else item.remove()
  }
  rows.forEach((row, index) => {
    let item = existing.get(row.bookId)
    if (item) existing.delete(row.bookId)
    else item = elementFromMarkup(finishedMarkup(row, books))
    const slot = container.children[index] ?? null
    if (slot !== item) container.insertBefore(item, slot)
  })
  for (const stale of existing.values()) stale.remove()
  while (container.children.length > rows.length) container.lastElementChild!.remove()
}

function setCount(head: Element | null, count: number): void {
  const cnt = head?.querySelector('.lib-cnt')
  if (cnt && cnt.textContent !== String(count)) cnt.textContent = String(count)
}

/**
 * Take a book off the list — the classic app's control, in the classic app's
 * place: a small round × pinned to the top-right corner of the card in
 * Continue reading (BookStore.tsx `.library-continue-remove`), one tap, no
 * confirmation, labelled "Remove {title} from currently reading". As there,
 * it removes nothing: the place, the notes, the highlights, the chat and the
 * reading-memory sessions all stay, and opening the book again lists it once
 * more at the page it was left on.
 */
function removeMarkup(bookId: string, title: string): string {
  return `<button type="button" class="lib-now-remove" data-now-remove="${escapeHtml(bookId)}" aria-label="${escapeHtml(`Remove ${title} from currently reading`)}" title="Remove from currently reading">×</button>`
}

/**
 * Whether this caption can show a "so far" block. A reader who has just walked out of this book's
 * reader is never getting a summary — the rule says so synchronously — so
 * the block is not there rather than empty. lab/library-boot.js asks exactly
 * the same question of exactly the same marker before it paints, so the
 * block cannot appear or vanish between the boot paint and this one.
 */
function summaryBlockReserved(row: ReadingListRow, books: Map<string, CatalogueBook>): boolean {
  return recapSummaryPermission({
    bookId: row.bookId,
    origin: readerOrigin(books),
    sessionLastActiveAt: row.session?.lastActiveAt ?? null,
    placeUpdatedAt: row.target.at,
    now: Date.now(),
  }).reason !== 'from-reader'
}

/** The block: a button, so the whole three-line box is the tap target. */
function summaryMarkup(summaryKey: string): string {
  return `<button type="button" class="lib-recap-summary" hidden data-testid="lab-recap-summary" data-recap-summary-key="${escapeHtml(summaryKey)}" data-expandable="false" disabled><span class="lib-recap-summary-text"></span><span class="lib-recap-summary-more" aria-hidden="true"></span></button>`
}

/**
 * The caption, top to bottom: the book's title (a small line, so the eyebrow
 * and headline under it are read as being about that book), the chapter
 * eyebrow, the headline, the optional "so far" block, Continue. The title
 * used to sit under the summary, where it read as a stray caption to the
 * description. lab/library-boot.js paints the same order.
 */
function nowCaptionMarkup(row: ReadingListRow, books: Map<string, CatalogueBook>): string {
  const book = books.get(row.bookId)
  const note = progressNote(row)
  const request = summaryRequestFor(row, books)
  const summaryKey = request ? summaryKeyFor(row, request) : ''
  const summary = request && summaryBlockReserved(row, books) ? summaryMarkup(summaryKey) : ''
  return `<p class="lib-lede" data-testid="lab-recap-book">${escapeHtml(bookTitle(book, row.bookId))}</p>
      <p class="lib-eyebrow" data-testid="lab-recap-eyebrow">${escapeHtml(recapEyebrow(row.target.chapterLabel))}</p>
      <h1 class="lib-h1" data-testid="lab-recap-headline">${escapeHtml(heroHeadline(row))}</h1>
      ${summary}
      <div class="lib-now-cta"><button type="button" class="lib-cta" data-recap-continue="${escapeHtml(row.bookId)}">Continue reading</button>${note ? `<span class="lib-cta-note" data-testid="lab-recap-progress">${escapeHtml(note)}</span>` : ''}</div>`
}

function finishedMarkup(row: ReadingList['finished'][number], books: Map<string, CatalogueBook>): string {
  const book = books.get(row.bookId)
  const title = bookTitle(book, row.bookId)
  return `<button type="button" class="lib-recap-row is-finished" data-finished-book="${escapeHtml(row.bookId)}" aria-label="${escapeHtml(`${title} — finished. Open again`)}">${coverMarkup(book, row.bookId)}<span class="lib-recap-row-copy"><span class="lib-recap-row-t">${escapeHtml(title)}</span><span class="lib-eyebrow is-dim">Finished</span></span><svg class="lib-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></button>`
}

/** The book the reading-now row is centred on. */
let nowFocus = 0
/** What the caption last rendered; the same text is not rendered twice. */
let lastCaptionMarkup = ''
let nowFocusChosen = false
let nowObserver: IntersectionObserver | null = null
let nowQuietUntil = 0
let nowSettleTimer: ReturnType<typeof setTimeout> | null = null

/**
 * How long the row must hold still on a book before its "so far" line is
 * asked for. Scrolling across four covers to reach the fifth must not order
 * four summaries; stopping on one is the reader asking about it.
 */
const NOW_SETTLE_MS = 700

function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Repaint the caption for the focused book and fill its summary — only its
 * own. `immediate` is the book the library opened on: the reader arrived at
 * it rather than scrolling to it, so it asks straight away.
 */
function renderNowCaption(immediate = false): void {
  if (!section) return
  const rows = lastList.readingNow
  const row = rows[nowFocus]
  const caption = section.querySelector<HTMLElement>('[data-now-caption]')
  if (!caption || !row) return
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const card = nowFocus === 0 && lastRendered && row.session && lastRendered.card.provenance.sessionId === row.session.id
    ? lastRendered.card
    : null
  // The caption is text; rebuilding it for the same text would only restart
  // the summary's fade and the reader's selection. The boot paint's caption
  // (lab/library-boot.js) never matches — it carries no test hooks — so the
  // first confirmed render always replaces it, in the same shape.
  const markup = nowCaptionMarkup(row, books)
  if (lastCaptionMarkup !== markup || !caption.childElementCount) {
    caption.innerHTML = markup
    lastCaptionMarkup = markup
  }
  section.dataset.book = row.bookId
  section.dataset.sessionState = row.session?.state ?? 'none'
  section.dataset.bodyKind = card ? card.bodyKind : row.recap ? 'summary' : 'location-only'
  section.dataset.continueSource = row.target.source
  section.dataset.continueChapter = String(row.target.chapterNumber)
  section.dataset.progress = row.progress ?? ''
  section.dataset.summaryLine = 'pending'
  section.dataset.nowFocus = String(nowFocus)
  section.querySelectorAll<HTMLElement>('[data-now-index]').forEach(item => {
    const focused = Number(item.dataset.nowIndex) === nowFocus
    item.classList.toggle('is-focused', focused)
    item.setAttribute('aria-current', String(focused))
  })
  // Whatever this device already knows about the place, immediately; the one
  // request only once the row has settled here.
  if (nowSettleTimer) clearTimeout(nowSettleTimer)
  if (immediate) {
    void fillHeroSummary(row, books, true).catch(() => {})
    return
  }
  const settled = nowFocus
  void fillHeroSummary(row, books, false).catch(() => {})
  nowSettleTimer = setTimeout(() => {
    nowSettleTimer = null
    if (settled !== nowFocus) return
    void fillHeroSummary(row, books, true).catch(() => {})
  }, NOW_SETTLE_MS)
}

function setNowFocus(index: number, scroll = false): void {
  const rows = lastList.readingNow
  const next = Math.max(0, Math.min(rows.length - 1, index))
  if (next === nowFocus && section?.querySelector('[data-now-caption]')?.childElementCount) return
  nowFocus = next
  nowFocusChosen = true
  renderNowCaption()
  if (!scroll) return
  const shelf = section?.querySelector<HTMLElement>('[data-now-shelf]')
  const item = shelf?.querySelector<HTMLElement>(`[data-now-index="${next}"]`)
  if (shelf && item) centreNowItem(shelf, item)
}

function centreNowItem(shelf: HTMLElement, item: HTMLElement): void {
  if (shelf.classList.contains('is-flush')) return
  const target = Math.max(0, Math.min(
    shelf.scrollWidth - shelf.clientWidth,
    item.offsetLeft - shelf.offsetLeft + item.offsetWidth / 2 - shelf.clientWidth / 2,
  ))
  if (Math.abs(target - shelf.scrollLeft) < 2) return
  nowQuietUntil = Date.now() + 420
  if (typeof shelf.scrollTo === 'function') shelf.scrollTo({ left: target, behavior: reducedMotion() ? 'auto' : 'smooth' })
  else shelf.scrollLeft = target
}

/**
 * The centring spacers are for a row that overflows. A row whose covers all
 * fit — two books on a tablet, one on a phone — would otherwise park them in
 * the middle of an empty rail, away from the caption that names them. Only
 * measurement knows which case this is, so the class is set here rather than
 * guessed at a breakpoint.
 */
function fitNowShelf(): void {
  const shelf = section?.querySelector<HTMLElement>('[data-now-shelf]')
  if (!shelf) return
  const items = [...shelf.querySelectorAll<HTMLElement>('[data-now-index]')]
  if (!items.length) return
  const style = getComputedStyle(shelf)
  // Desktop (≥1280px, lab/index.html): the covers wrap into rows beside the
  // caption instead of scrolling. A wrapped row has no middle to read, so it
  // is flush whatever its width, and the scroll-driven focus stays off.
  const wrapped = style.flexWrap === 'wrap'
  shelf.classList.toggle('is-grid', wrapped)
  const gap = Number.parseFloat(style.columnGap) || 0
  const content = items.reduce((total, item) => total + item.offsetWidth, 0) + gap * (items.length - 1)
  shelf.classList.toggle('is-flush', wrapped || content <= shelf.clientWidth + 1)
}

/**
 * The row's shape is measured, so a resize — a window dragged across the
 * 1280px line, a tablet turned — measures it again and attaches or detaches
 * the scroll-driven focus to match.
 */
let nowResizeFrame = 0
function refitNowShelfOnResize(): void {
  if (nowResizeFrame) return
  nowResizeFrame = requestAnimationFrame(() => {
    nowResizeFrame = 0
    if (!lastList.readingNow.length) return
    fitNowShelf()
    observeNowShelf()
  })
}

/**
 * Which cover the row is on, from its geometry: nearest the middle, and at
 * either end of the track the cover at that end. The last cover finishes the
 * track at the page's margin (there is no trailing spacer — that spacer let
 * the row scroll an empty slot past it), so it can never come to the middle
 * and the end-of-track case is how it is ever focused.
 */
function focusNowFromGeometry(shelf: HTMLElement): void {
  if (Date.now() < nowQuietUntil) return
  const items = [...shelf.querySelectorAll<HTMLElement>('[data-now-index]')].map(item => ({
    left: item.offsetLeft - shelf.offsetLeft,
    width: item.offsetWidth,
  }))
  const index = shelfFocusIndex(items, shelf.scrollLeft, shelf.clientWidth, shelf.scrollWidth)
  if (index !== nowFocus) setNowFocus(index)
}

/** Centre detection, the same rule the popular shelf uses. */
function observeNowShelf(): void {
  nowObserver?.disconnect()
  nowObserver = null
  const shelf = section?.querySelector<HTMLElement>('[data-now-shelf]')
  if (!shelf || lastList.readingNow.length < 2) return
  // A row that does not scroll has no middle to read: the focus stays on the
  // book the library opened on until the reader taps another cover.
  if (shelf.classList.contains('is-flush')) return
  if (typeof IntersectionObserver === 'function') {
    // The observer only says "the row moved past the middle"; the geometry
    // decides which cover that is, so both paths answer the same way at the
    // end of the track.
    nowObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      focusNowFromGeometry(shelf)
    }, { root: shelf, rootMargin: '0px -50% 0px -50%', threshold: 0 })
    shelf.querySelectorAll('[data-now-index]').forEach(item => nowObserver!.observe(item))
  }
  // The shelf is re-created on every render and observeNowShelf may run twice
  // for one of them (once before layout, once after it settles): mark the
  // element so the scroll fallback is attached exactly once per row.
  if (shelf.dataset.nowScrollBound === '1') return
  shelf.dataset.nowScrollBound = '1'
  let frame = 0
  shelf.addEventListener('scroll', () => {
    if (frame || Date.now() < nowQuietUntil) return
    frame = requestAnimationFrame(() => {
      frame = 0
      focusNowFromGeometry(shelf)
    })
  }, { passive: true })
}

/**
 * Paint the list into the section by reconciling what is already there — the
 * boot paint or the previous render — rather than rebuilding it. A returning
 * reader's library is painted up to six times per load (local, cloud
 * positions, completions, memory, recap); rebuilt with `innerHTML`, every one
 * of those recreated every cover `<img>` and restarted every opacity
 * transition, which is the flicker Anders saw. Now a repaint that changes
 * nothing touches nothing, and one that reorders moves the existing cards.
 */
function renderSections(list: ReadingList, rendered: RecapLoadResult | null): void {
  if (!section) return
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const hero = list.readingNow[0] ?? null
  const heroCard = hero && rendered && hero.session && rendered.card.provenance.sessionId === hero.session.id ? rendered.card : null
  section.hidden = false
  delete section.dataset.bootRecap
  section.removeAttribute('aria-busy')
  section.dataset.testid = 'lab-recap-card'
  section.dataset.book = hero?.bookId ?? ''
  section.dataset.sessionState = hero?.session?.state ?? 'none'
  section.dataset.completed = 'false'
  section.dataset.bodyKind = heroCard ? heroCard.bodyKind : hero?.recap ? 'summary' : 'location-only'
  section.dataset.syncState = heroCard ? heroCard.syncState : (rendered?.signedIn ? 'pending' : 'device-only')
  section.dataset.summaryStatus = heroCard ? rendered!.summaryStatus : 'unavailable'
  section.dataset.continueSource = hero?.target.source ?? ''
  section.dataset.continueChapter = hero ? String(hero.target.chapterNumber) : ''
  section.dataset.progress = hero?.progress ?? ''
  section.dataset.summaryLine = hero ? 'pending' : 'none'
  section.dataset.readingNow = String(list.readingNow.length)
  section.dataset.finished = String(list.finished.length)
  // Preserve a deliberate cover selection, never the stale boot/local hero.
  const focusedBook = nowFocusChosen ? section.querySelector<HTMLElement>('.lib-now-item.is-focused')?.dataset.nowBook : undefined
  nowFocus = Math.max(0, list.readingNow.findIndex(row => row.bookId === focusedBook))

  let readingNow = section.querySelector<HTMLElement>('[data-reading-now-section]')
  if (!hero) {
    readingNow?.remove()
  } else {
    if (!readingNow) {
      readingNow = elementFromMarkup(`<section class="lib-reading-now" data-reading-now-section aria-label="Reading now">${sectionHead('Reading now', list.readingNow.length, 'data-reading-now-head')}<div class="lib-now-shelf" data-now-shelf role="group" aria-label="Books you are reading"></div><div class="lib-now-caption" data-now-caption aria-live="polite"></div></section>`)
      section.prepend(readingNow)
    } else if (readingNow !== section.firstElementChild) {
      section.prepend(readingNow)
    }
    setCount(readingNow.querySelector('[data-reading-now-head]'), list.readingNow.length)
    let shelf = readingNow.querySelector<HTMLElement>('[data-now-shelf]')
    if (!shelf) {
      shelf = elementFromMarkup('<div class="lib-now-shelf" data-now-shelf role="group" aria-label="Books you are reading"></div>')
      readingNow.querySelector('[data-now-caption]')?.before(shelf) ?? readingNow.appendChild(shelf)
    }
    reconcileNowShelf(shelf, list.readingNow, books, nowFocus)
    if (!readingNow.querySelector('[data-now-caption]')) {
      readingNow.appendChild(elementFromMarkup('<div class="lib-now-caption" data-now-caption aria-live="polite"></div>'))
    }
  }

  let finished = section.querySelector<HTMLElement>('[data-finished-section]')
  if (!list.finished.length) {
    finished?.remove()
  } else {
    if (!finished) {
      finished = elementFromMarkup(`<section class="lib-finished" data-finished-section aria-label="Finished">${sectionHead('Finished', list.finished.length, 'data-finished-head')}<div class="lib-recap-others" data-finished-rows></div></section>`)
      section.appendChild(finished)
    }
    setCount(finished.querySelector('[data-finished-head]'), list.finished.length)
    reconcileFinishedRows(finished.querySelector<HTMLElement>('[data-finished-rows]')!, list.finished, books)
  }

  if (!hero) return
  renderNowCaption(true)
  fitNowShelf()
  observeNowShelf()
  const shelf = section.querySelector<HTMLElement>('[data-now-shelf]')
  const item = shelf?.querySelector<HTMLElement>(`[data-now-index="${nowFocus}"]`)
  if (shelf && item) requestAnimationFrame(() => { fitNowShelf(); observeNowShelf(); centreNowItem(shelf, item) })
}

async function performRender(): Promise<void> {
  if (!section) return
  positionsResolving = true
  // Paint all locally known books before recap generation or cloud latency.
  const [auth] = await Promise.all([readAuth(), loadCatalogue()])
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const paintList = (positions: LabPositionState | null) => {
    const list = readingList({ memory: readDeviceReadingMemory(), viewer: auth.userId, positions, books: bookInfos(books), completedBookIds: completedBookIds() })
    if (libraryModeFor(list) !== 'new') { lastList = list; renderSections(list, null); publishMode(libraryModeFor(list)) }
  }
  if (renderedViewer !== auth.userId) {
    // Local data is only a first-paint preview. Replaying it on every auth,
    // catalogue or focus event briefly replaces a newer confirmed cloud list.
    nowFocusChosen = false
    lastList = { readingNow: [], finished: [] }
    lastCaptionMarkup = ''
    // A viewer CHANGE (sign-in, sign-out) clears the previous account's
    // library before anything of the new one is painted. The first load is
    // not a change: the boot paint (lab/library-boot.js) is this viewer's own
    // snapshot, and it stays on screen until the local list reconciles into
    // it — clearing it here was the snapshot-to-blank flash.
    if (renderedViewer !== undefined) {
      section.innerHTML = ''
      section.hidden = true
    }
    paintList(accountLabPositionRecord(readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID), null, auth.userId))
    renderedViewer = auth.userId
  }
  const positionsReady = loadPositions(auth).then(positions => {
    paintList(positions)
    positionsResolving = false
    // Continue needs the current position, not an optional generated recap.
    if (pendingContinue !== null) {
      const bookId = pendingContinue
      pendingContinue = null
      continueReading(bookId || undefined)
    }
    return positions
  })
  const completionsReady = auth.userId && supabase ? supabase.from('user_data').select('key,value').eq('user_id', auth.userId).or('key.like.book-completed:*,key.like.progress:*').then(({ data, error }) => {
    if (!error) for (const row of data ?? []) {
      if (row.value != null) localStorage.setItem(`tinct:${row.key}`, JSON.stringify(row.value))
      else localStorage.removeItem(`tinct:${row.key}`)
    }
  }).then(async () => paintList(await positionsReady)).catch(() => {}) : Promise.resolve()
  const [, rendered] = await Promise.all([
    loadCatalogue(),
    loadRecap({
      auth: readAuth,
      cloudFor: userId => createSupabaseReadingMemoryCloud(userId),
      loadChapter: (anchor: ReadingAnchor) => loadChapterText({
        bookId: anchor.bookId,
        editionKey: anchor.editionKey,
        chapterNumber: anchor.chapterNumber,
        version: buildVersion(),
      }),
      requestSummary: input => requestRecapSummary(input),
      bookTitle: bookId => catalogue?.get(bookId)?.title,
      online: isOnline,
      allowSummary: !summaryBudgetSpent,
      onMemoryReady: () => { void positionsReady.then(paintList) },
    }),
  ])
  if (rendered?.summaryAttempted) summaryBudgetSpent = true
  lastRendered = rendered
  // loadRecap has already merged the cloud copy into the device mirror; the
  // viewer sees no-account sessions and their own account's sessions. The
  // position store is read the same way (device, plus cloud when signed in).
  const positions = await positionsReady
  await completionsReady
  const list = readingList({
    memory: readDeviceReadingMemory(),
    viewer: auth.userId,
    positions,
    books: bookInfos(books),
    completedBookIds: completedBookIds(),
  })
  lastList = list
  const mode = libraryModeFor(list)
  if (mode === 'new') {
    section.hidden = true
    section.innerHTML = ''
    delete section.dataset.testid
    delete section.dataset.bootRecap
    section.removeAttribute('aria-busy')
    publishMode(mode)
    clearLabLibraryBootSnapshot()
    pendingContinue = null
    return
  }
  renderSections(list, rendered)
  publishMode(mode)
  writeLabLibraryBootSnapshot(bootSnapshot(list, auth.userId, books))
  window.dispatchEvent(new CustomEvent('tinct:lab-reading-memory-rendered', { detail: { card: rendered?.card ?? null, readingNow: list.readingNow.length, finished: list.finished.length } }))
  if (pendingContinue !== null) {
    const bookId = pendingContinue
    pendingContinue = null
    continueReading(bookId || undefined)
  }
}

/**
 * What the inline boot script in lab/index.html paints next time, before any
 * script has loaded: the confirmed hero, for this account.
 */
function bootSnapshot(list: ReadingList, userId: string | null, books: Map<string, CatalogueBook>): LabLibraryBootSnapshot {
  const hero = list.readingNow[0] ?? null
  const book = hero ? books.get(hero.bookId) : undefined
  const cover = hero ? coverFor(book, hero.bookId) : null
  const row: LabLibraryBootCard[] = list.readingNow.slice(1, 1 + LAB_LIBRARY_BOOT_ROW_MAX).map(item => {
    const itemBook = books.get(item.bookId)
    const itemCover = coverFor(itemBook, item.bookId)
    const src = safeCoverSource(itemCover?.src)
    return { bookId: item.bookId, title: bookTitle(itemBook, item.bookId), coverSrc: src, coverSrcSet: src && itemCover?.srcSet ? itemCover.srcSet : null }
  })
  return {
    row,
    v: 1,
    at: Date.now(),
    userId,
    readingNow: list.readingNow.length,
    finished: list.finished.length,
    hero: hero ? {
      bookId: hero.bookId,
      title: bookTitle(book, hero.bookId),
      chapterLabel: hero.target.chapterLabel,
      headline: heroHeadline(hero),
      coverSrc: safeCoverSource(cover?.src),
      coverSrcSet: safeCoverSource(cover?.src) && cover?.srcSet ? cover.srcSet : null,
      note: progressNote(hero),
    } : null,
  }
}

/** Renders never overlap; a request during a render runs once more afterwards. */
function render(): Promise<void> {
  if (renderQueued) return renderChain
  renderQueued = true
  renderChain = renderChain.then(() => {
    renderQueued = false
    return performRender()
  }).catch(() => {})
  return renderChain
}

function defaultEditionKey(bookId: string): string | null {
  const editions = (catalogue?.get(bookId)?.editions ?? []).filter(edition => edition.language !== 'da' && edition.availability?.chapterText !== false)
  return editions.find(edition => edition.style === 'original' && edition.language === 'en')?.key
    ?? editions.find(edition => edition.style === 'modern' && edition.language === 'en')?.key
    ?? editions[0]?.key
    ?? null
}

/** Open the reader at a resolved target through the existing handoff, in the edition the place was read in. */
function openAt(target: ContinueTarget): void {
  const api = preReader()
  const editionKey = target.editionKey ?? defaultEditionKey(target.bookId)
  const intent = editionKey ? api?.createHandoff?.({
    bookId: target.bookId,
    primaryEditionKey: editionKey,
    savedPlace: { bookId: target.bookId, chapterNumber: target.chapterNumber, page: target.pageIndex, paragraphIndex: target.paragraphIndex, wordIndex: target.wordIndex },
  }) : null
  if (intent) {
    try { sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { /* private mode */ }
    // Where this visit to the reader started, so the library it comes back to
    // knows not to recap the book the reader has just been looking at.
    writeReaderOrigin(sessionStore(), target.bookId, Date.now())
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    window.location.assign(`/reader${readerPreviewSearch(window.location.search)}`)
    return
  }
  // The place's edition is not offered by the library (e.g. a Danish
  // edition): open the book in its default edition; the reader restores its
  // own saved place. The book page hands off from there and records the
  // origin itself (lab/catalogue-runtime.js).
  void api?.openBook?.(target.bookId)
}

/**
 * Take a book off the Reading-now list. One timestamp through the same
 * versioned record the position pins ride in (`tinct-lab-position`, merged
 * locally and PUT to /api/lab-position), so the list agrees on every device.
 * Nothing is deleted here, and nothing else is touched.
 */
async function hideFromReadingNow(bookId: string): Promise<void> {
  if (!bookId) return
  const auth = await readAuth()
  try {
    const local = readLabPositionLocal(LIBRARY_POSITION_DEVICE_ID)
    const next = withHiddenFromReadingNow(local, bookId, Date.now())
    if (next === local) return
    const stored = writeLabPositionLocal(next)
    if (auth.token && isOnline()) void putLabPositionCloud(auth.token, stored).catch(() => {})
  } catch {
    // Storage blocked: the list is what the store says, so there is nothing
    // to hide and nothing to report.
    return
  }
  // The hero falls through to the next book by itself: the list is rebuilt
  // from the store, and the focus starts again at its first card.
  await render()
}

function continueReading(bookId?: string): void {
  if (positionsResolving || (lastList.readingNow.length === 0 && (renderQueued || lastRendered === null))) {
    // A local preview can be stale. Wait for the account position verdict.
    pendingContinue = bookId ?? ''
    return
  }
  const row = bookId ? lastList.readingNow.find(candidate => candidate.bookId === bookId) : lastList.readingNow[0]
  if (row) openAt(row.target)
}

section?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const summary = target.closest<HTMLElement>('.lib-recap-summary')
  if (summary) {
    event.preventDefault()
    toggleSummary(summary)
    return
  }
  const continueButton = target.closest<HTMLElement>('[data-recap-continue]')
  if (continueButton) {
    event.preventDefault()
    continueReading(nowFocusChosen ? continueButton.dataset.recapContinue : undefined)
    return
  }
  const remove = target.closest<HTMLElement>('[data-now-remove]')
  if (remove?.dataset.nowRemove) {
    event.preventDefault()
    void hideFromReadingNow(remove.dataset.nowRemove)
    return
  }
  const row = target.closest<HTMLElement>('[data-recap-open]')
  if (row) {
    event.preventDefault()
    // A card that sits back comes to the middle first; the card already in
    // the middle opens the book where it was left.
    const index = Number(row.closest<HTMLElement>('[data-now-index]')?.dataset.nowIndex)
    if (Number.isInteger(index) && index !== nowFocus) {
      setNowFocus(index, true)
      return
    }
    continueReading(row.dataset.recapOpen)
    return
  }
  const finished = target.closest<HTMLElement>('[data-finished-book]')
  if (finished?.dataset.finishedBook) {
    event.preventDefault()
    void preReader()?.openBook?.(finished.dataset.finishedBook)
  }
})

window.addEventListener('resize', refitNowShelfOnResize)
window.addEventListener('tinct:lab-auth-state', () => { void render() })
window.addEventListener('tinct:lab-catalogue-ready', () => { void render() })
window.addEventListener('pageshow', () => { void render() })
// A tab can stay open while another device adds books or moves the position.
// Focus/visibility are separate browser events; coalesce the pair.
let returnRefreshTimer: ReturnType<typeof setTimeout> | null = null
const refreshOnReturn = () => {
  if (document.visibilityState === 'hidden' || returnRefreshTimer !== null) return
  returnRefreshTimer = setTimeout(() => {
    returnRefreshTimer = null
    void render()
  }, 0)
}
window.addEventListener('focus', refreshOnReturn)
document.addEventListener('visibilitychange', refreshOnReturn)
window.addEventListener('online', () => { void render() })
window.addEventListener('offline', () => { void render() })

;(window as Window & { __tinctLabReadingMemory?: unknown }).__tinctLabReadingMemory = {
  render: () => render(),
  lastCard: () => lastRendered?.card ?? null,
  lastResult: () => lastRendered,
  lastList: () => lastList,
  lastRows: () => lastList.readingNow.slice(1),
  clear: async () => {
    const auth = await readAuth()
    clearDeviceReadingMemory()
    if (auth.userId) await clearCloudReadingMemory(auth.userId)
    await render()
  },
}

void render()
