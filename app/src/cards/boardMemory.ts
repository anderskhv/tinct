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
 * else Friends. Friends is asked for first: its answer carries the friend
 * count and whether Everyone is open, which answers 404 while closed.
 */
import { fetchBoard, type BoardData } from './cardsApi'

export type BoardTab = 'friends' | 'everyone'

const pending = new Map<string, Promise<BoardData | null>>()
const last = new Map<BoardTab, { userId: string | null; board: BoardData; at: number }>()
/** The tab the reader picked on the Leaderboard on this page (memory only). */
let picked: { userId: string | null; tab: BoardTab } | null = null

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

/** A board, sharing a request already on its way for the same reader and tab. */
export function loadBoard(token: string, userId: string | null, tab: BoardTab = 'friends'): Promise<BoardData | null> {
  const key = `${tab}:${token}`
  const running = pending.get(key)
  if (running) return running
  const request = fetchBoard(token, tab).catch(() => null).then(board => {
    if (board) last.set(tab, { userId, board, at: Date.now() })
    // Closed (or gone): forget a stale Everyone board.
    else if (tab === 'everyone') last.delete('everyone')
    return board
  }).finally(() => { pending.delete(key) })
  pending.set(key, request)
  return request
}

/** The board the cards open on: the picked tab; else Friends with a friend; else Everyone while open; else Friends. */
export async function loadDefaultBoard(token: string, userId: string | null): Promise<BoardData | null> {
  const chosen = pickedTab(userId)
  if (chosen === 'everyone') return (await loadBoard(token, userId, 'everyone')) ?? loadBoard(token, userId, 'friends')
  const friends = await loadBoard(token, userId, 'friends')
  if (chosen === 'friends' || hasFriends(friends) || (friends && friends.everyoneOpen !== true)) return friends
  return (await loadBoard(token, userId, 'everyone')) ?? friends
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
}
