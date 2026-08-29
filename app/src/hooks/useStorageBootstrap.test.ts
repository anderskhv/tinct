// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SupabaseStorageProvider } from '../services/supabaseStorage'
import { localStorageProvider, setStorageProvider } from '../services/storage'
import { useStorageBootstrap } from './useStorageBootstrap'

describe('useStorageBootstrap', () => {
  beforeEach(() => {
    localStorage.clear()
    setStorageProvider(localStorageProvider)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    setStorageProvider(localStorageProvider)
  })

  it('does not rebuild signed-in storage when Safari refreshes the same user session object', async () => {
    const initCritical = vi.spyOn(SupabaseStorageProvider.prototype, 'initCritical').mockResolvedValue(undefined)
    const init = vi.spyOn(SupabaseStorageProvider.prototype, 'init').mockResolvedValue(undefined)
    const subscribe = vi.spyOn(SupabaseStorageProvider.prototype, 'subscribe').mockImplementation(() => {})
    const unsubscribe = vi.spyOn(SupabaseStorageProvider.prototype, 'unsubscribe').mockImplementation(() => {})

    const { rerender, result } = renderHook(
      (props: { user: { id: string; tokenVersion: number } }) => useStorageBootstrap({
        user: props.user,
        authLoading: false,
        likelyAuthenticated: true,
      }),
      { initialProps: { user: { id: 'reader', tokenVersion: 1 } } },
    )

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.storageReady).toBe(true)
    expect(initCritical).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledTimes(1)
    expect(subscribe).toHaveBeenCalledTimes(1)

    rerender({ user: { id: 'reader', tokenVersion: 2 } })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.storageReady).toBe(true)
    expect(initCritical).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledTimes(1)
    expect(subscribe).toHaveBeenCalledTimes(1)
    expect(unsubscribe).not.toHaveBeenCalled()
  })
})
