// @vitest-environment jsdom
/**
 * Recording on a long-lived reader page (9 Oct 2026, Anders's desktop): the
 * reading-time switch went on (21:21), off (22:16, hotfix) and on again
 * (23:22) on 8 Oct while reader tabs stayed open. A page keeps reading the
 * switch it was told at load, and a ledger hiccup must not stop its
 * heartbeats for the rest of the page's life.
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const USER = '11111111-1111-4111-8111-111111111111'

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: USER }, access_token: 'token' } } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
    rpc: async () => ({ data: null, error: { message: 'not in tests' } }),
  },
}))

import { useLabReadingYear } from './useLabReadingYear'
import { readPending, resetReadingTimeSwitch } from './labReadingTime'
import { localDay } from '../readingTime/model'

type Call = { url: string; body: unknown }

function fakeWorker(state: { enabled: boolean; beatStatus?: number }) {
  const calls: Call[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null })
    if (url.includes('/api/reading-time/status')) return Response.json({ enabled: state.enabled })
    if (url.includes('/api/reading-time/beat')) {
      if (state.beatStatus && state.beatStatus !== 200) return Response.json({ enabled: true, error: 'unavailable' }, { status: state.beatStatus })
      return Response.json({ enabled: true, credited: { read: 60, listen: 0 } })
    }
    if (url.includes('/api/reading-time/flush')) return Response.json({ enabled: true, credited: 0 })
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, beats: () => calls.filter(call => call.url.includes('/api/reading-time/beat')) }
}

/** Ticks with the reader active (a key press before each tick). */
async function read(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 30_000) {
    window.dispatchEvent(new KeyboardEvent('keydown'))
    await act(async () => { vi.advanceTimersByTime(30_000) })
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve() })
  }
}

function mount() {
  const listeningRef = { current: false }
  return renderHook(() => useLabReadingYear({ userId: USER, bookId: 'pd-pg-1672', chapter: 1, page: 0, onCover: false, paused: false, listeningRef }))
}

beforeEach(() => {
  localStorage.clear()
  resetReadingTimeSwitch()
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetReadingTimeSwitch()
})

describe('a reader page left open across the switch going on', () => {
  it('asks again, and from then on records to the ledger and sends heartbeats', async () => {
    const worker = { enabled: false }
    const { beats } = fakeWorker(worker)
    mount()
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve() })
    await read(60_000)
    expect(readPending(USER)).toEqual({})
    // The switch goes on while the page stays open.
    worker.enabled = true
    await read(10 * 60_000)
    expect(beats().length).toBeGreaterThan(0)
    expect(beats()[0].body).toMatchObject({ day: localDay(), bookId: 'pd-pg-1672' })
  })
})

describe('a ledger hiccup (one 503)', () => {
  it('does not stop heartbeats for the rest of the page', async () => {
    const worker: { enabled: boolean; beatStatus?: number } = { enabled: true, beatStatus: 503 }
    const { beats } = fakeWorker(worker)
    mount()
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve() })
    await read(2 * 60_000)
    const failed = beats().length
    expect(failed).toBeGreaterThan(0)
    // The ledger is back.
    worker.beatStatus = 200
    await read(10 * 60_000)
    expect(beats().length).toBeGreaterThan(failed)
    // What waited on the device during the hiccup is carried, not lost.
    const today = readPending(USER)[localDay()]?.['pd-pg-1672']
    expect((today?.read ?? 0)).toBeLessThan(12 * 60)
  })
})
