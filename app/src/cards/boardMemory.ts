/**
 * The leaderboards for the account cards. One request at a time per board:
 * the You card's rank, the idle warm-up and the Leaderboard card share it
 * instead of each asking again, and the last answer paints the Leaderboard at
 * once while a fresh one is on its way (15 Oct 2026: "the leaderboard takes
 * too long to load").
 *
 * Kept on this device too (Anders, 22 Oct 2026: "3. yes."): the last board of
 * each tab is stored per signed-in account (`tinct:account-board:<userId>`,
 * the user id inside as well), so a cold start paints the Leaderboard and the
 * You card's rank at once and refreshes them in place. The boards name other
 * readers, so the copy is only ever read back for the account that stored it,
 * is at most 7 days old (older tabs are dropped unread), is size-capped, is
 * checked field by field when read, and is removed on sign-out and account
 * deletion (forgetBoards, and clearLocalUserData's `tinct:` sweep).
 *
 * The board the cards open on: the tab the reader picked on this page, if
 * they picked one; else Friends when the reader has at least one mutual friend
 * (19 Oct 2026: family readers looked for each other on Everyone); else
 * Everyone while it is open (Anders, 15 Oct 2026: "a global leaderboard"),
 * else Friends. The Worker chooses it in the same request (`tab=default`,
 * 21 Oct 2026), so a reader without friends no longer waits for Friends and
 * then Everyone; an older Worker answers Friends, and Everyone is asked then.
 *
 * The board no longer waits for this device's pending reading time to be
 * sent (21 Oct 2026: "still takes too long"): the two go side by side, and
 * when the flush did send time, the viewer's own row takes the You card's
 * figure read after it (noteOwnSeconds), re-ranked here, so both still say
 * the same minutes (#522). Other readers' rows are always the Worker's.
 */
import { formatDuration } from '../readingTime/model'
import { rankRows } from '../social/socialRules'
import { fetchBoard, type BoardData, type BoardEntry } from './cardsApi'

export type BoardTab = 'friends' | 'everyone'

const pending = new Map<string, { at: number; request: Promise<BoardData | null> }>()
/** `stored`: read from this device's copy, not by this page (always asked for again). */
const last = new Map<BoardTab, { userId: string | null; board: BoardData; at: number; askedAt: number; stored?: boolean }>()
/** The tab the reader picked on the Leaderboard on this page (memory only). */
let picked: { userId: string | null; tab: BoardTab } | null = null
/** The viewer's own 7-day seconds as the You card has them, after a flush that sent time at `since`. */
let own: { userId: string | null; seconds: number; since: number; name: string | null } | null = null
const listeners = new Set<() => void>()

// ===== This device's copy (22 Oct 2026) =====

export const BOARD_STORE_PREFIX = 'tinct:account-board:'
const BOARD_STORE_VERSION = 1
/** A stored board older than this is not shown (and is dropped). */
export const BOARD_STORE_MAX_AGE_MS = 7 * 86_400_000
/** The Worker sends at most 50 rows (social.ts BOARD_LIMIT) and the viewer's own. */
const BOARD_STORE_MAX_ROWS = 60
/** Two boards of 50 rows are about 25 KB; anything far larger is not ours. */
export const BOARD_STORE_MAX_CHARS = 64_000
/** Accounts whose stored boards this page has read already (read once per page). */
const hydrated = new Set<string>()

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

const isString = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e9
/** A picture address goes into CSS url("…"): only this site's own paths, with nothing that could end the string. */
const SAFE_SRC = /^\/(?!\/)[A-Za-z0-9._~/?&=%:-]{1,400}$/
const SAFE_POS = /^[0-9a-z.% -]{0,40}$/

function validPicture(raw: unknown): BoardEntry['picture'] | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (!(p.src === null || (typeof p.src === 'string' && SAFE_SRC.test(p.src)))) return null
  if (!isString(p.pos, 40) || !SAFE_POS.test(p.pos) || typeof p.cover !== 'boolean' || typeof p.private !== 'boolean' || !isString(p.initial, 8)) return null
  return { src: p.src, pos: p.pos, cover: p.cover, private: p.private, initial: p.initial }
}

function validEntry(raw: unknown): BoardEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  const picture = validPicture(e.picture)
  if (!picture || !isCount(e.rank) || !isString(e.name, 200) || !isCount(e.seconds) || !isString(e.duration, 40) || typeof e.me !== 'boolean') return null
  if (e.handle !== undefined && !(isString(e.handle, 64) && /^[a-z0-9_.-]+$/i.test(e.handle))) return null
  const entry: BoardEntry = { rank: e.rank, name: e.name, picture, seconds: e.seconds, duration: e.duration, me: e.me }
  if (typeof e.handle === 'string') entry.handle = e.handle
  return entry
}

/** A stored board, field by field; null when anything is not as the Worker sends it. */
export function validStoredBoard(raw: unknown, tab: BoardTab): BoardData | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  if (b.tab !== tab || !Array.isArray(b.entries) || b.entries.length > BOARD_STORE_MAX_ROWS || !isCount(b.total) || typeof b.meShown !== 'boolean') return null
  const window = b.window as Record<string, unknown> | undefined
  if (!window || !isString(window.start, 40) || !isString(window.end, 40)) return null
  if (!(b.refreshedAt === null || isString(b.refreshedAt, 40))) return null
  if (b.friends !== undefined && !isCount(b.friends)) return null
  if (b.everyoneOpen !== undefined && typeof b.everyoneOpen !== 'boolean') return null
  const entries: BoardEntry[] = []
  for (const item of b.entries) {
    const entry = validEntry(item)
    if (!entry) return null
    entries.push(entry)
  }
  const me = b.me === null ? null : validEntry(b.me)
  if (b.me !== null && !me) return null
  if (me && !me.me) return null
  const board: BoardData = { tab, window: { start: window.start, end: window.end }, refreshedAt: b.refreshedAt as string | null, total: b.total, me, meShown: b.meShown, entries }
  if (typeof b.friends === 'number') board.friends = b.friends
  if (typeof b.everyoneOpen === 'boolean') board.everyoneOpen = b.everyoneOpen
  return board
}

type StoredTab = { at: number; board: BoardData }

/** This account's stored boards that are still fresh enough to show; drops the copy when it cannot be used. */
export function readStoredBoards(userId: string | null, now = Date.now()): Partial<Record<BoardTab, StoredTab>> {
  if (!userId) return {}
  const key = BOARD_STORE_PREFIX + userId
  try {
    const raw = storage()?.getItem(key)
    if (!raw) return {}
    const data = raw.length <= BOARD_STORE_MAX_CHARS ? JSON.parse(raw) as { v?: unknown; userId?: unknown; tabs?: Record<string, { at?: unknown; board?: unknown }> } : null
    const out: Partial<Record<BoardTab, StoredTab>> = {}
    if (data && data.v === BOARD_STORE_VERSION && data.userId === userId && data.tabs && typeof data.tabs === 'object') {
      for (const tab of ['friends', 'everyone'] as const) {
        const item = data.tabs[tab]
        const at = item?.at
        if (typeof at !== 'number' || !Number.isFinite(at) || at > now + 60_000 || now - at > BOARD_STORE_MAX_AGE_MS) continue
        const board = validStoredBoard(item?.board, tab)
        if (board) out[tab] = { at, board }
      }
    }
    if (!out.friends && !out.everyone) storage()?.removeItem(key)
    return out
  } catch {
    try { storage()?.removeItem(key) } catch { /* blocked */ }
    return {}
  }
}

/** Store what this page knows of this account's boards (both tabs), or nothing. */
function persist(userId: string | null): void {
  if (!userId) return
  const key = BOARD_STORE_PREFIX + userId
  const tabs: Partial<Record<BoardTab, StoredTab>> = {}
  for (const [tab, entry] of last) if (entry.userId === userId) tabs[tab] = { at: entry.at, board: entry.board }
  try {
    const raw = JSON.stringify({ v: BOARD_STORE_VERSION, userId, tabs })
    if ((!tabs.friends && !tabs.everyone) || raw.length > BOARD_STORE_MAX_CHARS) storage()?.removeItem(key)
    else storage()?.setItem(key, raw)
  } catch { /* full or blocked: the boards stay in this page's memory */ }
}

/** The first time this page asks about an account: its stored boards, unless this page has read newer ones. */
function hydrate(userId: string | null): void {
  if (!userId || hydrated.has(userId)) return
  hydrated.add(userId)
  const stored = readStoredBoards(userId)
  for (const tab of ['friends', 'everyone'] as const) {
    const item = stored[tab]
    const entry = last.get(tab)
    if (item && !(entry && entry.userId === userId)) last.set(tab, { userId, board: item.board, at: item.at, askedAt: item.at, stored: true })
  }
}

/** Remove every stored board on this device (sign-out, account deletion). */
export function forgetStoredBoards(): void {
  const store = storage()
  if (!store) return
  try {
    const keys: string[] = []
    for (let i = 0; i < store.length; i++) { const key = store.key(i); if (key?.startsWith(BOARD_STORE_PREFIX)) keys.push(key) }
    for (const key of keys) store.removeItem(key)
  } catch { /* blocked: nothing was stored */ }
}

/** The reader chose a tab: the cards open on it from now on, on this page. */
export function rememberPickedBoard(userId: string | null, tab: BoardTab): void {
  picked = { userId, tab }
}

function pickedTab(userId: string | null): BoardTab | null {
  return picked && picked.userId === userId ? picked.tab : null
}

/** Whether a Friends board shows the reader has a mutual friend (an older Worker sends no count: a friend's row says so). */
export function hasFriends(board: BoardData | null | undefined): boolean {
  if (!board) return false
  return typeof board.friends === 'number' ? board.friends > 0 : board.entries.some(entry => !entry.me)
}

/**
 * The board with the viewer's own row at `seconds`, re-ranked by the Worker's
 * rule (most time first, then by name; equal time, equal rank). Unchanged when
 * the board is cut off (more readers than rows), since the rank among the
 * readers not listed cannot be told here, or when the row already says so.
 */
export function withOwnSeconds(board: BoardData, seconds: number, name: string | null = null): BoardData {
  const mine = board.entries.find(entry => entry.me) ?? board.me
  if (!mine || mine.seconds === seconds) return board
  const inList = board.entries.some(entry => entry.me)
  if (board.total > board.entries.length + (inList ? 0 : 1)) return board
  const rows = [...board.entries.filter(entry => !entry.me), { ...mine, seconds, duration: formatDuration(seconds) }]
  const ranked = rankRows(rows, row => row.seconds, row => (row.me ? name ?? row.name : row.name))
  const entries: BoardEntry[] = ranked.map(item => ({ ...item.row, rank: item.rank }))
  // Not cut off, so every reader is listed: the viewer's row goes in its place among them.
  return { ...board, entries, me: entries.find(entry => entry.me) ?? null }
}

/** A board asked for before the flush that sent this device's time: the viewer's row as the You card has it. */
function reconciled(board: BoardData, userId: string | null, askedAt: number): BoardData {
  return own && own.userId === userId && askedAt < own.since ? withOwnSeconds(board, own.seconds, own.name) : board
}

/**
 * This device's pending time was sent at `since` and the You card read its
 * figure after that: boards asked for before then show the viewer's row with
 * these seconds (they may have been read before the time landed). Tells the
 * open Leaderboard and the You card's rank (onBoardsChanged).
 */
export function noteOwnSeconds(userId: string | null, seconds: number, since: number, name: string | null = null): void {
  own = { userId, seconds, since, name }
  let changed = false
  for (const [tab, entry] of last) {
    if (entry.userId !== userId) continue
    const board = reconciled(entry.board, userId, entry.askedAt)
    if (board !== entry.board) { last.set(tab, { ...entry, board }); changed = true }
  }
  if (changed) persist(userId)
  if (changed) for (const listener of [...listeners]) listener()
}

/** Called when a known board changed in place (the viewer's own row); returns the unsubscribe. */
export function onBoardsChanged(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

type BoardAsk = BoardTab | 'default'

/** A board, sharing a request already on its way for the same reader and tab. */
export function loadBoard(token: string, userId: string | null, tab: BoardAsk = 'friends'): Promise<BoardData | null> {
  // The stored tabs first, so storing this answer keeps the other tab's copy.
  hydrate(userId)
  const key = `${tab}:${token}`
  const running = pending.get(key)
  if (running) return running.request
  // The board the cards open on is on its way: it is this tab's when it says so.
  const opening = tab !== 'default' ? pending.get(`default:${token}`) : undefined
  if (opening) return opening.request.then(board => (board && board.tab === tab ? board : loadBoard(token, userId, tab)))
  const askedAt = Date.now()
  const request = fetchBoard(token, tab).catch(() => null).then(answer => {
    const board = answer ? reconciled(answer, userId, askedAt) : null
    if (board) last.set(board.tab === 'everyone' ? 'everyone' : 'friends', { userId, board, at: Date.now(), askedAt })
    // Closed (or gone): forget a stale Everyone board.
    else if (tab === 'everyone' && last.get('everyone')?.userId === userId) last.delete('everyone')
    if (board || tab === 'everyone') persist(userId)
    return board
  }).finally(() => { if (pending.get(key)?.request === request) pending.delete(key) })
  pending.set(key, { at: askedAt, request })
  return request
}

/** The board the cards open on: the picked tab; else Friends with a friend; else Everyone while open; else Friends. */
export async function loadDefaultBoard(token: string, userId: string | null): Promise<BoardData | null> {
  const chosen = pickedTab(userId)
  if (chosen === 'everyone') return (await loadBoard(token, userId, 'everyone')) ?? loadBoard(token, userId, 'friends')
  if (chosen === 'friends') return loadBoard(token, userId, 'friends')
  const board = await loadBoard(token, userId, 'default')
  // An older Worker reads `default` as Friends: then Everyone, as before.
  if (!board || board.tab === 'everyone' || hasFriends(board) || board.everyoneOpen !== true) return board
  return (await loadBoard(token, userId, 'everyone')) ?? board
}

/** The last board this page (or, before it, this device) read for this reader and tab, or null. */
export function knownBoard(userId: string | null, tab: BoardTab): BoardData | null {
  hydrate(userId)
  const entry = last.get(tab)
  return entry && entry.userId === userId ? entry.board : null
}

/** The last default board this page read, by the same rule as loadDefaultBoard. */
export function knownDefaultBoard(userId: string | null): BoardData | null {
  const friends = knownBoard(userId, 'friends')
  const everyone = knownBoard(userId, 'everyone')
  const chosen = pickedTab(userId)
  if (chosen === 'everyone') return everyone ?? friends
  if (chosen === 'friends' || hasFriends(friends)) return friends
  return everyone ?? friends
}

/** How long ago this page read that board (ms); Infinity when none, or when it is this device's copy (shown, then asked for again). */
export function knownBoardAge(userId: string | null, tab: BoardTab): number {
  hydrate(userId)
  const entry = last.get(tab)
  return entry && entry.userId === userId && !entry.stored ? Date.now() - entry.at : Infinity
}

/** Sign-out and account deletion (and tests): this page's boards and this device's copy. */
export function forgetBoards(): void {
  boardMemoryNewPage()
  forgetStoredBoards()
}

/** Tests: a new page on the same device (this page's memory goes; the stored copy stays). */
export function boardMemoryNewPage(): void {
  pending.clear()
  last.clear()
  hydrated.clear()
  picked = null
  own = null
}
