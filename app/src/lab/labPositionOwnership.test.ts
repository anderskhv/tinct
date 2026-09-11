// @vitest-environment jsdom

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  LAB_POSITION_STORAGE_KEY,
  accountLabPositionRecord,
  adoptLabPositionRecord,
  emptyLabPositionState,
  knowsSettledBook,
  mergeLabPositionStatesByTime,
  parseLabPositionState,
  shouldPreferAccountSettle,
  type LabBookPlace,
  type LabPositionState,
} from './labPosition'
import { clearLabPositionLocal, readLabPositionLocal, writeLabPositionLocal } from './labPositionStore'

const READER = 'user-reader'
const OTHER = 'user-github'

function place(over: Partial<LabBookPlace> & Pick<LabBookPlace, 'bookId' | 'headerBook' | 'chapterNumber' | 'sequentialChapter'>): LabBookPlace {
  return {
    paragraphIndex: 0,
    wordIndex: 0,
    updatedAt: 1_000,
    deviceId: 'device',
    rev: 1,
    ...over,
  }
}

const jeremiah38 = place({ bookId: 'jeremiah', headerBook: 'Jeremiah', chapterNumber: 38, sequentialChapter: 774, paragraphIndex: 6, updatedAt: 500_000, rev: 12 })
const genesis1 = place({ bookId: 'genesis', headerBook: 'Genesis', chapterNumber: 1, sequentialChapter: 1, updatedAt: 900_000 })

function record(over: Partial<LabPositionState>): LabPositionState {
  return { ...emptyLabPositionState('device'), ...over }
}

const accountRow = record({
  books: { jeremiah: jeremiah38 },
  owner: READER,
  lastSettledBookId: 'jeremiah',
  lastSettledAt: 500_000,
  updatedAt: 500_000,
})

describe('adoptLabPositionRecord', () => {
  it('keeps the account its own record', () => {
    const own = record({ owner: READER, books: { jeremiah: jeremiah38 } })
    const result = adoptLabPositionRecord(own, READER)
    expect(result.status).toBe('own')
    expect(result.state).toBe(own)
  })

  it('adopts a signed-out record so a guest keeps their place', () => {
    const guest = record({ books: { genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 })
    const result = adoptLabPositionRecord(guest, READER)
    expect(result.status).toBe('adopted')
    expect(result.state.owner).toBe(READER)
    expect(result.state.books.genesis).toEqual(genesis1)
  })

  it('drops another account record instead of handing it to the signing-in reader', () => {
    const result = adoptLabPositionRecord(accountRow, OTHER)
    expect(result.status).toBe('dropped')
    expect(result.state.books).toEqual({})
    expect(result.state.lastSettledBookId).toBeNull()
    expect(result.state.owner).toBe(OTHER)
  })

  it('leaves the record alone while signed out', () => {
    expect(adoptLabPositionRecord(accountRow, null).status).toBe('own')
  })
})

describe('knowsSettledBook / shouldPreferAccountSettle', () => {
  const guestGenesis = record({ books: { genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 })

  it('a record with no place for the settled book has never seen it', () => {
    expect(knowsSettledBook(guestGenesis, accountRow)).toBe(false)
    expect(knowsSettledBook(accountRow, guestGenesis)).toBe(false)
  })

  it('a record that carries the settled book has', () => {
    const informed = record({ books: { genesis: genesis1, jeremiah: jeremiah38 } })
    expect(knowsSettledBook(informed, accountRow)).toBe(true)
  })

  it('an empty settle is nothing to acknowledge', () => {
    expect(knowsSettledBook(record({}), record({}))).toBe(true)
  })

  it('the account row wins only when the device record was never the account’s and it names a book the row never saw', () => {
    expect(shouldPreferAccountSettle(guestGenesis, accountRow, 'adopted')).toBe(true)
    expect(shouldPreferAccountSettle(guestGenesis, accountRow, 'own')).toBe(false)
    // A device whose record predates the owner tag but shares a history with
    // the row keeps its own, newer resume.
    const shared = record({ books: { jeremiah: place({ ...jeremiah38, updatedAt: 900_000, rev: 20 }) }, lastSettledBookId: 'jeremiah', lastSettledAt: 900_000 })
    expect(shouldPreferAccountSettle(shared, accountRow, 'adopted')).toBe(false)
  })
})

describe('accountLabPositionRecord (what the library reads)', () => {
  it('a signed-out Genesis pin does not become the account resume', () => {
    const guest = record({ books: { genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 })
    const merged = accountLabPositionRecord(guest, accountRow, READER)
    expect(merged.lastSettledBookId).toBe('jeremiah')
    expect(merged.books.genesis).toEqual(genesis1)
    expect(merged.owner).toBe(READER)
  })

  it('another account’s record never appears in this viewer’s library', () => {
    const merged = accountLabPositionRecord(accountRow, record({ owner: OTHER }), OTHER)
    expect(merged.books).toEqual({})
    expect(merged.lastSettledBookId).toBeNull()
  })

  it('the account’s own device record still wins when it is newer', () => {
    const own = record({
      owner: READER,
      books: { jeremiah: place({ ...jeremiah38, paragraphIndex: 20, updatedAt: 900_000, rev: 30 }) },
      lastSettledBookId: 'jeremiah',
      lastSettledAt: 900_000,
    })
    const merged = accountLabPositionRecord(own, accountRow, READER)
    expect(merged.books.jeremiah?.paragraphIndex).toBe(20)
    expect(merged.lastSettledAt).toBe(900_000)
  })

  it('a signed-out viewer reads the device record unchanged', () => {
    const guest = record({ books: { genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 })
    expect(accountLabPositionRecord(guest, null, null)).toBe(guest)
  })
})

describe('settle acknowledgement (the rule the server enforces)', () => {
  const fallback = record({ books: { genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000, updatedAt: 900_000 })

  it('a record that never saw the stored resume may add a pin but not move the resume', () => {
    const merged = mergeLabPositionStatesByTime(accountRow, fallback, { requireSettleAcknowledgement: true })
    expect(merged.lastSettledBookId).toBe('jeremiah')
    expect(merged.lastSettledAt).toBe(500_000)
    expect(merged.books.genesis).toEqual(genesis1)
  })

  it('the same record, once it carries the stored resume, may move it', () => {
    const informed = { ...fallback, books: { ...fallback.books, jeremiah: jeremiah38 } }
    const merged = mergeLabPositionStatesByTime(accountRow, informed, { requireSettleAcknowledgement: true })
    expect(merged.lastSettledBookId).toBe('genesis')
    expect(merged.lastSettledAt).toBe(900_000)
  })

  it('without the guard the fallback wins — the 2026-09-07 regression itself', () => {
    expect(mergeLabPositionStatesByTime(accountRow, fallback).lastSettledBookId).toBe('genesis')
  })

  it('parses an owner off the wire and defaults it to null', () => {
    expect(parseLabPositionState({ owner: READER }).owner).toBe(READER)
    expect(parseLabPositionState({ owner: 42 }).owner).toBeNull()
    expect(parseLabPositionState(null).owner).toBeNull()
  })
})

describe('writeLabPositionLocal', () => {
  beforeEach(() => { clearLabPositionLocal() })
  afterEach(() => { clearLabPositionLocal() })

  it('merge-before-write keeps the newer stored settle for an ordinary note', () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...accountRow, books: { ...accountRow.books, genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 }))
    const stored = writeLabPositionLocal({ ...accountRow, deviceId: 'device' })
    expect(stored.lastSettledBookId).toBe('genesis')
  })

  it('an authoritative write (the resolved account record) replaces it', () => {
    localStorage.setItem(LAB_POSITION_STORAGE_KEY, JSON.stringify({ ...accountRow, books: { ...accountRow.books, genesis: genesis1 }, lastSettledBookId: 'genesis', lastSettledAt: 900_000 }))
    const stored = writeLabPositionLocal({ ...accountRow, deviceId: 'device' }, { authoritative: true })
    expect(stored.lastSettledBookId).toBe('jeremiah')
    expect(readLabPositionLocal('device').lastSettledBookId).toBe('jeremiah')
    // The pin it overruled is still in the record.
    expect(stored.books.genesis).toEqual(genesis1)
  })
})
