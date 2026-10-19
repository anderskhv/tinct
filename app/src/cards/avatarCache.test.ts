// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AVATAR_CACHE_PREFIX, avatarCrop, avatarSignature, clearAvatarCache, headerPictureView, readAvatarCache, writeAvatarCache } from './avatarCache'
import { clearLocalUserData } from '../services/storage'

/**
 * The library header's own picture, kept on this device (Anders, 19 Oct 2026:
 * "it just takes too long before my picture loads").
 */
const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const SRC = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='

beforeEach(() => localStorage.clear())

describe('the kept copy', () => {
  it('is read only for the account it was kept for', () => {
    writeAvatarCache(A, { sig: 's', src: SRC })
    expect(readAvatarCache(A)).toEqual({ sig: 's', src: SRC })
    expect(readAvatarCache(B)).toBeNull()
    expect(readAvatarCache(null)).toBeNull()
    // An entry filed under one account but naming another is not trusted.
    localStorage.setItem(AVATAR_CACHE_PREFIX + B, JSON.stringify({ v: 1, userId: A, sig: 's', src: SRC }))
    expect(readAvatarCache(B)).toBeNull()
  })

  it('is only ever a small image data URL', () => {
    for (const src of ['https://example.com/a.jpg', '/api/profile/image?user=u', 'data:text/html;base64,PGI+', 'javascript:alert(1)', `data:image/jpeg;base64,${'A'.repeat(60_000)}`]) {
      localStorage.setItem(AVATAR_CACHE_PREFIX + A, JSON.stringify({ v: 1, userId: A, sig: 's', src }))
      expect(readAvatarCache(A), src.slice(0, 30)).toBeNull()
    }
  })

  it('is reader data: sign-out wipes it with the rest, and it can be dropped on its own', () => {
    writeAvatarCache(A, { sig: 's', src: SRC })
    clearAvatarCache(A)
    expect(readAvatarCache(A)).toBeNull()
    writeAvatarCache(A, { sig: 's', src: SRC })
    clearLocalUserData()
    expect(localStorage.getItem(AVATAR_CACHE_PREFIX + A)).toBeNull()
  })
})

describe('what the header shows', () => {
  it('a painting from its 480px copy, a stored photo as it is', () => {
    expect(headerPictureView({ kind: 'image', src: '/lab/library_2/assets/meditations.jpg', pos: '50% 34%', cover: true })).toEqual({ kind: 'image', src: '/lab/library_2/assets/covers/meditations-480.webp', pos: '50% 34%', cover: true })
    const photo = { kind: 'image' as const, src: '/api/profile/image?user=u&slot=picture&v=abc', pos: '50% 50%', cover: false, private: true }
    expect(headerPictureView(photo)).toEqual(photo)
  })

  it('the signature changes with the picture, and an initial keeps nothing', () => {
    const a = avatarSignature({ kind: 'image', src: '/x.webp', pos: '50% 34%', cover: true })
    expect(a).toBeTruthy()
    expect(avatarSignature({ kind: 'image', src: '/x.webp', pos: '50% 40%', cover: true })).not.toBe(a)
    expect(avatarSignature({ kind: 'initial', initial: 'A' })).toBeNull()
  })

  it('crops the same square the disc shows: a painting at 260% width, a photo at cover', () => {
    // A 480 x 720 painting at 260%: the disc spans 480 / 2.6 image px, placed by the position.
    const painting = avatarCrop({ kind: 'image', src: '', pos: '50% 34%', cover: true }, 480, 720)
    expect(painting.sw).toBeCloseTo(480 / 2.6)
    expect(painting.sh).toBeCloseTo(480 / 2.6)
    expect(painting.sx).toBeCloseTo((480 - 480 / 2.6) / 2)
    expect(painting.sy).toBeCloseTo((720 - 480 / 2.6) * 0.34)
    // A square photo fills the disc.
    expect(avatarCrop({ kind: 'image', src: '', pos: '50% 50%', cover: false }, 512, 512)).toEqual({ sx: 0, sy: 0, sw: 512, sh: 512 })
    // A wide photo: its middle square.
    expect(avatarCrop({ kind: 'image', src: '', pos: '50% 50%', cover: false }, 800, 400)).toEqual({ sx: 200, sy: 0, sw: 400, sh: 400 })
  })
})

describe('boot.js paints the kept copy from the page head', () => {
  const source = readFileSync('public/lab/library_2/boot.js', 'utf8')
  function boot(options: { cookie?: string; session?: string | null; kept?: Record<string, unknown> | null; keptFor?: string; discovery?: boolean }) {
    const records = new Map<string, string>()
    const session = options.session === undefined ? A : options.session
    if (session) records.set('sb-test-auth-token', JSON.stringify({ user: { id: session } }))
    if (options.kept !== null) records.set(AVATAR_CACHE_PREFIX + (options.keptFor ?? A), JSON.stringify(options.kept ?? { v: 1, userId: A, sig: 's', src: SRC }))
    const classes = new Set<string>()
    const props = new Map<string, string>()
    const document = {
      cookie: options.cookie ?? 'tinct_auth=1',
      documentElement: { style: { visibility: '', setProperty: (name: string, value: string) => props.set(name, value) }, classList: { add: (name: string) => classes.add(name), contains: (name: string) => classes.has(name), remove: (name: string) => classes.delete(name) }, dataset: {} },
      head: { append: vi.fn() }, createElement: () => ({}),
    }
    const localStorage = { get length() { return records.size }, key: (i: number) => [...records.keys()][i], getItem: (key: string) => records.get(key) ?? null, setItem: vi.fn() }
    runInNewContext(source, { window: {}, location: { pathname: '/library', search: '' }, localStorage, sessionStorage: { getItem: (key: string) => options.discovery && key === 'tinct:library-2-visit' ? JSON.stringify({ at: Date.now(), mode: 'discovery' }) : null, setItem: vi.fn() }, document, URLSearchParams, innerWidth: 393, innerHeight: 734, fetch: vi.fn(async () => ({ ok: true, json: async () => [] })) })
    return { classes, props }
  }

  it('for the signed-in account whose copy it is', () => {
    const { classes, props } = boot({})
    expect(classes.has('own-avatar')).toBe(true)
    expect(props.get('--own-avatar')).toBe(`url("${SRC}")`)
  })

  it('on a discovery visit too, where the reading engine is not preloaded', () => {
    expect(boot({ discovery: true }).classes.has('own-avatar')).toBe(true)
  })

  it.each([
    ['signed out (no cookie)', { cookie: '' }],
    ['no session in this browser', { session: null }],
    ['another account\'s session', { session: B }],
    ['a copy naming another account', { kept: { v: 1, userId: B, sig: 's', src: SRC } }],
    ['not an image data URL', { kept: { v: 1, userId: A, sig: 's', src: 'https://example.com/x.jpg' } }],
    ['an old version', { kept: { v: 0, userId: A, sig: 's', src: SRC } }],
  ])('never when %s', (_name, options) => {
    const { classes, props } = boot(options)
    expect(classes.has('own-avatar')).toBe(false)
    expect(props.has('--own-avatar')).toBe(false)
  })
})
