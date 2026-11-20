import { describe, expect, it } from 'vitest'
import { boardRows, BOARD_TOP } from './cardsRules'
import { CARDS_COPY } from './cardsCopy'
import type { BoardEntry } from './cardsApi'

// Synthetic readers only.
const entry = (rank: number, minutes: number, me = false): BoardEntry => ({
  rank, name: me ? 'Reader A' : `Reader ${rank}`, picture: null as unknown as BoardEntry['picture'],
  seconds: minutes * 60, duration: `${minutes} m`, me, ...(me ? {} : { handle: `reader-${rank}` }),
})
const ranks = (view: ReturnType<typeof boardRows>) => view.rows.map(item => item === 'gap' ? '···' : `${item.rank}${item.me ? ' You' : ''}`)

describe('Leaderboard rows (17 Nov 2026): top 5, the viewer, Show all', () => {
  it('leaves out readers under a minute: they read "0 m" (18 Nov 2026)', () => {
    const seconds = (rank: number, s: number, me = false): BoardEntry => ({ ...entry(rank, 0, me), seconds: s })
    const entries = [entry(1, 30), seconds(2, 59), seconds(3, 20), seconds(4, 40, true), seconds(5, 60)]
    expect(ranks(boardRows(entries, true))).toEqual(['1', '4 You', '5'])
  })

  it('leaves out readers with 0 m, folded and unfolded', () => {
    const entries = [entry(1, 30), entry(2, 20, true), entry(3, 10), entry(4, 0), entry(5, 0)]
    expect(ranks(boardRows(entries, false))).toEqual(['1', '2 You', '3'])
    expect(ranks(boardRows(entries, true))).toEqual(['1', '2 You', '3'])
    expect(boardRows(entries, false).toggle).toBeNull()
  })

  it('always shows the viewer, also at 0 m', () => {
    const entries = [entry(1, 30), entry(2, 20), entry(3, 0, true), entry(4, 0)]
    expect(ranks(boardRows(entries, false))).toEqual(['1', '2', '3 You'])
  })

  it('the viewer in the top 5: the first five and Show all', () => {
    const entries = [entry(1, 400, true), ...Array.from({ length: 12 }, (_, i) => entry(i + 2, 100 - i))]
    const view = boardRows(entries, false)
    expect(BOARD_TOP).toBe(5)
    expect(ranks(view)).toEqual(['1 You', '2', '3', '4', '5'])
    expect(view.toggle).toBe('expand')
  })

  it('the viewer at rank 10: the first five, a gap, then the viewer with their rank', () => {
    const entries = Array.from({ length: 13 }, (_, i) => entry(i + 1, 100 - i * 5, i + 1 === 10))
    const view = boardRows(entries, false)
    expect(ranks(view)).toEqual(['1', '2', '3', '4', '5', '···', '10 You'])
    expect(view.toggle).toBe('expand')
  })

  it('no Show all when every reader with time already shows', () => {
    expect(boardRows([entry(1, 9), entry(2, 8), entry(3, 7, true)], false).toggle).toBeNull()
    expect(boardRows([1, 2, 3, 4, 5].map(rank => entry(rank, 10 - rank)), false).toggle).toBeNull()
    // The viewer straight after the top five: nothing is hidden, so no gap and no Show all.
    const sixth = [1, 2, 3, 4, 5].map(rank => entry(rank, 10 - rank)).concat(entry(6, 1, true))
    expect(ranks(boardRows(sixth, false))).toEqual(['1', '2', '3', '4', '5', '6 You'])
    expect(boardRows(sixth, false).toggle).toBeNull()
  })

  it('unfolds to every reader with time in rank order, and folds back', () => {
    const entries = Array.from({ length: 13 }, (_, i) => entry(i + 1, 100 - i * 5, i + 1 === 10)).concat(entry(14, 0))
    const open = boardRows(entries, true)
    expect(ranks(open)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10 You', '11', '12', '13'])
    expect(open.toggle).toBe('collapse')
    expect(ranks(boardRows(entries, false))).toEqual(['1', '2', '3', '4', '5', '···', '10 You'])
  })

  it('the toggle reads "Show all" (no count) and "Show top 5"', () => {
    expect(CARDS_COPY.boardShowAll).toBe('Show all')
    expect(CARDS_COPY.boardShowTop).toBe('Show top 5')
  })
})
