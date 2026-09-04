import { createReadingMemoryQueue, type ReadingMemoryQueue } from './queue'
import { emptyReadingMemory, parseReadingMemory } from './sessions'
import type { ReadingMemoryState } from './types'

/**
 * Both keys start with `tinct:` so the existing sign-out wipe
 * (`clearLocalUserData`) removes them; neither is in its preserve list.
 */
export const READING_MEMORY_DEVICE_KEY = 'tinct:reading-memory'
export const READING_MEMORY_QUEUE_KEY = 'tinct:reading-memory:queue'
/** user_data key for the signed-in versioned copy. */
export const READING_MEMORY_CLOUD_KEY = 'reading-memory'

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function browserKeyValueStorage(): KeyValueStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function readDeviceReadingMemory(storage: KeyValueStorage | null = browserKeyValueStorage()): ReadingMemoryState {
  if (!storage) return emptyReadingMemory()
  try {
    const raw = storage.getItem(READING_MEMORY_DEVICE_KEY)
    return raw ? parseReadingMemory(JSON.parse(raw)) : emptyReadingMemory()
  } catch {
    return emptyReadingMemory()
  }
}

export function writeDeviceReadingMemory(state: ReadingMemoryState, storage: KeyValueStorage | null = browserKeyValueStorage()): void {
  if (!storage) return
  try {
    storage.setItem(READING_MEMORY_DEVICE_KEY, JSON.stringify(state))
  } catch { /* quota / private mode */ }
}

export function clearDeviceReadingMemory(storage: KeyValueStorage | null = browserKeyValueStorage()): void {
  if (!storage) return
  try {
    storage.removeItem(READING_MEMORY_DEVICE_KEY)
    storage.removeItem(READING_MEMORY_QUEUE_KEY)
  } catch { /* ignore */ }
}

export function deviceReadingMemoryQueue(storage: KeyValueStorage | null = browserKeyValueStorage()): ReadingMemoryQueue {
  return createReadingMemoryQueue({
    read() {
      if (!storage) return []
      try {
        const raw = storage.getItem(READING_MEMORY_QUEUE_KEY)
        return raw ? JSON.parse(raw) : []
      } catch {
        return []
      }
    },
    write(value) {
      if (!storage) return
      try {
        const events = Array.isArray(value) ? value : []
        if (events.length === 0) storage.removeItem(READING_MEMORY_QUEUE_KEY)
        else storage.setItem(READING_MEMORY_QUEUE_KEY, JSON.stringify(events))
      } catch { /* ignore */ }
    },
  })
}
