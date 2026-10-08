/**
 * The signed-in reader's private copies of their own books in their account
 * (`/api/user-books`, worker/routes/userBooks.ts): the list, one file's bytes,
 * and the reader's place in each book (`/api/user-books/places`). Only the
 * owner reaches any of it; a place carries the chapter, paragraph, word, time
 * and whole-book percent, never the book's title or text, and never goes to
 * the shared position stores.
 *
 * Every call answers null when the account cannot be asked (signed out,
 * offline, a server error): callers keep what this device has.
 */
import { supabase } from '../../services/supabase'

export interface AccountBook {
  id: string
  type: 'pdf' | 'epub'
  name: string
  title: string
  author: string
  size: number
  sha256: string
  createdAt: string
}

export interface AccountPlace {
  chapterNumber: number
  paragraphIndex: number
  wordIndex: number
  updatedAt: number
  percent?: number
  /** The conversion rules the place was read under (userEdition.ts; userBookPlace.ts). */
  converter?: number
  rev: number
}

export type FetchLike = typeof fetch

/** The session's access token, refreshed by the auth client when it has lapsed; null signed out. */
export async function ownBookToken(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  } catch {
    return null
  }
}

const authorized = (token: string, init: RequestInit = {}): RequestInit => ({
  ...init,
  cache: 'no-store',
  credentials: 'same-origin',
  headers: { ...(init.headers as Record<string, string> | undefined), Authorization: `Bearer ${token}` },
})

/** The account's books (metadata only); null when the list cannot be read. */
export async function listAccountBooks(token: string | null, fetchImpl: FetchLike = fetch): Promise<AccountBook[] | null> {
  if (!token) return null
  try {
    const response = await fetchImpl('/api/user-books', authorized(token))
    if (!response.ok) return null
    const data = await response.json() as { books?: unknown }
    if (!Array.isArray(data.books)) return null
    return data.books.filter((book): book is AccountBook => !!book && typeof book === 'object'
      && ((book as AccountBook).type === 'epub' || (book as AccountBook).type === 'pdf')
      && typeof (book as AccountBook).sha256 === 'string' && /^[0-9a-f]{64}$/.test((book as AccountBook).sha256))
      .map(book => ({ ...book, id: typeof book.id === 'string' ? book.id : '', name: typeof book.name === 'string' ? book.name : '', title: typeof book.title === 'string' ? book.title : '', author: typeof book.author === 'string' ? book.author : '', createdAt: typeof book.createdAt === 'string' ? book.createdAt : '' }))
  } catch {
    return null
  }
}

/** The key Add a book gives a file on this device and in the account: `<type>:<first 24 hex digits of its SHA-256>`. */
export const accountBookKey = (book: Pick<AccountBook, 'type' | 'sha256'>) => `${book.type}:${book.sha256.slice(0, 24)}`

async function sha256Prefix(bytes: ArrayBuffer): Promise<string | null> {
  try {
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].slice(0, 12).map(byte => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

export type AccountCopy =
  | { status: 'found'; book: AccountBook; bytes: ArrayBuffer }
  /** The account has this book as a PDF: Add a book's viewer opens it. */
  | { status: 'pdf' }
  /** The account was asked and has no such book. */
  | { status: 'gone' }
  /** The account could not be asked, or the file could not be fetched intact. */
  | { status: 'unavailable' }

/**
 * One EPUB's bytes from the account, checked against the book's hex (the
 * first 24 hex digits of the file's SHA-256) before they are used.
 */
export async function fetchAccountCopy(hex: string, token: string | null, fetchImpl: FetchLike = fetch): Promise<AccountCopy> {
  const books = await listAccountBooks(token, fetchImpl)
  if (!books || !token) return { status: 'unavailable' }
  const book = books.find(item => item.type === 'epub' && item.id && item.sha256.startsWith(hex))
  if (!book) return books.some(item => item.type === 'pdf' && item.sha256.startsWith(hex)) ? { status: 'pdf' } : { status: 'gone' }
  try {
    const response = await fetchImpl(`/api/user-books/${encodeURIComponent(book.id)}`, authorized(token))
    if (response.status === 404) return { status: 'gone' }
    if (!response.ok) return { status: 'unavailable' }
    const bytes = await response.arrayBuffer()
    // A truncated or altered download is never kept or converted.
    if (await sha256Prefix(bytes) !== hex.slice(0, 24)) return { status: 'unavailable' }
    return { status: 'found', book, bytes }
  } catch {
    return { status: 'unavailable' }
  }
}

function accountPlace(value: unknown): AccountPlace | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const whole = (field: unknown, min = 0) => Number.isInteger(field) && (field as number) >= min
  if (!whole(raw.chapterNumber, 1) || !whole(raw.paragraphIndex) || !whole(raw.wordIndex) || !whole(raw.updatedAt, 1) || !whole(raw.rev, 1)) return null
  const place: AccountPlace = { chapterNumber: raw.chapterNumber as number, paragraphIndex: raw.paragraphIndex as number, wordIndex: raw.wordIndex as number, updatedAt: raw.updatedAt as number, rev: raw.rev as number }
  if (typeof raw.percent === 'number' && Number.isFinite(raw.percent)) place.percent = Math.max(0, Math.min(100, raw.percent))
  if (whole(raw.converter, 1)) place.converter = raw.converter as number
  return place
}

/** Every place the account keeps, by book hex; null when they cannot be read. */
export async function fetchAccountPlaces(token: string | null, fetchImpl: FetchLike = fetch): Promise<Record<string, AccountPlace> | null> {
  if (!token) return null
  try {
    const response = await fetchImpl('/api/user-books/places', authorized(token))
    if (!response.ok) return null
    const data = await response.json() as { places?: Record<string, unknown> }
    const out: Record<string, AccountPlace> = {}
    for (const [hex, value] of Object.entries(data.places ?? {})) {
      const place = accountPlace(value)
      if (place && /^[0-9a-f]{24}$/.test(hex)) out[hex] = place
    }
    return out
  } catch {
    return null
  }
}

export type PlaceWrite =
  | { status: 'saved'; place: AccountPlace }
  /** The account holds a newer revision (`place`, or none any more). */
  | { status: 'conflict'; place: AccountPlace | null }
  /** The book is not in the account (removed, or never saved there). */
  | { status: 'gone' }
  | { status: 'unavailable' }

/** Save one place, naming the revision this device last read (0 for none). */
export async function putAccountPlace(
  hex: string,
  place: Omit<AccountPlace, 'rev'>,
  rev: number,
  token: string | null,
  options: { fetchImpl?: FetchLike; keepalive?: boolean } = {},
): Promise<PlaceWrite> {
  if (!token) return { status: 'unavailable' }
  const fetchImpl = options.fetchImpl ?? fetch
  try {
    const response = await fetchImpl(`/api/user-books/places/${encodeURIComponent(hex)}`, authorized(token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place, rev }),
      ...(options.keepalive ? { keepalive: true } : {}),
    }))
    if (response.status === 404) return { status: 'gone' }
    const data = await response.json().catch(() => null) as { place?: unknown } | null
    if (response.status === 409) return { status: 'conflict', place: accountPlace(data?.place) }
    const saved = response.ok ? accountPlace(data?.place) : null
    return saved ? { status: 'saved', place: saved } : { status: 'unavailable' }
  } catch {
    return { status: 'unavailable' }
  }
}
