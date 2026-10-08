import { describe, expect, it } from 'vitest'
import { EVERYONE_BOARD_MIN_READERS, amongFriendsLine, appearsOnBoard, everyoneBoardOpen, finishedCardLine, isInternalAccount, isReservedTestEmail, mutualFriends, parseFindQuery, rankOfLine, socialFriendsOn, type BoardCard } from './socialRules'
import { profileDocument, profileMainHtml, type ProfilePageData } from './profilePageView'

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

  it('the Everyone board opens at 10 real readers; unknown keeps it closed', () => {
    expect(EVERYONE_BOARD_MIN_READERS).toBe(10)
    expect(everyoneBoardOpen(0)).toBe(false)
    expect(everyoneBoardOpen(9)).toBe(false)
    expect(everyoneBoardOpen(10)).toBe(true)
    expect(everyoneBoardOpen(250)).toBe(true)
    expect(everyoneBoardOpen(null)).toBe(false)
  })

  it('internal and test accounts never appear on either board', () => {
    const viewer = { friends: new Set(['b']), blocked: new Set<string>() }
    expect(appearsOnBoard(card({ internal: true }), 'friends', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: true }), 'everyone', viewer)).toBe(false)
    expect(appearsOnBoard(card({ internal: false }), 'friends', viewer)).toBe(true)
    expect(appearsOnBoard(card({ internal: false }), 'everyone', viewer)).toBe(true)
  })

  it('internal accounts: the device flag or a reserved test address', () => {
    for (const email of ['qa-1@example.com', 'QA-Reader@Example.COM', 'x@mail.example.org', 'a@b.test', 'a@b.invalid', 'a@host.localhost']) {
      expect(isReservedTestEmail(email), email).toBe(true)
    }
    for (const email of ['anders@fastmail.com', 'reader@gmail.com', 'me@example.com.au', 'me@notexample.com', 'me@testing.dk', '', null, undefined]) {
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
    banner: { src: '/lab/library_2/assets/scene-meditations-phone.jpg', private: false },
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

  it('a signed-out visitor is asked to sign in to follow or report; a Friends card shows no reading', () => {
    expect(profileMainHtml(data)).toContain('/sign-in?returnTo=%2F%40bea')
    const limited = profileMainHtml({ ...data, limited: true, relation: 'stranger' })
    expect(limited).toContain('data-testid="profile-limited"')
    expect(limited).not.toContain('4 h 50 m')
    expect(limited).toContain('data-action="follow"')
    expect(profileMainHtml({ ...data, relation: 'self' })).not.toContain('Report')
  })
})
