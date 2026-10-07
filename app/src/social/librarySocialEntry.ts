/**
 * The library's way into profiles (social ship 2). Loaded by the Worker only
 * while SOCIAL_PROFILES is on (/lab/social-entry.js).
 *
 * - Signed in: the top bar's "Account" becomes your picture, which opens You
 *   (flows.html: "Tap your picture. Signed out, it says Sign in").
 * - Accounts from before profiles have a private profile made for them. They
 *   get one gentle prompt to set it up, here in the library (never inside a
 *   book), once; after that only the quiet row on You and in the reader.
 */
import { supabase } from '../services/supabase'
import { currentBookHint, fetchOwnProfile, ownPictureView, paintAvatar, saveProfile, socialProfilesOn } from './socialClient'

const STYLE = `
#sign-in.social-you{display:inline-grid;place-items:center;width:40px;height:40px;min-width:0;padding:0;border-radius:50%;background:transparent;border:0}
#sign-in.social-you .tinct-avatar{width:34px;height:34px;border-radius:50%;display:inline-grid;place-items:center;background-repeat:no-repeat;background-color:#172015;color:#e8d59e;font:400 15px/1 Georgia,serif;box-shadow:0 0 0 1px rgba(238,231,208,.3)}
#sign-in.social-you .tinct-avatar[data-kind=initial]{background-image:linear-gradient(150deg,#2a3a2a,#18241a)}
.social-prompt{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 24px),420px);z-index:60;background:#1a2318;color:#eee7d0;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.5);padding:18px 18px 12px;font-family:Georgia,serif}
.social-prompt b{display:block;font:700 17px system-ui,-apple-system,sans-serif;margin-bottom:6px}
.social-prompt p{margin:0;color:#b1bba4;font-size:16px;line-height:1.4}
.social-prompt a{display:block;margin-top:14px;padding:11px;border-radius:999px;background:#eee7d0;color:#10150f;text-align:center;text-decoration:none;font:600 15px system-ui,-apple-system,sans-serif}
.social-prompt button{display:block;width:100%;min-height:40px;margin-top:4px;border:0;background:transparent;color:#b1bba4;font:15px Georgia,serif;cursor:pointer}
`

const YOU_URL = `/you?returnTo=${encodeURIComponent('/library')}`

async function start() {
  if (!socialProfilesOn() || !document.documentElement.classList.contains('signed-in') || !supabase) return
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return
  const result = await fetchOwnProfile(token, currentBookHint())
  // Unavailable (SQL not run yet) or off: the library stays exactly as it is.
  if (!result.ok) return
  const profile = result.profile
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  const button = document.getElementById('sign-in')
  if (button) {
    const avatar = document.createElement('span')
    paintAvatar(avatar, ownPictureView(profile), token)
    button.replaceChildren(avatar)
    button.classList.add('social-you')
    button.setAttribute('aria-label', 'You')
    // The library's own handler opens the account page; the picture opens You instead.
    document.addEventListener('click', event => {
      if (!(event.target as Element | null)?.closest?.('#sign-in')) return
      event.preventDefault()
      event.stopPropagation()
      location.assign(YOU_URL)
    }, { capture: true })
  }

  if (profile.shouldPrompt) showPrompt(token)
}

function showPrompt(token: string) {
  const card = document.createElement('div')
  card.className = 'social-prompt'
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-label', 'Set up your profile')
  card.dataset.testid = 'social-prompt'
  const title = document.createElement('b')
  title.textContent = 'Set up your profile'
  const line = document.createElement('p')
  line.textContent = 'Your profile is private. Choose a picture, and who can see your reading, whenever you like.'
  const go = document.createElement('a')
  go.href = `/you?view=settings&returnTo=${encodeURIComponent('/library')}`
  go.textContent = 'Set up'
  const later = document.createElement('button')
  later.type = 'button'
  later.textContent = 'Not now'
  later.addEventListener('click', () => card.remove())
  card.append(title, line, go, later)
  document.body.append(card)
  // Offered once, whatever the reader does with it.
  void saveProfile(token, { prompted: true })
}

void start().catch(() => { /* the library never depends on profiles */ })
