// @vitest-environment jsdom
/** Reading time in the Margin reader's book scroll, and two traced sessions (24 Nov 2026, reproduced before the fix).
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


const listenSeconds = (beats: Beat[], bookId: string, day = localDay()) =>
  beats.filter(beat => beat.bookId === bookId && beat.day === day).reduce((sum, beat) => sum + beat.listen, 0)
    + (readPending(USER)[day]?.[bookId]?.listen ?? 0)

/** One scroll gesture in the Margin reader: that many new paragraphs reach the foot, 50 ms apart (each is a turn). */
function scrollBurst(reader: ReturnType<typeof mount>, paragraphs: number) {
  for (let i = 0; i < paragraphs; i += 1) { throttled(50); act(() => reader.turn()) }
}

describe('Mac reader, desktop Margin (book scroll)', () => {
  it('read 2 min, scroll a screen (8 paragraphs pass the foot), three times; read the last screen 2 min, switch tab → about 8 min', async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 4, bookId: 'faust-part-1' })
    await settle()
    for (let round = 0; round < 3; round += 1) { throttled(2 * 60_000); scrollBurst(reader, 8) }
    throttled(2 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    // Rule: the last page earns the session's typical page time (2 min here). Today the median is taken over the
    // burst's 50 ms gaps, so the last 2 minutes earn ~0 s.
    expect(readSeconds(beats, 'faust-part-1')).toBeGreaterThanOrEqual(8 * 60 - 5)
  })

  it('16 Nov pattern: 10 short visits (read 60 s, one scroll of 4 paragraphs, read 90 s, switch away) → at least 2 min each', async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 4, bookId: 'faust-part-1' })
    await settle()
    for (let visit = 0; visit < 10; visit += 1) {
      throttled(60_000)
      scrollBurst(reader, 4)
      throttled(90_000)
      act(() => setVisibility('hidden'))
      throttled(5 * 60_000)
      act(() => setVisibility('visible'))
    }
    await settle()
    // Rule for a fresh session with fewer than three real pages: the last page earns at most 1 minute → 60 + 60 a visit.
    expect(readSeconds(beats, 'faust-part-1')).toBeGreaterThanOrEqual(10 * 120 - 10)
  })

  it('paged reader control: real pages 2 min apart are unchanged (last page earns 2 min)', async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 4, bookId: 'faust-part-1' })
    await settle()
    for (let i = 0; i < 4; i += 1) { throttled(2 * 60_000); act(() => reader.turn()) }
    throttled(5 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    expect(readSeconds(beats, 'faust-part-1')).toBe(4 * 120 + 120)
  })
})

describe('iPhone reader, modern-da with narration available (18 Nov)', () => {
  it('as the data shows it: a few turns in the first 20 s, then 12 min on one page, narration never playing → 80 s read, 0 listen', async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 4, bookId: 'master-and-margarita' })
    await settle()
    throttled(10_000); act(() => reader.turn())
    throttled(10_000); act(() => reader.turn())
    await onTime(12 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    expect(readSeconds(beats, 'master-and-margarita')).toBe(20 + 60)
    expect(listenSeconds(beats, 'master-and-margarita')).toBe(0)
  })

  it('control: had narration played on the visible page for those 12 min, they would count as listening', async () => {
    const beats = fakeWorker()
    const reader = mount({ page: 0, chapter: 4, bookId: 'master-and-margarita' })
    await settle()
    throttled(10_000); act(() => reader.turn())
    throttled(10_000); act(() => reader.turn())
    reader.listeningRef.current = true
    await onTime(12 * 60_000)
    act(() => setVisibility('hidden'))
    await settle()
    expect(listenSeconds(beats, 'master-and-margarita')).toBeGreaterThanOrEqual(12 * 60 - 30)
  })
})
