import { supabase } from './services/supabase'
import { clearSignedInCookie, setSignedInCookie } from './utils/authCookie'

export type LabAuthState = {
  ready: boolean
  signedIn: boolean
  email: string | null
}

function publish(state: LabAuthState) {
  ;(window as Window & { __tinctLabAuthState?: LabAuthState }).__tinctLabAuthState = state
  document.querySelectorAll<HTMLAnchorElement>('[data-lab-auth-link]').forEach(link => {
    const returnTo = link.dataset.authReturnTo || '/lab/library'
    link.textContent = state.signedIn ? 'Account' : 'Sign in'
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
    publish({ ready: true, signedIn: false, email: null })
    return
  }
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    const signedIn = Boolean(data.session?.user)
    if (signedIn) setSignedInCookie()
    else clearSignedInCookie()
    publish({ ready: true, signedIn, email: data.session?.user.email || null })
  } catch {
    publish({ ready: true, signedIn: false, email: null })
  }
}

publish({ ready: false, signedIn: false, email: null })
void resolveAuthState()

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    const signedIn = Boolean(session?.user)
    if (signedIn) setSignedInCookie()
    else clearSignedInCookie()
    publish({ ready: true, signedIn, email: session?.user.email || null })
  })
}
