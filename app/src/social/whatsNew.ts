/**
 * The What's-new card for returning readers (Anders, 22 Oct 2026; the
 * WhatsNew mockups): an account more than 30 days old (the Worker's
 * `returning`) sees it once, on the library, in the findable notice's style
 * and place, and instead of it. Continue opens the profile step when the
 * profile was never set up (`needsSetup`); otherwise it closes the card.
 * Later closes it for good.
 *
 * Once per account, as the findable notice (findableNotice.ts): the moment it
 * is shown it is marked seen in the account's `preferences` row
 * (findableNoticeAccount.ts, field `whatsNewSeen`), so no other device shows it
 * again; it stays on screen for this visit until Continue or Later. A device
 * shows it only after the account said it was not seen yet.
 *
 * The device key caches that answer per account (`tinct:` prefix, so sign-out
 * clears it): '1' seen here, '2' the account has it as well.
 */
import { readAccountNoticeSeen, writeAccountNoticeSeen } from './findableNoticeAccount'

export const WHATS_NEW_PREF = 'whatsNewSeen'
export const WHATS_NEW_KEY_PREFIX = 'tinct:whats-new-seen:'

/** The mockup's words (WhatsNew, 22 Oct 2026). */
export const WHATS_NEW_COPY = {
  title: 'Tinct has grown up a lot',
  items: [
    { title: 'Your own books and PDFs', line: 'Open your PDFs and EPUBs with the same companion.' },
    { title: 'Read with friends', line: 'Follow people you know and see who has read most this week.' },
    { title: 'AI in the text', line: 'You can now explain, simplify and fact-check as you read, by highlighting the text.' },
  ],
  continue: 'Continue',
  later: 'Later',
} as const

/** The marker on the card, so closing it removes any copy on the page. */
export const WHATS_NEW_ATTR = 'data-whats-new'

/** Whether the card is for this account at all: more than 30 days old. */
export function whatsNewFor(profile: { returning?: boolean } | null | undefined): boolean {
  return profile?.returning === true
}

const onScreen = new Set<string>()
const accountAnswer = new Map<string, boolean>()
const asking = new Map<string, Promise<void>>()
const recording = new Map<string, Promise<void>>()

function cached(userId: string): string | null {
  try { return localStorage.getItem(WHATS_NEW_KEY_PREFIX + userId) } catch { return null }
}
function cache(userId: string, value: '1' | '2'): void {
  try { if (cached(userId) !== '2') localStorage.setItem(WHATS_NEW_KEY_PREFIX + userId, value) } catch { /* private mode: the account still has it */ }
}

/** For this account, and on screen this visit or not yet seen here or by the account (checkWhatsNewAccount must have asked). */
export function whatsNewDue(profile: { returning?: boolean } | null | undefined, userId: string | null | undefined): boolean {
  if (!userId || !whatsNewFor(profile)) return false
  if (onScreen.has(userId)) return true
  if (cached(userId) !== null) return false
  return accountAnswer.get(userId) === false
}

/** Asks the account once per visit; a failed read leaves the card not due (never a second showing). */
export function checkWhatsNewAccount(userId: string | null | undefined): Promise<void> {
  if (!userId) return Promise.resolve()
  const local = cached(userId)
  if (local === '2' || accountAnswer.has(userId)) return Promise.resolve()
  if (local !== null) return recordWhatsNewSeen(userId)
  let pending = asking.get(userId)
  if (!pending) {
    pending = (async () => {
      try {
        const seen = await readAccountNoticeSeen(userId, WHATS_NEW_PREF)
        accountAnswer.set(userId, seen)
        if (seen) cache(userId, '2')
      } catch { /* unknown: not shown this visit */ } finally { asking.delete(userId) }
    })()
    asking.set(userId, pending)
  }
  return pending
}

/** Marks it seen here and in the account's preferences row. */
export function recordWhatsNewSeen(userId: string | null | undefined): Promise<void> {
  if (!userId) return Promise.resolve()
  cache(userId, '1')
  accountAnswer.set(userId, true)
  if (cached(userId) === '2') return Promise.resolve()
  let pending = recording.get(userId)
  if (!pending) {
    pending = writeAccountNoticeSeen(userId, WHATS_NEW_PREF)
      .then(kept => { if (kept) cache(userId, '2') }, () => { /* '1' stays, so a later visit tells the account */ })
      .finally(() => recording.delete(userId))
    recording.set(userId, pending)
  }
  return pending
}

/** Shown: seen for the account from now on; this copy stays until Continue or Later. */
export function markWhatsNewShown(userId: string): void {
  onScreen.add(userId)
  void recordWhatsNewSeen(userId)
}

/** Continue or Later: the card goes and never comes back. */
export function dismissWhatsNew(userId: string | null | undefined): void {
  if (userId) {
    onScreen.delete(userId)
    void recordWhatsNewSeen(userId)
  }
  if (typeof document !== 'undefined') for (const node of document.querySelectorAll(`[${WHATS_NEW_ATTR}]`)) node.remove()
}

/** A fresh visit, for tests. */
export function resetWhatsNewVisit(): void {
  onScreen.clear(); accountAnswer.clear(); asking.clear(); recording.clear()
}
