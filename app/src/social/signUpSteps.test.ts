// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EMAIL_CONSENT_TEXT, EMAIL_CONSENT_VERSION } from './profileRules'

const navigation = vi.hoisted(() => vi.fn())
vi.mock('../lab/labAuthCompletion', async () => ({
  ...await vi.importActual<typeof import('../lab/labAuthCompletion')>('../lab/labAuthCompletion'),
  navigateAfterAuth: navigation,
}))
const newUser = { id: 'new-reader', email: 'new@example.com', created_at: '2026-10-08T09:00:00Z', last_sign_in_at: '2026-10-08T09:00:01Z' }
const auth = {
  signUp: vi.fn(async (_options: unknown) => ({ data: { session: { access_token: 'tok', user: newUser } }, error: null })),
  getSession: vi.fn(async () => ({ data: { session: null as unknown } })),
  signInWithOAuth: vi.fn(async () => ({ data: { url: null }, error: null })),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(async () => ({ error: null })),
}
vi.mock('../services/supabase', () => ({ supabase: { auth }, isSupabaseConfigured: () => true }))

const profile = {
  handle: 'new', link: 'tinct.app/@new', name: 'New',
  picture: { kind: 'initial', value: null, url: null, review: 'none' },
  background: { kind: 'library', value: null, url: null, review: 'none' },
  visibility: 'only_me', effectiveVisibility: 'only_me', showReading: true, showTime: true, onLeaderboard: false,
  newBooksOpenIn: 'modern', setUp: false, needsSetup: true, shouldPrompt: true, emailConfirmed: false, emailOptIn: false, googlePhoto: false,
}

let posts: Record<string, unknown>[] = []
const api = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  if (url.startsWith('/api/profile') && init?.method === 'POST') {
    const body = JSON.parse(String(init.body))
    posts.push(body)
    return Response.json({ enabled: true, available: true, profile: { ...profile, ...('newBooksOpenIn' in body ? { newBooksOpenIn: body.newBooksOpenIn } : {}) } })
  }
  if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile })
  return Response.json({})
})

function mount(social: boolean, search = '?mode=create&returnTo=%2Freader%3Fbook%3Dodyssey') {
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

async function createAccount() {
  ;(document.querySelector('[name=email]') as HTMLInputElement).value = 'new@example.com'
  ;(document.querySelector('[name=password]') as HTMLInputElement).value = 'correct horse'
  ;(document.querySelector('[name=emailOptIn]') as HTMLInputElement).checked = true
  document.querySelector<HTMLFormElement>('[data-auth-form]')!.dispatchEvent(new Event('submit', { cancelable: true }))
  await flush()
}

const mode = () => document.querySelector<HTMLElement>('#tinct-lab-sign-in')!.dataset.mode

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  sessionStorage.clear()
  posts = []
  navigation.mockClear()
  auth.signUp.mockClear()
  vi.stubGlobal('fetch', api)
  api.mockClear()
})
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('sign-up with profiles off', () => {
  it('is exactly today’s page: old consent wording, no steps, the welcome screen', async () => {
    mount(false)
    await import('../labSignIn')
    await flush()
    expect(document.querySelector('[data-email-optin-field] span')!.textContent).toBe('Email me now and then about my reading and Tinct. Optional; stop any time.')
    expect(document.querySelector('[data-social-steps]')).toBeNull()
    expect(document.querySelector('.social-pw-toggle')).toBeNull()
    await createAccount()
    expect(auth.signUp.mock.calls[0][0]).toMatchObject({ options: { data: { email_opt_in: true } } })
    expect((auth.signUp.mock.calls[0][0] as { options: { data: object } }).options.data).not.toHaveProperty('email_consent_version')
    expect(mode()).toBe('welcome')
    expect(api).not.toHaveBeenCalled()
  })
})

describe('sign-up with profiles on', () => {
  it('step 1: one password field with show/hide, the new consent line under the button', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('1 of 3')
    expect(document.querySelector('[data-mode-copy="create"] h1')!.textContent).toBe('Create your account')
    expect(document.querySelector('[data-email-optin-field] span')!.textContent).toBe(EMAIL_CONSENT_TEXT)
    expect((document.querySelector('[name=emailOptIn]') as HTMLInputElement).checked).toBe(false)
    expect(document.querySelector('[data-auth-submit]')!.nextElementSibling).toBe(document.querySelector('[data-email-optin-field]'))
    expect(document.querySelector<HTMLElement>('[data-confirm-field]')!.hidden).toBe(true)
    const toggle = document.querySelector<HTMLButtonElement>('.social-pw-toggle')!
    toggle.click()
    expect((document.querySelector('[name=password]') as HTMLInputElement).type).toBe('text')
  })

  it('steps 2 and 3: Skip = Only me, consent saved with its version, the reading question, back to the book, no toast', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    expect(auth.signUp.mock.calls[0][0]).toMatchObject({ options: { data: { email_opt_in: true, email_consent_version: EMAIL_CONSENT_VERSION } } })
    expect(mode()).toBe('profile')
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('2 of 3')
    expect(document.querySelector<HTMLInputElement>('[name=profileName]')!.value).toBe('New')
    // No photo uploads at launch: sets and the initial only.
    expect(document.querySelector('[aria-label="Upload your own picture"]')).toBeNull()
    expect(document.querySelector('.social-step input[type=file]')).toBeNull()
    expect(document.querySelector('[data-mode-copy="profile"]')!.textContent).not.toMatch(/upload/i)
    expect(document.querySelectorAll('.social-pictures button').length).toBe(4)
    // Only me is preselected: a new profile is Only me until the reader changes it (privacy notice).
    expect(document.querySelector('.social-tick[data-value="only_me"]')!.getAttribute('aria-checked')).toBe('true')
    expect(document.querySelector('.social-tick[data-value="friends"]')!.getAttribute('aria-checked')).toBe('false')
    document.querySelector<HTMLButtonElement>('[data-social-skip]')!.click()
    await flush()
    expect(posts[0]).toEqual({ consent: { optIn: true, version: EMAIL_CONSENT_VERSION }, skip: true })
    expect(mode()).toBe('reading')
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('3 of 3')
    document.querySelector<HTMLButtonElement>('.social-tick[data-value="human"]')!.click()
    document.querySelector<HTMLButtonElement>('[data-social-start]')!.click()
    await flush()
    expect(posts[1]).toEqual({ newBooksOpenIn: 'human' })
    expect(localStorage.getItem('tinct:new-books-open-in')).toBe('human')
    expect(navigation).toHaveBeenCalledWith('/reader?book=odyssey')
    expect(document.body.textContent).not.toContain('Your place is saved')
  })

  it('Continue saves the picture, name and who can see you', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLInputElement>('[name=profileName]')!.value = 'Newton'
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    // Continue without a choice keeps Only me.
    expect(posts[0]).toMatchObject({ name: 'Newton', visibility: 'only_me', setUp: true, picture: { kind: 'set' } })
    expect(mode()).toBe('reading')
  })

  it('Friends is saved only when the reader chooses it', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('.social-tick[data-value="friends"]')!.click()
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ visibility: 'friends', setUp: true })
  })

  it('falls back to today’s welcome when profiles are unavailable', async () => {
    api.mockImplementation(async () => Response.json({ enabled: true, available: false }))
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    expect(mode()).toBe('welcome')
  })
})
