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

function publish(state: LabAuthState) {
  ;(window as Window & { __tinctLabAuthState?: LabAuthState }).__tinctLabAuthState = state
  document.querySelectorAll<HTMLAnchorElement>('[data-lab-auth-link]').forEach(link => {
    const returnTo = link.dataset.authReturnTo || '/lab/library'
    link.textContent = state.signedIn ? (link.hasAttribute('data-lab-auth-name') && state.name ? state.name : 'Account') : 'Sign in'
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
