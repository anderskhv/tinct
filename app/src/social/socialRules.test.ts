import { describe, expect, it } from 'vitest'
import { EVERYONE_BOARD_MIN_READERS, amongFriendsLine, appearsOnBoard, everyoneBoardOpen, finishedCardLine, isInternalAccount, isReservedTestEmail, mutualFriends, offEveryone, parseFindQuery, rankOfLine, socialFriendsOn, weekSeconds, weekSinceDay, type BoardCard } from './socialRules'
import { readingTimeStats } from '../readingTime/model'
import { followButtonHtml, profileBlockedHtml, profileDocument, profileMainHtml, profileMissingHtml, type ProfilePageData } from './profilePageView'

const card = (over: Partial<BoardCard> = {}): BoardCard => ({
  id: 'b', handle: 'bea', display_name: 'Bea', picture_kind: 'initial', picture_value: null,
  visibility: 'everyone', show_reading: true, show_time: true, on_leaderboard: true, ...over,
})

describe('socialRules', () => {
  it('ship 3 needs both switches', () => {
    expect(socialFriendsOn({ SOCIAL_FRIENDS: '1', SOCIAL_PROFILES: '1' })).toBe(true)
    expect(socialFriendsOn({ SOCIAL_FRIENDS: '1' })).toBe(false)
    expect(socialFriendsOn({ SOCIAL_PROFILES: '1' })).toBe(false)
  })

  it('who appears on which board', () => {
    const viewer = { friends: new Set(['b']), blocked: new Set<string>() }
    expect(appearsOnBoard(card(), 'everyone', viewer)).toBe(true)
    expect(appearsOnBoard(card(), 'friends', viewer)).toBe(true)
    expect(appearsOnBoard(card({ visibility: 'friends' }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ visibility: 'friends' }), 'friends', viewer)).toBe(true)
    expect(appearsOnBoard(card({ on_leaderboard: false }), 'friends', viewer)).toBe(false)
    expect(appearsOnBoard(card({ show_time: false }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ visibility: 'only_me' }), 'friends', viewer)).toBe(false)
    expect(appearsOnBoard(card(), 'friends', { friends: new Set(), blocked: new Set() })).toBe(false)
    expect(appearsOnBoard(card(), 'everyone', { friends: new Set(['b']), blocked: new Set(['b']) })).toBe(false)
  })

  it('the Everyone board opens at 1 real reader; unknown keeps it closed', () => {
    expect(EVERYONE_BOARD_MIN_READERS).toBe(1)
    expect(everyoneBoardOpen(0)).toBe(false)
    expect(everyoneBoardOpen(1)).toBe(true)
    expect(everyoneBoardOpen(10)).toBe(true)
    expect(everyoneBoardOpen(250)).toBe(true)
    expect(everyoneBoardOpen(null)).toBe(false)
  })

  it('internal readers appear on Everyone once known not to be test accounts (20 Oct 2026); mutual friends see them on Friends (19 Oct 2026)', () => {
    const viewer = { friends: new Set(['b']), blocked: new Set<string>() }
    expect(appearsOnBoard(card({ internal: true }), 'friends', viewer)).toBe(true)
    // Not looked up (or the lookup failed): kept off Everyone.
    expect(appearsOnBoard(card({ internal: true }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: true, test: false }), 'everyone', viewer)).toBe(true)
    expect(appearsOnBoard(card({ internal: true, test: true }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: true, test: true }), 'friends', viewer)).toBe(true)
    expect(appearsOnBoard(card({ internal: true, test: false, visibility: 'friends' }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: true, test: false, on_leaderboard: false }), 'everyone', viewer)).toBe(false)
    expect(offEveryone({})).toBe(false)
    expect(offEveryone({ internal: false })).toBe(false)
    expect(offEveryone({ test: true })).toBe(true)
    // Not a friend: still not on Friends; blocked or off the leaderboard: on neither.
    expect(appearsOnBoard(card({ internal: true }), 'friends', { friends: new Set<string>(), blocked: new Set<string>() })).toBe(false)
    expect(appearsOnBoard(card({ internal: true }), 'friends', { friends: new Set(['b']), blocked: new Set(['b']) })).toBe(false)
    expect(appearsOnBoard(card({ internal: true, on_leaderboard: false }), 'friends', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: false }), 'friends', viewer)).toBe(true)
    expect(appearsOnBoard(card({ internal: false }), 'everyone', viewer)).toBe(true)
  })

  it('the board\'s live 7 days are Your reading\'s (readingTimeStats): the reader\'s today and six before, or ending tomorrow once there is time there', () => {
    const row = (user_id: string, day: string, read: number, book_id = 'frankenstein', listen = 0) => ({ user_id, day, book_id, read_seconds: read, listen_seconds: listen })
    const rows = [
      row('a', '2026-10-14', 600, 'frankenstein', 60), row('a', '2026-10-08', 300), row('a', '2026-10-07', 9000), row('a', '2026-10-13', 99999, '_earlier'),
      row('b', '2026-10-15', 120), row('b', '2026-10-08', 500), row('b', '2026-10-09', 30),
      row('c', '2026-10-07', 400), row('c', '2026-10-13', 20),
      row('d', '2026-10-01', 400),
    ]
    const today = '2026-10-14'
    const seconds = weekSeconds(rows, id => (id === 'c' ? '2026-10-13' : today))
    expect(seconds.get('a')).toBe(600 + 60 + 300)
    // Time on tomorrow ends Bea's window there: 10-08 has left it.
    expect(seconds.get('b')).toBe(120 + 30)
    // A viewer a day behind UTC counts their own seven days.
    expect(seconds.get('c')).toBe(400 + 20)
    expect(seconds.has('d')).toBe(false)
    for (const id of ['a', 'b', 'c']) {
      const ledger = rows.filter(r => r.user_id === id).map(r => ({ day: r.day, bookId: r.book_id, read: r.read_seconds, listen: r.listen_seconds }))
      expect(seconds.get(id), id).toBe(readingTimeStats(ledger, id === 'c' ? '2026-10-13' : today).last7Seconds)
    }
    expect(weekSinceDay(Date.parse('2026-10-14T23:59:00Z'))).toBe('2026-10-07')
  })

  it('internal accounts: the device flag or a reserved test address', () => {
    for (const email of ['qa-soc-a-1@test.tinct.app', 'QA@Test.Tinct.App', 'qa-1@example.com', 'QA-Reader@Example.COM', 'x@mail.example.org', 'a@b.test', 'a@b.invalid', 'a@host.localhost']) {
      expect(isReservedTestEmail(email), email).toBe(true)
    }
    for (const email of ['anders@fastmail.com', 'reader@gmail.com', 'me@example.com.au', 'me@notexample.com', 'anders@tinct.app', 'a@nottest.tinct.app', 'a@test.tinct.app.evil.com', 'me@testing.dk', '', null, undefined]) {
      expect(isReservedTestEmail(email), String(email)).toBe(false)
    }
    expect(isInternalAccount('reader@gmail.com', '1')).toBe(true)
    expect(isInternalAccount('qa-2@example.com', null)).toBe(true)
    expect(isInternalAccount('reader@gmail.com', null)).toBe(false)
    expect(isInternalAccount('reader@gmail.com', '0')).toBe(false)
  })

  it('friends are mutual follows', () => {
    expect([...mutualFriends(['a', 'b', 'c'], ['b', 'c', 'd'])]).toEqual(['b', 'c'])
  })

  it('rank lines', () => {
    expect(amongFriendsLine(3, 6)).toBe('#3 among friends')
    expect(amongFriendsLine(1, 1)).toBeNull()
    expect(amongFriendsLine(null, 4)).toBeNull()
    expect(rankOfLine(3, 6)).toBe('#3 of 6 this week')
  })

  it('Find reads a profile link or a name', () => {
    expect(parseFindQuery('https://tinct.app/@Anders')).toEqual({ kind: 'handle', handle: 'anders' })
    expect(parseFindQuery('tinct.app/@maja.holm/')).toEqual({ kind: 'handle', handle: 'maja.holm' })
    expect(parseFindQuery('@ellen_r')).toEqual({ kind: 'handle', handle: 'ellen_r' })
    expect(parseFindQuery('  Maja  Holm ')).toEqual({ kind: 'name', text: 'Maja Holm' })
    expect(parseFindQuery('Søren*,()')).toEqual({ kind: 'name', text: 'Søren' })
    expect(parseFindQuery('a')).toBeNull()
  })

  it('the reading card line', () => {
    expect(finishedCardLine('Frankenstein', '6 h 20 m')).toBe('Finished Frankenstein · 6 h 20 m')
    expect(finishedCardLine('Frankenstein', null)).toBe('Finished Frankenstein')
  })
})

describe('the profile page HTML', () => {
  const data: ProfilePageData = {
    handle: 'bea', name: 'Bea <script>alert(1)</script>', link: 'tinct.app/@bea',
    picture: { src: '/lab/library_2/assets/meditations.jpg', pos: '50% 34%', cover: true, private: false, initial: 'B' },
    banner: { src: '/lab/library_2/assets/room-meditations-phone.jpg', private: false },
    relation: null, followsYou: false, limited: false,
    time: { last7: '4 h 50 m', year: '96 h' },
    readingNow: [{ bookId: 'frankenstein', title: 'Frankenstein', cover: null, progress: 'Ch. 9 of 24', hours: '2 h' }],
    finished: [],
  }

  it('escapes what readers type and never carries a script of its own inline', () => {
    const html = profileDocument(data, { handle: 'bea', loading: false })
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('Bea &lt;script&gt;')
    expect(html.match(/<script(?![^>]*src=)/g)).toBeNull()
    expect(html).toContain('noindex')
  })

  it('a signed-out visitor is asked to sign in to follow or report; the follower view shows no reading', () => {
    expect(profileMainHtml(data)).toContain('/sign-in?returnTo=%2F%40bea')
    const limited = profileMainHtml({ ...data, limited: true, relation: 'followed', followsYou: true })
    expect(limited).not.toContain('4 h 50 m')
    expect(limited).not.toContain('Reading now')
    expect(limited).not.toContain('shares their reading')
    expect(limited).toContain('Follow back')
    expect(limited).toContain('data-action="remove-follower"')
    expect(limited).toContain('data-action="block"')
    expect(profileMainHtml({ ...data, relation: 'self' })).not.toContain('Report')
  })

  it('a blocked reader\'s page offers Unblock and never sends the reader to Settings for it', () => {
    const html = profileBlockedHtml()
    expect(html).toContain('data-action="unblock"')
    expect(html).toContain('>Unblock<')
    expect(html).not.toMatch(/Settings/)
  })

  it('the page nobody may see is the same for every handle; with a link it offers Follow', () => {
    expect(profileMissingHtml()).not.toContain('profile-follow')
    const withFollow = profileMissingHtml(followButtonHtml({ relation: null, handle: 'bea' }))
    expect(withFollow).toContain('No profile here')
    expect(withFollow).toContain('/sign-in?returnTo=%2F%40bea')
    // A one-way follow is a request until followed back (changed on request, 19 Oct 2026: was Following).
    expect(profileMissingHtml(followButtonHtml({ relation: 'follower', handle: 'bea' }))).toContain('>Requested</button>')
  })
})
