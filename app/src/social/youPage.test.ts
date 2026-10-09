// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const session = { access_token: 'tok', user: { id: '11111111-1111-4111-8111-111111111111', email: 'reader@example.com' } }
vi.mock('../services/supabase', () => ({ supabase: { auth: { getSession: async () => ({ data: { session } }) } }, isSupabaseConfigured: () => true }))

const profile = {
  handle: 'reader', link: 'tinct.app/@reader', name: 'Reader',
  picture: { kind: 'initial', value: null, url: null, review: 'none' },
  background: { kind: 'library', value: null, url: null, review: 'none' },
  visibility: 'friends', effectiveVisibility: 'friends', showReading: true, showTime: true, onLeaderboard: false,
  newBooksOpenIn: 'modern', setUp: true, needsSetup: false, shouldPrompt: false, emailConfirmed: true, emailOptIn: false, googlePhoto: true,
}

const api = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input)
  if (url.includes('/api/profile')) return Response.json({ enabled: true, available: true, profile })
  if (url.includes('/api/reading-time/status')) return Response.json({ enabled: false })
  return Response.json({})
})

async function flush() {
  for (let i = 0; i < 12; i++) await new Promise(resolve => setTimeout(resolve, 0))
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', api)
  history.replaceState(null, '', '/you')
  document.head.innerHTML = '<meta name="tinct-social" content="1">'
  document.body.innerHTML = '<div id="tinct-you" class="you" data-ready="false"></div>'
})
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('the profile editor at launch (no photo uploads)', () => {
  it('Picture and background offers sets, the Google photo and the initial: no upload, no file picker', async () => {
    await import('./youPage')
    await flush()
    document.querySelector<HTMLButtonElement>('[data-testid="you-picture"]')!.click()
    const sheet = document.querySelector<HTMLElement>('[data-you-sheet].sheet')!
    expect(sheet).not.toBeNull()
    const labels = [...sheet.querySelectorAll('.item')].map(item => item.firstChild!.textContent)
    expect(labels).toEqual(['Use my Google photo', 'Use my initial'])
    expect(sheet.querySelectorAll('.presets button').length).toBeGreaterThan(0)
    expect(sheet.querySelector('input[type=file]')).toBeNull()
    expect(document.querySelector('input[type=file]')).toBeNull()
    expect(sheet.textContent).not.toMatch(/upload/i)
    expect(api.mock.calls.some(([input]) => String(input).includes('/api/profile/image'))).toBe(false)
  })
})

describe('Who can see you: "Send confirmation link"', () => {
  function stub(own: Record<string, unknown>, confirmLink: () => Response) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/api/profile/confirm-link')) return confirmLink()
      if (url.includes('/api/profile')) return Response.json({ enabled: true, available: true, profile: { ...profile, ...own } })
      if (url.includes('/api/reading-time/status')) return Response.json({ enabled: false })
      return Response.json({})
    })
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }
  const waiting = { visibility: 'everyone', effectiveVisibility: 'friends', emailConfirmed: false }
  const confirmCalls = (mock: ReturnType<typeof stub>) => mock.mock.calls.filter(([input]) => String(input).includes('/api/profile/confirm-link'))

  async function openVisibility() {
    history.replaceState(null, '', '/you?view=visibility')
    await import('./youPage')
    await flush()
  }

  it('replaces the welcome-email hint with the button; one tap sends once, then "Check your email for the link."', async () => {
    const mock = stub(waiting, () => Response.json({ ok: true }))
    await openVisibility()
    const main = document.querySelector('main')!
    expect(main.textContent).not.toContain('welcome email')
    expect(main.textContent).toContain('Until you confirm your email, friends can see you.')
    const button = document.querySelector<HTMLButtonElement>('[data-testid="confirm-link"]')!
    expect(button.textContent).toBe('Send confirmation link')
    button.click()
    expect(button.disabled).toBe(true)
    button.click()
    await flush()
    expect(confirmCalls(mock)).toHaveLength(1)
    const [, init] = confirmCalls(mock)[0]
    expect(init?.method).toBe('POST')
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer tok')
    expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
    expect(document.querySelector('[data-testid="confirm-link-sent"]')!.textContent).toBe('Check your email for the link.')
  })

  it('a refusal for sending too soon still reads "Check your email for the link."', async () => {
    stub(waiting, () => Response.json({ error: 'Too many requests' }, { status: 429 }))
    await openVisibility()
    document.querySelector<HTMLButtonElement>('[data-testid="confirm-link"]')!.click()
    await flush()
    expect(document.querySelector('[data-testid="confirm-link-sent"]')!.textContent).toBe('Check your email for the link.')
  })

  it('a failure keeps the button and asks to try again later', async () => {
    stub(waiting, () => Response.json({ error: 'Unavailable' }, { status: 503 }))
    await openVisibility()
    document.querySelector<HTMLButtonElement>('[data-testid="confirm-link"]')!.click()
    await flush()
    expect(document.querySelector<HTMLButtonElement>('[data-testid="confirm-link"]')!.disabled).toBe(false)
    expect(document.querySelector('[data-testid="confirm-link-sent"]')).toBeNull()
    expect(document.querySelector('.status')!.textContent).toBe('Please try again later.')
  })

  it('no button when the email is confirmed or Everyone is not chosen', async () => {
    stub({ visibility: 'everyone', effectiveVisibility: 'everyone', emailConfirmed: true }, () => Response.json({ ok: true }))
    await openVisibility()
    expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
    document.body.innerHTML = '<div id="tinct-you" class="you" data-ready="false"></div>'
    vi.resetModules()
    stub({ visibility: 'friends', emailConfirmed: false }, () => Response.json({ ok: true }))
    await openVisibility()
    expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
  })

  it('Friends or Only me with an unconfirmed email: the page never asks to confirm (the email went out at sign-up)', async () => {
    for (const visibility of ['friends', 'only_me']) {
      document.body.innerHTML = '<div id="tinct-you" class="you" data-ready="false"></div>'
      vi.resetModules()
      const mock = stub({ visibility, effectiveVisibility: visibility, emailConfirmed: false }, () => Response.json({ ok: true }))
      await openVisibility()
      const main = document.querySelector('main')!
      expect(main.textContent).not.toMatch(/confirm/i)
      expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
      const everyone = [...document.querySelectorAll('.tick .item')].find(item => item.textContent?.startsWith('Everyone'))!
      expect(everyone.querySelector('small')!.textContent).toBe('Anyone with your link, and the Everyone board.')
      expect(confirmCalls(mock)).toHaveLength(0)
    }
  })

  it('Everyone while unconfirmed: one quiet line and the resend button, nothing else about confirming', async () => {
    stub(waiting, () => Response.json({ ok: true }))
    await openVisibility()
    const notes = [...document.querySelectorAll('main .note')].map(note => note.textContent)
    expect(notes.filter(text => /confirm/i.test(text ?? ''))).toEqual(['Until you confirm your email, friends can see you.'])
    expect([...document.querySelectorAll('.tick .item small')].map(line => line.textContent).filter(text => /confirm/i.test(text ?? ''))).toEqual([])
    expect(document.querySelector('[data-testid="confirm-link"]')!.textContent).toBe('Send confirmation link')
  })

  it('the leaderboard switch never asks to confirm, whatever the visibility', async () => {
    for (const own of [waiting, { visibility: 'friends', emailConfirmed: false }]) {
      document.body.innerHTML = '<div id="tinct-you" class="you" data-ready="false"></div>'
      vi.resetModules()
      stub(own, () => Response.json({ ok: true }))
      history.replaceState(null, '', '/you?view=onLeaderboard')
      await import('./youPage')
      await flush()
      const main = document.querySelector('main')!
      expect(main.textContent).toContain('You appear on the boards of the people who can see you.')
      expect(main.textContent).not.toMatch(/confirm/i)
      expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
    }
  })

  it('picking Everyone with an unconfirmed email shows the button', async () => {
    let own: Record<string, unknown> = { visibility: 'friends', emailConfirmed: false }
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST' && String(input).endsWith('/api/profile')) own = { ...own, ...JSON.parse(String(init.body)) }
      return Response.json({ enabled: true, available: true, profile: { ...profile, ...own } })
    })
    vi.stubGlobal('fetch', fetchMock)
    await openVisibility()
    expect(document.querySelector('[data-testid="confirm-link"]')).toBeNull()
    const everyone = [...document.querySelectorAll<HTMLButtonElement>('.tick .item')].find(item => item.textContent?.startsWith('Everyone'))!
    everyone.click()
    await flush()
    expect(document.querySelector('[data-testid="confirm-link"]')!.textContent).toBe('Send confirmation link')
  })
})
