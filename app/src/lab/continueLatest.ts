/**
 * Continue opens the latest thing read on any device: a Tinct book or the
 * reader's own PDF/EPUB (Anders, option A, 19 Oct 2026). Desktop only for now
 * ("wait with phone in general"): on a phone this module decides nothing and
 * reads nothing, so the phone's /reader stays exactly as it was.
 *
 * `/reader` with no book resumes the registered book this device settled in
 * last (useLabPositionSync bootLabReading). Own books never write that shared
 * record, and still do not: here, before the reader paints anything, the
 * registered book's time is compared with the newest own-book place (this
 * device's, plus the account's private places when signed in). When an own
 * book is newer the page goes there instead, at its own place. The account is
 * asked for at most `CONTINUE_ACCOUNT_WAIT_MS`; slower, offline or signed out,
 * this device's places decide. Nothing is written anywhere.
 */
import { resumePlace } from './labPosition'
import { readLabPositionLocal } from './labPositionStore'
import { isLabPhoneSurface, labPhoneSurfaceInput } from './labChrome'
import { labLayoutOverride } from './labRoute'
import { readCachedSupabaseUser } from './labLibraryBoot'
import { LAB_READER_HANDOFF_KEY } from './labReaderHandoff'
import { ownReadingNow, ownSavedAt, readOwnShelf, type OwnShelfBook } from './userBook/ownShelf'
import { fetchAccountPlaceSets, ownBookToken } from './userBook/ownAccount'
import { ownBookHref } from './userBook/userBookId'
import { pdfEditionChoice } from './userBook/pdfEditions'
import { epubViewHere } from './userBook/epubView'

/** Longest the reader's first paint waits for the account's own-book places. */
export const CONTINUE_ACCOUNT_WAIT_MS = 1500

/** The account's own-book places, by hex: EPUBs' (`text`) and PDFs' (`pages`), each with `updatedAt`. */
export interface AccountOwnPlaces {
  text: Record<string, { updatedAt: number }>
  pages: Record<string, { updatedAt: number }>
}

export interface OwnContinue {
  hex: string
  kind: 'pdf' | 'epub'
  /** When it was last read (ms). */
  at: number
  /** Where it opens (ownBookHref): a PDF in the margin viewer or as its Tinct text, an EPUB as routed today. */
  href: string
}

/** Where an own book opens on this device, as My shelf and the reading table route it. */
export function ownContinueHref(hex: string, kind: 'pdf' | 'epub'): string {
  return ownBookHref(hex, kind, kind === 'pdf' ? pdfEditionChoice(hex) : epubViewHere(hex))
}

/**
 * The own book read most recently: this device's books being read (removed
 * from Currently reading excluded, as the library does) and the account's
 * places (a book read on another device). Null when none has a place.
 */
export function newestOwnBook(
  local: readonly OwnShelfBook[],
  account: AccountOwnPlaces | null,
  savedAt: (hex: string) => number | null = hex => ownSavedAt(hex),
): OwnContinue | null {
  const found = new Map<string, OwnContinue>()
  for (const book of ownReadingNow(local)) {
    const at = book.reading.lastActiveAt
    if (!(at > 0)) continue
    const known = found.get(book.hex)
    if (!known || at > known.at) found.set(book.hex, { hex: book.hex, kind: book.kind, at, href: book.href })
  }
  const fromAccount = (places: Record<string, { updatedAt: number }> | undefined, kind: 'pdf' | 'epub') => {
    for (const [hex, place] of Object.entries(places ?? {})) {
      const at = place?.updatedAt
      if (!/^[0-9a-f]{24}$/.test(hex) || typeof at !== 'number' || !(at > 0)) continue
      // Taken off Currently reading on this device since: it does not lead.
      const hidden = savedAt(hex)
      if (hidden && hidden >= at) continue
      const known = found.get(hex)
      if (known) { if (at > known.at) found.set(hex, { ...known, at }); continue }
      found.set(hex, { hex, kind, at, href: ownContinueHref(hex, kind) })
    }
  }
  if (account) {
    fromAccount(account.pages, 'pdf')
    fromAccount(account.text, 'epub')
  }
  let newest: OwnContinue | null = null
  for (const book of found.values()) if (!newest || book.at > newest.at) newest = book
  return newest
}

/** When this device last read the registered book `/reader` resumes; 0 for none. */
export function registeredReadAt(state = readLabPositionLocal()): number {
  const resume = resumePlace(state)
  if (!resume) return 0
  return Math.max(state.lastSettledAt || 0, resume.updatedAt || 0)
}

/** The own book to open instead of the registered one, or null: only when it was read later. */
export function continueChoice(registeredAt: number, own: OwnContinue | null): OwnContinue | null {
  return own && own.at > registeredAt ? own : null
}

/**
 * `/reader` that names no book: no query (a QA `?layout=` aside) and no
 * hand-off from the library, the switcher or a link waiting in this tab.
 */
export function readerNamesNoBook(pathname: string, search: string, session: Pick<Storage, 'getItem'> | null): boolean {
  const path = pathname.replace(/\/+$/, '')
  if (path !== '/reader') return false
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  for (const key of params.keys()) if (key !== 'layout') return false
  try {
    if (session?.getItem(LAB_READER_HANDOFF_KEY)) return false
  } catch { /* unreadable: nothing waits */ }
  return true
}

export interface ContinueLatestOptions {
  pathname: string
  search: string
  /** The reader's own surface test (labChrome isLabPhoneSurface); read from the browser when absent. */
  phone?: boolean
  owner?: string | null
  online?: boolean
  session?: Pick<Storage, 'getItem'> | null
  registeredAt?: () => number
  readLocal?: (owner: string) => Promise<OwnShelfBook[]>
  readAccount?: () => Promise<AccountOwnPlaces | null>
  savedAt?: (hex: string) => number | null
  timeoutMs?: number
}

function browserSession(): Pick<Storage, 'getItem'> | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage } catch { return null }
}

async function accountPlaces(): Promise<AccountOwnPlaces | null> {
  const token = await ownBookToken()
  return token ? fetchAccountPlaceSets(token) : null
}

/**
 * Where `/reader` with no book should go instead of resuming the registered
 * book: an own book read later, or null (open the reader as today). Phones,
 * pages that name a book, and signed-out readers get null at once.
 */
export async function continueLatestDestination(options: ContinueLatestOptions): Promise<string | null> {
  const phone = options.phone ?? isLabPhoneSurface(labPhoneSurfaceInput(labLayoutOverride(options.pathname, options.search)))
  if (phone) return null
  if (!readerNamesNoBook(options.pathname, options.search, options.session !== undefined ? options.session : browserSession())) return null
  const owner = options.owner !== undefined ? options.owner : readCachedSupabaseUser()?.id ?? null
  // Own books belong to an account (ownShelf readOwnShelf): signed out, there are none.
  if (!owner) return null
  const online = options.online ?? (typeof navigator === 'undefined' || navigator.onLine !== false)
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<'late'>(resolve => { timer = setTimeout(() => resolve('late'), options.timeoutMs ?? CONTINUE_ACCOUNT_WAIT_MS) })
  try {
    const localWork = (options.readLocal ?? readOwnShelf)(owner).catch(() => [] as OwnShelfBook[])
    const accountWork = online ? (options.readAccount ?? accountPlaces)().catch(() => null) : Promise.resolve(null)
    const [local, account] = await Promise.all([
      Promise.race([localWork, deadline.then(() => [] as OwnShelfBook[])]),
      Promise.race([accountWork, deadline.then(() => null)]),
    ])
    const own = newestOwnBook(local, account, options.savedAt)
    const chosen = continueChoice((options.registeredAt ?? registeredReadAt)(), own)
    return chosen ? chosen.href : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
