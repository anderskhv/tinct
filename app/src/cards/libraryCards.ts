/**
 * The library's way into the account cards (/lab/account-cards.js, loaded by
 * the library page). Signed in, the top bar's "Account" becomes the reader's
 * picture, the size of the search icon; it opens the cards over the library,
 * in the dark theme, without leaving the page. An old account link arrives as
 * /library?card=<name> and opens that card.
 *
 * Accounts from before profiles get one gentle prompt to set theirs up, here
 * in the library (never inside a book), once. One that still carries the
 * neutral name and was never set up gets the sign-up profile step itself
 * instead (name, picture, background; signUpSteps.ts), once (15 Oct 2026).
 */
import { supabase } from '../services/supabase'
import { fetchOwnProfile, ownPictureView, paintAvatar, privateImageUrl, saveProfile, currentBookHint } from '../social/socialClient'
import { cardUrl } from './cardRoutes'
import { consumeCardParam, openAccountCards, sessionStorageState, storedSession, type CardName } from './openCards'
import { clearCardsCache, readCardsCache } from './cardsCache'
import { trackFunnel } from '../utils/funnel'
import { NEUTRAL_READER_NAME } from './cardsCopy'
import type { OwnProfile } from '../social/socialClient'
import { avatarSignature, captureAvatar, clearAvatarCache, headerPictureView, paintCachedAvatar, readAvatarCache, writeAvatarCache } from './avatarCache'
import type { PictureView } from '../social/profileRules'
import { fetchFollowRequests, socialFriendsOn } from '../social/friendsClient'
import { FOLLOW_REQUESTS_SEEN_EVENT, REQUEST_DOT_CLASS, requestDotDue, type RequestRow } from '../social/followRequests'
import { FINDABLE_NOTICE_ATTR, FINDABLE_NOTICE_COPY, checkFindableNoticeAccount, dismissFindableNotice, findableNoticeDue, findableNoticeFor, findableNoticeText, markFindableNoticeShown, recordFindableNoticeSeen } from '../social/findableNotice'
import { WHATS_NEW_ATTR, WHATS_NEW_COPY, checkWhatsNewAccount, dismissWhatsNew, markWhatsNewShown, whatsNewDue, whatsNewFor } from '../social/whatsNew'

/** Set on this device once the profile step was offered to an older account (signed-out wipes it with the rest of tinct:*). */
export const LEGACY_SETUP_KEY_PREFIX = 'tinct:profile-step-offered:'

/**
 * An account from before profiles that never chose anything and still has the
 * neutral name gets the profile step new sign-ups get: once, never in a book.
 * Choosing Continue or Skip there marks the profile set up, so it never comes
 * back; the device mark covers leaving the step without either.
 */
export function legacyProfileStepDue(profile: Pick<OwnProfile, 'needsSetup' | 'name'> & { shouldPrompt?: boolean }, userId: string | null): boolean {
  // Offered once per account: a profile that was offered the step (or skipped it, 22 Oct 2026) is not sent back.
  if (!profile.needsSetup || profile.name !== NEUTRAL_READER_NAME || !userId || profile.shouldPrompt === false) return false
  try { return localStorage.getItem(LEGACY_SETUP_KEY_PREFIX + userId) === null } catch { return false }
}

/** The sign-up profile step (/sign-in?mode=profile), back to `returnTo` when done. */
export function legacyProfileStepUrl(returnTo: string): string {
  return `/sign-in?mode=profile&returnTo=${encodeURIComponent(returnTo)}`
}

function offerLegacyProfileStep(token: string, userId: string, returnTo: string): void {
  try { localStorage.setItem(LEGACY_SETUP_KEY_PREFIX + userId, '1') } catch { return }
  // The gentle prompt is not shown as well.
  void saveProfile(token, { prompted: true })
  location.assign(legacyProfileStepUrl(returnTo))
}

const STYLE = `
#sign-in.cards-you{display:inline-grid;place-items:center;width:44px;height:44px;min-width:0;padding:0;border-radius:50%;background:transparent;border:0}
#sign-in.cards-you{position:relative}
#sign-in.cards-you .${REQUEST_DOT_CLASS}{position:absolute;top:8px;right:7px;width:9px;height:9px;border-radius:50%;background:#78aabd;box-shadow:0 0 0 2px rgba(16,21,15,.85);pointer-events:none}
#sign-in.cards-you .tinct-avatar{width:24px;height:24px;border-radius:50%;display:inline-grid;place-items:center;background-repeat:no-repeat;background-color:#6a6a6a;color:#fff;font:700 12px/1 "Playfair Display",Georgia,serif;box-shadow:0 0 0 1px rgba(238,238,238,.4)}
.social-prompt{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 24px),420px);z-index:60;background:#1a2318;color:#eee7d0;border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.5);padding:18px 18px 12px;font-family:Georgia,serif}
.social-prompt b{display:block;font:700 17px system-ui,-apple-system,sans-serif;margin-bottom:6px}
.social-prompt p{margin:0;color:#b1bba4;font-size:16px;line-height:1.4}
.social-prompt .go{display:block;width:100%;margin-top:14px;padding:11px;border:0;border-radius:999px;background:#eee7d0;color:#10150f;text-align:center;font:600 15px system-ui,-apple-system,sans-serif;cursor:pointer}
.social-prompt .later{display:block;width:100%;min-height:40px;margin-top:4px;border:0;background:transparent;color:#b1bba4;font:15px Georgia,serif;cursor:pointer}
/* Above the librarian orb (110), which otherwise sat on the card on a phone. */
.whats-new{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 28px),560px);box-sizing:border-box;z-index:111;display:flex;flex-direction:column;gap:16px;padding:20px 20px 10px;border-radius:18px;background:#1c261e;color:#f3ead8;box-shadow:0 10px 30px rgba(0,0,0,.45)}
@media(min-width:700px){.whats-new{bottom:28px;padding:24px 26px 12px}}
.whats-new h2{margin:0;font:700 26px/1.2 "Playfair Display",Georgia,serif;color:#f3ead8}
.whats-new ul{display:flex;flex-direction:column;gap:16px;margin:0;padding:0;list-style:none}
.whats-new li{display:flex;gap:12px;align-items:flex-start}
.whats-new li::before{content:"";flex:none;width:6px;height:6px;margin-top:11px;border-radius:50%;background:#e8dcc0}
.whats-new li b{display:block;font:600 19px/1.3 "EB Garamond",Georgia,serif;color:#f3ead8}
.whats-new li span{display:block;font:17px/1.4 "EB Garamond",Georgia,serif;color:#cfc6b2}
.whats-new .go{min-height:50px;border:0;border-radius:25px;background:#efe6d2;color:#111;font:600 17px system-ui,-apple-system,sans-serif;cursor:pointer}
.whats-new .later{min-height:40px;border:0;background:transparent;color:#cfc6b2;font:17px "EB Garamond",Georgia,serif;cursor:pointer}
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
  // boot.js may already show this device's copy on the bare button (--own-avatar, from
  // the page's head); this disc takes its place at the same size: no shift, no second picture.
  const avatar = document.createElement('span')
  if (pending) open(pending)
  // At once, from the session stored in this browser and this device's copy of
  // the reader's own picture (avatarCache.ts), else the last profile the cards
  // showed: the picture the reader chose, else an empty disc. Never a stand-in
  // letter ("R" for "Reader" showed for seconds on iPhone, where getSession()
  // can wait behind a token refresh).
  const stored = storedSession()
  let userId = stored?.session.userId ?? null
  const kept = readAvatarCache(userId)
  const known = readCardsCache(userId)?.profile ?? null
  const mount = () => {
    // Looked up now: the header may have been drawn again since the script loaded.
    const button = document.getElementById('sign-in')
    if (button && !button.contains(avatar)) {
      button.replaceChildren(avatar)
      button.classList.add('cards-you')
      button.setAttribute('aria-label', 'You')
    }
  }
  const show = (token: string) => {
    if (kept) paintCachedAvatar(avatar, kept.src)
    else paintAvatar(avatar, known ? headerPictureView(ownPictureView(known)) : { kind: 'initial', initial: '' }, token)
    mount()
  }
  if (stored) show(stored.session.token)
  let token = stored?.fresh ? stored.session.token : ''
  if (!token) {
    const { data } = await supabase.auth.getSession()
    token = data.session?.access_token ?? ''
    userId = userId ?? data.session?.user.id ?? null
  }
  if (!token) return
  if (!stored) show(token)
  const result = await fetchOwnProfile(token, currentBookHint())
  if (!result.ok) return
  // Then the profile: the same picture keeps the copy already shown (nothing is
  // downloaded); a different one is painted and a new copy kept for next time.
  const view = headerPictureView(ownPictureView(result.profile))
  const sig = avatarSignature(view)
  if (!kept || kept.sig !== sig) {
    paintAvatar(avatar, view, token)
    mount()
    if (sig && view.kind === 'image') void keepAvatar(userId, sig, view, token)
    else clearAvatarCache(userId)
  }
  if (socialFriendsOn()) void showRequestDot(token, userId, mount)
  // Returning readers (accounts more than 30 days old): the What's-new card, once,
  // in place of the findable notice and before any profile prompt (22 Oct 2026).
  if (socialFriendsOn() && userId && whatsNewFor(result.profile)) {
    await checkWhatsNewAccount(userId)
    if (storedSession()?.session.userId === userId && whatsNewDue(result.profile, userId)) {
      showWhatsNew(token, userId, result.profile, pending ? cardUrl(pending) : `${location.pathname}${location.search}`)
      return
    }
  }
  if (userId && legacyProfileStepDue(result.profile, userId)) {
    offerLegacyProfileStep(token, userId, pending ? cardUrl(pending) : `${location.pathname}${location.search}`)
    return
  }
  if (result.profile.shouldPrompt) showPrompt(token)
  else if (socialFriendsOn() && userId && findableNoticeFor(result.profile)) {
    // Once per account: only after the account says it was not seen yet.
    await checkFindableNoticeAccount(userId)
    if (storedSession()?.session.userId === userId && findableNoticeDue(result.profile, userId)) showFindableNotice(userId, result.profile.visibility)
  }
}

/**
 * The dot on the picture while someone asks to be friends and this device has
 * not shown it yet (followRequests.ts). Opening the You card or Following you
 * marks them seen, and the dot goes.
 */
export async function showRequestDot(token: string, userId: string | null, mount: () => void = () => {}): Promise<void> {
  if (!userId) return
  const found = await fetchFollowRequests(token)
  const rows: RequestRow[] = found?.followingYou ?? []
  const paint = () => {
    const button = document.getElementById('sign-in')
    if (!button) return
    const due = storedSession()?.session.userId === userId && requestDotDue(userId, rows)
    let dot = button.querySelector<HTMLElement>(`.${REQUEST_DOT_CLASS}`)
    if (!due) { dot?.remove(); button.setAttribute('aria-label', 'You'); return }
    mount()
    if (!dot) {
      dot = document.createElement('span')
      dot.className = REQUEST_DOT_CLASS
      dot.setAttribute('aria-hidden', 'true')
      dot.dataset.testid = 'request-dot'
      button.append(dot)
    }
    button.setAttribute('aria-label', 'You, new friend requests')
  }
  paint()
  window.addEventListener(FOLLOW_REQUESTS_SEEN_EVENT, paint)
}

/**
 * The one-time notice about findable profiles (findableNotice.ts), in the
 * prompt's style: Settings opens the Settings card. Showing it marks it seen
 * for the account; either button removes it.
 */
export function showFindableNotice(userId: string, visibility: OwnProfile['visibility']): void {
  const text = findableNoticeText(visibility)
  if (!text || document.querySelector(`.social-prompt[${FINDABLE_NOTICE_ATTR}]`)) return
  const card = document.createElement('div')
  card.className = 'social-prompt'
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-label', FINDABLE_NOTICE_COPY.label)
  card.setAttribute(FINDABLE_NOTICE_ATTR, '')
  card.dataset.testid = 'findable-notice'
  const line = document.createElement('p')
  line.textContent = text
  const go = document.createElement('button')
  go.type = 'button'
  go.className = 'go'
  go.textContent = FINDABLE_NOTICE_COPY.settings
  go.addEventListener('click', () => { dismissFindableNotice(userId); open('settings') })
  const later = document.createElement('button')
  later.type = 'button'
  later.className = 'later'
  later.textContent = FINDABLE_NOTICE_COPY.dismiss
  later.dataset.testid = 'findable-notice-dismiss'
  later.addEventListener('click', () => dismissFindableNotice(userId))
  card.append(line, go, later)
  document.body.append(card)
  markFindableNoticeShown(userId)
}

/**
 * The What's-new card for a returning reader (whatsNew.ts; WhatsNew mockups),
 * where the findable notice sat. Showing it marks it seen for the account and
 * retires the findable notice too. Continue opens the profile step when the
 * profile was never set up, else just closes; Later closes it for good.
 */
export function showWhatsNew(token: string, userId: string, profile: Pick<OwnProfile, 'needsSetup' | 'visibility'> & { setUpBeforeFindable?: boolean }, returnTo: string): void {
  if (document.querySelector(`[${WHATS_NEW_ATTR}]`)) return
  if (!document.querySelector('link[data-social-fonts]')) {
    const fonts = document.createElement('link')
    fonts.rel = 'stylesheet'
    fonts.href = '/fonts/tinct-fonts.css'
    fonts.dataset.socialFonts = ''
    document.head.append(fonts)
  }
  const card = document.createElement('section')
  card.className = 'whats-new'
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-labelledby', 'whats-new-title')
  card.setAttribute(WHATS_NEW_ATTR, '')
  card.dataset.testid = 'whats-new'
  const title = document.createElement('h2')
  title.id = 'whats-new-title'
  title.textContent = WHATS_NEW_COPY.title
  const list = document.createElement('ul')
  for (const item of WHATS_NEW_COPY.items) {
    const entry = document.createElement('li')
    const text = document.createElement('div')
    const head = document.createElement('b')
    head.textContent = item.title
    const line = document.createElement('span')
    line.textContent = item.line
    text.append(head, line)
    entry.append(text)
    list.append(entry)
  }
  const go = document.createElement('button')
  go.type = 'button'
  go.className = 'go'
  go.textContent = WHATS_NEW_COPY.continue
  go.dataset.testid = 'whats-new-continue'
  go.addEventListener('click', () => {
    dismissWhatsNew(userId)
    if (!profile.needsSetup) return
    // A profile never set up goes on to the profile step (brief: auto_created && !set_up_at).
    try { localStorage.setItem(LEGACY_SETUP_KEY_PREFIX + userId, '1') } catch { /* the account's prompted mark covers it */ }
    void saveProfile(token, { prompted: true })
    location.assign(legacyProfileStepUrl(returnTo))
  })
  const later = document.createElement('button')
  later.type = 'button'
  later.className = 'later'
  later.textContent = WHATS_NEW_COPY.later
  later.dataset.testid = 'whats-new-later'
  later.addEventListener('click', () => dismissWhatsNew(userId))
  card.append(title, list, go, later)
  document.body.append(card)
  markWhatsNewShown(userId)
  // In place of the findable notice: it is not shown as well.
  if (findableNoticeFor(profile as Parameters<typeof findableNoticeFor>[0])) void recordFindableNoticeSeen(userId)
}

/** Keep a small copy of the reader's own header picture on this device (avatarCache.ts). */
async function keepAvatar(userId: string | null, sig: string, view: Extract<PictureView, { kind: 'image' }>, token: string): Promise<void> {
  if (!userId) return
  const src = view.private ? await privateImageUrl(token, view.src) : view.src
  if (!src) return
  const copy = await captureAvatar(view, src)
  // Still this reader's browser: a sign-out or account switch meanwhile keeps nothing.
  if (copy && storedSession()?.session.userId === userId) writeAvatarCache(userId, { sig, src: copy })
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
