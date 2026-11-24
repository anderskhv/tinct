// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => vi.fn())
vi.mock('../lab/labAuthCompletion', async () => ({
  ...await vi.importActual<typeof import('../lab/labAuthCompletion')>('../lab/labAuthCompletion'),
  navigateAfterAuth: navigation,
}))
const newUser = { id: 'new-reader', email: 'new@example.com', created_at: '2026-11-02T09:00:00Z', last_sign_in_at: '2026-11-02T09:03:00Z', user_metadata: {} as Record<string, unknown> }
const auth = {
  signInWithOtp: vi.fn(async (_options: unknown) => ({ data: {}, error: null })),
  verifyOtp: vi.fn(async (_options: unknown) => ({ data: { session: { access_token: 'tok', user: newUser } }, error: null })),
  getSession: vi.fn(async () => ({ data: { session: null as unknown } })),
  signInWithOAuth: vi.fn(async () => ({ data: { url: null }, error: null })),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(async () => ({ error: null })),
}
vi.mock('../services/supabase', () => ({ supabase: { auth }, isSupabaseConfigured: () => true }))
const tracked = vi.hoisted(() => [] as Array<[string, Record<string, unknown> | undefined]>)
vi.mock('../utils/funnel', async () => ({
  ...await vi.importActual<typeof import('../utils/funnel')>('../utils/funnel'),
  trackFunnel: (name: string, props?: Record<string, unknown>) => { tracked.push([name, props]) },
}))

const baseProfile = {
  handle: 'new', link: 'tinct.app/@new', name: 'Reader',
  picture: { kind: 'set', value: 'at-sea', url: null, review: 'none' },
  background: { kind: 'set', value: 'at-sea', url: null, review: 'none' },
  visibility: 'only_me', effectiveVisibility: 'only_me', showReading: true, showTime: true, onLeaderboard: false,
  newBooksOpenIn: 'modern', setUp: false, needsSetup: true, shouldPrompt: true, emailConfirmed: true, emailOptIn: false, googlePhoto: false,
}
let profile: Record<string, unknown> = baseProfile

let posts: { url: string; body: Record<string, unknown> | null; keepalive?: boolean }[] = []
let failNextPosts = 0
let holdPosts: Promise<void> | null = null
const api = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  if (url.startsWith('/api/profile') && init?.method === 'POST') {
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : null
    posts.push({ url, body, keepalive: init.keepalive })
    if (holdPosts) await holdPosts
    if (failNextPosts > 0) { failNextPosts -= 1; return Response.json({ error: 'busy' }, { status: 503 }) }
    return Response.json({ enabled: true, available: true, profile })
  }
  if (url.startsWith('/api/profile')) return profile === null ? Response.json({ enabled: false }, { status: 404 }) : Response.json({ enabled: true, available: true, profile })
  return Response.json({})
})

function mount(social: boolean, search = '?returnTo=%2Freader%3Fbook%3Dodyssey') {
  history.replaceState(null, '', '/sign-in' + search)
  const html = readFileSync(resolve(__dirname, '../../public/lab/sign-in/index.html'), 'utf8')
  const shell = new DOMParser().parseFromString(html, 'text/html')
  shell.querySelectorAll('script').forEach(script => script.remove())
  document.head.innerHTML = social ? '<meta name="tinct-social" content="1">' : ''
  document.body.innerHTML = shell.body.innerHTML
}

async function flush() {
  for (let i = 0; i < 12; i++) await new Promise(resolve => setTimeout(resolve, 0))
}

/** A new reader signing in by email code: one field, then the six digits. */
async function signInByCode() {
  ;(document.querySelector('[name=email]') as HTMLInputElement).value = 'new@example.com'
  document.querySelector<HTMLFormElement>('[data-auth-form]')!.dispatchEvent(new Event('submit', { cancelable: true }))
  await flush()
  const code = document.querySelector<HTMLInputElement>('[data-code-input]')!
  code.value = '123456'
  code.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

const mode = () => document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode
const q = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!
const profilePosts = () => posts.filter(post => post.url === '/api/profile')

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  sessionStorage.clear()
  posts = []
  failNextPosts = 0
  holdPosts = null
  profile = baseProfile
  newUser.user_metadata = {}
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:synthetic-preview'), revokeObjectURL: vi.fn() }))
  navigation.mockClear()
  tracked.length = 0
  auth.signInWithOtp.mockClear()
  auth.getSession.mockReset(); auth.getSession.mockResolvedValue({ data: { session: null } })
  vi.stubGlobal('fetch', api)
  api.mockClear()
})
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

// One-step sign-up (Anders, 24 Nov 2026). This file tested the "Your profile" and "How do you read?" steps
// (onboarding v3, 2 Nov 2026), which are removed with this decision; their tests went with them. The password
// tests are kept as they were.
describe('one-step sign-up (Anders, 24 Nov 2026)', () => {
  for (const social of [true, false]) {
    it(`a new reader by code goes straight back to the book: no profile step, no welcome, nothing saved (profiles ${social ? 'on' : 'off'})`, async () => {
      mount(social)
      await import('../labSignIn')
      await flush()
      await signInByCode()
      expect(navigation).toHaveBeenCalledExactlyOnceWith('/reader?book=odyssey')
      expect(mode()).not.toBe('welcome')
      expect(document.querySelector('.social-step, [data-social-continue], [data-social-steps]')).toBeNull()
      // Nothing is saved to the profile: it is made silently, Only me, by the Worker on its first read.
      expect(posts).toEqual([])
      expect(tracked).toContainEqual(['signup_completed', { method: 'email_code', entry: 'general' }])
    })
  }

  it('an old ?mode=profile link opens no step: signed in, it goes to the You card over the page', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: { access_token: 'tok', user: { ...newUser, created_at: '2025-01-01T00:00:00Z' } } } })
    mount(true, '?mode=profile&returnTo=%2Flibrary')
    await import('../labSignIn')
    await flush()
    expect(document.querySelector('.social-step')).toBeNull()
    expect(navigation).toHaveBeenCalledWith('/library?card=you', true)
  })
})

describe('the sheet says what opened it (Anders, 24 Nov 2026)', () => {
  const sheet = () => ({ title: q('[data-signin-title]').textContent, line: q('[data-signin-copy]').textContent, free: q('[data-signin-free]').textContent })
  const FREE = 'Reading is free. Your first month of Premium is free, no card.'
  const open = async (search: string) => { mount(true, search); await import('../labSignIn'); await flush() }

  it('from inside a book: Keep your place, naming the book the reader left', async () => {
    const { rememberSignInBook } = await import('../lab/signInEntry')
    rememberSignInBook('The Odyssey')
    await open('?returnTo=%2Freader&from=save_place')
    expect(sheet()).toEqual({ title: 'Keep your place', line: 'Pick up The Odyssey at this page on any device.', free: FREE })
  })

  it('from inside a book whose title is not known: the line without it', async () => {
    await open('?returnTo=%2Freader&from=save_place')
    expect(sheet()).toEqual({ title: 'Keep your place', line: 'Pick up where you are on any device.', free: FREE })
  })

  it('a stale title (over 30 minutes) is not used', async () => {
    sessionStorage.setItem('tinct:sign-in-book', JSON.stringify({ title: 'Ulysses', at: Date.now() - 31 * 60_000 }))
    await open('?returnTo=%2Freader&from=save_place')
    expect(sheet().line).toBe('Pick up where you are on any device.')
  })

  it('the keep listening prompt: Keep listening', async () => {
    await open('?returnTo=%2Freader&from=listen')
    expect(sheet()).toEqual({ title: 'Keep listening', line: 'Listen on from this sentence, on any device.', free: FREE })
  })

  it('anything else, an unknown entry included: Sign in or join Tinct', async () => {
    for (const search of ['?returnTo=%2Flibrary', '?returnTo=%2Flibrary&from=nonsense']) {
      vi.resetModules()
      await open(search)
      expect(sheet()).toEqual({ title: 'Sign in or join Tinct', line: 'Your books, places, highlights and notes on every device.', free: FREE })
    }
  })

  it('the small print sits under the line, left-aligned with it; the only centred note left is the code note under the button', () => {
    const html = readFileSync(resolve(__dirname, '../../public/lab/sign-in/index.html'), 'utf8')
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const free = doc.querySelector('[data-signin-free]')!
    expect(free.previousElementSibling?.matches('[data-signin-copy]')).toBe(true)
    expect(free.classList.contains('auth-note')).toBe(false)
    expect(free.textContent).toBe(FREE)
    expect(html).toMatch(/\.auth-free\{[^}]*font-size:13px/)
    expect(html).not.toMatch(/\.auth-free\{[^}]*text-align:center/)
  })

  it('signup_completed carries the entry, kept across a provider round trip in this tab', async () => {
    await open('?returnTo=%2Freader&from=listen')
    vi.resetModules()
    // Back from the provider: the URL no longer says what opened the sheet; this tab remembered it.
    auth.getSession.mockResolvedValueOnce({ data: { session: { access_token: 'tok', user: { ...newUser, last_sign_in_at: '2026-11-02T09:00:01Z' } } } })
    mount(true, '?callback=oauth&returnTo=%2Freader')
    await import('../labSignIn')
    await flush()
    expect(tracked).toContainEqual(['signup_completed', expect.objectContaining({ entry: 'listen' })])
    expect(navigation).toHaveBeenCalledWith('/reader')
  })

  it('a later direct visit is general again', async () => {
    sessionStorage.setItem('tinct:sign-in-entry', 'listen')
    await open('?returnTo=%2Flibrary')
    expect(sheet().title).toBe('Sign in or join Tinct')
    expect(sessionStorage.getItem('tinct:sign-in-entry')).toBeNull()
  })
})

describe('password accounts (onboarding v3, kept)', () => {
  it('an unconfirmed password account is asked once for a code, which confirms it and goes on (onboarding v3)', async () => {
    profile = { ...baseProfile, setUp: true, emailConfirmed: false }
    mount(true, '?mode=password&returnTo=%2Flibrary')
    await import('../labSignIn')
    await flush()
    const old = { ...newUser, created_at: '2026-06-01T00:00:00Z' }
    auth.signInWithPassword.mockResolvedValueOnce({ data: { session: { access_token: 'pw', user: old } }, error: null })
    q<HTMLInputElement>('[name=email]').value = 'old@example.com'
    q<HTMLInputElement>('[name=password]').value = 'secret-pass'
    q<HTMLFormElement>('[data-auth-form]').dispatchEvent(new Event('submit', { cancelable: true }))
    await flush()
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: 'old@example.com', options: { shouldCreateUser: false } })
    expect(mode()).toBe('confirm')
    expect(q('[data-code-title]').textContent).toBe('Confirm your email')
    expect(q('[data-code-change]').hidden).toBe(true)
    expect(navigation).not.toHaveBeenCalled()
    auth.verifyOtp.mockResolvedValueOnce({ data: { session: { access_token: 'otp', user: old } }, error: null })
    const code = q<HTMLInputElement>('[data-code-input]')
    code.value = '246810'
    code.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
    // The profile is read with the code's session, which the Worker records as confirmed.
    expect(api.mock.calls.some(([url, init]) => String(url).startsWith('/api/profile') && new Headers((init as RequestInit)?.headers).get('authorization') === 'Bearer otp')).toBe(true)
    expect(navigation).toHaveBeenCalledWith('/library')
  })

  it('a confirmed password account goes straight on', async () => {
    profile = { ...baseProfile, setUp: true, emailConfirmed: true }
    mount(true, '?mode=password&returnTo=%2Flibrary')
    await import('../labSignIn')
    await flush()
    auth.signInWithPassword.mockResolvedValueOnce({ data: { session: { access_token: 'pw', user: { ...newUser, created_at: '2026-06-01T00:00:00Z' } } }, error: null })
    q<HTMLInputElement>('[name=email]').value = 'old@example.com'
    q<HTMLInputElement>('[name=password]').value = 'secret-pass'
    q<HTMLFormElement>('[data-auth-form]').dispatchEvent(new Event('submit', { cancelable: true }))
    await flush()
    expect(auth.signInWithOtp).not.toHaveBeenCalled()
    expect(navigation).toHaveBeenCalledWith('/library')
  })
})
