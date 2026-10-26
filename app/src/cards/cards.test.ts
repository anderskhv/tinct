// @vitest-environment jsdom
/**
 * The account cards in the DOM (CARDS-BRIEF.md): open, push, back, close-all
 * over a page that is never touched; Settings posts at once and disables the
 * Leaderboard switch; Find readers and a reader's profile follow the friends
 * rules; and the brief's type rules hold (no monospace, no capitals-only).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import cardsCss from './cards.css?raw'
import { accountCardsOpen, closeAccountCards, openAccountCards } from './openCards'
import { CardStack } from './cardStack'
import { AVATAR_480_IDS, accountCard, forgetProfiles, leaderboardCard, settingsCard, smallAvatarSrc, youCard, type CardsEnv } from './cardViews'
import { CARDS_COPY } from './cardsCopy'
import { ACCOUNT_DELETE_CONFIRM, ACCOUNT_DELETE_PATH } from '../worker/routes/accountDelete'
import { dayMonthShort, readingFigures } from './cardsFormat'
import { allowanceView, billingPeriod } from '../worker/lib/aiAllowance'
import { CARDS_CACHE_PREFIX, readCardsCache, writeCardsCache } from './cardsCache'
import { wipeLabDeviceUserData } from '../lab/labSignOut'
import { forgetBoards } from './boardMemory'
import { readingTimeStats } from '../readingTime/model'
import { addPending, readPending, resetLedgerSends, resetReadingTimeSwitch } from '../lab/labReadingTime'
import { preparePhoto } from '../social/socialClient'
import { PHOTO_COPY } from '../social/photoFile'
import { resetFindableNoticeVisit } from '../social/findableNotice'

// The photo resize needs a real canvas; the cards' upload path is what is tested here.
vi.mock('../social/socialClient', async importOriginal => ({
  ...(await importOriginal<typeof import('../social/socialClient')>()),
  resizePhoto: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })),
  preparePhoto: vi.fn(async () => ({ ok: true as const, image: new Blob(['jpeg'], { type: 'image/jpeg' }) })),
}))

// The account's preferences row for the findable notice (the real read and commit are tested in social/findableNotice.test.ts).
const accountNotice = vi.hoisted(() => ({ seen: new Set<string>(), writes: [] as string[] }))
vi.mock('../social/findableNoticeAccount', async importOriginal => ({
  ...(await importOriginal<typeof import('../social/findableNoticeAccount')>()),
  readAccountNoticeSeen: vi.fn(async (userId: string) => accountNotice.seen.has(userId)),
  writeAccountNoticeSeen: vi.fn(async (userId: string) => { accountNotice.writes.push(userId); accountNotice.seen.add(userId); return true }),
}))

const session = { token: 'tok', userId: '11111111-1111-4111-8111-111111111111', email: 'anders@example.com', accountName: 'Anders' }

function ownProfile(overrides: Record<string, unknown> = {}) {
  return {
    handle: 'anders', link: 'tinct.app/@anders', name: 'Anders',
    picture: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    background: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    visibility: 'friends', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: true,
    newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, setUpBeforeFindable: true, emailConfirmed: true, emailOptIn: false, googlePhoto: false,
    ...overrides,
  }
}

const pic = (initial: string) => ({ src: null, pos: '', cover: false, private: false, initial })
const person = (handle: string, name: string, relation: string) => ({ handle, name, link: `tinct.app/@${handle}`, picture: pic(name[0]), relation, book: null })

let profile = ownProfile()
let posts: Array<{ url: string; body: Record<string, unknown> }> = []
let readerProfile: Record<string, unknown> | null = null
let searchResults: unknown[] = []
let blocked: Array<{ id: string; name: string; handle: string | null }> = []
let deleteAnswer: { status: number; body: Record<string, unknown> } = { status: 200, body: { ok: true, deleted: true } }
let readSeconds = 3600
let subscription: Record<string, unknown> = { subscription_status: 'active' }
/** Held until released: the profile answer (to see the first paint). */
let profileGate: Promise<void> | null = null
let uploads: Array<{ url: string; type: string | null }> = []
const FRIENDS_BOARD = { tab: 'friends', total: 5, meShown: true, me: null, entries: [{ rank: 3, name: 'Anders', picture: pic('A'), seconds: 3600, duration: '1 h', me: true }] }
/** The board answers by tab; null: 404 (Everyone closed). */
let boards: Record<'friends' | 'everyone', Record<string, unknown> | null> = { friends: FRIENDS_BOARD, everyone: null }
let boardCalls: string[] = []

function api() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) as Record<string, unknown> : null
    if (init?.method === 'POST' && body) posts.push({ url: url.replace(/\?.*$/, ''), body })
    if (url.startsWith('/api/profile/image') && init?.method === 'POST') {
      uploads.push({ url, type: new Headers(init?.headers).get('Content-Type') })
      const slot = new URL(url, 'https://tinct.app').searchParams.get('slot')
      if (slot === 'background') profile = { ...profile, background: { kind: 'upload', value: null, url: '/api/profile/image?user=u&slot=background&v=1', review: 'pending' } }
      else profile = { ...profile, picture: { kind: 'upload', value: null, url: '/api/profile/image?user=u&slot=picture&v=1', review: 'pending' } }
      return Response.json({ enabled: true, available: true, profile })
    }
    if (url.startsWith('/api/profile')) {
      if (profileGate && !body) await profileGate
      if (body) profile = { ...profile, ...body }
      return Response.json({ enabled: true, available: true, profile })
    }
    if (url.startsWith('/api/reading-time')) return Response.json({ enabled: true, rows: [{ day: today(), bookId: 'frankenstein', read: readSeconds, listen: 0 }] })
    if (url.startsWith('/api/social/rank')) return Response.json({ rank: 3, total: 5, seconds: 3600 })
    if (url.startsWith('/api/social/find?q=')) return Response.json({ results: searchResults })
    if (url.startsWith('/api/social/find')) return Response.json({ followingYou: [person('ellen', 'Ellen Ravn', 'followed')], alsoReading: [person('karl', 'Karl Ny', 'stranger')], link: 'tinct.app/@anders' })
    if (url.startsWith('/api/social/blocked')) return Response.json({ blocked })
    if (url.startsWith('/api/social/unblock')) {
      blocked = blocked.filter(reader => reader.id !== body?.id)
      readerProfile = { handle: 'karl', name: 'Karl Ny', link: 'tinct.app/@karl', picture: pic('K'), banner: { src: '/b.jpg', private: false }, relation: 'stranger', followsYou: false, limited: false, time: null, readingNow: null, finished: null }
      return Response.json({ ok: true })
    }
    if (url.startsWith('/api/social/follow')) return Response.json({ relation: 'friend', followsYou: true })
    if (url.startsWith('/api/social/remove-follower')) return Response.json({ ok: true, relation: 'stranger', followsYou: false })
    if (url.startsWith('/api/social/profile/')) return readerProfile ? Response.json({ profile: readerProfile }) : Response.json({ error: 'Not found' }, { status: 404 })
    if (url.startsWith('/api/social/board')) {
      const tab = new URL(url, 'https://tinct.app').searchParams.get('tab') === 'everyone' ? 'everyone' : 'friends'
      boardCalls.push(tab)
      const answer = boards[tab]
      return answer ? Response.json(answer) : Response.json({ error: 'Not found', everyoneOpen: false }, { status: 404 })
    }
    if (url.startsWith('/api/account/delete')) return Response.json(deleteAnswer.body, { status: deleteAnswer.status })
    if (url.startsWith('/api/subscription-info')) return Response.json(subscription)
    return Response.json({}, { status: 404 })
  })
}

function today(): string {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const flush = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setTimeout(resolve, 0)) }
const top = () => document.querySelector<HTMLElement>('.tc-card:not(.is-under)')!
const byTest = (id: string) => top().querySelector<HTMLElement>(`[data-testid="${id}"]`)
const click = (node: Element | null) => { expect(node).toBeTruthy(); (node as HTMLElement).click() }

beforeEach(() => {
  profile = ownProfile()
  posts = []
  readerProfile = null
  searchResults = []
  blocked = []
  deleteAnswer = { status: 200, body: { ok: true, deleted: true } }
  readSeconds = 3600
  subscription = { subscription_status: 'active' }
  profileGate = null
  uploads = []
  boards = { friends: FRIENDS_BOARD, everyone: null }
  boardCalls = []
  forgetBoards()
  localStorage.clear()
  accountNotice.seen.clear()
  accountNotice.writes = []
  resetFindableNoticeVisit()
  document.body.innerHTML = '<main id="page"><p id="place">Chapter 14, page 3</p></main>'
  vi.stubGlobal('fetch', api())
})
afterEach(() => {
  closeAccountCards()
  vi.unstubAllGlobals()
})

async function open(start?: 'you' | 'settings' | 'find' | 'reading' | 'leaderboard' | 'account', onClose?: () => void) {
  expect(await openAccountCards({ session, social: true, dark: false, start, onClose })).toBe(true)
  await flush()
}

describe('card navigation', () => {
  it('opens over the page, pushes a card per row, goes back one, and the cross closes all', async () => {
    const page = document.getElementById('page')!
    const href = location.href
    const history0 = history.length
    const onClose = vi.fn()
    await open('you', onClose)
    expect(accountCardsOpen()).toBe(true)
    expect(top().dataset.card).toBe('you')
    expect(byTest('you-reading')?.textContent).toContain('1 h')
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 5')
    click(byTest('you-settings'))
    expect(top().dataset.card).toBe('settings')
    click(byTest('settings-account'))
    expect(top().dataset.card).toBe('account')
    expect(document.querySelectorAll('.tc-card').length).toBe(3)
    click(byTest('card-back'))
    expect(top().dataset.card).toBe('settings')
    click(byTest('card-back'))
    expect(top().dataset.card).toBe('you')
    click(byTest('you-settings'))
    click(byTest('card-close'))
    expect(document.querySelector('.tcards')).toBeNull()
    expect(accountCardsOpen()).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
    // The page behind was never touched: same node, same place, no navigation.
    expect(document.getElementById('page')).toBe(page)
    expect(document.getElementById('place')?.textContent).toBe('Chapter 14, page 3')
    expect(location.href).toBe(href)
    expect(history.length).toBe(history0)
  })

  it('opens a named card on top of You, so back leads to You', async () => {
    await open('find')
    expect(top().dataset.card).toBe('find')
    click(byTest('card-back'))
    expect(top().dataset.card).toBe('you')
  })

  it('closes on Escape and on the scrim', async () => {
    await open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(document.querySelector('.tcards')).toBeNull()
    await open()
    click(document.querySelector('[data-testid="account-cards-scrim"]'))
    expect(document.querySelector('.tcards')).toBeNull()
  })

  it('shows no You card to a signed-out reader', async () => {
    expect(await openAccountCards({ dark: false })).toBe(false)
    expect(document.querySelector('.tcards')).toBeNull()
  })

  it('uses the dark greyscale over the library', async () => {
    expect(await openAccountCards({ session, social: true, dark: true })).toBe(true)
    expect(document.querySelector('.tcards')?.classList.contains('is-dark')).toBe(true)
  })
})

describe('Settings', () => {
  it('posts each change at once', async () => {
    await open('settings')
    click(byTest('settings-visibility')!.querySelector('[data-value="everyone"]'))
    await flush()
    expect(posts[posts.length - 1]).toEqual({ url: '/api/profile', body: { visibility: 'everyone', setUp: true } })
    click(byTest('settings-new-books')!.querySelector('[data-value="human"]'))
    await flush()
    expect(posts[posts.length - 1]).toEqual({ url: '/api/profile', body: { newBooksOpenIn: 'human' } })
    click(byTest('settings-show-reading'))
    await flush()
    expect(posts[posts.length - 1]).toEqual({ url: '/api/profile', body: { showReading: false } })
  })

  it('disables the Leaderboard switch while Only me, and takes the reader off the board', async () => {
    await open('settings')
    expect((byTest('settings-leaderboard') as HTMLButtonElement).disabled).toBe(false)
    click(byTest('settings-visibility')!.querySelector('[data-value="only_me"]'))
    // At once, before the answer.
    const sw = byTest('settings-leaderboard') as HTMLButtonElement
    expect(sw.disabled).toBe(true)
    expect(sw.getAttribute('aria-checked')).toBe('false')
    await flush()
    expect(posts[posts.length - 1]?.body).toEqual({ visibility: 'only_me', onLeaderboard: false, setUp: true })
    const before = posts.length
    click(byTest('settings-leaderboard'))
    await flush()
    expect(posts.length).toBe(before)
  })

  it('disables the Leaderboard switch while reading time is hidden', async () => {
    profile = ownProfile({ showTime: false, onLeaderboard: false })
    await open('settings')
    expect((byTest('settings-leaderboard') as HTMLButtonElement).disabled).toBe(true)
  })

  it('has no Reading-emails row and no confirm-email button', async () => {
    profile = ownProfile({ emailConfirmed: false, visibility: 'everyone', effectiveVisibility: 'friends' })
    await open('settings')
    expect(top().textContent).not.toMatch(/Reading emails|confirm/i)
    expect(top().querySelectorAll('.tc-r').length).toBeGreaterThan(5)
  })

  it('opens a dark box under an (i) and closes it on the next tap', async () => {
    await open('settings')
    click(byTest('info-leaderboard'))
    expect(top().querySelector('[data-testid="card-tip"]')?.textContent).toContain('You appear on the boards')
    await flush()
    // A tap anywhere (here, on the scrim): the tip closes and the tap does nothing else.
    const scrim = document.querySelector<HTMLElement>('[data-testid="account-cards-scrim"]')!
    scrim.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    scrim.click()
    expect(top().querySelector('[data-testid="card-tip"]')).toBeNull()
    expect(top().dataset.card).toBe('settings')
  })
})

describe('pull-down to close (phone)', () => {
  const touch = (target: Element, type: string, y: number, x = 100) => {
    const event = new Event(type, { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [{ clientY: y, clientX: x }] })
    target.dispatchEvent(event)
    return event
  }

  it('a downward drag anywhere on a card at its top pulls it down and closes it past 90px (Anders, iPhone, 10 Oct 2026)', async () => {
    const onClose = vi.fn()
    await open('you', onClose)
    const card = top()
    const row = byTest('you-reading')!
    touch(row, 'touchstart', 300)
    const move = touch(row, 'touchmove', 420)
    // The sheet follows the finger instead of the scroller rubber-banding.
    expect(move.defaultPrevented).toBe(true)
    expect(card.style.transform).toBe('translateY(120px)')
    touch(row, 'touchend', 420)
    await flush()
    expect(accountCardsOpen()).toBe(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('a short pull springs back; a sideways or upward start leaves the scroller alone', async () => {
    await open('you')
    const card = top()
    const row = byTest('you-reading')!
    touch(row, 'touchstart', 300)
    touch(row, 'touchmove', 340)
    touch(row, 'touchend', 340)
    await flush()
    expect(accountCardsOpen()).toBe(true)
    expect(card.style.transform).toBe('')
    touch(row, 'touchstart', 300)
    expect(touch(row, 'touchmove', 320, 160).defaultPrevented).toBe(false)
    touch(row, 'touchend', 320)
    touch(row, 'touchstart', 300)
    expect(touch(row, 'touchmove', 200).defaultPrevented).toBe(false)
    expect(accountCardsOpen()).toBe(true)
  })

  it('a card scrolled down scrolls; it does not pull', async () => {
    await open('settings')
    const card = top()
    Object.defineProperty(card, 'scrollTop', { value: 80, configurable: true })
    const row = card.querySelector('.tc-r')!
    touch(row, 'touchstart', 300)
    expect(touch(row, 'touchmove', 500).defaultPrevented).toBe(false)
    expect(card.style.transform).toBe('')
    expect(accountCardsOpen()).toBe(true)
  })
})

describe('Delete account', () => {
  const deletePosts = () => posts.filter(post => post.url === '/api/account/delete')

  /** The Account card alone, with a recording signOut (the real one leaves the page). */
  function accountOnly() {
    const signOut = vi.fn(async (_landing?: string) => {})
    const env: CardsEnv = {
      session, social: true, changed: () => {}, reloadFind: () => {}, signOut, resetPassword: async () => '', navigate: vi.fn(),
      data: { profile: null, reading: null, allowance: null, plan: 'free', intervals: [], rank: null, find: null, findBadge: 0 },
    }
    const stack = new CardStack({ dark: false, onClosed: () => {} })
    stack.push(accountCard(env))
    return { env, signOut, stack }
  }

  it('asks in the card first, then deletes the account and signs out to the front page', async () => {
    const { signOut, stack } = accountOnly()
    click(byTest('account-delete'))
    expect(top().textContent).toContain(CARDS_COPY.deleteConfirm)
    expect(deletePosts()).toEqual([])
    // Cancel goes back without deleting anything.
    click(byTest('account-delete-cancel'))
    expect(byTest('account-delete-confirm')).toBeNull()
    click(byTest('account-delete'))
    click(byTest('account-delete-confirm'))
    await flush()
    // Exactly what the Worker requires (worker/routes/accountDelete.ts).
    expect(deletePosts()).toEqual([{ url: ACCOUNT_DELETE_PATH, body: { confirm: ACCOUNT_DELETE_CONFIRM, userId: session.userId } }])
    expect(signOut).toHaveBeenCalledWith('/')
    stack.closeAll()
  })

  it('shows the error line and keeps the reader signed in when deletion fails', async () => {
    deleteAnswer = { status: 500, body: { ok: false, deleted: false, error: 'deletion_failed' } }
    const { signOut, stack } = accountOnly()
    click(byTest('account-delete'))
    click(byTest('account-delete-confirm'))
    await flush()
    expect(signOut).not.toHaveBeenCalled()
    expect(top().querySelector('.tc-status')?.textContent).toBe(CARDS_COPY.actionFailed)
    expect(top().dataset.card).toBe('account')
    stack.closeAll()
  })

  it('signs out once the account is gone even if a final sweep was incomplete', async () => {
    deleteAnswer = { status: 200, body: { ok: false, deleted: true } }
    const { signOut, stack } = accountOnly()
    click(byTest('account-delete'))
    click(byTest('account-delete-confirm'))
    await flush()
    expect(signOut).toHaveBeenCalledWith('/')
    stack.closeAll()
  })

  it('uses the real sign-out, which wipes this device\'s reader data', async () => {
    localStorage.setItem('tinct:highlights', '[1]')
    localStorage.setItem('tinct:device-preferences', '{}')
    await open('account')
    click(byTest('account-delete'))
    click(byTest('account-delete-confirm'))
    await flush()
    expect(deletePosts()).toHaveLength(1)
    expect(localStorage.getItem('tinct:highlights')).toBeNull()
    expect(localStorage.getItem('tinct:device-preferences')).toBe('{}')
  })
})

describe('Find readers and a reader\'s profile', () => {
  it('lists who follows you with Follow back, readers of your books, and your link', async () => {
    await open('find')
    expect(byTest('following-you-row-button')?.textContent).toBe('Follow back')
    expect(byTest('reader-row-button')?.textContent).toBe('Follow')
    expect(byTest('invite-link')?.textContent).toContain('tinct.app/@anders')
    click(byTest('following-you-row-button'))
    await flush()
    expect(posts.find(post => post.url === '/api/social/follow')?.body).toEqual({ handle: 'ellen' })
    expect(byTest('following-you-row-button')?.textContent).toBe('Friends')
  })

  it('searches only through the server\'s public search, and says when nobody is found', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      await open('find')
      const input = top().querySelector<HTMLInputElement>('input[type="search"]')!
      input.value = 'Karl'
      input.dispatchEvent(new Event('input'))
      await vi.advanceTimersByTimeAsync(300)
      await flush()
      const calls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map(call => String(call[0]))
      expect(calls).toContain('/api/social/find?q=Karl')
      // Search finds Friends and Everyone readers now (19 Oct 2026): the line no longer says "public".
      expect(byTest('find-results')?.textContent).toContain('No reader by that name.')
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows a Friends-only profile to a non-friend as its header only', async () => {
    readerProfile = { handle: 'karl', name: 'Karl Ny', link: 'tinct.app/@karl', picture: pic('K'), banner: { src: '/b.jpg', private: false }, relation: 'followed', followsYou: true, limited: true, time: null, readingNow: null, finished: null }
    await open('find')
    click(byTest('reader-row'))
    await flush()
    expect(top().dataset.card).toBe('profile')
    expect(top().querySelector('.tc-nm')?.textContent).toBe('Karl NyFollows you')
    expect(byTest('profile-follow')?.textContent).toBe('Follow back')
    expect(top().querySelector('[data-testid="card-facts"]')).toBeNull()
    expect(top().querySelectorAll('.tc-g').length).toBe(0)
  })

  it('shows a visible profile\'s facts and books as far as they are shared', async () => {
    readerProfile = {
      handle: 'karl', name: 'Karl Ny', link: 'tinct.app/@karl', picture: pic('K'), banner: { src: '/b.jpg', private: false }, relation: 'friend', followsYou: true, limited: false,
      time: { last7: '4 h 50 m', year: '96 h' }, readingNow: [{ bookId: 'odyssey', title: 'The Odyssey', cover: null, progress: 'Ch. 5 of 24', hours: null }], finished: null,
    }
    await open('find')
    click(byTest('reader-row'))
    await flush()
    expect(byTest('card-facts')?.textContent).toBe('4 h 50 mlast 7 days96 hthis year')
    expect(byTest('profile-now-row')?.textContent).toContain('Ch. 5 of 24')
    expect(top().textContent).not.toContain('Finished')
  })

  it('offers Unblock, not Follow, on the card of a reader you blocked, so a block is never permanent by accident', async () => {
    blocked = [{ id: '22222222-2222-4222-8222-222222222222', name: 'Karl Ny', handle: 'karl' }]
    await open('find')
    click(byTest('reader-row'))
    await flush()
    expect(byTest('profile-follow')).toBeNull()
    expect(byTest('profile-unblock')?.textContent).toBe('Unblock')
    click(byTest('profile-unblock'))
    await flush()
    expect(posts.find(post => post.url === '/api/social/unblock')?.body).toEqual({ id: '22222222-2222-4222-8222-222222222222' })
    expect(byTest('profile-unblock')).toBeNull()
    expect(byTest('profile-follow')?.textContent).toBe('Follow')
  })

  it('opens nothing for a missing profile beyond the name and Follow', async () => {
    await open('find')
    click(byTest('reader-row'))
    await flush()
    expect(byTest('profile-follow')?.textContent).toBe('Follow')
    expect(top().querySelector('[data-testid="card-facts"]')).toBeNull()
  })
})

// Findable profiles (Anders, 19 Oct 2026): a follow is a request; the one-time notice on the You card.
describe('findable profiles and follow requests (19 October 2026)', () => {
  const NOTICE = 'Readers can now find you by name and picture. Your reading stays private until you accept a follower. Change it in Settings.'
  // Let each test's account reads settle before the next test resets the account.
  afterEach(flush)

  it('a one-way follow reads Requested; Following you counts the requests waiting to be followed back', async () => {
    await open('find')
    expect(byTest('following-you-count')?.textContent).toBe('1')
    expect(byTest('reader-row-button')?.textContent).toBe('Follow')
    readerProfile = { handle: 'karl', name: 'Karl Ny', link: 'tinct.app/@karl', picture: pic('K'), banner: { src: '/b.jpg', private: false }, relation: 'follower', followsYou: false, limited: true, time: null, readingNow: null, finished: null }
    click(byTest('reader-row'))
    await flush()
    // Until Karl follows back: Requested, and his header only (no facts, no books).
    expect(byTest('profile-follow')?.textContent).toBe('Requested')
    expect(top().querySelector('[data-testid="card-facts"]')).toBeNull()
    expect(top().querySelectorAll('.tc-g').length).toBe(0)
  })

  it('a request waiting shows at the top of the You card, opens Following you, and counts as seen here (20 Oct 2026)', async () => {
    const seen = vi.fn()
    window.addEventListener('tinct:follow-requests-seen', seen)
    await open('you')
    const line = byTest('you-requests')
    expect(line?.textContent).toContain('Ellen Ravn wants to be friends')
    expect(line?.querySelector('.tc-av')).toBeTruthy()
    // The first block on the card, above the notice and Your reading.
    expect(top().querySelector('.tc-body > .tc-g')?.contains(line!)).toBe(true)
    expect(JSON.parse(localStorage.getItem(`tinct:follow-requests-seen:${session.userId}`) || '[]')).toEqual(['ellen'])
    expect(seen).toHaveBeenCalled()
    window.removeEventListener('tinct:follow-requests-seen', seen)
    click(line)
    expect(top().dataset.card).toBe('find')
    expect(byTest('following-you-row')?.textContent).toContain('Ellen Ravn')
    expect(byTest('following-you-row-button')?.textContent).toBe('Follow back')
    expect(byTest('following-you-row-remove')?.getAttribute('aria-label')).toBe('Remove')
  })

  it('Remove declines a request with the existing remove-follower action and hides the row', async () => {
    await open('find')
    click(byTest('following-you-row-remove'))
    await flush()
    expect(posts).toContainEqual({ url: '/api/social/remove-follower', body: { handle: 'ellen' } })
    expect(byTest('following-you-row')).toBeNull()
  })

  it('Remove hides the row on the tap, before the answer; a refusal brings it back and says so (21 Oct 2026)', async () => {
    await open('find')
    const inner = api()
    let answer: (value: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith('/api/social/remove-follower')) return new Promise<Response>(resolve => { answer = resolve })
      return inner(input, init)
    }))
    click(byTest('following-you-row-remove'))
    expect(byTest('following-you-row')).toBeNull()
    answer(Response.json({ error: 'no' }, { status: 500 }))
    await flush()
    expect(byTest('following-you-row')).toBeTruthy()
    expect(top().querySelector('.tc-status')?.textContent).toBe(CARDS_COPY.actionFailed)
  })

  it('a reader followed back is a friend, not a request: no row on the You card, no Remove', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/social/find') && !url.includes('?q=')) return Response.json({ followingYou: [person('ellen', 'Ellen Ravn', 'friend')], alsoReading: [], link: 'tinct.app/@anders' })
      return api()(input, init)
    }))
    await open('you')
    expect(byTest('you-requests')).toBeNull()
    click(byTest('you-find'))
    expect(byTest('following-you-row-remove')).toBeNull()
  })

  it('no longer shows the replaced findable notice on the You card', async () => {
    await open('you')
    expect(byTest('findable-notice')).toBeNull()
    expect(accountNotice.writes).toEqual([])
  })

})

describe('type rules', () => {
  it('never uses monospace or capitals-only labels, and keeps Playfair to titles, the name and figures', async () => {
    const style = document.createElement('style')
    style.textContent = cardsCss
    document.head.append(style)
    try {
      await open('you')
      // You, then Settings and Your reading on top of it: every card's nodes are checked.
      click(byTest('you-settings'))
      click(byTest('card-back'))
      click(byTest('you-reading'))
      click(byTest('card-back'))
      click(byTest('you-settings'))
      for (const node of document.querySelectorAll<HTMLElement>('.tcards *')) {
        const computed = getComputedStyle(node)
        expect(computed.fontFamily, node.className).not.toMatch(/mono/i)
        expect(computed.textTransform, node.className).not.toBe('uppercase')
        const own = [...node.childNodes].filter(child => child.nodeType === 3).map(child => child.textContent).join('').trim()
        if (own.length > 3 && /[a-z]/i.test(own)) expect(own === own.toUpperCase() && /^[A-Z\s]+$/.test(own), own).toBe(false)
        if (/Playfair/.test(computed.fontFamily)) expect(node.matches('.tc-title, .tc-nm b, .tc-figure, .tc-three b, .tc-av'), node.className).toBe(true)
      }
    } finally {
      style.remove()
    }
  })
})

describe('reading time: one figure per label (Anders, 10 October 2026)', () => {
  it('the You row and the Your reading card show the same last-7-days figure, with the same rounding', () => {
    for (const seconds of [0, 59, 60, 2659, 2699, 2700, 3599, 3600, 3659, 14_879, 22_200, 22_259, 359_999]) {
      const { youRow, last7 } = readingFigures({ totalSeconds: seconds * 3, last7Seconds: seconds })
      // "44 m" against "44 m", "6 h 10 m" against "6 h 10": the same hours and minutes.
      const numbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number)
      expect(numbers(youRow), `${seconds}s`).toEqual(numbers(last7))
    }
    expect(readingFigures({ totalSeconds: 14_880, last7Seconds: 2699 })).toEqual({ youRow: '44 m', last7: '44 m', total: [['4', 'h'], ['8', 'm']] })
  })

  it('in the cards: You says 44 m and Your reading says 44 m for 44 min 59 s', async () => {
    readSeconds = 2699
    const userId = '22222222-2222-4222-8222-222222222299'
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    await flush()
    expect(byTest('you-reading')?.textContent).toBe(`${CARDS_COPY.yourReading}44 m`)
    click(byTest('you-reading'))
    const facts = byTest('card-facts')!.querySelectorAll('b')
    expect(facts[0].textContent).toBe('44 m')
    expect(byTest('reading-total')?.textContent).toBe('44m')
  })

  it('a stale cached figure is replaced on both cards at once, so they never disagree', async () => {
    const userId = '33333333-3333-4333-8333-333333333333'
    const stale = readingTimeStats([{ day: today(), bookId: 'frankenstein', read: 2640, listen: 0 }], today())
    writeCardsCache(userId, { profile: ownProfile() as never, reading: { stats: stale, readingNow: [], finished: [] }, rank: null, plan: 'premium', billing: false })
    readSeconds = 2700
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false, start: 'reading' })).toBe(true)
    // First paint: the cached 44 m.
    expect(byTest('card-facts')!.querySelector('b')?.textContent).toBe('44 m')
    await flush()
    expect(byTest('card-facts')!.querySelector('b')?.textContent).toBe('45 m')
    click(byTest('card-back'))
    expect(byTest('you-reading')?.textContent).toContain('45 m')
  })
})

describe('pending time is flushed before the board and figures are read (21 October 2026: You 16 m, board 12 m)', () => {
  const userId = '77777777-7777-4777-8777-777777777721'
  let ledgerSeconds = 0
  let flushFails = false
  let order: string[] = []

  /** The Worker's ledger and board for one reader: the board reads the ledger, as social.ts buildBoard does. */
  function ledgerWorker() {
    const rest = api()
    return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/reading-time/status')) return Response.json({ enabled: true })
      if (url.startsWith('/api/reading-time/flush')) {
        order.push('flush')
        if (flushFails) return Response.json({ error: 'unavailable' }, { status: 503 })
        const body = JSON.parse(String(init?.body)) as { entries: Array<{ read: number; listen: number }> }
        for (const entry of body.entries) ledgerSeconds += entry.read + entry.listen
        return Response.json({ enabled: true, credited: ledgerSeconds })
      }
      if (url.startsWith('/api/reading-time')) {
        order.push('reading')
        return Response.json({ enabled: true, rows: [{ day: today(), bookId: 'frankenstein', read: ledgerSeconds, listen: 0 }] })
      }
      if (url.startsWith('/api/social/board')) {
        order.push('board')
        return Response.json({ tab: 'friends', total: 1, meShown: true, me: null, entries: [{ rank: 1, name: 'Anders', picture: pic('A'), seconds: ledgerSeconds, duration: '', me: true }] })
      }
      return rest(input, init)
    })
  }

  beforeEach(() => {
    ledgerSeconds = 12 * 60
    flushFails = false
    order = []
    resetReadingTimeSwitch()
    resetLedgerSends()
    // Four minutes read on this device since its last heartbeat.
    addPending(userId, today(), 'frankenstein', { read: 4 * 60 })
    vi.stubGlobal('fetch', ledgerWorker())
  })

  async function openYou() {
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    await flush()
  }

  it('the board does not wait for the flush (21 Oct 2026); Your reading reads after it; then Your reading, the rank and the Leaderboard all say 16 m, counted once', async () => {
    await openYou()
    // The board is asked for at once, beside the flush; Your reading only once the flush has landed.
    expect(order).toEqual(['board', 'flush', 'reading'])
    expect(readPending(userId)).toEqual({})
    expect(byTest('you-reading')?.textContent).toBe(`${CARDS_COPY.yourReading}16 m`)
    expect(byTest('you-leaderboard')?.textContent).toContain('1st of 1')
    click(byTest('you-leaderboard'))
    expect(byTest('board-me')?.textContent).toContain('16 m')
  })

  it('the Leaderboard opened later sends what was read since before it asks again', async () => {
    await openYou()
    closeAccountCards()
    forgetBoards()
    addPending(userId, today(), 'frankenstein', { read: 60 })
    order = []
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false, start: 'leaderboard' })).toBe(true)
    await flush()
    expect(order).toEqual(['board', 'flush', 'reading'])
    expect(byTest('board-me')?.textContent).toContain('17 m')
  })

  it('a failed flush: the board still loads (12 m, the ledger) and Your reading keeps this device’s time (16 m)', async () => {
    flushFails = true
    await openYou()
    expect(order).toEqual(['board', 'flush', 'reading'])
    expect(readPending(userId)).not.toEqual({})
    expect(byTest('you-reading')?.textContent).toBe(`${CARDS_COPY.yourReading}16 m`)
    expect(byTest('you-leaderboard')?.textContent).toContain('1st of 1')
    click(byTest('you-leaderboard'))
    expect(byTest('board-me')?.textContent).toContain('12 m')
  })

  it('the board shows while the flush is still on its way; when it lands, the viewer\'s row takes the flushed time and the rank follows', async () => {
    let release = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const worker = ledgerWorker()
    // A friend with 14 m; the board is read before this device's 4 m have landed.
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/reading-time/flush')) { order.push('flush sent'); await gate }
      if (url.startsWith('/api/social/board')) {
        order.push('board')
        return Response.json({ tab: 'friends', total: 2, friends: 1, meShown: true, me: null, entries: [
          { rank: 1, name: 'Bea', picture: pic('B'), seconds: 14 * 60, duration: '', me: false, handle: 'bea' },
          { rank: 2, name: 'You', picture: pic('A'), seconds: ledgerSeconds, duration: '', me: true },
        ] })
      }
      return worker(input, init)
    }))
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false, start: 'leaderboard' })).toBe(true)
    await flush()
    const card = top()
    const rows = () => [...card.querySelectorAll('[data-testid="board-rows"] > *')].map(node => node.textContent)
    // On screen with the flush still held: the Worker's rows, the viewer at 12 m.
    expect(order).toEqual(['board', 'flush sent'])
    expect(rows()).toEqual([expect.stringMatching(/^1.*Bea.*14 m$/), expect.stringMatching(/^2.*You.*12 m$/)])
    release()
    await flush()
    // Landed: Your reading says 16 m, and so does the board, re-ranked in place (no second board request).
    expect(order).toEqual(['board', 'flush sent', 'flush', 'reading'])
    expect(top()).toBe(card)
    expect(rows()).toEqual([expect.stringMatching(/^1.*You.*16 m$/), expect.stringMatching(/^2.*Bea.*14 m$/)])
    click(byTest('card-back'))
    expect(byTest('you-reading')?.textContent).toBe(`${CARDS_COPY.yourReading}16 m`)
    expect(byTest('you-leaderboard')?.textContent).toContain('1st of 2')
  })

  it('nothing pending: no flush is sent', async () => {
    localStorage.clear()
    await openYou()
    expect(order).not.toContain('flush')
    expect(byTest('you-reading')?.textContent).toBe(`${CARDS_COPY.yourReading}12 m`)
  })
})

describe('first paint (Anders, 10 October 2026)', () => {
  it('with nothing cached: a quiet skeleton, never a stand-in name, then the real profile', async () => {
    let release = () => {}
    profileGate = new Promise(resolve => { release = resolve })
    const userId = '44444444-4444-4444-8444-444444444444'
    expect(await openAccountCards({ session: { ...session, userId, accountName: null }, social: true, dark: false })).toBe(true)
    await flush()
    const hero = top().querySelector('.tc-hero')!
    expect(byTest('you-name-skeleton')).toBeTruthy()
    expect(hero.textContent).toBe('')
    expect(top().textContent).not.toContain('Reader')
    expect(byTest('you-picture')?.classList.contains('is-skel')).toBe(true)
    release()
    await flush()
    expect(top().querySelector('.tc-nm b')?.textContent).toBe('Anders')
    expect(byTest('you-name-skeleton')).toBeNull()
  })

  it('from the cached profile and figures at once, before any answer', async () => {
    const userId = '55555555-5555-4555-8555-555555555555'
    const cachedStats = readingTimeStats([{ day: today(), bookId: 'frankenstein', read: 22_200, listen: 0 }], today())
    writeCardsCache(userId, { profile: ownProfile({ name: 'Anders H' }) as never, reading: { stats: cachedStats, readingNow: [], finished: [] }, rank: '3rd of 5', plan: 'premium', billing: false,
      allowance: { usedFraction: 0.29, monthUsedFraction: 0.29, topUpLeftFraction: null, state: 'ok', resetsAt: '2026-11-10T00:00:00Z', hasTopUp: false, hasAllowance: true, topUps: [] } })
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    expect(top().querySelector('.tc-nm')?.textContent).toBe('Anders HPremium')
    // The cards bring their stylesheet with them (the library's static page links none).
    // (vitest serves CSS imports empty; the built bundle carries the rules, which the build check greps for.)
    expect(document.head.querySelectorAll('style[data-tinct-cards]')).toHaveLength(1)
    expect(byTest('you-reading')?.textContent).toContain('6 h 10 m')
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 5')
    // The credits meter paints from the cache as well: the card no longer grows when the allowance arrives (11 Oct 2026).
    expect(top().querySelector('.tc-meter')?.textContent).toContain('29% used this month')
    // The bar fills toward 100% as the allowance is used (Anders, 12 Oct).
    expect((top().querySelector('.tc-meter .tc-tr i') as HTMLElement).style.width).toBe('29%')
  })

  it('asks for the profile, the reading time and the Friends board at once; the rank comes from the board, not a second call', async () => {
    const userId = '66666666-6666-4666-8666-666666666666'
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => { calls.push(String(input)); return new Promise<Response>(() => {}) }))
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    await flush()
    expect(calls.some(url => url.startsWith('/api/profile'))).toBe(true)
    expect(calls.some(url => url.startsWith('/api/reading-time'))).toBe(true)
    expect(calls.some(url => url.startsWith('/api/social/board'))).toBe(true)
    expect(calls.some(url => url.startsWith('/api/social/rank'))).toBe(false)
  })

  it('keeps the cache per account and lets sign-out wipe it', () => {
    writeCardsCache(session.userId, { profile: null, reading: null, rank: '1st of 2', plan: 'free', billing: false })
    expect(readCardsCache(session.userId)?.rank).toBe('1st of 2')
    expect(readCardsCache('77777777-7777-4777-8777-777777777777')).toBeNull()
    wipeLabDeviceUserData()
    expect(localStorage.getItem(CARDS_CACHE_PREFIX + session.userId)).toBeNull()
  })
})

describe('picture and background (Anders, 10 October 2026)', () => {
  const choose = (field: HTMLInputElement) => {
    Object.defineProperty(field, 'files', { configurable: true, value: [new File(['x'], 'photo.png', { type: 'image/png' })] })
    field.dispatchEvent(new Event('change'))
  }

  it('without uploads: the camera opens Choose a picture, the banner button Choose a background; no upload anywhere', async () => {
    await open('you')
    expect(byTest('you-background')?.getAttribute('aria-label')).toBe(CARDS_COPY.changeBackground)
    click(byTest('you-picture'))
    expect(top().dataset.card).toBe('picture')
    click(byTest('card-back'))
    click(byTest('you-background'))
    expect(top().dataset.card).toBe('background')
    expect(top().querySelector('.tc-title')?.textContent).toBe(CARDS_COPY.chooseBackground)
    click(byTest('card-back'))
    expect(top().textContent).not.toMatch(/Upload/)
  })

  it('with uploads: the camera menu holds the picture only, the banner menu the background; both upload', async () => {
    profile = ownProfile({ uploads: true })
    await open('you')
    click(byTest('you-picture'))
    expect([...byTest('card-menu')!.querySelectorAll('.tc-lt')].map(node => node.textContent)).toEqual([CARDS_COPY.uploadPicture, CARDS_COPY.choosePicture])
    click(byTest('menu-upload'))
    choose(top().querySelectorAll<HTMLInputElement>('input[type="file"]')[0])
    await flush()
    expect(uploads).toEqual([{ url: '/api/profile/image?slot=picture', type: 'image/jpeg' }])

    click(byTest('you-background'))
    expect([...byTest('card-menu')!.querySelectorAll('.tc-lt')].map(node => node.textContent)).toEqual([CARDS_COPY.chooseBackground, CARDS_COPY.uploadBackground])
    expect(byTest('card-menu')?.classList.contains('is-end')).toBe(true)
    click(byTest('menu-upload-background'))
    choose(top().querySelectorAll<HTMLInputElement>('input[type="file"]')[1])
    await flush()
    expect(uploads[1]).toEqual({ url: '/api/profile/image?slot=background', type: 'image/jpeg' })
    // Saved, and shown to others at once (no review since 19 Oct 2026; the approval line is gone).
    expect(top().querySelector('.tc-status')?.textContent ?? '').toBe('')
    expect(top().textContent).not.toContain('approved')
  })

  it('reads the chosen photo before the input is cleared, clears it only after preparing, and waits meanwhile (iPad, 19 Oct 2026)', async () => {
    profile = ownProfile({ uploads: true })
    await open('you')
    const order: string[] = []
    let finishPrepare = () => {}
    vi.mocked(preparePhoto).mockImplementationOnce(async photo => {
      order.push('prepare')
      // What is prepared is the in-memory copy, with the photo's type and name.
      expect(photo).not.toBe(file)
      expect(photo.type).toBe('image/heic')
      expect((photo as File).name).toBe('IMG_0001.heic')
      expect(new Uint8Array(await photo.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
      await new Promise<void>(resolve => { finishPrepare = resolve })
      order.push('prepared')
      return { ok: true as const, image: new Blob(['jpeg'], { type: 'image/jpeg' }) }
    })
    const file = new File([new Uint8Array([1, 2, 3])], 'IMG_0001.heic', { type: 'image/heic' })
    const read = file.arrayBuffer.bind(file)
    file.arrayBuffer = vi.fn(async () => { order.push('read'); return read() })
    const field = top().querySelectorAll<HTMLInputElement>('input[type="file"]')[0]
    Object.defineProperty(field, 'files', { configurable: true, value: [file] })
    Object.defineProperty(field, 'value', { configurable: true, get: () => '', set: () => { order.push('clear') } })
    click(byTest('you-picture'))
    click(byTest('menu-upload'))
    field.dispatchEvent(new Event('change'))
    await flush()
    // Busy while preparing: the photo buttons wait.
    expect((byTest('you-picture') as HTMLButtonElement).disabled).toBe(true)
    expect(byTest('you-picture')?.getAttribute('aria-busy')).toBe('true')
    expect((byTest('you-background') as HTMLButtonElement).disabled).toBe(true)
    expect(order).toEqual(['read', 'prepare'])
    finishPrepare()
    await flush()
    expect(order[0]).toBe('read')
    expect(order.indexOf('clear')).toBeGreaterThan(order.indexOf('prepared'))
    expect(uploads).toEqual([{ url: '/api/profile/image?slot=picture', type: 'image/jpeg' }])
    expect((byTest('you-picture') as HTMLButtonElement).disabled).toBe(false)
    expect(byTest('you-picture')?.hasAttribute('aria-busy')).toBe(false)
    // No approval line: uploads show to others at once (19 Oct 2026).
    expect(top().querySelector('.tc-status')?.textContent ?? '').toBe('')
  })

  it('the Worker’s 415 has its own wording, not the not-a-photo line', async () => {
    profile = ownProfile({ uploads: true })
    await open('you')
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: PHOTO_COPY.unprocessed }, { status: 415 })))
    click(byTest('you-picture'))
    click(byTest('menu-upload'))
    choose(top().querySelectorAll<HTMLInputElement>('input[type="file"]')[0])
    await flush()
    expect(top().querySelector('.tc-status')?.textContent).toBe('This photo could not be processed. Try a screenshot of it.')
    expect(PHOTO_COPY.unprocessed).not.toBe(PHOTO_COPY.notAPhoto)
    expect(PHOTO_COPY.unprocessed).not.toBe(PHOTO_COPY.unreadable)
  })

  it('says so when an upload is refused', async () => {
    profile = ownProfile({ uploads: true })
    await open('you')
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'That picture is too large.' }, { status: 413 })))
    click(byTest('you-background'))
    click(byTest('menu-upload-background'))
    choose(top().querySelectorAll<HTMLInputElement>('input[type="file"]')[1])
    await flush()
    expect(top().querySelector('.tc-status')?.textContent).toBe('That picture is too large.')
  })

  it('says why when the photo itself cannot be used (a HEIC this browser cannot read), and sends nothing', async () => {
    profile = ownProfile({ uploads: true })
    await open('you')
    vi.mocked(preparePhoto).mockResolvedValueOnce({ ok: false, message: 'This photo’s format can’t be read here. Try a screenshot of it.' })
    click(byTest('you-picture'))
    click(byTest('menu-upload'))
    choose(top().querySelectorAll<HTMLInputElement>('input[type="file"]')[0])
    await flush()
    expect(top().querySelector('.tc-status')?.textContent).toBe('This photo’s format can’t be read here. Try a screenshot of it.')
    expect(uploads).toEqual([])
  })
})

describe('Account and Change password (Anders, 10 October 2026)', () => {
  it('Premium without a Stripe subscription (by grant): the plan, no Manage', async () => {
    subscription = { subscription_status: 'active', stripe: null }
    await open('account')
    expect(byTest('account-plan')?.textContent).toBe(CARDS_COPY.premiumAccount)
    expect(byTest('account-manage')).toBeNull()
  })

  it('Premium with a Stripe subscription: Manage', async () => {
    subscription = { subscription_status: 'active', stripe: { status: 'active', currentPeriodEnd: '2026-11-05T00:00:00.000Z', cancelAtPeriodEnd: false } }
    await open('account')
    expect(byTest('account-manage')).toBeTruthy()
  })

  it('Password sends the reset email and shows the confirmation under the row, kept through refreshes', async () => {
    let answer = (_text: string) => {}
    const resetPassword = vi.fn(() => new Promise<string>(resolve => { answer = resolve }))
    let stack: CardStack | null = null
    const env: CardsEnv = {
      session, social: true, changed: () => stack?.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword, navigate: vi.fn(),
      data: { profile: null, reading: null, allowance: null, plan: 'premium', intervals: [], rank: null, find: null, findBadge: 0 },
    }
    stack = new CardStack({ dark: false })
    stack.push(settingsCard(env))
    click(byTest('settings-password'))
    expect(resetPassword).toHaveBeenCalledTimes(1)
    // Sending: the row waits, a second tap sends nothing more.
    expect((byTest('settings-password') as HTMLButtonElement).disabled).toBe(true)
    ;(byTest('settings-password') as HTMLButtonElement).click()
    expect(resetPassword).toHaveBeenCalledTimes(1)
    answer(CARDS_COPY.resetSent)
    await flush()
    const line = byTest('settings-password-status')!
    expect(line.textContent).toBe(CARDS_COPY.resetSent)
    // Right under the Password row's group, not at the foot of the card.
    expect(line.previousElementSibling?.querySelector('[data-testid="settings-password"]')).toBeTruthy()
    env.changed()
    expect(byTest('settings-password-status')?.textContent).toBe(CARDS_COPY.resetSent)
    stack.closeAll()
  })
})

describe('AI credits (Anders, 14 October 2026)', () => {
  const allowance = (used: number, fields: Record<string, unknown> = {}) => ({
    usedFraction: used, monthUsedFraction: used, topUpLeftFraction: null, state: used >= 1 ? 'used_up' : used >= 0.8 ? 'low' : 'ok',
    resetsAt: '2026-11-13T12:00:00.000Z', hasTopUp: false, hasAllowance: true, topUps: ['chat_pack_200', 'top_up_10'], ...fields,
  }) as CardsEnv['data']['allowance']

  /** The You card alone, with the allowance and plan given. */
  function youOnly(data: Partial<CardsEnv['data']>) {
    let stack: CardStack | null = null
    const env: CardsEnv = {
      session, social: true, changed: () => stack?.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword: async () => '', navigate: vi.fn(),
      data: { profile: null, reading: null, allowance: null, plan: 'premium', intervals: [], rank: null, find: null, findBadge: 0, ...data },
    }
    stack = new CardStack({ dark: false })
    stack.push(youCard(env))
    return { env, stack }
  }

  it('below 90% used: only AI credits, its percentage and bar; no Top up row', () => {
    for (const used of [0, 0.5, 0.89]) {
      const { stack } = youOnly({ allowance: allowance(used) })
      expect(byTest('you-ai-credits')?.textContent).toContain(`${Math.round(used * 100)}% ${CARDS_COPY.usedThisMonth}`)
      expect(byTest('you-top-up')).toBeNull()
      expect(byTest('you-get-premium')).toBeNull()
      expect(top().textContent).not.toMatch(/Renews|Top up|or wait/)
      stack.closeAll()
    }
  })

  it('at 90% and at 100%: Top up, "or wait until" the reset date, and the existing top-up menu', () => {
    for (const used of [0.9, 1]) {
      const { stack } = youOnly({ allowance: allowance(used) })
      const topUp = byTest('you-top-up')!
      expect(topUp.textContent).toBe(`${CARDS_COPY.topUp}${CARDS_COPY.orWaitUntil('13 Nov')}`)
      expect(topUp.textContent).toContain('or wait until 13 Nov')
      click(topUp)
      expect(byTest('menu-top-up')?.textContent).toBe(CARDS_COPY.buyTopUp)
      expect(byTest('menu-top-up-more')?.textContent).toBe(CARDS_COPY.buyTopUpMore)
      stack.closeAll()
    }
  })

  it('a free account from before the trial reset shows a fresh month: 0% used and "Resets 14 Nov" (15 Oct 2026)', () => {
    const profile = { subscription_status: null, subscription_period_end: null, created_at: '2026-09-01T10:00:00Z' }
    const period = billingPeriod(profile, new Date('2026-10-20T12:00:00Z'))
    const view = allowanceView({ allowanceMicros: period.allowanceMicros, spendMicros: 0, creditMicros: 0, drawnMicros: 0 }, period.end)
    const { stack } = youOnly({ plan: 'free', intervals: ['month', 'year'], allowance: { ...view, topUps: ['chat_pack_200', 'top_up_10'] } as CardsEnv['data']['allowance'] })
    const row = byTest('you-ai-credits') as HTMLButtonElement
    expect(row.tagName).toBe('BUTTON')
    expect(row.textContent).toContain('0%')
    row.click()
    const resets = byTest('you-ai-resets')!
    expect(resets.textContent).toBe(CARDS_COPY.resets(dayMonthShort(view.resetsAt)))
    if (new Date(view.resetsAt!).getTimezoneOffset() <= 0) expect(resets.textContent).toBe('Resets 14 Nov')
    expect(byTest('you-get-premium')).toBeNull()
    stack.closeAll()
  })

  it('a free reader, who cannot top up, gets Get Premium instead, which opens the Premium offer on Account', () => {
    const { stack } = youOnly({ plan: 'free', intervals: ['month', 'year'], allowance: allowance(0.92) })
    expect(byTest('you-top-up')).toBeNull()
    const premium = byTest('you-get-premium')!
    expect(premium.textContent).toBe(CARDS_COPY.getPremium)
    click(premium)
    expect(top().dataset.card).toBe('account')
    expect(byTest('account-plan-month')).toBeTruthy()
    expect(byTest('account-plan-year')).toBeTruthy()
    stack.closeAll()
    // Below 90%, a free reader sees no row either.
    const quiet = youOnly({ plan: 'free', intervals: ['month', 'year'], allowance: allowance(0.5) })
    expect(byTest('you-get-premium')).toBeNull()
    quiet.stack.closeAll()
  })

  it('tapping AI credits shows "Resets 13 Nov" under the bar, and tapping again hides it; kept through refreshes', () => {
    const { env, stack } = youOnly({ allowance: allowance(0.29) })
    const row = byTest('you-ai-credits') as HTMLButtonElement
    expect(row.tagName).toBe('BUTTON')
    expect(row.getAttribute('aria-expanded')).toBe('false')
    expect(byTest('you-ai-resets')?.hidden).toBe(true)
    row.click()
    expect(row.getAttribute('aria-expanded')).toBe('true')
    expect(byTest('you-ai-resets')?.hidden).toBe(false)
    expect(byTest('you-ai-resets')?.textContent).toBe(CARDS_COPY.resets('13 Nov'))
    expect(byTest('you-ai-resets')?.textContent).toBe('Resets 13 Nov')
    env.changed()
    expect(byTest('you-ai-credits')?.getAttribute('aria-expanded')).toBe('true')
    expect(byTest('you-ai-resets')?.hidden).toBe(false)
    ;(byTest('you-ai-credits') as HTMLButtonElement).click()
    expect(byTest('you-ai-credits')?.getAttribute('aria-expanded')).toBe('false')
    expect(byTest('you-ai-resets')?.hidden).toBe(true)
    // A native button: Enter and Space work from the keyboard, and it takes focus.
    expect((byTest('you-ai-credits') as HTMLButtonElement).type).toBe('button')
    stack.closeAll()
  })

  it('credits never say Renews', () => {
    expect(CARDS_COPY.resets('13 Nov')).toBe('Resets 13 Nov')
    expect(Object.keys(CARDS_COPY)).not.toContain('renews')
  })
})

describe('AI credits: only what happened (Anders, 15 October 2026)', () => {
  const allowance = (fields: Record<string, unknown>) => ({
    usedFraction: 1, monthUsedFraction: 1, topUpLeftFraction: null, state: 'used_up', resetsAt: null, hasTopUp: false, hasAllowance: false,
    topUps: ['chat_pack_200', 'top_up_10'], ...fields,
  }) as CardsEnv['data']['allowance']
  function youOnly(data: Partial<CardsEnv['data']>) {
    let stack: CardStack | null = null
    const env: CardsEnv = {
      session, social: true, changed: () => stack?.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword: async () => '', navigate: vi.fn(),
      data: { profile: null, reading: null, allowance: null, plan: 'premium', intervals: [], rank: null, find: null, findBadge: 0, ...data },
    }
    stack = new CardStack({ dark: false })
    stack.push(youCard(env))
    return { env, stack }
  }

  it('a free account after its trial: AI credits without a bar or a percentage, and Get Premium; no top-up row', () => {
    const { stack } = youOnly({ plan: 'free', intervals: ['month', 'year'], allowance: allowance({}) })
    const credits = byTest('you-ai-credits')!
    expect(credits.textContent).toBe(`${CARDS_COPY.aiCredits}${CARDS_COPY.noCredits}`)
    expect(credits.textContent).not.toMatch(/%|used/)
    expect(top().querySelector('[role="meter"]')).toBeNull()
    expect(byTest('you-top-up-bar')).toBeNull()
    expect(byTest('you-top-up')).toBeNull()
    expect(byTest('you-get-premium')?.textContent).toBe(CARDS_COPY.getPremium)
    stack.closeAll()
  })

  it('no top-up bought: no Top-up bar, whatever the ledger says was drawn (never 0 of 0 as 100%)', () => {
    for (const plan of ['free', 'premium'] as const) {
      // A Worker from before the fix sent 0 left for a top-up never bought.
      const { stack } = youOnly({ plan, intervals: ['month'], allowance: allowance({ hasAllowance: true, monthUsedFraction: 0.01, usedFraction: 0.01, state: 'ok', resetsAt: '2026-11-13T12:00:00.000Z', topUpLeftFraction: 0 }) })
      expect(byTest('you-ai-credits')?.textContent).toContain(`1% ${CARDS_COPY.usedThisMonth}`)
      expect(byTest('you-top-up-bar')).toBeNull()
      expect(byTest('you-get-premium')).toBeNull()
      stack.closeAll()
    }
  })

  it('a bought top-up with credit left: its bar shows what was used of it', () => {
    const { stack } = youOnly({ allowance: allowance({ hasAllowance: true, monthUsedFraction: 1, state: 'ok', resetsAt: '2026-11-13T12:00:00.000Z', hasTopUp: true, topUpLeftFraction: 0.6 }) })
    expect(byTest('you-top-up-bar')?.textContent).toContain(`40% ${CARDS_COPY.used}`)
    stack.closeAll()
  })

  it('an allowance cached before hasAllowance existed: no reset date means none', () => {
    const old = { usedFraction: 1, monthUsedFraction: 1, topUpLeftFraction: 0, state: 'used_up', resetsAt: null, hasTopUp: false, topUps: [] }
    writeCardsCache(session.userId, { profile: null, reading: null, rank: null, plan: 'free', billing: false, allowance: old as never })
    expect(readCardsCache(session.userId)?.allowance?.hasAllowance).toBe(false)
    writeCardsCache(session.userId, { profile: null, reading: null, rank: null, plan: 'free', billing: false, allowance: { ...old, resetsAt: '2026-11-13T12:00:00.000Z' } as never })
    expect(readCardsCache(session.userId)?.allowance?.hasAllowance).toBe(true)
  })
})

describe('the name, changed on the You card (Anders, 15 October 2026)', () => {
  it('tap the name, type, Enter: saved through the profile save path; the card shows it', async () => {
    profile = ownProfile({ name: 'Reader' })
    await open('you')
    const name = byTest('you-name')!
    expect(name.tagName).toBe('BUTTON')
    expect(name.getAttribute('aria-label')).toBe(CARDS_COPY.changeName)
    click(name)
    const input = byTest('you-name-input') as HTMLInputElement
    expect(input.value).toBe('Reader')
    // The sign-up profile step's rule: at most 40 characters.
    expect(input.maxLength).toBe(40)
    expect(input.getAttribute('autocomplete')).toBe('name')
    input.value = 'Mette'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flush()
    expect(posts.find(post => post.url === '/api/profile')?.body).toEqual({ name: 'Mette' })
    expect(byTest('you-name-input')).toBeNull()
    expect(byTest('you-name')?.textContent).toBe('Mette')
  })

  it('Escape keeps the old name, sends nothing and leaves the cards open', async () => {
    await open('you')
    click(byTest('you-name'))
    const input = byTest('you-name-input') as HTMLInputElement
    input.focus()
    input.value = 'Someone else'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flush()
    expect(accountCardsOpen()).toBe(true)
    expect(byTest('you-name')?.textContent).toBe('Anders')
    expect(posts.some(post => post.url === '/api/profile' && 'name' in post.body)).toBe(false)
  })

  it('a name the Worker refuses: its message, and the field stays open with what was typed', async () => {
    await open('you')
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith('/api/profile') && init?.method === 'POST') return Response.json({ error: 'Please choose another name.', field: 'name' }, { status: 422 })
      return Response.json({}, { status: 404 })
    }))
    click(byTest('you-name'))
    const input = byTest('you-name-input') as HTMLInputElement
    input.value = ' '
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flush()
    expect(top().querySelector('.tc-status')?.textContent).toBe('Please choose another name.')
    expect((byTest('you-name-input') as HTMLInputElement).value).toBe(' ')
  })
})

describe('the last board shows at once while the fresh one loads (21 October 2026: "still takes too long")', () => {
  const entry = (rank: number, name: string, seconds: number, me = false) => ({ rank, name, picture: pic(name[0]), seconds, duration: '', me, ...(me ? {} : { handle: name.toLowerCase() }) })
  const rows = () => [...top().querySelectorAll('[data-testid="board-rows"] > *')].map(node => node.textContent)

  it('paints the board this page read last, before any answer, then swaps the fresh rows into the same card', async () => {
    boards = { friends: { ...FRIENDS_BOARD, friends: 1, total: 2, entries: [entry(1, 'Mette', 3600), entry(2, 'You', 60, true)] }, everyone: null }
    await open('leaderboard')
    expect(rows()).toEqual([expect.stringContaining('Mette1 h'), expect.stringContaining('You1 m')])
    closeAccountCards()
    // A minute later Mette has read another hour; the Worker is slow to answer.
    boards = { friends: { ...FRIENDS_BOARD, friends: 1, total: 2, entries: [entry(1, 'Mette', 7200), entry(2, 'You', 60, true)] }, everyone: null }
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now + 60_000)
    let release = () => {}
    const held = new Promise<void>(resolve => { release = resolve })
    const answer = api()
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith('/api/social/board')) await held
      return answer(input, init)
    }))
    expect(await openAccountCards({ session, social: true, dark: false, start: 'leaderboard' })).toBe(true)
    // Synchronously, from memory.
    const card = top()
    expect(card.dataset.card).toBe('leaderboard')
    expect(rows()).toEqual([expect.stringContaining('Mette1 h'), expect.stringContaining('You1 m')])
    await flush()
    expect(rows()).toEqual([expect.stringContaining('Mette1 h'), expect.stringContaining('You1 m')])
    release()
    await flush()
    expect(top()).toBe(card)
    expect(rows()).toEqual([expect.stringContaining('Mette2 h'), expect.stringContaining('You1 m')])
    // One board request for the open and the Leaderboard together.
    expect(boardCalls).toEqual(['friends', 'friends'])
  })

  it('a reader without friends while Everyone is open: one request (the Worker picks the board), not Friends then Everyone', async () => {
    const everyone = { tab: 'everyone', total: 2, friends: 0, meShown: true, everyoneOpen: true, me: null, entries: [entry(1, 'You', 19020, true), entry(2, 'Mette', 60)] }
    const answer = api()
    const asked: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/social/board')) {
        asked.push(new URL(url, 'https://tinct.app').searchParams.get('tab') ?? '')
        return Response.json(everyone)
      }
      return answer(input, init)
    }))
    await open('you')
    expect(asked).toEqual(['default'])
    expect(byTest('you-leaderboard')?.textContent).toContain('1st of 2')
    click(byTest('you-leaderboard'))
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.everyone)
    await flush()
    expect(asked).toEqual(['default'])
  })
})

describe('Leaderboard rows open profiles; Everyone first while open (Anders, 15 October 2026)', () => {
  const entry = (rank: number, name: string, seconds: number, me = false, handle?: string) => ({ rank, name, picture: pic(name[0]), seconds, duration: '', me, ...(handle ? { handle } : {}) })
  const everyone = { tab: 'everyone', total: 2, meShown: true, everyoneOpen: true, me: null, entries: [entry(1, 'You', 19020, true), entry(2, 'Mette', 60, false, 'mette')] }

  it('tapping a reader opens their profile (what they are reading); tapping You goes back to the You card', async () => {
    boards = { friends: { ...FRIENDS_BOARD, everyoneOpen: false, entries: [entry(1, 'You', 19020, true), entry(2, 'Mette', 60, false, 'mette')] }, everyone: null }
    readerProfile = { handle: 'mette', name: 'Mette', link: 'tinct.app/@mette', picture: pic('M'), banner: { src: '/b.jpg', private: false }, relation: 'friend', followsYou: true, limited: false, time: '1 m this week', readingNow: [{ title: 'Persuasion', progress: 'Chapter 2 of 24', hours: null }], finished: null }
    await open('you')
    click(byTest('you-leaderboard'))
    await flush()
    const rows = top().querySelectorAll<HTMLElement>('[data-testid="board-row"]')
    expect(rows).toHaveLength(1)
    expect(rows[0].tagName).toBe('BUTTON')
    click(rows[0])
    await flush()
    expect(top().dataset.card).toBe('profile')
    expect(byTest('profile-now-row')?.textContent).toContain('Persuasion')
    top().querySelector<HTMLElement>('[data-testid="card-back"]')!.click()
    await flush()
    click(byTest('board-me'))
    await flush()
    expect(top().dataset.card).toBe('you')
  })

  it('no friends: opens on Everyone when it is open, with Friends beside it; the You row ranks on Everyone', async () => {
    boards = { friends: { ...FRIENDS_BOARD, everyoneOpen: true, friends: 0 }, everyone }
    profile = ownProfile({ onLeaderboard: true })
    await open('you')
    expect(boardCalls).toEqual(['friends', 'everyone'])
    expect(byTest('you-leaderboard')?.textContent).toContain('1st of 2')
    click(byTest('you-leaderboard'))
    // Painted from the board read on open, at once, and not asked again.
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.everyone)
    expect(top().querySelectorAll('[data-testid="board-row"]')).toHaveLength(1)
    await flush()
    expect(boardCalls).toEqual(['friends', 'everyone'])
    click(top().querySelector('[data-testid="board-tabs"] [data-value="friends"]'))
    await flush()
    // The Friends board read on open is a few seconds old: shown without asking again.
    expect(boardCalls).toEqual(['friends', 'everyone'])
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.friends)
  })

  it('with a mutual friend: opens on Friends even while Everyone is open; one board request on open (19 Oct 2026)', async () => {
    boards = { friends: { ...FRIENDS_BOARD, everyoneOpen: true, friends: 1, total: 2, entries: [entry(1, 'Mette', 7200, false, 'mette'), entry(2, 'You', 60, true)] }, everyone }
    profile = ownProfile({ onLeaderboard: true })
    await open('you')
    expect(boardCalls).toEqual(['friends'])
    expect(byTest('you-leaderboard')?.textContent).toContain('2nd of 2')
    click(byTest('you-leaderboard'))
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.friends)
    expect([...top().querySelectorAll('[data-testid="board-row"]')].map(node => node.textContent)).toEqual([expect.stringContaining('Mette')])
    await flush()
    expect(boardCalls).toEqual(['friends'])
  })

  it('a tab the reader picked is kept: Everyone stays the opening board on this page', async () => {
    boards = { friends: { ...FRIENDS_BOARD, everyoneOpen: true, friends: 1, entries: [entry(1, 'Mette', 7200, false, 'mette'), entry(2, 'You', 60, true)] }, everyone }
    profile = ownProfile({ onLeaderboard: true })
    await open('you')
    click(byTest('you-leaderboard'))
    click(top().querySelector('[data-testid="board-tabs"] [data-value="everyone"]'))
    await flush()
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.everyone)
    closeAccountCards()
    await flush()
    await open('you')
    click(byTest('you-leaderboard'))
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.everyone)
  })

  it('says why friends do not see you, and where to fix it; nothing when they do', async () => {
    const board = async (meShown: boolean, own: Record<string, unknown>) => {
      forgetBoards()
      boards = { friends: { ...FRIENDS_BOARD, meShown, entries: [entry(1, 'You', 60, true)] }, everyone: null }
      const stack = new CardStack({ dark: false })
      const env: CardsEnv = {
        session, social: true, changed: () => stack.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword: async () => '', navigate: vi.fn(),
        data: { profile: ownProfile(own) as never, reading: null, allowance: null, plan: 'premium', intervals: [], rank: null, find: null, findBadge: 0 },
      }
      stack.push(leaderboardCard(env))
      await flush()
      const line = byTest('board-hidden')?.textContent ?? null
      stack.closeAll()
      return line
    }
    expect(await board(false, { onLeaderboard: false })).toBe('Friends don’t see you here: turn on Leaderboard in Settings.')
    expect(await board(false, { showTime: false, onLeaderboard: false })).toBe('Friends don’t see you here: turn on Show my reading time in Settings.')
    expect(await board(false, { visibility: 'only_me', onLeaderboard: false })).toBe('Friends don’t see you here: your profile is Only me. Change it in Settings.')
    expect(await board(true, {})).toBeNull()
    // Off the board for another reason (an internal account on Everyone, a hidden profile): no line.
    expect(await board(false, {})).toBeNull()
  })

  it('Everyone closed: the Friends board, its rank, no tabs', async () => {
    await open('you')
    expect(boardCalls).toEqual(['friends'])
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 5')
    click(byTest('you-leaderboard'))
    expect(top().querySelector('[data-testid="board-tabs"]')).toBeNull()
    expect(byTest('board-me')).toBeTruthy()
  })

  it('a reader\'s own leaderboard card from elsewhere: tapping You puts the You card on top', async () => {
    boards = { friends: { ...FRIENDS_BOARD, entries: [entry(1, 'You', 60, true)] }, everyone: null }
    let stack: CardStack | null = null
    const env: CardsEnv = {
      session, social: true, changed: () => stack?.refreshLive(), reloadFind: () => {}, signOut: async () => {}, resetPassword: async () => '', navigate: vi.fn(),
      data: { profile: ownProfile() as never, reading: null, allowance: null, plan: 'premium', intervals: [], rank: null, find: null, findBadge: 0 },
    }
    stack = new CardStack({ dark: false })
    stack.push(leaderboardCard(env))
    await flush()
    click(byTest('board-me'))
    expect(stack.ids).toEqual(['leaderboard', 'you'])
    stack.closeAll()
  })
})

describe('row avatars at their size (15 October 2026)', () => {
  it('a painting with a 480px copy uses it; others keep the original', () => {
    for (const id of AVATAR_480_IDS) {
      expect(existsSync(resolve(__dirname, `../../public/lab/library_2/assets/covers/${id}-480.webp`)), id).toBe(true)
      expect(smallAvatarSrc(`/lab/library_2/assets/${id}.jpg`)).toBe(`/lab/library_2/assets/covers/${id}-480.webp`)
    }
    expect(smallAvatarSrc('/lab/library_2/assets/the-awakening.jpg')).toBe('/lab/library_2/assets/the-awakening.jpg')
    expect(smallAvatarSrc('/api/profile/image?user=u&slot=picture&v=1')).toBe('/api/profile/image?user=u&slot=picture&v=1')
  })
})

describe('Find readers above the iPhone keyboard (15 October 2026)', () => {
  it('the search is a search field, not a contact field', async () => {
    await open('find')
    const input = top().querySelector<HTMLInputElement>('[data-testid="find-search"] input')!
    expect(input.type).toBe('search')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.name).toBe('tc-reader-search')
    expect(input.name).not.toMatch(/name|contact|email|tel/i)
  })

  it('on a phone the cards fill the visible area; with the keyboard up they stand on it', () => {
    const listeners: Record<string, () => void> = {}
    const viewport = { height: 844, offsetTop: 0, scale: 1, addEventListener: (type: string, fn: () => void) => { listeners[type] = fn }, removeEventListener: () => {} }
    vi.stubGlobal('visualViewport', viewport)
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 })
    const stack = new CardStack({ dark: false })
    const root = document.querySelector<HTMLElement>('[data-testid="account-cards"]')!
    expect(root.classList.contains('has-kb')).toBe(false)
    expect(root.style.height).toBe('844px')
    Object.assign(viewport, { height: 508, offsetTop: 40 })
    listeners.resize()
    expect(root.classList.contains('has-kb')).toBe(true)
    expect(root.style.top).toBe('40px')
    expect(root.style.height).toBe('508px')
    expect(root.style.getPropertyValue('--tc-vh')).toBe('508px')
    stack.closeAll()
  })
})

describe('a stable Leaderboard (21 October 2026: "We want stable leaderboards")', () => {
  const entry = (rank: number, name: string, seconds: number, me = false, handle?: string) => ({ rank, name, picture: pic(name[0]), seconds, duration: '', me, ...(handle ? { handle } : {}) })
  const friendsBoard = { ...FRIENDS_BOARD, everyoneOpen: true, friends: 1, total: 2, entries: [entry(1, 'Mette', 7200, false, 'mette'), entry(2, 'You', 60, true)] }
  const everyoneBoard = { tab: 'everyone', total: 3, meShown: true, everyoneOpen: true, friends: 1, me: null, entries: [entry(1, 'Ida', 9000, false, 'ida'), entry(2, 'Mette', 7200, false, 'mette'), entry(3, 'You', 60, true)] }

  /** The Everyone board held until released. */
  function holdEveryone(): () => void {
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const inner = api()
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/api/social/board?tab=everyone')) await gate
      return inner(input, init)
    }))
    return release
  }

  it('a tab not read yet shows rows the size of the board at once, never an empty card; the rows replace them in place', async () => {
    boards = { friends: friendsBoard, everyone: everyoneBoard }
    profile = ownProfile({ onLeaderboard: true })
    const release = holdEveryone()
    await open('you')
    click(byTest('you-leaderboard'))
    await flush()
    expect(top().querySelectorAll('[data-testid="board-me"]')).toHaveLength(1)
    click(top().querySelector('[data-testid="board-tabs"] [data-value="everyone"]'))
    // At once: the tab is chosen, the heading and placeholder rows stand where the rows will be, Find readers below them.
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.everyone)
    const skeleton = byTest('board-skeleton')
    expect(skeleton?.getAttribute('aria-busy')).toBe('true')
    expect(skeleton?.querySelectorAll('.tc-r.is-av .tc-av.is-s')).toHaveLength(5)
    expect(top().querySelector('.tc-gh')?.textContent).toBe(CARDS_COPY.lastSevenDays)
    expect(top().querySelector('[data-testid="board-skeleton"] ~ * [data-testid="board-find"]')).toBeTruthy()
    // No row of the other tab is shown under this one.
    expect(top().querySelectorAll('[data-testid="board-row"], [data-testid="board-me"]')).toHaveLength(0)
    release()
    await flush()
    expect(byTest('board-skeleton')).toBeNull()
    expect([...top().querySelectorAll('[data-testid="board-row"]')].map(row => row.textContent)).toEqual([expect.stringContaining('Ida'), expect.stringContaining('Mette')])
  })

  it('after switching tabs, the Leaderboard reopens on the tab the You card ranks on (21 Oct 2026: "5th of 8" over an Everyone board)', async () => {
    boards = { friends: friendsBoard, everyone: everyoneBoard }
    profile = ownProfile({ onLeaderboard: true })
    await open('you')
    click(byTest('you-leaderboard'))
    await flush()
    click(top().querySelector('[data-testid="board-tabs"] [data-value="everyone"]'))
    await flush()
    click(top().querySelector('[data-testid="board-tabs"] [data-value="friends"]'))
    await flush()
    closeAccountCards()
    await openAccountCards({ dark: false, session, social: true })
    expect(byTest('you-leaderboard')?.textContent).toContain('2nd of 2')
    click(byTest('you-leaderboard'))
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.friends)
    expect(byTest('board-me')?.querySelector('.tc-rank')?.textContent).toBe('2')
    await flush()
    expect(top().querySelector('[data-testid="board-tabs"] [aria-checked="true"]')?.textContent).toBe(CARDS_COPY.friends)
  })

  it('a first open on this device keeps the Leaderboard and Find readers rows in place while the profile is on its way', async () => {
    boards = { friends: friendsBoard, everyone: everyoneBoard }
    profile = ownProfile({ onLeaderboard: true })
    let release: () => void = () => {}
    profileGate = new Promise<void>(resolve => { release = resolve })
    // An account this page has not shown yet (nothing in memory or on the device for it).
    await openAccountCards({ dark: false, session: { ...session, userId: '99999999-9999-4999-8999-999999999999' }, social: true })
    await flush()
    const order = () => [...top().querySelectorAll<HTMLElement>('.tc-body [data-testid]')].map(node => node.dataset.testid!.replace(/-skeleton$/, '')).filter(id => /^you-(reading|leaderboard|find|settings)$/.test(id))
    expect(byTest('you-leaderboard-skeleton')).toBeTruthy()
    expect(byTest('you-find-skeleton')).toBeTruthy()
    const before = order()
    release()
    await flush()
    expect(byTest('you-leaderboard-skeleton')).toBeNull()
    expect(order()).toEqual(before)
  })

  it('the You card ranks on the tab the Leaderboard opens on: it changes with the tab, and a reopened You card shows that rank first', async () => {
    boards = { friends: friendsBoard, everyone: everyoneBoard }
    profile = ownProfile({ onLeaderboard: true })
    await open('you')
    expect(byTest('you-leaderboard')?.textContent).toContain('2nd of 2')
    click(byTest('you-leaderboard'))
    await flush()
    click(top().querySelector('[data-testid="board-tabs"] [data-value="everyone"]'))
    await flush()
    click(byTest('board-me'))
    await flush()
    expect(top().dataset.card).toBe('you')
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 3')
    closeAccountCards()
    // Reopened: the first frame already says the Everyone rank (no "2nd of 2" first).
    await openAccountCards({ dark: false, session, social: true })
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 3')
    await flush()
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 3')
  })
})

describe('a reader\'s profile shows at once and answers a tap at once (21 October 2026)', () => {
  const entry = (rank: number, name: string, seconds: number, me = false, handle?: string) => ({ rank, name, picture: pic(name[0]), seconds, duration: '', me, ...(handle ? { handle } : {}) })
  const board = { ...FRIENDS_BOARD, everyoneOpen: false, friends: 1, total: 2, entries: [entry(1, 'Mette', 45240, false, 'mette'), entry(2, 'You', 60, true)] }
  const mette = () => ({
    handle: 'mette', name: 'Mette', link: 'tinct.app/@mette', picture: pic('M'), banner: { src: '/b.jpg', private: false }, relation: 'friend', followsYou: true, limited: false,
    time: { last7: '12 h', year: '113 h', last7Seconds: 45240, yearSeconds: 407160 }, readingNow: null, finished: null,
  })

  /** Holds the requests whose path starts with `prefix` until released. */
  function hold(prefix: string): () => void {
    let release: () => void = () => {}
    const gate = new Promise<void>(resolve => { release = resolve })
    const inner = api()
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith(prefix)) await gate
      return inner(input, init)
    }))
    return release
  }

  beforeEach(() => forgetProfiles())

  async function openMette() {
    boards = { friends: board, everyone: null }
    readerProfile = mette()
    await open('you')
    click(byTest('you-leaderboard'))
    await flush()
    click(top().querySelector('[data-testid="board-row"]'))
  }

  it('while it loads: no guessed Follow button (its place kept), no figures (their place kept); then the real ones', async () => {
    await openMette()
    const release = hold('/api/social/profile/')
    await flush()
    // The first fetch went out before the hold: open again with it held.
    top().querySelector<HTMLElement>('[data-testid="card-back"]')!.click()
    forgetProfiles()
    click(top().querySelector('[data-testid="board-row"]'))
    expect(byTest('profile-follow')).toBeNull()
    expect(byTest('profile-follow-pending')?.style.visibility).toBe('hidden')
    expect(byTest('profile-facts-skeleton')).toBeTruthy()
    release()
    await flush()
    expect(byTest('profile-follow')?.textContent).toBe('Friends')
    expect(byTest('profile-facts-skeleton')).toBeNull()
  })

  it('figures as the Leaderboard writes the same reader: "12 h 34", not "12 h"', async () => {
    await openMette()
    await flush()
    const facts = [...top().querySelectorAll('[data-testid="card-facts"] > div')].map(node => node.textContent)
    expect(facts[0]).toBe('12 h 34last 7 days')
    expect(facts[1]).toBe('113 h 06this year')
    top().querySelector<HTMLElement>('[data-testid="card-back"]')!.click()
    await flush()
    expect([...top().querySelectorAll('[data-testid="board-row"] .tc-v')].map(node => node.textContent)).toEqual(['12 h 34'])
  })

  it('opened again on this page: shown at once from memory, then read again behind', async () => {
    await openMette()
    await flush()
    top().querySelector<HTMLElement>('[data-testid="card-back"]')!.click()
    await flush()
    hold('/api/social/profile/')
    click(top().querySelector('[data-testid="board-row"]'))
    // Before any answer: the figures and the button are there.
    expect(byTest('profile-follow')?.textContent).toBe('Friends')
    expect(top().querySelector('[data-testid="card-facts"]')?.textContent).toContain('12 h 34')
  })

  it('Follow and unfollow: the button changes on the tap, before the answer; a refusal puts it back and says so', async () => {
    await openMette()
    await flush()
    const release = hold('/api/social/unfollow')
    click(byTest('profile-follow'))
    // At once: a friend unfollowed still follows you, so the button offers Follow back.
    expect(byTest('profile-follow')?.textContent).toBe('Follow back')
    release()
    await flush()
    // A refusal.
    readerProfile = mette()
    top().querySelector<HTMLElement>('[data-testid="card-back"]')!.click()
    await flush()
    forgetProfiles()
    click(top().querySelector('[data-testid="board-row"]'))
    await flush()
    const inner = api()
    let answer: (value: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith('/api/social/unfollow')) return new Promise<Response>(resolve => { answer = resolve })
      return inner(input, init)
    }))
    click(byTest('profile-follow'))
    expect(byTest('profile-follow')?.textContent).toBe('Follow back')
    answer(Response.json({ error: 'no' }, { status: 500 }))
    await flush()
    expect(byTest('profile-follow')?.textContent).toBe('Friends')
    expect(top().querySelector('.tc-status')?.textContent).toBe(CARDS_COPY.actionFailed)
  })
})
