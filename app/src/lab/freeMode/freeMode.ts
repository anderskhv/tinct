/**
 * The reader's free reading mode (`/reader?book={id}&mode=free`, docs/modern-english/BUILD-BRIEF.md): the reader
 * with everything that asks for something taken away. The /modern-english page links every book here.
 *
 * - Only Original and Modern English, and on the desktop Both (the reader's own Compare view).
 * - No AI and no narration: the reader offers none, and the guard below answers any such request on the device,
 *   so nothing reaches those routes even if a code path forgets the mode.
 * - No account: the reader runs as if signed out (main.tsx passes `authToken={null}`), so the place is kept on this
 *   device only, by the reader's own local position store, and is never written to the account. Any other write to
 *   Tinct's API or the database is answered here and never sent. Sign-in and token refresh are left alone, so a
 *   signed-in reader's own session is unharmed. Once the visitor opens the normal reader, it takes over as it does
 *   for any guest place on the device.
 *
 * Decided once per page, from the address, before the app runs.
 */
import { editionHold } from '../../data/editionAvailability'
import { editionSource } from '../../data/editionSources'
import { isEditionWithheld } from '../../data/withheldEditions'
import type { Book, Edition } from '../../types'
import type { LabSuperMenuRow } from '../labSuperMenu'
import { FREE_MODE_ENGLISH, danishGenitive, freeModeLocaleFor, type FreeModeLocale } from './freeModeLocale'

export const FREE_MODE_PARAM = 'mode'
export const FREE_MODE_VALUE = 'free'
/** The page's `ref`, which names the free page the reader came from and with it free mode's language. */
export const FREE_MODE_REF_PARAM = 'ref'
/**
 * Free mode's language (freeModeLocale.ts), decided once per page from the address like the mode itself: Danish from
 * the Danish page's `ref`, else English.
 */
export const FREE_MODE_LOCALE: FreeModeLocale = typeof window !== 'undefined' ? freeModeLocaleFor(window.location.search) : FREE_MODE_ENGLISH
/** Where the back arrow goes: the free page the reader came from. */
export const FREE_MODE_HOME = FREE_MODE_LOCALE.home
/** The two editions English free mode reads. Both is the desktop Compare view of the two. */
export const FREE_MODE_EDITIONS = ['original-en', 'modern-en'] as const
/** An edition free mode reads, in any of its languages. */
export type FreeModeEdition = typeof FREE_MODE_EDITIONS[number] | 'modern-da'

/** `/reader?…&mode=free`, never a reader's own book (`userBook`). */
export function isFreeModeLocation(pathname: string, search: string): boolean {
  if (pathname !== '/reader') return false
  const params = new URLSearchParams(search)
  return params.get(FREE_MODE_PARAM) === FREE_MODE_VALUE && !params.has('userBook')
}

export const FREE_MODE = typeof window !== 'undefined' && isFreeModeLocation(window.location.pathname, window.location.search)

/**
 * Keep `mode=free` on a reader address the mode navigates to itself (the book picker), and with it the `ref` of a
 * free page in another language, so the next book reads in that language too.
 */
export function withFreeMode(destination: string, locale: FreeModeLocale = FREE_MODE_LOCALE): string {
  if (!destination.startsWith('/') || destination.startsWith('//')) return destination
  const url = new URL(destination, 'https://tinct.app')
  if (url.pathname !== '/reader') return destination
  url.searchParams.set(FREE_MODE_PARAM, FREE_MODE_VALUE)
  if (locale.id !== FREE_MODE_ENGLISH.id) url.searchParams.set(FREE_MODE_REF_PARAM, locale.ref)
  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * The editions of a book free mode may open. English free mode takes the registry's list as it is, as it always has.
 * Another language's edition is published book by book (editionAvailability.ts OFFERED_DANISH_EDITIONS), so there a
 * held or withheld edition is left out before the pair is chosen and is never opened.
 */
export function freeModeCandidates<T extends Pick<Edition, 'key'>>(bookId: string, editions: T[], locale: FreeModeLocale = FREE_MODE_LOCALE): T[] {
  if (locale.id === FREE_MODE_ENGLISH.id) return editions
  return editions.filter(edition => !editionHold(bookId, edition.key) && !isEditionWithheld(bookId, edition.key))
}

/**
 * The pair of editions free mode reads in a book: the language's own, or Original and Modern English for a book
 * that has no edition in that language (reached from the book picker).
 */
export function freeModePair(available: Array<Pick<Edition, 'key'>>, locale: FreeModeLocale = FREE_MODE_LOCALE): { original: string; modern: string } {
  if (locale.id !== FREE_MODE_ENGLISH.id && available.some(edition => edition.key === locale.modern)) return { original: locale.original, modern: locale.modern }
  return { original: FREE_MODE_ENGLISH.original, modern: FREE_MODE_ENGLISH.modern }
}

/** The editions free mode offers of a book: its pair (Original and Modern English in English), where the book has them. */
export function freeModeEditions<T extends Pick<Edition, 'key'>>(editions: T[], locale: FreeModeLocale = FREE_MODE_LOCALE): T[] {
  const pair = freeModePair(editions, locale)
  return editions.filter(edition => edition.key === pair.original || edition.key === pair.modern)
}

/**
 * The edition free mode opens a book in: the edition of the place saved on this device when it is one of the two,
 * else the modern edition (else the original, for a book without one).
 */
export function freeModeEditionFor(available: Array<Pick<Edition, 'key'>>, saved?: string | null, locale: FreeModeLocale = FREE_MODE_LOCALE): FreeModeEdition | null {
  const pair = freeModePair(available, locale)
  const keys = new Set(freeModeEditions(available, locale).map(edition => edition.key))
  if (saved && keys.has(saved)) return saved as FreeModeEdition
  if (keys.has(pair.modern)) return pair.modern as FreeModeEdition
  return keys.has(pair.original) ? pair.original as FreeModeEdition : null
}

/**
 * The other of the two: the Compare edition behind Both, and the one the switch goes to. `available` is the book's
 * editions; without it the language's own pair is assumed.
 */
export function otherFreeModeEdition(key: string, available?: Array<Pick<Edition, 'key'>>, locale: FreeModeLocale = FREE_MODE_LOCALE): FreeModeEdition {
  const pair = available ? freeModePair(available, locale) : { original: locale.original, modern: locale.modern }
  return (key === pair.original ? pair.modern : pair.original) as FreeModeEdition
}

/** The t menu in free mode: Appearance, Book settings, then Library (BUILD-BRIEF.md, p-menu.jpg). */
export function freeModeMenuRows(locale: FreeModeLocale = FREE_MODE_LOCALE): LabSuperMenuRow[] {
  return [
    { id: 'text', label: locale.strings.menu.appearance, chevron: true },
    { id: 'editions', label: locale.strings.menu.bookSettings, chevron: true },
    { id: 'library', label: locale.strings.menu.library, ruleBefore: true },
  ]
}

/** The reader's keyboard commands free mode keeps: reading, moving, the editions, Contents and the library. */
export const FREE_MODE_COMMANDS: ReadonlySet<string> = new Set([
  'read', 'next', 'previous', 'next-chapter', 'previous-chapter', 'contents', 'editions', 'original', 'modern', 'compare',
  'books', 'library', 'settings', 'fullscreen',
])

/**
 * The line under the chapter heading in Original and Modern (not in Both, where the column labels say it):
 * "Modern English made with AI from George Long's 1862 translation". From the registry, as the edition notes are.
 */
export function freeModeSourceLine(book: Pick<Book, 'id' | 'author' | 'editions'>, locale: FreeModeLocale = FREE_MODE_LOCALE): string {
  if (locale.id === 'da' && freeModePair(freeModeCandidates(book.id, book.editions, locale), locale).modern === locale.modern) return danishSourceLine(book)
  const source = editionSource(book)
  if (source?.kind === 'translation') return `Modern English made with AI from ${source.translator}’s ${source.year} translation`
  if (source?.kind === 'english-original') return `Modern English made with AI from ${source.author}’s original`
  const translator = book.editions.find(edition => edition.key === 'original-en')?.translator
  return translator ? `Modern English made with AI from ${translator}’s translation` : 'Modern English made with AI from the original'
}

/** The language of an original the Danish was made from directly, as the source line names it. */
const DANISH_ORIGINAL_LANGUAGE: Record<string, string> = { ru: 'russiske' }

/**
 * The Danish source line: "Nutidsdansk lavet med AI ud fra George Longs engelske oversættelse fra 1862". The Danish
 * editions are made from Tinct's Modern English, which was made from the English original or the older translation
 * named here; a book with no English original (The Master and Margarita) was made from its own original.
 */
function danishSourceLine(book: Pick<Book, 'id' | 'author' | 'editions'>): string {
  const lead = 'Nutidsdansk lavet med AI ud fra'
  const source = editionSource(book)
  if (source?.kind === 'translation') return `${lead} ${danishGenitive(source.translator)} engelske oversættelse fra ${source.year}`
  if (source?.kind === 'english-original') return `${lead} ${danishGenitive(source.author)} engelske original`
  const original = book.editions.find(edition => edition.key === 'original-en')
  if (original?.translator) return `${lead} ${danishGenitive(original.translator)} engelske oversættelse`
  const own = original ? undefined : book.editions.find(edition => edition.style === 'original' && DANISH_ORIGINAL_LANGUAGE[edition.language])
  return own ? `${lead} den ${DANISH_ORIGINAL_LANGUAGE[own.language]} original` : `${lead} den engelske udgave`
}

// ---- The guard ---------------------------------------------------------------------------------------------------

/**
 * Tinct's AI and narration routes. Free mode sends nothing to any of them, by any method: chat and its cards,
 * chapter notes, recaps, Catch me up, Talk, dictation, narration and recorded audio, and the AI allowance.
 */
const AI_ROUTE = /^\/api\/(?:chat|lab-chat|lab-recap|lab-chapter-notes|lab-catch-up|lab-voice|voice|narration|audio|dictation|own-catch-up|own-text-repair|recap|ai-allowance|define|explain)(?:[/-]|$)/
/** The anonymous funnel events (with no account attached): the page's `ref` is counted by them. */
const EVENTS_ROUTE = '/api/events'

export type FreeModeVerdict = 'ai' | 'write' | 'events' | 'pass'

/**
 * What free mode does with a request: `ai` is answered on the device (403), `write` is answered on the device (204),
 * `events` goes out without an account, `pass` goes out as it is (reads of text, covers, the catalogue; sign-in).
 */
export function freeModeVerdict(rawUrl: string, method: string, origin: string): FreeModeVerdict {
  let url: URL
  try { url = new URL(rawUrl, origin) } catch { return 'pass' }
  const write = !/^(?:GET|HEAD|OPTIONS)$/i.test(method || 'GET')
  const sameOrigin = url.origin === origin
  if (sameOrigin && AI_ROUTE.test(url.pathname)) return 'ai'
  if (sameOrigin && url.pathname === EVENTS_ROUTE) return 'events'
  if (sameOrigin && url.pathname.startsWith('/api/')) return write ? 'write' : 'pass'
  // The database: reads pass; every write is answered here, except sign-in and token refresh (a refresh rotates the
  // session, which must reach the device's real store).
  if (/\.supabase\.co$/.test(url.hostname) && write && !url.pathname.startsWith('/auth/')) return 'write'
  return 'pass'
}

interface GuardWindow {
  location: { origin: string }
  fetch: typeof fetch
  navigator: Navigator
}

const GUARD_MARK = '__TINCT_FREE_MODE_GUARD__'

/** Wrap `fetch` and `sendBeacon` so free mode cannot reach AI, narration or the account. Idempotent. */
export function installFreeModeGuard(win: GuardWindow = window): void {
  const slot = win as unknown as Record<string, unknown>
  if (slot[GUARD_MARK]) return
  slot[GUARD_MARK] = true
  const realFetch = win.fetch.bind(win)
  win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url
    const method = init?.method || (typeof input === 'object' && 'method' in input ? (input as Request).method : 'GET')
    const verdict = freeModeVerdict(raw, method, win.location.origin)
    if (verdict === 'ai') {
      return Promise.resolve(new Response(JSON.stringify({ error: 'Not offered in free reading.' }), { status: 403, headers: { 'Content-Type': 'application/json' } }))
    }
    if (verdict === 'write') return Promise.resolve(new Response(null, { status: 204 }))
    if (verdict === 'events') {
      const headers = new Headers(init?.headers || (typeof input === 'object' && 'headers' in input ? (input as Request).headers : undefined))
      headers.delete('Authorization')
      return realFetch(input, { ...(init || {}), headers })
    }
    return realFetch(input, init)
  }) as typeof fetch
  const beacon = win.navigator?.sendBeacon?.bind(win.navigator)
  if (beacon) {
    try {
      Object.defineProperty(win.navigator, 'sendBeacon', {
        configurable: true,
        value: (url: string | URL, data?: BodyInit | null) => {
          const verdict = freeModeVerdict(String(url), 'POST', win.location.origin)
          return verdict === 'events' || verdict === 'pass' ? beacon(url, data) : true
        },
      })
    } catch { /* left as is: fetch is still guarded */ }
  }
}
