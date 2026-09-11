import { describe, expect, it } from 'vitest'
import {
  LAB_OAUTH_PROVIDERS,
  LAB_SIGN_IN_PROVIDERS,
  isLabOAuthProvider,
  isProviderNotEnabled,
  labOAuthErrorMessage,
  labOAuthProviderOffered,
  labOAuthRedirectTo,
  labOAuthReturnError,
  withoutOAuthReturnParams,
} from './labSignInProviders'

describe('lab sign-in providers', () => {
  it('has markup for three providers but offers only Google and Apple', () => {
    expect([...LAB_OAUTH_PROVIDERS]).toEqual(['google', 'apple', 'github'])
    // GitHub dropped 2026-09-07: its noreply address can never link by email.
    expect([...LAB_SIGN_IN_PROVIDERS]).toEqual(['google', 'apple'])
  })

  it('treats the capability list as the whole rule, and never trusts an unknown name', () => {
    expect(labOAuthProviderOffered('apple')).toBe(true)
    expect(labOAuthProviderOffered('apple', ['google'])).toBe(false)
    expect(labOAuthProviderOffered('facebook')).toBe(false)
    expect(labOAuthProviderOffered('facebook', ['google', 'apple', 'github'])).toBe(false)
    expect(labOAuthProviderOffered(undefined)).toBe(false)
    expect(isLabOAuthProvider('github')).toBe(true)
    expect(isLabOAuthProvider('GitHub')).toBe(false)
  })

  it('recognises Supabase\'s "provider is not enabled" answer', () => {
    expect(isProviderNotEnabled('Unsupported provider: provider is not enabled')).toBe(true)
    expect(isProviderNotEnabled('Provider apple is not enabled')).toBe(true)
    expect(isProviderNotEnabled('Invalid login credentials')).toBe(false)
    expect(isProviderNotEnabled(null)).toBe(false)
  })

  it('turns it into a line the reader can act on, and passes anything else through', () => {
    expect(labOAuthErrorMessage('apple', 'Unsupported provider: provider is not enabled'))
      .toBe('Apple sign-in isn’t available yet. Use your email below, or another provider.')
    expect(labOAuthErrorMessage('github', 'Unsupported provider: provider is not enabled'))
      .toContain('GitHub sign-in isn’t available yet')
    expect(labOAuthErrorMessage('google', 'Network request failed')).toBe('Network request failed')
    expect(labOAuthErrorMessage('google', '')).toBe('Google sign-in didn’t work. Please try again.')
    expect(labOAuthErrorMessage('google', null)).toBe('Google sign-in didn’t work. Please try again.')
  })

  it('sends every provider back to the lab sign-in page with the reader\'s returnTo', () => {
    expect(labOAuthRedirectTo('https://tinct.app', '/lab/reader?voice=v2'))
      .toBe('https://tinct.app/lab/sign-in?returnTo=%2Flab%2Freader%3Fvoice%3Dv2')
    expect(labOAuthRedirectTo('https://tinct.app', '/lab/library'))
      .toBe('https://tinct.app/lab/sign-in?returnTo=%2Flab%2Flibrary')
  })
})

describe('the error GoTrue puts on the URL when it sends the reader back', () => {
  const notEnabled = 'Unsupported provider: provider is not enabled'

  it('reads it from the fragment (implicit flow)', () => {
    const hash = `#error=server_error&error_code=validation_failed&error_description=${encodeURIComponent(notEnabled)}`
    expect(labOAuthReturnError('?returnTo=%2Flab%2Flibrary', hash)).toEqual({ description: notEnabled, code: 'validation_failed' })
  })

  it('reads it from the query string (PKCE flow)', () => {
    const search = `?returnTo=%2Flab%2Flibrary&error=server_error&error_code=validation_failed&error_description=${encodeURIComponent(notEnabled)}`
    expect(labOAuthReturnError(search, '')).toEqual({ description: notEnabled, code: 'validation_failed' })
  })

  it('falls back to `error` when there is no description, and is null on a clean URL', () => {
    expect(labOAuthReturnError('?error=access_denied', '')).toEqual({ description: 'access_denied', code: null })
    expect(labOAuthReturnError('?returnTo=%2Flab%2Flibrary', '')).toBeNull()
    expect(labOAuthReturnError('', '')).toBeNull()
    expect(labOAuthReturnError('', '#access_token=abc&token_type=bearer')).toBeNull()
  })

  it('strips the auth noise from the URL and keeps the reader\'s returnTo', () => {
    expect(withoutOAuthReturnParams(`https://tinct.app/lab/sign-in?returnTo=%2Flab%2Freader&error=server_error&error_description=${encodeURIComponent(notEnabled)}`))
      .toBe('/lab/sign-in?returnTo=%2Flab%2Freader')
    expect(withoutOAuthReturnParams('https://tinct.app/lab/sign-in?returnTo=%2Flab%2Flibrary#error=server_error&error_code=validation_failed'))
      .toBe('/lab/sign-in?returnTo=%2Flab%2Flibrary')
    expect(withoutOAuthReturnParams('https://tinct.app/lab/sign-in?returnTo=%2Flab%2Flibrary'))
      .toBe('/lab/sign-in?returnTo=%2Flab%2Flibrary')
  })
})
