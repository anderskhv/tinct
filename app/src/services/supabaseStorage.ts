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
import { coerceRev, shouldFallbackToLegacyUserDataWrite, versionedWriteApplied, type VersionedStorageRow } from './supabaseStorage.versioning'

export type StorageChangeSource = 'broadcast' | 'realtime' | 'local'
export type StorageChangeListener = (key: string, value: unknown, meta?: { source: StorageChangeSource }) => void

function isCriticalUserDataKey(key: string): boolean {
  return (
    key === 'library' ||
    key === 'tinct-current-book' ||
    key.startsWith('position:') ||
    key.startsWith('reading-log:')
  )
}

export class SupabaseStorageProvider implements StorageProvider {
  private userId: string
  private cache: Map<string, unknown> = new Map()
  private revs: Map<string, number> = new Map()
  private channel: RealtimeChannel | null = null
  private listeners: StorageChangeListener[] = []
  /** Keys written locally in the last 2s — used to ignore our own echo */
  private recentLocalWrites: Map<string, number> = new Map()
  /** Latest unsent value per key while a versioned commit is in flight. */
  private queuedCommits: Map<string, unknown> = new Map()
  private commitInFlight: Set<string> = new Set()
  /** Same-browser tab-to-tab fanout (Phase 4.3). Open per provider; closed
   *  on unsubscribe. */
  private bc: BroadcastChannel | null = null
  /** Stable id used to ignore our own BroadcastChannel echoes. */
  private bcSenderId: string = `${Math.random().toString(36).slice(2)}-${Date.now()}`

  constructor(userId: string) {
    this.userId = userId
    this.openBroadcastChannel()
  }

  /** Opens the per-user BroadcastChannel (Phase 4.3) and wires it through
   *  the same `onChange` callback path the Supabase realtime channel uses.
   *  Same-browser tabs receive each other's writes near-instantly without
   *  a Supabase round-trip. Falls back to no-op on browsers without
   *  BroadcastChannel (very old Safari). */
  private openBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') return
    try {
      this.bc = new BroadcastChannel(`tinct-storage:${this.userId}`)
      this.bc.onmessage = (ev: MessageEvent<{ senderId: string; key: string; value: unknown; deleted?: boolean; rev?: number }>) => {
        const msg = ev.data
        if (!msg || typeof msg.key !== 'string') return
        // Drop our own echoes. Without senderId, every tab would notify
        // itself on its own writes (some browsers do, some don't —
        // depending on this is brittle).
        if (msg.senderId === this.bcSenderId) return
        // Same race-guards as the realtime path: ignore writes we just
        // made locally (prevents a remote-then-local-then-remote loop).
        const lastWrite = this.recentLocalWrites.get(msg.key)
        if (lastWrite && Date.now() - lastWrite < 4000) {
          this.recentLocalWrites.delete(msg.key)
          return
        }
        if (msg.deleted) {
          this.cache.delete(msg.key)
          localStorageProvider.delete(msg.key)
        } else {
          this.cache.set(msg.key, msg.value)
          localStorageProvider.set(msg.key, msg.value)
        }
        this.rememberRev(msg.key, msg.rev)
        for (const listener of this.listeners) {
          listener(msg.key, msg.deleted ? null : msg.value, { source: 'broadcast' })
        }
      }
    } catch (e) {
      console.warn('[SupabaseStorage] BroadcastChannel open failed:', e)
      this.bc = null
    }
  }

  /** Best-effort fanout to other tabs in this browser. */
  private bcEmit(key: string, value: unknown, deleted = false): void {
    if (!this.bc) return
    try {
      this.bc.postMessage({ senderId: this.bcSenderId, key, value, deleted, rev: this.revs.get(key) })
    } catch { /* clone error or channel closed — ignore */ }
  }

  /**
   * Two-phase init (2026-05-07).
   *
   *   Critical restore — `initCritical()`: the smallest query needed to pick
   *   the correct book/chapter before the reader renders. This keeps position
   *   accuracy without waiting for progress/log rows.
   *
   *   Phase A — `init()`: broader query for rows the app needs shortly after
   *   first paint. Returns when this phase completes.
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
  private rememberRev(key: string, rev: unknown): void {
    const parsed = coerceRev(rev)
    if (parsed !== undefined) this.revs.set(key, parsed)
  }

  private forgetRev(key: string): void {
    this.revs.delete(key)
  }

  private applyRemoteRow(row: VersionedStorageRow, source: StorageChangeSource): void {
    if (!row.key) return
    this.rememberRev(row.key, row.rev)
    if (row.value === null) {
      this.cache.delete(row.key)
      localStorageProvider.delete(row.key)
    } else {
      this.cache.set(row.key, row.value)
      localStorageProvider.set(row.key, row.value)
    }
    for (const listener of this.listeners) {
      listener(row.key, row.value, { source })
    }
  }

  private hydrateRows(rows: VersionedStorageRow[]): void {
    for (const row of rows) {
      const lastWrite = this.recentLocalWrites.get(row.key)
      if (lastWrite && Date.now() - lastWrite < 10_000) continue
      this.rememberRev(row.key, row.rev)
	      if (row.value === null) {
	        this.cache.delete(row.key)
	        localStorageProvider.delete(row.key)
	        continue
	      }
	      this.cache.set(row.key, row.value)
      // Mirror to localStorage so a future offline session has the data
      // available even if init() can't reach the network. Without this,
      // a wipe + offline-init = no `tinct-tour-seen`, tour re-fires.
      // (2026-05-07 fix.)
      localStorageProvider.set(row.key, row.value)
    }
  }

  async initCritical(): Promise<void> {
    if (!supabase) return
    const orFilter = [
      'key.in.(tinct-current-book,tinct-tour-seen,library,preferences,audio-speed)',
	      'key.like.position:*',
	      'key.like.book-completed:*',
	      'key.like.book-onboarded:*',
      'key.like.reading-angle:*',
    ].join(',')
    const { data, error } = await supabase
      .from('user_data')
      .select('key, value, rev')
      .eq('user_id', this.userId)
      .or(orFilter)
    if (error) {
      if (shouldFallbackToLegacyUserDataWrite(error)) {
        const legacy = await supabase
          .from('user_data')
          .select('key, value')
          .eq('user_id', this.userId)
          .or(orFilter)
        if (legacy.error) {
          console.warn('[Supabase] critical init failed:', legacy.error.message)
          throw legacy.error
        }
        if (legacy.data) this.hydrateRows(legacy.data)
        return
      }
      console.warn('[Supabase] critical init failed:', error.message)
      throw error
    }
    if (data) this.hydrateRows(data)
  }

  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (!supabase) return
    if (this.initPromise) return this.initPromise
    this.initPromise = (async () => {
      const orFilter = [
        'key.in.(tinct-current-book,tinct-tour-seen,library,preferences,audio-speed)',
	        'key.like.position:*',
	        'key.like.progress:*',
	        'key.like.book-completed:*',
	        'key.like.reading-log:*',
        'key.like.reading-speed:*',
        'key.like.book-onboarded:*',
        'key.like.reading-angle:*',
      ].join(',')
      const { data, error } = await supabase
        .from('user_data')
        .select('key, value, rev')
        .eq('user_id', this.userId)
        .or(orFilter)

      if (error) {
        if (shouldFallbackToLegacyUserDataWrite(error)) {
          const legacy = await supabase
            .from('user_data')
            .select('key, value')
            .eq('user_id', this.userId)
            .or(orFilter)
          if (legacy.error) {
            console.warn('[Supabase] init failed:', legacy.error.message)
            throw legacy.error
          }
          if (legacy.data) this.hydrateRows(legacy.data)
          this.initSucceeded = true
          void this.loadHeavy()
          return
        }
        console.warn('[Supabase] init failed:', error.message)
        throw error
      }
      if (data) this.hydrateRows(data)
      this.initSucceeded = true
      // Kick off Phase B in the background — don't await. UI is already free
      // to render with the critical data we just loaded.
      void this.loadHeavy()
    })().finally(() => {
      this.initPromise = null
    })
    return this.initPromise
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
          .select('key, value, rev')
          .eq('user_id', this.userId)
          .or(orFilter)
        if (error) {
          if (shouldFallbackToLegacyUserDataWrite(error)) {
            const legacy = await supabase!
              .from('user_data')
              .select('key, value')
              .eq('user_id', this.userId)
              .or(orFilter)
            if (legacy.error) {
              console.warn('[Supabase] heavy-load failed:', legacy.error.message)
              return
            }
            if (legacy.data) this.hydrateRows(legacy.data)
            this.heavyLoaded = true
            for (const listener of this.listeners) {
              listener('__heavy_loaded__', true, { source: 'local' })
            }
            return
          }
          console.warn('[Supabase] heavy-load failed:', error.message)
          return
        }
        if (data) {
	          for (const row of data) {
              this.rememberRev(row.key, row.rev)
	            if (row.value === null) {
	              this.cache.delete(row.key)
	              localStorageProvider.delete(row.key)
	              continue
	            }
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
          listener('__heavy_loaded__', true, { source: 'local' })
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
    const oldValue = this.get(key)
    if (isCriticalUserDataKey(key)) {
      void this.auditWrite(key, oldValue, value)
    }
    this.cache.set(key, value)
    // Always write to localStorage as fast cache for next page load
    localStorageProvider.set(key, value)
    // Track this write so we can ignore the real-time echo
    this.recentLocalWrites.set(key, Date.now())
    // Fan out to same-browser tabs immediately (Phase 4.3) — they get the
    // update without waiting for the Supabase round-trip and back through
    // the WebSocket. Other tabs route this into the same listener chain.
    this.bcEmit(key, value, false)
    this.scheduleVersionedCommit(key, value)
  }

  private scheduleVersionedCommit<T>(key: string, value: T): void {
    this.queuedCommits.set(key, value)
    if (this.commitInFlight.has(key)) return

    this.commitInFlight.add(key)
    void (async () => {
      try {
        while (this.queuedCommits.has(key)) {
          const nextValue = this.queuedCommits.get(key) as T
          this.queuedCommits.delete(key)
          await this.commitWithRetry(key, nextValue, this.revs.get(key))
        }
      } finally {
        this.commitInFlight.delete(key)
        if (this.queuedCommits.has(key)) {
          this.scheduleVersionedCommit(key, this.queuedCommits.get(key))
        }
      }
    })()
  }

  private async auditWrite<T>(key: string, oldValue: unknown, newValue: T): Promise<void> {
    if (!supabase) return
    try {
      await supabase
        .from('user_data_audit')
        .insert({
          user_id: this.userId,
          key,
          old_value: oldValue ?? null,
          new_value: newValue ?? null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        })
    } catch {
      // The audit table may not exist yet in older environments. Storage must
      // keep working; the app build should not depend on this best-effort log.
    }
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
  private async legacyUpsertWithRetry<T>(key: string, value: T, attempt = 1): Promise<void> {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert(
          { user_id: this.userId, key, value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        )
      if (error) {
        if (attempt === 1) {
          // Transient — retry once after 2s. Most "JWT expired" / "Failed to
          // fetch" errors clear themselves once the supabase-js client refreshes.
          setTimeout(() => { void this.legacyUpsertWithRetry(key, value, 2) }, 2000)
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
        setTimeout(() => { void this.legacyUpsertWithRetry(key, value, 2) }, 2000)
      } else {
        enqueuePendingWrite({ userId: this.userId, key, value })
      }
      this.recordError(key, msg, attempt, value)
      console.warn(`[Supabase] write threw (attempt ${attempt}) key=${key}:`, msg)
    }
  }

  private async commitWithRetry<T>(key: string, value: T, expectedRev?: number, attempt = 1): Promise<void> {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .rpc('commit_user_data', {
          p_user_id: this.userId,
          p_key: key,
          p_value: value,
          p_expected_rev: expectedRev ?? null,
        })
      if (error) {
        if (shouldFallbackToLegacyUserDataWrite(error)) {
          void this.legacyUpsertWithRetry(key, value, attempt)
          return
        }
        if (attempt === 1) {
          setTimeout(() => {
            const latestValue = this.cache.has(key) ? this.cache.get(key) : value
            if (this.commitInFlight.has(key)) {
              this.scheduleVersionedCommit(key, latestValue as T)
            } else {
              void this.commitWithRetry(key, latestValue as T, this.revs.get(key), 2)
            }
          }, 2000)
        } else {
          enqueuePendingWrite({ userId: this.userId, key, value })
        }
        this.recordError(key, error.message, attempt, value)
        console.warn(`[Supabase] versioned write failed (attempt ${attempt}) key=${key}:`, error.message)
        return
      }

      const row = Array.isArray(data) ? data[0] as VersionedStorageRow | undefined : data as VersionedStorageRow | undefined
      if (!versionedWriteApplied(row)) {
        if (row?.key) {
          if (this.queuedCommits.has(key)) {
            this.rememberRev(row.key, row.rev)
          } else {
            this.applyRemoteRow(row, 'realtime')
          }
        }
        this.recordError(key, 'version conflict', attempt, value)
        if (!this.queuedCommits.has(key)) {
          console.warn(`[Supabase] version conflict key=${key}; adopted server row`)
        }
        return
      }
      if (row?.key) this.rememberRev(row.key, row.rev)
      this.recordSuccess(key, attempt, value)
      void drainPendingQueue()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt === 1) {
        setTimeout(() => {
          const latestValue = this.cache.has(key) ? this.cache.get(key) : value
          if (this.commitInFlight.has(key)) {
            this.scheduleVersionedCommit(key, latestValue as T)
          } else {
            void this.commitWithRetry(key, latestValue as T, this.revs.get(key), 2)
          }
        }, 2000)
      } else {
        enqueuePendingWrite({ userId: this.userId, key, value })
      }
      this.recordError(key, msg, attempt, value)
      console.warn(`[Supabase] versioned write threw (attempt ${attempt}) key=${key}:`, msg)
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
    // Fan out to same-browser tabs (Phase 4.3) so they drop the cached value.
    this.bcEmit(key, null, true)
    this.scheduleVersionedCommit(key, null)
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

  /** Re-fetch a specific list of keys from Supabase. Updates the cache and
   *  localStorage mirror only for the keys requested — does NOT clear the
   *  rest of the cache. Used by the focus-refresh path which only cares
   *  about a couple of keys (current book + position) and would otherwise
   *  re-pull every row in the user's account on every tab focus.
   *  (Phase 4.1.) */
  async refreshKeys(keys: string[]): Promise<void> {
    if (!supabase) return
    if (keys.length === 0) return
    const { data, error } = await supabase
      .from('user_data')
      .select('key, value, rev')
      .eq('user_id', this.userId)
      .in('key', keys)
    if (error) {
      if (shouldFallbackToLegacyUserDataWrite(error)) {
        const legacy = await supabase
          .from('user_data')
          .select('key, value')
          .eq('user_id', this.userId)
          .in('key', keys)
        if (legacy.error) {
          console.warn('[Supabase] refreshKeys failed:', legacy.error.message)
          return
        }
        if (legacy.data) this.hydrateRows(legacy.data)
        return
      }
      console.warn('[Supabase] refreshKeys failed:', error.message)
      return
    }
    if (data) {
      const seen = new Set<string>()
      for (const row of data) {
        seen.add(row.key)
        this.rememberRev(row.key, row.rev)
	        if (row.value === null) {
	          this.cache.delete(row.key)
	          localStorageProvider.delete(row.key)
	        } else {
	          this.cache.set(row.key, row.value)
	          localStorageProvider.set(row.key, row.value)
	        }
      }
      // Keys requested but not present in the response have been deleted on
      // the server — drop them from the cache so we don't keep returning a
      // stale value. (e.g. a `position:bookId` purged on another device.)
      for (const k of keys) {
        if (!seen.has(k)) {
          this.cache.delete(k)
          localStorageProvider.delete(k)
          this.forgetRev(k)
        }
      }
    }
  }

  /** Backwards-compatible: re-fetches the canonical short list of keys
   *  (current book + active position). Anything outside that list is
   *  better served by a targeted refreshKeys call OR the realtime
   *  subscribe channel, which already streams remote changes. */
  async refresh(currentBookId?: string): Promise<void> {
    const keys = ['tinct-current-book']
    if (currentBookId) keys.push(`position:${currentBookId}`)
    return this.refreshKeys(keys)
  }

  /** Subscribe to real-time changes from other devices. Best-effort: if the
   * WebSocket can't open (CSP, corp firewall, browser policy), we swallow the
   * error so the caller's initialization can complete. Persistence over REST
   * keeps working without realtime.
   *
   * Offline-init retry (Phase 2.2): if subscribe() can't establish the channel
   * (typically because the device booted offline), wire a one-shot `online`
   * listener that re-attempts subscribe when the network returns. Without
   * this, an offline boot leaves the user stuck on REST-only forever — they
   * have to refresh the tab to get realtime back. */
  subscribe(): void {
    if (!supabase) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.armOnlineRetry()
      return
    }
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
	            if (payload.eventType === 'DELETE') {
	              const oldRow = (payload.old as { key?: string }) || {}
	              if (!oldRow.key) return
	              this.cache.delete(oldRow.key)
	              localStorageProvider.delete(oldRow.key)
	              for (const listener of this.listeners) {
	                listener(oldRow.key, null, { source: 'realtime' })
	              }
	              return
	            }
	            const row = (payload.new as VersionedStorageRow) || {}
	            if (!row.key) return
            // Ignore echoes from our own writes (within 2 seconds)
            const lastWrite = this.recentLocalWrites.get(row.key)
            if (lastWrite && Date.now() - lastWrite < 4000) {
              this.recentLocalWrites.delete(row.key)
              return
            }
	            // Remote change — update cache, localStorage, and notify listeners
            this.applyRemoteRow(row, 'realtime')
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('[SupabaseStorage] realtime subscribe failed:', e)
      this.channel = null
      this.armOnlineRetry()
    }
  }

  private onlineRetryHandler: (() => void) | null = null

  /** Wire a one-shot `online` listener that retries subscribe() when the
   *  network comes back. Idempotent: if a retry is already armed, no-op. */
  private armOnlineRetry(): void {
    if (typeof window === 'undefined') return
    if (this.onlineRetryHandler) return
    this.onlineRetryHandler = () => {
      // Only retry if we still don't have a channel — if some other path
      // established one (manual reconnect, reload), don't double-subscribe.
      if (this.channel) return
      window.removeEventListener('online', this.onlineRetryHandler!)
      this.onlineRetryHandler = null
      this.subscribe()
    }
    window.addEventListener('online', this.onlineRetryHandler)
  }

  /** Unsubscribe from real-time changes */
  unsubscribe(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
    if (this.onlineRetryHandler && typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineRetryHandler)
      this.onlineRetryHandler = null
    }
    if (this.bc) {
      try { this.bc.close() } catch { /* ignore */ }
      this.bc = null
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
  expectedRev?: number
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

export function enqueuePendingWrite(args: { userId: string; key: string; value: unknown; expectedRev?: number }): void {
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
        const { data, error } = await supabase
          .rpc('commit_user_data', {
            p_user_id: write.userId,
            p_key: write.key,
            p_value: write.value,
            p_expected_rev: write.expectedRev ?? null,
          })
        if (!error) {
          const row = Array.isArray(data) ? data[0] as VersionedStorageRow | undefined : data as VersionedStorageRow | undefined
          // A queued write with an old expectedRev should not overwrite newer
          // cloud truth. Drop it once the server reports a conflict; the next
          // refresh/realtime event will carry the winning value.
          map.delete(k)
          if (row && !versionedWriteApplied(row)) continue
        } else {
          if (shouldFallbackToLegacyUserDataWrite(error)) {
            const legacy = await supabase
              .from('user_data')
              .upsert(
                { user_id: write.userId, key: write.key, value: write.value, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,key' }
              )
            if (!legacy.error) {
              map.delete(k)
              continue
            }
          }
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
