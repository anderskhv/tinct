/**
 * Library first paint (lab).
 *
 * `/lab/library` is static HTML. Its header, mode and recap used to be
 * decided only after the catalogue, the persisted auth session and the two
 * cloud copies had answered, so a signed-in returning reader saw the landing
 * markup, then the anonymous library, then their own. This module is the
 * contract between the writers of a small boot snapshot — the library after
 * each confirmed render, the reader when it leaves for the library or is
 * hidden — and the inline boot script in `public/lab/index.html`, which
 * paints the snapshot before any module script has loaded.
 *
 * The snapshot is a cache of the last confirmed library, tagged with the
 * account it belongs to. The boot script paints it only for that account
 * (a signed-out device only paints a signed-out snapshot); the library's
 * confirmed render replaces it. Sign-out wipes it with every other
 * `tinct:` key (`clearLocalUserData`).
 */
import { displayNameFor, accountInitial } from './labAuthDisplay'

export const LAB_LIBRARY_BOOT_KEY = 'tinct:lab-library-boot'
export const LAB_LIBRARY_BOOT_VERSION = 1
/** Older snapshots are ignored: the recap they describe is too stale to pass off as the current one. */
export const LAB_LIBRARY_BOOT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & { length?: number; key?: (index: number) => string | null }

export interface LabLibraryBootHero {
  bookId: string
  title: string
  /** The chapter Continue resumes in, as the library labels it ("Proverbs 17", "Book 3"). */
  chapterLabel: string
  headline: string
  coverSrc: string | null
  coverSrcSet: string | null
  /** "12% read", when known. */
  note: string | null
}

/** A Reading-now card after the hero: enough to paint its cover before any module has loaded. */
export interface LabLibraryBootCard {
  bookId: string
  title: string
  coverSrc: string | null
  coverSrcSet: string | null
}

/** Cards the boot paints after the hero. The row is a row, not a list: a dozen is more than a screen. */
export const LAB_LIBRARY_BOOT_ROW_MAX = 12

export interface LabLibraryBootSnapshot {
  v: typeof LAB_LIBRARY_BOOT_VERSION
  at: number
  /** Account the snapshot belongs to; null for a signed-out device. */
  userId: string | null
  readingNow: number
  finished: number
  hero: LabLibraryBootHero | null
  /**
   * The Reading-now cards after the hero, in row order (2026-09-11). The boot
   * paints every cover the confirmed render will show, so the row does not
   * go from one card to N when the module lands. Absent in older snapshots.
   */
  row: LabLibraryBootCard[]
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : null
}

/** A cover source the boot script may put in an `<img>`: same-origin path, https, or an inline SVG data URI. */
export function safeCoverSource(value: unknown): string | null {
  const src = text(value, 200_000)
  if (!src) return null
  if (src.startsWith('/') && !src.startsWith('//')) return src
  if (src.startsWith('https://')) return src
  if (src.startsWith('data:image/svg+xml')) return src
  return null
}

export function parseLabLibraryBootSnapshot(raw: unknown, now = Date.now()): LabLibraryBootSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (src.v !== LAB_LIBRARY_BOOT_VERSION) return null
  if (typeof src.at !== 'number' || !Number.isFinite(src.at) || src.at > now + 60_000 || now - src.at > LAB_LIBRARY_BOOT_MAX_AGE_MS) return null
  const userId = src.userId === null ? null : text(src.userId, 120)
  if (src.userId !== null && userId === null) return null
  let hero: LabLibraryBootHero | null = null
  if (src.hero && typeof src.hero === 'object') {
    const h = src.hero as Record<string, unknown>
    const bookId = text(h.bookId, 80)
    const title = text(h.title, 200)
    const chapterLabel = text(h.chapterLabel, 200)
    const headline = text(h.headline, 600)
    if (!bookId || !title || !chapterLabel || !headline) return null
    hero = {
      bookId,
      title,
      chapterLabel,
      headline,
      coverSrc: safeCoverSource(h.coverSrc),
      coverSrcSet: safeCoverSource(h.coverSrc) ? text(h.coverSrcSet, 4_000) : null,
      note: text(h.note, 40),
    }
  }
  const count = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10_000 ? value : 0
  const row: LabLibraryBootCard[] = []
  if (hero && Array.isArray(src.row)) {
    for (const item of src.row) {
      if (row.length >= LAB_LIBRARY_BOOT_ROW_MAX) break
      if (!item || typeof item !== 'object') continue
      const c = item as Record<string, unknown>
      const bookId = text(c.bookId, 80)
      const title = text(c.title, 200)
      if (!bookId || !title || bookId === hero.bookId || row.some(card => card.bookId === bookId)) continue
      row.push({ bookId, title, coverSrc: safeCoverSource(c.coverSrc), coverSrcSet: safeCoverSource(c.coverSrc) ? text(c.coverSrcSet, 4_000) : null })
    }
  }
  return { v: LAB_LIBRARY_BOOT_VERSION, at: src.at, userId, readingNow: count(src.readingNow), finished: count(src.finished), hero, row }
}

export function readLabLibraryBootSnapshot(storage: StorageLike | null = browserStorage(), now = Date.now()): LabLibraryBootSnapshot | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(LAB_LIBRARY_BOOT_KEY)
    return raw ? parseLabLibraryBootSnapshot(JSON.parse(raw), now) : null
  } catch {
    return null
  }
}

export function writeLabLibraryBootSnapshot(snapshot: LabLibraryBootSnapshot, storage: StorageLike | null = browserStorage()): void {
  if (!storage) return
  try {
    storage.setItem(LAB_LIBRARY_BOOT_KEY, JSON.stringify(snapshot))
  } catch {
    // quota / private mode: the library simply resolves the slow way
  }
}

export function clearLabLibraryBootSnapshot(storage: StorageLike | null = browserStorage()): void {
  if (!storage) return
  try { storage.removeItem(LAB_LIBRARY_BOOT_KEY) } catch { /* private mode */ }
}

/** The location line the library shows when no summary describes the chapter (`heroHeadline` fallback). */
export function stoppedInHeadline(chapterLabel: string): string {
  return `You stopped in ${chapterLabel}`
}

/**
 * The reader's own knowledge, folded into the snapshot when it leaves for
 * the library or is hidden: the book and chapter it is in are the hero. A
 * stored headline and cover survive only when they describe that same
 * chapter; otherwise the truthful location line stands in until the library
 * confirms. Counts stay cosmetic ("Reading now · N").
 */
export function snapshotWithReaderPlace(existing: LabLibraryBootSnapshot | null, input: {
  userId: string | null
  bookId: string
  title: string
  chapterLabel: string
  now: number
}): LabLibraryBootSnapshot {
  const base = existing && existing.userId === input.userId ? existing : null
  const sameBook = base?.hero?.bookId === input.bookId
  const sameChapter = sameBook && base?.hero?.chapterLabel === input.chapterLabel
  // The book the reader is in may already be on the row: its card supplies
  // the cover the hero would otherwise lose, and leaves the row.
  const fromRow = !sameBook ? base?.row.find(card => card.bookId === input.bookId) ?? null : null
  const hero: LabLibraryBootHero = {
    bookId: input.bookId,
    title: input.title,
    chapterLabel: input.chapterLabel,
    headline: sameChapter && base?.hero ? base.hero.headline : stoppedInHeadline(input.chapterLabel),
    coverSrc: sameBook && base?.hero ? base.hero.coverSrc : fromRow?.coverSrc ?? null,
    coverSrcSet: sameBook && base?.hero ? base.hero.coverSrcSet : fromRow?.coverSrcSet ?? null,
    note: sameChapter && base?.hero ? base.hero.note : null,
  }
  // The row keeps its order; a hero that steps down goes to its front, the
  // way the confirmed list would order it (newest first).
  const row = (base?.row ?? []).filter(card => card.bookId !== input.bookId)
  if (base?.hero && !sameBook) {
    row.unshift({ bookId: base.hero.bookId, title: base.hero.title, coverSrc: base.hero.coverSrc, coverSrcSet: base.hero.coverSrcSet })
  }
  return {
    v: LAB_LIBRARY_BOOT_VERSION,
    at: input.now,
    userId: input.userId,
    readingNow: base ? (base.hero && !sameBook && !fromRow ? base.readingNow + 1 : Math.max(1, base.readingNow)) : 1,
    finished: base?.finished ?? 0,
    hero,
    row: row.slice(0, LAB_LIBRARY_BOOT_ROW_MAX),
  }
}

export interface CachedSupabaseUser {
  id: string
  email: string | null
  name: string | null
  initial: string
}

/**
 * The account the device is signed in as, read synchronously from the
 * persisted Supabase session (`sb-<ref>-auth-token`). No network, no
 * refresh: a hint for first paint that `supabase.auth.getSession()` then
 * confirms.
 */
export function readCachedSupabaseUser(storage: StorageLike | null = browserStorage()): CachedSupabaseUser | null {
  if (!storage || typeof storage.length !== 'number' || typeof storage.key !== 'function') return null
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (!key || !/^sb-.*-auth-token$/.test(key)) continue
      const raw = storage.getItem(key)
      if (!raw || raw === 'null' || raw === '""') continue
      const session = JSON.parse(raw) as { user?: { id?: unknown; email?: unknown; user_metadata?: Record<string, unknown> } } | null
      const user = session?.user
      if (!user || typeof user.id !== 'string' || !user.id) continue
      const name = displayNameFor({ email: typeof user.email === 'string' ? user.email : null, user_metadata: user.user_metadata ?? null })
      return { id: user.id, email: typeof user.email === 'string' ? user.email : null, name, initial: accountInitial(name) }
    }
  } catch {
    // unreadable storage or session: no hint
  }
  return null
}

/**
 * Signed-in hint for first paint: a persisted Supabase session, or the
 * `tinct_auth=1` cookie the Worker uses for the same purpose. Both are
 * cleared on sign-out. `tinct:last-user-id` is deliberately not a hint: it
 * survives sign-out (it drives the "sign in again?" banner) and would paint
 * a signed-in library on a signed-out device.
 */
export function labSignedInHint(storage: StorageLike | null = browserStorage(), cookie = typeof document === 'undefined' ? '' : document.cookie): boolean {
  if (readCachedSupabaseUser(storage)) return true
  try {
    return (cookie || '').split(';').some(part => part.trim() === 'tinct_auth=1')
  } catch {
    return false
  }
}

/**
 * Whether the URL asks for the library: `/lab/library`, `/library` (the
 * launch route), or `?view=library` on the pre-reader page.
 */
export function libraryViewRequested(pathname: string, search = ''): boolean {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (path === '/lab/library' || path === '/library') return true
  const query = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(query).get('view') === 'library'
}

// ------------------------------------------------------------- lab entry

/**
 * How long after the last page of reading a signed-in reader is taken
 * straight back into the book instead of the library. Three days: long
 * enough to cover a weekend away from a half-read chapter, short enough that
 * a book abandoned last month does not hijack the front door.
 */
export const LAB_RESUME_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

/** Where `/lab` should land. `null` means the URL already asks for something specific. */
export type LabEntryTarget = 'landing' | 'library' | 'reader'

/**
 * The bare entry paths into the lab: `/lab`, `/lab/`, `/lab/landing`. The
 * marketing root `/` is a different document and is not decided here.
 */
export function isLabEntryPath(pathname: string, search = ''): boolean {
  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (path !== '' && path !== '/lab' && path !== '/lab/landing') return false
  const query = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(query)
  // A deep link that names a view or a book is an explicit request; leave it.
  return !params.get('view') && !params.get('book')
}

/**
 * The newest moment this device recorded reading: the reader's position
 * record (per-book `updatedAt`, plus `lastSettledAt`) and the reading-memory
 * mirror (`lastActiveAt` on each session). Null when nothing has been read.
 */
export function labLastReadAt(storage: StorageLike | null = browserStorage()): number | null {
  if (!storage) return null
  const stamps: number[] = []
  const push = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) stamps.push(value)
  }
  const read = (key: string): unknown => {
    try {
      const raw = storage.getItem(key)
      return raw ? JSON.parse(raw) as unknown : null
    } catch {
      return null
    }
  }
  const position = read('tinct-lab-position') as { books?: Record<string, { updatedAt?: unknown }>; lastSettledAt?: unknown } | null
  if (position && typeof position === 'object') {
    push(position.lastSettledAt)
    for (const place of Object.values(position.books ?? {})) push(place?.updatedAt)
  }
  const memory = read('tinct:reading-memory') as { sessions?: Record<string, { lastActiveAt?: unknown; endedAt?: unknown }> } | null
  if (memory && typeof memory === 'object') {
    for (const session of Object.values(memory.sessions ?? {})) {
      push(session?.lastActiveAt)
      push(session?.endedAt)
    }
  }
  return stamps.length ? Math.max(...stamps) : null
}

/**
 * Where a hit on `/lab` should go.
 *
 * A signed-in reader never sees the landing page. If they read within
 * `LAB_RESUME_WINDOW_MS` they go straight back into the book at the place
 * the library's Continue card resolves; otherwise, and when there is no
 * reading at all, they go to the library. Signed-out readers keep the
 * landing page.
 */
export function labEntryTarget(input: {
  pathname: string
  search?: string
  signedIn: boolean
  lastReadAt: number | null
  now?: number
}): LabEntryTarget | null {
  if (!isLabEntryPath(input.pathname, input.search ?? '')) return null
  if (!input.signedIn) return 'landing'
  const last = input.lastReadAt
  if (typeof last !== 'number' || !Number.isFinite(last) || last <= 0) return 'library'
  const now = input.now ?? Date.now()
  // A clock that ran backwards still means the reader was just here.
  return now - last <= LAB_RESUME_WINDOW_MS ? 'reader' : 'library'
}
