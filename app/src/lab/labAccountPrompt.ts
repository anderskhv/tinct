/**
 * Account-prompt policy for the lab reader (owner decision, 2026-09-06).
 *
 * - Reading is always free, signed in or not. Nothing here ever blocks reading.
 * - The first AI action (one chat message or one voice question) is free for
 *   an anonymous reader. The second opens a sheet asking for a free account;
 *   the turn is not sent and the reader can keep reading. Counted per device.
 * - Signed in: never prompted, never counted.
 * - Opening a second book while anonymous shows one quiet line under the
 *   reader header, once per device.
 *
 * Paid-tier enforcement is intentionally absent. `LAB_PAID_FEATURES` records
 * what Premium covers after the 30-day trial so the lines can be flipped in
 * one place later; nothing reads it to gate anything yet.
 */

/** Device counter of AI actions taken while anonymous. In the `tinct:` namespace `clearLocalUserData` wipes. */
export const LAB_AI_ACTIONS_KEY = 'tinct:lab-ai-actions'
/** Set once the second-book nudge has been shown on this device. */
export const LAB_SECOND_BOOK_NUDGE_KEY = 'tinct:lab-second-book-nudge'
/** AI actions an anonymous reader gets before the account sheet. */
export const LAB_FREE_AI_ACTIONS = 1

export type LabAiAction = 'chat' | 'voice'

/**
 * What Premium covers after the trial. `true` = paid after the trial (decided),
 * `null` = the owner has not decided. Not enforced anywhere yet.
 */
export const LAB_PAID_FEATURES = Object.freeze({
  chat: true,
  voice: true,
  recap: true,
  audiobook: null,
  compare: null,
}) satisfies Readonly<Record<string, boolean | null>>

export type LabPaidFeature = keyof typeof LAB_PAID_FEATURES

export function isLabPaidFeature(feature: LabPaidFeature): boolean {
  return LAB_PAID_FEATURES[feature] === true
}

export interface LabPromptStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

function browserStorage(): LabPromptStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export interface LabAccountPromptRequest {
  action: LabAiAction
  /** The typed text that was not sent, so the host can keep it in the composer. */
  text?: string
}

export type LabAiActionDecision =
  | { allowed: true; reason: 'signed-in' | 'free' }
  | { allowed: false; reason: 'account-required' }

export function readLabAiActionCount(storage: LabPromptStorage | null = browserStorage()): number {
  if (!storage) return 0
  try {
    const raw = storage.getItem(LAB_AI_ACTIONS_KEY)
    const parsed = raw == null ? 0 : Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
  } catch {
    return 0
  }
}

/** Pure: would this AI action go through right now? Does not count anything. */
export function decideLabAiAction(input: { signedIn: boolean; storage?: LabPromptStorage | null }): LabAiActionDecision {
  if (input.signedIn) return { allowed: true, reason: 'signed-in' }
  const storage = input.storage === undefined ? browserStorage() : input.storage
  return readLabAiActionCount(storage) < LAB_FREE_AI_ACTIONS
    ? { allowed: true, reason: 'free' }
    : { allowed: false, reason: 'account-required' }
}

/** Count one anonymous AI action on this device. Returns the new count. */
export function recordLabAiAction(storage: LabPromptStorage | null = browserStorage()): number {
  const next = readLabAiActionCount(storage) + 1
  try { storage?.setItem(LAB_AI_ACTIONS_KEY, String(next)) } catch { /* private mode / quota */ }
  return next
}

export function clearLabAiActionCount(storage: LabPromptStorage | null = browserStorage()): void {
  try { storage?.removeItem(LAB_AI_ACTIONS_KEY) } catch { /* private mode */ }
}

/**
 * The gate itself: decide, and when the action is a free anonymous one, spend
 * it. Call exactly once per attempted turn, before any network or mic work.
 * A blocked attempt spends nothing, so a dismissed sheet does not change the
 * count and the next attempt is gated the same way.
 */
export function gateLabAiAction(input: { signedIn: boolean; storage?: LabPromptStorage | null }): LabAiActionDecision {
  const storage = input.storage === undefined ? browserStorage() : input.storage
  const decision = decideLabAiAction({ signedIn: input.signedIn, storage })
  if (decision.allowed && decision.reason === 'free') recordLabAiAction(storage)
  return decision
}

/** Lab sign-in page URL. The sign-in runtime owns the return-target safety policy. */
export function labSignInHref(mode: 'create' | 'signin', returnTo: string): string {
  const query = new URLSearchParams()
  if (mode === 'create') query.set('mode', 'create')
  query.set('returnTo', returnTo || '/lab/library')
  return `/lab/sign-in?${query.toString()}`
}

/** Where the reader is now, for the sign-in return link. */
export function labCurrentPath(loc: { pathname: string; search: string } | null = typeof location === 'undefined' ? null : location): string {
  if (!loc) return '/lab/library'
  return `${loc.pathname}${loc.search}`
}

/**
 * Library book ids this device has read, from durable reading memory (session
 * anchors carry the library id: `bible`, `odyssey`, …) and the position
 * record's finished-chapter map (also keyed by library id). Position places
 * are deliberately not used: the Bible pins per biblical book, and Genesis →
 * Exodus is not a second book.
 */
export function labBooksReadOnDevice(input: {
  memory?: { sessions: Record<string, { anchor: { bookId: string } }> } | null
  position?: { finished: Record<string, number[]> } | null
}): Set<string> {
  const books = new Set<string>()
  for (const session of Object.values(input.memory?.sessions ?? {})) {
    if (session?.anchor?.bookId) books.add(session.anchor.bookId)
  }
  for (const [bookId, chapters] of Object.entries(input.position?.finished ?? {})) {
    if (Array.isArray(chapters) && chapters.length > 0) books.add(bookId)
  }
  return books
}

export function hasSeenSecondBookNudge(storage: LabPromptStorage | null = browserStorage()): boolean {
  try { return storage?.getItem(LAB_SECOND_BOOK_NUDGE_KEY) === '1' } catch { return false }
}

export function markSecondBookNudgeShown(storage: LabPromptStorage | null = browserStorage()): void {
  try { storage?.setItem(LAB_SECOND_BOOK_NUDGE_KEY, '1') } catch { /* private mode */ }
}

/**
 * One quiet line when an anonymous reader opens a book that is not the first
 * one read on this device. At most once per device; never when signed in.
 */
export function shouldShowSecondBookNudge(input: {
  signedIn: boolean
  bookId: string
  booksRead: ReadonlySet<string>
  storage?: LabPromptStorage | null
}): boolean {
  if (input.signedIn) return false
  const storage = input.storage === undefined ? browserStorage() : input.storage
  if (hasSeenSecondBookNudge(storage)) return false
  for (const bookId of input.booksRead) {
    if (bookId && bookId !== input.bookId) return true
  }
  return false
}
