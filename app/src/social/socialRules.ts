/**
 * Social (ship 3): the rules shared by the Worker, the Friends page, the
 * public profile page and the reader. Pure functions only; no I/O.
 *
 * Approved by Anders, 7 October 2026 (docs/social/CODER-BRIEF.md "SHIP 3",
 * flows.html fourth pass), with his overrides: profile pages at
 * tinct.app/@handle, Worker-rendered, noindex, with the background banner.
 *
 * - Friends are mutual follows. Follow, unfollow, remove follower, block.
 * - The leaderboard counts reading + listening over a rolling 7 days, from
 *   the reading_time ledger, refreshed at least hourly. The leaderboard is
 *   opt-in ("appear on the leaderboard", default off) and needs "show my
 *   reading time" on. Your own row and rank always show to you.
 * - Find searches only readers set to Everyone; "Also reading your books"
 *   only Everyone readers who show what they read.
 * - Blocked readers never see each other; Only me and hidden profiles never
 *   appear anywhere (public_profile_cards leaves them out).
 * - Leaderboard threshold (Anders, 8 October 2026): Friends is there from day
 *   one; Everyone is not offered at all (no tab, no board from the API) until
 *   at least EVERYONE_BOARD_MIN_READERS real readers would appear on it.
 *   Tinct's own internal and test accounts never appear on any board and
 *   never count (isInternalAccount; reader_profiles.internal).
 */
import { normalizeHandle, type PictureKind, type Visibility } from './profileRules'

/** SOCIAL_FRIENDS needs SOCIAL_PROFILES: either off, and nothing of ship 3 exists. */
export function socialFriendsOn(env: { SOCIAL_FRIENDS?: string; SOCIAL_PROFILES?: string }): boolean {
  return env.SOCIAL_FRIENDS === '1' && env.SOCIAL_PROFILES === '1'
}

// ===== The 7-day window =====

/** Rows older than this are rebuilt when a board is read (the cron rebuilds hourly). */
export const LEADERBOARD_STALE_MS = 65 * 60_000

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

function shiftDay(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/**
 * Reader-local days from (today − 6) to (today + 1), today being the UTC date.
 * The ledger keys time by each reader's own date, so a reader east of UTC who
 * is already in tomorrow still counts their new day. Mirrors
 * refresh_leaderboard_7d() in supabase/migrations/20261008_social.sql.
 */
export function leaderboardWindow(nowMs: number): { start: string; end: string; today: string } {
  const today = utcDay(nowMs)
  return { start: shiftDay(today, -6), end: shiftDay(today, 1), today }
}

/** Seconds per reader in the window, from ledger rows ('_earlier' never counts). */
export function windowSeconds(rows: Array<{ user_id: string; day: string; book_id: string; read_seconds: number; listen_seconds: number }>, nowMs: number): Map<string, number> {
  const { start, end } = leaderboardWindow(nowMs)
  const out = new Map<string, number>()
  for (const row of rows) {
    if (row.book_id === '_earlier' || row.day < start || row.day > end) continue
    const seconds = Math.max(0, Number(row.read_seconds) || 0) + Math.max(0, Number(row.listen_seconds) || 0)
    if (seconds > 0) out.set(row.user_id, (out.get(row.user_id) ?? 0) + seconds)
  }
  return out
}

// ===== Who appears on which board =====

export type Board = 'friends' | 'everyone'

/** The columns of public_profile_cards a board needs (Only me and hidden rows are never there). */
export interface BoardCard {
  id: string
  handle: string
  display_name: string
  picture_kind: PictureKind
  picture_value: string | null
  visibility: Visibility
  show_reading: boolean
  show_time: boolean
  on_leaderboard: boolean
  /**
   * Tinct's own internal or test account (reader_profiles.internal, through
   * public_profile_cards). Undefined only before 20261009_leaderboard_internal.sql
   * has run.
   */
  internal?: boolean
}

/**
 * Whether another reader's card may appear on this viewer's board. The
 * viewer's own row is added separately and always shows to the viewer.
 * - both boards: the reader chose "appear on the leaderboard" and shows
 *   their reading time; nobody blocked either way;
 * - Everyone: only readers set to Everyone (with a confirmed email: the view
 *   already turns an unconfirmed Everyone into Friends);
 * - Friends: only mutual follows (whose profile is Friends or Everyone).
 */
export function appearsOnBoard(card: BoardCard, board: Board, viewer: { friends: ReadonlySet<string>; blocked: ReadonlySet<string> }): boolean {
  if (card.internal === true) return false
  if (viewer.blocked.has(card.id)) return false
  if (!card.on_leaderboard || !card.show_time) return false
  if (card.visibility === 'only_me') return false
  if (board === 'everyone') return card.visibility === 'everyone'
  return viewer.friends.has(card.id)
}

// ===== Internal accounts and the Everyone threshold =====

/** The Everyone board appears once this many real readers would appear on it. */
export const EVERYONE_BOARD_MIN_READERS = 10

/** How long the Worker reuses the count of Everyone readers before asking again. */
export const EVERYONE_COUNT_TTL_MS = 5 * 60_000

/** Whether the Everyone board is offered, from the count of real readers on it (null = unknown: not offered). */
export function everyoneBoardOpen(realReaders: number | null, min = EVERYONE_BOARD_MIN_READERS): boolean {
  return typeof realReaders === 'number' && realReaders >= min
}

/**
 * The one domain Tinct's own test tools create accounts under (since
 * 2026-10-10; app/scripts/lib/testAccounts.cjs). Nobody can receive mail
 * there, so no reader can sign up with it.
 */
export const TEST_ACCOUNT_DOMAIN = 'test.tinct.app'

/**
 * Addresses that cannot belong to a reader: Tinct's test-account domain and
 * the domains and top-level domains reserved for examples and testing
 * (RFC 2606/6761), as QA's older synthetic accounts use (qa-…@example.com).
 * Mirrored in SQL by public.is_test_email (20261010_profiles_is_test.sql).
 */
export function isReservedTestEmail(email: string | null | undefined): boolean {
  const domain = String(email ?? '').trim().toLowerCase().split('@')[1] ?? ''
  if (!domain) return false
  return domain === TEST_ACCOUNT_DOMAIN
    || /(^|\.)example\.(com|net|org)$/.test(domain) || /\.(test|example|invalid|localhost)$/.test(domain)
}

/**
 * Tinct's own internal or test account: a reserved test address, or a request
 * from a device with the internal-traffic flag (`?internal=1`; it sends
 * `x-tinct-check: 1`, see public/lab/internal-traffic.js). Such an account is
 * flagged once (reader_profiles.internal) and the flag is never cleared by
 * the Worker.
 */
export function isInternalAccount(email: string | null | undefined, checkHeader: string | null | undefined): boolean {
  return checkHeader === '1' || isReservedTestEmail(email)
}

/** Friends = people you follow who follow you back. */
export function mutualFriends(following: Iterable<string>, followers: Iterable<string>): Set<string> {
  const back = new Set(followers)
  return new Set([...following].filter(id => back.has(id)))
}

export interface RankedRow<T> { rank: number; seconds: number; row: T }

/**
 * Most time first. Equal times share a rank (1, 2, 2, 4); within a tie the
 * order is by name, so the list never jumps around between refreshes.
 */
export function rankRows<T>(rows: T[], seconds: (row: T) => number, name: (row: T) => string): RankedRow<T>[] {
  const sorted = [...rows].sort((a, b) => seconds(b) - seconds(a) || name(a).localeCompare(name(b)))
  const out: RankedRow<T>[] = []
  sorted.forEach((row, index) => {
    const value = seconds(row)
    const rank = index > 0 && out[index - 1].seconds === value ? out[index - 1].rank : index + 1
    out.push({ rank, seconds: value, row })
  })
  return out
}

/** "#3 among friends", for the sheet's facts line. Null without friends on the board. */
export function amongFriendsLine(rank: number | null, total: number): string | null {
  if (!rank || total < 2) return null
  return `#${rank} among friends`
}

/** "#3 of 6 this week", for the You page's Friends shelf (flows.html). */
export function rankOfLine(rank: number | null, total: number): string | null {
  if (!rank || total < 2) return null
  return `#${rank} of ${total} this week`
}

// ===== Find =====

export type FindQuery = { kind: 'handle'; handle: string } | { kind: 'name'; text: string } | null

/**
 * A search: a profile link (tinct.app/@anders, @anders) finds that handle;
 * anything else searches names and handles. Letters, digits, spaces and
 * . _ - ' only; at least two characters.
 */
export function parseFindQuery(raw: unknown): FindQuery {
  const text = String(raw ?? '').trim().slice(0, 80)
  const link = /^(?:https?:\/\/)?(?:www\.)?tinct\.app\/@([A-Za-z0-9_.]{3,20})\/?$/i.exec(text) || /^@([A-Za-z0-9_.]{3,20})$/.exec(text)
  if (link) return { kind: 'handle', handle: normalizeHandle(link[1]) }
  const cleaned = text.normalize('NFC').replace(/[^\p{L}\p{N} ._'-]/gu, '').replace(/\s+/g, ' ').trim()
  return cleaned.length >= 2 ? { kind: 'name', text: cleaned } : null
}

// ===== Reports =====

export const REPORT_REASONS = ['name', 'picture', 'background', 'spam', 'other'] as const
export type ReportReason = typeof REPORT_REASONS[number]

export const REPORT_REASON_COPY: Record<ReportReason, string> = {
  name: 'The name or link',
  picture: 'The picture',
  background: 'The background',
  spam: 'Spam or pretending to be someone',
  other: 'Something else',
}

// ===== The reading card =====

/**
 * "Finished Frankenstein · 6 h 20 m" (the hours left out below a minute).
 * "Finished" only when the book is finished (its last chapter done); else the
 * title alone, so the card never claims a finish that did not happen.
 */
export function finishedCardLine(title: string, duration: string | null, finished = true): string {
  const head = finished ? `Finished ${title}` : title
  return duration ? `${head} · ${duration}` : head
}
