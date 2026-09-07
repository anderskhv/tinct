/**
 * Which "continue with" providers the lab sign-in page offers, in the order
 * they are shown, and what to say when one of them is not there.
 *
 * Order is Google, Apple, GitHub (owner decision, 2026-09-07), on both the
 * sign-in and the create-account modes, phone and desktop.
 *
 * CAPABILITY LIST — `LAB_SIGN_IN_PROVIDERS` is the only place that decides
 * whether a button is rendered. A provider that is not enabled in the
 * Supabase project (Auth → Sign In / Providers) is hidden by deleting its
 * entry from that one array; the markup, the click handler and the tests
 * need no other change. As of 2026-09-07 Google is enabled; Apple and GitHub
 * are declared here and are expected to be switched on in the dashboard.
 * Until they are, the attempt fails on the ROUND TRIP, not on the call:
 * `signInWithOAuth` builds the `/authorize` URL and navigates, and GoTrue
 * sends the reader straight back here with
 * `error_description=Unsupported+provider%3A+provider+is+not+enabled` in the
 * fragment (implicit flow) or the query string (PKCE). `labOAuthReturnError`
 * reads both and `labOAuthErrorMessage` turns it into a line for the page's
 * existing error notice — never a blank redirect that looks like a dead
 * button.
 *
 * No secret lives here or anywhere else in the repo: OAuth client ids and
 * secrets are entered in the Supabase dashboard and never reach the client.
 */
export type LabOAuthProvider = 'google' | 'apple' | 'github'

/** Every provider the page has markup for, in display order. */
export const LAB_OAUTH_PROVIDERS: readonly LabOAuthProvider[] = ['google', 'apple', 'github']

/**
 * The providers actually offered. Remove one line to hide a provider that is
 * not configured yet; the button disappears and nothing else changes.
 */
export const LAB_SIGN_IN_PROVIDERS: readonly LabOAuthProvider[] = ['google', 'apple', 'github']

export const LAB_OAUTH_PROVIDER_NAMES: Readonly<Record<LabOAuthProvider, string>> = Object.freeze({
  google: 'Google',
  apple: 'Apple',
  github: 'GitHub',
})

export function isLabOAuthProvider(value: unknown): value is LabOAuthProvider {
  return typeof value === 'string' && (LAB_OAUTH_PROVIDERS as readonly string[]).includes(value)
}

/** Is this provider offered right now? Unknown names are never offered. */
export function labOAuthProviderOffered(
  value: unknown,
  offered: readonly LabOAuthProvider[] = LAB_SIGN_IN_PROVIDERS,
): value is LabOAuthProvider {
  return isLabOAuthProvider(value) && offered.includes(value)
}

/**
 * Supabase's answer for a provider the project has not switched on. It comes
 * back as a 400 with "Unsupported provider: provider is not enabled" and,
 * because `signInWithOAuth` never navigates in that case, the reader would
 * otherwise just see the button do nothing.
 */
export function isProviderNotEnabled(message: string | null | undefined): boolean {
  return /provider is not enabled|unsupported provider|provider .* is not enabled/i.test(String(message ?? ''))
}

/** What the page's error notice says when a provider sign-in fails. */
export function labOAuthErrorMessage(provider: LabOAuthProvider, message?: string | null): string {
  if (isProviderNotEnabled(message)) {
    return `${LAB_OAUTH_PROVIDER_NAMES[provider]} sign-in isn’t available yet. Use your email below, or another provider.`
  }
  const trimmed = String(message ?? '').trim()
  return trimmed || `${LAB_OAUTH_PROVIDER_NAMES[provider]} sign-in didn’t work. Please try again.`
}

/**
 * Where the provider round-trip comes back to: the same lab sign-in page,
 * carrying the reader's already-validated `returnTo` — identical to what the
 * Google button has always done, so every provider lands the reader back
 * where they were.
 */
export function labOAuthRedirectTo(origin: string, returnTo: string): string {
  return `${origin}/lab/sign-in?returnTo=${encodeURIComponent(returnTo)}`
}

/** Which provider a round-trip was started for, remembered across the redirect. */
export const LAB_OAUTH_PENDING_KEY = 'tinct:lab-oauth-provider'

export interface LabOAuthReturnError {
  /** GoTrue's `error_description`, or `error` when it sent no description. */
  description: string
  /** GoTrue's `error_code`, when it sent one. */
  code: string | null
}

function errorFromParams(params: URLSearchParams): LabOAuthReturnError | null {
  const description = params.get('error_description') || params.get('error')
  if (!description) return null
  return { description, code: params.get('error_code') }
}

/**
 * The error GoTrue put on the URL when it sent the reader back here, from
 * either the query string or the fragment. Null when the URL carries none —
 * a normal visit, or a successful round-trip.
 */
export function labOAuthReturnError(search: string, hash: string): LabOAuthReturnError | null {
  const fromQuery = errorFromParams(new URLSearchParams(search.startsWith('?') ? search.slice(1) : search))
  if (fromQuery) return fromQuery
  return errorFromParams(new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash))
}

/** The same URL with every auth error/tokens parameter stripped, so a reload is clean. */
export function withoutOAuthReturnParams(href: string): string {
  const noise = ['error', 'error_code', 'error_description', 'access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type', 'provider_token', 'provider_refresh_token', 'type']
  const url = new URL(href)
  for (const key of noise) url.searchParams.delete(key)
  if (url.hash) {
    const hash = new URLSearchParams(url.hash.slice(1))
    let touched = false
    for (const key of noise) if (hash.has(key)) { hash.delete(key); touched = true }
    if (touched) {
      const rest = hash.toString()
      url.hash = rest ? `#${rest}` : ''
    }
  }
  return `${url.pathname}${url.search}${url.hash}`
}
