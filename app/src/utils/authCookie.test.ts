import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearSignedInCookie,
  hasSignedInCookie,
  setSignedInCookie,
  signedInCookieClearValues,
  signedInCookieSetValue,
} from './authCookie'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('hasSignedInCookie', () => {
  it('matches only the signed-in marker', () => {
    expect(hasSignedInCookie('other=1; tinct_auth=1')).toBe(true)
    expect(hasSignedInCookie('tinct_auth=1')).toBe(true)
    expect(hasSignedInCookie('tinct_auth=0')).toBe(false)
    expect(hasSignedInCookie('tinct_auth=10')).toBe(false)
    expect(hasSignedInCookie('')).toBe(false)
  })
})

describe('signed-in cookie writers', () => {
  it('sets the cookie with Path=/ so the Worker and landing page can read it', () => {
    expect(signedInCookieSetValue()).toContain('tinct_auth=1')
    expect(signedInCookieSetValue()).toContain('Path=/')
    expect(signedInCookieSetValue()).toContain('SameSite=Lax')
  })

  it('clears with and without Secure so a leftover marker cannot lock /', () => {
    const values = signedInCookieClearValues()
    expect(values.every(value => value.includes('tinct_auth=') && value.includes('Path=/'))).toBe(true)
    expect(values.some(value => value.includes('Secure'))).toBe(true)
    expect(values.some(value => !value.includes('Secure'))).toBe(true)
    expect(values.some(value => value.includes('Max-Age=0'))).toBe(true)
  })

  it('writes every clear variant onto document.cookie', () => {
    const written: string[] = []
    vi.stubGlobal('document', {
      set cookie(value: string) {
        written.push(value)
      },
      get cookie() {
        return written[written.length - 1] || ''
      },
    })

    setSignedInCookie()
    expect(written[0]).toBe(signedInCookieSetValue())

    written.length = 0
    clearSignedInCookie()
    expect(written).toEqual(signedInCookieClearValues())
  })
})
