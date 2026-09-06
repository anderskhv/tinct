import { supabase } from './services/supabase'
import { clearSignedInCookie, setSignedInCookie } from './utils/authCookie'

export type LabAuthState = {
  ready: boolean
  signedIn: boolean
  email: string | null
  /** Short display name for signed-in chrome: first name from profile metadata, else the email's local part. */
  name: string | null
}

type UserLike = { email?: string | null; user_metadata?: Record<string, unknown> | null } | null | undefined

export function displayNameFor(user: UserLike): string | null {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const candidates = [metadata.full_name, metadata.name, metadata.given_name, metadata.first_name]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim().split(/\s+/)[0]
  }
  const local = typeof user.email === 'string' ? user.email.split('@')[0].trim() : ''
  return local || null
}

/** The account glyph's letter: the first letter of the display name. */
export function accountInitial(name: string | null): string {
  const first = (name ?? '').trim().charAt(0)
  return first ? first.toLocaleUpperCase() : ''
}

function span(className: string, text: string, hidden = false): HTMLSpanElement {
  const element = document.createElement('span')
  element.className = className
  element.textContent = text
  if (hidden) element.setAttribute('aria-hidden', 'true')
  return element
}

function publish(state: LabAuthState) {
  ;(window as Window & { __tinctLabAuthState?: LabAuthState }).__tinctLabAuthState = state
  document.querySelectorAll<HTMLAnchorElement>('[data-lab-auth-link]').forEach(link => {
    const returnTo = link.dataset.authReturnTo || '/lab/library'
    const named = state.signedIn && link.hasAttribute('data-lab-auth-name') && state.name
    if (named) {
      // The name on wide screens, a small circular glyph with the initial on
      // phones (see .lib-acct-* in lab/index.html); the link is named for both.
      link.replaceChildren(span('lib-acct-name', state.name as string), span('lib-acct-glyph', accountInitial(state.name), true))
      link.setAttribute('aria-label', `${state.name} — account`)
    } else {
      link.textContent = state.signedIn ? 'Account' : 'Sign in'
      link.removeAttribute('aria-label')
    }
    link.href = state.signedIn
      ? `/lab/sign-in?mode=account&returnTo=${encodeURIComponent(returnTo)}`
      : `/lab/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    link.dataset.authReady = String(state.ready)
    link.dataset.signedIn = String(state.signedIn)
  })
  window.dispatchEvent(new CustomEvent<LabAuthState>('tinct:lab-auth-state', { detail: state }))
}

async function resolveAuthState() {
  if (!supabase) {
    publish({ ready: true, signedIn: false, email: null, name: null })
    return
  }
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    const signedIn = Boolean(data.session?.user)
    if (signedIn) setSignedInCookie()
    else clearSignedInCookie()
    publish({ ready: true, signedIn, email: data.session?.user.email || null, name: displayNameFor(data.session?.user) })
  } catch {
    publish({ ready: true, signedIn: false, email: null, name: null })
  }
}

publish({ ready: false, signedIn: false, email: null, name: null })
void resolveAuthState()

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    const signedIn = Boolean(session?.user)
    if (signedIn) setSignedInCookie()
    else clearSignedInCookie()
    publish({ ready: true, signedIn, email: session?.user.email || null, name: displayNameFor(session?.user) })
  })
}

/** QA hook: render a signed-in header without an account (browser evidence only). */
;(window as Window & { __tinctLabAuthStatus?: unknown }).__tinctLabAuthStatus = {
  publishForTest: (state: Partial<LabAuthState>) => publish({ ready: true, signedIn: false, email: null, name: null, ...state }),
}
