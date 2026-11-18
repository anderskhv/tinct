import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'

/**
 * Large per-book collections in `user_data`, one row per chapter (Disk IO, 14 Nov 2026).
 *
 * A book's highlights (`lab-highlights:{bookId}`) and chat (`chat-history:{bookId}`) used to be one JSON row
 * each, and every new mark or answer rewrote the whole row (half a megabyte for the Bible's chat, with its TOAST
 * and WAL). They are now kept as shards under `{base}:{shard}`, normally the chapter number
 * (`lab-highlights:bible:974`), each written through `commit_user_data` with its own expected rev. A change
 * rewrites only the shards it touches.
 *
 * Compatibility: the old whole-book row (`{base}`) is read with the shards, in the same request, and merged with
 * the book's own merge rule; it is never written or deleted here. A reader whose open tab still runs the old code
 * keeps writing it, and those changes keep arriving. A shard written for the first time takes the old row's items
 * for that chapter with it, so the shards gradually hold everything.
 *
 * A read after the first asks only for keys, revs and update times, and fetches the values of the rows that
 * changed (normally none: a tab coming back to the front reads a few hundred bytes, not the whole book).
 *
 * To the book writers (labHighlightSync, labChatHistory) this is the same `read` / `commit` contract as one row:
 * `read` returns the whole book and a rev, `commit` takes the whole book. The rev is this page's own counter; the
 * real revs are per shard, kept here.
 */

export interface ShardCodec<S> {
  /** A stored row value (old whole-book row or shard). Never throws; unknown shapes read as empty. */
  parse(raw: unknown, bucket: string): S
  /**
   * The book's merge rule over any number of copies. Where the rule keeps one side's fields, later copies win:
   * shards are passed after the old row, so a shard's copy is the one kept.
   */
  merge(sets: S[], bucket: string): S
  /**
   * Which shard each item belongs to. `known` holds every copy this page has of the book (rows and the value
   * being split), for items that carry no shard of their own (a highlight tombstone has no chapter); `placed`
   * names the shards that already hold a given item id.
   */
  split(set: S, bucket: string, context: ShardSplitContext<S>): Map<string, S>
  /** Equal signatures: equal content. */
  signature(set: S, bucket: string): string
  /** The value sent in `p_value`. */
  value(set: S, bucket: string): unknown
}

export interface ShardSplitContext<S> {
  known: S[]
  /** Shard ids (sorted) whose stored row holds an item with this id. */
  placedIn(id: string): string | undefined
}

export interface UserDataRow {
  key: string
  value?: unknown
  rev: number
  updatedAt: string | null
}

/** The three calls the shards need from `user_data`. */
export interface UserDataTransport {
  /** Rows whose key is `base` or starts with `base:`, with their values or with only key, rev and update time. */
  list(base: string, withValues: boolean): Promise<UserDataRow[]>
  /** These rows, with values. */
  fetch(keys: string[]): Promise<UserDataRow[]>
  /** commit_user_data. */
  commit(key: string, value: unknown, expectedRev: number): Promise<VersionedStorageRow | null>
}

export function shardKey(base: string, shard: string): string {
  return `${base}:${shard}`
}

/** A key's shard under `base`: '' for the old whole-book row, null for a key that is not this book's. */
export function shardOfKey(base: string, key: string): string | null {
  if (key === base) return ''
  if (!key.startsWith(base + ':')) return null
  const shard = key.slice(base.length + 1)
  return shard && !shard.includes(':') ? shard : null
}

/** A value for a PostgREST logic tree (`or=(...)`), quoted when it holds a reserved character. */
function treeValue(value: string): string {
  return /[,()"\\\s]/.test(value) ? `"${value.replace(/["\\]/g, '\\$&')}"` : value
}

type SupabaseQuery = PromiseLike<{ data: unknown; error: { message: string } | null }> & {
  abortSignal?: (signal: AbortSignal) => PromiseLike<{ data: unknown; error: { message: string } | null }>
}
interface SupabaseLikeClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        or(filters: string): SupabaseQuery
        in(column: string, values: string[]): SupabaseQuery
      }
    }
  }
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string } | null }>
}

/** Bounds each request (labChatHistory passes its cloud timeout); the signal aborts the request when given. */
export type RequestGuard = <T>(run: (signal: AbortSignal | undefined) => PromiseLike<T>, label: string) => Promise<T>
const unguarded: RequestGuard = run => Promise.resolve(run(undefined))

function withSignal(query: SupabaseQuery, signal: AbortSignal | undefined) {
  return signal && typeof query.abortSignal === 'function' ? query.abortSignal(signal) : query
}

function toRow(raw: unknown): UserDataRow | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  if (typeof src.key !== 'string') return null
  return {
    key: src.key,
    ...('value' in src ? { value: src.value } : {}),
    rev: coerceRev(src.rev) ?? 0,
    updatedAt: typeof src.updated_at === 'string' ? src.updated_at : null,
  }
}

const FETCH_CHUNK = 80

export function supabaseUserDataTransport(userId: string, client: SupabaseLikeClient, guard: RequestGuard = unguarded): UserDataTransport {
  const rows = (data: unknown) => (Array.isArray(data) ? data : data ? [data] : []).map(toRow).filter((row): row is UserDataRow => row !== null)
  return {
    async list(base, withValues) {
      const { data, error } = await guard(signal => withSignal(client
        .from('user_data')
        .select(withValues ? 'key, value, rev, updated_at' : 'key, rev, updated_at')
        .eq('user_id', userId)
        // One request for the old row and every shard. `_` in a book id is a LIKE wildcard: the
        // exact prefix is checked below.
        .or(`key.eq.${treeValue(base)},key.like.${treeValue(base + ':*')}`), signal), 'user data read')
      if (error) throw new Error(error.message)
      return rows(data).filter(row => shardOfKey(base, row.key) !== null)
    },
    async fetch(keys) {
      const out: UserDataRow[] = []
      for (let i = 0; i < keys.length; i += FETCH_CHUNK) {
        const chunk = keys.slice(i, i + FETCH_CHUNK)
        const { data, error } = await guard(signal => withSignal(client
          .from('user_data')
          .select('key, value, rev, updated_at')
          .eq('user_id', userId)
          .in('key', chunk), signal), 'user data read')
        if (error) throw new Error(error.message)
        out.push(...rows(data).filter(row => chunk.includes(row.key)))
      }
      return out
    },
    async commit(key, value, expectedRev) {
      const { data, error } = await guard(signal => {
        const call = client.rpc('commit_user_data', { p_user_id: userId, p_key: key, p_value: value, p_expected_rev: expectedRev }) as SupabaseQuery
        return withSignal(call, signal)
      }, 'user data commit')
      if (error) throw new Error(error.message)
      return ((Array.isArray(data) ? data[0] : data) ?? null) as VersionedStorageRow | null
    },
  }
}

interface StoredShard<S> {
  rev: number
  updatedAt: string | null
  set: S
}

interface BookState<S> {
  loaded: boolean
  /** The old whole-book row ('' shard), read only. */
  legacy: StoredShard<S> | null
  shards: Map<string, StoredShard<S>>
  version: number
}

export interface ShardedRow<S> {
  set: S
  rev: number
}

export interface ShardedCommitResult<S> {
  applied: boolean
  conflict: boolean
  row: ShardedRow<S> | null
  /** Shards this commit wrote (tests, diagnostics). */
  written: string[]
}

/** Shard commits in flight at once: a first sync of a device holding many chapters stays quick. */
const COMMIT_CONCURRENCY = 4

export function createShardedUserData<S>(options: {
  codec: ShardCodec<S>
  transport: UserDataTransport
  baseKey: (bucket: string) => string
  /** Item ids per set, for `placedIn`. */
  ids: (set: S) => string[]
}) {
  const { codec, transport, baseKey } = options
  const books = new Map<string, BookState<S>>()
  const stateOf = (bucket: string) => {
    let state = books.get(bucket)
    if (!state) books.set(bucket, state = { loaded: false, legacy: null, shards: new Map(), version: 0 })
    return state
  }

  const store = (state: BookState<S>, bucket: string, row: UserDataRow, onlyNewer: boolean) => {
    const shard = shardOfKey(baseKey(bucket), row.key)
    if (shard === null) return
    const current = shard === '' ? state.legacy : state.shards.get(shard)
    if (onlyNewer && current && current.rev > row.rev) return
    const entry = { rev: row.rev, updatedAt: row.updatedAt, set: codec.parse(row.value ?? null, bucket) }
    if (shard === '') state.legacy = entry
    else state.shards.set(shard, entry)
    state.version++
  }

  const sortedShards = (state: BookState<S>) => [...state.shards.keys()].sort()

  const whole = (state: BookState<S>, bucket: string): S => codec.merge([
    ...(state.legacy ? [state.legacy.set] : []),
    ...sortedShards(state).map(id => state.shards.get(id)!.set),
  ], bucket)

  const snapshot = (state: BookState<S>, bucket: string): ShardedRow<S> | null =>
    state.legacy || state.shards.size ? { set: whole(state, bucket), rev: state.version } : null

  async function read(bucket: string): Promise<ShardedRow<S> | null> {
    const state = stateOf(bucket)
    const base = baseKey(bucket)
    if (!state.loaded) {
      const rows = await transport.list(base, true)
      state.legacy = null
      state.shards.clear()
      for (const row of rows) store(state, bucket, row, false)
      state.loaded = true
      state.version++
      return snapshot(state, bucket)
    }
    const listed = await transport.list(base, false)
    const present = new Set<string>()
    const changed: string[] = []
    for (const row of listed) {
      const shard = shardOfKey(base, row.key)
      if (shard === null) continue
      present.add(shard)
      const current = shard === '' ? state.legacy : state.shards.get(shard)
      if (!current || current.rev !== row.rev || current.updatedAt !== row.updatedAt) changed.push(row.key)
    }
    // A row that is gone (account data deleted elsewhere) is no longer held.
    if (state.legacy && !present.has('')) { state.legacy = null; state.version++ }
    for (const shard of [...state.shards.keys()]) if (!present.has(shard)) { state.shards.delete(shard); state.version++ }
    if (changed.length) for (const row of await transport.fetch(changed)) store(state, bucket, row, false)
    return snapshot(state, bucket)
  }

  async function commit(bucket: string, desired: S): Promise<ShardedCommitResult<S>> {
    const state = stateOf(bucket)
    // Never split against an unknown account: the old row's items would all be copied into shards.
    if (!state.loaded) await read(bucket)
    const base = baseKey(bucket)
    const shardIds = sortedShards(state)
    const placed = new Map<string, string>()
    for (const id of shardIds) for (const itemId of options.ids(state.shards.get(id)!.set)) if (!placed.has(itemId)) placed.set(itemId, id)
    const context: ShardSplitContext<S> = {
      known: [...(state.legacy ? [state.legacy.set] : []), ...shardIds.map(id => state.shards.get(id)!.set), desired],
      placedIn: id => placed.get(id),
    }
    const parts = codec.split(desired, bucket, context)
    const legacyParts = state.legacy ? codec.split(state.legacy.set, bucket, context) : new Map<string, S>()
    const jobs: { shard: string; next: S; expectedRev: number }[] = []
    for (const [shard, part] of [...parts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const stored = state.shards.get(shard)
      const held = codec.merge([...(legacyParts.has(shard) ? [legacyParts.get(shard)!] : []), ...(stored ? [stored.set] : [])], bucket)
      const next = codec.merge([held, part], bucket)
      if (codec.signature(next, bucket) === codec.signature(held, bucket)) continue
      // A shard this page has not seen: 0 inserts it, and conflicts with one another device made meanwhile.
      jobs.push({ shard, next, expectedRev: stored?.rev ?? 0 })
    }
    let conflict = false
    let failure: unknown = null
    const written: string[] = []
    let at = 0
    const worker = async () => {
      while (at < jobs.length) {
        const job = jobs[at++]
        const key = shardKey(base, job.shard)
        try {
          const row = await transport.commit(key, codec.value(job.next, bucket), job.expectedRev)
          if (versionedWriteApplied(row) && row) {
            store(state, bucket, { key, value: row.value, rev: coerceRev(row.rev) ?? 0, updatedAt: row.updated_at ?? null }, true)
            written.push(job.shard)
          } else if (row?.conflict === true) {
            conflict = true
            const rev = coerceRev(row.rev)
            if (rev === undefined || row.value === undefined) { if (state.shards.delete(job.shard)) state.version++ }
            else store(state, bucket, { key, value: row.value, rev, updatedAt: row.updated_at ?? null }, false)
          } else {
            failure ??= new Error('user data commit was not applied')
          }
        } catch (error) {
          failure ??= error
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(COMMIT_CONCURRENCY, jobs.length) }, worker))
    if (failure && !conflict) throw failure
    return { applied: !conflict && !failure, conflict, row: snapshot(state, bucket), written }
  }

  return {
    read,
    commit,
    /** Tests and diagnostics: the shards this page holds for a book. */
    shardsOf: (bucket: string) => sortedShards(stateOf(bucket)),
  }
}
