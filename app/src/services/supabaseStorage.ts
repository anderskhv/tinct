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
    return val !== undefined ? (val as T) : null
  }

  set<T>(key: string, value: T): void {
    if (!supabase) return
    this.cache.set(key, value)
    // Always write to localStorage as fast cache for next page load
    localStorageProvider.set(key, value)
    // Track this write so we can ignore the real-time echo
    this.recentLocalWrites.set(key, Date.now())
    supabase
      .from('user_data')
      .upsert(
        { user_id: this.userId, key, value },
        { onConflict: 'user_id,key' }
      )
      .then(({ error }) => {
        if (error) console.warn('Supabase write failed:', error.message)
      })
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

  /** Subscribe to real-time changes from other devices */
  subscribe(): void {
    if (!supabase) return
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
