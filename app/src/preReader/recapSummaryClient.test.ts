import { describe, expect, it, vi } from 'vitest'
import { LAB_RECAP_ROUTE, type LabRecapRequest } from '../recapSummary'
import {
  LAB_RECAP_MIN_AWAY_MS,
  RECAP_SUMMARY_STORAGE_KEY,
  RECAP_SUMMARY_STORAGE_MAX,
  readStoredRecapSummary,
  recapAwayMs,
  recapLastSeenAt,
  recapSummaryPermission,
  requestLabRecapSummary,
  shouldRequestRecapSummary,
  storeRecapSummary,
} from './recapSummaryClient'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value) },
    dump: () => Object.fromEntries(map),
  }
}

const request: LabRecapRequest = { bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 645, paragraphIndex: 3, completed: false, bookTitle: 'The Bible' }

describe('stored recap summaries', () => {
  it('round-trips a summary under its key and ignores garbage', () => {
    const storage = memoryStorage()
    expect(readStoredRecapSummary(storage, 'k1')).toBeNull()
    storeRecapSummary(storage, 'k1', 'So far the proverbs contrast the quiet home with the house full of strife.', 1000)
    expect(readStoredRecapSummary(storage, 'k1')).toMatch(/^So far/)
    storage.setItem(RECAP_SUMMARY_STORAGE_KEY, '{not json')
    expect(readStoredRecapSummary(storage, 'k1')).toBeNull()
    expect(readStoredRecapSummary(null, 'k1')).toBeNull()
  })

  it('keeps only the newest entries', () => {
    const storage = memoryStorage()
    for (let index = 0; index < RECAP_SUMMARY_STORAGE_MAX + 5; index += 1) storeRecapSummary(storage, `k${index}`, `summary ${index}`, index)
    expect(readStoredRecapSummary(storage, 'k0')).toBeNull()
    expect(readStoredRecapSummary(storage, 'k4')).toBeNull()
    expect(readStoredRecapSummary(storage, 'k5')).toBe('summary 5')
    expect(readStoredRecapSummary(storage, `k${RECAP_SUMMARY_STORAGE_MAX + 4}`)).toBe(`summary ${RECAP_SUMMARY_STORAGE_MAX + 4}`)
  })
})

describe('requestLabRecapSummary', () => {
  it('posts the place to the recap route with the bearer token and returns the summary', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ summary: '  The chapter opens with … ', coverage: { chapterNumber: 645, throughParagraph: 3, paragraphCount: 6, complete: false, fromChapterNumber: null }, model: 'claude-sonnet-5', version: 'lab-recap-v1', cached: false }),
    }))
    const result = await requestLabRecapSummary({ request, token: 'jwt', fetchImpl })
    expect(result).toMatchObject({ ok: true, response: { summary: 'The chapter opens with …', cached: false } })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(LAB_RECAP_ROUTE)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer jwt')
    expect(JSON.parse(String(init.body))).toEqual(request)
  })

  it('sends no Authorization header when signed out', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: 'x', coverage: {} }) }))
    await requestLabRecapSummary({ request, token: null, fetchImpl })
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  it('reports failures instead of fabricating a line', async () => {
    const failing = vi.fn(async () => ({ ok: false, status: 502, json: async () => ({ error: 'Summary unavailable' }) }))
    expect(await requestLabRecapSummary({ request, fetchImpl: failing })).toEqual({ ok: false, error: 'recap route returned 502' })
    const empty = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ summary: '', coverage: {} }) }))
    expect(await requestLabRecapSummary({ request, fetchImpl: empty })).toEqual({ ok: false, error: 'recap route returned no summary' })
    const throwing = vi.fn(async () => { throw new Error('offline') })
    expect(await requestLabRecapSummary({ request, fetchImpl: throwing })).toEqual({ ok: false, error: 'offline' })
  })
})

describe('away threshold before a summary is generated', () => {
  const NOW = Date.UTC(2026, 8, 7, 20, 0, 0)
  const ago = (ms: number) => NOW - ms

  it('is one hour', () => {
    expect(LAB_RECAP_MIN_AWAY_MS).toBe(60 * 60 * 1000)
  })

  it('does not ask for a summary of a short absence', () => {
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(5 * 60_000), placeUpdatedAt: ago(4 * 60_000), now: NOW })).toBe(false)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(59 * 60_000 + 59_000), now: NOW })).toBe(false)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: NOW, now: NOW })).toBe(false)
  })

  it('asks for one at the boundary and beyond', () => {
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(LAB_RECAP_MIN_AWAY_MS), now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(LAB_RECAP_MIN_AWAY_MS - 1), now: NOW })).toBe(false)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(3 * 60 * 60 * 1000), now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(6 * 24 * 60 * 60 * 1000), now: NOW })).toBe(true)
  })

  it('falls back to the position record when there is no session, and prefers the session when there is', () => {
    expect(recapLastSeenAt({ placeUpdatedAt: ago(2 * 60 * 60 * 1000), now: NOW })).toBe(ago(2 * 60 * 60 * 1000))
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: null, placeUpdatedAt: ago(2 * 60 * 60 * 1000), now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: null, placeUpdatedAt: ago(10 * 60_000), now: NOW })).toBe(false)
    // The session's clock wins while it is usable, even when the pin is fresher.
    expect(recapLastSeenAt({ sessionLastActiveAt: ago(3 * 60 * 60 * 1000), placeUpdatedAt: ago(60_000), now: NOW })).toBe(ago(3 * 60 * 60 * 1000))
  })

  it('treats a missing timestamp as an unmeasured gap and behaves as before the rule', () => {
    expect(recapLastSeenAt({ now: NOW })).toBeNull()
    expect(recapAwayMs({ now: NOW })).toBeNull()
    expect(shouldRequestRecapSummary({ now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: null, placeUpdatedAt: null, now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: 0, placeUpdatedAt: 0, now: NOW })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: Number.NaN, placeUpdatedAt: Number.NaN, now: NOW })).toBe(true)
  })

  it('reads a record written in the future as no time away rather than a negative age', () => {
    expect(recapAwayMs({ sessionLastActiveAt: NOW + 5 * 60_000, now: NOW })).toBe(0)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: NOW + 5 * 60_000, now: NOW })).toBe(false)
  })

  it('honours an explicit threshold override', () => {
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(90_000), now: NOW, minAwayMs: 60_000 })).toBe(true)
    expect(shouldRequestRecapSummary({ sessionLastActiveAt: ago(30_000), now: NOW, minAwayMs: 60_000 })).toBe(false)
  })
})

/**
 * The whole "when may the hero show a so-far line" rule, in the one place it
 * lives. Two conditions: coming straight back out of THIS book's reader, and
 * having been away from the book for less than an hour.
 */
describe('recapSummaryPermission', () => {
  const NOW = 1_700_000_000_000
  const HOUR = 60 * 60 * 1000
  const origin = (bookId: string, agoMs: number) => ({ bookId, at: NOW - agoMs })

  it('shows nothing for the book the reader has just come out of — no cache, no request', () => {
    const decision = recapSummaryPermission({
      bookId: 'bible',
      origin: origin('bible', 30 * 1000),
      sessionLastActiveAt: NOW - 40 * 1000,
      now: NOW,
    })
    expect(decision).toEqual({ cache: false, request: false, reason: 'from-reader' })
  })

  it('still shows nothing for that book when the device already holds an old summary of it', () => {
    // The reader was last in this chapter days ago and there is a cached line
    // for it, but they have just been looking at the page: the away rule would
    // allow both, and the origin still says no.
    const decision = recapSummaryPermission({
      bookId: 'bible',
      origin: origin('bible', 10 * 1000),
      sessionLastActiveAt: NOW - 72 * HOUR,
      now: NOW,
    })
    expect(decision.reason).toBe('from-reader')
    expect(decision.cache).toBe(false)
  })

  it('leaves every other book on the normal rules', () => {
    // Came out of the Odyssey; the hero is the Bible, read three hours ago.
    expect(recapSummaryPermission({
      bookId: 'bible',
      origin: origin('odyssey', 30 * 1000),
      sessionLastActiveAt: NOW - 3 * HOUR,
      now: NOW,
    })).toEqual({ cache: true, request: true, reason: 'allowed' })
    // Same, but the Bible was open five minutes ago: cache yes, request no.
    expect(recapSummaryPermission({
      bookId: 'bible',
      origin: origin('odyssey', 30 * 1000),
      sessionLastActiveAt: NOW - 5 * 60 * 1000,
      now: NOW,
    })).toEqual({ cache: true, request: false, reason: 'recent' })
  })

  it('summarises a fresh visit an hour or more after reading', () => {
    expect(recapSummaryPermission({ bookId: 'bible', origin: null, sessionLastActiveAt: NOW - HOUR, now: NOW }))
      .toEqual({ cache: true, request: true, reason: 'allowed' })
    expect(recapSummaryPermission({ bookId: 'bible', sessionLastActiveAt: NOW - 59 * 60 * 1000, now: NOW }).reason)
      .toBe('recent')
  })

  it('stops honouring a stale origin: a tab left open is not "just back from the reader"', () => {
    expect(recapSummaryPermission({
      bookId: 'bible',
      origin: origin('bible', LAB_RECAP_MIN_AWAY_MS + 1000),
      sessionLastActiveAt: NOW - 5 * HOUR,
      now: NOW,
    }).reason).toBe('allowed')
    // A marker written "in the future" by a skewed clock is not honoured either.
    expect(recapSummaryPermission({
      bookId: 'bible',
      origin: { bookId: 'bible', at: NOW + 60_000 },
      sessionLastActiveAt: NOW - 5 * HOUR,
      now: NOW,
    }).reason).toBe('allowed')
  })
})
