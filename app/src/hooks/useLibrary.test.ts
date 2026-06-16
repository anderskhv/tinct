// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAnonymousMode, setStorageProvider, storage, type StorageProvider } from '../services/storage'
import { useLibrary } from './useLibrary'

class MemoryStorageProvider implements StorageProvider {
  private values = new Map<string, unknown>()

  get<T>(key: string): T | null {
    return this.values.has(key) ? this.values.get(key) as T : null
  }

  set<T>(key: string, value: T): void {
    this.values.set(key, value)
  }

  delete(key: string): void {
    this.values.delete(key)
  }

  getAll<T>(prefix: string): T[] {
    return Array.from(this.values.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value as T)
  }
}

describe('useLibrary', () => {
  beforeEach(() => {
    setAnonymousMode(false)
    setStorageProvider(new MemoryStorageProvider())
  })

  it('adopts a hydrated cloud library when storage becomes ready', async () => {
    storage.set('library', ['bible'])

    const { result, rerender } = renderHook(
      ({ ready }) => useLibrary(ready),
      { initialProps: { ready: false } },
    )

    expect(result.current.libraryIds).toEqual(['bible'])

    act(() => {
      storage.set('library', ['bible', 'hamlet'])
      rerender({ ready: true })
    })

    await waitFor(() => {
      expect(result.current.libraryIds).toEqual(['bible', 'hamlet'])
    })
    expect(storage.get<string[]>('library')).toEqual(['bible', 'hamlet'])
  })

  it('preserves a real add queued before storage writes unlock', async () => {
    storage.set('library', ['bible'])

    const { result, rerender } = renderHook(
      ({ ready }) => useLibrary(ready),
      { initialProps: { ready: false } },
    )

    act(() => {
      result.current.addBook('hamlet')
    })

    act(() => {
      rerender({ ready: true })
    })

    await waitFor(() => {
      expect(result.current.libraryIds).toEqual(['bible', 'hamlet'])
    })
    expect(storage.get<string[]>('library')).toEqual(['bible', 'hamlet'])
  })
})
