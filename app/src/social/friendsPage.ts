/**
 * The Friends page (/friends, social ship 3), in the library's look
 * (flows.html "Friends" and "Find"): underlined tabs Friends / Everyone /
 * Find. Friends and Everyone are the 7-day leaderboard (the top three on a
 * podium, roomy rows below, your own row and rank always); Find searches
 * Everyone readers by name or tinct.app link, lists readers following you,
 * Everyone readers also reading your books, and Invite (copy or share your
 * link). Tap a reader to open their profile.
 *
 * Served only while SOCIAL_FRIENDS and SOCIAL_PROFILES are on.
 */
import { supabase } from '../services/supabase'
import { safeLabReturnTo } from '../lab/labSignInReturn'
import { funnel, setFunnelToken, trackFunnel } from '../utils/funnel'
import {
  fetchBoard,
  fetchFind,
  paintPicture,
  searchReaders,
  shareOrCopy,
  socialAction,
  socialFriendsOn,
  type BoardData,
  type BoardEntry,
  type FindRow,
} from './friendsClient'
import type { Relation } from './profileRules'

type Tab = 'friends' | 'everyone' | 'find'
const TABS = new Set<Tab>(['friends', 'everyone', 'find'])

const root = document.querySelector<HTMLElement>('#tinct-friends')
const main = root?.querySelector<HTMLElement>('[data-main]') ?? null
const params = new URLSearchParams(location.search)
const returnTo = safeLabReturnTo(params.get('returnTo'))
let token = ''
let searchTimer: ReturnType<typeof setTimeout> | null = null

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { dataset?: Record<string, string> } = {}, ...children: (Node | string | null | false)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  const { dataset, ...rest } = props
  Object.assign(node, rest)
  if (dataset) Object.assign(node.dataset, dataset)
  for (const child of children) if (child) node.append(child)
  return node
}

function currentTab(): Tab {
  const tab = new URLSearchParams(location.search).get('tab') as Tab
  return TABS.has(tab) ? tab : 'friends'
}

function profileHref(handle: string): string {
  return `/@${encodeURIComponent(handle)}`
}

function avatar(entry: { picture: BoardEntry['picture'] }): HTMLElement {
  const span = el('span')
  paintPicture(span, entry.picture, token)
  return span
}

// ===== Boards =====

function podium(entries: BoardEntry[]): HTMLElement {
  const box = el('div', { className: 'podium', dataset: { testid: 'friends-podium' } })
  // Second, first, third, as on a podium.
  for (const index of [1, 0, 2]) {
    const entry = entries[index]
    if (!entry) { box.append(el('span')); continue }
    const place = el('a', { className: `place${entry.self ? ' is-self' : ''}`, href: profileHref(entry.handle), dataset: { rank: String(entry.rank) } },
      avatar(entry), el('span', { className: 'name' }, entry.name), el('span', { className: 'hours' }, entry.duration), el('span', { className: 'num' }, String(entry.rank)))
    box.append(place)
  }
  return box
}

function row(entry: BoardEntry): HTMLElement {
  return el('a', { className: `row${entry.self ? ' is-self' : ''}`, href: profileHref(entry.handle), dataset: { testid: entry.self ? 'friends-row-self' : 'friends-row' } },
    el('span', { className: 'num' }, String(entry.rank)),
    avatar(entry),
    el('span', { className: 'who' }, el('b', {}, entry.name), entry.book ? el('i', {}, entry.book) : null),
    el('span', { className: 'hours' }, entry.duration))
}

function renderBoard(data: BoardData) {
  if (!main) return
  const nodes: Node[] = [el('div', { className: 'board-head' }, el('h2', {}, 'Last 7 days'), el('span', {}, 'updated hourly'))]
  const entries = data.entries
  const onlyMe = entries.length <= 1
  if (onlyMe && data.tab === 'friends') {
    nodes.push(el('div', { className: 'rows' }, ...entries.map(row)))
    const find = el('a', { href: '?tab=find' }, 'Find')
    find.addEventListener('click', event => { event.preventDefault(); go('find') })
    nodes.push(el('p', { className: 'empty', dataset: { testid: 'friends-empty' } }, 'Friends are people you follow who follow you back. ', find, ' readers, or invite someone.'))
  } else {
    const top = entries.slice(0, 3)
    nodes.push(podium(top))
    const rest = entries.slice(3)
    const list = el('div', { className: 'rows' }, ...rest.map(row))
    // Your own row and rank always show.
    if (data.me && !entries.some(entry => entry.self)) list.append(row(data.me))
    nodes.push(list)
  }
  if (data.tab === 'friends') nodes.push(el('p', { className: 'note' }, 'Friends are people you follow who follow you back.'))
  else nodes.push(el('p', { className: 'note' }, 'Readers who chose to appear, by reading and listening time.'))
  if (!data.meShown) {
    const settings = el('a', { href: `/you?view=settings&returnTo=${encodeURIComponent(`/friends?tab=${data.tab}`)}` }, 'Settings')
    nodes.push(el('p', { className: 'note', dataset: { testid: 'friends-only-you' } }, 'Only you see your own row. To appear for others, switch on "On the leaderboard" in ', settings, '.'))
  }
  main.replaceChildren(...nodes)
}

// ===== Find =====

const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>'

function followLabel(relation: Relation): { text: string; state: string } {
  if (relation === 'friend') return { text: 'Friends', state: 'friends' }
  if (relation === 'follower') return { text: 'Following', state: 'following' }
  if (relation === 'followed') return { text: 'Follow back', state: 'follow' }
  return { text: 'Follow', state: 'follow' }
}

function person(row: FindRow): HTMLElement {
  let relation = row.relation
  const button = el('button', { type: 'button', className: 'follow' })
  const paint = () => {
    const label = followLabel(relation)
    button.textContent = label.text
    button.dataset.state = label.state
    button.setAttribute('aria-pressed', String(label.state !== 'follow'))
  }
  paint()
  button.addEventListener('click', async () => {
    button.disabled = true
    const following = relation === 'friend' || relation === 'follower'
    const result = await socialAction(token, following ? 'unfollow' : 'follow', row.handle)
    if (result.ok && result.relation) relation = result.relation
    button.disabled = false
    paint()
  })
  return el('div', { className: 'person', dataset: { testid: 'find-person' } },
    avatar(row),
    el('a', { className: 'who', href: profileHref(row.handle) }, el('b', {}, row.name), el('i', {}, row.book || row.link)),
    button)
}

function shelf(title: string, rows: FindRow[], testId: string): HTMLElement | null {
  if (!rows.length) return null
  return el('section', { className: 'shelf', dataset: { testid: testId } }, el('h2', {}, title), ...rows.map(person))
}

async function renderFind() {
  if (!main) return
  const input = el('input', { type: 'search', placeholder: 'Name or tinct.app link', autocomplete: 'off', spellcheck: false })
  input.setAttribute('aria-label', 'Search readers by name or tinct.app link')
  const search = el('label', { className: 'search' })
  search.innerHTML = SEARCH_ICON
  search.append(input)
  const results = el('section', { className: 'shelf', hidden: true, dataset: { testid: 'find-results' } })
  const browse = el('div')
  const status = el('p', { className: 'status', role: 'status' })
  main.replaceChildren(search, results, browse, status)

  input.addEventListener('input', () => {
    if (searchTimer) clearTimeout(searchTimer)
    const q = input.value.trim()
    if (q.length < 2) { results.hidden = true; browse.hidden = false; return }
    searchTimer = setTimeout(async () => {
      const found = await searchReaders(token, q)
      if (input.value.trim() !== q) return
      results.replaceChildren(el('h2', {}, 'Readers'), ...(found?.results.length ? found.results.map(person) : [el('p', { className: 'muted' }, 'No public reader by that name. Friends-only readers are found by their link.')]))
      results.hidden = false
      browse.hidden = true
    }, 250)
  })

  const data = await fetchFind(token)
  const link = data?.link ?? null
  const invite = el('section', { className: 'shelf', dataset: { testid: 'find-invite' } }, el('h2', {}, 'Invite a friend'))
  if (link) {
    const copy = el('button', { type: 'button', className: 'item' }, el('span', {}, 'Copy my link', el('small', {}, link)), el('span', { className: 'value' }, 'Copy'))
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`https://${link}`); status.textContent = 'Link copied.' } catch { status.textContent = `Copy this link: ${link}` }
    })
    const share = el('button', { type: 'button', className: 'item' }, el('span', {}, 'Share…'), el('span', { className: 'value' }, '›'))
    share.addEventListener('click', async () => {
      const result = await shareOrCopy({ url: `https://${link}`, title: 'Read with me on Tinct', text: 'Follow me on Tinct and we can see each other’s reading.' })
      status.textContent = result === 'copied' ? 'Link copied.' : result === 'failed' ? 'Sharing is not available here. Copy the link instead.' : ''
    })
    invite.append(copy, share)
  }
  browse.replaceChildren(...[
    shelf('Following you', data?.followingYou ?? [], 'find-following-you'),
    shelf('Also reading your books', data?.alsoReading ?? [], 'find-also-reading'),
    (data && !data.alsoReading.length && !data.followingYou.length) ? el('p', { className: 'muted' }, 'Readers who share what they read will show here when they read your books.') : null,
    invite,
  ].filter(Boolean) as Node[])
}

// ===== Navigation =====

function paintTabs(tab: Tab) {
  root?.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === tab)))
}

async function render() {
  const tab = currentTab()
  paintTabs(tab)
  if (!main) return
  main.dataset.tab = tab
  if (tab === 'find') {
    await renderFind()
  } else {
    const data = await fetchBoard(token, tab)
    if (!data) main.replaceChildren(el('p', { className: 'empty' }, 'The leaderboard is not available just now. Your reading time is safe.'))
    else renderBoard(data)
    trackFunnel('leaderboard_opened', { tab })
  }
  if (root) root.dataset.ready = 'true'
}

function go(tab: Tab) {
  const url = new URL(location.href)
  if (tab === 'friends') url.searchParams.delete('tab')
  else url.searchParams.set('tab', tab)
  history.replaceState(null, '', url)
  void render()
}

async function initialize() {
  if (!root || !main) return
  const back = root.querySelector<HTMLAnchorElement>('[data-back]')
  if (back) back.href = returnTo
  if (!socialFriendsOn() || !supabase) {
    main.replaceChildren(el('p', { className: 'empty' }, 'Friends are not available right now.'))
    root.dataset.ready = 'true'
    return
  }
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    location.replace(`/sign-in?returnTo=${encodeURIComponent(location.pathname + location.search)}`)
    return
  }
  token = data.session.access_token
  funnel('library')
  setFunnelToken(token)
  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => button.addEventListener('click', () => go(button.dataset.tab as Tab)))
  await render()
}

void initialize()
