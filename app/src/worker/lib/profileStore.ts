/**
 * Supabase access for profiles (social ship 2). Every read and write of
 * reader_profiles, the public card view, follows and blocks goes through here,
 * so the routes can be tested with an in-memory store and so a missing table
 * (SQL not yet run) becomes one typed error the routes turn into "unavailable".
 */
import type { BackgroundKind, PictureKind, Review, Visibility, NewBooksOpenIn } from '../../social/profileRules'
import type { SupabaseEnv } from './supabase'

export class ProfilesUnavailable extends Error {
  constructor(detail: string, readonly status = 0) { super(`profiles unavailable: ${detail}`) }
}

/** One reader_profiles row, in the database's own column names. */
export interface ReaderProfileRow {
  id: string
  display_name: string
  handle: string
  picture_kind: PictureKind
  picture_value: string | null
  picture_review: Review
  background_kind: BackgroundKind
  background_value: string | null
  background_review: Review
  visibility: Visibility
  show_reading: boolean
  show_time: boolean
  on_leaderboard: boolean
  new_books_open_in: NewBooksOpenIn
  auto_created: boolean
  set_up_at: string | null
  prompted_at: string | null
  updated_at?: string
}

/** A row of public_profile_cards: the owner's choices already applied. */
export interface PublicCardRow {
  id: string
  handle: string
  display_name: string
  picture_kind: PictureKind
  picture_value: string | null
  background_kind: BackgroundKind
  background_value: string | null
  visibility: Visibility
  show_reading: boolean
  show_time: boolean
  on_leaderboard: boolean
  /** Tinct's own internal or test account (only where the view carries it; see socialRules BoardCard). */
  internal?: boolean
}

export interface AccountRow {
  email_opt_in: boolean
  email_confirmed_at: string | null
  email_consent_version: string | null
}

export interface RelationRows { viewerFollowsOwner: boolean; ownerFollowsViewer: boolean; blocked: boolean }

export type WriteResult = 'ok' | 'taken'

export interface ProfileStore {
  getOwn(id: string): Promise<ReaderProfileRow | null>
  getAccount(id: string): Promise<AccountRow | null>
  takenHandles(candidates: string[]): Promise<Set<string>>
  create(row: Omit<ReaderProfileRow, 'updated_at'>): Promise<WriteResult>
  update(id: string, patch: Partial<ReaderProfileRow>): Promise<WriteResult>
  updateAccount(id: string, patch: Partial<AccountRow> & { email_opt_in_at?: string; email_opt_out_at?: string }): Promise<void>
  /** Only rows the owner lets anyone see (never Only me). */
  getCardByHandle(handle: string): Promise<PublicCardRow | null>
  getCardById(id: string): Promise<PublicCardRow | null>
  relation(viewerId: string, ownerId: string): Promise<RelationRows>
  /**
   * Flags Tinct's own internal or test account (reader_profiles.internal), so it
   * never appears on a leaderboard or counts toward Everyone's threshold. Only
   * ever sets true. Optional: stores without it never flag.
   */
  markInternal?(id: string): Promise<void>
}

const OWN_COLUMNS = 'id,display_name,handle,picture_kind,picture_value,picture_review,background_kind,background_value,background_review,visibility,show_reading,show_time,on_leaderboard,new_books_open_in,auto_created,set_up_at,prompted_at,updated_at'
const CARD_COLUMNS = 'id,handle,display_name,picture_kind,picture_value,background_kind,background_value,visibility,show_reading,show_time,on_leaderboard'

function headers(env: SupabaseEnv, extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
    ...extra,
  }
}

async function rows<T>(env: SupabaseEnv, path: string): Promise<T[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new ProfilesUnavailable('no database')
  let res: Response
  try {
    res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { headers: headers(env) })
  } catch {
    throw new ProfilesUnavailable('network')
  }
  // A missing table, view or column answers 404/400: the SQL has not run yet.
  if (!res.ok) throw new ProfilesUnavailable(`${path.split('?')[0]} ${res.status}`, res.status)
  return await res.json() as T[]
}

async function write(env: SupabaseEnv, method: 'POST' | 'PATCH', path: string, body: unknown): Promise<WriteResult> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new ProfilesUnavailable('no database')
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: headers(env, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(body),
  })
  if (res.ok) return 'ok'
  // 23505 unique_violation: a handle someone else took in the meantime.
  if (res.status === 409) return 'taken'
  throw new ProfilesUnavailable(`${method} ${path.split('?')[0]} ${res.status}`)
}

const list = (values: string[]) => values.map(value => `"${value.replace(/"/g, '')}"`).join(',')

export function supabaseProfileStore(env: SupabaseEnv): ProfileStore {
  return {
    async getOwn(id) {
      return (await rows<ReaderProfileRow>(env, `reader_profiles?id=eq.${id}&select=${OWN_COLUMNS}&limit=1`))[0] ?? null
    },
    async getAccount(id) {
      return (await rows<AccountRow>(env, `profiles?id=eq.${id}&select=email_opt_in,email_confirmed_at,email_consent_version&limit=1`))[0] ?? null
    },
    async takenHandles(candidates) {
      if (!candidates.length) return new Set()
      const found = await rows<{ handle: string }>(env, `reader_profiles?handle=in.(${encodeURIComponent(list(candidates))})&select=handle`)
      return new Set(found.map(row => row.handle))
    },
    async create(row) {
      return write(env, 'POST', 'reader_profiles', row)
    },
    async update(id, patch) {
      return write(env, 'PATCH', `reader_profiles?id=eq.${id}`, { ...patch, updated_at: new Date().toISOString() })
    },
    async updateAccount(id, patch) {
      await write(env, 'PATCH', `profiles?id=eq.${id}`, patch)
    },
    async markInternal(id) {
      // A no-op once flagged; updated_at is left alone (the photo review queue orders by it).
      await write(env, 'PATCH', `reader_profiles?id=eq.${id}&internal=is.false`, { internal: true })
    },
    async getCardByHandle(handle) {
      return (await rows<PublicCardRow>(env, `public_profile_cards?handle=eq.${encodeURIComponent(handle)}&select=${CARD_COLUMNS}&limit=1`))[0] ?? null
    },
    async getCardById(id) {
      return (await rows<PublicCardRow>(env, `public_profile_cards?id=eq.${id}&select=${CARD_COLUMNS}&limit=1`))[0] ?? null
    },
    async relation(viewerId, ownerId) {
      // A table that does not exist yet holds no follows or blocks; any other
      // failure throws, so a block is never skipped by accident.
      const safe = async <T>(path: string): Promise<T[]> => {
        try { return await rows<T>(env, path) } catch (error) {
          if (error instanceof ProfilesUnavailable && error.status === 404) return []
          throw error
        }
      }
      const follows = await safe<{ follower: string; followed: string }>(`follows?or=(and(follower.eq.${viewerId},followed.eq.${ownerId}),and(follower.eq.${ownerId},followed.eq.${viewerId}))&select=follower,followed`)
      const blocks = await safe<{ blocker: string }>(`blocks?or=(and(blocker.eq.${viewerId},blocked.eq.${ownerId}),and(blocker.eq.${ownerId},blocked.eq.${viewerId}))&select=blocker`)
      return {
        viewerFollowsOwner: follows.some(row => row.follower === viewerId && row.followed === ownerId),
        ownerFollowsViewer: follows.some(row => row.follower === ownerId && row.followed === viewerId),
        blocked: blocks.length > 0,
      }
    },
  }
}
