/**
 * A public profile page (tinct.app/@handle, social ship 3) in the browser.
 * The Worker renders the page as a signed-out visitor would see it; for a
 * signed-in visitor this script asks for the same view with their follow
 * state and renders it (profilePageView.ts), then wires Follow, Remove
 * follower, Block and Report. A profile the visitor may not see (missing,
 * Only me, hidden, or a block either way) shows as "No profile here".
 */
import { supabase } from '../services/supabase'
import { funnel, setFunnelToken, trackFunnel } from '../utils/funnel'
import { fetchProfile, followingAfter, reportProfile, socialAction, socialFriendsOn } from './friendsClient'
import type { Relation } from './profileRules'
import { followButtonHtml, profileMainHtml, profileMissingHtml, type ProfilePageData } from './profilePageView'
import { privateImageUrl } from './socialClient'
import { REPORT_REASONS, REPORT_REASON_COPY, type ReportReason } from './socialRules'

const root = document.querySelector<HTMLElement>('#tinct-profile')
const main = root?.querySelector<HTMLElement>('[data-main]') ?? null
const handle = root?.dataset.handle ?? ''
let token: string | null = null
let data: ProfilePageData | null = null

function status(text: string) {
  const line = main?.querySelector<HTMLElement>('[data-status]')
  if (line) line.textContent = text
}

/** Stored photos (the owner's, or a Friends profile's for a friend) load with the visitor's sign-in. */
function paintPrivate() {
  if (!root || !token) return
  root.querySelectorAll<HTMLElement>('[data-private-src]').forEach(node => {
    void privateImageUrl(token!, node.dataset.privateSrc!).then(src => {
      if (!src) return
      node.textContent = ''
      node.style.backgroundImage = `url("${src}")`
      node.style.backgroundSize = 'cover'
      node.style.backgroundPosition = '50% 50%'
    })
  })
  const banner = root.querySelector<HTMLElement>('[data-banner]')
  if (banner && data?.banner.private) void privateImageUrl(token, data.banner.src).then(src => { if (src) banner.style.setProperty('--scene', `url("${src}")`) })
  else if (banner && data) banner.style.setProperty('--scene', `url("${data.banner.src}")`)
}

/** Follow from a link before the profile shows (a Friends profile opens once you follow each other). */
let unseenRelation: Relation = 'stranger'

function wellFormed(value: string): boolean {
  return /^[a-z0-9_.]{3,20}$/.test(value) && /[a-z0-9]/.test(value)
}

function render() {
  if (!root || !main) return
  if (!data) {
    main.innerHTML = profileMissingHtml(wellFormed(handle) ? followButtonHtml({ relation: token ? unseenRelation : null, handle }) : undefined)
    root.dataset.state = 'missing'
  } else {
    main.innerHTML = profileMainHtml(data)
    root.dataset.state = 'ready'
    document.title = `${data.name} (@${data.handle}) · Tinct`
  }
  root.classList.remove('loading')
  paintPrivate()
}

function closeSheet() {
  root?.querySelectorAll('[data-profile-sheet]').forEach(node => node.remove())
}

function sheet(title: string, line: string, items: Array<{ label: string; run: () => void }>) {
  closeSheet()
  const scrim = document.createElement('div')
  scrim.className = 'scrim'
  scrim.dataset.profileSheet = ''
  scrim.addEventListener('click', closeSheet)
  const box = document.createElement('div')
  box.className = 'sheet'
  box.dataset.profileSheet = ''
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-label', title)
  const h = document.createElement('h2')
  h.textContent = title
  const p = document.createElement('p')
  p.textContent = line
  box.append(h, p)
  for (const item of items) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'item'
    button.textContent = item.label
    button.addEventListener('click', () => { closeSheet(); item.run() })
    box.append(button)
  }
  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'cancel'
  cancel.textContent = 'Cancel'
  cancel.addEventListener('click', closeSheet)
  box.append(cancel)
  root?.append(scrim, box)
}

/** Follow and unfollow show their new state at once, held (and disabled) until the answer. */
function pending(follow: boolean, relation: Relation | null) {
  const button = main?.querySelector<HTMLElement>('[data-testid="profile-follow"]')
  if (!button) return
  const holder = document.createElement('div')
  holder.innerHTML = followButtonHtml({ relation: followingAfter(relation, follow), handle })
  const next = holder.firstElementChild as HTMLButtonElement | null
  if (!next) return
  next.disabled = true
  next.setAttribute('aria-busy', 'true')
  button.replaceWith(next)
}

async function actUnseen(action: 'follow' | 'unfollow') {
  if (!token) return
  const before = unseenRelation
  pending(action === 'follow', before)
  const result = await socialAction(token, action, handle)
  if (!result.ok) { render(); status('That did not work. Please try again.'); return }
  unseenRelation = result.relation ?? followingAfter(before, action === 'follow')
  // Following back may open the profile: read it again.
  const fresh = await fetchProfile(token, handle)
  data = fresh?.profile ?? null
  render()
}

async function act(action: 'follow' | 'unfollow' | 'remove-follower' | 'block') {
  if (!token || !data) return
  if (action === 'follow' || action === 'unfollow') pending(action === 'follow', data.relation)
  const result = await socialAction(token, action, data.handle)
  if (!result.ok) { render(); status('That did not work. Please try again.'); return }
  if (action === 'block') {
    data = null
    render()
    if (main) main.innerHTML = '<section class="missing"><h1>Blocked</h1><p>You and this reader no longer see each other on Tinct. You can unblock them in Settings.</p><a class="primary" href="/friends">Friends</a></section>'
    return
  }
  data = { ...data, relation: result.relation ?? data.relation, followsYou: result.followsYou ?? data.followsYou }
  // Following may open a Friends profile, unfollowing or removing may close it: read it again.
  const fresh = await fetchProfile(token, handle)
  data = fresh?.profile ?? null
  if (!data) unseenRelation = result.relation ?? 'stranger'
  render()
  if (action === 'remove-follower') status('Removed. They no longer follow you.')
}

function wire() {
  main?.addEventListener('click', event => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-action]')
    if (!target || (target as HTMLButtonElement).disabled) return
    const action = target.dataset.action
    if (!data) {
      if (action === 'follow' || action === 'unfollow') void actUnseen(action)
      return
    }
    if (action === 'follow') void act('follow')
    else if (action === 'unfollow') {
      sheet(data.relation === 'friend' ? 'Unfollow?' : 'Stop following?', `${data.name} will no longer be on your Friends board.`, [{ label: 'Unfollow', run: () => void act('unfollow') }])
    } else if (action === 'remove-follower') {
      sheet('Remove follower?', `${data.name} will no longer follow you. They are not told.`, [{ label: 'Remove', run: () => void act('remove-follower') }])
    } else if (action === 'block') {
      sheet(`Block ${data.name}?`, 'You will no longer see each other anywhere on Tinct, and neither of you follows the other. They are not told.', [{ label: 'Block', run: () => void act('block') }])
    } else if (action === 'report') {
      sheet('Report this profile', 'What is wrong? A person at Tinct reads every report.', REPORT_REASONS.map((reason: ReportReason) => ({
        label: REPORT_REASON_COPY[reason],
        run: () => void reportProfile(token!, data!.handle, reason).then(ok => status(ok ? 'Thank you. We will look at it.' : 'That did not send. Please try again.')),
      })))
    }
  })
}

async function initialize() {
  if (!root || !main) return
  const back = root.querySelector<HTMLAnchorElement>('[data-back]')
  if (back && document.referrer && new URL(document.referrer).origin === location.origin) back.href = new URL(document.referrer).pathname + new URL(document.referrer).search
  wire()
  const session = supabase && socialFriendsOn() ? (await supabase.auth.getSession().catch(() => null))?.data.session ?? null : null
  token = session?.access_token ?? null
  if (token || root.dataset.state === 'loading') {
    const fresh = await fetchProfile(token, handle)
    data = fresh?.profile ?? null
    render()
  } else {
    // Signed out: the Worker's page stands; only private images need nothing.
    const actions = main.querySelector('[data-actions]')
    if (actions && !actions.innerHTML.trim()) actions.innerHTML = followButtonHtml({ relation: null, handle })
  }
  funnel('library')
  setFunnelToken(token)
  if (root.dataset.state === 'ready') trackFunnel('profile_viewed', { relation: data?.relation ?? 'signed_out' })
}

void initialize()
