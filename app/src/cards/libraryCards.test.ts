// @vitest-environment jsdom
/**
 * The library's picture opens the account cards (Anders, iPhone Safari,
 * 10 October 2026: a tap on it did nothing). The tap is delegated from the
 * document, so it works however late the script runs or the header is drawn
 * again; and the cards open at once from the session stored on the device,
 * even while Supabase's own getSession() is stuck behind a token refresh.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getSession = vi.fn(() => new Promise<never>(() => {}))
vi.mock('../services/supabase', () => ({
  supabase: { auth: { storageKey: 'sb-test-auth-token', getSession: () => getSession(), signOut: vi.fn() } },
}))

const tracked: Array<[string, Record<string, unknown> | undefined]> = []
vi.mock('../utils/funnel', () => ({ trackFunnel: (name: string, props?: Record<string, unknown>) => { tracked.push([name, props]) } }))

const USER = '11111111-1111-4111-8111-111111111111'

function storeSession(expiresInSeconds: number) {
  localStorage.setItem('sb-test-auth-token', JSON.stringify({
    access_token: 'stored-token', refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    user: { id: USER, email: 'anders@example.com', user_metadata: { full_name: 'Anders' } },
  }))
}

beforeEach(() => {
  localStorage.clear()
  tracked.length = 0
  document.documentElement.className = ''
  document.body.innerHTML = '<header id="header"><nav><button id="search-toggle"></button><button id="sign-in" class="sign-in">Account</button></nav></header>'
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(async () => {
  const { closeAccountCards } = await import('./openCards')
  closeAccountCards()
  vi.unstubAllGlobals()
})

describe('the library picture', () => {
  it('opens the cards at once from the stored session, while getSession never answers', async () => {
    storeSession(3600)
    const { openAccountCards } = await import('./openCards')
    let settled = false
    const opened = openAccountCards({ dark: true }).then(value => { settled = true; return value })
    await Promise.resolve(); await Promise.resolve()
    expect(settled).toBe(true)
    expect(await opened).toBe(true)
    expect(document.querySelector('.tc-card[data-card="you"]')).toBeTruthy()
    // The stored token is the one used for the data.
    const calls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.some(call => new Headers((call[1] as RequestInit | undefined)?.headers).get('Authorization') === 'Bearer stored-token')).toBe(true)
  })

  it('with an expired stored token: opens at once, and loads only with the token Supabase hands back', async () => {
    storeSession(-60)
    let answer: (value: unknown) => void = () => {}
    getSession.mockImplementationOnce(() => new Promise(resolve => { answer = resolve }) as never)
    const { openAccountCards } = await import('./openCards')
    const opened = openAccountCards({ dark: true })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.querySelector('.tc-card[data-card="you"]')).toBeTruthy()
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0)
    answer({ data: { session: { access_token: 'fresh-token', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: USER, email: 'anders@example.com', user_metadata: {} } } } })
    expect(await opened).toBe(true)
    await new Promise(resolve => setTimeout(resolve, 0))
    const calls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    expect(calls.every(call => new Headers((call[1] as RequestInit | undefined)?.headers).get('Authorization') !== 'Bearer stored-token')).toBe(true)
  })

  it('a tap on the account button opens the cards when signed in, even if the header was drawn again after the script loaded', async () => {
    storeSession(3600)
    await import('./libraryCards')
    document.documentElement.classList.add('signed-in')
    // The library draws its header again: a new #sign-in, without the picture class.
    document.querySelector('nav')!.innerHTML = '<button id="sign-in" class="sign-in"><span class="tinct-avatar"></span></button>'
    let libraryHandler = 0
    document.getElementById('sign-in')!.onclick = () => { libraryHandler += 1 }
    document.querySelector<HTMLElement>('#sign-in .tinct-avatar')!.click()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.querySelector('.tc-card[data-card="you"]')).toBeTruthy()
    // The library's own handler (the old account page) does not run.
    expect(libraryHandler).toBe(0)
  })

  it('the tap still opens the cards when the page lost its signed-in class but this browser holds the session', async () => {
    vi.resetModules()
    storeSession(3600)
    await import('./libraryCards')
    document.documentElement.classList.remove('signed-in')
    document.querySelector('nav')!.innerHTML = '<button id="sign-in" class="sign-in cards-you"><span class="tinct-avatar"></span></button>'
    let libraryHandler = 0
    document.getElementById('sign-in')!.onclick = () => { libraryHandler += 1 }
    document.querySelector<HTMLElement>('#sign-in .tinct-avatar')!.click()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.querySelector('.tc-card[data-card="you"]')).toBeTruthy()
    expect(libraryHandler).toBe(0)
  })

  it('reports an open that cannot settle, and never sends a browser that holds a session to sign in', async () => {
    vi.useFakeTimers()
    try {
      vi.resetModules()
      // A session this browser holds but the cards cannot read (malformed), and a getSession that never answers.
      localStorage.setItem('sb-test-auth-token', '{broken')
      document.documentElement.classList.add('signed-in')
      const assign = vi.fn()
      vi.stubGlobal('location', { ...location, assign, href: 'https://tinct.app/library', search: '', pathname: '/library', origin: 'https://tinct.app' })
      const { accountButtonTap } = await import('./libraryCards')
      expect(accountButtonTap(new MouseEvent('click'))).toBe(false)
      document.querySelector('nav')!.innerHTML = '<button id="sign-in" class="sign-in cards-you"><span class="tinct-avatar"></span></button>'
      document.querySelector<HTMLElement>('#sign-in .tinct-avatar')!.click()
      await vi.advanceTimersByTimeAsync(2600)
      // (Each import in this file binds its own document listener, so one tap may open more than once here.)
      const phases = () => [...new Set(tracked.map(([name, props]) => `${name}:${String(props?.phase)}`))]
      expect(phases()).toEqual(['cards_open_stuck:await'])
      await vi.advanceTimersByTimeAsync(4100)
      expect(phases()).toEqual(['cards_open_stuck:await', 'cards_open_stuck:no-session'])
      expect(tracked.find(([, props]) => props?.phase === 'no-session')?.[1]).toMatchObject({ key: true, raw: true, parsed: false, fresh: false, native: false })
      expect(assign).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('finds the session under the default key when the client does not name one', async () => {
    vi.resetModules()
    const { supabase } = await import('../services/supabase')
    const auth = supabase!.auth as unknown as { storageKey?: string }
    const key = auth.storageKey
    delete auth.storageKey
    try {
      localStorage.setItem('sb-abc123-auth-token', JSON.stringify({ access_token: 't', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: USER, email: 'a@example.com' } }))
      const { storedSession, sessionStorageState } = await import('./openCards')
      expect(storedSession()?.session.userId).toBe(USER)
      expect(sessionStorageState()).toEqual({ key: true, raw: true, parsed: true, fresh: true, native: false })
    } finally {
      auth.storageKey = key
    }
  })

  it('signed out, the tap is the library\'s (sign in)', async () => {
    const { accountButtonTap } = await import('./libraryCards')
    let libraryHandler = 0
    document.getElementById('sign-in')!.onclick = () => { libraryHandler += 1 }
    document.getElementById('sign-in')!.click()
    expect(libraryHandler).toBe(1)
    expect(accountButtonTap(new MouseEvent('click'))).toBe(false)
    expect(document.querySelector('.tcards')).toBeNull()
  })

  it('paints the picture at once from the stored session and this device\'s last profile, never a stand-in letter', async () => {
    vi.resetModules()
    getSession.mockClear()
    storeSession(3600)
    // No cached profile yet: an empty disc, not "R" or "A".
    document.documentElement.classList.add('signed-in')
    await import('./libraryCards')
    await Promise.resolve()
    const disc = document.querySelector<HTMLElement>('#sign-in.cards-you .tinct-avatar')
    expect(disc).toBeTruthy()
    expect(disc!.textContent).toBe('')

    vi.resetModules()
    document.body.innerHTML = '<header id="header"><nav><button id="search-toggle"></button><button id="sign-in" class="sign-in">Account</button></nav></header>'
    const { writeCardsCache } = await import('./cardsCache')
    writeCardsCache(USER, {
      profile: { name: 'Anders K. Hvelplund', handle: 'anders', picture: { kind: 'cover', value: 'frankenstein' } } as never,
      reading: null, rank: null, plan: null, billing: false,
    })
    await import('./libraryCards')
    await Promise.resolve()
    const picture = document.querySelector<HTMLElement>('#sign-in.cards-you .tinct-avatar')
    expect(picture?.dataset.kind).not.toBe('initial')
    expect(picture?.textContent).toBe('')
    // getSession never answered: none of this waited on it.
    expect(getSession).not.toHaveBeenCalled()
  })
})

describe('the library picture from this device\'s copy (Anders, 19 October 2026)', () => {
  const SRC = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='
  const profile = (picture: Record<string, unknown>) => ({ enabled: true, available: true, profile: { handle: 'anders', name: 'Anders', picture, background: { kind: 'library', value: null, url: null }, shouldPrompt: false, needsSetup: false } })
  async function startWith(answer: unknown) {
    vi.resetModules()
    document.documentElement.classList.add('signed-in')
    const requests: string[] = []
    let respond: () => void = () => {}
    const answered = new Promise<void>(resolve => { respond = resolve })
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      requests.push(String(url))
      if (!String(url).startsWith('/api/profile')) return new Promise<Response>(() => {})
      return answered.then(() => new Response(JSON.stringify(answer), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    }))
    await import('./libraryCards')
    await Promise.resolve()
    return { requests, respond, disc: () => document.querySelector<HTMLElement>('#sign-in.cards-you .tinct-avatar') }
  }
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0)) }

  it('paints the kept copy before the profile answers, and keeps it when the picture is the same', async () => {
    storeSession(3600)
    const { avatarSignature, headerPictureView, writeAvatarCache } = await import('./avatarCache')
    const painting = { kind: 'image' as const, src: '/lab/library_2/assets/meditations.jpg', pos: '50% 34%', cover: true }
    writeAvatarCache(USER, { sig: avatarSignature(headerPictureView(painting))!, src: SRC })
    const run = await startWith(profile({ kind: 'set', value: 'stoic', url: null }))
    expect(run.disc()?.style.backgroundImage).toBe(`url("${SRC}")`)
    run.respond()
    await settle()
    expect(run.requests.some(url => url.startsWith('/api/profile'))).toBe(true)
    // The same picture: the copy stays, and the painting is not downloaded at all.
    expect(run.disc()?.style.backgroundImage).toBe(`url("${SRC}")`)
  })

  it('a picture changed elsewhere replaces the copy, from the painting\'s small file', async () => {
    storeSession(3600)
    const { writeAvatarCache } = await import('./avatarCache')
    writeAvatarCache(USER, { sig: 'an older picture', src: SRC })
    const run = await startWith(profile({ kind: 'set', value: 'at-sea', url: null }))
    expect(run.disc()?.style.backgroundImage).toBe(`url("${SRC}")`)
    run.respond()
    await settle()
    expect(run.disc()?.style.backgroundImage).toBe('url("/lab/library_2/assets/covers/odyssey-480.webp")')
    expect(document.querySelectorAll('#sign-in .tinct-avatar')).toHaveLength(1)
  })

  it('never paints another account\'s copy, and a profile with no picture drops this one\'s', async () => {
    storeSession(3600)
    const { readAvatarCache, writeAvatarCache } = await import('./avatarCache')
    writeAvatarCache('22222222-2222-4222-8222-222222222222', { sig: 's', src: SRC })
    writeAvatarCache(USER, { sig: 's', src: SRC.replace('==', 'AA') })
    const run = await startWith(profile({ kind: 'initial', value: null, url: null }))
    expect(run.disc()?.style.backgroundImage).not.toContain(SRC)
    run.respond()
    await settle()
    expect(run.disc()?.dataset.kind).toBe('initial')
    expect(readAvatarCache(USER)).toBeNull()
  })
})

describe('the profile step for an older account (Anders, 15 October 2026)', () => {
  it('once, for a profile never set up that still has the neutral name', async () => {
    const { legacyProfileStepDue, legacyProfileStepUrl, LEGACY_SETUP_KEY_PREFIX } = await import('./libraryCards')
    expect(legacyProfileStepDue({ needsSetup: true, name: 'Reader' }, USER)).toBe(true)
    // A name the reader has, a profile already set up, or no account: never.
    expect(legacyProfileStepDue({ needsSetup: true, name: 'Mette' }, USER)).toBe(false)
    expect(legacyProfileStepDue({ needsSetup: false, name: 'Reader' }, USER)).toBe(false)
    expect(legacyProfileStepDue({ needsSetup: true, name: 'Reader' }, null)).toBe(false)
    // Offered on this device already: not again.
    localStorage.setItem(LEGACY_SETUP_KEY_PREFIX + USER, '1')
    expect(legacyProfileStepDue({ needsSetup: true, name: 'Reader' }, USER)).toBe(false)
    // The sign-up profile step itself, back where the reader was.
    expect(legacyProfileStepUrl('/library?card=you')).toBe('/sign-in?mode=profile&returnTo=%2Flibrary%3Fcard%3Dyou')
  })

  it('the device mark is reader data: sign-out wipes it with the rest', async () => {
    const { LEGACY_SETUP_KEY_PREFIX } = await import('./libraryCards')
    const { clearLocalUserData } = await import('../services/storage')
    localStorage.setItem(LEGACY_SETUP_KEY_PREFIX + USER, '1')
    clearLocalUserData()
    expect(localStorage.getItem(LEGACY_SETUP_KEY_PREFIX + USER)).toBeNull()
  })
})

describe('the findable-profiles notice in the library (Anders, 19 October 2026)', () => {
  const answer = (visibility: string) => ({ enabled: true, available: true, profile: { handle: 'anders', name: 'Anders', visibility, picture: { kind: 'initial', value: null, url: null }, background: { kind: 'library', value: null, url: null }, shouldPrompt: false, needsSetup: false } })
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0)) }
  async function visit(visibility: string, friendsOn = true) {
    vi.resetModules()
    document.head.innerHTML = friendsOn ? '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">' : ''
    document.documentElement.classList.add('signed-in')
    vi.stubGlobal('fetch', vi.fn((url: string) => String(url).startsWith('/api/profile')
      ? Promise.resolve(new Response(JSON.stringify(answer(visibility)), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      : new Promise<Response>(() => {})))
    await import('./libraryCards')
    await settle()
    return document.querySelector<HTMLElement>('[data-testid="findable-notice"]')
  }
  afterEach(() => { document.head.innerHTML = '' })

  it('shows once to a Friends profile, in the prompt\'s style, until dismissed', async () => {
    storeSession(3600)
    const notice = await visit('friends')
    expect(notice?.classList.contains('social-prompt')).toBe(true)
    expect(notice?.textContent).toContain('Readers can now find you by name and picture. Your reading stays private until you accept a follower. Change it in Settings.')
    expect(notice?.querySelector('.go')?.textContent).toBe('Settings')
    notice!.querySelector<HTMLElement>('[data-testid="findable-notice-dismiss"]')!.click()
    expect(document.querySelector('[data-testid="findable-notice"]')).toBeNull()
    expect(localStorage.getItem(`tinct:findable-notice-dismissed:${USER}`)).toBe('1')
    // The next visit: not again.
    document.body.innerHTML = '<header id="header"><nav><button id="sign-in" class="sign-in">Account</button></nav></header>'
    expect(await visit('friends')).toBeNull()
  })

  it('never for Only me, nor while Friends is switched off', async () => {
    storeSession(3600)
    expect(await visit('only_me')).toBeNull()
    expect(await visit('friends', false)).toBeNull()
    expect(localStorage.getItem(`tinct:findable-notice-dismissed:${USER}`)).toBeNull()
  })
})
