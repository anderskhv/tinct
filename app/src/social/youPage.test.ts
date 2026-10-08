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
