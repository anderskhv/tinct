/**
 * What opened the sign-in sheet, and what the sheet says for it (Anders, 24 Nov 2026).
 *
 *   save_place  sign-in from inside a book: the reader's t menu, and the AI, Talk and
 *               Catch me up account prompts
 *   listen      the "keep listening" account prompt
 *   general     everything else: the library, /about, /byob, a direct /sign-in
 *
 * The page that opens the sheet adds `from=<entry>` beside `returnTo`; no `from` is
 * general. The /byob file and paste variants keep their own words
 * (public/lab/sign-in/context.js). Every string the sheet shows for an entry is in
 * SIGN_IN_COPY, so the copy changes in one place.
 *
 * The book's title is never read from the URL (a link could put any words on the
 * sheet): the reader leaves it in this tab's sessionStorage as it opens the sheet
 * (rememberSignInBook), and the sheet takes it from there.
 */
export type SignInEntry = 'save_place' | 'listen' | 'general'

export const SIGN_IN_ENTRIES: readonly SignInEntry[] = ['save_place', 'listen', 'general']

/** The query parameter beside `returnTo`. */
export const SIGN_IN_ENTRY_PARAM = 'from'

export interface SignInSheetCopy {
  title: string
  /** The line under the title. `{book}` is the book's title. */
  line: string
  /** The line when the book's title is not known. */
  lineWithoutBook?: string
}

export const SIGN_IN_COPY: Record<SignInEntry, SignInSheetCopy> = {
  save_place: {
    title: 'Keep your place',
    line: 'Pick up {book} at this page on any device.',
    lineWithoutBook: 'Pick up where you are on any device.',
  },
  listen: {
    title: 'Keep listening',
    line: 'Listen on from this sentence, on any device.',
  },
  general: {
    title: 'Sign in or join Tinct',
    line: 'Your books, places, highlights and notes on every device.',
  },
}

/** Small print under the line, for every entry. */
export const SIGN_IN_FREE_LINE = 'Reading is free. Your first month of Premium is free, no card.'

export function signInEntryOf(value: unknown): SignInEntry {
  return typeof value === 'string' && (SIGN_IN_ENTRIES as readonly string[]).includes(value) ? value as SignInEntry : 'general'
}

/** The sheet's title and line for an entry. */
export function signInSheetCopy(entry: SignInEntry, bookTitle: string | null = null): { title: string; line: string } {
  const copy = SIGN_IN_COPY[entry]
  const book = bookTitle?.trim()
  const line = copy.line.includes('{book}')
    ? (book ? copy.line.replace('{book}', book) : copy.lineWithoutBook ?? copy.line.replace('{book} ', ''))
    : copy.line
  return { title: copy.title, line }
}

/** `/sign-in?returnTo=…` with the entry added (general adds nothing). */
export function withSignInEntry(url: string, entry: SignInEntry): string {
  if (entry === 'general') return url
  const parsed = new URL(url, 'https://tinct.app')
  parsed.searchParams.set(SIGN_IN_ENTRY_PARAM, entry)
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

// ===== The book's title, from the reader to the sheet (this tab only) =====

export const SIGN_IN_BOOK_KEY = 'tinct:sign-in-book'
/** A title older than this is not the book the reader just left. */
export const SIGN_IN_BOOK_MAX_AGE_MS = 30 * 60_000
const MAX_TITLE = 120

function session(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage } catch { return null }
}

/** The reader, as it opens the sheet: the title of the book it is in. */
export function rememberSignInBook(title: string | null | undefined, storage: Storage | null = session(), now = Date.now()): void {
  const clean = typeof title === 'string' ? title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE) : ''
  try {
    if (clean) storage?.setItem(SIGN_IN_BOOK_KEY, JSON.stringify({ title: clean, at: now }))
    else storage?.removeItem(SIGN_IN_BOOK_KEY)
  } catch { /* private mode: the line without the title */ }
}

/** The sheet: the title the reader left, if it is recent. */
export function signInBookTitle(storage: Storage | null = session(), now = Date.now()): string | null {
  try {
    const value = JSON.parse(storage?.getItem(SIGN_IN_BOOK_KEY) || 'null') as { title?: unknown; at?: unknown } | null
    if (!value || typeof value.title !== 'string' || typeof value.at !== 'number') return null
    if (now - value.at > SIGN_IN_BOOK_MAX_AGE_MS || value.at > now + 60_000) return null
    const title = value.title.replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE)
    return title || null
  } catch {
    return null
  }
}

// ===== The entry across a Google or provider round trip (this tab only) =====

export const SIGN_IN_ENTRY_KEY = 'tinct:sign-in-entry'

/**
 * The entry this sheet was opened with: the URL's (kept for the round trip); back from Google or
 * another provider, the one kept before it left; anything else is general.
 */
export function currentSignInEntry(search: string, returning: boolean, storage: Storage | null = session()): SignInEntry {
  const fromUrl = new URLSearchParams(search).get(SIGN_IN_ENTRY_PARAM)
  try {
    if (fromUrl !== null) {
      const entry = signInEntryOf(fromUrl)
      storage?.setItem(SIGN_IN_ENTRY_KEY, entry)
      return entry
    }
    if (returning) return signInEntryOf(storage?.getItem(SIGN_IN_ENTRY_KEY))
    storage?.removeItem(SIGN_IN_ENTRY_KEY)
    return 'general'
  } catch {
    return signInEntryOf(fromUrl)
  }
}
