/**
 * The leaderboards for the account cards, in memory only (they name other
 * readers, so they are never written to this device's storage). One request
 * at a time per board: the You card's rank, the idle warm-up and the
 * Leaderboard card share it instead of each asking again, and the last answer
 * paints the Leaderboard at once while a fresh one is on its way (15 Oct
 * 2026: "the leaderboard takes too long to load").
 *
 * The board the cards open on is Everyone while it is open (Anders, 15 Oct
 * 2026: "a global leaderboard"), else Friends: Everyone is asked for first and
 * answers 404 while closed.
 */
import { fetchBoard, type BoardData } from './cardsApi'

export type BoardTab = 'friends' | 'everyone'

const pending = new Map<string, Promise<BoardData | null>>()
const last = new Map<BoardTab, { userId: string | null; board: BoardData; at: number }>()

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

/** The board the cards open on: Everyone while open, else Friends. */
export async function loadDefaultBoard(token: string, userId: string | null): Promise<BoardData | null> {
  return (await loadBoard(token, userId, 'everyone')) ?? loadBoard(token, userId, 'friends')
}

/** The last board this page read for this reader and tab, or null. */
export function knownBoard(userId: string | null, tab: BoardTab): BoardData | null {
  const entry = last.get(tab)
  return entry && entry.userId === userId ? entry.board : null
}

/** The last default board this page read: Everyone when it was open, else Friends. */
export function knownDefaultBoard(userId: string | null): BoardData | null {
  return knownBoard(userId, 'everyone') ?? knownBoard(userId, 'friends')
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
}
