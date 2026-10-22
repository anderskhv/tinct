// @vitest-environment jsdom
/**
 * The leaderboard kept on this device (Anders, 22 Oct 2026: "3. yes."): the
 * last board of each tab per signed-in account, shown at once on a cold start
 * and refreshed in place; never another account's; at most 7 days old;
 * size-capped; checked field by field when read; gone on sign-out and account
 * deletion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BOARD_STORE_MAX_AGE_MS,
  BOARD_STORE_MAX_CHARS,
  BOARD_STORE_PREFIX,
  boardMemoryNewPage,
  forgetBoards,
  knownBoard,
  knownBoardAge,
  knownDefaultBoard,
  loadBoard,
  loadDefaultBoard,
  noteOwnSeconds,
  readStoredBoards,
  validStoredBoard,
} from './boardMemory'
import { clearLocalUserData } from '../services/storage'

const ME = '11111111-1111-4111-8111-111111111111'
const OTHER = '22222222-2222-4222-8222-222222222222'

const picture = (initial: string, src: string | null = null) => ({ src, pos: '50% 50%', cover: false, private: src !== null, initial })
const row = (rank: number, name: string, seconds: number, me = false) => ({
  rank, name, seconds, duration: `${Math.floor(seconds / 60)} m`, me,
  picture: picture(name[0], me ? null : `/api/profile/image?user=${OTHER}&slot=picture&v=abcdef12`),
  ...(me ? {} : { handle: name.toLowerCase() }),
})
const board = (tab: 'friends' | 'everyone', entries = [row(1, 'Mette', 7200), row(2, 'You', 60, true)]) => ({
  tab, window: { start: '2026-10-16', end: '2026-10-23' }, refreshedAt: null, total: entries.length, me: null, meShown: true, friends: 1, everyoneOpen: true, entries,
})

let answers: Record<string, unknown>
let calls: string[]
beforeEach(() => {
  localStorage.clear()
  forgetBoards()
  answers = { friends: board('friends'), everyone: board('everyone', [row(1, 'Ida', 9000), row(2, 'Mette', 7200), row(3, 'You', 60, true)]) }
  calls = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const tab = new URL(String(input), 'https://tinct.app').searchParams.get('tab') ?? ''
    calls.push(tab)
    const answer = answers[tab === 'default' ? 'friends' : tab]
    return answer ? Response.json(answer) : Response.json({ error: 'Not found' }, { status: 404 })
  }))
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

const stored = (userId = ME) => localStorage.getItem(BOARD_STORE_PREFIX + userId)

describe('the board on this device', () => {
  it('a cold start shows the last boards at once (the You card\'s rank reads the same one), then they refresh in place', async () => {
    await loadDefaultBoard('t', ME)
    await loadBoard('t', ME, 'everyone')
    expect(JSON.parse(stored()!)).toMatchObject({ v: 1, userId: ME })
    boardMemoryNewPage()
    // A new page: nothing asked yet, both tabs known at once from the device.
    expect(knownDefaultBoard(ME)?.entries.map(entry => entry.name)).toEqual(['Mette', 'You'])
    expect(knownBoard(ME, 'everyone')?.entries.map(entry => entry.name)).toEqual(['Ida', 'Mette', 'You'])
    expect(calls).toEqual(['default', 'everyone'])
    // Shown, but never counted as fresh: the Leaderboard asks again even seconds after another page stored it.
    expect(knownBoardAge(ME, 'friends')).toBe(Infinity)
    answers.friends = board('friends', [row(1, 'You', 9600, true), row(2, 'Mette', 7200)])
    await loadDefaultBoard('t', ME)
    expect(knownBoard(ME, 'friends')?.entries[0].me).toBe(true)
    // The refresh replaced the stored copy; the other tab's copy stayed.
    boardMemoryNewPage()
    expect(knownBoard(ME, 'friends')?.entries[0].me).toBe(true)
    expect(knownBoard(ME, 'everyone')?.entries).toHaveLength(3)
  })

  it('never shows one account\'s board to another account on the same device', async () => {
    await loadDefaultBoard('t', ME)
    boardMemoryNewPage()
    expect(knownDefaultBoard(OTHER)).toBeNull()
    expect(knownBoard(OTHER, 'friends')).toBeNull()
    expect(knownBoard(null, 'friends')).toBeNull()
    // A copy moved under another account's key is refused: the user id inside must match.
    localStorage.setItem(BOARD_STORE_PREFIX + OTHER, stored()!)
    boardMemoryNewPage()
    expect(knownBoard(OTHER, 'friends')).toBeNull()
    expect(stored(OTHER)).toBeNull()
    // And the account that stored it still gets its own.
    expect(knownBoard(ME, 'friends')?.entries).toHaveLength(2)
  })

  it('a tab older than 7 days is not shown and the copy is dropped', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-14T12:00:00Z'))
    await loadDefaultBoard('t', ME)
    vi.setSystemTime(new Date(Date.parse('2026-10-14T12:00:00Z') + BOARD_STORE_MAX_AGE_MS - 60_000))
    boardMemoryNewPage()
    expect(knownBoard(ME, 'friends')).not.toBeNull()
    vi.setSystemTime(new Date(Date.parse('2026-10-14T12:00:00Z') + BOARD_STORE_MAX_AGE_MS + 60_000))
    boardMemoryNewPage()
    expect(knownBoard(ME, 'friends')).toBeNull()
    expect(stored()).toBeNull()
  })

  it('checks the shape when read: anything not as the Worker sends it is refused', () => {
    const good = board('friends')
    expect(validStoredBoard(good, 'friends')).toEqual(good)
    expect(validStoredBoard(good, 'everyone')).toBeNull()
    const bad: unknown[] = [
      null, 'board', { ...good, entries: 'rows' }, { ...good, total: -1 }, { ...good, window: null },
      { ...good, entries: [{ ...good.entries[0], seconds: '7200' }] },
      { ...good, entries: [{ ...good.entries[0], picture: { ...good.entries[0].picture, src: 'https://elsewhere.example/p.jpg' } }] },
      { ...good, entries: [{ ...good.entries[0], picture: { ...good.entries[0].picture, src: '//elsewhere.example/p.jpg' } }] },
      { ...good, entries: [{ ...good.entries[0], picture: { ...good.entries[0].picture, src: '/a.jpg"); background: url("/b' } }] },
      { ...good, entries: [{ ...good.entries[0], picture: { ...good.entries[0].picture, pos: 'url(x)' } }] },
      { ...good, entries: [{ ...good.entries[0], handle: '../x' }] },
      { ...good, me: { ...good.entries[0], me: false } },
      { ...good, entries: Array.from({ length: 61 }, (_, i) => row(i + 1, `R${i}`, 60)) },
    ]
    for (const item of bad) expect(validStoredBoard(item, 'friends')).toBeNull()
    // A stored copy with one bad row is not shown at all, and is dropped.
    localStorage.setItem(BOARD_STORE_PREFIX + ME, JSON.stringify({ v: 1, userId: ME, tabs: { friends: { at: Date.now(), board: bad[6] } } }))
    expect(readStoredBoards(ME)).toEqual({})
    expect(stored()).toBeNull()
    localStorage.setItem(BOARD_STORE_PREFIX + ME, '{not json')
    expect(readStoredBoards(ME)).toEqual({})
    expect(stored()).toBeNull()
  })

  it('caps its size: a copy over the cap is neither written nor read', async () => {
    const long = (i: number) => ({ ...row(i + 1, `${'N'.repeat(190)}${i}`, 60), duration: 'x'.repeat(40) })
    answers.friends = board('friends', Array.from({ length: 50 }, (_, i) => long(i)))
    answers.everyone = board('everyone', Array.from({ length: 50 }, (_, i) => long(i)))
    await loadDefaultBoard('t', ME)
    expect(stored()!.length).toBeLessThanOrEqual(BOARD_STORE_MAX_CHARS)
    await loadBoard('t', ME, 'everyone')
    // Both tabs together are over the cap: nothing is kept on the device (the page still has them).
    expect(stored()).toBeNull()
    expect(knownBoard(ME, 'everyone')?.entries).toHaveLength(50)
    localStorage.setItem(BOARD_STORE_PREFIX + ME, JSON.stringify({ v: 1, userId: ME, tabs: {}, pad: 'x'.repeat(BOARD_STORE_MAX_CHARS) }))
    expect(readStoredBoards(ME)).toEqual({})
  })

  it('an Everyone board that closed is dropped from the device too', async () => {
    await loadBoard('t', ME, 'everyone')
    expect(JSON.parse(stored()!).tabs.everyone).toBeTruthy()
    answers.everyone = null
    await loadBoard('t', ME, 'everyone')
    boardMemoryNewPage()
    expect(knownBoard(ME, 'everyone')).toBeNull()
  })

  it('the viewer\'s own seconds after a flush are kept with the copy', async () => {
    const askedAt = Date.now()
    await loadDefaultBoard('t', ME)
    noteOwnSeconds(ME, 9600, askedAt + 1, 'You')
    boardMemoryNewPage()
    expect(knownBoard(ME, 'friends')?.entries[0]).toMatchObject({ me: true, seconds: 9600, rank: 1 })
  })

  it('sign-out and account deletion remove it (forgetBoards, and clearLocalUserData\'s tinct: sweep)', async () => {
    await loadDefaultBoard('t', ME)
    localStorage.setItem(BOARD_STORE_PREFIX + OTHER, 'x')
    forgetBoards()
    expect(stored()).toBeNull()
    expect(stored(OTHER)).toBeNull()
    expect(knownBoard(ME, 'friends')).toBeNull()
    await loadDefaultBoard('t', ME)
    expect(stored()).not.toBeNull()
    clearLocalUserData()
    expect(stored()).toBeNull()
  })

  it('storage that throws: the boards stay in memory, nothing breaks', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError') })
    const got = await loadDefaultBoard('t', ME)
    expect(got?.entries).toHaveLength(2)
    expect(knownBoard(ME, 'friends')?.entries).toHaveLength(2)
    spy.mockRestore()
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError') })
    boardMemoryNewPage()
    expect(knownBoard(ME, 'friends')).toBeNull()
    read.mockRestore()
  })
})
