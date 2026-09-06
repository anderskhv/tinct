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
 *    Continue resumes in, the headline is the stored automatic summary or
 *    the exact excerpt when they describe that chapter (else the truthful
 *    location line), the book is named under it, one cream "Continue
 *    reading" pill. The rest are quiet rows: cover, title, "Last time ·
 *    <chapter>", the stored summary when it describes that chapter.
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
import { createSupabaseReadingMemoryCloud, clearCloudReadingMemory } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { clearDeviceReadingMemory, readDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, type RecapAuth, type RecapLoadResult } from './readingMemory/recapLoad'
import { requestRecapSummary } from './readingMemory/summary'
import type { ReadingAnchor } from './readingMemory/types'
import { mergeLabPositionStatesByTime, type LabPositionState } from './lab/labPosition'
import { fetchLabPositionCloud, readLabPositionLocal } from './lab/labPositionStore'
import {
  heroHeadline,
  inProgressLabel,
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
  readingStructure?: { chapters?: Array<{ number: number; title: string }> } | null
}

interface CoverSource {
  src: string
  srcSet: string
}

interface LabPreReaderApi {
  createHandoff?: (selection: {
    bookId: string
    primaryEditionKey: string
    savedPlace?: { bookId: string; chapterNumber: number; page?: number; paragraphIndex?: number }
  }) => unknown | null
  openBook?: (bookId: string) => Promise<boolean>
  coverFor?: (bookId: string) => CoverSource | null
  bookProgress?: (bookId: string, place: { chapterNumber: number; page?: number; totalPages?: number | null; paragraphIndex?: number }) => number | null
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

function preReader(): LabPreReaderApi | undefined {
  return (window as Window & { __tinctLabPreReader?: LabPreReaderApi }).__tinctLabPreReader
}

function buildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

async function loadCatalogue(): Promise<Map<string, CatalogueBook>> {
  if (catalogue) return catalogue
  try {
    const response = await fetch('/lab/catalogue.json?v=20260905-1')
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
  if (!auth.token || !isOnline()) return local
  const cloud = await fetchLabPositionCloud(auth.token).catch(() => null)
  return cloud ? mergeLabPositionStatesByTime(local, cloud) : local
}

/** Books the app marked finished (`tinct:book-completed:<id>`). */
function completedBookIds(): Set<string> {
  const ids = new Set<string>()
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key && key.startsWith(BOOK_COMPLETED_PREFIX) && key.length > BOOK_COMPLETED_PREFIX.length) ids.add(key.slice(BOOK_COMPLETED_PREFIX.length))
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
    chapters: (book.readingStructure?.chapters ?? []).map(chapter => ({ number: chapter.number, title: chapter.title })),
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

function progressNote(target: ContinueTarget, session: ReadingListRow['session']): string | null {
  const percent = preReader()?.bookProgress?.(target.bookId, {
    chapterNumber: target.chapterNumber,
    page: target.pageIndex,
    totalPages: session && session.anchor.chapterNumber === target.chapterNumber ? session.anchor.totalPages : null,
    paragraphIndex: target.paragraphIndex,
  })
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return null
  if (percent > 0 && percent < 1) return '<1% read'
  return `${Math.round(percent)}% read`
}

function publishMode(mode: LibraryMode): void {
  ;(window as Window & { __tinctLabLibraryMode?: LibraryMode }).__tinctLabLibraryMode = mode
  window.dispatchEvent(new CustomEvent('tinct:lab-library-mode', { detail: { mode } }))
}

const sectionHead = (label: string, count: number, attr: string) => `<header class="lib-index-head lib-sec-head" ${attr}><span class="lib-eyebrow is-dim">${escapeHtml(label)}</span><span class="lib-cnt">${count}</span></header>`

function heroMarkup(hero: ReadingListRow, rendered: RecapLoadResult | null, books: Map<string, CatalogueBook>): string {
  const book = books.get(hero.bookId)
  const card = rendered && hero.session && rendered.card.provenance.sessionId === hero.session.id ? rendered.card : null
  const note = progressNote(hero.target, hero.session)
  return `<div class="lib-recap-hero" data-recap-hero="${escapeHtml(hero.bookId)}">
      <div class="lib-recap-head">
        <p class="lib-eyebrow" data-testid="lab-recap-eyebrow">${escapeHtml(recapEyebrow(hero.target.chapterLabel))}</p>
        <h1 class="lib-h1" data-testid="lab-recap-headline">${escapeHtml(heroHeadline(hero, card))}</h1>
      </div>
      <div class="lib-recap-cover">${coverMarkup(book, hero.bookId)}</div>
      <div class="lib-recap-meta">
        <p class="lib-lede" data-testid="lab-recap-book">${escapeHtml(bookTitle(book, hero.bookId))}</p>
        <div class="lib-recap-cta"><button type="button" class="lib-cta" data-recap-continue="${escapeHtml(hero.bookId)}">Continue reading</button>${note ? `<span class="lib-cta-note" data-testid="lab-recap-progress">${escapeHtml(note)}</span>` : ''}</div>
      </div>
    </div>`
}

function rowMarkup(row: ReadingListRow, books: Map<string, CatalogueBook>): string {
  const book = books.get(row.bookId)
  const title = bookTitle(book, row.bookId)
  return `<button type="button" class="lib-recap-row" data-recap-open="${escapeHtml(row.bookId)}" data-continue-source="${row.target.source}" data-continue-chapter="${row.target.chapterNumber}" aria-label="${escapeHtml(`Continue ${title} from ${row.target.chapterLabel}`)}">${coverMarkup(book, row.bookId)}<span class="lib-recap-row-copy"><span class="lib-recap-row-t">${escapeHtml(title)}</span><span class="lib-eyebrow is-dim">${escapeHtml(inProgressLabel(row))}</span>${row.recap ? `<span class="lib-recap-row-recap">${escapeHtml(row.recap)}</span>` : ''}</span><svg class="lib-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>`
}

function finishedMarkup(row: ReadingList['finished'][number], books: Map<string, CatalogueBook>): string {
  const book = books.get(row.bookId)
  const title = bookTitle(book, row.bookId)
  return `<button type="button" class="lib-recap-row is-finished" data-finished-book="${escapeHtml(row.bookId)}" aria-label="${escapeHtml(`${title} — finished. Open again`)}">${coverMarkup(book, row.bookId)}<span class="lib-recap-row-copy"><span class="lib-recap-row-t">${escapeHtml(title)}</span><span class="lib-eyebrow is-dim">Finished</span></span><svg class="lib-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></button>`
}

function renderSections(list: ReadingList, rendered: RecapLoadResult | null): void {
  if (!section) return
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const hero = list.readingNow[0] ?? null
  const heroCard = hero && rendered && hero.session && rendered.card.provenance.sessionId === hero.session.id ? rendered.card : null
  section.hidden = false
  section.dataset.testid = 'lab-recap-card'
  section.dataset.book = hero?.bookId ?? ''
  section.dataset.sessionState = hero?.session?.state ?? 'none'
  section.dataset.completed = 'false'
  section.dataset.bodyKind = heroCard ? heroCard.bodyKind : hero?.recap ? 'summary' : 'location-only'
  section.dataset.syncState = heroCard ? heroCard.syncState : (rendered?.signedIn ? 'pending' : 'device-only')
  section.dataset.summaryStatus = heroCard ? rendered!.summaryStatus : 'unavailable'
  section.dataset.continueSource = hero?.target.source ?? ''
  section.dataset.continueChapter = hero ? String(hero.target.chapterNumber) : ''
  section.dataset.readingNow = String(list.readingNow.length)
  section.dataset.finished = String(list.finished.length)
  const readingNow = hero
    ? `<section class="lib-reading-now" data-reading-now-section aria-label="Reading now">${sectionHead('Reading now', list.readingNow.length, 'data-reading-now-head')}${heroMarkup(hero, rendered, books)}<div class="lib-recap-others" data-recap-others>${list.readingNow.slice(1).map(row => rowMarkup(row, books)).join('')}</div></section>`
    : ''
  const finished = list.finished.length
    ? `<section class="lib-finished" data-finished-section aria-label="Finished">${sectionHead('Finished', list.finished.length, 'data-finished-head')}<div class="lib-recap-others" data-finished-rows>${list.finished.map(row => finishedMarkup(row, books)).join('')}</div></section>`
    : ''
  section.innerHTML = readingNow + finished
}

async function performRender(): Promise<void> {
  if (!section) return
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
    }),
  ])
  if (rendered?.summaryAttempted) summaryBudgetSpent = true
  lastRendered = rendered
  // loadRecap has already merged the cloud copy into the device mirror; the
  // viewer sees no-account sessions and their own account's sessions. The
  // position store is read the same way (device, plus cloud when signed in).
  const auth = await readAuth()
  const positions = await loadPositions(auth)
  const books = catalogue ?? new Map<string, CatalogueBook>()
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
    publishMode(mode)
    return
  }
  renderSections(list, rendered)
  publishMode(mode)
  window.dispatchEvent(new CustomEvent('tinct:lab-reading-memory-rendered', { detail: { card: rendered?.card ?? null, readingNow: list.readingNow.length, finished: list.finished.length } }))
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
    savedPlace: { bookId: target.bookId, chapterNumber: target.chapterNumber, page: target.pageIndex, paragraphIndex: target.paragraphIndex },
  }) : null
  if (intent) {
    try { sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    window.location.assign('/lab/reader')
    return
  }
  // The place's edition is not offered by the library (e.g. a Danish
  // edition): open the book in its default edition; the reader restores its
  // own saved place.
  void api?.openBook?.(target.bookId)
}

function continueReading(bookId?: string): void {
  const row = bookId ? lastList.readingNow.find(candidate => candidate.bookId === bookId) : lastList.readingNow[0]
  if (row) openAt(row.target)
}

section?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const continueButton = target.closest<HTMLElement>('[data-recap-continue]')
  if (continueButton) {
    event.preventDefault()
    continueReading(continueButton.dataset.recapContinue)
    return
  }
  const row = target.closest<HTMLElement>('[data-recap-open]')
  if (row) {
    event.preventDefault()
    continueReading(row.dataset.recapOpen)
    return
  }
  const finished = target.closest<HTMLElement>('[data-finished-book]')
  if (finished?.dataset.finishedBook) {
    event.preventDefault()
    void preReader()?.openBook?.(finished.dataset.finishedBook)
  }
})

window.addEventListener('tinct:lab-auth-state', () => { void render() })
window.addEventListener('tinct:lab-catalogue-ready', () => { void render() })
window.addEventListener('pageshow', () => { void render() })
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
