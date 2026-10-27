// @vitest-environment jsdom
/**
 * Recording on a long-lived reader page (9 Oct 2026, Anders's desktop): the
 * reading-time switch went on (21:21), off (22:16, hotfix) and on again
 * (23:22) on 8 Oct while reader tabs stayed open. A page keeps reading the
 * switch it was told at load, and a ledger hiccup must not stop its
 * heartbeats for the rest of the page's life.
 */
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const USER = '11111111-1111-4111-8111-111111111111'

const yearRow = vi.hoisted(() => ({ reads: 0 }))

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: USER }, access_token: 'token' } } }),
    },
    from: () => { yearRow.reads += 1; return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) } },
    rpc: async () => ({ data: null, error: { message: 'not in tests' } }),
  },
}))

import { LEDGER_BEAT_EVERY_MS, READING_YEAR_SYNC_MS, useLabReadingYear } from './useLabReadingYear'
import { BEAT_MAX_SECONDS, BEAT_MIN_GAP_MS } from '../readingTime/model'
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
      const body = init?.body ? JSON.parse(String(init.body)) as { read: number; listen: number } : { read: 0, listen: 0 }
      return Response.json({ enabled: true, credited: { read: body.read, listen: body.listen } })
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
  yearRow.reads = 0
  localStorage.clear()
  resetReadingTimeSwitch()
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'] })
  // Local noon: a test that reads for 16 minutes must not cross midnight into a new reading day
  // (it did when the suite ran at 23:44 UTC, 21 Oct 2026).
  vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0))
})

afterEach(() => {
  cleanup()
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
    // Interval change (DB IO trim, 20 Oct 2026): beats come every ~5 minutes, not every minute.
    await read(6 * 60_000)
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

const settle = async () => { await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve() }) }
const sent = (beats: Call[]) => beats.reduce((sum, call) => sum + (call.body as { read: number; listen: number }).read + (call.body as { read: number; listen: number }).listen, 0)
const waiting = () => { const time = readPending(USER)[localDay()]?.['pd-pg-1672']; return (time?.read ?? 0) + (time?.listen ?? 0) }

describe('ledger heartbeats every five minutes (DB IO trim)', () => {
  it('beats about every five minutes, and beats plus pending equal the time counted', async () => {
    expect(LEDGER_BEAT_EVERY_MS).toBeGreaterThanOrEqual(BEAT_MIN_GAP_MS)
    expect(LEDGER_BEAT_EVERY_MS).toBeLessThanOrEqual(5 * 60_000)
    const { beats } = fakeWorker({ enabled: true })
    mount()
    await settle()
    await read(16 * 60_000)
    // 16 minutes of reading: three beats (was ~16), none above the Worker's cap.
    expect(beats()).toHaveLength(3)
    for (const call of beats()) expect((call.body as { read: number }).read).toBeLessThanOrEqual(BEAT_MAX_SECONDS)
    expect(sent(beats()) + waiting()).toBe(16 * 60)
  })

  it('sends the waiting seconds when the page is hidden, once the gate allows', async () => {
    const { beats } = fakeWorker({ enabled: true })
    mount()
    await settle()
    await read(2 * 60_000)
    const hidden = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    // Too soon for the Worker's gate: nothing sent, nothing lost.
    document.dispatchEvent(new Event('visibilitychange'))
    await settle()
    expect(beats()).toHaveLength(0)
    expect(waiting()).toBe(120)
    hidden.mockRestore()
    await read(150_000)
    window.dispatchEvent(new Event('pagehide'))
    await settle()
    expect(beats()).toHaveLength(1)
    expect(sent(beats())).toBe(270)
    expect(waiting()).toBe(0)
  })

  it('drains time carried from an earlier beat early, as soon as a full beat waits', async () => {
    const { beats } = fakeWorker({ enabled: true })
    mount()
    await settle()
    // Carried over from before (e.g. a beat refused by the gate).
    const { addPending } = await import('./labReadingTime')
    addPending(USER, localDay(), 'pd-pg-1672', { read: 200 })
    await read(16 * 60_000)
    expect(sent(beats()) + waiting()).toBe(200 + 16 * 60)
    expect(waiting()).toBeLessThan(BEAT_MAX_SECONDS)
  })
})

describe('reading-year sync every fifteen minutes (DB IO trim)', () => {
  it('syncs the yearly tally every 15 minutes and on hide, not every 2 minutes', async () => {
    expect(READING_YEAR_SYNC_MS).toBe(15 * 60_000)
    fakeWorker({ enabled: false })
    const listeningRef = { current: false }
    const { rerender } = renderHook(({ page }) => useLabReadingYear({ userId: USER, bookId: 'pd-pg-1672', chapter: 1, page, onCover: false, paused: false, listeningRef }), { initialProps: { page: 0 } })
    await settle()
    const start = yearRow.reads
    for (let page = 1; page <= 14; page += 1) {
      rerender({ page })
      await read(60_000)
    }
    expect(yearRow.reads - start).toBe(0)
    rerender({ page: 15 })
    await read(60_000)
    expect(yearRow.reads - start).toBe(1)
    rerender({ page: 16 })
    window.dispatchEvent(new Event('pagehide'))
    await settle()
    expect(yearRow.reads - start).toBe(2)
  })
})


describe('short visible reading sessions', () => {
  it('retains twenty seconds when the reader is hidden before the first tick', async () => {
    fakeWorker({ enabled: true })
    let visibility = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility as DocumentVisibilityState)
    const h = mount()
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve() })
    await act(async () => { vi.advanceTimersByTime(20_000) })
    await act(async () => { visibility = 'hidden'; document.dispatchEvent(new Event('visibilitychange')) })
    expect(readPending(USER)[localDay()]?.['pd-pg-1672']?.read).toBe(20)
    h.unmount()
  })
})


describe('reading interval boundaries', () => {
  it('does not count hidden time or duplicate pagehide, and resumes counting', async () => {
    fakeWorker({ enabled: true })
    let visibility: DocumentVisibilityState = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
    const h = mount()
    await settle()
    await act(async () => { vi.advanceTimersByTime(20_000) })
    visibility = 'hidden'
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => window.dispatchEvent(new Event('pagehide')))
    await act(async () => { vi.advanceTimersByTime(120_000) })
    expect(waiting()).toBe(20)
    visibility = 'visible'
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    await act(async () => { vi.advanceTimersByTime(10_000) })
    h.unmount()
    expect(waiting()).toBe(30)
  })

  it('settles the outgoing book on pause and book change, without counting the pause', async () => {
    fakeWorker({ enabled: true })
    const listeningRef = { current: false }
    const h = renderHook(({ paused, bookId }) => useLabReadingYear({ userId: USER, bookId, chapter: 1, page: 0, onCover: false, paused, listeningRef }), { initialProps: { paused: false, bookId: 'pd-pg-1672' } })
    await settle()
    await act(async () => { vi.advanceTimersByTime(20_000) })
    h.rerender({ paused: true, bookId: 'pd-pg-1672' })
    await act(async () => { vi.advanceTimersByTime(40_000) })
    h.rerender({ paused: false, bookId: 'pd-pg-84' })
    await act(async () => { vi.advanceTimersByTime(10_000) })
    h.unmount()
    expect(readPending(USER)[localDay()]).toMatchObject({ 'pd-pg-1672': { read: 20 }, 'pd-pg-84': { read: 10 } })
  })

  it('splits a short session across local midnight', async () => {
    fakeWorker({ enabled: true })
    vi.setSystemTime(new Date(2026, 9, 21, 23, 59, 50))
    const h = mount()
    await settle()
    await act(async () => { vi.advanceTimersByTime(20_000) })
    h.unmount()
    expect(readPending(USER)['2026-10-21']?.['pd-pg-1672']?.read).toBe(10)
    expect(readPending(USER)['2026-10-22']?.['pd-pg-1672']?.read).toBe(10)
  })

  it('retains subsecond time across frequent gestures and stops at the idle boundary', async () => {
    fakeWorker({ enabled: true })
    const h = mount()
    await settle()
    for (let i = 0; i < 40; i++) {
      act(() => { vi.advanceTimersByTime(500); window.dispatchEvent(new KeyboardEvent('keydown')) })
    }
    expect(waiting()).toBe(20)
    await act(async () => { vi.advanceTimersByTime(200_000) })
    h.unmount()
    expect(waiting()).toBe(200)
  })
})


it('settles time to the outgoing owner and hides private book identity', async () => {
  fakeWorker({ enabled: true })
  const listeningRef = { current: false }
  const h = renderHook(({ userId }) => useLabReadingYear({ userId, bookId: 'userbook-secret-title-id', chapter: 1, page: 0, onCover: true, paused: false, listeningRef, privateBook: true }), { initialProps: { userId: USER } })
  await settle()
  await act(async () => { vi.advanceTimersByTime(20_000) })
  h.rerender({ userId: 'second-owner' })
  await act(async () => { vi.advanceTimersByTime(10_000) })
  h.unmount()
  const { PRIVATE_BOOK_ID } = await import('../readingTime/model')
  expect(readPending(USER)[localDay()]).toEqual({ [PRIVATE_BOOK_ID]: { read: 20, listen: 0 } })
  expect(readPending('second-owner')[localDay()]).toEqual({ [PRIVATE_BOOK_ID]: { read: 10, listen: 0 } })
  expect(JSON.stringify(readPending(USER))).not.toContain('secret-title')
})
