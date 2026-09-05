/**
 * Returning-reader hero for the locked /lab library.
 *
 * Reads durable reading sessions (device-only when signed out; device mirror
 * + versioned cloud copy when signed in), resolves the newest session's
 * anchor against the exact edition chapter text and renders it truthfully:
 * the eyebrow names the chapter the reader recorded, the headline is the
 * stored automatic summary or the exact excerpt, the book is named under
 * it, and one cream "Continue reading" pill resumes at the saved anchor.
 * Other books in progress follow as quiet rows with the same label.
 *
 * It also tells the library which mode it is in: a reader with at least one
 * session is a returning reader (uniform popular shelf under the recap); a
 * reader with none is new (selection shelf). No banners, no sync copy, no
 * sign-up nudges.
 *
 * Summaries stay automatic, never a button: a session closed by the
 * 30-minute rule gets ONE generation attempt per library load for signed-in
 * readers, stored inside the session record so it syncs with the session
 * and is never regenerated elsewhere. Signed-out readers get the exact
 * excerpt only. Offline, a signed-in reader stays signed in: the recap reads
 * the local mirror, writes wait in the queue and drain on `online`.
 */
import { supabase } from './services/supabase'
import { createSupabaseReadingMemoryCloud, clearCloudReadingMemory } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { clearDeviceReadingMemory, readDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, type RecapAuth, type RecapLoadResult } from './readingMemory/recapLoad'
import { requestRecapSummary } from './readingMemory/summary'
import type { ReadingAnchor } from './readingMemory/types'
import {
  inProgressLabel,
  libraryModeFor,
  otherBooksInProgress,
  recapEyebrow,
  recapHeadline,
  type InProgressRow,
  type LibraryMode,
} from './preReader/libraryRecap'

interface CatalogueBook {
  id: string
  title: string
  author: string
  art?: { src: string; srcSet: string } | null
  editions: Array<{ key: string; label: string }>
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
const IN_PROGRESS_ROWS_MAX = 4

const root = document.querySelector<HTMLElement>('#tinct-onboarding-worlds-v5')
const section = root?.querySelector<HTMLElement>('[data-reading-memory-recap]') ?? null

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] as string)

let catalogue: Map<string, CatalogueBook> | null = null
let lastRendered: RecapLoadResult | null = null
let lastRows: InProgressRow[] = []
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

function progressNote(rendered: RecapLoadResult): string | null {
  const { anchor } = rendered.session
  const percent = preReader()?.bookProgress?.(anchor.bookId, {
    chapterNumber: anchor.chapterNumber,
    page: Math.max(0, anchor.page - 1),
    totalPages: anchor.totalPages,
    paragraphIndex: anchor.paragraphIndex,
  })
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return null
  if (percent > 0 && percent < 1) return '<1% read'
  return `${Math.round(percent)}% read`
}

function publishMode(mode: LibraryMode): void {
  ;(window as Window & { __tinctLabLibraryMode?: LibraryMode }).__tinctLabLibraryMode = mode
  window.dispatchEvent(new CustomEvent('tinct:lab-library-mode', { detail: { mode } }))
}

function renderHero(rendered: RecapLoadResult, rows: InProgressRow[]): void {
  if (!section) return
  const { card, session } = rendered
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const book = books.get(card.bookId)
  const note = progressNote(rendered)
  section.hidden = false
  section.dataset.testid = 'lab-recap-card'
  section.dataset.book = card.bookId
  section.dataset.sessionState = session.state
  section.dataset.completed = card.completed ? 'true' : 'false'
  section.dataset.bodyKind = card.bodyKind
  section.dataset.syncState = card.syncState
  section.dataset.summaryStatus = rendered.summaryStatus
  section.innerHTML = `
    <div class="lib-recap-head">
      <p class="lib-eyebrow" data-testid="lab-recap-eyebrow">${escapeHtml(recapEyebrow(card))}</p>
      <h1 class="lib-h1" data-testid="lab-recap-headline">${escapeHtml(recapHeadline(card))}</h1>
    </div>
    <div class="lib-recap-cover">${coverMarkup(book, card.bookId)}</div>
    <div class="lib-recap-meta">
      <p class="lib-lede" data-testid="lab-recap-book">${escapeHtml(bookTitle(book, card.bookId))}</p>
      <div class="lib-recap-cta"><button type="button" class="lib-cta" data-recap-continue="${escapeHtml(card.bookId)}">Continue reading</button>${note ? `<span class="lib-cta-note" data-testid="lab-recap-progress">${escapeHtml(note)}</span>` : ''}</div>
    </div>
    <div class="lib-recap-others" data-recap-others>${rows.map(row => {
      const rowBook = books.get(row.bookId)
      return `<button type="button" class="lib-recap-row" data-recap-open="${escapeHtml(row.bookId)}" aria-label="${escapeHtml(`Continue ${bookTitle(rowBook, row.bookId)} from ${row.chapterLabel}`)}">${coverMarkup(rowBook, row.bookId)}<span class="lib-recap-row-copy"><span class="lib-recap-row-t">${escapeHtml(bookTitle(rowBook, row.bookId))}</span><span class="lib-eyebrow is-dim">${escapeHtml(inProgressLabel(row))}</span></span><svg class="lib-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>`
    }).join('')}</div>`
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
  const mode = libraryModeFor(rendered)
  if (!rendered) {
    lastRows = []
    section.hidden = true
    section.innerHTML = ''
    publishMode(mode)
    return
  }
  // loadRecap has already merged the cloud copy into the device mirror;
  // the viewer sees no-account sessions and their own account's sessions.
  const viewer = rendered.signedIn ? (await readAuth()).userId : null
  lastRows = otherBooksInProgress(readDeviceReadingMemory(), viewer, rendered.card.bookId, IN_PROGRESS_ROWS_MAX)
  renderHero(rendered, lastRows)
  publishMode(mode)
  window.dispatchEvent(new CustomEvent('tinct:lab-reading-memory-rendered', { detail: rendered.card }))
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

/** Open the reader at a recorded anchor through the existing handoff, in the edition the session was read in. */
function openAt(target: { bookId: string; editionKey: string; chapterNumber: number; pageIndex: number; paragraphIndex: number }): void {
  const api = preReader()
  const intent = api?.createHandoff?.({
    bookId: target.bookId,
    primaryEditionKey: target.editionKey,
    savedPlace: { bookId: target.bookId, chapterNumber: target.chapterNumber, page: target.pageIndex, paragraphIndex: target.paragraphIndex },
  })
  if (intent) {
    try { sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    window.location.assign('/lab/reader')
    return
  }
  // The session's edition is not offered by the library (e.g. a Danish
  // edition): open the book in its default edition; the reader restores its
  // own saved place.
  void api?.openBook?.(target.bookId)
}

function continueReading(): void {
  if (!lastRendered) return
  openAt(lastRendered.resume)
}

section?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const continueButton = target.closest<HTMLElement>('[data-recap-continue]')
  if (continueButton) {
    event.preventDefault()
    continueReading()
    return
  }
  const row = target.closest<HTMLElement>('[data-recap-open]')
  if (row) {
    event.preventDefault()
    const item = lastRows.find(candidate => candidate.bookId === row.dataset.recapOpen)
    if (item) openAt(item)
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
  lastRows: () => lastRows,
  clear: async () => {
    const auth = await readAuth()
    clearDeviceReadingMemory()
    if (auth.userId) await clearCloudReadingMemory(auth.userId)
    await render()
  },
}

void render()
