import { describe, expect, it, vi } from 'vitest'
import { emptyReadingYear, forwardPagesRead, mergeReadingYear, parseReadingYear, readingYearTotals, recordReading, syncReadingYear } from './labReadingYear'

describe('reading year tally', () => {
  it('counts only forward page turns: back, jumps, repagination and other books add nothing', () => {
    const at = (chapter: number, page: number, bookId = 'confessions') => ({ bookId, chapter, page })
    expect(forwardPagesRead(null, at(1, 0))).toBe(0)
    expect(forwardPagesRead(at(1, 3), at(1, 4))).toBe(1)
    expect(forwardPagesRead(at(1, 4), at(1, 6))).toBe(2) // desktop spread
    expect(forwardPagesRead(at(1, 6), at(1, 5))).toBe(0)
    expect(forwardPagesRead(at(1, 2), at(1, 30))).toBe(0)
    expect(forwardPagesRead(at(1, 30), at(2, 0))).toBe(1)
    expect(forwardPagesRead(at(1, 30), at(5, 0))).toBe(0)
    expect(forwardPagesRead(at(1, 3), at(1, 4, 'bible'))).toBe(0)
  })

  it('sums devices and unions books; merging never loses a device and is idempotent', () => {
    let phone = emptyReadingYear(2026)
    phone = recordReading(phone, 'phone', { pages: 2, bookId: 'confessions', seconds: 60 })
    let desk = recordReading(emptyReadingYear(2026), 'desk', { pages: 1, bookId: 'bible', seconds: 30 })
    desk = recordReading(desk, 'desk', { pages: 1, bookId: 'confessions' })
    const merged = mergeReadingYear(phone, desk)
    expect(readingYearTotals(merged)).toEqual({ seconds: 90, pages: 4, books: 2 })
    expect(mergeReadingYear(merged, merged)).toEqual(merged)
    expect(mergeReadingYear(merged, phone)).toEqual(merged)
  })

  it('time alone never adds a book, and a stale copy never lowers counts', () => {
    const later = recordReading(recordReading(emptyReadingYear(2026), 'a', { seconds: 30 }), 'a', { pages: 3, bookId: 'x' })
    const stale = recordReading(emptyReadingYear(2026), 'a', { seconds: 30 })
    expect(readingYearTotals(stale).books).toBe(0)
    expect(readingYearTotals(mergeReadingYear(stale, later))).toEqual({ seconds: 30, pages: 3, books: 1 })
  })

  it('ignores another year and malformed rows', () => {
    expect(parseReadingYear({ year: 2025, devices: { a: { seconds: 5, pages: 1, books: ['x'] } } }, 2026)).toEqual(emptyReadingYear(2026))
    expect(parseReadingYear({ year: 2026, devices: { a: { seconds: -4, pages: 'x', books: [3, 'y'] } } }, 2026).devices.a).toEqual({ seconds: 0, pages: 0, books: ['y'] })
  })

  it('merges with the account row and retries once after a conflict', async () => {
    const local = recordReading(emptyReadingYear(2026), 'phone', { pages: 5, bookId: 'confessions', seconds: 120 })
    const serverV1 = recordReading(emptyReadingYear(2026), 'desk', { pages: 2, bookId: 'bible' })
    const serverV2 = recordReading(serverV1, 'laptop', { pages: 1, bookId: 'odyssey' })
    const commits: unknown[] = []
    const rpc = vi.fn(async (_name: string, args: { p_value: unknown; p_expected_rev: number | null }) => {
      commits.push(args)
      return commits.length === 1
        ? { data: [{ key: 'reading-year-2026', value: serverV2, rev: 4, applied: false, conflict: true }], error: null }
        : { data: [{ key: 'reading-year-2026', value: args.p_value, rev: 5, applied: true }], error: null }
    })
    const maybeSingle = vi.fn(async () => ({ data: { key: 'reading-year-2026', value: serverV1, rev: 3 }, error: null }))
    const chain = { select: () => chain, eq: () => chain, maybeSingle }
    const client = { from: () => chain, rpc } as never
    const merged = await syncReadingYear('user-1', local, client)
    expect(readingYearTotals(merged)).toEqual({ seconds: 120, pages: 8, books: 3 })
    expect((commits[0] as { p_expected_rev: number }).p_expected_rev).toBe(3)
    expect((commits[1] as { p_expected_rev: number }).p_expected_rev).toBe(4)
  })
})
