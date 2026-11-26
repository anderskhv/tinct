/**
 * The reader's free reading mode (`/reader?book={id}&mode=free`, docs/modern-english/BUILD-BRIEF.md): the reader
 * with everything that asks for something taken away. The /modern-english page links every book here.
 *
 * - Only Original and Modern English, and on the desktop Both (the reader's own Compare view). Opened from the Danish
 *   page (`ref=nudansk`, Anders 26 Nov 2026), the modern edition is the modern Danish instead, and the back arrow
 *   goes to /nudansk.
 * - A guest's AI actions on a selection (Ask, Explain, Simplify, Define and the rest), as the signed-out reader
 *   offers them, on the same device allowance (labAccountPrompt.ts LAB_FREE_AI_ACTIONS, shared with the normal
 *   reader); the next one shows the account sheet, the one prompt free mode shows (Anders, 26 Nov 2026: "give them
 *   10 free basically?"). They go to the guest companion route only, with no account attached.
 * - No narration, Talk, dictation, chapter notes or recaps: the reader offers none, and the guard below answers any
 *   such request on the device, so nothing reaches those routes even if a code path forgets the mode.
 * - No account: the reader runs as if signed out (main.tsx passes `authToken={null}`), so the place is kept on this
 *   device only, by the reader's own local position store, and is never written to the account. Any other write to
 *   Tinct's API or the database is answered here and never sent. Sign-in and token refresh are left alone. Once the
 *   visitor opens the normal reader, it takes over as it does for any guest place on the device.
 * - Free mode is for guests: a visitor with a Tinct session on this device gets the normal reader at the same
 *   address without `mode=free` (their account, place sync and AI allowance), rewritten here before any other
 *   module reads the address.
 *
 * Decided once per page, from the address and this device's session, before the app runs.
 */
import { editionSource } from '../../data/editionSources'
import { readCachedSupabaseUser } from '../labLibraryBoot'
import type { Book, Edition } from '../../types'
import type { LabSuperMenuRow } from '../labSuperMenu'

export const FREE_MODE_PARAM = 'mode'
export const FREE_MODE_VALUE = 'free'
/** The pages that open free mode, by their `ref`: where the back arrow goes, and the modern edition it reads. */
export const FREE_MODE_HUBS = {
  'modern-english': { home: '/modern-english', modern: 'modern-en' },
  nudansk: { home: '/nudansk', modern: 'modern-da' },
} as const
export type FreeModeHub = typeof FREE_MODE_HUBS[keyof typeof FREE_MODE_HUBS]
export type FreeModeModernEdition = FreeModeHub['modern']
/** The two editions free mode reads (from the English page). Both is the desktop Compare view of these two. */
export const FREE_MODE_EDITIONS = ['original-en', 'modern-en'] as const
export type FreeModeEdition = 'original-en' | FreeModeModernEdition

/** The hub a free-mode address came from: its `ref` when it is a known one, else the English page. */
export function freeModeHubFor(search: string): FreeModeHub {
  const ref = new URLSearchParams(search).get('ref')
  return ref === 'nudansk' ? FREE_MODE_HUBS.nudansk : FREE_MODE_HUBS['modern-english']
}

/** `/reader?…&mode=free`, never a reader's own book (`userBook`). */
export function isFreeModeLocation(pathname: string, search: string): boolean {
  if (pathname !== '/reader') return false
  const params = new URLSearchParams(search)
  return params.get(FREE_MODE_PARAM) === FREE_MODE_VALUE && !params.has('userBook')
}

/**
 * The normal reader's address for a free-mode address (`mode=free` dropped, `book`, `ref` and the rest kept), for a
 * visitor who is signed in on this device. Null when the address is not free mode.
 */
export function freeModeSignedInAddress(pathname: string, search: string, hash = ''): string | null {
  if (!isFreeModeLocation(pathname, search)) return null
  const params = new URLSearchParams(search)
  params.delete(FREE_MODE_PARAM)
  const rest = params.toString()
  return `${pathname}${rest ? `?${rest}` : ''}${hash}`
}

/**
 * Free mode for this page. A signed-in visitor (a Tinct session kept on this device) is moved to the normal reader
 * first: the address is replaced, not navigated, so the page loads once and the reader opens the book's place on
 * this device as the normal reader does for a guest place (labReaderHandoff.ts modernReturnHandoff).
 */
function decideFreeMode(): boolean {
  if (typeof window === 'undefined') return false
  const { pathname, search, hash } = window.location
  if (!isFreeModeLocation(pathname, search)) return false
  if (!readCachedSupabaseUser()) return true
  const normal = freeModeSignedInAddress(pathname, search, hash)
  try {
    if (normal) window.history.replaceState(window.history.state, '', normal)
  } catch {
    // The address could not be changed: stay free rather than run the normal reader on a free-mode address.
    return true
  }
  return false
}

export const FREE_MODE = decideFreeMode()
/** This page's hub, decided once from the address as FREE_MODE is. */
export const FREE_MODE_HUB: FreeModeHub = freeModeHubFor(typeof window !== 'undefined' ? window.location.search : '')
/** Where the desktop back arrow goes: the page the reader came from. */
export const FREE_MODE_HOME: string = FREE_MODE_HUB.home
/** The modern edition this page's free mode reads: Modern English, or modern Danish from /nudansk. */
export const FREE_MODE_MODERN: FreeModeModernEdition = FREE_MODE_HUB.modern

/** The account sheet free mode shows: only once the device's free AI actions are used (labAccountPrompt.ts). */
export function freeModeAllowsAccountPrompt(action: string): boolean {
  return action === 'chat'
}

/** Keep `mode=free` on a reader address the mode navigates to itself (the book picker). */
export function withFreeMode(destination: string): string {
  if (!destination.startsWith('/') || destination.startsWith('//')) return destination
  const url = new URL(destination, 'https://tinct.app')
  if (url.pathname !== '/reader') return destination
  url.searchParams.set(FREE_MODE_PARAM, FREE_MODE_VALUE)
  return `${url.pathname}${url.search}${url.hash}`
}

/** The editions free mode offers of a book: Original and the modern edition (English, or Danish), where it has them. */
export function freeModeEditions<T extends Pick<Edition, 'key'>>(editions: T[], modern: FreeModeModernEdition = FREE_MODE_MODERN): T[] {
  return editions.filter(edition => edition.key === 'original-en' || edition.key === modern)
}

/**
 * The edition free mode opens a book in: the edition of the place saved on this device when it is one of the two,
 * else the modern edition (else the original, for a book without one).
 */
export function freeModeEditionFor(available: Array<Pick<Edition, 'key'>>, saved?: string | null, modern: FreeModeModernEdition = FREE_MODE_MODERN): FreeModeEdition | null {
  const keys = new Set(freeModeEditions(available, modern).map(edition => edition.key))
  if (saved && keys.has(saved)) return saved as FreeModeEdition
  if (keys.has(modern)) return modern
  return keys.has('original-en') ? 'original-en' : null
}

/** The other of the two: the Compare edition behind Both, and the one the switch goes to. */
export function otherFreeModeEdition(key: string, modern: FreeModeModernEdition = FREE_MODE_MODERN): FreeModeEdition {
  return key === 'original-en' ? modern : 'original-en'
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
export function freeModeSourceLine(book: Pick<Book, 'id' | 'author' | 'editions'>, modern: FreeModeModernEdition = FREE_MODE_MODERN): string {
  // The modern Danish is made from the book's Modern English (danishEditionSources.json).
  if (modern === 'modern-da') return 'Nudansk lavet med AI ud fra Tincts moderne engelske udgave'
  const source = editionSource(book)
  if (source?.kind === 'translation') return `Modern English made with AI from ${source.translator}’s ${source.year} translation`
  if (source?.kind === 'english-original') return `Modern English made with AI from ${source.author}’s original`
  const translator = book.editions.find(edition => edition.key === 'original-en')?.translator
  return translator ? `Modern English made with AI from ${translator}’s translation` : 'Modern English made with AI from the original'
}

// ---- The guard ---------------------------------------------------------------------------------------------------

/**
 * Tinct's AI and narration routes. Free mode sends nothing to any of them, by any method, except the guest companion
 * below: the account's chat and its history, chapter notes, recaps, Catch me up, Talk, dictation, narration and
 * recorded audio, and the AI allowance.
 */
const AI_ROUTE = /^\/api\/(?:chat|lab-chat|lab-recap|lab-chapter-notes|lab-catch-up|lab-voice|voice|narration|audio|dictation|own-catch-up|own-text-repair|recap|ai-allowance|define|explain)(?:[/-]|$)/
/**
 * The guest companion: a signed-out reader's Ask, Explain, Simplify, Define and the rest (useLabAsk.ts), counted on
 * the device against LAB_FREE_AI_ACTIONS before it is sent, and metered for guests by the Worker. POST only.
 */
const GUEST_AI_ROUTE = '/api/lab-chat'
/** The anonymous funnel events (with no account attached): the page's `ref` is counted by them. */
const EVENTS_ROUTE = '/api/events'

export type FreeModeVerdict = 'ai' | 'guest-ai' | 'write' | 'events' | 'pass'

/**
 * What free mode does with a request: `ai` is answered on the device (403), `write` is answered on the device (204),
 * `guest-ai` and `events` go out without an account, `pass` goes out as it is (reads of text, covers, the catalogue;
 * sign-in).
 */
export function freeModeVerdict(rawUrl: string, method: string, origin: string): FreeModeVerdict {
  let url: URL
  try { url = new URL(rawUrl, origin) } catch { return 'pass' }
  const write = !/^(?:GET|HEAD|OPTIONS)$/i.test(method || 'GET')
  const sameOrigin = url.origin === origin
  if (sameOrigin && url.pathname === GUEST_AI_ROUTE && /^POST$/i.test(method || 'GET')) return 'guest-ai'
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

/** Wrap `fetch` and `sendBeacon` so free mode reaches no AI but the guest companion, no narration and no account. Idempotent. */
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
    if (verdict === 'events' || verdict === 'guest-ai') {
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
