/**
 * Supabase access for social ship 3: follows, blocks, the leaderboard cache,
 * search, reports and the admin view. Every query goes through here so the
 * routes can be tested with an in-memory store, and so a missing table (the
 * SQL not yet run) becomes one typed error the routes turn into "unavailable".
 *
 * Other readers are only ever read through public_profile_cards, which leaves
 * out Only me and hidden profiles and unapproved photos (20261008_profiles.sql;
 * uploads are stored approved since 19 Oct 2026).
 */
import { isReservedTestEmail, type BoardCard, type ReportReason } from '../../social/socialRules'
import type { Review } from '../../social/profileRules'
import type { ReaderProfileRow } from './profileStore'
import type { SupabaseEnv } from './supabase'

export class SocialUnavailable extends Error {
  constructor(detail: string, readonly status = 0) { super(`social unavailable: ${detail}`) }
}

export interface LedgerDayRow { user_id: string; day: string; book_id: string; read_seconds: number; listen_seconds: number }

export interface ReportRow {
  id: number
  reporter: string | null
  reported: string
  handle: string
  reason: ReportReason
  created_at: string
  resolved_at: string | null
  resolution: string | null
}

/** What the admin view sees of a profile (its own row, hidden or not). */
export type AdminProfileRow = Pick<ReaderProfileRow,
  'id' | 'display_name' | 'handle' | 'picture_kind' | 'picture_value' | 'picture_review'
  | 'background_kind' | 'background_value' | 'background_review' | 'visibility' | 'updated_at'> & { hidden_at: string | null }

export interface SocialStore {
  following(userId: string): Promise<string[]>
  followers(userId: string): Promise<string[]>
  /** Both of the above in one request (the board's first round trip); optional, the two calls otherwise. */
  followsEitherWay?(userId: string): Promise<{ following: string[]; followers: string[] }>
  /** Everyone this reader blocked, and everyone who blocked this reader. */
  blockedEitherWay(userId: string): Promise<Set<string>>
  blockedByMe(userId: string): Promise<string[]>
  follow(follower: string, followed: string): Promise<void>
  unfollow(follower: string, followed: string): Promise<void>
  /** Blocking also ends follows both ways. */
  block(blocker: string, blocked: string): Promise<void>
  unblock(blocker: string, blocked: string): Promise<void>

  cardsByIds(ids: string[]): Promise<BoardCard[]>
  /**
   * Find readers: every findable profile (Friends or Everyone; the view leaves
   * out Only me and hidden), by name or handle (Anders, 19 Oct 2026). Rows carry
   * only what the card view holds; Find shows name, handle and picture.
   */
  searchReaders(query: { kind: 'handle'; handle: string } | { kind: 'name'; text: string }, limit: number): Promise<BoardCard[]>
  /** Everyone readers with the leaderboard and reading time on. */
  everyoneBoardCards(limit: number): Promise<BoardCard[]>
  /** How many of those are real readers (internal and test accounts left out). Throws when it cannot be told. */
  everyoneReaderCount(): Promise<number>
  /** Which of these accounts are test accounts (profiles.is_test, or a reserved test address). Throws when it cannot be told. */
  testAccounts(ids: string[]): Promise<Set<string>>

  /**
   * The board's live seconds: these readers' ledger rows from a day on
   * ('_earlier' left out), by the (user_id, day) index. Throws rather than
   * return a cut-off list, so the board never shows too little time.
   */
  weekLedger(ids: string[], sinceDay: string): Promise<LedgerDayRow[]>
  /** The fallback: the cached 7-day seconds for these readers (hourly), and when the cache was built. */
  boardSeconds(ids: string[]): Promise<Map<string, number>>
  boardRefreshedAt(): Promise<string | null>
  refreshBoard(): Promise<void>
  /** Ledger rows of these readers from a day on (book names on the board, Also reading). */
  ledgerSince(ids: string[] | null, sinceDay: string, bookIds?: string[], limit?: number): Promise<LedgerDayRow[]>

  report(row: { reporter: string; reported: string; handle: string; reason: ReportReason }): Promise<'ok' | 'duplicate'>

  // Admin view
  openReports(limit: number): Promise<ReportRow[]>
  resolveReport(id: number, resolution: string): Promise<void>
  pendingReviews(limit: number): Promise<AdminProfileRow[]>
  /** Profiles with an uploaded (or Google) picture or an uploaded background, newest change first: photos show at once, so the admin page can remove one afterwards. */
  recentPhotos(limit: number): Promise<AdminProfileRow[]>
  adminProfiles(query: string, limit: number): Promise<AdminProfileRow[]>
  adminProfile(id: string): Promise<AdminProfileRow | null>
  adminUpdate(id: string, patch: Partial<{ display_name: string; handle: string; hidden_at: string | null; picture_review: Review; background_review: Review; picture_kind: string; picture_value: string | null; background_kind: string; background_value: string | null }>): Promise<'ok' | 'taken'>
}

const CARD_COLUMNS = 'id,handle,display_name,picture_kind,picture_value,visibility,show_reading,show_time,on_leaderboard'
// reader_profiles.internal through the view (20261009_leaderboard_internal.sql).
// Until that file has run the column is missing: cards are read without it
// (internal unknown) and the Everyone count cannot be told, so Everyone stays closed.
// The column is tried again every 10 minutes, so running the file needs no release.
let internalMissingAt = 0
const ADMIN_COLUMNS = 'id,display_name,handle,picture_kind,picture_value,picture_review,background_kind,background_value,background_review,visibility,updated_at,hidden_at'

function headers(env: SupabaseEnv, extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`, ...extra }
}

async function request(env: SupabaseEnv, path: string, init: RequestInit = {}): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new SocialUnavailable('no database')
  try {
    return await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: headers(env, (init.headers as Record<string, string>) || {}) })
  } catch {
    throw new SocialUnavailable('network')
  }
}

async function rows<T>(env: SupabaseEnv, path: string): Promise<T[]> {
  const res = await request(env, path)
  if (!res.ok) throw new SocialUnavailable(`${path.split('?')[0]} ${res.status}`, res.status)
  return await res.json() as T[]
}

async function write(env: SupabaseEnv, method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, prefer = 'return=minimal'): Promise<Response> {
  const res = await request(env, path, {
    method,
    headers: { 'Content-Type': 'application/json', Prefer: prefer },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok && res.status !== 409) throw new SocialUnavailable(`${method} ${path.split('?')[0]} ${res.status}`, res.status)
  return res
}

/** Cards from public_profile_cards, with `internal` where the column exists. */
async function cardRows(env: SupabaseEnv, path: string): Promise<BoardCard[]> {
  if (Date.now() - internalMissingAt > 10 * 60_000) {
    const res = await request(env, `${path}&select=${CARD_COLUMNS},internal`)
    if (res.ok) return await res.json() as BoardCard[]
    const detail = res.status === 400 ? await res.text().catch(() => '') : ''
    if (!/internal/.test(detail)) throw new SocialUnavailable(`${path.split('?')[0]} ${res.status}`, res.status)
    internalMissingAt = Date.now()
  }
  return rows<BoardCard>(env, `${path}&select=${CARD_COLUMNS}`)
}

const ids = (list: string[]) => list.filter(id => /^[0-9a-f-]{36}$/i.test(id)).join(',')

function chunks<T>(list: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/** PostgREST `ilike` with * as wildcard; the query was already reduced to safe characters. */
function like(text: string): string {
  return encodeURIComponent(`*${text.replace(/[*,()"\\]/g, ' ')}*`)
}

export function supabaseSocialStore(env: SupabaseEnv): SocialStore {
  return {
    async following(userId) {
      return (await rows<{ followed: string }>(env, `follows?follower=eq.${userId}&select=followed&limit=2000`)).map(row => row.followed)
    },
    async followers(userId) {
      return (await rows<{ follower: string }>(env, `follows?followed=eq.${userId}&select=follower&limit=2000`)).map(row => row.follower)
    },
    async followsEitherWay(userId) {
      // One request by the primary key (follower, …) and follows_followed, as the two above use.
      const list = await rows<{ follower: string; followed: string }>(env, `follows?or=(follower.eq.${userId},followed.eq.${userId})&select=follower,followed&limit=4000`)
      return {
        following: list.filter(row => row.follower === userId).map(row => row.followed),
        followers: list.filter(row => row.followed === userId).map(row => row.follower),
      }
    },
    async blockedEitherWay(userId) {
      const list = await rows<{ blocker: string; blocked: string }>(env, `blocks?or=(blocker.eq.${userId},blocked.eq.${userId})&select=blocker,blocked&limit=5000`)
      return new Set(list.map(row => (row.blocker === userId ? row.blocked : row.blocker)))
    },
    async blockedByMe(userId) {
      return (await rows<{ blocked: string }>(env, `blocks?blocker=eq.${userId}&select=blocked&order=created_at.desc&limit=500`)).map(row => row.blocked)
    },
    async follow(follower, followed) {
      await write(env, 'POST', 'follows?on_conflict=follower,followed', { follower, followed }, 'resolution=ignore-duplicates,return=minimal')
    },
    async unfollow(follower, followed) {
      await write(env, 'DELETE', `follows?follower=eq.${follower}&followed=eq.${followed}`)
    },
    async block(blocker, blocked) {
      await write(env, 'POST', 'blocks?on_conflict=blocker,blocked', { blocker, blocked }, 'resolution=ignore-duplicates,return=minimal')
      await write(env, 'DELETE', `follows?or=(and(follower.eq.${blocker},followed.eq.${blocked}),and(follower.eq.${blocked},followed.eq.${blocker}))`)
    },
    async unblock(blocker, blocked) {
      await write(env, 'DELETE', `blocks?blocker=eq.${blocker}&blocked=eq.${blocked}`)
    },

    async cardsByIds(list) {
      const out: BoardCard[] = []
      for (const group of chunks([...new Set(list)], 100)) {
        if (!group.length) continue
        out.push(...await cardRows(env, `public_profile_cards?id=in.(${ids(group)})`))
      }
      return out
    },
    async searchReaders(query, limit) {
      const filter = query.kind === 'handle'
        ? `handle=eq.${encodeURIComponent(query.handle)}`
        : `or=(display_name.ilike.${like(query.text)},handle.ilike.${like(query.text.replace(/\s+/g, ''))})`
      // Friends and Everyone (the view never holds Only me or hidden profiles; the filter says so again).
      return cardRows(env, `public_profile_cards?visibility=in.(friends,everyone)&${filter}&order=display_name.asc&limit=${limit}`)
    },
    async everyoneBoardCards(limit) {
      return cardRows(env, `public_profile_cards?visibility=eq.everyone&on_leaderboard=is.true&show_time=is.true&limit=${limit}`)
    },
    async everyoneReaderCount() {
      // One row and the exact count in Content-Range ("0-0/12"); a missing column is a 400 and throws.
      const res = await request(env, 'public_profile_cards?visibility=eq.everyone&on_leaderboard=is.true&show_time=is.true&internal=is.false&select=id&limit=1', { headers: { Prefer: 'count=exact' } })
      if (!res.ok) throw new SocialUnavailable(`public_profile_cards count ${res.status}`, res.status)
      const total = Number((res.headers.get('content-range') || '').split('/')[1])
      if (!Number.isFinite(total)) throw new SocialUnavailable('public_profile_cards count unreadable')
      return total
    },

    async testAccounts(list) {
      const out = new Set<string>()
      for (const group of chunks([...new Set(list)], 100)) {
        if (!group.length) continue
        // profiles.is_test exists once 20261010_profiles_is_test.sql has run; until then the address alone tells.
        let res = await request(env, `profiles?id=in.(${ids(group)})&select=id,email,is_test`)
        if (res.status === 400 && /is_test/.test(await res.clone().text().catch(() => ''))) res = await request(env, `profiles?id=in.(${ids(group)})&select=id,email`)
        if (!res.ok) throw new SocialUnavailable(`profiles test ${res.status}`, res.status)
        for (const row of await res.json() as Array<{ id: string; email: string | null; is_test?: boolean | null }>) {
          if (row.is_test === true || isReservedTestEmail(row.email)) out.add(row.id)
        }
      }
      return out
    },

    async weekLedger(list, sinceDay) {
      // 50 readers a request: a reader has at most a row per day and book in the window.
      const groups = chunks([...new Set(list)].filter(id => /^[0-9a-f-]{36}$/i.test(id)), 50)
      const limit = 1000
      const parts = await Promise.all(groups.map(group => rows<LedgerDayRow>(env, `reading_time?user_id=in.(${ids(group)})&day=gte.${sinceDay}&book_id=neq._earlier&select=user_id,day,book_id,read_seconds,listen_seconds&limit=${limit}`)))
      if (parts.some(part => part.length >= limit)) throw new SocialUnavailable('week ledger cut off')
      return parts.flat()
    },

    async boardSeconds(list) {
      const out = new Map<string, number>()
      for (const group of chunks([...new Set(list)], 100)) {
        if (!group.length) continue
        for (const row of await rows<{ user_id: string; seconds: number }>(env, `leaderboard_7d?user_id=in.(${ids(group)})&select=user_id,seconds`)) {
          out.set(row.user_id, Number(row.seconds) || 0)
        }
      }
      return out
    },
    async boardRefreshedAt() {
      return (await rows<{ refreshed_at: string }>(env, 'leaderboard_7d?select=refreshed_at&order=refreshed_at.desc&limit=1'))[0]?.refreshed_at ?? null
    },
    async refreshBoard() {
      const res = await request(env, 'rpc/refresh_leaderboard_7d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!res.ok) throw new SocialUnavailable(`refresh ${res.status}`, res.status)
    },
    async ledgerSince(list, sinceDay, bookIds, limit = 2000) {
      const who = list ? `user_id=in.(${ids(list)})&` : ''
      const books = bookIds?.length ? `book_id=in.(${bookIds.filter(id => /^[a-z0-9-]{1,80}$/.test(id)).join(',')})&` : ''
      if (list && !list.length) return []
      return rows<LedgerDayRow>(env, `reading_time?${who}${books}day=gte.${sinceDay}&book_id=neq._earlier&select=user_id,day,book_id,read_seconds,listen_seconds&order=day.desc&limit=${limit}`)
    },

    async report(row) {
      const res = await write(env, 'POST', 'profile_reports', row)
      return res.status === 409 ? 'duplicate' : 'ok'
    },

    async openReports(limit) {
      return rows<ReportRow>(env, `profile_reports?resolved_at=is.null&select=id,reporter,reported,handle,reason,created_at,resolved_at,resolution&order=created_at.desc&limit=${limit}`)
    },
    async resolveReport(id, resolution) {
      await write(env, 'PATCH', `profile_reports?id=eq.${id}`, { resolved_at: new Date().toISOString(), resolution })
    },
    async pendingReviews(limit) {
      return rows<AdminProfileRow>(env, `reader_profiles?or=(picture_review.eq.pending,background_review.eq.pending)&select=${ADMIN_COLUMNS}&order=updated_at.asc&limit=${limit}`)
    },
    async recentPhotos(limit) {
      return rows<AdminProfileRow>(env, `reader_profiles?or=(picture_kind.in.(upload,google),background_kind.eq.upload)&select=${ADMIN_COLUMNS}&order=updated_at.desc&limit=${limit}`)
    },
    async adminProfiles(query, limit) {
      const text = query.replace(/[^\p{L}\p{N} ._'-]/gu, '').trim()
      const filter = text ? `or=(display_name.ilike.${like(text)},handle.ilike.${like(text)})&` : ''
      return rows<AdminProfileRow>(env, `reader_profiles?${filter}select=${ADMIN_COLUMNS}&order=updated_at.desc&limit=${limit}`)
    },
    async adminProfile(id) {
      return (await rows<AdminProfileRow>(env, `reader_profiles?id=eq.${id}&select=${ADMIN_COLUMNS}&limit=1`))[0] ?? null
    },
    async adminUpdate(id, patch) {
      const res = await write(env, 'PATCH', `reader_profiles?id=eq.${id}`, { ...patch, updated_at: new Date().toISOString() })
      return res.status === 409 ? 'taken' : 'ok'
    },
  }
}
