/**
 * Reading time you can trust (social brief, ship 1): the rules shared by the
 * Worker and the reader. Pure functions only.
 *
 * The ledger (`public.reading_time`) holds seconds read and listened per
 * reader, per reader-local day, per book. The Worker credits heartbeats under
 * the limits below; every figure the reader sees (the account sheet, Your
 * reading, and later profiles and the leaderboard) is computed from the ledger
 * rows by `readingTimeStats`.
 */
import { isUserBookId } from '../lab/userBook/userBookId'

/** At most one heartbeat per reader in this window (the Worker's gate). */
export const BEAT_MIN_GAP_MS = 50_000
/** At most this many seconds credited per heartbeat. */
export const BEAT_MAX_SECONDS = 60
/** At most this many seconds credited per reader-local day (all books). */
export const DAILY_CAP_SECONDS = 16 * 3600
/** Book id of time counted before the ledger existed. Not a day's reading. */
export const EARLIER_BOOK_ID = '_earlier'
/**
 * The one book id all of a reader's own books (`userbook-<hex>`) are recorded
 * under: their time counts, their ids never reach the account (privateBook.ts).
 */
export const PRIVATE_BOOK_ID = 'private'
/** The device tally (`reading-year-*`) started counting on this day. */
export const TALLY_STARTED_DAY = '2026-09-30'
/** A flush (offline or signed-out time) reaches back at most this many days. */
export const FLUSH_MAX_AGE_DAYS = 14
export const FLUSH_MAX_ENTRIES = 200

export interface LedgerRow {
  day: string
  bookId: string
  read: number
  listen: number
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/
const BOOK = /^[a-z0-9-]{1,80}$/

export function isDay(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = DAY.exec(value)
  if (!match) return false
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return date.toISOString().slice(0, 10) === value
}

export function isLedgerBookId(value: unknown): value is string {
  return typeof value === 'string' && BOOK.test(value)
}

/** The book id the ledger records: an own book (`userbook-<hex>`) becomes the private bucket. */
export function ledgerBookId(bookId: string): string {
  return isUserBookId(bookId) ? PRIVATE_BOOK_ID : bookId
}

/** The reader's own calendar date, YYYY-MM-DD, in the device's time zone. */
export function localDay(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  const ms = (value: string) => { const [y, m, d] = value.split('-').map(Number); return Date.UTC(y, m - 1, d) }
  return Math.round((ms(to) - ms(from)) / 86_400_000)
}

/** Monday of the calendar week holding `day`. */
export function weekStart(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  return addDays(day, -weekday)
}

/**
 * A reader-local date the Worker accepts as "today": local dates run from
 * UTC−12 to UTC+14, so the reader's today is the UTC day or one either side.
 */
export function plausibleToday(day: unknown, nowMs: number): day is string {
  if (!isDay(day)) return false
  return Math.abs(daysBetween(utcDay(nowMs), day)) <= 1
}

function seconds(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

export interface Beat {
  day: string
  bookId: string
  read: number
  listen: number
  /** Narration was playing during the beat; listening counts only then. */
  playing: boolean
}

/** Shape-checks a heartbeat body. */
export function parseBeat(raw: unknown, nowMs: number): Beat | null {
  if (!raw || typeof raw !== 'object') return null
  const body = raw as Record<string, unknown>
  if (!plausibleToday(body.day, nowMs) || !isLedgerBookId(body.bookId)) return null
  // An own book's id is never stored, even from an older client: it is the private bucket.
  return { day: body.day as string, bookId: ledgerBookId(body.bookId as string), read: seconds(body.read), listen: seconds(body.listen), playing: body.playing === true }
}

/**
 * What one heartbeat may credit: listening only while narration played, at
 * most BEAT_MAX_SECONDS in all, and never past the day's cap given what the
 * day already holds (`usedToday`, all books).
 */
export function creditBeat(beat: Pick<Beat, 'read' | 'listen' | 'playing'>, usedToday: number): { read: number; listen: number } {
  let listen = beat.playing ? Math.min(seconds(beat.listen), BEAT_MAX_SECONDS) : 0
  let read = Math.min(seconds(beat.read), BEAT_MAX_SECONDS - listen)
  const room = Math.max(0, DAILY_CAP_SECONDS - seconds(usedToday))
  listen = Math.min(listen, room)
  read = Math.min(read, room - listen)
  return { read, listen }
}

export interface FlushEntry { day: string; bookId: string; read: number; listen: number }
export interface Flush { flushId: string; entries: FlushEntry[]; earlier: number }

/**
 * Shape-checks a flush of time counted while signed out or offline: dated
 * entries from the last FLUSH_MAX_AGE_DAYS (summed per day and book, each day
 * capped), plus undated time from before the ledger (`earlier`).
 */
export function parseFlush(raw: unknown, nowMs: number): Flush | null {
  if (!raw || typeof raw !== 'object') return null
  const body = raw as Record<string, unknown>
  if (typeof body.flushId !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(body.flushId)) return null
  if (body.entries !== undefined && !Array.isArray(body.entries)) return null
  const list = (body.entries as unknown[] | undefined) ?? []
  if (list.length > FLUSH_MAX_ENTRIES) return null
  const today = utcDay(nowMs)
  const merged = new Map<string, FlushEntry>()
  for (const item of list) {
    if (!item || typeof item !== 'object') return null
    const entry = item as Record<string, unknown>
    if (!isDay(entry.day) || !isLedgerBookId(entry.bookId)) return null
    const age = daysBetween(entry.day as string, today)
    if (age < -1 || age > FLUSH_MAX_AGE_DAYS) continue
    const bookId = ledgerBookId(entry.bookId as string)
    const key = `${entry.day}|${bookId}`
    const prev = merged.get(key) ?? { day: entry.day as string, bookId, read: 0, listen: 0 }
    prev.read = Math.min(DAILY_CAP_SECONDS, prev.read + seconds(entry.read))
    prev.listen = Math.min(DAILY_CAP_SECONDS, prev.listen + seconds(entry.listen))
    merged.set(key, prev)
  }
  const entries = [...merged.values()].filter(entry => entry.read + entry.listen > 0)
  return { flushId: body.flushId, entries, earlier: seconds(body.earlier) }
}

/** The day that carries the merged reading-year total of `year`. */
export function earlierDayForYear(year: number): string {
  const first = `${year}-01-01`
  return first > TALLY_STARTED_DAY ? first : TALLY_STARTED_DAY
}

/** Years whose reading-year totals are merged into the ledger, oldest first. */
export function importYears(nowMs: number): number[] {
  const first = Number(TALLY_STARTED_DAY.slice(0, 4))
  const last = new Date(nowMs).getUTCFullYear()
  const years: number[] = []
  for (let year = first; year <= last; year += 1) years.push(year)
  return years
}

/**
 * The total a reading-year row holds (the sum over its devices), capped at
 * what a reader could plausibly have read since the tally started.
 */
export function readingYearSeconds(value: unknown, year: number, nowMs: number): number {
  if (!value || typeof value !== 'object') return 0
  const src = value as { year?: unknown; devices?: unknown }
  if (src.year !== year || !src.devices || typeof src.devices !== 'object') return 0
  let total = 0
  for (const device of Object.values(src.devices as Record<string, unknown>)) {
    if (device && typeof device === 'object') total += seconds((device as { seconds?: unknown }).seconds)
  }
  const days = Math.max(1, daysBetween(earlierDayForYear(year), utcDay(nowMs)) + 1)
  return Math.min(total, days * DAILY_CAP_SECONDS)
}

export interface ReadingTimeStats {
  /** Reading and listening, all time, including time from before the ledger. */
  totalSeconds: number
  readSeconds: number
  listenSeconds: number
  /** The first day with any time (null when there is none). */
  firstDay: string | null
  /** Time from before the ledger (`_earlier`): in the totals, on no day, week or streak. */
  earlierSeconds: number
  /** The first real day in the ledger (null when there is none). */
  firstDailyDay: string | null
  /** Today and the six days before, oldest first. */
  last7: Array<{ day: string; seconds: number }>
  last7Seconds: number
  /** Consecutive days with reading, ending today (or yesterday, before today's first minute). */
  streak: number
  longestStreak: number
  /** Twelve calendar weeks, Monday to Sunday, oldest first; the last is this week. */
  weeks: Array<{ start: string; seconds: number }>
  /** Seconds per book (all time) and the last day it was read. */
  books: Array<{ bookId: string; seconds: number; listenSeconds: number; lastDay: string | null }>
}

/**
 * Every figure, from ledger rows and the reader's own today.
 *
 * The 7-day window is today and the six days before by the reader's current
 * date. A day written while the reader was in a time zone ahead (after a
 * flight west, the ledger can already hold "tomorrow") ends the window
 * instead, so time is never dropped and the window stays seven dates.
 */
export function readingTimeStats(rows: LedgerRow[], today: string): ReadingTimeStats {
  const perDay = new Map<string, number>()
  const perBook = new Map<string, { seconds: number; listenSeconds: number; lastDay: string | null }>()
  let readSeconds = 0, listenSeconds = 0
  let firstDay: string | null = null, firstDailyDay: string | null = null
  let earlierSeconds = 0
  for (const row of rows) {
    const read = seconds(row.read), listen = seconds(row.listen)
    const total = read + listen
    if (total <= 0) continue
    readSeconds += read
    listenSeconds += listen
    if (!firstDay || row.day < firstDay) firstDay = row.day
    if (row.bookId === EARLIER_BOOK_ID) { earlierSeconds += total; continue }
    if (!firstDailyDay || row.day < firstDailyDay) firstDailyDay = row.day
    perDay.set(row.day, (perDay.get(row.day) ?? 0) + total)
    const book = perBook.get(row.bookId) ?? { seconds: 0, listenSeconds: 0, lastDay: null }
    book.seconds += total
    book.listenSeconds += listen
    if (!book.lastDay || row.day > book.lastDay) book.lastDay = row.day
    perBook.set(row.bookId, book)
  }
  const ahead = addDays(today, 1)
  const end = perDay.has(ahead) ? ahead : today
  const last7 = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(end, index - 6)
    return { day, seconds: perDay.get(day) ?? 0 }
  })
  let streak = 0
  for (let day = perDay.has(end) ? end : addDays(end, -1); (perDay.get(day) ?? 0) > 0; day = addDays(day, -1)) streak += 1
  let longestStreak = 0, run = 0, previous: string | null = null
  for (const day of [...perDay.keys()].sort()) {
    run = previous && daysBetween(previous, day) === 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = day
  }
  const thisWeek = weekStart(end)
  const weeks = Array.from({ length: 12 }, (_, index) => ({ start: addDays(thisWeek, (index - 11) * 7), seconds: 0 }))
  for (const [day, total] of perDay) {
    const index = 11 - Math.round(daysBetween(weekStart(day), thisWeek) / 7)
    if (index >= 0 && index < 12) weeks[index].seconds += total
  }
  const books = [...perBook.entries()]
    .map(([bookId, book]) => ({ bookId, ...book }))
    .sort((a, b) => (b.lastDay ?? '').localeCompare(a.lastDay ?? '') || b.seconds - a.seconds)
  return {
    totalSeconds: readSeconds + listenSeconds,
    readSeconds,
    listenSeconds,
    firstDay,
    earlierSeconds,
    firstDailyDay,
    last7,
    last7Seconds: last7.reduce((sum, item) => sum + item.seconds, 0),
    streak,
    longestStreak,
    weeks,
    books,
  }
}

/**
 * A book is finished when the reader reached the end of its last chapter:
 * the position record marks that chapter finished. Books whose structure is
 * unknown are never counted.
 */
export function finishedBookIds(finished: Record<string, number[]> | null | undefined, lastChapter: (bookId: string) => number | null | undefined): string[] {
  const ids: string[] = []
  for (const [bookId, chapters] of Object.entries(finished ?? {})) {
    const last = lastChapter(bookId)
    if (typeof last === 'number' && last > 0 && Array.isArray(chapters) && chapters.includes(last)) ids.push(bookId)
  }
  return ids.sort()
}

/** "6h 10m" parts for the large figure: hours and minutes, whole. */
export function hoursMinutes(totalSeconds: number): { hours: number; minutes: number } {
  const minutes = Math.floor(seconds(totalSeconds) / 60)
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}

/** Plain duration: "45 m", "6 h 10 m", or "41 h" from ten hours on. */
export function formatDuration(totalSeconds: number): string {
  const { hours, minutes } = hoursMinutes(totalSeconds)
  if (hours === 0) return `${minutes} m`
  if (hours >= 10) return `${hours} h`
  return minutes ? `${hours} h ${minutes} m` : `${hours} h`
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "30 September" */
export function formatDayMonth(day: string): string {
  const [, m, d] = day.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

/** "6-day streak · 41 h since 30 September" (parts left out when there is nothing to say). */
export function factsLine(stats: Pick<ReadingTimeStats, 'streak' | 'totalSeconds' | 'firstDay'>): string {
  const parts: string[] = []
  if (stats.streak >= 2) parts.push(`${stats.streak}-day streak`)
  if (stats.totalSeconds >= 60 && stats.firstDay) parts.push(`${formatDuration(stats.totalSeconds)} since ${formatDayMonth(stats.firstDay)}`)
  return parts.join(' · ')
}

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/**
 * The books comparison: "About six Frankensteins, start to finish." Total
 * hours divided by that book's estimated reading time. Null below one book.
 */
export function booksComparison(totalSeconds: number, book: { title: string; minutes: number | null } | null): string | null {
  if (!book || !book.minutes || book.minutes <= 0) return null
  const times = Math.round(seconds(totalSeconds) / 60 / book.minutes)
  if (times < 1) return null
  const count = times < NUMBER_WORDS.length ? NUMBER_WORDS[times] : times.toLocaleString('en-US')
  const title = book.title.trim()
  // A one-word title counts as itself ("six Frankensteins"); others as readings of it.
  const single = /^[A-Z][A-Za-z-]+$/.test(title)
  if (single) return `About ${count} ${times === 1 || /s$/.test(title) ? title : `${title}s`}, start to finish.`
  return `About ${count} ${times === 1 ? 'reading' : 'readings'} of ${title}, start to finish.`
}
