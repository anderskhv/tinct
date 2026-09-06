// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const auth = {
  signOut: vi.fn(async () => ({ error: null })),
  getSession: vi.fn(async () => ({ data: { session: { user: { email: 'reader@example.com' } } } })),
}
vi.mock('./services/supabase', () => ({ supabase: { auth }, isSupabaseConfigured: () => true }))

function mountSignInShell() {
  const html = readFileSync(resolve(__dirname, '../public/lab/sign-in/index.html'), 'utf8')
  const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('<script'))
  document.body.innerHTML = body
}

async function flush() {
  for (let i = 0; i < 4; i++) await Promise.resolve()
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
  auth.signOut.mockClear()
  auth.getSession.mockClear()
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
