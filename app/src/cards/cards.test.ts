// @vitest-environment jsdom
/**
 * The account cards in the DOM (CARDS-BRIEF.md): open, push, back, close-all
 * over a page that is never touched; Settings posts at once and disables the
 * Leaderboard switch; Find readers and a reader's profile follow the friends
 * rules; and the brief's type rules hold (no monospace, no capitals-only).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import cardsCss from './cards.css?raw'
import { accountCardsOpen, closeAccountCards, openAccountCards } from './openCards'
import { CardStack } from './cardStack'
import { accountCard, settingsCard, type CardsEnv } from './cardViews'
import { CARDS_COPY } from './cardsCopy'
import { ACCOUNT_DELETE_CONFIRM, ACCOUNT_DELETE_PATH } from '../worker/routes/accountDelete'
import { readingFigures } from './cardsFormat'
import { CARDS_CACHE_PREFIX, readCardsCache, writeCardsCache } from './cardsCache'
import { wipeLabDeviceUserData } from '../lab/labSignOut'
import { readingTimeStats } from '../readingTime/model'

// The photo resize needs a real canvas; the cards' upload path is what is tested here.
vi.mock('../social/socialClient', async importOriginal => ({
  ...(await importOriginal<typeof import('../social/socialClient')>()),
  resizePhoto: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })),
}))

const session = { token: 'tok', userId: '11111111-1111-4111-8111-111111111111', email: 'anders@example.com', accountName: 'Anders' }

function ownProfile(overrides: Record<string, unknown> = {}) {
  return {
    handle: 'anders', link: 'tinct.app/@anders', name: 'Anders',
    picture: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    background: { kind: 'set', value: 'stoic', url: null, review: 'none' },
    visibility: 'friends', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: true,
    newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, emailConfirmed: true, emailOptIn: false, googlePhoto: false,
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
    if (url.startsWith('/api/social/profile/')) return readerProfile ? Response.json({ profile: readerProfile }) : Response.json({ error: 'Not found' }, { status: 404 })
    if (url.startsWith('/api/social/board')) return Response.json({ tab: 'friends', total: 1, meShown: true, me: null, entries: [{ rank: 1, name: 'Anders', picture: pic('A'), seconds: 3600, duration: '1 h', me: true }] })
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
  localStorage.clear()
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
      expect(byTest('find-results')?.textContent).toContain('No public reader by that name.')
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
    writeCardsCache(userId, { profile: ownProfile({ name: 'Anders H' }) as never, reading: { stats: cachedStats, readingNow: [], finished: [] }, rank: '3rd of 5', plan: 'premium', billing: false })
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    expect(top().querySelector('.tc-nm')?.textContent).toBe('Anders HPremium')
    expect(byTest('you-reading')?.textContent).toContain('6 h 10 m')
    expect(byTest('you-leaderboard')?.textContent).toContain('3rd of 5')
  })

  it('asks for the profile, the reading time and the rank at once', async () => {
    const userId = '66666666-6666-4666-8666-666666666666'
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => { calls.push(String(input)); return new Promise<Response>(() => {}) }))
    expect(await openAccountCards({ session: { ...session, userId }, social: true, dark: false })).toBe(true)
    await flush()
    expect(calls.some(url => url.startsWith('/api/profile'))).toBe(true)
    expect(calls.some(url => url.startsWith('/api/reading-time'))).toBe(true)
    expect(calls.some(url => url.startsWith('/api/social/rank'))).toBe(true)
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
    expect(top().querySelector('.tc-status')?.textContent ?? '').toBe('')
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
