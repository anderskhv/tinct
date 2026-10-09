/**
 * Social ship 3 in the browser: the switch and the API calls, shared by the
 * Friends page, a profile page, the You page and the reader.
 *
 * The switch is the Worker's: while SOCIAL_FRIENDS (and SOCIAL_PROFILES) are
 * on it marks pages with <meta name="tinct-friends" content="1">. Without the
 * marker every function here is inert and no request is made.
 */
import type { Relation } from './profileRules'
import { paintAvatar } from './socialClient'
import type { ProfilePageData, ProfilePicture } from './profilePageView'
import type { ReportReason } from './socialRules'

export function socialFriendsOn(doc: Document | null = typeof document === 'undefined' ? null : document): boolean {
  return doc?.querySelector('meta[name="tinct-friends"]')?.getAttribute('content') === '1'
    && doc?.querySelector('meta[name="tinct-social"]')?.getAttribute('content') === '1'
}

/** A leaderboard row: name, picture and reading time only (privacy notice), and `me` for your own. */
export interface BoardEntry {
  rank: number
  name: string
  picture: ProfilePicture
  seconds: number
  duration: string
  me: boolean
}

export interface BoardData {
  tab: 'friends' | 'everyone'
  window: { start: string; end: string }
  refreshedAt: string | null
  total: number
  me: BoardEntry | null
  meShown: boolean
  /** Whether the Everyone board is offered (the page shows the Everyone tab only then). */
  everyoneOpen?: boolean
  entries: BoardEntry[]
}

export interface FindRow {
  handle: string
  name: string
  link: string
  picture: ProfilePicture
  relation: Relation
  book: string | null
}

type FetchLike = typeof fetch

function auth(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function getJson<T>(path: string, token: string | null, fetchImpl: FetchLike = fetch): Promise<T | null> {
  try {
    const res = await fetchImpl(path, { headers: auth(token), cache: 'no-store' })
    return res.ok ? await res.json() as T : null
  } catch {
    return null
  }
}

async function postJson<T>(path: string, token: string, body: unknown, fetchImpl: FetchLike = fetch): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetchImpl(path, { method: 'POST', headers: { ...auth(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    let data: T | null = null
    try { data = await res.json() as T } catch { /* empty */ }
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: null }
  }
}

export const fetchBoard = (token: string, tab: 'friends' | 'everyone', fetchImpl?: FetchLike) => getJson<BoardData>(`/api/social/board?tab=${tab}`, token, fetchImpl)
export const fetchRank = (token: string, fetchImpl?: FetchLike) => getJson<{ rank: number | null; total: number; seconds: number }>('/api/social/rank', token, fetchImpl)
export const fetchFind = (token: string, fetchImpl?: FetchLike) => getJson<{ followingYou: FindRow[]; alsoReading: FindRow[]; link: string | null; everyoneOpen?: boolean }>('/api/social/find', token, fetchImpl)
export const searchReaders = (token: string, q: string, fetchImpl?: FetchLike) => getJson<{ results: FindRow[] }>(`/api/social/find?q=${encodeURIComponent(q)}`, token, fetchImpl)
export const fetchProfile = (token: string | null, handle: string, fetchImpl?: FetchLike) => getJson<{ profile: ProfilePageData }>(`/api/social/profile/${encodeURIComponent(handle)}`, token, fetchImpl)

export type SocialAction = 'follow' | 'unfollow' | 'remove-follower' | 'block'

/**
 * The id of a reader the viewer blocked, found by handle in /api/social/blocked;
 * null when not blocked (or unknown). A blocked reader's profile answers 404 to
 * the viewer, so this is how their card knows to offer Unblock.
 */
export async function blockedReaderId(token: string, handle: string, fetchImpl?: FetchLike): Promise<string | null> {
  const data = await getJson<{ blocked: Array<{ id: string; handle: string | null }> }>('/api/social/blocked', token, fetchImpl)
  return data?.blocked?.find(reader => reader.handle === handle)?.id ?? null
}

export async function unblockReader(token: string, id: string, fetchImpl?: FetchLike): Promise<boolean> {
  return (await postJson('/api/social/unblock', token, { id }, fetchImpl)).ok
}

/** The relation a follow (true) or unfollow (false) leads to: what a Follow button shows while it waits. */
export function followingAfter(relation: Relation | null, follow: boolean): Relation {
  const followsYou = relation === 'friend' || relation === 'followed'
  if (follow) return followsYou ? 'friend' : 'follower'
  return followsYou ? 'followed' : 'stranger'
}

export async function socialAction(token: string, action: SocialAction, handle: string, fetchImpl?: FetchLike): Promise<{ ok: boolean; relation?: Relation; followsYou?: boolean }> {
  const result = await postJson<{ relation?: Relation; followsYou?: boolean }>(`/api/social/${action}`, token, { handle }, fetchImpl)
  return { ok: result.ok, relation: result.data?.relation, followsYou: result.data?.followsYou }
}

export async function reportProfile(token: string, handle: string, reason: ReportReason, fetchImpl?: FetchLike): Promise<boolean> {
  return (await postJson('/api/social/report', token, { handle, reason }, fetchImpl)).ok
}

/** The "Finished {book} · {hours}" card as a PNG, with the link it carries. */
export async function finishedCard(token: string, bookId: string, fetchImpl: FetchLike = fetch): Promise<{ blob: Blob; link: string; line: string } | null> {
  try {
    const res = await fetchImpl('/api/social/card', { method: 'POST', headers: { ...auth(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) })
    if (!res.ok) return null
    return { blob: await res.blob(), link: res.headers.get('X-Card-Link') || 'https://tinct.app', line: decodeURIComponent(res.headers.get('X-Card-Line') || '') }
  } catch {
    return null
  }
}

/**
 * Share a link (Invite) or a card: the system share sheet where there is one,
 * else copy the link. Returns what happened, for a one-line status.
 */
export async function shareOrCopy(data: { url: string; text?: string; title?: string; file?: File }): Promise<'shared' | 'copied' | 'saved' | 'cancelled' | 'failed'> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  const payload: ShareData = { url: data.url, text: data.text, title: data.title, ...(data.file ? { files: [data.file] } : {}) }
  if (nav.share && (!data.file || nav.canShare?.(payload))) {
    try { await nav.share(payload); return 'shared' } catch (error) { return (error as { name?: string })?.name === 'AbortError' ? 'cancelled' : 'failed' }
  }
  if (data.file) {
    const href = URL.createObjectURL(data.file)
    const link = document.createElement('a')
    link.href = href
    link.download = data.file.name
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 30_000)
    try { await navigator.clipboard?.writeText(data.url) } catch { /* the image is saved anyway */ }
    return 'saved'
  }
  try { await navigator.clipboard.writeText(data.url); return 'copied' } catch { return 'failed' }
}

/** Draw a ProfilePicture (from the social API) into an element; stored photos load with the token. */
export function paintPicture(el: HTMLElement, picture: ProfilePicture, token: string | null): void {
  paintAvatar(el, picture.src
    ? { kind: 'image', src: picture.src, pos: picture.pos, cover: picture.cover, private: picture.private }
    : { kind: 'initial', initial: picture.initial }, token)
}
