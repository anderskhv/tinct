// @vitest-environment jsdom
/**
 * Reading time counts real reading (Anders, 10 Nov 2026): time spent reading with pages turning. The one thing not
 * counted is a page left open while pages are not turning. Each turn credits the time since the previous turn to the
 * page just left (at most 15 minutes); the last page of a session earns the session's median page time (1 minute with
 * fewer than three turns), never more than it was open. Nothing depends on timers firing on time: production showed an
 * iPhone whose timers fired every ~15 minutes losing nearly all its reading (the old tick credited at most 60 s), and a
 * Mac losing the tail of every slow page to a 3-minute activity window.
 */
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const USER = '11111111-1111-4111-8111-111111111111'

vi.mock('../services/supabase', () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: { user: { id: USER }, access_token: 'token' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }) }),
    rpc: async () => ({ data: null, error: { message: 'not in tests' } }),
  },
}))

import { useLabReadingYear } from './useLabReadingYear'
import { readPending, resetReadingTimeSwitch } from './labReadingTime'
import { PRIVATE_BOOK_ID, localDay } from '../readingTime/model'

type Beat = { day: string; bookId: string; read: number; listen: number }

function fakeWorker() {
  const beats: Beat[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/api/reading-time/status')) return Response.json({ enabled: true })
    if (url.includes('/api/reading-time/beat')) {
      const body = JSON.parse(String(init?.body)) as Beat
      beats.push(body)
      return Response.json({ enabled: true, credited: { read: body.read, listen: body.listen } })
    }
    if (url.includes('/api/reading-time/flush')) {
      const body = JSON.parse(String(init?.body)) as { entries?: Beat[] }
      for (const entry of body.entries ?? []) beats.push(entry)
      return Response.json({ enabled: true, credited: 0 })
    }
    return Response.json({})
  }))
  return beats
}

const settle = async () => { await act(async () => { for (let i = 0; i < 12; i += 1) await Promise.resolve() }) }

/** Reading seconds credited for a book on a day: sent in beats and flushes, plus what still waits on the device. */
function readSeconds(beats: Beat[], bookId: string, day = localDay()) {
  const sent = beats.filter(beat => beat.bookId === bookId && beat.day === day).reduce((sum, beat) => sum + beat.read, 0)
  return sent + (readPending(USER)[day]?.[bookId]?.read ?? 0)
}

type Props = { page: number; chapter: number; bookId: string; privateBook?: boolean }
function mount(initial: Props = { page: 0, chapter: 1, bookId: 'pd-pg-1672' }) {
  const listeningRef = { current: false }
  const hook = renderHook((props: Props) => useLabReadingYear({ userId: USER, bookId: props.bookId, chapter: props.chapter, page: props.page,
    onCover: false, paused: false, listeningRef, privateBook: props.privateBook }), { initialProps: initial })
  let props = initial
  return {
    listeningRef,
    turn: () => { props = { ...props, page: props.page + 1 }; hook.rerender(props) },
    set: (next: Partial<Props>) => { props = { ...props, ...next }; hook.rerender(props) },
    hook,
  }
}

/** Time passes with the browser's timers throttled: the clock moves, no interval fires. */
function throttled(ms: number) { vi.setSystemTime(Date.now() + ms) }
/** Time passes with timers firing on time. */
async function onTime(ms: number) { await act(async () => { vi.advanceTimersByTime(ms) }); await settle() }

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  localStorage.clear()
  resetReadingTimeSwitch()
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'] })
  vi.setSystemTime(new Date(2026, 10, 10, 12, 0, 0))
  setVisibility('visible')
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetReadingTimeSwitch()
})

describe('reading time is credited by page turns, from timestamps', () => {
  it('throttled ticks: turns every 2 minutes for 20 minutes, a tick only every 4 minutes → 20 minutes', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    for (let minute = 2; minute <= 20; minute += 2) {
      throttled(2 * 60_000)
      act(() => reader.turn())
      if (minute % 4 === 0) await onTime(30_000 - 1)
    }
    await settle()
    // The ticks themselves moved the clock 5 × 30 s while the page stayed: credited at the next turn or not at all.
    expect(readSeconds(beats, 'pd-pg-1672')).toBeGreaterThanOrEqual(20 * 60)
    expect(readSeconds(beats, 'pd-pg-1672')).toBeLessThanOrEqual(20 * 60 + 150)
  })

  it('slow page: one page for 6 minutes, then a turn → 6 minutes', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    await onTime(6 * 60_000)
    act(() => reader.turn())
    await settle()
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(6 * 60)
  })

  it('over the cap: a 25-minute gap before the next turn → 15 minutes', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    throttled(25 * 60_000)
    act(() => reader.turn())
    await settle()
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(15 * 60)
  })

  it('page left open: 40 minutes with no turns after the first → at most 1 minute', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    throttled(60_000)
    act(() => reader.turn())
    await onTime(40 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    // The first page (1 minute) plus at most 1 minute for the page left open.
    expect(readSeconds(beats, 'pd-pg-1672') - 60).toBeLessThanOrEqual(60)
  })

  it('session end: 10 turns about 2 minutes apart, hidden 5 minutes after the last turn → about 2 minutes for the last page', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    for (let i = 0; i < 10; i += 1) { throttled(2 * 60_000); act(() => reader.turn()) }
    const before = readSeconds(beats, 'pd-pg-1672')
    expect(before).toBe(20 * 60)
    throttled(5 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    expect(readSeconds(beats, 'pd-pg-1672') - before).toBe(2 * 60)
  })

  it('a hidden or locked screen is never reading: time spent hidden is not credited at the next turn', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    for (let i = 0; i < 4; i += 1) { throttled(2 * 60_000); act(() => reader.turn()) }
    throttled(60_000)
    act(() => setVisibility('hidden'))
    throttled(30 * 60_000)
    act(() => setVisibility('visible'))
    throttled(90_000)
    act(() => reader.turn())
    await settle()
    // 4 × 2 min, the session's last page (median 2 min, but open only 1 min → 1 min), then 1.5 min on the page after.
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(8 * 60 + 60 + 90)
  })

  it('chapter jumps and turning back are turns too', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    throttled(3 * 60_000)
    act(() => reader.set({ chapter: 4, page: 0 }))
    throttled(3 * 60_000)
    act(() => reader.set({ page: 0, chapter: 3 }))
    await settle()
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(6 * 60)
  })

  it("another book opened with no turn after it ends the first book's session there", async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    for (let i = 0; i < 3; i += 1) { throttled(2 * 60_000); act(() => reader.turn()) }
    throttled(4 * 60_000)
    act(() => reader.set({ bookId: 'pd-pg-2701', page: 0, chapter: 1 }))
    await settle()
    // Three 2-minute pages, then the last page: the median (2 min), not the 4 minutes it stayed open.
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(8 * 60)
    expect(readSeconds(beats, 'pd-pg-2701')).toBe(0)
  })

  it("an own book's time stays under the private bucket, never its id", async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 1, bookId: 'userbook-abc123', privateBook: true })
    await settle()
    throttled(5 * 60_000)
    act(() => reader.turn())
    await settle()
    expect(readSeconds(beats, PRIVATE_BOOK_ID)).toBe(5 * 60)
    expect(readSeconds(beats, 'userbook-abc123')).toBe(0)
  })

  it('an own book read on two separate days records time on both days', async () => {
    const beats = fakeWorker()
    let reader = mount({ page: 0, chapter: 1, bookId: 'userbook-abc123', privateBook: true })
    await settle()
    throttled(4 * 60_000)
    act(() => reader.turn())
    act(() => setVisibility('hidden'))
    await settle()
    reader.hook.unmount()
    const first = localDay()
    vi.setSystemTime(new Date(2026, 10, 12, 9, 0, 0))
    setVisibility('visible')
    reader = mount({ page: 7, chapter: 1, bookId: 'userbook-abc123', privateBook: true })
    await settle()
    throttled(3 * 60_000)
    act(() => reader.turn())
    await settle()
    expect(readSeconds(beats, PRIVATE_BOOK_ID, first)).toBeGreaterThanOrEqual(4 * 60)
    expect(readSeconds(beats, PRIVATE_BOOK_ID, localDay())).toBe(3 * 60)
  })

  it('listening counts while narration plays, as before, and is not also counted as reading', async () => {
    const beats = fakeWorker()
    const reader = mount()
    await settle()
    reader.listeningRef.current = true
    await onTime(4 * 60_000)
    act(() => reader.turn())
    await settle()
    const listened = beats.reduce((sum, beat) => sum + beat.listen, 0) + (readPending(USER)[localDay()]?.['pd-pg-1672']?.listen ?? 0)
    expect(listened).toBeGreaterThanOrEqual(4 * 60 - 30)
    expect(readSeconds(beats, 'pd-pg-1672')).toBe(0)
  })
})
