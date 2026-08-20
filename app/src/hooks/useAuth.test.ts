import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasLikelySupabaseSession } from './useAuth'
import { clearSignedInCookie, signedInCookieClearValues } from '../utils/authCookie'

function installWindowWithStorage(storage: Record<string, string>, cookie = '') {
  const keys = Object.keys(storage)
  const localStorageMock = {
    get length() {
      return keys.length
    },
    key: vi.fn((index: number) => keys[index] ?? null),
    getItem: vi.fn((key: string) => storage[key] ?? null),
  }

  vi.stubGlobal('window', { localStorage: localStorageMock })
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('document', { cookie })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('hasLikelySupabaseSession', () => {
  it('detects a normal Supabase auth token key', () => {
    installWindowWithStorage({ 'sb-project-auth-token': '{"access_token":"x"}' })
    expect(hasLikelySupabaseSession()).toBe(true)
  })

  it('detects chunked Supabase auth token keys', () => {
    installWindowWithStorage({ 'sb-project-auth-token.0': '{"access_token":"x"}' })
    expect(hasLikelySupabaseSession()).toBe(true)
  })

  it('ignores empty token placeholders', () => {
    installWindowWithStorage({
      'sb-project-auth-token': 'null',
      'sb-project-auth-token.0': '""',
    })
    expect(hasLikelySupabaseSession()).toBe(false)
  })

  it('falls back to the signed-in cookie', () => {
    installWindowWithStorage({}, 'other=1; tinct_auth=1')
    expect(hasLikelySupabaseSession()).toBe(true)
  })
})

describe('sign-out cookie clear', () => {
  it('writes Max-Age=0 variants so tinct.app/ can serve the landing page', () => {
    const written: string[] = []
    vi.stubGlobal('document', {
      set cookie(value: string) {
        written.push(value)
      },
      get cookie() {
        return ''
      },
    })
    clearSignedInCookie()
    expect(written).toEqual(signedInCookieClearValues())
    expect(written.some(value => value.includes('Max-Age=0'))).toBe(true)
  })
})
