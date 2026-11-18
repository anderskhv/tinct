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
import { editionSource } from '../../data/editionSources'
import type { Book, Edition } from '../../types'
import type { LabSuperMenuRow } from '../labSuperMenu'

export const FREE_MODE_PARAM = 'mode'
export const FREE_MODE_VALUE = 'free'
/** Where the desktop back arrow goes. */
export const FREE_MODE_HOME = '/modern-english'
/** The two editions free mode reads. Both is the desktop Compare view of these two. */
export const FREE_MODE_EDITIONS = ['original-en', 'modern-en'] as const
export type FreeModeEdition = typeof FREE_MODE_EDITIONS[number]

/** `/reader?…&mode=free`, never a reader's own book (`userBook`). */
export function isFreeModeLocation(pathname: string, search: string): boolean {
  if (pathname !== '/reader') return false
  const params = new URLSearchParams(search)
  return params.get(FREE_MODE_PARAM) === FREE_MODE_VALUE && !params.has('userBook')
}

export const FREE_MODE = typeof window !== 'undefined' && isFreeModeLocation(window.location.pathname, window.location.search)

/** Keep `mode=free` on a reader address the mode navigates to itself (the book picker). */
export function withFreeMode(destination: string): string {
  if (!destination.startsWith('/') || destination.startsWith('//')) return destination
  const url = new URL(destination, 'https://tinct.app')
  if (url.pathname !== '/reader') return destination
  url.searchParams.set(FREE_MODE_PARAM, FREE_MODE_VALUE)
  return `${url.pathname}${url.search}${url.hash}`
}

/** The editions free mode offers of a book: Original and Modern English, where the book has them. */
export function freeModeEditions<T extends Pick<Edition, 'key'>>(editions: T[]): T[] {
  return editions.filter(edition => (FREE_MODE_EDITIONS as readonly string[]).includes(edition.key))
}

/**
 * The edition free mode opens a book in: the edition of the place saved on this device when it is one of the two,
 * else Modern English (else the original, for a book without one).
 */
export function freeModeEditionFor(available: Array<Pick<Edition, 'key'>>, saved?: string | null): FreeModeEdition | null {
  const keys = new Set(freeModeEditions(available).map(edition => edition.key))
  if (saved && keys.has(saved)) return saved as FreeModeEdition
  if (keys.has('modern-en')) return 'modern-en'
  return keys.has('original-en') ? 'original-en' : null
}

/** The other of the two: the Compare edition behind Both, and the one the switch goes to. */
export function otherFreeModeEdition(key: string): FreeModeEdition {
  return key === 'original-en' ? 'modern-en' : 'original-en'
}

/** The t menu in free mode: Appearance, Book settings, then Library (BUILD-BRIEF.md, p-menu.jpg). */
export function freeModeMenuRows(): LabSuperMenuRow[] {
  return [
    { id: 'text', label: 'Appearance', chevron: true },
    { id: 'editions', label: 'Book settings', chevron: true },
    { id: 'library', label: 'Library', ruleBefore: true },
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
export function freeModeSourceLine(book: Pick<Book, 'id' | 'author' | 'editions'>): string {
  const source = editionSource(book)
  if (source?.kind === 'translation') return `Modern English made with AI from ${source.translator}’s ${source.year} translation`
  if (source?.kind === 'english-original') return `Modern English made with AI from ${source.author}’s original`
  const translator = book.editions.find(edition => edition.key === 'original-en')?.translator
  return translator ? `Modern English made with AI from ${translator}’s translation` : 'Modern English made with AI from the original'
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
