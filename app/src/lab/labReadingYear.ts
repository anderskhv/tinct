import { supabase } from '../services/supabase'
import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'

/**
 * "This year" reading totals for the account sheet: hours read, pages read
 * forward and distinct books, across every device.
 *
 * Each device only ever raises its own counters, and totals are the sum over
 * devices (books: the union), so two devices syncing through the versioned
 * `commit_user_data` row can never lose each other's reading. Signed out, the
 * tally stays on this device under a guest key.
 */
export interface ReadingYearDevice { seconds: number; pages: number; books: string[] }
export interface ReadingYearState { v: 1; year: number; devices: Record<string, ReadingYearDevice> }
export interface ReadingYearTotals { seconds: number; pages: number; books: number }

const MAX_BOOKS = 500

export function readingYearKey(year: number): string {
  return `reading-year-${year}`
}

export function emptyReadingYear(year: number): ReadingYearState {
  return { v: 1, year, devices: {} }
}

function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

export function parseReadingYear(raw: unknown, year: number): ReadingYearState {
  const state = emptyReadingYear(year)
  if (!raw || typeof raw !== 'object') return state
  const src = raw as { year?: unknown; devices?: unknown }
  if (src.year !== year || !src.devices || typeof src.devices !== 'object') return state
  for (const [id, value] of Object.entries(src.devices as Record<string, unknown>)) {
    if (!id || id.length > 80 || !value || typeof value !== 'object') continue
    const device = value as { seconds?: unknown; pages?: unknown; books?: unknown }
    const books = Array.isArray(device.books) ? device.books.filter((book): book is string => typeof book === 'string' && book.length > 0 && book.length <= 120) : []
    state.devices[id] = { seconds: count(device.seconds), pages: count(device.pages), books: [...new Set(books)].slice(0, MAX_BOOKS) }
  }
  return state
}

/** Per device: the larger counters and the union of books. Commutative and idempotent. */
export function mergeReadingYear(a: ReadingYearState, b: ReadingYearState): ReadingYearState {
  const merged = emptyReadingYear(a.year)
  for (const id of new Set([...Object.keys(a.devices), ...Object.keys(b.devices)])) {
    const x = a.devices[id], y = b.devices[id]
    merged.devices[id] = {
      seconds: Math.max(x?.seconds ?? 0, y?.seconds ?? 0),
      pages: Math.max(x?.pages ?? 0, y?.pages ?? 0),
      books: [...new Set([...(x?.books ?? []), ...(y?.books ?? [])])].slice(0, MAX_BOOKS),
    }
  }
  return merged
}

export function readingYearTotals(state: ReadingYearState): ReadingYearTotals {
  const books = new Set<string>()
  let seconds = 0, pages = 0
  for (const device of Object.values(state.devices)) {
    seconds += device.seconds
    pages += device.pages
    device.books.forEach(book => books.add(book))
  }
  return { seconds, pages, books: books.size }
}

/** Adds this device's reading. Only ever raises its own entry. */
export function recordReading(state: ReadingYearState, deviceId: string, input: { seconds?: number; pages?: number; bookId?: string }): ReadingYearState {
  const own = state.devices[deviceId] ?? { seconds: 0, pages: 0, books: [] }
  const next: ReadingYearDevice = {
    seconds: own.seconds + count(input.seconds),
    pages: own.pages + count(input.pages),
    books: input.bookId && count(input.pages) > 0 && !own.books.includes(input.bookId) ? [...own.books, input.bookId].slice(0, MAX_BOOKS) : own.books,
  }
  return { ...state, devices: { ...state.devices, [deviceId]: next } }
}

/**
 * Pages read by a move: 1 (or 2 on a desktop spread) for a forward turn,
 * 0 for going back, jumps, repagination or another book.
 */
export function forwardPagesRead(
  previous: { bookId: string; chapter: number; page: number } | null,
  next: { bookId: string; chapter: number; page: number },
): number {
  if (!previous || previous.bookId !== next.bookId) return 0
  if (next.chapter === previous.chapter) {
    const step = next.page - previous.page
    return step === 1 || step === 2 ? step : 0
  }
  return next.chapter === previous.chapter + 1 && next.page === 0 ? 1 : 0
}

// Device copy: one entry per owner so a guest tally never lands on an account.
function localKey(year: number, owner: string | null): string {
  return `tinct:reading-year:${year}:${owner ?? 'guest'}`
}

export function readLocalReadingYear(year: number, owner: string | null): ReadingYearState {
  try {
    const raw = localStorage.getItem(localKey(year, owner))
    return parseReadingYear(raw ? JSON.parse(raw) : null, year)
  } catch {
    return emptyReadingYear(year)
  }
}

export function writeLocalReadingYear(state: ReadingYearState, owner: string | null): void {
  try { localStorage.setItem(localKey(state.year, owner), JSON.stringify(state)) } catch { /* private mode */ }
}

type SupabaseLike = NonNullable<typeof supabase>

/**
 * Merges the device copy with the account row and writes back when the
 * device knows more. A conflicting write is merged with the server row and
 * retried once. Returns the merged state (also saved on the device).
 */
export async function syncReadingYear(userId: string, local: ReadingYearState, client: SupabaseLike | null = supabase): Promise<ReadingYearState> {
  if (!client) return local
  const key = readingYearKey(local.year)
  const { data, error } = await client.from('user_data').select('key, value, rev').eq('user_id', userId).eq('key', key).maybeSingle()
  if (error) throw new Error(error.message)
  let remote = parseReadingYear((data as VersionedStorageRow | null)?.value ?? null, local.year)
  let rev = data ? coerceRev((data as VersionedStorageRow).rev) ?? 0 : null
  let merged = mergeReadingYear(local, remote)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (JSON.stringify(merged) === JSON.stringify(mergeReadingYear(remote, remote))) break
    const { data: written, error: writeError } = await client.rpc('commit_user_data', {
      p_user_id: userId, p_key: key, p_value: merged, p_expected_rev: rev,
    })
    if (writeError) throw new Error(writeError.message)
    const row = (Array.isArray(written) ? written[0] : written) as VersionedStorageRow | undefined
    if (versionedWriteApplied(row)) break
    remote = parseReadingYear(row?.value ?? null, local.year)
    rev = coerceRev(row?.rev) ?? rev
    merged = mergeReadingYear(merged, remote)
  }
  writeLocalReadingYear(merged, userId)
  return merged
}
