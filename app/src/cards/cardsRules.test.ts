import { describe, expect, it } from 'vitest'
import { boardHiddenLine, chapterFraction, followBackCount, followButton, leaderboardAllowed, privacyChange, readerCardView, relationAfter } from './cardsRules'
import { dayMonth, dayMonthShort, durationLong, durationShort, figureParts, finishedValue, ordinal, rankOf, shortEmail, weekHeights, chartWeeks, dayMonthShortDate } from './cardsFormat'
import { accountPageRedirect, cardUrl, isCardName } from './cardRoutes'
import type { ProfilePageData } from './cardsApi'
import { hasFriends } from './boardMemory'
import { CARDS_COPY } from './cardsCopy'

const privacy = { visibility: 'friends' as const, showReading: true, showTime: true, onLeaderboard: true }

describe('Settings rules', () => {
  it('allows the leaderboard only while others can see you and your time shows', () => {
    expect(leaderboardAllowed({ visibility: 'friends', showTime: true })).toBe(true)
    expect(leaderboardAllowed({ visibility: 'everyone', showTime: true })).toBe(true)
    expect(leaderboardAllowed({ visibility: 'only_me', showTime: true })).toBe(false)
    expect(leaderboardAllowed({ visibility: 'friends', showTime: false })).toBe(false)
  })

  it('takes the reader off the board, in the same post, when Only me is chosen', () => {
    expect(privacyChange(privacy, { visibility: 'only_me' })).toEqual({
      next: { ...privacy, visibility: 'only_me', onLeaderboard: false },
      patch: { visibility: 'only_me', onLeaderboard: false },
    })
  })

  it('takes the reader off the board when reading time stops showing', () => {
    expect(privacyChange(privacy, { showTime: false }).patch).toEqual({ showTime: false, onLeaderboard: false })
  })

  it('posts nothing for the disabled switch', () => {
    const hidden = { ...privacy, visibility: 'only_me' as const, onLeaderboard: false }
    expect(privacyChange(hidden, { onLeaderboard: true })).toEqual({ next: hidden, patch: {} })
  })

  it('posts a plain change as it is', () => {
    expect(privacyChange(privacy, { visibility: 'everyone' }).patch).toEqual({ visibility: 'everyone' })
    expect(privacyChange(privacy, { onLeaderboard: false }).patch).toEqual({ onLeaderboard: false })
  })
})

describe('follow buttons (the Friends page words)', () => {
  it('outlines a state and fills an action', () => {
    expect(followButton('friend')).toEqual({ label: 'Friends', style: 'line', action: 'unfollow' })
    // A one-way follow is a request until followed back (changed on request, 19 Oct 2026: was Following).
    expect(followButton('follower')).toEqual({ label: 'Requested', style: 'line', action: 'unfollow' })
    expect(followButton('followed')).toEqual({ label: 'Follow back', style: 'fill', action: 'follow' })
    expect(followButton('stranger')).toEqual({ label: 'Follow', style: 'fill', action: 'follow' })
    expect(followButton('self')).toBeNull()
  })

  it('shows the next relation while the answer is on its way', () => {
    expect(relationAfter('followed', true)).toBe('friend')
    expect(relationAfter('stranger', true)).toBe('follower')
    expect(relationAfter('friend', false)).toBe('followed')
    expect(relationAfter('follower', false)).toBe('stranger')
  })

  it('badges Find readers with the readers who follow you whom you do not follow back', () => {
    expect(followBackCount([{ relation: 'followed' }, { relation: 'friend' }, { relation: 'followed' }, { relation: 'stranger' }])).toBe(2)
  })
})

describe('a reader\'s profile card', () => {
  const data: ProfilePageData = {
    handle: 'maja', name: 'Maja Holm', link: 'tinct.app/@maja', picture: { src: null, pos: '', cover: false, private: false, initial: 'M' },
    banner: { src: '/x.jpg', private: false }, relation: 'friend', followsYou: true, limited: false,
    time: { last7: '4 h 50 m', year: '96 h' },
    readingNow: [{ bookId: 'odyssey', title: 'The Odyssey', cover: null, progress: 'Ch. 5 of 24', hours: '4 h' }],
    finished: [{ bookId: 'emma', title: 'Emma', cover: null, progress: null, hours: null }],
  }

  it('shows the three facts and the books as far as the reader shares them', () => {
    const view = readerCardView(data)
    expect(view.limited).toBe(false)
    expect(view.facts).toEqual([{ value: '4 h 50 m', label: 'last 7 days' }, { value: '96 h', label: 'this year' }, { value: '1', label: 'finished' }])
    expect(view.readingNow).toHaveLength(1)
  })

  it('leaves out what is not shared', () => {
    const view = readerCardView({ ...data, time: null, readingNow: null, finished: null })
    expect(view).toEqual({ limited: false, facts: [], readingNow: null, finished: null })
  })

  it('is the header only for a profile the viewer may not see in full', () => {
    expect(readerCardView({ ...data, limited: true })).toEqual({ limited: true, facts: [], readingNow: null, finished: null })
  })

  it('draws the progress line from the chapter, never inventing a percentage', () => {
    expect(chapterFraction('Ch. 5 of 24')).toBeCloseTo(5 / 24)
    expect(chapterFraction(null)).toBeNull()
    expect(chapterFraction('4 h 10 m')).toBeNull()
  })
})

describe('numbers, as cards.html writes them', () => {
  it('formats durations', () => {
    expect(durationLong(6 * 3600 + 600)).toBe('6 h 10 m')
    expect(durationShort(6 * 3600 + 600)).toBe('6 h 10')
    expect(durationShort(3600 + 300)).toBe('1 h 05')
    expect(durationShort(96 * 3600)).toBe('96 h')
    expect(durationShort(45 * 60)).toBe('45 m')
    expect(figureParts(41 * 3600 + 20 * 60)).toEqual([['41', 'h'], ['20', 'm']])
    expect(figureParts(20 * 60)).toEqual([['20', 'm']])
  })

  it('ranks, dates and hides the address', () => {
    expect(rankOf(3, 5)).toBe('3rd of 5')
    expect(rankOf(null, 5)).toBeNull()
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd'])
    expect(dayMonth('2026-07-14')).toBe('14 July')
    expect(dayMonthShort('2026-11-05T12:00:00.000Z')).toBe('5 Nov')
    expect(finishedValue('2026-09-03', 5 * 3600 + 40 * 60)).toBe('Sep · 5 h 40')
    expect(finishedValue('2026-09-03', null)).toBe('Sep')
    expect(shortEmail('anders@example.com')).toBe('anders@…')
  })

  it('draws the busiest week full height and keeps a sliver for empty weeks', () => {
    expect(weekHeights([{ seconds: 0 }, { seconds: 50 }, { seconds: 100 }])).toEqual([4, 50, 100])
  })

  it('starts the week chart at the week of the first reading day, and always keeps this week', () => {
    const weeks = Array.from({ length: 12 }, (_, i) => ({ start: new Date(Date.UTC(2026, 6, 20 + i * 7)).toISOString().slice(0, 10), seconds: i }))
    // 20 Jul … 5 Oct; first read on Wednesday 9 Sep → the week of 7 Sep onward.
    expect(chartWeeks(weeks, '2026-09-09').map(w => w.start)).toEqual(['2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05'])
    expect(chartWeeks(weeks, '2026-09-07')[0].start).toBe('2026-09-07')
    expect(chartWeeks(weeks, '2026-10-08').map(w => w.start)).toEqual(['2026-10-05'])
    expect(chartWeeks(weeks, '2026-01-01')).toHaveLength(12)
    expect(chartWeeks(weeks, null)).toHaveLength(12)
    expect(dayMonthShortDate('2026-09-07')).toBe('7 Sep')
    expect(dayMonthShortDate('')).toBe('')
  })
})

describe('old links', () => {
  it('maps each old page to its card, over the library or the reader it named', () => {
    expect(accountPageRedirect('/you/', '')).toBe('/library?card=you')
    expect(accountPageRedirect('/you', '?view=handle')).toBe('/library?card=settings')
    expect(accountPageRedirect('/your-reading', '?return=%2Freader')).toBe('/reader?card=reading')
    expect(accountPageRedirect('/friends', '?tab=everyone')).toBe('/library?card=leaderboard')
    expect(cardUrl('find')).toBe('/library?card=find')
    expect(isCardName('settings')).toBe(true)
    expect(isCardName('picture')).toBe(false)
  })
})

describe('the leaderboard for a reader friends cannot see (19 Oct 2026)', () => {
  const own = { visibility: 'friends' as const, showTime: true, onLeaderboard: true }
  it('a line only when the reader’s own settings keep friends from seeing them', () => {
    expect(boardHiddenLine(true, own)).toBeNull()
    expect(boardHiddenLine(undefined, own)).toBeNull()
    expect(boardHiddenLine(false, null)).toBeNull()
    expect(boardHiddenLine(false, own)).toBeNull()
    expect(boardHiddenLine(false, { ...own, onLeaderboard: false })).toBe(CARDS_COPY.hiddenLeaderboard)
    expect(boardHiddenLine(false, { ...own, showTime: false, onLeaderboard: false })).toBe(CARDS_COPY.hiddenTime)
    expect(boardHiddenLine(false, { ...own, visibility: 'only_me', onLeaderboard: false })).toBe(CARDS_COPY.hiddenOnlyMe)
    for (const line of [CARDS_COPY.hiddenLeaderboard, CARDS_COPY.hiddenTime, CARDS_COPY.hiddenOnlyMe]) {
      expect(line).toMatch(/^Friends don’t see you here: /)
      expect(line).not.toMatch(/[A-Z]{3,}/)
    }
  })

  it('a mutual friend: from the count, or from a friend’s row when an older Worker sends none', () => {
    const board = (friends: number | undefined, others: number) => ({
      tab: 'friends' as const, window: { start: '', end: '' }, refreshedAt: null, total: others + 1, me: null, meShown: true, friends,
      entries: [{ rank: 1, name: 'You', picture: { src: null, pos: '', cover: false, private: false, initial: 'Y' }, seconds: 0, duration: '', me: true },
        ...Array.from({ length: others }, (_, i) => ({ rank: i + 2, name: `R${i}`, picture: { src: null, pos: '', cover: false, private: false, initial: 'R' }, seconds: 0, duration: '', me: false }))],
    })
    expect(hasFriends(null)).toBe(false)
    expect(hasFriends(board(0, 0))).toBe(false)
    expect(hasFriends(board(1, 0))).toBe(true)
    expect(hasFriends(board(undefined, 0))).toBe(false)
    expect(hasFriends(board(undefined, 1))).toBe(true)
  })
})
