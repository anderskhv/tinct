import { describe, expect, it } from 'vitest'
import { countPositionJumps, isTestProfile } from '../scripts/lib/positionJumps.mjs'
import { isReservedTestEmail } from './social/socialRules'

const now = Date.parse('2026-11-17T12:00:00Z')
const min = 60_000
const day = 24 * 60 * min
let seq = 0
/** A synthetic reading-memory session: opened at `from`, furthest shown `to`, left at `at`. */
function session(book: string, chapter: number, from: number, to: number, at: number, startedAt: number, minutes = 10, device = 'd1', edition = 'en') {
  return {
    id: `s${++seq}`, seq: 1, deviceId: device, owner: null, state: 'progressed', startedAt, lastActiveAt: startedAt + minutes * min, endedAt: null, completedAt: null,
    anchor: { bookId: book, editionKey: edition, chapterNumber: chapter, chapterLabel: '', page: 1, totalPages: null, paragraphIndex: at, wordIndex: 0,
      range: { startParagraphIndex: from, startWordIndex: 0, startCharOffset: 0, endParagraphIndex: to, endWordIndex: 0, endCharOffset: 0, firstWords: '', lastWords: '' } },
  }
}

describe('weekly position-jump counts', () => {
  it('counts A, B and C with their thresholds, accounts, books and days', () => {
    // Stored as a map, as some reading-memory rows are.
    const odyssey = {
      // B: a 2-minute session that showed ¶120 and was left at ¶90.
      x: session('odyssey', 4, 100, 120, 90, now - 1 * day, 2),
      // Not B: same fall, but the session lasted 10 minutes.
      y: session('odyssey', 4, 100, 120, 90, now - 1 * day + 60 * min, 10),
      // Not B: a fall of exactly 20 paragraphs.
      z: session('odyssey', 4, 100, 120, 100, now - 1 * day + 2 * 60 * min, 2),
    }
    const accounts = [
      { sessions: [
        session('master', 2, 200, 244, 244, now - 3 * day),
        // A: opens at ¶62 after leaving off at ¶244 in the same chapter, on another device.
        session('master', 2, 62, 70, 70, now - 2 * day, 10, 'd2'),
        // Not A: 20 paragraphs lower is within the threshold.
        session('master', 2, 50, 60, 60, now - 2 * day + 30 * min),
        // C: the next session is in an earlier chapter.
        session('master', 1, 0, 5, 5, now - 1 * day),
      ] },
      { sessions: odyssey },
    ]
    const report = countPositionJumps(accounts, { now })
    expect(report.A).toEqual({ events: 1, accounts: 1, books: 1, otherDevice: 1, editionChange: 0 })
    expect(report.B).toEqual({ events: 1, accounts: 1, books: 1, otherDevice: 0, editionChange: 0 })
    expect(report.C).toEqual({ events: 1, accounts: 1, books: 1, otherDevice: 0, editionChange: 0 })
    expect(report.accountsScanned).toBe(2)
    expect(report.sessionsInWindow).toBe(7)
    expect(report.perDay['2026-11-15']).toEqual({ A: 1, B: 0, C: 0 })
    expect(report.perDay['2026-11-16']).toEqual({ A: 0, B: 1, C: 1 })
    expect(Object.values(report.perDay).reduce((n: number, d: any) => n + d.A + d.B + d.C, 0)).toBe(3)
  })

  it('orders sessions by start time, ignores other books and counts only events inside the window', () => {
    const accounts = [{ sessions: [
      // Recorded out of order: the later session (¶10) comes first in storage.
      session('master', 2, 10, 15, 15, now - 1 * day),
      session('master', 2, 200, 240, 240, now - 2 * day),
      // Another book in between does not break the master sequence.
      session('hamlet', 1, 0, 3, 3, now - 1.5 * day),
      // Earlier chapter, but before the 7-day window.
      session('iliad', 5, 0, 30, 30, now - 9 * day),
      session('iliad', 2, 0, 3, 3, now - 8.5 * day),
      // Incomplete record: ignored.
      { startedAt: now - day, anchor: { bookId: 'iliad' } },
    ] }]
    const report = countPositionJumps(accounts, { now })
    expect(report.A.events).toBe(1)
    expect(report.C.events).toBe(0)
    expect(report.sessionsInWindow).toBe(3)
  })

  it('reports counts only: no account, device or book identifiers in the output', () => {
    const report = countPositionJumps([{ sessions: [
      session('secret-book', 3, 0, 300, 300, now - 2 * day, 10, 'device-abc'),
      session('secret-book', 2, 0, 3, 3, now - day, 10, 'device-xyz'),
    ] }], { now })
    const text = JSON.stringify(report)
    expect(report.C.events).toBe(1)
    for (const id of ['secret-book', 'device-abc', 'device-xyz', 's1', 's2']) expect(text).not.toContain(id)
  })

  it('handles accounts with no sessions', () => {
    const report = countPositionJumps([{ sessions: [] }, { sessions: null }, {}], { now, days: 7 })
    expect(report.A.events + report.B.events + report.C.events).toBe(0)
    expect(Object.keys(report.perDay)).toHaveLength(8)
  })

  it('leaves out test accounts by the same rule as admin metrics', () => {
    for (const email of ['qa-soc-a-1a2b3c@test.tinct.app', 'QA@Example.com', 'x@sub.example.org', 'a@b.test', 'a@b.invalid',
      'reader@gmail.com', 'reader@example.co', 'testing@tinct.app', '', null]) {
      expect(isTestProfile({ email }), String(email)).toBe(isReservedTestEmail(email))
    }
    expect(isTestProfile({ email: 'reader@gmail.com', is_test: true })).toBe(true)
    expect(isTestProfile({ email: 'reader@gmail.com', is_test: false })).toBe(false)
  })
})
