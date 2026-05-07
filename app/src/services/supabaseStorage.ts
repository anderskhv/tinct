/**
 * Supabase-backed storage provider.
 * Replaces localStorage for authenticated users.
 * Falls back gracefully if Supabase is unavailable.
 * Supports real-time sync: subscribes to changes from other devices.
 */
import { supabase } from './supabase'
import type { StorageProvider } from './storage'
import { localStorageProvider } from './storage'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type StorageChangeListener = (key: string, value: unknown) => void

export class SupabaseStorageProvider implements StorageProvider {
  private userId: string
  private cache: Map<string, unknown> = new Map()
  private channel: RealtimeChannel | null = null
  private listeners: StorageChangeListener[] = []
  /** Keys written locally in the last 2s — used to ignore our own echo */
  private recentLocalWrites: Map<string, number> = new Map()

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Two-phase init (2026-05-07).
   *
   *   Phase A — `init()`: small fast query for the keys the app needs to
   *   render correctly on cold start. Returns when this phase completes.
   *   Roughly: tinct-current-book, library, preferences, tour-seen, all
   *   per-book metadata (position, progress, reading-log, reading-speed,
   *   reading-angle, book-onboarded). For accounts with hundreds of rows
   *   this is ~50-80 rows and finishes in well under a second.
   *
   *   Phase B — `loadHeavy()` (background): everything else. Notes,
   *   highlights, chat-history. These are the rows that grow without bound
   *   for active users. Loaded asynchronously after Phase A; the cache
   *   populates incrementally. Hooks that need this data (Feed, Chat,
   *   highlight rendering) can call `prefetchPrefix()` to ensure they have
   *   what they need.
   *
   *   Net effect for Anders's 579-row account: cold-start init drops from
   *   ~3-5s to under 1s. Heavy data loads in the background without
   *   blocking the reader.
   */
  async init(): Promise<void> {
    if (!supabase) return
    const orFilter = [
      'key.in.(tinct-current-book,tinct-tour-seen,library,preferences,audio-speed)',
      'key.like.position:*',
      'key.like.progress:*',
      'key.like.reading-log:*',
      'key.like.reading-speed:*',
      'key.like.book-onboarded:*',
      'key.like.reading-angle:*',
    ].join(',')
    const { data } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', this.userId)
      .or(orFilter)

    if (data) {
      for (const row of data) {
        this.cache.set(row.key, row.value)
        // Mirror to localStorage so a future offline session has the data
        // available even if init() can't reach the network. Without this,
        // a wipe + offline-init = no `tinct-tour-seen`, tour re-fires.
        // (2026-05-07 fix.)
        localStorageProvider.set(row.key, row.value)
      }
    }
    this.initSucceeded = true
    // Kick off Phase B in the background — don't await. UI is already free
    // to render with the critical data we just loaded.
    void this.loadHeavy()
  }

  private initSucceeded = false
  /** True if at least one Phase A init() call has completed successfully. */
  hasInitSucceeded(): boolean { return this.initSucceeded }

  private heavyLoaded = false
  private heavyLoadPromise: Promise<void> | null = null

  /** Background-load the rows excluded from Phase A. Idempotent. */
  async loadHeavy(): Promise<void> {
    if (!supabase) return
    if (this.heavyLoaded) return
    if (this.heavyLoadPromise) return this.heavyLoadPromise
    this.heavyLoadPromise = (async () => {
      try {
        const orFilter = [
          'key.like.notes:*',
          'key.like.highlights:*',
          'key.like.chat-history:*',
        ].join(',')
        const { data, error } = await supabase!
          .from('user_data')
          .select('key, value')
          .eq('user_id', this.userId)
          .or(orFilter)
        if (error) {
          console.warn('[Supabase] heavy-load failed:', error.message)
          return
        }
        if (data) {
          for (const row of data) {
            // Only set if not already in cache — don't clobber recent writes.
            if (!this.cache.has(row.key)) {
              this.cache.set(row.key, row.value)
              // Same mirror logic as Phase A — preserve heavy data in
              // localStorage for offline access on future sessions.
              localStorageProvider.set(row.key, row.value)
            }
          }
        }
        this.heavyLoaded = true
        // Notify listeners so components dependent on these keys re-render.
        // We notify with a synthetic key so panels can refresh without
        // having to know individual keys changed.
        for (const listener of this.listeners) {
          listener('__heavy_loaded__', true)
        }
      } catch (e) {
        console.warn('[Supabase] heavy-load threw:', e)
      } finally {
        this.heavyLoadPromise = null
      }
    })()
    return this.heavyLoadPromise
  }

  /** True if Phase B has populated the cache. Used by hooks to know
   *  whether a cache miss means "not in cloud" vs "not yet loaded". */
  isHeavyLoaded(): boolean {
    return this.heavyLoaded
  }

  get<T>(key: string): T | null {
    const val = this.cache.get(key)
    if (val !== undefined) return val as T
    // Cache miss → fall through to localStorage. The cache is hydrated by
    // init() (full re-fetch from cloud) and by set() (every write also lands
    // in localStorage). So a cache miss on a returning device means init()
    // hasn't completed yet OR the user is offline. localStorage holds the
    // last-known value either way — strictly better than returning null,
    // which causes the app to show defaults (e.g. Odyssey instead of the
    // book the user was actually reading) until cloud restore lands seconds
    // later. This was the cause of "Macbeth opened instead of The Awakening".
    return localStorageProvider.get<T>(key)
  }

  set<T>(key: string, value: T): void {
    if (!supabase) return
    this.cache.set(key, value)
    // Always write to localStorage as fast cache for next page load
    localStorageProvider.set(key, value)
    // Track this write so we can ignore the real-time echo
    this.recentLocalWrites.set(key, Date.now())
    this.upsertWithRetry(key, value)
  }

  /**
   * Upsert with one retry on transient failures (network blip, expired JWT
   * that the client will refresh on the next call). We don't want a single
   * dropped write to lose the user's reading position. Logs both attempts to
   * window.__tinctSupabaseDebug so we can audit silent failures in DevTools.
   *
   * If both attempts fail (offline, persistent error), the write is enqueued
   * to a persistent retry queue (`tinct:pending-writes`) and replayed when:
   *   - the browser fires `online`
   *   - any subsequent upsert succeeds (proves the connection is back)
   */
  private async upsertWithRetry<T>(key: string, value: T, attempt = 1): Promise<void> {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert(
          { user_id: this.userId, key, value },
          { onConflict: 'user_id,key' }
        )
      if (error) {
        if (attempt === 1) {
          // Transient — retry once after 2s. Most "JWT expired" / "Failed to
          // fetch" errors clear themselves once the supabase-js client refreshes.
          setTimeout(() => { void this.upsertWithRetry(key, value, 2) }, 2000)
        } else {
          // Both attempts failed — queue for replay.
          enqueuePendingWrite({ userId: this.userId, key, value })
        }
        this.recordError(key, error.message, attempt, value)
        console.warn(`[Supabase] write failed (attempt ${attempt}) key=${key}:`, error.message)
        return
      }
      this.recordSuccess(key, attempt, value)
      // A successful write proves the connection is alive — drain any
      // backlog from earlier offline period.
      void drainPendingQueue()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt === 1) {
        setTimeout(() => { void this.upsertWithRetry(key, value, 2) }, 2000)
      } else {
        enqueuePendingWrite({ userId: this.userId, key, value })
      }
      this.recordError(key, msg, attempt, value)
      console.warn(`[Supabase] write threw (attempt ${attempt}) key=${key}:`, msg)
    }
  }

  private getDebug(): {
    lastSuccessAt: number; lastSuccessKey: string; successCount: number;
    lastErrorAt: number; lastErrorKey: string; lastErrorMessage: string; errorCount: number;
    upsertLog?: Array<{ at: number; key: string; attempt: number; result: 'success' | 'error'; error?: string; valueDigest?: string }>;
  } | null {
    if (typeof window === 'undefined') return null
    const w = window as unknown as { __tinctSupabaseDebug?: ReturnType<SupabaseStorageProvider['getDebug']> }
    const dbg = w.__tinctSupabaseDebug ?? { lastSuccessAt: 0, lastSuccessKey: '', successCount: 0, lastErrorAt: 0, lastErrorKey: '', lastErrorMessage: '', errorCount: 0 }
    w.__tinctSupabaseDebug = dbg
    return dbg
  }

  /** Append to a 30-entry ring buffer so we can audit per-key success/failure
   *  in DevTools. Critical for diagnosing the silent-write-failure pattern
   *  where errorCount=0 but cloud doesn't reflect the latest write. */
  private logUpsert(entry: { at: number; key: string; attempt: number; result: 'success' | 'error'; error?: string; valueDigest?: string }): void {
    const dbg = this.getDebug()
    if (!dbg) return
    dbg.upsertLog = dbg.upsertLog ?? []
    dbg.upsertLog.push(entry)
    if (dbg.upsertLog.length > 30) dbg.upsertLog.shift()
  }

  /** Short stable digest of the value being written — enough to spot which
   *  position was being upserted without dumping the full object. */
  private digest(value: unknown): string {
    try {
      if (value && typeof value === 'object') {
        const v = value as { chapterNumber?: unknown; currentPage?: unknown; scrollFraction?: unknown; lastParagraphIndex?: unknown }
        if ('chapterNumber' in v && 'scrollFraction' in v) {
          const frac = typeof v.scrollFraction === 'number' ? v.scrollFraction.toFixed(3) : '?'
          return `ch${v.chapterNumber}/p${v.currentPage}/f${frac}/par${v.lastParagraphIndex ?? '?'}`
        }
      }
      return String(value).slice(0, 40)
    } catch {
      return '<digest-error>'
    }
  }

  private recordSuccess(key: string, attempt = 1, value?: unknown): void {
    const dbg = this.getDebug()
    if (!dbg) return
    dbg.lastSuccessAt = Date.now()
    dbg.lastSuccessKey = key
    dbg.successCount += 1
    this.logUpsert({ at: Date.now(), key, attempt, result: 'success', valueDigest: value !== undefined ? this.digest(value) : undefined })
  }

  private recordError(key: string, message: string, attempt: number, value?: unknown): void {
    const dbg = this.getDebug()
    if (!dbg) return
    dbg.lastErrorAt = Date.now()
    dbg.lastErrorKey = key
    dbg.lastErrorMessage = `attempt ${attempt}: ${message}`
    dbg.errorCount += 1
    this.logUpsert({ at: Date.now(), key, attempt, result: 'error', error: message, valueDigest: value !== undefined ? this.digest(value) : undefined })
  }

  delete(key: string): void {
    if (!supabase) return
    this.cache.delete(key)
    // Also delete from localStorage — parity with set() which writes to both.
    // Without this, the session-startup migration reads the stale localStorage
    // value and writes it back to Supabase, resurrecting deleted data.
    localStorageProvider.delete(key)
    this.recentLocalWrites.set(key, Date.now())
    supabase
      .from('user_data')
      .delete()
      .eq('user_id', this.userId)
      .eq('key', key)
      .then(({ error }) => {
        if (error) console.warn('Supabase delete failed:', error.message)
      })
  }

  getAll<T>(prefix: string): T[] {
    const results: T[] = []
    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(prefix)) {
        results.push(value as T)
      }
    }
    return results
  }

  /** Re-fetch all user data from Supabase (same as init, but callable repeatedly) */
  async refresh(): Promise<void> {
    if (!supabase) return
    const { data } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', this.userId)

    if (data) {
      this.cache.clear()
      for (const row of data) {
        this.cache.set(row.key, row.value)
      }
    }
  }

  /** Subscribe to real-time changes from other devices. Best-effort: if the
   * WebSocket can't open (CSP, corp firewall, browser policy), we swallow the
   * error so the caller's initialization can complete. Persistence over REST
   * keeps working without realtime. */
  subscribe(): void {
    if (!supabase) return
    try {
      this.channel = supabase
        .channel(`user_data:${this.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_data',
            filter: `user_id=eq.${this.userId}`,
          },
          (payload) => {
            const row = (payload.new as { key?: string; value?: unknown }) || {}
            if (!row.key) return
            // Ignore echoes from our own writes (within 2 seconds)
            const lastWrite = this.recentLocalWrites.get(row.key)
            if (lastWrite && Date.now() - lastWrite < 4000) {
              this.recentLocalWrites.delete(row.key)
              return
            }
            // Remote change — update cache, localStorage, and notify listeners
            this.cache.set(row.key, row.value)
            localStorageProvider.set(row.key, row.value)
            for (const listener of this.listeners) {
              listener(row.key, row.value)
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('[SupabaseStorage] realtime subscribe failed:', e)
      this.channel = null
    }
  }

  /** Unsubscribe from real-time changes */
  unsubscribe(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
  }

  /** Register a listener for remote storage changes */
  onChange(listener: StorageChangeListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Pending-writes queue (offline-then-online sync, 2026-05-06)
// ────────────────────────────────────────────────────────────────────────────
//
// When a Supabase upsert fails twice (offline, JWT can't refresh, transient
// network), the write lands here and is replayed on:
//   - `online` event (browser detects connection restored)
//   - any successful upsert (proves connection is back)
//
// Persistence: writes are flushed to localStorage `tinct:pending-writes` so
// queued items survive tab close / app restart / device sleep. Most-recent
// write per key wins (collapses duplicates — for position keys, only the
// latest matters).

const PENDING_KEY = 'tinct:pending-writes'

interface PendingWrite {
  userId: string
  key: string
  value: unknown
  queuedAt: number
}

function loadPending(): Map<string, PendingWrite> {
  const map = new Map<string, PendingWrite>()
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as PendingWrite[]
      for (const w of arr) {
        // Key by userId+key so we collapse duplicates (most-recent wins).
        map.set(`${w.userId}::${w.key}`, w)
      }
    }
  } catch { /* ignore malformed */ }
  return map
}

function savePending(map: Map<string, PendingWrite>): void {
  try {
    if (map.size === 0) {
      localStorage.removeItem(PENDING_KEY)
    } else {
      localStorage.setItem(PENDING_KEY, JSON.stringify(Array.from(map.values())))
    }
  } catch { /* localStorage full or disabled */ }
}

export function enqueuePendingWrite(args: { userId: string; key: string; value: unknown }): void {
  const map = loadPending()
  map.set(`${args.userId}::${args.key}`, { ...args, queuedAt: Date.now() })
  savePending(map)
}

export function pendingWriteCount(): number {
  return loadPending().size
}

let drainInFlight = false
export async function drainPendingQueue(): Promise<void> {
  if (drainInFlight) return
  if (!supabase) return
  const map = loadPending()
  if (map.size === 0) return
  drainInFlight = true
  try {
    for (const [k, write] of Array.from(map.entries())) {
      try {
        const { error } = await supabase
          .from('user_data')
          .upsert(
            { user_id: write.userId, key: write.key, value: write.value },
            { onConflict: 'user_id,key' }
          )
        if (!error) {
          map.delete(k)
        } else {
          // Still failing — leave in queue, give up this drain pass.
          break
        }
      } catch {
        break
      }
    }
    savePending(map)
  } finally {
    drainInFlight = false
  }
}

// Browser online event — drain immediately.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void drainPendingQueue() })
}
