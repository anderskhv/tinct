/**
 * The library's "Add to Tinct" and "Your own books" engine (library_2 loads it
 * as /lab/library-add.js, only when a reader taps Add or opens My shelf, and
 * only where public-books.js `addToTinctEnabled()` allows).
 *
 * Add: the Worker downloads the work's EPUB from its library and hands it back;
 * this page converts it with the reader's own converter (lab/userBook/
 * epubEdition.ts, unchanged) and sends the chapters; the Worker checks them
 * against the EPUB and publishes the book for everyone (worker/routes/publicBooks.ts).
 *
 * Your own books: the files Add a book keeps on this device (IndexedDB
 * `tinct-addbook`, this account's records only) and in the account
 * (`/api/user-books`), listed for My shelf, with the places read on the
 * account's other devices (`/api/user-books/places`). Nothing is uploaded here.
 */
import { supabase } from './services/supabase'
import { readCachedSupabaseUser } from './lab/labLibraryBoot'
import type { OwnShelfBook } from './lab/userBook/ownShelf'
import { ownShelfWithAccount } from './lab/userBook/ownSync'
import { fetchModernStatus, markPendingPurchase, startModernCheckout, type ModernStatus } from './lab/labModernEditionApi'
import { publicChapters, type PublicChapterUpload } from './lab/userBook/publicChapters'

export type ImportFailure = 'signed_out' | 'premium_required' | 'daily_limit' | 'in_progress' | 'not_importable' | 'unreadable' | 'failed'
export type ImportResult =
  | { ok: true; bookId: string; entry: Record<string, unknown> & { id: string }; existed: boolean }
  | { ok: false; reason: ImportFailure }

async function token(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  } catch {
    return null
  }
}

const failureFor = (status: number, code: string | undefined): ImportFailure =>
  status === 401 ? 'signed_out'
    : status === 402 ? 'premium_required'
    : code === 'daily_limit' ? 'daily_limit'
      : code === 'in_progress' ? 'in_progress'
        // Too large even without its pictures (Gutenberg's no-images file is tried first): "cannot be added", never "try again".
        : code === 'not_importable' || code === 'not_found' || code === 'source_not_allowed' || code === 'source_too_large' || code === 'too_large' ? 'not_importable'
          // The library answered with a bot check instead of the book (ws-export's Anubis page).
          : code === 'not_epub' || code === 'edition_mismatch' || code === 'bad_edition' || code === 'source_blocked' ? 'unreadable'
            : 'failed'

/** Import one catalogue work (or find it already in Tinct). `onStage` reports progress for the button. */
export async function importWork(workId: string, options: { onStage?: (stage: 'download' | 'convert' | 'publish') => void; fetchImpl?: typeof fetch } = {}): Promise<ImportResult> {
  const fetchImpl = options.fetchImpl ?? fetch
  const auth = await token()
  if (!auth) return { ok: false, reason: 'signed_out' }
  const headers = { Authorization: `Bearer ${auth}` }
  try {
    options.onStage?.('download')
    const prepared = await fetchImpl('/api/public-books/import', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ workId }) })
    const step = await prepared.json().catch(() => ({})) as { status?: string; error?: string; bookId?: string; entry?: Record<string, unknown> & { id: string }; source?: string }
    if (!prepared.ok) return { ok: false, reason: failureFor(prepared.status, step.error) }
    if (step.status === 'exists' && step.entry && step.bookId) return { ok: true, bookId: step.bookId, entry: step.entry, existed: true }
    if (step.status !== 'convert' || !step.source || !step.bookId) return { ok: false, reason: 'failed' }
    const source = await fetchImpl(step.source, { headers })
    if (!source.ok) return { ok: false, reason: failureFor(source.status, undefined) }
    const bytes = new Uint8Array(await source.arrayBuffer())
    options.onStage?.('convert')
    let chapters: PublicChapterUpload[]
    try {
      const { epubToEdition } = await import('./lab/userBook/epubEdition')
      // Titles as the file writes them: the Worker checks them against the EPUB, then sets them in house style.
      // Text, verse and headings only: an added book shows no pictures (a picture's caption stays as text).
      chapters = publicChapters((await epubToEdition(bytes, { sourceTitles: true })).chapters)
    } catch {
      return { ok: false, reason: 'unreadable' }
    }
    options.onStage?.('publish')
    const committed = await fetchImpl(`/api/public-books/import/${encodeURIComponent(step.bookId)}/commit`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ chapters }) })
    const done = await committed.json().catch(() => ({})) as { error?: string; bookId?: string; entry?: Record<string, unknown> & { id: string } }
    if (!committed.ok || !done.entry || !done.bookId) return { ok: false, reason: failureFor(committed.status, done.error) }
    return { ok: true, bookId: done.bookId, entry: done.entry, existed: committed.status === 200 }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

/**
 * Whether this account may add books (Premium or its 30-day trial; the Worker's
 * hasPremiumAccess). False signed out; null when it cannot be told.
 */
export async function canAdd(fetchImpl: typeof fetch = fetch): Promise<boolean | null> {
  const auth = await token()
  if (!auth) return false
  try {
    const response = await fetchImpl('/api/public-books/import/access', { headers: { Authorization: `Bearer ${auth}` }, cache: 'no-store' })
    if (!response.ok) return response.status === 401 ? false : null
    const body = await response.json() as { canAdd?: unknown }
    return typeof body.canAdd === 'boolean' ? body.canAdd : null
  } catch {
    return null
  }
}

// ===== Modern English, asked right after an add (add-to-tinct.js modernOfferAfterAdd) =====

/** The book's Modern English edition: its state and offer, as the reader asks (labModernEditionApi). Null when it cannot be told. */
export function modernStatus(bookId: string, fetchImpl: typeof fetch = fetch): Promise<ModernStatus | null> {
  return token().then(auth => fetchModernStatus(bookId, fetchImpl, auth))
}

/**
 * The reader's own checkout for the edition (LabApp buyModernEdition): Stripe
 * Checkout for this book, anchored at `chapter`, and the pending-purchase mark
 * the reader reads on its return to switch to the edition. Resolves to the
 * Checkout URL; rejects when it cannot start (signed out, already held or paid).
 */
export async function buyModern(bookId: string, chapter: number, fetchImpl: typeof fetch = fetch): Promise<string> {
  const auth = await token()
  if (!auth) throw new Error('signed_out')
  const url = await startModernCheckout(bookId, chapter, auth, fetchImpl)
  markPendingPurchase(bookId)
  return url
}

// ===== Your own books =====

export interface OwnBook {
  key: string
  kind: 'pdf' | 'epub'
  title: string
  author: string
  /** The book's own cover, kept on this device (a data: URL); null without one or for an account copy not on it. */
  cover: string | null
  /** Last opened (or added) on this device or in the account. */
  at: number
  /** The reader has a saved place in it (on this device, or read on another device of the account): it is being read. */
  readingAt: number | null
  /** How far through it the reader is (0–100), when known. */
  percent: number | null
  href: string
}

const ownBook = (book: OwnShelfBook): OwnBook => ({
  key: book.key, kind: book.kind, title: book.title, author: book.author, cover: book.cover, at: book.at,
  readingAt: book.reading?.lastActiveAt ?? null, percent: book.reading?.percent ?? null, href: book.href,
})

/**
 * This account's own books, this device's first, then the account's copies
 * not on it. The account's list is read first: a book removed on another
 * device leaves this device too, and places read on other devices are taken
 * (userBook/ownSync.ts), so Currently reading and its progress match there.
 */
export async function ownBooks(fetchImpl: typeof fetch = fetch): Promise<OwnBook[]> {
  const owner = readCachedSupabaseUser()?.id
  if (!owner) return []
  return (await ownShelfWithAccount(owner, { token: await token(), fetchImpl })).map(ownBook)
}

/**
 * The book switcher for pages outside the reader (Add a book's PDF viewer):
 * loaded only when it opens, so the library does not carry it.
 */
const switcher = () => import('./lab/userBook/ownSwitcher')
let switcherModule: Awaited<ReturnType<typeof switcher>> | null = null
export async function switcherRows(): Promise<{ rows: unknown[]; error: string }> {
  switcherModule ??= await switcher()
  return switcherModule.switcherRows()
}
/** Where a switcher row opens (null: its place cannot be handed over). Call after switcherRows. */
export function switcherTarget(row: Parameters<Awaited<ReturnType<typeof switcher>>['switcherTarget']>[0]): string | null {
  return switcherModule ? switcherModule.switcherTarget(row) : row.href ?? null
}

;(window as Window & { __tinctLibraryAdd?: unknown }).__tinctLibraryAdd = { importWork, ownBooks, canAdd, modernStatus, buyModern, switcherRows, switcherTarget }
