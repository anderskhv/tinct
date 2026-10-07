/**
 * The lifecycle email sweep (docs/lifecycle-emails/README.md): builds each
 * reader's facts, applies the rules (./rules.ts), fills the approved template
 * (./render.ts), reserves the send in the log (unique per reader + key, so a
 * template/book pair is never sent twice) and sends through Brevo.
 *
 * Every dependency is injected (./runtime.ts wires Supabase, the Durable
 * Objects, static assets and Brevo), so the tests drive it without a network.
 * Nothing here runs unless LIFECYCLE_EMAILS is on, and nothing reaches an
 * address that fails isLifecycleTestRecipient.
 */
import { finishedChaptersFor, type LabPositionState } from '../../lab/labPosition'
import { EMAIL_ART_BOOK_IDS } from './emailArt.generated'
import { chooseNextBook, type Acclaim, type CatalogueBook } from './nextBook'
import { renderEmail, TemplateFillError, type EmailVars, type RenderedEmail } from './render'
import { confirmUrl, EMAIL_ORIGIN, unsubscribeHeaders, unsubscribeUrl } from './links'
import {
  DAY,
  DEFAULT_TIME_ZONE,
  OPT_IN_TEMPLATES,
  planLifecycle,
  trialEndsAt,
  type LogRow,
  type ReaderFacts,
  type ReaderPlace,
  type ReadingPlan,
} from './rules'
import type { EmailTemplateName } from './templates.generated'

export const SENDER_ADDRESS = 'Tinct, Copenhagen, Denmark'
export const SENDER_NAME = 'Anders at Tinct'
export const CHECKOUT_URL = `${EMAIL_ORIGIN}/sign-in?mode=account`
export const LIBRARY_ART = { art_url: `${EMAIL_ORIGIN}/email-art/library.jpg`, art_alt: 'The Tinct library: shelves of old books by a tall window' }
/** Welcome waits a few minutes after sign-up so the reader's place has synced. */
export const WELCOME_DELAY_MS = 5 * 60 * 1000
export const WELCOME_WINDOW_MS = 48 * 3600 * 1000

export interface CatalogueEntry extends CatalogueBook {
  readingStructure?: { chapters?: Array<{ number: number }> } | null
}

export interface Profile {
  id: string
  email: string | null
  created_at: string
  [column: string]: unknown
}

export interface AuthUserInfo {
  provider: string | null
  firstName: string | null
}

export interface PreparedRecap {
  summary: string
  chapterNumber: number
  paragraphIndex: number
}

export interface OutgoingEmail extends RenderedEmail {
  to: string
  senderName: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface LifecycleDeps {
  now(): number
  linkSecret: string | null
  replyTo: string | null
  trialNotices: boolean
  isRecipientAllowed(email: string): boolean
  catalogue(): Promise<ReadonlyMap<string, CatalogueEntry>>
  hook(bookId: string): Promise<string | null>
  acclaim(bookId: string): Promise<Acclaim[] | null>
  position(userId: string): Promise<LabPositionState | null>
  preparedRecap(userId: string, bookId: string): Promise<PreparedRecap | null>
  authUser(userId: string): Promise<AuthUserInfo | null>
  /** reading_time rows since a day (ship 1); null when the ledger is missing. */
  readingTime(userId: string, sinceDay: string): Promise<Array<{ book_id: string; read_seconds: number; listen_seconds: number }> | null>
  /** The reader's send log, or null when email_log is missing (then nothing is sent). */
  log(userId: string): Promise<LogRow[] | null>
  /** Inserts the log row; false when the key exists already (or the insert failed). */
  reserve(userId: string, row: { template: string; book_id: string | null; dedupe_key: string; meta: Record<string, unknown> }): Promise<boolean>
  release(userId: string, dedupeKey: string): Promise<void>
  send(email: OutgoingEmail): Promise<boolean>
}

export interface SweepResult {
  considered: number
  sent: Array<{ userId: string; template: string; bookId: string | null }>
  skipped: Record<string, number>
}

function count(result: SweepResult, reason: string): void {
  result.skipped[reason] = (result.skipped[reason] ?? 0) + 1
}

// ---------------------------------------------------------------- facts ----

export function lastChapterOf(book: CatalogueEntry | undefined): number | null {
  const chapters = book?.readingStructure?.chapters ?? []
  const last = chapters.reduce((max, chapter) => Math.max(max, Number(chapter.number) || 0), 0)
  return last > 0 ? last : null
}

/** Opt-in: the consent box (or the settings switch) given after any unsubscribe. */
export function profileOptedIn(profile: Profile): boolean {
  if (profile.email_opt_in !== true) return false
  const optOut = typeof profile.email_opt_out_at === 'string' ? Date.parse(profile.email_opt_out_at) : NaN
  if (Number.isNaN(optOut)) return true
  const optIn = typeof profile.email_opt_in_at === 'string' ? Date.parse(profile.email_opt_in_at) : NaN
  return !Number.isNaN(optIn) && optIn > optOut
}

/** Ship 2's `email_confirmed_at`: null when the column does not exist yet. */
export function profileConfirmed(profile: Profile): boolean | null {
  if (!('email_confirmed_at' in profile)) return null
  return typeof profile.email_confirmed_at === 'string' && profile.email_confirmed_at.length > 0
}

export function profileSubscribed(profile: Profile): boolean {
  return profile.subscription_status === 'active' || profile.subscription_status === 'trialing'
}

export function profileTimeZone(profile: Profile): string {
  const zone = typeof profile.time_zone === 'string' ? profile.time_zone : typeof profile.timezone === 'string' ? profile.timezone : ''
  if (!zone) return DEFAULT_TIME_ZONE
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); return zone } catch { return DEFAULT_TIME_ZONE }
}

export function readerFacts(profile: Profile, position: LabPositionState | null, catalogue: ReadonlyMap<string, CatalogueEntry>, log: LogRow[]): ReaderFacts {
  const places: ReaderPlace[] = []
  const finished: ReaderPlace[] = []
  const opened = new Set<string>()
  let lastReadAt: number | null = null
  if (position) {
    for (const [bookId, place] of Object.entries(position.books ?? {})) {
      opened.add(bookId)
      const entry: ReaderPlace = { bookId, updatedAt: place.updatedAt, sequentialChapter: place.sequentialChapter, paragraphIndex: place.paragraphIndex }
      lastReadAt = Math.max(lastReadAt ?? 0, place.updatedAt)
      const last = lastChapterOf(catalogue.get(bookId))
      if (last !== null && finishedChaptersFor(position, bookId).has(last)) finished.push(entry)
      else if (!((position.hidden?.[bookId] ?? 0) >= place.updatedAt) && catalogue.has(bookId)) places.push(entry)
    }
    for (const bookId of Object.keys(position.finished ?? {})) opened.add(bookId)
    for (const bookId of Object.keys(position.recentChapters ?? {})) opened.add(bookId)
    if (position.lastSettledAt) lastReadAt = Math.max(lastReadAt ?? 0, position.lastSettledAt)
  }
  places.sort((a, b) => b.updatedAt - a.updatedAt)
  finished.sort((a, b) => b.updatedAt - a.updatedAt)
  return {
    userId: profile.id,
    email: profile.email ?? '',
    createdAt: Date.parse(profile.created_at),
    timeZone: profileTimeZone(profile),
    optedIn: profileOptedIn(profile),
    confirmed: profileConfirmed(profile),
    subscribed: profileSubscribed(profile),
    lastReadAt,
    places,
    finished,
    opened,
    log,
  }
}

// ------------------------------------------------------------- variables ----

export function readerUrl(bookId: string): string {
  return `${EMAIL_ORIGIN}/reader?book=${encodeURIComponent(bookId)}`
}

export function bookArt(bookId: string | null, title: string | null): { art_url: string; art_alt: string } {
  if (!bookId || !EMAIL_ART_BOOK_IDS.has(bookId)) return LIBRARY_ART
  return { art_url: `${EMAIL_ORIGIN}/email-art/${bookId}.jpg`, art_alt: `The painted cover of ${title ?? bookId}` }
}

export function localDate(ms: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone }).format(new Date(ms))
  } catch {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: DEFAULT_TIME_ZONE }).format(new Date(ms))
  }
}

function hoursPhrase(hours: number): string {
  return hours === 1 ? '1 hour' : `${hours} hours`
}

function listTitles(titles: string[]): string {
  const wrapped = titles.map(title => `<em>${title.replace(/[<>&]/g, '')}</em>`)
  if (wrapped.length <= 1) return wrapped.join('')
  return `${wrapped.slice(0, -1).join(', ')} and ${wrapped[wrapped.length - 1]}`
}

/** "This month you read for 6 hours and listened for 3, across <em>X</em> and <em>Y</em>." Empty under an hour. */
export function monthSummary(rows: Array<{ book_id: string; read_seconds: number; listen_seconds: number }> | null, catalogue: ReadonlyMap<string, CatalogueEntry>): string {
  if (!rows?.length) return ''
  let read = 0
  let listen = 0
  const perBook = new Map<string, number>()
  for (const row of rows) {
    read += Math.max(0, Number(row.read_seconds) || 0)
    listen += Math.max(0, Number(row.listen_seconds) || 0)
    const title = catalogue.get(row.book_id)?.title
    if (title) perBook.set(title, (perBook.get(title) ?? 0) + (Number(row.read_seconds) || 0) + (Number(row.listen_seconds) || 0))
  }
  if (read + listen < 3600) return ''
  const readHours = Math.round(read / 3600)
  const listenHours = Math.round(listen / 3600)
  const titles = [...perBook.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([title]) => title)
  const across = titles.length ? `, across ${listTitles(titles)}` : ''
  if (readHours > 0 && listenHours > 0) return `This month you read for ${hoursPhrase(readHours)} and listened for ${listenHours}${across}.`
  if (readHours > 0) return `This month you read for ${hoursPhrase(readHours)}${across}.`
  return `This month you listened for ${hoursPhrase(Math.max(1, listenHours))}${across}.`
}

/** Spoiler-safe: the prepared recap must not reach past the reader's place. */
export function recapWithinPlace(recap: PreparedRecap | null, place: ReaderPlace): string | null {
  if (!recap?.summary?.trim()) return null
  if (recap.chapterNumber > place.sequentialChapter) return null
  if (recap.chapterNumber === place.sequentialChapter && recap.paragraphIndex > place.paragraphIndex) return null
  return recap.summary.trim()
}

// ----------------------------------------------------------------- send ----

async function deliver(
  deps: LifecycleDeps,
  facts: Pick<ReaderFacts, 'userId' | 'email'>,
  template: EmailTemplateName,
  vars: EmailVars,
  log: { book_id: string | null; dedupe_key: string; meta?: Record<string, unknown> },
  result: SweepResult,
  options: { omitFeatures?: string[] } = {},
): Promise<boolean> {
  const optIn = OPT_IN_TEMPLATES.has(template)
  let unsubscribe = ''
  if (optIn) {
    if (!deps.linkSecret) { count(result, 'no-link-secret'); return false }
    unsubscribe = await unsubscribeUrl(deps.linkSecret, facts.userId)
  }
  let rendered: RenderedEmail
  try {
    rendered = renderEmail(template, { sender_address: SENDER_ADDRESS, ...(optIn ? { unsubscribe_url: unsubscribe } : {}), ...vars }, options)
  } catch (error) {
    if (error instanceof TemplateFillError) { count(result, 'unfilled'); console.error('[lifecycle]', error.message); return false }
    throw error
  }
  // The test gate, checked again at the last moment.
  if (!deps.isRecipientAllowed(facts.email)) { count(result, 'test-gate'); return false }
  if (!await deps.reserve(facts.userId, { template, book_id: log.book_id, dedupe_key: log.dedupe_key, meta: log.meta ?? {} })) {
    count(result, 'already-sent')
    return false
  }
  const ok = await deps.send({
    ...rendered,
    to: facts.email,
    senderName: SENDER_NAME,
    ...(deps.replyTo ? { replyTo: deps.replyTo } : {}),
    ...(optIn ? { headers: unsubscribeHeaders(unsubscribe) } : {}),
  })
  if (!ok) {
    await deps.release(facts.userId, log.dedupe_key)
    count(result, 'send-failed')
    return false
  }
  result.sent.push({ userId: facts.userId, template, bookId: log.book_id })
  return true
}

async function sendReadingPlan(deps: LifecycleDeps, facts: ReaderFacts, plan: ReadingPlan, catalogue: ReadonlyMap<string, CatalogueEntry>, result: SweepResult): Promise<boolean> {
  if (plan.kind === 'keep-reading') {
    const book = catalogue.get(plan.place.bookId)
    if (!book) return false
    const recap = recapWithinPlace(await deps.preparedRecap(facts.userId, plan.place.bookId), plan.place)
    if (!recap) { count(result, 'no-recap'); return false }
    // keep-reading-with-question needs a reviewed per-chapter question; none is published yet.
    return deliver(deps, facts, 'keep-reading', {
      subject: book.title,
      book_title: book.title,
      recap,
      continue_url: readerUrl(book.id),
      ...bookArt(book.id, book.title),
    }, { book_id: book.id, dedupe_key: plan.dedupeKey, meta: { place_at: plan.place.updatedAt } }, result)
  }
  const source = catalogue.get(plan.source.bookId)
  if (!source) return false
  const choice = await chooseNextBook({
    sourceId: source.id,
    sourceTitle: source.title,
    opening: plan.opening,
    opened: facts.opened,
    books: catalogue,
    loaders: { hook: id => deps.hook(id), acclaim: id => deps.acclaim(id) },
    startUrl: readerUrl,
    art: id => bookArt(id, catalogue.get(id)?.title ?? null),
  })
  if (!choice) { count(result, 'no-next-book'); return false }
  return deliver(deps, facts, choice.template, choice.vars, {
    book_id: source.id,
    dedupe_key: plan.dedupeKey,
    meta: { target: choice.targetId, opening: plan.opening },
  }, result)
}

async function sendTrialNotice(deps: LifecycleDeps, facts: ReaderFacts, template: 'trial-ending' | 'trial-ended', dedupeKey: string, catalogue: ReadonlyMap<string, CatalogueEntry>, result: SweepResult): Promise<boolean> {
  const ends = trialEndsAt(facts)
  const vars: EmailVars = { checkout_url: CHECKOUT_URL }
  if (template === 'trial-ending') {
    const date = localDate(ends, facts.timeZone)
    const since = new Date(facts.createdAt).toISOString().slice(0, 10)
    Object.assign(vars, { subject: `Your free month ends on ${date}`, trial_end_date: date, month_summary: monthSummary(await deps.readingTime(facts.userId, since), catalogue) })
  } else {
    vars.subject = 'Your free month has ended'
  }
  return deliver(deps, facts, template, vars, { book_id: null, dedupe_key: dedupeKey }, result)
}

// ---------------------------------------------------------------- sweeps ----

/** The hourly sweep: trial notices (switch) and the opt-in reading emails. */
export async function runLifecycleSweep(deps: LifecycleDeps, profiles: Profile[]): Promise<SweepResult> {
  const result: SweepResult = { considered: 0, sent: [], skipped: {} }
  const now = deps.now()
  let catalogue: ReadonlyMap<string, CatalogueEntry> | null = null
  for (const profile of profiles) {
    if (!profile.email || !deps.isRecipientAllowed(profile.email)) { count(result, 'test-gate'); continue }
    result.considered++
    const log = await deps.log(profile.id)
    if (log === null) { count(result, 'no-log-table'); return result }
    catalogue ??= await deps.catalogue()
    const position = await deps.position(profile.id)
    const facts = readerFacts(profile, position, catalogue, log)
    const plan = planLifecycle(facts, now, { trialNotices: deps.trialNotices })
    if (plan.kind === 'skip') { count(result, plan.reason); continue }
    if (plan.kind === 'trial') {
      await sendTrialNotice(deps, facts, plan.plan.template, plan.plan.dedupeKey, catalogue, result)
      continue
    }
    for (const candidate of plan.candidates) {
      if (await sendReadingPlan(deps, facts, candidate, catalogue, result)) break
    }
  }
  return result
}

/**
 * Welcome (service): new accounts 5 minutes to 48 hours old, once each.
 * Email sign-ups get `welcome` with the one-click confirm link; readers
 * already confirmed (Google, per ship 2) get `welcome-google`. Until ship 2's
 * confirmed-at column exists an email sign-up waits (its confirm link would
 * lead nowhere). Welcome is exempt from the 48-hour, 3-day and quiet-hour
 * rules: it answers the sign-up.
 */
export async function runWelcomeSweep(deps: LifecycleDeps, profiles: Profile[]): Promise<SweepResult> {
  const result: SweepResult = { considered: 0, sent: [], skipped: {} }
  const now = deps.now()
  let catalogue: ReadonlyMap<string, CatalogueEntry> | null = null
  for (const profile of profiles) {
    const created = Date.parse(profile.created_at)
    if (!(now - created >= WELCOME_DELAY_MS && now - created <= WELCOME_WINDOW_MS)) continue
    if (!profile.email || !deps.isRecipientAllowed(profile.email)) { count(result, 'test-gate'); continue }
    result.considered++
    const log = await deps.log(profile.id)
    if (log === null) { count(result, 'no-log-table'); return result }
    if (log.some(row => row.dedupe_key === 'welcome:-')) { count(result, 'already-sent'); continue }
    const user = await deps.authUser(profile.id)
    const confirmed = profileConfirmed(profile)
    let template: 'welcome' | 'welcome-google'
    if (confirmed === true || user?.provider === 'google') template = 'welcome-google'
    else if (confirmed === false && deps.linkSecret) template = 'welcome'
    else { count(result, confirmed === null ? 'awaiting-confirmed-column' : 'no-link-secret'); continue }

    catalogue ??= await deps.catalogue()
    const facts = readerFacts(profile, await deps.position(profile.id), catalogue, log)
    const lastBookId = [...facts.places, ...facts.finished].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.bookId ?? null
    const book = lastBookId ? catalogue.get(lastBookId) ?? null : null
    const firstName = user?.firstName ?? (typeof profile.display_name === 'string' ? profile.display_name.split(/\s+/)[0] : '') ?? ''
    const vars: EmailVars = {
      subject: 'Welcome to Tinct',
      first_name: firstName,
      book_title: book?.title ?? '',
      continue_url: book ? readerUrl(book.id) : '',
      ...bookArt(book?.id ?? null, book?.title ?? null),
    }
    if (template === 'welcome') vars.confirm_url = await confirmUrl(deps.linkSecret!, profile.id, profile.email, now)
    await deliver(deps, facts, template, vars, { book_id: book?.id ?? null, dedupe_key: 'welcome:-', meta: { provider: user?.provider ?? null } }, result)
  }
  return result
}

export const ANNOUNCE_FEATURES = ['reading-time', 'profiles-friends-leaderboard', 'listen-own-books', 'librarian', 'search'] as const

export const ANNOUNCE_DEFAULTS = {
  subject: 'Add any book to Tinct, plus a privacy update',
  library_url: `${EMAIL_ORIGIN}/library`,
  privacy_url: `${EMAIL_ORIGIN}/privacy`,
  ...LIBRARY_ART,
}

/**
 * The one-off announcement (service notice, docs/lifecycle-emails/templates/
 * announce.*): admin-triggered, once per reader per campaign, logged. Exempt
 * from the reading-email rules (it is a notice the privacy policy promises),
 * never past the test gate.
 */
export async function runAnnouncement(deps: LifecycleDeps, profiles: Profile[], campaign: string, omitFeatures: string[]): Promise<SweepResult> {
  const result: SweepResult = { considered: 0, sent: [], skipped: {} }
  for (const profile of profiles) {
    if (!profile.email || !deps.isRecipientAllowed(profile.email)) { count(result, 'test-gate'); continue }
    result.considered++
    const log = await deps.log(profile.id)
    if (log === null) { count(result, 'no-log-table'); return result }
    const key = `announce:${campaign}`
    if (log.some(row => row.dedupe_key === key)) { count(result, 'already-sent'); continue }
    await deliver(deps, { userId: profile.id, email: profile.email }, 'announce', { ...ANNOUNCE_DEFAULTS }, { book_id: null, dedupe_key: key, meta: { campaign, omitted: omitFeatures } }, result, { omitFeatures })
  }
  return result
}
