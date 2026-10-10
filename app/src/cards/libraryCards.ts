/**
 * The library's way into the account cards (/lab/account-cards.js, loaded by
 * the library page). Signed in, the top bar's "Account" becomes the reader's
 * picture, the size of the search icon; it opens the cards over the library,
 * in the dark theme, without leaving the page. An old account link arrives as
 * /library?card=<name> and opens that card.
 *
 * Accounts from before profiles get one gentle prompt to set theirs up, here
 * in the library (never inside a book), once.
 */
import { supabase } from '../services/supabase'
import { fetchOwnProfile, ownPictureView, paintAvatar, saveProfile, currentBookHint } from '../social/socialClient'
import { cardUrl } from './cardRoutes'
import { consumeCardParam, openAccountCards, storedSession, type CardName } from './openCards'
import { readCardsCache } from './cardsCache'

const STYLE = `
#sign-in.cards-you{display:inline-grid;place-items:center;width:44px;height:44px;min-width:0;padding:0;border-radius:50%;background:transparent;border:0}
#sign-in.cards-you .tinct-avatar{width:24px;height:24px;border-radius:50%;display:inline-grid;place-items:center;background-repeat:no-repeat;background-color:#6a6a6a;color:#fff;font:700 12px/1 "Playfair Display",Georgia,serif;box-shadow:0 0 0 1px rgba(238,238,238,.4)}
.social-prompt{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 24px),420px);z-index:60;background:#1a2318;color:#eee7d0;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.5);padding:18px 18px 12px;font-family:Georgia,serif}
.social-prompt b{display:block;font:700 17px system-ui,-apple-system,sans-serif;margin-bottom:6px}
.social-prompt p{margin:0;color:#b1bba4;font-size:16px;line-height:1.4}
.social-prompt .go{display:block;width:100%;margin-top:14px;padding:11px;border:0;border-radius:999px;background:#eee7d0;color:#10150f;text-align:center;font:600 15px system-ui,-apple-system,sans-serif;cursor:pointer}
.social-prompt .later{display:block;width:100%;min-height:40px;margin-top:4px;border:0;background:transparent;color:#b1bba4;font:15px Georgia,serif;cursor:pointer}
`

function signedIn(): boolean {
  return document.documentElement.classList.contains('signed-in')
}

let opening = false

function open(start: CardName = 'you'): void {
  if (opening) return
  opening = true
  void openAccountCards({ start, dark: true, deskTop: 68 }).then(opened => {
    if (!opened) location.assign(`/sign-in?returnTo=${encodeURIComponent(cardUrl(start))}`)
  }).catch(error => {
    console.error('account cards: could not open', error)
  }).finally(() => { opening = false })
}

/**
 * The tap on the top bar's picture, delegated from the document (capture), so
 * it works whatever the library does to its header and whenever this script
 * runs: bound once at load, before the signed-in check, and it matches the
 * account button itself, not only once it shows the picture. Signed out, the
 * library's own handler (sign in) runs.
 */
export function accountButtonTap(event: Event): boolean {
  const target = event.target as Element | null
  const button = target?.closest?.('#sign-in')
  if (!button || !signedIn()) return false
  event.preventDefault()
  event.stopPropagation()
  open()
  return true
}

let started = false

async function start(pending: CardName | null): Promise<void> {
  if (started || !signedIn() || !supabase) return
  started = true
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)
  const avatar = document.createElement('span')
  if (pending) open(pending)
  // At once, from the session stored in this browser and this device's last
  // profile: the picture the reader chose, else an empty disc. Never a
  // stand-in letter ("R" for "Reader" showed for seconds on iPhone, where
  // getSession() can wait behind a token refresh).
  const stored = storedSession()
  const known = readCardsCache(stored?.session.userId ?? null)?.profile ?? null
  const show = (token: string) => {
    paintAvatar(avatar, known ? ownPictureView(known) : { kind: 'initial', initial: '' }, token)
    // Looked up now: the header may have been drawn again since the script loaded.
    const button = document.getElementById('sign-in')
    if (button && !button.contains(avatar)) {
      button.replaceChildren(avatar)
      button.classList.add('cards-you')
      button.setAttribute('aria-label', 'You')
    }
  }
  if (stored) show(stored.session.token)
  let token = stored?.fresh ? stored.session.token : ''
  if (!token) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token ?? ''
  }
  if (!token) return
  if (!stored) show(token)
  const result = await fetchOwnProfile(token, currentBookHint())
  if (!result.ok) return
  paintAvatar(avatar, ownPictureView(result.profile), token)
  if (result.profile.shouldPrompt) showPrompt(token)
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
  const go = document.createElement('button')
  go.type = 'button'
  go.className = 'go'
  go.textContent = 'Set up'
  go.addEventListener('click', () => { card.remove(); open('settings') })
  const later = document.createElement('button')
  later.type = 'button'
  later.className = 'later'
  later.textContent = 'Not now'
  later.addEventListener('click', () => card.remove())
  card.append(title, line, go, later)
  document.body.append(card)
  // Offered once, whatever the reader does with it.
  void saveProfile(token, { prompted: true })
}

function boot(): void {
  // The library's own handler goes to the account page; signed in, the picture opens the cards instead.
  document.addEventListener('click', accountButtonTap, { capture: true })
  const pending = consumeCardParam()
  if (signedIn()) { void start(pending).catch(() => {}); return }
  // The library marks a signed-in device from its cookie at boot; the auth check may mark it later.
  const observer = new MutationObserver(() => {
    if (!signedIn()) return
    observer.disconnect()
    void start(pending).catch(() => {})
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  // An old link opened while signed out: sign in, then come back to the card.
  if (pending) {
    observer.disconnect()
    location.assign(`/sign-in?returnTo=${encodeURIComponent(cardUrl(pending))}`)
  }
}

boot()
