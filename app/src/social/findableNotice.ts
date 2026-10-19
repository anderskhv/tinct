/**
 * The one-time notice about findable profiles (Anders, 19 Oct 2026): Find
 * readers now lists Friends profiles by name and picture, and a follow is a
 * request until it is followed back. A signed-in reader whose profile is
 * Friends or Everyone sees it once, in the library or on the You card,
 * whichever comes first, until they dismiss it or open Settings from it.
 * Chosen instead of an email.
 *
 * The dismissal is kept on this device per account (`tinct:` prefix, so
 * sign-out clears it with the rest; services/storage.ts clearLocalUserData).
 */
import type { Visibility } from './profileRules'

export const FINDABLE_NOTICE_KEY_PREFIX = 'tinct:findable-notice-dismissed:'

export const FINDABLE_NOTICE_COPY = {
  /** Anders's words, for a Friends profile. */
  friends: 'Readers can now find you by name and picture. Your reading stays private until you accept a follower. Change it in Settings.',
  /**
   * An Everyone profile's reading is open to anyone with the link, so the
   * Friends line would not be true for it.
   */
  everyone: 'Readers can now find you by name and picture. Your profile is set to Everyone, so anyone with your link sees your reading. Change it in Settings.',
  settings: 'Settings',
  dismiss: 'Dismiss',
  label: 'Finding readers',
} as const

/** The marker on every copy of the notice, so dismissing one removes any other on the page. */
export const FINDABLE_NOTICE_ATTR = 'data-findable-notice'

/** The notice's line for this profile, or null when it is not for this profile (Only me). */
export function findableNoticeText(visibility: Visibility | null | undefined): string | null {
  if (visibility === 'friends') return FINDABLE_NOTICE_COPY.friends
  if (visibility === 'everyone') return FINDABLE_NOTICE_COPY.everyone
  return null
}

/** Whether this signed-in reader still gets the notice: Friends or Everyone, not yet dismissed here. */
export function findableNoticeDue(profile: { visibility: Visibility } | null | undefined, userId: string | null | undefined): boolean {
  if (!userId || !findableNoticeText(profile?.visibility)) return false
  try { return localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + userId) === null } catch { return false }
}

/** Dismissed (or Settings opened from it): never again for this account on this device. */
export function dismissFindableNotice(userId: string | null | undefined): void {
  if (userId) {
    try { localStorage.setItem(FINDABLE_NOTICE_KEY_PREFIX + userId, '1') } catch { /* private mode: shown again next time */ }
  }
  if (typeof document !== 'undefined') for (const node of document.querySelectorAll(`[${FINDABLE_NOTICE_ATTR}]`)) node.remove()
}
