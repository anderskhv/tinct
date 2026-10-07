import { describe, expect, it } from 'vitest'
import {
  BEAT_MAX_SECONDS,
  DAILY_CAP_SECONDS,
  EARLIER_BOOK_ID,
  booksComparison,
  creditBeat,
  earlierDayForYear,
  factsLine,
  finishedBookIds,
  formatDuration,
  parseBeat,
  parseFlush,
  plausibleToday,
  readingTimeStats,
  readingYearSeconds,
  weekStart,
  type LedgerRow,
} from './model'

const NOW = Date.UTC(2026, 9, 7, 12, 0, 0) // 7 October 2026, 12:00 UTC
const row = (day: string, bookId: string, read: number, listen = 0): LedgerRow => ({ day, bookId, read, listen })

describe('heartbeat limits', () => {
  it('credits at most a minute per beat', () => {
    expect(creditBeat({ read: 300, listen: 0, playing: false }, 0)).toEqual({ read: BEAT_MAX_SECONDS, listen: 0 })
    expect(creditBeat({ read: 45, listen: 45, playing: true }, 0)).toEqual({ read: 15, listen: 45 })
    expect(creditBeat({ read: 30, listen: 0, playing: false }, 0)).toEqual({ read: 30, listen: 0 })
  })

  it('counts listening only while narration plays', () => {
    expect(creditBeat({ read: 0, listen: 60, playing: false }, 0)).toEqual({ read: 0, listen: 0 })
    expect(creditBeat({ read: 0, listen: 60, playing: true }, 0)).toEqual({ read: 0, listen: 60 })
  })

  it('never passes 16 hours in a day', () => {
    expect(creditBeat({ read: 60, listen: 0, playing: false }, DAILY_CAP_SECONDS - 25)).toEqual({ read: 25, listen: 0 })
    expect(creditBeat({ read: 60, listen: 0, playing: false }, DAILY_CAP_SECONDS)).toEqual({ read: 0, listen: 0 })
    expect(creditBeat({ read: 30, listen: 30, playing: true }, DAILY_CAP_SECONDS + 999)).toEqual({ read: 0, listen: 0 })
  })

  it('refuses negative, fractional and absurd input', () => {
    expect(creditBeat({ read: -50, listen: Number.NaN, playing: true }, 0)).toEqual({ read: 0, listen: 0 })
    expect(creditBeat({ read: 12.9, listen: 0, playing: false }, 0)).toEqual({ read: 12, listen: 0 })
  })

  it('accepts only the reader’s plausible today and a real book id', () => {
    expect(parseBeat({ day: '2026-10-07', bookId: 'frankenstein', read: 60, playing: false }, NOW)).toMatchObject({ day: '2026-10-07', read: 60 })
    // Reader-local dates run a day either side of UTC (UTC−12 … UTC+14).
    expect(plausibleToday('2026-10-06', NOW)).toBe(true)
    expect(plausibleToday('2026-10-08', NOW)).toBe(true)
    expect(parseBeat({ day: '2026-10-09', bookId: 'frankenstein', read: 60 }, NOW)).toBeNull()
    expect(parseBeat({ day: '2026-02-30', bookId: 'frankenstein', read: 60 }, NOW)).toBeNull()
    expect(parseBeat({ day: '2026-10-07', bookId: '../etc', read: 60 }, NOW)).toBeNull()
    expect(parseBeat({ day: '2026-10-07', bookId: EARLIER_BOOK_ID, read: 60 }, NOW)).toBeNull()
  })
})

describe('flushes of signed-out and offline time', () => {
  it('sums per day and book, caps each day, and drops days too old to trust', () => {
    const flush = parseFlush({
      flushId: 'abcdef123456',
      entries: [
        { day: '2026-10-06', bookId: 'odyssey', read: 600, listen: 0 },
        { day: '2026-10-06', bookId: 'odyssey', read: 60, listen: 30 },
        { day: '2026-10-05', bookId: 'bible', read: DAILY_CAP_SECONDS * 3 },
        { day: '2026-09-01', bookId: 'bible', read: 999 },
      ],
      earlier: 1200,
    }, NOW)
    expect(flush?.entries).toEqual([
      { day: '2026-10-06', bookId: 'odyssey', read: 660, listen: 30 },
      { day: '2026-10-05', bookId: 'bible', read: DAILY_CAP_SECONDS, listen: 0 },
    ])
    expect(flush?.earlier).toBe(1200)
    expect(parseFlush({ flushId: 'x', entries: [] }, NOW)).toBeNull()
  })
})

describe('the one-time merge of yearly totals', () => {
  it('sums the devices of the matching year, capped at what could have been read since the tally began', () => {
    const value = { v: 1, year: 2026, devices: { phone: { seconds: 3600, pages: 3, books: [] }, desk: { seconds: 1800, pages: 1, books: [] } } }
    expect(readingYearSeconds(value, 2026, NOW)).toBe(5400)
    expect(readingYearSeconds({ ...value, year: 2025 }, 2026, NOW)).toBe(0)
    const inflated = { v: 1, year: 2026, devices: { phone: { seconds: 10 ** 9 } } }
    // 30 September to 7 October: eight days of at most 16 hours.
    expect(readingYearSeconds(inflated, 2026, NOW)).toBe(8 * DAILY_CAP_SECONDS)
    expect(earlierDayForYear(2026)).toBe('2026-09-30')
    expect(earlierDayForYear(2027)).toBe('2027-01-01')
  })
})

describe('reading time figures', () => {
  it('counts today and the six days before, by the reader’s own date', () => {
    const stats = readingTimeStats([
      row('2026-09-30', 'frankenstein', 600), // eight days back: outside
      row('2026-10-01', 'frankenstein', 1200), // first day of the window
      row('2026-10-07', 'odyssey', 300, 300),
      row(earlierDayForYear(2026), EARLIER_BOOK_ID, 7200), // before the ledger: totals only
    ], '2026-10-07')
    expect(stats.last7.map(day => day.day)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'])
    expect(stats.last7Seconds).toBe(1800)
    expect(stats.totalSeconds).toBe(600 + 1200 + 600 + 7200)
    expect(stats.listenSeconds).toBe(300)
    expect(stats.firstDay).toBe('2026-09-30')
  })

  it('keeps the window at seven dates across a time-zone change, without dropping or doubling time', () => {
    // Read in Tokyo late on the 8th (local), then flew to New York, where it is still the 7th.
    const rows = [row('2026-10-02', 'odyssey', 600), row('2026-10-08', 'odyssey', 900), row('2026-10-07', 'odyssey', 300)]
    const west = readingTimeStats(rows, '2026-10-07')
    expect(west.last7).toHaveLength(7)
    expect(west.last7[6]).toEqual({ day: '2026-10-08', seconds: 900 })
    expect(west.last7Seconds).toBe(1800)
    // Flying east instead: the reader's date jumps ahead a day; nothing is lost.
    const east = readingTimeStats([row('2026-10-01', 'odyssey', 600), row('2026-10-07', 'odyssey', 300)], '2026-10-08')
    expect(east.last7.map(day => day.day)[0]).toBe('2026-10-02')
    expect(east.last7Seconds).toBe(300)
    // A date two days ahead is not "today" anywhere: it does not move the window.
    expect(readingTimeStats([row('2026-10-09', 'odyssey', 60)], '2026-10-07').last7[6].day).toBe('2026-10-07')
  })

  it('streaks run to today, or to yesterday before today’s first minute', () => {
    const rows = ['2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'].map(day => row(day, 'bible', 120))
    expect(readingTimeStats(rows, '2026-10-07').streak).toBe(4)
    expect(readingTimeStats([...rows, row('2026-10-07', 'bible', 60)], '2026-10-07').streak).toBe(5)
    expect(readingTimeStats(rows, '2026-10-08').streak).toBe(0)
    expect(readingTimeStats([...rows, row('2026-09-20', 'bible', 60), row('2026-09-21', 'bible', 60)], '2026-10-08').longestStreak).toBe(4)
  })

  it('charts twelve calendar weeks, Monday to Sunday, this week last', () => {
    expect(weekStart('2026-10-07')).toBe('2026-10-05')
    expect(weekStart('2026-10-05')).toBe('2026-10-05')
    expect(weekStart('2026-10-11')).toBe('2026-10-05')
    const stats = readingTimeStats([row('2026-10-05', 'a', 3600), row('2026-10-04', 'a', 1800), row('2026-07-01', 'a', 60)], '2026-10-07')
    expect(stats.weeks).toHaveLength(12)
    expect(stats.weeks[11]).toEqual({ start: '2026-10-05', seconds: 3600 })
    expect(stats.weeks[10]).toEqual({ start: '2026-09-28', seconds: 1800 })
    expect(stats.weeks[0].start).toBe('2026-07-20')
    expect(stats.weeks.reduce((sum, week) => sum + week.seconds, 0)).toBe(5400)
  })

  it('says what it can in the facts line', () => {
    expect(factsLine({ streak: 6, totalSeconds: 41 * 3600 + 1200, firstDay: '2026-07-14' })).toBe('6-day streak · 41 h since 14 July')
    expect(factsLine({ streak: 1, totalSeconds: 30, firstDay: '2026-10-07' })).toBe('')
    expect(formatDuration(6 * 3600 + 600)).toBe('6 h 10 m')
    expect(formatDuration(45 * 60)).toBe('45 m')
  })
})

describe('books finished', () => {
  const last = (id: string) => ({ frankenstein: 24, odyssey: 24, bible: 1189 } as Record<string, number>)[id] ?? null
  it('is reaching the end of the last chapter, from the position record', () => {
    expect(finishedBookIds({
      frankenstein: [1, 2, 3, 24], // jumped to the end and finished it: finished
      odyssey: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // all but the last
      bible: [1, 2, 3],
      'unknown-book': [1], // structure unknown: never counted
    }, last)).toEqual(['frankenstein'])
    expect(finishedBookIds(null, last)).toEqual([])
  })

  it('compares hours with the book’s estimated reading time', () => {
    expect(booksComparison(6 * 5 * 3600, { title: 'Frankenstein', minutes: 5 * 60 })).toBe('About six Frankensteins, start to finish.')
    expect(booksComparison(3 * 3600, { title: 'Moby-Dick', minutes: 60 })).toBe('About three Moby-Dicks, start to finish.')
    expect(booksComparison(3 * 3600, { title: 'The Odyssey', minutes: 60 })).toBe('About three readings of The Odyssey, start to finish.')
    expect(booksComparison(3600, { title: 'Meditations', minutes: 60 })).toBe('About one Meditations, start to finish.')
    expect(booksComparison(600, { title: 'Frankenstein', minutes: 300 })).toBeNull()
  })
})
