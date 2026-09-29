// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => vi.fn())
vi.mock('./lab/labAuthCompletion', async () => ({
  ...await vi.importActual<typeof import('./lab/labAuthCompletion')>('./lab/labAuthCompletion'),
  navigateAfterAuth: navigation,
}))
const auth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(async () => ({ error: null })),
  getSession: vi.fn(async () => ({ data: { session: { user: { id: 'user-a', email: 'reader@example.com' } } } })),
  signInWithOAuth: vi.fn(async (_options: unknown) => ({ data: { url: null, provider: 'google' }, error: null as { message: string } | null })),
}
vi.mock('./services/supabase', () => ({ supabase: { auth }, isSupabaseConfigured: () => true }))

function mountSignInShell() {
  const html = readFileSync(resolve(__dirname, '../public/lab/sign-in/index.html'), 'utf8')
  const shell = new DOMParser().parseFromString(html, 'text/html')
  shell.querySelectorAll('script').forEach(script => script.remove())
  document.body.innerHTML = shell.body.innerHTML
}

async function flush() {
  for (let i = 0; i < 4; i++) await Promise.resolve()
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.resetModules()
  navigation.mockClear()
  auth.signUp.mockReset()
  auth.signInWithPassword.mockReset()
  auth.updateUser.mockReset()
  auth.signOut.mockClear()
  auth.getSession.mockClear()
  auth.signInWithOAuth.mockClear()
  auth.signInWithOAuth.mockImplementation(async () => ({ data: { url: null, provider: 'google' }, error: null }))
  auth.getSession.mockImplementation(async () => ({ data: { session: { user: { id: 'user-a', email: 'reader@example.com' } } } }))
})
afterEach(() => {
  document.body.innerHTML = ''
  localStorage.clear()
  vi.restoreAllMocks()
  history.replaceState(null, '', '/')
})

describe('lab sign-in runtime', () => {
  it('honours a reader returnTo (with its query) on the back link and in the account mode URL', async () => {
    history.replaceState(null, '', '/lab/sign-in?mode=account&returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')!
    expect(root.dataset.ready).toBe('true')
    expect(root.dataset.mode).toBe('account')
    expect(document.querySelector<HTMLAnchorElement>('[data-auth-back]')!.getAttribute('href')).toBe('/lab/reader?voice=v2')
    expect(new URLSearchParams(location.search).get('returnTo')).toBe('/lab/reader?voice=v2')
  })

  it('falls back to the library for a foreign returnTo', async () => {
    history.replaceState(null, '', '/lab/sign-in?returnTo=https%3A%2F%2Fevil.example%2Flab%2Freader')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(document.querySelector<HTMLAnchorElement>('[data-auth-back]')!.getAttribute('href')).toBe('/lab/library')
  })

  it('wipes this reader\'s device data on sign out and keeps device-level preferences', async () => {
    history.replaceState(null, '', '/lab/sign-in?mode=account&returnTo=%2Flab%2Fdesktop')
    localStorage.setItem('tinct-lab-position', '{"books":{}}')
    localStorage.setItem('tinct:reading-memory', '{"owner":"user-a"}')
    localStorage.setItem('tinct:chat-history:lab', '[]')
    localStorage.setItem('tinct-lab-highlights', '[]')
    localStorage.setItem('tinct-lab-prefs', '{"version":2}')
    localStorage.setItem('tinct-lab-device-id', 'device-1')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    // jsdom's Location is unforgeable, so the `location.assign(returnTo)` that
    // follows is not observable here (jsdom logs "Not implemented: navigation").
    // The returnTo it navigates to is the same value the back link carries.
    expect(document.querySelector<HTMLAnchorElement>('[data-auth-back]')!.getAttribute('href')).toBe('/lab/desktop')
    document.querySelector<HTMLButtonElement>('[data-sign-out]')!.click()
    await flush()
    await flush()
    expect(auth.signOut).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('tinct-lab-position')).toBeNull()
    expect(localStorage.getItem('tinct:reading-memory')).toBeNull()
    expect(localStorage.getItem('tinct:chat-history:lab')).toBeNull()
    expect(localStorage.getItem('tinct-lab-highlights')).toBeNull()
    expect(localStorage.getItem('tinct-lab-prefs')).toBe('{"version":2}')
    expect(localStorage.getItem('tinct-lab-device-id')).toBe('device-1')
  })
})

describe('lab sign-in providers', () => {
  const providerButtons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-oauth]')]

  async function mount(search = '') {
    history.replaceState(null, '', `/lab/sign-in${search}`)
    mountSignInShell()
    await import('./labSignIn')
    await flush()
  }

  it('renders Google above the email form, in that order, in sign-in mode', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flab%2Flibrary')
    const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')!
    expect(root.dataset.mode).toBe('signin')
    expect(providerButtons().filter(button => !button.hidden).map(button => button.dataset.oauth)).toEqual(['google'])
    expect(providerButtons().filter(button => !button.hidden).map(button => button.textContent?.trim())).toEqual([
      'Continue with Google',
    ])
    // The GitHub button keeps its markup but is hidden by the capability list.
    expect(providerButtons().filter(button => button.hidden).map(button => button.dataset.oauth)).toEqual(['apple', 'github'])
    // Above the email form: the provider block precedes the email field.
    const block = document.querySelector('[data-auth-providers]')!
    const email = document.querySelector('[data-email-field]')!
    expect(block.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders the same Google button in create-account mode', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?mode=create&returnTo=%2Flab%2Flibrary')
    expect(document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode).toBe('create')
    expect(providerButtons().filter(button => !button.hidden).map(button => button.dataset.oauth)).toEqual(['google'])
  })

  it('sends each provider through Supabase OAuth with the reader\'s returnTo', async () => {
    // One mount per provider: a started round-trip leaves the page busy (it
    // is about to navigate), so the other buttons are correctly disabled.
    for (const provider of ['google']) {
      vi.resetModules()
      document.body.innerHTML = ''
      auth.signInWithOAuth.mockClear()
      auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
      await mount('?returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
      document.querySelector<HTMLButtonElement>(`[data-oauth="${provider}"]`)!.click()
      await flush()
      expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1)
      expect(auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: { redirectTo: `${location.origin}/lab/sign-in?callback=oauth&returnTo=%2Flab%2Freader%3Fvoice%3Dv2` },
      })
    }
  })

  it('falls back to the library for a foreign returnTo on the provider round-trip too', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=https%3A%2F%2Fevil.example%2Fsteal')
    document.querySelector<HTMLButtonElement>('[data-oauth="google"]')!.click()
    await flush()
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${location.origin}/lab/sign-in?callback=oauth&returnTo=%2Flab%2Flibrary` },
    })
  })

  it('hides a provider that is taken out of the capability list', async () => {
    vi.resetModules()
    document.body.innerHTML = ''
    vi.doMock('./lab/labSignInProviders', async () => {
      const actual = await vi.importActual<typeof import('./lab/labSignInProviders')>('./lab/labSignInProviders')
      return { ...actual, LAB_SIGN_IN_PROVIDERS: ['google', 'github'] as const }
    })
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flab%2Flibrary')
    expect(providerButtons().filter(button => !button.hidden).map(button => button.dataset.oauth)).toEqual(['google', 'github'])
    document.querySelector<HTMLButtonElement>('[data-oauth="apple"]')!.click()
    await flush()
    expect(auth.signInWithOAuth).not.toHaveBeenCalled()
    vi.doUnmock('./lab/labSignInProviders')
  })

  it('reports a provider that is not enabled when the round-trip comes back, and cleans the URL', async () => {
    const description = 'Unsupported provider: provider is not enabled'
    sessionStorage.setItem('tinct:lab-oauth-provider', 'apple')
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount(`?returnTo=%2Flab%2Flibrary#error=server_error&error_code=validation_failed&error_description=${encodeURIComponent(description)}`)
    const status = document.querySelector<HTMLElement>('[data-auth-status]')!
    expect(status.hidden).toBe(false)
    expect(status.dataset.tone).toBe('error')
    expect(status.textContent).toBe('Apple sign-in isn’t available yet. Use your email below, or another provider.')
    expect(location.hash).toBe('')
    expect(sessionStorage.getItem('tinct:lab-oauth-provider')).toBeNull()
    // Still a usable sign-in form, not a blank redirect.
    expect(document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode).toBe('signin')
    expect(providerButtons().every(button => button.disabled === false)).toBe(true)
  })

  it('passes the raw description through when it does not know which provider was tried', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flab%2Flibrary&error=access_denied')
    expect(document.querySelector<HTMLElement>('[data-auth-status]')!.textContent).toBe('access_denied')
    expect(new URLSearchParams(location.search).has('error')).toBe(false)
    expect(new URLSearchParams(location.search).get('returnTo')).toBe('/lab/library')
  })

  it('shows the error notice when signInWithOAuth itself fails, and stays usable', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flab%2Flibrary')
    auth.signInWithOAuth.mockImplementationOnce(async () => ({
      data: { url: null, provider: 'apple' },
      error: { message: 'Unsupported provider: provider is not enabled' },
    }))
    document.querySelector<HTMLButtonElement>('[data-oauth="google"]')!.click()
    await flush()
    const status = document.querySelector<HTMLElement>('[data-auth-status]')!
    expect(status.hidden).toBe(false)
    expect(status.dataset.tone).toBe('error')
    expect(status.textContent).toBe('Google sign-in isn’t available yet. Use your email below, or another provider.')
    expect(providerButtons().every(button => button.disabled === false)).toBe(true)
  })
})

/**
 * Signing in with a second provider makes a second account. Every lab
 * sign-in — email and each provider round-trip — comes back through this
 * page, so it is where a changed identity is caught before the new account
 * reads anything (2026-09-07).
 */
describe('lab sign-in: device identity', () => {
  it('wipes the device when a different account signs in without a sign-out', async () => {
    localStorage.setItem('tinct:lab-device-user', 'user-a')
    localStorage.setItem('tinct-lab-position', 'user a place')
    localStorage.setItem('tinct:chat-history:lab', 'user a chat')
    auth.getSession.mockImplementation(async () => ({ data: { session: { user: { id: 'user-github', email: 'reader@example.com' } } } }))
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(localStorage.getItem('tinct-lab-position')).toBeNull()
    expect(localStorage.getItem('tinct:chat-history:lab')).toBeNull()
    expect(localStorage.getItem('tinct:lab-device-user')).toBe('user-github')
  })

  it('a first sign-in keeps what the reader read signed out', async () => {
    localStorage.setItem('tinct-lab-position', 'guest place')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(localStorage.getItem('tinct-lab-position')).toBe('guest place')
    expect(localStorage.getItem('tinct:lab-device-user')).toBe('user-a')
  })

  it('the same account returning is left alone', async () => {
    localStorage.setItem('tinct:lab-device-user', 'user-a')
    localStorage.setItem('tinct-lab-position', 'their place')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(localStorage.getItem('tinct-lab-position')).toBe('their place')
  })
})

describe('completed authentication', () => {
  const newUser = { id: 'new-reader', email: 'new@example.com', created_at: '2026-09-29T17:00:00Z', last_sign_in_at: '2026-09-29T17:00:01Z' }
  const session = (user = newUser) => ({ access_token: 'test-token', user })
  const ready = async (query: string, user = newUser) => {
    auth.getSession.mockResolvedValueOnce({ data: { session: session(user) } } as never)
    history.replaceState(null, '', '/lab/sign-in' + query)
    mountSignInShell()
    await import('./labSignIn')
    await flush()
  }
  const mode = () => document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode

  it('welcomes a new Google reader and preserves their exact book return', async () => {
    await ready('?callback=oauth&returnTo=%2Freader%3Fbook%3Dbible%23p12')
    expect(mode()).toBe('welcome')
    expect(navigation).not.toHaveBeenCalled()
    expect(document.querySelector('[data-mode-copy="welcome"]')?.textContent).toContain('Welcome to Tinct.')
    document.querySelector<HTMLButtonElement>('[data-mode-copy="welcome"] [data-return]')!.click()
    expect(navigation).toHaveBeenCalledWith('/reader?book=bible#p12')
    expect(location.search).not.toContain('callback')
  })

  it('returns an existing Google reader immediately without a welcome or account stop', async () => {
    await ready('?callback=oauth&returnTo=%2Freader%3Fbook%3Dbible', { ...newUser, created_at: '2026-01-01T00:00:00Z' })
    expect(navigation).toHaveBeenCalledWith('/reader?book=bible')
    expect(mode()).not.toBe('welcome')
  })

  it('welcomes an email confirmation even when confirmed days after signup', async () => {
    await ready('?callback=signup&returnTo=%2Flibrary', { ...newUser, created_at: '2026-09-20T00:00:00Z' })
    expect(mode()).toBe('welcome')
    expect(navigation).not.toHaveBeenCalled()
  })

  it('leaves account settings and password recovery available', async () => {
    await ready('?mode=reset&callback=oauth&returnTo=%2Freader')
    expect(mode()).toBe('reset')
    expect(navigation).not.toHaveBeenCalled()
  })

  it('does not show a welcome to a signed-out reader who edits the URL', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    history.replaceState(null, '', '/lab/sign-in?mode=welcome')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(mode()).toBe('signin')
  })

  it('reports a failed callback instead of silently continuing an old account', async () => {
    await ready('?callback=oauth&error=access_denied')
    expect(mode()).toBe('signin')
    expect(navigation).not.toHaveBeenCalled()
    expect(document.querySelector('[data-auth-status]')?.textContent).toBe('access_denied')
  })

  it('welcomes immediate email signup and asks for confirmation when needed', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    history.replaceState(null, '', '/lab/sign-in?mode=create&returnTo=%2Freader%3Fbook%3Dbible')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    auth.signUp.mockResolvedValueOnce({ data: { session: null }, error: null })
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(document.querySelector('[data-auth-status]')?.textContent).toMatch(/confirmation link/)
    expect(navigation).not.toHaveBeenCalled()
    expect(auth.signUp.mock.calls[0][0].options.emailRedirectTo).toContain('callback=signup')
    auth.signUp.mockResolvedValueOnce({ data: { session: session() }, error: null })
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(mode()).toBe('welcome')
  })
})
