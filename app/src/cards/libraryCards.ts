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
import { consumeCardParam, openAccountCards, sessionStorageState, storedSession, type CardName } from './openCards'
import { clearCardsCache, readCardsCache } from './cardsCache'
import { trackFunnel } from '../utils/funnel'

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
let openingTimer: number | null = null
/** No tap is ever swallowed for good: an open that never settles stops counting as in progress after this. */
const OPENING_MS = 8000

/** An open still unsettled after this is reported (the funnel), with what the open path saw. */
const STUCK_MS = 2500

function open(start: CardName = 'you'): void {
  if (opening) return
  opening = true
  if (openingTimer) window.clearTimeout(openingTimer)
  openingTimer = window.setTimeout(() => { opening = false }, OPENING_MS)
  const stuck = window.setTimeout(() => trackFunnel('cards_open_stuck', { ...sessionStorageState(), phase: 'await' }), STUCK_MS)
  const attempt = (retrying: boolean): Promise<void> => openAccountCards({ start, dark: true, deskTop: 68 }).then(opened => {
    if (opened) return
    // Nothing to open with. A browser that still holds a session is not sent to sign in
    // (that page bounces straight back, and with ?card= would loop); the tap is reported.
    const state = sessionStorageState()
    if (state.raw) { trackFunnel('cards_open_stuck', { ...state, phase: 'no-session' }); return }
    location.assign(`/sign-in?returnTo=${encodeURIComponent(cardUrl(start))}`)
  }).catch(error => {
    console.error('account cards: could not open', error)
    trackFunnel('cards_open_failed', { ...sessionStorageState(), retrying })
    // A device cache the cards cannot paint from is dropped, and the open is tried once more without it.
    if (retrying) return
    clearCardsCache(storedSession()?.session.userId ?? null)
    return attempt(true)
  })
  void attempt(false).finally(() => { window.clearTimeout(stuck); opening = false; if (openingTimer) { window.clearTimeout(openingTimer); openingTimer = null } })
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
  // Signed in by the page's class, or by the session this browser still holds:
  // a transient null from Supabase (a stalled refresh, a lock held by another
  // tab) can clear the class while the picture is still up, and the tap then
  // went to the sign-in page and straight back (nothing, to the reader; 11 Oct 2026).
  if (!button || !(signedIn() || storedSession() !== null)) return false
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

/**
 * `/library?diag=1`: what this page sees of the account picture and of each
 * touch on the header, printed on the page (a phone has no console). Booleans,
 * sizes and element names only; never the token. Temporary (11 Oct 2026).
 */
function diagnostics(): void {
  let on = false
  try { on = new URLSearchParams(location.search).get('diag') === '1' } catch { on = false }
  if (!on) return
  const box = document.createElement('pre')
  box.id = 'tinct-diag'
  box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;margin:0;padding:8px;max-height:45vh;overflow:auto;background:#000c;color:#fff;font:11px/1.35 system-ui,sans-serif;white-space:pre-wrap;pointer-events:none;border-radius:8px'
  document.body.append(box)
  const events: string[] = []
  const describe = (node: EventTarget | null): string => {
    const el = node instanceof Element ? node : null
    if (!el) return String(node?.constructor?.name ?? 'none')
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`
  }
  const render = () => {
    const button = document.getElementById('sign-in')
    const r = button?.getBoundingClientRect()
    const cx = r ? r.left + r.width / 2 : 0, cy = r ? r.top + r.height / 2 : 0
    const top = r ? document.elementFromPoint(cx, cy) : null
    const vv = window.visualViewport
    const state = sessionStorageState()
    box.textContent = [
      `html: ${document.documentElement.className || '(no class)'} | opening=${opening}`,
      `session: key=${state.key} raw=${state.raw} parsed=${state.parsed} fresh=${state.fresh} native=${state.native}`,
      `#sign-in: ${button ? describe(button) : 'none'} rect=${r ? [r.left, r.top, r.width, r.height].map(Math.round).join(',') : '-'} onclick=${Boolean(button?.onclick)}`,
      `topmost at its centre: ${describe(top)}`,
      `viewport: ${innerWidth}x${innerHeight} vv=${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)} scale=${vv.scale.toFixed(2)} off=${Math.round(vv.offsetLeft)},${Math.round(vv.offsetTop)}` : '-'} scroll=${Math.round(scrollX)},${Math.round(scrollY)}`,
      `cards root: ${document.querySelector('.tcards') ? 'present' : 'none'}`,
      'events (newest first):',
      ...events.slice(0, 12),
    ].join('\n')
  }
  for (const type of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'] as const) {
    document.addEventListener(type, event => {
      const t = event.target
      const inHeader = t instanceof Element && Boolean(t.closest('#header'))
      if (!inHeader) return
      const pt = 'clientX' in event ? `${Math.round((event as PointerEvent).clientX)},${Math.round((event as PointerEvent).clientY)}` : ''
      events.unshift(`${new Date().toISOString().slice(14, 23)} ${type} ${describe(t)} ${pt}${event.defaultPrevented ? ' (prevented)' : ''}`)
      render()
    }, { capture: true, passive: true })
  }
  window.addEventListener('error', event => { events.unshift(`error ${String(event.message).slice(0, 80)}`); render() })
  window.addEventListener('unhandledrejection', event => { events.unshift(`rejection ${String((event as PromiseRejectionEvent).reason).slice(0, 80)}`); render() })
  render()
  window.setInterval(render, 500)
}

function boot(): void {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', diagnostics, { once: true })
  else diagnostics()
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
