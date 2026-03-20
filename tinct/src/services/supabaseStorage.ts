/**
 * Supabase-backed storage provider.
 * Replaces localStorage for authenticated users.
 * Falls back gracefully if Supabase is unavailable.
 */
import { supabase } from './supabase'
import type { StorageProvider } from './storage'

export class SupabaseStorageProvider implements StorageProvider {
  private userId: string
  private cache: Map<string, unknown> = new Map()

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
}
