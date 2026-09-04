/**
 * "What you read last" card for the dark /lab library.
 *
 * Reads durable reading sessions (device-only when signed out; device +
 * versioned cloud copy when signed in), resolves the saved anchors against
 * the exact edition chapter text, and renders a truthful recap: the real
 * location, an exact excerpt of the read range, and stored timestamps only.
 * A summary is opt-in (button) and only for signed-in readers.
 */
import { supabase } from './services/supabase'
import { createSupabaseReadingMemoryCloud, clearCloudReadingMemory } from './readingMemory/cloud'
import { loadChapterText } from './readingMemory/chapterText'
import { clearDeviceReadingMemory, deviceReadingMemoryQueue, readDeviceReadingMemory, writeDeviceReadingMemory } from './readingMemory/deviceStore'
import { drainReadingMemoryQueue } from './readingMemory/queue'
import { buildRecapCard, type RecapSummary } from './readingMemory/recap'
import { latestReadingSession, mergeReadingMemory } from './readingMemory/sessions'
import { requestRecapSummary } from './readingMemory/summary'
import type { RecapCard, RecapSource, ReadingMemoryState, ReadingSession } from './readingMemory/types'

const SUMMARY_CACHE_KEY = 'tinct:reading-memory:summaries'

interface CatalogueBook {
  id: string
  title: string
  author: string
  editions: Array<{ key: string; label: string }>
}

interface RenderedRecap {
  card: RecapCard
  session: ReadingSession
  paragraphs: string[] | null
  signedIn: boolean
}

const root = document.querySelector<HTMLElement>('#tinct-onboarding-worlds-v5')
const section = root?.querySelector<HTMLElement>('[data-reading-memory-recap]') ?? null

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character] as string)

let catalogue: Map<string, CatalogueBook> | null = null
let lastRendered: RenderedRecap | null = null
let renderToken = 0

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

async function readAuth(): Promise<{ userId: string | null; token: string | null }> {
  if (!supabase) return { userId: null, token: null }
  try {
    const { data } = await supabase.auth.getSession()
    return { userId: data.session?.user?.id ?? null, token: data.session?.access_token ?? null }
  } catch {
    return { userId: null, token: null }
  }
}

function readSummaryCache(): Record<string, RecapSummary> {
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) as Record<string, RecapSummary> : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSummaryCache(cache: Record<string, RecapSummary>): void {
  try { localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache)) } catch { /* ignore */ }
}

function summaryKey(session: ReadingSession): string {
  return `${session.id}:${session.seq}`
}

/** Pick the latest session across device and cloud and say where it came from. */
function pickLatest(device: ReadingMemoryState, cloud: ReadingMemoryState | null): { session: ReadingSession; source: RecapSource } | null {
  const merged = cloud ? mergeReadingMemory(device, cloud) : device
  const session = latestReadingSession(merged)
  if (!session) return null
  const fromCloud = cloud?.sessions[session.id]
  const source: RecapSource = fromCloud && fromCloud.seq >= session.seq ? 'cloud' : 'device'
  return { session, source }
}

function bookLabel(book: CatalogueBook | undefined, bookId: string): { title: string; author: string } {
  if (book) return { title: book.title, author: book.author }
  if (bookId === 'bible') return { title: 'The Bible', author: 'Various' }
  return { title: bookId, author: '' }
}

function editionLabel(book: CatalogueBook | undefined, editionKey: string): string {
  return book?.editions.find(edition => edition.key === editionKey)?.label || editionKey
}

function renderCard(rendered: RenderedRecap, extra: { summarizing?: boolean; summaryError?: string } = {}): void {
  if (!section) return
  const { card, session, signedIn } = rendered
  const books = catalogue ?? new Map<string, CatalogueBook>()
  const book = books.get(card.bookId)
  const label = bookLabel(book, card.bookId)
  const sourceLine = signedIn
    ? (card.provenance.source === 'cloud' ? 'Synced to your account' : 'Saved on this device · syncing to your account')
    : 'Saved on this device only · sign in to keep it'
  const body = card.bodyKind === 'summary'
    ? `<p class="tov5-recap-summary" data-testid="lab-recap-summary">${escapeHtml(card.body)}</p>`
    : card.bodyKind === 'excerpt'
      ? `<blockquote class="tov5-recap-excerpt" data-testid="lab-recap-excerpt">“${escapeHtml(card.body)}”</blockquote>`
      : `<p class="tov5-recap-missing" data-testid="lab-recap-missing">The exact passage could not be loaded right now.</p>`
  const provenance = card.bodyKind === 'summary'
    ? `Summary of the exact passage you read · ${escapeHtml(card.provenance.model ?? '')}`
    : card.bodyKind === 'excerpt'
      ? `Exact excerpt · ${escapeHtml(editionLabel(book, card.editionKey))}`
      : `Location from your saved reading place · ${escapeHtml(editionLabel(book, card.editionKey))}`
  const canSummarize = signedIn && rendered.paragraphs !== null && card.bodyKind === 'excerpt' && !extra.summarizing
  section.hidden = false
  section.querySelector('[data-recap-source]')!.textContent = sourceLine
  section.querySelector('[data-recap-body]')!.innerHTML = `
    <article class="tov5-recap-card" data-testid="lab-recap-card" data-book="${escapeHtml(card.bookId)}" data-session-state="${escapeHtml(session.state)}" data-completed="${card.completed ? 'true' : 'false'}" data-body-kind="${escapeHtml(card.bodyKind)}" data-source="${escapeHtml(card.provenance.source)}">
      <small>${escapeHtml(label.author)}${label.author ? ' · ' : ''}${escapeHtml(label.title)}</small>
      <strong data-testid="lab-recap-headline">${escapeHtml(card.headline)}</strong>
      <em data-testid="lab-recap-location">${escapeHtml(card.location)}</em>
      ${body}
      ${card.timeline.length ? `<p class="tov5-recap-times" data-testid="lab-recap-timeline">${card.timeline.map(line => escapeHtml(line)).join(' · ')}</p>` : ''}
      ${extra.summaryError ? `<p class="tov5-recap-note">${escapeHtml(extra.summaryError)}</p>` : ''}
      <div class="tov5-recap-actions">
        <button type="button" data-recap-continue="${escapeHtml(card.bookId)}">${card.completed ? 'Open the book' : 'Continue reading'} →</button>
        ${canSummarize ? '<button type="button" class="is-secondary" data-recap-summarize>Summarize this passage</button>' : ''}
        ${extra.summarizing ? '<span class="tov5-recap-note">Summarizing…</span>' : ''}
      </div>
      <p class="tov5-recap-provenance">${provenance}</p>
    </article>`
}

async function render(): Promise<void> {
  if (!section) return
  const token = ++renderToken
  const auth = await readAuth()
  const device = readDeviceReadingMemory()
  let cloudState: ReadingMemoryState | null = null
  if (auth.userId) {
    const cloud = createSupabaseReadingMemoryCloud(auth.userId)
    if (cloud) {
      try {
        const drained = await drainReadingMemoryQueue(deviceReadingMemoryQueue(), cloud)
        cloudState = drained.state ?? (await cloud.read())?.state ?? null
        if (cloudState) writeDeviceReadingMemory(mergeReadingMemory(device, cloudState))
      } catch {
        cloudState = null
      }
    }
  }
  if (token !== renderToken) return
  const picked = pickLatest(device, cloudState)
  if (!picked) {
    section.hidden = true
    lastRendered = null
    return
  }
  const [books, chapter] = await Promise.all([
    loadCatalogue(),
    loadChapterText({
      bookId: picked.session.anchor.bookId,
      editionKey: picked.session.anchor.editionKey,
      chapterNumber: picked.session.anchor.chapterNumber,
      version: buildVersion(),
    }),
  ])
  if (token !== renderToken) return
  const summary = readSummaryCache()[summaryKey(picked.session)] ?? null
  const card = buildRecapCard({
    session: picked.session,
    source: picked.source,
    paragraphs: chapter?.paragraphs ?? null,
    summary,
  })
  lastRendered = { card, session: picked.session, paragraphs: chapter?.paragraphs ?? null, signedIn: Boolean(auth.userId) }
  void books
  renderCard(lastRendered)
  window.dispatchEvent(new CustomEvent('tinct:lab-reading-memory-rendered', { detail: card }))
}

async function summarize(): Promise<void> {
  const current = lastRendered
  const paragraphs = current?.paragraphs
  if (!current || !paragraphs) return
  renderCard(current, { summarizing: true })
  const auth = await readAuth()
  const books = await loadCatalogue()
  const summary = await requestRecapSummary({
    token: auth.token,
    session: current.session,
    paragraphs,
    bookTitle: books.get(current.session.anchor.bookId)?.title,
  })
  if (lastRendered !== current) return
  if (!summary) {
    renderCard(current, { summaryError: 'A summary is not available right now; the exact excerpt stays.' })
    return
  }
  const cache = readSummaryCache()
  cache[summaryKey(current.session)] = summary
  writeSummaryCache(cache)
  const card = buildRecapCard({ session: current.session, source: current.card.provenance.source, paragraphs: current.paragraphs, summary })
  lastRendered = { ...current, card }
  renderCard(lastRendered)
}

function continueReading(bookId: string): void {
  const rail = root?.querySelector<HTMLButtonElement>(`[data-library-continue-rail] [data-continue-book="${CSS.escape(bookId)}"]`)
  if (rail) {
    rail.click()
    return
  }
  const preReader = (window as Window & { __tinctLabPreReader?: { selectBook?: (id: string, view: string, history: boolean) => Promise<void> } }).__tinctLabPreReader
  void preReader?.selectBook?.(bookId, 'book-detail', true)
}

section?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const continueButton = target.closest<HTMLButtonElement>('[data-recap-continue]')
  if (continueButton) {
    event.preventDefault()
    continueReading(continueButton.dataset.recapContinue || '')
    return
  }
  if (target.closest('[data-recap-summarize]')) {
    event.preventDefault()
    void summarize()
  }
})

window.addEventListener('tinct:lab-auth-state', () => { void render() })
window.addEventListener('tinct:lab-catalogue-ready', () => { void render() })
window.addEventListener('pageshow', () => { void render() })

;(window as Window & { __tinctLabReadingMemory?: unknown }).__tinctLabReadingMemory = {
  render: () => render(),
  lastCard: () => lastRendered?.card ?? null,
  clear: async () => {
    const auth = await readAuth()
    clearDeviceReadingMemory()
    if (auth.userId) await clearCloudReadingMemory(auth.userId)
    await render()
  },
}

void render()
