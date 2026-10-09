/**
 * The lifecycle email rules (docs/lifecycle-emails/README.md, "The emails" and
 * "Global rules"), as pure functions over one reader's facts and send log, so
 * every trigger and suppression rule is testable without a database.
 */

export const HOUR = 3600 * 1000
export const DAY = 24 * HOUR

/** "Quiet readers only": nothing but welcome and the trial notices within 48 h of reading. */
export const QUIET_READER_MS = 48 * HOUR
/** "At most one lifecycle email every 3 days per reader." */
export const FREQUENCY_MS = 3 * DAY
/** keep-reading: "3 days without reading a started book", "at most weekly". */
export const KEEP_READING_IDLE_MS = 3 * DAY
export const KEEP_READING_GAP_MS = 7 * DAY
/** "Stop after 2 ignored." */
export const KEEP_READING_MAX_IGNORED = 2
/** Trial notices: day 25 (ending) and day 30 (ended), from real sign-up. */
export const TRIAL_DAYS = 30
export const TRIAL_ENDING_DAY = 25
/** A notice blocked by the 3-day rule waits, but not past these days. */
export const TRIAL_ENDING_LAST_DAY = 29
export const TRIAL_ENDED_LAST_DAY = 36
/** "None between 21:00 and 08:00 in the reader's time zone." */
export const QUIET_HOURS = { from: 21, to: 8 }
export const DEFAULT_TIME_ZONE = 'Europe/Copenhagen'
/**
 * The send log only remembers 24 months: email_log rows are deleted 24 months
 * after sent_at (routes/retention.ts, privacy notice). A log row is the only
 * proof an email went out, so the rules never plan an email whose earlier
 * send could be older than this horizon. 700 days sits a month inside 24
 * months, which also absorbs a device clock running ahead of the server.
 */
export const LOG_HORIZON_MS = 700 * DAY

export type OptInTemplate = 'keep-reading' | 'keep-reading-with-question' | 'next-book' | 'next-book-classic-lead'
export type ServiceTemplate = 'welcome' | 'welcome-google' | 'trial-ending' | 'trial-ended' | 'announce'
export type LifecycleTemplate = OptInTemplate | ServiceTemplate

export const OPT_IN_TEMPLATES: ReadonlySet<string> = new Set<OptInTemplate>(['keep-reading', 'keep-reading-with-question', 'next-book', 'next-book-classic-lead'])

export interface LogRow {
  template: string
  book_id: string | null
  dedupe_key: string
  sent_at: string
  meta?: Record<string, unknown> | null
}

export interface ReaderPlace {
  bookId: string
  updatedAt: number
  sequentialChapter: number
  paragraphIndex: number
}

export interface ReaderFacts {
  userId: string
  email: string
  /** Real sign-up (profiles.created_at): the trial clock. */
  createdAt: number
  timeZone: string
  /** Ticked the consent box (or switched reading emails on later) and has not unsubscribed since. */
  optedIn: boolean
  /** Ship 2's confirmed email: true / false, or null when the column does not exist yet. */
  confirmed: boolean | null
  subscribed: boolean
  /** Latest reading anywhere (the position record), or null. */
  lastReadAt: number | null
  /** Started books, newest first, without hidden and finished ones. */
  places: ReaderPlace[]
  /** Books whose last chapter is finished, newest place first. */
  finished: ReaderPlace[]
  /** Every book with a place, a finished chapter or a recent chapter. */
  opened: ReadonlySet<string>
  log: LogRow[]
}

const sentAt = (row: LogRow) => Date.parse(row.sent_at)

export function localHour(now: number, timeZone: string): number {
  const format = (zone: string) => Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: zone }).format(new Date(now)))
  try { return format(timeZone) } catch { return format(DEFAULT_TIME_ZONE) }
}

export function inQuietHours(now: number, timeZone: string): boolean {
  const hour = localHour(now, timeZone)
  return hour >= QUIET_HOURS.from || hour < QUIET_HOURS.to
}

export function readRecently(facts: Pick<ReaderFacts, 'lastReadAt'>, now: number): boolean {
  return facts.lastReadAt !== null && now - facts.lastReadAt < QUIET_READER_MS
}

export function sentWithinFrequency(log: LogRow[], now: number): boolean {
  return log.some(row => now - sentAt(row) < FREQUENCY_MS)
}

export function alreadySent(log: LogRow[], dedupeKey: string): boolean {
  return log.some(row => row.dedupe_key === dedupeKey)
}

/**
 * True when no row of this reader's log can have expired yet: the account is
 * younger than the horizon, and every row is newer than the account. Only then
 * does a missing once-per-book key prove the email was never sent.
 */
export function logComplete(facts: Pick<ReaderFacts, 'createdAt'>, now: number): boolean {
  return Number.isFinite(facts.createdAt) && now - facts.createdAt < LOG_HORIZON_MS
}

/** Opt-in emails need the consent box and a confirmed email (ship 2). Missing column = not confirmed. */
export function mayReceiveOptIn(facts: Pick<ReaderFacts, 'optedIn' | 'confirmed'>): boolean {
  return facts.optedIn && facts.confirmed === true
}

export function trialEndsAt(facts: Pick<ReaderFacts, 'createdAt'>): number {
  return facts.createdAt + TRIAL_DAYS * DAY
}

export type TrialPlan = { template: 'trial-ending' | 'trial-ended'; dedupeKey: string }

export function planTrialNotice(facts: ReaderFacts, now: number): TrialPlan | null {
  if (facts.subscribed) return null
  const day = (now - facts.createdAt) / DAY
  if (day >= TRIAL_DAYS && day < TRIAL_ENDED_LAST_DAY + 1) {
    return alreadySent(facts.log, 'trial-ended:-') ? null : { template: 'trial-ended', dedupeKey: 'trial-ended:-' }
  }
  if (day >= TRIAL_ENDING_DAY && day < TRIAL_ENDING_LAST_DAY + 1) {
    return alreadySent(facts.log, 'trial-ending:-') ? null : { template: 'trial-ending', dedupeKey: 'trial-ending:-' }
  }
  return null
}

const keepReadingRows = (log: LogRow[], bookId?: string) =>
  log.filter(row => (row.template === 'keep-reading' || row.template === 'keep-reading-with-question') && (bookId === undefined || row.book_id === bookId))

/** keep-reading emails for this book the reader has not answered by reading it since. */
export function ignoredKeepReading(log: LogRow[], place: ReaderPlace): number {
  return keepReadingRows(log, place.bookId).filter(row => sentAt(row) >= place.updatedAt).length
}

export function nextBookKey(bookId: string): string {
  return `next-book:${bookId}`
}

export type ReadingPlan =
  | { kind: 'next-book'; opening: 'finished' | 'stalled'; source: ReaderPlace; dedupeKey: string }
  | { kind: 'keep-reading'; place: ReaderPlace; dedupeKey: string }

/**
 * The opt-in emails due for this reader now, in priority order; the sweep
 * sends the first one it can fill (consent, quiet hours,
 * frequency and quiet-reader rules are applied by `planLifecycle`).
 *
 * 1. Finished a book → one next-book for it (finished opening).
 * 2. The last-read started book, 3 days untouched → keep-reading, at most
 *    weekly; after 2 ignored → one stalled next-book for that book; then nothing.
 *
 * Each email is logged per template family and book; keep-reading's key also
 * carries the reading episode (the place's time) and its count, which is how
 * "never the same template/book pair twice" and "stop after 2 ignored" agree.
 *
 * The log keeps 24 months (LOG_HORIZON_MS), so nothing is planned that an
 * expired row could have blocked: next-book's key is once per book, ever, so
 * it needs a complete log (an account younger than the horizon); keep-reading
 * and the stalled next-book are only about a place touched within the horizon,
 * since every email about that place was sent after it.
 */
export function readingCandidates(facts: ReaderFacts, now: number): ReadingPlan[] {
  const candidates: ReadingPlan[] = []
  const complete = logComplete(facts, now)
  if (complete) {
    for (const source of facts.finished) {
      const key = nextBookKey(source.bookId)
      if (!alreadySent(facts.log, key)) candidates.push({ kind: 'next-book', opening: 'finished', source, dedupeKey: key })
    }
  }
  const place = facts.places[0]
  if (!place || now - place.updatedAt < KEEP_READING_IDLE_MS) return candidates
  if (now - place.updatedAt >= LOG_HORIZON_MS) return candidates
  const stalledKey = nextBookKey(place.bookId)
  if (alreadySent(facts.log, stalledKey)) return candidates
  const ignored = ignoredKeepReading(facts.log, place)
  if (ignored >= KEEP_READING_MAX_IGNORED) {
    if (complete) candidates.push({ kind: 'next-book', opening: 'stalled', source: place, dedupeKey: stalledKey })
    return candidates
  }
  const latest = Math.max(-Infinity, ...keepReadingRows(facts.log).map(sentAt))
  if (now - latest >= KEEP_READING_GAP_MS) candidates.push({ kind: 'keep-reading', place, dedupeKey: `keep-reading:${place.bookId}:${place.updatedAt}:${ignored + 1}` })
  return candidates
}

export type LifecyclePlan =
  | { kind: 'trial'; plan: TrialPlan }
  | { kind: 'reading'; candidates: ReadingPlan[] }

export type Suppressed = 'quiet-hours' | 'frequency' | 'none-due' | 'no-consent' | 'read-recently'

/** One sweep's decision for one reader: at most one email. */
export function planLifecycle(facts: ReaderFacts, now: number, switches: { trialNotices: boolean }): LifecyclePlan | { kind: 'skip'; reason: Suppressed } {
  if (inQuietHours(now, facts.timeZone)) return { kind: 'skip', reason: 'quiet-hours' }
  if (sentWithinFrequency(facts.log, now)) return { kind: 'skip', reason: 'frequency' }
  if (switches.trialNotices) {
    const trial = planTrialNotice(facts, now)
    if (trial) return { kind: 'trial', plan: trial }
  }
  if (!mayReceiveOptIn(facts)) return { kind: 'skip', reason: 'no-consent' }
  if (readRecently(facts, now)) return { kind: 'skip', reason: 'read-recently' }
  const candidates = readingCandidates(facts, now)
  return candidates.length ? { kind: 'reading', candidates } : { kind: 'skip', reason: 'none-due' }
}
