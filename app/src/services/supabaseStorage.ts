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

  async init(): Promise<void> {
    if (!supabase) return
    const { data } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', this.userId)

    if (data) {
      for (const row of data) {
        this.cache.set(row.key, row.value)
      }
    }
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
        }
        this.recordError(key, error.message, attempt, value)
        console.warn(`[Supabase] write failed (attempt ${attempt}) key=${key}:`, error.message)
        return
      }
      this.recordSuccess(key, attempt, value)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt === 1) {
        setTimeout(() => { void this.upsertWithRetry(key, value, 2) }, 2000)
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
