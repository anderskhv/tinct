// @vitest-environment jsdom
/**
 * Your reading's week bars: each bar opens that week's dates, total and
 * books (most time first), from the ledger's per-day, per-book rows.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EARLIER_BOOK_ID, dayBooks, monthTotals, readingTimeStats, weekBooks, weekDays, type LedgerRow } from '../readingTime/model'
import { loadReading, type ReadingLoad } from './cardsApi'
import { readingFigures, weekRange } from './cardsFormat'
import { CardStack } from './cardStack'
import { readingCard, type CardsEnv } from './cardViews'

const rows: LedgerRow[] = [
  { day: '2026-09-30', bookId: EARLIER_BOOK_ID, read: 99_999, listen: 0 },
  { day: '2026-09-30', bookId: 'frankenstein', read: 1800, listen: 0 },
  { day: '2026-10-06', bookId: 'odyssey', read: 600, listen: 600 },
  { day: '2026-10-07', bookId: 'frankenstein', read: 1200, listen: 0 },
  { day: '2026-10-11', bookId: 'frankenstein', read: 1800, listen: 0 },
  { day: '2026-10-07', bookId: 'private', read: 300, listen: 0 },
  { day: '2026-10-08', bookId: 'not-in-catalogue', read: 120, listen: 0 },
  { day: '2026-10-09', bookId: 'odyssey', read: 0, listen: 0 },
  { day: '2026-10-13', bookId: 'odyssey', read: 900, listen: 0 },
]

describe('weekBooks', () => {
  it('sums each book per Monday-to-Sunday week, most time first, leaving out pre-ledger time', () => {
    const weeks = weekBooks(rows, ['2026-09-28', '2026-10-05', '2026-10-12', '2026-09-21'])
    expect(weeks.get('2026-09-28')).toEqual([{ bookId: 'frankenstein', seconds: 1800 }])
    expect(weeks.get('2026-10-05')).toEqual([
      { bookId: 'frankenstein', seconds: 3000 },
      { bookId: 'odyssey', seconds: 1200 },
      { bookId: 'private', seconds: 300 },
      { bookId: 'not-in-catalogue', seconds: 120 },
    ])
    expect(weeks.get('2026-10-12')).toEqual([{ bookId: 'odyssey', seconds: 900 }])
    expect(weeks.get('2026-09-21')).toEqual([])
  })

  it('adds up to the chart’s own week totals', () => {
    const stats = readingTimeStats(rows, '2026-10-14')
    const weeks = weekBooks(rows, stats.weeks.map(week => week.start))
    for (const week of stats.weeks) {
      expect((weeks.get(week.start) ?? []).reduce((sum, book) => sum + book.seconds, 0), week.start).toBe(week.seconds)
    }
  })

  it('counts an own book (not yet sent) under the private bucket, never by its id', () => {
    const weeks = weekBooks([
      { day: '2026-10-06', bookId: 'private', read: 60, listen: 0 },
      { day: '2026-10-07', bookId: 'userbook-0123456789abcdef', read: 120, listen: 0 },
    ], ['2026-10-05'])
    expect(weeks.get('2026-10-05')).toEqual([{ bookId: 'private', seconds: 180 }])
  })

  it('writes a week’s dates within one month and across two', () => {
    expect(weekRange('2026-10-05')).toBe('5–11 Oct')
    expect(weekRange('2026-09-28')).toBe('28 Sep – 4 Oct')
    expect(weekRange('2025-12-29')).toBe('29 Dec – 4 Jan')
    expect(weekRange('nope')).toBe('')
  })
})

describe('weekDays', () => {
  it('sums each day, Monday to Sunday, leaving out pre-ledger time and invalid days', () => {
    const days = weekDays([...rows, { day: 'not-a-day', bookId: 'odyssey', read: 500, listen: 0 }], ['2026-09-28', '2026-10-05', '2026-10-12'])
    // 30 Sep is a Wednesday; the earlier time on that day is left out.
    expect(days.get('2026-09-28')).toEqual([0, 0, 1800, 0, 0, 0, 0])
    // Tue 6: 600 read + 600 listened; Wed 7: two books; Thu 8: 120; Fri 9: nothing read; Sun 11: 1800.
    expect(days.get('2026-10-05')).toEqual([0, 1200, 1500, 120, 0, 0, 1800])
    expect(days.get('2026-10-12')).toEqual([0, 900, 0, 0, 0, 0, 0])
  })

  it('adds up to the chart’s own week totals', () => {
    const stats = readingTimeStats(rows, '2026-10-14')
    const days = weekDays(rows, stats.weeks.map(week => week.start))
    for (const week of stats.weeks) {
      expect((days.get(week.start) ?? []).reduce((sum, value) => sum + value, 0), week.start).toBe(week.seconds)
    }
  })

  it('gives seven zeros for a week with no reading', () => {
    expect(weekDays(rows, ['2026-09-21']).get('2026-09-21')).toEqual([0, 0, 0, 0, 0, 0, 0])
  })
})

describe('dayBooks and monthTotals', () => {
  it('sums each day’s books from a start day, most time first, leaving out earlier time and empty days', () => {
    const days = dayBooks(rows, '2026-10-05')
    expect([...days.keys()]).toEqual(['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-11', '2026-10-13'])
    expect(days.get('2026-10-07')).toEqual([{ bookId: 'frankenstein', seconds: 1200 }, { bookId: 'private', seconds: 300 }])
    expect(days.has('2026-09-30')).toBe(false)
  })

  it('gives every month from the first read to this one, in order, adding up to the reading', () => {
    const months = monthTotals([...rows, { day: '2026-07-02', bookId: 'odyssey', read: 60, listen: 0 }], '2026-10-14')
    expect(months.map(month => [month.start, month.seconds])).toEqual([['2026-07', 60], ['2026-08', 0], ['2026-09', 1800], ['2026-10', 1200 + 3000 + 300 + 120 + 900]])
    expect(months[3].books[0]).toEqual({ bookId: 'frankenstein', seconds: 3000 })
    expect(monthTotals([], '2026-10-14')).toEqual([{ start: '2026-10', seconds: 0, books: [] }])
  })
})

describe('loadReading', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 12))
    localStorage.clear()
  })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it('names each week’s books from the catalogue; an own book is “A private book”; unknown books are left out', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/reading-time')) return Response.json({ enabled: true, rows })
      if (url.includes('/lab/catalogue.json')) return Response.json({ books: [{ id: 'frankenstein', title: 'Frankenstein' }, { id: 'odyssey', title: 'The Odyssey' }] })
      return Response.json({}, { status: 404 })
    }) as unknown as typeof fetch
    vi.stubGlobal('fetch', fetchImpl)
    const load = await loadReading('tok', null, fetchImpl)
    expect(load?.weeks?.map(week => week.start)).toEqual(load?.stats.weeks.map(week => week.start))
    expect(load?.weeks?.find(week => week.start === '2026-10-05')?.books).toEqual([
      { bookId: 'frankenstein', title: 'Frankenstein', seconds: 3000 },
      { bookId: 'odyssey', title: 'The Odyssey', seconds: 1200 },
      { bookId: 'private', title: 'A private book', seconds: 300 },
    ])
    expect(load?.weeks?.find(week => week.start === '2026-10-05')?.days).toEqual([0, 1200, 1500, 120, 0, 0, 1800])
    expect(load?.weeks?.find(week => week.start === '2026-10-12')?.days).toEqual([0, 900, 0, 0, 0, 0, 0])
  })
})

describe('the week bars', () => {
  const stats = readingTimeStats(rows, '2026-10-14')
  const reading: ReadingLoad = {
    stats,
    readingNow: [],
    finished: [],
    weeks: [
      { start: '2026-09-28', books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 1800 }] },
      { start: '2026-10-05', books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 3000 }, { bookId: 'odyssey', title: 'The Odyssey', seconds: 1200 }] },
      { start: '2026-10-12', books: [{ bookId: 'odyssey', title: 'The Odyssey', seconds: 900 }] },
    ],
  }
  let stack: CardStack | null = null
  const open = (data: ReadingLoad = reading) => {
    const env: CardsEnv = {
      session: { token: 'tok', userId: null, email: null, accountName: null },
      social: false, changed: () => stack?.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword: async () => '', navigate: vi.fn(),
      data: { profile: null, reading: data, allowance: null, plan: null, intervals: [], rank: null, find: null, findBadge: 0 },
    }
    stack = new CardStack({ dark: false })
    stack.push(readingCard(env))
    return env
  }
  const bars = () => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="reading-weeks"] button')]
  const detail = () => document.querySelector<HTMLElement>('[data-testid="reading-week"]')!
  const bar = (start: string) => bars().find(button => button.dataset.week === start)!
  afterEach(() => { stack?.closeAll(); stack = null; document.body.innerHTML = '' })

  it('draws one labelled button per week, none pressed, the detail closed', () => {
    open()
    expect(bars().map(button => button.dataset.week)).toEqual(['2026-09-28', '2026-10-05', '2026-10-12'])
    expect(bars().every(button => button.type === 'button' && button.getAttribute('aria-pressed') === 'false' && button.getAttribute('aria-expanded') === 'false')).toBe(true)
    expect(bar('2026-10-05').getAttribute('aria-label')).toBe('5–11 Oct, 1 h 17')
    expect(bar('2026-10-05').getAttribute('aria-controls')).toBe(detail().id)
    expect(document.querySelector('[data-testid="reading-weeks"]')?.getAttribute('aria-hidden')).toBeNull()
    expect(detail().hidden).toBe(true)
  })

  it('a tap shows the week’s dates, total and books, most time first; the bar stays pressed', () => {
    open()
    bar('2026-10-05').click()
    expect(bar('2026-10-05').getAttribute('aria-pressed')).toBe('true')
    expect(bar('2026-10-05').getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('[data-testid="reading-weeks"]')?.classList.contains('is-picked')).toBe(true)
    expect(detail().hidden).toBe(false)
    const lines = [...detail().querySelectorAll('.tc-r')].map(line => [line.querySelector('.tc-lt')?.textContent, line.querySelector('.tc-v')?.textContent])
    expect(lines).toEqual([['5–11 Oct', '1 h 17'], ['Frankenstein', '50 m'], ['The Odyssey', '20 m']])
    // Under the chart, above the facts.
    expect(detail().previousElementSibling?.classList.contains('tc-sum')).toBe(true)
    expect(detail().nextElementSibling?.getAttribute('data-testid')).toBe('card-facts')
  })

  it('another bar switches the detail; the same bar again closes it', () => {
    open()
    bar('2026-10-05').click()
    bar('2026-10-12').click()
    expect(bar('2026-10-05').getAttribute('aria-pressed')).toBe('false')
    expect(bar('2026-10-12').getAttribute('aria-pressed')).toBe('true')
    expect(detail().querySelector('.tc-lt')?.textContent).toBe('12–18 Oct')
    expect([...detail().querySelectorAll('[data-testid="reading-week-row"] .tc-lt')].map(node => node.textContent)).toEqual(['The Odyssey'])
    bar('2026-10-12').click()
    expect(bar('2026-10-12').getAttribute('aria-pressed')).toBe('false')
    expect(detail().hidden).toBe(true)
    expect(detail().childElementCount).toBe(0)
    expect(document.querySelector('[data-testid="reading-weeks"]')?.classList.contains('is-picked')).toBe(false)
  })

  it('keeps the open week when the card refreshes with new figures', () => {
    const env = open()
    bar('2026-10-05').click()
    env.changed()
    expect(bar('2026-10-05').getAttribute('aria-pressed')).toBe('true')
    expect(detail().hidden).toBe(false)
  })

  describe('Days · Weeks · Months', () => {
    beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 9, 14, 12)) })
    afterEach(() => { vi.useRealTimers() })
    const full: ReadingLoad = {
      ...reading,
      weeks: [
        { ...reading.weeks![0], days: [0, 0, 1800, 0, 0, 0, 0] },
        { ...reading.weeks![1], days: [0, 1200, 1500, 120, 30, 0, 1800] },
        { ...reading.weeks![2], days: [0, 900, 0, 0, 0, 0, 0] },
      ],
      days: [
        { day: '2026-09-30', books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 1800 }] },
        { day: '2026-10-07', books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 1200 }, { bookId: 'private', title: 'A private book', seconds: 300 }] },
        { day: '2026-10-13', books: [{ bookId: 'odyssey', title: 'The Odyssey', seconds: 900 }] },
      ],
      months: [
        { start: '2026-09', seconds: 1800, books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 1800 }] },
        { start: '2026-10', seconds: 5100, books: [{ bookId: 'frankenstein', title: 'Frankenstein', seconds: 3000 }, { bookId: 'odyssey', title: 'The Odyssey', seconds: 2100 }] },
      ],
    }
    const views = () => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="reading-view"] button')]
    const total = () => document.querySelector('[data-testid="reading-total"]')?.textContent
    const view = (name: string) => views().find(button => button.textContent === name)!.click()

    it('opens on Days: this week’s seven days, today dark, the days to come empty', () => {
      open(full)
      expect(views().map(button => [button.textContent, button.getAttribute('aria-checked')])).toEqual([['Days', 'true'], ['Weeks', 'false'], ['Months', 'false']])
      expect(bars().map(button => button.dataset.week)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'])
      expect(bars().map(button => button.className)).toEqual(['', '', 'is-today', '', '', '', ''])
      expect(bars().slice(3).every(button => button.disabled && !button.querySelector('i'))).toBe(true)
      expect(bars()[1].getAttribute('aria-label')).toBe('Tue 13 Oct, 15 m')
      expect([...document.querySelectorAll('[data-testid="reading-day-values"] span')].map(node => node.textContent)).toEqual(['–', '15 m', '–', '', '', '', ''])
      expect(total()).toBe('15m')
      expect(document.querySelector('.tc-weeknav span')?.textContent).toBe('This week')
      expect(detail().hidden).toBe(true)
    })

    it('a tapped day shows its books; ‹ steps back a week', () => {
      open(full)
      bars()[1].click()
      expect([...detail().querySelectorAll('.tc-r')].map(line => [line.querySelector('.tc-lt')?.textContent, line.querySelector('.tc-v')?.textContent])).toEqual([['Tue 13 Oct', '15 m'], ['The Odyssey', '15 m']])
      document.querySelector<HTMLButtonElement>('[aria-label="Previous week"]')!.click()
      expect(detail().hidden).toBe(true)
      expect(document.querySelector('.tc-weeknav span')?.textContent).toBe('5–11 Oct')
      expect(total()).toBe('1h17m')
      expect(bars().every(button => !button.disabled)).toBe(true)
      bars()[2].click()
      expect([...detail().querySelectorAll('.tc-lt')].map(node => node.textContent)).toEqual(['Wed 7 Oct', 'Frankenstein', 'A private book'])
      expect(document.querySelector<HTMLButtonElement>('[aria-label="Next week"]')!.disabled).toBe(false)
    })

    it('Weeks shows the weekly bars and a week’s books, without a day strip', () => {
      open(full)
      view('Weeks')
      expect(bars().map(button => button.dataset.week)).toEqual(['2026-09-28', '2026-10-05', '2026-10-12'])
      bar('2026-10-05').click()
      expect([...detail().querySelectorAll('.tc-lt')].map(node => node.textContent)).toEqual(['5–11 Oct', 'Frankenstein', 'The Odyssey'])
      expect(detail().querySelector('[data-testid="reading-days"]')).toBeNull()
    })

    it('Months shows every month since the first, all-time total, and a month’s books', () => {
      open(full)
      view('Months')
      expect(bars().map(button => button.dataset.week)).toEqual(['2026-09', '2026-10'])
      expect(total()).toBe(readingFigures(stats).total.flat().join(''))
      bar('2026-10').click()
      expect([...detail().querySelectorAll('.tc-r')].map(line => [line.querySelector('.tc-lt')?.textContent, line.querySelector('.tc-v')?.textContent])).toEqual([['October 2026', '1 h 25'], ['Frankenstein', '50 m'], ['The Odyssey', '35 m']])
    })
  })

  it('a cache from before the breakdown still opens the week’s dates and total', () => {
    open({ ...reading, weeks: undefined })
    bar('2026-09-28').click()
    expect([...detail().querySelectorAll('.tc-r')].map(line => line.textContent)).toEqual(['28 Sep – 4 Oct30 m'])
  })

  it('a cache from before the day figures shows Weeks only, with no Days · Weeks · Months control', () => {
    open()
    expect(document.querySelector('[data-testid="reading-view"]')).toBeNull()
    bar('2026-10-05').click()
    expect([...detail().querySelectorAll('.tc-r')].length).toBe(3)
  })
})
