import { supabase } from '../services/supabase'
import { coerceRev, versionedWriteApplied, type VersionedStorageRow } from '../services/supabaseStorage.versioning'
import { highlightWrittenAt } from './labHighlightContentMigration'
import { readLabHighlights, writeLabHighlights, type LabHighlight } from './labHighlights'
import { isUserBookId } from './userBook/userBookId'

/**
 * Highlights and notes across a signed-in reader's devices.
 *
 * The device copy stays where it always was (`tinct-lab-highlights`, one list
 * for every book). Signed in, each book also has one cloud row in `user_data`,
 * key `lab-highlights:{bookId}`, written through the versioned
 * `commit_user_data` RPC with an expected rev (invariant 9). Marks saved
 * before the reader recorded their book live in `lab-highlights:_unassigned`.
 *
 * The `lab-` prefix keeps these rows apart from the retired classic reader's
 * `highlights:{bookId}:{chapter}` rows, which hold a different shape.
 *
 * Merge rule (`mergeLabHighlightSets`): union by highlight id; for one id the
 * copy with the newer `updatedAt` wins (marks from before timestamps fall back
 * to the creation time in their id). A deletion is a tombstone `{id,
 * deletedAt}` that is kept for good and always beats the mark, so a deleted
 * highlight never comes back from a device that still holds it.
 *
 * Signed out nothing here talks to the network; the device list behaves as
 * before (deletions additionally leave a small local tombstone, so they still
 * hold if the reader signs in later).
 */

export const LAB_HIGHLIGHTS_UNASSIGNED = '_unassigned'
export const LAB_HIGHLIGHT_TOMBSTONES_KEY = 'tinct-lab-highlight-tombstones'
const MAX_LOCAL_TOMBSTONES = 5000

export interface LabHighlightTombstone {
  id: string
  bookId?: string
  deletedAt: number
}

export interface LabHighlightSet {
  highlights: LabHighlight[]
  deleted: LabHighlightTombstone[]
}

/** The stored value of one `lab-highlights:{bookId}` row. */
export interface LabHighlightRowValue extends LabHighlightSet {
  v: 1
}

const EMPTY: LabHighlightSet = { highlights: [], deleted: [] }

export function labHighlightBucket(highlight: { bookId?: string }): string {
  return highlight.bookId || LAB_HIGHLIGHTS_UNASSIGNED
}

export function labHighlightsKey(bucket: string): string {
  return `lab-highlights:${bucket || LAB_HIGHLIGHTS_UNASSIGNED}`
}

/** When this copy of a mark was last changed; marks from before timestamps use their creation time. */
export function highlightUpdatedAt(highlight: Pick<LabHighlight, 'id' | 'updatedAt'>): number {
  if (typeof highlight.updatedAt === 'number' && Number.isFinite(highlight.updatedAt)) return highlight.updatedAt
  return highlightWrittenAt(highlight) ?? 0
}

function creationOrder(a: LabHighlight, b: LabHighlight): number {
  return (highlightWrittenAt(a) ?? 0) - (highlightWrittenAt(b) ?? 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/**
 * Union of any number of sets: newer `updatedAt` wins per id (an exact tie is
 * settled by content, so every device picks the same copy), tombstones keep
 * the latest `deletedAt` and remove the mark. Output order is stable
 * (creation time, then id), so equal sets serialize identically.
 */
export function mergeLabHighlightSets(...sets: LabHighlightSet[]): LabHighlightSet {
  const deleted = new Map<string, LabHighlightTombstone>()
  const live = new Map<string, LabHighlight>()
  for (const set of sets) {
    for (const tombstone of set.deleted) {
      const current = deleted.get(tombstone.id)
      if (!current || tombstone.deletedAt > current.deletedAt) deleted.set(tombstone.id, tombstone)
    }
    for (const highlight of set.highlights) {
      const current = live.get(highlight.id)
      if (!current) { live.set(highlight.id, highlight); continue }
      const a = highlightUpdatedAt(current), b = highlightUpdatedAt(highlight)
      if (b > a || (b === a && JSON.stringify(highlight) > JSON.stringify(current))) live.set(highlight.id, highlight)
    }
  }
  return {
    highlights: [...live.values()].filter(highlight => !deleted.has(highlight.id)).sort(creationOrder),
    deleted: [...deleted.values()].sort((a, b) => a.deletedAt - b.deletedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
  }
}

export function labHighlightSetSignature(set: LabHighlightSet): string {
  return JSON.stringify(mergeLabHighlightSets(set))
}

export function sameLabHighlightSet(a: LabHighlightSet, b: LabHighlightSet): boolean {
  return labHighlightSetSignature(a) === labHighlightSetSignature(b)
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function parseHighlight(raw: unknown, bucket: string): LabHighlight | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (typeof src.color !== 'string' || !src.color) return null
  if (!isInt(src.chapterNumber, 0, 100_000)) return null
  for (const field of ['paragraphIndex', 'fromWord', 'endParagraphIndex', 'toWord'] as const) {
    if (!isInt(src[field], 0, 10_000_000)) return null
  }
  const bookId = typeof src.bookId === 'string' && src.bookId ? src.bookId : undefined
  if ((bookId ?? LAB_HIGHLIGHTS_UNASSIGNED) !== bucket) return null
  return src as unknown as LabHighlight
}

function parseTombstone(raw: unknown, bucket: string): LabHighlightTombstone | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const src = raw as Record<string, unknown>
  if (typeof src.id !== 'string' || !src.id || src.id.length > 160) return null
  if (typeof src.deletedAt !== 'number' || !Number.isFinite(src.deletedAt) || src.deletedAt <= 0) return null
  const bookId = typeof src.bookId === 'string' && src.bookId ? src.bookId : undefined
  if (bookId && bookId !== bucket) return null
  return { id: src.id, ...(bookId ? { bookId } : {}), deletedAt: src.deletedAt }
}

/** Sanitize a stored row value. Never throws; unknown shapes and a deleted row (`null`) read as empty. */
export function parseLabHighlightRow(raw: unknown, bucket: string): LabHighlightSet {
  if (!raw || typeof raw !== 'object') return { highlights: [], deleted: [] }
  const src = raw as Record<string, unknown>
  const highlights = Array.isArray(src.highlights) ? src.highlights : Array.isArray(raw) ? raw : []
  const deleted = Array.isArray(src.deleted) ? src.deleted : []
  return mergeLabHighlightSets({
    highlights: highlights.map(item => parseHighlight(item, bucket)).filter((item): item is LabHighlight => item !== null),
    deleted: deleted.map(item => parseTombstone(item, bucket)).filter((item): item is LabHighlightTombstone => item !== null),
  })
}

export function labHighlightRowValue(set: LabHighlightSet): LabHighlightRowValue {
  const merged = mergeLabHighlightSets(set)
  return { v: 1, highlights: merged.highlights, deleted: merged.deleted }
}

// ---------------------------------------------------------------------------
// Device copy

export function readLabHighlightTombstones(): LabHighlightTombstone[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(LAB_HIGHLIGHT_TOMBSTONES_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap(item => {
      const bucket = item && typeof item === 'object' && typeof item.bookId === 'string' && item.bookId ? item.bookId : LAB_HIGHLIGHTS_UNASSIGNED
      const tombstone = parseTombstone(item, bucket)
      return tombstone ? [tombstone] : []
    })
  } catch {
    return []
  }
}

function writeLabHighlightTombstones(tombstones: LabHighlightTombstone[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LAB_HIGHLIGHT_TOMBSTONES_KEY, JSON.stringify(tombstones.slice(-MAX_LOCAL_TOMBSTONES)))
  } catch {
    /* quota */
  }
}

function mergeLocalTombstones(incoming: LabHighlightTombstone[]): void {
  if (!incoming.length) return
  const current = readLabHighlightTombstones()
  const merged = mergeLabHighlightSets({ highlights: [], deleted: current }, { highlights: [], deleted: incoming }).deleted
  if (JSON.stringify(merged) !== JSON.stringify(current)) writeLabHighlightTombstones(merged)
}

/** Remember deleted marks so the deletion reaches, and holds on, every device. */
export function recordLabHighlightDeletions(removed: Pick<LabHighlight, 'id' | 'bookId'>[], now = Date.now()): void {
  mergeLocalTombstones(removed.map(highlight => ({ id: highlight.id, ...(highlight.bookId ? { bookId: highlight.bookId } : {}), deletedAt: now })))
}

export function labHighlightSetFor(bucket: string, highlights: LabHighlight[], tombstones: LabHighlightTombstone[]): LabHighlightSet {
  return {
    highlights: highlights.filter(highlight => labHighlightBucket(highlight) === bucket),
    deleted: tombstones.filter(tombstone => (tombstone.bookId || LAB_HIGHLIGHTS_UNASSIGNED) === bucket),
  }
}

export function readLocalLabHighlightSet(bucket: string): LabHighlightSet {
  return labHighlightSetFor(bucket, readLabHighlights(), readLabHighlightTombstones())
}

/** Every book (and the unassigned bucket) this device holds marks or deletions for. */
export function localLabHighlightBuckets(): string[] {
  const buckets = new Set<string>()
  for (const highlight of readLabHighlights()) buckets.add(labHighlightBucket(highlight))
  for (const tombstone of readLabHighlightTombstones()) buckets.add(tombstone.bookId || LAB_HIGHLIGHTS_UNASSIGNED)
  return [...buckets]
}

/**
 * Fold a set into one bucket of a full highlight list. Returns the same array
 * when nothing changes, so React state is left alone. Other books' marks are
 * untouched.
 */
export function applyLabHighlightSet(list: LabHighlight[], bucket: string, set: LabHighlightSet): LabHighlight[] {
  const mine = list.filter(highlight => labHighlightBucket(highlight) === bucket)
  const merged = mergeLabHighlightSets({ highlights: mine, deleted: [] }, set).highlights
  const sorted = [...mine].sort(creationOrder)
  if (JSON.stringify(sorted) === JSON.stringify(merged)) return list
  return [...list.filter(highlight => labHighlightBucket(highlight) !== bucket), ...merged]
}

/** Merge a set into the device copy (never a plain overwrite). Returns the bucket as stored. */
export function writeLocalLabHighlightSet(bucket: string, set: LabHighlightSet): LabHighlightSet {
  mergeLocalTombstones(set.deleted)
  const current = readLabHighlights()
  const next = applyLabHighlightSet(current, bucket, { highlights: set.highlights, deleted: readLabHighlightTombstones() })
  if (next !== current) writeLabHighlights(next)
  return mergeLabHighlightSets(readLocalLabHighlightSet(bucket))
}

// ---------------------------------------------------------------------------
// Cloud row

export interface LabHighlightCloudRow {
  set: LabHighlightSet
  rev: number
}

export interface LabHighlightCloudCommitResult {
  applied: boolean
  conflict: boolean
  row: LabHighlightCloudRow | null
}

export interface LabHighlightCloud {
  read(bucket: string): Promise<LabHighlightCloudRow | null>
  commit(bucket: string, set: LabHighlightSet, expectedRev: number | null): Promise<LabHighlightCloudCommitResult>
}

type SupabaseLike = NonNullable<typeof supabase>

function rowFromVersioned(row: VersionedStorageRow | null | undefined, bucket: string): LabHighlightCloudRow | null {
  if (!row) return null
  return { set: parseLabHighlightRow(row.value, bucket), rev: coerceRev(row.rev) ?? 0 }
}

export function createLabHighlightCloud(userId: string, client: SupabaseLike | null = supabase): LabHighlightCloud | null {
  if (!client || !userId) return null
  return {
    async read(bucket) {
      const { data, error } = await client
        .from('user_data')
        .select('key, value, rev')
        .eq('user_id', userId)
        .eq('key', labHighlightsKey(bucket))
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data ? rowFromVersioned(data as VersionedStorageRow, bucket) : null
    },
    async commit(bucket, set, expectedRev) {
      const { data, error } = await client.rpc('commit_user_data', {
        p_user_id: userId,
        p_key: labHighlightsKey(bucket),
        p_value: labHighlightRowValue(set),
        p_expected_rev: expectedRev ?? null,
      })
      if (error) throw new Error(error.message)
      const row = (Array.isArray(data) ? data[0] : data) as VersionedStorageRow | undefined
      const applied = versionedWriteApplied(row)
      return { applied, conflict: !applied && row?.conflict === true, row: rowFromVersioned(row, bucket) }
    },
  }
}

/**
 * Serialized cloud sync for highlight rows, one operation in flight per book.
 *
 * - `sync(bucket)` reads the row, merges it with the device copy, stores the
 *   merge locally and commits it when the cloud lacks anything (expected rev;
 *   a conflict adopts the server row, merges again and retries once).
 * - `push(bucket, set)` sends a local change. Without a known rev it syncs
 *   first, so a first write never blindly replaces another device's row.
 *
 * Every merge that may hold marks from elsewhere is handed to `onMerged`, so
 * the reader's in-memory list can fold it in. Failures leave the device copy
 * as it is; the next sync (open, reconnect, focus) carries it up.
 */
export function createLabHighlightCloudWriter(cloud: LabHighlightCloud, options: { onMerged?: (bucket: string, set: LabHighlightSet) => void } = {}) {
  const revs = new Map<string, number>()
  /** Signature of what the cloud row is known to hold. */
  const known = new Map<string, string>()
  const queued = new Map<string, LabHighlightSet>()
  const chains = new Map<string, Promise<unknown>>()
  let dirty = false
  let disposed = false

  const serial = <T>(bucket: string, fn: () => Promise<T>): Promise<T> => {
    const next = (chains.get(bucket) ?? Promise.resolve()).catch(() => undefined).then(fn)
    chains.set(bucket, next.catch(() => undefined))
    return next
  }

  const settled = (bucket: string, row: LabHighlightCloudRow) => {
    revs.set(bucket, row.rev)
    known.set(bucket, labHighlightSetSignature(row.set))
  }

  const merged = (bucket: string, set: LabHighlightSet) => {
    if (!disposed) options.onMerged?.(bucket, set)
  }

  const syncNow = async (bucket: string): Promise<LabHighlightSet | null> => {
    if (disposed) return null
    try {
      let row = await cloud.read(bucket)
      for (let attempt = 0; attempt < 2 && !disposed; attempt++) {
        const local = writeLocalLabHighlightSet(bucket, row?.set ?? EMPTY)
        if (row && sameLabHighlightSet(row.set, local)) {
          settled(bucket, row)
          dirty = false
          merged(bucket, local)
          return local
        }
        if (!row && local.highlights.length === 0 && local.deleted.length === 0) {
          merged(bucket, local)
          return local
        }
        const result = await cloud.commit(bucket, local, row?.rev ?? null)
        if (result.applied) {
          if (result.row) settled(bucket, result.row)
          dirty = false
          merged(bucket, local)
          return local
        }
        if (!result.conflict || !result.row) break
        row = result.row
      }
      dirty = true
      const local = readLocalLabHighlightSet(bucket)
      merged(bucket, local)
      return local
    } catch {
      dirty = true
      return null
    }
  }

  const flush = async (bucket: string): Promise<void> => {
    const value = queued.get(bucket)
    queued.delete(bucket)
    if (!value || disposed) return
    if (known.get(bucket) === labHighlightSetSignature(value)) return
    if (!revs.has(bucket)) { await syncNow(bucket); return }
    try {
      const result = await cloud.commit(bucket, value, revs.get(bucket) ?? null)
      if (result.applied) {
        if (result.row) settled(bucket, result.row)
        dirty = false
        return
      }
      if (result.conflict && result.row) {
        const next = writeLocalLabHighlightSet(bucket, mergeLabHighlightSets(result.row.set, value))
        merged(bucket, next)
        if (sameLabHighlightSet(result.row.set, next)) { settled(bucket, result.row); dirty = false; return }
        const retry = await cloud.commit(bucket, next, result.row.rev)
        if (retry.applied && retry.row) { settled(bucket, retry.row); dirty = false; return }
      }
      dirty = true
    } catch {
      dirty = true
    }
  }

  return {
    push(bucket: string, set: LabHighlightSet) {
      // A reader's own book keeps its marks on this device (lab/userBook).
      if (isUserBookId(bucket)) return
      if (disposed || known.get(bucket) === labHighlightSetSignature(set)) return
      const waiting = queued.has(bucket)
      queued.set(bucket, set)
      if (!waiting) void serial(bucket, () => flush(bucket))
    },
    sync(bucket: string) {
      if (isUserBookId(bucket)) return Promise.resolve(readLocalLabHighlightSet(bucket))
      return serial(bucket, () => syncNow(bucket))
    },
    dispose() { disposed = true; queued.clear() },
    isDirty: () => dirty,
    revs,
  }
}

export type LabHighlightCloudWriter = ReturnType<typeof createLabHighlightCloudWriter>
