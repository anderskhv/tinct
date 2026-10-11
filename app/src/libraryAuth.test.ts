import { describe, expect, it } from 'vitest'
import { libraryAuthSignedIn } from './libraryAuth'

describe('libraryAuthSignedIn', () => {
  it('keeps the signed-in page while a refresh is pending in a browser that holds the session', () => {
    expect(libraryAuthSignedIn('INITIAL_SESSION', null, true)).toBeNull()
    expect(libraryAuthSignedIn('TOKEN_REFRESHED', null, true)).toBeNull()
  })
  it('follows a real session, a sign-out, or a browser that holds no session', () => {
    expect(libraryAuthSignedIn('INITIAL_SESSION', { user: { id: 'u' } }, true)).toBe(true)
    expect(libraryAuthSignedIn('SIGNED_OUT', null, true)).toBe(false)
    expect(libraryAuthSignedIn('INITIAL_SESSION', null, false)).toBe(false)
  })
})
