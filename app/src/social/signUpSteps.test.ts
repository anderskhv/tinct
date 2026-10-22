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
const defaultApi = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  if (url.startsWith('/api/profile') && init?.method === 'POST') {
    const body = JSON.parse(String(init.body))
    posts.push(body)
    return Response.json({ enabled: true, available: true, profile: { ...profile, ...('newBooksOpenIn' in body ? { newBooksOpenIn: body.newBooksOpenIn } : {}) } })
  }
  if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile })
  return Response.json({})
}
const api = vi.fn(defaultApi)

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
  api.mockImplementation(defaultApi)
  URL.createObjectURL = vi.fn(() => 'blob:preview')
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
  it('step 1: one password field with show/hide, the new consent line above the button', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('1 of 3')
    expect(document.querySelector('[data-mode-copy="create"] h1')!.textContent).toBe('Create your account')
    expect(document.querySelector('[data-email-optin-field] span')!.textContent).toBe(EMAIL_CONSENT_TEXT)
    expect((document.querySelector('[name=emailOptIn]') as HTMLInputElement).checked).toBe(false)
    // Above the button since 14 October 2026 (Anders): seen before the account is created.
    expect(document.querySelector('[data-auth-submit]')!.previousElementSibling).toBe(document.querySelector('[data-email-optin-field]'))
    expect(document.querySelector('[data-mode-copy="create"].auth-fine')!.textContent).toBe('I already have an account')
    expect(document.querySelector<HTMLElement>('[data-confirm-field]')!.hidden).toBe(true)
    const toggle = document.querySelector<HTMLButtonElement>('.social-pw-toggle')!
    toggle.click()
    expect((document.querySelector('[name=password]') as HTMLInputElement).type).toBe('text')
  })

  // Redrawn by the profile-flow brief and its mockups (Anders, 22 Oct 2026): the
  // design changed, so these replace the 7 October picture-row and Only-me tests.
  it('steps 2 and 3: the You-card top, Public preselected, Skip saves no profile choice, the reading step, back to the book', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    expect(auth.signUp.mock.calls[0][0]).toMatchObject({ options: { data: { email_opt_in: true, email_consent_version: EMAIL_CONSENT_VERSION } } })
    expect(mode()).toBe('profile')
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('2 of 3')
    // Built like the You card: the background and the picture, each with its camera, and the name.
    expect(document.querySelector('[data-social-banner] [data-social-camera="background"]')).not.toBeNull()
    expect(document.querySelector('[data-social-camera="picture"] .tinct-avatar')).not.toBeNull()
    // A set name shows as text with a pencil.
    expect(document.querySelector('[data-social-name]')!.textContent).toBe('New')
    expect(document.querySelector('[data-social-name] svg')).not.toBeNull()
    expect(document.querySelector('[data-mode-copy="profile"] .social-q')!.textContent).toBe('Who can see you?')
    expect(document.querySelector('.social-tick[data-value="public"]')!.getAttribute('aria-checked')).toBe('true')
    expect(document.querySelector('.social-tick[data-value="public"]')!.textContent).toContain('Your profile, reading and place on the leaderboard.')
    expect(document.querySelector('.social-tick[data-value="private"]')!.textContent).toContain('Only you.')
    // The email is not confirmed: the line says when others see you.
    expect(document.querySelector<HTMLElement>('[data-mode-copy="profile"] .social-note')!.hidden).toBe(false)
    // No uploads while the Worker does not accept them.
    document.querySelector<HTMLButtonElement>('[data-social-camera="picture"]')!.click()
    expect(document.querySelector('[data-social-upload]')).toBeNull()
    // Nothing is saved before Continue.
    expect(posts).toEqual([])
    document.querySelector<HTMLButtonElement>('[data-social-skip]')!.click()
    await flush()
    // Skip: no name, picture or visibility; only the consent and that the step was offered.
    expect(posts[0]).toEqual({ consent: { optIn: true, version: EMAIL_CONSENT_VERSION }, prompted: true })
    expect(mode()).toBe('reading')
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('3 of 3')
    expect(document.querySelector('[data-mode-copy="reading"] h1')!.textContent).toBe('Your reading')
    // English preselected (the browser is English); the renamed second version.
    const languages = [...document.querySelectorAll<HTMLButtonElement>('.social-lang')]
    expect(languages.map(box => [box.textContent, box.getAttribute('aria-checked')])).toEqual([['✓English', 'true'], ['Dansk', 'false']])
    expect(document.querySelector('.social-tick[data-value="human"]')!.textContent).toContain('Human originals or translations')
    document.querySelector<HTMLButtonElement>('.social-tick[data-value="human"]')!.click()
    document.querySelector<HTMLButtonElement>('[data-social-start]')!.click()
    await flush()
    expect(posts[1]).toEqual({ newBooksOpenIn: 'human', readingLanguages: ['en'] })
    expect(localStorage.getItem('tinct:new-books-open-in')).toBe('human')
    expect(navigation).toHaveBeenCalledWith('/reader?book=odyssey')
    expect(document.body.textContent).not.toContain('Your place is saved')
  })

  it('Public turns on exactly the four settings and marks the profile set up', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ visibility: 'everyone', showReading: true, showTime: true, onLeaderboard: true, setUp: true, picture: { kind: 'set' } })
    // The name was not changed: it is not sent.
    expect(posts[0]).not.toHaveProperty('name')
    expect(mode()).toBe('reading')
  })

  it('Private turns them all off', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('.social-tick[data-value="private"]')!.click()
    // The confirm-your-email line is about others seeing you: not for Private.
    expect(document.querySelector<HTMLElement>('[data-mode-copy="profile"] .social-note')!.hidden).toBe(true)
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ visibility: 'only_me', showReading: false, showTime: false, onLeaderboard: false, setUp: true })
  })

  it('the name is empty for the neutral Reader, never prefilled, and saved when typed', async () => {
    api.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const reader = { ...profile, name: 'Reader', emailConfirmed: true }
      if (url.startsWith('/api/profile') && init?.method === 'POST') { posts.push(JSON.parse(String(init.body))); return Response.json({ enabled: true, available: true, profile: reader }) }
      if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: reader })
      return Response.json({})
    })
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    const field = document.querySelector<HTMLInputElement>('[name=profileName]')!
    expect(field.value).toBe('')
    expect(field.placeholder).toBe('Your name')
    // A confirmed email: no line.
    expect(document.querySelector<HTMLElement>('[data-mode-copy="profile"] .social-note')!.hidden).toBe(true)
    field.value = 'Newton'
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ name: 'Newton', visibility: 'everyone', setUp: true })
  })

  it('the pencil edits a set name in place', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    expect(document.querySelector('[name=profileName]')).toBeNull()
    document.querySelector<HTMLButtonElement>('[data-social-name]')!.click()
    const field = document.querySelector<HTMLInputElement>('[name=profileName]')!
    expect(field.value).toBe('New')
    expect(document.activeElement).toBe(field)
    field.value = 'Nova'
    field.dispatchEvent(new Event('blur'))
    expect(document.querySelector('[data-social-name]')!.textContent).toBe('Nova')
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ name: 'Nova' })
  })

  it('the picture camera offers the stock pictures, two of women among them, saved on Continue', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('[data-social-camera="picture"]')!.click()
    const labels = [...document.querySelectorAll('[data-social-picker] .social-pictures button')].map(button => button.getAttribute('aria-label'))
    expect(labels).toHaveLength(6)
    expect(labels).toEqual(expect.arrayContaining(['Picture: Longbourn', 'Picture: The Awakening', 'Picture: your initial']))
    document.querySelector<HTMLButtonElement>('[aria-label="Picture: The Awakening"]')!.click()
    expect(document.querySelector<HTMLElement>('[data-social-picker]')!.hidden).toBe(true)
    document.querySelector<HTMLButtonElement>('[data-social-camera="background"]')!.click()
    document.querySelector<HTMLButtonElement>('[aria-label="Background: Longbourn"]')!.click()
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ picture: { kind: 'cover', value: 'the-awakening' }, background: { kind: 'set', value: 'longbourn' } })
  })

  it('a cover picture keeps the profile’s background when none was chosen', async () => {
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('[data-social-camera="picture"]')!.click()
    document.querySelector<HTMLButtonElement>('[aria-label="Picture: The Awakening"]')!.click()
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(posts[0]).toMatchObject({ picture: { kind: 'cover', value: 'the-awakening' } })
    expect(posts[0]).not.toHaveProperty('background')
  })

  it('uploads a chosen picture and background only when the reader presses Continue', async () => {
    const images: string[] = []
    const uploaded = { ...profile, uploads: true }
    api.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/profile/image')) {
        const slot = new URL(url, 'https://tinct.app').searchParams.get('slot')!
        images.push(slot)
        return Response.json({ enabled: true, available: true, profile: { ...uploaded, [slot]: { kind: 'upload', value: null, url: `/api/profile/image/${slot}`, review: 'approved' } } })
      }
      if (url.startsWith('/api/profile') && init?.method === 'POST') { posts.push(JSON.parse(String(init.body))); return Response.json({ enabled: true, available: true, profile: uploaded }) }
      if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: uploaded })
      return new Response(new Blob(['x']))
    })
    vi.doMock('./socialClient', async () => ({
      ...await vi.importActual<typeof import('./socialClient')>('./socialClient'),
      preparePhoto: vi.fn(async () => ({ ok: true as const, image: new Blob(['jpeg'], { type: 'image/jpeg' }) })),
    }))
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    const choose = (field: HTMLInputElement) => {
      Object.defineProperty(field, 'files', { configurable: true, value: [new File(['x'], 'me.jpg', { type: 'image/jpeg' })] })
      field.dispatchEvent(new Event('change'))
    }
    const fields = [...document.querySelectorAll<HTMLInputElement>('[data-mode-copy="profile"] input[type=file]')]
    expect(fields).toHaveLength(2)
    document.querySelector<HTMLButtonElement>('[data-social-camera="picture"]')!.click()
    expect(document.querySelector('[data-social-upload="picture"]')!.textContent).toBe('Upload a picture')
    choose(fields[0])
    await flush()
    document.querySelector<HTMLButtonElement>('[data-social-camera="background"]')!.click()
    expect(document.querySelector('[data-social-upload="background"]')!.textContent).toBe('Upload a background')
    choose(fields[1])
    await flush()
    // Shown, not stored: nothing is sent before Continue.
    expect(images).toEqual([])
    expect(document.querySelector<HTMLElement>('[data-social-camera="picture"] .tinct-avatar')!.style.backgroundImage).toContain('blob:preview')
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(images).toEqual(['picture', 'background'])
    expect(posts[0]).toMatchObject({ visibility: 'everyone', setUp: true })
    expect(posts[0]).not.toHaveProperty('picture')
    expect(posts[0]).not.toHaveProperty('background')
    vi.doUnmock('./socialClient')
  })

  it('Skip after choosing a photo uploads nothing', async () => {
    const images: string[] = []
    const uploaded = { ...profile, uploads: true }
    api.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/profile/image')) { images.push(url); return Response.json({ enabled: true, available: true, profile: uploaded }) }
      if (url.startsWith('/api/profile') && init?.method === 'POST') { posts.push(JSON.parse(String(init.body))); return Response.json({ enabled: true, available: true, profile: uploaded }) }
      if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: uploaded })
      return Response.json({})
    })
    vi.doMock('./socialClient', async () => ({
      ...await vi.importActual<typeof import('./socialClient')>('./socialClient'),
      preparePhoto: vi.fn(async () => ({ ok: true as const, image: new Blob(['jpeg'], { type: 'image/jpeg' }) })),
    }))
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    const field = document.querySelectorAll<HTMLInputElement>('[data-mode-copy="profile"] input[type=file]')[0]
    Object.defineProperty(field, 'files', { configurable: true, value: [new File(['x'], 'me.jpg', { type: 'image/jpeg' })] })
    field.dispatchEvent(new Event('change'))
    await flush()
    document.querySelector<HTMLButtonElement>('[data-social-skip]')!.click()
    await flush()
    expect(images).toEqual([])
    expect(posts).toEqual([{ consent: { optIn: true, version: EMAIL_CONSENT_VERSION }, prompted: true }])
    vi.doUnmock('./socialClient')
  })

  it('reads the chosen photo before clearing the input and waits while preparing (iPad, 19 Oct 2026)', async () => {
    const uploaded = { ...profile, uploads: true }
    api.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.startsWith('/api/profile') && init?.method === 'POST') { posts.push(JSON.parse(String(init.body))); return Response.json({ enabled: true, available: true, profile: uploaded }) }
      if (url.startsWith('/api/profile')) return Response.json({ enabled: true, available: true, profile: uploaded })
      return Response.json({})
    })
    const order: string[] = []
    let finishPrepare = () => {}
    vi.doMock('./socialClient', async () => ({
      ...await vi.importActual<typeof import('./socialClient')>('./socialClient'),
      preparePhoto: vi.fn(async (photo: Blob) => {
        order.push('prepare')
        expect(photo.type).toBe('image/heic')
        expect((photo as File).name).toBe('IMG_0002.heic')
        await new Promise<void>(resolve => { finishPrepare = resolve })
        order.push('prepared')
        return { ok: true as const, image: new Blob(['jpeg'], { type: 'image/jpeg' }) }
      }),
    }))
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('[data-social-camera="background"]')!.click()
    const field = document.querySelectorAll<HTMLInputElement>('[data-mode-copy="profile"] input[type=file]')[1]
    const trigger = document.querySelector<HTMLButtonElement>('[data-social-upload="background"]')!
    const file = new File([new Uint8Array([4, 5, 6])], 'IMG_0002.heic', { type: 'image/heic' })
    const read = file.arrayBuffer.bind(file)
    file.arrayBuffer = vi.fn(async () => { order.push('read'); return read() })
    Object.defineProperty(field, 'files', { configurable: true, value: [file] })
    Object.defineProperty(field, 'value', { configurable: true, get: () => '', set: () => { order.push('clear') } })
    field.dispatchEvent(new Event('change'))
    await flush()
    expect(order).toEqual(['read', 'prepare'])
    expect(trigger.disabled).toBe(true)
    expect(trigger.getAttribute('aria-busy')).toBe('true')
    finishPrepare()
    await flush()
    expect(order[0]).toBe('read')
    expect(order.indexOf('clear')).toBeGreaterThan(order.indexOf('prepared'))
    expect(trigger.disabled).toBe(false)
    expect(trigger.hasAttribute('aria-busy')).toBe(false)
    expect(document.querySelector('[data-auth-status]')?.textContent ?? '').not.toContain('approved')
    vi.doUnmock('./socialClient')
  })

  it('languages: Dansk can be added, at least one stays, and a Danish browser starts with both', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('da-DK')
    mount(true)
    await import('../labSignIn')
    await flush()
    await createAccount()
    document.querySelector<HTMLButtonElement>('[data-social-skip]')!.click()
    await flush()
    const box = (value: string) => document.querySelector<HTMLButtonElement>(`.social-lang[data-value="${value}"]`)!
    expect(box('en').getAttribute('aria-checked')).toBe('true')
    expect(box('da').getAttribute('aria-checked')).toBe('true')
    box('en').click()
    expect(box('en').getAttribute('aria-checked')).toBe('false')
    // The last one does not turn off.
    box('da').click()
    expect(box('da').getAttribute('aria-checked')).toBe('true')
    document.querySelector<HTMLButtonElement>('[data-social-start]')!.click()
    await flush()
    expect(posts[1]).toEqual({ newBooksOpenIn: 'modern', readingLanguages: ['da'] })
    expect(localStorage.getItem('tinct:reading-languages')).toBe('da')
    vi.restoreAllMocks()
  })

  it('a returning reader sent from the library counts two steps', async () => {
    auth.getSession.mockResolvedValueOnce({ data: { session: { access_token: 'tok', user: { ...newUser, created_at: '2026-08-01T09:00:00Z' } } } })
    mount(true, '?mode=profile&returnTo=%2Flibrary')
    await import('../labSignIn')
    await flush()
    expect(mode()).toBe('profile')
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('1 of 2')
    document.querySelector<HTMLButtonElement>('[data-social-continue]')!.click()
    await flush()
    expect(document.querySelector('[data-social-steps]')!.textContent).toBe('2 of 2')
    expect(posts[0]).toMatchObject({ visibility: 'everyone', setUp: true })
    expect(posts[0]).not.toHaveProperty('consent')
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
