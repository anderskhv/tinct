/**
 * "What you read last" card for the dark /lab library.
 *
 * Reads durable reading sessions (device-only when signed out; device mirror
 * + versioned cloud copy when signed in), resolves the saved anchors against
 * the exact edition chapter text, and renders a truthful recap: the real
 * location, an exact excerpt of the read range or the stored automatic
 * summary, and stored timestamps only.
 *
 * Summaries are automatic, never a button: a session closed by the
 * 30-minute rule gets ONE generation attempt per library load for signed-in
 * readers, stored inside the session record so it syncs with the session
 * and is never regenerated elsewhere. Signed-out readers get the exact
 * excerpt only. Offline, a signed-in reader stays signed in: the recap reads
 * the local mirror, writes wait in the queue and drain on `online`.
 */
import { supabase } from './services/supabase'
import { createSupabaseReadingMemoryCloud, clearCloudReadingMemory } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { clearDeviceReadingMemory } from './readingMemory/deviceStore'
import { loadRecap, recapSyncCopy, type RecapAuth, type RecapLoadResult } from './readingMemory/recapLoad'
import { formatStoredTimestamp } from './readingMemory/recap'
import { requestRecapSummary, SUMMARY_MAX_ATTEMPTS } from './readingMemory/summary'
import type { ReadingAnchor } from './readingMemory/types'

interface CatalogueBook {
  id: string
  title: string
  author: string
  editions: Array<{ key: string; label: string }>
}

interface LabPreReaderApi {
  createHandoff?: (selection: {
    bookId: string
    primaryEditionKey: string
    savedPlace?: { bookId: string; chapterNumber: number; page?: number; paragraphIndex?: number }
  }) => unknown | null
  selectBook?: (id: string, view: string, history: boolean) => Promise<void>
}

const READER_HANDOFF_KEY = 'tinct:lab-reader-handoff'

const root = document.querySelector<HTMLElement>('#tinct-onboarding-worlds-v5')
const section = root?.querySelector<HTMLElement>('[data-reading-memory-recap]') ?? null

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] as string)

let catalogue: Map<string, CatalogueBook> | null = null
let lastRendered: RecapLoadResult | null = null
/** One automatic summary attempt per library load, whatever re-renders happen. */
let summaryBudgetSpent = false
let renderChain: Promise<void> = Promise.resolve()
let renderQueued = false

function buildVersion(): string {
  return typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'dev'
}

async function loadCatalogue(): Promise<Map<string, CatalogueBook>> {
  if (catalogue) return catalogue
  try {
    const response = await fetch('/lab/catalogue.json?v=20260903-2')
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

function bookLabel(book: CatalogueBook | undefined, bookId: string): { title: string; author: string } {
  if (book) return { title: book.title, author: book.author }
  if (bookId === 'bible') return { title: 'The Bible', author: 'Various' }
  return { title: bookId, author: '' }
}

function editionLabel(book: CatalogueBook | undefined, editionKey: string): string {
  return book?.editions.find(edition => edition.key === editionKey)?.label || editionKey
}

function summaryNote(rendered: RecapLoadResult): { text: string; retry: boolean } | null {
  if (!rendered.signedIn || rendered.card.bodyKind === 'summary') return null
  const error = rendered.session.summaryError ?? null
  if (!error) return null
  const exhausted = error.attempts >= SUMMARY_MAX_ATTEMPTS
  return {
    text: exhausted
      ? 'A summary could not be written for this passage; the exact excerpt stays.'
      : 'A summary is not available right now; the exact excerpt stays.',
    retry: !exhausted && rendered.online && rendered.paragraphs !== null,
  }
}

function renderCard(rendered: RecapLoadResult, extra: { busy?: boolean } = {}): void {
  if (!section) return
  const { card, session } = rendered
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const book = books.get(card.bookId)
  const label = bookLabel(book, card.bookId)
  const body = card.bodyKind === 'summary'
    ? `<p class="tov5-recap-summary" data-testid="lab-recap-summary">${escapeHtml(card.body)}</p>`
    : card.bodyKind === 'excerpt'
      ? `<blockquote class="tov5-recap-excerpt" data-testid="lab-recap-excerpt">“${escapeHtml(card.body)}”</blockquote>`
      : `<p class="tov5-recap-missing" data-testid="lab-recap-missing">The exact passage could not be loaded right now.</p>`
  const generated = card.provenance.generatedAt ? formatStoredTimestamp(card.provenance.generatedAt) : null
  const provenance = card.bodyKind === 'summary'
    ? `Summary of the exact passage you read · ${escapeHtml(card.provenance.model ?? '')}${generated ? ` · written ${escapeHtml(generated)}` : ''}`
    : card.bodyKind === 'excerpt'
      ? `Exact excerpt · ${escapeHtml(editionLabel(book, card.editionKey))}`
      : `Location from your saved reading place · ${escapeHtml(editionLabel(book, card.editionKey))}`
  const note = summaryNote(rendered)
  section.hidden = false
  section.querySelector('[data-recap-source]')!.textContent = recapSyncCopy(rendered.syncState, rendered.online)
  section.querySelector('[data-recap-body]')!.innerHTML = `
    <article class="tov5-recap-card" data-testid="lab-recap-card" data-book="${escapeHtml(card.bookId)}" data-session-state="${escapeHtml(session.state)}" data-completed="${card.completed ? 'true' : 'false'}" data-body-kind="${escapeHtml(card.bodyKind)}" data-source="${escapeHtml(card.provenance.source)}" data-sync-state="${escapeHtml(card.syncState)}" data-summary-status="${escapeHtml(rendered.summaryStatus)}">
      <small>${escapeHtml(label.author)}${label.author ? ' · ' : ''}${escapeHtml(label.title)}</small>
      <strong data-testid="lab-recap-headline">${escapeHtml(card.headline)}</strong>
      <em data-testid="lab-recap-location">${escapeHtml(card.location)}</em>
      ${body}
      ${card.timeline.length ? `<p class="tov5-recap-times" data-testid="lab-recap-timeline">${card.timeline.map(line => escapeHtml(line)).join(' · ')}</p>` : ''}
      ${note ? `<p class="tov5-recap-note" data-testid="lab-recap-summary-note">${escapeHtml(note.text)}</p>` : ''}
      <div class="tov5-recap-actions">
        <button type="button" data-recap-continue="${escapeHtml(card.bookId)}">${card.completed ? 'Open the book' : 'Continue reading'} →</button>
        ${note?.retry && !extra.busy ? '<button type="button" class="is-secondary" data-recap-summary-retry>Try again</button>' : ''}
        ${extra.busy ? '<span class="tov5-recap-note">Writing a summary…</span>' : ''}
      </div>
      <p class="tov5-recap-provenance" data-testid="lab-recap-provenance">${provenance}</p>
    </article>`
}

async function performRender(options: { manualSummary?: boolean } = {}): Promise<void> {
  if (!section) return
  const allowSummary = options.manualSummary === true || !summaryBudgetSpent
  const [books, rendered] = await Promise.all([
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
      allowSummary,
      manualSummary: options.manualSummary,
    }),
  ])
  void books
  if (rendered?.summaryAttempted) summaryBudgetSpent = true
  lastRendered = rendered
  if (!rendered) {
    section.hidden = true
    return
  }
  renderCard(rendered)
  window.dispatchEvent(new CustomEvent('tinct:lab-reading-memory-rendered', { detail: rendered.card }))
}

/** Renders never overlap; a request during a render runs once more afterwards. */
function render(options: { manualSummary?: boolean } = {}): Promise<void> {
  if (options.manualSummary) {
    renderChain = renderChain.then(() => performRender(options)).catch(() => {})
    return renderChain
  }
  if (renderQueued) return renderChain
  renderQueued = true
  renderChain = renderChain.then(() => {
    renderQueued = false
    return performRender()
  }).catch(() => {})
  return renderChain
}

function continueReading(): void {
  const current = lastRendered
  if (!current) return
  const preReader = (window as Window & { __tinctLabPreReader?: LabPreReaderApi }).__tinctLabPreReader
  const { resume } = current
  // Open the reader at the newest session's anchor through the existing
  // handoff, whatever the session's sync state.
  const intent = preReader?.createHandoff?.({
    bookId: resume.bookId,
    primaryEditionKey: resume.editionKey,
    savedPlace: { bookId: resume.bookId, chapterNumber: resume.chapterNumber, page: resume.pageIndex, paragraphIndex: resume.paragraphIndex },
  })
  if (intent) {
    try { sessionStorage.setItem(READER_HANDOFF_KEY, JSON.stringify(intent)) } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent('tinct:lab-reader-handoff', { detail: intent }))
    window.location.assign('/lab/reader')
    return
  }
  const rail = root?.querySelector<HTMLButtonElement>(`[data-library-continue-rail] [data-continue-book="${CSS.escape(resume.bookId)}"]`)
  if (rail) {
    rail.click()
    return
  }
  void preReader?.selectBook?.(resume.bookId, 'book-detail', true)
}

section?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  if (target.closest('[data-recap-continue]')) {
    event.preventDefault()
    continueReading()
    return
  }
  if (target.closest('[data-recap-summary-retry]')) {
    event.preventDefault()
    if (lastRendered) renderCard(lastRendered, { busy: true })
    void render({ manualSummary: true })
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
  clear: async () => {
    const auth = await readAuth()
    clearDeviceReadingMemory()
    if (auth.userId) await clearCloudReadingMemory(auth.userId)
    await render()
  },
}

void render()
