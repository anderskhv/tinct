/**
 * The leaderboards for the account cards, in memory only (they name other
 * readers, so they are never written to this device's storage). One request
 * at a time per board: the You card's rank, the idle warm-up and the
 * Leaderboard card share it instead of each asking again, and the last answer
 * paints the Leaderboard at once while a fresh one is on its way (15 Oct
 * 2026: "the leaderboard takes too long to load").
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
const last = new Map<BoardTab, { userId: string | null; board: BoardData; at: number; askedAt: number }>()
/** The tab the reader picked on the Leaderboard on this page (memory only). */
let picked: { userId: string | null; tab: BoardTab } | null = null
/** The viewer's own 7-day seconds as the You card has them, after a flush that sent time at `since`. */
let own: { userId: string | null; seconds: number; since: number; name: string | null } | null = null
const listeners = new Set<() => void>()

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
    else if (tab === 'everyone') last.delete('everyone')
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

/** The last board this page read for this reader and tab, or null. */
export function knownBoard(userId: string | null, tab: BoardTab): BoardData | null {
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

/** How long ago that board was read (ms); Infinity when none. */
export function knownBoardAge(userId: string | null, tab: BoardTab): number {
  const entry = last.get(tab)
  return entry && entry.userId === userId ? Date.now() - entry.at : Infinity
}

/** Sign-out, and tests. */
export function forgetBoards(): void {
  pending.clear()
  last.clear()
  picked = null
  own = null
}
