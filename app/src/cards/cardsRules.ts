/**
 * The account cards' rules, on the existing friends system (Anders,
 * 9 October 2026). Pure.
 *
 * - Settings: the Leaderboard switch is disabled while "Who can see you" is
 *   Only me or "Show my reading time" is off (the board shows time), and the
 *   reader is taken off the board when either happens.
 * - Follow buttons: Friends / Following (a state, outlined) and Follow back /
 *   Follow (an action, black), as the Friends page named them.
 * - A reader's profile shows what the server sends: a Friends-only profile
 *   seen by a non-friend (`limited`) is the header only.
 */
import type { OwnProfile, ProfilePageData } from './cardsApi'
import type { Relation } from '../social/profileRules'
import { CARDS_COPY } from './cardsCopy'

export type PrivacyFields = Pick<OwnProfile, 'visibility' | 'showReading' | 'showTime' | 'onLeaderboard'>

export function leaderboardAllowed(profile: Pick<OwnProfile, 'visibility' | 'showTime'>): boolean {
  return profile.visibility !== 'only_me' && profile.showTime
}

/**
 * The line under the leaderboard when friends cannot see the reader there
 * (19 Oct 2026), with the reason and where to fix it; null otherwise. Only the
 * reader's own settings give a reason: anything else that keeps them off a
 * board (the Everyone board's own rules) shows no line.
 */
export function boardHiddenLine(meShown: boolean | undefined, profile: Pick<OwnProfile, 'visibility' | 'showTime' | 'onLeaderboard'> | null | undefined): string | null {
  if (meShown !== false || !profile) return null
  if (profile.visibility === 'only_me') return CARDS_COPY.hiddenOnlyMe
  if (!profile.showTime) return CARDS_COPY.hiddenTime
  if (!profile.onLeaderboard) return CARDS_COPY.hiddenLeaderboard
  return null
}

/** The settings after one change, and the patch to post at once (POST /api/profile). */
export function privacyChange(current: PrivacyFields, change: Partial<PrivacyFields>): { next: PrivacyFields; patch: Partial<PrivacyFields> } {
  const merged = { ...current, ...change }
  // The switch is disabled: turning it on posts nothing.
  if (change.onLeaderboard && !leaderboardAllowed(merged)) return { next: current, patch: {} }
  const patch: Partial<PrivacyFields> = { ...change }
  if (!leaderboardAllowed(merged) && merged.onLeaderboard) {
    patch.onLeaderboard = false
    merged.onLeaderboard = false
  }
  return { next: merged, patch }
}

export type FollowButton = { label: string; style: 'fill' | 'line'; action: 'follow' | 'unfollow' | null }

/** The Friends page's follow words (friendsPage.ts followLabel, profilePageView followButtonHtml). */
export function followButton(relation: Relation | null): FollowButton | null {
  if (relation === 'self' || relation === 'blocked') return null
  if (relation === 'friend') return { label: 'Friends', style: 'line', action: 'unfollow' }
  if (relation === 'follower') return { label: 'Following', style: 'line', action: 'unfollow' }
  if (relation === 'followed') return { label: 'Follow back', style: 'fill', action: 'follow' }
  return { label: 'Follow', style: 'fill', action: 'follow' }
}

/** The relation after a follow (true) or unfollow (false), shown while the answer is on its way. */
export function relationAfter(relation: Relation | null, follow: boolean): Relation {
  const followsYou = relation === 'friend' || relation === 'followed'
  if (follow) return followsYou ? 'friend' : 'follower'
  return followsYou ? 'followed' : 'stranger'
}

/** The Find readers badge: readers who follow you whom you do not follow back. */
export function followBackCount(rows: Array<{ relation: Relation }>): number {
  return rows.filter(row => row.relation === 'followed').length
}

/** "Ch. 9 of 26" -> 9/26; null when the text carries no chapter progress. */
export function chapterFraction(progress: string | null | undefined): number | null {
  const match = /Ch\.\s*(\d+)\s+of\s+(\d+)/.exec(String(progress || ''))
  if (!match) return null
  const of = Number(match[2])
  return of > 0 ? Math.min(1, Number(match[1]) / of) : null
}

export interface ReaderCardView {
  /** Header only: picture, name and the button. */
  limited: boolean
  facts: Array<{ value: string; label: string }>
  readingNow: ProfilePageData['readingNow']
  finished: ProfilePageData['finished']
}

/** What a reader's profile card shows, from the server's view of it. */
export function readerCardView(data: ProfilePageData): ReaderCardView {
  if (data.limited) return { limited: true, facts: [], readingNow: null, finished: null }
  const facts: ReaderCardView['facts'] = []
  if (data.time) facts.push({ value: data.time.last7, label: 'last 7 days' }, { value: data.time.year, label: 'this year' })
  if (data.finished) facts.push({ value: String(data.finished.length), label: 'finished' })
  return {
    limited: false,
    facts,
    readingNow: data.readingNow?.length ? data.readingNow : null,
    finished: data.finished?.length ? data.finished : null,
  }
}
