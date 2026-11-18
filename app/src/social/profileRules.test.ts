import { describe, expect, it } from 'vitest'
import {
  cleanDisplayName,
  effectiveVisibility,
  handleBase,
  handleFromPath,
  handleProblem,
  isHandleFrom,
  legacyEmailDerived,
  neutralHandleBase,
  passesWordFilter,
  pictureForBook,
  profileLinkText,
  publicProfileView,
  relationOf,
  suggestedName,
  uniqueHandle,
  type ProfileCard,
  type Relation,
  type Visibility,
} from './profileRules'
import { humanPrimaryEditionKey, newBookPrimaryEditionKey } from '../data/editionDefaults'
import { GENERATED_BOOK_META } from '../data/bookMetaGenerated'

describe('handle rules', () => {
  it('accepts 3–20 letters, digits, _ or .', () => {
    for (const ok of ['ann', 'anders', 'a.b_c', 'reader2026', 'x'.repeat(20), 'Anders', '@anders']) expect(handleProblem(ok)).toBeNull()
  })

  it('rejects the wrong length or characters', () => {
    for (const bad of ['ab', 'x'.repeat(21), 'an ders', 'anders!', 'æble', 'an-ders', '...', '___', '']) expect(handleProblem(bad)).toBe('format')
  })

  it('blocks reserved words, routes and anything posing as Tinct', () => {
    for (const reserved of ['library', 'reader', 'sign-in'.replace('-', ''), 'admin', 'you', 'privacy', 'terms', 'api', 'tinct', 'tinct.support', 'the.admin', 'official.anders']) {
      expect(handleProblem(reserved)).toBe('reserved')
    }
  })

  it('blocks every book id when one is passed (so a handle never reads as a book)', () => {
    const ids = Object.keys(GENERATED_BOOK_META).filter(id => /^[a-z0-9_.]{3,20}$/.test(id))
    expect(ids.length).toBeGreaterThan(5)
    for (const id of ids) expect(handleProblem(id, ids)).toBe('reserved')
  })

  it('filters offensive words in handles and names, without catching ordinary ones', () => {
    expect(handleProblem('fuckface')).toBe('filtered')
    expect(handleProblem('f.u.c.k.er')).toBe('filtered')
    expect(handleProblem('sh1thead')).toBe('filtered')
    expect(passesWordFilter('Scunthorpe Reader')).toBe(true)
    expect(passesWordFilter('Dick Van Dyke')).toBe(false)
    expect(passesWordFilter('the therapist')).toBe(true)
    expect(passesWordFilter('Classic Sussex')).toBe(true)
    expect(cleanDisplayName('Anna  Karenina ')).toBe('Anna Karenina')
    expect(cleanDisplayName('')).toBeNull()
    expect(cleanDisplayName('x'.repeat(41))).toBeNull()
    expect(cleanDisplayName('<script>Ann')).toBe('scriptAnn')
  })

  it('suggests a handle from a name or an email local part, unique against taken handles', () => {
    expect(handleBase('Anders Hvelplund')).toBe('anders.hvelplund')
    expect(handleBase('Søren Kierkegaard')).toBe('soren.kierkegaard')
    expect(handleBase('jo')).toBe('joreader')
    expect(handleBase('a.very.long.name.that.overflows')).toBe('a.very.long.name.tha')
    expect(uniqueHandle('anders', new Set())).toBe('anders')
    expect(uniqueHandle('anders', new Set(['anders', 'anders2']))).toBe('anders3')
    expect(uniqueHandle('library', new Set())).toBe('library2')
    expect(uniqueHandle('x'.repeat(20), new Set(['x'.repeat(20)]))).toBe('x'.repeat(19) + '2')
    const crowded = new Set(['anders', ...Array.from({ length: 30 }, (_, i) => `anders${i + 2}`)])
    const fallback = uniqueHandle('anders', crowded, [], () => 0.5)
    expect(crowded.has(fallback)).toBe(false)
    expect(handleProblem(fallback)).toBeNull()
  })

  it('prefills the name from the account (Google), else a neutral name; never from the email', () => {
    expect(suggestedName('Anders Hvelplund')).toBe('Anders Hvelplund')
    expect(suggestedName(undefined)).toBe('Reader')
    expect(suggestedName('   ')).toBe('Reader')
    // Anders, 9 Oct 2026: the email is never a source, even when it is passed along.
    expect((suggestedName as (name: unknown, email?: unknown) => string)(undefined, 'mary.shelley42@example.com')).toBe('Reader')
  })

  it('neutral links, automatic-link recognition and the old email-made values', () => {
    expect(neutralHandleBase(() => 0.42)).toBe('reader4780')
    expect(handleProblem(neutralHandleBase(() => 0.999))).toBeNull()
    expect(isHandleFrom('anders', 'anders')).toBe(true)
    expect(isHandleFrom('anders3', 'anders')).toBe(true)
    expect(isHandleFrom('x'.repeat(19) + '2', 'x'.repeat(20))).toBe(true)
    expect(isHandleFrom('reader4780', 'reader')).toBe(true)
    expect(isHandleFrom('anders.reads', 'anders')).toBe(false)
    expect(isHandleFrom('q.reads', 'reader')).toBe(false)
    expect(legacyEmailDerived('qa-ux-desk+a9cs927@example.com')).toEqual({ name: 'Qa Ux Desk A Cs', handleBases: ['qauxdeska9cs927', 'qa.ux.desk.a.cs'] })
    expect(legacyEmailDerived('123@example.com')).toEqual({ name: null, handleBases: ['123'] })
    expect(legacyEmailDerived(null)).toEqual({ name: null, handleBases: [] })
  })
})

describe('profile links: tinct.app/@handle', () => {
  it('only /@handle is a profile; every book route stays a book route', () => {
    expect(profileLinkText('Anders')).toBe('tinct.app/@anders')
    expect(handleFromPath('/@anders')).toBe('anders')
    expect(handleFromPath('/@Anders/')).toBe('anders')
    for (const path of ['/anders', '/read/odyssey', '/odyssey', '/library', '/reader', '/@a', '/@anders/odyssey', '/read/@anders']) {
      expect(handleFromPath(path)).toBeNull()
    }
    for (const id of Object.keys(GENERATED_BOOK_META)) {
      expect(handleFromPath(`/${id}`)).toBeNull()
      expect(handleFromPath(`/read/${id}`)).toBeNull()
    }
  })
})

describe('who sees what', () => {
  const card = (visibility: Visibility, extra: Partial<ProfileCard> = {}): ProfileCard => ({
    handle: 'anders', displayName: 'Anders',
    pictureKind: 'set', pictureValue: 'stoic', pictureReview: 'none',
    backgroundKind: 'set', backgroundValue: 'stoic', backgroundReview: 'none',
    visibility, emailConfirmed: true,
    showReading: true, showTime: true, onLeaderboard: true,
    ...extra,
  })
  const viewers: Relation[] = ['stranger', 'follower', 'friend']

  it('relations: friends are mutual follows; a block hides both ways', () => {
    expect(relationOf({ self: false, viewerFollowsOwner: true, ownerFollowsViewer: true, blocked: false })).toBe('friend')
    expect(relationOf({ self: false, viewerFollowsOwner: true, ownerFollowsViewer: false, blocked: false })).toBe('follower')
    expect(relationOf({ self: false, viewerFollowsOwner: false, ownerFollowsViewer: false, blocked: false })).toBe('stranger')
    expect(relationOf({ self: false, viewerFollowsOwner: true, ownerFollowsViewer: true, blocked: true })).toBe('blocked')
    expect(publicProfileView(card('everyone'), 'blocked')).toBeNull()
  })

  const followerView = { handle: 'anders', name: 'Anders', picture: { kind: 'initial', value: null }, background: null, limited: true, shows: { reading: false, time: false, leaderboard: false } }

  it('Only me: nobody but the owner sees anything', () => {
    for (const viewer of ['stranger', 'follower'] as const) expect(publicProfileView(card('only_me'), viewer)).toBeNull()
    expect(publicProfileView(card('only_me'), 'self')?.limited).toBe(false)
  })

  // Changed on request (Anders, 19 Oct 2026): Friends profiles are findable by name and picture;
  // reading stays with accepted friends. Before, a stranger or one-way follower saw nothing.
  it('Friends: friends see the profile; any other signed-in reader sees name and picture only; signed out, nothing', () => {
    const friend = publicProfileView(card('friends'), 'friend')!
    expect(friend.limited).toBe(false)
    expect(friend.shows).toEqual({ reading: true, time: true, leaderboard: true })
    const headerOnly = { handle: 'anders', name: 'Anders', picture: { kind: 'set', value: 'stoic' }, background: null, limited: true, shows: { reading: false, time: false, leaderboard: false } }
    // A one-way follower (a request not yet accepted) and a signed-in stranger: no reading, time, board or banner.
    expect(publicProfileView(card('friends'), 'follower')).toEqual(headerOnly)
    expect(publicProfileView(card('friends'), 'stranger', { signedIn: true })).toEqual(headerOnly)
    expect(publicProfileView(card('friends'), 'followed')).toEqual(headerOnly)
    // Signed out (the stranger default): Not found, as for Only me.
    expect(publicProfileView(card('friends'), 'stranger')).toBeNull()
    expect(publicProfileView(card('friends'), 'stranger', { signedIn: false })).toBeNull()
  })

  it('an Only me reader who follows you shows to you by name and link with the initial, so you can remove or block them', () => {
    expect(publicProfileView(card('only_me'), 'followed')).toEqual(followerView)
    // Following them back does not open an Only me profile: still only the follower view.
    expect(publicProfileView(card('only_me'), 'friend')).toEqual(followerView)
    // Not even an approved photo shows in an Only me follower view.
    expect(publicProfileView(card('only_me', { pictureKind: 'upload', pictureValue: 'abc123', pictureReview: 'approved' }), 'followed')!.picture).toEqual({ kind: 'initial', value: null })
    // A Friends follower is findable anyway: name and picture (19 Oct 2026; it was the initial before).
    expect(publicProfileView(card('friends', { pictureKind: 'upload', pictureValue: 'abc123', pictureReview: 'approved' }), 'followed')!.picture).toEqual({ kind: 'upload', value: 'abc123' })
    expect(publicProfileView(card('only_me'), 'blocked')).toBeNull()
    // Only me is never findable: a signed-in stranger or one-way follower gets nothing.
    expect(publicProfileView(card('only_me'), 'stranger', { signedIn: true })).toBeNull()
    expect(publicProfileView(card('only_me'), 'follower')).toBeNull()
  })

  it('Everyone: every viewer sees the profile, as far as the switches allow', () => {
    for (const viewer of viewers) {
      expect(publicProfileView(card('everyone'), viewer)!.limited).toBe(false)
      expect(publicProfileView(card('everyone', { showReading: false }), viewer)!.shows.reading).toBe(false)
      expect(publicProfileView(card('everyone', { showTime: false }), viewer)!.shows.time).toBe(false)
      expect(publicProfileView(card('everyone', { onLeaderboard: false }), viewer)!.shows.leaderboard).toBe(false)
    }
    // Switches bind friends too; the owner always sees their own.
    expect(publicProfileView(card('friends', { showReading: false, showTime: false }), 'friend')!.shows).toEqual({ reading: false, time: false, leaderboard: true })
    expect(publicProfileView(card('friends', { showReading: false }), 'self')!.shows.reading).toBe(true)
  })

  it('Everyone is held at Friends until the email is confirmed', () => {
    expect(effectiveVisibility('everyone', false)).toBe('friends')
    expect(effectiveVisibility('everyone', true)).toBe('everyone')
    const waiting = card('everyone', { emailConfirmed: false })
    expect(publicProfileView(waiting, 'stranger')).toBeNull()
    // Held at Friends: a one-way follower sees name and picture only (findable, 19 Oct 2026).
    expect(publicProfileView(waiting, 'follower')!.limited).toBe(true)
    expect(publicProfileView(waiting, 'follower')!.shows).toEqual({ reading: false, time: false, leaderboard: false })
    expect(publicProfileView(waiting, 'friend')!.limited).toBe(false)
  })

  it('uploads and the Google photo show to others only once approved; the owner sees them at once', () => {
    for (const kind of ['upload', 'google'] as const) {
      const pending = card('everyone', { pictureKind: kind, pictureValue: 'abc123', pictureReview: 'pending', backgroundKind: 'upload', backgroundValue: 'def456', backgroundReview: 'pending' })
      expect(publicProfileView(pending, 'stranger')!.picture).toEqual({ kind: 'initial', value: null })
      expect(publicProfileView(pending, 'stranger')!.background).toEqual({ kind: 'library', value: null })
      expect(publicProfileView(pending, 'self')!.picture).toEqual({ kind, value: 'abc123' })
      const approved = { ...pending, pictureReview: 'approved' as const, backgroundReview: 'approved' as const }
      expect(publicProfileView(approved, 'stranger')!.picture).toEqual({ kind, value: 'abc123' })
    }
  })

  it('an existing account starts from the book it is reading', () => {
    expect(pictureForBook('meditations')).toEqual({ kind: 'set', value: 'stoic', background: { kind: 'set', value: 'stoic' } })
    expect(pictureForBook('frankenstein').kind).toBe('cover')
    expect(pictureForBook('unknown-book').kind).toBe('initial')
    expect(pictureForBook(null).kind).toBe('initial')
  })
})

describe('New books open in', () => {
  const english = [
    { key: 'modern-en', style: 'modern', language: 'en' },
    { key: 'original-en', style: 'original', language: 'en' },
  ] as never[]
  const translated = [
    { key: 'modern-en', style: 'modern', language: 'en' },
    { key: 'original-el', style: 'original', language: 'el' },
    { key: 'butler-en', style: 'translation', language: 'en' },
  ] as never[]
  const modernOnly = [{ key: 'modern-en', style: 'modern', language: 'en' }] as never[]

  it('Modern English keeps the approved default', () => {
    expect(newBookPrimaryEditionKey('pride-and-prejudice', english, 'modern')).toBe('modern-en')
    expect(newBookPrimaryEditionKey('pride-and-prejudice', english, null)).toBe('modern-en')
  })

  it('Human translations: books written in English open as written; others in a human translation', () => {
    expect(humanPrimaryEditionKey('pride-and-prejudice', english)).toBe('original-en')
    expect(humanPrimaryEditionKey('odyssey', translated)).toBe('butler-en')
  })

  it('a book with no human English edition keeps the default', () => {
    expect(humanPrimaryEditionKey('some-book', modernOnly)).toBe('modern-en')
  })
})
