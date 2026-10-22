import { describe, expect, it } from 'vitest'
import {
  DAY,
  HOUR,
  inQuietHours,
  LOG_HORIZON_MS,
  mayReceiveOptIn,
  planLifecycle,
  planTrialNotice,
  readingCandidates,
  trialResetAccount,
  type LogRow,
  type ReaderFacts,
} from './rules'

// 10:00 in Copenhagen (CEST, UTC+2) on a Wednesday.
const NOW = Date.parse('2026-10-14T08:00:00Z')
const iso = (ms: number) => new Date(ms).toISOString()

function facts(over: Partial<ReaderFacts> = {}): ReaderFacts {
  return {
    userId: '11111111-1111-4111-8111-111111111111',
    email: 'tinct3@fastmail.com',
    createdAt: NOW - 60 * DAY,
    timeZone: 'Europe/Copenhagen',
    optedIn: true,
    confirmed: true,
    subscribed: false,
    lastReadAt: NOW - 4 * DAY,
    places: [{ bookId: 'frankenstein', updatedAt: NOW - 4 * DAY, sequentialChapter: 3, paragraphIndex: 10 }],
    finished: [],
    opened: new Set(['frankenstein']),
    log: [],
    ...over,
  }
}

const sent = (template: string, book: string | null, at: number, key = `${template}:${book ?? '-'}`): LogRow => ({ template, book_id: book, dedupe_key: key, sent_at: iso(at) })

describe('quiet hours (21:00–08:00 in the reader\'s time zone)', () => {
  it('blocks 21:00–07:59 and allows 08:00–20:59 local time', () => {
    expect(inQuietHours(Date.parse('2026-10-14T19:30:00Z'), 'Europe/Copenhagen')).toBe(true) // 21:30
    expect(inQuietHours(Date.parse('2026-10-14T05:59:00Z'), 'Europe/Copenhagen')).toBe(true) // 07:59
    expect(inQuietHours(Date.parse('2026-10-14T06:00:00Z'), 'Europe/Copenhagen')).toBe(false) // 08:00
    expect(inQuietHours(Date.parse('2026-10-14T18:59:00Z'), 'Europe/Copenhagen')).toBe(false) // 20:59
    // 10:00 in Copenhagen is 04:00 in New York.
    expect(inQuietHours(NOW, 'America/New_York')).toBe(true)
    expect(inQuietHours(NOW, 'Not/AZone')).toBe(false) // falls back to Copenhagen
  })

  it('holds every lifecycle email in quiet hours', () => {
    expect(planLifecycle(facts({ timeZone: 'America/New_York' }), NOW, { trialNotices: true })).toEqual({ kind: 'skip', reason: 'quiet-hours' })
  })
})

describe('frequency: one lifecycle email every 3 days', () => {
  it('waits 3 days after any logged email, then sends', () => {
    const recent = facts({ log: [sent('welcome', null, NOW - 2.9 * DAY)] })
    expect(planLifecycle(recent, NOW, { trialNotices: false })).toEqual({ kind: 'skip', reason: 'frequency' })
    const older = facts({ log: [sent('welcome', null, NOW - 3.1 * DAY)] })
    expect(planLifecycle(older, NOW, { trialNotices: false }).kind).toBe('reading')
  })
})

describe('quiet readers: nothing but welcome and trial notices within 48 h of reading', () => {
  it('skips reading emails for someone who read 47 h ago, but not trial notices', () => {
    const reader = facts({ lastReadAt: NOW - 47 * HOUR, createdAt: NOW - 25.2 * DAY })
    expect(planLifecycle(reader, NOW, { trialNotices: false })).toEqual({ kind: 'skip', reason: 'read-recently' })
    expect(planLifecycle(reader, NOW, { trialNotices: true })).toEqual({ kind: 'trial', plan: { template: 'trial-ending', dedupeKey: 'trial-ending:-' } })
  })
})

describe('consent: opt-in emails need the box ticked and a confirmed email', () => {
  it('requires both, and a missing confirmed column counts as unconfirmed', () => {
    expect(mayReceiveOptIn({ optedIn: true, confirmed: true })).toBe(true)
    expect(mayReceiveOptIn({ optedIn: true, confirmed: false })).toBe(false)
    expect(mayReceiveOptIn({ optedIn: true, confirmed: null })).toBe(false)
    expect(mayReceiveOptIn({ optedIn: false, confirmed: true })).toBe(false)
    expect(planLifecycle(facts({ confirmed: null }), NOW, { trialNotices: false })).toEqual({ kind: 'skip', reason: 'no-consent' })
  })
})

describe('trial notices', () => {
  it('trial-ending from day 25, trial-ended from day 30, once each, never to subscribers', () => {
    expect(planTrialNotice(facts({ createdAt: NOW - 24.9 * DAY }), NOW)).toBeNull()
    expect(planTrialNotice(facts({ createdAt: NOW - 25 * DAY }), NOW)?.template).toBe('trial-ending')
    expect(planTrialNotice(facts({ createdAt: NOW - 30 * DAY }), NOW)?.template).toBe('trial-ended')
    expect(planTrialNotice(facts({ createdAt: NOW - 38 * DAY }), NOW)).toBeNull()
    expect(planTrialNotice(facts({ createdAt: NOW - 26 * DAY, subscribed: true }), NOW)).toBeNull()
    expect(planTrialNotice(facts({ createdAt: NOW - 26 * DAY, log: [sent('trial-ending', null, NOW - 4 * DAY)] }), NOW)).toBeNull()
  })

  it('stay off while the switch is off, and go to readers without consent when on', () => {
    const reader = facts({ createdAt: NOW - 26 * DAY, optedIn: false, confirmed: null })
    expect(planLifecycle(reader, NOW, { trialNotices: false })).toEqual({ kind: 'skip', reason: 'no-consent' })
    expect(planLifecycle(reader, NOW, { trialNotices: true }).kind).toBe('trial')
  })
})

describe('trial notices after the trial reset (15 Oct 2026)', () => {
  const RESET = Date.parse('2026-10-15T00:00:00Z')

  it('never sends a pre-reset account a trial notice, on its sign-up schedule or on the reset\'s, so there is no burst', () => {
    const after = Date.parse('2026-10-16T08:00:00Z')
    // Signed up 25 and 30 days before: would have had trial-ending / trial-ended.
    expect(planTrialNotice(facts({ createdAt: after - 25 * DAY }), after)).toBeNull()
    expect(planTrialNotice(facts({ createdAt: after - 30 * DAY }), after)).toBeNull()
    expect(planLifecycle(facts({ createdAt: after - 26 * DAY, optedIn: false, confirmed: null }), after, { trialNotices: true })).toEqual({ kind: 'skip', reason: 'no-consent' })
    // Every pre-reset account, on the days the reset trial ends: nothing.
    for (const day of [25, 26, 29, 30, 31, 36]) {
      const at = RESET + day * DAY + 8 * HOUR
      for (const created of ['2026-08-01T10:00:00Z', '2026-09-01T10:00:00Z', '2026-10-14T23:00:00Z']) {
        expect(planTrialNotice(facts({ createdAt: Date.parse(created) }), at)).toBeNull()
      }
    }
  })

  it('keeps the sign-up schedule for accounts created at or after the reset', () => {
    const created = Date.parse('2026-10-15T09:00:00Z')
    expect(trialResetAccount({ createdAt: RESET }, RESET)).toBe(false)
    expect(trialResetAccount({ createdAt: RESET - 1 }, RESET)).toBe(true)
    expect(trialResetAccount({ createdAt: RESET - 1 }, RESET - 1)).toBe(false) // before the reset, as before
    expect(planTrialNotice(facts({ createdAt: created }), created + 25 * DAY)?.template).toBe('trial-ending')
    expect(planTrialNotice(facts({ createdAt: created }), created + 30 * DAY)?.template).toBe('trial-ended')
  })
})

describe('keep-reading and the stalled next-book', () => {
  it('waits for 3 days without reading', () => {
    expect(readingCandidates(facts({ places: [{ bookId: 'frankenstein', updatedAt: NOW - 2.5 * DAY, sequentialChapter: 3, paragraphIndex: 0 }] }), NOW)).toEqual([])
    expect(readingCandidates(facts(), NOW)).toEqual([{ kind: 'keep-reading', place: facts().places[0], dedupeKey: `keep-reading:frankenstein:${NOW - 4 * DAY}:1` }])
  })

  it('is at most weekly, stops after 2 ignored, then one stalled next-book, then nothing', () => {
    const place = facts().places[0]
    const first = sent('keep-reading', 'frankenstein', NOW - 5 * DAY, `keep-reading:frankenstein:${place.updatedAt}:1`)
    // 5 days after the first: not yet a week.
    expect(readingCandidates(facts({ log: [first] }), NOW)).toEqual([])
    const second = sent('keep-reading', 'frankenstein', NOW - 3 * DAY, `keep-reading:frankenstein:${place.updatedAt}:2`)
    const firstOld = { ...first, sent_at: iso(NOW - 10 * DAY) }
    const place12 = { ...place, updatedAt: NOW - 12 * DAY }
    const ignoredTwice = facts({ places: [place12], log: [{ ...firstOld, dedupe_key: `keep-reading:frankenstein:${place12.updatedAt}:1` }, { ...second, dedupe_key: `keep-reading:frankenstein:${place12.updatedAt}:2` }] })
    expect(readingCandidates(ignoredTwice, NOW)).toEqual([{ kind: 'next-book', opening: 'stalled', source: place12, dedupeKey: 'next-book:frankenstein' }])
    const afterStalled = facts({ places: [place12], log: [...ignoredTwice.log, sent('next-book-classic-lead', 'frankenstein', NOW - 4 * DAY, 'next-book:frankenstein')] })
    expect(readingCandidates(afterStalled, NOW)).toEqual([])
  })

  it('reading the book again means the earlier emails were answered, not ignored', () => {
    const place = { ...facts().places[0], updatedAt: NOW - 4 * DAY }
    const answered = [sent('keep-reading', 'frankenstein', NOW - 20 * DAY, 'keep-reading:frankenstein:1:1'), sent('keep-reading', 'frankenstein', NOW - 13 * DAY, 'keep-reading:frankenstein:1:2')]
    expect(readingCandidates(facts({ places: [place], log: answered }), NOW)).toEqual([{ kind: 'keep-reading', place, dedupeKey: `keep-reading:frankenstein:${place.updatedAt}:1` }])
  })
})

describe('the send log keeps 24 months: nothing is planned that an expired row could have blocked', () => {
  const OLD = NOW - LOG_HORIZON_MS - DAY
  const finished = { bookId: 'odyssey', updatedAt: NOW - 4 * DAY, sequentialChapter: 24, paragraphIndex: 80 }

  it('the horizon sits at least a month inside 24 months', () => {
    expect(LOG_HORIZON_MS).toBeLessThanOrEqual(700 * DAY)
  })

  it('an account older than the horizon gets no once-per-book next-book (its first send may have been deleted)', () => {
    expect(readingCandidates(facts({ createdAt: NOW - LOG_HORIZON_MS + DAY, finished: [finished], places: [] }), NOW)).toHaveLength(1)
    expect(readingCandidates(facts({ createdAt: OLD, finished: [finished], places: [] }), NOW)).toEqual([])
    expect(readingCandidates(facts({ createdAt: NaN, finished: [finished], places: [] }), NOW)).toEqual([])
  })

  it('an account older than the horizon gets no stalled next-book either, but keeps keep-reading for a recent place', () => {
    const place12 = { ...facts().places[0], updatedAt: NOW - 12 * DAY }
    const log = [
      sent('keep-reading', 'frankenstein', NOW - 10 * DAY, `keep-reading:frankenstein:${place12.updatedAt}:1`),
      sent('keep-reading', 'frankenstein', NOW - 3 * DAY, `keep-reading:frankenstein:${place12.updatedAt}:2`),
    ]
    expect(readingCandidates(facts({ createdAt: NOW - 60 * DAY, places: [place12], log }), NOW)).toEqual([{ kind: 'next-book', opening: 'stalled', source: place12, dedupeKey: 'next-book:frankenstein' }])
    expect(readingCandidates(facts({ createdAt: OLD, places: [place12], log }), NOW)).toEqual([])
    expect(readingCandidates(facts({ createdAt: OLD }), NOW)).toEqual([{ kind: 'keep-reading', place: facts().places[0], dedupeKey: `keep-reading:frankenstein:${NOW - 4 * DAY}:1` }])
  })

  it('nothing about a place untouched for longer than the horizon (its keep-reading rows may have been deleted)', () => {
    const stale = { ...facts().places[0], updatedAt: NOW - LOG_HORIZON_MS }
    // The rows that would have proven both keep-reading emails and the stalled next-book are gone.
    expect(readingCandidates(facts({ places: [stale], log: [] }), NOW)).toEqual([])
    expect(readingCandidates(facts({ createdAt: OLD, places: [stale], log: [] }), NOW)).toEqual([])
  })
})

describe('next-book after finishing, idempotent per template and book', () => {
  it('suggests a next book once per finished book', () => {
    const finished = { bookId: 'odyssey', updatedAt: NOW - 4 * DAY, sequentialChapter: 24, paragraphIndex: 80 }
    const reader = facts({ finished: [finished], places: [] })
    expect(readingCandidates(reader, NOW)).toEqual([{ kind: 'next-book', opening: 'finished', source: finished, dedupeKey: 'next-book:odyssey' }])
    expect(readingCandidates(facts({ finished: [finished], places: [], log: [sent('next-book', 'odyssey', NOW - 9 * DAY)] }), NOW)).toEqual([])
  })
})

describe('the first month free (22 Oct 2026)', async () => {
  const { profileSubscribed } = await import('./engine')
  it('counts as subscribed, so no trial notice runs during it', () => {
    expect(profileSubscribed({ id: 'a', email: null, created_at: '2026-10-16T00:00:00Z', subscription_status: 'canceled', subscription_period_end: '2026-11-22T05:00:00+00:00' })).toBe(true)
    expect(profileSubscribed({ id: 'a', email: null, created_at: '2026-10-16T00:00:00Z', subscription_status: 'canceled', subscription_period_end: '2026-11-10T00:00:00Z' })).toBe(false)
    expect(profileSubscribed({ id: 'a', email: null, created_at: '2026-10-16T00:00:00Z', subscription_status: null })).toBe(false)
  })
})
