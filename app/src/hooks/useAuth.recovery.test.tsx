// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readerLoadTraceForTest, resetReaderLoadTraceForTest, startReaderLoadTrace } from '../utils/readerLoadTrace'

const mocks = vi.hoisted(() => ({
  resolveSession: null as ((value: { data: { session: unknown } }) => void) | null,
  unsubscribe: vi.fn(),
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
  })),
}))

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    auth: {
      getSession: () => new Promise(resolve => { mocks.resolveSession = resolve }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: mocks.unsubscribe } } }),
    },
    from: mocks.from,
  },
}))

vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('../utils/attribution', () => ({ getAttributionPayload: vi.fn(() => ({})) }))

import { useAuth } from './useAuth'

describe('useAuth delayed-session recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.history.replaceState({}, '', '/reader?loadTrace=1')
    localStorage.setItem('sb-project-auth-token', '{"access_token":"cached"}')
    resetReaderLoadTraceForTest()
    startReaderLoadTrace()
    mocks.resolveSession = null
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    resetReaderLoadTraceForTest()
    vi.clearAllMocks()
  })

  it('opens after the bounded wait but still accepts the eventual signed-in session', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.likelyAuthenticated).toBe(true)

    await act(async () => { await vi.advanceTimersByTimeAsync(11_999) })
    expect(result.current.isLoading).toBe(true)

    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(result.current.isLoading).toBe(false)
    expect(readerLoadTraceForTest().some(entry => entry.phase === 'auth_session_timeout' && entry.durationMs === 12_000)).toBe(true)

    const session = { access_token: 'token', user: { id: 'reader-1' } }
    await act(async () => { mocks.resolveSession?.({ data: { session } }); await Promise.resolve() })
    expect(result.current.session).toBe(session)
    expect(result.current.user?.id).toBe('reader-1')
    expect(readerLoadTraceForTest().some(entry => entry.phase === 'auth_session_resolved' && entry.outcome === 'session')).toBe(true)
  })
})
