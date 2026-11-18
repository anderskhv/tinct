import { describe, expect, it } from 'vitest'
import type { LabBookPlace, LabPositionState } from '../../lab/labPosition'
import { mergeLabPositionStatesByTime } from '../../lab/labPosition'
import {
  POSITION_HISTORY_MAX,
  POSITION_HISTORY_MAX_AGE_MS,
  appendPositionHistory,
  parsePositionWriteClient,
  positionWriteEntries,
  readPositionHistory,
  type PositionHistoryEntry,
} from './positionHistory'

const now = 1_800_000_000_000
function place(book: string, chapter: number, paragraph: number, at: number, device = 'phone', edition = 'mm-en'): LabBookPlace {
  return { bookId: book, headerBook: book, chapterNumber: chapter, sequentialChapter: chapter, paragraphIndex: paragraph,
    wordIndex: 3, primaryEditionKey: edition, updatedAt: at, deviceId: device, rev: at }
}
function state(places: LabBookPlace[], settled: string | null, settledAt: number): LabPositionState {
  return { books: Object.fromEntries(places.map(p => [p.bookId, p])), finished: {}, hidden: {},
    lastSettledBookId: settled, lastSettledAt: settledAt, updatedAt: settledAt, deviceId: places[0]?.deviceId ?? 'phone' }
}
const merge = (a: LabPositionState, b: LabPositionState) => mergeLabPositionStatesByTime(a, b, { requireSettleAcknowledgement: true })

describe('position write history entries', () => {
  it('logs only books whose place the write carried differently, with the fields asked for', () => {
    const before = state([place('master', 2, 244, now - 10_000), place('hamlet', 1, 5, now - 50_000)], 'master', now - 10_000)
    // The write repeats Hamlet unchanged and moves Master and Margarita back to ¶62 with a newer clock.
    const incoming = state([place('master', 2, 62, now - 1_000, 'phone'), place('hamlet', 1, 5, now - 50_000)], 'master', now - 1_000)
    const entries = positionWriteEntries(before, incoming, merge(before, incoming), { tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'page-turn' }, now)
    expect(entries).toEqual([{
      at: now, device: 'phone', tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'page-turn',
      book: 'master', edition: 'mm-en', chapter: 2, paragraph: 62, word: 3, placeAt: now - 1_000, rev: now - 1_000, outcome: 'accepted',
    }])
  })

  it('marks an older place the server kept its own over as ignored', () => {
    const before = state([place('master', 2, 244, now - 1_000, 'laptop')], 'master', now - 1_000)
    const stale = state([place('master', 2, 62, now - 9_000, 'phone')], 'master', now - 9_000)
    const merged = merge(before, stale)
    expect(merged.books.master.paragraphIndex).toBe(244)
    expect(positionWriteEntries(before, stale, merged, {}, now).map(e => [e.paragraph, e.outcome])).toEqual([[62, 'ignored']])
  })

  it('marks a stored place whose resume claim the merge refused as overrode', () => {
    // A device that never saw the account's settled book (Romans) claims Genesis as the newer resume.
    const before = state([place('romans', 8, 2, now - 5_000)], 'romans', now - 5_000)
    const fallback = state([place('genesis', 1, 0, now - 1_000, 'tablet')], 'genesis', now - 1_000)
    const merged = merge(before, fallback)
    expect(merged.lastSettledBookId).toBe('romans')
    expect(positionWriteEntries(before, fallback, merged, {}, now)).toMatchObject([{ book: 'genesis', outcome: 'overrode' }])
  })

  it('never changes the merge: the entries are computed from inputs the merge already used', () => {
    const before = state([place('master', 2, 244, now - 10_000)], 'master', now - 10_000)
    const incoming = state([place('master', 2, 62, now - 1_000)], 'master', now - 1_000)
    const snapshot = JSON.stringify([before, incoming])
    const merged = merge(before, incoming)
    positionWriteEntries(before, incoming, merged, { reason: 'hide' }, now)
    expect(JSON.stringify([before, incoming])).toBe(snapshot)
    expect(merge(before, incoming)).toEqual(merged)
  })
})

describe('position write history storage', () => {
  const entry = (at: number, paragraph = 1, placeAt = at): PositionHistoryEntry => ({
    at, device: 'phone', book: 'master', chapter: 2, paragraph, word: 0, placeAt, rev: placeAt, outcome: 'accepted',
  })

  it('keeps the newest 200 entries', () => {
    let history: PositionHistoryEntry[] = []
    for (let i = 0; i < POSITION_HISTORY_MAX + 25; i++) history = appendPositionHistory(history, [entry(now + i, i)], now + i)
    expect(history).toHaveLength(POSITION_HISTORY_MAX)
    expect(history[0].paragraph).toBe(25)
    expect(history.at(-1)!.paragraph).toBe(POSITION_HISTORY_MAX + 24)
  })

  it('drops entries older than 30 days on each append', () => {
    const old = entry(now - POSITION_HISTORY_MAX_AGE_MS - 1, 1)
    const recent = entry(now - POSITION_HISTORY_MAX_AGE_MS + 1, 2)
    expect(appendPositionHistory([old, recent], [entry(now, 3)], now).map(e => e.paragraph)).toEqual([2, 3])
    expect(readPositionHistory([old, recent], now).map(e => e.paragraph)).toEqual([2])
  })

  it('logs a stale place a tab keeps re-sending once, and tolerates a malformed row', () => {
    const ignored = { ...entry(now, 62, now - 9_000), outcome: 'ignored' as const }
    const once = appendPositionHistory('not a list', [ignored], now)
    expect(appendPositionHistory(once, [{ ...ignored, at: now + 5_000 }], now + 5_000)).toHaveLength(1)
    expect(appendPositionHistory([{ junk: true }, ...once], [], now)).toEqual(once)
  })

  it('accepts only short, plain client labels', () => {
    expect(parsePositionWriteClient({ tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'cloud-merge' }))
      .toEqual({ tab: 'a1b2c3d4.ef01', build: 'mh7x2k', reason: 'cloud-merge' })
    expect(parsePositionWriteClient({ tab: '<script>', build: 'x'.repeat(41), reason: 'Page Turn', extra: 1 })).toEqual({})
    expect(parsePositionWriteClient(null)).toEqual({})
    expect(parsePositionWriteClient(['tab'])).toEqual({})
  })
})
