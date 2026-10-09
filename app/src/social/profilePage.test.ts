// @vitest-environment jsdom
/**
 * The public profile page (tinct.app/@handle) for a reader the visitor
 * blocked: the API answers as for a missing profile, so the page looks the
 * reader up in the visitor's blocked list and offers Unblock (never "unblock
 * them in Settings": there is no such row).
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }, isSupabaseConfigured: () => true }))
vi.mock('../utils/funnel', () => ({ funnel: () => {}, setFunnelToken: () => {}, trackFunnel: () => {} }))

const ID = '22222222-2222-4222-8222-222222222222'
let blocked = true
const posts: Array<{ url: string; body: unknown }> = []

beforeEach(() => {
  blocked = true
  posts.length = 0
  document.head.innerHTML = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
  document.body.innerHTML = '<div id="tinct-profile" class="profile loading" data-handle="karl" data-state="loading"><div data-banner></div><main data-main></main></div>'
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (init?.method === 'POST') posts.push({ url, body: JSON.parse(String(init.body)) })
    if (url === '/api/social/blocked') return Response.json({ blocked: blocked ? [{ id: ID, name: 'Karl Ny', handle: 'karl' }] : [] })
    if (url === '/api/social/unblock') { blocked = false; return Response.json({ ok: true }) }
    if (url.startsWith('/api/social/profile/')) return blocked
      ? Response.json({ error: 'Not found' }, { status: 404 })
      : Response.json({ profile: { handle: 'karl', name: 'Karl Ny', link: 'tinct.app/@karl', picture: { src: null, pos: '', cover: false, private: false, initial: 'K' }, banner: { src: '/b.jpg', private: false }, relation: 'stranger', followsYou: false, limited: false, time: null, readingNow: null, finished: null } })
    return Response.json({}, { status: 404 })
  }))
})
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

const flush = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setTimeout(resolve, 0)) }

it('offers Unblock on a blocked reader\'s page, and shows the profile again after it', async () => {
  await import('./profilePage')
  await flush()
  const root = document.getElementById('tinct-profile')!
  expect(root.dataset.state).toBe('blocked')
  expect(root.textContent).not.toMatch(/Settings/)
  const unblock = root.querySelector<HTMLButtonElement>('[data-testid="profile-unblock"]')!
  expect(unblock.textContent).toBe('Unblock')
  unblock.click()
  await flush()
  expect(posts).toEqual([{ url: '/api/social/unblock', body: { id: ID } }])
  expect(root.dataset.state).toBe('ready')
  expect(root.querySelector('[data-testid="profile-follow"]')?.textContent).toBe('Follow')
})
