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
} from './lab/labSignInProviders'
import { reconcileLabDeviceIdentity } from './lab/labDeviceIdentity'
import { wipeLabDeviceUserData } from './lab/labSignOut'
import { supabase } from './services/supabase'
import { clearSignedInCookie, setSignedInCookie } from './utils/authCookie'

type Mode = 'signin' | 'create' | 'forgot' | 'reset' | 'account'

const root = document.querySelector<HTMLElement>('#tinct-lab-sign-in')
const form = root?.querySelector<HTMLFormElement>('[data-auth-form]')
const status = root?.querySelector<HTMLElement>('[data-auth-status]')
const submit = root?.querySelector<HTMLButtonElement>('[data-auth-submit]')
const email = root?.querySelector<HTMLInputElement>('[name=email]')
const password = root?.querySelector<HTMLInputElement>('[name=password]')
const confirmPassword = root?.querySelector<HTMLInputElement>('[name=confirmPassword]')
const allowedModes = new Set<Mode>(['signin', 'create', 'forgot', 'reset', 'account'])
const initialParams = new URLSearchParams(location.search)
let mode: Mode = allowedModes.has(initialParams.get('mode') as Mode)
  ? initialParams.get('mode') as Mode
  : 'signin'

const returnTo = safeLabReturnTo(initialParams.get('returnTo'))

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
  email?.closest<HTMLElement>('[data-email-field]')?.toggleAttribute('hidden', mode === 'reset' || mode === 'account')
  password?.closest<HTMLElement>('[data-password-field]')?.toggleAttribute('hidden', mode === 'forgot' || mode === 'account')
  confirmPassword?.closest<HTMLElement>('[data-confirm-field]')?.toggleAttribute('hidden', mode !== 'reset')
  if (submit) submit.hidden = mode === 'account'
  setStatus()
  const url = new URL(location.href)
  if (mode === 'signin') url.searchParams.delete('mode')
  else url.searchParams.set('mode', mode)
  url.searchParams.set('returnTo', returnTo)
  history.replaceState(null, '', url)
}

function returnToLibrary() {
  location.assign(returnTo)
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
      setSignedInCookie()
      // A different account than this device last held: wipe before it reads.
      reconcileLabDeviceIdentity(data.session?.user?.id)
      returnToLibrary()
    } else if (mode === 'create') {
      const { data, error } = await supabase.auth.signUp({
        ...values,
        options: { emailRedirectTo: `${location.origin}/lab/sign-in?returnTo=${encodeURIComponent(returnTo)}` },
      })
      if (error) throw error
      if (data.session) {
        setSignedInCookie()
        reconcileLabDeviceIdentity(data.session.user?.id)
        returnToLibrary()
      } else {
        setStatus('Check your email to confirm your account, then return here to sign in.', 'success')
      }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${location.origin}/lab/sign-in?mode=reset&returnTo=${encodeURIComponent(returnTo)}`,
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
    setStatus(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error')
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
  let failure: unknown = null
  try {
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
  const target = (event.target as Element).closest<HTMLElement>('[data-set-mode], [data-oauth], [data-sign-out], [data-return]')
  if (!target) return
  if (target.dataset.setMode) setMode(target.dataset.setMode as Mode)
  if (target.hasAttribute('data-return')) returnToLibrary()
  if (target.hasAttribute('data-oauth')) await signInWithProvider(target)
  if (target.hasAttribute('data-sign-out') && supabase) {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setStatus(error.message, 'error')
    else {
      clearSignedInCookie()
      // The next person on this device must not inherit this reader's data.
      wipeLabDeviceUserData()
      returnToLibrary()
    }
    setBusy(false)
  }
})

form?.addEventListener('submit', submitAuth)

async function initialize() {
  const back = root?.querySelector<HTMLAnchorElement>('[data-auth-back]')
  if (back) back.href = returnTo
  applyProviderCapabilities()
  if (!supabase) {
    setMode(mode)
    setStatus('Sign in is temporarily unavailable.', 'error')
    return
  }
  const { data } = await supabase.auth.getSession()
  // Every lab sign-in comes back through this page — email and each provider
  // round-trip alike — so it is where a changed identity is caught.
  reconcileLabDeviceIdentity(data.session?.user?.id)
  const accountEmail = root?.querySelector<HTMLElement>('[data-account-email]')
  if (accountEmail) accountEmail.textContent = data.session?.user.email || ''
  if (data.session?.user) setSignedInCookie()
  if (data.session?.user && mode !== 'reset' && mode !== 'create') setMode('account')
  else setMode(mode)
  // After setMode, which clears the status line.
  if (!data.session?.user) reportProviderReturnError()
  else rememberPendingProvider(null)
  if (root) root.dataset.ready = 'true'
}

void initialize()
