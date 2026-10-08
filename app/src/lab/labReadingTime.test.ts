// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addPending, beatPayload, nextFlush, pendingSeconds, readPending, readingTimeSwitch, resetReadingTimeSwitch, sendFlush } from './labReadingTime'
import { useLabReadingYear } from './useLabReadingYear'
import { readLocalReadingYear, readingYearTotals } from './labReadingYear'
import { localDay } from '../readingTime/model'

beforeEach(() => {
  localStorage.clear()
  resetReadingTimeSwitch()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetReadingTimeSwitch()
})

describe('the switch on the reader', () => {
  it('reads as off when the Worker cannot be asked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    expect(await readingTimeSwitch()).toBe(false)
    resetReadingTimeSwitch()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Not found', { status: 404 })))
    expect(await readingTimeSwitch()).toBe(false)
    resetReadingTimeSwitch()
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true })))
    expect(await readingTimeSwitch()).toBe(true)
  })
})

describe('pending time on the device', () => {
  it('keeps each day and book apart, and a beat carries at most a minute of the current one', () => {
    addPending('u1', '2026-10-07', 'odyssey', { read: 30 })
    addPending('u1', '2026-10-07', 'odyssey', { read: 30, listen: 0 })
    addPending('u1', '2026-10-07', 'odyssey', { listen: 30 })
    addPending('u1', '2026-10-06', 'bible', { read: 90 })
    expect(readPending('u1')).toEqual({ '2026-10-07': { odyssey: { read: 60, listen: 30 } }, '2026-10-06': { bible: { read: 90, listen: 0 } } })
    expect(beatPayload(readPending('u1'), '2026-10-07', 'odyssey', false)).toEqual({ day: '2026-10-07', bookId: 'odyssey', read: 30, listen: 30, playing: true })
    expect(beatPayload(readPending('u1'), '2026-10-07', 'bible', false)).toBeNull()
    expect(pendingSeconds(readPending('u1'))).toBe(180)
    expect(readPending(null)).toEqual({})
  })

  it('flushes the signed-out tally on sign-in once, then clears it', async () => {
    addPending(null, '2026-10-06', 'odyssey', { read: 600 })
    const flush = nextFlush({ userId: 'u1', today: '2026-10-07', currentBookId: 'odyssey', guestEarlier: { year: 2026, seconds: 1200 } })
    expect(flush).toMatchObject({ owner: null, entries: [{ day: '2026-10-06', bookId: 'odyssey', read: 600, listen: 0 }], earlier: 1200 })
    // Unconfirmed: the same flush (same id) is offered again.
    expect(nextFlush({ userId: 'u1', today: '2026-10-07', currentBookId: 'odyssey', guestEarlier: null })?.flushId).toBe(flush!.flushId)
    const cleared: number[] = []
    const fetchMock = vi.fn(async () => Response.json({ enabled: true, credited: 1800 }))
    expect(await sendFlush('token', 'u1', flush!, year => cleared.push(year), fetchMock as unknown as typeof fetch)).toBe('credited')
    expect(JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body))).toEqual({ flushId: flush!.flushId, entries: flush!.entries, earlier: 1200 })
    expect(readPending(null)).toEqual({})
    expect(cleared).toEqual([2026])
    expect(nextFlush({ userId: 'u1', today: '2026-10-07', currentBookId: 'odyssey', guestEarlier: null })).toBeNull()
  })

  it('leaves the current book’s time today to the heartbeat', () => {
    addPending('u1', '2026-10-07', 'odyssey', { read: 600 })
    addPending('u1', '2026-10-07', 'bible', { read: 60 })
    expect(nextFlush({ userId: 'u1', today: '2026-10-07', currentBookId: 'odyssey', guestEarlier: null })?.entries).toEqual([{ day: '2026-10-07', bookId: 'bible', read: 60, listen: 0 }])
  })
})

function mountReader(userId: string | null) {
  const listeningRef = { current: false }
  return renderHook(() => useLabReadingYear({ userId, bookId: 'odyssey', chapter: 1, page: 0, onCover: false, paused: false, listeningRef }))
}

describe('the reader’s tally with the switch', () => {
  it('off: time goes to the yearly tally exactly as before, and nothing but the status question is sent', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    const fetchMock = vi.fn(async () => Response.json({ enabled: false }))
    vi.stubGlobal('fetch', fetchMock)
    mountReader(null)
    await act(async () => { await Promise.resolve() })
    await act(async () => { vi.advanceTimersByTime(30_000) })
    const year = new Date().getFullYear()
    expect(readingYearTotals(readLocalReadingYear(year, null)).seconds).toBe(30)
    expect(readPending(null)).toEqual({})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String((fetchMock.mock.calls[0] as unknown as [string])[0])).toContain('/api/reading-time/status')
  })

  it('on: the same time waits per day and book for the ledger instead, so it is never counted twice', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true })))
    mountReader(null)
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    await act(async () => { vi.advanceTimersByTime(30_000) })
    const year = new Date().getFullYear()
    expect(readingYearTotals(readLocalReadingYear(year, null)).seconds).toBe(0)
    expect(readPending(null)).toEqual({ [localDay()]: { odyssey: { read: 30, listen: 0 } } })
  })
})

describe('a reader’s own book (private)', () => {
  const OWN = 'userbook-0123456789abcdef01234567'
  function mountOwnBook() {
    const listeningRef = { current: false }
    // As LabApp mounts it for an own book: no pages (onCover), the private flag.
    return renderHook(() => useLabReadingYear({ userId: null, bookId: OWN, chapter: 1, page: 0, onCover: true, paused: false, listeningRef, privateBook: true }))
  }

  it('off: counted nowhere, exactly as before (no yearly tally, nothing pending)', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: false })))
    mountOwnBook()
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    await act(async () => { vi.advanceTimersByTime(60_000) })
    const year = new Date().getFullYear()
    expect(readingYearTotals(readLocalReadingYear(year, null)).seconds).toBe(0)
    expect(readPending(null)).toEqual({})
  })

  it('on: its time counts under the one private bucket, never the own book’s id', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ enabled: true })))
    mountOwnBook()
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    await act(async () => { vi.advanceTimersByTime(30_000) })
    expect(readPending(null)).toEqual({ [localDay()]: { private: { read: 30, listen: 0 } } })
    expect(JSON.stringify({ ...localStorage })).not.toContain('userbook-')
    expect(beatPayload(readPending(null), localDay(), 'private', false)).toMatchObject({ bookId: 'private', read: 30 })
  })
})
