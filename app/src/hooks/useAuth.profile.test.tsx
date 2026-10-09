// @vitest-environment jsdom
/**
 * The reader mounts useAuth in about seven places (LabApp, the sheet, position
 * sync, Ask, reading memory, …). Each instance fetched the profile row on its
 * own, on mount and again on every auth event: a local reader load measured
 * 15 `profiles` requests (9 Oct 2026), each one also queueing on the Supabase
 * auth lock for its token.
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listeners: [] as Array<(event: string, session: unknown) => void>,
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'reader-1', email: 'r@example.invalid' } }) }) }),
  })),
}))

const session = { access_token: 'token', user: { id: 'reader-1' } }

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session } }),
      onAuthStateChange: (listener: (event: string, session: unknown) => void) => {
        mocks.listeners.push(listener)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: mocks.from,
  },
}))
vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('../utils/attribution', () => ({ getAttributionPayload: vi.fn(() => ({})) }))

import { resetProfileRequestsForTest, useAuth } from './useAuth'

beforeEach(() => {
  mocks.listeners.length = 0
  mocks.from.mockClear()
  resetProfileRequestsForTest()
})

afterEach(() => {
  localStorage.clear()
})

describe('useAuth profile row', () => {
  it('is fetched once for many hook instances and their auth events, and every instance gets it', async () => {
    const hooks = Array.from({ length: 7 }, () => renderHook(() => useAuth()))
    await act(async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve() })
    await act(async () => { for (const listener of mocks.listeners) listener('SIGNED_IN', session) })
    await act(async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve() })
    expect(mocks.from).toHaveBeenCalledTimes(1)
    for (const hook of hooks) expect(hook.result.current.profile).toMatchObject({ id: 'reader-1' })
  })

  it('refreshProfile still asks again', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve() })
    expect(mocks.from).toHaveBeenCalledTimes(1)
    await act(async () => { await result.current.refreshProfile() })
    expect(mocks.from).toHaveBeenCalledTimes(2)
  })
})
