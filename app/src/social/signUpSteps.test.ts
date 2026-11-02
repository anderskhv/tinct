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
  auth.signInWithOtp.mockClear()
  vi.stubGlobal('fetch', api)
  api.mockClear()
})
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('sign-up with profiles off', () => {
  it('a new reader by code gets the welcome screen, and no profile request is made', async () => {
    mount(false)
    await import('../labSignIn')
    await flush()
    expect(document.querySelector('[data-social-steps]')).toBeNull()
    await signInByCode()
    expect(mode()).toBe('welcome')
    expect(api).not.toHaveBeenCalled()
  })
})

describe('onboarding v3 steps (approved mockup, 2 Nov 2026)', () => {
  const start = async (search?: string) => {
    mount(true, search)
    await import('../labSignIn')
    await flush()
    await signInByCode()
  }

  it('Your profile, 1 of 2: no background by default, the initial, an empty name, Skip at the top', async () => {
    await start()
    expect(mode()).toBe('profile')
    const step = q('[data-mode-copy="profile"]')
    expect(step.querySelector('.social-counter')!.textContent).toBe('1 of 2Skip')
    expect(step.querySelector('h1')!.textContent).toBe('Your profile')
    expect(q('.social-banner').hidden).toBe(true)
    expect(q<HTMLInputElement>('[name=profileName]').value).toBe('')
    expect(q('.social-hero-avatar').dataset.kind).toBe('initial')
    expect(q('[data-social-add-background]').hidden).toBe(false)
    expect(q('.social-strip').hidden).toBe(true)
  })

  it('an empty name never blocks: Continue moves on at once and saves behind, without a name', async () => {
    await start()
    let release!: () => void
    holdPosts = new Promise(resolve => { release = resolve })
    q<HTMLButtonElement>('[data-social-continue]').click()
    expect(mode()).toBe('reading')
    await flush()
    expect(profilePosts()[0].body).not.toHaveProperty('name')
    release(); await flush()
  })

  it('a failed save is retried behind the step', async () => {
    await start()
    failNextPosts = 1
    q<HTMLButtonElement>('[data-social-continue]').click()
    await new Promise(resolve => setTimeout(resolve, 700))
    await flush()
    expect(profilePosts().length).toBe(2)
    expect(mode()).toBe('reading')
  })

  it('Public and Private set exactly their four settings', async () => {
    await start()
    q<HTMLInputElement>('[name=profileName]').value = 'Sara Holm'
    q<HTMLButtonElement>('[data-visibility="only_me"]').click()
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    expect(profilePosts()[0].body).toMatchObject({ name: 'Sara Holm', visibility: 'only_me', showReading: false, showTime: false, onLeaderboard: false, setUp: true, picture: { kind: 'initial', value: null } })
    expect(profilePosts()[0].body).not.toHaveProperty('background')
    vi.resetModules(); posts = []
    await start()
    expect(q('[data-visibility="everyone"]').getAttribute('aria-checked')).toBe('true')
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    expect(profilePosts()[0].body).toMatchObject({ visibility: 'everyone', showReading: true, showTime: true, onLeaderboard: true })
  })

  it('+ Add a background: Upload first, then small scenes that take on the first tap; None removes it', async () => {
    profile = { ...baseProfile, uploads: true }
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { odyssey: { updatedAt: 1 } } }))
    await start()
    q<HTMLButtonElement>('[data-social-add-background]').click()
    const strip = q('.social-strip')
    expect(strip.hidden).toBe(false)
    const tiles = [...strip.querySelectorAll<HTMLButtonElement>('.social-strip-row > button')]
    expect(tiles[0].dataset.socialUpload).toBe('background')
    const scenes = tiles.filter(tile => tile.classList.contains('social-scene'))
    expect(scenes.map(scene => scene.querySelector('img')!.getAttribute('src'))).toEqual(expect.arrayContaining(['/lab/library_2/assets/profile/scene-at-sea.jpg']))
    expect(scenes.every(scene => /\/profile\/scene-[a-z-]+\.jpg$/.test(scene.querySelector('img')!.getAttribute('src')!))).toBe(true)
    // The book being read comes first (odyssey: At sea).
    expect(scenes[0].getAttribute('aria-label')).toBe('Background: At sea')
    scenes[1].click()
    expect(scenes[1].getAttribute('aria-pressed')).toBe('true')
    expect(q('.social-banner').hidden).toBe(false)
    expect(q('.social-banner').style.backgroundImage).toContain('/profile/scene-')
    q<HTMLButtonElement>('.social-strip-none').click()
    expect(q('.social-banner').hidden).toBe(true)
    scenes[0].click()
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    expect(profilePosts()[0].body).toMatchObject({ background: { kind: 'set', value: 'at-sea' } })
  })

  it('the picture strip: Upload first, then disc-sized crops, never the full covers', async () => {
    profile = { ...baseProfile, uploads: true }
    localStorage.setItem('tinct-lab-position', JSON.stringify({ books: { odyssey: { updatedAt: 1 } } }))
    await start()
    q<HTMLButtonElement>('.social-hero-picture').click()
    const strip = document.querySelectorAll<HTMLElement>('.social-strip')[1]
    expect(strip.hidden).toBe(false)
    const tiles = [...strip.querySelectorAll<HTMLButtonElement>('.social-strip-row > button')]
    expect(tiles[0].dataset.socialUpload).toBe('picture')
    const images = [...document.querySelectorAll<HTMLElement>('.tinct-avatar')].map(node => node.style.backgroundImage).filter(Boolean)
    expect(images.length).toBeGreaterThan(3)
    expect(images.every(image => /\/assets\/avatars\/.+\.webp/.test(image))).toBe(true)
    const stoic = tiles.find(tile => tile.getAttribute('aria-label') === 'Picture: Stoic')!
    stoic.click()
    expect(stoic.getAttribute('aria-pressed')).toBe('true')
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    expect(profilePosts()[0].body).toMatchObject({ picture: { kind: 'set', value: 'stoic' } })
  })

  it('a Google account starts with its own photo, saved as the Google photo', async () => {
    profile = { ...baseProfile, googlePhoto: true, name: 'Sara Holm' }
    newUser.user_metadata = { avatar_url: 'https://lh3.googleusercontent.com/a/sara=s96-c' }
    await start()
    expect(q('.social-hero-avatar').style.backgroundImage).toContain('lh3.googleusercontent.com')
    expect(q<HTMLInputElement>('[name=profileName]').value).toBe('Sara Holm')
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    expect(profilePosts()[0].body).not.toHaveProperty('picture')
    expect(posts.some(post => post.url === '/api/profile/google-photo')).toBe(true)
  })

  it('How do you read?, 2 of 2: labelled language chips, Modern translation or Original, back to the book', async () => {
    await start()
    q<HTMLButtonElement>('[data-social-continue]').click()
    await flush()
    const step = q('[data-mode-copy="reading"]')
    expect(step.querySelector('.social-counter')!.textContent).toBe('2 of 2Skip')
    expect(step.querySelector('h1')!.textContent).toBe('How do you read?')
    expect([...step.querySelectorAll('.social-chip')].map(chip => chip.textContent)).toEqual(['English', 'Dansk'])
    expect([...step.querySelectorAll('.social-option strong')].map(node => node.textContent)).toEqual(['Modern translation', 'Original'])
    expect([...step.querySelectorAll('.social-option small')].map(node => node.textContent)).toEqual(['AI-generated, in today’s language. Easier to read.', 'The author’s own words, or a published human translation.'])
    // Where the choice is changed later (Anders, 2 Nov 2026: "You can switch any book at any time" was not clear).
    expect(step.textContent).toContain('You can change this for any book while you read, under Aa › Main version.')
    q<HTMLButtonElement>('.social-chip[data-language="da"]').click()
    q<HTMLButtonElement>('.social-option[data-value="human"]').click()
    q<HTMLButtonElement>('[data-social-start]').click()
    await flush()
    const saved = profilePosts().at(-1)!
    expect(saved.body).toEqual({ newBooksOpenIn: 'human', readingLanguages: expect.arrayContaining(['en', 'da']) })
    expect(saved.keepalive).toBe(true)
    expect(navigation).toHaveBeenCalledWith('/reader?book=odyssey')
  })

  it('skipping both steps saves nothing and returns to the book', async () => {
    await start()
    q<HTMLButtonElement>('[data-social-skip]').click()
    q<HTMLButtonElement>('[data-social-reading-skip]').click()
    await flush()
    expect(posts).toEqual([])
    expect(navigation).toHaveBeenCalledWith('/reader?book=odyssey')
  })

  it('returning readers see the same two steps, counted 1 of 2', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: { access_token: 'tok', user: { ...newUser, created_at: '2025-01-01T00:00:00Z' } } } })
    mount(true, '?mode=profile&returnTo=%2Flibrary')
    await import('../labSignIn')
    await flush()
    expect(mode()).toBe('profile')
    expect(q('[data-mode-copy="profile"] .social-counter').textContent).toBe('1 of 2Skip')
  })

  it('falls back to the welcome screen when profiles are unavailable', async () => {
    profile = null as never
    await start()
    expect(mode()).toBe('welcome')
  })

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
