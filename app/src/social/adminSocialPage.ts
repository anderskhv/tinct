/**
 * The admin view for profiles (/admin/social, social ship 3): photos to check
 * (approve or decline uploaded pictures and backgrounds, so they show to other
 * readers), reports from the Report link, and any profile by name or link
 * (rename, change the link, hide or show, reset the picture or background).
 * Site admins only: the API answers 403 to anyone else.
 */
import { supabase } from '../services/supabase'
import { pictureView, VISIBILITY_COPY, type Visibility } from './profileRules'
import { paintAvatar, privateImageUrl } from './socialClient'
import { REPORT_REASON_COPY, type ReportReason } from './socialRules'

interface AdminImage { kind: string; value: string | null; review: string; url: string | null }
interface AdminProfile { id: string; name: string; handle: string; link: string; visibility: Visibility; hidden: boolean; picture: AdminImage; background: AdminImage; updatedAt: string | null }
interface AdminData {
  pending: AdminProfile[]
  reports: Array<{ id: number; reason: ReportReason; handle: string; createdAt: string; profile: AdminProfile | null }>
  profiles: AdminProfile[]
}

const root = document.querySelector<HTMLElement>('#tinct-admin-social')
const main = root?.querySelector<HTMLElement>('[data-main]') ?? null
const statusLine = root?.querySelector<HTMLElement>('[data-status]') ?? null
let token = ''
let query = ''

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { dataset?: Record<string, string> } = {}, ...children: (Node | string | null | false)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  const { dataset, ...rest } = props
  Object.assign(node, rest)
  if (dataset) Object.assign(node.dataset, dataset)
  for (const child of children) if (child) node.append(child)
  return node
}

function say(text: string) { if (statusLine) statusLine.textContent = text }

async function api<T>(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(path, body === undefined
      ? { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      : { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    let data: T | null = null
    try { data = await res.json() as T } catch { /* empty */ }
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: null }
  }
}

function button(label: string, run: () => Promise<void> | void, primary = false): HTMLButtonElement {
  const node = el('button', { type: 'button', className: primary ? 'yes' : '' }, label)
  node.addEventListener('click', async () => { node.disabled = true; try { await run() } finally { node.disabled = false } })
  return node
}

function who(profile: AdminProfile): HTMLElement {
  const avatar = el('span')
  const stored = profile.picture.url
  paintAvatar(avatar, stored ? { kind: 'initial', initial: profile.name.slice(0, 1).toUpperCase() } : pictureView(profile.picture.kind as never, profile.picture.value, profile.name), token)
  if (stored) void privateImageUrl(token, stored).then(src => { if (src) { avatar.textContent = ''; avatar.style.backgroundImage = `url("${src}")`; avatar.style.backgroundSize = 'cover' } })
  const tags = [
    el('span', { className: 'tag' }, VISIBILITY_COPY[profile.visibility]?.label ?? profile.visibility),
    profile.hidden ? el('span', { className: 'tag warn' }, 'Hidden') : null,
  ]
  return el('div', { className: 'who' }, avatar, el('span', {}, el('b', {}, profile.name), el('i', {}, profile.link)), ...tags)
}

function shot(url: string, round: boolean): HTMLElement {
  const node = el('span', { className: `shot${round ? ' round' : ''}` })
  void privateImageUrl(token, url).then(src => { if (src) node.style.backgroundImage = `url("${src}")` })
  return node
}

async function review(profile: AdminProfile, slot: 'picture' | 'background', decision: 'approve' | 'decline') {
  const result = await api('/api/admin/social/review', { userId: profile.id, slot, decision })
  say(result.ok ? `${decision === 'approve' ? 'Approved' : 'Declined'}: ${profile.name}'s ${slot}.` : 'That did not save.')
  await load()
}

async function update(profile: AdminProfile, patch: Record<string, unknown>, done: string) {
  const result = await api<{ error?: string }>('/api/admin/social/profile', { userId: profile.id, ...patch })
  say(result.ok ? done : result.data?.error || 'That did not save.')
  await load()
}

function profileActions(profile: AdminProfile): HTMLElement {
  return el('div', { className: 'buttons' },
    button('Rename', () => {
      const name = prompt('New name', profile.name)
      if (name && name !== profile.name) return update(profile, { name }, `Renamed to ${name}.`)
    }),
    button('Change link', () => {
      const handle = prompt('New link (tinct.app/@…)', profile.handle)
      if (handle && handle !== profile.handle) return update(profile, { handle }, `Link changed to tinct.app/@${handle}.`)
    }),
    button(profile.hidden ? 'Show again' : 'Hide', () => update(profile, { hidden: !profile.hidden }, profile.hidden ? 'Shown again.' : 'Hidden from everyone but its owner.')),
    profile.picture.kind === 'upload' || profile.picture.kind === 'google' ? button('Remove picture', () => update(profile, { resetPicture: true }, 'Picture reset to the initial.')) : null,
    profile.background.kind === 'upload' ? button('Remove background', () => update(profile, { resetBackground: true }, 'Background reset to the library.')) : null,
  )
}

function pendingCard(profile: AdminProfile): HTMLElement {
  const card = el('article', { className: 'card', dataset: { testid: 'admin-pending' } }, who(profile))
  for (const slot of ['picture', 'background'] as const) {
    const image = profile[slot]
    if (image.review !== 'pending' || !image.url) continue
    card.append(el('span', { className: 'label' }, slot === 'picture' ? 'Picture' : 'Background'), shot(image.url, slot === 'picture'),
      el('div', { className: 'buttons' }, button('Approve', () => review(profile, slot, 'approve'), true), button('Decline', () => review(profile, slot, 'decline'))))
  }
  return card
}

function reportCard(report: AdminData['reports'][number]): HTMLElement {
  const when = new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const card = el('article', { className: 'card', dataset: { testid: 'admin-report' } },
    el('span', { className: 'label' }, `${REPORT_REASON_COPY[report.reason] ?? report.reason} · @${report.handle} · ${when}`))
  if (report.profile) card.append(who(report.profile), profileActions(report.profile))
  else card.append(el('p', { className: 'empty' }, 'This profile no longer exists.'))
  card.append(el('div', { className: 'buttons' }, button('Done', async () => {
    await api('/api/admin/social/report', { id: report.id, resolution: 'dismissed' })
    say('Report closed.')
    await load()
  })))
  return card
}

async function load() {
  if (!main) return
  const result = await api<AdminData>(`/api/admin/social${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  if (result.status === 403) { main.replaceChildren(el('p', { className: 'empty' }, 'Only Tinct admins can open this page.')); return }
  if (!result.ok || !result.data) { main.replaceChildren(el('p', { className: 'empty' }, 'Profiles are not available right now.')); return }
  const data = result.data
  const input = el('input', { type: 'search', value: query, placeholder: 'Name or link' })
  input.setAttribute('aria-label', 'Find a profile')
  const go = button('Find', async () => { query = input.value.trim(); await load() })
  input.addEventListener('keydown', event => { if (event.key === 'Enter') go.click() })
  main.replaceChildren(
    el('section', { dataset: { testid: 'admin-pending-list' } }, el('h2', {}, 'Photos to check', el('small', {}, String(data.pending.length))),
      data.pending.length ? el('div', { className: 'cards' }, ...data.pending.map(pendingCard)) : el('p', { className: 'empty' }, 'Nothing waiting.')),
    el('section', { dataset: { testid: 'admin-report-list' } }, el('h2', {}, 'Reports', el('small', {}, String(data.reports.length))),
      data.reports.length ? el('div', { className: 'cards' }, ...data.reports.map(reportCard)) : el('p', { className: 'empty' }, 'No open reports.')),
    el('section', {}, el('h2', {}, 'Find a profile'), el('div', { className: 'search' }, input, go),
      query ? (data.profiles.length ? el('div', { className: 'cards' }, ...data.profiles.map(profile => el('article', { className: 'card' }, who(profile), profileActions(profile)))) : el('p', { className: 'empty' }, 'No profile by that name or link.')) : null),
  )
}

async function initialize() {
  if (!root || !main) return
  try {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null
    if (!session) { location.replace(`/sign-in?returnTo=${encodeURIComponent('/admin/social')}`); return }
    token = session.access_token
    await load()
  } finally {
    root.dataset.ready = 'true'
  }
}

void initialize()
