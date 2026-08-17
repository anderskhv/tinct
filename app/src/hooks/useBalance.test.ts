// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBalance } from './useBalance'

describe('useBalance known-user offline mode', () => {
  it('does not demote a cached signed-in reader to anonymous when session restore is offline', () => {
    const { result } = renderHook(() => useBalance(null, null, undefined, {
      authLoading: false,
      likelyAuthenticated: true,
    }))

    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.hasBalance).toBe(true)
  })

  it('keeps a genuinely signed-out reader anonymous', () => {
    const { result } = renderHook(() => useBalance(null, null, undefined, {
      authLoading: false,
      likelyAuthenticated: false,
    }))

    expect(result.current.isAnonymous).toBe(true)
  })
})
