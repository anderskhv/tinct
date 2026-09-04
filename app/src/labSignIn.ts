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

function safeReturnTo(value: string | null) {
  if (!value) return '/lab/library'
  try {
    const destination = new URL(value, location.origin)
    if (destination.origin !== location.origin || !destination.pathname.startsWith('/lab')) return '/lab/library'
    if (/^\/lab\/(?:reader|phone|desktop)(?:\/|$)/.test(destination.pathname)) return '/lab/library'
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch { return '/lab/library' }
}

const returnTo = safeReturnTo(initialParams.get('returnTo'))

function setStatus(message = '', tone: 'error' | 'success' | 'neutral' = 'neutral') {
  if (!status) return
  status.textContent = message
  status.dataset.tone = tone
  status.hidden = !message
}

function setBusy(busy: boolean) {
  root?.setAttribute('aria-busy', String(busy))
  if (submit) submit.disabled = busy
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
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
      setSignedInCookie()
      returnToLibrary()
    } else if (mode === 'create') {
      const { data, error } = await supabase.auth.signUp({
        ...values,
        options: { emailRedirectTo: `${location.origin}/lab/sign-in?returnTo=${encodeURIComponent(returnTo)}` },
      })
      if (error) throw error
      if (data.session) {
        setSignedInCookie()
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

root?.addEventListener('click', async event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-set-mode], [data-google], [data-sign-out], [data-return]')
  if (!target) return
  if (target.dataset.setMode) setMode(target.dataset.setMode as Mode)
  if (target.hasAttribute('data-return')) returnToLibrary()
  if (target.hasAttribute('data-google') && supabase) {
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/lab/sign-in?returnTo=${encodeURIComponent(returnTo)}` },
    })
    if (error) {
      setStatus(error.message, 'error')
      setBusy(false)
    }
  }
  if (target.hasAttribute('data-sign-out') && supabase) {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setStatus(error.message, 'error')
    else {
      clearSignedInCookie()
      returnToLibrary()
    }
    setBusy(false)
  }
})

form?.addEventListener('submit', submitAuth)

async function initialize() {
  const back = root?.querySelector<HTMLAnchorElement>('[data-auth-back]')
  if (back) back.href = returnTo
  if (!supabase) {
    setMode(mode)
    setStatus('Sign in is temporarily unavailable.', 'error')
    return
  }
  const { data } = await supabase.auth.getSession()
  const accountEmail = root?.querySelector<HTMLElement>('[data-account-email]')
  if (accountEmail) accountEmail.textContent = data.session?.user.email || ''
  if (data.session?.user) setSignedInCookie()
  if (data.session?.user && mode !== 'reset' && mode !== 'create') setMode('account')
  else setMode(mode)
  if (root) root.dataset.ready = 'true'
}

void initialize()
