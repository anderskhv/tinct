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

function api() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : null
    if (init?.method === 'POST' && body) posts.push({ url: url.replace(/\?.*$/, ''), body })
    if (url.startsWith('/api/profile')) {
      if (body) profile = { ...profile, ...body }
      return Response.json({ enabled: true, available: true, profile })
    }
    if (url.startsWith('/api/reading-time')) return Response.json({ enabled: true, rows: [{ day: new Date().toISOString().slice(0, 10), bookId: 'frankenstein', read: 3600, listen: 0 }] })
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
    if (url.startsWith('/api/subscription-info')) return Response.json({ subscription_status: 'active' })
    return Response.json({}, { status: 404 })
  })
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
