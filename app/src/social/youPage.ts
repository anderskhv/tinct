/**
 * The You page (/you, social ship 2), in the library's look (flows.html,
 * "1 · From the library"): one page in shelves. Your picture (tap it to
 * change picture and background), name and link, AI credits as their own
 * shelf, then Settings: Profile, Privacy, Reading, Emails, Account. Choices
 * open tick lists with one plain line each. No capitals-only labels, no pill
 * toggles. Your reading (ship 1) is a shelf here while reading time is on,
 * leading to /your-reading; Friends arrives with ship 3.
 *
 * Served only while SOCIAL_PROFILES is on; the page has no other entry.
 */
import { supabase } from '../services/supabase'
import { safeLabReturnTo } from '../lab/labSignInReturn'
import { wipeLabDeviceUserData } from '../lab/labSignOut'
import { clearSignedInCookie } from '../utils/authCookie'
import { AI_USAGE_COPY, aiAllowanceDate, fetchAiAllowance } from '../lab/labAiAllowance'
import { fetchReadingTime, readPending, readingTimeSwitch, withPending } from '../lab/labReadingTime'
import { formatDayMonth, hoursMinutes, localDay, readingTimeStats } from '../readingTime/model'
import { fetchBlocked, fetchRank, socialFriendsOn, unblockReader } from './friendsClient'
import { rankOfLine } from './socialRules'
import {
  NEW_BOOKS_COPY,
  PICTURE_SETS,
  VISIBILITY_COPY,
  pictureView,
  type NewBooksOpenIn,
  type Visibility,
} from './profileRules'
import {
  checkHandle,
  chooseGooglePhoto,
  currentBookHint,
  fetchOwnProfile,
  ownBackground,
  ownPictureView,
  paintAvatar,
  paintBackground,
  resizePhoto,
  saveProfile,
  socialProfilesOn,
  uploadProfileImage,
  type OwnProfile,
  type ProfileResult,
} from './socialClient'

type View = 'you' | 'settings' | 'visibility' | 'showReading' | 'showTime' | 'onLeaderboard' | 'emails' | 'newBooks' | 'name' | 'handle' | 'blocked'
const VIEWS = new Set<View>(['you', 'settings', 'visibility', 'showReading', 'showTime', 'onLeaderboard', 'emails', 'newBooks', 'name', 'handle', 'blocked'])

const root = document.querySelector<HTMLElement>('#tinct-you')
const params = new URLSearchParams(location.search)
const returnTo = safeLabReturnTo(params.get('returnTo'))
let token = ''
let userId: string | null = null
let profile: OwnProfile | null = null
let status: { text: string; tone: 'error' | 'neutral' } | null = null

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { dataset?: Record<string, string> } = {}, ...children: (Node | string | null | false)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  const { dataset, ...rest } = props
  Object.assign(node, rest)
  if (dataset) Object.assign(node.dataset, dataset)
  for (const child of children) if (child) node.append(child)
  return node
}

const CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'

function currentView(): View {
  const view = new URLSearchParams(location.search).get('view') as View
  return VIEWS.has(view) ? view : 'you'
}

function go(view: View, replace = false) {
  const url = new URL(location.href)
  if (view === 'you') url.searchParams.delete('view')
  else url.searchParams.set('view', view)
  status = null
  if (replace) history.replaceState(null, '', url)
  else history.pushState(null, '', url)
  render()
}

function parentOf(view: View): View | null {
  if (view === 'you') return null
  return view === 'settings' ? 'you' : 'settings'
}

function back() {
  const view = currentView()
  const parent = parentOf(view)
  if (!parent) { location.assign(returnTo); return }
  go(parent, true)
}

function topBar(title: string): HTMLElement {
  const button = el('button', { type: 'button', className: 'back', ariaLabel: 'Back' }, '←')
  button.dataset.youBack = ''
  button.addEventListener('click', back)
  return el('div', { className: 'top' }, button, el('h1', {}, title), el('span'))
}

function item(label: string, value: string, onClick: () => void, testId?: string): HTMLButtonElement {
  const button = el('button', { type: 'button', className: 'item' }, el('span', {}, label), el('span', { className: 'value' }, value ? `${value} ›` : '›'))
  if (testId) button.dataset.testid = testId
  button.addEventListener('click', onClick)
  return button
}

function link(label: string, value: string, href: string): HTMLAnchorElement {
  return el('a', { className: 'item', href }, el('span', {}, label), el('span', { className: 'value' }, value ? `${value} ›` : '›'))
}

function statusLine(): HTMLElement {
  const line = el('p', { className: 'status', role: 'status' }, status?.text || '')
  if (status) line.dataset.tone = status.tone
  return line
}

async function apply(result: Promise<ProfileResult>, after?: () => void) {
  const saved = await result
  if (saved.ok) {
    profile = saved.profile
    status = null
    after?.()
  } else {
    status = { text: saved.message || 'That did not save. Please try again.', tone: 'error' }
  }
  render()
}

function onOff(value: boolean): string {
  return value ? 'On' : 'Off'
}

// ===== Views =====

function header(): HTMLElement[] {
  const p = profile!
  const banner = el('div', { className: 'banner' }, topBar(''))
  paintBackground(banner, ownBackground(p), token)
  const avatar = el('span')
  paintAvatar(avatar, ownPictureView(p), token)
  const cam = el('span', { className: 'cam' })
  cam.innerHTML = CAMERA
  const pic = el('button', { type: 'button', className: 'pic', ariaLabel: 'Change picture and background' }, avatar, cam)
  pic.dataset.testid = 'you-picture'
  pic.addEventListener('click', openPictureSheet)
  const head = el('div', { className: 'head' }, pic,
    el('span', { className: 'name' }, p.name),
    el('span', { className: 'link' }, `${p.link} · ${VISIBILITY_COPY[p.effectiveVisibility].short}`))
  return [banner, head]
}

function viewYou(): Node[] {
  const p = profile!
  const main = el('main')
  if (p.picture.review === 'rejected' || p.background.review === 'rejected') {
    main.append(el('div', { className: 'quiet', dataset: { testid: 'you-declined' } },
      el('b', {}, 'Your photo was not approved'),
      'Others see your initial or a library scene instead. Choose another picture or background whenever you like.'))
  }
  if (p.needsSetup) {
    main.append(el('div', { className: 'quiet', dataset: { testid: 'you-setup' } },
      el('b', {}, 'Your profile is private'),
      'Only you can see it. Choose a picture, and who can see your reading, in Settings.'))
  }
  const credits = el('section', { className: 'shelf', hidden: true })
  main.append(credits)
  void fetchAiAllowance(token).then(allowance => {
    if (!allowance) return
    const left = Math.max(0, Math.round((1 - allowance.usedFraction) * 100))
    const renews = aiAllowanceDate(allowance.resetsAt)
    const meter = el('div', { className: 'meter' }, el('i'))
    ;(meter.firstChild as HTMLElement).style.width = `${100 - left}%`
    credits.append(el('h2', {}, AI_USAGE_COPY.label),
      el('div', { className: 'credit' },
        el('div', { className: 'row' }, el('b', {}, `${left}% left`), renews ? el('span', {}, `renews ${renews}`) : null),
        meter))
    credits.hidden = false
  })
  // Your reading (ship 1), per flows.html: a shelf on You that leads to the full page. Only while reading time is on.
  const reading = el('section', { className: 'shelf', hidden: true, dataset: { testid: 'you-reading' } })
  main.append(reading)
  void renderYourReadingShelf(reading)
  // Friends (ship 3), per flows.html: the rank line leads to the Friends page.
  if (socialFriendsOn()) {
    const friends = el('section', { className: 'shelf', dataset: { testid: 'you-friends' } })
    const line = el('span', {}, 'Your friends', el('small', {}, 'last 7 days'))
    const row = el('a', { className: 'item', href: `/friends?returnTo=${encodeURIComponent('/you')}` }, line, el('span', { className: 'value' }, '›'))
    row.dataset.testid = 'you-friends-row'
    friends.append(el('h2', {}, 'Friends'), el('div', { className: 'list' }, row))
    main.append(friends)
    void fetchRank(token).then(rank => {
      const text = rank ? rankOfLine(rank.rank, rank.total) : null
      if (text) line.firstChild!.textContent = text
    })
  }
  main.append(el('section', { className: 'shelf' }, el('div', { className: 'list' }, item('Settings', '', () => go('settings'), 'you-settings'))))
  return [...header(), main]
}

/** "Your reading  All ›", the total in large type, "since 14 July, reading and listening.", 12 weeks of bars. */
async function renderYourReadingShelf(shelf: HTMLElement): Promise<void> {
  if (!await readingTimeSwitch()) return
  const ledger = await fetchReadingTime(token)
  if (!ledger) return
  const stats = readingTimeStats(withPending(ledger.rows, readPending(userId)), localDay())
  const { hours, minutes } = hoursMinutes(stats.totalSeconds)
  const all = el('a', { href: `/your-reading?return=${encodeURIComponent('/you')}`, className: 'all' }, 'All ›')
  all.dataset.testid = 'you-reading-all'
  const total = el('p', { className: 'total' })
  total.append(...(hours > 0 ? [String(hours), el('small', {}, 'h'), ' '] : []), String(minutes), el('small', {}, 'm'))
  const most = Math.max(1, ...stats.weeks.map(week => week.seconds))
  const bars = el('div', { className: 'weeks', ariaHidden: 'true' })
  stats.weeks.forEach((week, index) => {
    const bar = el('i', { className: index === stats.weeks.length - 1 ? 'is-now' : '' })
    bar.style.height = `${week.seconds > 0 ? Math.max(8, Math.round(week.seconds / most * 100)) : 4}%`
    bars.append(bar)
  })
  shelf.append(el('h2', {}, 'Your reading', all), total,
    el('p', { className: 'since' }, stats.firstDay ? `since ${formatDayMonth(stats.firstDay)}, reading and listening.` : 'Reading and listening.'),
    bars)
  shelf.hidden = false
}

function viewSettings(): Node[] {
  const p = profile!
  const set = PICTURE_SETS.find(entry => entry.id === p.picture.value && p.picture.kind === 'set')
  const pictureLabel = set ? set.label : p.picture.kind === 'initial' ? 'Initial' : p.picture.kind === 'upload' ? 'Your photo' : p.picture.kind === 'google' ? 'Google photo' : 'Cover'
  const accountUrl = `/sign-in?mode=account&returnTo=${encodeURIComponent('/you?view=settings')}`
  const signOut = el('button', { type: 'button', className: 'item' }, el('span', {}, 'Sign out'), el('span'))
  signOut.addEventListener('click', async () => {
    await supabase?.auth.signOut()
    clearSignedInCookie()
    // The next person on this device must not inherit this reader's data.
    wipeLabDeviceUserData()
    location.assign('/library')
  })
  return [topBar('Settings'), el('main', {},
    el('p', { className: 'group' }, 'Profile'),
    el('div', { className: 'list' },
      item('Picture and background', pictureLabel, openPictureSheet),
      item('Name', p.name, () => go('name'), 'settings-name'),
      item('Profile link', p.link, () => go('handle'), 'settings-handle')),
    el('p', { className: 'group' }, 'Privacy'),
    el('div', { className: 'list' },
      item('Who can see you', VISIBILITY_COPY[p.visibility].label, () => go('visibility'), 'settings-visibility'),
      item('Show what I’m reading', onOff(p.showReading), () => go('showReading')),
      item('Show my reading time', onOff(p.showTime), () => go('showTime')),
      item('On the leaderboard', onOff(p.onLeaderboard), () => go('onLeaderboard')),
      socialFriendsOn() ? item('Blocked readers', '', () => go('blocked'), 'settings-blocked') : null),
    el('p', { className: 'group' }, 'Reading'),
    el('div', { className: 'list' }, item('New books open in', NEW_BOOKS_COPY[p.newBooksOpenIn].label, () => go('newBooks'), 'settings-new-books')),
    el('p', { className: 'group' }, 'Emails'),
    el('div', { className: 'list' }, item('Reading emails', onOff(p.emailOptIn), () => go('emails'))),
    el('p', { className: 'group' }, 'Account'),
    el('div', { className: 'list' }, link('Premium', '', accountUrl), link('Email and password', '', accountUrl), signOut),
    statusLine())]
}

/** Readers you blocked (ship 3), each with Unblock. */
function viewBlocked(): Node[] {
  const list = el('div', { className: 'list' })
  const page: Node[] = [topBar('Blocked readers'), el('main', {}, list,
    el('p', { className: 'note' }, 'You and a reader you block do not see each other anywhere on Tinct. They are not told.'), statusLine())]
  void fetchBlocked(token).then(data => {
    const blocked = data?.blocked ?? []
    if (!blocked.length) { list.replaceWith(el('p', { className: 'note' }, 'You have not blocked anyone.')); return }
    for (const reader of blocked) {
      const row = item(reader.name, 'Unblock', async () => {
        if (await unblockReader(token, reader.id)) row.remove()
      })
      if (reader.handle) row.firstElementChild!.append(el('small', {}, `tinct.app/@${reader.handle}`))
      list.append(row)
    }
  })
  return page
}

function tickView<T extends string | boolean>(title: string, options: { value: T; label: string; line: string; disabled?: boolean }[], selected: T, choose: (value: T) => void, after: (Node | null)[] = []): Node[] {
  const list = el('div', { className: 'list tick' })
  list.setAttribute('role', 'radiogroup')
  list.setAttribute('aria-label', title)
  for (const option of options) {
    const button = el('button', { type: 'button', className: 'item' },
      el('span', {}, option.label, el('small', {}, option.line)),
      el('span', { className: 'check' }, '✓'))
    button.setAttribute('role', 'radio')
    button.setAttribute('aria-checked', String(option.value === selected))
    if (option.disabled) button.setAttribute('aria-disabled', 'true')
    button.addEventListener('click', () => { if (!option.disabled && option.value !== selected) choose(option.value) })
    list.append(button)
  }
  return [topBar(title), el('main', {}, list, ...after.filter(Boolean) as Node[], statusLine())]
}

function viewVisibility(): Node[] {
  const p = profile!
  const waiting = p.visibility === 'everyone' && !p.emailConfirmed
  const options = (['only_me', 'friends', 'everyone'] as Visibility[]).map(value => ({
    value,
    label: VISIBILITY_COPY[value].label,
    line: value === 'everyone' && !p.emailConfirmed ? 'Anyone with your link, once you confirm your email.' : VISIBILITY_COPY[value].line,
  }))
  return tickView('Who can see you', options, p.visibility, value => void apply(saveProfile(token, { visibility: value, setUp: true })), [
    waiting ? el('p', { className: 'note' }, 'Until you confirm your email, friends can see you. The link is in your welcome email.') : null,
    el('p', { className: 'note' }, 'Highlights, notes and conversations are never shown to anyone.'),
  ])
}

function switchView(title: string, field: 'showReading' | 'showTime' | 'onLeaderboard', on: string, off: string): Node[] {
  return tickView(title, [
    { value: true, label: 'On', line: on },
    { value: false, label: 'Off', line: off },
  ], profile![field], value => void apply(saveProfile(token, { [field]: value })), [
    profile!.visibility === 'only_me' ? el('p', { className: 'note' }, 'While only you can see your profile, this shows to nobody else.') : null,
  ])
}

function viewEmails(): Node[] {
  return tickView('Reading emails', [
    { value: true, label: 'On', line: 'Your reading progress and ideas for what to read next.' },
    { value: false, label: 'Off', line: 'Only emails about your account.' },
  ], profile!.emailOptIn, value => void apply(saveProfile(token, { emailOptIn: value })), [
    profile!.emailOptIn && !profile!.emailConfirmed ? el('p', { className: 'note' }, 'Reading emails start once you confirm your email.') : null,
  ])
}

function viewNewBooks(): Node[] {
  return tickView('New books open in', (['modern', 'human'] as NewBooksOpenIn[]).map(value => ({ value, label: NEW_BOOKS_COPY[value].label, line: NEW_BOOKS_COPY[value].line })),
    profile!.newBooksOpenIn, value => void apply(saveProfile(token, { newBooksOpenIn: value })), [
      el('p', { className: 'note' }, 'Each book remembers your own switch.'),
    ])
}

function textView(title: string, field: 'name' | 'handle'): Node[] {
  const p = profile!
  const input = el('input', { type: 'text', value: field === 'name' ? p.name : p.handle, maxLength: field === 'name' ? 40 : 20, autocomplete: field === 'name' ? 'name' : 'off', spellcheck: false })
  input.setAttribute('aria-label', title)
  const save = el('button', { type: 'button', className: 'primary' }, 'Save')
  save.addEventListener('click', async () => {
    save.disabled = true
    if (field === 'handle') {
      const check = await checkHandle(token, input.value)
      if (!check.ok) { status = { text: check.message || 'Please choose another link.', tone: 'error' }; render(); return }
    }
    await apply(saveProfile(token, { [field]: input.value }), () => go('settings', true))
  })
  input.addEventListener('keydown', event => { if (event.key === 'Enter') save.click() })
  const fieldBox = el('label', { className: 'field' }, field === 'name' ? 'Your name, as others see it' : 'Your link: 3 to 20 letters, digits, _ or .',
    el('div', { className: 'in' }, field === 'handle' ? el('span', {}, 'tinct.app/@') : null, input))
  return [topBar(title), el('main', {}, fieldBox, save, statusLine())]
}

// ===== Picture and background sheet =====

function closeSheet() {
  root?.querySelectorAll('[data-you-sheet]').forEach(node => node.remove())
}

function openPictureSheet() {
  closeSheet()
  const p = profile!
  const scrim = el('div', { className: 'scrim', dataset: { youSheet: '' } })
  scrim.addEventListener('click', closeSheet)
  const presets = el('div', { className: 'presets' })
  for (const set of PICTURE_SETS) {
    const avatar = el('span')
    paintAvatar(avatar, pictureView('set', set.id, p.name), token)
    const button = el('button', { type: 'button', ariaLabel: set.label }, avatar, el('span', { className: 'label' }, set.label))
    button.style.setProperty('--scene', `url("${set.scene}")`)
    button.setAttribute('aria-pressed', String(p.picture.kind === 'set' && p.picture.value === set.id))
    button.addEventListener('click', () => { closeSheet(); void apply(saveProfile(token, { picture: { kind: 'set', value: set.id }, background: { kind: 'set', value: set.id }, setUp: true })) })
    presets.append(button)
  }
  const fileInput = (slot: 'picture' | 'background') => {
    const input = el('input', { type: 'file', accept: 'image/*', className: 'hidden-input' })
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) return
      closeSheet()
      status = { text: 'Adding your photo…', tone: 'neutral' }
      render()
      const resized = await resizePhoto(file, slot)
      if (!resized) { status = { text: 'That photo could not be read. Try another.', tone: 'error' }; render(); return }
      await apply(uploadProfileImage(token, slot, resized), () => { status = { text: 'Added. Others see it after a quick check.', tone: 'neutral' } })
    })
    return input
  }
  const pictureFile = fileInput('picture')
  const backgroundFile = fileInput('background')
  const list = el('div', { className: 'list' },
    item('Upload a photo', '', () => pictureFile.click()),
    p.googlePhoto ? item('Use my Google photo', '', () => { closeSheet(); void apply(chooseGooglePhoto(token), () => { status = { text: 'Added. Others see it after a quick check.', tone: 'neutral' } }) }) : null,
    item('Upload a background', '', () => backgroundFile.click()),
    item('Use my initial', '', () => { closeSheet(); void apply(saveProfile(token, { picture: { kind: 'initial' }, setUp: true })) }))
  const sheet = el('div', { className: 'sheet', role: 'dialog', ariaLabel: 'Picture and background', dataset: { youSheet: '' } },
    el('span', { className: 'grab' }),
    el('h2', {}, 'Picture and background'),
    el('p', { className: 'sub' }, 'Sets, or mix your own'),
    presets, list, pictureFile, backgroundFile,
    el('p', { className: 'note' }, 'Sets pair a picture with a background from the same book. Uploads show to others after a quick check.'))
  root?.append(scrim, sheet)
}

// ===== Render =====

function render() {
  if (!root || !profile) return
  closeSheet()
  const view = currentView()
  const nodes = view === 'settings' ? viewSettings()
    : view === 'visibility' ? viewVisibility()
    : view === 'showReading' ? switchView('Show what I’m reading', 'showReading', 'People who can see you see the books you are reading and have finished.', 'Your books stay private.')
    : view === 'showTime' ? switchView('Show my reading time', 'showTime', 'People who can see you see your hours.', 'Your hours stay private.')
    : view === 'onLeaderboard' ? switchView('On the leaderboard', 'onLeaderboard', 'You appear on the boards of the people who can see you.', 'You never appear on a leaderboard.')
    : view === 'emails' ? viewEmails()
    : view === 'newBooks' ? viewNewBooks()
    : view === 'name' ? textView('Name', 'name')
    : view === 'handle' ? textView('Profile link', 'handle')
    : view === 'blocked' ? viewBlocked()
    : viewYou()
  root.replaceChildren(...nodes)
  root.dataset.view = view
}

function unavailable(message: string) {
  if (!root) return
  const home = el('a', { className: 'primary', href: returnTo }, 'Back')
  home.style.cssText = 'display:grid;place-items:center;text-decoration:none'
  root.replaceChildren(topBar('You'), el('main', {}, el('p', { className: 'note' }, message), home))
}

async function initialize() {
  try {
    if (!root) return
    if (!socialProfilesOn() || !supabase) { unavailable('Profiles are not available right now.'); return }
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      location.replace(`/sign-in?returnTo=${encodeURIComponent('/you')}`)
      return
    }
    token = data.session.access_token
    userId = data.session.user?.id ?? null
    const result = await fetchOwnProfile(token, currentBookHint())
    if (!result.ok) { unavailable('Profiles are not available right now. Your reading is safe.'); return }
    profile = result.profile
    window.addEventListener('popstate', render)
    render()
  } finally {
    if (root) root.dataset.ready = 'true'
  }
}

void initialize()
