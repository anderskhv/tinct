/**
 * The one-time notice about findable profiles (Anders, 19 Oct 2026): Find
 * readers now lists Friends profiles by name and picture, and a follow is a
 * request until it is followed back. A signed-in reader whose profile is
 * Friends or Everyone, and was set up before that change (setUpBeforeFindable,
 * from the profile's set_up_at), sees it once per account, in the library or
 * on the You card, whichever comes first. A profile set up since saw the
 * choice already. Chosen instead of an email.
 *
 * Once per account (Anders, 21 Oct 2026): the moment it is shown, it is marked
 * seen in the account's existing `preferences` row (findableNoticeAccount.ts), so
 * no other device, browser or private window shows it again. It stays on
 * screen for this visit until Settings or Dismiss. Opening Settings, where
 * profile visibility is chosen, marks it seen too. A device shows it only
 * after the account said it was not seen yet.
 *
 * The device key is a cache of that answer per account (`tinct:` prefix, so
 * sign-out clears it; services/storage.ts clearLocalUserData): '1' seen here,
 * '2' the account has it as well.
 */
import type { Visibility } from './profileRules'
import { readAccountNoticeSeen, writeAccountNoticeSeen } from './findableNoticeAccount'

export const FINDABLE_NOTICE_KEY_PREFIX = 'tinct:findable-notice-dismissed:'
export { FINDABLE_NOTICE_PREF } from './findableNoticeAccount'

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

export type FindableNoticeProfile = { visibility: Visibility; setUpBeforeFindable?: boolean }

/** Whether the notice is for this profile at all: Friends or Everyone, set up before findable profiles. */
export function findableNoticeFor(profile: FindableNoticeProfile | null | undefined): boolean {
  return profile?.setUpBeforeFindable === true && findableNoticeText(profile.visibility) !== null
}

/** On screen this visit (shown, not yet ended by Settings or Dismiss). */
const onScreen = new Set<string>()
/** What the account said this visit: true seen, false not yet. */
const accountAnswer = new Map<string, boolean>()
const asking = new Map<string, Promise<void>>()
const recording = new Map<string, Promise<void>>()

function cached(userId: string): string | null {
  try { return localStorage.getItem(FINDABLE_NOTICE_KEY_PREFIX + userId) } catch { return null }
}
function cache(userId: string, value: '1' | '2'): void {
  try { if (cached(userId) !== '2') localStorage.setItem(FINDABLE_NOTICE_KEY_PREFIX + userId, value) } catch { /* private mode: the account still has it */ }
}

/**
 * Whether this signed-in reader gets the notice: for this profile, already
 * on screen this visit, or else not seen here and not seen by the account
 * (checkFindableNoticeAccount must have asked).
 */
export function findableNoticeDue(profile: FindableNoticeProfile | null | undefined, userId: string | null | undefined): boolean {
  if (!userId || !findableNoticeFor(profile)) return false
  if (onScreen.has(userId)) return true
  if (cached(userId) !== null) return false
  return accountAnswer.get(userId) === false
}

/**
 * Asks the account once per visit whether the notice was seen. Resolves once
 * findableNoticeDue can answer; on a failed read it stays not due (the notice
 * waits for a later visit rather than risk a second showing).
 */
export function checkFindableNoticeAccount(userId: string | null | undefined): Promise<void> {
  if (!userId) return Promise.resolve()
  const local = cached(userId)
  if (local === '2' || accountAnswer.has(userId)) return Promise.resolve()
  // Seen here before the account kept it: tell the account once.
  if (local !== null) return recordFindableNoticeSeen(userId)
  let pending = asking.get(userId)
  if (!pending) {
    pending = (async () => {
      try {
        const seen = await readAccountNoticeSeen(userId)
        accountAnswer.set(userId, seen)
        if (seen) cache(userId, '2')
      } catch { /* unknown: not shown this visit */ } finally { asking.delete(userId) }
    })()
    asking.set(userId, pending)
  }
  return pending
}

/** Marks it seen here and in the account's preferences row (merged, versioned). */
export function recordFindableNoticeSeen(userId: string | null | undefined): Promise<void> {
  if (!userId) return Promise.resolve()
  cache(userId, '1')
  accountAnswer.set(userId, true)
  if (cached(userId) === '2') return Promise.resolve()
  let pending = recording.get(userId)
  if (!pending) {
    pending = writeAccountNoticeSeen(userId)
      .then(kept => { if (kept) cache(userId, '2') }, () => { /* the device key stays '1', so a later visit tells the account */ })
      .finally(() => recording.delete(userId))
    recording.set(userId, pending)
  }
  return pending
}

/** Shown: seen for the account from now on, while this copy stays until the reader ends it. */
export function markFindableNoticeShown(userId: string): void {
  onScreen.add(userId)
  void recordFindableNoticeSeen(userId)
}

/** A fresh visit, for tests: forgets what this page load showed and learned. */
export function resetFindableNoticeVisit(): void {
  onScreen.clear(); accountAnswer.clear(); asking.clear(); recording.clear()
}

/** Settings or Dismiss: the notice goes from the page (every copy) and never comes back. */
export function dismissFindableNotice(userId: string | null | undefined): void {
  if (userId) {
    onScreen.delete(userId)
    void recordFindableNoticeSeen(userId)
  }
  if (typeof document !== 'undefined') for (const node of document.querySelectorAll(`[${FINDABLE_NOTICE_ATTR}]`)) node.remove()
}
