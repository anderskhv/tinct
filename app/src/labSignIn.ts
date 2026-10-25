import type { Session } from '@supabase/supabase-js'
import { isInitialAccountSession, navigateAfterAuth } from './lab/labAuthCompletion'
import { authRedirectTo, startNativeOAuth, consumeNativeAuthNotice } from './utils/nativeAuth'
import { safeLabReturnTo } from './lab/labSignInReturn'
import {
  LAB_OAUTH_PENDING_KEY,
  LAB_SIGN_IN_PROVIDERS,
  isLabOAuthProvider,
  labOAuthErrorMessage,
  labOAuthProviderOffered,
  labOAuthRedirectTo,
  labOAuthReturnError,
  withoutOAuthReturnParams,
  type LabOAuthProvider,
  LAB_AUTH_CALLBACK_PATH,
} from './lab/labSignInProviders'
import { reconcileLabDeviceIdentity } from './lab/labDeviceIdentity'
import { displayProfileStylesReady } from './lab/displayProfileStyles'
import { supabase } from './services/supabase'
import { signInErrorMessage } from './services/browserAuthStorage'
import { funnel, setFunnelToken, trackFunnel } from './utils/funnel'
import { setSignedInCookie } from './utils/authCookie'
import { cardUrl } from './cards/cardRoutes'
import { enhanceSignInPage, rememberSignupConsent, startProfileSteps, updateStepCounter } from './social/signUpSteps'
import { EMAIL_CONSENT_VERSION } from './social/profileRules'

type Mode = 'signin' | 'create' | 'forgot' | 'reset' | 'welcome' | 'profile' | 'reading'

const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')
const form = root?.querySelector<HTMLFormElement>('[data-auth-form]')
const status = root?.querySelector<HTMLElement>('[data-auth-status]')
const submit = root?.querySelector<HTMLButtonElement>('[data-auth-submit]')
const email = root?.querySelector<HTMLInputElement>('[name=email]')
const password = root?.querySelector<HTMLInputElement>('[name=password]')
const confirmPassword = root?.querySelector<HTMLInputElement>('[name=confirmPassword]')
const emailOptIn = root?.querySelector<HTMLInputElement>('[name=emailOptIn]')
const initialParams = new URLSearchParams(location.search)
// The old account page (?mode=account, "Your Tinct account") is the Account card now:
// signed in, the reader goes straight to it over the page they came from; signed
// out, they sign in first and land on it.
const accountLink = initialParams.get('mode') === 'account'
const returnTo = accountLink ? cardUrl('account', safeLabReturnTo(initialParams.get('returnTo'))) : safeLabReturnTo(initialParams.get('returnTo'))
// Profiles (social ship 2): only when the Worker marks the page; otherwise nothing changes.
const social = enhanceSignInPage(root ?? null)
const allowedModes = new Set<Mode>(['signin', 'create', 'forgot', 'reset', 'welcome', ...(social ? ['profile', 'reading'] as Mode[] : [])])
let mode: Mode = allowedModes.has(initialParams.get('mode') as Mode)
  ? initialParams.get('mode') as Mode
  : 'signin'

const callback = initialParams.get('callback')
const nativeNotice = consumeNativeAuthNotice()
const returnedError = labOAuthReturnError(location.search, location.hash)
const returnedTokens = new URLSearchParams(location.hash.slice(1))
const authReturn = Boolean(callback || initialParams.has('code') || returnedTokens.has('access_token') || pendingProvider())
if (returnedTokens.get('type') === 'recovery') mode = 'reset'

function setStatus(message = '', tone: 'error' | 'success' | 'neutral' = 'neutral') {
  if (!status) return
  status.textContent = message
  status.dataset.tone = tone
  status.hidden = !message
}

function setBusy(busy: boolean) {
  root?.setAttribute('aria-busy', String(busy))
  if (submit) submit.disabled = busy
  root?.querySelectorAll<HTMLButtonElement>('[data-oauth]').forEach(button => { button.disabled = busy })
}

function setMode(next: Mode) {
  mode = next
  if (!root) return
  root.dataset.mode = mode
  root.querySelectorAll<HTMLElement>('[data-mode-copy]').forEach(node => {
    node.hidden = node.dataset.modeCopy !== mode
  })
  email?.closest<HTMLElement>('[data-email-field]')?.toggleAttribute('hidden', mode === 'reset' || mode === 'welcome')
  password?.closest<HTMLElement>('[data-password-field]')?.toggleAttribute('hidden', mode === 'forgot' || mode === 'welcome')
  confirmPassword?.closest<HTMLElement>('[data-confirm-field]')?.toggleAttribute('hidden', mode !== 'reset')
  // Consent to occasional email is asked only when creating an account, never pre-ticked.
  emailOptIn?.closest<HTMLElement>('[data-email-optin-field]')?.toggleAttribute('hidden', mode !== 'create')
  if (submit) submit.hidden = mode === 'welcome'
  if (social) updateStepCounter(root, mode)
  setStatus()
  const url = new URL(location.href)
  if (mode === 'signin') url.searchParams.delete('mode')
  else url.searchParams.set('mode', mode)
  url.searchParams.set('returnTo', returnTo)
  history.replaceState(null, '', url)
}

function returnToLibrary() {
  navigateAfterAuth(returnTo)
}

const SIGNUP_LOGGED_KEY = 'tinct-funnel-signup-logged'

/** signup_completed once per account per device, however the round-trip ends. */
function trackSignupCompleted(userId: string, method: string) {
  try {
    if (localStorage.getItem(SIGNUP_LOGGED_KEY) === userId) return
    localStorage.setItem(SIGNUP_LOGGED_KEY, userId)
  } catch { /* private mode: at worst one duplicate */ }
  trackFunnel('signup_completed', { method })
}

function completeSignIn(session: Session, newAccount = false) {
  const method = pendingProvider() ? 'oauth' : 'email'
  reconcileLabDeviceIdentity(session.user.id)
  setSignedInCookie()
  // The library's own "browsing" note (it had nothing to show the guest) must
  // not open the signed-in reader's library on the new-reader scene first.
  // A browse the reader chose stays.
  try {
    const visit = JSON.parse(sessionStorage.getItem('tinct:library-2-visit') || 'null')
    if (visit?.mode === 'discovery' && visit.auto) sessionStorage.removeItem('tinct:library-2-visit')
  } catch { /* private mode */ }
  rememberPendingProvider(null)
  const clean = new URL(withoutOAuthReturnParams(location.href), location.origin)
  clean.searchParams.delete('callback')
  history.replaceState(null, '', clean)
  if (newAccount || isInitialAccountSession(session.user)) {
    setFunnelToken(session.access_token)
    trackSignupCompleted(session.user.id, method)
    if (social && root) void startSocialSteps(session.access_token)
    else setMode('welcome')
  }
  else returnToLibrary()
}

/** Sign-up steps 2 and 3 (social ship 2); today's welcome screen if profiles cannot be reached. */
function startSocialSteps(token: string) {
  return startProfileSteps(root!, token, {
    setMode: next => setMode(next as Mode),
    setStatus,
    finish: returnToLibrary,
    fallbackWelcome: () => setMode('welcome'),
  })
}

function credentials() {
  return { email: email?.value.trim() || '', password: password?.value || '' }
}

async function submitAuth(event: SubmitEvent) {
  event.preventDefault()
  if (!supabase) {
    setStatus('Sign in is temporarily unavailable.', 'error')
    return
  }
  setBusy(true)
  setStatus()
  try {
    const values = credentials()
    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
      if (!data.session) throw new Error('Sign in did not finish. Please try again.')
      completeSignIn(data.session)
    } else if (mode === 'create') {
      trackFunnel('signup_started', { method: 'email' })
      if (social) rememberSignupConsent(root ?? null)
      const { data, error } = await supabase.auth.signUp({
        ...values,
        options: {
          emailRedirectTo: await authRedirectTo(supabase, returnTo, 'signup', `${location.origin}${LAB_AUTH_CALLBACK_PATH}?callback=signup&returnTo=${encodeURIComponent(returnTo)}`),
          // Recorded on the profile by the email-consent trigger (supabase/migrations/20261002_privacy_consent.sql).
          data: social
            ? { email_opt_in: emailOptIn?.checked === true, email_consent_version: EMAIL_CONSENT_VERSION }
            : { email_opt_in: emailOptIn?.checked === true },
        },
      })
      if (error) throw error
      if (data.session) {
        completeSignIn(data.session, true)
      } else {
        setStatus('Check your email and follow the confirmation link to start reading.', 'success')
      }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: await authRedirectTo(supabase, returnTo, 'reset', `${location.origin}${LAB_AUTH_CALLBACK_PATH}?mode=reset&returnTo=${encodeURIComponent(returnTo)}`),
      })
      if (error) throw error
      setStatus('Password reset link sent. Check your email.', 'success')
    } else if (mode === 'reset') {
      if (!values.password || values.password.length < 8) throw new Error('Use at least 8 characters.')
      if (values.password !== confirmPassword?.value) throw new Error('The passwords do not match.')
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) throw error
      setSignedInCookie()
      setStatus('Password updated.', 'success')
      setTimeout(returnToLibrary, 450)
    }
  } catch (error) {
    setStatus(signInErrorMessage(error), 'error')
  } finally {
    setBusy(false)
  }
}

/** Supabase hands back an AuthError instance; a thrown value may be anything. */
function messageOf(value: unknown): string | null {
  if (typeof value === 'string') return value
  const message = value && typeof value === 'object' ? (value as { message?: unknown }).message : null
  return typeof message === 'string' ? message : null
}

/**
 * Hide any "continue with" button whose provider is not in the capability
 * list. The markup carries all three; `LAB_SIGN_IN_PROVIDERS` decides which
 * of them a reader sees.
 */
function applyProviderCapabilities() {
  root?.querySelectorAll<HTMLButtonElement>('[data-oauth]').forEach(button => {
    button.hidden = !labOAuthProviderOffered(button.dataset.oauth, LAB_SIGN_IN_PROVIDERS)
  })
}

/**
 * The provider whose round-trip is in flight, kept across the redirect so
 * the returning page can name it in the error notice. Session-scoped and
 * best-effort: private mode simply gets the unnamed message.
 */
function rememberPendingProvider(provider: LabOAuthProvider | null) {
  try {
    if (provider) sessionStorage.setItem(LAB_OAUTH_PENDING_KEY, provider)
    else sessionStorage.removeItem(LAB_OAUTH_PENDING_KEY)
  } catch { /* private mode */ }
}

function pendingProvider(): LabOAuthProvider | null {
  try {
    const stored = sessionStorage.getItem(LAB_OAUTH_PENDING_KEY)
    return isLabOAuthProvider(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * The reader came back from a provider that refused (most often one this
 * Supabase project has not switched on yet). Say so in the page's own
 * notice instead of showing a fresh, silent sign-in form, and clean the
 * error off the URL so a reload does not repeat it.
 */
function reportProviderReturnError(): boolean {
  const returned = labOAuthReturnError(location.search, location.hash)
  const provider = pendingProvider()
  rememberPendingProvider(null)
  if (!returned) return false
  history.replaceState(null, '', withoutOAuthReturnParams(location.href))
  setStatus(provider ? labOAuthErrorMessage(provider, returned.description) : returned.description, 'error')
  return true
}

/**
 * Start a provider round-trip. Every provider goes through the same Supabase
 * OAuth path and the same already-validated `returnTo` the Google button has
 * always used, so the reader lands back where they were.
 */
async function signInWithProvider(button: HTMLElement) {
  const provider = button.dataset.oauth
  if (!supabase || !labOAuthProviderOffered(provider, LAB_SIGN_IN_PROVIDERS)) return
  setBusy(true)
  setStatus()
  rememberPendingProvider(provider)
  if (mode === 'create') trackFunnel('signup_started', { method: provider || 'oauth' })
  if (mode === 'create' && social) rememberSignupConsent(root ?? null)
  let failure: unknown = null
  try {
    if (await startNativeOAuth(supabase, provider, returnTo)) { setBusy(false); return }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: labOAuthRedirectTo(location.origin, returnTo) },
    })
    failure = error ?? null
  } catch (thrown) {
    failure = thrown
  }
  // A started round-trip navigates away, so only a call that failed outright
  // gets this far. A provider the project has not enabled does NOT fail here
  // — Supabase builds the /authorize URL and goes; that failure comes back on
  // the return trip and `reportProviderReturnError` handles it.
  if (!failure) return
  rememberPendingProvider(null)
  setStatus(labOAuthErrorMessage(provider, messageOf(failure)), 'error')
  setBusy(false)
}

root?.addEventListener('click', async event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-set-mode], [data-oauth], [data-return]')
  if (!target) return
  if (target.dataset.setMode) setMode(target.dataset.setMode as Mode)
  if (target.hasAttribute('data-return')) returnToLibrary()
  if (target.hasAttribute('data-oauth')) await signInWithProvider(target)
})

form?.addEventListener('submit', submitAuth)

async function initialize() {
  const back = root?.querySelector<HTMLAnchorElement>('[data-auth-back]')
  if (back) {
    back.href = returnTo
    back.textContent = /\/(?:reader|read\/|phone|desktop)/.test(returnTo) ? '← Back to reading' : '← Library'
  }
  root?.querySelectorAll<HTMLElement>('[data-return]').forEach(button => {
    button.textContent = button.closest('[data-mode-copy="welcome"]')
      ? (/\/(?:reader|read\/|phone|desktop)/.test(returnTo) ? 'Continue reading' : 'Explore the library')
      : (/\/(?:reader|read\/|phone|desktop)/.test(returnTo) ? 'Return to reading' : 'Return to Library')
  })
  applyProviderCapabilities()
  try {
    if (!supabase) throw new Error('Sign in is temporarily unavailable.')
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    // Report a failed callback even if the browser still holds an older session.
    if (returnedError || nativeNotice) {
      setMode('signin')
      if (nativeNotice) {
        const clean = new URL(location.href)
        clean.searchParams.delete('native-error')
        history.replaceState(null, '', clean)
        rememberPendingProvider(null)
        setStatus(nativeNotice, 'error')
      } else reportProviderReturnError()
      return
    }
    reconcileLabDeviceIdentity(data.session?.user?.id)
    if (data.session?.user) {
      setSignedInCookie()
      if (mode === 'reset') setMode('reset')
      else if (authReturn) completeSignIn(data.session, callback === 'signup')
      else if (social && (mode === 'profile' || mode === 'reading')) void startSocialSteps(data.session.access_token)
      else if (mode === 'welcome') setMode('welcome')
      // Signed in already: the account is the cards, over the page the reader came from.
      else { navigateAfterAuth(accountLink ? returnTo : cardUrl('you', returnTo), true); return }
      rememberPendingProvider(null)
    } else {
      setMode(mode === 'welcome' || mode === 'profile' || mode === 'reading' ? 'signin' : mode)
      reportProviderReturnError()
    }
  } catch (error) {
    setMode('signin')
    setStatus(messageOf(error) || 'Sign in could not finish. Please try again.', 'error')
  } finally {
    // Ready means the page is painted as it will be read, e-ink rules included.
    await displayProfileStylesReady()
    if (root) root.dataset.ready = 'true'
  }
}

funnel('sign-in')
void initialize()
