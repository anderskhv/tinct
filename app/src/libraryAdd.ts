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
import { ADD_BOOK_IDB_NAME } from './services/storage'
import { userBookReaderUrl, USER_BOOKS_SHELF_URL } from './lab/userBook/userBookId'

export type ImportFailure = 'signed_out' | 'daily_limit' | 'in_progress' | 'not_importable' | 'unreadable' | 'failed'
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

// ===== Your own books =====

export interface OwnBook {
  key: string
  kind: 'pdf' | 'epub'
  title: string
  author: string
  /** Last opened (or added) on this device or in the account. */
  at: number
  /** The reader has a saved place in it on this device: it is being read. */
  readingAt: number | null
  href: string
}

interface LocalRecord { key: string; kind: string; name?: string; title?: string; author?: string; owner?: string; addedAt?: number; openedAt?: number }

async function localRecords(owner: string): Promise<LocalRecord[]> {
  if (typeof indexedDB === 'undefined') return []
  // Never create Add a book's database just to look in it.
  try {
    const list = await (indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> }).databases?.()
    if (list && !list.some(db => db.name === ADD_BOOK_IDB_NAME)) return []
  } catch { /* older browsers: open below */ }
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(ADD_BOOK_IDB_NAME, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('books')) request.result.createObjectStore('books', { keyPath: 'key' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try {
    return await new Promise<LocalRecord[]>((resolve, reject) => {
      const out: LocalRecord[] = []
      const request = db.transaction('books', 'readonly').objectStore('books').openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) { resolve(out); return }
        const { key, kind, name, title, author, owner: recordOwner, addedAt, openedAt } = cursor.value as LocalRecord
        if (recordOwner === owner) out.push({ key, kind, name, title, author, addedAt, openedAt })
        cursor.continue()
      }
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

function placeAt(hex: string): number | null {
  try {
    const place = JSON.parse(localStorage.getItem(`tinct-addbook:place:${hex}`) || 'null') as { updatedAt?: unknown } | null
    return place && typeof place === 'object' ? (typeof place.updatedAt === 'number' ? place.updatedAt : 0) : null
  } catch {
    return null
  }
}

/** This account's own books, this device's first, then the account's copies not on it. */
export async function ownBooks(fetchImpl: typeof fetch = fetch): Promise<OwnBook[]> {
  const owner = readCachedSupabaseUser()?.id
  if (!owner) return []
  const local = await localRecords(owner).catch(() => [] as LocalRecord[])
  const out: OwnBook[] = []
  const here = new Set<string>()
  for (const record of local) {
    if (record.kind !== 'pdf' && record.kind !== 'epub') continue
    here.add(record.key)
    const hex = record.key.slice(record.key.indexOf(':') + 1)
    const readingAt = record.kind === 'epub' ? placeAt(hex) : null
    out.push({
      key: record.key,
      kind: record.kind,
      title: record.title || (record.name || '').replace(/\.(pdf|epub)$/i, '') || 'Untitled',
      author: record.author || '',
      at: record.openedAt || record.addedAt || 0,
      readingAt: readingAt === null ? null : readingAt || record.openedAt || 0,
      href: record.kind === 'epub' ? userBookReaderUrl(hex) : USER_BOOKS_SHELF_URL,
    })
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
        out.push({ key, kind: book.type, title: book.title || book.name || 'Untitled', author: book.author || '', at: Date.parse(book.createdAt || '') || 0, readingAt: null, href: USER_BOOKS_SHELF_URL })
      }
    } catch { /* this device's books still show */ }
  }
  return out.sort((a, b) => b.at - a.at)
}

;(window as Window & { __tinctLibraryAdd?: unknown }).__tinctLibraryAdd = { importWork, ownBooks }
