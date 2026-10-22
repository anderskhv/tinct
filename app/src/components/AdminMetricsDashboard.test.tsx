// @vitest-environment jsdom

/**
 * Disk IO (22 Oct 2026): /admin/metrics read up to 10,000 analytics rows, and
 * the per-account summary, again every time Supabase refreshed the session
 * (hourly, and on every return to the tab), because both loads were keyed by
 * the session object or its token. They are keyed by the account and window.
 */

import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Session } from '@supabase/supabase-js'

const reads = vi.hoisted(() => ({ analytics: 0 }))

vi.mock('../services/supabase', () => {
  const builder = {
    select: () => builder,
    gte: () => builder,
    order: () => builder,
    limit: () => Promise.resolve({ data: [], error: null }),
  }
  return { supabase: { from: () => { reads.analytics += 1; return builder } }, isSupabaseConfigured: () => true }
})

import { AdminMetricsDashboard } from './AdminMetricsDashboard'

function session(token: string, userId = 'admin-1'): Session {
  return { access_token: token, user: { id: userId } } as unknown as Session
}

const accountRequests: string[] = []

beforeEach(() => {
  reads.analytics = 0
  accountRequests.length = 0
  vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    accountRequests.push(String((init?.headers as Record<string, string> | undefined)?.Authorization))
    return Promise.resolve(new Response(JSON.stringify({ days: 14, generatedAt: '2026-10-22T00:00:00Z', excludedAccounts: 0, excludedSessions: 0, users: [] }), { headers: { 'Content-Type': 'application/json' } }))
  }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('a refreshed token for the same admin does not reload the analytics rows or the accounts', async () => {
  const { rerender } = render(<AdminMetricsDashboard session={session('t1')} onSignIn={() => {}} />)
  await act(async () => { await Promise.resolve() })
  expect(reads.analytics).toBe(1)
  expect(accountRequests).toEqual(['Bearer t1'])
  rerender(<AdminMetricsDashboard session={session('t2')} onSignIn={() => {}} />)
  rerender(<AdminMetricsDashboard session={session('t3')} onSignIn={() => {}} />)
  await act(async () => { await Promise.resolve() })
  expect(reads.analytics).toBe(1)
  expect(accountRequests).toHaveLength(1)
})

it('another account loads again, with its own token', async () => {
  const { rerender } = render(<AdminMetricsDashboard session={session('t1')} onSignIn={() => {}} />)
  await act(async () => { await Promise.resolve() })
  rerender(<AdminMetricsDashboard session={session('u2', 'admin-2')} onSignIn={() => {}} />)
  await act(async () => { await Promise.resolve() })
  expect(reads.analytics).toBe(2)
  expect(accountRequests).toEqual(['Bearer t1', 'Bearer u2'])
})
