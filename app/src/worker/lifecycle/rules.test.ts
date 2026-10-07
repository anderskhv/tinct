import { describe, expect, it } from 'vitest'
import {
  DAY,
  HOUR,
  inQuietHours,
  mayReceiveOptIn,
  planLifecycle,
  planTrialNotice,
  readingCandidates,
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

describe('next-book after finishing, idempotent per template and book', () => {
  it('suggests a next book once per finished book', () => {
    const finished = { bookId: 'odyssey', updatedAt: NOW - 4 * DAY, sequentialChapter: 24, paragraphIndex: 80 }
    const reader = facts({ finished: [finished], places: [] })
    expect(readingCandidates(reader, NOW)).toEqual([{ kind: 'next-book', opening: 'finished', source: finished, dedupeKey: 'next-book:odyssey' }])
    expect(readingCandidates(facts({ finished: [finished], places: [], log: [sent('next-book', 'odyssey', NOW - 9 * DAY)] }), NOW)).toEqual([])
  })
})
