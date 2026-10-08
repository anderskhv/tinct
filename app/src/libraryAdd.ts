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
 * (`/api/user-books`), listed for My shelf. Nothing is uploaded here.
 */
import { supabase } from './services/supabase'
import { readCachedSupabaseUser } from './lab/labLibraryBoot'
import { ownBookOpenUrl } from './lab/userBook/userBookId'
import { readOwnShelf } from './lab/userBook/ownShelf'

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
        : code === 'not_importable' || code === 'not_found' || code === 'source_not_allowed' ? 'not_importable'
          : code === 'not_epub' || code === 'edition_mismatch' || code === 'bad_edition' ? 'unreadable'
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
    let chapters: Array<{ number: number; title: string; paragraphs: string[] }>
    try {
      const { epubToEdition } = await import('./lab/userBook/epubEdition')
      // Titles as the file writes them: the Worker checks them against the EPUB, then sets them in house style.
      chapters = (await epubToEdition(bytes, { sourceTitles: true })).chapters
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
  /** The reader has a saved place in it on this device: it is being read. */
  readingAt: number | null
  href: string
}

/** This account's own books, this device's first, then the account's copies not on it. */
export async function ownBooks(fetchImpl: typeof fetch = fetch): Promise<OwnBook[]> {
  const owner = readCachedSupabaseUser()?.id
  if (!owner) return []
  const out: OwnBook[] = []
  const here = new Set<string>()
  for (const book of await readOwnShelf(owner)) {
    here.add(book.key)
    out.push({ key: book.key, kind: book.kind, title: book.title, author: book.author, cover: book.cover, at: book.at, readingAt: book.reading?.lastActiveAt ?? null, href: book.href })
  }
  const auth = await token()
  if (auth) {
    try {
      const response = await fetchImpl('/api/user-books', { headers: { Authorization: `Bearer ${auth}` } })
      const data = response.ok ? await response.json() as { books?: Array<{ type: 'pdf' | 'epub'; sha256?: string; title?: string; name?: string; author?: string; createdAt?: string }> } : { books: [] }
      for (const book of data.books ?? []) {
        const key = `${book.type}:${String(book.sha256 || '').slice(0, 24)}`
        if (!book.sha256 || here.has(key)) continue
        here.add(key)
        out.push({ key, kind: book.type, title: book.title || book.name || 'Untitled', author: book.author || '', cover: null, at: Date.parse(book.createdAt || '') || 0, readingAt: null, href: ownBookOpenUrl(key) })
      }
    } catch { /* this device's books still show */ }
  }
  return out.sort((a, b) => b.at - a.at)
}

;(window as Window & { __tinctLibraryAdd?: unknown }).__tinctLibraryAdd = { importWork, ownBooks, canAdd }
