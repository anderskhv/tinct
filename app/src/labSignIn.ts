import type { Session } from '@supabase/supabase-js'
import { EMAIL_CODE_NEW_ACCOUNT_WINDOW_MS, isInitialAccountSession, navigateAfterAuth } from './lab/labAuthCompletion'
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
import { rememberEmptyLibrary } from './lab/libraryRoom'
import { displayProfileStylesReady } from './lab/displayProfileStyles'
import { supabase } from './services/supabase'
import { signInErrorMessage } from './services/browserAuthStorage'
import { funnel, setFunnelToken, trackFunnel } from './utils/funnel'
import { setSignedInCookie } from './utils/authCookie'
import { cardUrl } from './cards/cardRoutes'
import { enhanceSignInPage, startProfileSteps, updateStepCounter } from './social/signUpSteps'
import { fetchOwnProfile } from './social/socialClient'
import { EMAIL_CODE_LENGTH, EMAIL_CODE_RESEND_SECONDS, codeFromText, emailCodeErrorMessage, isGmailAddress, looksLikeEmail } from './lab/labEmailCode'

/** signin: Google or an email code. code: the code for signing in. confirm: the one-time code that confirms an
 * older password account's address. password: password accounts (kept for now). reset: an old recovery link. */
type Mode = 'signin' | 'password' | 'code' | 'confirm' | 'reset' | 'welcome' | 'profile' | 'reading'

const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')
const form = root?.querySelector<HTMLFormElement>('[data-auth-form]')
const status = root?.querySelector<HTMLElement>('[data-auth-status]')
const submit = root?.querySelector<HTMLButtonElement>('[data-auth-submit]')
const email = root?.querySelector<HTMLInputElement>('[name=email]')
const password = root?.querySelector<HTMLInputElement>('[name=password]')
const confirmPassword = root?.querySelector<HTMLInputElement>('[name=confirmPassword]')
const codeBox = root?.querySelector<HTMLElement>('[data-code]')
const codeInput = root?.querySelector<HTMLInputElement>('[data-code-input]')
const codeResend = root?.querySelector<HTMLButtonElement>('[data-code-resend]')
const codeWait = root?.querySelector<HTMLElement>('[data-code-wait]')
const initialParams = new URLSearchParams(location.search)
// The old account page (?mode=account, "Your Tinct account") is the Account card now:
// signed in, the reader goes straight to it over the page they came from; signed
// out, they sign in first and land on it.
const accountLink = initialParams.get('mode') === 'account'
const returnTo = accountLink ? cardUrl('account', safeLabReturnTo(initialParams.get('returnTo'))) : safeLabReturnTo(initialParams.get('returnTo'))
// Back from sign-in, a text or file kept on /byob goes back to /byob, where it still is.
const preparingReturn = /^\/preparing(?:[/?#]|$)/.test(returnTo)
// Profiles (social ship 2): only when the Worker marks the page; otherwise nothing changes.
const social = enhanceSignInPage(root ?? null)
const allowedModes = new Set<Mode>(['signin', 'password', 'reset', 'welcome', ...(social ? ['profile', 'reading'] as Mode[] : [])])
// One way in now: the old "create" and "forgot" links (reader prompts, emails) open the same sheet (onboarding v3).
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

/**
 * Busy from the first tap until the reader is somewhere new (the profile step, the code, or back in the book), never
 * re-enabled while that is loading: a second tap made a second account ("User already registered", scan 2 Nov 2026).
 */
let inFlight = false
function setBusy(busy: boolean) {
  inFlight = busy
  root?.setAttribute('aria-busy', String(busy))
  if (submit) submit.disabled = busy
  if (codeInput) codeInput.readOnly = busy
  root?.querySelectorAll<HTMLButtonElement>('[data-oauth]').forEach(button => { button.disabled = busy })
}

function setMode(next: Mode) {
  mode = next
  if (!root) return
  root.dataset.mode = mode
  root.querySelectorAll<HTMLElement>('[data-mode-copy]').forEach(node => {
    node.hidden = node.dataset.modeCopy !== mode
  })
  email?.closest<HTMLElement>('[data-email-field]')?.toggleAttribute('hidden', mode !== 'signin' && mode !== 'password')
  password?.closest<HTMLElement>('[data-password-field]')?.toggleAttribute('hidden', mode !== 'password' && mode !== 'reset')
  if (password) password.autocomplete = mode === 'reset' ? 'new-password' : 'current-password'
  confirmPassword?.closest<HTMLElement>('[data-confirm-field]')?.toggleAttribute('hidden', mode !== 'reset')
  if (codeBox) codeBox.hidden = mode !== 'code' && mode !== 'confirm'
  if (submit) submit.hidden = mode === 'welcome'
  if (social) updateStepCounter(root, mode)
  setStatus()
  const url = new URL(location.href)
  // The code screens are not a place to come back to: a reload starts again at the sheet.
  if (mode === 'signin' || mode === 'code' || mode === 'confirm') url.searchParams.delete('mode')
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

async function completeSignIn(session: Session, newAccount = false, method: string = pendingProvider() ? 'oauth' : 'email', windowMs?: number): Promise<void> {
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
  if (newAccount || isInitialAccountSession(session.user, windowMs)) {
    // A new account has no books yet: its first library opens on Frankenstein, not on the empty table.
    try { rememberEmptyLibrary(window.localStorage, session.user.id) } catch { /* private mode */ }
    setFunnelToken(session.access_token)
    trackSignupCompleted(session.user.id, method)
    if (social && root) await startSocialSteps(session)
    // A text or file chosen on /byob opens straight away (approved paste flow, 5 Nov 2026): no "Explore the library" card first.
    else if (preparingReturn) returnToLibrary()
    else setMode('welcome')
    setBusy(false)
  }
  else returnToLibrary()
}

/** Sign-up steps 2 and 3 (social ship 2); today's welcome screen if profiles cannot be reached. */
function startSocialSteps(session: Session) {
  const meta = (session.user?.user_metadata ?? {}) as Record<string, unknown>
  const googlePhotoUrl = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null
  return startProfileSteps(root!, session.access_token, {
    setMode: next => setMode(next as Mode),
    setStatus,
    finish: returnToLibrary,
    fallbackWelcome: () => setMode('welcome'),
  }, { googlePhotoUrl })
}

function credentials() {
  return { email: email?.value.trim() || '', password: password?.value || '' }
}

async function submitAuth(event: SubmitEvent) {
  event.preventDefault()
  if (inFlight) return
  if (!supabase) {
    setStatus('Sign in is temporarily unavailable.', 'error')
    return
  }
  setBusy(true)
  setStatus()
  try {
    const values = credentials()
    if (mode === 'signin') {
      if (!looksLikeEmail(values.email)) throw new Error('Please enter your email address.')
      trackFunnel('signup_started', { method: 'email_code' })
      await sendCode(values.email, 'code')
      return
    }
    if (mode === 'password') {
      const { data, error } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
      if (!data.session) throw new Error('Sign in did not finish. Please try again.')
      // An address never confirmed (password sign-ups since 9 May): one code, once, before going on.
      if (social && await needsConfirmation(data.session)) {
        try { await sendCode(values.email, 'confirm'); return } catch { /* No code could be sent now: go on, and ask next time. */ }
      }
      await completeSignIn(data.session)
      return
    }
    if (mode === 'reset') {
      if (!values.password || values.password.length < 8) throw new Error('Use at least 8 characters.')
      if (values.password !== confirmPassword?.value) throw new Error('The passwords do not match.')
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) throw error
      setSignedInCookie()
      setStatus('Password updated.', 'success')
      setTimeout(returnToLibrary, 450)
      return
    }
    setBusy(false)
  } catch (error) {
    setStatus(emailCodeErrorMessage(error) ?? signInErrorMessage(error), 'error')
    setBusy(false)
  }
}

/** Whether this password account's address still needs confirming (Tinct's own profiles.email_confirmed_at). */
async function needsConfirmation(session: Session): Promise<boolean> {
  try {
    const result = await fetchOwnProfile(session.access_token, null)
    return result.ok && !result.profile.emailConfirmed
  } catch {
    return false
  }
}

let codeEmail = ''
let resendTimer = 0

/** Send a 6-digit code and show the code screen. 'code' signs in (and makes a new account); 'confirm' never does. */
async function sendCode(address: string, purpose: 'code' | 'confirm') {
  if (!supabase) throw new Error('Sign in is temporarily unavailable.')
  const { error } = await supabase.auth.signInWithOtp({ email: address, options: { shouldCreateUser: purpose === 'code' } })
  if (error) throw error
  codeEmail = address
  showCodeScreen(purpose)
}

function showCodeScreen(purpose: 'code' | 'confirm') {
  setMode(purpose)
  setBusy(false)
  const set = (selector: string, text: string) => { const node = root?.querySelector<HTMLElement>(selector); if (node) node.textContent = text }
  set('[data-code-title]', purpose === 'confirm' ? 'Confirm your email' : 'Check your email')
  set('[data-code-lead]', purpose === 'confirm' ? 'Once only: enter the 6-digit code we sent to' : 'We sent a 6-digit code to')
  set('[data-code-email]', codeEmail)
  set('[data-code-hint]', purpose === 'confirm' ? 'It confirms your address and takes you on.' : 'It signs you in as soon as the last digit is in.')
  const change = root?.querySelector<HTMLElement>('[data-code-change]')
  if (change) change.hidden = purpose === 'confirm'
  const gmail = root?.querySelector<HTMLElement>('[data-open-gmail]')
  if (gmail) gmail.hidden = !isGmailAddress(codeEmail)
  if (codeInput) { codeInput.value = ''; paintCode() ; codeInput.focus() }
  startResendWait()
}

function paintCode(error = false) {
  const digits = codeInput?.value ?? ''
  const boxes = root?.querySelectorAll<HTMLElement>('.auth-code-box') ?? []
  boxes.forEach((box, index) => {
    box.textContent = digits[index] ?? ''
    box.classList.toggle('is-next', index === Math.min(digits.length, EMAIL_CODE_LENGTH - 1) && document.activeElement === codeInput)
  })
  codeInput?.closest<HTMLElement>('.auth-code-boxes')?.setAttribute('data-error', String(error))
}

function startResendWait() {
  window.clearInterval(resendTimer)
  let left = EMAIL_CODE_RESEND_SECONDS
  const tick = () => {
    if (codeResend) codeResend.disabled = left > 0
    if (codeWait) codeWait.textContent = left > 0 ? ` in 0:${String(left).padStart(2, '0')}` : ''
    if (left <= 0) window.clearInterval(resendTimer)
    left -= 1
  }
  tick()
  resendTimer = window.setInterval(tick, 1000)
}

async function verifyCode() {
  if (!supabase || inFlight || !codeInput) return
  const token = codeInput.value
  if (token.length !== EMAIL_CODE_LENGTH) return
  const purpose = mode === 'confirm' ? 'confirm' : 'code'
  setBusy(true)
  setStatus()
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email: codeEmail, token, type: 'email' })
    if (error) throw error
    if (!data.session) throw new Error('Sign in did not finish. Please try again.')
    window.clearInterval(resendTimer)
    // This session was begun with the code: the profile read records the address as confirmed (routes/profiles.ts).
    if (purpose === 'confirm') { await fetchOwnProfile(data.session.access_token, null).catch(() => null); await completeSignIn(data.session) }
    else await completeSignIn(data.session, false, 'email_code', EMAIL_CODE_NEW_ACCOUNT_WINDOW_MS)
  } catch (error) {
    codeInput.value = ''
    paintCode(true)
    setStatus(emailCodeErrorMessage(error) ?? signInErrorMessage(error), 'error')
    setBusy(false)
    codeInput.focus()
  }
}

function takeCode(text: string) {
  if (!codeInput || codeInput.readOnly) return
  const digits = codeFromText(text)
  if (codeInput.value !== digits) codeInput.value = digits
  paintCode()
  if (digits.length === EMAIL_CODE_LENGTH) void verifyCode()
}
codeInput?.addEventListener('input', () => takeCode(codeInput.value))
// A pasted code arrives whole, spaces, words and line breaks included: read it before the field trims it.
codeInput?.addEventListener('paste', event => {
  const text = event.clipboardData?.getData('text')
  if (!text) return
  event.preventDefault()
  takeCode(text)
})
// "Paste code": a visible way in for phones whose press-and-hold menu does not appear on the boxes.
const codePaste = root?.querySelector<HTMLButtonElement>('[data-code-paste]')
if (codePaste && typeof navigator.clipboard?.readText === 'function') {
  codePaste.hidden = false
  codePaste.addEventListener('click', () => {
    navigator.clipboard.readText().then(takeCode, () => codeInput?.focus())
  })
}
codeInput?.addEventListener('focus', () => paintCode())
codeInput?.addEventListener('blur', () => paintCode())

codeResend?.addEventListener('click', async () => {
  if (inFlight || !codeEmail) return
  const purpose = mode === 'confirm' ? 'confirm' : 'code'
  setBusy(true)
  setStatus()
  try {
    await sendCode(codeEmail, purpose)
    setStatus('A new code is on its way.', 'success')
  } catch (error) {
    setStatus(emailCodeErrorMessage(error) ?? signInErrorMessage(error), 'error')
    setBusy(false)
  }
})

root?.querySelector('[data-code-change]')?.addEventListener('click', () => {
  window.clearInterval(resendTimer)
  setMode('signin')
  if (email) { email.value = codeEmail; email.focus() }
})

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
  if (!supabase || inFlight || !labOAuthProviderOffered(provider, LAB_SIGN_IN_PROVIDERS)) return
  setBusy(true)
  setStatus()
  rememberPendingProvider(provider)
  trackFunnel('signup_started', { method: provider || 'oauth' })
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
    back.href = preparingReturn ? '/byob' : returnTo
    back.textContent = preparingReturn ? '← Back' : /\/(?:reader|read\/|phone|desktop)/.test(returnTo) ? '← Back to reading' : '← Library'
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
      else if (authReturn) { setBusy(true); await completeSignIn(data.session, callback === 'signup') }
      else if (social && (mode === 'profile' || mode === 'reading')) void startSocialSteps(data.session)
      else if (mode === 'welcome') setMode('welcome')
      // Signed in already: the account is the cards, over the page the reader came from.
      else { navigateAfterAuth(accountLink || preparingReturn ? returnTo : cardUrl('you', returnTo), true); return }
      rememberPendingProvider(null)
    } else {
      setMode(mode === 'welcome' || mode === 'profile' || mode === 'reading' || mode === 'reset' ? 'signin' : mode)
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
