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
  signInWithOtp: vi.fn(async (_options: unknown) => ({ data: {}, error: null as unknown })),
  verifyOtp: vi.fn(async (_options: unknown) => ({ data: { session: null as unknown }, error: null as unknown })),
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
  auth.signInWithOtp.mockReset(); auth.signInWithOtp.mockImplementation(async () => ({ data: {}, error: null }))
  auth.verifyOtp.mockReset()
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
  it('is not ready until the e-ink stylesheet has loaded', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    history.replaceState(null, '', '/sign-in?eink=1')
    mountSignInShell()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/lab/display-profile.css'
    link.dataset.displayProfile = ''
    document.head.append(link)
    try {
      await import('./labSignIn')
      await flush()
      const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')!
      expect(root.dataset.mode).toBe('signin')
      expect(root.dataset.ready).toBe('false')
      link.dispatchEvent(new Event('load'))
      await flush()
      expect(root.dataset.ready).toBe('true')
    } finally {
      link.remove()
    }
  })

  it('sends a signed-in reader on the old account link to the Account card over the page they came from', async () => {
    history.replaceState(null, '', '/sign-in?mode=account&returnTo=%2Freader%3Fvoice%3Dv2')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(navigation).toHaveBeenCalledWith('/reader?voice=v2&card=account', true)
  })

  it('sends a signed-in reader on a plain sign-in link to the You card', async () => {
    history.replaceState(null, '', '/sign-in?returnTo=%2Freader')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(navigation).toHaveBeenCalledWith('/reader?card=you', true)
  })

  it('signs a signed-out reader in first, then returns to the Account card', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    history.replaceState(null, '', '/sign-in?mode=account&returnTo=%2Freader%3Fvoice%3Dv2')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')!
    expect(root.dataset.ready).toBe('true')
    expect(root.dataset.mode).toBe('signin')
    expect(new URLSearchParams(location.search).get('returnTo')).toBe('/reader?voice=v2&card=account')
    expect(document.querySelector('[data-mode-copy="account"]')).toBeNull()
  })

  it('falls back to the library for a foreign returnTo', async () => {
    history.replaceState(null, '', '/sign-in?returnTo=https%3A%2F%2Fevil.example%2Freader')
    mountSignInShell()
    await import('./labSignIn')
    await flush()
    expect(document.querySelector<HTMLAnchorElement>('[data-auth-back]')!.getAttribute('href')).toBe('/library')
  })
})

describe('lab sign-in providers', () => {
  const providerButtons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-oauth]')]

  async function mount(search = '') {
    history.replaceState(null, '', `/sign-in${search}`)
    mountSignInShell()
    await import('./labSignIn')
    await flush()
  }

  it('renders Google above the email form, in that order, in sign-in mode', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flibrary')
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

  it('an old create-account link opens the same sheet: Google, or an email code (onboarding v3)', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?mode=create&returnTo=%2Flibrary')
    expect(document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode).toBe('signin')
    expect(providerButtons().filter(button => !button.hidden).map(button => button.dataset.oauth)).toEqual(['google'])
    expect(document.querySelector<HTMLElement>('[data-password-field]')!.hidden).toBe(true)
    expect(document.querySelector('[data-auth-submit] [data-mode-copy="signin"]')!.textContent).toBe('Continue with email')
  })

  it('names the Terms and the Privacy notice for every way in, Google included (scan 2 Nov 2026)', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flibrary')
    const legal = document.querySelector<HTMLElement>('[data-auth-legal]')!
    expect(legal.hidden).toBe(false)
    expect(legal.textContent).toBe('By continuing you accept the Terms and confirm you’ve read the Privacy notice.')
    expect([...legal.querySelectorAll('a')].map(a => [a.textContent, a.getAttribute('href')])).toEqual([['Terms', '/terms'], ['Privacy notice', '/privacy']])
    expect(legal.querySelector('input')).toBeNull()
    expect(document.querySelector('[data-auth-providers]')!.compareDocumentPosition(legal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.querySelector('[name=emailOptIn]')).toBeNull()
  })

  it('sends each provider through Supabase OAuth with the reader\'s returnTo', async () => {
    // One mount per provider: a started round-trip leaves the page busy (it
    // is about to navigate), so the other buttons are correctly disabled.
    for (const provider of ['google']) {
      vi.resetModules()
      document.body.innerHTML = ''
      auth.signInWithOAuth.mockClear()
      auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
      await mount('?returnTo=%2Freader%3Fvoice%3Dv2')
      document.querySelector<HTMLButtonElement>(`[data-oauth="${provider}"]`)!.click()
      await flush()
      expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1)
      expect(auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: { redirectTo: `${location.origin}/sign-in?callback=oauth&returnTo=%2Freader%3Fvoice%3Dv2` },
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
      options: { redirectTo: `${location.origin}/sign-in?callback=oauth&returnTo=%2Flibrary` },
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
    await mount('?returnTo=%2Flibrary')
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
    await mount(`?returnTo=%2Flibrary#error=server_error&error_code=validation_failed&error_description=${encodeURIComponent(description)}`)
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
    await mount('?returnTo=%2Flibrary&error=access_denied')
    expect(document.querySelector<HTMLElement>('[data-auth-status]')!.textContent).toBe('access_denied')
    expect(new URLSearchParams(location.search).has('error')).toBe(false)
    expect(new URLSearchParams(location.search).get('returnTo')).toBe('/library')
  })

  it('shows the error notice when signInWithOAuth itself fails, and stays usable', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    await mount('?returnTo=%2Flibrary')
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
    history.replaceState(null, '', '/sign-in' + query)
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
    history.replaceState(null, '', '/sign-in?mode=welcome')
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

  const submitEmail = async (address: string) => {
    document.querySelector<HTMLInputElement>('[name=email]')!.value = address
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
  }
  const typeCode = async (digits: string) => {
    const input = document.querySelector<HTMLInputElement>('[data-code-input]')!
    input.value = digits
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
  }
  const signedOut = async (query = '?returnTo=%2Freader%3Fbook%3Dbible') => {
    auth.getSession.mockResolvedValueOnce({ data: { session: null } } as never)
    history.replaceState(null, '', '/sign-in' + query)
    mountSignInShell()
    await import('./labSignIn')
    await flush()
  }

  it('an email code: one field, then six boxes that sign in on the sixth digit (onboarding v3)', async () => {
    await signedOut()
    await submitEmail('new@example.com')
    expect(auth.signInWithOtp).toHaveBeenCalledExactlyOnceWith({ email: 'new@example.com', options: { shouldCreateUser: true } })
    expect(mode()).toBe('code')
    const input = document.querySelector<HTMLInputElement>('[data-code-input]')!
    expect([input.autocomplete, input.inputMode, input.maxLength]).toEqual(['one-time-code', 'numeric', 6])
    expect(document.querySelector('[data-code-email]')!.textContent).toBe('new@example.com')
    expect(document.querySelector<HTMLElement>('[data-auth-legal]')!.hidden).toBe(false)
    auth.verifyOtp.mockResolvedValueOnce({ data: { session: { access_token: 't', user: { id: 'new-reader', created_at: '2026-11-02T10:00:00Z', last_sign_in_at: '2026-11-02T10:04:00Z' } } }, error: null })
    await typeCode('12345')
    expect(auth.verifyOtp).not.toHaveBeenCalled()
    await typeCode('12 34 56')
    expect(auth.verifyOtp).toHaveBeenCalledExactlyOnceWith({ email: 'new@example.com', token: '123456', type: 'email' })
    // Four minutes between sending and typing is still a new account: the welcome, not a silent return.
    expect(mode()).toBe('welcome')
  })

  it('an existing reader signing in by code goes straight back to their place', async () => {
    await signedOut()
    await submitEmail('back@example.com')
    auth.verifyOtp.mockResolvedValueOnce({ data: { session: { access_token: 't', user: { id: 'old-reader', created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-11-02T10:00:00Z' } } }, error: null })
    await typeCode('654321')
    expect(navigation).toHaveBeenCalledWith('/reader?book=bible')
  })

  it('a wrong code says so and clears the boxes; a second tap never sends twice', async () => {
    await signedOut()
    let release!: () => void
    auth.signInWithOtp.mockImplementationOnce(() => new Promise(resolve => { release = () => resolve({ data: {}, error: null }) }))
    document.querySelector<HTMLInputElement>('[name=email]')!.value = 'a@example.com'
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(1)
    expect(document.querySelector<HTMLButtonElement>('[data-auth-submit]')!.disabled).toBe(true)
    release(); await flush()
    auth.verifyOtp.mockResolvedValueOnce({ data: { session: null }, error: { message: 'Token has expired or is invalid', code: 'otp_expired', status: 403 } })
    await typeCode('111111')
    expect(document.querySelector('[data-auth-status]')!.textContent).toBe('That code has expired. Send a new one.')
    expect(document.querySelector<HTMLInputElement>('[data-code-input]')!.value).toBe('')
    expect(mode()).toBe('code')
  })

  it('Send a new code waits 30 seconds; the rate limit has a calm message', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout'] })
    try {
      await signedOut()
      await submitEmail('a@example.com')
      const resend = document.querySelector<HTMLButtonElement>('[data-code-resend]')!
      expect(resend.disabled).toBe(true)
      expect(document.querySelector('[data-code-wait]')!.textContent).toBe(' in 0:30')
      vi.advanceTimersByTime(30_000)
      expect(resend.disabled).toBe(false)
      auth.signInWithOtp.mockResolvedValueOnce({ data: {}, error: { message: 'email rate limit exceeded', status: 429, code: 'over_email_send_rate_limit' } })
      resend.click()
      await flush()
      expect(document.querySelector('[data-auth-status]')!.textContent).toBe('Too many codes for now. Wait a minute, then ask for a new one.')
    } finally {
      vi.useRealTimers()
    }
  })

  it('Open Gmail only for a Gmail address; Change goes back with the address kept', async () => {
    await signedOut()
    await submitEmail('sara@gmail.com')
    expect(document.querySelector<HTMLElement>('[data-open-gmail]')!.hidden).toBe(false)
    document.querySelector<HTMLButtonElement>('[data-code-change]')!.click()
    expect(mode()).toBe('signin')
    expect(document.querySelector<HTMLInputElement>('[name=email]')!.value).toBe('sara@gmail.com')
    await submitEmail('sara@example.com')
    expect(document.querySelector<HTMLElement>('[data-open-gmail]')!.hidden).toBe(true)
  })

  it('password accounts can still sign in with their password', async () => {
    await signedOut('?mode=password&returnTo=%2Flibrary')
    expect(mode()).toBe('password')
    expect(document.querySelector<HTMLElement>('[data-password-field]')!.hidden).toBe(false)
    auth.signInWithPassword.mockResolvedValueOnce({ data: { session: { access_token: 't', user: { id: 'old', created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-11-02T10:00:00Z' } } }, error: null })
    document.querySelector<HTMLInputElement>('[name=email]')!.value = 'old@example.com'
    document.querySelector<HTMLInputElement>('[name=password]')!.value = 'secret-pass'
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(navigation).toHaveBeenCalledWith('/library')
  })
})
