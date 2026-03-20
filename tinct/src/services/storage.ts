/**
 * Persistence abstraction layer.
 * Phase 1a: localStorage. Phase 1b: swap for Supabase when authenticated.
 */

export interface StorageProvider {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  delete(key: string): void
  getAll<T>(prefix: string): T[]
}

class LocalStorageProvider implements StorageProvider {
  private prefix = 'tinct:'

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed:', e)
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  getAll<T>(prefix: string): T[] {
    const results: T[] = []
    const fullPrefix = this.prefix + prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(fullPrefix)) {
        try {
          results.push(JSON.parse(localStorage.getItem(key)!))
        } catch {
          // skip malformed entries
        }
      }
    }
    return results
  }

  /** Get all localStorage data for migration to Supabase */
  getAllData(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        try {
          const shortKey = key.slice(this.prefix.length)
          data[shortKey] = JSON.parse(localStorage.getItem(key)!)
        } catch {
          // skip
        }
      }
    }
    return data
  }
}

// Singleton localStorage provider (always available)
export const localStorageProvider = new LocalStorageProvider()

// Active storage provider — starts as localStorage, can be swapped
let activeProvider: StorageProvider = localStorageProvider

export function setStorageProvider(provider: StorageProvider): void {
  activeProvider = provider
}

export const storage: StorageProvider = {
  get<T>(key: string): T | null { return activeProvider.get<T>(key) },
  set<T>(key: string, value: T): void { activeProvider.set<T>(key, value) },
  delete(key: string): void { activeProvider.delete(key) },
  getAll<T>(prefix: string): T[] { return activeProvider.getAll<T>(prefix) },
}
