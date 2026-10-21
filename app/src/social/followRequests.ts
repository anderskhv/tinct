/**
 * Follow requests made visible (Anders, 20 Oct 2026: "make it more obvious
 * when someone has added you as a friend"). A follow is a request until it is
 * followed back (19 Oct 2026), and Find readers → Following you is where it is
 * accepted. This module says which of those are waiting, and which this
 * device has already shown:
 *
 * - the pending requests: Following you rows whose relation is `followed`
 *   (they follow you, you do not follow back), the same rule as the Find
 *   readers count (cardsRules.followBackCount);
 * - a small dot on the reader's picture (library top bar) and on the reader
 *   menu's Profile row while any of them has not been shown yet;
 * - the handles already shown, kept on this device per account under
 *   `tinct:follow-requests-seen:<id>` (the `tinct:` prefix, so sign-out clears
 *   it with the rest; services/storage.ts clearLocalUserData).
 *
 * Only what Find readers already returns to the reader is used: name, handle
 * and picture of the people who follow them.
 */
import type { Relation } from './profileRules'

export const FOLLOW_REQUESTS_SEEN_KEY_PREFIX = 'tinct:follow-requests-seen:'

/** Sent on the window when requests were shown, so every dot on the page clears. */
export const FOLLOW_REQUESTS_SEEN_EVENT = 'tinct:follow-requests-seen'

/** At most this many handles are kept (Following you lists at most a few hundred). */
const SEEN_LIMIT = 500

export interface RequestRow {
  handle: string
  name: string
  relation: Relation
}

/** The requests waiting: readers who follow you whom you do not follow back. */
export function pendingRequests<T extends RequestRow>(rows: readonly T[] | null | undefined): T[] {
  return (rows ?? []).filter(row => row.relation === 'followed' && typeof row.handle === 'string' && row.handle !== '')
}

/** The requests this device has not shown yet. */
export function unseenRequests<T extends RequestRow>(rows: readonly T[] | null | undefined, seen: ReadonlySet<string>): T[] {
  return pendingRequests(rows).filter(row => !seen.has(row.handle))
}

/** The handles already shown to this account on this device (empty without an account or storage). */
export function readSeenRequests(userId: string | null | undefined): Set<string> {
  if (!userId) return new Set()
  try {
    const raw = localStorage.getItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + userId)
    const list = raw ? JSON.parse(raw) as unknown : []
    return new Set(Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

/**
 * The reader has now seen these requests (the You card or Following you was
 * open). The pending ones are kept, so a reader who stops following and later
 * asks again shows as new.
 */
export function markRequestsSeen(userId: string | null | undefined, rows: readonly RequestRow[] | null | undefined): void {
  if (!userId) return
  const handles = pendingRequests(rows).map(row => row.handle)
  const before = readSeenRequests(userId)
  const same = handles.length === before.size && handles.every(handle => before.has(handle))
  if (same) return
  try {
    if (handles.length) localStorage.setItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + userId, JSON.stringify(handles.slice(0, SEEN_LIMIT)))
    else localStorage.removeItem(FOLLOW_REQUESTS_SEEN_KEY_PREFIX + userId)
  } catch { /* private mode: the dot shows again next time */ }
  try { window.dispatchEvent(new CustomEvent(FOLLOW_REQUESTS_SEEN_EVENT, { detail: { userId } })) } catch { /* no window */ }
}

/** Whether the dot shows: a request this device has not shown yet. */
export function requestDotDue(userId: string | null | undefined, rows: readonly RequestRow[] | null | undefined): boolean {
  return Boolean(userId) && unseenRequests(rows, readSeenRequests(userId)).length > 0
}

/** The You card's line: "Anna wants to be friends", "Anna and 1 other want to be friends". */
export function requestsLine(rows: readonly RequestRow[]): string | null {
  const pending = pendingRequests(rows)
  if (!pending.length) return null
  const first = pending[0].name.trim() || pending[0].handle
  const others = pending.length - 1
  return others === 0 ? `${first} wants to be friends` : `${first} and ${others} other${others === 1 ? '' : 's'} want to be friends`
}

/** The dot's class, on the library's picture and the reader menu's Profile row. */
export const REQUEST_DOT_CLASS = 'tinct-request-dot'
